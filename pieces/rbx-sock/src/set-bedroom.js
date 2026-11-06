// rbx-thursday bedroom (hero + Pip share it): the approved look-test room + Pip's bed, desk, shelf, blankets, eye light.
'use strict';
SETS.bedroom = async function () {
  const W = 1080, H = 1920;
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const V = KIT.V, shadow = KIT.shadow, texPair = KIT.texPair, noiseOver = KIT.noiseOver, star = KIT.star;
  const boards = [];
  // ---------------- textures ----------------
  const wallpaper = texPair(512, (g, hg, S) => {
    const gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#13277a'); gr.addColorStop(1, '#0f2068'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
    noiseOver(g, S, S, 5, 0.18, 16, 4);
    const r = rng(9);
    const pts = [[0.12, 0.15, 30], [0.62, 0.2, 22], [0.38, 0.55, 34], [0.85, 0.62, 26], [0.15, 0.8, 20], [0.6, 0.88, 16], [0.9, 0.05, 14]];
    pts.forEach(([u, v, s]) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
      const x = u * S + ox, y = v * S + oy; g.fillStyle = '#e3b84a'; star(g, x, y, s); g.fill(); g.fillStyle = 'rgba(255,240,170,0.5)'; star(g, x - 2, y - 3, s * 0.45); g.fill();
      hg.fillStyle = '#c8c8c8'; star(hg, x, y, s); hg.fill(); } });
    for (let i = 0; i < 70; i++) { const x = r() * S, y = r() * S, s = 1.5 + r() * 2.5; g.fillStyle = 'rgba(240,210,120,0.85)'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
    // paper fibre in height
    const n = tnoise(4, 128), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) { im.data[i * 4] = im.data[i * 4] * 0.85 + n((i % S) / S, Math.floor(i / S) / S) * 38; } hg.putImageData(im, 0, 0);
  });
  function woodPlanks(S, seed, o = {}) {
    return texPair(S, (g, hg) => {
      const r = rng(seed), rows = o.rows || 5, rh = S / rows, grain = fbm(seed + 3, 4, 4), streak = tnoise(seed + 5, 64);
      const tones = o.tones || ['#9a5a2c', '#8a4c22', '#a8652f', '#7e4420', '#93552a'];
      const im = g.createImageData(S, S), d = im.data;
      const seams = []; for (let k = 0; k < rows; k++) { const off = r() * S; seams.push([off % S, (off + S * (0.45 + r() * 0.2)) % S]); }
      const baseC = []; for (let k = 0; k < rows; k++) { const c = new THREE.Color(tones[k % tones.length]); baseC.push([c.r * 255, c.g * 255, c.b * 255, 0.85 + r() * 0.3]); }
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const k = Math.floor(y / rh), [R, G, B, f] = baseC[k], u = x / S, v = y / S;
        const gl = Math.sin((v * rows * 9 + grain(u * 0.25, v) * 7) * Math.PI) * 0.5 + 0.5;
        const kk = f * (0.82 + 0.16 * gl + 0.12 * (streak(u * 0.2, v * 3) - 0.5));
        const i = (y * S + x) * 4; d[i] = R * kk; d[i + 1] = G * kk; d[i + 2] = B * kk; d[i + 3] = 255;
      }
      g.putImageData(im, 0, 0);
      const hm = hg.getImageData(0, 0, S, S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, gl = grain((x / S) * 0.25, y / S); hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 140 + gl * 40; }
      hg.putImageData(hm, 0, 0);
      for (let k = 0; k <= rows; k++) { const y = k * rh; g.fillStyle = 'rgba(25,10,4,0.85)'; g.fillRect(0, y - 1.5, S, 3); hg.fillStyle = '#000'; hg.fillRect(0, y - 2, S, 4); }
      seams.forEach(([a, b], k) => [a, b].forEach((x) => { g.fillStyle = 'rgba(25,10,4,0.8)'; g.fillRect(x - 1.5, k * rh, 3, rh); hg.fillStyle = '#000'; hg.fillRect(x - 2, k * rh, 4, rh); }));
      if (o.knots) for (let i = 0; i < o.knots; i++) { const x = r() * S, y = r() * S; g.fillStyle = 'rgba(50,22,8,0.55)'; g.beginPath(); g.ellipse(x, y, 9, 4, 0, 0, 7); g.fill(); }
    });
  }
  const floorT = woodPlanks(1024, 31, { rows: 6, knots: 30 });
  const plankT = woodPlanks(512, 41, { rows: 1, tones: ['#6b3a20'], knots: 4 });
  const darkWoodT = woodPlanks(512, 51, { rows: 4, tones: ['#5a2f17', '#4f2813', '#633519', '#56301a'] });
  const bedWoodT = woodPlanks(512, 61, { rows: 3, tones: ['#b0642a', '#a65c26', '#b86c2e'] });
  const rugT = texPair(1024, (g, hg, S, Hh) => {
    g.fillStyle = '#9b2320'; g.fillRect(0, 0, S, Hh);
    const band = (x0, y0, x1, y1, c) => { g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
    band(0, 0, S, Hh, '#1d2f6b'); band(40, 40, S - 40, Hh - 40, '#e3b33c'); band(64, 64, S - 64, Hh - 64, '#9b2320');
    // jagged inner border
    g.fillStyle = '#1d2f6b'; for (let x = 64; x < S - 64; x += 32) { g.beginPath(); g.moveTo(x, 64); g.lineTo(x + 16, 92); g.lineTo(x + 32, 64); g.fill(); g.beginPath(); g.moveTo(x, Hh - 64); g.lineTo(x + 16, Hh - 92); g.lineTo(x + 32, Hh - 64); g.fill(); }
    const diamond = (cx, cy, rx, ry, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath(); g.fill(); };
    [S * 0.27, S * 0.5, S * 0.73].forEach((cx, i) => { diamond(cx, Hh / 2, 120, 200, '#e3b33c'); diamond(cx, Hh / 2, 92, 160, i === 1 ? '#1d2f6b' : '#f1e6c8'); diamond(cx, Hh / 2, 50, 90, '#9b2320'); diamond(cx, Hh / 2, 20, 36, '#e3b33c'); });
    for (let x = 140; x < S - 140; x += 60) { diamond(x, 140, 14, 22, '#f1e6c8'); diamond(x, Hh - 140, 14, 22, '#f1e6c8'); }
    noiseOver(g, S, Hh, 77, 0.2, 16, 3);
    const n = tnoise(8, 300), hm = hg.getImageData(0, 0, S, Hh); for (let y = 0; y < Hh; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4; hm.data[i] = 90 + n(x / S, y / Hh) * 120; } hg.putImageData(hm, 0, 0);
  }, { h: 720 });
  const quiltT = texPair(512, (g, hg, S) => {
    g.fillStyle = '#3c6b2c'; g.fillRect(0, 0, S, S);
    const n = 4, c = S / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const cx = (i + 0.5) * c, cy = (j + 0.5) * c; g.fillStyle = (i + j) % 2 ? '#c46a24' : '#2e5622';
      g.beginPath(); g.moveTo(cx, cy - c * 0.42); g.lineTo(cx + c * 0.42, cy); g.lineTo(cx, cy + c * 0.42); g.lineTo(cx - c * 0.42, cy); g.closePath(); g.fill();
      g.fillStyle = '#e1b85a'; g.beginPath(); g.arc(cx, cy, c * 0.07, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(20,30,10,0.6)'; g.lineWidth = 3; g.setLineDash([8, 6]);
    for (let k = -n; k <= 2 * n; k++) { g.beginPath(); g.moveTo(k * c, 0); g.lineTo(k * c + S, S); g.stroke(); g.beginPath(); g.moveTo(k * c, S); g.lineTo(k * c + S, 0); g.stroke(); }
    g.setLineDash([]); noiseOver(g, S, S, 12, 0.25, 32, 3);
    hg.strokeStyle = '#000'; hg.lineWidth = 6; for (let k = -n; k <= 2 * n; k++) { hg.beginPath(); hg.moveTo(k * c, 0); hg.lineTo(k * c + S, S); hg.stroke(); hg.beginPath(); hg.moveTo(k * c, S); hg.lineTo(k * c + S, 0); hg.stroke(); }
  });
  const trimT = texPair(256, (g) => { g.fillStyle = '#d9d4c6'; g.fillRect(0, 0, 256, 256); noiseOver(g, 256, 256, 3, 0.2, 8, 4); });
  const nightSky = (() => {   // seen through the boards: bright cold blue + stars
    const c = cnv(512, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#5f86ff'); gr.addColorStop(1, '#a9c2ff'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    const r = rng(3); for (let i = 0; i < 120; i++) { g.fillStyle = '#ffffff'; g.fillRect(r() * 512, r() * 512, 2, 2); }
    return tex(c);
  })();

  const M = {
    wall: pbr(wallpaper.c, wallpaper.h, { rough: 0.9, bump: 2, repeat: [1 / 2.3, 1 / 2.3] }),
    floor: pbr(floorT.c, floorT.h, { rough: 0.48, bump: 4, repeat: [1 / 8, 1 / 8] }),
    plank: pbr(plankT.c, plankT.h, { rough: 0.8, bump: 4 }),
    dark: pbr(darkWoodT.c, darkWoodT.h, { rough: 0.6, bump: 3 }),
    bed: pbr(bedWoodT.c, bedWoodT.h, { rough: 0.5, bump: 3 }),
    rug: pbr(rugT.c, rugT.h, { rough: 1, bump: 1.2, nscale: 0.5 }),
    quilt: pbr(quiltT.c, quiltT.h, { rough: 0.95, bump: 3 }),
    trim: pbr(trimT.c, null, { rough: 0.7 }),
    ceil: new THREE.MeshStandardMaterial({ color: '#1b2350', roughness: 1 }),
    pillow: new THREE.MeshStandardMaterial({ color: '#e9e2d2', roughness: 0.95 }),
    nail: new THREE.MeshStandardMaterial({ color: '#3a3a40', roughness: 0.4, metalness: 0.8 }),
  };
  // world-unit UVs for boxes: rescale each face's UVs to the box size so repeat = 1/tile works
  function uvBox(geo, w, h, d) {
    const uv = geo.attributes.uv, groups = geo.groups, sizes = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    groups.forEach((gr, gi) => { const seen = new Set(); for (let i = gr.start; i < gr.start + gr.count; i++) seen.add(geo.index.getX(i)); seen.forEach((vi) => uv.setXY(vi, uv.getX(vi) * sizes[gi][0], uv.getY(vi) * sizes[gi][1])); });
    uv.needsUpdate = true; return geo;
  }
  const box = (w, h, d, mat, x, y, z, worldUV = false) => { const geo = new THREE.BoxGeometry(w, h, d); if (worldUV) uvBox(geo, w, h, d); const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };
  const rb = (w, h, d, r, mat, x, y, z) => { const m = new THREE.Mesh(RBX.rbox(w, h, d, r, 10), mat); m.position.set(x, y, z); return m; };
  const wm = (m, rep) => { const k = m.clone(); ['map', 'normalMap'].forEach((p) => { if (k[p]) { k[p] = k[p].clone(); k[p].wrapS = k[p].wrapT = THREE.RepeatWrapping; k[p].repeat.set(rep[0], rep[1]); k[p].needsUpdate = true; } }); return k; };

  // ---------------- bedroom ----------------
  const room = new THREE.Scene(); room.background = new THREE.Color('#02030a');
  const RX = 8, RZ = 9, RH = 12, WT = 0.6, EXT = 10;
  const WIN = { x0: 0.0, x1: 5.4, y0: 3.0, y1: 8.4 };
  (function buildRoom() {
    // back wall with window hole (extruded, world UVs)
    const sh = new THREE.Shape(); sh.moveTo(-RX, 0); sh.lineTo(RX, 0); sh.lineTo(RX, RH); sh.lineTo(-RX, RH); sh.closePath();
    const hole = new THREE.Path(); hole.moveTo(WIN.x0, WIN.y0); hole.lineTo(WIN.x0, WIN.y1); hole.lineTo(WIN.x1, WIN.y1); hole.lineTo(WIN.x1, WIN.y0); hole.closePath(); sh.holes.push(hole);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }), M.wall); back.position.z = -RZ - WT; room.add(back);
    const side = (x, ry) => { const g = new THREE.PlaneGeometry(2 * RZ + EXT, RH); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (2 * RZ + EXT), uv.getY(i) * RH); const m = new THREE.Mesh(g, M.wall); m.position.set(x, RH / 2, EXT / 2); m.rotation.y = ry; return m; };
    room.add(side(-RX, Math.PI / 2), side(RX, -Math.PI / 2));
    const fl = new THREE.PlaneGeometry(2 * RX, 2 * RZ + EXT); { const uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2 * RX, uv.getY(i) * (2 * RZ + EXT)); }
    const floor = new THREE.Mesh(fl, M.floor); floor.rotation.x = -Math.PI / 2; floor.position.z = EXT / 2; room.add(floor);
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(2 * RX + 2, 0.5, 2 * RZ + 2 + EXT), M.ceil); ceil.position.set(0, RH + 0.25, EXT / 2); room.add(ceil);
    // thick outer shells so the moon only comes in through the window
    room.add(box(0.5, RH, 2 * RZ + 2 + EXT, M.ceil, -RX - 0.25, RH / 2, EXT / 2), box(0.5, RH, 2 * RZ + 2 + EXT, M.ceil, RX + 0.25, RH / 2, EXT / 2));
    // ceiling joists
    for (let k = 0; k < 7; k++) room.add(box(2 * RX, 0.5, 0.45, M.dark, 0, RH - 0.25, -RZ + 1.5 + k * 3.2));
    // baseboards + crown
    const bb = (w, x, z, ry) => { const m = box(w, 0.55, 0.12, M.dark, x, 0.275, z); m.rotation.y = ry; room.add(m); const c = box(w, 0.35, 0.18, M.dark, x, RH - 0.175, z); c.rotation.y = ry; room.add(c); };
    bb(2 * RX, 0, -RZ + 0.06, 0); bb(2 * RZ + EXT, -RX + 0.06, EXT / 2, Math.PI / 2); bb(2 * RZ + EXT, RX - 0.06, EXT / 2, Math.PI / 2);
    // window trim + sill
    const T = 0.28, zf = -RZ + 0.08;
    room.add(box(WIN.x1 - WIN.x0 + 2 * T, T, 0.16, M.trim, (WIN.x0 + WIN.x1) / 2, WIN.y1 + T / 2, zf));
    room.add(box(T, WIN.y1 - WIN.y0, 0.16, M.trim, WIN.x0 - T / 2, (WIN.y0 + WIN.y1) / 2, zf));
    room.add(box(T, WIN.y1 - WIN.y0, 0.16, M.trim, WIN.x1 + T / 2, (WIN.y0 + WIN.y1) / 2, zf));
    room.add(box(WIN.x1 - WIN.x0 + 2 * T + 0.3, 0.18, 0.55, M.trim, (WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.09, -RZ + 0.2));
    // the boards: 10 planks, slightly crooked, uneven gaps
    const r = rng(17), n = 8, span = WIN.y1 - WIN.y0, gaps = []; let y = WIN.y0 + 0.05;
    const ph = (span - 0.1) / n - 0.25;
    room.userData.gaps = [];
    for (let i = 0; i < n; i++) {
      const h = ph + (r() - 0.5) * 0.08, cx = (WIN.x0 + WIN.x1) / 2 + (r() - 0.5) * 0.25, L = WIN.x1 - WIN.x0 + 0.9 + r() * 0.3;
      const p = box(L, h, 0.12, wm(M.plank, [L / 4, 1]), cx, y + h / 2, -RZ + 0.24); p.rotation.z = (r() - 0.5) * 0.024; p.rotation.y = (r() - 0.5) * 0.02; room.add(p); boards.push(p);
      [-1, 1].forEach((s) => { const nl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), M.nail); nl.rotation.x = Math.PI / 2; nl.position.set(cx + s * (L / 2 - 0.25), y + h / 2 + (r() - 0.5) * 0.08, -RZ + 0.35); room.add(nl); });
      const gap = 0.2 + r() * 0.1; if (i < n - 1) room.userData.gaps.push([y + h + gap / 2, gap]); y += h + gap;
    }
    // sky behind the boards
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshBasicMaterial({ map: nightSky })); sky.material.color.setScalar(0.95); sky.position.set(2.6, 6, -RZ - 3); room.add(sky); room.userData.sky = sky;
    // bed (head at the back wall, against the left wall)
    const bed = new THREE.Group(); room.add(bed);
    const bx0 = -RX, bw = 5.2, bl = 8.5, bcx = bx0 + bw / 2 + 0.05, bcz = -RZ + bl / 2 + 0.2;
    bed.add(rb(bw, 0.9, bl, 0.08, M.bed, bcx, 1.2, bcz));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => bed.add(rb(0.5, 1.2, 0.5, 0.05, M.bed, bcx + sx * (bw / 2 - 0.25), 0.6, bcz + sz * (bl / 2 - 0.25))));
    bed.add(rb(bw + 0.3, 4.6, 0.45, 0.1, M.bed, bcx, 2.3, -RZ + 0.25));
    bed.add(rb(bw + 0.3, 2.0, 0.45, 0.1, M.bed, bcx, 1.0, bcz + bl / 2 + 0.1));
    [-1, 1].forEach((s) => { const k = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), M.bed); k.position.set(bcx + s * (bw / 2 + 0.05), 4.75, -RZ + 0.25); bed.add(k); });
    bed.add(rb(bw - 0.2, 0.8, bl - 0.5, 0.25, M.pillow, bcx, 2.0, bcz));
    bed.add(rb(bw + 0.1, 0.5, bl - 2.4, 0.22, wm(M.quilt, [1 / 2.6, 1 / 2.6]), bcx, 2.45, bcz + 1.0));
    bed.add(rb(bw + 0.25, 1.4, 0.4, 0.18, wm(M.quilt, [1 / 2.6, 1 / 2.6]), bcx, 1.9, bcz + bl / 2 - 0.35));
    bed.add(rb(3.0, 0.7, 1.4, 0.3, M.pillow, bcx, 2.7, -RZ + 1.4));
    // nightstand + lamp
    const ns = new THREE.Group(); ns.position.set(-1.6, 0, -RZ + 1.0); room.add(ns);
    ns.add(rb(2.0, 2.4, 1.6, 0.08, M.dark, 0, 1.2, 0));
    ns.add(box(1.7, 0.04, 0.02, new THREE.MeshStandardMaterial({ color: '#1c0d05' }), 0, 1.6, 0.81));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshStandardMaterial({ color: '#c9a35a', metalness: 0.9, roughness: 0.3 })); knob.position.set(0, 1.95, 0.82); ns.add(knob);
    const ceramic = new THREE.MeshPhysicalMaterial({ color: '#d8cdb5', roughness: 0.25, clearcoat: 0.6 });
    const lb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16), ceramic); lb.scale.y = 1.2; lb.position.set(0, 2.85, 0); ns.add(lb);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), M.nail); stem.position.set(0, 3.6, 0); ns.add(stem);
    const shadeM = new THREE.MeshStandardMaterial({ color: '#d86a1c', roughness: 0.9, side: THREE.DoubleSide, emissive: new THREE.Color('#ff7a1a'), emissiveIntensity: 1.6 });
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.95, 1.05, 32, 1, true), shadeM); shade.position.set(0, 4.05, 0); shade.userData.noShadow = true; ns.add(shade);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(8, 5.5, 2.5) })); bulb.position.set(0, 3.8, 0); ns.add(bulb);
    const lamp = new THREE.PointLight('#ffae55', 90, 0, 2); lamp.position.set(0, 3.85, 0); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); lamp.shadow.bias = -0.002; lamp.shadow.radius = 4; ns.add(lamp);
    // rug
    const rug = new THREE.Mesh(RBX.rbox(8, 0.06, 5.6, 0.03), M.rug); rug.position.set(0.4, 0.03, -1.6); room.add(rug);
    // door on the right wall with scratches
    const door = new THREE.Group(); door.position.set(RX - 0.05, 0, 2.5); door.rotation.y = -Math.PI / 2; room.add(door);
    const dT = texPair(256, (g) => { g.drawImage(darkWoodT.c, 0, 0, 256, 256); g.strokeStyle = 'rgba(40,18,6,0.8)'; g.lineWidth = 4; g.strokeRect(30, 26, 196, 80); g.strokeRect(30, 140, 196, 96);
      g.strokeStyle = 'rgba(235,225,205,0.9)'; g.lineWidth = 3; [0, 1, 2, 3].forEach((i) => { g.beginPath(); g.moveTo(120 + i * 14, 150); g.lineTo(112 + i * 16, 222); g.stroke(); }); }, { h: 512 });
    door.add(box(3.2, 7.2, 0.25, pbr(dT.c, null, { rough: 0.6 }), 0, 3.6, 0.1));
    door.add(box(3.7, 0.3, 0.3, M.trim, 0, 7.35, 0.12), box(0.25, 7.3, 0.3, M.trim, -1.72, 3.65, 0.12), box(0.25, 7.3, 0.3, M.trim, 1.72, 3.65, 0.12));
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), knob.material); handle.position.set(1.1, 3.4, 0.35); door.add(handle);
    // toy shelf + blocks on the floor for clutter
    const shelf = rb(3.2, 0.2, 0.9, 0.04, M.dark, RX - 0.5, 6.2, -2.5); shelf.rotation.y = Math.PI / 2; room.add(shelf);
    const toyC = ['#d23a2a', '#2f6fd1', '#e8b830', '#3c9a4a'];
    for (let i = 0; i < 4; i++) room.add(rb(0.6, 0.6, 0.6, 0.06, new THREE.MeshStandardMaterial({ color: toyC[i], roughness: 0.5 }), RX - 0.5, 6.6, -3.6 + i * 0.75));
    [[3.8, 4.5, 0.3], [4.4, 4.2, 1.1], [4.0, 3.6, 0.6]].forEach(([x, z, ry], i) => { const b = rb(0.7, 0.7, 0.7, 0.07, new THREE.MeshStandardMaterial({ color: toyC[i], roughness: 0.5 }), x, 0.35, z); b.rotation.y = ry; room.add(b); });
    // a picture frame on the left wall
    const pic = texPair(256, (g) => { g.fillStyle = '#e9dcbc'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#3d7a3a'; g.fillRect(0, 170, 256, 86); g.fillStyle = '#e8a33a'; g.beginPath(); g.arc(180, 80, 34, 0, 7); g.fill(); g.fillStyle = '#c25a2a'; g.fillRect(50, 110, 70, 60); g.fillStyle = '#7a2a1a'; g.beginPath(); g.moveTo(40, 112); g.lineTo(85, 70); g.lineTo(130, 112); g.fill(); });
    const pf = box(0.12, 2.4, 2.0, [M.dark, M.dark, M.dark, M.dark, M.dark, M.dark], -RX + 0.08, 7.0, 7.0); room.add(pf);
    const pp = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshStandardMaterial({ map: tex(pic.c), roughness: 0.4 })); pp.rotation.y = Math.PI / 2; pp.position.set(-RX + 0.15, 7.0, 7.0); room.add(pp);
  })();
  shadow(room);
  room.traverse((m) => { if (m.userData.noShadow) m.castShadow = false; });
  room.traverse((m) => { if (m.isMesh && m.material && m.material.isMeshBasicMaterial) { m.castShadow = false; m.receiveShadow = false; } });
  // lights
  room.add(new THREE.HemisphereLight('#3a52c0', '#2a1a20', 2.4));
  const key = new THREE.SpotLight('#ffc890', 160, 0, 0.6, 0.8, 2); key.position.set(-5, 9, 9); key.target.position.set(0.5, 3.5, 0.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; room.add(key, key.target);
  const moonDir = V(-0.2, -0.42, 1).normalize();   // travel direction of the moonlight
  const moon = new THREE.DirectionalLight('#9ab4ff', 16); moon.position.copy(V(2.6, 4, -2).addScaledVector(moonDir, -26)); moon.target.position.set(2.6, 4, -2);
  moon.castShadow = !window.NOMS; moon.shadow.mapSize.set(4096, 4096); Object.assign(moon.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 1, far: 60 }); moon.shadow.bias = -0.0002; moon.shadow.normalBias = 0.01; moon.shadow.radius = 1;
  room.add(moon, moon.target);
  const fill = new THREE.PointLight('#5068c8', 10, 0, 2); fill.position.set(3, 7, 6); room.add(fill);
  // beams through the gaps + one broad haze beam
  const bmat = RBX.beamMat('#8fb0ff', window.BEAMK || 0.11), hmat = RBX.beamMat('#7d9cff', 0.006);
  room.userData.gaps.forEach(([y, gap]) => { const L = (y + 0.5) / -moonDir.y; room.add(RBX.beam(V((WIN.x0 + WIN.x1) / 2, y, -RZ + 0.2), moonDir, WIN.x1 - WIN.x0 - 0.1, gap * 1.8, L * 1.05, bmat)); });
  const haze = RBX.beam(V((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -RZ + 0.2), moonDir, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 11, hmat); room.add(haze);
  // dust in the beams
  (function dust() {
    const r = rng(5), N = 260, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const t = r() * 9, p = V(WIN.x0 + r() * (WIN.x1 - WIN.x0), WIN.y0 + r() * (WIN.y1 - WIN.y0), -RZ + 0.3).addScaledVector(moonDir, t); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const m = new THREE.PointsMaterial({ size: 0.025, map: tex(c), color: new THREE.Color(1.6, 1.9, 3.0), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.45 });
    room.add(new THREE.Points(g, m));
  })();

  // ---------------- additions for the piece ----------------
  // Pip's small bed along the right wall under the window's right edge
  const pipBed = new THREE.Group(); room.add(pipBed);
  const pipQuiltT = texPair(256, (g, hg, S) => { g.fillStyle = '#e88aa8'; g.fillRect(0, 0, S, S); g.fillStyle = '#f6d36a';
    for (let y = 16; y < S; y += 48) for (let x = (y / 48) % 2 ? 40 : 16; x < S; x += 48) { star(g, x, y, 12); g.fill(); }
    noiseOver(g, S, S, 14, 0.2, 16, 3); });
  const pqx = 6.2, pqz = -6.2;
  pipBed.add(KIT.rb(3.0, 0.7, 4.8, 0.08, M.bed, pqx, 0.95, pqz));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => pipBed.add(KIT.rb(0.4, 0.9, 0.4, 0.05, M.bed, pqx + sx * 1.3, 0.45, pqz + sz * 2.2)));
  pipBed.add(KIT.rb(2.8, 0.6, 4.4, 0.22, M.pillow, pqx, 1.55, pqz));
  pipBed.add(KIT.rb(3.1, 0.4, 3.2, 0.18, pbr(pipQuiltT.c, null, { rough: 0.95 }), pqx, 1.9, pqz + 0.7));
  pipBed.add(KIT.rb(2.0, 0.5, 1.0, 0.22, M.pillow, pqx, 2.05, pqz - 1.6));
  pipBed.add(KIT.rb(3.2, 2.6, 0.3, 0.08, M.bed, pqx, 1.3, pqz + 2.55));
  // crayon drawing "PIP 4" on the right wall above her bed
  const pipDraw = KIT.textTex(512, 640, (g, w, h) => { g.fillStyle = '#fbf6e8'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.strokeStyle = '#e0457a'; g.lineWidth = 14; g.font = 'bold 150px "Comic Sans MS", "Chalkboard SE", sans-serif'; g.fillStyle = '#e0457a'; g.fillText('PIP', 90, 190);
    g.fillStyle = '#2f6fd1'; g.font = 'bold 240px "Comic Sans MS", "Chalkboard SE", sans-serif'; g.fillText('4', 330, 470);
    g.strokeStyle = '#f2b51c'; g.lineWidth = 10; g.beginPath(); g.arc(150, 400, 70, 0, 7); g.stroke(); for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.beginPath(); g.moveTo(150 + Math.cos(a) * 85, 400 + Math.sin(a) * 85); g.lineTo(150 + Math.cos(a) * 120, 400 + Math.sin(a) * 120); g.stroke(); }
    g.strokeStyle = '#3c9a4a'; g.lineWidth = 12; g.beginPath(); g.moveTo(20, 600); g.quadraticCurveTo(250, 560, 500, 610); g.stroke(); });
  const pd = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), new THREE.MeshStandardMaterial({ map: pipDraw, roughness: 0.9 })); pd.rotation.y = -Math.PI / 2; pd.position.set(RX - 0.06, 6.0, -5.6); room.add(pd);
  // hero's desk + chair at the left wall, forward of the bed
  const desk = new THREE.Group(); desk.position.set(-6.2, 0, 3.4); room.add(desk);
  desk.add(KIT.rb(3.4, 0.25, 2.2, 0.05, M.bed, 0, 3.3, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => desk.add(KIT.box(0.2, 3.2, 0.2, M.dark, sx * 1.5, 1.6, sz * 0.9)));
  desk.add(KIT.rb(1.4, 2.4, 2.0, 0.05, M.dark, 0.9, 1.6, 0));
  const chair = new THREE.Group(); chair.position.set(2.0, 0, 0); desk.add(chair);
  chair.add(KIT.rb(1.6, 0.2, 1.6, 0.05, M.bed, 0, 2.0, 0), KIT.rb(0.2, 2.2, 1.6, 0.05, M.bed, 0.8, 3.1, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => chair.add(KIT.box(0.15, 2.0, 0.15, M.dark, sx * 0.65, 1.0, sz * 0.65)));
  // shelf on the left wall above the desk (trophies are placed by the shots)
  room.add(KIT.rb(0.9, 0.18, 3.4, 0.04, M.dark, -RX + 0.45, 6.4, 3.4));
  // blankets over the window (toggle)
  const blankets = new THREE.Group(); blankets.visible = false; room.add(blankets);
  ['#3c6b2c', '#9b2320', '#e3b33c', '#2f4f9b', '#e88aa8'].forEach((c, i) => {
    const t = texPair(256, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 6; for (let k = 0; k < S; k += 42) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, S); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(S, k); g.stroke(); } noiseOver(g, S, S, 30 + i, 0.3, 16, 3); });
    const geo = new THREE.PlaneGeometry(4.4 - i * 0.3, 4.2 - i * 0.2, 24, 24), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k); p.setZ(k, 0.12 * Math.sin(x * 3.1 + i) * Math.cos(y * 1.3) + 0.05 * Math.sin(y * 5 + x)); } geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, pbr(t.c, null, { rough: 0.95 })); m.material.side = THREE.DoubleSide; m.position.set(2.7 + (i % 2 ? 0.4 : -0.4) * (i > 2 ? -1 : 1), 5.7 + (i - 2) * 0.35, -RZ + 0.4 + i * 0.06); m.rotation.z = (i - 2) * 0.08; m.castShadow = m.receiveShadow = true; blankets.add(m);
  });
  // far night dome (seen through the window when the near sky card is hidden for moon shots)
  { const sc = cnv(64, 512), sg = sc.getContext('2d'), gr = sg.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, '#02041a'); gr.addColorStop(0.45, '#0c1a5e'); gr.addColorStop(0.55, '#2a3c94'); gr.addColorStop(1, '#05061a'); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 512);
    room.add(new THREE.Mesh(new THREE.SphereGeometry(500, 32, 24), new THREE.MeshBasicMaterial({ map: tex(sc), side: THREE.BackSide })));
    const r = rng(8), N = 1500, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const th = r() * Math.PI * 2, ph = Math.acos(0.05 + r() * 0.95), R = 480; pos.set([R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th)], i * 3); }
    const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); room.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: new THREE.Color(2, 2, 2.3) }))); }
  // orange eye light through the window (off by default)
  const eyeLight = new THREE.SpotLight('#ff8a2a', 0, 0, 0.75, 0.6, 2); eyeLight.position.set(2.7, 5.7, -RZ - 2); eyeLight.target.position.set(1.5, 3, 2); room.add(eyeLight, eyeLight.target);
  shadow(pipBed); shadow(desk);

  const lb = boards[4], lb0 = { p: lb.position.clone(), r: lb.rotation.clone() }, lampL = room.getObjectByProperty('type', 'PointLight'), beamList = room.children.filter((o) => o.isGroup && o.children[0] && o.children[0].material === bmat);
  const reset = () => { lb.position.copy(lb0.p); lb.rotation.copy(lb0.r); lb.visible = true; if (lb.userData.m0) lb.material = lb.userData.m0; boards.forEach((b) => { b.visible = true; }); blankets.visible = false; eyeLight.intensity = 0; eyeLight.color.set('#ff8a2a'); eyeLight.target.position.set(1.5, 3, 2); beamList.forEach((b) => { b.visible = true; }); haze.visible = true; if (lampL) lampL.intensity = 90; bmat.uniforms.k.value = 0.11; room.userData.sky.visible = true; room.userData.sky.material.color.setScalar(0.95); };
  return {
    scene: room, grade: 'night', reset,
    marks: {
      p_hero_bed: { p: [-5.35, 1.15, -4.6], ry: 0, sit: true }, p_pip_bed: { p: [pqx, 0.55, -5.6], ry: 0, sit: true },
      p_pip_window: { p: [2.7, 0, -7.7], ry: Math.PI }, p_hero_mid: { p: [0.5, 0.06, -2.4], ry: 0.4 }, p_hero_window: { p: [1.6, 0, -6.2], ry: Math.PI },
      p_hero_desk: { p: [-4.2, 0.5, 3.4], ry: -Math.PI / 2, sit: true }, p_stool: { p: [2.7, 1.2, -7.2], ry: Math.PI },
      m_cat_bed: { p: [-5.35, 2.7, -2.4] }, m_balloon: { p: [-2.6, 0, -2.6] }, m_shelf: { p: [-RX + 0.5, 6.5, 3.4] }, m_alarm: { p: [-1.6, 2.4, -RZ + 1.0] },
      m_window: { p: [2.7, 5.7, -RZ] }, m_floor_board: { p: [2.4, 0.08, -6.6] },
    },
    props: { boards, looseBoard: boards[4], blankets, eyeLight, beams: room.children.filter((o) => o.isGroup && o.children[0] && o.children[0].material === bmat), haze, lamp: room.getObjectByProperty('type', 'PointLight'), bmat, moonDir, WIN, RZ, RX },
    views: {
      wide: { p: [5.6, 5.4, 13.5], l: [0.2, 3.6, -2.0], fov: 50 },
      window: { p: [1.0, 3.2, 0.5], l: [2.7, 5.6, -9], fov: 55 },
      pip: { p: [2.5, 3.8, 0.0], l: [6.2, 2.4, -6.0], fov: 45 },
      desk: { p: [0.5, 5.5, 6.5], l: [-6.2, 3.8, 3.4], fov: 45 },
    },
  };
};

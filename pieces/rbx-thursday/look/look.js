// rbx-thursday look test: night bedroom with a boarded window + rooftop under the moon face. 4 stills.
'use strict';
(function () {
  const W = 1080, H = 1920;
  const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false); document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.physicallyCorrectLights = true;
  let post = new RBX.Post(renderer, W, H, 2), postL = null;
  const { cnv, tex, pbr, rng, fbm, tnoise } = RBX;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const shadow = (o, cast = true, recv = true) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };

  // ---------------- textures ----------------
  function texPair(S, draw, o = {}) {   // draw(g, hg, S) on a colour + height canvas
    const c = cnv(S, o.h || S), hc = cnv(S, o.h || S), g = c.getContext('2d'), hg = hc.getContext('2d');
    hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, o.h || S); draw(g, hg, S, o.h || S); return { c, h: hc };
  }
  function noiseOver(g, w, h, seed, amt, period = 8, oct = 4) {   // multiply-ish brightness noise over a canvas
    const n = fbm(seed, period, oct), im = g.getImageData(0, 0, w, h), d = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 1 + (n(x / w, y / h) - 0.5) * amt, i = (y * w + x) * 4; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
    g.putImageData(im, 0, 0);
  }
  function star(g, x, y, r, n = 5, inset = 0.45) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (i * Math.PI) / n, rr = i % 2 ? r * inset : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
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
      const p = box(L, h, 0.12, wm(M.plank, [L / 4, 1]), cx, y + h / 2, -RZ + 0.24); p.rotation.z = (r() - 0.5) * 0.024; p.rotation.y = (r() - 0.5) * 0.02; room.add(p);
      [-1, 1].forEach((s) => { const nl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 10), M.nail); nl.rotation.x = Math.PI / 2; nl.position.set(cx + s * (L / 2 - 0.25), y + h / 2 + (r() - 0.5) * 0.08, -RZ + 0.35); room.add(nl); });
      const gap = 0.2 + r() * 0.1; if (i < n - 1) room.userData.gaps.push([y + h + gap / 2, gap]); y += h + gap;
    }
    // sky behind the boards
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), new THREE.MeshBasicMaterial({ map: nightSky })); sky.material.color.setScalar(0.95); sky.position.set(2.6, 6, -RZ - 3); room.add(sky);
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
    const pf = box(0.12, 2.4, 2.0, [M.dark, M.dark, M.dark, M.dark, M.dark, M.dark], -RX + 0.08, 7.0, 3.0); room.add(pf);
    const pp = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.1), new THREE.MeshStandardMaterial({ map: tex(pic.c), roughness: 0.4 })); pp.rotation.y = Math.PI / 2; pp.position.set(-RX + 0.15, 7.0, 3.0); room.add(pp);
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

  // ---------------- rooftop ----------------
  const roof = new THREE.Scene();
  (function buildRoof() {
    // sky dome
    const sc = cnv(64, 512), sg = sc.getContext('2d'), gr = sg.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#02041a'); gr.addColorStop(0.35, '#08124a'); gr.addColorStop(0.5, '#1a2c86'); gr.addColorStop(0.56, '#2a3c94'); gr.addColorStop(1, '#05061a'); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 512);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 24), new THREE.MeshBasicMaterial({ map: tex(sc), side: THREE.BackSide, fog: false })); roof.add(dome);
    const r = rng(8), N = 1400, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const th = r() * Math.PI * 2, ph = Math.acos(0.05 + r() * 0.95), R = 380; pos.set([R * Math.sin(ph) * Math.cos(th), R * Math.cos(ph), R * Math.sin(ph) * Math.sin(th)], i * 3); }
    const sgeo = new THREE.BufferGeometry(); sgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    roof.add(new THREE.Points(sgeo, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, color: new THREE.Color(2, 2, 2.3), fog: false })));
    roof.fog = new THREE.FogExp2('#0b1442', 0.012);
    // roof deck: tar + gravel
    const tarT = texPair(512, (g, hg, S) => { g.fillStyle = '#2b2c33'; g.fillRect(0, 0, S, S); const r2 = rng(4); for (let i = 0; i < 9000; i++) { const x = r2() * S, y = r2() * S, s = 0.8 + r2() * 2.2, v = 70 + r2() * 90; g.fillStyle = `rgb(${v},${v * 0.97},${v * 0.92})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); hg.fillStyle = `rgba(255,255,255,${0.3 + r2() * 0.5})`; hg.beginPath(); hg.arc(x, y, s, 0, 7); hg.fill(); } noiseOver(g, S, S, 9, 0.4, 4, 4); });
    const deck = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), pbr(tarT.c, tarT.h, { rough: 0.95, bump: 6, repeat: [10, 10] })); deck.rotation.x = -Math.PI / 2; roof.add(deck);
    // bricks
    const brickT = texPair(512, (g, hg, S) => { g.fillStyle = '#5e5a55'; g.fillRect(0, 0, S, S); hg.fillStyle = '#202020'; hg.fillRect(0, 0, S, S); const r2 = rng(6), bh = S / 8, bw = S / 4;
      for (let row = 0; row < 8; row++) for (let k = -1; k < 5; k++) { const x = k * bw + (row % 2 ? bw / 2 : 0), y = row * bh, t = 0.75 + r2() * 0.4; g.fillStyle = `rgb(${142 * t},${66 * t},${48 * t})`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8); hg.fillStyle = '#c0c0c0'; hg.fillRect(x + 4, y + 4, bw - 8, bh - 8); }
      noiseOver(g, S, S, 3, 0.45, 16, 4); });
    const brick = pbr(brickT.c, brickT.h, { rough: 0.9, bump: 5 });
    const bwall = (w, h, d, x, y, z, ry = 0) => { const geo = uvBox(new THREE.BoxGeometry(w, h, d), w, h, d); const m = new THREE.Mesh(geo, wm(brick, [1 / 4, 1 / 4])); m.position.set(x, y, z); m.rotation.y = ry; roof.add(m); return m; };
    const coping = new THREE.MeshStandardMaterial({ color: '#8d8a84', roughness: 0.8 });
    // parapet on three sides of a 24x24 roof (front edge open to the camera side)
    bwall(24, 1.8, 0.8, 0, 0.9, -12); bwall(24, 1.8, 0.8, -12, 0.9, 0, Math.PI / 2); bwall(24, 1.8, 0.8, 12, 0.9, 0, Math.PI / 2);
    [[0, -12, 0], [-12, 0, Math.PI / 2], [12, 0, Math.PI / 2]].forEach(([x, z, ry]) => { const c = box(24.4, 0.25, 1.1, coping, x, 1.9, z); c.rotation.y = ry; roof.add(c); });
    // chimney + antenna + vent
    bwall(2.2, 6, 2.2, -6, 3, -7);
    roof.add(box(2.6, 0.3, 2.6, coping, -6, 6.15, -7));
    const metal = new THREE.MeshStandardMaterial({ color: '#7b818c', roughness: 0.35, metalness: 0.9 });
    const ant = new THREE.Group(); ant.position.set(6, 0, -8); roof.add(ant);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 11, 8), metal); pole.position.y = 5.5; ant.add(pole);
    [8, 9.2, 10.2].forEach((y, i) => { const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4 - i, 6), metal); bar.rotation.z = Math.PI / 2; bar.position.y = y; ant.add(bar); });
    roof.add(rb(3, 1.6, 2.2, 0.08, metal, 7, 0.8, 3)); roof.add(rb(1.4, 0.4, 1.4, 0.1, metal, 7, 1.8, 3));
    // the town below: houses with warm windows
    const r3 = rng(21), winM = new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 2.6, 0.9) }), roofM = new THREE.MeshStandardMaterial({ color: '#3a2a26', roughness: 0.9 });
    const houseM = [new THREE.MeshStandardMaterial({ color: '#6f6f80', roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: '#8a5a44', roughness: 0.9 }), new THREE.MeshStandardMaterial({ color: '#c9c3b6', roughness: 0.9 })];
    for (let i = 0; i < 46; i++) {
      const x = -90 + r3() * 180, z = -30 - r3() * 120; if (Math.abs(x) < 16 && z > -40) continue;
      const w = 10 + r3() * 8, d = 9 + r3() * 6, h = 8 + r3() * 5, y0 = -9 - r3() * 4;
      const hs = new THREE.Group(); hs.position.set(x, y0, z); hs.rotation.y = (r3() - 0.5) * 0.4; roof.add(hs);
      hs.add(box(w, h, d, houseM[i % 3], 0, h / 2, 0));
      const rf = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.75, 4 + r3() * 2, 4), roofM); rf.rotation.y = Math.PI / 4; rf.position.y = h + 2.4; rf.scale.set(1, 1, d / w); hs.add(rf);
      for (let k = 0; k < 3; k++) if (r3() > 0.35) { const wv = box(1.4, 1.6, 0.1, winM, -w / 3 + k * (w / 3), h * (0.35 + 0.35 * (k % 2)), d / 2 + 0.06); hs.add(wv); }
    }
    // more rooftop life: water tower, second chimney, roof hatch, satellite dish, pipes, string lights on the parapet,
    // and closer neighbour buildings with lit windows
    const wood = pbr(woodPlanks(256, 71, { rows: 6, tones: ['#4a3426', '#3f2c20', '#55392a'] }).c, null, { rough: 0.8 });
    const tower = new THREE.Group(); tower.position.set(-9.5, 0, -9); roof.add(tower);
    [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 6, 8), metal); l.position.set(x, 3, z); tower.add(l); });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 4.2, 32), wood); tank.position.y = 8.1; tower.add(tank);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(2.7, 1.8, 32), new THREE.MeshStandardMaterial({ color: '#2b2d33', roughness: 0.6, metalness: 0.6 })); cap.position.y = 11.1; tower.add(cap);
    [7, 8.2, 9.4].forEach((y) => { const hoop = new THREE.Mesh(new THREE.TorusGeometry(2.43, 0.05, 6, 40), metal); hoop.rotation.x = Math.PI / 2; hoop.position.y = y; tower.add(hoop); });
    bwall(1.8, 4.5, 1.8, 9.5, 2.25, -2); roof.add(box(2.2, 0.3, 2.2, coping, 9.5, 4.6, -2));
    roof.add(rb(2.4, 1.0, 2.4, 0.06, metal, -8, 0.5, 4)); roof.add(rb(2.0, 0.2, 2.0, 0.05, new THREE.MeshStandardMaterial({ color: '#5b6070', roughness: 0.4, metalness: 0.7 }), -8, 1.1, 4));
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 12, 0, Math.PI * 2, 0, 0.9), new THREE.MeshStandardMaterial({ color: '#c9ccd2', roughness: 0.5, side: THREE.DoubleSide })); dish.position.set(10, 3.2, 6); dish.rotation.x = -1.1; dish.rotation.z = 0.5; roof.add(dish);
    const dpole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3, 8), metal); dpole.position.set(10, 1.5, 6); roof.add(dpole);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 14, 12), metal); pipe.rotation.z = Math.PI / 2; pipe.position.set(2, 0.3, -10.8); roof.add(pipe);
    // string lights sagging between posts along the back and left parapets
    const bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(7, 4.2, 1.6) }), wireM = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.8 });
    const sag = (a, b, n) => { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a.clone().lerp(b, t).add(V(0, -0.9 * Math.sin(t * Math.PI), 0))); }
      roof.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, 0.025, 4), wireM));
      pts.forEach((p2, i) => { if (i % 1 === 0 && i > 0 && i < n) { const b2 = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), bulbM); b2.position.copy(p2).add(V(0, -0.12, 0)); roof.add(b2); } }); };
    [[-11.5, 11.5, 0], [-4, 4, 0]].forEach(() => {});
    const posts = [V(-11.6, 4.2, -11.6), V(-3.5, 4.2, -11.6), V(4.5, 4.2, -11.6), V(11.6, 4.2, -11.6), V(11.6, 4.2, -3), V(-11.6, 4.2, -3), V(-11.6, 4.2, 6)];
    posts.forEach((p2) => { const po = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), metal); po.position.copy(p2).add(V(0, -1.2, 0)); roof.add(po); });
    sag(posts[0], posts[1], 10); sag(posts[1], posts[2], 10); sag(posts[2], posts[3], 10); sag(posts[3], posts[4], 10); sag(posts[0], posts[5], 10); sag(posts[5], posts[6], 10);
    const strW = new THREE.PointLight('#ffb070', 25, 0, 2); strW.position.set(0, 3.5, -10); roof.add(strW);
    // neighbour blocks just beyond the parapet (taller, with lit windows)
    const nb = new THREE.MeshStandardMaterial({ color: '#4a4f63', roughness: 0.9 });
    [[-26, -24, 16, 18, 10], [24, -28, 14, 22, 12], [-2, -40, 20, 26, 12], [30, 4, 12, 14, 12]].forEach(([x, z, w, h, d]) => {
      const b2 = box(w, h, d, wm(brick, [w / 6, h / 6]), x, h / 2 - 14, z); roof.add(b2);
      for (let k = 0; k < 14; k++) { if (r3() < 0.45) continue; const wx = x - w / 2 + 1.5 + (k % 5) * (w - 3) / 4, wy = -14 + 3 + Math.floor(k / 5) * 4.5; if (wy > h - 15) continue;
        roof.add(box(1.3, 1.8, 0.1, (k % 3) ? winM : new THREE.MeshBasicMaterial({ color: new THREE.Color(0.6, 1.2, 3.0) }), wx, wy, z + d / 2 + 0.06)); }
    });
    // street lamps glow
    for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.6, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 5, 2) })); l.position.set(-40 + i * 16, -10, -36 - (i % 2) * 8); roof.add(l); }
  })();
  shadow(roof);
  roof.traverse((m) => { if (m.isMesh && m.material && m.material.isMeshBasicMaterial) { m.castShadow = false; m.receiveShadow = false; } });

  // the moon face
  const moonFace = (function () {
    const g = new THREE.Group(), R = 34;
    const mt = texPair(1024, (gc, hg, S, Hh) => {
      gc.fillStyle = '#a7adbb'; gc.fillRect(0, 0, S, Hh); noiseOver(gc, S, Hh, 33, 0.5, 6, 5);
      const r = rng(12);
      for (let i = 0; i < 260; i++) { const x = r() * S, y = Hh * (0.1 + r() * 0.8), s = 4 + Math.pow(r(), 3) * 60;
        const gr = gc.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, 'rgba(50,56,72,0.55)'); gr.addColorStop(0.75, 'rgba(70,76,92,0.35)'); gr.addColorStop(1, 'rgba(70,76,92,0)'); gc.fillStyle = gr; gc.beginPath(); gc.arc(x, y, s, 0, 7); gc.fill();
        const hr = hg.createRadialGradient(x, y, 0, x, y, s); hr.addColorStop(0, 'rgba(0,0,0,0.45)'); hr.addColorStop(0.7, 'rgba(40,40,40,0.3)'); hr.addColorStop(0.9, 'rgba(200,200,200,0.25)'); hr.addColorStop(1, 'rgba(255,255,255,0)'); hg.fillStyle = hr; hg.beginPath(); hg.arc(x, y, s, 0, 7); hg.fill(); }
    }, { h: 512 });
    const mm = pbr(mt.c, mt.h, { rough: 0.95, bump: 1.5, emissive: '#b4bcd6', emissiveIntensity: 0.75, emissiveMap: true });
    const sph = new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), mm); g.add(sph);
    const on = (u, v, lift = 0) => { const th = u, ph = v; return V(Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph)).multiplyScalar(R + lift); };   // u: yaw, v: pitch on the front
    const rock = mm;
    // brow ridges, cheek bones, nose
    [-1, 1].forEach((s) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), rock); b.scale.set(11, 4.2, 6); b.position.copy(on(s * 0.32, 0.36, -2)); b.rotation.z = s * -0.38; b.lookAt(0, 0, 0); b.rotation.z += s * 0.4; g.add(b);
      const c = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), rock); c.scale.set(8, 5, 5); c.position.copy(on(s * 0.4, -0.08, -2.5)); g.add(c);
    });
    const nose = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), rock); nose.scale.set(4, 9, 6); nose.position.copy(on(0, 0.02, 0)); nose.rotation.x = -0.3; g.add(nose);
    // eyes: sockets + glowing orange irises with black pupils
    const ec = cnv(512, 512), eg = ec.getContext('2d');
    { const gr = eg.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, '#000'); gr.addColorStop(0.16, '#000'); gr.addColorStop(0.2, '#ffe36a'); gr.addColorStop(0.42, '#ffad1f'); gr.addColorStop(0.75, '#ff6a0a'); gr.addColorStop(0.96, '#b42400'); gr.addColorStop(1, '#3a0a00'); eg.fillStyle = gr; eg.fillRect(0, 0, 512, 512);
      eg.strokeStyle = 'rgba(120,20,0,0.5)'; eg.lineWidth = 3; const r = rng(2); for (let i = 0; i < 60; i++) { const a = r() * 7; eg.beginPath(); eg.moveTo(256 + Math.cos(a) * 60, 256 + Math.sin(a) * 60); eg.lineTo(256 + Math.cos(a + 0.1) * 240, 256 + Math.sin(a + 0.1) * 240); eg.stroke(); } }
    const eyeMat = new THREE.MeshStandardMaterial({ map: tex(ec), emissiveMap: tex(ec), emissive: new THREE.Color(1, 1, 1), emissiveIntensity: 2.2, roughness: 0.3 });
    const socket = new THREE.MeshStandardMaterial({ color: '#2a2e3a', roughness: 1 });
    [-1, 1].forEach((s) => {
      const sk = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), socket); sk.scale.set(9.5, 8, 4); sk.position.copy(on(s * 0.3, 0.17, -2.6)); sk.lookAt(sk.position.clone().multiplyScalar(2)); g.add(sk);
      const e = new THREE.Mesh(new THREE.SphereGeometry(6.6, 48, 32), eyeMat); e.position.copy(on(s * 0.3, 0.17, -3.2)); e.lookAt(0, 0, 200); g.add(e);
    });
    // grin: dark mouth band + teeth on an arc
    const mouthM = new THREE.MeshStandardMaterial({ color: '#160a10', roughness: 1 }), toothM = new THREE.MeshStandardMaterial({ color: '#ece0c4', roughness: 0.6, emissive: new THREE.Color('#8a826e'), emissiveIntensity: 0.6 });
    const mouth = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mouthM); mouth.scale.set(19, 4.4, 4); mouth.position.copy(on(0, -0.42, -2.6)); mouth.lookAt(mouth.position.clone().multiplyScalar(2)); g.add(mouth);
    for (let i = 0; i < 15; i++) { const u = (i / 14 - 0.5) * 1.0, v = -0.42 + 0.12 * Math.pow(Math.abs(u) / 0.52, 2);
      const t = new THREE.Mesh(RBX.rbox(2.6, 5.6, 2.4, 0.8, 6), toothM); t.position.copy(on(u, v, 0.2)); t.lookAt(t.position.clone().multiplyScalar(2)); t.rotateZ(u * 0.6); g.add(t); }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; m.material.fog = false; } });
    return g;
  })();
  let moonM = null;   // the Watcher (Majora moon model), loaded async
  roof.add(new THREE.HemisphereLight('#3248a8', '#0a0b1a', 0.45));
  const moonL = new THREE.DirectionalLight('#b8c8ff', 5); moonL.castShadow = true; moonL.shadow.mapSize.set(4096, 4096); Object.assign(moonL.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 200 }); moonL.shadow.bias = -0.0004; moonL.shadow.normalBias = 0.02;
  roof.add(moonL, moonL.target);
  const eyeGlow = new THREE.PointLight('#ff8a2a', 0, 0, 2); roof.add(eyeGlow);
  const lampWarm = new THREE.PointLight('#ffd6a8', 75, 0, 2); lampWarm.position.set(5, 6, 9); roof.add(lampWarm);

  // ---------------- avatars ----------------
  const heroR = RBX.avatar({ hood: 'dino', face: 'neutral', headScale: 1.25 }); room.add(heroR.root);
  const heroT = RBX.avatar({ hood: 'dino', face: 'staring-hard', headScale: 1.25 }); roof.add(heroT.root);
  window.HERO = heroR;

  // studio (self-check vs the hero sheet)
  const studio = new THREE.Scene(); studio.background = new THREE.Color('#d9dde4');
  { const fl = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: '#cfd3da', roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; studio.add(fl);
    studio.add(new THREE.HemisphereLight('#ffffff', '#9aa0aa', 1.6)); const k = new THREE.DirectionalLight('#fff6ea', 3.2); k.position.set(-8, 14, 10); k.castShadow = true; k.shadow.mapSize.set(2048, 2048); Object.assign(k.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12 }); k.shadow.bias = -0.0005; studio.add(k); }
  const studioHeroes = [0, 1, 2, 3].map((i) => { const a = RBX.avatar({ hood: 'dino', face: 'neutral', headScale: 1.25 }); a.root.position.set(-9 + i * 6, 0, 0); a.root.rotation.y = [0, -Math.PI / 2, Math.PI, -0.6][i]; studio.add(a.root); return a; });
  // ---------------- shots ----------------
  const cam = new THREE.PerspectiveCamera(45, W / H, 0.1, 600);
  function shoot(scene, c, o) { cam.fov = c.fov; cam.position.copy(c.p); cam.lookAt(c.l); if (c.roll) cam.rotateZ(c.roll); cam.updateProjectionMatrix(); post.render(scene, cam, Object.assign({ focus: c.p.distanceTo(c.f || c.l) }, o)); }
  const NIGHT = { aperture: 1, maxCoc: 16, bloom: 0.5, threshold: 1.0, exposure: 1.55, vignette: 0.42, grain: 0.025, saturation: 1.12, contrast: 1.08, lift: [0.004, 0.008, 0.03], gain: [1.0, 0.98, 1.02] };
  let MOON_YAW = window.MOON_YAW ?? 0;
  const mstudio = new THREE.Scene(); mstudio.background = new THREE.Color('#202430'); mstudio.add(new THREE.HemisphereLight('#ffffff', '#445', 1.5));
  const SHOTS = {
    hb() { shoot(studio, { fov: 20, p: V(-3 + 8.3, 6.6, 11), l: V(-3, 5.0, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); },
    m4() { const m = mstudio.userData.m; m.rotation.set(0, 0, 0); shoot(mstudio, { fov: 40, p: V(0, 6, 0.01), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    m5() { const m = mstudio.userData.m; m.rotation.set(0, 0, 0); shoot(mstudio, { fov: 40, p: V(0, -6, 0.01), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    m0() { const m = mstudio.userData.m; m.scale.setScalar(1); m.rotation.set(0, 0, 0); shoot(mstudio, { fov: 40, p: V(0, 0, 6), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    m1() { const m = mstudio.userData.m; m.rotation.set(0, Math.PI / 2, 0); shoot(mstudio, { fov: 40, p: V(0, 0, 6), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    m2() { const m = mstudio.userData.m; m.rotation.set(0, Math.PI, 0); shoot(mstudio, { fov: 40, p: V(0, 0, 6), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    m3() { const m = mstudio.userData.m; m.rotation.set(0, -Math.PI / 2, 0); shoot(mstudio, { fov: 40, p: V(0, 0, 6), l: V(0, 0, 0) }, { aperture: 0, bloom: 0.4, exposure: 1, vignette: 0, grain: 0 }); },
    top() { heroR.root.position.set(0.6, 0.06, -2.4); shoot(room, { fov: 70, p: V(0.5, 11.5, 2), l: V(0.5, 0, -2.5) }, Object.assign({}, NIGHT, { aperture: 0 })); },
    s() { renderer.setSize(1920, 1080, false); cam.aspect = 1920 / 1080; postL = postL || new RBX.Post(renderer, 1920, 1080, 2);
      studioHeroes.forEach((h, i) => { h.root.position.set(-9 + i * 6, 0, 0); }); const P = post; post = postL;
      shoot(studio, { fov: 24, p: V(0, 6, 40), l: V(0, 3.0, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); post = P; cam.aspect = W / H; },
    s2() { renderer.setSize(1920, 1080, false); cam.aspect = 1920 / 1080; postL = postL || new RBX.Post(renderer, 1920, 1080, 2); const P = post; post = postL;
      shoot(studio, { fov: 15, p: V(-6, 5.4, 22), l: V(-6, 4.9, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); post = P; cam.aspect = W / H; },
    h() { shoot(studio, { fov: 22, p: V(-9, 6.5, 9), l: V(-9, 5.2, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); },
    hk() { shoot(studio, { fov: 22, p: V(3, 6.4, 9), l: V(3, 5.0, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); },
    hq() { shoot(studio, { fov: 22, p: V(9, 6.4, 9), l: V(9, 5.0, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); },
    h2() { shoot(studio, { fov: 22, p: V(-3, 6.2, 9), l: V(-3, 5.0, 0) }, { aperture: 0, bloom: 0.1, exposure: 1.0, vignette: 0.1, grain: 0.01 }); },
    a() { haze.visible = true; bmat.uniforms.k.value = window.BEAMK || 0.13; heroR.root.position.set(-1.7, 0.06, -1.6); heroR.root.rotation.y = 0.85; heroR.setFace('neutral'); heroR.pose({ head: [0, 0.1, 0.05], armL: [0.05, 0, 0.04], armR: [-0.08, 0, -0.04] });
      shoot(room, { fov: 50, p: V(5.6, 5.4, 13.5), l: V(0.2, 3.6, -2.0), f: V(-1.7, 3.8, -1.6) }, NIGHT); },
    b() { haze.visible = false; bmat.uniforms.k.value = 0.025; heroR.root.position.set(2.5, 0, -6.4); heroR.root.rotation.y = -0.35; heroR.setFace('scared'); heroR.pose({ head: [-0.14, 0, 0.1], armL: [-0.55, 0, 0.12], armR: [-0.4, 0, -0.1], body: [-0.04, 0, 0] });
      shoot(room, { fov: 66, p: V(0.2, 2.2, -2.4), l: V(2.6, 6.4, -7.6), f: V(2.5, 5.4, -6.0), roll: -0.08 }, Object.assign({}, NIGHT, { aperture: 1.3 })); },
    c() { haze.visible = true; bmat.uniforms.k.value = 0.11; heroR.root.position.set(-1.5, 0.06, -2.0); heroR.root.rotation.y = -1.45; heroR.setFace('determined'); heroR.pose({ head: [0.04, -0.1, 0] });
      shoot(room, { fov: 36, p: V(6.8, 6.6, 9.0), l: V(-1.5, 3.7, -2.0), f: V(-1.5, 4.8, -2.0) }, NIGHT); },
    d() { heroT.root.position.set(0, 0, 2.5); heroT.root.rotation.y = 0.35; heroT.setFace('staring-hard'); heroT.pose({ head: [-0.42, -0.3, 0.06], armL: [0, 0, 0.08], armR: [0, 0, -0.08] });
      const c = { fov: 58, p: V(2.6, 3.0, 9.6), l: V(-0.8, 8.4, -2), f: V(0.2, 6.2, 2.7), roll: 0.05 };
      cam.position.copy(c.p); cam.lookAt(c.l); cam.updateMatrixWorld();
      const mp = V(-0.12, 0.27, -1).normalize().applyQuaternion(cam.quaternion).multiplyScalar(150).add(cam.position);
      moonM.position.copy(mp); moonM.lookAt(V(2, 3, 12)); moonM.rotateY(MOON_YAW); moonM.rotateZ(-0.1);
      moonL.position.copy(V(0, 2, 2.5).add(mp.clone().sub(V(0, 2, 2.5)).normalize().multiplyScalar(60))); moonL.target.position.set(0, 2, 2.5);
      shoot(roof, c, Object.assign({}, NIGHT, { aperture: 0.3, bloom: 0.5, exposure: 1.35 })); },
  };
  window.renderShot = (id) => { renderer.setSize(W, H, false); cam.aspect = W / H; SHOTS[id](); return renderer.domElement.toDataURL('image/png'); };
  RBX.loadMoon({ eyeGlow: 6 }).then((g) => { moonM = g; moonM.scale.setScalar(40); moonM.traverse((m) => { if (m.isMesh) m.material.fog = false; }); roof.add(moonM);
    mstudio.userData.m = g.clone(); mstudio.add(mstudio.userData.m); window.READY = true; }).catch((e) => console.log('moon load failed', e.message));
})();

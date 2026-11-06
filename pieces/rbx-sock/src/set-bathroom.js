// rbx-sock BATHROOM: small family bathroom. Tiled walk-in shower (back-left corner) with a running shower (translucent
// water streaks + droplets + splashes), steamy glass door half open, white shower tray with drain and a water film,
// towels, vanity + mirror, toilet, frosted window, bath mat, rubber duck. Built for a low close-up of feet in soaked socks.
'use strict';
SETS.bathroom = async function (ctx) {
  const { cnv, tex, pbr, rng, tnoise } = RBX;
  const { V, texPair, noiseOver, woodPlanks, box, rb, wm, shadow } = KIT;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  const room = new THREE.Group(); scene.add(room);
  const add = (...o) => { o.forEach((k) => room.add(k)); return o[0]; };
  const X0 = -6, X1 = 6, Z0 = -6, ZF = 9, RH = 11, TW = 4.6;              // TW: tile wainscot height
  const SH = { x0: -6, x1: -1.2, z0: -6, z1: -1.6, top: 0.3 }, SHX = (SH.x0 + SH.x1) / 2 + 0.25, SHZ = -3.9;
  const HEAD = { x: SHX, y: 9.0, z: -4.3 };

  // ---------------- textures ----------------
  const tileT = (base, grout, n, seed, o = {}) => texPair(512, (g, hg, S) => {
    g.fillStyle = grout; g.fillRect(0, 0, S, S); hg.fillStyle = '#202020'; hg.fillRect(0, 0, S, S);
    const r = rng(seed), t = S / n, c = new THREE.Color(base);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = 0.92 + r() * 0.1, kk = o.check && (i + j) % 2 ? 0.35 : 1;
      const gr = g.createLinearGradient(i * t, j * t, i * t + t, j * t + t); gr.addColorStop(0, `rgb(${c.r * 255 * k * kk + 10},${c.g * 255 * k * kk + 10},${c.b * 255 * k * kk + 10})`); gr.addColorStop(1, `rgb(${c.r * 235 * k * kk},${c.g * 235 * k * kk},${c.b * 235 * k * kk})`);
      g.fillStyle = gr; g.fillRect(i * t + 3, j * t + 3, t - 6, t - 6); hg.fillStyle = '#b8b8b8'; hg.fillRect(i * t + 3, j * t + 3, t - 6, t - 6); hg.fillStyle = '#c8c8c8'; hg.fillRect(i * t + 9, j * t + 9, t - 18, t - 18);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(i * t + 6, j * t + 6, t * 0.5, 3); }
    noiseOver(g, S, S, seed + 4, 0.06, 16, 3);
  });
  const wallTile = tileT('#cfe8e2', '#8a9894', 4, 3), showerTile = tileT('#e9f0ee', '#7c8784', 4, 5), floorTile = tileT('#e8e6e0', '#5a5a58', 8, 7, { check: true });
  const paintT = texPair(256, (g, hg, S) => { g.fillStyle = '#9ec3d6'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 9, 0.1, 8, 4); const n = tnoise(6, 64), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 110 + n((i % S) / S, Math.floor(i / S) / S) * 50; hg.putImageData(im, 0, 0); });
  const towelT = (a, b, seed) => texPair(256, (g, hg, S) => { g.fillStyle = a; g.fillRect(0, 0, S, S); g.fillStyle = b; g.fillRect(0, 26, S, 22); g.fillRect(0, S - 48, S, 22); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, 54, S, 5); g.fillRect(0, S - 60, S, 5);
    noiseOver(g, S, S, seed, 0.25, 64, 3); const n = tnoise(seed, 200), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 80 + n((i % S) / S, Math.floor(i / S) / S) * 150; hg.putImageData(im, 0, 0); });
  const woodT = woodPlanks(512, 71, { rows: 3, tones: ['#c99a5e', '#bd8c52', '#d2a468'] });
  const envT = (() => { const c = cnv(512, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f2f6f8'); gr.addColorStop(0.5, '#a8bcc4'); gr.addColorStop(1, '#5a6066'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    [[100, 60, 70, 40], [330, 50, 40, 70]].forEach(([x, y, w, h]) => { g.fillStyle = '#ffffff'; g.fillRect(x, y, w, h); }); g.fillStyle = '#7fb0c0'; g.fillRect(0, 150, 512, 30); const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t; })();
  const M = {
    wtile: pbr(wallTile.c, wallTile.h, { rough: 0.15, bump: 3, repeat: [1 / 3, 1 / 3] }),
    stile: pbr(showerTile.c, showerTile.h, { rough: 0.08, bump: 3, repeat: [1 / 3, 1 / 3] }),
    ftile: pbr(floorTile.c, floorTile.h, { rough: 0.3, bump: 3, repeat: [1 / 4, 1 / 4] }),
    paint: pbr(paintT.c, paintT.h, { rough: 0.85, bump: 1.5, repeat: [1 / 4, 1 / 4] }),
    wood: pbr(woodT.c, woodT.h, { rough: 0.45, bump: 3 }),
    acrylic: new THREE.MeshPhysicalMaterial({ color: '#cdd4d7', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08, envMap: envT, envMapIntensity: 0.5 }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: '#f6f6f2', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMap: envT, envMapIntensity: 0.6 }),
    chrome: new THREE.MeshStandardMaterial({ color: '#e8ecef', roughness: 0.08, metalness: 1, envMap: envT, envMapIntensity: 1.2 }),
    trim: new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.45 }),
    shell: new THREE.MeshStandardMaterial({ color: '#0b0e1c', roughness: 1 }),
    plaster: new THREE.MeshStandardMaterial({ color: '#eef0ee', roughness: 0.95 }),
  };
  [M.wtile, M.stile, M.ftile].forEach((m) => { m.envMap = envT; m.envMapIntensity = 0.35; });
  const ch = (par, m) => { par.add(m); return m; };
  const colM = {}, col = (c, r = 0.6) => colM[c + r] || (colM[c + r] = new THREE.MeshStandardMaterial({ color: c, roughness: r }));
  const W = (w, h, d, m, x, y, z) => add(box(w, h, d, wm(m, [1 / 3, 1 / 3]), x, y, z, true));

  // ---------------- shell ----------------
  { const fl = new THREE.PlaneGeometry(X1 - X0, ZF - Z0), uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (X1 - X0), uv.getY(i) * (ZF - Z0));
    const f = new THREE.Mesh(fl, M.ftile); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, (Z0 + ZF) / 2); add(f); }
  // back wall: tile wainscot + paint, frosted window above the toilet
  W(X1 - X0, TW, 0.3, M.wtile, 0, TW / 2, Z0 - 0.15);
  add(box(X1 - X0, RH - TW, 0.3, wm(M.paint, [1 / 4, 1 / 4]), 0, TW + (RH - TW) / 2, Z0 - 0.15, true));
  add(box(0.4, RH, ZF - Z0 + 1, M.shell, X0 - 0.4, RH / 2, (Z0 + ZF) / 2), box(0.4, RH, ZF - Z0 + 1, M.shell, X1 + 0.4, RH / 2, (Z0 + ZF) / 2));
  W(0.3, TW, ZF - Z0, M.wtile, X0 - 0.15, TW / 2, (Z0 + ZF) / 2); add(box(0.3, RH - TW, ZF - Z0, wm(M.paint, [1 / 4, 1 / 4]), X0 - 0.15, TW + (RH - TW) / 2, (Z0 + ZF) / 2, true));
  W(0.3, TW, ZF - Z0, M.wtile, X1 + 0.15, TW / 2, (Z0 + ZF) / 2); add(box(0.3, RH - TW, ZF - Z0, wm(M.paint, [1 / 4, 1 / 4]), X1 + 0.15, TW + (RH - TW) / 2, (Z0 + ZF) / 2, true));
  add(box(X1 - X0 + 1, 0.4, ZF - Z0 + 1, M.plaster, 0, RH + 0.2, (Z0 + ZF) / 2));
  // shower walls: full-height glossy tiles over the corner + bullnose trims
  add(box(SH.x1 - SH.x0, 9.6, 0.06, wm(M.stile, [1 / 3, 1 / 3]), (SH.x0 + SH.x1) / 2, 4.8, Z0 + 0.03, true));
  { const b = box(SH.z1 - SH.z0, 9.6, 0.06, wm(M.stile, [1 / 3, 1 / 3]), 0, 4.8, 0, true); b.rotation.y = Math.PI / 2; b.position.set(X0 + 0.03, 4.8, (SH.z0 + SH.z1) / 2); add(b); }
  add(box(SH.x1 - SH.x0 + 0.1, 0.14, 0.14, M.trim, (SH.x0 + SH.x1) / 2, 9.6, Z0 + 0.07), box(0.14, 0.14, SH.z1 - SH.z0, M.trim, X0 + 0.07, 9.6, (SH.z0 + SH.z1) / 2));
  // tile cap rail along the wainscot
  add(box(X1 - X0, 0.18, 0.16, M.trim, 0, TW, Z0 + 0.08), box(0.16, 0.18, ZF - SH.z1, M.trim, X0 + 0.08, TW, (SH.z1 + ZF) / 2), box(0.16, 0.18, ZF - Z0, M.trim, X1 - 0.08, TW, (Z0 + ZF) / 2));
  // niche shelf with bottles in the shower back wall
  { add(box(2.0, 0.08, 0.5, M.chrome, SH.x0 + 1.4, 5.0, Z0 + 0.3));
    [['#e85a8a', 0.5], ['#3fa0c8', 0.65], ['#f2c14e', 0.42], ['#5bb36a', 0.55]].forEach(([c, h], i) => { const b = rb(0.32, h + 0.35, 0.26, 0.08, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 0.8 }), SH.x0 + 0.65 + i * 0.48, 5.04 + (h + 0.35) / 2, Z0 + 0.3); add(b); add(box(0.16, 0.12, 0.12, M.trim, b.position.x, 5.04 + h + 0.41, Z0 + 0.3)); }); }

  // ---------------- shower tray + drain + water film ----------------
  { const w = SH.x1 - SH.x0, d = SH.z1 - SH.z0, cx = (SH.x0 + SH.x1) / 2, cz = (SH.z0 + SH.z1) / 2;
    add(rb(w, SH.top, d, 0.05, M.acrylic, cx, SH.top / 2, cz));
    const slipT = texPair(256, (g, hg, S) => { g.fillStyle = '#b4c2c8'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 15, 0.06, 8, 3); for (let y = 8; y < S; y += 16) for (let x = (y / 16) % 2 ? 16 : 8; x < S; x += 16) { g.fillStyle = 'rgba(150,165,172,0.5)'; g.beginPath(); g.arc(x, y, 3.5, 0, 7); g.fill(); hg.fillStyle = '#e0e0e0'; hg.beginPath(); hg.arc(x, y, 4, 0, 7); hg.fill(); } });
    const slipM = pbr(slipT.c, slipT.h, { physical: true, rough: 0.25, bump: 3, repeat: [3, 3] }); Object.assign(slipM, { clearcoat: 1, clearcoatRoughness: 0.05, envMap: envT, envMapIntensity: 0.25 });
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, d - 0.6), slipM); inner.rotation.x = -Math.PI / 2; inner.position.set(cx, SH.top + 0.005, cz); add(inner);
    const drain = new THREE.Group(); drain.position.set(SHX + 0.4, SH.top + 0.012, SHZ + 0.95); add(drain);
    drain.add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.03, 32), M.chrome));
    for (let k = -3; k <= 3; k++) { const s = box(0.06, 0.04, 0.6 - Math.abs(k) * 0.07, col('#1a1c20', 0.5), k * 0.1, 0.006, 0); drain.add(s); }
    // water film with ripples
    const wc = cnv(256, 256), wg = wc.getContext('2d'), hc = cnv(256, 256), hg = hc.getContext('2d'); wg.fillStyle = '#ffffff'; wg.fillRect(0, 0, 256, 256); hg.fillStyle = '#808080'; hg.fillRect(0, 0, 256, 256);
    const r = rng(33); hg.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = r() * 256, y = r() * 256, rr = 6 + r() * 30; hg.strokeStyle = r() < 0.5 ? '#a0a0a0' : '#606060'; hg.beginPath(); hg.arc(x, y, rr, 0, 7); hg.stroke(); }
    const film = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.6, d - 0.6), pbr(wc, hc, { rough: 0.02, bump: 2, repeat: [2, 2] }));
    Object.assign(film.material, { color: new THREE.Color('#9fc4d4'), transparent: true, opacity: 0.45, envMap: envT, envMapIntensity: 0.7, depthWrite: false, metalness: 0.2 }); film.material.map = null;
    film.rotation.x = -Math.PI / 2; film.position.set(cx, SH.top + 0.012, cz); film.renderOrder = 3; add(film);
    // grout-sealed silicone bead along the walls
    add(box(w, 0.06, 0.06, col('#e8ecea', 0.4), cx, SH.top + 0.03, Z0 + 0.08), box(0.06, 0.06, d, col('#e8ecea', 0.4), X0 + 0.08, SH.top + 0.03, cz));
  }
  // ---------------- shower head, valve, pipes ----------------
  { add(box(0.12, 4.0, 0.12, M.chrome, HEAD.x, 7.0, Z0 + 0.12));
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 12), M.chrome); arm.rotation.x = Math.PI / 2 - 0.25; arm.position.set(HEAD.x, HEAD.y + 0.25, (Z0 + HEAD.z) / 2 - 0.1); add(arm);
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.16, 32), M.chrome); hd.position.set(HEAD.x, HEAD.y, HEAD.z); add(hd);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), col('#3a3e44', 0.3)); face.rotation.x = Math.PI / 2; face.position.set(HEAD.x, HEAD.y - 0.085, HEAD.z); add(face);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 32), M.chrome); plate.rotation.x = Math.PI / 2; plate.position.set(HEAD.x, 4.6, Z0 + 0.09); add(plate);
    const lever = rb(0.12, 0.12, 0.7, 0.05, M.chrome, HEAD.x + 0.15, 4.6, Z0 + 0.45); lever.rotation.y = 0.5; add(lever);
    // hand towel hook + scrub brush on the side wall
    const loofah = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), RBX.plushMat('#ff8aa8', '#ffd0dc', 61, 1)); loofah.position.set(X0 + 0.42, 6.0, SH.z1 - 0.9); add(loofah); add(box(0.3, 0.1, 0.1, M.chrome, X0 + 0.15, 6.4, SH.z1 - 0.9)); }
  // ---------------- running water ----------------
  const water = new THREE.Group(); add(water);
  { const streakM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.88, 1.0), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    const r = rng(12), top = HEAD.y - 0.1, bot = SH.top + 0.02, geo = new THREE.CylinderGeometry(0.004, 0.007, 1, 5, 1, true);
    for (let i = 0; i < 110; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.45, spread = 1.0 + r() * 0.5;
      const p0 = V(HEAD.x + Math.cos(a) * rr, top, HEAD.z + Math.sin(a) * rr), p1 = V(HEAD.x + Math.cos(a) * rr * spread * 1.8, bot, HEAD.z + 0.2 + Math.sin(a) * rr * spread * 1.8);
      const segs = 2 + Math.floor(r() * 3); for (let k = 0; k < segs; k++) { const t0 = r() * 0.85, t1 = Math.min(1, t0 + 0.12 + r() * 0.35), a0 = p0.clone().lerp(p1, t0), a1 = p0.clone().lerp(p1, t1);
        const m = new THREE.Mesh(geo, streakM); m.position.copy(a0).lerp(a1, 0.5); m.scale.y = a0.distanceTo(a1); m.quaternion.setFromUnitVectors(V(0, 1, 0), a1.clone().sub(a0).normalize()); water.add(m); } }
    // droplets in the air and splash spray off the tray
    const N = 700, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { let x, y, z; if (i < 450) { const a = r() * 7, rr = Math.sqrt(r()) * 1.1, t = r(); x = HEAD.x + Math.cos(a) * rr * (0.4 + t); y = HEAD.y - 0.2 - t * (HEAD.y - 0.6); z = HEAD.z + 0.2 + Math.sin(a) * rr * (0.4 + t); }
      else { const a = r() * 7, rr = 0.3 + r() * 1.6; x = HEAD.x + Math.cos(a) * rr; y = SH.top + 0.05 + Math.pow(r(), 2) * 0.9; z = HEAD.z + 0.3 + Math.sin(a) * rr; }
      x = Math.max(SH.x0 + 0.1, Math.min(SH.x1 - 0.1, x)); z = Math.max(SH.z0 + 0.1, Math.min(SH.z1 - 0.1, z)); pos.set([x, y, z], i * 3); }
    const dc = cnv(32, 32), dg = dc.getContext('2d'), gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(220,240,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    water.add(new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.05, map: tex(dc), color: new THREE.Color(1.4, 1.6, 1.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 })));
    // splash rings on the tray
    const ringM = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.9, 1), transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 14; i++) { const a = r() * 7, rr = 0.2 + r() * 1.3, ring = new THREE.Mesh(new THREE.RingGeometry(0.06 + r() * 0.08, 0.1 + r() * 0.1, 20), ringM); ring.rotation.x = -Math.PI / 2; ring.position.set(HEAD.x + Math.cos(a) * rr, SH.top + 0.035, HEAD.z + 0.3 + Math.sin(a) * rr); water.add(ring); }
    // steam: soft sprites in the shower and spilling out the door
    const sc = cnv(128, 128), sg = sc.getContext('2d'), sgr = sg.createRadialGradient(64, 64, 0, 64, 64, 64); sgr.addColorStop(0, 'rgba(255,255,255,0.55)'); sgr.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = sgr; sg.fillRect(0, 0, 128, 128);
    const steamM = new THREE.SpriteMaterial({ map: tex(sc), color: '#e8f2f6', transparent: true, opacity: 0.22, depthWrite: false });
    for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(steamM); const sz = 2.5 + r() * 3; s.scale.set(sz, sz, 1); s.position.set(SH.x0 + 0.8 + r() * 4, 6.5 + r() * 4, SH.z0 + 0.6 + r() * 4.5); water.add(s); } }
  // ---------------- glass: fixed panel + door half open (hinge at the right post) ----------------
  const glassT = (() => { const c = cnv(256, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(240,248,250,0.75)'); gr.addColorStop(0.45, 'rgba(240,248,250,0.4)'); gr.addColorStop(1, 'rgba(240,248,250,0.12)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
    const r = rng(8); g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 26; i++) { const x = r() * 256, y = r() * 300; g.lineWidth = 2 + r() * 4; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + 60 + r() * 200); g.stroke(); }
    g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 900; i++) { const x = r() * 256, y = r() * 512, s = 0.4 + r() * 1.1; g.fillStyle = `rgba(255,255,255,${0.4 + r() * 0.5})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
    return tex(c); })();
  const glassM = new THREE.MeshPhysicalMaterial({ map: glassT, color: '#ffffff', transparent: true, roughness: 0.15, metalness: 0, clearcoat: 1, envMap: envT, envMapIntensity: 0.6, depthWrite: false, side: THREE.DoubleSide });
  const GH = 8.0, DW = 2.3, fixedW = (SH.x1 - SH.x0) - DW;
  { const p = new THREE.Mesh(new THREE.PlaneGeometry(fixedW, GH), glassM); p.position.set(SH.x0 + fixedW / 2, SH.top + GH / 2, SH.z1); p.renderOrder = 4; add(p);
    add(box(fixedW, 0.08, 0.1, M.chrome, SH.x0 + fixedW / 2, SH.top + 0.04, SH.z1), box(0.1, GH, 0.1, M.chrome, SH.x0 + fixedW, SH.top + GH / 2, SH.z1), box(0.1, 0.1, SH.z1 - SH.z0, M.chrome, SH.x0 + fixedW, SH.top + GH, (SH.z0 + SH.z1) / 2)); }
  const door = new THREE.Group(); door.position.set(SH.x1, SH.top, SH.z1); door.rotation.y = 0.95; add(door);
  { const p = new THREE.Mesh(new THREE.PlaneGeometry(DW, GH), glassM); p.position.set(-DW / 2, GH / 2, 0); p.renderOrder = 4; door.add(p);
    door.add(box(0.1, GH, 0.1, M.chrome, 0, GH / 2, 0), box(0.08, 1.4, 0.08, M.chrome, -DW + 0.25, 4.2, 0.18), box(0.06, 0.06, 0.22, M.chrome, -DW + 0.25, 3.6, 0.09), box(0.06, 0.06, 0.22, M.chrome, -DW + 0.25, 4.8, 0.09));
    [1.2, GH - 1.2].forEach((y) => door.add(box(0.12, 0.4, 0.14, M.chrome, 0.05, y, 0))); }
  add(box(0.12, GH + SH.top, 0.12, M.chrome, SH.x1 + 0.03, (GH + SH.top) / 2, SH.z1));
  // rubber duck on the tray edge
  { const duck = new THREE.Group(); duck.position.set(SH.x1 - 0.55, SH.top, SH.z1 - 0.45); duck.rotation.y = -2.3; add(duck);
    const y = new THREE.MeshPhysicalMaterial({ color: '#ffd332', roughness: 0.3, clearcoat: 0.8 });
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 14), y); b.scale.set(1, 0.75, 1.25); b.position.y = 0.24; duck.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 12), y); h.position.set(0, 0.6, 0.18); duck.add(h);
    const bk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 10), col('#f28a1e', 0.4)); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.57, 0.42); duck.add(bk);
    [-1, 1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), col('#111', 0.3)); e.position.set(s * 0.09, 0.66, 0.34); duck.add(e); }); }
  // ---------------- toilet, vanity + mirror, towels, mat, window ----------------
  { const T = new THREE.Group(); T.position.set(3.6, 0, Z0 + 0.1); add(T);
    T.add(rb(1.9, 1.5, 0.8, 0.12, M.porcelain, 0, 3.0, 0.45), rb(2.0, 0.15, 0.9, 0.06, M.porcelain, 0, 3.8, 0.45));
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.55, 1.3, 28), M.porcelain); bowl.scale.z = 1.3; bowl.position.set(0, 0.95, 1.6); T.add(bowl);
    T.add(rb(0.9, 0.9, 1.2, 0.2, M.porcelain, 0, 0.6, 1.0)); const seat = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.12, 10, 28), M.porcelain); seat.rotation.x = Math.PI / 2; seat.scale.y = 1.3; seat.position.set(0, 1.65, 1.6); T.add(seat);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.1, 28), M.porcelain); lid.scale.z = 1.25; lid.position.set(0, 1.72, 1.6); T.add(lid);
    T.add(box(0.3, 0.08, 0.1, M.chrome, -0.7, 3.5, 0.9));
    const pl = new THREE.Group(); pl.position.set(0.5, 3.88, 0.45); T.add(pl); ch(pl, new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.4, 14), col('#e86a3a', 0.7))).position.y = 0.2;
    for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), col('#3c8a3a', 0.6)); l.scale.set(0.4, 1.2, 0.2); const a = k * 0.9; l.position.set(Math.cos(a) * 0.15, 0.6 + (k % 2) * 0.15, Math.sin(a) * 0.15); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6); pl.add(l); }
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 18), col('#fbfbf6', 0.9)); roll.rotation.z = Math.PI / 2; roll.position.set(X1 - 0.45, 2.6, -3.0); add(roll); add(box(0.6, 0.06, 0.06, M.chrome, X1 - 0.3, 2.6, -3.0));
    // frosted window above the toilet
    const fw = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.7, 1.75) })); fw.position.set(3.6, 7.3, Z0 + 0.02); add(fw);
    add(box(2.9, 0.15, 0.2, M.trim, 3.6, 8.45, Z0 + 0.1), box(2.9, 0.15, 0.4, M.trim, 3.6, 6.15, Z0 + 0.2), box(0.15, 2.2, 0.2, M.trim, 2.22, 7.3, Z0 + 0.1), box(0.15, 2.2, 0.2, M.trim, 4.98, 7.3, Z0 + 0.1), box(2.6, 0.08, 0.1, M.trim, 3.6, 7.3, Z0 + 0.08)); }
  { // vanity on the right wall + mirror + sink
    const V0 = new THREE.Group(); V0.position.set(X1, 0, 1.6); add(V0);
    V0.add(rb(1.8, 2.8, 3.6, 0.05, M.wood, -0.9, 1.4, 0)); [-0.9, 0.9].forEach((dz) => { V0.add(box(0.05, 2.0, 1.6, M.trim, -1.82, 1.3, dz)); V0.add(box(0.06, 0.06, 0.4, M.chrome, -1.88, 2.0, dz + (dz < 0 ? 0.55 : -0.55))); });
    V0.add(rb(2.0, 0.2, 3.9, 0.04, M.porcelain, -1.0, 2.9, 0));
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.5, 0.3, 28), col('#dfe3e2', 0.2)); basin.scale.z = 1.3; basin.position.set(-1.0, 2.86, 0); V0.add(basin);
    const tap = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 10), M.chrome); tap.position.set(-0.3, 3.2, 0); V0.add(tap); const sp = box(0.5, 0.08, 0.08, M.chrome, -0.5, 3.48, 0); V0.add(sp);
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.6), new THREE.MeshStandardMaterial({ color: '#cfd8dc', roughness: 0.04, metalness: 1, envMap: envT, envMapIntensity: 1 })); mirror.rotation.y = -Math.PI / 2; mirror.position.set(-0.07, 6.6, 0); V0.add(mirror);
    V0.add(box(0.12, 3.9, 0.15, M.trim, -0.06, 6.6, 1.78), box(0.12, 3.9, 0.15, M.trim, -0.06, 6.6, -1.78), box(0.12, 0.15, 3.7, M.trim, -0.06, 8.55, 0), box(0.12, 0.15, 3.7, M.trim, -0.06, 4.65, 0));
    const fog = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.6), new THREE.MeshBasicMaterial({ map: glassT, transparent: true, opacity: 0.6, depthWrite: false })); fog.rotation.y = -Math.PI / 2; fog.position.set(-0.08, 6.6, 0); V0.add(fog);
    [['#3fa0c8', -1.1], ['#f2f2ee', -0.75]].forEach(([c, dz]) => V0.add(rb(0.3, 0.6, 0.3, 0.08, new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.25, clearcoat: 0.8 }), -0.5, 3.3, dz)));
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.35, 14), new THREE.MeshPhysicalMaterial({ color: '#e85a8a', roughness: 0.3 })); cup.position.set(-0.5, 3.18, 1.1); V0.add(cup);
    ['#2f6fd1', '#ffd332'].forEach((c, i) => { const b = box(0.05, 0.7, 0.05, col(c, 0.4), -0.5 + i * 0.05, 3.45, 1.1 + i * 0.05); b.rotation.z = (i - 0.5) * 0.3; V0.add(b); });
    ch(V0, new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(5, 4.4, 3.2) }))).position.set(-0.35, 9.1, 0); }
  // towels: bar on the left wall outside the shower + one thrown over the door
  { const tw = (a, b, s) => pbr(towelT(a, b, s).c, towelT(a, b, s).h, { rough: 1, bump: 4 });
    add(box(0.12, 0.12, 3.4, M.chrome, X0 + 0.35, 6.0, 1.4)); [-0.2, 3.0].forEach((z) => add(box(0.35, 0.12, 0.12, M.chrome, X0 + 0.17, 6.0, z)));
    [[0.4, '#e85a3a', '#f2c14e'], [2.2, '#3fa0c8', '#ffffff']].forEach(([z, a, b], i) => { const m = tw(a, b, 50 + i); add(rb(0.35, 3.4, 1.6, 0.12, m, X0 + 0.45, 4.35, z)); add(rb(0.45, 0.3, 1.62, 0.12, m, X0 + 0.35, 6.05, z)); });
    const t3 = tw('#7a5ac0', '#f4f0e6', 53); add(rb(1.4, 0.18, 1.0, 0.08, t3, 4.6, 2.98, 0.6)); add(rb(1.3, 0.16, 0.9, 0.08, t3, 4.65, 3.15, 0.6));
    // bath mat
    const mat = new THREE.Mesh(RBX.rbox(3.0, 0.08, 2.0, 0.04), RBX.plushMat('#5bb3a6', '#cff0ea', 64, 2)); mat.position.set(SHX + 0.6, 0.04, 0.4); add(mat);
    // laundry basket with a few socks
    const LB = new THREE.Group(); LB.position.set(-4.4, 0, 5.0); LB.scale.setScalar(0.72); add(LB); const wick = woodPlanks(256, 81, { rows: 8, tones: ['#c9a26a', '#b88f58'] });
    ch(LB, new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.85, 2.0, 24, 1, true), Object.assign(pbr(wick.c, wick.h, { rough: 0.9, bump: 4 }), { side: THREE.DoubleSide }))).position.y = 1.0;
    ch(LB, new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 24), col('#b88f58', 0.9))).position.y = 0.05;
    ch(LB, new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 10), RBX.plushMat('#f2f0ea', '#ffffff', 66, 1))).position.set(0, 1.7, 0);
    const s1 = SOCKS.one('stripe', 0.55); s1.position.set(0.5, 2.2, 0.6); s1.rotation.set(1.2, 0.4, 0.3); LB.add(s1); const s2 = SOCKS.one('dots', 0.55); s2.position.set(0.2, 2.5, 0.4); s2.rotation.set(0.6, -0.8, 1.6); LB.add(s2); }
  // back wall between shower and toilet: shelf with folded towels + candle + small plant, heated towel rail, framed print
  { const sx = 0.6; add(rb(2.4, 0.14, 0.8, 0.03, M.wood, sx, 6.4, Z0 + 0.4));
    [['#f2f0ea', 0], ['#5bb3a6', 1], ['#f2f0ea', 2]].forEach(([c, i]) => add(rb(1.0, 0.28, 0.65, 0.1, RBX.plushMat(c, '#ffffff', 70 + i, 1), sx - 0.6, 6.61 + i * 0.29, Z0 + 0.42)));
    const cnd = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.4, 16), col('#f4ead6', 0.8)); cnd.position.set(sx + 0.5, 6.67, Z0 + 0.4); add(cnd);
    const pt = new THREE.Group(); pt.position.set(sx + 0.95, 6.47, Z0 + 0.4); add(pt); ch(pt, new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.36, 14), M.porcelain)).position.y = 0.18;
    for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), col('#3c8a3a', 0.6)); l.scale.set(0.35, 1.0, 0.2); const a = k * 1.05; l.position.set(Math.cos(a) * 0.12, 0.5, Math.sin(a) * 0.12); l.rotation.set(Math.sin(a) * 0.7, a, Math.cos(a) * 0.7); pt.add(l); }
    for (let k = 0; k < 6; k++) add(box(1.8, 0.1, 0.1, M.chrome, sx, 1.4 + k * 0.42, Z0 + 0.35)); [-0.9, 0.9].forEach((dx) => add(box(0.12, 2.5, 0.12, M.chrome, sx + dx, 2.45, Z0 + 0.35)));
    add(rb(1.3, 1.6, 0.25, 0.08, RBX.plushMat('#e85a3a', '#ffd0c0', 74, 1), sx, 2.6, Z0 + 0.5));
    const pr = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), new THREE.MeshStandardMaterial({ roughness: 0.4, map: KIT.textTex(256, 320, (g, w, h) => { g.fillStyle = '#f4ecdc'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd332'; g.beginPath(); g.ellipse(128, 200, 70, 50, 0, 0, 7); g.fill(); g.beginPath(); g.arc(170, 140, 36, 0, 7); g.fill(); g.fillStyle = '#f28a1e'; g.beginPath(); g.moveTo(200, 140); g.lineTo(236, 150); g.lineTo(200, 158); g.fill(); g.fillStyle = '#3fa0c8'; g.fillRect(0, 240, w, 80); }) }));
    pr.position.set(sx, 8.7, Z0 + 0.09); add(pr); add(box(1.45, 1.75, 0.08, M.wood, sx, 8.7, Z0 + 0.02)); }
  // ceiling light
  { add(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 24), M.chrome)).position.set(0, RH - 0.05, 1.0);
    add(new THREE.Mesh(new THREE.SphereGeometry(0.8, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), new THREE.MeshBasicMaterial({ color: new THREE.Color(4.5, 4.3, 4.0) }))).position.set(0, RH - 0.1, 1.0); }

  // ---------------- lights ----------------
  shadow(room);
  room.traverse((m) => { if (m.isMesh && m.material && (m.material.isMeshBasicMaterial || m.material.transparent)) { m.castShadow = false; } });
  water.traverse((m) => { m.castShadow = false; m.receiveShadow = false; });
  scene.add(new THREE.HemisphereLight('#eaf4ff', '#7a8a90', 2.0));
  const key = new THREE.SpotLight('#fff1dc', 380, 0, 0.95, 0.7, 2); key.position.set(0, RH - 0.4, 1.0); key.target.position.set(-1.5, 0, -2.5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0008; key.shadow.radius = 4; scene.add(key, key.target);
  const showerL = new THREE.SpotLight('#eef6ff', 160, 0, 0.7, 0.8, 2); showerL.position.set(SHX + 0.3, RH - 0.6, SHZ); showerL.target.position.set(SHX, 0, SHZ); showerL.castShadow = true; showerL.shadow.mapSize.set(1024, 1024); showerL.shadow.bias = -0.001; showerL.shadow.radius = 5; scene.add(showerL, showerL.target);
  const winL = new THREE.PointLight('#dff0ff', 40, 0, 2); winL.position.set(3.6, 7.3, Z0 + 1.5); scene.add(winL);
  const vanL = new THREE.PointLight('#ffd9a8', 22, 0, 2); vanL.position.set(X1 - 1.2, 8.6, 1.6); scene.add(vanL);
  const fill = new THREE.PointLight('#ffffff', 25, 0, 2); fill.position.set(0, 5, 8); scene.add(fill);
  const lowFill = new THREE.PointLight('#cfe6ff', 6, 0, 2); lowFill.position.set(SHX + 1.4, 1.4, SH.z1 + 0.8); scene.add(lowFill);

  return {
    scene, grade: 'day',
    marks: {
      p_shower: { p: [SHX, SH.top, SHZ], ry: 0 },                                  // person standing under the shower, facing out (+z)
      m_tray: { p: [(SH.x0 + SH.x1) / 2, SH.top, (SH.z0 + SH.z1) / 2] }, m_drain: { p: [SHX + 0.4, SH.top, SHZ + 0.95] },
      m_head: { p: [HEAD.x, HEAD.y, HEAD.z] }, m_duck: { p: [SH.x1 - 0.55, SH.top, SH.z1 - 0.45] },
    },
    props: { water, door, mirror: null, key, showerL, setWater(on) { water.visible = !!on; } },
    mood(name) { if (name === 'day') water.visible = true; },
    views: {
      wide: { p: [3.2, 6.2, 8.6], l: [-1.2, 3.6, -3.5], fov: 64, mood: 'day' },
      feet: { p: [SHX + 0.8, 1.3, -0.6], l: [SHX, 0.45, SHZ + 0.2], fov: 50, mood: 'day' },
      shower: { p: [SHX + 1.2, 4.6, 2.6], l: [SHX, 4.0, SHZ], fov: 58, mood: 'day' },
      vanity: { p: [-2.5, 5.2, 6.5], l: [X1 - 1.5, 4.2, 0.5], fov: 55, mood: 'day' },
    },
  };
};

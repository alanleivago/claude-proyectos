// rbx-sock HOSPITAL: tiny maternity-room corner. Pale green walls with a bumper rail, speckled vinyl floor, window with
// half-open blinds and daylight slats, "MATERNITY" wall sign, clear hospital bassinet with a striped receiving blanket,
// a steel cart with a basket of tiny baby socks + a knit baby hat, bed corner, IV pole, privacy curtain, headwall outlets.
'use strict';
SETS.hospital = async function (ctx) {
  const { cnv, tex, pbr, rng, tnoise } = RBX;
  const { V, texPair, noiseOver, woodPlanks, box, rb, wm, shadow } = KIT;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#05060c');
  const room = new THREE.Group(); scene.add(room);
  const add = (...o) => { o.forEach((k) => room.add(k)); return o[0]; };
  const ch = (par, m) => { par.add(m); return m; };
  const X0 = -7, X1 = 7, Z0 = -6, ZF = 9, RH = 11, WT = 0.5;
  const WIN = { x0: 0.2, x1: 5.6, y0: 3.6, y1: 8.6 };
  const BS = { x: -0.4, z: -1.0, y: 3.1 };                         // bassinet: mattress top y
  const CART = { x: 2.9, z: -1.2, y: 3.2 };

  // ---------------- textures ----------------
  const paintT = texPair(256, (g, hg, S) => { g.fillStyle = '#bcd8bf'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 9, 0.08, 8, 4); const n = tnoise(6, 64), im = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) im.data[i * 4] = 110 + n((i % S) / S, Math.floor(i / S) / S) * 50; hg.putImageData(im, 0, 0); });
  const vinylT = texPair(512, (g, hg, S) => { g.fillStyle = '#e4e0d6'; g.fillRect(0, 0, S, S); const r = rng(5);
    for (let i = 0; i < 9000; i++) { const c = r(); g.fillStyle = c < 0.4 ? 'rgba(120,130,125,0.5)' : c < 0.7 ? 'rgba(90,150,140,0.45)' : 'rgba(200,190,170,0.6)'; g.fillRect(r() * S, r() * S, 1 + r() * 2.5, 1 + r() * 2.5); }
    noiseOver(g, S, S, 11, 0.08, 4, 3); g.fillStyle = 'rgba(110,110,100,0.6)'; g.fillRect(0, 0, S, 2); g.fillRect(0, 0, 2, S); hg.fillStyle = '#404040'; hg.fillRect(0, 0, S, 3); hg.fillRect(0, 0, 3, S);
    g.fillStyle = 'rgba(90,150,140,0.25)'; g.fillRect(0, S / 2 - 1, S, 2); });
  const blanketT = texPair(256, (g, hg, S) => { g.fillStyle = '#f6f3ec'; g.fillRect(0, 0, S, S);   // classic hospital receiving blanket
    [[20, '#6aa8e0', 14], [40, '#e86a8a', 8], [54, '#6aa8e0', 5], [S - 74, '#6aa8e0', 5], [S - 64, '#e86a8a', 8], [S - 46, '#6aa8e0', 14]].forEach(([o, c, w]) => { g.fillStyle = c; g.fillRect(0, o, S, w); });
    noiseOver(g, S, S, 21, 0.12, 32, 3); for (let y = 0; y < S; y += 3) { hg.fillStyle = y % 6 ? '#a0a0a0' : '#606060'; hg.fillRect(0, y, S, 1.5); } });
  const curtT = texPair(256, (g, hg, S) => { g.fillStyle = '#d7e8ee'; g.fillRect(0, 0, S, S); const r = rng(4);
    for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S; g.fillStyle = ['#7fb8d0', '#f2b0b8', '#b8d8a0'][i % 3]; g.beginPath(); g.moveTo(x, y - 8); g.lineTo(x + 8, y); g.lineTo(x, y + 8); g.lineTo(x - 8, y); g.fill(); }
    noiseOver(g, S, S, 23, 0.12, 16, 3); });
  const wickT = woodPlanks(256, 81, { rows: 8, tones: ['#d6b47a', '#c4a068'] });
  const skyT = (() => { const c = cnv(1024, 1024), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#6fb0f2'); gr.addColorStop(0.7, '#d6ecff'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    const r = rng(9); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.85)'; const x = r() * 1024, y = 80 + r() * 260; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + k * 34, y + Math.sin(k) * 10, 30 + r() * 20, 0, 7); g.fill(); } }
    for (let i = 0; i < 9; i++) { const w = 80 + r() * 120, h = 200 + r() * 300, x = i * 120 - 40; g.fillStyle = ['#b8c4d0', '#a8b4c4', '#c8d0d8'][i % 3]; g.fillRect(x, 1024 - h - 120, w, h); g.fillStyle = 'rgba(120,160,200,0.6)'; for (let yy = 1024 - h - 100; yy < 900; yy += 30) for (let xx = x + 10; xx < x + w - 10; xx += 22) g.fillRect(xx, yy, 12, 16); }
    g.fillStyle = '#5a9a4a'; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(i * 95, 940, 60 + r() * 30, 0, 7); g.fill(); } return tex(c); })();
  const envT = (() => { const c = cnv(512, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#f4f8f8'); gr.addColorStop(0.5, '#b8ccc0'); gr.addColorStop(1, '#707870'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); g.fillStyle = '#fff'; g.fillRect(140, 50, 80, 50); g.fillRect(360, 20, 120, 20); const t = tex(c); t.mapping = THREE.EquirectangularReflectionMapping; return t; })();
  const M = {
    paint: pbr(paintT.c, paintT.h, { rough: 0.8, bump: 1.5, repeat: [1 / 4, 1 / 4] }),
    vinyl: pbr(vinylT.c, vinylT.h, { rough: 0.25, bump: 2, repeat: [1 / 3, 1 / 3] }),
    blanket: pbr(blanketT.c, blanketT.h, { rough: 0.95, bump: 3 }),
    curtain: pbr(curtT.c, null, { rough: 0.95 }),
    steel: new THREE.MeshStandardMaterial({ color: '#d4d8dc', roughness: 0.22, metalness: 0.9, envMap: envT }),
    white: new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 0.4 }),
    plastic: new THREE.MeshPhysicalMaterial({ color: '#eef0ee', roughness: 0.3, clearcoat: 0.6, envMap: envT, envMapIntensity: 0.5 }),
    rail: new THREE.MeshStandardMaterial({ color: '#c49a62', roughness: 0.4 }),
    acrylic: new THREE.MeshPhysicalMaterial({ color: '#e8f4f6', roughness: 0.05, transparent: true, opacity: 0.28, envMap: envT, envMapIntensity: 1.0, depthWrite: false, side: THREE.DoubleSide }),
    shell: new THREE.MeshStandardMaterial({ color: '#0b0e1c', roughness: 1 }),
    ceil: new THREE.MeshStandardMaterial({ color: '#f0f0ea', roughness: 0.9 }),
    black: new THREE.MeshStandardMaterial({ color: '#1a1c20', roughness: 0.4 }),
  };
  M.vinyl.envMap = envT; M.vinyl.envMapIntensity = 0.35;
  const colM = {}, col = (c, r = 0.6) => colM[c + r] || (colM[c + r] = new THREE.MeshStandardMaterial({ color: c, roughness: r }));

  // ---------------- shell ----------------
  { const fl = new THREE.PlaneGeometry(X1 - X0, ZF - Z0), uv = fl.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (X1 - X0), uv.getY(i) * (ZF - Z0));
    const f = new THREE.Mesh(fl, M.vinyl); f.rotation.x = -Math.PI / 2; f.position.set(0, 0, (Z0 + ZF) / 2); add(f); }
  { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(X1 - X0, 0); sh.lineTo(X1 - X0, RH); sh.lineTo(0, RH); sh.closePath();
    const h = new THREE.Path(); h.moveTo(WIN.x0 - X0, WIN.y0); h.lineTo(WIN.x0 - X0, WIN.y1); h.lineTo(WIN.x1 - X0, WIN.y1); h.lineTo(WIN.x1 - X0, WIN.y0); h.closePath(); sh.holes.push(h);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: WT, bevelEnabled: false }), M.paint); back.position.set(X0, 0, Z0 - WT); add(back); }
  { const L = ZF - Z0; [[X0, Math.PI / 2], [X1, -Math.PI / 2]].forEach(([x, ry]) => { const g = new THREE.PlaneGeometry(L, RH), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L, uv.getY(i) * RH);
    const m = new THREE.Mesh(g, M.paint); m.rotation.y = ry; m.position.set(x, RH / 2, (Z0 + ZF) / 2); add(m); add(box(0.4, RH, L + 1, M.shell, x + Math.sign(x) * 0.22, RH / 2, (Z0 + ZF) / 2)); }); }
  add(box(X1 - X0 + 1, 0.4, ZF - Z0 + 1, M.ceil, 0, RH + 0.2, (Z0 + ZF) / 2));
  // acoustic ceiling grid + light panels
  for (let x = X0 + 2; x < X1; x += 2) add(box(0.06, 0.05, ZF - Z0, M.white, x, RH - 0.03, (Z0 + ZF) / 2));
  for (let z = Z0 + 2; z < ZF; z += 2) add(box(X1 - X0, 0.05, 0.06, M.white, 0, RH - 0.03, z));
  const panelM = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 3.3, 3.3) });
  [[-1, 0], [3, 3]].forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 3.9), panelM); p.rotation.x = Math.PI / 2; p.position.set(x, RH - 0.06, z); add(p); });
  // cove base + bumper rail (wood) on all walls
  const runX = (z, s) => { add(box(X1 - X0, 0.5, 0.1, col('#5a8a74', 0.4), 0, 0.25, z + s * 0.05), box(X1 - X0, 0.35, 0.18, M.rail, 0, 3.2, z + s * 0.09), box(X1 - X0, 0.12, 0.1, M.white, 0, 3.0, z + s * 0.05)); };
  runX(Z0, 1);
  [[X0, 1], [X1, -1]].forEach(([x, s]) => add(box(0.1, 0.5, ZF - Z0, col('#5a8a74', 0.4), x + s * 0.05, 0.25, (Z0 + ZF) / 2), box(0.18, 0.35, ZF - Z0, M.rail, x + s * 0.09, 3.2, (Z0 + ZF) / 2), box(0.1, 0.12, ZF - Z0, M.white, x + s * 0.05, 3.0, (Z0 + ZF) / 2)));
  // ---------------- window + blinds + sky ----------------
  { const T = 0.28, cx = (WIN.x0 + WIN.x1) / 2, cy = (WIN.y0 + WIN.y1) / 2, w = WIN.x1 - WIN.x0, h = WIN.y1 - WIN.y0;
    add(box(w + 2 * T, T, 0.2, M.white, cx, WIN.y1 + T / 2, Z0 + 0.1), box(T, h, 0.2, M.white, WIN.x0 - T / 2, cy, Z0 + 0.1), box(T, h, 0.2, M.white, WIN.x1 + T / 2, cy, Z0 + 0.1), box(w + 2 * T + 0.3, 0.16, 0.6, M.white, cx, WIN.y0 - 0.08, Z0 + 0.2));
    add(box(0.1, h, 0.1, M.white, cx, cy, Z0 - 0.25));
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(22, 16), new THREE.MeshBasicMaterial({ map: skyT })); sky.material.color.setScalar(1.15); sky.position.set(cx, 6, Z0 - 7); add(sky);
    // blinds: head rail + slats over the top 60 %, tilted half open
    add(box(w + 0.2, 0.3, 0.3, M.white, cx, WIN.y1 - 0.15, Z0 + 0.3));
    const slatG = new THREE.BoxGeometry(w + 0.1, 0.03, 0.22), slatM = new THREE.MeshStandardMaterial({ color: '#f4f2ea', roughness: 0.5 });
    const blinds = new THREE.Group(); add(blinds);
    for (let y = WIN.y1 - 0.42, k = 0; y > WIN.y0 + h * 0.38; y -= 0.17, k++) { const s = new THREE.Mesh(slatG, slatM); s.position.set(cx, y, Z0 + 0.32); s.rotation.x = 0.55; blinds.add(s); }
    const bottom = box(w + 0.15, 0.08, 0.25, M.white, cx, WIN.y0 + h * 0.38 - 0.05, Z0 + 0.32); blinds.add(bottom);
    [cx - w / 2 + 0.6, cx + w / 2 - 0.6].forEach((x) => add(box(0.02, h * 0.62, 0.02, col('#e0ddd0', 0.6), x, WIN.y1 - h * 0.31, Z0 + 0.32)));
    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 8), M.plastic); wand.position.set(WIN.x1 - 0.2, WIN.y1 - 1.4, Z0 + 0.45); add(wand); }
  // ---------------- MATERNITY sign + headwall on the left wall ----------------
  { const t = KIT.textTex(1024, 300, (g, w, h) => { g.fillStyle = '#ffffff'; const r = 40; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, h, r); g.arcTo(w, h, 0, h, r); g.arcTo(0, h, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill();
      g.fillStyle = '#e86a8a'; g.fillRect(0, h - 46, w, 20); g.fillStyle = '#6aa8e0'; g.fillRect(0, h - 26, w, 14);
      g.fillStyle = '#2a4a6a'; g.font = 'bold 124px "Arial Black", "Helvetica Neue", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MATERNITY', w / 2 + 80, h / 2 - 16);
      g.fillStyle = '#e86a8a'; g.beginPath(); g.moveTo(90, 120); g.bezierCurveTo(90, 70, 160, 70, 160, 120); g.bezierCurveTo(160, 160, 110, 180, 90, 210); g.bezierCurveTo(70, 180, 20, 160, 20, 120); g.bezierCurveTo(20, 70, 90, 70, 90, 120); g.fill();
      g.fillStyle = '#ffffff'; g.font = 'bold 60px sans-serif'; g.fillText('+', 90, 132); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.58), new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, transparent: true })); sign.rotation.y = Math.PI / 2; sign.position.set(X0 + 0.08, 8.6, -1.6); add(sign);
    add(box(0.06, 1.7, 5.5, col('#c9dccb', 0.6), X0 + 0.03, 8.6, -1.6));
    // headwall: outlets strip
    const hw = box(0.25, 1.2, 4.2, M.plastic, X0 + 0.14, 5.2, 2.4); add(hw);
    [[0.9, '#2fa04a'], [1.6, '#2fa04a'], [2.6, '#ffffff'], [3.3, '#f2c14e']].forEach(([dz, c]) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.1, 16), col(c, 0.4)); o.rotation.z = Math.PI / 2; o.position.set(X0 + 0.3, 5.3, 0.3 + dz); add(o); });
    add(box(0.12, 0.5, 0.8, M.plastic, X0 + 0.2, 5.0, 4.0)); const lamp = box(0.08, 0.2, 3.6, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 2.1, 1.9) }), X0 + 0.3, 5.75, 2.4); add(lamp);
    // sanitizer + clock + poster
    add(rb(0.4, 0.8, 0.5, 0.06, M.plastic, X0 + 0.25, 4.6, -4.6), box(0.1, 0.1, 0.25, M.black, X0 + 0.5, 4.2, -4.6));
    const ck = KIT.textTex(256, 256, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.strokeStyle = '#222'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.fillRect(128 + Math.cos(a) * 100 - 4, 128 + Math.sin(a) * 100 - 4, 8, 8); } g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 50, 128 - 30); g.moveTo(128, 128); g.lineTo(128 - 10, 40); g.stroke(); });
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), new THREE.MeshStandardMaterial({ map: ck, roughness: 0.3 })); clock.position.set(-3.8, 8.6, Z0 + 0.06); add(clock);
    const cr = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.07, 8, 32), M.black); cr.position.set(-3.8, 8.6, Z0 + 0.07); add(cr);
    const po = KIT.textTex(256, 340, (g, w, h) => { g.fillStyle = '#fff6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#e86a8a'; g.font = 'bold 34px "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('WASH', 128, 60); g.fillText('YOUR', 128, 100); g.fillText('HANDS', 128, 140);
      g.fillStyle = '#6aa8e0'; [[90, 230], [166, 230]].forEach(([x, y]) => { g.fillRect(x - 26, y - 40, 52, 80); }); g.fillStyle = '#ffffff'; for (let i = 0; i < 10; i++) { g.beginPath(); g.arc(60 + i * 15, 300 - (i % 3) * 10, 8, 0, 7); g.fill(); g.strokeStyle = '#9ac8e8'; g.stroke(); } });
    const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.86), new THREE.MeshStandardMaterial({ map: po, roughness: 0.5 })); poster.position.set(-1.9, 6.4, Z0 + 0.06); add(poster); }
  // ---------------- bassinet ----------------
  const bassinet = new THREE.Group(); bassinet.position.set(BS.x, 0, BS.z); add(bassinet);
  { const L = 2.6, Wd = 1.6, H = 0.85, by = BS.y - 0.15;
    // cart frame
    bassinet.add(rb(L - 0.2, 0.12, Wd - 0.2, 0.04, M.steel, 0, by - 0.1, 0), rb(L - 0.3, 0.1, Wd - 0.3, 0.03, M.steel, 0, 0.7, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { bassinet.add(box(0.1, by - 0.4, 0.1, M.steel, sx * (L / 2 - 0.25), (by - 0.4) / 2 + 0.3, sz * (Wd / 2 - 0.2)));
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.1, 14), M.black); w.rotation.x = Math.PI / 2; w.position.set(sx * (L / 2 - 0.25), 0.14, sz * (Wd / 2 - 0.2)); bassinet.add(w); bassinet.add(box(0.1, 0.12, 0.12, M.steel, sx * (L / 2 - 0.25), 0.3, sz * (Wd / 2 - 0.2))); });
    bassinet.add(rb(1.4, 0.5, 1.0, 0.05, M.plastic, 0.3, 1.05, 0));  // drawer
    bassinet.add(box(0.5, 0.05, 0.05, M.steel, 0.3, 1.0, 0.52));
    // clear tub (open top)
    const tub = new THREE.Group(); tub.position.y = by; bassinet.add(tub);
    tub.add(box(L, 0.06, Wd, M.acrylic, 0, 0.03, 0)); [[0, Wd / 2, L, 0.06], [0, -Wd / 2, L, 0.06]].forEach(([x, z, w, d]) => tub.add(box(w, H, d, M.acrylic, x, H / 2, z))); [L / 2, -L / 2].forEach((x) => tub.add(box(0.06, H, Wd, M.acrylic, x, H / 2, 0)));
    [[0, Wd / 2], [0, -Wd / 2]].forEach(([x, z]) => tub.add(box(L + 0.06, 0.07, 0.1, M.plastic, x, H, z))); [L / 2, -L / 2].forEach((x) => tub.add(box(0.1, 0.07, Wd + 0.06, M.plastic, x, H, 0)));
    // mattress + blanket (folded, one corner turned down) + a little pillow roll
    tub.add(rb(L - 0.14, 0.18, Wd - 0.14, 0.06, M.white, 0, 0.15, 0));
    const bl = rb(L - 0.3, 0.12, Wd - 0.2, 0.06, M.blanket, -0.2, 0.3, 0); tub.add(bl);
    const fold = rb(0.6, 0.1, Wd - 0.22, 0.05, M.blanket, -0.9, 0.4, 0); fold.rotation.z = 0.12; tub.add(fold);
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, Wd - 0.4, 14), M.blanket); roll.rotation.x = Math.PI / 2; roll.position.set(0.95, 0.42, 0); tub.add(roll);
    // name card on the front
    const nt = KIT.textTex(256, 160, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#6aa8e0'; g.fillRect(0, 0, w, 36); g.fillStyle = '#ffffff'; g.font = 'bold 26px sans-serif'; g.textAlign = 'center'; g.fillText("IT'S A...", w / 2, 27);
      g.fillStyle = '#2a4a6a'; g.font = 'bold 56px "Marker Felt", "Comic Sans MS", sans-serif'; g.fillText('BABY!', w / 2, 100); g.font = '22px sans-serif'; g.fillText('7 lb 2 oz', w / 2, 140); });
    const card = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.47), new THREE.MeshStandardMaterial({ map: nt, roughness: 0.4 })); card.position.set(0.5, H * 0.62, Wd / 2 + 0.04); tub.add(card);
  }
  // ---------------- cart: basket of tiny baby socks + knit hat ----------------
  const cart = new THREE.Group(); cart.position.set(CART.x, 0, CART.z); add(cart);
  const sockBasket = new THREE.Group(), babyHat = new THREE.Group();
  { cart.add(rb(1.9, 0.12, 1.4, 0.04, M.steel, 0, CART.y - 0.06, 0), rb(1.9, 0.08, 1.4, 0.04, M.steel, 0, 1.2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { cart.add(box(0.08, CART.y - 0.3, 0.08, M.steel, sx * 0.88, (CART.y - 0.3) / 2 + 0.25, sz * 0.63)); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 12), M.black); w.rotation.x = Math.PI / 2; w.position.set(sx * 0.88, 0.11, sz * 0.63); cart.add(w); });
    [[-1, 0.62], [1, 0.62]].forEach(([s]) => cart.add(box(1.9, 0.06, 0.06, M.steel, 0, CART.y + 0.18, s * 0.7)));
    // lower shelf: stacked diapers + bottle
    for (let k = 0; k < 4; k++) cart.add(rb(0.6, 0.18, 0.5, 0.06, col(k % 2 ? '#ffffff' : '#e8f2fa', 0.8), -0.45, 1.33 + k * 0.19, 0));
    const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 14), M.acrylic); bot.position.set(0.4, 1.54, 0.1); cart.add(bot); const nip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.2, 12), col('#f0c890', 0.4)); nip.position.set(0.4, 1.94, 0.1); cart.add(nip);
    // the basket
    sockBasket.position.set(-0.35, CART.y, 0); cart.add(sockBasket);
    const wm2 = pbr(wickT.c, wickT.h, { rough: 0.9, bump: 4 }); wm2.side = THREE.DoubleSide;
    ch(sockBasket, new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.42, 20, 1, true), wm2)).position.y = 0.21;
    ch(sockBasket, new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.04, 20), wm2)).position.y = 0.02;
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.04, 6, 24), col('#c4a068', 0.8)); rim.rotation.x = Math.PI / 2; rim.position.y = 0.42; sockBasket.add(rim);
    const r = rng(17), kinds = ['baby', 'baby', 'duck', 'baby', 'knit', 'baby'];
    for (let i = 0; i < 22; i++) { const s = SOCKS.one(kinds[i % kinds.length], 0.12 + r() * 0.02); const a = r() * 7, rr = Math.sqrt(r()) * 0.38; s.position.set(Math.cos(a) * rr, 0.32 + r() * 0.12 + (i > 9 ? 0.06 : 0), Math.sin(a) * rr); s.rotation.set(1.2 + (r() - 0.5) * 0.9, r() * 7, (r() - 0.5) * 1.2); sockBasket.add(s); }
    // a pair laid out on the cart top + the knit hat
    [[0.42, 0.42], [0.62, 0.38]].forEach(([x, z], i) => { const s = SOCKS.lying('baby', 0.14, -0.3 + i * 0.15); s.position.set(x, CART.y, z - 0.1); cart.add(s); });
    babyHat.position.set(0.5, CART.y, -0.35); babyHat.scale.setScalar(0.75); cart.add(babyHat);
    const hatT = texPair(256, (g, hg, S) => { g.fillStyle = '#f6f3ec'; g.fillRect(0, 0, S, S); [[60, '#6aa8e0'], [96, '#e86a8a'], [132, '#6aa8e0']].forEach(([y, c]) => { g.fillStyle = c; g.fillRect(0, y, S, 18); }); for (let x = 0; x < S; x += 6) { hg.fillStyle = '#505050'; hg.fillRect(x, 0, 2, S); } noiseOver(g, S, S, 31, 0.1, 16, 3); });
    const hatM = pbr(hatT.c, hatT.h, { rough: 0.95, bump: 3 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), hatM); dome.scale.y = 1.15; dome.position.y = 0.12; babyHat.add(dome);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.335, 0.335, 0.14, 24, 1, true), hatM); cuff.position.y = 0.07; babyHat.add(cuff);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), RBX.plushMat('#e86a8a', '#ffd0dc', 77, 1)); knot.position.y = 0.5; babyHat.add(knot);
    // sanitizer bottle + glove box on the cart
    cart.add(rb(0.6, 0.35, 0.35, 0.03, col('#7fb8d0', 0.6), -0.6, CART.y + 0.18, 0.45));
  }
  // ---------------- bed corner, IV pole, curtain, chair ----------------
  { const bed = new THREE.Group(); bed.position.set(-5.2, 0, 2.8); add(bed);
    bed.add(rb(3.4, 0.6, 7.0, 0.1, M.plastic, 0, 2.3, 0), rb(3.2, 0.45, 6.8, 0.2, col('#f6f6f2', 0.9), 0, 2.82, 0), rb(3.25, 0.25, 4.6, 0.12, M.blanket, 0, 3.1, 1.0), rb(1.8, 0.4, 1.0, 0.2, col('#ffffff', 0.9), 0, 3.25, -2.7));
    bed.add(box(3.2, 1.6, 0.25, M.plastic, 0, 3.0, -3.5)); bed.add(box(2.0, 1.2, 0.1, M.steel, 1.75, 3.4, 0.5)); for (let k = 0; k < 4; k++) bed.add(box(0.06, 1.0, 0.06, M.steel, 1.78, 3.2, -0.3 + k * 0.55));
    bed.add(box(2.9, 0.4, 6.4, M.steel, 0, 1.2, 0)); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { bed.add(box(0.2, 1.8, 0.2, M.steel, sx * 1.4, 1.0, sz * 3.1)); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.14, 14), M.black); w.rotation.x = Math.PI / 2; w.position.set(sx * 1.4, 0.2, sz * 3.1); bed.add(w); });
    // IV pole
    const iv = new THREE.Group(); iv.position.set(-2.6, 0, -3.6); add(iv); iv.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 8.5, 8), M.steel)); iv.children[0].position.y = 4.4;
    for (let k = 0; k < 5; k++) { const a = k * 1.256, l = box(0.9, 0.06, 0.08, M.steel, Math.cos(a) * 0.45, 0.25, Math.sin(a) * 0.45); l.rotation.y = -a; iv.add(l); const w = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), M.black); w.position.set(Math.cos(a) * 0.88, 0.09, Math.sin(a) * 0.88); iv.add(w); }
    iv.add(box(0.8, 0.05, 0.05, M.steel, 0, 8.6, 0)); const bag = new THREE.Mesh(RBX.rbox(0.5, 0.8, 0.15, 0.06, 6), new THREE.MeshPhysicalMaterial({ color: '#e8f4ff', roughness: 0.1, transparent: true, opacity: 0.6, clearcoat: 1 })); bag.position.set(0.35, 8.0, 0); iv.add(bag);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0.35, 7.6, 0), V(0.4, 6.0, 0.2), V(-0.3, 4.4, 0.8), V(-1.0, 3.3, 1.6)]), 30, 0.02, 6), M.acrylic); iv.add(tube);
    // privacy curtain on a ceiling track (bunched at the left)
    add(box(0.12, 0.12, ZF - Z0 - 2, M.steel, -2.4, RH - 0.4, (Z0 + ZF) / 2 + 1));
    const geo = new THREE.PlaneGeometry(4.2, RH - 2.4, 60, 6), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, 0.28 * Math.sin(x * 6.5) + 0.05 * Math.sin(x * 17)); } geo.computeVertexNormals();
    const cur = new THREE.Mesh(geo, M.curtain); cur.material.side = THREE.DoubleSide; cur.rotation.y = Math.PI / 2; cur.position.set(-2.4, (RH - 2.4) / 2 + 1.6, 5.6); add(cur);
    add(box(0.1, 0.9, 4.2, col('#e8eef0', 0.6), -2.4, RH - 0.85, 5.6));
    // visitor chair
    const chair = new THREE.Group(); chair.position.set(4.8, 0, 3.6); chair.rotation.y = -0.5; add(chair); const vin = col('#3f7f8f', 0.45);
    chair.add(rb(2.4, 0.6, 2.2, 0.15, vin, 0, 1.8, 0), rb(2.4, 2.4, 0.5, 0.15, vin, 0, 3.2, -1.0), rb(0.4, 1.0, 2.2, 0.1, M.steel, -1.3, 2.2, 0), rb(0.4, 1.0, 2.2, 0.1, M.steel, 1.3, 2.2, 0));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => chair.add(box(0.12, 1.5, 0.12, M.steel, sx * 1.0, 0.75, sz * 0.9)));
    // balloons + flowers on the windowsill
    const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.7, 14), M.acrylic); vase.position.set(1.0, WIN.y0 + 0.35, Z0 + 0.35); add(vase);
    ['#e86a8a', '#f2c14e', '#ffffff', '#e86a8a', '#b48ad8'].forEach((c, i) => { const f = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), col(c, 0.7)); f.position.set(1.0 + (i - 2) * 0.16, WIN.y0 + 0.95 + (i % 2) * 0.18, Z0 + 0.35 + (i % 3 - 1) * 0.08); add(f); });
    [['#6aa8e0', 4.6, 1.5], ['#e86a8a', 5.2, 2.2]].forEach(([c, x, z]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1 })); b.scale.y = 1.15; b.position.set(x, 8.8, z); add(b);
      add(new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 6.0, 4), col('#ffffff', 0.5))).position.set(x, 5.6, z); }); add(rb(0.4, 0.4, 0.4, 0.05, col('#c8c8d0', 0.3), 4.9, 2.6, 1.85)); }

  // ---------------- lights ----------------
  shadow(room);
  room.traverse((m) => { if (m.isMesh && m.material && (m.material.isMeshBasicMaterial || m.material.transparent)) { m.castShadow = false; } });
  scene.add(new THREE.HemisphereLight('#f2f8ff', '#9aa898', 1.7));
  const sunDir = V(-0.25, -0.5, 0.83).normalize();
  const sun = new THREE.DirectionalLight('#fff0d6', 9); sun.position.copy(V(0, 3, 0).addScaledVector(sunDir, -40)); sun.target.position.set(0, 3, 0);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 90 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun, sun.target);
  const panelL = new THREE.SpotLight('#f4fbff', 190, 0, 1.0, 0.8, 2); panelL.position.set(-1, RH - 0.3, 0); panelL.target.position.set(-0.5, 0, -1); panelL.castShadow = true; panelL.shadow.mapSize.set(2048, 2048); panelL.shadow.bias = -0.0008; panelL.shadow.radius = 5; scene.add(panelL, panelL.target);
  const panel2 = new THREE.PointLight('#f4fbff', 50, 0, 2); panel2.position.set(3, RH - 1, 3); scene.add(panel2);
  const fill = new THREE.PointLight('#fff6ea', 18, 0, 2); fill.position.set(0, 5, 8); scene.add(fill);
  const bmat = RBX.beamMat('#fff0d0', 0.045), beams = new THREE.Group(); scene.add(beams);
  beams.add(RBX.beam(V((WIN.x0 + WIN.x1) / 2, WIN.y0 + (WIN.y1 - WIN.y0) * 0.3, Z0 - 0.1), sunDir, WIN.x1 - WIN.x0, (WIN.y1 - WIN.y0) * 0.6, 12, bmat));
  (function dust() { const r = rng(5), N = 200, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = V(WIN.x0 + r() * (WIN.x1 - WIN.x0), WIN.y0 + r() * (WIN.y1 - WIN.y0), Z0 + 0.4).addScaledVector(sunDir, r() * 9); pos.set([p.x, p.y, p.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = cnv(64, 64), x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    beams.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.03, map: tex(c), color: new THREE.Color(2.0, 1.8, 1.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }))); })();

  return {
    scene, grade: 'day',
    marks: {
      p_nurse: { p: [BS.x, 0, BS.z - 1.65], ry: 0 },                            // nurse standing behind the bassinet, facing it / the camera
      m_bassinet: { p: [BS.x + 0.1, BS.y + 0.02, BS.z], ry: 0 },                 // where the tiny baby lies (on the blanket, head toward +x)
      m_socks: { p: [CART.x - 0.35, CART.y, CART.z] }, m_hat: { p: [CART.x + 0.5, CART.y, CART.z - 0.35] }, m_sign: { p: [X0 + 0.1, 8.6, -1.6] },
    },
    props: { bassinet, cart, sockBasket, babyHat, blinds: null, sun, beams },
    mood(name) { },
    views: {
      wide: { p: [3.2, 6.6, 9.0], l: [-1.0, 4.0, -2.5], fov: 62, mood: 'day' },
      nurse_baby: { p: [BS.x + 0.6, 5.4, BS.z + 3.6], l: [BS.x, 3.6, BS.z - 0.3], fov: 48, mood: 'day' },
      bassinet_top: { p: [BS.x + 0.3, 7.6, BS.z + 0.8], l: [BS.x, BS.y, BS.z], fov: 46, mood: 'day' },
      socks: { p: [CART.x + 0.9, 4.6, CART.z + 2.0], l: [CART.x, CART.y + 0.2, CART.z - 0.1], fov: 42, mood: 'day' },
      sign: { p: [0.5, 6.4, 3.0], l: [X0, 7.6, -1.6], fov: 55, mood: 'day' },
    },
  };
};

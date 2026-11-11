// TK shared set builders (shopfront, lamp, planeG, rebake...) copied from rbx-checkpoint/src/set-town.js




'use strict';
const TK = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { rng } = RBX;
  const SM = (c, r = 0.7, m = 0) => new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
  const box = (par, w, h, d, m, x, y, z, uv = true) => { const g = new T.BoxGeometry(w, h, d); if (uv) KIT.uvBox(g, w, h, d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; par.add(me); return me; };
  TK.box = box; TK.SM = SM;
  TK.plaster = (c) => { const m = ENV.mt(ENV.T.siding(c), 3); return m; };
  // shopfront: 2-3 storeys, coloured plaster, cornice, window grid (lit at night), ground-floor shop window + striped awning + sign
  TK.shop = (o = {}) => { const g = new T.Group(), r = rng(o.seed || 1), w = o.w || 10, d = 8, fl = o.floors || (3 + Math.floor(r() * 2)), h = fl * 4 + 1;
    const c = o.c || ['#e86a6a', '#f2b84a', '#5ac0b0', '#9a7ad8', '#f08a5a', '#5a9ae8', '#e8d07a', '#7ac86a'][Math.floor(r() * 8)];
    box(g, w, h, d, TK.plaster(c), 0, h / 2, 0); box(g, w + 0.6, 0.6, d + 0.6, SM('#f4f0e6', 0.6), 0, h + 0.3, 0, false);
    const win = new T.MeshPhysicalMaterial({ color: '#1b2a3a', roughness: 0.08, clearcoat: 1, emissive: o.lit ? '#ffb45a' : '#000', emissiveIntensity: o.lit ? 2.0 : 0 }), trim = SM('#f6f4ee', 0.6);
    for (let f = 1; f < fl; f++) for (let k = 0; k < Math.floor(w / 3.2); k++) { const x = -w / 2 + 1.6 + k * 3.2 + (w % 3.2) / 2; box(g, 1.7, 2.2, 0.15, win, x, f * 4 + 2, d / 2 + 0.05, false); box(g, 2.1, 0.25, 0.4, trim, x, f * 4 + 0.8, d / 2 + 0.15, false); box(g, 2.1, 0.2, 0.25, trim, x, f * 4 + 3.2, d / 2 + 0.1, false); }
    box(g, w - 3, 2.6, 0.15, win, -1, 1.7, d / 2 + 0.05, false); box(g, 1.4, 3, 0.15, SM(['#8a2a2a', '#2a4a7a', '#3a5a3a'][Math.floor(r() * 3)], 0.5), w / 2 - 1.4, 1.5, d / 2 + 0.06, false);
    // striped awning
    const at = KIT.textTex(256, 64, (q, W, H) => { const a = o.aw || ['#e8202a', '#1f8ad8', '#38a060', '#f2a020'][Math.floor(r() * 4)]; for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#fbf8f0' : a; q.fillRect(i * 32, 0, 32, H); } });
    const aw = new T.Mesh(new T.PlaneGeometry(w - 0.6, 2.2), new T.MeshStandardMaterial({ map: at, side: T.DoubleSide, roughness: 0.8 })); aw.position.set(0, 3.7, d / 2 + 0.95); aw.rotation.x = -1.0; aw.castShadow = true; g.add(aw);
    if (o.sign) { const st = KIT.textTex(512, 96, (q, W, H) => { q.fillStyle = '#2a2420'; q.fillRect(0, 0, W, H); q.fillStyle = '#f4e8c8'; q.font = '900 60px "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(o.sign, W / 2, H / 2 + 3); });
      const sp = new T.Mesh(new T.PlaneGeometry(w * 0.7, w * 0.13), new T.MeshStandardMaterial({ map: st, roughness: 0.6 })); sp.position.set(0, 4.6, d / 2 + 0.1); g.add(sp); }
    return g; };
  // street lamp (iron post, warm head + point light at night)
  TK.lamp = (lit) => { const g = new T.Group(), iron = SM('#1e2228', 0.45, 0.6); box(g, 0.25, 6, 0.25, iron, 0, 3, 0, false); box(g, 1.4, 0.15, 0.15, iron, 0.6, 5.9, 0, false);
    const head = new T.Mesh(new T.CylinderGeometry(0.35, 0.5, 0.8, 6), new T.MeshStandardMaterial({ color: '#ffe0a0', emissive: '#ffa040', emissiveIntensity: lit ? 5 : 0.4 })); head.position.set(1.2, 5.4, 0); g.add(head);
    if (lit) { const L = new T.PointLight('#ffa858', 16, 22, 2); L.position.set(1.2, 5.0, 0); g.add(L); } return g; };
  // cotton candy stand: pink-and-white striped canopy, counter, big pink/blue candy floss cones, sign
  TK.candy = () => { const g = new T.Group(), wd = ENV.mt(ENV.T.wood('#c88a50'), 1.5);
    box(g, 4.4, 2.2, 2.2, wd, 0, 1.1, 0); box(g, 4.7, 0.25, 2.5, SM('#f6f2ea', 0.5), 0, 2.3, 0, false);
    [-2.1, 2.1].forEach((x) => [-1.0, 1.0].forEach((z) => box(g, 0.18, 4.2, 0.18, SM('#f6f2ea', 0.5), x, 2.1, z, false)));
    const ct = KIT.textTex(256, 64, (q, W, H) => { for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#ffffff' : '#f07ad0'; q.fillRect(i * 32, 0, 32, H); } });
    const can = new T.Mesh(new T.ConeGeometry(3.3, 1.6, 4, 1, true), new T.MeshStandardMaterial({ map: ct, side: T.DoubleSide, roughness: 0.8 })); can.rotation.y = PI / 4; can.position.y = 5.0; can.scale.z = 0.62; can.castShadow = true; g.add(can);
    const st = KIT.textTex(512, 128, (q, W, H) => { q.fillStyle = '#ffffff'; q.fillRect(0, 0, W, H); q.strokeStyle = '#f07ad0'; q.lineWidth = 14; q.strokeRect(7, 7, W - 14, H - 14); q.fillStyle = '#e8409a'; q.font = '900 64px "Comic Sans MS", "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('COTTON CANDY', W / 2, H / 2 + 4); });
    const sp = new T.Mesh(new T.PlaneGeometry(4.2, 1.05), new T.MeshStandardMaterial({ map: st, roughness: 0.6 })); sp.position.set(0, 1.3, 1.12); g.add(sp);
    [['#f8a8d8', -1.2], ['#a8d8f8', 0], ['#f8a8d8', 1.2]].forEach(([c, x]) => { const s = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 1.2, 6), SM('#f6f2ea')); s.position.set(x, 2.95, 0.4); g.add(s); const fl = new T.Mesh(new T.IcosahedronGeometry(0.55, 2), new T.MeshStandardMaterial({ color: c, roughness: 1, emissive: c, emissiveIntensity: 0.12 })); fl.position.set(x, 3.7, 0.4); fl.scale.set(1, 1.15, 1); fl.castShadow = true; g.add(fl); });
    return ENV.shadow(g); };
  // generic fair stall (striped tent roof) with a prize row
  TK.stall = (c = '#e8202a', label = 'RING TOSS') => { const g = new T.Group(), wd = ENV.mt(ENV.T.wood('#a8743e'), 1.5); box(g, 5, 1.6, 2.4, wd, 0, 0.8, 0);
    [-2.4, 2.4].forEach((x) => [-1.1, 1.1].forEach((z) => box(g, 0.16, 4, 0.16, SM('#f6f2ea'), x, 2, z, false)));
    const rt = KIT.textTex(256, 64, (q, W, H) => { for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? '#ffffff' : c; q.fillRect(i * 32, 0, 32, H); } });
    const roof = new T.Mesh(new T.ConeGeometry(3.9, 1.8, 4, 1, true), new T.MeshStandardMaterial({ map: rt, side: T.DoubleSide, roughness: 0.8 })); roof.rotation.y = PI / 4; roof.position.y = 4.85; roof.scale.z = 0.7; roof.castShadow = true; g.add(roof);
    const st = KIT.textTex(512, 110, (q, W, H) => { q.fillStyle = c; q.fillRect(0, 0, W, H); q.fillStyle = '#fff'; q.font = '900 66px "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(label, W / 2, H / 2 + 3); });
    const sp = new T.Mesh(new T.PlaneGeometry(4.8, 1.0), new T.MeshStandardMaterial({ map: st, roughness: 0.6 })); sp.position.set(0, 3.6, 1.15); g.add(sp);
    ['#f2c94c', '#38c060', '#1f8ad8', '#f07ad0', '#e8202a'].forEach((pc, i) => { const p = new T.Mesh(new T.IcosahedronGeometry(0.32, 1), SM(pc, 0.5)); p.position.set(-1.8 + i * 0.9, 1.95, -0.6); g.add(p); });
    return ENV.shadow(g); };
  // Ferris wheel: two rims + spokes on an A-frame, gondolas hanging level, bulbs
  TK.wheel = (lit) => { const g = new T.Group(), R = 14, st = SM('#f4f2ec', 0.4, 0.4), red = SM('#e8202a', 0.4, 0.2), bulb = new T.MeshStandardMaterial({ color: '#fff0c0', emissive: '#ffd080', emissiveIntensity: lit ? 4 : 1.2 });
    const hub = R + 2.5; [-1.2, 1.2].forEach((z) => { const rim = new T.Mesh(new T.TorusGeometry(R, 0.22, 8, 64), st); rim.position.set(0, hub, z); g.add(rim);
      for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, sp = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, R, 6), st); sp.position.set(Math.cos(a) * R / 2, hub + Math.sin(a) * R / 2, z); sp.rotation.z = a - PI / 2; g.add(sp); }
      for (let i = 0; i < 48; i++) { const a = (i / 48) * PI * 2, b = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), bulb); b.position.set(Math.cos(a) * R, hub + Math.sin(a) * R, z * 1.12); g.add(b); }
      [-1, 1].forEach((s) => { const leg = new T.Mesh(new T.CylinderGeometry(0.3, 0.4, hub / Math.cos(0.32), 8), st); leg.position.set(s * hub * Math.tan(0.32) / 2, hub / 2, z * 1.9); leg.rotation.z = s * 0.32; g.add(leg); }); });
    g.add(new T.Mesh(new T.CylinderGeometry(0.6, 0.6, 4.4, 16), red)).rotation.x = 0; g.children[g.children.length - 1].rotation.x = PI / 2; g.children[g.children.length - 1].position.set(0, hub, 0);
    const gc = ['#e8202a', '#1f8ad8', '#f2c01a', '#38c060', '#f07ad0', '#8a3ad0'];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * PI * 2 + 0.1, cx = Math.cos(a) * R, cy = hub + Math.sin(a) * R, gd = new T.Group(); gd.position.set(cx, cy, 0);
      box(gd, 0.1, 1.2, 0.1, st, 0, -0.6, 0, false); box(gd, 2.2, 1.2, 1.8, SM(gc[i % 6], 0.4, 0.1), 0, -1.8, 0, false); box(gd, 2.4, 0.2, 2.0, st, 0, -1.1, 0, false); g.add(gd); }
    return ENV.shadow(g); };
  TK.rebake = (scene, sky, renderer) => { const sc = new T.Scene(); sc.add(new T.Mesh(new T.SphereGeometry(10, 48, 24), sky.material)); const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(sc, 0.02).texture; pm.dispose(); };
  TK.planeG = (scene, w, d, m, x, y, z) => { const g = new T.PlaneGeometry(w, d); g.rotateX(-PI / 2); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * d); const me = new T.Mesh(g, m); me.position.set(x, y, z); me.receiveShadow = true; scene.add(me); return me; };
  // the Clock Tower: brick shaft, stone bands, 4 clock faces, open belfry, top balcony + railing, pointed slate roof, exterior stair
  TK.tower = (o = {}) => { const g = new T.Group(), W = 9, Hs = 46, brick = new T.MeshStandardMaterial({ color: '#b86a4a', roughness: 0.9 }), stone = SM('#d8d0c0', 0.85);
    { const t = KIT.bricks(512, 31, { rows: 10, cols: 5, color: '#a85a3a', mortar: '#d8c8b0' }); brick.map = RBX.tex(t.c); brick.map.wrapS = brick.map.wrapT = T.RepeatWrapping; brick.normalMap = RBX.tex(RBX.normalCanvas(RBX.heightOf(t.h), 512, 512, 4), { srgb: false }); brick.normalMap.wrapS = brick.normalMap.wrapT = T.RepeatWrapping; }
    box(g, W, Hs, W, ENV.mt(brick, 3), 0, Hs / 2, 0); [8, 20, 32, 44].forEach((y) => box(g, W + 0.6, 0.6, W + 0.6, stone, 0, y, 0, false)); box(g, W + 1.2, 2, W + 1.2, stone, 0, 1, 0, false);
    // slit windows
    for (let y = 4; y < 38; y += 6) [0, 1, 2, 3].forEach((s) => { const a = (s * PI) / 2, m = box(g, 0.9, 2.2, 0.2, SM('#1a1a24', 0.3), Math.sin(a) * (W / 2 + 0.02), y + 1.5, Math.cos(a) * (W / 2 + 0.02), false); m.rotation.y = a; });
    // clock faces
    const ft = KIT.textTex(512, 512, (q, S) => { q.fillStyle = '#f6f0dc'; q.beginPath(); q.arc(256, 256, 250, 0, 7); q.fill(); q.strokeStyle = '#2a2420'; q.lineWidth = 16; q.stroke(); q.fillStyle = '#2a2420'; q.font = '900 54px Georgia, serif'; q.textAlign = 'center'; q.textBaseline = 'middle';
      ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((n, i) => { const a = (i / 12) * PI * 2 - PI / 2; q.fillText(n, 256 + Math.cos(a) * 192, 256 + Math.sin(a) * 192); });
      q.lineCap = 'round'; q.lineWidth = 18; q.beginPath(); q.moveTo(256, 256); q.lineTo(256 + 70, 256 - 90); q.stroke(); q.lineWidth = 12; q.beginPath(); q.moveTo(256, 256); q.lineTo(256 - 20, 256 - 160); q.stroke(); q.beginPath(); q.arc(256, 256, 16, 0, 7); q.fill(); });
    const fm = new T.MeshStandardMaterial({ map: ft, roughness: 0.5, emissive: o.lit ? '#ffe8b0' : '#000', emissiveMap: ft, emissiveIntensity: o.lit ? 0.6 : 0 });
    [0, 1, 2, 3].forEach((s) => { const a = (s * PI) / 2, f = new T.Mesh(new T.CircleGeometry(3.4, 48), fm); f.position.set(Math.sin(a) * (W / 2 + 0.12), 38.5, Math.cos(a) * (W / 2 + 0.12)); f.rotation.y = a; g.add(f);
      const rim = new T.Mesh(new T.TorusGeometry(3.5, 0.25, 8, 48), SM('#e0b030', 0.3, 0.8)); rim.position.copy(f.position); rim.rotation.y = a; g.add(rim); });
    // belfry: 4 corner piers + bell, then the balcony floor + railing, then roof
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, 1.6, 6, 1.6, ENV.mt(brick, 3), x * (W / 2 - 0.8), Hs + 3, z * (W / 2 - 0.8)));
    const bell = new T.Mesh(new T.CylinderGeometry(0.9, 1.8, 2.6, 24, 1, true), new T.MeshPhysicalMaterial({ color: '#8a6428', metalness: 0.7, roughness: 0.55, side: T.DoubleSide })); bell.position.set(0, Hs + 3.8, 0); g.add(bell);
    box(g, W + 3, 0.6, W + 3, stone, 0, Hs + 0.3, 0, false);
    const rail = SM('#2a2a30', 0.4, 0.6); [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([sx, sz]) => { const L = W + 3; box(g, sx ? 0.15 : L, 0.15, sx ? L : 0.15, rail, sx * L / 2, Hs + 1.9, sz * L / 2, false); for (let k = -L / 2; k <= L / 2; k += 1.1) box(g, 0.1, 1.6, 0.1, rail, sx ? sx * L / 2 : k, Hs + 1.1, sz ? sz * L / 2 : k, false); });
    box(g, W + 1, 0.8, W + 1, stone, 0, Hs + 6.4, 0, false);
    const roof = new T.Mesh(new T.ConeGeometry(W * 0.78, 10, 4), ENV.mt(ENV.T.shingle('#3a4a5a'), 1.5)); roof.rotation.y = PI / 4; roof.position.y = Hs + 11.8; roof.castShadow = true; g.add(roof);
    const fin = new T.Mesh(new T.SphereGeometry(0.4, 12, 8), SM('#e0b030', 0.3, 0.9)); fin.position.y = Hs + 17; g.add(fin);
    // the hero's tiny flag on the balcony (front-right corner) on a mini checkpoint pad
    const cpk = CP.checkpoint({ c: CP.COL.hero, emblem: 'flame', h: 2.2, w: 1.0, s: 0.5, pole: 0.04 }); cpk.position.set(W / 2 + 0.6, Hs + 0.6, W / 2 + 0.6); g.add(cpk); g.heroFlag = cpk; g.top = Hs + 0.6;
    // exterior stair winding round the shaft (steps on brackets), rising 4 per face
    const stepM = SM('#cfc4b0', 0.85); let y = 0.4, n = 0; const rise = 0.36; g.stepList = [];
    for (let lap = 0; y < Hs - 1; lap++) for (let s = 0; s < 4 && y < Hs - 1; s++) { const a = (s * PI) / 2; for (let k = 0; k < 11 && y < Hs - 1; k++, y += rise, n++) { const u = -W / 2 + 0.4 + k * 0.82;
      const st = box(g, 0.85, 0.22, 1.8, stepM, 0, y, 0, false); const lx = u, lz = W / 2 + 0.9; st.position.set(Math.cos(a) * lx + Math.sin(a) * lz, y, -Math.sin(a) * lx + Math.cos(a) * lz); st.rotation.y = a; g.stepList.push({ p: st.position.clone(), a }); } }
    g.steps = n; return ENV.shadow(g); };
})();

// rbx-chess KINGDOM set: a kingdom built ON a giant chessboard that lies on a giant walnut table.
// Board: 8x8 squares of SQ=16 (marble flagstones), files a..h along +x (x = -56 + 16 f), ranks 1..8 along -z
// (z = 56 - 16 (r - 1)): rank 1 (castle) is near +z, rank 8 (fog) far -z. The street runs along x between the
// rank-6 shops (south half of rank 6, facing -z) and the rank-7 pawn cottages (north half of rank 7, facing +z).
// The Box stands on the table off the a-file. Sky: a cloud deck (the lid) that slides open over the street.
'use strict';
SETS.kingdom = async function (ctx) {
  const T = THREE, { cnv, tex, pbr, rng, fbm, tnoise } = RBX, { texPair, noiseOver, uvBox, V } = KIT;
  const scene = new T.Scene(), props = {}, marks = {}, PI = Math.PI, C = (h) => new T.Color(h);
  const SQ = 16, FX = (f) => -56 + SQ * f, RZ = (r) => 56 - SQ * (r - 1), TABLE = -7, STREET_Z = -32;
  props.SQ = SQ; props.FX = FX; props.RZ = RZ;

  // ---------- helpers ----------
  const SM = (o) => new T.MeshStandardMaterial(o);
  const add = (m, par = scene) => { par.add(m); return m; };
  const BX = (w, h, d, m, x, y, z, par = scene) => add(Object.assign(new T.Mesh(uvBox(new T.BoxGeometry(w, h, d), w, h, d), m), {}), par).translateX(x).translateY(y).translateZ(z);
  const RB = (w, h, d, r, m, x, y, z, par = scene) => { const me = new T.Mesh(RBX.rbox(w, h, d, r, 6), m); me.position.set(x, y, z); return add(me, par); };
  const CY = (rt, rb, h, m, x, y, z, par = scene, seg = 20) => { const me = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg), m); me.position.set(x, y, z); return add(me, par); };
  const SP = (r, m, x, y, z, par = scene, s = [1, 1, 1]) => { const me = new T.Mesh(new T.SphereGeometry(r, 24, 16), m); me.position.set(x, y, z); me.scale.set(...s); return add(me, par); };
  const planeW = (w, h) => { const g = new T.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h); return g; };
  const INST = new Map(), _q = new T.Quaternion(), _e = new T.Euler();
  const M4 = (x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => new T.Matrix4().compose(V(x, y, z), _q.clone().setFromEuler(_e.set(rx, ry, rz)), V(sx, sy, sz));
  const inst = (key, geo, mat, m4, col) => { let L = INST.get(key); if (!L) INST.set(key, (L = { geo, mat, ms: [], cs: [] })); L.ms.push(m4); L.cs.push(col || null); };
  const flushInst = () => INST.forEach((L) => { const im = new T.InstancedMesh(L.geo, L.mat, L.ms.length); L.ms.forEach((m, i) => im.setMatrixAt(i, m)); if (L.cs.some((c) => c)) L.cs.forEach((c, i) => im.setColorAt(i, c || C('#ffffff'))); scene.add(im); });
  const P = (t, o) => pbr(t.c, t.h, o);

  // ---------- textures ----------
  // marble square: 4x4 flagstones with veins, bevelled joints. one tile = one board square
  const marbleT = (seed, base, vein, joint) => texPair(1024, (g, hg, S) => {
    g.fillStyle = base; g.fillRect(0, 0, S, S); noiseOver(g, S, S, seed, 0.22, 4, 5);
    const r = rng(seed + 1), n = fbm(seed + 2, 3, 4);
    for (let k = 0; k < 26; k++) { let x = r() * S, y = r() * S, a = r() * PI * 2; g.strokeStyle = vein; g.globalAlpha = 0.08 + r() * 0.2; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); g.moveTo(x, y);
      for (let j = 0; j < 40; j++) { a += (n(x / S, y / S) - 0.5) * 0.9; x += Math.cos(a) * 12; y += Math.sin(a) * 12; g.lineTo(x, y); } g.stroke(); }
    g.globalAlpha = 1; const t = S / 4;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const k = 0.92 + r() * 0.14; g.fillStyle = k > 1 ? `rgba(255,255,255,${(k - 1) * 0.6})` : `rgba(0,0,0,${(1 - k) * 0.7})`; g.fillRect(i * t, j * t, t, t); }
    const hm = hg.getImageData(0, 0, S, S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const i = (y * S + x) * 4, v = 170 + n(x / S, y / S) * 20; hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = v; } hg.putImageData(hm, 0, 0);
    for (let k = 0; k <= 4; k++) { const p = k * t; [[p - 3, 0, 6, S], [0, p - 3, S, 6]].forEach(([x, y, w, h]) => { g.fillStyle = joint; g.fillRect(x, y, w, h); hg.fillStyle = '#000'; hg.fillRect(x - 2, y - 2, w + 4, h + 4); }); }
    for (let i = 0; i < 9; i++) { const x = r() * S, y = r() * S, rr = 30 + r() * 90, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(60,50,40,0.12)'); gr.addColorStop(1, 'rgba(60,50,40,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  });
  const lightT = marbleT(11, '#ddd1b8', '#9a8a70', 'rgba(120,105,85,0.9)'), darkT = marbleT(21, '#3b3a3c', '#5a5a62', 'rgba(15,15,18,0.95)');
  const walnutT = KIT.woodPlanks(1024, 31, { rows: 8, tones: ['#5a3420', '#4e2c1a', '#633a22', '#47281a', '#55321e'], knots: 10 });
  const rimT = KIT.woodPlanks(512, 32, { rows: 3, tones: ['#6a3c22', '#5e341e', '#704026'], noSeams: true });
  const plasterT = texPair(512, (g, hg, S) => { g.fillStyle = '#efe6d4'; g.fillRect(0, 0, S, S); noiseOver(g, S, S, 41, 0.18, 8, 5); const r = rng(42);
    const hn = tnoise(43, 48), hm = hg.getImageData(0, 0, S, S); for (let i = 0; i < S * S; i++) hm.data[i * 4] = hm.data[i * 4 + 1] = hm.data[i * 4 + 2] = 110 + hn((i % S) / S, Math.floor(i / S) / S) * 60; hg.putImageData(hm, 0, 0);
    for (let i = 0; i < 14; i++) { const x = r() * S, y = r() * S, w = 30 + r() * 60, h = 14 + r() * 26; g.fillStyle = 'rgba(150,120,90,0.25)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(110,80,60,0.35)'; g.strokeRect(x, y, w, h); hg.fillStyle = '#404040'; hg.fillRect(x, y, w, h); } });
  const shingleT = texPair(512, (g, hg, S) => { g.fillStyle = '#909090'; g.fillRect(0, 0, S, S); const r = rng(51);
    for (let i = 0; i < 16000; i++) { const x = r() * S, y = r() * S, v = 80 + r() * 130; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 1.8, 1.8); hg.fillStyle = `rgba(255,255,255,${r() * 0.6})`; hg.fillRect(x, y, 1.8, 1.8); }
    const rows = 4, rh = S / rows; for (let k = 0; k < rows; k++) { const off = (k % 2) * 32; for (let x = -64; x < S; x += 64) { const t = r(); g.fillStyle = t > 0.5 ? `rgba(255,255,255,${(t - 0.5) * 0.3})` : `rgba(0,0,0,${(0.5 - t) * 0.45})`;
      g.beginPath(); g.moveTo(x + off, k * rh); g.lineTo(x + off + 64, k * rh); g.lineTo(x + off + 64, k * rh + rh * 0.8); g.quadraticCurveTo(x + off + 32, k * rh + rh * 1.05, x + off, k * rh + rh * 0.8); g.closePath(); g.fill();
      g.fillStyle = 'rgba(10,10,10,0.8)'; g.fillRect(x + off - 2, k * rh, 4, rh * 0.8); hg.fillStyle = '#000'; hg.fillRect(x + off - 3, k * rh, 6, rh * 0.8); }
      g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(0, (k + 1) * rh - 5, S, 5); hg.fillStyle = '#000'; hg.fillRect(0, (k + 1) * rh - 4, S, 4); } });
  const stoneT = KIT.bricks(512, 61, { color: '#b8ae9c', mortar: '#7a7266', rows: 6, cols: 3 }), brickT = KIT.bricks(512, 62, { color: '#a24a32' }), castleT = KIT.bricks(512, 63, { color: '#d8cfbd', mortar: '#9a9284', rows: 7, cols: 3 });
  const plankT = KIT.woodPlanks(512, 71, { rows: 6, tones: ['#8a5a32', '#7a4e2a', '#946238'], knots: 8 });
  const leafT = texPair(256, (g, hg, S) => { g.fillStyle = '#2e5a26'; g.fillRect(0, 0, S, S); hg.fillStyle = '#202020'; hg.fillRect(0, 0, S, S); const r = rng(81);
    for (let i = 0; i < S * 7; i++) { const x = r() * S, y = r() * S, a = r() * 7, s = 2.5 + r() * 5; g.fillStyle = ['#3a7a2e', '#4b8c34', '#5f9e3c', '#2f6626', '#6aa844'][(r() * 5) | 0]; g.beginPath(); g.ellipse(x, y, s, s * 0.55, a, 0, 7); g.fill(); hg.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.6})`; hg.beginPath(); hg.ellipse(x, y, s, s * 0.55, a, 0, 7); hg.fill(); } });
  const roomC = (wall, cur) => { const c = cnv(128, 160), g = c.getContext('2d'), gr = g.createRadialGradient(64, 70, 4, 64, 80, 110); gr.addColorStop(0, '#fff0c0'); gr.addColorStop(0.5, wall); gr.addColorStop(1, '#5a2a10'); g.fillStyle = gr; g.fillRect(0, 0, 128, 160);
    g.fillStyle = cur; g.fillRect(0, 0, 30, 160); g.fillRect(98, 0, 30, 160); g.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 4; x < 30; x += 7) { g.fillRect(x, 0, 2, 160); g.fillRect(98 + x, 0, 2, 160); } g.fillStyle = cur; g.fillRect(0, 0, 128, 16);
    g.fillStyle = '#e8e2d0'; g.fillRect(60, 0, 8, 160); g.fillRect(0, 76, 128, 8); return c; };
  const castleWin = SM({ color: '#1a2230', roughness: 0.08, metalness: 0.4, emissive: C('#ffb050'), emissiveIntensity: 0 });
  const glassM = [roomC('#f0a050', '#9a2a1c'), roomC('#e8b060', '#2a4a8a'), roomC('#f4c070', '#3a6a2a')].map((c) => { const t = tex(c); return SM({ map: t, emissiveMap: t, emissive: C('#ffffff'), emissiveIntensity: 0.2, roughness: 0.1, metalness: 0.1 }); });

  // ---------- materials ----------
  const M = {
    light: P(lightT, { physical: true, rough: 0.32, bump: 2.5, repeat: [1 / SQ, 1 / SQ] }), dark: P(darkT, { physical: true, rough: 0.28, bump: 2.5, repeat: [1 / SQ, 1 / SQ] }),
    table: P(walnutT, { physical: true, rough: 0.4, bump: 3, repeat: [1 / 60, 1 / 60] }), rim: P(rimT, { physical: true, rough: 0.35, bump: 2, repeat: [1 / 12, 1 / 4] }),
    plaster: P(plasterT, { rough: 0.92, bump: 3, repeat: [1 / 6, 1 / 6] }), shingle: P(shingleT, { rough: 0.85, bump: 4, repeat: [1 / 4, 1 / 3] }),
    stone: P(stoneT, { rough: 0.92, bump: 5, repeat: [1 / 5, 1 / 5] }), brick: P(brickT, { rough: 0.9, bump: 5, repeat: [1 / 4.5, 1 / 4.5] }), castle: P(castleT, { rough: 0.9, bump: 5, repeat: [1 / 7, 1 / 7] }),
    plank: P(plankT, { rough: 0.8, bump: 3, repeat: [1 / 4, 1 / 4] }), leaf: P(leafT, { rough: 1, bump: 4, repeat: [2, 2] }),
    timber: SM({ color: '#4a2e1c', roughness: 0.8 }), iron: SM({ color: '#1e1f22', roughness: 0.45, metalness: 0.75 }), brass: SM({ color: '#c9a35a', roughness: 0.3, metalness: 0.9 }),
    soil: SM({ color: '#3a2618', roughness: 1 }), terra: SM({ color: '#b5603a', roughness: 0.8 }), cream: SM({ color: '#f2ead8', roughness: 0.6 }),
    lamp: SM({ color: '#ffe2b0', emissive: C('#ffb860'), emissiveIntensity: 0.3, roughness: 0.3 }),
    roofR: null, roofB: null,
  };
  M.leaf.flatShading = true;
  M.roofR = M.shingle.clone(); M.roofR.color.set('#b0503a'); M.roofB = M.shingle.clone(); M.roofB.color.set('#4a5a78');
  const roofDark = M.shingle.clone(); roofDark.color.set('#3a3436'); const roofCream = M.shingle.clone(); roofCream.color.set('#d8cbb0');

  // ---------- table + board ----------
  const tbl = add(new T.Mesh(planeW(1600, 1600), M.table)); tbl.rotation.x = -PI / 2; tbl.position.y = TABLE;
  const slabG = uvBox(new T.BoxGeometry(SQ, 1, SQ), SQ, 1, SQ);
  for (let f = 0; f < 8; f++) for (let r = 1; r <= 8; r++) { const dark = (f + r) % 2 === 1, m = new T.Mesh(slabG, dark ? M.dark : M.light); m.position.set(FX(f), -0.5, RZ(r));
    // world-space UV offset so the flagstones don't repeat identically
    add(m); }
  BX(130, TABLE * -1 - 1, 130, M.rim, 0, (TABLE - 1) / 2, 0);   // board body under the squares
  // brass inlay lines between squares
  for (let k = 0; k <= 8; k++) { const p = -64 + k * SQ; BX(128.6, 0.06, 0.3, M.brass, 0, 0.02, p); BX(0.3, 0.06, 128.6, M.brass, p, 0.02, 0); }
  // frame with engraved coordinates
  const frameH = 1.4, FW = 9;
  [[0, 64 + FW / 2, 128 + FW * 2, FW], [0, -64 - FW / 2, 128 + FW * 2, FW], [64 + FW / 2, 0, FW, 128], [-64 - FW / 2, 0, FW, 128]].forEach(([x, z, w, d]) => BX(w, frameH - TABLE, d, M.rim, x, (frameH + TABLE) / 2 - 0.5, z));
  const labelM = (t) => { const c = cnv(128, 128), g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, 128, 128); g.font = 'bold 96px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(30,14,6,0.85)'; g.fillText(t, 64, 70); g.fillStyle = 'rgba(232,196,120,0.9)'; g.fillText(t, 62, 66); return SM({ map: tex(c), transparent: true, roughness: 0.4, metalness: 0.4, polygonOffset: true, polygonOffsetFactor: -2 }); };
  'abcdefgh'.split('').forEach((ch, f) => [-1, 1].forEach((s) => { const p = add(new T.Mesh(new T.PlaneGeometry(6, 6), labelM(ch))); p.rotation.x = -PI / 2; p.position.set(FX(f), frameH - 0.48, s * (64 + FW / 2)); if (s < 0) p.rotation.z = PI; }));
  for (let r = 1; r <= 8; r++) [-1, 1].forEach((s) => { const p = add(new T.Mesh(new T.PlaneGeometry(6, 6), labelM(String(r)))); p.rotation.x = -PI / 2; p.position.set(s * (64 + FW / 2), frameH - 0.48, RZ(r)); p.rotation.z = s > 0 ? PI / 2 : -PI / 2; });

  // ---------- reusable buildings ----------
  // pawn cottage: plaster + timber, steep shingle roof, round door, two lit windows with shutters, flower box, chimney, pawn finial
  const pawnFinial = (side = 'w') => { const g = new T.Group(); const m = CHESS.lacquer(side);
    g.add(new T.Mesh(CHESS.latheGeo([[0.0, 0], [0.8, 0], [0.85, 0.2], [0.55, 0.35], [0.35, 0.9], [0.6, 1.05], [0.6, 1.2], [0.3, 1.3], [0.0, 1.32]]), m)); const b = new T.Mesh(new T.SphereGeometry(0.62, 24, 16), m); b.position.y = 1.8; g.add(b); return g; };
  const doorTex = (() => { const c = cnv(128, 256), g = c.getContext('2d'); g.fillStyle = '#6a3a1e'; g.fillRect(0, 0, 128, 256); for (let x = 0; x < 128; x += 21) { g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x, 0, 3, 256); } g.fillStyle = '#1a1a1a'; g.fillRect(14, 70, 100, 8); g.fillRect(14, 190, 100, 8); g.fillStyle = '#c9a35a'; g.beginPath(); g.arc(100, 140, 8, 0, 7); g.fill(); return SM({ map: tex(c), roughness: 0.7 }); })();
  function cottage(o = {}) {
    const g = new T.Group(), w = o.w || 9, d = o.d || 8, h = o.h || 7, roof = o.roof || M.roofR, r = rng(o.seed || 1);
    BX(w + 0.6, 0.8, d + 0.6, M.stone, 0, 0.4, 0, g);
    BX(w, h, d, M.plaster, 0, 0.8 + h / 2, 0, g);
    // timber frame on the front
    [-w / 2 + 0.2, w / 2 - 0.2].forEach((x) => BX(0.45, h, 0.25, M.timber, x, 0.8 + h / 2, d / 2 + 0.05, g));
    BX(w, 0.4, 0.3, M.timber, 0, 0.8 + h - 0.2, d / 2 + 0.05, g); BX(w, 0.35, 0.3, M.timber, 0, 0.8 + h * 0.48, d / 2 + 0.05, g);
    // roof: two slabs + gable
    const rise = w * 0.45, sl = Math.hypot(w / 2 + 0.8, rise), ang = Math.atan2(rise, w / 2 + 0.8);
    [-1, 1].forEach((s) => { const m = BX(sl, 0.45, d + 1.6, roof, s * (w / 4 + 0.4) * 1.0, 0.8 + h + rise / 2, 0, g); m.rotation.z = -s * ang; m.position.x = s * (w / 2 + 0.8) / 2; m.position.y = 0.8 + h + rise / 2 - 0.1; });
    const gab = new T.Shape([new T.Vector2(-w / 2, 0), new T.Vector2(w / 2, 0), new T.Vector2(0, rise)]), gg = new T.ShapeGeometry(gab);
    [-1, 1].forEach((s) => { const m = new T.Mesh(gg, M.plaster); m.position.set(0, 0.8 + h, s * d / 2); if (s < 0) m.rotation.y = PI; g.add(m); });
    BX(0.5, 0.5, d + 1.8, M.timber, 0, 0.8 + h + rise + 0.05, 0, g);
    // round window in the gable
    const rw = new T.Mesh(new T.CircleGeometry(0.9, 24), glassM[(o.seed || 0) % 3]); rw.position.set(0, 0.8 + h + rise * 0.4, d / 2 + 0.02); g.add(rw);
    const rwf = new T.Mesh(new T.TorusGeometry(0.95, 0.15, 8, 24), M.timber); rwf.position.copy(rw.position); g.add(rwf);
    // door (rounded top)
    BX(2.4, 4.2, 0.2, doorTex, 0, 0.8 + 2.1, d / 2 + 0.05, g); const dt = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, 0.2, 20, 1, false, 0, PI), doorTex); dt.rotation.set(PI / 2, 0, PI / 2); dt.position.set(0, 0.8 + 4.2, d / 2 + 0.05); g.add(dt);
    BX(3.2, 0.3, 1.2, M.stone, 0, 0.95, d / 2 + 0.6, g);
    // windows
    [-1, 1].forEach((s) => { const x = s * w * 0.3, y = 0.8 + h * 0.3 + 1.0; BX(1.9, 2.2, 0.1, glassM[(s + 2 + (o.seed || 0)) % 3], x, y, d / 2 + 0.06, g); BX(2.2, 0.25, 0.4, M.cream, x, y - 1.2, d / 2 + 0.2, g);
      [-1, 1].forEach((q) => BX(0.9, 2.3, 0.15, o.shutter || M.roofB, x + q * 1.5, y, d / 2 + 0.1, g));
      BX(2.2, 0.6, 0.6, M.plank, x, y - 1.6, d / 2 + 0.4, g);
      for (let k = 0; k < 4; k++) SP(0.28, k % 2 ? M.leaf : SM({ color: ['#e84a5f', '#f6c445', '#f08ab8', '#ffffff'][(r() * 4) | 0], roughness: 0.7 }), x - 0.75 + k * 0.5, y - 1.2, d / 2 + 0.45, g); });
    // chimney
    BX(1.4, 3.5, 1.4, M.brick, w * 0.25, 0.8 + h + rise * 0.7, -d * 0.2, g); BX(1.7, 0.3, 1.7, M.stone, w * 0.25, 0.8 + h + rise * 0.7 + 1.8, -d * 0.2, g);
    // pawn finial on the ridge
    const fi = pawnFinial(o.side || 'w'); fi.position.set(-w * 0.3, 0.8 + h + rise * 0.4, d / 2 + 0.6); fi.scale.setScalar(0.9); if (o.finial !== false) { fi.position.set(0, 0.8 + h + rise + 0.25, d / 2 + 0.4); g.add(fi); }
    // porch lamp
    CY(0.25, 0.25, 0.6, M.lamp, 1.8, 0.8 + 4.6, d / 2 + 0.35, g); BX(0.12, 0.12, 0.5, M.iron, 1.8, 0.8 + 4.95, d / 2 + 0.2, g);
    g.userData.lampP = V(1.8, 0.8 + 4.6, d / 2 + 0.8);
    return g;
  }
  // topiary tree in a turned planter (lollipop tree)
  function tree(x, z, s = 1, side = 'w') { const g = new T.Group(); g.position.set(x, 0, z); g.scale.setScalar(s);
    g.add(new T.Mesh(CHESS.latheGeo([[0, 0], [1.6, 0], [1.7, 0.4], [1.3, 0.6], [1.5, 1.8], [1.7, 2.0], [0, 2.0]]), CHESS.lacquer(side)));
    CY(1.35, 1.35, 0.1, M.soil, 0, 2.0, 0, g); CY(0.25, 0.35, 5, M.timber, 0, 4.4, 0, g); const b = SP(2.6, M.leaf, 0, 8.2, 0, g); b.scale.set(1, 1.05, 1); SP(1.6, M.leaf, 0.9, 10.2, 0.4, g); scene.add(g); return g; }
  // street lamp
  const lamps = [];
  function lamp(x, z) { const g = new T.Group(); g.position.set(x, 0, z); CY(0.5, 0.65, 0.8, M.iron, 0, 0.4, 0, g); CY(0.18, 0.22, 9, M.iron, 0, 5, 0, g); BX(1.8, 0.15, 0.15, M.iron, 0.6, 9.2, 0, g);
    const glass = CY(0.45, 0.35, 1.2, M.lamp, 1.3, 8.4, 0, g); CY(0.6, 0.2, 0.4, M.iron, 1.3, 9.2, 0, g); scene.add(g); lamps.push(V(x + 1.3, 8.2, z)); return g; }

  // ---------- rank 7: identical pawn cottages (north half of each square, facing +z) ----------
  const homes = [];
  for (let f = 0; f < 8; f++) { const c = cottage({ seed: f, side: 'w' }); c.position.set(FX(f), 0, RZ(7) - 2.5); scene.add(c); homes.push(c); }
  props.homes = homes;
  // front path stones + mailbox-like rank posts
  for (let f = 0; f < 8; f++) for (let k = 0; k < 4; k++) BX(2.2, 0.12, 1.4, M.stone, FX(f), 0.06, RZ(7) + 3 + k * 1.8);
  // ---------- rank 8 behind: low wall + the fog bank ----------
  for (let f = 0; f < 8; f++) { BX(9.6, 1.2, 0.8, M.stone, FX(f), 0.6, RZ(7) - SQ / 2 + 0.4); [-1, 1].forEach((s) => CY(0.5, 0.6, 1.8, M.stone, FX(f) + s * 5.2, 0.9, RZ(7) - SQ / 2 + 0.4)); }
  // ---------- rank 6: shops (south half, facing -z) ----------
  const shopZ = RZ(6) + 3;
  // bakery on e6 (x = 8): two storeys, brick, striped awning, bay window with bread, flat roof with parapet (the knight lands here)
  const bakery = new T.Group(); bakery.position.set(FX(4), 0, shopZ); bakery.rotation.y = PI; scene.add(bakery);
  { const g = bakery, w = 12, d = 9, h = 11;
    BX(w + 0.6, 0.8, d + 0.6, M.stone, 0, 0.4, 0, g); BX(w, h, d, M.brick, 0, 0.8 + h / 2, 0, g);
    BX(w + 0.8, 0.8, d + 0.8, M.stone, 0, 0.8 + h + 0.4, 0, g); [-1, 1].forEach((s) => { BX(w + 0.8, 1.0, 0.5, M.stone, 0, 0.8 + h + 1.3, s * (d / 2 + 0.15), g); BX(0.5, 1.0, d + 0.8, M.stone, s * (w / 2 + 0.15), 0.8 + h + 1.3, 0, g); });
    BX(w * 0.9, 0.2, d * 0.9, M.plank, 0, 0.8 + h + 0.85, 0, g);   // roof deck
    BX(1.6, 3.6, 1.6, M.brick, -3.5, 0.8 + h + 2.6, -2, g); BX(1.9, 0.3, 1.9, M.stone, -3.5, 0.8 + h + 4.5, -2, g);
    // shop front
    BX(w - 1, 4.6, 0.3, M.timber, 0, 0.8 + 2.6, d / 2 + 0.1, g);
    const bay = SM({ map: tex((() => { const c = cnv(256, 160), q = c.getContext('2d'), gr = q.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#ffe6b0'); gr.addColorStop(1, '#b06a2a'); q.fillStyle = gr; q.fillRect(0, 0, 256, 160);
      const r = rng(5); for (let i = 0; i < 26; i++) { const x = 10 + r() * 236, y = 60 + r() * 90; q.fillStyle = ['#c8843a', '#d89a4a', '#a8662a', '#e8b860'][(r() * 4) | 0]; q.beginPath(); q.ellipse(x, y, 16 + r() * 14, 8 + r() * 5, r() - 0.5, 0, 7); q.fill(); q.strokeStyle = 'rgba(90,40,10,0.6)'; q.lineWidth = 2; q.stroke(); }
      q.fillStyle = '#e8e2d0'; q.fillRect(0, 100, 256, 6); q.fillRect(124, 0, 8, 160); return c; })()), emissive: C('#ffffff'), emissiveIntensity: 0.3, roughness: 0.1 });
    bay.emissiveMap = bay.map; props.bakeryGlass = bay;
    BX(6.4, 3.2, 0.12, bay, 2.2, 0.8 + 2.6, d / 2 + 0.3, g); BX(2.2, 4, 0.12, doorTex, -3.6, 0.8 + 2.1, d / 2 + 0.3, g);
    // awning (striped, sloped)
    const aw = SM({ map: tex((() => { const c = cnv(256, 64), q = c.getContext('2d'); for (let i = 0; i < 16; i++) { q.fillStyle = i % 2 ? '#f4efe4' : '#c4362e'; q.fillRect(i * 16, 0, 16, 64); } return c; })()), roughness: 0.8, side: T.DoubleSide });
    const awn = BX(w, 0.15, 3, aw, 0, 0.8 + 5.6, d / 2 + 1.4, g); awn.rotation.x = 0.35;
    for (let i = 0; i < 12; i++) { const sc = new T.Mesh(new T.CircleGeometry(0.5, 12, 0, PI), aw); sc.position.set(-w / 2 + 0.5 + i, 0.8 + 5.05, d / 2 + 2.85); sc.rotation.z = PI; g.add(sc); }
    // sign: BAKERY + a croissant
    const sign = SM({ map: tex((() => { const c = cnv(512, 128), q = c.getContext('2d'); q.fillStyle = '#2a1a10'; q.fillRect(0, 0, 512, 128); q.strokeStyle = '#c9a35a'; q.lineWidth = 8; q.strokeRect(8, 8, 496, 112); q.font = 'bold 76px Georgia'; q.fillStyle = '#f2d48a'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('BAKERY', 290, 68);
      q.fillStyle = '#d89a4a'; q.beginPath(); q.ellipse(80, 64, 46, 26, 0, 0, 7); q.fill(); q.strokeStyle = '#8a4a1a'; q.lineWidth = 4; for (let k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(80 + k * 16, 40); q.lineTo(80 + k * 14, 88); q.stroke(); } return c; })()), roughness: 0.5 });
    BX(8, 2, 0.3, sign, 0, 0.8 + 7.4, d / 2 + 0.2, g);
    [-1, 1].forEach((s) => { BX(2.0, 2.4, 0.12, glassM[1], s * 3.2, 0.8 + 8.4 + 0.6, d / 2 + 0.06, g); });
    const bread = SP(0.7, SM({ color: '#c8843a', roughness: 0.6 }), 0, 0.8 + 9.6, d / 2 + 0.6, g, [1.6, 0.8, 0.8]);
    // flour sacks + bread crates by the door
    [[-5.5, 0.8, d / 2 + 1.4], [-4.6, 0.8, d / 2 + 2.2]].forEach(([x, y, z]) => { const sk = SP(0.9, SM({ color: '#e9e0cc', roughness: 1 }), x, y + 0.8, z, g, [1, 1.2, 0.8]); });
    BX(2, 1, 1.4, M.plank, 5, 1.3, d / 2 + 1.6, g); for (let k = 0; k < 4; k++) SP(0.38, SM({ color: '#c8843a', roughness: 0.6 }), 4.3 + k * 0.45, 2.0, d / 2 + 1.6, g, [1.8, 0.7, 0.8]);
    g.userData.roof = V(0, 0.8 + h + 0.95, 0);
  }
  props.bakery = bakery;
  // aunt (c6, light square) and uncle (d6, dark square) houses with bishop finials
  const bishopFinial = (side) => { const m = CHESS.mitre(side); m.scale.setScalar(2.2); return m; };
  const auntH = cottage({ seed: 11, roof: roofCream, shutter: SM({ color: '#8e5fc0', roughness: 0.6 }), finial: false }); auntH.position.set(FX(2), 0, shopZ); auntH.rotation.y = PI; scene.add(auntH);
  { const b = bishopFinial('w'); b.position.set(0, 0.8 + 7 + 4.05 - 1.4, 0); auntH.add(b); }
  const uncleH = cottage({ seed: 12, roof: roofDark, shutter: SM({ color: '#2a2230', roughness: 0.6 }), finial: false }); uncleH.position.set(FX(3), 0, shopZ); uncleH.rotation.y = PI; scene.add(uncleH);
  { const b = bishopFinial('b'); b.position.set(0, 0.8 + 7 + 4.05 - 1.4, 0); uncleH.add(b); }
  // market stalls (f6, a6), taxi stand (g6)
  const canvasM = (a, b) => SM({ map: tex((() => { const c = cnv(256, 64), q = c.getContext('2d'); for (let i = 0; i < 8; i++) { q.fillStyle = i % 2 ? a : b; q.fillRect(i * 32, 0, 32, 64); } return c; })()), roughness: 0.85, side: T.DoubleSide });
  const fruitC = ['#d8342a', '#f2a21c', '#7cb83a', '#f2d23a', '#8a3a8a'];
  function stall(x, z, ry, cols) { const g = new T.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    BX(7, 2.6, 3, M.plank, 0, 1.3, 0, g); [-3.2, 3.2].forEach((sx) => [-1.3, 1.3].forEach((sz) => BX(0.3, 6.5, 0.3, M.timber, sx, 3.25, sz, g)));
    const roof = BX(7.8, 0.15, 4.2, canvasM(...cols), 0, 6.6, 0.3, g); roof.rotation.x = -0.25;
    const r = rng(Math.round(x * 13 + z));
    for (let k = 0; k < 3; k++) { BX(2, 0.7, 2.2, M.plank, -2.3 + k * 2.3, 2.95, 0.2, g); for (let i = 0; i < 9; i++) SP(0.32, SM({ color: fruitC[(r() * 5) | 0], roughness: 0.5 }), -2.9 + k * 2.3 + (i % 3) * 0.6, 3.45, -0.4 + Math.floor(i / 3) * 0.6, g); }
    return g; }
  stall(FX(5) - 3, shopZ - 1, PI, ['#2f6fd1', '#f4efe4']); stall(FX(5) + 4, shopZ + 2, PI - 0.15, ['#3a8a3a', '#f4efe4']);
  stall(FX(0), shopZ - 1, PI, ['#c4362e', '#f2d23a']); stall(FX(1) - 2, shopZ + 1, PI + 0.2, ['#8e5fc0', '#f4efe4']);
  // taxi stand: a little kiosk with a rook-shaped roof and a TAXI sign
  { const g = new T.Group(); g.position.set(FX(6), 0, shopZ); g.rotation.y = PI; scene.add(g);
    g.add(new T.Mesh(CHESS.latheGeo([[0, 0], [3.6, 0], [3.8, 0.8], [3.2, 1.2], [3.0, 7.0], [3.6, 7.4], [3.8, 8.4], [3.0, 8.4], [0, 8.4]], 32), CHESS.lacquer('b')));
    for (let i = 0; i < 6; i++) { const a = (i / 6) * PI * 2; const m = RB(1.8, 1.4, 0.8, 0.1, CHESS.lacquer('b'), Math.sin(a) * 3.4, 9.1, Math.cos(a) * 3.4, g); m.rotation.y = a; }
    const ts = SM({ map: tex((() => { const c = cnv(256, 96), q = c.getContext('2d'); q.fillStyle = '#ffd23a'; q.fillRect(0, 0, 256, 96); q.fillStyle = '#141414'; for (let i = 0; i < 16; i++) q.fillRect(i * 16, (i % 2) * 8, 16, 8); q.font = '900 56px "Arial Black", sans-serif'; q.textAlign = 'center'; q.fillText('TAXI', 128, 76); return c; })()), emissive: C('#ffffff'), roughness: 0.4 });
    ts.emissiveMap = ts.map; ts.emissiveIntensity = 0.6; props.taxiSign = ts;
    BX(5, 1.8, 0.4, ts, 0, 5.2, 3.3, g); BX(2.6, 4, 0.2, glassM[2], 0, 2.6, 3.15, g);
    [-1, 1].forEach((s) => BX(0.4, 3, 0.4, M.iron, s * 6, 1.5, 4, g)); BX(12.4, 0.3, 0.4, SM({ color: '#f6c21c', roughness: 0.5 }), 0, 3.1, 4, g);
  }
  tree(FX(7), shopZ, 0.95, 'b'); tree(FX(1) + 4, shopZ - 2, 0.8, 'w');
  // street lamps along the street (both sides) + benches
  for (let f = 0; f < 8; f++) { lamp(FX(f) - 7, RZ(7) + 6); if (f % 2 === 0) lamp(FX(f) + 7, RZ(6) - 3); }
  props.lampPos = lamps;

  // ---------- ranks 2..5: more of the kingdom ----------
  for (let f = 0; f < 8; f++) { const c = cottage({ seed: 20 + f, roof: f % 2 ? M.roofB : M.roofR, side: 'w' }); c.position.set(FX(f), 0, RZ(2) + 2.5); c.rotation.y = PI; scene.add(c); }
  const fountainG = new T.Group(); fountainG.position.set(0, 0, RZ(4) - SQ / 2); scene.add(fountainG);
  { const g = fountainG; g.add(new T.Mesh(CHESS.latheGeo([[0, 0], [7, 0], [7.2, 1.4], [6.6, 1.6], [6.4, 0.8], [0, 0.8]], 48), M.stone));
    const wat = new T.Mesh(new T.CircleGeometry(6.5, 48), new T.MeshPhysicalMaterial({ color: '#4a8ab0', roughness: 0.05, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.85 })); wat.rotation.x = -PI / 2; wat.position.y = 1.2; g.add(wat);
    const kp = new T.Group(); const k = CHESS.kingCrown(); kp.add(new T.Mesh(CHESS.latheGeo([[0, 0], [1.6, 0], [1.4, 1], [0.7, 1.6], [0.6, 4], [1.1, 4.4], [0.9, 4.8], [0, 4.8]]), M.stone)); k.position.y = 4.4; k.scale.setScalar(1.6); kp.add(k); g.add(kp); }
  [[1, 4], [6, 3], [2, 3], [5, 5], [0, 5], [7, 4], [3, 5], [4, 3]].forEach(([f, r], i) => tree(FX(f) + (i % 2 ? 3 : -3), RZ(r) + (i % 3) - 1, 0.85 + (i % 3) * 0.1, i % 2 ? 'b' : 'w'));
  [[0, 3], [3, 4], [2, 5], [7, 2.6]].forEach(([f, r], i) => { const c = cottage({ seed: 40 + i, roof: i % 2 ? roofDark : roofCream, side: i % 2 ? 'b' : 'w' }); c.position.set(FX(f), 0, RZ(r)); c.rotation.y = i * 0.5 + PI; scene.add(c); });

  // ---------- rank 1: the castle (rook towers, keep with the king's kitchen window) ----------
  const castle = new T.Group(); castle.position.set(0, 0, RZ(1) + 2); scene.add(castle);
  const crenel = (g, w, d, y) => { for (let x = -w / 2 + 1; x <= w / 2 - 1; x += 2.4) [-1, 1].forEach((s) => BX(1.3, 1.6, 1.0, M.castle, x, y + 0.8, s * (d / 2 - 0.5), g)); for (let z = -d / 2 + 2.2; z <= d / 2 - 2.2; z += 2.4) [-1, 1].forEach((s) => BX(1.0, 1.6, 1.3, M.castle, s * (w / 2 - 0.5), y + 0.8, z, g)); };
  { const g = castle;
    BX(84, 16, 8, M.castle, 0, 8, 0, g); crenel(g, 84, 8, 16);
    // gate
    BX(10, 12, 1, SM({ color: '#2a1a10', roughness: 0.9 }), 0, 6, -4.1, g); const arch = new T.Mesh(new T.CylinderGeometry(5, 5, 1.2, 24, 1, false, 0, PI), M.castle); arch.rotation.set(PI / 2, 0, PI / 2); arch.position.set(0, 12, -4.1); g.add(arch);
    for (let k = -4; k <= 4; k++) BX(0.3, 11.5, 0.3, M.iron, k * 1.1, 6, -4.4, g); BX(10, 0.4, 0.3, M.iron, 0, 8, -4.4, g);
    // rook towers
    const rookT = (x, z, h, r) => { const t = new T.Group(); t.position.set(x, 0, z); g.add(t);
      t.add(Object.assign(new T.Mesh(CHESS.latheGeo([[0, 0], [r + 1.2, 0], [r + 1.4, 1.5], [r, 2.5], [r - 0.4, h - 3], [r + 0.6, h - 2], [r + 1, h], [0, h]], 40), M.castle)));
      for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; const m = BX(2.4, 2.2, 1.2, M.castle, Math.sin(a) * (r + 0.4), h + 1.1, Math.cos(a) * (r + 0.4), t); m.rotation.y = a; }
      for (let k = 0; k < 3; k++) { const a = PI + (k - 1) * 0.5; BX(1.2, 2.4, 0.3, castleWin, Math.sin(a) * (r - 0.2), h * (0.35 + k * 0.15), Math.cos(a) * (r - 0.2), t).rotation.y = a; }
      const fl = new T.Group(); fl.position.set(0, h, 0); t.add(fl); CY(0.12, 0.12, 6, M.iron, 0, 3, 0, fl);
      const ban = new T.Mesh(new T.PlaneGeometry(3.4, 2.0, 6, 1), SM({ map: tex(CHESS.silCanvas('rook', '#f2e6c8', '#7a1424')), side: T.DoubleSide, roughness: 0.8 })); const bp = ban.geometry.attributes.position; for (let i = 0; i < bp.count; i++) bp.setZ(i, Math.sin(bp.getX(i) * 1.6) * 0.3); ban.position.set(1.8, 5, 0); fl.add(ban);
      return t; };
    rookT(-42, 0, 30, 6); rookT(42, 0, 30, 6); rookT(-22, 4, 24, 4.5); rookT(22, 4, 24, 4.5);
    // keep (behind the wall): big block, slate roof cone, king crown on top, queen coronet tower
    BX(30, 30, 18, M.castle, 0, 15, 10, g); crenel(g, 30, 18, 30); const kw = BX(30, 0.6, 18, M.stone, 0, 30.1, 10, g);
    for (let i = 0; i < 4; i++) for (let k = 0; k < 2; k++) { BX(2, 3.4, 0.2, castleWin, -10.5 + i * 7, 20 + k * 6, 0.9, g); BX(2.6, 0.4, 0.5, M.stone, -10.5 + i * 7, 18.1 + k * 6, 1.0, g); }
    const kc = CHESS.kingCrown(); kc.scale.setScalar(9); kc.position.set(0, 25, 10); g.add(kc);
    const qt = new T.Group(); qt.position.set(11, 30, 14); g.add(qt); qt.add(new T.Mesh(CHESS.latheGeo([[0, 0], [4, 0], [3.4, 2], [2.6, 9], [3.6, 10]], 32), M.castle)); const qc = CHESS.queenCrown(); qc.scale.setScalar(5.5); qc.position.y = 6.5; qt.add(qc);
    // the king's kitchen window (lit, low on the wall, left of the gate) with curtains
    const kit = SM({ map: tex((() => { const c = cnv(256, 256), q = c.getContext('2d'), gr = q.createRadialGradient(128, 110, 8, 128, 128, 170); gr.addColorStop(0, '#fff2c8'); gr.addColorStop(1, '#a8582a'); q.fillStyle = gr; q.fillRect(0, 0, 256, 256);
      q.fillStyle = '#d8d0c0'; for (let i = 0; i < 6; i++) q.fillRect(20 + i * 38, 150, 30, 70); q.fillStyle = '#7a4a2a'; q.fillRect(0, 140, 256, 12); q.fillStyle = '#b0b8c0'; [60, 120, 180].forEach((x) => { q.beginPath(); q.arc(x, 60, 18, 0, 7); q.fill(); });
      q.fillStyle = '#c4362e'; q.fillRect(0, 0, 40, 256); q.fillRect(216, 0, 40, 256); q.fillStyle = '#e8e2d0'; q.fillRect(124, 0, 8, 256); q.fillRect(0, 124, 256, 8); return c; })()), emissive: C('#ffffff'), roughness: 0.1 });
    kit.emissiveMap = kit.map; kit.emissiveIntensity = 0.4; props.kitchenGlass = kit;
    BX(5, 5, 0.2, kit, -12, 5.5, -4.1, g); BX(6, 0.6, 1, M.stone, -12, 2.8, -4.4, g); const sign = BX(4, 1.2, 0.2, SM({ map: tex((() => { const c = cnv(256, 80), q = c.getContext('2d'); q.fillStyle = '#2a1a10'; q.fillRect(0, 0, 256, 80); q.font = 'bold 40px Georgia'; q.fillStyle = '#f2d48a'; q.textAlign = 'center'; q.fillText('KITCHEN', 128, 54); return c; })()), roughness: 0.5 }), -12, 8.8, -4.2, g);
    // steps + banners on the wall
    [-30, 30].forEach((x) => { const b = new T.Mesh(new T.PlaneGeometry(4, 9), SM({ map: tex(CHESS.silCanvas(x < 0 ? 'king' : 'queen', '#f2d48a', '#5a1a6a', 256)), roughness: 0.8, side: T.DoubleSide })); b.position.set(x, 10, -4.1); g.add(b); });
  }
  props.castle = castle;

  // ---------- the school (g4, facing the rank-7 homes) ----------
  const school = new T.Group(); school.position.set(FX(6), 0, RZ(4) - 2); school.rotation.y = PI; scene.add(school); props.school = school;
  { const g = school, w = 14, d = 10, h = 9; BX(w + 0.6, 0.8, d + 0.6, M.stone, 0, 0.4, 0, g); BX(w, h, d, M.brick, 0, 0.8 + h / 2, 0, g);
    const rise = 4.5, sl = Math.hypot(w / 2 + 0.8, rise), ang = Math.atan2(rise, w / 2 + 0.8);
    [-1, 1].forEach((s) => { const m = BX(sl, 0.45, d + 1.6, M.roofB, 0, 0, 0, g); m.rotation.z = -s * ang; m.position.set(s * (w / 2 + 0.8) / 2, 0.8 + h + rise / 2 - 0.1, 0); });
    const gab = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(-w / 2, 0), new T.Vector2(w / 2, 0), new T.Vector2(0, rise)])), M.brick); gab.position.set(0, 0.8 + h, d / 2); g.add(gab);
    BX(3.4, 3.4, 3.4, M.plaster, 0, 0.8 + h + rise + 0.6, 0, g); const bell = new T.Mesh(CHESS.latheGeo([[0, 0], [1.1, 0], [0.9, 0.4], [0.6, 1.4], [0.2, 1.7], [0, 1.7]], 24), M.brass); bell.position.set(0, 0.8 + h + rise + 0.2, 0); g.add(bell);
    const cap = new T.Mesh(new T.ConeGeometry(2.8, 2.6, 4), M.roofR); cap.rotation.y = PI / 4; cap.position.set(0, 0.8 + h + rise + 3.6, 0); g.add(cap);
    BX(3, 5, 0.2, doorTex, 0, 0.8 + 2.5, d / 2 + 0.05, g); for (let k = 0; k < 3; k++) BX(5 - k, 0.3, 1.2, M.stone, 0, 0.95 + k * 0.3, d / 2 + 1.6 - k * 0.6, g);
    [-4.5, 4.5].forEach((x) => [2.6, 6.6].forEach((y) => BX(2.4, 2.4, 0.12, glassM[(x > 0) + 0], x, 0.8 + y, d / 2 + 0.06, g)));
    const ss = SM({ map: tex((() => { const c = cnv(512, 128), q = c.getContext('2d'); q.fillStyle = '#f2e6c8'; q.fillRect(0, 0, 512, 128); q.strokeStyle = '#2a4a8a'; q.lineWidth = 10; q.strokeRect(6, 6, 500, 116); q.font = '900 84px Georgia'; q.fillStyle = '#2a4a8a'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('SCHOOL', 256, 68); return c; })()), roughness: 0.6 });
    BX(7, 1.8, 0.25, ss, 0, 0.8 + h - 0.6, d / 2 + 0.15, g);
  }
  // ---------- the queen's throne terrace in front of the castle gate (8 steps up to a high throne) ----------
  const throne = new T.Group(); throne.position.set(0, 0, RZ(1) - 4); scene.add(throne); props.throne = throne;
  { const g = throne, carpet = SM({ color: '#6a1a5a', roughness: 0.9 });
    for (let k = 0; k < 8; k++) { const z = -4.7 - (7 - k) * 1.4, h = (k + 1) * 0.8; BX(18 - k * 0.8, h, 1.4, M.castle, 0, h / 2, z, g); BX(4, 0.06, 1.42, carpet, 0, h + 0.03, z, g); }
    BX(14, 6.4, 6.2, M.castle, 0, 3.2, -1, g); BX(4, 0.06, 6.2, carpet, 0, 6.43, -1, g);
    const th = new T.Group(); th.position.set(0, 6.4, 0.2); th.rotation.y = PI; g.add(th); const lq = CHESS.lacquer('w'), cush = SM({ color: '#5a1a6a', roughness: 0.8 });
    BX(4.6, 2.0, 3.4, lq, 0, 1.0, 0, th); BX(4.0, 0.5, 3.0, cush, 0, 2.2, 0.2, th); BX(4.6, 9, 0.8, lq, 0, 4.5, -1.6, th); BX(3.6, 6.4, 0.2, cush, 0, 5.0, -1.15, th);
    [-1, 1].forEach((s) => BX(0.6, 1.6, 3.2, lq, s * 2.2, 2.6, 0.1, th)); const qc = CHESS.queenCrown(); qc.scale.setScalar(3.2); qc.position.set(0, 9.6, -1.6); th.add(qc);
    g.userData.seat = V(0, 6.4, RZ(1) - 4 - 0.6);
  }
  // ---------- the rulebook on a lectern in the square by the fountain (pages = canvas, tiny print at the bottom) ----------
  const rulebook = new T.Group(); rulebook.position.set(-14, 0, RZ(4) - 6); rulebook.rotation.y = 0.5; scene.add(rulebook); props.rulebook = rulebook;
  { const g = rulebook; g.add(new T.Mesh(CHESS.latheGeo([[0, 0], [1.6, 0], [1.4, 0.5], [0.5, 0.9], [0.4, 3.6], [0.9, 3.9], [0, 3.9]], 24), M.stone));
    const top = new T.Group(); top.position.set(0, 4.1, 0); top.rotation.x = -0.55; g.add(top);
    BX(3.6, 0.3, 2.6, M.timber, 0, 0, 0, top);
    const page = (left) => { const c = cnv(512, 704), q = c.getContext('2d'); q.fillStyle = '#efe2c2'; q.fillRect(0, 0, 512, 704); const gr = q.createLinearGradient(left ? 512 : 0, 0, left ? 430 : 82, 0); gr.addColorStop(0, 'rgba(90,60,30,0.35)'); gr.addColorStop(1, 'rgba(90,60,30,0)'); q.fillStyle = gr; q.fillRect(0, 0, 512, 704);
      q.fillStyle = '#2a1a10'; q.textAlign = 'center'; q.font = 'bold 44px Georgia';
      if (left) { q.fillText('RULES OF', 256, 80); q.fillText('THE KINGDOM', 256, 132); q.font = '28px Georgia'; ['I. Move like your piece.', 'II. Rooks: straight lines.', 'III. Bishops: diagonals.', 'IV. Knights: the L.', 'V. Pawns: one square,', '      forward, once a day.', 'VI. Sunday is Game Night.'].forEach((t, i) => { q.textAlign = 'left'; q.fillText(t, 40, 210 + i * 56); }); }
      else { const ic = ['rook', 'bishop', 'knight', 'queen']; ic.forEach((k, i) => { const s = CHESS.silCanvas(k, '#2a1a10', null, 160); q.drawImage(s, 30 + (i % 2) * 250, 40 + Math.floor(i / 2) * 200, 180, 180); });
        q.textAlign = 'left'; q.font = '24px Georgia'; q.fillStyle = '#5a4030'; for (let i = 0; i < 4; i++) q.fillRect(40, 470 + i * 26, 430 - (i % 2) * 60, 3);
        q.fillStyle = '#2a1a10'; q.font = 'italic 19px Georgia'; q.fillText('* If a pawn reaches the last row,', 40, 612); q.fillText('   it can become anything.', 40, 636); }
      return SM({ map: tex(c), roughness: 0.85 }); };
    [[-0.86, true], [0.86, false]].forEach(([x, l]) => { const m = new T.Mesh(new T.PlaneGeometry(1.7, 2.34), page(l)); m.rotation.x = -PI / 2; m.rotation.y = l ? 0.06 : -0.06; m.position.set(x, 0.2, 0); top.add(m); });
    g.userData.top = top;
  }

  // ---------- the Box (on the table off the a-file) : exterior ----------
  const boxExt = new T.Group(); boxExt.position.set(-122, TABLE, -10); scene.add(boxExt);
  { const g = boxExt, w = 44, h = 34, d = 52, boxM = P(KIT.woodPlanks(512, 91, { rows: 4, tones: ['#8a6a4a', '#7a5a3c', '#94704e'], knots: 6 }), { physical: true, rough: 0.35, bump: 3, repeat: [1 / 16, 1 / 9] });
    BX(w, h, d, boxM, 0, h / 2, 0, g); const lid = BX(w + 1.2, 2.4, d + 1.2, boxM, 0, h + 1.6, 0, g); lid.rotation.z = 0.05; props.boxLid = lid;
    [-1, 1].forEach((sx) => [-1, 1].forEach((sz) => { BX(3, h, 0.4, M.brass, sx * (w / 2 - 1.5), h / 2, sz * (d / 2 + 0.1), g); BX(0.4, h, 3, M.brass, sx * (w / 2 + 0.1), h / 2, sz * (d / 2 - 1.5), g); }));
    const plate = SM({ map: tex(CHESS.silCanvas('pawn', '#c9a35a', '#2a1810')), roughness: 0.4, metalness: 0.5 }); const pl = new T.Mesh(new T.PlaneGeometry(10, 10), plate); pl.position.set(w / 2 + 0.05, h * 0.55, 0); pl.rotation.y = PI / 2; g.add(pl);
  }
  props.boxExt = boxExt;

  // ---------- the player's room around the giant table (only for wide shots: props.setRoom(true)) ----------
  const room = new T.Group(); room.visible = false; scene.add(room); props.room = room;
  { const RC = V(-30, 0, -10), FLOOR = TABLE - 380, g = room;
    const top = new T.Mesh(planeW(640, 540), M.table); top.rotation.x = -PI / 2; top.position.set(RC.x, TABLE, RC.z); g.add(top);
    BX(644, 14, 544, M.rim, RC.x, TABLE - 7.05, RC.z, g);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => BX(26, 370, 26, M.rim, RC.x + sx * 290, TABLE - 199, RC.z + sz * 240, g));
    const floorT = KIT.woodPlanks(1024, 33, { rows: 10, tones: ['#6a4428', '#5e3a22', '#74492c'], knots: 6 }), floorM = P(floorT, { rough: 0.6, bump: 2, repeat: [1 / 120, 1 / 120] });
    const fl = new T.Mesh(planeW(2000, 2000), floorM); fl.rotation.x = -PI / 2; fl.position.set(RC.x, FLOOR, RC.z); g.add(fl);
    const paperT = texPair(512, (q, hq, S) => { q.fillStyle = '#6a5a44'; q.fillRect(0, 0, S, S); for (let x = 0; x < S; x += 64) { q.fillStyle = 'rgba(40,30,20,0.35)'; q.fillRect(x, 0, 22, S); }
      const r = rng(34); for (let i = 0; i < 40; i++) { const x = r() * S, y = r() * S; q.fillStyle = 'rgba(200,170,110,0.18)'; q.beginPath(); q.ellipse(x, y, 10, 16, 0, 0, 7); q.fill(); } noiseOver(q, S, S, 35, 0.15, 6, 4); hq.fillStyle = '#808080'; hq.fillRect(0, 0, S, S); });
    const paperM = P(paperT, { rough: 0.9, bump: 1, repeat: [1 / 160, 1 / 160] }), dark = SM({ color: '#3a2a20', roughness: 0.8 });
    const RW = 820, RD = 760, RH = 1200;
    [[0, -RD, 0], [0, RD, PI], [-RW, 0, PI / 2], [RW, 0, -PI / 2]].forEach(([x, z, ry]) => { const w = new T.Mesh(planeW(2 * Math.max(RW, RD), RH), paperM); w.position.set(RC.x + x, FLOOR + RH / 2, RC.z + z); w.rotation.y = ry; g.add(w);
      const sk = BX(2 * Math.max(RW, RD), 40, 6, dark, 0, 0, 0, g); sk.position.set(RC.x + x, FLOOR + 20, RC.z + z); sk.rotation.y = ry; sk.translateZ(3); });
    const ceil = new T.Mesh(new T.PlaneGeometry(2 * RW, 2 * RD), SM({ color: '#4a3e34', roughness: 1 })); ceil.rotation.x = PI / 2; ceil.position.set(RC.x, FLOOR + RH, RC.z); g.add(ceil);
    // windows on the +z and -z walls (evening sky beyond), with curtains
    const winT = tex((() => { const c = cnv(256, 384), q = c.getContext('2d'), gr = q.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, '#2a4a8a'); gr.addColorStop(0.6, '#e8a070'); gr.addColorStop(1, '#ffd8a0'); q.fillStyle = gr; q.fillRect(0, 0, 256, 384);
      q.fillStyle = '#2a2018'; q.fillRect(0, 330, 256, 54); for (let i = 0; i < 9; i++) q.fillRect(i * 30, 300 - (i % 3) * 18, 22, 90); q.fillStyle = '#e8e0d0'; q.fillRect(122, 0, 12, 384); q.fillRect(0, 186, 256, 12); q.strokeStyle = '#e8e0d0'; q.lineWidth = 16; q.strokeRect(0, 0, 256, 384); return c; })());
    const winM = new T.MeshBasicMaterial({ map: winT, fog: false, color: C('#ffffff').multiplyScalar(1.3) }), curM = SM({ color: '#7a1c22', roughness: 0.9 });
    [[RD - 2, PI, 160], [-RD + 2, 0, -260]].forEach(([z, ry, x]) => { const w = new T.Mesh(new T.PlaneGeometry(300, 450), winM); w.position.set(RC.x + x, TABLE + 160, RC.z + z); w.rotation.y = ry; g.add(w);
      [-1, 1].forEach((s) => { const cu = new T.Mesh(new T.CylinderGeometry(40, 46, 560, 12, 1), curM); cu.scale.z = 0.35; cu.position.set(RC.x + x + s * 200, TABLE + 140, RC.z + z + (z > 0 ? -30 : 30)); g.add(cu); }); });
    // shelves with giant books on the side walls + a lamp glow
    const bookC = ['#7a1c22', '#24406a', '#2e5a2e', '#8a6a2a', '#4a2a5a', '#2a2a2a', '#a0522d'], r = rng(36);
    [-1, 1].forEach((s) => { for (let k = 0; k < 3; k++) { const y = TABLE + 40 + k * 190, x = RC.x + s * (RW - 60); BX(110, 12, 700, dark, x, y, RC.z, g);
      let z = RC.z - 340; while (z < RC.z + 330) { const h = 90 + r() * 70, w = 18 + r() * 20; BX(80, h, w, SM({ color: bookC[(r() * 7) | 0], roughness: 0.7 }), x, y + 6 + h / 2, z + w / 2, g); z += w + 2; if (r() < 0.08) z += 60; } } });
    const mug = new T.Mesh(new T.CylinderGeometry(34, 30, 80, 32), SM({ color: '#e9e3d6', roughness: 0.35 })); mug.position.set(RC.x + 250, TABLE + 40, RC.z + 200); g.add(mug);
    const hdl = new T.Mesh(new T.TorusGeometry(20, 6, 10, 24), mug.material); hdl.position.set(RC.x + 286, TABLE + 44, RC.z + 200); g.add(hdl);
    const roomL = new T.PointLight('#ffb070', 0, 3000, 1); roomL.position.set(RC.x - 400, TABLE + 500, RC.z + 400); g.add(roomL); props.roomLight = roomL;
  }
  props.setRoom = (on) => { room.visible = on; if (on) [props.lid.L, props.lid.R].forEach((g) => g.children.forEach((m) => { m.visible = false; })); tbl.visible = !on; dome.visible = !on; props.lid.ring.visible = !on; sunDisc.visible = sunDisc.visible && !on; props.roomLight.intensity = on ? 2500 : 0;
    if (on) { scene.fog.color.set('#4a3a2e'); scene.fog.density = 0.0006; scene.background = scene.fog.color; } };

  // ---------- fog bank over rank 8: volumetric (camera-facing soft noise puffs in depth layers + ground mist) ----------
  // props.setFog(k, c): k = 1 full fog, 0 = cleared (puffs drift away from c=[x,z] and fade)
  const puffTex = [0, 1, 2, 3].map((s) => { const S = 256, c = cnv(S, S), g = c.getContext('2d'), n = fbm(700 + s * 13, 3, 5), im = g.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const dx = (x - S / 2) / (S / 2), dy = (y - S / 2) / (S / 2), d = Math.sqrt(dx * dx + dy * dy * 1.3), v = n(x / S, y / S);
      const w = Math.min(1, Math.max(0, (v - 0.38) / 0.3)), a = Math.min(1, Math.max(0, 1 - d) ** 0.9 * w * w * 1.3), i = (y * S + x) * 4, l = Math.max(0, Math.min(255, 150 + v * 110 - dy * 55)); im.data[i] = im.data[i + 1] = im.data[i + 2] = Math.min(255, l); im.data[i + 3] = a * 255; }
    g.putImageData(im, 0, 0); return tex(c); });
  const fog = new T.Group(); scene.add(fog); props.fog = fog; const puffs = [];
  const fogMats = puffTex.map((t) => new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false, color: C('#f2f4f8'), opacity: 0.5 }));
  { const r = rng(311);
    for (let i = 0; i < 340; i++) { const zz = RZ(8) + 8 - Math.pow(r(), 0.9) * 130, depth = Math.max(0, (RZ(8) + 8 - zz) / 130), s = 7 + r() * 14 + depth * 26;
      const m = new T.Sprite(fogMats[i % 4].clone()); m.material.rotation = (r() - 0.5) * 0.6; const y = s * 0.18 + Math.pow(r(), 1.6) * (5 + depth * 34);
      m.position.set(-100 + r() * 200, y, zz); m.scale.set(s * (1.8 + r() * 1.2), s, 1); m.userData.p0 = m.position.clone(); m.userData.o0 = (0.55 + r() * 0.45) * (zz > RZ(8) + 2 ? 0.7 : 1); m.userData.tone = 0.72 + r() * 0.36; m.userData.s0 = m.scale.clone(); m.renderOrder = 3;
      fog.add(m); puffs.push(m); } }
  // low bank hugging the squares right at the edge of rank eight (thick at the ground, ragged on top)
  { const r = rng(313); for (let i = 0; i < 160; i++) { const zz = RZ(8) + 7 - r() * 30, s = 6 + r() * 10, m = new T.Sprite(fogMats[(i + 1) % 4].clone());
      m.material.rotation = (r() - 0.5) * 0.4; m.position.set(-100 + r() * 200, s * 0.22 + r() * 2.5, zz); m.scale.set(s * (2 + r()), s, 1); m.userData.p0 = m.position.clone(); m.userData.o0 = 0.7 + r() * 0.3; m.userData.tone = 0.8 + r() * 0.28; m.userData.s0 = m.scale.clone(); m.renderOrder = 3; fog.add(m); puffs.push(m); } }
  // ground mist: low flat noisy sheets hugging the squares of rank eight (wisps)
  const mistM = new T.MeshBasicMaterial({ map: puffTex[1], transparent: true, opacity: 0.6, depthWrite: false, fog: false, color: C('#f2f4f8') });
  { const r = rng(312); for (let i = 0; i < 26; i++) { const s = 24 + r() * 30, m = new T.Mesh(new T.PlaneGeometry(s * 1.8, s), mistM); m.rotation.set(-PI / 2, 0, r() * PI); m.position.set(-90 + r() * 180, 0.3 + r() * 1.2, RZ(8) + 6 - r() * 40); m.userData.p0 = m.position.clone(); m.renderOrder = 2; fog.add(m); puffs.push(m); } }
  const fogM = mistM; const bankMs = fogMats;
  props.fogK = 1;
  props.setFog = (k = 1, c = [0, RZ(8)]) => { props.fogK = k; const q = 1 - k;
    puffs.forEach((m, i) => { const p0 = m.userData.p0, dx = p0.x - c[0], dz = p0.z - c[1], d = Math.hypot(dx, dz) || 1, push = q * (40 + (i % 7) * 10);
      m.position.set(p0.x + dx / d * push, p0.y + q * (6 + (i % 5) * 3), p0.z + dz / d * push * 0.6);
      if (m.isSprite) { m.material.opacity = m.userData.o0 * Math.max(0, 1 - q * 1.15) * (d < 30 ? Math.max(0, 1 - q * 2.2) : 1); m.scale.copy(m.userData.s0).multiplyScalar(1 + q * 0.5); } });
    mistM.opacity = 0.6 * Math.max(0, 1 - q * 1.6); fog.visible = k > 0.02; };

  // ---------- sky: dome, sun disc, the cloud deck (the lid) and what's behind it ----------
  const skyTex = (top, mid, bot) => { const c = cnv(16, 512), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.55, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); return tex(c); };
  const SKY = { day: skyTex('#3a78d0', '#8ab8ea', '#dce8f2'), morning: skyTex('#5a88c8', '#f2c0a0', '#ffe2b8'), gamenight: skyTex('#06061a', '#1a1438', '#3a2248') };
  const dome = new T.Mesh(new T.SphereGeometry(1400, 32, 16), new T.MeshBasicMaterial({ map: SKY.day, side: T.BackSide, fog: false, depthWrite: false })); dome.renderOrder = -10; scene.add(dome);
  const sunDisc = new T.Mesh(new T.CircleGeometry(40, 32), new T.MeshBasicMaterial({ color: C('#fff0c8').multiplyScalar(4), fog: false })); scene.add(sunDisc);
  const cloudTex = [1, 2, 3, 4].map((seed) => { const c = cnv(512, 512), g = c.getContext('2d'), r = rng(seed * 31);
    for (let i = 0; i < 90; i++) { const a = r() * PI * 2, d = Math.sqrt(r()) * 170, x = 256 + Math.cos(a) * d, y = 256 + Math.sin(a) * d * 0.8, rad = 40 + r() * 70 * (1 - d / 260);
      const gr = g.createRadialGradient(x - rad * 0.2, y - rad * 0.3, 0, x, y, rad); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(215,220,232,0.8)'); gr.addColorStop(1, 'rgba(160,168,190,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); }
    return tex(c); });
  const cloudMs = cloudTex.map((t) => new T.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, side: T.DoubleSide, color: C('#ffffff') }));
  // lid: horizontal cloud billboards (seen from below as a ceiling) in two halves around the street centre
  const LID_C = V(FX(4) - 4, 0, STREET_Z), LID_Y = 150;
  const lidL = new T.Group(), lidR = new T.Group(), ring = new T.Group(); scene.add(lidL, lidR, ring); props.lid = { L: lidL, R: lidR, ring, k: 0, y: LID_Y, c: LID_C };
  { const r = rng(401);
    for (let i = 0; i < 150; i++) { const x = (r() - 0.5) * 360, z = (r() - 0.5) * 360, s = 60 + r() * 70, m = new T.Mesh(new T.PlaneGeometry(s, s * 0.85), cloudMs[i % 4]); m.rotation.set(-PI / 2 + (r() - 0.5) * 0.3, 0, r() * PI * 2); m.position.set(LID_C.x + x, LID_Y + r() * 30 + (Math.abs(x) + Math.abs(z)) * 0.08, LID_C.z + z); m.renderOrder = -4; (x < 0 ? lidL : lidR).add(m); }
    // distant ring of clouds near the horizon
    for (let i = 0; i < 40; i++) { const az = r() * PI * 2, d = 700 + r() * 300, w = 260 + r() * 260, m = new T.Mesh(new T.PlaneGeometry(w, w * 0.45), cloudMs[i % 4]); m.position.set(Math.cos(az) * d, 40 + r() * 140, Math.sin(az) * d); m.lookAt(0, 60, 0); m.renderOrder = -5; ring.add(m); } }
  // behind the lid: the player's room light (warm glow) + the light shaft
  const glowTex = (() => { const c = cnv(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,240,200,1)'); gr.addColorStop(0.4, 'rgba(255,190,110,0.7)'); gr.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return tex(c); })();
  const above = new T.Mesh(new T.PlaneGeometry(420, 300), new T.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, fog: false, blending: T.AdditiveBlending, color: C('#ffffff').multiplyScalar(1.3), toneMapped: false }));
  above.rotation.x = PI / 2; above.position.set(LID_C.x, LID_Y + 90, LID_C.z); above.renderOrder = -6; scene.add(above); props.above = above;
  const beamM = RBX.beamMat('#ffd8a0', 0.12); const beam = RBX.beam(V(LID_C.x, LID_Y + 10, LID_C.z), V(0, -1, 0.0), 70, 18, LID_Y + 10, beamM); scene.add(beam); props.beam = beam;
  props.openLid = (k) => { props.lid.k = k; lidL.position.x = -k * 55; lidR.position.x = k * 55; above.visible = beam.visible = k > 0.05; above.material.opacity = Math.min(1, k * 1.5); beamM.uniforms.k.value = 0.12 * Math.min(1, k * 1.4); };

  // ---------- the Hand ----------
  const hand = CHESS.hand({ sleeve: '#1e2846' }); hand.scale.setScalar(4.2); hand.visible = false; scene.add(hand); props.hand = hand;
  // place the hand so its pinch point is at world p (o: { yaw, tilt, pinch })
  const handFill = new T.PointLight('#ffb070', 0, 120, 2); scene.add(handFill); props.handFill = handFill;
  props.handAt = (p, o = {}) => { hand.visible = true; handFill.intensity = 250; handFill.position.set(p[0], p[1] - 22, p[2]); hand.userData.pinch(o.pinch ?? 0.5); hand.rotation.set(o.tilt ?? 0, o.yaw ?? 0, o.roll ?? 0); hand.position.set(0, 0, 0); hand.updateMatrixWorld(true);
    const tip = hand.localToWorld(hand.userData.tipMid()); hand.position.set(p[0] - tip.x, p[1] - tip.y, p[2] - tip.z); hand.updateMatrixWorld(true); return hand; };

  // ---------- lights ----------
  const hemi = new T.HemisphereLight('#cfe2ff', '#6a6050', 1.6); scene.add(hemi);
  const fill = new T.DirectionalLight('#c8d8ff', 1.2); fill.position.set(-200, 160, -300); scene.add(fill);
  const key = new T.DirectionalLight('#fff2dc', 5); key.castShadow = true; key.shadow.mapSize.set(4096, 4096);
  Object.assign(key.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 1, far: 900 }); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.05; key.target.position.set(-20, 0, -10); scene.add(key, key.target);
  const spot = new T.SpotLight('#ffcf90', 0, 0, 0.32, 0.6, 1.2); spot.position.set(LID_C.x, LID_Y + 20, LID_C.z); spot.target.position.set(LID_C.x, 0, LID_C.z); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); scene.add(spot, spot.target); props.spot = spot;
  const lampLights = lamps.slice(0, 12).map((p) => { const L = new T.PointLight('#ffb050', 0, 30, 2); L.position.copy(p); scene.add(L); return L; });
  const fogC = C('#b8cfe6'); scene.fog = new T.FogExp2(fogC, 0.0018);

  // ---------- finish: instancing + shadows ----------
  flushInst();
  scene.traverse((m) => { if (!m.isMesh) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material; const nb = mt.isMeshBasicMaterial || mt.isShaderMaterial || mt.transparent; m.castShadow = !nb; m.receiveShadow = !(mt.isMeshBasicMaterial || mt.isShaderMaterial); });
  tbl.castShadow = false;

  // ---------- moods ----------
  const setGlass = (k) => { glassM.forEach((m) => { m.emissiveIntensity = k; }); castleWin.emissiveIntensity = k > 1 ? k * 0.8 : 0; props.bakeryGlass.emissiveIntensity = k * 0.5 + 0.08; props.kitchenGlass.emissiveIntensity = k * 1.3 + 0.3; };
  const sunAt = (dir, d = 500) => key.position.copy(key.target.position).addScaledVector(dir.clone().normalize(), d);
  function mood(name) {
    const night = name === 'gamenight';
    [lidL, lidR].forEach((g) => g.children.forEach((m, i) => { m.visible = night || i % 5 === 0; }));
    dome.material.map = SKY[name] || SKY.day; sunDisc.visible = !night;
    lampLights.forEach((L) => { L.intensity = night ? 30 : 0; }); M.lamp.emissiveIntensity = night ? 0.9 : name === 'morning' ? 1.2 : 0.3;
    if (name === 'day') { hemi.color.set('#cfe2ff'); hemi.groundColor.set('#7a6a50'); hemi.intensity = 2.6; fill.intensity = 1.6; key.color.set('#fff2dc'); key.intensity = 5.5; sunAt(V(0.5, 1, 0.75)); fogC.set('#c8d8ea'); scene.fog.density = 0.0016; setGlass(0.15);
      cloudMs.forEach((m) => { m.color.set('#ffffff'); m.opacity = 1; }); spot.intensity = 0; props.openLid(0); sunDisc.position.copy(V(0.5, 1, 0.75).normalize().multiplyScalar(1200)); fogM.color.set('#f4f6fa'); puffs.forEach((m) => m.isSprite && m.material.color.set('#e4eaf2').multiplyScalar(m.userData.tone)); }
    if (name === 'morning') { hemi.color.set('#ffd8c0'); hemi.groundColor.set('#5a4a50'); hemi.intensity = 2.0; fill.intensity = 1.0; fill.color.set('#a8b8ff'); key.color.set('#ffb070'); key.intensity = 6; sunAt(V(0.9, 0.28, 0.5)); fogC.set('#f0c8b0'); scene.fog.density = 0.0022; setGlass(0.6);
      cloudMs.forEach((m) => { m.color.set('#ffd8c8'); m.opacity = 1; }); spot.intensity = 0; props.openLid(0); sunDisc.position.copy(V(0.9, 0.12, 0.5).normalize().multiplyScalar(1200)); fogM.color.set('#ffe8dc'); puffs.forEach((m) => m.isSprite && m.material.color.set('#f6dcd0').multiplyScalar(m.userData.tone)); }
    if (name === 'gamenight') { hemi.color.set('#3a3a8a'); hemi.groundColor.set('#1a1024'); hemi.intensity = 0.9; fill.intensity = 0.4; fill.color.set('#6a70c0'); key.color.set('#8090d0'); key.intensity = 1.2; sunAt(V(-0.3, 1, 0.4)); fogC.set('#1a1638'); scene.fog.density = 0.0026; setGlass(1.1);
      cloudMs.forEach((m) => { m.color.set('#4a3a62'); }); spot.intensity = 2500; props.openLid(1); fogM.color.set('#6a6a9a'); puffs.forEach((m) => m.isSprite && m.material.color.set('#5a5a88').multiplyScalar(m.userData.tone)); }
    scene.background = fogC;
  }
  mood('day');

  // ---------- marks ----------
  const mk = (name, x, y, z, ry = 0, sit) => { marks[name] = { p: [+x.toFixed(2), +y.toFixed(2), +z.toFixed(2)], ry }; if (sit) marks[name].sit = true; };
  const yard7 = RZ(7) + 5;   // in front of the rank-7 cottages
  mk('p_hero_home', FX(4), 0, yard7, 0); mk('p_dad_home', FX(4) + 3.5, 0, yard7 + 0.5, -0.3);
  mk('p_street_a', FX(2), 0, STREET_Z, PI / 2); mk('p_street_b', FX(3), 0, STREET_Z + 2, -PI / 2); mk('p_street_c', FX(5), 0, STREET_Z - 1, PI / 2); mk('p_street_d', FX(6), 0, STREET_Z + 1, -PI / 2);
  { const r = bakery.localToWorld(bakery.userData.roof.clone()); mk('p_bakery_roof', r.x, r.y, r.z, 0); }
  mk('p_baker_door', FX(4) + 3.6, 0, shopZ - 6.2, PI);
  mk('p_aunt', FX(2) + 2, 0, RZ(6) - 4, PI / 2); mk('p_uncle', FX(3) - 2, 0, RZ(6) - 4, -PI / 2);   // c6 light square / d6 dark square, waving across the line
  mk('p_rook_taxi', FX(6) - 3, 0, shopZ - 7.5, PI); mk('p_rook_taxi2', FX(6) + 3, 0, shopZ - 7.5, PI);
  mk('p_fog_edge', FX(4) - 8, 0, RZ(7) - SQ / 2 - 1.2, PI); mk('p_row8', FX(4) - 8, 0, RZ(8), PI);
  mk('p_queen', 0, 6.4, RZ(1) - 6.6, PI); mk('p_throne_foot', 0, 0, RZ(1) - 22, 0); mk('p_school_door', FX(6), 0, RZ(4) - 10, PI); mk('p_king_window', -12, 0, RZ(1) - 4.5, 0);
  mk('p_castle_gate', 0, 0, RZ(1) - 8, 0); mk('p_school_l0', FX(4), 0, RZ(5), 0); mk('p_school_l1', FX(5), 0, RZ(3), 0);
  marks.hand_street = { p: [LID_C.x, 34, LID_C.z] };

  // ---------- views ----------
  const views = {
    aerial: { p: [80, 64, -120], l: [-6, 0, 10], fov: 50, mood: 'day' },
    street_low: { p: [FX(5) + 4, 2.2, STREET_Z + 3], l: [FX(1), 7, STREET_Z - 4], fov: 60, mood: 'day' },
    bakery: { p: [FX(4) - 5, 4, STREET_Z - 5], l: [FX(4), 9, shopZ], fov: 58, mood: 'morning', grade: 'morning' },
    fog_edge: { p: [1.5, 4.5, RZ(7) + 4], l: [0, 6, RZ(8) - 4], fov: 58, mood: 'day' },
    castle: { p: [10, 24, 24], l: [0, 16, RZ(1) + 6], fov: 60, mood: 'day' },
    gamenight: { p: [FX(4) + 6, 3, STREET_Z - 5], l: [FX(4) - 2, 80, STREET_Z + 4], fov: 72, mood: 'gamenight', grade: 'gamenight' },
    box_ext: { p: [-70, 12, 40], l: [-120, 14, -10], fov: 55, mood: 'day' },
  };
  return { scene, grade: 'day', marks, props, mood, views, reset() { props.setRoom(false); mood('day'); hand.visible = false; props.handFill.intensity = 0; props.setFog(1); props.boxLid.rotation.z = 0.05; } };
};

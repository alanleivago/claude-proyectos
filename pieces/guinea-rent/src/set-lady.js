// =====================================================================
//  SET lady — the guinea-pig lady's cottage near Zurich: salmon floral wallpaper over a green wainscot, plank floor,
//  a window on the lake with the twin towers, the RENT-A-PIG chalkboard, a wall of framed pig portraits, a green
//  armchair, side table with a red phone, knitting basket, lamp, shelves of HAY, a stack of RENT-A-PIG boxes; the herd
//  in a low wooden pen (straw, two A-frame huts). The last shot ends on the gag: the rental box bursts into guinea pigs.
//  Registers s18, s28, s32, s33. Prefix ld. Room x -30..30, z 0..50, back wall z 0.
// =====================================================================
const LD = {};
const LD_X = 30, LD_Z = 76, LD_H = 24, LD_PEN = [-3, 20, 16, 10];   // pen centre x, z, width, depth
const LD_GAG = [8.2, 27.4], LD_OLD = [2.6, 23.4], LD_BOOM = 59.5;
function ldTexWall() { const t = tex((g, w, h) => { const wain = h * 0.72; g.fillStyle = '#d9826a'; g.fillRect(0, 0, w, wain);
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) { const x = (i + 0.5 + (j % 2) * 0.5) * w / 5, y = (j + 0.5) * wain / 5;
    g.fillStyle = 'rgba(255,236,210,0.38)'; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; g.beginPath(); g.ellipse(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, 4, a, 0, TAU); g.fill(); }
    g.fillStyle = 'rgba(120,60,40,0.4)'; g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); g.strokeStyle = 'rgba(70,110,70,0.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 10, y + 10); g.quadraticCurveTo(x + 22, y + 20, x + 18, y + 34); g.stroke(); }
  g.fillStyle = '#3f6a4a'; g.fillRect(0, wain, w, h - wain); g.strokeStyle = 'rgba(10,24,14,0.5)'; g.lineWidth = 4; for (let x = 0; x < w; x += 32) { g.beginPath(); g.moveTo(x, wain); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#efdcb4'; g.fillRect(0, wain - 8, w, 14); g.fillStyle = '#140e10'; g.fillRect(0, wain + 6, w, 3); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function ldTexBoard() { return tex((g, w, h) => { g.fillStyle = '#7a4a28'; g.fillRect(0, 0, w, h); g.fillStyle = '#26302c'; g.fillRect(20, 20, w - 40, h - 40);
  g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 8; i++) g.fillRect(30 + i * 120, 30, 60, h - 60);
  inked(g, 'RENT-A-PIG', w / 2, h * 0.3, h * 0.24, '#fff6e0', { stroke: false, font: 'Georgia, serif' });
  inked(g, 'old & calm companions', w / 2, h * 0.56, h * 0.1, '#ffd27a', { stroke: false });
  inked(g, 'ZURICH  ·  since 2008', w / 2, h * 0.76, h * 0.08, '#bfe6ff', { stroke: false });
  g.strokeStyle = '#fff6e0'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.2, h * 0.43); g.lineTo(w * 0.8, h * 0.43); g.stroke(); }, 1024, 440); }
function ldTexLake() { return tex((g, w, h) => { const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#3a4a8a'); sky.addColorStop(0.6, '#e89a7a'); sky.addColorStop(1, '#f6c890'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  g.fillStyle = '#5a6aa0'; g.beginPath(); g.moveTo(0, h * 0.62); g.quadraticCurveTo(w * 0.3, h * 0.48, w * 0.6, h * 0.58); g.quadraticCurveTo(w * 0.85, h * 0.5, w, h * 0.56); g.lineTo(w, h * 0.7); g.lineTo(0, h * 0.7); g.fill();
  g.fillStyle = '#3a4a7a'; g.fillRect(0, h * 0.7, w, h * 0.3); g.fillStyle = 'rgba(255,210,150,0.5)'; for (let i = 0; i < 8; i++) g.fillRect(w * 0.3 + i * 20, h * (0.74 + i * 0.025), 120 - i * 10, 4);
  for (const x of [0.62, 0.7]) { g.fillStyle = '#e8d8c0'; g.fillRect(w * x, h * 0.36, 34, h * 0.32); g.fillStyle = '#3a6a5a'; g.beginPath(); g.moveTo(w * x - 4, h * 0.36); g.lineTo(w * x + 17, h * 0.27); g.lineTo(w * x + 38, h * 0.36); g.fill(); g.fillStyle = '#2a1a14'; g.fillRect(w * x + 12, h * 0.42, 10, 16); }
  g.fillStyle = '#c8b8a0'; g.fillRect(w * 0.6, h * 0.55, w * 0.18, h * 0.14); g.fillStyle = '#ffd27a'; for (let i = 0; i < 6; i++) g.fillRect(w * 0.12 + i * 26, h * 0.62, 10, 10); }, 512, 512); }
// a framed pig portrait (k varies the fur)
function ldTexPortrait(k) { return tex((g, w, h) => { const [a, b] = HERD_FUR[k % HERD_FUR.length]; g.fillStyle = ['#e8d0a0', '#a8c8d8', '#d8b0c0', '#b8d0a0'][k % 4]; g.fillRect(0, 0, w, h);
  g.fillStyle = a; g.beginPath(); g.ellipse(w / 2, h * 0.62, w * 0.34, h * 0.24, 0, 0, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = '#2a1a14'; g.stroke();
  g.fillStyle = b; g.beginPath(); g.ellipse(w * 0.4, h * 0.55, w * 0.12, h * 0.1, 0, 0, TAU); g.fill(); g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(w * 0.44, h * 0.58, 6, 0, TAU); g.arc(w * 0.58, h * 0.58, 6, 0, TAU); g.fill();
  g.fillStyle = '#e8828c'; g.beginPath(); g.arc(w * 0.51, h * 0.65, 5, 0, TAU); g.fill(); g.lineWidth = 18; g.strokeStyle = '#b8862e'; g.strokeRect(0, 0, w, h); }, 192, 240); }
function ldTexContract() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fffaf0'; g.beginPath(); g.roundRect(8, 8, w - 16, h - 16, 10); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, 'CONTRACT', w / 2, h * 0.12, h * 0.08, '#c8323a', { stroke: false, font: 'Georgia, serif' }); g.fillStyle = 'rgba(40,30,20,0.45)'; for (let k = 0; k < 7; k++) g.fillRect(w * 0.12, h * (0.24 + k * 0.065), w * (0.5 + 0.25 * (k % 2)), 7);
  inked(g, 'COMPANION: 1', w * 0.12, h * 0.73, h * 0.05, '#2a1208', { stroke: false, align: 'left' });
  g.fillStyle = '#2a1208'; const px = w * 0.68, py = h * 0.86; g.beginPath(); g.ellipse(px, py + 10, 20, 15, 0, 0, TAU); g.fill(); for (const [dx, dy] of [[-22, -16], [-8, -26], [8, -26], [22, -16]]) { g.beginPath(); g.arc(px + dx, py + dy, 7, 0, TAU); g.fill(); }
  g.fillStyle = 'rgba(40,30,20,0.6)'; g.fillRect(w * 0.12, h * 0.9, w * 0.38, 3); }, 400, 520); }

function ldBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#ffe8d8', ambI: 0.6, sky: '#ffe0c0', ground: '#3a2a2a', key: '#ffe2c0', keyI: 1.05, keyP: [40, 50, 60], rim: '#a0b0ff', rimI: 0.35, rimP: [-40, 30, -30] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = ldTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  scene.add(pl(2 * LD_X, LD_Z, c3Prop('#ffffff', { map: hmTexFloor(), rough: 0.5, env: 0.6 }), 0, 0, LD_Z / 2, 0, -Math.PI / 2));
  const seg = (x0, x1, y0, y1) => scene.add(plNC(x1 - x0, y1 - y0, wallM(Math.max(1, (x1 - x0) / 12)), (x0 + x1) / 2, (y0 + y1) / 2, 0));
  seg(-LD_X, -27, 0, LD_H); seg(-27, -17, 0, 7); seg(-27, -17, 17, LD_H); seg(-17, LD_X, 0, LD_H);   // the window opening x -27..-17, y 7..17
  scene.add(plNC(LD_Z, LD_H, wallM(4), -LD_X, LD_H / 2, LD_Z / 2, Math.PI / 2)); scene.add(plNC(LD_Z, LD_H, wallM(4), LD_X, LD_H / 2, LD_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * LD_X, LD_H, wallM(5), 0, LD_H / 2, LD_Z, Math.PI)); scene.add(plNC(2 * LD_X, LD_Z, c3Prop('#f0e0c4', { rough: 0.9 }), 0, LD_H, LD_Z / 2, 0, Math.PI / 2));
  for (let x = -26; x <= 26; x += 8.6) scene.add(rbNC(0.9, 0.9, LD_Z, c3Prop('#6a3a20'), x, LD_H - 0.45, LD_Z / 2, 0.01));   // ceiling beams
  const cream = c3Prop('#efdcb4', { rough: 0.6 }), walnut = c3Prop('#6a3a20', { rough: 0.5 }), oak = c3Prop('#b0763a', { rough: 0.6 }), brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 });
  scene.add(pl(10, 10, c3Flat('#ffffff', { map: ldTexLake() }), -22, 12, -0.6));
  for (const [x, y, w, h] of [[-22, 17.2, 10.8, 0.5], [-22, 6.8, 11.4, 0.6], [-27.2, 12, 0.5, 10.6], [-16.8, 12, 0.5, 10.6], [-22, 12, 0.3, 10], [-22, 12, 10, 0.3]]) scene.add(rb(w, h, 0.6, cream, x, y, 0.1, 0.02));
  for (let i = 0; i < 5; i++) { const pot = cyl(0.5, 0.4, 0.8, c3Prop('#c96a3f'), -25.6 + i * 1.8, 7.5, 0.6, 0.01, 10); scene.add(pot); const b = c3Mesh(new THREE.SphereGeometry(0.55, 8, 6), c3Prop(['#e84a6a', '#ffd23a', '#e86a2a', '#c84ab0', '#ffffff'][i]), 0.008); b.position.set(-25.6 + i * 1.8, 8.3, 0.6); scene.add(b); }
  scene.add(pl(15, 6.4, c3Flat('#ffffff', { map: ldTexBoard() }), -5.5, 15.2, 0.2));
  for (let i = 0; i < 6; i++) scene.add(pl(2.0, 2.5, c3Flat('#ffffff', { map: ldTexPortrait(i) }), 7 + (i % 3) * 2.8, 13.6 + Math.floor(i / 3) * 3.2 + (i % 2) * 0.3, 0.15));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.3, 28), [walnut, c3Flat('#ffffff', { map: hmTexClock() }), walnut], 0.02); c.rotation.x = Math.PI / 2; c.position.set(17, 18.5, 0.2); scene.add(c); }
  // shelves of hay bags (right back), a stack of rental boxes
  { const g = new THREE.Group(); g.position.set(24, 0, 2.4); scene.add(g); g.add(rb(9, 13, 2.6, walnut, 0, 6.5, 0, 0.03));
    for (let i = 0; i < 3; i++) { g.add(rb(8.6, 0.3, 2.6, oak, 0, 3.6 + i * 4, 0.1, 0.01)); for (let j = 0; j < 3; j++) { const b = rb(2.4, 2.4, 1.8, c3Prop('#d8bc6a', { rough: 0.95 }), -2.8 + j * 2.8, 1.25 + i * 4 + 0.4, 0.3, 0.02); g.add(b); }
      g.add(pl(6, 0.9, c3Flat('#ffffff', { map: texSign('HAY', '#ffe6a0', '#3a2410', 0.6) }), 0, 3.0 + i * 4, 1.4)); } }
  for (let i = 0; i < 3; i++) { const b = rentBox(1); b.position.set(22.6 + (i % 2) * 0.5, i * 2.06, 9.4); b.rotation.y = -0.3 + i * 0.25; scene.add(b); }
  // the armchair, side table + red phone, knitting basket, floor lamp, rug
  { const g = new THREE.Group(); g.position.set(17, 0, 8.6); g.rotation.y = -0.35; scene.add(g); const gr = c3Prop('#3f7a4a', { rough: 0.85 });
    g.add(rb(6, 2.6, 5, gr, 0, 2.2, 0, 0.03)); g.add(rb(6, 6, 1.4, gr, 0, 5.4, -2.0, 0.03)); for (const x of [-3, 3]) g.add(rb(1.2, 3.8, 5, gr, x, 2.9, 0, 0.03)); g.add(rb(4.6, 1.8, 0.7, c3Prop('#e8c870', { rough: 0.9 }), 0, 4.4, -1.1, 0.02)); }
  { const g = new THREE.Group(); g.position.set(21.4, 0, 13.8); scene.add(g); g.add(cyl(1.5, 1.5, 0.3, oak, 0, 4.2, 0, 0.02, 20)); g.add(cyl(0.2, 0.3, 4.0, oak, 0, 2.0, 0, 0.01, 8)); g.add(cyl(1, 1.1, 0.2, oak, 0, 0.1, 0, 0.01, 14));
    g.add(rb(1.6, 0.6, 1.2, c3Prop('#d8282a', { rough: 0.35 }), 0, 4.65, 0, 0.012)); const hs = rb(1.8, 0.35, 0.45, c3Prop('#d8282a', { rough: 0.35 }), 0, 5.1, 0, 0.01); g.add(hs); }
  { const g = new THREE.Group(); g.position.set(12.4, 0, 6.4); scene.add(g); g.add(cyl(1.2, 0.9, 1.4, c3Prop('#b88a4a', { rough: 0.9 }), 0, 0.7, 0, 0.02, 14));
    for (const [x, c] of [[-0.4, '#c84a6a'], [0.45, '#3a8ac8'], [0, '#e8b83a']]) { const y = c3Mesh(new THREE.SphereGeometry(0.55, 10, 8), c3Prop(c, { rough: 0.9 }), 0.01); y.position.set(x, 1.5, (x * 7) % 0.5); g.add(y); } }
  { const g = new THREE.Group(); g.position.set(26, 0, 14); scene.add(g); g.add(cyl(0.9, 1.1, 0.3, brass, 0, 0.15, 0, 0.01, 14)); g.add(cyl(0.1, 0.1, 10, brass, 0, 5.1, 0, 0.005, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(1.0, 1.8, 2.2, 18, 1, true), (() => { const m = c3Prop('#f6c8a0', { emissive: '#ffb070', ei: 0.7, glow: '#ffb060' }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = 10.6; sh.userData.noCast = true; g.add(sh);
    const pt = new THREE.PointLight('#ffc070', 0.9, 34, 1.4); pt.position.set(-1, 9.6, 0.6); g.add(pt); }
  scene.add(pl(20, 12, c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#2f5a6a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c070'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40); g.fillStyle = 'rgba(232,192,112,0.5)';
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { g.beginPath(); g.arc(70 + i * 75, 80 + j * 80, 12, 0, TAU); g.fill(); } }, 512, 320), rough: 0.95 }), 14, 0.04, 30, 0, -Math.PI / 2));
  { const g = new THREE.Group(); g.position.set(-12, 16.5, 0.6); scene.add(g); const wd = c3Prop('#6a3a1e', { rough: 0.6 }); g.add(rb(2.6, 2.6, 1.0, wd, 0, 0, 0, 0.02));
    for (const sd of [-1, 1]) { const r = rb(2.1, 0.2, 1.4, c3Prop('#4a2a14'), sd * 0.8, 1.6, 0, 0.01); r.rotation.z = -sd * 0.6; g.add(r); }
    const f = c3Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.1, 20), [wd, c3Flat('#ffffff', { map: hmTexClock() }), wd], 0.01); f.rotation.x = Math.PI / 2; f.position.z = 0.55; g.add(f);
    for (const x of [-0.4, 0.4]) g.add(cyl(0.05, 0.05, 2.2, brass, x, -2.4, 0.2, 0, 4)); for (const x of [-0.4, 0.4]) { const cn = c3Mesh(new THREE.ConeGeometry(0.2, 0.6, 6), brass, 0.005); cn.position.set(x, -3.6, 0.2); g.add(cn); } }
  { scene.add(rb(8, 0.3, 1.4, walnut, -12, 10, 0.8, 0.01)); for (let i = 0; i < 6; i++) { const c = ['#e8b83a', '#c84a3a', '#7aa04a', '#e88a3a', '#c8c0e0', '#e86a8a'][i]; scene.add(cyl(0.4, 0.4, 1.0, c3Prop(c, { rough: 0.3 }), -15 + i * 1.2, 10.65, 0.8, 0.01, 10)); scene.add(cyl(0.42, 0.42, 0.2, c3Prop('#d8c8a0'), -15 + i * 1.2, 11.25, 0.8, 0.005, 10)); } }
  { const g = new THREE.Group(); g.position.set(21.4, 4.4, 14.6); scene.add(g); g.add(mug('#f6f0e6', 0.6, 0, -0.3)); const tp = c3Mesh(new THREE.SphereGeometry(0.5, 12, 8), c3Prop('#5aa0c8', { rough: 0.3 }), 0.01); tp.scale.y = 0.8; tp.position.set(-0.5, 0.4, 0.3); g.add(tp); }
  { const pn = c3Mesh(new THREE.ShapeGeometry((() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(4.4, 0.7); sh.lineTo(0, 1.4); sh.closePath(); return sh; })()), c3Flat('#2a6ac8'), 0.01); pn.position.set(3.0, 19, 0.2); pn.visible = false; scene.add(pn); }   // (review: read as a floating flag)
  { const g = new THREE.Group(); g.position.set(14.2, 0, 4.6); scene.add(g); g.add(cyl(1.1, 0.9, 1.1, c3Prop('#b88a4a', { rough: 0.9 }), 0, 0.55, 0, 0.02, 14)); for (let i = 0; i < 6; i++) { const c = c3Mesh(new THREE.ConeGeometry(0.18, 1.3, 8), c3Prop('#f07a22'), 0.006); c.position.set(-0.5 + (i % 3) * 0.5, 1.4, -0.2 + Math.floor(i / 3) * 0.4); c.rotation.z = Math.PI - 0.3 + i * 0.12; g.add(c); } }
  // ---- FOCUS: the pen (straw, a low board + top rail, posts), two A-frame huts, the hay rack, the gag box
  const F = new THREE.Group(); scene.add(F); const [px, pz, pw, pd] = LD_PEN;
  F.add(pl(pw, pd, c3Prop('#ffffff', { map: hmTexBedding(), rough: 0.95 }), px, 0.06, pz, 0, -Math.PI / 2));
  for (const [x, z, len, ry] of [[px, pz - pd / 2, pw, 0], [px - pw / 2, pz, pd, Math.PI / 2], [px + pw / 2, pz, pd, Math.PI / 2]]) {
    const b = rb(len, 0.6, 0.25, oak, x, 0.3, z, 0.015); b.rotation.y = ry; F.add(b); const r = rb(len, 0.22, 0.22, oak, x, 1.9, z, 0.01); r.rotation.y = ry; F.add(r); }
  F.add(rb(pw - 5, 0.6, 0.25, oak, px - 2.5, 0.3, pz + pd / 2, 0.015));   // the front: a low board only (faces read over it), a gate gap on the right
  for (let i = 0; i <= 8; i++) F.add(rb(0.3, 2.1, 0.3, walnut, px - pw / 2 + i * pw / 8, 1.05, pz - pd / 2, 0.01));
  for (let i = 0; i <= 4; i++) for (const x of [px - pw / 2, px + pw / 2]) F.add(rb(0.3, 2.1, 0.3, walnut, x, 1.05, pz - pd / 2 + i * pd / 4, 0.01));
  for (const [x, z] of [[-8.6, 16.4], [1.6, 16.0]]) { const g = new THREE.Group(); g.position.set(x, 0, z); F.add(g); const wd = c3Prop('#d49a5a', { rough: 0.7 });
    for (const sd of [-1, 1]) { const r = rb(2.6, 0.18, 3.0, wd, sd * 0.9, 1.15, 0, 0.012); r.rotation.z = -sd * 0.95; g.add(r); } g.add(pl(1.0, 1.2, c3Flat('#2a1610'), 0, 0.6, 1.0)); }
  { const g = new THREE.Group(); g.position.set(-3.4, 0, 15.3); F.add(g); g.add(rb(4, 2.4, 0.3, oak, 0, 1.4, 0, 0.01)); const R = RNG('ldhay'), hay = c3Prop('#e8c868', { rough: 0.95 });
    for (let i = 0; i < 22; i++) { const h = cyl(0.04, 0.04, 1.4, hay, R.n(1.6), 2.2 + R.f() * 0.6, 0.3 + R.f() * 0.4, 0, 4); h.rotation.set(R.n(1), R.f() * 3, R.n(1)); g.add(h); } }
  for (const [x, z] of [[-9.4, 22.6], [0.6, 18.6]]) { F.add(cyl(0.6, 0.45, 0.3, c3Prop('#e86a8a', { rough: 0.3 }), x, 0.15, z, 0.01, 14)); }
  for (const x of [-8, 2]) { F.add(cyl(0.3, 0.3, 1.4, c3Prop('#bfe6ff', { rough: 0.15 }), x, 1.3, LD_PEN[1] - LD_PEN[3] / 2 + 0.25, 0.008, 10)); }
  { const tn = c3Mesh(new THREE.TorusGeometry(0.9, 0.42, 10, 18, Math.PI), c3Prop('#e8c23a', { rough: 0.4 }), 0.015); tn.position.set(-6, 0, 18.4); tn.rotation.y = -0.5; F.add(tn); }
  s.box = rentBox(1); s.box.position.set(LD_GAG[0], 0, LD_GAG[1]); s.boxBase = s.box.children.map((c) => [c.position.clone(), c.rotation.clone()]);
  // the burst puffs: shaded, inked spheres (cream smoke + a hot yellow core for the first frames)
  // v3: each puff is a billowy CLUSTER (5-7 lumps of different sizes, cream to warm grey, the lower lumps darker) - cartoon smoke, not balls
  const smokeM = ['#fbf6ee', '#efe6da', '#ddd2c4', '#c8bcae'].map((c) => c3Prop(c, { rough: 1 })), hotM = c3Prop('#ffd23a', { emissive: '#ffb020', ei: 0.9, glow: '#ffc040' });
  s.puffs = Array.from({ length: 14 }, (_, i) => { const hot = i < 3, m = new THREE.Group(), n = hot ? 4 : 5 + (i % 3);
    for (let k = 0; k < n; k++) { const r = 0.45 + t3Rnd(i * 7 + k, 41) * 0.6, a = k / n * TAU + t3Rnd(i, k), dy = (t3Rnd(i * 5 + k, 42) - 0.4) * 0.7;
      const b = c3Mesh(new THREE.SphereGeometry(r, 16, 10), hot ? hotM : smokeM[Math.min(3, Math.max(0, Math.round(1.4 - dy * 2.4 + (k === 0 ? -1 : 0))))], 0.02);
      b.position.set(Math.cos(a) * 0.62 * (k ? 1 : 0), dy, Math.sin(a) * 0.45 * (k ? 1 : 0)); b.userData.noCast = true; m.add(b); }
    m.userData.noCast = true; m.visible = false; F.add(m); const a = t3Rnd(i, 11) * TAU, el = 0.15 + t3Rnd(i, 12) * 1.1; m.userData.dir = [Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el) * 0.7 + 0.3]; m.userData.r = hot ? 0.9 + t3Rnd(i, 13) * 0.4 : 0.55 + t3Rnd(i, 13) * 0.7; return m; }); s.box.rotation.y = -0.3; F.add(s.box);
  c3Layer(F, C3.L_FOCUS);
  // ---- people, the herd (13 in the pen), the old one, the 24 gag pigs; the contract card, a POP! burst, confetti
  toonPerson(s, 'lady'); toonPet(s, 'old', PETS.old);
  s.herd = []; const R = RNG('herdpos');
  for (let i = 0; i < 13; i++) { const c = i % 5, r = Math.floor(i / 5), x = px - pw / 2 + 1.8 + c * (pw - 4.6) / 4 + R.n(0.4) + (r % 2) * 1.2, z = pz - pd / 2 + 3.2 + r * 2.6 + R.n(0.4); s.herd.push([x, Math.min(z, pz + pd / 2 - 1.6)]); const hp = herdPet(i + 3); hp.size *= 1.25; toonPet(s, 'h' + i, hp); }
  for (let i = 0; i < 16; i++) { const hp = herdPet(i + 30); hp.size = 0.62 + t3Rnd(i, 2) * 0.12; toonPet(s, 'g' + i, hp); }
  s.ctr = canvasTex(400, 520); s.contract = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.0), new THREE.MeshLambertMaterial({ map: s.ctr.t })); s.contract.rotation.order = 'YXZ'; F.add(s.contract); c3Layer(s.contract, C3.L_FOCUS);
  s.pen = new THREE.Group(); { const b = cyl(0.08, 0.08, 1.7, c3Prop('#1a3a8a', { rough: 0.3 }), 0, 0.85, 0, 0.006, 8); s.pen.add(b); const tip = c3Mesh(new THREE.ConeGeometry(0.08, 0.22, 8), c3Prop('#e8e0cc'), 0.004); tip.rotation.x = Math.PI; tip.position.y = -0.1; s.pen.add(tip); } F.add(s.pen); c3Layer(s.pen, C3.L_FOCUS);
  s.pop = spritePlane(scene, texBurst(''), 6, 6); s.heart = spritePlane(scene, texHeart(), 1.6, 1.6);
  [s.pop, s.heart].forEach((m) => { m.material.depthTest = false; });
  { const n = 160, R2 = RNG('conf'), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), v = [], C = ['#ff4a5a', '#ffd23a', '#3ac0ff', '#7ae05a', '#ff8ad8', '#ffffff', '#d97f34'];
    for (let i = 0; i < n; i++) { const a = R2.f() * TAU, up = R2.r(0.3, 1), sp = R2.r(6, 16); v.push([Math.cos(a) * sp * 0.8, up * sp, Math.abs(Math.sin(a)) * sp * 0.9 + 3]); const c = new THREE.Color(C[i % C.length]); col.set([c.r, c.g, c.b], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    s.conf = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.42, vertexColors: true, toneMapped: false })); s.conf.userData.noInk2 = true; s.conf.userData.noCast = true; s.conf.renderOrder = 7; scene.add(s.conf); c3Layer(s.conf, C3.L_FOCUS);
    s.confAt = (tt) => { const k = Math.max(0, tt); for (let i = 0; i < n; i++) { pos[i * 3] = LD_GAG[0] + v[i][0] * k; pos[i * 3 + 1] = 1.8 + v[i][1] * k - 9 * k * k; pos[i * 3 + 2] = LD_GAG[1] + v[i][2] * k; } geo.attributes.position.needsUpdate = true; }; }
  s.dust = dustCloud(scene, [-26, 2, 4, 52, 18, 40], 200); c3Layer(s.dust, C3.L_BG);
  haze(scene, '#4a3438', 0.0065);
  c3Env(scene, { top: '#ffe0c0', mid: '#c87a6a', bot: '#2a1a18' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  return s;
}
const ldGet = () => LD.s ||= ldBuild();
SETS.lady = ldGet;
function ldReset(s, t) { hideAll(s); [s.contract, s.pen, s.pop, s.heart, s.conf, ...s.puffs].forEach((m) => { m.visible = false; }); s.box.children.forEach((c, i) => { c.position.copy(s.boxBase[i][0]); c.rotation.copy(s.boxBase[i][1]); }); s.box.visible = C3_SHOT && (C3_SHOT.id === 's33' || C3_SHOT.id === 's34'); s.box.rotation.set(0, -0.3, 0); s.box.userData.open(0); s.box.scale.setScalar(1); s.box.position.set(LD_GAG[0], 0, LD_GAG[1]); }
const ldCam = (s, id, lt, p, l, fov = 42) => c3SetCam(s.cam, camMove([[0, p, l, fov], [9, p, l, fov]], lt, id));
const ldRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a2030', bgBlur: 2.0, glow: 0.45, glowBlur: 12 }, o));
// the herd: idle in the pen, each one popcorning now and then (seeded); o.cheer = everyone hops from that time
function ldHerd(s, t, o = {}) { s.herd.forEach(([x, z], i) => { const ph = t3Rnd(i, 9) * 3, cyc = (t + ph) % 3.1, hop = (o.cheer != null && t >= o.cheer ? hopAt(t, o.cheer + (i % 5) * 0.07, 0.3) : 0) + (cyc < 0.3 ? Math.sin(Math.PI * cyc / 0.3) * 0.4 : 0);
  petAt(s, 'h' + i, t, x, 0, z, { expr: o.expr ? o.expr(i) : ['happy', 'smile', 'neutral', 'excited'][i % 4], facing: [-0.8, 0.5, 1.0, -0.3, 0.9, -1.0][i % 6], gaze: [((i % 3) - 1) * 0.4, 0], hop, blink: undefined }); }); }

// ---- s18: a lady who rents out guinea pigs — on her red phone by the armchair; the sign; the herd
SHOT_FN.s18 = (t, u, lt) => { const s = ldGet(); ldReset(s, t); ldCam(s, 's18', lt, [7, 6.6, 44], [3, 5, 14], 44);
  pose(s, 'lady', t, 17.4, 15.2, { facing: faceTo(s.cam, 17.4, 15.2, 8, 50), expr: [[0, 'talk'], [25.44, 'happy']], talk: 0.8, hand: { L: 'cross', R: { h: [0.3, -0.1], pole: [0.6, 1], hand: 'grip' } }, prop: { R: 'phone' }, gaze: [0.2, 0] });
  ldHerd(s, t); ldRender(s, { bgBlur: 3 }); };
SNAPS.s18 = [[25.04, ['u:lady'], 0.6], [25.44, [[-3, 1.8, 21, 9, 3.2, 6]], 0.95]];   // 'rents out guinea pigs': the herd, close and settled
// ---- s28: started renting out companions — the lady with her clipboard by the pen, the herd lined up
SHOT_FN.s28 = (t, u, lt) => { const s = ldGet(); ldReset(s, t); ldCam(s, 's28', lt, [4, 5.6, 44], [2, 3.4, 20], 44);
  pose(s, 'lady', t, 9.2, 22.4, { facing: faceTo(s.cam, 9.2, 22.4, 0, 20), expr: [[0, 'smile'], [45.76, 'smug']], hand: { L: 'hold', R: [[0, 'down'], [45.54, 'point']] }, prop: { L: 'paper' }, gaze: [-0.6, 0.3] });
  ldHerd(s, t, { cheer: 45.76 }); ldRender(s, { bgBlur: 3 }); };
SNAPS.s28 = [[44.98, ['p:lady', [-3, 2, 20, 16, 4, 10]], 0.82], [45.76, ['p:lady', [3, 1.2, 23, 5, 2.4, 3]], 0.85]];
// ---- s32: the rented one goes back home to her herd — the old pig scurries in through the gap, the herd pops
SHOT_FN.s32 = (t, u, lt) => { const s = ldGet(); ldReset(s, t); ldCam(s, 's32', lt, [9, 5.2, 42], [3, 2.2, 22], 42);
  const k = clamp((t - 52.94) / 1.4), x = lerp(11.5, LD_OLD[0], EZ.io(k)), z = lerp(29, LD_OLD[1], EZ.io(k));
  petAt(s, 'old', t, x, 0, z, k < 1 ? { mode: 'walk', phase: t * 3, facing: faceTo(s.cam, x, z, LD_OLD[0], LD_OLD[1]), expr: 'smile' } : { expr: 'happy', facing: 0.3, hop: hopAt(t, 54.44, 0.3) * 0.6 });
  pose(s, 'lady', t, 12.6, 26.6, { facing: faceTo(s.cam, 12.6, 26.6, 0, 24), expr: [[0, 'smile'], [54.44, 'happy']], hand: { L: 'hip', R: [[0, 'down'], [54.44, 'wave']] }, gaze: [-0.6, 0.4] });
  ldHerd(s, t, { cheer: 54.44 }); popAt(s.heart, pop(t, 54.5, 0.2), [LD_OLD[0], 3.2, LD_OLD[1]], s.cam); ldRender(s, { bgBlur: 4 }); };
SNAPS.s32 = [[52.94, ['p:old', 'p:lady'], 0.7], [53.9, [[-3, 2, 20, 16, 4, 10], 'p:old'], 0.88], [54.44, ['p:old', [0, 1, 23, 6, 2.4, 2]], 0.9]];
// ---- s33: nobody gets left alone — the herd + the old pig home, the lady; a slow push in over the pen
SHOT_FN.s33 = (t, u, lt) => { const s = ldGet(); ldReset(s, t); ldCam(s, 's33', lt, [4, 5.8, 44], [1, 2.8, 22], 42);
  pose(s, 'lady', t, 11.8, 25.2, { facing: faceTo(s.cam, 11.8, 25.2, 0, 22), expr: [[0, 'happy'], [55.8, 'smile']], hand: { L: 'hip', R: 'wave' }, gaze: [-0.6, 0.4] });
  petAt(s, 'old', t, LD_OLD[0], 0, LD_OLD[1], { expr: 'happy', facing: 0.3, hop: hopAt(t, 55.46, 0.3) * 0.5 });
  ldHerd(s, t, { cheer: 55.46 }); s.box.visible = true; ldRender(s, { bgBlur: 3 }); };
SNAPS.s33 = [[54.98, ['p:lady', [-3, 2, 20, 16, 4, 10]], 0.95], [55.8, [[-1, 1.6, 22, 10, 3, 6], 'p:old', 'p:lady'], 0.95]];
// ---- s34 (the long last take, 4.1 s): TOP-DOWN on the CONTRACT lying on the rental box: the terms write themselves on in
// handwriting as the pen moves, on "contract" the old pig's paw print stamps it (Ricks: info written on paper, top-down
// with a slow turning push); then the camera cranes up and back to the box, the old pig and the lady — and at 59.5 s
// the box bursts: the contract flies, confetti, and sixteen guinea pigs come flying at the lens.
const LD_CTR = [LD_GAG[0], 2.22, LD_GAG[1]];
const LD_HAND = [[56.5, 57.3, 'Companion: Old Bruno', 0.42], [57.3, 58.2, 'Term: until goodbye', 0.55]];
function ldContractDraw(g, w, h, t) { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.lineWidth = 8; g.strokeStyle = '#8a6a4a'; g.strokeRect(14, 14, w - 28, h - 28);
  inked(g, 'RENTAL CONTRACT', w / 2, h * 0.1, h * 0.06, '#c8323a', { stroke: false, font: 'Georgia, serif', weight: 700 }); inked(g, 'RENT-A-PIG · ZÜRICH', w / 2, h * 0.17, h * 0.035, '#5a4a3a', { stroke: false });
  g.fillStyle = 'rgba(40,30,20,0.35)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.1, h * (0.24 + k * 0.035), w * (0.6 + 0.2 * (k % 2)), 4);
  for (const [a, b, txt, y] of LD_HAND) { const k = clamp((t - a) / (b - a)); if (k <= 0) continue; g.save(); g.beginPath(); g.rect(0, 0, w * 0.08 + w * 0.84 * k, h); g.clip();
    g.font = `700 ${h * 0.05}px "Segoe Script", "Comic Sans MS", cursive`; g.fillStyle = '#1a3a8a'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(txt, w * 0.08, h * y); g.restore(); }
  g.fillStyle = 'rgba(40,30,20,0.6)'; g.fillRect(w * 0.1, h * 0.84, w * 0.36, 3); g.fillRect(w * 0.56, h * 0.84, w * 0.34, 3);
  inked(g, 'lady', w * 0.28, h * 0.89, h * 0.03, '#5a4a3a', { stroke: false }); inked(g, 'companion', w * 0.73, h * 0.89, h * 0.03, '#5a4a3a', { stroke: false });
  if (t >= 56.5) { g.font = `700 ${h * 0.05}px "Segoe Script", "Comic Sans MS", cursive`; g.fillStyle = '#1a3a8a'; g.textAlign = 'center'; g.save(); g.beginPath(); g.rect(0, 0, w * 0.1 + w * 0.36 * clamp((t - 56.36) / 0.14), h); g.clip(); g.fillText('Ursula', w * 0.28, h * 0.8); g.restore(); }
  if (t >= 58.48) { const k = Math.min(1, (t - 58.48) / 0.08); g.save(); g.translate(w * 0.73, h * 0.79); g.rotate(-0.2); g.scale(k, k); g.fillStyle = '#5a2a1a'; g.beginPath(); g.ellipse(0, 10, 24, 18, 0, 0, TAU); g.fill();
    for (const [dx, dy] of [[-26, -18], [-9, -30], [9, -30], [26, -18]]) { g.beginPath(); g.arc(dx, dy, 8, 0, TAU); g.fill(); } g.restore(); } }
const LD_FLY = Array.from({ length: 10 }, (_, i) => { const a = -1.3 + (i / 9) * 2.6 + t3Rnd(i, 3) * 0.15, sp = 9 + t3Rnd(i, 4) * 5; return [Math.sin(a) * sp * 1.15, 7 + t3Rnd(i, 5) * 6, 1.5 + t3Rnd(i, 6) * 3, (t3Rnd(i, 7) - 0.5) * 12]; });
SHOT_FN.s34 = (t, u, lt) => { const s = ldGet(); ldReset(s, t); s.box.visible = true;
  // camera: top-down (snap framings + drift) until 58.9 s, then a 0.55 s crane up and back to the oblique reveal
  const A = camMove([[0, [LD_CTR[0] + 0.25, 9.5, LD_CTR[2] + 1.1], LD_CTR, 40], [9, [LD_CTR[0] + 0.25, 9.5, LD_CTR[2] + 1.1], LD_CTR, 40]], lt, 's34');
  const lb = Math.max(0, t - 58.9), B = { p: [7.8 + lb * 0.15, 6.6 + lb * 0.25, 46 - lb * 1.2], l: [8.0, 3.9, 27.4], fov: 44 }, e = c3Smoother(clamp((t - 58.9) / 0.55));
  c3SetCam(s.cam, { p: A.p.map((v, j) => v + (B.p[j] - v) * e), l: A.l.map((v, j) => v + (B.l[j] - v) * e), fov: A.fov + (B.fov - A.fov) * e, roll: (A.roll || 0) * (1 - e) });
  const b = t - LD_BOOM;
  redraw(s.ctr, 'c' + Math.round(t * 30), (g, w, h) => ldContractDraw(g, w, h, t));
  s.contract.visible = b < 0.45; s.contract.position.set(LD_CTR[0], LD_CTR[1] + (b > 0 ? b * 9 - 6 * b * b : 0), LD_CTR[2] + (b > 0 ? b * 4 : 0)); s.contract.rotation.set(-Math.PI / 2 + (b > 0 ? b * 5 : 0), 0, 0.1 + (b > 0 ? b * 3 : 0));
  { const H = LD_HAND.find(([a, c]) => t >= a - 0.05 && t < c + 0.15); if (H && b < 0) { const k = clamp((t - H[0]) / (H[1] - H[0])), lx = -1.15 + 0.08 * 2.3 + 2.3 * 0.84 * k, ly = (0.5 - H[3]) * 3.0;
      s.pen.visible = true; s.pen.position.set(LD_CTR[0] + lx * Math.cos(0.1) - ly * Math.sin(0.1) * 0, LD_CTR[1] + 0.05 + Math.abs(Math.sin(t * 40)) * 0.05, LD_CTR[2] - ly); s.pen.rotation.set(0.5, 0, -0.5); } }
  pose(s, 'lady', t, 11.8, 25.2, { facing: faceTo(s.cam, 11.8, 25.2, 0, 22), expr: [[0, 'smile'], [58.48, 'smug'], [LD_BOOM, 'surprised']], hand: { L: [[0, 'hip'], [LD_BOOM, 'up']], R: [[0, 'down'], [LD_BOOM, 'up']] }, gaze: [-0.6, 0.3], lean: b >= 0 ? -0.12 : 0 });
  petAt(s, 'old', t, LD_GAG[0] - 2.4, 0, LD_GAG[1] + 0.6, { expr: [[0, 'smug'], [LD_BOOM, 'surprised']], facing: 0.4, hop: hopAt(t, LD_BOOM, 0.35) * 0.8 });
  ldHerd(s, t, { cheer: LD_BOOM, expr: (i) => b >= 0 ? (i % 2 ? 'surprised' : 'excited') : ['happy', 'smile'][i % 2] });
  if (b >= -0.35 && b < 0) { s.box.rotation.z = Math.sin(b * 90) * 0.08; s.box.scale.setScalar(1 + (b + 0.35) * 0.4); }   // it shakes, swells...
  if (b >= 0) {   // ...and bursts
    s.box.scale.setScalar(1); s.box.rotation.z = 0; s.box.userData.open(1);
    // the box breaks: every wall, flap and the floor fly off on their own arcs, spinning, and land
    s.box.children.forEach((c, i) => { if (i === 0) return; const [p0, r0] = s.boxBase[i], vx = (t3Rnd(i, 21) - 0.5) * 9 + (p0.x || 0) * 3, vz = (t3Rnd(i, 22) - 0.3) * 6 + (p0.z || 0) * 3, vy = 5 + t3Rnd(i, 23) * 6;
      const y = Math.max(0.05, p0.y + vy * b - 12 * b * b); c.position.set(p0.x + vx * b, y, p0.z + vz * b); c.rotation.set(r0.x + (t3Rnd(i, 24) - 0.5) * 14 * b, r0.y + (t3Rnd(i, 25) - 0.5) * 10 * b, r0.z + (t3Rnd(i, 26) - 0.5) * 14 * b); });
    // the puffs: burst out fast, billow, drift up and shrink away; the yellow core only for the first 0.12 s
    s.puffs.forEach((m, i) => { const hot = i < 4, d = 2.8 * EZ.o3(b / 0.28) + 0.8 * b, [dx, dy, dz] = m.userData.dir;
      const k = hot ? (b < 0.14 ? EZ.o3(b / 0.06) * (1 - b / 0.14) : 0) : (b < 0.22 ? EZ.o3(b / 0.22) : 1 - 0.75 * clamp((b - 0.45) / 0.55));
      m.visible = k > 0.02; m.position.set(LD_GAG[0] + dx * d * (hot ? 0.4 : 1), 1.2 + dy * d * (hot ? 0.4 : 1) + 1.6 * b, LD_GAG[1] + dz * d * (hot ? 0.4 : 1)); m.scale.setScalar(m.userData.r * k * (1 + 0.5 * clamp(b / 0.9))); m.rotation.set(b * (i % 2 ? 1.2 : -1.2), b * 0.8 + i, 0); });   // billows bigger as it drifts and thins
    // the guinea pigs tumble out: ballistic arcs with a spin, then they land with a squash and a little bounce
    LD_FLY.slice(0, 8).forEach(([vx, vy, vz, w], i) => { const tt = Math.max(0, b - (i % 4) * 0.03), vyy = 6 + t3Rnd(i, 31) * 4, vxx = vx * 0.55, vzz = 2.6 + t3Rnd(i, 32) * 2.6, tl = (vyy + Math.sqrt(vyy * vyy + 4 * 12 * 1.0)) / 24;
      const air = tt < tl, ta = Math.min(tt, tl), x = LD_GAG[0] + vxx * ta + (air ? 0 : vxx * 0.25 * (tt - tl)), z = LD_GAG[1] + vzz * ta, y = air ? Math.max(0, 1.0 + vyy * tt - 12 * tt * tt) : 0;
      petAt(s, 'g' + i, t, x, y, z, { expr: ['excited', 'surprised', 'grin', 'shock'][i % 4], facing: [-0.8, 0.6, -0.3, 1][i % 4], spin: air ? w * 0.6 * tt : 0, squash: air ? -0.25 : Math.max(0, 1 - (tt - tl) / 0.16) * 0.9, hop: air ? 0 : hopAt(tt, tl + 0.16, 0.22) * 0.35 }); });
  }
  ldRender(s, { bgBlur: 3 }); };
SNAPS.s34 = [[56.36, [[LD_CTR[0], LD_CTR[1], LD_CTR[2], 2.4, 0.2, 3.1]], 0.95], [57.3, [[LD_CTR[0], LD_CTR[1], LD_CTR[2] + 0.1, 2.0, 0.2, 1.4]], 0.95], [58.48, [[LD_CTR[0] + 0.5, LD_CTR[1], LD_CTR[2] + 0.9, 1.6, 0.2, 1.0]], 0.95]];
CAMF.s34 = { push: 0.06, orbit: 0, crane: 0, roll: 9 };

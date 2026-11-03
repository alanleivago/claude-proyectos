// =====================================================================
//  SET room — the Human Library reading room, ported from the approved mromidev test (app/src/videos/library/
//  library.ts): mustard plaster walls with a green wainscot and pilasters, three variants of painted book-spine shelves
//  on the back and side walls (two tiers, gallery rail, rolling ladder), high windows with sky + rooftops (the raking
//  key light comes from them), ceiling beams, clock + framed posters, the green LOANS desk (banker lamp, bell, mug,
//  card stacks, the desk globe), card-catalog cabinet, book carts, two rugs, plants, pendant lamps over five reading
//  tables. Registers SHOT_FN s02-s12, s16-s20. Prefix rm.
//  Coordinates: the test's metres mapped with R(x, h, z) = [-5x, 5h, 5(434 - z)] (back wall z = 0, entrance z = 110),
//  so every camera of the approved storyboard carries over with the same framing.
// =====================================================================
const RM = {};
const R = (x, h, z) => [-5 * x, 5 * h, 5 * (434 - z)];
const RM_X = 60, RM_Z = 110, RM_H = 38;
const RM_TABLE = { T1: [-7.5, 45], T2: [-36, 45], T3: [21, 45], T4: [7, 22], T5: [-23, 22] }, RM_SEAT = 3.5, RM_SIT = 2.7;
const RM_DESK = [30, 80], RM_GLOBE = [37, 5.3, 80];
// who sits where: [table, side (+1 = screen right seat, cx + 3.5), cast key, title or null]
const RM_SITTERS = [['T1', 1, 'you', null], ['T1', -1, 'man', 'FORMER PRISONER'], ['T2', 1, 'lady', null], ['T2', -1, 'fire', 'FIREFIGHTER'],
  ['T3', 1, 'r1', null], ['T3', -1, 'refu', 'REFUGEE'], ['T4', 1, 'r2', null], ['T4', -1, 'cop', 'POLICE OFFICER'], ['T5', 1, 'r3', null], ['T5', -1, 'tatt', 'COVERED IN TATTOOS']];
const seatPos = (tk, side) => { const [cx, cz] = RM_TABLE[tk]; return [cx + side * RM_SEAT, cz]; };

// ---- painted textures (the test's ctex drawings, same palette)
const RM_SPINES = ['#b8433a', '#3f6fb5', '#e0b03c', '#2f8a6a', '#7b5ac9', '#d9783a', '#3b4a7a', '#c25a7a', '#5d8a3a', '#8c3b4a', '#e7d9b8', '#2f5f6a'];
function rmTexShelf(v) { return tex((g, w, h) => { const r = RNG('rmshelf', v), sh = h / 4; g.fillStyle = '#7a4f33'; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) { const y0 = k * sh + 18, y1 = (k + 1) * sh - 10; g.fillStyle = '#3a2618'; g.fillRect(14, y0, w - 28, y1 - y0); let x = 18;
    while (x < w - 30) { const bw = 34 + r.f() * 30, bh = (y1 - y0) * (0.7 + r.f() * 0.26), lean = r.f() < 0.06, col = RM_SPINES[(Math.floor(x / 150) * 5 + k * 3 + v + (r.f() < 0.35 ? 1 : 0)) % RM_SPINES.length];
      g.save(); g.translate(x, y1); if (lean) g.rotate(0.12); g.fillStyle = col; g.fillRect(0, -bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(2, -bh + 2, 3, bh - 4);
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(bw - 4, -bh, 4, bh); g.fillStyle = 'rgba(255,236,170,0.75)'; g.fillRect(3, -bh * 0.78, bw - 6, 4); g.fillRect(3, -bh * 0.25, bw - 6, 3);
      g.strokeStyle = '#140e10'; g.lineWidth = 4; g.strokeRect(0, -bh, bw, bh); g.restore(); x += bw + (lean ? 8 : 1); }
    g.fillStyle = '#8a5a3c'; g.fillRect(0, y1, w, 14); g.fillStyle = '#140e10'; g.fillRect(0, y1 + 12, w, 3); }
  g.strokeStyle = '#140e10'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }, 512, 1126); }
function rmTexWall() { const t = tex((g, w, h) => { const r = RNG('rmwall'), wain = h * (1 - 1.1 / 7.6); g.fillStyle = '#2f9a8a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r.f() > 0.5 ? '255,255,255' : '150,100,40'},0.06)`; g.beginPath(); g.ellipse(r.f() * w, r.f() * wain, 30 + r.f() * 60, 20 + r.f() * 40, 0, 0, 7); g.fill(); }
  for (const x of [0, 256]) { g.fillStyle = 'rgba(150,100,40,0.18)'; g.fillRect(x, 0, 26, wain); g.fillStyle = '#140e10'; g.fillRect(x + 26, 0, 3, wain); }
  g.fillStyle = '#8c3b4a'; g.fillRect(0, wain, w, h - wain); for (let x = 0; x < w; x += 128) { g.strokeStyle = '#5a2030'; g.lineWidth = 6; g.strokeRect(x + 14, wain + 18, 100, h - wain - 34); }
  g.fillStyle = '#7a4f33'; g.fillRect(0, wain - 10, w, 14); g.fillStyle = '#140e10'; g.fillRect(0, wain + 3, w, 3); }, 512, 1024); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function rmTexRug(c = '#a8323a') { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0b03c'; g.lineWidth = 10; g.strokeRect(18, 18, w - 36, h - 36);
  g.strokeStyle = '#2f3f6a'; g.lineWidth = 6; g.strokeRect(40, 40, w - 80, h - 80); g.fillStyle = '#e0b03c'; for (const x of [140, 256, 372]) { g.beginPath(); g.moveTo(x, 80); g.lineTo(x + 34, 128); g.lineTo(x, 176); g.lineTo(x - 34, 128); g.closePath(); g.fill(); } }, 512, 256); }
function rmTexWindow() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5e93d9'); gr.addColorStop(1, '#cfe6ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; for (const [x, y] of [[90, 90], [300, 70], [420, 130]]) { g.beginPath(); g.ellipse(x, y, 60, 24, 0, 0, 7); g.ellipse(x + 40, y - 14, 40, 22, 0, 0, 7); g.fill(); }
  g.fillStyle = '#c96a3f'; g.fillRect(0, 200, 120, 56); g.fillStyle = '#e0b03c'; g.fillRect(130, 186, 90, 70); g.fillStyle = '#3f6fb5'; g.fillRect(380, 196, 132, 60);
  g.fillStyle = '#f6ecd2'; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 12, h); g.fillRect(0, 122, w, 12); g.strokeStyle = '#140e10'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); }, 512, 256); }
function rmTexClock() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fff8e8'; g.beginPath(); g.arc(128, 128, 118, 0, 7); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2f3f6a'; g.stroke();
  g.fillStyle = '#140e10'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(128 + Math.sin(a) * 92 - 4, 128 - Math.cos(a) * 92 - 8, 8, 16); }
  g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(128, 128); g.lineTo(128, 62); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(128, 128); g.lineTo(178, 150); g.stroke(); }, 256, 256); }
function rmTexPoster(kind) { return tex((g, w, h) => { const bg = { read: '#e0b03c', shh: '#2f6a52', map: '#7ec8e3', book: '#c25a7a' }[kind]; g.fillStyle = bg; g.fillRect(0, 0, w, h);
  if (kind === 'read') { inked(g, 'READ', 150, 110, 54, '#2f3f6a', { stroke: false }); g.fillStyle = '#c0353a'; g.beginPath(); g.moveTo(70, 330); g.lineTo(150, 190); g.lineTo(230, 330); g.closePath(); g.fill(); }
  if (kind === 'shh') { g.fillStyle = '#fff3d6'; g.beginPath(); g.arc(150, 120, 46, 0, 7); g.fill(); inked(g, 'SHH', 150, 230, 54, '#fff3d6', { stroke: false }); }
  if (kind === 'map') { g.fillStyle = '#5ea64a'; for (const [x, y, r] of [[90, 140, 50], [200, 200, 70], [120, 300, 40]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0.4, 0, 7); g.fill(); } g.fillStyle = '#e2453c'; g.beginPath(); g.arc(205, 190, 10, 0, 7); g.fill(); }
  if (kind === 'book') { g.fillStyle = '#fff3d6'; g.fillRect(70, 120, 160, 200); g.fillStyle = '#3f6fb5'; g.fillRect(70, 120, 24, 200); inked(g, 'BOOK', 160, 80, 44, '#140e10', { stroke: false }); }
  g.strokeStyle = '#140e10'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); }, 300, 400); }
function rmTexDrawers() { return tex((g, w, h) => { g.fillStyle = '#9a6440'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = 10 + c * 82, y = 10 + r * 61; g.fillStyle = '#b07a4a'; g.fillRect(x, y, 72, 52); g.strokeStyle = '#140e10'; g.lineWidth = 4; g.strokeRect(x, y, 72, 52);
    g.fillStyle = '#f4ecd8'; g.fillRect(x + 22, y + 10, 28, 12); g.fillStyle = '#c9a040'; g.beginPath(); g.arc(x + 36, y + 36, 6, 0, 7); g.fill(); } }, 256, 256); }
function rmTexBooksRow() { return tex((g, w, h) => { const r = RNG('rmrow'); let x = 0; while (x < w) { const bw = 18 + r.f() * 22; g.fillStyle = RM_SPINES[Math.floor(r.f() * RM_SPINES.length)];
  g.fillRect(x, h - (90 + r.f() * 38), bw, h); g.strokeStyle = '#140e10'; g.lineWidth = 3; g.strokeRect(x, 0, bw, h); x += bw; } }, 256, 128); }
function rmTexSign(txt, bg, fg = '#fff3d6') { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0b03c'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
  inked(g, txt, w / 2, h / 2 + 4, h * 0.5, fg, { stroke: false, maxW: w * 0.86 }); }, 512, 160); }
// a title card (the "book title" a volunteer is judged by) and other cards
function rmTexTitle(txt, bg = '#fff3d6', fg = '#2a1a10') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 34); g.fillStyle = bg; g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
  inked(g, txt, w / 2, h / 2 + 4, h * 0.42, fg, { stroke: false, maxW: w - 70 }); }, 760, 200); }
function rmTexStamp(txt) { return tex((g, w, h) => { g.fillStyle = '#f6ecd2'; g.fillRect(8, 8, w - 16, h - 16); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.strokeRect(8, 8, w - 16, h - 16);
  g.save(); g.translate(w / 2, h / 2); g.rotate(-0.16); g.strokeStyle = '#d23b3b'; g.lineWidth = 12; g.beginPath(); g.roundRect(-200, -70, 400, 140, 18); g.stroke();
  inked(g, txt, 0, 4, txt.length > 6 ? 62 : 80, '#d23b3b', { stroke: false, maxW: 370 }); g.restore(); }, 500, 300); }
function rmTexQ(c) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, '?', w / 2, h / 2, h * 0.82, c, { stroke: '#2a1208', sw: 20 }); }, 260, 280); }
function rmTexBubble(txt) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.ellipse(200, 120, 180, 100, 0, 0, 7); g.moveTo(130, 200); g.lineTo(90, 280); g.lineTo(190, 214);
  g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke(); inked(g, txt, 200, 124, 120, '#2a1208', { stroke: false }); }, 400, 300); }
function rmTexPin() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#2a1208'; g.lineWidth = 10; g.beginPath(); g.moveTo(60, 70); g.lineTo(60, 150); g.stroke();
  g.fillStyle = '#e2453c'; g.beginPath(); g.arc(60, 60, 34, 0, TAU); g.fill(); g.lineWidth = 7; g.stroke(); g.fillStyle = '#ffd0c8'; g.beginPath(); g.arc(50, 50, 9, 0, TAU); g.fill(); }, 120, 160); }
// the human catalog page: header, entries (portrait + title) revealed one by one; the cookbook crossed out; the pick highlighted
const RM_CAT = ['Cooking for Beginners', 'Refugee', 'Former Prisoner', 'Police Officer', 'Covered in Tattoos'];
const RM_CAT_T = [5.9, 8.4, 9.26, 10.52, 11.38], RM_CAT_COL = ['#e0b03c', '#5d7a3a', '#c0353a', '#24365e', '#2a2a2e'], RM_SKIN = ['#ffe2c2', '#f5c9a0', '#ecd0b6', '#c99067'];
function rmDrawCatalog(g, w, h, n, crossed, pick) {
  g.fillStyle = '#f6ecd2'; g.fillRect(0, 0, w, h); g.lineWidth = 14; g.strokeStyle = '#2a1208'; g.strokeRect(7, 7, w - 14, h - 14);
  g.fillStyle = '#2f6a52'; g.fillRect(14, 14, w - 28, 150); inked(g, 'CATALOG', w / 2, 92, 78, '#fff3d6', { stroke: false });
  for (let i = 0; i < n; i++) { const y = 210 + i * 196;
    g.fillStyle = i === pick ? '#ffe9a0' : '#fffaf0'; g.beginPath(); g.roundRect(40, y, w - 80, 170, 22); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1208'; g.stroke();
    if (i === 0) { g.fillStyle = '#c0353a'; g.fillRect(70, y + 20, 110, 130); g.lineWidth = 6; g.strokeRect(70, y + 20, 110, 130); g.fillStyle = '#fff3d6'; g.fillRect(88, y + 50, 74, 12); }
    else { g.fillStyle = RM_CAT_COL[i]; g.beginPath(); g.ellipse(125, y + 160, 58, 48, 0, Math.PI, 0); g.fill(); g.lineWidth = 6; g.stroke();
      g.fillStyle = RM_SKIN[(i + 1) % 4]; g.beginPath(); g.ellipse(125, y + 78, 40, 44, 0, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#2a1208'; g.beginPath(); g.ellipse(112, y + 76, 5, 7, 0, 0, 7); g.ellipse(138, y + 76, 5, 7, 0, 0, 7); g.fill(); }
    inked(g, RM_CAT[i], 210, y + 86, i === 0 ? 50 : 58, '#2a1208', { stroke: false, align: 'left', maxW: w - 270 });
    if (i === 0 && crossed > 0) { g.strokeStyle = '#d23b3b'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(200, y + 88); g.lineTo(200 + (w - 260) * crossed, y + 80); g.stroke(); } }
}

function rmBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam };
  // the key: low, raking, from the high windows on the screen-left wall (the test's interior sun, az -58 el 34)
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.55, sky: '#ffe8c8', ground: '#5a3a2a', key: '#fff0d8', keyI: 1.15, keyP: [-90, 70, 70], rim: '#ffc890', rimI: 0.45, rimP: [80, 40, -20] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = rmTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(2 * RM_X, RM_Z), c3Prop('#ffffff', { map: c3TexWall('wood', '#a8603a', { rep: [10, 9] }), rough: 0.55, env: 0.5 })); fl.rotation.x = -Math.PI / 2; fl.position.z = RM_Z / 2; scene.add(fl);
  scene.add(pl(2 * RM_X, RM_H, wallM(6), 0, RM_H / 2, 0));
  scene.add(pl(RM_Z, RM_H, wallM(5), -RM_X, RM_H / 2, RM_Z / 2, Math.PI / 2)); scene.add(pl(RM_Z, RM_H, wallM(5), RM_X, RM_H / 2, RM_Z / 2, -Math.PI / 2));
  scene.add(pl(2 * RM_X, RM_H, wallM(6), 0, RM_H / 2, RM_Z, Math.PI));
  const ceil = pl(2 * RM_X, RM_Z, c3Prop('#f1dfb6', { rough: 0.9 }), 0, RM_H, RM_Z / 2, 0, Math.PI / 2); scene.add(ceil);
  const dk = c3Prop('#6e4530', { rough: 0.7 }), wood = c3Prop('#9a6440', { rough: 0.6 });
  for (let x = -RM_X + 10; x < RM_X; x += 15) scene.add(rb(1.75, 2, RM_Z, dk, x, RM_H - 1, RM_Z / 2, 0.02));   // ceiling beams
  scene.add(rb(2 * RM_X, 1.25, 0.9, wood, 0, RM_H - 0.6, 0.45, 0.02));   // crown moulding
  // shelves: 5-unit bays, two tiers, back wall + both side walls (three spine variants)
  const SH = [0, 1, 2].map((v) => c3Prop('#ffffff', { map: rmTexShelf(v), rough: 0.75 }));
  const bay = (x, z, ry, k) => { for (const [tier, y] of [[0, 5.5], [1, 17.75]]) { const b = c3Mesh(new THREE.BoxGeometry(5, 11, 2.1), [dk, dk, dk, dk, SH[(k + tier) % 3], dk], 0.02); b.position.set(x, y, z); b.rotation.y = ry; scene.add(b); } };
  for (let i = 0; i < 22; i++) bay(-RM_X + 5 + i * 5, 1.25, 0, i);
  for (let i = 0; i < 16; i++) { const z = 5 + i * 5; bay(-RM_X + 1.25, z, Math.PI / 2, i + 1); bay(RM_X - 1.25, z, -Math.PI / 2, i + 2); }
  scene.add(rb(2 * RM_X, 0.5, 2.5, dk, 0, 23.5, 1.5, 0.02));   // gallery rail
  for (const x of [-19.5, -23]) scene.add(rb(0.4, 23, 0.4, dk, x, 11.5, 3.2, 0.01));   // rolling ladder
  for (let y = 2; y < 23; y += 2) scene.add(rb(3.5, 0.25, 0.3, dk, -21.25, y, 3.2, 0.005));
  // high windows (the key light's source), clock + framed posters, plants
  const win = c3Flat('#ffffff', { map: rmTexWindow() });
  for (const z of [87.5, 62.5, 37.5, 15]) for (const sx of [-1, 1]) { scene.add(pl(17, 8.5, win, sx * (RM_X - 0.1), 30, z, -sx * Math.PI / 2)); scene.add(rb(0.9, 0.4, 18, wood, sx * (RM_X - 0.5), 25.5, z, 0.01)); }
  scene.add(pl(6.5, 6.5, new THREE.MeshBasicMaterial({ map: rmTexClock(), transparent: true, toneMapped: false }), 0, 30.25, 0.3));
  [['read', 42.5], ['shh', 26], ['map', -26], ['book', -42.5]].forEach(([k, x]) => { scene.add(rb(6.8, 8.8, 0.3, dk, x, 30, 0.2, 0.02)); scene.add(pl(6, 8, c3Flat('#ffffff', { map: rmTexPoster(k) }), x, 30, 0.45)); });
  const leaf = [c3Prop('#5ea64a', { rough: 0.8 }), c3Prop('#4f9a44', { rough: 0.8 })], pot = c3Prop('#c96a3f', { rough: 0.7 });
  for (const [x, z, h] of [[56, 5, 8], [-56, 5, 8], [38, 92, 5.5], [5, 75, 6], [54, 97.5, 7], [-54, 97.5, 7], [-55, 60, 6]]) {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.4, 1.0, 2.5, pot, 0, 1.25, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.ConeGeometry(0.45, h * 0.7, 6), leaf[i % 2], 0.01); lf.position.set(Math.sin(a) * 0.8, 2.5 + h * 0.32, Math.cos(a) * 0.8); lf.rotation.set(0.45 * Math.cos(a), 0, -0.45 * Math.sin(a)); g.add(lf); } }
  // rugs
  const rug1 = pl(45, 21, c3Prop('#ffffff', { map: rmTexRug(), rough: 0.9 }), -15, 0.05, 45, 0, -Math.PI / 2); scene.add(rug1);
  const rug2 = pl(50, 17, c3Prop('#ffffff', { map: rmTexRug('#3f8ab8'), rough: 0.9 }), -7.5, 0.05, 22, 0, -Math.PI / 2); scene.add(rug2);
  // ---- the FOCUS layer: furniture in front of / around people (so tables and the desk occlude them correctly)
  const F = new THREE.Group(); scene.add(F);
  const green = c3Prop('#2f6a52', { rough: 0.6 }), top = c3Prop('#b07a4a', { rough: 0.5 }), chairM = c3Prop('#b8433a', { rough: 0.6 }), paper = c3Prop('#f4ecd8', { rough: 0.8 }), brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 });
  const [dx, dz] = RM_DESK;
  F.add(rb(19, 5, 4.5, green, dx, 2.5, dz, 0.03)); F.add(rb(20, 0.3, 5.5, top, dx, 5.15, dz, 0.02));
  F.add(pl(6, 1.9, c3Flat('#ffffff', { map: rmTexSign('LOANS', '#2f6a52') }), dx + 5.5, 3.1, dz + 2.3));   // off-centre: the subtitle sat on it
  F.add(rb(2, 0.3, 1.5, paper, dx - 5.5, 5.45, dz - 0.25, 0.01)); F.add(rb(1.25, 0.2, 0.85, dk, dx - 7.9, 5.4, dz - 0.4, 0.01));
  for (let i = 0; i < 4; i++) F.add(rb(1.5, 0.25, 1.1, [chairM, green, paper, top][i], dx - 8.5, 5.45 + i * 0.3, dz - 1.05, 0.005));
  F.add(cyl(0.3, 0.25, 0.6, chairM, dx + 3.75, 5.6, dz - 1.9, 0.01, 12));   // mug
  { const pen = cyl(0.09, 0.09, 2.6, c3Prop('#e0b03c'), dx + 2.7, 5.45, dz - 1.2, 0.01, 8); pen.rotation.set(Math.PI / 2, 0, 0.5); F.add(pen); }   // pencil, ink pad + stamp, index cards by the catalog
  F.add(rb(1.6, 0.25, 1.1, c3Prop('#2a3a6a'), dx - 2.9, 5.4, dz - 3.0, 0.01)); F.add(cyl(0.3, 0.3, 0.9, c3Prop('#6e4530'), dx - 2.9, 5.95, dz - 3.0, 0.01, 10));
  for (let i = 0; i < 3; i++) F.add(rb(1.5, 0.08, 1.0, paper, dx + 2.8, 5.35 + i * 0.09, dz - 3.4 + i * 0.12, 0.004));
  { const bell = c3Mesh(new THREE.SphereGeometry(0.35, 12, 8, 0, TAU, 0, 1.6), brass, 0.01); bell.position.set(dx + 3.6, 5.3, dz + 1.6); F.add(bell); }
  const lamp = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); F.add(g); g.add(cyl(0.35, 0.55, 0.25, brass, 0, 0.12, 0, 0.01, 12)); g.add(cyl(0.07, 0.07, 1.8, brass, 0, 1.0, 0, 0.005, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.3, 1.0, 0.8, 16, 1, true), (() => { const m = c3Prop('#2f8a5a', { rough: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = 2.1; g.add(sh);
    const b = c3Mesh(new THREE.SphereGeometry(0.3, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0); b.position.y = 1.8; g.add(b); };
  lamp(dx + 6, 5.3, dz - 1.25);
  // the desk globe (the test's earth texture), on a brass stand with a meridian ring
  s.globe = new THREE.Group(); s.globe.position.set(...RM_GLOBE); F.add(s.globe);
  s.globe.add(cyl(0.5, 0.65, 0.2, brass, 0, 0.1, 0, 0.01, 16)); s.globe.add(cyl(0.1, 0.1, 0.6, brass, 0, 0.4, 0, 0.005, 8));
  { const img = asset('img_earth.jpg'), et = img ? new THREE.Texture(img) : null; if (et) { et.encoding = THREE.sRGBEncoding; et.needsUpdate = true; }
    s.earth = new THREE.Mesh(new THREE.SphereGeometry(1.1, 40, 28), new THREE.MeshBasicMaterial({ map: et, color: '#eeeeee', toneMapped: false })); s.earth.position.y = 1.7; s.earth.rotation.z = 0.41; s.globe.add(s.earth);
    const ring = c3Mesh(new THREE.TorusGeometry(1.25, 0.06, 6, 40), brass, 0.01); ring.position.y = 1.7; ring.rotation.set(0.41, Math.PI / 2, 0); s.globe.add(ring); }
  // card-catalog cabinet + book carts
  F.add(rb(6, 6.5, 3.5, c3Prop('#ffffff', { map: rmTexDrawers() }), 50, 3.25, 83.25, 0.03)); F.add(rb(7, 0.3, 4, top, 50, 6.65, 83.25, 0.02));
  const rowM = c3Prop('#ffffff', { map: rmTexBooksRow() });
  for (const [x, z] of [[13, 77], [-49, 27]]) { const g = new THREE.Group(); g.position.set(x, 0, z); F.add(g);
    for (const y of [1.25, 3.75]) { g.add(rb(6, 0.25, 2.5, dk, 0, y, 0, 0.01)); g.add(rb(5.6, 1.5, 2, rowM, 0, y + 0.85, 0, 0.01)); }
    for (const sx of [-1, 1]) { const w = c3Mesh(new THREE.TorusGeometry(0.5, 0.15, 6, 14), c3Toon('#2a2a30'), 0.01); w.position.set(sx * 2.25, 0.5, 1.35); F.add(w); w.position.add(g.position); } }
  // reading tables: top, apron, legs, chairs (back rest BEHIND the sitter), a lamp, book stacks, a mug; pendant lamp above
  s.chairs = {};
  for (const [tk, [cx, cz]] of Object.entries(RM_TABLE)) {
    F.add(rb(4.5, 0.3, 5, top, cx, 3.75, cz, 0.02)); F.add(rb(4, 0.7, 4.5, wood, cx, 3.25, cz, 0.015));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) F.add(rb(0.5, 3.6, 0.5, dk, cx + sx * 1.85, 1.8, cz + sz * 2, 0.01));
    for (const side of [-1, 1]) { const x = cx + side * RM_SEAT;
      F.add(rb(2.4, 0.3, 2.4, chairM, x, 2.25, cz, 0.015)); F.add(rb(2.4, 2.9, 0.3, chairM, x, 3.8, cz - 1.15, 0.015));
      for (const lx of [-1, 1]) for (const lz of [-1, 1]) F.add(rb(0.3, 2.1, 0.3, dk, x + lx * 1, 1.05, cz + lz * 1, 0.005)); }
    lamp(cx - 0.5, 3.9, cz - 1.5);
    for (let i = 0; i < 3; i++) F.add(rb(1.2, 0.25, 1.55, [chairM, green, top][i], cx + 1.0, 4.03 + i * 0.25, cz + 1.0, 0.005));
    F.add(cyl(0.22, 0.2, 0.5, paper, cx - 1.4, 4.15, cz + 1.25, 0.005, 10));
    scene.add(cyl(0.04, 0.04, RM_H - 16.5, dk, cx, 16.5 + (RM_H - 16.5) / 2, cz, 0, 4));
    const pend = c3Mesh(new THREE.ConeGeometry(1.8, 1.5, 18, 1, true), (() => { const m = c3Prop('#2f8a5a'); m.side = THREE.DoubleSide; return m; })(), 0.02); pend.position.set(cx, 16.5, cz); scene.add(pend);
    const pb = c3Mesh(new THREE.SphereGeometry(0.45, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0); pb.position.set(cx, 16, cz); scene.add(pb);
    const pt = new THREE.PointLight('#ffd090', 0.35, 30, 1.6); pt.position.set(cx, 15, cz); scene.add(pt);
  }
  c3Layer(F, C3.L_FOCUS);
  // ---- people (one scale: kit person()), title cards, effects
  s.p = {};
  for (const [tk, side, who] of RM_SITTERS) { const [x, z] = seatPos(tk, side); const p = person(scene, who); p.g.position.set(x, RM_SIT, z); s.p[who] = p; }
  s.p.lib = person(scene, 'lib'); s.p.lib.g.position.set(31.5, FOOT, 75.25);
  s.p.youD = person(scene, 'you');   // you, standing at the desk (s03-s07, s20)
  s.p.manD = person(scene, 'man');   // him, standing at the desk (s20) / walking in (s08)
  s.titles = {}; for (const [tk, side, who, txt] of RM_SITTERS) if (txt) s.titles[who] = spritePlane(scene, rmTexTitle(txt), 7.6, 2.0);
  s.book = spritePlane(scene, rmTexTitle('THE BOOK', '#e0b03c'), 5.2, 1.37);
  s.qs = [0, 1, 2, 3, 4, 5, 6].map((i) => spritePlane(scene, rmTexQ(['#e0b03c', '#3f6fb5', '#e2453c'][i % 3]), 1.2, 1.3));
  s.bubQ = spritePlane(scene, rmTexBubble('?'), 4.6, 3.45); s.bubD = spritePlane(scene, rmTexBubble('...'), 4.6, 3.45);
  s.pins = Array.from({ length: 14 }, () => spritePlane(scene, rmTexPin(), 0.32, 0.43, 10));
  s.burst = spritePlane(scene, texBurst('STAMP'), 4, 4);
  s.stamp30 = pl(4.4, 2.64, new THREE.MeshBasicMaterial({ map: rmTexStamp('30 MIN'), toneMapped: false }), dx + 0.6, 6.4, dz + 1.4, 0, -Math.PI / 2); scene.add(s.stamp30); c3Layer(s.stamp30, C3.L_FOCUS);
  s.borrowed = spritePlane(scene, rmTexStamp('BORROWED'), 3.4, 2.04);
  s.cat = canvasTex(900, 1200);
  s.catM = pl(4.3, 5.73, new THREE.MeshBasicMaterial({ map: s.cat.t, toneMapped: false }), dx, 5.34, dz - 0.5, 0, -Math.PI / 2); scene.add(s.catM); c3Layer(s.catM, C3.L_FOCUS);
  c3Env(scene, { top: '#ffe8c8', mid: '#c8885a', bot: '#3a2418' });
  c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const rmGet = () => RM.s ||= rmBuild();
// hide everything shot-specific, then each shot turns on what it needs
function rmReset(s) {
  s.p.lib.g.visible = true;
  for (const k in s.titles) s.titles[k].visible = false;
  [s.book, s.bubQ, s.bubD, s.burst, s.stamp30, s.borrowed, s.catM, ...s.qs, ...s.pins].forEach((m) => { m.visible = false; });
  s.p.youD.g.visible = s.p.manD.g.visible = false;
  for (const [, , who] of RM_SITTERS) s.p[who].g.visible = true;
}
// everybody at the tables: talking pairs (the reader on the screen-right seat looks left at their book and back)
const RM_EXPR = { you: 'happy', man: 'neutral', lady: 'smirk', fire: 'happy', r1: 'talking', refu: 'happy', r2: 'happy', cop: 'talking', r3: 'talking', tatt: 'happy' };
function rmSitters(s, t, o = {}) {
  for (const [tk, side, who] of RM_SITTERS) { const p = s.p[who]; if (!p.g.visible) continue;
    const talk = Math.sin(t * 2.1 + who.length * 1.3) > 0.2;
    c3PersonPose(p, s.cam, t, { expr: (o.expr && o.expr[who]) || (talk ? 'talking' : RM_EXPR[who]), gaze: [-side * 0.8, 0.05], lean: (o.lean && o.lean[who]) || 0,
      hand: (o.hand && o.hand[who]) || { armL: [1.5, 1.6], armR: [-1.5, 1.6] }, ...sitFeet(RM_SIT) }); }
}
function rmTitles(s, k, y = 12.6) { for (const [tk, side, who, txt] of RM_SITTERS) if (txt) { const m = s.titles[who], [x, z] = seatPos(tk, side);
  m.visible = k > 0.02 && s.p[who].g.visible; if (!m.visible) continue;
  { s.cam.updateMatrixWorld(true); const hw = 3.8 * k, sp = (dx0) => V3(x + dx0, y, z).project(s.cam).x; if (Math.min(sp(-hw), sp(hw)) < -0.95 || Math.max(sp(-hw), sp(hw)) > 0.95) { m.visible = false; continue; } } m.position.set(x, y, z); facing(m, s.cam); m.scale.setScalar(k); } }   // (cards that would touch the frame edge are dropped)
const rmRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2f9a8a', bgBlur: 1.2, glow: 0.45, glowBlur: 12 }, o));
const RM_CM = { orbit: 0.006, creep: 0, rush: 0.03 };   // the kit's C3_CAMFX does the creep and punches
const K1 = (p, l, fov) => [[0, p, l, fov], [9, p, l, fov]];

// ---- s02: the reveal (after the white flash): every table a reader + a person under a title
SHOT_FN['s02'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-10.5, 4.4, 413.2), R(2.6, 1.0, 427.5), 54), lt, 's02', RM_CM));
  s.p.you.g.visible = s.p.man.g.visible = false; rmSitters(s, t); rmTitles(s, 2.4, 14.6); rmRender(s); };   // bigger titles (user)
// ---- s03: you walk up to the desk, the librarian slides the catalog across
SHOT_FN['s03'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-5.25, 1.85, 412.4), R(-5.6, 1.25, 418.3), 44), lt, 's03', RM_CM));
  const w = clamp((t - 2.95) / 0.95), x = lerp(48, 24.75, EZ.io(w)), y = s.p.youD;
  y.g.visible = true; y.g.position.set(x, FOOT, 86.5); rmSitters(s, t);
  c3PersonPose(y, s.cam, t, { expr: 'happy', gaze: [-0.6, 0], ...(w > 0 && w < 1 ? walkFeet(t * 11) : STAND), hand: { armL: [1.4, 1.2], armR: [-1.4, 1.2] } });
  const k = EZ.io(clamp((t - 4.5) / 0.4)); c3PersonPose(s.p.lib, s.cam, t, { expr: 'happy', gaze: [0.6, -0.1], hand: { armL: [1.4, 1.4], armR: [lerp(-1.4, -2.6, k), lerp(1.4, 2.6, k)] }, ...STAND });
  s.catM.visible = true; s.catM.scale.setScalar(0.55); s.catM.position.set(lerp(31.5, 27, k), 5.34, 80.6); s.catM.rotation.z = -0.3; redraw(s.cat, 'closed', (g, W0, H0) => rmDrawCatalog(g, W0, H0, 0, 0, -1));
  rmRender(s); };
// ---- s04: the catalog insert — entries pop on each title, the cookbook gets crossed out, Former Prisoner highlighted at the end
SHOT_FN['s04'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  { const A0 = [30, 17, 79.5], L0 = [30, 5.3, 77.7], A1 = [30, 17, 81.4], L1 = [30, 5.3, 79.6];   // looks down the page as it fills
    c3SetCam(s.cam, camMove([[0, A0, L0, 44], [2.6, A0, L0, 44], [5.8, A1, L1, 44], [9, A1, L1, 44]], lt, 's04', Object.assign({}, RM_CM, { creep: 0.02 }))); }   // the insert creeps in too
  const n = RM_CAT_T.filter((x) => t >= x - 0.07).length, cr = Math.round(clamp((t - 7.4) / 0.35) * 20) / 20, pick = t > 12.1 ? 2 : -1;
  s.catM.visible = true; s.catM.scale.setScalar(0.92); s.catM.position.set(RM_DESK[0], 5.34, RM_DESK[1] - 1.9); s.catM.rotation.z = 0;
  redraw(s.cat, `${n}|${cr}|${pick}`, (g, W0, H0) => rmDrawCatalog(g, W0, H0, n, cr, pick));
  s.p.lib.g.visible = false; rmSitters(s, t); rmRender(s, { bgBlur: 0.6 }); };   // the librarian's arm crossed the insert
// ---- s05: you, nervous, then brave on "Former Prisoner, please"
SHOT_FN['s05'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-4.4, 1.75, 413.0), R(-5.6, 1.4, 416.9), 46), lt, 's05', RM_CM));
  const y = s.p.youD; y.g.visible = true; y.g.position.set(28, FOOT, 85.5); rmSitters(s, t);
  c3PersonPose(y, s.cam, t, { expr: c3FaceAt([[0, 'nervous'], [13.18, 'determined'], [14.16, 'excited']], t, 'you'), gaze: [0, 0.1], lift: (q) => q > 14.16 && q < 14.5 ? 0.3 : 0,
    hand: t > 14.16 ? { armL: [1.4, 1.2], armR: [-2.0, 3.6] } : { armL: [1.3, 1.6], armR: [-1.3, 1.6] }, ...STAND });
  c3PersonPose(s.p.lib, s.cam, t, { expr: 'neutral', ...STAND }); rmRender(s); };
// ---- s06: STAMP (impact kick + burst), the 30 MIN card on the desk
SHOT_FN['s06'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-6.25, 1.6, 414.5), R(-6.05, 1.4, 419), 40), lt, 's06', RM_CM));
  const y = s.p.youD; y.g.visible = true; y.g.position.set(25, FOOT, 87); rmSitters(s, t);
  const hit = 16.2, down = t > hit - 0.25 && t < hit + 0.1;
  c3PersonPose(s.p.lib, s.cam, t, { expr: 'neutral', gaze: [0.2, -0.3], hand: { armL: [1.4, 1.4], armR: down ? [-1.2, 0.8] : [-1.5, 3.2] }, ...STAND });
  c3PersonPose(y, s.cam, t, { expr: t > hit ? 'surprised' : 'happy', gaze: [-0.5, 0], ...STAND });
  s.stamp30.visible = t >= hit; s.stamp30.rotation.x = -Math.PI / 2 + 1.0; s.stamp30.position.set(RM_DESK[0] + 0.4, 6.2, RM_DESK[1] - 1.6);
  // (the 30 MIN card is propped up on the desk, above the subtitle line)
  const bk = t >= hit && t < hit + 0.3 ? EZ.o3((t - hit) / 0.3) : 0;
  s.burst.visible = bk > 0; if (bk > 0) { s.burst.position.set(29, 6.8, 82); facing(s.burst, s.cam); s.burst.scale.setScalar(0.4 + bk * 0.8); }
  rmRender(s); };
// ---- s07: the librarian, deadpan: "Thirty minutes. Please return him in the same condition." (long take from s06)
SHOT_FN['s07'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-6.3, 1.75, 414.6), R(-6.25, 1.45, 419), 44), lt, 's07', RM_CM));
  s.stamp30.visible = true; rmSitters(s, t);
  c3PersonPose(s.p.lib, s.cam, t, { expr: c3FaceAt([[0, 'deadpan'], [18.28, 'talking'], [19.54, 'smirk']], t, 'lib'), gaze: [0, 0], hand: { armL: [1.5, 2.8], armR: [-1.4, 1.4] }, ...STAND }); rmRender(s); };
// ---- s08: the man walks down the aisle (the camera tracks him from high) and sits on "sits"
const rmManX = (t) => lerp(-44, -12, EZ.io(clamp((t - 20.44) / 1.42)));
SHOT_FN['s08'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  const mx = rmManX(t), cx = Math.max(mx - 2, -38); c3SetCam(s.cam, camMove(K1([cx, 19, 76], [cx + 3, 5, 33.5], 44), lt, 's08', RM_CM));   // clamped clear of the side wall
  const sit = t >= 22.06; s.p.man.g.visible = sit; rmSitters(s, t);
  if (!sit) { const m = s.p.manD; m.g.visible = true; const zz = t < 21.86 ? 33.5 : lerp(33.5, 45, clamp((t - 21.86) / 0.2)); m.g.position.set(t < 21.86 ? mx : -11, FOOT, zz);
    c3PersonPose(m, s.cam, t, { expr: 'happy', gaze: [0.6, 0], ...(t > 20.44 ? walkFeet(t * 10) : STAND), hand: { armL: [1.4, 1.0], armR: [-1.4, 1.0] } }); }
  rmRender(s); };
// ---- s09: the awkward two-shot, question marks burst over you on "a hundred questions"
SHOT_FN['s09'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(1.5, 1.7, 418.8), R(1.5, 1.3, 425), 47), lt, 's09', RM_CM));
  rmSitters(s, t, { expr: { you: t < 24.4 ? 'nervous' : 'confused', man: 'neutral' }, hand: { you: { armL: [1.2, 2.2], armR: [-1.2, 2.2] } } });
  const [yx, yz] = seatPos('T1', 1);
  s.qs.forEach((m, i) => { const k = pop(t, 25.24 + i * 0.2, 0.2); m.visible = k > 0.01; if (!m.visible) return; const a = -0.8 + i * 0.27, r = 1.7 + (i % 3) * 0.3;
    m.position.set(yx + Math.sin(a) * r, 11.5 + Math.cos(a) * r * 0.55, yz + 0.6); facing(m, s.cam); m.scale.setScalar(k); });
  rmRender(s); };
// ---- s10: him, "He's the book" — THE BOOK card pops over his head (long take from s09)
SHOT_FN['s10'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(2.0, 1.75, 419.9), R(2.2, 1.3, 425), 42), lt, 's10', RM_CM));   // medium shot (user: open the close-up)
  rmSitters(s, t, { expr: { man: t < 29.0 ? 'neutral' : 'happy', you: 'surprised' } });
  const k = pop(t, 29.56, 0.25), [mx, mz] = seatPos('T1', -1); s.book.visible = k > 0.01; if (s.book.visible) { s.book.position.set(mx + 1.0, 10.6, mz + 0.8); s.book.scale.multiplyScalar(0.8); facing(s.book, s.cam); s.book.scale.setScalar(k); }
  rmRender(s); };
// ---- s11: glide to the next table: the lady leans over on "leans", her firefighter waves on "firefighter"
SHOT_FN['s11'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove([[0, R(2.2, 1.65, 419.0), R(2.5, 1.15, 425), 42], [0.6, R(2.2, 1.65, 419.0), R(2.5, 1.15, 425), 42], [1.8, R(6.95, 1.7, 418.8), R(6.95, 1.25, 425), 42], [9, R(6.95, 1.7, 418.8), R(6.95, 1.25, 425), 42]], lt, 's11', RM_CM));
  const lean = EZ.io(clamp((t - 33.0) / 0.4)), wave = t > 35.44 && t < 37.0;
  rmSitters(s, t, { lean: { lady: 0.14 * lean }, expr: { lady: lean > 0.5 ? 'smirk' : 'happy', fire: wave ? 'excited' : 'happy' },
    hand: { fire: wave ? { armL: [1.4, 1.2], armR: [-2.0, 4.0 + 0.5 * Math.sin(t * 12)] } : null, lady: null } });
  rmRender(s); };
// ---- s12: the lady, smug: "Mine's way more interesting than yours, by the way." (long take from s11)
SHOT_FN['s12'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(6.3, 1.8, 418.6), R(6.38, 1.25, 425), 46), lt, 's12', RM_CM));   // medium shot
  rmSitters(s, t, { lean: { lady: 0.14 }, expr: { lady: c3FaceAt([[0, 'smirk'], [36.26, 'talking'], [38.0, 'smug']], t, 'lady'), fire: 'happy' }, hand: {} });
  rmRender(s); };
// ---- s16: the rules at one table: sit down, ask ('?'), they answer ('...')
SHOT_FN['s16'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-4.2, 1.7, 418.5), R(-4.2, 1.25, 425), 42), lt, 's16', RM_CM));
  rmSitters(s, t, { expr: { r1: t > 48.8 && t < 49.4 ? 'talking' : 'happy', refu: t > 49.28 ? 'talking' : 'neutral' } });
  [[s.bubQ, 48.8, 'T3', 1], [s.bubD, 49.28, 'T3', -1]].forEach(([m, t0, tk, side]) => { const k = pop(t, t0, 0.22), [x, z] = seatPos(tk, side); m.visible = k > 0.01; if (!m.visible) return;
    m.position.set(x - side * 0.8, 12.2, z + 0.3); facing(m, s.cam); m.scale.setScalar(k); });
  rmRender(s); };
// ---- s17: wide over every table (every book under its title), then down to the one in front of you; the titles pop away
SHOT_FN['s17'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  const A = [R(1.5, 6.2, 413.4), R(1.6, 0.9, 427.5), 56], B = [R(1.5, 1.85, 418.0), R(1.5, 1.2, 425), 44];
  c3SetCam(s.cam, camMove([[0, ...A], [2.6, ...A], [4.0, ...B], [9, ...B]], lt, 's17', RM_CM));
  rmSitters(s, t, { expr: { you: t > 54.3 ? 'happy' : 'neutral', man: t > 54.3 ? 'happy' : 'neutral' } });
  rmTitles(s, 1.25 * (1 - EZ.io(clamp((t - 53.36) / 0.45))), 11.9); rmRender(s); };
// ---- s18: the desk globe, pins pop on "dozens of countries"
SHOT_FN['s18'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-6.75, 1.75, 415.7), R(-7.4, 1.35, 418), 36), lt, 's18', RM_CM));
  s.earth.rotation.y = 0.6 + t * 0.12; rmSitters(s, t); c3PersonPose(s.p.lib, s.cam, t, { expr: 'happy', ...STAND });
  const c = new THREE.Vector3(); s.earth.getWorldPosition(c); const d = s.cam.position.clone().sub(c).normalize();
  const rt = new THREE.Vector3().crossVectors(d, V3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(rt, d);
  s.pins.forEach((m, i) => { const k = pop(t, 56.34 + i * 0.1, 0.15); m.visible = k > 0.01; if (!m.visible) return; const a = i * 2.39996, r = 0.35 + 0.45 * Math.sqrt((i + 0.5) / 14);
    m.position.copy(c).add(d.clone().multiplyScalar(0.8).addScaledVector(rt, Math.cos(a) * r).addScaledVector(up, Math.sin(a) * r * 0.9).normalize().multiplyScalar(1.22)); facing(m, s.cam); m.rotateZ(Math.atan2(Math.sin(a) * 0.9, Math.cos(a)) - Math.PI / 2); m.scale.setScalar(k); });
  rmRender(s); };
// ---- s19: the librarian on "its motto says it all"
SHOT_FN['s19'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1(R(-5.9, 1.7, 414.6), R(-6.5, 1.4, 418.6), 40), lt, 's19', RM_CM));
  rmSitters(s, t); c3PersonPose(s.p.lib, s.cam, t, { expr: c3FaceAt([[0, 'happy'], [58.0, 'talking']], t, 'lib'), hand: { armL: [1.8, 3.4], armR: [-1.4, 1.4] }, ...STAND }); rmRender(s); };
// ---- s20: you and him at the desk; BORROWED stamp on "borrow" (kick) — the loop's last beat (long take from s19)
SHOT_FN['s20'] = (t, u, lt) => { const s = rmGet(); rmReset(s);
  c3SetCam(s.cam, camMove(K1([25.5, 9.75, 109.5], [26.5, 6.5, 82], 52), lt, 's20', RM_CM));
  s.p.you.g.visible = s.p.man.g.visible = false; rmSitters(s, t);
  const y = s.p.youD, m = s.p.manD; y.g.visible = m.g.visible = true; y.g.position.set(23.5, FOOT, 87); m.g.position.set(18.8, FOOT, 88.5);
  c3PersonPose(y, s.cam, t, { expr: 'excited', gaze: [-0.7, 0], hand: { armL: [1.4, 1.2], armR: [-1.6, 2.4] }, ...STAND });
  c3PersonPose(m, s.cam, t, { expr: t > 60.7 ? 'laugh' : 'happy', gaze: [0.7, 0], ...STAND });
  const up = EZ.back(clamp((t - 60.6) / 0.22));
  c3PersonPose(s.p.lib, s.cam, t, { expr: t > 60.7 ? 'excited' : 'happy', hand: { armL: [1.4, 1.4], armR: [lerp(-1.5, -2.0, up), lerp(1.6, 4.4, up)] }, ...STAND });
  s.borrowed.visible = up > 0.02; if (s.borrowed.visible) { const f = fistLocal(s.p.lib, 'armR'), wp = s.p.lib.root.localToWorld(V3(f.x, f.y + 1.1, f.z + 0.3)); s.borrowed.position.copy(wp); facing(s.borrowed, s.cam); s.borrowed.scale.setScalar(0.8 * Math.min(1, up)); }   // she holds the stamped card up in her fist
  const bk = t >= 60.7 && t < 61.0 ? EZ.o3((t - 60.7) / 0.3) : 0; s.burst.visible = bk > 0; if (bk > 0) { s.burst.position.copy(s.borrowed.position).add(V3(0, 0, -0.2)); facing(s.burst, s.cam); s.burst.scale.setScalar(0.5 + bk); }
  rmRender(s); };

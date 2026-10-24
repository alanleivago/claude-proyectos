// =====================================================================
//  SET desk — Ron's 1976 study, close on the desk: s03 s04 s05 s06 s17 s19. Registers SHOT_FN[id] = (t, u, lt) => { ... }.
//    s03 typewriter: Ron types the contract (the page fills line by line)     s04 drafting board: Ron inks the first logo
//    s05 ECU: the drawing, Isaac Newton                                         s06 tilt up: the apple glows and drops
//    s17 desk calendar: pages fly 1 -> 12, landing on "12"                      s19 wall clock: hands sweep forward
//  One room: wood-panelled wall z = -6, desk top y = 5.6 (front edge z = 0.5), the drafting board at x = 12.
//  People at 1.35x the props, like the casino test. Helpers are prefixed sdk.
// =====================================================================
const SDK_K = 1.35;
const SDK_BOARD = { x: 12.2, y: 8.4, z: -1.6, w: 4.8, h: 6.4, tilt: -0.22 };   // the drafting board (3:4 like the drawing)
const SDK_CLOCK = { x: -4.6, y: 11.6, z: -5.85, r: 1.5 };

// ---- textures
function sdkTypedPage(lines) {   // the contract in the typewriter: header + `lines` typed lines (redrawn as it fills)
  const c = document.createElement('canvas'); c.width = 384; c.height = 512; const x = c.getContext('2d');
  x.fillStyle = '#fbf6e8'; x.fillRect(0, 0, 384, 512);
  x.fillStyle = '#2a1a10'; x.font = '700 22px "Courier New", monospace'; x.textAlign = 'center'; x.fillText('PARTNERSHIP', 192, 48); x.fillText('AGREEMENT', 192, 74);
  const R = RNG('typed'); x.fillStyle = 'rgba(40,28,18,0.75)';
  for (let i = 0; i < lines; i++) { const y = 110 + i * 22, n = i % 6 === 5 ? R.r(0.3, 0.5) : R.r(0.7, 0.92); for (let k = 0; k < 30 * n; k++) if (R.f() > 0.12) x.fillRect(34 + k * 10.5, y, 7, 9); }
  return c;
}
function sdkDeskPage(n) {   // desk calendar page: red header APRIL 1976, the day in big type
  return c3Tex((x, w, h) => {
    x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8321e'; x.fillRect(0, 0, w, h * 0.27);
    inked(x, 'APRIL', w / 2, h * 0.1, h * 0.1, '#ffffff', { stroke: false }); inked(x, '1976', w / 2, h * 0.205, h * 0.07, '#ffe6a0', { stroke: false });
    inked(x, String(n), w / 2, h * 0.62, h * 0.52, '#2a1a10', { stroke: false, maxW: w * 0.8 });
    x.fillStyle = 'rgba(90,60,30,0.5)'; x.font = `700 ${h * 0.05}px Arial`; x.textAlign = 'center';
    x.fillText(['THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'][(n - 1) % 7], w / 2, h * 0.93);
  }, 320, 400);
}
function sdkClockFace() {
  return c3Tex((x, w) => {
    const c = w / 2; x.fillStyle = '#fbf3e0'; x.beginPath(); x.arc(c, c, c, 0, TAU); x.fill();
    x.strokeStyle = '#2a1a10'; x.lineCap = 'round';
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? c * 0.86 : c * 0.8; x.lineWidth = i % 5 ? 3 : 8; x.beginPath(); x.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); x.lineTo(c + Math.sin(a) * c * 0.92, c - Math.cos(a) * c * 0.92); x.stroke(); }
    x.fillStyle = '#2a1a10'; x.font = `700 ${w * 0.11}px Georgia, serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; x.fillText(String(i), c + Math.sin(a) * c * 0.64, c - Math.cos(a) * c * 0.64); }
  }, 512, 512);
}
// the drafting-board sheet: the Flow drawing (assets/spr_newton.png) revealed as Ron inks it, the banner lettered in code
const SDK_PAPER = { cv: null, tex: null, last: -1 };
function sdkPaper(reveal) {
  const img = asset('spr_newton.png');
  if (!SDK_PAPER.cv) { const c = document.createElement('canvas'); c.width = 672; c.height = 900; SDK_PAPER.cv = c; SDK_PAPER.tex = new THREE.CanvasTexture(c); SDK_PAPER.tex.encoding = THREE.sRGBEncoding; SDK_PAPER.tex.anisotropy = 8; }
  const r = Math.round(clamp(reveal) * 200) / 200; if (r === SDK_PAPER.last) return SDK_PAPER.tex; SDK_PAPER.last = r;
  const c = SDK_PAPER.cv, x = c.getContext('2d'), w = c.width, h = c.height;
  x.fillStyle = '#f6eedb'; x.fillRect(0, 0, w, h);
  if (img) {
    // the ink goes down top to bottom, with a ragged wet front
    x.save(); x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); const fy = r * h * 1.06;
    for (let i = 20; i >= 0; i--) x.lineTo(i / 20 * w, fy + Math.sin(i * 1.7) * 14 * (1 - r)); x.closePath(); x.clip();
    x.drawImage(img, 0, 0, w, h); x.restore();
    if (r > 0.97) inked(x, 'APPLE COMPUTER CO.', w * 0.51, h * 0.912, h * 0.026, '#3a2414', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.42 });
  }
  // the sheet sits in the drafting lamp's pool: warm and bright in the middle, falling off to the edges
  const pool = x.createRadialGradient(w * 0.52, h * 0.42, h * 0.08, w * 0.5, h * 0.5, h * 0.62);
  pool.addColorStop(0, '#f4ead8'); pool.addColorStop(0.45, '#c4a07c'); pool.addColorStop(1, '#4a2e1c');
  x.save(); x.globalCompositeOperation = 'multiply'; x.fillStyle = pool; x.fillRect(0, 0, w, h); x.restore();
  SDK_PAPER.tex.needsUpdate = true; return SDK_PAPER.tex;
}
// a point on the board's sheet (u, v from its top-left) in world space
function sdkBoardPt(u, v, out = 0.06) {
  const b = SDK_BOARD, lx = (u - 0.5) * b.w, ly = (0.5 - v) * b.h;
  return [b.x + lx, b.y + ly * Math.cos(b.tilt) - out * Math.sin(b.tilt), b.z + ly * Math.sin(b.tilt) + out * Math.cos(b.tilt)];
}

// ---- the room
function sdkBuild() {
  if (S.desk) return S.desk;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 300);
  const key = lights(scene, { keyP: [5, 15, 13], keyI: 0.62, ambI: 0.16, rim: '#ffb070', rimI: 0.55 });   // dim room, lamp-lit pools (refs: mean L 0.35-0.55)
  const lampL = new THREE.PointLight('#ffc070', 2.2, 14, 1.8); lampL.position.set(-3.4, 8.6, -1.2); lampL.layers.enableAll(); scene.add(lampL);
  const lampB = new THREE.PointLight('#ffd090', 1.9, 13, 1.8); lampB.position.set(9.6, 12.6, 1.0); lampB.layers.enableAll(); scene.add(lampB);
  const M = { wood: c3Prop('#ffffff', { map: texWood(), rough: 0.45 }), dark: c3Prop('#3a2416', { rough: 0.45 }), chrome: c3Chrome(),
    olive: c3Prop('#6f7a2e', { rough: 0.35 }), orange: c3Prop('#e0701e', { rough: 0.3 }), cream: c3Prop('#efe2c2', { rough: 0.5 }),
    paper: c3Prop('#f8f1e0', { rough: 0.85 }), brass: c3Prop('#d8a03a', { rough: 0.25, metal: 0.8 }) };
  // floor, panelled wall, shelves, window
  scene.add(pl(80, 60, c3Prop('#ffffff', { map: texLino(), rough: 0.6 }), 0, 0, 0, 0, -Math.PI / 2));
  const panel = texPanel(); panel.repeat.set(9, 1);
  scene.add(pl(60, 16, c3Prop('#ffffff', { map: panel, rough: 0.6 }), 4, 8, -6));
  scene.add(rb(60, 0.35, 0.4, M.dark, 4, 15.8, -5.8, 0.02)); scene.add(rb(60, 0.5, 0.3, M.dark, 4, 0.25, -5.85, 0.02));
  scene.add(rb(5.6, 4.4, 0.4, M.cream, 3.6, 10.6, -5.8, 0.03)); scene.add(pl(5.0, 3.8, c3Flat('#ffffff', { map: texBlinds(), glow: '#ffcf80' }), 3.6, 10.6, -5.55));
  for (let s = 0; s < 2; s++) {   // a bookshelf on the left wall, binders and books
    scene.add(rb(5.2, 0.25, 1.4, M.wood, -9.5, 9.2 + s * 2.6, -5.2, 0.02));
    for (let i = 0; i < 9; i++) { const R = RNG('book', s, i), bh = R.r(1.4, 2.2); scene.add(rb(R.r(0.35, 0.55), bh, 1.1, c3Prop(R.pick(['#c8321e', '#e0a020', '#2a6a8a', '#4a7a3a', '#8a3a6a', '#d8641e']), { rough: 0.4 }), -11.7 + i * 0.52, 9.35 + s * 2.6 + bh / 2, -5.2, 0.02)); }
  }
  // cork board with pinned notes
  scene.add(rb(4.0, 3.0, 0.2, c3Prop('#b0784a', { rough: 0.9 }), 9.8, 11.2, -5.85, 0.03));
  for (let i = 0; i < 6; i++) { const R = RNG('note', i); const n = pl(R.r(0.8, 1.1), R.r(0.8, 1.1), c3Prop(R.pick(['#fff3a8', '#ffffff', '#a8e0ff', '#ffc0c0']), { rough: 0.8 }), 8.4 + (i % 3) * 1.25 + R.n(0.15), 11.8 - Math.floor(i / 3) * 1.2, -5.7); n.rotation.z = R.n(0.15); scene.add(n); }
  // the wall clock
  const ck = new THREE.Group(); ck.position.set(SDK_CLOCK.x, SDK_CLOCK.y, SDK_CLOCK.z); scene.add(ck);
  ck.add(c3Mesh(new THREE.CylinderGeometry(SDK_CLOCK.r * 1.12, SDK_CLOCK.r * 1.12, 0.3, 48), M.brass, 0.04).rotateX(Math.PI / 2));
  const face = new THREE.Mesh(new THREE.CircleGeometry(SDK_CLOCK.r, 48), c3Prop('#ffffff', { map: sdkClockFace(), rough: 0.4 })); face.position.z = 0.16; ck.add(face);
  const hand = (len, wd, z) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, len), c3Flat('#2a1a10')); m.position.y = len / 2 - 0.12; g.add(m); g.position.z = z; ck.add(g); return g; };
  const hourH = hand(SDK_CLOCK.r * 0.55, 0.12, 0.18), minH = hand(SDK_CLOCK.r * 0.82, 0.08, 0.19);
  ck.add(new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), c3Flat('#c8321e')).translateZ(0.2));
  const glass = new THREE.Mesh(new THREE.CircleGeometry(SDK_CLOCK.r, 48), new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0.2 })); glass.position.z = 0.24; ck.add(glass);
  // the desk (focus layer: it hides Ron's legs) and everything on it
  const focus = new THREE.Group(); scene.add(focus);
  focus.add(rb(11, 0.45, 3.4, M.wood, 0, 5.6, -1.2, 0.04));
  focus.add(rb(10.4, 5.4, 0.3, M.wood, 0, 2.8, 0.3, 0.035));   // modesty panel facing us
  focus.add(rb(2.6, 5.2, 3.0, M.wood, -3.9, 2.8, -1.2, 0.035)); focus.add(rb(2.6, 5.2, 3.0, M.wood, 3.9, 2.8, -1.2, 0.035));
  for (let i = 0; i < 3; i++) { focus.add(rb(2.3, 1.4, 0.1, c3Prop('#a8682e', { rough: 0.4 }), -3.9, 4.3 - i * 1.6, 0.48, 0.02)); focus.add(rb(0.6, 0.12, 0.12, M.brass, -3.9, 4.3 - i * 1.6, 0.58, 0.01)); }
  // typewriter: olive body, chrome carriage, black keys, the page standing up out of it
  const tw = new THREE.Group(); tw.position.set(-2.3, 5.83, -1.0); tw.rotation.y = 0.25; focus.add(tw);
  tw.add(rb(3.4, 0.9, 2.4, M.olive, 0, 0.45, 0, 0.035)); tw.add(rb(3.0, 0.5, 1.2, M.olive, 0, 1.05, -0.55, 0.03));
  tw.add(cyl(0.28, 0.28, 3.9, c3Prop('#1a1a1a', { rough: 0.5 }), 0, 1.35, -0.75, 0.025).rotateZ(Math.PI / 2));
  tw.add(cyl(0.1, 0.1, 4.1, M.chrome, 0, 1.4, -0.45, 0.015).rotateZ(Math.PI / 2));
  tw.add(cyl(0.16, 0.16, 0.3, M.chrome, -2.2, 1.35, -0.75, 0.015).rotateZ(Math.PI / 2));
  for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) { const key2 = cyl(0.11, 0.11, 0.08, c3Prop('#202020', { rough: 0.3 }), -1.2 + k * 0.3 + r * 0.08, 0.95 - r * 0.02, 0.4 + r * 0.25 - 1.0, 0.01, 12); tw.add(key2); }
  const typedCv = sdkTypedPage(0), typedTex = new THREE.CanvasTexture(typedCv); typedTex.encoding = THREE.sRGBEncoding;
  const page = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 2.6), new THREE.MeshStandardMaterial({ map: typedTex, roughness: 0.85, side: THREE.DoubleSide }));
  page.position.set(0, 2.55, -0.85); page.rotation.x = -0.18; tw.add(page);
  // desk lamp (orange, flexible arm), mugs, pencil cup, ink pots, papers, phone, ashtray
  const lamp = new THREE.Group(); lamp.position.set(-4.2, 5.83, -2.0); focus.add(lamp);
  lamp.add(cyl(0.7, 0.8, 0.25, M.orange, 0, 0.12, 0, 0.03)); lamp.add(cyl(0.08, 0.08, 2.4, M.chrome, 0.3, 1.3, 0, 0.015).rotateZ(-0.25));
  const shade = c3Mesh(new THREE.ConeGeometry(0.8, 1.1, 24, 1, true), M.orange, 0.03); shade.material.side = THREE.DoubleSide; shade.position.set(0.9, 2.55, 0.3); shade.rotation.z = -0.6; lamp.add(shade);
  const bulb = c3Mesh(new THREE.SphereGeometry(0.3, 14, 10), c3Flat('#fff4d0', { glow: '#ffd080' })); bulb.position.set(1.15, 2.25, 0.35); lamp.add(bulb);
  focus.add(mug('#c8321e', 1.6, 5.83, 0.0)); focus.add(mug('#f0c040', 4.4, 5.83, -1.8));
  const cup = cyl(0.45, 0.4, 0.9, M.brass, 3.6, 6.28, -2.1, 0.025); focus.add(cup);
  for (let i = 0; i < 5; i++) { const R = RNG('pencil', i); const p = cyl(0.05, 0.05, 1.5, c3Prop(R.pick(['#f0c040', '#c8321e', '#2a6a8a']), { rough: 0.4 }), 3.6 + R.n(0.2), 7.0, -2.1 + R.n(0.2), 0.01, 8); p.rotation.set(R.n(0.25), 0, R.n(0.25)); focus.add(p); }
  for (let i = 0; i < 2; i++) { focus.add(cyl(0.3, 0.3, 0.45, c3Prop(i ? '#1a2a6a' : '#1a1410', { rough: 0.15 }), 1.8 + i * 0.75, 6.05, -2.3, 0.02, 16)); focus.add(cyl(0.18, 0.18, 0.15, c3Prop('#202020'), 1.8 + i * 0.75, 6.33, -2.3, 0.015, 12)); }
  for (let i = 0; i < 4; i++) { const R = RNG('sheet', i), sh = pl(1.7, 2.2, M.paper, -2.6 + R.n(0.4), 5.84 + i * 0.012, -0.2 + R.n(0.3), 0, -Math.PI / 2); sh.rotation.z = R.n(0.4); focus.add(sh); }
  const ash = cyl(0.55, 0.45, 0.22, c3Prop('#c8a070', { rough: 0.2, metal: 0.3 }), 4.6, 5.94, 0.0, 0.02); focus.add(ash);
  // the flip calendar on the front-right of the desk (s17): a stack of 13 pages on a little easel
  const cal = new THREE.Group(); cal.position.set(3.6, 5.83, 0.05); cal.rotation.y = -0.22; focus.add(cal);
  cal.add(rb(2.2, 0.25, 1.2, M.dark, 0, 0.12, 0, 0.02));
  const calPages = [];
  for (let n = 1; n <= 12; n++) {   // page n hinges at the top ring; pages 1..11 fly off
    const hinge = new THREE.Group(); hinge.position.set(0, 2.85, 0.15 - n * 0.004); cal.add(hinge);
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.4), c3Prop('#ffffff', { map: sdkDeskPage(n), rough: 0.7, side: THREE.DoubleSide })); pg.position.y = -1.2; hinge.add(pg);
    hinge.renderOrder = 20 - n; pg.renderOrder = 20 - n; calPages.push(hinge);
  }
  cal.add(cyl(0.05, 0.05, 1.9, M.chrome, 0, 2.9, 0.18, 0.01, 8).rotateZ(Math.PI / 2));
  cal.add(rb(1.95, 2.5, 0.12, M.dark, 0, 1.6, -0.12, 0.02)); cal.children[cal.children.length - 1].rotation.x = -0.12;
  // the drafting board on a chrome stand, a stool, a lamp over it, a cup of brushes
  const board = new THREE.Group(); board.position.set(SDK_BOARD.x, SDK_BOARD.y, SDK_BOARD.z); board.rotation.x = SDK_BOARD.tilt; focus.add(board);
  board.add(rb(SDK_BOARD.w + 0.6, SDK_BOARD.h + 0.6, 0.3, M.wood, 0, 0, -0.18, 0.04));
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(SDK_BOARD.w, SDK_BOARD.h), new THREE.MeshStandardMaterial({ map: sdkPaper(0), roughness: 0.9 }));
  sheet.position.z = 0.0; board.add(sheet);
  board.add(rb(SDK_BOARD.w + 0.8, 0.25, 0.5, M.chrome, 0, -SDK_BOARD.h / 2 - 0.35, 0.12, 0.02));
  for (const sx of [-1, 1]) focus.add(cyl(0.1, 0.1, 5.2, M.chrome, SDK_BOARD.x + sx * 1.8, 2.6, SDK_BOARD.z - 0.4, 0.015, 10));
  focus.add(rb(4.4, 0.2, 1.6, M.chrome, SDK_BOARD.x, 0.1, SDK_BOARD.z - 0.4, 0.02));
  const bcup = cyl(0.35, 0.3, 0.8, M.orange, SDK_BOARD.x + 2.9, 0.4, SDK_BOARD.z + 0.6, 0.02); focus.add(bcup);
  // the apple that leaves the drawing (s06): drawn like the engraving (sepia ink outline and hatching, a red wash),
  // a flat cut-out that always faces the camera — not a glossy 3D ball
  const apple = new THREE.Group(); focus.add(apple);
  const appleTex = c3Tex((x, w, h) => {
    const cx = w / 2, cy = h * 0.56, r = w * 0.34;
    x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.lineJoin = 'round';
    const body = new Path2D(); body.moveTo(cx, cy - r * 0.78);
    body.bezierCurveTo(cx + r * 0.55, cy - r * 1.15, cx + r * 1.12, cy - r * 0.55, cx + r * 0.98, cy + r * 0.2);
    body.bezierCurveTo(cx + r * 0.85, cy + r * 0.95, cx + r * 0.25, cy + r * 1.05, cx, cy + r * 0.88);
    body.bezierCurveTo(cx - r * 0.25, cy + r * 1.05, cx - r * 0.85, cy + r * 0.95, cx - r * 0.98, cy + r * 0.2);
    body.bezierCurveTo(cx - r * 1.12, cy - r * 0.55, cx - r * 0.55, cy - r * 1.15, cx, cy - r * 0.78); body.closePath();
    const g = x.createRadialGradient(cx - r * 0.35, cy - r * 0.35, r * 0.1, cx, cy, r * 1.1); g.addColorStop(0, '#f25a3a'); g.addColorStop(0.7, '#cf2a1c'); g.addColorStop(1, '#8e1a12');
    x.fillStyle = g; x.fill(body);
    x.save(); x.clip(body); x.strokeStyle = 'rgba(70,30,18,0.55)'; x.lineWidth = w * 0.012;   // engraving hatch on the shadow side
    for (let i = 0; i < 9; i++) { const yy = cy - r * 0.2 + i * r * 0.14; x.beginPath(); x.moveTo(cx + r * 0.2, yy + r * 0.1); x.quadraticCurveTo(cx + r * 0.6, yy - r * 0.05, cx + r * 1.05, yy - r * 0.25); x.stroke(); }
    x.restore();
    x.fillStyle = 'rgba(255,240,220,0.85)'; x.beginPath(); x.ellipse(cx - r * 0.42, cy - r * 0.32, r * 0.16, r * 0.09, -0.6, 0, TAU); x.fill();
    x.strokeStyle = '#3a2414'; x.lineWidth = w * 0.03; x.stroke(body);
    x.lineWidth = w * 0.028; x.beginPath(); x.moveTo(cx, cy - r * 0.75); x.quadraticCurveTo(cx + r * 0.05, cy - r * 1.15, cx + r * 0.2, cy - r * 1.32); x.stroke();
    const leaf = new Path2D(); leaf.moveTo(cx + r * 0.08, cy - r * 1.05); leaf.quadraticCurveTo(cx + r * 0.55, cy - r * 1.45, cx + r * 0.85, cy - r * 1.12); leaf.quadraticCurveTo(cx + r * 0.45, cy - r * 0.85, cx + r * 0.08, cy - r * 1.05);
    x.fillStyle = '#6f8a3a'; x.fill(leaf); x.lineWidth = w * 0.02; x.stroke(leaf);
  }, 256, 256);
  const appleM = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: appleTex, transparent: true, alphaTest: 0.05, toneMapped: false }));
  appleM.material.userData.glow = '#c82010'; apple.add(appleM);
  apple.visible = false;
  // dark out-of-focus foreground pieces (C3.L_NEAR, blurred): placed in camera space per shot (sdkNear)
  const nearSet = {
    mug: (() => { const g = mug('#5a1a10', 0, 0, 0); g.scale.setScalar(1.6); return g; })(),
    books: (() => { const g = new THREE.Group(); for (let i = 0; i < 3; i++) g.add(rb(2.6 - i * 0.3, 0.55, 1.8, c3Prop(['#3a1a10', '#5a2a14', '#2a1a2a'][i], { rough: 0.5 }), 0, i * 0.56, 0, 0.03)); return g; })(),
    pencils: (() => { const g = new THREE.Group(); g.add(cyl(0.5, 0.45, 1.2, c3Prop('#3a2416', { rough: 0.4 }), 0, 0, 0, 0.03)); for (let i = 0; i < 4; i++) { const p = cyl(0.07, 0.07, 1.9, c3Prop(['#f0c040', '#c8321e', '#2a6a8a', '#e0e0e0'][i], { rough: 0.4 }), (i - 1.5) * 0.18, 1.1, (i % 2) * 0.15, 0.01, 8); p.rotation.z = (i - 1.5) * 0.12; g.add(p); } return g; })(),
    plant: (() => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.9, 10, 8), c3Prop('#2a4a1a', { rough: 0.6 }), 0.02); lf.scale.set(0.45, 1.6, 0.2); lf.position.set(Math.cos(i * 1.1) * 0.5, i * 0.3, 0); lf.rotation.z = Math.cos(i * 1.1) * 0.7; g.add(lf); } return g; })(),
  };
  for (const n of Object.values(nearSet)) { n.visible = false; n.scale.multiplyScalar(0.75); scene.add(n); c3Layer(n, C3.L_NEAR); }
  // Ron, and the pen he inks with
  const ron = c3Person({ key: 'ron', outfit: 'mustard', hairStyle: 'brown', fx: ['mustache', 'glasses'] });
  ron.g.scale.setScalar(SDK_K); focus.add(ron.g);
  const pen = new THREE.Group(); pen.add(cyl(0.06, 0.06, 1.1, c3Prop('#1a2a6a', { rough: 0.3 }), 0, 0.45, 0, 0.012, 8)); pen.add(cyl(0.02, 0.06, 0.2, M.chrome, 0, -0.18, 0, 0.006, 8)); ron.root.add(pen); pen.visible = false;
  c3Layer(focus, C3.L_FOCUS);
  c3Env(scene, { top: '#ffe2b8', mid: '#b07048' }); c3Shadows(scene, key, 18);
  return (S.desk = { scene, cam, ron, pen, page, typedCv, typedTex, hourH, minH, calPages, sheet, apple, appleM, lamp: bulb, nearSet });
}
// render: no heavy grade here (shots.js grades each shot with c3Look); background and foreground blur animate per shot
const sdkRender = (d, bgBlur, nearBlur = 16, glow = 0.55) => c3Render(d.scene, d.cam, { bg: '#1c0e06', bgBlur, nearBlur, glow, glowBlur: 16, bloom: 0.3 });
// Ron behind the desk, sitting (root on the hidden chair at y 3.9) / standing at the board
function sdkRonDesk(d) { d.ron.g.position.set(0.9, 4.6, -2.25); }   // right of the typewriter, on a tall chair
function sdkRonBoard(d) { d.ron.g.position.set(SDK_BOARD.x - 3.3, 3.85, SDK_BOARD.z + 0.9); }
// the camera never stops: a creep that accelerates through the shot's end and keeps going into the dissolve
// (position, target and fov ride one curve: p(x) = (1-k) x + k x^3, continued in a straight line past x = 1)
function sdkMove(lt, dur, A, B, k = 0.5) {
  const x = lt / dur, p = x <= 1 ? (1 - k) * x + k * x * x * x : 1 + (1 + 2 * k) * (x - 1);
  return { p: A.p.map((v, i) => lerp(v, B.p[i], p)), l: A.l.map((v, i) => lerp(v, B.l[i], p)), fov: lerp(A.fov ?? 50, B.fov ?? 50, p) };
}
const sdkDur = (id) => { const i = SHOT_LIST.findIndex((s) => s[0] === id); return shotSpan(i)[1] - shotSpan(i)[0]; };
// out-of-focus foreground pieces in camera space: [name, nx, ny (-1..1 across the frame), distance, yaw]; the rest hidden
function sdkNear(d, list) {
  for (const n of Object.values(d.nearSet)) n.visible = false;
  d.cam.updateMatrixWorld(true);
  for (const [name, nx, ny, dist, rot] of list) {
    const hh = dist * Math.tan(d.cam.fov * DEG / 2), hw = hh * d.cam.aspect, n = d.nearSet[name];
    n.visible = true; n.position.copy(d.cam.localToWorld(c3V(nx * hw, ny * hh, -dist))); n.rotation.y = rot ?? 0;
  }
}
const sdkRonLayer = (d, layer) => c3Layer(d.ron.g, layer);   // FOCUS = sharp, BG = soft with the background blur

// ---- s03: "You wrote that paper yourself." — low 3/4 from the left on the keys and the page, craning up and round
// to the right to find Ron typing; the background racks into focus as the move ends
SHOT_FN.s03 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = false; d.apple.visible = false; d.sheet.material.map = sdkPaper(1); sdkRonLayer(d, C3.L_FOCUS);
  sdkRonDesk(d);
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s03'), { p: [-6.6, 6.3, 1.8], l: [-2.1, 7.2, -1.1], fov: 42 }, { p: [-3.4, 10.4, 9.8], l: [-0.4, 8.6, -1.8], fov: 50 }));
  sdkNear(d, [['mug', -1.05, -1.05, 4.6, 0.4]]);
  const strike = (side) => Math.max(0, Math.sin(lt * 26 + (side > 0 ? 0 : Math.PI))) ** 3;   // alternate fists hammer the keys
  const lines = Math.min(15, Math.floor(3 + lt * 9));
  if (d.typedLines !== lines) { const c = sdkTypedPage(lines); d.typedCv.getContext('2d').drawImage(c, 0, 0); d.typedTex.needsUpdate = true; d.typedLines = lines; }
  const yourself = wordT('yourself') ?? 4.4;
  c3PersonPose(d.ron, d.cam, t, { expr: c3FaceAt([[0, 'determined'], [yourself, 'proud']], t, 'ron'), head: [0.03, 0, -0.05],
    hand: { armL: [-0.6, 1.25 + 0.3 * strike(1)], armR: [-1.6, 1.15 + 0.3 * strike(-1)] }, gaze: [-0.7, 0.5], foot: { legL: [0.5, -2.3], legR: [-0.5, -2.3] } });
  sdkRender(d, lerp(3.6, 1.6, EZ.io(clamp(lt / 1.0))), 16);
};
// ---- s04: "You even drew the first logo," — starts tight on the pen and the wet ink, pulls back in an arc to Ron
SHOT_FN.s04 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = true; d.apple.visible = false; sdkRonLayer(d, C3.L_FOCUS);
  const rev = EZ.io(clamp(lt / 1.3)); d.sheet.material.map = sdkPaper(0.3 + 0.68 * rev);
  sdkRonBoard(d);
  const ink = sdkBoardPt(0.45, 0.32, 0);
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s04'), { p: [ink[0] + 0.6, ink[1] - 0.4, ink[2] + 7.6], l: [ink[0] - 0.8, ink[1] - 0.6, ink[2]], fov: 44 },
    { p: [SDK_BOARD.x - 4.6, 7.4, 12.2], l: [SDK_BOARD.x - 1.9, 8.7, -1.0], fov: 52 }));
  sdkNear(d, [['pencils', 1.1, -1.05, 4.6]]);
  const fy = 0.3 + 0.68 * rev, fx = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(lt * 9));   // pen tip follows the ink front
  c3PersonPose(d.ron, d.cam, t, {}); d.ron.g.updateMatrixWorld(true);   // face the camera first, then aim the hand in its plane
  const tip = sdkBoardPt(fx, Math.min(0.95, fy), 0.25), loc = d.ron.root.worldToLocal(c3V(...tip));
  const logo = wordT('logo') ?? 5.9;
  c3PersonPose(d.ron, d.cam, t, { expr: c3FaceAt([[0, 'determined'], [logo, 'smile']], t, 'ron'), gaze: [0.8, -0.1], head: [-0.06, 0.05, 0],
    hand: { armL: [loc.x, loc.y], armR: [-1.1, 0.9] }, foot: { legL: [0.6, -2.95], legR: [-0.6, -2.95] } });
  const hl = d.ron.limbs.armL.e.position; d.pen.position.set(hl.x - 0.05, hl.y + 0.1, 0.05); d.pen.rotation.set(0, 0, -0.5);
  sdkRender(d, lerp(1.2, 3.2, EZ.io(clamp(lt / 1.2))), 16);
};
// ---- s05: "Isaac Newton," — extreme close-up, a drifting push-in on Newton; the pencil cup blurred in front
SHOT_FN.s05 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = false; d.apple.visible = false; d.sheet.material.map = sdkPaper(1);
  sdkRonBoard(d); d.ron.g.position.x -= 30;   // off stage
  const a = sdkBoardPt(0.5, 0.6, 0), b = sdkBoardPt(0.57, 0.52, 0);
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s05'), { p: [a[0] - 0.8, a[1] - 0.6, a[2] + 7.2], l: a, fov: 44 }, { p: [b[0] + 0.3, b[1] - 0.2, b[2] + 4.4], l: b, fov: 40 }, 0.6));
  sdkNear(d, [['pencils', -1.15, -1.1, 4.2], ['books', 1.25, 1.15, 4.4]]);
  c3PersonPose(d.ron, d.cam, t, {});
  sdkRender(d, 1.4, 16);
};
// ---- s06: "under a tree." — tilt up the drawing to the tree; on "tree" the inked apple glows, pops off the page and drops
SHOT_FN.s06 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = false; d.sheet.material.map = sdkPaper(1);
  sdkRonBoard(d); d.ron.g.position.x -= 30;
  const a = sdkBoardPt(0.56, 0.52, 0), b = sdkBoardPt(0.45, 0.3, 0);
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s06'), { p: [a[0] + 0.4, a[1] - 0.6, a[2] + 4.6], l: a, fov: 42 }, { p: [b[0] - 0.5, b[1] - 1.2, b[2] + 6.2], l: b, fov: 46 }, 0.55));
  sdkNear(d, [['plant', -1.15, 1.05, 4.2]]);
  const tree = wordT('tree') ?? 7.5, ap = sdkBoardPt(0.4, 0.418, 0.3);
  d.apple.visible = t >= tree - 0.12;
  const g = clamp((t - tree + 0.12) / 0.15), fall = Math.max(0, t - tree - 0.22);
  d.apple.position.set(ap[0], ap[1] - 4.9 * fall * fall, ap[2] + 0.25 * EZ.o2(g) + fall * 0.4);
  d.apple.scale.setScalar(EZ.back(g));
  d.cam.updateMatrixWorld(true); d.appleM.quaternion.copy(d.cam.quaternion); d.appleM.rotateZ(fall * 2.4);   // a flat cut-out facing the lens, tumbling
  c3PersonPose(d.ron, d.cam, t, {});
  const flash = t >= tree - 0.1 ? Math.exp(-Math.max(0, t - tree) * 3) : 0;
  sdkRender(d, 1.4, 16, 0.55 + 0.6 * flash);
};
// ---- s17: "So 12 days in," — low over the desk, the calendar big and sharp in front, Ron behind it; eleven pages
// fly off, the twelfth lands on "12" and the focus racks off Ron
SHOT_FN.s17 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = false; d.apple.visible = false; d.sheet.material.map = sdkPaper(1);
  sdkRonDesk(d); sdkRonLayer(d, C3.L_BG);
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s17'), { p: [6.4, 6.3, 5.4], l: [3.0, 8.0, -0.6], fov: 46 }, { p: [4.9, 6.6, 3.6], l: [3.4, 7.7, 0.0], fov: 44 }, 0.45));
  sdkNear(d, [['mug', 1.1, -1.08, 3.8, -0.5]]);
  const a = SHOT_LIST.find((s) => s[0] === 's17')[1], land = wordT('12') ?? a + 0.6;
  d.calPages.forEach((h, i) => {   // page i+1 flips at its time; they spread from shot start to the word
    if (i === 11) { h.rotation.x = 0; h.position.y = 2.85; h.visible = true; return; }
    const tf = a + 0.05 + (land - 0.1 - a - 0.05) * (i / 10), k = clamp((t - tf) / 0.22);
    h.rotation.x = -EZ.i2(k) * 2.4; h.position.y = 2.85 + EZ.i2(k) * 1.8; h.position.x = EZ.i2(k) * (i % 2 ? 0.8 : -0.6);
    h.visible = k < 1;
  });
  c3PersonPose(d.ron, d.cam, t, { expr: c3FaceAt([[0, 'worried'], [land, 'nervous']], t, 'ron'), gaze: [0.7, -0.2], head: [0.05, 0, -0.05], x: t > land ? ['sweat'] : [],
    hand: { armL: [1.4, 1.9], armR: [-1.4, 1.9] }, foot: { legL: [0.5, -2.3], legR: [-0.5, -2.3] } });
  sdkRender(d, lerp(1.2, 5.0, EZ.io(clamp((t - land + 0.1) / 0.4))), 16);
  sdkRonLayer(d, C3.L_FOCUS);
};
// ---- s19: "Later," — high angle: the clock at the top of the frame, Ron far below looking up at it; the camera
// cranes down and pushes into the racing clock, fastest at the cut
SHOT_FN.s19 = (t, u, lt) => {
  const d = sdkBuild(); d.pen.visible = false; d.apple.visible = false; d.sheet.material.map = sdkPaper(1); sdkRonLayer(d, C3.L_FOCUS);
  sdkRonDesk(d);
  const ck = [SDK_CLOCK.x, SDK_CLOCK.y, SDK_CLOCK.z];
  c3SetCam(d.cam, sdkMove(lt, sdkDur('s19'), { p: [1.6, 19.5, 10.5], l: [-1.2, 8.6, -3.0], fov: 52 }, { p: [-2.8, 14.6, 2.6], l: [ck[0] + 0.2, ck[1] - 0.6, ck[2]], fov: 46 }, 0.55));
  sdkNear(d, [['plant', 1.15, 1.05, 4.4]]);
  const spin = 0.4 + 4.2 * EZ.io(clamp(lt / 1.05));   // turns of the minute hand
  d.minH.rotation.z = -spin * TAU; d.hourH.rotation.z = -(2.1 + spin) / 12 * TAU;
  c3PersonPose(d.ron, d.cam, t, { expr: c3FaceAt([[0, 'thinking']], t, 'ron'), gaze: [-0.6, 0.9], head: [0.08, 0, 0],
    hand: { armL: [1.0, 2.2], armR: [-1.0, 2.2] }, foot: { legL: [0.5, -2.3], legR: [-0.5, -2.3] } });
  sdkRender(d, lerp(1.0, 2.6, EZ.io(clamp(lt / 1.0))), 16);
};

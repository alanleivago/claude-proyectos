// =====================================================================
//  SET bank — an old Italian bank hall (green/cream marble chequer floor, terracotta walls over a green marble wainscot,
//  cream pilasters, brass chandeliers, LOANS/SAVINGS boards, a clock), the teller counter with brass grilles (right),
//  the banker's desk (centre: green lamp, the LOAN form, the stamp), and on the back wall the round vault door, OPEN:
//  behind it the vault warehouse — aisles of towering racks full of Parmigiano wheels, workers flipping and brushing.
//  Registers SHOT_FN s01-s05, s13, s14, s16-s21. Prefix bk. Hall: back wall z = 0, x -36..36, z 0..70; vault: z < 0.
// =====================================================================
const BK = {};
const BK_X = 36, BK_Z = 70, BK_H = 32, BK_DOOR = [-14, 9], BK_DESK = [4, 34], BK_SIT = 2.7;
const BK_SEAT = { banker: [-1.5, 34.2], you: [9.5, 34.2] };
const BK_AISLE = -14, BK_RACKS = [-32, -20, -8, 4, 16, 28];
function bkTexWall() { const t = tex((g, w, h) => { const wain = h * 0.72; g.fillStyle = '#e2b98c'; g.fillRect(0, 0, w, h); const r = RNG('bkw');
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const x = (i + 0.5 + (j % 2) * 0.5) * w / 4, y = (j + 0.5) * wain / 4;   // damask motif
    g.fillStyle = 'rgba(176,112,70,0.16)'; g.beginPath(); g.ellipse(x, y, 14, 30, 0, 0, 7); g.fill(); for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 18, y + 6, 12, 7, s * 0.6, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(120,40,20,0.12)'; g.beginPath(); g.arc(x, y - 36, 6, 0, 7); g.fill(); g.beginPath(); g.arc(x, y + 36, 6, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(40,20,10,0.5)'; g.lineWidth = 3; for (const x of [70, 200, 326, 456]) { g.strokeRect(x - 52, wain + 22, 104, h - wain - 58); g.strokeStyle = 'rgba(255,255,255,0.22)'; g.strokeRect(x - 46, wain + 28, 92, h - wain - 70); g.strokeStyle = 'rgba(40,20,10,0.5)'; }
  g.fillStyle = '#f0dcb0'; for (const x of [0, 256]) { g.fillRect(x, 0, 34, wain); g.fillStyle = '#140e10'; g.fillRect(x + 34, 0, 3, wain); g.fillStyle = '#f0dcb0'; }
  const m = g.createLinearGradient(0, wain, 0, h); m.addColorStop(0, '#3f6e5c'); m.addColorStop(1, '#2c5244'); g.fillStyle = m; g.fillRect(0, wain, w, h - wain);
  g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 3; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(r.f() * w, wain); g.bezierCurveTo(r.f() * w, wain + 40, r.f() * w, h - 40, r.f() * w, h); g.stroke(); }
  g.fillStyle = '#c9a040'; g.fillRect(0, wain - 10, w, 12); g.fillStyle = '#140e10'; g.fillRect(0, wain + 2, w, 3); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function bkTexSign(txt, bg = '#2f6a52') { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a040'; g.lineWidth = 12; g.strokeRect(10, 10, w - 20, h - 20);
  inked(g, txt, w / 2, h / 2 + 4, h * 0.5, '#fff3d6', { stroke: false, maxW: w * 0.86 }); }, 512, 160); }
function bkTexVaultDoor() { return tex((g, w, h) => { const c = w / 2; const gr = g.createRadialGradient(c * 0.8, c * 0.7, 20, c, c, c); gr.addColorStop(0, '#e8eef4'); gr.addColorStop(1, '#8a96a4'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c - 4, 0, TAU); g.fill();
  g.lineWidth = 10; g.strokeStyle = '#140e10'; g.stroke(); for (const r of [0.8, 0.55]) { g.lineWidth = 6; g.strokeStyle = '#5a6470'; g.beginPath(); g.arc(c, c, c * r, 0, TAU); g.stroke(); }
  g.strokeStyle = '#3a4048'; g.lineWidth = 16; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.3; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a) * c * 0.42, c + Math.sin(a) * c * 0.42); g.stroke(); }
  g.fillStyle = '#c9a040'; g.beginPath(); g.arc(c, c, c * 0.12, 0, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = '#140e10'; g.stroke(); }, 512, 512); }
function bkTexLoan(st) { return tex((g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.strokeRect(6, 6, w - 12, h - 12);
  inked(g, 'LOAN', w / 2, h * 0.1, h * 0.08, '#2f6a52', { stroke: false }); g.fillStyle = 'rgba(40,30,20,0.45)'; for (let k = 0; k < 7; k++) g.fillRect(w * 0.1, h * (0.2 + k * 0.06), w * (0.55 + 0.2 * (k % 2)), 6);
  inked(g, 'GUARANTEE:', w * 0.1, h * 0.68, h * 0.05, '#2a1208', { stroke: false, align: 'left' });
  if (st >= 1) { g.fillStyle = '#f2c862'; g.beginPath(); g.ellipse(w * 0.7, h * 0.68, w * 0.12, h * 0.05, 0, 0, TAU); g.fill(); g.lineWidth = 5; g.stroke(); inked(g, '1 WHEEL', w * 0.7, h * 0.76, h * 0.04, '#2a1208', { stroke: false }); }
  if (st >= 2) { g.save(); g.translate(w / 2, h * 0.88); g.rotate(-0.15); g.strokeStyle = '#2f8a3a'; g.lineWidth = 12; g.strokeRect(-w * 0.38, -h * 0.06, w * 0.76, h * 0.12); inked(g, 'APPROVED', 0, 4, h * 0.075, '#2f8a3a', { stroke: false, maxW: w * 0.7 }); g.restore(); } }, 400, 560); }
function bkTexTag(txt, bg = '#ffe23a', fg = '#c8323a') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.beginPath(); g.moveTo(40, 10); g.lineTo(w - 10, 10); g.lineTo(w - 10, h - 10); g.lineTo(40, h - 10); g.lineTo(10, h / 2); g.closePath();
  g.fillStyle = bg; g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke(); g.fillStyle = '#2a1208'; g.beginPath(); g.arc(44, h / 2, 10, 0, TAU); g.fill();
  inked(g, txt, w / 2 + 16, h / 2 + 4, h * 0.42, fg, { stroke: false, maxW: w - 100 }); }, 760, 200); }
function bkTexSmell() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(120,200,90,0.9)'; g.lineWidth = 12; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { g.beginPath(); const x0 = 40 + i * 80; g.moveTo(x0, h - 10); for (let y = h - 10; y > 20; y -= 10) g.lineTo(x0 + Math.sin(y * 0.06 + i) * 18, y); g.stroke(); } }, 280, 300); }

function bkBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff0e0', ambI: 0.6, sky: '#ffe8c8', ground: '#4a3a2a', key: '#fff0d8', keyI: 1.1, keyP: [-60, 60, 60], rim: '#ffc890', rimI: 0.45, rimP: [60, 30, -40] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = bkTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  const fl = pl(2 * BK_X, BK_Z, c3Prop('#ffffff', { map: texTiles('#2f8a6a', '#f0e6d0', [9, 9]), rough: 0.35, env: 0.8 }), 0, 0, BK_Z / 2, 0, -Math.PI / 2); scene.add(fl);
  // back wall with the square opening of the vault door (x -22..-6, y 0..18)
  const [dx, dy] = BK_DOOR;
  scene.add(plNC(BK_X - dx - 8, BK_H, wallM(5), (BK_X + dx + 8) / 2, BK_H / 2, 0));   // v2: spans -6..36 (v1 left gaps into the vault)   // right of the opening
  scene.add(plNC(BK_X - (-dx + 8) + 0, BK_H, wallM(2), (-BK_X + dx - 8) / 2, BK_H / 2, 0));   // left of it
  scene.add(plNC(16, BK_H - 18, wallM(1), dx, 18 + (BK_H - 18) / 2, 0));   // above it
  scene.add(plNC(BK_Z, BK_H, wallM(5), -BK_X, BK_H / 2, BK_Z / 2, Math.PI / 2)); scene.add(plNC(BK_Z, BK_H, wallM(5), BK_X, BK_H / 2, BK_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * BK_X, BK_H, wallM(6), 0, BK_H / 2, BK_Z, Math.PI));
  scene.add(plNC(2 * BK_X, BK_Z, c3Prop('#f0dcb0', { rough: 0.9 }), 0, BK_H, BK_Z / 2, 0, Math.PI / 2));
  const cream = c3Prop('#f0dcb0', { rough: 0.6 }), brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 }), wood = c3Prop('#7a3f22', { rough: 0.55 }), steel = c3Prop('#a8b4c0', { metal: 0.7, rough: 0.3 });
  for (const x of [-30, -2, 14, 30]) { scene.add(cyl(1.2, 1.2, BK_H, cream, x, BK_H / 2, 1.4, 0.03, 16)); scene.add(rb(3, 1.2, 3, cream, x, 0.6, 1.4, 0.02)); }   // pilasters
  // the vault door: a steel ring frame, the round door swung open on its hinge
  const ring = c3Mesh(new THREE.TorusGeometry(8.6, 0.9, 10, 40), steel, 0.03); ring.position.set(dx, dy, 0.4); scene.add(ring);
  s.door = new THREE.Group(); s.door.position.set(dx + 8.6, dy, 0.6); scene.add(s.door);
  { const d = new THREE.Mesh(new THREE.CylinderGeometry(8.4, 8.4, 1.6, 40), [steel, c3Flat('#ffffff', { map: bkTexVaultDoor() }), c3Flat('#ffffff', { map: bkTexVaultDoor() })]); d.rotation.x = Math.PI / 2; d.position.x = -8.4; d.position.z = 0.8; s.door.add(c3Mesh(d.geometry, d.material, 0.03)); s.door.children[0].rotation.x = Math.PI / 2; s.door.children[0].position.set(-8.4, 0, 0.8); }
  s.door.rotation.y = 1.9;   // open into the hall (s21 swings it shut)
  // boards, clock, chandeliers, rope posts, plants
  scene.add(pl(10, 3.1, c3Flat('#ffffff', { map: bkTexSign('LOANS') }), 6, 22, 0.3)); scene.add(pl(10, 3.1, c3Flat('#ffffff', { map: bkTexSign('SAVINGS', '#c8323a') }), 22, 22, 0.3));
  scene.add(pl(14, 3.1, c3Flat('#ffffff', { map: bkTexSign('BANCA', '#23356a') }), 6, 27.5, 2.9));
  for (const [x, z] of [[-18, 24], [8, 24], [-18, 48], [8, 48], [26, 40]]) { scene.add(cyl(0.06, 0.06, 6, brass, x, BK_H - 3, z, 0, 4));
    const b = c3Mesh(new THREE.SphereGeometry(1.4, 14, 10), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0.02); b.position.set(x, BK_H - 7, z); scene.add(b);
    const rr = c3Mesh(new THREE.TorusGeometry(2.2, 0.15, 6, 20), brass, 0.01); rr.userData.noCast = true; b.userData.noCast = true; rr.rotation.x = Math.PI / 2; rr.position.set(x, BK_H - 7, z); scene.add(rr);
    const pt = new THREE.PointLight('#ffd090', 0.3, 30, 1.6); pt.position.set(x, BK_H - 9, z); scene.add(pt); }
  for (const x of [12, 18, 24, 30]) { scene.add(cyl(0.3, 0.45, 3.6, brass, x, 1.8, 30, 0.01, 10)); }
  for (let i = 0; i < 3; i++) { const r = cyl(0.12, 0.12, 6, c3Prop('#c8323a'), 15 + i * 6, 3.0, 30, 0, 6); r.rotation.z = Math.PI / 2; scene.add(r); }
  for (const [x, z] of [[-33, 6], [33, 6], [-33, 64], [33, 64]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); g.add(cyl(1.4, 1.0, 2.4, c3Prop('#c96a3f'), 0, 1.2, 0, 0.02, 14));
    for (let i = 0; i < 9; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.ConeGeometry(0.45, 6, 6), c3Prop(i % 2 ? '#5ea64a' : '#4f9a44', { rough: 0.8 }), 0.01); lf.position.set(Math.sin(a) * 0.8, 5, Math.cos(a) * 0.8); lf.rotation.set(0.4 * Math.cos(a), 0, -0.4 * Math.sin(a)); g.add(lf); } }
  // ---- the vault warehouse behind the door: floor, dark walls, aisles of towering racks painted with wheels
  scene.add(pl(80, 120, c3Prop('#ffffff', { map: texTiles('#e0c090', '#8a6440', [8, 12]), rough: 0.6 }), 0, 0, -60, 0, -Math.PI / 2));
  scene.add(plNC(80, 34, c3Prop('#5a4a3a', { rough: 0.9 }), 0, 17, -120)); scene.add(plNC(120, 34, c3Prop('#5a4a3a'), -40, 17, -60, Math.PI / 2)); scene.add(plNC(120, 34, c3Prop('#5a4a3a'), 40, 17, -60, -Math.PI / 2));
  const rackM = [0, 1, 2].map((k) => { const t = texWheelRack(6, 6, k); t.wrapS = THREE.RepeatWrapping; t.repeat.set(16, 1); return c3Prop('#ffffff', { map: t, rough: 0.7 }); });
  BK_RACKS.forEach((x, i) => { const r = c3Mesh(new THREE.BoxGeometry(4, 26, 100), [rackM[i % 3], rackM[(i + 1) % 3], wood, wood, wood, wood], 0.03); r.position.set(x, 13, -58); scene.add(r); });
  for (let z = -15; z > -110; z -= 18) { const l = c3Mesh(new THREE.SphereGeometry(0.8, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0); l.position.set(BK_AISLE, 29, z); scene.add(l);
    const pt = new THREE.PointLight('#ffd090', 0.35, 40, 1.6); pt.position.set(BK_AISLE, 27, z); scene.add(pt); }
  // ---- FOCUS: the desk, chairs, the counter, real wheels (near rack front, the one on the desk), the stools
  const F = new THREE.Group(); scene.add(F);
  const green = c3Prop('#2f6a52', { rough: 0.6 }), top = c3Prop('#8a4a2a', { rough: 0.4 }), chairM = c3Prop('#c8323a', { rough: 0.6 }), paper = c3Prop('#fffaf0');
  const [kx, kz] = BK_DESK; F.add(rb(8, 3.6, 4.6, wood, kx, 1.8, kz, 0.03)); F.add(rb(8.8, 0.35, 5.4, top, kx, 3.75, kz, 0.02));
  for (const [x, z] of Object.values(BK_SEAT)) { const sd = x < kx ? -1 : 1; F.add(rb(2.4, 0.3, 2.4, chairM, x, 2.25, z, 0.015)); F.add(rb(0.3, 2.9, 1.8, chairM, x + sd * 1.15, 3.8, z - 1.1, 0.015)); for (const lx of [-1, 1]) for (const lz of [-1, 1]) F.add(rb(0.28, 2.1, 0.28, wood, x + lx, 1.05, z + lz, 0.005)); }
  { const g = new THREE.Group(); g.position.set(kx - 2.6, 3.95, kz - 1.4); F.add(g); g.add(cyl(0.4, 0.6, 0.25, brass, 0, 0.12, 0, 0.01, 12)); g.add(cyl(0.07, 0.07, 1.8, brass, 0, 1.0, 0, 0.005, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.3, 1.0, 0.8, 16, 1, true), (() => { const m = c3Prop('#2f8a5a'); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = 2.1; sh.userData.noCast = true; g.add(sh); }
  s.loan = canvasTex(400, 560); s.loanM = pl(2.2, 3.08, new THREE.MeshBasicMaterial({ map: s.loan.t, toneMapped: false }), kx + 1.2, 3.96, kz + 0.6, 0, -Math.PI / 2); F.add(s.loanM);
  F.add(rb(1.4, 0.25, 1.0, c3Prop('#23356a'), kx - 0.6, 4.05, kz + 1.6, 0.01)); F.add(cyl(0.3, 0.3, 0.9, wood, kx - 0.6, 4.6, kz + 1.6, 0.01, 10));   // ink pad + stamp
  s.deskWheel = wheelMesh(0.75); s.deskWheel.position.set(kx + 2.6, 3.95 + 0.43, kz - 0.4); F.add(s.deskWheel);
  F.add(rb(22, 5, 2.4, wood, 25, 2.5, 18, 0.03)); F.add(rb(22.8, 0.35, 3, top, 25, 5.15, 18, 0.02));   // teller counter + its brass grille
  for (let i = 0; i < 12; i++) F.add(cyl(0.06, 0.06, 4, brass, 14.5 + i * 1.9, 7.3, 17.4, 0, 5)); F.add(rb(22.8, 0.3, 0.3, brass, 25, 9.3, 17.4, 0.005));
  s.racks = []; for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const m = wheelMesh(1); m.position.set(BK_AISLE + 3.9, 1.0 + r * 4.3, -12 - i * 3.6); m.rotation.z = Math.PI / 2; F.add(m); s.racks.push(m); }   // real wheels, front of the near rack
  s.flip = wheelMesh(1); F.add(s.flip);   // the wheel the workers flip (s18)
  s.roll = wheelMesh(0.9); F.add(s.roll);  // the wheel the banker keeps (s20)
  c3Layer(F, C3.L_FOCUS);
  s.p = {};
  redraw(s.loan, 'l0', (g, w, h) => { const T = bkTexLoan(0); g.clearRect(0, 0, w, h); g.drawImage(T.image, 0, 0, w, h); });
  s.racks.forEach((m) => { m.visible = false; }); s.deskWheel.visible = false; s.flip.visible = s.roll.visible = false;
  bkDetail(s);
  c3Env(scene, { top: '#ffe8c8', mid: '#d8884a', bot: '#2a2418' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const bkGet = () => BK.s ||= bkBuild();

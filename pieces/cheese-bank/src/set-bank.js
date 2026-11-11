// =====================================================================
//  SET bank — an old Italian bank hall (green/cream marble chequer floor, terracotta walls over a green marble wainscot,
//  cream pilasters, brass chandeliers, LOANS/SAVINGS boards, a clock), the teller counter with brass grilles (right),
//  the banker's desk (centre: green lamp, the LOAN form, the stamp), and on the back wall the round vault door, OPEN:
//  behind it the vault warehouse — aisles of towering racks full of Parmigiano wheels, workers flipping and brushing.
//  Registers SHOT_FN s01-s05, s13, s14, s16-s21. Prefix bk. Hall: back wall z = 0, x -36..36, z 0..70; vault: z < 0.
// =====================================================================
const BK = {};
const BK_X = 36, BK_Z = 70, BK_H = 32, BK_DOOR = [-14, 9], BK_DESK = [4, 34], BK_SIT = 2.7;
const BK_SEAT = { banker: [0.4, 34], you: [7.6, 34] };
const BK_AISLE = -14, BK_RACKS = [-32, -20, -8, 4, 16, 28];
function bkTexWall() { const t = tex((g, w, h) => { const wain = h * 0.72; g.fillStyle = '#d8643a'; g.fillRect(0, 0, w, h); const r = RNG('bkw');
  for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(${r.f() > 0.5 ? '255,230,200' : '120,40,20'},0.08)`; g.beginPath(); g.ellipse(r.f() * w, r.f() * wain, 40, 26, 0, 0, 7); g.fill(); }
  g.fillStyle = '#f0dcb0'; for (const x of [0, 256]) { g.fillRect(x, 0, 34, wain); g.fillStyle = '#140e10'; g.fillRect(x + 34, 0, 3, wain); g.fillStyle = '#f0dcb0'; }
  const m = g.createLinearGradient(0, wain, 0, h); m.addColorStop(0, '#2f6a52'); m.addColorStop(1, '#1f4a3a'); g.fillStyle = m; g.fillRect(0, wain, w, h - wain);
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
  scene.add(plNC(BK_X + dx - 8, BK_H, wallM(4), (BK_X + dx + 8) / 2, BK_H / 2, 0));   // right of the opening
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
  scene.add(pl(14, 3.1, c3Flat('#ffffff', { map: bkTexSign('BANCA', '#23356a') }), 0, 27.5, 0.3));
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
  for (const [x, z] of Object.values(BK_SEAT)) { F.add(rb(2.4, 0.3, 2.4, chairM, x, 2.25, z, 0.015)); F.add(rb(2.4, 2.9, 0.3, chairM, x, 3.8, z - 1.15, 0.015)); for (const lx of [-1, 1]) for (const lz of [-1, 1]) F.add(rb(0.28, 2.1, 0.28, wood, x + lx, 1.05, z + lz, 0.005)); }
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
  // ---- people + overlays
  s.p = {}; for (const w of ['you', 'banker', 'guard', 'teller', 'w1', 'w2', 'c1', 'c2', 'c3', 'c4']) s.p[w] = person(scene, w);
  s.cloudW = spritePlane(scene, texCloud('img_wheel.jpg'), 5, 5); s.cloudM = spritePlane(scene, texCloud('img_melon.jpg'), 4.4, 4.4);
  s.noGold = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffc21a'; g.beginPath(); g.moveTo(w * 0.2, h * 0.7); g.lineTo(w * 0.8, h * 0.7); g.lineTo(w * 0.68, h * 0.4); g.lineTo(w * 0.32, h * 0.4); g.closePath(); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
    inked(g, 'GOLD', w / 2, h * 0.56, h * 0.11, '#8a5a10', { stroke: false }); g.lineCap = 'round'; g.strokeStyle = '#e8282a'; g.lineWidth = 26; g.beginPath(); g.moveTo(w * 0.15, h * 0.15); g.lineTo(w * 0.85, h * 0.85); g.moveTo(w * 0.85, h * 0.15); g.lineTo(w * 0.15, h * 0.85); g.stroke(); }, 512, 512), 4, 4);
  s.pay = spritePlane(scene, texBill2('PAYSLIP', '€ ????', { band: '#3f6fb5', icon: '€', stamp: 'NOT NEEDED' }), 2.6, 3.4);
  s.approved = spritePlane(scene, texBurst('APPROVED!', '#a8f07a', '#2f8a3a'), 4.6, 4.6);
  s.smell = [0, 1].map(() => spritePlane(scene, bkTexSmell(), 1.6, 1.7));
  s.guar = spritePlane(scene, bkTexTag('GUARANTEE'), 4.6, 1.2); s.tagM = spritePlane(scene, bkTexTag('€ 100s OF MILLIONS', '#a8f07a', '#1f5a2a'), 7.6, 2.0);
  s.sold = spritePlane(scene, bkTexTag('SOLD', '#ffe23a', '#c8323a'), 3.4, 0.9);
  s.hearts = [0, 1, 2].map(() => spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ff4a6a'; g.strokeStyle = '#2a1208'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h * 0.85);
    g.bezierCurveTo(w * 0.05, h * 0.5, w * 0.2, h * 0.08, w / 2, h * 0.32); g.bezierCurveTo(w * 0.8, h * 0.08, w * 0.95, h * 0.5, w / 2, h * 0.85); g.fill(); g.stroke(); }, 256, 256), 1.1, 1.1));
  s.counter = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffe23a'; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 40); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
    inked(g, '≈ 400,000', w / 2, h * 0.42, h * 0.34, '#c8323a', { stroke: false, maxW: w - 60 }); inked(g, 'WHEELS', w / 2, h * 0.78, h * 0.2, '#2a1208', { stroke: false }); }, 760, 300), 9, 3.55);
  [s.pay, s.approved, s.guar, s.tagM, s.sold, s.counter, s.noGold].forEach((m) => { m.material.depthTest = false; });   // labels never hidden behind a body (review)
  c3Env(scene, { top: '#ffe8c8', mid: '#d8884a', bot: '#2a2418' }); c3ShadeScene(scene, { dark: 0.2 });
  return s;
}
const bkGet = () => BK.s ||= bkBuild();
function bkReset(s, t) { for (const k in s.p) { s.p[k].g.visible = false; hideHeld(s.p[k]); }
  [s.cloudW, s.cloudM, s.noGold, s.pay, s.approved, s.guar, s.tagM, s.sold, s.counter, ...s.smell, ...s.hearts].forEach((m) => { m.visible = false; });
  s.flip.visible = s.roll.visible = false; s.door.rotation.y = 1.9; s.racks.forEach((m) => { m.visible = C3_SHOT && C3_SHOT.id === 's18'; });   // the near real wheels only where the workers handle them
  redraw(s.loan, 'l' + (t >= 28.75 ? 2 : t >= 4.74 ? 1 : 0), (g, w, h) => bkTexLoanDraw(g, w, h, t >= 28.75 ? 2 : t >= 4.74 ? 1 : 0)); }
function bkTexLoanDraw(g, w, h, st) { const T = bkTexLoan(st); g.clearRect(0, 0, w, h); g.drawImage(T.image, 0, 0, w, h); }
const bkRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#d8643a', bgBlur: 1.0, glow: 0.45, glowBlur: 12 }, o));
const bkCam = (s, id, lt, p, l, fov = 42) => c3SetCam(s.cam, camMove([[0, p, l, fov], [9, p, l, fov]], lt, id, { orbit: 0, creep: 0, rush: 0 }));
function bkPose(s, who, t, x, z, o = {}) { const p = s.p[who]; p.g.visible = true; p.g.position.set(x, o.sit ? BK_SIT : FOOT, z);
  c3PersonPose(p, s.cam, t, Object.assign({ expr: 'happy', gaze: [0, 0], hand: { armL: [1.4, 1.6], armR: [-1.4, 1.6] } }, o.sit ? sitFeet(BK_SIT) : o.walk ? walkFeet(t * 10 + x) : STAND, o.pose || {})); return p; }
// the people of the hall: clients queueing at the counter, the teller, the guard by the vault
function bkHall(s, t, o = {}) {
  [['c1', 20, 26], ['c2', 23.5, 27.5], ['c3', 27, 26.5], ['c4', 30.5, 28]].forEach(([w, x, z], i) => bkPose(s, w, t, x, z, { pose: { expr: Math.sin(t * 2 + i) > 0.3 ? 'talking' : 'happy', gaze: [i % 2 ? 0.6 : -0.6, 0] } }));
  bkPose(s, 'teller', t, 26, 15, { pose: { expr: 'happy', gaze: [0, 0] } });
  if (!o.noGuard) bkPose(s, 'guard', t, -24, 9, { pose: { expr: 'neutral', gaze: [-0.5, 0], hand: { armL: [0.9, 1.2], armR: [-0.9, 1.2] } } });
}
const bkDesk = (s, t, o = {}) => { bkPose(s, 'banker', t, ...BK_SEAT.banker, { sit: true, pose: Object.assign({ gaze: [0.8, 0], expr: 'smile' }, o.banker || {}) }); if (!o.noYou) bkPose(s, 'you', t, ...BK_SEAT.you, { sit: true, pose: Object.assign({ gaze: [-0.8, 0] }, o.you || {}) }); };

// ---- s01: the hall, clients at the counter (people first), then the vault door on "vault"; GOLD crossed out on "gold"
SHOT_FN['s01'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's01', lt, [6, 12, 64], [4, 9, 20], 46); bkHall(s, t);
  popAt(s.noGold, pop(t, 2.28, 0.22), [BK_DOOR[0], 10, 2], s.cam); bkRender(s); };
// ---- s02: inside the vault: the aisle of cheese towers ("It holds cheese")
SHOT_FN['s02'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's02', lt, [BK_AISLE, 9, -4], [BK_AISLE, 11, -60], 50); bkRender(s, { bg: '#3a2a20' }); };
// ---- s03: you walk in to the banker's desk (the LOAN form is on the desk)
SHOT_FN['s03'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's03', lt, [6, 9.5, 58], [5, 7, 34], 44); bkHall(s, t);
  const k = EZ.io(clamp((t - 3.9) / 1.1)); bkDesk(s, t, { noYou: true });
  if (k < 1) bkPose(s, 'you', t, lerp(14, BK_SEAT.you[0], k), lerp(50, BK_SEAT.you[1] + 1, k), { walk: true, pose: { gaze: [-0.6, 0] } }); else bkPose(s, 'you', t, ...BK_SEAT.you, { sit: true, pose: { gaze: [-0.8, 0], expr: 'happy' } });
  bkRender(s); };
// ---- s04: the banker doesn't ask about your salary: the payslip pops, NOT NEEDED
SHOT_FN['s04'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's04', lt, [3, 9, 50], [3, 7, 34], 42); bkHall(s, t);
  bkDesk(s, t, { banker: { expr: t > 6.1 ? 'smug' : 'talking', hand: t > 6.1 ? { armL: [2.2, 3.4], armR: [-1.4, 1.6] } : undefined }, you: { expr: 'nervous' } });
  popAt(s.pay, pop(t, 6.8, 0.22), [BK_SEAT.you[0], 12.6, BK_SEAT.you[1]], s.cam); bkRender(s); };
// ---- s05: he asks how many wheels you've got: the wheel photo in his thought cloud
SHOT_FN['s05'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's05', lt, [2, 9, 48], [2, 7.5, 34], 42); bkHall(s, t);
  bkDesk(s, t, { banker: { expr: t > 8.1 ? 'excited' : 'talking' }, you: { expr: 'surprised' } });
  popAt(s.cloudW, pop(t, 8.12, 0.25), [BK_SEAT.banker[0] - 1.2, 12.8, BK_SEAT.banker[1]], s.cam); bkRender(s); };
// ---- s13: the banker knocks on the wheel, listens like it's a watermelon, APPROVED (kick)
SHOT_FN['s13'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's13', lt, [4, 9, 48], [4, 7, 34], 42); bkHall(s, t);
  const knock = t > 25.72 && t < 26.5, listen = t >= 26.62 && t < 28.6;
  bkDesk(s, t, { banker: { expr: t >= 28.75 ? 'excited' : listen ? 'thinking' : 'neutral', lean: listen ? 0.22 : 0, hand: knock ? { armL: [2.6, 2.4 + 0.4 * Math.abs(Math.sin(t * 18))], armR: [-1.4, 1.6] } : t >= 28.75 ? { armL: [2.0, 4.0], armR: [-1.4, 1.6] } : undefined }, you: { expr: t >= 28.75 ? 'excited' : 'nervous' } });
  popAt(s.cloudM, pop(t, 27.38, 0.25), [BK_SEAT.banker[0] - 1.2, 12.6, BK_SEAT.banker[1]], s.cam);
  const k = t >= 28.75 && t < 29.17 ? EZ.back(clamp((t - 28.75) / 0.18)) : 0; popAt(s.approved, k, [BK_DESK[0], 9.5, BK_DESK[1] + 1], s.cam); bkRender(s); };
// ---- s14: the guard leans over: "Relax. If anyone robs us, we'll smell them coming." (sniffs, smell lines)
SHOT_FN['s14'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's14', lt, [6, 9, 50], [6, 7.5, 34], 42); bkHall(s, t, { noGuard: true });
  bkDesk(s, t, { banker: { expr: 'smile' }, you: { expr: t > 31.7 ? 'surprised' : 'happy' } });
  const lean = EZ.io(clamp((t - 30.0) / 0.4)); bkPose(s, 'guard', t, 11, 36.5, { pose: { lean: -0.16 * lean, expr: t > 32.5 ? 'smug' : t > 30.6 ? 'talking' : 'neutral', gaze: [-0.7, 0], hand: { armL: [1.0, 1.4], armR: [-1.8, 3.6] } } });
  s.smell.forEach((m, i) => popAt(m, pop(t, 32.59 + i * 0.15, 0.2), [10.2 - i * 0.9, 11.6 + i * 0.4, 36.8], s.cam)); bkRender(s); };
// ---- s16: your cheese becomes the guarantee: the wheel on the desk, GUARANTEE tag on "guarantee"
SHOT_FN['s16'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's16', lt, [6.6, 8.6, 41], [6.4, 4.8, 33.6], 40); bkHall(s, t);
  bkDesk(s, t, { banker: { expr: 'happy' }, you: { expr: 'happy' } });
  popAt(s.guar, pop(t, 39.61, 0.22), [BK_DESK[0] + 2.6, 6.2, BK_DESK[1] - 0.2], s.cam); bkRender(s); };
// ---- s17: the giant warehouse (vault), high over the aisles
SHOT_FN['s17'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's17', lt, [BK_AISLE, 18, 6], [BK_AISLE, 8, -50], 52);
  bkPose(s, 'w1', t, BK_AISLE - 1, -24, { pose: { expr: 'happy' } }); bkPose(s, 'w2', t, BK_AISLE + 1.2, -40, { pose: { expr: 'happy' } }); bkRender(s, { bg: '#3a2a20' }); };
// ---- s18: workers flip ("flip") and brush ("brush") the wheels
SHOT_FN['s18'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's18', lt, [BK_AISLE, 8.5, 2], [BK_AISLE, 6, -16], 42);   // straight down the aisle (review: the glide cut through a rack)
  const fk = EZ.io(clamp((t - 44.19) / 0.45)); s.flip.visible = true; s.flip.position.set(BK_AISLE + 1.6, 4.6 + Math.sin(fk * Math.PI) * 1.4, -14); s.flip.rotation.set(fk * Math.PI, 0, Math.PI / 2);
  bkPose(s, 'w1', t, BK_AISLE - 0.6, -13.4, { pose: { expr: t > 44.2 ? 'determined' : 'happy', gaze: [0.6, 0], hand: { armL: [2.0, 2.6 + fk], armR: [-0.4, 2.6 + fk] } } });
  const br = t > 44.83 ? Math.sin(t * 22) * 0.4 : 0; bkPose(s, 'w2', t, BK_AISLE + 2.2, -18, { pose: { expr: 'happy', gaze: [-0.6, 0], hand: { armL: [2.2 + br, 3.0], armR: [-1.4, 1.6] } } });
  if (t > 44.6) holdProp(s.p.w2, 'brush', 'armL', () => { const g = new THREE.Group(); g.add(rb(0.3, 1.4, 0.3, c3Prop('#8a5a30'), 0, 0.7, 0, 0.01)); g.add(rb(1.8, 0.5, 0.7, c3Prop('#e0b03c'), 0, 1.6, 0, 0.01)); return g; }, { dy: 0 });
  bkRender(s, { bg: '#3a2a20' }); };
// ---- s19: up over the racks: ≈ 400,000 WHEELS, then the tag € 100s OF MILLIONS on "millions"
SHOT_FN['s19'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's19', lt, [BK_AISLE, 18, 4], [BK_AISLE, 14, -50], 54);   // down the aisle at eye level (review: no top-down over the set)
  popAt(s.counter, pop(t, 47.79, 0.25), [BK_AISLE, 22, -26], s.cam); popAt(s.tagM, pop(t, 50.45, 0.22), [BK_AISLE, 15.5, -26], s.cam); bkRender(s, { bg: '#3a2a20' }); };
// ---- s20: if you can't pay it back: you shrug; the banker keeps the cheese — SOLD on "sells"
SHOT_FN['s20'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's20', lt, [4, 9, 50], [4, 7, 34], 42); bkHall(s, t);
  const shrug = t > 52.0 && t < 53.4, take = EZ.io(clamp((t - 53.57) / 0.6));
  bkDesk(s, t, { banker: { expr: t > 53.5 ? 'smug' : 'neutral', hand: take > 0 ? { armL: [2.4, 2.6], armR: [-1.4, 1.6] } : undefined }, you: { expr: shrug ? 'embarrassed' : t > 53.6 ? 'sad' : 'nervous', hand: shrug ? { armL: [2.2, 3.0], armR: [-2.2, 3.0] } : undefined } });
  s.deskWheel.position.x = BK_DESK[0] + 2.6 - 4.4 * take;
  popAt(s.sold, pop(t, 54.53, 0.2), [BK_DESK[0] - 1.6, 6.6, BK_DESK[1]], s.cam); bkRender(s); s.deskWheel.position.x = BK_DESK[0] + 2.6; };
// ---- s21: the vault: the guard inside, sniffing — "the most valuable thing inside smells amazing" (love); the door swings shut
SHOT_FN['s21'] = (t, u, lt) => { const s = bkGet(); bkReset(s, t); bkCam(s, 's21', lt, [BK_DOOR[0] + 2, 9, 40], [BK_DOOR[0], 8.5, 0], 42); bkHall(s, t, { noGuard: true });
  bkPose(s, 'guard', t, BK_AISLE + 0.5, -6, { pose: { expr: t > 58.89 ? 'love' : t > 58.2 ? 'smug' : 'happy', gaze: [0.4, 0], hand: { armL: [1.0, 1.4], armR: [-1.0, 1.4] } } });
  s.hearts.forEach((m, i) => popAt(m, pop(t, 58.95 + i * 0.12, 0.2), [BK_AISLE - 1.2 + i * 1.2, 13.6 + (i % 2) * 0.5, -5.6], s.cam));
  s.door.rotation.y = lerp(1.9, 0, EZ.i3 ? EZ.i3(clamp((t - 59.6) / 0.5)) : clamp((t - 59.6) / 0.5) ** 2); bkRender(s); };

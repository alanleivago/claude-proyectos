// =====================================================================
//  SET home — the owner's small Swiss flat at dusk: teal wallpaper over a walnut wainscot, plank floor, a window on the
//  Alps (snow caps, a lit chalet), red curtains, the Swiss flag, a mustard sofa, bookcase, floor lamp, clock, pictures,
//  plant, rug, the front door (right). Centre: the cage table — a blue-tray playpen with wire walls, bedding, Gerald's
//  tiny house (GERALD sign, a siren on the roof for "broken the law"), water bottle, bowl, hay — and a free corner of
//  the table where the RENT-A-PIG box lands. Registers the home shots. Prefix hm. Room x -32..32, z 0..56, back wall z 0.
// =====================================================================
const HM = {};
const HM_X = 32, HM_Z = 72, HM_H = 26, HM_TOP = 4.6, HM_BED = 5.45;
const HM_CAGE = [-1.8, 22, 12.4, 6.2];   // centre x, z, width, depth
const HM_YOU = [12.2, 21.5], HM_DOOR = [19, 0];
const HM_GER = [-2.6, 22.8], HM_FRI = [-0.3, 22.5], HM_BOX = [6.9, 22.2], HM_HOUSE = [2.0, 20.4], HM_BOTTLE = [-5.6, 19.2];
function hmTexWall() { const t = tex((g, w, h) => { const wain = h * 0.75; g.fillStyle = '#3f7c74'; g.fillRect(0, 0, w, wain);
  g.fillStyle = 'rgba(240,226,190,0.2)'; for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) { const x = (i + 0.5 + (j % 2) * 0.5) * w / 6, y = (j + 0.5) * wain / 6;
    g.beginPath(); g.moveTo(x, y - 18); g.lineTo(x + 10, y); g.lineTo(x, y + 18); g.lineTo(x - 10, y); g.closePath(); g.fill(); g.beginPath(); g.arc(x, y - 26, 3, 0, TAU); g.fill(); }
  g.fillStyle = '#7a4628'; g.fillRect(0, wain, w, h - wain); g.strokeStyle = 'rgba(30,14,6,0.55)'; g.lineWidth = 4;
  for (const x of [8, 136, 264, 392]) { g.strokeRect(x + 10, wain + 26, 108, h - wain - 46); g.strokeStyle = 'rgba(255,220,180,0.18)'; g.strokeRect(x + 16, wain + 32, 96, h - wain - 58); g.strokeStyle = 'rgba(30,14,6,0.55)'; }
  g.fillStyle = '#efdcb4'; g.fillRect(0, wain - 8, w, 14); g.fillStyle = '#140e10'; g.fillRect(0, wain + 6, w, 3); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function hmTexFloor() { const t = tex((g, w, h) => { const R = RNG('hmfl'); for (let i = 0; i < 8; i++) { g.fillStyle = `hsl(24,${48 + R.r(-6, 6)}%,${34 + R.r(-4, 4)}%)`; g.fillRect(0, i * h / 8, w, h / 8);
    g.fillStyle = 'rgba(20,8,4,0.6)'; g.fillRect(0, i * h / 8, w, 3); const x = R.r(0, w); g.fillRect(x, i * h / 8, 3, h / 8);
    g.strokeStyle = 'rgba(40,16,6,0.2)'; for (let k = 0; k < 4; k++) { const y = i * h / 8 + R.r(6, h / 8 - 6); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R.n(4), w * 2 / 3, y + R.n(4), w, y); g.stroke(); } } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 6); return t; }
function hmTexAlps() { return tex((g, w, h) => { const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#24366e'); sky.addColorStop(0.55, '#6a6aa8'); sky.addColorStop(0.8, '#f0a070'); sky.addColorStop(1, '#f6c890');
  g.fillStyle = sky; g.fillRect(0, 0, w, h); const R = RNG('stars'); g.fillStyle = '#fff6e0'; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(R.f() * w, R.f() * h * 0.4, R.r(1, 2.4), 0, TAU); g.fill(); }
  g.fillStyle = '#fff4d8'; g.beginPath(); g.arc(w * 0.78, h * 0.18, 26, 0, TAU); g.fill();
  const peaks = (y0, amp, col, cap, seed) => { const r = RNG('pk', seed); g.beginPath(); g.moveTo(0, h); let x = 0; const pts = []; while (x <= w + 60) { pts.push([x, y0 - r.r(0.2, 1) * amp]); x += r.r(60, 130); }
    pts.forEach(([a, b], i) => { if (i) g.lineTo((a + pts[i - 1][0]) / 2, y0 - amp * 0.1); g.lineTo(a, b); }); g.lineTo(w, h); g.closePath(); g.fillStyle = col; g.fill();
    g.fillStyle = cap; pts.forEach(([a, b]) => { if (y0 - b > amp * 0.45) { g.beginPath(); g.moveTo(a, b); g.lineTo(a + 26, b + 34); g.lineTo(a + 10, b + 28); g.lineTo(a - 4, b + 38); g.lineTo(a - 24, b + 32); g.closePath(); g.fill(); } }); };
  peaks(h * 0.7, h * 0.42, '#8a92c4', '#f4f2ff', 1); peaks(h * 0.84, h * 0.3, '#4c5a8e', '#e6e8f8', 2);
  g.fillStyle = '#2c3a5c'; g.fillRect(0, h * 0.88, w, h * 0.12);
  g.fillStyle = '#5a3420'; g.fillRect(w * 0.2, h * 0.8, 70, 44); g.fillStyle = '#8a2a20'; g.beginPath(); g.moveTo(w * 0.2 - 12, h * 0.8); g.lineTo(w * 0.2 + 35, h * 0.8 - 30); g.lineTo(w * 0.2 + 82, h * 0.8); g.fill();
  g.fillStyle = '#ffd27a'; g.fillRect(w * 0.2 + 14, h * 0.8 + 12, 14, 14); g.fillRect(w * 0.2 + 42, h * 0.8 + 12, 14, 14); }, 768, 768); }
function hmTexFlag() { return tex((g, w, h) => { g.fillStyle = '#d8282a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(w * 0.4, h * 0.18, w * 0.2, h * 0.64); g.fillRect(w * 0.18, h * 0.4, w * 0.64, h * 0.2); }, 256, 256); }
function hmTexBedding() { const t = tex((g, w, h) => { g.fillStyle = '#e8cf8e'; g.fillRect(0, 0, w, h); const R = RNG('bed'); for (let i = 0; i < 500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(180,140,70,0.5)' : 'rgba(255,240,200,0.6)';
  g.save(); g.translate(R.f() * w, R.f() * h); g.rotate(R.f() * TAU); g.fillRect(-6, -1.5, 12, 3); g.restore(); } }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return t; }
function hmTexBooks(seed) { return tex((g, w, h) => { const R = RNG('bk', seed); g.fillStyle = '#3a2214'; g.fillRect(0, 0, w, h); let x = 6; const C = ['#c8402e', '#2f6aa8', '#e2a23a', '#3f8a5a', '#8a4aa8', '#e8e0cc', '#2a2a3a', '#d86a3a'];
  while (x < w - 10) { const bw = R.r(14, 30), bh = R.r(h * 0.62, h * 0.95); g.fillStyle = C[Math.floor(R.f() * C.length)]; g.fillRect(x, h - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, h - bh + 10, bw - 6, 4); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + bw - 2, h - bh, 2, bh); x += bw + 1; } }, 512, 128); }
function hmTexPic(k) { return tex((g, w, h) => { g.fillStyle = '#f2e6cc'; g.fillRect(0, 0, w, h);
  if (k === 0) { const s = g.createLinearGradient(0, 0, 0, h); s.addColorStop(0, '#8ac8f0'); s.addColorStop(1, '#d8f0ff'); g.fillStyle = s; g.fillRect(16, 16, w - 32, h - 32); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(16, h - 40); g.lineTo(w * 0.45, h * 0.3); g.lineTo(w - 16, h - 40); g.fill(); g.fillStyle = '#5aa04a'; g.fillRect(16, h - 50, w - 32, 34); }
  else { g.fillStyle = '#e8b04a'; g.fillRect(16, 16, w - 32, h - 32); g.fillStyle = '#d8843a'; g.beginPath(); g.ellipse(w / 2, h * 0.6, w * 0.3, h * 0.22, 0, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w * 0.62, h * 0.6, w * 0.08, h * 0.16, 0, 0, TAU); g.fill();
    g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(w * 0.58, h * 0.55, 6, 0, TAU); g.arc(w * 0.7, h * 0.55, 6, 0, TAU); g.fill(); inked(g, 'GERALD', w / 2, h * 0.24, h * 0.12, '#ffffff', { stroke: '#2a1208' }); }
  g.lineWidth = 16; g.strokeStyle = '#6a3a1e'; g.strokeRect(0, 0, w, h); }, 256, 320); }
function hmTexClock() { return tex((g, w, h) => { g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 6, 0, TAU); g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1a14'; g.stroke();
  g.fillStyle = '#2a1a14'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(w / 2 + Math.cos(a) * w * 0.38 - 4, h / 2 + Math.sin(a) * h * 0.38 - 4, 8, 8); }
  g.lineCap = 'round'; g.lineWidth = 10; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + w * 0.2, h / 2 - h * 0.08); g.stroke(); g.lineWidth = 6; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 - w * 0.05, h / 2 - h * 0.32); g.stroke();
  g.fillStyle = '#d8282a'; g.beginPath(); g.arc(w / 2, h / 2, 10, 0, TAU); g.fill(); }, 256, 256); }
function hmTexSign(txt) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#b8783a'; g.beginPath(); g.roundRect(10, 30, w - 20, h - 40, 18); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
  g.strokeStyle = 'rgba(80,40,10,0.4)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(24, 50 + i * 26); g.lineTo(w - 24, 54 + i * 26); g.stroke(); }
  g.fillStyle = '#2a1208'; g.beginPath(); g.arc(34, 52, 7, 0, TAU); g.arc(w - 34, 52, 7, 0, TAU); g.fill(); inked(g, txt, w / 2, h / 2 + 14, h * 0.4, '#fff3d6', { stroke: '#2a1208', sw: h * 0.06, maxW: w * 0.8 }); }, 512, 180); }
function hmTexBattery(level, col) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(12, 30, w - 70, h - 60, 26); g.fill(); g.lineWidth = 16; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#2a1208'; g.beginPath(); g.roundRect(w - 62, h / 2 - 30, 44, 60, 10); g.fill();
  const n = Math.round(level * 5); for (let i = 0; i < 5; i++) { g.fillStyle = i < n ? col : 'rgba(0,0,0,0.08)'; g.beginPath(); g.roundRect(32 + i * (w - 110) / 5, 50, (w - 110) / 5 - 10, h - 100, 10); g.fill(); } }, 512, 256); }
function hmTexBeam() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,190,0.0)'); gr.addColorStop(0.3, 'rgba(255,240,190,0.25)'); gr.addColorStop(1, 'rgba(255,240,190,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const s = g.createLinearGradient(0, 0, w, 0); s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(0.35, 'rgba(0,0,0,0)'); s.addColorStop(0.65, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = s; g.fillRect(0, 0, w, h); }, 128, 256); }

function hmBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#ffe8d8', ambI: 0.55, sky: '#ffe0c0', ground: '#3a2a3a', key: '#ffe6c8', keyI: 1.05, keyP: [-40, 50, 60], rim: '#8aa0ff', rimI: 0.4, rimP: [40, 30, -30] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = hmTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  scene.add(pl(2 * HM_X, HM_Z, c3Prop('#ffffff', { map: hmTexFloor(), rough: 0.5, env: 0.6 }), 0, 0, HM_Z / 2, 0, -Math.PI / 2));
  // back wall with two openings: the window (x -6..6, y 7..18) and the door (x 15.5..22.5, y 0..14.5)
  const seg = (x0, x1, y0, y1) => scene.add(plNC(x1 - x0, y1 - y0, wallM(Math.max(1, (x1 - x0) / 12)), (x0 + x1) / 2, (y0 + y1) / 2, 0));
  seg(-HM_X, -6, 0, HM_H); seg(-6, 6, 0, 7); seg(-6, 6, 18, HM_H); seg(6, 15.5, 0, HM_H); seg(15.5, 22.5, 14.5, HM_H); seg(22.5, HM_X, 0, HM_H);
  scene.add(plNC(HM_Z, HM_H, wallM(5), -HM_X, HM_H / 2, HM_Z / 2, Math.PI / 2)); scene.add(plNC(HM_Z, HM_H, wallM(5), HM_X, HM_H / 2, HM_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * HM_X, HM_H, wallM(5), 0, HM_H / 2, HM_Z, Math.PI)); scene.add(plNC(2 * HM_X, HM_Z, c3Prop('#efe2c8', { rough: 0.9 }), 0, HM_H, HM_Z / 2, 0, Math.PI / 2));
  const cream = c3Prop('#efdcb4', { rough: 0.6 }), walnut = c3Prop('#6a3a20', { rough: 0.5 }), red = c3Prop('#c8302e', { rough: 0.8 }), brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 });
  // window: the Alps view, frame, mullions, sill, red curtains
  scene.add(pl(12, 11, c3Flat('#ffffff', { map: hmTexAlps() }), 0, 12.5, -0.6));
  for (const [x, y, w, h] of [[0, 18.3, 13, 0.6], [0, 6.7, 13.6, 0.6], [-6.3, 12.5, 0.6, 11.6], [6.3, 12.5, 0.6, 11.6], [0, 12.5, 0.3, 11], [0, 12.5, 12, 0.3]]) scene.add(rb(w, h, 0.6, cream, x, y, 0.1, 0.02));
  scene.add(rb(14, 0.4, 1.4, cream, 0, 6.6, 0.6, 0.02));
  for (const x of [-7.8, 7.8]) { const c = c3Mesh(new THREE.CylinderGeometry(1.1, 1.5, 13, 10, 1, true, 0, Math.PI), red, 0.02); c.position.set(x, 12.2, 0.9); c.rotation.y = Math.PI / 2; scene.add(c); }
  { const r = cyl(0.12, 0.12, 18, brass, 0, 19.2, 1.0, 0.01, 8); r.rotation.z = Math.PI / 2; scene.add(r); }
  // the Swiss flag, the clock, two pictures over the sofa, a shelf with a pot
  scene.add(pl(4.6, 4.6, c3Flat('#ffffff', { map: hmTexFlag() }), 11.2, 17.2, 0.15));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.3, 28), [walnut, c3Flat('#ffffff', { map: hmTexClock() }), walnut], 0.02); c.rotation.x = Math.PI / 2; c.position.set(-11, 18.6, 0.2); scene.add(c); }
  scene.add(pl(2.6, 3.2, c3Flat('#ffffff', { map: hmTexPic(0) }), -13.6, 12.6, 0.15)); scene.add(pl(2.4, 3.0, c3Flat('#ffffff', { map: hmTexPic(1) }), -9.8, 12.2, 0.15));
  // the door (right): frame, slab on a hinge (opens toward the room), a dark hall behind
  s.door = new THREE.Group(); s.door.position.set(15.6, 0, 0.3); scene.add(s.door);
  { const d = rb(6.8, 14.3, 0.4, c3Prop('#a8452e', { rough: 0.6 }), 3.4, 7.15, 0, 0.02); s.door.add(d); for (const [y, h] of [[10.6, 4.4], [3.9, 5.4]]) s.door.add(rb(5.2, h, 0.2, c3Prop('#93392a', { rough: 0.6 }), 3.4, y, 0.25, 0.012));
    const k = c3Mesh(new THREE.SphereGeometry(0.28, 10, 8), brass, 0.01); k.position.set(6.0, 7, 0.45); s.door.add(k); }
  for (const [x, y, w, h] of [[15.2, 7.4, 0.6, 14.8], [22.8, 7.4, 0.6, 14.8], [19, 14.8, 8.2, 0.6]]) scene.add(rb(w, h, 0.8, cream, x, y, 0.2, 0.02));
  // the corridor behind the front door runs ALONG the back wall (x -12..30, z -1..-7): through the doorway you see its
  // far wall, and the 'forever' line turns left in it and disappears behind the wall
  { const hall = c3Prop('#c8704a', { rough: 0.9 }); scene.add(pl(42, 7, c3Prop('#ffffff', { map: texTiles('#6a4a3a', '#7a5a46', [10, 2]), rough: 0.7 }), 9, 0.02, -3.6, 0, -Math.PI / 2));
    scene.add(plNC(42, 15, hall, 9, 7.5, -7.2)); scene.add(plNC(7, 15, hall, 30, 7.5, -3.6, -Math.PI / 2)); scene.add(plNC(42, 7, hall, 9, 15, -3.6, 0, Math.PI / 2));
    scene.add(pl(2.4, 3, c3Flat('#ffffff', { map: hmTexPic(0) }), 27, 9.6, -7.1)); scene.add(rb(42, 0.6, 0.3, c3Prop('#8a5a32'), 9, 5.0, -7.0, 0.01)); scene.add(rb(4, 0.3, 1.2, c3Prop('#6a3a20'), 25, 3.6, -6.4, 0.01));
    for (const x of [-4, 6, 16, 26]) { const b = c3Mesh(new THREE.SphereGeometry(0.5, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0); b.position.set(x, 14.4, -3.6); scene.add(b); const pt = new THREE.PointLight('#ffd090', 0.5, 16, 1.6); pt.position.set(x, 12, -3.6); scene.add(pt); } }
  // depth-only occluders on the FOCUS layer (the back wall + door frame): people/pets beyond the doorway are hidden by
  // the wall even though walls render in the BG pass (s16)
  { const om = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); s.occ = new THREE.Group(); scene.add(s.occ);
    for (const [x0, x1, y0, y1] of [[-HM_X, 15.2, 0, HM_H], [22.8, HM_X, 0, HM_H], [15.2, 22.8, 14.8, HM_H]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), om); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.05); m.renderOrder = 0; s.occ.add(m); }
    c3Layer(s.occ, C3.L_FOCUS); s.occ.visible = false; }
  scene.add(pl(6, 2.6, c3Prop('#c8302e', { rough: 0.9 }), 19, 0.03, 2.6, 0, -Math.PI / 2));   // doormat
  // the sofa (mustard), cushions, a throw
  { const mus = c3Prop('#d39a32', { rough: 0.85 }), g = new THREE.Group(); g.position.set(4.5, 0, 3.6); scene.add(g);
    g.add(rb(11, 2.4, 4.4, mus, 0, 2.2, 0.4, 0.03)); g.add(rb(11, 4.4, 1.4, mus, 0, 4.4, -1.5, 0.03)); for (const x of [-5.8, 5.8]) g.add(rb(1.2, 3.6, 4.6, mus, x, 2.8, 0.3, 0.03));
    for (const [x, c] of [[-3.4, '#3f7c74'], [3.2, '#c8302e']]) { const cu = rb(2.6, 2.4, 0.8, c3Prop(c, { rough: 0.9 }), x, 4.6, -0.5, 0.02); cu.rotation.z = x * 0.04; g.add(cu); }
    for (const x of [-4.6, 4.6]) g.add(cyl(0.25, 0.18, 1.0, walnut, x, 0.5, 2.2, 0.01, 8)); }
  // the floor lamp + its light, the plant, the bookcase (left wall), the rug
  { const g = new THREE.Group(); g.position.set(-4.6, 0, 4.4); scene.add(g); g.add(cyl(0.9, 1.1, 0.3, brass, 0, 0.15, 0, 0.01, 14)); g.add(cyl(0.1, 0.1, 11, brass, 0, 5.6, 0, 0.005, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(1.0, 1.8, 2.2, 18, 1, true), (() => { const m = c3Prop('#f6dca0', { emissive: '#ffc870', ei: 0.7, glow: '#ffc060' }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = 11.6; sh.userData.noCast = true; g.add(sh);
    const pt = new THREE.PointLight('#ffc070', 0.9, 34, 1.4); pt.position.set(0, 10.5, 0.6); g.add(pt); s.lamp = pt; }
  { const g = new THREE.Group(); g.position.set(-28, 0, 5); scene.add(g); g.add(cyl(1.5, 1.1, 2.6, c3Prop('#c96a3f'), 0, 1.3, 0, 0.02, 14));
    for (let i = 0; i < 11; i++) { const a = i * 2.3, lf = c3Mesh(new THREE.SphereGeometry(1.2, 10, 6), c3Prop(i % 2 ? '#4f9a44' : '#3f8a3a', { rough: 0.8 }), 0.01); lf.scale.set(0.5, 1.9, 0.18); lf.position.set(Math.sin(a) * 1.3, 4.6 + (i % 3) * 0.8, Math.cos(a) * 1.3); lf.rotation.set(0.5 * Math.cos(a), a, -0.5 * Math.sin(a)); g.add(lf); } }
  { const g = new THREE.Group(); g.position.set(-30.4, 0, 22); g.rotation.y = Math.PI / 2; scene.add(g); g.add(rb(12, 18, 2.6, walnut, 0, 9, 0, 0.03));
    for (let i = 0; i < 4; i++) { g.add(pl(11, 3.4, c3Flat('#ffffff', { map: hmTexBooks(i) }), 0, 2.4 + i * 4.3, 1.32)); g.add(rb(11.4, 0.3, 2.6, walnut, 0, 0.6 + i * 4.3 + 4.2 - 4.2, 0.1, 0.01)); } }
  scene.add(pl(22, 14, c3Prop('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#8a2a2e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c070'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40); g.strokeStyle = '#2f5a6a'; g.lineWidth = 6; g.strokeRect(40, 40, w - 80, h - 80);
    g.fillStyle = 'rgba(232,192,112,0.6)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * (0.2 + i * 0.15), h / 2, 14, 0, TAU); g.fill(); } }, 512, 320), rough: 0.95 }), 0, 0.04, 23, 0, -Math.PI / 2));
  { const g = new THREE.Group(); g.position.set(26, 0, 4); scene.add(g); g.add(cyl(0.18, 0.18, 13, walnut, 0, 6.5, 0, 0.01, 8)); g.add(cyl(1.0, 1.2, 0.3, walnut, 0, 0.15, 0, 0.01, 12));
    g.add(rb(2.4, 5.4, 1.0, c3Prop('#e8c23a', { rough: 0.7 }), 0.4, 9.4, 0.4, 0.02)); g.add(rb(0.6, 4.4, 0.4, c3Prop('#c8302e', { rough: 0.9 }), -0.8, 10.2, 0.9, 0.01)); }
  for (const [x, c] of [[17.6, '#3a3a44'], [19.6, '#c8602a']]) for (const d of [-0.4, 0.4]) scene.add(rb(0.7, 0.45, 1.5, c3Prop(c, { rough: 0.6 }), x + d, 0.25, 4.2, 0.01));
  { scene.add(rb(6, 0.3, 1.4, walnut, -12, 6.4, 0.8, 0.01)); for (const [x, c] of [[-14, '#c96a3f'], [-12.4, '#e8e0cc'], [-10.6, '#3f7c74']]) { scene.add(cyl(0.45, 0.35, 0.8, c3Prop(c), x, 6.95, 0.8, 0.01, 10)); const lf = c3Mesh(new THREE.SphereGeometry(0.6, 8, 6), c3Prop('#4f9a44'), 0.008); lf.position.set(x, 7.7, 0.8); scene.add(lf); } }
  { const g = new THREE.Group(); g.position.set(0, HM_H, 22); scene.add(g); g.add(cyl(0.05, 0.05, 6, brass, 0, -3, 0, 0, 4));
    const sh = c3Mesh(new THREE.ConeGeometry(2.0, 1.6, 20, 1, true), (() => { const m = c3Prop('#3f7c74', { rough: 0.5 }); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = -6.6; sh.userData.noCast = true; g.add(sh);
    const bl = c3Mesh(new THREE.SphereGeometry(0.5, 10, 8), c3Prop('#fff0c0', { emissive: '#ffd890', ei: 1, glow: '#ffd890' }), 0); bl.position.y = -7.2; bl.userData.noCast = true; g.add(bl); const pt = new THREE.PointLight('#ffcf8a', 0.7, 26, 1.5); pt.position.y = -7.6; g.add(pt); }
  { const g = new THREE.Group(); g.position.set(-3.6, 0, 5); scene.add(g); g.add(cyl(1.2, 1.2, 0.2, walnut, 0, 3.4, 0, 0.01, 18)); g.add(cyl(0.15, 0.2, 3.3, walnut, 0, 1.7, 0, 0.005, 8)); g.add(mug('#e8eef6', -0.4, 3.5, 0.2)); g.add(rb(1.2, 0.7, 0.5, c3Prop('#c8602a'), 0.4, 3.85, -0.2, 0.01)); }
  { const np = pl(2.4, 1.7, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f2ece0'; g.fillRect(0, 0, w, h); inked(g, 'ZÜRI NEWS', w / 2, h * 0.14, h * 0.13, '#2a1a14', { stroke: false, font: 'Georgia, serif' }); g.fillStyle = 'rgba(40,30,20,0.5)'; for (let i = 0; i < 9; i++) g.fillRect(w * (i % 2 ? 0.53 : 0.06), h * (0.3 + Math.floor(i / 2) * 0.13), w * 0.4, 6); }, 256, 180) }), 7.4, 4.62, 4.4, 0.3, -1.25); scene.add(np); }
  for (const x of [-3.6, 3.6]) { scene.add(cyl(0.35, 0.28, 0.6, c3Prop('#c96a3f'), x, 7.1, 0.7, 0.01, 10)); scene.add(cyl(0.18, 0.2, 0.9, c3Prop('#3f8a3a'), x, 7.8, 0.7, 0.01, 8)); }
  scene.add(pl(2.0, 2.6, c3Flat('#ffffff', { map: texCalendar('MAY', '2026') }), 13.2, 10.6, 0.15));
  // ---- FOCUS: the cage table and everything on it
  const F = new THREE.Group(); scene.add(F);
  const oak = c3Prop('#a8662e', { rough: 0.5 }), blue = c3Prop('#3f86c8', { rough: 0.35 }), wire = c3Prop('#dfe6ee', { metal: 0.5, rough: 0.35 });
  F.add(rb(18, 0.5, 9, oak, 0, HM_TOP - 0.25, 22, 0.02)); for (const x of [-8.3, 8.3]) for (const z of [18.2, 25.8]) F.add(rb(0.6, HM_TOP - 0.5, 0.6, oak, x, (HM_TOP - 0.5) / 2, z, 0.01));
  F.add(rb(17, 0.4, 8, oak, 0, 0.8, 22, 0.01));   // the low shelf (hay bag + spare bowl)
  F.add(rb(2.6, 1.6, 1.6, c3Prop('#e2c060', { rough: 0.9 }), -5, 1.8, 22.4, 0.02));
  const [cx, cz, cw, cd] = HM_CAGE;
  F.add(rb(cw, 0.85, cd, blue, cx, HM_TOP + 0.42, cz, 0.02));
  F.add(pl(cw - 0.4, cd - 0.4, c3Prop('#ffffff', { map: hmTexBedding(), rough: 0.95 }), cx, HM_BED - 0.02, cz, 0, -Math.PI / 2));
  { const hgt = 1.35, y0 = HM_TOP + 0.85; const bar = (x, z) => F.add(cyl(0.035, 0.035, hgt, wire, x, y0 + hgt / 2, z, 0.006, 5));
    for (let x = cx - cw / 2 + 0.1; x <= cx + cw / 2; x += 0.62) bar(x, cz - cd / 2 + 0.1);   // back + sides only: the front stays open so faces read (posts at the corners)
    for (const x of [cx - cw / 2 + 0.1, cx + cw / 2 - 0.1]) bar(x, cz + cd / 2 - 0.1);
    for (let z = cz - cd / 2 + 0.6; z < cz + cd / 2 - 0.3; z += 0.62) { bar(cx - cw / 2 + 0.1, z); bar(cx + cw / 2 - 0.1, z); }
    { const r = cyl(0.06, 0.06, cw, wire, cx, y0 + hgt, cz - cd / 2 + 0.1, 0.008, 6); r.rotation.z = Math.PI / 2; F.add(r); }   // back rail only: no bar across the faces
    for (const x of [cx - cw / 2 + 0.1, cx + cw / 2 - 0.1]) { const r = cyl(0.06, 0.06, cd, wire, x, y0 + hgt, cz, 0.008, 6); r.rotation.x = Math.PI / 2; F.add(r); } }
  F.add(pl(2.6, 0.9, c3Flat('#ffffff', { map: hmTexSign('GERALD'), transparent: true }), HM_GER[0], HM_TOP + 0.45, cz + cd / 2 + 0.03));
  { const tn = c3Mesh(new THREE.TorusGeometry(0.9, 0.42, 10, 18, Math.PI), c3Prop('#5ac0e8', { rough: 0.4 }), 0.015); tn.position.set(0.6, HM_BED, 19.8); tn.rotation.y = 0.1; F.add(tn); }
  { const st = cyl(0.12, 0.12, 1.6, c3Prop('#c08a4a'), 3.2, HM_BED + 0.12, 24.2, 0.006, 6); st.rotation.z = Math.PI / 2; st.rotation.y = 0.6; F.add(st); }
  // Gerald's tiny house: walls, a gable roof, an arched door, the GERALD plate, a siren on the ridge (hidden until s05)
  { const g = new THREE.Group(); g.position.set(HM_HOUSE[0], HM_BED, HM_HOUSE[1]); F.add(g); s.house = g;
    const wood = c3Prop('#d49a5a', { rough: 0.7 }), roof = c3Prop('#c8402e', { rough: 0.7 });
    g.add(rb(3.0, 1.9, 2.3, wood, 0, 0.95, 0, 0.02));
    for (const sd of [-1, 1]) { const r = rb(2.25, 0.18, 2.8, roof, sd * 0.86, 2.4, 0, 0.015); r.rotation.z = -sd * 0.6; g.add(r); }
    { const sh = new THREE.Shape(); sh.moveTo(-1.5, 0); sh.lineTo(1.5, 0); sh.lineTo(0, 1.1); sh.closePath(); for (const z of [1.16, -1.16]) { const gm = c3Mesh(new THREE.ShapeGeometry(sh), (() => { const m = c3Prop('#c98a4a', { rough: 0.7 }); m.side = THREE.DoubleSide; return m; })(), 0.015); gm.position.set(0, 1.9, z); g.add(gm); } }
    { const rg = cyl(0.12, 0.12, 2.9, c3Prop('#8a2a1e'), 0, 3.06, 0, 0.01, 8); rg.rotation.x = Math.PI / 2; g.add(rg); }
    for (const x of [-1.05, 1.05]) { g.add(pl(0.6, 0.6, c3Flat('#ffe6a0', { glow: '#ffd27a' }), x, 1.15, 1.17)); g.add(rb(0.75, 0.1, 0.12, c3Prop('#8a4a22'), x, 0.82, 1.2, 0.005)); }
    g.add(rb(0.9, 0.4, 0.5, c3Prop('#8aa04a'), 1.9, 0.2, 0.9, 0.01));
    g.add(pl(1.1, 1.2, c3Flat('#2a1610'), 0, 0.6, 1.17)); { const a = c3Mesh(new THREE.CircleGeometry(0.55, 16, 0, Math.PI), c3Flat('#2a1610')); a.position.set(0, 1.2, 1.171); g.add(a); }
    g.add(pl(1.9, 0.6, c3Flat('#ffffff', { map: hmTexSign('GERALD') }), 0, 1.68, 1.2));
    s.siren = new THREE.Group(); s.siren.position.set(0, 3.0, 0); g.add(s.siren);
    s.sirenM = c3Prop('#ff2a2a', { emissive: '#ff2020', ei: 1, glow: '#ff3030' }); s.siren.add(cyl(0.3, 0.38, 0.2, c3Prop('#2a2a30'), 0, 0.1, 0, 0.01, 12));
    const dome = c3Mesh(new THREE.SphereGeometry(0.34, 14, 8, 0, TAU, 0, Math.PI / 2), s.sirenM, 0.01); dome.position.y = 0.2; s.siren.add(dome);
    s.sirenL = new THREE.PointLight('#ff2a2a', 0, 26, 1.4); s.sirenL.position.set(0, 0.9, 0.6); s.siren.add(s.sirenL); s.siren.visible = false; }
  // the water bottle on the back wires, the bowl, the hay pile, a carrot
  { const g = new THREE.Group(); g.position.set(HM_BOTTLE[0], HM_BED, HM_BOTTLE[1]); F.add(g); s.bottle = g;
    g.add(cyl(0.42, 0.42, 1.9, c3Prop('#bfe6ff', { rough: 0.15, env: 1.4 }), 0, 2.1, 0, 0.01, 14)); g.add(cyl(0.43, 0.43, 0.9, c3Prop('#5ab0e8', { rough: 0.2 }), 0, 1.5, 0, 0, 14));
    g.add(cyl(0.3, 0.3, 0.3, c3Prop('#e83a3a'), 0, 1.0, 0, 0.01, 12)); const sp = cyl(0.06, 0.06, 0.9, wire, 0, 0.75, 0.25, 0.005, 6); sp.rotation.x = 0.6; g.add(sp); }
  F.add(cyl(0.85, 0.65, 0.5, c3Prop('#e86a8a', { rough: 0.3 }), -5.6, HM_BED + 0.25, 23.8, 0.015, 18));
  { const R = RNG('pell'); for (let i = 0; i < 14; i++) F.add(cyl(0.1, 0.1, 0.18, c3Prop('#7aa04a'), -5.6 + R.n(0.35), HM_BED + 0.55, 23.8 + R.n(0.35), 0, 6)); }
  { const R = RNG('hay'), hay = c3Prop('#e8c868', { rough: 0.95 }); for (let i = 0; i < 26; i++) { const h = cyl(0.04, 0.04, 1.4, hay, -6.8 + R.n(0.5), HM_BED + 0.3 + R.f() * 0.4, 20.2 + R.n(0.4), 0, 4); h.rotation.set(R.n(1.2), R.f() * 3, R.n(1.2)); F.add(h); } }
  { const c = c3Mesh(new THREE.ConeGeometry(0.22, 1.4, 10), c3Prop('#f07a22'), 0.01); c.rotation.z = Math.PI / 2 - 0.2; c.position.set(-3.8, HM_BED + 0.22, 24.4); F.add(c); }
  // the RENT-A-PIG box (table corner / carried), the hammer
  s.box = rentBox(1); F.add(s.box); s.box.visible = false;
  // the NOTICE OF VIOLATION (lies on the table; s05 top-down), a pen and the owner's mug beside it, the stamp that comes down
  s.notice = canvasTex(600, 800); s.noticeM = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.8), new THREE.MeshLambertMaterial({ map: s.notice.t })); s.noticeM.rotation.set(-Math.PI / 2, 0, 0.12); s.noticeM.position.set(6.9, HM_TOP + 0.02, 22.0); F.add(s.noticeM);
  F.add(mug('#c8302e', 8.4, HM_TOP, 18.8)); { const pn = cyl(0.07, 0.07, 1.8, c3Prop('#2a5ad8'), 5.0, HM_TOP + 0.08, 25.0, 0.006, 6); pn.rotation.set(0, 0.5, Math.PI / 2); F.add(pn); }
  s.stampB = new THREE.Group(); s.stampB.add(rb(1.5, 0.35, 0.9, c3Prop('#2a2a30'), 0, 0.18, 0, 0.01)); s.stampB.add(cyl(0.2, 0.25, 1.2, c3Prop('#8a5428'), 0, 0.95, 0, 0.01, 8)); { const kb = c3Mesh(new THREE.SphereGeometry(0.42, 10, 8), c3Prop('#c8282a'), 0.01); kb.position.y = 1.7; s.stampB.add(kb); } F.add(s.stampB); s.stampB.visible = false;
  // the two little hourglasses (s14: who outlives whom)
  s.hg = [0, 1].map(() => { const g = new THREE.Group(), glass = c3Prop('#dff2ff', { rough: 0.05, transparent: true }); glass.opacity = 0.35; glass.depthWrite = false;
    for (const y of [0.05, 1.75]) g.add(cyl(0.62, 0.62, 0.12, c3Prop('#8a5428'), 0, y, 0, 0.01, 14)); for (const x of [-0.5, 0.5]) g.add(cyl(0.05, 0.05, 1.7, c3Prop('#8a5428'), x, 0.9, 0.2, 0.004, 5));
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 16), glass); top.rotation.x = Math.PI; top.position.y = 1.3; g.add(top); const bot = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.8, 16), glass); bot.position.y = 0.5; g.add(bot);
    const sand = c3Prop('#f0c060', { rough: 0.8 }), sT = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 16), sand), sB = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 16), sand); sT.rotation.x = Math.PI; g.add(sT); g.add(sB);
    const str = cyl(0.03, 0.03, 0.8, sand, 0, 0.6, 0, 0, 4); g.add(str); g.userData.set = (k, run) => { sT.scale.setScalar(Math.max(0.02, k)); sT.position.y = 0.9 + 0.35 * k; sB.scale.setScalar(Math.max(0.05, 1 - k)); sB.position.y = 0.12 + 0.35 * (1 - k); str.visible = run; };
    g.visible = false; F.add(g); return g; });
  s.hammer = new THREE.Group(); s.hammer.add(cyl(0.09, 0.09, 1.8, c3Prop('#b8743a'), 0, -0.6, 0, 0.01, 8)); s.hammer.add(rb(1.0, 0.36, 0.36, c3Prop('#7a828c', { metal: 0.6, rough: 0.3 }), 0, 0.3, 0, 0.012)); F.add(s.hammer); s.hammer.visible = false;
  s.phoneM = null;
  // the spotlight cone (dark beats: "alone", "last guinea pig standing")
  s.beam = new THREE.Mesh(new THREE.PlaneGeometry(5, 16), new THREE.MeshBasicMaterial({ map: hmTexBeam(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); s.beam.renderOrder = 8; scene.add(s.beam); s.beam.visible = false;
  c3Layer(F, C3.L_FOCUS); c3Layer(s.beam, C3.L_FOCUS);
  // ---- people, pets, labels
  toonPerson(s, 'you'); toonPerson(s, 'lady');
  for (const k of ['gerald', 'friend', 'young', 'old']) toonPet(s, k, PETS[k]);
  for (let i = 0; i < 34; i++) toonPet(s, 'l' + i, herdPet(i));
  s.trouble = spritePlane(scene, texStamp('TROUBLE'), 7, 3.5); s.illegal = spritePlane(scene, texStamp('ILLEGAL!', '#d8282a', 0.12), 8, 4);
  s.nameSign = spritePlane(scene, hmTexSign('GERALD'), 4.2, 1.5); s.heart = spritePlane(scene, texHeart(), 1.6, 1.6); s.heart2 = spritePlane(scene, texHeart('#ff6a8a'), 1.1, 1.1);
  s.batG = spritePlane(scene, hmTexBattery(0.2, '#e8322a'), 2.4, 1.2); s.batY = spritePlane(scene, hmTexBattery(1, '#3ac04a'), 2.4, 1.2);
  s.hello = spritePlane(scene, texSay('Hello?'), 3.2, 2.0); s.burst = spritePlane(scene, texBurst('?!'), 2.6, 2.6);
  [s.trouble, s.illegal, s.nameSign, s.heart, s.heart2, s.batG, s.batY, s.hello, s.burst].forEach((m) => { m.material.depthTest = false; });
  s.dust = dustCloud(scene, [-28, 2, 4, 56, 20, 46], 220); c3Layer(s.dust, C3.L_BG);
  haze(scene, '#4a3440', 0.0065);
  c3Env(scene, { top: '#ffe0c0', mid: '#6a8a8a', bot: '#2a1a18' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  s.L0 = []; scene.traverse((l) => { if (l.isLight) s.L0.push([l, l.intensity, l.color.clone()]); });
  return s;
}
const hmGet = () => HM.s ||= hmBuild();
SETS.home = hmGet;
function hmReset(s, t) { hideAll(s); if (s.occ) s.occ.visible = false; s.noticeM.visible = !C3_SHOT || C3_SHOT.id === 's05'; s.hg.forEach((g) => { g.visible = false; }); s.stampB.visible = false; [s.trouble, s.illegal, s.nameSign, s.heart, s.heart2, s.batG, s.batY, s.hello, s.burst, s.box, s.hammer, s.beam, s.siren].forEach((m) => { m.visible = false; });
  s.door.rotation.y = 0; s.box.userData.open(0); s.box.scale.setScalar(1); s.sirenL.intensity = 0;
  s.L0.forEach(([l, i, c]) => { l.intensity = i; l.color.copy(c); }); c3Renderer().r.toneMappingExposure = 1.05; }
// night: every light dimmed to a blue fill, a warm lamp on the cage (Gerald alone)
function hmNight(s, k = 1) { s.L0.forEach(([l, i]) => { l.intensity = i * (1 - 0.68 * k); if (l.isAmbientLight || l.isHemisphereLight) l.color.lerp(new THREE.Color('#6a7ad8'), k); }); }
const hmCam = (s, id, lt, p, l, fov = 40) => c3SetCam(s.cam, camMove([[0, p, l, fov], [9, p, l, fov]], lt, id));
const hmRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#2a2030', bgBlur: 2.0, glow: 0.45, glowBlur: 12 }, o));
// the owner by the table (default: looking at the cage)
function hmYou(s, t, o = {}) { const [x, z] = o.at || HM_YOU; return pose(s, 'you', t, x, z, Object.assign({ facing: faceTo(s.cam, x, z, HM_CAGE[0], HM_CAGE[1]), gaze: [-0.5, 0.2], expr: 'smile', hand: { L: 'down', R: 'down' } }, o)); }
const pigFace = (s, x, z, tx, tz) => faceTo(s.cam, x, z, tx, tz);
function hmGerald(s, t, o = {}) { const [x, z] = o.at || HM_GER; return petAt(s, 'gerald', t, x, o.y ?? HM_BED, z, Object.assign({ facing: pigFace(s, x, z, x + 1, z + 0.4), expr: 'neutral' }, o)); }
// a pet held in both hands (after the person is posed): the card sits on the fists, a little toward the camera
function inHands(s, pet, who, t, o = {}) { const p = s.p[who], a = c3ToonHandWorld(p, 'L'), b = c3ToonHandWorld(p, 'R'), m = a.clone().add(b).multiplyScalar(0.5);
  const d = s.cam.position.clone().sub(m).setY(0).normalize(); m.addScaledVector(d, 0.6); return petAt(s, pet, t, m.x, m.y - 0.35, m.z, o); }
// a 3D prop held in a hand
function inHand(s, obj, who, arm, o = {}) { const h = c3ToonHandWorld(s.p[who], arm), d = s.cam.position.clone().sub(h).setY(0).normalize(); obj.visible = true; obj.position.copy(h).addScaledVector(d, o.fwd ?? 0.4); obj.position.y += o.dy ?? 0; obj.rotation.set(o.rx ?? 0, o.ry ?? 0, o.rz ?? 0); }

// ---- s01: Switzerland — the owner at the window side of the cage, the Alps; snaps to him + the cage on "you"
SHOT_FN.s01 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's01', lt, [-3, 12, 50], [-2, 9, 10], 46);
  hmYou(s, t, { facing: [[0, faceTo(s.cam, ...HM_YOU, 0, 0)], [0.86, faceTo(s.cam, ...HM_YOU, 0, 40)]], gaze: t < 0.86 ? [-0.6, -0.3] : [0, 0], expr: [[0, 'smile'], [0.86, 'happy']], hand: { L: 'down', R: [[0, 'down'], [0.86, 'wave']] } });
  hmGerald(s, t, { expr: 'neutral' }); hmRender(s, { bgBlur: 2 }); };
SNAPS.s01 = [[0, ['p:you', [4, 13, 2, 6, 10, 1]], 0.86], [0.86, ['p:you', 'p:gerald'], 0.8]];
// ---- s02: trouble for having a lonely guinea pig — the TROUBLE stamp over the cage, then Gerald alone
SHOT_FN.s02 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's02', lt, [-1, 8.6, 36], [-1.8, 6, 22], 40);
  hmGerald(s, t, { expr: [[0, 'worried'], [2.28, 'sad']], gaze: t < 2.28 ? [0.3, 0] : [0.6, 0.4], facing: [[0, 0.4], [2.28, 0.9]] });
  hmRender(s, { bgBlur: 6 }); };
SNAPS.s02 = [[1.40, [[-1.8, 7.2, 22, 12.4, 5.5, 6]], 0.7], [2.28, ['p:gerald'], 0.4]];
// ---- s03: you buy one, name him Gerald — Gerald held up, the GERALD sign pops
SHOT_FN.s03 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's03', lt, [15, 9.4, 38], [12, 7.6, 21.5], 40);
  hmYou(s, t, { facing: faceTo(s.cam, ...HM_YOU, 13, 40), gaze: t < 4.18 ? [-0.3, 0.3] : [0.2, -0.2], expr: [[0, 'happy'], [4.18, 'grin']], hand: { L: 'holdUp', R: 'holdUp' } });
  inHands(s, 'gerald', 'you', t, { expr: [[0, 'surprised'], [3.84, 'happy']], facing: 0.4, gaze: [0.4, -0.2] });
  hmRender(s, { bgBlur: 5 }); };
SNAPS.s03 = [[3.26, ['u:you'], 0.62], [3.84, [[HM_GER[0], HM_TOP + 0.9, 25.1, 4.2, 1.6, 0.4]], 0.72]];
CAMF.s03 = { push: 0.1, orbit: 0.04, crane: -0.4 };
// ---- s04: build him a tiny house — hammering on the roof, Gerald watching
SHOT_FN.s04 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's04', lt, [5, 9.6, 36], [4.5, 6.4, 21], 40);
  const swing = Math.floor((t - 4.66) / 0.18) % 2;
  hmYou(s, t, { at: [8.2, 20.4], facing: faceTo(s.cam, 8.2, 20.4, 0, 20), gaze: [-0.6, 0.6], expr: 'determined', hand: { L: 'desk', R: swing ? { h: [0.62, -0.25], pole: [1, 0.5], hand: 'grip' } : { h: [0.82, 0.2], pole: [1, 0.3], hand: 'grip' } } });
  inHand(s, s.hammer, 'you', 'R', { rz: swing ? 0.9 : -0.2, dy: 0.1 });
  hmGerald(s, t, { at: [-1.2, 22.6], expr: [[0, 'happy'], [5.16, 'excited']], facing: 0.8, gaze: [0.7, -0.4], hop: hopAt(t, 5.42) * 0.4 });
  hmRender(s, { bgBlur: 5 }); };
SNAPS.s04 = [[4.66, ['u:you', [2, 6.6, 20.4, 3.6, 3.4, 2.6]], 0.86], [5.16, [[2, 7, 20.4, 4.6, 3.6, 2.6], 'p:gerald'], 0.55]];
// ---- s05: and you've already broken the law — TOP-DOWN on the NOTICE OF VIOLATION on the table: the camera pans down its
// lines (title -> "Guinea pigs kept: 1 / Companion: NONE") and the stamp comes down: ILLEGAL on "law" (Ricks: info on paper)
function hmNoticeDraw(g, w, h, st) { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8282a'; g.fillRect(0, 0, w, h * 0.13); g.fillStyle = '#ffffff'; g.fillRect(w * 0.05, h * 0.03, h * 0.07, h * 0.07); g.fillStyle = '#d8282a'; g.fillRect(w * 0.05 + h * 0.028, h * 0.04, h * 0.014, h * 0.05); g.fillRect(w * 0.05 + h * 0.01, h * 0.058, h * 0.05, h * 0.014);
  inked(g, 'KANTON ZÜRICH', w * 0.58, h * 0.065, h * 0.05, '#ffffff', { stroke: false }); inked(g, 'NOTICE OF VIOLATION', w / 2, h * 0.2, h * 0.055, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 });
  g.fillStyle = 'rgba(40,30,20,0.4)'; for (let k = 0; k < 4; k++) g.fillRect(w * 0.1, h * (0.27 + k * 0.035), w * (0.6 + 0.2 * (k % 2)), 5);
  inked(g, 'Animal Protection Ordinance, Art. 13', w * 0.1, h * 0.43, h * 0.03, '#2a1a14', { stroke: false, align: 'left' });
  inked(g, 'GUINEA PIGS KEPT:', w * 0.1, h * 0.52, h * 0.042, '#2a1a14', { stroke: false, align: 'left' }); inked(g, '1', w * 0.8, h * 0.52, h * 0.06, '#d8282a', { stroke: false, font: '"Comic Sans MS", cursive' });
  inked(g, 'NAME:', w * 0.1, h * 0.59, h * 0.042, '#2a1a14', { stroke: false, align: 'left' }); inked(g, 'Gerald', w * 0.62, h * 0.59, h * 0.05, '#1a3a8a', { stroke: false, font: '"Comic Sans MS", cursive' });
  inked(g, 'COMPANION:', w * 0.1, h * 0.66, h * 0.042, '#2a1a14', { stroke: false, align: 'left' }); inked(g, 'NONE', w * 0.72, h * 0.66, h * 0.05, '#d8282a', { stroke: false, font: '"Comic Sans MS", cursive' });
  g.fillStyle = 'rgba(40,30,20,0.35)'; for (let k = 0; k < 2; k++) g.fillRect(w * 0.1, h * (0.92 + k * 0.03), w * 0.5, 4);
  if (st) { g.save(); g.translate(w * 0.52, h * 0.81); g.rotate(-0.2); g.globalAlpha = 0.9; g.strokeStyle = '#d8282a'; g.lineWidth = 12; g.beginPath(); g.roundRect(-w * 0.36, -h * 0.065, w * 0.72, h * 0.13, 16); g.stroke();
    inked(g, 'ILLEGAL', 0, 4, h * 0.085, '#d8282a', { stroke: false, font: 'Impact, Arial Black, sans-serif' }); g.restore(); } }
SHOT_FN.s05 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's05', lt, [7.3, 15, 23.4], [6.9, HM_TOP, 22.0], 40);
  redraw(s.notice, 'n' + (t >= 7.16 ? 1 : 0), (g, w, h) => hmNoticeDraw(g, w, h, t >= 7.16));
  const d = t - 7.16; if (d > -0.14 && d < 0.45) { s.stampB.visible = true; const y = d < 0 ? 2.6 * (-d / 0.14) ** 2 : d < 0.12 ? 0 : 2.6 * ((d - 0.12) / 0.33) ** 1.5; s.stampB.position.set(7.1, HM_TOP + 0.04 + y, 23.4); s.stampB.rotation.y = -0.08; }
  hmGerald(s, t, { expr: [[0, 'neutral'], [7.16, 'shock']], facing: 0.9 });
  hmRender(s, { bgBlur: 2 }); };
SNAPS.s05 = [[5.96, [[6.9, HM_TOP, 20.2, 3.6, 0.2, 1.4]], 0.92], [6.6, [[6.9, HM_TOP, 22.0, 3.6, 0.2, 1.8]], 0.92], [7.16, [[6.9, HM_TOP, 23.4, 4.2, 0.2, 2.4]], 0.95]];
CAMF.s05 = { push: 0.07, orbit: 0, crane: 0, roll: 7 };
// ---- s08: so you get Gerald a friend — the friend drops into the cage on "friend", a heart
SHOT_FN.s08 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's08', lt, [4, 9.4, 38], [2, 6.4, 22], 40);
  const drop = t >= 11.88, lift = { h: [0.22, 0.42], pole: [1, 0.5], front: true, hand: 'open' };
  hmYou(s, t, { at: [6.8, 21.2], facing: faceTo(s.cam, 6.8, 21.2, 0, 22), expr: 'happy', hand: drop ? { L: lift, R: lift } : { L: 'hold', R: 'hold' }, gaze: [-0.6, 0.5] });
  if (!drop) inHands(s, 'friend', 'you', t, { expr: 'smile', facing: -0.6 });
  else { const k = clamp((t - 11.88) / 0.32), x = lerp(5.4, 2.4, k), z = lerp(21.9, 22.6, k), y = HM_BED + Math.max(0, 2.2 * (1 - k) + 1.6 * Math.sin(Math.PI * k) * 0.6);
    petAt(s, 'friend', t, x, y, z, { expr: 'happy', facing: -0.9, squash: k >= 1 ? Math.max(0, 1 - (t - 12.2) / 0.18) * 0.8 : 0, spin: k < 1 ? -0.4 * Math.sin(Math.PI * k) : 0 }); }
  hmGerald(s, t, { expr: [[0, 'neutral'], [11.36, 'surprised'], [11.95, 'happy']], facing: 0.9, gaze: [0.6, 0] });
  popAt(s.heart, pop(t, 12.12, 0.2), [0.2, 8.4, 23], s.cam); hmRender(s, { bgBlur: 4 }); };
SNAPS.s08 = [[10.82, ['u:you', [0.5, 6, 22.6, 5, 2.4, 2]], 0.86], [11.88, ['p:gerald', [2.4, 6.4, 22.6, 2.6, 2, 1], [0.2, 8.4, 23, 1.6, 1.6, 1]], 0.86]];
// ---- s09: problem solved — the two pigs cuddle (hearts), then the owner dusts his hands, smug
SHOT_FN.s09 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's09', lt, [8, 9.2, 34], [6, 7, 21.5], 38);
  hmYou(s, t, { expr: [[0, 'smile'], [12.78, 'smug']], hand: { L: 'hip', R: [[0, 'down'], [12.78, 'up']] }, gaze: [0.2, 0] });
  petAt(s, 'friend', t, -1.1, HM_BED, 22.7, { expr: 'happy', facing: -0.9 }); hmGerald(s, t, { at: [-2.9, 22.8], expr: 'happy', facing: 0.9 });
  popAt(s.heart, pop(t, 12.4, 0.2), [-2, 8.0, 23], s.cam); popAt(s.heart2, pop(t, 12.6, 0.2), [-0.9, 8.9, 23], s.cam); hmRender(s, { bgBlur: 6 }); };
SNAPS.s09 = [[12.36, ['p:gerald', 'p:friend', [-2, 8.4, 23, 2, 2, 1]], 0.5], [12.78, ['u:you'], 0.68]];
// ---- s10: until one day, the friend dies — dusk, the friend's eyes close, a halo floats up on "dies"
SHOT_FN.s10 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 0.5); hmCam(s, 's10', lt, [0, 8.2, 34], [-1.6, 6.2, 22.6], 38);
  const dead = t >= 15.04; petAt(s, 'friend', t, HM_FRI[0], HM_BED, HM_FRI[1], { expr: dead ? 'neutral' : 'sad', blink: dead ? 1 : undefined, facing: -0.8, halo: dead ? 1 : 0, haloUp: dead ? (t - 15.04) * 0.7 : 0, squash: dead ? 0.3 : 0 });
  hmGerald(s, t, { expr: [[0, 'smile'], [14.82, 'worried'], [15.04, 'shock']], facing: 0.9, gaze: [0.6, 0] });
  hmRender(s, { bgBlur: 6 }); };
SNAPS.s10 = [[13.44, [[-1.4, 6.6, 22.6, 5.6, 3.2, 2]], 0.6], [14.82, ['p:friend', 'p:gerald'], 0.5], [15.04, ['p:friend', [-0.3, 8.4, 22.5, 2.4, 2.6, 1]], 0.6]];
// ---- s11: now Gerald is alone — night, a cone of lamp light on him
SHOT_FN.s11 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 1); hmCam(s, 's11', lt, [-2, 7.6, 31], [-2.6, 6.4, 22.8], 36);
  hmGerald(s, t, { expr: 'sad', facing: 0.2, gaze: [0, 0.6] });
  s.beam.visible = true; s.beam.position.set(HM_GER[0], HM_BED + 7.8, HM_GER[1] - 0.2); facing(s.beam, s.cam); hmRender(s, { bgBlur: 9 }); };
SNAPS.s11 = [[15.62, ['p:gerald', [-2.6, 9, 22.6, 4, 6, 1]], 0.72], [15.82, ['p:gerald'], 0.48]];
// ---- s12: and you can't leave him like that — the owner, worried, a hand on his chin
SHOT_FN.s12 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 0.35); hmCam(s, 's12', lt, [15, 9.6, 36], [11, 8, 21.5], 38);
  hmYou(s, t, { expr: [[0, 'worried'], [17.48, 'sad']], hand: { L: 'cross', R: [[0, { h: [-0.18, 0.5], pole: [1, 0.4], front: true }], [17.08, 'chin']] }, gaze: [-0.7, 0.4] });
  hmGerald(s, t, { expr: 'sad', facing: 0.7 }); hmRender(s, { bgBlur: 6 }); };
SNAPS.s12 = [[16.80, ['p:you', 'p:gerald'], 0.72], [17.48, ['u:you'], 0.66]];
// ---- s13: but if you buy him a young friend — a baby pig pops in on "young", sparkle
SHOT_FN.s13 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's13', lt, [-1, 8, 33], [-1.4, 6.2, 22.6], 38);
  hmGerald(s, t, { expr: [[0, 'sad'], [19.04, 'surprised']], facing: 0.8, gaze: [0.6, 0] });
  if (t >= 19.04) petAt(s, 'young', t, -0.4, HM_BED, 23, { expr: 'excited', facing: -0.7, hop: hopAt(t, 19.04, 0.3) + hopAt(t, 19.42, 0.28) * 0.6, fx: 'sparkle' });
  hmRender(s, { bgBlur: 7 }); };
SNAPS.s13 = [[18.24, ['p:gerald'], 0.42], [19.04, ['p:gerald', [-0.4, 6.4, 23, 2.2, 2.4, 1]], 0.5]];
// ---- s14: that one will outlive Gerald — battery bars: the young one full, Gerald low (blinking)
SHOT_FN.s14 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's14', lt, [-1, 8.4, 33], [-1.4, 6.6, 22.6], 38);
  hmGerald(s, t, { expr: [[0, 'neutral'], [20.7, 'worried']], facing: 0.8, gaze: [0.4, -0.6], fx: t > 20.7 ? 'sweat' : undefined });
  petAt(s, 'young', t, -0.4, HM_BED, 23, { expr: 'happy', facing: -0.7, hop: hopAt(t, 20.1, 0.28) * 0.5 });
  const [hy, hg] = s.hg; hy.visible = t >= 19.72; hy.position.set(4.3, HM_BED, 23.6); hy.scale.setScalar(pop(t, 19.72, 0.25) * 1.1); hy.userData.set(0.95, true);
  hg.visible = t >= 20.3; hg.position.set(-4.4, HM_BED, 23.4); hg.scale.setScalar(pop(t, 20.3, 0.25) * 1.1); hg.userData.set(Math.max(0.03, 0.14 - (t - 20.3) * 0.08), true); hmRender(s, { bgBlur: 7 }); };
SNAPS.s14 = [[19.72, ['p:young', [3.6, 6.4, 23.6, 1.4, 2, 1]], 0.7], [20.7, ['p:gerald', [-4.4, 6.4, 23.4, 1.4, 2, 1]], 0.7]];
// ---- s15: and then you'll need another one... and another one — pigs pop onto the table, one per "another"
SHOT_FN.s15 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's15', lt, [9, 10, 42], [5, 6.6, 22], 42);
  hmYou(s, t, { expr: [[0, 'nervous'], [22.88, 'shock']], hand: { L: [[0, 'down'], [21.98, 'shrug']], R: [[0, 'down'], [22.88, 'up']] }, gaze: [-0.6, 0.4], fx: t > 22.88 ? 'sweat' : undefined });
  hmGerald(s, t, { expr: 'neutral', facing: 0.8 }); petAt(s, 'young', t, -0.4, HM_BED, 23, { expr: 'happy', facing: -0.7 });
  [[21.98, 5.6, 24.6], [22.88, 8.2, 21.2], [23.1, 6.4, 19.6]].forEach(([t0, x, z], i) => { if (t >= t0) petAt(s, 'l' + i, t, x, HM_TOP, z, { expr: 'excited', facing: -0.6 + i * 0.4, hop: hopAt(t, t0, 0.3), squash: Math.max(0, 1 - (t - t0 - 0.3) / 0.15) * 0.5 * (t > t0 + 0.3) }); });
  hmRender(s, { bgBlur: 4 }); };
SNAPS.s15 = [[21.32, ['u:you', [-1, 6, 22.8, 3, 2.4, 1]], 0.8], [21.98, [[5.6, 5.6, 24.6, 3.4, 2.4, 1], 'u:you'], 0.7], [22.88, ['u:you', [6.8, 5.6, 22, 5, 2.4, 6]], 0.8]];
// ---- s16: forever — high wide: an endless line of guinea pigs from the table, across the rug, out of the door
// the line: across the floor to the doorway (x ~19, z 0), then a left turn down the corridor (z -3.6) behind the wall
const HM_LINE = (i) => { const d = i * 2.5, z = 26 - d; if (z > -3.6) return [19 - Math.max(0, z - 2) * 0.2 + Math.sin(i * 0.9) * 0.4, z]; return [19 - (-3.6 - z), -3.6 + Math.sin(i) * 0.3]; };
SHOT_FN.s16 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's16', lt, [11.6, 7.2, 42], [18.4, 0.6, -4], 44);
  s.door.rotation.y = Math.PI * 0.97; s.occ.visible = true;   // the leaf swung right back against the wall (out of the line's way)
  // (the owner stays out of this low shot: he blocked the lens in v2-test)
  for (let i = 0; i < 34; i++) { const [x, z] = HM_LINE(i); petAt(s, 'l' + i, t, x, 0, z, { expr: i % 3 ? 'happy' : 'excited', facing: faceTo(s.cam, x, z, ...HM_LINE(Math.max(0, i - 1))), hop: hopAt(t, 23.54 + (i % 5) * 0.09, 0.26) * 0.5, mode: 'walk', phase: t * 2.4 + i * 0.37 }); }
  hmRender(s, { bgBlur: 1.5 }); };
SNAPS.s16 = 'free'; CAMF.s16 = { push: 0.5, orbit: 0, crane: 0.6 };
// ---- s17: so you call — the owner on the phone, nervous
SHOT_FN.s17 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's17', lt, [15.5, 9.8, 34], [12.2, 8.6, 21.5], 36);
  hmYou(s, t, { facing: faceTo(s.cam, ...HM_YOU, 13, 40), expr: [[0, 'nervous'], [24.66, 'talk']], talk: t > 24.66 ? 0.8 : 0, hand: { L: 'cross', R: { h: [0.3, -0.1], pole: [0.6, 1], hand: 'grip' } }, prop: { R: 'phone' }, gaze: [0.3, -0.2] });
  hmRender(s, { bgBlur: 8 }); };
SNAPS.s17 = [[24.18, ['u:you'], 0.62], [24.66, ['u:you'], 0.75]];
// ---- s19: she shows up with a little box — the door opens, the lady holding the box; the owner from behind
SHOT_FN.s19 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's19', lt, [11, 9.6, 34], [17, 7.2, 4], 42);
  s.door.rotation.y = -1.5 * EZ.o3(clamp((t - 26.36) / 0.3));
  pose(s, 'lady', t, 19, 2.2, { facing: faceTo(s.cam, 19, 2.2, 13, 10), expr: [[0, 'smile'], [27.46, 'happy']], gaze: [-0.3, 0], hand: { L: 'hold', R: 'hold' } });
  { const a = c3ToonHandWorld(s.p.lady, 'L'), b = c3ToonHandWorld(s.p.lady, 'R'), m = a.add(b).multiplyScalar(0.5); s.box.visible = true; s.box.scale.setScalar(0.85); s.box.position.set(m.x, m.y - 1.2, m.z + 1.0); s.box.rotation.set(0, -0.4, 0); }
  hmYou(s, t, { at: [13.6, 11], facing: faceTo(s.cam, 13.6, 11, 19, 2), expr: 'surprised', gaze: [0.5, 0] });
  hmRender(s, { bgBlur: 4 }); };
SNAPS.s19 = [[26.36, ['p:lady', [19, 7.2, 1, 8, 14.6, 1]], 0.78], [27.28, ['u:lady', [19, 5.6, 3.6, 3, 2.2, 2]], 0.62]];
// ---- s20: and inside is an old, calm guinea pig — the box on the table opens, the old grey pig rises, sleepy
SHOT_FN.s20 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's20', lt, [8.6, 8.6, 33], [6.9, 6.2, 22.2], 38);
  s.box.visible = true; s.box.position.set(HM_BOX[0], HM_TOP, HM_BOX[1]); s.box.rotation.set(0, 0.25, 0); s.box.userData.open(EZ.o3(clamp((t - 28.06) / 0.25)));
  const up = EZ.o3(clamp((t - 28.4) / 0.3)); if (up > 0) petAt(s, 'old', t, HM_BOX[0], HM_TOP + 0.35 + up * 1.35, HM_BOX[1] + 0.1, { expr: [[0, 'neutral'], [28.88, 'bored'], [29.28, 'deadpan'], [29.72, 'bored']], facing: -0.3, gaze: [-0.2, 0] });
  hmYou(s, t, { expr: [[0, 'surprised'], [29.28, 'smile']], gaze: [-0.6, 0.4] });
  hmRender(s, { bgBlur: 7 }); };
SNAPS.s20 = [[27.90, [[6.9, 5.8, 22.2, 3.4, 2.6, 2.4]], 0.45], [28.88, ['p:old', [6.9, 5.6, 22.2, 3, 1.6, 2]], 0.45], [29.72, ['p:old'], 0.52]];
// ---- s21: ready for the job — the old pig next to Gerald in the cage, a slow nod (blink), Gerald nervous
SHOT_FN.s21 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's21', lt, [-0.4, 8.4, 33.5], [-1.4, 6.3, 22.6], 38);
  petAt(s, 'old', t, HM_FRI[0], HM_BED, HM_FRI[1], { expr: [[0, 'bored'], [31.08, 'determined']], facing: -0.8, gaze: [-0.5, 0], fx: t > 31.08 ? 'sparkle' : undefined, squash: hopAt(t, 31.08, 0.25) * 0.5 });
  hmGerald(s, t, { expr: [[0, 'nervous'], [31.08, 'surprised']], facing: 0.8, gaze: [0.6, 0] }); hmRender(s, { bgBlur: 8 }); };
SNAPS.s21 = [[30.48, ['p:old', 'p:gerald'], 0.5], [31.08, ['p:old'], 0.45]];
// ---- s22: she looks at Gerald and says — the lady behind the cage, leaning in; Gerald nervous (sweat)
SHOT_FN.s22 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's22', lt, [-2.6, 9.6, 38], [-2.2, 7.4, 18], 40);
  pose(s, 'lady', t, -2.2, 15.2, { facing: 0.2, lean: t > 32.14 ? 0.14 : 0, expr: [[0, 'smile'], [32.3, 'happy']], gaze: [0, 0.8], hand: { L: 'desk', R: 'desk' } });
  petAt(s, 'old', t, HM_FRI[0], HM_BED, HM_FRI[1], { expr: 'bored', facing: -0.8 }); hmGerald(s, t, { expr: [[0, 'neutral'], [32.3, 'nervous']], facing: 0.2, gaze: [0, -0.8], fx: t > 32.3 ? 'sweat' : undefined });
  hmRender(s, { bgBlur: 4 }); };
SNAPS.s22 = [[31.64, ['p:lady', [-1.8, 6, 22, 12.4, 2.4, 6]], 0.78], [32.3, ['p:gerald', 'u:lady'], 0.62]];
// ---- s23: don't worry, mine's very good at goodbyes — the lady, kind (talking); on "goodbyes" the old pig, smug
SHOT_FN.s23 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's23', lt, [-2, 10, 32], [-2, 8.6, 15.2], 36);
  pose(s, 'lady', t, -2.2, 15.2, { facing: 0.15, lean: 0.12, expr: [[0, 'talk'], [33.88, 'smile'], [34.84, 'smug']], talk: t < 35.3 ? 0.8 : 0, gesture: 0.5, gaze: [0, 0.6], hand: { L: 'desk', R: [[0, 'desk'], [33.14, { h: [0.02, 0.2], pole: [0.6, 1], front: true, hand: 'open' }], [33.88, { h: [-0.16, 0.06], pole: [0.6, 1], front: true, hand: 'point' }], [34.84, 'desk']] } });
  petAt(s, 'old', t, HM_FRI[0], HM_BED, HM_FRI[1], { expr: [[0, 'bored'], [34.84, 'smug']], facing: -0.4, gaze: [0.3, -0.3] });
  hmGerald(s, t, { expr: [[0, 'nervous'], [34.84, 'shock']], facing: 0.5, fx: 'sweat' }); hmRender(s, { bgBlur: 8 }); };
SNAPS.s23 = [[33.14, ['u:lady'], 0.62], [34.84, ['p:old', 'p:gerald'], 0.5]];
// ---- s26: a guinea pig with nobody to talk to gets stressed — Gerald says "Hello?" to his bottle; stressed: shock + pop
SHOT_FN.s26 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 0.4); hmCam(s, 's26', lt, [-3.4, 8, 32], [-4.4, 6.6, 20.8], 38);
  const g = [-4.0, 21.2]; hmGerald(s, t, { at: g, expr: [[0, 'neutral'], [41.74, 'talk'], [42.46, 'worried'], [43.08, 'shock']], talk: t > 41.74 && t < 42.4 ? 0.8 : 0, facing: faceTo(s.cam, ...g, HM_BOTTLE[0], HM_BOTTLE[1]), fx: t > 43.08 ? 'sweat' : undefined, hop: hopAt(t, 43.12, 0.3) });
  hmRender(s, { bgBlur: 8 }); };
SNAPS.s26 = [[40.88, ['p:gerald', [-5.6, 7.3, 19.2, 1.4, 3.6, 1]], 0.55], [41.92, ['p:gerald', [-5.6, 7.3, 19.2, 1.4, 3.6, 1]], 0.66], [43.08, ['p:gerald'], 0.45]];
// ---- s29: for the last guinea pig standing — dark, Gerald alone in the spotlight, chin up
SHOT_FN.s29 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 1); hmCam(s, 's29', lt, [-2.6, 6.4, 30], [-2.6, 6.8, 22.8], 34);
  hmGerald(s, t, { expr: [[0, 'sad'], [47.4, 'determined']], facing: 0, gaze: [0, -0.4] });
  s.beam.visible = true; s.beam.position.set(HM_GER[0], HM_BED + 7.8, HM_GER[1] - 0.2); facing(s.beam, s.cam); hmRender(s, { bgBlur: 10 }); };
SNAPS.s29 = [[46.52, ['p:gerald', [-2.6, 9.4, 22.8, 4, 6, 1]], 0.7], [47.4, ['p:gerald'], 0.42]];
// ---- s30: when your pet's friend passes away, you borrow one of hers — at the door the lady hands the box over
SHOT_FN.s30 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmCam(s, 's30', lt, [10, 9.6, 30], [16.2, 7.2, 6], 42);
  s.door.rotation.y = -1.5; const give = t >= 50.34;
  const rest = { h: [0.1, 0.62], pole: [1, 0.3], front: true }, palm = { h: [0.2, 0.5], pole: [1, 0.5], front: true, hand: 'open' };
  pose(s, 'lady', t, 16.4, 4.4, { facing: faceTo(s.cam, 16.4, 4.4, 21, 8), expr: [[0, 'smile'], [50.34, 'happy']], gaze: [0.5, 0], hand: give ? { L: palm, R: palm } : { L: 'hold', R: 'hold' } });
  hmYou(s, t, { at: [21.2, 8.2], facing: faceTo(s.cam, 21.2, 8.2, 16.4, 4.4), expr: [[0, 'sad'], [49.38, 'nervous'], [50.34, 'happy']], gaze: [0.5, 0.2], hand: give ? { L: 'hold', R: 'hold' } : { L: rest, R: rest } });
  { const who = give ? 'you' : 'lady', a = c3ToonHandWorld(s.p[who], 'L'), b = c3ToonHandWorld(s.p[who], 'R'), m = a.add(b).multiplyScalar(0.5), d = s.cam.position.clone().sub(m).setY(0).normalize();
    s.box.visible = true; s.box.scale.setScalar(0.8); s.box.position.copy(m).addScaledVector(d, 1.0); s.box.position.y -= 1.0; s.box.rotation.set(0, -0.5, 0); }
  hmRender(s, { bgBlur: 4 }); };
SNAPS.s30 = [[48.06, ['p:you', 'p:lady'], 0.78], [50.34, ['u:you', 'u:lady'], 0.72]];
// ---- s31: and when your pet passes away too — Gerald's eyes close, his halo rises; the old pig, sad; the owner, sad
SHOT_FN.s31 = (t, u, lt) => { const s = hmGet(); hmReset(s, t); hmNight(s, 0.55); hmCam(s, 's31', lt, [-0.6, 8.6, 35], [-1.6, 6.6, 22.4], 38);
  const gone = t >= 52.02; hmGerald(s, t, { expr: gone ? 'neutral' : 'smile', blink: gone ? 1 : undefined, facing: 0.6, halo: gone ? 1 : 0, haloUp: gone ? (t - 52.02) * 0.7 : 0, squash: gone ? 0.25 : 0 });
  petAt(s, 'old', t, HM_FRI[0], HM_BED, HM_FRI[1], { expr: gone ? 'sad' : 'bored', facing: -0.8, gaze: [-0.6, 0] });
  hmRender(s, { bgBlur: 7 }); };
SNAPS.s31 = [[51.36, ['p:gerald', 'p:old'], 0.5], [52.02, ['p:gerald', [-2.6, 8.8, 22.8, 2.6, 2.6, 1]], 0.56]];


// =====================================================================
//  SET office — a Swiss federal animal office: grey-blue walls over oak panelling, a green lino floor, the Swiss flag
//  on a pole, law books, filing cabinets, a clock, a plant; on the back wall the GUINEA PIGS poster (2 = OK, 1 = NO)
//  and the map of Switzerland (ZURICH pin pops); the official's desk (green lamp, stamp, papers, nameplate) and the big
//  ANIMAL WELFARE ACT he holds up. Registers s06, s07, s24, s25, s27. Prefix of. Room x -26..26, z 0..44.
// =====================================================================
const OF = {};
const dxOf = (k) => OF_DESK[0] + k;
const OF_X = 26, OF_Z = 62, OF_H = 24, OF_DESK = [0, 17], OF_MAN = [0, 13.2], OF_POSTER = [-9, 13.2], OF_MAP = [9.5, 13.4];
const OF_ZH = [OF_MAP[0] + 0.11 * 12, OF_MAP[1] + 0.23 * 8];   // the Zurich dot on the map texture (0.61 w, 0.27 h)   // Zurich on the map (world x, y)
function ofTexWall() { const t = tex((g, w, h) => { const wain = h * 0.7; g.fillStyle = '#8eaabb'; g.fillRect(0, 0, w, wain); g.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 0; x < w; x += 64) g.fillRect(x, 0, 28, wain);
  g.fillStyle = '#9a6a3a'; g.fillRect(0, wain, w, h - wain); g.strokeStyle = 'rgba(40,20,8,0.5)'; g.lineWidth = 4; for (const x of [10, 138, 266, 394]) g.strokeRect(x + 8, wain + 24, 112, h - wain - 44);
  g.fillStyle = '#efe2c4'; g.fillRect(0, wain - 8, w, 14); g.fillStyle = '#140e10'; g.fillRect(0, wain + 6, w, 3); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// a little guinea pig drawn flat (poster / map icons)
function ofPig(g, x, y, s, fur = '#d97f34') { g.save(); g.translate(x, y); g.fillStyle = fur; g.beginPath(); g.ellipse(0, 0, 60 * s, 42 * s, 0, 0, TAU); g.fill(); g.lineWidth = 8 * s; g.strokeStyle = '#2a1a14'; g.stroke();
  g.fillStyle = '#fbf3e6'; g.beginPath(); g.ellipse(26 * s, 8 * s, 22 * s, 16 * s, 0, 0, TAU); g.fill(); g.fillStyle = '#2a1a14'; g.beginPath(); g.arc(16 * s, -8 * s, 5 * s, 0, TAU); g.arc(36 * s, -8 * s, 5 * s, 0, TAU); g.fill();
  g.fillStyle = '#e8828c'; g.beginPath(); g.arc(27 * s, 4 * s, 5 * s, 0, TAU); g.fill(); g.restore(); }
function ofTexPoster() { return tex((g, w, h) => { g.fillStyle = '#fff6e2'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8282a'; g.fillRect(0, 0, w, h * 0.17);
  g.fillStyle = '#ffffff'; g.fillRect(w * 0.06, h * 0.05, w * 0.07, h * 0.07); g.fillStyle = '#d8282a'; g.fillRect(w * 0.085, h * 0.06, w * 0.02, h * 0.05); g.fillRect(w * 0.07, h * 0.075, w * 0.05, h * 0.02);
  inked(g, 'GUINEA PIGS', w * 0.56, h * 0.085, h * 0.08, '#ffffff', { stroke: false, maxW: w * 0.75 });
  ofPig(g, w * 0.3, h * 0.36, 1.1); ofPig(g, w * 0.66, h * 0.38, 1.1, '#f6efe4');
  g.strokeStyle = '#2f9a4a'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.4, h * 0.53); g.lineTo(w * 0.48, h * 0.59); g.lineTo(w * 0.62, h * 0.48); g.stroke();
  g.fillStyle = 'rgba(40,30,20,0.2)'; g.fillRect(w * 0.08, h * 0.65, w * 0.84, 4);
  ofPig(g, w * 0.4, h * 0.79, 1.1, '#a8a49e'); g.strokeStyle = '#d8282a'; g.lineWidth = 26; g.beginPath(); g.moveTo(w * 0.62, h * 0.72); g.lineTo(w * 0.82, h * 0.88); g.moveTo(w * 0.82, h * 0.72); g.lineTo(w * 0.62, h * 0.88); g.stroke();
  inked(g, '2 = OK', w * 0.18, h * 0.6, h * 0.05, '#2f9a4a', { stroke: false }); inked(g, '1 = NO', w * 0.18, h * 0.94, h * 0.05, '#d8282a', { stroke: false });
  g.lineWidth = 14; g.strokeStyle = '#2a1208'; g.strokeRect(0, 0, w, h); }, 512, 720); }
function ofTexMap() { return tex((g, w, h) => { g.fillStyle = '#cfe6f2'; g.fillRect(0, 0, w, h);
  const S = [[0.06, 0.62], [0.12, 0.5], [0.2, 0.46], [0.24, 0.36], [0.33, 0.3], [0.4, 0.2], [0.5, 0.17], [0.58, 0.13], [0.66, 0.16], [0.74, 0.14], [0.82, 0.24], [0.9, 0.3], [0.95, 0.44], [0.88, 0.52], [0.84, 0.66], [0.74, 0.7], [0.66, 0.84], [0.58, 0.78], [0.5, 0.86], [0.42, 0.8], [0.34, 0.86], [0.24, 0.78], [0.16, 0.8], [0.1, 0.72]];
  g.beginPath(); S.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.closePath(); g.fillStyle = '#e8d8a8'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#d8282a'; g.stroke();
  g.fillStyle = '#c8b888'; for (const [x, y, r] of [[0.5, 0.62, 0.12], [0.68, 0.6, 0.1], [0.3, 0.64, 0.1]]) { g.beginPath(); g.moveTo((x - r) * w, y * h + 30); g.lineTo(x * w, (y - 0.1) * h); g.lineTo((x + r) * w, y * h + 30); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x * w - 16, (y - 0.06) * h); g.lineTo(x * w, (y - 0.1) * h); g.lineTo(x * w + 16, (y - 0.06) * h); g.fill(); g.fillStyle = '#c8b888'; }
  g.fillStyle = '#6ab0e0'; for (const [x, y, rx, ry] of [[0.14, 0.64, 0.06, 0.03], [0.6, 0.3, 0.04, 0.02], [0.52, 0.42, 0.05, 0.02], [0.82, 0.22, 0.05, 0.025]]) { g.beginPath(); g.ellipse(x * w, y * h, rx * w, ry * h, 0.4, 0, TAU); g.fill(); }
  g.fillStyle = '#2a1a14'; for (const [x, y, n] of [[0.36, 0.38, 'Bern'], [0.12, 0.6, 'Geneva'], [0.48, 0.18, 'Basel']]) { g.beginPath(); g.arc(x * w, y * h, 8, 0, TAU); g.fill(); inked(g, n, x * w, y * h + 28, 26, '#2a1a14', { stroke: false }); }
  g.fillStyle = '#d8282a'; g.beginPath(); g.arc(0.61 * w, 0.27 * h, 10, 0, TAU); g.fill(); inked(g, 'ZURICH', 0.61 * w + 22, 0.27 * h - 2, 34, '#d8282a', { stroke: '#ffffff', sw: 6, align: 'left' });
  g.lineWidth = 16; g.strokeStyle = '#6a3a1e'; g.strokeRect(0, 0, w, h); }, 768, 512); }
function ofTexBook() { return tex((g, w, h) => { g.fillStyle = '#a8282a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e8c060'; g.lineWidth = 10; g.strokeRect(20, 20, w - 40, h - 40);
  g.fillStyle = '#ffffff'; g.fillRect(w * 0.42, h * 0.12, w * 0.16, h * 0.16); g.fillStyle = '#a8282a'; g.fillRect(w * 0.48, h * 0.14, w * 0.04, h * 0.12); g.fillRect(w * 0.445, h * 0.18, w * 0.11, h * 0.04);
  inked(g, 'ANIMAL', w / 2, h * 0.44, h * 0.11, '#ffe6a0', { stroke: '#2a1208', sw: 6, font: 'Georgia, serif' }); inked(g, 'WELFARE', w / 2, h * 0.58, h * 0.11, '#ffe6a0', { stroke: '#2a1208', sw: 6, font: 'Georgia, serif' }); inked(g, 'ACT', w / 2, h * 0.72, h * 0.11, '#ffe6a0', { stroke: '#2a1208', sw: 6, font: 'Georgia, serif' });
  inked(g, '§ Art. 13', w / 2, h * 0.88, h * 0.06, '#ffffff', { stroke: false }); }, 384, 512); }
function ofTexYear() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fbf3e0'; g.beginPath(); g.roundRect(10, 10, w - 20, h - 20, 18); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#d8282a'; g.fillRect(16, 16, w - 32, h * 0.26); inked(g, 'NEW LAW', w / 2, h * 0.15, h * 0.12, '#ffffff', { stroke: false }); inked(g, '2008', w / 2, h * 0.62, h * 0.38, '#2a1208', { stroke: false }); }, 512, 400); }

function ofBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#f0f0ff', ambI: 0.55, sky: '#e8f0ff', ground: '#3a3a4a', key: '#fff0dc', keyI: 1.05, keyP: [30, 50, 60], rim: '#ffc890', rimI: 0.4, rimP: [-40, 30, -30] });
  const wallM = (rep) => c3Prop('#ffffff', { map: (() => { const t = ofTexWall(); t.repeat.set(rep, 1); return t; })(), rough: 0.85 });
  scene.add(pl(2 * OF_X, OF_Z, c3Prop('#ffffff', { map: texTiles('#3f6a5a', '#4f7a68', [10, 9]), rough: 0.35, env: 0.8 }), 0, 0, OF_Z / 2, 0, -Math.PI / 2));
  scene.add(plNC(2 * OF_X, OF_H, wallM(5), 0, OF_H / 2, 0)); scene.add(plNC(OF_Z, OF_H, wallM(4), -OF_X, OF_H / 2, OF_Z / 2, Math.PI / 2)); scene.add(plNC(OF_Z, OF_H, wallM(4), OF_X, OF_H / 2, OF_Z / 2, -Math.PI / 2));
  scene.add(plNC(2 * OF_X, OF_H, wallM(5), 0, OF_H / 2, OF_Z, Math.PI)); scene.add(plNC(2 * OF_X, OF_Z, c3Prop('#e8e8e4', { rough: 0.9 }), 0, OF_H, OF_Z / 2, 0, Math.PI / 2));
  const oak = c3Prop('#8a5428', { rough: 0.5 }), steel = c3Prop('#8a96a4', { metal: 0.5, rough: 0.35 }), brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 });
  for (const [x, y] of [[-6, OF_H - 0.3], [6, OF_H - 0.3]]) { const l = rbNC(8, 0.4, 2, c3Prop('#ffffff', { emissive: '#fff4e0', ei: 1.2, glow: '#fff6e0' }), x, y, 16, 0.01); scene.add(l); }
  scene.add(pl(7.2, 10.1, c3Flat('#ffffff', { map: ofTexPoster() }), OF_POSTER[0], OF_POSTER[1], 0.15));
  scene.add(pl(12, 8, c3Flat('#ffffff', { map: ofTexMap() }), OF_MAP[0], OF_MAP[1], 0.15));
  { const c = c3Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.3, 28), [oak, c3Flat('#ffffff', { map: hmTexClock() }), oak], 0.02); c.rotation.x = Math.PI / 2; c.position.set(0.4, 19.6, 0.2); scene.add(c); }
  // the flag on its pole, a bookcase of law books, filing cabinets, a plant, a water cooler
  { const g = new THREE.Group(); g.position.set(-20, 0, 6); scene.add(g); g.add(cyl(0.18, 0.18, 15, brass, 0, 7.5, 0, 0.01, 8)); g.add(cyl(1.2, 1.4, 0.4, brass, 0, 0.2, 0, 0.01, 12));
    const f = c3Mesh(new THREE.PlaneGeometry(5, 5, 10, 1), (() => { const m = c3Prop('#ffffff', { map: hmTexFlag(), rough: 0.9 }); m.side = THREE.DoubleSide; return m; })(), 0.02); const P = f.geometry.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, Math.sin(P.getX(i) * 1.1) * 0.35); f.geometry.computeVertexNormals();
    f.position.set(2.6, 12.2, 0); g.add(f); const k = c3Mesh(new THREE.SphereGeometry(0.35, 10, 8), brass, 0.01); k.position.y = 15.2; g.add(k); }
  { const g = new THREE.Group(); g.position.set(-24.6, 0, 18); g.rotation.y = Math.PI / 2; scene.add(g); g.add(rb(12, 17, 2.6, oak, 0, 8.5, 0, 0.03));
    for (let i = 0; i < 4; i++) g.add(pl(11, 3.4, c3Flat('#ffffff', { map: hmTexBooks(i + 7) }), 0, 2.4 + i * 4.1, 1.32)); }
  for (const x of [18, 21.2]) { scene.add(rb(3, 9, 3, steel, x, 4.5, 2.4, 0.03)); for (let i = 0; i < 3; i++) { scene.add(rb(2.4, 2.4, 0.2, steel, x, 1.8 + i * 2.9, 3.95, 0.01)); scene.add(rb(1, 0.25, 0.3, brass, x, 2.6 + i * 2.9, 4.1, 0.005)); } }
  { const g = new THREE.Group(); g.position.set(23, 0, 12); scene.add(g); g.add(cyl(1.3, 1.0, 2.2, c3Prop('#d8d4cc'), 0, 1.1, 0, 0.02, 14));
    for (let i = 0; i < 10; i++) { const a = i * 2.4, lf = c3Mesh(new THREE.SphereGeometry(1.1, 10, 6), c3Prop(i % 2 ? '#4f9a44' : '#3f8a3a', { rough: 0.8 }), 0.01); lf.scale.set(0.45, 1.8, 0.16); lf.position.set(Math.sin(a) * 1.1, 4.0 + (i % 3) * 0.7, Math.cos(a) * 1.1); lf.rotation.set(0.5 * Math.cos(a), a, -0.5 * Math.sin(a)); g.add(lf); } }
  // ---- FOCUS: the desk and what's on it, the held law book, the ZURICH pin
  const F = new THREE.Group(); scene.add(F); const [dx, dz] = OF_DESK;
  F.add(rb(15, 4.2, 5.4, oak, dx, 2.1, dz, 0.03)); F.add(rb(15.8, 0.4, 6.2, c3Prop('#5a3418', { rough: 0.4 }), dx, 4.4, dz, 0.02));
  for (let i = 0; i < 3; i++) F.add(rb(4.2, 1.0, 0.15, c3Prop('#6a3e1e'), dx - 4.6 + i * 4.6, 2.8, dz + 2.72, 0.008));
  { const g = new THREE.Group(); g.position.set(dx - 5.4, 4.6, dz - 1.4); F.add(g); g.add(cyl(0.45, 0.6, 0.25, brass, 0, 0.12, 0, 0.01, 12)); g.add(cyl(0.07, 0.07, 1.9, brass, 0, 1.05, 0, 0.005, 6));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.35, 1.1, 0.9, 16, 1, true), (() => { const m = c3Prop('#2f8a5a'); m.side = THREE.DoubleSide; return m; })(), 0.02); sh.position.y = 2.2; sh.userData.noCast = true; g.add(sh); }
  F.add(rb(3.4, 0.5, 2.4, c3Prop('#f6f1e4'), dx + 4.6, 4.85, dz + 0.4, 0.01)); F.add(rb(3.4, 0.3, 2.4, c3Prop('#ece4d0'), dx + 4.7, 5.25, dz + 0.3, 0.01));
  F.add(pl(3.2, 0.9, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#c9a040'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a4a14'; g.lineWidth = 14; g.strokeRect(8, 8, w - 16, h - 16); inked(g, 'ANIMAL OFFICE', w / 2, h / 2, h * 0.45, '#2a1608', { stroke: false }); }, 1024, 256) }), dx + 1.2, 5.05, dz + 2.0, 0, -0.45));
  s.paper = pl(2.6, 3.4, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(40,30,20,0.45)'; for (let k = 0; k < 9; k++) g.fillRect(w * 0.12, h * (0.12 + k * 0.07), w * (0.5 + 0.25 * (k % 2)), 6); }, 256, 340) }), dx + 0.6, 4.62, dz + 0.8, 0, -Math.PI / 2); F.add(s.paper);
  s.stamped = pl(2.0, 1.0, new THREE.MeshBasicMaterial({ map: texStamp('APPROVED', '#2f8a3a', 0.1), transparent: true, depthWrite: false, toneMapped: false }), dx + 0.6, 4.64, dz + 1.3, 0, -Math.PI / 2); s.stamped.rotation.order = 'YXZ'; s.stamped.rotation.set(-Math.PI / 2, 0, 0); F.add(s.stamped);
  s.stamp = new THREE.Group(); s.stamp.add(cyl(0.45, 0.5, 0.35, c3Prop('#2a2a30'), 0, 0.18, 0, 0.01, 12)); s.stamp.add(cyl(0.16, 0.2, 1.0, oak, 0, 0.85, 0, 0.01, 8)); const kn = c3Mesh(new THREE.SphereGeometry(0.34, 10, 8), c3Prop('#c8282a'), 0.01); kn.position.y = 1.5; s.stamp.add(kn); F.add(s.stamp);
  s.ord = canvasTex(480, 640); s.ordM = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 4.4), new THREE.MeshLambertMaterial({ map: s.ord.t })); s.ordM.rotation.set(-Math.PI / 2, 0, -0.08); s.ordM.position.set(dx - 2.0, 4.63, dz + 0.4); F.add(s.ordM); redraw(s.ord, 'o00', (g, w, h) => ofOrdDraw(g, w, h, false, 0));   // drawn at build (it was a black quad on the desk before s24)
  s.pen = new THREE.Group(); { const b = cyl(0.08, 0.08, 1.6, c3Prop('#c8282a', { rough: 0.3 }), 0, 0.8, 0, 0.006, 8); s.pen.add(b); } F.add(s.pen);
  for (let i = 0; i < 4; i++) F.add(rb(2.6, 0.22, 3.2, c3Prop(['#e8c23a', '#3a7ac8', '#c8402e', '#5aa04a'][i]), dx + 5.6, 4.72 + i * 0.24, dz - 1.2, 0.008));
  F.add(mug('#f2efe6', dx + 2.8, 4.6, dz - 1.8)); F.add(rb(1.6, 0.4, 1.0, c3Prop('#3f6a5a'), dx - 5.6, 4.8, dz - 1.4, 0.01));
  s.book = new THREE.Group(); s.book.add(c3Mesh(new THREE.BoxGeometry(2.4, 3.2, 0.6), [c3Prop('#f2ead4'), c3Prop('#a8282a'), c3Prop('#f2ead4'), c3Prop('#f2ead4'), c3Flat('#ffffff', { map: ofTexBook() }), c3Prop('#a8282a')], 0.025)); F.add(s.book);
  s.pin = new THREE.Group(); { const nd = cyl(0.05, 0.02, 1.0, steel, 0, 0, 0.5, 0.004, 6); nd.rotation.x = Math.PI / 2; s.pin.add(nd); } const ph = c3Mesh(new THREE.SphereGeometry(0.42, 14, 10), c3Prop('#e8282a', { rough: 0.25 }), 0.012); ph.position.z = 1.0; s.pin.add(ph); s.pin.position.set(OF_ZH[0], OF_ZH[1], 0.2); F.add(s.pin);
  c3Layer(F, C3.L_FOCUS);
  { const g = new THREE.Group(); g.position.set(-22, 0, 22); scene.add(g); g.add(rb(2.4, 6, 2.4, c3Prop('#e8eef4'), 0, 3, 0, 0.02)); g.add(cyl(1.0, 1.0, 2.6, c3Prop('#8ac8f0', { rough: 0.1 }), 0, 7.3, 0, 0.01, 14)); }
  { const g = new THREE.Group(); g.position.set(14, 0, 4); scene.add(g); g.add(cyl(0.16, 0.16, 12, oak, 0, 6, 0, 0.01, 8)); g.add(rb(2.4, 5, 1.0, c3Prop('#4a5a6a'), 0.3, 8.6, 0.4, 0.02)); g.add(cyl(1.0, 1.0, 0.6, c3Prop('#3a3a40'), 0, 12.2, 0, 0.01, 14)); }
  scene.add(pl(3.4, 2.6, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#fbf3e0'; g.fillRect(0, 0, w, h); g.lineWidth = 16; g.strokeStyle = '#b8862e'; g.strokeRect(0, 0, w, h); inked(g, 'CERTIFICATE', w / 2, h * 0.3, h * 0.12, '#2a1a14', { stroke: false, font: 'Georgia, serif' }); g.fillStyle = '#d8282a'; g.beginPath(); g.arc(w * 0.75, h * 0.72, 22, 0, TAU); g.fill(); g.fillStyle = 'rgba(40,30,20,0.4)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.15, h * (0.5 + k * 0.1), w * 0.45, 5); }, 320, 240) }), 1.0, 15.6, 0.15));
  scene.add(cyl(0.8, 0.7, 1.6, c3Prop('#5a6470'), 6.8, 0.8, 12, 0.01, 12));
  toonPerson(s, 'official');
  s.no = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), new THREE.MeshBasicMaterial({ map: texStamp('NOT ALONE!', '#d8282a', -0.12), transparent: true, depthWrite: false, toneMapped: false })); s.no.position.set(OF_POSTER[0], 10.6, 0.25); s.no.renderOrder = 5; scene.add(s.no); c3Layer(s.no, C3.L_FOCUS);   // stamped ON the poster
  s.dust = dustCloud(scene, [-22, 2, 4, 44, 18, 36], 160, '#ffffff'); c3Layer(s.dust, C3.L_BG);
  haze(scene, '#3a4458', 0.006);
  c3Env(scene, { top: '#f0f4ff', mid: '#8aa0b0', bot: '#1a2028' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  return s;
}
const ofGet = () => OF.s ||= ofBuild();
SETS.office = ofGet;
function ofReset(s, t) { hideAll(s); [s.no, s.stamped, s.book, s.pen].forEach((m) => { m.visible = false; }); s.no.scale.setScalar(1); s.pin.visible = false; s.stamp.position.set(OF_DESK[0] + 3.2, 4.6, OF_DESK[1] - 0.2); }
const ofCam = (s, id, lt, p, l, fov = 40) => c3SetCam(s.cam, camMove([[0, p, l, fov], [9, p, l, fov]], lt, id));
const ofRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#20283a', bgBlur: 2.0, glow: 0.4, glowBlur: 12 }, o));
function ofMan(s, t, o = {}) { const [x, z] = o.at || OF_MAN; return pose(s, 'official', t, x, z, Object.assign({ facing: 0, expr: 'deadpan', hand: { L: 'desk', R: 'desk' } }, o)); }
// the big book held up in both hands, cover to the camera
function ofBookInHands(s) { const p = s.p.official, a = c3ToonHandWorld(p, 'L'), b = c3ToonHandWorld(p, 'R'), m = a.add(b).multiplyScalar(0.5), d = s.cam.position.clone().sub(m).setY(0).normalize();
  s.book.visible = true; s.book.position.copy(m).addScaledVector(d, 0.6); s.book.position.y -= 0.5; s.book.lookAt(s.cam.position.x, s.book.position.y, s.cam.position.z); }

// ---- s06: because Swiss law says — the official raises the ANIMAL WELFARE ACT; on "law" the cover
SHOT_FN.s06 = (t, u, lt) => { const s = ofGet(); ofReset(s, t); ofCam(s, 's06', lt, [1.5, 10, 40], [0, 8, 14], 40);
  ofMan(s, t, { expr: [[0, 'deadpan'], [8.0, 'determined']], hand: { L: [[0, 'desk'], [7.6, 'hold']], R: [[0, 'desk'], [7.6, 'hold']] }, gaze: [0, 0] });
  if (t >= 7.75) ofBookInHands(s); ofRender(s, { bgBlur: 6 }); };
SNAPS.s06 = [[7.50, ['p:official', [0, 4.4, 17, 15, 1, 6]], 0.78], [7.72, ['u:official'], 0.66]];
// ---- s07: social animals like guinea pigs need company — he points at the poster: 2 = OK, 1 = NO
SHOT_FN.s07 = (t, u, lt) => { const s = ofGet(); ofReset(s, t); ofCam(s, 's07', lt, [-4, 10.5, 44], [-4.5, 10, 6], 42);
  ofMan(s, t, { at: [-2.6, 9.2], facing: faceTo(s.cam, -2.6, 9.2, -20, 6), expr: [[0, 'talk'], [9.54, 'smug']], talk: t < 10.6 ? 0.7 : 0, hand: { L: 'hip', R: [[0, 'talk'], [8.84, 'point']] }, gaze: [-0.8, -0.2] });
  ofRender(s, { bgBlur: 3 }); };
SNAPS.s07 = [[8.50, ['p:official', [-9, 13.2, 0.2, 7.2, 10.1, 1]], 0.82], [9.54, [[-9, 13.2, 0.2, 7.2, 10.1, 1]], 0.82], [10.26, [[-9, 15.6, 0.2, 7.2, 4.2, 1]], 0.62]];
// ---- s24: Switzerland changed its animal laws in 2008 — TOP-DOWN on the ORDINANCE on the desk (Ricks: the info is a
// paper in the set): the camera turns slowly down the page; on "changed" the stamp comes down (NEW LAW), on "2008" a red
// pen circles the date (write-on)
function ofOrdDraw(g, w, h, st, circ) { g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8282a'; g.fillRect(w * 0.44, h * 0.03, w * 0.12, w * 0.12); g.fillStyle = '#ffffff'; g.fillRect(w * 0.485, h * 0.04, w * 0.03, w * 0.1); g.fillRect(w * 0.455, h * 0.04 + w * 0.035, w * 0.09, w * 0.03);
  inked(g, 'SWISS CONFEDERATION', w / 2, h * 0.17, h * 0.035, '#5a4a3a', { stroke: false }); inked(g, 'ANIMAL PROTECTION', w / 2, h * 0.23, h * 0.05, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 }); inked(g, 'ORDINANCE', w / 2, h * 0.29, h * 0.05, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 });
  g.fillStyle = 'rgba(40,30,20,0.35)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.1, h * (0.36 + k * 0.03), w * (0.6 + 0.2 * (k % 2)), 4);
  inked(g, 'Art. 13: social animals', w * 0.1, h * 0.5, h * 0.04, '#2a1a14', { stroke: false, align: 'left', weight: 700 }); inked(g, 'must NOT be kept alone.', w * 0.1, h * 0.555, h * 0.04, '#2a1a14', { stroke: false, align: 'left', weight: 700 });
  g.fillStyle = 'rgba(40,30,20,0.35)'; for (let k = 0; k < 2; k++) g.fillRect(w * 0.1, h * (0.61 + k * 0.03), w * 0.7, 4);
  inked(g, 'In force:', w * 0.1, h * 0.75, h * 0.04, '#2a1a14', { stroke: false, align: 'left' }); inked(g, '1 Sept. 2008', w * 0.62, h * 0.75, h * 0.05, '#2a1a14', { stroke: false, font: 'Georgia, serif', weight: 700 });
  if (st) { g.save(); g.translate(w * 0.5, h * 0.88); g.rotate(-0.12); g.strokeStyle = '#2f8a3a'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w * 0.3, -h * 0.05, w * 0.6, h * 0.1, 14); g.stroke(); inked(g, 'NEW LAW', 0, 4, h * 0.06, '#2f8a3a', { stroke: false, font: 'Impact, Arial Black, sans-serif' }); g.restore(); }
  if (circ > 0) { g.strokeStyle = '#d8282a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.ellipse(w * 0.62, h * 0.75, w * 0.26, h * 0.05, -0.05, -2.6, -2.6 + TAU * 1.08 * circ); g.stroke(); } }
SHOT_FN.s24 = (t, u, lt) => { const s = ofGet(); ofReset(s, t); const [dx, dz] = OF_DESK, cx = dx - 2.0, cz = dz + 0.4; ofCam(s, 's24', lt, [cx + 0.3, 13, cz + 1.2], [cx, 4.63, cz], 40);
  const circ = clamp((t - 37.84) / 0.45); redraw(s.ord, 'o' + (t >= 36.38 ? 1 : 0) + Math.round(circ * 20), (g, w, h) => ofOrdDraw(g, w, h, t >= 36.38, circ));
  const d = t - 36.38; s.stamp.position.set(cx + 0.1, 4.63 + (d > -0.14 && d < 0.45 ? (d < 0 ? 2.6 * (-d / 0.14) ** 2 : d < 0.12 ? 0 : 2.6 * ((d - 0.12) / 0.33) ** 1.5) : 9), cz + 1.6);
  if (circ > 0 && circ < 1.2 && t < 38.3) { const a = -2.6 + TAU * 1.08 * circ; s.pen.visible = true; s.pen.position.set(cx + 0.14 * 3.3 + Math.cos(a) * 0.26 * 3.3, 4.7, cz + 0.25 * 4.4 + Math.sin(a) * 0.05 * 4.4); s.pen.rotation.set(0.5, 0, -0.4); }
  ofRender(s, { bgBlur: 2 }); };
SNAPS.s24 = [[35.52, [[dxOf(-2.0), 4.63, OF_DESK[1] + 0.4 - 1.2, 3.3, 0.2, 2.0]], 0.95], [36.38, [[dxOf(-2.0), 4.63, OF_DESK[1] + 0.4 + 0.6, 3.3, 0.2, 2.6]], 0.95], [37.84, [[dxOf(-2.0) + 0.5, 4.63, OF_DESK[1] + 0.4 + 1.1, 2.4, 0.2, 1.3]], 0.95]];
CAMF.s24 = { push: 0.06, orbit: 0, crane: 0, roll: -6 };
// ---- s25: so that social animals can't be kept alone — the poster's lonely pig; NOT ALONE! stamp; he wags a finger
SHOT_FN.s25 = (t, u, lt) => { const s = ofGet(); ofReset(s, t); ofCam(s, 's25', lt, [-5, 10.5, 42], [-5.6, 10, 6], 42);
  const wag = Math.floor(t / 0.16) % 2;
  ofMan(s, t, { at: [-2.6, 9.2], facing: faceTo(s.cam, -2.6, 9.2, -6, 40), expr: [[0, 'skeptical'], [39.72, 'angry']], talk: 0.6, hand: { L: 'hip', R: t > 39.72 ? (wag ? { h: [0.3, -0.42], pole: [1, 0.5], hand: 'point' } : { h: [0.42, -0.36], pole: [1, 0.5], hand: 'point' }) : 'point' }, gaze: [0, 0] });
  s.no.visible = t >= 40.14; s.no.scale.setScalar(Math.max(0.01, 1 + 0.4 * (1 - clamp((t - 40.14) / 0.1)))); ofRender(s, { bgBlur: 3 }); };
SNAPS.s25 = [[38.42, ['p:official', [-9, 13.2, 0.2, 7.2, 10.1, 1]], 0.82], [39.72, [[-9, 10.4, 0.2, 7.2, 4.4, 1]], 0.7], [40.4, ['u:official', [-9, 10.6, 0.3, 5.6, 2.8, 1]], 0.78]];
// ---- s27: so a woman near Zurich — the wall map; the red pin drops on ZURICH
SHOT_FN.s27 = (t, u, lt) => { const s = ofGet(); ofReset(s, t); ofCam(s, 's27', lt, [10, 13.4, 30], [9.5, 13.4, 0], 40);
  const k = clamp((t - 44.62) / 0.16); s.pin.visible = t >= 44.62; s.pin.position.set(OF_ZH[0], OF_ZH[1], 0.2 + (1 - EZ.o3(k)) * 2.4);
  ofRender(s, { bgBlur: 2 }); };
SNAPS.s27 = [[43.76, [[9.5, 13.4, 0.2, 12, 8, 1]], 0.62], [44.62, [[OF_ZH[0], OF_ZH[1] + 0.4, 0.6, 3.6, 2.6, 1]], 0.5]];

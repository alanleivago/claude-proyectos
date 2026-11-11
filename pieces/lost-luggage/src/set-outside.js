// =====================================================================
//  SET outside — a sunny small Alabama town. A two-lane highway (x axis, z ~420) with the big green WELCOME TO ALABAMA
//  road sign, grass, pines, telephone poles; the little main street (along z, x -22..22) with brick shops + awnings,
//  parked cartoon cars, the SCOTTSBORO water tower; the parking lot and the big UNCLAIMED BAGGAGE store (front z -160,
//  x -140..140) and, on its right side wall (x 140), the LOADING DOCK with the curtain-side truck stacked with suitcases.
//  Registers s06, s07, s08. Prefix ou. Exposed: s.sign, s.truck, s.store (sign board), s.dolly, s.cash, s.tower.
// =====================================================================
const OU = {};
const OU_SUN = [0.52, 0.6, 0.6], OU_HOR = '#c6dcec';   // v5: milky horizon (ref 1 haze)   // v4: sun from front-right (+x +z) so the store front, the sign and the dock side take it
const OU_ROADZ = 420, OU_STOREZ = -160, OU_DOCKX = 140, OU_DOCKY = 6, OU_DOCKZ = -245;
function ouTexGrass() { const t = tex((g, w, h) => { g.fillStyle = '#3a7e28'; g.fillRect(0, 0, w, h); const R = RNG('ougr');
  for (let i = 0; i < 1400; i++) { g.fillStyle = R.f() < 0.55 ? 'rgba(24,80,18,0.5)' : 'rgba(120,180,60,0.35)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(2, 5), R.r(6, 14)); } }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(60, 60); return t; }
// asphalt with lane markings (v3: aggregate, sealed cracks, patches, oil, tyre-polished wheel paths, faded chipped paint);
// vert = the lines run along v (a road along z)
function ouTexRoad(vert, center = true) { const t = tex((g, w, h) => { const R = RNG('ourd', vert ? 1 : 0); ouAsphalt(g, w, h, R);
  if (vert) { g.translate(w, 0); g.rotate(Math.PI / 2); }
  const L = vert ? h : w, D = vert ? w : h;   // L along the road, D across
  for (const y of [0.2, 0.32, 0.68, 0.8]) { g.fillStyle = 'rgba(16,16,20,0.12)'; g.fillRect(0, D * y, L, D * 0.05); }
  const ln = (c, y, th) => { g.globalAlpha = 0.86; g.fillStyle = c; g.fillRect(0, y, L, th); g.globalAlpha = 1; ouChip(g, R, 0, y, L, th); };
  ln('#e6e4da', D * 0.05, D * 0.025); ln('#e6e4da', D * 0.925, D * 0.025); if (center) { ln('#e0b234', D * 0.475, D * 0.018); ln('#e0b234', D * 0.507, D * 0.018); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function ouTexWelcome() { return tex((g, w, h) => { g.fillStyle = '#1f7a46'; g.beginPath(); g.roundRect(0, 0, w, h, 40); g.fill(); g.lineWidth = 16; g.strokeStyle = '#ffffff'; g.beginPath(); g.roundRect(22, 22, w - 44, h - 44, 30); g.stroke();
  // the state of Alabama (white), a red star on Montgomery... Scottsboro dot up in the north-east corner
  const sx = w * 0.06, sy = h * 0.16, sw = w * 0.17, sh = h * 0.68, A = [[0.08, 0], [0.7, 0], [0.92, 0.72], [0.9, 0.8], [0.4, 0.82], [0.42, 0.92], [0.3, 1], [0.22, 0.9], [0.12, 0.96], [0.06, 0.6]];
  g.beginPath(); A.forEach(([x, y], i) => (i ? g.lineTo(sx + x * sw, sy + y * sh) : g.moveTo(sx + x * sw, sy + y * sh))); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#0e3a22'; g.stroke();
  g.fillStyle = '#d8282a'; g.beginPath(); g.arc(sx + 0.6 * sw, sy + 0.12 * sh, 14, 0, TAU); g.fill();
  inked(g, 'WELCOME TO', w * 0.6, h * 0.24, h * 0.13, '#ffffff', { stroke: false, maxW: w * 0.66 });
  inked(g, 'ALABAMA', w * 0.6, h * 0.5, h * 0.3, '#ffffff', { stroke: false, maxW: w * 0.68 });
  inked(g, 'Sweet Home Alabama', w * 0.6, h * 0.78, h * 0.11, '#ffe27a', { stroke: false, maxW: w * 0.66, font: 'Georgia, serif', weight: 700 }); }, 1600, 900); }
function ouTexStoreSign() { return tex((g, w, h) => { g.fillStyle = '#123a7a'; g.beginPath(); g.roundRect(0, 0, w, h, 50); g.fill(); g.lineWidth = 20; g.strokeStyle = '#f2c23a'; g.beginPath(); g.roundRect(18, 18, w - 36, h - 36, 38); g.stroke();
  // suitcase logo
  const cx = w * 0.12, cy = h * 0.54, sw = h * 0.62, shh = h * 0.46; g.fillStyle = '#f2c23a'; g.beginPath(); g.roundRect(cx - sw / 2, cy - shh / 2, sw, shh, 26); g.fill(); g.lineWidth = 12; g.strokeStyle = '#0a1f48'; g.stroke();
  g.beginPath(); g.roundRect(cx - sw * 0.18, cy - shh / 2 - h * 0.1, sw * 0.36, h * 0.12, 14); g.stroke(); g.fillStyle = '#0a1f48'; g.fillRect(cx - sw * 0.3, cy - shh / 2, 10, shh); g.fillRect(cx + sw * 0.3 - 10, cy - shh / 2, 10, shh);
  inked(g, 'UNCLAIMED', w * 0.6, h * 0.33, h * 0.3, '#ffffff', { stroke: '#0a1f48', sw: h * 0.03, maxW: w * 0.72 });
  inked(g, 'BAGGAGE', w * 0.6, h * 0.7, h * 0.3, '#f2c23a', { stroke: '#0a1f48', sw: h * 0.03, maxW: w * 0.72 }); }, 2048, 560); }
function ouTexStoreWall() { const t = tex((g, w, h) => { g.fillStyle = '#e8d6b0'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,90,50,0.25)'; g.lineWidth = 3;
  for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = (y / 32) % 2 ? 0 : 32; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 32); g.stroke(); } }
  g.fillStyle = '#1f4f9a'; g.fillRect(0, h * 0.06, w, h * 0.07); g.fillStyle = '#f2c23a'; g.fillRect(0, h * 0.13, w, h * 0.02); g.fillStyle = '#9a7a52'; g.fillRect(0, h * 0.94, w, h * 0.06); }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function ouTexWindow(words) { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, w * 0.4, h); gr.addColorStop(0, '#cfe6ff'); gr.addColorStop(0.6, '#7aa6d8'); gr.addColorStop(1, '#3a5a98'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // racks of clothes + suitcases seen through the glass
  const R = RNG('ouwin', words); for (let i = 0; i < 9; i++) { g.fillStyle = ['#e84a3a', '#f2c23a', '#3a9a5a', '#e8eef6', '#8a4aa8', '#2f6fb8'][i % 6]; g.globalAlpha = 0.55; g.fillRect(w * 0.06 + i * w * 0.1, h * R.r(0.45, 0.6), w * 0.07, h * 0.4); }
  g.globalAlpha = 1; g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.moveTo(w * 0.1, h); g.lineTo(w * 0.35, 0); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.2, h); g.fill();
  g.fillStyle = '#f2c23a'; g.beginPath(); g.roundRect(w * 0.18, h * 0.1, w * 0.64, h * 0.24, 20); g.fill(); inked(g, words, w / 2, h * 0.22, h * 0.13, '#123a7a', { stroke: false, maxW: w * 0.58 });
  g.lineWidth = 14; g.strokeStyle = '#2a2a30'; g.strokeRect(0, 0, w, h); }, 640, 400); }
function ouTexDoors() { return tex((g, w, h) => { g.fillStyle = '#2a2a30'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d8eeff'); gr.addColorStop(1, '#5a86c0');
  for (const x of [0.04, 0.52]) { g.fillStyle = gr; g.fillRect(w * x, h * 0.05, w * 0.44, h * 0.93); g.fillStyle = 'rgba(255,255,255,0.4)'; g.beginPath(); g.moveTo(w * (x + 0.05), h); g.lineTo(w * (x + 0.25), 0); g.lineTo(w * (x + 0.32), 0); g.lineTo(w * (x + 0.12), h); g.fill(); }
  g.fillStyle = '#f2c23a'; g.fillRect(w * 0.1, h * 0.46, w * 0.8, h * 0.06); inked(g, 'WELCOME', w / 2, h * 0.49, h * 0.045, '#123a7a', { stroke: false }); }, 512, 512); }
function ouTexDockDoor() { return tex((g, w, h) => { g.fillStyle = '#9aa4ae'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 22) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, y, w, 4); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, y + 5, w, 3); }
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f2c23a' : '#2a2a30'; g.save(); g.beginPath(); g.rect(0, 0, 26, h); g.rect(w - 26, 0, 26, h); g.clip(); g.translate(0, i * h / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(w, -w); g.lineTo(w, -w + h / 12); g.lineTo(0, h / 12); g.fill(); g.restore(); }
  g.fillStyle = '#123a7a'; g.fillRect(w * 0.3, h * 0.06, w * 0.4, h * 0.12); inked(g, 'DOCK 2', w / 2, h * 0.12, h * 0.07, '#ffffff', { stroke: false }); }, 512, 512); }
function ouTexTower() { const t = tex((g, w, h) => { g.fillStyle = '#e8eef4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4f9a'; g.fillRect(0, h * 0.06, w, h * 0.06); g.fillRect(0, h * 0.88, w, h * 0.06);
  for (const x of [0.25, 0.75]) inked(g, 'SCOTTSBORO', w * x, h * 0.5, h * 0.3, '#1f4f9a', { stroke: false, maxW: w * 0.42 }); }, 2048, 256); return t; }
function ouTexCurtain(c) { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x, 0, 6, h); } }, 128, 128); }

// ---- v3 detail (Ricks-like environment): textures with wear + a bake that merges static props into vertex-coloured meshes
// per material kind and per 100-unit ground chunk (keeps draw calls low and every chunk small enough to cast shadows)
function ouBake(root, o = {}) { root.updateMatrixWorld(true); const B = new Map(), v = new THREE.Vector3();
  const keep = [];
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    if (mt.transparent || mt.isShaderMaterial) { keep.push(m); return; }
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    m.getWorldPosition(v); const ch = o.chunk === false ? '' : Math.floor(v.x / 100) + ',' + Math.floor(v.z / 100);
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '') + '|' + ch;
    if (!B.has(key)) B.set(key, { mt, em, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); B.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const m of keep) { const c = m.clone(); m.matrixWorld.decompose(c.position, c.quaternion, c.scale); out.add(c); }
  for (const { mt, em, L } of B.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.66 + 0.34 * clamp((y - (o.floor ?? 0)) / (o.aoH ?? 3));
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        C[k * 3] = c.r * ao; C[k * 3 + 1] = c.g * ao; C[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast) mesh.userData.noCast = true; out.add(mesh); }
  return out; }
const ouAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const ouRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
// asphalt grime shared by the road / lot / dock textures: aggregate, mottling, sealed cracks, patches, oil drips
function ouAsphalt(g, w, h, R, base = '#35373d') { g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 50; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(30, 140), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.6 ? 'rgba(10,10,14,0.16)' : 'rgba(255,255,255,0.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 7000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.08)'; const z = R.r(1, 2.6); g.fillRect(R.r(0, w), R.r(0, h), z, z); }
  for (let i = 0; i < 3; i++) { const x = R.r(0, w * 0.8), y = R.r(0, h * 0.8), pw = R.r(40, 120), ph = R.r(30, 90); g.fillStyle = c3Shd(base, 0.78); g.fillRect(x, y, pw, ph); g.strokeStyle = 'rgba(20,20,22,0.6)'; g.lineWidth = 3; g.strokeRect(x, y, pw, ph);
    for (let k = 0; k < 300; k++) { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x + R.f() * pw, y + R.f() * ph, 2, 2); } }
  for (let i = 0; i < 9; i++) { let x = R.r(0, w), y = R.r(0, h); g.strokeStyle = 'rgba(14,14,18,0.75)'; g.lineWidth = R.r(2.5, 5); g.lineJoin = 'round'; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < R.i(5, 12); q++) { x += R.n(34); y += R.n(34); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(8,8,10,' + R.r(0.1, 0.25) + ')'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(6, 26), R.r(4, 14), R.f() * 3, 0, TAU); g.fill(); } }
// worn paint: chips of asphalt showing through a painted rect (call inside the same transform the line was drawn in)
function ouChip(g, R, x, y, w, h, base = 'rgba(68,70,76,0.9)') { const n = Math.ceil(w * h / 40); for (let i = 0; i < n; i++) { g.fillStyle = R.f() < 0.75 ? base : 'rgba(20,20,20,0.3)'; g.fillRect(x + R.f() * w, y + R.f() * h, R.r(1, 4), R.r(1, 3)); } }
// concrete (sidewalk / dock / curb): slabs with tooled joints, stains, gum, cracks
function ouTexConc(base, seed, joints = 2) { return tex((g, w, h) => { const R = RNG('ouconc', seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 90), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.6 ? 'rgba(40,36,30,0.14)' : 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 3500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let k = 0; k <= joints; k++) { const p = k * w / joints; g.fillStyle = 'rgba(30,28,24,0.45)'; g.fillRect(p - 2, 0, 4, h); g.fillRect(0, p - 2, w, 4); }
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(40,38,34,0.35)'; g.beginPath(); g.arc(R.r(0, w), R.r(0, h), R.r(1.5, 3.5), 0, TAU); g.fill(); }   // gum
  for (let i = 0; i < 3; i++) { let x = R.r(0, w), y = R.r(0, h); g.strokeStyle = 'rgba(30,28,24,0.55)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 6; q++) { x += R.n(30); y += R.n(30); g.lineTo(x, y); } g.stroke(); } }, 256, 256); }
// a store/shop wall in split-face block: rows of blocks, mortar, rain streaks under the cornice band, splash dirt at the foot
function ouTexBlock() { return tex((g, w, h) => { const R = RNG('oublock'), rows = 60, cols = 20, rh = h / rows, cw = w / cols; g.fillStyle = '#b8a888'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const x = (i + (j % 2) * 0.5) * cw, y = j * rh; g.fillStyle = c3Shd('#e0d0ac', R.r(0.88, 1.05)); g.fillRect(x + 1.5, y + 1.5, cw - 2, rh - 2);
    for (let k = 0; k < 4; k++) { g.fillStyle = 'rgba(80,60,40,0.12)'; g.fillRect(x + R.r(2, cw - 3), y + R.r(2, rh - 3), 2, 1.5); } }
  g.fillStyle = '#1f4f9a'; g.fillRect(0, h * 0.06, w, h * 0.07); g.fillStyle = '#e8b832'; g.fillRect(0, h * 0.13, w, h * 0.02); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, h * 0.15, w, 3);
  for (let i = 0; i < 26; i++) { const x = R.r(0, w), sw = R.r(3, 14), L = R.r(0.1, 0.45) * h, gr = g.createLinearGradient(0, h * 0.15, 0, h * 0.15 + L); gr.addColorStop(0, 'rgba(60,50,40,' + R.r(0.12, 0.3) + ')'); gr.addColorStop(1, 'rgba(60,50,40,0)'); g.fillStyle = gr; g.fillRect(x, h * 0.15, sw, L); }
  for (let i = 0; i < 5; i++) { const x = R.r(0, w), gr = g.createLinearGradient(0, h * 0.45, 0, h * 0.75); gr.addColorStop(0, 'rgba(120,70,30,0.2)'); gr.addColorStop(1, 'rgba(120,70,30,0)'); g.fillStyle = gr; g.fillRect(x, h * 0.45, 4, h * 0.3); }   // rust under fixings
  const gr = g.createLinearGradient(0, h * 0.82, 0, h * 0.94); gr.addColorStop(0, 'rgba(70,55,35,0)'); gr.addColorStop(1, 'rgba(70,55,35,0.35)'); g.fillStyle = gr; g.fillRect(0, h * 0.82, w, h * 0.12);
  g.fillStyle = '#8a6e4a'; g.fillRect(0, h * 0.94, w, h * 0.06); for (let i = 0; i < 200; i++) { g.fillStyle = 'rgba(40,30,20,0.3)'; g.fillRect(R.r(0, w), R.r(h * 0.94, h), 3, 2); } }, 512, 768); }
// brick with real mortar for the main-street shop fronts: soot, efflorescence, sills, a display window with goods and the
// street reflected in it, a recessed door, upper windows with blinds, a name band with a small sub-line, a kickplate
function ouTexShop(name, brick, band, seed) { return tex((g, w, h) => { const R = RNG('oushop', seed), sub = ['EST. 1952', 'SINCE 1961', 'FAMILY OWNED', 'EST. 1948', 'OPEN DAILY'][seed % 5];
  g.fillStyle = '#b8ac98'; g.fillRect(0, 0, w, h); const rows = 64, cols = 16, rh = h / rows, cw = w / cols;
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols; i++) { const x = (i + (j % 2) * 0.5) * cw, y = j * rh; g.fillStyle = c3Shd(brick, R.r(0.78, 1.1)); g.fillRect(x + 1.5, y + 1.5, cw - 3, rh - 3); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 1.5, y + 1.5, cw - 3, 1.5); }
  for (let i = 0; i < 18; i++) { const x = R.r(0, w), y = R.r(0, h * 0.4), r = R.r(20, 60), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(30,20,15,0.18)' : 'rgba(240,235,220,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  g.fillStyle = '#e4d8bc'; g.fillRect(0, 0, w, h * 0.045); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, h * 0.045, w, 3); g.fillStyle = '#e4d8bc'; g.fillRect(0, h * 0.42, w, h * 0.03);
  for (const x of [0.12, 0.42, 0.72]) { const X0 = w * x, Y0 = h * 0.1, WW = w * 0.16, HH = h * 0.22; g.fillStyle = '#e4d8bc'; g.fillRect(X0 - 6, Y0 - 8, WW + 12, 8); g.fillRect(X0 - 8, Y0 + HH, WW + 16, 9);
    const gr = g.createLinearGradient(X0, Y0, X0 + WW * 0.6, Y0 + HH); gr.addColorStop(0, '#a8c4e0'); gr.addColorStop(1, '#3a4a68'); g.fillStyle = gr; g.fillRect(X0, Y0, WW, HH);
    if (R.f() < 0.6) { g.fillStyle = R.f() < 0.5 ? '#efe6cc' : '#d8c8a0'; g.fillRect(X0, Y0, WW, HH * R.r(0.3, 0.7)); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = Y0; y < Y0 + HH * 0.7; y += 5) g.fillRect(X0, y, WW, 1); }
    g.fillStyle = '#efe6d0'; g.fillRect(X0 + WW / 2 - 3, Y0, 6, HH); g.fillRect(X0, Y0 + HH / 2 - 3, WW, 6); g.fillStyle = 'rgba(60,50,40,0.25)'; g.fillRect(X0 - 4, Y0 + HH + 9, WW + 8, 30); }
  g.fillStyle = band; g.fillRect(w * 0.04, h * 0.465, w * 0.92, h * 0.12); g.lineWidth = 6; g.strokeStyle = '#2a1a14'; g.strokeRect(w * 0.04, h * 0.465, w * 0.92, h * 0.12);
  inked(g, name, w / 2, h * 0.512, h * 0.064, '#fff6e0', { stroke: '#2a1a14', sw: 5, maxW: w * 0.8 }); inked(g, sub, w / 2, h * 0.562, h * 0.024, '#fff6e0', { stroke: false, maxW: w * 0.5 });
  g.fillStyle = 'rgba(255,255,255,0.1)'; g.fillRect(w * 0.04, h * 0.465, w * 0.92, h * 0.02);
  // display window: dark interior, shelves of goods, a street reflection + sheen, a kickplate
  g.fillStyle = '#2a1a14'; g.fillRect(w * 0.05, h * 0.61, w * 0.6, h * 0.36); const X0 = w * 0.07, Y0 = h * 0.63, WW = w * 0.56, HH = h * 0.26;
  const gi = g.createLinearGradient(0, Y0, 0, Y0 + HH); gi.addColorStop(0, '#3a4048'); gi.addColorStop(1, '#5a5048'); g.fillStyle = gi; g.fillRect(X0, Y0, WW, HH);
  for (let s2 = 0; s2 < 2; s2++) { const y = Y0 + HH * (0.42 + s2 * 0.4); g.fillStyle = '#8a7a64'; g.fillRect(X0, y, WW, 4); let x = X0 + 6; while (x < X0 + WW - 14) { const bw = R.r(10, 26), bh = R.r(14, 34); g.fillStyle = ['#e84a3a', '#f2c23a', '#3a9a5a', '#e8eef6', '#8a4aa8', '#2f6fb8', '#d88a4a'][R.i(0, 6)]; g.fillRect(x, y - bh, bw, bh); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + bw - 3, y - bh, 3, bh); x += bw + R.r(2, 8); } }
  const gr = g.createLinearGradient(0, Y0, 0, Y0 + HH); gr.addColorStop(0, 'rgba(200,225,255,0.5)'); gr.addColorStop(0.45, 'rgba(160,190,230,0.12)'); gr.addColorStop(1, 'rgba(255,255,255,0.05)'); g.fillStyle = gr; g.fillRect(X0, Y0, WW, HH);
  g.fillStyle = 'rgba(40,40,46,0.35)'; for (let i = 0; i < 6; i++) { const bx = X0 + R.r(0, WW - 30); g.fillRect(bx, Y0 + HH * R.r(0.05, 0.25), R.r(16, 40), HH * 0.2); }   // reflected buildings across the street
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(X0 + WW * 0.1, Y0 + HH); g.lineTo(X0 + WW * 0.32, Y0); g.lineTo(X0 + WW * 0.4, Y0); g.lineTo(X0 + WW * 0.18, Y0 + HH); g.fill();
  if (R.f() < 0.7) { g.fillStyle = 'rgba(255,240,200,0.85)'; g.font = 'bold ' + Math.round(h * 0.022) + 'px Arial'; g.textAlign = 'center'; g.fillText('OPEN', X0 + WW * 0.82, Y0 + HH * 0.18); }
  g.fillStyle = c3Shd(band, 0.7); g.fillRect(w * 0.05, h * 0.9, w * 0.6, h * 0.07); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(w * 0.05, h * 0.9, w * 0.6, 3);
  g.fillStyle = '#2a1a14'; g.fillRect(w * 0.7, h * 0.61, w * 0.24, h * 0.39); g.fillStyle = c3Shd(band, 0.75); g.fillRect(w * 0.72, h * 0.63, w * 0.2, h * 0.37);
  const gd = g.createLinearGradient(0, h * 0.66, 0, h * 0.82); gd.addColorStop(0, '#a8c4e0'); gd.addColorStop(1, '#3a4a68'); g.fillStyle = gd; g.fillRect(w * 0.75, h * 0.66, w * 0.14, h * 0.16); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(w * 0.77, h * 0.66, w * 0.025, h * 0.16);
  g.fillStyle = '#d8b040'; g.beginPath(); g.arc(w * 0.9, h * 0.85, 6, 0, TAU); g.fill(); g.fillStyle = 'rgba(30,25,20,0.4)'; g.fillRect(w * 0.72, h * 0.97, w * 0.2, h * 0.03);
  const gb = g.createLinearGradient(0, h * 0.88, 0, h); gb.addColorStop(0, 'rgba(50,40,30,0)'); gb.addColorStop(1, 'rgba(50,40,30,0.3)'); g.fillStyle = gb; g.fillRect(0, h * 0.88, w, h * 0.12); }, 768, 768); }
// striped awning canvas: weave, sun-faded top, soiling toward the hem, scalloped valance band
function ouTexAwning(c, seed) { return tex((g, w, h) => { const R = RNG('ouawn', seed); for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? '#f2ead6' : c; g.fillRect(k * w / 12, 0, w / 12 + 1, h); }
  for (let y = 0; y < h; y += 2) { g.fillStyle = 'rgba(0,0,0,0.05)'; g.fillRect(0, y, w, 1); } for (let x = 0; x < w; x += 2) { g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(x, 0, 1, h); }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,240,0.18)'); gr.addColorStop(0.7, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(50,40,30,0.25)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(60,50,40,0.1)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(h * 0.5, h), R.r(6, 20), R.r(3, 8), 0, 0, TAU); g.fill(); } }, 256, 128); }
// leaf canopy texture (lumps of leaves, sun side lighter) for the street trees
function ouTexLeaf() { return tex((g, w, h) => { const R = RNG('ouleaf'); g.fillStyle = '#2e5a24'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1600; i++) { const c = ['#3a7a2e', '#4a8a34', '#2a5a22', '#5a9a3a', '#6aa844', '#24481c'][R.i(0, 5)]; g.fillStyle = c; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(2, 5), R.r(1.2, 3), R.f() * 3, 0, TAU); g.fill(); }
  for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(10,25,8,0.35)'; g.beginPath(); g.arc(R.r(0, w), R.r(0, h), R.r(2, 6), 0, TAU); g.fill(); } }, 256, 256); }
function ouTexBark() { return ouRep(tex((g, w, h) => { const R = RNG('oubark'); g.fillStyle = '#5a4030'; g.fillRect(0, 0, w, h); for (let i = 0; i < 90; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(20,12,8,0.45)' : 'rgba(150,120,90,0.25)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(10, 40)); } }, 64, 128), 1, 1); }
// diamond tread plate (dock leveler)
function ouTexTread() { return tex((g, w, h) => { const R = RNG('outread'); g.fillStyle = '#7a8088'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) { g.save(); g.translate(x, y); g.rotate((y / 16) % 2 ? 0.8 : -0.8); g.fillStyle = 'rgba(220,225,230,0.35)'; g.fillRect(-5, -1.5, 10, 3); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(-5, 1.5, 10, 1.5); g.restore(); }
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(120,70,30,' + R.r(0.08, 0.25) + ')'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(6, 30), R.r(4, 16), R.f() * 3, 0, TAU); g.fill(); }
  g.fillStyle = '#e2b434'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); }, 256, 256); }
// a deciduous street tree: bark trunk + lumpy leaf clusters (icosahedra, vertices jittered)
function ouTree(K, x, z, s = 1, seed = 1) { const R = RNG('outree', seed), M = OU.M; const g = ouAt(new THREE.Group(), x, 0, z, R.f() * TAU);
  g.add(cyl(0.7 * s, 1.0 * s, 13 * s, M.barkT, 0, 6.5 * s, 0, 0, 8)); for (const a of [0.6, 2.7, 4.6]) { const b = cyl(0.3 * s, 0.5 * s, 6 * s, M.barkT, Math.cos(a) * 1.4 * s, 13 * s, Math.sin(a) * 1.4 * s, 0, 6); b.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(b); }
  for (let i = 0; i < 6; i++) { const geo = new THREE.IcosahedronGeometry(R.r(4.2, 6) * s, 1), p = geo.attributes.position; for (let k = 0; k < p.count; k++) { const f = 1 + R.n(0.16); p.setXYZ(k, p.getX(k) * f, p.getY(k) * f, p.getZ(k) * f); } geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.leaf); const a = i / 6 * TAU; m.position.set(i ? Math.cos(a) * 4 * s : 0, (i ? R.r(15, 19) : 21) * s, i ? Math.sin(a) * 4 * s : 0); g.add(m); }
  K.add(g); return g; }
// street furniture
function ouHydrant(K, x, z) { const g = ouAt(new THREE.Group(), x, 1, z), m = c3Prop('#d8b020', { rough: 0.45 }); g.add(cyl(0.7, 0.8, 2.6, m, 0, 1.3, 0, 0, 12)); g.add(cyl(0.85, 0.85, 0.3, m, 0, 2.7, 0, 0, 12)); { const d = c3Mesh(new THREE.SphereGeometry(0.6, 10, 6, 0, TAU, 0, Math.PI / 2), m, 0); d.position.y = 2.8; g.add(d); }
  for (const a of [0, Math.PI]) { const n = cyl(0.3, 0.3, 0.8, m, Math.cos(a) * 0.9, 1.8, Math.sin(a) * 0.9, 0, 8); n.rotation.z = Math.PI / 2; g.add(n); } g.add(cyl(0.95, 0.95, 0.2, m, 0, 0.1, 0, 0, 12)); K.add(g); }
function ouCan(K, x, z) { const g = ouAt(new THREE.Group(), x, 1, z), m = c3Prop('#2a5a3a', { rough: 0.5 }); g.add(cyl(1.1, 1.0, 3.4, m, 0, 1.7, 0, 0, 14)); { const d = c3Mesh(new THREE.SphereGeometry(1.15, 14, 6, 0, TAU, 0, Math.PI / 2), m, 0); d.position.y = 3.4; g.add(d); } for (let y = 0.6; y < 3.2; y += 0.9) g.add(cyl(1.13, 1.13, 0.12, c3Prop('#1e4a2e'), 0, y, 0, 0, 14)); K.add(g); }
function ouNews(K, x, z, ry, c) { const g = ouAt(new THREE.Group(), x, 1, z, ry), m = c3Prop(c, { rough: 0.4 }); g.add(rb(2.2, 3.4, 2, m, 0, 2.4, 0, 0)); g.add(rb(1.8, 1.4, 0.1, c3Prop('#a8c0d8', { rough: 0.1, env: 1.3 }), 0, 3.2, 1.02, 0)); for (const sx of [-0.8, 0.8]) g.add(rb(0.2, 0.8, 0.2, OU.M.dark, sx, 0.4, 0, 0)); K.add(g); }
function ouPlanter(K, x, z, seed) { const R = RNG('ouplant', seed), g = ouAt(new THREE.Group(), x, 1, z); g.add(cyl(1.6, 1.3, 2.2, c3Prop('#8a6a52', { rough: 0.85 }), 0, 1.1, 0, 0, 12)); g.add(cyl(1.5, 1.5, 0.1, c3Prop('#3a2a1a'), 0, 2.15, 0, 0, 12));
  for (let i = 0; i < 6; i++) { const b = c3Mesh(new THREE.IcosahedronGeometry(R.r(0.6, 0.9), 0), c3Prop(['#3a7a2e', '#4a8a34'][i % 2], { rough: 0.8 }), 0); b.position.set(R.n(0.9), 2.6 + R.r(0, 0.4), R.n(0.9)); g.add(b); }
  for (let i = 0; i < 5; i++) { const f = c3Mesh(new THREE.SphereGeometry(0.22, 6, 4), c3Prop(['#e84a6a', '#f2c23a', '#f6f0ea'][i % 3]), 0); f.position.set(R.n(1), 3.2, R.n(1)); g.add(f); } K.add(g); }
function ouHVAC(K, x, y, z, s = 1, seed = 1) { const g = ouAt(new THREE.Group(), x, y, z, (seed % 2) * Math.PI / 2), m = c3Prop('#b8bcc0', { metal: 0.35, rough: 0.45 });
  g.add(rb(9 * s, 4.5 * s, 6 * s, m, 0, 2.25 * s + 0.4, 0, 0)); g.add(rb(9.4 * s, 0.4, 6.4 * s, OU.M.dark, 0, 0.2, 0, 0)); g.add(cyl(1.8 * s, 1.8 * s, 0.4, OU.M.dark, 2 * s, 4.6 * s + 0.4, 0, 0, 16));
  for (let k = 0; k < 5; k++) g.add(rb(0.1, 3.4 * s, 0.15, OU.M.dark, -4.56 * s, 2.3 * s + 0.4, -2.4 * s + k * 1.2 * s, 0));
  const d = cyl(0.8 * s, 0.8 * s, 4 * s, m, 0, 0.8 * s, -3 * s - 2, 0, 10); d.rotation.x = Math.PI / 2; g.add(d); K.add(g); }
function ouPallet(K, x, y, z, ry = 0) { const g = ouAt(new THREE.Group(), x, y, z, ry), W0 = OU.M.palW; for (const sz of [-4, 0, 4]) g.add(rb(9, 0.8, 1.0, W0, 0, 0.4, sz, 0)); for (let i = 0; i < 7; i++) g.add(rb(1.1, 0.25, 9, W0, -4 + i * 1.33, 0.93, 0, 0)); K.add(g); return g; }
// ---- builders
function ouPine(h, seed) { const g = new THREE.Group(), R = RNG('oupine', seed), M = OU.M;
  g.add(cyl(0.9, 1.3, h * 0.3, M.bark, 0, h * 0.15, 0, 0.04, 8));
  for (let i = 0; i < 3; i++) { const r = h * (0.3 - i * 0.07), c = c3Mesh(new THREE.ConeGeometry(r, h * 0.42, 10), M.pine[(seed + i) % 3], 0.06); c.position.y = h * (0.36 + i * 0.2); c.rotation.y = R.f() * TAU; g.add(c); }
  return g; }
// v4: real cars (exterior.js c3Car: bevelled body, glass, rims, lights), sized to the people (~11.5 units = 1.8 m)
const OU_CARS = 5.6, OU_KINDS = ['sedan', 'hatch', 'suv', 'pickup', 'sedan', 'suv'];
let ouCarN = 0;
function ouCar(c, kind) { return c3Car({ color: c, kind: kind || OU_KINDS[ouCarN++ % OU_KINDS.length], scale: OU_CARS }); }
function ouCase(w, h, d, c) { const g = new THREE.Group(); g.add(rb(w, h, d, c3Prop(c, { rough: 0.35 }), 0, h / 2, 0, 0.04)); g.add(rb(w * 0.35, 0.5, 0.5, OU.M.dark, 0, h, 0, 0)); g.add(rb(0.4, h * 0.92, d + 0.08, c3Prop(t3Mul(c, 0.75)), -w * 0.22, h / 2, 0, 0)); return g; }
const OU_CASEC = ['#2f6fb8', '#e84a3a', '#f2c23a', '#3a9a5a', '#8a4aa8', '#e8762a', '#2a2a34', '#d84a8a', '#4ac0c8', '#a85a2a'];
// v4: a box truck along +x (rear at x = 0, cab at the +x end): rounded cab with a raked windshield, side windows, mirrors on
// arms, grille, bumper, head/indicator/tail lights, fuel tank, mud flaps, wheels with tyres + rims + hubs + lugs; a rounded
// box body whose +z side is open (curtain pulled to the front) so the stacked suitcases show
function ouTruck() { const g = new THREE.Group(), M = OU.M, R = RNG('outruck');
  const red = c3Prop('#c22e28', { rough: 0.24, metal: 0.3, env: 1.5 }), white = c3Prop('#efede6', { rough: 0.38, env: 1.1 }), trim = c3Prop('#1f4f9a', { rough: 0.35, metal: 0.2 });
  const glass = c3Prop('#1c2a3a', { rough: 0.05, metal: 0.6, env: 2.2 }), chrome = c3Prop('#d8dce2', { rough: 0.12, metal: 0.95, env: 2 }), black = c3Prop('#1e1f24', { rough: 0.7 });
  const head = c3Prop('#fffbe8', { emissive: '#fff4d0', ei: 0.7, rough: 0.1 }), tail = c3Prop('#c8202a', { emissive: '#a01018', ei: 0.5, rough: 0.2 }), amber = c3Prop('#f2a020', { emissive: '#d88010', ei: 0.4, rough: 0.2 });
  const rbx = (w, h, d, r, m, x, y, z) => { const o = new THREE.Mesh(c3RBox(w, h, d, r, 3), m); o.position.set(x, y, z); g.add(o); return o; };
  rbx(56, 1.8, 9, 0.4, M.dark, 29, 5.2, 0);   // chassis rails
  const b0 = g.children.length;   // box body (raised 1.6 above the rear wheels at the end): floor, roof, front wall, far wall, corner posts, rub rails (+z side open)
  rbx(40, 1.2, 16.2, 0.4, M.steelD, 20.2, 6.8, 0); rbx(40.6, 1.6, 16.6, 0.7, white, 20.2, 25.4, 0);
  rbx(1.4, 19.4, 16.6, 0.5, white, 39.8, 16.2, 0); rbx(40.6, 19.4, 0.9, 0.4, white, 20.2, 16.2, -7.85);
  for (const x of [0.5, 13.5, 26.5]) rbx(0.9, 17.4, 0.9, 0.3, M.steelD, x, 16.2, 7.7);
  rbx(40.6, 1.0, 1.1, 0.35, trim, 20.2, 7.6, 8.0); rbx(40.6, 0.8, 1.0, 0.3, trim, 20.2, 24.4, 8.0); rbx(40.6, 1.0, 1.0, 0.35, trim, 20.2, 11.5, -8.3);
  for (const z of [-7.6, 7.6]) rbx(0.8, 19.4, 0.8, 0.3, M.steelD, 0.3, 16.2, z);
  { const cu = rb(3.4, 17.2, 2.0, c3Prop('#ffffff', { map: ouTexCurtain('#1f4f9a'), rough: 0.8 }), 37.0, 16.2, 7.4, 0); g.add(cu); }
  // the load: suitcases stacked three high, a few toppling on top (all inside the box)
  let k = 0; for (let row = 0; row < 3; row++) { let x = 1.8; while (x < 33) { const w = R.r(4.5, 6.5), h = R.r(4.4, 5.4), c = OU_CASEC[k++ % OU_CASEC.length], cs = ouCase(w, h, R.r(9, 12.5), c);
      cs.position.set(x + w / 2, 7.4 + row * 5.6, R.r(-0.5, 1.2)); cs.rotation.y = R.n(0.05); g.add(cs); x += w + 0.3; } }
  for (const [x, c, r] of [[6, 1, 0.2], [19, 4, -0.15]]) { const cs = ouCase(6, 3.6, 9, OU_CASEC[c]); cs.position.set(x, 24.2 - 3.7, 0); cs.rotation.set(0, r, 0); g.add(cs); }
  for (let i = b0; i < g.children.length; i++) g.children[i].position.y += 1.6;
  // rear lights + reflector strip under the box
  for (const z of [-6.8, 6.8]) { rbx(0.4, 1.4, 2.2, 0.15, tail, -0.1, 8.6, z); rbx(0.4, 0.8, 1.2, 0.12, amber, -0.1, 10.4, z); }
  rbx(1.0, 1.6, 15, 0.3, M.dark, 0.6, 4.6, 0);
  // cab
  rbx(14.5, 9.4, 15.8, 2.0, red, 49.6, 12.4, 0);                 // lower body (hood/doors)
  { const up = rbx(11.6, 8.6, 15.2, 2.6, red, 47.6, 18.4, 0); }   // cabin
  { const ws = rbx(0.6, 6.4, 13.4, 0.3, glass, 53.4, 18.6, 0); ws.rotation.z = 0.16; }
  for (const z of [-7.62, 7.62]) { rbx(7.8, 5.0, 0.3, 0.6, glass, 48.6, 18.8, z); rbx(0.25, 8.4, 0.2, 0.05, M.dark, 44.6, 14.8, z * 1.025); rbx(0.25, 8.4, 0.2, 0.05, M.dark, 52.6, 14.8, z * 1.025); rbx(1.6, 0.4, 0.4, 0.15, chrome, 50.6, 15.4, z * 1.04);
    // mirror on an arm
    const arm = rb(0.3, 0.3, 2.2, chrome, 53.6, 19.2, z + Math.sign(z) * 1.1, 0); g.add(arm); rbx(0.8, 3.2, 1.6, 0.3, black, 53.8, 18.6, z + Math.sign(z) * 2.4); rbx(0.1, 2.8, 1.3, 0.05, glass, 53.35, 18.6, z + Math.sign(z) * 2.4); }
  rbx(0.8, 4.6, 10, 0.4, M.grille, 56.9, 12.6, 0); for (let i = 0; i < 4; i++) rbx(0.3, 0.25, 9.6, 0.1, chrome, 57.25, 11.0 + i * 1.1, 0);
  rbx(1.8, 2.2, 16.2, 0.6, chrome, 57.2, 7.4, 0);
  for (const z of [-6.0, 6.0]) { rbx(0.5, 1.8, 2.6, 0.3, head, 57.0, 12.8, z); rbx(0.5, 0.8, 1.2, 0.2, amber, 56.9, 10.8, z); }
  rbx(9, 0.5, 15.6, 0.2, black, 47.6, 22.95, 0);   // roof cap
  g.add(cyl(0.55, 0.55, 15, chrome, 43.3, 22, -6.4, 0, 10));   // exhaust stack
  { const ft = cyl(1.8, 1.8, 7, chrome, 36.5, 4.6, 6.2, 0, 16); ft.rotation.z = Math.PI / 2; g.add(ft); rbx(0.6, 2.6, 2.6, 0.2, M.steelD, 39.4, 6.2, 6.6); }
  for (const z of [-7.4, 7.4]) for (const x of [4.2, 18.8, 45.6]) rbx(0.25, 3.0, 2.6, 0.1, black, x, 3.2, z);   // mud flaps
  { const fm = c3Prop('#1e1f24', { rough: 0.7 }); fm.side = THREE.DoubleSide; for (const z of [-7.3, 7.3]) { const fd = new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, 3.0, 20, 1, true, Math.PI / 2, Math.PI), fm); fd.rotation.x = Math.PI / 2; fd.position.set(50, 3.8, z); g.add(fd); } }
  { g.userData.wheels = []; const tyre = c3Prop('#1a1a1e', { rough: 0.85 }), rim = c3Prop('#b8bcc4', { rough: 0.25, metal: 0.9, env: 1.6 });
    for (const x of [8, 15, 50]) for (const z of [-7.0, 7.0]) { const w = new THREE.Group(); w.position.set(x, 3.6, z); const sz = Math.sign(z);
      const t = cyl(3.6, 3.6, 2.6, tyre, 0, 0, 0, 0, 22); t.rotation.x = Math.PI / 2; w.add(t);
      const r = cyl(2.2, 2.2, 0.3, rim, 0, 0, sz * 1.25, 0, 18); r.rotation.x = Math.PI / 2; w.add(r);
      const hb = cyl(0.8, 0.8, 0.5, chrome, 0, 0, sz * 1.4, 0, 10); hb.rotation.x = Math.PI / 2; w.add(hb);
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = cyl(0.22, 0.22, 0.3, M.dark, Math.cos(a) * 1.4, Math.sin(a) * 1.4, sz * 1.42, 0, 6); l.rotation.x = Math.PI / 2; w.add(l); }
      g.add(w); g.userData.wheels.push(w); } }
  g.traverse((m) => { if (m.isMesh) m.userData.inkOcc = true; });
  return g; }
// a two-wheel hand truck carrying three suitcases; origin = the wheel axle on the ground, the rails lean back along -x
// (handle up at local (0, OU_DOLLY_L, 0) before tilting: g.rotation.z tilts it)
const OU_DOLLY_L = 8.6;
function ouDolly() { const g = new THREE.Group(), M = OU.M, fr = new THREE.Group(); g.add(fr); fr.position.y = 1.6;
  for (const z of [-1.4, 1.4]) fr.add(cyl(0.22, 0.22, OU_DOLLY_L, M.redM, 0, OU_DOLLY_L / 2, z, 0.02, 8));
  for (const y of [2.5, 4.8, 7.1]) { const b = cyl(0.16, 0.16, 2.8, M.redM, 0, y, 0, 0.01, 6); b.rotation.x = Math.PI / 2; fr.add(b); }
  { const hnd = cyl(0.3, 0.3, 3.6, M.dark, 0, OU_DOLLY_L, 0, 0.02, 8); hnd.rotation.x = Math.PI / 2; fr.add(hnd); }
  fr.add(rb(2.6, 0.3, 3.4, M.steelD, -1.2, 0.1, 0, 0.02));   // nose plate
  for (const z of [-2.0, 2.0]) { const w = cyl(1.6, 1.6, 0.8, M.tire, 0, 1.6, z, 0.03, 14); w.rotation.x = Math.PI / 2; g.add(w); }
  for (const [y, c, w] of [[0.3, 0, 4.4], [2.6, 2, 3.8], [4.7, 4, 3.4]]) { const cs = ouCase(2.3, w * 0.55, w, OU_CASEC[c]); cs.rotation.set(Math.PI / 2, Math.PI / 2, 0); cs.position.set(-1.35, y + w * 0.5 + 0.1, 0); fr.add(cs); }
  g.userData.fr = fr; return g; }
function ouBills() { const g = new THREE.Group(), m = c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#8ac87a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2f6a3a'; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#d8f0c8'; x.beginPath(); x.ellipse(w / 2, h / 2, h * 0.3, h * 0.36, 0, 0, TAU); x.fill(); inked(x, '$100', w / 2, h / 2 + 2, h * 0.32, '#2f6a3a', { stroke: false }); }, 256, 128), rough: 0.8 });
  m.side = THREE.DoubleSide;
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3), m); b.position.set(-0.9 + i * 0.08, 0.15 * i, 0.02 * i); b.rotation.z = -0.35 + i * 0.22; g.add(b); }
  return g; }
function ouPole(x, z, ry = 0) { const g = new THREE.Group(), M = OU.M; g.position.set(x, 0, z); g.rotation.y = ry; g.add(cyl(0.7, 0.9, 52, M.wood, 0, 26, 0, 0.04, 8)); g.add(rb(16, 0.9, 0.9, M.wood, 0, 46, 0, 0.03));
  for (const px of [-6.5, -2.5, 2.5, 6.5]) g.add(cyl(0.35, 0.35, 1.2, M.insul, px, 47, 0, 0.01, 6)); return g; }
function ouWire(a, b, y, r = 0.12, mat) { const d = Math.hypot(b[0] - a[0], b[1] - a[1]), c = cyl(r, r, d, mat || OU.M.wire, (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2, 0, 4); c.rotation.set(0, -Math.atan2(b[1] - a[1], b[0] - a[0]), Math.PI / 2); c.userData.noCast = true; return c; }

function ouBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(42, W / H, 0.5, 5000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#7a90e0', ambI: 0.16, sky: '#6e9ae8', ground: '#a08850', key: '#ffdcaa', keyI: 2.5, keyP: [OU_SUN[0] * 300, OU_SUN[1] * 300, OU_SUN[2] * 300], rim: '#ffd0a0', rimI: 0.2, rimP: [-200, 120, -200] });   // v5: warm sun, blue sky fill   // v4: warm sun key, low fill
  OU.M = { bark: c3Prop('#7a4a2a', { rough: 0.9 }), pine: ['#2f7a3a', '#3a8a40', '#276a34'].map((c) => c3Prop(c, { rough: 0.8 })), glass: c3Prop('#5a86c0', { rough: 0.1, env: 1.4 }), tire: c3Prop('#26262c', { rough: 0.7 }),
    chrome: c3Prop('#e0e4ea', { metal: 0.7, rough: 0.25 }), lamp: c3Prop('#fff6d0', { emissive: '#fff0c0', ei: 0.6 }), dark: c3Prop('#2a2a30', { rough: 0.5 }), steelD: c3Prop('#6a727c', { metal: 0.4, rough: 0.4 }),
    grille: c3Prop('#3a3a42', { metal: 0.5, rough: 0.4 }), wood: c3Prop('#6a4a30', { rough: 0.9 }), insul: c3Prop('#8ac8a0', { rough: 0.3 }), wire: c3Prop('#2a2a30'), redM: c3Prop('#d8342a', { rough: 0.35 }),
    conc: c3Prop('#a8a498', { rough: 0.9 }), yellow: c3Prop('#f2c23a', { rough: 0.5 }), barkT: c3Prop('#ffffff', { map: ouTexBark(), rough: 0.9 }), leaf: c3Prop('#ffffff', { map: ouRep(ouTexLeaf(), 1, 1), rough: 0.85 }),
    palW: c3Prop('#a8845a', { rough: 0.9 }), rubber: c3Prop('#1c1c20', { rough: 0.92 }), galv: c3Prop('#9aa2a8', { metal: 0.55, rough: 0.45 }) };
  const K = new THREE.Group();   // v3: static detail, baked at the end (ouBake)
  const M = OU.M;
  c3SkyDome(scene, { paint: true, zenith: '#78a6dc', mid: '#a8cbee', midH: 0.3,   // v6: a softer zenith (low-angle shots looked electric)
    horizon: OU_HOR, glow: '#fff0d4', glowK: 0.3, ground: '#9aaa7a', sun: OU_SUN, clouds: 44, cloudScale: 1.1, seed: 5, cloudLit: '#ffffff', cloudShade: '#a4a8d6', layer: C3.L_BG });   // v5: cobalt -> milky, painted cumulus   // v4: blue gradient sky + soft clouds
  scene.fog = new THREE.Fog(OU_HOR, 600, 5200);   // v5: stronger aerial perspective   // v4: light blue haze, distance only
  // ground: grass, the highway, the main street, sidewalks, the parking lot
  scene.add(pl(5000, 5000, c3Prop('#ffffff', { map: ouTexGrass(), rough: 0.95 }), 0, 0, 0, 0, -Math.PI / 2));
  { const t = ouTexRoad(false); t.repeat.set(40, 1); scene.add(pl(2400, 50, c3Prop('#ffffff', { map: t, rough: 0.8 }), 0, 0.05, OU_ROADZ, 0, -Math.PI / 2)); }
  { const t = ouTexRoad(true); t.repeat.set(1, 8); scene.add(pl(44, 400, c3Prop('#ffffff', { map: t, rough: 0.8 }), 0, 0.06, 195, 0, -Math.PI / 2)); }
  for (const sx of [-1, 1]) { const sw = rb(12, 1.0, 400, M.conc, sx * 28, 0.5, 195, 0.02); sw.userData.noCast = true; scene.add(sw);
    { const sp = pl(11.2, 400, c3Prop('#ffffff', { map: ouRep(ouTexConc('#b4ae9e', 's' + sx), 1, 33), rough: 0.9 }), sx * 28.4, 1.02, 195, 0, -Math.PI / 2); sp.userData.noCast = true; scene.add(sp); }
    K.add(rb(0.9, 1.25, 400, c3Prop('#c8c2b2', { rough: 0.85 }), sx * 22.45, 0.62, 195, 0)); K.add(rb(1.6, 0.06, 400, c3Prop('#3a3a3e', { rough: 0.9 }), sx * 21.2, 0.08, 195, 0)); }   // curb + gutter grime
  { const t = tex((g, w, h) => { const R = RNG('oulot'); ouAsphalt(g, w, h, R, '#3a3c42'); const ln = (x, y, ww, hh, c) => { g.globalAlpha = 0.84; g.fillStyle = c; g.fillRect(x, y, ww, hh); g.globalAlpha = 1; ouChip(g, R, x, y, ww, hh, 'rgba(74,76,82,0.9)'); };
      for (let i = 0; i < 8; i++) { ln(i * w / 8, 0, 5, h * 0.42, '#e6e4da'); ln(i * w / 8, h * 0.58, 5, h * 0.42, '#e6e4da'); for (const y of [0.24, 0.76]) { g.fillStyle = 'rgba(8,8,10,0.22)'; g.beginPath(); g.ellipse((i + 0.5) * w / 8, h * y, w * 0.03, h * 0.07, 0, 0, TAU); g.fill(); } }
      ln(0, h * 0.495, w, 6, '#e0b234'); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 1); scene.add(pl(320, 120, c3Prop('#ffffff', { map: t, rough: 0.8 }), 0, 0.05, -100, 0, -Math.PI / 2)); }
  // ---- the store
  { const wall = c3Prop('#ffffff', { map: (() => { const t = ouTexStoreWall(); t.repeat.set(8, 1); return t; })(), rough: 0.85 });
    const b = rb(280, 60, 160, wall, 0, 30, OU_STOREZ - 80, 0.06); b.userData.noCast = true; scene.add(b);
    scene.add(rb(284, 3, 164, c3Prop('#1f4f9a'), 0, 61.2, OU_STOREZ - 80, 0.05));
    { const bt = ouTexBlock(), fm = (r) => c3Prop('#ffffff', { map: ouRep(bt.clone(), r, 1), rough: 0.88 }); bt.needsUpdate = true;
      const f1 = pl(280, 60, fm(7), 0, 30, OU_STOREZ + 0.08); f1.material.map.needsUpdate = true; f1.userData.noCast = true; scene.add(f1);
      const f2 = pl(160, 60, fm(4), OU_DOCKX + 0.08, 30, OU_STOREZ - 80, Math.PI / 2); f2.material.map.needsUpdate = true; f2.userData.noCast = true; scene.add(f2);
      const rt = tex((g, w, h) => { const R = RNG('ouroof'); g.fillStyle = '#9a9894'; g.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
        for (let y = 0; y < h; y += 42) { g.fillStyle = 'rgba(60,60,60,0.35)'; g.fillRect(0, y, w, 3); } for (let i = 0; i < 10; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(10, 50), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(40,40,30,0.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 256, 256);
      const rf = pl(276, 156, c3Prop('#ffffff', { map: ouRep(rt, 6, 3), rough: 0.95 }), 0, 62.74, OU_STOREZ - 80, 0, -Math.PI / 2); rf.userData.noCast = true; scene.add(rf);
      [[-95, -200], [-40, -265], [15, -210], [70, -280], [110, -215], [-110, -290]].forEach(([x, z], i) => ouHVAC(K, x, 62.7, z, 1.2, i));
      for (const [x, z] of [[-60, -240], [40, -240], [90, -300]]) { K.add(cyl(0.8, 0.8, 3, M.galv, x, 64.2, z, 0, 10)); K.add(cyl(1.3, 1.3, 0.5, M.galv, x, 65.8, z, 0, 10)); }
      for (const x of [-138, -84, 84, 138]) { K.add(cyl(0.7, 0.7, 58, c3Prop('#1f4f9a', { rough: 0.5 }), x, 29, OU_STOREZ + 0.9, 0, 8)); K.add(rb(2.2, 2, 1.8, c3Prop('#1f4f9a', { rough: 0.5 }), x, 58.4, OU_STOREZ + 0.9, 0)); K.add(rb(2.4, 0.5, 2.6, M.conc, x, 0.25, OU_STOREZ + 2, 0)); }
      for (const x of [-26, -16, 16, 26]) { K.add(cyl(0.8, 0.8, 4.2, M.yellow, x, 2.9, OU_STOREZ + 14, 0, 12)); K.add(c3Mesh(new THREE.SphereGeometry(0.8, 12, 6, 0, TAU, 0, Math.PI / 2), M.yellow, 0)); K.children[K.children.length - 1].position.set(x, 5.0, OU_STOREZ + 14); }
      { const g = ouAt(new THREE.Group(), 68, 0, -98); for (const sz of [-2.5, 2.5]) for (const y of [1.6, 3.4]) g.add(rb(14, 0.3, 0.3, M.galv, 0, y, sz, 0)); for (const x of [-7, 0, 7]) for (const sz of [-2.5, 2.5]) g.add(cyl(0.18, 0.18, 3.6, M.galv, x, 1.8, sz, 0, 6)); g.add(rb(0.3, 3.6, 5.3, M.galv, -7, 1.8, 0, 0));
        for (let k = 0; k < 3; k++) { const c = ouAt(new THREE.Group(), 4 - k * 2.2, 0, 0); c.add(rb(3.4, 2.4, 4, c3Prop('#c8282a', { rough: 0.5 }), 0, 2.4, 0, 0)); for (const [a, b] of [[-1.4, -1.6], [1.4, -1.6], [-1.4, 1.6], [1.4, 1.6]]) c.add(cyl(0.3, 0.3, 0.3, M.dark, a, 0.3, b, 0, 8)); g.add(c); } K.add(g); }
      [[-172, -70], [-176, -132], [172, -64], [-150, -30], [150, -28]].forEach(([x, z], i) => ouTree(K, x, z, 1.3, 20 + i)); }
    s.store = new THREE.Group(); scene.add(s.store);
    s.store.add(rb(168, 38, 2, c3Prop('#0a1f48', { rough: 0.4 }), 0, 44, OU_STOREZ + 0.6, 0.06));
    s.store.add(pl(162, 34, c3Flat('#ffffff', { map: ouTexStoreSign() }), 0, 44, OU_STOREZ + 1.7));
    scene.add(pl(40, 22, c3Flat('#ffffff', { map: ouTexDoors() }), 0, 11, OU_STOREZ + 0.3));
    scene.add(rb(46, 1.4, 1.6, M.dark, 0, 22.4, OU_STOREZ + 0.8, 0.03));
    for (const [x, wd] of [[-58, 'CLOTHING'], [58, 'ELECTRONICS'], [-110, 'JEWELRY'], [110, 'LUGGAGE']]) { scene.add(pl(42, 17, c3Flat('#ffffff', { map: ouTexWindow(wd) }), x, 12, OU_STOREZ + 0.3)); scene.add(rb(44, 1.2, 2.4, M.conc, x, 3.2, OU_STOREZ + 1.2, 0.02)); }
    scene.add(rb(72, 1.6, 16, c3Prop('#1f4f9a'), 0, 26, OU_STOREZ + 8, 0.05)); for (const x of [-34, 34]) scene.add(cyl(0.7, 0.7, 25, M.chrome, x, 12.8, OU_STOREZ + 15, 0.03, 10));
    scene.add(rb(80, 0.8, 22, M.conc, 0, 0.4, OU_STOREZ + 11, 0.02));
    // flagpoles (US + Alabama)
    for (const [x, kind] of [[-80, 0], [-92, 1]]) { scene.add(cyl(0.45, 0.6, 70, M.chrome, x, 35, OU_STOREZ + 22, 0.03, 10));
      const f = new THREE.Mesh(new THREE.PlaneGeometry(16, 10, 8, 1), (() => { const m = c3Prop('#ffffff', { map: tex((g, w, h) => { if (kind === 0) { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#ffffff' : '#c8282a'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#1f3a7a'; g.fillRect(0, 0, w * 0.42, h * 0.54); g.fillStyle = '#ffffff'; for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(w * (0.05 + i * 0.08), h * (0.08 + j * 0.13), 4, 0, TAU); g.fill(); } }
        else { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b8202a'; g.lineWidth = h * 0.16; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, h); g.moveTo(w, 0); g.lineTo(0, h); g.stroke(); } }, 256, 160), rough: 0.8 }); m.side = THREE.DoubleSide; return m; })());
      const P = f.geometry.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, Math.sin(P.getX(i) * 0.5) * 0.9); f.geometry.computeVertexNormals(); f.position.set(x + 8.2, 63, OU_STOREZ + 22); scene.add(f); }
    // light poles + parked cars in the lot
    for (const [x, z] of [[-80, -60], [80, -60], [-80, -130], [80, -130]]) { const l = c3Lamp(4.5); l.scale.setScalar(8); l.position.set(x, 0, z); K.add(l); }
    for (const [x, z, c] of [[-45, -128, '#e84a3a'], [-105, -78, '#4ac0c8'], [52, -128, '#f2c23a'], [100, -128, '#8a4aa8'], [36, -78, '#f0f0f0']]) { const car = ouCar(c); car.position.set(x, 0, z); car.rotation.y = Math.PI / 2; K.add(car); }
  }
  // ---- the loading dock on the right side wall (x 140)
  { const X = OU_DOCKX;
    { const t = tex((g, w, h) => { const R = RNG('oudocklot'); ouAsphalt(g, w, h, R, '#38393f'); const zz = (z) => (z - OU_DOCKZ + 100) / 200 * h, xx = (x) => (x - X - 30) / 130 * w;
        for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(6,6,8,' + R.r(0.1, 0.3) + ')'; g.beginPath(); g.ellipse(xx(R.r(176, 220)), zz(OU_DOCKZ + R.n(8)), R.r(4, 18), R.r(3, 10), R.f() * 3, 0, TAU); g.fill(); }   // drips under the truck bay
        for (const z of [OU_DOCKZ - 9, OU_DOCKZ + 9, OU_DOCKZ + 31, OU_DOCKZ + 49]) { g.globalAlpha = 0.8; g.fillStyle = '#e0b234'; g.fillRect(xx(171), zz(z) - 3, xx(240) - xx(171), 6); g.globalAlpha = 1; ouChip(g, R, xx(171), zz(z) - 3, xx(240) - xx(171), 6, 'rgba(70,72,78,0.9)'); }
        g.fillStyle = '#2a2a2e'; g.fillRect(xx(190) - 14, zz(OU_DOCKZ + 20) - 10, 28, 20); g.fillStyle = '#5a5a60'; for (let k = 0; k < 6; k++) g.fillRect(xx(190) - 12 + k * 4.6, zz(OU_DOCKZ + 20) - 8, 2, 16); }, 1024, 1024);
      scene.add(pl(130, 200, c3Prop('#ffffff', { map: t, rough: 0.8 }), X + 95, 0.05, OU_DOCKZ, 0, -Math.PI / 2)); }
    scene.add(rb(30, OU_DOCKY, 90, c3Prop('#b8b4a8', { rough: 0.9 }), X + 15, OU_DOCKY / 2, OU_DOCKZ, 0.05));
    scene.add(rb(0.8, 0.5, 90, M.yellow, X + 30.2, OU_DOCKY - 0.2, OU_DOCKZ, 0.01));
    { const dt = tex((g, w, h) => { const R = RNG('oudock'); g.fillStyle = '#6a665e'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
        for (let i = 0; i < 26; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 80), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(30,26,20,' + R.r(0.1, 0.25) + ')'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
        for (let i = 0; i < 10; i++) { const y = R.r(0, h); g.strokeStyle = 'rgba(20,20,20,' + R.r(0.08, 0.18) + ')'; g.lineWidth = R.r(6, 10); g.beginPath(); g.moveTo(w, y); g.bezierCurveTo(w * 0.6, y + R.n(60), w * 0.3, y + R.n(80), 0, y + R.n(120)); g.stroke(); }   // pallet-jack wheel tracks
        for (let k = 1; k < 3; k++) { g.fillStyle = 'rgba(30,28,24,0.5)'; g.fillRect(0, k * h / 3 - 2, w, 4); } g.fillStyle = 'rgba(40,36,30,0.4)'; g.fillRect(w - 26, 0, 26, h);
        for (let i = 0; i < 6; i++) { let x = R.r(0, w), y = R.r(0, h); g.strokeStyle = 'rgba(25,24,20,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 7; q++) { x += R.n(30); y += R.n(30); g.lineTo(x, y); } g.stroke(); } }, 512, 1024);
      const top = pl(30, 90, c3Prop('#ffffff', { map: dt, rough: 0.9 }), X + 15, OU_DOCKY + 0.03, OU_DOCKZ, 0, -Math.PI / 2); top.userData.noCast = true; scene.add(top);
      const fc = pl(90, OU_DOCKY, c3Prop('#ffffff', { map: ouRep(ouTexConc('#7a766c', 'face', 1), 6, 0.4), rough: 0.9 }), X + 30.03, OU_DOCKY / 2, OU_DOCKZ, Math.PI / 2); fc.userData.noCast = true; scene.add(fc);
      const lv = pl(10, 9, c3Prop('#ffffff', { map: ouTexTread(), metal: 0.5, rough: 0.5 }), X + 25, OU_DOCKY + 0.06, OU_DOCKZ - 5, 0, -Math.PI / 2); lv.userData.noCast = true; scene.add(lv);
      K.add(rb(0.5, 0.3, 90, M.galv, X + 29.9, OU_DOCKY + 0.05, OU_DOCKZ, 0)); }
    for (const z of [-24, -12, 12, 24]) { K.add(rb(0.3, 4.2, 3.6, M.steelD, X + 30.15, OU_DOCKY - 2.1, OU_DOCKZ + z, 0)); for (let k = 0; k < 5; k++) K.add(rb(1.1, 0.6, 3.0, M.rubber, X + 30.75, OU_DOCKY - 3.8 + k * 0.72, OU_DOCKZ + z, 0));   // laminated bumpers
      for (const [dy, dz] of [[-1.7, -1.4], [-1.7, 1.4], [1.6, -1.4], [1.6, 1.4]]) { const b = cyl(0.16, 0.16, 0.3, M.galv, X + 30.35, OU_DOCKY - 2.1 + dy, OU_DOCKZ + z + dz, 0, 6); b.rotation.z = Math.PI / 2; K.add(b); } }
    // dock seal pads round the door, bollards, wall-pack lights, conduit, a no-smoking sign, a stack of empty pallets
    for (const z of [-15.2, 15.2]) K.add(rb(3, 28, 2.4, M.rubber, X + 1.5, OU_DOCKY + 14, OU_DOCKZ + z, 0)); K.add(rb(3, 1.6, 32.8, M.rubber, X + 1.5, OU_DOCKY + 27.4, OU_DOCKZ, 0));
    for (const z of [-17.5, 17.5]) { K.add(cyl(0.6, 0.6, 5, M.yellow, X + 4.5, OU_DOCKY + 2.5, OU_DOCKZ + z, 0, 12)); K.add(cyl(0.62, 0.62, 0.5, M.dark, X + 4.5, OU_DOCKY + 3.6, OU_DOCKZ + z, 0, 12)); }
    for (const z of [-19, -27]) { K.add(rb(1.4, 1.2, 2.4, M.dark, X + 0.8, OU_DOCKY + 24, OU_DOCKZ + z, 0)); K.add(rb(0.1, 0.8, 1.8, c3Prop('#d8dce0', { rough: 0.2, env: 1.3 }), X + 1.52, OU_DOCKY + 23.9, OU_DOCKZ + z, 0)); }
    K.add(cyl(0.18, 0.18, 40, M.galv, X + 0.35, OU_DOCKY + 20, OU_DOCKZ - 19, 0, 6)); { const c = cyl(0.18, 0.18, 70, M.galv, X + 0.35, OU_DOCKY + 38, OU_DOCKZ + 10, 0, 6); c.rotation.x = Math.PI / 2; K.add(c); } K.add(rb(1.2, 1.6, 0.8, M.galv, X + 0.5, OU_DOCKY + 4, OU_DOCKZ - 19, 0));
    scene.add(pl(3, 1.5, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f4f0e4'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8282a'; g.fillRect(8, 8, w - 16, h * 0.5); g.lineWidth = 6; g.strokeStyle = '#2a2a30'; g.strokeRect(3, 3, w - 6, h - 6); inked(g, 'NO SMOKING', w / 2, 8 + h * 0.25, h * 0.26, '#ffffff', { stroke: false, maxW: w * 0.84 }); inked(g, 'within 25 ft of the dock', w / 2, h * 0.78, h * 0.14, '#2a2a30', { stroke: false, maxW: w * 0.86 }); g.fillStyle = 'rgba(255,248,225,0.15)'; g.fillRect(0, 0, w, h); }, 384, 192) }), X + 0.3, OU_DOCKY + 12, OU_DOCKZ + 18.5, Math.PI / 2));
    for (let k = 0; k < 5; k++) ouPallet(K, X + 6, OU_DOCKY + k * 1.06, OU_DOCKZ - 38, 0.05 * (k % 2));
    scene.add(pl(28, 28, c3Prop('#ffffff', { map: ouTexDockDoor(), rough: 0.6 }), X + 0.25, OU_DOCKY + 14, OU_DOCKZ, Math.PI / 2));
    scene.add(pl(22, 22, c3Prop('#ffffff', { map: ouTexDockDoor(), rough: 0.6 }), X + 0.25, OU_DOCKY + 11, OU_DOCKZ + 40, Math.PI / 2));
    scene.add(rb(4, 2, 30, c3Prop('#1f4f9a'), X + 2, OU_DOCKY + 30, OU_DOCKZ, 0.03));   // canopy
    { const lp = c3Mesh(new THREE.SphereGeometry(1.2, 12, 8), M.lamp, 0.02); lp.position.set(X + 3, OU_DOCKY + 31.5, OU_DOCKZ - 18); scene.add(lp); }
    // unloaded suitcases + a pallet on the dock
    ouPallet(K, X + 8, OU_DOCKY, OU_DOCKZ - 28);
    const R = RNG('oudock'); for (let i = 0; i < 7; i++) { const cs = ouCase(R.r(5, 6.4), R.r(3.6, 4.6), R.r(3.4, 4), OU_CASEC[(i * 3) % 10]); cs.position.set(X + 5 + (i % 2) * 5.5, OU_DOCKY + 1.2 + Math.floor(i / 2) * 4.3, OU_DOCKZ - 28 + R.n(1)); cs.rotation.y = R.n(0.15); scene.add(cs); }
    scene.add(pl(14, 9, c3Flat('#ffffff', { map: tex((g, w, h) => { g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, h); g.lineWidth = 12; g.strokeStyle = '#2a2a30'; g.strokeRect(6, 6, w - 12, h - 12); inked(g, 'RECEIVING', w / 2, h * 0.36, h * 0.2, '#2a2a30', { stroke: false }); inked(g, 'Lost bags in', w / 2, h * 0.68, h * 0.13, '#2a2a30', { stroke: false }); }, 512, 320) }), X + 0.3, OU_DOCKY + 22, OU_DOCKZ + 26, Math.PI / 2));
  }
  // ---- main street: brick shops with awnings both sides, parked cars, street lamps
  { const names = ['DINER', 'HARDWARE', 'BARBER', 'BAKERY', 'PHARMACY', 'BOOKS', 'ANTIQUES', 'CAFE', 'FLORIST', 'BANK'], bricks = ['#a8483a', '#b8603a', '#8a3a3a', '#c07048', '#9a5040'], bands = ['#1f4f9a', '#2f7a46', '#d8342a', '#e8762a', '#6a3a8a'];
    let i = 0; for (const sx of [-1, 1]) for (const z of [330, 270, 210, 150, 90]) { const hgt = [34, 30, 38, 32, 36][i % 5], gq = new THREE.Group(); gq.position.set(sx * 49, 0, z); gq.rotation.y = -sx * Math.PI / 2; scene.add(gq);
      gq.add(rb(48, hgt, 32, c3Prop('#ffffff', { map: c3TexWall('brick', bricks[i % 5], { rep: [4, 3] }), rough: 0.9 }), 0, hgt / 2, 0, 0.06));
      gq.add(pl(46, hgt - 1, c3Prop('#ffffff', { map: ouTexShop(names[i], bricks[i % 5], bands[i % 5], i), rough: 0.85 }), 0, (hgt - 1) / 2, 16.05));
      gq.add(rb(50, 2.2, 34, c3Prop('#e4d8bc'), 0, hgt + 1.1, 0, 0.05));
      if (z === 330) { const bw = new THREE.Mesh(new THREE.PlaneGeometry(32, hgt), c3Prop('#ffffff', { map: ouRep(c3TexWall('brick', bricks[i % 5]).clone(), 3, 3), rough: 0.9 })); bw.material.map.needsUpdate = true; bw.position.set(sx * 49, hgt / 2, z + 24.06); bw.userData.noCast = true; scene.add(bw);   // v3: the side wall seen from the highway (s06)
        K.add(rb(5, 9, 0.4, c3Prop('#5a3a2a', { rough: 0.7 }), sx * 49 - sx * 6, 4.5, z + 24.2, 0)); K.add(rb(6, 0.6, 1.2, c3Prop('#d8ccb0'), sx * 49 - sx * 6, 9.3, z + 24.5, 0)); K.add(rb(7, 4.5, 4, c3Prop('#b8bcc0', { metal: 0.35, rough: 0.45 }), sx * 49 + sx * 6, 2.25, z + 26.2, 0)); K.add(cyl(0.6, 0.6, hgt, c3Prop('#5a5a5e', { rough: 0.5 }), sx * 49 + sx * 14.5, hgt / 2, z + 24.6, 0, 8)); }
      { const rf = new THREE.Group(); rf.position.copy(gq.position); rf.rotation.copy(gq.rotation); K.add(rf); rf.add(rb(46, 0.12, 30, c3Prop('#6a6864', { rough: 0.95 }), 0, hgt + 2.26, 0, 0));
        rf.add(rb(7, 3.6, 5, c3Prop('#b8bcc0', { metal: 0.35, rough: 0.45 }), (i % 3 - 1) * 12, hgt + 4.1, -4 + (i % 2) * 6, 0)); rf.add(cyl(1.4, 1.4, 0.3, M.dark, (i % 3 - 1) * 12 + 1.5, hgt + 6.0, -4 + (i % 2) * 6, 0, 12));
        rf.add(cyl(0.4, 0.4, 3, M.galv, 14 - (i % 2) * 28, hgt + 3.5, 8, 0, 8)); rf.add(rb(46, 0.6, 0.8, c3Prop('#d8ccb0'), 0, hgt + 0.8, 16.3, 0)); rf.add(rb(38, 0.4, 1.0, c3Prop('#d8ccb0'), 0, (hgt - 1) * 0.68 - 0.25, 16.4, 0)); }
      { const am = c3Prop('#ffffff', { map: ouTexAwning(bands[(i + 1) % 5], i), rough: 0.9 }), aw = c3Mesh(new THREE.BoxGeometry(44, 0.4, 9), am, 0), ay = hgt * 0.38 + 1.5;
        aw.position.set(0, ay, 20.2); aw.rotation.x = 0.42; gq.add(aw); gq.add(pl(44, 1.5, am, 0, ay - 1.83 - 0.75, 24.32)); for (const x of [-21, 0, 21]) { const ar = cyl(0.08, 0.08, 5.2, M.dark, x, ay + 1.0, 18.0, 0, 4); ar.rotation.x = 1.0; gq.add(ar); } }
      i++; }
    const cc = ['#e84a3a', '#2f6fb8', '#f2c23a', '#3a9a5a', '#e8762a', '#4ac0c8'];
    [[-16, 300, 0], [16, 240, 1], [-16, 180, 2], [16, 120, 3], [-16, 60, 4], [16, 330, 5]].forEach(([x, z, c]) => { const car = ouCar(cc[c]); car.position.set(x, 0, z); car.rotation.y = x < 0 ? -Math.PI / 2 : Math.PI / 2; K.add(car); });
    for (const z of [360, 240, 120]) for (const sx of [-1, 1]) { const l = c3Lamp(4.5); l.scale.setScalar(6); l.position.set(sx * 30, 0, z); K.add(l); }
    for (const z of [300, 180]) ouTree(K, 26, z, 0.95, z);
    ouHydrant(K, 24, 262); ouHydrant(K, -24, 205); ouCan(K, -24.2, 274); ouCan(K, 24.2, 214); ouCan(K, -24.2, 150); ouNews(K, 25.6, 150, -Math.PI / 2, '#2f6fb8'); ouNews(K, 25.6, 153, -Math.PI / 2, '#d8342a');
    ouPlanter(K, -24.5, 330, 1); ouPlanter(K, 24.5, 285, 2); ouPlanter(K, -24.5, 95, 3); ouPlanter(K, 24.5, 95, 4);
    for (const z of [258, 222, 198, 138]) { K.add(cyl(0.16, 0.16, 4.4, M.galv, -23.6, 3.2, z, 0, 6)); K.add(rb(0.7, 1.1, 0.5, M.dark, -23.6, 5.6, z, 0)); }   // parking meters
    for (const z of [300, 180, 60]) { const b = new THREE.Group(); b.position.set(-31, 1, z); b.rotation.y = Math.PI / 2; K.add(b); b.add(rb(12, 0.8, 3.4, M.wood, 0, 3.6, 0, 0.03)); b.add(rb(12, 3, 0.6, M.wood, 0, 5.6, -1.6, 0.03)); for (const x of [-5, 5]) b.add(rb(0.6, 3.6, 3, M.dark, x, 1.8, 0, 0.02)); }
  }
  // ---- the water tower
  s.tower = new THREE.Group(); s.tower.position.set(-80, 0, -90); scene.add(s.tower);
  { const T = s.tower, st = c3Prop('#c8d0d8', { metal: 0.3, rough: 0.5 }); for (const [x, z] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) T.add(cyl(1.1, 1.1, 96, st, x * 0.9, 48, z * 0.9, 0.04, 8));
    for (const y of [30, 62]) for (const [a, b] of [[[-11, -11], [11, -11]], [[11, -11], [11, 11]], [[11, 11], [-11, 11]], [[-11, 11], [-11, -11]]]) T.add(ouWire(a, b, y, 0.5, st));
    const tank = c3Mesh(new THREE.CylinderGeometry(22, 22, 26, 40), [c3Prop('#ffffff', { map: ouTexTower(), rough: 0.5 }), c3Prop('#e8eef4'), c3Prop('#e8eef4')], 0.06); tank.position.y = 109; tank.rotation.y = 1.2; T.add(tank);
    const cone = c3Mesh(new THREE.ConeGeometry(23.5, 12, 40), c3Prop('#1f4f9a', { rough: 0.5 }), 0.06); cone.position.y = 128; T.add(cone);
    T.add(cyl(23.6, 23.6, 1.2, st, 0, 96, 0, 0.03, 40)); T.add(cyl(2, 2, 96, st, 0, 48, 0, 0.03, 10)); }
  // ---- the highway: the WELCOME sign, poles, pines, more grass detail
  s.sign = new THREE.Group(); s.sign.position.set(-16, 0, 462); s.sign.rotation.y = 0.18; scene.add(s.sign);
  { const S0 = s.sign; for (const x of [-15, 15]) S0.add(rb(1.6, 26, 1.6, M.steelD, x, 13, -0.6, 0.04));
    s.signPanel = new THREE.Group(); s.signPanel.position.y = 24; S0.add(s.signPanel);
    s.signPanel.add(rb(46, 26.4, 0.8, c3Prop('#d8dce2', { metal: 0.4, rough: 0.4 }), 0, 13, -0.5, 0.05));
    s.signPanel.add(pl(45, 25.3, c3Flat('#ffffff', { map: ouTexWelcome() }), 0, 13, 0.0)); }
  s.truck = ouTruck(); scene.add(s.truck);
  { const P = [-300, -170, -40, 90, 220, 350]; P.forEach((x) => K.add(ouPole(x, OU_ROADZ + 34))); for (let i = 0; i < P.length - 1; i++) for (const dx of [-6.5, 6.5]) K.add(ouWire([P[i] + dx, OU_ROADZ + 34], [P[i + 1] + dx, OU_ROADZ + 34], 47.6)); }
  { const Z = [370, 250, 130]; Z.forEach((z) => K.add(ouPole(-32, z, Math.PI / 2))); for (let i = 0; i < Z.length - 1; i++) for (const dz of [-6.5, 6.5]) K.add(ouWire([-32, Z[i] + dz], [-32, Z[i + 1] + dz], 47.6)); }
  { const R = RNG('oupines'); let k = 0;
    for (let i = 0; i < 26; i++) { const side = i % 2 ? 1 : -1, x = side * R.r(90, 420), z = R.r(-20, 520); if (Math.abs(x) < 80 && z > 0) continue; const p = ouPine(R.r(40, 70), k++); p.position.set(x, 0, z); K.add(p); }
    for (let i = 0; i < 14; i++) { const p = ouPine(R.r(45, 75), k++); p.position.set(R.r(-500, 500), 0, R.r(490, 640)); if (Math.hypot(p.position.x - 18, p.position.z - 560) < 90) continue; K.add(p); }
    for (let i = 0; i < 10; i++) { const p = ouPine(R.r(55, 85), k++); p.position.set(R.r(-400, 400), 0, R.r(-460, -380)); K.add(p); } }
  { const gt = tex((g, w, h) => { const R = RNG('ougrav'); g.fillStyle = '#8a8070'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = ['#6a6258', '#a89c88', '#5a5248', '#b8ae9a'][R.i(0, 3)]; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); } }, 128, 128);
    for (const z of [OU_ROADZ - 28, OU_ROADZ + 28]) { const m = pl(2400, 6, c3Prop('#ffffff', { map: ouRep(gt.clone(), 400, 1), rough: 0.95 }), 0, 0.04, z, 0, -Math.PI / 2); m.material.map.needsUpdate = true; m.userData.noCast = true; scene.add(m); }
    for (let x = -300; x <= 300; x += 50) { if (Math.abs(x + 16) < 30) continue; K.add(rb(0.5, 4, 0.5, c3Prop('#f2f0ea', { rough: 0.5 }), x, 2, OU_ROADZ + 31, 0)); K.add(rb(0.52, 0.8, 0.2, c3Prop('#e8a020', { emissive: '#e8a020', ei: 0.3 }), x, 3.4, OU_ROADZ + 31.3, 0)); }
    const R = RNG('outuft'), tm = ['#4a8a30', '#6aa83a', '#3a7a2a', '#7ab84a'].map((c) => c3Prop(c, { rough: 0.85 }));
    for (let i = 0; i < 90; i++) { const x = R.r(-50, 60), z = R.r(468, 548); if (Math.hypot(x - 18, z - 559) < 16 || (Math.abs(x + 16) < 18 && z < 470)) continue; const g = ouAt(new THREE.Group(), x, 0, z, R.f() * TAU);
      for (let k = 0; k < 4; k++) { const c = c3Mesh(new THREE.ConeGeometry(0.25, R.r(1.2, 2.4), 4), tm[R.i(0, 3)], 0); c.position.set(R.n(0.5), 0.6, R.n(0.5)); c.rotation.set(R.n(0.4), 0, R.n(0.4)); g.add(c); }
      if (R.f() < 0.35) { const f = c3Mesh(new THREE.SphereGeometry(0.22, 6, 4), c3Prop(R.f() < 0.5 ? '#f2d23a' : '#f6f2ea'), 0); f.position.set(0, 1.9, 0); g.add(f); } K.add(g); } }
  for (const y of [5, 21]) s.signPanel.add(rb(44, 0.8, 0.5, M.steelD, 0, y, -1.1, 0.02));
  { [[150, -345, 1.3], [172, -336, 1.2], [194, -352, 1.4], [160, -372, 1.2], [214, -330, 1.3], [236, -348, 1.2], [128, -350, 1.3]].forEach(([x, z, sc], i) => ouTree(K, x, z, sc, 40 + i));
    const ct = tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(170,176,182,0.9)'; g.lineWidth = 1.5; for (let k = -h; k < w; k += 8) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h, h); g.stroke(); g.beginPath(); g.moveTo(k + h, 0); g.lineTo(k, h); g.stroke(); } }, 128, 128);
    const fm = new THREE.MeshBasicMaterial({ map: ouRep(ct, 14, 1), transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, color: '#c0c6cc' }); const fen = pl(130, 9, fm, 210, 4.5, -312); fen.userData.noCast = true; scene.add(fen);
    for (let x = 145; x <= 275; x += 10) K.add(cyl(0.22, 0.22, 9.4, M.galv, x, 4.7, -312, 0, 6)); { const r = cyl(0.18, 0.18, 130, M.galv, 210, 9.2, -312, 0, 6); r.rotation.z = Math.PI / 2; K.add(r); }
    { const g = ouAt(new THREE.Group(), 182, 0, -298, 0.1); g.add(rb(14, 7, 7, c3Prop('#2f6a46', { rough: 0.6 }), 0, 4, 0, 0)); g.add(rb(14.4, 0.6, 7.6, c3Prop('#24543a', { rough: 0.6 }), 0, 7.6, 0, 0)); for (const x of [-5, 5]) for (const z of [-2.8, 2.8]) g.add(cyl(0.4, 0.4, 0.6, M.dark, x, 0.3, z, 0, 8)); g.add(rb(1, 1, 7.4, M.dark, -7.2, 5, 0, 0)); K.add(g); }
    K.add(ouPole(186, -326)); for (const dx of [-6.5, 6.5]) { K.add(ouWire([186 + dx, -326], [60 + dx, -326], 47.6)); K.add(ouWire([186 + dx, -326], [330 + dx, -326], 47.6)); } }
  // a mailbox + a road-side bush cluster by the sign
  for (const [x, z, r] of [[-40, 470, 6], [14, 476, 5], [-60, 455, 7]]) { const b = c3Mesh(new THREE.SphereGeometry(r, 14, 10), c3Prop('#4a9a3a', { rough: 0.8 }), 0.05); b.position.set(x, r * 0.6, z); b.scale.y = 0.75; K.add(b); }
  // v4 DEPTH: receding layers behind the store (lot + cars, pine/leaf rows, distant buildings, hills) faded into the horizon blue
  for (const [x, z, ry] of [[0, -340, 0], [-520, 120, Math.PI / 2], [560, 40, -Math.PI / 2]]) { const bd = c3Backdrop(scene, { origin: [0, 0, 0], dir: [0, -1], width: 220, near: 22, far: 420, rows: 4, horizon: '#a9c6b4', ground: '#4f7a38',   // v6: a green-grey haze (milky hills read as snow)
    cars: z === -340 ? 9 : 0, lot: z === -340, seed: 11 + x });
    scene.remove(bd); bd.traverse((m) => { const t = m.isMesh && m.material.map; if (t && t.encoding !== THREE.sRGBEncoding) { t.encoding = THREE.sRGBEncoding; t.needsUpdate = true; } });   // exterior.js leaf/lot maps are linear (washed out)
    bd.scale.setScalar(5.6); bd.position.set(x, 0.12, z); bd.rotation.y = ry; scene.add(ouBake(bd, { ao: false, noCast: true })); }
  scene.add(ouBake(K));   // v3: all static detail in a few merged meshes
  // ---- FOCUS: the dolly, the cash
  const F = new THREE.Group(); scene.add(F); s.dolly = ouDolly(); F.add(s.dolly); s.cash = ouBills(); F.add(s.cash); c3Layer(F, C3.L_FOCUS);
  toonPerson(s, 'driver'); toonPerson(s, 'boss');
  c3Env(scene, { top: '#7aa4e8', mid: '#a4a2a0', bot: '#5a5030' }); c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.7, scale: 0.3, inkSet: false, grimeH: 5, bounce: ['#8ab0f0', '#8a7a40', 0.1] });   // v3: Ricks-like set (setlook.js)
  return s;
}
const ouGet = () => OU.s ||= ouBuild();
SETS.outside = ouGet;
function ouReset(s) { hideAll(s); hideGrips(s); s.dolly.visible = false; s.cash.visible = false; s.signPanel.rotation.set(0, 0, 0); }
// the sun's shadow box (radius 90) follows the place the shot looks at
function ouShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; if (!k.castShadow) return; const d = new THREE.Vector3(...OU_SUN).normalize();
  if (!s.catchFix) { s.catchFix = true; s.scene.traverse((m) => { if (m.userData.c3catch) { m.material.color.set('#141c30'); m.material.opacity = 0.32; } }); }   // cool blue shadows outdoors (not violet)
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(d, 180); }
const ouCam = (s, id, lt, K) => c3SetCam(s.cam, camMove(K, lt, id));
const ouRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#6a9ad8', bgBlur: 1.2, glow: 0.25, glowBlur: 12, grade: 'saturate(1.06) contrast(1.14) brightness(0.95)' }, o));
function ouTruckAt(s, x, z, ry, roll) { s.truck.position.set(x, 0, z); s.truck.rotation.y = ry; s.truck.userData.wheels.forEach((w) => { w.rotation.z = -roll; }); }

// ---- s06: Alabama — low angle on the WELCOME TO ALABAMA sign; the suitcase truck roars past behind it, the sign shudders
SHOT_FN.s06 = (t, u, lt) => { const s = ouGet(); ouReset(s); ouShadowAt(s, -10, 440);
  ouCam(s, 's06', lt, [[0, [26, 2.5, 566], [-14, 30, 462], 46], [0.84, [10, 4.5, 552], [-16, 33, 462], 46]]);
  // v2: s06 starts 6.36 (before 'Alabama'); the truck is slower and passes the sign mid-shot
  const x = -70 + 120 * lt; ouTruckAt(s, x, OU_ROADZ + 11, 0, x / 3.6);
  const k = lt - 0.4; s.signPanel.rotation.x = k > 0 ? -0.05 * Math.sin(k * 38) * Math.exp(-k * 4) : 0; s.signPanel.rotation.z = k > 0 ? 0.02 * Math.sin(k * 31) * Math.exp(-k * 4) : 0;
  ouRender(s, { bgBlur: 1.5 }); };
SNAPS.s06 = 'free'; CAMF.s06 = { push: 0.1, orbit: 0, crane: 0 };
// ---- s07: There's a store in a small town there — crane up from the main street over the shops to the big store
SHOT_FN.s07 = (t, u, lt) => { const s = ouGet(); ouReset(s); ouShadowAt(s, 0, 140); ouTruckAt(s, OU_DOCKX + 31, OU_DOCKZ, 0, 0);
  ouCam(s, 's07', lt, [[0, [0, 9, 352], [0, 14, 270], 44], [0.3, [0, 18, 347], [0, 18, 250], 44], [1.0, [3, 70, 330], [0, 34, 60], 42], [1.7, [0, 96, 300], [0, 38, -150], 40]]);
  ouRender(s, { bgBlur: 0.8 }); };
SNAPS.s07 = 'free'; CAMF.s07 = { push: 0.04, orbit: 0, crane: 0 };
// ---- s08: that buys lost luggage nobody ever claimed — the loading dock: the driver wheels in a dolly of suitcases,
// the buyer holds out the cash on "buys" and the driver takes it on "claimed"
SHOT_FN.s08 = (t, u, lt) => { const s = ouGet(); ouReset(s); ouShadowAt(s, 155, -235); ouTruckAt(s, OU_DOCKX + 31, OU_DOCKZ, 0, 0);
  ouCam(s, 's08', lt, [[0, [181, 16, -186], [164, 12.5, -238], 46], [2.1, [176, 17.5, -185], [162, 12.5, -238], 46]]);
  const Y = OU_DOCKY, Z = -233, walkE = clamp((t - 8.9) / 0.85), dx = 169 - 6.5 * EZ.o2(walkE), take = t >= 10.42;
  pose(s, 'boss', t, 154, Z - 1, { y: Y, facing: 1.2, expr: [[0, 'smile'], [8.9, 'smug'], [10.42, 'happy']], hand: { L: 'hip', R: [[0, 'down'], [8.95, { h: [0.62, 0.34], pole: [1, 0.4], hand: 'grip' }], [10.6, 'down']] } });
  pose(s, 'driver', t, dx, Z, { y: Y, facing: walkE < 1 ? -2 : -1.2, mode: walkE < 1 ? 'walk' : 'stand', phase: (169 - dx) / 3.3, stop: walkE, expr: [[0, 'determined'], [9.7, 'talk'], [10.42, 'grin']], talk: t > 9.7 && t < 10.4 ? 0.6 : 0,
    hand: { R: { h: [0.5, 0.42], pole: [1, 0.3], hand: 'grip' }, L: [[0, 'down'], [10.25, { h: [0.66, 0.3], pole: [1, 0.4], hand: 'grip' }]] } });
  // the dolly: axle on the dock, leaning back so its handle lands in the driver's hand
  { const h = c3ToonHandWorld(s.p.driver, 'R'), L = OU_DOLLY_L + 1.6, dy = clamp((h.y - Y) / L, 0.3, 0.99), th = Math.acos(dy);
    s.dolly.visible = true; s.dolly.position.set(h.x - L * Math.sin(th), Y, h.z - 0.3); s.dolly.rotation.set(0, 0, -th); }
  { const who = take ? 'driver' : 'boss', nm = take ? 'L' : 'R'; if (t >= 8.95) { gripProp(s, s.cash, who, nm, V3(0.4, -0.3, 0), { behind: -0.1 }); gripDot(s, who, nm); } }
  ouRender(s, { bgBlur: 3 }); };
SNAPS.s08 = 'free'; CAMF.s08 = { push: 0.05, orbit: 0.02, crane: 0.1 };

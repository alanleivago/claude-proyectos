// =====================================================================
//  SET history — an old Danish market town in the 1700s, late-afternoon amber sun (COLOR.history). 25.68–36.14 s.
//  Layout (x east, z south, ground y = 0, a person ≈ 10.5 tall): a dirt road comes from the fields in the west (x < -60,
//  z ≈ 2) into a cobbled market square (x -4..84, z -50..30) closed by half-timbered houses (north row z = -50, west
//  corner houses along the road z = -12, east row x = 84, south row z = 30 for x > 30); the brick church with the copper
//  spire stands behind the north row (tower at 44, -80). Market stalls, a well, geese, a carpenter's stall (12, -8), the
//  signpost RIBE / ODENSE / AARHUS at the square entrance (11, 12). The pepper man pushes his two-wheeled spice cart in
//  along the road and stops it at x ≈ 2 (bed centre), the girl's window is in the corner house (-12, 16, -12).
//  ONE continuous take: camera = seqCam(s, 'history', t) (CAMSEQ.history). Prefix HI. Registers h01 h02 h03 h04.
// =====================================================================
const HI = {};
const hiAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const hiRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
const hiSnap = (t, t0, d = 0.33) => { const x = clamp((t - t0) / d); return 1 - (1 - x) ** 3; };   // Ricks snap
const hiBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const hiCyl = (r0, r1, h, mat, x, y, z, seg = 14, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.position.set(x, y, z); return m; };
const hiSph = (r, mat, x, y, z, ws = 14, hs = 10) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); return m; };
function hiTube(a, b, r, mat, seg = 8) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
function hiKN(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], EZ.io((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); return K[K.length - 1][1]; }

// ---- the townsfolk (HI prefix): period role costumes, combos not used in the main CAST or earlier pieces
T3_HSTYLE.ponytail2 ||= Object.assign({}, T3_HSTYLE.ponytail);
Object.assign(CAST, {
  HIgirl: { key: 'HIgirl', hair: 'ponytail2', hairColor: 'blond', outfit: 'dress', colors: { main: '#3a86c8', belt: '#f4ecdc' }, skin: 'peach', body: 'thin' },   // the girl at the window
  HIham: { key: 'HIham', hair: 'side', hairColor: 'ginger', moustache: true, outfit: 'apron', colors: { main: '#5a7aa8', apron: '#b88a5a' }, skin: 'peach', body: 'fat' },   // the carpenter (hammer, PEBERSVEND board)
  HIwife: { key: 'HIwife', hair: 'curly', hairColor: 'dark', outfit: 'dress', colors: { main: '#d8762a', belt: '#5a2a1a' }, skin: 'pale', body: 'avg' },
  HImaid: { key: 'HImaid', hair: 'topknot2', hairColor: 'chestnut', outfit: 'apron', colors: { main: '#2f8a7a', apron: '#fff4e0' }, skin: 'brown', body: 'short' },
  HIfarm: { key: 'HIfarm', hair: 'tuft', hairColor: 'blond', outfit: 'vest', colors: { main: '#5a7a2a', shirt: '#f0e2c8' }, skin: 'tan', body: 'tall' },
  HIkid: { key: 'HIkid', hair: 'bowl', hairColor: 'auburn', outfit: 'vest', colors: { main: '#c83a3a', shirt: '#f4ecd8' }, skin: 'peach', body: 'kid' },
  HIold: { key: 'HIold', hair: 'balding', hairColor: 'white', outfit: 'robe', colors: { main: '#4a5aa0', belt: '#c89a3a' }, skin: 'pale', body: 'thin' },
  HIbaker: { key: 'HIbaker', hair: 'bald2', hairColor: 'brown', outfit: 'apron', colors: { main: '#c86a3a', apron: '#f4ecdc' }, skin: 'tan', body: 'pear' },
});

// ---- bake (copied from trash-library stBake): merge static props per material into vertex-coloured meshes
function hiBake(root, o = {}) { root.updateMatrixWorld(true); const Bk = new Map(), v = new THREE.Vector3(), keep = [];
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    if (mt.transparent || mt.isShaderMaterial || m.userData.keep) { keep.push(m); return; }
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    m.getWorldPosition(v); const ch = Math.floor(v.x / 90) + ',' + Math.floor(v.z / 90);
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '') + (mt.side === THREE.DoubleSide ? 'D' : '') + '|' + ch;
    if (!Bk.has(key)) Bk.set(key, { mt, em, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); Bk.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const m of keep) { const c = m.clone(); m.matrixWorld.decompose(c.position, c.quaternion, c.scale); out.add(c); }
  for (const { mt, em, L } of Bk.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), Cc = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.74 + 0.26 * clamp(y / 3);
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        Cc[k * 3] = c.r * ao; Cc[k * 3 + 1] = c.g * ao; Cc[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; }
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast) mesh.userData.noCast = true; out.add(mesh); }
  return out; }

// ---- textures
function hiNoise(g, w, h, seed, n = 1600, a = 0.06) { const R = RNG('hinz', seed); for (let i = 0; i < n; i++) { g.fillStyle = R.f() < 0.5 ? `rgba(60,30,10,${a})` : `rgba(255,250,235,${a})`; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); } }
// a half-timbered facade (pentagon when gh > 0): o = { w, h (eave), gh, floors, bays, infill, beam, shutter, door (bay), hole (bay of the open
// upper window), sign }
function hiTexFacade(seed, o) { const Ht = o.h + (o.gh || 0), Wc = 512, Hc = Math.min(1024, Math.round(512 * Ht / o.w));
  return tex((g, w, h) => { const R = RNG('hifac', seed), X = (u) => u / o.w * w, Y = (v) => h * (1 - v / Ht), bt = Math.max(5, X(0.42)), beam = o.beam ?? '#3a2416';
    g.fillStyle = o.infill; g.fillRect(0, 0, w, h); hiNoise(g, w, h, seed, 2400, 0.05);
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,80,40,0.06)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(10, 40), R.r(6, 20), 0, 0, TAU); g.fill(); }   // weathering
    // plinth
    g.fillStyle = '#8e8676'; g.fillRect(0, Y(1.2), w, h - Y(1.2)); g.fillStyle = 'rgba(40,30,20,0.35)'; for (let x = 0; x < w; x += 26) g.fillRect(x + (R.f() * 6), Y(1.2), 2, h - Y(1.2)); g.fillRect(0, Y(0.6), w, 2);
    const fl = o.floors, fH = (o.h - 1.2) / fl, bw = o.w / o.bays, B = (x0, y0, x1, y1) => { g.strokeStyle = beam; g.lineWidth = bt; g.lineCap = 'square'; g.beginPath(); g.moveTo(X(x0), Y(y0)); g.lineTo(X(x1), Y(y1)); g.stroke(); };
    // windows + door first (beams frame them)
    for (let f = 0; f < fl; f++) for (let b = 0; b < o.bays; b++) { const cx = (b + 0.5) * bw, y0 = 1.2 + f * fH;
      if (f === 0 && b === o.door) { const dw = Math.min(4.2, bw * 0.55), dh = Math.min(8.2, fH * 0.8); g.fillStyle = o.doorC ?? '#2f5a3a'; g.beginPath(); g.moveTo(X(cx - dw / 2), Y(y0)); g.lineTo(X(cx - dw / 2), Y(y0 + dh - dw / 2)); g.arc(X(cx), Y(y0 + dh - dw / 2), X(dw / 2), Math.PI, 0); g.lineTo(X(cx + dw / 2), Y(y0)); g.fill();
        g.fillStyle = 'rgba(0,0,0,0.22)'; for (let k = 1; k < 5; k++) g.fillRect(X(cx - dw / 2 + k * dw / 5), Y(y0 + dh), 2, Y(y0) - Y(y0 + dh)); g.fillStyle = '#2a2a2e'; for (const yy of [0.25, 0.7]) g.fillRect(X(cx - dw / 2), Y(y0 + dh * yy), X(dw * 0.5), 5); g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(X(cx + dw * 0.3), Y(y0 + dh * 0.45), 5, 0, TAU); g.fill(); continue; }
      const ww = Math.min(3.6, bw * 0.46), wh = fH * 0.48, wy = y0 + fH * 0.24;
      if (f === fl - 1 && b === o.hole) { g.fillStyle = '#2a1c1c'; g.fillRect(X(cx - 2), Y(wy + 5), X(4), Y(wy) - Y(wy + 5)); continue; }   // the real opening (3D shutters, the girl)
      g.fillStyle = '#efe6d2'; g.fillRect(X(cx - ww / 2 - 0.25), Y(wy + wh + 0.25), X(ww + 0.5), Y(wy - 0.25) - Y(wy + wh + 0.25));
      const gr = g.createLinearGradient(0, Y(wy + wh), 0, Y(wy)); gr.addColorStop(0, '#5a7aa8'); gr.addColorStop(0.5, '#2e3e5e'); gr.addColorStop(1, '#3a4a6a'); g.fillStyle = gr; g.fillRect(X(cx - ww / 2), Y(wy + wh), X(ww), Y(wy) - Y(wy + wh));
      g.fillStyle = 'rgba(255,240,210,0.35)'; g.beginPath(); g.moveTo(X(cx - ww / 2), Y(wy + wh * 0.7)); g.lineTo(X(cx - ww / 2 + ww * 0.35), Y(wy + wh)); g.lineTo(X(cx - ww / 2 + ww * 0.55), Y(wy + wh)); g.lineTo(X(cx - ww / 2), Y(wy + wh * 0.4)); g.fill();
      g.fillStyle = '#efe6d2'; g.fillRect(X(cx) - 2, Y(wy + wh), 4, Y(wy) - Y(wy + wh)); for (const k of [1 / 3, 2 / 3]) g.fillRect(X(cx - ww / 2), Y(wy + wh * k) - 2, X(ww), 4);
      if (o.shutter && R.f() < 0.8) { g.fillStyle = o.shutter; for (const sx of [-1, 1]) { const x0 = sx < 0 ? cx - ww / 2 - 0.25 - ww * 0.5 : cx + ww / 2 + 0.25; g.fillRect(X(x0), Y(wy + wh + 0.2), X(ww * 0.5), Y(wy - 0.2) - Y(wy + wh + 0.2));
        g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(x0), Y(wy)); g.lineTo(X(x0 + ww * 0.5), Y(wy + wh)); g.stroke(); } }
      if (R.f() < 0.55) { g.fillStyle = '#7a4a26'; g.fillRect(X(cx - ww / 2 - 0.3), Y(wy - 0.1), X(ww + 0.6), X(0.9)); for (let k = 0; k < 9; k++) { g.fillStyle = ['#e8344a', '#f2c23a', '#f08ab0', '#ffffff', '#e86a2a'][R.i(0, 4)]; g.beginPath(); g.arc(X(cx - ww / 2 + R.f() * ww), Y(wy + 0.15) + R.r(-3, 3), R.r(4, 7), 0, TAU); g.fill(); } g.fillStyle = '#3f8a3a'; for (let k = 0; k < 7; k++) { g.beginPath(); g.ellipse(X(cx - ww / 2 + R.f() * ww), Y(wy + 0.05), 6, 3, R.f() * 3, 0, TAU); g.fill(); } }
    }
    // the timber frame: sill, floor beams, top plate, posts, braces
    B(0, 1.2, o.w, 1.2); for (let f = 1; f <= fl; f++) B(0, 1.2 + f * fH, o.w, 1.2 + f * fH);
    for (let b = 0; b <= o.bays; b++) B(b * bw, 1.2, b * bw, o.h);
    for (let f = 0; f < fl; f++) for (let b = 0; b < o.bays; b++) { const x0 = b * bw, x1 = x0 + bw, y0 = 1.2 + f * fH, ww = Math.min(3.6, bw * 0.46), wy = y0 + fH * 0.24, cx = x0 + bw / 2;
      if (f === 0 && b === o.door) { B(x0, y0 + fH * 0.55, cx - 2.6, y0 + fH * 0.95); continue; }
      B(x0 + 0.2, y0, cx - ww / 2 - 0.3, wy - 0.2); B(cx - ww / 2 - 0.3, y0, x0 + 0.2, wy - 0.2); B(x1 - 0.2, y0, cx + ww / 2 + 0.3, wy - 0.2); B(cx + ww / 2 + 0.3, y0, x1 - 0.2, wy - 0.2);   // St Andrew's crosses under the window
      B(cx - ww / 2 - 0.25, wy - 0.25, cx + ww / 2 + 0.25, wy - 0.25); B(cx - ww / 2 - 0.25, wy + fH * 0.48 + 0.25, cx + ww / 2 + 0.25, wy + fH * 0.48 + 0.25);
      if (bw > 4.5) { B(x0 + 0.3, wy + fH * 0.5, x0 + 0.3 + (cx - ww / 2 - x0) * 0.8, y0 + fH - 0.2); B(x1 - 0.3, wy + fH * 0.5, x1 - 0.3 - (x1 - cx - ww / 2) * 0.8, y0 + fH - 0.2); } }
    if (o.gh) { const a = o.h, top = Ht; B(0, a, o.w / 2, top); B(o.w, a, o.w / 2, top); B(o.w * 0.22, a + o.gh * 0.44, o.w * 0.78, a + o.gh * 0.44); B(o.w / 2, a, o.w / 2, top);
      B(o.w * 0.22, a + o.gh * 0.44, o.w * 0.38, a); B(o.w * 0.78, a + o.gh * 0.44, o.w * 0.62, a);
      g.fillStyle = '#2e3e5e'; g.beginPath(); g.arc(X(o.w / 2), Y(a + o.gh * 0.68), X(0.8), 0, TAU); g.fill(); g.strokeStyle = '#efe6d2'; g.lineWidth = 4; g.stroke(); }
    if (o.sign) { g.fillStyle = 'rgba(0,0,0,0)'; }
    const sh = g.createLinearGradient(0, Y(2.5), 0, h); sh.addColorStop(0, 'rgba(40,30,20,0)'); sh.addColorStop(1, 'rgba(40,30,20,0.25)'); g.fillStyle = sh; g.fillRect(0, Y(2.5), w, h - Y(2.5));
  }, Wc, Hc); }
function hiTexSide(infill, seed) { const t = tex((g, w, h) => { g.fillStyle = infill; g.fillRect(0, 0, w, h); hiNoise(g, w, h, seed + 9, 1200, 0.05); g.strokeStyle = '#3a2416'; g.lineWidth = 10;
  for (const y of [0.08, 0.5, 0.97]) { g.beginPath(); g.moveTo(0, h * y); g.lineTo(w, h * y); g.stroke(); } for (const x of [0.03, 0.34, 0.66, 0.97]) { g.beginPath(); g.moveTo(w * x, 0); g.lineTo(w * x, h); g.stroke(); }
  for (const [x0, x1] of [[0.03, 0.34], [0.66, 0.97]]) for (const [y0, y1] of [[0.08, 0.5], [0.5, 0.97]]) { g.beginPath(); g.moveTo(w * x0, h * y1); g.lineTo(w * x1, h * y0); g.stroke(); }
  g.fillStyle = '#2e3e5e'; g.fillRect(w * 0.42, h * 0.62, w * 0.16, h * 0.2); g.strokeStyle = '#efe6d2'; g.lineWidth = 5; g.strokeRect(w * 0.42, h * 0.62, w * 0.16, h * 0.2); }, 256, 256); return t; }
function hiTexThatch() { const t = tex((g, w, h) => { const R = RNG('hithatch'); g.fillStyle = '#b8995a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) { const x = R.r(0, w), y = R.r(0, h), l = R.r(8, 22); g.strokeStyle = R.f() < 0.5 ? 'rgba(120,90,40,0.5)' : 'rgba(240,214,150,0.55)'; g.lineWidth = R.r(1, 2.5); g.beginPath(); g.moveTo(x, y); g.lineTo(x + R.r(-2, 2), y + l); g.stroke(); }
  for (let y = 0; y < h; y += h / 8) { g.fillStyle = 'rgba(70,50,20,0.35)'; g.fillRect(0, y + h / 8 - 5, w, 5); }
  for (let i = 0; i < 18; i++) { g.fillStyle = 'rgba(90,120,50,0.18)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(14, 40), R.r(8, 20), 0, 0, TAU); g.fill(); } }, 256, 256); return hiRep(t, 2, 2); }
function hiTexTiles() { const t = tex((g, w, h) => { const R = RNG('hitile'); g.fillStyle = '#a8442a'; g.fillRect(0, 0, w, h); const rh = h / 10, tw = w / 8;
  for (let r = 0; r < 10; r++) for (let c = -1; c < 9; c++) { const x = c * tw + (r % 2) * tw / 2, y = r * rh; g.fillStyle = `hsl(${12 + R.r(-4, 5)},${56 + R.r(-8, 8)}%,${38 + R.r(-6, 6)}%)`; g.beginPath(); g.moveTo(x + 2, y); g.lineTo(x + tw - 2, y); g.quadraticCurveTo(x + tw - 2, y + rh, x + tw / 2, y + rh + 3); g.quadraticCurveTo(x + 2, y + rh, x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,0.18)'; g.fillRect(x + 4, y + 2, tw * 0.3, 3); } }, 256, 256); return hiRep(t, 3, 2); }
function hiTexBrick(dark) { const t = tex((g, w, h) => { const R = RNG('hibrick', dark ? 2 : 1); g.fillStyle = '#d8c8b0'; g.fillRect(0, 0, w, h); const bh = h / 16, bw = w / 6;
  for (let r = 0; r < 16; r++) for (let c = -1; c < 7; c++) { g.fillStyle = `hsl(${10 + R.r(-4, 6)},${52 + R.r(-8, 8)}%,${(dark ? 34 : 42) + R.r(-6, 6)}%)`; g.fillRect(c * bw + (r % 2) * bw / 2 + 2, r * bh + 2, bw - 4, bh - 4); } hiNoise(g, w, h, 33, 800, 0.06); }, 256, 256); return t; }
function hiTexCobble() { const t = tex((g, w, h) => { const R = RNG('hicob'); g.fillStyle = '#6e6458'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) { const x = (i + (j % 2) * 0.5) * w / 12, y = (j + 0.5) * h / 12, r = w / 24 * R.r(0.78, 0.95); const l = 52 + R.r(-10, 10);
    g.fillStyle = `hsl(${30 + R.r(-10, 10)},${14 + R.r(-6, 8)}%,${l}%)`; g.beginPath(); g.ellipse(x, y, r, r * 0.86, R.f(), 0, TAU); g.fill(); g.fillStyle = 'rgba(255,245,225,0.25)'; g.beginPath(); g.ellipse(x - r * 0.25, y - r * 0.25, r * 0.4, r * 0.28, 0, 0, TAU); g.fill(); } }, 512, 512); return t; }
function hiTexDirt() { const t = tex((g, w, h) => { const R = RNG('hidirt'); g.fillStyle = '#a8845a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 3000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,60,30,0.15)' : 'rgba(230,200,150,0.18)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(1, 5), R.r(1, 3), 0, 0, TAU); g.fill(); }
  for (const y of [0.3, 0.7]) { g.fillStyle = 'rgba(80,52,26,0.35)'; g.fillRect(0, h * y - 6, w, 12); g.fillStyle = 'rgba(240,210,160,0.25)'; g.fillRect(0, h * y + 6, w, 3); }
  g.fillStyle = 'rgba(90,130,50,0.5)'; for (let i = 0; i < 300; i++) { const y = R.f() < 0.5 ? R.r(0, h * 0.08) : R.r(h * 0.92, h); g.fillRect(R.r(0, w), y, 2, R.r(3, 8)); } }, 512, 256); return t; }
function hiTexField(c1, c2, seed) { const t = tex((g, w, h) => { const R = RNG('hifield', seed); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? c1 : c2; g.fillRect(0, i * h / 16, w, h / 16 + 1); }
  for (let i = 0; i < 2000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(60,60,20,0.12)' : 'rgba(255,240,180,0.14)'; g.fillRect(R.r(0, w), R.r(0, h), 2, R.r(2, 6)); } }, 256, 256); return t; }
function hiTexGrass() { const t = tex((g, w, h) => { const R = RNG('higrass'); g.fillStyle = '#7a9a48'; g.fillRect(0, 0, w, h); for (let i = 0; i < 4000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(60,90,30,0.25)' : 'rgba(200,220,120,0.22)'; g.fillRect(R.r(0, w), R.r(0, h), 2, R.r(2, 6)); } }, 256, 256); return t; }
function hiTexBurlap(label, ink) { return tex((g, w, h) => { const R = RNG('hiburl', label); g.fillStyle = '#c8a474'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 4) { g.fillStyle = 'rgba(120,84,40,0.22)'; g.fillRect(0, y, w, 1.5); } for (let x = 0; x < w; x += 4) { g.fillStyle = 'rgba(255,240,200,0.14)'; g.fillRect(x, 0, 1.5, h); }
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(100,70,30,0.1)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(8, 30), R.r(6, 18), 0, 0, TAU); g.fill(); }
  if (label) { g.save(); g.translate(w * 0.5, h * 0.5); g.rotate(-0.05); g.strokeStyle = ink; g.lineWidth = 6; g.strokeRect(-w * 0.17, -h * 0.13, w * 0.34, h * 0.26); inked(g, label, 0, 4, h * 0.15, ink, { stroke: false, maxW: w * 0.3, font: 'Georgia, serif' }); g.restore(); } }, 512, 256); }
function hiTexWood(c = '#a8703a') { const t = tex((g, w, h) => { const R = RNG('hiwood', c); g.fillStyle = c; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,30,10,0.3)';
  for (let i = 0; i < 26; i++) { const y = R.r(0, h); g.lineWidth = R.r(1, 3); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R.n(10), w * 2 / 3, y + R.n(10), w, y + R.n(6)); g.stroke(); } }, 256, 128); return t; }
// an arrow board: wood with the town name (the board is an extruded arrow shape; caps map 0..L x 0..H via repeat)
function hiTexArrow(txt) { return tex((g, w, h) => { const R = RNG('hiarrow', txt); g.fillStyle = '#e8d2a2'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,80,40,0.3)'; for (let i = 0; i < 14; i++) { const y = R.r(0, h); g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R.n(6), w * 2 / 3, y + R.n(6), w, y); g.stroke(); }
  g.strokeStyle = '#7a4a22'; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); inked(g, txt, w * 0.47, h * 0.53, h * 0.56, '#2a1608', { stroke: false, maxW: w * 0.66, font: 'Georgia, serif' }); }, 512, 128); }
function hiTexBoard() { return tex((g, w, h) => { const R = RNG('hiboard'); g.fillStyle = '#f2e2b8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(140,100,50,0.3)'; for (let i = 0; i < 16; i++) { const y = R.r(0, h); g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w / 3, y + R.n(5), w * 2 / 3, y + R.n(5), w, y); g.stroke(); }
  g.fillStyle = '#2f6a3a'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
  inked(g, 'PEBERSVEND', w / 2, h * 0.55, h * 0.56, '#c8281e', { stroke: '#3a1208', sw: 7, maxW: w * 0.86, font: 'Georgia, serif' });
  g.fillStyle = '#4a4a50'; for (const x of [28, w - 28]) { g.beginPath(); g.arc(x, h / 2, 7, 0, TAU); g.fill(); } }, 1024, 256); }
function hiTexClock() { return tex((g, w, h) => { g.fillStyle = '#1e3a5a'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, TAU); g.fill(); g.strokeStyle = '#e8c04a'; g.lineWidth = 12; g.stroke();
  g.fillStyle = '#e8c04a'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.fillRect(w / 2 + Math.cos(a) * w * 0.38 - 5, h / 2 + Math.sin(a) * h * 0.38 - 5, 10, 10); }
  g.strokeStyle = '#e8c04a'; g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 + w * 0.22, h / 2 + h * 0.05); g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(w / 2 - w * 0.04, h / 2 - h * 0.33); g.stroke(); }, 256, 256); }
function hiTexChurch() { return tex((g, w, h) => { const R = RNG('hich'); g.fillStyle = '#c86a4a'; g.fillRect(0, 0, w, h); const bh = h / 40, bw = w / 16;
  for (let r = 0; r < 40; r++) for (let c = -1; c < 17; c++) { g.fillStyle = `hsl(${12 + R.r(-4, 6)},${50 + R.r(-8, 8)}%,${44 + R.r(-6, 6)}%)`; g.fillRect(c * bw + (r % 2) * bw / 2 + 1, r * bh + 1, bw - 2, bh - 2); }
  for (const x of [0.25, 0.75]) { g.fillStyle = '#e8dcc6'; g.beginPath(); g.moveTo(w * (x - 0.1), h * 0.86); g.lineTo(w * (x - 0.1), h * 0.42); g.arc(w * x, h * 0.42, w * 0.1, Math.PI, 0); g.lineTo(w * (x + 0.1), h * 0.86); g.fill();
    g.fillStyle = '#34486a'; g.beginPath(); g.moveTo(w * (x - 0.075), h * 0.84); g.lineTo(w * (x - 0.075), h * 0.43); g.arc(w * x, h * 0.43, w * 0.075, Math.PI, 0); g.lineTo(w * (x + 0.075), h * 0.84); g.fill();
    g.strokeStyle = '#e8dcc6'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * x, h * 0.84); g.lineTo(w * x, h * 0.4); g.moveTo(w * (x - 0.075), h * 0.62); g.lineTo(w * (x + 0.075), h * 0.62); g.stroke(); }
  g.fillStyle = '#e8dcc6'; g.fillRect(0, h * 0.94, w, h * 0.06); }, 256, 512); }

// ---- builders
const HI_M = {};
// a half-timbered house, front facing +z in local space (origin = front-bottom centre). o = { w, d, h (eave), gable (front gable), floors, bays,
// infill, roof: 'thatch'|'tile', shutter, door, hole, chim }
function hiHouse(par, x, z, ry, o, seed) { const g = hiAt(new THREE.Group(), x, 0, z, ry); par.add(g); const M = HI_M, w = o.w, d = o.d, h = o.h, R = RNG('hihouse', seed);
  const side = (M.side ||= {})[o.infill] ||= c3Prop('#ffffff', { map: hiTexSide(o.infill, seed), rough: 0.9 });
  g.add(hiBox(w, h, d, side, 0, h / 2, -d / 2));
  const thatch = o.roof === 'thatch', rm = thatch ? M.thatch : M.tile, th = thatch ? 1.3 : 0.5, pitch = thatch ? 0.95 : 0.82;
  const gh = o.gable ? (w / 2) * Math.tan(pitch) : 0;
  // front facade (pentagon with its gable when o.gable)
  { const S = new THREE.Shape(); S.moveTo(-w / 2, 0); S.lineTo(w / 2, 0); S.lineTo(w / 2, h); if (gh) S.lineTo(0, h + gh); S.lineTo(-w / 2, h); S.closePath();
    const geo = new THREE.ShapeGeometry(S), uv = geo.attributes.uv, P = geo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (P.getX(i) + w / 2) / w, P.getY(i) / (h + gh));
    const fm = c3Prop('#ffffff', { map: hiTexFacade(seed, { w, h, gh, floors: o.floors, bays: o.bays, infill: o.infill, shutter: o.shutter, door: o.door, hole: o.hole, doorC: o.doorC }), rough: 0.88 });
    const f = new THREE.Mesh(geo, fm); f.position.set(0, 0, 0.06); f.userData.noCast = true; g.add(f); }
  if (gh) {   // ridge along z: a gable prism + two roof slabs
    const S = new THREE.Shape(); S.moveTo(-w / 2, 0); S.lineTo(w / 2, 0); S.lineTo(0, gh); S.closePath(); const pr = new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: d - 0.2, bevelEnabled: false }), side); pr.position.set(0, h, -d + 0.1); g.add(pr);
    const sl = Math.hypot(w / 2, gh) + 1.4; for (const sx of [-1, 1]) { const s = hiBox(sl, th, d + 1.6, rm, sx * w / 4, h + gh / 2 + th * 0.4, -d / 2 + 0.4); s.rotation.z = -sx * pitch; s.position.x += sx * 0.25; g.add(s); }
    g.add(hiBox(1.0, 1.0, d + 1.8, thatch ? M.thatchD : M.tileD, 0, h + gh + th * 0.5, -d / 2 + 0.4));
  } else {   // ridge along x (eaves to the street): gable prism along x + slabs
    const rh = (d / 2) * Math.tan(pitch), S = new THREE.Shape(); S.moveTo(-d / 2, 0); S.lineTo(d / 2, 0); S.lineTo(0, rh); S.closePath();
    const pr = new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: w - 0.2, bevelEnabled: false }), side); pr.rotation.y = Math.PI / 2; pr.position.set(-w / 2 + 0.1, h, -d / 2); g.add(pr);
    const sl = Math.hypot(d / 2, rh) + 1.6; for (const sz of [-1, 1]) { const s = hiBox(w + 1.4, th, sl, rm, 0, h + rh / 2 + th * 0.4, -d / 2 + sz * d / 4); s.rotation.x = sz * pitch; s.position.z += sz * 0.3; g.add(s); }
    g.add(hiBox(w + 1.6, 1.0, 1.0, thatch ? M.thatchD : M.tileD, 0, h + rh + th * 0.5, -d / 2));
    if (o.dormer) { const dx = R.r(-w / 4, w / 4), dz = -d / 4 + 1.2, dy = h + rh * 0.45; g.add(hiBox(3.4, 3.2, 3, side, dx, dy, dz)); const S2 = new THREE.Shape(); S2.moveTo(-2, 0); S2.lineTo(2, 0); S2.lineTo(0, 1.8); S2.closePath();
      const dr = new THREE.Mesh(new THREE.ExtrudeGeometry(S2, { depth: 3.6, bevelEnabled: false }), rm); dr.position.set(dx, dy + 1.6, dz - 2.2); g.add(dr); g.add(hiBox(1.6, 1.6, 0.2, M.glass, dx, dy, dz + 1.55)); }
  }
  if (o.chim !== false) { const cx = R.r(-w * 0.3, w * 0.3), ch = hiBox(1.8, 6, 1.8, M.brick, cx, h + (gh || (d / 2) * Math.tan(pitch)) * 0.75 + 2, -d * 0.45); ch.rotation.z = R.n(0.09); ch.rotation.x = R.n(0.05); g.add(ch);
    const cap = hiBox(2.4, 0.6, 2.4, M.stone, 0, 3.1, 0); ch.add(cap); }
  // plinth step, a bench or barrel by the door
  g.add(hiBox(w + 0.4, 0.8, 0.8, M.stone, 0, 0.4, 0.3));
  if (R.f() < 0.5) { const b = hiCyl(0.95, 0.95, 2.4, M.barrel, R.r(-w / 2 + 1.5, w / 2 - 1.5), 1.2, 1.4, 12); g.add(b); g.add(hiCyl(1.0, 1.0, 0.25, M.iron, b.position.x, 0.5, 1.4, 12)); g.add(hiCyl(1.0, 1.0, 0.25, M.iron, b.position.x, 1.9, 1.4, 12)); }
  return g; }
// a market stall: posts, counter with goods, a striped sloping awning
function hiStall(par, x, z, ry, band, goods, seed) { const g = hiAt(new THREE.Group(), x, 0, z, ry); par.add(g); const M = HI_M, R = RNG('histall', seed);
  for (const [px, pz] of [[-4, -2.2], [4, -2.2], [-4, 2.2], [4, 2.2]]) g.add(hiBox(0.35, pz < 0 ? 9.5 : 7.6, 0.35, M.woodD, px, (pz < 0 ? 9.5 : 7.6) / 2, pz));
  g.add(hiBox(8.6, 0.4, 4.4, M.wood, 0, 3.6, 0)); g.add(hiBox(8.6, 3.4, 0.25, M.woodD, 0, 1.7, 2.1));
  const aw = (M.aw ||= {})[band] ||= c3Prop('#ffffff', { rough: 0.85, map: tex((q, w, h) => { for (let i = 0; i < 10; i++) { q.fillStyle = i % 2 ? '#f6ecd6' : band; q.fillRect(i * w / 10, 0, w / 10 + 1, h); } q.fillStyle = 'rgba(0,0,0,0.12)'; q.fillRect(0, h * 0.85, w, h * 0.15); }, 256, 64) });
  const a = hiBox(9.4, 0.18, 5.6, aw, 0, 8.6, 0); a.rotation.x = 0.36; g.add(a); for (let i = 0; i < 10; i++) { const fl = hiBox(0.94, 0.7, 0.08, aw, -4.23 + i * 0.94, 7.4, 2.9); fl.rotation.x = 0.1; g.add(fl); }
  for (let i = 0; i < 9; i++) { const gx = -3.4 + (i % 5) * 1.7, gz = -1 + Math.floor(i / 5) * 1.4;
    if (goods === 'veg') { g.add(hiSph(0.6, R.f() < 0.5 ? M.cabbage : M.apple, gx, 4.4, gz)); if (i % 2) g.add(hiSph(0.45, M.apple, gx + 0.6, 4.25, gz + 0.4)); }
    else if (goods === 'bread') { const b = hiSph(0.7, M.bread, gx, 4.2, gz); b.scale.set(1.3, 0.6, 0.8); g.add(b); }
    else if (goods === 'fish') { const f = hiSph(0.5, M.fish, gx, 4.0, gz); f.scale.set(2, 0.4, 0.6); f.rotation.y = R.n(0.4); g.add(f); }
    else if (goods === 'wood') { if (i < 4) g.add(hiBox(1.4, 0.9, 1.2, M.wood, gx, 4.25, gz)); } }
  for (let i = 0; i < 3; i++) { const bk = hiCyl(0.9, 0.7, 1.2, M.basket, -3 + i * 3, 0.6, 3.2 + R.r(0, 0.6), 12); g.add(bk); if (goods !== 'wood') g.add(hiSph(0.7, goods === 'fish' ? M.fish : M.apple, -3 + i * 3, 1.3, bk.position.z)); }
  return g; }
// the pepper man's two-wheeled handcart: origin = axle centre; bed from x -3 to +3.6 (z ±1.8), handles to the crossbar at x -7,
// two legs under the rear (they stand on the ground when level), PEBER / KANEL sacks, cinnamon bundles, brass scales, jars
function hiCartBuild(M) { const g = new THREE.Group(), add = (m) => { g.add(m); return m; };
  add(hiBox(6.6, 0.3, 3.6, M.cartW, 0.3, 0.45, 0)); for (const sz of [-1, 1]) { add(hiBox(6.8, 0.8, 0.22, M.cartD, 0.3, 0.95, sz * 1.8)); add(hiBox(2.4, 0.18, 0.18, M.cartD, -4.1, 0.62, sz * 1.5)); }
  add(hiBox(0.22, 0.8, 3.6, M.cartD, 3.6, 0.95, 0)); add(hiBox(0.22, 0.8, 3.6, M.cartD, -3.0, 0.95, 0));
  { const cb = hiCyl(0.3, 0.3, 3.6, M.brass, -5.2, 0.62, 0, 12); cb.rotation.x = Math.PI / 2; add(cb); }   // the crossbar he grips
  for (const sz of [-1, 1]) add(hiBox(0.28, 2.6, 0.28, M.cartD, -2.7, -0.9, sz * 1.5));   // legs (bottom at y -2.2)
  g.userData.wheels = []; for (const sz of [-1, 1]) { const wh = new THREE.Group(); wh.position.set(0, 0, sz * 2.15); g.add(wh); g.userData.wheels.push(wh);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.22, 8, 28), M.cartD); wh.add(rim); const tyre = new THREE.Mesh(new THREE.TorusGeometry(2.18, 0.08, 6, 28), M.iron); wh.add(tyre);
    for (let i = 0; i < 8; i++) { const sp = hiBox(0.16, 3.9, 0.12, M.cartW, 0, 0, 0); sp.rotation.z = i / 8 * Math.PI; wh.add(sp); }
    const hub = hiCyl(0.4, 0.4, 0.5, M.iron, 0, 0, 0, 10); hub.rotation.x = Math.PI / 2; wh.add(hub); }
  { const ax = hiCyl(0.14, 0.14, 4.6, M.iron, 0, 0, 0, 8); ax.rotation.x = Math.PI / 2; add(ax); }
  // sacks (lathe, label to +z), open ones with a heap
  const sack = (x, z, label, ink, open, heap, k = 1) => { const prof = open ? [[0, 0], [1.0, 0.05], [1.25, 0.4], [1.3, 1.0], [1.24, 1.6], [1.16, 1.9], [1.32, 2.05], [1.2, 2.15]] : [[0, 0], [1.0, 0.05], [1.25, 0.4], [1.3, 1.0], [1.2, 1.6], [0.9, 2.0], [0.42, 2.3], [0.28, 2.45], [0.46, 2.7], [0.26, 2.82], [0, 2.86]];
    const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 18), m = new THREE.Mesh(geo, (M.sack ||= {})[label] ||= c3Prop('#ffffff', { map: hiTexBurlap(label, ink), rough: 0.95 }));
    m.rotation.y = Math.PI; m.scale.setScalar(k); m.position.set(x, 0.6, z); add(m);
    if (open) { const hp = new THREE.Mesh(new THREE.SphereGeometry(1.16, 14, 8, 0, TAU, 0, Math.PI / 2), heap); hp.scale.set(k, 0.45 * k, k); hp.position.set(x, 0.6 + 2.0 * k, z); add(hp); } return m; };
  sack(-1.8, -0.6, 'PEBER', '#2a2228', true, M.pepper); sack(0.9, -0.7, 'KANEL', '#7a2a12', true, M.cinn); sack(-0.6, 0.85, 'PEBER', '#2a2228', false, null, 0.85); sack(2.2, 0.8, 'KANEL', '#7a2a12', false, null, 0.9);
  // cinnamon stick bundles (sticking out of the open KANEL sack + one lying on the bed)
  const bundle = (x, y, z, rx, rz) => { const b = new THREE.Group(); b.position.set(x, y, z); b.rotation.set(rx, 0, rz); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, r = i ? 0.24 : 0; b.add(hiCyl(0.11, 0.11, 2.6, M.stick, Math.cos(a) * r, 0, Math.sin(a) * r, 6)); } b.add(hiCyl(0.38, 0.38, 0.2, M.string, 0, 0.2, 0, 10)); g.add(b); return b; };
  bundle(0.6, 3.5, -0.6, 0.2, 0.3); bundle(1.3, 3.4, -0.9, -0.15, -0.25); bundle(3.0, 0.95, -1.0, 0, Math.PI / 2);
  // brass scales on the rear left corner + jars on the front
  const sc = new THREE.Group(); sc.position.set(-2.3, 0.6, 1.1); g.add(sc); sc.add(hiCyl(0.5, 0.6, 0.3, M.brass, 0, 0.15, 0, 12)); sc.add(hiCyl(0.09, 0.09, 2.8, M.brass, 0, 1.6, 0, 8));
  const beam = new THREE.Group(); beam.position.y = 3.0; sc.add(beam); beam.add(hiBox(2.6, 0.12, 0.12, M.brass, 0, 0, 0)); g.userData.beam = beam;
  for (const sx of [-1, 1]) { const pan = new THREE.Group(); pan.position.set(sx * 1.25, 0, 0); beam.add(pan); for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; pan.add(hiTube(V3(0, 0, 0), V3(Math.cos(a) * 0.5, -1.2, Math.sin(a) * 0.5), 0.025, M.brass, 4)); }
    pan.add(hiCyl(0.6, 0.4, 0.14, M.brass, 0, -1.25, 0, 14)); if (sx < 0) pan.add(hiSph(0.36, M.pepper, 0, -1.1, 0, 10, 6)); }
  for (let i = 0; i < 4; i++) { const jx = 3.0 - (i % 2) * 0.0, jz = 1.3 - i * 0.55 + 0.4; if (i > 1) continue; }
  [['#e8b030', 3.05, 1.3], ['#5a2a1a', 3.1, 0.35], ['#c86a2a', 2.6, 1.45]].forEach(([c, jx, jz]) => { add(hiCyl(0.42, 0.42, 1.1, M.jar, jx, 1.15, jz, 12)); add(hiCyl(0.36, 0.36, 0.8, (M.jc ||= {})[c] ||= c3Prop(c, { rough: 0.7 }), jx, 1.05, jz, 10)); add(hiCyl(0.46, 0.46, 0.25, M.cork, jx, 1.8, jz, 12)); });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; });
  return g; }
// a goose (white) or hen (brown): body, neck, head, beak, legs; origin on the ground, facing +x
function hiBird(M, hen) { const g = new THREE.Group(), body = hen ? M.hen : M.goose, k = hen ? 0.7 : 1;
  const b = hiSph(1.0 * k, body, 0, 1.6 * k, 0, 12, 8); b.scale.set(1.4, 0.95, 0.9); g.add(b); const tl = hiSph(0.5 * k, body, -1.25 * k, 1.9 * k, 0, 8, 6); tl.scale.set(1.2, 0.6, 0.7); g.add(tl);
  const neck = new THREE.Group(); neck.position.set(1.0 * k, 2.0 * k, 0); g.add(neck); neck.add(hiCyl(0.3 * k, 0.38 * k, (hen ? 0.8 : 1.6) * k, body, 0.15 * k, (hen ? 0.4 : 0.8) * k, 0, 8)); g.userData.neck = neck;
  neck.add(hiSph(0.42 * k, body, 0.25 * k, (hen ? 0.9 : 1.7) * k, 0, 10, 8)); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.16 * k, 0.6 * k, 6), M.beak); bk.rotation.z = -Math.PI / 2; bk.position.set(0.85 * k, (hen ? 0.85 : 1.62) * k, 0); neck.add(bk);
  for (const s of [-1, 1]) neck.add(hiSph(0.07 * k, M.eye, 0.45 * k, (hen ? 1.0 : 1.8) * k, s * 0.33 * k, 6, 4));
  if (hen) { const cm = hiSph(0.2, M.comb, 0.2, 1.25, 0, 6, 4); cm.scale.set(1.4, 1, 0.5); neck.add(cm); }
  g.userData.legs = [-1, 1].map((s) => { const l = hiCyl(0.07, 0.07, 0.9 * k, M.beak, 0, 0.45 * k, s * 0.3 * k, 5); g.add(l); return l; });
  g.traverse((m) => { if (m.isMesh) m.castShadow = true; }); return g; }

function hiBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.4, 6000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#5a78d0', ambI: 0.22, sky: '#7a9ae0', ground: '#b08a5a', key: '#ffae62', keyI: 2.7, keyP: [-200, 130, 210], rim: '#ff9a50', rimI: 0.3, rimP: [150, 60, -200] });
  s.key.userData.I = 2.7; s.key.userData.dir = V3(-0.62, 0.42, 0.66).normalize();
  const M = Object.assign(HI_M, { thatch: c3Prop('#ffffff', { map: hiTexThatch(), rough: 0.95 }), thatchD: c3Prop('#8a6a3a', { rough: 0.95 }), tile: c3Prop('#ffffff', { map: hiTexTiles(), rough: 0.75 }), tileD: c3Prop('#7a2a1a', { rough: 0.7 }),
    brick: c3Prop('#ffffff', { map: hiRep(hiTexBrick(false), 1, 2), rough: 0.9 }), stone: c3Prop('#b8ae9a', { rough: 0.9 }), wood: c3Prop('#ffffff', { map: hiTexWood('#b07a42'), rough: 0.8 }), woodD: c3Prop('#5a3a22', { rough: 0.8 }),
    barrel: c3Prop('#ffffff', { map: hiTexWood('#9a6232'), rough: 0.8 }), iron: c3Prop('#3a3a42', { metal: 0.4, rough: 0.5 }), glass: c3Prop('#2e3e5e', { rough: 0.1, env: 1.6 }),
    cabbage: c3Prop('#6aaa48', { rough: 0.7 }), apple: c3Prop('#d8302a', { rough: 0.4 }), bread: c3Prop('#c8803a', { rough: 0.7 }), fish: c3Prop('#a8b8c8', { rough: 0.3, metal: 0.3 }), basket: c3Prop('#b8884a', { rough: 0.9 }),
    cartW: c3Prop('#ffffff', { map: hiTexWood('#b8803e'), rough: 0.75 }), cartD: c3Prop('#6a3e20', { rough: 0.7 }), brass: c3Prop('#e0b04a', { metal: 0.75, rough: 0.28, env: 1.4 }), pepper: c3Prop('#3a3230', { rough: 0.95 }), cinn: c3Prop('#b8743a', { rough: 0.95 }),
    stick: c3Prop('#9a5a2a', { rough: 0.8 }), string: c3Prop('#e8dcc0', { rough: 0.9 }), jar: c3Prop('#c8dce0', { rough: 0.1, env: 1.8 }), cork: c3Prop('#a07a4a', { rough: 0.9 }),
    goose: c3Prop('#f4f0e6', { rough: 0.7 }), hen: c3Prop('#a8602a', { rough: 0.8 }), beak: c3Prop('#f29a2a', { rough: 0.5 }), eye: c3Prop('#1a1a1a', { rough: 0.3 }), comb: c3Prop('#d8282a', { rough: 0.6 }),
    copper: c3Prop('#5ab89a', { rough: 0.45, metal: 0.35, env: 1.3 }), gold: c3Prop('#f2c04a', { metal: 0.75, rough: 0.28 }), dark: c3Prop('#2a2420', { rough: 0.7 }) });
  const K = new THREE.Group(), KF = new THREE.Group();   // K: town (baked, casts), KF: far fields / hills / windmill (baked, no shadows)
  s.sky = c3SkyDome(scene, { paint: true, zenith: '#2f6ad8', mid: '#86b6ec', midH: 0.12, horizon: '#ffdcb0', glow: '#ffb060', glowK: 0.5, ground: '#a8b070', sun: [-0.62, 0.2, 0.76], clouds: 42, cloudScale: 1.1, seed: 21, cloudLit: '#fff0d8', cloudShade: '#9aa2dc', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#e6dcd0', 320, 2200);
  // ---- ground: grass everywhere, the dirt road, the cobbled square, fields west
  scene.add(pl(6000, 6000, c3Prop('#ffffff', { map: hiRep(hiTexGrass(), 200, 200), rough: 0.95 }), 0, -0.05, 0, 0, -Math.PI / 2));
  { const r = pl(420, 15, c3Prop('#ffffff', { map: hiRep(hiTexDirt(), 18, 1), rough: 0.95 }), -208, 0.02, 2, 0, -Math.PI / 2); r.userData.noCast = true; scene.add(r); }
  { const c = pl(100, 92, c3Prop('#ffffff', { map: hiRep(hiTexCobble(), 12, 11), rough: 0.85 }), 38, 0.04, -9, 0, -Math.PI / 2); c.userData.noCast = true; scene.add(c); }
  [['#e2c45a', '#d8b448', 1, -150, -60, 160, 90], ['#8ab04a', '#7aa040', 2, -150, 64, 160, 100], ['#d8a848', '#e8c060', 3, -330, -70, 180, 110], ['#9ab858', '#86a84a', 4, -330, 70, 180, 110], ['#e8cc6a', '#d4b450', 5, -120, -170, 220, 100]].forEach(([a, b, sd, x, z, w, d]) => {
    const f = pl(w, d, c3Prop('#ffffff', { map: hiRep(hiTexField(a, b, sd), 2, 2), rough: 0.95 }), x, 0.03, z, 0, -Math.PI / 2); f.rotation.z = (sd % 2 ? 0.08 : -0.06); f.userData.noCast = true; scene.add(f); });
  // fences along the road, haystacks, trees, a windmill, a farmhouse
  { const fw = M.woodD; for (const fz of [-6.5, 10.5]) for (let x = -230; x < -20; x += 6) { if (fz > 0 && x > -40) continue; K.add(hiBox(0.4, 3.2, 0.4, fw, x, 1.6, fz)); K.add(hiBox(6.1, 0.3, 0.2, fw, x + 3, 2.6, fz)); K.add(hiBox(6.1, 0.3, 0.2, fw, x + 3, 1.4, fz)); } }
  for (const [x, z, k] of [[-80, -30, 1], [-96, -40, 0.8], [-110, 40, 1.1], [-140, -90, 1], [-70, 46, 0.9], [-180, 30, 1.2]]) { const hs = new THREE.Mesh(new THREE.SphereGeometry(4 * k, 14, 10, 0, TAU, 0, Math.PI / 2), M.thatch); hs.scale.y = 1.3; hs.position.set(x, 0, z); K.add(hs); }
  for (const [x, z, sc, sd] of [[-46, -26, 3.4, 1], [-58, 24, 3.8, 2], [-100, -16, 3.2, 3], [-130, 22, 4.0, 4], [-36, 54, 3.6, 5], [-12, 48, 3.0, 6], [96, -70, 4.2, 7], [104, 20, 4.0, 8], [-160, -40, 3.6, 9], [-210, 18, 4.2, 10], [-66, -60, 4.4, 11], [20, 60, 3.8, 12]]) { const tr = c3LeafTree(sc, sd, sd % 2 ? '#4f8a3a' : '#5e9a40'); tr.position.set(x, 0, z); K.add(tr); }
  { const g = hiAt(new THREE.Group(), -150, 0, -110, 0.5); g.add(hiCyl(7, 9.5, 26, c3Prop('#f2ead8', { rough: 0.9 }), 0, 13, 0, 12)); const cap = new THREE.Mesh(new THREE.ConeGeometry(8.4, 9, 12), M.thatch); cap.position.y = 30.5; g.add(cap);
    s.mill = new THREE.Group(); s.mill.position.set(0, 27, 8.6); g.add(s.mill); s.mill.add(hiCyl(0.8, 0.8, 1.6, M.woodD, 0, 0, 0, 8)); for (let i = 0; i < 4; i++) { const a = new THREE.Group(); a.rotation.z = i * Math.PI / 2; s.mill.add(a); a.add(hiBox(0.5, 20, 0.4, M.woodD, 0, 10, 0.4)); a.add(hiBox(3.2, 16, 0.15, c3Prop('#f6f0e2', { rough: 0.9 }), 1.9, 11, 0.5)); }
    s.millG = g; scene.add(g); }
  hiHouse(KF, -120, -60, 0.3, { w: 20, d: 12, h: 11, floors: 1, bays: 4, infill: '#f2e6c8', roof: 'thatch', door: 1, shutter: '#2f6a8a' }, 90);
  hiHouse(KF, -190, 70, -0.4, { w: 18, d: 12, h: 11, floors: 1, bays: 3, infill: '#e8b85a', roof: 'thatch', door: 1, shutter: '#a8402a' }, 91);
  for (let i = 0; i < 7; i++) { const hl = new THREE.Mesh(new THREE.SphereGeometry(600, 24, 8, 0, TAU, 0, Math.PI / 2), c3Prop(['#7aa058', '#8aac60', '#6e9450'][i % 3], { rough: 1 })); hl.scale.set(1.3, 0.1 + (i % 3) * 0.03, 0.8); hl.position.set(-1900 + i * 600, -12, i % 2 ? -1500 : 1500); KF.add(hl); }
  for (let i = 0; i < 5; i++) { const hl = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#86a868', { rough: 1 })); hl.scale.set(1.2, 0.09, 1); hl.position.set(-1500, -12, -1200 + i * 600); KF.add(hl); }
  // ---- the town: corner houses along the road (fronts z = -12), the square's rows, behind-rows for depth
  const INF = ['#f2e2be', '#e8b84a', '#c8483a', '#f4ecd8', '#e89a6a', '#d8c070', '#b84a3a', '#f0d8a8', '#ecc8a0', '#a8c0a0'], SH = ['#2f6a8a', '#3a7a4a', '#a8402a', '#2a4a7a', '#c88a2a'];
  let hs = 0; const HS = (x, z, ry, o) => hiHouse(K, x, z, ry, Object.assign({ floors: 2, infill: INF[hs % INF.length], shutter: SH[hs % SH.length], roof: hs % 3 === 1 ? 'tile' : 'thatch', dormer: hs % 4 === 2 }, o), hs++);
  HS(-12, -12, 0, { w: 16, d: 13, h: 21.2, bays: 3, door: 0, hole: 1, gable: true, roof: 'tile', infill: '#f4e4c0', shutter: '#3a7a4a' });   // the girl's house (window x -14..-10, y 13.4..18.4)
  HS(-30, -12, 0, { w: 18, d: 13, h: 12, floors: 1, bays: 4, door: 2, roof: 'thatch' }); HS(-48, -13, 0.06, { w: 16, d: 12, h: 11.5, floors: 1, bays: 3, door: 1, gable: true }); HS(-66, -15, 0.12, { w: 14, d: 12, h: 11, floors: 1, bays: 3, door: 1 });
  HS(-30, 26, Math.PI, { w: 14, d: 12, h: 11, floors: 1, bays: 3, door: 1, gable: true, roof: 'thatch' });
  // west row of the square (fronts at x = -4, facing +x)
  HS(-4, -22, Math.PI / 2, { w: 14, d: 13, h: 20, bays: 3, door: 1, roof: 'tile' }); HS(-4, -38, Math.PI / 2, { w: 16, d: 13, h: 21, bays: 3, door: 1, gable: true });
  // north row (fronts at z = -50)
  { let x = 2; const W0 = [15, 13, 17, 14, 16, 13, 15]; for (let i = 0; i < W0.length; i++) { const w = W0[i]; HS(x + w / 2, -50 - (i % 2) * 0.8, 0, { w, d: 14, h: i % 3 === 0 ? 21 : i % 3 === 1 ? 13 : 22, floors: i % 3 === 1 ? 1 : 2, bays: w > 14 ? 3 : 2, door: i % 2, gable: i % 2 === 0 }); x += w + 0.3; } }
  // east row (fronts at x = 84 facing -x) and south-east row (z = 30 facing -z)
  { let z = -44; const W0 = [14, 16, 13, 15, 16]; for (let i = 0; i < W0.length; i++) { const w = W0[i]; HS(84 + (i % 2) * 0.6, z + w / 2, -Math.PI / 2, { w, d: 14, h: i % 2 ? 13 : 21, floors: i % 2 ? 1 : 2, bays: 3, door: 1, gable: i % 2 === 1 }); z += w + 0.3; } }
  { let x = 32; const W0 = [15, 14, 17]; for (let i = 0; i < W0.length; i++) { const w = W0[i]; HS(x + w / 2, 30, Math.PI, { w, d: 14, h: i === 1 ? 13 : 21, floors: i === 1 ? 1 : 2, bays: 3, door: 1, gable: i !== 1 }); x += w + 0.3; } }
  // second rows behind (roofs over roofs)
  for (let i = 0; i < 6; i++) HS(8 + i * 15 + (i > 2 ? 22 : 0), -70, 0, { w: 14, d: 12, h: 13 + (i % 2) * 8, floors: i % 2 ? 2 : 1, bays: 2, door: 0, gable: i % 2 === 1, chim: i % 2 === 0 });
  for (let i = 0; i < 4; i++) HS(100, -40 + i * 18, -Math.PI / 2, { w: 16, d: 12, h: 13 + (i % 2) * 7, floors: 1 + (i % 2), bays: 3, door: 1, gable: i % 2 === 0 });
  for (let i = 0; i < 4; i++) HS(-22, -30 - i * 16, Math.PI / 2, { w: 15, d: 12, h: 12 + (i % 2) * 8, floors: 1 + (i % 2), bays: 3, door: 1, gable: i % 2 === 1 });
  // ---- the church behind the north row: nave, tower with clock + belfry, tall copper spire, gold ball + cross
  { const g = hiAt(new THREE.Group(), 44, 0, -80, 0), bm = c3Prop('#ffffff', { map: hiRep(hiTexBrick(false), 3, 6), rough: 0.9 }), cw = c3Prop('#ffffff', { map: hiTexChurch(), rough: 0.9 });
    g.add(hiBox(24, 24, 46, bm, 0, 12, -30)); for (const sx of [-1, 1]) g.add(pl(44, 22, cw, sx * 12.05, 11, -30, sx * Math.PI / 2));
    { const S = new THREE.Shape(); S.moveTo(-12, 0); S.lineTo(12, 0); S.lineTo(0, 15); S.closePath(); const pr = new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: 44, bevelEnabled: false }), bm); pr.position.set(0, 24, -52); g.add(pr);
      for (const sx of [-1, 1]) { const sl = hiBox(20.6, 0.7, 48, M.tileD, sx * 6.3, 31.6, -30); sl.rotation.z = -sx * 0.9; g.add(sl); } }
    g.add(hiBox(17, 52, 17, bm, 0, 26, 0)); g.add(hiBox(18.4, 1.4, 18.4, M.stone, 0, 40, 0)); g.add(hiBox(18.4, 1.6, 18.4, M.stone, 0, 52.4, 0));
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, nx = Math.sin(a), nz = Math.cos(a);
      const ck = new THREE.Mesh(new THREE.CircleGeometry(3.6, 32), c3Prop('#ffffff', { map: hiTexClock(), rough: 0.6 })); ck.position.set(nx * 8.56, 35, nz * 8.56); ck.rotation.y = a; g.add(ck);
      for (const o of [-3.2, 3.2]) { const lv = hiBox(2.2, 6, 0.4, M.dark, nx * 8.6 + nz * o, 46, nz * 8.6 - nx * o); lv.rotation.y = a; g.add(lv); const ar = hiCyl(1.1, 1.1, 0.4, M.dark, nx * 8.6 + nz * o, 49, nz * 8.6 - nx * o, 12); ar.rotation.x = Math.PI / 2; ar.rotation.z = a; g.add(ar); } }
    const sp = new THREE.Mesh(new THREE.ConeGeometry(12.0, 62, 8), M.copper); sp.position.y = 53.2 + 31; sp.rotation.y = Math.PI / 8; g.add(sp);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const sm = new THREE.Mesh(new THREE.ConeGeometry(1.6, 8, 6), M.copper); sm.position.set(sx * 8, 57, sz * 8); g.add(sm); }
    g.add(hiSph(1.4, M.gold, 0, 116, 0)); g.add(hiBox(0.5, 6, 0.5, M.gold, 0, 120, 0)); g.add(hiBox(3.2, 0.5, 0.5, M.gold, 0, 121, 0));
    g.add(hiBox(6, 9, 1, c3Prop('#5a3a26', { rough: 0.8 }), 0, 4.5, 8.6)); K.add(g); }
  // ---- the market: stalls, the well, barrels, crates, a Dannebrog
  hiStall(K, 26, -24, 0.1, '#c83a2a', 'bread', 1); hiStall(K, 44, -30, -0.05, '#2f6aa8', 'veg', 2); hiStall(K, 62, -22, -0.15, '#e8a020', 'fish', 3); hiStall(K, 66, 6, -1.4, '#3a8a4a', 'veg', 4);
  s.carpStall = hiStall(K, 13, -9, 0.35, '#8a5a2a', 'wood', 5);
  { const g = hiAt(new THREE.Group(), 36, 0, -6, 0); g.add(hiCyl(3.6, 3.8, 3.4, M.stone, 0, 1.7, 0, 18)); g.add(hiCyl(3.9, 3.9, 0.5, c3Prop('#a89e8a', { rough: 0.9 }), 0, 3.55, 0, 18)); g.add(hiCyl(2.9, 2.9, 0.2, c3Prop('#2a3a4a', { rough: 0.1 }), 0, 3.0, 0, 18));
    for (const sx of [-1, 1]) g.add(hiBox(0.5, 8, 0.5, M.woodD, sx * 3.3, 6.4, 0)); { const ax = hiCyl(0.2, 0.2, 7, M.woodD, 0, 9.4, 0, 8); ax.rotation.z = Math.PI / 2; g.add(ax); }
    const S = new THREE.Shape(); S.moveTo(-3, 0); S.lineTo(3, 0); S.lineTo(0, 2.6); S.closePath(); const rf = new THREE.Mesh(new THREE.ExtrudeGeometry(S, { depth: 9.6, bevelEnabled: false }), M.tile); rf.rotation.y = Math.PI / 2; rf.position.set(-4.8, 10.2, 0); g.add(rf);
    g.add(hiCyl(0.7, 0.6, 1.1, M.barrel, 1.2, 6.6, 0, 10)); K.add(g); }
  { const R = RNG('himk'); for (const [x, z] of [[20, -16], [33, -20], [52, -14], [58, -6], [72, -10], [28, 8], [48, 14], [70, 18], [18, 4]]) { const n = R.i(1, 3); for (let i = 0; i < n; i++) { const bx = x + R.r(-2, 2), bz = z + R.r(-2, 2);
      if (R.f() < 0.5) { K.add(hiCyl(1.1, 1.1, 2.6, M.barrel, bx, 1.3, bz, 12)); K.add(hiCyl(1.15, 1.15, 0.22, M.iron, bx, 0.6, bz, 12)); K.add(hiCyl(1.15, 1.15, 0.22, M.iron, bx, 2.0, bz, 12)); }
      else { const c = hiBox(2.2, 1.6, 1.8, M.wood, bx, 0.8, bz); c.rotation.y = R.f(); K.add(c); K.add(hiSph(0.55, R.f() < 0.5 ? M.apple : M.cabbage, bx, 1.9, bz)); } } } }
  { const fp = hiCyl(0.25, 0.3, 26, M.woodD, 76, 13, -38, 8); K.add(fp); s.flag = new THREE.Mesh(new THREE.PlaneGeometry(8, 5.4, 16, 3), (() => { const m = c3Prop('#ffffff', { rough: 0.8, map: tex((q, w, h) => { q.fillStyle = '#c8102e'; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.fillRect(w * 0.32, 0, w * 0.12, h); q.fillRect(0, h * 0.44, w, h * 0.12); }, 256, 170) }); m.side = THREE.DoubleSide; return m; })());
    s.flag.userData.base = Float32Array.from(s.flag.geometry.attributes.position.array); s.flag.position.set(80.2, 23, -38); s.flag.userData.keep = true; scene.add(s.flag); }
  // hanging shop signs (bracket + board) on a few facades
  for (const [x, z, ry, c] of [[-6, -10.6, 0, '#c8a040'], [20, -48.6, 0, '#a83a2a'], [82.6, -10, -Math.PI / 2, '#2f6a8a']]) { const g = hiAt(new THREE.Group(), x, 12, z, ry); g.add(hiBox(0.2, 0.2, 3.4, M.iron, 0, 0, 1.6)); g.add(hiBox(0.15, 2.4, 2.2, c3Prop(c, { rough: 0.6 }), 0, -1.5, 2.2)); K.add(g); }
  // ---- the signpost at the square entrance (faces +z): post, three arrow boards
  s.sign = hiAt(new THREE.Group(), 11, 0, 12, 0); scene.add(s.sign); s.sign.add(hiBox(0.7, 16.6, 0.7, M.woodD, 0, 8.3, 0)); s.sign.add(hiBox(1.2, 0.6, 1.2, M.woodD, 0, 16.8, 0));
  s.arrows = [['RIBE', -1, 14.6], ['ODENSE', 1, 12.5], ['AARHUS', 1, 10.4]].map(([txt, dir, y], i) => { const L = 5.6, Hh = 1.5, S = new THREE.Shape(); S.moveTo(0, 0); S.lineTo(L - 1.1, 0); S.lineTo(L, Hh / 2); S.lineTo(L - 1.1, Hh); S.lineTo(0, Hh); S.closePath();
    const t = hiTexArrow(txt); t.repeat.set(1 / L, 1 / Hh); const geo = new THREE.ExtrudeGeometry(S, { depth: 0.3, bevelEnabled: false }), m = new THREE.Mesh(geo, [c3Prop('#ffffff', { map: t, rough: 0.8 }), M.woodD]);
    const pv = new THREE.Group(); pv.position.set(0, y, 0.38); s.sign.add(pv); m.position.set(dir > 0 ? -0.6 : 0.6, -Hh / 2, 0); if (dir < 0) { m.scale.x = -1; m.position.z = 0.3; } pv.add(m);
    if (dir < 0) { const fl = new THREE.Mesh(new THREE.PlaneGeometry(L - 1.3, Hh * 0.9), c3Prop('#ffffff', { map: hiTexArrow(txt), rough: 0.8 })); fl.position.set(-(L - 1.1) / 2 - 0.25, 0, 0.62); pv.add(fl); }
    pv.rotation.z = (i - 1) * 0.04; return pv; });
  // ---- geese + hens round the well
  s.birds = [[false, 0], [false, 1], [false, 2], [true, 3], [true, 4]].map(([hen, i]) => { const b = hiBird(M, hen); scene.add(b); b.userData.i = i; return b; });
  KF.add(hiBox(0.1, 0.1, 0.1, M.stone, 0, -10, 0));
  scene.add(hiBake(K)); scene.add(hiBake(KF, { noCast: true, ao: false }));
  // ---- the girl's window: dark room behind, two shutters (hinged at x -14 / -10)
  scene.add(pl(5.0, 5.6, c3Prop('#3a2626', { rough: 0.95 }), -12, 15.9, -13.4)); scene.add(hiBox(4.8, 0.4, 1.2, M.stone, -12, 13.2, -11.6));
  { const sm = c3Prop('#ffffff', { map: tex((q, w, h) => { q.fillStyle = '#3a7a4a'; q.fillRect(0, 0, w, h); q.fillStyle = 'rgba(0,0,0,0.22)'; for (let i = 1; i < 4; i++) q.fillRect(i * w / 4, 0, 3, h); q.strokeStyle = '#2a5a36'; q.lineWidth = 10; q.beginPath(); q.moveTo(8, h - 8); q.lineTo(w - 8, 8); q.stroke(); q.strokeRect(5, 5, w - 10, h - 10); }, 128, 160), rough: 0.8 });
    s.shut = [-1, 1].map((sx) => { const hg = new THREE.Group(); hg.position.set(-12 + sx * 2, 15.9, -11.84); scene.add(hg); const pn = hiBox(2.0, 5.1, 0.22, sm, -sx * 1.0, 0, 0); hg.add(pn); hg.userData.sx = sx; return hg; }); }
  // ---- the cart (moves) + FOCUS props
  s.cart = hiCartBuild(M); s.cart.scale.setScalar(HI_CK); scene.add(s.cart);
  s.board = new THREE.Group(); { const bd = hiBox(6.2, 1.6, 0.22, M.cartW, 0, 0, 0); s.board.add(bd); const f = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.45), c3Prop('#ffffff', { map: hiTexBoard(), rough: 0.7 })); f.position.z = 0.12; s.board.add(f); } scene.add(s.board);
  s.hammer = new THREE.Group(); s.hammer.add(hiCyl(0.11, 0.13, 2.4, M.wood, 0, 1.1, 0, 8)); s.hammer.add(hiBox(1.2, 0.42, 0.42, M.iron, 0.2, 2.3, 0)); scene.add(s.hammer);
  s.pouch = new THREE.Group(); { const pb = hiSph(0.55, (M.sack.KANEL), 0, 0.45, 0, 10, 8); pb.scale.set(1, 1.2, 1); s.pouch.add(pb); s.pouch.add(hiCyl(0.18, 0.28, 0.4, M.string, 0, 1.15, 0, 8)); } scene.add(s.pouch);
  s.heartT = texHeart(); s.hearts = [0, 1, 2].map(() => spritePlane(scene, s.heartT, 1.6, 1.6, 12));
  s.puffT = tex((q, w, h) => { q.clearRect(0, 0, w, h); const R = RNG('hipuff'); for (let i = 0; i < 14; i++) { const x = w / 2 + R.n(w * 0.2), y = h / 2 + R.n(h * 0.14), r = R.r(w * 0.1, w * 0.22), gr = q.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(226,204,170,0.9)'); gr.addColorStop(0.6, 'rgba(214,190,152,0.5)'); gr.addColorStop(1, 'rgba(210,186,150,0)'); q.fillStyle = gr; q.beginPath(); q.arc(x, y, r, 0, TAU); q.fill(); } }, 256, 256);
  s.puff = spritePlane(scene, s.puffT, 3, 3, 11); s.puff.material.toneMapped = true;
  for (const o of [s.board, s.hammer, s.pouch]) { c3Layer(o, C3.L_FOCUS); o.visible = false; o.traverse((m) => { if (m.isMesh) m.userData.noCast = true; }); }
  for (const k of ['pepperman', 'HIgirl', 'HIham', 'HIwife', 'HImaid', 'HIfarm', 'HIkid', 'HIold', 'HIbaker']) toonPerson(s, k);
  c3Env(scene, { top: '#9ab8f0', mid: '#b8bcd4', bot: '#6a5a44' }); c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.55, scale: 0.3, inkSet: false, grimeH: 4, bounce: ['#9cb2e2', '#c8a070', 0.12] });
  // ---- depth-only occluders on the FOCUS layer (after the look pass): the cart bed + sacks, the signpost, the girl's window wall + shutters,
  //      the bread stall counter (the baker stands behind it)
  const OM = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); OM.userData.c3keep = true;
  const occ = (par, w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), OM); m.position.set(x, y, z); Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); par.add(m); return m; };
  occ(s.cart, 6.8, 3.4, 3.7, 0.3, 1.5, 0); occ(s.cart, 2.8, 1.6, 1.4, 0.9, 3.4, -0.7); occ(s.cart, 2.8, 1.6, 1.4, -1.8, 3.4, -0.6);
  occ(s.sign, 0.7, 16.6, 0.7, 0, 8.3, 0); s.arrows.forEach((pv, i) => occ(pv, 5.0, 1.4, 0.3, i ? 2.2 : -2.2, 0, 0.15));
  occ(scene, 10, 7.4, 0.6, -12, 9.7, -11.7); occ(scene, 3, 7, 0.6, -15.5, 16.4, -11.7); occ(scene, 3, 7, 0.6, -8.5, 16.4, -11.7); occ(scene, 10, 3, 0.6, -12, 20.0, -11.7);
  s.shut.forEach((hg) => occ(hg, 2.0, 5.1, 0.24, -hg.userData.sx * 1.0, 0, 0));
  { const st = new THREE.Group(); hiAt(st, 26, 0, -24, 0.1); scene.add(st); occ(st, 8.6, 3.8, 0.4, 0, 1.9, 2.1); }
  return s;
}
const HI_get = () => HI.s ||= hiBuild();
SETS.history = HI_get;

// ---- the camera path (absolute s): 25.68 whip in → 36.14 whip out
CAMSEQ.history = [
  [25.40, [-8, 54, 40], [40, 68, -80], 44, -8],            // phantom: the whip-in arrives moving
  // h01: crane DOWN from the spire over the roofs into the market (dutch breathing)
  [25.68, [-4, 50, 38], [41, 64, -80], 44, -6],
  [27.00, [16, 40, 38], [36, 38, -66], 42, 4],                 // 'tradition': roofs + spire
  [28.10, [22, 26, 42], [22, 8, -14], 40, -3],                // over the roofs into the market: townsfolk bustling
  // h02: truck left onto the road, lateral track with the cart (low), swing to the signpost on 'town'
  [29.06, [-21, 10, 40], [-19.6, 6.0, 2], 46, 2],
  [30.00, [-12.5, 8, 38], [-11.5, 6.0, 2], 45, -2],
  [30.88, [5, 10.5, 41], [11.2, 12.6, 12], 44, 3],               // 'town': the signpost whole
  [31.34, [8, 12, 41], [11.2, 12.3, 12], 44, -2],             // 'town'
  // h03: orbit round to him at the cart, push on him on 'busy', tilt up to the girl on 'settled down'
  [31.80, [-1, 11, 29], [-7, 7, 1], 40, -3],
  [32.10, [-5, 9.5, 21], [-8.4, 7.6, 1], 38, 4],                  // 'busy'
  [32.74, [4, 12, 38], [-10, 11.0, -6], 42, -2],              // 'settled': the girl at the window
  [33.30, [-3, 12, 27], [-8, 9, 0], 42, 3],
  // h04: orbit right + pull back on the pointing townsfolk, crane up to a 3/4 top view of the board on 'stuck'
  [33.90, [2, 12, 30], [-6.5, 7, 0.5], 46, -2],
  [34.56, [-12.6, 10, 26.5], [-10.4, 8.4, 0.2], 47, -5],                  // 'pepper men'
  [35.20, [8, 20, 31], [-3, 5.5, 3], 44, 0],
  [35.60, [5, 24, 28], [-1.8, 5.0, 3.4], 48, 4],                // 'stuck': the board whole + him
  [36.14, [3, 27, 25], [-1.8, 4.8, 3.2], 48, 1],
  [36.40, [2, 29, 23], [-1.8, 4.6, 3.0], 48, -2],               // phantom: the whip-out leaves moving
];

// ---- state
function hiShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; k.intensity = (k.userData.I ?? 2.3) * (C3_SHADOW.key ?? 1); if (!k.castShadow) return;
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(k.userData.dir, 200); }
// facing from look keys [[t, target]] (target = [x, z] world point re-aimed every frame, or a number); turns snap in 0.22 s
function hiLookK(s, K, t, x, z) { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
  const f = (k) => typeof k[1] === 'number' ? k[1] : toonLookFacing(s.cam, x, z, k[1][0] - x, k[1][1] - z), b = f(K[i]);
  if (i === 0) return clamp(b, -1.3, 1.3); const a = f(K[i - 1]), u = clamp((t - K[i][0]) / 0.22); return clamp(a + (b - a) * (1 - (1 - u) ** 3), -1.3, 1.3); }
// a path of [[t, x, z], ...]: position, velocity, distance walked, and the 'stop' ease of the last steps of each leg
function hiPath(P, t) { let d = 0;
  if (t <= P[0][0]) return { x: P[0][1], z: P[0][2], mv: false, d: 0 };
  for (let i = 0; i < P.length - 1; i++) { const [t0, x0, z0] = P[i], [t1, x1, z1] = P[i + 1], L = Math.hypot(x1 - x0, z1 - z0);
    if (t < t1) { const u = (t - t0) / (t1 - t0); return { x: lerp(x0, x1, u), z: lerp(z0, z1, u), vx: x1 - x0, vz: z1 - z0, mv: L > 0.01, d: d + L * u, stop: clamp((t - (t1 - 0.28)) / 0.28) }; }
    d += L; }
  const e = P[P.length - 1]; return { x: e[1], z: e[2], mv: false, d }; }
function hiFolk(s, who, t, F) { const q = hiPath(F.path, t), o = { expr: F.expr, hand: F.hand, fx: F.fx ? keyAt(F.fx, t) : undefined, gaze: F.gaze ? keyAt(F.gaze, t) : undefined, lean: F.lean ? hiKN(F.lean, t) : 0 };
  if (q.mv) Object.assign(o, { mode: 'walk', phase: q.d / (F.stride ?? 4.2), stride: F.stride ?? 4.2, stop: q.stop, facing: toonLookFacing(s.cam, q.x, q.z, q.vx, q.vz) });
  else o.facing = hiLookK(s, F.look, t, q.x, q.z);
  pose(s, who, t, q.x, q.z, o); return q; }

// ---- the pepper man: pushes the cart in along the road (z = 2), stops at 31.30, scampers round behind it and sells, gets labelled
const HI_XS = -8.6, HI_CK = 1.4, HI_CL = 5.2 * HI_CK;   // his x when the cart stops; cart scale; axle -> crossbar
const hiPepX = (t) => t < 30.75 ? HI_XS - 2.3 - 8.4 * (30.75 - t) : t < 31.30 ? HI_XS - 2.3 * (1 - (t - 30.75) / 0.55) ** 2 : HI_XS;
const HI_PUSH = { h: [0.62, 0.62], pole: [1, 0.2], front: true, hand: 'grip' }, HI_PUSH2 = { h: [0.5, 0.66], pole: [1, 0.2], front: true, hand: 'grip' };
const HI_SELLP = [[-0.6, -1.5], [0.0, -1.5]];   // behind the cart (bed x -1.2..5.4, z 0.2..3.8)
const HI_OUTR = { h: [0.78, 0.18], pole: [0.6, 1], hand: 'grip' }, HI_DIPR = { h: [-0.18, 0.62], pole: [1, 0.5], front: true, hand: 'grip' }, HI_OUTL = { h: [0.74, 0.22], pole: [0.6, 1], hand: 'open' }, HI_SCALE = { h: [0.0, 0.5], pole: [1, 0.4], front: true, hand: 'dot' };
function hiPepper(s, t) { const cam = s.cam;
  if (t < 31.36) { const x = hiPepX(t), mv = t < 31.3, o = { expr: [[0, 'happy'], [30.0, 'grin'], [30.88, 'smile']], hand: { R: HI_PUSH, L: HI_PUSH2 }, lean: 0.08 };
    if (mv) Object.assign(o, { mode: 'walk', phase: (x + 80) / 4.6, stride: 4.6, stop: clamp((t - 30.95) / 0.35), facing: toonLookFacing(cam, x, 2, 1, 0) }); else o.facing = toonLookFacing(cam, x, 2, 1, 0);
    pose(s, 'pepperman', t, x, 2, o); return { x, z: 2, push: true }; }
  const P = [[31.36, HI_XS, 2]], q = hiPath(P, t);
  const o = { expr: [[31.36, 'excited'], [32.0, 'strain'], [32.62, 'nervous'], [33.62, 'smile'], [34.56, 'surprised'], [34.9, 'deadpan'], [35.62, 'sad'], [35.95, 'deadpan']],
    fx: t >= 32.0 && t < 34.4 ? 'sweat' : undefined,
    hand: { R: [[31.36, HI_PUSH], [31.5, 'down'], [31.84, HI_DIPR], [32.0, HI_OUTR], [32.22, HI_DIPR], [32.42, HI_OUTR], [32.62, HI_DIPR], [32.82, HI_OUTR], [33.04, HI_DIPR], [33.24, HI_OUTR], [33.5, HI_DIPR], [33.74, HI_OUTR], [34.1, 'down'], [34.9, 'hip'], [35.62, 'down']],
      L: [[31.36, HI_PUSH2], [31.5, 'down'], [31.9, HI_SCALE], [32.1, HI_OUTL], [32.32, HI_SCALE], [32.52, HI_OUTL], [32.74, HI_SCALE], [32.94, HI_OUTL], [33.14, HI_SCALE], [33.36, HI_OUTL], [33.62, HI_SCALE], [34.1, 'down'], [34.9, 'hip'], [35.62, 'down']] },
    lean: t >= 35.62 ? -0.07 : 0, gaze: t >= 34.56 && t < 34.9 ? [0.6, 0] : undefined };
  if (q.mv) Object.assign(o, { mode: 'walk', phase: q.d / 3.6, stride: 3.6, stop: q.stop, facing: toonLookFacing(cam, q.x, q.z, q.vx, q.vz) });
  else o.facing = hiLookK(s, [[31.78, 0.3], [32.0, 0.9], [32.22, -0.4], [32.42, 0.9], [32.62, -0.4], [32.82, 0.9], [33.04, -0.4], [33.24, 0.9], [33.5, -0.4], [33.74, 0.9], [34.1, 0.2], [34.56, [-13, -2]], [34.9, 0.15]], t, q.x, q.z);
  o.squash = t >= 35.6 && t < 35.9 ? 0.12 * Math.sin((t - 35.6) / 0.3 * Math.PI) : 0;
  pose(s, 'pepperman', t, q.x, q.z, o); return { x: q.x, z: q.z, push: false }; }
// the cart: follows his grip while he pushes (crossbar in his hands, pitched up), rests on its legs once parked
HI.gripOff = null;
function hiCartAt(s, t, pm) { const C = s.cart; let x, a;
  if (t < 31.36) { const h = c3ToonHandWorld(s.p.pepperman, 'R'), hy = h ? h.y : 5; a = -Math.asin(clamp((hy - 2.2 * HI_CK - 0.62 * HI_CK) / HI_CL, 0, 0.42)); x = pm.x + 0.8 + HI_CL * Math.cos(a) + 0.62 * HI_CK * Math.sin(a);
    if (t > 31.25) { const u = clamp((t - 31.25) / 0.11); a *= 1 - EZ.io(u); } }
  else { x = hiPepX(31.36) + 0.8 + HI_CL; a = 0; const k = t - 31.36; if (k < 0.3) a = -0.04 * Math.exp(-k * 12) * Math.sin(k * 40); }
  HI.cartX = x; C.position.set(x, 2.2 * HI_CK, 2); C.rotation.set(0, 0, a); C.userData.wheels.forEach((w) => { w.rotation.z = -x / (2.18 * HI_CK); });
  const bm = C.userData.beam; bm.rotation.z = t >= 31.9 && t < 33.8 ? 0.12 * Math.sin(t * 9) : 0.02 * Math.sin(t * 2); bm.children.forEach((c, i) => { if (i) c.rotation.z = -bm.rotation.z; });
  if (t < 31.36) gripDot(s, 'pepperman', 'R'), gripDot(s, 'pepperman', 'L');
  return x; }

// ---- the townsfolk (one performance each, absolute t)
const HI_PT = { h: [0.98, -0.22], pole: [0.15, 1], hand: 'point' };   // full reach, shoulder height (toon.js arm = 1.09 HH); R points screen-right, L screen-left
const HI_FOLK = {
  HIwife: { path: [[25.4, 38, -22], [29.6, -2, -9], [31.0, -2, -9], [31.8, -12.6, -2.2], [33.7, -12.6, -2.2], [34.1, -12.4, 0.6]], stride: 4.6, look: [[25, 0], [29.6, [1, -8]], [31.8, [HI_XS, 2]], [32.74, [-12, -12]], [33.1, [HI_XS, 2]], [34.5, 1.3]],
    expr: [[25, 'smile'], [29.6, 'talk'], [31.0, 'excited'], [32.0, 'talkO'], [32.74, 'skeptical'], [33.1, 'talkO'], [33.7, 'grin'], [34.56, 'laugh']], hand: { R: [[25, 'down'], [29.6, 'talk'], [31.0, 'down'], [31.85, 'up'], [32.3, 'talk'], [32.7, 'up'], [33.7, 'down'], [34.56, HI_PT]], L: [[25, 'hip'], [31.85, 'talk2'], [33.7, 'hip'], [34.56, 'hip']] } },
  HImaid: { path: [[25.4, 8, -18], [29.6, 4, -11], [31.0, 4, -11], [31.82, -3.0, -2.6], [33.7, -3.0, -2.6], [34.05, 0.4, -5.6]], stride: 4.6, look: [[25, 0], [31.82, [HI_XS, 2]]],
    expr: [[25, 'happy'], [31.0, 'excited'], [33.7, 'smile'], [34.56, 'laugh']], hand: { R: [[25, 'down'], [31.9, 'wave'], [32.4, 'talk'], [32.9, 'wave'], [33.7, 'down'], [34.56, 'up']], L: [[25, 'down'], [31.9, 'up'], [32.6, 'talk2'], [33.7, 'down'], [34.56, 'up']] } },
  HIfarm: { path: [[25.4, 30, 4], [28.8, 15, -2], [30.4, 1, -8], [31.05, 1, -8], [31.8, -0.8, -4.8], [33.7, -0.8, -4.8], [34.1, -4.4, -4.2]], look: [[25, [36, -6]], [28.8, -0.4], [30.4, [-2, -9]], [31.8, [HI_XS, 2]], [34.5, -1.3]],
    expr: [[25, 'talk'], [28.8, 'smile'], [30.4, 'talk'], [31.05, 'excited'], [33.7, 'grin'], [34.56, 'laugh']], hand: { R: [[25, 'talk'], [28.8, 'down'], [30.4, 'talk'], [31.05, 'down'], [31.85, 'up'], [32.5, 'talk'], [33.1, 'up'], [33.7, 'down'], [34.56, 'hip']], L: [[25, 'down'], [32.0, 'talk2'], [33.7, 'down'], [34.56, HI_PT]] } },
  HIkid: { path: [[25.4, 30, 12], [27.2, 40, 6], [29.0, 24, 2], [30.6, 2, -9], [31.05, 2, -9], [31.7, -10.4, -4.0], [33.62, -10.4, -4.0], [34.1, -6.4, -7.6]], stride: 3.4, look: [[25, 0], [31.6, [HI_XS, 2]]],
    expr: [[25, 'laugh'], [29.0, 'happy'], [31.0, 'excited'], [33.7, 'grin'], [34.56, 'laugh']], hand: { R: [[25, 'up'], [29.0, 'down'], [31.7, 'up'], [32.4, 'wave'], [33.0, 'up'], [33.7, 'down'], [34.56, 'up']], L: [[25, 'up'], [29.0, 'down'], [31.7, 'up'], [33.7, 'down'], [34.56, 'up']] } },
  HIold: { path: [[25.4, 31, -2]], look: [[25, [36, -6]], [30.6, -0.8], [34.3, [HI_XS, 2]]], stride: 3.6,
    expr: [[25, 'talk'], [26.6, 'smile'], [27.6, 'talk'], [33.9, 'smug'], [34.56, 'laugh']], hand: { R: [[25, 'talk'], [26.6, 'down'], [27.6, 'talk'], [28.6, 'down'], [34.56, 'talk']], L: [[25, 'hip'], [34.56, 'hip']] } },
  HIbaker: { path: [[25.4, 26, -27]], look: [[25, 0.2], [27.2, -0.5], [28.6, 0.4]], expr: [[25, 'grin'], [27.2, 'talk'], [28.6, 'happy']], hand: { R: [[25, 'talk'], [26.4, 'up'], [27.2, 'talk'], [28.6, 'wave'], [29.6, 'down']], L: [[25, 'hip']] } },
};
// the carpenter: hammers at his stall (13, -9), grabs the board at 33.62, hurries to the cart, slaps it on at 35.3, hammer hits 35.60 + 35.78
const HI_HAMP = [[25.4, 13.6, -5.6], [33.05, 13.6, -5.6], [34.05, 9.6, 1.8], [35.0, 4.6, 8.8]];
const HI_HUP = { h: [0.5, -0.45], pole: [1, 0.6], hand: 'grip' }, HI_HDN = { h: [0.6, 0.2], pole: [1, 0.3], hand: 'grip' }, HI_BRD = { h: [-0.1, 0.5], pole: [1, 0.4], front: true, hand: 'grip' }, HI_PRESS = { h: [0.16, 0.36], pole: [1, 0.4], front: true, hand: 'grip' };
const HI_BG = V3(3.0, 0, 0), HI_BBACK = 3.0;   // the board's grip point (right of centre) and how far behind his hand it sits on the cart
function hiCarp(s, t) { const swing = [[25.4, HI_HDN]]; for (let k = 25.6; k < 32.6; k += 0.55) swing.push([k, HI_HUP], [k + 0.2, HI_HDN]); swing.push([32.9, HI_HDN], [35.3, HI_HDN], [35.42, HI_HUP], [35.6, HI_HDN], [35.68, HI_HUP], [35.78, HI_HDN], [36.0, HI_HDN]);
  const q = hiFolk(s, 'HIham', t, { path: HI_HAMP, look: [[25, [13, -11]], [32.9, -0.5], [33.05, [2, 3]], [35.0, 0.6]], expr: [[25, 'determined'], [32.9, 'grin'], [35.6, 'determined'], [35.85, 'smug']],
    hand: { R: swing, L: [[25.4, 'desk'], [32.9, HI_BRD], [35.0, HI_PRESS], [35.86, 'hip']] } });
  return q; }
function hiGirl(s, t) { const shut = t < 32.5 ? 0 : t < 33.22 ? hiSnap(t, 32.5, 0.22) : 1 - hiSnap(t, 33.22, 0.2);   // 0 closed .. 1 open
  s.shut.forEach((hg) => { hg.rotation.y = hg.userData.sx * (Math.PI * 0.95) * shut * -1; });
  s.hearts.forEach((h, i) => { const t0 = 32.78 + i * 0.12, k = t - t0; if (k < 0 || k > 0.55 || t > 33.2) { h.visible = false; return; } popAt(h, Math.min(1, k / 0.12) * (1 - clamp((k - 0.4) / 0.15)), [-12.6 + (i - 1) * 1.3, 21.6 + k * 2.4, -11.0], s.cam, 1); });
  if (t < 32.5 || t > 33.46) return;
  pose(s, 'HIgirl', t, -12, -12.9, { y: 7.2, facing: hiLookK(s, [[32.5, [2, 6]], [33.0, [0, -1.5]]], t, -12, -12.9), expr: [[32.5, 'happy'], [32.74, 'excited'], [33.02, 'bored'], [33.2, 'deadpan']],
    hand: { R: [[32.5, 'down'], [32.74, 'wave'], [32.86, { h: [0.5, -0.38], pole: [1, 0.5], hand: 'open' }], [32.96, 'wave'], [33.04, 'shrug'], [33.2, 'down']], L: [[32.5, 'down'], [33.04, 'shrug'], [33.2, 'down']] }, fx: t >= 32.74 && t < 33.02 ? 'blush' : undefined, alive: 0 }); }
// geese + hens: waddle on little loops round the well
function hiBirds(s, t) { s.birds.forEach((b) => { const i = b.userData.i, cx = [30, 40, 33, 22, 26][i], cz = [4, 2, 9, 2, 12][i], r = [3, 2.4, 2.8, 2, 2.2][i], w = [0.5, -0.6, 0.45, 0.9, -0.8][i], a = t * w + i * 1.3;
  b.position.set(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r); b.rotation.y = -a - Math.sign(w) * Math.PI / 2 - Math.PI / 2 * (w < 0 ? -1 : 1) * 0 ; b.rotation.y = Math.atan2(-Math.cos(a) * Math.sign(w), -Math.sin(a) * Math.sign(w)) - Math.PI / 2;
  b.rotation.z = 0.06 * Math.sin(t * 9 + i); b.userData.neck.rotation.z = 0.25 * Math.sin(t * 3.1 + i * 2) - (Math.sin(t * 1.3 + i) > 0.8 ? 0.6 : 0); b.userData.legs.forEach((l, k) => { l.rotation.z = 0.4 * Math.sin(t * 9 + i + k * Math.PI); }); }); }

// ---- the frame
function hiFrame(t) { const s = HI_get(); hideAll(s); hideGrips(s);
  if (!HI.bFix) { seqCam(s, 'history', 35.3); hiCarp(s, 35.3); gripProp(s, s.board, 'HIham', 'L', HI_BG, { rx: -0.42, behind: HI_BBACK }); s.board.updateMatrixWorld(true); HI.bFix = { p: s.board.position.clone(), rx: -0.42 }; hideAll(s); hideGrips(s); }
  const cam = seqCam(s, 'history', t);
  const look = c3CamAt(CAMSEQ.history, t).l; hiShadowAt(s, look[0], look[2]);
  { const P = s.flag.geometry.attributes.position, b = s.flag.userData.base; for (let i = 0; i < P.count; i++) { const px = b[i * 3], k = (px + 4) / 8; P.setZ(i, Math.sin(px * 0.8 - t * 5) * 0.7 * k + Math.sin(b[i * 3 + 1] * 0.5 - t * 3) * 0.2 * k); } P.needsUpdate = true; s.flag.geometry.computeVertexNormals(); }
  s.mill.rotation.z = -t * 0.9; s.arrows.forEach((pv, i) => { pv.rotation.z = (i - 1) * 0.04 + 0.012 * Math.sin(t * 2.2 + i); });
  hiBirds(s, t);
  const pm = hiPepper(s, t); hiCartAt(s, t, pm);
  for (const k in HI_FOLK) hiFolk(s, k, t, HI_FOLK[k]);
  hiCarp(s, t); hiGirl(s, t);
  // props: the hammer (carpenter R), the board (L hand until 35.3, then on the cart's south side; snaps on at 35.60), the pouch (his R hand, out)
  gripProp(s, s.hammer, 'HIham', 'R', V3(0, 0.3, 0), { rz: 0.3, dot: true });
  { const B = s.board, held = (bk, rx) => gripProp(s, B, 'HIham', 'L', HI_BG, { rx, behind: bk });
    B.scale.setScalar(1);
    if (t < 32.9) { B.visible = true; B.position.set(14.2, 3.95, -7.6); B.rotation.set(-Math.PI / 2, 0, 0.35); }
    else if (t < 35.0) held(-0.4, -0.1);
    else { const F = HI.bFix; if (t < 35.3) { held(-0.4, -0.1); const u = EZ.io((t - 35.0) / 0.3); B.position.lerp(F.p, u); B.rotation.set(lerp(-0.1, F.rx, u), 0, 0); }
      else { B.visible = true; B.position.copy(F.p); B.rotation.set(F.rx, 0, 0); if (t >= 35.6 && t < 35.8) B.scale.setScalar(1 + 0.06 * Math.sin((t - 35.6) / 0.2 * Math.PI)); } }
    if (t >= 32.9 && t < 35.86) gripDot(s, 'HIham', 'L');
    if (t >= 35.6 && t < 36.2) { const k = (t - 35.6) / 0.6, P = B.localToWorld(V3(2.9, 0.2, 0.3)); popAt(s.puff, Math.min(1, k * 4) * (1 - k * 0.3), [P.x + 0.3, P.y + k * 1.2, P.z + 0.4], cam, 1 + k * 1.2); s.puff.material.opacity = 1 - k; } else s.puff.visible = false; }
  if (t >= 31.84 && t < 34.1) { const ph = (t - 32.0) % 0.4; if (t >= 32.0 && ph > 0.06 && ph < 0.3) gripProp(s, s.pouch, 'pepperman', 'R', V3(0, 1.0, 0), { dot: true }); else s.pouch.visible = false; } else s.pouch.visible = false;
  c3Render(s.scene, cam, { bg: '#e8d8c0', bgBlur: t > 31.7 && t < 33.5 ? 1.8 : 1.0, glow: 0.3, glowBlur: 12 });
}
C3_CAMFX.kicks.push([35.60, 0.45]);
for (const id of ['h01', 'h02', 'h03', 'h04']) { SHOT_FN[id] = (t) => hiFrame(t); SNAPS[id] = 'free'; }

// =====================================================================
//  SET street — a residential Copenhagen row-house street at golden hour (single-cinnamon). Prefix SR.
//  Street along x. South side (the bakery side): facades at z = -44 facing +z, sidewalk z -44..-20 (y 1), raised bike lane
//  z -20..-14 (y 0.5), cobbled road z -14..14 (y 0), north bike lane + sidewalk, north facades at z = +40 facing -z.
//  3-4 storey row houses with stepped / curved Dutch / plain gables and eave roofs with dormers, chimneys, shutters, window
//  boxes, cellar shops with steps; the BAGERI bakery (bay window with the KAGE layer cake, gold kringle sign) at x = 0,
//  a CAFÉ at x -29..-9; bikes in racks and against walls, street trees, lampposts, lamps on wires, Dannebrog flags.
//  Low warm sun from -x/+z, blue sky fill. ONE continuous take per time range: camera = seqCam(s, 'street', t).
//  7.70-16.56 a01 a02 a03 (walk home -> cake -> the car -> the friends with rope / bucket / KANEL sack);
//  49.76-56.76 a04 a05 a06 (the cinnamon woman walks past, glares on 'love', waves a Dannebrog flag on 'happy birthday').
// =====================================================================
const SR = {};
const SR_FZ = -48, SR_NZ = 48, SR_K = 1.35;   // south / north facade fronts; houses, bakery + cafe are built at 1/SR_K and scaled up (people ~12.5 tall)
const srAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const srRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
const srSnap = (t, t0, d = 0.33) => { const x = clamp((t - t0) / d); return 1 - (1 - x) ** 3; };   // Ricks snap: fast, settled, no bounce
const srBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const srCyl = (r0, r1, h, mat, x, y, z, seg = 16, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.position.set(x, y, z); return m; };
const srSph = (r, mat, x, y, z, ws = 14, hs = 10) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); return m; };
const srRB = (w, h, d, mat, x, y, z, r = 0.3) => { const m = c3Mesh(c3RBox(w, h, d, r, 3), mat, 0); m.position.set(x, y, z); return m; };
function srTube(a, b, r, mat, seg = 8) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
// eased numeric keys
function srKN(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], EZ.io((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); return K[K.length - 1][1]; }
// a facing from look keys [[t, target], ...] (target [x, z] world point re-aimed from the camera every frame, or a number); 0.22 s snapped turns
function srLookK(s, K, t, x, z, lim = 1.6) { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
  const f = (k) => typeof k[1] === 'number' ? k[1] : toonLookFacing(s.cam, x, z, k[1][0] - x, k[1][1] - z), b = f(K[i]);
  if (i === 0 || t < K[0][0]) return clamp(b, -lim, lim); const a = f(K[i - 1]), u = clamp((t - K[i][0]) / 0.22); return clamp(a + (b - a) * (1 - (1 - u) ** 3), -lim, lim); }
const SR_GRIP = (x, y, o = {}) => Object.assign({ h: [x, y], pole: [1, 0.3], hand: 'grip' }, o);

// ---- bake: merge static props per material into vertex-coloured meshes (from trash-library stBake)
function srBake(root, o = {}) { root.updateMatrixWorld(true); const Bk = new Map(), v = new THREE.Vector3(), keep = [];
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    if (mt.transparent || mt.isShaderMaterial || m.userData.keep || Array.isArray(m.material)) { keep.push(m); return; }
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    m.getWorldPosition(v); const ch = Math.floor(v.x / 80) + ',' + Math.floor(v.z / 80);
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '') + (mt.side === THREE.DoubleSide ? 'D' : '') + (m.userData.noCast ? 'n' : '') + '|' + ch;
    if (!Bk.has(key)) Bk.set(key, { mt, em, nc: !!m.userData.noCast, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); Bk.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const m of keep) { const c = m.clone(); m.matrixWorld.decompose(c.position, c.quaternion, c.scale); if (o.noCast) c.userData.noCast = true; out.add(c); }
  for (const { mt, em, nc, L } of Bk.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), Cc = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.8 + 0.2 * clamp((y - 1) / 3);
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        Cc[k * 3] = c.r * ao; Cc[k * 3 + 1] = c.g * ao; Cc[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast || nc) mesh.userData.noCast = true; out.add(mesh); }
  return out; }

// ---- textures
function srNoise(g, w, h, R, n, a = 0.05, s = 2) { for (let i = 0; i < n; i++) { g.fillStyle = R.f() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`; g.fillRect(R.f() * w, R.f() * h, s, s); } }
// cobbles: rounded granite setts in warm greys / pinks / blue-greys, dark joints, lit tops
function srTexCobble() { const t = tex((g, w, h) => { const R = RNG('srcob'); g.fillStyle = '#5e5450'; g.fillRect(0, 0, w, h); const n = 8, cw = w / n, chh = h / 12;
  const C = ['#b4a89c', '#a8968a', '#c2b2a0', '#9ea2a8', '#b09a88', '#bcaa98', '#a4a0a0', '#c4a894'];
  for (let j = 0; j < 12; j++) for (let i = -1; i <= n; i++) { const x = (i + (j % 2) * 0.5) * cw + R.n(2), y = j * chh + R.n(1.5), ww = cw - 5 + R.n(2), hh = chh - 5 + R.n(1.5);
    g.fillStyle = C[R.i(0, C.length - 1)]; g.beginPath(); g.roundRect(x + 2, y + 2, ww, hh, 9); g.fill();
    const gr = g.createLinearGradient(0, y, 0, y + hh); gr.addColorStop(0, 'rgba(255,240,220,0.32)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(40,30,40,0.22)'); g.fillStyle = gr; g.fill(); }
  srNoise(g, w, h, R, 3000, 0.06); }, 512, 512); return t; }
// sidewalk: big pale granite slabs in 3 rows between strips of small setts (Copenhagen)
function srTexPave() { const t = tex((g, w, h) => { const R = RNG('srpave'); g.fillStyle = '#8a827a'; g.fillRect(0, 0, w, h);
  const sett = (y0, y1) => { for (let y = y0; y < y1; y += 12) for (let x = (y / 12 % 2) * 6; x < w; x += 12) { g.fillStyle = ['#a09284', '#9a9490', '#ac9c8c'][R.i(0, 2)]; g.beginPath(); g.roundRect(x + 1, y + 1, 10, 10, 3); g.fill(); } };
  sett(0, h * 0.14); sett(h * 0.86, h);
  const ys = [h * 0.14, h * 0.38, h * 0.62, h * 0.86];
  for (let r = 0; r < 3; r++) for (let x = (r % 2) * 40; x < w + 80; x += 80) { const c = new THREE.Color('#d2ccc2').multiplyScalar(0.92 + R.f() * 0.12); g.fillStyle = '#' + c.getHexString(); g.fillRect(x + 2, ys[r] + 2, 76, ys[r + 1] - ys[r] - 4); }
  srNoise(g, w, h, R, 2500, 0.05); }, 512, 256); return t; }
// raised bike lane: asphalt, white line on the road edge, a painted bike symbol
function srTexLane() { const t = tex((g, w, h) => { const R = RNG('srlane'); g.fillStyle = '#6e6c72'; g.fillRect(0, 0, w, h); srNoise(g, w, h, R, 4000, 0.07);
  g.fillStyle = '#f2efe6'; g.fillRect(0, h - 12, w, 7);
  g.save(); g.translate(w / 2, h * 0.48); g.strokeStyle = 'rgba(246,244,236,0.92)'; g.lineWidth = 7; g.lineCap = 'round';
  for (const sx of [-34, 34]) { g.beginPath(); g.arc(sx, 10, 22, 0, TAU); g.stroke(); }
  g.beginPath(); g.moveTo(-34, 10); g.lineTo(-8, -18); g.lineTo(22, -18); g.lineTo(34, 10); g.moveTo(-8, -18); g.lineTo(0, 10); g.lineTo(-34, 10); g.moveTo(0, 10); g.lineTo(22, -18); g.moveTo(-14, -26); g.lineTo(-2, -26); g.moveTo(22, -18); g.lineTo(18, -30); g.lineTo(28, -32); g.stroke(); g.restore(); }, 512, 128); return t; }
// roof tiles (clay red or slate)
function srTexRoof(col, seed) { const t = tex((g, w, h) => { const R = RNG('srroof', seed); g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(30,10,10,0.28)'; g.fillRect(0, y, w, 3); for (let x = ((y / 16) % 2) * 10; x < w; x += 20) { g.fillStyle = `rgba(${R.f() < 0.5 ? '255,230,200' : '40,20,20'},${R.r(0.04, 0.14)})`; g.fillRect(x, y + 3, 18, 13); g.fillStyle = 'rgba(30,10,10,0.2)'; g.fillRect(x + 18, y + 3, 2, 13); } }
  srNoise(g, w, h, R, 1500, 0.05); }, 256, 256); return srRep(t, 1 / 8, 1 / 8); }
// a sign board (rounded, band colour, inked word)
function srTexSign(txt, band, fg = '#fff4dc', o = {}) { return tex((g, w, h) => { g.fillStyle = o.edge ?? '#e8c46a'; g.beginPath(); g.roundRect(0, 0, w, h, h * 0.18); g.fill(); g.fillStyle = band; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, h * 0.14); g.fill();
  inked(g, txt, w / 2, h / 2 + 2, h * (o.k ?? 0.56), fg, { stroke: o.stroke ?? '#2a1a12', sw: h * 0.05, maxW: w * 0.84, font: o.font }); }, o.w ?? 512, o.h ?? 128); }
function srTexFlag() { return tex((g, w, h) => { g.fillStyle = '#d4202e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(w * 0.32, 0, w * 0.11, h); g.fillRect(0, h * 0.44, w, h * 0.13); }, 192, 128); }
// a facade: wall (plaster or brick), plinth, floor bands, framed windows (white sashes, transom, curtains, sky in the glass),
// a front door with fanlight or a shop window, gable windows, a cellar door + sign below the sidewalk. Canvas spans
// x -w/2..w/2, y y0..top (world units, the ExtrudeGeometry caps use (x, y) as uv).
function srWin(g, x, y, ww, hh, o, R) {   // x, y = canvas top-left
  const f = Math.max(2, ww * 0.09); g.fillStyle = o.frame ?? '#f6f1e6'; g.fillRect(x - f * 0.6, y - f * 0.6, ww + f * 1.2, hh + f * 1.2);
  const gr = g.createLinearGradient(x, y, x + ww * 0.6, y + hh); gr.addColorStop(0, o.lit ? '#ffd890' : '#4a6aa0'); gr.addColorStop(0.55, o.lit ? '#e8a050' : '#2a3a62'); gr.addColorStop(1, o.lit ? '#c87838' : '#3a4a78'); g.fillStyle = gr; g.fillRect(x, y, ww, hh);
  if (!o.lit) { g.fillStyle = 'rgba(200,225,255,0.28)'; g.beginPath(); g.moveTo(x + ww * 0.15, y + hh); g.lineTo(x + ww * 0.55, y); g.lineTo(x + ww * 0.8, y); g.lineTo(x + ww * 0.4, y + hh); g.fill(); }
  if (o.curtain) { g.fillStyle = o.curtain; g.fillRect(x, y, ww * 0.22, hh); g.fillRect(x + ww * 0.78, y, ww * 0.22, hh); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 1; i < 4; i++) { g.fillRect(x + ww * 0.05 * i, y, 1.5, hh); g.fillRect(x + ww * (0.78 + 0.05 * i), y, 1.5, hh); } }
  if (o.plant) { g.fillStyle = '#3a7a3a'; g.beginPath(); g.ellipse(x + ww * 0.5, y + hh * 0.86, ww * 0.18, hh * 0.1, 0, 0, TAU); g.fill(); }
  g.fillStyle = o.frame ?? '#f6f1e6'; g.fillRect(x + ww / 2 - f * 0.35, y, f * 0.7, hh); g.fillRect(x, y + hh * 0.3, ww, f * 0.6); if (o.panes) g.fillRect(x, y + hh * 0.65, ww, f * 0.4);
}
function srTexFacade(o) {
  const S = 9, W = o.w, y0 = o.y0, top = o.top, R = RNG('srfac', o.seed);
  const t = tex((g, w, h) => {
    const X = (x) => (x + W / 2) * S, Y = (y) => (top - y) * S, U = S;
    g.fillStyle = o.wall; g.fillRect(0, 0, w, h);
    if (o.brick) { for (let y = 0; y < h; y += 7) for (let x = ((y / 7) % 2) * 9; x < w; x += 18) { const c = new THREE.Color(o.wall).multiplyScalar(0.86 + R.f() * 0.24); g.fillStyle = '#' + c.getHexString(); g.fillRect(x, y, 16.5, 5.6); } }
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,215,0.16)'); gr.addColorStop(0.75, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(70,40,30,0.16)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    srNoise(g, w, h, R, w * h / 40, 0.045);
    for (let i = 0; i < 6; i++) { const x = R.f() * w, y0s = R.f() * h * 0.6, gg = g.createLinearGradient(0, y0s, 0, y0s + 60); gg.addColorStop(0, 'rgba(60,40,30,0.07)'); gg.addColorStop(1, 'rgba(60,40,30,0)'); g.fillStyle = gg; g.fillRect(x, y0s, R.r(3, 9), 60); }
    // plinth, below-sidewalk wall, floor bands, quoins
    g.fillStyle = o.plinth; g.fillRect(0, Y(3.5), w, Y(y0) - Y(3.5)); g.fillStyle = 'rgba(0,0,0,0.1)'; for (let x = 0; x < w; x += 22) g.fillRect(x, Y(3.5), 2, Y(y0) - Y(3.5));
    g.fillStyle = o.trim; g.fillRect(0, Y(19), w, 0.9 * U); for (let k = 1; k < o.floors - 1; k++) g.fillRect(0, Y(18.5 + k * 14 + 0.4), w, 0.45 * U);
    if (o.quoin) { g.fillStyle = o.trim; for (let y = 3.5; y < o.H; y += 2.4) { const ww = ((y / 2.4) | 0) % 2 ? 1.6 : 2.4; g.fillRect(0, Y(y + 2), ww * U, 1.9 * U); g.fillRect(w - ww * U, Y(y + 2), ww * U, 1.9 * U); } }
    // upper floors
    const bays = o.bays, bw = W / bays, cur = ['#f4ecdc', '#fbf6ee', '#f2d8c8', '#e8eef4', null];
    for (let k = 1; k < o.floors; k++) { const yb = 18.5 + (k - 1) * 14; for (let b = 0; b < bays; b++) { const cx = -W / 2 + (b + 0.5) * bw, ww = Math.min(4.2, bw * 0.5);
      srWin(g, X(cx - ww / 2), Y(yb + 11.6), ww * U, 8.4 * U, { curtain: cur[R.i(0, 4)], plant: R.f() < 0.25, panes: true, frame: o.frame }, R);
      if (o.lintel) { g.fillStyle = o.trim; g.fillRect(X(cx - ww / 2 - 0.6), Y(yb + 12.6), (ww + 1.2) * U, 0.8 * U); } } }
    // gable windows
    if (o.gh > 0) { const gw = Math.min(3.4, W * 0.17); srWin(g, X(-gw / 2), Y(o.H + o.gh * 0.42 + 4.5), gw * U, 6 * U, { curtain: '#f4ecdc', frame: o.frame }, R);
      if (W > 15) for (const sx of [-1, 1]) srWin(g, X(sx * W * 0.24 - 1.4), Y(o.H + 5.6), 2.8 * U, 4.6 * U, { frame: o.frame }, R);
      g.fillStyle = o.frame ?? '#f6f1e6'; g.beginPath(); g.arc(X(0), Y(o.H + o.gh * 0.78), 1.1 * U, 0, TAU); g.fill(); g.fillStyle = '#3a4a78'; g.beginPath(); g.arc(X(0), Y(o.H + o.gh * 0.78), 0.75 * U, 0, TAU); g.fill(); }
    // ground floor
    const doorB = o.doorBay ?? 0, dc = -W / 2 + (doorB + 0.5) * bw;
    if (o.shop) { const sx0 = o.shop.x0 ?? -W / 2 + 1.2, sx1 = o.shop.x1 ?? W / 2 - 1.2;
      g.fillStyle = o.shop.frame ?? '#2a4a3a'; g.fillRect(X(sx0 - 0.6), Y(16.8), (sx1 - sx0 + 1.2) * U, 13.2 * U);
      const sg = g.createLinearGradient(0, Y(15.6), 0, Y(4.4)); sg.addColorStop(0, '#ffd894'); sg.addColorStop(0.5, '#e8a050'); sg.addColorStop(1, '#a85a2a'); g.fillStyle = sg; g.fillRect(X(sx0), Y(15.6), (sx1 - sx0) * U, 11.2 * U);
      g.fillStyle = 'rgba(90,40,20,0.55)'; for (const yy of [7.5, 11]) g.fillRect(X(sx0), Y(yy), (sx1 - sx0) * U, 0.5 * U);   // shelves inside
      for (let i = 0; i < (sx1 - sx0) / 1.6; i++) { g.fillStyle = ['#c8783a', '#e8c070', '#a85030', '#f0d8a0', '#d84a5a'][R.i(0, 4)]; g.beginPath(); g.ellipse(X(sx0 + 0.8 + i * 1.6), Y(R.f() < 0.5 ? 8.2 : 11.7), 0.6 * U, 0.45 * U, 0, 0, TAU); g.fill(); }
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(X(sx0 + 1), Y(4.4)); g.lineTo(X(sx0 + 4), Y(15.6)); g.lineTo(X(sx0 + 5.5), Y(15.6)); g.lineTo(X(sx0 + 2.5), Y(4.4)); g.fill();
      g.fillStyle = o.shop.frame ?? '#2a4a3a'; for (let x = sx0 + 3.4; x < sx1 - 1; x += 3.4) g.fillRect(X(x - 0.15), Y(15.6), 0.3 * U, 11.2 * U); }
    else for (let b = 0; b < bays; b++) { if (b === doorB) continue; const cx = -W / 2 + (b + 0.5) * bw, ww = Math.min(4.2, bw * 0.5); srWin(g, X(cx - ww / 2), Y(15.2), ww * U, 8.4 * U, { curtain: cur[R.i(0, 4)], panes: true, frame: o.frame, lit: R.f() < 0.25 }, R); }
    if (!o.shop || o.shop.door) { const dx = o.shop && o.shop.door ? o.shop.door : dc, dw = 3.4;
      g.fillStyle = o.frame ?? '#f6f1e6'; g.fillRect(X(dx - dw / 2 - 0.5), Y(15.4), (dw + 1) * U, 11.9 * U);
      g.fillStyle = o.door; g.fillRect(X(dx - dw / 2), Y(12.6), dw * U, 9.1 * U); g.fillStyle = 'rgba(0,0,0,0.18)'; for (const yy of [5.2, 8.6]) for (const sx of [-1, 1]) g.fillRect(X(dx + sx * 0.85 - 0.6), Y(yy + 2.6), 1.2 * U, 2.4 * U);
      g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(X(dx + 1.1), Y(8), 0.22 * U, 0, TAU); g.fill();
      const fg = g.createLinearGradient(0, Y(15), 0, Y(12.8)); fg.addColorStop(0, '#5a7ab0'); fg.addColorStop(1, '#2a3a62'); g.fillStyle = fg; g.fillRect(X(dx - dw / 2), Y(15), dw * U, 2.2 * U); }
    // cellar shop below the sidewalk: door, small window, sign on the plinth
    if (o.cellar) { const cx = o.cellar.x; g.fillStyle = '#3a2e2a'; g.fillRect(X(cx - 3.2), Y(1), 6.4 * U, 7 * U);
      g.fillStyle = o.cellar.col; g.fillRect(X(cx - 2.6), Y(0.4), 2.6 * U, 5.6 * U); g.fillStyle = '#ffd890'; g.fillRect(X(cx - 2.2), Y(-0.2), 1.8 * U, 2.4 * U);
      srWin(g, X(cx + 0.6), Y(0.2), 2.2 * U, 2.6 * U, { lit: true, frame: '#e8e0d0' }, R); }
  }, Math.round(W * S), Math.round((top - y0) * S));
  t.repeat.set(1 / W, 1 / (top - y0)); t.offset.set(0.5, -y0 / (top - y0)); return t;
}
// the right half of a gable outline from (w/2, H) up to (0, top) as points
function srGablePts(type, w, H, gh) { const a = w / 2, P = [[a, H]];
  if (type === 'tri') P.push([0, H + gh]);
  else if (type === 'step') { const n = 4, sw = a * 0.8 / n, sh = gh / (n + 0.5); let x = a, y = H; for (let i = 0; i < n; i++) { y += sh; P.push([x, y]); x -= sw; P.push([x, y]); } P.push([x, H + gh]); P.push([0, H + gh]); }
  else if (type === 'curve') { const nx = a * 0.42; for (let i = 1; i <= 8; i++) { const u = i / 8; P.push([lerp(a, nx, Math.sin(u * Math.PI / 2)), H + gh * 0.5 * (1 - Math.cos(u * Math.PI / 2))]); }
    P.push([nx, H + gh * 0.78]); P.push([nx + 0.7, H + gh * 0.78]); P.push([nx + 0.7, H + gh * 0.83]);
    for (let i = 1; i <= 8; i++) { const u = i / 8; P.push([(nx + 0.7) * Math.cos(u * Math.PI / 2), H + gh * 0.83 + gh * 0.2 * Math.sin(u * Math.PI / 2)]); } }
  else P.push([0, H]);
  return P; }
function srFrontShape(type, w, H, gh, y0) { const s = new THREE.Shape(), P = srGablePts(type, w, H, gh); s.moveTo(-w / 2, y0); s.lineTo(w / 2, y0);
  for (const [x, y] of P) s.lineTo(x, y); for (let i = P.length - 2; i >= 0; i--) s.lineTo(-P[i][0], P[i][1]); s.lineTo(-w / 2, y0); return s; }

// ---- props
// a Danish city bike (front at +x, wheels on y = 0): two wheels, a step-through frame, bars, saddle, a basket on some
function srBike(col, R) { const g = new THREE.Group(), M = SR.M, fm = (SR.bikeC ||= {})[col] ||= c3Prop(col, { rough: 0.35, metal: 0.2 }), r = 1.95;
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.16, 6, 22), M.tyre); w.position.set(sx * 3.2, r, 0); g.add(w);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.22, 0.05, 4, 20), M.chrome); rim.position.set(sx * 3.2, r, 0); g.add(rim);
    for (let k = 0; k < 4; k++) { const sp = srBox(2 * r - 0.4, 0.04, 0.04, M.chrome, sx * 3.2, r, 0); sp.rotation.z = k * Math.PI / 4; g.add(sp); }
    const fd = srBox(2.2, 0.35, 0.5, fm, sx * 3.2, 2 * r + 0.25, 0); fd.rotation.z = -sx * 0.25; g.add(fd); }   // mudguards
  const P = (x, y) => V3(x, y, 0), seat = P(-1.0, 6.0), head = P(2.4, 6.4), bb = P(0, r), axF = P(3.2, r), axR = P(-3.2, r);
  g.add(srTube(head, P(-0.3, r + 0.6), 0.18, fm)); g.add(srTube(P(-0.3, r + 0.6), bb, 0.18, fm)); g.add(srTube(bb, seat.clone().add(V3(0.2, -0.6, 0)), 0.17, fm));
  g.add(srTube(bb, axR, 0.12, fm)); g.add(srTube(seat.clone().add(V3(0.2, -0.6, 0)), axR, 0.12, fm)); g.add(srTube(head, axF, 0.15, fm));
  g.add(srTube(head, P(2.2, 7.4), 0.13, M.chrome)); { const bar = srTube(V3(1.6, 7.6, -1.2), V3(1.6, 7.6, 1.2), 0.12, M.chrome); g.add(bar); }
  g.add(srRB(1.6, 0.4, 0.8, M.black, seat.x, seat.y + 0.2, 0, 0.15));
  g.add(srBox(2.4, 0.15, 1.2, M.chrome, -2.6, 4.3, 0));   // rear rack
  { const ch = srCyl(0.55, 0.55, 0.2, M.chrome, 0, r, 0.35, 10); ch.rotation.x = Math.PI / 2; g.add(ch); }
  if (R.f() < 0.45) { const bk = srRB(2.0, 1.5, 2.0, (SR.bkM ||= c3Prop('#c89a5a', { rough: 0.9 })), 3.9, 7.2, 0, 0.2); g.add(bk); if (R.f() < 0.5) { for (let k = 0; k < 4; k++) g.add(srSph(0.42, c3Prop(['#e8344a', '#ffd040', '#f06aa0', '#ffffff'][k], { rough: 0.7 }), 3.4 + (k % 2) * 0.9, 8.1, -0.5 + (k >> 1))); } }
  return g; }
// the bakery's kringle sign: a fat golden pretzel (tube on a pretzel curve) with a little crown
function srKringle() { const g = new THREE.Group(), gold = c3Prop('#e8b030', { metal: 0.65, rough: 0.3, env: 1.6 });
  const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80 * TAU; pts.push(V3(Math.sin(u) * (1.1 + 0.9 * Math.cos(u)) * 1.6, (Math.cos(u) * 1.3 - 0.4 * Math.cos(2 * u)) * 1.6, 0.25 * Math.sin(2 * u))); }
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 120, 0.42, 10, true), gold); g.add(tube);
  for (let i = 0; i < 18; i++) { const u = i / 18 * TAU, d = srSph(0.12, c3Prop('#fff4d8', { rough: 0.6 }), Math.sin(u) * (1.1 + 0.9 * Math.cos(u)) * 1.6, (Math.cos(u) * 1.3 - 0.4 * Math.cos(2 * u)) * 1.6 + 0.3, 0.45, 6, 4); g.add(d); }   // sugar
  const cr = new THREE.Group(); cr.position.y = 3.6; g.add(cr); cr.add(srCyl(0.9, 0.8, 0.5, gold, 0, 0, 0, 12)); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; cr.add(srSph(0.18, gold, Math.cos(a) * 0.85, 0.55, Math.sin(a) * 0.85, 8, 6)); cr.add(srBox(0.18, 0.5, 0.18, gold, Math.cos(a) * 0.85, 0.3, Math.sin(a) * 0.85)); }
  return g; }
// the big layer cake in the bakery window: 3 tiers, cream + pink frosting with drips, strawberries, a cake stand
function srCake() { const g = new THREE.Group(), cream = c3Prop('#fbeee6', { rough: 0.55 }), pink = c3Prop('#f4a0b8', { rough: 0.5 }), sponge = c3Prop('#e8c088', { rough: 0.8 }), berry = c3Prop('#e0283a', { rough: 0.35 }), leaf = c3Prop('#3a9a3a', { rough: 0.6 }), stand = c3Prop('#f4f2ee', { rough: 0.2, env: 1.4 });
  g.add(srCyl(0.35, 0.6, 1.2, stand, 0, 0.6, 0, 16)); g.add(srCyl(2.2, 2.2, 0.15, stand, 0, 1.25, 0, 32));
  let y = 1.32; [[1.8, 1.2, cream], [1.35, 1.05, pink], [0.95, 0.95, cream]].forEach(([r, hh, m], i) => { g.add(srCyl(r, r, hh, m, 0, y + hh / 2, 0, 32));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.13, 8, 32), i === 1 ? cream : pink); rim.rotation.x = Math.PI / 2; rim.position.y = y + hh; g.add(rim);
    for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, d = srSph(0.13, i === 1 ? cream : pink, Math.cos(a) * r, y + hh - 0.25 - (k % 3) * 0.12, Math.sin(a) * r, 8, 6); d.scale.y = 2.2; g.add(d); }
    if (i === 0) { const sl = srCyl(r + 0.01, r + 0.01, 0.12, sponge, 0, y + hh * 0.45, 0, 32); g.add(sl); }
    y += hh; });
  for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; g.add(srSph(0.24, berry, Math.cos(a) * 0.6, y + 0.18, Math.sin(a) * 0.6, 10, 8)); const l = srSph(0.12, leaf, Math.cos(a) * 0.6, y + 0.4, Math.sin(a) * 0.6, 6, 4); l.scale.set(1.4, 0.5, 1.4); g.add(l); }
  g.add(srSph(0.3, berry, 0, y + 0.3, 0, 10, 8));
  return g; }
// rope coil (held at the top of the loops), bucket of water (grip = the handle top), the KANEL sack (grips at both sides),
// the hero's work bag (grip = the strap top), a paper Dannebrog flag on a stick (grip = the stick bottom)
function srRope() { const g = new THREE.Group(), m = c3Prop('#d8b070', { rough: 0.9, map: (SR.ropeT ||= srRep(tex((x, w, h) => { x.fillStyle = '#d8b070'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,80,30,0.55)'; x.lineWidth = 5; for (let i = -h; i < w; i += 14) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); } }, 128, 64), 6, 1)) });
  for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.2, 8, 28), m); l.position.set(0.06 * k, -1.15 - 0.08 * k, 0.12 * k - 0.2); l.rotation.set(0.12 * k, 0.15 * (k - 1.5), 0.05 * k); g.add(l); }
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(1.05, -1.6, 0.2), V3(1.5, -2.6, 0.3), V3(1.1, -3.4, 0.2), V3(1.4, -4.0, 0.1)]), 20, 0.2, 8), m); g.add(tail);
  g.userData.grip = V3(0, 0, 0); return g; }
function srBucket() { const g = new THREE.Group(), mt = c3Prop('#9ab4c8', { metal: 0.55, rough: 0.3, env: 1.5 }), dk = c3Prop('#6a8298', { metal: 0.5, rough: 0.35 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 0.95, 1.9, 24, 1, true), mt); body.material.side = THREE.DoubleSide; body.position.y = -3.0; g.add(body);
  g.add(srCyl(0.95, 0.95, 0.08, dk, 0, -3.95, 0, 24)); const rim = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.09, 6, 24), mt); rim.rotation.x = Math.PI / 2; rim.position.y = -2.05; g.add(rim);
  for (const y of [-2.6, -3.5]) { const b = new THREE.Mesh(new THREE.TorusGeometry(1.25 - (y + 2.05) * -0.16, 0.05, 4, 24), dk); b.rotation.x = Math.PI / 2; b.position.y = y; g.add(b); }
  const hd = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.06, 6, 20, Math.PI), dk); hd.position.y = -2.05; g.add(hd);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1.18, 24), c3Prop('#4aa8e8', { rough: 0.05, env: 2, metal: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.y = -2.3; g.add(water); g.userData.water = water;
  g.userData.grip = V3(0, -0.8, 0); return g; }
function srTexSack() { return tex((g, w, h) => { const R = RNG('srsack'); g.fillStyle = '#c8a070'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 6) { g.fillStyle = 'rgba(110,70,30,0.22)'; g.fillRect(0, y, w, 2); } for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(x, 0, 2, h); } srNoise(g, w, h, R, 3000, 0.06, 3);
  g.save(); g.translate(w * 0.25, h * 0.56); g.rotate(-0.04); g.fillStyle = 'rgba(250,236,210,0.92)'; g.beginPath(); g.ellipse(0, 0, w * 0.2, h * 0.17, 0, 0, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = '#8a2a1a'; g.stroke();
  inked(g, 'KANEL', 0, 4, h * 0.13, '#8a2a1a', { stroke: false, maxW: w * 0.34 }); g.restore();
  g.save(); g.translate(w * 0.75, h * 0.56); g.fillStyle = 'rgba(250,236,210,0.92)'; g.beginPath(); g.ellipse(0, 0, w * 0.2, h * 0.17, 0, 0, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = '#8a2a1a'; g.stroke(); inked(g, 'KANEL', 0, 4, h * 0.13, '#8a2a1a', { stroke: false, maxW: w * 0.34 }); g.restore(); }, 1024, 512); }
function srSack() { const g = new THREE.Group(), pts = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20, y = u * 7.2, r = u < 0.78 ? 2.9 * Math.sin(Math.PI * (0.18 + u * 0.95)) ** 0.6 + 0.3 : lerp(1.5, 1.95, (u - 0.78) / 0.22); pts.push(new THREE.Vector2(Math.max(0.2, r), y)); }
  const m = c3Prop('#ffffff', { map: srTexSack(), rough: 0.95 }); m.side = THREE.DoubleSide; const s = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), m); s.rotation.y = -Math.PI / 2; g.add(s);
  const tie = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.18, 6, 20), c3Prop('#8a5a2a', { rough: 0.9 })); tie.rotation.x = Math.PI / 2; tie.position.y = 5.75; g.add(tie);
  const top = new THREE.Mesh(new THREE.CircleGeometry(1.85, 20), c3Prop('#b8743a', { rough: 0.95 })); top.rotation.x = -Math.PI / 2; top.position.y = 6.9; g.add(top);
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, b = srSph(0.45, c3Prop('#a8642e', { rough: 0.95 }), Math.cos(a) * 0.9, 7.0, Math.sin(a) * 0.9, 8, 6); b.scale.y = 0.5; g.add(b); }
  g.userData.top = V3(0, 7.2, 0); return g; }
function srWorkBag() { const g = new THREE.Group(), lea = c3Prop('#8a4a2a', { rough: 0.55 }), dk = c3Prop('#5a2e1a', { rough: 0.6 }), bk = c3Prop('#e8c04a', { metal: 0.6, rough: 0.3 });
  g.add(srRB(2.8, 2.1, 0.9, lea, 0, -4.2, 0, 0.3)); g.add(srRB(2.84, 1.2, 0.2, dk, 0, -3.7, 0.5, 0.12)); g.add(srBox(0.5, 0.36, 0.1, bk, 0, -4.1, 0.62));
  g.add(srTube(V3(0, 0, 0), V3(-1.2, -3.2, 0), 0.12, dk)); g.add(srTube(V3(0, 0, 0), V3(1.2, -3.2, 0), 0.12, dk));
  g.userData.grip = V3(0, 0, 0); return g; }
function srPaperFlag() { const g = new THREE.Group(); g.add(srCyl(0.06, 0.06, 2.6, c3Prop('#d8b07a', { rough: 0.8 }), 0, 1.3, 0, 6));
  const fm = c3Prop('#ffffff', { map: srTexFlag(), rough: 0.9 }); fm.side = THREE.DoubleSide; const f = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.0, 8, 2), fm); f.position.set(0.78, 2.1, 0); g.add(f); g.userData.flag = f; f.userData.base = Float32Array.from(f.geometry.attributes.position.array);
  g.userData.grip = V3(0, 0.3, 0); return g; }
// soft billboard puff (cinnamon / tyre smoke) and a wavy scent wisp
function srPuffTex(col) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('srpuff', col); for (let k = 0; k < 7; k++) { const x = w * (0.3 + R.f() * 0.4), y = h * (0.3 + R.f() * 0.4), r = w * (0.18 + R.f() * 0.14), gr = g.createRadialGradient(x, y, 0, x, y, r);
  const c = new THREE.Color(col); gr.addColorStop(0, `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},0.75)`); gr.addColorStop(0.6, `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},0.35)`); gr.addColorStop(1, `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},0)`); g.fillStyle = gr; g.fillRect(0, 0, w, h); } }, 256, 256); }
function srWispTex() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.lineCap = 'round';
  for (const [x0, a, c] of [[0.3, 1, 'rgba(232,150,90,0.85)'], [0.55, 0.8, 'rgba(255,200,150,0.8)'], [0.75, 0.65, 'rgba(220,130,80,0.7)']]) { g.strokeStyle = c; g.lineWidth = 9 * a; g.beginPath();
    for (let i = 0; i <= 30; i++) { const v = i / 30, x = w * x0 + Math.sin(v * TAU * 1.5 + x0 * 5) * w * 0.09, y = h * (0.95 - v * 0.9); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); } }, 128, 256); }

// ---- the build
function srBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.4, 5000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#7c94d8', ambI: 0.24, sky: '#8eb0f0', ground: '#c8986a', key: '#ffa458', keyI: 2.7, keyP: [-120, 110, 210], rim: '#ffb878', rimI: 0.3, rimP: [150, 60, -120] });
  s.key.userData.I = 2.7; s.key.userData.dir = V3(-0.48, 0.42, 0.77).normalize();
  scene.children.forEach((c) => { if (c.isHemisphereLight) s.hemi = c; else if (c.isAmbientLight) s.amb = c; });
  const M = SR.M = { conc: c3Prop('#c4bcb0', { rough: 0.9 }), curb: c3Prop('#d8d2c6', { rough: 0.85 }), dark: c3Prop('#2a2a32', { rough: 0.6 }), steel: c3Prop('#8a929c', { metal: 0.5, rough: 0.4 }),
    tyre: c3Prop('#22222a', { rough: 0.85 }), chrome: c3Prop('#d8dce2', { rough: 0.15, metal: 0.9, env: 2 }), black: c3Prop('#2a2626', { rough: 0.6 }), wood: c3Prop('#a8703a', { rough: 0.8 }),
    iron: c3Prop('#24302c', { rough: 0.45, metal: 0.4 }), green: c3Prop('#2a5a44', { rough: 0.5, metal: 0.2 }), white: c3Prop('#f4f0e6', { rough: 0.6 }), glassE: c3Prop('#fff0c8', { emissive: '#ffd890', ei: 0.9, rough: 0.2 }) };
  const K = new THREE.Group(), KN = new THREE.Group();   // static detail: K casts shadows (small props), KN never (houses: the low sun would put the street in shade)
  s.sky = c3SkyDome(scene, { paint: true, zenith: '#2f66d0', mid: '#86b6ee', midH: 0.12, horizon: '#ffd6a6', glow: '#ffae68', glowK: 0.5, ground: '#c8a080', sun: [0.75, 0.1, -0.62], clouds: 34, cloudScale: 1.1, seed: 21, cloudLit: '#fff2de', cloudShade: '#98a4dc', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#f2cfa8', 260, 1100);
  // ---- ground: road cobbles, raised bike lanes, sidewalks + curbs
  { const rd = pl(1400, 36, c3Prop('#ffffff', { map: srRep(srTexCobble(), 140, 4.5), rough: 0.85 }), 0, 0.02, 0, 0, -Math.PI / 2); rd.userData.noCast = true; scene.add(rd);
    scene.add(pl(4000, 4000, c3Prop('#8a7e74', { rough: 0.95 }), 0, -0.1, 0, 0, -Math.PI / 2));
    for (const sz of [-1, 1]) { const bl = rbNC(1400, 0.5, 8, M.conc, 0, 0.25, sz * 22, 0); scene.add(bl); const lp = pl(1400, 8, c3Prop('#ffffff', { map: srRep(srTexLane(), 1400 / 50, 1), rough: 0.8 }), 0, 0.52, sz * 22, sz > 0 ? Math.PI : 0, -Math.PI / 2); lp.userData.noCast = true; scene.add(lp);
      KN.add(rb(1400, 0.62, 0.7, M.curb, 0, 0.31, sz * 18.2, 0)); KN.add(rb(1400, 1.12, 0.8, M.curb, 0, 0.56, sz * 26.3, 0));
      const sw = rbNC(1400, 1.0, 18, M.conc, 0, 0.5, sz * 35, 0); scene.add(sw);
      const sp = pl(1400, 17.4, c3Prop('#ffffff', { map: srRep(srTexPave(), 1400 / 26, 1), rough: 0.9 }), 0, 1.02, sz * 35, sz > 0 ? Math.PI : 0, -Math.PI / 2); sp.userData.noCast = true; scene.add(sp); } }
  // ---- row houses (south: front z -44 facing +z; north: front z +40 facing -z)
  const walls = ['#e8a640', '#c8503a', '#3aa0a0', '#e8c040', '#f0a8b0', '#4a88c8', '#f2d28a', '#e07848', '#8acaa8', '#d8584a', '#f4c070', '#5ab0b8'];
  const doors = ['#2a5a8a', '#2f6a4a', '#a83a2a', '#3a3a5a', '#e0b030', '#2a7a7a'], fl = ['#e8344a', '#f06aa0', '#ffd040', '#ffffff', '#a050d0', '#ff7a30'], shut = ['#2f6a4a', '#2a5a8a', '#c8402e', '#f2c23a', '#3a7aa8'];
  const roofs = ['#b8483a', '#a8402e', '#5a5a6a', '#c8583a', '#6a4a44'];
  SR.wells = [];
  let hi = 0;
  function house(x0, wW, side, o = {}) { const w = wW / SR_K;
    const R = RNG('srhouse', hi, side), floors = o.floors ?? (R.f() < 0.5 ? 3 : 4), type = o.type ?? R.pick(['step', 'curve', 'tri', 'eave', 'eave', 'step', 'curve']), wall = o.wall ?? walls[(hi * 5 + (side > 0 ? 3 : 0)) % walls.length];
    const brick = o.brick ?? (wall === '#c8503a' || wall === '#d8584a'), trim = brick ? '#f4ecdc' : (R.f() < 0.6 ? '#f6f0e4' : c3Shd(wall, 1.15)), bays = o.bays ?? (w < 16 ? 2 : 3), H = 18.5 + (floors - 1) * 14 + 2;
    const gh = type === 'eave' ? 0 : type === 'step' ? w * 0.78 : type === 'curve' ? w * 0.72 : w * 0.55, y0 = -6, top = H + gh + 0.5, D = 30;
    const g = new THREE.Group(); g.position.set(x0 + wW / 2, 1 - SR_K, side < 0 ? SR_FZ : SR_NZ); g.rotation.y = side < 0 ? 0 : Math.PI; g.scale.setScalar(SR_K);
    const kn = new THREE.Group(); kn.position.copy(g.position); kn.rotation.copy(g.rotation); kn.scale.setScalar(SR_K); KN.add(kn);
    const cellar = o.cellar ? { x: o.cellar.x ?? -w / 2 + 4.2, col: o.cellar.col ?? '#2a5a8a', name: o.cellar.name } : null;
    const facT = srTexFacade({ seed: hi * 7 + side, w, y0, top, H, gh, floors, bays, wall, trim, brick, plinth: o.plinth ?? c3Shd(brick ? '#a89888' : wall, brick ? 1 : 0.72), frame: o.frame ?? '#f6f1e6', door: o.door ?? doors[hi % doors.length], doorBay: o.doorBay ?? R.i(0, bays - 1), shop: o.shop, cellar, quoin: !brick && R.f() < 0.4, lintel: R.f() < 0.5 });
    const plain = (SR.plainC ||= {})[wall] ||= c3Prop(c3Shd(wall, 0.92), { rough: 0.9 });
    const fg = new THREE.ExtrudeGeometry(srFrontShape(type, w, H, gh, y0), { depth: 1.2, bevelEnabled: false, curveSegments: 6 }); fg.translate(0, 0, -1.2);
    const front = new THREE.Mesh(fg, [c3Prop('#ffffff', { map: facT, rough: 0.88 }), plain]); front.userData.keep = true; front.userData.noCast = true; kn.add(front);
    kn.add(srBox(w - 0.2, H - y0, D, plain, 0, (H + y0) / 2, -1.2 - D / 2));   // body
    // roof
    const rm = (SR.roofC ||= {})[hi % 5] ||= c3Prop('#ffffff', { map: srTexRoof(roofs[hi % 5], hi % 5), rough: 0.85 });
    if (type === 'eave') { const rs = new THREE.Shape(); rs.moveTo(0.6, H); rs.lineTo(-D - 1.8, H); rs.lineTo(-D / 2 - 0.6, H + 15); rs.lineTo(0.6, H);
      const rg = new THREE.ExtrudeGeometry(rs, { depth: w + 0.6, bevelEnabled: false }); rg.rotateY(Math.PI / 2); rg.translate(-(w + 0.6) / 2, 0, 0); const roof = new THREE.Mesh(rg, rm); kn.add(roof);
      kn.add(srBox(w + 1.4, 1.6, 1.8, (SR.trimC ||= {})[trim] ||= c3Prop(trim, { rough: 0.7 }), 0, H - 0.6, 0.4));   // cornice
      const nd = bays; for (let b = 0; b < nd; b++) { const dx = -w / 2 + (b + 0.5) * w / nd, dg = new THREE.Group(); dg.position.set(dx, H + 3.4, -4.6); kn.add(dg);   // dormers
        dg.add(srBox(3.8, 5.2, 4.5, plain, 0, 1.6, -1.2)); const dt = new THREE.Shape(); dt.moveTo(-2.5, 0); dt.lineTo(2.5, 0); dt.lineTo(0, 2.4); dt.lineTo(-2.5, 0);
        const dr = new THREE.Mesh(new THREE.ExtrudeGeometry(dt, { depth: 5.4, bevelEnabled: false }), rm); dr.position.set(0, 4.2, -4.0); dg.add(dr);
        dg.add(pl(2.4, 3.2, (SR.dwinM ||= c3Prop('#ffffff', { map: tex((x, ww, hh) => { srWin(x, ww * 0.12, hh * 0.1, ww * 0.76, hh * 0.8, { curtain: '#f4ecdc' }, RNG('dw')); }, 96, 128), rough: 0.5 })), 0, 1.8, 1.06)); } }
    else { const rs = new THREE.Shape(); rs.moveTo(-w / 2 + 0.3, H - 0.2); rs.lineTo(w / 2 - 0.3, H - 0.2); rs.lineTo(0, H + gh * (type === 'tri' ? 0.98 : 0.8)); rs.lineTo(-w / 2 + 0.3, H - 0.2);
      const rg = new THREE.ExtrudeGeometry(rs, { depth: D, bevelEnabled: false }); rg.translate(0, 0, -1.2 - D); kn.add(new THREE.Mesh(rg, rm));
      if (type === 'step') { const P = srGablePts('step', w, H, gh); for (let i = 1; i < P.length - 1; i += 2) for (const sx of [-1, 1]) kn.add(srBox(Math.abs(P[i][0] - P[i + 1][0]) + 0.6, 0.6, 1.6, (SR.trimC ||= {})[trim] ||= c3Prop(trim, { rough: 0.7 }), sx * (P[i][0] + P[i + 1][0]) / 2, P[i][1] + 0.3, -0.4)); kn.add(srCyl(0.35, 0.5, 2.4, plain, 0, H + gh + 1.2, -0.6, 8)); kn.add(srSph(0.55, plain, 0, H + gh + 2.6, -0.6)); }
      if (type === 'curve') { for (const sx of [-1, 1]) { const vo = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.35, 6, 14), (SR.trimC ||= {})[trim] ||= c3Prop(trim, { rough: 0.7 })); vo.position.set(sx * (w / 2 - 0.9), H + 1.0, 0.1); kn.add(vo); } kn.add(srSph(0.7, (SR.trimC)[trim], 0, H + gh * 1.03 + 0.5, -0.4)); }
      kn.add(srBox(w + 0.8, 1.0, 1.4, (SR.trimC ||= {})[trim] ||= c3Prop(trim, { rough: 0.7 }), 0, H - 0.5, 0.2)); }
    { const cm = c3Prop(brick ? '#a8483a' : c3Shd(wall, 0.85), { rough: 0.9 }); for (const cx of [w * 0.28 * (R.f() < 0.5 ? 1 : -1), -w * 0.1]) { const ch = R.r(7, 11); kn.add(srBox(2.4, ch, 2.4, cm, cx, H + (type === 'eave' ? 9 : gh * 0.55) + ch / 2 - 3, type === 'eave' ? -12 : -9)); kn.add(srBox(2.9, 0.6, 2.9, M.conc, cx, H + (type === 'eave' ? 9 : gh * 0.55) + ch - 2.7, type === 'eave' ? -12 : -9)); } }
    // window details: sills, flower boxes, shutters; floor cornice; drainpipe
    const bw = w / bays, trimM = (SR.trimC ||= {})[trim] ||= c3Prop(trim, { rough: 0.7 }), hasSh = R.f() < 0.4, shM = (SR.shC ||= {})[hi % 5] ||= c3Prop(shut[hi % 5], { rough: 0.6, map: (SR.louvT ||= srRep(tex((x, ww, hh) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, ww, hh); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 4; y < hh; y += 9) x.fillRect(4, y, ww - 8, 3); }, 32, 128), 1, 1)) });
    kn.add(srBox(w + 0.4, 0.9, 0.9, trimM, 0, 18.9, 0.45));
    for (let k = 1; k < floors; k++) { const yb = 18.5 + (k - 1) * 14; for (let b = 0; b < bays; b++) { const cx = -w / 2 + (b + 0.5) * bw, ww = Math.min(4.2, bw * 0.5);
      kn.add(srBox(ww + 1.0, 0.45, 0.9, trimM, cx, yb + 2.95, 0.45));
      if (hasSh) for (const sx of [-1, 1]) { const sh = srBox(ww * 0.52, 8.6, 0.3, shM, cx + sx * (ww * 0.5 + ww * 0.3 + 0.4), yb + 7.4, 0.2); sh.rotation.y = sx * 0.12; kn.add(sh); }
      if (R.f() < 0.45) { const bm = (SR.boxC ||= {})[b % 3] ||= c3Prop(['#5a8a3a', '#f4f0e6', '#c8683a'][b % 3], { rough: 0.7 }); kn.add(srBox(ww + 0.6, 1.1, 1.2, bm, cx, yb + 2.3, 1.1));
        for (let f = 0; f < 6; f++) { const fx = cx - ww / 2 + 0.3 + f * (ww - 0.6) / 5; kn.add(srSph(0.42, (SR.leafM ||= c3Prop('#3f8a3a', { rough: 0.8 })), fx, yb + 3.1, 1.2, 8, 6)); kn.add(srSph(0.38, (SR.flC ||= {})[f % 6 + hi % 3] ||= c3Prop(fl[(f + hi) % 6], { rough: 0.6 }), fx + 0.15, yb + 3.6, 1.35, 8, 6)); } } } }
    kn.add(srCyl(0.28, 0.28, H - 1, M.steel, w / 2 - 0.35, (H - 1) / 2 + 1, 0.4, 8));
    // front door stoop + canopy (residential)
    if (!o.shop) { const dc = -w / 2 + ((o.doorBay ?? R.i(0, bays - 1)) + 0.5) * bw; for (let k = 0; k < 2; k++) kn.add(srBox(5 - k, 0.6, 2.2 - k * 0.8, M.conc, dc, 1.3 + k * 0.6, 1.1 - k * 0.4)); }
    // cellar well: a pit in front of the facade with steps down, low walls, an iron railing, a hanging sign
    if (cellar) { const cx = cellar.x, wm = (SR.wellM ||= c3Prop('#9a8e82', { rough: 0.9 })), pitD = 4 / SR_K;
      kn.add(srBox(6.6, 0.4, pitD, M.conc, cx, -5.2, pitD / 2)); kn.add(srBox(6.6, 6.4, 0.4, wm, cx, -2.0, pitD + 0.2)); for (const sx of [-1, 1]) kn.add(srBox(0.4, 6.4, pitD, wm, cx + sx * 3.3, -2.0, pitD / 2));
      for (let k = 0; k < 6; k++) kn.add(srBox(1.05, 1.0 + k, pitD - 0.6, M.conc, cx + 2.75 - k * 1.0 + 0.5, -5 + (1 + k) / 2, pitD / 2 + 0.1));
      const rg = new THREE.Group(); kn.add(rg); for (let k = 0; k <= 6; k++) rg.add(srCyl(0.09, 0.09, 3.0, M.iron, cx - 3.2 + k * 1.07, 2.5, pitD + 0.1, 6)); rg.add(srBox(6.8, 0.25, 0.25, M.iron, cx, 4.0, pitD + 0.1));
      for (let k = 0; k <= 3; k++) rg.add(srCyl(0.09, 0.09, 3.0, M.iron, cx - 3.25, 2.5, k * pitD / 3, 6)); rg.add(srBox(0.25, 0.25, pitD + 0.2, M.iron, cx - 3.25, 4.0, pitD / 2));
      const sg = srBox(5.2, 1.6, 0.3, c3Prop('#ffffff', { map: srTexSign(cellar.name, cellar.col, '#fff4dc', { w: 320, h: 100 }), rough: 0.6 }), cx, 2.6, 0.2); sg.material = [M.iron, M.iron, M.iron, M.iron, sg.material, M.iron]; sg.userData.keep = true; kn.add(sg);
      SR.wells.push([x0 + wW / 2 + (side < 0 ? cx : -cx) * SR_K, side]); }
    hi++; return { g, kn, w: wW, H, gh, type, wall, trim, plain, R };
  }
  // south row (bakery x -9..9, cafe x -29..-9) and north row
  const southFixed = { '-9': { w: 18, o: { type: 'curve', floors: 4, wall: '#f2d28a', shop: { frame: '#2a4a3a', x0: -7.4, x1: 4.2, door: 6.2 }, bays: 3 } }, '-29': { w: 20, o: { type: 'eave', floors: 3, wall: '#3aa0a0', shop: { frame: '#f4f0e6', x0: -6.2, x1: 2.6, door: 4.8 }, bays: 3 } }, '-67': { w: 20, o: { type: 'step', floors: 4, wall: '#e07848', shop: { frame: '#f4f0e6', x0: -6.8, x1: 2.4, door: 5.0 }, bays: 3 } },
    '9': { w: 17, o: { type: 'step', floors: 4, wall: '#c8503a', cellar: { name: 'FRISØR', col: '#2a5a8a', x: 4.4 } } }, '-47': { w: 18, o: { type: 'tri', floors: 3, wall: '#e8c040', cellar: { name: 'VIN', col: '#8a2a3a', x: -4.6 } } },
    '26': { w: 19, o: { type: 'eave', floors: 4, wall: '#f0a8b0' } }, '45': { w: 16, o: { type: 'curve', floors: 3, wall: '#4a88c8', cellar: { name: 'ANTIK', col: '#6a4a2a', x: -3.2 } } } };
  for (const side of [-1, 1]) { const R = RNG('srrow', side); let x = side < 0 ? -9 : -200;
    if (side < 0) { for (const k of ['-9', '9', '26', '45']) { const f = southFixed[k]; house(+k, f.w, -1, f.o); } x = 61; while (x < 340) { const w = R.r(15, 22); house(x, w, -1, R.f() < 0.15 ? { cellar: { name: R.pick(['BLOMSTER', 'BOGHANDEL', 'KIOSK', 'SKO']), col: R.pick(['#2a6a4a', '#7a2a4a', '#2a4a7a']) } } : {}); x += w; }
      for (const k of ['-29', '-47', '-67']) { const f = southFixed[k]; house(+k, f.w, -1, f.o); } x = -67; while (x > -340) { const w = R.r(15, 22); house(x - w, w, -1, R.f() < 0.15 ? { cellar: { name: R.pick(['BLOMSTER', 'KIOSK', 'SKO']), col: R.pick(['#2a6a4a', '#7a2a4a']) } } : {}); x -= w; } }
    else { x = -340; while (x < 340) { const w = R.r(15, 22); house(x, w, 1, Math.abs(x - 10) < 12 ? { shop: { frame: '#7a2a2a', x0: -6, x1: 4, door: 5.8 }, type: 'eave', floors: 3 } : {}); x += w; } } }
  // the sidewalk strip along the south facades (z -44..-40) with gaps over the cellar wells (the main sidewalk box covers -40..-21)
  { const gaps = SR.wells.filter((w) => w[1] < 0).map((w) => w[0]).sort((a, b) => a - b); let x = -700; for (const gx of [...gaps, 700 + 3.3 * SR_K]) { const x1 = gx - 3.3 * SR_K; if (x1 > x) { scene.add(rbNC(x1 - x, 1.0, 4, M.conc, (x + x1) / 2, 0.5, SR_FZ + 2, 0)); const sp = pl(x1 - x, 4, c3Prop('#ffffff', { map: srRep(srTexPave(), (x1 - x) / 26, 0.2), rough: 0.9 }), (x + x1) / 2, 1.02, SR_FZ + 2, 0, -Math.PI / 2); sp.userData.noCast = true; scene.add(sp); } x = gx + 3.3 * SR_K; }
    const gapsN = SR.wells.filter((w) => w[1] > 0).map((w) => w[0]).sort((a, b) => a - b); x = -700; for (const gx of [...gapsN, 700 + 3.3 * SR_K]) { const x1 = gx - 3.3 * SR_K; if (x1 > x) scene.add(rbNC(x1 - x, 1.0, 4, M.conc, (x + x1) / 2, 0.5, SR_NZ - 2, 0)); x = gx + 3.3 * SR_K; } }
  // move the main sidewalk boxes to z -40.5..-20.5 / 20.5..40.5 (they were 20.5..40.5 already)
  // ---- the bakery: bay window with the cake, BAGERI board, the kringle on its bracket, pastries, a sandwich board
  { const g = srAt(new THREE.Group(), 0, 1 - SR_K, SR_FZ); g.scale.setScalar(SR_K); scene.add(g); s.bakery = g; const cr = c3Prop('#f4ecdc', { rough: 0.6 }), gr = c3Prop('#2a4a3a', { rough: 0.5 }), cu = c3Prop('#5aa890', { rough: 0.4, metal: 0.3 });
    g.add(srRB(9.2, 2.4, 4.6, gr, -1.6, 2.2, 2.3, 0.2)); g.add(srBox(8.8, 0.3, 4.2, cr, -1.6, 3.5, 2.3));   // base + display floor
    g.add(srRB(9.6, 0.8, 5.0, gr, -1.6, 12.4, 2.4, 0.2)); { const rf = srCyl(0.1, 6.4, 1.6, cu, -1.6, 13.6, 2.4, 4); rf.rotation.y = Math.PI / 4; rf.scale.set(1, 1, 0.72); g.add(rf); }
    for (const [x, z] of [[-6.1, 4.6], [2.9, 4.6], [-6.1, 0.3], [2.9, 0.3]]) g.add(srBox(0.45, 9, 0.45, gr, x, 7.7, z));
    for (const x of [-3.1, -0.1]) g.add(srBox(0.18, 9, 0.18, gr, x, 7.7, 4.62)); g.add(srBox(9.0, 0.2, 0.2, gr, -1.6, 10.4, 4.62)); for (const sx of [-6.1, 2.9]) g.add(srBox(0.18, 0.2, 4.3, gr, sx, 10.4, 2.45));
    const gm = c3Prop('#dcecf4', { rough: 0.05, env: 2.2, metal: 0.3, transparent: true }); gm.opacity = 0.1; gm.depthWrite = false;
    for (const [w, x, z, ry] of [[9.0, -1.6, 4.62, 0], [4.3, -6.1, 2.45, Math.PI / 2], [4.3, 2.9, 2.45, Math.PI / 2]]) { const p = pl(w, 8.6, gm, x, 7.8, z, ry); p.userData.keep = true; p.userData.noCast = true; g.add(p); }
    s.cake = srCake(); s.cake.position.set(-1.6, 3.65, 2.6); s.cake.scale.setScalar(1.0); g.add(s.cake); g.updateMatrixWorld(true); s.cakeW = g.localToWorld(V3(-1.6, 6.3, 2.6));
    for (let i = 0; i < 4; i++) { const sw = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.22, 8, 14), c3Prop('#c8783a', { rough: 0.7 })); sw.rotation.x = -Math.PI / 2; sw.position.set(-5.2 + i * 0.95 + (i > 1 ? 5.2 : 0), 3.85, 3.9 - (i % 2) * 1.1); g.add(sw); }   // kanelsnegle on the display floor
    for (let i = 0; i < 3; i++) { const b = srSph(0.6, c3Prop('#e8b060', { rough: 0.6 }), 1.6 + (i % 2) * 0.8, 3.95, 1.2 + i * 1.0, 10, 8); b.scale.y = 0.6; g.add(b); }
    // the KAGE label: a little folded card on the display floor in front of the cake, turned toward the street + the -x sidewalk
    { const lm = c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#fbf4e4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8344a'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12); inked(x, 'KAGE', w / 2, h / 2 + 3, h * 0.52, '#c8344a', { stroke: false, maxW: w * 0.82 }); }, 256, 128), rough: 0.7 });
      const lb = new THREE.Group(); lb.position.set(-3.6, 3.65, 3.9); lb.rotation.y = -0.75; g.add(lb); const card = pl(2.4, 1.2, lm, 0, 0.62, 0, 0, -0.12); card.userData.keep = true; lb.add(card); lb.add(srBox(2.4, 1.2, 0.04, cr, 0, 0.6, -0.2)); s.kage = lb; }
    g.add(srBox(11.8, 2.4, 0.5, c3Prop('#ffffff', { map: srTexSign('BAGERI', '#2a4a3a', '#f2d070', { k: 0.62 }), rough: 0.6 }), -1.6, 16.6, 0.3)); g.children.at(-1).material = [gr, gr, gr, gr, g.children.at(-1).material, gr];
    // the kringle on its iron bracket (sticking out from the facade at x +7)
    { const br = new THREE.Group(); br.position.set(6.8, 21.5, 0); g.add(br); br.add(srBox(0.3, 0.3, 6.0, M.iron, 0, 0, 3.0)); br.add(srTube(V3(0, -2.4, 0.2), V3(0, 0, 3.6), 0.12, M.iron));
      for (let k = 0; k < 3; k++) { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.07, 4, 12), M.iron); sc.position.set(0, -0.6, 1.2 + k * 1.3); sc.rotation.y = Math.PI / 2; br.add(sc); }
      s.kringle = srKringle(); s.kringle.position.set(0, -4.6, 4.6); s.kringle.rotation.y = Math.PI / 2; s.kringle.scale.setScalar(0.85); br.add(s.kringle); s.kringle.userData.keep = true; s.kringle.traverse((m) => { m.userData.keep = true; }); }
    // sandwich board KAGE · KAFFE on the sidewalk by the door
    { const sb = srAt(new THREE.Group(), -76, 1, SR_FZ + 3.2, 0.3); sb.scale.setScalar(SR_K); scene.add(sb); const bm = c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#2a2a2e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c89a5a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
        inked(x, 'KAGE', w / 2, h * 0.3, h * 0.17, '#f4f0e6', { stroke: false, maxW: w * 0.8 }); inked(x, 'KAFFE', w / 2, h * 0.55, h * 0.13, '#f2c040', { stroke: false, maxW: w * 0.8 }); inked(x, '25 kr', w / 2, h * 0.78, h * 0.1, '#f4f0e6', { stroke: false, maxW: w * 0.8 }); }, 256, 384), rough: 0.6 });
      for (const sz of [-1, 1]) { const p = srBox(3.2, 4.8, 0.25, M.wood, 0, 2.5, sz * 0.7); p.rotation.x = sz * 0.16; sb.add(p); const f = pl(2.8, 4.2, bm, 0, 2.55, sz * 0.86, sz < 0 ? Math.PI : 0, sz * 0.16); sb.add(f); } K.add(sb); scene.remove(sb); }
    s.cakeLight = new THREE.PointLight('#ffd08a', 0, 16, 1.6); s.cakeLight.position.set(-1.6, 9.5, 3.0); s.cakeLight.layers.enableAll(); g.add(s.cakeLight); }
  // ---- flower buckets outside the BLOMSTER shop (x -29..-9), low against the facade
  { const R = RNG('srflow'), zinc = c3Prop('#a8b4bc', { metal: 0.5, rough: 0.35 }), st = c3Prop('#3f8a3a', { rough: 0.8 }), fl2 = ['#e8344a', '#f06aa0', '#ffd040', '#ffffff', '#a050d0', '#ff7a30'];
    for (let i = 0; i < 7; i++) { const x = -27 + i * 2.6, z = SR_FZ + 1.6 + (i % 2) * 1.3; K.add(srCyl(1.0, 0.8, 2.2, zinc, x, 2.1, z, 12)); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, r = 0.6 * R.f(); K.add(srCyl(0.05, 0.05, 2.2, st, x + Math.cos(a) * r, 3.9, z + Math.sin(a) * r, 4)); K.add(srSph(0.42, (SR.flC2 ||= {})[i % 6] ||= c3Prop(fl2[i % 6], { rough: 0.6 }), x + Math.cos(a) * r * 1.3, 5.1 + R.f() * 0.6, z + Math.sin(a) * r * 1.3, 8, 6)); } }
    const sg = srBox(10, 1.8, 0.3, c3Prop('#ffffff', { map: srTexSign('BLOMSTER', '#3aa0a0', '#fff4dc', { k: 0.5 }), rough: 0.6 }), -21, 24.5, SR_FZ + 0.4); sg.material = [M.white, M.white, M.white, M.white, sg.material, M.white]; sg.userData.keep = true; K.add(sg); }
  // ---- the cafe (x -67..-47): CAFÉ board, striped awning, tables with parasols, chairs, cups
  { const g = srAt(new THREE.Group(), -57, 1 - SR_K, SR_FZ); g.scale.setScalar(SR_K); K.add(g); const aw = c3Prop('#ffffff', { rough: 0.8, map: tex((x, w, h) => { for (let i = 0; i < 12; i++) { x.fillStyle = i % 2 ? '#fbf4e6' : '#c8343a'; x.fillRect(i * w / 12, 0, w / 12 + 1, h); } x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(0, h * 0.8, w, h * 0.2); }, 256, 64) });
    const awn = srBox(18, 0.3, 5.6, aw, 0, 17.2, 2.6); awn.rotation.x = 0.36; g.add(awn); for (let i = 0; i < 12; i++) { const fl2 = srBox(1.5, 0.9, 0.12, aw, -8.25 + i * 1.5, 15.8, 5.3); g.add(fl2); }
    const sg = srBox(12, 2.2, 0.5, c3Prop('#ffffff', { map: srTexSign('CAFÉ', '#f4f0e6', '#c8343a', { k: 0.62, stroke: '#3a1a12', edge: '#c8343a' }), rough: 0.6 }), -2, 20.2, 0.3); sg.material = [M.white, M.white, M.white, M.white, sg.material, M.white]; g.add(sg);
    const um = [['#ffffff', '#3aa0a0'], ['#ffffff', '#c8343a'], ['#ffffff', '#e8a640']];
    for (const [i, tx] of [[0, -5.2], [1, 0.4], [2, 5.8]]) { const t = new THREE.Group(); t.position.set(tx, 1, 6.2 + (i % 2) * 1.2); g.add(t);
      t.add(srCyl(1.8, 1.8, 0.2, M.white, 0, 4.0, 0, 20)); t.add(srCyl(0.15, 0.15, 4, M.iron, 0, 2, 0, 8)); t.add(srCyl(1.0, 1.0, 0.15, M.iron, 0, 0.08, 0, 12));
      t.add(srCyl(0.16, 0.16, 13, M.white, 0, 6.5, 0, 8)); const cone = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.2, 12, 1, true), c3Prop('#ffffff', { rough: 0.8, side: THREE.DoubleSide, map: tex((x, w, h) => { for (let k = 0; k < 12; k++) { x.fillStyle = k % 2 ? um[i][0] : um[i][1]; x.fillRect(k * w / 12, 0, w / 12 + 1, h); } }, 256, 32) })); cone.material.side = THREE.DoubleSide; cone.position.y = 13.6; t.add(cone);
      for (const a of [0.6, 2.6, 4.4]) { const c = new THREE.Group(); c.position.set(Math.cos(a) * 3.2, 0, Math.sin(a) * 3.2); c.rotation.y = -a + Math.PI / 2; t.add(c); c.add(srBox(1.8, 0.25, 1.8, M.wood, 0, 2.6, 0)); c.add(srBox(1.8, 2.4, 0.2, M.wood, 0, 3.9, -0.85)); for (const [lx, lz] of [[-0.75, -0.75], [0.75, -0.75], [-0.75, 0.75], [0.75, 0.75]]) c.add(srBox(0.16, 2.6, 0.16, M.iron, lx, 1.3, lz)); }
      t.add(srCyl(0.35, 0.28, 0.6, M.white, 0.6, 4.4, 0.3, 10)); t.add(srCyl(0.33, 0.33, 0.05, c3Prop('#6a3a1e'), 0.6, 4.72, 0.3, 10)); }
    for (let k = 0; k < 3; k++) g.add(srCyl(1.1, 0.9, 2.2, c3Prop('#c8683a', { rough: 0.8 }), 9.5 + k * 0.1, 2.1, 1.2 + k * 2.4, 12)), g.add(srSph(1.4, SR.leafM || c3Prop('#3f8a3a'), 9.5, 4.0, 1.2 + k * 2.4, 10, 8)); }
  // ---- bikes: leaning on facades + in racks at the curb (kept clear of the action corridors x -36..30 near the curb)
  { const R = RNG('srbikes'), cols = ['#2a2a30', '#c8343a', '#2f6fb8', '#f4f0e6', '#3a8a5a', '#e8a640', '#8a5ac8', '#5ab0b8', '#f06aa0', '#6a6a72'];
    const lean = (x, z, ry, sc = 1.3) => { const b = srBike(R.pick(cols), R); b.scale.setScalar(sc); b.position.set(x, 1, z); b.rotation.set(0, ry, R.r(-0.2, -0.12)); K.add(b); };
    for (const x of [-60, -53, -70, 21, 70, 78, 95, 120, 150, -90, -110, 34]) lean(x, SR_FZ + 2.4, R.f() < 0.5 ? 0 : Math.PI);
    for (const x of [-50, -30, 0, 30, 60, 90, -80, 110]) lean(x, SR_NZ - 2.4, R.f() < 0.5 ? 0 : Math.PI);
    const rack = (x0, n, z) => { for (let i = 0; i < n; i++) { const x = x0 + i * 4.2, h = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.2, 6, 16, Math.PI), M.steel); h.position.set(x, 1, z); h.rotation.y = Math.PI / 2; K.add(h);
      if (R.f() < 0.85) { const b = srBike(R.pick(cols), R); b.scale.setScalar(1.3); b.position.set(x + 0.7, 1, z); b.rotation.set(0, Math.PI / 2 + R.n(0.1), R.n(0.05)); K.add(b); } } };
    rack(40, 7, -28.6); rack(-100, 8, -28.6); rack(-68, 6, -28.6); rack(76, 6, -28.6); rack(-44, 8, 28.6); rack(8, 7, 28.6); rack(62, 6, 28.6); }
  // ---- street trees in pits, lampposts, lamps hung on wires across the street, parked cars, flags
  for (const [x, z, sd] of [[-50, -29.5], [44, -29.5], [94, -29.5], [-112, -29.5], [142, -29.5], [-60, 29.5], [-10, 29.5], [40, 29.5], [100, 29.5], [160, 29.5], [-130, 29.5]].map((v, i) => [v[0], v[1], i + 3])) { K.add(srCyl(2.4, 2.4, 0.3, c3Prop('#5a4632', { rough: 0.95 }), x, 1.1, z, 12)); const tr = c3LeafTree(4.2, sd, sd % 2 ? '#4f8a3a' : '#62a044'); tr.position.set(x, 1, z); K.add(tr); }
  function lamp(x, z) { const g = srAt(new THREE.Group(), x, 1, z); g.add(srCyl(1.1, 1.3, 2.4, M.green, 0, 1.2, 0, 12)); g.add(srCyl(0.38, 0.5, 26, M.green, 0, 14, 0, 10)); for (const y of [3, 26.8]) g.add(srCyl(0.7, 0.7, 0.6, M.green, 0, y, 0, 10));
    g.add(srCyl(1.2, 0.8, 3.2, M.glassE, 0, 29.2, 0, 6)); g.add(srCyl(0.3, 1.6, 1.0, M.green, 0, 31.3, 0, 6)); g.add(srSph(0.4, M.green, 0, 32.1, 0, 8, 6)); K.add(g); }
  for (const [x, z] of [[-78, -27.2], [64, -27.2], [-20, 27.2], [110, 27.2], [180, -27.2]]) lamp(x, z);
  for (const x of [-34, 52, 140]) { const wire = srTube(V3(x, 66, SR_FZ), V3(x, 61, 0), 0.08, M.dark); K.add(wire); K.add(srTube(V3(x, 61, 0), V3(x, 66, SR_NZ), 0.08, M.dark));
    K.add(srCyl(0.1, 0.1, 2, M.dark, x, 60, 0, 4)); K.add(srCyl(0.6, 2.2, 1.6, M.green, x, 58.4, 0, 12)); K.add(srSph(0.9, M.glassE, x, 57.5, 0, 10, 8)); }
  for (const [x, z, c, kd] of [[44, 11.5, '#f4f0e6', 'hatch'], [78, 11.5, '#2f6fb8', 'sedan'], [120, 11.5, '#3f8a5a', 'hatch'], [-70, 11.5, '#e8c040', 'hatch'], [-114, 11.5, '#8a8e96', 'sedan'], [100, -11.5, '#5ab0b8', 'hatch'], [-98, -11.5, '#c86a3a', 'sedan']]) { const car = c3Car({ color: c, kind: kd, scale: 5.3 }); car.position.set(x, 0, z); car.rotation.y = z > 0 ? Math.PI : 0; K.add(car); }
  s.flags = []; { const fm = c3Prop('#ffffff', { map: srTexFlag(), rough: 0.8 }); fm.side = THREE.DoubleSide;
    for (const [x, y, side] of [[18, 46, -1], [-38, 42, -1], [54, 52, -1], [-6, 48, 1], [70, 46, 1], [-60, 50, 1]]) { const z0 = side < 0 ? SR_FZ + 0.2 : SR_NZ - 0.2, dz = -side;
      K.add(srTube(V3(x, y, z0), V3(x, y + 6.5, z0 + dz * 6.5), 0.18, M.white)); K.add(srSph(0.35, c3Prop('#e8c04a', { metal: 0.6, rough: 0.3 }), x, y + 6.7, z0 + dz * 6.7, 8, 6));
      const f = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 4.4, 14, 4), fm); f.position.set(x, y + 3.6, z0 + dz * 6.2); f.rotation.y = Math.PI / 2; f.userData.base = Float32Array.from(f.geometry.attributes.position.array); f.userData.keep = true; f.userData.ph = x * 0.13; scene.add(f); s.flags.push(f); } }
  // ---- the ends of the street: a church with a green copper spire (+x) and a tower with a copper dome (-x)
  { const cu = c3Prop('#6ab8a0', { rough: 0.45, metal: 0.3 }), br = c3Prop('#c8644a', { rough: 0.9 }), gd = c3Prop('#e8c04a', { metal: 0.6, rough: 0.3 });
    const ch = srAt(new THREE.Group(), 420, 0, 0); KN.add(ch); ch.add(srBox(40, 60, 40, br, 0, 30, 0)); ch.add(srBox(26, 50, 26, br, 0, 85, 0)); ch.add(srBox(28, 2, 28, c3Prop('#f4ecdc'), 0, 110, 0));
    const sp = new THREE.Mesh(new THREE.ConeGeometry(15, 90, 8), cu); sp.position.y = 156; ch.add(sp); ch.add(srSph(2, gd, 0, 203, 0));
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, cl = srCyl(5, 5, 0.5, c3Prop('#f8f2e0'), Math.sin(a) * 13.3, 92, Math.cos(a) * 13.3, 20); cl.rotation.set(Math.PI / 2, 0, 0); cl.rotation.y = a; ch.add(cl); }
    const tw = srAt(new THREE.Group(), -420, 0, 0); KN.add(tw); tw.add(srBox(34, 80, 34, c3Prop('#e8c088', { rough: 0.9 }), 0, 40, 0)); tw.add(srCyl(16, 16, 14, c3Prop('#e8c088'), 0, 87, 0, 16)); const dm = srSph(17, cu, 0, 94, 0, 20, 12); dm.scale.y = 0.9; tw.add(dm); tw.add(srCyl(2, 0.3, 26, cu, 0, 120, 0, 8)); tw.add(srSph(2, gd, 0, 134, 0)); }
  // ---- bake
  scene.add(srBake(K)); scene.add(srBake(KN, { noCast: true }));
  SR.K = K;
  return s;
}
const SR_get = () => SR.s ||= srBuildAll();
SETS.street = SR_get;

// ---- the car (a red hatch that screeches up, curb-side doors that fly open) + the FOCUS kit (people, props, puffs)
function srCarBuild(s) { const G = new THREE.Group(); s.scene.add(G); const B = new THREE.Group(); G.add(B); const car = c3Car({ color: '#d8343a', kind: 'hatch' }); B.add(car); G.scale.setScalar(5.3);
  const paint = C3X_M['paint#d8343a'], glass = C3X_M.glass; s.doors = [];
  for (const [hx, len] of [[0.95, 1.22], [-0.3, 1.2]]) { const pv = new THREE.Group(); pv.position.set(hx, 0, 0.99); B.add(pv);
    const pan = new THREE.Mesh(c3RBox(len, 0.72, 0.06, 0.03, 2), paint); pan.position.set(-len / 2, 0.55 + 0.38, 0); pv.add(pan);
    const win = new THREE.Mesh(c3RBox(len * 0.92, 0.5, 0.05, 0.03, 2), glass); win.position.set(-len / 2, 1.3 + 0.27, 0); pv.add(win);
    const fr = new THREE.Mesh(c3RBox(len, 0.06, 0.07, 0.02, 1), paint); fr.position.set(-len / 2, 1.84, 0); pv.add(fr);
    const hd = new THREE.Mesh(c3RBox(0.18, 0.05, 0.06, 0.02, 1), C3X_M.chrome); hd.position.set(-len + 0.22, 1.12, 0.05); pv.add(hd); s.doors.push(pv); }
  s.car = G; s.carB = B; G.traverse((m) => { if (m.isMesh) m.userData.noShade = true; }); return G; }
// car x (centre) at t: comes in fast from far +x along the south lane, brakes 9.80-10.25, stops at x = 12 (heading -x)
const SR_CARX = (t) => t < 9.8 ? 26 + 60 + 267 * (9.8 - t) : t < 10.25 ? 26 + 60 * (1 - (t - 9.8) / 0.45) ** 2 : 26;
const SR_CARZ = -8;
function srCarAt(s, t) { const G = s.car; G.visible = t < 30 && t > 9.2; if (!G.visible) return; const x = SR_CARX(t);
  const sk = t > 9.9 && t < 10.7 ? Math.exp(-(t - 9.9) * 5) * Math.sin((t - 9.9) * 16) : 0;
  G.position.set(x, 0, SR_CARZ); G.rotation.y = Math.PI + 0.1 * sk;
  const dip = t < 9.8 ? 0 : t < 10.25 ? -0.05 * EZ.io((t - 9.8) / 0.3) : -0.05 * Math.exp(-(t - 10.25) * 6) * Math.cos((t - 10.25) * 18); s.carB.rotation.z = dip; s.carB.position.y = t > 10.25 && t < 10.8 ? 0.03 * Math.exp(-(t - 10.25) * 6) * Math.sin((t - 10.25) * 18) : 0;
  s.doors.forEach((d, i) => { const t0 = 10.34 + i * 0.07, u = clamp((t - t0) / 0.26); d.rotation.y = 1.25 * (u < 1 ? EZ.back(u) : 1); }); }
// the friends' door gaps and their landing marks (a03 positions), the hero's marks
const SR_GAP = { fRope: V3(23.5, 0, -14.3), fBucket: V3(29.5, 0, -14.3), fSpice: V3(32.6, 0, -14.5) };
const SR_LAND = { fRope: V3(9.5, 1, -38), fBucket: V3(14.5, 1, -34.5), fSpice: V3(24, 1, -40.5) };
const SR_JUMP = { fSpice: [11.04, 0.36, 6.0], fRope: [11.14, 0.36, 6.6], fBucket: [11.24, 0.36, 6.2] };   // takeoff, flight time, arc height
const SR_H0 = V3(7.5, 1, -38), SR_H1 = V3(3.5, 1, -40.2), SR_HB = V3(-12, 1, -40);
function srBuildAll() { const s = srBuild(), scene = s.scene;
  srCarBuild(s);
  toonPerson(s, 'hero'); toonPerson(s, 'fRope'); toonPerson(s, 'fBucket'); toonPerson(s, 'fSpice'); toonPerson(s, 'passer');
  // the cinnamon-dusted passer: her card's colour pass tints the dress / limbs toward cinnamon + speckles; the head only lightly,
  // never on the dark ink (eyes, brows, mouth stay clean)
  { const p = s.p.passer, mt = p.mat, prev = mt.onBeforeCompile, d = t3Dims(p.o); SR.dustU = { srDust: { value: 1 }, srNeck: { value: (d.legL + d.Th + 25) / 1000 - 0.012 }, srHip: { value: (d.legL + 25) / 1000 + 0.01 } };
    mt.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); Object.assign(sh.uniforms, SR.dustU);
      sh.fragmentShader = 'uniform float srDust; uniform float srNeck; uniform float srHip;\n' + sh.fragmentShader.replace('#include <map_fragment>', [
        '#include <map_fragment>',
        '{ vec3 cin = vec3(0.72, 0.42, 0.2); float L = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11)); float body = 1.0 - smoothstep(srNeck - 0.01, srNeck + 0.01, vUv.y);',
        '  vec2 q = floor(vUv * vec2(230.0, 383.0)); float h = fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453);',
        '  float ok = smoothstep(0.2, 0.34, L);',
        '  float torso = smoothstep(srHip - 0.01, srHip + 0.01, vUv.y) * body;',
        '  float spk = step(1.0 - mix(0.04, 0.2, body), h) * ok * srDust * mix(1.0, torso, body);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.0, 0.8, 0.58), body * srDust * ok * 0.6);',
        '  diffuseColor.rgb = mix(diffuseColor.rgb, cin * (0.75 + 0.5 * fract(h * 7.0)), spk * mix(0.55, 0.9, body)); }'].join('\n')); };
    mt.customProgramCacheKey = () => 't3card-srdust'; mt.needsUpdate = true; }
  const Fg = new THREE.Group(); scene.add(Fg);
  s.rope = srRope(); s.bucket = srBucket(); s.sack = srSack(); s.bag = srWorkBag(); s.pflag = srPaperFlag(); [s.rope, s.bucket, s.sack, s.bag, s.pflag].forEach((o) => Fg.add(o));
  s.drops = []; for (let i = 0; i < 9; i++) { const d = srSph(0.22, c3Prop('#5ab8f0', { rough: 0.05, env: 2 }), 0, 0, 0, 8, 6); Fg.add(d); s.drops.push(d); }
  c3Layer(Fg, C3.L_FOCUS);
  const pc = srPuffTex('#b8743a'), ps = srPuffTex('#ece8e4'), wt = srWispTex();
  s.cin = []; for (let i = 0; i < 6; i++) s.cin.push(spritePlane(scene, pc, 4, 4, 12));
  s.smoke = []; for (let i = 0; i < 8; i++) s.smoke.push(spritePlane(scene, ps, 5, 5, 3));
  s.wisps = []; for (let i = 0; i < 5; i++) s.wisps.push(spritePlane(scene, wt, 2.0, 4.0, 11));
  s.glow = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,236,190,0.9)'); gr.addColorStop(0.35, 'rgba(255,205,120,0.4)'); gr.addColorStop(1, 'rgba(255,180,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,250,225,0.95)'; for (const [x, y, r] of [[0.3, 0.25, 9], [0.74, 0.32, 7], [0.62, 0.15, 5], [0.2, 0.55, 6]]) { g.save(); g.translate(w * x, h * y); for (const a of [0, Math.PI / 2]) { g.rotate(a); g.beginPath(); g.moveTo(-r * 2.2, 0); g.quadraticCurveTo(0, -r * 0.25, r * 2.2, 0); g.quadraticCurveTo(0, r * 0.25, -r * 2.2, 0); g.fill(); } g.restore(); } }, 256, 256), 7, 7, 4);
  s.glow.material.blending = THREE.AdditiveBlending; [s.glow, ...s.wisps, ...s.smoke, ...s.cin].forEach((m) => { m.userData.noInk2 = true; });
  c3Env(scene, { top: '#a8c4f4', mid: '#c4c0d4', bot: '#7a6a5a' }); c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.5, scale: 0.3, inkSet: false, grimeH: 5, floorY: 0, bounce: ['#9cb6ec', '#d09a68', 0.12] });
  // the car's FOCUS depth stand-in (after the look pass): the friends inside the car stay hidden until they step out of the doors
  { const om = new THREE.MeshBasicMaterial({ colorWrite: false }); om.userData.c3keep = true; const oc = new THREE.Mesh(new THREE.BoxGeometry(3.86, 2.0, 1.9), om); oc.position.set(0, 1.04, 0);
    Object.assign(oc.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); oc.renderOrder = -5; c3Layer(oc, C3.L_FOCUS); s.carB.add(oc);
    s.doors.forEach((pv, i) => { const len = i ? 1.2 : 1.22, d = new THREE.Mesh(new THREE.BoxGeometry(len, 1.32, 0.08), om); d.position.set(-len / 2, 1.22, 0); Object.assign(d.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); d.renderOrder = -5; c3Layer(d, C3.L_FOCUS); pv.add(d); }); }
  // 3b) the shoulder strap: a tube from the hand on the strap up over the shoulder (FOCUS, in front of the card)
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 8), c3Prop('#5a2e1a', { rough: 0.6 })); m.userData.noCast = true; c3Layer(m, C3.L_FOCUS); scene.add(m); s.strap = m; m.visible = false; }
  return s; }

// ---- the camera path (absolute s). 7.70-16.56 (a01 a02 a03), 49.76-56.76 (a04 a05 a06); phantom keys outside so the whips move
const SR_CAMRAW = [
  // a01: whip in panning right; lateral track from the road side as he walks home (-x) along the sidewalk; push to the bakery on 'cake'
  [7.45, [12, 6.5, -5], [19, 8, -38], 40, -5],
  [7.70, [8, 6.5, -6], [18, 8, -38], 40, -3],
  [8.55, [-4, 6.6, -8], [11, 8, -38], 40, 2],
  [9.30, [-19.5, 10, -4], [2.8, 8, -40], 40, -2],                  // 'cake': the bay with the lit cake + him, dreamy
  [9.62, [-18.5, 9.8, -6.5], [3, 8, -40], 38, 1],
  // a02: swing right onto the car as it screeches up ('suddenly'), land on the open doors on 'friends', crane down + orbit as they land on 'jump'
  [10.20, [-10, 8.8, -15], [18, 7, -24], 38, -2],
  [10.84, [-6, 11, -25], [27, 6.5, -14], 40, 3],               // 'friends': the car's curb side, doors open, the three in the gaps
  [11.60, [-15.3, 8.5, -13.7], [13, 9.5, -37.5], 54, -2],   // they land: the whole group, wide
  [12.12, [-8.7, 8.5, -8.2], [12.5, 9, -38.5], 56, 0],
  [12.60, [-1.1, 8.5, -6.0], [12, 9, -38.5], 56, 2],   // 'rope': lean in on the coil, everyone whole
  [13.58, [5.0, 8.5, -4.0], [13.5, 9, -38], 56, -2],   // 'bucket'
  [14.15, [0.0, 8.5, -5.6], [12, 9, -38.5], 56, 0],
  [14.70, [-3.9, 9, -8.4], [11, 9, -39], 56, 3],   // the gulp: still the whole group
  [15.10, [1.2, 9.5, -4.7], [13.5, 10, -38.5], 56, 0],
  [15.48, [5.4, 10, -4.9], [15, 10, -38.5], 54, -3],   // 'bag'
  [16.04, [11.1, 10.5, -12.2], [21, 10, -39.5], 48, -6],   // 'cinnamon': push between the bucket + the sack, roll
  [16.56, [11.9, 11, -13.2], [21.5, 10, -39.5], 47, -4],
  [16.80, [14.9, 11, -8.7], [24.5, 10, -35], 47, -2],   // phantom: pans right through the whip out
  // a04: whip in (panning right) on the street, later; lateral track with the cinnamon woman, she passes him on 'past', orbit
  [49.52, [-34, 8, -6], [-26, 8, -40], 44, -4],
  [49.76, [-30, 8, -6], [-19, 8.2, -38], 44, -3],
  [51.00, [-8, 7, -10], [-15, 7.8, -36], 40, 2],
  [52.10, [-28, 6.4, -16], [-11, 7.8, -37], 36, -2],            // 'past': she passes him (no overlap from this side)
  [53.10, [-9, 7, -10], [-8.5, 8, -37], 40, 3],                 // 'dessert': orbit out to both + the trailing scent
  // a05: he raises a finger; push on her glare on 'love'; swing to him
  [53.90, [-1, 7.5, -10], [-5, 8.5, -36.5], 48, -1],          // 'don't ask': 2-shot, he raises a finger
  [54.50, [6, 8.5, -12], [-5, 9, -35.5], 44, -4],               // 'love': push on her glare, him behind her in frame
  [55.15, [-1, 8.5, -8], [-6.5, 8.5, -36.5], 46, 2],            // swing out to the 2-shot: he shuts his mouth
  // a06: orbit the 2-shot, crane up a little on 'happy birthday'
  [55.90, [-5, 10, -4], [-6.5, 8.6, -36.5], 46, -2],
  [56.50, [-6, 14.5, -3], [-6.5, 8.8, -36], 46, 2],
  [56.76, [-6, 15, -3], [-6, 9, -35.5], 46, 3],
  [57.00, [-6.5, 15.2, -3], [-3, 9, -34.5], 46, 4],            // phantom
];
// framing distance: the raw keys pulled back along their view line (people are ~12.5 tall; Ricks frames them whole)
const SR_PULL = (t) => t < 30 ? 1.25 : 1.2;
CAMSEQ.street = SR_CAMRAW.map(([t, P, L, f, r]) => [t, P.map((v, i) => i === 1 ? v : L[i] + (v - L[i]) * SR_PULL(t)), L, f, r]);

// ---- state helpers
function srShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; k.intensity = (k.userData.I ?? 2.5) * (C3_SHADOW.key ?? 1); if (!k.castShadow) return;
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(k.userData.dir, 220); }
// hero walk (a01): x along z = -34 from 20 (7.70) to 6.5 (stops 9.30), Hermite into the stop
function srHeroX(t) { const v = 8.85; if (t < 9.0) return 20 - v * (t - 7.70); const u = clamp((t - 9.0) / 0.3), p0 = 20 - v * 1.3, m0 = -v * 0.3, p1 = SR_H0.x;
  return (2 * u ** 3 - 3 * u ** 2 + 1) * p0 + (u ** 3 - 2 * u ** 2 + u) * m0 + (-2 * u ** 3 + 3 * u ** 2) * p1; }
const SR_STRAP = SR_GRIP(0.16, 0.02, { pole: [1, 0.7] });
const SR_WAVE = (t, t0, grip) => (Math.floor((t - t0) / 0.2) % 2 ? { h: grip ? [0.5, -0.72] : [0.64, -0.46], pole: [1, 0.4], hand: grip ? 'grip' : 'open' } : { h: grip ? [0.3, -0.8] : [0.4, -0.58], pole: [1, 0.4], hand: grip ? 'grip' : 'open' });
function srHero(s, t) { const cam = s.cam;
  if (t < 30) {
    const walking = t < 9.3, x = walking ? srHeroX(t) : SR_H0.x; let px = x, pz = SR_H0.z;
    if (t >= 11.26) { const u = EZ.io(clamp((t - 11.26) / 0.24)); px = lerp(SR_H0.x, SR_H1.x, u); pz = lerp(SR_H0.z, SR_H1.z, u); }
    const cakeW = [s.cakeW.x, s.cakeW.z], carW = [SR_CARX(t), SR_CARZ];
    const look = [[9.28, cakeW], [9.98, carW], [10.6, [26, -14]], [11.3, [17, -36]], [12.6, [9.5, -38]], [13.58, [14.5, -34.5]], [14.44, [-6, -20]], [15.48, [24, -40.5]]];
    const o = { y: 1, expr: [[0, 'neutral'], [8.84, 'thinking'], [9.28, 'happy'], [9.98, 'surprised'], [11.24, 'shock'], [12.1, 'worried'], [14.44, 'nervous'], [15.48, 'shock'], [16.1, 'worried']],
      fx: t >= 9.28 && t < 9.95 ? 'sparkle' : t >= 14.44 ? 'sweat' : undefined, gaze: t >= 8.84 && t < 9.28 ? [0.3, -0.6] : t >= 14.5 && t < 14.9 ? [0, 0.5] : undefined,
      hand: { R: SR_STRAP, L: walking ? undefined : [[0, 'down'], [9.28, 'chin'], [9.98, 'down'], [11.24, 'up'], [12.1, 'talkIn'], [15.48, 'up'], [16.1, 'talkIn']] },
      squash: srKN([[0, 0], [10.0, 0], [10.06, -0.1], [10.2, 0], [11.24, 0], [11.3, 0.16], [11.38, -0.1], [11.55, 0], [14.48, 0], [14.56, 0.12], [14.66, -0.06], [14.8, 0], [15.48, 0], [15.54, -0.12], [15.7, 0]], t),
      lean: t >= 9.28 && t < 9.95 ? 0.07 : t >= 11.3 && t < 11.55 ? -0.06 : 0 };
    if (walking) Object.assign(o, { mode: 'walk', phase: (20 - x) / 4.2, stride: 4.2, stop: clamp((t - 9.0) / 0.3), facing: toonLookFacing(cam, px, pz, -1, 0) });
    else o.facing = srLookK(s, look, t, px, pz);
    pose(s, 'hero', t, px, pz, o);
    const b = s.bag; gripProp(s, b, 'hero', 'R', b.userData.grip, { behind: 0.35, ry: Math.atan2(cam.position.x - px, cam.position.z - pz) });
    { const hp = s.p.hero, hw = c3ToonHandWorld(hp, 'R'); if (hw) { const d = t3Dims(hp.o), lh = hp.root.worldToLocal(hw.clone()), sg = Math.sign(lh.x) || 1, sh = hp.root.localToWorld(V3(sg * d.tw * 0.36 * hp.U, (d.legL + d.Th * 0.94) * hp.U, 0.06)), tc = cam.position.clone().sub(hw).normalize().multiplyScalar(0.35);
      const a = hw.clone().add(tc), c = sh.add(tc), m = s.strap, dv = c.clone().sub(a); m.visible = true; m.position.copy(a).add(c).multiplyScalar(0.5); m.scale.set(1, dv.length(), 1); m.quaternion.setFromUnitVectors(V3(0, 1, 0), dv.normalize()); } }
    gripDot(s, 'hero', 'R');
    return; }
  if (t < 49) return;
  const P = s.p.passer.g.position, pw = [P.x, P.z];
  const o = { y: 1, expr: [[0, 'neutral'], [51.62, 'surprised'], [52.24, 'smile'], [53.68, 'talkO'], [54.6, 'nervous'], [55.9, 'happy']],
    fx: t >= 52.3 && t < 53.6 ? 'sparkle' : t >= 54.6 && t < 55.9 ? 'sweat' : undefined, gaze: t >= 52.3 && t < 53.3 ? [0.2, -0.6] : undefined,
    hand: { L: [[0, 'pocket'], [53.68, 'down'], [55.9, 'hip']], R: t >= 55.9 ? SR_WAVE(t, 55.9, false) : [[0, 'pocket'], [53.68, { h: [0.32, -0.62], pole: [1, 0.4], hand: 'point' }], [54.6, 'down']] },
    squash: srKN([[0, 0], [54.6, 0], [54.66, 0.12], [54.8, -0.04], [54.95, 0]], t), lean: t >= 52.3 && t < 53.4 ? 0.06 : t >= 54.6 && t < 55.0 ? -0.05 : 0 };
  const look = [[49.4, [cam.position.x, cam.position.z]], [51.5, pw], [55.0, [pw[0] - 4, pw[1] + 8]]];
  o.facing = t >= 51.5 && t < 55 ? clamp(toonLookFacing(cam, SR_HB.x, SR_HB.z, pw[0] - SR_HB.x, pw[1] - SR_HB.z), -1.6, 1.6) : srLookK(s, look, t, SR_HB.x, SR_HB.z);
  pose(s, 'hero', t, SR_HB.x, SR_HB.z, o); }
// the cinnamon woman: walks +x along z = -28.5 from x -29 (49.76), passes him on 'past', slows and stops on 'love' (54.50) at x -9.6
function srPasserX(t) { const v = 5.36; if (t < 53.7) return -24 + v * (t - 49.76); const u = clamp((t - 53.7) / 0.8), p0 = -24 + v * 3.94, m0 = v * 0.8, p1 = p0 + 2.1;
  return (2 * u ** 3 - 3 * u ** 2 + 1) * p0 + (u ** 3 - 2 * u ** 2 + u) * m0 + (-2 * u ** 3 + 3 * u ** 2) * p1; }
const SR_PZ = -33, SR_FLAGH = SR_GRIP(0.1, 0.8, { pole: [1, 0.1] });
function srPasser(s, t) { if (t < 49 || t > 58) return; const cam = s.cam, x = srPasserX(t), walking = t < 54.42;
  const o = { y: 1, expr: [[0, 'smile'], [51.9, 'smug'], [53.0, 'happy'], [54.5, 'angry'], [55.9, 'happy']], fx: t >= 55.9 ? 'blush' : undefined,
    hand: { L: walking ? undefined : [[0, 'hip'], [55.9, 'down']], R: t < 55.9 ? SR_FLAGH : SR_WAVE(t, 55.9, true) } };
  if (walking) Object.assign(o, { mode: 'walk', phase: (x + 24) / 3.6, stride: 3.6, stop: clamp((t - 54.1) / 0.32), facing: toonLookFacing(cam, x, SR_PZ, 1, 0) });
  else { const toH = [SR_HB.x - x, SR_HB.z - SR_PZ], cheat = t >= 55.12 ? [toH[0] + 3, toH[1] + 9] : toH; o.facing = clamp(lerp(toonLookFacing(cam, x, SR_PZ, 1, 0), toonLookFacing(cam, x, SR_PZ, cheat[0], cheat[1]), srSnap(t, 54.42, 0.22)), -1.6, 1.6);
    o.squash = srKN([[54.4, 0], [54.48, 0.1], [54.6, -0.05], [54.75, 0], [55.88, 0], [55.94, -0.08], [56.05, 0]], t); o.lean = t >= 54.5 && t < 55.9 ? -0.05 : 0; }
  pose(s, 'passer', t, x, SR_PZ, o);
  const f = s.pflag; gripProp(s, f, 'passer', 'R', f.userData.grip, { behind: -0.25, rz: t < 55.9 ? 2.6 : 0.25 * Math.sin((t - 55.9) * 14) }); gripDot(s, 'passer', 'R');
  { const P = f.userData.flag.geometry.attributes.position, b = f.userData.flag.userData.base; for (let i = 0; i < P.count; i++) { const px = b[i * 3], k = (px + 0.75) / 1.5; P.setZ(i, Math.sin(px * 3 - t * 9) * 0.18 * k); } P.needsUpdate = true; }
  // scent wisps trailing behind her while she walks, rising round her when she stops
  s.wisps.forEach((m, i) => { const ph = (((t - 49.76) / 1.3 + i / s.wisps.length) % 1 + 1) % 1, bx = walking ? x - 0.6 - ph * 1.8 - (i % 2) * 0.4 : x + (i - 2) * 0.7, k = Math.sin(Math.PI * ph);
    m.visible = true; m.position.set(bx, 9.5 + ph * 6, SR_PZ - 0.8 - (i % 3) * 0.3); m.quaternion.copy(cam.quaternion); m.rotateZ(0.25 * Math.sin(t * 2 + i)); m.scale.setScalar(0.55 + 0.35 * ph); m.material.opacity = 0.7 * k * (t > 55.6 ? 1 - clamp((t - 55.6) / 0.8) : 1); }); }
// a friend: leans out of the door gap from 10.42, crouches, one jump onto the sidewalk (squash, settle), then stands at the mark
const SR_OUT = { fRope: 10.40, fBucket: 10.46, fSpice: 10.52 };   // they step out of the car body into the door gaps (the FOCUS car occluder hides them inside)
function srFriendPos(k, t) { const [t0, T, hh] = SR_JUMP[k], A = SR_GAP[k], B = SR_LAND[k]; if (t < t0) return [A.clone().add(V3(0, 0, 4.2 * (1 - EZ.o2(clamp((t - SR_OUT[k]) / 0.22))))), 0];
  const u = clamp((t - t0) / T); if (u >= 1) return [B.clone(), 1]; const p = A.clone().lerp(B, u); p.y = lerp(A.y, B.y, u) + 4 * hh * u * (1 - u); return [p, u]; }
function srFriendSq(k, t) { const [t0, T] = SR_JUMP[k], tl = t0 + T; return srKN([[0, 0], [t0 - 0.18, 0], [t0 - 0.04, 0.3], [t0 + 0.04, -0.18], [tl - 0.06, -0.06], [tl, 0.34], [tl + 0.12, -0.08], [tl + 0.3, 0]], t); }
function srFriends(s, t) { if (t < 10.36 || t > 30) return; const cam = s.cam, hp = s.p.hero.g.position, H = [hp.x, hp.z];
  const ups = { fRope: 12.60, fBucket: 13.58, fSpice: 15.48 };
  for (const k of ['fRope', 'fBucket', 'fSpice']) { const [p, u] = srFriendPos(k, t), air = u > 0 && u < 1, [t0, T] = SR_JUMP[k], landed = t >= t0 + T, up = ups[k], ry = Math.atan2(cam.position.x - p.x, cam.position.z - p.z);
    const lk = t >= up ? 0.45 : 0.25, lookT = landed ? [lerp(H[0], cam.position.x, lk), lerp(H[1], cam.position.z, lk)] : [p.x - 2, p.z - 10];
    const o = { y: p.y, squash: srFriendSq(k, t), facing: air ? clamp(toonLookFacing(cam, p.x, p.z, SR_LAND[k].x - SR_GAP[k].x, SR_LAND[k].z - SR_GAP[k].z), -1.6, 1.6) : clamp(toonLookFacing(cam, p.x, p.z, lookT[0] - p.x, lookT[1] - p.z), -1.5, 1.5),
      expr: k === 'fRope' ? [[0, 'grin'], [11.2, 'excited'], [11.6, 'grin'], [12.6, 'excited'], [13.1, 'smug']] : k === 'fBucket' ? [[0, 'excited'], [11.6, 'grin'], [13.58, 'laugh'], [14.1, 'grin']] : [[0, 'smug'], [11.6, 'grin'], [15.48, 'laugh'], [16.1, 'excited']] };
    if (k === 'fRope') o.hand = { R: t < up ? SR_GRIP(0.12, 0.72, { pole: [1, 0.2] }) : SR_GRIP(0.5, -0.62, { pole: [1, 0.8] }), L: air ? 'up' : t >= up ? 'hip' : 'down' };
    if (k === 'fBucket') o.hand = { R: t < up ? SR_GRIP(0.1, 0.78, { pole: [1, 0.2] }) : SR_GRIP(0.46, -0.6, { pole: [1, 0.8] }), L: air ? 'up' : t >= up ? 'talk2' : 'down' };
    if (k === 'fSpice') o.hand = t < up ? { L: SR_GRIP(0.5, 0.62, { pole: [1, 0.5] }), R: SR_GRIP(0.5, 0.62, { pole: [1, 0.5] }) } : { L: [[up, SR_GRIP(0.62, 0.05, { pole: [1, 0.7] })], [15.92, SR_GRIP(0.42, 0.18, { pole: [1, 0.6] })]], R: [[up, SR_GRIP(0.62, 0.05, { pole: [1, 0.7] })], [15.92, SR_GRIP(0.42, 0.18, { pole: [1, 0.6] })]] };
    if (air) o.lean = 0.08;
    pose(s, k, t, p.x, p.z, o);
    // props: rope coil / bucket in the right hand, the sack between both hands, all in front of the card
    if (k === 'fRope') { gripProp(s, s.rope, k, 'R', s.rope.userData.grip, { behind: -0.4, ry, rz: t >= up ? 0.2 * Math.exp(-(t - up) * 5) * Math.sin((t - up) * 20) : 0 }); gripDot(s, k, 'R'); }
    if (k === 'fBucket') { const sl = t >= up ? Math.exp(-(t - up) * 3) * Math.sin((t - up) * 14) : 0; gripProp(s, s.bucket, k, 'R', s.bucket.userData.grip, { behind: -0.5, ry, rz: 0.18 * sl });
      s.bucket.userData.water.rotation.set(-Math.PI / 2 + 0.25 * sl, 0, 0.2 * sl); gripDot(s, k, 'R');
      s.drops.forEach((d, i) => { const a = t - up - 0.04 - (i % 3) * 0.03; d.visible = a > 0 && a < 0.55; if (!d.visible) return; s.bucket.updateMatrixWorld(true); const top = s.bucket.localToWorld(V3(0, -2.1, 0)), R = RNG('srdrop', i), vx = R.n(3.5), vz = R.n(2), vy = 7 + R.f() * 4;
        d.position.set(top.x + vx * a, top.y + vy * a - 22 * a * a, top.z + vz * a); d.scale.setScalar(0.8 + R.f() * 0.6); }); }
    // the sack hangs between BOTH hands: its two grip points (sides; on 'cinnamon' the neck + the belly, so it swings its mouth
    // to screen right) are aligned to the two hands every frame (rotation from the hand-to-hand line), hand dots drawn on it
    if (k === 'fSpice') { const hl = c3ToonHandWorld(s.p[k], 'L'), hr = c3ToonHandWorld(s.p[k], 'R'); if (hl && hr) { const sk = s.sack, sc = 0.92, X = V3(1, 0, 0).applyQuaternion(cam.quaternion), Y = V3(0, 1, 0).applyQuaternion(cam.quaternion);
        let A = hl, B = hr; if (hl.dot(X) > hr.dot(X)) { A = hr; B = hl; }
        const lo = t < up, kS = lo ? 0 : srSnap(t, 15.92, 0.2), gL = lo ? V3(-3.0, 3.6, 0) : V3(-3.0, 3.2, 0).lerp(V3(-2.5, 2.2, 0), kS), gR = lo ? V3(3.0, 3.6, 0) : V3(3.0, 3.2, 0).lerp(V3(0.2, 6.0, 0), kS);
        const v = B.clone().sub(A), d = gR.clone().sub(gL), th = Math.atan2(v.dot(Y), v.dot(X)) - Math.atan2(d.y, d.x), wob = lo ? 0 : 0.06 * Math.exp(-(t - up) * 4) * Math.sin((t - up) * 16);
        sk.visible = true; sk.quaternion.copy(cam.quaternion).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(lo ? 0.15 : -0.1, 0, th + wob))); sk.scale.setScalar(sc);
        const gm = gL.clone().add(gR).multiplyScalar(0.5 * sc).applyQuaternion(sk.quaternion), mid = A.clone().add(B).multiplyScalar(0.5);
        sk.position.copy(mid).sub(gm).addScaledVector(cam.position.clone().sub(mid).normalize(), 0.9);
        gripDot(s, k, 'L'); gripDot(s, k, 'R'); } } } }
// puffs: tyre smoke at the skid, the cinnamon puff out of the sack on 'cinnamon'
function srPuffs(s, t) { const cam = s.cam;
  s.smoke.forEach((m, i) => { const t0 = 9.95 + (i >> 1) * 0.08, a = t - t0; m.visible = t < 30 && a > 0 && a < 1.4; if (!m.visible) return; const R = RNG('srsmk', i), x = SR_CARX(t0) + 5.6 + R.n(1);
    m.position.set(x + a * 2.5 + R.n(1), 1.2 + a * 2.2, SR_CARZ + (i % 2 ? -4.6 : 4.6) + R.n(0.6)); m.quaternion.copy(cam.quaternion); m.scale.setScalar(0.7 + a * 1.8); m.material.opacity = 0.75 * (1 - a / 1.4); });
  s.sack.updateMatrixWorld(true); const top = s.sack.visible ? s.sack.localToWorld(s.sack.userData.top.clone()) : null;
  s.cin.forEach((m, i) => { const t0 = 16.04 + i * 0.04, a = t - t0; m.visible = t < 30 && a > 0 && a < 1.2 && !!top; if (!m.visible) return; const R = RNG('srcin', i);
    const ax = V3(0, 1, 0).applyQuaternion(s.sack.quaternion), rt = V3(1, 0, 0).applyQuaternion(cam.quaternion), up = V3(0, 1, 0), d = EZ.o2(a / 1.2);
    m.position.copy(top).addScaledVector(ax, 0.9 + d * (2.6 + R.f() * 1.6)).addScaledVector(rt, R.n(0.8) * d).addScaledVector(up, d * (2.2 + R.f() * 1.5) + R.n(0.6) * d); m.position.addScaledVector(cam.position.clone().sub(m.position).normalize(), 1.6); m.quaternion.copy(cam.quaternion); m.rotateZ(R.f() * 6); m.scale.setScalar(0.5 + d * 2.3 * (0.8 + R.f() * 0.5)); m.material.opacity = 0.92 * (1 - (a / 1.2) ** 1.5); }); }

// ---- the frame
function srFrame(t) { const s = SR_get(); hideAll(s); hideGrips(s); [s.rope, s.bucket, s.sack, s.bag, s.pflag, s.strap, ...s.drops, ...s.wisps].forEach((m) => { m.visible = false; });
  const cam = seqCam(s, 'street', t);
  const look = c3CamAt(CAMSEQ.street, t).l; srShadowAt(s, look[0], look[2]);
  s.flags.forEach((f) => { const P = f.geometry.attributes.position, b = f.userData.base; for (let i = 0; i < P.count; i++) { const px = b[i * 3], k = (px + 3.2) / 6.4; P.setZ(i, Math.sin(px * 0.9 - t * 4.5 + f.userData.ph) * 0.7 * k + Math.sin(b[i * 3 + 1] * 0.7 - t * 2.6) * 0.2 * k); } P.needsUpdate = true; f.geometry.computeVertexNormals(); });
  srCarAt(s, t);
  // the cake lights up on 'cake' (9.28): a warm practical in the bay + a soft glow with sparkles
  const ck = t < 30 ? clamp((t - 9.28) / 0.18) * (1 - clamp((t - 10.1) / 0.5)) : 0; s.cakeLight.intensity = 0.3 + 1.6 * ck;
  s.glow.visible = ck > 0.02; if (s.glow.visible) { s.glow.position.copy(s.cakeW).add(V3(0, 0.5, 1.2)); s.glow.quaternion.copy(cam.quaternion); s.glow.scale.setScalar(0.7 + 0.25 * ck + 0.04 * Math.sin(t * 9)); s.glow.material.opacity = 0.7 * ck; }
  srHero(s, t); srFriends(s, t); srPasser(s, t); srPuffs(s, t);
  c3Render(s.scene, cam, { bg: '#9cc0f0', bgBlur: 1.0, glow: 0.3, glowBlur: 12 });
}
for (const id of ['a01', 'a02', 'a03', 'a04', 'a05', 'a06']) { SHOT_FN[id] = (t) => srFrame(t); SNAPS[id] = 'free'; }

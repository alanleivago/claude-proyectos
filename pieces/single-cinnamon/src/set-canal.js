// =====================================================================
//  SET canal — a Nyhavn-style canal quay in Copenhagen at golden hour. Near row (fronts at z = -48, facing +z): tall
//  narrow gabled houses (stepped, bell and plain gables with hoist beams, eaves houses with dormers, chimneys, window
//  boxes, cellar cafes) in ochre / brick red / teal / mustard / Nyhavn blue; a cafe kiosk with striped awnings, parasols
//  and tables; bikes; Dannebrog flags; THE cast-iron lamppost on the quay (CN_POST) and a bell-gable house behind it with
//  a gable clock. Canal z 0..72 (water y = -3.5) with moored wooden ships (masts, yards, furled sails, rigging); far quay +
//  far row at z = 110. Painted blue sky, low warm sun from the front-right.
//  ONE continuous take per time range: camera = seqCam(s, 'canal', t). Ranges 0–7.70 (c01–c03) and 16.56–25.68 (c04–c08).
//  Prefix CN. Registers c01 c02 c03 c04 c05 c06 c07 c08.
// =====================================================================
const CN = {};
const CN_POST = V3(6, 0, -10), CN_HERO = V3(6, 0, -8.7);          // the lamppost + the hero (in front of it, toward the canal)
const CN_CLOCK = V3(12, 60.5, -47.1);                              // the gable clock of the house behind the post
const CN_KIOSK = [-13, -17, 9, 7, 13.5];                             // cafe kiosk: centre x, z, w, d, h
const CN_FR = { fRope: V3(0.2, 0, -12), fBucket: V3(11.8, 0, -10.6), fSpice: V3(-4.4, 0, -14.6) };   // friends round the post
const CN_HIDE = { fBucket: [-12.6, -23.0, -8.6], fRope: [-12.8, -24.6, -9.1], fSpice: [-13.2, -26.2, -9.7] };   // behind the kiosk: x hidden, z, x peeking
const cnSnap = (t, t0, d = 0.33) => { const x = clamp((t - t0) / d); return 1 - (1 - x) ** 3; };
const cnRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
const cnAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const cnBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const cnCyl = (r0, r1, h, mat, x, y, z, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.position.set(x, y, z); return m; };
const cnSph = (r, mat, x, y, z, ws = 12, hs = 8) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); return m; };
function cnTube(a, b, r, mat, seg = 6) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
// eased numeric keys
function cnKN(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], EZ.io((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); return K[K.length - 1][1]; }
// a path of [t, x, z] keys -> position + velocity (eased per leg) for walking people
function cnPath(K, t) { if (t <= K[0][0]) return { x: K[0][1], z: K[0][2], vx: 0, vz: 0, u: 1, i: -1 };
  for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) { const [a, x0, z0] = K[i], [b, x1, z1] = K[i + 1], u = (t - a) / (b - a), e = K[i][3] === 'lin' ? u : EZ.io(u);
    return { x: lerp(x0, x1, e), z: lerp(z0, z1, e), vx: x1 - x0, vz: z1 - z0, u, i, moving: Math.hypot(x1 - x0, z1 - z0) > 0.01 }; }
  const L = K[K.length - 1]; return { x: L[1], z: L[2], vx: 0, vz: 0, u: 1, i: K.length }; }

// ---- bake: merge static props per material into vertex-coloured meshes (copied from trash-library stBake)
function cnBake(root, o = {}) { root.updateMatrixWorld(true); const Bk = new Map(), v = new THREE.Vector3(), keep = [];
  root.traverse((m) => { if (!m.isMesh || m.userData.hull || !m.visible) return; const mt = Array.isArray(m.material) ? m.material[0] : m.material;
    if (mt.transparent || mt.isShaderMaterial || m.userData.keep) { keep.push(m); return; }
    const em = mt.emissive && mt.emissiveIntensity > 0 && mt.emissive.getHex() ? mt.emissive.getHexString() + mt.emissiveIntensity : '';
    m.getWorldPosition(v); const ch = Math.floor(v.x / 100) + ',' + Math.floor(v.z / 100);
    const key = (mt.metalness > 0.3 ? 'M' : '') + (mt.roughness < 0.4 ? 'g' : mt.roughness < 0.7 ? 'm' : 'r') + em + (mt.map ? mt.map.uuid : '') + (mt.side === THREE.DoubleSide ? 'D' : '') + '|' + ch;
    if (!Bk.has(key)) Bk.set(key, { mt, em, L: [] });
    const g = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld); Bk.get(key).L.push([g, mt.color]); });
  const out = new THREE.Group(); out.userData.noShade = true;
  for (const m of keep) { const c = m.clone(); m.matrixWorld.decompose(c.position, c.quaternion, c.scale); out.add(c); }
  for (const { mt, em, L } of Bk.values()) { let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
    const P = new Float32Array(n * 3), N = new Float32Array(n * 3), Cc = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
    for (const [g, c] of L) { const p = g.attributes.position, q = g.attributes.normal, uv = g.attributes.uv;
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.8 + 0.2 * clamp(y / 3);
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        Cc[k * 3] = c.r * ao; Cc[k * 3 + 1] = c.g * ao; Cc[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast) mesh.userData.noCast = true; out.add(mesh); }
  return out; }

// ---- textures
function cnTexCobbles() { const t = tex((g, w, h) => { const R = RNG('cncob'); g.fillStyle = '#7a6a5e'; g.fillRect(0, 0, w, h); const s = 22;
  for (let j = 0; j < h / s + 1; j++) for (let i = -1; i < w / s + 1; i++) { const x = i * s + (j % 2) * s / 2 + R.r(-2, 2), y = j * s + R.r(-2, 2), c = ['#b8a490', '#c8b49a', '#a8968a', '#bca78c', '#9e9088', '#c4ae92'][R.i(0, 5)];
    g.fillStyle = c3Shd(c, R.r(0.9, 1.08)); g.beginPath(); g.ellipse(x + s / 2, y + s / 2, s * 0.46, s * 0.42, R.n(0.4), 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,248,232,0.22)'; g.beginPath(); g.ellipse(x + s * 0.42, y + s * 0.38, s * 0.22, s * 0.14, -0.4, 0, TAU); g.fill(); }
  for (let i = 0; i < 1800; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); } }, 512, 512); return t; }
function cnTexGranite() { const t = tex((g, w, h) => { const R = RNG('cngran'); g.fillStyle = '#a89c90'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) { g.fillStyle = c3Shd('#b4a898', R.r(0.88, 1.06)); g.fillRect(i * w / 6 + (j % 2) * w / 12 + 2, j * h / 4 + 2, w / 6 - 4, h / 4 - 4); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(40,30,30,0.1)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  const gr = g.createLinearGradient(0, h * 0.6, 0, h); gr.addColorStop(0, 'rgba(40,60,50,0)'); gr.addColorStop(1, 'rgba(40,70,60,0.45)'); g.fillStyle = gr; g.fillRect(0, h * 0.6, w, h * 0.4); }, 256, 128); return t; }
// canal water: deep teal with long wavy strokes reflecting the facades and the warm sky
function cnTexWater() { const t = tex((g, w, h) => { const R = RNG('cnwat'); const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#2c6f86'); gr.addColorStop(1, '#245e78'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const cols = ['#e9a53b', '#c9472f', '#2c9c97', '#ecc23c', '#3d6fba', '#ffd8a0', '#8ec8e8', '#ffffff'];
  for (let i = 0; i < 520; i++) { const x = R.r(0, w), y = R.r(0, h), L = R.r(18, 70), c = cols[R.i(0, cols.length - 1)]; g.strokeStyle = c; g.globalAlpha = R.r(0.18, 0.5); g.lineWidth = R.r(1.5, 4); g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + L * 0.3, y - 3, x + L * 0.6, y + 3, x + L, y); g.stroke(); }
  g.globalAlpha = 1; }, 512, 512); return t; }
function cnTexRope() { const t = tex((g, w, h) => { g.fillStyle = '#c89a5a'; g.fillRect(0, 0, w, h); for (let i = -8; i < 16; i++) { g.fillStyle = i % 2 ? '#e2b878' : '#a87a40'; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 8, 0); g.lineTo(i * 16 + 8 + h, h); g.lineTo(i * 16 + h, h); g.fill(); } }, 128, 32); return cnRep(t, 10, 1); }
function cnTexPuff() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('cnpuff');
  for (let k = 0; k < 9; k++) { const x = w / 2 + R.n(w * 0.2), y = h / 2 + R.n(h * 0.16), r = w * R.r(0.16, 0.28), gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.globalCompositeOperation = 'source-atop'; for (let i = 0; i < 260; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,40,10,0.35)' : 'rgba(255,230,190,0.35)'; g.fillRect(R.r(0, w), R.r(0, h), 3, 3); } }, 256, 256); }
function cnTexSplash() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('cnspl'), c = w / 2;
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + R.n(0.15), L = R.r(0.28, 0.46) * w; g.save(); g.translate(c, c); g.rotate(a); g.fillStyle = '#e8f6ff'; g.beginPath(); g.moveTo(0, -w * 0.035); g.quadraticCurveTo(L * 0.6, -w * 0.05, L, 0); g.quadraticCurveTo(L * 0.6, w * 0.05, 0, w * 0.035); g.fill();
    g.fillStyle = '#9fd4f4'; g.beginPath(); g.arc(L + w * 0.02, 0, w * 0.022, 0, TAU); g.fill(); g.restore(); }
  const gr = g.createRadialGradient(c, c, 0, c, c, w * 0.22); gr.addColorStop(0, 'rgba(240,250,255,1)'); gr.addColorStop(1, 'rgba(160,214,244,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.lineWidth = 5; g.strokeStyle = 'rgba(40,110,170,0.7)'; g.beginPath(); g.arc(c, c, w * 0.16, 0, TAU); g.stroke(); }, 256, 256); }
function cnTexDrop() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#bfe4fa'; g.beginPath(); g.moveTo(w / 2, h * 0.08); g.bezierCurveTo(w * 0.9, h * 0.6, w * 0.8, h * 0.95, w / 2, h * 0.95); g.bezierCurveTo(w * 0.2, h * 0.95, w * 0.1, h * 0.6, w / 2, h * 0.08); g.fill();
  g.lineWidth = 6; g.strokeStyle = '#2f6aa0'; g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w * 0.4, h * 0.66, w * 0.08, h * 0.12, 0.3, 0, TAU); g.fill(); }, 64, 96); }
function cnTexWisp() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.lineCap = 'round';
  for (const [c, lw] of [['rgba(120,60,20,0.55)', 16], ['#f2c08a', 9]]) { g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.moveTo(w * 0.08, h * 0.5); g.bezierCurveTo(w * 0.3, h * 0.05, w * 0.4, h * 0.95, w * 0.6, h * 0.5); g.bezierCurveTo(w * 0.72, h * 0.2, w * 0.82, h * 0.3, w * 0.92, h * 0.45); g.stroke(); } }, 256, 128); }
function cnTexFlag() { return tex((g, w, h) => { g.fillStyle = '#c8102e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(w * 0.33, 0, w * 0.11, h); g.fillRect(0, h * 0.43, w, h * 0.14); }, 256, 192); }
function cnTexClock() { return tex((g, w, h) => { const cx = w / 2, cy = h / 2, r = w * 0.47; g.fillStyle = '#1e3a5a'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  g.fillStyle = '#fbf2dc'; g.beginPath(); g.arc(cx, cy, r * 0.86, 0, TAU); g.fill(); const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,0.4)'); gr.addColorStop(1, 'rgba(200,170,120,0.25)'); g.fillStyle = gr; g.fill();
  const RN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI']; g.fillStyle = '#e8c45a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU - Math.PI / 2; g.font = `700 ${w * 0.075}px Georgia, serif`; g.fillStyle = '#e8c45a'; g.fillText(RN[i], cx + Math.cos(a) * r * 0.93, cy + Math.sin(a) * r * 0.93 + 1);
    g.fillStyle = '#2a2230'; g.fillRect(cx + Math.cos(a) * r * 0.74 - 5, cy + Math.sin(a) * r * 0.74 - 5, 10, 10); }
  for (let i = 0; i < 60; i++) { if (i % 5 === 0) continue; const a = i / 60 * TAU; g.fillStyle = '#5a4a3a'; g.fillRect(cx + Math.cos(a) * r * 0.8 - 2, cy + Math.sin(a) * r * 0.8 - 2, 4, 4); } }, 512, 512); }
function cnTexSign(txt, bg, fg = '#fff3d6', w0 = 512, h0 = 160) { return tex((g, w, h) => { g.fillStyle = '#2a1e1a'; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(8, 8, w - 16, h - 16); g.strokeStyle = '#e8c45a'; g.lineWidth = 4; g.strokeRect(16, 16, w - 32, h - 32);
  inked(g, txt, w / 2, h / 2 + 2, h * 0.42, fg, { stroke: '#2a1a1a', sw: 4, maxW: w * 0.8 }); }, w0, h0); }
function cnTexStripe(a, b, n = 12) { return tex((g, w, h) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * w / n, 0, w / n + 1, h); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h * 0.85, w, h * 0.15); }, 256, 64); }
function cnTexKanel() { return tex((g, w, h) => { g.fillStyle = '#d8c09a'; g.fillRect(0, 0, w, h); const R = RNG('cnkan'); for (let i = 0; i < 900; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(90,60,30,0.12)' : 'rgba(255,250,230,0.12)'; g.fillRect(R.r(0, w), R.r(0, h), 3, 3); }
  g.strokeStyle = 'rgba(120,80,40,0.35)'; g.lineWidth = 2; for (let x = 0; x < w; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  g.fillStyle = '#b8401e'; g.fillRect(w * 0.08, h * 0.28, w * 0.84, h * 0.44); g.strokeStyle = '#3a1a0a'; g.lineWidth = 6; g.strokeRect(w * 0.08, h * 0.28, w * 0.84, h * 0.44);
  inked(g, 'KANEL', w / 2, h / 2 + 2, h * 0.3, '#fff2d8', { stroke: '#3a1a0a', sw: 5, maxW: w * 0.74 }); }, 512, 384); }
function cnTex25() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); inked(g, '25', w / 2, h / 2, h * 0.8, '#ff6aa8', { stroke: '#ffffff', sw: 10, maxW: w * 0.96 }); }, 256, 192); }
function cnTexFlame() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.62, 0, w / 2, h * 0.62, w * 0.5); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.35, 'rgba(255,190,70,0.9)'); gr.addColorStop(1, 'rgba(255,120,30,0)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(w / 2, h * 0.04); g.bezierCurveTo(w * 0.9, h * 0.5, w * 0.8, h * 0.95, w / 2, h * 0.95); g.bezierCurveTo(w * 0.2, h * 0.95, w * 0.1, h * 0.5, w / 2, h * 0.04); g.fill(); }, 64, 96); }
// a house facade: plaster with noise, string courses, white Danish windows (muntins, sills, some shutters/curtains), and a
// ground floor with a door + a cellar cafe / shop window and its sign. World layout: ground floor G, floors of FH.
const CN_G = 15, CN_FH = 13;
function cnTexFacade(seed, wall, w, H, nF, bays, shop, band, shutter) { const cw = Math.round(Math.min(512, 1100 * w / H)), ch = Math.round(cw * H / w);
  return tex((g, W2, H2) => { const R = RNG('cnfac', seed), k = W2 / w, Y = (y) => H2 - y * k, bw = w / bays;
    g.fillStyle = wall; g.fillRect(0, 0, W2, H2);
    for (let i = 0; i < 26; i++) { const x = R.r(0, W2), y = R.r(0, H2), r = R.r(15, 70), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(70,40,30,0.07)' : 'rgba(255,250,235,0.09)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 2200; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, W2), R.r(0, H2), 2, 2); }
    const lite = c3Shd(wall, 1.16), dark = c3Shd(wall, 0.8);
    g.fillStyle = lite; g.fillRect(0, Y(H), W2, 2.2 * k); g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, Y(H - 2.2), W2, 3);   // cornice
    for (let f = 0; f <= nF; f++) { const y = CN_G + f * CN_FH; g.fillStyle = lite; g.fillRect(0, Y(y + 0.6), W2, 1.0 * k); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, Y(y - 0.4), W2, 3); }
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, 1.2 * k, H2); g.fillRect(W2 - 1.2 * k, 0, 1.2 * k, H2);   // corner pilasters
    for (let f = 0; f < nF; f++) for (let b = 0; b < bays; b++) { const ww = bw * 0.48, wh = 7.6, x0 = (b + 0.5) * bw - ww / 2, y0 = CN_G + f * CN_FH + 2.6;
      const X = x0 * k, Yt = Y(y0 + wh), Wp = ww * k, Hp = wh * k;
      if (shutter) { g.fillStyle = shutter; for (const sx of [-1, 1]) { const xs = sx < 0 ? X - Wp * 0.42 - 3 : X + Wp + 3; g.fillRect(xs, Yt, Wp * 0.42, Hp); g.fillStyle = 'rgba(0,0,0,0.18)'; for (let j = 1; j < 6; j++) g.fillRect(xs, Yt + j * Hp / 6, Wp * 0.42, 2); g.fillStyle = shutter; } }
      g.fillStyle = '#fbf6ec'; g.fillRect(X - 0.6 * k, Yt - 0.6 * k, Wp + 1.2 * k, Hp + 1.2 * k); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(X - 0.6 * k, Yt + Hp + 0.6 * k, Wp + 1.2 * k, 3);
      const lit = R.f() < 0.22, gr = g.createLinearGradient(X, Yt, X + Wp * 0.4, Yt + Hp); gr.addColorStop(0, lit ? '#ffe6b0' : '#cfe2f4'); gr.addColorStop(0.55, lit ? '#f4b468' : '#6a92c4'); gr.addColorStop(1, lit ? '#d88a48' : '#34507e'); g.fillStyle = gr; g.fillRect(X, Yt, Wp, Hp);
      if (R.f() < 0.55) { g.fillStyle = ['#f4f0e8', '#e8d0a8', '#d86a5a', '#f2c84a'][R.i(0, 3)]; g.globalAlpha = 0.85; g.fillRect(X, Yt, Wp * 0.22, Hp); g.fillRect(X + Wp * 0.78, Yt, Wp * 0.22, Hp); g.globalAlpha = 1; }
      g.fillStyle = '#fbf6ec'; g.fillRect(X + Wp / 2 - 0.25 * k, Yt, 0.5 * k, Hp); for (const fy of [0.33, 0.66]) g.fillRect(X, Yt + Hp * fy - 0.2 * k, Wp, 0.4 * k);
      g.fillStyle = 'rgba(255,255,255,0.32)'; g.beginPath(); g.moveTo(X + Wp * 0.08, Yt + Hp); g.lineTo(X + Wp * 0.3, Yt); g.lineTo(X + Wp * 0.4, Yt); g.lineTo(X + Wp * 0.18, Yt + Hp); g.fill();
      g.fillStyle = lite; g.fillRect(X - 1 * k, Y(y0 - 0.2), Wp + 2 * k, 0.8 * k);   // sill
      g.fillStyle = lite; g.fillRect(X - 0.8 * k, Y(y0 + wh + 1.6), Wp + 1.6 * k, 1.0 * k); }   // lintel
    // ground floor: plinth, door, cellar cafe / shop window + sign
    g.fillStyle = dark; g.fillRect(0, Y(2.4), W2, 2.4 * k);
    const dw = 4.2, dx = w * (seed % 2 ? 0.74 : 0.26) - dw / 2, dcol = ['#2f5a3e', '#8a2a24', '#1e3e6a', '#3a2a24', '#2a6a6a'][seed % 5];
    g.fillStyle = '#f6efe0'; g.fillRect((dx - 0.6) * k, Y(10.6), (dw + 1.2) * k, 10.6 * k - 2.4 * k); g.fillStyle = dcol; g.fillRect(dx * k, Y(10), dw * k, (10 - 2.4) * k);
    g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect((dx + dw * 0.12) * k, Y(9), dw * 0.32 * k, 5.6 * k); g.fillRect((dx + dw * 0.56) * k, Y(9), dw * 0.32 * k, 5.6 * k);
    g.fillStyle = '#bcd8f0'; g.fillRect((dx + 0.3) * k, Y(10.4), (dw - 0.6) * k, 0.3 * k); g.fillStyle = '#e8c45a'; g.beginPath(); g.arc((dx + dw * 0.85) * k, Y(5.6), 0.35 * k, 0, TAU); g.fill();
    const sx0 = seed % 2 ? 1.2 : dx + dw + 1.4, sw = (seed % 2 ? dx - 1.2 : w - 1.2) - sx0;
    if (sw > 4) { if (shop) { g.fillStyle = band; g.fillRect(sx0 * k, Y(13.8), sw * k, 3 * k); g.strokeStyle = '#2a1a1a'; g.lineWidth = 3; g.strokeRect(sx0 * k, Y(13.8), sw * k, 3 * k);
        inked(g, shop, (sx0 + sw / 2) * k, Y(12.3), 1.9 * k, '#fff6e2', { stroke: '#2a1a1a', sw: 3, maxW: sw * k * 0.86 }); }
      g.fillStyle = '#f6efe0'; g.fillRect(sx0 * k, Y(10.3), sw * k, 7.6 * k); const gi = g.createLinearGradient(0, Y(10), 0, Y(3)); gi.addColorStop(0, '#5a5a74'); gi.addColorStop(1, '#8a6a58'); g.fillStyle = gi; g.fillRect((sx0 + 0.5) * k, Y(9.8), (sw - 1) * k, 6.6 * k);
      if (shop) { g.fillStyle = 'rgba(255,214,140,0.55)'; g.fillRect((sx0 + 0.5) * k, Y(9.8), (sw - 1) * k, 6.6 * k); for (let i = 0; i < 4; i++) { g.fillStyle = '#fff2c8'; g.beginPath(); g.arc((sx0 + 1.5 + i * (sw - 3) / 3) * k, Y(8.6), 0.4 * k, 0, TAU); g.fill(); } }
      g.fillStyle = '#f6efe0'; for (let i = 1; i < 3; i++) g.fillRect((sx0 + i * sw / 3) * k - 2, Y(9.8), 4, 6.6 * k);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.moveTo((sx0 + 1) * k, Y(3.2)); g.lineTo((sx0 + 2.4) * k, Y(9.8)); g.lineTo((sx0 + 3.2) * k, Y(9.8)); g.lineTo((sx0 + 1.8) * k, Y(3.2)); g.fill(); }
    g.fillStyle = '#2a2a34'; g.fillRect((seed % 2 ? 2 : w - 6) * k, Y(2.2), 4 * k, 1.8 * k); g.fillStyle = 'rgba(255,214,140,0.7)'; g.fillRect((seed % 2 ? 2.3 : w - 5.7) * k, Y(1.9), 3.4 * k, 1.2 * k);   // cellar window
    const gb = g.createLinearGradient(0, Y(5), 0, H2); gb.addColorStop(0, 'rgba(50,40,40,0)'); gb.addColorStop(1, 'rgba(50,40,40,0.25)'); g.fillStyle = gb; g.fillRect(0, Y(5), W2, 5 * k); }, cw, ch); }

// ---- geometry builders
function cnExt(shape, depth, mat, bevel = 0) { const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 10 }); return new THREE.Mesh(g, mat); }
// gable outlines (x in [-w/2, w/2], y in [0, gh])
function cnGable(kind, w, gh) { const s = new THREE.Shape(), h = w / 2;
  if (kind === 'step') { const n = 3, sx = h / (n + 0.7), sh = gh / (n + 1); s.moveTo(-h, 0); for (let i = 0; i < n; i++) { s.lineTo(-h + i * sx, (i + 1) * sh); s.lineTo(-h + (i + 1) * sx, (i + 1) * sh); }
    s.lineTo(-h + n * sx, gh); s.lineTo(h - n * sx, gh); for (let i = n - 1; i >= 0; i--) { s.lineTo(h - (i + 1) * sx, (i + 1) * sh); s.lineTo(h - i * sx, (i + 1) * sh); } s.lineTo(h, 0); }
  else if (kind === 'bell') { s.moveTo(-h, 0); s.lineTo(-h, gh * 0.12); s.bezierCurveTo(-h, gh * 0.34, -h * 0.5, gh * 0.3, -h * 0.5, gh * 0.52); s.bezierCurveTo(-h * 0.5, gh * 0.7, -h * 0.28, gh * 0.72, -h * 0.28, gh * 0.86);
    s.quadraticCurveTo(-h * 0.28, gh, 0, gh); s.quadraticCurveTo(h * 0.28, gh, h * 0.28, gh * 0.86); s.bezierCurveTo(h * 0.28, gh * 0.72, h * 0.5, gh * 0.7, h * 0.5, gh * 0.52); s.bezierCurveTo(h * 0.5, gh * 0.3, h, gh * 0.34, h, gh * 0.12); s.lineTo(h, 0); }
  else { s.moveTo(-h - 0.6, 0); s.lineTo(0, gh); s.lineTo(h + 0.6, 0); }
  s.closePath(); return s; }
function cnPrism(w, rh, len, mat) { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(0, rh); s.lineTo(w / 2, 0); s.closePath(); const m = cnExt(s, len, mat); return m; }   // ridge along +z (extruded 0..len)
function cnTexTiles(base) { const t = tex((g, w, h) => { const R = RNG('cntile', base); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 12; j++) for (let i = 0; i < 12; i++) { g.fillStyle = c3Shd(base, R.r(0.82, 1.1)); g.beginPath(); g.roundRect(i * w / 12 + (j % 2) * w / 24, j * h / 12, w / 12 - 2, h / 12 - 1, [0, 0, 6, 6]); g.fill(); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(i * w / 12 + (j % 2) * w / 24, (j + 1) * h / 12 - 3, w / 12, 3); } }, 256, 256); return cnRep(t, 2, 2); }
// a bike leaning (origin at the ground under the middle, frame along x)
function cnBike(M, col) { const g = new THREE.Group(), fr = c3Prop(col, { rough: 0.35, metal: 0.2 });
  for (const sx of [-1, 1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.16, 6, 24), M.tyre); w.position.set(sx * 2.6, 2.05, 0); g.add(w); g.add(cnCyl(0.08, 0.08, 3.8, M.chrome, sx * 2.6, 2.05, 0, 6)); g.children.at(-1).rotation.x = Math.PI / 2; }
  for (const [a, b] of [[[-2.6, 2.05], [0, 2.3]], [[0, 2.3], [2.2, 4.4]], [[-2.6, 2.05], [-0.6, 4.4]], [[-0.6, 4.4], [2.2, 4.4]], [[0, 2.3], [-0.7, 4.6]], [[2.6, 2.05], [2.2, 4.8]]]) g.add(cnTube(V3(a[0], a[1], 0), V3(b[0], b[1], 0), 0.13, fr));
  g.add(rb(1.2, 0.3, 0.6, M.black, -0.8, 4.85, 0, 0)); g.add(cnTube(V3(2.2, 4.9, -1.0), V3(2.2, 4.9, 1.0), 0.1, M.chrome)); g.add(rb(1.6, 0.9, 1.3, M.basket, 3.0, 4.4, 0, 0)); return g; }
// a cast-iron street lamp (origin at the foot); k = scale
function cnLamp(M, k = 1, emit = true) { const g = new THREE.Group();
  g.add(cnCyl(1.0, 1.25, 1.6, M.iron, 0, 0.8, 0, 12)); g.add(cnCyl(0.75, 1.0, 0.6, M.iron, 0, 1.9, 0, 12)); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.add(cnBox(0.22, 1.5, 0.22, M.iron, Math.cos(a) * 0.95, 0.9, Math.sin(a) * 0.95)); }
  g.add(cnCyl(0.36, 0.5, 18, M.iron, 0, 11, 0, 12)); for (const y of [2.6, 6.5, 14, 19.8]) g.add(cnCyl(0.62, 0.62, 0.45, M.iron, 0, y, 0, 12));
  g.add(cnCyl(0.95, 0.5, 1.4, M.iron, 0, 20.6, 0, 10)); g.add(cnCyl(0.5, 0.9, 0.6, M.iron, 0, 21.6, 0, 6));
  const lm = c3Prop('#fff0c8', { emissive: emit ? '#ffcf80' : '#000000', ei: emit ? 0.9 : 0, glow: emit ? '#ffc070' : undefined, rough: 0.2 }); g.add(cnCyl(1.25, 0.8, 3.2, lm, 0, 23.5, 0, 6));
  for (let i = 0; i < 6; i++) { const a = (i + 0.5) / 6 * TAU; g.add(cnBox(0.14, 3.3, 0.14, M.iron, Math.cos(a) * 1.05, 23.5, Math.sin(a) * 1.05)); }
  g.add(cnCyl(0.4, 1.65, 1.3, M.iron, 0, 25.7, 0, 6)); g.add(cnCyl(0.12, 0.3, 1.2, M.iron, 0, 26.9, 0, 6)); g.add(cnSph(0.32, M.gold, 0, 27.6, 0));
  for (const sx of [-1, 1]) { const sc = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 6, 16, Math.PI), M.iron); sc.position.set(sx * 1.1, 19.4, 0); sc.rotation.z = sx > 0 ? Math.PI : 0; g.add(sc); }
  g.scale.setScalar(k); return g; }
// a moored wooden ship along x (bow at +x): hull bands, bulwark, deck, wheelhouse, masts with yards + furled sails, rigging
function cnShip(M, L, Bm, col, masts, seed) { const g = new THREE.Group(), R = RNG('cnship', seed);
  const outline = (k) => { const s = new THREE.Shape(), hl = L / 2 * k, hb = Bm / 2 * k; s.moveTo(-hl + hb * 0.6, -hb); s.lineTo(hl - Bm * 0.9 * k, -hb); s.quadraticCurveTo(hl - Bm * 0.2 * k, -hb, hl, 0); s.quadraticCurveTo(hl - Bm * 0.2 * k, hb, hl - Bm * 0.9 * k, hb);
    s.lineTo(-hl + hb * 0.6, hb); s.quadraticCurveTo(-hl, hb, -hl, 0); s.quadraticCurveTo(-hl, -hb, -hl + hb * 0.6, -hb); return s; };
  const layer = (y0, y1, mat, k = 1, hole = 0) => { const s = outline(k); if (hole) { const hs = outline(hole); s.holes.push(new THREE.Path(hs.getPoints(24).reverse())); } const m = cnExt(s, y1 - y0, mat); m.rotation.x = -Math.PI / 2; m.position.y = y0; g.add(m); return m; };
  layer(-6.5, -2.4, M.hullDk); layer(-2.4, -0.9, c3Prop(col, { rough: 0.4, env: 1.2 })); layer(-0.9, -0.55, M.white, 1.01); layer(-0.55, 1.1, M.white, 1.0, 0.94); layer(1.1, 1.45, M.wood, 1.02, 0.92); layer(-0.9, -0.7, M.deck, 0.95);
  // wheelhouse near the stern + a hatch
  const cab = new THREE.Group(); cab.position.set(-L * 0.3, -0.7, 0); g.add(cab); cab.add(rb(L * 0.16, 4.2, Bm * 0.5, M.white, 0, 2.1, 0, 0)); cab.add(rb(L * 0.18, 0.5, Bm * 0.58, M.wood, 0, 4.4, 0, 0));
  for (const sz of [-1, 1]) for (let i = 0; i < 3; i++) cab.add(cnBox(L * 0.03, 1.3, 0.1, M.glass, -L * 0.05 + i * L * 0.05, 2.8, sz * Bm * 0.25 + sz * 0.05));
  { const lr = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.2, 6, 16), M.lifering); lr.position.set(L * 0.08 + 0.1, 2.4, Bm * 0.25 + 0.25); cab.add(lr); }
  g.add(rb(L * 0.14, 1.2, Bm * 0.4, M.wood, L * 0.05, -0.1, 0, 0));
  const MH = [], mx = masts === 1 ? [L * 0.1] : [L * 0.2, -L * 0.08];
  mx.forEach((x, i) => { const H = (i ? 0.78 : 1) * R.r(42, 52); MH.push([x, H]); g.add(cnCyl(0.32, 0.5, H, M.mast, x, H / 2 - 0.7, 0, 10)); g.add(cnCyl(0.55, 0.55, 0.5, M.mast, x, H * 0.6, 0, 10)); g.add(cnSph(0.5, M.white, x, H - 0.4, 0, 10, 6));
    for (const [yk, lk] of [[0.36, 1.25], [0.58, 1.0], [0.78, 0.74]]) { const y = H * yk - 0.7, len = Bm * lk * 1.4; const yd = cnCyl(0.18, 0.18, len, M.mast, x, y, 0, 6); yd.rotation.x = Math.PI / 2; g.add(yd);
      const sl = new THREE.Mesh(new THREE.CapsuleGeometry(0.62, len * 0.8, 4, 8), M.sail); sl.rotation.x = Math.PI / 2; sl.position.set(x + 0.1, y - 0.55, 0); g.add(sl); }
    const bm = cnCyl(0.18, 0.18, L * 0.22, M.mast, x - L * 0.11, 3.2, 0, 6); bm.rotation.z = Math.PI / 2; g.add(bm); const fs = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, L * 0.18, 4, 8), M.sail); fs.rotation.z = Math.PI / 2; fs.position.set(x - L * 0.11, 3.8, 0); g.add(fs);
    for (const sz of [-1, 1]) for (let k = 0; k < 3; k++) g.add(cnTube(V3(x - 1.5 + k * 1.5, 1.2, sz * Bm * 0.48), V3(x, H * 0.62, sz * 0.4), 0.06, M.rig, 4)); });
  const bow = V3(L / 2 + L * 0.2, 4.2, 0); g.add(cnTube(V3(L / 2 - 2, 0.9, 0), bow, 0.26, M.mast, 6));
  g.add(cnTube(V3(MH[0][0], MH[0][1] - 1, 0), bow, 0.07, M.rig, 4)); g.add(cnTube(V3(MH[0][0], MH[0][1] * 0.78, 0), V3(L / 2 + L * 0.08, 2.4, 0), 0.07, M.rig, 4));
  if (MH[1]) g.add(cnTube(V3(MH[0][0], MH[0][1] * 0.9, 0), V3(MH[1][0], MH[1][1] - 1, 0), 0.07, M.rig, 4));
  const last = MH[MH.length - 1]; g.add(cnTube(V3(last[0], last[1] - 1, 0), V3(-L / 2 + 0.5, 1.4, 0), 0.07, M.rig, 4));
  for (let i = 0; i < 4; i++) { const f = cnCyl(0.5, 0.5, 1.6, M.fender, -L * 0.3 + i * L * 0.2, -0.6, -Bm / 2 - 0.3, 8); g.add(f); }
  // stern flagpole (the flag itself is animated: returned in userData.flagAt)
  g.add(cnTube(V3(-L / 2 + 0.6, 1.2, 0), V3(-L / 2 - 1.6, 9, 0), 0.1, M.mast, 5)); g.userData.flagAt = V3(-L / 2 - 1.6, 9, 0);
  return g; }

// ---- the build
function cnBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.4, 7000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#7090d8', ambI: 0.24, sky: '#8ab0f0', ground: '#c09068', key: '#ffb468', keyI: 2.6, keyP: [200, 120, 220], rim: '#ffa060', rimI: 0.3, rimP: [-160, 60, -200] });
  s.key.userData.I = 2.6; s.key.userData.dir = V3(0.55, 0.42, 0.72).normalize();
  const M = CN.M = { iron: c3Prop('#25352f', { rough: 0.45, metal: 0.35 }), gold: c3Prop('#e8c04a', { metal: 0.7, rough: 0.3 }), chrome: c3Prop('#d8dce2', { rough: 0.2, metal: 0.8, env: 1.6 }),
    tyre: c3Prop('#22222a', { rough: 0.8 }), black: c3Prop('#2a2a30', { rough: 0.6 }), basket: c3Prop('#b8884a', { rough: 0.85 }), wood: c3Prop('#a8703a', { rough: 0.75 }), deck: c3Prop('#c8945a', { rough: 0.8 }),
    white: c3Prop('#f4f0e6', { rough: 0.45 }), cream: c3Prop('#f2e2c2', { rough: 0.8 }), hullDk: c3Prop('#2a3040', { rough: 0.5 }), mast: c3Prop('#b07a44', { rough: 0.6 }), sail: c3Prop('#f2e8d2', { rough: 0.9 }),
    rig: c3Prop('#3a2a22', { rough: 0.8 }), glass: c3Prop('#2a3e5a', { rough: 0.08, metal: 0.5, env: 2 }), fender: c3Prop('#2a2a34', { rough: 0.6 }), lifering: c3Prop('#e8402e', { rough: 0.5 }),
    granite: c3Prop('#ffffff', { map: cnRep(cnTexGranite(), 60, 1), rough: 0.85 }), green: c3Prop('#2f6a4a', { rough: 0.55 }), slate: c3Prop('#ffffff', { map: cnTexTiles('#5a6274'), rough: 0.7 }),
    tileR: c3Prop('#ffffff', { map: cnTexTiles('#b8502e'), rough: 0.75 }), copper: c3Prop('#5aa08a', { rough: 0.5, metal: 0.2 }) };
  const K = new THREE.Group(), KF = new THREE.Group();   // static detail baked at the end (KF: far/background, no shadows)
  s.sky = c3SkyDome(scene, { paint: true, zenith: '#2f68cc', mid: '#86b8ec', midH: 0.22, horizon: '#ffe2bc', glow: '#ffb470', glowK: 0.4, ground: '#b89a7a', sun: [0.55, 0.22, 0.8], clouds: 36, cloudScale: 1.1, seed: 11, cloudLit: '#fff0dc', cloudShade: '#9a9ad0', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#f2d6bc', 380, 2600);
  // ---- ground: near quay (cobbles), quay walls, water, far quay
  { const cob = c3Prop('#ffffff', { map: cnRep(cnTexCobbles(), 70, 9), rough: 0.9 });
    const q = pl(900, 60, cob, 0, 0, -30, 0, -Math.PI / 2); scene.add(q); const q2 = pl(900, 60, c3Prop('#ffffff', { map: cnRep(cnTexCobbles(), 70, 9), rough: 0.9 }), 0, 0, 102, 0, -Math.PI / 2); scene.add(q2);
    for (const [z, sz] of [[0, 1], [72, -1]]) { const wl = rbNC(900, 4.2, 1.6, M.granite, 0, -1.9, z - sz * 0.8, 0); scene.add(wl); K.add(rb(900, 0.5, 2.2, c3Prop('#c8bcaa', { rough: 0.8 }), 0, 0.05, z - sz * 1.0, 0)); }
    s.waterTex = cnRep(cnTexWater(), 14, 2.6); s.water = pl(900, 72, c3Prop('#ffffff', { map: s.waterTex, rough: 0.12, metal: 0.25, env: 1.8 }), 0, -3.5, 36, 0, -Math.PI / 2); s.water.userData.noCast = true; s.water.userData.keep = true; scene.add(s.water);
    scene.add(pl(1800, 1800, c3Prop('#9a8a7a', { rough: 0.95 }), 0, -0.08, -300, 0, -Math.PI / 2)); }
  // ---- houses
  const walls = ['#e9a53b', '#c9472f', '#2c9c97', '#ecc23c', '#3d6fba', '#e2703a', '#d9504a', '#4aa0c8', '#f0b84a', '#b84a5a', '#5aa86a', '#e88a3a'];
  const shops = ['CAFÉ', 'KRO', 'BAGERI', 'VINSTUE', 'BAR', 'KAGE', 'IS', 'RESTAURANT', 'CAFÉ', 'KRO', 'SMØRREBRØD', 'BODEGA'], bands = ['#1f4f9a', '#c8282a', '#2a7a4a', '#6a3a8a', '#1a6a8a', '#8a3a1e'];
  const kinds = ['step', 'bell', 'tri', 'eaves', 'step', 'eaves', 'bell', 'tri'];
  s.flags = []; let hi = 0;
  const house = (x0, w, side, o = {}) => { const R = RNG('cnhouse', hi), nF = o.nF ?? R.i(3, 5), bays = Math.max(2, Math.round(w / 7.5)), wall = o.wall ?? walls[(hi * 5 + (side > 0 ? 3 : 0)) % walls.length], H = CN_G + nF * CN_FH + 2.2, D = 30;
    const kind = o.kind ?? kinds[(hi + (side > 0 ? 1 : 0)) % kinds.length], zf = side < 0 ? -48 : 110, par = side < 0 ? K : KF;
    const g = cnAt(new THREE.Group(), x0 + w / 2, 0, side < 0 ? zf - D / 2 : zf + D / 2, side < 0 ? 0 : Math.PI);
    const wm = c3Prop(wall, { rough: 0.85 }), body = cnBox(w, H, D, wm, 0, H / 2, 0); body.userData.noCast = true; g.add(body);
    const fac = pl(w, H, c3Prop('#ffffff', { map: cnTexFacade(hi + (side > 0 ? 100 : 0), wall, w, H, nF, bays, R.f() < 0.55 ? shops[hi % shops.length] : '', bands[hi % bands.length], R.f() < 0.35 ? ['#2a6a4a', '#1e4a7a', '#8a2a24', '#f4f0e6'][R.i(0, 3)] : null), rough: 0.85 }), 0, H / 2, D / 2 + 0.05); fac.userData.noCast = true; g.add(fac);
    const lite = c3Prop(c3Shd(wall, 1.15), { rough: 0.8 }), roofM = R.f() < 0.65 ? M.tileR : M.slate;
    g.add(cnBox(w + 0.8, 1.2, 1.2, lite, 0, H - 0.6, D / 2 + 0.3));   // cornice
    let topY = H;
    if (kind === 'eaves') { const rh = R.r(11, 15), rf = cnPrism(D + 2, rh, w + 1, roofM); rf.geometry.rotateY(Math.PI / 2); rf.geometry.translate(-(w + 1) / 2, 0, 0); rf.position.set(0, H, 0); g.add(rf); topY = H + rh;
      const nd = Math.max(1, Math.round(w / 9)); for (let i = 0; i < nd; i++) { const dx = -w / 2 + (i + 0.5) * w / nd, dz = D / 2 - 3.6, dy = H + rh * (1 - (dz + 1) / (D / 2 + 1)) * 0.98;
        const dm = new THREE.Group(); dm.position.set(dx, dy - 2.2, dz); g.add(dm); dm.add(cnBox(4.6, 5.2, 5, wm, 0, 2.4, 0)); dm.add(cnBox(2.8, 3.2, 0.1, M.glass, 0, 2.6, 2.52)); dm.add(cnBox(3.4, 0.5, 0.3, M.white, 0, 0.9, 2.55)); for (const fx of [-1.5, 1.5]) dm.add(cnBox(0.4, 3.6, 0.3, M.white, fx, 2.6, 2.55)); dm.add(cnBox(3.4, 0.4, 0.3, M.white, 0, 4.3, 2.55));
        const dr = cnPrism(5.6, 2.8, 6.4, roofM); dr.position.set(0, 4.9, -3.6); dm.add(dr); } }
    else { const gh = o.gh ?? (kind === 'tri' ? w * 0.55 : w * R.r(0.7, 0.9)), gs = cnGable(kind, w, gh), gw = cnExt(gs, 1.6, wm); gw.position.set(0, H, D / 2 - 1.6); g.add(gw); topY = H + gh;
      const coping = cnExt(cnGable(kind, w + 0.6, gh + 0.35), 0.4, lite); coping.position.set(0, H - 0.1, D / 2 - 0.15); coping.scale.set(1, 1, 1); g.add(coping);
      const rf = cnPrism(w - 0.6, gh * 0.82, D - 1.8, roofM); rf.position.set(0, H, -D / 2); g.add(rf);
      if (!o.clock) { g.add(cnBox(3.2, 4.2, 0.2, c3Prop('#5a3a24', { rough: 0.7 }), 0, H + gh * 0.32, D / 2 + 0.12)); g.add(cnBox(3.8, 0.5, 0.4, lite, 0, H + gh * 0.32 - 2.3, D / 2 + 0.2));   // loft hatch + hoist beam
        g.add(cnBox(0.8, 0.8, 4, M.wood, 0, H + gh * 0.62, D / 2 + 1.6)); g.add(cnTube(V3(0, H + gh * 0.62 - 0.4, D / 2 + 3.3), V3(0, H + gh * 0.4, D / 2 + 3.3), 0.06, M.rig, 4)); }
      if (kind === 'bell' && !o.clock) { const oc = new THREE.Mesh(new THREE.CircleGeometry(1.2, 16), M.glass); oc.position.set(0, H + gh * 0.7, D / 2 + 0.12); g.add(oc); }
      if (kind === 'step') for (let i = 0; i < 3; i++) for (const sx of [-1, 1]) { const st = w / 2 / 3.7, x = sx * (w / 2 - (i + 0.5) * st), y = H + (i + 1) * gh / 4 + 0.6; g.add(cnCyl(0.25, 0.35, 1.2, lite, x, y, D / 2 - 0.8, 6)); g.add(cnSph(0.35, lite, x, y + 0.8, D / 2 - 0.8, 8, 6)); } }
    for (let i = 0; i < (w > 16 ? 2 : 1); i++) { const cx = (i ? 1 : -1) * w * 0.28, cz = -D * 0.2 + i * 6; g.add(cnBox(2.4, 9, 2.4, c3Prop(c3Shd(wall, 0.85), { rough: 0.9 }), cx, topY - 4 + (kind === 'eaves' ? -2 : -1), cz)); g.add(cnBox(3.0, 0.6, 3.0, lite, cx, topY + 0.4 + (kind === 'eaves' ? -2 : -1), cz)); }
    // window boxes with flowers (first floor), a cellar railing, a bench or bike in front
    if (R.f() < 0.65) { const bw = w / bays; for (let b = 0; b < bays; b++) { const bx = -w / 2 + (b + 0.5) * bw, by = CN_G + 2.2; g.add(rb(bw * 0.52, 1.1, 1.3, c3Prop(['#2f6a4a', '#8a3a24', '#f4f0e6'][hi % 3], { rough: 0.7 }), bx, by, D / 2 + 0.7, 0));
      for (let k = 0; k < 6; k++) { const f = cnSph(0.5, c3Prop(['#e8344a', '#ff6a8a', '#ffd23a', '#ffffff', '#e8344a'][(k + b) % 5], { rough: 0.7 }), bx - bw * 0.22 + k * bw * 0.088, by + 0.9 + (k % 2) * 0.25, D / 2 + 0.8 + (k % 2) * 0.2, 8, 6); g.add(f); }
      g.add(cnSph(0.7, c3Prop('#3a8a3a', { rough: 0.8 }), bx - bw * 0.15, by + 0.7, D / 2 + 0.75, 8, 6)); g.add(cnSph(0.7, c3Prop('#4a9a40', { rough: 0.8 }), bx + bw * 0.15, by + 0.7, D / 2 + 0.75, 8, 6)); } }
    { const cx = hi % 2 ? -w / 2 + 4 : w / 2 - 4; for (const sx of [-2.4, 2.4]) g.add(cnCyl(0.12, 0.12, 2.6, M.iron, cx + sx, 1.3, D / 2 + 2.6, 5)); g.add(cnTube(V3(cx - 2.4, 2.6, D / 2 + 2.6), V3(cx + 2.4, 2.6, D / 2 + 2.6), 0.12, M.iron, 5));
      for (const sz of [0.6, 1.6]) g.add(cnTube(V3(cx - 2.4, 2.6, D / 2 + sz), V3(cx - 2.4, 2.6, D / 2 + 2.6), 0.1, M.iron, 5)); }
    if (o.flag || (R.f() < 0.3 && !o.clock)) { const fy = CN_G + CN_FH * 1.3, fx = (R.f() < 0.5 ? -1 : 1) * w * 0.3, a = V3(fx, fy, D / 2 + 0.2), b = V3(fx, fy + 6.2, D / 2 + 7.4); g.add(cnTube(a, b, 0.14, M.white, 6)); g.add(cnSph(0.3, M.gold, b.x, b.y + 0.2, b.z, 8, 6));
      g.updateMatrixWorld(true); s.flags.push({ at: g.localToWorld(b.clone().add(V3(0, -0.3, 0))), w: 7, h: 5, ry: g.rotation.y + Math.PI / 2 * (fx < 0 ? 1 : -1) * 0 }); }
    if (o.clock) { const cr = 4.3, cz = D / 2 + 0.1, cy = H + 5.8; g.add(cnCyl(cr + 0.5, cr + 0.5, 0.6, M.gold, 0, cy, cz, 32)); g.children.at(-1).rotation.x = Math.PI / 2;
      const face = new THREE.Mesh(new THREE.CircleGeometry(cr, 40), c3Flat('#ffffff', { map: cnTexClock() })); face.position.set(0, cy, cz + 0.32); g.add(face);
      s.clockHands = []; for (const [len, wd, z] of [[2.4, 0.42, 0.45], [3.5, 0.28, 0.55]]) { const hgrp = new THREE.Group(); hgrp.position.set(0, cy, cz + z); hgrp.add(rb(wd, len, 0.1, c3Prop('#1e1e28', { rough: 0.5 }), 0, len * 0.42, 0, 0)); g.add(hgrp); s.clockHands.push(hgrp); }
      g.add(cnCyl(0.32, 0.32, 0.3, M.gold, 0, cy, cz + 0.7, 10)); g.children.at(-1).rotation.x = Math.PI / 2; g.add(cnBox(6, 0.6, 1.0, lite, 0, cy - cr - 1.0, cz + 0.2)); }
    // move the static parts into the bake group; keep the clock hands live
    g.updateMatrixWorld(true); const live = s.clockHands && o.clock ? s.clockHands : [];
    const gB = new THREE.Group(); gB.position.copy(g.position); gB.rotation.copy(g.rotation); [...g.children].forEach((c) => { if (!live.includes(c)) gB.add(c); }); par.add(gB); if (live.length) scene.add(g);
    hi++; return { H, topY }; };
  // near row: the clock house behind the post first, then outward both ways
  house(3, 18, -1, { nF: 3, kind: 'bell', wall: '#3d6fba', clock: true, gh: 15 });
  { let x = 3, R = RNG('cnrowL'); while (x > -260) { const w = R.r(15, 24); x -= w + 0.15; house(x, w, -1, x > -40 && x < -20 ? { flag: true } : {}); } }
  { let x = 21.15, R = RNG('cnrowR'); while (x < 280) { const w = R.r(15, 24); house(x, w, -1, x > 20 && x < 46 ? { flag: true, wall: '#ecc23c', kind: 'step' } : {}); x += w + 0.15; } }
  { let x = -260, R = RNG('cnrowF'); while (x < 280) { const w = R.r(15, 24); house(x, w, 1); x += w + 0.15; } }
  // rooftops behind the near row + Frederik's Church dome + a spire (silhouettes over the roofs)
  { const R = RNG('cnback'); for (let x = -300; x < 320; x += R.r(22, 34)) { const h = R.r(48, 78), w = R.r(20, 32), b = cnBox(w, h, 24, c3Prop(walls[R.i(0, walls.length - 1)], { rough: 0.9 }), x, h / 2, -100 - R.r(0, 30)); KF.add(b);
      const rf = cnPrism(w + 1, R.r(8, 14), 26, R.f() < 0.6 ? M.tileR : M.slate); rf.position.set(x, h, b.position.z - 13); KF.add(rf); }
    const dm = new THREE.Group(); dm.position.set(-90, 0, -330); KF.add(dm); dm.add(cnCyl(42, 42, 70, c3Prop('#e8dcc4', { rough: 0.8 }), 0, 35, 0, 32)); dm.add(cnCyl(34, 34, 22, c3Prop('#e8dcc4', { rough: 0.8 }), 0, 81, 0, 32));
    const dome = new THREE.Mesh(new THREE.SphereGeometry(35, 32, 12, 0, TAU, 0, Math.PI / 2), M.copper); dome.position.y = 92; dm.add(dome); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dm.add(cnBox(1.4, 20, 1.4, M.cream, Math.cos(a) * 34.3, 81, Math.sin(a) * 34.3)); }
    dm.add(cnCyl(6, 6, 12, M.copper, 0, 132, 0, 12)); dm.add(cnCyl(1, 4, 10, M.copper, 0, 143, 0, 8)); dm.add(cnSph(2, M.gold, 0, 149, 0));
    const sp = new THREE.Group(); sp.position.set(150, 0, -280); KF.add(sp); sp.add(cnBox(26, 96, 26, c3Prop('#b8583a', { rough: 0.85 }), 0, 48, 0)); sp.add(cnBox(28, 2, 28, M.cream, 0, 96, 0));
    for (let i = 0; i < 4; i++) sp.add(cnCyl(12 - i * 2.6, 13 - i * 2.6, 14, i % 2 ? M.gold : M.iron, 0, 104 + i * 14, 0, 8)); sp.add(cnCyl(0.2, 2.4, 22, M.gold, 0, 168, 0, 8)); sp.add(cnSph(2.4, M.gold, 0, 180, 0)); }
  // ---- ships (near quay: gap left in front of the post), far side ships, a canal tour boat
  s.shipFlags = [];
  for (const [x, z, L, Bm, col, mk, sd, ry] of [[-48, 7.2, 40, 10, '#1f6a4a', 2, 1, 0], [54, 7.0, 38, 9.6, '#1e3e7a', 1, 2, Math.PI], [-100, 7.4, 44, 10.4, '#8a2a24', 2, 3, 0], [104, 7.2, 40, 10, '#2a2a34', 2, 4, Math.PI],
    [-150, 7.2, 36, 9.4, '#2c7c96', 1, 5, Math.PI], [-20, 64.5, 40, 10, '#b8402e', 2, 6, Math.PI], [36, 64.8, 36, 9.6, '#2a5a8a', 1, 7, 0], [92, 64.6, 42, 10, '#1f6a4a', 2, 8, Math.PI], [-80, 64.6, 38, 10, '#e8b43a', 1, 9, 0]]) {
    const sh = cnShip(M, L, Bm, col, mk, sd); cnAt(sh, x, -0.6, z, ry); K.add(sh); sh.updateMatrixWorld(true); s.shipFlags.push(sh.localToWorld(sh.userData.flagAt.clone())); }
  // ---- quay furniture: bollards, benches, other lamps, bikes, crates, the cafe kiosk + tables with striped parasols
  { const ch = c3Prop('#3a3a40', { rough: 0.4, metal: 0.5 }); for (let x = -16; x <= 30; x += 7.5) { K.add(cnCyl(0.6, 0.75, 2.4, M.iron, x, 1.2, 1.6, 10)); K.add(cnSph(0.7, M.iron, x, 2.6, 1.6, 10, 6)); K.add(cnCyl(0.78, 0.78, 0.25, M.gold, x, 2.2, 1.6, 10));
      if (x + 7.5 <= 30) for (let i = 0; i < 10; i++) { const u0 = i / 10, u1 = (i + 1) / 10, y = (u) => 2.2 - 1.1 * 4 * u * (1 - u); K.add(cnTube(V3(x + 7.5 * u0, y(u0), 1.6), V3(x + 7.5 * u1, y(u1), 1.6), 0.09, ch, 4)); } }
    for (const [x, sc] of [[-6, 1], [19, 0.9]]) for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.1 * sc, 0.2, 6, 18), c3Prop('#c89a5a', { rough: 0.85 })); r.rotation.x = Math.PI / 2; r.position.set(x, 0.2 + i * 0.32, 0.6); K.add(r); } }
  for (let x = -200; x < 220; x += 11) { if (x > -18 && x < 32) continue; K.add(cnCyl(0.7, 0.9, 2.2, M.iron, x, 1.1, 1.8, 10)); K.add(cnSph(0.85, M.iron, x, 2.4, 1.8, 10, 6)); }
  for (const x of [-46, 58, -110, 120]) { const l = cnLamp(M, 0.85); l.position.set(x, 0, -6); K.add(l); }
  for (const [x, ry] of [[-34, 0], [40, 0], [-76, 0]]) { const b = cnAt(new THREE.Group(), x, 0, -4, ry); b.add(rb(9, 0.5, 2.4, M.wood, 0, 2.6, 0)); b.add(rb(9, 2.0, 0.4, M.wood, 0, 4.2, -1.1)); for (const bx of [-3.8, 3.8]) b.add(rb(0.5, 2.6, 2.2, M.iron, bx, 1.3, 0)); K.add(b); }
  { const cols = ['#c8282a', '#2a6ab8', '#2a8a5a', '#ecc23c', '#f4f0e6', '#8a3a8a', '#e86a2a']; let i = 0;
    for (const [x, z, ry] of [[-44, -45, 0.15], [-38, -45.4, -0.1], [-60, -45, 0.2], [34, -45.2, -0.15], [40.5, -45, 0.1], [70, -45, 0.15], [-30, -6, 1.4], [26, -6.5, 1.5], [-88, -45, 0.1], [92, -45, -0.1]]) { const b = cnBike(M, cols[i++ % cols.length]); cnAt(b, x, 0, z, ry); K.add(b); } }
  for (const [x, z] of [[-24, -3], [-26.6, -3.4], [33, -3.2]]) { K.add(rb(2.6, 2.4, 2.6, M.wood, x, 1.2, z)); }
  K.add(cnCyl(1.3, 1.3, 3.0, c3Prop('#8a5a32', { rough: 0.8 }), 36.5, 1.5, -3.4, 12));
  s.parasols = [];
  { const [kx, kz, kw, kd, kh] = CN_KIOSK, g = cnAt(new THREE.Group(), kx, 0, kz), pan = c3Prop('#2f6a4a', { rough: 0.6 });
    g.add(rb(kw, kh, kd, pan, 0, kh / 2, 0)); g.add(rb(kw + 1.2, 0.8, kd + 1.2, M.cream, 0, kh + 0.4, 0)); g.add(cnBox(kw - 3, 4, 0.2, c3Prop('#ffe2a8', { emissive: '#ffcf8a', ei: 0.35, rough: 0.5 }), -0.4, 6.4, kd / 2 + 0.06));
    g.add(rb(kw - 2.4, 0.5, 1.4, M.wood, -0.4, 4.3, kd / 2 + 0.6)); for (let i = 0; i < 5; i++) g.add(cnCyl(0.32, 0.26, 0.7, c3Prop(['#f4f0e6', '#e8402e', '#2a6ab8'][i % 3], { rough: 0.4 }), -3 + i * 1.3, 4.9, kd / 2 + 0.6, 8));
    const aw = new THREE.Mesh(new THREE.BoxGeometry(kw + 0.6, 0.25, 3.2), c3Prop('#ffffff', { map: cnTexStripe('#f4f0e6', '#d8282a'), rough: 0.8 })); aw.position.set(0, 9.2, kd / 2 + 1.4); aw.rotation.x = 0.4; g.add(aw);
    const aw2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.25, kd + 0.6), c3Prop('#ffffff', { map: cnTexStripe('#f4f0e6', '#d8282a'), rough: 0.8 })); aw2.position.set(kw / 2 + 1.4, 9.2, 0); aw2.rotation.z = -0.4; g.add(aw2);
    g.add(pl(kw * 0.8, 2.6, c3Flat('#ffffff', { map: cnTexSign('CAFÉ', '#c8282a') }), 0, kh + 2.4, kd / 2 - 0.5)); g.add(cnBox(kw * 0.84, 3.0, 0.4, c3Prop('#2a1e1a'), 0, kh + 2.4, kd / 2 - 0.8));
    g.add(pl(4, 2.0, c3Flat('#ffffff', { map: cnTexSign('KAGE · KAFFE', '#2a5a3a', '#fff3d6', 512, 200) }), kw / 2 + 0.07, 6.2, 0, Math.PI / 2));
    const mb = cnAt(new THREE.Group(), kw / 2 + 1.6, 0, kd / 2 + 2.2, -0.5); mb.add(rb(2.6, 4.2, 0.3, c3Prop('#2a2a30'), 0, 2.2, 0)); mb.add(pl(2.2, 3.4, c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#2a2e2a'; x.fillRect(0, 0, w, h); inked(x, 'KAGE', w / 2, h * 0.2, h * 0.12, '#ffe2a0', { stroke: false, maxW: w * 0.8 }); x.fillStyle = '#f4f0e6'; for (let i = 0; i < 5; i++) x.fillRect(w * 0.15, h * (0.38 + i * 0.11), w * (0.5 + (i % 2) * 0.2), 6); }, 128, 200) }), 0, 2.3, 0.17)); g.add(mb);
    K.add(g); }
  { const parM = [c3Prop('#ffffff', { map: cnTexStripe('#f4f0e6', '#d8282a', 16), rough: 0.8 }), c3Prop('#ffffff', { map: cnTexStripe('#f4f0e6', '#1f5aa8', 16), rough: 0.8 }), c3Prop('#ffffff', { map: cnTexStripe('#ffe08a', '#2a8a5a', 16), rough: 0.8 })];
    for (const [x, z, mi] of [[-32, -38, 0], [-46, -36, 1], [-58, -38, 2], [-24, -30, 1], [30, -38, 0], [44, -37, 2], [58, -39, 1], [-72, -37, 0]]) { const g = cnAt(new THREE.Group(), x, 0, z);
      g.add(cnCyl(0.18, 0.18, 12, M.chrome, 0, 6, 0, 6)); const cn = new THREE.Mesh(new THREE.ConeGeometry(7.5, 2.4, 16, 1, true), parM[mi]); cn.material.side = THREE.DoubleSide; cn.position.y = 12.4; g.add(cn); g.add(cnSph(0.4, M.chrome, 0, 13.7, 0, 8, 6));
      g.add(cnCyl(2.4, 2.4, 0.3, M.white, 0, 4.6, 0, 18)); g.add(cnCyl(0.25, 0.4, 4.4, M.iron, 0, 2.3, 0, 6)); g.add(cnCyl(1.2, 1.2, 0.2, M.iron, 0, 0.1, 0, 10));
      for (let k = 0; k < 2; k++) g.add(cnCyl(0.35, 0.3, 0.6, c3Prop(['#f4f0e6', '#c8282a', '#2a6ab8'][k + mi > 2 ? 0 : k + mi], { rough: 0.4 }), -0.8 + k * 1.4, 5.1, 0.4 - k * 0.6, 8));
      for (const a of [0.6, 2.4, 4.2]) { const c = cnAt(new THREE.Group(), Math.cos(a) * 4, 0, Math.sin(a) * 4, -a + Math.PI / 2); c.add(rb(2, 0.3, 2, c3Prop('#3a3a44', { rough: 0.5 }), 0, 2.8, 0)); c.add(rb(2, 2.4, 0.25, c3Prop('#3a3a44', { rough: 0.5 }), 0, 4.2, -0.9));
        for (const [cx, cz] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) c.add(cnCyl(0.1, 0.1, 2.8, M.iron, cx, 1.4, cz, 5)); g.add(c); }
      K.add(g); s.parasols.push(g); } }
  // planters with clipped shrubs on the quay
  for (const [x, z] of [[-52, -20], [62, -22], [-90, -20], [100, -20]]) { K.add(rb(4, 2.4, 4, c3Prop('#5a6a7a', { rough: 0.6 }), x, 1.2, z)); K.add(cnSph(2.4, c3Prop('#3f8a3a', { rough: 0.8 }), x, 4, z, 12, 8)); }
  // THE lamppost (kept as its own mesh group: the hero is tied to it)
  s.post = cnLamp(M, 1.0); s.post.position.copy(CN_POST); K.add(s.post);
  scene.add(cnBake(K)); scene.add(cnBake(KF, { noCast: true, ao: false }));
  // ---- animated flags (houses + ship sterns): a waving plane per flag
  { const fm = c3Prop('#ffffff', { map: cnTexFlag(), rough: 0.8 }); fm.side = THREE.DoubleSide; s.flagMeshes = [];
    const mk = (at, w, h, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 12, 3), fm); m.geometry.translate(w / 2, -h / 2, 0); m.userData.base = Float32Array.from(m.geometry.attributes.position.array); m.position.copy(at); m.rotation.y = ry; m.userData.keep = true; m.userData.noCast = true; scene.add(m); s.flagMeshes.push(m); };
    s.flags.forEach((f) => mk(f.at, 7, 5, -0.6)); s.shipFlags.forEach((p) => mk(p, 5.4, 3.8, Math.PI * 0.85));
    const pole = c3Prop('#f4f0e6', { rough: 0.4 }); s.quayPole = cnCyl(0.25, 0.32, 44, pole, -34, 22, -22, 8); scene.add(s.quayPole); scene.add(cnSph(0.6, M.gold, -34, 44.4, -22, 10, 8)); mk(V3(-34, 43, -22), 10, 6.6, -0.4); }
  // ---- FOCUS props: cupcake, rope coil, rope rings + end, bucket, sack, sprites
  const Fg = new THREE.Group(); scene.add(Fg);
  { const g = new THREE.Group(); g.add(cnCyl(0.62, 0.48, 0.75, c3Prop('#ff8ab8', { rough: 0.5 }), 0, 0.37, 0, 16)); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.add(cnBox(0.08, 0.72, 0.08, c3Prop('#ffb6d4', { rough: 0.5 }), Math.cos(a) * 0.56, 0.38, Math.sin(a) * 0.56)); }
    const fr = new THREE.Mesh(new THREE.SphereGeometry(0.72, 16, 10, 0, TAU, 0, Math.PI / 2), c3Prop('#fff4f8', { rough: 0.35 })); fr.position.y = 0.72; fr.scale.y = 0.85; g.add(fr); g.add(cnSph(0.18, c3Prop('#e8283a', { rough: 0.3 }), 0.3, 1.35, 0.2, 10, 8));
    for (let i = 0; i < 10; i++) g.add(cnBox(0.06, 0.18, 0.06, c3Prop(['#ffd23a', '#3ac8e8', '#7ae84a', '#ff5a8a'][i % 4], { rough: 0.5 }), Math.cos(i * 2.4) * 0.45, 1.05 + (i % 3) * 0.08, Math.sin(i * 2.4) * 0.45));
    s.c25 = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.86), c3Flat('#ffffff', { map: cnTex25(), transparent: true })); s.c25.position.set(0, 1.85, 0.1); s.c25.material.alphaTest = 0.3; g.add(s.c25);
    g.add(cnCyl(0.03, 0.03, 0.3, M.black, 0, 2.4, 0.1, 4)); s.flame = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.6), c3Flat('#ffffff', { map: cnTexFlame(), transparent: true, depthWrite: false })); s.flame.userData.noInk2 = true; s.flame.position.set(0, 2.75, 0.12); g.add(s.flame);
    s.cupcake = g; Fg.add(g); g.scale.setScalar(1.6); }
  const ropeM = c3Prop('#ffffff', { map: cnTexRope(), rough: 0.8 });
  { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.17, 6, 20), ropeM); t.rotation.x = Math.PI / 2 + 0.2; t.rotation.y = i * 0.25; t.position.y = -i * 0.22; g.add(t); } s.coil = g; Fg.add(g); }
  s.rings = []; for (const y of [3.6, 5.6, 7.6]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.17, 8, 40), ropeM); r.rotation.x = Math.PI / 2; r.userData.y = y; Fg.add(r); s.rings.push(r); }
  s.ropeEnd = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1, 6), ropeM); Fg.add(s.ropeEnd);
  s.knot = cnSph(0.42, ropeM, 0, 0, 0, 10, 8); Fg.add(s.knot);
  { const g = new THREE.Group(), bm = c3Prop('#8aa6c0', { rough: 0.3, metal: 0.6, env: 1.6 }); const b = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.8, 1.7, 18, 1, true), bm); b.material.side = THREE.DoubleSide; b.position.y = 0.85; g.add(b);
    g.add(cnCyl(0.8, 0.8, 0.08, bm, 0, 0.04, 0, 18)); const rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.07, 6, 24), bm); rim.rotation.x = Math.PI / 2; rim.position.y = 1.7; g.add(rim);
    s.bucketWater = cnCyl(0.98, 0.98, 0.05, c3Prop('#5ab0e0', { rough: 0.1, env: 1.6 }), 0, 1.45, 0, 18); g.add(s.bucketWater);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 5, 20, Math.PI), M.iron); hd.position.y = 1.7; g.add(hd); s.bucket = g; Fg.add(g); }
  { const g = new THREE.Group(), pts = [[0, 0], [1.3, 0.05], [1.75, 0.6], [1.85, 1.6], [1.6, 2.5], [1.0, 3.0], [0.55, 3.25], [0.6, 3.55], [0.9, 3.8]].map(([x, y]) => new THREE.Vector2(x, y));
    const sm = c3Prop('#ffffff', { map: cnTexKanel(), rough: 0.9 }); const sack = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), sm); sack.material.side = THREE.DoubleSide; g.add(sack);
    g.add(cnTube(V3(-0.6, 3.2, 0.3), V3(0.6, 3.25, 0.3), 0.1, c3Prop('#5a3a1a'))); s.sackIn = cnCyl(0.8, 0.8, 0.05, c3Prop('#a8602a', { rough: 0.9 }), 0, 3.7, 0, 12); g.add(s.sackIn);
    s.sack = g; Fg.add(g); g.scale.setScalar(1.15); }
  c3Layer(Fg, C3.L_FOCUS);
  const puffT = cnTexPuff(); s.puffs = []; for (let i = 0; i < 16; i++) { const m = spritePlane(scene, puffT, 1, 1, 14); m.material.color.set('#b8743a'); s.puffs.push(m); }
  s.stream = []; for (let i = 0; i < 12; i++) { const m = spritePlane(scene, puffT, 1, 1, 13); m.material.color.set('#a8642e'); s.stream.push(m); }
  s.splash = spritePlane(scene, cnTexSplash(), 1, 1, 15); s.blob = spritePlane(scene, cnTexSplash(), 1, 1, 15);
  const dropT = cnTexDrop(); s.drops = []; for (let i = 0; i < 14; i++) s.drops.push(spritePlane(scene, dropT, 0.5, 0.75, 15));
  const wispT = cnTexWisp(); s.wisps = []; for (let i = 0; i < 4; i++) s.wisps.push(spritePlane(scene, wispT, 3, 1.5, 13));
  for (const m of [...s.puffs, ...s.stream, s.splash, s.blob, ...s.drops, ...s.wisps]) m.userData.noInk2 = true;
  for (const who of ['hero', 'fRope', 'fBucket', 'fSpice', 'stranger']) { const p = toonPerson(s, who); p.drawFn = cnDrawPerson; p.cnDust = 0; p.cnWet = 0; p.cnDustY = 1; }
  c3Env(scene, { top: '#a8c4f4', mid: '#c0c8dc', bot: '#6a5a4a' }); c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.5, scale: 0.3, inkSet: false, grimeH: 5, bounce: ['#9cb6e6', '#c8946a', 0.12] });
  // depth-only occluders on the FOCUS layer (after the look pass): the post (rope back arcs go behind it), the kiosk (the friends hide behind it)
  { const om = new THREE.MeshBasicMaterial({ colorWrite: false }); om.userData.c3keep = true; const occ = (geo, x, y, z) => { const m = new THREE.Mesh(geo, om); m.position.set(x, y, z); Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); scene.add(m); return m; };
    occ(new THREE.CylinderGeometry(0.62, 0.62, 21, 12), CN_POST.x, 10.5, CN_POST.z); occ(new THREE.CylinderGeometry(1.25, 1.25, 2.6, 12), CN_POST.x, 1.3, CN_POST.z);
    const [kx, kz, kw, kd, kh] = CN_KIOSK; occ(new THREE.BoxGeometry(kw, kh, kd), kx, kh / 2, kz); }
  return s;
}
// the person card + cinnamon dust (tint below a line that moves head -> toe, speckles, face kept clear) + wet sheen
// the lashing, drawn INTO the hero's card over his pinned arms: 3 flattened wraps that follow the bean torso (slightly
// diagonal), a crossing diagonal turn, contact shadows, ends that turn away behind him to the post, a knot + a dangling end.
// p.cnRope = tightness 0..1 per wrap (snaps on 'tie'); p.cnKnot = the knot's card point (for the 3D end in fRope's hand)
function cnDrawRope(g, p, st) { const R0 = p.cnRope; if (!R0) return; const d = t3Dims(p.o), sq = st.squash || 0, tb = 975 - d.legL + 0.05 * d.HH, top = tb - d.Th * (1 - 0.08 * sq), cx = 300 + (st.lean || 0) * 40;
  const hwAt = (f) => (d.tw / 2) * (0.84 + 0.16 * Math.sin(Math.PI * clamp(f))) * (1 + 0.06 * sq) + 26;
  const rope = (pts, w) => { const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); };
    g.lineCap = 'round'; g.save(); g.translate(0, 5); path(); g.strokeStyle = 'rgba(40,20,30,0.32)'; g.lineWidth = w + 10; g.stroke(); g.restore();   // contact shadow on the body
    path(); g.strokeStyle = '#5a3418'; g.lineWidth = w + 4; g.stroke(); path(); g.strokeStyle = '#d6a058'; g.lineWidth = w; g.stroke();
    g.save(); g.translate(0, -w * 0.22); path(); g.strokeStyle = 'rgba(255,236,190,0.55)'; g.lineWidth = w * 0.25; g.stroke(); g.restore();
    const n = 26; g.strokeStyle = 'rgba(110,62,26,0.75)'; g.lineWidth = 2.2; for (let i = 1; i < n; i++) { const u = i / n, a = 1 - u, x = a * a * pts[0][0] + 2 * a * u * pts[1][0] + u * u * pts[2][0], y = a * a * pts[0][1] + 2 * a * u * pts[1][1] + u * u * pts[2][1];
      g.beginPath(); g.moveTo(x - w * 0.22, y - w * 0.42); g.lineTo(x + w * 0.22, y + w * 0.42); g.stroke(); } };
  const wraps = [0.2, 0.47, 0.75], W0 = 15;
  wraps.forEach((f, i) => { const k = R0[i] ?? 1; if (k <= 0) return; const sc = lerp(1.75, 1, k), y = top + d.Th * f - (1 - k) * 40, hw = hwAt(f) * sc, tilt = (i - 1) * 4 + 5, sag = 10 + 8 * f;
    rope([[cx - hw, y - tilt], [cx, y + sag * 2], [cx + hw, y + tilt]], W0);
    if (k > 0.95) for (const sx of [-1, 1]) { g.fillStyle = 'rgba(40,20,10,0.45)'; g.beginPath(); g.ellipse(cx + sx * hw, y + sx * tilt + 2, 7, 9, 0, 0, TAU); g.fill(); } });   // the ends turn away behind him (to the post)
  const kAll = Math.min(...wraps.map((_, i) => R0[i] ?? 1));
  if (kAll > 0.95) { const y0 = top + d.Th * 0.2, y1 = top + d.Th * 0.75; rope([[cx - hwAt(0.2) * 0.92, y0 + 2], [cx - 10, (y0 + y1) / 2 + 10], [cx + hwAt(0.75) * 0.9, y1 + 8]], W0 * 0.9);   // the crossing diagonal turn
    const kx = cx + hwAt(0.47) * 0.32, ky = top + d.Th * 0.47 + 22; p.cnKnot = [kx, ky];
    g.fillStyle = '#5a3418'; for (const [ox, oy, r] of [[-9, -2, 13], [9, 3, 13], [0, 0, 11]]) { g.beginPath(); g.arc(kx + ox, ky + oy, r + 2, 0, TAU); g.fill(); }
    g.fillStyle = '#d6a058'; for (const [ox, oy, r] of [[-9, -2, 13], [9, 3, 13], [0, 0, 11]]) { g.beginPath(); g.arc(kx + ox, ky + oy, r - 1, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(110,62,26,0.8)'; g.lineWidth = 2.5; for (const ox of [-9, 9]) { g.beginPath(); g.arc(kx + ox, ky, 7, 0.4, 2.6); g.stroke(); }
    g.fillStyle = 'rgba(255,236,190,0.6)'; g.beginPath(); g.arc(kx - 5, ky - 7, 3.5, 0, TAU); g.fill();
    if (!p.cnEndOut) { const sw = Math.sin((st.t || 0) * 2.2) * 6; rope([[kx + 4, ky + 10], [kx + 18 + sw, ky + 70], [kx + 8 + sw * 1.6, ky + 125]], W0 * 0.85);
      g.strokeStyle = '#d6a058'; g.lineWidth = 3; for (const a of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(kx + 8 + sw * 1.6, ky + 125); g.lineTo(kx + 8 + sw * 1.6 + Math.sin(a) * 12, ky + 138); g.stroke(); } } }
  else p.cnKnot = null; }
function cnDrawPerson(g, p, st) { t3Draw(g, p, st); cnDrawRope(g, p, st); const k = p.cnDust || 0, wet = p.cnWet || 0; if (k <= 0.01 && wet <= 0.01) return;
  const d = t3Dims(p.o), headC = 975 - d.legL - d.Th - d.HH * 0.42, neck = headC + d.HH * 0.5, lineY = lerp(-50, 1000, p.cnDustY ?? 1);
  g.save(); g.globalCompositeOperation = 'source-atop';
  if (wet > 0.01) { g.fillStyle = `rgba(30,60,110,${0.16 * wet * (1 - 0.7 * k)})`; g.fillRect(0, 0, 600, 1000); const R = RNG('cnwet' + p.key); g.strokeStyle = `rgba(235,248,255,${0.6 * wet})`; g.lineCap = 'round';
    for (let i = 0; i < 40; i++) { const x = R.r(150, 450), y = R.r(neck, 960), l = R.r(10, 30); g.lineWidth = R.r(2, 4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + l); g.stroke(); } }
  if (k > 0.01) { g.fillStyle = `rgba(200,120,50,${0.72 * k})`; g.fillRect(0, Math.max(neck, 0), 600, Math.max(0, lineY - neck));
    if (lineY > headC - d.HH * 0.5) { g.fillStyle = `rgba(196,124,62,${0.22 * k})`; g.fillRect(0, 0, 600, Math.min(headC - d.HH * 0.3, lineY)); }   // only the top of the head
    const R = RNG('cndust' + p.key), n = Math.round(700 * k);
    for (let i = 0; i < n; i++) { const x = R.r(60, 540), y = R.r(headC - d.HH * 0.55, 975), r = R.r(1.6, 3.6), c = R.f(); if (y > lineY) continue;
      const fx = (x - 300) / (d.HH * 0.42), fy = (y - headC - d.HH * 0.05) / (d.HH * 0.34); if (fx * fx + fy * fy < 1.25 && !(fy < -0.8 && R.f() < 0.5) && !(fx * fx + fy * fy > 0.9 && R.f() < 0.04)) continue;   // the face stays clean (a few specks on the forehead + the rim)
      g.fillStyle = c < 0.55 ? 'rgba(120,58,20,0.85)' : c < 0.85 ? 'rgba(214,140,70,0.9)' : 'rgba(255,214,160,0.8)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } }
  g.restore(); }
const CN_get = () => CN.s ||= cnBuild();
SETS.canal = CN_get;

// ---- the camera path (absolute s). Take 1: 0–7.70 (whip out to the street). Take 2: 16.56–25.68 (whip in, whip out).
CAMSEQ.canal = [
  // c01: crane DOWN from the sky over the gables, flags and masts to the hero; lands on the cupcake on '25th' (2.00), orbit right on 'birthday'
  [0.00, [-34, 98, 74], [-6, 86, -48], 46, -6],
  [0.95, [-24, 50, 46], [0, 34, -30], 42, -4],
  [2.00, [0, 8.4, 15], [8.6, 6.4, -8], 34, -1],
  [2.80, [10.5, 8.8, 13], [8.2, 7.2, -8.3], 36, 2.5],
  // c02: whip-pan left to the cafe kiosk on 'friends' (3.40): the 3 friends peek out; push in
  [3.48, [3, 8.6, 9], [-10.5, 7, -22.5], 36, -3],
  [4.30, [-1.5, 8, 3.5], [-11, 7, -23], 29, -5],
  // c03: swing to the post (rope snaps on 'tie' 4.96), orbit right round it with a crane up, dutch on 'cinnamon' (7.14)
  [5.12, [-8, 9, 8], [4.5, 6.6, -9.4], 40, 2],
  [6.25, [12, 11, 7], [5.6, 7, -9.4], 38, 5],
  [7.14, [15, 12.4, 1.5], [5.8, 7.6, -9.4], 36, 7],
  [7.70, [15.6, 12.6, 0.2], [8.5, 7.6, -9.8], 36, 6],
  [7.95, [16, 12.6, -0.6], [30, 8.4, -3], 36, 4],          // phantom: keeps the whip-out moving (never rendered)
  // c04: whip in onto the gable clock (minute hand jumps on 'later' 16.90), crane DOWN the post to the hero (lantern on 'tied', him on 'post')
  [16.30, [-3, 25, 6], [-18, 52, -44], 34, -6],            // phantom: the whip-in arrives moving
  [16.56, [0, 30, 10], [8, 57, -46], 30, -4],
  [16.95, [2, 31, 9], [11.6, 60, -47], 25, -2],
  [17.55, [7.5, 19, 8], [6.2, 20, -10], 32, 1],
  [17.98, [10, 9, 8], [6.2, 7, -9.2], 36, 3],
  // c05: orbit left to the bucket friend + the hero; fast push + dutch on the splash (kick 19.40)
  [19.28, [2.5, 8.6, 12.5], [8.2, 6.6, -8], 40, -3],
  [19.62, [4.4, 8, 6.5], [6.2, 6.4, -8.8], 36, 7],
  // c06: crane up with the pour ('head' 20.36), tilt down to his feet on 'toe' (20.72), pull back on him dusted
  [20.36, [3.6, 13, 8], [4.4, 9.4, -9.6], 40, 3],
  [20.72, [7, 9, 7.5], [6, 4.6, -8.8], 40, -2],
  [21.30, [10.5, 9.2, 10.5], [8, 6.6, -8.2], 42, 2],
  // c07: swing right onto the stranger walking in ('stranger' 21.78), track him to his stop ('past' 22.34), push on the sniff (22.72)
  [21.49, [15, 9.3, 13.5], [14.8, 7, -6], 44, 0],
  [21.70, [21, 9.4, 15], [18.6, 7.6, -3.8], 40, -2],
  [22.34, [19.5, 9.4, 13], [16, 7.8, -4.5], 36, 1],
  [22.72, [18.5, 10, 11], [16, 8.8, -4.5], 33, 3],
  // c07/c08: pull back + crane up to a 2-shot on 'says', push on the stranger ('Happy birthday'), swing to the hero on 'single' (24.82), 2-shot on 'huh' (25.40)
  [23.40, [10.5, 12, 19], [11, 6.4, -7], 54, -1],
  [24.30, [18.5, 9.4, 11], [16, 8, -4.5], 34, -3],
  [24.82, [10.5, 8.8, 9.5], [6.4, 6.6, -8.7], 36, 3],
  [25.40, [11, 12, 19.5], [11, 6.6, -7], 54, -2],
  [25.68, [11.5, 12.2, 19.8], [11.6, 6.6, -7], 54, -3],
  [25.95, [11.8, 12.4, 20], [-12, 10, -10], 54, -6],         // phantom: whip-out to the history town
];

// ---- state
function cnShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; k.intensity = (k.userData.I ?? 2.6) * (C3_SHADOW.key ?? 1); if (!k.castShadow) return;
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(k.userData.dir, 200); }
const CN_TIED = (t) => (t >= 4.96 && t < 12) || t >= 16;
const CN_LOOKH = (t) => t >= 21.6 && t < 25.68 ? [20, -4] : [6 + 2 * Math.sin(t * 0.2), 20];
// the dust / wet state of the hero
function cnHeroState(t) { let dust = 0, dy = 1, wet = 0;
  if (t < 12) { dust = t < 7.14 ? 0 : 0.42 * EZ.o2((t - 7.14) / 0.3); }
  else { wet = t >= 19.4 ? EZ.o2((t - 19.4) / 0.12) : 0; if (t >= 20.15) { dust = 1; dy = EZ.io(clamp((t - 20.2) / 0.62)); } }
  return { dust, dy, wet }; }
// ---- people
function cnHero(s, t) { const cam = s.cam, H = CN_HERO, tied = CN_TIED(t), p = s.p.hero, S = cnHeroState(t); p.cnDust = S.dust; p.cnDustY = S.dy; p.cnWet = S.wet;
  const HOLD = { h: [0.4, 0.12], pole: [1, 0.7], hand: 'grip' }, hx = t < 4.5 ? 1.7 : t < 4.85 ? 1.7 * (1 - EZ.io((t - 4.5) / 0.35)) : 0;
  let o;
  if (t < 12 && !tied) o = { expr: [[0, 'neutral'], [2.56, 'happy']], hand: t < 3.5 ? { L: 'rest', R: HOLD } : { L: 'rest', R: 'rest' }, look: t < 3.0 ? [cam.position.x, cam.position.z] : [H.x - 4, H.z + 20], gaze: t >= 2.0 && t < 2.56 ? [0, 0.5] : undefined };
  else if (t < 12) o = { expr: [[4.96, 'shock'], [5.6, 'worried'], [7.14, 'strain'], [7.5, 'shock']], hand: { L: { h: [0.12, 0.8], pole: [1, 0.1] }, R: { h: [0.12, 0.8], pole: [1, 0.1] } },
    heading: 0.15, squash: t < 5.3 ? 0.18 * Math.sin(Math.PI * clamp((t - 4.96) / 0.3)) : 0, fx: t >= 5.6 && t < 7.1 ? 'sweat' : undefined, gaze: t >= 5.2 && t < 6.2 ? [-0.6, 0] : t >= 6.2 && t < 7.1 ? [0.7, 0] : undefined };
  else o = { expr: [[16, 'bored'], [17.48, 'angry'], [19.4, 'shock'], [19.9, 'sad'], [20.2, 'strain'], [21.0, 'deadpan'], [21.9, 'skeptical'], [23.66, 'deadpan'], [24.82, 'angry'], [25.4, 'sad']],
    hand: { L: { h: [0.12, 0.8], pole: [1, 0.1] }, R: { h: [0.12, 0.8], pole: [1, 0.1] } }, look: CN_LOOKH(t),
    squash: t >= 19.4 && t < 19.75 ? 0.2 * Math.sin(Math.PI * (t - 19.4) / 0.35) : 0, lean: t >= 19.4 && t < 19.7 ? -0.08 : 0, gaze: t >= 20.15 && t < 20.9 ? [0, -0.8] : undefined, tilt: t >= 24.82 && t < 25.4 ? -0.08 : 0 };
  o.noTilt = true; pose(s, 'hero', t, H.x + hx, H.z + hx * 0.3, o);
  // the cupcake: in both hands until 3.5 (camera on the cafe), then on the quay at his feet (candle out by 16 s)
  const cc = s.cupcake; cc.visible = true; s.flame.visible = t < 12; s.flame.scale.set(1 + 0.12 * Math.sin(t * 23), 1 + 0.18 * Math.sin(t * 17 + 1), 1);
  if (t < 3.5) { const m = c3ToonHandWorld(p, 'R'); if (m) { const d = cam.position.clone().sub(m).normalize(); cc.position.copy(m).add(V3(0, -0.25, 0)).addScaledVector(d, 0.9); cc.rotation.set(0, Math.atan2(cam.position.x - m.x, cam.position.z - m.z), 0); gripDot(s, 'hero', 'R'); } }
  else { cc.scale.setScalar(t >= 12 ? 1.25 : 1.6); cc.position.set(H.x + (t >= 12 ? 3.2 : 3.8), 0, H.z + (t >= 12 ? -2.0 : 0.6)); cc.rotation.set(0, Math.atan2(cam.position.x - cc.position.x, cam.position.z - cc.position.z), 0); }
  return p; }
// the three friends: hidden behind the kiosk, peek out on 'friends' (3.40), dash to the post (4.30-4.92), tie / throw / pour, laugh
const cnKBox = (() => { const [kx, kz, kw, kd, kh] = CN_KIOSK; return new THREE.Box3(V3(kx - kw / 2, 0, kz - kd / 2), V3(kx + kw / 2, kh, kz + kd / 2)); })();
function cnSeen(cam, p) { if (!p) return false; const d = p.clone().sub(cam.position), L = d.length(), hit = new THREE.Ray(cam.position, d.normalize()).intersectBox(cnKBox, V3(0, 0, 0)); if (hit && hit.distanceTo(cam.position) < L) return false; const hb = new THREE.Box3().setFromCenterAndSize(V3(CN_HERO.x, 6, CN_HERO.z), V3(3.6, 12, 0.6)), h2 = new THREE.Ray(cam.position, d).intersectBox(hb, V3(0, 0, 0)); return !h2 || h2.distanceTo(cam.position) > L - 0.8; }
const cnGrip = (s, who, nm) => { const h = c3ToonHandWorld(s.p[who], nm); if (cnSeen(s.cam, h)) gripDot(s, who, nm); };
function cnFriends(s, t) { const cam = s.cam, H = CN_HERO, inA = t < 12;
  for (const who of ['fRope', 'fBucket', 'fSpice']) { const hid = CN_HIDE[who], fr = CN_FR[who], j = { fRope: 0, fBucket: 1, fSpice: 2 }[who];
    let K;
    if (inA) K = [[0, hid[0], hid[1]], [3.40 + j * 0.06, hid[0], hid[1]], [3.62 + j * 0.06, hid[2], hid[1]], [4.28 + j * 0.03, hid[2], hid[1], 'lin'], [4.6, lerp(hid[2], fr.x, 0.45), -20.5, 'lin'], [4.92, fr.x, fr.z]];
    else if (who === 'fSpice') K = [[16, fr.x, fr.z], [19.62, fr.x, fr.z], [20.04, 2.4, -10.6], [21.2, 2.4, -10.6], [21.7, 0.2, -13.6]];
    else if (who === 'fBucket') K = [[16, fr.x, fr.z], [20.9, fr.x, fr.z], [21.75, 3.2, -16.5]];
    else K = [[16, fr.x, fr.z]];
    const P = cnPath(K, t), dash = inA && t >= 4.28 && t < 4.92, walking = P.moving && P.u < 1 && !(inA && t < 3.9);
    let o = { look: [H.x, H.z] }, hand = {};
    if (who === 'fRope') { o.expr = inA ? [[0, 'grin'], [3.4, 'excited'], [4.08, 'grin'], [4.96, 'determined'], [5.7, 'laugh']] : [[16, 'laugh'], [19.4, 'laugh'], [21.6, 'grin'], [24.82, 'laugh']];
      hand = inA ? (t < 4.96 ? { R: { h: [0.2, 0.55], pole: [1, 0.4], hand: 'grip' }, L: t < 4.28 ? 'wave' : 'rest' } : t < 6.0 ? { R: { h: [0.55, 0.42], pole: [1, 0.3], hand: 'grip' }, L: { h: [0.3, 0.45], pole: [1, 0.3], hand: 'grip' } } : { R: 'point', L: 'hip' })
        : { R: [[16, 'point'], [18.4, 'hip'], [19.4, 'point'], [21.0, 'hip'], [24.82, 'point']], L: [[16, 'hip'], [19.4, 'up'], [19.9, 'hip']] };
      o.lean = inA && t >= 4.96 && t < 6 ? -0.12 : 0; }
    if (who === 'fBucket') { const thr = !inA && t >= 19.28 && t < 19.7; o.expr = inA ? [[0, 'grin'], [3.4, 'excited'], [4.08, 'smug']] : [[16, 'smug'], [19.28, 'determined'], [19.42, 'laugh'], [21.6, 'grin'], [24.82, 'laugh']];
      hand = !inA && t >= 19.28 ? (t < 19.36 ? { R: { h: [0.5, 0.15], pole: [1, 0.6], hand: 'grip' }, L: { h: [0.3, 0.2], pole: [1, 0.6], hand: 'grip' } } : t < 19.7 ? { R: { h: [-0.35, 0.25], pole: [1, 0.8], front: true, hand: 'grip' }, L: { h: [-0.1, 0.3], pole: [1, 0.6], front: true, hand: 'grip' } } : { R: { h: [0.18, 0.6], pole: [1, 0.3], hand: 'grip' }, L: [[19.7, 'up'], [20.3, 'hip']] })
        : { R: { h: [0.18, 0.6], pole: [1, 0.3], hand: 'grip' }, L: inA && t < 4.28 ? 'wave' : 'hip' };
      o.lean = thr ? (t < 19.36 ? -0.14 : 0.16) : 0; }
    if (who === 'fSpice') { const pour = !inA && t >= 20.08 && t < 21.1; o.expr = inA ? [[0, 'grin'], [3.4, 'excited'], [4.08, 'grin'], [6.9, 'determined'], [7.14, 'laugh']] : [[16, 'grin'], [20.08, 'excited'], [21.1, 'laugh'], [22.72, 'grin'], [24.82, 'laugh']];
      const UP = { h: [0.22, -0.95], pole: [1, 0.6], hand: 'grip' }, CARRY = { h: [0.42, 0.42], pole: [1, 0.5], hand: 'grip' };
      const farR = toonLookFacing(cam, P.x, P.z, H.x - P.x, H.z - P.z) < 0; hand = pour ? { L: UP, R: UP } : inA && t >= 6.85 && t < 7.4 ? { R: CARRY, L: { h: [0.45, -0.45], pole: [1, 0.6], hand: 'open' } } : farR ? { R: CARRY, L: 'hip' } : { L: CARRY, R: 'hip' }; }
    o.hand = hand;
    if (walking || dash) Object.assign(o, { mode: 'walk', phase: (P.x + P.z) / 4.4, stride: dash ? 6 : 4.2, stop: clamp((P.u - 0.75) / 0.25), facing: toonLookFacing(cam, P.x, P.z, P.vx, P.vz) }), delete o.look;
    if (inA && t >= 3.4 && t < 4.28) o.lean = (o.lean || 0) + 0.12 * cnSnap(t, 3.4 + j * 0.06, 0.2);   // peeking: lean out
    o.squash = (inA && t >= 4.86 && t < 5.1 ? 0.2 * Math.sin(Math.PI * clamp((t - 4.86) / 0.24)) : 0);
    pose(s, who, t, P.x, P.z, o); }
  // props: rope coil (fRope, until the tie), bucket (fBucket), the KANEL sack (fSpice)
  const pR = s.p.fRope, pB = s.p.fBucket, pS = s.p.fSpice;
  s.coil.visible = false; if (inA && t < 4.96) { gripProp(s, s.coil, 'fRope', 'R', V3(0, 0.1, 0), { behind: -0.6, ry: 0 }); cnGrip(s, 'fRope', 'R'); }
  s.bucket.visible = true; { const thr = !inA && t >= 19.36 && t < 19.7, tip = !inA && t >= 19.3 ? (t < 19.36 ? -0.5 : t < 19.7 ? 1.9 * cnSnap(t, 19.36, 0.1) : 1.9 - 1.6 * cnSnap(t, 19.7, 0.3)) : 0;
    const yaw = Math.atan2(cam.position.x - pB.g.position.x, cam.position.z - pB.g.position.z); gripProp(s, s.bucket, 'fBucket', 'R', V3(0, 1.7, 0), { behind: -1.1, ry: yaw, rz: tip * (cam.position.x > pB.g.position.x ? 1 : -1) }); cnGrip(s, 'fBucket', 'R');
    s.bucketWater.visible = inA || t < 19.38; if (inA && t < 4.3 && !cnSeen(cam, s.bucket.position.clone().add(V3(0, 1, 0)))) s.bucket.visible = false; }
  { const pour = !inA && t >= 20.08 && t < 21.1, hL = c3ToonHandWorld(pS, 'L'), hR = c3ToonHandWorld(pS, 'R'), far = hL && hR && hL.distanceTo(H) > hR.distanceTo(H) ? 'L' : 'R', a = pour ? hL : far === 'L' ? hL : hR, b = pour ? hR : a, sk = s.sack; sk.visible = !!(a && b); if (a && b) { const m = a.clone().add(b).multiplyScalar(0.5), d = cam.position.clone().sub(m).normalize(), yaw = Math.atan2(cam.position.x - m.x, cam.position.z - m.z) + Math.PI;
      if (pour) { const tw = cnSnap(t, 20.08, 0.25) * (t > 20.95 ? 1 - cnSnap(t, 20.95, 0.15) : 1), L = 3.8 * 0.85, mouth = V3(H.x - 0.4, 11.2, H.z + 0.8), ax = mouth.clone().sub(m).normalize(), up = V3(0, 1, 0);
        const q0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)), q1 = new THREE.Quaternion().setFromUnitVectors(up, ax).multiply(q0); sk.quaternion.copy(q0).slerp(q1, tw);
        const axis = up.clone().applyQuaternion(sk.quaternion); sk.position.copy(m).addScaledVector(axis, -L * 0.12).addScaledVector(d, -0.9); }
      else { sk.rotation.set(0, yaw, 0); sk.position.copy(m).add(V3(0, -3.3, 0)).addScaledVector(d, 2.0); }
      if (pour) { cnGrip(s, 'fSpice', 'L'); cnGrip(s, 'fSpice', 'R'); } else cnGrip(s, 'fSpice', far); sk.scale.setScalar(pour ? 0.85 : 1.15);
      if (inA && t < 4.3 && !cnSeen(cam, sk.position.clone().add(V3(0, 2, 0)))) sk.visible = false; } }
}
// the stranger: walks in from the right along the quay (21.30-22.34), stops, sniffs (22.72), talks deadpan, smug on 'huh' (25.40)
function cnStranger(s, t) { if (t < 20.9 || t > 26.5) return; const cam = s.cam, K = [[20.9, 20.6, -3.4, 'lin'], [22.34, 16, -4.5]], P = cnPath(K, t), walking = t < 22.34;
  const o = { expr: [[21.2, 'neutral'], [22.72, 'skeptical'], [23.2, 'neutral'], [23.66, 'deadpan'], [25.4, 'smug']], hand: { L: 'pocket', R: t < 23.66 ? (t >= 22.72 && t < 23.2 ? 'chin' : 'pocket') : [[23.66, 'talk'], [24.6, 'pocket'], [25.4, 'talkIn']] },
    talk: (t >= 23.66 && t < 24.4) || (t >= 24.54 && t < 25.68) ? 0.7 : 0, tilt: t >= 22.72 && t < 23.2 ? -0.12 : 0, gaze: t >= 22.72 && t < 23.2 ? [-0.3, -0.6] : undefined, look: [CN_HERO.x, CN_HERO.z] };
  if (walking) Object.assign(o, { mode: 'walk', phase: (20.6 - P.x) / 4.2, stride: 4.2, stop: clamp((t - 21.95) / 0.39), facing: toonLookFacing(cam, P.x, P.z, P.vx, P.vz) }), delete o.look;
  pose(s, 'stranger', t, P.x, P.z, o); }
// ---- FX: rope, puffs, pour stream, splash, drops, scent wisps
function cnRope(s, t) { const tied = CN_TIED(t), p = s.p.hero; s.rings.forEach((r) => { r.visible = false; }); s.knot.visible = false; s.ropeEnd.visible = false;
  p.cnRope = tied ? [0, 1, 2].map((i) => t < 12 ? cnSnap(t, 4.96 + i * 0.04, 0.16) : 1) : null; p.cnEndOut = tied && t >= 5.0 && t < 6.0; }
// after the hero's pose: the rope end from the knot (card point -> world) to fRope's hand while he pulls it tight (5.0-6.0)
function cnRopeEnd(s, t) { const p = s.p.hero; if (!p.cnEndOut || !p.cnKnot) return; const kp = p.root.localToWorld(V3((p.cnKnot[0] - 300) * p.U, (975 - p.cnKnot[1]) * p.U, 0.06)), end = c3ToonHandWorld(s.p.fRope, 'R'); if (!end) return;
  const d = end.clone().sub(kp); s.ropeEnd.visible = true; s.ropeEnd.position.copy(kp).addScaledVector(d, 0.5); s.ropeEnd.scale.set(0.85, d.length(), 0.85); s.ropeEnd.quaternion.setFromUnitVectors(V3(0, 1, 0), d.clone().normalize()); }
const cnHeadTop = (cam) => { const tc = cam.position.clone().sub(CN_HERO).setY(0).normalize(); return V3(CN_HERO.x, 11.6, CN_HERO.z).addScaledVector(tc, -0.5); };
function cnFX(s, t) { const cam = s.cam, H = CN_HERO, R = RNG('cnfx'), hp = (u) => V3(H.x, u, H.z + 0.6);
  [...s.puffs, ...s.stream, s.splash, s.blob, ...s.drops, ...s.wisps].forEach((m) => { m.visible = false; });
  // cinnamon clouds: the toss in c03 (7.14) and the pour in c06 (20.3-21.5)
  const cloud = (t0, dur, n, rad, y0, op) => { for (let i = 0; i < n; i++) { const m = s.puffs[i], a = (t - t0 - i * 0.02) / dur; if (a < 0 || a > 1) continue; const ang = i * 2.39996, r = rad * (0.75 + 0.5 * EZ.o3(a * 1.6));
      const front = i % 4 === 0, tc = cam.position.clone().sub(H).setY(0).normalize(), ctr = V3(H.x, 0, H.z).addScaledVector(tc, front ? 1.4 : -1.0);
      popAt(m, 1, [ctr.x + Math.cos(ang) * r * tc.z, (front ? y0 - 3.2 : y0) + Math.sin(ang * 1.3) * rad * 0.5 + a * 1.5, ctr.z - Math.cos(ang) * r * tc.x], cam, (1.4 + 2.0 * EZ.o3(a)) * (0.8 + 0.25 * ((i * 7) % 3))); m.material.opacity = op * (a < 0.15 ? a / 0.15 : 1 - EZ.i2((a - 0.15) / 0.85)); } };
  if (t >= 7.14 && t < 8) cloud(7.14, 0.85, 9, 3.0, 8.5, 0.75);
  if (t >= 20.25 && t < 21.8) cloud(20.25, 1.4, 14, 3.4, 7.5, 0.72);
  // the toss stream c03 (6.92-7.14) from fSpice's sack to the hero; the pour c06 (20.1-21.0) from the sack mouth down onto him
  if (t >= 6.9 && t < 7.2) { const sp = s.sack.localToWorld(V3(0, 3.6, 0)); for (let i = 0; i < 8; i++) { const u = clamp((t - 6.9) / 0.24 - i * 0.08); if (u <= 0 || u >= 1) continue; const p = sp.clone().lerp(cnHeadTop(cam), u).add(V3(0, 3 * u * (1 - u), 0)); popAt(s.stream[i], 1, p.toArray(), cam, 0.9 + u * 0.6); s.stream[i].material.opacity = 0.9; } }
  if (t >= 20.1 && t < 21.05) { s.sack.updateMatrixWorld(true); const sp = s.sack.localToWorld(V3(0, 3.7, 0)); for (let i = 0; i < 12; i++) { const u = ((t - 20.1) * 2.6 + i / 12) % 1, p = sp.clone().lerp(cnHeadTop(cam), u).add(V3(Math.sin(i * 1.7) * 0.25 * u, 0, 0));
      popAt(s.stream[i], 1, p.toArray(), cam, 0.7 + u * 0.9); s.stream[i].material.opacity = 0.9; } }
  // water: the blob flies 19.34-19.42, the splash bursts on him 19.40-19.8, droplets fly out, then drips fall
  if (t >= 19.32 && t < 19.42) { const a = c3ToonHandWorld(s.p.fBucket, 'R') || V3(11, 6, -6.6), u = (t - 19.32) / 0.1; popAt(s.blob, 1, a.clone().lerp(hp(7), u).add(V3(0, 1.2 * u * (1 - u), 0.5)).toArray(), cam, 1.6 + u * 0.8); s.blob.material.opacity = 1; }
  if (t >= 19.4 && t < 19.85) { const u = (t - 19.4) / 0.45; popAt(s.splash, 1, hp(5.4).add(V3(0, 0, 0.8)).toArray(), cam, 2.2 + 2.8 * EZ.o3(u)); s.splash.material.opacity = 1 - EZ.i2(u);
    s.drops.forEach((m, i) => { const ang = i / 14 * TAU, v = 6 + (i % 4) * 1.8, p = hp(7.2).add(V3(Math.cos(ang) * v * u * 0.6, Math.sin(ang) * v * u * 0.5 - 14 * u * u, 1)); popAt(m, 1, p.toArray(), cam, 1.0); m.material.opacity = 1; }); }
  if (t >= 19.85 && t < 25.7) s.drops.forEach((m, i) => { if (i > 5) return; const per = 0.7 + (i % 3) * 0.18, u = ((t - 19.85 + i * 0.29) % per) / per; popAt(m, 1, [H.x - 1.5 + i * 0.6, 4.2 - 4.0 * u * u - (i % 2), H.z + 0.7], cam, 0.9); m.material.opacity = 1 - u * 0.4; });
  // scent wisps from the hero to the stranger's nose (22.5-23.4)
  if (t >= 22.45 && t < 23.45) { const st = s.p.stranger, nose = st.g.position.clone().add(V3(0, 10, 0)); s.wisps.forEach((m, i) => { const u = ((t - 22.45) * 1.4 + i / 4) % 1, p = hp(9).lerp(nose, u).add(V3(0, Math.sin(u * 9 + i) * 0.6, 0.4));
      popAt(m, 1, p.toArray(), cam, 1 + u * 0.4); m.material.opacity = Math.sin(Math.PI * u) * 0.95; }); }
}
// ---- the frame
function cnFrame(t) { const s = CN_get(); hideAll(s); hideGrips(s);
  const cam = seqCam(s, 'canal', t);
  s.waterTex.offset.set(t * 0.012, Math.sin(t * 0.6) * 0.01);
  s.flagMeshes.forEach((f, j) => { const P = f.geometry.attributes.position, b = f.userData.base, w = b[3 * (P.count - 1)] || 7; for (let i = 0; i < P.count; i++) { const px = b[i * 3], k = px / w; P.setZ(i, Math.sin(px * 0.8 - t * 6 + j) * 0.55 * k + Math.sin(b[i * 3 + 1] * 0.5 - t * 3.4) * 0.2 * k); } P.needsUpdate = true; f.geometry.computeVertexNormals(); });
  // the gable clock: 6:20, the minute hand jumps to 6:30 on 'later' (16.90) with a little overshoot
  { const j = t < 16.9 ? 0 : cnSnap(t, 16.9, 0.22), ov = t >= 16.9 && t < 17.4 ? 0.06 * Math.sin((t - 16.9) * 30) * Math.exp(-(t - 16.9) * 9) : 0, mins = (t < 12 ? 12 : 20) + 10 * j, hrs = 6 + mins / 60;
    s.clockHands[0].rotation.z = -(hrs / 12) * TAU; s.clockHands[1].rotation.z = -(mins / 60) * TAU - ov; }
  const look = c3CamAt(CAMSEQ.canal, t).l; cnShadowAt(s, look[0], look[2]);
  cnRope(s, t); cnHero(s, t); cnFriends(s, t); cnStranger(s, t); cnRopeEnd(s, t); cnFX(s, t);
  const blur = c3Knots([[0, 0.6], [1.6, 1.2], [3.4, 2.0], [4.6, 2.2], [5.4, 1.6], [16.6, 0.8], [18.0, 1.5], [19.6, 2.0], [21.3, 1.5], [22.7, 2.0], [23.4, 1.2], [24.3, 2.0], [25.4, 1.4]], t);
  c3Render(s.scene, cam, { bg: '#8ab4ec', bgBlur: blur, glow: 0.25, glowBlur: 12 });
}
for (const id of ['c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'c07', 'c08']) { SHOT_FN[id] = (t) => cnFrame(t); SNAPS[id] = 'free'; }

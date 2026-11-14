// =====================================================================
//  SET square — a Copenhagen town square at golden hour (36.14–49.76 s, d01–d05) and the same square at DUSK, empty
//  (56.76–60.50 s, d06, the ending). Back row (fronts at z = SQ_ZB, facing +z): Danish row houses with stepped / curved
//  Dutch / plain gables and eave roofs with dormers, copper-green and tile roofs, the BAGERI bakery (giant 3D kanelsnegl
//  sign over its door), a brick clock tower with a copper spire behind the two posts, the CAFÉ with parasols. Side rows at
//  x = ±SQ_XS, a near row at z = SQ_ZN. Dannebrog bunting strung across, flags on poles and on facade staffs, bikes,
//  benches, planters, lime trees. THE two cast-iron lampposts: post 1 (the hero) at SQ_P1, post 2 (the 30-year-old) at SQ_P2.
//  ONE continuous take per time range: camera = seqCam(s, 'square', t) (CAMSEQ.square). Prefix SQ.
//  Registers d01 d02 d03 d04 d05 d06.
// =====================================================================
const SQ = {};
const SQ_ZB = -62, SQ_XS = 70, SQ_ZN = 70;            // back-row front, side-row fronts, near-row front
const SQ_P1 = V3(-5, 0, -14), SQ_P2 = V3(5, 0, -14);  // post 1 (hero), post 2 (the 30-year-old)
const SQ_GR = V3(13.2, 0, -11.4);                     // where the pepper grinder stops
const SQ_DUSK = (t) => t > 52;
Object.assign(CAST, {   // the crowd (d04): combos not used in this piece or the earlier ones
  sqA: { key: 'sqA', hair: 'topknot2', hairColor: 'black', outfit: 'polo', colors: { main: '#e86a2a' }, skin: 'brown', body: 'short' },
  sqB: { key: 'sqB', hair: 'ponytail2', hairColor: 'chestnut', outfit: 'hoodie', colors: { main: '#2fa8a0', cord: '#ffffff' }, skin: 'peach', body: 'thin' },
  sqC: { key: 'sqC', hair: 'curly', hairColor: 'black', outfit: 'shirt', colors: { main: '#f2c23a' }, skin: 'brown', body: 'fat' },
  sqD: { key: 'sqD', hair: 'side', hairColor: 'auburn', outfit: 'vest', colors: { main: '#8a4aa8', shirt: '#f6f0e4' }, skin: 'pale', body: 'tall' },
  sqE: { key: 'sqE', hair: 'tuft', hairColor: 'grey', moustache: true, outfit: 'sweater', colors: { main: '#c8402e' }, skin: 'peach', body: 'avg' },
});
const sqAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const sqRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
const sqSnap = (t, t0, d = 0.33) => { const x = clamp((t - t0) / d); return 1 - (1 - x) ** 3; };   // Ricks snap: fast, settled, no bounce
const sqKN = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], EZ.io((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); return K[K.length - 1][1]; };
const sqAlpha = (m) => { m.alphaTest = 0.5; m.side = THREE.DoubleSide; return m; };
const sqBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const sqCyl = (r0, r1, h, mat, x, y, z, seg = 16, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.position.set(x, y, z); return m; };
const sqSph = (r, mat, x, y, z, ws = 16, hs = 10) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat); m.position.set(x, y, z); return m; };
function sqTube(a, b, r, mat, seg = 8) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
function sqExt(shape, depth, mat) { return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 14 }), mat); }
// ---- bake: merge static props per material into vertex-coloured meshes (from trash-library stBake)
function sqBake(root, o = {}) { root.updateMatrixWorld(true); const Bk = new Map(), v = new THREE.Vector3(), keep = [];
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
      for (let i = 0; i < p.count; i++, k++) { const y = p.getY(i), ao = o.ao === false ? 1 : 0.72 + 0.28 * clamp(y / 3);
        P[k * 3] = p.getX(i); P[k * 3 + 1] = y; P[k * 3 + 2] = p.getZ(i); N[k * 3] = q.getX(i); N[k * 3 + 1] = q.getY(i); N[k * 3 + 2] = q.getZ(i);
        Cc[k * 3] = c.r * ao; Cc[k * 3 + 1] = c.g * ao; Cc[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(Cc, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
    const mat = c3Prop('#ffffff', { rough: mt.roughness ?? 0.8, metal: mt.metalness ?? 0, env: mt.envMapIntensity ?? 1, map: mt.map || null }); mat.vertexColors = true; mat.side = mt.side;
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; }
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast) mesh.userData.noCast = true; out.add(mesh); }
  return out; }

// ---- textures
function sqTexCobble() { const t = tex((g, w, h) => { const R = RNG('sqcob'); g.fillStyle = '#8a7e74'; g.fillRect(0, 0, w, h); const n = 16, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n + 1; i++) { const x = (i + (j % 2) * 0.5) * s, y = j * s, c = R.r(0.82, 1.08), hue = R.f() < 0.25 ? [176, 150, 128] : R.f() < 0.5 ? [150, 146, 150] : [168, 158, 146];
    g.fillStyle = `rgb(${hue[0] * c | 0},${hue[1] * c | 0},${hue[2] * c | 0})`; g.beginPath(); g.roundRect(x - s / 2 + 2, y + 2, s - 4, s - 4, 6); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x - s / 2 + 5, y + 4, s - 12, 3); } }, 512, 512); return sqRep(t, 26, 26); }
function sqTexSlabs() { const t = tex((g, w, h) => { const R = RNG('sqslab'); g.fillStyle = '#b8aa98'; g.fillRect(0, 0, w, h); const n = 6;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const c = R.r(0.92, 1.06); g.fillStyle = `rgb(${212 * c | 0},${200 * c | 0},${182 * c | 0})`; g.fillRect(i * w / n + 3, j * h / n + 3, w / n - 6, h / n - 6); } }, 256, 256); return sqRep(t, 1, 1); }
function sqTexFlag() { return tex((g, w, h) => { g.fillStyle = '#c8102e'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(w * 0.353, 0, w * 0.118, h); g.fillRect(0, h * 0.43, w, h * 0.143); }, 256, 192); }
// a row-house facade: plaster with grain, floor bands, framed windows with white crosses, curtains, flower boxes; the ground
// floor = a door with flanking windows, a shop display, the bakery or the cafe. Ground floor 16, floors 12, top band 2.
function sqTexFacade(o) { const Hw = 16 + 12 * o.floors + 2, cw = 512, ch = Math.min(1024, Math.max(384, Math.round(512 * Hw / o.w)));
  return tex((g, w, h) => { const R = RNG('sqfac', o.seed), sx = w / o.w, sy = h / Hw, X = (x) => x * sx, Y = (y) => h - y * sy;
    g.fillStyle = o.wall; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.045)' : 'rgba(255,255,255,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 4), R.r(1, 3)); }
    if (o.quoin) { g.fillStyle = 'rgba(255,248,232,0.55)'; for (let y = 0; y < Hw; y += 2.4) for (const x of [0, o.w - 1.6]) g.fillRect(X(x + ((y / 2.4) % 2 ? 0 : 0.3)), Y(y + 2), X(1.3), 2.0 * sy); }
    g.fillStyle = 'rgba(255,250,236,0.9)'; for (let f = 0; f <= o.floors; f++) g.fillRect(0, Y(16 + f * 12) - 0.25 * sy, w, 0.55 * sy);
    const bw = o.w / o.bays, frame = '#fbf6ea', glass = (x, y, ww, hh) => { const gr = g.createLinearGradient(x, y, x + ww, y + hh); gr.addColorStop(0, '#2c4a6e'); gr.addColorStop(0.55, '#4f7398'); gr.addColorStop(1, '#2a4262'); g.fillStyle = gr; g.fillRect(x, y, ww, hh);
      g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.moveTo(x + ww * 0.15, y + hh); g.lineTo(x + ww * 0.55, y); g.lineTo(x + ww * 0.75, y); g.lineTo(x + ww * 0.35, y + hh); g.fill(); };
    const win = (cx, y0, ww, hh, box) => { const x = X(cx - ww / 2), y = Y(y0 + hh), W2 = X(ww), H2 = hh * sy, fr = 0.38 * sx;
      if (o.ped) { g.fillStyle = o.trim; g.beginPath(); g.moveTo(x - fr * 2, y - fr); g.lineTo(x + W2 / 2, y - 1.4 * sy); g.lineTo(x + W2 + fr * 2, y - fr); g.fill(); }
      g.fillStyle = frame; g.fillRect(x - fr, y - fr, W2 + fr * 2, H2 + fr * 2); glass(x, y, W2, H2);
      if (R.f() < 0.6) { g.fillStyle = 'rgba(250,246,236,0.85)'; g.fillRect(x, y, W2 * 0.22, H2); g.fillRect(x + W2 * 0.78, y, W2 * 0.22, H2); }
      g.fillStyle = frame; g.fillRect(x + W2 / 2 - fr / 2, y, fr, H2); g.fillRect(x, y + H2 * 0.38, W2, fr);
      if (box) { g.fillStyle = '#3f6a3a'; g.fillRect(x - fr, y + H2 + fr, W2 + fr * 2, 1.1 * sy); for (let k = 0; k < 9; k++) { g.fillStyle = k % 3 === 0 ? '#ffffff' : k % 3 === 1 ? '#e8283a' : '#4f9a40'; g.beginPath(); g.arc(x + (k + 0.5) * W2 / 9, y + H2 + fr, 0.42 * sx, 0, TAU); g.fill(); } } };
    for (let f = 0; f < o.floors; f++) for (let b = 0; b < o.bays; b++) { if (o.skip && f === 0 && b === Math.floor(o.bays / 2)) continue; win((b + 0.5) * bw, 16 + f * 12 + 2.6, Math.min(4.2, bw * 0.5), 7, R.f() < 0.4); }
    // ground floor
    const gf = o.ground, door = (cx, col) => { const dw = 4.4, dh = 11.5, x = X(cx - dw / 2), y = Y(dh); g.fillStyle = frame; g.fillRect(x - 0.4 * sx, y - 0.4 * sy, X(dw) + 0.8 * sx, dh * sy + 0.4 * sy);
      g.fillStyle = col; g.fillRect(x, y + 2.2 * sy, X(dw), (dh - 2.2) * sy); glass(x + 0.3 * sx, y + 0.3 * sy, X(dw) - 0.6 * sx, 1.6 * sy);
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + X(dw) * 0.12, y + 3.2 * sy, X(dw) * 0.32, (dh - 4.4) * sy); g.fillRect(x + X(dw) * 0.56, y + 3.2 * sy, X(dw) * 0.32, (dh - 4.4) * sy);
      g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(x + X(dw) * 0.82, y + dh * sy * 0.6, 0.3 * sx, 0, TAU); g.fill(); };
    const shop = (x0, x1, kind) => { const x = X(x0), y = Y(12.5), ww = X(x1 - x0), hh = 9.5 * sy; g.fillStyle = frame; g.fillRect(x - 0.5 * sx, y - 0.5 * sy, ww + sx, hh + sy); glass(x, y, ww, hh);
      if (kind === 'bakery') { g.fillStyle = '#f2e2c4'; g.fillRect(x, y + hh * 0.62, ww, hh * 0.06); g.fillRect(x, y + hh * 0.9, ww, hh * 0.1);
        for (let k = 0; k < 7; k++) { const px = x + (k + 0.5) * ww / 7; g.fillStyle = '#c47a34'; g.beginPath(); g.arc(px, y + hh * 0.55, 0.9 * sx, 0, TAU); g.fill(); g.strokeStyle = '#7a3e14'; g.lineWidth = 3; g.beginPath(); g.arc(px, y + hh * 0.55, 0.5 * sx, 0, 4.6); g.stroke();
          g.fillStyle = '#e0a050'; g.beginPath(); g.ellipse(px, y + hh * 0.84, 1.2 * sx, 0.55 * sy, 0, 0, TAU); g.fill(); } }
      else if (kind === 'cafe') { g.fillStyle = 'rgba(255,214,150,0.55)'; g.fillRect(x, y, ww, hh); g.fillStyle = '#3a2a24'; for (let k = 0; k < 3; k++) { const px = x + (k + 0.5) * ww / 3; g.fillRect(px - 1.2 * sx, y + hh * 0.7, 2.4 * sx, 0.4 * sy); g.fillRect(px - 0.15 * sx, y + hh * 0.7, 0.3 * sx, hh * 0.3); } }
      else { const C = ['#e84a3a', '#f2c23a', '#3a9a5a', '#2f6fb8', '#f4f0e6']; for (let k = 0; k < 6; k++) { g.fillStyle = C[(k + o.seed) % 5]; g.fillRect(x + (k + 0.2) * ww / 6, y + hh * 0.55, ww / 8, hh * 0.45); } }
      g.fillStyle = frame; for (let k = 1; k < 3; k++) g.fillRect(x + k * ww / 3 - 0.2 * sx, y, 0.4 * sx, hh); };
    if (gf === 'door') { door(o.w / 2, ['#2a5a3a', '#1f3f7a', '#8a2a2a', '#2a4a5a'][o.seed % 4]); for (const s of [-1, 1]) if (o.w > 16) win(o.w / 2 + s * o.w * 0.3, 4.5, Math.min(4.2, o.w * 0.16), 7.5, false); }
    else { door(o.w / 2, gf === 'cafe' ? '#1f3f6a' : gf === 'bakery' ? '#6a2a1a' : '#2a3a4a'); shop(1.2, o.w / 2 - 3.2, gf); shop(o.w / 2 + 3.2, o.w - 1.2, gf); }
    g.fillStyle = 'rgba(40,30,30,0.25)'; g.fillRect(0, Y(1.2), w, 1.2 * sy); }, cw, ch); }
// the facade's night mask (same window layout as sqTexFacade): ~60 % of the windows lit warm, everything else black
function sqTexNight(o) { const Hw = 16 + 12 * o.floors + 2, ch = Math.min(1024, Math.max(384, Math.round(512 * Hw / o.w)));
  return tex((g, w, h) => { const R = RNG('sqnight', o.seed), sx = w / o.w, sy = h / Hw, X = (x) => x * sx, Y = (y) => h - y * sy, bw = o.w / o.bays; g.fillStyle = '#000000'; g.fillRect(0, 0, w, h);
    const lit = (x0, y0, ww, hh) => { const gr = g.createLinearGradient(0, Y(y0 + hh), 0, Y(y0)); gr.addColorStop(0, R.f() < 0.5 ? '#ffc070' : '#ffd890'); gr.addColorStop(1, '#e88a3a'); g.fillStyle = gr; g.fillRect(X(x0), Y(y0 + hh), X(ww), hh * sy); };
    for (let f = 0; f < o.floors; f++) for (let b = 0; b < o.bays; b++) { if (o.skip && f === 0 && b === Math.floor(o.bays / 2)) continue; const ww = Math.min(4.2, bw * 0.5); if (R.f() < 0.62) lit((b + 0.5) * bw - ww / 2, 16 + f * 12 + 2.6, ww, 7); }
    if (o.ground !== 'door') { lit(1.2, 3, o.w / 2 - 4.4, 9.5); lit(o.w / 2 + 3.2, 3, o.w / 2 - 4.4, 9.5); } else if (R.f() < 0.5) lit(o.w / 2 - 2, 9.8, 4, 1.6); }, 512, ch); }
function sqTexAttic(round) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#fbf6ea'; g.beginPath(); if (round) g.arc(w / 2, h / 2, w * 0.48, 0, TAU); else { g.moveTo(w * 0.04, h); g.lineTo(w * 0.04, h * 0.45); g.arc(w / 2, h * 0.45, w * 0.46, Math.PI, 0); g.lineTo(w * 0.96, h); } g.fill();
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2c4a6e'); gr.addColorStop(1, '#55799e'); g.fillStyle = gr; g.beginPath(); if (round) g.arc(w / 2, h / 2, w * 0.38, 0, TAU); else { g.moveTo(w * 0.14, h * 0.94); g.lineTo(w * 0.14, h * 0.45); g.arc(w / 2, h * 0.45, w * 0.36, Math.PI, 0); g.lineTo(w * 0.86, h * 0.94); } g.fill();
  g.fillStyle = '#fbf6ea'; g.fillRect(w * 0.47, 0, w * 0.06, h); g.fillRect(0, h * 0.5, w, h * 0.05); }, 128, 160); }
function sqTexClockFace() { return tex((g, w, h) => { const c = w / 2; g.fillStyle = '#f6efd8'; g.beginPath(); g.arc(c, c, c - 4, 0, TAU); g.fill(); g.lineWidth = 12; g.strokeStyle = '#2a2a3a'; g.stroke();
  g.fillStyle = '#2a2a3a'; g.font = `700 ${w * 0.1}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; ['XII', 'III', 'VI', 'IX'].forEach((s, i) => { const a = i * Math.PI / 2 - Math.PI / 2; g.fillText(s, c + Math.cos(a) * c * 0.72, c + Math.sin(a) * c * 0.72); });
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.fillRect(c + Math.cos(a) * c * 0.86 - 2, c + Math.sin(a) * c * 0.86 - 2, i % 5 ? 3 : 7, i % 5 ? 3 : 7); }
  g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(c, c); g.lineTo(c + c * 0.3, c + c * 0.18); g.stroke(); g.lineWidth = 7; g.beginPath(); g.moveTo(c, c); g.lineTo(c - c * 0.1, c - c * 0.6); g.stroke(); }, 256, 256); }
function sqTexBrick(base) { const t = tex((g, w, h) => { const R = RNG('sqbr', base); g.fillStyle = '#e8d8c0'; g.fillRect(0, 0, w, h); const bh = 16, bw = 44;
  for (let j = 0; j < h / bh; j++) for (let i = -1; i < w / bw + 1; i++) { const c = new THREE.Color(base).multiplyScalar(R.r(0.85, 1.1)); g.fillStyle = '#' + c.getHexString(); g.fillRect(i * bw + (j % 2) * bw / 2 + 2, j * bh + 2, bw - 4, bh - 4); } }, 256, 256); return t; }
function sqTexSign(txt, bg, fg, w = 512, h = 128) { return tex((g, ww, hh) => { g.fillStyle = '#2a1a12'; g.fillRect(0, 0, ww, hh); g.fillStyle = bg; g.fillRect(8, 8, ww - 16, hh - 16); g.strokeStyle = '#e8c04a'; g.lineWidth = 5; g.strokeRect(16, 16, ww - 32, hh - 32);
  inked(g, txt, ww / 2, hh / 2 + 2, hh * 0.52, fg, { stroke: '#2a1208', sw: hh * 0.05, maxW: ww * 0.84, font: 'Georgia, serif' }); }, w, h); }
// the kanelsnegl: dough spiral, sugar glaze drizzle, cinnamon specks (cap); layered dough bands (side)
function sqTexRollCap() { return tex((g, w, h) => { const c = w / 2, R = RNG('sqroll'); g.fillStyle = '#b8682c'; g.beginPath(); g.arc(c, c, c, 0, TAU); g.fill();
  g.lineCap = 'round'; for (const [lw, col, off] of [[30, '#dc9450', 0], [14, '#6a3010', 0.5]]) { g.lineWidth = lw; g.strokeStyle = col; g.beginPath(); for (let a = 0; a < 7.6 * Math.PI; a += 0.05) { const r = c * 0.06 + (a + off * 2) * c * 0.037; g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r); } g.stroke(); }
  for (let i = 0; i < 500; i++) { const a = R.f() * TAU, r = Math.sqrt(R.f()) * c * 0.92; g.fillStyle = R.f() < 0.5 ? 'rgba(110,50,16,0.5)' : 'rgba(255,230,180,0.35)'; g.fillRect(c + Math.cos(a) * r, c + Math.sin(a) * r, 3, 3); }
  g.strokeStyle = '#fff8ec'; g.lineWidth = 11; g.beginPath(); for (let k = 0; k < 9; k++) { const y = c * 0.35 + k * c * 0.16, x0 = c - Math.sqrt(Math.max(0, (c * 0.86) ** 2 - (y - c) ** 2)), x1 = 2 * c - x0; g.moveTo(x0, y); g.bezierCurveTo(lerp(x0, x1, 0.33), y - 18, lerp(x0, x1, 0.66), y + 26, x1, y + 4); } g.stroke(); }, 512, 512); }
function sqTexRollSide() { const t = tex((g, w, h) => { g.fillStyle = '#c47a34'; g.fillRect(0, 0, w, h); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#e2a058' : '#9a5222'; g.fillRect(0, k * h / 6 + h / 24, w, h / 14); } }, 256, 64); return sqRep(t, 4, 1); }
function sqTexPeber() { return tex((g, w, h) => { g.fillStyle = '#f4ead2'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8102e'; g.fillRect(0, 0, w, h * 0.12); g.fillRect(0, h * 0.88, w, h * 0.12);
  for (const cx of [0.25, 0.75]) inked(g, 'PEBER', w * cx, h * 0.52, h * 0.5, '#2a1a14', { stroke: false, maxW: w * 0.4, font: 'Georgia, serif' }); }, 1024, 160); }
function sqTexKanel() { return tex((g, w, h) => { g.fillStyle = '#c8803a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f6ecd6'; g.fillRect(0, h * 0.25, w, h * 0.5); inked(g, 'KANEL', w * 0.25, h * 0.5, h * 0.36, '#7a3410', { stroke: false, maxW: w * 0.4 }); inked(g, 'KANEL', w * 0.75, h * 0.5, h * 0.36, '#7a3410', { stroke: false, maxW: w * 0.4 }); }, 512, 128); }
// the cardboard sign hung on the chest: string V on top, marker number; dark speckles for the pepper version
function sqTexChestSign(num, pepper) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#6a4a2a'; g.lineWidth = 6; g.beginPath(); g.moveTo(w * 0.2, h * 0.38); g.lineTo(w / 2, h * 0.02); g.lineTo(w * 0.8, h * 0.38); g.stroke();
  g.fillStyle = '#c8995a'; g.beginPath(); g.roundRect(w * 0.04, h * 0.34, w * 0.92, h * 0.62, 10); g.fill(); g.strokeStyle = '#9a6a34'; g.lineWidth = 6; g.stroke();
  g.fillStyle = 'rgba(120,80,40,0.25)'; for (let i = 0; i < 5; i++) g.fillRect(w * 0.08, h * (0.42 + i * 0.1), w * 0.84, 3);
  for (const x of [0.2, 0.8]) { g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(w * x, h * 0.4, 7, 0, TAU); g.fill(); }
  inked(g, num, w / 2, h * 0.66, h * 0.4, num === '30' ? '#1a1a2a' : '#c8202a', { stroke: false, maxW: w * 0.8 });
  if (pepper) { const R = RNG('sqpep', 3); for (let i = 0; i < 420; i++) { g.fillStyle = R.f() < 0.6 ? 'rgba(40,34,34,0.75)' : 'rgba(90,82,80,0.6)'; g.beginPath(); g.arc(R.r(w * 0.06, w * 0.94), R.r(h * 0.36, h * 0.95), R.r(1.2, 3.2), 0, TAU); g.fill(); } } }, 256, 320); }
// a soft cartoon puff (white; tinted by the material colour): lit top, darker belly, lumpy edge
function sqTexPuff() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('sqpuff');
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = w * R.r(0.15, 0.22), x = w / 2 + Math.cos(a) * w * 0.17, y = h / 2 + Math.sin(a) * h * 0.15; const gr = g.createRadialGradient(x, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.7, 'rgba(225,225,225,0.85)'); gr.addColorStop(1, 'rgba(200,200,200,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  const gr = g.createRadialGradient(w / 2, h * 0.42, 0, w / 2, h / 2, w * 0.3); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.8, 'rgba(215,215,215,0.9)'); gr.addColorStop(1, 'rgba(200,200,200,0)'); g.fillStyle = gr; g.beginPath(); g.arc(w / 2, h / 2, w * 0.3, 0, TAU); g.fill(); }, 128, 128); }
function sqTexWisp() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.lineCap = 'round'; for (const [lw, a] of [[16, 0.25], [8, 0.9]]) { g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = lw; g.beginPath(); for (let y = h * 0.95; y > h * 0.05; y -= 4) g.lineTo(w / 2 + Math.sin(y / h * 3.2 * Math.PI) * w * 0.28 * (y / h), y); g.stroke(); } }, 64, 256); }
function sqTexGlint() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const c = w / 2, gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,250,230,0.8)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; for (const a of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) { const L = a % (Math.PI / 2) ? 0.55 : 1; g.save(); g.translate(c, c); g.rotate(a); g.beginPath(); g.moveTo(-c * L, 0); g.quadraticCurveTo(0, -5, c * L, 0); g.quadraticCurveTo(0, 5, -c * L, 0); g.fill(); g.restore(); } }, 256, 256); }
function sqTexStripes(a, b, n = 12) { return tex((g, w, h) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n + 1, h); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h * 0.82, w, h * 0.18); }, 256, 64); }

// ---- props
// the cast-iron lamppost (Copenhagen kandelaber): fluted base, column with collars, ladder bar, a hexagonal lantern
function sqLampPost(M, glassMat) { const g = new THREE.Group();
  g.add(sqCyl(1.25, 1.45, 0.6, M.iron, 0, 0.3, 0, 12)); g.add(sqCyl(0.9, 1.15, 2.6, M.iron, 0, 1.9, 0, 12)); g.add(sqCyl(1.05, 1.05, 0.35, M.iron, 0, 3.3, 0, 12));
  g.add(sqCyl(0.36, 0.5, 18, M.iron, 0, 12.4, 0, 12)); for (const y of [6.5, 15, 20.6]) { g.add(sqCyl(0.62, 0.62, 0.4, M.iron, 0, y, 0, 12)); g.add(sqCyl(0.5, 0.62, 0.3, M.ironG, 0, y + 0.32, 0, 12)); }
  g.add(sqBox(3.4, 0.24, 0.24, M.iron, 0, 19.4, 0)); for (const s of [-1, 1]) g.add(sqSph(0.24, M.ironG, s * 1.75, 19.4, 0, 8, 6));
  g.add(sqCyl(0.9, 0.42, 1.2, M.iron, 0, 22, 0, 12)); g.add(sqCyl(1.5, 1.2, 0.3, M.iron, 0, 22.7, 0, 6));
  const gl = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.15, 3.0, 6), glassMat); gl.position.y = 24.3; gl.userData.noShade = true; g.add(gl);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.add(sqTube(V3(Math.cos(a) * 1.2, 22.8, Math.sin(a) * 1.2), V3(Math.cos(a) * 1.5, 25.8, Math.sin(a) * 1.5), 0.09, M.iron, 5)); }
  g.add(sqCyl(1.85, 1.6, 0.35, M.iron, 0, 25.95, 0, 6)); const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.6, 6), M.iron); cap.position.y = 26.9; g.add(cap); g.add(sqSph(0.32, M.ironG, 0, 27.9, 0, 8, 6));
  g.traverse((m) => { if (m.isMesh) m.userData.inkOcc = true; }); return g; }
function sqBench(M) { const g = new THREE.Group(); for (let i = 0; i < 4; i++) g.add(sqBox(9, 0.3, 0.7, M.wood, 0, 2.6, -1.1 + i * 0.75)); for (let i = 0; i < 3; i++) { const b = sqBox(9, 0.3, 0.6, M.wood, 0, 3.6 + i * 0.8, -1.7 - i * 0.12); b.rotation.x = -0.2; g.add(b); }
  for (const x of [-3.8, 3.8]) { g.add(sqBox(0.35, 2.6, 2.6, M.iron, x, 1.3, -0.4)); g.add(sqBox(0.35, 3.4, 0.35, M.iron, x, 4.0, -1.9)); } return g; }
function sqPlanter(M, R) { const g = new THREE.Group(); g.add(rb(5, 2.6, 2.6, M.woodD, 0, 1.3, 0)); g.add(sqBox(5.2, 0.3, 2.8, M.wood, 0, 2.7, 0)); g.add(sqBox(4.6, 0.3, 2.2, M.soil, 0, 2.7, 0));
  for (let i = 0; i < 9; i++) { g.add(sqSph(0.7, M.leaf, -1.8 + (i % 5) * 0.9, 3.3 + R.r(0, 0.5), -0.5 + Math.floor(i / 5) * 1.0, 8, 6)); } for (let i = 0; i < 10; i++) g.add(sqSph(0.36, i % 2 ? M.flowR : M.flowW, R.r(-2.1, 2.1), 3.8 + R.r(0, 0.5), R.r(-0.9, 0.9), 6, 5)); return g; }
function sqBike(M, col) { const g = new THREE.Group(), fm = c3Prop(col, { rough: 0.35 });
  for (const x of [-2.1, 2.1]) { const w = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.12, 6, 24), M.tyre); w.position.set(x, 1.6, 0); g.add(w); g.add(sqCyl(0.08, 0.08, 0.3, M.chrome, x, 1.6, 0, 6)); g.children.at(-1).rotation.x = Math.PI / 2; }
  const P = (x, y) => V3(x, y, 0); [[P(-2.1, 1.6), P(-0.4, 1.7)], [P(-0.4, 1.7), P(1.5, 3.6)], [P(-0.4, 1.7), P(-0.9, 3.9)], [P(-0.9, 3.9), P(-2.1, 1.6)], [P(-0.9, 3.9), P(1.3, 3.7)], [P(1.5, 3.6), P(2.1, 1.6)], [P(1.5, 3.6), P(1.4, 4.6)]].forEach(([a, b]) => g.add(sqTube(a, b, 0.13, fm, 6)));
  g.add(sqBox(1.2, 0.3, 0.6, M.dark, -1.0, 4.1, 0)); g.add(sqBox(0.2, 0.2, 2.0, M.dark, 1.4, 4.6, 0)); g.add(sqBox(1.6, 1.0, 1.4, M.woodD, 2.5, 4.0, 0)); return g; }
function sqParasol(M, a, b) { const g = new THREE.Group(); g.add(sqCyl(0.15, 0.15, 11, M.wood, 0, 5.5, 0, 6)); const c = new THREE.Mesh(new THREE.ConeGeometry(6.5, 2.4, 12), c3Prop('#ffffff', { map: sqTexStripes(a, b, 12), rough: 0.8 })); c.position.y = 11.6; g.add(c);
  g.add(sqCyl(1.2, 1.4, 0.5, M.iron, 0, 0.25, 0, 10)); return g; }
function sqCafeTable(M) { const g = new THREE.Group(); g.add(sqCyl(1.5, 1.5, 0.2, M.marble, 0, 3.4, 0, 18)); g.add(sqCyl(0.12, 0.12, 3.3, M.iron, 0, 1.7, 0, 6)); g.add(sqCyl(0.8, 0.8, 0.15, M.iron, 0, 0.1, 0, 10));
  for (const a of [0.4, 2.2, 4.0]) { const c = new THREE.Group(); c.position.set(Math.cos(a) * 2.4, 0, Math.sin(a) * 2.4); c.rotation.y = -a - Math.PI / 2; c.add(sqBox(1.6, 0.2, 1.6, M.cane, 0, 2.2, 0)); c.add(sqBox(1.6, 2.0, 0.2, M.cane, 0, 3.3, -0.8));
    for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) c.add(sqCyl(0.07, 0.07, 2.2, M.iron, x, 1.1, z, 5)); g.add(c); }
  g.add(sqCyl(0.3, 0.25, 0.6, M.cup, 0.5, 3.8, 0.2, 8)); return g; }
// the giant wooden pepper grinder on its dolly (origin = dolly floor centre). userData: head (turns), body, dolly, wheels
function sqGrinder(M) { const g = new THREE.Group(), dolly = new THREE.Group(); g.add(dolly);
  dolly.add(rb(5.6, 0.7, 5.6, M.woodD, 0, 1.0, 0)); for (let i = 0; i < 5; i++) dolly.add(sqBox(5.8, 0.14, 0.7, M.wood, 0, 1.42, -2.2 + i * 1.1)); const wheels = [];
  for (const [x, z] of [[-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2]]) { const w = sqCyl(0.65, 0.65, 0.5, M.tyre, x, 0.65, z, 14); w.rotation.x = Math.PI / 2; dolly.add(w); wheels.push(w); }
  const body = new THREE.Group(); body.position.y = 1.5; g.add(body);
  const prof = [[0, 0], [2.55, 0], [2.65, 0.35], [2.45, 0.9], [2.0, 1.9], [1.72, 2.9], [1.85, 4.0], [2.2, 5.2], [2.28, 6.0], [2.1, 7.2], [1.7, 8.2], [1.62, 8.8], [1.9, 9.0], [0, 9.0]].map(([r, y]) => new THREE.Vector2(r, y));
  body.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 32), M.mill));
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(2.33, 2.33, 1.6, 40, 1, true), c3Prop('#ffffff', { map: sqTexPeber(), rough: 0.6 })); lab.position.y = 5.7; body.add(lab);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.16, 8, 32), M.brass); ring.rotation.x = Math.PI / 2; ring.position.y = 9.0; body.add(ring);
  const head = new THREE.Group(); head.position.y = 9.1; body.add(head);
  const hp = [[0, 0], [1.95, 0], [2.05, 0.4], [1.9, 1.3], [1.45, 2.3], [0.8, 2.9], [0.55, 3.1], [0, 3.15]].map(([r, y]) => new THREE.Vector2(r, y));
  head.add(new THREE.Mesh(new THREE.LatheGeometry(hp, 32), M.millD)); head.add(sqSph(0.75, M.brass, 0, 3.4, 0, 14, 10));
  head.add(sqBox(3.2, 0.32, 0.4, M.brass, 1.5, 3.4, 0)); head.add(sqCyl(0.32, 0.32, 1.3, M.millD, 3.0, 4.0, 0, 10));
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; head.add(sqSph(0.16, M.dark, Math.cos(a) * 0.5, 3.12, Math.sin(a) * 0.5, 6, 4)); }
  g.userData = { head, body, dolly, wheels }; g.traverse((m) => { if (m.isMesh) m.userData.noCast = false; }); return g; }
function sqBalloon(col) { const g = new THREE.Group(), m = c3Prop(col, { rough: 0.18, env: 1.6 }); const b = sqSph(1.15, m, 0, 0, 0, 18, 14); b.scale.y = 1.18; g.add(b);
  const k = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 8), m); k.position.y = -1.42; k.rotation.x = Math.PI; g.add(k); g.add(sqCyl(0.03, 0.03, 4.5, c3Prop('#f4f0e6'), 0, -3.8, 0, 4)); return g; }
function sqPhone() { const g = new THREE.Group(); g.add(rb(0.62, 1.15, 0.12, c3Prop('#22242c', { rough: 0.3 }), 0, 0, 0, 0)); g.add(sqCyl(0.1, 0.1, 0.06, c3Prop('#5a6a8a', { rough: 0.1, metal: 0.6 }), -0.15, 0.4, -0.07, 8)); g.children.at(-1).rotation.x = Math.PI / 2;
  const sc = pl(0.52, 1.0, c3Prop('#8ab4e8', { emissive: '#5a8ad0', ei: 0.4, rough: 0.2 }), 0, 0, 0.065); g.add(sc); return g; }
function sqJar() { const g = new THREE.Group(); g.add(sqCyl(0.55, 0.55, 1.5, c3Prop('#ffffff', { map: sqTexKanel(), rough: 0.5 }), 0, 0, 0, 16)); g.add(sqCyl(0.6, 0.6, 0.4, c3Prop('#d8d8d0', { metal: 0.6, rough: 0.3 }), 0, 0.95, 0, 16)); return g; }

// ---- houses. Local frame: facade at z = 0 facing +z, body back to z = -D; ground floor 16, floors 12, top band 2.
// type: step (stepped gable), curve (Dutch curved gable), tri (plain gable, overhanging roof), eave (ridge along the
// facade + dormers). roof: copper | tile | slate.
function sqHouse(K, o) { const M = SQ.M, g = sqAt(new THREE.Group(), o.x, 0, o.z, o.ry ?? 0); K.add(g); const D = o.D ?? 22, Hb = 16 + 12 * o.floors + 2, w = o.w;
  const wallM = (SQ.wallC ||= {})[o.wall] ||= c3Prop(o.wall, { rough: 0.9 }), trimM = M.trim, roofM = M[o.roof || 'copper'];
  g.add(sqBox(w, Hb, D, wallM, 0, Hb / 2, -D / 2));
  const fm = c3Prop('#ffffff', { map: sqTexFacade(Object.assign({ trim: '#fbf6ea' }, o)), rough: 0.85 }); fm.emissive = new THREE.Color('#ffffff'); fm.emissiveMap = sqTexNight(o); fm.emissiveIntensity = 0; (SQ.facMats ||= []).push(fm);
  const fac = pl(w, Hb, fm, 0, Hb / 2, 0.06); fac.userData.noCast = true; fac.userData.keep = true; g.add(fac);
  g.add(sqBox(w + 0.3, 1.4, 0.8, (SQ.plC ||= {})[o.wall] ||= c3Prop(c3Shd(o.wall, 0.62), { rough: 0.9 }), 0, 0.7, 0.3));
  for (let f = 0; f <= o.floors; f++) g.add(sqBox(w + 0.2, 0.5, 0.55, trimM, 0, 16 + f * 12, 0.25));
  const bw = w / o.bays; for (let f = 0; f < o.floors; f++) for (let b = 0; b < o.bays; b++) { if (o.skip && f === 0 && b === Math.floor(o.bays / 2)) continue; g.add(sqBox(Math.min(4.2, bw * 0.5) + 1.2, 0.35, 0.9, trimM, (b + 0.5) * bw - w / 2, 16 + f * 12 + 2.3, 0.45)); }
  g.add(sqBox(w + 1.0, 1.2, 1.8, trimM, 0, Hb - 0.6, 0.4));
  const hg = o.hg ?? Math.min(16, w * 0.62), y0 = Hb;
  if (o.type === 'eave') { const hr = 11, sh = new THREE.Shape(); sh.moveTo(-1.6, 0); sh.lineTo(D + 1.6, 0); sh.lineTo(D / 2, hr); sh.closePath();
    const r = sqExt(sh, w + 1.2, roofM); r.rotation.y = Math.PI / 2; r.position.set(-w / 2 - 0.6, y0, 0); g.add(r); g.add(sqBox(w + 1.3, 0.6, 0.8, M.roofRidge, 0, y0 + hr, -D / 2));
    const nd = Math.max(1, Math.round(w / 9)); for (let k = 0; k < nd; k++) { const dx = -w / 2 + (k + 0.5) * w / nd, s = 0.32, dz = 1.6 - s * (D / 2 + 1.6), dy = y0 + s * hr - 0.6;
      g.add(sqBox(4.2, 4.6, 6, wallM, dx, dy + 2.3, dz - 2.4)); const wp = pl(2.8, 3.2, sqAlpha(c3Prop('#ffffff', { map: SQ.atticT, rough: 0.5 })), dx, dy + 2.4, dz + 0.62); wp.userData.noCast = true; g.add(wp);
      const ds = new THREE.Shape(); ds.moveTo(-2.7, 0); ds.lineTo(2.7, 0); ds.lineTo(0, 2.4); ds.closePath(); const dr = sqExt(ds, 7, roofM); dr.position.set(dx, dy + 4.6, dz - 6.2); g.add(dr); }
    if (o.chim !== false) g.add(sqBox(2.2, 7, 2.2, M.brick, w * 0.28, y0 + hr - 1, -D / 2 - 2)); }
  else { const hr = o.type === 'tri' ? hg + 0.8 : o.type === 'step' ? hg * 0.88 : hg * 0.8, sh = new THREE.Shape(), ww = w / 2 + (o.type === 'tri' ? 0.9 : 0.3);
    sh.moveTo(-ww, 0); sh.lineTo(ww, 0); sh.lineTo(0, hr); sh.closePath(); const r = sqExt(sh, D - (o.type === 'tri' ? -1 : 1.4), roofM); r.position.set(0, y0, o.type === 'tri' ? -D : -D + 0.2); g.add(r);
    if (o.type === 'step') { for (let i = 0; i < 4; i++) { const sw = w * (1 - i * 0.22), sy = y0 + i * hg / 4; g.add(sqBox(sw, hg / 4, 1.6, wallM, 0, sy + hg / 8, -0.8)); for (const s of [-1, 1]) g.add(sqBox(w * 0.11 + 0.5, 0.45, 1.9, trimM, s * (sw / 2 - w * 0.055), sy + hg / 4 + 0.2, -0.8)); }
      g.add(sqBox(w * 0.34 + 0.4, 0.45, 1.9, trimM, 0, y0 + hg + 0.2, -0.8)); g.add(sqSph(0.6, M.brass, 0, y0 + hg + 1.0, -0.8, 10, 8)); }
    else if (o.type === 'curve') { const s = new THREE.Shape(), q = (x, y) => [x * w, y * hg]; s.moveTo(...q(-0.5, 0)); s.lineTo(...q(-0.5, 0.12)); s.quadraticCurveTo(...q(-0.5, 0.4), ...q(-0.31, 0.43)); s.lineTo(...q(-0.25, 0.6));
      s.quadraticCurveTo(...q(-0.26, 0.8), ...q(-0.17, 0.84)); s.quadraticCurveTo(...q(0, 1.12), ...q(0.17, 0.84)); s.quadraticCurveTo(...q(0.26, 0.8), ...q(0.25, 0.6)); s.lineTo(...q(0.31, 0.43)); s.quadraticCurveTo(...q(0.5, 0.4), ...q(0.5, 0.12)); s.lineTo(...q(0.5, 0)); s.closePath();
      const gm = sqExt(s, 1.6, wallM); gm.position.set(0, y0, -1.6); g.add(gm); g.add(sqSph(0.55, M.brass, 0, y0 + hg * 0.98 + 0.5, -0.8, 10, 8));
      for (const sx of [-1, 1]) { const sc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.3, 6, 12, Math.PI * 1.4), trimM); sc.position.set(sx * w * 0.33, y0 + hg * 0.42, 0.15); sc.rotation.z = sx > 0 ? -0.6 : Math.PI + 0.6; g.add(sc); } }
    else { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, hg); s.closePath(); const gm = sqExt(s, 1.2, wallM); gm.position.set(0, y0, -1.2); g.add(gm); }
    const at = pl(o.type === 'curve' ? 2.6 : 3.0, o.type === 'curve' ? 2.6 : 3.8, sqAlpha(c3Prop('#ffffff', { map: o.type === 'curve' ? SQ.ocT : SQ.atticT, rough: 0.5 })), 0, y0 + hg * (o.type === 'curve' ? 0.62 : 0.34), 0.05); at.userData.noCast = true; g.add(at);
    if (o.chim !== false && o.type !== 'curve') g.add(sqBox(2.0, 6, 2.0, M.brick, w * 0.22, y0 + hr * 0.7, -D * 0.6)); }
  return g; }

function sqBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.4, 6000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#6a80d0', ambI: 0.22, sky: '#8a9ad6', ground: '#c08058', key: '#ffa860', keyI: 2.7, keyP: [-120, 110, 140], rim: '#ff9a60', rimI: 0.3, rimP: [150, 60, -200] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) s.hemi = c; else if (c.isAmbientLight) s.amb = c; else if (c.isDirectionalLight && c !== s.key) s.rim = c; });
  const M = SQ.M = { trim: c3Prop('#f6eedc', { rough: 0.8 }), copper: c3Prop('#58a890', { rough: 0.6, metal: 0.15 }), tile: c3Prop('#c05a3a', { rough: 0.85 }), slate: c3Prop('#5a6478', { rough: 0.7 }), roofRidge: c3Prop('#e8e2d2', { rough: 0.8 }),
    brick: c3Prop('#b8503a', { rough: 0.9 }), iron: c3Prop('#25362f', { rough: 0.45, metal: 0.35 }), ironG: c3Prop('#c8a048', { rough: 0.35, metal: 0.6 }), wood: c3Prop('#b07a44', { rough: 0.75 }), woodD: c3Prop('#7a4e2c', { rough: 0.8 }),
    soil: c3Prop('#4a3426', { rough: 1 }), leaf: c3Prop('#4f9a40', { rough: 0.8 }), flowR: c3Prop('#e8283a', { rough: 0.6 }), flowW: c3Prop('#fbf8f0', { rough: 0.6 }), tyre: c3Prop('#22222a', { rough: 0.8 }), chrome: c3Prop('#d8dce2', { rough: 0.15, metal: 0.9 }),
    dark: c3Prop('#2a2a32', { rough: 0.6 }), marble: c3Prop('#f2efe8', { rough: 0.3 }), cane: c3Prop('#d8a860', { rough: 0.7 }), cup: c3Prop('#ffffff', { rough: 0.3 }), brass: c3Prop('#e2b44a', { rough: 0.3, metal: 0.7 }),
    curb: c3Prop('#d8d0c2', { rough: 0.85 }), mill: c3Prop('#a0602a', { rough: 0.45, env: 0.8 }), millD: c3Prop('#6a3818', { rough: 0.45, env: 0.8 }), rope: c3Prop('#b8874a', { rough: 0.95 }) };
  SQ.atticT = sqTexAttic(false); SQ.ocT = sqTexAttic(true);
  const K = new THREE.Group();
  s.sky = c3SkyDome(scene, { paint: true, zenith: '#3a68d0', mid: '#f2b08a', midH: 0.12, horizon: '#ffc488', glow: '#ffa858', glowK: 0.5, ground: '#c09070', sun: [-0.5, 0.12, -0.86], clouds: 36, cloudScale: 1.1, seed: 4, cloudLit: '#ffe2bc', cloudShade: '#8a8ad0', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#f0b48a', 260, 2200);
  // ---- ground: cobbles, a ring of granite slabs round the posts, granite sidewalks + curbs in front of the rows
  scene.add(pl(1600, 1600, c3Prop('#ffffff', { map: sqRep(sqTexCobble(), 70, 70), rough: 0.9 }), 0, 0, 0, 0, -Math.PI / 2));
  { const ring = new THREE.Mesh(new THREE.RingGeometry(15, 17, 48), c3Prop('#ffffff', { map: sqRep(sqTexSlabs(), 6, 1), rough: 0.8 })); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, -14); ring.userData.noCast = true; scene.add(ring);
    const c = new THREE.Mesh(new THREE.CircleGeometry(3, 24), c3Prop('#c8bca8', { rough: 0.8 })); c.rotation.x = -Math.PI / 2; c.position.set(0, 0.03, -14); scene.add(c); }
  for (const [x, z, w, d] of [[0, SQ_ZB + 3, 2 * SQ_XS + 12, 6], [0, SQ_ZN - 3, 2 * SQ_XS + 12, 6], [-SQ_XS + 3, 4, 6, SQ_ZN - SQ_ZB], [SQ_XS - 3, 4, 6, SQ_ZN - SQ_ZB]]) { const sw = rbNC(w, 0.6, d, c3Prop('#ffffff', { map: sqRep(sqTexSlabs(), w / 6, d / 6), rough: 0.85 }), x, 0.3, z, 0); scene.add(sw); }
  K.add(sqBox(2 * SQ_XS - 12, 0.7, 0.8, M.curb, 0, 0.35, SQ_ZB + 6)); K.add(sqBox(2 * SQ_XS - 12, 0.7, 0.8, M.curb, 0, 0.35, SQ_ZN - 6)); for (const sx of [-1, 1]) K.add(sqBox(0.8, 0.7, SQ_ZN - SQ_ZB - 12, M.curb, sx * (SQ_XS - 6), 0.35, 4));
  // ---- the rows of houses
  const walls = ['#e8a83a', '#c8503a', '#3a9a98', '#e8c040', '#3a78c0', '#e88a7a', '#f2d070', '#6aa86a', '#d86a4a', '#f0b8a0', '#5ab0c8', '#e2c05a'], types = ['curve', 'eave', 'step', 'tri', 'eave', 'curve', 'step', 'eave', 'tri'], roofs = ['copper', 'tile', 'slate', 'tile', 'copper'];
  let hi = 0; const house = (o) => { const R = RNG('sqh', hi); const d = Object.assign({ seed: hi, wall: walls[hi % walls.length], type: types[hi % types.length], roof: roofs[hi % roofs.length], floors: R.f() < 0.3 ? 4 : 3, bays: Math.max(2, Math.round(o.w / 7.5)), ground: 'door', quoin: R.f() < 0.4, ped: R.f() < 0.35 }, o); hi++; return sqHouse(K, d); };
  // back row: ... bakery (x -28) ... clock tower (x 8) ... café (x 31) ...
  for (const o of [{ x: -98, w: 20 }, { x: -78, w: 20 }, { x: -59, w: 18, ground: 'shop' }, { x: -44, w: 12, type: 'step' }, { x: -28, w: 20, ground: 'bakery', type: 'curve', wall: '#f2c04a', floors: 3, bays: 3, skip: true, quoin: true, roof: 'copper', ped: false },
    { x: -11, w: 14, type: 'tri' }, { x: 31, w: 26, ground: 'cafe', type: 'eave', wall: '#3a78c0', floors: 3, bays: 4, roof: 'tile' }, { x: 53, w: 18, type: 'step' }, { x: 72, w: 20 }, { x: 92, w: 20 }]) house(Object.assign({ z: SQ_ZB }, o));
  for (let z = SQ_ZB + 9, k = 0; z < SQ_ZN - 8; k++) { const w = [18, 14, 20, 16, 22, 12][k % 6]; house({ x: -SQ_XS, z: z + w / 2, ry: Math.PI / 2, w }); house({ x: SQ_XS, z: z + w / 2, ry: -Math.PI / 2, w: w + (k % 2 ? 2 : -2), ground: k % 3 === 1 ? 'shop' : 'door' }); z += w; }
  for (let x = -SQ_XS - 8, k = 0; x < SQ_XS + 8; k++) { const w = [20, 16, 18, 22, 14][k % 5]; house({ x: x + w / 2, z: SQ_ZN, ry: Math.PI, w, ground: k % 2 ? 'shop' : 'door' }); x += w; }
  // ---- the clock tower (back row, between the bakery and the café): brick shaft, sandstone bands, clock faces, belfry, copper spire
  { const g = sqAt(new THREE.Group(), 9, 0, SQ_ZB - 6), bm = c3Prop('#ffffff', { map: sqRep(sqTexBrick('#b44a32'), 3, 10), rough: 0.9 }), st = c3Prop('#efe0c2', { rough: 0.8 });
    g.add(sqBox(16, 76, 16, bm, 0, 38, 0)); for (const y of [0.8, 16, 40, 60, 76]) g.add(sqBox(17.2, 1.4, 17.2, st, 0, y, 0));
    g.add(sqBox(6, 11, 0.8, M.woodD, 0, 5.5, 8.1)); const arch = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.8, 16, 1, false, 0, Math.PI), M.woodD); arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2; arch.position.set(0, 11, 8.1); g.add(arch);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, f = new THREE.Group(); f.rotation.y = a; g.add(f); const cf = new THREE.Mesh(new THREE.CircleGeometry(5.2, 40), c3Prop('#ffffff', { map: sqTexClockFace(), rough: 0.6 })); cf.position.set(0, 68, 8.15); f.add(cf);
      const rg = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.4, 8, 36), M.brass); rg.position.set(0, 68, 8.2); f.add(rg);
      for (const sx of [-3.6, 0, 3.6]) f.add(sqBox(2.2, 7, 0.4, M.dark, sx, 50, 8.05)); for (const sx of [-3.6, 0, 3.6]) { const ar = sqCyl(1.1, 1.1, 0.4, M.dark, sx, 53.5, 8.05, 12); ar.rotation.x = Math.PI / 2; f.add(ar); } }
    g.add(sqBox(18, 2, 18, st, 0, 77.6, 0)); for (const [x, z] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) { g.add(sqCyl(1.0, 1.0, 5, st, x, 81, z, 8)); const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 4, 8), M.copper); c.position.set(x, 85.5, z); g.add(c); }
    const p1 = new THREE.Mesh(new THREE.ConeGeometry(11.5, 9, 4), M.copper); p1.rotation.y = Math.PI / 4; p1.position.y = 83; g.add(p1);
    g.add(sqCyl(4.2, 4.2, 8, M.copper, 0, 90, 0, 8)); for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * TAU; g.add(sqBox(1.2, 5, 0.3, M.dark, Math.cos(a) * 4.15, 90, Math.sin(a) * 4.15)); g.children.at(-1).rotation.y = -a + Math.PI / 2; }
    const bulb = sqSph(4.6, M.copper, 0, 96.5, 0, 16, 10); bulb.scale.y = 0.8; g.add(bulb); g.add(sqCyl(1.8, 1.8, 4, M.copper, 0, 101, 0, 8));
    const sp = new THREE.Mesh(new THREE.ConeGeometry(1.8, 18, 8), M.copper); sp.position.y = 112; g.add(sp); g.add(sqSph(0.8, M.brass, 0, 121.5, 0, 10, 8)); g.add(sqBox(0.2, 4, 0.2, M.brass, 0, 124, 0)); g.add(sqBox(2.4, 0.2, 0.2, M.brass, 0, 124.6, 0));
    K.add(g); }
  // ---- distant copper domes + spires over the roofs (depth)
  for (const [x, z, r, h] of [[-150, -300, 34, 70], [190, -340, 24, 60]]) { K.add(sqCyl(r * 0.9, r * 0.9, h, c3Prop('#e8d8bc', { rough: 0.9 }), x, h / 2, z, 24)); const d = sqSph(r, M.copper, x, h, z, 24, 12); d.scale.y = 0.85; K.add(d); K.add(sqCyl(r * 0.18, r * 0.18, r * 0.5, c3Prop('#e8d8bc'), x, h + r * 0.95, z, 10)); const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.2, r * 0.6, 10), M.copper); c.position.set(x, h + r * 1.45, z); K.add(c); }
  for (const [x, z, h] of [[-60, -260, 150], [80, -280, 130], [260, -200, 120]]) { K.add(sqBox(12, h * 0.55, 12, c3Prop('#c8644a', { rough: 0.9 }), x, h * 0.275, z)); const c = new THREE.Mesh(new THREE.ConeGeometry(8.2, h * 0.45, 4), M.copper); c.rotation.y = Math.PI / 4; c.position.set(x, h * 0.55 + h * 0.225, z); K.add(c); }
  // ---- the bakery front: BAGERI board, striped awnings, the giant kanelsnegl over the door
  { const bx = -28, z = SQ_ZB; K.add(sqBox(15, 2.6, 0.5, M.woodD, bx, 17.2, z + 0.4)); K.add(pl(14.4, 2.2, c3Prop('#ffffff', { map: sqTexSign('BAGERI', '#7a2a1a', '#ffe2a0'), rough: 0.5 }), bx, 17.2, z + 0.7));
    for (const sx of [-1, 1]) { const aw = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.25, 3.6), c3Prop('#ffffff', { map: sqTexStripes('#c8102e', '#fbf6ea', 10), rough: 0.8 })); aw.position.set(bx + sx * 5.6, 13.6, z + 1.8); aw.rotation.x = 0.42; K.add(aw); }
    s.roll = new THREE.Group(); s.roll.position.set(bx, 23.4, z + 2.8); scene.add(s.roll);
    const cap = c3Prop('#ffffff', { map: sqTexRollCap(), rough: 0.5 }), side = c3Prop('#ffffff', { map: sqTexRollSide(), rough: 0.6 }), rc = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 4.4, 2.4, 40), [side, cap, cap]); rc.rotation.x = Math.PI / 2; s.roll.add(rc);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(4.4, 1.2, 10, 40), c3Prop('#c47a34', { rough: 0.55 })); s.roll.add(rim);
    const tail = new THREE.Mesh(new THREE.TorusGeometry(1.0, 1.15, 8, 12, Math.PI * 0.8), c3Prop('#c47a34', { rough: 0.55 })); tail.position.set(4.2, -3.2, 0); tail.rotation.z = -0.9; s.roll.add(tail);
    for (const sx of [-1, 1]) { const br = sqTube(V3(bx + sx * 2.6, 27.8, z + 0.2), V3(bx + sx * 1.6, 26.6, z + 2.8), 0.18, M.iron); K.add(br); } K.add(sqBox(6.2, 0.4, 0.4, M.iron, bx, 28, z + 0.3));
    s.windows = []; for (const sx of [-1, 1]) { const wm = c3Prop('#ffd890', { emissive: '#ffb860', ei: 0, rough: 0.2 }), wp = pl(5.6, 8.8, wm, bx + sx * 5.6, 8.0, z + 0.12); wp.userData.noShade = true; wp.material.transparent = true; wp.material.opacity = 0; scene.add(wp); s.windows.push(wp); }
    for (const [x, z2, c] of [[bx - 9, z + 4.6, '#2f8ac8'], [bx + 8.6, z + 4.6, '#e8463a']]) { const b = sqBike(M, c); sqAt(b, x, 0.6, z2, 0.1); K.add(b); } }
  // ---- the café: board, awning, tables with parasols
  { const cx = 31, z = SQ_ZB; K.add(sqBox(14, 2.6, 0.5, M.woodD, cx, 17.2, z + 0.4)); K.add(pl(13.4, 2.2, c3Prop('#ffffff', { map: sqTexSign('CAFÉ', '#1f3f6a', '#fbf2dc'), rough: 0.5 }), cx, 17.2, z + 0.7));
    const aw = new THREE.Mesh(new THREE.BoxGeometry(24, 0.25, 4), c3Prop('#ffffff', { map: sqTexStripes('#1f4f8a', '#fbf6ea', 16), rough: 0.8 })); aw.position.set(cx, 13.8, z + 2); aw.rotation.x = 0.42; K.add(aw);
    for (const [x, z2] of [[cx - 8, z + 13], [cx + 1, z + 15], [cx + 10, z + 12.5]]) { const t = sqCafeTable(M); sqAt(t, x, 0, z2, x * 0.3); K.add(t); }
    for (const [x, z2, a, b] of [[cx - 5, z + 14, '#c8102e', '#fbf6ea'], [cx + 7, z + 14, '#1f4f8a', '#fbf6ea']]) { const p = sqParasol(M, a, b); sqAt(p, x, 0, z2); K.add(p); }
    for (const sx of [-1, 1]) { const wm = c3Prop('#ffd890', { emissive: '#ffb860', ei: 0, rough: 0.2 }), wp = pl(9, 8.8, wm, cx + sx * 7.2, 8.0, z + 0.12); wp.userData.noShade = true; wp.material.transparent = true; wp.material.opacity = 0; scene.add(wp); s.windows.push(wp); } }
  // ---- street furniture: benches, planters, bikes along the left row, lime trees, a fountain, perimeter lamps
  { const R = RNG('sqfurn');
    for (const [x, z, ry] of [[-SQ_XS + 9, -26, Math.PI / 2], [-SQ_XS + 9, 26, Math.PI / 2], [SQ_XS - 9, -6, -Math.PI / 2], [SQ_XS - 9, 34, -Math.PI / 2], [-50, SQ_ZB + 10, 0], [56, SQ_ZB + 10, 0]]) { const b = sqBench(M); sqAt(b, x, 0, z, ry); K.add(b); }
    for (const [x, z, ry] of [[-44, SQ_ZB + 9, 0], [-14, SQ_ZB + 9, 0], [48, SQ_ZB + 9, 0], [-SQ_XS + 9, 0, Math.PI / 2], [SQ_XS - 9, 14, Math.PI / 2], [-SQ_XS + 9, 44, Math.PI / 2]]) { const p = sqPlanter(M, R); sqAt(p, x, 0, z, ry); K.add(p); }
    ['#2f8ac8', '#e8463a', '#f2c23a', '#3f8a5a', '#1f1f2a', '#c84a8a'].forEach((c, i) => { const b = sqBike(M, c); sqAt(b, -SQ_XS + 7.5, 0.6, -12 + i * 3.2, Math.PI / 2 + 0.08 * (i % 2)); K.add(b); });
    K.add(sqBox(0.3, 2.8, 20, M.iron, -SQ_XS + 9.6, 1.4, -4));
    for (const [x, z, sc, sd] of [[-58, -50, 4.6, 1], [60, -50, 4.4, 2], [-58, 52, 4.8, 3], [58, 52, 4.6, 4], [-60, 0, 4.2, 5]]) { const tr = c3LeafTree(sc, sd, sd % 2 ? '#4f8a3a' : '#5a9a40'); tr.position.set(x, 0, z); K.add(tr); K.add(sqCyl(2.6, 2.6, 0.3, M.iron, x, 0.15, z, 16)); }
    { const fx = -36, fz = 26; K.add(sqCyl(7, 7.4, 1.8, c3Prop('#d8ccb4', { rough: 0.8 }), fx, 0.9, fz, 28)); K.add(sqCyl(6.3, 6.3, 0.3, c3Prop('#4aa0c8', { rough: 0.08, env: 1.8 }), fx, 1.6, fz, 28));
      K.add(sqCyl(1.2, 1.6, 5, c3Prop('#d8ccb4', { rough: 0.8 }), fx, 4, fz, 12)); K.add(sqCyl(3, 2.2, 0.8, c3Prop('#d8ccb4', { rough: 0.8 }), fx, 6.6, fz, 16)); K.add(sqSph(1, M.copper, fx, 8, fz, 12, 8)); }
    s.lampGlass = c3Prop('#fff2cc', { emissive: '#ffcf80', ei: 0.18, rough: 0.15 }); s.lampGlass.userData.glow = '#ffcc80';
    s.lamps = [];
    for (const [x, z] of [[-50, SQ_ZB + 7.5], [52, SQ_ZB + 7.5], [-SQ_XS + 7.5, 14], [SQ_XS - 7.5, 22], [-30, SQ_ZN - 7.5], [30, SQ_ZN - 7.5]]) { const l = sqLampPost(M, s.lampGlass); l.scale.setScalar(0.92); l.position.set(x, 0.6, z); l.updateMatrix(); const gl = l.children.find((m) => m.material === s.lampGlass); l.remove(gl); gl.applyMatrix4(l.matrix); scene.add(gl); K.add(l); s.lamps.push(V3(x, 23, z)); } }
  // ---- Dannebrog flags: poles round the square + staffs out of facades (vertex wave in sqFrame)
  s.flags = []; { const fm = c3Prop('#ffffff', { map: sqTexFlag(), rough: 0.8 }); fm.side = THREE.DoubleSide;
    const flag = (x, y, z, ry, sc) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(12 * sc, 9 * sc, 16, 4), fm); f.geometry.translate(6 * sc, 0, 0); f.userData.base = Float32Array.from(f.geometry.attributes.position.array); f.userData.sc = sc; f.userData.ph = s.flags.length * 1.7; f.position.set(x, y, z); f.rotation.y = ry; f.userData.keep = true; scene.add(f); s.flags.push(f); return f; };
    for (const [x, z, ry] of [[-40, SQ_ZB + 8, 0.4], [44, SQ_ZB + 8, 2.6], [-SQ_XS + 8, 36, -0.3]]) { K.add(sqCyl(0.35, 0.5, 44, c3Prop('#f4f2ec', { rough: 0.4 }), x, 22, z, 10)); K.add(sqSph(0.8, M.brass, x, 44.4, z, 10, 8)); K.add(sqCyl(1.4, 1.8, 1.2, M.curb, x, 0.6, z, 12)); flag(x + 0.3, 39, z, ry, 1.15); }
    for (const [x, z] of [[-78, SQ_ZB], [-59, SQ_ZB], [53, SQ_ZB], [72, SQ_ZB]]) { const a = V3(x, 30, z + 0.4), b = V3(x, 36.5, z + 7.5); K.add(sqTube(a, b, 0.18, c3Prop('#f4f2ec', { rough: 0.4 }), 6)); const f = flag(b.x, b.y - 2.6, b.z, -Math.PI / 2, 0.62); f.rotation.x = 0; } }
  // ---- bunting: red / white pennants and little Dannebrogs on sagging strings across the square
  s.bunt = []; { const pr = c3Prop('#d0142e', { rough: 0.8 }), pw = c3Prop('#fbf8f0', { rough: 0.8 }), pf = c3Prop('#ffffff', { map: sqTexFlag(), rough: 0.8 }); [pr, pw, pf].forEach((m) => { m.side = THREE.DoubleSide; });
    const tri = new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-0.85, 0), new THREE.Vector2(0.85, 0), new THREE.Vector2(0, -2.1)])), rect = new THREE.PlaneGeometry(2.0, 1.5); rect.translate(0, -0.75, 0);
    const string = (A, B, sag, n) => { const P = (u) => A.clone().lerp(B, u).add(V3(0, -4 * sag * u * (1 - u), 0)); for (let i = 0; i < 48; i++) { const a = P(i / 48), b = P((i + 1) / 48); K.add(sqTube(a, b, 0.07, M.dark, 4)); }
      const dir = B.clone().sub(A).setY(0).normalize(), ry = Math.atan2(-dir.z, dir.x);
      for (let i = 1; i < n; i++) { const a = P(i / n), k = i % 3, m = new THREE.Mesh(k === 2 ? rect : tri, k === 0 ? pr : k === 1 ? pw : pf), piv = new THREE.Group(); piv.position.copy(a); piv.rotation.y = ry; piv.add(m); m.userData.keep = true; scene.add(piv); piv.userData.ph = i * 0.9 + A.x * 0.1; s.bunt.push(piv); } };
    string(V3(-SQ_XS, 32, -40), V3(SQ_XS, 32, -40), 6, 52); string(V3(-SQ_XS, 30, -6), V3(SQ_XS, 30, -6), 7, 52); string(V3(-SQ_XS, 31, 26), V3(SQ_XS, 31, 26), 6, 52);
    string(V3(1, 58, SQ_ZB - 0.5), V3(-SQ_XS, 30, 6), 8, 40); string(V3(17, 58, SQ_ZB - 0.5), V3(SQ_XS, 30, 6), 8, 40); }
  // ---- THE two lampposts (separate: post 2 shakes on the sneeze), their warm practicals (dusk)
  s.post1 = sqLampPost(M, s.lampGlass); s.post1.position.copy(SQ_P1); scene.add(s.post1);
  s.post2 = sqLampPost(M, s.lampGlass); s.post2.position.copy(SQ_P2); scene.add(s.post2);
  s.crate = new THREE.Group(); s.crate.add(rb(3.4, 3.6, 3.4, M.wood, 0, 1.8, 0)); for (const y of [0.6, 1.8, 3.0]) s.crate.add(sqBox(3.5, 0.3, 3.5, M.woodD, 0, y, 0)); s.crate.position.set(-9.6, 0, -17.2); s.crate.rotation.y = 0.2; K.add(s.crate);
  s.faceL = new THREE.PointLight('#f4f0ff', 0, 34, 1.4); s.faceL.position.set(SQ_P2.x - 4, 13, SQ_P2.z + 8); s.faceL.layers.enableAll(); scene.add(s.faceL);
  s.pl = [...s.lamps.map(() => null), 0, 0].map(() => { const L = new THREE.PointLight('#ffb468', 0, 60, 1.6); L.layers.enableAll(); scene.add(L); return L; });
  [...s.lamps, V3(SQ_P1.x, 24.3, SQ_P1.z), V3(SQ_P2.x, 24.3, SQ_P2.z)].forEach((p, i) => s.pl[i].position.copy(p));
  scene.add(sqBake(K));
  // ---- FOCUS: the grinder, ropes, chest signs, props, puffs, balloons, phones, flashes, scent wisps
  const Fg = new THREE.Group(); scene.add(Fg);
  s.grinder = sqGrinder(M); Fg.add(s.grinder);
  s.ropes = {};   // the lashings are built on first use (they need the people's body sizes): sqLashBuild
  s.sign25 = pl(2.3, 2.875, sqAlpha(c3Prop('#ffffff', { map: sqTexChestSign('25', false), rough: 0.7 })), 0, 0, 0); s.sign25.material.side = THREE.DoubleSide; Fg.add(s.sign25);
  s.sign30 = pl(2.3, 2.875, sqAlpha(c3Prop('#ffffff', { map: sqTexChestSign('30', false), rough: 0.7 })), 0, 0, 0); s.sign30.material.side = THREE.DoubleSide; Fg.add(s.sign30);
  s.sign30p = sqTexChestSign('30', true); s.sign30c = s.sign30.material.map;
  s.jar = sqJar(); Fg.add(s.jar);
  s.balloons = []; for (let i = 0; i < 12; i++) { const b = sqBalloon(i % 2 ? '#fbf8f0' : '#d8142e'); Fg.add(b); s.balloons.push(b); }
  s.phones = []; for (let i = 0; i < 7; i++) { const p = sqPhone(); p.scale.setScalar(1.55); Fg.add(p); s.phones.push(p); }
  const puffT = sqTexPuff(); s.puffs = []; for (let i = 0; i < 280; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: puffT, transparent: true, depthWrite: false, color: '#b8743a', fog: false })); m.renderOrder = 10; m.userData.noInk2 = true; m.visible = false; scene.add(m); s.puffs.push(m); }
  const wT = sqTexWisp(); s.wisps = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 5.6), new THREE.MeshBasicMaterial({ map: wT, transparent: true, depthWrite: false, color: '#c8844a', fog: false })); m.renderOrder = 9; m.userData.noInk2 = true; m.visible = false; scene.add(m); s.wisps.push(m); }
  const gT = sqTexGlint(); s.flashes = s.phones.map(() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 4.5), new THREE.MeshBasicMaterial({ map: gT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false })); m.renderOrder = 12; m.userData.noInk2 = true; m.visible = false; scene.add(m); return m; });
  c3Layer(Fg, C3.L_FOCUS); [...s.puffs, ...s.wisps, ...s.flashes].forEach((m) => c3Layer(m, C3.L_FOCUS));
  for (const k of ['hero', 'thirty', 'fRope', 'fBucket', 'fSpice', 'stranger', 'passer', 'sqA', 'sqB', 'sqC', 'sqD', 'sqE']) toonPerson(s, k);
  for (const k of ['hero', 'thirty']) s.p[k].drawFn = (g, p, st) => { t3Draw(g, p, st); sqDrawRope(g, p, st); };
  c3Env(scene, { top: '#4a4c98', mid: '#6a4a78', bot: '#241c2c', cards: [[0, 30, 0, 40, 6, '#7a6aa8'], [0, 8, 40, 30, 8, '#e08070']] }); s.envDusk = scene.environment; c3Env(scene, { top: '#a8c0f0', mid: '#b8b4cc', bot: '#5a4a44' }); s.envDay = scene.environment; c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.55, scale: 0.3, inkSet: false, grimeH: 5, bounce: ['#9cb2e2', '#c88a5a', 0.12] });
  return s;
}
const SQ_get = () => SQ.s ||= sqBuild();
SETS.square = SQ_get;

// ---- the camera path (absolute s): 36.14–49.76 golden-hour take, 56.76–60.50 dusk take
CAMSEQ.square = [
  [35.90, [-30, 13, 17], [-16, 9, -12], 42, -7],            // phantom: the whip-in arrives already moving (pan right)
  // d01: whip in on the hero on post 1 + fSpice above him; push in + orbit right; 'cinnamon' 37.36, shrug on 'gentle' 38.06
  [36.14, [-25, 12, 13], [-7.5, 8.6, -14], 42, -5],
  [37.36, [-17, 10.5, 8], [-6, 7.8, -14.5], 38, -1.5],
  [38.40, [-6, 9.5, 10], [-5.2, 7.8, -14], 37, 2.5],
  // d02: lateral travel post -> post, landing on the 30-year-old on '30' (40.24); crane up to the grinder on 'upgrade'; dutch on 'pepper'
  [39.60, [0, 10, 24], [0.3, 7.8, -14], 46, 3.5],
  [39.95, [1.2, 10, 23], [0.9, 7.8, -14], 46, 2],
  [40.30, [6.5, 9.2, 10], [5.2, 7.8, -14], 37, -1],
  [41.10, [10, 8.5, 28], [10, 8.4, -13], 46, -3],
  [41.90, [12, 13, 34], [11, 9, -12.5], 48, -1],
  [42.45, [9.5, 11.5, 28], [9.5, 9.2, -13], 46, 7],
  // d03: crane up + orbit (both laugh, friends dance), tilt up with the balloons to the tower + bunting, roll breathes
  [43.30, [-6, 11.5, 23], [-1, 8.6, -13], 44, 3],
  [44.30, [4.5, 13.5, 24], [2, 9.4, -13], 44, -3],
  [45.20, [-6, 15.5, 25], [0.5, 8.8, -14], 46, -5],
  // d04: pull back wide, orbit round the crowd; flashes on 'pictures' (47.16)
  [46.10, [-13, 27, 22], [0, 7, -17], 44, -2],
  [46.90, [-3, 23, 24], [0.5, 7, -17], 44, 2],
  [47.45, [7, 21.5, 22], [-0.5, 7.5, -16], 44, 4],
  // d05: track the hero walking off, crane up to the giant kanelsnegl on 'roll' (48.70)
  [48.05, [2, 6.5, 14], [-6, 8.5, -14], 40, 1],
  [48.75, [1.5, 5, 13], [-15, 12.5, -38], 38, -2],
  [49.50, [0.5, 5.5, 11.5], [-21, 14, -48], 36, 2],
  [49.99, [0, 6, 11], [-29, 15, -52], 35, 5],         // phantom: keeps the whip-out fast through 49.76
  [56.52, [-20, 5.5, 26], [4, 36, -22], 46, -6],              // phantom: the dusk whip-in arrives moving
  // d06: dusk. Tilt down from the lit lantern against the pink sky, then a slow push-in on the 30-year-old (the longest take);
  // the 'ah... ah...' build from 58.8 (dutch builds), the sneeze on 'pepper' (59.96) — kick at 59.98 — and the blast pulls back
  [56.76, [-15, 6, 22], [5, 33, -20], 46, -4],
  [57.70, [-5, 8.5, 20], [9.5, 11, -13], 44, -2],
  [58.60, [-1.5, 8.8, 8.5], [5.2, 9.0, -14], 38, 2],
  [59.50, [0.8, 9.2, 4.5], [5.1, 9.0, -14], 35, 5],
  [59.96, [1.4, 9.2, 3.6], [5.0, 9.0, -14], 34, 7],
  [60.50, [-3, 10.5, 10.5], [5.5, 9.2, -14], 42, -3],
  [60.80, [-5, 11.5, 12.5], [5.5, 9.6, -14], 42, -4],
];

// ---- state helpers
function sqSky(s, t) { const d = SQ_DUSK(t), u = s.sky.material.uniforms; c3ShadowSetup(s.scene); s.hemiI ??= s.hemi.intensity; s.ambI ??= s.amb.intensity;
  if (s.skyState === d) return; s.skyState = d;
  if (!d) { u.zen.value.set('#3a68d0'); u.mid.value.set('#f2b08a'); u.hor.value.set('#ffc488'); u.glow.value.set('#ffa858'); u.glowK.value = 0.5; u.sun.value.set(-0.5, 0.12, -0.86).normalize(); u.cLit.value.set('#ffe2bc'); u.cSh.value.set('#8a8ad0');
    s.scene.fog.color.set('#f0b48a'); s.hemi.intensity = s.hemiI; s.amb.intensity = s.ambI; SQ.facMats.forEach((m) => { m.emissiveIntensity = 0; }); s.scene.environment = s.envDay; s.key.color.set('#ffa860'); s.key.userData.I = 2.7; s.key.userData.dir = V3(-0.5, 0.5, 0.7).normalize(); s.hemi.color.set('#8a9ad6'); s.hemi.groundColor.set('#c08058'); s.amb.color.set('#6a80d0'); s.rim.color.set('#ff9a60');
    s.lampGlass.emissiveIntensity = 0.18; s.pl.forEach((L) => { L.intensity = 0; }); s.windows.forEach((w) => { w.material.opacity = 0; }); }
  else { u.zen.value.set('#141a52'); u.mid.value.set('#4a3a8e'); u.hor.value.set('#d86a8a'); u.glow.value.set('#ff7a5a'); u.glowK.value = 0.55; u.sun.value.set(-0.6, 0.04, -0.8).normalize(); u.cLit.value.set('#ffb4a4'); u.cSh.value.set('#6a5aa0');
    s.scene.fog.color.set('#5a4a8a'); s.key.color.set('#ff8a7a'); s.key.userData.I = 0.42; s.hemi.intensity = s.hemiI * 0.38; s.amb.intensity = s.ambI * 0.45; SQ.facMats.forEach((m) => { m.emissiveIntensity = 1.1; }); s.scene.environment = s.envDusk; s.key.userData.dir = V3(-0.75, 0.3, 0.55).normalize(); s.hemi.color.set('#7a78d0'); s.hemi.groundColor.set('#8a6070'); s.amb.color.set('#6a64c0'); s.rim.color.set('#ff8aa0');
    s.lampGlass.emissiveIntensity = 2.4; s.pl.forEach((L, i) => { L.intensity = i >= s.lamps.length ? 0.5 : 2.2; }); s.windows.forEach((w) => { w.material.opacity = 0.92; w.material.emissiveIntensity = 1.5; }); } }
function sqShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; k.intensity = (k.userData.I ?? 2.3) * (C3_SHADOW.key ?? 1); if (!k.castShadow) return;
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(k.userData.dir, 200); }
const sqToCam = (s, P) => V3(s.cam.position.x - P.x, 0, s.cam.position.z - P.z).normalize();
// where a tied person stands: in front of the post, on the camera side (the post shows behind him, above his head)
const sqTiedAt = (s, P) => P.clone().addScaledVector(sqToCam(s, P), 1.15);
// body heights of a card in world units (chest, belly, knees)
function sqBodyY(p) { const d = t3Dims(p.o); return { chest: (d.legL + d.Th * 0.42) * p.U, belly: (d.legL - 0.05 * d.Th) * p.U, knee: d.legL * 0.45 * p.U, head: (d.legL + d.Th + d.HH * 0.45) * p.U }; }
// the cinnamon / pepper dusting, drawn INTO the card after the pose (source-atop: only on the drawn person). The face oval is
// kept clear (eyes, brows, mouth readable): the head gets a light dust round it, the body a wash + specks.
function sqDust(p, kind, k) { if (k <= 0.01 || !p.cv) return; const g = p.cv.getContext('2d'), d = t3Dims(p.o), R = RNG('sqdust' + kind, p.key.length * 7), hy = 975 - (d.legL + d.Th + d.HH * 0.42), hr = d.HH * 0.5, ny = 975 - d.legL - d.Th;
  g.save(); g.setTransform(p.k, 0, 0, p.k, 0, 0); g.globalCompositeOperation = 'source-atop';
  const pep = kind === 'pepper', wash = pep ? `rgba(70,62,62,${0.34 * k})` : `rgba(200,132,74,${0.36 * k})`; g.fillStyle = wash; g.fillRect(0, ny - 6, 600, 1200);
  g.fillStyle = pep ? `rgba(80,72,72,${0.16 * k})` : `rgba(200,132,74,${0.12 * k})`; g.beginPath(); g.ellipse(300, hy - hr * 0.55, hr * 1.1, hr * 0.5, 0, 0, TAU); g.fill();
  const n = Math.round((pep ? 520 : 300) * k);
  for (let i = 0; i < n; i++) { const x = R.r(150, 450), y = R.r(hy - hr * 1.2, 980), dx = (x - 300) / (hr * 0.62), dy = (y - hy - hr * 0.08) / (hr * 0.55); if (dx * dx + dy * dy < 1) continue;
    const onHead = y < ny; if (onHead && R.f() < 0.55) continue; g.fillStyle = pep ? (R.f() < 0.6 ? 'rgba(38,32,32,0.85)' : 'rgba(96,88,86,0.75)') : (R.f() < 0.6 ? 'rgba(150,84,36,0.8)' : 'rgba(224,160,96,0.75)');
    g.beginPath(); g.arc(x, y, R.r(1.6, onHead ? 3.2 : 4.4), 0, TAU); g.fill(); }
  g.restore(); p.tex.needsUpdate = true; if (p.lv && p.lv[p.k]) p.lv[p.k].last = null; }
// one walk between two points over [t0, t1] (linear, stops with toon 'stop'): returns [pos, walking opts | null]
function sqWalk(s, t, A, B, t0, t1, stride = 4.2) { const u = clamp((t - t0) / (t1 - t0)), p = A.clone().lerp(B, u); if (t <= t0 || t >= t1) return [p, null];
  return [p, { mode: 'walk', phase: A.distanceTo(p) / stride, stride, stop: clamp((t - (t1 - 0.26)) / 0.26), facing: toonLookFacing(s.cam, p.x, p.z, B.x - A.x, B.z - A.z) }]; }

// ---- the stateless particle pool: emitters -> camera-facing soft puffs (normal alpha, never black specks)
// e = { t0, t1, n, o:[x,y,z], v:[x,y,z], spr, g, drag, life, s0, s1, a, col:[c1,c2], seed }
function sqPuffs(s, t, E) { let k = 0; const q = s.cam.quaternion;
  for (const e of E) { const R = RNG('sqpf' + e.seed); for (let i = 0; i < e.n; i++) { const r = [R.n(1), R.n(1), R.n(1)], cs = R.f(), sz = R.r(0.75, 1.25), rot = R.f() * TAU; if (k >= s.puffs.length) break;
    const tb = e.t0 + (e.t1 - e.t0) * i / e.n, a = t - tb, life = e.life * R.r(0.8, 1.15); if (a < 0 || a > life) continue;
    const dr = e.drag ?? 0, f = dr > 0 ? (1 - Math.exp(-dr * a)) / dr : a, m = s.puffs[k++], sp = e.spr ?? 1;
    m.visible = true; m.position.set(e.o[0] + (e.v[0] + r[0] * sp) * f, e.o[1] + (e.v[1] + r[1] * sp) * f + 0.5 * (e.g ?? 0) * a * a, e.o[2] + (e.v[2] + r[2] * sp) * f);
    m.quaternion.copy(q); m.rotateZ(rot + a * 0.6); const u = a / life; m.scale.setScalar(sz * lerp(e.s0, e.s1, 1 - (1 - u) ** 2));
    m.material.color.set(e.col[cs < 0.5 ? 0 : 1]); m.material.opacity = (e.a ?? 0.9) * Math.min(1, a / 0.06) * (1 - u * u); } }
  for (; k < s.puffs.length; k++) s.puffs[k].visible = false; }

// ---- the cast (one continuous performance per take, absolute t)
const SQ_GT = (t) => t < 40.9 ? 0 : t > 41.86 ? 1 : 1 - (1 - (t - 40.9) / 0.96) ** 2.2;   // grinder roll-in progress (eases to a stop)
const sqGrX = (t) => lerp(38, SQ_GR.x, SQ_GT(t));
function sqHero(s, t) { const cam = s.cam, by = sqBodyY(s.p.hero);
  if (t < 47.64) { const P = sqTiedAt(s, SQ_P1), shrug = t >= 38.06 && t < 38.9;
    pose(s, 'hero', t, P.x, P.z, { look: [cam.position.x, cam.position.z], expr: [[0, 'smile'], [37.36, 'happy'], [38.06, 'smug'], [39.04, 'smile'], [40.24, 'grin'], [42.26, 'surprised'], [42.72, 'laugh'], [45.44, 'excited'], [46.6, 'grin'], [47.16, 'happy']],
      hand: { L: [[0, 'down'], [38.06, 'shrug'], [38.9, 'down']], R: [[0, 'down'], [38.06, 'shrug'], [38.9, 'down']] }, gaze: t >= 36.9 && t < 37.9 ? [-0.3, -0.8] : t >= 41.5 && t < 42.7 ? [0.9, 0] : undefined,
      tilt: shrug ? 0.12 : t >= 42.72 && t < 45.4 ? 0.1 * Math.sin((t - 42.72) * 9) : 0, squash: shrug ? 0.12 * Math.sin(Math.PI * clamp((t - 38.06) / 0.4)) : t >= 42.72 && t < 45.4 ? 0.06 * Math.abs(Math.sin((t - 42.72) * 9)) : 0 });
    sqDust(s.p.hero, 'cinnamon', t < 37.36 ? 0.3 : lerp(0.3, 0.85, clamp((t - 37.36) / 1.4))); return P; }
  // d05: untied, walks off toward the bakery, still wearing the 25 sign, trailing cinnamon scent
  const A = sqTiedAt(s, SQ_P1), B = V3(-12.5, 0, -26), [P, wk] = sqWalk(s, t, V3(-5.4, 0, -12.9), B, 47.86, 49.9, 4.4);
  pose(s, 'hero', t, P.x, P.z, Object.assign({ expr: [[0, 'happy'], [48.42, 'smug']], hand: { L: 'down', R: 'down' } }, wk || { look: [-28, -62], hand: { L: "down", R: "down" } }));
  sqDust(s.p.hero, 'cinnamon', 0.85); return P; }
function sqThirty(s, t) { const P = sqTiedAt(s, SQ_P2), d6 = t > 52;
  let o;
  if (!d6) o = { look: [cam0(s)[0], cam0(s)[1]], expr: [[0, 'nervous'], [39.04, 'worried'], [40.24, 'worried'], [41.5, 'shock'], [42.26, 'shock'], [42.72, 'laugh'], [45.44, 'grin'], [47.16, 'smile'], [47.64, 'deadpan'], [48.7, 'sad']],
    hand: { L: 'down', R: 'down' }, gaze: t < 39.04 ? [-0.9, 0] : t >= 41.5 && t < 42.26 ? [0.9, -0.1] : t >= 47.64 ? [-0.8, -0.1] : undefined,
    tilt: t >= 42.72 && t < 45.4 ? 0.1 * Math.sin((t - 42.72) * 8.5 + 1) : t >= 42.26 && t < 42.72 ? -0.1 : 0, squash: t >= 42.26 && t < 42.5 ? 0.2 * Math.sin(Math.PI * (t - 42.26) / 0.24) : t >= 42.72 && t < 45.4 ? 0.06 * Math.abs(Math.sin((t - 42.72) * 8.5 + 1)) : 0 };
  else { // the ending: alone at dusk; 'ah... ah...' from 58.8 (head back, eyes squeeze, chest swells), the sneeze ON 'pepper' (59.96)
    const ah = clamp((t - 58.8) / 1.12), sn = t >= 59.96, sk = sn ? t - 59.96 : 0;
    o = { look: [cam0(s)[0], cam0(s)[1]], expr: [[0, 'sad'], [57.6, 'bored'], [58.34, 'deadpan'], [58.8, 'surprised'], [59.36, 'strain'], [59.96, 'shock']],
      hand: { L: 'down', R: 'down' }, gaze: t < 58.8 ? [0.3, 0.6] : undefined,
      tilt: sn ? 0.28 * Math.exp(-sk * 5) * Math.cos(sk * 22) + 0.05 * Math.sin(sk * 40) * Math.exp(-sk * 3) : -0.24 * EZ.io(ah) - 0.04 * Math.sin(Math.max(0, t - 58.8) * 9) * ah,
      squash: sn ? 0.42 * Math.exp(-sk * 6) - 0.05 : -0.2 * EZ.io(ah), lean: sn ? 0.16 * Math.exp(-sk * 4) : -0.07 * EZ.io(ah), alive: 1 }; }
  pose(s, 'thirty', t, P.x, P.z, o);
  sqDust(s.p.thirty, 'pepper', d6 ? 1 : clamp((t - 42.3) / 0.35)); if (d6 && t >= 59.96) sqHair(s.p.thirty, Math.exp(-(t - 59.96) * 2.2), t); return P; }
const cam0 = (s) => [s.cam.position.x, s.cam.position.z];
// fSpice: on the crate behind / left of post 1 with the KANEL shaker over the hero (d01-d02), hops down and dances (d03), cheers
const SQ_SPC = V3(-9.4, 0, -17.0), SQ_SPD = V3(-12.5, 0, -7.5);
function sqSpice(s, t) { let P = SQ_SPC.clone(), y = 3.6, o;
  if (t < 42.82) { const shake = t >= 37.2 && t < 39.0; o = { look: [SQ_P1.x + 1, SQ_P1.z + 2], expr: [[0, 'grin'], [37.36, 'happy'], [38.06, 'smile'], [39.04, 'grin'], [41.5, 'excited']],
      hand: { R: [[0, { h: [0.62, -0.42], pole: [0.6, 1], hand: 'grip' }], [37.2, { h: [0.78, -0.3], pole: [0.4, 1], hand: 'grip' }], [39.0, { h: [0.5, -0.5], pole: [0.6, 1], hand: 'grip' }]], L: [[0, 'hip'], [41.5, 'up']] }, tilt: shake ? 0.05 * Math.sin(t * 26) : 0 }; }
  else if (t < 43.3) { const u = (t - 42.82) / 0.48; P.lerpVectors(SQ_SPC, SQ_SPD, EZ.io(u)); y = lerp(3.6, 0, u) + 2.2 * Math.sin(Math.PI * u); o = { look: [cam0(s)[0], cam0(s)[1]], expr: 'excited', hand: { L: 'up', R: 'up' }, squash: u < 0.2 ? 0.2 : u > 0.9 ? 0.25 : -0.1 }; }
  else { P.copy(SQ_SPD); y = 0; const b = (t - 43.3) * 2.2, hop = t < 45.4 ? Math.max(0, Math.sin(b * Math.PI)) : 0;
    o = { look: [cam0(s)[0], cam0(s)[1]], expr: [[0, 'laugh'], [45.44, 'happy'], [47.16, 'excited'], [47.64, 'grin']], hand: t < 45.4 ? { L: [[43.3, 'up'], [43.75, 'wave'], [44.2, 'up'], [44.65, 'wave'], [45.1, 'up']], R: [[43.3, 'wave'], [43.75, 'up'], [44.2, 'wave'], [44.65, 'up'], [45.1, 'wave']] } : { L: 'hip', R: [[45.4, 'wave'], [47.64, 'up']] },
      squash: t < 45.4 ? (hop < 0.15 ? 0.15 : -0.05) : 0 }; y = 1.4 * hop; }
  pose(s, 'fSpice', t, P.x, P.z, Object.assign({ y }, o));
  if (t < 42.82) { const sh = t >= 37.2 && t < 39.0 ? 0.35 * Math.sin(t * 24) : 0; gripProp(s, s.jar, 'fSpice', 'R', V3(0, 0, 0), { rz: -2.1 + sh, behind: -0.25 }); gripDot(s, 'fSpice', 'R'); }
  return P.clone().setY(y); }
// fRope + fBucket: roll the grinder in on 'upgrade', crank it on 'pepper', dance (d03), stay cheering
function sqFriends(s, t) { const gx = sqGrX(t), rolling = t > 40.9 && t < 41.86, out = [];
  for (const [who, dx, dz, ph, D] of [['fRope', 4.3, -1.6, 0, V3(10.2, 0, -8.2)], ['fBucket', 3.9, 2.3, 1.3, V3(13.8, 0, -5.6)]]) { let P = V3(gx + dx, 0, SQ_GR.z + dz), o, y = 0;
    if (t >= 42.8) { const u = clamp((t - 42.8) / 0.42); P.lerp(D, EZ.io(u)); }   // hop over to dance by the posts
    if (t < 42.72) { const crank = t >= 42.12, push = { h: [-0.4, 0.42], pole: [1, 0.3], front: true, hand: 'grip' };
      o = { expr: [[0, 'determined'], [41.5, 'grin'], [42.26, 'excited']], hand: who === 'fRope' ? (crank ? { R: [[42.12, { h: [-0.3, -0.4], pole: [1, 0.6], front: true, hand: 'grip' }]], L: [[42.12, { h: [-0.5, 0.0], pole: [1, 0.4], front: true, hand: 'grip' }]] } : { R: push, L: push }) : { R: push, L: crank ? 'up' : push },
        lean: rolling ? -0.12 : crank && who === 'fRope' ? -0.06 + 0.05 * Math.sin(t * 30) : 0, look: [gx, SQ_GR.z] };
      if (rolling) Object.assign(o, { mode: 'walk', phase: (38 - gx) / 4.0, stride: 4.0, stop: clamp((t - 41.6) / 0.26), facing: toonLookFacing(s.cam, P.x, P.z, -1, 0) }); }
    else { const hop = t < 45.4 ? Math.max(0, Math.sin(((t - 42.72) * 2.3 + ph) * Math.PI)) : 0; y = 1.2 * hop + (t >= 42.8 && t < 43.22 ? 1.6 * Math.sin(Math.PI * (t - 42.8) / 0.42) : 0);
      o = { look: [cam0(s)[0], cam0(s)[1]], expr: [[0, 'laugh'], [45.44, 'happy'], [47.16, 'grin']], hand: t < 45.4 ? { L: hop > 0.5 ? 'up' : 'wave', R: hop > 0.5 ? 'wave' : 'up' } : { L: 'hip', R: [[45.4, 'wave'], [46.6, 'up'], [47.64, 'hip']] }, squash: t < 45.4 ? (hop < 0.15 ? 0.14 : -0.04) : 0 }; }
    pose(s, who, t, P.x, P.z, Object.assign({ y }, o)); out.push(P); }
  return out; }
function sqGrinderAt(s, t) { const G = s.grinder, u = G.userData, gx = sqGrX(t), d6 = t > 52; G.visible = true; G.position.set(gx, 0, SQ_GR.z); G.rotation.set(0, 0, 0);
  u.wheels.forEach((w) => { w.rotation.y = 0; w.rotation.x = Math.PI / 2; w.rotation.z = 0; }); u.wheels.forEach((w) => { w.rotation.order = 'XYZ'; w.rotation.y = (38 - gx) / 0.65; });
  const crank = !d6 && t >= 42.12 ? (t - 42.12) : 0, rock = crank > 0 && crank < 0.8 ? 0.05 * Math.sin(crank * 30) * (1 - crank / 0.8) : 0;
  u.head.rotation.y = crank > 0 ? -Math.min(crank, 0.6) * 22 : 0; u.body.rotation.z = rock + (t > 40.9 && t < 41.86 ? -0.04 : t >= 41.86 && t < 42.1 ? 0.06 * Math.exp(-(t - 41.86) * 12) * Math.cos((t - 41.86) * 40) : 0);
  if (d6 && t > 59.96) u.body.rotation.z = 0.02 * Math.sin((t - 59.96) * 50) * Math.exp(-(t - 59.96) * 6); }
// the rope round a tied person + post: front arcs face the camera (FOCUS, in front of the card), back arcs never drawn
// the rope = TIGHT LASHINGS round body + post: 3 flattened elliptical wraps hugging the torso / hips / legs (slightly diagonal),
// each made of two halves that meet at the front (so they can snap off cleanly), two diagonal cross turns, a knot with a
// dangling end, and a darker contact strand under every turn. Front arcs only (+z = toward the camera), FOCUS layer.
function sqTexRope() { return tex((g, w, h) => { g.fillStyle = '#c0904e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,56,24,0.55)'; g.lineWidth = 7; for (let x = -h; x < w + h; x += 18) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); }
  g.strokeStyle = 'rgba(255,232,180,0.35)'; g.lineWidth = 3; for (let x = -h + 7; x < w + h; x += 18) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h, 0); g.stroke(); } }, 128, 32); }
function sqLashBuild(s, who) { const p = s.p[who], by = sqBodyY(p), k = who === 'thirty' ? 1.1 : 1, b = 0.78;
  const ropeM = SQ.ropeM ||= c3Prop('#ffffff', { map: sqRep(sqTexRope(), 9, 1), rough: 0.9 }), darkM = SQ.ropeD ||= c3Prop('#5a3a1e', { rough: 1 });
  const g = new THREE.Group(); s.scene.add(g); const W = [[by.belly + 0.55, 1.72 * k, 0.12], [by.belly - 0.55, 1.6 * k, -0.1], [by.knee + 0.15, 1.2 * k, 0.08]];
  const pt = (w, th, dz = 0) => V3(w[1] * Math.sin(th), w[0] + w[2] * w[1] * Math.sin(th), (b + dz) * Math.cos(th));
  const tube = (P, r, m) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(P), 28, r, 7), m);
  const strand = (par, P, r = 0.2) => { par.add(tube(P, r, ropeM)); par.add(tube(P.map((q) => q.clone().add(V3(0, -0.14, -0.05))), 0.07, darkM)); };
  const wraps = W.map((w) => { const half = (sg) => { const h = new THREE.Group(), P = []; for (let i = 0; i <= 12; i++) P.push(pt(w, sg * (i / 12) * 1.78)); strand(h, P, 0.165); g.add(h); return h; }; return { L: half(-1), R: half(1) }; });
  const cross = [[W[0], -0.8, W[2], 0.62], [W[0], 0.85, W[1], -0.35]].map(([wa, ta, wb, tb]) => { const c = new THREE.Group(), A = pt(wa, ta, 0.06), B = pt(wb, tb, 0.06), Mx = A.clone().lerp(B, 0.5).add(V3(0, 0, 0.12)); strand(c, [A, Mx, B], 0.17); g.add(c); return c; });
  const knot = new THREE.Group(), K0 = pt(W[0], 0.32, 0.12); knot.position.copy(K0); knot.add(sqSph(0.34, ropeM, -0.16, 0, 0, 10, 8)); knot.add(sqSph(0.3, ropeM, 0.18, -0.05, 0.05, 10, 8)); knot.add(sqSph(0.14, darkM, 0.01, -0.02, 0.22, 6, 5));
  const end = tube([V3(0.1, -0.1, 0.1), V3(0.35, -0.7, 0.2), V3(0.2, -1.3, 0.25), V3(0.4, -1.8, 0.2)], 0.15, ropeM); knot.add(end); g.add(knot);
  c3Layer(g, C3.L_FOCUS); g.traverse((m) => { if (m.isMesh) m.castShadow = false; });
  return { g, wraps, cross, knot, K0, end, W }; }
// the lashing drawn INTO the tied person's card (same look as the canal set, cnDrawRope): 3 flattened diagonal wraps that
// follow the bean torso, a crossing diagonal turn, outline + twist marks + highlight + contact shadow, ends turning away behind
// him to the post, a 3-lobe knot and a dangling end. p.sqRope = tightness per wrap (null = no rope drawn).
function sqDrawRope(g, p, st) { const R0 = p.sqRope; if (!R0) return; const d = t3Dims(p.o), sq = st.squash || 0, tb = 975 - d.legL + 0.05 * d.HH, top = tb - d.Th * (1 - 0.08 * sq), cx = 300 + (st.lean || 0) * 40;
  const hwAt = (f) => (d.tw / 2) * (0.84 + 0.16 * Math.sin(Math.PI * clamp(f))) * (1 + 0.06 * sq) + 26;
  const rope = (pts, w) => { const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); g.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); };
    g.lineCap = 'round'; g.save(); g.translate(0, 5); path(); g.strokeStyle = 'rgba(40,20,30,0.32)'; g.lineWidth = w + 10; g.stroke(); g.restore();
    path(); g.strokeStyle = '#5a3418'; g.lineWidth = w + 4; g.stroke(); path(); g.strokeStyle = '#d6a058'; g.lineWidth = w; g.stroke();
    g.save(); g.translate(0, -w * 0.22); path(); g.strokeStyle = 'rgba(255,236,190,0.55)'; g.lineWidth = w * 0.25; g.stroke(); g.restore();
    const n = 26; g.strokeStyle = 'rgba(110,62,26,0.75)'; g.lineWidth = 2.2; for (let i = 1; i < n; i++) { const u = i / n, a = 1 - u, x = a * a * pts[0][0] + 2 * a * u * pts[1][0] + u * u * pts[2][0], y = a * a * pts[0][1] + 2 * a * u * pts[1][1] + u * u * pts[2][1];
      g.beginPath(); g.moveTo(x - w * 0.22, y - w * 0.42); g.lineTo(x + w * 0.22, y + w * 0.42); g.stroke(); } };
  const wraps = [0.2, 0.47, 0.75], W0 = 15;
  wraps.forEach((f, i) => { const k = R0[i] ?? 1; if (k <= 0) return; const sc = lerp(1.75, 1, k), y = top + d.Th * f - (1 - k) * 40, hw = hwAt(f) * sc, tilt = (i - 1) * 4 + 5, sag = 10 + 8 * f;
    rope([[cx - hw, y - tilt], [cx, y + sag * 2], [cx + hw, y + tilt]], W0);
    if (k > 0.95) for (const sx of [-1, 1]) { g.fillStyle = 'rgba(40,20,10,0.45)'; g.beginPath(); g.ellipse(cx + sx * hw, y + sx * tilt + 2, 7, 9, 0, 0, TAU); g.fill(); } });
  const kAll = Math.min(...wraps.map((_, i) => R0[i] ?? 1));
  if (kAll > 0.95) { const y0 = top + d.Th * 0.2, y1 = top + d.Th * 0.75; rope([[cx - hwAt(0.2) * 0.92, y0 + 2], [cx - 10, (y0 + y1) / 2 + 10], [cx + hwAt(0.75) * 0.9, y1 + 8]], W0 * 0.9);
    const kx = cx + hwAt(0.47) * 0.32, ky = top + d.Th * 0.47 + 22;
    g.fillStyle = '#5a3418'; for (const [ox, oy, r] of [[-9, -2, 13], [9, 3, 13], [0, 0, 11]]) { g.beginPath(); g.arc(kx + ox, ky + oy, r + 2, 0, TAU); g.fill(); }
    g.fillStyle = '#d6a058'; for (const [ox, oy, r] of [[-9, -2, 13], [9, 3, 13], [0, 0, 11]]) { g.beginPath(); g.arc(kx + ox, ky + oy, r - 1, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(110,62,26,0.8)'; g.lineWidth = 2.5; for (const ox of [-9, 9]) { g.beginPath(); g.arc(kx + ox, ky, 7, 0.4, 2.6); g.stroke(); }
    g.fillStyle = 'rgba(255,236,190,0.6)'; g.beginPath(); g.arc(kx - 5, ky - 7, 3.5, 0, TAU); g.fill();
    const sw = Math.sin((st.t || 0) * 2.2) * 6; rope([[kx + 4, ky + 10], [kx + 18 + sw, ky + 70], [kx + 8 + sw * 1.6, ky + 125]], W0 * 0.85);
    g.strokeStyle = '#d6a058'; g.lineWidth = 3; for (const a of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(kx + 8 + sw * 1.6, ky + 125); g.lineTo(kx + 8 + sw * 1.6 + Math.sin(a) * 12, ky + 138); g.stroke(); } } }
function sqRopeAt(s, who, t, post, _tag, mode) { const R = s.ropes[who] ||= sqLashBuild(s, who);
  // the drawn lashing does the tied part; the 3D rope only exists for the release (a pile that drops, 47.64) and the sneeze snap (59.96)
  if (!mode || (mode === 'drop' && t < 47.64) || (mode === 'pop' && t < 59.96)) { R.g.visible = false; return; } R.g.visible = true;
  let dir; if (mode === 'drop') { const c = c3CamAt(CAMSEQ.square, 47.64).p; dir = V3(c[0] - post.x, 0, c[2] - post.z).normalize(); } else dir = sqToCam(s, post);
  R.g.position.copy(post).addScaledVector(dir, 0.8); R.g.rotation.set(0, Math.atan2(dir.x, dir.z), 0);
  R.wraps.forEach((w) => { for (const h of [w.L, w.R]) { h.visible = true; h.position.set(0, 0, 0); h.rotation.set(0, 0, 0); } }); R.cross.forEach((c) => { c.visible = true; c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); });
  R.knot.visible = true; R.knot.position.copy(R.K0); R.knot.rotation.set(0, 0, 0); R.end.rotation.set(0, 0, 0.12 * Math.sin(t * 2.3));
  if (mode === 'drop' && t >= 47.64) { const u = clamp((t - 47.64) / 0.32) ** 2;   // the lashing slides down to the ground in one move and stays there
    R.wraps.forEach((w, i) => { const dy = lerp(0, 0.22 + i * 0.13 - R.W[i][0], u); for (const h of [w.L, w.R]) { h.position.y = dy; h.position.z = 0.15 * u * i; } });
    R.cross.forEach((c) => { c.visible = u < 0.05; }); R.knot.position.y = lerp(R.K0.y, 0.35, u); R.end.rotation.z = lerp(0, 1.3, u); }
  if (mode === 'pop' && t >= 59.96) { const k = t - 59.96;   // the sneeze: each wrap snaps into two clean segments flying outward, the cross turns and the knot fly off
    R.wraps.forEach((w, i) => { const sp = 8 + 2.5 * i, up = 5 + 1.5 * i; w.L.position.set(-k * sp, k * up - 9 * k * k, k * 2.2); w.L.rotation.set(0, -k * 1.5, k * (2.4 + i * 0.6)); w.R.position.set(k * sp, k * up - 9 * k * k, k * 2.2); w.R.rotation.set(0, k * 1.5, -k * (2.4 + i * 0.6)); });
    R.wraps[0].R.visible = false; R.wraps[1].L.visible = false; R.wraps[2].R.visible = false; R.cross.forEach((c) => { c.visible = false; }); R.knot.visible = false; } }
// hair flutter on the sneeze: little strands flicking up off the side tufts, drawn into the card (with ink)
function sqHair(p, k, t) { if (k <= 0.02 || !p.cv) return; const g = p.cv.getContext('2d'), d = t3Dims(p.o), hy = 975 - (d.legL + d.Th + d.HH * 0.42), hr = d.HH * 0.5;
  g.save(); g.setTransform(p.k, 0, 0, p.k, 0, 0); g.lineCap = 'round';
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const x0 = 300 + sx * hr * 0.9, y0 = hy + hr * (0.1 - 0.13 * i), L = hr * (0.2 + 0.05 * (i % 2)) * k, a = -Math.PI / 2 + sx * (1.25 + 0.1 * i) + 0.45 * Math.sin(t * 38 + i * 1.7 + sx) * k;
    const x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L, cx = (x0 + x1) / 2 + sx * 10 * Math.sin(t * 30 + i), cy = (y0 + y1) / 2;
    for (const [lw, c] of [[9, '#2a1810'], [5, '#6a3e22']]) { g.lineWidth = lw; g.strokeStyle = c; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke(); } }
  g.restore(); p.tex.needsUpdate = true; if (p.lv && p.lv[p.k]) p.lv[p.k].last = null; }
function sqSignAt(s, sign, who, t, drop = 1) { const p = s.p[who], by = sqBodyY(p); sign.visible = drop > 0.01; if (!sign.visible) return;
  p.root.updateMatrixWorld(true); const pos = p.root.localToWorld(V3(0, by.chest, 0.32)); sign.position.copy(pos); p.root.getWorldQuaternion(sign.quaternion); sign.rotateZ(0.06 * Math.sin(t * 2.1 + who.length) + (1 - Math.min(1, drop)) * 0.5); sign.scale.setScalar(Math.max(0.01, drop)); }
// the crowd (d04): walk in from the edges as the street 'joins in', phones up on 'everyone', flashes on 'pictures'
const SQ_CROWD = [['sqA', -23, -16, 44.55], ['sqB', -20, -23.5, 44.7], ['stranger', -9.5, -28, 44.9], ['sqC', 9.5, -28, 44.8], ['sqD', 15, -24, 44.6], ['passer', 19.5, -18, 44.75], ['sqE', 0, -22.5, 45.0]];   // in the gaps between the tied guys' heads
function sqCrowd(s, t) { if (t < 44.4) return; const C = V3(0, 0, -12);
  SQ_CROWD.forEach(([who, x, z, t0], i) => { const E = V3(x, 0, z), A = V3(x + (x <= 0 ? -16 : 16), 0, z - 4), [P, wk] = sqWalk(s, t, A, E, t0, t0 + 1.55, 4.2), up = t >= 46.6 + i * 0.04;
    const o = Object.assign({ expr: [[0, 'excited'], [45.9, 'happy'], [46.6, 'excited'], [47.16 + i * 0.04, 'grin']], hand: { R: up ? [[46.6 + i * 0.04, { h: [0.36, -0.22], pole: [1, 0.7], hand: 'grip' }]] : 'down', L: up && i % 2 ? [[46.7, 'hip']] : 'down' } }, wk || { look: [x * 0.3, -12] });
    pose(s, who, t, P.x, P.z, o);
    if (up) { const ph = s.phones[i]; gripProp(s, ph, who, 'R', V3(0, -0.4, 0), { ry: Math.atan2(s.cam.position.x - P.x, s.cam.position.z - P.z) + Math.PI, behind: -0.2 }); gripDot(s, who, 'R');
      const fl = s.flashes[i], tf = [47.16, 47.22, 47.3, 47.18, 47.26, 47.34, 47.2][i], k = Math.max(t >= tf && t < tf + 0.16 ? 1 - (t - tf) / 0.16 : 0, t >= tf + 0.3 && t < tf + 0.42 && i % 2 ? 1 - (t - tf - 0.3) / 0.12 : 0);
      if (k > 0) { fl.visible = true; fl.position.copy(ph.position).add(V3(0, 0.4, 0)).addScaledVector(V3().subVectors(s.cam.position, ph.position).normalize(), 0.3); fl.quaternion.copy(s.cam.quaternion); fl.scale.setScalar(0.4 + 1.1 * k); fl.material.opacity = k; } } }); }

const SQ_EXP0 = COLOR.square.exp;
function sqFrame(t) { const s = SQ_get(); hideAll(s); hideGrips(s); sqSky(s, t); const d6 = SQ_DUSK(t); COLOR.square.exp = d6 ? SQ_EXP0 * 0.64 : SQ_EXP0;   // dusk: darker exposure (this set owns COLOR.square)
  [s.grinder, s.sign25, s.sign30, s.jar, ...s.balloons, ...s.phones, ...s.flashes, ...s.wisps].forEach((m) => { m.visible = false; }); for (const k in s.ropes) s.ropes[k].g.visible = false; s.faceL.intensity = d6 ? 1.5 : 0;
  const cam = seqCam(s, 'square', t);
  // flags, bunting (stronger in the happy beat), the lamppost shake on the sneeze
  const wind = d6 ? 0.6 : t >= 42.72 && t < 45.6 ? 1.6 : 1;
  s.flags.forEach((f) => { const P = f.geometry.attributes.position, b = f.userData.base, sc = f.userData.sc; for (let i = 0; i < P.count; i++) { const px = b[i * 3] / sc, k = px / 12; P.setZ(i, (Math.sin(px * 0.5 - t * 5.2 * wind + f.userData.ph) * 1.3 * k + Math.sin(b[i * 3 + 1] / sc * 0.3 - t * 3) * 0.35 * k) * sc * wind); } P.needsUpdate = true; f.geometry.computeVertexNormals(); });
  s.bunt.forEach((b) => { b.children[0].rotation.x = 0.28 * wind * Math.sin(t * 3.4 * Math.min(wind, 1.3) + b.userData.ph); });
  s.roll.rotation.z = 0.025 * Math.sin(t * 1.3);
  s.post2.rotation.set(0, 0, 0); s.post2.position.copy(SQ_P2);
  if (d6 && t >= 59.96) { const k = t - 59.96, a = Math.exp(-k * 5); s.post2.rotation.z = 0.045 * a * Math.sin(k * 34); s.post2.rotation.x = 0.025 * a * Math.cos(k * 29); }
  const look = c3CamAt(CAMSEQ.square, t).l; sqShadowAt(s, look[0], look[2]);
  s.p.thirty.sqRope = d6 && t >= 59.96 ? null : [1, 1, 1]; s.p.hero.sqRope = !d6 && t < 47.64 ? [1, 1, 1] : null;
  const PT = sqThirty(s, t);
  sqRopeAt(s, 'thirty', t, SQ_P2, 'tied', d6 ? 'pop' : null);
  sqSignAt(s, s.sign30, 'thirty', t, d6 ? 1 : t < 40.24 ? 0 : EZ.back(clamp((t - 40.24) / 0.28)));
  s.sign30.material.map = d6 || t > 42.45 ? s.sign30p : s.sign30c;
  sqGrinderAt(s, t);
  const E = [];
  if (!d6) {
    const PH = sqHero(s, t); sqSignAt(s, s.sign25, 'hero', t, 1);
    if (t < 47.92) sqRopeAt(s, 'hero', t, SQ_P1, 'tied', t >= 47.64 ? 'drop' : null); else { sqRopeAt(s, 'hero', 47.92, SQ_P1, 'tied', 'drop'); }
    sqSpice(s, t); sqFriends(s, t); sqCrowd(s, t);
    // d01: gentle cinnamon from the shaker (37.2-39), a soft poof on 'cinnamon'; d02: the pepper burst on 'pepper'
    if (t < 42.82 && s.jar.visible) { s.jar.updateMatrixWorld(true); const mo = s.jar.localToWorld(V3(0, 1.1, 0)); s.jarMouth = mo; }
    const mo = s.jarMouth || V3(-7, 13, -15), hb = sqBodyY(s.p.hero);
    E.push({ t0: 37.2, t1: 39.0, n: 30, o: [mo.x, mo.y, mo.z], v: [0.9, -2.6, 0.5], spr: 0.6, g: -1.2, life: 1.3, s0: 0.35, s1: 1.4, a: 0.85, col: ['#b8743a', '#d49a5a'], seed: 'sprk' });
    E.push({ t0: 37.36, t1: 37.5, n: 12, o: [SQ_P1.x + 0.6, hb.head + 1.6, SQ_P1.z + 1.2], v: [0, 0.4, 0], spr: 1.6, drag: 2.2, g: -0.8, life: 1.4, s0: 0.8, s1: 2.6, a: 0.75, col: ['#c8844a', '#e0a868'], seed: 'poof' });
    const gt = s.grinder.userData.head.localToWorld(V3(0, 3.6, 0)), tb = sqBodyY(s.p.thirty);
    E.push({ t0: 42.26, t1: 42.4, n: 40, o: [gt.x, gt.y, gt.z], v: [-14, 3.5, -1.6], spr: 3, drag: 1.3, g: -9, life: 1.6, s0: 1.0, s1: 4.4, a: 0.88, col: ['#3a3434', '#5a5252'], seed: 'pburst' });
    { const bk = sqToCam(s, SQ_P2); E.push({ t0: 42.36, t1: 42.6, n: 18, o: [PT.x - bk.x * 1.0, tb.chest + 1.4, PT.z - bk.z * 1.0], v: [0, 0.8, 0], spr: 3.6, drag: 2.0, g: -0.6, life: 1.4, s0: 1.6, s1: 5.0, a: 0.8, col: ['#4a4444', '#6a6260'], seed: 'pcloud' });
      E.push({ t0: 42.3, t1: 42.42, n: 26, o: [PT.x + bk.x * 1.4, tb.chest - 0.4, PT.z + bk.z * 1.4], v: [0, 1.2, 0], spr: 5.5, drag: 2.6, g: -1.2, life: 1.15, s0: 1.2, s1: 5.2, a: 0.86, col: ['#3e3838', '#5e5654'], seed: 'pfront' }); }
    // balloons rise from behind the posts (d03 on), sway; scent wisps trail the hero (d05)
    s.balloons.forEach((b, i) => { const R = RNG('sqbal', i), t0 = 42.9 + i * 0.07, a = t - t0; if (a < 0) return; b.visible = true; const x0 = -9 + i * 1.6 + R.n(0.6), z0 = -16.6 - R.r(0, 2.5);
      b.position.set(x0 + 1.2 * Math.sin(a * 1.4 + i) + a * 0.6 * R.n(1), 6 + a * R.r(3.8, 5.2) + 0.6 * Math.sin(a * 2 + i), z0 - a * 1.2); b.rotation.z = 0.12 * Math.sin(a * 1.8 + i); });
    if (t >= 47.86) s.wisps.forEach((m, i) => { const lag = 0.18 + i * 0.22, a = (t - 47.86 - i * 0.3) % 1.6; if (t - 47.86 < i * 0.3) return; const R = RNG('sqw', i), back = sqWalk(s, t - lag, V3(-5.4, 0, -12.9), V3(-12.5, 0, -26), 47.86, 49.9)[0];
      m.visible = true; m.position.set(back.x + 1.2 * Math.sin(a * 3 + i) + R.n(0.8), 6.5 + a * 3.2, back.z + R.n(0.6)); m.quaternion.copy(cam.quaternion); m.rotateZ(0.2 * Math.sin(a * 2 + i)); m.scale.setScalar(0.8 + a * 0.4); m.material.opacity = 0.75 * Math.min(1, a / 0.2) * (1 - a / 1.6); });
  } else {
    sqRopeAt(s, 'hero', 47.92, SQ_P1, 'tied', 'drop');   // the empty post: the rope still lies at its foot
    const tb = sqBodyY(s.p.thirty), dir = V3().subVectors(cam.position, V3(PT.x, tb.head, PT.z)).normalize();
    // pepper shaken off as he jolts; the GIANT sneeze cloud blasting toward the camera
    E.push({ t0: 59.36, t1: 59.9, n: 8, o: [PT.x, tb.chest, PT.z + 0.3], v: [0, -0.8, 0], spr: 1.0, g: -2, life: 0.8, s0: 0.3, s1: 0.9, a: 0.6, col: ['#4a4444', '#6a6260'], seed: 'shake' });
    { const rt = V3(1, 0, 0).applyQuaternion(cam.quaternion), v = dir.clone().multiplyScalar(24).addScaledVector(rt, -7).add(V3(0, -2.2, 0)), o = [PT.x + dir.x * 1.3 - rt.x * 1.7, tb.head - 1.2, PT.z + dir.z * 1.3 - rt.z * 1.7];
      // the GIANT sneeze: a dense core bursting out of his mouth (camera-left of the face, so the face reads at the start), a slower
      // billowing layer that fills ~half the frame by 60.3, flecks shooting ahead, and a ring puffed off his body
      E.push({ t0: 59.96, t1: 60.06, n: 80, o, v: [v.x, v.y, v.z], spr: 6.5, drag: 2.5, g: -1, life: 1.3, s0: 0.5, s1: 8.5, a: 0.9, col: ['#3e3838', '#5c5452'], seed: 'sneeze' });
      E.push({ t0: 60.0, t1: 60.2, n: 45, o, v: [v.x * 0.55, v.y * 0.55 + 0.8, v.z * 0.55], spr: 5, drag: 1.8, g: -0.6, life: 1.3, s0: 1.4, s1: 10, a: 0.82, col: ['#5a5250', '#7a706c'], seed: 'billow' });
      E.push({ t0: 59.96, t1: 60.12, n: 34, o, v: [v.x * 1.5, v.y * 1.5, v.z * 1.5], spr: 11, drag: 1.0, g: -4, life: 0.9, s0: 0.18, s1: 0.4, a: 0.95, col: ['#2e2828', '#4a4242'], seed: 'fleck' }); }
    E.push({ t0: 59.97, t1: 60.1, n: 24, o: [PT.x, tb.chest, PT.z], v: [0, 1, 0], spr: 9, drag: 3.2, g: -1.5, life: 1.0, s0: 1.2, s1: 4.5, a: 0.65, col: ['#5a5252', '#7e7672'], seed: 'ring' });
  }
  sqPuffs(s, t, E);
  c3Render(s.scene, cam, { bg: d6 ? '#3a2a6a' : '#f0b48a', bgBlur: 1.6, glow: d6 ? 0.55 : 0.3, glowBlur: 12 });
}
for (const id of ['d01', 'd02', 'd03', 'd04', 'd05', 'd06']) { SHOT_FN[id] = (t) => sqFrame(t); SNAPS[id] = 'free'; }

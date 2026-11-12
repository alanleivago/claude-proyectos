// =====================================================================
//  SET street — an Ankara (Çankaya) street. Dawn for 0–17.06 s (peach-pink sky, low warm sun), full morning for
//  52.82–61 s. Far side (z < -38): low apartment blocks with balconies, laundry, satellite dishes, shops; across from the
//  truck a small square (park, flagpole with the Turkish flag) through which a mosque (dome + 2 minarets) shows; a second
//  mosque closes the street at +x. Far sidewalk: tall street clock, simit cart, green municipal containers, black bags.
//  The orange ÇANKAYA rear-loader truck (rear at x = ST_TX(t), centre z = ST_TZ, cab at +x): lifter, tailgate with the
//  hopper + compactor blade, back steps, cab door + book crate, and a cosy mini library inside the body (closing gag).
//  ONE continuous take per time range: camera = seqCam(s, 'street', t) (CAMSEQ.street). Prefix ST.
//  Registers s01 s02 s03 s04 s05 s06 g1 s07 s22 s23 s24 s25.
// =====================================================================
const ST = {};
const ST_TZ = -6;   // truck centre line (z); its sidewalk-side flank is z = -14, the far curb z = -20
Object.assign(CAST.passer, { hair: 'bob' });   // v2: the 'long' hair read as a block over her face; bob sits on the head
// truck rear x: rolls in and stops at 2.4 s; pulls away from 58.5 s
const ST_TX = (t) => t < 2.4 ? -36 * (1 - t / 2.4) ** 2 : t > 58.5 ? 26 * clamp((t - 58.5) / 2.5) ** 2 : 0;
const ST_DAWN = (t) => t < 30;
const stAt = (o, x, y, z, ry = 0, rx = 0, rz = 0) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); return o; };
const stRep = (t, a, b) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(a, b); return t; };
const stSnap = (t, t0, d = 0.33) => { const x = clamp((t - t0) / d); return 1 - (1 - x) ** 3; };   // Ricks snap: fast, settled, no bounce

// ---- bake: merge static props per material into vertex-coloured meshes (from lost-luggage ouBake)
function stBake(root, o = {}) { root.updateMatrixWorld(true); const Bk = new Map(), v = new THREE.Vector3(), keep = [];
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
    if (em) { mat.emissive = mt.emissive.clone(); mat.emissiveIntensity = mt.emissiveIntensity; } if (mt.userData.glow) mat.userData.glow = mt.userData.glow;
    const mesh = new THREE.Mesh(geo, mat); mesh.userData.noShade = true; if (o.noCast) mesh.userData.noCast = true; out.add(mesh); }
  return out; }

// ---- textures
function stTexAsphalt() { const t = tex((g, w, h) => { const R = RNG('stasph'); g.fillStyle = '#6c6c72'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(30, 120), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.6 ? 'rgba(20,24,32,0.14)' : 'rgba(255,240,230,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 6000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.08)'; const z = R.r(1, 2.4); g.fillRect(R.r(0, w), R.r(0, h), z, z); }
  for (let i = 0; i < 6; i++) { let x = R.r(0, w), y = R.r(0, h); g.strokeStyle = 'rgba(22,20,30,0.6)'; g.lineWidth = R.r(2, 4); g.beginPath(); g.moveTo(x, y); for (let q = 0; q < 8; q++) { x += R.n(30); y += R.n(30); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 3; i++) { const x = R.r(0, w * 0.8), y = R.r(0, h * 0.8); g.fillStyle = 'rgba(30,30,40,0.25)'; g.fillRect(x, y, R.r(40, 110), R.r(30, 80)); } }, 512, 512); return stRep(t, 1, 1); }
// the road (along x, 40 wide): asphalt + dashed centre line + edge lines
function stTexRoad() { const t = tex((g, w, h) => { const R = RNG('stroad'); g.fillStyle = '#6c6c72'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 5000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (const y of [0.25, 0.75]) { g.fillStyle = 'rgba(20,18,26,0.14)'; g.fillRect(0, h * y - 18, w, 36); }
  g.globalAlpha = 0.85; g.fillStyle = '#ecebe2'; for (let x = 0; x < w; x += 128) g.fillRect(x + 10, h * 0.49, 70, h * 0.02); g.fillRect(0, h * 0.04, w, h * 0.012); g.fillRect(0, h * 0.948, w, h * 0.012); g.globalAlpha = 1;
  for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(108,108,114,0.8)'; g.fillRect(R.r(0, w), h * 0.49 + R.r(0, h * 0.02), 3, 2); } }, 512, 256); return stRep(t, 30, 1); }
// interlocking pavers (kilit taşı): grey with red bands
function stTexPavers() { const t = tex((g, w, h) => { const R = RNG('stpav'); g.fillStyle = '#a08a72'; g.fillRect(0, 0, w, h); const s = 32;
  for (let j = 0; j < h / s; j++) for (let i = 0; i < w / s; i++) { const red = j % 6 === 0; g.fillStyle = c3Shd(red ? '#c4603a' : '#e2bc94', R.r(0.88, 1.06)); g.beginPath(); g.roundRect(i * s + 2 + (j % 2) * s / 2 - s / 2, j * s + 2, s - 4, s - 4, 5); g.fill(); }
  for (let i = 0; i < 1500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let i = 0; i < 14; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(15, 50), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(50,40,30,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }, 256, 256); return t; }
// a block facade: floors of windows (curtains, pots), floor bands, and a ground-floor shop with its sign
function stTexFacade(seed, wall, floors, bays, shop, band) { return tex((g, w, h) => { const R = RNG('stfac', seed), gh = h * 0.27, fh = (h - gh - h * 0.06) / floors, bw = w / bays;
  g.fillStyle = wall; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 30; i++) { const x = R.r(0, w), y = R.r(0, h), r = R.r(20, 80), gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, R.f() < 0.5 ? 'rgba(60,30,30,0.08)' : 'rgba(255,250,240,0.1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  g.fillStyle = '#f2e6d2'; g.fillRect(0, 0, w, h * 0.035); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, h * 0.035, w, 3);
  for (let f = 0; f < floors; f++) { const y0 = h * 0.06 + f * fh; g.fillStyle = '#f2e6d2'; g.fillRect(0, y0 + fh - 7, w, 7); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, y0 + fh, w, 3);
    for (let b = 0; b < bays; b++) { const x0 = b * bw + bw * 0.2, ww = bw * 0.6, wy = y0 + fh * 0.16, wh = fh * 0.62;
      g.fillStyle = '#f6f0e4'; g.fillRect(x0 - 6, wy - 6, ww + 12, wh + 12); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(x0 - 6, wy + wh + 6, ww + 12, 4);
      const gr = g.createLinearGradient(x0, wy, x0 + ww * 0.5, wy + wh); gr.addColorStop(0, '#b8d4f0'); gr.addColorStop(0.6, '#5a82b8'); gr.addColorStop(1, '#2e4a78'); g.fillStyle = gr; g.fillRect(x0, wy, ww, wh);
      if (R.f() < 0.35) { const gw = g.createRadialGradient(x0 + ww / 2, wy + wh / 2, 2, x0 + ww / 2, wy + wh / 2, ww); gw.addColorStop(0, '#ffe2a8'); gw.addColorStop(1, '#e8a868'); g.fillStyle = gw; g.fillRect(x0, wy, ww, wh); }   // a lit kitchen at dawn
      const cc = ['#e84a6a', '#f2c23a', '#ffffff', '#4aa8a0', '#e8762a', '#8a5ac8'][R.i(0, 5)]; if (R.f() < 0.7) { g.fillStyle = cc; g.fillRect(x0, wy, ww * 0.26, wh); g.fillRect(x0 + ww * 0.74, wy, ww * 0.26, wh); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 4; k++) { g.fillRect(x0 + k * ww * 0.065, wy, 2, wh); g.fillRect(x0 + ww * 0.74 + k * ww * 0.065, wy, 2, wh); } }
      g.fillStyle = '#f6f0e4'; g.fillRect(x0 + ww / 2 - 3, wy, 6, wh); g.fillRect(x0, wy + wh * 0.3, ww, 5);
      g.fillStyle = 'rgba(255,255,255,0.3)'; g.beginPath(); g.moveTo(x0 + ww * 0.1, wy + wh); g.lineTo(x0 + ww * 0.3, wy); g.lineTo(x0 + ww * 0.38, wy); g.lineTo(x0 + ww * 0.18, wy + wh); g.fill();
      if (R.f() < 0.4) { g.fillStyle = '#c0623a'; g.fillRect(x0 + ww * 0.15, wy + wh - 14, ww * 0.25, 14); g.fillStyle = '#3a8a3a'; g.beginPath(); g.arc(x0 + ww * 0.27, wy + wh - 18, 11, 0, TAU); g.fill(); g.fillStyle = '#e84a6a'; g.beginPath(); g.arc(x0 + ww * 0.24, wy + wh - 24, 4, 0, TAU); g.fill(); }
      for (let k = 0; k < 2; k++) { const sx = x0 + R.r(0, ww), gs = g.createLinearGradient(0, wy + wh + 10, 0, wy + wh + 10 + fh * 0.4); gs.addColorStop(0, 'rgba(60,40,40,0.16)'); gs.addColorStop(1, 'rgba(60,40,40,0)'); g.fillStyle = gs; g.fillRect(sx, wy + wh + 10, R.r(3, 9), fh * 0.4); } } }
  // ground floor: shop window, door, sign band (side facades: barred windows only)
  const y0 = h - gh; g.fillStyle = c3Shd(wall, 0.82); g.fillRect(0, y0, w, gh);
  if (!shop) { for (let b = 0; b < bays; b++) { const x0 = b * bw + bw * 0.25, ww = bw * 0.5; g.fillStyle = '#f6f0e4'; g.fillRect(x0 - 5, y0 + gh * 0.25 - 5, ww + 10, gh * 0.4 + 10); g.fillStyle = '#3a4a6a'; g.fillRect(x0, y0 + gh * 0.25, ww, gh * 0.4); g.fillStyle = '#2a2a30'; for (let k = 1; k < 6; k++) g.fillRect(x0 + k * ww / 6, y0 + gh * 0.25, 3, gh * 0.4); }
    const gb = g.createLinearGradient(0, h - gh * 0.2, 0, h); gb.addColorStop(0, 'rgba(50,40,40,0)'); gb.addColorStop(1, 'rgba(50,40,40,0.3)'); g.fillStyle = gb; g.fillRect(0, h - gh * 0.2, w, gh * 0.2); return; }
  g.fillStyle = band; g.fillRect(w * 0.03, y0 + gh * 0.04, w * 0.94, gh * 0.24); g.lineWidth = 5; g.strokeStyle = '#2a1a1a'; g.strokeRect(w * 0.03, y0 + gh * 0.04, w * 0.94, gh * 0.24);
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(w * 0.03, y0 + gh * 0.04, w * 0.94, gh * 0.05);
  inked(g, shop, w / 2, y0 + gh * 0.165, gh * 0.15, '#fff6e2', { stroke: '#2a1a1a', sw: 5, maxW: w * 0.82 });
  g.fillStyle = '#2a2230'; g.fillRect(w * 0.05, y0 + gh * 0.34, w * 0.58, gh * 0.62); const X0 = w * 0.07, Y0 = y0 + gh * 0.37, WW = w * 0.54, HH = gh * 0.5;
  const gi = g.createLinearGradient(0, Y0, 0, Y0 + HH); gi.addColorStop(0, '#4a4a60'); gi.addColorStop(1, '#6a5a58'); g.fillStyle = gi; g.fillRect(X0, Y0, WW, HH);
  for (let s2 = 0; s2 < 2; s2++) { const y = Y0 + HH * (0.45 + s2 * 0.42); g.fillStyle = '#9a8a74'; g.fillRect(X0, y, WW, 4); let x = X0 + 6; while (x < X0 + WW - 16) { const bw2 = R.r(10, 22), bh = R.r(12, 26); g.fillStyle = ['#e84a3a', '#f2c23a', '#3a9a5a', '#e8eef6', '#8a4aa8', '#2f6fb8', '#e8862a'][R.i(0, 6)]; g.fillRect(x, y - bh, bw2, bh); x += bw2 + R.r(2, 7); } }
  g.fillStyle = 'rgba(255,240,230,0.28)'; g.beginPath(); g.moveTo(X0 + WW * 0.12, Y0 + HH); g.lineTo(X0 + WW * 0.32, Y0); g.lineTo(X0 + WW * 0.42, Y0); g.lineTo(X0 + WW * 0.22, Y0 + HH); g.fill();
  g.fillStyle = '#3a2a24'; g.fillRect(w * 0.7, y0 + gh * 0.34, w * 0.24, gh * 0.66); g.fillStyle = c3Shd(band, 0.8); g.fillRect(w * 0.72, y0 + gh * 0.37, w * 0.2, gh * 0.63);
  g.fillStyle = '#b8d0e8'; g.fillRect(w * 0.745, y0 + gh * 0.42, w * 0.15, gh * 0.28); g.fillStyle = '#e8c04a'; g.beginPath(); g.arc(w * 0.9, y0 + gh * 0.76, 5, 0, TAU); g.fill();
  const gb = g.createLinearGradient(0, h - gh * 0.2, 0, h); gb.addColorStop(0, 'rgba(50,40,40,0)'); gb.addColorStop(1, 'rgba(50,40,40,0.3)'); g.fillStyle = gb; g.fillRect(0, h - gh * 0.2, w, gh * 0.2); }, 512, 768); }
// a distant block's wall tile (2 bays x 2 floors, coloured wall, framed windows with curtains, balcony slab shadows, an AC box)
function stTexDistant(seed, wall) { const t = tex((g, w, h) => { const R = RNG('stdist', seed); g.fillStyle = wall; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const x0 = i * w / 2 + 14, y0 = j * h / 2 + 12, ww = w / 2 - 28, hh = h / 2 - 34;
    g.fillStyle = '#f6eee0'; g.fillRect(x0 - 4, y0 - 4, ww + 8, hh + 8); const lit = R.f() < 0.18, gr = g.createLinearGradient(0, y0, 0, y0 + hh); gr.addColorStop(0, lit ? '#ffe2a0' : '#7aa2d0'); gr.addColorStop(1, lit ? '#f0a860' : '#2e4a7a'); g.fillStyle = gr; g.fillRect(x0, y0, ww, hh);
    g.fillStyle = ['#e84a5a', '#f2c23a', '#ffffff', '#3aa8a0', '#e8762a'][R.i(0, 4)]; g.fillRect(x0, y0, ww * 0.22, hh); g.fillStyle = '#f6eee0'; g.fillRect(x0 + ww / 2 - 2, y0, 4, hh);
    g.fillStyle = 'rgba(30,20,40,0.28)'; g.fillRect(i * w / 2, (j + 1) * h / 2 - 16, w / 2, 6); g.fillStyle = 'rgba(255,248,236,0.85)'; g.fillRect(i * w / 2, (j + 1) * h / 2 - 22, w / 2, 6);
    if (R.f() < 0.35) { g.fillStyle = '#eeeeea'; g.fillRect(x0 + ww + 2, y0 + hh - 16, 14, 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x0 + ww + 4, y0 + hh - 14, 10, 1); g.fillRect(x0 + ww + 4, y0 + hh - 10, 10, 1); } } }, 128, 128); return stRep(t, 1, 1); }
// a box whose face UVs repeat a tile every (tu x tv) world units (so one texture fits any size)
function stBoxT(w, h, d, mat, x, y, z, tu = 24, tv = 28) { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, S = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * S[f][0] / tu, uv.getY(i) * S[f][1] / tv); }
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; }
const stBox = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
const stCyl = (r0, r1, h, mat, x, y, z, seg = 16, open = false) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg, 1, open), mat); m.position.set(x, y, z); return m; };
const stSph = (r, mat, x, y, z, hemi = false, ws = 20, hs = 10) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs, 0, TAU, 0, hemi ? Math.PI / 2 : Math.PI), mat); m.position.set(x, y, z); return m; };
// a hip roof (4 tiled slopes, ridge along x) over a w x d footprint, eaves at y = 0; uv in tile units
function stHipRoof(w, d, h, mat) { const a = w / 2, b = d / 2, r = Math.max(0, a - b), P = [], U = [];
  const quad = (p, uvs) => { [0, 1, 2, 0, 2, 3].forEach((i) => { P.push(...p[i]); U.push(...uvs[i]); }); }, sl = Math.hypot(b, h);
  quad([[-a, 0, b], [a, 0, b], [r, h, 0], [-r, h, 0]], [[0, 0], [w / 3, 0], [(a + r) / 3, sl / 1.6], [(a - r) / 3, sl / 1.6]]);
  quad([[a, 0, -b], [-a, 0, -b], [-r, h, 0], [r, h, 0]], [[0, 0], [w / 3, 0], [(a + r) / 3, sl / 1.6], [(a - r) / 3, sl / 1.6]]);
  const sa = Math.hypot(a - r, h); quad([[a, 0, b], [a, 0, -b], [r, h, 0], [r, h, 0]], [[0, 0], [d / 3, 0], [b / 3, sa / 1.6], [b / 3, sa / 1.6]]);
  quad([[-a, 0, -b], [-a, 0, b], [-r, h, 0], [-r, h, 0]], [[0, 0], [d / 3, 0], [b / 3, sa / 1.6], [b / 3, sa / 1.6]]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); geo.computeVertexNormals(); return new THREE.Mesh(geo, mat); }
function stTexTiles() { const t = tex((g, w, h) => { const R = RNG('sttile'); g.fillStyle = '#b8502e'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 9; i++) { const x = i * w / 8 + (j % 2) * w / 16 - w / 16, y = j * h / 8; g.fillStyle = c3Shd(R.f() < 0.15 ? '#9a3e24' : '#d0643a', R.r(0.9, 1.08)); g.beginPath(); g.ellipse(x + w / 16, y + h / 10, w / 17, h / 9, 0, 0, Math.PI); g.fill();
    g.fillStyle = 'rgba(255,220,180,0.22)'; g.fillRect(x + w / 32, y + h / 14, w / 30, h / 30); }
  for (let j = 0; j < 8; j++) { g.fillStyle = 'rgba(70,20,10,0.35)'; g.fillRect(0, j * h / 8, w, 2); } }, 128, 128); return stRep(t, 1, 1); }
// ---- the Ottoman mosque: cut stone walls with two rows of arched windows, a windowed drum, lead domes with ribs, minaret flutes, şerefe lattice
function stTexMosqueWall() { return tex((g, w, h) => { const R = RNG('stmw'); g.fillStyle = '#f4e2c2'; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(150,100,60,0.16)'; g.lineWidth = 1; for (let y = 0; y < h; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = ((y / 9) % 2) * 11; x < w; x += 22) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 9); g.stroke(); } }
  for (let i = 0; i < 600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(120,80,40,0.06)' : 'rgba(255,255,255,0.08)'; g.fillRect(R.r(0, w), R.r(0, h), 3, 3); }
  g.fillStyle = '#e0c69e'; g.fillRect(0, h * 0.47, w, 7); g.fillRect(0, h - 16, w, 16); g.fillRect(0, 0, w, 7);
  const win = (cx, y0, ww, hh) => { g.fillStyle = '#d6b88c'; g.beginPath(); g.moveTo(cx - ww / 2 - 5, y0 + hh + 5); g.lineTo(cx - ww / 2 - 5, y0 + ww / 2); g.arc(cx, y0 + ww / 2, ww / 2 + 5, Math.PI, 0); g.lineTo(cx + ww / 2 + 5, y0 + hh + 5); g.fill();
    const gr = g.createLinearGradient(0, y0, 0, y0 + hh); gr.addColorStop(0, '#4a6a9a'); gr.addColorStop(1, '#1e2c4e'); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - ww / 2, y0 + hh); g.lineTo(cx - ww / 2, y0 + ww / 2); g.arc(cx, y0 + ww / 2, ww / 2, Math.PI, 0); g.lineTo(cx + ww / 2, y0 + hh); g.fill();
    g.strokeStyle = 'rgba(246,228,190,0.75)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, y0 + 3); g.lineTo(cx, y0 + hh); g.moveTo(cx - ww / 2, y0 + hh * 0.55); g.lineTo(cx + ww / 2, y0 + hh * 0.55); g.stroke(); };
  for (let i = 0; i < 7; i++) { const cx = (i + 0.5) * w / 7; win(cx, h * 0.12, 22, 72); win(cx, h * 0.56, 28, 84); }
  for (let i = 0; i < 6; i++) { g.fillStyle = '#d6b88c'; g.beginPath(); g.arc((i + 1) * w / 7, h * 0.36, 6, 0, TAU); g.fill(); g.fillStyle = '#2e4470'; g.beginPath(); g.arc((i + 1) * w / 7, h * 0.36, 4, 0, TAU); g.fill(); } }, 512, 256); }
function stTexDrum() { return tex((g, w, h) => { g.fillStyle = '#f4e2c2'; g.fillRect(0, 0, w, h); g.fillStyle = '#e0c69e'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 12, w, 12);
  for (let i = 0; i < 20; i++) { const cx = (i + 0.5) * w / 20, ww = 20, y0 = 26, hh = 74; g.fillStyle = '#d6b88c'; g.beginPath(); g.moveTo(cx - 14, y0 + hh + 4); g.lineTo(cx - 14, y0 + 10); g.arc(cx, y0 + 10, 14, Math.PI, 0); g.lineTo(cx + 14, y0 + hh + 4); g.fill();
    g.fillStyle = '#25365e'; g.beginPath(); g.moveTo(cx - ww / 2, y0 + hh); g.lineTo(cx - ww / 2, y0 + 10); g.arc(cx, y0 + 10, ww / 2, Math.PI, 0); g.lineTo(cx + ww / 2, y0 + hh); g.fill(); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i * w / 20, 10, 3, h - 22); } }, 1024, 128); }
function stTexDome() { return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9aa8c4'); gr.addColorStop(1, '#7686a8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 32; i++) { const x = i * w / 32; g.fillStyle = 'rgba(40,50,80,0.28)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 3, 0, 2, h); }
  for (let y = 0; y < h; y += 22) { g.fillStyle = 'rgba(40,50,80,0.1)'; g.fillRect(0, y, w, 1); } g.fillStyle = '#e0c69e'; g.fillRect(0, h - 8, w, 8); }, 512, 256); }
function stTexMinaret() { return tex((g, w, h) => { g.fillStyle = '#f6e8cc'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { const x = i * w / 16; g.fillStyle = 'rgba(150,110,70,0.22)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 3, 0, 3, h); }
  for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(150,110,70,0.1)'; g.fillRect(0, y, w, 1); } }, 256, 256); }
function stTexLattice() { const t = tex((g, w, h) => { g.fillStyle = '#f4e4c6'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a5070'; for (let x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x + 8, 6); g.lineTo(x + 14, h / 2); g.lineTo(x + 8, h - 6); g.lineTo(x + 2, h / 2); g.fill(); }
  g.fillStyle = '#d8bc90'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4); }, 256, 32); return stRep(t, 3, 1); }
function stTexArcade() { return tex((g, w, h) => { g.fillStyle = '#f4e2c2'; g.fillRect(0, 0, w, h); g.fillStyle = '#e0c69e'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 10, w, 10);
  for (let i = 0; i < 5; i++) { const cx = (i + 0.5) * w / 5, aw = w / 5 - 24, y0 = 34; g.fillStyle = '#c8a070'; g.beginPath(); g.moveTo(cx - aw / 2 - 6, h); g.lineTo(cx - aw / 2 - 6, y0 + aw / 2); g.arc(cx, y0 + aw / 2, aw / 2 + 6, Math.PI, 0); g.lineTo(cx + aw / 2 + 6, h); g.fill();
    for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#b0453a' : '#f4e2c2'; g.beginPath(); g.moveTo(cx, y0 + aw / 2); g.arc(cx, y0 + aw / 2, aw / 2 + 6, Math.PI + k * Math.PI / 9, Math.PI + (k + 1) * Math.PI / 9); g.fill(); }   // ablaq red/white voussoirs
    const gr = g.createLinearGradient(0, y0, 0, h); gr.addColorStop(0, '#2a3a64'); gr.addColorStop(1, '#3a4a6a'); g.fillStyle = gr; g.beginPath(); g.moveTo(cx - aw / 2, h); g.lineTo(cx - aw / 2, y0 + aw / 2); g.arc(cx, y0 + aw / 2, aw / 2, Math.PI, 0); g.lineTo(cx + aw / 2, h); g.fill();
    g.fillStyle = '#3a8aa0'; g.fillRect(cx - aw * 0.3, y0 + aw * 0.7, aw * 0.6, h * 0.35); g.fillStyle = '#e8d8b0'; for (let k = 0; k < 4; k++) g.fillRect(cx - aw * 0.3 + k * aw * 0.18, y0 + aw * 0.7, 2, h * 0.35); } }, 512, 160); }
function stTexSide(wall, seed) { const t = tex((g, w, h) => { const R = RNG('stside', seed); g.fillStyle = wall; g.fillRect(0, 0, w, h); for (let i = 0; i < 2000; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let i = 0; i < 8; i++) { const x = R.r(0, w), gs = g.createLinearGradient(0, 0, 0, h * 0.5); gs.addColorStop(0, 'rgba(60,40,40,0.14)'); gs.addColorStop(1, 'rgba(60,40,40,0)'); g.fillStyle = gs; g.fillRect(x, 0, R.r(4, 14), h * 0.5); } }, 256, 256); return t; }
// the truck's side panel: ÇANKAYA BELEDİYESİ
function stTexTruckSide() { return tex((g, w, h) => { g.fillStyle = '#ff7a1c'; g.fillRect(0, 0, w, h); const R = RNG('sttside');
  for (let i = 0; i < 1200; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(120,40,0,0.05)' : 'rgba(255,255,255,0.05)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  for (let x = 0; x < w; x += w / 6) { g.fillStyle = 'rgba(140,50,0,0.22)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,220,180,0.18)'; g.fillRect(x + 4, 0, 2, h); }
  g.fillStyle = '#ffffff'; g.fillRect(0, h * 0.62, w, h * 0.09); g.fillStyle = '#2a7a4a'; g.fillRect(0, h * 0.71, w, h * 0.025);
  // the logo disc
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(w * 0.12, h * 0.36, h * 0.2, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a7a4a'; g.stroke(); g.fillStyle = '#2a7a4a'; g.beginPath(); g.arc(w * 0.12, h * 0.36, h * 0.12, 0, TAU); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(w * 0.12, h * 0.26); g.lineTo(w * 0.145, h * 0.42); g.lineTo(w * 0.095, h * 0.42); g.closePath(); g.fill();
  inked(g, 'ÇANKAYA', w * 0.58, h * 0.3, h * 0.26, '#ffffff', { stroke: '#7a2a00', sw: h * 0.025, maxW: w * 0.66 });
  inked(g, 'BELEDİYESİ', w * 0.58, h * 0.52, h * 0.12, '#ffffff', { stroke: '#7a2a00', sw: h * 0.015, maxW: w * 0.5 });
  inked(g, 'TEMİZLİK İŞLERİ', w * 0.5, h * 0.665, h * 0.06, '#2a7a4a', { stroke: false, maxW: w * 0.6 });
  const gb = g.createLinearGradient(0, h * 0.8, 0, h); gb.addColorStop(0, 'rgba(80,30,0,0)'); gb.addColorStop(1, 'rgba(80,30,0,0.35)'); g.fillStyle = gb; g.fillRect(0, h * 0.8, w, h * 0.2); }, 1024, 512); }
function stTexChevron() { const t = tex((g, w, h) => { g.fillStyle = '#ffd21e'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a30'; for (let x = -h; x < w + h; x += 48) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + 24, h); g.lineTo(x + 24 + h, 0); g.lineTo(x + h, 0); g.fill(); } }, 256, 64); return stRep(t, 1, 1); }
function stTexTailgate() { return tex((g, w, h) => { g.fillStyle = '#ff7a1c'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(140,50,0,0.25)'; for (let y = 0; y < h; y += h / 5) g.fillRect(0, y, w, 3);
  inked(g, 'ÇANKAYA', w / 2, h * 0.4, h * 0.2, '#ffffff', { stroke: '#7a2a00', sw: 6, maxW: w * 0.7 }); inked(g, '153', w / 2, h * 0.72, h * 0.14, '#2a2a30', { stroke: false }); }, 512, 384); }
// the clock face (dial + numerals; hands are meshes)
function stTexClock() { return tex((g, w, h) => { const cx = w / 2, cy = h / 2, r = w * 0.47; g.fillStyle = '#fbf4e2'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill();
  const gr = g.createRadialGradient(cx, cy, r * 0.6, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(200,170,120,0.25)'); g.fillStyle = gr; g.fill();
  g.lineWidth = 12; g.strokeStyle = '#1e3a2e'; g.beginPath(); g.arc(cx, cy, r - 6, 0, TAU); g.stroke();
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, big = i % 5 === 0; g.lineWidth = big ? 7 : 3; g.strokeStyle = '#2a2a2a'; g.beginPath(); g.moveTo(cx + Math.sin(a) * r * (big ? 0.78 : 0.84), cy - Math.cos(a) * r * (big ? 0.78 : 0.84)); g.lineTo(cx + Math.sin(a) * r * 0.9, cy - Math.cos(a) * r * 0.9); g.stroke(); }
  g.fillStyle = '#2a2a2a'; g.font = `700 ${w * 0.1}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; g.fillText(String(i), cx + Math.sin(a) * r * 0.64, cy - Math.cos(a) * r * 0.64); } }, 512, 512); }
function stTexSimit() { return tex((g, w, h) => { g.fillStyle = '#c8282a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(0, h * 0.72, w, h * 0.1); inked(g, 'SİMİT', w / 2, h * 0.38, h * 0.4, '#ffe9a0', { stroke: '#5a1010', sw: 6, maxW: w * 0.8 }); }, 512, 192); }
function stTexFlag() { return tex((g, w, h) => { g.fillStyle = '#e30a17'; g.fillRect(0, 0, w, h); const cx = w * 0.36, cy = h / 2;
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx, cy, h * 0.25, 0, TAU); g.fill(); g.fillStyle = '#e30a17'; g.beginPath(); g.arc(cx + h * 0.0625, cy, h * 0.2, 0, TAU); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); const sx = cx + h * 0.2 + h * 0.06, R0 = h * 0.125; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5 + Math.PI / 2 - 0.0, r = i % 2 ? R0 * 0.4 : R0; g.lineTo(sx + Math.cos(a - Math.PI / 2) * r, cy + Math.sin(a - Math.PI / 2) * r); } g.closePath(); g.fill(); }, 512, 340); }
function stTexBookCover(title, sub, bg, fg, seed) { return tex((g, w, h) => { const R = RNG('stbk', seed); g.fillStyle = bg; g.fillRect(0, 0, w, h); for (let i = 0; i < 600; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); inked(g, title, w / 2, h * 0.36, h * 0.12, fg, { stroke: false, maxW: w * 0.78, font: 'Georgia, serif', weight: 700 }); if (sub) inked(g, sub, w / 2, h * 0.7, h * 0.06, fg, { stroke: false, maxW: w * 0.7 }); }, 256, 360); }
function stTexComic() { return tex((g, w, h) => { g.fillStyle = '#ffd21e'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8282a'; g.fillRect(0, 0, w, h * 0.2); inked(g, 'SUPER', w / 2, h * 0.1, h * 0.12, '#ffffff', { stroke: '#2a1208', sw: 5, maxW: w * 0.8 });
  g.fillStyle = '#2f6ad8'; g.beginPath(); g.arc(w * 0.5, h * 0.42, w * 0.14, 0, TAU); g.fill(); g.beginPath(); g.moveTo(w * 0.3, h * 0.88); g.lineTo(w * 0.42, h * 0.52); g.lineTo(w * 0.58, h * 0.52); g.lineTo(w * 0.7, h * 0.88); g.fill(); g.fillStyle = '#e8282a'; g.beginPath(); g.moveTo(w * 0.42, h * 0.52); g.lineTo(w * 0.2, h * 0.8); g.lineTo(w * 0.36, h * 0.6); g.fill();
  g.save(); g.translate(w * 0.78, h * 0.3); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU, r = i % 2 ? w * 0.08 : w * 0.16; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = '#ffffff'; g.fill(); g.lineWidth = 4; g.strokeStyle = '#2a1208'; g.stroke(); g.restore(); inked(g, 'POW!', w * 0.78, h * 0.3, h * 0.06, '#e8282a', { stroke: false }); }, 256, 360); }
function stTexSpine(letter, bg) { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c45a'; for (const x of [0.1, 0.85]) g.fillRect(w * x, 0, w * 0.05, h); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(w * 0.18, h * 0.18, w * 0.64, h * 0.64);
  inked(g, letter, w / 2, h / 2 + 2, h * 0.5, '#f2d470', { stroke: false, maxW: w * 0.56, font: 'Georgia, serif', weight: 700 }); }, 256, 72); }
// the old book's right page: THE END, then a strike and CHAPTER 2 written on (k 0..1 strike, w 0..1 writing)
function stDrawPage(g, w, h, strike, write) { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w * 0.2, 0); gr.addColorStop(0, 'rgba(120,90,50,0.3)'); gr.addColorStop(1, 'rgba(120,90,50,0)'); g.fillStyle = gr; g.fillRect(0, 0, w * 0.2, h);
  g.fillStyle = 'rgba(70,50,30,0.55)'; const R = RNG('stpage'); for (let i = 0; i < 7; i++) g.fillRect(w * 0.12, h * (0.08 + i * 0.045), w * R.r(0.6, 0.76), 4);
  inked(g, 'THE END', w / 2, h * 0.5, h * 0.11, '#3a2414', { stroke: false, font: 'Georgia, serif', weight: 700, maxW: w * 0.8 });
  if (strike > 0) { g.strokeStyle = '#c8202a'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(w * 0.14, h * 0.52); g.lineTo(w * (0.14 + 0.72 * strike), h * (0.52 - 0.04 * strike)); g.stroke(); }
  if (write > 0) { g.save(); g.beginPath(); g.rect(0, h * 0.62, w * (0.1 + 0.82 * write), h * 0.2); g.clip(); inked(g, 'CHAPTER 2', w / 2, h * 0.71, h * 0.1, '#1f3aa8', { stroke: false, font: '"Comic Sans MS", "Segoe Print", cursive', weight: 700, maxW: w * 0.82 }); g.restore(); } }
function stTexLeftPage() { return tex((g, w, h) => { g.fillStyle = '#f2e6c8'; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(w, 0, w * 0.8, 0); gr.addColorStop(0, 'rgba(120,90,50,0.3)'); gr.addColorStop(1, 'rgba(120,90,50,0)'); g.fillStyle = gr; g.fillRect(w * 0.8, 0, w * 0.2, h);
  g.fillStyle = 'rgba(70,50,30,0.55)'; const R = RNG('stpageL'); for (let i = 0; i < 16; i++) g.fillRect(w * 0.1, h * (0.08 + i * 0.05), w * R.r(0.62, 0.78), 4); }, 256, 340); }
function stTexWallpaper() { const t = tex((g, w, h) => { g.fillStyle = '#7a2a3a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,200,120,0.18)'; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse((i + (j % 2) * 0.5) * w / 4, (j + 0.5) * h / 4, 10, 16, 0, 0, TAU); g.fill(); } }, 128, 128); return stRep(t, 4, 3); }

// shop awning (band colour / white stripes), blade-sign plate, AC grille (cached)
function stAwning(band) { return (ST.awC ||= {})[band] ||= c3Prop('#ffffff', { rough: 0.8, map: tex((g, w, h) => { for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#fbf4e6' : band; g.fillRect(i * w / 12, 0, w / 12 + 1, h); } g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, h * 0.8, w, h * 0.2); }, 256, 64) }); }
function stSignMat(txt, band) { return (ST.sgC ||= {})[txt] ||= c3Prop('#ffffff', { rough: 0.6, map: tex((g, w, h) => { g.fillStyle = '#fbf4e2'; g.fillRect(0, 0, w, h); g.fillStyle = band; g.fillRect(8, 8, w - 16, h - 16); inked(g, txt, w / 2, h / 2, h * 0.36, '#fff6e2', { stroke: '#2a1a1a', sw: 4, maxW: w * 0.8 }); }, 256, 160) }); }
function stTexAC() { return tex((g, w, h) => { g.fillStyle = '#ecebe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#9a9a98'; for (let y = 10; y < h - 8; y += 6) g.fillRect(8, y, w * 0.55, 2); g.beginPath(); g.arc(w * 0.8, h / 2, h * 0.3, 0, TAU); g.fill(); g.fillStyle = '#ecebe6'; g.beginPath(); g.arc(w * 0.8, h / 2, h * 0.08, 0, TAU); g.fill(); }, 128, 96); }

// ---- props
function stBag(R, k = 1, mat) { const g = new THREE.Group(), geo = new THREE.SphereGeometry(1, 14, 10), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), f = 1 + R.n(0.09) + (y > 0.6 ? -0.25 * (y - 0.6) : 0); p.setXYZ(i, p.getX(i) * f, y, p.getZ(i) * f); } geo.computeVertexNormals();
  const b = new THREE.Mesh(geo, mat); b.scale.set(1.9 * k, 1.75 * k, 1.7 * k); b.position.y = 1.6 * k; g.add(b);
  const kn = new THREE.Mesh(new THREE.ConeGeometry(0.45 * k, 1.1 * k, 7), mat); kn.position.y = 3.55 * k; kn.rotation.z = Math.PI; g.add(kn);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.42 * k, 7, 5), mat); e.scale.set(1.4, 0.6, 0.7); e.position.set(s * 0.5 * k, 4.05 * k, 0); e.rotation.z = s * 0.6; g.add(e); }
  g.userData.knot = V3(0, 4.1 * k, 0); return g; }
// a green Çankaya 4-wheel container (origin = floor centre; x = depth 4.6, z = width 6). lid hinged at the back (-x side)
// v3: moulded tub (rounded corners, corner pillars, belt, ribs), grime overlay, dark opening, push handle, lifter pins, pedal,
// caster forks; the lid has a raised ribbed panel, a front lip + handle and a darker ribbed underside with a skirt (it is what the
// camera sees when the lid stands open)
function stContainer(M, open = 0) { const C = ST.cM ||= { body: c3Prop('#2f9a4a', { map: stRep(stTexGrime(3), 0.22, 0.17), rough: 0.5 }), dk: c3Prop('#1f7038', { map: stRep(stTexGrime(4), 0.3, 0.3), rough: 0.55 }),
    inn: c3Prop('#0c341b', { map: stRep(stTexGrime(5, '#c8d0c4'), 0.3, 0.25), rough: 0.8 }), inn2: c3Prop('#17542b', { rough: 0.7 }), steel: c3Prop('#8a929c', { metal: 0.5, rough: 0.4 }), hole: c3Prop('#0c2414', { rough: 0.9 }),
    lab: c3Flat('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a7a4a'; x.fillRect(6, 6, w - 12, h - 12); inked(x, 'ÇANKAYA', w / 2, h * 0.38, h * 0.26, '#ffffff', { stroke: false, maxW: w * 0.84 }); inked(x, 'BELEDİYESİ', w / 2, h * 0.72, h * 0.16, '#ffffff', { stroke: false, maxW: w * 0.8 }); }, 256, 128) }) };
  const g = new THREE.Group();
  g.add(stRB(4.4, 6.9, 6.0, C.body, 0, 4.35, 0, 0.45)); g.add(stRB(4.8, 0.55, 6.4, C.dk, 0, 7.85, 0, 0.25)); g.add(stRB(3.9, 0.1, 5.5, C.hole, 0, 8.1, 0, 0.04));   // tub, top rim, the dark opening
  g.add(stRB(4.56, 0.4, 6.16, C.dk, 0, 3.2, 0, 0.18)); g.add(stRB(4.6, 0.6, 6.2, C.dk, 0, 1.15, 0, 0.25));   // moulded belt, base
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(stRB(0.7, 6.4, 0.7, C.dk, sx * 2.0, 4.5, sz * 2.8, 0.3));   // corner pillars
  for (const z of [-1.75, 1.75]) g.add(stRB(0.24, 4.4, 0.45, C.dk, 2.25, 5.2, z, 0.1)); for (const sz of [-1, 1]) for (const x of [-0.9, 0.9]) g.add(stRB(0.45, 4.4, 0.24, C.dk, x, 5.2, sz * 3.02, 0.1));   // ribs
  g.add(pl(2.6, 1.4, C.lab, 2.24, 4.8, 0, Math.PI / 2));
  g.add(stTube(V3(2.75, 6.9, -2.4), V3(2.75, 6.9, 2.4), 0.15, C.dk, 8)); for (const z of [-2.0, 2.0]) g.add(stTube(V3(2.15, 6.9, z), V3(2.75, 6.9, z), 0.14, C.dk, 8));   // push handle
  for (const sz of [-1, 1]) { const p = cyl(0.32, 0.32, 0.6, C.steel, 0.4, 6.4, sz * 3.2, 0, 12); p.rotation.x = Math.PI / 2; g.add(p); }   // lifter pins
  g.add(stTube(V3(2.65, 1.35, -1.5), V3(2.65, 1.35, 1.5), 0.16, C.steel, 8)); for (const z of [-1.5, 1.5]) g.add(stTube(V3(2.65, 1.35, z), V3(2.2, 1.9, z), 0.1, C.steel, 6));   // pedal
  for (const [x, z] of [[-1.6, -2.4], [1.6, -2.4], [-1.6, 2.4], [1.6, 2.4]]) { const w = cyl(0.5, 0.5, 0.36, M.dark, x, 0.5, z, 0, 14); w.rotation.x = Math.PI / 2; g.add(w); const hb = cyl(0.2, 0.2, 0.44, C.steel, x, 0.5, z, 0, 10); hb.rotation.x = Math.PI / 2; g.add(hb);
    for (const dz of [-0.26, 0.26]) g.add(rb(0.45, 0.75, 0.07, C.steel, x, 0.72, z + dz, 0)); g.add(rb(0.9, 0.12, 0.8, C.steel, x, 1.0, z, 0)); }   // casters + forks
  const lid = new THREE.Group(); lid.position.set(-2.3, 8.15, 0); g.add(lid);
  lid.add(stRB(4.9, 0.4, 6.5, C.body, 2.45, 0.22, 0, 0.18)); lid.add(stRB(4.0, 0.42, 5.4, C.body, 2.3, 0.6, 0, 0.2)); for (let i = -2; i <= 2; i++) lid.add(stRB(3.4, 0.2, 0.28, C.dk, 2.3, 0.88, i, 0.09));   // shell, raised panel, ribs
  lid.add(stRB(0.55, 0.75, 6.6, C.dk, 4.85, 0.1, 0, 0.25)); lid.add(stTube(V3(5.35, 0.25, -1.9), V3(5.35, 0.25, 1.9), 0.16, C.dk, 8)); for (const z of [-1.9, 1.9]) lid.add(stTube(V3(4.95, 0.25, z), V3(5.35, 0.25, z), 0.15, C.dk, 8));   // front lip + handle
  lid.add(stRB(4.5, 0.08, 6.1, C.inn, 2.4, -0.02, 0, 0.03)); for (const x of [0.2, 4.6]) lid.add(stRB(0.3, 0.45, 6.3, C.dk, x, -0.15, 0, 0.1)); for (const z of [-3.05, 3.05]) lid.add(stRB(4.7, 0.45, 0.3, C.dk, 2.4, -0.15, z, 0.1));   // underside + skirt
  for (const z of [-1.5, 0, 1.5]) lid.add(stRB(4.2, 0.3, 0.22, C.inn2, 2.4, -0.2, z, 0.08)); for (const x of [1.4, 3.4]) lid.add(stRB(0.22, 0.3, 5.8, C.inn2, x, -0.2, 0, 0.08));   // inner ribs
  lid.rotation.z = open * 1.9; g.userData.lid = lid; return g; }

function stBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(40, W / H, 0.4, 6000), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#6a80d0', ambI: 0.2, sky: '#8a9ad6', ground: '#c08058', key: '#ff9c50', keyI: 2.8, keyP: [220, 100, 160], rim: '#ff8a50', rimI: 0.35, rimP: [-150, 60, -200] });
  scene.children.forEach((c) => { if (c.isHemisphereLight) s.hemi = c; else if (c.isAmbientLight) s.amb = c; else if (c.isDirectionalLight && c !== s.key) s.rim = c; });
  const M = ST.M = { conc: c3Prop('#d0c4ac', { rough: 0.9 }), curb: c3Prop('#e2dccc', { rough: 0.85 }), dark: c3Prop('#2a2a32', { rough: 0.6 }), steel: c3Prop('#9aa2ac', { metal: 0.5, rough: 0.4 }),
    cream: c3Prop('#f2e6d2', { rough: 0.85 }), rail: c3Prop('#3a3a44', { metal: 0.3, rough: 0.5 }), cont: c3Prop('#2f9a4a', { rough: 0.45 }), contD: c3Prop('#1f7038', { rough: 0.5 }),
    bag: c3Prop('#2e3448', { rough: 0.26, env: 1.4 }), orange: c3Prop('#ff7a1c', { rough: 0.32, env: 1.2 }), orangeD: c3Prop('#d85a10', { rough: 0.4 }), white: c3Prop('#f4f2ec', { rough: 0.35 }),
    glass: c3Prop('#22324a', { rough: 0.05, metal: 0.6, env: 2.2 }), chrome: c3Prop('#d8dce2', { rough: 0.15, metal: 0.9, env: 2 }), tyre: c3Prop('#1e1e24', { rough: 0.85 }), black: c3Prop('#26262c', { rough: 0.6 }),
    inner: c3Prop('#5a5a62', { rough: 0.8 }), chev: c3Prop('#ffffff', { map: stTexChevron(), rough: 0.5 }), wood: c3Prop('#a8703a', { rough: 0.8 }), bark: c3Prop('#6a4a32', { rough: 0.9 }) };
  ST.acM = c3Prop('#ffffff', { map: stTexAC(), rough: 0.5 }); ST.tileM = c3Prop('#ffffff', { map: stTexTiles(), rough: 0.75 }); ST.roofM = c3Prop('#9a8a80', { rough: 0.95 });
  const K = new THREE.Group(), KN = new THREE.Group();   // static detail, baked at the end (KN: near-side block detail, casts no shadow so the low sun lights the street)
  s.sky = c3SkyDome(scene, { paint: true, zenith: '#2f56c0', mid: '#f0a890', midH: 0.1, horizon: '#f4a460', glow: '#ffa050', glowK: 0.45, ground: '#c09070', sun: [0.35, 0.1, -0.93], clouds: 40, cloudScale: 1.1, seed: 9, cloudLit: '#ffdcb4', cloudShade: '#8a84c8', layer: C3.L_BG });
  scene.fog = new THREE.Fog('#e8845a', 300, 2400);
  // ---- ground: road, sidewalks + curbs, side streets
  scene.add(pl(6000, 6000, c3Prop('#ffffff', { map: stRep(stTexAsphalt(), 120, 120), rough: 0.9 }), 0, -0.05, 0, 0, -Math.PI / 2));
  scene.add(pl(900, 40, c3Prop('#ffffff', { map: stTexRoad(), rough: 0.8 }), 0, 0.02, 0, 0, -Math.PI / 2));
  for (const sz of [-1, 1]) { const sw = rbNC(900, 1.0, 18, M.conc, 0, 0.5, sz * 29, 0); scene.add(sw);
    const sp = pl(900, 17.2, c3Prop('#ffffff', { map: stRep(stTexPavers(), 90, 2), rough: 0.9 }), 0, 1.02, sz * 29.4, 0, -Math.PI / 2); sp.userData.noCast = true; scene.add(sp);
    K.add(rb(900, 1.2, 1.0, M.curb, 0, 0.6, sz * 20.4, 0)); }
  // ---- the square across from the truck (x -10..62): paving, low hedge wall, trees, benches, the flagpole
  { scene.add(rbNC(72, 1.0, 80, M.conc, 26, 0.5, -78, 0)); const sq = pl(72, 80, c3Prop('#ffffff', { map: stRep(stTexPavers(), 7, 8), rough: 0.9 }), 26, 1.04, -78, 0, -Math.PI / 2); sq.userData.noCast = true; scene.add(sq);
    for (const [x, w] of [[2, 20], [50, 24]]) { K.add(rb(w, 2.6, 2.4, c3Prop('#d8c8a8', { rough: 0.9 }), x, 2.2, -39, 0)); for (let i = 0; i < w / 2.2; i++) { const b = c3Mesh(new THREE.IcosahedronGeometry(1.5, 0), c3Prop(i % 2 ? '#3a8a3a' : '#4a9a40', { rough: 0.8 }), 0); b.position.set(x - w / 2 + 1.2 + i * 2.2, 4.3, -39); K.add(b); } }
    for (const [x, z, sc, sd] of [[-4, -60, 4.2, 1], [8, -96, 4.6, 2], [52, -58, 4.0, 3], [58, -100, 4.4, 4], [30, -110, 3.8, 5]]) { const tr = c3LeafTree(sc, sd, sd % 2 ? '#4f8a3a' : '#5a9a40'); tr.position.set(x, 1, z); K.add(tr); }
    for (const [x, z] of [[14, -60], [38, -60]]) { const b = stAt(new THREE.Group(), x, 1, z); b.add(rb(10, 0.6, 2.6, M.wood, 0, 2.6, 0)); b.add(rb(10, 2.4, 0.5, M.wood, 0, 4.4, -1.2)); for (const bx of [-4, 4]) b.add(rb(0.5, 2.6, 2.4, M.dark, bx, 1.3, 0)); K.add(b); }
    K.add(rb(14, 1.2, 14, c3Prop('#d8ccb4', { rough: 0.9 }), 26, 1.6, -76, 0)); K.add(cyl(5, 5.6, 2.2, c3Prop('#e2d6c0', { rough: 0.8 }), 26, 2.6, -76, 0, 20)); K.add(cyl(4.4, 4.4, 0.3, c3Prop('#5aa8d0', { rough: 0.1, env: 1.6 }), 26, 3.6, -76, 0, 20));   // a small fountain
    s.flagPole = cyl(0.5, 0.7, 76, M.chrome, 20, 39, -52, 0, 10); scene.add(s.flagPole); K.add(cyl(1.6, 2.2, 2, M.cream, 20, 2, -52, 0, 12)); { const b = c3Mesh(new THREE.SphereGeometry(0.9, 10, 8), c3Prop('#e8c04a', { metal: 0.6, rough: 0.3 }), 0); b.position.set(20, 77.4, -52); scene.add(b); }
    const fm = c3Prop('#ffffff', { map: stTexFlag(), rough: 0.8 }); fm.side = THREE.DoubleSide; s.flag = new THREE.Mesh(new THREE.PlaneGeometry(21, 14, 20, 4), fm); s.flag.userData.base = Float32Array.from(s.flag.geometry.attributes.position.array); s.flag.position.set(30.6, 69, -52); s.flag.userData.keep = true; scene.add(s.flag); }
  // ---- the mosques: one behind the square, one closing the street at +x
  // Ottoman (Kocatepe-like): square hall with arched windows, a windowed drum + big ribbed lead dome, 4 semi-domes cascading
  // down the sides, 4 corner exedra domes, octagonal weight turrets, a domed portico with ablaq arches, 4 slender fluted
  // minarets with 2 şerefe balconies (corbel + lattice parapet + rail) and long pencil caps; gold alems (finials + crescent)
  const KM = new THREE.Group();   // the mosques: baked separately (no shadows)
  const MM = { st: c3Prop('#ffffff', { map: stTexMosqueWall(), rough: 0.8 }), plain: c3Prop('#f4e2c2', { rough: 0.8 }), trim: c3Prop('#e0c69e', { rough: 0.8 }), drum: c3Prop('#ffffff', { map: stTexDrum(), rough: 0.8 }),
    dome: c3Prop('#ffffff', { map: stTexDome(), rough: 0.4, metal: 0.25 }), lead: c3Prop('#7f8eae', { rough: 0.4, metal: 0.25 }), gold: c3Prop('#f2c04a', { metal: 0.7, rough: 0.28 }), min: c3Prop('#ffffff', { map: stTexMinaret(), rough: 0.75 }),
    lat: c3Prop('#ffffff', { map: stTexLattice(), rough: 0.8 }), arc: c3Prop('#ffffff', { map: stTexArcade(), rough: 0.8 }) };
  function alem(g, x, y, z, s) { g.add(stCyl(0.5 * s, 0.6 * s, 3 * s, MM.gold, x, y + 1.5 * s, z, 8)); for (const [yy, r] of [[3.6, 1.3], [5.8, 1.0], [7.6, 0.7]]) g.add(stSph(r * s, MM.gold, x, y + yy * s, z, false, 10, 6));
    const c = new THREE.Mesh(new THREE.TorusGeometry(1.6 * s, 0.38 * s, 6, 16, Math.PI * 1.45), MM.gold); c.position.set(x, y + 10.4 * s, z); c.rotation.z = Math.PI * 0.27; g.add(c); }
  function dome(g, x, y, z, r, rib = true, hk = 0.92) { const d = stSph(r, rib ? MM.dome : MM.lead, x, y, z, true, 32, 10); d.scale.y = hk; g.add(d); g.add(stCyl(r * 1.02, r * 1.04, r * 0.08, MM.trim, x, y, z, 32)); alem(g, x, y + r * hk - 0.4, z, Math.max(0.35, r / 22)); }
  function minaret(g, x, z, H) { g.add(stBox(11, 34, 11, MM.st, x, 17, z)); g.add(stBox(12.4, 2, 12.4, MM.trim, x, 34.5, z)); g.add(stCyl(4.2, 6.2, 8, MM.plain, x, 39.5, z, 16));   // plinth + transition
    g.add(stCyl(3.9, 4.2, H - 44, MM.min, x, 43 + (H - 44) / 2, z, 16));
    for (const yb of [H * 0.62, H * 0.82]) { g.add(stCyl(6.8, 3.9, 6, MM.plain, x, yb - 3, z, 16)); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; g.add(stBox(0.7, 4.4, 0.7, MM.trim, x + Math.cos(a) * 4.6, yb - 3.6, z + Math.sin(a) * 4.6)); }   // muqarnas corbel
      g.add(stCyl(7.0, 7.0, 0.8, MM.trim, x, yb + 0.4, z, 20)); g.add(stCyl(6.7, 6.7, 2.6, MM.lat, x, yb + 2.1, z, 20, true)); g.add(stCyl(6.95, 6.95, 0.45, MM.trim, x, yb + 3.5, z, 20)); }
    g.add(stCyl(3.4, 3.9, H * 0.08, MM.min, x, H * 0.82 + 3.6 + H * 0.04, z, 16)); const top = H * 0.9 + 3.6; g.add(stCyl(4.4, 4.4, 1.2, MM.trim, x, top + 0.6, z, 16));
    const cap = new THREE.Mesh(new THREE.ConeGeometry(4.3, H * 0.2, 16), MM.lead); cap.position.set(x, top + 1.2 + H * 0.1, z); g.add(cap); alem(g, x, top + 1.2 + H * 0.2 - 0.6, z, 0.55); }
  function mosque(x, z, k, ry = 0) { const g = stAt(new THREE.Group(), x, 0, z, ry); g.scale.setScalar(k);
    g.add(stBox(100, 44, 100, MM.st, 0, 22, 0)); g.add(stBox(103, 2.4, 103, MM.trim, 0, 44.6, 0)); g.add(stBox(98, 4, 98, MM.plain, 0, 47, 0));   // hall, cornice, roof terrace
    g.add(stCyl(31, 31, 13, MM.drum, 0, 55.5, 0, 40)); for (let i = 0; i < 20; i++) { const a = (i + 0.5) / 20 * TAU; g.add(stBox(2.2, 11, 2.6, MM.plain, Math.cos(a) * 31.6, 55, Math.sin(a) * 31.6)); }   // drum + buttresses
    dome(g, 0, 62, 0, 31);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, cx = Math.sin(a) * 23, cz = Math.cos(a) * 23;   // semi-domes (open side toward the centre, hidden in the drum)
      const hd = new THREE.Group(); hd.position.set(cx, 49, cz); hd.rotation.y = a; g.add(hd);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(21, 21, 6, 24, 1, false, -Math.PI / 2, Math.PI), MM.drum); wall.position.y = -1; hd.add(wall);
      const sd = new THREE.Mesh(new THREE.SphereGeometry(21, 24, 8, 0, Math.PI, 0, Math.PI / 2), MM.dome); sd.position.y = 2; sd.scale.y = 0.9; hd.add(sd); const rim = new THREE.Mesh(new THREE.CylinderGeometry(21.6, 21.6, 1, 24, 1, false, -Math.PI / 2, Math.PI), MM.trim); rim.position.y = 2; hd.add(rim); }
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.add(stCyl(10, 10, 5, MM.drum, sx * 33, 51.5, sz * 33, 16)); dome(g, sx * 33, 54, sz * 33, 10, false);   // exedra domes
      g.add(stCyl(5.4, 5.4, 16, MM.plain, sx * 49, 50, sz * 49, 8)); g.add(stCyl(5.8, 5.8, 1, MM.trim, sx * 49, 58.4, sz * 49, 8)); dome(g, sx * 49, 58.6, sz * 49, 5, false); }   // weight turrets
    // portico: arcade + 5 small domes, steps
    g.add(stBox(100, 26, 20, MM.plain, 0, 13, 60)); g.add(pl(100, 26, MM.arc, 0, 13, 70.05)); g.add(stBox(102, 2, 22, MM.trim, 0, 27, 60)); for (let i = 0; i < 5; i++) { g.add(stCyl(8, 8, 3, MM.plain, -40 + i * 20, 29.5, 60, 16)); dome(g, -40 + i * 20, 31, 60, 8, false); }
    for (let i = 0; i < 3; i++) g.add(stBox(60 - i * 6, 1.2, 4, MM.trim, 0, 0.6 + i * 1.2, 72 + 6 - i * 2));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) minaret(g, sx * 60, sz * (sz > 0 ? 74 : 56), 222);
    KM.add(g); return g; }
  mosque(30, -340, 1); mosque(470, -70, 0.78, -Math.PI / 2);
  // ---- apartment blocks: far side (fronts at z = -40, facing +z) and near side (fronts at z = +40, facing -z)
  const walls = ['#f2a068', '#f2c84a', '#5ab8a8', '#ee7a68', '#e8b878', '#f4b080', '#88c068', '#e08a5a', '#f0d8b0', '#d86a50'], bands = ['#2a7a4a', '#c8282a', '#1f4f9a', '#e8762a', '#6a3a8a', '#1a8a8a'];
  const shops = ['BAKKAL', 'FIRIN', 'BERBER', 'ECZANE', 'BÜFE', 'KIRTASİYE', 'TERZİ', 'ÇAY OCAĞI', 'KASAP', 'MANAV', 'LOKANTA', 'KUAFÖR'];
  s.laundry = [];
  let bi = 0;
  function block(x0, w, side) {   // side -1 = far (front at z=-40 facing +z), +1 = near
    const R = RNG('stblock', bi), floors = R.i(2, 3), bays = Math.max(3, Math.round(w / 15)), wall = walls[bi % walls.length], band = bands[bi % bands.length], fh = 17, H0 = 15 + floors * fh + 4, D = 34;
    const g = stAt(new THREE.Group(), x0 + w / 2, 0, side * (40 + D / 2), side < 0 ? 0 : Math.PI); scene.add(g);
    const body = rb(w, H0, D, c3Prop('#ffffff', { map: stRep(stTexSide(wall, bi), w / 30, H0 / 30), rough: 0.9 }), 0, H0 / 2, 0, 0); body.userData.noCast = true; g.add(body);
    const fac = pl(w - 0.4, H0, c3Prop('#ffffff', { map: stTexFacade(bi, wall, floors, bays, shops[bi % shops.length], band), rough: 0.85 }), 0, H0 / 2, D / 2 + 0.06); fac.userData.noCast = true; g.add(fac);
    const gB = new THREE.Group(); g.add(gB);
    gB.add(rb(w + 1.2, 1.6, D + 1.2, M.cream, 0, H0 + 0.8, 0)); gB.add(stBox(w + 0.6, 1.0, D + 0.6, M.cream, 0, 15.3, 0)); gB.add(stBox(w + 0.4, 1.6, D + 0.4, c3Prop(c3Shd(wall, 0.7), { rough: 0.9 }), 0, 0.8, 0));   // cornice, ground-floor band, plinth
    const sideM = (ST.sideC ||= {})[wall + floors] ||= c3Prop('#ffffff', { map: stTexFacade(bi + 50, wall, floors, 2, '', band), rough: 0.85 });
    for (const sx of [-1, 1]) { const sf = pl(D - 0.6, H0, sideM, sx * (w / 2 + 0.06), H0 / 2, 0, sx * Math.PI / 2); sf.userData.noCast = true; g.add(sf);
      gB.add(stCyl(0.32, 0.32, H0, M.steel, sx * (w / 2 - 0.6), H0 / 2, D / 2 + 0.5, 8)); }   // side facades, drainpipes
    { const aw = new THREE.Mesh(new THREE.BoxGeometry(w * 0.58, 0.3, 5.2), stAwning(band)); aw.position.set(-w * 0.14, 14.2, D / 2 + 2.4); aw.rotation.x = 0.38; gB.add(aw);   // striped shop awning over the window + its arms
      for (const sx of [-1, 1]) { const a = stBox(0.2, 0.2, 5, M.rail, -w * 0.14 + sx * w * 0.28, 14.0, D / 2 + 2.4); a.rotation.x = 0.38; gB.add(a); }
      gB.add(stBox(0.6, 4.2, 5.4, c3Prop(band, { rough: 0.5 }), w / 2 - 2.2, 21, D / 2 + 3)); for (const sx of [-1, 1]) gB.add(pl(4.6, 3.4, stSignMat(shops[bi % shops.length], band), w / 2 - 2.2 + sx * 0.32, 21, D / 2 + 3, sx * Math.PI / 2)); }   // blade sign
    // balconies with railings, laundry and satellite dishes
    const bw = w / bays, gh = H0 * 0.27, fH = (H0 - gh - H0 * 0.06) / floors;
    for (let f = 0; f < floors; f++) for (let b = 0; b < bays; b++) { if (R.f() < 0.3) continue; const bx = -w / 2 + (b + 0.5) * bw, by = H0 - H0 * 0.06 - (f + 1) * fH + 0.3, bz = D / 2 + 2.2, ww = bw * 0.86;
      gB.add(rb(ww, 0.7, 4.4, M.cream, bx, by, bz)); gB.add(rb(ww, 0.35, 0.35, M.rail, bx, by + 4.2, bz + 2.1)); for (let k = 0; k <= 6; k++) gB.add(rb(0.22, 3.8, 0.22, M.rail, bx - ww / 2 + 0.3 + k * (ww - 0.6) / 6, by + 2.2, bz + 2.1));
      for (const sx of [-1, 1]) gB.add(rb(0.35, 4, 0.35, M.rail, bx + sx * (ww / 2 - 0.2), by + 2.2, bz));
      if (R.f() < 0.55) { const L = new THREE.Group(); L.position.set(bx, by + 7.6, bz + 1.4); g.add(L); L.add(rb(ww - 0.8, 0.08, 0.08, M.dark, 0, 0, 0, 0));
        const n = R.i(3, 5); for (let k = 0; k < n; k++) { const cw = R.r(1.4, 2.6), ch = R.r(1.6, 3.2), cl = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), (() => { const m = c3Prop(['#ffffff', '#e84a6a', '#f2c23a', '#4aa8e0', '#8a5ac8', '#ff8a3a', '#7ac85a'][R.i(0, 6)], { rough: 0.9 }); m.side = THREE.DoubleSide; return m; })());
          cl.position.set(-ww / 2 + 1.2 + (k + 0.5) * (ww - 2.4) / n, -ch / 2, 0); L.add(cl); } L.userData.ph = R.f() * TAU; L.userData.keep = true; L.traverse((m) => { m.userData.keep = true; m.userData.noCast = true; }); s.laundry.push(L); }
      if (R.f() < 0.25) { const d = c3Mesh(new THREE.SphereGeometry(1.4, 12, 6, 0, TAU, 0, 0.9), c3Prop('#f4f4f0', { rough: 0.4 }), 0); d.position.set(bx + ww / 2 - 1.4, by + 5.6, bz + 1.0); d.rotation.x = 1.1; gB.add(d); }
      if (R.f() < 0.3) { gB.add(rb(2.8, 2.2, 1.4, c3Prop('#e8e8e4', { rough: 0.5 }), bx - ww / 2 + 1.8, by + 1.5, bz - 1.4)); } }
    // window sills + lintels on every window, AC units hung beside some
    for (let f = 0; f < floors; f++) for (let b = 0; b < bays; b++) { const bx = -w / 2 + (b + 0.5) * bw, wb = H0 - H0 * 0.06 - f * fH - 0.78 * fH, wt = wb + fH * 0.62;
      gB.add(stBox(bw * 0.6 + 1.6, 0.5, 1.1, M.cream, bx, wb - 0.3, D / 2 + 0.55)); gB.add(stBox(bw * 0.6 + 1.2, 0.6, 0.6, M.cream, bx, wt + 0.5, D / 2 + 0.3));
      if (R.f() < 0.3) { const ax = bx + (R.f() < 0.5 ? -1 : 1) * (bw * 0.3 + 2.0); gB.add(stBox(2.8, 1.9, 1.4, ST.acM, ax, wb + 1.2, D / 2 + 0.8)); gB.add(stBox(0.2, 0.2, 1.2, M.rail, ax - 1, wb + 0.15, D / 2 + 0.7)); } }
    // roof: solar water heaters (black panels + white tanks), chimneys, antennas
    for (let k = 0; k < Math.max(1, Math.round(w / 22)); k++) { const rx = -w / 2 + 6 + k * 22 + R.r(0, 6), rz = R.r(-8, 6); const p = rb(7, 0.4, 4.4, c3Prop('#2a3048', { rough: 0.2, metal: 0.4 }), rx, H0 + 3.4, rz); p.rotation.x = -0.5; gB.add(p);
      const tk = cyl(1.0, 1.0, 7.4, c3Prop('#f0f0ee', { rough: 0.4 }), rx, H0 + 5.4, rz - 2.6); tk.rotation.z = Math.PI / 2; gB.add(tk); for (const sx of [-3, 3]) gB.add(rb(0.3, 4, 0.3, M.steel, rx + sx, H0 + 3.2, rz - 2.6)); }
    if (R.f() < 0.45) { const hr = stHipRoof(w + 2.4, D + 2.4, 11, ST.tileM); hr.position.set(0, H0 + 1.6, 0); gB.add(hr); gB.add(stBox(2.2, 7, 2.2, c3Prop(c3Shd(wall, 0.85), { rough: 0.9 }), w / 4, H0 + 8, -D / 5)); gB.add(stBox(2.8, 0.6, 2.8, M.cream, w / 4, H0 + 11.6, -D / 5)); }   // tiled hip roof + chimney
    else { gB.add(stBox(w, 0.3, D, ST.roofM, 0, H0 + 1.7, 0)); for (const sz of [-1, 1]) { gB.add(stBox(w + 1.2, 2.2, 0.6, M.cream, 0, H0 + 2.7, sz * (D / 2 + 0.3))); gB.add(stBox(0.6, 2.2, D + 1.2, M.cream, sz * (w / 2 + 0.3), H0 + 2.7, 0)); }   // flat roof: parapet, stair house, water tanks
      gB.add(stBox(7, 6, 6, c3Prop(c3Shd(wall, 0.9), { rough: 0.9 }), w / 2 - 6, H0 + 4.6, -D / 4)); gB.add(stBox(7.6, 0.6, 6.6, M.cream, w / 2 - 6, H0 + 7.8, -D / 4)); gB.add(stBox(2.2, 4, 0.2, M.dark, w / 2 - 6, H0 + 3.6, -D / 4 + 3.05));
      for (let k = 0; k < 2; k++) { const tx = -w / 2 + 8 + k * 5; gB.add(stCyl(1.8, 1.8, 3.6, c3Prop(k ? '#4a9ad0' : '#f0f0ee', { rough: 0.4 }), tx, H0 + 4.6, D / 4, 14)); gB.add(stBox(3.6, 1, 3.6, M.rail, tx, H0 + 2.3, D / 4)); } }
    { const ax = -w / 2 + 5, az = -D / 3; gB.add(stCyl(0.15, 0.15, 12, M.steel, ax, H0 + 7, az, 4)); for (const [y, l] of [[10, 5], [11.6, 3.8], [12.8, 2.6]]) gB.add(stBox(l, 0.14, 0.14, M.steel, ax, H0 + y, az));   // TV aerial + a dish
      if (R.f() < 0.6) { const d = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 6, 0, TAU, 0, 0.9), c3Prop('#f4f4f0', { rough: 0.4 })); d.position.set(ax + 6, H0 + 5, az + 2); d.rotation.x = 1.0; gB.add(d); } }
    (side > 0 ? KN : K).add(gB); g.remove(gB); gB.position.copy(g.position); gB.rotation.copy(g.rotation);
    bi++; return g; }
  for (const side of [-1, 1]) { let x = -330; const R = RNG('stblocks', side); while (x < 400) { const w = R.r(44, 64); if (side < 0 && x + w > -10 && x < 62) { x = 62; continue; } if (side > 0 && Math.abs(x + w / 2 - 120) < 20) { x += 26; continue; } block(x, w, side); x += w + (R.f() < 0.25 ? 18 : 0.4); } }
  // ---- street furniture on the far sidewalk
  s.clockG = stAt(new THREE.Group(), -38, 1, -33); scene.add(s.clockG);
  { const g = s.clockG, gm = c3Prop('#1e5a3e', { rough: 0.4, metal: 0.3 }), gold = c3Prop('#e2b84a', { metal: 0.7, rough: 0.3 });
    g.add(cyl(1.4, 1.8, 2.4, gm, 0, 1.2, 0, 0, 12)); g.add(cyl(0.55, 0.7, 28, gm, 0, 15, 0, 0, 12)); for (const y of [3, 26]) g.add(cyl(0.9, 0.9, 0.6, gold, 0, y, 0, 0, 12));
    g.add(cyl(3.9, 3.9, 2.2, gm, 0, 32, 0, 0, 28)); g.children.at(-1).rotation.x = Math.PI / 2; g.add(cyl(0.6, 1.2, 1.6, gm, 0, 36.6, 0, 0, 10)); { const b = c3Mesh(new THREE.SphereGeometry(0.6, 10, 8), gold, 0); b.position.y = 37.8; g.add(b); }
    s.clockH = []; for (const sz of [1, -1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(3.25, 40), c3Flat('#ffffff', { map: stTexClock() })); f.position.set(0, 32, sz * 1.13); f.rotation.y = sz > 0 ? 0 : Math.PI; g.add(f); const ring = c3Mesh(new THREE.TorusGeometry(3.5, 0.28, 8, 32), gold, 0); ring.position.set(0, 32, sz * 1.12); g.add(ring);
      const hh = new THREE.Group(), mh = new THREE.Group(); hh.position.set(0, 32, sz * 1.2); mh.position.set(0, 32, sz * 1.28); if (sz < 0) { hh.rotation.y = Math.PI; mh.rotation.y = Math.PI; }
      hh.add(rb(0.34, 1.9, 0.08, M.black, 0, 0.75, 0, 0)); mh.add(rb(0.24, 2.7, 0.08, M.black, 0, 1.15, 0, 0)); const pin = cyl(0.25, 0.25, 0.2, gold, 0, 0, 0.06, 0, 8); pin.rotation.x = Math.PI / 2; mh.add(pin); g.add(hh, mh); s.clockH.push([hh, mh]); } }
  // the simit cart
  { const g = stAt(new THREE.Group(), -56, 1, -28, 0.25); g.add(rb(8, 3.2, 4.4, c3Prop('#c8282a', { rough: 0.4 }), 0, 4.2, 0)); g.add(pl(7.6, 2.6, c3Flat('#ffffff', { map: stTexSimit() }), 0, 4.2, 2.23));
    g.add(rb(8, 3.4, 4.4, c3Prop('#d8ecf4', { rough: 0.05, env: 1.6, transparent: true }), 0, 7.5, 0)); g.children.at(-1).material.opacity = 0.35; g.children.at(-1).userData.keep = true;
    for (let i = 0; i < 9; i++) { const sm = c3Mesh(new THREE.TorusGeometry(0.75, 0.28, 8, 16), c3Prop('#c8803a', { rough: 0.7 }), 0); sm.position.set(-3 + (i % 5) * 1.5, 6.4 + Math.floor(i / 5) * 1.5, -0.8 + (i % 2) * 1.2); sm.rotation.x = 1.2 + (i % 3) * 0.2; g.add(sm); }
    for (const sx of [-1, 1]) { const w = cyl(1.4, 1.4, 0.5, M.dark, sx * 2.8, 1.4, 2.4, 0, 14); w.rotation.x = Math.PI / 2; g.add(w); } g.add(cyl(0.25, 0.25, 16, M.steel, -3.4, 12, -1.6, 0, 6));
    const um = c3Mesh(new THREE.ConeGeometry(7, 2.6, 10), c3Prop('#ffffff', { map: tex((x, w, h) => { for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#c8282a'; x.fillRect(i * w / 10, 0, w / 10 + 1, h); } }, 256, 32), rough: 0.8 }), 0); um.position.set(-3.4, 20.6, -1.6); g.add(um);
    for (let i = 0; i < 3; i++) g.add(rb(2.8, 0.25, 2.4, c3Prop('#e8e0d0'), -2.5 + i * 2.6, 9.5, 0)); K.add(g); }
  // bins (containers): B1 (the book glint, s22 drop), B2, B3 (s07 look); bags on the sidewalk
  s.bins = {}; for (const [nm, x, z, ry] of [['b1', -14, -29.5, -Math.PI / 2], ['b2', -26, -29.5, -Math.PI / 2], ['b3', -4, -31, -Math.PI / 2], ['b4', 92, -29.5, -Math.PI / 2]]) { const c = stContainer(M, nm === 'b1' ? 1 : nm === 'b3' ? 0 : 0.15); stAt(c, x, 1, z, ry); scene.add(c); s.bins[nm] = c; }
  { const R = RNG('stbags'); for (const [x, z, k] of [[-17, -25, 1], [-19.5, -27, 0.9], [-21.5, -24.4, 1.05], [-22.5, -27.6, 0.85], [-30, -25.5, 1], [-31.5, -28, 0.9], [88, -25.5, 1], [96, -25, 0.9]]) { const b = stBag(R, k, M.bag); stAt(b, x, 1, z, R.f() * TAU); K.add(b); }
    // inside B1: bags heaped to the rim (the book lies on top)
    for (const [x, z] of [[-1, -1.4], [1, -1.2], [0, 1.3], [-1.2, 1.1], [1.2, 1.4]]) { const b = stBag(R, 0.62, M.bag); stAt(b, x, 5.9, z, R.f() * TAU); s.bins.b1.add(b); } }
  // street lamps, trees in pits, parked cars, a taxi
  for (const [x, z] of [[-90, -24], [50, -36.5], [130, -24], [-60, 24], [10, 24], [80, 24]]) { const l = c3Lamp(4.5); l.scale.setScalar(7); l.position.set(x, 1, z); K.add(l); }
  for (const [x, z, sd] of [[-130, -34], [74, -34], [-110, 34], [-30, 34], [44, 34], [150, 34]].map((v, i) => [v[0], v[1], i + 10])) { K.add(cyl(2.2, 2.2, 0.3, c3Prop('#5a4632', { rough: 0.95 }), x, 1.1, z, 0, 12)); const tr = c3LeafTree(3.6, sd, sd % 2 ? '#4f8a3a' : '#62a044'); tr.position.set(x, 1, z); K.add(tr); }
  for (const [x, z, c, kd, ry] of [[-70, 14, '#f2c21e', 'sedan', Math.PI], [-110, 14, '#e8e4dc', 'hatch', Math.PI], [60, 14, '#c8402e', 'sedan', Math.PI], [100, 14, '#2f6fb8', 'suv', Math.PI], [-150, -14, '#8a8e96', 'sedan', 0], [140, -14, '#3f8a5a', 'hatch', 0]]) { const car = c3Car({ color: c, kind: kd, scale: 5.6 }); car.position.set(x, 0, z); car.rotation.y = ry; K.add(car);
    if (c === '#f2c21e') { const sg = rb(2.6, 1.0, 0.8, c3Prop('#2a2a30'), x, 9.2, z, 0); K.add(sg); K.add(pl(2.4, 0.8, c3Flat('#ffffff', { map: tex((g2, w, h) => { g2.fillStyle = '#f2c21e'; g2.fillRect(0, 0, w, h); inked(g2, 'TAKSİ', w / 2, h / 2, h * 0.6, '#2a2a30', { stroke: false, maxW: w * 0.86 }); }, 256, 80) }), x, 9.2, z - 0.42, Math.PI)); } }
  // bunting of little Turkish flags across the street, bollards on the far curb, a büfe kiosk, a blue street sign
  { const fm = c3Prop('#ffffff', { map: stTexFlag(), rough: 0.8 }); fm.side = THREE.DoubleSide;
    for (const bx of [-112, 76, 152]) { const P = (u) => V3(bx, 36 - 7 * 4 * u * (1 - u), lerp(-40, 40, u));
      for (let i = 0; i < 40; i++) { const a = P(i / 40), b = P((i + 1) / 40), m = stBox(0.14, 0.14, a.distanceTo(b) + 0.05, M.dark, bx, (a.y + b.y) / 2, (a.z + b.z) / 2); m.rotation.x = -Math.atan2(b.y - a.y, b.z - a.z); K.add(m); }
      for (let i = 1; i < 26; i++) { const a = P(i / 26), f = pl(2.4, 1.6, fm, bx, a.y - 0.9, a.z, Math.PI / 2); f.rotation.z = 0.06 * Math.sin(i * 1.7); K.add(f); } } }
  { const bm = c3Prop('#2a3a34', { rough: 0.5, metal: 0.3 }), bt = c3Prop('#e8c04a', { rough: 0.4, metal: 0.4 }); for (let x = -130; x < 170; x += 7) { if (x > -40 && x < 44) continue; K.add(stCyl(0.42, 0.5, 3.2, bm, x, 2.6, -21.6, 10)); K.add(stSph(0.46, bm, x, 4.2, -21.6, true, 10, 5)); K.add(stCyl(0.52, 0.52, 0.3, bt, x, 3.4, -21.6, 10)); } }
  { const g = stAt(new THREE.Group(), -84, 1, -31, 0), kc = c3Prop('#2f7ab8', { rough: 0.5 }), wh = c3Prop('#f4f2ec', { rough: 0.5 });   // büfe
    g.add(stBox(9, 1.2, 7, M.dark, 0, 0.6, 0)); g.add(stBox(9, 9, 7, kc, 0, 5.7, 0)); g.add(stBox(7.4, 4.2, 0.3, M.glass, 0, 6.4, 3.55)); g.add(stBox(10, 0.8, 8, wh, 0, 10.6, 0));
    g.add(pl(8.6, 2, stSignMat('BÜFE', '#c8282a'), 0, 12, 3.7)); g.add(stBox(9, 2.4, 0.4, c3Prop('#c8282a'), 0, 12, 3.5)); const aw = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.25, 3), stAwning('#c8282a')); aw.position.set(0, 9.4, 4.8); aw.rotation.x = 0.35; g.add(aw);
    for (let i = 0; i < 6; i++) g.add(stBox(1.1, 1.5, 0.3, c3Prop(['#e84a3a', '#f2c23a', '#3a9a5a', '#2f6fb8'][i % 4]), -3 + i * 1.2, 5.4, 3.8)); g.add(stBox(3, 4.6, 2.4, c3Prop('#d8282a', { rough: 0.3 }), 5.8, 3.5, 1.4)); g.add(stBox(2.4, 3.4, 0.2, M.glass, 5.8, 4, 2.65)); K.add(g); }
  { const g = stAt(new THREE.Group(), -47, 1, -22.6, 0.2); g.add(stCyl(0.22, 0.22, 16, M.steel, 0, 8, 0, 8)); g.add(stBox(7, 1.8, 0.2, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1f4f9a'; x.fillRect(5, 5, w - 10, h - 10); inked(x, 'ATATÜRK BLV.', w / 2, h / 2, h * 0.42, '#ffffff', { stroke: false, maxW: w * 0.86 }); }, 384, 96), rough: 0.5 }), 3.2, 15, 0)); K.add(g); }
  // ---- the truck
  s.truck = stTruck(M); scene.add(s.truck);
  // the lifter container (tips into the hopper on 'trash'), its two falling bags
  s.c0 = stContainer(M, 0); s.c0piv = new THREE.Group(); scene.add(s.c0piv); s.c0piv.add(s.c0); s.c0.position.set(-2.3, -8.4, 0); s.c0.rotation.y = 0;
  s.c0bags = [0, 1].map((i) => { const b = stBag(RNG('stc0', i), 0.6, M.bag); scene.add(b); return b; });
  stBackdrop(scene, K, KM);
  scene.add(stBake(K)); scene.add(stBake(KN, { noCast: true }));
  // ---- FOCUS props: the bags he throws, the heavy bag, the books, the stack, the old book, glints
  const Fg = new THREE.Group(); scene.add(Fg);
  s.tbag = [0, 1].map((i) => { const b = stBag(RNG('sttb', i), 0.85, M.bag); Fg.add(b); return b; });
  s.mbag = stBag(RNG('stmb'), 0.75, M.bag); Fg.add(s.mbag);   // morning: the bag he tosses at 53 s
  s.heavy = stHeavyBag(M); Fg.add(s.heavy);
  s.novel = stBook(2.2, 3.2, 0.6, stTexBookCover('THE LONG ROAD', 'a novel', '#8a1e2a', '#f2d470', 1), '#8a1e2a'); Fg.add(s.novel);
  s.comic = stBook(2.4, 3.4, 0.16, stTexComic(), '#ffd21e'); Fg.add(s.comic);
  s.stack = new THREE.Group(); Fg.add(s.stack);
  { const cols = ['#1f4a3a', '#6a1e2a', '#1f3a6a', '#1f4a3a', '#6a1e2a', '#1f3a6a', '#1f4a3a', '#6a1e2a'], L = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (let i = 0; i < 7; i++) { const m = c3Prop(cols[i], { rough: 0.6 }), sp = c3Prop('#ffffff', { map: stTexSpine(L[i], cols[i]), rough: 0.6 }), pg = c3Prop('#f2e8d0', { rough: 0.9 });
      const v = new THREE.Mesh(new THREE.BoxGeometry(3.3, 0.86, 2.5), [pg, m, m, m, sp, pg]); v.position.set((i % 2 ? 0.08 : -0.06) * (i % 3), 0.43 + i * 0.88, 0); v.rotation.y = (i % 3 - 1) * 0.04; s.stack.add(v); } }
  s.bagOcc = new THREE.Mesh(new THREE.BoxGeometry(7, 12, 6), new THREE.MeshBasicMaterial({ colorWrite: false })); s.bagOcc.position.set(-11, -5, -23.2);   // depth-only: hides the stack below the sidewalk while it rises out of the bag
  Object.assign(s.bagOcc.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); s.bagOcc.renderOrder = -5; s.bagOcc.visible = false; Fg.add(s.bagOcc);
  s.old = stOldBook(); Fg.add(s.old.g);
  s.pen = new THREE.Group(); { const pm = c3Prop('#1f3aa8', { rough: 0.35 }), c = cyl(0.13, 0.13, 2.4, pm, 0, 1.35, 0, 0, 8); s.pen.add(c); s.pen.add(cyl(0.02, 0.13, 0.3, c3Prop('#e8e4dc'), 0, 0.08, 0, 0, 8)); s.pen.add(cyl(0.14, 0.14, 0.4, c3Prop('#e8c04a', { metal: 0.6, rough: 0.3 }), 0, 2.4, 0, 0, 8));
    const hd = c3Mesh(new THREE.SphereGeometry(0.36, 14, 10), c3Prop(T3.limb, { rough: 0.7 }), 0); hd.position.y = 1.5; s.pen.add(hd); } Fg.add(s.pen); s.pen.visible = false;
  s.minibook = stBook(1.6, 2.2, 0.4, stTexBookCover('POEMS', '', '#3a5a8a', '#f2e0b0', 3), '#3a5a8a'); Fg.add(s.minibook);
  s.glint = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); const c = w / 2; const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.15, 'rgba(255,230,150,0.7)'); gr.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fffbe8'; for (const a of [0, Math.PI / 2]) { g.save(); g.translate(c, c); g.rotate(a); g.beginPath(); g.moveTo(-c, 0); g.quadraticCurveTo(0, -6, c, 0); g.quadraticCurveTo(0, 6, -c, 0); g.fill(); g.restore(); } }, 256, 256), 3, 3, 12);
  s.glow = spritePlane(scene, tex((g, w, h) => { g.clearRect(0, 0, w, h); const gr = g.createRadialGradient(w / 2, h * 0.75, 0, w / 2, h * 0.75, w * 0.6); gr.addColorStop(0, 'rgba(255,240,180,0.95)'); gr.addColorStop(0.4, 'rgba(255,200,90,0.45)'); gr.addColorStop(1, 'rgba(255,170,60,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter'; for (let i = -3; i <= 3; i++) { const lg = g.createLinearGradient(0, h * 0.75, 0, 0); lg.addColorStop(0, 'rgba(255,230,150,0.5)'); lg.addColorStop(1, 'rgba(255,230,150,0)'); g.fillStyle = lg; g.beginPath(); g.moveTo(w / 2 + i * 6, h * 0.75); g.lineTo(w / 2 + i * 34 - 10, 0); g.lineTo(w / 2 + i * 34 + 10, 0); g.closePath(); g.fill(); } }, 256, 256), 9, 9, 11);
  s.glow.material.blending = THREE.AdditiveBlending; s.glow.userData.noInk2 = s.glint.userData.noInk2 = true;   // light sprites: no ink outline around their alpha (it drew a dark box over his face)
  s.bagLight = new THREE.PointLight('#ffc070', 0, 22, 1.6); s.bagLight.layers.enableAll(); scene.add(s.bagLight);
  s.chairF = s.truck.userData.chair.clone(); s.truck.userData.lib.add(s.chairF); c3Layer(s.chairF, C3.L_FOCUS); s.chairF.visible = false;
  c3Layer(Fg, C3.L_FOCUS);
  toonPerson(s, 'hero'); toonPerson(s, 'passer'); toonPerson(s, 'boss');
  c3Env(scene, { top: '#a8c0f0', mid: '#b8b4cc', bot: '#5a4a44' }); c3ShadeScene(scene, { dark: 0.18, maxSize: 200 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.6, scale: 0.3, inkSet: false, grimeH: 5, bounce: ['#9cb2e2', '#c88a5a', 0.12] });
  s.skyline = stSkyline(scene);   // v3: after the look pass (stays unlit)
  return s;
}

// v3: the distant skyline ring (horizon row at y = 0 local; the ring is centred on the camera every frame, so the haze band always
// sits under the true horizon and covers the far fogged ground with a saturated sunrise city instead of a milky band)
function stTexSkyline(day) { return tex((g, w, h) => { g.clearRect(0, 0, w, h); const R = RNG('stskyl', day ? 2 : 1), hz = Math.round(h * 0.222);
  const P = day ? { band: [[0, '#dce6f0'], [0.08, '#c4d2e6'], [0.4, '#a6b6d6'], [1, '#8a9cc4']], back: '#c8d4ea', mid: '#b0c0dc', front: '#98aacc', rim: 'rgba(255,255,255,0.5)', win: 'rgba(255,255,255,0.0)' }
    : { band: [[0, '#ff9a58'], [0.07, '#f2805c'], [0.3, '#d06a70'], [1, '#86527e']], back: '#f49a6c', mid: '#dc7a74', front: '#b86076', rim: 'rgba(255,200,140,0.9)', win: 'rgba(255,214,130,0.85)' };
  const gb = g.createLinearGradient(0, hz, 0, h); P.band.forEach(([k, c]) => gb.addColorStop(k, c)); g.fillStyle = gb; g.fillRect(0, hz - 1, w, h - hz + 1);
  for (let i = 0; i < 7000; i++) { const y = hz + Math.pow(R.f(), 1.4) * (h - hz) * 0.9, k = (y - hz) / (h - hz), bw = R.r(4, 18) * (1 + k * 2), bh = R.r(3, 7) * (1 + k * 3);   // the sprawl: blocks + lit windows (v3: dense + opaque, the thin version read as a sea)
    const x = R.r(0, w), a = 0.45 + 0.4 * Math.min(1, k * 3); g.fillStyle = day ? `rgba(${R.f() < 0.5 ? '236,226,214' : '186,110,90'},${a})` : `rgba(${R.f() < 0.45 ? '250,196,150' : R.f() < 0.6 ? '196,90,70' : '120,60,90'},${a})`; g.fillRect(x, y, bw, bh);
    if (R.f() < 0.5) { g.fillStyle = day ? 'rgba(180,90,70,' + a + ')' : 'rgba(170,70,60,' + a + ')'; g.fillRect(x - 1, y - 1.5 - k * 2, bw + 2, 1.5 + k * 2); }   // terracotta roof line
    if (R.f() < 0.35) { g.fillStyle = P.win; g.fillRect(x + R.r(0, bw), y + R.r(0, bh), 1.5 + k * 2, 1.5 + k * 2); } }
  const sil = (col, hmin, hmax, dens, minP) => { g.fillStyle = col; let x = 0; while (x < w) { const bw = R.r(10, 40), bh = R.r(hmin, hmax); g.fillRect(x, hz - bh, bw, bh + 2);
      if (R.f() < 0.25) { g.beginPath(); g.arc(x + bw / 2, hz - bh, bw * 0.45, Math.PI, 0); g.fill(); }   // a dome
      if (R.f() < minP) { const mx = x + R.r(0, bw), mh = bh + R.r(16, 40); g.fillRect(mx - 1.5, hz - mh, 3, mh); g.beginPath(); g.moveTo(mx - 2, hz - mh); g.lineTo(mx, hz - mh - 9); g.lineTo(mx + 2, hz - mh); g.fill(); g.fillRect(mx - 3, hz - mh * 0.8, 6, 2); }   // a minaret
      x += bw + (R.f() < dens ? 0 : R.r(4, 30)); } };
  sil(P.back, 14, 46, 0.5, 0.06); sil(P.mid, 8, 26, 0.65, 0.04); sil(P.front, 2, 12, 0.85, 0.0);
  g.fillStyle = P.rim; for (let x = 0; x < w; x += 2) { const c = g.getImageData(x, 0, 1, hz).data; for (let y = 0; y < hz; y++) if (c[y * 4 + 3] > 200) { g.fillRect(x, y, 2, 1.5); break; } } }, 4096, 512); }
function stSkyline(scene) { const geo = new THREE.CylinderGeometry(760, 760, 360, 128, 1, true); geo.translate(0, -100, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: stTexSkyline(false), transparent: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }));
  m.userData.noInk2 = m.userData.noCast = m.userData.noShade = true; m.renderOrder = -9; c3Layer(m, C3.L_BG); scene.add(m); m.userData.tex = [stTexSkyline(false), stTexSkyline(true)]; m.material.map = m.userData.tex[0]; return m; }

// distant city: rows of apartment blocks behind the square and on the near side (wall tiles with framed windows, balcony
// slabs, cornices, tiled hip roofs or parapet roofs with water tanks / stair houses / aerials / dishes), poplars, hills;
// the two mosques (KM) are baked in with them (no shadows)
function stBackdrop(scene, K, KM) { const R = RNG('stbd'), cols = ['#f2a068', '#f2c84a', '#5ab8a8', '#ee7a68', '#e8b878', '#f4b080', '#88c068', '#e08a5a', '#f0d8b0', '#d86a50'];
  const mats = cols.map((c, i) => c3Prop('#ffffff', { map: stTexDistant(i, c), rough: 0.9 })), cream = c3Prop('#e6d2b2', { rough: 0.85 }), roof = c3Prop('#9a8a80', { rough: 0.95 }), steel = c3Prop('#9aa2ac', { metal: 0.4, rough: 0.5 }), tank = c3Prop('#f0f0ec', { rough: 0.4 }), tankB = c3Prop('#4a9ad0', { rough: 0.4 });
  const leaf = c3Prop('#4f8a3a', { rough: 0.85 }), leaf2 = c3Prop('#3a7a46', { rough: 0.85 }), bark = c3Prop('#6a4a32', { rough: 0.9 });
  function bld(x, z, w, h, d, ry) { const g = stAt(new THREE.Group(), x, 0, z, ry), ci = R.i(0, cols.length - 1); KM.add(g);
    g.add(stBoxT(w, h, d, mats[ci], 0, h / 2, 0, 24, 28)); g.add(stBox(w + 1.2, 1.4, d + 1.2, cream, 0, h + 0.2, 0)); g.add(stBox(w + 0.4, 5, d + 0.4, c3Prop(c3Shd(cols[ci], 0.75), { rough: 0.9 }), 0, 2.5, 0));
    for (let y = 14; y < h - 4; y += 14) g.add(stBox(w * 0.92, 0.7, 2.6, cream, 0, y - 1.5, d / 2 + 1.3));   // balcony slabs on the street face
    if (R.f() < 0.62) { const hr = stHipRoof(w + 2, d + 2, Math.min(11, d * 0.35), ST.tileM); hr.position.y = h + 0.9; g.add(hr); }
    else { g.add(stBox(w - 0.4, 0.3, d - 0.4, roof, 0, h + 1.0, 0)); g.add(stBox(w + 1, 2, 0.5, cream, 0, h + 1.6, d / 2)); g.add(stBox(w + 1, 2, 0.5, cream, 0, h + 1.6, -d / 2)); if (R.f() < 0.6) g.add(stBox(6, 5, 6, cream, R.r(-w / 4, w / 4), h + 2.5, -d / 5));
      for (let k = 0; k < R.i(1, 3); k++) { const tx = -w / 2 + 5 + k * 4.5; g.add(stCyl(1.6, 1.6, 3.2, k % 2 ? tankB : tank, tx, h + 3.4, d / 5, 10)); }
      const ax = R.r(-w / 3, w / 3); g.add(stCyl(0.15, 0.15, 10, steel, ax, h + 5, -d / 4, 4)); g.add(stBox(4, 0.15, 0.15, steel, ax, h + 8.5, -d / 4)); g.add(stBox(2.6, 0.15, 0.15, steel, ax, h + 9.6, -d / 4)); }
    if (R.f() < 0.5) { const dd = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 5, 0, TAU, 0, 0.9), tank); dd.position.set(R.r(-w / 3, w / 3), h + 2.6, d / 2 - 1); dd.rotation.x = 1.0; g.add(dd); } }
  function poplar(x, z, hh) { KM.add(stCyl(0.6, 0.8, hh * 0.3, bark, x, hh * 0.15, z, 6)); const c = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), R.f() < 0.5 ? leaf : leaf2); c.scale.set(hh * 0.16, hh * 0.45, hh * 0.16); c.position.set(x, hh * 0.62, z); KM.add(c); }
  // far side rows (fronts face +z)
  for (let z = -128; z > -600; z -= R.r(48, 62)) { let x = -440; while (x < 540) { const w = R.r(28, 52), d = R.r(22, 34), h = R.r(28, 70) + (R.f() < 0.08 ? 40 : 0);
      if (!(Math.abs(x + w / 2 - 30) < 95 && z < -250 && z > -440)) bld(x + w / 2, z - d / 2, w, h, d, R.n(0.04)); else if (R.f() < 0.5) poplar(x + w / 2, z - 10, R.r(26, 40));
      x += w + (R.f() < 0.3 ? R.r(10, 18) : R.r(1, 3)); if (R.f() < 0.25) poplar(x - 4, z - 4, R.r(24, 38)); } }
  // near side rows (fronts face -z)
  for (let z = 128; z < 520; z += R.r(48, 62)) { let x = -440; while (x < 540) { const w = R.r(28, 52), d = R.r(22, 34), h = R.r(28, 66); bld(x + w / 2, z + d / 2, w, h, d, Math.PI + R.n(0.04)); x += w + (R.f() < 0.3 ? R.r(10, 18) : R.r(1, 3)); } }
  for (let i = 0; i < 6; i++) { const hl = new THREE.Mesh(new THREE.SphereGeometry(700, 24, 8, 0, TAU, 0, Math.PI / 2), c3Prop('#a89ac0', { rough: 1 })); hl.scale.set(1.4, 0.16 + R.f() * 0.06, 1); hl.position.set(-1500 + i * 600, -10, -1700); KM.add(hl); }
  scene.add(stBake(KM, { noCast: true, ao: false })); }

// a book: box with a cover texture on top (+y) — local origin = centre
function stBook(w, h, d, cover, col) { const m = c3Prop(col, { rough: 0.6 }), pg = c3Prop('#f2e8d0', { rough: 0.9 }), cv = c3Prop('#ffffff', { map: cover, rough: 0.6 });
  const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [pg, m, pg, pg, cv, m]); g.add(b); g.visible = false; return g; }
// the old book of the ending: two halves hinged on the spine (local z), open(k): 0 closed, 1 flat open; pages face +y
function stOldBook() { const g = new THREE.Group(), cover = c3Prop('#6a3a24', { rough: 0.7 }), edge = c3Prop('#e8dcc0', { rough: 0.9 });
  const C0 = canvasTex(512, 680), mk = (sx, mapTex) => { const h = new THREE.Group(); h.add(rb(2.5, 0.12, 3.4, cover, sx * 1.25, 0.06, 0, 0)); h.add(rb(2.36, 0.3, 3.24, edge, sx * 1.2, 0.27, 0, 0));
    const p = pl(2.3, 3.2, c3Prop('#ffffff', { map: mapTex, rough: 0.9 }), sx * 1.2, 0.43, 0, 0, -Math.PI / 2); h.add(p); return h; };
  const R0 = mk(1, C0.t), L0 = mk(-1, stTexLeftPage()); g.add(R0); g.add(L0); g.visible = false;
  L0.add(pl(2.2, 3.1, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#6a3a24'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e2b84a'; x.lineWidth = 8; x.strokeRect(18, 18, w - 36, h - 36); x.lineWidth = 3; x.strokeRect(32, 32, w - 64, h - 64); x.fillStyle = '#e2b84a'; x.beginPath(); x.arc(w / 2, h * 0.44, w * 0.14, 0, TAU); x.fill(); x.fillStyle = '#6a3a24'; x.beginPath(); x.arc(w / 2, h * 0.44, w * 0.09, 0, TAU); x.fill(); x.fillStyle = '#e2b84a'; for (const y of [0.66, 0.72]) x.fillRect(w * 0.28, h * y, w * 0.44, 6); }, 128, 180), rough: 0.6 }), -1.25, -0.005, 0, 0, Math.PI / 2));   // v2: a gold-tooled cover (reads as a book when closed)
  return { g, L: L0, R: R0, C: C0, open: (k) => { const a = -(1 - k) * Math.PI * 0.995; L0.rotation.z = a; L0.position.set(0.45 * Math.sin(a), 0.45 * (1 - Math.cos(a)), 0); },   // v2: hinged at the page top (0.45), so it closes OVER the pages (it folded under before: the closed book showed THE END)
    page: (strike, write) => { const a = Math.round(strike * 12) / 12, b = Math.round(write * 24) / 24; redraw(C0, a + ':' + b, (x, w, h) => stDrawPage(x, w, h, a, b)); } }; }
// the heavy bag: a lower sack + 4 top flaps (open) + the knot; books packed inside; .open(k), .empty(k)
function stHeavyBag(M) { const g = new THREE.Group(), R = RNG('stheavy'), m2 = M.bag.clone(); m2.side = THREE.DoubleSide; const T0 = Math.PI * 0.32, SX = 2.5, SY = 2.3, SZ = 2.2, Y0 = 2.3;
  const geo = new THREE.SphereGeometry(1, 18, 12, 0, TAU, T0, Math.PI - T0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const f = 1 + R.n(0.04) + (Math.abs(p.getX(i)) > 0.7 && p.getY(i) > -0.4 ? 0.05 : 0); p.setXYZ(i, p.getX(i) * f, p.getY(i), p.getZ(i) * f); } geo.computeVertexNormals();
  const body = new THREE.Group(); body.scale.set(SX, SY, SZ); body.position.y = Y0; g.add(body); body.add(new THREE.Mesh(geo, m2));
  // the top cap in 4 petals, each hinged on the rim (they fold out when it opens)
  const rimY = Math.cos(T0), rimR = Math.sin(T0), petals = [];
  for (let i = 0; i < 4; i++) { const ph = i * Math.PI / 2, mid = ph + Math.PI / 4, piv = new THREE.Group(); piv.position.set(Math.sin(mid) * rimR, rimY, Math.cos(mid) * rimR); body.add(piv);
    const pm = new THREE.Mesh(new THREE.SphereGeometry(1, 6, 4, ph, Math.PI / 2, 0, T0), m2); pm.position.copy(piv.position).negate(); piv.add(pm); piv.userData.axis = V3(Math.cos(mid), 0, -Math.sin(mid)); petals.push(piv); }
  const knot = new THREE.Group(); knot.position.y = Y0 + SY + 0.3; g.add(knot); { const kn = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 7), M.bag); kn.rotation.z = Math.PI; knot.add(kn); for (const s2 of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.42, 7, 5), M.bag); e.scale.set(1.5, 0.6, 0.7); e.position.set(s2 * 0.5, 0.5, 0); e.rotation.z = s2 * 0.6; knot.add(e); } }
  const inside = new THREE.Group(); inside.position.y = 1.4; g.add(inside); const bc = ['#c8402e', '#2f6aa8', '#e2a23a', '#3f8a5a', '#8a4aa8', '#e8e0cc'];
  for (let i = 0; i < 6; i++) { const b = rb(R.r(0.55, 0.85), R.r(2.3, 2.7), R.r(1.8, 2.1), c3Prop(bc[i % 6], { rough: 0.6 }), -1.25 + i * 0.5, 1.3, R.n(0.3), 0); b.rotation.z = R.n(0.2); inside.add(b); }
  g.userData.open = (k) => { knot.visible = k < 0.3; petals.forEach((pv) => { pv.quaternion.setFromAxisAngle(pv.userData.axis, k * 2.55); pv.scale.setScalar(1 - 0.5 * k); }); };   // v3: smaller torn flaps (one hung across his belly)
  g.userData.empty = (k) => { body.scale.set(SX * (1 + 0.15 * k), SY * (1 - 0.8 * k), SZ * (1 + 0.1 * k)); body.position.y = Y0 * (1 - 0.8 * k); inside.visible = k < 0.3; g.scale.setScalar(1 - 0.35 * k); };
  g.userData.open(0); g.userData.empty(0); g.visible = false; return g; }
// ---- rounded-part helpers (truck, containers): rounded box with a real radius, a tube between two points, a rounded-rect path,
// a shape extruded along z (centred, bevelled edges), a round lamp (domed lens + chrome bezel) facing +x (dir 1) or -x (dir -1)
const stRB = (w, h, d, mat, x, y, z, r = 0.3) => { const m = c3Mesh(c3RBox(w, h, d, r, 3), mat, 0); m.position.set(x, y, z); return m; };
function stTube(a, b, r, mat, seg = 10) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), seg), mat); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.normalize()); return m; }
function stRRect(p, x0, y0, x1, y1, r) { p.moveTo(x0 + r, y0); p.lineTo(x1 - r, y0); p.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false); p.lineTo(x1, y1 - r); p.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  p.lineTo(x0 + r, y1); p.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false); p.lineTo(x0, y0 + r); p.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false); return p; }
function stExt(shape, depth, mat, b = 0.2, seg = 3) { const dd = Math.max(0.01, depth - 2 * b), g = new THREE.ExtrudeGeometry(shape, { depth: dd, bevelEnabled: b > 0, bevelSize: b, bevelThickness: b, bevelSegments: seg, curveSegments: 16 }); g.translate(0, 0, -dd / 2); return c3Mesh(g, mat, 0); }
function stLamp(par, mat, x, y, z, r, dir, bez) { const l = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.3, 20), mat); l.rotation.z = Math.PI / 2; l.position.set(x + dir * 0.1, y, z); par.add(l);
  const R = r * 1.6, dm = new THREE.Mesh(new THREE.SphereGeometry(R, 20, 6, 0, TAU, 0, 0.636), mat); dm.rotation.z = -dir * Math.PI / 2; dm.position.set(x + dir * (0.25 - R * 0.804), y, z); par.add(dm);
  const b = new THREE.Mesh(new THREE.TorusGeometry(r + 0.06, 0.13, 8, 24), bez); b.rotation.y = Math.PI / 2; b.position.set(x + dir * 0.2, y, z); par.add(b); }
// grime overlay (white base: multiplies the material colour): drips from the top, scuffs, scratches, a darker foot
function stTexGrime(seed, base = '#ffffff') { return tex((g, w, h) => { const R = RNG('stgrime', seed); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)'; g.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
  for (let i = 0; i < 14; i++) { const x = R.r(0, w), gs = g.createLinearGradient(0, 0, 0, h * R.r(0.3, 0.8)); gs.addColorStop(0, 'rgba(40,30,20,0.24)'); gs.addColorStop(1, 'rgba(40,30,20,0)'); g.fillStyle = gs; g.fillRect(x, 0, R.r(3, 12), h); }
  g.lineWidth = 1.5; for (let i = 0; i < 12; i++) { g.strokeStyle = 'rgba(255,255,255,0.28)'; g.beginPath(); const x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); g.lineTo(x + R.r(-30, 30), y + R.r(-8, 8)); g.stroke(); }
  for (let i = 0; i < 7; i++) { g.fillStyle = 'rgba(30,20,10,0.13)'; g.beginPath(); g.ellipse(R.r(0, w), R.r(0, h), R.r(8, 26), R.r(5, 14), R.r(0, 3), 0, TAU); g.fill(); } }, 256, 256); }
// the tailgate side plate (cap UVs are world x/y: u = x / 12, v = (y - 3.6) / 21.6); mirror-safe (no text): pressed panel, ribs,
// rivets, a red/white reflective strip down the rear edge, a recycling disc, grime at the foot
function stTexGateSide() { const t = tex((g, w, h) => { const X = (x) => x / 12 * w, Y = (y) => h * (1 - (y - 3.6) / 21.6), R = RNG('stgside');
  g.fillStyle = '#ff7a1c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1500; i++) { g.fillStyle = R.f() < 0.5 ? 'rgba(120,40,0,0.06)' : 'rgba(255,255,255,0.06)'; g.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  const rr = (x0, y0, x1, y1, col, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.roundRect(X(x0), Y(y1), X(x1) - X(x0), Y(y0) - Y(y1), 16); g.stroke(); };
  rr(1.9, 6.2, 10.6, 21.2, 'rgba(255,226,190,0.45)', 4); rr(1.75, 6.05, 10.45, 21.05, 'rgba(120,40,0,0.45)', 5);
  for (const y of [11.2, 16.2]) { g.fillStyle = 'rgba(120,40,0,0.32)'; g.fillRect(X(2.2), Y(y), X(10.2) - X(2.2), 5); g.fillStyle = 'rgba(255,226,190,0.35)'; g.fillRect(X(2.2), Y(y) + 5, X(10.2) - X(2.2), 3); }
  g.fillStyle = 'rgba(90,30,0,0.55)'; for (let y = 5; y < 24.5; y += 1.25) { g.beginPath(); g.arc(X(11.25), Y(y), 3.5, 0, TAU); g.fill(); } for (let x = 2.5; x < 11; x += 1.25) { g.beginPath(); g.arc(X(x), Y(4.6), 3.5, 0, TAU); g.fill(); }
  g.save(); g.beginPath(); g.rect(X(0.3), Y(20.2), X(1.3) - X(0.3), Y(5.2) - Y(20.2)); g.clip(); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.fillStyle = '#e0202a'; for (let y = -40; y < h + 40; y += 44) { g.beginPath(); g.moveTo(0, y); g.lineTo(X(1.5), y - 30); g.lineTo(X(1.5), y - 8); g.lineTo(0, y + 22); g.fill(); } g.restore();
  g.strokeStyle = 'rgba(80,20,0,0.5)'; g.lineWidth = 3; g.strokeRect(X(0.3), Y(20.2), X(1.3) - X(0.3), Y(5.2) - Y(20.2));
  const cx = X(6.2), cy = Y(8.4), r = X(1.25); g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fill(); g.lineWidth = 5; g.strokeStyle = '#2a7a4a'; g.stroke(); g.fillStyle = '#2a7a4a';
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3 - Math.PI / 2; g.save(); g.translate(cx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42); g.rotate(a + Math.PI / 2); g.beginPath(); g.moveTo(-r * 0.32, r * 0.12); g.lineTo(r * 0.18, r * 0.12); g.lineTo(r * 0.18, r * 0.3); g.lineTo(r * 0.42, 0); g.lineTo(r * 0.18, -r * 0.3); g.lineTo(r * 0.18, -r * 0.12); g.lineTo(-r * 0.32, -r * 0.12); g.fill(); g.restore(); }
  const gb = g.createLinearGradient(0, Y(8), 0, h); gb.addColorStop(0, 'rgba(80,30,0,0)'); gb.addColorStop(1, 'rgba(70,25,0,0.42)'); g.fillStyle = gb; g.fillRect(0, Y(8), w, h - Y(8)); }, 384, 704);
  t.repeat.set(1 / 12, 1 / 21.6); t.offset.set(0, -3.6 / 21.6); return t; }
function stTexDiamond() { return tex((g, w, h) => { g.fillStyle = '#9aa0aa'; g.fillRect(0, 0, w, h); for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const x = i * w / 8 + (j % 2) * w / 16, y = j * h / 8, a = (i + j) % 2 ? 0.6 : -0.6;
  g.save(); g.translate(x + w / 16, y + h / 16); g.rotate(a); g.fillStyle = 'rgba(40,44,54,0.5)'; g.fillRect(-9, -1, 18, 4); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-9, -3, 18, 2.5); g.restore(); }
  for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(40,30,20,0.08)'; g.fillRect((i * 37) % w, (i * 53) % h, 3, 3); } }, 128, 128); }
function stTexPlate() { return tex((g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1a1a1a'; g.lineWidth = 5; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#1f4fb0'; g.fillRect(5, 5, w * 0.11, h - 10);
  inked(g, 'TR', w * 0.065, h * 0.72, h * 0.3, '#ffffff', { stroke: false }); inked(g, '06 ÇNK 153', w * 0.56, h * 0.53, h * 0.6, '#1a1a1a', { stroke: false, maxW: w * 0.8 }); }, 256, 60); }

// the truck (local: rear face at x = 0, cab at +x, centre z = 0). userData: gate (tailgate pivot), blade, door, crate, wheels,
// beacon, lib (library light), shell (the body shell: stEndKit copies it as the FOCUS depth occluder)
// v3: a rounded cartoon rear-loader (Ricks): extruded body shell with rounded long edges + rear/front collars, a tailgate with a
// rounded hood, profiled side plates (pressed panel texture), a real curved hopper scoop, round lamps in rubber housings,
// grab handles + lifter rails on the gate, a cab with a wheel arch, raked windscreen with rubber seal, round headlights,
// grille, rounded bumpers, mirrors, mudguards/flares, tread tyres with painted rims, mud flaps, hazard stripes, plate
function stTruck(M) { const g = new THREE.Group(), add = (m) => { g.add(m); return m; };
  const sideT = stTexTruckSide(), side = c3Prop('#ffffff', { map: sideT, rough: 0.32, env: 1.2 });
  const rub = c3Prop('#1e1e26', { rough: 0.85 }), gun = c3Prop('#4a505c', { metal: 0.4, rough: 0.45 }), yel = c3Prop('#ffc21e', { rough: 0.4 }), paint = c3Prop('#d2d6dc', { metal: 0.3, rough: 0.35 }),
    lensR = c3Prop('#e0202a', { emissive: '#c01018', ei: 0.8, rough: 0.12 }), lensA = c3Prop('#ffa020', { emissive: '#e88010', ei: 0.7, rough: 0.12 }), lensW = c3Prop('#fffbe8', { emissive: '#fff2c8', ei: 0.85, rough: 0.08 }),
    inner = c3Prop('#ffffff', { map: stRep(stTexGrime(7, '#55555e'), 0.2, 0.2), rough: 0.8 }), hzM = c3Prop('#ffffff', { map: stRep(stTexChevron(), 6, 1), rough: 0.45 }), seatM = c3Prop('#3a4a6a', { rough: 0.8 }),
    bc = c3Prop('#ffb020', { emissive: '#ff9000', ei: 0.9, glow: '#ffa020', rough: 0.2 }), flareM = c3Prop('#26262e', { rough: 0.7 });
  inner.side = THREE.DoubleSide; flareM.side = THREE.DoubleSide;
  // wheels: tread tyres with rounded shoulders, painted rims, chrome lip + hub cap, lug nuts
  g.userData.wheels = []; for (const x of [19, 26.5, 38]) for (const z of [-7.1, 7.1]) { const w = new THREE.Group(); w.position.set(x, 3.6, z); const sz = Math.sign(z);
    const t = cyl(3.45, 3.45, 2.4, M.tyre, 0, 0, 0, 0, 28); t.rotation.x = Math.PI / 2; w.add(t);
    for (const s2 of [-1, 1]) { const sh = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.45, 8, 32), M.tyre); sh.position.z = s2 * 0.75; w.add(sh); }
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, tr = rb(0.28, 0.55, 2.0, rub, Math.cos(a) * 3.5, Math.sin(a) * 3.5, 0, 0); tr.rotation.z = a; w.add(tr); }
    const rim = cyl(2.25, 2.25, 0.3, paint, 0, 0, sz * 1.1, 0, 24); rim.rotation.x = Math.PI / 2; w.add(rim);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.16, 6, 28), M.chrome); lip.position.z = sz * 1.26; w.add(lip);
    const dish = cyl(1.5, 1.5, 0.3, gun, 0, 0, sz * 1.18, 0, 20); dish.rotation.x = Math.PI / 2; w.add(dish);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.72, 16, 8, 0, TAU, 0, Math.PI / 2), M.chrome); cap.rotation.x = sz * Math.PI / 2; cap.position.z = sz * 1.3; w.add(cap);
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, l = cyl(0.2, 0.2, 0.3, M.chrome, Math.cos(a) * 1.12, Math.sin(a) * 1.12, sz * 1.36, 0, 6); l.rotation.x = Math.PI / 2; w.add(l); }
    g.add(w); g.userData.wheels.push(w); }
  // chassis rails + body sub-frame; rear bumper (hazard stripes, rubber blocks, plate); back steps (tread ribs, yellow nosing, struts)
  add(rb(33, 1.6, 9, M.dark, 27.5, 4.4, 0)); add(rb(11.5, 1.0, 9, M.dark, 5.75, 3.3, 0)); add(rb(19.7, 1.0, 14.6, M.dark, 21.65, 5.5, 0));   // chassis (drops under the hopper so it never pokes through the scoop)
  add(stRB(11.0, 0.3, 14.0, c3Prop('#ffffff', { map: stRep(stTexDiamond(), 0.45, 0.45), metal: 0.45, rough: 0.4 }), 6.6, 3.95, 0, 0.12));   // diamond-plate deck under the hopper (the library's porch when the gate lifts)
  add(stRB(1.6, 1.9, 16.4, gun, 0.1, 3.3, 0, 0.55)); add(pl(15.2, 1.2, hzM, -0.72, 3.3, 0, -Math.PI / 2)); add(pl(3.4, 0.8, c3Prop('#ffffff', { map: stTexPlate(), rough: 0.4 }), -0.76, 3.3, 0, -Math.PI / 2));
  for (const sz of [-1, 1]) { add(stRB(0.6, 1.5, 1.4, rub, -0.75, 3.3, sz * 7.5, 0.25));
    add(rb(2.8, 0.45, 3.2, M.steel, -1.4, 2.62, sz * 6)); add(rb(0.35, 0.5, 3.2, yel, -2.72, 2.62, sz * 6, 0)); for (const dz of [-1, 0, 1]) add(rb(2.3, 0.1, 0.24, gun, -1.35, 2.88, sz * 6 + dz * 0.9, 0));
    for (const dz of [-1.2, 1.2]) add(stTube(V3(-2.3, 2.42, sz * 6 + dz), V3(-0.75, 2.95, sz * 6 + dz), 0.13, gun, 6)); }
  // body shell: rounded-rect section (outer r 1.6) extruded along x, hollow (the library lives inside); collars front + rear
  const shS = stRRect(new THREE.Shape(), -8.3, 6.0, 8.3, 25.0, 1.6); shS.holes.push(stRRect(new THREE.Path(), -7.75, 6.6, 7.75, 24.3, 0.5));
  const shell = stExt(shS, 19.7, M.orange, 0.15); shell.geometry.rotateY(-Math.PI / 2); shell.position.set(21.65, 0, 0); add(shell); g.userData.shell = shell;
  { const cS = stRRect(new THREE.Shape(), -8.55, 5.75, 8.55, 25.25, 1.8); cS.holes.push(stRRect(new THREE.Path(), -7.75, 6.6, 7.75, 24.3, 0.5));
    for (const [x, d] of [[12.4, 0.8], [31.3, 0.6]]) { const c = stExt(cS, d, M.orangeD, 0.12); c.geometry.rotateY(-Math.PI / 2); c.position.set(x, 0, 0); add(c); } }
  add(rb(1.0, 18, 16.4, M.orange, 31, 15.5, 0));
  for (const sz of [-1, 1]) { add(pl(18.4, 15.0, side, 21.9, 15.6, sz * 8.47, sz > 0 ? 0 : Math.PI));
    { const rr = cyl(0.32, 0.32, 18.6, rub, 21.9, 6.9, sz * 8.2, 0, 10); rr.rotation.z = Math.PI / 2; add(rr); }   // rubber rub-rail on the lower edge
    for (const x of [14.6, 21.9, 29.2]) { add(stRB(1.3, 0.75, 0.3, rub, x, 8.25, sz * 8.5, 0.12)); add(stRB(1.0, 0.5, 0.25, lensA, x, 8.25, sz * 8.62, 0.12)); }   // side marker lamps
    for (const x of [14.6, 29.2]) { add(stRB(1.0, 0.5, 0.25, lensA, x, 24.0, sz * 8.5, 0.12)); }   // top corner markers
    for (const x of [19, 26.5]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(4.35, 4.35, 1.3, 28, 1, true, Math.PI / 2, Math.PI), flareM); f.geometry.rotateX(Math.PI / 2); f.position.set(x, 3.6, sz * 8.55); add(f);
      const lp = new THREE.Mesh(new THREE.TorusGeometry(4.35, 0.2, 6, 28, Math.PI), flareM); lp.position.set(x, 3.6, sz * 9.2); add(lp); }   // mudguard flares
    add(rb(0.2, 3.0, 2.4, rub, 14.5, 2.9, sz * 7.1, 0)); add(rb(0.22, 0.5, 1.2, lensR, 14.38, 2.0, sz * 7.1, 0));   // mud flap + reflector
    add(stRB(2.8, 2.0, 1.4, gun, 12.9, 4.4, sz * 6.9, 0.35)); add(rb(0.8, 0.3, 0.2, M.chrome, 12.9, 4.9, sz * 7.62, 0)); }   // toolbox
  // the cosy library inside (seen when the tailgate lifts): wallpaper, shelves of books, rug, armchair, floor lamp, a picture
  { const lib = new THREE.Group(); g.add(lib); const wp = c3Prop('#ffffff', { map: stTexWallpaper(), rough: 0.9 });
    for (const sz of [-1, 1]) lib.add(pl(19, 17, wp, 21.5, 15.6, sz * 7.55, sz > 0 ? Math.PI : 0)); lib.add(pl(15, 17, wp, 30.45, 15.6, 0, -Math.PI / 2)); lib.add(pl(19, 15, c3Prop('#5a3a2a', { rough: 0.8 }), 21.5, 23.95, 0, 0, Math.PI / 2));
    lib.add(pl(18, 14.6, c3Prop('#8a5a34', { map: texWood(), rough: 0.7 }), 21.5, 7.02, 0, 0, -Math.PI / 2)); lib.add(pl(9, 7, c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#b8323a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2c86a'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28); x.fillStyle = '#f2c86a'; for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(w / 2, h / 2, 12 + i * 18, 0, TAU); x.lineWidth = 3; x.stroke(); } }, 256, 200), rough: 0.95 }), 19, 7.08, 0, 0, -Math.PI / 2));
    const sh = c3Prop('#7a4a2a', { rough: 0.7 }); for (const sz of [-1, 1]) for (const y of [9, 13.4, 17.8, 22]) { lib.add(rb(17, 0.4, 2.2, sh, 21.8, y, sz * 6.3, 0)); const bk = pl(16.6, 3.8, c3Prop('#ffffff', { map: texBooks(7 + y + sz), rough: 0.8 }), 21.8, y + 2.1, sz * 6.0, sz > 0 ? Math.PI : 0); lib.add(bk); }
    for (const y of [11, 15.4, 19.8]) { lib.add(rb(0.5, 0.4, 9, sh, 29.6, y, 0, 0)); lib.add(pl(8.8, 3.8, c3Prop('#ffffff', { map: texBooks(30 + y), rough: 0.8 }), 29.3, y + 2.1, 0, -Math.PI / 2)); }
    const ch = new THREE.Group(); ch.position.set(23.5, 7, 0); lib.add(ch); g.userData.chair = ch; const vel = c3Prop('#b8323a', { rough: 0.85 });
    ch.add(rb(5.2, 1.5, 6.4, vel, 0, 1.45, 0)); ch.add(rb(1.6, 6.6, 6.6, vel, 2.3, 4.0, 0)); for (const sz of [-1, 1]) ch.add(rb(5.2, 1.8, 1.2, vel, -0.2, 3.1, sz * 3.4)); for (const [a, b] of [[-2, -2.6], [2, -2.6], [-2, 2.6], [2, 2.6]]) ch.add(cyl(0.25, 0.18, 0.7, M.wood, a, 0.35, b, 0, 6));
    ch.add(rb(3.6, 3.2, 0.8, c3Prop('#f2c86a', { rough: 0.9 }), 1.4, 5.0, 1.6));   // a cushion   (v2: a low lounge chair — seat top 2.2 = 0.6 x a toon's hip, so he really sits)
    const lamp = new THREE.Group(); lamp.position.set(23, 7, -5.2); lib.add(lamp); lamp.add(cyl(1.2, 1.2, 0.3, M.dark, 0, 0.15, 0, 0, 12)); lamp.add(cyl(0.15, 0.15, 10, c3Prop('#c8a050', { metal: 0.6, rough: 0.3 }), 0, 5, 0, 0, 6));
    { const shd = c3Mesh(new THREE.CylinderGeometry(1.4, 2.4, 2.6, 16, 1, true), c3Prop('#ffe2a0', { emissive: '#ffc070', ei: 1.1, glow: '#ffc070' }), 0); shd.material.side = THREE.DoubleSide; shd.position.y = 10.6; lamp.add(shd); }
    lib.add(rb(3, 2.4, 3, M.wood, 23, 8.2, 5.4, 0)); lib.add(mug('#e8f0f8', 23, 9.4, 5.0));   // a side table + a tea glass
    g.userData.libLight = new THREE.PointLight('#ffb868', 0, 30, 1.4); g.userData.libLight.position.set(22, 18, 0); g.userData.libLight.layers.enableAll(); lib.add(g.userData.libLight); g.userData.lib = lib; }
  // tailgate (pivot at the top front edge, x 12, y 24.6). Direct mesh children = the plates (stEndKit copies them as depth
  // occluders); lamps, handles, beads and the lifter live in the sub-group gd. Shapes are drawn in truck coordinates.
  const gate = new THREE.Group(); gate.position.set(12, 24.6, 0); g.add(gate); g.userData.gate = gate; const ga = (m, x, y, z) => { m.position.set(x - 12, y - 24.6, z); gate.add(m); return m; };
  const gd = new THREE.Group(); gate.add(gd); const GO = V3(12, 24.6, 0), gp = (m, x, y, z) => { m.position.set(x - 12, y - 24.6, z); gd.add(m); return m; }, gt = (a, b, r, m) => gd.add(stTube(a.clone().sub(GO), b.clone().sub(GO), r, m, 8));
  const gtx = c3Prop('#ffffff', { map: stTexTailgate(), rough: 0.32, env: 1.2 }), gsM = c3Prop('#ffffff', { map: stTexGateSide(), rough: 0.32, env: 1.2 });
  { const hS = new THREE.Shape(); hS.moveTo(0.2, 13.2); hS.lineTo(0.2, 20.85); hS.absarc(4.2, 20.85, 4.0, Math.PI, Math.PI / 2, true); hS.lineTo(11.8, 24.85); hS.lineTo(11.8, 23.9); hS.lineTo(4.2, 23.9); hS.absarc(4.2, 20.85, 3.05, Math.PI / 2, Math.PI, false); hS.lineTo(1.15, 13.2); hS.closePath();
    ga(stExt(hS, 16.6, M.orange, 0.2), 0, 0, 0);   // the hood: rear face + rounded top
    const sS = new THREE.Shape(); sS.moveTo(0.2, 4.6); sS.lineTo(0.2, 20.85); sS.absarc(4.2, 20.85, 4.0, Math.PI, Math.PI / 2, true); sS.lineTo(11.8, 24.85); sS.lineTo(11.8, 6.6); sS.quadraticCurveTo(11.8, 3.9, 8.5, 3.9); sS.lineTo(2.6, 3.9); sS.quadraticCurveTo(0.2, 3.9, 0.2, 4.6);
    for (const sz of [-1, 1]) ga(stExt(sS, 0.6, gsM, 0.2), 0, 0, sz * 7.95);   // profiled side plates
    const P = [V3(0.15, 13.0, 0)]; for (let i = 0; i <= 10; i++) { const a = Math.PI - i / 10 * Math.PI / 2; P.push(V3(4.2 + Math.cos(a) * 4.05, 20.85 + Math.sin(a) * 4.05, 0)); } P.push(V3(11.9, 24.9, 0));
    const cv = new THREE.CatmullRomCurve3(P, false, 'centripetal'); for (const sz of [-1, 1]) gp(new THREE.Mesh(new THREE.TubeGeometry(cv, 48, 0.3, 8, false), M.orangeD), 0, 0, sz * 8.3); }   // rolled edge beads
  ga(pl(10.4, 7.2, gtx, 0, 0, 0, -Math.PI / 2), -0.02, 17.0, 0);   // ÇANKAYA 153 on the rear face
  ga(pl(13.0, 0.9, hzM, 0, 0, 0, -Math.PI / 2), -0.03, 13.65, 0); ga(pl(13.0, 0.9, hzM, 0, 0, 0, -Math.PI / 2), -0.03, 4.4, 0);   // hazard stripes over + under the hopper mouth
  for (const sz of [-1, 1]) ga(stRB(1.3, 8.6, 1.6, M.orange, 0, 0, 0, 0.45), 0.65, 8.9, sz * 7.35);   // mouth posts
  ga(stRB(2.6, 1.4, 16.6, M.orangeD, 0, 0, 0, 0.5), 1.3, 4.4, 0); ga(stRB(1.8, 0.3, 13.0, rub, 0, 0, 0, 0.12), 1.7, 5.2, 0);   // sill + rubber lip
  { const sc = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 13, 28, 1, true, -0.5, 3.1), inner); sc.geometry.rotateX(Math.PI / 2); ga(sc, 4.6, 9.2, 0); }   // the curved hopper scoop
  ga(rb(8, 0.6, 13, inner, 0, 0, 0, 0), 4.2, 13.3, 0); for (const sz of [-1, 1]) ga(rb(8, 8.4, 0.5, inner, 0, 0, 0, 0), 4.2, 9.2, sz * 6.6);   // trough roof + cheeks
  for (const sz of [-1, 1]) { gp(stRB(0.5, 3.9, 1.5, gun, 0, 0, 0, 0.45), -0.15, 18.1, sz * 6.85);   // compact tail clusters: stop / indicator / reverse
    [[lensR, 19.05, 1.5], [lensA, 17.65, 0.95], [lensW, 16.75, 0.6]].forEach(([m, y, hh]) => { gp(stRB(0.2, hh + 0.2, 1.25, M.chrome, 0, 0, 0, 0.1), -0.45, y, sz * 6.85); gp(stRB(0.3, hh, 1.05, m, 0, 0, 0, 0.14), -0.52, y, sz * 6.85); });   // rectangular lenses in chrome frames (round stacked lenses read as a traffic light)
    gt(V3(-0.6, 6.2, sz * 7.35), V3(-0.6, 12.4, sz * 7.35), 0.17, yel); for (const y of [6.2, 12.4]) gt(V3(-0.6, y, sz * 7.35), V3(0.1, y, sz * 7.35), 0.15, yel);   // yellow grab handles
    gp(cyl(0.55, 0.6, 0.35, M.dark, 0, 0, 0, 0, 14), 5.2, 25.2, sz * 6.9); const bk = c3Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.7, 14), bc, 0); gp(bk, 5.2, 25.7, sz * 6.9); }   // rear beacons
  { const lz = 2; for (const dz of [-2.7, 2.7]) { gp(stRB(0.6, 5.4, 0.7, gun, 0, 0, 0, 0.25), -0.35, 7.0, lz + dz); gp(cyl(0.32, 0.32, 3.0, M.dark, 0, 0, 0, 0, 12), -0.8, 5.8, lz + dz * 1.22); gp(cyl(0.14, 0.14, 2.4, M.chrome, 0, 0, 0, 0, 8), -0.8, 8.2, lz + dz * 1.22); }
    gp(stRB(0.8, 0.8, 6.6, M.steel, 0, 0, 0, 0.35), -0.8, 8.4, lz); for (const dz of [-2.4, -0.8, 0.8, 2.4]) gp(stRB(0.5, 0.9, 0.35, M.steel, 0, 0, 0, 0.12), -1.15, 8.85, lz + dz); }   // the lifter: rails, rams, comb bar + teeth
  const blade = new THREE.Group(); blade.position.set(3 - 12, 15.4 - 24.6, 0); gate.add(blade); g.userData.blade = blade; blade.add(stRB(0.6, 9.4, 12.6, M.steel, 0, -4.7, 0, 0.25)); for (const z of [-4, 0, 4]) blade.add(stRB(1.0, 9, 0.5, gun, 0.5, -4.6, z, 0.2)); blade.add(stRB(0.9, 0.5, 12.8, rub, 0, -9.3, 0, 0.2));
  // cab: lower body extruded from a side profile with the front wheel arch; orange band; greenhouse walls (window / door holes),
  // rounded roof, raked windscreen in a rubber seal + wipers, dashboard + wheel, grille, round headlights, bumper, mirrors, step
  { const cl = new THREE.Shape(); cl.moveTo(32.7, 4.5); cl.lineTo(32.78, 4.5); cl.absarc(38, 3.6, 5.3, Math.PI - 0.17, 0.557, true); cl.lineTo(42.5, 12.2); cl.lineTo(32.7, 12.2); cl.closePath(); add(stExt(cl, 15.8, M.white, 0.9, 4)); }
  add(rb(10.6, 4.4, 12.2, M.dark, 38, 6.2, 0));   // wheel-well liner
  { const f = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 1.4, 28, 1, true, 2.233, 2.28), flareM); f.geometry.rotateX(Math.PI / 2); for (const sz of [-1, 1]) { const m = f.clone(); m.position.set(38, 3.6, sz * 8.5); add(m); const lp = new THREE.Mesh(new THREE.TorusGeometry(4.6, 0.2, 6, 28, 2.28), flareM); lp.rotation.z = 0.66; lp.position.set(38, 3.6, sz * 9.2); add(lp); } }
  add(stRB(11.85, 1.5, 16.0, M.orange, 37.6, 11.4, 0, 0.9));
  { const cw = (hole) => { const s2 = new THREE.Shape(); s2.moveTo(32.2, 12.4); s2.lineTo(42.85, 12.4); s2.lineTo(41.15, 20.3); s2.quadraticCurveTo(40.85, 21.65, 39.6, 21.65); s2.lineTo(33.0, 21.65); s2.quadraticCurveTo(32.2, 21.65, 32.2, 20.85); s2.closePath(); s2.holes.push(hole); return s2; };
    const winH = new THREE.Path(); winH.moveTo(33.6, 15.0); winH.lineTo(40.4, 15.0); winH.lineTo(39.5, 20.2); winH.lineTo(33.6, 20.2); winH.closePath();
    const doorH = new THREE.Path(); doorH.moveTo(34.6, 13.0); doorH.lineTo(40.4, 13.0); doorH.lineTo(40.4, 19.1); doorH.lineTo(34.6, 19.1); doorH.closePath();
    add(stExt(cw(winH), 0.6, M.white, 0.15)).position.z = 7.45; add(stExt(cw(doorH), 0.6, M.white, 0.15)).position.z = -7.45; add(rb(7.2, 5.6, 0.12, M.glass, 37.0, 17.6, 7.45, 0)); }
  add(stRB(8.4, 0.8, 15.9, M.white, 36.3, 21.95, 0, 0.35)); { const v = cyl(0.75, 0.75, 15.9, M.white, 40.15, 21.6, 0, 0, 16); v.rotation.x = Math.PI / 2; add(v); }
  for (const z of [-2.2, 0, 2.2]) stLamp(g, lensA, 40.75, 21.6, z, 0.26, 1, M.chrome);   // roof marker lamps
  add(stRB(0.6, 9.4, 15.6, M.white, 32.1, 17.0, 0, 0.25));
  { const wg = new THREE.Group(); wg.position.set(42.0, 16.35, 0); wg.rotation.z = Math.atan2(1.7, 7.9); add(wg); wg.add(rb(0.2, 7.4, 14.4, M.glass, 0, 0, 0, 0));
    for (const y of [-3.75, 3.75]) wg.add(stRB(0.45, 0.5, 15.0, rub, 0, y, 0, 0.18)); for (const sz of [-1, 1]) wg.add(stRB(0.45, 8.0, 0.5, rub, 0, 0, sz * 7.25, 0.18));
    for (const zz of [-3.4, 3.2]) { const wp = rb(0.12, 4.6, 0.14, M.black, 0.24, -1.4, zz, 0); wp.rotation.x = 0.9; wg.add(wp); } }
  add(stRB(1.0, 1.4, 14.0, M.dark, 41.7, 14.0, 0, 0.35)); { const sw = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.16, 8, 24), M.black); sw.position.set(40.1, 16.1, 3.8); sw.rotation.y = Math.PI / 2; add(sw); add(stTube(V3(40.1, 16.1, 3.8), V3(41.4, 14.4, 3.8), 0.14, M.black, 8)); }
  add(stRB(0.7, 4.4, 9.2, gun, 43.55, 8.6, 0, 0.3)); for (let i = 0; i < 5; i++) { const s3 = cyl(0.13, 0.13, 8.4, M.chrome, 43.95, 7.0 + i * 0.8, 0, 0, 8); s3.rotation.x = Math.PI / 2; add(s3); }   // grille + slats
  { const bd = cyl(0.55, 0.55, 0.2, M.chrome, 44.05, 10.4, 0, 0, 16); bd.rotation.z = Math.PI / 2; add(bd); }
  for (const sz of [-1, 1]) { add(stRB(0.5, 2.3, 2.3, rub, 43.45, 9.0, sz * 6.3, 0.6)); stLamp(g, lensW, 43.5, 9.0, sz * 6.3, 0.82, 1, M.chrome); stLamp(g, lensA, 43.4, 7.0, sz * 6.6, 0.4, 1, M.chrome);
    add(stTube(V3(41.0, 19.6, sz * 7.7), V3(41.6, 19.2, sz * 9.3), 0.12, M.black, 6)); add(stTube(V3(41.0, 16.0, sz * 7.7), V3(41.6, 16.4, sz * 9.3), 0.12, M.black, 6));
    add(stRB(0.6, 3.2, 1.4, M.black, 41.8, 17.8, sz * 9.6, 0.28)); add(rb(0.05, 2.7, 1.0, M.glass, 41.47, 17.8, sz * 9.6, 0)); }   // mirrors
  add(stRB(1.8, 2.3, 16.4, gun, 44.0, 4.7, 0, 0.6)); for (const sz of [-1, 1]) add(stRB(0.6, 1.8, 1.4, rub, 44.85, 4.7, sz * 7.4, 0.25)); add(pl(3.4, 0.8, c3Prop('#ffffff', { map: stTexPlate(), rough: 0.4 }), 44.92, 4.7, 0, Math.PI / 2));
  const door = new THREE.Group(); door.position.set(40.4, 0, -8.05); g.add(door); g.userData.door = door;
  door.add(stRB(5.8, 6.2, 0.5, M.white, -2.9, 11.8, 0, 0.25)); door.add(stRB(5.84, 1.5, 0.58, M.orange, -2.9, 11.4, 0, 0.22)); for (const x of [-0.3, -5.5]) door.add(stRB(0.6, 4.6, 0.5, M.white, x, 17.0, 0, 0.2)); door.add(stRB(5.8, 0.6, 0.5, M.white, -2.9, 19.0, 0, 0.22));
  door.add(rb(4.8, 4.2, 0.16, M.glass, -2.9, 16.8, 0, 0)); door.add(rb(1.2, 0.35, 0.4, M.chrome, -4.8, 13.4, -0.4)); door.add(stRB(5.0, 0.3, 0.3, rub, -2.9, 14.8, -0.2, 0.12));
  add(rb(9, 0.6, 14, M.dark, 36.4, 13, 0)); for (const sz of [-1, 1]) { add(stRB(3.0, 4.6, 5.8, seatM, 33.8, 15.6, sz * 4, 0.8)); }   // floor, seat backs
  add(stRB(4.4, 1.6, 6, seatM, 36, 13.9, -4, 0.5));   // passenger seat
  add(rb(4.6, 0.5, 2.0, M.steel, 37.6, 3.65, -9.7)); add(rb(4.6, 0.3, 0.3, yel, 37.6, 3.65, -10.75, 0)); for (const dx of [-1.8, 1.8]) add(rb(0.35, 3.6, 0.35, M.dark, 37.6 + dx, 5.6, -9.4));   // the cab step (he steps up on it to load the crate)
  const crate = new THREE.Group(); crate.position.set(39.2, 13.2, -4.6); g.add(crate); g.userData.crate = crate; const cw = c3Prop('#c89050', { rough: 0.8 });
  crate.add(rb(3.6, 0.4, 4.2, cw, 0, 0.2, 0, 0)); for (const [x, z, w, d] of [[0, 2.0, 3.6, 0.3], [0, -2.0, 3.6, 0.3], [1.7, 0, 0.3, 4.2], [-1.7, 0, 0.3, 4.2]]) for (const y of [0.9, 2.0]) crate.add(rb(w, 0.8, d, cw, x, y, z, 0));
  add(stRB(2.4, 0.4, 2.4, M.dark, 36.6, 22.5, 0, 0.15)); const bcn = c3Mesh(new THREE.CylinderGeometry(0.9, 1.0, 1.4, 16), bc, 0); bcn.position.set(36.6, 23.4, 0); g.add(bcn); g.userData.beacon = bcn;
  add(stSph(0.9, bc, 36.6, 24.1, 0, true, 16, 6));
  return g; }

const ST_get = () => ST.s ||= stBuild();
SETS.street = ST_get;

// ---- the camera path (absolute s). 0–17.06 dawn take, 52.82–61 morning take
CAMSEQ.street = [
  // s01: crane DOWN from the dawn sky (minaret, flag, rooftops) to the bins, then orbit right to the truck rear
  [0.00, [-30, 200, 120], [40, 196, -360], 44, -6],
  [0.90, [-38, 92, 30], [0, 60, -150], 42, -4],
  [1.75, [-40, 22, 2], [-14, 8, -29], 34, -1.5],           // 'libraries': the book glints in B1
  [3.00, [-44, 13, 16], [-2, 9, -8], 40, 2],               // 'trash': the lifter tips, bags thump
  // s02: swing round the truck corner to a low angle on him hopping off
  [3.80, [-30, 3.5, 4], [-6, 8, -16], 42, 4],
  [4.66, [-24, 5, -6], [-7, 8.5, -19], 36, 0],             // 'collector'
  // s03: whip UP to the clock (6:00), crane down along him, lateral track while he tosses bags
  [5.46, [-31, 24, -9], [-38, 32, -33], 32, -3],
  [6.40, [-34, 11, -2], [-10, 7, -21], 40, -1],
  [7.35, [-24, 9, 8], [-6, 7, -18], 40, 2],
  // s04: fast push-in + dutch as he strains
  [8.20, [-21, 7.5, -2], [-9.5, 5.5, -20.6], 40, 7],
  [8.90, [-20, 6.5, -5], [-9.5, 5.5, -20.8], 38, 9],
  // s05: crane up to top-down over the bag (the hero falls on the narrow side of the frame, out of it)
  [9.60, [-15, 18, -13], [-10.5, 2, -23.5], 38, 0],
  [10.20, [-10.2, 23, -24.7], [-10.6, 1.5, -24.4], 32, -4],
  // s06: orbit around him landing on each book
  [11.30, [-26, 9, -8], [-8.6, 7.5, -22.4], 36, -3],         // 'Novels'
  [12.00, [-12, 8.5, -2], [-7.8, 8, -22.4], 34, 2],          // 'comics'
  [12.75, [-5, 13, 5], [-8, 8.5, -22.4], 38, 4],             // 'encyclopedia'
  // g1: quick pull-back + roll on the chomp
  [13.85, [-30, 10, -20], [-4, 7, -22], 50, -6],
  [14.55, [-22, 11, -21], [-2, 7, -25.2], 42, -3],   // v2 QA: path stays on the road side of the bins (v1 cut through the open lids)
  // s07: tilt/pan down to the bin on 'Somebody', back onto him shaking his head on 'threw', track his jog to the cab; whip RIGHT at 17.06
  [14.95, [-20, 12.5, -12], [-3.5, 5, -28.5], 38, 3],
  [15.35, [-17, 13.5, -13], [-1.5, 6.5, -23.4], 38, -2],
  [15.90, [-13, 12, -19.5], [27, 7, -18], 36, -1],   // v2 QA: stays on the road behind him (no pass through the bins, no face across the lens)
  [16.50, [8, 11, -31], [31, 12.5, -15.5], 38, -2],
  [16.86, [19, 10, -32.6], [35.4, 12, -14.8], 36, -1],
  [17.06, [19.3, 10, -32.4], [7, 12, 14], 36, -4],
  [17.30, [19.5, 10, -32.2], [-18, 9.6, 36], 32, -6],      // phantom: keeps the whip fast through 17.06 (never rendered)
  [52.58, [-31.5, 13.5, -2.5], [-33, 6, -28], 38, -5],            // phantom: the whip-in arrives already moving
  // ---- morning take. s22: whip in (decelerating pan to the right) onto the passer and B1
  [52.82, [-31, 13, -3], [-26.7, 6, -27.6], 38, -3],
  [53.50, [-33, 13, -4.5], [-17, 7, -27], 38, 2],
  [54.30, [-30, 15, -6], [-15.5, 7.2, -28], 36, -2],          // 'book': crane down to the bin
  // s23: top-down on the open book (THE END)
  [55.00, [-13.3, 23, -28.6], [-13.3, 9.6, -29.5], 30, -3],
  [55.80, [-13.05, 21.6, -29.0], [-13.05, 9.6, -29.56], 30, 1],
  // s24: orbit + crane: his hand takes it, crosses out THE END, writes CHAPTER 2
  [56.60, [-26, 15, -18], [-12, 9, -28], 34, -3],
  [57.40, [-21.0, 11, -12.6], [-12.7, 7.6, -26.2], 41, 2],   // v2 QA: wider + left, the whole page (THE END / CHAPTER 2) inside the frame      // v2: framed to include the book in his left hand
  [58.20, [-20.0, 12, -11.6], [-12.7, 7.9, -26.2], 42, -2],
  // s25: the truck pulls away, the hopper opens on the boss in his library; long crane up and back
  [58.90, [-30, 14, -4], [2, 10, -10], 38, -3],
  [59.90, [-32, 20, 4], [12, 12, -6], 30, 0],
  [61.00, [-56, 46, 14], [30, 12, -6], 34, 3],             // v2: z 22 -> 14 so the raised gate's side plate never crosses the boss
];

// ---- state helpers
function stSky(s, t) { const d = ST_DAWN(t), u = s.sky.material.uniforms;
  if (s.skyState === d) return; s.skyState = d;
  if (d) { u.zen.value.set('#2f56c0'); u.mid.value.set('#f0a890'); u.hor.value.set('#f4a460'); u.glow.value.set('#ffa050'); u.glowK.value = 0.45; u.sun.value.set(0.35, 0.1, -0.93).normalize(); u.cLit.value.set('#ffdcb4'); u.cSh.value.set('#8a84c8');
    s.scene.fog.color.set('#e8845a'); s.skyline.material.map = s.skyline.userData.tex[0]; s.key.color.set('#ff9c50'); s.key.userData.I = 2.6; s.key.userData.dir = V3(-0.6, 0.56, 0.58).normalize(); s.hemi.color.set('#8a9ad6'); s.hemi.groundColor.set('#c08058'); s.amb.color.set('#6a80d0'); s.rim.color.set('#ff8a50'); }
  else { u.zen.value.set('#3a7ae0'); u.mid.value.set('#8cc2f0'); u.hor.value.set('#e6eef2'); u.glow.value.set('#fff0d0'); u.glowK.value = 0.3; u.sun.value.set(0.4, 0.5, -0.75).normalize(); u.cLit.value.set('#ffffff'); u.cSh.value.set('#a8acd8');
    s.scene.fog.color.set('#d4e2ee'); s.skyline.material.map = s.skyline.userData.tex[1]; s.key.color.set('#fff0d8'); s.key.userData.I = 2.6; s.key.userData.dir = V3(0.5, 0.62, 0.6).normalize(); s.hemi.color.set('#a8c8f0'); s.hemi.groundColor.set('#a09070'); s.amb.color.set('#90a0e0'); s.rim.color.set('#ffe0b0'); } }
function stShadowAt(s, x, z) { c3ShadowSetup(s.scene); const k = s.key; k.intensity = (k.userData.I ?? 2.3) * (C3_SHADOW.key ?? 1); if (!k.castShadow) return;
  k.target.position.set(x, 0, z); k.target.updateMatrixWorld(); k.position.set(x, 0, z).addScaledVector(k.userData.dir, 200); }
function stTruckAt(s, t) { const T = s.truck, x = ST_TX(t); T.position.set(x, 0, ST_TZ); T.userData.wheels.forEach((w) => { w.rotation.z = -x / 3.6; });
  T.userData.beacon.material.emissiveIntensity = 0.5 + 0.6 * Math.max(0, Math.sin(t * 9));
  // the compactor blade: rest 1.35 (tucked), chomps: after the bags (3.32), G1 (13.75 -> 13.95), a cycle at 53.4
  let ph = 1.35; for (const [a, b, c, d] of [[3.36, 3.56, 3.7, 4.1], [13.75, 13.95, 14.15, 14.6], [53.45, 53.7, 53.85, 54.3]]) { if (t >= a && t < b) ph = lerp(1.35, -0.15, EZ.i2((t - a) / (b - a))); else if (t >= b && t < c) ph = -0.15; else if (t >= c && t < d) ph = lerp(-0.15, 1.35, EZ.io((t - c) / (d - c))); }
  T.userData.blade.rotation.z = ph;
  // the tailgate lifts in the closing gag (snap up, settle); v2: it slams shut on him at the very end (60.45-60.85; the FOCUS occluders hide him)
  const g = clamp((t - 59.2) / 0.55), gc = clamp((t - 60.45) / 0.4), ang = t < 59.2 ? 0 : -1.5 * (g < 1 ? EZ.back(g) : 1) * (1 - gc * gc); T.userData.gate.rotation.z = ang; T.userData.libLight.intensity = t > 59.2 ? 2.2 * clamp((t - 59.2) / 0.4) : 0;   // v2: gate up to -1.5 (at -1.25 it hung in front of the boss from the high crane)
  // the cab door opens as he arrives (15.95) and stays open
  T.userData.door.rotation.y = -1.15 * stSnap(t, 15.95, 0.3) * (t < 30 ? 1 : 0);
  return x; }
// the lifter container: tips on 'trash' (2.70 rise, 2.95-3.25 tip, 3.55-4.0 back)
function stLifter(s, t, x) { s.c0piv.visible = t < 30; const up = t < 3.55 ? stSnap(t, 2.7, 0.25) : 1 - EZ.io((t - 3.55) / 0.45), tip = t < 3.55 ? EZ.io((t - 2.95) / 0.3) : 1 - EZ.io((t - 3.55) / 0.4);
  s.c0piv.position.set(x - 0.8 + up * 0.3, 8.4 + up * 5.4 * (t < 30 ? 1 : 0), ST_TZ + 2); s.c0piv.rotation.z = -2.25 * tip * (t < 30 ? 1 : 0); s.c0.userData.lid.rotation.z = 1.9 * tip;
  s.c0bags.forEach((b, i) => { const a = 3.12 + i * 0.05, u = (t - a) / 0.2; b.visible = t < 30 && u > 0 && u < 1; if (!b.visible) return; b.position.set(x + 1.5 + u * 2.5, 15 - 9 * u * u, ST_TZ + 1 + i * 1.4); b.rotation.set(u * 2, i, u * 3); }); }
// a ballistic toss from p0 to p1 (arc height hgt), u 0..1
const stArc = (p0, p1, u, hgt) => p0.clone().lerp(p1, u).add(V3(0, 4 * hgt * u * (1 - u), 0));
// the yaw that turns a prop's +z face to the camera
const stYawTo = (cam, x, z) => Math.atan2(cam.position.x - x, cam.position.z - z);

// ---- the hero (one continuous performance, absolute t). Road y = 0, sidewalk y = 1.
const ST_HP = V3(-8, 0, -18), ST_HB = V3(-11, 1, -23.2), ST_T1 = V3(-5, 1, -22.2), ST_T2 = V3(-3, 1, -23.6), ST_JUMP = V3(4, 0, -18.5), ST_CAB = V3(33, 0, -17.2);
const ST_GRIP = (x, y, o = {}) => Object.assign({ h: [x, y], pole: [1, 0.3], hand: 'grip' }, o);
const ST_STACKR = ST_GRIP(0.55, 0.5), ST_HUGL = { h: [-0.28, 0.42], pole: [1, 0.6], front: true, hand: 'dot' };
// facing from look keys [[t, target], ...]: target = [x, z] world point (re-aimed from the camera every frame, so he turns
// with the orbit) or a number (a fixed facing); turns snap in 0.22 s (Ricks)
function stLookK(s, K, t, x, z) { let i = 0; while (i < K.length - 1 && K[i + 1][0] <= t) i++;
  const f = (k) => typeof k[1] === 'number' ? k[1] : toonLookFacing(s.cam, x, z, k[1][0] - x, k[1][1] - z), b = f(K[i]);
  if (i === 0) return clamp(b, -1.3, 1.3); const a = f(K[i - 1]), u = clamp((t - K[i][0]) / 0.22); return clamp(a + (b - a) * (1 - (1 - u) ** 3), -1.3, 1.3); }   // ±1.3: the face always reads
// eased numeric keys (squash / lean curves)
function stKN(K, t) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], EZ.io((t - K[i][0]) / (K[i + 1][0] - K[i][0]))); return K[K.length - 1][1]; }
const ST_HB2 = V3(-7.2, 1, -22.4), ST_LAND = V3(-1.6, 1, -23.6), ST_RUN = V3(36.2, 0, -17.0), ST_STEP = V3(37.6, 3.9, -15.7);
const stCurbY = (z) => clamp((-19.9 - z) / 0.6);
// squash (+ crouch / - stretch): truck-step hop 3.5-4.3, toss dips, the chomp leap (crouch 13.78, push-off 13.92, land 14.34),
// the step up onto the cab step (16.1-16.5)
const ST_SQ = [[0, 0], [3.5, 0], [3.68, 0.26], [3.74, -0.14], [3.98, -0.04], [4.05, 0.3], [4.18, -0.06], [4.32, 0], [6.3, 0], [6.42, 0.12], [6.56, -0.08], [6.75, 0], [7.08, 0], [7.2, 0.12], [7.3, -0.08], [7.5, 0],
  [10.9, 0], [11.05, 0.1], [11.35, 0.1], [11.5, -0.05], [11.65, 0], [12.24, 0], [12.36, 0.12], [12.6, 0.12], [12.7, -0.05], [12.85, 0], [13.72, 0], [13.86, 0.3], [13.92, 0.3], [13.98, -0.16], [14.28, -0.06], [14.34, 0.32], [14.48, -0.07], [14.62, 0],
  [16.08, 0], [16.18, 0.24], [16.22, -0.12], [16.38, -0.04], [16.42, 0.26], [16.54, -0.05], [16.66, 0]];
const ST_LOOK = [[0, 0.3], [1.62, [-14, -29.5]], [2.3, 0.3], [4.05, 0.3], [5.3, [-38, -33]], [6.0, [-5, -22.2]], [6.48, [3, -9.6]], [6.9, [-3, -23.6]], [7.2, [3, -9.6]], [7.75, [-11, -23.2]], [8.38, -0.9], [9.45, [-11, -23.2]],
  [10.0, -0.4], [10.95, [-11, -23.2]], [11.48, 0.25], [11.62, [-11, -23.2]], [11.92, -0.15], [12.28, [-11, -23.2]], [12.62, 0.35], [13.3, [-11, -23.2]], [13.46, [3, -9.6]], [13.95, 1.0], [14.4, [3, -9.6]], [14.72, [-4, -31]], [15.3, 0.3]];
function stHero(s, t, x) {
  if (t >= 30) return stHeroMorning(s, t, x);
  const cam = s.cam, p = ST_HP.clone(); let o, walk = null;
  if (t < 3.7) { const st = t > 2.4 ? Math.exp(-(t - 2.4) * 4.5) * Math.sin((t - 2.4) * 11) : 0;   // rides the back step: road judder, lurch + sway when the truck stops
    p.set(x - 1.6, 2.85 + (t < 2.4 ? 0.06 * Math.sin(t * 31) * (1 - t / 2.4) : 0), -12);
    o = { expr: t < 1.64 ? 'smile' : 'happy', hand: { R: ST_GRIP(0.36, -0.36, { pole: [1, 0.6] }), L: [[0, 'down'], [2.46, 'wave'], [3.3, 'down']] }, lean: (t < 2.4 ? 0.05 : 0) + 0.15 * st }; }
  else if (t < 4.05) { const u = (t - 3.7) / 0.35; p.set(lerp(x - 1.6, ST_HP.x, u), lerp(2.85, 0, u) + 3.2 * Math.sin(Math.PI * u), lerp(-12, ST_HP.z, u));
    o = { expr: 'excited', hand: { L: 'up', R: 'up' } }; }
  else if (t < 13.92) {
    const strain = t >= 8.38 && t < 9.4;
    if (t >= 10.3 && t < 10.95) { const u = EZ.io((t - 10.3) / 0.65); p.lerpVectors(ST_HP, ST_HB2, u); walk = [ST_HB2.x - ST_HP.x, ST_HB2.z - ST_HP.z, clamp((t - 10.7) / 0.25)]; }   // hurries round to the bag
    else if (t >= 10.95) p.copy(ST_HB2);
    p.y = stCurbY(p.z);
    o = { expr: [[0, 'happy'], [4.66, 'grin'], [5.46, 'smile'], [6.3, 'determined'], [8.38, 'strain'], [9.45, 'surprised'], [10.04, 'shock'], [10.52, 'excited'], [11.48, 'happy'], [12.62, 'excited'], [13.4, 'grin'], [13.76, 'shock']],
      hand: { L: [[0, 'down'], [4.66, 'hip'], [6.25, 'down'], [7.9, ST_GRIP(0.62, 0.62, { pole: [1, 0.2] })], [8.38, ST_GRIP(0.9, 0.5, { pole: [1, -0.1] })], [9.45, ST_GRIP(0.2, 0.7, { front: true })], [10.3, 'down'], [11.62, ST_GRIP(0.4, 0.9, { pole: [1, 0.6] })], [11.92, ST_GRIP(0.72, 0.3, { pole: [1, 0.5] })],
          [12.3, ST_GRIP(0.3, 0.8, { pole: [1, 0.6] })], [12.62, ST_STACKR]],
        R: [[0, 'down'], [4.66, 'hip'], [6.25, ST_GRIP(0.42, 0.8, { pole: [1, 0.2] })], [6.42, ST_GRIP(0.62, 0.9, { pole: [1, 0.4] })], [6.56, ST_GRIP(0.5, -0.45, { pole: [1, 0.6] })], [6.9, 'down'], [7.05, ST_GRIP(0.42, 0.8, { pole: [1, 0.2] })], [7.18, ST_GRIP(0.62, 0.9, { pole: [1, 0.4] })], [7.28, ST_GRIP(0.5, -0.45, { pole: [1, 0.6] })], [7.6, 'down'],
          [7.9, ST_GRIP(-0.3, 0.6, { pole: [1, 0.5], front: true })], [8.38, ST_GRIP(-0.5, 0.5, { pole: [1, 0.6], front: true })], [9.45, ST_GRIP(0.1, 0.7, { front: true })], [10.3, 'down'], [11.0, ST_GRIP(-0.45, 0.9, { pole: [1, 0.6], front: true })], [11.48, ST_GRIP(0.72, 0.3, { pole: [1, 0.5] })],
          [12.3, ST_GRIP(-0.25, 0.75, { pole: [1, 0.6], front: true })], [12.62, ST_HUGL], [13.3, ST_GRIP(-0.55, 0.8, { pole: [1, 0.6], front: true })], [13.46, { h: [0.5, -0.3], pole: [1, 0.6], hand: 'open' }], [13.68, ST_HUGL]] },
      lean: strain ? -0.16 + 0.015 * Math.sin(t * 40) : t >= 7.9 && t < 8.38 ? -0.06 : t >= 9.45 && t < 10.3 ? 0.1 : 0,
      fx: strain ? 'sweat' : t >= 12.62 && t < 13.3 ? 'sparkle' : undefined, gaze: strain ? [-0.7, 0.3] : t >= 11.0 && t < 11.4 ? [-0.5, 0.6] : undefined }; }
  else if (t < 14.34) { const u = (t - 13.92) / 0.42; p.lerpVectors(ST_HB2, ST_LAND, EZ.io(u)); p.y = 1 + 2.4 * 4 * u * (1 - u);   // the leap aside: one arc, sidewalk to sidewalk
    o = { expr: 'shock', hand: { L: ST_STACKR, R: ST_HUGL }, fx: 'sweat', lean: 0.08 }; }
  else { const walking = t >= 15.3 && t < 16.12, ju = EZ.io(clamp((t - 15.3) / 0.82));
    if (t < 16.12) { p.lerpVectors(ST_LAND, ST_RUN, ju); p.y = stCurbY(p.z); if (walking) walk = [ST_RUN.x - ST_LAND.x, ST_RUN.z - ST_LAND.z, clamp((t - 15.86) / 0.26)]; }
    else { const u = clamp((t - 16.2) / 0.2); p.lerpVectors(ST_RUN, ST_STEP, EZ.io(u)); p.y = lerp(0, ST_STEP.y, EZ.io(u)) + (u > 0 && u < 1 ? 1.2 * 4 * u * (1 - u) : 0); }   // one step up onto the cab step
    const up = ST_GRIP(0.3, -0.85, { pole: [0.6, 1] });
    o = { expr: [[0, 'nervous'], [14.72, 'skeptical'], [15.12, 'deadpan'], [15.88, 'determined'], [16.44, 'smile']], gaze: t >= 14.72 && t < 15.3 ? [-0.8, 0.3] : undefined,
      tilt: t >= 15.2 && t < 15.6 ? 0.14 * Math.sin((t - 15.2) * 30) * (1 - (t - 15.2) / 0.4) : 0,
      hand: t < 16.3 ? { L: ST_STACKR, R: ST_HUGL } : { L: [[16.3, up], [16.8, 'hip']], R: [[16.3, ST_GRIP(0.1, -0.8, { pole: [0.6, 1], front: true })], [16.8, 'hip']] } }; }
  if (walk) Object.assign(o, { mode: 'walk', phase: Math.hypot(p.x - ST_LAND.x, p.z - ST_LAND.z) / 4.2, stride: 4.2, stop: walk[2], facing: toonLookFacing(cam, p.x, p.z, walk[0], walk[1]) });
  else o.facing = t >= 16.12 ? stLookK(s, [[16.12, [44, -10]], [16.8, 0.6]], t, p.x, p.z) : t >= 13.92 && t < 14.34 ? clamp(toonLookFacing(cam, p.x, p.z, 1, -0.2), -1.3, 1.3) : t >= 8.38 && t < 9.4 ? -0.9 : stLookK(s, ST_LOOK, t, p.x, p.z);
  o.squash = (o.squash || 0) + stKN(ST_SQ, t);
  pose(s, 'hero', t, p.x, p.z, Object.assign({ y: p.y }, o));
  return p;
}
// ---- v2 ending (52.82–61 s): camera axes, a book turned to the camera, the marker, the truck occluders
const stAxes = (cam) => ({ X: V3(1, 0, 0).applyQuaternion(cam.quaternion), Y: V3(0, 1, 0).applyQuaternion(cam.quaternion), Z: V3(0, 0, 1).applyQuaternion(cam.quaternion) });
// a book's page side (+y) to the camera, its top (-z) up on screen, x to screen right; tilt > 0 leans the top away
function stFaceQ(cam, tilt = 0, roll = 0, spin = 0) { const { X, Y, Z } = stAxes(cam), q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Z, Y.clone().negate()));
  return q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-tilt, roll, spin))); }
// a prop placed so its local point G sits at world point h (q, scale), pushed `back` away from the camera
const stPlaceAt = (o, h, G, q, sc, back, cam) => { o.quaternion.copy(q); o.scale.setScalar(sc); o.position.copy(h).sub(G.clone().multiplyScalar(sc).applyQuaternion(q)).addScaledVector(cam.position.clone().sub(h).normalize(), -back); };
const ST_BINQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0.03, 0));
// lazily built (after the set look pass, which would turn colorWrite:false materials into lit ones): the marker + the occluders
function stEndKit(s) { if (s.ek) return s.ek; const ek = s.ek = {};
  { const g = new THREE.Group(), ink = c3Prop('#1f3aa8', { rough: 0.35 }), body = c3Prop('#f2efe6', { rough: 0.4 }), dk = c3Prop('#2a2a34', { rough: 0.5 });   // tip at the origin, axis +y
    g.add(cyl(0.11, 0.04, 0.24, ink, 0, 0.12, 0, 0, 10)); g.add(cyl(0.16, 0.11, 0.18, dk, 0, 0.33, 0, 0, 12)); g.add(cyl(0.17, 0.17, 1.2, body, 0, 1.02, 0, 0, 14));
    g.add(cyl(0.175, 0.175, 0.34, ink, 0, 0.98, 0, 0, 14)); g.add(cyl(0.2, 0.2, 0.52, ink, 0, 1.84, 0, 0, 14)); g.add(cyl(0.2, 0.13, 0.1, ink, 0, 2.15, 0, 0, 14)); g.add(rb(0.07, 0.46, 0.12, ink, 0, 1.78, 0.22, 0));
    c3Shade(g); g.traverse((m) => { if (m.isMesh) { m.userData.noCast = true; if (typeof c3SetLookMat === 'function') c3SetLookMat(m.material, 0.55); } }); c3Layer(g, C3.L_FOCUS); g.visible = false; s.scene.add(g); ek.marker = g; }
  // depth-only stand-ins on the FOCUS layer: the tailgate hull (moves with the gate) + the body shell, so the boss in the
  // library is hidden until the gate lifts and whenever the gate / walls are in front of him
  const M = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); M.userData.c3keep = true;
  const box = (par, w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M); m.position.set(x, y, z); Object.assign(m.userData, { inkOcc: true, c3catch: true, noCast: true, noShade: true }); m.renderOrder = -5; c3Layer(m, C3.L_FOCUS); par.add(m); return m; };
  const T = s.truck, gate = T.userData.gate, gm = gate.children.filter((c) => c.isMesh); ek.occ = new THREE.Group(); T.add(ek.occ); ek.gocc = new THREE.Group(); gate.add(ek.gocc);
  for (const c of gm) { const m = box(ek.gocc, 1, 1, 1, 0, 0, 0); m.geometry = c.geometry; m.position.copy(c.position); m.quaternion.copy(c.quaternion); m.scale.copy(c.scale); }   // exact copies of the gate's plates (the trough stays open)
  { const sh = T.userData.shell, m = box(ek.occ, 1, 1, 1, 0, 0, 0); m.geometry = sh.geometry; m.position.copy(sh.position); m.quaternion.copy(sh.quaternion); } box(ek.occ, 1.0, 18, 16.4, 31, 15.5, 0);   // v3: the body shell's own geometry + the front wall
  return ek; }
// the marker: tip at T, axis A (tip -> cap)
const stMarkerAt = (s, T, A) => { const m = stEndKit(s).marker; m.visible = true; m.position.copy(T); m.quaternion.setFromUnitVectors(V3(0, 1, 0), A.clone().normalize()); };
// the hero's open book, held in his left hand beside him (behind the card plane: his hands draw over it, nothing goes
// through his body); the page point (u, v) of the right page in world space (lift = off the page, toward the camera)
const ST_OBK = 0.82, ST_OBG = V3(0, 0.45, 1.5), ST_OBTILT = 0.22;
const stPagePt = (ob, u, v, lift = 0) => { ob.g.updateMatrixWorld(true); return ob.g.localToWorld(V3(1.2 + (u - 0.5) * 2.3, 0.45 + lift, (v - 0.5) * 3.2)); };
// where the pen tip is on the page at t (strike 57.12-57.42, CHAPTER 2 57.5-58.12, as stDrawPage writes them); null = not writing
function stPenUV(t) { if (t < 56.98 || t >= 58.3) return null; const st = clamp((t - 57.12) / 0.3), wr = clamp((t - 57.5) / 0.62);
  if (t < 57.12) return [0.14, 0.52, 0.5 * (1 - EZ.io((t - 56.98) / 0.14))];
  if (t < 57.42) return [0.14 + 0.72 * st, 0.52 - 0.04 * st, 0];
  if (t < 57.5) { const k = (t - 57.42) / 0.08; return [lerp(0.86, 0.11, EZ.io(k)), lerp(0.48, 0.71, EZ.io(k)), 0.45 * Math.sin(Math.PI * k)]; }
  if (t < 58.12) return [0.1 + 0.82 * wr + 0.012 * Math.sin(wr * 9 * TAU), 0.71 + 0.035 * Math.sin(wr * 18 * TAU + 0.6), 0];
  const k = (t - 58.12) / 0.18; return [0.92 + 0.04 * k, 0.71 - 0.12 * k, 0.9 * EZ.o2(k)]; }
const ST_MCARRY = ST_GRIP(0.16, 0.8, { pole: [1, 0.1] }), ST_LHOLD = ST_GRIP(0.8, 0.56, { pole: [1, 0.4] });
function stHeroMorning(s, t, x) { const cam = s.cam, w = clamp((t - 55.0) / 1.3), walking = t >= 55 && t < 56.3, px = lerp(-6, -10, w), pz = lerp(-17, -25.5, w), py = clamp((-20 - pz) / 0.8);
  s.eb = null; const hero = s.p.hero, lf = (pt) => toonLookFacing(cam, px, pz, pt[0] - px, pt[1] - pz);
  // where he looks: the bin, his book (screen left of him), the camera, the truck pulling away; snapped turns that keep
  // reacting to the camera orbit (world targets)
  let facing;
  if (walking) facing = toonFacing(cam, px, pz, -4, -8.5);
  else if (t < 55) facing = [[52.82, -0.6], [53.05, 1.2], [53.5, -0.4]];
  else { const seq = [[56.3, [-14, -29.5]], [56.84, [-19.6, -19.8]], [58.2, [-18, -13]], [59.35, [x + 20, ST_TZ]], [59.95, [-24, -12]]]; facing = lf(seq[0][1]);
    for (let i = 1; i < seq.length; i++) if (t >= seq[i][0]) facing = lerp(lf(seq[i - 1][1]), lf(seq[i][1]), stSnap(t, seq[i][0], 0.3)); }
  const wv = t >= 60.3 ? { h: [0.42 + 0.12 * Math.sin((t - 60.3) * 15) * clamp((t - 60.3) / 0.15), -0.55], pole: [1, 0.4], hand: 'open' } : null;
  const o = { mode: walking ? 'walk' : 'stand', phase: Math.hypot(px + 6, pz + 17) / 3.3, stride: 3.3, stop: walking ? clamp((t - 56.0) / 0.3) : 1, facing,
    expr: [[0, 'smile'], [53.05, 'determined'], [53.5, 'smile'], [55.3, 'surprised'], [56.54, 'thinking'], [57.1, 'smug'], [58.06, 'grin'], [59.4, 'surprised'], [59.95, 'laugh']],
    hand: walking ? { R: ST_MCARRY } : { L: [[0, 'down'], [56.4, ST_GRIP(0.3, 0.62, { pole: [1, 0.2] })], [56.54, ST_GRIP(0.92, 0.1, { pole: [1, 0.6] })], [56.7, ST_LHOLD]],
      R: wv || [[0, ST_GRIP(0.4, 0.8, { pole: [1, 0.2] })], [53.05, { h: [0.5, -0.45], pole: [1, 0.6], hand: 'open' }], [53.4, ST_MCARRY], [56.6, ST_GRIP(0.3, 0.5, { pole: [1, 0.3], front: true })], [58.3, ST_MCARRY], [59.95, 'wave']] },
    lean: t >= 56.54 && t < 56.7 ? 0.05 : t >= 56.7 && t < 56.9 ? -0.04 * (1 - clamp((t - 56.7) / 0.2)) : 0, squash: t >= 56.3 && t < 56.45 ? 0.12 * Math.sin(Math.PI * (t - 56.3) / 0.15) : 0,
    tilt: t >= 57.12 && t < 58.12 ? 0.05 * Math.sin(t * 3.1) : 0,
    gaze: t >= 56.84 && t < 58.2 ? [-0.55, 0.55] : t >= 56.3 && t < 56.84 ? [-0.5, 0.4] : undefined };
  pose(s, 'hero', t, px, pz, Object.assign({ y: py }, o));
  if (t >= 56.7) {   // the book in his left hand (picked out of the bin 56.7-56.86); the marker writes on it
    const Lh = c3ToonHandWorld(hero, 'L'), q1 = stFaceQ(cam, ST_OBTILT), e = EZ.io(clamp((t - 56.7) / 0.16)), tmp = new THREE.Object3D();
    stPlaceAt(tmp, Lh, ST_OBG, q1, ST_OBK, 0.3, cam);
    const pos = V3(ST_INBIN.x, ST_INBIN.y, ST_INBIN.z).lerp(tmp.position, e).add(V3(0, 1.2 * Math.sin(Math.PI * e), 0));
    s.eb = { pos, q: ST_BINQ.clone().slerp(q1, e), sc: lerp(1, ST_OBK, e) };
    const uv = stPenUV(t);
    if (uv && e >= 1) {   // second pass: put his right hand where the marker's cap end must be (up-right of the tip)
      const ob = s.old; ob.g.position.copy(pos); ob.g.quaternion.copy(s.eb.q); ob.g.scale.setScalar(s.eb.sc);
      const tip = stPagePt(ob, uv[0], uv[1], uv[2]), { X, Y } = stAxes(cam), want = tip.clone().addScaledVector(X, 0.4).addScaledVector(Y, 0.95);
      const k = clamp((t - 56.98) / 0.12) * (1 - clamp((t - 58.14) / 0.16)), r0 = hero.root, h0 = c3ToonHandWorld(hero, 'R'), HHw = t3Dims(hero.o).HH * hero.U;
      const a = r0.worldToLocal(h0.clone()), b = r0.worldToLocal(want.clone()), cur = ST_GRIP(0.3, 0.5, { pole: [1, 0.3], front: true });
      const hR = { h: [cur.h[0] + (b.x - a.x) / HHw * k, cur.h[1] - (b.y - a.y) / HHw * k], pole: [1, 0.5], front: true, hand: 'grip' };
      if (t >= 56.98 && t < 58.3) { o.hand = Object.assign({}, o.hand, { R: hR }); pose(s, 'hero', t, px, pz, Object.assign({ y: py }, o)); }
      s.eb.tip = tip; s.eb.k = k; } }
  return V3(px, py, pz); }
// the passer-by: walks in with the old book held by the spine at her side, lifts it over the bin on 'throw', lets go
// on 'away' (it drops into B1), watches it land, deadpans at the camera, walks off
const ST_PBG = V3(0.15, 0.9, -1.0);
function stPasser(s, t) { if (t < 52.8 || t > 56.6) return; const cam = s.cam;
  const inW = clamp((t - 52.82) / 0.72), outW = clamp((t - 54.6) / 1.6), px = t < 54.6 ? lerp(-46, -18.6, EZ.o2(inW)) : lerp(-18.6, -52, outW), pz = -25.6, walking = t < 53.54 || t >= 54.6;
  const lf = (pt) => toonLookFacing(cam, px, pz, pt[0] - px, pt[1] - pz), BIN = [-14, -29.5], CM = [cam.position.x, cam.position.z];
  let facing; if (t < 53.54) facing = toonFacing(cam, px, pz, 1, 0); else if (t >= 54.6) facing = toonFacing(cam, px, pz, -1, 0);
  else facing = t < 54.3 ? lerp(0.5, lf(BIN) * 0.5, stSnap(t, 53.6, 0.3)) : lerp(lf(BIN) * 0.5, lf(CM), stSnap(t, 54.3, 0.3));
  pose(s, 'passer', t, px, pz, { y: 1, mode: walking ? 'walk' : 'stand', phase: Math.abs(px + 46) / 3.3, stride: 3.3, stop: t < 54.6 ? clamp((t - 53.25) / 0.3) : 0, facing,
    expr: [[0, 'bored'], [53.64, 'neutral'], [53.95, 'skeptical'], [54.34, 'deadpan']], gaze: t >= 53.6 && t < 53.9 ? [0.5, 0.2] : t >= 53.9 && t < 54.3 ? [0.6, 0.6] : undefined,
    squash: t >= 53.5 && t < 53.64 ? 0.1 * Math.sin(Math.PI * (t - 53.5) / 0.14) : 0, lean: t >= 53.5 && t < 53.64 ? -0.05 : t >= 53.64 && t < 53.95 ? 0.06 : 0,
    tilt: t >= 54.34 && t < 54.6 ? -0.08 : 0, noTilt: t >= 54.3,   // no pitch on the crane down: pitched back, her head went behind the book in the bin
    hand: { L: walking ? undefined : [[0, 'hip'], [54.34, 'pocket']], R: walking && t < 53.54 ? ST_GRIP(0.2, 0.78, { pole: [1, 0.1] }) : walking ? undefined :
      [[0, ST_GRIP(0.2, 0.78, { pole: [1, 0.1] })], [53.5, ST_GRIP(0.3, 0.6, { pole: [1, 0.2] })], [53.64, ST_GRIP(0.66, 0.02, { pole: [1, 0.6] })], [53.9, { h: [0.7, -0.08], pole: [1, 0.6], hand: 'open' }], [54.4, 'down']] } });
  if (t < 53.9) { const ob = s.old, h = c3ToonHandWorld(s.p.passer, 'R'); ob.g.visible = true; ob.open(0); stPlaceAt(ob.g, h, ST_PBG, stFaceQ(cam, 0.1, 0, 0.4), 1, 0.12, cam); s.pb = { pos: ob.g.position.clone(), q: ob.g.quaternion.clone() }; }
  else if (t < 54.16) { const ob = s.old, h = c3ToonHandWorld(s.p.passer, 'R'), tmp = new THREE.Object3D(); stPlaceAt(tmp, h, ST_PBG, stFaceQ(cam, 0.1, 0, 0.4), 1, 0.12, cam); s.pb = { pos: tmp.position.clone(), q: tmp.quaternion.clone() }; } }
// the boss in his library chair (closing gag): there from 58.6 behind the closed tailgate (FOCUS occluders hide him),
// revealed by the gate lifting; perched on the seat's front (feet on the rug in front of it, nothing through the chair),
// reading POEMS, looks up on the reveal, smug, then waves with the book in his lap
const ST_BREAD_L = ST_GRIP(-0.02, 0.42, { pole: [1, 0.5], front: true }), ST_BREAD_R = ST_GRIP(-0.02, 0.44, { pole: [1, 0.5], front: true });
function stBoss(s, t, x) { s.chairF.visible = false; const ek = stEndKit(s); ek.occ.visible = ek.gocc.visible = t >= 54.5; if (t < 58.6) return;
  const px = x + 21.5, pz = ST_TZ, wv = t >= 60.3 ? { h: [0.42 + 0.12 * Math.sin((t - 60.3) * 14) * clamp((t - 60.3) / 0.15), -0.55], pole: [1, 0.4], hand: 'open' } : null;
  pose(s, 'boss', t, px, pz, { y: 7.02, mode: 'sit', sit: 1, seat: 2.18, heading: -Math.PI / 2 + 0.6, expr: [[0, 'neutral'], [59.45, 'surprised'], [59.66, 'smug'], [59.95, 'happy']],
    gaze: t < 59.45 ? [-0.1, 0.75] : undefined, lean: t >= 59.45 && t < 59.66 ? -0.06 : 0, squash: t >= 59.45 && t < 59.6 ? -0.1 : 0,
    hand: { L: [[0, ST_BREAD_L], [59.45, ST_GRIP(-0.02, 0.56, { pole: [1, 0.5], front: true })], [59.95, ST_GRIP(0.0, 0.7, { pole: [1, 0.4], front: true })]],
      R: wv || [[0, ST_BREAD_R], [59.45, ST_GRIP(-0.02, 0.58, { pole: [1, 0.5], front: true })], [59.95, 'wave']] } });
  const b = s.minibook, h = c3ToonHandWorld(s.p.boss, 'L'); b.visible = true; c3Layer(b, C3.L_FOCUS);
  const q = s.cam.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.25, 0, t < 59.95 ? 0 : 0.12)));
  b.quaternion.copy(q); b.scale.setScalar(1.25); b.position.copy(h).sub(V3(-0.7, -0.5, 0).multiplyScalar(1.25).applyQuaternion(q)).addScaledVector(s.cam.position.clone().sub(h).normalize(), 0.45);
  if (t >= 59.42 && t < 60.5) { gripDot(s, 'boss', 'L'); if (t < 59.95) gripDot(s, 'boss', 'R'); } }   // grip dots draw with no depth test: not while the gate hides him

// ---- props driven by t
const ST_HOP = (x) => V3(x + 2.6, 7.4, ST_TZ - 3.6), ST_HOPIN = (x) => V3(x + 5.2, 6.2, ST_TZ - 3.6), ST_INBIN = V3(-14.3, 9.2, -29.5);
// where the stack sits: beside him on the side of his left hand (screen-left, the bag side) (never in front of his face)
function stStackAt(s, t) { const hero = s.p.hero, hr = c3ToonHandWorld(hero, 'L'), c = hero.g.position.clone(); const side = V3(hr.x - c.x, 0, hr.z - c.z); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize();
  return hr.clone().addScaledVector(side, 1.3).add(V3(0, -2.7, 0)); }
function stProps(s, t, x) { const cam = s.cam, hero = s.p.hero;
  [s.tbag[0], s.tbag[1], s.mbag, s.heavy, s.novel, s.comic, s.stack, s.old.g, s.pen].forEach((m) => { m.visible = false; }); s.glint.visible = false; s.glow.visible = false; s.bagLight.intensity = 0; s.bagOcc.visible = false;
  if (s.ek) s.ek.marker.visible = false;   // v2 ending marker (stEndKit)
  if (t < 30) {
    // the two bags he tosses (6.25 grab / 6.56 toss; 7.05 / 7.28)
    [[ST_T1, 6.25, 6.56], [ST_T2, 7.05, 7.28]].forEach(([p0, g0, r0], i) => { const b = s.tbag[i], kn = 4.1 * 0.85; b.visible = true; c3Layer(b, C3.L_FOCUS); b.rotation.set(0, i, 0);
      if (t < g0) b.position.copy(p0);
      else if (t < r0) { const k = clamp((t - g0) / 0.12); b.position.copy(p0).lerp(c3ToonHandWorld(hero, 'R').sub(V3(0, kn, 0)), k); if (k >= 1) gripDot(s, 'hero', 'R'); }
      else { const u = clamp((t - r0) / 0.36); if (u >= 1) { b.visible = false; return; } b.position.copy(stArc(s.rel['h' + r0].clone().sub(V3(0, kn, 0)), u < 0.8 ? ST_HOP(x) : ST_HOPIN(x), u, 4)); b.rotation.set(u * 4, i, u * 2); if (u > 0.7) c3Layer(b, C3.L_BG); } });
    // the heavy bag (7.9 grab: won't move; 9.52 knot opens; 10.04 glow; 12.62 emptied; 13.36 L hand grabs, 13.46 toss; 13.95 chomp)
    { const b = s.heavy; b.visible = t < 14.3; c3Layer(b, C3.L_FOCUS); b.position.copy(ST_HB); b.rotation.set(0, 0.3, t >= 8.38 && t < 9.4 ? 0.04 * Math.sin(t * 50) : 0);
      b.userData.open(stSnap(t, 9.52, 0.3)); b.userData.empty(t < 12.62 ? 0 : stSnap(t, 12.62, 0.2));
      if (t >= 13.36) {
        if (t < 13.46) { b.position.copy(ST_HB).lerp(c3ToonHandWorld(hero, 'R').sub(V3(0, 1.4, 0)), clamp((t - 13.36) / 0.08)); gripDot(s, 'hero', 'R'); }
        else if (t < 13.72) { const u = clamp((t - 13.46) / 0.26); b.position.copy(stArc(s.rel['h13.46'].clone().sub(V3(0, 1.4, 0)), V3(x + 3.2, 5.6, ST_TZ - 3.4), u, 3)); b.rotation.set(u * 3, 0.3, u * 2); if (u > 0.75) c3Layer(b, C3.L_BG); }
        else { c3Layer(b, C3.L_BG); b.position.set(x + 3.2, 5.6, ST_TZ - 3.4); b.rotation.set(0.4, 0.3, 0.2); b.scale.set(0.65, 0.65 * (t < 13.88 ? 1 : 1 - 0.7 * clamp((t - 13.88) / 0.08)), 0.65); } }
      if (t >= 9.9 && t < 12.9) { const k = clamp((t - 9.95) / 0.2) * (t > 12.62 ? 1 - clamp((t - 12.62) / 0.25) : 1); s.bagLight.intensity = 1.2 * k; s.bagLight.position.set(ST_HB.x, ST_HB.y + 5, ST_HB.z);
        s.glow.visible = k > 0.02; s.glow.position.set(ST_HB.x, ST_HB.y + 7.4, ST_HB.z); s.glow.quaternion.copy(cam.quaternion); s.glow.scale.setScalar(0.45 + 0.25 * k + 0.03 * Math.sin(t * 9)); s.glow.material.opacity = 0.55 * k; } }
    // the novel (R hand, 'Novels' 11.48) and the comic (L hand, 'comics' 11.92) rise OUT of the open bag into his hand and are
    // shown in front of the card (never through the hair); on 'a whole' (12.3) both hands go back in, the stack rises out of
    // the bag (12.36-12.62) and swings to his right side; the novel + comic are laid on its top. A depth-only block hides the
    // stack below the sidewalk while it is still inside the bag. At the cab: the raised hand lifts it, it slides onto the seat.
    const ry = stYawTo(cam, ST_HB2.x, ST_HB2.z), inBag = (dy) => ST_HB.clone().add(V3(0, dy, 0));
    s.bagOcc.visible = t >= 11.0 && t < 12.9;
    let spos = null, srot = 0;
    if (t >= 12.36) { const u1 = EZ.io(clamp((t - 12.36) / 0.26)), u2 = EZ.io(clamp((t - 12.56) / 0.22)); spos = inBag(lerp(-5.8, 2.6, u1)); if (u2 > 0) spos.lerp(stStackAt(s, t), u2);
      srot = stYawTo(cam, spos.x, spos.z);
      if (t >= 16.5) { const k = EZ.io(clamp((t - 16.5) / 0.36)), cr = s.truck.userData.crate.getWorldPosition(V3(0, 0, 0)).add(V3(0, 0.45, 0)); spos.lerp(cr, k); srot = lerp(srot, -Math.PI / 2 + 0.1, k); }
      const st = s.stack; st.visible = true; st.position.copy(spos); st.rotation.set(0, srot, 0); if (u2 >= 1 && t < 16.6) gripDot(s, 'hero', 'L'); }
    for (const [obj, nm, t0, rz, dz, dr] of [[s.novel, 'R', 11.36, 0.15, 0.3, 0.2], [s.comic, 'L', 11.84, -0.15, 0.72, -0.25]]) { if (t < t0) continue;
      gripProp(s, obj, 'hero', nm, V3(0, -1.2, 0), { ry, rz, behind: -0.45 }); const hp = obj.position.clone(), u = EZ.io(clamp((t - t0) / 0.26));
      const b0 = inBag(1.4), tc = cam.position.clone().sub(b0).setY(0).normalize(); b0.addScaledVector(tc, 1.6);   // start inside the bag's front half: the path stays in front of his card (no hidden-edge ink)
      let pos = b0.lerp(hp, u), rx = lerp(-Math.PI / 2, 0, u), rr = ry, rzz = rz;
      if (u >= 1 && t < 12.3) gripDot(s, 'hero', nm);
      if (t >= 12.28) { const k = EZ.io(clamp((t - 12.28) / 0.34)), top = (spos || inBag(-5.8)).clone().add(V3(nm === 'L' ? 0.1 : 0, 6.2 + dz, 0)); pos = pos.lerp(top, k); rx = lerp(rx, -Math.PI / 2, k); rr = lerp(ry, 0, k); rzz = lerp(rz, srot + dr, k); }
      obj.visible = true; obj.position.copy(pos); obj.rotation.set(rx, rr, rzz); }
    // the glint in B1 on 'libraries'
    if (t >= 1.6 && t < 2.5) { const k = pop(t, 1.64, 0.18) * (1 - clamp((t - 2.2) / 0.3)); popAt(s.glint, k, [-14.6, 10.6, -28.4], cam, 1.4); s.glint.rotateZ(t * 3); }
  } else {
    // morning: the bag he tosses at 53.05; the old book (dropped 53.9, lands open 54.16, taken 56.7, write-on 57.1-58.1)
    if (t < 53.4) { const b = s.mbag, kn = 4.1 * 0.75; b.visible = true; c3Layer(b, C3.L_FOCUS);
      if (t < 53.05) { b.position.copy(c3ToonHandWorld(hero, 'R')).sub(V3(0, kn, 0)); gripDot(s, 'hero', 'R'); } else { const u = clamp((t - 53.05) / 0.35); b.position.copy(stArc(s.rel['h53.05'].clone().sub(V3(0, kn, 0)), ST_HOPIN(x), u, 3)); b.rotation.set(u * 3, 0, u * 2); if (u > 0.7) c3Layer(b, C3.L_BG); } }
    // v2: the old book — in the passer's hand (placed by stPasser), let go on 'away' 53.9, drops into B1 (lands 54.16, small
    // bounce, opens), taken by the hero 56.7 (placed by stHeroMorning), write-on 57.12-58.12; the marker in his right hand
    const ob = s.old; ob.g.visible = true; ob.page(t < 57.12 ? 0 : clamp((t - 57.12) / 0.3), t < 57.5 ? 0 : clamp((t - 57.5) / 0.62)); ob.g.scale.setScalar(1);
    if (t < 53.9) { if (!s.p.passer.g.visible) ob.g.visible = false; }
    else if (t < 54.16) { const u = (t - 53.9) / 0.26, P0 = s.pb.pos, P1 = ST_INBIN; ob.open(0);
      ob.g.position.set(lerp(P0.x, P1.x, u), lerp(P0.y, P1.y, u) + 2.4 * u * (1 - u), lerp(P0.z, P1.z, u)); ob.g.quaternion.copy(s.pb.q).slerp(ST_BINQ, EZ.io(u)); }
    else if (t < 56.7 || !s.eb) { const b = t < 54.28 ? 0.22 * Math.sin(Math.PI * clamp((t - 54.16) / 0.12)) : 0; ob.g.position.set(ST_INBIN.x, ST_INBIN.y + b, ST_INBIN.z); ob.g.quaternion.copy(ST_BINQ); ob.open(stSnap(t, 54.2, 0.22)); }
    else { ob.open(1); ob.g.position.copy(s.eb.pos); ob.g.quaternion.copy(s.eb.q); ob.g.scale.setScalar(s.eb.sc); }
    if (t >= 53.4 && hero.g.visible) { const hR = c3ToonHandWorld(hero, 'R'), { X, Y, Z } = stAxes(cam), Ac = Y.clone().addScaledVector(X, 0.3).normalize(), Tc = hR.clone().addScaledVector(Ac, -0.95).addScaledVector(Z, 0.3), hB = hR.clone().addScaledVector(Z, -0.35);   // carried: in front of the card + his fist (grip dot) over it; writing: behind his fist, tip on the page
      const k = s.eb && s.eb.tip ? s.eb.k : 0; if (k > 0) stMarkerAt(s, Tc.lerp(s.eb.tip, k), Ac.lerp(hB.sub(s.eb.tip).normalize(), k)); else stMarkerAt(s, Tc, Ac); gripDot(s, 'hero', 'R'); }
  } }

// ---- the frame
// a hand position at another time (posed with that time's camera; cached: the toon pose is deterministic)
function stCacheHand(s, key, tr, fn) { ST.rel ||= {}; if (!ST.rel[key]) { seqCam(s, 'street', tr); ST.rel[key] = fn(tr).clone(); } return ST.rel[key]; }
function stFrame(t) { const s = ST_get(); hideAll(s); hideGrips(s); stSky(s, t);
  if (!ST.rel || !ST.rel['p53.9']) { [6.56, 7.28, 13.46, 53.05].forEach((tr) => { const x0 = ST_TX(tr); stTruckAt(s, tr); stCacheHand(s, 'h' + tr, tr, () => { stHero(s, tr, x0); return c3ToonHandWorld(s.p.hero, 'R'); }); stCacheHand(s, 'l' + tr, tr, () => { stHero(s, tr, x0); return c3ToonHandWorld(s.p.hero, 'L'); }); });
    stCacheHand(s, 'p53.9', 53.9, () => { stPasser(s, 53.9); return c3ToonHandWorld(s.p.passer, 'R'); }); hideAll(s); }
  s.rel = ST.rel;
  const cam = seqCam(s, 'street', t);
  s.skyline.position.copy(cam.position);
  const x = stTruckAt(s, t); stLifter(s, t, x);
  { const P = s.flag.geometry.attributes.position, b = s.flag.userData.base; for (let i = 0; i < P.count; i++) { const px = b[i * 3], k = (px + 10.5) / 21; P.setZ(i, Math.sin(px * 0.45 - t * 5.5) * 1.4 * k + Math.sin(b[i * 3 + 1] * 0.3 - t * 3) * 0.4 * k); } P.needsUpdate = true; s.flag.geometry.computeVertexNormals(); }
  s.laundry.forEach((L) => { L.rotation.x = 0.12 * Math.sin(t * 1.7 + L.userData.ph); });
  // the street clock: 5:59 -> 6:00 on '6' (dawn); 8:14 -> 8:15 in the morning
  { const dawn = t < 30, mins = dawn ? (t < 5.46 ? 59 : 0) : (t < 55 ? 14 : 15), hrs = dawn ? (t < 5.46 ? 5 + 59 / 60 : 6) : 8 + mins / 60, kick = dawn && t >= 5.46 && t < 5.8 ? 0.08 * Math.sin((t - 5.46) * 50) * Math.exp(-(t - 5.46) * 10) : 0;
    s.clockH.forEach(([hh, mh]) => { hh.rotation.z = -(hrs / 12) * TAU; mh.rotation.z = -(mins / 60) * TAU + kick; }); }
  const look = c3CamAt(CAMSEQ.street, t).l; stShadowAt(s, look[0], look[2]);
  s.minibook.visible = false; stHero(s, t, x); stPasser(s, t); stBoss(s, t, x);
  stProps(s, t, x);
  c3Render(s.scene, cam, { bg: '#f0b0a0', bgBlur: t > 54.9 && t < 58.4 ? 2.4 : t > 9.5 && t < 10.5 ? 2.0 : 1.0, glow: 0.3, glowBlur: 12 });
}
for (const id of ['s01', 's02', 's03', 's04', 's05', 's06', 'g1', 's07', 's22', 's23', 's24', 's25']) { SHOT_FN[id] = (t) => stFrame(t); SNAPS[id] = 'free'; }

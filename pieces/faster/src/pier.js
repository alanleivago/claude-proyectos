// =====================================================================
//  PIER — Brighton's pier and seafront (the pier agent owns this file).
//  World axes: south = -z (the sea), north = +z (the town). Shoreline at z = 0; pebble beach z 0..60 rising to the
//  promenade (y = 1.6, z 60..102: prom, King's Road, pavement), Regency terraces from z = 102, the town climbing to the
//  Downs behind. The pier deck (y = PIER.DECK) runs from the promenade (z = +59) south to z = -418; it widens past
//  z = PIER.WIDE to x = ±PIER.WX for the arcade and the funfair at its head. Cast-iron piles go down to y ≈ -42.
//  Exposed on S: wheel (group on the beach; posePier never moves it), rim (rotating part), cabs (gondolas, posed here),
//  walk / lean / sit (hero people), crowd + cl (beach crowd), pc + pcl (pier crowd), prom + prl (promenade crowd),
//  gulls, pod (i360), lampMat (globe material) + lampPos (globe positions), winMats (lit-window facades).
// =====================================================================
const PIER = { DECK: 7.0, W: 10, Z0: 55, Z1: -420, SHORE: 0, PROM: 60, RAILX: 4.9, RAILY: 8.1, WIDE: -300, WX: 22 };
// beach height (pebbles), the seabed (owned by the ocean file) and the town's ground
const pierGY = (x, z) => (z < 0 ? 0.05 + z * 0.12 : 0.05 + 0.25 * ss(0, 14, z) + 0.7 * ss(40, 60, z) + 0.035 * Math.sin(z * 1.7 + 2 * Math.sin(x * 0.07)) * ss(2, 8, z));
const pierBedY = (z) => (typeof BED === 'function' ? BED(z) - 0.2 : z * 0.04 - 0.2);
const pierGround = (x, z) => (z >= -0.5 ? pierGY(x, z) : pierBedY(z));
const pierHY = (x, z) => 1.6 + 0.045 * Math.max(0, z - 105) + 3 * Math.sin(x * 0.005 + 0.5) * ss(110, 400, z) + ss(650, 1600, z) * (55 + 35 * Math.sin(x * 0.0021 + 1) + 18 * Math.sin(x * 0.0063 + z * 0.002));

// ---- small kit: merged geometry, beams, instanced batches, materials, textures
function pierMerge(list) { let n = 0; const H = list.map(([g, m]) => { const h = g.index ? g.toNonIndexed() : g.clone(); if (m) h.applyMatrix4(m); n += h.attributes.position.count; return h; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
  H.forEach((h) => { const c = h.attributes.position.count; P.set(h.attributes.position.array, o * 3); N.set(h.attributes.normal.array, o * 3); if (h.attributes.uv) U.set(h.attributes.uv.array, o * 2); o += c; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.BufferAttribute(U, 2)); return g; }
const _pY = new THREE.Vector3(0, 1, 0);
function pierBeam(ax, ay, az, bx, by, bz, tx, tz = tx) { const d = new THREE.Vector3(bx - ax, by - ay, bz - az), L = d.length(); const q = new THREE.Quaternion().setFromUnitVectors(_pY, d.divideScalar(L));
  return new THREE.Matrix4().compose(new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2), q, new THREE.Vector3(tx, L, tz)); }
function pierIM(par, geo, mat, Ms, cols, shadow = true) { const n = Ms.length, m = IM(geo, mat, Math.max(1, n), shadow); for (let i = 0; i < n; i++) m.setMatrixAt(i, Ms[i]); if (cols) for (let i = 0; i < n; i++) m.setColorAt(i, cols[i]); m.count = n; m.frustumCulled = false; par.add(m); return m; }
const pierHSL = (h, s, l) => lin(`hsl(${h.toFixed(1)}, ${clamp(s, 0, 100).toFixed(1)}%, ${clamp(l, 0, 100).toFixed(1)}%)`);
const PIER_BOX = new THREE.BoxGeometry(1, 1, 1), PIER_TUBE = new THREE.CylinderGeometry(0.5, 0.5, 1, 7);
// iron that is wet and weedy below the old waterline (piles, groynes)
function pierWetMat(col) { const m = STDm({ color: col, roughness: 0.85, metalness: 0.2 });
  m.onBeforeCompile = (sh) => { sh.vertexShader = 'varying vec3 vPw;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n { vec4 q = vec4(transformed, 1.0);\n#ifdef USE_INSTANCING\n q = instanceMatrix * q;\n#endif\n vPw = (modelMatrix * q).xyz; }');
    sh.fragmentShader = 'varying vec3 vPw;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      { float n = fract(sin(dot(floor(vPw * 9.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453); float wet = 1.0 - smoothstep(0.2, 1.1, vPw.y + 0.25 * n);
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.10, 0.13, 0.07), vec3(0.45, 0.43, 0.37), step(0.8, n)), wet * 0.85);
        diffuseColor.rgb *= 0.88 + 0.24 * n * (1.0 - wet); }`); }; return m; }
function pierPlankTex(seed) { return g3Tex((x, w, h) => { const R = RNG('plk' + seed); x.fillStyle = '#ddd2c4'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 50; k++) blot(x, R.r(0, w), R.r(0, h), R.r(20, 90), R.pick(['rgba(255,248,235,0.12)', 'rgba(90,60,40,0.09)']));
  for (let k = 0; k < 110; k++) { const y0 = R.r(0, h), f = R.r(0.002, 0.012), A = R.r(0.5, 4), p = R.r(0, 6); x.strokeStyle = `rgba(80,50,30,${R.r(0.04, 0.2).toFixed(3)})`; x.lineWidth = R.r(0.6, 2.2); x.beginPath(); x.moveTo(0, y0); for (let xx = 0; xx <= w; xx += 16) x.lineTo(xx, y0 + Math.sin(xx * f + p) * A); x.stroke(); }
  for (let k = 0; k < 3; k++) { const cx = R.r(60, w - 60), cy = R.r(18, h - 18); x.fillStyle = 'rgba(70,40,24,0.5)'; x.beginPath(); x.ellipse(cx, cy, R.r(5, 9), R.r(3, 5), 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(70,40,24,0.18)'; x.lineWidth = 1.5; for (let r = 1; r < 4; r++) { x.beginPath(); x.ellipse(cx, cy, 9 + r * 8, 5 + r * 3, 0, 0, TAU); x.stroke(); } }
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(40,24,14,0.6)'); g.addColorStop(0.12, 'rgba(40,24,14,0)'); g.addColorStop(0.86, 'rgba(40,24,14,0)'); g.addColorStop(1, 'rgba(40,24,14,0.65)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(46,40,36,0.75)'; for (let xx = 50; xx < w; xx += 170) [17, 47].forEach((yy) => { x.beginPath(); x.arc(xx + R.n(4), yy, 2.2, 0, TAU); x.fill(); }); }, 1024, 64); }
function pierPebbleTex() { return g3Tex((x, w, h) => { const R = RNG('pebbles'); x.fillStyle = '#5e5750'; x.fillRect(0, 0, w, h);
  const cols = ['#8f8a84', '#a8a29a', '#77716b', '#c2b8a8', '#b49c80', '#d8cfc0', '#5e5852', '#9a8670', '#b8b0a6', '#cfc6b8', '#8a7a6a', '#a09080'];
  for (let k = 0; k < 4600; k++) { const r = R.r(2.5, 8.5) * (R.f() < 0.08 ? 1.6 : 1), cx = R.r(0, w), cy = R.r(0, h), e = R.r(0.55, 1), a = R.r(0, Math.PI), c = R.pick(cols);
    [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]].forEach(([ox, oy]) => { const X = cx + ox, Y = cy + oy; if (X < -14 || X > w + 14 || Y < -14 || Y > h + 14) return;
      x.fillStyle = 'rgba(25,22,20,0.4)'; x.beginPath(); x.ellipse(X + 1.3, Y + 1.7, r, r * e, a, 0, TAU); x.fill();
      x.fillStyle = c; x.beginPath(); x.ellipse(X, Y, r, r * e, a, 0, TAU); x.fill();
      const g = x.createRadialGradient(X - r * 0.35, Y - r * 0.4, r * 0.05, X, Y, r * 1.05); g.addColorStop(0, 'rgba(255,255,255,0.38)'); g.addColorStop(0.5, 'rgba(255,255,255,0.04)'); g.addColorStop(1, 'rgba(0,0,0,0.3)'); x.fillStyle = g; x.fill(); }); } }, 512, 512); }
function pierStripeTex(col, n = 8, w = 256, h = 16, alt = '#f6f2ea') { return g3Tex((x) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? alt : col; x.fillRect(i * w / n, 0, w / n + 1, h); } }, w, h); }
function pierArcTex(w, h, o = {}) { return g3Tex((x) => { x.fillStyle = o.wall || '#f6f2ea'; x.fillRect(0, 0, w, h); const n = o.n || 8, bw = w / n, trim = o.trim || '#2f8a7a';
  for (let i = 0; i < n; i++) { const cx = (i + 0.5) * bw, aw = bw * 0.6, top = h * 0.2, bot = h * 0.9;
    const arch = () => { x.beginPath(); x.moveTo(cx - aw / 2, bot); x.lineTo(cx - aw / 2, top + aw / 2); x.arc(cx, top + aw / 2, aw / 2, Math.PI, 0); x.lineTo(cx + aw / 2, bot); };
    const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, '#5a7890'); g.addColorStop(1, '#16222c'); x.fillStyle = g; arch(); x.fill();
    x.strokeStyle = 'rgba(245,245,240,0.85)'; x.lineWidth = Math.max(2, bw * 0.02); x.beginPath(); x.moveTo(cx, top); x.lineTo(cx, bot); x.moveTo(cx - aw / 2, top + aw * 0.75); x.lineTo(cx + aw / 2, top + aw * 0.75); x.stroke();
    x.strokeStyle = trim; x.lineWidth = bw * 0.06; x.beginPath(); x.arc(cx, top + aw / 2, aw / 2 + bw * 0.04, Math.PI, 0); x.stroke();
    x.fillStyle = '#ffe9a8'; for (let a = 0; a <= 10; a++) { const an = Math.PI + a / 10 * Math.PI; x.beginPath(); x.arc(cx + Math.cos(an) * (aw / 2 + bw * 0.1), top + aw / 2 + Math.sin(an) * (aw / 2 + bw * 0.1), Math.max(1.5, bw * 0.018), 0, TAU); x.fill(); } }
  x.fillStyle = trim; x.fillRect(0, 0, w, h * 0.07); x.fillRect(0, h * 0.93, w, h * 0.07); x.fillStyle = '#ffe9a8'; for (let i = 0; i < w; i += Math.max(6, bw * 0.12)) { x.beginPath(); x.arc(i, h * 0.035, Math.max(1.5, bw * 0.018), 0, TAU); x.fill(); } }, w, h); }

// ---- a cast-iron railing along straight segments: posts, top rail, mid and bottom rails, balusters, optional rings
function pierRail(par, segs, y0, mat, o = {}) { const H = o.h ?? 1.1, bs = o.bs ?? 0.13, skip = o.skip || [], P = [], TR = [], MR = [], BL = [], RG = [];
  segs.forEach(([x0, z0, x1, z1]) => { const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, ry = Math.atan2(ux, uz), n = Math.max(1, Math.round(L / (o.ps || 2.4))), at = (s) => [x0 + ux * s, z0 + uz * s], mid = at(L / 2);
    TR.push(M4c(mid[0], y0 + H - 0.05, mid[1], ry, o.tw ?? 0.17, 0.1, L + 0.17)); MR.push(M4c(mid[0], y0 + H * 0.66, mid[1], ry, 0.06, 0.06, L)); MR.push(M4c(mid[0], y0 + 0.14, mid[1], ry, 0.06, 0.06, L));
    for (let i = 0; i <= n; i++) { const [px, pz] = at(i * L / n); P.push(M4c(px, y0, pz, ry)); }
    for (let s = bs / 2; s < L; s += bs) { const [px, pz] = at(s); if (skip.some(([sx, sz]) => Math.abs(px - sx) + Math.abs(pz - sz) < 0.45)) continue; BL.push(M4c(px, y0 + 0.14, pz)); }
    if (o.rings) for (let s = 0.2; s < L - 0.1; s += 0.26) { const [px, pz] = at(s); if (skip.some(([sx, sz]) => Math.abs(px - sx) + Math.abs(pz - sz) < 0.45)) continue; RG.push(M4c(px, y0 + H * 0.66 + (H * 0.34 - 0.07) / 2, pz, ry - Math.PI / 2)); } });
  const post = pierMerge([[new THREE.BoxGeometry(0.13, H - 0.08, 0.13), Tr(0, (H - 0.08) / 2, 0)], [new THREE.BoxGeometry(0.22, 0.14, 0.22), Tr(0, 0.07, 0)], [new THREE.BoxGeometry(0.18, 0.06, 0.18), Tr(0, H * 0.66, 0)], [new THREE.BoxGeometry(0.19, 0.07, 0.19), Tr(0, H - 0.16, 0)], [new THREE.SphereGeometry(0.06, 8, 6), Tr(0, 0.3, 0)]]);
  const hb = H * 0.66 - 0.17, bal = pierMerge([[new THREE.CylinderGeometry(0.015, 0.015, hb, 6), Tr(0, hb / 2, 0)], [new THREE.SphereGeometry(0.03, 6, 4), Tr(0, hb * 0.5, 0)], [new THREE.CylinderGeometry(0.025, 0.02, 0.06, 6), Tr(0, hb * 0.2, 0)]]);
  pierIM(par, post, mat, P); pierIM(par, PIER_BOX, mat, TR); pierIM(par, PIER_BOX, mat, MR); pierIM(par, bal, mat, BL);
  if (RG.length) pierIM(par, new THREE.TorusGeometry((H * 0.34 - 0.1) / 2 - 0.035, 0.009, 5, 14), mat, RG, null, false); }

// ---- Brighton double-globe lamp (iron + two globes), arms along local x
function pierLampGeo() { const L = [], C = (r0, r1, h, y, seg = 10) => L.push([new THREE.CylinderGeometry(r0, r1, h, seg), Tr(0, y, 0)]);
  C(0.24, 0.3, 0.5, 0.25, 8); C(0.18, 0.24, 0.12, 0.56, 8); C(0.1, 0.14, 0.7, 0.97, 12); C(0.06, 0.085, 3.0, 2.82, 10); C(0.1, 0.1, 0.07, 1.36); C(0.095, 0.095, 0.07, 3.3); C(0.11, 0.07, 0.24, 4.3);
  L.push([new THREE.BoxGeometry(1.36, 0.07, 0.07), Tr(0, 4.35, 0)]);
  L.push([new THREE.TorusGeometry(0.3, 0.024, 5, 10, Math.PI / 2), Tr(0.3, 4.05, 0).multiply(Rz(Math.PI / 2))]); L.push([new THREE.TorusGeometry(0.3, 0.024, 5, 10, Math.PI / 2), Tr(-0.3, 4.05, 0)]);
  [-1, 1].forEach((s) => { L.push([new THREE.CylinderGeometry(0.09, 0.05, 0.12, 8), Tr(s * 0.62, 4.43, 0)]); L.push([new THREE.ConeGeometry(0.1, 0.12, 8), Tr(s * 0.62, 4.93, 0)]); });
  L.push([new THREE.ConeGeometry(0.11, 0.42, 8), Tr(0, 4.62, 0)]); L.push([new THREE.SphereGeometry(0.05, 8, 6), Tr(0, 4.86, 0)]);
  const G = [-1, 1].map((s) => [new THREE.SphereGeometry(0.2, 16, 12), Tr(s * 0.62, 4.68, 0)]);
  return { iron: pierMerge(L), glass: pierMerge(G) }; }

// ---- an octagonal kiosk with an onion dome (Brighton pier style)
let PIER_KM = null;
function pierKiosk(par, x, y, z, s, col, domeCol, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.y = ry; par.add(g);
  if (!PIER_KM) PIER_KM = { cream: STDm({ color: '#f4efe4', roughness: 0.7 }), dark: STDm({ color: '#1c2a32', roughness: 0.15, metalness: 0.4 }), gold: STDm({ color: '#d8b048', roughness: 0.3, metalness: 0.8 }), cols: {}, domes: {},
    onion: new THREE.LatheGeometry([[1.22, 0], [1.34, 0.3], [1.25, 0.75], [0.9, 1.2], [0.45, 1.55], [0.16, 1.85], [0.05, 2.05], [0.0, 2.1]].map(([a, b]) => new THREE.Vector2(a, b)), 16) };
  const K = PIER_KM, c = K.cols[col] || (K.cols[col] = STDm({ color: col, roughness: 0.6 })), dm = K.domes[domeCol] || (K.domes[domeCol] = STDm({ color: domeCol, roughness: 0.35, metalness: 0.45 }));
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.3, 1.0, 8), c, 0, 0.5, 0)); g.add(mesh(new THREE.CylinderGeometry(1.18, 1.18, 1.2, 8), K.dark, 0, 1.6, 0));
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * TAU; g.add(mesh(new THREE.BoxGeometry(0.1, 1.25, 0.1), K.cream, Math.sin(a) * 1.2, 1.62, Math.cos(a) * 1.2, { ry: a })); }
  g.add(mesh(new THREE.CylinderGeometry(1.25, 1.27, 0.08, 8), K.cream, 0, 1.02, 0)); g.add(mesh(new THREE.CylinderGeometry(1.45, 1.3, 0.38, 8), K.cream, 0, 2.38, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 8), c, 0, 2.6, 0)); g.add(mesh(K.onion, dm, 0, 2.62, 0)); g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.7, 6), K.gold, 0, 5.0, 0)); g.add(mesh(new THREE.SphereGeometry(0.1, 8, 6), K.gold, 0, 4.85, 0));
  return g; }

// ---- the deck (individual boards), the iron substructure, the railings and the lamps
function pierDeck(st, S) { const R = RNG('deck'), sc = st.scene, D = PIER.DECK, WX = PIER.WX, WZ = PIER.WIDE, V = [[], [], []], C = [[], [], []];
  const row = (z, x0, x1) => { const L = x1 - x0, cuts = [x0]; if (L < 12) { if (R.f() < 0.6) cuts.push(R.r(x0 + 2, x1 - 2)); } else { let c = x0 + R.r(1, 5); while (c < x1 - 2.5) { cuts.push(c); c += R.r(3.5, 6.5); } } cuts.push(x1);
    for (let i = 0; i < cuts.length - 1; i++) { const a = cuts[i], b = cuts[i + 1], v = R.i(0, 2), l = R.n(1); V[v].push(M4c((a + b) / 2, D - 0.03, z, 0, b - a - 0.014, 1, 1)); C[v].push(pierHSL(26 + R.r(-4, 4), 19 + R.r(-5, 5), 47 + l * 5 + (R.f() < 0.06 ? -8 : 0) + (R.f() < 0.05 ? 6 : 0))); } };
  for (let z = 59; z > PIER.Z1 + 1.8; z -= 0.21) row(z, z > WZ ? -5 : -WX, z > WZ ? 5 : WX);
  const tex = pierPlankTex(1); tex.wrapS = THREE.RepeatWrapping;
  V.forEach((Ms, v) => { const g = new THREE.BoxGeometry(1, 0.06, 0.19), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.6 + v * 0.2); pierIM(sc, g, STDm({ map: tex, roughness: 0.82 }), Ms, C[v], false); });
  const under = STDm({ color: '#221a14', roughness: 1 }), nL = 59 - WZ, wL = WZ - PIER.Z1 - 1.8;
  sc.add(mesh(new THREE.BoxGeometry(10, 0.1, nL), under, 0, D - 0.11, (59 + WZ) / 2)); sc.add(mesh(new THREE.BoxGeometry(2 * WX, 0.1, wL), under, 0, D - 0.11, WZ - wL / 2));
  // painted fascia along the deck edge
  const green = STDm({ color: '#2b7565', roughness: 0.45, metalness: 0.25 }), fas = STDm({ color: '#255f53', roughness: 0.55, metalness: 0.2 }); S.railMat = green;
  [-1, 1].forEach((s) => { sc.add(mesh(new THREE.BoxGeometry(0.1, 0.42, nL), fas, s * 5.06, D - 0.2, (59 + WZ) / 2)); sc.add(mesh(new THREE.BoxGeometry(0.1, 0.42, wL), fas, s * (WX + 0.06), D - 0.2, WZ - wL / 2)); sc.add(mesh(new THREE.BoxGeometry(WX - 5, 0.42, 0.1), fas, s * (WX + 5) / 2, D - 0.2, WZ - 0.06)); });
  sc.add(mesh(new THREE.BoxGeometry(2 * WX, 0.42, 0.1), fas, 0, D - 0.2, PIER.Z1 + 1.74));
  // substructure: bents of cast-iron columns every 5 m with cap beams, ties and cross-bracing down to y = -42
  const COL = [], CAPI = [], CAPB = [], TIE = [], BR = [], GIR = [], LV = [1.5, -6, -14, -22, -30, -38];
  for (let z = 52; z > PIER.Z1 + 1; z -= 5) { const wide = z < WZ - 1, xs = wide ? [-21, -15, -9, -3, 3, 9, 15, 21] : [-4.4, -1.5, 1.5, 4.4], span = xs[xs.length - 1] - xs[0];
    xs.forEach((x) => { COL.push(M4c(x, (D - 0.6 - 42) / 2, z, 0, 1, D - 0.6 + 42, 1)); CAPI.push(M4c(x, D - 0.85, z)); });
    CAPB.push(M4c(0, D - 0.55, z, 0, span + 0.9, 0.42, 0.34));
    LV.forEach((y, li) => { TIE.push(M4c(0, y, z, 0, span, 0.16, 0.16)); const yA = li ? LV[li - 1] : D - 0.8; for (let b = 0; b < xs.length - 1; b++) { const s = (b + li) % 2; BR.push(pierBeam(xs[b], s ? y : yA, z, xs[b + 1], s ? yA : y, z, 0.1)); } });
    if (z - 5 > PIER.Z1 + 1) [xs[0], xs[xs.length - 1]].forEach((x) => LV.forEach((y, li) => { TIE.push(M4c(x, y, z - 2.5, 0, 0.14, 0.14, 5)); BR.push(pierBeam(x, li ? LV[li - 1] : D - 0.8, z, x, y, z - 5, 0.09)); })); }
  [-4.4, -1.5, 1.5, 4.4].forEach((x) => GIR.push(M4c(x, D - 0.4, (52 + WZ) / 2, 0, 0.26, 0.45, 52 - WZ)));
  [-21, -15, -9, -3, 3, 9, 15, 21].forEach((x) => GIR.push(M4c(x, D - 0.4, WZ - wL / 2, 0, 0.26, 0.45, wL)));
  const iron = pierWetMat('#4c4741');
  pierIM(sc, new THREE.CylinderGeometry(0.2, 0.25, 1, 10), iron, COL); pierIM(sc, new THREE.CylinderGeometry(0.34, 0.22, 0.45, 10), iron, CAPI); pierIM(sc, PIER_BOX, iron, CAPB); pierIM(sc, PIER_BOX, iron, TIE); pierIM(sc, PIER_BOX, iron, BR); pierIM(sc, PIER_BOX, iron, GIR);
  // lamps: on the railing line every 25 m (one stands a few metres from the camera spots, none in the lens) + the head
  const LP = []; for (let z = 50; z >= WZ; z -= 25) [-1, 1].forEach((s) => LP.push([s * PIER.RAILX, z, Math.PI / 2]));
  [-325, -360, -395].forEach((z) => [-1, 1].forEach((s) => LP.push([s * (WX - 0.1), z, Math.PI / 2]))); [-12, 12].forEach((x) => LP.push([x, PIER.Z1 + 1.9, 0]));
  // railings (sea-green cast iron, rings between mid and top rail)
  const RX = PIER.RAILX, segs = [[RX, 59, RX, WZ], [-RX, 59, -RX, WZ], [RX, WZ, WX - 0.1, WZ], [-RX, WZ, -(WX - 0.1), WZ], [WX - 0.1, WZ, WX - 0.1, PIER.Z1 + 1.9], [-(WX - 0.1), WZ, -(WX - 0.1), PIER.Z1 + 1.9], [-(WX - 0.1), PIER.Z1 + 1.9, WX - 0.1, PIER.Z1 + 1.9]];
  pierRail(sc, segs, D, green, { rings: true, skip: LP.map(([x, z]) => [x, z]) });
  return LP; }
function pierLamps(st, S, LP) { const G = pierLampGeo(), ir = STDm({ color: '#1b2724', roughness: 0.45, metalness: 0.55 }), Mi = [];
  S.lampMat = STDm({ color: '#fffaf0', emissive: '#ffd48a', emissiveIntensity: 0.12, roughness: 0.15, transparent: true, opacity: 0.95 }); S.lampPos = [];
  LP.forEach(([x, z, ry, y = PIER.DECK]) => { const M = M4c(x, y, z, ry); Mi.push(M); [-1, 1].forEach((s) => S.lampPos.push(new THREE.Vector3(s * 0.62, 4.68, 0).applyMatrix4(M))); });
  pierIM(st.scene, G.iron, ir, Mi); pierIM(st.scene, G.glass, S.lampMat, Mi, null, false); }

// ---- buildings on the pier: entrance, kiosks, benches, the arcade and the funfair at the head
function pierFurniture(st, S) { const sc = st.scene, D = PIER.DECK, R = RNG('furn');
  // the pier's base block on the beach and its entrance gate
  { const t = pierArcTex(512, 256, { n: 4, wall: '#f4efe4' }), m = STDm({ map: t, roughness: 0.7 }); sc.add(mesh(new THREE.BoxGeometry(16, D, 9), [m, m, STDm({ color: '#eae4d8' }), m, m, m], 0, D / 2, 55));
    const cream = STDm({ color: '#f6f2ea', roughness: 0.6 }), gold = STDm({ color: '#d8b048', roughness: 0.3, metalness: 0.8 });
    [-1, 1].forEach((s) => { sc.add(mesh(new THREE.BoxGeometry(1.4, 6, 1.4), cream, s * 6.2, D + 3, 56)); pierKiosk(sc, s * 6.2, D + 6, 56, 0.62, '#f6f2ea', '#d8b048'); });
    sc.add(mesh(new THREE.BoxGeometry(13.8, 1.1, 0.8), cream, 0, D + 5.4, 56)); sign(sc, ['BRIGHTON PIER'], 0, D + 5.4, 55.58, 10, 0.95, { bg: '#1f6f62', fg: '#fff3c8', glow: 0.25, ry: Math.PI }); sign(sc, ['BRIGHTON PIER'], 0, D + 5.4, 56.42, 10, 0.95, { bg: '#1f6f62', fg: '#fff3c8', glow: 0.25 }); }
  // kiosks along the deck (never on the +x side near the camera spots)
  const KC = ['#2b7565', '#c8372d', '#2e5aa8', '#f0c33c', '#f6f2ea'], DC = ['#f6f2ea', '#d8b048', '#2b7565', '#e8e4dc'];
  [[-3.3, 44], [-3.3, 30], [-3.3, 16], [3.3, 44], [3.3, 30], [-3.3, -128], [-3.3, -175], [3.3, -150], [-3.3, -222], [3.3, -240], [-3.3, -262]].forEach(([x, z], i) => pierKiosk(sc, x, D, z, 0.95, KC[i % KC.length], DC[i % DC.length]));
  // benches (wood slats on iron ends)
  { const W = [], I = [], wd = []; for (let s = 0; s < 4; s++) wd.push([new THREE.BoxGeometry(1.8, 0.04, 0.09), Tr(0, 0.45, -0.18 + s * 0.12)]); for (let s = 0; s < 3; s++) wd.push([new THREE.BoxGeometry(1.8, 0.09, 0.03), Tr(0, 0.62 + s * 0.13, -0.27 - s * 0.03).multiply(Rx(-0.2))]);
    const ir = []; [-0.82, 0.82].forEach((a) => { ir.push([new THREE.BoxGeometry(0.05, 0.45, 0.06), Tr(a, 0.22, 0.17)], [new THREE.BoxGeometry(0.05, 0.9, 0.06), Tr(a, 0.45, -0.26).multiply(Rx(-0.12))], [new THREE.BoxGeometry(0.05, 0.05, 0.5), Tr(a, 0.66, -0.02)], [new THREE.BoxGeometry(0.05, 0.05, 0.5), Tr(a, 0.42, -0.03)]); });
    const pos = []; for (let z = -62.5; z > PIER.WIDE; z -= 25) if (![-128, -175, -222, -262].some((k) => Math.abs(k - z) < 4)) pos.push([-4.35, z, Math.PI / 2]);
    [-37, -112, -187, -212, -287, 37.5, 12.5].forEach((z) => pos.push([4.35, z, -Math.PI / 2])); [-12.5, 22].forEach((z) => pos.push([-4.35, z, Math.PI / 2]));
    [-310, -330].forEach((z) => [-1, 1].forEach((s) => pos.push([s * 21.4, z, -s * Math.PI / 2])));
    S.benches = pos; pos.forEach(([x, z, ry]) => { W.push(M4c(x, D, z, ry)); I.push(M4c(x, D, z, ry)); });
    pierIM(sc, pierMerge(wd), STDm({ color: '#8a5e3a', roughness: 0.75 }), W); pierIM(sc, pierMerge(ir), STDm({ color: '#1e2a26', roughness: 0.5, metalness: 0.5 }), I); }
  // the arcade ("Palace of Fun") with domes and a sign
  { const g = new THREE.Group(); g.position.set(0, D, -368); sc.add(g); const t = pierArcTex(1024, 288, { n: 8 }), side = STDm({ map: wrap(pierArcTex(1024, 288, { n: 8 }), 1.6, 1), roughness: 0.7 }), roofM = STDm({ color: '#e6e2da', roughness: 0.8 });
    g.add(mesh(new THREE.BoxGeometry(32, 9, 52), [side, side, roofM, roofM, STDm({ map: t, roughness: 0.7 }), side], 0, 4.5, 0)); g.add(mesh(new THREE.BoxGeometry(33, 0.7, 53), STDm({ color: '#2b7565', roughness: 0.5 }), 0, 9.2, 0));
    const white = STDm({ color: '#f6f3ee', roughness: 0.5 }), teal = STDm({ color: '#2f8a7a', roughness: 0.35, metalness: 0.4 }), gold = STDm({ color: '#d8b048', roughness: 0.3, metalness: 0.8 });
    g.add(mesh(new THREE.CylinderGeometry(6.5, 6.5, 2, 24), white, 0, 10.5, -4)); g.add(mesh(new THREE.SphereGeometry(6.5, 28, 14, 0, TAU, 0, Math.PI / 2), teal, 0, 11.5, -4)); g.add(mesh(new THREE.CylinderGeometry(0.7, 0.9, 2.5, 12), white, 0, 18.8, -4)); g.add(mesh(new THREE.ConeGeometry(0.9, 2, 12), gold, 0, 21, -4));
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([a, b]) => { g.add(mesh(new THREE.BoxGeometry(3.4, 12.5, 3.4), white, a * 15.5, 6.25, b * 25.5)); pierKiosk(g, a * 15.5, 12.5, b * 25.5, 1.25, '#f6f3ee', '#2f8a7a'); });
    sign(g, ['BRIGHTON PIER'], 0, 10.9, 26.6, 17, 2.1, { bg: '#c8202a', fg: '#fff3c8', glow: 0.35 }); sign(g, ['PALACE OF FUN'], 0, 7.6, 26.05, 9, 1.1, { bg: '#1f6f62', fg: '#fff3c8', glow: 0.3 });
    // flags on the towers
    const fl = STDm({ color: '#c8202a', side: THREE.DoubleSide }); [[-1, 1], [1, 1]].forEach(([a, b]) => { g.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 3, 6), gold, a * 15.5, 18.2, b * 25.5)); g.add(mesh(new THREE.PlaneGeometry(1.4, 0.8), fl, a * 15.5 + 0.7, 19.2, b * 25.5, { ry: 0.3 })); }); }
  // funfair at the head: helter-skelter, drop tower, carousel
  { const z0 = -407.5, wh = STDm({ color: '#f6f3ee', roughness: 0.5 });
    const hs = new THREE.Group(); hs.position.set(-13, D, z0); sc.add(hs); const stripe = g3Tex((x, w, h) => { for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#f6f2ea' : '#c8202a'; x.fillRect(0, i * h / 16, w, h / 16 + 1); } }, 16, 256);
    hs.add(mesh(new THREE.CylinderGeometry(1.7, 2.6, 15, 16), STDm({ map: stripe, roughness: 0.6 }), 0, 7.5, 0)); hs.add(mesh(new THREE.ConeGeometry(3.2, 3.2, 16), STDm({ map: pierStripeTex('#2e5aa8', 16), roughness: 0.6 }), 0, 16.6, 0)); hs.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 2, 6), wh, 0, 19, 0));
    const pts = []; for (let i = 0; i <= 120; i++) { const u = i / 120, a = u * TAU * 3.5; pts.push(new THREE.Vector3(Math.cos(a) * 3.3, 14 - u * 13.3, Math.sin(a) * 3.3)); } hs.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.42, 8), STDm({ color: '#f0c33c', roughness: 0.4 })));
    const dt = new THREE.Group(); dt.position.set(14, D, z0); sc.add(dt); dt.add(mesh(new THREE.CylinderGeometry(0.9, 1.1, 42, 12), STDm({ map: wrap(pierStripeTex('#c8202a', 2, 16, 16), 1, 1), color: '#ffffff' }), 0, 21, 0));
    dt.add(mesh(new THREE.CylinderGeometry(1.6, 1.6, 2, 12), wh, 0, 42.5, 0)); dt.add(mesh(new THREE.TorusGeometry(2.0, 0.45, 8, 20).rotateX(Math.PI / 2), STDm({ color: '#2e5aa8' }), 0, 9, 0)); dt.add(mesh(new THREE.CylinderGeometry(3, 3.4, 0.6, 16), wh, 0, 0.3, 0));
    const cr = new THREE.Group(); cr.position.set(0, D, z0 - 1); sc.add(cr); cr.add(mesh(new THREE.CylinderGeometry(5.2, 5.4, 0.6, 24), STDm({ color: '#d8b048', metalness: 0.5, roughness: 0.4 }), 0, 0.3, 0)); cr.add(mesh(new THREE.CylinderGeometry(0.35, 0.35, 4.6, 10), STDm({ color: '#d8b048', metalness: 0.7, roughness: 0.3 }), 0, 2.6, 0));
    cr.add(mesh(new THREE.ConeGeometry(6, 2.2, 24, 1, true), STDm({ map: pierStripeTex('#c8202a', 24), side: THREE.DoubleSide }), 0, 5.9, 0)); cr.add(mesh(new THREE.CylinderGeometry(6, 6, 0.5, 24, 1, true), STDm({ color: '#f6f2ea', side: THREE.DoubleSide }), 0, 4.6, 0));
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; cr.add(mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.2, 6), STDm({ color: '#d8b048', metalness: 0.7 }), Math.cos(a) * 4.3, 2.7, Math.sin(a) * 4.3)); cr.add(mesh(new THREE.BoxGeometry(0.25, 0.7, 1.1), STDm({ color: ['#f6f2ea', '#3a2a20', '#c8a070'][k % 3] }), Math.cos(a) * 4.3, 1.6 + 0.3 * (k % 2), Math.sin(a) * 4.3, { ry: -a })); } } }

// ---- the beach: pebbles, groynes, parasols, deckchairs, towels, lifeguard hut, the crowd
function pierBeach(st, S) { const R = RNG('beach'), sc = st.scene;
  const g = new THREE.PlaneGeometry(1600, 62, 400, 62).rotateX(-Math.PI / 2).translate(0, 0, 30), p = g.attributes.position, col = [];
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, pierGY(x, z)); let k = 1 + 0.06 * Math.sin(x * 0.013 + z * 0.05) + 0.05 * Math.sin(x * 0.047 - z * 0.13) + 0.04 * Math.sin(x * 0.21 + z * 0.6);
    k *= 0.82 * lerp(0.58, 1, ss(0.3, 5, z)); k *= 1 - 0.2 * Math.exp(-((z - 9 - 0.8 * Math.sin(x * 0.05)) ** 2) / 1.0); k *= 1 + 0.06 * ss(30, 55, z); col.push(k, k * 0.985, k * 0.96); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  sc.add(mesh(g, STDm({ map: wrap(pierPebbleTex(), 533, 21), vertexColors: true, roughness: 0.92 }), 0, 0, 0, { cast: false }));
  // groynes: timber posts and planks running into the sea (wet and weedy low down)
  const GX = [-305, -235, -165, -95, -30, 22, 90, 160, 230, 300], PO = [], PL = [];
  GX.forEach((gx) => { let prev = null; for (let z = 57; z >= -34; z -= 1.15) { const gy = pierGround(gx, z), top = gy + 1.05 - 0.004 * Math.max(0, -z); PO.push(M4c(gx, (top + gy - 1.6) / 2, z, R.n(0.04), 0.26, top - gy + 1.6, 0.26));
      if (prev) [0.12, 0.42, 0.72].forEach((d) => PL.push(pierBeam(gx + 0.19, prev[1] - d, prev[0], gx + 0.19, top - d, z, 0.08, 0.28))); prev = [z, top]; } });
  const wood = pierWetMat('#6e5c48'); pierIM(sc, PIER_BOX, wood, PO); pierIM(sc, PIER_BOX, wood, PL);
  // occupancy: pier, wheel base, groynes, lifeguard hut
  const occ = [], free = (x, z, r) => { if (Math.abs(x) < 7.5 && z > -3) return false; if (Math.hypot((x - 48) * 0.8, z - 28) < 13) return false; if (GX.some((q) => Math.abs(x - q) < 0.8 + r)) return false; if (Math.abs(x + 40) < 3.5 && Math.abs(z - 18) < 3.5) return false; return !occ.some(([ox, oz, or]) => Math.hypot(x - ox, z - oz) < r + or); };
  const bell = (a) => (R.f() + R.f() + R.f() - 1.5) * a, spot = (r, z0, z1, a = 200) => { for (let k = 0; k < 40; k++) { const x = R.f() < 0.75 ? bell(a) : R.r(-320, 320), z = R.r(z0, z1); if (free(x, z, r)) { occ.push([x, z, r]); return [x, z]; } } return null; };
  // parasols with deckchairs, towels and people around them
  const PCOL = ['#c8202a', '#2e5aa8', '#f0b020', '#2a9d8f', '#e86fa8', '#ef8a3a'], PAR = PCOL.map(() => []), CH = PCOL.map(() => []), CHF = [], POLE = [], TW = [], TWC = [], CL = [];
  for (let n = 0; n < 120; n++) { const s = spot(1.2, 7, 50, 140); if (!s) continue; const [x, z] = s, v = R.i(0, PCOL.length - 1), gy = pierGY(x, z); PAR[v].push(M4c(x, gy, z, R.r(0, TAU), 1, 1, 1, R.n(0.12), R.n(0.12))); POLE.push(M4c(x, gy, z));
    for (let c = R.i(0, 3); c > 0; c--) { const a = R.r(-1.2, 1.2) + Math.PI, d = R.r(1.2, 2.0), cx = x + Math.sin(a) * d, cz = z + Math.cos(a) * d; if (!free(cx, cz, 0.45)) continue; occ.push([cx, cz, 0.45]); const M = M4c(cx, pierGY(cx, cz), cz, Math.PI + R.n(0.6)); CH[R.i(0, PCOL.length - 1)].push(M); CHF.push(M); }
    for (let c = R.i(0, 2); c > 0; c--) { const yaw = R.r(0, TAU), d = R.r(1.6, 2.6), a = R.r(0, TAU), bx = x + Math.cos(a) * d, bz = z + Math.sin(a) * d, tx = bx - 0.65 * Math.cos(yaw), tz = bz + 0.65 * Math.sin(yaw); if (!free(tx, tz, 1.0)) continue; occ.push([tx, tz, 1.0]);
      TW.push(M4c(tx, pierGY(tx, tz) + 0.012, tz, yaw, 1.9, 0.02, 0.95)); TWC.push(pierHSL(R.r(0, 360), R.r(50, 80), R.r(45, 65))); if (R.f() < 0.8) CL.push({ x: bx, z: bz, yaw, m: 2, ph: R.r(0, 6) }); }
    for (let c = R.i(0, 2); c > 0; c--) { const a = R.r(0, TAU), d = R.r(1.4, 3), px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (!free(px, pz, 0.35)) continue; occ.push([px, pz, 0.35]); CL.push({ x: px, z: pz, yaw: R.r(0, TAU), m: 0, ph: R.r(0, 6) }); } }
  // loose deckchair rows near the top of the beach (deckchair hire)
  for (let x = -260; x < 260; x += R.r(14, 30)) { const z = R.r(44, 50); for (let k = 0; k < R.i(3, 7); k++) { const cx = x + k * 0.8; if (!free(cx, z, 0.4)) continue; occ.push([cx, z, 0.4]); const M = M4c(cx, pierGY(cx, z), z, Math.PI + R.n(0.15)); CH[R.i(0, PCOL.length - 1)].push(M); CHF.push(M); } }
  // more towels with sunbathers, standing people, strollers along the water and swimmers
  for (let n = 0; n < 70; n++) { const s = spot(1.0, 5, 45); if (!s) continue; const yaw = R.r(0, TAU), [tx, tz] = s; TW.push(M4c(tx, pierGY(tx, tz) + 0.012, tz, yaw, 1.9, 0.02, 0.95)); TWC.push(pierHSL(R.r(0, 360), R.r(50, 80), R.r(45, 65))); if (R.f() < 0.85) CL.push({ x: tx + 0.65 * Math.cos(yaw), z: tz - 0.65 * Math.sin(yaw), yaw, m: 2, ph: R.r(0, 6) }); }
  for (let n = 0; n < 420; n++) { const s = spot(0.35, 1, 52, 120); if (s) CL.push({ x: s[0], z: s[1], yaw: R.r(0, TAU), m: 0, ph: R.r(0, 6), arms: R.f() < 0.06 }); }
  for (let n = 0; n < 70; n++) { const s = spot(0.4, 0.5, 4, 180); if (s) CL.push({ x: s[0], z: s[1], yaw: R.f() < 0.5 ? Math.PI / 2 : -Math.PI / 2, m: 1, ph: R.r(0, 6), amp: R.r(2, 6), w: R.r(0.08, 0.16) }); }
  for (let n = 0; n < 70; n++) { const s = spot(0.4, -9, -0.6, 150); if (s) CL.push({ x: s[0], z: s[1], yaw: R.r(0, TAU), m: 3, ph: R.r(0, 6), arms: R.f() < 0.2 }); }
  CL.forEach((c) => (c.y = c.m === 3 ? pierBedY(c.z) : pierGY(c.x, c.z)));
  S.cl = CL; S.crowd = makeCrowd(CL.length, { seed: 41, kids: 0.15 }); sc.add(S.crowd.grp);
  // parasols, deckchairs, towels
  const cone = new THREE.ConeGeometry(1.2, 0.45, 8, 1, true).translate(0, 2.15, 0), poleG = pierMerge([[new THREE.CylinderGeometry(0.022, 0.022, 2.3, 6), Tr(0, 1.15, 0)], [new THREE.SphereGeometry(0.04, 6, 4), Tr(0, 2.42, 0)]]);
  PCOL.forEach((c, v) => pierIM(sc, cone, STDm({ map: pierStripeTex(c, 8), side: THREE.DoubleSide, roughness: 0.7 }), PAR[v])); pierIM(sc, poleG, STDm({ color: '#e8e4dc', roughness: 0.4, metalness: 0.4 }), POLE);
  const rib = (() => { const pos = [], uv = [], idx = [], A = [0.98, -0.45], B = [0.02, 0.02], C = [0.44, 0.44]; for (let i = 0; i <= 10; i++) { const u = i / 10, a = (1 - u) ** 2, b = 2 * u * (1 - u), c = u * u, y = a * A[0] + b * B[0] + c * C[0], z = a * A[1] + b * B[1] + c * C[1]; pos.push(-0.27, y, z, 0.27, y, z); uv.push(0, u, 1, u); if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); } }
    const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); gg.setIndex(idx); gg.computeVertexNormals(); return gg; })();
  const fr = []; [-1, 1].forEach((s) => { fr.push([PIER_BOX, pierBeam(s * 0.3, 0, -0.68, s * 0.3, 1.02, -0.45, 0.035, 0.05)], [PIER_BOX, pierBeam(s * 0.33, 0, 0.5, s * 0.33, 0.46, 0.44, 0.035, 0.05)], [PIER_BOX, pierBeam(s * 0.33, 0.46, 0.44, s * 0.33, 0.12, -0.42, 0.035, 0.05)]); });
  fr.push([PIER_BOX, M4c(0, 1.0, -0.45, 0, 0.64, 0.035, 0.035)], [PIER_BOX, M4c(0, 0.45, 0.44, 0, 0.7, 0.035, 0.035)], [PIER_BOX, M4c(0, 0.2, -0.6, 0, 0.62, 0.03, 0.03)]);
  pierIM(sc, pierMerge(fr.map(([g2, m]) => [g2, m])), STDm({ color: '#c9a274', roughness: 0.7 }), CHF);
  PCOL.forEach((c, v) => pierIM(sc, rib, STDm({ map: g3Tex((x, w, h) => { for (let i = 0; i < 6; i++) { x.fillStyle = i % 2 ? '#f6f2ea' : c; x.fillRect(i * w / 6, 0, w / 6 + 1, h); } }, 64, 16), side: THREE.DoubleSide, roughness: 0.8 }), CH[v]));
  pierIM(sc, PIER_BOX, STDm({ roughness: 0.95 }), TW, TWC, false);
  // lifeguard hut on stilts with its flags
  { const g2 = new THREE.Group(), gy = pierGY(-40, 18); g2.position.set(-40, gy, 18); g2.rotation.y = 0.15; sc.add(g2); const wdm = STDm({ color: '#7a6450' }), red = STDm({ color: '#d63a2a', roughness: 0.6 }), yel = STDm({ color: '#f2c230', roughness: 0.6 }), wh = STDm({ color: '#f4f1ea' });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g2.add(mesh(new THREE.BoxGeometry(0.16, 2.3, 0.16), wdm, a * 1.0, 1.15, b * 1.0))); g2.add(mesh(new THREE.BoxGeometry(2.8, 0.15, 2.8), wdm, 0, 2.3, 0));
    g2.add(mesh(new THREE.BoxGeometry(2.3, 2.0, 2.2), red, 0, 3.4, 0)); g2.add(mesh(new THREE.BoxGeometry(2.34, 0.4, 2.24), yel, 0, 3.2, 0)); g2.add(mesh(new THREE.BoxGeometry(1.4, 0.7, 0.05), STDm({ color: '#1c2a32', roughness: 0.15 }), 0, 3.9, -1.11)); g2.add(mesh(new THREE.BoxGeometry(2.7, 0.15, 2.6), wh, 0, 4.47, 0));
    for (let k = 0; k < 7; k++) g2.add(mesh(new THREE.BoxGeometry(0.6, 0.05, 0.08), wdm, 0, 0.25 + k * 0.32, -1.5 - k * 0.05));
    g2.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 3, 6), wh, 1.1, 5.9, 1.0)); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), STDm({ map: g3Tex((x, w, h) => { x.fillStyle = '#d63a2a'; x.fillRect(0, 0, w, h / 2); x.fillStyle = '#f2c230'; x.fillRect(0, h / 2, w, h / 2); }, 32, 32), side: THREE.DoubleSide })); fl.position.set(1.55, 7.1, 1.0); g2.add(fl); S.flag = fl; }
  // a few fishing boats pulled up on the shingle
  { const hullG = new THREE.CylinderGeometry(1, 0.6, 1, 10, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2); [[-128, 34, 0.4, '#2e5aa8'], [-136, 38, -0.3, '#c8372d'], [-120, 41, 0.1, '#2a7a4e']].forEach(([x, z, ry, c]) => { const b = mesh(hullG, STDm({ color: c, roughness: 0.6, side: THREE.DoubleSide }), x, pierGY(x, z) + 0.95, z, { ry, s: [1.2, 1.0, 3.2] }); b.rotation.z = Math.PI; sc.add(b); occ.push([x, z, 3]); }); } }

// ---- promenade, road, beach huts, the town and the Downs
function pierTown(st, S) { const R = RNG('town'), sc = st.scene;
  // promenade paving, sea wall, road, pavement
  const pav = wrap(g3Tex((x, w) => { const Rr = RNG('pav'); x.fillStyle = '#b9b2a6'; x.fillRect(0, 0, w, w); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const l = Rr.r(-10, 10); x.fillStyle = `rgb(${(196 + l) | 0},${(190 + l) | 0},${(180 + l) | 0})`; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); } speck(x, w, w, 1500, ['rgba(0,0,0,0.08)', 'rgba(255,255,255,0.1)'], Rr, 1, 2); }, 256, 256), 800, 21);
  sc.add(mesh(new THREE.PlaneGeometry(1600, 42).rotateX(-Math.PI / 2), STDm({ map: pav, roughness: 0.9 }), 0, 1.6, 81, { cast: false }));
  sc.add(mesh(new THREE.PlaneGeometry(1600, 15).rotateX(-Math.PI / 2), STDm({ map: wrap(g3Tex((x, w, h) => { x.fillStyle = '#4a4a4e'; x.fillRect(0, 0, w, h); speck(x, w, h, 1500, ['#3e3e42', '#58585c'], RNG('asph'), 1, 2); x.fillStyle = '#f0ece0'; x.fillRect(0, h / 2 - 2, w / 2, 4); x.fillStyle = '#e8c838'; x.fillRect(0, 6, w, 3); x.fillRect(0, h - 9, w, 3); }, 128, 128), 200, 1), roughness: 0.85 }), 0, 1.615, 87.5, { cast: false }));
  [80, 95].forEach((z) => sc.add(mesh(new THREE.BoxGeometry(1600, 0.16, 0.3), STDm({ color: '#a8a296' }), 0, 1.66, z)));
  const wallM = STDm({ color: '#c4bba9', roughness: 0.9 }); sc.add(mesh(new THREE.BoxGeometry(1600, 2.2, 1.0), wallM, 0, 0.5, 60.3)); sc.add(mesh(new THREE.BoxGeometry(1600, 0.2, 1.3), STDm({ color: '#d8d0c0' }), 0, 1.7, 60.3));
  // seafront railing (Brighton turquoise) and lamps on the promenade and the road
  const LP = []; for (let x = -690; x <= 690; x += 30) if (Math.abs(x) > 12) LP.push([x, 61.3, 0, 1.6]); for (let x = -680; x <= 680; x += 40) LP.push([x + 15, 96.2, 0, 1.6]);
  pierRail(sc, [[-800, 60.75, -8.5, 60.75], [8.5, 60.75, 800, 60.75]], 1.8, STDm({ color: '#4aa6a2', roughness: 0.45, metalness: 0.25 }), { h: 1.0, bs: 0.18, ps: 2.6, tw: 0.1, skip: LP.filter((l) => l[1] < 62).map(([x]) => [x, 60.75]) });
  // beach huts along the top of the beach (west and east of the pier)
  { const HB = [], HR = [], HD = [], HF = [], HC = [], DC = [], PAL = ['#e84a4a', '#3a8ae8', '#f2c230', '#3ab07a', '#f08ac0', '#ff8a3a', '#8a5ad8', '#3ac8d8', '#f4f1ea', '#a8e070'];
    [[-560, -95], [110, 560]].forEach(([a, b]) => { for (let x = a; x < b; x += 1.95) { if (R.f() < 0.04) { x += 3; continue; } const c = lin(R.pick(PAL)); HB.push(M4c(x, 1.6 + 1.0, 63.6, 0, 1.6, 2.0, 1.8)); HC.push(c); HR.push(M4c(x, 1.6 + 2.0 + 0.2, 63.6, 0, 2.1, 0.8, 2.0)); HF.push(M4c(x, 1.6 + 0.95, 62.69, 0, 1.0, 1.75, 0.04)); HD.push(M4c(x, 1.6 + 0.9, 62.66, 0, 0.86, 1.6, 0.04)); DC.push(R.f() < 0.5 ? lin('#f4f1ea') : c.clone().multiplyScalar(0.75)); } });
    pierIM(sc, PIER_BOX, STDm({ roughness: 0.7 }), HB, HC); pierIM(sc, new THREE.CylinderGeometry(0.5, 0.5, 1, 3).rotateX(-Math.PI / 2), STDm({ color: '#f4f1ea', roughness: 0.6 }), HR); pierIM(sc, PIER_BOX, STDm({ color: '#f4f1ea', roughness: 0.6 }), HF); pierIM(sc, PIER_BOX, STDm({ roughness: 0.6 }), HD, DC); }
  // the seafront: Regency terraces with bow fronts and balconies, hotels, pastel houses with shopfronts
  S.winMats = [];
  const STY = [{ wall: '#efe6d2', f: 4, b: 10, w: 30, bow: true, o: { noShut: true, lit: 0.25 } }, { wall: '#f5f2ec', f: 5, b: 10, w: 30, balc: true, o: { noShut: true, balc: true, lit: 0.25 } }, { wall: '#eedfb8', f: 4, b: 10, w: 30, bow: true, o: { noShut: true, lit: 0.25 } },
    { wall: '#f7f4ef', f: 8, b: 13, w: 42, balc: true, o: { arcade: true, noShut: true, balc: true, lit: 0.3 } }, { wall: '#b4583e', f: 7, b: 11, w: 34, o: { noShut: true, lit: 0.3 } }, { wall: '#e9e2d6', f: 6, b: 10, w: 30, balc: true, o: { noShut: true, balc: true } },
    { wall: '#a9c9dc', f: 3, b: 3, w: 9, o: {} }, { wall: '#eab8b2', f: 3, b: 3, w: 9, o: {} }, { wall: '#bfe0c8', f: 3, b: 3, w: 9, o: {} }, { wall: '#f2dc94', f: 3, b: 3, w: 9, o: {} }, { wall: '#cdbfe0', f: 4, b: 3, w: 9, o: {} }];
  STY.forEach((s, i) => { const F = facadeTex(60 + i, s.wall, s.f, s.b, 4.4, 3.4, s.w, s.o); s.h = F.h; s.front = STDm({ map: F.map, emissiveMap: F.em, emissive: '#ffffff', emissiveIntensity: 0, roughness: 0.85 }); s.side = STDm({ color: s.wall, roughness: 0.9 }); s.FM = []; s.BM = []; S.winMats.push(s.front); });
  const zf = 102, d = 16, CO = [], COC = [], RF = [], RFC = [], CH = [], BOW = [], BAL = [], SLAB = [], CAN = [], CP = [];
  let x = -720, run = 0; while (x < 720) { let si; if (x > 230) si = 6 + R.i(0, 4); else if (Math.abs(x + 160) < 25) si = 3; else if (Math.abs(x + 240) < 20 || Math.abs(x - 160) < 20) si = 4; else si = R.pick([0, 0, 1, 1, 2, 5]);
    const s = STY[si], h = s.h, cx = x + s.w / 2; s.FM.push(M4c(cx, 1.6, zf - 0.02, Math.PI)); s.BM.push(M4c(cx, 1.6, zf + d / 2 + 0.25, 0));   // body set 0.27 m behind the facade plane: no z-fighting at 200 m
    CO.push(M4c(cx, 1.6 + h - 0.15, zf + d / 2 - 0.25, 0, s.w + 0.35, 0.5, d + 0.6)); COC.push(C3(s.wall, '#fff8ec', 0.5));
    const rh = s.w < 10 ? 3 : R.r(2.2, 3.5); RF.push(M4c(cx, 1.6 + h + rh / 2, zf + d / 2, 0, s.w / Math.SQRT2 * 1.02, rh, d / Math.SQRT2)); RFC.push(lin(R.pick(['#5d646c', '#545a62', '#6a6e74', s.w < 10 ? '#9a5040' : '#5d646c'])));
    for (let k = 0; k < (s.w < 10 ? 1 : 3); k++) CH.push(M4c(cx - s.w / 2 + (k + 0.5) * s.w / (s.w < 10 ? 1 : 3) + R.n(1), 1.6 + h + rh * 0.4, zf + d / 2 + R.n(3), 0, 0.9, rh + 1.6, 0.6));
    if (s.bow) [-9, 0, 9].forEach((bx) => BOW.push(M4c(cx + bx, 1.6 + 4.4, zf, Math.PI)));
    if (s.balc) { const by = 1.6 + 4.4; SLAB.push(M4c(cx, by + 0.06, zf - 0.5, 0, s.w - 0.4, 0.14, 1.0)); BAL.push(M4c(cx, by + 0.58, zf - 0.98, Math.PI, s.w - 0.4, 0.9, 1)); CAN.push(M4c(cx, by + 3.0, zf - 0.6, Math.PI, s.w - 0.2, 0.07, 1.4, 0.35)); for (let px = -s.w / 2 + 1; px <= s.w / 2 - 1; px += 3.2) CP.push(M4c(cx + px, by + 1.45, zf - 1.15, 0, 0.06, 2.8, 0.06)); }
    x += s.w; run++; if (run >= R.i(2, 4) || (si >= 6 && R.f() < 0.15)) { x += R.r(9, 13); run = 0; } }
  STY.forEach((s) => { if (!s.FM.length) return; pierIM(sc, new THREE.PlaneGeometry(s.w, s.h).translate(0, s.h / 2, 0), s.front, s.FM, null, false); pierIM(sc, new THREE.BoxGeometry(s.w, s.h, d - 0.5).translate(0, s.h / 2, 0), s.side, s.BM, null, false); });
  pierIM(sc, PIER_BOX, STDm({ roughness: 0.8 }), CO, COC, false); pierIM(sc, new THREE.CylinderGeometry(0.01, 1, 1, 4, 1).rotateY(Math.PI / 4), STDm({ roughness: 0.85 }), RF, RFC, false); pierIM(sc, PIER_BOX, STDm({ color: '#c9b8a0', roughness: 0.9 }), CH, null, false);
  { const bt = g3Tex((x2, w, h) => { x2.fillStyle = '#efe6d2'; x2.fillRect(0, 0, w, h); for (let f = 0; f < 4; f++) { const y0 = h - (f + 1) * h / 4; x2.fillStyle = 'rgba(255,248,232,0.7)'; x2.fillRect(0, y0 + h / 4 - 6, w, 5); for (let k = 0; k < 3; k++) { const cx2 = (k + 0.5) * w / 3, ww = w / 3 * 0.5, g = x2.createLinearGradient(0, y0 + 14, 0, y0 + h / 4 - 14); g.addColorStop(0, '#6a7890'); g.addColorStop(1, '#1c2230'); x2.fillStyle = '#f6f0e2'; x2.fillRect(cx2 - ww / 2 - 4, y0 + 10, ww + 8, h / 4 - 20); x2.fillStyle = g; x2.fillRect(cx2 - ww / 2, y0 + 14, ww, h / 4 - 28); x2.fillStyle = 'rgba(240,240,255,0.5)'; x2.fillRect(cx2 - 1, y0 + 14, 2, h / 4 - 28); } } }, 128, 512);
    const hb = 4 * 3.4 - 0.2, bg = pierMerge([[new THREE.CylinderGeometry(1.45, 1.45, hb, 14, 1, true, -Math.PI / 2, Math.PI), Tr(0, hb / 2, 0)], [new THREE.CircleGeometry(1.45, 14, 0, Math.PI).rotateX(Math.PI / 2), null], [new THREE.CircleGeometry(1.45, 14, Math.PI, Math.PI).rotateX(-Math.PI / 2), Tr(0, hb, 0)]]); bg.scale(1, 1, 0.68);
    pierIM(sc, bg, STDm({ map: bt, roughness: 0.85, side: THREE.DoubleSide }), BOW, null, false); }
  pierIM(sc, PIER_BOX, STDm({ color: '#f2ece0', roughness: 0.8 }), SLAB, null, false); pierIM(sc, PIER_BOX, STDm({ color: '#4d5f5c', roughness: 0.6 }), CAN, null, false); pierIM(sc, PIER_BOX, STDm({ color: '#1e2422', roughness: 0.5 }), CP, null, false);
  pierIM(sc, new THREE.PlaneGeometry(1, 1), STDm({ color: '#141818', roughness: 0.5, side: THREE.DoubleSide, alphaTest: 0.5, alphaMap: wrap(g3Tex((x2, w, h) => { x2.fillStyle = '#000'; x2.fillRect(0, 0, w, h); x2.fillStyle = '#fff'; x2.fillRect(0, 0, w, 6); x2.fillRect(0, h - 5, w, 5); for (let i = 0; i < w; i += 8) x2.fillRect(i, 0, 2, h); for (let i = 4; i < w; i += 16) { x2.beginPath(); x2.arc(i + 4, h * 0.35, 4, 0, TAU); x2.lineWidth = 1.5; x2.strokeStyle = '#fff'; x2.stroke(); } }, 64, 64), 20, 1) }), BAL, null, false);
  // the town behind, climbing towards the Downs: rows of houses (lit-window shader), roofs, trees, a few towers
  { const HB = [], HC = [], RB = [], RC = [], TR = [], TC = [], WALL = ['#ece4d2', '#f2efe8', '#a0604a', '#b8b4ac', '#e2d4b8', '#c87a5a', '#d8dcd8', '#eadfc8'];
    for (let z = 128; z < 720; z += R.r(18, 26)) for (let x2 = -950; x2 < 950; x2 += R.r(8, 15)) { if (R.f() < 0.1) { if (R.f() < 0.6) { TR.push(M4c(x2, pierHY(x2, z) + 3, z, R.r(0, 6), R.r(3, 5), R.r(3, 5), R.r(3, 5))); TC.push(pierHSL(R.r(85, 115), R.r(30, 50), R.r(22, 34))); } continue; }
      const w = R.r(7.5, 14), h = R.r(7, 15) + (R.f() < 0.04 ? R.r(15, 45) : 0), dd = R.r(9, 14), y = pierHY(x2, z) - 1; HB.push(M4c(x2, y + h / 2, z, R.n(0.05), w, h, dd)); HC.push(lin(R.pick(WALL)));
      const rh = R.r(2, 3.5); RB.push(M4c(x2, y + h + rh / 2, z, R.n(0.05), w / Math.SQRT2 * 1.05, rh, dd / Math.SQRT2 * 1.05)); RC.push(lin(R.pick(['#7a4a3a', '#5a5e66', '#8a5a44', '#62666e', '#6e4a3e']))); }
    for (let n = 0; n < 260; n++) { const x2 = R.r(-900, 900), z = R.r(120, 1400); TR.push(M4c(x2, pierHY(x2, z) + 2.5, z, R.r(0, 6), R.r(3, 6), R.r(3, 5), R.r(3, 6))); TC.push(pierHSL(R.r(85, 115), R.r(30, 50), R.r(20, 32))); }
    [[-60, 152, 26, 100, 16], [210, 175, 22, 62, 22], [-330, 200, 30, 48, 18], [420, 240, 18, 40, 18]].forEach(([x2, z, w, h, dd]) => { HB.push(M4c(x2, pierHY(x2, z) + h / 2 - 1, z, 0, w, h, dd)); HC.push(lin('#e8e6e0')); });
    pierIM(sc, PIER_BOX, windowsMat('#ffffff'), HB, HC, false); pierIM(sc, new THREE.CylinderGeometry(0.01, 1, 1, 4, 1).rotateY(Math.PI / 4), STDm({ roughness: 0.85 }), RB, RC, false); pierIM(sc, lumpyGeo(1, 0.3, 5), STDm({ roughness: 0.95 }), TR, TC, false);
    // church spire
    sc.add(mesh(new THREE.BoxGeometry(6, 26, 6), STDm({ color: '#b8a890' }), 120, pierHY(120, 260) + 12, 260)); sc.add(mesh(new THREE.ConeGeometry(4.3, 18, 4).rotateY(Math.PI / 4), STDm({ color: '#5d646c' }), 120, pierHY(120, 260) + 34, 260)); }
  // ground behind the seafront and the South Downs
  { const g = new THREE.PlaneGeometry(3200, 3200, 160, 120).rotateX(-Math.PI / 2).translate(0, 0, 1702), p = g.attributes.position, col = [];
    for (let i = 0; i < p.count; i++) { const x2 = p.getX(i), z = p.getZ(i); p.setY(i, pierHY(x2, z) - 0.05); const urb = (1 - ss(680, 760, z)) * (1 - ss(880, 980, Math.abs(x2))), n = 0.5 + 0.5 * Math.sin(x2 * 0.011 + z * 0.007) * Math.sin(x2 * 0.004 - z * 0.013);
      const gr = [0.36 + 0.1 * n, 0.46 + 0.1 * n, 0.24 + 0.05 * n], ur = [0.5, 0.48, 0.45]; col.push(lerp(gr[0], ur[0], urb), lerp(gr[1], ur[1], urb), lerp(gr[2], ur[2], urb)); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); sc.add(mesh(g, STDm({ vertexColors: true, roughness: 1 }), 0, 0, 0, { cast: false })); }
  // the i360: a slim white tower with a glass pod that rides up and down
  { const tw = new THREE.Group(); tw.position.set(24, 1.6, 80); sc.add(tw); const wh = STDm({ color: '#eef2f4', metalness: 0.5, roughness: 0.3 });
    tw.add(mesh(new THREE.CylinderGeometry(1.9, 2.2, 162, 24).translate(0, 81, 0), wh)); for (let k = 0; k < 6; k++) tw.add(mesh(new THREE.BoxGeometry(0.12, 160, 0.25).translate(0, 80, 0), STDm({ color: '#9aa4ac', metalness: 0.6 }), Math.sin(k / 6 * TAU) * 2.05, 0, Math.cos(k / 6 * TAU) * 2.05, { ry: k / 6 * TAU }));
    tw.add(mesh(new THREE.CylinderGeometry(2.6, 2.6, 1.2, 24), wh, 0, 162, 0)); tw.add(mesh(new THREE.BoxGeometry(22, 5, 12), STDm({ color: '#c8d8e0', metalness: 0.3, roughness: 0.15, transparent: true, opacity: 0.85 }), 0, 2.5, 0)); tw.add(mesh(new THREE.BoxGeometry(22.4, 0.4, 12.4), wh, 0, 5.2, 0));
    const pod = new THREE.Group(); tw.add(pod); S.pod = pod; const ring = (r0, r1, y0, y1) => new THREE.LatheGeometry([[r0, y0], [r1, y0], [r1, y1], [r0, y1], [r0, y0]].map(([a, b]) => new THREE.Vector2(a, b)), 40);
    pod.add(mesh(ring(2.4, 9, -0.4, 0), wh)); pod.add(mesh(ring(2.4, 9, 3.3, 3.6), wh)); pod.add(mesh(new THREE.CylinderGeometry(8.9, 8.9, 3.3, 40, 1, true).translate(0, 1.65, 0), STDm({ color: '#9cc8e0', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.6, side: THREE.DoubleSide })));
    const pc = makeCrowd(14, { seed: 360 }); pod.add(pc.grp); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; pc.set(i, Math.cos(a) * 7.6, 0, Math.sin(a) * 7.6, -a + Math.PI / 2, 1); } pc.done(); }
  // cars along King's Road
  { S.cars = []; for (let k = 0; k < 46; k++) { const dir = k % 2 ? 1 : -1; S.cars.push({ x0: R.r(-650, 650), v: dir * R.r(7, 11), z: dir > 0 ? 91.3 : 84, c: lin(R.pick(['#c8202a', '#f2f2f2', '#1e1e22', '#2e5aa8', '#8a8e94', '#f0c33c', '#2a6a4e', '#d8d4cc'])) }); }
    const body = pierMerge([[new THREE.BoxGeometry(4.3, 0.75, 1.8), Tr(0, 0.62, 0)]]), cab = pierMerge([[new THREE.BoxGeometry(2.3, 0.62, 1.62), Tr(-0.2, 1.3, 0)]]), wh = pierMerge([[-1.35, 1.35].map((wx) => [new THREE.CylinderGeometry(0.34, 0.34, 1.86, 10).rotateX(Math.PI / 2), Tr(wx, 0.34, 0)])].flat());
    const n = S.cars.length, I0 = Array.from({ length: n }, () => M4()); S.carIM = [pierIM(sc, body, STDm({ roughness: 0.35, metalness: 0.4 }), I0, S.cars.map((c) => c.c)), pierIM(sc, cab, STDm({ color: '#1a2630', roughness: 0.1, metalness: 0.5 }), I0), pierIM(sc, wh, STDm({ color: '#141414', roughness: 0.8 }), I0)]; S.carIM.forEach((m) => m.instanceMatrix.setUsage(THREE.DynamicDrawUsage)); }
  return LP; }

// ---- the Ferris wheel on the beach: lattice rim, spokes, hub, A-frame legs, 24 hanging gondolas
function pierWheel(st, S) { const fw = new THREE.Group(); fw.position.set(48, 0.3, 28); fw.rotation.y = 0.42; st.scene.add(fw); S.wheel = fw;
  const W_ = STDm({ color: '#f2f2f0', metalness: 0.55, roughness: 0.35 }), HUB = 24.5, RO = 20, RI = 18.5, ZR = 1.4; S.wheelHub = HUB; S.wheelR = RO;
  const rim = new THREE.Group(); rim.position.y = HUB; fw.add(rim); S.rim = rim;
  [-ZR, ZR].forEach((z) => { rim.add(mesh(new THREE.TorusGeometry(RO, 0.17, 8, 140), W_, 0, 0, z)); rim.add(mesh(new THREE.TorusGeometry(RI, 0.12, 6, 140), W_, 0, 0, z)); });
  const NB = 48, Ms = [], Sp = [], P = (r, a, z) => [Math.cos(a) * r, Math.sin(a) * r, z];
  for (let k = 0; k < NB; k++) { const a = k / NB * TAU, a2 = (k + 0.5) / NB * TAU, a3 = (k + 1) / NB * TAU;
    [-ZR, ZR].forEach((z) => { Ms.push(pierBeam(...P(RO, a, z), ...P(RI, a2, z), 0.08)); Ms.push(pierBeam(...P(RI, a2, z), ...P(RO, a3, z), 0.08)); Ms.push(pierBeam(...P(RO, a, z), ...P(RI, a, z), 0.09)); });
    if (k % 2) Ms.push(pierBeam(...P(RI, a, -ZR), ...P(RI, a, ZR), 0.09)); else Ms.push(pierBeam(...P(RO, a, -ZR - 0.15), ...P(RO, a, ZR + 0.15), 0.12)); }
  for (let k = 0; k < 24; k++) { const a = (k + 0.5) / 24 * TAU; [-1, 1].forEach((s) => { Sp.push(pierBeam(...P(1.3, a, s * 2.6), ...P(RI, a, s * ZR), 0.05)); Sp.push(pierBeam(...P(1.3, a + 0.1, s * 2.6), ...P(RI, a + 0.13, s * ZR * 0.9), 0.035)); }); }
  pierIM(rim, PIER_TUBE, W_, Ms); pierIM(rim, PIER_TUBE, W_, Sp);
  rim.add(mesh(new THREE.CylinderGeometry(1.15, 1.15, 5.6, 18).rotateX(Math.PI / 2), W_)); [-2.6, 2.6].forEach((z) => rim.add(mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.22, 24).rotateX(Math.PI / 2), W_, 0, 0, z)));
  // light bulbs along the rim (for the night)
  { const B = []; for (let k = 0; k < 192; k++) { const a = k / 192 * TAU; [-ZR, ZR].forEach((z) => B.push(M4c(Math.cos(a) * (RO + 0.2), Math.sin(a) * (RO + 0.2), z * 1.06))); } S.wheelBulbMat = STDm({ color: '#fff4dc', emissive: '#ffd890', emissiveIntensity: 0.15 }); pierIM(rim, new THREE.SphereGeometry(0.09, 6, 4), S.wheelBulbMat, B, null, false); }
  // static frame: axle, A-frame legs, rear stays, base platform, ticket booth
  fw.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 9.4, 14).rotateX(Math.PI / 2), STDm({ color: '#c8ccd0', metalness: 0.7, roughness: 0.3 }), 0, HUB, 0));
  const L = []; [-1, 1].forEach((s) => { const zb = s * 4.4; [-1, 1].forEach((a) => L.push(pierBeam(a * 10.5, 1.6, s * 6.2, 0, HUB, zb, 0.75))); L.push(pierBeam(-6.9, 9, s * 5.6, 6.9, 9, s * 5.6, 0.4)); L.push(pierBeam(-3.4, 16.6, s * 5.0, 3.4, 16.6, s * 5.0, 0.35)); L.push(pierBeam(-6.9, 9, s * 5.6, 3.4, 16.6, s * 5.0, 0.25)); L.push(pierBeam(6.9, 9, s * 5.6, -3.4, 16.6, s * 5.0, 0.25)); L.push(pierBeam(0, 1.6, s * 10.5, 0, HUB - 1.2, s * 4.6, 0.45)); });
  pierIM(fw, new THREE.CylinderGeometry(0.42, 0.55, 1, 12), W_, L);
  fw.add(mesh(new THREE.BoxGeometry(26, 2.1, 17), STDm({ color: '#a8a296', roughness: 0.9 }), 0, 0.55, 0)); fw.add(mesh(new THREE.BoxGeometry(26.2, 0.12, 17.2), STDm({ map: wrap(pierPlankTex(2), 1, 60), color: '#9a7458', roughness: 0.8 }), 0, 1.62, 0));
  pierRail(fw, [[-13, -8.5, 13, -8.5], [13, -8.5, 13, 8.5], [13, 8.5, -13, 8.5], [-13, 8.5, -13, -8.5]], 1.66, STDm({ color: '#f2f2f0', metalness: 0.4, roughness: 0.4 }), { h: 1.0, bs: 0.25 });
  pierKiosk(fw, -10.5, 1.66, 6, 1.0, '#2e5aa8', '#f6f2ea'); sign(fw, ['BRIGHTON WHEEL'], 0, 4.2, -8.7, 7, 0.9, { bg: '#2e5aa8', fg: '#ffffff', glow: 0.2, ry: Math.PI });
  fw.add(mesh(new THREE.BoxGeometry(7, 0.12, 0.12), W_, 0, 3.7, -8.65)); [-3.5, 3.5].forEach((px) => fw.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.1, 6), W_, px, 2.7, -8.65)));
  // gondolas: enclosed pods hanging from axles on the outer rim
  const trim = pierMerge([[new THREE.BoxGeometry(0.08, 0.6, 0.08), Tr(0, -0.3, 0.55)], [new THREE.BoxGeometry(0.08, 0.6, 0.08), Tr(0, -0.3, -0.55)], [new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6).rotateX(Math.PI / 2), null], [new THREE.CylinderGeometry(0.62, 0.95, 0.3, 8), Tr(0, -0.72, 0)], [new THREE.CylinderGeometry(0.96, 0.96, 0.1, 8), Tr(0, -1.82, 0)]]);
  const glass = new THREE.CylinderGeometry(0.93, 0.93, 0.95, 8).translate(0, -1.33, 0), body = pierMerge([[new THREE.CylinderGeometry(0.96, 0.78, 0.75, 8), Tr(0, -2.25, 0)], [new THREE.CylinderGeometry(0.5, 0.5, 0.12, 8), Tr(0, -2.66, 0)]]);
  const gm = STDm({ color: '#2a4a66', roughness: 0.08, metalness: 0.5 }), tm = STDm({ color: '#f4f4f2', roughness: 0.4, metalness: 0.3 }), CC = ['#e83a3a', '#2f6fd1', '#f0c030', '#3ab05a', '#ef8a3a', '#7b4fc9', '#e86fa8', '#2a9d8f'];
  S.cabs = []; for (let k = 0; k < 24; k++) { const c = new THREE.Group(); c.add(mesh(trim, tm)); c.add(mesh(glass, gm)); c.add(mesh(body, STDm({ color: CC[k % CC.length], roughness: 0.45, metalness: 0.2 }))); fw.add(c); S.cabs.push(c); } }

// ---- people on the pier: walkers ahead of the camera, people at the railings, on benches; a distant pier crowd
function pierPeople(st, S) { const R = RNG('pierppl'), sc = st.scene, D = PIER.DECK, add = (p) => (sc.add(p.root), p);
  const sum = (o) => Object.assign({ sleeve: 'short', seed: R.i(1, 900) }, o);
  // walkers: [x, distance ahead of z = -60 at t = 0, speed, dir (-1 = south, away from the camera)]
  S.walkD = [[-1.5, 9, 0.92, -1], [1.7, 13, 0.97, -1], [-0.3, 21, 1.12, -1], [2.7, 28, 1.05, -1], [-3.0, 38, 1.0, -1], [0.9, 50, 1.1, -1], [-3.4, 82, 1.15, 1], [3.5, 96, 1.05, 1], [-2.2, 120, 1.0, 1]].map(([x, d, v, dir]) => ({ x, z0: -60 - d, v, dir }));
  S.walk = S.walkD.map((d, i) => add(i % 2 ? woman(R, sum({ top: ['#f0c33c', '#e86fa8', '#2a9d8f', '#f4f1ea'][i % 4], skirt: i === 3 ? '#2e5aa8' : undefined })) : man(R, sum({ shorts: i % 4 === 0, top: ['#d94848', '#2f6fd1', '#f4f1ea', '#3a8a5a', '#1f2d3d'][i % 5] }))));
  // people leaning on the railings (looking out to sea) — none near the camera spots on the +x side (z -52..-92)
  S.leanD = [[1, -44], [1, -46.6], [1, -104], [-1, -70], [-1, -78.5], [-1, -97], [1, -134], [-1, -150]].map(([s, z]) => ({ s, z, x: s * (PIER.RAILX - 0.36) }));
  S.lean = S.leanD.map((d, i) => add(i % 3 === 1 ? man(R, sum({})) : woman(R, sum({ hairStyle: R.pick(['long', 'pony', 'bun']) }))));
  // people on the benches on the -x side
  S.sitD = [[-62.5, 0.35], [-62.5, -0.4], [-87.5, 0.1]].map(([z, o]) => ({ x: -4.28, z: z + o }));
  S.sit = S.sitD.map((d, i) => add(i % 2 ? woman(R, sum({})) : man(R, sum({ top: '#7a5a3a' }))));
  // distant crowd along the deck and at the head
  const L = []; for (let n = 0; n < 110; n++) { const far = R.f() < 0.4, z = far ? R.r(-410, -305) : R.r(-300, -160), x = far ? R.r(-20, 20) : R.r(-4.3, 4.3); if (far && Math.abs(x) < 17 && z < -340 && z > -396) continue; L.push({ x, y: D, z, yaw: R.f() < 0.5 ? 0 : Math.PI, ph: R.r(0, 6), w: R.f() < 0.6 }); }
  S.pcl = L; S.pc = makeCrowd(L.length, { seed: 77, kids: 0.12 }); sc.add(S.pc.grp);
  // promenade crowd walking along the seafront
  const P = []; for (let n = 0; n < 240; n++) { const pav = R.f() < 0.3, dir = R.f() < 0.5 ? 1 : -1; P.push({ x0: R.r(-600, 600), z: pav ? R.r(96.8, 101) : R.r(65, 79), v: dir * R.r(0.9, 1.4), ph: R.r(0, 6) }); }
  S.prl = P; S.prom = makeCrowd(P.length, { seed: 99 }); sc.add(S.prom.grp); }

// ---- seagulls
function pierGulls(st, S) { const R = RNG('gulls'), wm = STDm({ color: '#e8eaec', roughness: 0.7 }), gm = STDm({ color: '#9aa2aa', roughness: 0.7 }), bk = STDm({ color: '#1a1a1a' }), ym = STDm({ color: '#f0b030' });
  const bodyG = pierMerge([[new THREE.CapsuleGeometry(0.085, 0.3, 4, 8).rotateX(Math.PI / 2), null], [new THREE.SphereGeometry(0.075, 8, 6), Tr(0, 0.05, 0.25)], [new THREE.BoxGeometry(0.14, 0.02, 0.16), Tr(0, 0, -0.26)]]), wingG = pierMerge([[new THREE.BoxGeometry(0.42, 0.02, 0.2), Tr(0.21, 0, 0)], [new THREE.BoxGeometry(0.34, 0.015, 0.15), Tr(0.58, 0, -0.03)]]), tipG = new THREE.BoxGeometry(0.12, 0.016, 0.12).translate(0.8, 0, -0.05);
  S.gulls = [[10, -95, 16, 9, 0.35], [-6, -40, 19, 14, -0.25], [30, -70, 13, 12, 0.3], [20, -130, 22, 18, -0.2], [40, 15, 18, 20, 0.22], [-30, 25, 15, 16, -0.3], [60, -20, 26, 25, 0.18], [5, -200, 14, 10, 0.4], [-14, -110, 24, 7, -0.33], [70, 40, 30, 22, 0.25]].map(([cx, cz, y, r, w], i) => {
    const g = new THREE.Group(); g.add(mesh(bodyG, wm)); g.add(mesh(new THREE.ConeGeometry(0.025, 0.09, 6).rotateX(Math.PI / 2), ym, 0, 0.04, 0.35)); const wings = [-1, 1].map((s) => { const p = new THREE.Group(); p.position.set(s * 0.06, 0.03, 0.02); p.scale.x = s; p.add(mesh(wingG, gm)); p.add(mesh(tipG, bk)); g.add(p); return p; });
    g.userData = { cx, cz, y, r, w, a0: R.r(0, TAU), wings }; st.scene.add(g); return g; }); }

function buildPier(st) { const S = { st };
  const LP = pierDeck(st, S); pierFurniture(st, S); pierBeach(st, S); const LT = pierTown(st, S); pierLamps(st, S, LP.concat(LT)); pierWheel(st, S); pierPeople(st, S); pierGulls(st, S);
  return S; }

function posePier(S, t) { const D = PIER.DECK;
  // walkers stroll until 17 s, then stop and look out to sea
  S.walkD.forEach((d, i) => { const mv = t < 17, tt = Math.min(t, 17); posePerson(S.walk[i], { x: d.x, y: D, z: d.z0 + d.dir * d.v * tt, yaw: mv ? (d.dir < 0 ? Math.PI : 0) : (d.x > 0 ? Math.PI / 2 : -Math.PI / 2), walk: mv ? 1 : 0, ph: t * d.v * 5.4 + i * 1.7, headYaw: mv ? 0.25 * Math.sin(t * 0.4 + i) : 0, look: [0.2 * Math.sin(t * 0.5 + i), 0] }); });
  S.leanD.forEach((d, i) => posePerson(S.lean[i], { x: d.x, y: D, z: d.z, yaw: d.s * Math.PI / 2, lean: 0.2, armL: [0.75, 0.2, 1.15], armR: [0.75, 0.2, 1.15], headPitch: -0.05, headYaw: 0.3 * Math.sin(t * 0.25 + i * 2), legL: [0.05, 0.05], legR: [-0.12, 0.1] }));
  S.sitD.forEach((d, i) => posePerson(S.sit[i], { x: d.x, y: D + 0.02, z: d.z, yaw: Math.PI / 2, sit: 1, headYaw: 0.3 * Math.sin(t * 0.3 + i * 2), armL: [0.5, 0.15, 0.8], armR: [0.5, 0.15, 0.8] }));
  // the wheel turns slowly; gondolas hang from their axles (the tilt file may move/roll S.wheel after this)
  S.rim.rotation.z = -t * 0.06; S.cabs.forEach((c, k) => { const a = k / 24 * TAU + S.rim.rotation.z; c.position.set(Math.cos(a) * S.wheelR, S.wheelHub + Math.sin(a) * S.wheelR, 0); c.rotation.set(0, 0, 0.03 * Math.sin(t * 0.8 + k)); });
  if (S.flag) S.flag.rotation.y = 0.25 * Math.sin(t * 3.1);
  S.pod.position.y = 4 + 68 * (0.5 - 0.5 * Math.cos(t * 0.05));
  // beach crowd: standing (idle sway), strolling along the water, sunbathing, paddling
  S.cl.forEach((c, i) => { if (c.m === 2) S.crowd.set(i, c.x, c.y + 0.13, c.z, c.yaw, 1, 0, Math.PI / 2);
    else if (c.m === 1) { const u = Math.sin(t * c.w + c.ph), x = c.x + c.amp * u; S.crowd.set(i, x, pierGY(x, c.z), c.z, Math.cos(t * c.w + c.ph) > 0 ? Math.PI / 2 : -Math.PI / 2, 1, 0, 0.04 * Math.sin(t * 5 + c.ph)); }
    else S.crowd.set(i, c.x, c.y, c.z, c.yaw + 0.3 * Math.sin(t * 0.3 + c.ph), 1, c.arms ? 0.5 + 0.5 * Math.sin(t * 2 + c.ph) : 0, 0.03 * Math.sin(t * 1.3 + c.ph)); });
  S.crowd.done();
  S.pcl.forEach((c, i) => S.pc.set(i, c.x, c.y, c.z + (c.w ? 5 * Math.sin(t * 0.1 + c.ph) : 0), c.yaw, 1, 0, 0.03 * Math.sin(t * (c.w ? 6 : 1) + c.ph))); S.pc.done();
  S.prl.forEach((c, i) => { const x = mod(c.x0 + c.v * t + 600, 1200) - 600; S.prom.set(i, x, 1.6, c.z, c.v > 0 ? Math.PI / 2 : -Math.PI / 2, 1, 0, 0.04 * Math.sin(t * 6 + c.ph)); }); S.prom.done();
  // traffic
  S.cars.forEach((c, i) => { const x = mod(c.x0 + c.v * t + 650, 1300) - 650, M = M4c(x, 1.62, c.z, c.v > 0 ? 0 : Math.PI); S.carIM.forEach((m) => m.setMatrixAt(i, M)); }); S.carIM.forEach((m) => (m.instanceMatrix.needsUpdate = true));
  // gulls circle and flap
  S.gulls.forEach((g, i) => { const d = g.userData, a = d.a0 + t * d.w, vx = -Math.sin(a) * d.w, vz = Math.cos(a) * d.w; g.position.set(d.cx + Math.cos(a) * d.r, d.y + 1.2 * Math.sin(t * 0.6 + i), d.cz + Math.sin(a) * d.r);
    g.rotation.set(0, Math.atan2(vx, vz), -Math.sign(d.w) * 0.35); const glide = Math.sin(t * 0.7 + i * 1.3) > 0.2, f = glide ? 0.12 : 0.55 * Math.sin(t * 9 + i * 2); d.wings.forEach((p) => (p.rotation.z = f)); }); }

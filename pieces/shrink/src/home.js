// =====================================================================
//  HOME — a modern flat at real scale (0–16 s: room, sofa, cat, coin). Units: metres, floor y = 0.
//  Back wall z = -3.2 with a big window (late-afternoon sun comes in from behind it), the sofa against it on the left
//  with shelves, an arc lamp and a coffee table on a Berber rug; the kitchen runs along the right wall (x = 3.8) with the
//  fridge, the cat's bowls in front of it. The camera, near/far planes and the sun's shadow box are re-framed per shot so
//  the same set holds from 1.6 m down to 6 mm (fine wood grain / weave / pile are drawn in world space in the shader).
// =====================================================================
const HM_SUN = dirV(20 * DEG, 30 * DEG);
const HM_GLSL = `float hmH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hmH3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float hmN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hmH(i), hmH(i + vec2(1, 0)), f.x), mix(hmH(i + vec2(0, 1)), hmH(i + vec2(1, 1)), f.x), f.y); }
`;
const HM_FINE = {
  wood: (f) => `{ vec2 q = vec2(hWp.x * ${700 * f}.0, hWp.z * ${30 * f}.0); float k = 1.0 - smoothstep(0.35, 1.0, fwidth(q.x)); float n = hmN(q) * 0.65 + hmN(q * vec2(3.1, 2.0) + 5.0) * 0.35; diffuseColor.rgb *= mix(1.0, 0.8 + 0.34 * n, k);
    vec2 q2 = hWp.xz * ${2600 * f}.0; float k2 = 1.0 - smoothstep(0.35, 1.0, fwidth(q2.x)); diffuseColor.rgb *= mix(1.0, 0.92 + 0.14 * hmN(q2), k2); }`,
  weave: (f) => `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.xz : (n.x > n.z ? hWp.zy : hWp.xy); vec2 q = p * ${650 * f}.0; float k = 1.0 - smoothstep(0.3, 0.9, max(fwidth(q.x), fwidth(q.y)));
    float c = mod(floor(q.x) + floor(q.y), 2.0); float v = mix(sqrt(abs(sin(q.y * 3.1416))), sqrt(abs(sin(q.x * 3.1416))), c); float sl = hmN(p * ${90 * f}.0);
    diffuseColor.rgb *= mix(1.0, 0.7 + 0.34 * v + 0.12 * sl, k); diffuseColor.rgb *= 0.94 + 0.12 * hmN(p * 6.0); }`,
  pile: (f) => `{ vec2 q = hWp.xz * ${450 * f}.0; float k = 1.0 - smoothstep(0.3, 0.9, fwidth(q.x)); vec2 c = floor(q); float d = length(fract(q) - 0.5 + (vec2(hmH(c), hmH(c + 3.1)) - 0.5) * 0.45);
    diffuseColor.rgb *= mix(1.0, 0.62 + 0.5 * smoothstep(0.55, 0.05, d), k); }`,
  paint: (f) => `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.xz : (n.x > n.z ? hWp.zy : hWp.xy); diffuseColor.rgb *= 0.965 + 0.05 * hmN(p * 40.0) + 0.02 * hmN(p * 300.0); }`,
  stone: (f) => `{ vec3 n = abs(hWn); vec2 p = n.y > 0.6 ? hWp.xz : (n.x > n.z ? hWp.zy : hWp.xy); float v = hmN(p * 9.0) * 0.6 + hmN(p * 31.0) * 0.4; diffuseColor.rgb *= 0.93 + 0.08 * v - 0.12 * smoothstep(0.02, 0.0, abs(hmN(p * 4.0 + 2.0) - 0.5)); }`,
};
function hmFine(m, mode, f = 1) { m.onBeforeCompile = (sh) => {
    sh.vertexShader = 'varying vec3 hWp; varying vec3 hWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n hWp = (modelMatrix * vec4(transformed, 1.0)).xyz; hWn = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = 'varying vec3 hWp; varying vec3 hWn;\n' + HM_GLSL + sh.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n' + HM_FINE[mode](f)); };
  m.customProgramCacheKey = () => 'hm' + mode + f; return m; }
// distance covered at k body-heights per second between t0 and t while she shrinks
const hmTravel = (t0, t, k) => k * (HGT(t0) - HGT(t)) * 2 / Math.LN2;
const hmH3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function hmN3(x, y, z) { const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), u = x - X, v = y - Y, w = z - Z, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), c = w * w * (3 - 2 * w);
  const L = (i, j, k) => hmH3(X + i, Y + j, Z + k), l1 = (j, k) => lerp(L(0, j, k), L(1, j, k), a), l2 = (k) => lerp(l1(0, k), l1(1, k), b); return lerp(l2(0), l2(1), c); }
// ---- textures
function hmPlankTex() { return g3Tex((x, w, h) => { const R = RNG('plank'), cols = 8, cw = w / cols; x.fillStyle = '#2e2116'; x.fillRect(0, 0, w, h);
  for (let c = 0; c < cols; c++) { const j0 = R.r(0, h), L = R.r(0.42, 0.62) * h, hues = [R.r(29, 34), R.r(29, 34)], sats = [R.r(24, 32), R.r(24, 32)], lis = [R.r(47, 55), R.r(47, 55)];
    for (let b = 0; b < 2; b++) { const y0 = b ? j0 + L : j0, len = b ? h - L : L, hue = hues[b], sat = sats[b], li = lis[b];
      for (const off of [0, -h]) { const top = y0 + off; if (top > h || top + len < 0) continue; const RR = RNG('pl', c, b);
        x.save(); x.beginPath(); x.rect(c * cw + 1.5, top + 1.5, cw - 3, len - 3); x.clip(); x.fillStyle = `hsl(${hue},${sat}%,${li}%)`; x.fillRect(c * cw, top, cw, len);
        for (let k = 0; k < 6; k++) blot(x, c * cw + RR.r(0, cw), top + RR.r(0, len), RR.r(40, 140), RR.f() < 0.5 ? 'rgba(90,50,20,0.12)' : 'rgba(255,230,190,0.1)');
        for (let k = 0; k < 2; k++) { const cx = c * cw + RR.r(0.3, 0.7) * cw, cy = top + RR.r(0.2, 0.8) * len; for (let r = 0; r < 9; r++) { x.strokeStyle = `hsla(${hue - 5},${sat + 8}%,${li - 20}%,0.3)`; x.lineWidth = 1.4; x.beginPath(); for (let s = -20; s <= 20; s++) { const u = s / 20; x.lineTo(cx + u * (8 + r * 9), cy - (1 - u * u) * (60 + r * 30) + r * 16); } x.stroke(); } }
        for (let k = 0; k < 75; k++) { const gx = c * cw + RR.r(0, cw), dark = RR.f() < 0.7; x.strokeStyle = dark ? `hsla(${hue - 6},${sat + 10}%,${li - RR.r(12, 28)}%,${RR.r(0.15, 0.45)})` : `hsla(${hue + 4},${sat}%,${li + 12}%,${RR.r(0.15, 0.35)})`;
          x.lineWidth = RR.r(0.6, 2.2); x.beginPath(); const wob = RR.r(2, 8), ph = RR.r(0, TAU), fq = RR.r(0.5, 2.5); for (let s = 0; s <= 24; s++) x.lineTo(gx + Math.sin(ph + s / 24 * fq * TAU) * wob, top + len * s / 24); x.stroke(); }
        if (RR.f() < 0.35) { const kx = c * cw + RR.r(0.25, 0.75) * cw, ky = top + RR.r(0.1, 0.9) * len; for (let r = 7; r > 0; r--) { x.fillStyle = `hsla(${hue - 8},${sat + 10}%,${li - 8 - r * 3}%,0.35)`; x.beginPath(); x.ellipse(kx, ky, r * 2.2, r * 5, 0, 0, TAU); x.fill(); } }
        x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(c * cw, top, cw, 3); x.restore(); } } } }, 2048, 2048); }
function hmRugTex() { return g3Tex((x, w, h) => { const R = RNG('rug'); x.fillStyle = '#ece4d4'; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 40000; k++) { x.fillStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(150,130,100,0.14)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(1, 3)); }
  x.strokeStyle = '#3a3532'; x.lineCap = 'round'; const cell = 128;
  for (let d = -1; d < 2; d += 2) for (let k = -10; k < 20; k++) { x.lineWidth = R.r(5, 8); x.beginPath(); for (let s = 0; s <= 40; s++) { const yy = s / 40 * h; x.lineTo(k * cell + d * yy * 0.5 + R.n(2.5) + (d > 0 ? 0 : w * 0.5), yy); } x.stroke(); }
  x.lineWidth = 10; x.strokeRect(36, 36, w - 72, h - 72); x.lineWidth = 4; x.strokeRect(58, 58, w - 116, h - 116); }, 1024, 1024); }
function hmKnitTex() { return g3Tex((x, w, h) => { x.fillStyle = '#7a7060'; x.fillRect(0, 0, w, h); const cw = 32, ch = 26;
  for (let r = 0; r < h / ch + 1; r++) for (let c = 0; c < w / cw; c++) [-1, 1].forEach((s) => { const cx = c * cw + cw / 2 + s * 7, cy = r * ch; const g = x.createLinearGradient(cx - 8, cy, cx + 8, cy + 20); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#a89c88');
    x.fillStyle = g; x.save(); x.translate(cx, cy + 12); x.rotate(s * 0.55); x.beginPath(); x.ellipse(0, 0, 7.5, 15, 0, 0, TAU); x.fill(); x.restore(); }); }, 256, 256); }
function hmTileTex() { return g3Tex((x, w, h) => { const R = RNG('tile'); x.fillStyle = '#b8b4ac'; x.fillRect(0, 0, w, h); const tw = 128, th = 64;
  for (let r = 0; r < h / th; r++) for (let c = -1; c < w / tw + 1; c++) { const ox = c * tw + (r % 2) * tw / 2, l = R.r(92, 98); const g = x.createLinearGradient(ox, r * th, ox, r * th + th); g.addColorStop(0, `hsl(40,12%,${l}%)`); g.addColorStop(1, `hsl(40,10%,${l - 6}%)`); x.fillStyle = g; x.fillRect(ox + 3, r * th + 3, tw - 6, th - 6); } }, 512, 512); }
function hmLeafTex() { return g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const R = RNG('monst');
  x.save(); x.beginPath(); x.moveTo(w / 2, h * 0.98); x.bezierCurveTo(w * 0.02, h * 0.85, w * 0.0, h * 0.25, w * 0.42, h * 0.06); x.quadraticCurveTo(w / 2, h * 0.12, w * 0.58, h * 0.06); x.bezierCurveTo(w * 1.0, h * 0.25, w * 0.98, h * 0.85, w / 2, h * 0.98); x.closePath(); x.clip();
  const g = x.createRadialGradient(w / 2, h * 0.6, 10, w / 2, h * 0.55, w * 0.6); g.addColorStop(0, '#3f7d32'); g.addColorStop(1, '#1f4a1c'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 3000; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,255,220' : '0,30,0'},0.05)`; x.fillRect(R.r(0, w), R.r(0, h), 3, 3); }
  x.strokeStyle = 'rgba(190,220,140,0.55)'; x.lineWidth = 7; x.beginPath(); x.moveTo(w / 2, h); x.lineTo(w / 2, h * 0.1); x.stroke();
  for (let k = 0; k < 7; k++) { const y0 = h * (0.86 - k * 0.11); [-1, 1].forEach((s) => { x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, y0); x.quadraticCurveTo(w / 2 + s * w * 0.22, y0 - h * 0.08, w / 2 + s * w * 0.5, y0 - h * 0.16); x.stroke(); }); }
  x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; x.lineCap = 'round';
  for (let k = 0; k < 6; k++) { const y0 = h * (0.8 - k * 0.11) - h * 0.055; [-1, 1].forEach((s) => { x.lineWidth = R.r(9, 15); x.beginPath(); x.moveTo(w / 2 + s * w * 0.42, y0 - h * 0.12); x.quadraticCurveTo(w / 2 + s * w * 0.5, y0 - h * 0.15, w / 2 + s * w * 0.6, y0 - h * 0.16); x.stroke();
    if (k > 0 && k < 5) { x.lineWidth = R.r(8, 13); x.beginPath(); x.moveTo(w / 2 + s * w * 0.13, y0 - h * 0.02); x.lineTo(w / 2 + s * w * 0.2, y0 - h * 0.045); x.stroke(); } }); }
  x.restore(); }, 512, 512); }
function hmCoinTex(color) { return g3Tex((x, w, h) => { const c = w / 2, Ro = w * 0.5, Ri = w * 0.36;
  if (color) { const gs = x.createRadialGradient(c, c, Ri, c, c, Ro); gs.addColorStop(0, '#d9dbe0'); gs.addColorStop(1, '#b4b8c0'); x.fillStyle = gs; x.fillRect(0, 0, w, h); const gg = x.createRadialGradient(c * 0.8, c * 0.8, 10, c, c, Ri); gg.addColorStop(0, '#f0d27a'); gg.addColorStop(1, '#c49a3a'); x.fillStyle = gg; x.beginPath(); x.arc(c, c, Ri, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(80,60,20,0.5)'; x.lineWidth = 3; x.beginPath(); x.arc(c, c, Ri, 0, TAU); x.stroke(); return; }
  x.fillStyle = '#5a5a5a'; x.fillRect(0, 0, w, h); x.fillStyle = '#4a4a4a'; x.beginPath(); x.arc(c, c, Ri - 4, 0, TAU); x.fill();
  x.strokeStyle = '#ffffff'; x.lineWidth = 16; x.beginPath(); x.arc(c, c, Ro - 10, 0, TAU); x.stroke(); x.strokeStyle = '#8a8a8a'; x.lineWidth = 6; x.beginPath(); x.arc(c, c, Ri, 0, TAU); x.stroke();
  const star = (sx, sy, r) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * 0.42 : r; x.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } x.closePath(); x.fill(); };
  x.fillStyle = '#d8d8d8'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; star(c + Math.cos(a) * (Ri + (Ro - Ri) * 0.48), c + Math.sin(a) * (Ri + (Ro - Ri) * 0.48), 22); }
  const sh = (f) => { x.save(); x.shadowColor = 'rgba(255,255,255,0.9)'; x.shadowBlur = 6; f(); x.restore(); };
  x.fillStyle = '#e6e6e6'; x.textAlign = 'center'; x.textBaseline = 'middle'; sh(() => { x.font = `bold ${w * 0.3}px Georgia, serif`; x.fillText('2', c - w * 0.08, c - w * 0.02); });
  x.strokeStyle = '#cfcfcf'; x.lineWidth = 7; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(c + w * 0.3, c - w * 0.25, w * (0.12 + k * 0.035), Math.PI * 0.55, Math.PI * 0.95); x.stroke(); }
  sh(() => { x.font = `bold ${w * 0.07}px Georgia, serif`; x.fillText('EURO', c + w * 0.14, c + w * 0.12); x.font = `${w * 0.045}px Georgia, serif`; x.fillText('2026', c, c + w * 0.27); });
  for (let k = 0; k < 9; k++) { const a = Math.PI * (0.62 + k * 0.035); x.fillStyle = '#c8c8c8'; x.beginPath(); x.ellipse(c + Math.cos(a) * Ri * 0.78, c + Math.sin(a) * Ri * 0.78, 9, 18, a, 0, TAU); x.fill(); } }, 1024, 1024, !!color); }
// ---- geometry helpers
function hmPuff(geo, amt, w, d) { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0) p.setY(i, y + amt * Math.max(0, 1 - (2 * p.getX(i) / w) ** 2) * Math.max(0, 1 - (2 * p.getZ(i) / d) ** 2)); } geo.computeVertexNormals(); return geo; }
function hmPillow(w, h, d) { const g = new THREE.SphereGeometry(1, 40, 30), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), X = Math.sign(x) * Math.abs(x) ** 0.35, Y = Math.sign(y) * Math.abs(y) ** 0.35, e = Math.max(Math.abs(X), Math.abs(Y)); p.setXYZ(i, X * w / 2, Y * h / 2, z * d / 2 * (1 - 0.8 * e ** 6)); }
  g.computeVertexNormals(); return g; }
const hmLathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const hmAdd = (par, geo, mat, x = 0, y = 0, z = 0, o = {}) => { const m = mesh(geo, mat, x, y, z, o); par.add(m); return m; };
// a tube between points with a radius profile r(u)
function hmTube(pts, rad, seg = 40, rs = 10) { const cur = new THREE.CatmullRomCurve3(pts.map((a) => (a.isVector3 ? a : new THREE.Vector3(...a)))), g = new THREE.TubeGeometry(cur, seg, 1, rs, false), p = g.attributes.position;
  for (let i = 0; i <= seg; i++) { const u = i / seg, c = cur.getPointAt(u), r = typeof rad === 'function' ? rad(u) : rad; for (let j = 0; j <= rs; j++) { const k = i * (rs + 1) + j; _v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, _v.x, _v.y, _v.z); } }
  g.computeVertexNormals(); return g; }

// =====================================================================
//  the set
// =====================================================================
function home() { return once('home', () => {
  const st = inStage({ target: new THREE.Vector3(0, 0, -1), sun: HM_SUN, hemi: 0.42, sky: 0xdde8f4, ground: 0x8a6a4a, key: 2.3, keyCol: '#ffe6c4', box: 4, boxFar: 20, top: '#3f7fc8', hor: '#d6e6f4', clouds: 0.55 }), S = { st }, sc = st.scene;
  st.key.shadow.mapSize.set(4096, 4096);
  const fill = new THREE.DirectionalLight('#dfe8ff', 0.35); fill.position.set(-2, 3, 6); sc.add(fill);
  // ---- floor, rug
  const plank = wrap(hmPlankTex(), 10, 10), floorM = hmFine(STDm({ map: plank, bumpMap: plank, bumpScale: 0.0025, roughness: 0.42, envMapIntensity: 0.6 }), 'wood');
  const fl = mesh(new THREE.PlaneGeometry(12, 12).rotateX(-Math.PI / 2), floorM, 0, 0, 0, { cast: false }); sc.add(fl);
  const rugM = hmFine(STDm({ map: hmRugTex(), roughness: 1, envMapIntensity: 0.3 }), 'pile'); hmAdd(sc, new THREE.BoxGeometry(2.8, 0.008, 2.0), rugM, -1.4, 0.004, -1.35, { cast: false });
  { const R = RNG('fringe'), n = 2 * 140, fr = IM(new THREE.BoxGeometry(0.004, 0.003, 0.05).translate(0, 0, 0.025), STDm({ color: '#e8dfcc', roughness: 1 }), n, false); for (let i = 0; i < n; i++) { const s = i < 140 ? 1 : -1, k = i % 140; fr.setMatrixAt(i, M4c(-2.8 + k * 0.02 + 0.01, 0.0015, -1.35 + s * 1.0, s > 0 ? R.n(0.15) : Math.PI + R.n(0.15))); } sc.add(fr); }
  // ---- walls (the back wall is built around the window opening), skirting, window
  const wallM = hmFine(STDm({ color: '#ece6dc', roughness: 0.92, envMapIntensity: 0.4 }), 'paint'), whiteM = STDm({ color: '#f4f2ee', roughness: 0.5 }), WY0 = 0.8, WY1 = 2.35, WX0 = -0.05, WX1 = 1.65, BZ = -3.2, WH = 2.75;
  const wb = (w, h, x, y) => hmAdd(sc, new THREE.BoxGeometry(w, h, 0.18), wallM, x, y, BZ - 0.09);
  wb(WX0 + 3.6, WH, (WX0 - 3.6) / 2, WH / 2); wb(4.0 - WX1, WH, (WX1 + 4.0) / 2, WH / 2); wb(WX1 - WX0, WY0, (WX0 + WX1) / 2, WY0 / 2); wb(WX1 - WX0, WH - WY1, (WX0 + WX1) / 2, (WH + WY1) / 2);
  hmAdd(sc, new THREE.BoxGeometry(0.18, WH, 9), wallM, -3.49, WH / 2, 1.2); hmAdd(sc, new THREE.BoxGeometry(0.18, WH, 9), wallM, 3.89, WH / 2, 1.2); hmAdd(sc, new THREE.BoxGeometry(8, WH, 0.18), wallM, 0.2, WH / 2, 5.5);
  hmAdd(sc, new THREE.BoxGeometry(8, 0.2, 9.5), wallM, 0.2, WH + 0.1, 1.0, { cast: false });   // ceiling
  [[7.2, 0.0, BZ + 0.008, 0], [8.6, -3.39, 1.2, Math.PI / 2], [8.6, 3.79, 1.2, Math.PI / 2]].forEach(([L, x, z, ry]) => hmAdd(sc, new THREE.BoxGeometry(L, 0.09, 0.016), whiteM, x, 0.045, z, { ry }));
  { const fr = STDm({ color: '#f6f5f2', roughness: 0.35 }), t = 0.06, cx = (WX0 + WX1) / 2, cy = (WY0 + WY1) / 2, ww = WX1 - WX0, wh = WY1 - WY0, z = BZ - 0.06;
    [[ww, t, cx, WY0 + t / 2], [ww, t, cx, WY1 - t / 2], [t, wh, WX0 + t / 2, cy], [t, wh, WX1 - t / 2, cy], [0.045, wh, cx, cy], [ww, 0.045, cx, 1.95]].forEach(([w, h, x, y]) => hmAdd(sc, new THREE.BoxGeometry(w, h, 0.07), fr, x, y, z));
    hmAdd(sc, new THREE.BoxGeometry(ww + 0.12, 0.035, 0.24), hmFine(STDm({ color: '#d9d4cc', roughness: 0.5 }), 'stone'), cx, WY0 - 0.017, BZ + 0.03);
    const glass = new THREE.MeshStandardMaterial({ color: '#cfe0ea', roughness: 0.05, metalness: 0.0, transparent: true, opacity: 0.1, depthWrite: false }); hmAdd(sc, new THREE.PlaneGeometry(ww, wh), glass, cx, cy, z, { cast: false }).receiveShadow = false;
    // linen curtains (folds), a black rod
    const cm = STDm({ color: '#eee5d2', roughness: 0.95, side: THREE.DoubleSide, bumpMap: fabricTex(), bumpScale: 0.002 }); [[WX0 - 0.32, 0.6], [WX1 + 0.3, 0.55]].forEach(([x, w], i) => { const g = new THREE.PlaneGeometry(w, 2.5, 60, 4), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const u = p.getX(k) / w + 0.5, yy = p.getY(k); p.setZ(k, 0.035 * Math.sin(u * 22 + i) * (0.6 + 0.4 * Math.sin(u * 7)) + (i ? -1 : 1) * 0.03 * (yy / 2.5 - 0.5) * 0); }
      g.computeVertexNormals(); hmAdd(sc, g, cm, x, 1.29, BZ + 0.09); });
    hmAdd(sc, new THREE.CylinderGeometry(0.012, 0.012, 2.9, 10).rotateZ(Math.PI / 2), STDm({ color: '#222', metalness: 0.6, roughness: 0.4 }), cx, 2.56, BZ + 0.09); }
  // ---- outside: lawn, hedge, trees, the house across the street
  hmAdd(sc, new THREE.PlaneGeometry(300, 300).rotateX(-Math.PI / 2), STDm({ map: wrap(texNoise('lawn', '#5a8a3a', ['#4a7a30', '#6a9a42', '#3e6a28', '#7aa84a'], 9000), 60, 60), roughness: 1 }), 0, -0.02, -150, { cast: false });
  { const hm = STDm({ map: leafTex('hedge', '#3a6a2a'), roughness: 0.95 }); for (let k = 0; k < 9; k++) { const b = hmAdd(sc, lumpyGeo(3, 0.25, 40 + k), hm, -6 + k * 1.6, 0.6, -6.5); b.scale.set(1.1, 0.75, 0.7); } }
  tree(st, 2.6, -9.5, 1.5, 11); tree(st, -2.4, -13, 1.3, 12); tree(st, 6.5, -12, 1.2, 13);
  tree(st, -5.5, -17, 1.6, 14); tree(st, 0.5, -20, 1.8, 15); tree(st, 9, -19, 1.5, 16);
  // ---- the sofa (grey-teal, against the back wall on the left), pillows, a knitted throw over the left arm
  { const g = new THREE.Group(); g.position.set(-1.85, 0, -2.5); sc.add(g); S.sofa = g;
    const fab = hmFine(STDm({ color: '#7f9a99', roughness: 0.95, envMapIntensity: 0.4 }), 'weave'), wood = STDm({ color: '#6a4a30', roughness: 0.5 });
    hmAdd(g, roundedBox(2.3, 0.2, 0.94, 0.04, 8), fab, 0, 0.23, 0);
    [-1, 1].forEach((s) => { hmAdd(g, roundedBox(0.2, 0.52, 0.95, 0.08, 10), fab, s * 1.05, 0.38, 0); [-1, 1].forEach((t) => { const l = hmAdd(g, new THREE.CylinderGeometry(0.022, 0.014, 0.14, 12).translate(0, -0.07, 0), wood, s * 1.05, 0.14, t * 0.38); l.rotation.set(t * 0.12, 0, -s * 0.12); }); });
    hmAdd(g, roundedBox(2.3, 0.55, 0.2, 0.08, 10), fab, 0, 0.55, -0.37);
    for (let k = 0; k < 3; k++) { const x = (k - 1) * 0.635; hmAdd(g, hmPuff(roundedBox(0.625, 0.15, 0.72, 0.055, 10), 0.025, 0.625, 0.72), fab, x, 0.405, 0.08);
      const b = hmAdd(g, hmPuff(roundedBox(0.62, 0.46, 0.18, 0.08, 10).rotateX(-Math.PI / 2), 0.03, 0.62, 0.46).rotateX(Math.PI / 2), fab, x, 0.7, -0.2); b.rotation.x = -0.16; }
    [['#d8a23a', -0.55, 0.4], ['#e9e2d4', -0.42, -0.25], ['#b8563a', 0.8, -0.35]].forEach(([c, x, ry], i) => { const p = hmAdd(g, hmPillow(0.44, 0.44, 0.15), hmFine(STDm({ color: c, roughness: 0.95, bumpMap: fabricTex(), bumpScale: 0.003 }), 'weave', 1.4), x, 0.7, -0.03); p.rotation.set(-0.3, ry, i === 1 ? 0.15 : -0.1); });
    // the throw: a knitted sheet draped across the left arm
    const path = new THREE.CatmullRomCurve3([[-0.78, 0.5, 0], [-0.88, 0.54, 0], [-0.97, 0.66, 0], [-1.07, 0.69, 0], [-1.17, 0.67, 0], [-1.23, 0.6, 0], [-1.25, 0.42, 0], [-1.26, 0.2, 0]].map((a) => new THREE.Vector3(...a)));
    const NU = 70, NV = 40, pos = [], uv = [], idx = []; for (let i = 0; i <= NU; i++) { const u = i / NU, c = path.getPointAt(u), tg = path.getTangentAt(u); for (let j = 0; j <= NV; j++) { const v = j / NV, z = (v - 0.5) * 0.66 + 0.12, d = (0.006 + 0.016 * ss(0.5, 1, u)) * Math.sin(v * 26 + u * 4) + 0.01; pos.push(c.x - tg.y * d, c.y + tg.x * d, z); uv.push(v * 5, u * 6); } }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + NV + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); tg.setIndex(idx); tg.computeVertexNormals();
    const knit = wrap(hmKnitTex(), 1, 1); hmAdd(g, tg, STDm({ color: '#e6dccb', map: knit, bumpMap: knit, bumpScale: 0.01, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0); }
  // ---- shelves over the sofa: books, a vase, a photo, a trailing plant; an arc lamp
  { const oak = hmFine(STDm({ color: '#b98a5a', roughness: 0.55 }), 'wood', 0.5), R = RNG('books'), bk = [];
    [1.42, 1.82].forEach((y, si) => { hmAdd(sc, new THREE.BoxGeometry(1.5, 0.035, 0.22), oak, -1.85, y, BZ + 0.11); let x = -2.55 + si * 0.25;
      while (x < (si ? -1.6 : -1.75)) { const w = R.r(0.022, 0.045), h = R.r(0.17, 0.26), lean = x > -1.9 && si === 0 ? 0 : 0; bk.push([x + w / 2, y + 0.0175 + h / 2, BZ + 0.12, w, h, R.r(0.13, 0.17), R.pick(['#8a2f2a', '#1f3a5a', '#d8c8a0', '#2a5a48', '#c8782a', '#efe8dc', '#3a3a3a', '#7a5a8a', '#b84a3a']), lean]); x += w + R.r(0, 0.004); } });
    const bm = IM(new THREE.BoxGeometry(1, 1, 1), STDm({ roughness: 0.7 }), bk.length); bk.forEach(([x, y, z, w, h, d, c], i) => { bm.setMatrixAt(i, M4c(x, y, z, 0, w, h, d)); bm.setColorAt(i, lin(c)); }); sc.add(bm);
    const cer = STDm({ color: '#dfd6c8', roughness: 0.4 }); hmAdd(sc, hmLathe([[0.001, 0], [0.05, 0], [0.065, 0.06], [0.045, 0.15], [0.025, 0.2], [0.03, 0.22], [0.001, 0.22]]), cer, -1.4, 1.4375, BZ + 0.12);
    hmAdd(sc, new THREE.BoxGeometry(0.2, 0.25, 0.02), STDm({ color: '#2a2622', roughness: 0.4 }), -1.25, 1.96, BZ + 0.05).rotation.x = -0.08;
    hmAdd(sc, new THREE.PlaneGeometry(0.16, 0.21), STDm({ map: g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ab8d8'); g.addColorStop(0.55, '#f0d8b0'); g.addColorStop(0.56, '#4a7a52'); g.addColorStop(1, '#2a4a32'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = '#f4e8c8'; x.beginPath(); x.arc(w * 0.7, h * 0.3, 10, 0, TAU); x.fill(); }, 64, 96), roughness: 0.3 }), -1.25, 1.96, BZ + 0.062).rotation.x = -0.08;
    const pot = STDm({ color: '#c8704a', roughness: 0.8 }); hmAdd(sc, hmLathe([[0.001, 0], [0.05, 0], [0.065, 0.11], [0.001, 0.11]]), pot, -2.45, 1.8375, BZ + 0.12);
    const ivy = STDm({ color: '#4a8a3a', roughness: 0.7, side: THREE.DoubleSide }), lg = new THREE.CircleGeometry(0.02, 8).scale(0.8, 1, 1), Rv = RNG('ivy'), L = []; for (let s = 0; s < 6; s++) { let x = -2.45 + Rv.n(0.05), y = 1.94, z = BZ + 0.14 + Rv.r(0, 0.06); const n = Rv.i(8, 16); for (let k = 0; k < n; k++) { L.push(M4c(x + Rv.n(0.02), y, z + 0.02, Rv.r(0, TAU), 1, 1, 1, Rv.r(-0.6, 0.6))); y -= 0.035; x += Rv.n(0.015); z += 0.004; } }
    const iv = IM(lg, ivy, L.length); L.forEach((m, i) => iv.setMatrixAt(i, m)); sc.add(iv);
    // arc lamp: marble base, a steel arc over the sofa, a dome shade with a warm bulb
    const steel = STDm({ color: '#c8c8c8', metalness: 0.9, roughness: 0.25 }); hmAdd(sc, new THREE.CylinderGeometry(0.16, 0.17, 0.08, 32), hmFine(STDm({ color: '#f2f0ec', roughness: 0.25 }), 'stone'), -3.15, 0.04, -2.9);
    hmAdd(sc, hmTube([[-3.15, 0.05, -2.9], [-3.15, 1.2, -2.9], [-3.0, 1.95, -2.75], [-2.55, 2.15, -2.45], [-2.2, 2.0, -2.2], [-2.12, 1.86, -2.12]], 0.012, 60, 8), steel);
    hmAdd(sc, new THREE.SphereGeometry(0.2, 32, 12, 0, TAU, 0, Math.PI / 2), STDm({ color: '#1e1e1e', roughness: 0.4, metalness: 0.5, side: THREE.DoubleSide }), -2.12, 1.7, -2.12);
    hmAdd(sc, new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: '#fff0d0' }), -2.12, 1.69, -2.12, { cast: false });
    const pl = new THREE.PointLight('#ffcb88', 0.9, 4.5, 2); pl.position.set(-2.12, 1.6, -2.12); sc.add(pl); }
  // ---- the coffee table: round oak, splayed legs; books, a mug, a candle jar
  { const g = new THREE.Group(); g.position.set(-2.3, 0, -1.2); sc.add(g); const oak = hmFine(STDm({ color: '#c09366', roughness: 0.45 }), 'wood', 0.6);
    hmAdd(g, new THREE.CylinderGeometry(0.42, 0.42, 0.035, 64), oak, 0, 0.42, 0); hmAdd(g, new THREE.CylinderGeometry(0.36, 0.36, 0.05, 48), oak, 0, 0.38, 0);
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + 0.6, l = hmAdd(g, new THREE.CylinderGeometry(0.02, 0.014, 0.42, 12).translate(0, -0.21, 0), oak, Math.cos(a) * 0.26, 0.38, Math.sin(a) * 0.26); l.rotation.set(Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18); }
    [['#2a4a6a', 0.24, 0.17, 0.035, 0.2], ['#d8c8a8', 0.21, 0.15, 0.03, -0.1]].forEach(([c, w, d, h, ry], i) => { const y = 0.4375 + (i ? 0.035 : 0) + h / 2; hmAdd(g, new THREE.BoxGeometry(w, h, d), STDm({ color: c, roughness: 0.6 }), -0.12, y, 0.05, { ry }); hmAdd(g, new THREE.BoxGeometry(w - 0.01, h - 0.008, d - 0.006), STDm({ color: '#f2ead8' }), -0.115, y, 0.05, { ry }); });
    hmAdd(g, hmLathe([[0.001, 0], [0.036, 0], [0.04, 0.09], [0.037, 0.09], [0.033, 0.006], [0.001, 0.006]]), STDm({ color: '#3a5a6a', roughness: 0.3, side: THREE.DoubleSide }), 0.17, 0.4375, -0.06);
    hmAdd(g, new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI), STDm({ color: '#3a5a6a', roughness: 0.3 }), 0.21, 0.4375 + 0.045, -0.06).rotation.z = -Math.PI / 2;
    hmAdd(g, new THREE.CylinderGeometry(0.035, 0.035, 0.08, 24), new THREE.MeshStandardMaterial({ color: '#c8a070', transparent: true, opacity: 0.5, roughness: 0.1 }), 0.06, 0.4775, 0.2); hmAdd(g, new THREE.CylinderGeometry(0.031, 0.031, 0.05, 24), STDm({ color: '#f4ecd8' }), 0.06, 0.4625, 0.2); }
  // ---- the monstera by the window, a small succulent on the sill
  { const g = new THREE.Group(); g.position.set(2.15, 0, -2.78); sc.add(g); const R = RNG('mon');
    hmAdd(g, hmLathe([[0.001, 0], [0.16, 0], [0.2, 0.06], [0.21, 0.42], [0.19, 0.42], [0.18, 0.06], [0.001, 0.06]], 48), STDm({ color: '#ece8e0', roughness: 0.35 }), 0, 0, 0);
    hmAdd(g, new THREE.CylinderGeometry(0.19, 0.19, 0.01, 32), STDm({ color: '#3a2a1e', roughness: 1 }), 0, 0.39, 0);
    const lm = STDm({ map: hmLeafTex(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 }), stem = STDm({ color: '#4a7a32', roughness: 0.7 }), lg = new THREE.PlaneGeometry(1, 1, 8, 8).translate(0, 0.5, 0), lp = lg.attributes.position;
    for (let i = 0; i < lp.count; i++) { const x = lp.getX(i), y = lp.getY(i); lp.setZ(i, -0.35 * y * y + 0.18 * Math.abs(x)); } lg.computeVertexNormals();
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + R.n(0.3), el = R.r(0.25, 1.0), Ls = R.r(0.45, 0.95), tip = new THREE.Vector3(Math.cos(a) * Math.cos(el) * Ls * 0.6, 0.4 + Math.sin(el) * Ls, Math.sin(a) * Math.cos(el) * Ls * 0.6);
      hmAdd(g, hmTube([[R.n(0.05), 0.4, R.n(0.05)], [tip.x * 0.4, 0.4 + (tip.y - 0.4) * 0.7, tip.z * 0.4], tip], 0.007, 16, 6), stem);
      const s = R.r(0.3, 0.45), lf = hmAdd(g, lg, lm, tip.x, tip.y, tip.z); lf.scale.setScalar(s); lf.rotation.set(-R.r(0.5, 1.1), Math.atan2(tip.x, tip.z), R.n(0.3), 'YXZ'); }
    const su = STDm({ color: '#7aa08a', roughness: 0.6 }); hmAdd(sc, hmLathe([[0.001, 0], [0.04, 0], [0.05, 0.08], [0.001, 0.08]]), STDm({ color: '#d87a5a' }), 1.3, WY0 + 0.001, BZ + 0.05);
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, l = hmAdd(sc, new THREE.SphereGeometry(0.022, 10, 8).scale(0.5, 1.2, 0.3), su, 1.3 + Math.cos(a) * 0.02, WY0 + 0.1, BZ + 0.05 + Math.sin(a) * 0.02); l.rotation.set(Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6); } }
  // ---- the kitchen along the right wall: cabinets, a quartz worktop, subway tiles, uppers, a steel fridge; things on the counter
  { const K = new THREE.Group(); sc.add(K); const front = STDm({ color: '#eeebe4', roughness: 0.55 }), brass = STDm({ color: '#c9a45a', metalness: 0.9, roughness: 0.3 }), top = hmFine(STDm({ color: '#eceae4', roughness: 0.3 }), 'stone'), FX = 3.8 - 0.6;
    hmAdd(K, new THREE.BoxGeometry(0.55, 0.1, 3.0), STDm({ color: '#2a2622' }), 3.8 - 0.32, 0.05, -1.7);
    for (let k = 0; k < 5; k++) { const z = -3.2 + 0.3 + k * 0.6; hmAdd(K, new THREE.BoxGeometry(0.02, 0.56, 0.592), front, FX + 0.01, 0.38, z); hmAdd(K, new THREE.BoxGeometry(0.02, 0.19, 0.592), front, FX + 0.01, 0.765, z);
      hmAdd(K, new THREE.CylinderGeometry(0.007, 0.007, 0.32, 10).rotateX(Math.PI / 2), brass, FX - 0.02, 0.8, z); [-1, 1].forEach((s) => hmAdd(K, new THREE.BoxGeometry(0.03, 0.012, 0.012), brass, FX - 0.005, 0.8, z + s * 0.15)); }
    hmAdd(K, new THREE.BoxGeometry(0.62, 0.78, 3.0), STDm({ color: '#9a958c', roughness: 0.8 }), 3.8 - 0.3, 0.49, -1.7); hmAdd(K, new THREE.BoxGeometry(0.66, 0.035, 3.04), top, 3.8 - 0.33, 0.8975, -1.7);
    const tile = hmTileTex(); hmAdd(K, new THREE.PlaneGeometry(3.0, 0.62).rotateY(-Math.PI / 2), STDm({ map: wrap(tile, 8, 3.2), roughness: 0.2, bumpMap: tile, bumpScale: 0.004 }), 3.79, 1.225, -1.7, { cast: false });
    hmAdd(K, new THREE.BoxGeometry(0.36, 0.72, 3.0), front, 3.8 - 0.18, 1.93, -1.7); for (let k = 0; k < 5; k++) hmAdd(K, new THREE.BoxGeometry(0.004, 0.7, 0.004), STDm({ color: '#b8b4ac' }), 3.8 - 0.36, 1.93, -3.2 + (k + 1) * 0.6);
    const ss_ = STDm({ color: '#c8ccd0', metalness: 0.85, roughness: 0.32 }); hmAdd(K, roundedBox(0.68, 1.9, 0.75, 0.02, 4), ss_, 3.8 - 0.36, 0.95, 0.2); hmAdd(K, new THREE.BoxGeometry(0.004, 0.006, 0.75), STDm({ color: '#555' }), 3.8 - 0.7, 1.25, 0.2);
    [[0.5, 0.35], [1.6, 0.6]].forEach(([y, h]) => hmAdd(K, new THREE.CylinderGeometry(0.01, 0.01, h, 10), ss_, 3.8 - 0.73, y + 0.4, -0.1));
    hmAdd(K, hmLathe([[0.001, 0], [0.08, 0], [0.09, 0.1], [0.07, 0.19], [0.03, 0.21], [0.001, 0.21]]), STDm({ color: '#e8e0d0', roughness: 0.35 }), 3.5, 0.915, -2.6);
    hmAdd(K, hmLathe([[0.001, 0], [0.06, 0], [0.13, 0.07], [0.125, 0.075], [0.055, 0.008], [0.001, 0.008]]), STDm({ color: '#2a4a5a', roughness: 0.3, side: THREE.DoubleSide }), 3.45, 0.915, -1.5);
    const or = STDm({ color: '#f08a1a', roughness: 0.5, bumpMap: wrap(texNoise('peel', '#888', ['#666', '#aaa'], 4000), 2, 2), bumpScale: 0.002 }); [[0, 0], [0.06, 0.03], [-0.05, 0.04], [0.01, -0.06]].forEach(([dx, dz], i) => hmAdd(K, new THREE.SphereGeometry(0.038, 20, 14), or, 3.45 + dx, 0.96 + (i === 3 ? 0.03 : 0), -1.5 + dz));
    hmAdd(K, new THREE.BoxGeometry(0.02, 0.4, 0.28), hmFine(STDm({ color: '#a8784a', roughness: 0.6 }), 'wood', 0.6), 3.74, 1.12, -2.1).rotation.z = 0.1;
    hmAdd(K, hmLathe([[0.001, 0], [0.05, 0], [0.05, 0.15], [0.001, 0.15]]), STDm({ color: '#3a3a3a', roughness: 0.5 }), 3.6, 0.915, -0.75); for (let k = 0; k < 4; k++) { const sp = hmAdd(K, new THREE.CylinderGeometry(0.006, 0.006, 0.3, 8), STDm({ color: '#b08050' }), 3.6 + (k - 1.5) * 0.015, 1.1, -0.75); sp.rotation.z = (k - 1.5) * 0.12; } }
  // ---- the cat's bowls on a mat by the fridge, kibble
  { const mat = STDm({ color: '#8a9aa0', roughness: 0.9 }); hmAdd(sc, roundedBox(0.45, 0.006, 0.3, 0.003, 4), mat, 2.85, 0.003, 1.0, { cast: false });
    const bowl = STDm({ color: '#f2efe8', roughness: 0.25 }); [[2.75, 0.95], [2.95, 1.05]].forEach(([x, z]) => hmAdd(sc, hmLathe([[0.001, 0], [0.05, 0], [0.075, 0.05], [0.07, 0.055], [0.045, 0.008], [0.001, 0.008]]), STDm({ color: '#f2efe8', roughness: 0.25, side: THREE.DoubleSide }), x, 0.006, z));
    hmAdd(sc, new THREE.CylinderGeometry(0.066, 0.05, 0.03, 32), new THREE.MeshStandardMaterial({ color: '#a8c8d8', transparent: true, opacity: 0.55, roughness: 0.05 }), 2.95, 0.03, 1.05, { cast: false });
    const R = RNG('kib'), kb = IM(new THREE.SphereGeometry(0.007, 8, 6).scale(1, 0.6, 1), STDm({ color: '#8a5a30', roughness: 0.8 }), 70); for (let i = 0; i < 70; i++) { const a = R.r(0, TAU), r = Math.sqrt(R.f()) * 0.05; kb.setMatrixAt(i, M4c(2.75 + Math.cos(a) * r, 0.02 + (0.05 - r) * 0.5 + R.r(0, 0.012), 0.95 + Math.sin(a) * r, R.r(0, TAU))); } sc.add(kb);
    [[2.62, 1.12], [2.58, 0.86]].forEach(([x, z], i) => hmAdd(sc, new THREE.SphereGeometry(0.007, 8, 6).scale(1, 0.6, 1), STDm({ color: '#8a5a30' }), x, 0.004, z)); }
  // ---- small things for the small scales: the coin, the pencil, crumbs, dust, a hair, motes in the sun
  S.coinC = new THREE.Vector3(0.5, 0, -1.25); S.coinYaw = 1.876; S.coin = hmCoin(sc, S.coinC, S.coinYaw); hmPencil(sc, S.coinC, S.coinYaw);
  { const R = RNG('dust'), cr = IM(lumpyGeo(2, 0.4, 3), STDm({ color: '#d8b880', roughness: 0.9 }), 26), du = IM(lumpyGeo(2, 0.6, 4), STDm({ color: '#b8b0a8', roughness: 1, transparent: true, opacity: 0.85 }), 40);
    for (let i = 0; i < 26; i++) { const r = R.r(0.0004, 0.0015); cr.setMatrixAt(i, M4c(S.coinC.x + R.n(0.12), r * 0.6, S.coinC.z + R.n(0.12), R.r(0, TAU), r, r * 0.7, r)); } sc.add(cr);
    for (let i = 0; i < 40; i++) { const r = R.r(0.0003, 0.0012); du.setMatrixAt(i, M4c(S.coinC.x + R.n(0.1), r * 0.5, S.coinC.z + R.n(0.1), R.r(0, TAU), r, r * 0.5, r)); } sc.add(du);
    const hp = []; let x = S.coinC.x + 0.02, z = S.coinC.z + 0.05; for (let k = 0; k < 14; k++) { hp.push([x, 0.0003, z]); x += 0.012 + R.n(0.004); z += R.n(0.01); } hmAdd(sc, hmTube(hp, 0.00025, 80, 5), STDm({ color: '#4a3020', roughness: 0.4 }));
    const mk = (n, c, rad, sz) => { const p = new Float32Array(n * 3), Rm = RNG('mote' + n); for (let i = 0; i < n; i++) p.set([c.x + Rm.n(rad), c.y + Rm.n(rad) * 0.7, c.z + Rm.n(rad)], i * 3); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(p, 3));
      const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex(), color: '#fff2d8', size: sz, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); sc.add(pts); return pts; };
    S.motesBig = mk(260, new THREE.Vector3(0.3, 1.1, -1.4), 1.3, 0.012); S.motesSmall = mk(160, new THREE.Vector3(S.coinC.x, 0.03, S.coinC.z), 0.06, 0.0007); }
  S.cat = hmCat(sc); S.cat.root.position.set(2.88, 0, 0.62); S.cat.root.rotation.y = -Math.PI / 2;
  S.girl = makeGirl(st); return S; }); }

// ---- the coin: a bimetal 2 (silver ring, gold centre) with reliefs, a raised rim and a reeded edge, standing on its edge
function hmCoin(sc, C, yaw) { const R = 0.01288, T = 0.0022, g = new THREE.Group(); g.position.set(C.x, R, C.z); g.rotation.y = yaw; sc.add(g);
  const col = hmCoinTex(true), hgt = hmCoinTex(false), face = new THREE.MeshStandardMaterial({ map: col, bumpMap: hgt, bumpScale: 0.006, metalness: 0.92, roughness: 0.34, envMapIntensity: 1.2 });
  [-1, 1].forEach((s) => { const f = hmAdd(g, new THREE.CircleGeometry(R - 0.0006, 96), face, 0, 0, s * T / 2); if (s < 0) f.rotation.y = Math.PI; });
  const reed = wrap(g3Tex((x, w, h) => { for (let i = 0; i < w; i++) { const v = 128 + 110 * Math.sin(i / w * TAU * 8); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, 0, 1, h); } }, 64, 8, false), 22, 1);
  const edge = new THREE.MeshStandardMaterial({ color: '#c8ccd2', metalness: 0.92, roughness: 0.3, bumpMap: reed, bumpScale: 0.004, envMapIntensity: 1.2 });
  hmAdd(g, new THREE.CylinderGeometry(R, R, T, 128, 1, true).rotateX(Math.PI / 2), edge);
  [-1, 1].forEach((s) => hmAdd(g, new THREE.TorusGeometry(R - 0.0004, 0.00042, 8, 128), new THREE.MeshStandardMaterial({ color: '#d4d6dc', metalness: 0.92, roughness: 0.28 }), 0, 0, s * (T / 2 - 0.0001)));
  return g; }
// a yellow hexagonal pencil lying on a flat behind the coin: sharpened wood, graphite, a ribbed ferrule, a pink eraser
function hmPencil(sc, C, yaw) { const g = new THREE.Group(), n = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), t = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw)), r = 0.0037;
  g.position.copy(C).addScaledVector(n, -0.032).addScaledVector(t, 0.03); g.position.y = r * 0.866; g.rotation.y = yaw + 0.12; sc.add(g);
  const ax = new THREE.Group(); ax.rotation.z = Math.PI / 2; g.add(ax);   // pencil axis along local x of g (= the coin's tangent)
  const paint = STDm({ color: '#f2c010', roughness: 0.3, envMapIntensity: 0.8 }), wood = STDm({ color: '#e8c590', roughness: 0.8 });
  const body = hmAdd(ax, new THREE.CylinderGeometry(r, r, 0.15, 6), paint, 0, 0, 0); body.rotation.y = Math.PI / 6;
  hmAdd(ax, new THREE.CylinderGeometry(0.0003, r * 0.98, 0.022, 24), wood, 0, -0.086, 0).rotation.x = Math.PI;
  hmAdd(ax, new THREE.CylinderGeometry(0.0001, 0.0011, 0.0045, 16), STDm({ color: '#2a2a2c', metalness: 0.4, roughness: 0.35 }), 0, -0.0948, 0).rotation.x = Math.PI;
  const fer = wrap(g3Tex((x, w, h) => { for (let j = 0; j < h; j++) { const v = 128 + 120 * Math.sin(j / h * TAU * 6); x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(0, j, w, 1); } }, 8, 64, false), 1, 1);
  hmAdd(ax, new THREE.CylinderGeometry(r * 1.02, r * 1.02, 0.012, 24), STDm({ color: '#c8c4b8', metalness: 0.9, roughness: 0.3, bumpMap: fer, bumpScale: 0.003 }), 0, 0.081, 0);
  hmAdd(ax, new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.008, 24), STDm({ color: '#e88a8a', roughness: 0.9 }), 0, 0.091, 0);
  hmAdd(ax, new THREE.SphereGeometry(r * 0.96, 24, 8, 0, TAU, 0, Math.PI / 2), STDm({ color: '#e88a8a', roughness: 0.9 }), 0, 0.095, 0).scale.y = 0.3;
  [-1, 1].forEach((s) => hmAdd(ax, new THREE.CylinderGeometry(r * 1.03, r * 1.03, 0.0012, 24), STDm({ color: '#2a5a3a', roughness: 0.4, metalness: 0.3 }), 0, 0.073 + s * 0.0, 0)); return g; }

// ---- the cat: a big ginger tabby lying in the sphinx pose (faces +z in its own frame, floor y = 0). The head is a
// signed-distance sculpt (cranium, cheekbones, brow, narrow muzzle, whisker pads, chin, lids round almond sockets)
// projected onto a dense sphere; separate nose leather with nostrils, eyes with an iris, slit pupil and a cornea,
// cupped ears with pinna and inner furnishings. Fur = shells whose strands are combed along the coat's flow (attribute
// fd); the tabby pattern (M, mascara lines, rings, stripes) is baked into vertex colours from the rest pose.
let HM_FUR = null, HM_EYENV = null;
function hmFurMats(n = 6, len = 0.008) { if (HM_FUR) return HM_FUR; const mats = [];
  for (let i = 0; i <= n; i++) { const k = i / n, m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, envMapIntensity: 0.5 });
    m.onBeforeCompile = (sh) => {
      sh.vertexShader = 'attribute float fl; attribute vec3 fd; varying vec3 fB; varying vec3 fD;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>\n fB = position; fD = fd; transformed += (normal + fd * 1.4) * fl * ${(len * k).toFixed(5)}; transformed.y -= fl * ${(len * k * k * 0.25).toFixed(5)};`);
      sh.fragmentShader = 'varying vec3 fB; varying vec3 fD;\n' + HM_GLSL + sh.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
 vec3 hq = fB * 1500.0; hq -= fD * dot(hq, fD) * 0.72; vec3 hc = floor(hq); float hh = hmH3(hc);
 ${i ? `{ vec3 f = fract(hq) - 0.5 - (vec3(hh, hmH3(hc + 1.7), hmH3(hc + 3.3)) - 0.5) * 0.5; if (length(f) > 0.62 * (1.0 - ${(k * 0.86).toFixed(3)})) discard; }` : ''}`)
        .replace('#include <color_fragment>', `#include <color_fragment>\n diffuseColor.rgb *= ${(0.6 + 0.48 * k).toFixed(3)} * (0.8 + 0.36 * hh);`); };
    m.customProgramCacheKey = () => 'hmfur2' + i; mats.push(m); }
  return (HM_FUR = mats); }
// signed-distance pieces (metres)
const hmEll = (x, y, z, c, r) => { const a = (x - c[0]) / r[0], b = (y - c[1]) / r[1], d = (z - c[2]) / r[2], k0 = Math.hypot(a, b, d), k1 = Math.hypot(a / r[0], b / r[1], d / r[2]); return k1 < 1e-9 ? -Math.min(r[0], r[1], r[2]) : (k0 * (k0 - 1)) / k1; };
const hmSmin = (a, b, k) => { const h = clamp(0.5 + (0.5 * (b - a)) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); };
const hmSmax = (a, b, k) => -hmSmin(-a, -b, k);
const hmCaps = (x, y, z, a, b, r) => { const px = x - a[0], py = y - a[1], pz = z - a[2], bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], h = clamp((px * bx + py * by + pz * bz) / (bx * bx + by * by + bz * bz), 0, 1); return Math.hypot(px - bx * h, py - by * h, pz - bz * h) - r; };
const hmSegD = (x, y, z, pts) => { let m = 1e9; for (let i = 0; i < pts.length - 1; i++) m = Math.min(m, hmCaps(x, y, z, pts[i], pts[i + 1], 0)); return m; };
// a dense sphere whose every vertex is pushed in along its ray to the outermost zero of sd (star-shaped sculpt)
function hmSculpt(sd, ws, hs, rMax) { const g = new THREE.SphereGeometry(1, ws, hs); g.rotateY(-Math.PI / 2); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const dx = p.getX(i), dy = p.getY(i), dz = p.getZ(i); let t = rMax, prev = rMax, d = sd(dx * t, dy * t, dz * t), n = 0;
    while (d > 0.0001 && t > 0 && n++ < 500) { prev = t; t -= Math.max(d * 0.8, 0.00025); d = sd(dx * t, dy * t, dz * t); }
    if (d < 0) { let lo = t, hi = prev; for (let k = 0; k < 14; k++) { const m = (lo + hi) / 2; if (sd(dx * m, dy * m, dz * m) < 0) lo = m; else hi = m; } t = (lo + hi) / 2; }
    p.setXYZ(i, dx * t, dy * t, dz * t); }
  g.computeVertexNormals(); const N = g.attributes.normal, avg = (ids) => { const a = new THREE.Vector3(); ids.forEach((j) => a.add(_v.fromBufferAttribute(N, j))); a.normalize(); ids.forEach((j) => N.setXYZ(j, a.x, a.y, a.z)); };
  for (let iy = 0; iy <= hs; iy++) avg([iy * (ws + 1), iy * (ws + 1) + ws]); [0, hs].forEach((iy) => avg([...Array(ws + 1).keys()].map((j) => iy * (ws + 1) + j))); return g; }
function hmMerge(geos) { let nv = 0, ni = 0; geos.forEach((g) => { nv += g.attributes.position.count; ni += g.index.count; });
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), I = new Uint32Array(ni); let ov = 0, oi = 0;
  geos.forEach((g) => { P.set(g.attributes.position.array, ov * 3); N.set(g.attributes.normal.array, ov * 3); for (let k = 0; k < g.index.count; k++) I[oi + k] = g.index.array[k] + ov; oi += g.index.count; ov += g.attributes.position.count; });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setIndex(new THREE.BufferAttribute(I, 1)); return g; }
const hmV = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function hmCat(sc) { const root = new THREE.Group(); sc.add(root); const mats = hmFurMats(), C = { root };
  const GIN = lin('#c06e2a'), LIGHT = lin('#e2a35e'), DARK = lin('#7e3a12'), RUST = lin('#b0521c'), CREAM = lin('#f0dcbf'), LID = lin('#2e1a12');
  // shells for one geometry: colour cf, fur length ff (× 8 mm) and flow df per vertex in the geometry's frame
  const part = (par, geo, cf, ff, df, pivot) => { const p = geo.attributes.position, N = geo.attributes.normal, n = p.count, c = new Float32Array(n * 3), fl = new Float32Array(n), fd = new Float32Array(n * 3), nv = new THREE.Vector3(), dv = new THREE.Vector3();
    for (let i = 0; i < n; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = cf(x, y, z, i); c.set([k.r, k.g, k.b], i * 3); fl[i] = ff(x, y, z, i);
      nv.fromBufferAttribute(N, i); dv.set(...df(x, y, z, i)); dv.addScaledVector(nv, -dv.dot(nv)); if (dv.lengthSq() > 1e-10) dv.normalize(); fd.set([dv.x, dv.y, dv.z], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); geo.setAttribute('fl', new THREE.BufferAttribute(fl, 1)); geo.setAttribute('fd', new THREE.BufferAttribute(fd, 3));
    if (pivot) geo.translate(-pivot.x, -pivot.y, -pivot.z); const g = new THREE.Group(); mats.forEach((m, i) => { const me = new THREE.Mesh(geo, m); me.castShadow = i === 0; me.receiveShadow = true; g.add(me); }); par.add(g); return g; };
  const ell = (rx, ry, rz, x, y, z, ws = 64, hs = 40, along = false) => { const g = new THREE.SphereGeometry(1, ws, hs); if (along) g.rotateX(Math.PI / 2); g.scale(rx, ry, rz).translate(x, y, z); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) < 0.006) p.setY(i, 0.006 + (p.getY(i) - 0.006) * 0.1); g.computeVertexNormals(); return g; };
  // ---- body coat: mackerel stripes over the back fading into a cream belly, bullseye on the haunch, rings on the legs
  const bodyCF = (kind) => (x, y, z) => { const n = hmN3(x * 70, y * 70, z * 70), n2 = hmN3(x * 15 + 3, y * 15, z * 15), c = GIN.clone().lerp(LIGHT, 0.12 + 0.45 * n); let s = 0, cr = 0;
    if (kind === 'body') { s = ss(0.2, 0.75, Math.sin(z * 105 + Math.sin(y * 28 + x * 12) * 1.3 + n2 * 3.2)) * ss(0.08, 0.17, y); s = Math.max(s, ss(0.03, 0.008, Math.abs(x)) * ss(0.17, 0.2, y)); cr = ss(0.06, 0.025, y) + ss(0.12, 0.2, z) * ss(0.14, 0.08, y); }
    if (kind === 'neck') { const fr = ss(0.2, 0.26, z); s = ss(0.45, 0.85, Math.sin(y * 170 + n2 * 2)) * fr * ss(0.13, 0.2, y) * 0.75 + ss(0.4, 0.85, Math.cos(x * 650)) * ss(0.03, 0.02, Math.abs(x)) * ss(0.24, 0.28, y) * (1 - fr); cr = ss(0.2, 0.15, y) * fr; }
    if (kind === 'haunch') { s = ss(0.3, 0.8, Math.sin(Math.hypot(y - 0.1, z + 0.17) * 150 + n2 * 2.5)) * ss(0.05, 0.12, y); cr = ss(0.03, 0.0, y); }
    if (kind === 'shoulder') { s = ss(0.3, 0.8, Math.sin(y * 140 + z * 30 + n2 * 2)) * 0.7 * ss(0.05, 0.09, y); cr = ss(0.05, 0.02, y) * 0.6; }
    if (kind === 'leg') { s = ss(0.3, 0.8, Math.sin(z * 130 + n2 * 2)) * ss(0.025, 0.05, y) * 0.8; cr = ss(0.035, 0.015, y) * 0.5; }
    if (kind === 'paw') { c.lerp(LIGHT, 0.5); cr = 0.3 + 0.35 * ss(0.02, 0.006, y); }
    return c.lerp(DARK, clamp(s) * 0.7).lerp(CREAM, clamp(cr)); };
  const FL = { body: 1, neck: 0.95, haunch: 1, shoulder: 0.8, leg: 0.5, paw: 0.32 }, FD = { body: [0, -0.35, -1], neck: [0, -0.7, -0.6], haunch: [0, -0.6, -1], shoulder: [0, -1, 0.3], leg: [0, -0.4, 1], paw: [0, -0.2, 1] };
  const bp = (par, geo, kind, pivot) => part(par, geo, bodyCF(kind), () => FL[kind], () => FD[kind], pivot);
  // body (breathes), chest, haunches, tucked hind feet, shoulders
  const body = new THREE.Group(); root.add(body); C.body = body;
  bp(body, ell(0.135, 0.108, 0.27, 0, 0.108, -0.06, 72, 48, true), 'body'); bp(body, ell(0.098, 0.122, 0.1, 0, 0.122, 0.15), 'body');
  [-1, 1].forEach((s) => { bp(body, ell(0.075, 0.092, 0.13, s * 0.1, 0.094, -0.17), 'haunch'); bp(body, ell(0.026, 0.018, 0.055, s * 0.132, 0.018, -0.045, 32, 20), 'paw'); bp(body, ell(0.042, 0.06, 0.07, s * 0.072, 0.066, 0.12, 40, 28), 'shoulder'); });
  // front legs, pivoted at the elbow for the swipe: slimmer forearm, compact paw with four toe pads in an arc
  const leg = (s) => { const e = new THREE.Vector3(s * 0.068, 0.048, 0.1), w = new THREE.Vector3(s * 0.064, 0.03, 0.29), piv = new THREE.Group(); piv.position.copy(e); root.add(piv);
    const g1 = new THREE.CapsuleGeometry(0.024, w.distanceTo(e), 10, 24); g1.rotateX(Math.PI / 2); g1.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), w.clone().sub(e).normalize())); g1.translate((e.x + w.x) / 2, (e.y + w.y) / 2, (e.z + w.z) / 2);
    bp(piv, g1, 'leg', e); bp(piv, ell(0.027, 0.019, 0.036, s * 0.064, 0.02, 0.312, 40, 28), 'paw', e);
    for (let k = 0; k < 4; k++) bp(piv, ell(0.0095, 0.0095, 0.011, s * 0.064 + (k - 1.5) * 0.0125, 0.0165, 0.34 - Math.abs(k - 1.5) * 0.006, 20, 14), 'paw', e);
    return piv; };
  C.legL = leg(-1); C.legR = leg(1);
  // neck and head (pivot at the base of the neck)
  const NP = new THREE.Vector3(0, 0.17, 0.16), neck = new THREE.Group(); neck.position.copy(NP); root.add(neck); C.neck = neck;
  bp(neck, ell(0.074, 0.088, 0.085, 0, 0.205, 0.215), 'neck', NP);
  const H0 = new THREE.Vector3(0, 0.28, 0.3), head = new THREE.Group(); head.position.copy(H0).sub(NP); neck.add(head); C.head = head;
  const hg = new THREE.Group(); hg.scale.setScalar(1.13); hg.position.set(0, -0.004, -0.004); head.add(hg); C.hg = hg;
  // ---- the skull (head-local metres: x = cat's left/right, y up, z towards the nose)
  const EY = [-1, 1].map((s) => { const yaw = 0.27, f = new THREE.Vector3(s * Math.sin(yaw), 0.07, Math.cos(yaw)).normalize(), ex = new THREE.Vector3(0, 1, 0).cross(f).normalize().multiplyScalar(s), ey = f.clone().cross(ex).multiplyScalar(s).normalize(), a = 0.17;
    const o = ex.clone().multiplyScalar(Math.cos(a)).addScaledVector(ey, Math.sin(a)), u = ey.clone().multiplyScalar(Math.cos(a)).addScaledVector(ex, -Math.sin(a)), E = new THREE.Vector3(s * 0.0235, 0.006, 0.039);
    return { s, f, o, u, E, T: E.clone().addScaledVector(f, 0.0125), inner: E.clone().addScaledVector(f, 0.0055).addScaledVector(o, -0.0118), outer: E.clone().addScaledVector(f, 0.0055).addScaledVector(o, 0.0122) }; });
  const RE = 0.0115;
  const hd = (x, y, z) => { let d = hmEll(x, y, z, [0, 0.009, -0.009], [0.05, 0.041, 0.056]);
    d = hmSmin(d, hmEll(x, y, z, [0, -0.028, 0.002], [0.04, 0.022, 0.044]), 0.012);
    d = hmSmin(d, hmEll(x, y, z, [0, -0.019, 0.04], [0.022, 0.018, 0.026]), 0.01);
    d = hmSmin(d, hmCaps(x, y, z, [0, 0.011, 0.026], [0, -0.007, 0.057], 0.0102), 0.008);
    d = hmSmin(d, hmEll(x, y, z, [0, -0.041, 0.046], [0.0115, 0.0075, 0.013]), 0.005);
    for (const e of EY) { const s = e.s;
      d = hmSmin(d, hmEll(x, y, z, [s * 0.033, -0.011, 0.004], [0.031, 0.029, 0.035]), 0.012);
      d = hmSmin(d, hmEll(x, y, z, [s * 0.0112, -0.026, 0.056], [0.0128, 0.0105, 0.012]), 0.0035);
      d = hmSmin(d, hmEll(x, y, z, [s * 0.022, 0.021, 0.033], [0.016, 0.0085, 0.013]), 0.006);
      d = hmSmin(d, Math.hypot(x - e.E.x, y - e.E.y, z - e.E.z) - 0.0124, 0.003); }
    for (const e of EY) { const dx = x - e.T.x, dy = y - e.T.y, dz = z - e.T.z, u = dx * e.o.x + dy * e.o.y + dz * e.o.z, v = dx * e.u.x + dy * e.u.y + dz * e.u.z, w = dx * e.f.x + dy * e.f.y + dz * e.f.z, un = u / 0.0114;
      d = hmSmax(d, -hmEll(u, v / Math.max(0.3, 1 - 0.42 * un * un), w, [0, 0, 0], [0.0114, 0.0076, 0.013]), 0.0012); }
    return d; };
  const proj = (p, dir) => { const P = hmV(p), D = hmV(dir).normalize(); let t = 0; while (hd(P.x + D.x * t, P.y + D.y * t, P.z + D.z * t) < 0 && t < 0.08) t += 0.0004; let lo = t - 0.0004, hi = t; for (let k = 0; k < 12; k++) { const m = (lo + hi) / 2; if (hd(P.x + D.x * m, P.y + D.y * m, P.z + D.z * m) < 0) lo = m; else hi = m; } return P.addScaledVector(D, hi); };
  // tabby face: M on the forehead running back over the crown, mascara + cheek lines, cream muzzle / chin / throat / spectacles
  const ML = [-1, 1].map((s) => [[EY[s > 0 ? 1 : 0].outer.x, EY[s > 0 ? 1 : 0].outer.y, EY[s > 0 ? 1 : 0].outer.z - 0.002], [s * 0.047, 0.004, 0.012], [s * 0.054, 0.008, -0.012]]);
  const CL = [-1, 1].map((s) => [[s * 0.029, -0.015, 0.033], [s * 0.046, -0.019, 0.016], [s * 0.057, -0.013, -0.008]]);
  const TL = EY.map((e) => [[e.inner.x, e.inner.y - 0.0008, e.inner.z], [e.s * 0.0105, -0.006, e.inner.z + 0.009]]);
  const eyeD = (x, y, z) => { const e = EY[x >= 0 ? 1 : 0]; return Math.hypot(x - e.E.x, y - e.E.y, z - e.E.z) - RE; };
  const headCF = (x, y, z) => { const n1 = hmN3(x * 500, y * 500, z * 500), n2 = hmN3(x * 120 + 7, y * 120, z * 120), c = GIN.clone().lerp(LIGHT, 0.18 + 0.42 * n2), ax = Math.abs(x), si = x >= 0 ? 1 : 0, de = eyeD(x, y, z);
    const xw = x / (1 + 0.75 * ss(0.034, 0.017, y) * ss(0.0, 0.03, z)) / (1 + 0.45 * ss(0.0, -0.06, z));
    let st = ss(0.45, 0.85, Math.cos((xw * TAU) / 0.0088 + n2 * 0.6)) * ss(0.024, 0.017, Math.abs(xw)) * ss(0.017, 0.026, y + 0.3 * Math.max(0, -z)) * ss(0.003, 0.008, de);
    st = Math.max(st, ss(0.0026, 0.0012, hmSegD(x, y, z, ML[si])) * 0.9, ss(0.0022, 0.001, hmSegD(x, y, z, CL[si])) * 0.75);
    c.lerp(DARK, clamp(st) * 0.78);
    let cr = ss(-0.005, -0.016, y) * ss(0.034, 0.05, z) * ss(0.03, 0.02, ax);
    cr = Math.max(cr, ss(-0.033, -0.042, y) * ss(-0.01, 0.012, z), ss(-0.03, -0.046, y) * 0.8, ss(0.0055, 0.003, de) * ss(0.001, 0.002, de) * 0.45);
    c.lerp(CREAM, clamp(cr));
    c.lerp(RUST, 0.4 * ss(0.012, 0.004, ax) * ss(0.036, 0.05, z) * ss(-0.017, -0.009, y));
    c.lerp(RUST, ss(0.0016, 0.0006, hmSegD(x, y, z, TL[si])) * 0.85);
    c.lerp(LID, ss(0.0009, 0.0003, de));
    return c.multiplyScalar(0.93 + 0.14 * n1); };
  const headFF = (x, y, z) => { const ax = Math.abs(x); let f = 0.3 + 0.32 * ss(0.0, -0.05, z) + 0.6 * ss(0.042, 0.06, ax) * ss(0.015, -0.01, z) * ss(0.015, -0.02, y) + 0.35 * ss(-0.03, -0.045, y);
    return f * lerp(1, 0.3, ss(0.04, 0.056, z)) * ss(0.0002, 0.0035, eyeD(x, y, z)); };
  const N0 = [0, -0.014, 0.09], headFD = (x, y, z) => [x - N0[0], y - N0[1], z - N0[2]];
  part(hg, hmSculpt(hd, 220, 160, 0.1), headCF, headFF, headFD);
  // ---- nose leather: a salmon shield narrowing to the philtrum, comma nostrils, cobbled skin
  const NS = [-1, 1].map((s) => ({ s, c: [s * 0.0036, -0.0024, 0.0026], a: s * 0.75 }));
  const nsd = (x, y, z) => { const w = 0.42 + 0.58 * clamp((y + 0.0066) / 0.0132, 0, 1); let d = hmEll(x / w, y, z, [0, 0, 0], [0.0086, 0.0066, 0.0038]) * w;
    for (const q of NS) { const dx = x - q.c[0], dy = y - q.c[1], ca = Math.cos(q.a), sa = Math.sin(q.a); d = hmSmax(d, -hmEll(dx * ca + dy * sa, -dx * sa + dy * ca, z - q.c[2], [0, 0, 0], [0.0026, 0.0011, 0.0036]), 0.0005); }
    return hmSmax(d, -hmEll(x, y, z, [0, -0.0048, 0.0054], [0.0006, 0.003, 0.003]), 0.0004); };
  { const g = hmSculpt(nsd, 96, 72, 0.012), p = g.attributes.position, cc = new Float32Array(p.count * 3), PK = lin('#b8705e'), PD = lin('#8a4c40'), NH = lin('#2a1410');
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = PK.clone().lerp(PD, 0.25 + 0.35 * hmN3(x * 2600, y * 2600, z * 2600) + 0.4 * ss(0.002, -0.003, z));
      let dn = 1; for (const q of NS) dn = Math.min(dn, Math.hypot((x - q.c[0]) / 0.0024, (y - q.c[1]) / 0.0012, (z - q.c[2]) / 0.0036) - 1); k.lerp(NH, ss(0.25, 0.0, dn)); k.lerp(PD, ss(0.0012, 0.0, Math.abs(x)) * ss(-0.001, -0.004, y) * 0.6); cc.set([k.r, k.g, k.b], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(cc, 3)); const nose = new THREE.Mesh(g, STDm({ vertexColors: true, roughness: 0.42 })); nose.position.set(0, -0.0118, 0.0648); nose.rotation.x = 0.15; nose.castShadow = true; hg.add(nose); C.nose = nose; }
  // lips: the philtrum splitting into the dark lip line under the whisker pads
  const lipM = STDm({ color: '#33201a', roughness: 0.55 }), lp = (x, y) => proj([x, y, 0.035], [0, -0.1, 1]);
  hg.add(new THREE.Mesh(hmMerge([hmTube([lp(0, -0.0205), lp(0, -0.027), lp(0, -0.0315)], 0.0006, 10, 5), ...[-1, 1].map((s) => hmTube([lp(0, -0.0315), lp(s * 0.007, -0.0345), lp(s * 0.015, -0.0352), lp(s * 0.022, -0.0335)], (u) => 0.00075 * (1 - 0.5 * u), 20, 5))]), lipM));
  // ---- eyes: iris (fibres, crypts, limbal ring, slit pupil) under a bulging cornea that mirrors the window
  const eyeTex = g3Tex((x, w, h) => { const cx = w / 2, cy = h / 2, R = w * 0.5; x.fillStyle = '#3a2406'; x.fillRect(0, 0, w, h);
    const g = x.createRadialGradient(cx, cy, R * 0.05, cx, cy, R); g.addColorStop(0, '#8e9a30'); g.addColorStop(0.28, '#b9b23a'); g.addColorStop(0.62, '#d79a2c'); g.addColorStop(0.9, '#a86c1a'); g.addColorStop(1, '#3a2406'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, TAU); x.fill();
    const Rr = RNG('catiris'); for (let k = 0; k < 900; k++) { const a = Rr.r(0, TAU), r0 = Rr.r(0.08, 0.5) * R, r1 = r0 + Rr.r(0.15, 0.45) * R; x.strokeStyle = Rr.f() < 0.5 ? `rgba(255,236,150,${Rr.r(0.06, 0.2)})` : `rgba(80,45,8,${Rr.r(0.06, 0.22)})`; x.lineWidth = Rr.r(0.6, 1.8); x.beginPath(); x.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); x.quadraticCurveTo(cx + Math.cos(a + 0.08) * (r0 + r1) / 2, cy + Math.sin(a + 0.08) * (r0 + r1) / 2, cx + Math.cos(a) * Math.min(r1, R), cy + Math.sin(a) * Math.min(r1, R)); x.stroke(); }
    for (let k = 0; k < 70; k++) { const a = Rr.r(0, TAU), r = Rr.r(0.25, 0.8) * R; x.fillStyle = `rgba(70,40,5,${Rr.r(0.1, 0.25)})`; x.beginPath(); x.ellipse(cx + Math.cos(a) * r, cy + Math.sin(a) * r, Rr.r(2, 6), Rr.r(1, 3), a, 0, TAU); x.fill(); }
    x.strokeStyle = 'rgba(40,22,4,0.75)'; x.lineWidth = R * 0.05; x.beginPath(); x.arc(cx, cy, R * 0.975, 0, TAU); x.stroke();
    x.strokeStyle = 'rgba(230,220,120,0.35)'; x.lineWidth = 3; x.beginPath(); x.ellipse(cx, cy, R * 0.24, R * 0.95 * 0.98, 0, 0, TAU); x.stroke();
    x.fillStyle = 'rgba(8,6,4,0.55)'; x.beginPath(); x.ellipse(cx, cy, R * 0.17, R * 0.93, 0, 0, TAU); x.fill(); x.fillStyle = '#060504'; x.beginPath(); x.ellipse(cx, cy, R * 0.115, R * 0.9, 0, 0, TAU); x.fill();
    const lg = x.createLinearGradient(0, 0, 0, h * 0.45); lg.addColorStop(0, 'rgba(0,0,0,0.55)'); lg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = lg; x.fillRect(0, 0, w, h * 0.45); }, 512, 512);
  if (!HM_EYENV) { HM_EYENV = g3Tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a3632'); g.addColorStop(0.45, '#26221e'); g.addColorStop(0.55, '#1a1612'); g.addColorStop(1, '#0e0b08'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = '#fffaf0'; x.fillRect(w * 0.2, h * 0.25, w * 0.08, h * 0.18); x.fillStyle = '#5a5048'; x.fillRect(w * 0.238, h * 0.25, w * 0.005, h * 0.18); x.fillRect(w * 0.2, h * 0.33, w * 0.08, h * 0.008); }, 512, 256); HM_EYENV.mapping = THREE.EquirectangularReflectionMapping; }
  const irisM = STDm({ map: eyeTex, roughness: 0.55 }), corM = new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.04, metalness: 0, envMap: HM_EYENV, envMapIntensity: 0.9, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const ZI = 0.0045, RI = Math.sqrt(RE * RE - ZI * ZI), ballG = new THREE.SphereGeometry(RE, 40, 28, 0, TAU, 0, Math.PI - Math.acos(ZI / RE)).rotateX(-Math.PI / 2), irisG = new THREE.CircleGeometry(RI, 48).translate(0, 0, ZI), scM = STDm({ color: '#8a7c62', roughness: 0.5 });
  const corG = new THREE.SphereGeometry(0.0108, 48, 16, 0, TAU, 0, 1.36).rotateX(Math.PI / 2).translate(0, 0, 0.002);
  C.eyes = EY.map((e) => { const g = new THREE.Group(); g.position.copy(e.E).addScaledVector(e.f, 0.0016); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), e.f); hg.add(g); const gz = new THREE.Group(); g.add(gz);
    gz.add(new THREE.Mesh(ballG, scM), new THREE.Mesh(irisG, irisM)); const cor = new THREE.Mesh(corG, corM); cor.renderOrder = 2; gz.add(cor);
    const car = new THREE.Mesh(new THREE.SphereGeometry(0.0011, 12, 8), STDm({ color: '#9a5a50', roughness: 0.3 })); car.position.copy(e.inner).addScaledVector(e.f, -0.0012); hg.add(car); return { g, gz, f: e.f }; });
  // ---- ears: cupped, tall triangles; furred back, pink inner skin with folds and Henry's pocket, pale furnishings
  const earSurf = (bk, dz) => { const nu = 30, nt = 26, P = [], I = [];
    for (let i = 0; i <= nu; i++) { const u = i / nu, a = 0.021 * Math.pow(1 - u, 0.85) * (1 + 0.16 * Math.sin(Math.PI * u)) + 0.0007, b = 0.0115 * bk * Math.pow(1 - u, 0.7) + 0.0005;
      for (let j = 0; j <= nt; j++) { const th = (j / nt) * Math.PI, hp = u > 0.05 && u < 0.27 ? Math.sin((Math.PI * (u - 0.05)) / 0.22) * ss(0.55, 0.0, th) : 0; P.push(a * Math.cos(th) - 0.0035 * hp, u * 0.054, -b * Math.sin(th) + dz * (1 - u * 0.5) + 0.0016 * hp); } }
    for (let i = 0; i < nu; i++) for (let j = 0; j < nt; j++) { const a = i * (nt + 1) + j, b2 = a + nt + 1; I.push(a, b2, a + 1, b2, b2 + 1, a + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; };
  const flipX = (g) => { g.scale(-1, 1, 1); const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t2 = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t2; } g.computeVertexNormals(); return g; };
  const skinM = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }), furnM = STDm({ color: '#e8dccb', roughness: 0.8 });
  C.ears = EY.map((e) => { const s = e.s, eg = new THREE.Group(); eg.position.set(s * 0.031, 0.039, -0.014); eg.rotation.set(-0.1, s * 0.4, -s * 0.36); hg.add(eg);
    const og = earSurf(1, 0); { const ix = og.index.array, nz = og.attributes.normal.getZ(15 * 27 + 13); if (nz > 0) { for (let k = 0; k < ix.length; k += 3) { const t2 = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t2; } og.computeVertexNormals(); } }
    if (s < 0) flipX(og);
    part(eg, og, (x, y, z) => { const u = y / 0.054; return GIN.clone().lerp(DARK, 0.25 + 0.35 * ss(0.5, 1, u)).lerp(LIGHT, 0.3 * hmN3(x * 400, y * 400, z * 400)); }, (x, y) => 0.34 * (1 - 0.6 * (y / 0.054)), () => [0, 1, 0]);
    const ig = earSurf(0.82, 0.0005), ip = ig.attributes.position, ic = new Float32Array(ip.count * 3), SK = lin('#b08a7e'), SKD = lin('#7e5a50'), CAN = lin('#4a2c26');
    for (let i = 0; i < ip.count; i++) { const x = ip.getX(i), y = ip.getY(i), z = ip.getZ(i), u = y / 0.054, j = i % 27, th = (j / 26) * Math.PI, edge = ss(0.42, 0.1, Math.min(th, Math.PI - th));
      const k = SK.clone().lerp(SKD, 0.25 + 0.3 * hmN3(x * 900, y * 900, z * 900) + 0.35 * ss(0.4, 0.8, Math.sin(u * 95)) * ss(0.38, 0.12, u)).lerp(CAN, ss(0.14, 0.0, u) * ss(0.9, 0.2, Math.abs(th - Math.PI / 2))); k.lerp(GIN, edge * 0.9); ic.set([k.r, k.g, k.b], i * 3); }
    ig.setAttribute('color', new THREE.BufferAttribute(ic, 3)); if (s < 0) flipX(ig); eg.add(new THREE.Mesh(ig, skinM));
    const Rf = RNG('earfur' + s), hs = []; for (let k = 0; k < 170; k++) { const u = Rf.r(0.02, 0.55) ** 1.4, side = Rf.f() < 0.65 ? -1 : 1, th = side < 0 ? Rf.r(Math.PI - 1.0, Math.PI - 0.1) : Rf.r(0.12, 0.8), a = 0.021 * Math.pow(1 - u, 0.85) * 0.97, b = 0.0115 * 0.82 * Math.pow(1 - u, 0.7);
      const p0 = [s * a * Math.cos(th), u * 0.054, -b * Math.sin(th) + 0.0012], L = Rf.r(0.005, 0.013) * (1 - u * 0.5), dx = -s * Math.cos(th) * 0.35;
      hs.push(hmTube([p0, [p0[0] + s * dx * L * 0.4, p0[1] + L * 0.4, p0[2] + L * 0.4], [p0[0] + s * dx * L * 0.8, p0[1] + L * 0.7, p0[2] + L * 0.75]], (q) => 0.0002 * (1 - q * 0.8), 8, 3)); }
    eg.add(new THREE.Mesh(hmMerge(hs), furnM)); return eg; });
  // ---- whiskers: four rows from the whisker pads (follicle spots), brow and cheek whiskers
  const wM = STDm({ color: '#e9e3d6', roughness: 0.3 }), dotM = STDm({ color: '#6a3a1e', roughness: 0.7 }), Rw = RNG('whisk2'); C.whisk = [];
  EY.forEach((e) => { const s = e.s, pad = [s * 0.0112, -0.026, 0.056], wg = new THREE.Group(); wg.position.set(...pad); hg.add(wg); C.whisk.push(wg); const ws = [], ds = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4 - (r === 3 ? 1 : 0); c++) { const b = proj([s * (0.004 + c * 0.0036 + r * 0.0008), -0.0205 - r * 0.0029, 0.05], [s * 0.35, 0, 1]).sub(hmV(pad)), L = Rw.r(0.07, 0.1) * (1 - r * 0.08) * (c === 3 ? 0.8 : 1);
      const d0 = new THREE.Vector3(s * 0.85, 0.12 - r * 0.09, 0.45).normalize(), d1 = new THREE.Vector3(s * 0.92, -0.08 - r * 0.12, -0.08).normalize();
      ws.push(hmTube([b, b.clone().addScaledVector(d0, L * 0.45).add(new THREE.Vector3(0, -0.002, 0)), b.clone().addScaledVector(d0, L * 0.45).addScaledVector(d1, L * 0.55)], (u) => 0.00036 * (1 - u * 0.9), 22, 5));
      const dg = new THREE.SphereGeometry(0.0006, 8, 6); dg.translate(b.x, b.y, b.z); ds.push(dg); }
    wg.add(new THREE.Mesh(hmMerge(ws), wM)); wg.add(new THREE.Mesh(hmMerge(ds), dotM));
    const bw = []; for (let k = 0; k < 3; k++) { const b = proj([s * (0.016 + k * 0.004), 0.022, 0.03], [s * 0.2, 0.5, 1]), L = 0.032 + k * 0.006; bw.push(hmTube([b, b.clone().add(new THREE.Vector3(s * L * 0.3, L * 0.55, L * 0.25)), b.clone().add(new THREE.Vector3(s * L * 0.7, L * 0.85, L * 0.1))], (u) => 0.00026 * (1 - u * 0.85), 14, 4)); }
    for (let k = 0; k < 2; k++) { const b = proj([s * 0.045, -0.006 - k * 0.004, 0.0], [s, 0, 0.3]), L = 0.03 + k * 0.006; bw.push(hmTube([b, b.clone().add(new THREE.Vector3(s * L * 0.5, L * 0.12, -L * 0.1)), b.clone().add(new THREE.Vector3(s * L, L * 0.05, -L * 0.3))], (u) => 0.00026 * (1 - u * 0.85), 14, 4)); }
    hg.add(new THREE.Mesh(hmMerge(bw), wM)); });
  // ---- the tail, curled round the near hip on the floor, rings along its length, dark tip
  { const pts = [[-0.03, 0.05, -0.31], [0.06, 0.04, -0.34], [0.16, 0.032, -0.29], [0.2, 0.03, -0.17], [0.205, 0.028, -0.04], [0.18, 0.028, 0.06]].map((a) => new THREE.Vector3(...a)), seg = 80, rs = 20;
    const cur = new THREE.CatmullRomCurve3(pts), g = new THREE.TubeGeometry(cur, seg, 1, rs, false), p = g.attributes.position, U = new Float32Array(p.count), TG = [];
    for (let i = 0; i <= seg; i++) { const u = i / seg, cc = cur.getPointAt(u), r = 0.024 * (1 - 0.3 * u) * (u > 0.93 ? Math.sqrt(1 - ((u - 0.93) / 0.07) ** 2) * 0.9 + 0.1 : 1); TG[i] = cur.getTangentAt(u);
      for (let j = 0; j <= rs; j++) { const k = i * (rs + 1) + j; _v.fromBufferAttribute(p, k).sub(cc).multiplyScalar(r).add(cc); if (_v.y < 0.004) _v.y = 0.004; p.setXYZ(k, _v.x, _v.y, _v.z); U[k] = u; } }
    g.computeVertexNormals(); const piv = new THREE.Group(); piv.position.copy(pts[0]); root.add(piv);
    part(piv, g, (x, y, z, i) => { const u = U[i]; return GIN.clone().lerp(LIGHT, 0.4 * hmN3(x * 70, y * 70, z * 70)).lerp(DARK, (u > 0.9 ? 0.8 : ss(0.2, 0.75, Math.sin(u * TAU * 8)) * 0.72)); }, () => 1.2, (x, y, z, i) => { const t2 = TG[Math.round(U[i] * seg)]; return [t2.x, t2.y, t2.z]; }, pts[0]); C.tail = piv; }
  return C; }
// pose the cat. q: { neckPitch, neckYaw, headRoll, reach, sniff (0..1), paw (0..1 lift), pawReach (m), pawIn, tail, look: world point }
const _hmQ = new THREE.Quaternion(), _hmL = new THREE.Vector3();
function hmPoseCat(C, q, t) { const sn = q.sniff || 0, br = Math.sin(t * 2.5);
  C.body.scale.set(1 + 0.007 * br, 1 + 0.013 * br, 1 + 0.003 * br);
  C.neck.rotation.set((q.neckPitch || 0) + sn * 0.02 * Math.sin(t * 19), q.neckYaw || 0, 0); C.neck.position.set(0, 0.17 - (0.02 * (q.reach || 0)) / 0.06 + 0.0015 * br, 0.16 + (q.reach || 0) + sn * 0.004 * Math.sin(t * 6));
  C.head.rotation.set(-(q.neckPitch || 0) * 0.35 + sn * 0.025 * Math.sin(t * 19 + 1), 0, q.headRoll || 0);
  // sniff: quick nose-leather twitches (inhales in bursts) and whisker pads pushing the whiskers forward
  const burst = Math.max(0, Math.sin(t * 7.5)), tw = sn * burst * Math.max(0, Math.sin(t * 40)); C.nose.scale.set(1 + 0.07 * tw, 1 - 0.05 * tw, 1); C.nose.position.y = -0.0118 + 0.0004 * tw;
  C.whisk.forEach((w, i) => { const s = i ? 1 : -1; w.rotation.set(0.06 * tw, -s * (0.12 * sn + 0.08 * tw), 0); });
  const p = q.paw || 0; C.legR.rotation.set(-0.5 * p, -0.3 * (q.pawIn || 0), 0.1 * p); C.legR.position.set(0.068, 0.048 + 0.03 * p, 0.1 + (q.pawReach || 0));
  C.tail.rotation.y = (q.tail || 0) + 0.06 * Math.sin(t * 1.7); C.ears.forEach((e, i) => { const s = i ? 1 : -1; e.rotation.y = s * (0.4 - 0.1 * sn) + 0.05 * Math.sin(t * 2.3 + i); });
  if (q.look) { C.root.updateMatrixWorld(true); C.eyes.forEach((e) => { _hmL.copy(q.look); e.g.worldToLocal(_hmL).normalize(); e.gz.rotation.set(-clamp(Math.asin(clamp(_hmL.y, -1, 1)), -0.15, 0.15), clamp(Math.atan2(_hmL.x, _hmL.z), -0.2, 0.2), 0); }); } }

// ---- per-shot framing: the sun's shadow box around the action, near/far planes for the scale, which things show
function hmFrame(S, tgt, box, dist, near, far, which) { const st = S.st, k = st.key, c = k.shadow.camera; k.target.position.copy(tgt); k.target.updateMatrixWorld(); k.position.copy(tgt).addScaledVector(HM_SUN, dist);
  Object.assign(c, { left: -box, right: box, top: box, bottom: -box, near: dist * 0.05, far: dist + box * 3 }); c.updateProjectionMatrix(); k.shadow.normalBias = box * 0.0012; k.shadow.bias = -0.0002; k.shadow.radius = 3;
  st.cam.near = near; st.cam.far = far; S.cat.root.visible = which === 'cat'; S.motesBig.visible = which === 'room'; S.motesSmall.visible = which === 'coin';
  S.motesBig.rotation.y = TT * 0.02; S.motesSmall.rotation.y = TT * 0.05; }
const _hv = (x, y, z) => new THREE.Vector3(x, y, z);

// ---- room (0–4): she stands in the sun, looks at her hands; the camera stays at eye height and tilts down as she shrinks
SHOT_FN.room = (lt, dur, t) => { const S = home(), st = S.st, h = HGT(t), gx = 0.15, gz = -0.5;
  const up = EZ.io(seg(lt, 0.45, 1.05)) * (1 - EZ.io(seg(lt, 3.1, 3.7))), tw = Math.sin(lt * 2.2) * 0.25 * up, yawH = 0.18 * Math.sin(lt * 1.4) * up;
  placeGirl(S.girl, gx, 0, gz, h, { yaw: 0.12 + 0.15 * EZ.io(seg(lt, 3.2, 3.9)), armL: [lerp(0.08, 0.95, up), lerp(0.1, 0.32, up), lerp(0.2, 1.75, up), tw], armR: [lerp(0.08, 0.85, up), lerp(0.1, 0.3, up), lerp(0.2, 1.65, up), -tw],
    headPitch: lerp(0.05, 0.42, up) - 0.25 * EZ.io(seg(lt, 3.3, 3.9)), headYaw: yawH, look: [yawH, -0.5 * up], emo: { surprise: 0.3 + 0.6 * up, fear: 0.2 * seg(lt, 2.5, 3.5), open: 0.25 * up } });
  hmFrame(S, _hv(gx, 0.5, gz - 0.6), 3.2, 9, 0.05, 80, 'room');
  const k = (1.6 - h) / 1.2, cam = [lerp(0.55, 0.4, k), 1.56, gz + 0.95 + 1.35 * (1 - k)];
  camPt(st, cam, [gx, h * lerp(0.6, 0.48, k), gz], lerp(48, 40, k), t, 0.35, 3); renderStage(st, 0.95); bloom(0.22); };

// ---- sofa (4–8): low on the floor, the sofa towers; she runs across in front of it, then walks towards it
SHOT_FN.sofa = (lt, dur, t) => { const S = home(), st = S.st, h = HGT(t), t0 = 4, tB = 6.2, gz0 = -1.45;
  const runD = hmTravel(t0, Math.min(t, tB), 1.75), walkD = t > tB ? hmTravel(tB, t, 0.85) : 0, turn = EZ.io(seg(t, tB - 0.15, tB + 0.45));
  const gx = 0.05 - runD, gz = gz0 - walkD, gy = 0.008 * ss(0.03, -0.03, gx), run = 1 - ss(tB - 0.25, tB + 0.15, t), walk = 1 - run;
  placeGirl(S.girl, gx, gy, gz, h, { yaw: lerp(-Math.PI / 2, -Math.PI, turn), run, walk, headYaw: 0.35 * run, headPitch: -0.25 * walk, emo: { surprise: 0.5, open: 0.2 } });
  hmFrame(S, _hv(gx, 0.2, gz - 0.3), 1.6, 8, 0.008, 40, 'sofa');
  const k = EZ.io(seg(lt, 1.7, 2.9)), A = [gx * 0.55 + 0.12, 0.07, -0.55], At = [gx * 0.8 - 0.1, 0.28, -2.2], B = [gx + 0.06, 0.02 + 1.3 * h, gz + 0.22 + 2.6 * h], Bt = [gx - 0.02, 0.0, -2.4];
  camPt(st, mixv(A, B, k), mixv(At, Bt, k), lerp(56, 58, k), t, 0.5, 5); renderStage(st, 1.0); bloom(0.2); };

// ---- cat (8–11): the ginger tabby lowers its head and sniffs her, a paw comes down beside her; she stumbles back
SHOT_FN.cat = (lt, dur, t) => { const S = home(), st = S.st, h = HGT(t), C = S.cat;
  const fwd = hmTravel(8, Math.min(t, 8.8), 0.6), back = EZ.o2(seg(lt, 1.45, 2.4)) * 0.08, gx = 2.4 + fwd - back, gz = 0.6;
  const scared = ss(1.35, 1.65, lt);
  placeGirl(S.girl, gx, 0, gz, h, { yaw: Math.PI / 2 - 0.25 * scared, walk: (1 - ss(0.7, 0.9, lt)) + scared * (1 - ss(2.6, 2.9, lt)), ph: lt < 1.5 ? lt * 6 : -lt * 9, lean: -0.22 * scared, headPitch: -0.45 + 0.15 * scared,
    armL: scared > 0 ? [lerp(0.08, 1.2, scared), 0.45 * scared + 0.1, lerp(0.2, 1.5, scared)] : null, armR: scared > 0 ? [lerp(0.08, 1.0, scared), 0.5 * scared + 0.1, lerp(0.2, 1.7, scared)] : null,
    look: [0, 0.4], emo: { surprise: 0.7 - 0.4 * scared, fear: 0.9 * scared, open: 0.3 + 0.4 * scared } });
  const dip = EZ.io(seg(lt, 0.15, 1.2)) - 0.25 * EZ.io(seg(lt, 1.8, 2.3)), paw = Math.sin(Math.PI * seg(lt, 1.3, 2.05)) ** 0.8, reach = 0.08 * EZ.o2(seg(lt, 1.3, 1.9)) * (1 - EZ.io(seg(lt, 2.5, 3.0)) * 0.5);
  hmPoseCat(C, { neckPitch: 1.0 * dip, reach: 0.06 * dip, neckYaw: 0.08 * Math.sin(lt * 1.3), headRoll: 0.12 * dip, sniff: ss(0.6, 1.0, lt) * (1 - ss(2.6, 3, lt) * 0.5), paw, pawReach: reach, pawIn: reach / 0.08, tail: 0.15 * Math.sin(lt * 2.5), look: _hv(gx, h * 0.8, gz) }, t);
  hmFrame(S, _hv(2.5, 0.1, 0.62), 0.5, 4, 0.004, 30, 'cat');
  const k = EZ.io(seg(lt, 0, 3)), cam = mixv([2.08, 0.05, 0.97], [2.14, 0.04, 0.88], k), tg = mixv([2.5, 0.1, 0.57], [2.44, 0.05, 0.6], k);
  camPt(st, cam, tg, lerp(52, 48, k), t, 0.45, 7); renderStage(st, 1.0); bloom(0.2); };

// ---- coin (11–16): a coin on its edge is a wall; she walks along it, steps up to it and lays a hand on it; the camera pulls back
SHOT_FN.coin = (lt, dur, t) => { const S = home(), st = S.st, h = HGT(t), C = S.coinC, cy = S.coinYaw, n = _hv(Math.sin(cy), 0, Math.cos(cy)), tg = _hv(Math.cos(cy), 0, -Math.sin(cy));
  const tA = 13.6, sAlong = 0.042 - hmTravel(11, Math.min(t, tA), 0.85), toC = t > tA ? Math.min(0.0085, hmTravel(tA, t, 0.7)) : 0, off = 0.0125 - toC, turn = EZ.io(seg(t, tA - 0.2, tA + 0.5)), stop = ss(14.6, 14.9, t);
  const G = C.clone().addScaledVector(tg, sAlong).addScaledVector(n, off), yawWalk = Math.atan2(-tg.x, -tg.z), yawCoin = Math.atan2(-n.x, -n.z);
  const touch = EZ.io(seg(t, 14.75, 15.3));
  placeGirl(S.girl, G.x, 0, G.z, h, { yaw: lerp(yawWalk, yawCoin, turn), walk: 1 - stop, headYaw: 0.5 * (1 - turn) * ss(11.5, 12.5, t), headPitch: -0.35 * turn - 0.15 * touch, armR: touch > 0 ? [lerp(0.1, 1.35, touch), 0.15, lerp(0.2, 0.25, touch)] : null, look: [0, 0.5 * turn], emo: { surprise: 0.6, smile: 0.25 * touch, open: 0.2 } });
  hmFrame(S, C.clone().setY(0.006), 0.07, 0.5, 0.0006, 15, 'coin');
  const k = EZ.io(seg(lt, 2.2, 4.6)), camA = G.clone().addScaledVector(tg, -2.4 * h).addScaledVector(n, 1.5 * h), A = [camA.x, 0.62 * h, camA.z], At = [G.x + tg.x * 0.3 * h - n.x * 0.7 * h, 0.55 * h, G.z + tg.z * 0.3 * h - n.z * 0.7 * h];
  const camB = C.clone().addScaledVector(n, 0.062).addScaledVector(tg, -0.022), B = [camB.x, 0.0045, camB.z], Bt = [C.x + tg.x * 0.004, 0.0105, C.z + tg.z * 0.004];
  camPt(st, mixv(A, B, k), mixv(At, Bt, k), lerp(52, 56, k), t, 0.4, 9); renderStage(st, 1.0); bloom(0.22); };

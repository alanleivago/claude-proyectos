// =====================================================================
//  SET inside — every interior of the story: his apartment (toast at dawn, the Powerball night, the TV warning),
//  a cosy café (100th customer), an office (hired / laid off / the insurance agent), a corner store (scratch card),
//  the lottery press room (cheque / again / Joan Ginther), a TV news studio, and a community food bank (giveaway / it comes back).
//  One THREE.Scene per room, built lazily. Rendered through a small WebGL post chain: MSAA HDR colour, a view-depth pass,
//  a half-res gather depth of field (no halos: background samples cannot spread over a nearer centre), vignette, tone map; core bloom.
//  TV screens are live render targets of other rooms (the draw machine, the studio panel).
// =====================================================================
let IN = null;
const IN_GC = {}, IN_MC = {}, IN_TC = {};
const inCol = (h) => lin(h);
const IN_MUG = [[0, 0], [0.04, 0], [0.042, 0.1], [0.038, 0.1], [0.036, 0.01], [0, 0.01]];
// rounded box (corner bands spherified, smooth normals), uvs in metres
function inRBox(w, h, d, r = 0.02, k = 2) {
  const key = ['rb', w, h, d, r, k].join(); if (IN_GC[key]) return IN_GC[key];
  r = Math.max(1e-4, Math.min(r, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4));
  const n = 2 * k + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n), P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, hs = [w / 2, h / 2, d / 2];
  const v = [0, 0, 0], q = [0, 0, 0], dd = [0, 0, 0], o = [0, 0, 0];
  for (let i = 0; i < P.count; i++) {
    o[0] = P.getX(i); o[1] = P.getY(i); o[2] = P.getZ(i); const fx = N.getX(i), fy = N.getY(i), fz = N.getZ(i);
    for (let a = 0; a < 3; a++) { const id = Math.round((o[a] + 0.5) * n); let x; if (id <= k) x = -hs[a] + r * id / k; else if (id >= n - k) x = hs[a] - r * (n - id) / k; else x = -hs[a] + r + (2 * hs[a] - 2 * r) * (id - k) / (n - 2 * k); v[a] = x; q[a] = clamp(x, -hs[a] + r, hs[a] - r); dd[a] = x - q[a]; }
    const L = Math.hypot(dd[0], dd[1], dd[2]);
    if (L > 1e-9) { P.setXYZ(i, q[0] + dd[0] / L * r, q[1] + dd[1] / L * r, q[2] + dd[2] / L * r); N.setXYZ(i, dd[0] / L, dd[1] / L, dd[2] / L); } else P.setXYZ(i, v[0], v[1], v[2]);
    const px = P.getX(i), py = P.getY(i), pz = P.getZ(i);
    if (Math.abs(fx) > 0.5) U.setXY(i, -pz * Math.sign(fx), py); else if (Math.abs(fy) > 0.5) U.setXY(i, px, -pz * Math.sign(fy)); else U.setXY(i, px * Math.sign(fz), py);
  }
  return (IN_GC[key] = g);
}
const inGeo = (key, mk) => IN_GC[key] || (IN_GC[key] = mk());
// materials: a hex colour or a texture, cached
function inM(col, rough = 0.6, o = {}) {
  const key = JSON.stringify([col, rough, Object.keys(o).map((k) => [k, o[k] && o[k].uuid ? o[k].uuid : o[k]])]);
  if (IN_MC[key]) return IN_MC[key];
  const P = Object.assign({ roughness: rough }, o); if (col) P.color = inCol(col);
  const Cls = P.clearcoat != null || P.sheen != null ? THREE.MeshPhysicalMaterial : THREE.MeshStandardMaterial;
  return (IN_MC[key] = new Cls(P));
}
const inBasic = (col, k = 1, o = {}) => new THREE.MeshBasicMaterial(Object.assign({ color: inCol(col).multiplyScalar(k) }, o));
function inAdd(par, geo, mat, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, cast = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, 'YXZ'); m.castShadow = cast; m.receiveShadow = true; par.add(m); return m; }
const inB = (par, mat, w, h, d, x, y, z, r = 0.01, ry = 0) => inAdd(par, inRBox(w, h, d, r), mat, x, y, z, ry);
const inCyl = (par, mat, rt, rb, h, x, y, z, seg = 28) => inAdd(par, inGeo(['cy', rt, rb, h, seg].join(), () => new THREE.CylinderGeometry(rt, rb, h, seg)), mat, x, y, z);
const inSph = (par, mat, r, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = inAdd(par, inGeo('sph', () => new THREE.SphereGeometry(1, 28, 18)), mat, x, y, z); m.scale.set(r * sx, r * sy, r * sz); return m; };
const inLathe = (key, pts, seg = 40) => inGeo('la' + key, () => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg));
const inPlane = (par, mat, w, h, x, y, z, ry = 0, rx = 0) => inAdd(par, inGeo(['pl', w, h].join(), () => new THREE.PlaneGeometry(w, h)), mat, x, y, z, ry, rx, 0, false);
function inTube(pts, r, seg = 8) { const c = new THREE.CatmullRomCurve3(pts.map((p) => V3(...p))); return new THREE.TubeGeometry(c, Math.max(8, pts.length * 6), r, seg, false); }
// code textures (cached), repeat-wrapped
function inTex(key, draw, w = 256, h = 256, rx = 1, ry = 1, srgb = true) {
  let t = IN_TC[key]; if (!t) { t = IN_TC[key] = g3Tex(draw, w, h, srgb); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; }
  if (rx === 1 && ry === 1) return t; const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); return c;
}
function inGrain(x, w, h, R, n, a, s = 1.6) { for (let k = 0; k < n; k++) { x.fillStyle = R.f() < 0.5 ? `rgba(0,0,0,${R.r(0, a)})` : `rgba(255,255,255,${R.r(0, a)})`; x.fillRect(R.r(0, w), R.r(0, h), s, s); } }
function inBlotch(x, w, h, R, n, a, r0 = 30, r1 = 120) { for (let k = 0; k < n; k++) { const cx = R.r(0, w), cy = R.r(0, h), rr = R.r(r0, r1), g = x.createRadialGradient(cx, cy, 0, cx, cy, rr), v = R.f() < 0.5 ? '0,0,0' : '255,255,255'; g.addColorStop(0, `rgba(${v},${R.r(0, a)})`); g.addColorStop(1, `rgba(${v},0)`); x.fillStyle = g; x.fillRect(0, 0, w, h); } }
const inTexPlaster = () => inTex('plaster', (x, w, h) => { const R = RNG('in-plaster'); x.fillStyle = '#ededed'; x.fillRect(0, 0, w, h); inBlotch(x, w, h, R, 30, 0.05, 20, 90); inGrain(x, w, h, R, 9000, 0.06, 1.2); }, 256, 256);
function inTexWood(key, base, dark, light, planks = 6, w = 512) {
  return inTex('wood' + key, (x) => {
    const R = RNG('in-wood', key), ph = w / planks;
    for (let i = 0; i < planks; i++) {
      const sh = R.r(-0.08, 0.08); x.fillStyle = base; x.fillRect(0, i * ph, w, ph); x.fillStyle = sh > 0 ? `rgba(255,255,255,${sh})` : `rgba(0,0,0,${-sh})`; x.fillRect(0, i * ph, w, ph);
      for (let k = 0; k < 40; k++) { const y = i * ph + R.r(1, ph - 1), amp = R.r(0.5, 3); x.strokeStyle = `rgba(${R.f() < 0.6 ? dark : light},${R.r(0.05, 0.22)})`; x.lineWidth = R.r(0.5, 2); x.beginPath(); x.moveTo(0, y); for (let s = 0; s <= 8; s++) x.lineTo(s * w / 8, y + Math.sin(s * R.r(0.5, 1.4) + k) * amp); x.stroke(); }
      if (R.f() < 0.5) { const kx = R.r(30, w - 30), ky = i * ph + ph / 2, g = x.createRadialGradient(kx, ky, 0, kx, ky, R.r(5, 10)); g.addColorStop(0, `rgba(${dark},0.5)`); g.addColorStop(1, `rgba(${dark},0)`); x.fillStyle = g; x.fillRect(kx - 14, ky - 14, 28, 28); }
      x.fillStyle = `rgba(${dark},0.55)`; x.fillRect(0, i * ph, w, 1.5);
      const jx = R.r(0, w); x.fillRect(jx, i * ph, 1.5, ph);
    }
  }, w, w);
}
const inTexFabric = (key = 'fab') => inTex('fabric' + key, (x, w, h) => { const R = RNG('in-fab', key); x.fillStyle = '#d8d8d8'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 2) { x.fillStyle = `rgba(0,0,0,${R.r(0.02, 0.09)})`; x.fillRect(0, y, w, 1); } for (let xx = 0; xx < w; xx += 2) { x.fillStyle = `rgba(255,255,255,${R.r(0.02, 0.08)})`; x.fillRect(xx, 0, 1, h); } inGrain(x, w, h, R, 4000, 0.1, 1); }, 256, 256);
function inTexTile(key, base, grout, cw, ch, w = 256, h = 256, gw = 2.5, glaze = 0.25) {
  return inTex('tile' + key, (x) => {
    const R = RNG('in-tile', key); x.fillStyle = grout; x.fillRect(0, 0, w, h);
    for (let r = 0; r * ch < h; r++) for (let c = -1; c * cw < w; c++) {
      const x0 = c * cw + (r % 2 ? cw / 2 : 0) + gw / 2, y0 = r * ch + gw / 2, tw = cw - gw, th = ch - gw, g = x.createLinearGradient(x0, y0, x0, y0 + th), v = R.r(-0.04, 0.04);
      g.addColorStop(0, base); g.addColorStop(1, base); x.fillStyle = g; x.beginPath(); x.roundRect(x0, y0, tw, th, 2); x.fill();
      x.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`; x.fillRect(x0, y0, tw, th);
      x.fillStyle = `rgba(255,255,255,${glaze})`; x.fillRect(x0 + 2, y0 + 1.5, tw - 4, 2); x.fillStyle = 'rgba(0,0,0,0.12)'; x.fillRect(x0 + 1, y0 + th - 2, tw - 2, 2);
    }
  }, w, h);
}
// text on a canvas texture; lines: [[text, y (0..1), size px, colour, font weight/family]]
function inTexText(key, w, h, bg, lines, extra) {
  return inTex('txt' + key, (x) => {
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); } else x.clearRect(0, 0, w, h);
    if (extra) extra(x, w, h, 'pre');
    x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach(([s, y, sz, c, f, xx, al]) => { x.font = `${f ?? 'bold'} ${sz}px ${/serif|Georgia/.test(f ?? '') ? '' : 'Helvetica, Arial, sans-serif'}`.replace(/ $/, ''); x.fillStyle = c; x.textAlign = al ?? 'center'; x.fillText(s, (xx ?? 0.5) * w, y * h); });
    if (extra) extra(x, w, h, 'post');
  }, w, h);
}
const inGlowTex = () => inTex('glow', (x, w) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,0.45)'); g.addColorStop(0.55, 'rgba(255,255,255,0.1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); }, 128, 128);
function inGlow(par, col, s, x, y, z, op = 0.5) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: inGlowTex(), color: inCol(col), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: op })); m.position.set(x, y, z); m.scale.set(s, s, 1); par.add(m); return m; }
// leaf: a curved, tapered card (shared geometry), instanced per plant
function inLeafGeo() {
  return inGeo('leaf', () => {
    const g = new THREE.PlaneGeometry(1, 1, 6, 10), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) { const u = P.getX(i), v = P.getY(i) + 0.5, wd = Math.sin(Math.PI * Math.pow(v, 0.8)) * 0.5 * (1 - 0.15 * v); P.setXYZ(i, u * 2 * wd, v, -0.35 * v * v + 0.18 * Math.abs(u * 2 * wd) ** 1.5 * 4 * 0.2); }
    g.computeVertexNormals(); return g;
  });
}
const inTexLeaf = () => inTex('leaftex', (x, w, h) => { const R = RNG('in-leaf'); const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#b8b8b8'); g.addColorStop(0.5, '#f4f4f4'); g.addColorStop(1, '#b8b8b8'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 9; i++) { const y = h * (0.1 + i * 0.1); x.beginPath(); x.moveTo(w / 2, y); x.quadraticCurveTo(w * 0.25, y - 8, 4, y - 22); x.moveTo(w / 2, y); x.quadraticCurveTo(w * 0.75, y - 8, w - 4, y - 22); x.stroke(); } inGrain(x, w, h, R, 1500, 0.08, 1.4); }, 128, 256);
function inPlant(par, x, z, o = {}) {
  const g = new THREE.Group(), R = RNG('in-plant', o.seed ?? x * 7 + z), H = o.h ?? 1.2, y0 = o.y ?? 0; g.position.set(x, y0, z); par.add(g);
  const pr = o.pot ?? 0.17, ph = pr * 1.5;
  inAdd(g, inLathe('pot' + pr, [[0, 0], [pr * 0.72, 0], [pr * 0.8, ph * 0.08], [pr, ph * 0.92], [pr * 1.06, ph * 0.94], [pr * 1.06, ph], [pr * 0.95, ph], [0, ph * 0.9]]), inM(o.potCol ?? '#c4704e', 0.75));
  inAdd(g, inGeo('soil', () => new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2)), inM('#3a2a20', 1), 0, ph * 0.93, 0).scale.setScalar(pr * 0.94);
  const n = o.n ?? 26, im = new THREE.InstancedMesh(inLeafGeo(), inM(null, 0.55, { map: inTexLeaf(), side: THREE.DoubleSide }), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), cA = inCol(o.c0 ?? '#2f5a2a'), cB = inCol(o.c1 ?? '#6f9a45'), cc = new THREE.Color();
  const stems = [];
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + R.n(0.3), hh = ph + H * (0.25 + 0.75 * Math.pow((i + 1) / n, 0.7)) * R.r(0.75, 1), rr = (o.spread ?? 0.22) * H * R.r(0.3, 1) * (1 - 0.4 * i / n);
    const px = Math.cos(a) * rr, pz = Math.sin(a) * rr, s = (o.leaf ?? 0.2) * H * R.r(0.75, 1.15);
    e.set(R.r(-0.9, -0.2), -a + Math.PI / 2, R.n(0.4), 'YXZ'); q.setFromEuler(e); m4.compose(V3(px, hh, pz), q, V3(s * (o.wide ?? 0.9), s, s)); im.setMatrixAt(i, m4);
    cc.copy(cA).lerp(cB, R.r(0, 1)); im.setColorAt(i, cc);
    stems.push([[0, ph * 0.9, 0], [px * 0.4, lerp(ph, hh, 0.6), pz * 0.4], [px, hh, pz]]);
  }
  im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; g.add(im);
  const sm = inM('#4a6a30', 0.7); stems.forEach((p) => inAdd(g, inTube(p, 0.004 * (o.stem ?? 1), 5), sm));
  return g;
}
// picture frame with code-drawn art
function inFrame(par, w, h, x, y, z, ry, art, frameCol = '#2a2420') {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g);
  inB(g, inM(frameCol, 0.5), w, h, 0.03, 0, 0, 0, 0.006);
  inPlane(g, inM('#f4efe6', 0.9), w - 0.04, h - 0.04, 0, 0, 0.0155);
  inPlane(g, inM(null, 0.8, { map: art }), w - 0.12, h - 0.12, 0, 0, 0.016);
  return g;
}
function inTexArt(key, pal) {
  return inTex('art' + key, (x, w, h) => {
    const R = RNG('in-art', key); x.fillStyle = pal[0]; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) { x.fillStyle = pal[1 + (i % (pal.length - 1))]; x.globalAlpha = R.r(0.6, 1); x.beginPath(); if (R.f() < 0.5) x.arc(R.r(0.15, 0.85) * w, R.r(0.15, 0.85) * h, R.r(0.08, 0.3) * w, 0, TAU); else x.ellipse(R.r(0.2, 0.8) * w, R.r(0.2, 0.8) * h, R.r(0.1, 0.4) * w, R.r(0.05, 0.2) * h, R.r(0, 3), 0, TAU); x.fill(); }
    x.globalAlpha = 1; inGrain(x, w, h, R, 3000, 0.07, 1.5);
  }, 256, 320);
}
// a soft PMREM environment from a few emissive panels
function inEnv(r, base, panels) {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(20, 8, 20), new THREE.MeshBasicMaterial({ color: inCol(base), side: THREE.BackSide })));
  panels.forEach(([c, k, x, y, z, w, h, rx = 0, ry = 0]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: inCol(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.add(m); });
  const pm = new THREE.PMREMGenerator(r), rt = pm.fromScene(s, 0.04); pm.dispose(); return rt.texture;
}
function inKey(S, col, I, pos, tgt, size = 4, far = 30) {
  const k = new THREE.DirectionalLight(inCol(col), I); k.position.set(...pos); k.target.position.set(...tgt); k.castShadow = true;
  k.shadow.mapSize.set(2048, 2048); k.shadow.radius = 8; k.shadow.blurSamples = 16; k.shadow.bias = -0.0005; k.shadow.normalBias = 0.01;
  Object.assign(k.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 0.5, far }); S.add(k, k.target); return k;
}
function inPt(S, col, I, x, y, z, dist = 6, decay = 2) { const p = new THREE.PointLight(inCol(col), I, dist, decay); p.position.set(x, y, z); S.add(p); return p; }
// motes / confetti: points that drift
function inMotes(S, n, box, col, size, seed) {
  const R = RNG('in-motes', seed), pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([R.r(box[0], box[1]), R.r(box[2], box[3]), R.r(box[4], box[5]), R.r(0, TAU), R.r(0.03, 0.09)]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: inGlowTex(), color: inCol(col), size, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.userData = { base, box }; S.add(m); return m;
}
function inMotesAt(m, t) { const a = m.geometry.attributes.position, bx = m.userData.box; m.userData.base.forEach(([x, y, z, ph, sp], i) => a.setXYZ(i, x + 0.06 * Math.sin(t * 0.3 + ph), bx[2] + (((y - bx[2]) + t * sp) % (bx[3] - bx[2])), z + 0.05 * Math.cos(t * 0.23 + ph * 1.7))); a.needsUpdate = true; }

// ---------- post: MSAA HDR colour -> view depth -> half-res gather DoF -> composite (vignette, tone map) -> 2D bloom
function inPost(r) {
  if (IN.post) return IN.post;
  const P = {};
  P.rtC = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  P.rtZ = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
  P.rtH = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
  P.rtB = new THREE.WebGLRenderTarget(W / 2, H / 2, { type: THREE.HalfFloatType });
  P.zmat = new THREE.ShaderMaterial({
    vertexShader: '#include <common>\n#include <skinning_pars_vertex>\nvarying float vZ;\nvoid main(){\n#include <skinbase_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\n#include <project_vertex>\nvZ = -mvPosition.z;\n}',
    fragmentShader: 'varying float vZ; void main(){ gl_FragColor = vec4(vZ, 0.0, 0.0, 1.0); }',
  });
  const vs = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  P.copy = new THREE.ShaderMaterial({ uniforms: { tC: { value: null } }, vertexShader: vs, fragmentShader: 'uniform sampler2D tC; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tC, vUv); }', depthTest: false, depthWrite: false, toneMapped: false });
  P.blur = new THREE.ShaderMaterial({
    uniforms: { tC: { value: null }, tZ: { value: null }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, fd: { value: 3 }, ap: { value: 0 }, mx: { value: 20 }, nk: { value: 1 } },
    vertexShader: vs, depthTest: false, depthWrite: false, toneMapped: false,
    fragmentShader: `uniform sampler2D tC, tZ; uniform vec2 px; uniform float fd, ap, mx, nk; varying vec2 vUv;
      float zz(vec2 uv){ float z = texture2D(tZ, uv).r; return z <= 0.0 ? 1000.0 : z; }
      float coc(float z){ float c = ap * (z - fd) / z; return clamp(c < 0.0 ? -c * nk : c, 0.0, mx); }
      void main(){
        float zc = zz(vUv), cc = coc(zc);
        vec3 acc = texture2D(tC, vUv).rgb; float ws = 1.0, nw = 0.0;
        for (int i = 0; i < 56; i++) {
          float fi = float(i) + 0.5, r = sqrt(fi / 56.0) * mx, a = fi * 2.39996323;
          vec2 uv = vUv + vec2(cos(a), sin(a)) * r * px;
          float zs = zz(uv), cs = coc(zs), ce = zs > zc ? min(cs, cc) : cs;
          float w = clamp(ce - r + 1.0, 0.0, 1.0) / max(ce * ce, 4.0) * 16.0;
          acc += texture2D(tC, uv).rgb * w; ws += w; if (zs < zc - 0.03 && cs > cc) nw += w;
        }
        gl_FragColor = vec4(acc / ws, max(smoothstep(0.6, 2.6, cc), clamp(nw / ws * 2.0, 0.0, 1.0)));
      }`,
  });
  P.fin = new THREE.ShaderMaterial({
    uniforms: { tC: { value: null }, tB: { value: null }, useB: { value: 0 }, vig: { value: 0.35 }, lift: { value: new THREE.Vector3(0, 0, 0) } },
    vertexShader: vs, depthTest: false, depthWrite: false,
    fragmentShader: `uniform sampler2D tC, tB; uniform float useB, vig; uniform vec3 lift; varying vec2 vUv;
      void main(){
        vec3 c = texture2D(tC, vUv).rgb;
        if (useB > 0.5) { vec4 b = texture2D(tB, vUv); c = mix(c, b.rgb, b.a); }
        vec2 d = (vUv - vec2(0.5, 0.48)) * vec2(1.0, 0.62); c *= 1.0 - vig * smoothstep(0.18, 0.62, length(d) * 1.2);
        c += lift;
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
  P.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), P.copy); P.quad.frustumCulled = false;
  P.qs = new THREE.Scene(); P.qs.add(P.quad); P.qc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return (IN.post = P);
}
function inQuad(r, P, mat, target) { P.quad.material = mat; r.setRenderTarget(target); r.render(P.qs, P.qc); }
// o: { exp, bloom, vig, dof: { fd, ap (px of blur at infinity), mx, nk } }
function inPresent(g, S, o = {}) {
  const r = g.r, P = inPost(r), exp0 = r.toneMappingExposure, ac = r.autoClear;
  r.toneMappingExposure = o.exp ?? 1; r.autoClear = true;
  const near0 = g.cam.near; g.cam.near = 0.12; g.cam.updateProjectionMatrix();   // the MSAA target has a 16-bit depth buffer
  r.setClearColor(inCol(o.clear ?? '#000000'), 1);
  r.setRenderTarget(P.rtC); r.clear(); r.render(S, g.cam);
  const dof = o.dof;
  if (dof) {
    const hid = []; S.traverse((ob) => { if (ob.visible && (ob.isSprite || ob.isPoints || (ob.material && ob.material.transparent && !ob.userData.zOK))) { ob.visible = false; hid.push(ob); } });
    const fog = S.fog; S.fog = null; S.overrideMaterial = P.zmat; r.shadowMap.autoUpdate = false;
    r.setClearColor(0x000000, 1); r.setRenderTarget(P.rtZ); r.clear(); r.render(S, g.cam);
    S.overrideMaterial = null; S.fog = fog; r.shadowMap.autoUpdate = true; hid.forEach((ob) => { ob.visible = true; });
    P.copy.uniforms.tC.value = P.rtC.texture; inQuad(r, P, P.copy, P.rtH);
    const u = P.blur.uniforms; u.tC.value = P.rtH.texture; u.tZ.value = P.rtZ.texture; u.fd.value = dof.fd; u.ap.value = dof.ap ?? 14; u.mx.value = dof.mx ?? 22; u.nk.value = dof.nk ?? 1;
    inQuad(r, P, P.blur, P.rtB);
  }
  const f = P.fin.uniforms; f.tC.value = P.rtC.texture; f.tB.value = P.rtB.texture; f.useB.value = dof ? 1 : 0; f.vig.value = o.vig ?? 0.32; f.lift.value.set(...(o.lift ?? [0.0, 0.0, 0.0]));
  inQuad(r, P, P.fin, null);
  r.toneMappingExposure = exp0; r.autoClear = ac; g.cam.near = near0; g.cam.updateProjectionMatrix();
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
  bloom(o.bloom ?? 0.22);
}
// render a room to a texture (TV screens): linear HDR, no tone map
function inRT(key, w = 640, h = 360) { IN.rt = IN.rt || {}; return IN.rt[key] || (IN.rt[key] = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 2 })); }
function inRenderTo(g, S, cam, rt) { const r = g.r; r.setRenderTarget(rt); r.setClearColor(0x000000, 1); r.clear(); r.render(S, cam); r.setRenderTarget(null); }

// ---------- the hero helpers
function inHero(S, o) { const c = chPose(o); S.add(c.root); c.root.updateMatrixWorld(true); return c; }
// pose the hero so one hand (grip) lands on a target point: bend at the spine for height, then slide the feet in x/z
function inHeroReach(S, o, side, tgt, bendK = 70) {
  let c = inHero(S, o), gp = inGripW(side);
  const add = Object.assign({}, o.add || {}); const sp = add.spine ? [...add.spine] : [0, 0, 0]; sp[0] += clamp((gp.y - tgt.y) * bendK, -10, 35); add.spine = sp;
  c = inHero(S, Object.assign({}, o, { add })); gp = inGripW(side);
  const pos = [o.pos[0] + tgt.x - gp.x, o.pos[1], o.pos[2] + tgt.z - gp.z];
  return inHero(S, Object.assign({}, o, { add, pos }));
}
const inGripW = (side) => CH.arms[side].grip.getWorldPosition(V3(0, 0, 0));
const inWristQ = (side) => CH.arms[side].wr.getWorldQuaternion(new THREE.Quaternion());
const inHeadW = () => CH.head.getWorldPosition(V3(0, 0, 0));

// =====================================================================
//  ROOM: the apartment (kitchen + living room). Morning (toast) and night (Powerball, the TV warning).
// =====================================================================
function inApt(g) {
  const R = IN.rooms; if (R.apt) return R.apt;
  const S = new THREE.Scene(), A = R.apt = { S };
  const plaster = inTexPlaster(), wallM = inM('#efe2cf', 0.92, { map: plaster }), wallM2 = inM('#c9d6cf', 0.92, { map: plaster });
  // floor + walls (walls are boxes so the window cuts real light)
  const fl = inPlane(S, inM(null, 0.42, { map: inTexWood('oak', '#b07a4c', '70,40,20', '235,190,140', 6, 512), envMapIntensity: 0.5 }), 8, 6.4, 0.1, 0, -0.2, 0, -Math.PI / 2); fl.receiveShadow = true;
  fl.material.map.repeat.set(4, 6); fl.material.map.rotation = Math.PI / 2;
  const WY = 2.75, WZ = -2.62;
  const wallPiece = (w, h, x, y) => { const m = inB(S, wallM, w, h, 0.16, x, y, WZ - 0.08, 0.005); return m; };
  wallPiece(1.75, WY, -2.55, WY / 2); wallPiece(5.2, WY, 1.8, WY / 2);   // left of / right of the window (window x -1.68 .. -0.6)
  wallPiece(1.08, 1.05, -1.14, 0.525); wallPiece(1.08, WY - 2.25, -1.14, (2.25 + WY) / 2);
  inB(S, wallM2, 0.16, WY, 6.4, -3.5, WY / 2, -0.2, 0.005); inB(S, wallM, 0.16, WY, 6.4, 4.45, WY / 2, -0.2, 0.005); inB(S, wallM, 8.2, WY, 0.16, 0.5, WY / 2, 3.1, 0.005);
  inPlane(S, inM('#f4efe6', 0.95), 8.2, 6.4, 0.5, WY, -0.2, 0, Math.PI / 2).castShadow = true;
  inB(S, inM('#f2eee6', 0.5), 7.9, 0.1, 0.02, 0.5, 0.05, WZ + 0.01, 0.004);
  // window: frame, sill, sky
  const winX = -1.14, winY = 1.65;
  A.sky = inTexSky('morning'); A.skyN = inTexSky('night');
  A.skyM = inBasic('#ffffff', 1.6, { map: A.sky });
  inPlane(S, A.skyM, 1.5, 1.5, winX, winY, WZ - 0.5);
  const fr = inM('#f6f3ec', 0.4);
  [[1.12, 0.06, winX, 2.22], [1.12, 0.06, winX, 1.08], [0.06, 1.2, -1.68, winY], [0.06, 1.2, -0.6, winY], [0.035, 1.12, winX, winY]].forEach(([w, h, x, y]) => inB(S, fr, w, h, 0.07, x, y, WZ - 0.02, 0.008));
  inB(S, fr, 1.2, 0.035, 0.12, winX, 1.06, WZ + 0.05, 0.01);
  // kitchen: base cabinets, counter, backsplash, uppers
  const cab = inM('#8fae95', 0.45, { envMapIntensity: 0.6 }), brass = inM('#d6ad62', 0.28, { metalness: 1 });
  A.counterTop = inM(null, 0.35, { map: inTexWood('butcher', '#c08a58', '90,55,25', '240,200,150', 10, 256), envMapIntensity: 0.5 });
  for (let i = 0; i < 6; i++) { const x = -2.42 + i * 0.5; if (i === 2 || i === 3) { inB(S, cab, 0.48, 0.74, 0.04, x, 0.47, -2.0, 0.012); } else { inB(S, cab, 0.48, 0.2, 0.04, x, 0.75, -2.0, 0.01); inB(S, cab, 0.48, 0.52, 0.04, x, 0.36, -2.0, 0.012); inB(S, brass, 0.16, 0.014, 0.02, x, 0.79, -1.97, 0.006); } inB(S, brass, 0.014, 0.12, 0.02, x + 0.18, 0.55, -1.97, 0.006); }
  inB(S, inM('#5d7564', 0.6), 3.0, 0.1, 0.56, -1.17, 0.05, -2.3, 0.01);
  inB(S, cab, 3.05, 0.8, 0.56, -1.17, 0.48, -2.31, 0.01);
  inB(S, A.counterTop, 3.1, 0.045, 0.66, -1.17, 0.9, -2.28, 0.01);
  const tileT = inTexTile('subway', '#f4f1ea', '#cfc8bc', 64, 32, 256, 256, 3, 0.35);
  const tileMap = tileT.clone(); tileMap.needsUpdate = true; tileMap.repeat.set(10, 2.4); const tileM = inM(null, 0.18, { map: tileMap, envMapIntensity: 0.9 });
  inPlane(S, tileM, 3.1, 0.62, -1.17, 1.24, WZ + 0.01).receiveShadow = true;
  [[-2.35, 0.85], [0.06, 0.95]].forEach(([x, w]) => { inB(S, cab, w, 0.7, 0.34, x, 1.95, -2.44, 0.012); for (let k = 0; k < Math.round(w / 0.42); k++) inB(S, brass, 0.012, 0.1, 0.02, x - w / 2 + 0.42 * k + (k % 2 ? 0.05 : 0.37), 1.7, -2.26, 0.005); });
  // sink + faucet
  inB(S, inM('#cfd3d6', 0.25, { metalness: 0.8 }), 0.62, 0.012, 0.4, winX, 0.925, -2.3, 0.006);
  inB(S, inM('#55595c', 0.4, { metalness: 0.6 }), 0.54, 0.01, 0.32, winX, 0.93, -2.3, 0.004);
  inAdd(S, inTube([[winX, 0.92, -2.52], [winX, 1.2, -2.52], [winX, 1.27, -2.42], [winX, 1.2, -2.32]], 0.013, 10), inM('#e8e8e8', 0.12, { metalness: 1 }));
  // fridge (retro cream), stove, toaster, kettle, fruit, crock, plants on the sill
  inB(S, inM('#efe6cf', 0.3, { clearcoat: 0.6, clearcoatRoughness: 0.2 }), 0.76, 1.8, 0.7, -3.0, 0.9, -2.22, 0.08);
  inB(S, inM('#dcd3bd', 0.3), 0.74, 0.012, 0.02, -3.0, 1.22, -1.86, 0.004);
  inB(S, inM('#d8d8d8', 0.15, { metalness: 1 }), 0.03, 0.42, 0.04, -2.7, 1.5, -1.84, 0.012); inB(S, inM('#d8d8d8', 0.15, { metalness: 1 }), 0.03, 0.3, 0.04, -2.7, 0.95, -1.84, 0.012);
  [[-2.25, -2.15], [-2.0, -2.38]].forEach(([x, z], i) => inAdd(S, inGeo('burner', () => new THREE.TorusGeometry(0.07, 0.01, 8, 24).rotateX(Math.PI / 2)), inM('#202020', 0.5), x, 0.93, z));
  const ket = new THREE.Group(); ket.position.set(-2.22, 0.925, -2.18); S.add(ket);
  inAdd(ket, inLathe('kettle', [[0, 0], [0.09, 0], [0.105, 0.04], [0.1, 0.12], [0.06, 0.17], [0.025, 0.19], [0, 0.2]]), inM('#c8402e', 0.22, { clearcoat: 0.8 }));
  inAdd(ket, inTube([[-0.07, 0.15, 0], [0, 0.26, 0], [0.07, 0.15, 0]], 0.009, 6), inM('#222', 0.4)); inAdd(ket, inTube([[0.08, 0.06, 0], [0.15, 0.13, 0], [0.17, 0.16, 0]], 0.012, 8), inM('#c8402e', 0.22));
  A.ket = ket;
  const toaster = new THREE.Group(); toaster.position.set(0.12, 0.925, -2.25); toaster.rotation.y = -0.2; S.add(toaster);
  inB(toaster, inM('#9ccbc0', 0.25, { clearcoat: 0.8, clearcoatRoughness: 0.15 }), 0.28, 0.19, 0.17, 0, 0.095, 0, 0.05);
  [-0.035, 0.035].forEach((z) => inB(toaster, inM('#1d1d1d', 0.6), 0.2, 0.01, 0.028, 0, 0.19, z, 0.005));
  inB(toaster, inM('#e8e8e8', 0.15, { metalness: 1 }), 0.04, 0.02, 0.02, 0.15, 0.13, 0, 0.006);
  const bowl = new THREE.Group(); bowl.position.set(-0.45, 0.925, -2.2); S.add(bowl);
  inAdd(bowl, inLathe('bowl', [[0, 0], [0.08, 0], [0.15, 0.06], [0.16, 0.075], [0.15, 0.075], [0.07, 0.015], [0, 0.015]]), inM('#efe9de', 0.3, { side: THREE.DoubleSide }));
  [[0, 0.07, 0, '#f08a24', 0.045], [0.06, 0.07, 0.03, '#f29a2a', 0.042], [-0.05, 0.075, 0.03, '#e8c43a', 0.04], [0.02, 0.105, -0.03, '#b8d04a', 0.04], [-0.04, 0.07, -0.05, '#d23a2a', 0.04]].forEach(([x, y, z, c, r]) => inSph(bowl, inM(c, 0.45), r, x, y, z));
  const crock = new THREE.Group(); crock.position.set(-1.9, 0.925, -2.42); S.add(crock);
  inAdd(crock, inLathe('crock', [[0, 0], [0.06, 0], [0.065, 0.15], [0.07, 0.16], [0, 0.155]]), inM('#3d5a8a', 0.3, { clearcoat: 0.6 }));
  [[0.02, 0.2], [-0.02, -0.15], [0.0, 0.05]].forEach(([dx, a]) => inAdd(crock, inTube([[dx, 0.05, 0], [dx + Math.sin(a) * 0.1, 0.3, 0.01]], 0.007, 5), inM('#c8955a', 0.6)));
  inPlant(S, -1.45, -2.52, { y: 1.09, h: 0.25, pot: 0.055, n: 10, leaf: 0.35, seed: 3, potCol: '#e8e0d0' });
  inPlant(S, -0.85, -2.52, { y: 1.09, h: 0.2, pot: 0.05, n: 9, leaf: 0.4, seed: 4, c0: '#3a6a30', c1: '#8ab85a' });
  inB(S, inM('#7a5a3a', 0.5), 0.38, 0.02, 0.26, -0.55, 0.935, -2.32, 0.008).rotation.y = 0.15;   // cutting board
  // mugs on a shelf above the counter (open shelf)
  inB(S, A.counterTop, 0.95, 0.035, 0.22, 0.06, 1.52, -2.5, 0.008);
  [['#e0b040', -0.25], ['#5a8ac8', -0.05], ['#e8e2d6', 0.15], ['#c85a4a', 0.33]].forEach(([c, x]) => { const mg = new THREE.Group(); mg.position.set(x, 1.538, -2.48); S.add(mg); inAdd(mg, inLathe('mug', IN_MUG), inM(c, 0.3, { side: THREE.DoubleSide })); inAdd(mg, inGeo('mugH', () => new THREE.TorusGeometry(0.025, 0.007, 6, 14, Math.PI)), inM(c, 0.3), 0.04, 0.05, 0, 0, 0, -Math.PI / 2); });
  // living: sofa, rug, coffee table, media console, TV, lamp, bookshelf, plant, frames
  const sofaM = inM('#b8664a', 0.85, { map: inTexFabric('sofa'), sheen: 0.6, sheenRoughness: 0.5, sheenColor: inCol('#ffc0a0') });
  const sofa = new THREE.Group(); sofa.position.set(2.2, 0, 0.7); S.add(sofa); A.sofa = sofa;
  inB(sofa, sofaM, 2.1, 0.32, 0.9, 0, 0.26, 0, 0.08); inB(sofa, sofaM, 2.1, 0.5, 0.26, 0, 0.62, 0.34, 0.1);
  [-0.96, 0.96].forEach((x) => inB(sofa, sofaM, 0.2, 0.62, 0.92, x, 0.4, 0, 0.09));
  [-0.43, 0.43].forEach((x) => { inB(sofa, sofaM, 0.84, 0.14, 0.7, x, 0.48, -0.06, 0.06); inB(sofa, sofaM, 0.82, 0.42, 0.18, x, 0.74, 0.2, 0.08).rotation.x = -0.12; });
  inB(sofa, inM('#e8c050', 0.85, { map: inTexFabric('pillow') }), 0.36, 0.34, 0.12, -0.6, 0.72, 0.08, 0.06).rotation.set(-0.25, 0.3, 0.1);
  [-0.9, 0.9].forEach((x) => [-0.35, 0.35].forEach((z) => inCyl(sofa, inM('#3a2a1e', 0.5), 0.022, 0.016, 0.1, x, 0.05, z, 10)));
  const rug = inPlane(S, inM(null, 1, { map: inTexRug() }), 2.6, 1.8, 2.15, 0.004, -0.6, 0, -Math.PI / 2); rug.receiveShadow = true;
  const ct = new THREE.Group(); ct.position.set(2.15, 0, -0.55); S.add(ct);
  inB(ct, inM(null, 0.35, { map: inTexWood('walnut', '#6a4228', '35,20,10', '160,110,70', 5, 256), clearcoat: 0.5, clearcoatRoughness: 0.25 }), 1.1, 0.04, 0.55, 0, 0.42, 0, 0.015);
  [[-0.48, -0.22], [0.48, -0.22], [-0.48, 0.22], [0.48, 0.22]].forEach(([x, z]) => inCyl(ct, inM('#3a2a1e', 0.5), 0.018, 0.014, 0.4, x, 0.2, z, 10));
  A.ctTop = ct;
  inB(S, inM(null, 0.4, { map: inTexWood('walnut', '#6a4228', '35,20,10', '160,110,70', 5, 256) }), 1.8, 0.48, 0.42, 2.25, 0.26, -2.33, 0.02);
  [-0.6, 0, 0.6].forEach((x) => inB(S, inM('#5a3a24', 0.45), 0.56, 0.4, 0.02, 2.25 + x, 0.27, -2.11, 0.01));
  const tv = new THREE.Group(); tv.position.set(2.25, 1.22, -2.4); S.add(tv); A.tv = tv;
  inB(tv, inM('#121212', 0.3, { metalness: 0.4 }), 1.36, 0.79, 0.05, 0, 0, 0, 0.01);
  A.tvScreen = inPlane(tv, inBasic('#ffffff', 1), 1.31, 0.74, 0, 0, 0.026); A.tvScreen.castShadow = false;
  inB(tv, inM('#202020', 0.4), 0.3, 0.02, 0.18, 0, -0.73, 0.04, 0.008); inB(tv, inM('#202020', 0.4), 0.04, 0.32, 0.03, 0, -0.56, 0.0, 0.008);
  inPlant(S, 3.85, -2.1, { h: 1.6, pot: 0.2, n: 34, leaf: 0.17, wide: 1.25, seed: 9, potCol: '#d9d2c4', c0: '#24452a', c1: '#5c8a42' });
  inPlant(S, 1.15, -2.3, { h: 0.55, pot: 0.12, n: 16, leaf: 0.3, seed: 12, c0: '#2d5a30', c1: '#7ab050' });
  // floor lamp (arc), bookshelf, frames, ceiling pendant
  const lamp = new THREE.Group(); lamp.position.set(3.55, 0, 0.9); S.add(lamp);
  inCyl(lamp, inM('#2a2a2a', 0.4, { metalness: 0.6 }), 0.16, 0.18, 0.04, 0, 0.02, 0);
  inAdd(lamp, inTube([[0, 0.02, 0], [0, 1.2, 0], [-0.2, 1.75, -0.2], [-0.55, 1.8, -0.55]], 0.012, 6), inM('#2a2a2a', 0.4, { metalness: 0.6 }));
  inAdd(lamp, inLathe('shade', [[0.02, 0.1], [0.08, 0.08], [0.17, -0.06], [0.175, -0.07]]), inM('#f1e6cc', 0.8, { side: THREE.DoubleSide, emissive: inCol('#ffcf8a'), emissiveIntensity: 0.25 }), -0.6, 1.72, -0.6);
  A.lampBulb = inSph(lamp, inBasic('#fff0d0', 4), 0.04, -0.6, 1.68, -0.6); A.lampGlow = inGlow(lamp, '#ffc27a', 0.9, -0.6, 1.62, -0.6, 0.35);
  const shelf = new THREE.Group(); shelf.position.set(4.25, 0, -0.6); shelf.rotation.y = -Math.PI / 2; S.add(shelf);
  const sw = inM(null, 0.5, { map: inTexWood('shelf', '#d8b48a', '110,70,40', '250,220,180', 5, 256) });
  [0, 0.45, 0.9, 1.35, 1.8].forEach((y) => inB(shelf, sw, 1.2, 0.03, 0.3, 0, y + 0.03, 0, 0.006)); [-0.6, 0.6].forEach((x) => inB(shelf, sw, 0.03, 1.85, 0.3, x, 0.925, 0, 0.006));
  inBooks(shelf, [0.06, 0.51, 0.96, 1.41], 1.1, 'apt');
  inFrame(S, 0.6, 0.8, 0.85, 1.65, WZ + 0.03, 0, inTexArt('a1', ['#f1e4cc', '#e07a4a', '#2f5d62', '#e8b04a']));
  inFrame(S, 0.5, 0.5, 3.4, 1.85, WZ + 0.03, 0, inTexArt('a2', ['#24364a', '#e8c46a', '#d06a4a', '#8ab0a8']), '#c8a46a');
  inFrame(S, 0.42, 0.56, 3.4, 1.15, WZ + 0.03, 0, inTexArt('a3', ['#e8dccc', '#3a5a4a', '#c86a4a']), '#f0ece4');
  const pend = new THREE.Group(); pend.position.set(-1.0, 2.75, -1.0); S.add(pend);
  inAdd(pend, inTube([[0, 0, 0], [0, -0.7, 0]], 0.004, 4), inM('#222', 0.5));
  inAdd(pend, inLathe('pend', [[0.02, -0.7], [0.05, -0.72], [0.17, -0.9], [0.18, -0.92]]), inM('#2f4a3a', 0.35, { side: THREE.DoubleSide, metalness: 0.3 }));
  A.pendBulb = inSph(pend, inBasic('#fff0d0', 3), 0.035, 0, -0.88, 0);
  // dining table + chairs (foreground for the toast shots)
  const dt = new THREE.Group(); dt.position.set(-2.3, 0, 0.55); S.add(dt);
  inAdd(dt, inGeo('dtop', () => new THREE.CylinderGeometry(0.55, 0.55, 0.04, 48)), inM(null, 0.35, { map: inTexWood('walnut', '#6a4228', '35,20,10', '160,110,70', 5, 256), clearcoat: 0.4 }), 0, 0.75, 0);
  inCyl(dt, inM('#2a2420', 0.4), 0.05, 0.05, 0.72, 0, 0.37, 0, 14); inCyl(dt, inM('#2a2420', 0.4), 0.25, 0.28, 0.03, 0, 0.015, 0, 24);
  // the toast props
  A.plate = new THREE.Group(); S.add(A.plate);
  inAdd(A.plate, inLathe('plate', [[0, 0], [0.09, 0], [0.11, 0.008], [0.125, 0.018], [0.12, 0.02], [0.1, 0.012], [0, 0.008]]), inM('#f6f3ee', 0.2, { clearcoat: 0.6 }));
  A.toast = inToast(); A.toast.scale.setScalar(1.45); S.add(A.toast);
  A.toastGlint = inGlint(S);
  // lights
  A.env = inEnv(g.r, '#3a2e26', [['#fff2dc', 3, -1.1, 1.6, -4, 2, 2], ['#ffe7c8', 0.5, 2, 3.9, 0, 6, 3, Math.PI / 2], ['#c9d8e8', 0.4, 4, 1.5, 0, 3, 2, 0, Math.PI / 2]]);
  A.envN = inEnv(g.r, '#10141f', [['#9ab8ff', 2.0, 2.25, 1.2, -4, 1.4, 0.8], ['#ffb46a', 0.6, 3.5, 1.8, 1, 0.6, 0.6], ['#6a88d0', 0.6, -1, 1.6, -4, 1.2, 1.2]]);
  A.sun = inKey(S, '#ffdcaa', 7, [-4.8, 6.8, -7.8], [-1.2, 1.7, -2.62], 4.2);
  A.hemi = new THREE.HemisphereLight(inCol('#e9eef6'), inCol('#a07a58'), 0.85); S.add(A.hemi);
  A.fill = inPt(S, '#ffe6c8', 1.2, 0.8, 2.3, 1.6, 9, 1.5);
  A.bounce = inPt(S, '#ffd7a8', 0.9, -0.9, 0.3, -1.2, 3.5, 2);
  A.tvLight = new THREE.SpotLight(inCol('#9cc0ff'), 0, 7, 0.9, 0.9, 1.6); A.tvLight.position.set(2.25, 1.25, -2.2); A.tvLight.target.position.set(2.0, 0.9, 1.0); A.tvLight.castShadow = true; A.tvLight.shadow.mapSize.set(1024, 1024); A.tvLight.shadow.radius = 6; A.tvLight.shadow.bias = -0.0005; S.add(A.tvLight, A.tvLight.target);
  A.lampLight = inPt(S, '#ffb870', 0, 2.95, 1.6, 0.3, 4, 2);
  A.moon = new THREE.DirectionalLight(inCol('#7a98ff'), 0); A.moon.position.set(-3, 3, -6); S.add(A.moon);
  A.pendLight = inPt(S, '#ffd8a0', 0, -1.0, 1.75, -1.0, 4, 1.6);
  // god rays through the window + dust
  A.beam = inBeam(S, [-1.66, 2.2, -2.6], [-0.82, 1.6, -2.6], [1.65, -2.35, 2.37], '#ffe2b0', 0.045);
  A.motes = inMotes(S, 140, [-1.7, -0.2, 0.5, 2.2, -2.5, -0.7], '#ffe8c0', 0.012, 'apt');
  return A;
}
function inBooks(par, ys, wd, seed) {
  const R = RNG('in-books', seed), pal = ['#c84a3a', '#2f5a7a', '#e8c46a', '#3a6a4a', '#e8e0d0', '#7a3a5a', '#d87a3a', '#2a2a3a', '#8ab0c0'];
  const list = []; ys.forEach((y) => { let x = -wd / 2; while (x < wd / 2 - 0.05) { if (R.f() < 0.12) { x += R.r(0.08, 0.2); continue; } const w = R.r(0.022, 0.045), h = R.r(0.2, 0.32); list.push([x + w / 2, y + h / 2, w, h, R.pick(pal), R.n(0.04)]); x += w + 0.003; } });
  const im = new THREE.InstancedMesh(inRBox(1, 1, 1, 0.08), inM(null, 0.7, { map: inTex('bookspine', (x, w, h) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, h * 0.12, w, 3); x.fillRect(0, h * 0.85, w, 3); x.fillStyle = 'rgba(255,255,255,0.5)'; x.fillRect(w * 0.2, h * 0.3, w * 0.6, h * 0.35); }, 32, 128) }), list.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  list.forEach(([x, y, w, h, c, a], i) => { q.setFromAxisAngle(V3(0, 0, 1), a); m4.compose(V3(x, y, 0), q, V3(w, h, R.r(0.16, 0.22))); im.setMatrixAt(i, m4); im.setColorAt(i, inCol(c)); });
  im.castShadow = im.receiveShadow = true; im.frustumCulled = false; par.add(im); return im;
}
function inTexRug() { return inTex('rug', (x, w, h) => { const R = RNG('in-rug'); x.fillStyle = '#e9dcc4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#3d5a6a'; x.lineWidth = 10; x.strokeRect(20, 20, w - 40, h - 40); x.lineWidth = 3; x.strokeStyle = '#c86a4a'; x.strokeRect(40, 40, w - 80, h - 80); for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) { x.save(); x.translate(80 + i * (w - 160) / 4, 80 + j * (h - 160) / 3); x.rotate(Math.PI / 4); x.strokeStyle = j % 2 ? '#3d5a6a' : '#c86a4a'; x.lineWidth = 4; x.strokeRect(-18, -18, 36, 36); x.restore(); } inGrain(x, w, h, R, 30000, 0.12, 1.5); }, 512, 360); }
// sky behind windows
function inTexSky(kind) {
  return inTex('sky' + kind, (x, w, h) => {
    const R = RNG('in-sky', kind), g = x.createLinearGradient(0, 0, 0, h);
    if (kind === 'morning') { g.addColorStop(0, '#a8cdf0'); g.addColorStop(0.55, '#f3e2c8'); g.addColorStop(1, '#ffd9a0'); }
    else if (kind === 'day') { g.addColorStop(0, '#8fbce8'); g.addColorStop(0.7, '#d6e6f2'); g.addColorStop(1, '#eef2f2'); }
    else { g.addColorStop(0, '#0a1024'); g.addColorStop(0.6, '#1c2440'); g.addColorStop(1, '#3a3050'); }
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    const night = kind === 'night';
    if (!night) for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.ellipse(R.r(0, w), R.r(h * 0.05, h * 0.35), R.r(40, 90), R.r(8, 18), 0, 0, TAU); x.fill(); }
    [[0.62, '#9fb2c4', '#7a8ea2'], [0.72, '#7f93a8', '#5a6e84']].forEach(([y0, c, c2], L) => {
      let px = -10; while (px < w) { const bw = R.r(30, 70), bh = R.r(h * 0.12, h * 0.4) * (1 - L * 0.3); const top = h * y0 - bh + L * 30; x.fillStyle = night ? (L ? '#0e1220' : '#161c30') : (L ? c2 : c); x.fillRect(px, top, bw, h - top);
        for (let wy = top + 8; wy < h - 6; wy += 10) for (let wx = px + 5; wx < px + bw - 6; wx += 9) { const on = R.f(); if (night ? on < 0.35 : on < 0.15) { x.fillStyle = night ? `rgba(255,${R.i(190, 230)},${R.i(120, 170)},${R.r(0.6, 1)})` : 'rgba(255,255,255,0.35)'; x.fillRect(wx, wy, 5, 6); } }
        px += bw + R.r(2, 14); }
    });
    if (kind === 'morning') { const sg = x.createRadialGradient(w * 0.3, h * 0.55, 0, w * 0.3, h * 0.55, w * 0.5); sg.addColorStop(0, 'rgba(255,240,200,0.9)'); sg.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = sg; x.fillRect(0, 0, w, h); }
  }, 512, 512);
}
// a volumetric-looking light shaft: a quad strip from the window opening along the light direction (additive, soft edges)
function inBeam(S, a, b, dir, col, op) {
  const tx = inTex('beam', (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.25, 'rgba(255,255,255,0.8)'); g.addColorStop(0.5, 'rgba(255,255,255,1)'); g.addColorStop(0.75, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); const v = x.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.15, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,1)'); x.globalCompositeOperation = 'destination-out'; x.fillStyle = v; x.fillRect(0, 0, w, h); }, 64, 128);
  const d = V3(...dir), A = V3(...a), Bv = V3(...b), mat = new THREE.MeshBasicMaterial({ map: tx, color: inCol(col), transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const g = new THREE.Group(); S.add(g);
  // two crossing sheets spanning the opening, swept along the light
  [[V3(A.x, A.y, A.z), V3(Bv.x, A.y, A.z)], [V3(A.x, Bv.y, A.z), V3(Bv.x, Bv.y, A.z)], [V3(A.x, A.y, A.z), V3(A.x, Bv.y, A.z)], [V3(Bv.x, A.y, A.z), V3(Bv.x, Bv.y, A.z)], [V3((A.x + Bv.x) / 2, A.y, A.z), V3((A.x + Bv.x) / 2, Bv.y, A.z)], [V3(A.x, (A.y + Bv.y) / 2, A.z), V3(Bv.x, (A.y + Bv.y) / 2, A.z)]].forEach(([p, q]) => {
    const geo = new THREE.BufferGeometry(), e = q.clone().add(d), f = p.clone().add(d);
    geo.setAttribute('position', new THREE.Float32BufferAttribute([p.x, p.y, p.z, q.x, q.y, q.z, e.x, e.y, e.z, f.x, f.y, f.z], 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 1, 1, 1, 1, 0, 0, 0], 2)); geo.setIndex([0, 1, 2, 0, 2, 3]);
    const m = new THREE.Mesh(geo, mat); g.add(m);
  });
  g.userData.mat = mat; return g;
}
function inGlint(S) {
  const t = inTex('glint', (x, w) => { const m = w / 2, gr = x.createRadialGradient(m, m, 0, m, m, m * 0.3); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); x.globalCompositeOperation = 'lighter'; [[1, 0.05], [0.5, 0.03]].forEach(([l, th], k) => { x.save(); x.translate(m, m); x.rotate(k * Math.PI / 4); for (let i = 0; i < 2; i++) { x.rotate(Math.PI / 2 * i); const g2 = x.createLinearGradient(-m * l, 0, m * l, 0); g2.addColorStop(0, 'rgba(255,255,255,0)'); g2.addColorStop(0.5, 'rgba(255,255,255,0.95)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g2; x.fillRect(-m * l, -w * th / 2, 2 * m * l, w * th); } x.restore(); }); }, 128, 128);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color: inCol('#fff4dc').multiplyScalar(1.6), blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true })); s.visible = false; S.add(s); return s;
}
// the toast: a bread-slice outline, extruded with a bevel; a melting butter pat on the top face (+Y)
function inToast() {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); const w = 0.055, h = 0.05;
  sh.moveTo(-w, -h); sh.lineTo(w, -h); sh.lineTo(w, h * 0.55); sh.bezierCurveTo(w + 0.022, h * 0.75, w + 0.012, h + 0.035, 0.03, h + 0.03); sh.bezierCurveTo(0.012, h + 0.042, -0.012, h + 0.042, -0.03, h + 0.03); sh.bezierCurveTo(-w - 0.012, h + 0.035, -w - 0.022, h * 0.75, -w, h * 0.55); sh.lineTo(-w, -h);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 3, curveSegments: 16 });
  geo.translate(0, -0.008, -0.004); geo.rotateX(-Math.PI / 2);
  const top = inTex('toastTop', (x, w2, h2) => { const R = RNG('in-toast'); const gr = x.createRadialGradient(w2 / 2, h2 / 2, 10, w2 / 2, h2 / 2, w2 * 0.6); gr.addColorStop(0, '#e9b56a'); gr.addColorStop(0.75, '#c98a42'); gr.addColorStop(1, '#8a5424'); x.fillStyle = gr; x.fillRect(0, 0, w2, h2); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '90,50,20' : '255,230,180'},${R.r(0.1, 0.4)})`; x.beginPath(); x.arc(R.r(0, w2), R.r(0, h2), R.r(0.5, 2.2), 0, TAU); x.fill(); } }, 128, 128);
  top.repeat.set(9, 9); top.offset.set(0.5, 0.5);
  const crust = inM('#8a4e22', 0.7), face = inM(null, 0.75, { map: top });
  const m = new THREE.Mesh(geo, [face, crust]); m.castShadow = true; m.receiveShadow = true; g.add(m);
  const but = new THREE.Mesh(inGeo('butter', () => { const b = new THREE.SphereGeometry(1, 24, 12, 0, TAU, 0, Math.PI / 2); return b; }), inM('#ffe27a', 0.18, { clearcoat: 1, clearcoatRoughness: 0.05, emissive: inCol('#3a2a00') }));
  but.scale.set(0.04, 0.004, 0.034); but.position.set(0.004, 0.005, -0.004); but.castShadow = true; g.add(but);
  const pat = new THREE.Mesh(inRBox(0.022, 0.008, 0.018, 0.003), inM('#fff0a0', 0.2, { clearcoat: 1 })); pat.position.set(-0.004, 0.008, 0.002); pat.rotation.y = 0.4; g.add(pat);
  return g;
}

// =====================================================================
//  SHOTS
// =====================================================================
function inShotToast(g, t, b) {
  const A = inApt(g), S = A.S, u = t - b.t0, k = b.k;
  inDay(A, true);
  // the slice slips at 1.7 s, tumbles 1.25 turns, lands butter side up at ~2.15 s, skids a little
  const ts = 1.7, tl = 2.16;
  const react = ss(ts + 0.1, ts + 0.6, u), look = ss(tl, tl + 0.5, u), joy = ss(5.6, 6.6, u);
  const pose = [['hold', 1 - react * 0.9], ['shock', react * (1 - joy) * 0.45 + 0.001], ['stand', react * (1 - joy) * 0.45], ['point', joy * 0.95]];
  const c = inHero(S, { pose, expr: [['happy', (1 - react) * 0.7 + 0.01], ['surprised', react * (1 - look) + 0.001], ['amazed', look * (1 - joy)], ['joy', joy * 0.9]], look: [lerp(-10, 6, react), lerp(-28, -38, look)], pos: [-0.35, 0, -1.5], rot: lerp(18, 26, react), add: { neck: [lerp(14, 18, look), 0, 0], head: [lerp(10, 14, look), -8 * look, 0], spine: [6 * look, 0, 0] }, t });
  const gl = inGripW('L'), gr = inGripW('R'), mid = gl.clone().add(gr).multiplyScalar(0.5).add(V3(0, 0.02, 0.04));
  mid.lerp(gl.clone().add(V3(0.02, 0.0, 0.05)), react);
  A.plate.position.copy(mid); A.plate.rotation.set(0.05 * react, (lerp(18, 26, react)) * DEG, -0.12 * react);
  const land = V3(0.18, 0.016, -0.86);
  if (u < ts) { A.toast.position.copy(mid).add(V3(0, 0.02, 0)); A.toast.rotation.set(0, 0.3, 0); }
  else if (u < tl) { const q = (u - ts) / (tl - ts), p0 = mid.clone().add(V3(0, 0.02, 0)); A.toast.position.set(lerp(p0.x, land.x, q), lerp(p0.y, land.y, q * q) + 0.12 * Math.sin(Math.PI * q) * (1 - q), lerp(p0.z, land.z, q)); A.toast.rotation.set(-q * TAU * 1.25 + 0.0, 0.3 + q * 0.6, 0.2 * Math.sin(q * 6)); }
  else { const q = u - tl, sk = 1 - Math.exp(-q * 7), bo = Math.abs(Math.sin(q * 18)) * Math.exp(-q * 9) * 0.03; A.toast.position.set(land.x + 0.05 * sk, land.y + bo, land.z + 0.07 * sk); A.toast.rotation.set(-bo * 3, 0.9 + 0.15 * sk, 0); }
  A.toastGlint.visible = u > tl + 0.15 && u < tl + 2.6; if (A.toastGlint.visible) { const q = (u - tl - 0.15) / 2.45, s = 0.16 * Math.sin(Math.PI * q); A.toastGlint.position.copy(A.toast.position).add(V3(0.02, 0.02, 0.01)); A.toastGlint.scale.set(s, s, 1); A.toastGlint.material.rotation = q * 1.2; }
  inMotesAt(A.motes, t);
  A.ket.rotation.y = 0;
  // camera: low by the floor, the toast in the foreground, a slow push and a slight rise
  const p = EZ.io(k);
  if (u < tl - 0.05) shotCam(g, [lerp(0.95, 0.85, p), 1.05, 0.55], [-0.4, 1.0, -1.6], 30, 0.8, t);
  else shotCam(g, [lerp(-1.1, -0.95, p), lerp(0.62, 0.7, p), lerp(1.45, 1.2, p)], [lerp(-0.05, -0.1, p), lerp(0.62, 0.72, p), -1.15], 27, 0.6, t);
  const fd = g.cam.position.distanceTo(inHeadW());
  inPresent(g, S, { exp: 1.0, bloom: 0.28, dof: { fd, ap: 9, mx: 16 } });
}
function inDay(A, day) {
  const S = A.S; S.environment = day ? A.env : A.envN;
  A.skyM.map = day ? A.sky : A.skyN; A.skyM.color.copy(inCol('#ffffff').multiplyScalar(day ? 1.6 : 0.9));
  A.sun.intensity = day ? 7 : 0; A.sun.castShadow = day; A.hemi.intensity = day ? 0.3 : 0.16; A.hemi.color.copy(inCol(day ? '#e9eef6' : '#5a70b0')); A.moon.intensity = day ? 0 : 0.7;
  A.fill.intensity = day ? 0.5 : 0.0; A.bounce.intensity = day ? 0.7 : 0;
  A.beam.visible = day; A.motes.visible = day;
  A.lampLight.intensity = day ? 0 : 0.7; A.lampBulb.visible = A.lampGlow.visible = !day; A.pendLight.intensity = day ? 0 : 0.2;
  A.tvLight.intensity = day ? 0 : 5;
  A.tvScreen.material.map = null; A.tvScreen.material.color.copy(inCol(day ? '#0b0c0e' : '#ffffff'));
  A.tvScreen.material.needsUpdate = true;
  A.plate.visible = A.toast.visible = day; A.toastGlint.visible = false; if (A.ticket) A.ticket.visible = false;
}

// ---------- extras (chExtra people), cached per role; hidden unless posed this frame
function inX(key, seed, o = {}) { IN.x = IN.x || {}; return IN.x[key] || (IN.x[key] = chExtra(seed, o)); }
function inHideX(S) { Object.values(IN.x || {}).forEach((X) => { if (X.root.parent === S) X.root.visible = false; }); }
function inXP(S, X, o) { S.add(X.root); X.root.visible = true; X.pose(Object.assign({ t: TT }, o)); X.root.updateMatrixWorld(true); return X; }
// sit a rig (hero or extra) with its hips over a seat point
function inSitP(poseFn, o, seat) {
  poseFn(Object.assign({}, o, { pos: [0, 0, 0], sitY: 0 }));
  const rig = o.__rig; rig.root.updateMatrixWorld(true); const hp = rig.hips.getWorldPosition(V3(0, 0, 0)), yaw = (o.rot ?? 0) * DEG;
  return poseFn(Object.assign({}, o, { pos: [seat[0] - hp.x + Math.sin(yaw) * 0.06, 0, seat[2] - hp.z + Math.cos(yaw) * 0.06], sitY: seat[1] - hp.y + 0.1 }));
}
function inHeroSit(S, o, seat) { const c = chBuild(); S.add(c.root); inSitP((q) => chPose(q), Object.assign({ __rig: c }, o), seat); c.root.updateMatrixWorld(true); return c; }
function inXSit(S, X, o, seat) { S.add(X.root); X.root.visible = true; const rig = X.rig; inSitP((q) => X.pose(Object.assign({ t: TT }, q)), Object.assign({ __rig: rig }, o), seat); X.root.updateMatrixWorld(true); return X; }
const inXGrip = (X, side) => X.rig.arms[side].grip.getWorldPosition(V3(0, 0, 0));

// =====================================================================
//  ROOM: the Powerball draw (seen on TV): a glass drum of tumbling balls, the drawn numbers on a rail
// =====================================================================
const IN_PB = [7, 19, 23, 34, 51, 12];
function inTexBall(n, red) { return inTex('ball' + n + (red ? 'r' : ''), (x, w, h) => { x.fillStyle = red ? '#d8202a' : '#f6f4ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(w * 0.5, h * 0.5, w * 0.12, h * 0.24, 0, 0, TAU); x.fill(); x.fillStyle = '#111'; x.font = 'bold 40px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), w * 0.5, h * 0.52); }, 256, 128); }
function inDraw(g) {
  const R = IN.rooms; if (R.draw) return R.draw;
  const S = new THREE.Scene(), D = R.draw = { S };
  S.background = inCol('#06102a');
  const bg = inTex('drawbg', (x, w, h) => { const gr = x.createRadialGradient(w / 2, h * 0.45, 10, w / 2, h * 0.45, w * 0.6); gr.addColorStop(0, '#2a5ac8'); gr.addColorStop(0.6, '#0c1e5a'); gr.addColorStop(1, '#050a20'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(120,180,255,0.25)'; x.lineWidth = 2; for (let i = 0; i < 18; i++) { x.beginPath(); x.arc(w / 2, h * 0.45, 40 + i * 30, 0, TAU); x.stroke(); } x.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * 0.42, h * 0.45 + Math.sin(a) * h * 0.42, 3, 0, TAU); x.fill(); } }, 512, 512);
  inPlane(S, inBasic('#ffffff', 1, { map: bg }), 9, 6, 0, 1.2, -2.5);
  const logo = inTexText('pblogo', 1024, 256, null, [['POWERBALL', 0.55, 150, '#ffffff', '900 italic']], (x, w, h, ph) => { if (ph === 'pre') { x.fillStyle = '#c8102e'; x.beginPath(); x.roundRect(40, 30, w - 80, h - 60, 40); x.fill(); x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.stroke(); } });
  inPlane(S, inBasic('#ffffff', 1.2, { map: logo, transparent: true }), 2.6, 0.65, 0, 2.35, -1.2);
  D.drum = new THREE.Mesh(new THREE.SphereGeometry(0.62, 48, 32), new THREE.MeshStandardMaterial({ color: inCol('#dfeaff'), roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.22, envMapIntensity: 2.5 }));
  D.drum.position.set(0, 1.25, 0); S.add(D.drum);
  inAdd(S, inGeo('drumring', () => new THREE.TorusGeometry(0.63, 0.025, 10, 64)), inM('#d8dde8', 0.2, { metalness: 1 }), 0, 1.25, 0);
  inAdd(S, inGeo('drumring', () => new THREE.TorusGeometry(0.63, 0.025, 10, 64)), inM('#d8dde8', 0.2, { metalness: 1 }), 0, 1.25, 0, Math.PI / 2);
  inCyl(S, inM('#c8ccd8', 0.25, { metalness: 1 }), 0.12, 0.3, 0.6, 0, 0.3, 0);
  inCyl(S, inM('#1a2a6a', 0.3, { metalness: 0.4 }), 1.4, 1.5, 0.08, 0, 0.04, 0, 48);
  const R0 = RNG('in-drum'); D.balls = [];
  const bm = [0, 1].map((r) => inM(r ? '#d8202a' : '#f8f6f0', 0.25, { clearcoat: 0.6 }));
  for (let i = 0; i < 26; i++) { const m = inSph(S, bm[i % 9 === 0 ? 1 : 0], 0.075, 0, 1.25, 0); D.balls.push([m, R0.r(0, TAU), R0.r(0, TAU), R0.r(1.5, 3), R0.r(0.2, 0.5)]); }
  inB(S, inM('#d0d4de', 0.2, { metalness: 1 }), 3.4, 0.04, 0.2, 0.2, 0.42, 0.75, 0.01);
  D.rail = IN_PB.map((n, i) => { const m = new THREE.Mesh(inGeo('sph', () => new THREE.SphereGeometry(1, 28, 18)), new THREE.MeshStandardMaterial({ map: inTexBall(n, i === 5), roughness: 0.22 })); m.scale.setScalar(0.17); m.position.set(-1.3 + i * 0.52 + (i === 5 ? 0.12 : 0), 0.61, 0.75); m.rotation.y = -Math.PI / 2; S.add(m); return m; });
  S.add(new THREE.HemisphereLight(inCol('#a8c8ff'), inCol('#101830'), 0.8));
  const k = new THREE.DirectionalLight(inCol('#ffffff'), 2.5); k.position.set(1, 3, 4); S.add(k);
  inPt(S, '#6aa0ff', 3, -2, 2, 1, 8);
  S.environment = inEnv(g.r, '#0a1440', [['#ffffff', 3, 0, 3, 3, 3, 1], ['#4a8aff', 2, -3, 1, 0, 2, 2, 0, Math.PI / 2]]);
  D.cam = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 50); D.cam.position.set(0.2, 1.35, 4.6); D.cam.lookAt(0.1, 1.15, 0);
  return D;
}
function inDrawAt(g, D, u) {
  D.balls.forEach(([m, a, b2, sp, ph], i) => { const q = u * sp + ph * 10; m.position.set(Math.sin(q + a) * 0.42 * Math.cos(q * 0.7 + b2), 1.25 + Math.sin(q * 1.3 + b2) * 0.4, Math.cos(q + a) * 0.42 * Math.sin(q * 0.5 + i)); });
  D.rail.forEach((m, i) => { const a = u - (1.0 + i * 1.15); m.visible = a > 0; const s = 0.17 * EZ.back(a / 0.35); m.scale.setScalar(Math.max(0.001, s)); m.rotation.set(0, -Math.PI / 2 + Math.max(0, 1 - a * 2) * 3, 0); });
  inRenderTo(g, D.S, D.cam, inRT('draw'));
}
function inTexTicket() {
  return inTex('ticket', (x, w, h) => {
    const R = RNG('in-ticket'); x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, w, h); inGrain(x, w, h, R, 3000, 0.05, 1);
    x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, 52); x.fillStyle = '#fff'; x.font = '900 italic 38px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('POWERBALL', w / 2, 28);
    x.fillStyle = '#222'; x.font = 'bold 15px Menlo, monospace'; x.fillText('DRAW 10  ·  $2.00  ·  QUICK PICK', w / 2, 74);
    IN_PB.forEach((n, i) => { const cx = 40 + i * 64 + (i === 5 ? 16 : 0), cy = 128; x.fillStyle = i === 5 ? '#c8102e' : '#fff'; x.strokeStyle = '#333'; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 25, 0, TAU); x.fill(); x.stroke(); x.fillStyle = i === 5 ? '#fff' : '#111'; x.font = 'bold 24px Helvetica, Arial'; x.fillText(String(n).padStart(2, '0'), cx, cy + 1); });
    x.fillStyle = '#333'; for (let i = 0; i < 70; i++) x.fillRect(30 + i * 5.6, 180, R.f() < 0.5 ? 2 : 3.4, 44); x.font = '12px Menlo, monospace'; x.fillText('0412 8830 1957 2246', w / 2, 238);
  }, 420, 256);
}

// =====================================================================
//  ROOM: the TV news studio (news, the warning panel)
// =====================================================================
function inStudio(g) {
  const R = IN.rooms; if (R.studio) return R.studio;
  const S = new THREE.Scene(), T = R.studio = { S };
  S.background = inCol('#05070c'); S.fog = new THREE.FogExp2(inCol('#070a14'), 0.035);
  const fl = inPlane(S, inM('#0e1420', 0.22, { metalness: 0.2, envMapIntensity: 1.2 }), 30, 30, 0, 0, 0, 0, -Math.PI / 2); fl.receiveShadow = true;
  // a glossy raised stage disc
  inAdd(S, inGeo('stage', () => new THREE.CylinderGeometry(4.2, 4.3, 0.12, 96)), inM('#1a2538', 0.18, { metalness: 0.3, envMapIntensity: 1.3 }), 0, 0.06, -0.6);
  inAdd(S, inGeo('stageRing', () => new THREE.TorusGeometry(4.25, 0.012, 6, 160).rotateX(Math.PI / 2)), inBasic('#4aa0ff', 3), 0, 0.11, -0.6, 0, 0, 0, false);
  // the curved LED wall: base texture + overlay planes (portrait, headline) swapped per beat
  T.wallTex = inTex('ledwall', (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1a44'); gr.addColorStop(1, '#1a3a8a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(140,190,255,0.18)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(0, h * 0.75 - i * 6); x.bezierCurveTo(w * 0.3, h * 0.6 - i * 9, w * 0.6, h * 0.95 - i * 4, w, h * 0.7 - i * 7); x.stroke(); } x.fillStyle = 'rgba(0,0,0,0.35)'; for (let xx = 0; xx < w; xx += 4) x.fillRect(xx, 0, 1, h); for (let yy = 0; yy < h; yy += 4) x.fillRect(0, yy, w, 1); }, 1024, 256);
  const wallGeo = new THREE.CylinderGeometry(7, 7, 3.2, 96, 1, true, Math.PI - 0.62, 1.24);
  T.wall = inAdd(S, wallGeo, new THREE.MeshBasicMaterial({ map: T.wallTex, color: inCol('#ffffff').multiplyScalar(0.9), side: THREE.BackSide }), 0, 1.75, 2.2, 0, 0, 0, false);
  T.wall.scale.x = -1;
  const wz = (x, d) => 2.2 - Math.sqrt(49 - x * x) + d, wr = (x) => -Math.asin(x / 7);
  T.portrait = inPlane(S, inBasic('#ffffff', 0.9), 1.15, 1.34, -1.75, 2.05, wz(-1.75, 0.2), wr(-1.75));
  T.portraitFrame = inPlane(S, inBasic('#ffffff', 1.4), 1.23, 1.42, -1.75, 2.05, wz(-1.75, 0.18), wr(-1.75));
  T.head = inPlane(S, inBasic('#ffffff', 0.85, { transparent: true }), 2.5, 1.03, 0.8, 2.15, wz(0.8, 0.3), wr(0.8));
  T.headTex = { news: inTexText('hNews', 1024, 420, null, [['LUCKIEST', 0.3, 150, '#ffffff', '900'], ['MAN ALIVE?', 0.72, 150, '#ffd24a', '900']]),
    warn: inTexText('hWarn', 1024, 420, null, [['EVERY WINNER', 0.3, 130, '#ffffff', '900'], ['NEEDS A LOSER', 0.72, 130, '#ff4a3a', '900']]) };
  T.chyron = inPlane(S, inBasic('#ffffff', 0.9, { transparent: true }), 3.6, 0.42, -0.2, 1.12, wz(-0.2, 0.25), wr(-0.2));
  T.chyTex = { news: inTexText('cNews', 1024, 120, null, [['BREAKING · LOCAL MAN WINS EVERYTHING · LUCKIEST MAN ALIVE?', 0.52, 40, '#ffffff', 'bold']], (x, w, h, ph) => { if (ph === 'pre') { x.fillStyle = '#c8102e'; x.fillRect(0, 0, w, h); x.fillStyle = '#0a1a44'; x.fillRect(0, h - 14, w, 14); } }),
    warn: inTexText('cWarn', 1024, 120, null, [['EXPERTS: "HIS LUCK IS COSTING EVERYONE ELSE"', 0.52, 40, '#ffffff', 'bold']], (x, w, h, ph) => { if (ph === 'pre') { x.fillStyle = '#7a0a14'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff4a3a'; x.fillRect(0, h - 10, w, 10); } }) };
  // the anchor desk: a curved white top on a glowing front
  const desk = new THREE.Group(); desk.position.set(0, 0.12, -1.6); S.add(desk); T.desk = desk;
  inB(desk, inM('#f2f4f8', 0.15, { clearcoat: 1, clearcoatRoughness: 0.05 }), 2.9, 0.06, 0.86, 0, 0.74, 0, 0.03);
  inB(desk, inM('#0d1a3a', 0.35), 2.7, 0.66, 0.6, 0, 0.38, -0.02, 0.04);
  inPlane(desk, new THREE.MeshStandardMaterial({ map: inTex('deskfront', (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1a3a'); gr.addColorStop(1, '#1a3a7a'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#4aa0ff'; x.fillRect(0, 8, w, 5); x.fillRect(0, h - 16, w, 4); x.fillStyle = '#ffffff'; x.font = '900 64px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NEWS 9', w * 0.16, h * 0.32); x.fillStyle = '#c8102e'; x.beginPath(); x.arc(w * 0.16 - 150, h * 0.32, 20, 0, TAU); x.fill(); x.fillStyle = 'rgba(140,200,255,0.5)'; for (let i = 0; i < 30; i++) x.fillRect(w * 0.34 + i * 22, h * 0.3, 12, 6); }, 1024, 220), emissive: inCol('#ffffff'), emissiveIntensity: 0.5, roughness: 0.3 }), 2.7, 0.6, 0, 0.38, 0.29);
  { const fm = desk.children[desk.children.length - 1].material; fm.emissiveMap = fm.map; }
  [-1.45, 1.45].forEach((x) => inB(desk, inBasic('#4aa0ff', 2.5), 0.03, 0.62, 0.62, x, 0.38, -0.02, 0.01));
  // side towers with light strips + a skyline behind the wall edges
  [-4.6, 4.6].forEach((x) => { inB(S, inM('#141a28', 0.3, { metalness: 0.4 }), 0.7, 3.4, 0.7, x, 1.7, -3.2, 0.04); for (let i = 0; i < 6; i++) inB(S, inBasic('#8ac0ff', 2), 0.72, 0.03, 0.72, x, 0.5 + i * 0.5, -3.2, 0.005); });
  T.front = inPt(S, '#ffe8d0', 1.6, 0, 2.2, 1.2, 8, 1.5);
  // dressing: a night skyline behind the set, side screens, a lighting truss, desk props, a glowing floor logo
  inPlane(S, inBasic('#ffffff', 0.7, { map: inTexSky('night') }), 22, 7, 0, 2.6, -8.5);
  const sideTex = inTex('sidescr', (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1a44'); gr.addColorStop(1, '#2a5ab8'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#c8102e'; x.fillRect(0, 40, w, 70); x.fillStyle = '#fff'; x.font = '900 52px Helvetica, Arial'; x.textAlign = 'center'; x.fillText('LIVE', w / 2, 94); x.strokeStyle = 'rgba(140,200,255,0.8)'; x.lineWidth = 5; x.beginPath(); for (let i = 0; i <= 10; i++) x.lineTo(20 + i * (w - 40) / 10, h * 0.75 - Math.pow(i / 10, 2.2) * h * 0.4 + (i % 2) * 12); x.stroke(); x.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 6; i++) x.fillRect(30, h * 0.82 + i * 14, w * (0.3 + 0.1 * (i % 3)), 6); x.fillStyle = 'rgba(0,0,0,0.3)'; for (let yy = 0; yy < h; yy += 4) x.fillRect(0, yy, w, 1); }, 256, 512);
  [-1, 1].forEach((sd) => { const sc = new THREE.Group(); sc.position.set(sd * 3.5, 1.9, -3.3); sc.rotation.y = -sd * 0.45; S.add(sc); inB(sc, inM('#101318', 0.3, { metalness: 0.5 }), 1.2, 2.3, 0.08, 0, 0, 0, 0.02); inPlane(sc, inBasic('#ffffff', 0.9, { map: sideTex }), 1.12, 2.22, 0, 0, 0.045); });
  const truss = inM('#2a2e36', 0.35, { metalness: 0.8 });
  [-2.4, 0.4].forEach((z) => { inB(S, truss, 9, 0.08, 0.08, 0, 3.7, z, 0.01); inB(S, truss, 9, 0.08, 0.08, 0, 3.95, z, 0.01); for (let i = -4; i <= 4; i++) inB(S, truss, 0.03, 0.27, 0.03, i, 3.82, z, 0.005); });
  for (let i = -3; i <= 3; i++) { const cz = i % 2 ? -2.4 : 0.4, can = new THREE.Group(); can.position.set(i * 1.2, 3.55, cz); can.rotation.x = cz > 0 ? 0.7 : -0.5; S.add(can); inCyl(can, inM('#16181c', 0.4, { metalness: 0.5 }), 0.1, 0.12, 0.28, 0, 0, 0, 16); inAdd(can, inGeo('canlens', () => new THREE.CircleGeometry(0.09, 20).rotateX(Math.PI / 2)), inBasic('#fff4e0', 3), 0, -0.141, 0, 0, Math.PI, 0, false); }
  inAdd(S, inGeo('floorlogo', () => new THREE.RingGeometry(1.6, 1.66, 96).rotateX(-Math.PI / 2)), inBasic('#4aa0ff', 2.2), 0, 0.125, -0.6, 0, 0, 0, false);
  inAdd(S, inGeo('floorlogo2', () => new THREE.RingGeometry(2.6, 2.63, 96).rotateX(-Math.PI / 2)), inBasic('#c8102e', 2.0), 0, 0.125, -0.6, 0, 0, 0, false);
  [[-0.95, -1.75], [0.95, -1.75]].forEach(([x, z]) => { const lp = new THREE.Group(); lp.position.set(x, 0.92, z); lp.rotation.y = -x * 0.3; S.add(lp); inB(lp, inM('#c8ccd4', 0.25, { metalness: 0.8 }), 0.32, 0.012, 0.22, 0, 0, 0, 0.004); const scr = inB(lp, inM('#c8ccd4', 0.25, { metalness: 0.8 }), 0.32, 0.21, 0.01, 0, 0.1, -0.11, 0.004); scr.rotation.x = -0.25; inGlow(lp, '#8ac0ff', 0.25, 0, 0.12, -0.1, 0.25); });
  [[-0.35, -1.55, '#e8e4dc'], [0.4, -1.5, '#c8102e']].forEach(([x, z, c]) => { const mg = new THREE.Group(); mg.position.set(x, 0.92, z); S.add(mg); inAdd(mg, inLathe('mug', IN_MUG), inM(c, 0.3, { side: THREE.DoubleSide })); });
  for (let i = 0; i < 3; i++) inB(S, inM('#f4f2ee', 0.7), 0.21, 0.004, 0.29, -0.05 + i * 0.012, 0.922 + i * 0.004, -1.6, 0.001).rotation.y = 0.1 * i;
  // chairs behind the desk
  T.chairs = [-0.95, 0, 0.95].map((x) => { const c = new THREE.Group(); c.position.set(x, 0.12, -2.25 + Math.abs(x) * 0.15); S.add(c); inB(c, inM('#1a1d24', 0.4), 0.5, 0.1, 0.48, 0, 0.5, 0, 0.04); inB(c, inM('#1a1d24', 0.4), 0.48, 0.6, 0.08, 0, 0.85, -0.22, 0.04); inCyl(c, inM('#c0c4cc', 0.2, { metalness: 1 }), 0.03, 0.03, 0.42, 0, 0.25, 0, 10); return c; });
  // studio cameras on pedestals (foreground silhouettes)
  T.cams = [[-2.6, 2.8, 0.5], [2.4, 3.2, -0.45]].map(([x, z, ry]) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; S.add(c); const dm = inM('#22252c', 0.45, { metalness: 0.5 }); inCyl(c, dm, 0.06, 0.06, 1.1, 0, 0.6, 0, 12); inCyl(c, dm, 0.35, 0.4, 0.12, 0, 0.1, 0, 20); inB(c, dm, 0.32, 0.36, 0.62, 0, 1.36, 0, 0.03); inCyl(c, inM('#111', 0.3), 0.1, 0.12, 0.3, 0, 1.36, -0.42, 20).rotation.x = Math.PI / 2; inB(c, inM('#0a0a0a', 0.2), 0.4, 0.3, 0.02, 0, 1.36, -0.6, 0.01); inGlow(c, '#ff2a2a', 0.08, 0.12, 1.58, -0.05, 0.9); return c; });
  // ceiling light grid
  for (let i = -3; i <= 3; i++) { const bar = inB(S, inBasic('#e8f0ff', 2.2), 0.08, 0.05, 6, i * 1.1, 4.4, -1, 0.01); bar.castShadow = false; }
  for (let i = -6; i <= 6; i++) inGlow(S, '#9ac8ff', 0.6, i * 0.9, 3.4, -6.2, 0.35);
  S.add(new THREE.HemisphereLight(inCol('#9ab8ff'), inCol('#101420'), 0.35));
  T.key = inKey(S, '#fff4e8', 3.2, [1.5, 4.5, 4.5], [0, 1, -1.8], 4);
  const rim = new THREE.DirectionalLight(inCol('#6aa8ff'), 2.2); rim.position.set(-2, 3.5, -6); S.add(rim);
  inPt(S, '#ffd8b0', 1.2, -2.5, 2.2, 1.5, 9);
  S.environment = inEnv(g.r, '#060a18', [['#ffffff', 2, 0, 3.9, 0, 6, 1, Math.PI / 2], ['#3a7aff', 2, 0, 1.6, -6, 8, 2], ['#ffe0c0', 1.2, 3, 2, 4, 2, 2]]);
  // panel camera (the warning, also seen on the apartment TV)
  T.cam = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 60); T.cam.position.set(0, 1.55, 3.4); T.cam.lookAt(0, 1.55, -3);
  return T;
}
// the hero's photo for the studio wall: a little portrait render (cached once, it does not depend on t)
function inPortrait(g) {
  if (IN.portraitDone) return inRT('portrait', 320, 372).texture;
  const S = new THREE.Scene(); S.background = inCol('#7aa8d8');
  S.add(new THREE.HemisphereLight(inCol('#e8f0ff'), inCol('#5a6a80'), 1.0)); const k = new THREE.DirectionalLight(inCol('#fff2e0'), 2.6); k.position.set(1, 2, 3); S.add(k);
  const c = chPose({ pose: 'stand', expr: 'happy', look: [0, 0], pos: [0, 0, 0], rot: 8, t: 3.3, blink: false }); S.add(c.root); c.root.updateMatrixWorld(true);
  const h = inHeadW(), cam = new THREE.PerspectiveCamera(22, 320 / 372, 0.1, 20); cam.position.set(h.x + 0.05, h.y + 0.02, h.z + 1.5); cam.lookAt(h.x, h.y - 0.03, h.z);
  inRenderTo(g, S, cam, inRT('portrait', 320, 372)); IN.portraitDone = true;
  return inRT('portrait', 320, 372).texture;
}
function inStudioMode(g, T, mode) {
  T.head.material.map = T.headTex[mode]; T.chyron.material.map = T.chyTex[mode];
  T.portrait.material.map = inPortrait(g); T.portrait.material.color.copy(inCol(mode === 'warn' ? '#ff9a8a' : '#ffffff')); T.portraitFrame.material.color.copy(inCol(mode === 'warn' ? '#ff3a2a' : '#ffffff').multiplyScalar(1.3));
  [T.head, T.chyron, T.portrait].forEach((m) => { m.material.needsUpdate = true; });
}
function inStudioPeople(T, t, mode, k) {
  const S = T.S; inHideX(S);
  const A = inXSit(S, inX('anchor', 'anchor', { sex: 'f', age: 'adult', outfit: 'suit', colors: { top: '#1d2a44', shirt: '#f2efe8' }, hair: undefined, makeup: true }),
    { pose: 'sit', expr: mode === 'warn' ? 'worried' : 'happy', look: mode === 'warn' ? [20, 0] : [-18, 0], rot: mode === 'warn' ? 6 : 14, add: { shL: [-20, 0, 0], shR: [-20, 0, 0], elL: [-40, 0, 0], elR: [-40, 0, 0], head: [0, mode === 'warn' ? 0 : 12, 0] }, t }, [mode === 'warn' ? 0 : -0.75, 0.62, -2.1]);
  if (mode === 'warn') {
    const shake = Math.sin(t * 5.5) * 10 * ss(0.15, 0.3, k) * (1 - ss(0.45, 0.55, k));
    inXSit(S, inX('pundit1', 'pundit1', { sex: 'm', age: 'old', outfit: 'suit', glasses: true }), { pose: 'sit', expr: 'worried', look: [14, 0], rot: 22, add: { head: [0, shake, 0], shL: [-25, 0, 0], elL: [-50, 0, 0], shR: [-25, 0, 0], elR: [-50, 0, 0] }, t }, [-0.95, 0.62, -1.95]);
    inXSit(S, inX('pundit2', 'pundit2', { sex: 'm', age: 'adult', outfit: 'suit', beard: 'stubble' }), { pose: 'sit', expr: 'sad', look: [-16, 0], rot: -22, add: { shL: [-25, 0, 0], elL: [-50, 0, 0], shR: [-25, 0, 0], elR: [-50, 0, 0] }, t }, [0.95, 0.62, -1.95]);
  }
  return A;
}

// ---------- shots: Powerball night, the news, the warning
function inShotPowerball(g, t, b) {
  const A = inApt(g), S = A.S, u = t - b.t0, k = b.k, D = inDraw(g);
  inDay(A, false); inDrawAt(g, D, u);
  A.tvScreen.material.map = inRT('draw').texture; A.tvScreen.material.color.copy(inCol('#ffffff').multiplyScalar(1.1)); A.tvScreen.material.needsUpdate = true;
  const nShown = IN_PB.filter((n, i) => u > 1.0 + i * 1.15).length, last = ss(1.0 + 5 * 1.15, 1.0 + 5 * 1.15 + 0.6, u);
  A.tvLight.color.copy(inCol('#8fb0ff')); A.tvLight.intensity = (k < 0.56 ? 6 : 2.0) + 0.5 * Math.sin(t * 9) * Math.sin(t * 2.3);
  // he checks the ticket, number by number: eyes go TV -> ticket each time a ball drops
  const ph = (u - 1.0) / 1.15, between = ph - Math.floor(ph), eyeDown = u > 1 ? ss(0.25, 0.5, between) * (1 - ss(0.8, 1.0, between)) : 0;
  const amaze = clamp(nShown / 5), c = inHero(S, { pose: [['hold', 1 - last * 0.8], ['cheer', last * 0.8 + 0.001]], expr: [['neutral', (1 - amaze) + 0.01], ['surprised', amaze * (1 - last)], ['joy', last]], look: [k < 0.56 ? 22 * (1 - eyeDown) : 0, lerp(0, -26, eyeDown)], pos: [1.95, 0, -0.35], rot: k < 0.56 ? 145 : 180 + 8, add: { neck: [eyeDown * 10, 0, 0], head: [eyeDown * 8, 0, 0] }, t });
  const gl = inGripW('L'), gr = inGripW('R'), mid = gl.clone().add(gr).multiplyScalar(0.5).lerp(gr, ss(0, 0.25, last));
  if (!A.ticket) { A.ticket = inPlane(S, inM(null, 0.6, { map: inTexTicket(), side: THREE.DoubleSide }), 0.16, 0.0975, 0, 0, 0); A.ticket.castShadow = true; }
  A.ticket.visible = true; A.ticket.position.copy(mid).add(V3(0, 0.04, -0.03)); A.ticket.rotation.set(-0.6 - last * 0.5, Math.PI + 8 * DEG, 0, 'YXZ');
  if (last > 0) A.ticket.position.y += last * 0.06;
  if (k < 0.56) shotCam(g, [lerp(3.95, 3.85, k / 0.56), 1.38, lerp(0.05, -0.15, k / 0.56)], [1.85, 1.12, -1.45], 22, 0.5, t);
  else { const q = (k - 0.56) / 0.44; shotCam(g, [lerp(1.2, 1.35, q), 1.42, lerp(-1.85, -1.7, q)], [2.0, lerp(1.45, 1.5, q), -0.3], 30, 0.4, t); }
  const fd = g.cam.position.distanceTo(k < 0.56 ? A.tv.position : inHeadW());
  inPresent(g, S, { exp: 0.95, bloom: 0.34, dof: { fd, ap: k < 0.56 ? 6 : 10, mx: 16 } });
}
function inShotNews(g, t, b) {
  const T = inStudio(g), S = T.S, u = t - b.t0, k = b.k;
  inStudioMode(g, T, 'news');
  inStudioPeople(T, t, 'news', k);
  T.chairs.forEach((c, i) => { c.visible = i !== 1; });
  // the hero is the guest at the end of the desk: sheepish wave, then a proud grin
  const wave = ss(0.25, 0.4, k) * (1 - ss(0.62, 0.75, k));
  inHeroSit(S, { pose: 'sit', expr: [['happy', 1 - wave * 0.5], ['smug', wave * 0.5 + 0.001]], look: [-10, 2], rot: -22, add: { shR: [-60 * wave, 0, -70 * wave], elR: [-60 * wave, 0, 0], wrR: [0, 0, 18 * Math.sin(t * 9) * wave], head: [0, -10, 4] }, hand: { R: wave > 0.3 ? 'open' : 'relax' }, t }, [0.9, 0.62, -2.05]);
  shotCam(g, [lerp(-0.75, -0.45, EZ.io(k)), lerp(1.3, 1.36, k), lerp(2.3, 1.75, EZ.io(k))], [0.05, 1.42, -2.6], 30, 0.5, t);
  inPresent(g, S, { exp: 1.05, bloom: 0.36, vig: 0.4, dof: { fd: g.cam.position.distanceTo(V3(0.2, 1.2, -2.0)), ap: 2, mx: 12 } });
}
function inShotTvwarning(g, t, b) {
  const u = t - b.t0, k = b.k, T = inStudio(g);
  inStudioMode(g, T, 'warn');
  inStudioPeople(T, t, 'warn', k);
  T.chairs.forEach((c) => { c.visible = true; });
  { const c = chBuild(); if (c.root.parent === T.S) T.S.remove(c.root); }
  if (k < 0.55) {   // the panel, a slow push toward the wall
    const q = EZ.io(k / 0.55);
    shotCam(g, [lerp(0.45, 0.25, q), lerp(1.4, 1.5, q), lerp(2.6, 1.7, q)], [0.1, 1.6, -3.0], 30, 0.4, t);
    inPresent(g, T.S, { exp: 1.05, bloom: 0.38, vig: 0.42, dof: { fd: g.cam.position.distanceTo(V3(0, 1.3, -2.0)), ap: 2, mx: 12 } });
    return;
  }
  // at home, on the sofa, the panel on his TV
  const A = inApt(g), S = A.S, q = (k - 0.55) / 0.45; inDay(A, false); if (A.ticket) A.ticket.visible = false;
  T.cam.position.set(0.15, 1.6, 2.9); T.cam.lookAt(0.1, 1.7, -3);
  inRenderTo(g, T.S, T.cam, inRT('studioTV'));
  A.tvScreen.material.map = inRT('studioTV').texture; A.tvScreen.material.color.copy(inCol('#ffffff')); A.tvScreen.material.needsUpdate = true;
  A.tvLight.color.copy(inCol('#ff9a8a')); A.tvLight.intensity = 2.4;
  inHeroSit(S, { pose: 'sit', expr: [['worried', 0.8], ['sad', 0.2]], look: [0, 4], rot: 180, add: { spine: [10, 0, 0], shL: [-30, 0, 0], shR: [-30, 0, 0], elL: [-70, 30, 0], elR: [-70, -30, 0] }, hand: { L: 'fist', R: 'relax' }, t }, [2.0, 0.48, 0.62]);
  shotCam(g, [lerp(0.7, 0.85, q), 1.25, lerp(-1.6, -1.35, q)], [2.0, 1.0, 0.4], 30, 0.4, t);
  inPresent(g, S, { exp: 1.0, bloom: 0.36, dof: { fd: g.cam.position.distanceTo(inHeadW()), ap: 9, mx: 16 } });
  A.tvLight.color.copy(inCol('#9cc0ff'));
}

// ---------- shared props
function inConfetti(S, n, box, seed) {
  const R = RNG('in-conf', seed), geo = inGeo('confg', () => new THREE.PlaneGeometry(0.03, 0.018)), im = new THREE.InstancedMesh(geo, inM(null, 0.5, { side: THREE.DoubleSide, emissive: inCol('#222222') }), n);
  const pal = ['#ff4a5a', '#ffd23a', '#3ac0ff', '#7ae05a', '#ff8ad8', '#ffffff', '#ff9a2a'];
  im.userData.P = []; for (let i = 0; i < n; i++) { im.setColorAt(i, inCol(R.pick(pal))); im.userData.P.push([R.r(box[0], box[1]), R.r(box[4], box[5]), R.r(0, 1.2), R.r(0.5, 0.9), R.r(0, TAU), R.r(2, 6), R.r(0, TAU)]); }
  im.userData.top = box[3]; im.userData.bot = box[2]; im.castShadow = false; im.frustumCulled = false; S.add(im); return im;
}
function inConfettiAt(im, u) {
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), top = im.userData.top, bot = im.userData.bot;
  im.userData.P.forEach(([x, z, d, sp, ph, sw, rr], i) => { const a = u - d; let y = top - a * sp; const vis = a > 0 && y > bot - 0.01; if (y < bot) y = bot; e.set(ph + a * sw, rr + a * 2, a * 3); q.setFromEuler(e); m4.compose(V3(x + 0.12 * Math.sin(a * 2 + ph), y, z + 0.1 * Math.cos(a * 1.7 + rr)), q, V3(vis ? 1 : 0, vis ? 1 : 0, 1)); im.setMatrixAt(i, m4); });
  im.instanceMatrix.needsUpdate = true;
}
function inOfficeChair(par, x, z, ry, col = '#2a2e36') {
  const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; par.add(c); const m = inM(col, 0.6, { map: inTexFabric('chair') }), mt = inM('#9aa0aa', 0.25, { metalness: 1 });
  inB(c, m, 0.5, 0.08, 0.48, 0, 0.47, 0, 0.035); inB(c, m, 0.46, 0.56, 0.07, 0, 0.82, -0.24, 0.05).rotation.x = -0.1; inCyl(c, mt, 0.025, 0.025, 0.36, 0, 0.27, 0, 10);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; inB(c, mt, 0.3, 0.025, 0.04, Math.cos(a) * 0.14, 0.07, Math.sin(a) * 0.14, 0.01, -a); inSph(c, inM('#111', 0.4), 0.025, Math.cos(a) * 0.28, 0.03, Math.sin(a) * 0.28); }
  return c;
}
function inTexScreen(key, pal) { return inTex('scr' + key, (x, w, h) => { const R = RNG('in-scr', key); x.fillStyle = pal[0]; x.fillRect(0, 0, w, h); x.fillStyle = pal[1]; x.fillRect(0, 0, w, 18); x.fillRect(0, 0, 50, h); for (let i = 0; i < 9; i++) { x.fillStyle = R.f() < 0.3 ? pal[2] : 'rgba(255,255,255,0.18)'; x.fillRect(64, 30 + i * 13, R.r(40, w - 80), 6); } x.fillStyle = pal[2]; for (let i = 0; i < 6; i++) { const bh = R.r(10, 50); x.fillRect(w - 110 + i * 15, h - 12 - bh, 10, bh); } }, 256, 160); }
function inDesk(par, x, z, ry, o = {}) {
  const d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = ry; par.add(d);
  inB(d, inM('#f1ede6', 0.35), 1.4, 0.035, 0.75, 0, 0.74, 0, 0.012); [-0.66, 0.66].forEach((xx) => inB(d, inM('#2a2d33', 0.4, { metalness: 0.5 }), 0.04, 0.72, 0.68, xx, 0.36, 0, 0.01));
  if (o.monitor !== false) { const mo = new THREE.Group(); mo.position.set(o.mx ?? 0.1, 0.76, -0.2); d.add(mo); inB(mo, inM('#18191c', 0.3), 0.62, 0.38, 0.03, 0, 0.32, 0, 0.012); inPlane(mo, inBasic('#ffffff', 0.85, { map: inTexScreen(o.scr ?? 'a', o.pal ?? ['#1e2a3a', '#2f4a6a', '#5ac8a0']) }), 0.58, 0.34, 0, 0.32, 0.016); inB(mo, inM('#2a2d33', 0.3), 0.04, 0.16, 0.04, 0, 0.08, -0.02, 0.01); inB(mo, inM('#2a2d33', 0.3), 0.2, 0.012, 0.14, 0, 0.006, 0, 0.005); inB(d, inM('#e8e6e2', 0.4), 0.42, 0.018, 0.14, 0.1, 0.766, 0.12, 0.006); }
  if (o.mug) { const mg = new THREE.Group(); mg.position.set(-0.45, 0.757, 0.05); d.add(mg); inAdd(mg, inLathe('mug', IN_MUG), inM(o.mug, 0.3, { side: THREE.DoubleSide })); }
  if (o.chair !== false) inOfficeChair(par, x + Math.sin(ry) * 0.55, z + Math.cos(ry) * 0.55, ry + Math.PI + (o.chairRot ?? 0.2));
  return d;
}
function inBox(par, x, y, z, ry, w = 0.46, h = 0.3, d = 0.34) {   // a cardboard box, open top with flaps
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; par.add(g); const cb = inM('#c49a62', 0.85, { map: inTexFabric('card') });
  inB(g, cb, w, 0.01, d, 0, 0.005, 0, 0.003); [[-1, 0], [1, 0]].forEach(([s]) => inB(g, cb, 0.01, h, d, s * w / 2, h / 2, 0, 0.003)); [-1, 1].forEach((s) => inB(g, cb, w, h, 0.01, 0, h / 2, s * d / 2, 0.003));
  [-1, 1].forEach((s) => { const f = inB(g, cb, w, 0.008, d * 0.45, 0, h, s * (d / 2 + d * 0.2), 0.003); f.rotation.x = s * -0.5; });
  return g;
}
function inTexCash() { return inTex('cash2', (x, w, h) => { x.fillStyle = '#7fae74'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2f5a3a'; x.lineWidth = 5; x.strokeRect(8, 8, w - 16, h - 16); x.fillStyle = '#4f8a5a'; x.beginPath(); x.ellipse(w / 2, h / 2, 26, 30, 0, 0, TAU); x.fill(); x.fillStyle = '#1f4a2a'; x.font = 'bold 28px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('100', 40, 26); x.fillText('100', w - 40, h - 26); x.fillStyle = '#d8b46a'; x.fillRect(w * 0.42, 0, w * 0.16, h); x.fillStyle = '#5a3a1a'; x.font = 'bold 16px Helvetica'; x.save(); x.translate(w / 2, h / 2); x.rotate(-Math.PI / 2); x.fillText('$10,000', 0, 0); x.restore(); }, 256, 110); }
function inCashGeo() { return inGeo('cashstack', () => { const g = inRBox(0.156, 0.03, 0.067, 0.004).clone(); return g; }); }
function inCashMat() { return IN_MC.cashMat || (IN_MC.cashMat = [inM('#d8e6cc', 0.7, { map: inTexFabric('paper') }), inM(null, 0.6, { map: inTexCash() })]); }
// a stack of cash bundles (instanced), count shown = n
function inCashPile(S, max, x, y, z, seed) {
  const cm = inTexCash().clone(); cm.needsUpdate = true; cm.repeat.set(1 / 0.156, 1 / 0.067); cm.offset.set(0.5, 0.5); const im = new THREE.InstancedMesh(inRBox(0.156, 0.03, 0.067, 0.004), inM(null, 0.6, { map: cm }), max), R = RNG('in-cash', seed), slots = [];
  for (let i = 0; i < max; i++) { const lay = Math.floor(i / 12), j = i % 12; slots.push([x + ((j % 4) - 1.5) * 0.17 + R.n(0.01) + lay * 0.01, y + 0.015 + lay * 0.031, z + (Math.floor(j / 4) - 1) * 0.075 + R.n(0.008), R.n(0.08)]); }
  im.userData.slots = slots; im.frustumCulled = false; im.castShadow = true; im.receiveShadow = true; S.add(im); inCashSet(im, max); return im;
}
function inCashSet(im, n) { const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); im.userData.slots.forEach(([x, y, z, a], i) => { q.setFromAxisAngle(V3(0, 1, 0), a); m4.compose(V3(x, y, z), q, V3(i < n ? 1 : 0, i < n ? 1 : 0, i < n ? 1 : 0)); im.setMatrixAt(i, m4); }); im.instanceMatrix.needsUpdate = true; }
function inStringLights(S, a, b, n, sag, col = '#ffd890') { const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) - sag * 4 * u * (1 - u), lerp(a[2], b[2], u)]); } inAdd(S, inTube(pts, 0.004, 4), inM('#222', 0.6), 0, 0, 0, 0, 0, 0, false); pts.forEach((p, i) => { if (i % 1 === 0) { inSph(S, inBasic(col, 3), 0.018, p[0], p[1] - 0.03, p[2]); inGlow(S, col, 0.22, p[0], p[1] - 0.03, p[2], 0.4); } }); }
function inBunting(S, a, b, n, sag) { const pal = ['#ff4a5a', '#ffd23a', '#3ac0ff', '#7ae05a', '#ff8ad8']; const geo = inGeo('flag', () => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([-0.07, 0, 0, 0.07, 0, 0, 0, -0.15, 0], 3)); g.computeVertexNormals(); return g; }); const pts = []; for (let i = 0; i <= n; i++) { const u = i / n; pts.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u) - sag * 4 * u * (1 - u), lerp(a[2], b[2], u)]); if (i < n) { const f = inAdd(S, geo, inM(pal[i % 5], 0.7, { side: THREE.DoubleSide }), pts[i][0] + (b[0] - a[0]) / n / 2, pts[i][1] - 0.01, pts[i][2] + (b[2] - a[2]) / n / 2, Math.atan2(-(b[2] - a[2]), b[0] - a[0])); f.castShadow = false; } } inAdd(S, inTube(pts, 0.003, 4), inM('#f4f0e8', 0.6), 0, 0, 0, 0, 0, 0, false); }
function inWallGrid(S, x0, x1, y0, y1, z, mat, mullion, sky) {   // a big window wall: emissive view + mullions
  inPlane(S, sky, x1 - x0, y1 - y0, (x0 + x1) / 2, (y0 + y1) / 2, z - 0.3);
  for (let x = x0; x <= x1 + 1e-6; x += (x1 - x0) / Math.round((x1 - x0) / 1.4)) inB(S, mullion, 0.07, y1 - y0, 0.1, x, (y0 + y1) / 2, z, 0.01);
  [y0, y1, y0 + (y1 - y0) * 0.78].forEach((y) => inB(S, mullion, x1 - x0, 0.07, 0.1, (x0 + x1) / 2, y, z, 0.01));
}

// =====================================================================
//  ROOM: the lottery press room (cheque, again, Joan Ginther)
// =====================================================================
function inTexBackdrop(texas) {
  return inTex('backdrop' + (texas ? 'tx' : ''), (x, w, h) => {
    x.fillStyle = texas ? '#f4efe6' : '#f2f5fa'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
      const cx = (c + (r % 2 ? 0.5 : 0)) * w / 5.5 + 30, cy = (r + 0.5) * h / 5;
      if (texas) { x.fillStyle = '#b8202e'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 11 : 26; x.lineTo(cx - 60 + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); x.fillStyle = '#1d3a7a'; x.font = '900 30px Helvetica, Arial'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('TEXAS', cx - 26, cy - 14); x.fillStyle = '#b8202e'; x.font = '900 22px Helvetica, Arial'; x.fillText('LOTTERY', cx - 26, cy + 14); }
      else { const g = x.createRadialGradient(cx - 58, cy - 6, 2, cx - 52, cy, 26); g.addColorStop(0, '#ffe27a'); g.addColorStop(1, '#e0a018'); x.fillStyle = g; x.beginPath(); x.arc(cx - 52, cy, 24, 0, TAU); x.fill(); x.fillStyle = '#1d3a7a'; x.font = '900 28px Helvetica, Arial'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('STATE', cx - 20, cy - 13); x.fillStyle = '#2a7ad8'; x.font = '900 22px Helvetica, Arial'; x.fillText('LOTTERY', cx - 20, cy + 14); }
    }
  }, 1024, 512);
}
function inTexCheque(key, name, amount, words, texas) {
  return inTex('cheque' + key, (x, w, h) => {
    const R = RNG('in-cheque', key); const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, texas ? '#fff6e8' : '#eef6ff'); g.addColorStop(1, texas ? '#f6e2c4' : '#d6e8fa'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = texas ? 'rgba(184,32,46,0.12)' : 'rgba(42,122,216,0.12)'; x.lineWidth = 2; for (let i = 0; i < 40; i++) { x.beginPath(); x.moveTo(0, i * 14); x.bezierCurveTo(w * 0.3, i * 14 - 30, w * 0.6, i * 14 + 30, w, i * 14); x.stroke(); }
    x.fillStyle = texas ? '#b8202e' : '#1d3a7a'; x.fillRect(0, 0, w, 64); x.fillStyle = '#fff'; x.font = '900 40px Helvetica, Arial'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(texas ? 'TEXAS LOTTERY COMMISSION' : 'STATE LOTTERY  ·  POWERBALL', 28, 34);
    x.fillStyle = '#333'; x.font = '22px Helvetica, Arial'; x.fillText('PAY TO THE', 30, 120); x.fillText('ORDER OF', 30, 146); x.textAlign = 'right'; x.fillText(texas ? 'DATE  06 / 2010' : 'DATE  ' + R.i(1, 12) + ' / 2026', w - 30, 100);
    x.textAlign = 'left'; x.fillStyle = '#111'; x.font = 'italic 52px Georgia'; x.fillText(name, 170, 136); x.fillRect(165, 162, 560, 2);
    x.fillStyle = '#fff'; x.fillRect(w - 300, 108, 270, 66); x.strokeStyle = '#333'; x.lineWidth = 2; x.strokeRect(w - 300, 108, 270, 66); x.fillStyle = '#111'; x.font = 'bold 44px Helvetica, Arial'; x.textAlign = 'center'; x.fillText(amount, w - 165, 142);
    x.textAlign = 'left'; x.font = 'italic 30px Georgia'; x.fillText(words, 40, 230); x.fillRect(30, 250, w - 380, 2);
    x.strokeStyle = '#1a2a5a'; x.lineWidth = 3; x.beginPath(); x.moveTo(w - 330, 290); for (let i = 0; i < 12; i++) x.quadraticCurveTo(w - 320 + i * 22, 250 + R.r(-25, 25), w - 310 + i * 22, 290); x.stroke(); x.fillStyle = '#333'; x.font = '16px Helvetica'; x.fillText('AUTHORIZED SIGNATURE', w - 330, 312);
  }, 1024, 340);
}
function inLotto(g) {
  const R = IN.rooms; if (R.lotto) return R.lotto;
  const S = new THREE.Scene(), L = R.lotto = { S };
  inPlane(S, inM('#2a3040', 0.95, { map: inTexFabric('carpet') }), 14, 12, 0, 0, 0, 0, -Math.PI / 2).receiveShadow = true;
  const wm = inM('#7d8aa0', 0.85, { map: inTexPlaster() });
  inB(S, wm, 14, 3.6, 0.2, 0, 1.8, -3.4, 0.01); inB(S, wm, 0.2, 3.6, 12, -5.5, 1.8, 0, 0.01); inB(S, wm, 0.2, 3.6, 12, 5.5, 1.8, 0, 0.01);
  inPlane(S, inM('#3a3e48', 0.9), 14, 12, 0, 3.6, 0, 0, Math.PI / 2);
  for (let i = -2; i <= 2; i++) for (let j = 0; j < 3; j++) { inAdd(S, inGeo('dl', () => new THREE.CircleGeometry(0.08, 20)), inBasic('#fff4e0', 3), i * 1.6, 3.59, -2.5 + j * 2, 0, Math.PI / 2, 0, false); }
  // step-and-repeat on a frame, a little stage
  L.bd = inM('#c8c2b8', 0.85, { map: inTexBackdrop(false) }); L.bdTx = inM('#c8c2b8', 0.85, { map: inTexBackdrop(true) });
  inB(S, inM('#2a2e36', 0.5), 5.2, 2.6, 0.04, -0.4, 1.5, -3.02, 0.01).castShadow = false; L.backdrop = inPlane(S, L.bd, 5.2, 2.6, -0.4, 1.5, -2.975); L.backdrop.receiveShadow = false;
  [-3.05, 2.25].forEach((x) => inB(S, inM('#2a2e36', 0.3, { metalness: 0.7 }), 0.06, 2.8, 0.06, x, 1.4, -2.98, 0.01));
  inB(S, inM('#2a3a5a', 0.5, { map: inTexFabric('stage') }), 6.0, 0.18, 2.6, -0.4, 0.09, -1.8, 0.02);
  L.podium = new THREE.Group(); L.podium.position.set(-2.5, 0.18, -1.9); S.add(L.podium);
  inB(L.podium, inM(null, 0.35, { map: inTexWood('pod', '#5a3a22', '30,18,8', '150,100,60', 5, 256), clearcoat: 0.4 }), 0.62, 1.1, 0.46, 0, 0.55, 0, 0.03);
  inB(L.podium, inM('#1d3a7a', 0.4), 0.5, 0.34, 0.01, 0, 0.72, 0.235, 0.01);
  L.podLogo = inPlane(L.podium, inBasic('#ffffff', 1, { map: inTexText('podlogo', 256, 160, '#1d3a7a', [['STATE', 0.38, 46, '#ffd23a', '900'], ['LOTTERY', 0.7, 40, '#ffffff', '900']]) }), 0.46, 0.29, 0, 0.72, 0.242);
  inAdd(L.podium, inTube([[0.1, 1.1, 0.05], [0.12, 1.3, 0.15], [0.1, 1.38, 0.24]], 0.006, 5), inM('#222', 0.4)); inSph(L.podium, inM('#222', 0.5), 0.022, 0.1, 1.38, 0.25);
  // flags + plants + a pull-up banner + chairs for the press
  [[2.9, -2.7, '#1d3a7a'], [3.4, -2.7, '#b8202e']].forEach(([x, z, c]) => { inCyl(S, inM('#c8b070', 0.25, { metalness: 1 }), 0.015, 0.015, 2.4, x, 1.2, z, 8); const fl = inAdd(S, inGeo('flagp', () => { const g2 = new THREE.PlaneGeometry(0.5, 0.75, 6, 8), P = g2.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, 0.05 * Math.sin(P.getY(i) * 6 + P.getX(i) * 3)); g2.computeVertexNormals(); g2.translate(0, -0.37, 0); return g2; }), inM(c, 0.7, { side: THREE.DoubleSide, map: inTexFabric('flag') }), x, 2.3, z + 0.02); fl.rotation.set(0, 0, 0.05); });
  inPlant(S, -4.8, -2.8, { h: 1.7, pot: 0.24, n: 36, leaf: 0.17, wide: 1.2, seed: 21, potCol: '#e8e4dc' });
  inPlant(S, 4.6, -2.7, { h: 1.5, pot: 0.22, n: 30, leaf: 0.18, wide: 1.2, seed: 22, potCol: '#2a2e36' });
  L.oldCheques = [0, 1, 2].map((i) => { const m = new THREE.Group(); m.position.set(3.4 + i * 0.07, 0.3, -3.12 + i * 0.12); m.rotation.set(-0.18, -0.15 + i * 0.05, 0); S.add(m); inB(m, inM('#f4f4f0', 0.6), 1.5, 0.5, 0.02, 0, 0, 0, 0.004); inPlane(m, inM(null, 0.6, { map: inTexCheque('old' + i, 'You', ['$96,000,000', '$214,000,000', '$431,000,000'][i], '', false) }), 1.48, 0.48, 0, 0, 0.011); return m; });
  for (let i = 0; i < 6; i++) { const c = new THREE.Group(); c.position.set(-2.4 + i * 0.75, 0, 1.9); S.add(c); inB(c, inM('#2a2e36', 0.5, { map: inTexFabric('pchair') }), 0.44, 0.06, 0.44, 0, 0.46, 0, 0.02); inB(c, inM('#2a2e36', 0.5), 0.44, 0.44, 0.05, 0, 0.72, 0.22, 0.02); [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(([x, z]) => inCyl(c, inM('#888', 0.3, { metalness: 1 }), 0.012, 0.012, 0.46, x, 0.23, z, 6)); }
  // the giant cheque
  L.cheque = new THREE.Group(); S.add(L.cheque); inB(L.cheque, inM('#f4f4f0', 0.6), 1.7, 0.57, 0.02, 0, 0, 0, 0.008); L.chequeFace = inPlane(L.cheque, inM('#ffffff', 0.6), 1.68, 0.55, 0, 0, 0.0105); L.chequeFace.receiveShadow = true;
  L.chequeMats = {};
  // cameras' flashes
  L.flash = inPt(S, '#eef4ff', 0, 0, 1.8, 1.5, 9, 1.4);
  L.flashSpr = [0, 1, 2, 3].map(() => inGlow(S, '#ffffff', 1.0, 0, 0, 0, 0));
  S.add(new THREE.HemisphereLight(inCol('#fff0e0'), inCol('#4a3828'), 0.25));
  L.key = inKey(S, '#ffd8a8', 2.5, [2.5, 5.5, 4.5], [-0.3, 1.0, -1.6], 4.5);
  const rim = new THREE.DirectionalLight(inCol('#c8d8ff'), 1.2); rim.position.set(-3, 4, -2); S.add(rim);
  inPt(S, '#ffe0c0', 1.0, -1.5, 2.5, 2.0, 8, 1.5);
  S.environment = inEnv(g.r, '#221e1c', [['#ffe8d0', 0.7, 0, 3.9, 0, 6, 4, Math.PI / 2], ['#ffe0c0', 0.35, 0, 1.8, 5, 6, 2]]);
  return L;
}
function inChequeTex(L, key, name, amount, words, texas) { const k2 = key; if (!L.chequeMats[k2]) L.chequeMats[k2] = inM(null, 0.55, { map: inTexCheque(k2, name, amount, words, texas) }); L.chequeFace.material = L.chequeMats[k2]; }
function inFlashes(L, t, cams, rate = 1) {
  let I = 0; L.flashSpr.forEach((sp, i) => { const c = cams[i % cams.length], ph = ((t * rate * (0.9 + i * 0.37) + i * 0.41) % 1), f = Math.max(0, 1 - ph / 0.06); sp.position.set(c[0], c[1], c[2]); sp.material.opacity = f; sp.scale.setScalar(0.25 + 1.2 * f); sp.visible = f > 0.01; I = Math.max(I, f); });
  L.flash.intensity = 1.5 * I;
}
const IN_CHEQUE_WORDS = { a: 'One billion five hundred eighty-six million', b: 'Ninety-six million and no cents', c: 'Two hundred fourteen million', d: 'Four hundred thirty-one million' };
function inLottoCast(L, t, o) {
  const S = L.S; inHideX(S);
  const off = inXP(S, inX('official', 'official', { sex: 'm', age: 'adult', outfit: 'suit', colors: { top: '#2b2f38', tie: '#8a2a2a' } }), { pose: 'hold', expr: o.offExpr ?? 'happy', look: o.offLook ?? [-6, 0], pos: [0.62, 0.18, -1.62], rot: o.offRot ?? -8, t });
  const off2 = o.second ? inXP(S, inX('official2', 'official2', { sex: 'f', age: 'adult', outfit: 'suit', colors: { top: '#3a3f4a' }, glasses: true }), { pose: o.second.pose ?? 'stand', expr: o.second.expr ?? 'neutral', look: o.second.look ?? [-25, 0], pos: [1.55, 0.18, -2.15], rot: -25, add: o.second.add, t }) : null;
  // press photographers in the foreground (backs / profiles), cameras raised
  const ph = [['phot1', 'p1', { sex: 'm', outfit: 'casual', colors: { top: '#3a3f4a' } }, [-1.6, 0, 1.0], 160], ['phot2', 'p2', { sex: 'f', outfit: 'casual', colors: { top: '#7a3a3a' } }, [2.35, 0, 1.15], 205]];
  ph.forEach(([key, seed, op, pos, rot], i) => { const X = inXP(S, inX(key, seed, op), { pose: 'hold', expr: 'neutral', pos, rot, add: { shL: [-50, 0, 0], shR: [-50, 0, 0], elL: [-40, 0, 0], elR: [-40, 0, 0], head: [8, 0, 0] }, t: t + i }); if (!L['cam' + i]) { const c = new THREE.Group(); inB(c, inM('#1a1a1c', 0.4), 0.14, 0.1, 0.08, 0, 0, 0, 0.01); inCyl(c, inM('#111', 0.3), 0.04, 0.045, 0.12, 0, 0, 0.09).rotation.x = Math.PI / 2; inB(c, inM('#222', 0.3), 0.05, 0.06, 0.04, 0.04, 0.08, 0, 0.005); S.add(c); L['cam' + i] = c; } const c = L['cam' + i]; const p = inXGrip(X, 'L').add(inXGrip(X, 'R')).multiplyScalar(0.5); c.position.copy(p).add(V3(0, 0.04, 0)); c.rotation.y = rot * DEG; });
  return { off, off2, cams: [0, 1].map((i) => L['cam' + i].position.clone().add(V3(0, 0.12, 0))) };
}
function inShotCheque(g, t, b) {
  const L = inLotto(g), S = L.S, u = t - b.t0, k = b.k;
  L.backdrop.material = L.bd; L.podLogo.visible = true; L.oldCheques.forEach((m) => { m.visible = false; });
  inChequeTex(L, 'main', 'You', '$1,586,400,000', IN_CHEQUE_WORDS.a, false);
  const C = inLottoCast(L, t, {});
  const lift = ss(0.05, 0.2, k);
  inHero(S, { pose: [['hold', 1 - lift * 0.3], ['cheer', lift * 0.3]], expr: [['joy', 0.7], ['amazed', 0.3]], look: [6, 4], pos: [-0.5, 0.18, -1.6], rot: 10, t });
  L.cheque.position.set(0.05, 1.12 + 0.06 * lift + 0.01 * Math.sin(t * 2), -1.28); L.cheque.rotation.set(0, 0.02, 0.02 * Math.sin(t * 1.3));
  inFlashes(L, t, C.cams, 1.3);
  const q = EZ.io(k);
  shotCam(g, [lerp(0.75, 0.95, q), lerp(1.4, 1.36, q), lerp(2.7, 2.2, q)], [lerp(0.6, 0.7, q), 1.3, -1.6], 30, 0.6, t);
  inPresent(g, S, { exp: 0.86, bloom: 0.28, dof: { fd: g.cam.position.distanceTo(V3(0, 1.2, -1.5)), ap: 9, mx: 18 } });
}
function inShotAgain(g, t, b) {
  const L = inLotto(g), S = L.S, k = b.k, cut = k < 0.34 ? 0 : k < 0.67 ? 1 : 2, lk = (k - [0, 0.34, 0.67][cut]) / 0.33;
  L.backdrop.material = L.bd; L.podLogo.visible = true; L.oldCheques.forEach((m, i) => { m.visible = i <= cut; });
  inChequeTex(L, 'again' + cut, 'You', ['$96,000,000', '$214,000,000', '$431,000,000'][cut], [IN_CHEQUE_WORDS.b, IN_CHEQUE_WORDS.c, IN_CHEQUE_WORDS.d][cut], false);
  const sus = (cut + lk) / 3;
  const C = inLottoCast(L, t, { offExpr: [['neutral', 1 - sus], ['worried', sus]], offLook: [-22, -2], offRot: -14, second: { pose: [['hold', 0.6], ['stand', 0.4]], expr: [['worried', 0.6 + sus * 0.4]], look: [-30, 0], add: { elL: [-30, 0, 0], elR: [-30, 0, 0] } } });
  const P = [{ pose: [['cheer', 0.5], ['hold', 0.5]], expr: 'joy' }, { pose: 'hold', expr: 'smug' }, { pose: [['hold', 0.6], ['shrug', 0.4]], expr: [['smug', 0.6], ['happy', 0.4]] }][cut];
  inHero(S, Object.assign({ look: [8, 2], pos: [-0.5, 0.18, -1.6], rot: 10, t }, P));
  L.cheque.position.set(0.05, 1.12, -1.28); L.cheque.rotation.set(0, 0.02, [0.03, -0.02, 0.04][cut]);
  inFlashes(L, t, C.cams, 1.8);
  const cams = [[[-1.0, 1.45, 2.4], [0.3, 1.25, -1.7], 32], [[1.7, 1.25, 2.0], [-0.1, 1.3, -1.8], 34], [[0.2, 1.55, 2.8], [0.25, 1.2, -1.8], 28]][cut];
  const pos = cams[0].map((v, i) => v + (i === 2 ? -0.35 * lk : i === 0 ? 0.15 * lk : 0));
  shotCam(g, pos, cams[1], cams[2], 0.7, t);
  inPresent(g, S, { exp: 0.86, bloom: 0.28, dof: { fd: g.cam.position.distanceTo(V3(0, 1.2, -1.5)), ap: 9, mx: 18 } });
}
function inShotGinther(g, t, b) {
  const L = inLotto(g), S = L.S, k = b.k;
  L.backdrop.material = L.bdTx; L.podLogo.visible = false; L.oldCheques.forEach((m) => { m.visible = false; });
  inChequeTex(L, 'ginther', 'Joan R. Ginther', '$10,000,000', 'Ten million dollars and no cents', true);
  { const c = chBuild(); if (c.root.parent === S) S.remove(c.root); }
  const C = inLottoCast(L, t, { offExpr: 'happy', offLook: [-8, 0] });
  inXP(S, inX('ginther', 'ginther', { sex: 'f', age: 'old', hair: 'bob', hairColor: 'white', glasses: true, outfit: 'casual', colors: { top: '#7a2f45', bottom: '#2a2f38' }, skin: 0.32 }), { pose: 'hold', expr: [['happy', 0.8], ['smug', 0.2]], look: [8, 2], pos: [-0.62, 0.18, -1.55], rot: 18, t });
  L.cheque.position.set(0.3, 0.9, -1.28); L.cheque.rotation.set(0, 0.02, 0.0);
  inFlashes(L, t, C.cams, 1.1);
  const q = EZ.io(k);
  shotCam(g, [lerp(0.35, 0.45, q), lerp(1.45, 1.42, q), lerp(1.9, 1.55, q)], [lerp(0.15, 0.22, q), 1.32, -1.6], 30, 0.5, t);
  inPresent(g, S, { exp: 0.86, bloom: 0.28, vig: 0.4, lift: [0.004, 0.002, 0.0], dof: { fd: g.cam.position.distanceTo(V3(0, 1.2, -1.5)), ap: 9, mx: 18 } });
}

// =====================================================================
//  ROOM: the café (100th customer)
// =====================================================================
const inTexBrick = () => inTex('brick', (x, w, h) => { const R = RNG('in-brick'); x.fillStyle = '#d8cfc2'; x.fillRect(0, 0, w, h); const bh = h / 8, bw = w / 4; for (let i = 0; i < 8; i++) for (let j = -1; j < 5; j++) { const x0 = j * bw + (i % 2) * bw / 2, r = R.r(150, 196), g2 = r * R.r(0.5, 0.6), b2 = r * R.r(0.38, 0.46); x.fillStyle = `rgb(${r},${g2},${b2})`; x.beginPath(); x.roundRect(x0 + 3, i * bh + 3, bw - 6, bh - 6, 3); x.fill(); for (let k = 0; k < 30; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '0,0,0' : '255,240,220'},${R.r(0.03, 0.14)})`; x.fillRect(x0 + R.r(3, bw - 6), i * bh + R.r(3, bh - 6), 2.5, 2.5); } } inBlotch(x, w, h, R, 10, 0.12, 30, 120); }, 512, 512);
function inTexMenu(key, title, items) { return inTex('menu' + key, (x, w, h) => { const R = RNG('in-menu', key); x.fillStyle = '#20262a'; x.fillRect(0, 0, w, h); inBlotch(x, w, h, R, 14, 0.08, 30, 140); x.strokeStyle = '#c8a46a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); x.fillStyle = '#f4efe2'; x.font = 'italic bold 54px Georgia'; x.textAlign = 'center'; x.fillText(title, w / 2, 76); x.font = '30px Georgia'; items.forEach(([a, p2], i) => { x.textAlign = 'left'; x.fillStyle = 'rgba(244,239,226,0.92)'; x.fillText(a, 40, 140 + i * 46); x.textAlign = 'right'; x.fillStyle = '#ffd890'; x.fillText(p2, w - 40, 140 + i * 46); }); x.strokeStyle = 'rgba(244,239,226,0.5)'; x.lineWidth = 2; x.beginPath(); x.moveTo(60, 100); x.lineTo(w - 60, 100); x.stroke(); }, 512, 420); }
function inCafe(g) {
  const R = IN.rooms; if (R.cafe) return R.cafe;
  const S = new THREE.Scene(), C = R.cafe = { S };
  const floorT = inTex('cafefloor', (x, w, h) => { const R0 = RNG('in-cfl'); const n = 8, c = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? '#2a2826' : '#e8e2d6'; x.fillRect(i * c, j * c, c, c); x.fillStyle = `rgba(${R0.f() < 0.5 ? '0,0,0' : '255,255,255'},${R0.r(0, 0.05)})`; x.fillRect(i * c, j * c, c, c); } x.strokeStyle = 'rgba(120,110,100,0.5)'; x.lineWidth = 1.5; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * c, 0); x.lineTo(i * c, h); x.moveTo(0, i * c); x.lineTo(w, i * c); x.stroke(); } inGrain(x, w, h, R0, 6000, 0.05, 1.5); }, 512, 512);
  const fm = inM(null, 0.3, { map: floorT, envMapIntensity: 0.6 }); fm.map = floorT.clone(); fm.map.needsUpdate = true; fm.map.repeat.set(5, 4);
  inPlane(S, fm, 9, 7, 0, 0, 0, 0, -Math.PI / 2).receiveShadow = true;
  const brick = inTexBrick().clone(); brick.needsUpdate = true; brick.repeat.set(5, 2);
  inB(S, inM(null, 0.9, { map: brick }), 9, 3.2, 0.2, 0, 1.6, -3.1, 0.01);
  inB(S, inM('#2f4a3e', 0.85, { map: inTexPlaster() }), 0.2, 3.2, 7, -3.6, 1.6, 0.2, 0.01).castShadow = false; inB(S, inM('#2f4a3e', 0.85, { map: inTexPlaster() }), 0.2, 3.2, 7, 3.8, 1.6, 0.2, 0.01);
  inPlane(S, inM('#3a2e26', 0.8, { map: inTexWood('ceil', '#5a4030', '30,20,10', '140,100,70', 10, 256) }), 9, 7, 0, 3.2, 0, 0, Math.PI / 2);
  // window (left wall) with the street
  C.sky = inBasic('#ffffff', 1.5, { map: inTexSky('day') });
  inPlane(S, C.sky, 3.4, 2.4, -3.95, 1.55, -0.2, Math.PI / 2);
  const wf = inM('#1e2a24', 0.4); [[-1.6], [-0.4], [0.8], [1.2]].forEach(([z], i) => { if (i < 3) inB(S, wf, 0.08, 2.3, 0.07, -3.48, 1.5, z, 0.01); }); [0.35, 2.65, 2.05].forEach((y) => inB(S, wf, 0.08, 0.07, 2.5, -3.48, y, -0.4, 0.01));
  // counter: slatted wood front, marble top
  const slat = inTex('slat', (x, w, h) => { const R0 = RNG('in-slat'); for (let i = 0; i < 16; i++) { const v = R0.r(150, 190); x.fillStyle = `rgb(${v},${v * 0.72},${v * 0.5})`; x.fillRect(i * w / 16, 0, w / 16, h); x.fillStyle = 'rgba(40,20,10,0.6)'; x.fillRect(i * w / 16, 0, 2, h); for (let k = 0; k < 10; k++) { x.strokeStyle = `rgba(80,45,20,${R0.r(0.05, 0.2)})`; x.beginPath(); const xx = i * w / 16 + R0.r(3, w / 16 - 3); x.moveTo(xx, 0); x.lineTo(xx + R0.n(3), h); x.stroke(); } } }, 512, 256);
  const slatM = inM(null, 0.5, { map: slat });
  inB(S, slatM, 4.0, 1.0, 0.7, -0.3, 0.5, -1.35, 0.01);
  const marble = inTex('marble', (x, w, h) => { const R0 = RNG('in-marble'); x.fillStyle = '#f2efea'; x.fillRect(0, 0, w, h); for (let i = 0; i < 14; i++) { x.strokeStyle = `rgba(120,115,110,${R0.r(0.08, 0.3)})`; x.lineWidth = R0.r(0.6, 2); x.beginPath(); let px = R0.r(0, w), py = 0; x.moveTo(px, py); for (let k = 0; k < 12; k++) { px += R0.n(40); py += h / 12; x.lineTo(px, py); } x.stroke(); } inBlotch(x, w, h, R0, 10, 0.04); }, 512, 512);
  C.marble = inM(null, 0.12, { map: marble, clearcoat: 0.8, clearcoatRoughness: 0.08 });
  inB(S, C.marble, 4.1, 0.05, 0.8, -0.3, 1.025, -1.35, 0.01);
  // back bar, espresso machine, grinder, cups, shelves, menu boards, plants
  inB(S, inM('#20302a', 0.5), 4.4, 0.95, 0.6, -0.3, 0.475, -2.7, 0.01); inB(S, C.marble, 4.4, 0.04, 0.62, -0.3, 0.97, -2.7, 0.01);
  const em = new THREE.Group(); em.position.set(-0.7, 0.99, -2.72); S.add(em);
  const chrome = inM('#e8e8e8', 0.12, { metalness: 1 }), red = inM('#b8282e', 0.25, { clearcoat: 0.8 });
  inB(em, chrome, 0.9, 0.42, 0.5, 0, 0.21, 0, 0.04); inB(em, red, 0.92, 0.12, 0.52, 0, 0.36, 0, 0.03); inB(em, chrome, 0.9, 0.06, 0.48, 0, 0.45, 0, 0.02);
  [-0.22, 0.22].forEach((x) => { inCyl(em, chrome, 0.045, 0.05, 0.08, x, 0.13, 0.27); inAdd(em, inTube([[x, 0.12, 0.3], [x, 0.11, 0.42]], 0.012, 6), inM('#1a1a1a', 0.4)); const cup = new THREE.Group(); cup.position.set(x, 0.0, 0.3); em.add(cup); inAdd(cup, inLathe('esp', [[0, 0], [0.025, 0], [0.032, 0.05], [0.03, 0.05], [0, 0.008]]), inM('#f4f0e8', 0.25, { side: THREE.DoubleSide })); });
  [-0.1, 0.1].forEach((x) => { inCyl(em, chrome, 0.035, 0.035, 0.03, x, 0.28, 0.25); }); C.steam = [];
  inCyl(em, chrome, 0.05, 0.06, 0.18, 0.62, 0.09, 0.0); inAdd(em, inLathe('hopper', [[0.03, 0], [0.08, 0.15], [0.085, 0.16], [0.0, 0.16]]), inM('#5a3a22', 0.4, { transparent: true, opacity: 0.85 }), 0.62, 0.18, 0.0);
  for (let i = 0; i < 6; i++) { const cup = new THREE.Group(); cup.position.set(1.0 + (i % 3) * 0.12, 0.99 + Math.floor(i / 3) * 0.1, -2.75); S.add(cup); inAdd(cup, inLathe('cupw', [[0, 0], [0.04, 0], [0.05, 0.095], [0.046, 0.095], [0, 0.01]]), inM('#f4f0e8', 0.25, { side: THREE.DoubleSide })); }
  const sh = inM(null, 0.5, { map: inTexWood('cshelf', '#8a5a34', '40,20,10', '200,150,100', 4, 256) });
  [1.55, 1.95].forEach((y) => inB(S, sh, 2.2, 0.04, 0.26, 1.1, y, -2.9, 0.008));
  const jarM = inM('#e8f0f0', 0.05, { transparent: true, opacity: 0.35, envMapIntensity: 2 }), beans = inM('#4a2a18', 0.6);
  for (let i = 0; i < 7; i++) { const x = 0.2 + i * 0.3; inCyl(S, jarM, 0.06, 0.06, 0.18, x, 1.66, -2.88, 16); inCyl(S, beans, 0.055, 0.055, 0.1 + (i % 3) * 0.02, x, 1.63, -2.88, 12); inCyl(S, inM('#2a2a2a', 0.4), 0.063, 0.063, 0.02, x, 1.76, -2.88, 16); }
  for (let i = 0; i < 4; i++) inPlant(S, 0.25 + i * 0.6, -2.9, { y: 1.97, h: 0.3, pot: 0.06, n: 10, leaf: 0.4, seed: 30 + i, potCol: ['#e8e0d0', '#c4704e', '#3a4a5a', '#e8e0d0'][i] });
  inFrame(S, 1.0, 0.82, -1.5, 2.0, -2.98, 0, inTexMenu('a', 'Coffee', [['Espresso', '2.80'], ['Flat White', '3.90'], ['Cappuccino', '3.80'], ['Latte', '4.20'], ['Cold Brew', '4.50'], ['Mocha', '4.60']]), '#5a3a22');
  inFrame(S, 0.8, 0.82, -0.4, 2.0, -2.98, 0, inTexMenu('b', 'Bakery', [['Croissant', '3.20'], ['Pain au choc', '3.60'], ['Banana bread', '3.40'], ['Cinnamon roll', '3.90'], ['Cookie', '2.50']]), '#5a3a22');
  // pastry case on the counter
  const pc = new THREE.Group(); pc.position.set(0.95, 1.05, -1.35); S.add(pc);
  inB(pc, inM('#e8eef2', 0.04, { transparent: true, opacity: 0.18, envMapIntensity: 2.5 }), 0.9, 0.42, 0.55, 0, 0.21, 0, 0.01);
  inB(pc, inM('#2a2a2a', 0.4), 0.92, 0.03, 0.57, 0, 0.43, 0, 0.005);
  const pastry = inM('#d89a4a', 0.55, { clearcoat: 0.4 }), dough = inM('#e8c48a', 0.6);
  for (let i = 0; i < 4; i++) { const cr = inSph(pc, pastry, 0.06, -0.3 + i * 0.2, 0.06, 0.08, 1.3, 0.55, 0.8); cr.rotation.y = 0.4 * i; inAdd(pc, inGeo('roll', () => new THREE.TorusGeometry(0.04, 0.025, 10, 18).rotateX(Math.PI / 2)), dough, -0.3 + i * 0.2, 0.05, -0.12); }
  for (let i = 0; i < 4; i++) inSph(pc, inM('#7a4a2a', 0.6), 0.045, -0.3 + i * 0.2, 0.25, 0.0, 1, 0.35, 1);
  inB(pc, inM('#f4f0e8', 0.4), 0.85, 0.01, 0.5, 0, 0.2, 0, 0.003);
  // register + the bell + tip jar
  const reg = new THREE.Group(); reg.position.set(-1.6, 1.05, -1.4); reg.rotation.y = 0.4; S.add(reg); inB(reg, inM('#e8e4dc', 0.4), 0.3, 0.06, 0.26, 0, 0.03, 0, 0.02); inB(reg, inM('#1a1a1a', 0.3), 0.26, 0.2, 0.02, 0, 0.18, -0.06, 0.01).rotation.x = -0.3; inPlane(reg, inBasic('#ffffff', 0.9, { map: inTexScreen('reg', ['#f4f0e8', '#2f7a5a', '#e8a03a']) }), 0.23, 0.17, 0, 0.18, -0.048);
  inCyl(S, inM('#e8f0f0', 0.05, { transparent: true, opacity: 0.3 }), 0.06, 0.06, 0.16, -1.2, 1.13, -1.15, 16);
  C.bell = new THREE.Group(); S.add(C.bell);
  inAdd(C.bell, inLathe('bell', [[0, 0.09], [0.02, 0.085], [0.035, 0.05], [0.05, 0.0], [0.055, -0.01], [0, -0.005]]), inM('#e0b050', 0.2, { metalness: 1 })); inCyl(C.bell, inM('#3a2010', 0.5), 0.012, 0.014, 0.1, 0, 0.14, 0, 10);
  C.cup = new THREE.Group(); S.add(C.cup);
  inAdd(C.cup, inLathe('tcup', [[0, 0], [0.032, 0], [0.045, 0.13], [0.047, 0.135], [0, 0.135]]), inM('#f4efe6', 0.5)); inCyl(C.cup, inM('#3a6a4a', 0.6), 0.046, 0.042, 0.05, 0, 0.07, 0, 20); inCyl(C.cup, inM('#ffffff', 0.4), 0.049, 0.049, 0.015, 0, 0.142, 0, 20);
  C.stTex = inTex('steam', (x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 64, 64);
  C.puffs = [0, 1, 2, 3, 4].map(() => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: C.stTex, transparent: true, depthWrite: false, opacity: 0.3 })); S.add(sp); return sp; });
  // banner + bunting + pendants + table by the window
  C.banner = inPlane(S, inBasic('#ffffff', 1.0, { map: inTexText('banner100', 1024, 220, null, [['★ 100TH CUSTOMER! ★', 0.55, 104, '#ffffff', '900 italic']], (x, w, h, ph) => { if (ph === 'pre') { x.fillStyle = '#d8344a'; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, 0); x.lineTo(w - 40, h / 2); x.lineTo(w, h); x.lineTo(0, h); x.lineTo(40, h / 2); x.fill(); x.strokeStyle = '#ffd23a'; x.lineWidth = 8; x.setLineDash([18, 12]); x.strokeRect(50, 16, w - 100, h - 32); } }), transparent: true }), 1.6, 0.34, 0.35, 2.28, -2.2);
  inBunting(S, [-3.4, 2.9, -1.0], [3.6, 2.9, -1.0], 26, 0.35); inBunting(S, [-3.4, 2.95, 0.6], [3.6, 2.95, 0.6], 26, 0.3);
  C.pend = [-1.3, -0.1, 1.1].map((x) => { const p = new THREE.Group(); p.position.set(x, 3.2, -1.35); S.add(p); inAdd(p, inTube([[0, 0, 0], [0, -0.85, 0]], 0.004, 4), inM('#222', 0.5)); inAdd(p, inLathe('cafp', [[0.015, -0.85], [0.06, -0.88], [0.12, -1.02], [0.125, -1.03]]), inM('#c88a3a', 0.3, { metalness: 0.8, side: THREE.DoubleSide })); inSph(p, inBasic('#fff0c8', 4), 0.03, 0, -0.99, 0); inGlow(p, '#ffc070', 0.7, 0, -1.02, 0, 0.45); inPt(S, '#ffc880', 1.6, x, 2.15, -1.35, 3.5, 1.8); return p; });
  const tb = new THREE.Group(); tb.position.set(-2.6, 0, 0.6); S.add(tb); inCyl(tb, C.marble, 0.38, 0.38, 0.03, 0, 0.74, 0, 36); inCyl(tb, inM('#1a1a1a', 0.4), 0.025, 0.025, 0.72, 0, 0.37, 0, 10); inCyl(tb, inM('#1a1a1a', 0.4), 0.22, 0.24, 0.02, 0, 0.01, 0, 24);
  inPlant(S, -3.25, -2.6, { h: 1.5, pot: 0.2, n: 34, leaf: 0.18, wide: 1.2, seed: 41, potCol: '#c4704e' });
  inPlant(S, 3.3, -2.6, { h: 1.2, pot: 0.18, n: 28, leaf: 0.2, wide: 1.1, seed: 42, potCol: '#2a3a4a' });
  C.conf = inConfetti(S, 260, [-2.2, 2.4, 0, 2.7, -2.2, 0.6], 'cafe');
  S.add(new THREE.HemisphereLight(inCol('#fff0dc'), inCol('#3a2a20'), 0.35));
  C.key = inKey(S, '#ffe6c8', 2.6, [-6, 4.5, 1.5], [0, 1, -1.3], 4.5);
  inPt(S, '#ffd8b0', 1.0, 2.5, 2.2, 1.8, 8, 1.6); inPt(S, '#ffe0c0', 1.2, -1.8, 2.0, 1.2, 7, 1.6);
  S.environment = inEnv(g.r, '#3a2a20', [['#fff4e0', 2.5, -5, 1.6, 0, 3, 2, 0, Math.PI / 2], ['#ffc070', 1.5, 0, 3, -1.3, 3, 0.5, Math.PI / 2]]);
  return C;
}
function inShotCafe(g, t, b) {
  const C = inCafe(g), S = C.S, u = t - b.t0, k = b.k; inHideX(S);
  const ring = ss(0.9, 1.2, u) * (1 - ss(5.5, 6.2, u)), shake = Math.sin(t * 26) * 22 * ring;
  const bar = inXP(S, inX('barista', 'barista', { sex: 'f', age: 'young', outfit: 'apron', colors: { top: '#f2efe8', apron: '#2f4a3a' }, hair: undefined }), { pose: 'stand', expr: [['joy', 0.9], ['happy', 0.1]], look: [25, 4], pos: [-0.2, 0, -1.85], rot: 30, add: { shR: [-20 * ring, 0, -125 * ring], elR: [-40 * ring, 0, 0], wrR: [shake, 0, 0], shL: [-30, 0, 20], elL: [-60, 0, 0] }, hand: { R: 'fist', L: 'open' }, t });
  const gp = inXGrip(bar, 'R'); C.bell.position.copy(gp).add(V3(0, -0.02, 0)); C.bell.rotation.set(Math.PI + shake * DEG * 0.6, 0, 0.3 * ring);
  if (ring < 0.05) { C.bell.position.set(-0.9, 1.05 + 0.01, -1.2); C.bell.rotation.set(0, 0, 0); }
  inXSit(S, inX('reader', 'reader', { sex: 'm', age: 'old', outfit: 'casual', glasses: true }), { pose: 'sit', expr: 'surprised', look: [40, 0], rot: 80, add: { head: [0, 30, 0] }, t }, [-3.05, 0.47, 0.6]);
  // the hero: surprised, then delighted, takes the free coffee
  const joy = ss(1.0, 1.8, u), take = ss(2.2, 3.0, u), turn = ss(3.0, 3.9, u);
  inHero(S, { pose: [['stand', 1], ['cheer', joy * (1 - take) * 0.35 + 0.001]], expr: [['surprised', (1 - joy) * 0.8 + 0.01], ['joy', joy]], look: [-14, 6], pos: [0.6, 0, -0.62], rot: lerp(215, 380, turn), add: { shR: [-18 * take, 0, 0], elR: [-82 * take, 0, 0] }, hand: { R: take > 0.4 ? 'hold' : 'relax' }, t });
  const cg = inGripW('R');
  if (take > 0.4) C.cup.position.copy(cg).add(V3(0, -0.06, 0)); else C.cup.position.set(-0.05, 1.05, -1.2);
  C.cup.rotation.set(0, 0, 0);
  C.puffs.forEach((sp, i) => { const ph = ((t * 0.35 + i / 5) % 1); sp.position.copy(C.cup.position).add(V3(0.02 * Math.sin(t + i), 0.16 + ph * 0.3, 0)); sp.scale.setScalar(0.05 + ph * 0.12); sp.material.opacity = 0.28 * Math.sin(Math.PI * ph); });
  inConfettiAt(C.conf, u - 0.9);
  const q = EZ.io(k);
  shotCam(g, [lerp(0.25, 0.18, q), lerp(1.5, 1.48, q), lerp(1.1, 0.85, q)], [lerp(0.22, 0.25, q), 1.45, -1.3], 28, 0.6, t);
  inPresent(g, S, { exp: 1.0, bloom: 0.34, dof: { fd: g.cam.position.distanceTo(inHeadW()), ap: 9, mx: 16 } });
}

// =====================================================================
//  ROOM: the corner store (scratch card)
// =====================================================================
function inTexScratch(n) {
  return inTex('scratch' + n, (x, w, h) => {
    const R = RNG('in-scr-card'); const g2 = x.createLinearGradient(0, 0, w, h); g2.addColorStop(0, '#ffcf3a'); g2.addColorStop(0.5, '#ff8a2a'); g2.addColorStop(1, '#e8402a'); x.fillStyle = g2; x.fillRect(0, 0, w, h);
    x.fillStyle = '#fff'; x.font = '900 italic 44px Helvetica, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LUCKY 7s', w / 2, 44); x.font = 'bold 18px Helvetica'; x.fillText('MATCH 3 TO WIN  ·  $5', w / 2, 84);
    const sym = ['$$', '7', '$$', '★', '$$', '7', '$$', '🍀', '$$'];
    for (let i = 0; i < 9; i++) { const cx = 70 + (i % 3) * 116, cy = 150 + Math.floor(i / 3) * 96;
      x.fillStyle = '#fffaf0'; x.beginPath(); x.roundRect(cx - 50, cy - 38, 100, 76, 10); x.fill();
      x.fillStyle = i % 2 === 0 ? '#1a8a3a' : '#c8102e'; x.font = '900 40px Helvetica, Arial'; x.fillText(['$100', '7', '$100', '★', '$100', '7', '$5', 'x', '$2'][i], cx, cy + 2);
      if (i >= n) { const gg = x.createLinearGradient(cx - 50, cy - 38, cx + 50, cy + 38); gg.addColorStop(0, '#d8dce2'); gg.addColorStop(0.5, '#a8aeb8'); gg.addColorStop(1, '#e8ecf0'); x.fillStyle = gg; x.beginPath(); x.roundRect(cx - 50, cy - 38, 100, 76, 10); x.fill(); x.fillStyle = 'rgba(255,255,255,0.35)'; x.font = 'bold 22px Helvetica'; x.fillText('$', cx, cy); }
      else if (i === n - 1 || i === n - 2) { x.fillStyle = 'rgba(190,196,204,0.8)'; for (let k = 0; k < 18; k++) x.fillRect(cx - 50 + R.r(0, 100), cy - 38 + R.r(0, 76), R.r(2, 8), R.r(2, 5)); }
    }
    if (n >= 9) { x.save(); x.translate(w / 2, h * 0.62); x.rotate(-0.25); x.strokeStyle = '#c8102e'; x.lineWidth = 8; x.strokeRect(-150, -42, 300, 84); x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(-146, -38, 292, 76); x.fillStyle = '#c8102e'; x.font = '900 56px Helvetica, Arial'; x.fillText('WINNER!', 0, 4); x.restore(); }
    void sym;
  }, 400, 480);
}
function inStore(g) {
  const R = IN.rooms; if (R.store) return R.store;
  const S = new THREE.Scene(), T = R.store = { S };
  const ft = inTexTile('vinyl', '#e4e2dc', '#b8b4ac', 64, 64, 256, 256, 2, 0.1).clone(); ft.needsUpdate = true; ft.repeat.set(10, 8);
  inPlane(S, inM(null, 0.35, { map: ft, envMapIntensity: 0.6 }), 10, 8, 0, 0, 0, 0, -Math.PI / 2).receiveShadow = true;
  const wm = inM('#d8cfb8', 0.9, { map: inTexPlaster() });
  inB(S, wm, 10, 3, 0.2, 0, 1.5, -3.0, 0.01); inB(S, wm, 0.2, 3, 8, -3.4, 1.5, 0, 0.01); inB(S, wm, 0.2, 3, 8, 3.6, 1.5, 0, 0.01);
  inPlane(S, inM('#e8e6e0', 0.9), 10, 8, 0, 3, 0, 0, Math.PI / 2);
  inB(S, wm, 10, 0.9, 0.2, 0, 0.45, 3.0, 0.01).castShadow = false; inB(S, wm, 10, 0.5, 0.2, 0, 2.75, 3.0, 0.01).castShadow = false; inPlane(S, inBasic('#ffffff', 1.4, { map: inTexSky('day') }), 10, 1.6, 0, 1.7, 3.3, Math.PI); for (let i = -3; i <= 3; i++) inB(S, inM('#2a2e36', 0.4), 0.07, 1.6, 0.08, i * 1.4, 1.7, 2.95, 0.01).castShadow = false;
  for (let i = -2; i <= 2; i++) { inB(S, inBasic('#f4f8ff', 2.2), 1.2, 0.03, 0.18, i * 1.6, 2.98, -0.6, 0.01).castShadow = false; inB(S, inBasic('#f4f8ff', 2.2), 1.2, 0.03, 0.18, i * 1.6, 2.98, -2.2, 0.01).castShadow = false; }
  // back wall: shelves of snacks, the ticket dispenser, neon
  const pal = ['#d8202a', '#f2c230', '#2a6ad8', '#3aa04a', '#f07a2a', '#8a3ab8', '#e8e8e8', '#1a1a1a', '#ff5a8a'];
  const boxTex = inTex('pack', (x, w, h) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.ellipse(w / 2, h * 0.4, w * 0.35, h * 0.16, 0, 0, TAU); x.fill(); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(w * 0.15, h * 0.72, w * 0.7, h * 0.08); x.fillStyle = 'rgba(0,0,0,0.6)'; x.font = 'bold 22px Helvetica'; x.textAlign = 'center'; x.fillText('CHIPS', w / 2, h * 0.42); }, 64, 96);
  const items = []; const R0 = RNG('in-store');
  const shelfRow = (x0, x1, ys, z, d) => ys.forEach((y) => { let x = x0; while (x < x1) { const w = R0.r(0.1, 0.18), h = R0.r(0.16, 0.3); items.push([x + w / 2, y + h / 2, z, w, h, d, R0.pick(pal)]); x += w + 0.01; } });
  const sm = inM('#e8e4dc', 0.5);
  [[-2.9, -1.2], [1.3, 3.3]].forEach(([x0, x1]) => { [0.15, 0.6, 1.05, 1.5, 1.95].forEach((y) => inB(S, sm, x1 - x0 + 0.1, 0.03, 0.42, (x0 + x1) / 2, y, -2.7, 0.005)); shelfRow(x0, x1, [0.17, 0.62, 1.07, 1.52, 1.97], -2.7, 0.3); });
  // side aisle (foreground right) and drink fridges (left wall)
  inB(S, sm, 0.5, 1.6, 2.6, 2.6, 0.8, 0.9, 0.01); [0.3, 0.75, 1.2, 1.62].forEach((y) => { let z = -0.35; while (z < 2.15) { const w = R0.r(0.1, 0.18), h = R0.r(0.16, 0.28); items.push([2.33, y + h / 2, z + w / 2, 0.22, h, w, R0.pick(pal)]); z += w + 0.01; } });
  const im = new THREE.InstancedMesh(inRBox(1, 1, 1, 0.04), inM(null, 0.45, { map: boxTex }), items.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
  items.forEach(([x, y, z, w, h, d, c], i) => { q.setFromAxisAngle(V3(0, 1, 0), R0.n(0.08)); m4.compose(V3(x, y, z), q, V3(w, h, d)); im.setMatrixAt(i, m4); im.setColorAt(i, inCol(c)); }); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; S.add(im);
  for (let d = 0; d < 3; d++) { const fz = -1.9 + d * 0.95; inB(S, inM('#d8d8dc', 0.3, { metalness: 0.6 }), 0.7, 2.2, 0.92, -3.0, 1.1, fz, 0.02); inPlane(S, inBasic('#e8f4ff', 1.3), 0.84, 2.0, -2.64, 1.12, fz, Math.PI / 2);
    for (let r = 0; r < 5; r++) for (let c2 = 0; c2 < 6; c2++) { const bm = inM(pal[(r * 3 + c2 + d) % pal.length], 0.15, { clearcoat: 0.5 }); inCyl(S, bm, 0.035, 0.035, 0.24, -2.75, 0.33 + r * 0.38, fz - 0.33 + c2 * 0.13, 10); } inB(S, inM('#e8f0ff', 0.03, { transparent: true, opacity: 0.12, envMapIntensity: 3 }), 0.02, 2.0, 0.86, -2.6, 1.12, fz, 0.005); inB(S, inM('#b8b8bc', 0.2, { metalness: 1 }), 0.03, 0.6, 0.03, -2.56, 1.2, fz + 0.36, 0.01); }
  inPt(S, '#cfe4ff', 2.0, -2.2, 1.2, -1.0, 4, 1.8);
  // lotto dispenser case behind the counter + neon
  const lc = new THREE.Group(); lc.position.set(0.05, 1.25, -2.85); S.add(lc);
  inB(lc, inM('#1a1a1c', 0.4), 2.2, 0.75, 0.16, 0, 0, 0, 0.02);
  for (let i = 0; i < 10; i++) { const tk = inTex('tk' + i, (x, w, h) => { const c = pal[i % pal.length]; x.fillStyle = c; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.9)'; x.font = '900 italic 30px Helvetica'; x.textAlign = 'center'; x.fillText(['LUCKY 7s', 'CASH $$', 'GOLD RUSH', 'BINGO', 'JACKPOT', 'DIAMOND', 'WILD', '$1,000,000', 'TRIPLE', 'MONEY'][i], w / 2, 40); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let k = 1; k < 4; k++) x.fillRect(0, k * h / 4, w, 2); x.fillStyle = '#fff'; x.font = 'bold 26px Helvetica'; x.fillText('$' + [5, 2, 10, 1, 20, 5, 2, 30, 3, 10][i], w / 2, h - 30); }, 128, 256);
    inPlane(lc, inBasic('#ffffff', 1.1, { map: tk }), 0.19, 0.6, -0.95 + i * 0.21, 0, 0.085); }
  const neon = (txt, col, w, h, x, y, z, ry = 0) => inPlane(S, inBasic('#ffffff', 2.2, { map: inTexText('neon' + txt, 512, 160, null, [[txt, 0.55, 110, col, '900']], (cx, cw, ch, ph) => { if (ph === 'pre') { cx.shadowColor = col; cx.shadowBlur = 24; } }), transparent: true }), w, h, x, y, z, ry);
  neon('LOTTO', '#ff4a5a', 1.2, 0.38, 0.05, 2.1, -2.88); inGlow(S, '#ff3a4a', 2.2, 0.05, 2.1, -2.8, 0.25);
  neon('OPEN', '#4ad8ff', 0.8, 0.25, -1.9, 2.3, -2.88); inGlow(S, '#3ac8ff', 1.4, -1.9, 2.3, -2.8, 0.2);
  // counter
  const ctr = new THREE.Group(); ctr.position.set(0, 0, -1.35); S.add(ctr);
  inB(ctr, inM('#7a1f24', 0.4, { clearcoat: 0.5 }), 2.8, 0.95, 0.6, 0, 0.475, 0, 0.02);
  inB(ctr, inM(null, 0.25, { map: inTexWood('ctr', '#c89a6a', '80,50,20', '240,210,170', 6, 256), clearcoat: 0.6 }), 2.9, 0.05, 0.7, 0, 0.975, 0, 0.01);
  inB(ctr, inM('#f0f0f0', 0.02, { transparent: true, opacity: 0.15, envMapIntensity: 3 }), 1.0, 0.5, 0.02, -0.7, 0.55, 0.31, 0.005);
  for (let i = 0; i < 14; i++) inCyl(ctr, inM(pal[i % pal.length], 0.3), 0.03, 0.03, 0.06, -1.1 + (i % 7) * 0.12, 0.4 + Math.floor(i / 7) * 0.2, 0.2, 10);
  const regi = new THREE.Group(); regi.position.set(0.9, 1.0, -1.45); regi.rotation.y = -0.5; S.add(regi); inB(regi, inM('#2a2a2e', 0.4), 0.4, 0.12, 0.36, 0, 0.06, 0, 0.02); inB(regi, inM('#1a1a1c', 0.3), 0.3, 0.22, 0.03, 0, 0.26, -0.1, 0.01).rotation.x = -0.25; inPlane(regi, inBasic('#ffffff', 1, { map: inTexScreen('pos', ['#0a2a1a', '#1a5a3a', '#7aff9a']) }), 0.26, 0.18, 0, 0.27, -0.082);
  const term = new THREE.Group(); term.position.set(-0.85, 1.0, -1.5); term.rotation.y = 0.35; S.add(term); inB(term, inM('#e8e4dc', 0.4), 0.32, 0.3, 0.22, 0, 0.15, 0, 0.03); inPlane(term, inBasic('#ffffff', 1, { map: inTexText('term', 256, 160, '#1a3a8a', [['LOTTO', 0.4, 56, '#ffd23a', '900'], ['PLAY NOW', 0.75, 30, '#ffffff', 'bold']]) }), 0.26, 0.16, 0, 0.19, 0.112);
  // the card + a coin
  T.card = inPlane(S, inM('#c8c8c8', 0.55, { side: THREE.DoubleSide }), 0.19, 0.23, 0, 0, 0, 0, -Math.PI / 2); T.card.castShadow = true;
  T.coin = inAdd(S, inGeo('coin', () => new THREE.CylinderGeometry(0.012, 0.012, 0.002, 24)), inM('#d8d8d8', 0.25, { metalness: 1 }));
  T.shav = inMotes(S, 30, [-0.25, -0.05, 1.0, 1.06, -1.25, -1.05], '#c0c4cc', 0.006, 'shav'); T.shav.material.blending = THREE.NormalBlending; T.shav.material.opacity = 0.8;
  T.conf = inConfetti(S, 140, [-1.2, 1.2, 0.4, 2.5, -1.6, 0.0], 'store');
  S.add(new THREE.HemisphereLight(inCol('#f4f8ff'), inCol('#5a4a3a'), 0.4));
  T.key = inKey(S, '#fff6e8', 2.4, [1.5, 4.5, 3.0], [0, 1, -1.3], 4.5);
  inPt(S, '#ff6a7a', 0.4, 0.05, 2.0, -2.4, 3.5, 2);
  S.environment = inEnv(g.r, '#3a3a40', [['#ffffff', 2, 0, 3.9, 0, 6, 3, Math.PI / 2], ['#ff4a5a', 1.5, 0, 2, -5, 2, 0.6], ['#cfe4ff', 1.5, -5, 1.2, 0, 2, 2, 0, Math.PI / 2]]);
  return T;
}
function inShotScratch(g, t, b) {
  const T = inStore(g), S = T.S, u = t - b.t0, k = b.k; inHideX(S);
  const n = Math.min(9, Math.floor(clamp((u - 0.8) / 4.2) * 9.99)), win = ss(5.3, 5.8, u);
  T.card.material.map = inTexScratch(n); T.card.material.needsUpdate = true;
  const clerk = inXP(S, inX('clerk', 'clerk', { sex: 'm', age: 'old', outfit: 'tee', colors: { top: '#3a5a7a' }, beard: 'mustache', skin: 0.55 }), { pose: [['stand', 1 - win], ['shock', win * 0.7 + 0.001]], expr: [['neutral', 1 - win], ['amazed', win]], look: [-10, -14 * (1 - win)], pos: [1.25, 0, -2.0], rot: -35, add: { spine: [6 * (1 - win), 0, 0] }, t });
  // the hero leans on the counter and scratches with a coin, then holds the card up
  const scr = (1 - win) * ss(0.4, 0.9, u), osc = Math.sin(t * 22) * scr;
  const cardP = V3(0.05, 1.003, -1.28), rub = V3(cardP.x - 0.02 + 0.035 * Math.sin(t * 19), 1.035, cardP.z + 0.03 + 0.02 * Math.cos(t * 9.5));
  const HO = { pose: [['hold', 1 - win], ['cheer', win * 0.85]], expr: [['neutral', (1 - win) * (1 - clamp(n / 6)) + 0.01], ['surprised', (1 - win) * clamp(n / 6)], ['joy', win]], look: [0, lerp(-30, 8, win)], pos: [-0.12, 0, -0.62], rot: 180 + 4, add: { chest: [6 * (1 - win), 0, 0], neck: [12 * (1 - win), 0, 0] }, hand: { R: 'flip', L: 'open' }, t };
  // scratching: the right hand (with the coin) on the card, the feet slide to suit; after the win: straight up, card in the air
  if (win < 0.5) inHeroReach(S, HO, 'R', rub); else inHero(S, Object.assign({}, HO, { pos: [-0.12 + 0.0, 0, -0.66] }));
  if (win < 0.5) { T.card.position.copy(cardP); T.card.rotation.set(-Math.PI / 2, 0, 0.1); const cg = inGripW('R'); T.coin.position.copy(cg).add(V3(0, -0.012, 0)); T.coin.rotation.set(0.25, 0, 0.2); }
  else { const gp = inGripW('R'); T.card.position.copy(gp).add(V3(0, 0.1, 0.0)); T.card.rotation.set(0, Math.PI, 0); T.coin.position.set(cardP.x + 0.12, cardP.y + 0.002, cardP.z); T.coin.rotation.set(0, 0, 0); }
  T.shav.visible = win < 0.5 && u > 0.8; inMotesAt(T.shav, t * 0.3);
  T.conf.visible = win > 0; inConfettiAt(T.conf, u - 5.4);
  if (k < 0.6) { const q = EZ.io(k / 0.6); shotCam(g, [lerp(0.5, 0.45, q), lerp(1.66, 1.64, q), lerp(-2.15, -2.05, q)], [lerp(0.0, -0.02, q), lerp(1.05, 1.12, q), lerp(-1.1, -1.0, q)], 24, 0.4, t);
    const fdC = g.cam.position.distanceTo(cardP), fdF = g.cam.position.distanceTo(inHeadW()); inPresent(g, S, { exp: 0.95, bloom: 0.3, dof: { fd: lerp(fdC, fdF, ss(0.38, 0.52, k)), ap: 14, mx: 20 } }); }
  else { const q = (k - 0.6) / 0.4; shotCam(g, [lerp(-0.2, -0.1, q), 1.55, lerp(-2.55, -2.45, q)], [lerp(-0.1, 0.0, q), 1.42, -0.7], 28, 0.6, t); inPresent(g, S, { exp: 0.95, bloom: 0.3, dof: { fd: g.cam.position.distanceTo(inHeadW()), ap: 8, mx: 16 } }); }
}

// =====================================================================
//  ROOM: the office (hired, laid off)
// =====================================================================
function inOffice(g) {
  const R = IN.rooms; if (R.office) return R.office;
  const S = new THREE.Scene(), O = R.office = { S };
  const ct = inTex('ocarpet', (x, w, h) => { const R0 = RNG('in-ocarpet'); const n = 4, c = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const v = R0.r(84, 100); x.fillStyle = `rgb(${v},${v + 4},${v + 10})`; x.fillRect(i * c, j * c, c, c); for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(0,0,0,${R0.r(0.05, 0.15)})`; x.beginPath(); const yy = j * c + R0.r(0, c); if ((i + j) % 2) { x.moveTo(i * c, yy); x.lineTo(i * c + c, yy); } else { const xx = i * c + R0.r(0, c); x.moveTo(xx, j * c); x.lineTo(xx, j * c + c); } x.stroke(); } } inGrain(x, w, h, R0, 20000, 0.12, 1.2); }, 512, 512).clone();
  ct.needsUpdate = true; ct.repeat.set(6, 5);
  inPlane(S, inM(null, 0.95, { map: ct }), 12, 10, 0, 0, -1, 0, -Math.PI / 2).receiveShadow = true;
  // window wall with the city (back), plain walls left/right, ceiling with linear lights
  O.sky = inBasic('#ffffff', 1.25, { map: inTexSky('day') });
  inWallGrid(S, -6, 6, 0.0, 3.1, -4.2, inM('#2a2e36', 0.4), inM('#3a3e46', 0.35, { metalness: 0.5 }), O.sky);
  inPlane(S, O.sky, 14, 4, 0, 1.6, -4.6);
  const wm = inM('#e6e2da', 0.9, { map: inTexPlaster() });
  inB(S, wm, 0.2, 3.1, 10, -6, 1.55, -0.5, 0.01).castShadow = false; inB(S, wm, 0.2, 3.1, 10, 6, 1.55, -0.5, 0.01).castShadow = false;
  inPlane(S, inM('#ecebe8', 0.9), 12, 10, 0, 3.1, -1, 0, Math.PI / 2);
  for (let i = -2; i <= 2; i++) { inB(S, inBasic('#ffffff', 2.2), 0.08, 0.04, 6, i * 2.2, 3.05, -1.2, 0.01).castShadow = false; }
  // desks: two rows facing each other, monitors, mugs, plants, a glass meeting room
  const pals = [['#1e2a3a', '#2f4a6a', '#5ac8a0'], ['#f4f4f6', '#3a7ad8', '#e8a03a'], ['#20242a', '#7a3ab8', '#5ad8ff']];
  O.desks = [];
  [[-3.4, -2.5, 0], [-1.9, -2.5, 0], [1.7, -2.5, 0], [3.2, -2.5, 0], [-3.4, -1.6, Math.PI], [-1.9, -1.6, Math.PI], [1.7, -1.6, Math.PI], [3.2, -1.6, Math.PI]].forEach(([x, z, ry], i) => O.desks.push(inDesk(S, x, z, ry, { scr: 'o' + i, pal: pals[i % 3], mug: ['#c84a3a', '#3a6aa8', '#e8c46a', null][i % 4] })));
  O.friendDesk = inDesk(S, -1.3, 0.3, Math.PI + 0.25, { monitor: false, chair: false });
  [-2.65, 2.45].forEach((x) => inB(S, inM('#f1ede6', 0.4), 0.04, 0.4, 1.6, x, 0.95, -2.05, 0.01));
  inPlant(S, -5.3, -3.6, { h: 1.6, pot: 0.22, n: 34, leaf: 0.17, wide: 1.2, seed: 51, potCol: '#e8e4dc' });
  inPlant(S, 5.2, -3.5, { h: 1.4, pot: 0.2, n: 30, leaf: 0.18, wide: 1.2, seed: 52, potCol: '#2a2e36' });
  inPlant(S, 0.0, -3.6, { h: 1.1, pot: 0.18, n: 24, leaf: 0.2, seed: 53, potCol: '#c4704e' });
  const gl = inM('#dfeaf0', 0.05, { transparent: true, opacity: 0.16, envMapIntensity: 2.5 });
  inB(S, gl, 0.03, 2.6, 3.0, 4.6, 1.3, 0.6, 0.004); inB(S, gl, 1.4, 2.6, 0.03, 5.3, 1.3, -0.9, 0.004);
  inB(S, inM('#ffffff', 0.6, { transparent: true, opacity: 0.6 }), 0.035, 0.12, 3.0, 4.6, 1.2, 0.6, 0.004);
  inB(S, inM('#3a3e46', 0.3, { metalness: 0.6 }), 0.05, 0.05, 3.0, 4.6, 2.6, 0.6, 0.004);
  inFrame(S, 1.6, 0.9, -5.88, 1.65, 0.4, Math.PI / 2, inTexArt('o1', ['#e8e4dc', '#2a5a8a', '#e8a03a', '#d84a3a']));
  // whiteboard + a sign
  inB(S, inM('#f8f8f8', 0.15, { clearcoat: 0.6 }), 0.03, 1.0, 1.8, -5.88, 1.5, 2.6, 0.01);
  inPlane(S, inBasic('#ffffff', 0.85, { map: inTexText('obrand', 1024, 200, null, [['NORTHWIND', 0.5, 150, '#2a3a5a', '900']]), transparent: true }), 2.4, 0.47, 0, 2.62, -4.08);
  O.box = inBox(S, 0, 0, 0, 0);
  O.boxItems = new THREE.Group(); S.add(O.boxItems); inPlant(O.boxItems, 0, 0, { h: 0.3, pot: 0.06, n: 10, leaf: 0.35, seed: 54, potCol: '#e8e0d0' }); inFrame(O.boxItems, 0.18, 0.22, 0.12, 0.13, -0.05, 0.3, inTexArt('pf', ['#f4e4cc', '#3a6a8a', '#e87a4a']));
  O.env = inEnv(g.r, '#2a2e34', [['#ffffff', 1.1, 0, 1.6, -5, 10, 3], ['#ffffff', 0.6, 0, 3.9, 0, 8, 4, Math.PI / 2]]);
  S.environment = O.env;
  S.add(new THREE.HemisphereLight(inCol('#eaf2ff'), inCol('#605850'), 0.45));
  O.key = inKey(S, '#fff4e4', 2.4, [3, 6, -9], [0, 0.8, -1], 6);
  inPt(S, '#fff0e0', 1.0, 0, 2.6, 2.5, 9, 1.4);
  const fill = new THREE.DirectionalLight(inCol('#dfe8ff'), 0.9); fill.position.set(-2, 3, 5); S.add(fill);
  O.env2 = null; O.env2 = O.env;
  O.paper = new THREE.Group(); S.add(O.paper); inB(O.paper, inM('#f4efe2', 0.7), 0.22, 0.004, 0.12, 0, 0, 0, 0.002); inB(O.paper, inM('#c8102e', 0.5), 0.03, 0.005, 0.03, 0.06, 0.001, 0.0, 0.004);
  return O;
}
function inShake(S, A, B, t, k) {   // two rigs face each other and shake right hands
  const sh = 6 * Math.sin(t * 9) * ss(0.12, 0.2, k) * (1 - ss(0.55, 0.65, k));
  return { shR: [-48 + sh, 0, 12], elR: [-22, 0, 0], wrR: [0, 0, 8] };
}
function inShotHired(g, t, b) {
  const O = inOffice(g), S = O.S, u = t - b.t0, k = b.k; inHideX(S);
  O.box.visible = O.boxItems.visible = false; O.paper.visible = false;
  const sk = inShake(S, null, null, t, k), joy = ss(0.08, 0.2, k);
  inHero(S, { pose: 'stand', expr: [['happy', 1 - joy * 0.5], ['joy', joy * 0.5 + 0.01]], look: [0, 2], pos: [-0.38, 0, -0.75], rot: 90, add: sk, hand: { R: 'hold' }, t });
  inXP(S, inX('manager', 'manager', { sex: 'm', age: 'adult', outfit: 'suit', colors: { top: '#3a3f4a', tie: '#2a4a7a' }, glasses: false, beard: 'stubble', skin: 0.75 }), { pose: 'stand', expr: 'happy', look: [0, 2], pos: [0.38, 0, -0.75], rot: -90, add: sk, hand: { R: 'hold' }, t });
  const clap = (ph) => { const c = Math.max(0, Math.sin(t * 11 + ph)); return { shL: [-40, 0, 10 + 14 * c], shR: [-40, 0, -10 - 14 * c], elL: [-70, 40, 0], elR: [-70, -40, 0] }; };
  inXP(S, inX('cow1', 'cow1', { sex: 'f', outfit: 'casual', age: 'young' }), { pose: 'stand', expr: 'joy', look: [10, 0], pos: [-1.9, 0, -2.0], rot: 30, add: clap(0), hand: { L: 'open', R: 'open' }, t });
  inXP(S, inX('cow2', 'cow2', { sex: 'm', outfit: 'tee', age: 'young', skin: 0.85 }), { pose: 'stand', expr: 'happy', look: [-10, 0], pos: [1.7, 0, -2.05], rot: -30, add: clap(1.3), hand: { L: 'open', R: 'open' }, t });
  inXP(S, inX('cow3', 'cow3', { sex: 'f', outfit: 'suit', age: 'adult', skin: 0.3 }), { pose: 'stand', expr: 'happy', look: [0, 0], pos: [3.2, 0, -2.0], rot: -40, add: clap(2.1), hand: { L: 'open', R: 'open' }, t });
  const q = EZ.io(k);
  shotCam(g, [lerp(-1.55, -1.2, q), lerp(1.45, 1.42, q), lerp(2.3, 1.75, q)], [lerp(0.05, 0.1, q), 1.3, -1.0], 32, 0.6, t);
  inPresent(g, S, { exp: 0.86, bloom: 0.24, dof: { fd: g.cam.position.distanceTo(V3(0, 1.4, -0.75)), ap: 8, mx: 16 } });
}
function inShotLaidoff(g, t, b) {
  const O = inOffice(g), S = O.S, u = t - b.t0, k = b.k; inHideX(S);
  O.box.visible = O.boxItems.visible = true; O.paper.visible = true;
  // the friend packs his desk into a box
  const fd = O.friendDesk; fd.updateMatrixWorld(true); const bp = V3(-0.25, 0.755, 0.05).applyMatrix4(fd.matrixWorld); O.box.position.copy(bp); O.box.rotation.y = fd.rotation.y + 0.2;
  const lift = Math.max(0, Math.sin(u * 1.1)) * (1 - ss(6, 7, u));
  const fr = inXP(S, inX('friend', 'friend', { sex: 'm', age: 'young', outfit: 'casual', colors: { top: '#c9583e', bottom: '#3a5272' }, hair: undefined, skin: 0.45, glasses: true }), { pose: [['sad', 0.6], ['hold', 0.4]], expr: 'sad', look: [-10, -20], pos: [-1.45, 0, -0.3], rot: 12, add: { spine: [14, 0, 0], shL: [-20 * lift, 0, 0], shR: [-20 * lift, 0, 0] }, t });
  O.boxItems.position.copy(inXGrip(fr, 'R').lerp(bp.clone().add(V3(0, 0.12, 0)), 1 - lift)); O.boxItems.rotation.y = 0.4;
  // the manager hands the hero the promotion letter; the hero glances back at his friend, guilty
  const hand = ss(0.15, 0.35, k), glance = ss(0.45, 0.6, k);
  const mg = inXP(S, inX('manager', 'manager', {}), { pose: 'stand', expr: 'happy', look: [0, 0], pos: [1.3, 0, -0.15], rot: -95, add: { shR: [-55 * hand, 0, 10], elR: [-20, 0, 0] }, hand: { R: 'hold' }, t });
  inHero(S, { pose: [['stand', 0.6], ['hold', 0.4]], expr: [['smug', (1 - glance) * 0.5 + 0.01], ['worried', glance + (1 - glance) * 0.5]], look: [lerp(10, 30, glance), lerp(0, -6, glance)], pos: [0.55, 0, -0.05], rot: 80 + glance * 40, add: { neck: [0, -20 * glance, 0], head: [0, -14 * glance, 0] }, t });
  const pp = hand < 0.9 ? inXGrip(mg, 'R') : inGripW('R'); O.paper.position.copy(pp).add(V3(0, 0.02, 0)); O.paper.rotation.set(0.2, -0.8, 0.2);
  const q = EZ.io(k);
  shotCam(g, [lerp(-0.9, -0.75, q), lerp(1.4, 1.38, q), lerp(2.9, 2.45, q)], [lerp(-0.35, -0.3, q), 1.15, -0.3], 30, 0.6, t);
  inPresent(g, S, { exp: 0.84, bloom: 0.22, lift: [0, 0.002, 0.006], dof: { fd: g.cam.position.distanceTo(V3(-0.5, 1.2, -0.2)), ap: 5, mx: 14 } });
}

// =====================================================================
//  ROOM: the insurance office (an agent shakes her head at a map of his street)
// =====================================================================
function inTexMap() {
  return inTex('riskmap', (x, w, h) => {
    const R0 = RNG('in-map'); x.fillStyle = '#ece6d6'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#b8d8a0'; x.fillRect(w * 0.06, h * 0.08, w * 0.2, h * 0.3); x.fillStyle = '#a8c8e8'; x.beginPath(); x.moveTo(0, h * 0.75); x.bezierCurveTo(w * 0.3, h * 0.65, w * 0.5, h * 0.95, w, h * 0.82); x.lineTo(w, h * 0.9); x.bezierCurveTo(w * 0.5, h * 1.02, w * 0.3, h * 0.73, 0, h * 0.83); x.fill();
    x.strokeStyle = '#ffffff'; x.lineWidth = 10; for (let i = 1; i < 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8 + 20, h); x.stroke(); } for (let j = 1; j < 5; j++) { x.beginPath(); x.moveTo(0, j * h / 5); x.lineTo(w, j * h / 5 - 10); x.stroke(); }
    x.strokeStyle = '#f2c86a'; x.lineWidth = 16; x.beginPath(); x.moveTo(0, h * 0.42); x.lineTo(w, h * 0.38); x.stroke();
    for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) for (let q2 = 0; q2 < 4; q2++) { if (R0.f() < 0.25) continue; x.fillStyle = R0.pick(['#d8c8b0', '#c8b8a0', '#e0d0b8']); x.fillRect(i * w / 8 + 14 + (q2 % 2) * 46, j * h / 5 + 14 + Math.floor(q2 / 2) * 34, 36, 24); }
    const cx = w * 0.56, cy = h * 0.5; x.fillStyle = 'rgba(220,30,40,0.18)'; x.beginPath(); x.arc(cx, cy, 190, 0, TAU); x.fill(); x.strokeStyle = '#d81e28'; x.lineWidth = 9; x.setLineDash([22, 12]); x.beginPath(); x.arc(cx, cy, 190, 0, TAU); x.stroke(); x.setLineDash([]);
    x.lineWidth = 10; x.beginPath(); x.ellipse(cx, cy, 46, 40, -0.2, 0, TAU); x.stroke(); x.fillStyle = '#3f9d6f'; x.fillRect(cx - 18, cy - 12, 36, 26); x.fillStyle = '#d81e28'; x.font = '900 34px Helvetica, Arial'; x.textAlign = 'center'; x.fillText('HIGH RISK', cx, cy - 210); x.font = 'bold 24px Helvetica'; x.fillText('NO COVERAGE', cx, cy + 236);
    x.fillStyle = '#2a3a5a'; x.font = 'bold 28px Helvetica'; x.textAlign = 'left'; x.fillText('FLOOD · STORM · LIGHTNING EXPOSURE', 24, h - 22);
  }, 1024, 680);
}
function inInsure(g) {
  const R = IN.rooms; if (R.ins) return R.ins;
  const S = new THREE.Scene(), I = R.ins = { S };
  inPlane(S, inM(null, 0.4, { map: inTexWood('insfl', '#8a6a4a', '40,25,10', '200,170,130', 8, 512) }), 8, 7, 0, 0, 0, 0, -Math.PI / 2).receiveShadow = true;
  const wm = inM('#c9d3dc', 0.9, { map: inTexPlaster() });
  inB(S, wm, 8, 3, 0.2, 0, 1.5, -2.6, 0.01); inB(S, wm, 0.2, 3, 7, -3.0, 1.5, 0, 0.01); inB(S, inM('#e8e4dc', 0.9, { map: inTexPlaster() }), 0.2, 3, 7, 3.2, 1.5, 0, 0.01);
  inPlane(S, inM('#f0eeea', 0.9), 8, 7, 0, 3, 0, 0, Math.PI / 2);
  inB(S, inM('#f4f2ee', 0.5), 7.9, 0.12, 0.03, 0, 0.06, -2.48, 0.005);
  const mp = new THREE.Group(); mp.position.set(-0.15, 1.75, -2.47); S.add(mp); inB(mp, inM('#2a2420', 0.4), 2.1, 1.42, 0.04, 0, 0, 0, 0.01); inPlane(mp, inM(null, 0.7, { map: inTexMap() }), 2.0, 1.32, 0, 0, 0.022);
  inPlane(S, inBasic('#ffffff', 0.8, { map: inTexText('insbrand', 1024, 180, null, [['SAFEHOME', 0.4, 100, '#1f4a7a', '900'], ['INSURANCE · SINCE 1952', 0.82, 44, '#5a6a7a', 'bold']]), transparent: true }), 1.1, 0.2, -1.75, 1.95, -2.48);
  for (let i = 0; i < 2; i++) { const fc = new THREE.Group(); fc.position.set(2.2 + i * 0.5, 0, -2.25); S.add(fc); inB(fc, inM('#8a929c', 0.35, { metalness: 0.5 }), 0.46, 1.3, 0.6, 0, 0.65, 0, 0.01); for (let d = 0; d < 4; d++) { inB(fc, inM('#9aa2ac', 0.35, { metalness: 0.5 }), 0.42, 0.28, 0.02, 0, 0.18 + d * 0.31, 0.3, 0.01); inB(fc, inM('#d8d8d8', 0.2, { metalness: 1 }), 0.12, 0.02, 0.03, 0, 0.26 + d * 0.31, 0.32, 0.005); } }
  // window with blinds
  inPlane(S, inBasic('#ffffff', 1.3, { map: inTexSky('day') }), 1.6, 1.6, -2.95, 1.6, 0.3, Math.PI / 2);
  for (let i = 0; i < 20; i++) inB(S, inM('#f0ece4', 0.5), 0.02, 0.05, 1.6, -2.86, 0.85 + i * 0.075, 0.3, 0.004).rotation.z = 0.5;
  // the desk
  const dk = new THREE.Group(); dk.position.set(0.2, 0, -1.2); S.add(dk);
  const wd = inM(null, 0.35, { map: inTexWood('insdesk', '#5a3a22', '30,18,8', '150,100,60', 5, 256), clearcoat: 0.4 });
  inB(dk, wd, 1.7, 0.05, 0.85, 0, 0.75, 0, 0.012); inB(dk, wd, 1.6, 0.7, 0.04, 0, 0.38, 0.38, 0.01); [-0.8, 0.8].forEach((x) => inB(dk, wd, 0.05, 0.73, 0.8, x, 0.37, 0, 0.01));
  const mo = new THREE.Group(); mo.position.set(0.45, 0.78, -0.1); mo.rotation.y = -0.6; dk.add(mo); inB(mo, inM('#18191c', 0.3), 0.5, 0.32, 0.03, 0, 0.3, 0, 0.012); inPlane(mo, inBasic('#ffffff', 0.85, { map: inTexScreen('ins', ['#f4f4f6', '#1f4a7a', '#d81e28']) }), 0.46, 0.28, 0, 0.3, -0.016, Math.PI); inB(mo, inM('#2a2d33', 0.3), 0.04, 0.14, 0.04, 0, 0.07, 0, 0.01);
  for (let i = 0; i < 4; i++) inB(dk, inM(['#f4efe2', '#e8e4dc'][i % 2], 0.7), 0.22, 0.008, 0.3, -0.35 + i * 0.01, 0.78 + i * 0.008, 0.1, 0.002).rotation.y = i * 0.1;
  inB(dk, inM('#d81e28', 0.5), 0.22, 0.01, 0.3, -0.05, 0.778, 0.2, 0.002).rotation.y = -0.15;
  inPlant(S, -2.55, -2.2, { h: 1.3, pot: 0.18, n: 28, leaf: 0.2, wide: 1.1, seed: 61, potCol: '#e8e4dc' });
  inOfficeChair(S, 0.2, -1.85, 0); inOfficeChair(S, 0.2, -0.25, Math.PI + 0.1, '#5a3a2a');
  S.add(new THREE.HemisphereLight(inCol('#eaf2ff'), inCol('#5a4a3a'), 0.4));
  I.key = inKey(S, '#fff0dc', 2.5, [-5, 4.5, 2], [0, 1, -1.2], 4);
  inPt(S, '#fff0e0', 0.9, 1.5, 2.4, 2, 8, 1.5);
  S.environment = inEnv(g.r, '#3a3a40', [['#ffffff', 2, -4, 1.6, 0, 2, 2, 0, Math.PI / 2], ['#ffffff', 1, 0, 3.9, 0, 6, 4, Math.PI / 2]]);
  return I;
}
function inShotInsurance(g, t, b) {
  const I = inInsure(g), S = I.S, u = t - b.t0, k = b.k; inHideX(S);
  const no = Math.sin(t * 6.5) * 16 * ss(0.1, 0.2, k) * (1 - ss(0.75, 0.85, k)), pt = ss(0.4, 0.5, k) * (1 - ss(0.85, 0.95, k));
  inXSit(S, inX('agent', 'agent', { sex: 'f', age: 'adult', outfit: 'suit', colors: { top: '#5a2a3a' }, glasses: true, hair: undefined, skin: 0.5 }), { pose: 'sit', expr: [['worried', 0.7], ['sad', 0.3]], look: [0, 0], rot: 0, add: { head: [0, no, 0], neck: [0, no * 0.4, 0], shL: [-30, 0, 0], elL: [-60, 0, 0], shR: [-30 - 40 * pt, -30 * pt, -40 * pt], elR: [-60 + 40 * pt, 0, 0] }, hand: { R: pt > 0.5 ? 'point' : 'relax' }, t }, [0.2, 0.5, -1.85]);
  inHeroSit(S, { pose: 'sit', expr: [['worried', 0.6], ['surprised', 0.4]], look: [lerp(0, 18, pt), lerp(0, 14, pt)], rot: 180 + 6, add: { neck: [0, 12 * pt, 0] }, t }, [0.2, 0.5, -0.22]);
  const q = EZ.io(k);
  shotCam(g, [lerp(1.75, 1.45, q), lerp(1.5, 1.45, q), lerp(1.2, 0.9, q)], [lerp(-0.1, -0.15, q), 1.35, -1.9], 30, 0.5, t);
  inPresent(g, S, { exp: 0.95, bloom: 0.24, dof: { fd: g.cam.position.distanceTo(V3(0.2, 1.3, -1.85)), ap: 7, mx: 14 } });
}

// =====================================================================
//  ROOM: the community food bank (giveaway, it comes back)
// =====================================================================
function inShelter(g) {
  const R = IN.rooms; if (R.shelter) return R.shelter;
  const S = new THREE.Scene(), H = R.shelter = { S };
  inPlane(S, inM(null, 0.6, { map: inTexTile('lino', '#b8a88a', '#9a8a70', 128, 128, 256, 256, 2, 0.05) }), 12, 9, 0, 0, -0.5, 0, -Math.PI / 2).receiveShadow = true;
  const brick = inTexBrick().clone(); brick.needsUpdate = true; brick.repeat.set(6, 2);
  inB(S, inM('#e8dccc', 0.9, { map: brick }), 12, 3.4, 0.2, 0, 1.7, -3.4, 0.01);
  inB(S, inM('#d8c8a8', 0.9, { map: inTexPlaster() }), 0.2, 3.4, 9, -5, 1.7, -0.5, 0.01).castShadow = false; inB(S, inM('#d8c8a8', 0.9, { map: inTexPlaster() }), 0.2, 3.4, 9, 5, 1.7, -0.5, 0.01).castShadow = false;
  inPlane(S, inM('#5a4a3a', 0.8, { map: inTexWood('beams', '#6a5038', '30,20,10', '150,110,80', 6, 256) }), 12, 9, 0, 3.4, -0.5, 0, Math.PI / 2);
  // shelves of canned food + boxes
  const cans = [], R0 = RNG('in-cans'), pal = ['#d8202a', '#f2c230', '#2a6ad8', '#3aa04a', '#f07a2a', '#e8e8e8', '#8a3ab8'];
  const sm = inM('#8a7a6a', 0.5, { metalness: 0.4 });
  [[-4.2, -1.6], [1.2, 4.4]].forEach(([x0, x1]) => { [0.1, 0.62, 1.14, 1.66, 2.18].forEach((y) => { inB(S, sm, x1 - x0, 0.03, 0.5, (x0 + x1) / 2, y, -3.05, 0.005); let x = x0 + 0.06; while (x < x1 - 0.06) { if (R0.f() < 0.2) { const bw = R0.r(0.3, 0.45); cans.push(['box', x + bw / 2, y + 0.17, bw]); x += bw + 0.02; continue; } cans.push(['can', x + 0.045, y + 0.075, R0.pick(pal)]); cans.push(['can', x + 0.045, y + 0.075, R0.pick(pal), -2.9]); x += 0.1; } }); [x0, x1].forEach((x) => inB(S, sm, 0.04, 2.3, 0.5, x, 1.15, -3.05, 0.005)); });
  const canTex = inTex('can', (x, w, h) => { x.fillStyle = '#e8e8e8'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(0, h * 0.3, w, h * 0.4); x.fillStyle = 'rgba(0,0,0,0.5)'; x.font = 'bold 20px Helvetica'; x.textAlign = 'center'; x.fillText('BEANS', w / 2, h * 0.55); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, w, 6); x.fillRect(0, h - 6, w, 6); }, 128, 64);
  const cl = cans.filter((c) => c[0] === 'can'), im = new THREE.InstancedMesh(inGeo('cang', () => new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16)), inM(null, 0.35, { map: canTex, metalness: 0.3 }), cl.length), m4 = new THREE.Matrix4();
  cl.forEach(([, x, y, c, z], i) => { m4.makeTranslation(x, y, z ?? -3.15); im.setMatrixAt(i, m4); im.setColorAt(i, inCol(c)); }); im.castShadow = im.receiveShadow = true; im.frustumCulled = false; S.add(im);
  cans.filter((c) => c[0] === 'box').forEach(([, x, y, bw]) => inBox(S, x, y - 0.16, -3.05, 0, bw, 0.3, 0.4));
  // banner, string lights, posters, windows
  inPlane(S, inBasic('#ffffff', 0.95, { map: inTexText('fbbanner', 1024, 200, null, [['COMMUNITY FOOD BANK', 0.5, 92, '#ffffff', '900']], (x, w, h, ph) => { if (ph === 'pre') { x.fillStyle = '#2f6a4a'; x.beginPath(); x.roundRect(10, 10, w - 20, h - 20, 30); x.fill(); x.strokeStyle = '#f4e4b0'; x.lineWidth = 8; x.stroke(); } }), transparent: true }), 3.4, 0.66, -0.2, 2.75, -3.28);
  inStringLights(S, [-4.8, 3.1, -3.2], [4.8, 3.1, -3.2], 22, 0.35); inStringLights(S, [-4.8, 3.2, -0.5], [4.8, 3.2, 0.2], 22, 0.5);
  inFrame(S, 0.7, 0.9, -4.88, 1.6, -1.2, Math.PI / 2, inTexArt('s1', ['#f4e4cc', '#e85a3a', '#3a8a5a', '#f2c230']));
  // tables with crates of produce, the donation box
  H.table = new THREE.Group(); H.table.position.set(0, 0, -1.2); S.add(H.table);
  inB(H.table, inM('#ece6dc', 0.5), 2.6, 0.04, 0.8, 0, 0.74, 0, 0.01); [[-1.2, -0.35], [1.2, -0.35], [-1.2, 0.35], [1.2, 0.35]].forEach(([x, z]) => inCyl(H.table, inM('#5a5a5a', 0.3, { metalness: 0.7 }), 0.015, 0.015, 0.74, x, 0.37, z, 8));
  inB(H.table, inM('#2f6a4a', 0.8, { map: inTexFabric('cloth') }), 2.62, 0.4, 0.01, 0, 0.56, 0.405, 0.003);
  const fruit = [['#e8402a', 0.04], ['#f08a24', 0.042], ['#e8c43a', 0.04], ['#7ab03a', 0.038]];
  [[0.6, 0], [1.05, 0.05]].forEach(([x, z], ci) => { const cr = inBox(H.table, x, 0.76, z, 0.1, 0.42, 0.16, 0.32); const R1 = RNG('in-fruit', ci); for (let i = 0; i < 14; i++) inSph(cr, inM(fruit[(i + ci) % 4][0], 0.45), fruit[(i + ci) % 4][1], R1.r(-0.16, 0.16), 0.15 + R1.r(0, 0.03), R1.r(-0.12, 0.12)); });
  H.dbox = new THREE.Group(); H.dbox.position.set(-1.05, 0.76, -1.2); S.add(H.dbox);
  inB(H.dbox, inM('#e8f4ff', 0.04, { transparent: true, opacity: 0.25, envMapIntensity: 2.5 }), 0.34, 0.4, 0.3, 0, 0.2, 0, 0.01); inB(H.dbox, inM('#2f6a4a', 0.5), 0.36, 0.02, 0.32, 0, 0.405, 0, 0.005);
  inPlane(H.dbox, inBasic('#ffffff', 0.9, { map: inTexText('donate', 256, 90, '#f4e4b0', [['DONATIONS', 0.55, 40, '#2f6a4a', '900']]) }), 0.3, 0.1, 0, 0.3, 0.152);
  for (let i = 0; i < 8; i++) { const R1 = RNG('in-don', i); const e = inB(H.dbox, inM(i % 3 ? '#f4efe2' : '#cfe0c0', 0.7), 0.16, 0.003, 0.09, R1.r(-0.06, 0.06), 0.02 + i * 0.012, R1.r(-0.05, 0.05), 0.001); e.rotation.y = R1.r(-0.6, 0.6); }
  H.cash = inCashPile(S, 24, -0.42, 0.76, -1.28, 'shelter');
  H.env = inEnvelope(S); H.ticket = inPlane(S, inM(null, 0.5, { map: inTexTicket(), side: THREE.DoubleSide, emissive: inCol('#ffd890'), emissiveIntensity: 0 }), 0.16, 0.0975, 0, 0, 0);
  H.tGlow = inGlow(S, '#ffd070', 0.8, 0, 0, 0, 0);
  inPlant(S, -4.4, -2.5, { h: 1.2, pot: 0.18, n: 26, leaf: 0.2, wide: 1.1, seed: 71, potCol: '#c4704e' });
  S.add(new THREE.HemisphereLight(inCol('#ffeeda'), inCol('#5a4030'), 0.25));
  H.key = inKey(S, '#ffe0b8', 1.9, [-3, 5, 4], [0, 1, -1.2], 5);
  inPt(S, '#ffcf90', 0.8, 0, 2.8, -2.4, 7, 1.6); inPt(S, '#ffcf90', 0.4, 0, 2.8, 0.5, 7, 1.6);
  S.environment = inEnv(g.r, '#2a1e18', [['#ffd890', 0.8, 0, 3.6, -1, 8, 1, Math.PI / 2], ['#fff4e0', 0.6, 0, 1.6, 5, 4, 2]]);
  return H;
}
function inEnvelope(S) { const e = new THREE.Group(); S.add(e); inB(e, inM('#f4ead6', 0.7), 0.2, 0.005, 0.11, 0, 0, 0, 0.002); const f = inAdd(e, inGeo('envflap', () => { const g2 = new THREE.BufferGeometry(); g2.setAttribute('position', new THREE.Float32BufferAttribute([-0.1, 0.003, -0.055, 0.1, 0.003, -0.055, 0, 0.003, 0.01], 3)); g2.computeVertexNormals(); return g2; }), inM('#e8dcc4', 0.7, { side: THREE.DoubleSide })); f.castShadow = false; inB(e, inM('#cfe0c0', 0.7), 0.17, 0.004, 0.06, 0.0, 0.004, 0.035, 0.002); return e; }
function inShelterLine(H, t, k, mode) {
  const S = H.S; inHideX(S);
  const recv = mode === 'give' ? ss(0.4, 0.5, k) : 0;
  const w1 = inXP(S, inX('line1', 'line1', { sex: 'f', age: 'old', outfit: 'casual', colors: { top: '#8a5a8c' }, skin: 0.65 }), { pose: [['stand', 1 - recv * 0.5], ['hold', recv * 0.5]], expr: mode === 'give' ? [['surprised', 1 - ss(0.35, 0.5, k)], ['joy', ss(0.35, 0.5, k)]] : 'surprised', look: [0, 4], pos: [-0.12, 0, -0.5], rot: 200, add: { shR: [-45 * (1 - recv), 0, 0], elR: [-30 * (1 - recv), 0, 0] }, hand: { R: 'hold' }, t });
  inXP(S, inX('line2', 'line2', { sex: 'm', age: 'adult', outfit: 'casual', beard: 'full', colors: { top: '#7a8f5c' } }), { pose: 'stand', expr: mode === 'give' ? 'happy' : 'surprised', look: [10, 4], pos: [0.5, 0, 0.3], rot: 228, t });
  inXP(S, inX('line3', 'line3', { sex: 'f', age: 'young', outfit: 'tee', skin: 0.9, colors: { top: '#e0c46c' } }), { pose: 'stand', expr: mode === 'give' ? 'happy' : 'worried', look: [-6, 4], pos: [1.1, 0, 0.85], rot: 236, t });
  inXP(S, inX('line4', 'line4', { sex: 'm', age: 'old', outfit: 'casual', glasses: true, colors: { top: '#3b6e8f' } }), { pose: 'stand', expr: 'neutral', look: [10, 0], pos: [1.7, 0, 1.35], rot: 242, t });
  return w1;
}
function inShotGiveaway(g, t, b) {
  const H = inShelter(g), S = H.S, u = t - b.t0, k = b.k;
  const w1 = inShelterLine(H, t, k, 'give');
  inCashSet(H.cash, Math.round(lerp(18, 12, ss(0.1, 0.6, k))));
  const give = ss(0.18, 0.34, k) * (1 - ss(0.5, 0.62, k));
  inHero(S, { pose: [['stand', 0.6], ['hold', 0.4]], expr: [['happy', 0.8], ['joy', 0.2]], look: [0, -2], pos: [-0.05, 0, -1.85], rot: -15, add: { shR: [-45 * give, 0, 8], elR: [-25, 0, 0], spine: [6 * give, 0, 0] }, hand: { R: 'hold' }, t });
  const pE = k < 0.45 ? inGripW('R') : inXGrip(w1, 'R'); H.env.position.copy(pE).add(V3(0, 0.0, 0)); H.env.rotation.set(1.2, 0.1, 0); H.env.visible = true;
  H.ticket.visible = false; H.tGlow.visible = false;
  const q = EZ.io(k);
  shotCam(g, [lerp(-1.6, -1.4, q), lerp(1.45, 1.42, q), lerp(0.0, -0.2, q)], [lerp(0.1, 0.15, q), 1.2, -1.0], 32, 0.6, t);
  inPresent(g, S, { exp: 0.8, bloom: 0.3, dof: { fd: g.cam.position.distanceTo(V3(0.0, 1.3, -1.1)), ap: 8, mx: 16 } });
}
function inShotComesback(g, t, b) {
  const H = inShelter(g), S = H.S, u = t - b.t0, k = b.k;
  inShelterLine(H, t, k, 'back');
  H.env.visible = false;
  // a volunteer pulls a winning ticket out of the donation box; the money comes back, doubled
  const lift = ss(0.06, 0.2, k), dbl = ss(0.42, 0.85, k);
  const vol = inXP(S, inX('volunteer', 'volunteer', { sex: 'm', age: 'young', outfit: 'apron', colors: { top: '#e8e4dc', apron: '#2f6a4a' }, skin: 0.35 }), { pose: [['stand', 1 - lift], ['cheer', lift * 0.55]], expr: [['amazed', 0.7], ['joy', 0.3]], look: [-30, 4], pos: [-1.25, 0, -2.0], rot: 55, add: { shL: [0, 0, -60 * lift] }, hand: { R: 'hold' }, t });
  const tp = inXGrip(vol, 'R'); H.ticket.position.copy(lift > 0.1 ? tp.add(V3(0, 0.06, 0)) : V3(-1.05, 1.0, -1.2)); H.ticket.rotation.set(0, -1.0, 0.2); H.ticket.visible = true;
  H.ticket.material.emissiveIntensity = 0.35 * lift; H.tGlow.visible = true; H.tGlow.position.copy(H.ticket.position); H.tGlow.material.opacity = 0.6 * lift * (0.8 + 0.2 * Math.sin(t * 8)); H.tGlow.scale.setScalar(0.6 + 0.2 * Math.sin(t * 5));
  inCashSet(H.cash, Math.round(12 + 12 * dbl));
  const dis = ss(0.3, 0.5, k);
  inHero(S, { pose: [['stand', 1 - dis * 0.7], ['shrug', dis * 0.7]], expr: [['surprised', 1 - dis], ['worried', dis * 0.7], ['sad', dis * 0.3]], look: [lerp(-30, 0, ss(0.35, 0.5, k)), lerp(4, -22, dbl)], pos: [-0.05, 0, -1.85], rot: -15, add: { neck: [8 * dbl, 0, 0] }, t });
  const q = EZ.io(k);
  if (k < 0.45) { shotCam(g, [lerp(-1.6, -1.45, k / 0.45), 1.5, lerp(0.0, -0.15, k / 0.45)], [-0.3, 1.25, -1.5], 32, 0.5, t); inPresent(g, S, { exp: 0.8, bloom: 0.32, dof: { fd: g.cam.position.distanceTo(V3(-0.5, 1.2, -1.6)), ap: 8, mx: 16 } }); }
  else { const q2 = EZ.io((k - 0.45) / 0.55); shotCam(g, [lerp(-1.0, -0.9, q2), lerp(1.5, 1.52, q2), lerp(-0.15, -0.3, q2)], [-0.28, lerp(1.08, 1.15, q2), -1.55], 28, 0.4, t); inPresent(g, S, { exp: 0.8, bloom: 0.32, dof: { fd: g.cam.position.distanceTo(V3(-0.42, 0.85, -1.28)), ap: 7, mx: 14 } }); }
}

function setInside(g, t, b) {
  if (!IN) IN = { rooms: {} };
  if (!b) b = { shot: 'toast', t0: 0, t1: 9, k: t / 9 };
  const fn = { toast: inShotToast, powerball: inShotPowerball, news: inShotNews, tvwarning: inShotTvwarning, cheque: inShotCheque, cafe: inShotCafe, scratch: inShotScratch, hired: inShotHired, laidoff: inShotLaidoff, insurance: inShotInsurance, giveaway: inShotGiveaway, comesback: inShotComesback, again: inShotAgain, ginther: inShotGinther }[b.shot];
  if (fn) fn(g, t, b); else { fillAll('#2a2622'); hdText(`[inside: ${b.shot}]`, W / 2, H / 2, 40, { align: 'center' }); }
}

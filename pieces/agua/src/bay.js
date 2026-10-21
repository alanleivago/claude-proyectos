
// =====================================================================
//  BAY — a seaside promenade: stone paving, a granite seawall with a steel railing, the bay (a wave shader with sky
//  reflection, sun glint and foam at the wall) over a real seabed (mud, sand, rocks, weed, fish) that shows when the
//  water vanishes; a marina (pontoons on pilings, sailboats and motorboats that drop onto the mud), a ferry,
//  a lighthouse on a rocky headland, hills and a town on the far shore, and volumetric-looking clouds (they vanish too).
//  You sit on a bench at the origin facing the bay (-z). The seawall edge is z = -10, the water 1.4 m below the paving.
// =====================================================================
const BAY = { WALL: -10, LEVEL: -1.4 };
const SUND = dirV(-28 * DEG, 30 * DEG);
const bedY = (x, z) => { const d = Math.max(0, -z + BAY.WALL); const base = -5.6 - 6.5 * (1 - Math.exp(-d / 90)) + 4.5 * ss(900, 1400, d); return base + 0.5 * Math.sin(x * 0.05 + z * 0.03) + 0.3 * Math.sin(x * 0.13 - z * 0.11); };
function slabTex() { return g3Tex((x, w) => { const R = RNG('slab'); x.fillStyle = '#b9b2a6'; x.fillRect(0, 0, w, w); const sw = w / 4, sh = w / 8;
  for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const ox = (r % 2) * sw * 0.5, l = R.r(-14, 14); x.fillStyle = `rgb(${186 + l},${179 + l},${168 + l})`; x.fillRect(c * sw + ox + 2, r * sh + 2, sw - 4, sh - 4);
    for (let k = 0; k < 160; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '60,55,50' : '235,230,220'},${R.r(0.05, 0.18)})`; x.fillRect(c * sw + ox + R.r(2, sw - 3), r * sh + R.r(2, sh - 3), R.r(1, 3), R.r(1, 3)); }
    if (R.f() < 0.25) blot(x, c * sw + ox + R.r(10, sw - 10), r * sh + R.r(8, sh - 8), R.r(8, 24), 'rgba(90,80,70,0.12)'); }
  x.strokeStyle = 'rgba(70,64,58,0.55)'; x.lineWidth = 2; for (let r = 0; r <= 8; r++) { x.beginPath(); x.moveTo(0, r * sh); x.lineTo(w, r * sh); x.stroke(); } }, 1024, 1024); }
function stoneWallTex() { return g3Tex((x, w, h) => { const R = RNG('wall'); x.fillStyle = '#8a8478'; x.fillRect(0, 0, w, h); const bw = w / 6, bh = h / 10;
  for (let r = 0; r < 10; r++) for (let c = -1; c < 7; c++) { const ox = (r % 2) * bw * 0.5, l = R.r(-18, 18); x.fillStyle = `rgb(${132 + l},${126 + l},${116 + l})`; x.fillRect(c * bw + ox + 3, r * bh + 3, bw - 6, bh - 6); speck(x, w, h, 0, ['#000'], R); }
  speck(x, w, h, 9000, ['rgba(40,36,30,0.25)', 'rgba(220,215,200,0.2)'], R, 1, 2);
  const g = x.createLinearGradient(0, h * 0.18, 0, h); g.addColorStop(0, 'rgba(40,60,30,0)'); g.addColorStop(0.08, 'rgba(40,60,30,0.75)'); g.addColorStop(0.4, 'rgba(30,40,25,0.85)'); g.addColorStop(1, 'rgba(20,25,18,0.9)'); x.fillStyle = g; x.fillRect(0, h * 0.18, w, h);
  for (let k = 0; k < 600; k++) { x.fillStyle = `rgba(230,225,210,${R.r(0.2, 0.6)})`; x.beginPath(); x.arc(R.r(0, w), R.r(h * 0.25, h * 0.7), R.r(1, 3), 0, TAU); x.fill(); } }, 512, 512); }
function mudTex() { return g3Tex((x, w) => { const R = RNG('mud'); x.fillStyle = '#5a5040'; x.fillRect(0, 0, w, w); for (let k = 0; k < 60; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 90), R.pick(['rgba(120,105,80,0.35)', 'rgba(40,36,28,0.35)', 'rgba(150,135,100,0.3)']));
  speck(x, w, w, 30000, ['rgba(30,26,20,0.4)', 'rgba(170,155,120,0.35)', 'rgba(90,80,60,0.4)'], R, 1, 2); for (let k = 0; k < 300; k++) { x.strokeStyle = 'rgba(30,26,20,0.25)'; x.lineWidth = R.r(1, 2); x.beginPath(); const y = R.r(0, w); x.moveTo(R.r(0, w), y); x.quadraticCurveTo(R.r(0, w), y + R.n(10), R.r(0, w), y + R.n(6)); x.stroke(); } }, 512, 512); }
function cloudTex(seed) { return g3Tex((x, w) => { const R = RNG('cloud' + seed), im = x.createImageData(w, w), o1 = R.r(0, 50), o2 = R.r(0, 50);
  const hs = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7 + o1 * 17.3) * 43758.5453; return v - Math.floor(v); }, vn = (px, py) => { const i = Math.floor(px), j = Math.floor(py), fx = px - i, fy = py - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hs(i, j), hs(i + 1, j), u), lerp(hs(i, j + 1), hs(i + 1, j + 1), u), v); };
  const fbm = (px, py) => { let a = 0, m = 0.5, f = 1; for (let k = 0; k < 6; k++) { a += m * vn(px * f + o2, py * f); m *= 0.5; f *= 2.03; } return a; };
  const bumps = []; for (let k = 0; k < 7; k++) bumps.push([R.r(0.18, 0.82), R.r(0.1, 0.24)]);
  for (let py = 0; py < w; py++) for (let px = 0; px < w; px++) { const u = px / w, v = py / w; let top = 0.62; bumps.forEach(([c, r]) => (top = Math.min(top, 0.62 - Math.sqrt(Math.max(0, r * r - (u - c) ** 2)) * 1.25)));
    const n = fbm(u * 7, v * 7), edge = Math.min(v - top, 0.64 - v, u - 0.06, 0.94 - u) * 9 + (n - 0.5) * 1.6, a = clamp(edge * 2.2), lit = clamp(1 - (v - top) * 2.4 + (n - 0.5) * 0.6), c = 168 + 87 * lit;
    const k = (py * w + px) * 4; im.data[k] = c - 8 * (1 - lit); im.data[k + 1] = c - 4 * (1 - lit); im.data[k + 2] = Math.min(255, c + 12 * (1 - lit)); im.data[k + 3] = 255 * a; } x.putImageData(im, 0, 0); }, 512, 512); }

function buildBay(st) {
  const R = RNG('bay'), S = { st };
  // paving: the promenade and the plaza behind you; a granite kerb at the seawall
  const slab = wrap(slabTex(), 400 / 3.2, 60 / 3.2); const pave = new THREE.Mesh(new THREE.PlaneGeometry(400, 60).rotateX(-Math.PI / 2), STDm({ map: slab, color: '#cfc8bc', roughness: 0.85, bumpMap: slab, bumpScale: 0.006 })); pave.position.set(0, 0, BAY.WALL + 30); pave.receiveShadow = true; st.scene.add(pave);
  const kerb = new THREE.Mesh(new THREE.BoxGeometry(400, 0.18, 0.7), STDm({ color: '#a8a296', roughness: 0.7, map: wrap(texNoise('kerb', '#a8a296', ['rgba(60,55,50,0.3)', 'rgba(230,225,215,0.3)']), 80, 1) })); kerb.position.set(0, 0.0, BAY.WALL + 0.35); kerb.receiveShadow = kerb.castShadow = true; st.scene.add(kerb);
  // the seawall face, down to the bed
  const wallT = wrap(stoneWallTex(), 50, 1); const wall = new THREE.Mesh(new THREE.PlaneGeometry(400, 9), STDm({ map: wallT, roughness: 0.9, bumpMap: wallT, bumpScale: 0.02 })); wall.position.set(0, -4.5, BAY.WALL); wall.receiveShadow = true; st.scene.add(wall);
  // the railing: steel posts, a round top rail, two lower rails
  const steel = STDm({ color: '#2c3036', metalness: 0.75, roughness: 0.35 }), posts = IM(new THREE.CylinderGeometry(0.03, 0.035, 1.1, 10).translate(0, 0.55, 0), steel, 200);
  for (let i = 0; i < 200; i++) posts.setMatrixAt(i, M4c(-200 + i * 2, 0, BAY.WALL + 0.25)); st.scene.add(posts);
  [[1.1, 0.032], [0.75, 0.012], [0.42, 0.012]].forEach(([y, r]) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 400, 12).rotateZ(Math.PI / 2), steel); m.position.set(0, y, BAY.WALL + 0.25); m.castShadow = true; st.scene.add(m); });
  // the seabed: mud and sand with depth, rocks, weed, shells; fish that flop once the water is gone
  const bedG = new THREE.PlaneGeometry(4000, 3000, 400, 300).rotateX(-Math.PI / 2); { const p = bedG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i) + BAY.WALL - 1500; p.setY(i, bedY(x, z)); p.setZ(i, z); } bedG.computeVertexNormals(); }
  const mud = wrap(mudTex(), 400, 300), bed = new THREE.Mesh(bedG, STDm({ map: mud, roughness: 0.55, bumpMap: mud, bumpScale: 0.05, color: '#bfb8a8' })); bed.receiveShadow = true; st.scene.add(bed);
  const rockG = new THREE.DodecahedronGeometry(1, 1); { const p = rockG.attributes.position; for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (1 + 0.2 * Math.sin(i)), p.getY(i) * 0.6, p.getZ(i) * (1 + 0.2 * Math.cos(i * 1.3))); rockG.computeVertexNormals(); }
  const rocks = IM(rockG, STDm({ color: '#5a554c', roughness: 0.9 }), 1600); for (let i = 0; i < 1600; i++) { const near = i < 500, x = near ? R.r(-80, 80) : R.r(-700, 700), z = near ? BAY.WALL - R.r(0.5, 14) : BAY.WALL - R.r(10, 600), s = near ? R.r(0.2, 1.1) : R.r(0.3, 2.5); rocks.setMatrixAt(i, M4c(x, bedY(x, z) + s * 0.2, z, R.r(0, 6), s, s, s)); rocks.setColorAt(i, lin(R.pick(['#5a554c', '#4a463e', '#6a645a', '#3e3a34'])).multiplyScalar(1.6)); } st.scene.add(rocks);
  const weedT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); const Rw = RNG('weed'); for (let k = 0; k < 30; k++) { x.strokeStyle = Rw.pick(['#3a4a1a', '#4a5a20', '#2a3a14', '#5a4a1a']); x.lineWidth = Rw.r(2, 5); x.beginPath(); const bx = Rw.r(0, w); x.moveTo(bx, w); x.bezierCurveTo(bx + Rw.n(20), w * 0.6, bx + Rw.n(30), w * 0.3, bx + Rw.n(40), Rw.r(w * 0.1, w * 0.5)); x.stroke(); } }, 128, 128);
  const weed = IM(new THREE.PlaneGeometry(1.2, 0.5).rotateX(-Math.PI / 2 + 0.25).translate(0, 0.05, 0), STDm({ map: weedT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.4 }), 2400, false);
  for (let i = 0; i < 2400; i++) { const x = R.r(-300, 300), z = BAY.WALL - R.r(0.5, 200) ** 1.0; weed.setMatrixAt(i, M4c(x, bedY(x, z) + 0.02, z, R.r(0, 6), R.r(0.6, 1.8), 1, R.r(0.6, 1.8))); } st.scene.add(weed);
  const fishG = new THREE.SphereGeometry(0.1, 10, 8).scale(1.8, 0.6, 0.35), fish = IM(fishG, STDm({ color: '#b8c4cc', metalness: 0.6, roughness: 0.25 }), 220); const fishL = [];
  for (let i = 0; i < 220; i++) { const x = R.r(-60, 60), z = BAY.WALL - R.r(1, 45); fishL.push({ x, z, y: bedY(x, z) + 0.06, ph: R.r(0, 6), yaw: R.r(0, 6), s: R.r(0.6, 1.6) }); } st.scene.add(fish);
  // the water: a wave shader over the whole bay (level BAY.LEVEL)
  const RT = new THREE.WebGLRenderTarget(540, 960), rcam = new THREE.PerspectiveCamera(); const WU = { uT: { value: 0 }, uSun: { value: SUND.clone() }, uRef: { value: RT.texture }, uRM: { value: new THREE.Matrix4() }, uFront: { value: 999 }, uSurge: { value: 0 } };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(8000, 5990, 1, 1).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: Object.assign(WU, THREE.UniformsLib.fog), fog: true, transparent: true,
    vertexShader: 'varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;\n#include <fog_vertex>\n}',
    fragmentShader: `uniform float uT; uniform vec3 uSun; uniform sampler2D uRef; uniform mat4 uRM; uniform float uFront; uniform float uSurge; varying vec3 vW;
#include <fog_pars_fragment>
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h2(i), h2(i + vec2(1, 0)), f.x), mix(h2(i + vec2(0, 1)), h2(i + vec2(1, 1)), f.x), f.y); }
float hgt(vec2 p){ float h = 0.0; h += 0.10 * sin(dot(p, vec2(0.21, 0.13)) + uT * 1.3) + 0.08 * sin(dot(p, vec2(-0.17, 0.27)) + uT * 1.7);
  mat2 r1 = mat2(0.8, -0.6, 0.6, 0.8); vec2 q = p * 0.7; float a = 0.5; for (int i = 0; i < 5; i++) { h += a * vn(q + vec2(uT * 0.35, uT * 0.22) * float(i + 1)); q = r1 * q * 2.1; a *= 0.5; } return h; }
void main(){ if (vW.z > uFront) discard; vec2 p = vW.xz; float d = length(vW - cameraPosition); float e = 0.08 + d * 0.004; float fade = 1.0 / (1.0 + d * 0.006);
  vec3 n = normalize(vec3(-(hgt(p + vec2(e, 0.0)) - hgt(p - vec2(e, 0.0))) * fade, 2.0 * e, -(hgt(p + vec2(0.0, e)) - hgt(p - vec2(0.0, e))) * fade));
  vec3 V = normalize(vW - cameraPosition), Rf = reflect(V, n); float fres = 0.02 + 0.98 * pow(1.0 - max(dot(-V, n), 0.0), 5.0);
  vec3 sky = mix(vec3(0.78, 0.86, 0.94), vec3(0.22, 0.45, 0.8), clamp(Rf.y * 2.2, 0.0, 1.0));
  vec3 deep = vec3(0.03, 0.17, 0.24), shallow = vec3(0.1, 0.3, 0.32); vec3 body = mix(shallow, deep, clamp((-p.y - 12.0) / 60.0, 0.0, 1.0));
  vec4 rc = uRM * vec4(vW, 1.0); vec2 ruv = rc.xy / rc.w * 0.5 + 0.5 + n.xz * 0.06 * fade; vec4 rf = texture2D(uRef, clamp(ruv, 0.001, 0.999)); sky = mix(sky, rf.rgb, rf.a);
  vec3 col = mix(body, sky, clamp(fres + 0.18, 0.0, 1.0)); col += vec3(1.0, 0.96, 0.88) * pow(max(dot(Rf, uSun), 0.0), 420.0) * 6.0 + vec3(1.0, 0.95, 0.85) * pow(max(dot(Rf, uSun), 0.0), 40.0) * 0.25;
  float wallD = (${BAY.WALL.toFixed(1)} - p.y); float foam = smoothstep(2.5, 0.0, wallD) * smoothstep(0.35, 0.75, vn(p * 3.0 + vec2(0.0, uT * 1.5)) + 0.3 * sin(wallD * 6.0 - uT * 3.0));
  foam += smoothstep(0.78, 0.95, hgt(p * 1.4)) * 0.25 * fade; foam += uSurge * smoothstep(60.0, 0.0, wallD) * smoothstep(0.3, 0.7, vn(p * 0.8 + uT) + vn(p * 3.0 - uT * 2.0) * 0.5); col = mix(col, vec3(0.92, 0.95, 0.96), clamp(foam, 0.0, 0.9));
  gl_FragColor = vec4(col, 1.0);
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>
}` }));
  water.position.set(0, BAY.LEVEL, BAY.WALL - 2995); st.scene.add(water);
  // the marina (right): pilings, floating pontoons, moored boats; a ferry mid-bay
  const wood = STDm({ color: '#7a6248', roughness: 0.85, map: wrap(texNoise('deck', '#7a6248', ['rgba(40,30,20,0.35)', 'rgba(150,120,90,0.3)']), 1, 8) }), pile = STDm({ color: '#4a3e32', roughness: 0.9 });
  const pons = []; [[40, -26, 70, 0], [40, -48, 70, 0], [40, -70, 70, 0]].forEach(([cx, cz, L]) => { const g = new THREE.Group(); g.position.set(cx, BAY.LEVEL + 0.25, cz); st.scene.add(g); const d = new THREE.Mesh(new THREE.BoxGeometry(L, 0.3, 2.2), wood); d.castShadow = d.receiveShadow = true; g.add(d); pons.push({ g, y0: BAY.LEVEL + 0.25, x: cx, z: cz });
    for (let k = 0; k <= 7; k++) { const x = cx - L / 2 + k * L / 7, by = bedY(x, cz); const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.5 - by, 10), pile); p.position.set(x, (4.5 + by) / 2 - 1.4 + 0.3, cz - 1.4); p.castShadow = true; st.scene.add(p); } });
  const boats = []; for (let k = 0; k < 22; k++) { const g = new THREE.Group(), row = k % 3, x = 10 + Math.floor(k / 3) * 9.2 + R.r(-0.5, 0.5), z = -26 - row * 22 + (k % 2 ? 5.2 : -5.2), sail = R.f() < 0.55, L = sail ? R.r(8, 11) : R.r(6, 9);
    const hullG = new THREE.CapsuleGeometry(L * 0.18, L * 0.62, 6, 16).rotateZ(Math.PI / 2); { const p = hullG.attributes.position; for (let i = 0; i < p.count; i++) { const x0 = p.getX(i), y0 = p.getY(i), bow = clamp(x0 / (L * 0.5)), wz = 1 - 0.75 * Math.max(0, bow) ** 2; p.setXYZ(i, x0, y0 < 0 ? y0 * (sail ? 1.25 : 0.9) : y0 * 0.45, p.getZ(i) * wz); } hullG.computeVertexNormals(); }
    const hc = R.pick(['#f4f2ec', '#f4f2ec', '#1c3a6a', '#e8e4da', '#8a1c1c']), hull = new THREE.Mesh(hullG, STDm({ color: hc, roughness: 0.35 })); hull.castShadow = true; g.add(hull);
    const stripe = new THREE.Mesh(hullG.clone().scale(1.005, 0.12, 1.02).translate(0, L * 0.02, 0), STDm({ color: R.pick(['#1c3a6a', '#c8372d', '#2a8a5a']) })); g.add(stripe);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(L * 0.32, L * 0.1, L * 0.2), STDm({ color: '#f4f2ec', roughness: 0.4 })); cab.position.set(-L * 0.05, L * 0.1, 0); cab.castShadow = true; g.add(cab); const win = new THREE.Mesh(new THREE.BoxGeometry(L * 0.33, L * 0.035, L * 0.205), STDm({ color: '#1a2430', roughness: 0.1, metalness: 0.5 })); win.position.set(-L * 0.05, L * 0.11, 0); g.add(win);
    if (sail) { const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, L * 1.3, 8), STDm({ color: '#d8dade', metalness: 0.8, roughness: 0.3 })); mast.position.set(L * 0.06, L * 0.7, 0); mast.castShadow = true; g.add(mast); const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, L * 0.45, 8).rotateZ(Math.PI / 2), STDm({ color: '#d8dade' })); boom.position.set(-L * 0.17, L * 0.2, 0); g.add(boom);
      const furl = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, L * 0.4, 4, 8).rotateZ(Math.PI / 2), STDm({ color: '#1c3a6a' })); furl.position.set(-L * 0.17, L * 0.25, 0); g.add(furl); }
    const yaw = Math.PI / 2 + R.n(0.05); g.rotation.y = yaw; g.position.set(x, BAY.LEVEL + 0.05, z); st.scene.add(g); boats.push({ g, x, z, y0: BAY.LEVEL + 0.05, keel: sail ? L * 0.23 : L * 0.16, ph: R.r(0, 6), tilt: (R.f() < 0.5 ? -1 : 1) * R.r(0.25, 0.55), yaw }); }
  const ferry = new THREE.Group(); { const hull = new THREE.Mesh(new THREE.BoxGeometry(38, 4, 10), STDm({ color: '#f2f0ea', roughness: 0.4 })); hull.position.y = 0.5; ferry.add(hull); const band = new THREE.Mesh(new THREE.BoxGeometry(38.2, 0.8, 10.2), STDm({ color: '#c8372d' })); band.position.y = -1.0; ferry.add(band);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(26, 3, 8.5), windowsMat('#e8e6e0')); deck.position.set(-2, 4, 0); ferry.add(deck); const fun = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 4, 14), STDm({ color: '#1c3a6a' })); fun.position.set(-6, 7, 0); ferry.add(fun);
    ferry.traverse((m) => { if (m.isMesh) m.castShadow = true; }); ferry.position.set(-60, BAY.LEVEL - 1.2, -260); ferry.rotation.y = 0.3; st.scene.add(ferry); }
  // the far shore: hills with a town, and a lighthouse on a rocky headland at the left
  const hsh = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); }, vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hsh(i, j), hsh(i + 1, j), u), lerp(hsh(i, j + 1), hsh(i + 1, j + 1), u), v); };
  const fbm = (x, y) => { let a = 0, m = 0.5, f = 1; for (let o = 0; o < 6; o++) { a += m * (1 - Math.abs(vn(x * f, y * f) * 2 - 1)); m *= 0.5; f *= 2.1; } return a; };
  const terG = new THREE.PlaneGeometry(9000, 1600, 360, 80).rotateX(-Math.PI / 2), tp = terG.attributes.position, tcol = [];
  for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), zl = tp.getZ(i), z = zl - 2200, back = clamp((-1480 - z) / 700), h = (fbm(x / 1100, z / 900) * 330 - 90) * ss(0, 0.5, back) + 30 * back; tp.setY(i, Math.max(-6, h)); tp.setZ(i, z);
    const n = vn(x / 60, z / 60), c = h < 30 ? lin('#6e8a46') : h > 300 ? lin('#8a8478').lerp(lin('#5a7040'), n * 0.6) : lin('#3e6a2c').lerp(lin('#5e8a3a'), n).lerp(lin('#7a8a50'), clamp((h - 220) / 120)); tcol.push(c.r, c.g, c.b); }
  terG.setAttribute('color', new THREE.Float32BufferAttribute(tcol, 3)); terG.computeVertexNormals();
  const forT = wrap(g3Tex((x, w) => { const Rh = RNG('forest'); x.fillStyle = '#c8d0c0'; x.fillRect(0, 0, w, w); for (let k = 0; k < 5000; k++) { const l = Rh.r(55, 100); x.fillStyle = `rgb(${l},${l + 8},${l - 6})`; x.beginPath(); x.arc(Rh.r(0, w), Rh.r(0, w), Rh.r(1.5, 4), 0, TAU); x.fill(); } }, 512, 512), 90, 16);
  const terrain = new THREE.Mesh(terG, STDm({ vertexColors: true, map: forT, roughness: 0.95 })); terrain.receiveShadow = true; st.scene.add(terrain);
  const townM = ['#e8e2d6', '#d8cfc0', '#f0ece4', '#c8b8a4', '#e0c8b0'].map((c) => windowsMat(c)), town = townM.map((m) => IM(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), m, 400)), tn = townM.map(() => 0);
  for (let i = 0; i < 2000; i++) { const k = i % 5, x = R.r(-1600, 1600), z = R.r(-1405, -1560), h = R.r(10, 40) * (Math.abs(x - 300) < 320 ? R.r(1.2, 4.5) : 1); if (tn[k] >= 400) continue; town[k].setMatrixAt(tn[k]++, M4c(x, 0, z, R.r(-0.2, 0.2), R.r(12, 26), h, R.r(12, 22))); }
  const side = (n, x0, x1, z0, z1, h0, h1) => { for (let i = 0; i < n; i++) { const k = i % 5; if (tn[k] >= 400) continue; const x = R.r(x0, x1), z = R.r(z0, z1); town[k].setMatrixAt(tn[k]++, M4c(x, 0, z, R.r(-0.3, 0.3), R.r(14, 26), R.r(h0, h1), R.r(12, 22))); } };
  side(160, -900, -330, -260, -1350, 12, 34); side(140, 160, 900, -150, -1300, 14, 60); side(30, 100, 240, -10, 60, 20, 70);
  town.forEach((m, k) => { m.count = tn[k]; m.castShadow = false; st.scene.add(m); });
  // the shores under the side towns (low land so they don't float)
  [[-615, -800, 570, 1100], [530, -720, 740, 1160]].forEach(([x, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 14, d), STDm({ color: '#8a8a70', roughness: 0.95 })); m.position.set(x, -6.5, z); m.receiveShadow = true; st.scene.add(m); });
  const head = new THREE.Group(); head.position.set(-210, 0, -330); st.scene.add(head); { const rk = IM(rockG, STDm({ color: '#6a645a', roughness: 0.95 }), 60); for (let i = 0; i < 60; i++) { const a = R.r(0, TAU), r = R.r(0, 34), s = R.r(5, 16); rk.setMatrixAt(i, M4c(Math.cos(a) * r, bedY(-210, -330) + R.r(0, 9) * (1 - r / 40) + 2, Math.sin(a) * r * 0.7, R.r(0, 6), s, s * R.r(0.8, 1.6), s)); rk.setColorAt(i, lin(R.pick(['#6a645a', '#5a554c', '#7a7266'])).multiplyScalar(1.5)); } head.add(rk);
    const lh = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.4, 22, 24), STDm({ color: '#f4f2ec', roughness: 0.6 })); lh.position.y = 20; lh.castShadow = true; head.add(lh); [14, 22].forEach((y) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(3.0 - (y - 9) * 0.045, 3.1 - (y - 9) * 0.045, 2.6, 24), STDm({ color: '#c8372d' })); b.position.y = y; head.add(b); });
    const gal = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 0.4, 24), STDm({ color: '#2c3036' })); gal.position.y = 31.2; head.add(gal); const lan = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 3, 16), STDm({ color: '#fff4d0', emissive: '#ffe8a0', emissiveIntensity: 0.4, roughness: 0.1 })); lan.position.y = 33; head.add(lan); const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.4, 16), STDm({ color: '#c8372d' })); roof.position.y = 35.7; head.add(roof); }
  // clouds: soft cumulus billboards high over the bay (water: they vanish too)
  const clouds = []; for (let k = 0; k < 26; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudTex(k % 6), transparent: true, depthWrite: false, fog: false })); const a = R.r(-1.5, 1.5), d = R.r(2600, 5200), s = R.r(420, 900);
    m.position.set(Math.sin(a) * d, R.r(380, 1100), -Math.cos(a) * d * 0.9 - 200); m.scale.set(s * 1.6, s, 1); m.lookAt(0, m.position.y * 0.6, 0); m.renderOrder = -1; st.scene.add(m); clouds.push(m); }
  Object.assign(S, { RT, rcam, water, WU, bed, fish, fishL, boats, pons, ferry, clouds }); return S;
}
// the water's state: k = 1 normal, 0 gone; tsG = scene seconds since it vanished (boats fall, fish flop)
function poseBay(S, ts, k, tsG, tb = -1) {
  S.WU.uT.value = ts; S.water.visible = k > 0.01; S.water.material.opacity = k; S.clouds.forEach((c) => (c.visible = k > 0.01, c.material.opacity = k));
  const fall = (y0, yb, s) => Math.max(yb, y0 - 0.5 * 9.8 * s * s);
  S.boats.forEach((b) => { const wet = k > 0.5 && !(tb >= 0 && frontZ(tb) < b.z); if (wet) { const sw = tb >= 0 ? Math.exp(-Math.max(0, tb - 1) * 0.5) : 0; b.g.position.y = b.y0 + 0.08 * Math.sin(ts * 1.2 + b.ph) + sw * (1.2 + 0.8 * Math.sin(tb * 4 + b.ph)); b.g.rotation.set(0.02 * Math.sin(ts * 1.0 + b.ph) + sw * 0.25 * Math.sin(tb * 3.3 + b.ph), b.yaw, 0.03 * Math.sin(ts * 0.9 + b.ph) + sw * 0.35 * Math.sin(tb * 2.7 + b.ph), 'YXZ'); return; } if (k > 0.5) tsG = 99;
    const yb = bedY(b.x, b.z) + b.keel * 0.55, y = fall(b.y0, yb, tsG), landed = clamp((b.y0 - y) / Math.max(0.01, b.y0 - yb)); b.g.position.y = y; b.g.rotation.set(0, b.yaw, b.tilt * ss(0.7, 1, landed), 'YXZ'); });
  S.pons.forEach((p) => (p.g.position.y = k > 0.5 && !(tb >= 0 && frontZ(tb) < p.z) ? p.y0 + 0.04 * Math.sin(ts + p.x) : fall(p.y0, bedY(p.x, p.z) + 0.3, k > 0.5 ? 99 : tsG)));
  S.ferry.position.y = k > 0.5 ? BAY.LEVEL - 1.2 + 0.1 * Math.sin(ts * 0.5) : fall(BAY.LEVEL - 1.2, bedY(-60, -260) + 3.0, tsG); S.ferry.rotation.z = k > 0.5 ? 0 : 0.12 * ss(0, 2, tsG);
  S.fish.visible = k < 0.5 || (tb >= 0 && tb < WV.ARRIVE); if (S.fish.visible) S.fishL.forEach((f, i) => { const fl = Math.max(0, Math.sin(tsG * 9 + f.ph)) ** 2; S.fish.setMatrixAt(i, M4c(f.x, f.y + 0.06 * fl, f.z, f.yaw, f.s, f.s, f.s, 0, 1.4 + 0.3 * Math.sin(tsG * 13 + f.ph))); }); S.fish.instanceMatrix.needsUpdate = true;
}

// render the reflection: the camera mirrored in the water plane, everything below the plane clipped away
const _rp = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BAY.LEVEL), _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function renderReflection(S, st) { if (!S.water.visible || CAMONLY) return; const cam = st.cam, rc = S.rcam, Rr = r3(); cam.updateMatrixWorld(true);
  rc.copy(cam); const L = BAY.LEVEL; rc.position.set(cam.position.x, 2 * L - cam.position.y, cam.position.z); cam.getWorldDirection(_v1); _v2.copy(cam.position).add(_v1); _v2.y = 2 * L - _v2.y; rc.up.set(0, -1, 0); rc.lookAt(_v2); rc.up.set(0, 1, 0);
  rc.updateMatrixWorld(true); rc.updateProjectionMatrix(); S.WU.uRM.value.multiplyMatrices(rc.projectionMatrix, rc.matrixWorldInverse);
  S.water.visible = false; Rr.r.clippingPlanes = [_rp]; Rr.r.setRenderTarget(S.RT); Rr.r.setClearColor(0x000000, 0); Rr.r.clear(); Rr.r.render(st.scene, rc); Rr.r.setRenderTarget(null); Rr.r.clippingPlanes = []; S.water.visible = true; }

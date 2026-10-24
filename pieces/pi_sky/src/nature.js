// nature: grass tufts in the wind, leaf cards, drops (from agua)
function grassTuftGeo(seed, n = 12) { const R = RNG('tuft' + seed), pos = [], col = [], idx = []; const base = lin('#2f5a1e'), mid = lin('#4f8a2c'), tip = lin('#a8c45a');
  for (let b = 0; b < n; b++) { const a = R.r(0, TAU), r = R.r(0, 0.09), h = R.r(0.07, 0.17), w0 = R.r(0.006, 0.011), lean = R.r(0.1, 0.5), dir = R.r(0, TAU), bx = Math.cos(a) * r, bz = Math.sin(a) * r, i0 = pos.length / 3, tipC = tip.clone().lerp(lin(R.pick(['#c8c070', '#7aa840', '#94b84a'])), R.r(0, 0.6));
    for (let s = 0; s <= 4; s++) { const u = s / 4, y = h * u, off = lean * h * u * u, w = w0 * (1 - u * 0.92), px = bx + Math.cos(dir) * off, pz = bz + Math.sin(dir) * off, nx = -Math.sin(dir) * w, nz = Math.cos(dir) * w;
      pos.push(px - nx, y, pz - nz, px + nx, y, pz + nz); const c = u < 0.5 ? base.clone().lerp(mid, u * 2) : mid.clone().lerp(tipC, (u - 0.5) * 2); col.push(c.r, c.g, c.b, c.r, c.g, c.b); }
    for (let s = 0; s < 4; s++) { const p = i0 + s * 2; idx.push(p, p + 1, p + 2, p + 1, p + 3, p + 2); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
const WIND = { value: 0 };
function windMat(o) { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.75 }, o));
  m.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    { vec2 ip = vec2(0.0);
#ifdef USE_INSTANCING
    ip = instanceMatrix[3].xz;
#endif
    float hk = transformed.y * transformed.y * 14.0; transformed.x += hk * (0.05 * sin(uWind * 1.7 + ip.x * 0.35 + ip.y * 0.21) + 0.02 * sin(uWind * 4.1 + ip.x * 1.3)); transformed.z += hk * 0.03 * sin(uWind * 1.3 + ip.y * 0.4); }`);
    sh.vertexShader = sh.vertexShader.replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n objectNormal = normalize(objectNormal + vec3(0.0, 1.2, 0.0));'); }; return m; }
function leafCardTex() { return g3Tex((x, w) => { x.clearRect(0, 0, w, w); const R = RNG('leafcard'); for (let k = 0; k < 300; k++) { const rr = Math.sqrt(R.f()) * w * 0.46, aa = R.r(0, TAU), cx = w / 2 + Math.cos(aa) * rr, cy = w / 2 + Math.sin(aa) * rr, a = R.r(0, TAU), L = R.r(8, 14);
  x.save(); x.translate(cx, cy); x.rotate(a); x.fillStyle = `hsl(${R.r(78, 112)},${R.r(32, 55)}%,${R.r(18, 40)}%)`; x.beginPath(); x.moveTo(-L, 0); x.quadraticCurveTo(0, -L * 0.48, L, 0); x.quadraticCurveTo(0, L * 0.48, -L, 0); x.fill(); x.strokeStyle = 'rgba(20,40,10,0.35)'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(-L, 0); x.lineTo(L, 0); x.stroke(); x.restore(); } }, 256, 256); }
function dropTex() { return g3Radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(230,242,255,0.85)'], [1, 'rgba(200,225,255,0)']], 64); }


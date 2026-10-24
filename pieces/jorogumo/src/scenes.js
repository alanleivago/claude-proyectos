// =====================================================================
//  SCENES — small helpers for the 3D world (world.js) and the shots (run.js).
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const hsh = (i, k = 1) => mod(Math.sin(i * 12.9898 + k * 78.233) * 43758.5453, 1);
// value noise in 2D (deterministic)
function vn2(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), fx = x - xi, fz = z - zi, u = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  const h = (a, b) => hsh(a * 57.1 + b * 113.7, 3.1);
  return lerp(lerp(h(xi, zi), h(xi + 1, zi), u), lerp(h(xi, zi + 1), h(xi + 1, zi + 1), u), v);
}
const fbm2 = (x, z) => vn2(x, z) * 0.55 + vn2(x * 2.1, z * 2.1) * 0.28 + vn2(x * 4.3, z * 4.3) * 0.17;
// keyframed value: K = [[t, v], ...], smooth between keys
const pan = (K, t) => { if (t <= K[0][0]) return K[0][1]; if (t >= K[K.length - 1][0]) return K[K.length - 1][1]; let i = 0; while (t > K[i + 1][0]) i++; const [a, va] = K[i], [b, vb] = K[i + 1]; return va + (vb - va) * ss(a, b, t); };
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const panV = (K, t) => V3(pan(K.map(([a, v]) => [a, v[0]]), t), pan(K.map(([a, v]) => [a, v[1]]), t), pan(K.map(([a, v]) => [a, v[2]]), t));
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops, w = 64) => g3Tex((x) => { const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, w, w); }, w, w);
const IM = (geo, mat, n, shadow = true) => { const m = new THREE.InstancedMesh(geo, mat, Math.max(1, n)); m.castShadow = shadow; m.receiveShadow = true; m.count = n; return m; };
const M4c = (x, y, z, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V3(sx, sy, sz));
const LAM = (o) => new THREE.MeshLambertMaterial(Object.assign({ flatShading: true }, o));
// merge [geometry, matrix, colour | (y) => colour] parts into one flat-shaded vertex-coloured geometry
function mergeG(parts, smoothN = false) {
  const P = [], Cc = [], UV = [], NN = [];
  parts.forEach(([geo, m4, col]) => {
    let g = geo.clone(); g.applyMatrix4(m4 || new THREE.Matrix4()); if (g.index) g = g.toNonIndexed();
    const p = g.attributes.position, src = geo.attributes.position, uv = g.attributes.uv, nn = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      P.push(p.getX(i), p.getY(i), p.getZ(i)); UV.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0); if (nn) NN.push(nn.getX(i), nn.getY(i), nn.getZ(i)); else NN.push(0, 1, 0);
      const c = lin(typeof col === 'function' ? col(p.getX(i), p.getY(i), p.getZ(i), i) : col); Cc.push(c.r, c.g, c.b);
    }
    void src;
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
  if (smoothN) g.setAttribute('normal', new THREE.Float32BufferAttribute(NN, 3)); else g.computeVertexNormals(); return g;
}
// put a unit cylinder (height 1 along y, centred) between a and b with radius r
const _up = V3(0, 1, 0);
function between(mesh, a, b, r) {
  const d = b.clone().sub(a), L = d.length(); mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.quaternion.setFromUnitVectors(_up, d.normalize()); mesh.scale.set(r, L, r);
}
const SHADER_HEAD = '#include <common>\n#include <fog_pars_vertex>\nvarying vec3 vW; varying vec2 vUv;\n';
const NOISE_GL = `float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n2(p);p*=2.03;a*=.5;}return s;}
`;
function shaderMat(uniforms, frag, o = {}) {
  return new THREE.ShaderMaterial(Object.assign({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, uniforms]), fog: true,
    vertexShader: SHADER_HEAD + (o.vpre || '') + `void main(){ vUv=uv; vec3 p=position; ${o.vbody || ''} vec4 w=modelMatrix*vec4(p,1.); vW=w.xyz; vec4 mvPosition=viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    fragmentShader: '#include <common>\n#include <fog_pars_fragment>\nvarying vec3 vW; varying vec2 vUv;\n' + NOISE_GL + frag.replace('#END', '#include <encodings_fragment>\n#include <fog_fragment>'),
  }, o.mat || {}));
}

// helpers shared by the scenes (from protones)
const texNoise = (key, base, cols, n = 9000, w = 256) => g3Tex((x) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 30; k++) blot(x, R.r(0, w), R.r(0, w), R.r(10, 50), R.pick(cols)); speck(x, w, w, n, cols, R, 1, 2); }, w, w);
const plane = (st, w, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat); m.position.set(x, y, z); m.receiveShadow = true; st.scene.add(m); return m; };
const box = (par, w, h, d, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; (par.scene || par).add(m); return m; };
const cyl = (par, r0, r1, h, mat, x, y, z, seg = 16) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; (par.scene || par).add(m); return m; };
function lumpyGeo(detail, amp, seed) { const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, R = RNG('lump' + seed), K = [];
  for (let k = 0; k < 7; k++) K.push([new THREE.Vector3(R.n(1), R.n(1), R.n(1)).normalize(), R.r(0.4, 1)]);
  for (let i = 0; i < p.count; i++) { _v.fromBufferAttribute(p, i).normalize(); let d = 1; K.forEach(([c, a]) => (d += amp * a * Math.max(0, _v.dot(c)) ** 3)); d += amp * 0.25 * Math.sin(_v.x * 9 + seed) * Math.sin(_v.y * 8) * Math.sin(_v.z * 7 + seed); p.setXYZ(i, _v.x * d, _v.y * d * 0.85, _v.z * d); }
  g.computeVertexNormals(); return g; }
const leafTex = (key, base) => g3Tex((x, w) => { const R = RNG(key); x.fillStyle = base; x.fillRect(0, 0, w, w); for (let k = 0; k < 1400; k++) { const l = R.r(-40, 40); x.fillStyle = `hsl(${R.r(85, 120)}, ${R.r(35, 60)}%, ${R.r(16, 42) + l * 0.1}%)`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(2, 6), R.r(1, 3), R.r(0, TAU), 0, TAU); x.fill(); } }, 256, 256);
function windowsMat(col) { const m = STDm({ color: col, roughness: 0.75 });
  m.onBeforeCompile = (sh) => { sh.vertexShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n { mat4 IM4 = modelMatrix; \n#ifdef USE_INSTANCING\n IM4 = modelMatrix * instanceMatrix;\n#endif\n vWp = (IM4 * vec4(transformed, 1.0)).xyz; vWn = normalize(mat3(IM4) * objectNormal); }');
    sh.fragmentShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      if (abs(vWn.y) < 0.5) { float u = abs(vWn.x) > 0.5 ? vWp.z : vWp.x; vec2 c = vec2(floor(u / 3.2), floor(vWp.y / 3.6)); float h = fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453);
        float wx = fract(u / 3.2), wy = fract(vWp.y / 3.6), win = step(0.2, wx) * step(wx, 0.8) * step(0.22, wy) * step(wy, 0.82) * step(5.0, vWp.y), fade = smoothstep(1800.0, 500.0, length(vWp - cameraPosition));
        diffuseColor.rgb = mix(diffuseColor.rgb, mix(diffuseColor.rgb * 0.55, vec3(0.12, 0.16, 0.22) + 0.12 * h, 0.5 + 0.5 * fade), win * (0.35 + 0.6 * fade)); }
      else diffuseColor.rgb *= 0.7;`); }; return m; }

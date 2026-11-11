// =====================================================================
//  styles/cartoon3d/setlook.js — OPT-IN "realistic set" upgrade (2026-11-10, pieces/lost-luggage). Characters stay toon;
//  only the ENVIRONMENT changes, measured against the 3 Ricks docs shorts (refs-ext/ricks-docs-cam): his sets carry NO ink
//  outline, surfaces have texture (wood grain, block mortar, ballast, worn paint), light falls off (window patches,
//  practical lamps, light shafts, gradients up the walls), distance hazes, and the grade has a fuller tonal range.
//  Add "styles/cartoon3d/setlook.js" to a piece's build list after kit/toon files; then, at the END of a set's build:
//    c3SetLook(scene, { grime: 1, scale: 0.5, floorY: 0, inkBG: false, lights: [[x, y, z, '#ffd8a0', I, dist], ...],
//                       bounce: ['#ffe6c8', '#6a4a3a', 0.25], shafts: [[[x,y,z], [x,y,z], r0, r1, '#fff0d0', 0.12], ...] })
//  and in shots.js set `C3_INK2 = Object.assign({}, C3_INK2_DEF, { bg: false, px: 2.6 })` (kit: bg:false skips the
//  background-layer ink pass — the set — and keeps the subject layer's).
//  What it does to every lit MeshStandardMaterial of the set (shared patch, one program):
//   - world-space value-noise detail (no UVs needed): large mottling, fine grain, vertical grime streaks on walls,
//     contact grime at wall feet, scuffs on floors; roughness varies with the same noise (patchy specular);
//   - inkSet:false hides every hull ink of the set and flags its meshes inkOcc (kit: no screen-space ink, still an
//     occluder for the characters' ink) — Ricks' sets have no outlines; lightFlat (default on) turns unlit c3Flat
//     surfaces into lit ones (map kept as a 0.2 emission so in-world text stays legible).
// =====================================================================
const C3SL_CONV = new Map();
const C3SL_U = { c3Gr: { value: 1 }, c3Sc: { value: 0.5 }, c3Fl: { value: 0 }, c3Gh: { value: 3.0 },
  // world-space colour fades (color.js c3ColorWorld; white = off): walls top/bottom over y, floors near/far from a point, ceilings
  c3WT: { value: new THREE.Vector3(1, 1, 1) }, c3WB: { value: new THREE.Vector3(1, 1, 1) }, c3WY: { value: new THREE.Vector2(0, 30) }, c3CE: { value: new THREE.Vector3(1, 1, 1) },
  c3FN: { value: new THREE.Vector3(1, 1, 1) }, c3FF: { value: new THREE.Vector3(1, 1, 1) }, c3FC: { value: new THREE.Vector2(0, 0) }, c3FR: { value: new THREE.Vector2(10, 80) } };
const C3SL_GLSL = [
  'varying vec3 vC3W; varying vec3 vC3N; uniform float c3Gr, c3Sc, c3Fl, c3Gh, c3Mk; uniform vec3 c3WT, c3WB, c3CE, c3FN, c3FF; uniform vec2 c3WY, c3FC, c3FR;',
  'float c3h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }',
  'float c3n(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);',
  '  return mix(mix(mix(c3h(i), c3h(i + vec3(1,0,0)), f.x), mix(c3h(i + vec3(0,1,0)), c3h(i + vec3(1,1,0)), f.x), f.y),',
  '             mix(mix(c3h(i + vec3(0,0,1)), c3h(i + vec3(1,0,1)), f.x), mix(c3h(i + vec3(0,1,1)), c3h(i + vec3(1,1,1)), f.x), f.y), f.z); }',
  'float c3f(vec3 p){ return 0.5 * c3n(p) + 0.25 * c3n(p * 2.03) + 0.125 * c3n(p * 4.01) + 0.0625 * c3n(p * 8.03); }',
].join('\n');
function c3SetLookMat(mat, k) {
  if (!mat || !mat.isMeshStandardMaterial || mat.transparent || mat.userData.c3sl) return;
  mat.userData.c3sl = true; const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r);
    Object.assign(sh.uniforms, C3SL_U, { c3Mk: { value: k } });
    sh.vertexShader = 'varying vec3 vC3W; varying vec3 vC3N;\n' + sh.vertexShader
      .replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n vC3N = normalize(mat3(modelMatrix) * objectNormal);')
      .replace('#include <project_vertex>', '#include <project_vertex>\n vC3W = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = C3SL_GLSL + '\n' + sh.fragmentShader
      .replace('#include <map_fragment>', ['#include <map_fragment>',
        '{ vec3 P = vC3W * c3Sc; float up = abs(vC3N.y), g = c3Gr * c3Mk;',
        '  float big = c3f(P * 0.18), fine = c3n(P * 2.2), streak = c3f(vec3(P.x * 1.1, P.y * 0.1, P.z * 1.1));',
        '  float k = 1.0 + (big - 0.5) * 0.36 * g + (fine - 0.5) * 0.1 * g;',
        '  k -= (1.0 - up) * smoothstep(0.5, 0.82, streak) * 0.18 * g;',
        '  k -= (1.0 - up) * (1.0 - smoothstep(0.0, c3Gh, vC3W.y - c3Fl)) * 0.3 * g;',
        '  if (up > 0.7) k -= smoothstep(0.58, 0.9, c3f(P * 0.7 + 3.1)) * 0.15 * g;',
        '  diffuseColor.rgb *= clamp(k, 0.45, 1.25);',
        '  vec3 gc = vC3N.y > 0.7 ? mix(c3FN, c3FF, smoothstep(c3FR.x, c3FR.y, distance(vC3W.xz, c3FC))) : vC3N.y < -0.7 ? c3CE : mix(c3WB, c3WT, smoothstep(c3WY.x, c3WY.y, vC3W.y));',
        '  diffuseColor.rgb *= mix(vec3(1.0), gc, c3Mk); }'].join('\n'))
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = clamp(roughnessFactor + (c3f(vC3W * c3Sc * 0.9 + 7.0) - 0.5) * 0.4 * c3Gr * c3Mk, 0.06, 1.0);');
  };
  const key0 = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : () => '';
  mat.customProgramCacheKey = () => key0() + '|c3sl' + k; mat.needsUpdate = true;
}
// a soft volumetric light shaft: an additive open cone fading along its length and toward its rim
function c3Shaft(scene, a, b, r0, r1, color = '#fff0d0', op = 0.12) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), L = A.distanceTo(B);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, L, 24, 1, true), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { col: { value: new THREE.Color(color) }, op: { value: op } },
    vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform vec3 col; uniform float op; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float rim = pow(abs(dot(normalize(vN), normalize(vV))), 1.6); float f = smoothstep(0.0, 0.25, vUv.y) * (0.35 + 0.65 * vUv.y); gl_FragColor = vec4(col * op * rim * f, 1.0); }' }));
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), A.clone().sub(B).normalize());
  m.userData.noInk2 = m.userData.noCast = m.userData.noShade = true; m.renderOrder = 8; scene.add(m); return m;
}
function c3SetLook(scene, o = {}) {
  C3SL_U.c3Gr.value = o.grime ?? 1; C3SL_U.c3Sc.value = o.scale ?? 0.5; C3SL_U.c3Fl.value = o.floorY ?? 0; C3SL_U.c3Gh.value = o.grimeH ?? 3.0;
  scene.updateMatrixWorld(true);
  scene.traverse((m) => {
    if (!m.isMesh) return;
    let p = m; while (p) { if (p.userData.person) return; p = p.parent; }
    if (m.userData.hull) { if (o.inkSet === false || (o.inkBG === false && m.layers.mask === 1)) m.visible = false; return; }   // Ricks' sets carry no hull ink
    if (o.inkSet === false) m.userData.inkOcc = true;   // no screen-space ink either (kit C3E.occ), but it still hides the ink behind it
    const focus = (m.layers.mask & 2) !== 0;
    // unlit flat surfaces (c3Flat walls, floors, posters) become lit, so they take the room light, falloff and shadows;
    // a little of their own map stays as emission so printed text keeps reading in the shade. Glowing signs stay unlit.
    if (o.lightFlat !== false) { const conv = (mt) => { if (!mt || !mt.isMeshBasicMaterial || mt.transparent || mt.userData.glow || mt.userData.c3keep) return mt;
        C3SL_CONV.has(mt) || C3SL_CONV.set(mt, (() => { const n = new THREE.MeshStandardMaterial({ color: mt.color, map: mt.map, roughness: 0.82, metalness: 0, vertexColors: mt.vertexColors, side: mt.side });
          if (mt.map) { n.emissive = new THREE.Color('#ffffff'); n.emissiveMap = mt.map; n.emissiveIntensity = o.flatEmit ?? 0.2; } n.userData = Object.assign({}, mt.userData); return n; })());
        return C3SL_CONV.get(mt); };
      m.material = Array.isArray(m.material) ? m.material.map(conv) : conv(m.material); }
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    mats.forEach((mt) => c3SetLookMat(mt, focus ? (o.focusK ?? 0.55) : 1));
  });
  for (const [x, y, z, c, I, d] of o.lights || []) { const l = new THREE.PointLight(c, I, d ?? 60, 2); l.position.set(x, y, z); l.layers.enableAll(); scene.add(l); }
  if (o.bounce) { const [sky, gnd, I] = o.bounce, h = new THREE.HemisphereLight(sky, gnd, I); h.layers.enableAll(); scene.add(h); }
  for (const s of o.shafts || []) c3Layer(c3Shaft(scene, ...s), C3.L_BG);
  return scene;
}

// ---- screen-space ambient occlusion on the SET (background layer), opt-in: C3_AO = { r: world radius, k: strength,
// bias, blur }. The set is redrawn as view-normal + linear depth (kit c3EdgeMats), occlusion is estimated from depth
// samples in a disc, and the result is multiplied over the background before the characters are drawn (so faces never
// darken). kit c3Render calls c3AOPass when C3_AO is set.
let C3_AO = null;
const C3AO = {};
function c3AOPass(scene, cam, blurPx) {
  const { r, cv } = c3Renderer(), E = c3EdgeMats(), K = C3_AO, swap = [];
  if (!C3AO.mat) {
    C3AO.scene = new THREE.Scene(); C3AO.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    C3AO.mat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false,
      uniforms: { tex: { value: E.rt.texture }, px: { value: new THREE.Vector2(1 / W, 1 / H) }, far: { value: 300 }, rad: { value: 2 }, k: { value: 1 }, bias: { value: 0.05 }, proj: { value: 1 }, tanH: { value: new THREE.Vector2(1, 1) } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: [
        'uniform sampler2D tex; uniform vec2 px; uniform float far, rad, k, bias, proj; uniform vec2 tanH; varying vec2 vUv;',
        'float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }',
        'vec3 vpos(vec2 uv, float a){ float d = a * far; return vec3((uv * 2.0 - 1.0) * tanH * d, -d); }',
        'void main(){ vec4 c = texture2D(tex, vUv); if (c.a <= 0.0) { gl_FragColor = vec4(1.0); return; }',
        '  vec3 P = vpos(vUv, c.a), N = normalize(c.rgb * 2.0 - 1.0); float d = -P.z;',
        '  float rp = clamp(rad * proj / d, 3.0, 120.0); float occ = 0.0; float a0 = hash(vUv * 731.0) * 6.2831;',
        '  for (int i = 0; i < 16; i++) { float fi = float(i); float a = a0 + fi * 2.3999; float rr = rp * sqrt((fi + 0.5) / 16.0);',
        '    vec2 su = vUv + vec2(cos(a), sin(a)) * rr * px; vec4 s = texture2D(tex, su); if (s.a <= 0.0) continue;',
        '    vec3 v = vpos(su, s.a) - P; float vv = dot(v, v); float nd = dot(N, v) / sqrt(vv + 1e-4);',
        '    occ += max(0.0, nd - bias) * (1.0 - smoothstep(rad * rad * 0.5, rad * rad * 2.0, vv)); }',
        '  float ao = 1.0 - k * occ / 16.0; gl_FragColor = vec4(vec3(clamp(ao, 0.4, 1.0)), 1.0); }'].join('\n') });
    C3AO.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), C3AO.mat));
  }
  scene.traverse((m) => { if (!m.isMesh || !m.visible) return; const mat = m.material; swap.push([m, mat]);
    if (m.userData.hull || m.userData.noInk2 || (mat && (mat.transparent || mat.side === THREE.BackSide)) || (mat && mat.isShaderMaterial) || (mat && mat.isMeshBasicMaterial && mat.userData.glow)) { m.visible = false; return; }
    m.material = E.solid; E.solid.uniforms.far.value = cam.far; });
  const bg = scene.background; scene.background = null; const keep = cam.layers.mask; cam.layers.set(C3.L_BG);
  r.setRenderTarget(E.rt); r.setClearColor(0x000000, 0); r.clear(); r.render(scene, cam); r.setRenderTarget(null);
  scene.background = bg; cam.layers.mask = keep; swap.forEach(([m, mat]) => { m.material = mat; m.visible = true; });
  const U = C3AO.mat.uniforms; U.far.value = cam.far; U.rad.value = K.r ?? 2.2; U.k.value = K.k ?? 1.1; U.bias.value = K.bias ?? 0.06; U.proj.value = H / (2 * Math.tan(cam.fov * Math.PI / 360)); { const ty = Math.tan(cam.fov * Math.PI / 360); U.tanH.value.set(ty * cam.aspect, ty); }
  const tm = r.toneMapping; r.toneMapping = THREE.NoToneMapping; r.setClearColor(0xffffff, 1); r.clear(); r.render(C3AO.scene, C3AO.cam); r.toneMapping = tm;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'multiply'; ctx.filter = `blur(${((K.blur ?? 2.5) + blurPx).toFixed(2)}px)`; ctx.drawImage(cv, 0, 0, W, H); ctx.restore();
}

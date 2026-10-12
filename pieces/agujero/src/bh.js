
// =====================================================================
//  BLACK HOLE — ray-traced per pixel into a half-resolution target, composited right after the sky dome.
//  Units: Rs = 1. Each ray bends with the Schwarzschild photon equation a = -1.5 h^2 r / |r|^5 (h = |r x v|);
//  r < 1 is captured (the shadow). Crossing the disk plane (r 2.6..16) adds the disk's light: hotter inside,
//  turbulent streaks that orbit (Keplerian), Doppler-beamed on the approaching side. Rays that escape show the SKY
//  (the same skyColor() as the dome, stars included) along their bent direction, so the hole visibly distorts the sky
//  round itself: an Einstein ring, stars smeared into arcs. That lens region fades out by impact parameter ~36 Rs.
//  The disk is tone-mapped here (ACES, like the renderer); the sky part stays untone-mapped, like the dome.
// =====================================================================
const BH_RES = 0.5;
let GB = null;
function gB() {
  if (GB) return GB;
  const g = g3(), rt = new THREE.WebGLRenderTarget(Math.round(W * BH_RES), Math.round(H * BH_RES), { type: THREE.HalfFloatType, depthBuffer: false });
  const U = Object.assign({ uInvP: { value: new THREE.Matrix4() }, uCamW: { value: new THREE.Matrix4() }, uBh: { value: new THREE.Vector3() }, uDist: { value: 1000 },
    uDiskN: { value: new THREE.Vector3(0, 1, 0) }, uDiskX: { value: new THREE.Vector3(1, 0, 0) }, uDisk: { value: 0 }, uT: { value: 0 }, uHot: { value: 1 }, uLens: { value: 1 } }, g.skyU);
  const mat = new THREE.ShaderMaterial({ uniforms: U, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vNdc; void main(){ vNdc = position.xy; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `precision highp float; ${SKY_GLSL}
      uniform mat4 uInvP, uCamW; uniform vec3 uBh, uDiskN, uDiskX; uniform float uDist, uDisk, uT, uHot, uLens; varying vec2 vNdc;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
      vec3 bhRRT(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
      vec3 aces(vec3 c){ const mat3 I = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
        const mat3 O = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602)); c *= 1.0 / 0.6; c = I * c; c = bhRRT(c); c = O * c; return clamp(c, 0.0, 1.0); }
      vec3 diskCol(vec3 p, vec3 v){
        float r = length(p); if (r < 2.6 || r > 16.0) return vec3(0.0);
        vec3 ex = uDiskX, ey = cross(uDiskN, uDiskX); float a = atan(dot(p, ey), dot(p, ex));
        float om = 1.6 * pow(r, -1.5), ang = a + uT * om;
        float streak = 0.55 + 0.45 * noise(vec2(ang * 6.0, r * 1.7)) * noise(vec2(ang * 17.0 + 3.0, r * 4.3));
        float ring = 0.75 + 0.25 * sin(r * 5.3 + noise(vec2(ang * 3.0, r)) * 3.0);
        float temp = pow(2.6 / r, 1.25) * smoothstep(16.0, 9.0, r) * smoothstep(2.55, 3.1, r);
        vec3 tang = normalize(cross(uDiskN, p)); float vel = 0.55 * sqrt(1.0 / max(r - 1.0, 0.3));
        float dop = 1.0 / (1.0 - vel * dot(tang, -normalize(v)));
        float beam = pow(dop, 3.0) * sqrt(max(0.0, 1.0 - 1.0 / r));
        vec3 c = mix(vec3(1.0, 0.45, 0.12), vec3(1.0, 0.86, 0.6), clamp(temp * 1.2, 0.0, 1.0)); c = mix(c, vec3(0.85, 0.9, 1.0), clamp((dop - 1.2) * 1.5, 0.0, 0.6));
        return c * temp * streak * ring * beam * 11.0 * uHot;
      }
      void main(){
        vec4 vp = uInvP * vec4(vNdc, 1.0, 1.0); vec3 dir = normalize((uCamW * vec4(normalize(vp.xyz / vp.w), 0.0)).xyz);
        vec3 bhd = normalize(uBh), o = -bhd * uDist; float tc = dot(-o, dir); vec3 pc = o + dir * tc; float bimp = length(pc);
        if (bimp > 37.0 || tc < 0.0) { gl_FragColor = vec4(0.0); return; }
        float back = sqrt(max(0.0, 40.0 * 40.0 - bimp * bimp)); vec3 p = o + dir * max(0.0, tc - back), v = dir;
        vec3 h3 = cross(p, v); float h2 = dot(h3, h3);
        vec3 emit = vec3(0.0); float aD = 0.0, rmin = 1e9; bool cap = false; float sPrev = dot(p, uDiskN);
        for (int i = 0; i < 170; i++) {
          float r = length(p); rmin = min(rmin, r);
          if (r < 1.0) { cap = true; break; }
          if (r > 42.0 && dot(p, v) > 0.0) break;
          float dt = clamp(0.06 * r, 0.02, 1.6);
          vec3 acc = -1.5 * h2 * p / pow(r, 5.0);
          vec3 pn = p + v * dt + 0.5 * acc * dt * dt; v = normalize(v + acc * dt);
          float sN = dot(pn, uDiskN);
          if (sN * sPrev < 0.0 && uDisk > 0.0) { float f = sPrev / (sPrev - sN); vec3 x = mix(p, pn, f); vec3 e = diskCol(x, v) * uDisk;
            float a = clamp(length(e) * 1.4, 0.0, 0.97); emit += e * (1.0 - aD); aD += a * (1.0 - aD); }
          sPrev = sN; p = pn;
          if (aD > 0.99) break;
        }
        vec3 disk = aces(emit);                                   // tone-mapped disk light (premultiplied by its coverage)
        if (cap) { gl_FragColor = vec4(disk, 1.0); return; }      // the shadow: pure black behind the disk
        // escaped: the bent sky; a photon ring where rays skimmed r ~ 1.5
        float pr = exp(-pow((rmin - 1.55) / 0.12, 2.0));
        vec3 sky = skyColor(normalize(v)) + vec3(1.0, 0.85, 0.65) * pr * (0.25 + 1.2 * uDisk);
        float aL = (1.0 - smoothstep(24.0, 36.0, bimp)) * uLens;   // the lens region fades into the real sky
        gl_FragColor = vec4(disk + (1.0 - aD) * sky * aL, aD + (1.0 - aD) * aL);
      }` });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat), bhScene = new THREE.Scene(), bhCam = new THREE.Camera(); quad.frustumCulled = false; bhScene.add(quad);
  // the composite: premultiplied, no tone mapping (already done), drawn right after the sky dome
  const comp = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: { uTex: { value: rt.texture } }, transparent: false, premultipliedAlpha: true, depthTest: false, depthWrite: false, toneMapped: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D uTex; varying vec2 vUv; void main(){ vec4 c = texture2D(uTex, vUv); float a = max(c.a, 1e-4); vec3 s = LinearTosRGB(vec4(c.rgb / a, 1.0)).rgb; gl_FragColor = vec4(s * c.a, c.a); }' }));
  comp.material.blending = THREE.CustomBlending; comp.material.blendSrc = THREE.OneFactor; comp.material.blendDst = THREE.OneMinusSrcAlphaFactor;
  comp.frustumCulled = false; comp.renderOrder = -2; g.scene.add(comp);
  GB = { rt, U, bhScene, bhCam, comp };
  return GB;
}
function renderHole(t) {
  const g = g3(), B = gB(), U = B.U, rA = bhR(t);
  g.cam.updateMatrixWorld(); g.cam.updateProjectionMatrix();
  U.uInvP.value.copy(g.cam.projectionMatrixInverse); U.uCamW.value.copy(g.cam.matrixWorld);
  U.uBh.value.copy(dirV(BH_AZ, bhEl(t))); U.uDist.value = 2.6 / Math.sin(rA);   // the shadow (b = 2.6 Rs) subtends rA
  const tilt = 9 * DEG, nD = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt)).applyAxisAngle(new THREE.Vector3(0, 0, 1), -14 * DEG).normalize();
  U.uDiskN.value.copy(nD); U.uDiskX.value.copy(new THREE.Vector3(1, 0, 0).projectOnPlane(nD).normalize());
  U.uDisk.value = diskOn(t); U.uT.value = t * 2.5; U.uHot.value = 1 + 0.6 * ss(43, 58, t); U.uLens.value = 1;
  const prev = g.r.getRenderTarget(); g.r.setRenderTarget(B.rt); g.r.setClearColor(0x000000, 0); g.r.clear(); g.r.render(B.bhScene, B.bhCam); g.r.setRenderTarget(prev);
}

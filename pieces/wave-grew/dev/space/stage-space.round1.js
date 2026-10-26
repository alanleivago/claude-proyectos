// =====================================================================
//  STAGE SPACE — story time 290..510 s: the planet below, the ring wave around it, the oceans drain,
//  the stone in the bowl, the Moon, the hit, the barrel.
//  Earth-centred world: the Earth's centre is at (0, -R, 0) (camera-relative sea point). The wave is a ring of
//  water around the axis through the Earth's centre along Z (a great circle through the point under you);
//  its cross-section is the lead's flat profile bent onto the sphere (compressed when H grows past R).
//  Every texture is generated once on the GPU (equirect maps: Earth data, clouds, the Moon).
//  All top-level names start with `sp`.
// =====================================================================
let spG = null;
const sp_RM = 1737400, sp_GEO = 42164000;
// camera: the lead's rideCam plus my own yaw/pitch knots for this stage (blended in from 290)
const sp_YAW = [[290, -40], [299, -45], [310, -62], [321, -60], [332, -58], [345, -50], [358, -42], [370, -38], [380, -40], [405, -40], [424, -36], [434, -26], [445, -20], [455, -18], [468, -17], [480, -15], [510, -15]];
const sp_PITCH = [[290, -34], [299, -30], [310, -33], [321, -40], [332, -45], [345, -50], [358, -55], [370, -60], [380, -62], [405, -64], [422, -63], [426, -60], [434, -36], [445, -14], [455, -3], [468, 5], [480, 9], [510, 11]];
const sp_GLSL_NOISE = `
  float spH(vec3 p){ p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float spN(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(spH(i), spH(i + vec3(1,0,0)), f.x), mix(spH(i + vec3(0,1,0)), spH(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(spH(i + vec3(0,0,1)), spH(i + vec3(1,0,1)), f.x), mix(spH(i + vec3(0,1,1)), spH(i + vec3(1,1,1)), f.x), f.y), f.z); }
  float spF(vec3 p, int o){ float s = 0.0, a = 0.5; for (int i = 0; i < 8; i++){ if (i >= o) break; s += a * spN(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s / (1.0 - pow(0.5, float(o))); }
  float spRid(vec3 p){ return 1.0 - abs(2.0 * spN(p) - 1.0); }
  float spH2(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }   // stable for large arguments (time grows to 500)
  float spN2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(spH2(i), spH2(i + vec2(1, 0)), f.x), mix(spH2(i + vec2(0, 1)), spH2(i + vec2(1, 1)), f.x), f.y); }
  float spF2(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * spN2(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
  vec2 spUV(vec3 n){ return vec2(atan(n.x, n.z) * 0.15915494 + 0.5, asin(clamp(n.y, -1.0, 1.0)) * 0.31830989 + 0.5); }
  // equirect lookup without the seam: derivatives from whichever u-wrap is continuous here
  void spGrad(vec2 uv, out vec2 dx, out vec2 dy){ vec2 u2 = vec2(fract(uv.x + 0.5), uv.y); dx = dFdx(uv); dy = dFdy(uv);
    vec2 dx2 = dFdx(u2), dy2 = dFdy(u2); if (dot(dx2, dx2) + dot(dy2, dy2) < dot(dx, dx) + dot(dy, dy)) { dx = dx2; dy = dy2; } }
`;
// equirect generator pass: vUv -> unit direction n (Y = north)
const sp_GEN_HEAD = `
  varying vec2 vUv; ${sp_GLSL_NOISE}
  vec3 spDir(){ float lon = (vUv.x - 0.5) * 6.2831853, lat = (vUv.y - 0.5) * 3.1415927; return vec3(cos(lat) * sin(lon), sin(lat), cos(lat) * cos(lon)); }
`;
function spGen(g, w, h, frag, uniforms = {}, half = true) {
  const rt = new THREE.WebGLRenderTarget(w, h, { type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true, wrapS: THREE.RepeatWrapping, wrapT: THREE.ClampToEdgeWrapping, depthBuffer: false });
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }', fragmentShader: sp_GEN_HEAD + frag }));
  m.frustumCulled = false; sc.add(m);
  const prev = g.r.getRenderTarget(); g.r.setRenderTarget(rt); g.r.clear(); g.r.render(sc, cam); g.r.setRenderTarget(prev);
  m.geometry.dispose(); m.material.dispose();
  return rt.texture;
}
// ---- the Earth's data map: R elevation (normalised -11..+6 km), G moisture, B city lights, A ice/latitude temperature
const sp_EARTH_GEN = `
  void main(){
    vec3 n = spDir(); float lat = asin(n.y);
    vec3 q = n * 1.25 + vec3(4.1, 0.0, 2.3);
    vec3 w = vec3(spF(q * 1.9 + 3.1, 4), spF(q * 1.9 + 7.7, 4), spF(q * 1.9 + 1.3, 4)) - 0.5;
    float c = spF(q + w * 1.1, 7);
    float land = c - 0.485;
    // mountains: ridged belts along the continents' edges and old ranges inland
    float belt = smoothstep(0.55, 0.78, spF(n * 2.2 + w * 1.5 + 11.0, 3));
    float rid = pow(spRid(n * 7.0 + w * 2.0), 3.0) * 0.6 + pow(spRid(n * 16.0 + w * 3.0), 3.0) * 0.4;
    float e;
    if (land > 0.0) {
      e = 40.0 + land * 2600.0 + rid * belt * 4200.0 * smoothstep(0.0, 0.05, land) + (spF(n * 30.0, 3) - 0.5) * 300.0;
    } else {
      float d = -land;                                     // distance from the coast in noise units
      float shelf = -60.0 - 160.0 * smoothstep(0.0, 0.02, d);
      float abyss = -4300.0 - 900.0 * spF(n * 5.0 + 3.0, 4);
      e = mix(shelf, abyss, smoothstep(0.015, 0.06, d));
      // mid-ocean ridges far from land, with fracture-zone jitter
      vec3 rq = n * 2.1 + w * 0.6 + vec3(0.0, 0.0, 5.0);
      float mor = pow(spRid(rq + 0.05 * vec3(spN(n * 40.0), spN(n * 40.0 + 3.0), 0.0)), 7.0);
      e += mor * 2600.0 * smoothstep(0.06, 0.14, d);
      e += pow(spRid(n * 11.0 + w), 6.0) * 700.0 * smoothstep(0.05, 0.12, d);   // seamount chains
      // trenches hugging some coasts
      float tr = smoothstep(0.55, 0.75, spF(n * 3.0 + 9.0, 3)) * exp(-pow((d - 0.045) / 0.012, 2.0));
      e -= tr * 5200.0;
      e += (spF(n * 40.0, 3) - 0.5) * 250.0;
    }
    float moist = spF(n * 2.6 + 20.0, 4) + 0.22 * exp(-pow(lat / 0.22, 2.0)) - 0.32 * exp(-pow((abs(lat) - 0.45) / 0.16, 2.0)) + 0.1 * smoothstep(-0.05, -0.0, -land);
    float city = 0.0;
    if (land > 0.0) {
      float near = exp(-land / 0.035);                         // coasts
      city = smoothstep(0.68, 0.9, spN(n * 140.0)) * 0.7 + smoothstep(0.86, 0.97, spN(n * 420.0)) * 0.5;
      city *= smoothstep(0.5, 0.75, spF(n * 6.0 + 5.0, 3) + near * 0.3) * smoothstep(0.32, 0.5, moist) * (1.0 - smoothstep(0.95, 1.15, abs(lat)));
    }
    gl_FragColor = vec4((e + 11000.0) / 17000.0, clamp(moist, 0.0, 1.0), clamp(city, 0.0, 1.0), 1.0);
  }`;
// ---- clouds: swirled fbm in latitude bands, cyclones as local twists
const sp_CLOUD_GEN = `
  uniform vec4 uCyc[10];
  vec3 spRot(vec3 p, vec3 a, float t){ return p * cos(t) + cross(a, p) * sin(t) + a * dot(a, p) * (1.0 - cos(t)); }
  void main(){
    vec3 n = spDir(), p = n; float lat = asin(n.y);
    for (int i = 0; i < 10; i++){ vec3 c = normalize(uCyc[i].xyz); float r = uCyc[i].w; float d = acos(clamp(dot(p, c), -1.0, 1.0));
      if (d < r){ float a = 1.0 - d / r; p = spRot(p, c, a * a * 6.5 * sign(c.y + 0.0001)); } }
    // zonal shear: streaks along latitude
    vec3 s = vec3(p.x, p.y * 2.2, p.z);
    vec3 w = vec3(spF(s * 3.0 + 1.0, 4), spF(s * 3.0 + 5.0, 4), spF(s * 3.0 + 9.0, 4)) - 0.5;
    float cl = spF(s * 4.0 + w * 1.6, 7);
    float band = 0.16 * exp(-pow(lat / 0.12, 2.0)) + 0.12 * exp(-pow((abs(lat) - 0.95) / 0.22, 2.0)) - 0.14 * exp(-pow((abs(lat) - 0.42) / 0.15, 2.0));
    float d = smoothstep(0.53, 0.76, cl + band);
    float fine = spF(p * 26.0 + w * 3.0, 4);
    d *= 0.55 + 0.6 * fine;
    gl_FragColor = vec4(clamp(d, 0.0, 1.0), fine, 0.0, 1.0);
  }`;
// ---- the Moon: R albedo, G height
const sp_MOON_GEN = `
  vec3 spCell(vec3 p){ return vec3(spH(p), spH(p + 13.7), spH(p + 27.1)); }
  float spCrater(vec3 p, out float rim){
    vec3 i = floor(p), f = fract(p); float h = 0.0; rim = 0.0;
    for (int x = -1; x <= 1; x++) for (int y = -1; y <= 1; y++) for (int z = -1; z <= 1; z++){
      vec3 o = vec3(float(x), float(y), float(z)); vec3 c = spCell(i + o); if (c.z > 0.55) continue;
      float r = 0.18 + 0.32 * spH(i + o + 5.3); float d = length(o + c - f) / r;
      if (d < 1.4){ float bowl = d < 1.0 ? (d * d - 1.0) : 0.0; float rr = exp(-pow((d - 1.0) / 0.16, 2.0)); h += bowl * 0.8 + rr * 0.35 + (d < 1.0 ? 0.0 : 0.15 * exp(-(d - 1.0) * 6.0)); rim = max(rim, rr); }
    }
    return h; }
  void main(){
    vec3 n = spDir();
    float mar = smoothstep(0.5, 0.62, spF(n * 1.6 + vec3(2.0, 1.0, 0.0), 5) + 0.12 * n.z);
    float alb = mix(0.62, 0.34, mar) + (spF(n * 18.0, 4) - 0.5) * 0.12;
    float h = (spF(n * 9.0, 5) - 0.5) * 0.4 * (1.0 - mar), rim;
    float sc = 4.0, amp = 1.0;
    for (int k = 0; k < 5; k++){ float c = spCrater(n * sc + float(k) * 3.7, rim); h += c * amp * 0.35; alb += rim * 0.05 * amp; sc *= 2.15; amp *= 0.55; }
    // two young rayed craters
    for (int k = 0; k < 2; k++){ vec3 c = normalize(k == 0 ? vec3(0.25, -0.55, 0.8) : vec3(-0.5, 0.35, 0.78)); float d = acos(clamp(dot(n, c), -1.0, 1.0));
      vec3 t = normalize(cross(c, vec3(0.0, 1.0, 0.0))); float ang = atan(dot(n, cross(c, t)), dot(n, t));
      float ray = smoothstep(0.55, 1.0, spN(vec3(ang * 9.0, 0.0, float(k) * 7.0))) * exp(-d * 3.0) * smoothstep(0.03, 0.06, d);
      alb += ray * 0.22 + exp(-pow(d / 0.03, 2.0)) * 0.2; }
    gl_FragColor = vec4(clamp(alb, 0.0, 1.0), h, 0.0, 1.0);
  }`;

function spBuild(g) {
  const S = {};
  S.scene = new THREE.Scene(); S.sky = new THREE.Scene();
  S.skyCam = new THREE.PerspectiveCamera(52, W / H, 0.1, 100); S.skyCam.rotation.order = 'YXZ';
  const R = R_EARTH;
  // ---------------- textures
  const RC = RNG('sp-cyc'), cyc = new Float32Array(40);
  for (let i = 0; i < 10; i++) { const lat = (RC.f() < 0.5 ? -1 : 1) * RC.r(0.25, 1.05), lon = RC.r(-Math.PI, Math.PI); cyc.set([Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon), RC.r(0.12, 0.3)], i * 4); }
  S.texA = spGen(g, 4096, 2048, sp_EARTH_GEN);
  S.texC = spGen(g, 4096, 2048, sp_CLOUD_GEN, { uCyc: { value: cyc } }, false);
  S.texM = spGen(g, 2048, 1024, sp_MOON_GEN);
  // ---------------- the sky: stars, the Milky Way, the Sun (own pass, camera at the origin)
  const RS = RNG('sp-stars'), NST = 9000, sp = new Float32Array(NST * 3), sa = new Float32Array(NST * 4);
  const mwN = new THREE.Vector3(0.3, 0.55, -0.78).normalize();   // the galactic plane's normal
  for (let i = 0; i < NST; i++) {
    let v; for (;;) { v = new THREE.Vector3(RS.n(1), RS.n(1), RS.n(1)); if (v.lengthSq() > 1 || v.lengthSq() < 1e-4) continue; v.normalize();
      if (RS.f() < 0.55 || RS.f() < Math.exp(-Math.pow(v.dot(mwN) / 0.18, 2))) break; }
    sp.set([v.x * 50, v.y * 50, v.z * 50], i * 3);
    const m = Math.pow(RS.f(), 5.5), tK = RS.f();   // brightness (few bright), colour temperature
    sa.set([0.6 + m * 3.8, 0.25 + m * 2.2, tK, RS.f()], i * 4);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('aS', new THREE.BufferAttribute(sa, 4));
  S.starsU = { uA: { value: 1 }, uT: TIMEU };
  S.stars = new THREE.Points(sg, new THREE.ShaderMaterial({ uniforms: S.starsU, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 aS; varying vec3 vC; varying float vB; uniform float uT;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        gl_PointSize = aS.x * 1.3; vB = aS.y * (0.85 + 0.15 * sin(uT * (1.0 + aS.w * 3.0) + aS.w * 40.0));
        vC = mix(vec3(1.0, 0.78, 0.6), vec3(0.72, 0.82, 1.0), aS.z); vC = mix(vC, vec3(1.0), 0.45); }`,
    fragmentShader: `varying vec3 vC; varying float vB; uniform float uA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = exp(-r * r * 14.0) + 0.12 * exp(-r * r * 3.0);
        gl_FragColor = vec4(vC * vB * a * uA, 1.0); }` }));
  S.stars.frustumCulled = false; S.sky.add(S.stars);
  // Milky Way: a faint band on a sphere
  S.mwU = { uN: { value: mwN }, uA: { value: 1 } };
  const mw = new THREE.Mesh(new THREE.SphereGeometry(60, 64, 32), new THREE.ShaderMaterial({ uniforms: S.mwU, side: THREE.BackSide, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 uN; uniform float uA; ${sp_GLSL_NOISE}
      void main(){ float b = dot(vD, uN); float band = exp(-b * b / 0.012) * 0.8 + exp(-b * b / 0.06) * 0.35;
        float cl = spF(vD * 5.0, 5), dust = smoothstep(0.45, 0.7, spF(vD * 9.0 + 3.0, 4));
        float l = band * (0.35 + 0.9 * cl) * (1.0 - 0.75 * dust * exp(-b * b / 0.004));
        vec3 c = mix(vec3(0.55, 0.6, 0.85), vec3(1.0, 0.9, 0.78), smoothstep(0.4, 0.8, cl)) * l * 0.075 * uA;
        gl_FragColor = vec4(c, 1.0); }` }));
  mw.frustumCulled = false; S.sky.add(mw);
  // the Sun: core + glow + soft star spikes
  const sunTex = g3Tex((x, w, h) => {
    const cx = w / 2, gr = x.createRadialGradient(cx, cx, 0, cx, cx, cx);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.035, 'rgba(255,253,245,1)'); gr.addColorStop(0.06, 'rgba(255,240,215,0.55)');
    gr.addColorStop(0.2, 'rgba(255,220,180,0.16)'); gr.addColorStop(0.5, 'rgba(255,200,160,0.04)'); gr.addColorStop(1, 'rgba(255,200,160,0)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 6 + 0.2; x.save(); x.translate(cx, cx); x.rotate(a); const g2 = x.createLinearGradient(-cx, 0, cx, 0);
      g2.addColorStop(0, 'rgba(255,240,220,0)'); g2.addColorStop(0.5, `rgba(255,240,220,${k % 2 ? 0.25 : 0.4})`); g2.addColorStop(1, 'rgba(255,240,220,0)'); x.fillStyle = g2; x.fillRect(-cx, -1.2, w, 2.4); x.restore(); }
  }, 512, 512);
  S.sun = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true }));
  S.sun.position.copy(SUN).multiplyScalar(50); S.sun.scale.setScalar(16); S.sky.add(S.sun);

  // ---------------- the Earth
  S.earthU = { uA: { value: S.texA }, uCl: { value: S.texC }, uSunO: { value: new THREE.Vector3() }, uW2O: { value: new THREE.Matrix3() },
    uLevel: { value: 0 }, uDryF: { value: 0 }, uDryB: { value: 0 }, uCloud: { value: 1 }, uDet: { value: 1 }, uClOff: { value: 0 }, uT: TIMEU, uHaze: { value: 1 }, uDbg: { value: 0 } };
  const earthVS = `
    #include <common>
    #include <logdepthbuf_pars_vertex>
    varying vec3 vNo; varying vec3 vW; varying vec3 vNw;
    void main(){ vNo = normalize(position); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vNw = normalize(mat3(modelMatrix) * vNo);
      gl_Position = projectionMatrix * viewMatrix * w;
      #include <logdepthbuf_vertex>
    }`;
  const sp_SHADE = `
    // sunlight colour after the air (reddened at low sun), the haze seen over a surface point
    vec3 spSunCol(float mus){ return mix(vec3(1.0, 0.5, 0.25), vec3(1.0, 0.97, 0.92), smoothstep(-0.03, 0.09, mus)); }
    vec3 spHaze(vec3 col, float mu, float mus, float k){
      float am = 1.0 / (mu + 0.045);
      vec3 tau = vec3(0.02, 0.05, 0.13) * am * k;
      vec3 tr = exp(-tau);
      float day = smoothstep(-0.15, 0.1, mus) * (0.35 + 0.65 * smoothstep(0.0, 0.5, mus));
      vec3 hc = mix(vec3(1.0, 0.5, 0.3), vec3(0.36, 0.6, 1.0), smoothstep(-0.06, 0.12, mus)) * 1.15 * day;
      return col * tr + (1.0 - tr) * hc;
    }`;
  S.earth = new THREE.Mesh(new THREE.SphereGeometry(R, 512, 256), new THREE.ShaderMaterial({ uniforms: S.earthU, vertexShader: earthVS,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uA, uCl; uniform vec3 uSunO; uniform mat3 uW2O; uniform float uLevel, uDryF, uDryB, uCloud, uDet, uClOff, uT, uHaze, uDbg;
      varying vec3 vNo; varying vec3 vW; varying vec3 vNw;
      ${sp_GLSL_NOISE} ${sp_SHADE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNo), Nw = normalize(vNw), V = normalize(cameraPosition - vW), Vo = uW2O * V, S = uSunO;
        float mu = clamp(dot(Nw, V), 0.0, 1.0), mus = dot(n, S), lat = asin(n.y);
        vec2 uv = spUV(n), dx, dy; spGrad(uv, dx, dy);
        vec4 A = textureGrad(uA, uv, dx, dy);
        float e = A.r * 17000.0 - 11000.0;
        float eE = textureGrad(uA, uv + vec2(1.0 / 4096.0, 0.0), dx, dy).r * 17000.0 - 11000.0;
        float eN = textureGrad(uA, uv + vec2(0.0, 1.0 / 2048.0), dx, dy).r * 17000.0 - 11000.0;
        // fine relief when close
        float det = 0.0;
        if (uDet > 0.01) det = (spF(n * 1400.0, 3) - 0.5) * 420.0 * uDet;
        float ed = e + det;
        // water: global level (drains to the deepest trench), and the local dry zone the wave has sucked in
        float bw = asin(clamp(Nw.z, -1.0, 1.0)) + (spN(n * 300.0) - 0.5) * 0.006;
        float dryL = smoothstep(-uDryF - 0.004, -uDryF + 0.004, bw) * (1.0 - smoothstep(uDryB - 0.004, uDryB + 0.004, bw));
        float level = mix(uLevel, -12000.0, dryL);
        float depth = level - ed;
        float wet = smoothstep(-15.0, 15.0, depth);
        float wasSea = (1.0 - smoothstep(-10.0, 10.0, e));               // below the old sea level
        // relief normal (exaggerated, so ridges and trenches read from orbit)
        float cl = max(cos(lat), 0.05);
        vec3 Te = normalize(vec3(n.z, 0.0, -n.x) + 1e-5), Tn = cross(n, Te);
        float gE = (eE - e) / (39100000.0 / 4096.0 * cl), gN = (eN - e) / (20000000.0 / 2048.0);
        float ex = mix(7.0, 11.0, wasSea);
        vec3 nr = normalize(n - ex * (gE * Te + gN * Tn) * (1.0 - wet));
        // ---- albedo
        vec3 alb;
        float moist = A.g, temp = 1.0 - abs(lat) / 1.45 - max(e, 0.0) / 9000.0;
        if (wasSea < 0.5) {
          vec3 desert = vec3(0.82, 0.62, 0.38), sav = vec3(0.6, 0.58, 0.3), forest = vec3(0.17, 0.36, 0.13), trop = vec3(0.09, 0.3, 0.1), boreal = vec3(0.13, 0.25, 0.15), tundra = vec3(0.5, 0.48, 0.38);
          vec3 warm = mix(desert, sav, smoothstep(0.3, 0.48, moist)); warm = mix(warm, trop, smoothstep(0.5, 0.68, moist));
          vec3 cool = mix(vec3(0.58, 0.55, 0.42), forest, smoothstep(0.35, 0.55, moist));
          alb = mix(cool, warm, smoothstep(0.45, 0.7, temp));
          alb = mix(boreal, alb, smoothstep(0.25, 0.38, temp)); alb = mix(tundra, alb, smoothstep(0.14, 0.24, temp));
          alb = mix(alb, vec3(0.42, 0.38, 0.34), smoothstep(1600.0, 3400.0, ed) * 0.6);
          float snowL = 1500.0 + clamp(temp, 0.0, 1.0) * 3600.0;
          alb = mix(alb, vec3(0.94, 0.96, 0.98), clamp((1.0 - smoothstep(0.08, 0.12, temp)) + smoothstep(snowL, snowL + 500.0, ed), 0.0, 1.0));
          alb *= 0.85 + 0.3 * spN(n * 220.0) * uDet + 0.1 * spN(n * 37.0);
        } else {
          // the dry sea floor: grey sediment, darker basalt ridges, pale shelves, dark trenches
          float dd = clamp(-e / 6000.0, 0.0, 1.0);
          alb = mix(vec3(0.6, 0.54, 0.45), vec3(0.47, 0.44, 0.4), smoothstep(0.03, 0.5, dd));
          alb = mix(alb, vec3(0.25, 0.25, 0.26), smoothstep(-3200.0, -2000.0, e) * smoothstep(0.1, 0.4, dd));
          alb = mix(alb, vec3(0.2, 0.2, 0.22), (1.0 - smoothstep(-8000.0, -6000.0, e)));
          alb *= 0.88 + 0.25 * spN(n * 160.0) + 0.12 * (spN(n * 900.0) - 0.5) * uDet;
          alb = mix(alb, vec3(0.86, 0.84, 0.78), smoothstep(0.6, 0.8, spN(n * 60.0 + 3.0)) * (1.0 - smoothstep(0.0, 0.05, dd)) * 0.5);   // salt
        }
        alb = pow(alb, vec3(2.2));   // palette above is sRGB
        // ---- light
        float day = smoothstep(-0.06, 0.1, mus);
        vec3 sc = spSunCol(mus);
        // cloud shadows
        vec3 so = normalize(n + (S - n * mus) * (0.0019 / max(mus, 0.12)));
        float cs = textureGrad(uCl, spUV(so) + vec2(uClOff, 0.0), dx, dy).r * uCloud;
        float shadow = 1.0 - 0.65 * cs;
        vec3 col = alb * sc * clamp((dot(nr, S) + 0.12) / 1.12, 0.0, 1.0) * 2.2 * day * shadow + alb * vec3(0.03, 0.04, 0.06);
        // water
        if (wet > 0.0) {
          vec3 deep = vec3(0.012, 0.06, 0.17), shelf = vec3(0.05, 0.28, 0.38);
          vec3 wc = mix(shelf, deep, smoothstep(30.0, 900.0, depth));
          vec3 wl = wc * (0.25 + 0.9 * max(mus, 0.0)) * sc * day * shadow;
          vec3 Hh = normalize(S + Vo); float nh = max(dot(n, Hh), 0.0), r2 = 0.018;
          float D = r2 / (3.14159 * pow(nh * nh * (r2 - 1.0) + 1.0, 2.0));
          float F = 0.02 + 0.98 * pow(1.0 - max(dot(Hh, Vo), 0.0), 5.0);
          float glit = 1.0 + 0.6 * (spN(n * 2600.0 + uT * 0.4) - 0.5) * uDet;
          wl += sc * D * F * 0.9 * day * glit * shadow * max(mus, 0.0) * 3.0;
          float fr = 0.02 + 0.98 * pow(1.0 - max(dot(n, Vo), 0.0), 5.0);
          wl += vec3(0.25, 0.45, 0.85) * fr * 0.35 * day;
          col = mix(col, wl, wet);
        }
        // the line the water just left: dark wet sediment
        col *= 1.0 - 0.35 * exp(-abs(depth) / 60.0) * (1.0 - wet) * wasSea;
        // city lights on the night side
        float night = (1.0 - smoothstep(-0.12, 0.02, mus));
        col += vec3(1.0, 0.7, 0.36) * A.b * night * (1.0 - wasSea) * 2.2 * (0.7 + 0.6 * spN(n * 800.0));
        col = spHaze(col, mu, mus, uHaze);
        if (uDbg > 0.5 && uDbg < 6.5) col = uDbg < 1.5 ? alb : uDbg < 2.5 ? (e < 0.0 ? vec3(0.0, 0.0, 1.0 + e / 11000.0) : vec3(e / 6000.0, 0.5, 0.0)) : vec3(A.g, A.b, wasSea);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  S.earth.material.extensions = { derivatives: true }; S.scene.add(S.earth);
  // clouds
  S.cloudU = { uCl: { value: S.texC }, uSunO: S.earthU.uSunO, uW2O: S.earthU.uW2O, uCloud: S.earthU.uCloud, uDet: S.earthU.uDet, uClOff: S.earthU.uClOff, uHaze: S.earthU.uHaze };
  S.clouds = new THREE.Mesh(new THREE.SphereGeometry(R + 9000, 384, 192), new THREE.ShaderMaterial({ uniforms: S.cloudU, vertexShader: earthVS, transparent: true, depthWrite: false,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uCl; uniform vec3 uSunO; uniform mat3 uW2O; uniform float uCloud, uDet, uClOff, uHaze;
      varying vec3 vNo; varying vec3 vW; varying vec3 vNw;
      ${sp_GLSL_NOISE} ${sp_SHADE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNo), Nw = normalize(vNw), V = normalize(cameraPosition - vW), S = uSunO;
        float mu = clamp(dot(Nw, V), 0.0, 1.0), mus = dot(n, S);
        vec2 uv = spUV(n) + vec2(uClOff, 0.0), dx, dy; spGrad(uv, dx, dy);
        vec4 C = textureGrad(uCl, uv, dx, dy);
        float d = C.r;
        // close up the field breaks into cells and puffs
        if (uDet > 0.01) { float cell = spF(n * 520.0, 3), puff = spN(n * 2400.0); d = mix(d, d * (0.35 + 1.3 * cell) + (puff - 0.5) * 0.12 * d, uDet); }
        float a = smoothstep(mix(0.12, 0.3, uDet), mix(0.6, 0.48, uDet), d) * uCloud;
        if (a < 0.003) discard;
        // fake relief: brighter on the sun side of thick cells
        vec3 so = normalize(n + (S - n * mus) * 0.004);
        float d2 = textureGrad(uCl, spUV(so) + vec2(uClOff, 0.0), dx, dy).r;
        float lit = clamp(0.75 + (d - d2) * 2.2, 0.35, 1.25);
        float day = smoothstep(-0.08, 0.1, mus);
        vec3 col = vec3(0.97, 0.98, 1.0) * spSunCol(mus) * clamp(mus * 1.8 + 0.3, 0.0, 1.0) * lit * day * 1.3 + vec3(0.02, 0.025, 0.04);
        col = spHaze(col, mu, mus, uHaze * 0.7);
        gl_FragColor = vec4(col, a * mix(0.75, 1.0, smoothstep(0.3, 0.9, d)));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  S.clouds.material.extensions = { derivatives: true }; S.clouds.renderOrder = 2; S.scene.add(S.clouds);
  // the atmosphere's limb: analytic column through an exponential shell at the ray's closest approach
  S.atmU = { uC: { value: new THREE.Vector3() }, uSun: SUNU, uHs: { value: 8000 }, uA: { value: 1 } };
  S.atm = new THREE.Mesh(new THREE.SphereGeometry(1, 256, 128), new THREE.ShaderMaterial({ uniforms: S.atmU, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec3 vW;
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform vec3 uC, uSun; uniform float uHs, uA; varying vec3 vW;
      void main(){
        #include <logdepthbuf_fragment>
        vec3 rd = normalize(vW - cameraPosition), ro = (cameraPosition - uC) / ${R.toFixed(1)};
        float tca = -dot(ro, rd); if (tca < 0.0) discard;
        vec3 tp = ro + rd * tca; float b = length(tp); float h = (b - 1.0) * ${R.toFixed(1)};
        if (h < 0.0) discard;
        float col = exp(-h / uHs) * sqrt(6.2831853 * ${R.toFixed(1)} / uHs);
        vec3 tau = vec3(0.04, 0.095, 0.24) * col;
        vec3 nt = tp / b; float mus = dot(nt, uSun);
        float day = smoothstep(-0.2, 0.08, mus);
        vec3 sunC = mix(vec3(1.0, 0.38, 0.15), vec3(1.0), smoothstep(-0.05, 0.3, mus));
        vec3 L = (1.0 - exp(-tau)) * sunC * day * 1.6;
        L += vec3(0.4, 0.6, 1.0) * (1.0 - exp(-tau.b * 0.05)) * 0.6 * day;   // the soft outer glow
        gl_FragColor = vec4(L * uA, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  S.atm.renderOrder = 3; S.scene.add(S.atm);

  // ---------------- the ring wave: a surface of revolution around the Z axis through the Earth's centre
  const NP = WAVE_PROF.length, NPH = 900, posA = new Float32Array((NPH + 1) * NP * 3), idx = [];
  for (let i = 0; i <= NPH; i++) { const u = i / NPH * 2 - 1, d = Math.PI * Math.sign(u) * Math.pow(Math.abs(u), 2.6);
    for (let j = 0; j < NP; j++) posA.set([d, j, 0], (i * NP + j) * 3); }
  for (let i = 0; i < NPH; i++) for (let j = 0; j < NP - 1; j++) { const a = i * NP + j, b = a + 1, c = a + NP, d = c + 1; idx.push(a, c, b, b, c, d); }
  const profT = new THREE.DataTexture(new Float32Array(NP * 2 * 4), NP, 2, THREE.RGBAFormat, THREE.FloatType); profT.magFilter = profT.minFilter = THREE.NearestFilter;
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(posA, 3)); rg.setIndex(idx);
  S.ringU = { uProf: { value: profT }, uNP: { value: NP }, uH: { value: 1 }, uRH: { value: 1 }, uT: TIMEU, uSun: SUNU,
    uClear: { value: 0 }, uIce: { value: 0.5 }, uRidge: { value: 0 }, uDbg: { value: 0 }, uHand: { value: 0 }, uEarthC: { value: new THREE.Vector3() }, uAlpha: { value: 1 },
    uDeep: { value: lin('#0d4f63') }, uFace: { value: lin('#1d8a8c') }, uGlow: { value: lin('#7ef0cf') } };
  // two passes, order-independent: (A) multiply the world behind by the water's transmittance, (B) add its light and foam
  const ringMat = (mul) => new THREE.ShaderMaterial({ uniforms: S.ringU, side: THREE.DoubleSide, transparent: true, depthWrite: false,
    blending: mul ? THREE.MultiplyBlending : THREE.AdditiveBlending, defines: mul ? { sp_MUL: 1 } : {},
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      uniform sampler2D uProf; uniform float uH, uRH, uNP;
      varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vY; varying float vK;
      void main(){
        float u = (position.y + 0.5) / uNP; vec4 P = texture2D(uProf, vec2(u, 0.25)), Q = texture2D(uProf, vec2(u, 0.75));
        float d = position.x, sd = sin(d), hh = sin(0.5 * d);
        vec3 p = vec3(-P.x * sd, P.y - P.x * 2.0 * hh * hh, P.z);          // camera-relative, precise near the camera
        vN = normalize(vec3(-Q.x * sd, Q.x * cos(d), Q.y));
        vec4 w = modelMatrix * vec4(p, 1.0); vW = w.xyz;
        vQ = vec2(d * uRH, P.w); vY = Q.z; vK = Q.w;
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uH, uT, uClear, uIce, uAlpha, uRidge, uDbg, uHand; uniform vec3 uSun, uEarthC, uDeep, uFace, uGlow;
      varying vec3 vW; varying vec3 vN; varying vec2 vQ; varying float vY; varying float vK;
      ${sp_GLSL_NOISE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 V = normalize(cameraPosition - vW), N = normalize(vN); float facing = dot(N, V); if (facing < 0.0) N = -N;
        float under = smoothstep(9.0, 9.6, vK) * (1.0 - smoothstep(11.4, 12.0, vK));   // the lip's underside: clear water, no crest foam
        float af = abs(facing), z = vQ.y, y = vY; vec2 q = vQ;
        // near the rider the face is ordinary water (opaque, reflecting black space); the ring around the planet is glass
        float dist = length(vW - cameraPosition), far = smoothstep(0.2 * uH, 1.4 * uH, dist), clear = uClear;
        float face = smoothstep(-1.6, -0.2, z) * (1.0 - step(0.25, z));
        float back = pow(clamp(dot(-V, uSun) * 0.5 + 0.5, 0.0, 1.0), 2.5);
        float thin = smoothstep(0.6, 0.98, y) * (1.0 - smoothstep(0.1, 0.6, z));
        float dif = clamp(dot(N, uSun), 0.0, 1.0);
        // foam: streaks pulled down the face, marbled foam low down, the icy crest line, the washed back
        float flow = uT * 0.08;
        float st = spF2(vec2(q.x * 7.0, z * 1.6 + flow * 6.0));
        float streak = smoothstep(0.58, 0.8, spF2(vec2(q.x * 26.0 + st * 3.0, z * 0.9 - flow * 9.0))) * face * smoothstep(0.15, 0.6, y);
        float marble = smoothstep(0.52, 0.72, spF2(q * vec2(3.5, 2.2) + vec2(0.0, -flow * 4.0))) * smoothstep(-2.4, -1.2, z) * (1.0 - smoothstep(-1.2, -0.6, z));
        float crest = smoothstep(0.955, 0.995, y) * smoothstep(0.3, 0.6, spF2(q * vec2(9.0, 4.0) + vec2(uT * 0.3, 0.0)) + 0.15 * (1.0 - far));
        crest *= smoothstep(-0.5, -0.1, z) * (1.0 - smoothstep(0.35, 0.9, z)) * (1.0 - under);
        float backfoam = smoothstep(0.55, 0.85, spF2(q * vec2(4.0, 1.4) + vec2(0.0, uT * 0.05))) * step(0.2, z) * exp(-z * 0.6) * 0.6;
        streak *= smoothstep(0.04, 0.3, af) * mix(1.0, 0.45, clear); marble *= mix(1.0, 0.5, clear);   // grazing / glassy: no white sheets
        float foam = clamp(streak * 0.55 + marble * 0.7 + crest + backfoam, 0.0, 1.0);
        foam *= 1.0 - 0.8 * smoothstep(1.2 * uH, 4.0 * uH, dist);   // the far side of the ring: glassy, not a white wall
        foam = max(foam, uIce * 0.45 * smoothstep(0.88, 1.0, y) * smoothstep(0.4, 0.7, spF2(q * vec2(14.0, 6.0) + 3.0)) * far);
        // the water as coloured glass: thick and dark near the base, thin and clear at the crest
        float slant = 1.0 / max(af, mix(0.3, 0.45, clear));
        float thick = mix(1.0, 0.25, smoothstep(0.6, 1.0, y)) * slant * mix(9.0, 0.45, clear);
        vec3 Tw = exp(-vec3(mix(1.3, 0.62, clear), mix(0.3, 0.16, clear), mix(0.26, 0.15, clear)) * thick);
        float fr = (0.02 + 0.98 * pow(1.0 - af, 5.0)) * mix(1.0, 0.55, clear);
#ifdef sp_MUL
        vec3 T = Tw * (1.0 - fr) * (1.0 - 0.93 * foam);
        gl_FragColor = vec4(mix(vec3(1.0), pow(T, vec3(0.4545)), uAlpha), 1.0);   // the framebuffer is sRGB
#else
        vec3 body = mix(uDeep, uFace, clamp(y * 1.1, 0.0, 1.0) * (0.55 + 0.45 * face));
        vec3 col = body * (0.55 + 0.6 * dif) * mix(1.0 - Tw.g * 0.6, (1.0 - Tw.g) * 0.6, clear) * (1.0 - fr * 0.6);
        col += uGlow * thin * (0.2 + 0.8 * back) * 0.75 * mix(1.0, 0.35, clear) * (abs(uDbg - 8.0) < 0.5 ? 0.0 : 1.0);
        col = mix(col, vec3(0.2, 0.36, 0.48) * (0.6 + 0.5 * dif), uHand * 0.55);
        vec3 foamC = vec3(0.92, 0.97, 1.0) * (0.42 + 0.7 * dif + 0.45 * back);
        col = mix(col, foamC, foam * (abs(uDbg - 9.0) < 0.5 ? 0.0 : 1.0));
        float sp = pow(spN2(q * vec2(260.0, 110.0) + mod(floor(uT * 6.0), 97.0) * vec2(17.31, 31.73)), 22.0) * (foam + 0.25) * uIce * (1.0 - 0.85 * far);
        col += vec3(1.0, 0.97, 0.9) * sp * 7.0 * (0.35 + back) * (abs(uDbg - 10.0) < 0.5 ? 0.0 : 1.0);
        vec3 Hh = normalize(uSun + V);
        // the sun on the water: a tight core and a broken glitter path, never a flat white sheet
        float nh = clamp(dot(N, Hh), 0.0, 1.0), glit = smoothstep(0.62, 0.9, spN2(q * vec2(180.0, 70.0) + mod(floor(uT * 5.0), 89.0) * vec2(23.17, 11.91)));
        col += vec3(1.0, 0.94, 0.85) * (pow(nh, 2000.0) * 1.6 + pow(nh, 120.0) * glit * 0.9) * (1.0 - foam) * mix(1.0, 0.18, far) * (abs(uDbg - 7.0) < 0.5 ? 0.0 : 1.0);   // far away the glitter averages out: keep it a sparkle, not a sheet
        col += uGlow * 0.25 * fr * clear * (1.0 - foam) * (abs(uDbg - 11.0) < 0.5 ? 0.0 : 1.0);
        if (uDbg > 0.5 && uDbg < 6.5) col = uDbg < 1.5 ? vec3(foam, crest, streak) : uDbg < 2.5 ? vec3(vK / 23.0, y, under) : uDbg < 3.5 ? vec3(fr, af, dist / uH * 0.2) : uDbg < 4.5 ? vec3(streak, marble, backfoam) * 0.6 : uDbg < 5.5 ? body * (0.55 + 0.6 * dif) * mix(1.0 - Tw.g * 0.6, (1.0 - Tw.g) * 1.2, clear) : vec3(sp, nh, glit) * 0.5;
        gl_FragColor = vec4(col * uAlpha, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
#endif
      }` });
  S.ring = new THREE.Mesh(rg, ringMat(false)); S.ringM = new THREE.Mesh(rg, ringMat(true)); S.ringM.material.depthWrite = true;   // only the nearest surface gets lit
  for (const m of [S.ringM, S.ring]) { m.frustumCulled = false; S.scene.add(m); }
  S.ringM.renderOrder = 6; S.ring.renderOrder = 7;

  // ---------------- the Moon
  S.moonU = { uM: { value: S.texM }, uSun: SUNU, uW2O: { value: new THREE.Matrix3() } };
  S.moon = new THREE.Mesh(new THREE.SphereGeometry(sp_RM, 256, 128), new THREE.ShaderMaterial({ uniforms: S.moonU, vertexShader: earthVS,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uM; uniform vec3 uSun; uniform mat3 uW2O; varying vec3 vNo; varying vec3 vW; varying vec3 vNw;
      ${sp_GLSL_NOISE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 n = normalize(vNo), S = uW2O * uSun, V = uW2O * normalize(cameraPosition - vW);
        vec2 uv = spUV(n), dx, dy; spGrad(uv, dx, dy);
        vec4 M = textureGrad(uM, uv, dx, dy);
        float hE = textureGrad(uM, uv + vec2(1.0 / 2048.0, 0.0), dx, dy).g, hN = textureGrad(uM, uv + vec2(0.0, 1.0 / 1024.0), dx, dy).g;
        vec3 Te = normalize(vec3(n.z, 0.0, -n.x) + 1e-5), Tn = cross(n, Te);
        vec3 nr = normalize(n - 9.0 * ((hE - M.g) / max(cos(asin(n.y)), 0.05) * Te + (hN - M.g) * Tn));
        float ndl = max(dot(nr, S), 0.0), ndv = max(dot(n, V), 0.05);
        float ls = ndl / (ndl + ndv) * 2.0;                       // Lommel-Seeliger: the flat, dusty lunar look
        float b = mix(ndl, ls, 0.6) * smoothstep(-0.02, 0.06, dot(n, S));
        vec3 col = vec3(M.r) * vec3(1.0, 0.97, 0.93) * b * 1.5 + vec3(M.r) * vec3(0.012, 0.016, 0.024);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  S.moon.material.extensions = { derivatives: true }; S.moon.renderOrder = 4; S.scene.add(S.moon);

  // ---------------- geostationary satellites: glinting dots on a ring
  const NG = 90, gp = new Float32Array(NG * 3), ga = new Float32Array(NG), RG = RNG('sp-geo');
  for (let i = 0; i < NG; i++) { const a = i / NG * TAU + RG.n(0.02); gp.set([Math.cos(a) * sp_GEO, 0, Math.sin(a) * sp_GEO], i * 3); ga[i] = RG.f(); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(gp, 3)); gg.setAttribute('aR', new THREE.BufferAttribute(ga, 1));
  S.geoU = { uA: { value: 0 }, uT: TIMEU };
  S.geo = new THREE.Points(gg, new THREE.ShaderMaterial({ uniforms: S.geoU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float aR; uniform float uT; varying float vB;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        vB = 0.55 + 0.45 * sin(uT * (0.7 + aR * 2.0) + aR * 50.0); vB = pow(vB, 3.0) * 1.6 + 0.35; gl_PointSize = 5.0 + 7.0 * vB;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uA; varying float vB;
      void main(){
        #include <logdepthbuf_fragment>
        vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = exp(-r * r * 6.0) + 0.5 * max(0.0, 1.0 - abs(d.x) * 14.0) * max(0.0, 1.0 - r) + 0.5 * max(0.0, 1.0 - abs(d.y) * 14.0) * max(0.0, 1.0 - r);
        gl_FragColor = vec4(vec3(1.0, 0.95, 0.85) * a * vB * uA, 1.0); }` }));
  S.geo.frustumCulled = false; S.geo.renderOrder = 5; S.scene.add(S.geo);
  const gl = []; for (let i = 0; i <= 720; i++) { const a = i / 720 * TAU; gl.push(new THREE.Vector3(Math.cos(a) * sp_GEO, 0, Math.sin(a) * sp_GEO)); }
  S.geoLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(gl), new THREE.LineBasicMaterial({ color: lin('#9fd8ff'), transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, depthWrite: false }));
  S.geoLine.frustumCulled = false; S.geoLine.renderOrder = 5; S.scene.add(S.geoLine);

  // ---------------- the space station: truss, eight solar wings, radiators, modules
  S.iss = new THREE.Group();
  const panelTex = g3Tex((x, w, h) => { x.fillStyle = '#1a2a4a'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = `hsl(${220 + (i * 7 + j * 3) % 12}, 45%, ${22 + ((i * 13 + j * 7) % 9)}%)`; x.fillRect(i * w / 16 + 1, j * h / 4 + 1, w / 16 - 2, h / 4 - 2); }
    x.fillStyle = '#b08a3a'; x.fillRect(0, h / 2 - 2, w, 4); }, 256, 64);
  const metal = new THREE.MeshStandardMaterial({ color: lin('#e4e2dc'), roughness: 0.4, metalness: 0.1, emissive: lin('#1a1c20') });
  const panelM = new THREE.MeshStandardMaterial({ map: panelTex, roughness: 0.22, metalness: 0.0, emissive: lin('#2a3a5a'), emissiveIntensity: 0.5, side: THREE.DoubleSide });
  const radM = new THREE.MeshStandardMaterial({ color: lin('#f2f2ee'), roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide });
  const truss = new THREE.Mesh(new THREE.BoxGeometry(110, 3, 3), metal); S.iss.add(truss);
  for (const sx of [-1, 1]) for (const k of [0, 1]) for (const sz of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 35), panelM); p.position.set(sx * (40 + k * 15), 0, sz * 21); S.iss.add(p); }
  for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 10), radM); r.position.set(sx * 18, 0, -8); r.rotation.x = 0.4; S.iss.add(r); }
  const mod = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 52, 16), metal); mod.rotation.x = Math.PI / 2; mod.position.set(0, -3, 0); S.iss.add(mod);
  const mod2 = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 22, 16), metal); mod2.rotation.z = Math.PI / 2; mod2.position.set(0, -3, -14); S.iss.add(mod2);
  S.iss.scale.setScalar(1);
  S.sunL = new THREE.DirectionalLight(0xfff4e6, 3.2); S.hemi = new THREE.HemisphereLight(0x4a6a9a, 0x2a4a6a, 0.6);
  S.scene.add(S.iss, S.sunL, S.sunL.target, S.hemi);
  spBuildMoonFX(S);
  return S;
}

// ---- the space ridge: past the hand-off the cross-section morphs from the lead's surfing profile (camera low on the face,
// the lip overhead) to a smooth ridge with the rider just under its crest, so the crest line reads as a ridge that runs
// over the horizon and around the planet. Same rows as WAVE_PROF (front part and back part matched by arc length).
const sp_RIDGE_PTS = [[-2.8, -0.02], [-2.0, 0.0], [-1.4, 0.07], [-0.95, 0.22], [-0.62, 0.45], [-0.4, 0.66], [-0.24, 0.84], [-0.12, 0.95], [0.0, 1.0],
  [0.18, 0.97], [0.45, 0.86], [0.9, 0.62], [1.5, 0.36], [2.4, 0.15], [3.6, 0.04], [5.0, 0.0]];
const sp_RIDGE_CREST = 8, sp_RIDGE_CAM = 0.9;
const spRide = (st) => 0;
const spRidge = (() => {
  const arc = (P) => { const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return L; };
  const cr = (P, n) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
      for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), i + t]); } }
    out.push([...P[P.length - 1], P.length - 1]); return out; };
  const RD = cr(sp_RIDGE_PTS, 24), LD = WAVE_PROF;
  const split = (D, ci) => { const k = D.findIndex((p) => p[2] >= ci); return [D.slice(0, k + 1), D.slice(k)]; };
  const sample = (D, u) => { const L = arc(D), T = L[L.length - 1] * u; let i = 0; while (i < L.length - 2 && L[i + 1] < T) i++; const f = clamp((T - L[i]) / ((L[i + 1] - L[i]) || 1)); return [lerp(D[i][0], D[i + 1][0], f), lerp(D[i][1], D[i + 1][1], f)]; };
  const [RF, RB] = split(RD, sp_RIDGE_CREST), [LF, LB] = split(LD, WAVE_CREST);
  const LFa = arc(LF), LBa = arc(LB), out = [];
  for (let j = 0; j < LD.length; j++) {
    const kf = LF.indexOf(LD[j]);
    if (kf >= 0 && LD[j][2] <= WAVE_CREST) out.push(sample(RF, LFa[kf] / LFa[LFa.length - 1]));
    else { const kb = LB.indexOf(LD[j]); out.push(sample(RB, LBa[kb] / LBa[LBa.length - 1])); }
  }
  // the camera's anchor on the ridge's face (y = sp_RIDGE_CAM)
  let zc = 0; for (let i = 0; i < RF.length - 1; i++) if (RF[i][1] <= sp_RIDGE_CAM && RF[i + 1][1] >= sp_RIDGE_CAM) { zc = lerp(RF[i][0], RF[i + 1][0], (sp_RIDGE_CAM - RF[i][1]) / (RF[i + 1][1] - RF[i][1])); break; }
  return { rows: out, zc };
})();
// ---- the ring's cross-section for story time st, bent onto the sphere.
// Near the camera it is the flat profile; far parts are compressed in angle so the base always lands on the planet.
function spProfile(st, S) {
  const R = R_EARTH, eye = eyeY(st), c = R + eye, dbg = window.spDbg || {};
  const k = dbg.ride ?? spRide(st), posL = rideCam(st).pos, yL = waveProfile(posL)[1];
  const pos = lerp(posL, spRidge.zc, k), yC = lerp(yL, sp_RIDGE_CAM, k);
  const Hm = (eye - rideCam(st).eye) / yC, gap = Math.max(60, Hm * 4e-4);   // anchored on the rider (absorbs the lead's height wobble)
  const PR = WAVE_PROF, NP = PR.length, D = S.ringU.uProf.value.image.data, pts = [];
  const kk = Hm / R, TF = dbg.TF ?? lerp(0.4, 1.0, ss(0.6, 2.5, kk)), TB = dbg.TB ?? lerp(0.6, 1.2, ss(0.6, 2.5, kk));
  for (let j = 0; j < NP; j++) {
    const zp = lerp(PR[j][0], spRidge.rows[j][0], k), y = lerp(PR[j][1], spRidge.rows[j][1], k), r = R + Hm * y - gap;
    const raw = Hm * (zp - pos) / Math.max(r, R);
    const th = raw < 0 ? TF * Math.tanh(raw / TF) : TB * Math.tanh(raw / TB);
    pts.push([r, th, zp, y]);
  }
  for (let j = 0; j < NP; j++) {
    const a = pts[Math.max(0, j - 1)], b = pts[Math.min(NP - 1, j + 1)];
    let tr = b[0] * Math.cos(b[1]) - a[0] * Math.cos(a[1]), tz = b[0] * Math.sin(b[1]) - a[0] * Math.sin(a[1]); const l = Math.hypot(tr, tz) || 1; tr /= l; tz /= l;
    const [r, th, zp, y] = pts[j], rho = r * Math.cos(th);
    // rho - c without cancellation: (r - c) - r (1 - cos th)
    D.set([rho, (r - c) - r * 2 * Math.sin(th / 2) ** 2, r * Math.sin(th), zp], j * 4);
    D.set([tz, -tr, y, PR[j][2]], (NP + j) * 4);
  }
  S.ringU.uProf.value.needsUpdate = true;
  S.ringU.uH.value = Hm; S.ringU.uRH.value = (R + Hm) / Hm; S.ringU.uRidge.value = k;
  return Hm;
}

const spV = new THREE.Vector3(), spQ = new THREE.Quaternion(), spQ2 = new THREE.Quaternion(), spM4 = new THREE.Matrix4();
function stageSpace(g, st) {
  if (!spG) spG = spBuild(g);
  const S = spG, R = R_EARTH, Hm = waveH(st), eye = eyeY(st), c = R + eye;
  // ---- camera: the lead's ride + this stage's own aim (blended in from the hand-off at 290)
  const camD = Math.hypot(0, c);
  const near = Math.max(20, Math.max(60, Hm * 4e-4) * 0.3), far = 2.5e9;
  const cr = applyCam(g, st, near, far);
  const bl = ss(290, 300, st);
  g.cam.rotation.y = cr.yaw + (knots(sp_YAW, st) - knots(YAW, st)) * DEG * bl;
  g.cam.rotation.x = cr.pitch + (knots(sp_PITCH, st) - knots(PITCH, st)) * DEG * bl;
  // 466.5..468: hold still (no carve sway) for the silence before the hit
  const still = ss(465.5, 466.5, st) * (1 - ss(468.0, 469.5, st));
  if (still > 0) { g.cam.rotation.y = lerp(g.cam.rotation.y, knots(sp_YAW, st) * DEG, still); g.cam.rotation.x = lerp(g.cam.rotation.x, knots(sp_PITCH, st) * DEG, still); }
  const dbg = window.spDbg || {};
  if (dbg.yaw != null) g.cam.rotation.y = dbg.yaw * DEG; if (dbg.pitch != null) g.cam.rotation.x = dbg.pitch * DEG;
  if (dbg.cam) { g.cam.position.set(...dbg.cam); g.cam.lookAt(0, -R, 0); }
  g.cam.updateMatrixWorld();
  // ---- the Earth: centre below, turned by the distance the wave has travelled (rotation about X)
  S.earth.position.set(0, -R, 0); S.clouds.position.copy(S.earth.position); S.atm.position.copy(S.earth.position);
  spQ.setFromAxisAngle(spV.set(1, 0, 0), travel(st) / R);
  spQ2.setFromEuler(new THREE.Euler(...(dbg.eul || [0.6, 1.5, 0.25]), 'YXZ'));   // which part of the planet is under the wave
  S.earth.quaternion.copy(spQ).multiply(spQ2); S.clouds.quaternion.copy(S.earth.quaternion);
  const w2o = new THREE.Matrix3().setFromMatrix4(spM4.makeRotationFromQuaternion(S.earth.quaternion).invert());
  S.earthU.uW2O.value.copy(w2o); S.earthU.uSunO.value.copy(SUN).applyMatrix3(w2o).normalize();
  S.earthU.uClOff.value = st * 0.00002;
  // water: the local zone the wave has emptied (ahead / behind, radians of arc), then the oceans drain
  S.earthU.uDryF.value = Math.min(0.26, (2.4 * Hm + 6e5) / R);
  S.earthU.uDryB.value = Math.min(0.4, (6 * Hm + 2e5) / R);
  S.earthU.uLevel.value = -11500 * Math.pow(ss(338, 366, st), 0.7);
  S.earthU.uCloud.value = (1 - 0.6 * ss(342, 378, st)) * (dbg.noCloud ? 0 : 1);
  S.earthU.uDet.value = 1 - ss(800e3, 4000e3, eye);
  S.earthU.uHaze.value = lerp(0.55, 0.75, ss(150e3, 1.2e6, eye)) * lerp(1, 0.55, ss(1.5e6, 8e6, eye)); S.earthU.uDbg.value = dbg.edbg || 0;
  const Hs = 8000 * clamp(Math.sqrt(camD / 1.2e6), 1, 7);
  S.atmU.uHs.value = Hs; S.atmU.uC.value.set(0, -R, 0); S.atm.scale.setScalar(R + Hs * 14); S.atmU.uA.value = lerp(0.62, 1, ss(150e3, 1.5e6, eye));
  // ---- the ring wave
  spProfile(st, S);
  S.ring.position.set(0, eye, 0); S.ringM.position.copy(S.ring.position); S.ring.visible = S.ringM.visible = !dbg.noRing; S.ringU.uDbg.value = dbg.rdbg || 0; if (dbg.noM) S.ringM.visible = false; if (dbg.noA) S.ring.visible = false;
  S.ringU.uClear.value = ss(305, 350, st); S.ringU.uHand.value = 1 - ss(290, 302, st); S.ringU.uIce.value = 0.55 + 0.45 * ss(300, 380, st);
  // ---- the space station (295..306): a few km below, drifting across under the board
  const issOn = st > 292 && st < 310;
  S.iss.visible = issOn;
  if (issOn) { const u = (st - 299) / 10; S.iss.position.set(2600 + u * 3000, eye - 1900 - u * 300, -1400 - u * 600); S.iss.scale.setScalar(3.0);
    // the wings turn so the sun glints off them towards you around 299
    const toCam = spV.set(0, eye, 0).sub(S.iss.position).normalize(), hv = toCam.clone().add(SUN).normalize();
    const wob = new THREE.Euler(0.25 * Math.sin(st * 0.9), 0.4 * Math.sin(st * 0.37), 0.2 * Math.sin(st * 0.6 + 1));
    S.iss.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hv).multiply(new THREE.Quaternion().setFromEuler(wob)); }
  S.sunL.position.copy(SUN).multiplyScalar(1e3).add(S.iss.position); S.sunL.target.position.copy(S.iss.position);
  // ---- geostationary ring
  S.geo.position.set(0, -R, 0); S.geoLine.position.copy(S.geo.position);
  if (!S.geoQ) {   // the orbit's plane: through the camera's line of sight up-left of centre at 422 (so the dots arc across the frame)
    const e422 = eyeY(422), P0 = new THREE.Vector3(0, R + e422, 0), d = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler((knots(sp_PITCH, 422) - 4) * DEG, (knots(sp_YAW, 422) + 21) * DEG, 0, 'YXZ'));
    const b2 = P0.dot(d), cc = P0.lengthSq() - sp_GEO * sp_GEO, t = -b2 + Math.sqrt(b2 * b2 - cc), Qp = P0.clone().addScaledVector(d, t);
    const nrm = new THREE.Vector3().crossVectors(Qp, P0).normalize().lerp(P0.clone().normalize(), 0.4).normalize();
    S.geoQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), nrm); }
  S.geo.quaternion.copy(S.geoQ).multiply(spQ2.setFromAxisAngle(spV.set(0, 1, 0), st * 0.003)); S.geoLine.quaternion.copy(S.geoQ); S.geoU.uA.value = ss(410, 417, st) * (1 - ss(436, 446, st)); S.geoLine.material.opacity = 0.16 * S.geoU.uA.value; S.geoLine.visible = S.geo.visible = S.geoU.uA.value > 0;
  // ---- the Moon, the sea reaching for it, the hit, the barrel
  spMoonFX(S, st, eye);
  // ---- the sky pass
  S.skyCam.quaternion.copy(g.cam.quaternion); S.skyCam.fov = g.cam.fov; S.skyCam.updateProjectionMatrix(); S.skyCam.updateMatrixWorld();
  S.starsU.uA.value = 1; S.mwU.uA.value = 1;
  g.r.render(S.sky, S.skyCam);
  g.r.clearDepth();
  g.r.render(S.scene, g.cam);
  const hit = st >= 468 ? Math.exp(-(st - 468) / 0.35) : 0;
  return { sky: lin('#1c2a44'), ground: lin('#1f6f78'), key: 2.8, hemi: 0.55, spray: st > 466.4 && st < 468 ? 0.25 : 0.7, flare: dbg.noFlare ? 0 : 0.9, bloom: 0.32 + 0.5 * hit + 0.15 * S.fx.inTube,
    post: (t) => spPost(S, t) };
}

// =====================================================================
//  THE MOON SEQUENCE (430..497): the Moon grows ahead and up, a spout of the sea reaches for it,
//  466.5..468 the tip hangs still just short of the surface, 468 the hit (flash + ice spray),
//  then the lip throws over and closes into a barrel whose axis points at the Moon.
// =====================================================================
const sp_MOON_AZ = -16 * DEG, sp_MOON_EL = 14 * DEG;
const sp_MDIAM = [[424, 0.9], [434, 1.5], [445, 2.4], [455, 3.6], [463, 4.8], [466.5, 5.5], [468, 5.8], [480, 6.4], [497, 7.0]];   // apparent diameter, deg
const sp_MOON_ELK = [[424, -24], [434, -17], [445, -4], [455, 6], [463, 11], [468, 12], [497, 12]];
const spMoonDir = new THREE.Vector3();
function spMoonAim(st) { const el = knots(sp_MOON_ELK, st) * DEG; return spMoonDir.set(-Math.sin(sp_MOON_AZ) * Math.cos(el), Math.sin(el), -Math.cos(sp_MOON_AZ) * Math.cos(el)); }
const sp_TUBE_R = 15e6, sp_TUBE_L = 64e6;
// a dynamic grid (NU along x NV around) for the spout and the barrel
function spGrid(NU, NV) {
  const n = (NU + 1) * (NV + 1), g = new THREE.BufferGeometry(), idx = [], uv = new Float32Array(n * 2);
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) uv.set([i / NU, j / NV], (i * (NV + 1) + j) * 2);
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + 1, c = a + NV + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(n * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('aUV', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.userData = { NU, NV };
  return g;
}
// water sheet: the same coloured-glass model as the ring (multiply pass + additive pass)
function spSheetMat(U, mul) {
  return new THREE.ShaderMaterial({ uniforms: U, side: THREE.DoubleSide, transparent: true, depthWrite: !!mul,
    blending: mul ? THREE.MultiplyBlending : THREE.AdditiveBlending, defines: mul ? { sp_MUL: 1 } : {},
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute vec2 aUV; varying vec2 vUV; varying vec3 vW; varying vec3 vN;
      void main(){ vUV = aUV; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uT, uLip, uAlpha, uSpin; uniform vec3 uSun, uFace, uGlow, uDeep;
      varying vec2 vUV; varying vec3 vW; varying vec3 vN;
      ${sp_GLSL_NOISE}
      void main(){
        #include <logdepthbuf_fragment>
        vec3 V = normalize(cameraPosition - vW), N = normalize(vN); float fc = dot(N, V); if (fc < 0.0) N = -N; float af = abs(fc);
        float u = vUV.x, v = vUV.y;
        // ragged open edges: the lip (v -> 1) and the mouth (u -> 1) tear into foam
        float rag = spF2(vec2(u * 40.0, v * 9.0 + uT * 0.6));
        float lipE = uLip * smoothstep(0.86, 1.0, v + (rag - 0.5) * 0.1);
        float mouthE = uLip * smoothstep(0.88, 1.0, u + (spF2(vec2(v * 30.0, u * 4.0 - uT * 0.4)) - 0.5) * 0.12);
        float fadeE = uLip * max(smoothstep(0.955, 1.0, v + (rag - 0.5) * 0.05), smoothstep(0.95, 1.0, u + (rag - 0.5) * 0.06));
        if (fadeE > 0.999) discard;
        float back = clamp(dot(-V, uSun), 0.0, 1.0), dif = clamp(dot(N, uSun), 0.0, 1.0);
        float flow = uT * uSpin;
        float s1 = spF2(vec2(u * 5.0, v * 3.0 - flow));
        float streak = smoothstep(0.56, 0.8, spF2(vec2(u * 34.0 + s1 * 2.5, v * 3.0 - flow * 2.2)));
        float marble = smoothstep(0.55, 0.75, spF2(vec2(u * 9.0, v * 7.0 - flow * 1.4) + 4.0)) * 0.6;
        float seam = uLip * (1.0 - smoothstep(0.0, 0.07, v + (rag - 0.5) * 0.04));   // where the lip lands: whitewater
        float foam = clamp(streak * 0.5 + marble * 0.35 + lipE + mouthE * 0.8 + seam, 0.0, 1.0);
        float slant = 1.0 / max(af, 0.25);
        float thick = mix(1.0, 0.35, uLip * v) * slant * 0.85;
        vec3 Tw = exp(-vec3(1.25, 0.3, 0.25) * thick);
        float fr = 0.02 + 0.98 * pow(1.0 - af, 5.0);
#ifdef sp_MUL
        gl_FragColor = vec4(mix(vec3(1.0), pow(Tw * (1.0 - fr * 0.6) * (1.0 - 0.9 * foam), vec3(0.4545)), uAlpha * (1.0 - fadeE) * (1.0 - fadeE)), 1.0);
#else
        vec3 col = mix(uDeep, uFace, 0.6) * (0.35 + 0.6 * dif) * (1.0 - Tw.g) * 1.4;
        col += uGlow * (0.12 + 1.1 * pow(back, 1.6)) * (1.0 - Tw.g * 0.5) * 0.75;           // the sun shining through the wall
        vec3 foamC = vec3(0.93, 0.97, 1.0) * (0.45 + 0.6 * dif + 0.6 * back);
        col = mix(col, foamC, foam);
        float sp = pow(spN2(vUV * vec2(500.0, 160.0) + mod(floor(uT * 7.0), 83.0) * vec2(19.7, 27.3)), 20.0) * (foam + 0.3);
        col += vec3(1.0, 0.97, 0.9) * sp * 6.0 * (0.3 + back);
        col += vec3(1.0, 0.94, 0.85) * pow(clamp(dot(N, normalize(uSun + V)), 0.0, 1.0), 120.0) * 2.0 * (1.0 - foam);
        col += uGlow * 0.3 * fr * (1.0 - foam);
        gl_FragColor = vec4(col * uAlpha * (1.0 - fadeE), 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
#endif
      }` });
}
function spBuildMoonFX(S) {
  const F = S.fx = { inTube: 0 };
  const mk = (NU, NV, lip, spin) => { const U = { uT: TIMEU, uSun: SUNU, uLip: { value: lip }, uAlpha: { value: 1 }, uSpin: { value: spin },
      uFace: { value: lin('#1d8a8c') }, uGlow: { value: lin('#7ef0cf') }, uDeep: { value: lin('#0d4f63') } };
    const geo = spGrid(NU, NV), m = new THREE.Mesh(geo, spSheetMat(U, true)), a = new THREE.Mesh(geo, spSheetMat(U, false));
    m.frustumCulled = a.frustumCulled = false; m.renderOrder = 8; a.renderOrder = 9; S.scene.add(m, a); return { geo, m, a, U }; };
  F.spout = mk(70, 28, 0, 0.6);
  F.tube = mk(110, 160, 1, 0.22);
  // the hit: ice spray, and a soft glow where the water meets the Moon
  const N = 5200, R = RNG('sp-spray'), dir = [], spd = [];
  for (let i = 0; i < N; i++) { const crown = R.f() < 0.45; dir.push([R.n(1), R.n(1), R.n(1), crown ? 1 : 0, R.f()]); spd.push(R.r(0.25, 1)); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const pa = new Float32Array(N); for (let i = 0; i < N; i++) pa[i] = R.f(); pg.setAttribute('aR', new THREE.BufferAttribute(pa, 1));
  F.sprayU = { uA: { value: 0 }, uT: TIMEU };
  F.spray = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: F.sprayU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      attribute float aR; uniform float uT; varying float vB;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
        vB = 0.5 + 0.5 * sin(uT * (3.0 + aR * 9.0) + aR * 60.0); gl_PointSize = 3.0 + 7.0 * aR * aR + 6.0 * vB * step(0.85, aR);
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uA; varying float vB;
      void main(){
        #include <logdepthbuf_fragment>
        vec2 d = gl_PointCoord - 0.5; float r = length(d) * 2.0; float a = exp(-r * r * 5.0);
        gl_FragColor = vec4(vec3(0.85, 0.95, 1.0) * a * (0.6 + 0.8 * vB) * uA, 1.0); }` }));
  F.spray.frustumCulled = false; F.spray.renderOrder = 10; F.sprayDir = dir; F.spraySpd = spd; S.scene.add(F.spray);
  F.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.15, 'rgba(220,250,255,0.6)'], [0.45, 'rgba(140,230,230,0.15)'], [1, 'rgba(120,220,220,0)']], 256),
    blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, transparent: true }));
  F.glow.renderOrder = 11; S.scene.add(F.glow);
}
const spVa = new THREE.Vector3(), spVb = new THREE.Vector3(), spVc = new THREE.Vector3(), spVd = new THREE.Vector3();
function spMoonFX(S, st, eye) {
  const F = S.fx, cam = spVd.set(0, eye, 0); spMoonAim(st);
  // ---- the Moon
  const diam = knots(sp_MDIAM, st) * DEG, D = sp_RM / Math.tan(diam / 2);
  const Mc = spMoonDir.clone().multiplyScalar(D);                       // camera-relative
  S.moon.visible = st > 424; S.moon.position.copy(Mc).add(cam);
  S.moon.rotation.set(0.35, -1.1 + st * 0.0015, 0.1); S.moon.updateMatrixWorld();
  S.moonU.uW2O.value.setFromMatrix4(spM4.makeRotationFromQuaternion(S.moon.quaternion).invert());
  // a frame around the axis (the barrel's axis points at the Moon)
  const A = spMoonDir, Uv = spVa.set(0, 1, 0).addScaledVector(A, -A.y).normalize(), Sv = spVb.crossVectors(A, Uv).normalize();
  const r0 = sp_TUBE_R, O = new THREE.Vector3().addScaledVector(Sv, -0.35 * r0).addScaledVector(Uv, 0.606 * r0);
  // ---- the spout: from below the frame, curving up into the Moon's underside
  const sp = F.spout, spOn = st > 428 && st < 476;
  sp.m.visible = sp.a.visible = spOn;
  // the tongue's base is the water under the board: its top surface passes ~just below the camera
  const rb = Math.min(0.2 * D, 9e6), B = new THREE.Vector3(0, -rb * 1.12, 0).addScaledVector(A, -0.25 * rb);
  const nC = B.clone().sub(Mc).normalize(), CP = Mc.clone().addScaledVector(nC, sp_RM);   // the contact point, on the side facing the spout
  if (spOn) {
    const grow = st < 468 ? lerp(0.3, 0.97, Math.pow(ss(428, 466.5, st), 0.85)) : 1, fade = 1 - ss(469.5, 475.5, st);
    const C1 = B.clone().addScaledVector(A, 0.35 * B.distanceTo(CP)), C2 = CP.clone().addScaledVector(nC, 0.4 * B.distanceTo(CP));
    const bez = (t, o) => { const u = 1 - t; return o.set(0, 0, 0).addScaledVector(B, u * u * u).addScaledVector(C1, 3 * u * u * t).addScaledVector(C2, 3 * u * t * t).addScaledVector(CP, t * t * t); };
    const { NU, NV } = sp.geo.userData, P = sp.geo.attributes.position, Nn = sp.geo.attributes.normal, p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), tg = new THREE.Vector3(), n1 = new THREE.Vector3(), n2 = new THREE.Vector3();
    for (let i = 0; i <= NU; i++) {
      const t = (i / NU) * grow; bez(t, p0); bez(Math.min(1, t + 0.002), p1); tg.subVectors(p1, p0).normalize();
      n1.crossVectors(tg, Sv).normalize(); n2.crossVectors(tg, n1).normalize();
      const k = i / NU, rad = lerp(rb, 0.4e6, Math.pow(k, 0.55)) * (1 + 0.12 * k * Math.sin(k * 9 - st * 2.1)) * (st > 468 ? 1 + 0.6 * ss(468, 471, st) * k : 1);
      for (let j = 0; j <= NV; j++) {
        const a = j / NV * TAU, w = 1 + 0.08 * k * Math.sin(a * 3 + k * 14 - st * 3), cx = Math.cos(a) * w, cy = Math.sin(a) * w, id = i * (NV + 1) + j;
        P.setXYZ(id, p0.x + (n1.x * cx + n2.x * cy) * rad, p0.y + (n1.y * cx + n2.y * cy) * rad, p0.z + (n1.z * cx + n2.z * cy) * rad);
        Nn.setXYZ(id, n1.x * cx + n2.x * cy, n1.y * cx + n2.y * cy, n1.z * cx + n2.z * cy);
      }
    }
    P.needsUpdate = Nn.needsUpdate = true; sp.m.position.copy(cam); sp.a.position.copy(cam);
    sp.U.uAlpha.value = ss(428, 433, st) * fade;
  }
  // ---- the hit: spray and glow
  const tau = st - 468, sOn = tau > 0 && tau < 12;
  F.spray.visible = sOn; F.sprayU.uA.value = sOn ? Math.exp(-tau / 3.5) * ss(0, 0.05, tau) : 0;
  if (sOn) {
    const P = F.spray.geometry.attributes.position, t1 = new THREE.Vector3(), t2 = new THREE.Vector3(), dv = new THREE.Vector3();
    t1.crossVectors(nC, Uv).normalize(); t2.crossVectors(nC, t1);
    const s = sp_RM * 3.4 * (1 - Math.exp(-tau / 1.4));
    for (let i = 0; i < F.sprayDir.length; i++) {
      const [x, y, z, crown, r] = F.sprayDir[i], v = F.spraySpd[i];
      if (crown) { const a = Math.atan2(y, x); dv.copy(t1).multiplyScalar(Math.cos(a)).addScaledVector(t2, Math.sin(a)).addScaledVector(nC, 0.35 + 0.3 * r); }
      else { dv.set(x, y, z).normalize(); if (dv.dot(nC) < 0) dv.addScaledVector(nC, -2 * dv.dot(nC)); dv.addScaledVector(nC, 0.6); }
      dv.normalize().multiplyScalar(s * v);
      P.setXYZ(i, CP.x + dv.x, CP.y + dv.y, CP.z + dv.z);
    }
    P.needsUpdate = true; F.spray.position.copy(cam);
  }
  const gl = tau > 0 ? Math.exp(-tau / 1.2) : (st > 466.5 ? 0.12 + 0.05 * Math.sin(st * 9) : 0) * (st > 455 ? 1 : 0);
  F.glow.visible = gl > 0.003; F.glow.position.copy(CP).add(cam); F.glow.scale.setScalar(sp_RM * (tau > 0 ? 3 + 6 * (1 - Math.exp(-tau / 0.8)) : 1.2)); F.glow.material.opacity = Math.min(1, gl);
  F.cp = CP.clone().add(cam);
  // ---- the barrel: from 468 the lip throws over and closes around you
  const tb = F.tube, tOn = st > 467.9;
  tb.m.visible = tb.a.visible = tOn; F.inTube = ss(470, 482, st);
  if (tOn) {
    const close = ss(468, 482, st), psS = -112 * DEG, psE0 = lerp(70, 248, close) * DEG, L = sp_TUBE_L;
    const { NU, NV } = tb.geo.userData, P = tb.geo.attributes.position, Nn = tb.geo.attributes.normal;
    for (let i = 0; i <= NU; i++) {
      const u = i / NU, a = lerp(-2.5 * r0, L, u), psE = psE0 - 38 * DEG * u * (1 - close);
      for (let j = 0; j <= NV; j++) {
        const v = j / NV, ps = lerp(psS, psE, v), r = r0 * (1 - 0.1 * v * (1 - close)) * (1 + 0.28 * u * u) * (1 + 0.03 * Math.sin(u * 17 + 2 * ps - st * 1.3));
        const cx = Math.cos(ps), cy = Math.sin(ps), id = i * (NV + 1) + j;
        P.setXYZ(id, O.x + A.x * a + (Sv.x * cx + Uv.x * cy) * r, O.y + A.y * a + (Sv.y * cx + Uv.y * cy) * r, O.z + A.z * a + (Sv.z * cx + Uv.z * cy) * r);
        Nn.setXYZ(id, Sv.x * cx + Uv.x * cy, Sv.y * cx + Uv.y * cy, Sv.z * cx + Uv.z * cy);
      }
    }
    P.needsUpdate = Nn.needsUpdate = true; tb.m.position.copy(cam); tb.a.position.copy(cam);
    tb.U.uAlpha.value = ss(468, 470, st);
  }
}
// 2D over the frame: the flash of the hit
function spPost(S, st) {
  const tau = st - 468; if (tau < 0 || tau > 3 || !S.fx.cp) return;
  const g = g3(), p = S.fx.cp.clone().project(g.cam), x = (p.x * 0.5 + 0.5) * W, y = (-p.y * 0.5 + 0.5) * H;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  const a = Math.exp(-tau / 0.6), gr = ctx.createRadialGradient(x, y, 0, x, y, W * 0.7);
  gr.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); gr.addColorStop(0.08, `rgba(225,250,255,${0.6 * a})`); gr.addColorStop(0.4, `rgba(150,235,230,${0.18 * a})`); gr.addColorStop(1, 'rgba(120,220,220,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(255,255,255,${0.85 * Math.exp(-tau / 0.16)})`; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

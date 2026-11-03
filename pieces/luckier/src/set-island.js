// =====================================================================
//  SET ISLAND — "alone, the luckiest thing alive". A small island at sea inside a raging storm, except for one perfect
//  circle of sunshine that falls through a hole in the clouds onto the island, his boat and him. Fish jump into the boat.
//  Island centred at the origin, sea level y = 0, the sun beam leans along isL (cylinder of radius isRS on the sea).
// =====================================================================
const isL = new THREE.Vector3(-0.16, 1.15, -0.8).normalize();  // towards the sun (behind the hero camera)
const isK = [isL.x / isL.y, isL.z / isL.y];                  // xz shift of the beam per metre of height
const isRS = 12.5;                                             // radius of the sunny circle (on the sea and through the clouds)
const isDECK = [30, 64];                                     // storm deck: cloud base / tops
let isS = null;
const isBYAW = -0.64;                                        // boat heading (bow towards +x/+z, into the water)

// ---------- shared GLSL: noise, island height, storm sky
const isGLSL = `
uniform float uTime, uFlash, uAbove, uRS, uStorm, uNight, uCalmA, uFair, uCloudA, uRainA;
uniform vec3 uL, uCam, uZen, uHorC, uSunC, uSeaL;
uniform vec2 uK;
uniform vec4 uBolt[4];   // xyz glow centre, w intensity
float isSs(float a, float b, float x){ float t = clamp((x-a)/(b-a), 0., 1.); return t*t*(3.-2.*t); }
float isH2(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float isN2(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f); return mix(mix(isH2(i),isH2(i+vec2(1.,0.)),u.x), mix(isH2(i+vec2(0.,1.)),isH2(i+vec2(1.,1.)),u.x), u.y); }
float isFbm(vec2 p){ float a=0.5,s=0.; for(int i=0;i<5;i++){ s+=a*isN2(p); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(1.7,9.2); a*=0.5;} return s; }
float isIsle(vec2 p){ float r=length(p), th=atan(p.y,p.x);
  float r0 = 8.2 + 0.9*sin(2.*th+0.7) + 0.5*sin(3.*th+2.1) + 0.3*sin(5.*th+0.4);
  float s = r/r0; vec2 d = p-vec2(-2.,-2.);
  return max(1.35*(1.-s*s) + 0.35*exp(-dot(d,d)/8.), -4.0); }
float isSunAt(vec3 p, float soft){ return 1.-isSs(uRS-soft, uRS+soft, length(p.xz - uK*max(p.y,0.))); }
vec3 isFlashAt(vec3 p){ vec3 c=vec3(0.); for(int i=0;i<4;i++){ float d=length(p-uBolt[i].xyz); c += uBolt[i].w*exp(-d/55.)*vec3(0.75,0.82,1.0); } return c; }
vec3 isStormSky(vec3 dir){
  float e = dir.y;
  vec3 hor = vec3(0.060,0.072,0.080), up = vec3(0.022,0.027,0.032);
  vec3 c = mix(hor, up, isSs(0.0, 0.5, e));
  c = mix(c, vec3(0.035,0.042,0.046), isSs(0.0,-0.3,e));
  return c;
}
vec3 isClearSky(vec3 d){ float e = max(d.y, 0.); vec3 c = mix(uHorC, uZen, pow(isSs(0., 0.75, e), 0.7));
  float sd = max(dot(d, uL), 0.); c += uSunC*(pow(sd, 6.)*0.22 + pow(sd, 48.)*0.5) * (1. - uNight*0.85);
  return mix(c, uHorC*0.45 + uZen*0.2, isSs(0.0, -0.25, d.y)); }
vec3 isSkyCol(vec3 d){ return mix(isClearSky(d), isStormSky(d), uStorm); }`;

// ---------- small helpers
function isMat(o) { return new THREE.MeshStandardMaterial(o); }
function isNoise2(seed) {   // smooth value noise in JS (same feel as the GLSL one)
  const R = RNG('isn', seed), N = 256, tab = new Float32Array(N * N); for (let i = 0; i < N * N; i++) tab[i] = R.f();
  const at = (i, j) => tab[((i & 255) * N + (j & 255))];
  return (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(at(i, j), at(i + 1, j), ux), lerp(at(i, j + 1), at(i + 1, j + 1), ux), uy); };
}
function isIsle(x, z) {
  const r = Math.hypot(x, z), th = Math.atan2(z, x);
  const r0 = 8.2 + 0.9 * Math.sin(2 * th + 0.7) + 0.5 * Math.sin(3 * th + 2.1) + 0.3 * Math.sin(5 * th + 0.4);
  const s = r / r0, dx = x + 2, dz = z + 2;
  return Math.max(1.35 * (1 - s * s) + 0.35 * Math.exp(-(dx * dx + dz * dz) / 8), -4);
}
const isN = isNoise2('sand');
function isGround(x, z) { return isIsle(x, z) + 0.05 * (isN(x * 0.9, z * 0.9) - 0.5) + 0.018 * Math.sin(x * 3.1 + Math.sin(z * 1.3) * 2) ; }

// ---------- textures
function isTexSand() {
  return g3Tex((x, w) => {
    const R = RNG('sandtex'); x.fillStyle = '#d9cbb0'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 26000; k++) { const v = R.r(150, 255); x.fillStyle = `rgba(${v},${v * 0.93 | 0},${v * 0.8 | 0},${R.r(0.15, 0.5)})`; x.fillRect(R.r(0, w), R.r(0, w), R.r(1, 2.4), R.r(1, 2.4)); }
    for (let k = 0; k < 2200; k++) { x.fillStyle = `rgba(${R.i(60, 120)},${R.i(50, 90)},${R.i(30, 60)},${R.r(0.2, 0.5)})`; x.fillRect(R.r(0, w), R.r(0, w), 1.5, 1.5); }
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(255,250,240,${R.r(0.4, 0.8)})`; x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), R.r(1.5, 4), R.r(1, 2.5), R.r(0, 3), 0, TAU); x.fill(); }   // shell bits
  }, 512, 512);
}
function isTexSandBump() {
  return g3Tex((x, w) => {
    const R = RNG('sandbump'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w);
    for (let i = 0; i < w; i += 2) for (let j = 0; j < w; j += 2) { const v = 128 + 40 * Math.sin((j + 9 * Math.sin(i * 0.05) + 6 * Math.sin(i * 0.013)) * 0.19); x.fillStyle = `rgb(${v | 0},${v | 0},${v | 0})`; x.fillRect(i, j, 2, 2); }
    for (let k = 0; k < 30000; k++) { const v = R.i(0, 255); x.fillStyle = `rgba(${v},${v},${v},0.5)`; x.fillRect(R.r(0, w), R.r(0, w), 1.5, 1.5); }
  }, 512, 512, false);
}
function isTexWood(seed, base, plank) {   // grain along u; plank = number of strake seams across v (0 = plain board)
  return g3Tex((x, w, h) => {
    const R = RNG('wood', seed); x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 140; k++) {
      const y0 = R.r(0, h), a = R.r(0.5, 3), f = R.r(0.004, 0.02), ph = R.r(0, 6), dark = R.f() < 0.6;
      x.strokeStyle = dark ? `rgba(70,38,18,${R.r(0.08, 0.28)})` : `rgba(255,220,170,${R.r(0.05, 0.16)})`; x.lineWidth = R.r(0.6, 2.2);
      x.beginPath(); for (let i = 0; i <= w; i += 8) { const y = y0 + a * Math.sin(i * f + ph) + 1.5 * Math.sin(i * f * 3.1 + ph); i ? x.lineTo(i, y) : x.moveTo(i, y); } x.stroke();
    }
    for (let k = 0; k < 5; k++) { const cx = R.r(0, w), cy = R.r(0, h); for (let r = 9; r > 1; r -= 1.6) { x.strokeStyle = `rgba(60,30,12,${0.25})`; x.lineWidth = 1; x.beginPath(); x.ellipse(cx, cy, r * 2.2, r, 0, 0, TAU); x.stroke(); } }
    for (let k = 0; k < 6000; k++) { x.fillStyle = `rgba(40,20,8,${R.r(0, 0.08)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 6), 1); }
    if (plank) for (let p = 1; p < plank; p++) {
      const y = p / plank * h, gr = x.createLinearGradient(0, y - h / plank, 0, y);
      gr.addColorStop(0, 'rgba(255,230,190,0.10)'); gr.addColorStop(0.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,18,6,0.35)');
      x.fillStyle = gr; x.fillRect(0, y - h / plank, w, h / plank); x.fillStyle = 'rgba(35,15,5,0.85)'; x.fillRect(0, y - 1.5, w, 3);
      for (let i = 12; i < w; i += 64) { x.fillStyle = 'rgba(50,40,35,0.7)'; x.beginPath(); x.arc(i + R.n(4), y - 6, 1.8, 0, TAU); x.fill(); }   // rivets
    }
  }, 1024, 512);
}

// ---------- the sea
function isSea(U) {
  const NR = 300, NS = 640, pos = [], idx = [];
  for (let i = 0; i <= NR; i++) { const r = 2200 * Math.pow(i / NR, 2.6); for (let j = 0; j < NS; j++) { const a = j / NS * TAU; pos.push(r * Math.cos(a), 0, r * Math.sin(a)); } }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const a = i * NS + j, b = i * NS + (j + 1) % NS, c = a + NS, d = b + NS; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  const m = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: true,
    vertexShader: isGLSL + `
      varying vec3 vP; varying vec3 vN; varying float vCrest;
      float isAmp(vec2 p){ float r=length(p); return max(mix(0.05, 1.0, isSs(uRS-4., uRS+35., r)), uCalmA*isSs(9., 40., r)) * (1. - 0.6*isSs(400.,1500.,r)); }
      vec3 isWave(vec2 p, out float crest){
        float A = isAmp(p); vec3 o = vec3(p.x, 0., p.y); crest = 0.;
        for(int i=0;i<7;i++){ float fi=float(i);
          float ang = 0.35 + fi*0.83 + sin(fi*3.1)*0.4; vec2 d = vec2(cos(ang), sin(ang));
          float lam = 34.0/(1.0+fi*0.55); float k = 6.2832/lam; float w = sqrt(9.8*k);
          float a = A*0.5*lam/34.0*(i==0?1.1:0.8); float q = 0.55/(k*a*7.0+0.001);
          float ph = k*dot(d,p) - w*uTime + fi*1.7;
          o.xz += q*a*d*cos(ph); o.y += a*sin(ph); crest += a*sin(ph);
        }
        float n = isN2(p*0.08 + vec2(uTime*0.05, 0.)); o.y += A*0.35*(n-0.5);
        return o; }
      void main(){
        vec2 p = position.xz; float cr, c1, c2; float e = 0.25 + length(p)*0.004;
        vec3 P = isWave(p, cr), Px = isWave(p+vec2(e,0.), c1), Pz = isWave(p+vec2(0.,e), c2);
        vN = normalize(cross(Pz-P, Px-P)); vP = P; vCrest = cr / max(isAmp(p), 0.05);
        gl_Position = projectionMatrix * viewMatrix * vec4(P,1.);
      }`,
    fragmentShader: isGLSL + `
      varying vec3 vP; varying vec3 vN; varying float vCrest;
      vec2 isGradN(vec2 p){ float e=0.05; float a=isFbm(p), b=isFbm(p+vec2(e,0.)), c=isFbm(p+vec2(0.,e)); return vec2(b-a,c-a)/e; }
      float isRipple(vec2 p, float t){   // rain rings: one ring per cell
        vec2 c = floor(p), f = fract(p)-0.5; float h = isH2(c), ph = fract(t*1.3 + h*7.);
        vec2 o = vec2(isH2(c+3.1), isH2(c+7.7))-0.5; float d = length(f - o*0.5);
        return sin(clamp((d - ph*0.45)*40., -3.1416, 3.1416)) * (1.-ph) * isSs(0.5,0.3,d);
      }
      void main(){
        vec3 p = vP; float dist = length(p - uCam);
        float sun = isSunAt(vec3(p.x,0.,p.z), 1.2);
        float halo = exp(-max(length(p.xz)-uRS,0.)/7.) * (1.-sun);
        vec2 g = isGradN(p.xz*0.35 + vec2(uTime*0.15, uTime*0.07))*0.16 + isGradN(p.xz*1.3 - vec2(uTime*0.25, -uTime*0.1))*0.09 + isGradN(p.xz*4.1 + vec2(uTime*0.5, 0.))*0.04;
        float storm = 1.-sun; float fade = exp(-dist/90.);
        g *= mix(0.9, 1.6, storm) * fade * fade;
        float rr = 0.; if (storm > 0.01 && dist < 40.) { rr = isRipple(p.xz*2.2, uTime) + isRipple(p.xz*2.2 + 17.3, uTime + 0.5); rr *= storm * (1.-dist/40.); }
        vec3 N = normalize(vN + vec3(g.x + rr*0.25, 0., g.y + rr*0.25));
        vec3 V = normalize(uCam - p); float ndv = max(dot(N,V), 0.);
        float fres = 0.02 + 0.98*pow(1.-ndv, 5.);
        vec3 R = reflect(-V, N); R.y = abs(R.y);
        float depth = max(p.y - isIsle(p.xz), 0.);
        // reflected sky: the storm ceiling, warm light from the sun hole inside the circle
        vec3 refl = isSkyCol(R) * 1.15 + vec3(0.30,0.25,0.18)*sun*0.6*uStorm;
        // body colour
        float sh = exp(-depth*0.9);
        vec3 sunBody = mix(vec3(0.0,0.07,0.13), vec3(0.07,0.38,0.42), exp(-depth*0.45));
        sunBody = mix(sunBody, vec3(0.32,0.62,0.56), exp(-depth*1.6)*0.8);
        sunBody = mix(sunBody, vec3(0.70,0.80,0.62), exp(-depth*5.)*0.6);
        float cau = pow(isN2(p.xz*2.3 + vec2(uTime*0.4, 0.)) * isN2(p.xz*1.7 - vec2(0., uTime*0.3)) * 2.2, 3.);
        sunBody += vec3(0.5,0.6,0.4) * cau * exp(-depth*0.9) * 0.35;
        vec3 stBody = mix(vec3(0.010,0.034,0.042), vec3(0.04,0.10,0.10), sh);
        float lit = 0.55 + 0.45*max(dot(N, uL), 0.);
        vec3 body = mix(stBody, sunBody*lit*1.1*uSeaL, sun) + vec3(0.02,0.05,0.05)*halo;
        // subsurface glow in the wave crests (sunlit)
        body += vec3(0.05,0.30,0.26) * sun * isSs(0.2, 1.0, vCrest) * 0.6 * uSeaL;
        vec3 col = mix(body, refl, fres*mix(0.7,1.0,storm));
        // sun glints
        float sp = pow(max(dot(R, uL), 0.), 260.); col += uSunC * sp * 9. * sun;
        col += uSunC * pow(max(dot(R, uL), 0.), 25.) * 0.25 * sun * (1. + uNight*3.);
        // foam: storm crests + shore
        float fn = isFbm(p.xz*0.9 + vec2(uTime*0.2, 0.)) ;
        float crestF = isSs(0.55, 1.05, vCrest + (fn-0.5)*0.9) * isSs(uRS, uRS+20., length(p.xz));
        float lap = sin(depth*30. - uTime*2.2 + fn*6.)*0.5+0.5;
        float shoreF = isSs(0.22, 0.0, depth + (fn-0.5)*0.12) * (0.55 + 0.45*lap) + isSs(0.05, 0.0, depth)*0.5;
        float fw = 0.15 + dist*0.004; float foam = clamp(crestF*isSs(0.52-fw, 0.52+fw, fn+0.2)*(0.55+0.45*exp(-dist/120.)) + shoreF, 0., 1.);
        vec3 foamC = mix(vec3(0.20,0.23,0.25), vec3(0.95,0.95,0.9)*(0.75+0.25*max(dot(N,uL),0.))*max(uSeaL, vec3(0.07)), sun);
        col = mix(col, foamC, foam*0.9);
        // lightning
        vec3 fl = isFlashAt(p); col += fl*(0.02 + fres*0.12);
        for(int i=0;i<4;i++){ vec3 bd = normalize(uBolt[i].xyz - p); col += uBolt[i].w * vec3(0.8,0.85,1.)*pow(max(dot(R,bd),0.),80.)*0.5; }
        // haze / rain fog
        float fogK = 1.-exp(-dist*mix(0.0022, 0.009, storm));
        vec3 fogC = isSkyCol(normalize(p-uCam)) + uFlash*vec3(0.05,0.06,0.08);
        col = mix(col, fogC, fogK);
        gl_FragColor = vec4(col, isSs(0.0, 0.55, depth) * 0.85 + 0.15*isSs(0.,0.08,depth));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(g, m); mesh.renderOrder = 1; mesh.frustumCulled = false;
  return mesh;
}

// ---------- the sky dome
function isSky(U) {
  const m = new THREE.ShaderMaterial({
    uniforms: U, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: isGLSL + `varying vec3 vW;
      void main(){
        vec3 d = normalize(vW - uCam); vec3 c = isSkyCol(d);
        // looking up through the hole: blue sky and the sun
        if (uAbove < 0.5 && d.y > 0.02) {
          float s = (${isDECK[1].toFixed(1)} - uCam.y)/d.y; vec3 q = uCam + d*s; float hole = isSunAt(q, 3.) * uStorm;
          vec3 blue = mix(vec3(0.25,0.5,0.85), vec3(0.6,0.75,0.9), 1.-d.y);
          c = mix(c, blue, hole);
        }
        if (uAbove > 0.5) { c = mix(vec3(0.55,0.68,0.82), vec3(0.22,0.42,0.75), isSs(0.,0.6,d.y)); }
        float sdk = max(dot(d, uL), 0.);
        c += isSs(0.99985, 0.99992, sdk)*uSunC*mix(3.5, 1.6, uNight) + pow(sdk, 400.)*vec3(4.,3.5,2.6)*(1.-uNight) + pow(sdk,12.)*vec3(0.3,0.25,0.15)*uAbove;
        if (uNight > 0.01 && d.y > -0.02) {   // stars + a faint milky way
          vec3 q = d*260.; vec3 id = floor(q); float h = fract(sin(dot(id, vec3(12.9898,78.233,37.719)))*43758.5453);
          vec3 f = fract(q) - 0.5 - (vec3(fract(h*13.1), fract(h*27.7), fract(h*51.3)) - 0.5)*0.5;
          float st = step(0.958, h) * isSs(0.22, 0.0, length(f)) * (0.35 + 2.2*pow(fract(h*91.3), 3.)) * (0.75 + 0.25*sin(uTime*3. + h*60.));
          vec3 nM = normalize(vec3(0.45, 0.35, -0.82)); float band = exp(-pow(dot(d, nM)/0.2, 2.));
          float mw = isFbm(vec2(atan(d.z, d.x)*4., d.y*9.)) * band;
          c += uNight * (st*mix(vec3(0.8,0.88,1.0), vec3(1.,0.9,0.75), fract(h*7.)) * 1.6 + mw*vec3(0.05,0.055,0.08)*1.4 + band*vec3(0.01,0.012,0.02)) * isSs(-0.02, 0.12, d.y);
        }
        c += uFlash*vec3(0.05,0.06,0.09)*(0.5+0.5*d.y);
        gl_FragColor = vec4(c,1.);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), m); s.renderOrder = -10; s.frustumCulled = false;
  return s;
}

// ---------- the island
function isIsland() {
  const grp = new THREE.Group();
  const NR = 110, NS = 260, pos = [], col = [], uv = [], idx = [];
  const dry = lin('#ead6ae'), warm = lin('#e2c494'), wet = lin('#a88d64'), under = lin('#7d8a6a');
  for (let i = 0; i <= NR; i++) {
    const rr = 15 * Math.pow(i / NR, 1.15);
    for (let j = 0; j < NS; j++) {
      const a = j / NS * TAU, x = rr * Math.cos(a), z = rr * Math.sin(a), y = isGround(x, z);
      pos.push(x, y, z); uv.push(x / 2.2, z / 2.2);
      let c = dry.clone().lerp(warm, clamp(isN(x * 0.3 + 9, z * 0.3) * 1.4 - 0.3));
      c.lerp(wet, ss(0.32, 0.06, y)); c.lerp(under, ss(0.0, -0.6, y) * 0.8);
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const a = i * NS + j, b = i * NS + (j + 1) % NS, c = a + NS, d = b + NS; if (i === 0) { idx.push(a, d, c); continue; } idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const map = isTexSand(), bump = isTexSandBump(); [map, bump].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  const sand = new THREE.Mesh(g, isMat({ color: 0xffffff, vertexColors: true, map, bumpMap: bump, bumpScale: 0.012, roughness: 0.95 }));
  sand.receiveShadow = true; grp.add(sand);
  return grp;
}

// ---------- palm tree
function isPalm(seed, base, height, lean, yaw) {
  const R = RNG('palm', seed), grp = new THREE.Group();
  grp.position.copy(base); grp.rotation.y = yaw;
  // trunk: curved, ringed, tapering
  const N = 60, pts = []; for (let i = 0; i <= N; i++) { const s = i / N; pts.push(V3(lean * s * s * height * 0.55, s * height, 0)); }
  const curve = new THREE.CatmullRomCurve3(pts), tube = new THREE.TubeGeometry(curve, N * 2, 1, 14, false);
  const P = tube.attributes.position, Nn = tube.attributes.normal, uvA = tube.attributes.uv;
  for (let v = 0; v < P.count; v++) {
    const s = uvA.getX(v), c = curve.getPointAt(Math.min(1, s)), rad = lerp(0.22, 0.13, s) * (1 + 0.12 * Math.pow(Math.abs(Math.sin(s * height * 4.2 * Math.PI)), 0.5)) + (s < 0.05 ? (0.05 - s) * 2.4 : 0);
    P.setXYZ(v, c.x + Nn.getX(v) * rad, c.y + Nn.getY(v) * rad, c.z + Nn.getZ(v) * rad);
  }
  tube.computeVertexNormals();
  const bark = g3Tex((x, w, h) => {
    const Rb = RNG('bark'); x.fillStyle = '#8a7155'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 64; i++) { const y = i / 64 * h; const gr = x.createLinearGradient(0, y, 0, y + h / 64); gr.addColorStop(0, '#5e4a36'); gr.addColorStop(0.35, '#a08566'); gr.addColorStop(1, '#7b6248'); x.fillStyle = gr; x.fillRect(0, y, w, h / 64); }
    for (let k = 0; k < 4000; k++) { x.fillStyle = `rgba(${Rb.i(40, 90)},${Rb.i(30, 60)},${Rb.i(20, 40)},${Rb.r(0.1, 0.4)})`; x.fillRect(Rb.r(0, w), Rb.r(0, h), Rb.r(1, 3), Rb.r(4, 12)); }
  }, 128, 1024);
  bark.wrapS = bark.wrapT = THREE.RepeatWrapping; bark.repeat.set(3, 1);
  const trunk = new THREE.Mesh(tube, isMat({ map: bark, bumpMap: bark, bumpScale: 0.02, roughness: 0.9 })); trunk.castShadow = trunk.receiveShadow = true; grp.add(trunk);
  // crown
  const top = curve.getPointAt(1), crown = new THREE.Group(); crown.position.copy(top); grp.add(crown);
  const leafTex = g3Tex((x, w, h) => {   // one frond: midrib along u, leaflets out to both sides
    x.clearRect(0, 0, w, h); const Rl = RNG('leaf');
    for (let i = 0; i < 70; i++) {
      const u = 0.04 + i / 70 * 0.95, xx = u * w, len = h * 0.48 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (0.85 + Rl.r(0, 0.2));
      [1, -1].forEach((sd) => {
        const gr = x.createLinearGradient(xx, h / 2, xx + w * 0.06, h / 2 + sd * len); gr.addColorStop(0, '#4f7d2a'); gr.addColorStop(1, '#8fb648');
        x.strokeStyle = gr; x.lineWidth = Rl.r(5, 8); x.lineCap = 'round';
        x.beginPath(); x.moveTo(xx, h / 2); x.quadraticCurveTo(xx + w * 0.02, h / 2 + sd * len * 0.5, xx + w * 0.07, h / 2 + sd * len); x.stroke();
      });
    }
    x.strokeStyle = '#a8b060'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w, h / 2); x.stroke();
  }, 1024, 256);
  const leafMat = isMat({ map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 });
  const fronds = [];
  const nF = 11;
  for (let f = 0; f < nF; f++) {
    const az = f / nF * TAU + R.n(0.25), up = R.r(-0.15, 0.55), L = R.r(2.3, 3.0), droop = R.r(1.1, 1.8);
    const SEG = 24, W = 2, pP = [], pU = [], pI = [];
    for (let i = 0; i <= SEG; i++) {
      const s = i / SEG, xx = s * L, yy = Math.sin(up) * xx - droop * s * s * L * 0.45, wid = 0.55 * L * 0.42;
      for (let k = 0; k <= W; k++) { const q = k / W * 2 - 1; pP.push(xx, yy - Math.abs(q) * wid * 0.25 * (0.4 + s), q * wid); pU.push(s, k / W); }   // V-folded along the midrib
    }
    for (let i = 0; i < SEG; i++) for (let k = 0; k < W; k++) { const a = i * (W + 1) + k, b = a + 1, c = a + W + 1, d = c + 1; pI.push(a, c, b, b, c, d); }
    const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.Float32BufferAttribute(pP, 3)); fg.setAttribute('uv', new THREE.Float32BufferAttribute(pU, 2)); fg.setIndex(pI); fg.computeVertexNormals();
    const fm = new THREE.Mesh(fg, leafMat); fm.castShadow = true; const piv = new THREE.Group(); piv.rotation.set(0, az, 0); piv.add(fm); crown.add(piv);
    fronds.push({ piv, fm, az, ph: R.r(0, 6) });
  }
  const nutMat = isMat({ color: lin('#5b4022'), roughness: 0.5 });
  for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), nutMat); n.position.set(0.12 * Math.cos(i * 1.7), -0.12, 0.12 * Math.sin(i * 1.7)); n.castShadow = true; crown.add(n); }
  return { grp, crown, fronds, sway: (t, amt) => { crown.rotation.z = Math.sin(t * 0.9 + seed.length) * 0.03 * amt; fronds.forEach((F) => { F.fm.rotation.z = Math.sin(t * 1.7 + F.ph) * 0.05 * amt; F.fm.rotation.x = Math.sin(t * 2.3 + F.ph * 2) * 0.04 * amt; }); } };
}

// ---------- the rowboat
function isBoat() {
  const grp = new THREE.Group(), Lb = 3.3, Bb = 1.32, Db = 0.5;
  const hb = (u) => u < 0.42 ? Bb / 2 * (0.68 + 0.32 * Math.sin(u / 0.42 * Math.PI / 2)) : Bb / 2 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.42) / 0.58, 2.2)));
  const kd = (u) => Db * (u < 0.72 ? 1 : 1 - Math.pow((u - 0.72) / 0.28, 2) * 0.55);
  const sh = (u) => 0.14 * Math.pow(u, 3) + 0.05 * Math.pow(1 - u, 2);
  const hullPt = (u, v, inset) => {   // v in [-1, 1]: port gunwale .. keel .. starboard gunwale
    const av = Math.abs(v), b = Math.max(hb(u) - inset, 0.001), k = kd(u) - inset, top = sh(u);
    const strake = Math.floor(av * 6 - 1e-6) / 6, lap = inset ? 0 : 0.008 * ((av * 6) % 1);   // clinker laps
    return V3((u - 0.5) * Lb, -k + (top + k) * Math.pow(av, 1.6), Math.sign(v) * (b * Math.pow(av, 0.55) + lap));
  };
  const NU = 90, NV = 96;
  const mk = (inset, flip) => {
    const p = [], uvs = [], ix = [];
    for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) { const u = i / NU, v = j / NV * 2 - 1, q = hullPt(u, v, inset); p.push(q.x, q.y, q.z); uvs.push(u * 2.2, Math.abs(v)); }
    for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const a = i * (NV + 1) + j, b = a + 1, c = a + NV + 1, d = c + 1; if (flip) ix.push(a, b, c, b, d, c); else ix.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(ix); g.computeVertexNormals(); return g;
  };
  const outTex = isTexWood('hull', '#b07a48', 6), inTex = isTexWood('inner', '#c99560', 6), board = isTexWood('board', '#c0884f', 0);
  [outTex, inTex, board].forEach((t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
  const outer = new THREE.Mesh(mk(0, false), isMat({ map: outTex, bumpMap: outTex, bumpScale: 0.004, roughness: 0.62 }));
  const inner = new THREE.Mesh(mk(0.03, true), isMat({ map: inTex, bumpMap: inTex, bumpScale: 0.003, roughness: 0.7 }));
  outer.castShadow = outer.receiveShadow = inner.castShadow = inner.receiveShadow = true; grp.add(outer, inner);
  // painted sheer stripe: a thin band just under the gunwale
  const stripe = (side) => { const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push(hullPt(u, side * 0.96, -0.004)); } return new THREE.CatmullRomCurve3(pts); };
  const gunMat = isMat({ map: board, color: lin('#8b5a33'), roughness: 0.55 }), redMat = isMat({ color: lin('#a8352a'), roughness: 0.5 });
  [1, -1].forEach((sd) => {
    const g1 = new THREE.Mesh(new THREE.TubeGeometry(stripe(sd), 80, 0.035, 10, false), gunMat); g1.castShadow = true; grp.add(g1);
    const pts = []; for (let i = 0; i <= 60; i++) pts.push(hullPt(i / 60, sd * 0.9, -0.012)); const g2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.022, 8, false), redMat); g2.scale.set(1, 1, 1); grp.add(g2);
  });
  // transom
  const tsh = new THREE.Shape(); for (let j = 0; j <= 40; j++) { const q = hullPt(0, j / 40 * 2 - 1, 0); j ? tsh.lineTo(q.z, q.y) : tsh.moveTo(q.z, q.y); }
  const tr = new THREE.Mesh(new THREE.ExtrudeGeometry(tsh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 }), isMat({ map: board, roughness: 0.6 }));
  tr.rotation.y = -Math.PI / 2; tr.position.x = -Lb / 2 + 0.035; tr.castShadow = true; grp.add(tr);
  const nameTex = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.font = 'italic bold 92px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineWidth = 10; x.strokeStyle = 'rgba(60,20,10,0.55)'; x.strokeText('Lucky', w / 2, h / 2 + 4); x.fillStyle = '#f4ead8'; x.fillText('Lucky', w / 2, h / 2); }, 512, 128);
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), isMat({ map: nameTex, transparent: true, roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -2 })); nm.rotation.y = -Math.PI / 2; nm.position.set(-Lb / 2 - 0.02, -0.12, 0); grp.add(nm);
  // ribs
  const ribMat = isMat({ map: board, color: lin('#d9a874'), roughness: 0.65 });
  for (let u = 0.12; u < 0.86; u += 0.09) { const pts = []; for (let j = 0; j <= 30; j++) pts.push(hullPt(u, j / 30 * 1.9 - 0.95, 0.04)); const r = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.018, 6, false), ribMat); r.castShadow = r.receiveShadow = true; grp.add(r); }
  // thwarts + floorboards (rounded planks)
  const plank = (len, wid, th) => { const s = new THREE.Shape(), r = Math.min(wid, th) * 0.45; s.moveTo(-wid / 2 + r, -th / 2); s.lineTo(wid / 2 - r, -th / 2); s.quadraticCurveTo(wid / 2, -th / 2, wid / 2, -th / 2 + r); s.lineTo(wid / 2, th / 2 - r); s.quadraticCurveTo(wid / 2, th / 2, wid / 2 - r, th / 2); s.lineTo(-wid / 2 + r, th / 2); s.quadraticCurveTo(-wid / 2, th / 2, -wid / 2, th / 2 - r); s.lineTo(-wid / 2, -th / 2 + r); s.quadraticCurveTo(-wid / 2, -th / 2, -wid / 2 + r, -th / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false, curveSegments: 4 }); g.translate(0, 0, -len / 2); return g; };
  const seatMat = isMat({ map: board, roughness: 0.55 });
  const seats = [];
  [[0.2, 0.26], [0.56, 0.26]].forEach(([u, wd]) => { const y = sh(u) - 0.17, w = (hb(u) - 0.05) * 2; const m = new THREE.Mesh(plank(w, wd, 0.045), seatMat); m.position.set((u - 0.5) * Lb, y, 0); m.castShadow = m.receiveShadow = true; grp.add(m); seats.push(V3((u - 0.5) * Lb, y + 0.0225, 0)); });
  for (let k = -2; k <= 2; k++) { const m = new THREE.Mesh(plank(Lb * 0.66, 0.11, 0.025), seatMat); m.rotation.y = Math.PI / 2; m.position.set(-0.12, -Db + 0.07 + Math.abs(k) * 0.035, k * 0.13); m.receiveShadow = true; grp.add(m); }
  // oars
  const oarMat = isMat({ map: board, color: lin('#e0b07c'), roughness: 0.5 });
  const oar = () => { const o = new THREE.Group(); const sft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 2.2, 12), oarMat); sft.rotation.z = Math.PI / 2; const bl = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), oarMat); bl.scale.set(0.32, 0.012, 0.085); bl.position.x = 1.2; const gr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 12), isMat({ color: lin('#3b2a1e'), roughness: 0.8 })); gr.rotation.z = Math.PI / 2; gr.position.x = -1.0; o.add(sft, bl, gr); o.traverse((m) => { m.castShadow = true; }); return o; };
  const o1 = oar(); o1.position.set(0.1, sh(0.5) - 0.06, 0.48); o1.rotation.set(0.0, 0.18, 0.05); grp.add(o1);
  const o2 = oar(); o2.position.set(0.35, -Db + 0.18, -0.3); o2.rotation.set(0.3, -0.1, 0.06); grp.add(o2);
  return { grp, seats, Lb, Bb, Db, hullPt, sh };
}

// ---------- fish
function isFishGeo() {   // a mackerel: slim, pointed snout, thin tail stock, wavy dark bars on the back
  const g = new THREE.SphereGeometry(1, 48, 24); const P = g.attributes.position, col = [];
  const back = lin('#1d4f66'), bar = lin('#0e2733'), side = lin('#a9c6cf'), belly = lin('#f2f4f1');
  for (let i = 0; i < P.count; i++) {
    let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    const s = (x + 1) / 2, prof = Math.pow(Math.sin(Math.PI * clamp(Math.pow(s, 0.85) * 0.97 + 0.02)), 0.85) * (0.35 + 0.65 * Math.pow(s, 0.5));
    y = y * 0.21 * prof + 0.012 * Math.sin(s * Math.PI); z *= 0.105 * prof; x *= 0.5;
    P.setXYZ(i, x, y, z);
    const yy = y / (0.21 * prof + 1e-4);
    let c = belly.clone().lerp(side, ss(-0.35, 0.05, yy)).lerp(back, ss(0.15, 0.5, yy));
    const w = Math.sin(x * 70 + Math.sin(yy * 9) * 1.4); c.lerp(bar, ss(0.25, 0.55, yy) * ss(0.2, 0.7, w) * (s > 0.2 && s < 0.88 ? 0.85 : 0));
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const ts = new THREE.Shape(); ts.moveTo(0.02, 0); ts.quadraticCurveTo(-0.1, 0.04, -0.2, 0.17); ts.quadraticCurveTo(-0.13, 0.03, -0.15, 0); ts.quadraticCurveTo(-0.13, -0.03, -0.2, -0.17); ts.quadraticCurveTo(-0.1, -0.04, 0.02, 0);
  const tail = new THREE.ShapeGeometry(ts, 10); tail.translate(-0.44, 0, 0);
  const ds = new THREE.Shape(); ds.moveTo(0.12, 0); ds.quadraticCurveTo(0.06, 0.09, -0.04, 0.1); ds.lineTo(0.0, 0); const dor = new THREE.ShapeGeometry(ds, 6); dor.translate(0.02, 0.09, 0);
  const ps = new THREE.Shape(); ps.moveTo(0, 0); ps.quadraticCurveTo(-0.05, 0.03, -0.11, 0.015); ps.quadraticCurveTo(-0.06, -0.01, 0, 0); const pec = new THREE.ShapeGeometry(ps, 6);
  return { body: g, tail, dor, pec };
}
function isFish(FG, mat, finMat, eyeMat, scale) {
  const f = new THREE.Group(), b = new THREE.Mesh(FG.body, mat), tp = new THREE.Group(), t = new THREE.Mesh(FG.tail, finMat), d = new THREE.Mesh(FG.dor, finMat);
  tp.position.x = -0.42; t.position.x = 0.42; tp.add(t); f.add(b, tp, d);
  [1, -1].forEach((s) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), FG.irisMat); e.position.set(0.355, 0.03, s * 0.036); e.scale.set(1, 1, 0.6); const pu = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), eyeMat); pu.position.set(0.358, 0.03, s * 0.047); f.add(e, pu);
    const pf = new THREE.Mesh(FG.pec, finMat); pf.position.set(0.24, -0.02, s * 0.05); pf.rotation.set(s * 0.5, s * 0.35, -0.2); f.add(pf); });
  f.scale.setScalar(scale); f.traverse((m) => { m.castShadow = true; }); f.userData.tail = tp;
  return f;
}

// ---------- clouds: one heightfield slab (billowy underside, lumpy tops, a ragged hole along the beam), ray-marched per pixel
//  below the deck the camera sees the churning underside; above it, sunlit tops and the walls of the hole down to the island
function isClouds(U) {
  const glsl = isGLSL + `
    vec2 isSw(vec2 p){ float r = length(p); float a = 2.2*exp(-r/170.) + uTime*0.012*(160./(r+60.)); float c=cos(a), s=sin(a); return mat2(c,-s,s,c)*p; }
    float isF3(vec2 p){ float a=0.5,s=0.; for(int i=0;i<4;i++){ s+=a*isN2(p); p=mat2(1.6,1.2,-1.2,1.6)*p+vec2(3.1,1.7); a*=0.5;} return s; }
    float isLump(vec2 p){ vec2 q = isSw(p); q += 28.*(vec2(isF3(q*0.006), isF3(q*0.006+7.3))-0.5);
      float l = 0.; float a = 0.55; vec2 z = q*0.022;
      for(int i=0;i<4;i++){ float n = isN2(z); l += a*n*n*(3.-2.*n); z = mat2(1.7,1.1,-1.1,1.7)*z + vec2(5.2,1.3); a *= 0.5; }
      return l; }
    float isBase(vec2 p){ return ${(isDECK[0] + 3).toFixed(1)} - 8.*isLump(p*1.7); }
    float isTop(vec2 p){ vec2 q = isSw(p); float b = isN2(q*0.21)*0.6 + isN2(q*0.47+3.)*0.3 + isN2(q*1.1+9.)*0.1; return ${(isDECK[1] - 4).toFixed(1)} + 9.*isLump(p*1.7+41.) + 5.*isF3(q*0.013+7.) + 4.*b*b; }
    float isHoleR(vec3 p){ vec2 q = p.xz - uK*p.y; vec2 cs = q/max(length(q),0.001); return uRS + 2.0 + max(p.y - ${(isDECK[0] + 2).toFixed(1)}, 0.)*0.55 + 4.*isN2(cs*2.3 + vec2(p.y*0.05, 3.)) + 2.*isN2(cs*7. + vec2(9., p.y*0.15)); }
    float isHoleD(vec3 p){ return length(p.xz - uK*p.y) - isHoleR(p); }
    float isDen(vec3 p){ return min(isTop(p.xz) - p.y, isHoleD(p)); }
  `;
  const mk = (y, above) => {
    const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: true, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
      fragmentShader: glsl + `varying vec3 vW;
        void main(){
          vec3 ro = uCam, rd = normalize(vW - uCam); vec3 col; float dist;
          ${above ? `
          // from above: march down through the slab (tops + hole walls)
          float s = (${(isDECK[1] + 6).toFixed(1)} - ro.y)/rd.y; float ds = 1.8; vec3 p = ro + rd*s; bool hit = false; float f = 0.;
          for (int i=0;i<34;i++){ p = ro + rd*s; if (p.y < ${(isDECK[0] - 5).toFixed(1)}) break;
            f = isDen(p);
            if (f > 0.) { hit = true; break; } ds = clamp(-f*0.7, 1.0, 12.); s += ds; }
          if (!hit) discard;
          float s0 = s - ds; for (int k=0;k<4;k++){ float sm = (s0+s)*0.5; vec3 q = ro + rd*sm; float fm = isDen(q); if (fm > 0.) s = sm; else s0 = sm; }
          p = ro + rd*s; dist = s;
          float d0 = isDen(p); vec3 n = -normalize(vec3(isDen(p+vec3(0.7,0.,0.)) - d0, isDen(p+vec3(0.,0.7,0.)) - d0, isDen(p+vec3(0.,0.,0.7)) - d0));
          float depthIn = clamp((isTop(p.xz) - p.y)/22., 0., 1.);
          float sd = max(dot(n, uL), 0.);
          // light reaching the wall: blocked when the sun ray re-enters the deck
          vec3 ps = p + uL*5.; float sh = (isHoleD(ps) > 0. && ps.y < isTop(ps.xz)) ? 0.35 : 1.;
          float cav = clamp((isTop(p.xz) - ${(isDECK[1] - 4).toFixed(1)})/12., 0., 1.);
          vec3 Ls = normalize(vec3(uL.x*2.5 + 0.6, uL.y*0.7, uL.z*2.5));
          float sdt = max(dot(n, Ls), 0.); float wall = isSs(4., -2., isHoleD(p));
          { vec3 q = p + n*0.5; float occ = 0.; for (int k=1;k<=2;k++){ q += Ls*6.; occ = max(occ, clamp((isTop(q.xz) - q.y)/3., 0., 1.)); } sdt *= 1. - occ*0.85; }
          sd = mix(sdt, sd, wall);
          col = vec3(0.88,0.86,0.84)*(sd*0.7*sh) * mix(1.0, 0.4, depthIn) * mix(0.3, 1.0, cav) + vec3(0.05,0.07,0.11)*(0.55 + 0.45*n.y)*mix(1.,0.4,depthIn)*mix(0.3,1.,cav);
          col *= mix(vec3(1.), vec3(2.2,1.6,1.0), wall);
          col *= mix(1.0, 0.75, isSs(250., 900., length(p.xz)));
          for (int i=0;i<4;i++){ float d = length(p.xz - uBolt[i].xz); col += uBolt[i].w*vec3(0.5,0.62,1.0)*(exp(-d/9.)*1.1 + exp(-d/26.)*0.25)*(0.35+0.65*depthIn)*(0.6+0.8*(1.-cav)); }
          col = mix(col, vec3(0.35,0.42,0.52), 1.-exp(-dist/1800.));
          ` : `
          // from below: the billowy underside (a plane with lumpy normals; fine detail fades with distance)
          float s = (${(isDECK[0] + 1).toFixed(1)} - ro.y)/rd.y; vec3 p = ro + rd*s; dist = s;
          if (isHoleD(p) < 0.) discard;
          float e = 0.8 + dist*0.004; float b0 = isBase(p.xz); vec3 n = normalize(vec3(isBase(p.xz+vec2(e,0.)) - b0, -e*0.8, isBase(p.xz+vec2(0.,e)) - b0));
          float rec = clamp((b0 - ${(isDECK[0] - 4).toFixed(1)})/7., 0., 1.);
          float side = 1. - abs(n.y);
          vec2 rq = p.xz - uK*p.y; float rr = length(rq);
          vec3 toW = normalize(vec3(-rq.x, -rr*0.35, -rq.y)), outW = -normalize(vec3(-rq.x, rr*0.6, -rq.y));
          col = vec3(0.040,0.047,0.054) * (0.6 + 0.8*side) * mix(1.25, 0.35, rec);
          col += vec3(0.13,0.15,0.17) * pow(max(dot(n, outW), 0.), 1.5) * mix(1., 0.4, rec) * 0.8;
          col += vec3(0.85,0.58,0.34) * pow(max(dot(n, toW), 0.), 1.2) * exp(-max(rr - uRS, 0.)/26.) * 0.75 * mix(1., 0.5, rec);
          // the hole's golden edge (sun scattering through the rim)
          float hd = isHoleD(p); vec2 toAx = -normalize(p.xz - uK*p.y);
          col += vec3(1.0,0.72,0.42) * exp(-hd/5.) * (0.35 + 0.65*max(dot(n.xz, toAx),0.)) * 1.4;
          col += vec3(0.9,0.6,0.35) * exp(-hd/22.) * 0.08;
          // lightning lights the base from inside
          for (int i=0;i<4;i++){ float d = length(p - uBolt[i].xyz - vec3(0.,14.,0.)); col += uBolt[i].w*vec3(0.55,0.62,0.95)*exp(-d/45.)*(0.6 + 0.8*rec) * 1.6; }
          col += uFlash*vec3(0.04,0.045,0.06);
          col = mix(col, isSkyCol(rd)*1.0 + uFlash*vec3(0.04,0.05,0.07), 1.-exp(-dist/900.));
          `}
          gl_FragColor = vec4(col, 1.);
          #include <tonemapping_fragment>
          #include <encodings_fragment>
        }` });
    const g = new THREE.CircleGeometry(4000, 64); g.rotateX(above ? -Math.PI / 2 : Math.PI / 2);
    const mesh = new THREE.Mesh(g, m); mesh.position.y = y; mesh.renderOrder = 2; mesh.frustumCulled = false; return mesh;
  };
  const below = mk(isDECK[0] - 4.6, false), above = mk(isDECK[1] + 6.1, true); below.material.depthWrite = false; below.renderOrder = 0;
  return { below, above, update: (cam) => { const up = cam.position.y > isDECK[1]; below.visible = !up; above.visible = up; } };
}

function isPuffTex() {
  const T = 256, c = document.createElement('canvas'); c.width = c.height = T * 2; const x = c.getContext('2d'), img = x.createImageData(T * 2, T * 2), n = isNoise2('puff');
  for (let tile = 0; tile < 4; tile++) {
    const R = RNG('puff', tile), blobs = [];
    for (let k = 0; k < 22; k++) { const a = R.r(0, TAU), d = Math.sqrt(R.f()) * 0.28; blobs.push([0.5 + Math.cos(a) * d * 1.15, 0.52 + Math.sin(a) * d * 0.75, R.r(0.10, 0.22) * (1 - d)]); }
    const ox = (tile % 2) * T, oy = Math.floor(tile / 2) * T;
    for (let j = 0; j < T; j++) for (let i = 0; i < T; i++) {
      const u = (i + 0.5) / T, v = (j + 0.5) / T; let h = 0;
      blobs.forEach(([bx, by, br]) => { const dx = u - bx, dy = (v - by) * (v > by ? 1.0 : 1.0), dd = br * br - dx * dx - dy * dy; if (dd > 0) h = Math.max(h, Math.sqrt(dd) / 0.22 + 0.15 * (1 - Math.sqrt(dx * dx + dy * dy) / br)); });
      const no = n(u * 14 + tile * 30, v * 14) * 0.6 + n(u * 37 + tile * 30, v * 37) * 0.4;
      h = h * (0.75 + 0.5 * no);
      const edge = Math.hypot(u - 0.5, v - 0.5) * 2, a = clamp((h - 0.08) * 2.6) * clamp((0.86 - edge) * 5);
      const q = ((oy + j) * T * 2 + ox + i) * 4; img.data[q] = clamp(h) * 255; img.data[q + 1] = no * 255; img.data[q + 2] = 0; img.data[q + 3] = a * 255;
    }
  }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.premultiplyAlpha = false; t.generateMipmaps = true; return t;
}
function isScud(U) {
  const R = RNG('clouds'), list = [], kx = isK[0], kz = isK[1];
  const add = (rh, a, y, size, op, dark) => list.push({ p: V3(kx * y + Math.cos(a) * rh, y, kz * y + Math.sin(a) * rh), size, op, dark, rot: R.r(-0.5, 0.5), tile: R.i(0, 3) });
  for (let i = 0; i < 420; i++) { const f = Math.pow(R.f(), 1.3), rh = isRS + 16 + 480 * f; add(rh, R.r(0, TAU), R.r(17, 31), R.r(14, 30) + rh * 0.07, R.r(0.7, 1), 0); }
  for (let i = 0; i < 60; i++) add(isRS + 4 + R.r(0, 12), R.r(0, TAU), R.r(22, 32), R.r(8, 15), 0.9, 0);   // ragged rim of the hole
  // sun transmittance: march towards the sun through the deck (outside the hole = cloud)
  list.forEach((c) => {
    let d = 0; const p = c.p.clone();
    for (let s = 0; s < 60; s++) { p.addScaledVector(isL, 1.5); if (p.y > isDECK[1] + 3) break; const inHole = Math.hypot(p.x - kx * p.y, p.z - kz * p.y) < isRS + 2; if (!inHole && p.y > isDECK[0] - 2) d += 1.5; }
    c.sun = Math.exp(-d / 5); c.ao = 0.55 + 0.45 * clamp((c.p.y - 17) / 14);
  });
  const n = list.length, geo = new THREE.InstancedBufferGeometry(); geo.copy(new THREE.PlaneGeometry(1, 1)); geo.instanceCount = n;
  const A = { iPos: 3, iMisc: 4, iLit: 4 }, arr = {}; Object.entries(A).forEach(([k, s]) => { arr[k] = new Float32Array(n * s); const at = new THREE.InstancedBufferAttribute(arr[k], s); at.setUsage(THREE.DynamicDrawUsage); geo.setAttribute(k, at); });
  const mat = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uTex: { value: isPuffTex() } }, U), transparent: true, depthWrite: false,
    vertexShader: isGLSL + `attribute vec3 iPos; attribute vec4 iMisc; attribute vec4 iLit;
      varying vec2 vUv; varying vec4 vMisc; varying vec4 vLit; varying float vDist; varying vec3 vW;
      void main(){ vec4 mv = viewMatrix*vec4(iPos,1.); float r = iMisc.x + uTime*0.02*(fract(iMisc.w*7.3)-0.5);
        float c=cos(r), s=sin(r); vec2 q = vec2(c*position.x - s*position.y, s*position.x + c*position.y)*iMisc.y;
        mv.xy += q; vUv = uv; vMisc = vec4(r, iMisc.yzw); vLit = iLit; vDist = -mv.z; vW = iPos; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: isGLSL + `uniform sampler2D uTex; varying vec2 vUv; varying vec4 vMisc; varying vec4 vLit; varying float vDist; varying vec3 vW;
      void main(){
        vec2 tile = vec2(mod(vMisc.z,2.), floor(vMisc.z/2.))*0.5;
        vec2 tuv = tile + (vUv*0.97+0.015)*0.5; vec4 tx = texture2D(uTex, tuv); float a = tx.a*vLit.w;
        if (a < 0.004) discard;
        float e = 1.5/512.;
        float hx = texture2D(uTex, tuv+vec2(e,0.)).r - texture2D(uTex, tuv-vec2(e,0.)).r;
        float hy = texture2D(uTex, tuv+vec2(0.,e)).r - texture2D(uTex, tuv-vec2(0.,e)).r;
        vec3 nv = normalize(vec3(-hx*7., -hy*7., 0.25 + tx.r*0.6)); float c=cos(vMisc.x), s=sin(vMisc.x); nv.xy = vec2(c*nv.x - s*nv.y, s*nv.x + c*nv.y);
        vec3 nw = normalize((vec4(nv,0.)*viewMatrix).xyz);
        float up = nw.y*0.5+0.5;
        vec3 amb = mix(vec3(0.016,0.019,0.023), vec3(0.075,0.085,0.095), up) * vLit.y;
        vec2 rq = vW.xz - uK*vW.y; float rr = length(rq);
        vec3 toW = normalize(vec3(-rq.x, -rr*0.35, -rq.y));
        amb += vec3(0.80,0.66,0.52) * pow(max(dot(nw, toW), 0.), 2.) * exp(-max(rr - uRS, 0.)/16.) * 0.3;
        amb += vec3(0.06,0.07,0.08) * max(dot(nw, -toW), 0.);
        float sd = max(dot(nw, uL), 0.);
        vec3 sunC = vec3(1.0,0.80,0.55)*vLit.x*(sd*1.6 + 0.25) * mix(2.2, 1.6, uAbove);
        vec3 col = vec3(0.82)*(amb + sunC);
        col += vLit.z*vec3(0.55,0.65,1.0)*(0.5 + 1.2*(1.-tx.r));
        vec3 fair = mix(uHorC*0.55 + uZen*0.25, uZen*0.6 + uHorC*0.5 + 0.08, up) + uSunC*(sd*1.25 + 0.15)*(0.55 + 0.45*tx.r);
        col = mix(col, fair, uFair);
        // distance haze into the storm sky
        vec3 dir = normalize(vW - uCam);
        col = mix(col, isSkyCol(dir), 1.-exp(-vDist/mix(900., 2600., uFair)));
        a *= isSs(2., 14., vDist) * uCloudA * mix(1., isSs(30., 70., vDist), uFair);
        gl_FragColor = vec4(col, a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; mesh.renderOrder = 3;
  const order = list.map((_, i) => i), dep = new Float32Array(n), v = V3(0, 0, 0);
  const update = (cam, bolts) => {
    const cp = cam.position, fw = cam.getWorldDirection(V3(0, 0, 0));
    list.forEach((c, i) => { dep[i] = v.copy(c.p).sub(cp).dot(fw); });
    order.sort((a, b) => dep[b] - dep[a]);
    order.forEach((ci, k) => {
      const c = list[ci]; let fl = 0; bolts.forEach((b) => { if (b.I > 0) fl += b.I * Math.exp(-c.p.distanceTo(b.top) / 45) * 0.8; });
      arr.iPos.set([c.p.x, c.p.y, c.p.z], k * 3); arr.iMisc.set([c.rot, c.size, c.tile, ci * 0.13], k * 4); arr.iLit.set([c.sun, c.ao, fl, c.op], k * 4);
    });
    Object.keys(A).forEach((k) => { geo.attributes[k].needsUpdate = true; });
  };
  return { mesh, update, list };
}

// ---------- rain: streaks around the camera (never inside the sun beam), the bright wall of rain at the beam's edge, far curtains
function isRain(U) {
  const N = 14000, R = RNG('rain'), seed = new Float32Array(N * 2 * 3), end = new Float32Array(N * 2), pos = new Float32Array(N * 2 * 3);
  for (let i = 0; i < N; i++) { const s = [R.f(), R.f(), R.f()]; seed.set(s, i * 6); seed.set(s, i * 6 + 3); end[i * 2 + 1] = 1; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3)); g.setAttribute('aEnd', new THREE.BufferAttribute(end, 1));
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false,
    vertexShader: isGLSL + `attribute vec3 aSeed; attribute float aEnd; varying float vA; varying float vEnd;
      void main(){ float B = 46., Hh = 32.; vec2 wind = vec2(-3.5, 1.5); float vy = 13.;
        vec2 xz = mod(aSeed.xz*B + wind*uTime - uCam.xz + B*0.5, B) - B*0.5 + uCam.xz;
        float y = mod(aSeed.y*Hh - vy*uTime, Hh) - 0.5;
        vec3 p = vec3(xz.x, y, xz.y) - vec3(wind.x, -vy, wind.y)*0.045*aEnd;
        float d = length(p - uCam); vA = (1.-isSunAt(p, 0.3)) * isSs(B*0.5, B*0.25, d) * isSs(0.4, 2.0, d) * (0.55 + 0.45*fract(aSeed.x*91.7));
        vEnd = aEnd; gl_Position = projectionMatrix*viewMatrix*vec4(p,1.); }`,
    fragmentShader: isGLSL + `varying float vA; varying float vEnd;
      void main(){ vec3 c = vec3(0.42,0.47,0.52) + uFlash*vec3(0.5,0.55,0.7); gl_FragColor = vec4(c, vA*0.42*(0.35+0.65*vEnd));
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const lines = new THREE.LineSegments(g, m); lines.frustumCulled = false; lines.renderOrder = 7;
  // streak texture (data): vertical streaks
  const streak = g3Tex((x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); const Rs = RNG('streak'); for (let k = 0; k < 900; k++) { const xx = Rs.r(0, w), y = Rs.r(-h, h), l = Rs.r(30, 140); const gr = x.createLinearGradient(0, y, 0, y + l); const a = Rs.r(0.2, 0.9); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.strokeStyle = gr; x.lineWidth = Rs.r(0.7, 2); x.beginPath(); x.moveTo(xx, y); x.lineTo(xx - l * 0.08, y + l); x.stroke(); x.beginPath(); x.moveTo(xx, y + h); x.lineTo(xx - l * 0.08, y + h + l); x.stroke(); } }, 512, 512, false);
  streak.wrapS = streak.wrapT = THREE.RepeatWrapping;
  // the wall of rain on the edge of the sun beam (sheared open cylinder)
  const wg = new THREE.CylinderGeometry(isRS + 0.4, isRS + 0.4, isDECK[0], 160, 8, true); wg.translate(0, isDECK[0] / 2, 0);
  { const P = wg.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i); P.setX(i, P.getX(i) + isK[0] * y); P.setZ(i, P.getZ(i) + isK[1] * y); } }
  const wm = new THREE.ShaderMaterial({ uniforms: Object.assign({ uStreak: { value: streak } }, U), transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vW; varying vec3 vN; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: isGLSL + `uniform sampler2D uStreak; varying vec2 vUv; varying vec3 vW; varying vec3 vN;
      void main(){ vec3 V = normalize(uCam - vW); float graz = 1./max(abs(dot(V, vN)), 0.25);
        float s1 = texture2D(uStreak, vec2(vUv.x*14., vUv.y*2.2 + uTime*1.4)).r, s2 = texture2D(uStreak, vec2(vUv.x*23.+0.3, vUv.y*3.1 + uTime*1.9)).r;
        float a = (s1*0.6+s2*0.5) * isSs(0.0, 0.03, vUv.y) * isSs(1.0, 0.7, vUv.y) * min(graz, 2.0) * 0.3;
        a += (1.-isSs(0.0, 0.14, vUv.y)) * isFbm(vec2(vUv.x*60., vUv.y*8. - uTime*0.4)) * 0.35;
        float d = length(vW - uCam); a *= isSs(1.5, 6., d);
        vec3 c = vec3(1.0,0.92,0.78)*1.3 + uFlash*vec3(0.4,0.45,0.6);
        gl_FragColor = vec4(c, a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const wall = new THREE.Mesh(wg, wm); wall.renderOrder = 6; wall.frustumCulled = false;
  // far curtains: cylindrical billboards
  const cm = new THREE.ShaderMaterial({ uniforms: Object.assign({ uStreak: { value: streak } }, U), transparent: true, depthWrite: false, side: THREE.DoubleSide,
    vertexShader: `varying vec2 vUv; varying vec3 vW; void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: isGLSL + `uniform sampler2D uStreak; varying vec2 vUv; varying vec3 vW;
      void main(){ float n = isFbm(vec2(vUv.x*3. + vW.x*0.01, vUv.y*1.2 + uTime*0.05));
        float s = texture2D(uStreak, vec2(vUv.x*6., vUv.y*1.5 + uTime*0.9)).r;
        float a = (0.35 + 0.65*n) * (0.55+0.45*s) * isSs(0.0, 0.25, vUv.x) * isSs(1.0, 0.75, vUv.x) * isSs(1.0, 0.7, vUv.y) * 0.32 * uRainA;
        vec3 dir = normalize(vW - uCam); vec3 c = isSkyCol(dir)*1.9 + isFlashAt(vW)*0.5;
        gl_FragColor = vec4(c, a);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` });
  const curtains = [], Rc = RNG('curtain');
  for (let i = 0; i < 30; i++) { const a = Rc.r(0, TAU), d = Rc.r(45, 420), w = Rc.r(40, 140), m = new THREE.Mesh(new THREE.PlaneGeometry(w, isDECK[0] + 4), cm); m.position.set(Math.cos(a) * d, (isDECK[0] + 4) / 2 - 2, Math.sin(a) * d); m.renderOrder = 3; m.frustumCulled = false; curtains.push(m); }
  return { lines, wall, curtains, face: (cam) => curtains.forEach((m) => { m.rotation.set(0, Math.atan2(cam.position.x - m.position.x, cam.position.z - m.position.z), 0); }) };
}

// ---------- lightning: jagged channels with branches, drawn as camera-facing glowing ribbons
function isBoltPath(seed, top, bot) {
  const R = RNG('bolt', seed);
  let pts = [top.clone(), bot.clone()];
  for (let lv = 0; lv < 7; lv++) { const np = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], L = a.distanceTo(b), m = a.clone().lerp(b, 0.5).add(V3(R.n(L * 0.13), R.n(L * 0.04), R.n(L * 0.13))); np.push(a, m); } np.push(pts[pts.length - 1]); pts = np; }
  const br = [];
  for (let k = 0; k < 4; k++) { const i0 = R.i(8, Math.floor(pts.length * 0.6)), st = pts[i0], len = top.distanceTo(bot) * R.r(0.15, 0.35); let b = [st.clone(), st.clone().add(V3(R.n(len * 0.8), -len, R.n(len * 0.8)))];
    for (let lv = 0; lv < 5; lv++) { const np = []; for (let i = 0; i < b.length - 1; i++) { const a = b[i], c = b[i + 1], L = a.distanceTo(c); np.push(a, a.clone().lerp(c, 0.5).add(V3(R.n(L * 0.25), R.n(L * 0.08), R.n(L * 0.25)))); } np.push(b[b.length - 1]); b = np; }
    br.push(b); }
  return { main: pts, br };
}
let isNearT = -1e9;   // time of the close strike (set per beat)
let isBoltEv = [[8, 1.92], [12, 7.88], [15, 3.97], [16, 3.93], [17, 3.99], [14, 6.3]];   // scheduled flashes (bolt index, time) for the look frames
function isLightning(U, nearXZ) {
  const MAXV = 30000, pos = new Float32Array(MAXV * 3), uv = new Float32Array(MAXV * 2), col = new Float32Array(MAXV * 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const tex = g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); [[0, 0], [0.2, 0.06], [0.42, 0.45], [0.5, 1], [0.58, 0.45], [0.8, 0.06], [1, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`)); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 64, 4, false);
  const m = new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; mesh.renderOrder = 8;
  const R = RNG('bolts'), defs = [];
  const mkBolt = (x, z, per, ph, near) => { const bot = V3(x, 0, z), top = V3(x + R.n(10), isDECK[0] - 3, z + R.n(10)); defs.push({ top, bot, path: isBoltPath(defs.length, top, bot), per, ph, near: !!near }); };
  // the ring of strikes around the island (world azimuth, distance)
  [[200, 120], [222, 70], [250, 190], [168, 95], [280, 140], [140, 210], [305, 85], [95, 160], [32, 105], [0, 230], [320, 260], [190, 300], [52, 150], [18, 190], [70, 95]].forEach(([az, d], i) => mkBolt(Math.cos(az * DEG) * d, Math.sin(az * DEG) * d, 2.3 + RNG('bp', i).r(0, 2.6), RNG('bp', i).r(0, 5)));
  [[115, 44], [20, 46], [250, 40]].forEach(([az, d]) => mkBolt(Math.cos(az * DEG) * d, Math.sin(az * DEG) * d, 1e9, 0));   // 15-17: close cells, only on schedule
  mkBolt(nearXZ[0], nearXZ[1], 1e9, 0, true);   // the close strike (scheduled)
  const intensity = (b, t) => {
    let dt = b.near ? t - isNearT : ((t + b.ph) % b.per);
    const ev = isBoltEv.find(([k, t0]) => defs[k] === b && t >= t0 && t - t0 < 0.6); if (ev) dt = t - ev[1];
    if (dt < 0 || dt > 0.6) return 0;
    const st = (t0, a, k) => (dt >= t0 ? a * Math.exp(-(dt - t0) / k) : 0);
    return Math.min(1.4, st(0, 1, 0.05) + st(0.1, 0.85, 0.06) + st(0.24, 1.0, 0.09) + st(0.42, 0.4, 0.06));
  };
  const update = (cam, t, force) => {
    let v = 0; const cp = cam.position, side = V3(0, 0, 0), d = V3(0, 0, 0), tc = V3(0, 0, 0);
    const active = defs.map((b) => ({ b, I: force ? force(b, t) ?? intensity(b, t) : intensity(b, t), top: b.top, bot: b.bot }));
    const ribbon = (P, w, c) => {   // a continuous camera-facing strip (mitred: one side vector per point)
      const sides = P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; d.subVectors(b, a); tc.subVectors(cp, p); return V3(0, 0, 0).crossVectors(d, tc).normalize().multiplyScalar(w * (1 + p.distanceTo(cp) * 0.002)); });
      for (let i = 0; i < P.length - 1 && v < MAXV - 6; i++) { const a = P[i], b = P[i + 1], sa = sides[i], sb = sides[i + 1];
        [[a, sa, -1], [a, sa, 1], [b, sb, -1], [a, sa, 1], [b, sb, 1], [b, sb, -1]].forEach(([p, sv, s]) => { pos[v * 3] = p.x + sv.x * s; pos[v * 3 + 1] = p.y + sv.y * s; pos[v * 3 + 2] = p.z + sv.z * s; uv[v * 2] = (s + 1) / 2; uv[v * 2 + 1] = 0.5; col.set(c, v * 3); v++; }); } };
    active.forEach((A) => { if (A.I < 0.05) return; const k = A.I, sc = A.b.near ? 0.6 : 1;
      ribbon(A.b.path.main, 2.2 * sc, [0.16 * k, 0.2 * k, 0.42 * k]); ribbon(A.b.path.main, 0.45 * sc, [1.2 * k, 1.3 * k, 1.7 * k]); ribbon(A.b.path.main, 0.12 * sc, [3 * k, 3 * k, 3 * k]);
      A.b.path.br.forEach((P) => { ribbon(P, 1.6 * sc, [0.15 * k, 0.2 * k, 0.4 * k]); ribbon(P, 0.18 * sc, [1.2 * k, 1.3 * k, 1.6 * k]); }); });
    g.setDrawRange(0, v); g.attributes.position.needsUpdate = g.attributes.uv.needsUpdate = g.attributes.color.needsUpdate = true;
    return active;
  };
  // glow sprite at strike points / cloud base
  return { mesh, update, defs, intensity };
}

// ---------- the sun beam: an analytic volume (ray vs. sheared cylinder), dust streaks
function isShaft(U) {
  const H = isDECK[1] + 4, gg = new THREE.CylinderGeometry(isRS + 0.2, isRS + 0.2, H, 96, 8, true); gg.translate(0, H / 2, 0);
  { const P = gg.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i); P.setX(i, P.getX(i) + isK[0] * y); P.setZ(i, P.getZ(i) + isK[1] * y); } }
  const m = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: isGLSL + `varying vec3 vW;
      void main(){
        vec3 ro = uCam, rd = normalize(vW - uCam);
        vec2 A = ro.xz - uK*ro.y, B = rd.xz - uK*rd.y; float R = uRS;
        bool inside = dot(A,A) < R*R && ro.y > 0. && ro.y < ${H.toFixed(1)};
        if (!inside && !gl_FrontFacing) discard;
        float a = dot(B,B), b = 2.*dot(A,B), c = dot(A,A) - R*R, disc = b*b - 4.*a*c; if (disc < 0.) discard;
        float sq = sqrt(disc), s0 = (-b - sq)/(2.*a), s1 = (-b + sq)/(2.*a);
        float ya = (0. - ro.y)/rd.y, yb = (${H.toFixed(1)} - ro.y)/rd.y; float lo = min(ya,yb), hi = max(ya,yb);
        s0 = max(max(s0, lo), 0.); s1 = min(s1, hi); if (s1 <= s0) discard;
        float acc = 0.; const int NS = 14;
        for (int i=0;i<NS;i++){ float s = mix(s0, s1, (float(i)+0.5)/float(NS)); vec3 p = ro + rd*s; vec2 q = p.xz - uK*p.y;
          float rays = 0.45 + 0.75*isN2(q*0.35 + vec2(0., uTime*0.02)) * isN2(q*0.11 + 3.);
          float edge = isSs(R, R-5., length(q));
          float hgt = isSs(1.0, 9., p.y) * (1. - isSs(${(isDECK[0] + 6).toFixed(1)}, ${(H - 2).toFixed(1)}, p.y)*0.85);
          acc += rays * hgt * edge; }
        acc *= (s1 - s0)/float(NS);
        float view = 1. + 0.7*pow(max(dot(rd, uL), 0.), 6.);
        vec3 col = vec3(1.0,0.80,0.52) * min(acc, 22.) * 0.022 * view * mix(1., 0.35, uAbove);
        gl_FragColor = vec4(col, 1.);
      }` });
  const mesh = new THREE.Mesh(gg, m); mesh.renderOrder = 5; mesh.frustumCulled = false;
  return mesh;
}

// ---------- splashes: droplets (points)
function isSplashes() {
  const MAX = 3000, pos = new Float32Array(MAX * 3), sz = new Float32Array(MAX), al = new Float32Array(MAX);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aA', new THREE.BufferAttribute(al, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uScale: { value: 1 } },
    vertexShader: `attribute float aSize; attribute float aA; varying float vA; uniform float uScale; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = aSize*uScale/(-mv.z); vA = aA; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying float vA; float isSs(float a, float b, float x){ float t = clamp((x-a)/(b-a), 0., 1.); return t*t*(3.-2.*t); } void main(){ vec2 d = gl_PointCoord-0.5; float r = length(d); float a = isSs(0.5, 0.2, r)*vA; vec3 c = mix(vec3(0.85,0.95,1.0), vec3(1.), isSs(0.3,0.,length(d+vec2(0.12,0.12)))); gl_FragColor = vec4(c*1.15, a);
      #include <tonemapping_fragment>
      #include <encodings_fragment>
    }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; pts.renderOrder = 7;
  let n = 0;
  const begin = (cam) => { n = 0; m.uniforms.uScale.value = (1080 / 2) / Math.tan(cam.fov * DEG / 2); };
  const burst = (seed, p0, age, scale, count) => {
    if (age < 0 || age > 1.4) return; const R = RNG('spl', seed);
    for (let i = 0; i < count && n < MAX; i++) { const a = R.r(0, TAU), sp = R.r(0.4, 2.2) * scale, up = R.r(1.5, 4.5) * Math.sqrt(scale), life = R.r(0.5, 1.2); if (age > life) continue;
      pos[n * 3] = p0.x + Math.cos(a) * sp * age; pos[n * 3 + 1] = p0.y + up * age - 4.9 * age * age; pos[n * 3 + 2] = p0.z + Math.sin(a) * sp * age;
      if (pos[n * 3 + 1] < p0.y - 0.05) continue; sz[n] = R.r(0.02, 0.06) * scale; al[n] = 0.9 * (1 - age / life); n++; }
  };
  const dot = (p, size, a) => { if (n >= MAX) return; pos[n * 3] = p.x; pos[n * 3 + 1] = p.y; pos[n * 3 + 2] = p.z; sz[n] = size; al[n] = a; n++; };
  const end = () => { g.setDrawRange(0, n); ['position', 'aSize', 'aA'].forEach((k) => { g.attributes[k].needsUpdate = true; }); };
  return { pts, begin, burst, end, dot };
}


// ---------- set dressing: rocks, starfish, shells, footprints, grass, coconuts, driftwood
function isDressing(scene) {
  const R = RNG('dress'), n3 = isNoise2('rock');
  const rockMat = isMat({ color: 0xffffff, vertexColors: true, roughness: 0.85 });
  const rock = (x, z, sc, sy, yaw) => {
    const g = new THREE.IcosahedronGeometry(1, 5), P = g.attributes.position, col = [];
    for (let i = 0; i < P.count; i++) { const v = V3(P.getX(i), P.getY(i), P.getZ(i)); const d = 1 + 0.22 * (n3(v.x * 1.3 + 5, v.z * 1.3 + v.y) - 0.5) + 0.07 * (n3(v.x * 4, v.y * 4 + v.z * 3) - 0.5); v.multiplyScalar(d); v.y = v.y > 0 ? v.y : v.y * 0.6; P.setXYZ(i, v.x, v.y, v.z);
      const c = lin('#8b8278').lerp(lin('#5e5750'), clamp(0.5 - v.y)).lerp(lin('#a59a8c'), clamp(n3(v.x * 6, v.z * 6) - 0.4)); col.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, rockMat); m.scale.set(sc, sc * sy, sc * R.r(0.7, 1.1)); m.rotation.y = yaw; m.position.set(x, isGround(x, z) - sc * sy * 0.25, z); m.castShadow = m.receiveShadow = true; scene.add(m);
  };
  [[-6.8, 3.9, 0.7, 0.6], [-7.4, 2.8, 0.45, 0.7], [-6.2, 4.9, 0.3, 0.6], [6.9, -2.6, 0.6, 0.55], [7.5, -1.6, 0.35, 0.7], [-1.5, -7.9, 0.55, 0.6], [-0.6, -8.3, 0.3, 0.8], [5.2, 3.6, 0.22, 0.6], [-3.4, 6.9, 0.28, 0.6]].forEach(([x, z, sc, sy]) => rock(x, z, sc, sy, R.r(0, 6)));
  // starfish + shells
  const star = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = i / 10 * TAU + Math.PI / 2, r = i % 2 ? 0.4 : 1; const x = Math.cos(a) * r, y = Math.sin(a) * r; i ? star.lineTo(x, y) : star.moveTo(x, y); }
  const sg = new THREE.ExtrudeGeometry(star, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.16, bevelSegments: 4, curveSegments: 4 }); sg.rotateX(-Math.PI / 2);
  const sm = isMat({ color: lin('#e8714a'), roughness: 0.75 });
  [[4.4, 3.8, 0.4], [3.2, 4.6, 1.9], [-2.6, 5.4, 0.9]].forEach(([x, z, r]) => { const m = new THREE.Mesh(sg, sm); m.scale.setScalar(0.07); m.rotation.y = r; m.position.set(x, isGround(x, z) + 0.004, z); m.castShadow = m.receiveShadow = true; scene.add(m); });
  const shell = new THREE.SphereGeometry(1, 24, 10, 0, TAU, 0, Math.PI / 2); { const P = shell.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i), a = Math.atan2(z, x); const k = 1 + 0.08 * Math.cos(a * 14); P.setXYZ(i, x * k, P.getY(i) * k, z * k * 0.9); } shell.computeVertexNormals(); }
  const shm = [isMat({ color: lin('#f3e3d0'), roughness: 0.4 }), isMat({ color: lin('#f0b9a5'), roughness: 0.4 }), isMat({ color: lin('#e8d6bd'), roughness: 0.4 })];
  for (let i = 0; i < 26; i++) { const a = R.r(0, TAU), rr = R.r(4.5, 7.8), x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (isIsle(x, z) < 0.05) continue; const m = new THREE.Mesh(shell, shm[i % 3]); m.scale.set(0.035, 0.02, 0.035).multiplyScalar(R.r(0.7, 1.4)); m.rotation.set(R.n(0.3), R.r(0, 6), R.n(0.3)); m.position.set(x, isGround(x, z) - 0.004, z); m.castShadow = true; scene.add(m); }
  // footprints from the palm down to the boat
  const fpTex = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const gr = x.createRadialGradient(w / 2, h * 0.36, 2, w / 2, h * 0.4, w * 0.45); gr.addColorStop(0, 'rgba(70,50,30,0.55)'); gr.addColorStop(0.75, 'rgba(90,65,40,0.35)'); gr.addColorStop(1, 'rgba(90,65,40,0)');
    x.fillStyle = gr; x.beginPath(); x.ellipse(w / 2, h * 0.34, w * 0.34, h * 0.26, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(w / 2, h * 0.75, w * 0.26, h * 0.16, 0, 0, TAU); x.fill();
    x.strokeStyle = 'rgba(255,245,225,0.35)'; x.lineWidth = 3; x.beginPath(); x.ellipse(w / 2, h * 0.34, w * 0.37, h * 0.29, 0, Math.PI * 0.9, Math.PI * 2.1); x.stroke(); }, 64, 128);
  const fpMat = isMat({ map: fpTex, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  const a0 = V3(-0.8, 0, -0.2), a1 = V3(1.6, 0, 5.0);
  for (let i = 0; i < 16; i++) { const k = i / 15, p = a0.clone().lerp(a1, k), dir = a1.clone().sub(a0).normalize(), side = V3(-dir.z, 0, dir.x).multiplyScalar(i % 2 ? 0.11 : -0.11);
    p.add(side).add(V3(Math.sin(i * 1.7) * 0.05, 0, 0)); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.28), fpMat); m.rotation.set(-Math.PI / 2, 0, Math.atan2(dir.x, dir.z) + Math.PI, 'YXZ'); m.rotation.set(-Math.PI / 2, 0, -Math.atan2(dir.x, dir.z)); m.position.set(p.x, isGround(p.x, p.z) + 0.006, p.z); m.receiveShadow = true; scene.add(m); }
  // beach grass tufts
  const grassMat = isMat({ color: 0xffffff, vertexColors: true, roughness: 0.7, side: THREE.DoubleSide });
  const tuft = (x, z, sc) => { const pp = [], cc = [], Rt = RNG('tuft', x, z);
    for (let b = 0; b < 22; b++) { const a = Rt.r(0, TAU), lean = Rt.r(0.2, 0.9), hh = Rt.r(0.3, 0.6) * sc, w = 0.018 * sc, bx = Math.cos(a), bz = Math.sin(a), c0 = lin('#6f8a3a'), c1 = lin('#d7c98a');
      const pt = (s) => V3(bx * lean * hh * s * s + Rt.n(0.02), hh * s, bz * lean * hh * s * s); const px = V3(-bz, 0, bx);
      for (let k = 0; k < 4; k++) { const s0 = k / 4, s1 = (k + 1) / 4, p0 = pt(s0), p1 = pt(s1), w0 = w * (1 - s0), w1 = w * (1 - s1);
        const q = [p0.clone().addScaledVector(px, -w0), p0.clone().addScaledVector(px, w0), p1.clone().addScaledVector(px, -w1), p0.clone().addScaledVector(px, w0), p1.clone().addScaledVector(px, w1), p1.clone().addScaledVector(px, -w1)];
        q.forEach((v, j) => { pp.push(v.x, v.y, v.z); const c = c0.clone().lerp(c1, [s0, s0, s1, s0, s1, s1][j]); cc.push(c.r, c.g, c.b); }); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cc, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, grassMat); m.position.set(x, isGround(x, z) - 0.02, z); m.castShadow = true; scene.add(m); };
  [[-2.4, -0.4, 1], [-0.9, -2.2, 0.8], [-3.6, 0.4, 1.1], [0.6, -3.6, 0.9], [-4.8, -1.8, 1], [-1.2, 2.6, 0.7], [2.8, -2.2, 0.8], [-5.2, 2.8, 0.9], [0.2, 1.8, 0.6]].forEach(([x, z, sc]) => tuft(x, z, sc));
  // coconuts on the sand, driftwood
  const nut = isMat({ color: lin('#6a4a2a'), roughness: 0.8, bumpMap: isTexSandBump(), bumpScale: 0.01 });
  [[-0.9, 0.3], [-1.2, 0.6], [-4.0, 2.4]].forEach(([x, z]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), nut); m.scale.set(1, 0.85, 1.1); m.position.set(x, isGround(x, z) + 0.08, z); m.castShadow = true; scene.add(m); });
  const dw = []; for (let i = 0; i <= 12; i++) { const k = i / 12; dw.push(V3(-5.6 + k * 2.4, 0, -4.8 + k * 0.8 + Math.sin(k * 5) * 0.12)); } dw.forEach((v) => { v.y = isGround(v.x, v.z) + 0.08; });
  const dg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dw), 40, 0.11, 12, false); const dwm = new THREE.Mesh(dg, isMat({ map: isTexWood('drift', '#9c907f', 0), roughness: 0.9 })); dwm.castShadow = dwm.receiveShadow = true; scene.add(dwm);
}

// =====================================================================
function isEnv(g) {   // a small sky for reflections: warm sun hole above, storm grey around, sand below
  const es = new THREE.Scene(), m = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uL: { value: isL } }, vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uL; varying vec3 vD; void main(){ vec3 c = mix(vec3(0.12,0.14,0.16), vec3(0.05,0.06,0.07), clamp(vD.y,0.,1.)); c = mix(c, vec3(0.75,0.6,0.42), clamp(-vD.y*3.,0.,1.)); c += vec3(6.,5.,3.6)*pow(max(dot(vD,uL),0.),40.) + vec3(0.5,0.42,0.3)*pow(max(dot(vD,uL),0.),4.); gl_FragColor = vec4(c,1.); }` });
  es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), m));
  const pm = new THREE.PMREMGenerator(g.r), rt = pm.fromScene(es, 0.02); pm.dispose(); return rt.texture;
}
function isBuild(g) {
  const scene = new THREE.Scene();
  const U = { uTime: { value: 0 }, uFlash: { value: 0 }, uAbove: { value: 0 }, uRS: { value: isRS }, uL: { value: isL.clone() }, uCam: { value: V3(0, 0, 0) }, uK: { value: new THREE.Vector2(isK[0], isK[1]) }, uBolt: { value: [0, 1, 2, 3].map(() => new THREE.Vector4(0, -999, 0, 0)) }, uStorm: { value: 1 }, uNight: { value: 0 }, uCalmA: { value: 0 }, uFair: { value: 0 }, uCloudA: { value: 1 }, uRainA: { value: 1 }, uZen: { value: V3(0.2, 0.4, 0.7) }, uHorC: { value: V3(0.6, 0.7, 0.8) }, uSunC: { value: V3(1, 0.9, 0.7) }, uSeaL: { value: V3(1, 1, 1) } };
  const isle = isIsland(); scene.add(isSky(U), isSea(U), isle);
  // lights: the sun through the hole, sand bounce, storm fill
  const sun = new THREE.DirectionalLight(lin('#ffd08c'), 4.6); sun.position.copy(isL).multiplyScalar(40); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 5; sun.shadow.blurSamples = 16; sun.shadow.bias = -0.0003;
  Object.assign(sun.shadow.camera, { left: -11, right: 11, top: 11, bottom: -11, near: 5, far: 80 });
  const hemi = new THREE.HemisphereLight(lin('#8ea6bd'), lin('#d0a36a'), 0.75);
  const storm = new THREE.DirectionalLight(lin('#8fb0dc'), 0.9); storm.position.set(Math.cos(-isBYAW) * 20, 7, Math.sin(-isBYAW) * 20);
  const bolt = new THREE.PointLight(lin('#c8d6ff'), 0, 60, 1.6);
  scene.add(sun, sun.target, hemi, storm, bolt);
  // palms
  const palms = [isPalm('a', V3(-2.6, isGround(-2.6, -3.2) - 0.1, -3.2), 5.4, 0.55, -0.4), isPalm('b', V3(-4.6, isGround(-4.6, -1.0) - 0.1, -1.0), 3.9, 0.5, 2.6), isPalm('c', V3(1.8, isGround(1.8, -4.5) - 0.1, -4.5), 4.6, 0.4, 1.2)];
  { const c = Math.cos(isBYAW), sn = -Math.sin(isBYAW), a = 1.4, b = 3.4, x = 2.4 + c * a - sn * b, z = 6.0 + sn * a + c * b; palms.push(isPalm('d', V3(x, isGround(x, z) - 0.1, z), 5.2, 1.0, isBYAW + 0.2)); }
  palms.forEach((p) => scene.add(p.grp));
  isDressing(scene);
  // boat, pulled up on the beach, bow to the sea
  const boat = isBoat(); const bx = 2.4, bz = 6.0; boat.grp.position.set(bx, isGround(bx, bz) + 0.42, bz); boat.grp.rotation.set(0.0, isBYAW, -0.035); scene.add(boat.grp);
  // fish
  const FG = isFishGeo(), env = isEnv(g); FG.irisMat = isMat({ color: lin('#d9b45a'), roughness: 0.15, metalness: 0.6, envMap: env }); const fMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.28, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.08, envMap: env, envMapIntensity: 1.2 }), finM = isMat({ color: lin('#e3b74a'), roughness: 0.4, side: THREE.DoubleSide, transparent: true, opacity: 0.92 }), eyeM = isMat({ color: lin('#101010'), roughness: 0.1 });
  const leap = []; for (let i = 0; i < 11; i++) { const f = isFish(FG, fMat, finM, eyeM, RNG('fs', i).r(0.38, 0.5)); scene.add(f); leap.push(f); }
  const feat = []; for (let i = 0; i < 3; i++) { const f = isFish(FG, fMat, finM, eyeM, 0.46); scene.add(f); feat.push(f); }
  const pile = []; for (let i = 0; i < 6; i++) { const f = isFish(FG, fMat, finM, eyeM, RNG('fp', i).r(0.36, 0.48)); boat.grp.add(f); pile.push(f); }
  const nz = (() => { const c = Math.cos(isBYAW), sn = -Math.sin(isBYAW), a = 8.6, b2 = -0.7; return [boat.grp.position.x + c * a - sn * b2, boat.grp.position.z + sn * a + c * b2]; })();
  const clouds = isClouds(U), scud = isScud(U), rain = isRain(U), light = isLightning(U, nz), shaft = isShaft(U), spl = isSplashes();
  scene.add(clouds.below, clouds.above, scud.mesh, rain.lines, rain.wall, ...rain.curtains, light.mesh, shaft, spl.pts);
  // a bucket brimming with fish on the sand, port side of the boat
  { const c = Math.cos(isBYAW), sn = -Math.sin(isBYAW), a = -0.9, b = 1.05, x = 2.4 + c * a - sn * b, z = 6.0 + sn * a + c * b, y = isGround(x, z);
    const bk = new THREE.Group(); bk.position.set(x, y - 0.02, z); scene.add(bk);
    const staves = isTexWood('bucket', '#9a6a3c', 0), bg = new THREE.CylinderGeometry(0.26, 0.21, 0.42, 28, 1, true); bg.translate(0, 0.21, 0);
    const bm = new THREE.Mesh(bg, isMat({ map: staves, side: THREE.DoubleSide, roughness: 0.7 })); bm.castShadow = bm.receiveShadow = true; bk.add(bm);
    const bot = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), isMat({ color: lin('#5a3c22') })); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.02; bk.add(bot);
    [0.08, 0.34].forEach((h) => { const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.21 + h * 0.12, 0.012, 8, 40), isMat({ color: lin('#4a4c50'), metalness: 0.8, roughness: 0.35 })); hoop.rotation.x = Math.PI / 2; hoop.position.y = h; bk.add(hoop); });
    for (let i = 0; i < 7; i++) { const Rb = RNG('bkt', i), f = isFish(FG, fMat, finM, eyeM, Rb.r(0.36, 0.44)); f.position.set(Rb.n(0.1), 0.36 + Rb.r(0, 0.12), Rb.n(0.1)); f.rotation.set(Rb.r(-1.2, -0.4), Rb.r(0, TAU), Rb.n(0.4), 'YXZ'); bk.add(f); }
    for (let i = 0; i < 3; i++) { const Rb = RNG('bkts', i), f = isFish(FG, fMat, finM, eyeM, Rb.r(0.38, 0.45)); f.position.set(0.35 + Rb.r(0, 0.3), 0.04, Rb.n(0.35)); f.rotation.set(Math.PI / 2, Rb.r(0, TAU), 0, 'YXZ'); bk.add(f); }
  }
  const rainFish = []; for (let i = 0; i < 12; i++) { const f = isFish(FG, fMat, finM, eyeM, RNG('rf', i).r(0.4, 0.5)); f.visible = false; scene.add(f); rainFish.push(f); }
  // character
  scene.add(chBuild().root);
  isS = { rainFish, env, scene, U, sun, hemi, storm, bolt, palms, boat, leap, feat, pile, FG, clouds, scud, rain, light, shaft, spl };
  isS.sand = isle.children[0]; isCoinBuild(isS, env); isS.meteors = isMeteors(isS); isS.gulls = isGulls(isS);
  return isS;
}

// ---------- per-frame
function isFishLeap(S, t) {
  const B = S.boat.grp, tgtLocal = V3(0.5, -0.12, 0.0), tgt = tgtLocal.clone(); B.localToWorld(tgt);
  S.leap.forEach((f, i) => {
    const R = RNG('leap', i), per = R.r(2.2, 3.1), off = R.f(), ph = (t / per + off) % 1, dur = 0.85;
    const a = Math.atan2(-Math.sin(isBYAW), Math.cos(isBYAW)) + R.n(1.1); let d = R.r(3.5, 7); while (isIsle(B.position.x + Math.cos(a) * d, B.position.z + Math.sin(a) * d) > -0.3) d += 0.5; const st = V3(B.position.x + Math.cos(a) * d, 0, B.position.z + Math.sin(a) * d);
    f.userData.st = st; f.userData.age = ph * per; f.userData.cyc = Math.floor(t / per + off);
    if (ph > dur) { f.visible = false; return; }
    f.visible = true; const p = ph / dur, h = R.r(1.6, 2.6);
    const end = tgt.clone().add(V3(R.n(0.3), 0, R.n(0.3)));
    const P = st.clone().lerp(end, p); P.y = lerp(st.y, end.y, p) + 4 * h * p * (1 - p);
    const p2 = Math.min(1, p + 0.01), Q = st.clone().lerp(end, p2); Q.y = lerp(st.y, end.y, p2) + 4 * h * p2 * (1 - p2);
    f.position.copy(P); f.lookAt(Q); f.rotateY(-Math.PI / 2); f.rotateX(Math.sin(t * 9 + i) * 0.4);
    f.userData.tail.rotation.y = Math.sin(t * 28 + i) * 0.5;
  });
  S.feat.forEach((f, i) => {
    const per = 2.0, ph = ((t + 0.5 - i * 0.16) / per) % 1, dur = 0.55, B2 = S.boat.grp;
    if (ph > dur) { f.visible = false; return; } f.visible = true; const p = ph / dur;
    const st = V3(...isAt(S, 4.6 + i * 0.9, [-0.8, 0.9, 0.1][i], 0)), en = V3(...isAt(S, 0.45 + i * 0.12, [0.15, -0.1, 0.0][i], 0)); st.y = 0; en.y = B2.position.y - 0.25;
    const h = [2.3, 2.7, 2.0][i], P = st.clone().lerp(en, p), p2 = Math.min(1, p + 0.01), Q = st.clone().lerp(en, p2); P.y = lerp(st.y, en.y, p) + 4 * h * p * (1 - p); Q.y = lerp(st.y, en.y, p2) + 4 * h * p2 * (1 - p2);
    f.position.copy(P); f.lookAt(Q); f.rotateY(-Math.PI / 2); f.rotateX(0.6 + i); f.userData.tail.rotation.y = Math.sin(t * 30 + i) * 0.5;
    f.userData.st = st; f.userData.age = ph * per; f.userData.cyc = Math.floor((t + 0.5 - i * 0.16) / per);
  });
  S.pile.forEach((f, i) => {
    const R = RNG('pile', i); f.position.set(0.32 + R.r(0, 0.42), -S.boat.Db + 0.13 + i * 0.012, R.n(0.18)); f.rotation.set(Math.PI / 2 + R.n(0.2), R.r(-0.6, 0.6) + (i % 2) * Math.PI, 0, 'YXZ');
    f.userData.tail.rotation.y = Math.sin(t * 14 + i * 2) * 0.35 * (i % 2);
  });
}

// a point in the boat's heading frame: a metres along the bow, b metres to port (left), at height h above the sand there
function isAt(S, a, b, h) { const B = S.boat.grp.position, c = Math.cos(isBYAW), sn = -Math.sin(isBYAW), x = B.x + c * a - sn * b, z = B.z + sn * a + c * b; return [x, Math.max(isGround(x, z), 0) + h, z]; }
const isHD = [Math.cos(isBYAW), -Math.sin(isBYAW)];   // the boat's heading in xz (towards the open sea)
const isFACE = isBYAW / DEG + 90;                        // character yaw that faces the sea

// ---------- weather / time-of-day modes (blended for transitions)
const isMODES = {
  day: { storm: 1, night: 0, calm: 0, fair: 0, cloudA: 1, rainA: 1, rs: isRS, L: [isL.x, isL.y, isL.z], zen: [0.2, 0.4, 0.7], hor: [0.6, 0.7, 0.8], sunC: [1, 0.9, 0.72], seaL: [1, 1, 1], sun: ['#ffdcaa', 6.2], sky: '#b4c4d2', gnd: '#f0c891', hemiI: 1.15, rim: 0.7, exp: 1.12 },
  night: { storm: 0, night: 1, calm: 0.22, fair: 0, cloudA: 0, rainA: 0, rs: 1e5, L: [isHD[0] * 0.55 - isHD[1] * 0.35, 0.42, isHD[1] * 0.55 + isHD[0] * 0.35], zen: [0.003, 0.006, 0.016], hor: [0.016, 0.026, 0.05], sunC: [0.42, 0.48, 0.6], seaL: [0.05, 0.065, 0.09], sun: ['#b4c8f2', 2.6], sky: '#4a5f8c', gnd: '#3e3e4c', hemiI: 1.1, rim: 0.5, exp: 1.5 },
  sunset: { storm: 0, night: 0, calm: 0.22, fair: 0.85, cloudA: 0.9, rainA: 0.25, rs: 1e5, L: [isHD[0] * 0.97 + isHD[1] * 0.2, 0.085, isHD[1] * 0.97 - isHD[0] * 0.2], zen: [0.08, 0.1, 0.22], hor: [0.92, 0.46, 0.22], sunC: [1.3, 0.64, 0.28], seaL: [0.62, 0.45, 0.36], sun: ['#ffa966', 3.4], sky: '#7a88b0', gnd: '#d0905e', hemiI: 0.8, rim: 0.2, exp: 1.02 },
  clear: { storm: 0, night: 0, calm: 0.18, fair: 1, cloudA: 0.8, rainA: 0, rs: 1e5, L: [isHD[0] * 0.55 + isHD[1] * 0.3, 0.62, isHD[1] * 0.55 - isHD[0] * 0.3], zen: [0.12, 0.28, 0.6], hor: [0.62, 0.72, 0.84], sunC: [1.1, 0.92, 0.72], seaL: [1, 1, 1], sun: ['#ffe4be', 4.6], sky: '#b2cdea', gnd: '#e0be90', hemiI: 1.0, rim: 0.15, exp: 1.05 },
};
function isBlend(A, B, k) {
  if (!B || k <= 0) return A; if (k >= 1) return B; const o = {};
  Object.keys(A).forEach((key) => { const a = A[key], b = B[key];
    if (typeof a === 'number') o[key] = key === 'rs' ? Math.exp(lerp(Math.log(a), Math.log(b), k)) : lerp(a, b, k);
    else if (typeof a === 'string') o[key] = '#' + lin(a).lerp(lin(b), k).getHexString();
    else if (typeof a[0] === 'number') o[key] = a.map((v, i) => lerp(v, b[i], k));
    else o[key] = [('#' + lin(a[0]).lerp(lin(b[0]), k).getHexString()), lerp(a[1], b[1], k)]; });
  return o;
}
function isApply(S, m) {
  const U = S.U, Lv = V3(...m.L).normalize();
  U.uStorm.value = m.storm; U.uNight.value = m.night; U.uCalmA.value = m.calm; U.uFair.value = m.fair; U.uCloudA.value = m.cloudA; U.uRainA.value = m.rainA; U.uRS.value = m.rs;
  U.uL.value.copy(Lv); U.uZen.value.set(...m.zen); U.uHorC.value.set(...m.hor); U.uSunC.value.set(...m.sunC); U.uSeaL.value.set(...m.seaL);
  S.sun.color.copy(lin(m.sun[0])); S.sun.intensity = m.sun[1]; S.sun.position.copy(Lv).multiplyScalar(40);
  S.hemi.color.copy(lin(m.sky)); S.hemi.groundColor.copy(lin(m.gnd)); S.hemi.intensity = m.hemiI; S.storm.intensity = m.rim;
  const stormy = m.storm > 0.5;
  S.clouds.below.visible = S.clouds.above.visible = stormy; S.shaft.visible = stormy; S.rain.lines.visible = S.rain.wall.visible = stormy;
  S.rain.curtains.forEach((c) => { c.visible = m.rainA > 0.01; }); S.scud.mesh.visible = m.cloudA > 0.01;
  S.mode = m;
}

// ---------- the quarter (same look as the street set's coin when that builder exists)
function isCoinTex() {
  if (typeof stTexCoin === 'function') return stTexCoin();
  return g3Tex((x, w) => { const c = w / 2, g = x.createRadialGradient(c, c, c * 0.84, c, c, c); g.addColorStop(0, '#7a7a7a'); g.addColorStop(0.35, '#e8e8e8'); g.addColorStop(1, '#bdbdbd'); x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, w, w); x.fillStyle = g; x.fillRect(0, 0, w, w);
    x.fillStyle = '#e0e0e0'; x.beginPath(); x.ellipse(c, c, c * 0.42, c * 0.56, 0, 0, TAU); x.fill(); }, 256, 256, false);
}
function isCoinBuild(S, env) {
  const ct = isCoinTex(), reed = g3Tex((x, w, h) => { for (let i = 0; i < w; i += 2) { x.fillStyle = i % 4 ? '#ffffff' : '#555555'; x.fillRect(i, 0, 2, h); } }, 256, 8, false); reed.wrapS = THREE.RepeatWrapping; reed.repeat.set(2, 1);
  const face = isMat({ envMap: env, color: lin('#ebe6de'), map: ct, metalness: 1, roughness: 0.34, bumpMap: ct, bumpScale: 0.9, roughnessMap: ct, envMapIntensity: 1.8 }), edge = isMat({ envMap: env, color: lin('#d6d2cc'), metalness: 1, roughness: 0.3, bumpMap: reed, bumpScale: 1, envMapIntensity: 2.4 });
  const geo = new THREE.CylinderGeometry(0.028, 0.028, 0.0036, 64, 1);
  S.coin = new THREE.Mesh(geo, [edge, face, face]); S.coin.castShadow = true; S.coin.visible = false; S.scene.add(S.coin);
  S.coinRain = new THREE.InstancedMesh(geo, [edge, face, face], 170); S.coinRain.castShadow = true; S.coinRain.frustumCulled = false; S.coinRain.visible = false; S.scene.add(S.coinRain);
  const glint = g3Tex((x, w) => { const c = w / 2; let gr = x.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.1, 'rgba(255,248,225,0.7)'); gr.addColorStop(0.35, 'rgba(255,230,180,0.12)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w);
    x.globalCompositeOperation = 'lighter'; [0, Math.PI / 2].forEach((a) => { x.save(); x.translate(c, c); x.rotate(a); gr = x.createLinearGradient(-c, 0, c, 0); gr.addColorStop(0, 'rgba(255,240,210,0)'); gr.addColorStop(0.5, 'rgba(255,250,235,0.9)'); gr.addColorStop(1, 'rgba(255,240,210,0)'); x.fillStyle = gr; x.fillRect(-c, -1.5, w, 3); x.restore(); }); }, 128, 128);
  S.glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glint, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); S.glint.visible = false; S.scene.add(S.glint);
  // fine sand under the coin (macro shots)
  const fine = g3Tex((x, w) => { const R = RNG('fine'); x.fillStyle = '#e6dccb'; x.fillRect(0, 0, w, w);
    const pal = ['#f4ede0', '#e9dcc4', '#d9c7a8', '#cdb994', '#f8f4ec', '#bfb2a0', '#d2c3ad'];
    for (let k = 0; k < 22000; k++) { const r = R.r(0.7, 2.0); x.fillStyle = pal[R.i(0, pal.length - 1)]; x.globalAlpha = R.r(0.55, 1); x.beginPath(); x.ellipse(R.r(0, w), R.r(0, w), r, r * R.r(0.65, 1), R.r(0, 3), 0, TAU); x.fill(); }
    x.globalAlpha = 1; for (let k = 0; k < 500; k++) { x.fillStyle = R.f() < 0.6 ? 'rgba(70,58,46,0.7)' : 'rgba(150,120,95,0.8)'; x.beginPath(); x.arc(R.r(0, w), R.r(0, w), R.r(0.6, 1.4), 0, TAU); x.fill(); } }, 1024, 1024);
  fine.wrapS = fine.wrapT = THREE.RepeatWrapping; fine.repeat.set(10, 10); fine.anisotropy = 8;
  const fineB = g3Tex((x, w) => { const R = RNG('fineb'); x.fillStyle = '#6a6a6a'; x.fillRect(0, 0, w, w); for (let k = 0; k < 14000; k++) { const cx = R.r(0, w), cy = R.r(0, w), r = R.r(0.9, 2.4), gr = x.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(110,110,110,0)'); x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2); } }, 1024, 1024, false);
  fineB.wrapS = fineB.wrapT = THREE.RepeatWrapping; fineB.repeat.set(10, 10);
  const alpha = g3Radial([[0, '#ffffff'], [0.7, '#ffffff'], [1, '#000000']], 256);
  S.fine = new THREE.Mesh(new THREE.CircleGeometry(0.9, 48), isMat({ map: fine, bumpMap: fineB, bumpScale: 0.0022, roughness: 1, vertexColors: true, transparent: true, color: lin('#f3eadb') }));
  S.cshadow = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.045), new THREE.MeshBasicMaterial({ map: g3Radial([[0, 'rgba(40,28,18,0.6)'], [0.5, 'rgba(40,28,18,0.28)'], [1, 'rgba(40,28,18,0)']], 128), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); S.cshadow.visible = false; S.scene.add(S.cshadow);
  S.fine.rotation.x = -Math.PI / 2; S.fine.receiveShadow = true; S.fine.visible = false; S.scene.add(S.fine);
}
function isGlint(S, g, p, k) { const vd = g.cam.position.clone().sub(p).normalize(); S.glint.visible = k > 0.02; S.glint.position.copy(p).addScaledVector(vd, 0.04); const d = g.cam.position.distanceTo(p), sz = d * 0.12 * k; S.glint.scale.set(sz, sz, 1); S.glint.material.opacity = Math.min(1, k); }
function isCoinGlintK(S, g) { const n = V3(0, 1, 0).applyQuaternion(S.coin.quaternion), vd = g.cam.position.clone().sub(S.coin.position).normalize(); const h = vd.clone().add(S.U.uL.value).normalize(); return Math.pow(Math.abs(n.dot(h)), 8); }

// ---------- teaser props: coins and fish raining around him
function isRainProps(S, t, b, base) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = V3(2.4, 2.4, 2.4), p = V3(0, 0, 0), tl = t - b.t0;
  for (let i = 0; i < 170; i++) {
    const R = RNG('crain', i), a = R.r(0, TAU), r = 0.5 + Math.pow(R.f(), 0.7) * 6.5, x = base[0] + Math.cos(a) * r, z = base[2] + Math.sin(a) * r, gy = isGround(x, z);
    const tl0 = R.r(-0.5, 6.2), fall = 1.6;
    if (tl < tl0 - fall || gy < -0.05) { m.makeScale(0, 0, 0); S.coinRain.setMatrixAt(i, m); continue; }
    const u = tl - tl0;
    if (u < 0) { p.set(x + u * 0.4, isSurf(isS, x, z) + 4.9 * u * u + 0.02, z); e.set(R.r(0, 6) + u * R.r(8, 16), R.r(0, 6), R.r(0, 6) + u * 9); }
    else { const bo = Math.max(0, Math.sin(Math.min(u, 0.5) / 0.5 * Math.PI)) * 0.08 * Math.exp(-u * 3); p.set(x, isSurf(isS, x, z) + 0.006 + bo, z); e.set(R.n(0.12) * Math.exp(-u * 2), R.r(0, 6), R.n(0.12) * Math.exp(-u * 2)); }
    q.setFromEuler(e); m.compose(p, q, sc); S.coinRain.setMatrixAt(i, m);
  }
  S.coinRain.instanceMatrix.needsUpdate = true; S.coinRain.visible = true;
  S.rainFish.forEach((f, i) => {
    const R = RNG('frain', i), a = R.r(0, TAU), r = 1.2 + R.r(0, 5), x = base[0] + Math.cos(a) * r, z = base[2] + Math.sin(a) * r, gy = Math.max(isGround(x, z), 0), tl0 = R.r(0.3, 6.0), u = tl - tl0;
    if (u < -1.8) { f.visible = false; return; } f.visible = true;
    if (u < 0) { f.position.set(x, gy + 4.9 * u * u + 0.08, z); f.rotation.set(R.r(0, 6) + u * 5, R.r(0, 6), u * 3); }
    else { f.position.set(x, gy + 0.05 + Math.abs(Math.sin(u * 9)) * 0.1 * Math.exp(-u * 1.2), z); f.rotation.set(Math.PI / 2, R.r(0, 6), Math.sin(u * 14) * 0.4 * Math.exp(-u)); }
    f.userData.tail.rotation.y = Math.sin(t * 22 + i) * 0.6;
  });
}

// ---------- shooting stars (night): bright heads with fading tails that curve away and fall into the sea
function isMeteors(S) {
  const MAXV = 12000, pos = new Float32Array(MAXV * 3), col = new Float32Array(MAXV * 3), uv = new Float32Array(MAXV * 2);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const tex = g3Tex((x, w, h) => { const gr = x.createLinearGradient(0, 0, w, 0); [[0, 0], [0.3, 0.1], [0.5, 1], [0.7, 0.1], [1, 0]].forEach(([o, a]) => gr.addColorStop(o, `rgba(255,255,255,${a})`)); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 64, 4, false);
  const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); mesh.frustumCulled = false; mesh.renderOrder = 8; mesh.visible = false; S.scene.add(mesh);
  const R = RNG('meteors'), list = [];
  for (let i = 0; i < 14; i++) {
    const az = Math.atan2(isHD[1], isHD[0]) + R.n(0.9), far = R.r(500, 900), st = V3(Math.cos(az + R.n(0.4)) * far, R.r(260, 420), Math.sin(az + R.n(0.4)) * far);
    const aim = V3(...isAt({ boat: S.boat }, -1.4, 2.0, 1)), side = R.f() < 0.5 ? -1 : 1, off = V3(-isHD[1], 0, isHD[0]).multiplyScalar(side * R.r(25, 70)).add(V3(isHD[0], 0, isHD[1]).multiplyScalar(R.r(10, 60)));
    const end = aim.clone().add(off); end.y = 0; const ctrl = aim.clone().lerp(st, 0.35); ctrl.y = Math.max(ctrl.y, 60);
    list.push({ st, ctrl, end, t0: 0.3 + i * 0.6 + R.n(0.2), dur: R.r(1.3, 1.9), w: R.r(0.7, 1.3) });
  }
  const bez = (M, u) => { const a = 1 - u; return V3(0, 0, 0).addScaledVector(M.st, a * a).addScaledVector(M.ctrl, 2 * a * u).addScaledVector(M.end, u * u); };
  const update = (cam, tl) => {
    let v = 0; const cp = cam.position, d = V3(0, 0, 0), tc = V3(0, 0, 0), hits = [];
    list.forEach((M) => {
      const u = (tl - M.t0) / M.dur; if (u < 0 || u > 1.35) return;
      const head = Math.min(u, 1), fade = u > 1 ? 1 - (u - 1) / 0.35 : 1, NP = 28, P = [];
      for (let k = 0; k < NP; k++) { const s = head - k / NP * 0.16; if (s < 0) break; P.push([bez(M, s), (1 - k / NP) * fade]); }
      if (head >= 1) hits.push([M.end, u - 1]);
      for (let k = 0; k < P.length - 1 && v < MAXV - 6; k++) { const [a, ia] = P[k], [bq, ib] = P[k + 1]; d.subVectors(bq, a); tc.subVectors(cp, a); const sd = V3(0, 0, 0).crossVectors(d, tc).normalize();
        const wa = M.w * (1 + a.distanceTo(cp) * 0.002) * (0.35 + 0.65 * ia), wb = M.w * (1 + bq.distanceTo(cp) * 0.002) * (0.35 + 0.65 * ib);
        [[a, wa, -1, ia], [a, wa, 1, ia], [bq, wb, -1, ib], [a, wa, 1, ia], [bq, wb, 1, ib], [bq, wb, -1, ib]].forEach(([pp, w, s, I]) => { pos[v * 3] = pp.x + sd.x * w * s; pos[v * 3 + 1] = pp.y + sd.y * w * s; pos[v * 3 + 2] = pp.z + sd.z * w * s; uv[v * 2] = (s + 1) / 2; uv[v * 2 + 1] = 0.5; const c = I * I * 3; col.set([c * 0.9, c * 0.95, c], v * 3); v++; }); }
    });
    g.setDrawRange(0, v); g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = g.attributes.uv.needsUpdate = true; mesh.visible = true;
    return hits;
  };
  return { mesh, update };
}

// ---------- space: Earth (procedural continents, clouds, atmosphere) and the asteroid
function isSpaceBuild(g) {
  const scene = new THREE.Scene(), RE = 50;
  const N3 = `float isH3(vec3 p){ p = fract(p*0.3183099+vec3(0.1,0.2,0.3)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float isN3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f*f*(3.-2.*f);
      return mix(mix(mix(isH3(i+vec3(0,0,0)), isH3(i+vec3(1,0,0)), f.x), mix(isH3(i+vec3(0,1,0)), isH3(i+vec3(1,1,0)), f.x), f.y), mix(mix(isH3(i+vec3(0,0,1)), isH3(i+vec3(1,0,1)), f.x), mix(isH3(i+vec3(0,1,1)), isH3(i+vec3(1,1,1)), f.x), f.y), f.z); }
    float isF3d(vec3 p){ float a = 0.5, s = 0.; for (int i=0;i<6;i++){ s += a*isN3(p); p = p*2.02 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }`;
  const U = { uSun: { value: V3(-0.75, 0.25, 0.6).normalize() }, uTime: { value: 0 }, uCam: { value: V3(0, 0, 0) } };
  const earth = new THREE.Mesh(new THREE.SphereGeometry(RE, 128, 96), new THREE.ShaderMaterial({ uniforms: U,
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: N3 + `uniform vec3 uSun, uCam; uniform float uTime; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 n = normalize(vN); vec3 q = n; float c = cos(uTime*0.01), s = sin(uTime*0.01); q.xz = mat2(c,-s,s,c)*q.xz;
        float h = isF3d(q*2.1 + 4.), lat = abs(q.y), land = smoothstep(0.54, 0.56, h);
        vec3 ocean = mix(vec3(0.004,0.022,0.07), vec3(0.02,0.1,0.17), smoothstep(0.47, 0.54, h));
        float dry = smoothstep(0.35, 0.65, isF3d(q*3.3 + 9.)) * (1. - smoothstep(0.35, 0.7, lat));
        vec3 ground = mix(vec3(0.08,0.12,0.06), vec3(0.36,0.29,0.19), dry); ground = mix(ground, vec3(0.3,0.28,0.25), smoothstep(0.62, 0.72, h));
        vec3 col = mix(ocean, ground, land); col = mix(col, vec3(0.9,0.93,0.96), smoothstep(0.78, 0.86, lat + (h-0.5)*0.3));
        vec3 qc = q; qc.xz = mat2(cos(uTime*0.02),-sin(uTime*0.02),sin(uTime*0.02),cos(uTime*0.02))*qc.xz;
        float cl = smoothstep(0.47, 0.72, isF3d(qc*3.0 + vec3(0., 0., isF3d(qc*1.5)*2.)));
        float dl = dot(n, uSun), lit = smoothstep(-0.12, 0.25, dl);
        vec3 V = normalize(uCam - vW), Hh = normalize(V + uSun);
        vec3 c2 = col*(0.05 + 1.2*max(dl, 0.)) + vec3(1.0,0.95,0.85)*pow(max(dot(n,Hh),0.),60.)*0.8*(1.-land)*lit;
        c2 = mix(c2, vec3(1.)*(0.04 + 1.25*max(dl,0.)), cl*0.92);
        float city = land * (1. - cl) * smoothstep(0.6, 0.8, isN3(q*90.)) * smoothstep(0.1, -0.2, dl) * (1. - smoothstep(0.7, 0.9, lat));
        c2 += vec3(1.0,0.65,0.3)*city*0.35;
        float fr = pow(1. - max(dot(n, V), 0.), 3.);
        c2 += vec3(0.25,0.5,1.0)*fr*smoothstep(-0.25, 0.4, dl)*1.2;
        gl_FragColor = vec4(c2, 1.);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  const atm = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.045, 96, 64), new THREE.ShaderMaterial({ uniforms: U, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix)*normal); vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uSun, uCam; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 n = normalize(vN), V = normalize(uCam - vW); float rim = pow(clamp(1.0 + dot(n, V)*1.0, 0., 1.), 0.0);
        float t = clamp(-dot(n, V), 0., 1.); float glow = pow(1. - t, 6.) * 2.2;
        float lit = smoothstep(-0.35, 0.45, dot(n, uSun)); vec3 c = mix(vec3(0.2,0.45,1.0), vec3(0.6,0.75,1.0), pow(1.-t, 10.)) * glow * lit;
        c += vec3(1.0,0.5,0.2)*glow*0.25*smoothstep(-0.3,0.0,dot(n,uSun))*smoothstep(0.25,0.0,dot(n,uSun));
        gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  scene.add(earth, atm);
  // stars
  const sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 48, 24), new THREE.ShaderMaterial({ uniforms: U, side: THREE.BackSide, depthWrite: false,
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*viewMatrix*modelMatrix*vec4(position,1.); }`,
    fragmentShader: N3 + `uniform vec3 uSun; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); vec3 q = d*300.; vec3 id = floor(q); float h = fract(sin(dot(id, vec3(12.9898,78.233,37.719)))*43758.5453);
        vec3 f = fract(q) - 0.5; float st = step(0.965, h) * smoothstep(0.24, 0.0, length(f)) * (0.3 + 2.5*pow(fract(h*91.3), 3.));
        vec3 nM = normalize(vec3(0.2, 0.9, 0.3)); float band = exp(-pow(dot(d, nM)/0.22, 2.)) * isF3d(d*6.);
        vec3 c = st*mix(vec3(0.8,0.88,1.), vec3(1.,0.88,0.7), fract(h*7.)) + band*vec3(0.06,0.055,0.08)*1.3;
        float sd = max(dot(d, uSun), 0.); c += vec3(1.,0.95,0.85)*(smoothstep(0.99975, 0.99985, sd)*8. + pow(sd, 300.)*1.5 + pow(sd, 20.)*0.08);
        gl_FragColor = vec4(c, 1.);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }` }));
  scene.add(sky);
  // the asteroid: a lumpy potato, cratered at three scales, with a rock texture for grain
  const ag = new THREE.SphereGeometry(1, 220, 160), P = ag.attributes.position, R = RNG('rock3'), cr = [];
  for (let i = 0; i < 90; i++) { const v = V3(R.n(1), R.n(1), R.n(1)).normalize(), big = i < 8; cr.push([v, big ? R.r(0.22, 0.38) : i < 35 ? R.r(0.07, 0.16) : R.r(0.025, 0.06), 0]); cr[i][2] = cr[i][1] * R.r(0.35, 0.5); }
  const n2 = isNoise2('ast'), n3 = isNoise2('ast2'), col = [];
  for (let i = 0; i < P.count; i++) { const v = V3(P.getX(i), P.getY(i), P.getZ(i)).normalize();
    let r = 1 + 0.2 * (n2(v.x * 1.6 + 5, v.y * 1.6 + v.z * 1.1) - 0.5) + 0.07 * (n2(v.x * 6, v.z * 6 + v.y * 4) - 0.5) + 0.03 * (n3(v.x * 18 + v.z * 7, v.y * 18) - 0.5) + 0.012 * (n3(v.x * 45, v.y * 45 + v.z * 30) - 0.5);
    let dark = 0, rim = 0;
    cr.forEach(([c, rad, dep]) => { const d = v.distanceTo(c) / rad; if (d < 1.6) { if (d < 1) { r -= dep * (1 - d * d) * 0.9; dark += (1 - d) * 0.35; } const rr = Math.exp(-Math.pow((d - 1.0) / 0.18, 2)); r += dep * 0.35 * rr; rim += rr; } });
    v.multiplyScalar(r); v.x *= 1.35; v.z *= 0.9; P.setXYZ(i, v.x, v.y, v.z);
    const c = lin('#6b645b').lerp(lin('#3a342f'), clamp(dark + (n2(v.x * 5, v.y * 5) - 0.4) * 0.6)).lerp(lin('#8f877c'), clamp(rim * 0.35)); col.push(c.r, c.g, c.b); }
  ag.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ag.computeVertexNormals();
  const rockTex = g3Tex((x, w) => { const Rt = RNG('rocktex'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w);
    for (let k = 0; k < 26000; k++) { const v = Rt.i(60, 200); x.fillStyle = `rgba(${v},${v},${v},${Rt.r(0.2, 0.6)})`; x.fillRect(Rt.r(0, w), Rt.r(0, w), Rt.r(1, 3), Rt.r(1, 3)); }
    for (let k = 0; k < 420; k++) { const cx = Rt.r(0, w), cy = Rt.r(0, w), r = Rt.r(2, 14) * (Rt.f() < 0.1 ? 2.5 : 1); const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(30,30,30,0.6)'); gr.addColorStop(0.75, 'rgba(70,70,70,0.25)'); gr.addColorStop(0.9, 'rgba(230,230,230,0.5)'); gr.addColorStop(1, 'rgba(128,128,128,0)'); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); } }, 1024, 1024, false);
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping; rockTex.repeat.set(3, 2);
  const rock = new THREE.Mesh(ag, isMat({ color: 0xffffff, vertexColors: true, roughness: 0.92, bumpMap: rockTex, bumpScale: 0.035, roughnessMap: rockTex })); scene.add(rock);
  const sunL = new THREE.DirectionalLight(lin('#fff2df'), 3.0), amb = new THREE.HemisphereLight(lin('#34466c'), lin('#0a0a0e'), 0.32), earthGlow = new THREE.DirectionalLight(lin('#6a96d8'), 0.9); scene.add(sunL, amb, earthGlow, earthGlow.target);
  // the asteroid's dust trail (shows the bend)
  const tg = new THREE.BufferGeometry(), TN = 120, tp = new Float32Array(TN * 2 * 3), tc = new Float32Array(TN * 2 * 3); tg.setAttribute('position', new THREE.BufferAttribute(tp, 3)); tg.setAttribute('color', new THREE.BufferAttribute(tc, 3));
  const idx = []; for (let i = 0; i < TN - 1; i++) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); tg.setIndex(idx);
  const trail = new THREE.Mesh(tg, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })); trail.frustumCulled = false; scene.add(trail);
  return { scene, U, earth, atm, rock, sunL, earthGlow, RE, trail, TN };
}
function isSpaceShot(g, t, b, which) {
  const S = isS, SP = S.space || (S.space = isSpaceBuild(g)), k = b.k, tl = t - b.t0, U = SP.U;
  U.uTime.value = t; U.uSun.value.copy(which === 'asteroid' ? V3(0.95, 0.32, -0.5).normalize() : V3(-0.75, 0.25, 0.6).normalize()); SP.sunL.position.copy(U.uSun.value).multiplyScalar(100);
  const E = V3(0, 0, 0); SP.earth.position.copy(E); SP.atm.position.copy(E);
  let path; // asteroid position as a function of time (beat-local)
  if (which === 'asteroid') {
    const p0 = V3(-140, 30, 220), p1 = V3(-60, 18, 95);
    path = (s) => p0.clone().lerp(p1, s);
    const ap = path(k * 0.6 + 0.1); SP.earthGlow.position.copy(E); SP.earthGlow.target.position.copy(ap); SP.rock.position.copy(ap); SP.rock.scale.setScalar(4.2); SP.rock.rotation.set(tl * 0.12, tl * 0.2, 0.3);
    const cam = ap.clone().add(V3(-4 - k * 2, 3.5, 14 - k * 3)), tgt = ap.clone().lerp(E, 0.42);
    shotCam(g, cam.toArray(), tgt.toArray(), 32, 0.15, t);
  } else {
    // swerve: it comes in at Earth and bends around it at the last moment
    const ctr = V3(0, 0, 0), a0 = V3(-170, 40, 120), closest = V3(-38, 46, 26), out = V3(90, 110, 30);
    path = (s) => { if (s < 0.5) { const u = s / 0.5; return a0.clone().lerp(closest, 1 - Math.pow(1 - u, 1.6)); } const u = (s - 0.5) / 0.5; const c1 = closest.clone().add(V3(40, 8, -14)); const a = 1 - u; return V3(0, 0, 0).addScaledVector(closest, a * a).addScaledVector(c1, 2 * a * u).addScaledVector(out, u * u); };
    const ap = path(k); SP.rock.position.copy(ap); SP.rock.scale.setScalar(2.6); SP.rock.rotation.set(tl * 0.15, tl * 0.25, 0.3);
    const cam = V3(-62 + k * 5, 26, 74 - k * 3); shotCam(g, cam.toArray(), V3(-24, 30, 4).toArray(), 26, 0.15, t);
  }
  // trail: the last stretch of the path, fading (only for the swerve)
  SP.trail.visible = which === 'swerve';
  const tp = SP.trail.geometry.attributes.position, tc = SP.trail.geometry.attributes.color, cp = g.cam.position;
  for (let i = 0; i < SP.TN; i++) { const s = Math.max(0, (which === 'asteroid' ? k * 0.6 + 0.1 : k) - i / SP.TN * 0.5), p = path(s), p2 = path(Math.max(0, s - 0.004)), d = p.clone().sub(p2), sd = V3(0, 0, 0).crossVectors(d, cp.clone().sub(p)).normalize().multiplyScalar(which === 'asteroid' ? 0.45 : 0.3);
    tp.setXYZ(i * 2, p.x - sd.x, p.y - sd.y, p.z - sd.z); tp.setXYZ(i * 2 + 1, p.x + sd.x, p.y + sd.y, p.z + sd.z); const a = Math.pow(1 - i / SP.TN, 2) * 0.22 * (i < 3 ? i / 3 : 1); tc.setXYZ(i * 2, a * 0.9, a * 0.8, a * 0.7); tc.setXYZ(i * 2 + 1, a * 0.9, a * 0.8, a * 0.7); }
  tp.needsUpdate = tc.needsUpdate = true;
  g.cam.far = 6000; g.cam.updateProjectionMatrix(); U.uCam.value.copy(g.cam.position);
  present(g, SP.scene, { bloom: 0.3, clear: '#000000' });
}

// ---------- gulls (the normal world comes back)
function isGulls(S) {
  const mat = isMat({ color: lin('#f4f2ee'), roughness: 0.7, side: THREE.DoubleSide }), tip = isMat({ color: lin('#3a3a3c'), roughness: 0.7, side: THREE.DoubleSide }), list = [];
  for (let i = 0; i < 6; i++) { const gr = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), mat); body.scale.set(2.2, 0.8, 0.8); gr.add(body);
    const wings = [1, -1].map((s) => { const w = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.25, 0.04, 0.55, 0.0); sh.lineTo(0.62, -0.1); sh.quadraticCurveTo(0.3, -0.16, 0, -0.12); const m = new THREE.Mesh(new THREE.ShapeGeometry(sh, 6), mat); m.rotation.x = -Math.PI / 2; m.scale.set(1, s, 1); m.position.z = 0; const tp = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), tip); tp.rotation.x = -Math.PI / 2; tp.position.set(0.58, 0.002, -0.05 * s); w.add(m); w.rotation.y = s * Math.PI / 2; w.position.set(0.05, 0.02, s * 0.06); gr.add(w); return [w, s]; });
    gr.visible = false; S.scene.add(gr); list.push({ gr, wings, R: RNG('gull', i) }); }
  return list;
}

// ---------- character staging
function isSitBoat(S, look, expr) {
  const seat = S.boat.seats[1].clone(); S.boat.grp.localToWorld(seat);
  const P = { pose: 'sit', expr: expr || [['smug', 0.85], ['happy', 0.15]], rot: isBYAW / DEG - 90, look: look || [6, 4],
    add: { spine: [-12, 0, 0], chest: [-8, 0, 0], neck: [4, 8, 0], head: [2, 10, -5], shL: [26, 0, 22], shR: [26, 0, -22], elL: [34, 0, 0], elR: [34, 0, 0], hipL: [-2, 0, 7], hipR: [-2, 0, -7], knL: [-14, 0, 0], knR: [-20, 0, 0] } };
  chPose(Object.assign({}, P, { pos: [0, 0, 0], sitY: 0 })); const hp = CH.hips.getWorldPosition(V3(0, 0, 0));
  chPose(Object.assign({}, P, { pos: [seat.x - hp.x + Math.cos(isBYAW) * 0.1, 0, seat.z - hp.z - Math.sin(isBYAW) * 0.1], sitY: seat.y - hp.y + 0.2 }));
}
function isSitSand(S, base, P) {   // P.add tuned per pose; hips rest a little above the sand
  chPose(Object.assign({}, P, { pos: [0, 0, 0], sitY: 0 })); const hp = CH.hips.getWorldPosition(V3(0, 0, 0)), gy = isGround(base[0], base[2]);
  chPose(Object.assign({}, P, { pos: [base[0] - hp.x, 0, base[2] - hp.z], sitY: gy - hp.y + (P.hipH ?? 0.13) }));
}

const isSurfC = {};
function isSurf(S, x, z) { const key = x.toFixed(3) + ',' + z.toFixed(3); if (isSurfC[key] != null) return isSurfC[key];
  const rc = new THREE.Raycaster(V3(x, 10, z), V3(0, -1, 0)); S.sand.updateMatrixWorld(true); const h = rc.intersectObject(S.sand, false)[0]; return (isSurfC[key] = h ? h.point.y : isGround(x, z)); }
// =====================================================================
//  setIsland(g, t, b): every beat on the island (and the two in space). b = { shot, t0, t1, k }
// =====================================================================
function isPt(base, f, s, h) { return [base[0] + isHD[0] * f - isHD[1] * s, (h ?? 0) + base[1], base[2] + isHD[1] * f + isHD[0] * s]; }   // f along the facing (to sea), s to the side
function setIsland(g, t, b) {
  b = b || { shot: 'fish', t0: 0, t1: 9, k: 0 };
  const S = isS || isBuild(g), tl = t - b.t0, k = b.k ?? clamp(tl / (b.t1 - b.t0));
  if (b.shot === 'asteroid' || b.shot === 'swerve') { isSpaceShot(g, t, b, b.shot); return; }
  S.U.uTime.value = t;
  { const rig = chBuild(); if (rig.root.parent !== S.scene) S.scene.add(rig.root); rig.root.visible = true; rig.root.scale.set(1, 1, 1); }
  [S.coin, S.coinRain, S.glint, S.fine, S.cshadow, S.meteors.mesh, ...S.rainFish, ...S.feat].forEach((o) => { o.visible = false; }); S.gulls.forEach((q) => { q.gr.visible = false; });
  S.leap.forEach((f, i) => { f.visible = false; f.scale.setScalar(RNG('fs', i).r(0.38, 0.5)); });
  isBoltEv = []; isNearT = -1e9;
  const gb = isAt(S, -1.4, 2.0, 0), base = [gb[0], isGround(gb[0], gb[2]), gb[2]];   // his spot on the beach
  const C = isPt(base, 0.62, -0.14, 0); C[1] = isSurf(S, C[0], C[2]);                    // where the coin lands
  const ease = (x) => x * x * (3 - 2 * x);
  let mode = isMODES.day, bloom = 0.2, leaps = false, stream = false, rainP = false, meteor = false, gulls = false, coinMode = null, grade = 0.32;
  const stand = (o) => chPose(Object.assign({ pose: 'stand', rot: isFACE, pos: base }, o));
  switch (b.shot) {
    case 'teaser': {
      rainP = true;
      stand({ rot: isFACE + 180, pose: [['stand', 0.5], ['shrug', 0.5]], expr: [['smug', 0.75], ['happy', 0.25]], look: [0, 4], add: { head: [-4, 0, 4], neck: [-3, 0, 0] } });
      const u = ease(clamp(tl / 4.4)), u2 = clamp((tl - 4.4) / 1.8);
      const cam = isPt(base, lerp(-12, -3.3, u) + u2 * 0.4, lerp(7.5, 1.0, u), lerp(9, 0.85, u));
      shotCam(g, cam, isPt(base, 0, 0, lerp(2.2, 1.35, u)), lerp(24, 28, u), 0.5, t);
      const R = RNG('teaserbolts'); for (let i = 0; i < 15; i++) { isBoltEv.push([i, b.t0 + R.r(0, 3)], [i, b.t0 + R.r(3, 6.2)]); } [[8, 4.12], [12, 4.04], [13, 4.16], [14, 1.0], [8, 2.2], [13, 5.4]].forEach(([i, tt]) => isBoltEv.push([i, b.t0 + tt]));
      isNearT = b.t0 + 2.9; leaps = true; break;
    }
    case 'eye': {
      const a = 0.3 * k, r = 230 - 50 * k, cam = [Math.sin(a) * -0.08 * r - 10, 205 - 45 * k, -Math.cos(a) * 0.6 * r];
      shotCam(g, cam, [-2, 10, 6], 28, 0.25, t); stand({ expr: 'neutral' });
      [0.9, 2.4, 4.1, 5.5, 7.2].forEach((tt, i) => isBoltEv.push([15 + (i % 3), b.t0 + tt])); break;
    }
    case 'ring': {
      stand({ expr: [['amazed', 0.5], ['happy', 0.5]], look: [0, 20], add: { neck: [-8, 0, 0], head: [-10, 0, 0] } });
      const ang = Math.atan2(isHD[1], isHD[0]) + 0.75 - k * 0.5, r = 27 - k * 3;
      shotCam(g, [Math.cos(ang) * r, 3.6 + k * 0.8, Math.sin(ang) * r], [base[0] * 0.5, 4.2, base[2] * 0.5], 24, 0.5, t);
      [[8, 1.5], [12, 3.0], [13, 4.12], [14, 5.8], [3, 7.4]].forEach(([i, tt]) => isBoltEv.push([i, b.t0 + tt])); break;
    }
    case 'fish': {
      stream = true; isSitBoat(S, [-28, 12], [['smug', 0.7], ['happy', 0.3]]);
      const c = isAt(S, -4.2 + k * 0.6, -3.4, 1.05), tg = isAt(S, 2.2, 0.4, 1.55); shotCam(g, c, tg, 28, 0.6, t); break;
    }
    case 'strike': {
      leaps = true; isSitBoat(S, [8, 4]);
      const c = isAt(S, -2.3 - k * 0.3, -0.7, 1.05), tg = isAt(S, 1.2, 0.1, 1.1); shotCam(g, c, tg, 30, 0.8, t);
      const st = [1.3, 4.1, 7.3].filter((x) => x <= tl + 0.001).pop(); if (st != null) isNearT = b.t0 + st; break;
    }
    case 'night': {
      mode = isMODES.night; meteor = true; grade = 0.4;
      isSitSand(S, base, { pose: 'sit', expr: [['smug', 0.5], ['happy', 0.5]], rot: isFACE, look: [0, 28], hipH: 0.11,
        add: { hipL: [-4, 0, 9], hipR: [-4, 0, -9], knL: [-72, 0, 0], knR: [-50, 0, 0], spine: [-22, 0, 0], chest: [-10, 0, 0], neck: [-12, 0, 0], head: [-14, 0, 0], shL: [48, 0, 22], shR: [48, 0, -22], elL: [12, 0, 0], elR: [12, 0, 0] } });
      shotCam(g, isPt(base, -4.6 + k * 0.5, 1.7, 1.25), isPt(base, 6, -1.2, 2.9), 22, 0.4, t); break;
    }
    case 'lonely': {
      mode = isMODES.sunset;
      isSitSand(S, base, { pose: 'sit', expr: 'sad', rot: isFACE, look: [0, -4], hipH: 0.12,
        add: { hipL: [-32, 0, 6], hipR: [-32, 0, -6], knL: [62, 0, 0], knR: [62, 0, 0], spine: [16, 0, 0], chest: [8, 0, 0], head: [12, 0, 0], shL: [-38, 8, 12], shR: [-38, -8, -12], elL: [-62, 40, 0], elR: [-62, -40, 0] } });
      shotCam(g, isPt(base, -6.2 + k * 0.8, -3.6, 1.5), isPt(base, 4, 0.8, 0.9), 30, 0.4, t); break;
    }
    case 'pocket': {
      mode = isMODES.sunset; coinMode = 'hand';
      const a = ease(clamp((k - 0.22) / 0.5));
      stand({ expr: [['neutral', 0.6], ['sad', 0.4]], look: [-8, -20], hand: { R: a > 0.1 ? 'hold' : 'relax' },
        add: { shR: [lerp(10, -22, a), lerp(0, 14, a), lerp(-2, -8, a)], elR: [lerp(-6, -84, a), lerp(0, -45, a), 0], wrR: [lerp(0, -12, a), 0, 0], neck: [8, -6, 0], head: [12, -10, 0] } });
      CH.root.updateMatrixWorld(true); const hp = CH.arms.R.wr.getWorldPosition(V3(0, 0, 0));
      const fi = CH.arms.R.fingers[0][2].getWorldPosition(V3(0, 0, 0)), tg = hp.clone().lerp(fi, 0.7); shotCam(g, [tg.x + isHD[0] * 0.5 - isHD[1] * 0.3, tg.y + 0.1, tg.z + isHD[1] * 0.5 + isHD[0] * 0.3], tg.toArray(), 45, 0.2, t); break;
    }
    case 'flipagain': {
      mode = isMODES.sunset; coinMode = 'flip';
      const w = ease(clamp(tl / 2.6));
      stand({ pose: [['stand', 1 - w], ['flip', w]], expr: [['neutral', 0.5], ['happy', 0.5 * w]], look: tl > 3 ? [-6, 22] : [-8, 0], add: tl > 3 ? { neck: [-8, 0, 0], head: [-8, 0, 0] } : {} });
      shotCam(g, isPt(base, 3.0, 0.9, 1.45), isPt(base, 0.1, -0.05, 1.6 + 0.3 * ease(clamp((tl - 3) / 2))), 26, 0.4, t); break;
    }
    case 'spin': {
      mode = isMODES.sunset; coinMode = 'spin'; stand({ pose: 'flip', expr: 'neutral', look: [-6, 30] });
      const P = isPt(base, 0.35, -0.05, 2.55 - tl * 0.01); shotCam(g, [P[0] - isHD[0] * 0.3 - isHD[1] * 0.03 * Math.sin(tl * 0.3), P[1] - 0.02, P[2] - isHD[1] * 0.3 + isHD[0] * 0.03 * Math.sin(tl * 0.3)], P, 60, 0.1, t); bloom = 0.3; break;
    }
    case 'edge': {
      mode = isMODES.sunset; coinMode = 'edge';
      stand({ expr: tl > 1 ? [['surprised', 0.6], ['amazed', 0.4]] : 'neutral', look: [0, -30], add: { neck: [14, 0, 0], head: [16, 0, 0], spine: [4, 0, 0] } });
      if (k < 0.5) { const dv = V3(-isHD[1], 0, isHD[0]).applyAxisAngle(V3(0, 1, 0), 0.6); shotCam(g, [C[0] + dv.x * 0.24, C[1] + 0.036, C[2] + dv.z * 0.24], [C[0], C[1] + 0.03, C[2]], 50, 0.05, t); }
      else shotCam(g, isPt(base, 2.9, 2.0, 0.85), isPt(base, 0.35, 0, 0.75), 28, 0.35, t);
      break;
    }
    case 'nobody': {
      const kk = ease(clamp((k - 0.08) / 0.85)); mode = isBlend(isMODES.sunset, isMODES.clear, kk); coinMode = 'edge'; gulls = kk > 0.5;
      const up = ease(clamp((k - 0.45) / 0.3));
      stand({ expr: [['amazed', 1 - up], ['happy', up]], look: [0, lerp(-30, 25, up)], add: { neck: [lerp(14, -6, up), 0, 0], head: [lerp(16, -8, up), 0, 0] } });
      shotCam(g, isPt(base, 0.95, -0.35, 0.16), isPt(base, 0, 0, lerp(1.2, 1.7, up)), 22, 0.3, t); break;
    }
    case 'smile': {
      mode = isMODES.clear; gulls = true; coinMode = 'edge';
      const lf = Math.sin(t * 13) * 2;
      stand({ pose: [['stand', 0.8], ['shrug', 0.2]], expr: [['joy', 0.75], ['happy', 0.25]], look: [0, 8], add: { neck: [-6 + lf * 0.3, 0, 0], head: [-9, 0, 4], chest: [-2 + lf, 0, 0], spine: [-3, 0, 0] } });
      shotCam(g, isPt(base, 2.3 - k * 0.4, -0.45, 1.45), isPt(base, 0, 0, 1.42), 35, 0.4, t); break;
    }
    default: { isSitBoat(S); shotCam(g, isAt(S, -4.3, 1.7, 1.05), isAt(S, 1.2, -0.2, 1.15), 32, 1, t); leaps = true; }
  }
  isApply(S, mode);
  const stormy = mode.storm > 0.5;
  S.palms.forEach((p) => p.sway(t, stormy ? 1 : 0.5));
  if (leaps) isFishLeap(S, t); else if (stream) isFishStream(S, t, b); else S.pile.forEach(() => {});
  if (!leaps && !stream) S.feat.forEach((f) => { f.visible = false; });
  if (rainP) isRainProps(S, t, b, base);
  // the coin
  if (coinMode) {
    const c = S.coin; c.visible = true; let gk = 0.4;
    if (coinMode === 'hand') { const A = CH.arms.R, fi = A.fingers[0][2].getWorldPosition(V3(0, 0, 0)), th = A.th[2].getWorldPosition(V3(0, 0, 0)); c.position.copy(fi).lerp(th, 0.5).addScaledVector(g.cam.position.clone().sub(fi).normalize(), 0.012); c.lookAt(g.cam.position); c.rotateX(Math.PI / 2); c.rotateZ(0.55); c.visible = k > 0.3; gk = 0.8; }
    else if (coinMode === 'flip') {
      const gp = CH.arms.R.grip.getWorldPosition(V3(0, 0, 0)), s0 = tl - 3.0;
      if (s0 < 0) { c.position.copy(gp); c.quaternion.setFromEuler(new THREE.Euler(0.4, 0, 0)); }
      else { const s = Math.min(s0, 0.42) + Math.max(0, s0 - 0.42) * 0.14, y = 5.2 * s - 4.9 * s * s; c.position.set(gp.x + isHD[0] * 0.25 * s, gp.y + y, gp.z + isHD[1] * 0.25 * s); c.quaternion.setFromAxisAngle(V3(-isHD[1], 0, isHD[0]), 0.6 + s * TAU * 4.5); }
      gk = 1.2;
    } else if (coinMode === 'spin') { c.position.set(...isPt(base, 0.35, -0.05, 2.55 - tl * 0.01)); c.quaternion.setFromAxisAngle(V3(-isHD[1], 0, isHD[0]).applyAxisAngle(V3(0, 1, 0), 0.35), 0.4 + tl * 1.9); gk = 2.4; }
    else {   // standing on its edge in the sand (it lands at 0.7 s into the edge beat)
      const et = b.shot === 'edge' ? tl - 0.7 : 99, ax = V3(-isHD[1], 0, isHD[0]);
      if (et < 0) { c.position.set(C[0], C[1] + 0.04 - et * 3.2, C[2]); c.quaternion.setFromAxisAngle(ax, et * 14); }
      else { const wob = 0.22 * Math.exp(-et * 3.2) * Math.sin(et * 19); c.position.set(C[0], C[1] + 0.003 + 0.0262, C[2]); c.quaternion.setFromAxisAngle(V3(isHD[0], 0, isHD[1]), Math.PI / 2 + wob).premultiply(new THREE.Quaternion().setFromAxisAngle(V3(0, 1, 0), 0.25)); }
      if (!S.fineFit) { S.fineFit = true; const fg = new THREE.PlaneGeometry(1.8, 1.8, 36, 36); fg.rotateX(-Math.PI / 2); const P = fg.attributes.position; const ca = []; for (let i = 0; i < P.count; i++) { P.setY(i, isSurf(S, C[0] + P.getX(i), C[2] + P.getZ(i)) - C[1] + 0.003); const r = Math.hypot(P.getX(i), P.getZ(i)) / 0.9; ca.push(1, 1, 1, ss(1, 0.6, r)); } fg.setAttribute('color', new THREE.Float32BufferAttribute(ca, 4)); fg.computeVertexNormals(); S.fine.geometry = fg; S.fine.rotation.set(0, 0, 0); S.fine.material.map.repeat.set(10, 10); }
      S.fine.visible = true; S.fine.position.set(C[0], C[1], C[2]); S.cshadow.visible = et >= 0; S.cshadow.position.set(C[0], C[1] + 0.0045, C[2]); S.cshadow.rotation.set(-Math.PI / 2, 0, Math.atan2(isHD[1], isHD[0]) + 0.25 + Math.PI / 2, 'YXZ'); S.cshadow.rotation.set(-Math.PI / 2, 0, 0); S.cshadow.rotateZ(-(Math.atan2(isHD[1], isHD[0]) + 0.25)); gk = b.shot === 'edge' && k < 0.5 ? 0.25 : 0.5;
    }
    S.coin.updateMatrixWorld(); S.coinGK = gk;
  }
  // gulls
  if (gulls) S.gulls.forEach((q, i) => { const R = q.R, ph = t * R.r(0.08, 0.14) + R.f(), ang = ph * TAU, rad = R.r(14, 30); q.gr.visible = true;
    q.gr.position.set(base[0] + isHD[0] * 12 + Math.cos(ang) * rad, R.r(7, 14) + Math.sin(t * 0.7 + i) * 0.6, base[2] + isHD[1] * 12 + Math.sin(ang) * rad); q.gr.rotation.set(0, -ang - Math.PI / 2 * (R.f() < 2 ? 1 : 1), Math.sin(t + i) * 0.2);
    const fl = Math.sin(t * R.r(5, 7) + i); q.wings.forEach(([w, s]) => { w.rotation.x = s * fl * 0.6; }); q.gr.scale.setScalar(1.2); });
  // camera-dependent systems
  g.cam.far = 4000; g.cam.updateProjectionMatrix();
  S.U.uCam.value.copy(g.cam.position); S.U.uAbove.value = g.cam.position.y > isDECK[1] ? 1 : 0;
  let act = [];
  if (stormy) act = S.light.update(g.cam, t); else { S.light.mesh.geometry.setDrawRange(0, 0); }
  S.light.mesh.visible = stormy;
  const top4 = act.filter((a) => a.I > 0.02).sort((a, c) => c.I - a.I).slice(0, 4);
  S.U.uBolt.value.forEach((v, i) => { const a = top4[i]; if (a) v.set(a.bot.x * 0.5 + a.top.x * 0.5, 14, a.bot.z * 0.5 + a.top.z * 0.5, a.I * 1.2); else v.set(0, -999, 0, 0); });
  S.U.uFlash.value = 0.5 * clamp(act.reduce((m, a) => m + a.I * Math.exp(-a.bot.distanceTo(g.cam.position) / 220), 0));
  const near = act.find((a) => a.b.near); S.bolt.intensity = near ? near.I * 5 : 0; if (near) S.bolt.position.set(near.bot.x, 6, near.bot.z);
  S.clouds.update(g.cam); if (!stormy) S.clouds.below.visible = S.clouds.above.visible = false;
  S.scud.mesh.visible = mode.cloudA > 0.01 && S.U.uAbove.value < 0.5; if (S.scud.mesh.visible) S.scud.update(g.cam, act);
  S.rain.face(g.cam); S.rain.lines.visible = stormy && S.U.uAbove.value < 0.5;
  S.spl.begin(g.cam);
  if (leaps || stream) [...S.leap, ...S.feat].forEach((f, i) => { if (f.visible !== false && f.userData.st) S.spl.burst('l' + i + '_' + f.userData.cyc, f.userData.st, f.userData.age, 1, 40); });
  if (stream) isFishTrails(S, t, b);
  if (near) S.spl.burst('strike' + Math.round(isNearT * 10), near.bot, t - isNearT, 2.2, 160);
  if (meteor) { const hits = S.meteors.update(g.cam, tl); hits.forEach(([p, age], i) => S.spl.burst('met' + i + Math.round(p.x), p, age, 2.4, 120)); }
  if (coinMode === 'edge' && b.shot === 'edge') S.spl.burst('sandpuff', V3(C[0], C[1], C[2]), tl - 0.7, 0.18, 60);
  S.spl.end();
  if (S.coin.visible) isGlint(S, g, S.coin.position, S.coinGK * (0.25 + 1.2 * isCoinGlintK(S, g)));
  g.r.toneMappingExposure = mode.exp;
  present(g, S.scene, { bloom, clear: '#101418' });
  g.r.toneMappingExposure = 1.0;
  ctx.save(); screen(); const vg = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.4, W / 2, H * 0.55, H * 1.08); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(4,8,14,${grade})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// the fish beat: a steady stream of fish leaping in clean arcs from the sea into the boat
function isFishStream(S, t, b) {
  const tl = t - b.t0, PER = 0.4, FL = 1.15, B = S.boat.grp;
  const pool = S.leap.slice(0, 4); pool.forEach((f) => { f.visible = false; f.scale.setScalar(0.55); });
  const j1 = Math.floor(tl / PER);
  for (let j = j1 - 3; j <= j1; j++) {
    if (j < 0) continue; const R = RNG('stream', j), f = pool[((j % 4) + 4) % 4], u = (tl - j * PER) / FL;
    if (u < 0 || u > 1) continue; f.visible = true;
    const arc = isStreamArc(S, j), P = arc(u), Q = arc(Math.min(1, u + 0.01));
    f.position.copy(P); f.lookAt(Q); f.rotateY(-Math.PI / 2); f.rotateX(Math.sin(t * 7 + j) * 0.3); f.userData.tail.rotation.y = Math.sin(t * 26 + j) * 0.55;
    f.userData.st = arc(0); f.userData.age = u * FL; f.userData.cyc = j;
  }
  S.pile.forEach((f, i) => { const R = RNG('pile', i); f.position.set(0.32 + R.r(0, 0.42), -S.boat.Db + 0.13 + i * 0.012, R.n(0.18)); f.rotation.set(Math.PI / 2 + R.n(0.2), R.r(-0.6, 0.6) + (i % 2) * Math.PI, 0, 'YXZ'); f.userData.tail.rotation.y = Math.sin(t * 14 + i * 2) * 0.35 * (i % 2); });
}
function isStreamArc(S, j) {
  const R = RNG('stream', j), st = V3(...isAt(S, 5.4 + R.r(0, 1.4), R.n(0.5), 0)), en = V3(0.42 + R.r(0, 0.2), -0.12, R.n(0.12)); S.boat.grp.localToWorld(en); st.y = 0; const h = 2.2 + R.r(0, 0.5);
  return (u) => { const p = st.clone().lerp(en, u); p.y = lerp(st.y, en.y, u) + 4 * h * u * (1 - u); return p; };
}
function isFishTrails(S, t, b) {   // droplets strung along each arc behind the fish
  const tl = t - b.t0, PER = 0.4, FL = 1.15, j1 = Math.floor(tl / PER);
  for (let j = j1 - 3; j <= j1; j++) { if (j < 0) continue; const u = (tl - j * PER) / FL; if (u < 0 || u > 1.25) continue; const arc = isStreamArc(S, j);
    for (let i = 1; i < 26; i++) { const s = u - i * 0.022; if (s < 0 || s > 1) continue; const p = arc(s), age = i * 0.022 * FL; p.y -= 4.9 * age * age * 0.5; S.spl.dot(p, 0.03 * (1 - i / 30), 0.9 * (1 - i / 26) * (u > 1 ? Math.max(0, 1 - (u - 1) / 0.25) : 1)); } }
}

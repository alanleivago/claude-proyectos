// =====================================================================
//  CORE 3D — shared by the three stages (near / high / space).
//  - g3(): one WebGL renderer (1920x1080, log depth, VSM shadows) into an offscreen canvas, drawn under the 2D HUD.
//  - FLOATING ORIGIN: the camera stays at x = z = 0; the world moves. A fixed world point (xw, zw) sits at
//    camera-relative (xw, zw + travel(st)). The wave moves towards -Z (the shore is ahead, at -Z).
//  - rideCam(st): the surfer's eye: height, yaw, pitch, roll, fov. Stages pose g.cam with applyCam().
//  - the WAVE: one long ridge along X, crest at height waveH(st), face falling towards -Z. Built in H units and
//    scaled each frame; its shader (teal body, backlit crest, foam, streaks) bends with the planet (CURVE_GLSL).
//  - the RIDER: board + forearms + spray in an overlay scene drawn on top (camera space, own lights).
//  Units: metres. Story time `st` (see head: storyT).
// =====================================================================
THREE.ColorManagement.legacyMode = false;   // hex colours are sRGB
const lin = (h) => new THREE.Color(h);
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const R_EARTH = 6371000;
// the sun: low, ahead-right of the usual view, slightly behind the wave so the crest glows when backlit
const SUN = new THREE.Vector3(0.88, 0.2, 0.42).normalize();

// ---- the rider's eye
// yaw 0 = looking at the shore (-Z). Negative yaw turns right (+X), down the line of the wave.
const YAW = [[0, -50], [7, -50], [30, -50], [60, -46], [90, -42], [130, -38], [160, -40], [195, -30], [240, -38], [290, -40], [330, -20], [380, -10], [405, -10], [440, 0], [470, 0], [510, 0]];
const PITCH = [[0, -14], [7, -6], [40, -8], [90, -12], [110, -11], [130, -11], [150, -10], [165, -10], [182, -11], [188, -15], [197, -20], [212, -20], [228, -24], [245, -17], [290, -16], [330, -48], [380, -55], [405, -40], [440, -8], [468, 2], [480, 18], [510, 20]];
// the board climbs the face as the wave grows so the land ahead isn't hidden by the face (H units; the face tops out at z -0.18)
const BOARD_POS = [[0, -0.22], [60, -0.22], [100, -0.195], [130, -0.185], [510, -0.185]];
function rideCam(st) {
  const Hm = waveH(st), n = (a, b, c) => Math.sin(st * a + b) * c;
  // carving: a slow S-turn every ~7 s, the board rocks, the body absorbs it
  const carve = n(0.9, 0.3, 1) + n(0.37, 1.7, 0.6);
  return {
    eye: 1.15 + 0.12 * n(1.9, 0.5, 1),                            // eye above the board (crouched)
    pos: knots(BOARD_POS, st),                                    // where on the face the board is (H units): mid-face, climbing to the top as it grows
    yaw: (knots(YAW, st) + 3.5 * carve + n(0.23, 2.1, 1.2)) * DEG,
    pitch: (knots(PITCH, st) + 1.2 * n(1.3, 0.2, 1) + 0.6 * n(2.9, 1.1, 1)) * DEG,
    roll: (-2.4 * carve + 0.5 * n(2.3, 0.4, 1)) * DEG,
    fov: 52,
    H: Hm,
  };
}
// the board's height above sea level (m): on the face just under the crest
// the crest-line wobble at x = 0 (same as the wave shader's) and a margin for the polyline's chords
const waveWob = (st) => 1 + 0.05 * Math.sin(st * 0.35) + 0.03 * Math.sin(-st * 0.6 + 1.3);
const boardY = (st) => waveH(st) * (waveProfile(rideCam(st).pos)[1] * waveWob(st) + 0.003);
const eyeY = (st) => boardY(st) + rideCam(st).eye;
function applyCam(g, st, near, far) {
  const c = rideCam(st), cam = g.cam;
  cam.position.set(0, eyeY(st), 0); cam.rotation.set(c.pitch, c.yaw, c.roll); cam.fov = c.fov;
  cam.near = near; cam.far = far; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  return c;
}

// ---- the wave profile in H units, front (shore side, -z) to back: trough, concave face, a lip pitching forward, the crest, the long back.
// Control points (z, y); the sheet folds over itself at the lip (underside -> tip -> top).
const WAVE_PTS = [[-2.8, -0.02], [-1.8, -0.03], [-1.25, -0.01], [-0.9, 0.05], [-0.62, 0.15], [-0.43, 0.28], [-0.3, 0.43], [-0.22, 0.58], [-0.18, 0.72],
  [-0.19, 0.82], [-0.25, 0.89], [-0.34, 0.92], [-0.4, 0.91],                 // under the lip, out to the tip
  [-0.36, 0.96], [-0.24, 1.01], [-0.08, 1.04], [0.08, 1.03],                 // over the lip to the crest
  [0.3, 0.92], [0.6, 0.72], [1.0, 0.5], [1.6, 0.28], [2.6, 0.12], [4.0, 0.04], [6.0, 0.0]];
const WAVE_FACE_END = 9, WAVE_LIP_TIP = 12, WAVE_CREST = 16;   // indices in WAVE_PTS
// sample the profile as a dense polyline by Catmull-Rom, with each sample's index position k (0..n-1 in WAVE_PTS units)
const WAVE_PROF = (() => {
  const P = WAVE_PTS, out = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)], n = 12;
    for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1]), i + t]); }
  }
  out.push([...P[P.length - 1], P.length - 1]); return out;
})();
// the face's height at z (H units, on the face before the lip) -> [z, y]
function waveProfile(z) {
  for (let i = 0; i < WAVE_PROF.length - 1; i++) { const a = WAVE_PROF[i], b = WAVE_PROF[i + 1]; if (b[2] > WAVE_FACE_END) break;
    if (z >= a[0] && z <= b[0]) return [z, lerp(a[1], b[1], (z - a[0]) / (b[0] - a[0]))]; }
  return [z, 0];
}
const CURVE_GLSL = `
  uniform float uCurveR;
  vec3 curveDrop(vec3 w){ float d2 = w.x * w.x + w.z * w.z; w.y -= d2 / (2.0 * uCurveR); return w; }`;
const CURVE_R = { value: R_EARTH };
const FOGC = { value: lin('#cfd8e6') }, FOGD = { value: 0.00002 }, SKYC = { value: lin('#9ab8dc') };
const SUNU = { value: SUN.clone() }, TIMEU = { value: 0 };

function buildWave() {
  // a sheet: i across the crest line (x in [-1, 1], denser in the middle), j along the profile polyline
  const PR = WAVE_PROF, NX = 420, NZ = PR.length - 1;
  const pos = new Float32Array((NX + 1) * (NZ + 1) * 3), kk = new Float32Array((NX + 1) * (NZ + 1)), idx = [];
  for (let j = 0; j <= NZ; j++) for (let i = 0; i <= NX; i++) {
    const k = j * (NX + 1) + i, u = i / NX * 2 - 1, x = Math.sign(u) * Math.pow(Math.abs(u), 1.8);
    pos[k * 3] = x; pos[k * 3 + 1] = PR[j][1]; pos[k * 3 + 2] = PR[j][0]; kk[k] = PR[j][2];
  }
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  // the same sheet with no curl: the lip rows laid along a straight rise from the face top to the crest (a spilling wave)
  const flat = new Float32Array((NX + 1) * (NZ + 1) * 2), fz0 = WAVE_PTS[WAVE_FACE_END - 1], fz1 = WAVE_PTS[WAVE_CREST];
  for (let j = 0; j <= NZ; j++) { const kp = PR[j][2], u = clamp((kp - (WAVE_FACE_END - 1)) / (WAVE_CREST - (WAVE_FACE_END - 1)));
    const inLip = kp > WAVE_FACE_END - 1 && kp < WAVE_CREST, zf = inLip ? lerp(fz0[0], fz1[0], u) : PR[j][0], yf = inLip ? lerp(fz0[1], fz1[1], Math.pow(u, 0.8)) : PR[j][1];
    for (let i = 0; i <= NX; i++) { const k = j * (NX + 1) + i; flat[k * 2] = yf; flat[k * 2 + 1] = zf; } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('kp', new THREE.BufferAttribute(kk, 1)); geo.setAttribute('lipFlat', new THREE.BufferAttribute(flat, 2)); geo.setIndex(idx);
  const U = { uH: { value: 1 }, uL: { value: 600 }, uT: TIMEU, uSun: SUNU, uFog: FOGC, uFogD: FOGD, uSky: SKYC, uCurveR: CURVE_R,
    uDeep: { value: lin('#0c5462') }, uFace: { value: lin('#22a29c') }, uGlow: { value: lin('#74ecc8') }, uFoam: { value: lin('#f4fbfb') },
    uBoil: { value: 0 }, uIce: { value: 0 }, uDark: { value: 0 }, uCurl: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, side: THREE.DoubleSide,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      uniform float uH, uL, uT; ${CURVE_GLSL}
      attribute float kp; attribute vec2 lipFlat; uniform float uCurl;
      varying vec3 vW; varying vec2 vQ; varying float vK, vY, vTap;
      vec3 place(vec3 p){
        float tap = smoothstep(1.0, 0.5, abs(p.x));                 // the ridge fades out at both ends
        float xm = p.x * uL;
        float wob = 1.0 + 0.05 * sin(xm / uH * 0.19 + uT * 0.35) + 0.03 * sin(xm / uH * 0.47 - uT * 0.6 + 1.3);
        return vec3(xm, p.y * uH * tap * wob, p.z * uH * mix(1.0, 1.6, 1.0 - tap)); }
      void main(){
        vec3 p = place(vec3(position.x, mix(lipFlat.x, position.y, uCurl), mix(lipFlat.y, position.z, uCurl)));
        vec4 w = modelMatrix * vec4(p, 1.0); w.xyz = curveDrop(w.xyz);
        vW = w.xyz; vQ = vec2(position.x * uL / uH, position.z); vK = kp; vY = position.y; vTap = smoothstep(1.0, 0.5, abs(position.x));
        gl_Position = projectionMatrix * viewMatrix * w;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uH, uL, uT, uFogD, uBoil, uIce, uDark; uniform vec3 uSun, uFog, uSky, uDeep, uFace, uGlow, uFoam;
      varying vec3 vW; varying vec2 vQ; varying float vK, vY, vTap;
      float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
      void main(){
        #include <logdepthbuf_fragment>
        if (vTap < 0.02) discard;
        vec3 N = normalize(cross(dFdx(vW), dFdy(vW)));
        vec3 V = normalize(cameraPosition - vW); if (dot(N, V) < 0.0) N = -N;
        // micro relief: wind ripples in metres (fade out with distance) + broad drapes in H units; tangent frame from the surface
        float dist0 = length(vW - cameraPosition);
        vec3 Tx = normalize(dFdx(vW)), Ty = normalize(cross(N, Tx));
        vec2 mq = vec2(vW.x, vW.z + vW.y * 0.5) * 0.9 + vec2(uT * 0.7, -uT * 1.3);
        float e = 0.35, h0 = fbm(mq), hx = fbm(mq + vec2(e, 0.0)), hy = fbm(mq + vec2(0.0, e));
        float mfade = 1.0 - smoothstep(30.0, 900.0, dist0);
        vec2 dq = vec2(vQ.x * 6.0, vK * 0.8 - uT * 0.05);
        float d0 = fbm(dq), dx = fbm(dq + vec2(0.05, 0.0)), dy = fbm(dq + vec2(0.0, 0.05));
        N = normalize(N + (Tx * (h0 - hx) + Ty * (h0 - hy)) * 1.1 * mfade + (Tx * (d0 - dx) + Ty * (d0 - dy)) * 3.5);
        float k = vK, y = vY * vTap;
        float isFace = 1.0 - smoothstep(${(WAVE_FACE_END - 0.5).toFixed(1)}, ${(WAVE_FACE_END + 0.5).toFixed(1)}, k);
        float isLip = smoothstep(${(WAVE_FACE_END - 1).toFixed(1)}, ${(WAVE_FACE_END).toFixed(1)}, k) * (1.0 - smoothstep(${(WAVE_CREST).toFixed(1)}, ${(WAVE_CREST + 1).toFixed(1)}, k));
        float isBack = smoothstep(${(WAVE_CREST).toFixed(1)}, ${(WAVE_CREST + 2).toFixed(1)}, k);
        // pattern coordinates: along the crest line in H units, and the profile index (so it reads the same at any size)
        float flow = uT * 0.09;
        vec2 q = vec2(vQ.x, k);
        // body colour: deep at the trough, teal up the face, glowing green where the lip is thin and backlit
        vec3 col = mix(uDeep, uFace, smoothstep(0.0, 0.75, y));
        float back = pow(clamp(dot(-V, uSun) * 0.5 + 0.5, 0.0, 1.0), 2.5);
        float thin = (smoothstep(0.55, 0.85, y) * isFace + isLip * 0.9) * (1.0 - isBack);
        col = mix(col, uGlow, clamp(thin * (0.35 + 0.75 * back), 0.0, 1.0) * 0.8);
        // translucent depth: darker vertical bands in the face where the water is thick
        // the back is open ocean: deep blue-teal, darker as it flattens out, no glow
        col = mix(col, mix(uDeep * 0.85, uFace * 0.62, smoothstep(0.2, 0.95, y)), isBack * 0.85);
        col *= 0.88 + 0.12 * fbm(vec2(q.x * 3.0, k * 0.6 - flow));
        float dif = clamp(dot(N, uSun), 0.0, 1.0);
        col *= 0.62 + 0.55 * dif;
        // foam: streaks pulled up the face (water climbs the face into the lip), marbled trough foam, the white lip, the back wash
        float st = fbm(vec2(q.x * 5.0, k * 0.35 + flow * 3.0));
        float streak = smoothstep(0.66, 0.86, fbm(vec2(q.x * 22.0 + st * 4.0, k * 0.22 - flow * 5.0))) * isFace * smoothstep(0.12, 0.55, y);
        float marble = smoothstep(0.5, 0.74, fbm(vec2(q.x * 2.6, k * 0.45) + vec2(0.0, flow * 2.0))) * (1.0 - smoothstep(1.0, 3.0, k)) ;
        float lipF = isLip * (0.45 + 0.55 * smoothstep(0.35, 0.7, fbm(vec2(q.x * 7.0 - uT * 0.25, k * 0.9))));
        lipF = max(lipF, smoothstep(${(WAVE_LIP_TIP - 1).toFixed(1)}, ${(WAVE_LIP_TIP).toFixed(1)}, k) * (1.0 - smoothstep(${(WAVE_CREST + 1).toFixed(1)}, ${(WAVE_CREST + 2).toFixed(1)}, k)));
        float wash = isBack * smoothstep(0.45, 0.8, fbm(vec2(q.x * 3.2, k * 0.5 - uT * 0.04))) * exp(-(k - ${(WAVE_CREST).toFixed(1)}) * 0.25);
        float lace = 1.0 - smoothstep(0.02, 0.09, abs(fbm(vec2(q.x * 9.0, k * 1.1) + vec2(flow, -flow * 3.0)) - 0.5));
        lace *= (0.3 + 0.7 * smoothstep(0.0, 0.5, y)) * (1.0 - isBack) * 0.55;
        float foam = clamp(streak * 0.6 + marble * 0.75 + lipF + wash * 0.8 + lace, 0.0, 1.0);
        // under the lip: shadowed, glowing green; the lip's top and the crest: bright, broken white water
        float under = smoothstep(${(WAVE_FACE_END - 1).toFixed(1)}, ${WAVE_FACE_END.toFixed(1)}, k) * (1.0 - smoothstep(${(WAVE_LIP_TIP - 0.3).toFixed(1)}, ${WAVE_LIP_TIP.toFixed(1)}, k));
        col = mix(col, mix(uDeep, uGlow, 0.35 + 0.4 * back), under * 0.75);
        foam *= 1.0 - under * 0.7;
        vec3 foamC = uFoam * (0.84 + 0.28 * dif) * (0.9 + 0.1 * fbm(q * vec2(30.0, 3.0))) + uGlow * 0.05 * thin;
        col = mix(col, foamC, foam);
        // a ragged lip tip
        float rag = fbm(vec2(q.x * 14.0 - uT * 0.4, k * 2.0));
        if (k > ${(WAVE_LIP_TIP - 1.2).toFixed(1)} && k < ${(WAVE_LIP_TIP + 1.2).toFixed(1)} && rag < 0.55 - abs(k - ${WAVE_LIP_TIP.toFixed(1)}) * 0.5) discard;
        // boiling (very high): white vapour bubbles in the lip; ice: frost over the upper face
        col = mix(col, vec3(0.93, 0.97, 1.0), uBoil * 0.5 * smoothstep(0.55, 0.8, fbm(q * vec2(16.0, 2.0) + uT * 0.6)) * smoothstep(0.5, 1.0, y));
        col = mix(col, vec3(0.84, 0.93, 0.97), uIce * 0.65 * smoothstep(0.3, 1.0, y));
        // sky reflection + sun glints (less on foam)
        float fr = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
        col = mix(col, uSky, fr * 0.5 * (1.0 - foam));
        vec3 Hh = normalize(uSun + V);
        col += vec3(1.0, 0.93, 0.8) * (pow(clamp(dot(N, Hh), 0.0, 1.0), 220.0) * 1.8 + pow(clamp(dot(N, Hh), 0.0, 1.0), 40.0) * 0.18) * (1.0 - foam);
        // subsurface: light through the thin upper face, strongest looking towards the sun
        col += uGlow * 0.22 * smoothstep(0.45, 0.95, y) * back * (1.0 - foam) * (1.0 - isBack);
        float d = length(vW - cameraPosition);
        col = mix(col, uFog, clamp(1.0 - exp(-d * uFogD), 0.0, 1.0));
        col *= 1.0 - uDark;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <encodings_fragment>
      }`,
  });
  mat.extensions = { derivatives: true };
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 1;
  // the plume: spray blown off the back of the crest by the offshore wind (soft points, drawn after the water)
  const NP = 9000, A = new Float32Array(NP * 4), R = RNG('plume'), pp = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) { const u = R.r(-1, 1); A[i * 4] = Math.sign(u) * Math.pow(Math.abs(u), 2.6); A[i * 4 + 1] = R.f(); A[i * 4 + 2] = R.r(0.4, 1.6); A[i * 4 + 3] = R.f(); }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pg.setAttribute('a', new THREE.BufferAttribute(A, 4));
  const PU = { uH: U.uH, uL: U.uL, uT: TIMEU, uCurveR: CURVE_R, uSun: SUNU, uFog: FOGC, uFogD: FOGD, uAmt: { value: 1 }, uIce: U.uIce, uDark: U.uDark, uPx: { value: H / 2 / Math.tan(26 * DEG) } };
  const plume = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: PU, transparent: true, depthWrite: false,
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      uniform float uH, uL, uT, uPx; ${CURVE_GLSL}
      attribute vec4 a; varying float vA; varying vec3 vW;
      void main(){
        float ph = fract(a.y + uT / (2.4 * a.z));
        float tap = smoothstep(1.0, 0.5, abs(a.x));
        vec3 p = vec3(a.x * uL, (1.02 + 0.32 * ph * a.z - 0.1 * ph * ph) * uH * tap, (0.02 + 0.55 * ph * a.z + 0.04 * sin(a.w * 40.0)) * uH);
        vec4 w = modelMatrix * vec4(p, 1.0); w.xyz = curveDrop(w.xyz); vW = w.xyz;
        vec4 mv = viewMatrix * w;
        vA = tap * smoothstep(0.0, 0.15, ph) * (1.0 - ph) * (0.35 + 0.65 * a.w);
        gl_PointSize = clamp(uPx * uH * (0.05 + 0.16 * ph) / max(1e-3, -mv.z), 1.5, 380.0);
        gl_Position = projectionMatrix * mv;
        #include <logdepthbuf_vertex>
      }`,
    fragmentShader: `
      #include <common>
      #include <logdepthbuf_pars_fragment>
      uniform float uAmt, uFogD, uIce, uDark; uniform vec3 uSun, uFog; varying float vA; varying vec3 vW;
      void main(){
        #include <logdepthbuf_fragment>
        vec2 c = gl_PointCoord - 0.5; float r = length(c) * 2.0; if (r > 1.0) discard;
        float a = (1.0 - r * r) * vA * uAmt * 0.32;
        vec3 V = normalize(cameraPosition - vW);
        vec3 col = mix(vec3(0.86, 0.92, 0.95), vec3(1.0, 0.95, 0.86), pow(clamp(dot(-V, uSun), 0.0, 1.0), 6.0));   // backlit spray glows warm
        col = mix(col, uFog, clamp(1.0 - exp(-length(vW - cameraPosition) * uFogD), 0.0, 1.0)) * (1.0 - uDark);
        gl_FragColor = vec4(col, a);
        #include <encodings_fragment>
      }` }));
  plume.frustumCulled = false; plume.renderOrder = 5; m.add(plume);
  return { mesh: m, U, plume, PU };
}
// pose the wave for story time st. The board sits on the face at z = pos (H units); the wave is placed so the board is under the camera.
function updateWave(g, st) {
  const Hm = waveH(st), c = rideCam(st), w = g.wave;
  w.U.uH.value = Hm; w.U.uCurl.value = ss(4.2, 5.8, Hm);   // a small wave spills; the lip pitches over from ~4 m
  w.U.uL.value = Math.min(Math.max(900, 70 * Hm), 0.42 * Math.PI * R_EARTH);   // half length along the crest
  w.mesh.position.set(0, 0, -c.pos * Hm);
  return w;
}

// ---- the renderer
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.VSMShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.autoClear = false;
  const cam = new THREE.PerspectiveCamera(52, W / H, 0.5, 1e6); cam.rotation.order = 'YXZ';
  G = { cv, r, cam, wave: buildWave(), ani: r.capabilities.getMaxAnisotropy() };
  G.rider = buildRider();
  return G;
}

// ---- the rider: the board's nose, two forearms out for balance, spray off the rail. Camera space, drawn on top.
function texBoard() {
  return g3Tex((x, w, h) => {
    const R = RNG('board'); x.fillStyle = '#f3efe6'; x.fillRect(0, 0, w, h);
    // resin sheen and wax bumps
    for (let k = 0; k < 2600; k++) { x.fillStyle = `rgba(${R.f() < 0.5 ? '255,255,255' : '190,180,165'},${R.r(0.05, 0.22)})`; const s = R.r(1, 3.5); x.beginPath(); x.arc(R.r(0, w), R.r(0, h), s, 0, TAU); x.fill(); }
    // the stringer and two stripes
    x.fillStyle = 'rgba(150,120,90,0.55)'; x.fillRect(w / 2 - 1.5, 0, 3, h);
    x.fillStyle = '#e8743b'; x.fillRect(0, h * 0.55, w, h * 0.035); x.fillStyle = '#2a6f8f'; x.fillRect(0, h * 0.6, w, h * 0.018);
    // wet patches
    for (let k = 0; k < 30; k++) { const px = R.r(0, w), py = R.r(0, h * 0.5), rr = R.r(8, 40); const gg = x.createRadialGradient(px, py, 0, px, py, rr); gg.addColorStop(0, 'rgba(120,150,160,0.18)'); gg.addColorStop(1, 'rgba(120,150,160,0)'); x.fillStyle = gg; x.fillRect(px - rr, py - rr, 2 * rr, 2 * rr); }
  }, 256, 1024);
}
function g3Tex(draw, w = 128, h = 128, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const g3Radial = (stops, w = 128) => g3Tex((x) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); stops.forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, w, w); }, w, w);
function buildRider() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(52, W / H, 0.05, 50); cam.rotation.order = 'YXZ';
  const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x2a4a50, 0.9), key = new THREE.DirectionalLight(0xfff0dc, 2.2);
  scene.add(hemi, key, key.target);
  // the board: a smooth parametric surfboard (u: tail -> nose along -Z, a: around the cross-section), with rocker and a domed deck
  const L = 2.3, NU = 120, NA = 48, bpos = [], buv = [], bidx = [];
  const halfW = (u) => 0.27 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.92 + 0.08)), 0.75) * (u < 0.06 ? 0.75 + 4 * u : 1) * (u > 0.85 ? Math.pow((1 - u) / 0.15, 0.55) : 1) + 0.004;
  const thick = (u) => 0.032 * Math.pow(Math.sin(Math.PI * (0.05 + 0.9 * u)), 0.6) + 0.006;
  const rocker = (u) => 0.16 * Math.pow(Math.max(0, (u - 0.6) / 0.4), 2.2) + 0.03 * Math.pow(Math.max(0, (0.2 - u) / 0.2), 2);
  for (let i = 0; i <= NU; i++) { const u = i / NU, z = L * (0.5 - u);
    for (let j = 0; j <= NA; j++) { const th = (j / NA) * TAU, c = Math.cos(th), sn = Math.sin(th), hw = halfW(u), tk = thick(u);
      // a rounded-rail cross-section: flatter deck and bottom, soft rails
      const x = hw * Math.sign(c) * Math.pow(Math.abs(c), 0.55), y = tk * Math.sign(sn) * Math.pow(Math.abs(sn), 0.8) * (sn > 0 ? 1 : 0.6);
      bpos.push(x, y + rocker(u), z); buv.push(x / 0.6 + 0.5, u); }
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NA; j++) { const a0 = i * (NA + 1) + j, b0 = a0 + 1, c0 = a0 + NA + 1, d0 = c0 + 1; bidx.push(a0, b0, c0, b0, d0, c0); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3)); bg.setAttribute('uv', new THREE.Float32BufferAttribute(buv, 2)); bg.setIndex(bidx); bg.computeVertexNormals();
  const board = new THREE.Mesh(bg, new THREE.MeshPhysicalMaterial({ map: texBoard(), roughness: 0.28, metalness: 0.0, clearcoat: 0.8, clearcoatRoughness: 0.18, side: THREE.DoubleSide }));
  // forearms + hands: tapered low-poly limbs with a mitten hand and a thumb (wetsuit sleeves to the wrist)
  const arm = (side) => {
    const g = new THREE.Group(), skin = new THREE.MeshStandardMaterial({ color: lin('#d6a07a'), roughness: 0.55 }), suit = new THREE.MeshStandardMaterial({ color: lin('#1b1f26'), roughness: 0.45 });
    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, 0.5, 16, 1), suit); fore.rotation.x = Math.PI / 2; fore.position.z = -0.25; g.add(fore);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.0425, 0.0425, 0.03, 16), new THREE.MeshStandardMaterial({ color: lin('#e8743b'), roughness: 0.6 })); cuff.rotation.x = Math.PI / 2; cuff.position.z = -0.5; g.add(cuff);
    // the hand: a soft palm, four slightly curled capsule fingers, a thumb (smooth skin like the references)
    const palm = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), skin); palm.scale.set(0.046, 0.02, 0.058); palm.position.set(0, 0, -0.565); g.add(palm);
    for (let f = 0; f < 4; f++) {
      const len = [0.05, 0.058, 0.055, 0.044][f], fx = (-0.03 + f * 0.02) * side, fg = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, len * 0.5, 4, 8), skin); p1.rotation.x = Math.PI / 2; p1.position.z = -len * 0.25; fg.add(p1);
      const p2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.0088, len * 0.4, 4, 8), skin); p2.rotation.x = Math.PI / 2 - 0.12; p2.position.set(0, -0.003, -len * 0.62); fg.add(p2);
      fg.position.set(fx, -0.002, -0.61 + Math.abs(f - 1.5) * 0.005); fg.rotation.set(-0.06 - 0.02 * f, 0.06 * (f - 1.5) * side, 0); g.add(fg);
    }
    const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.04, 4, 8), skin); th.rotation.set(Math.PI / 2, 0, 0); th.position.set(0.05 * -side, -0.008, -0.575); th.rotation.y = -0.7 * side; g.add(th);
    return g;
  };
  const armL = arm(-1), armR = arm(1);
  // spray: soft droplets thrown off the rail, a sprite cloud that streams back past the lens
  const dropTex = g3Radial([[0, 'rgba(255,255,255,0.95)'], [0.4, 'rgba(240,250,255,0.5)'], [1, 'rgba(255,255,255,0)']], 64);
  const NS = 260, sp = new Float32Array(NS * 3), spray = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(sp, 3)),
    new THREE.PointsMaterial({ map: dropTex, size: 0.035, transparent: true, depthWrite: false, opacity: 0.85, sizeAttenuation: true }));
  scene.add(board, armL, armR, spray);
  return { scene, cam, hemi, key, board, armL, armR, spray, NS };
}
// pose the rider in camera space and draw it on top of the world
function drawRider(g, st, light) {
  const R = g.rider, c = rideCam(st), n = (a, b, k) => Math.sin(st * a + b) * k;
  R.cam.fov = c.fov; R.cam.updateProjectionMatrix();
  // the overlay camera sits at the origin with the same rotation as the world camera; the board is posed in world-like axes
  // camera-space rig (like the references' hands): the overlay camera never turns; only the carve rocks the rig
  R.cam.position.set(0, 0, 0); R.cam.rotation.set(0, 0, 0); R.cam.updateMatrixWorld();
  const rk = c.roll - knots(YAW, st) * 0, baseYaw = 0;
  R.board.position.set(0.08 + n(0.9, 0.3, 0.03), -0.92 + n(1.7, 0.2, 0.012), -1.05);
  R.board.rotation.set(0.42 + n(1.3, 0.5, 0.02), -0.12 + n(0.9, 0.3, 0.05), -c.roll * 0.8 + n(2.1, 1.0, 0.015), 'YXZ');
  // forearms: from below the frame's corners up to hands low in the corners (lookAt points the arm's +Z, so aim it backwards)
  const place = (A, side) => {
    const sx = side * (0.5 + n(1.1, side, 0.012)), sy = -0.5 + n(1.4, side, 0.012) - side * c.roll * 0.15;
    const hx = side * (0.36 + n(0.8, side * 2, 0.02)), hy = -0.2 + n(1.25, side + 1, 0.012) - side * c.roll * 0.25, hz = -0.62;
    A.position.set(sx, sy, 0.0); A.lookAt(2 * sx - hx, 2 * sy - hy, 0.0 - hz);
    A.rotateZ(side * (0.15 + n(0.7, side, 0.04)));
  };
  place(R.armL, -1); place(R.armR, 1);
  // spray: droplets leave the rail ahead-left and stream back past the camera (seeded, function of st)
  const P = R.spray.geometry.attributes.position, RR = RNG('spray'), Hm = c.H, power = clamp(0.3 + Math.log10(Math.max(1, Hm)) * 0.12, 0, 0.9);
  for (let i = 0; i < R.NS; i++) {
    const life = RR.r(0.6, 1.4), ph = ((st / life) + RR.f()) % 1, side = RR.f() < 0.75 ? -1 : 1;
    const v = new THREE.Vector3(side * RR.r(0.2, 1.4), RR.r(0.3, 1.6) * (1 - ph) * ph * 4 * power, RR.r(-0.2, 2.6) * ph);
    P.setXYZ(i, v.x * 0.8 + 0.1, -0.85 + v.y * 0.6, -1.6 + v.z * 0.7);
  }
  P.needsUpdate = true; R.spray.material.opacity = 0.75 * (light?.spray ?? 1);
  R.key.position.copy(SUN).applyQuaternion(g.cam.quaternion.clone().invert()).multiplyScalar(10); R.hemi.color.copy(light?.sky ?? lin('#cfe3ff')); R.hemi.groundColor.copy(light?.ground ?? lin('#2a4a50'));
  R.key.intensity = light?.key ?? 2.2; R.hemi.intensity = light?.hemi ?? 0.9;
  g.r.clearDepth(); g.r.render(R.scene, R.cam);
}

// ---- post (2D, on the main canvas): bloom, the sun's flare, vignette
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.6) contrast(2.5) blur(10px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
function sunFlare(g, amt) {
  const s = SUN.clone().multiplyScalar(1e5).add(g.cam.position).project(g.cam); if (s.z > 1 || amt <= 0) return;
  const x = (s.x * 0.5 + 0.5) * W, y = (-s.y * 0.5 + 0.5) * H, on = amt * clamp(1.5 - Math.hypot(s.x, s.y) * 0.7); if (on <= 0.01) return;
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen';
  const gr = ctx.createRadialGradient(x, y, 0, x, y, 520); gr.addColorStop(0, `rgba(255,236,200,${0.55 * on})`); gr.addColorStop(0.12, `rgba(255,214,160,${0.22 * on})`); gr.addColorStop(1, 'rgba(255,200,150,0)');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  for (const [k, r, c] of [[-0.35, 60, '120,200,255'], [-0.7, 26, '255,190,120'], [-1.1, 90, '160,255,200']]) {
    const gx = W / 2 + (x - W / 2) * k, gy = H / 2 + (y - H / 2) * k, g2 = ctx.createRadialGradient(gx, gy, 0, gx, gy, r);
    g2.addColorStop(0, `rgba(${c},${0.1 * on})`); g2.addColorStop(1, `rgba(${c},0)`); ctx.fillStyle = g2; ctx.fillRect(gx - r, gy - r, 2 * r, 2 * r);
  }
  ctx.restore();
}

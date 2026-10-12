
// =====================================================================
//  SPACE — the second scene (kilometres): the Earth below (map, clouds, atmosphere), the Moon and Jupiter flying past,
//  and the stars, bent towards the front by aberration and blue/red-shifted by Doppler as v -> c.
// =====================================================================
const RE = 6371;
const ALT = [[38.5, 60], [39.5, 400], [41, 1500], [43, 4500], [44, 7000], [46, 13000], [48, 26000]];
const STAR_N = 5200;
let GS = null;
function gS() {
  if (GS) return GS;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(66, W / H, 1, 2e7); cam.rotation.order = 'YXZ'; scene.add(cam);
  const sunL = new THREE.DirectionalLight(0xfff4e6, 3.0); sunL.position.copy(SUN).multiplyScalar(1e6); scene.add(sunL);
  scene.add(new THREE.AmbientLight(0x1a2030, 0.25));
  // the Earth: surface map, a cloud shell, a blue rim of atmosphere
  const ET = texEarth(), earth = new THREE.Group(); scene.add(earth);
  const surf = new THREE.Mesh(new THREE.SphereGeometry(RE, 160, 96), STD({ map: ET.map, roughness: 0.75, metalness: 0.0 })); earth.add(surf);
  const cl = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.004, 128, 80), STD({ map: ET.clouds, transparent: true, opacity: 0.7, depthWrite: false, roughness: 1 })); earth.add(cl);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.03, 128, 64), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide, uniforms: { uSun: { value: SUN.clone() } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uSun; varying vec3 vN; varying vec3 vV; varying vec3 vW; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 1.7); float lit = smoothstep(-0.25, 0.4, dot(vN, uSun)); gl_FragColor = vec4(mix(vec3(0.55, 0.75, 1.0), vec3(0.3, 0.55, 1.0), f) * (0.12 + f * 1.2) * lit, 1.0); }' }));
  earth.add(atmo);
  // a soft halo beyond the limb: the back faces of a larger shell, brightest just outside the edge and fading out into space
  const halo = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.09, 128, 64), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide, uniforms: { uSun: { value: SUN.clone() }, uR: { value: RE } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `uniform vec3 uSun; uniform float uR; varying vec3 vW;
      void main(){ vec3 c0 = vec3(0.0); vec3 V = normalize(vW - cameraPosition); vec3 oc = cameraPosition - c0;
        float b = dot(oc, V), d2 = dot(oc, oc) - b * b, h = sqrt(max(d2, 0.0)) - uR;   // the ray's closest height above the surface
        float k = exp(-max(h, 0.0) / (uR * 0.022)) * step(0.0, h) + step(h, 0.0) * 0.0;
        vec3 n = normalize(cameraPosition + V * (-b) - c0); float lit = smoothstep(-0.35, 0.35, dot(n, uSun));
        gl_FragColor = vec4(vec3(0.38, 0.62, 1.0) * k * 0.9 * lit, 1.0); }` }));
  earth.add(halo);
  // the Moon and Jupiter
  const MM = texMoonMaps(), moon = new THREE.Mesh(new THREE.SphereGeometry(1737, 128, 96), STD({ map: MM.alb, bumpMap: MM.hgt, bumpScale: 6, roughness: 1 })); scene.add(moon);
  const jup = new THREE.Mesh(new THREE.SphereGeometry(69911, 128, 80), STD({ map: texJupiter(), roughness: 1 })); jup.rotation.z = 0.05; scene.add(jup);
  // the stars: directions on the sky, a colour temperature and brightness each (positions rewritten each frame)
  const R = RNG('starsD'), dirs = [], base = [], sp = new Float32Array(STAR_N * 3), sc = new Float32Array(STAR_N * 3);
  for (let i = 0; i < STAR_N; i++) { const z = R.r(-1, 1), a = R.r(0, TAU), rr = Math.sqrt(1 - z * z); dirs.push(new THREE.Vector3(rr * Math.cos(a), rr * Math.sin(a), z));
    const b = Math.pow(R.f(), 2.2) * 1.4 + 0.25, tint = R.f(); base.push([b, tint < 0.2 ? [1, 0.85, 0.7] : tint < 0.35 ? [0.75, 0.85, 1] : [1, 0.97, 0.93]]); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending,
    map: g3Radial([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']], 32) }));
  stars.frustumCulled = false; stars.renderOrder = -1; scene.add(stars);
  GS = { scene, cam, earth, cl, atmo, moon, jup, stars, sg, dirs, base, sunL };
  return GS;
}
// where the space camera is and where it looks
function spacePose(t) {
  const alt = knots(ALT, t), tb = ss(44, 45.7, t) * (1 - ss(47.6, 48.6, t));
  const pos = new THREE.Vector3(0, RE + alt, 0);
  const pf = knots([[38.5, -2], [40, -7], [41.5, -14], [43, -34], [44, -42]], t) * DEG;
  const qF = new THREE.Quaternion().setFromEuler(new THREE.Euler(pf + 0.02 * Math.sin(t * 0.6), 0.03 * Math.sin(t * 0.4), 0.02 * Math.sin(t * 0.5), 'YXZ'));
  const m = new THREE.Matrix4().lookAt(pos, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 1)), qB = new THREE.Quaternion().setFromRotationMatrix(m);
  const q = qF.clone().slerp(qB, tb);
  return { pos, q };
}
// relativistic sky: aberration cos(th') = (cos th + b) / (1 + b cos th), Doppler D = 1 / (g (1 - b cos th'))
function starsUpdate(S, t, camPos, fwd) {
  const b = t < 56 ? 0 : beta(t), gam = 1 / Math.sqrt(Math.max(1e-30, (1 - b) * (1 + b))), P = S.sg.attributes.position.array, Cc = S.sg.attributes.color.array;
  const up = Math.abs(fwd.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0), e1 = new THREE.Vector3().crossVectors(up, fwd).normalize(), e2 = new THREE.Vector3().crossVectors(fwd, e1);
  const dim = 1 - 0.85 * ss(64.6, 64.95, t) * (1 - ss(65.45, 65.5, t));
  for (let i = 0; i < STAR_N; i++) { const d = S.dirs[i], c = d.dot(fwd), x1 = d.dot(e1), x2 = d.dot(e2), sn = Math.hypot(x1, x2) || 1e-9;
    let c2 = (c + b) / (1 + b * c); c2 = clamp(c2, -1, 1); const s2 = Math.sqrt(Math.max(0, 1 - c2 * c2));
    const dir = fwd.clone().multiplyScalar(c2).addScaledVector(e1, x1 / sn * s2).addScaledVector(e2, x2 / sn * s2).multiplyScalar(1e6).add(camPos);
    P[i * 3] = dir.x; P[i * 3 + 1] = dir.y; P[i * 3 + 2] = dir.z;
    const D = b > 0 ? 1 / (gam * (1 - b * c2)) : 1, [br, tc] = S.base[i], bri = br * Math.min(6, Math.pow(D, 1.6)) * dim, sh = clamp(Math.log2(D) / 3, -1, 1);
    const col = sh > 0 ? [lerp(tc[0], 0.62, sh), lerp(tc[1], 0.78, sh), lerp(tc[2], 1, sh)] : [lerp(tc[0], 1, -sh), lerp(tc[1], 0.35, -sh), lerp(tc[2], 0.18, -sh)];
    Cc[i * 3] = col[0] * bri; Cc[i * 3 + 1] = col[1] * bri; Cc[i * 3 + 2] = col[2] * bri; }
  S.sg.attributes.position.needsUpdate = true; S.sg.attributes.color.needsUpdate = true;
  return { b, gam };
}

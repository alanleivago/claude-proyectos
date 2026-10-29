// =====================================================================
//  WORLD — "Cómo te ve Face ID" (three.js r149), metres. A dark room: the sculpted head (src/head3d.js) at the origin
//  looking along +z, the phone in front of it. Looks on the same face geometry: skin, infrared flood (emissive orange),
//  the depth map (a shader: near = bright), the wire mesh (a uv grid laid on the surface), and the projected dot
//  pattern (a grid of rays from the phone's projector, landed on the face at load time).
// =====================================================================
const PROJ = V3(0.03, -0.06, 0.42);   // the dot projector (head space), where the phone's sensor bar sits
let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  const scene = new THREE.Scene(); scene.background = lin('#07090d'); scene.fog = new THREE.Fog(lin('#07090d'), 1.2, 4);
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.01, 50); scene.add(cam);
  const hemi = new THREE.HemisphereLight(0x8aa0c8, 0x0a0a10, 0.35); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe6d0, 1.1); key.position.set(-0.8, 0.6, 1.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -0.4, right: 0.4, top: 0.4, bottom: -0.4, near: 0.1, far: 4 }); key.shadow.bias = -0.0005; scene.add(key);
  const rim = new THREE.DirectionalLight(0x7ab8ff, 0.7); rim.position.set(0.9, 0.3, -0.8); scene.add(rim);
  // the head
  const H3 = buildHead3D(); scene.add(H3.group); const face = H3.face, geo = face.geometry, skinM = face.material;
  const irM = new THREE.MeshStandardMaterial({ color: lin('#3a1a10'), emissive: lin('#ff6a2a'), emissiveIntensity: 1.0, roughness: 0.7 });
  const depthM = new THREE.ShaderMaterial({ uniforms: { near: { value: 0.3 }, far: { value: 0.6 }, a: { value: 1 } }, transparent: true,
    vertexShader: 'varying float vz; varying vec3 vn; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vz = -mv.z; vn = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform float near; uniform float far; uniform float a; varying float vz; varying vec3 vn; void main(){ float d = clamp((vz - near) / (far - near), 0.0, 1.0); vec3 c = mix(vec3(0.85,1.0,0.98), vec3(0.02,0.25,0.30), pow(d, 0.8)); float rimv = pow(1.0 - abs(vn.z), 2.0); c = mix(c, vec3(0.0,0.06,0.08), rimv * 0.7); gl_FragColor = vec4(c, a); }' });
  // wire mesh: iso-u and iso-v lines over the face from the uv grid (front vertices only)
  const pos = geo.attributes.position, nrm = geo.attributes.normal, uv = geo.attributes.guv ?? geo.attributes.uv, NB = 160, ub = new Int32Array(NB * NB).fill(-1);
  for (let i = 0; i < pos.count; i++) { if (pos.getZ(i) < -0.01) continue; const u = uv.getX(i), v = uv.getY(i); if (u < 0 || u > 1 || v < 0 || v > 1) continue; const k = Math.min(NB - 1, Math.floor(v * NB)) * NB + Math.min(NB - 1, Math.floor(u * NB)); if (ub[k] < 0 || pos.getZ(i) > pos.getZ(ub[k])) ub[k] = i; }
  const uvPt = (u, v) => { const bu = Math.floor(u * (NB - 1)), bv = Math.floor(v * (NB - 1)); for (let rr = 0; rr < 4; rr++) for (let dv = -rr; dv <= rr; dv++) for (let du = -rr; du <= rr; du++) { const a = bu + du, b = bv + dv; if (a < 0 || b < 0 || a >= NB || b >= NB) continue; const i = ub[b * NB + a]; if (i >= 0) return V3(pos.getX(i), pos.getY(i), pos.getZ(i)).addScaledVector(V3(nrm.getX(i), nrm.getY(i), nrm.getZ(i)), 0.0012); } return null; };
  const wireP = []; const GU = 44, GV = 56;
  for (let j = 0; j <= GV; j++) for (let i = 0; i < GU; i++) { const a = uvPt(i / GU, j / GV), b = uvPt((i + 1) / GU, j / GV); if (a && b && a.distanceTo(b) < 0.02) wireP.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  for (let i = 0; i <= GU; i++) for (let j = 0; j < GV; j++) { const a = uvPt(i / GU, j / GV), b = uvPt(i / GU, (j + 1) / GV); if (a && b && a.distanceTo(b) < 0.02) wireP.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wireP, 3));
  const wireM = new THREE.LineBasicMaterial({ color: lin('#e8e2d0'), transparent: true, opacity: 0.8, toneMapped: false }); const wire = new THREE.LineSegments(wg, wireM); H3.group.add(wire);
  const wire2 = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: lin('#3fd0d6'), transparent: true, opacity: 0.8, toneMapped: false })); H3.group.add(wire2);
  // projected dots: a grid of directions from PROJ; each lands on the nearest front-facing vertex along it (bucketed by angle)
  const fwd = V3(0, 0.02, 0).sub(PROJ).normalize(), rgt = V3(0, 1, 0).cross(fwd).normalize().negate(), up = fwd.clone().cross(rgt).negate();
  const ang = (p) => { const d = p.clone().sub(PROJ), z = d.dot(fwd); return [d.dot(rgt) / z, d.dot(up) / z, d.length()]; };
  const AB = 320, AMAX = 0.42, ab = new Int32Array(AB * AB).fill(-1), ad = new Float32Array(AB * AB).fill(1e9), tmp = new THREE.Vector3(), tn = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) { tmp.set(pos.getX(i), pos.getY(i), pos.getZ(i)); tn.set(nrm.getX(i), nrm.getY(i), nrm.getZ(i)); if (tn.dot(PROJ.clone().sub(tmp)) <= 0) continue;
    const [ax, ay, dl] = ang(tmp); const bx = Math.floor((ax / AMAX * 0.5 + 0.5) * AB), by = Math.floor((ay / AMAX * 0.5 + 0.5) * AB); if (bx < 0 || by < 0 || bx >= AB || by >= AB) continue; const k = by * AB + bx; if (dl < ad[k]) { ad[k] = dl; ab[k] = i; } }
  const ND = 170, dotsOn = [], dotsFlat = [];
  for (let j = 0; j < ND * 1.25; j++) for (let i = 0; i < ND; i++) { const R0 = RNG('dot', i, j), ax = ((i + 0.5) / ND - 0.5) * 2 * AMAX * 0.62 + R0.n(0.0015), ay = ((j + 0.5) / (ND * 1.25) - 0.5) * 2 * AMAX * 0.78 + R0.n(0.0015);
    const bx = Math.floor((ax / AMAX * 0.5 + 0.5) * AB), by = Math.floor((ay / AMAX * 0.5 + 0.5) * AB), k = by * AB + bx, vi = ab[k];
    const flat = PROJ.clone().addScaledVector(fwd, 0.36).addScaledVector(rgt, ax * 0.36).addScaledVector(up, ay * 0.36);
    if (vi < 0) continue; const p = V3(pos.getX(vi), pos.getY(vi), pos.getZ(vi)).addScaledVector(V3(nrm.getX(vi), nrm.getY(vi), nrm.getZ(vi)), 0.0015); dotsOn.push(p.x, p.y, p.z); dotsFlat.push(flat.x, flat.y, flat.z); }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.Float32BufferAttribute(dotsOn.slice(), 3)); dg.setAttribute('aOn', new THREE.Float32BufferAttribute(dotsOn, 3)); dg.setAttribute('aFlat', new THREE.Float32BufferAttribute(dotsFlat, 3));
  const dotM = new THREE.PointsMaterial({ color: lin('#ff5a3a'), size: 0.0016, sizeAttenuation: true, transparent: true, opacity: 1, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
  const dots = new THREE.Points(dg, dotM); H3.group.add(dots);
  // the phone (base.js buildPhone, 7.4 x 15.4 cm), screen up, standing in front of the face
  const phone = buildPhone('#3a3f4a'); scene.add(phone);
  // IR rays (a fan of thin lines from the projector), the printed photo (a render of the face on a card), the stored mesh copy
  const rays = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: lin('#ff6a2a'), transparent: true, opacity: 0.35, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(rays);
  const photoRT = new THREE.WebGLRenderTarget(512, 640); photoRT.texture.encoding = THREE.sRGBEncoding;
  const photo = new THREE.Group(); photo.add(mesh(new THREE.BoxGeometry(0.2, 0.25, 0.004), std('#e8e4dc', { r: 0.6 }))); const photoImg = mesh(new THREE.PlaneGeometry(0.184, 0.23), new THREE.MeshBasicMaterial({ map: photoRT.texture, toneMapped: false }), 0, 0, 0.0025, { cast: false }); photo.add(photoImg); scene.add(photo);
  const darkM = new THREE.MeshBasicMaterial({ color: lin('#0a0d14') });
  G = { r, cv, scene, cam, hemi, key, rim, H3, face, skinM, darkM, irM, depthM, wire, wire2, wireM, dots, dotM, dg, phone, rays, photo, photoRT, photoDone: false, fwd, rgt, up };
  return G;
}
// the printed photo: render the lit head head-on into the card's texture (once)
function makePhoto() {
  const g = g3(); if (g.photoDone) return; g.photoDone = true; const c = new THREE.PerspectiveCamera(22, 512 / 640, 0.05, 5); c.position.set(0, 0.02, 0.75); c.lookAt(0, 0.0, 0);
  const vis = [g.wire, g.wire2, g.dots, g.phone, g.rays, g.photo].map((o) => o.visible); [g.wire, g.wire2, g.dots, g.phone, g.rays, g.photo].forEach((o) => (o.visible = false));
  const bg = g.scene.background; g.scene.background = lin('#d8d4cc'); g.face.material = g.skinM; g.r.setRenderTarget(g.photoRT); g.r.render(g.scene, c); g.r.setRenderTarget(null); g.scene.background = bg;
  [g.wire, g.wire2, g.dots, g.phone, g.rays, g.photo].forEach((o, k) => (o.visible = vis[k]));
}
const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion();
// per-shot state
function resetWorld() {
  const g = g3(); makePhoto();
  g.face.material = g.skinM; g.H3.group.visible = true; g.H3.group.position.set(0, 0, 0); g.H3.group.rotation.set(0, 0, 0); g.H3.hair.visible = true; if (g.H3.eyes) g.H3.eyes.visible = true;
  g.wire.visible = g.wire2.visible = g.dots.visible = g.rays.visible = g.photo.visible = false; g.phone.visible = false; g.wire2.position.set(0, 0, 0);
  g.key.intensity = 1.1; g.hemi.intensity = 0.35; g.rim.intensity = 0.7; g.scene.background.set('#07090d'); g.scene.fog.color.set('#07090d');
}
// dots: u = 0 flat grid in the air, 1 = landed on the face; a = opacity; s = size multiplier
function setDots(u, a = 1, s = 1) { const g = g3(), p = g.dg.attributes.position, on = g.dg.attributes.aOn, fl = g.dg.attributes.aFlat; for (let i = 0; i < p.count; i++) p.setXYZ(i, lerp(fl.getX(i), on.getX(i), u), lerp(fl.getY(i), on.getY(i), u), lerp(fl.getZ(i), on.getZ(i), u)); p.needsUpdate = true; g.dots.visible = a > 0; g.dotM.opacity = a; g.dotM.size = 0.0016 * s; }
// the phone placed in head space: pos, rotation (x tilt, y yaw), screen painter
function phoneAt(x, y, z, rx = 0, ry = 0, rz = 0) { const ph = g3().phone; ph.visible = true; ph.position.set(x, y, z); ph.rotation.set(rx, ry, rz); return ph; }
function setRays(a, n = 60) { const g = g3(); if (a <= 0) return; const P = []; const R = RNG('ray'); for (let k = 0; k < n; k++) { const t = V3(R.n(0.06), R.r(-0.08, 0.1), 0.09); P.push(PROJ.x, PROJ.y, PROJ.z, t.x, t.y, t.z); } g.rays.geometry.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.rays.material.opacity = 0.3 * a; g.rays.visible = true; }
const wpt = (obj, x, y, z) => { obj.updateWorldMatrix(true, false); return V3(x, y, z).applyMatrix4(obj.matrixWorld); };

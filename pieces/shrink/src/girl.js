// =====================================================================
//  GIRL — the one character, shared by every scene (the home agent owns this file; others only call it).
//  makeGirl(st) → P (makePerson rig + hoodie, jeans cuffs, sneakers, a long swinging ponytail);
//  placeGirl(P, x, y, z, h, q): stand her at (x, y, z) at height h (scene units), q = posePerson options
//  (yaw, walk, run, armL/armR, headPitch, headYaw, look, crouch, lean, sit, emo, ph). Everything is parented to the
//  rig and scaled with the root, so she looks the same at any size.
// =====================================================================
const GIRL = { skin: '#efc3a0', hair: '#5b3820', top: '#3a8c5c', topDk: '#2a6a46', bottom: '#2b3c5c', shoe: '#f7f7f4' };
let GIRL_H0 = 0, GIRL_FOOT = 0, GIRL_TEX = null;
function girlTex() { if (GIRL_TEX) return GIRL_TEX;
  // hair strands (bump), ribbed knit (cuffs, hem), the kangaroo pocket (stitching, opening edges, alpha trapezoid)
  const strands = g3Tex((x, w, h) => { const R = RNG('gstr'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { const px = R.r(0, w), c = R.f() < 0.5 ? 255 : 0; x.strokeStyle = `rgba(${c},${c},${c},${R.r(0.08, 0.3)})`; x.lineWidth = R.r(0.6, 2); x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + R.n(6), h * 0.3, px + R.n(6), h * 0.7, px + R.n(4), h); x.stroke(); } }, 256, 256, false);
  const rib = wrap(g3Tex((x, w, h) => { x.fillStyle = '#9a9a9a'; x.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 8) { const g = x.createLinearGradient(i, 0, i + 8, 0); g.addColorStop(0, '#606060'); g.addColorStop(0.5, '#e0e0e0'); g.addColorStop(1, '#606060'); x.fillStyle = g; x.fillRect(i, 0, 8, h); } }, 128, 32, false), 6, 1);
  const pocket = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const tw = 0.36, inset = (y) => w * (tw * (1 - y / h) * 0.5 + 0.02);
    x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(inset(0), 0); x.lineTo(w - inset(0), 0); x.lineTo(w - inset(h) , h); x.lineTo(inset(h), h); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(40,40,40,0.55)'; x.lineWidth = 3; x.setLineDash([7, 6]); x.beginPath(); x.moveTo(inset(0) + 10, 10); x.lineTo(w - inset(0) - 10, 10); x.stroke();
    x.beginPath(); x.moveTo(inset(h) + 14, h - 8); x.lineTo(w - inset(h) - 14, h - 8); x.stroke(); x.setLineDash([]);
    [[0, 1], [1, -1]].forEach(([side, s]) => { const x0 = side ? w - inset(0) : inset(0), x1 = side ? w - inset(h) : inset(h); x.strokeStyle = 'rgba(0,0,0,0.6)'; x.lineWidth = 9; x.beginPath(); x.moveTo(x0 + s * 6, 4); x.lineTo(x1 + s * 6, h * 0.8); x.stroke(); }); }, 256, 128);
  return (GIRL_TEX = { strands, rib, pocket }); }
function makeGirl(st) {
  const P = makePerson({ female: true, hairStyle: 'pony', skin: GIRL.skin, hair: GIRL.hair, top: GIRL.top, bottom: GIRL.bottom, shoe: GIRL.shoe, sole: '#ffffff', iris: '#4a6a32', lips: '#c26a66', tie: GIRL.topDk, seed: 777 });
  if (!GIRL_H0) { P.root.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(P.root); GIRL_H0 = b.max.y - b.min.y; GIRL_FOOT = -b.min.y; }
  girlDress(P); st.scene.add(P.root); return P; }
function girlDress(P) { const T = girlTex(), r = P.headR, add = (par, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; par.add(m); return m; };
  const hood = STDm({ color: GIRL.top, roughness: 0.9, bumpMap: fabricTex(), bumpScale: 0.002 }), hoodDk = STDm({ color: GIRL.topDk, roughness: 0.92, bumpMap: T.rib, bumpScale: 0.003, map: T.rib });
  const denim = STDm({ color: '#3a5078', roughness: 0.9, bumpMap: T.rib, bumpScale: 0.002 }), cord = STDm({ color: '#f2efe6', roughness: 0.7 }), metal = STDm({ color: '#d8d8d8', metalness: 0.8, roughness: 0.3 });
  // ---- hair: strand bump on the cap, face-framing locks, and a long ponytail (tapered tube) on its own pivot so it can swing
  const hairM = P.head.children.find((m) => m.isMesh && m.material.color && m.material.color.getHexString() === lin(GIRL.hair).getHexString()).material;
  hairM.bumpMap = T.strands; hairM.bumpScale = 0.004; hairM.roughness = 0.55; hairM.needsUpdate = true;
  P.head.children.filter((m) => m.isMesh && m.position.z < -r * 1.0).forEach((m) => P.head.remove(m));   // the kit's stubby pony + tie
  [-1, 1].forEach((s) => { const l = add(P.head, new THREE.CapsuleGeometry(r * 0.075, r * 0.9, 4, 10), hairM, s * r * 0.84, -r * 0.4, r * 0.28); l.rotation.set(-0.2, 0, s * 0.1); });
  const pony = new THREE.Group(); pony.position.set(0, r * 0.32, -r * 0.92); P.head.add(pony);
  { const pts = [[0, 0, 0], [0, -0.01, -0.05], [0, -0.07, -0.09], [0, -0.14, -0.1], [0, -0.2, -0.09], [0.004, -0.25, -0.075]].map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const N = 40, R0 = 12, g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 1, R0, false), p = g.attributes.position, cur = new THREE.CatmullRomCurve3(pts);
    for (let i = 0; i <= N; i++) { const u = i / N, c = cur.getPointAt(u), rad = 0.034 * (0.55 + 0.75 * Math.sin(Math.min(1, u * 1.6 + 0.15) * Math.PI * 0.85)) * Math.pow(1 - u, 0.45) + 0.002;
      for (let j = 0; j <= R0; j++) { const k = i * (R0 + 1) + j; _v.fromBufferAttribute(p, k).sub(c).multiplyScalar(rad); _v.x *= 1.15; p.setXYZ(k, c.x + _v.x, c.y + _v.y, c.z + _v.z); } }
    g.computeVertexNormals(); const pm = STDm({ color: GIRL.hair, roughness: 0.55, bumpMap: wrap(T.strands.clone(), 1, 3), bumpScale: 0.006 }); pm.bumpMap.needsUpdate = true; pm.bumpMap.rotation = Math.PI / 2; add(pony, g, pm);
    add(pony, new THREE.TorusGeometry(0.03, 0.011, 8, 18), hoodDk, 0, -0.012, -0.045).rotation.x = 1.15; }   // scrunchie
  P.pony = pony;
  // ---- hoodie: hood lying on the upper back, a ribbed collar, drawstrings with aglets, a kangaroo pocket, hem band, cuffs
  add(P.spine, new THREE.SphereGeometry(1, 24, 16).scale(0.13, 0.11, 0.042), hood, 0, 0.37, -0.135).rotation.x = -0.4;
  add(P.spine, new THREE.TorusGeometry(0.1, 0.03, 10, 28, Math.PI * 1.25).rotateZ(-Math.PI * 0.625).rotateX(Math.PI / 2).rotateY(Math.PI / 2), hood, 0, 0.47, -0.012).scale.set(1, 1, 0.82);
  add(P.spine, new THREE.TorusGeometry(0.083, 0.012, 8, 28).rotateX(Math.PI / 2), hoodDk, 0, 0.485, 0.0).scale.set(1, 1, 0.84);
  [-1, 1].forEach((s) => { const c = new THREE.CatmullRomCurve3([[s * 0.03, 0.46, 0.1], [s * 0.036, 0.4, 0.134], [s * 0.04, 0.34, 0.16], [s * 0.042, 0.28, 0.17]].map((a) => new THREE.Vector3(...a)));
    add(P.spine, new THREE.TubeGeometry(c, 16, 0.0045, 6), cord); const e = c.getPointAt(1); add(P.spine, new THREE.CylinderGeometry(0.0055, 0.005, 0.018, 8), metal, e.x, e.y - 0.006, e.z + 0.002).rotation.x = 0.25; });
  { const g = new THREE.PlaneGeometry(0.23, 0.12, 20, 6), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), dy = y + 0.155, rx = lerp(0.158, 0.138, clamp((dy - 0.08) / 0.08)), rz = 0.1 - 0.012 * Math.exp(-(((dy - 0.15) / 0.08) ** 2));
      p.setZ(i, rz * Math.sqrt(Math.max(0.02, 1 - (x / (rx + 0.004)) ** 2)) + 0.006); }
    g.computeVertexNormals(); const m = STDm({ color: GIRL.top, roughness: 0.9, map: T.pocket, alphaTest: 0.5, side: THREE.DoubleSide, bumpMap: fabricTex(), bumpScale: 0.002 }); m.map.encoding = THREE.LinearEncoding;
    add(P.spine, g, m, 0, 0.075, 0); }
  add(P.hips, new THREE.CylinderGeometry(1, 1, 0.034, 32, 1, true).scale(0.174, 1, 0.12), hoodDk, 0, 0.0, -0.003).material = Object.assign(hoodDk.clone(), { side: THREE.DoubleSide });
  P.arms.forEach((A) => add(A.el, new THREE.CylinderGeometry(0.033, 0.032, 0.04, 16, 1, true), Object.assign(hoodDk.clone(), { side: THREE.DoubleSide }), 0, -0.235, 0));
  // ---- jeans: rolled cuffs at the ankles; sneakers: tongue + laces, a grey midsole stripe, a green heel tab
  const laceM = STDm({ color: '#dcdcd6', roughness: 0.8 }), midM = STDm({ color: '#c9c9c4', roughness: 0.7 }), tabM = STDm({ color: GIRL.top, roughness: 0.7 });
  P.legs.forEach((L) => { add(L.kn, new THREE.CylinderGeometry(0.046, 0.046, 0.034, 18, 1, true), Object.assign(denim.clone(), { side: THREE.DoubleSide, color: lin('#4a6290') }), 0, -0.39, 0);
    const tg = add(L.ft, new THREE.BoxGeometry(0.05, 0.012, 0.075), laceM, 0, 0.028, 0.085); tg.rotation.x = -0.42;
    for (let k = 0; k < 3; k++) add(L.ft, new THREE.BoxGeometry(0.052, 0.005, 0.006), STDm({ color: '#b8b8b2' }), 0, 0.036 - k * 0.011, 0.07 + k * 0.022).rotation.x = -0.42;
    add(L.ft, new THREE.BoxGeometry(0.104, 0.008, 0.274).translate(0, 0, 0.055), midM, 0, -0.034, 0);
    add(L.ft, new THREE.BoxGeometry(0.03, 0.035, 0.012), tabM, 0, 0.012, -0.035); }); }
function placeGirl(P, x, y, z, h, q = {}) { posePerson(P, Object.assign({}, q, { x, y, z })); P.root.scale.setScalar(h / GIRL_H0); P.root.position.y += GIRL_FOOT * h / GIRL_H0;   // soles on the ground
  // the ponytail hangs (counters head pitch / body lean) and swings with the gait
  if (P.pony) { const w = q.walk || 0, run = q.run || 0, ph = q.ph ?? TT * (6 + 4 * run), sw = (0.12 * w + 0.28 * run) * Math.sin(ph * 2 + 0.6);
    P.pony.rotation.set(-0.85 * (q.headPitch || 0) - 0.6 * (q.lean || 0) - 0.15 * run + 0.5 * Math.abs(sw) * run, 0, 0.3 * (q.headYaw || 0) + sw * 0.6 + 0.04 * Math.sin(TT * 1.3)); } }

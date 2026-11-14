// sets/p2people.js — LARGO 2 v2: DUTCH y MARLA sobre personajes low poly CC0 de Quaternius (poly.pizza "Man" HMnuH5geEG y
// "Woman" AQsd9ngvKU; models/dutch_base.glb, marla_base.glb), con cara modelada (ojos, cejas, pelo). Recoloreados por material:
//  MARLA (la archivista de la Parte 1: la silueta tenia el pelo recogido en un MOÑO) = pelo gris con moño, cardigan verde
//   oscuro sobre blusa crema, falda/pantalon gris; BUFANDA de cuadros rojos envuelta en el antebrazo DERECHO (mordida), con una
//   mancha de sangre, visible en todos sus planos.
//  DUTCH = mono naranja con cuello y numero 4417 en el pecho, pelo rapado oscuro, barba de dos dias (tinte), piel morena.
// API: const p = await makePerson(L, 'dutch'|'marla'); scene.add(p.root); p.pose(t, 'idle'|'sit'|'stand', {talk}); p.head
const GLB = {};
export async function makePerson(L, kind) {
  const { THREE } = L, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const file = kind === 'dutch' ? 'dutch_base' : 'marla_base', pre = kind === 'dutch' ? 'Man' : 'Female';
  if (!GLB[file]) GLB[file] = await L.loadModel(`models/${file}.glb`);
  const G = GLB[file];
  const SK = await import('three/addons/utils/SkeletonUtils.js');
  const model = SK.clone(G.scene), inner = new THREE.Group(), root = new THREE.Group(); inner.add(model); root.add(inner);
  const COL = kind === 'dutch'
    ? { Shirt: 0xd8641c, Pants: 0xc85818, Skin: 0x9a6a4a, Hair: 0x18120e, Eyes: 0x101010, Socks: 0xe8e4dc }
    : { Shirt: 0x6a2a34, LightJacket: 0x2e4a34, Jacket: 0x2a4230, Pants: 0x55524e, Shoes: 0x1a1414, Skin: 0xd8b49a, HairBase: 0x9a9894, Hair: 0xb8b6b0, Eyebrows: 0x6a6866, Eyes: 0x141010 };
  const mats = {};
  model.traverse((o) => {
    if (!o.isMesh) return; o.frustumCulled = false;
    const conv = (m) => { const nm = m.name || ''; if (!mats[nm]) { const c = COL[nm] ?? m.color.getHex(); mats[nm] = L.snap(new THREE.MeshLambertMaterial({ color: c, flatShading: true })); mats[nm].name = nm; } return mats[nm]; };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
  });
  const bone = (n) => { let b = null; model.traverse((o) => { if (!b && o.isBone && o.name === n) b = o; }); return b; };
  const HEAD = bone('Head'), FAR = bone('LowerArmR'), HANDR = bone('MiddleHandR'), CHEST = bone('Chest') || bone('Spine') || HEAD.parent;
  const mixer = new THREE.AnimationMixer(model), acts = {};
  const act = (n) => acts[n] || (acts[n] = (() => { const c = THREE.AnimationClip.findByName(G.animations, `HumanArmature|${pre}_${n}`); const a = mixer.clipAction(c); a.play(); a.setEffectiveWeight(0); return a; })());
  act('Idle').setEffectiveWeight(1); mixer.update(0); root.updateMatrixWorld(true);
  const H = kind === 'dutch' ? 1.86 : 1.64;
  { const bb = new THREE.Box3().setFromObject(model, true), k = H / (bb.max.y - bb.min.y); inner.scale.setScalar(k); root.updateMatrixWorld(true); const b2 = new THREE.Box3().setFromObject(model, true), c2 = b2.getCenter(V()); inner.position.set(-c2.x, -b2.min.y, -c2.z); root.updateMatrixWorld(true); }
  // frente: el modelo de Quaternius mira a +z (verificado en la hoja de prueba); la cara la trae el modelo
  const attachAt = (bn, obj, worldPos) => { obj.position.copy(worldPos); root.add(obj); obj.updateMatrixWorld(true); bn.attach(obj); };
  const hp = HEAD.getWorldPosition(V());
  const qn = (k, d) => Number(L.QS.get(k) ?? d);
  let MH = null, MHQ = null, MOUTH = null;
  // cabeza propia de Marla (la del modelo Quaternius no tiene rasgos): craneo facetado + cara pintada (ojos con blanco, iris,
  // cejas grises, arrugas de frente, patas de gallo y surcos) + nariz + orejas + pelo gris con volumen: casquete con mechones,
  // moño grande con cinta y mechones sueltos a los lados. Mira a +z como el modelo.
  function marlaHead() {
    const g = new THREE.Group(), skin = L.snap(new THREE.MeshLambertMaterial({ color: 0xd8b49a, flatShading: true }));
    const tHair = L.cvs(32, 32, (c) => { c.fillStyle = '#a8a6a0'; c.fillRect(0, 0, 32, 32); const r = L.rng(91); for (let k = 0; k < 70; k++) { c.fillStyle = r() < 0.5 ? '#d6d4ce' : '#7c7a76'; c.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 3 + (r() * 6 | 0)); } });
    const hairM = L.snap(new THREE.MeshLambertMaterial({ map: tHair, color: 0xffffff, flatShading: true }));
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), skin); skull.scale.set(0.86, 1.08, 0.94); g.add(skull);
    const jaw = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.045, 0.07, 7), skin); jaw.position.set(0, -0.075, 0.012); g.add(jaw);
    const tFace = L.cvs(64, 64, (c) => {
      c.fillStyle = '#d8b49a'; c.fillRect(0, 0, 64, 64);
      c.fillStyle = 'rgba(150,100,80,0.55)'; [[22, 9], [24, 13]].forEach(([y, w]) => c.fillRect(32 - w, y, w * 2, 1));   // arrugas de la frente
      c.fillStyle = '#5e5a56'; c.fillRect(17, 27, 11, 2); c.fillRect(36, 27, 11, 2); c.fillRect(16, 28, 2, 1); c.fillRect(46, 28, 2, 1);   // cejas
      c.fillStyle = '#f2ece4'; c.fillRect(18, 31, 9, 4); c.fillRect(37, 31, 9, 4);   // blanco de los ojos
      c.fillStyle = '#4a5a48'; c.fillRect(21, 31, 4, 4); c.fillRect(40, 31, 4, 4); c.fillStyle = '#100c0a'; c.fillRect(22, 32, 2, 2); c.fillRect(41, 32, 2, 2);
      c.fillStyle = '#ffffff'; c.fillRect(22, 32, 1, 1); c.fillRect(41, 32, 1, 1);
      c.fillStyle = '#6a4a3a'; c.fillRect(17, 30, 11, 1); c.fillRect(36, 30, 11, 1);   // parpado
      c.fillStyle = 'rgba(140,90,70,0.6)'; c.fillRect(18, 36, 8, 1); c.fillRect(38, 36, 8, 1); c.fillRect(13, 31, 2, 1); c.fillRect(13, 33, 2, 1); c.fillRect(49, 31, 2, 1); c.fillRect(49, 33, 2, 1);   // ojeras y patas de gallo
      c.fillStyle = 'rgba(140,90,70,0.55)'; for (let y = 41; y < 50; y++) { c.fillRect(24 - ((y - 41) >> 2), y, 1, 1); c.fillRect(40 + ((y - 41) >> 2), y, 1, 1); }   // surcos nasogenianos
      c.fillStyle = '#8a4a44'; c.fillRect(26, 50, 12, 2); c.fillStyle = '#5a2a28'; c.fillRect(27, 50, 10, 1);   // boca
      c.fillStyle = 'rgba(190,120,110,0.35)'; c.fillRect(14, 39, 7, 4); c.fillRect(43, 39, 7, 4);
    });
    const face = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10, Math.PI / 2 - 0.95, 1.9, Math.PI * 0.2, Math.PI * 0.55), L.snap(new THREE.MeshLambertMaterial({ map: tFace, color: 0xffffff })));
    face.scale.set(0.87, 1.09, 0.95); face.position.z = 0.003; g.add(face);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.045, 4), skin); nose.position.set(0, -0.012, 0.097); nose.rotation.x = 0.35; g.add(nose);
    MOUTH = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.006), L.basic(null, 0x2a1210)); MOUTH.position.set(0, -0.058, 0.084); g.add(MOUTH);
    for (const sx of [-1, 1]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.04, 0.026), skin); ear.position.set(sx * 0.087, -0.005, -0.005); g.add(ear); }
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.108, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hairM); cap.scale.set(0.9, 1.0, 1.0); cap.position.set(0, 0.012, -0.006); cap.rotation.x = -0.32; g.add(cap);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.6), hairM); back.scale.set(0.92, 0.95, 1.0); back.position.set(0, 0.0, -0.022); back.rotation.x = -1.35; g.add(back);
    for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.07), hairM); side.position.set(sx * 0.084, 0.025, -0.02); side.rotation.z = sx * 0.12; g.add(side); }
    const bun = new THREE.Mesh(new THREE.IcosahedronGeometry(0.052, 1), hairM); bun.scale.set(1, 0.85, 0.9); bun.position.set(0, 0.07, -0.115); g.add(bun);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 4, 10), L.lam(null, 0x3a2a24)); band.position.set(0, 0.06, -0.085); band.rotation.x = -0.6; g.add(band);
    for (const [sx, a, z] of [[-1, 0.12, 0.02], [1, -0.1, 0.03], [-1, 0.05, -0.02], [1, -0.04, -0.03]]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.085, 0.012), hairM); st.position.set(sx * 0.091, -0.035, z); st.rotation.z = a; g.add(st); }   // mechones sueltos
    return g;
  }
  if (kind === 'dutch') {
    // barba de dos dias: capa oscura translucida sobre mandibula; numero en el pecho; cuello del mono
    const stub = new THREE.Mesh(new THREE.SphereGeometry(0.105, 8, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.3), L.basic(null, 0x2a1e16, { transparent: true, opacity: 0.45, depthWrite: false }));
    stub.scale.set(1.0, 1.15, 1.0); attachAt(HEAD, stub, hp.clone().add(V(0, 0.09, 0.012)));
    const tNum = L.cvs(32, 16, (c) => { c.fillStyle = '#e8e4dc'; c.fillRect(0, 0, 32, 16); c.fillStyle = '#1a1a1a'; c.font = 'bold 10px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('4417', 16, 9); });
    const cp = (CHEST || HEAD).getWorldPosition(V()); const num = L.plane(0.13, 0.065, L.basic(tNum), 0, 0, 0); attachAt(CHEST || HEAD, num, V(cp.x - 0.07, H * 0.72, 0.135));
    const col = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.022, 4, 10), L.lam(null, 0xb84c10)); col.rotation.x = Math.PI / 2; attachAt(CHEST || HEAD, col, V(0, H * 0.8, 0.01));
  } else {
    // moño de pelo gris (como la silueta de la Parte 1)
    MH = marlaHead(); MH.position.copy(hp).add(V(0, qn('mhy', 0.1), qn('mhz', 0.01))); root.add(MH); MH.updateMatrixWorld(true); HEAD.parent.attach(MH); MHQ = MH.quaternion.clone();
  }
  // bufanda de Marla (o nada): cilindros de tartan envueltos en el antebrazo derecho + mancha de sangre
  let scarf = null;
  if (kind === 'marla') {
    scarf = new THREE.Group();
    const tTar = L.cvs(16, 16, (c) => { c.fillStyle = '#9a1414'; c.fillRect(0, 0, 16, 16); c.fillStyle = 'rgba(20,10,10,0.55)'; for (let i = 0; i < 16; i += 4) { c.fillRect(i, 0, 2, 16); c.fillRect(0, i, 16, 2); } c.fillStyle = 'rgba(230,200,120,0.6)'; for (let i = 2; i < 16; i += 8) { c.fillRect(i, 0, 1, 16); c.fillRect(0, i, 16, 1); } });
    const mT = L.lam(L.rep(tTar, 2, 1), 0xffffff, { side: THREE.DoubleSide });
    const a0 = FAR.getWorldPosition(V()), a1 = HANDR.getWorldPosition(V()), mid = a0.clone().lerp(a1, 0.55), dir = a1.clone().sub(a0).normalize(), len = a0.distanceTo(a1);
    for (let k = 0; k < 3; k++) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.052 + k * 0.004, 0.056 + k * 0.004, len * 0.32, 8, 1, true), mT); w.position.copy(a0.clone().lerp(a1, 0.3 + k * 0.22)); w.quaternion.setFromUnitVectors(V(0, 1, 0), dir); w.rotateX(k % 2 ? 0.18 : -0.18); scarf.add(w); }
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.01), mT); tail.position.copy(mid).add(V(0, -0.08, 0.05)); scarf.add(tail);
    const blood = new THREE.Mesh(new THREE.CircleGeometry(0.03, 7), L.basic(null, 0x4a0606)); blood.position.copy(mid).add(dir.clone().multiplyScalar(0.02)).add(V(0, 0, 0.06)); scarf.add(blood);
    root.add(scarf); scarf.updateMatrixWorld(true); FAR.attach(scarf);
  }
  const HQ = HEAD.quaternion.clone();
  const LEG = ['UpperLegL', 'UpperLegR', 'LowerLegL', 'LowerLegR'].map((n) => { const b = bone(n); return [b, b.quaternion.clone()]; });
  const HIPS = bone('Hips'), IP0 = inner.position.clone();
  const look = { yaw: 0, pitch: 0 };
  function sitLegs() {
    const ul = qn('ul', -1.45), ll = qn('ll', 1.55), sp = qn('sp', 0.12);
    LEG.forEach(([b, q], i) => { b.quaternion.copy(q); if (i < 2) { b.rotateX(ul); b.rotateZ(i === 0 ? -sp : sp); } else b.rotateX(ll); });
    inner.position.copy(IP0); root.updateMatrixWorld(true);
    const h = root.worldToLocal(HIPS.getWorldPosition(V()));
    inner.position.add(V(qn('sx', 0) - h.x, qn('sy', 0.47) - h.y, qn('sz', 0.02) - h.z));
  }
  function pose(t, clip = 'idle', { talk = 0 } = {}) {
    HEAD.quaternion.copy(HQ);   // el clip Idle no anima la cabeza: sin esto el asentir se acumulaba
    for (const a of Object.values(acts)) a.setEffectiveWeight(0);
    const sit = clip === 'sit', nm = kind === 'marla' ? (L.QS.get('mclip') ?? (sit ? 'Sitting' : 'Standing')) : 'Idle';   // el clip Sitting de Quaternius no deja una pose sentada estable en este rig: de pie (Dutch en los barrotes, Marla apoyada en la pared)
    const a = act(nm), d = a.getClip().duration; a.setEffectiveWeight(1); a.time = nm === 'Sitting' ? d * Number(L.QS.get('sitk') ?? 0.5) : ((L.q15(t) % d) + d) % d; mixer.update(0); if (MH) { HEAD.scale.setScalar(0.001); MH.quaternion.copy(MHQ); MH.rotateY(look.yaw); MH.rotateX(look.pitch); MOUTH.scale.y = 1 + 1.4 * Math.max(0, Math.sin(L.q15(t) * 17)) * Math.min(1, talk); }
    if (sit) sitLegs(); else inner.position.copy(IP0);
  }
  return { root, pose, head: HEAD, scarf, look };
}

// =====================================================================
//  WORLD — the Jōren falls: a pool ringed by columnar basalt (textured, mossy, hung with vines), a 25 m fall in three
//  layers with a churning foot, gravel banks under thousands of grass blades and reeds, ferns, layered cedars, a small
//  hokora shrine with its rope and papers, stone lanterns, the woodcutter's firewood and hat. The woodcutter (smooth,
//  jointed, in kasuri indigo), the stump, the threads, the jorōgumo, tourists on a deck. One renderer at 360×640.
// =====================================================================
let R3 = null, WJ = null;
function rend() {
  if (R3) return R3;
  const cv = document.createElement('canvas'); cv.width = YK.LW; cv.height = YK.LH;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(YK.LW, YK.LH, false); r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  R3 = { cv, r }; return R3;
}
// the ground: a basin, a flat front bank, the back wall rising to the plateau above the falls, wooded side hills
function th(x, z) {
  const e = Math.hypot(x / 11, (z + 4) / 9), n = fbm2(x * 0.18, z * 0.18) - 0.5;
  let h = e < 1 ? -2.8 * (1 - e * e) : Math.min(1.2, (e - 1) * 2.4) + n * 0.6;
  const back = ss(1.08, 1.55, e) * ss(-2, -9, z);
  h = lerp(h, 25.5 - 0.012 * x * x + n * 2.5, back);
  h += ss(13, 26, Math.abs(x)) * ss(14, -2, z) * (9 + 5 * Math.sin(z * 0.15 + x * 0.05));
  return h;
}
const FALLS = { x: 0, top: 24.6, zTop: -13.1, zBot: -11.6, w: 6.5 };
const STUMP = V3(-2.9, 0, 7.4), NAP = V3(1.4, 0, 8.2), SHRINE = V3(-7.2, 0, 5.2);
const SKIN = '#c8946a';
const SM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
const capsule = (r, l, mat, n = 8) => { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 4, n), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const sph = (r, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat); m.scale.set(sx, sy, sz); m.castShadow = true; m.receiveShadow = true; return m; };
const C3s = (a, b, k) => lin(a).lerp(lin(b), clamp(k));

// ---- people: hips → chest → neck/head; shoulders → elbows → hands; hips → knees → feet. Smooth, textured cloth.
function mkMan(o = {}) {
  const C = Object.assign({ skin: SKIN, top: null, topCol: '#ffffff', legs: '#5a5046', wrap: '#b9b4a6', feet: '#cfae78', hair: '#0b0d10', band: '#eeeadb' }, o);
  const topM = C.top === null ? SM({ map: texKasuri() }) : SM({ color: C.topCol, map: texCloth('cloth', '#ffffff', 'rgba(0,0,0,0.12)') });
  const skinM = SM({ color: C.skin, roughness: 0.7 }), legM = SM({ color: C.legs, map: texCloth('legs', '#ffffff', 'rgba(0,0,0,0.15)') }), wrapM = SM({ color: C.wrap, map: texCloth('wrap', '#ffffff', 'rgba(60,50,40,0.35)', [1, 4]) });
  const G = () => new THREE.Group(), root = G(), hips = G(), chest = G(), neck = G(), J = {}; root.rotation.order = 'YXZ';
  root.add(hips); hips.position.y = 0.95; hips.add(chest);
  { const p = sph(0.15, legM, 1.15, 0.7, 0.8); p.position.y = 0.03; hips.add(p); }
  { const t = capsule(0.16, 0.22, topM, 10); t.scale.set(1.2, 1, 0.78); t.position.y = 0.3; chest.add(t);
    const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.185, 0.07, 14), SM({ color: '#2b2219' })); ob.scale.z = 0.8; ob.position.y = 0.1; ob.castShadow = true; chest.add(ob);
    [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.3, 0.02), SM({ color: '#e8e2d2' })); c.position.set(s * 0.05, 0.36, 0.125); c.rotation.z = s * 0.35; chest.add(c); }); }
  chest.add(neck); neck.position.y = 0.5;
  { const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 8), skinM); neck.add(nk);
    const hd = sph(0.115, skinM, 0.9, 1.08, 1.0); hd.position.y = 0.14; neck.add(hd);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.05, 5), skinM); nose.rotation.x = Math.PI / 2; nose.position.set(0, 0.13, 0.115); neck.add(nose);
    [-1, 1].forEach((s) => { const e = sph(0.025, skinM, 0.5, 1, 0.8); e.position.set(s * 0.105, 0.14, 0); neck.add(e); const ey = sph(0.012, SM({ color: '#1a1410' })); ey.position.set(s * 0.04, 0.16, 0.098); neck.add(ey); });
    const hr = sph(0.12, SM({ color: C.hair, roughness: 0.6 }), 0.95, 0.75, 1.02); hr.position.set(0, 0.2, -0.015); neck.add(hr);
    if (C.band) { const b = new THREE.Mesh(new THREE.TorusGeometry(0.108, 0.016, 6, 16), SM({ color: C.band })); b.rotation.x = Math.PI / 2; b.position.y = 0.19; neck.add(b); const k = sph(0.025, SM({ color: C.band }), 1.4, 0.8, 0.6); k.position.set(0.03, 0.19, -0.11); neck.add(k); } }
  const limb = (parent, x, y, r1, l1, m1, r2, l2, m2, end) => {
    const a = G(); a.position.set(x, y, 0); parent.add(a); const u = capsule(r1, l1 - r1, m1); u.position.y = -l1 / 2; a.add(u);
    const b = G(); b.position.y = -l1; a.add(b); const lo = capsule(r2, l2 - r2, m2); lo.position.y = -l2 / 2; b.add(lo);
    const e = G(); e.position.y = -l2; b.add(e); if (end) e.add(end);
    return { a, b, end: e };
  };
  const hand = () => { const h = sph(0.045, skinM, 0.9, 1.2, 0.6); h.position.y = -0.03; return h; };
  const foot = () => { const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.24), SM({ color: C.feet })); f.position.set(0, -0.02, 0.06); f.castShadow = true; return f; };
  J.armL = limb(chest, 0.25, 0.44, 0.058, 0.3, topM, 0.045, 0.27, skinM, hand());
  J.armR = limb(chest, -0.25, 0.44, 0.058, 0.3, topM, 0.045, 0.27, skinM, hand());
  J.legL = limb(hips, 0.1, 0, 0.08, 0.46, legM, 0.06, 0.45, wrapM, foot());
  J.legR = limb(hips, -0.1, 0, 0.08, 0.46, legM, 0.06, 0.45, wrapM, foot());
  J.handR = J.armR.end; J.handL = J.armL.end;
  root.userData = { hips, chest, neck, J };
  return root;
}
const POSE = {
  stand: { y: 0.95, sp: [0, 0, 0], nk: [0, 0, 0], aL: [0.05, 0.12, -0.15], aR: [0.05, -0.12, -0.15], lL: [0, 0.02, 0], lR: [0, -0.02, 0] },
  lie:   { y: 0.16, rx: -Math.PI / 2, sp: [0, 0, 0], nk: [0.1, 0.5, 0], aL: [0.05, 0.25, -0.2], aR: [-2.8, -0.15, -1.9], lL: [0.02, 0.06, 0.08], lR: [0.0, -0.08, 0.02] },
  sitUp: { y: 0.14, sp: [0.25, 0, 0], nk: [0.45, 0, 0], aL: [-0.5, 0.35, -0.2], aR: [-0.5, -0.35, -0.2], lL: [-1.5, 0.12, 0.15], lR: [-1.5, -0.12, 0.1] },
  kneel: { y: 0.5, sp: [0.45, 0, 0], nk: [0.3, 0, 0], aL: [-0.9, 0.1, -0.6], aR: [-0.9, -0.1, -0.6], lL: [-1.5, 0.1, 1.6], lR: [0.1, -0.05, 2.3] },
  chopUp: { y: 0.5, sp: [-0.1, 0, 0], nk: [0.1, 0, 0], aL: [-2.6, 0.2, -0.6], aR: [-2.6, -0.2, -0.6], lL: [-1.5, 0.1, 1.6], lR: [0.1, -0.05, 2.3] },
  chopDn: { y: 0.5, sp: [0.6, 0, 0], nk: [0.4, 0, 0], aL: [-1.0, 0.1, -0.2], aR: [-1.0, -0.1, -0.2], lL: [-1.5, 0.1, 1.6], lR: [0.1, -0.05, 2.3] },
  crouch: { y: 0.7, sp: [0.3, 0, 0], nk: [-0.1, 0, 0], aL: [-0.6, 0.3, -0.9], aR: [-0.5, -0.3, -0.9], lL: [-0.9, 0.1, 1.3], lR: [-0.4, -0.1, 1.1] },
  look:  { y: 0.95, sp: [-0.12, 0, 0], nk: [-0.55, 0, 0], aL: [0.0, 0.15, -0.1], aR: [0.0, -0.15, -0.1], lL: [0, 0.05, 0], lR: [0, -0.05, 0] },
  phone: { y: 0.95, sp: [0, 0, 0], nk: [-0.15, 0, 0], aL: [-1.2, 0.3, -1.3], aR: [-1.3, -0.3, -1.2], lL: [0, 0.05, 0], lR: [0, -0.05, 0] },
};
Object.values(POSE).forEach((p) => { p.rx = p.rx ?? 0; p.rz = p.rz ?? 0; });
const mixPose = (A, Bp, k) => { const o = {}; for (const key in A) { const a = A[key], b = Bp[key] ?? (key === 'rx' || key === 'rz' ? 0 : a); o[key] = Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], k)) : lerp(a, b, k); } for (const key in Bp) if (!(key in o)) o[key] = Bp[key]; return o; };
function setPose(man, P) {
  const { hips, chest, neck, J } = man.userData;
  hips.position.y = P.y; man.rotation.x = P.rx ?? 0; man.rotation.z = P.rz ?? 0;
  chest.rotation.set(P.sp[0], P.sp[1], P.sp[2]); neck.rotation.set(P.nk[0], P.nk[1], P.nk[2]);
  const seg2 = (A, v) => { A.a.rotation.set(v[0], 0, v[1]); A.b.rotation.set(v[2], 0, 0); };
  seg2(J.armL, P.aL); seg2(J.armR, P.aR); seg2(J.legL, P.lL); seg2(J.legR, P.lR);
}
function gait(ph, amp = 1, back = false) {
  const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU), sg = back ? -1 : 1;
  return { rx: 0, rz: 0, y: 0.95 - 0.04 * amp + 0.05 * amp * Math.abs(c), sp: [0.25 * amp * sg, 0.1 * s * amp, 0], nk: [-0.15 * amp, 0, 0],
    aL: [0.9 * s * amp, 0.12, -0.9 * amp], aR: [-0.9 * s * amp, -0.12, -0.9 * amp],
    lL: [-0.75 * s * amp * sg, 0.03, 0.6 * amp * Math.max(0, sg * -c) + 0.15], lR: [0.75 * s * amp * sg, -0.03, 0.6 * amp * Math.max(0, sg * c) + 0.15] };
}
function mkAxe() {
  const g = new THREE.Group();
  const h = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.8, 6), SM({ map: texPlank(), color: '#c8a070' })); h.position.y = 0.4; g.add(h);
  const b = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.03), SM({ color: '#6a6e6c', metalness: 0.5, roughness: 0.5 })); b.position.set(0.08, 0.76, 0); g.add(b);
  const e = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.032), SM({ color: '#d3d6cc', metalness: 0.6, roughness: 0.3 })); e.position.set(0.18, 0.76, 0); g.add(e);
  g.traverse((m) => (m.castShadow = true)); return g;
}
function mkStump() {
  const g = new THREE.Group(), barkM = SM({ map: texBark(), color: '#a08068' });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.62, 0.75, 14, 3), barkM); body.position.y = 0.37; g.add(body);
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), SM({ map: txCanvas('rings', 128, 128, (x, w, h) => { x.fillStyle = '#c9a06a'; x.fillRect(0, 0, w, h); for (let r = 4; r < 64; r += 5) { x.strokeStyle = r % 10 ? 'rgba(110,70,40,0.5)' : 'rgba(80,50,30,0.7)'; x.lineWidth = 1.5; x.beginPath(); x.arc(64 + Math.sin(r) * 2, 64, r, 0, TAU); x.stroke(); } }) }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.752; g.add(top);
  for (let k = 0; k < 6; k++) { const a = k * 1.1 + 0.3, rt = new THREE.Mesh(new THREE.ConeGeometry(0.17, 1.3, 7), barkM); rt.position.set(Math.cos(a) * 0.62, 0.1, Math.sin(a) * 0.62); rt.lookAt(Math.cos(a) * 3, -0.4, Math.sin(a) * 3); rt.rotateX(Math.PI / 2); g.add(rt); }
  for (let k = 0; k < 4; k++) { const m = sph(0.12, SM({ color: '#5d6e42', map: texNeedles() }), 1.4, 0.5, 1.2); m.position.set(Math.cos(k * 1.7) * 0.45, 0.2 + k * 0.12, Math.sin(k * 1.7) * 0.45); g.add(m); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return g;
}
// ---- the jorōgumo
function mkSpider() {
  const g = new THREE.Group(), U = {};
  const ab = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 20).rotateX(Math.PI / 2), SM({ map: texJoro(), roughness: 0.45 })); ab.scale.set(3.4, 2.5, 5.0);
  ab.position.set(0, 3.2, -6.0); ab.rotation.x = -0.5; g.add(ab); U.ab = ab;
  const ce = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), SM({ map: txCanvas('ceph', 128, 64, (x, w, h) => { x.fillStyle = '#16181c'; x.fillRect(0, 0, w, h); x.fillStyle = '#d8b440'; for (let i = 0; i < 4; i++) x.fillRect(i * 32 + 6, 0, 8, h); x.fillStyle = 'rgba(200,200,200,0.15)'; for (let i = 0; i < 200; i++) x.fillRect((i * 37) % w, (i * 13) % h, 1, 2); }), roughness: 0.5 }));
  ce.scale.set(1.7, 1.1, 2.2); ce.position.set(0, 0.4, -2.2); g.add(ce); U.ce = ce;
  // the woman: a flared robe with wide sleeves, a red collar and sash
  const wo = new THREE.Group(); wo.position.set(0, 1.0, 0.6); g.add(wo); U.wo = wo;
  const robeM = SM({ map: texRobe(), roughness: 0.7 }), redM = SM({ color: '#a8361a', roughness: 0.6 }), skinW = SM({ color: '#efe8da', roughness: 0.55 });
  { const pts = [[1.25, 0], [1.05, 0.5], [0.85, 1.2], [0.72, 1.8], [0.78, 2.4], [0.7, 2.7], [0.3, 2.95], [0, 3.0]].map(([r, y]) => new THREE.Vector2(r, y));
    const robe = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), robeM); robe.scale.z = 0.75; wo.add(robe);
    const obi = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.82, 0.45, 18), redM); obi.scale.z = 0.76; obi.position.y = 1.55; wo.add(obi);
    [-1, 1].forEach((s) => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.06), redM); c.position.set(s * 0.22, 2.4, 0.52); c.rotation.z = s * 0.42; c.rotation.x = -0.2; wo.add(c); });
    const nk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 10), skinW); nk.position.y = 3.05; wo.add(nk); }
  // a neck far too long; the head hangs tilted on it
  { const nk2 = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.7, 10), skinW); nk2.position.y = 3.75; wo.add(nk2); }
  const head = new THREE.Group(); head.position.set(0, 4.75, 0.08); wo.add(head); U.head = head;
  { const maskM = SM({ color: '#e9e6dc', roughness: 0.35 }), blk = SM({ color: '#020306', roughness: 0.3 });
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.54, 24, 18), SM({ color: '#07080b', roughness: 0.35 })); hair.material.color.set('#1c1e24'); hair.scale.set(0.88, 1.12, 0.92); hair.position.set(0, 0.12, -0.12); head.add(hair);
    // the cavity behind the mask: wet dark flesh, a cluster of eight glossy eyes, two fangs
    const cav = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshPhongMaterial({ color: '#7e3a26', emissive: '#3a1006', shininess: 60, specular: '#d0a26a' })); cav.scale.set(0.8, 1.05, 0.7); cav.position.z = 0.02; head.add(cav);
    U.inEyes = [[-0.1, 0.16, 0.07], [0.1, 0.16, 0.07], [-0.2, 0.05, 0.05], [0.2, 0.05, 0.05], [-0.07, 0.02, 0.06], [0.07, 0.02, 0.06], [-0.15, -0.1, 0.04], [0.15, -0.1, 0.04]].map(([x, y, r]) => { const e = new THREE.Mesh(new THREE.SphereGeometry(r * 1.4, 12, 10), new THREE.MeshPhongMaterial({ color: '#020306', shininess: 140, specular: '#ffffff' })); e.position.set(x * 1.1, y, 0.3); head.add(e); return e; });
    U.fangs = [-1, 1].map((sd) => { const g2 = new THREE.Group(); g2.position.set(sd * 0.08, -0.2, 0.28); head.add(g2); const f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.5, 7), SM({ color: '#2a2622', roughness: 0.3 })); f.position.y = -0.17; f.rotation.z = sd * 0.25; g2.add(f); const base = sph(0.07, SM({ color: '#5a2418' })); g2.add(base); return g2; });
    // the mask: two halves hinged at the temples; each carries its eye slit, high painted brow and half the lips
    U.halves = [-1, 1].map((sd) => { const hg = new THREE.Group(); hg.position.set(sd * 0.38, 0, -0.05); head.add(hg);
      const geo = new THREE.SphereGeometry(0.5, 14, 18, sd < 0 ? 0 : Math.PI / 2, Math.PI / 2, 0.32, 2.45); geo.scale(0.78, 1.15, 0.86); const half = new THREE.Mesh(geo, maskM); half.position.set(-sd * 0.38, 0, 0.05); hg.add(half);
      const add = (m, x, y, z) => { m.position.set(-sd * 0.38 + x, y, 0.05 + z); hg.add(m); return m; };
      const eye = add(new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.04), blk), sd * 0.14, 0.06, 0.4); eye.rotation.z = sd * -0.12;
      add(sph(0.035, SM({ color: '#2a2622' }), 1.4, 0.7, 0.5), sd * 0.13, 0.33, 0.36);
      const lip = add(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.04), SM({ color: '#8e3a24', roughness: 0.4 })), sd * 0.03, -0.28, 0.4);
      const teeth = add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.02, 0.03), blk), sd * 0.03, -0.29, 0.405);
      hg.userData = { sd, lip, teeth, eye }; return hg; });
  }
  // hair: thick long strands — a curtain in front over each shoulder and a long mass behind
  U.hair = [];
  for (let i = 0; i < 34; i++) {
    const fr = i < 16, sd = i % 2 ? 1 : -1, geo = new THREE.PlaneGeometry(fr ? 0.3 : 0.36, 1, 1, 16); geo.translate(0, -0.5, 0);
    const m = new THREE.Mesh(geo, SM({ color: ['#1c1e24', '#2a2e36', '#14161a', '#3a3e46'][i % 4], roughness: 0.4, side: THREE.DoubleSide }));
    m.position.set(fr ? sd * (0.36 + 0.03 * (i >> 1)) : ((i - 16) / 17 - 0.5) * 0.9, 5.2, fr ? 0.05 - 0.02 * (i >> 1) : -0.3); m.rotation.y = fr ? sd * 0.25 : 0; m.castShadow = true;
    m.userData = { L: fr ? 7 + hsh(i, 4) * 5 : 6 + hsh(i, 4) * 4, ph: hsh(i, 5) * TAU, dz: fr ? 1 : -1, base: geo.attributes.position.array.slice() }; wo.add(m); U.hair.push(m);
  }
  // arms in wide sleeves
  U.arms = [-1, 1].map((s) => { const a = new THREE.Group(); a.position.set(s * 0.75, 2.55, 0); wo.add(a);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 1.2, 10), robeM); up.position.y = -0.6; a.add(up);
    const lo = new THREE.Group(); lo.position.y = -1.2; a.add(lo);
    const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.55, 1.3, 10, 1, true), SM({ map: texRobe(), side: THREE.DoubleSide })); sl.position.y = -0.5; lo.add(sl);
    const fo = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8), skinW); fo.position.y = -1.1; lo.add(fo);
    const hd = sph(0.1, skinW, 0.8, 1.2, 0.5); hd.position.y = -2.25; lo.add(hd);
    for (let f = 0; f < 4; f++) { const fg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.75, 5), skinW); fg.position.set((f - 1.5) * 0.045, -2.62, 0.02 * f); fg.rotation.z = (f - 1.5) * 0.08; lo.add(fg); }
    a.userData = { lo, s }; return a; });
  // legs: three tapered segments, yolk with blue-black joints, a black knob at each joint
  const legGeo = (() => { const c = new THREE.CylinderGeometry(1, 0.75, 1, 10, 10); const P = c.attributes.position, col = []; for (let i = 0; i < P.count; i++) { const y = P.getY(i), k = Math.abs(y) > 0.38 ? lin('#0b0d12') : Math.abs(y) < 0.07 ? lin('#141a2e') : Math.abs(y) > 0.3 ? lin('#a07c30') : lin('#e8c34a'); col.push(k.r, k.g, k.b); } c.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return c; })();
  const legMat = SM({ vertexColors: true, roughness: 0.45 }), knobMat = SM({ color: '#0b0d12', roughness: 0.4 });
  U.legs = [];
  for (let i = 0; i < 8; i++) { const segs = [0, 1, 2].map(() => { const m = new THREE.Mesh(legGeo, legMat); g.add(m); return m; }); const knobs = [0, 1].map(() => { const k = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), knobMat); g.add(k); return k; }); U.legs.push({ segs, knobs, side: i < 4 ? -1 : 1, k: i % 4 }); }
  g.userData = U; g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return g;
}
function legsTo(sp, tips) {
  const U = sp.userData; sp.updateMatrixWorld(); const inv = sp.matrixWorld.clone().invert();
  U.legs.forEach((L, i) => {
    const root = V3(L.side * (1.2 + 0.25 * (L.k % 2)), 0.7, 0.2 - L.k * 0.75), tip = tips[i].clone().applyMatrix4(inv);
    const d = tip.clone().sub(root), len = d.length(), out = V3(d.x, 0, d.z).normalize();
    const knee = root.clone().addScaledVector(d, 0.3).add(V3(0, 0.38 * len + 2.5, 0)).addScaledVector(out, 0.6);
    const ankle = knee.clone().lerp(tip, 0.62).add(V3(0, 0.08 * len, 0));
    const r = 0.26 * (1 - L.k * 0.05);
    between(L.segs[0], root, knee, r); between(L.segs[1], knee, ankle, r * 0.8); between(L.segs[2], ankle, tip, r * 0.5);
    L.knobs[0].position.copy(knee); L.knobs[0].scale.setScalar(r * 1.15); L.knobs[1].position.copy(ankle); L.knobs[1].scale.setScalar(r * 0.9);
  });
}
function hairSway(sp, t, wind = 1) {
  sp.userData.hair.forEach((m) => { const { L, ph, base, dz } = m.userData, P = m.geometry.attributes.position;
    for (let k = 0; k < P.count; k++) { const y0 = base[k * 3 + 1], u = -y0; P.setXYZ(k, base[k * 3] + Math.sin(t * 1.3 + ph + u * 2.5) * 0.12 * u * wind, y0 * L, base[k * 3 + 2] + dz * (u * 0.5 + u * u * 0.25) + Math.sin(t * 0.9 + ph + u * 3) * 0.2 * u * wind); }
    P.needsUpdate = true; m.geometry.computeVertexNormals(); });
}
function mkThreads(n, col = '#eef6f4') {
  const g = new THREE.Group(); g.userData.lines = [];
  for (let i = 0; i < n; i++) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 40), 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(3 * 40), 3));
    const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, fog: true })); l.frustumCulled = false; g.add(l); g.userData.lines.push(l); }
  g.userData.col = lin(col); return g;
}
function threadsTo(g, A, Bf, t, sag = 0.4, glint = 1) {
  g.userData.lines.forEach((l, i) => { const a = A(i), b = Bf(i), P = l.geometry.attributes.position, Cl = l.geometry.attributes.color, c = g.userData.col;
    for (let k = 0; k < 40; k++) { const u = k / 39, p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * sag * a.distanceTo(b) * 0.05; p.x += Math.sin(t * 2 + i + u * 9) * 0.02 * Math.sin(Math.PI * u);
      P.setXYZ(k, p.x, p.y, p.z); const sh = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(u * 14 - t * 3 + i * 1.7), 6) * glint; Cl.setXYZ(k, c.r * sh, c.g * sh, c.b * sh); }
    P.needsUpdate = true; Cl.needsUpdate = true; });
}
// wind on instanced blades: the tip sways with time, phase from the instance position
const WIND = { value: 0 };
function windMat(mat, amp = 0.12) {
  mat.onBeforeCompile = (sh) => { sh.uniforms.uWind = WIND; sh.vertexShader = 'uniform float uWind;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    #ifdef USE_INSTANCING
      vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
      float sw = sin(uWind * 1.6 + ip.x * 0.45 + ip.z * 0.3) + 0.4 * sin(uWind * 3.1 + ip.x * 1.3);
      transformed.x += sw * ${amp.toFixed(3)} * position.y * position.y; transformed.z += sw * ${(amp * 0.5).toFixed(3)} * position.y * position.y;
    #endif`); };
  mat.customProgramCacheKey = () => 'wind' + amp; return mat;
}

function world() {
  if (WJ) return WJ;
  const scene = new THREE.Scene(), Wd = { scene };
  scene.fog = new THREE.Fog('#8fb1b0', 20, 110);
  Wd.cam = new THREE.PerspectiveCamera(50, YK.LW / YK.LH, 0.05, 900);
  Wd.hemi = new THREE.HemisphereLight('#8fb1b0', '#3c2c1e', 0.9); scene.add(Wd.hemi);
  const sun = new THREE.DirectionalLight('#fff1b8', 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -34; sc.right = 34; sc.top = 34; sc.bottom = -34; sc.near = 1; sc.far = 220; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(sun); scene.add(sun.target); Wd.sun = sun;
  Wd.sky = new THREE.Mesh(new THREE.SphereGeometry(500, 32, 16), shaderMat({ top: { value: lin('#4e8389') }, hor: { value: lin('#b9cbc6') }, cloud: { value: lin('#eeeadb') }, cloudSh: { value: lin('#acb6b3') }, sunCol: { value: lin('#fff1b8') }, sunDir: { value: V3(0.6, 0.4, -0.6) }, t: { value: 0 }, cover: { value: 0.5 } },
    `uniform vec3 top, hor, cloud, cloudSh, sunCol, sunDir; uniform float t, cover;
    void main(){ vec3 d=normalize(vW-cameraPosition); float y=max(d.y,0.); vec3 c=mix(hor,top,pow(y,0.5));
      vec2 uv=d.xz/(d.y+0.1)*0.9+vec2(t*0.006,0.);
      float f=fbm(uv*0.7), cl=smoothstep(cover,cover+0.12,f), sh=smoothstep(0.45,0.85,fbm(uv*0.7+vec2(0.09,0.12)));
      c=mix(c,mix(cloud,cloudSh,sh),cl*smoothstep(0.,0.1,d.y));
      float s=max(dot(d,normalize(sunDir)),0.); c+=sunCol*(pow(s,6.)*0.35+smoothstep(0.9985,0.9995,s)*1.5);
      gl_FragColor=vec4(c,1.);
      #include <encodings_fragment>
    }`, { mat: { side: THREE.BackSide, depthWrite: false, fog: false } }));
  Wd.sky.material.fog = false; Wd.sky.renderOrder = -10; scene.add(Wd.sky);
  // ground: smooth heightfield, gravel texture tinted by vertex colour (wet stone, bank, moss, plateau)
  { const S = 150, n = 170, geo = new THREE.PlaneGeometry(S, S, n, n); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -20);
    const P = geo.attributes.position, col = []; for (let i = 0; i < P.count; i++) P.setY(i, th(P.getX(i), P.getZ(i)));
    geo.computeVertexNormals(); const N = geo.attributes.normal;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), ny = N.getY(i), mo = fbm2(x * 0.25, z * 0.25);
      let c = C3s(y < 0.1 ? '#7d7c74' : '#d6cbb6', '#93a06c', ss(0.5, 0.62, mo) * (y > 0.1 ? 1 : 0.3));
      if (ny < 0.7) c = C3s('#8a8a84', '#6f8058', ss(0.45, 0.6, mo)); if (y > 20 && ny > 0.6) c = C3s('#5d6e46', '#7a7458', mo);
      col.push(c.r, c.g, c.b); }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const m = new THREE.Mesh(geo, SM({ map: texGravel(), vertexColors: true, roughness: 0.95 })); m.receiveShadow = true; scene.add(m); Wd.ground = m; }
  // the basalt wall: hexagonal columns in drums, three rows; moss caps; vines hanging off the tops
  { const R = RNG('cols'), list = [];
    for (let L = 0; L < 3; L++) { const ec = 1.06 + L * 0.1; let a = -2.15;
      while (a < 2.15) { const x = Math.sin(a) * 11 * ec, z = -4 - Math.cos(a) * 9 * ec, top = 24.2 - 7.5 * Math.pow(Math.abs(a) / 2.15, 1.6) + R.n(1.4) + L * 0.7 - (Math.abs(x) < 3.6 && L === 0 ? 1.2 : 0);
        list.push({ x, z, top, bot: Math.min(-2, th(x, z) - 1), L }); a += 1.18 / (Math.hypot(11 * Math.cos(a), 9 * Math.sin(a)) * ec); } }
    const drums = []; list.forEach((c, i) => { let y = c.bot; const R2 = RNG('drum', i); while (y < c.top) { const h = Math.min(c.top - y, R2.r(2.2, 5.5)); drums.push({ x: c.x + R2.n(0.06), z: c.z + R2.n(0.06), y, h, ry: R2.r(0, 1), sh: R2.f() }); y += h + 0.05; } });
    const geo = new THREE.CylinderGeometry(0.66, 0.66, 1, 6, 1); geo.translate(0, 0.5, 0);
    const m = IM(geo, SM({ map: texBasalt(), roughness: 0.8, flatShading: true }), drums.length), cols = ['#9a9a94', '#b8b8b0', '#7e827c', '#a8aca0', '#8a9284', '#c4c2b8'];
    drums.forEach((d, i) => { m.setMatrixAt(i, M4c(d.x, d.y, d.z, d.ry, 1, d.h, 1)); m.setColorAt(i, lin(cols[Math.floor(d.sh * cols.length)])); });
    scene.add(m); Wd.cols = m;
    const mm = IM(new THREE.CylinderGeometry(0.72, 0.68, 0.3, 6, 1), SM({ map: texNeedles(), color: '#a8b884', flatShading: true }), list.length);
    list.forEach((c, i) => { mm.setMatrixAt(i, M4c(c.x, c.top, c.z, hsh(i) * 2, 1, 1, 1)); }); scene.add(mm); Wd.colList = list;
    const vg = new THREE.PlaneGeometry(0.35, 1, 1, 6); vg.translate(0, -0.5, 0); const vines = [];
    list.forEach((c, i) => { const R2 = RNG('vine', i); for (let k = 0; k < 3; k++) if (R2.f() < 0.55) { const a = Math.atan2(c.x, c.z + 4); vines.push({ x: c.x - Math.sin(a) * 0.62 + R2.n(0.3), y: c.top + 0.1, z: c.z - Math.cos(a) * 0.62 + R2.n(0.3), l: R2.r(1.5, 7), ry: a + R2.n(0.4) }); } });
    const vm = IM(vg, SM({ map: texNeedles(), color: '#8a9a6a', side: THREE.DoubleSide }), vines.length, true);
    vines.forEach((v, i) => vm.setMatrixAt(i, M4c(v.x, v.y, v.z, v.ry, 1, v.l, 1))); scene.add(vm); }
  // grass: thousands of tapered curved blades with a dark root and a pale tip; reeds at the water's edge
  { const bg = new THREE.BufferGeometry(), P = [], Cc = [], segs = 4;
    for (let k = 0; k < segs; k++) { const y0 = k / segs, y1 = (k + 1) / segs, w0 = 0.018 * (1 - y0 * 0.9), w1 = 0.018 * (1 - y1 * 0.9), b0 = y0 * y0 * 0.25, b1 = y1 * y1 * 0.25;
      P.push(-w0, y0, b0, w0, y0, b0, w1, y1, b1, -w0, y0, b0, w1, y1, b1, -w1, y1, b1);
      for (let q = 0; q < 6; q++) { const yy = [y0, y0, y1, y0, y1, y1][q], c = C3s('#3a4428', '#d8dcb0', yy); Cc.push(c.r, c.g, c.b); } }
    bg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); bg.setAttribute('color', new THREE.Float32BufferAttribute(Cc, 3)); bg.computeVertexNormals();
    const R = RNG('grass'), bl = [];
    for (let i = 0; i < 120000 && bl.length < 45000; i++) { const x = R.r(-24, 24), z = R.r(-1, 24), e = Math.hypot(x / 11, (z + 4) / 9), y = th(x, z);
      if (e < 1.02 || y < 0.05 || Math.hypot(x - NAP.x, z - NAP.z) < 1.8 || Math.hypot(x - STUMP.x, z - STUMP.z) < 1.6 || (Math.abs(x - 4.5) < 4.2 && Math.abs(z - 12.5) < 2.2)) continue;
      if ((x > -7.2 && x < -1.4 && z > 6.2 && z < 11) || ((x > -3.2 && x < 0.8 && z > 7.5 && z < 14.5) || (x > 1.8 && x < 4 && z > 8.6 && z < 11.2)) && R.f() < 0.9) continue;
      if (fbm2(x * 0.35, z * 0.35) < 0.38 && R.f() < 0.7) continue;
      bl.push({ x, y, z, h: R.r(0.18, 0.6) * (0.6 + fbm2(x * 0.5, z * 0.5)) * (Math.hypot(x - NAP.x, z - NAP.z) < 3 ? 0.5 : 1), ry: R.r(0, TAU), c: R.pick(['#7f9a5a', '#95a86a', '#6a8450', '#b0ad78', '#5e7448', '#8a9a5e']) }); }
    for (let i = 0; i < 4000; i++) { const a = R.r(-2.2, 2.2) + Math.PI, e = R.r(0.97, 1.08), x = Math.sin(a) * 11 * e, z = -4 - Math.cos(a) * 9 * e; if (z < 1) continue; bl.push({ x, y: th(x, z), z, h: R.r(1.0, 1.9), ry: R.r(0, TAU), c: R.pick(['#8a9060', '#a8a070', '#6a7448']) }); }
    const gm = IM(bg, windMat(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), 0.16), bl.length, false); gm.receiveShadow = true;
    bl.forEach((b, i) => { gm.setMatrixAt(i, M4c(b.x, b.y - 0.02, b.z, b.ry, 1, b.h, 1)); gm.setColorAt(i, lin(b.c)); }); scene.add(gm); Wd.grass = gm; }
  // ferns: pinnate fronds (a stem with leaflets) in clumps, on the banks and the column ledges
  { const parts = []; for (let k = 0; k < 6; k++) { const ry = (k / 6) * TAU; for (let j = 0; j < 9; j++) { const u = j / 9, len = 0.35 * Math.sin(Math.PI * (u * 0.9 + 0.1));
      [-1, 1].forEach((s) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, s * len, 0.06, 0.05, s * len * 0.4, 0.02, 0.12], 3));
        parts.push([g, new THREE.Matrix4().makeRotationY(ry).multiply(new THREE.Matrix4().makeTranslation(0, 0.15 + u * 0.75 - u * u * 0.4, u * 1.1)).multiply(new THREE.Matrix4().makeRotationX(-0.3 + u * 0.6)), (x, y) => (y > 0.5 ? '#9aaa6a' : '#56683c')]); }); } }
    const fan = mergeG(parts), R = RNG('fern'), fr = [];
    for (let i = 0; i < 700; i++) { const a = R.r(-3.1, 3.1), e = R.r(1.0, 2.0), x = Math.sin(a) * 11 * e, z = -4 - Math.cos(a) * 9 * e; if (Math.hypot(x - NAP.x, z - NAP.z) < 2.6 || Math.hypot(x - STUMP.x, z - STUMP.z) < 2.2 || (z > 4.5 && z < 15 && x > -6 && x < 7)) continue; fr.push({ x, y: th(x, z), z, s: R.r(0.7, 1.7) }); }
    Wd.colList.forEach((c) => { if (R.f() < 0.6) fr.push({ x: c.x + R.n(0.3), y: c.top + 0.15, z: c.z + R.n(0.3), s: R.r(0.7, 1.5) }); });
    const m = IM(fan, windMat(new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide }), 0.05), fr.length); fr.forEach((f, i) => m.setMatrixAt(i, M4c(f.x, f.y, f.z, hsh(i, 2) * TAU, f.s, f.s, f.s))); scene.add(m); Wd.ferns = m; }
  // rocks: mossy stones along the shore, boulders under the fall
  { const R = RNG('rock'), rk = []; for (let i = 0; i < 170; i++) { const a = R.r(-3.1, 3.1), e = R.r(0.88, 1.2), x = Math.sin(a) * 11 * e, z = -4 - Math.cos(a) * 9 * e; rk.push({ x, z, s: R.r(0.3, 1.2) }); }
    for (let i = 0; i < 18; i++) rk.push({ x: R.n(6.5), z: -10.2 + R.n(1.6), s: R.r(0.7, 1.7) });
    const g = new THREE.IcosahedronGeometry(1, 1), P = g.attributes.position; for (let i = 0; i < P.count; i++) { const v = V3(P.getX(i), P.getY(i), P.getZ(i)), k = 0.8 + 0.35 * vn2(v.x * 2 + 5, v.z * 2 + v.y * 2); P.setXYZ(i, v.x * k, v.y * k, v.z * k); } g.computeVertexNormals();
    const m = IM(g, SM({ map: texStone(), flatShading: true, roughness: 0.75 }), rk.length); rk.forEach((r, i) => { m.setMatrixAt(i, M4c(r.x, Math.max(th(r.x, r.z), -0.6), r.z, hsh(i) * 6, r.s, r.s * 0.7, r.s * 1.1, hsh(i, 3))); m.setColorAt(i, lin(['#a8a89c', '#8e9488', '#c0bcae', '#7e8a7a', '#9aa28a'][i % 5])); }); scene.add(m); }
  // cedars: textured trunks and drooping layered foliage
  { const fol = mergeG([...Array(9)].map((_, k) => { const y = 4 + k * 1.15, r = 2.1 * (1 - k / 10) + 0.2; return [new THREE.ConeGeometry(r, 1.9, 9, 1, true), M4c(Math.sin(k * 2.3) * 0.15, y, Math.cos(k * 1.7) * 0.15, k * 0.7), k % 2 ? '#6f8458' : '#8a9a68']; }), true);
    const R = RNG('cedar'), tr = [];
    for (let i = 0; i < 900 && tr.length < 300; i++) { const x = R.r(-60, 60), z = R.r(-75, 18), h = th(x, z), e = Math.hypot(x / 11, (z + 4) / 9); if (e < 1.5 || (z > 0 && Math.abs(x) < 13) || h < 1) continue; tr.push({ x, z, y: h - 0.3, s: R.r(1.3, 2.6) }); }
    const tk = IM(new THREE.CylinderGeometry(0.22, 0.45, 14, 7).translate(0, 7, 0), SM({ map: texBark(), color: '#b09070' }), tr.length), fm = IM(fol, SM({ map: texNeedles(), vertexColors: true, side: THREE.DoubleSide, roughness: 0.95 }), tr.length);
    tr.forEach((c, i) => { const M = M4c(c.x, c.y, c.z, hsh(i) * 6, c.s * 0.9, c.s, c.s * 0.9, (hsh(i, 2) - 0.5) * 0.06); tk.setMatrixAt(i, M); fm.setMatrixAt(i, M); }); scene.add(tk); scene.add(fm); Wd.cedarList = tr; }
  // the hokora: a stone base, a small wooden shrine, a straw rope with white paper zigzags; two stone lanterns
  { const g = new THREE.Group(), st = SM({ map: texStone(), color: '#c8c4b8', flatShading: true }), wd = SM({ map: texPlank(), color: '#c09a70' }), rf = SM({ color: '#3a3026', map: texBark() });
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.2), st); base.position.y = 0.25; g.add(base);
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.75, 0.7), wd); box.position.y = 0.88; g.add(box);
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.02), SM({ color: '#1a1410' })); door.position.set(0, 0.85, 0.36); g.add(door);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.75, 0.45, 4, 1), rf); roof.rotation.y = Math.PI / 4; roof.scale.set(1.25, 1, 1.1); roof.position.y = 1.47; g.add(roof);
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 20, Math.PI), SM({ color: '#c8b07a' })); rope.rotation.set(0, 0, Math.PI); rope.position.set(0, 1.25, 0.38); g.add(rope);
    for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.26), SM({ color: '#fbf7ea', side: THREE.DoubleSide })); p.position.set(-0.25 + k * 0.25, 1.0, 0.4); g.add(p); }
    const off = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 8), SM({ color: '#efe8da' })); off.position.set(0.3, 0.55, 0.45); g.add(off);
    g.position.set(SHRINE.x, th(SHRINE.x, SHRINE.z), SHRINE.z); g.rotation.y = 0.9; g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(g); Wd.shrine = g;
    const lantern = (x, z) => { const l = new THREE.Group(); const p = (geo, y) => { const m = new THREE.Mesh(geo, st); m.position.y = y; m.castShadow = true; l.add(m); return m; };
      p(new THREE.CylinderGeometry(0.35, 0.4, 0.15, 6), 0.07); p(new THREE.CylinderGeometry(0.12, 0.15, 0.8, 8), 0.55); p(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 6), 1.0); p(new THREE.BoxGeometry(0.36, 0.32, 0.36), 1.22); p(new THREE.ConeGeometry(0.45, 0.3, 6), 1.53); p(new THREE.SphereGeometry(0.08, 8, 6), 1.72);
      const lg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.38), new THREE.MeshBasicMaterial({ color: '#2a2016' })); lg.position.y = 1.22; l.add(lg); l.userData.glow = lg;
      l.position.set(x, th(x, z), z); scene.add(l); return l; };
    Wd.lanterns = [lantern(-5.2, 7.8), lantern(-8.6, 3.2)];
    const fw = new THREE.Group(); for (let k = 0; k < 14; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 1.1, 6), SM({ map: texBark(), color: '#c0a080' })); s.rotation.z = Math.PI / 2; s.position.set(0, 0.08 + (k % 3) * 0.09, (Math.floor(k / 3) - 2) * 0.09 + (k % 3) * 0.04); s.castShadow = true; fw.add(s); }
    [-0.3, 0.3].forEach((x) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 5, 12), SM({ color: '#c8b07a' })); r.rotation.y = Math.PI / 2; r.position.set(x, 0.17, 0); fw.add(r); });
    fw.position.set(NAP.x - 1.3, th(NAP.x - 1.3, NAP.z + 0.6), NAP.z + 0.6); fw.rotation.y = 0.4; scene.add(fw); Wd.firewood = fw;
    const hat = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.22, 16), SM({ map: txCanvas('straw', 64, 64, (x, w, h, R) => { x.fillStyle = '#c8a868'; x.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { x.fillStyle = R.pick(['#a88848', '#e0c888', '#8a6a38']); x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(3, 9)); } }) }));
    hat.position.set(NAP.x - 0.8, th(NAP.x - 0.8, NAP.z + 1.5) + 0.1, NAP.z + 1.5); hat.rotation.z = 0.15; hat.castShadow = true; scene.add(hat); }
  // the fall: three layers of streaks scrolling down; a churning white foot
  const fallMat = (w0, a0, sp) => shaderMat({ t: { value: 0 }, c1: { value: lin('#4e8389') }, c2: { value: lin('#fbf7ea') }, lit: { value: 1 } },
    `uniform float t, lit; uniform vec3 c1, c2;
    void main(){ float s=n2(vec2(vUv.x*${w0}.,vUv.y*5.+t*${sp.toFixed(3)}))*0.6+n2(vec2(vUv.x*${w0 * 2}.,vUv.y*11.+t*${(sp * 1.6).toFixed(3)}))*0.4;
      float edge=smoothstep(0.,0.12,vUv.x)*smoothstep(1.,0.88,vUv.x); float a=(${a0.toFixed(3)}+0.6*smoothstep(0.3,0.75,s))*edge;
      vec3 c=mix(c1,c2,smoothstep(0.35,0.8,s))*lit; gl_FragColor=vec4(c,a);
      #END
    }`, { vbody: `p.z += pow(uv.y,6.)*1.6;`, mat: { transparent: true, depthWrite: false, side: THREE.DoubleSide } });
  { const geo = new THREE.PlaneGeometry(FALLS.w, FALLS.top + 1, 6, 30); geo.translate(0, (FALLS.top + 1) / 2 - 1, 0);
    const f1 = new THREE.Mesh(geo, fallMat(26, 0.12, 2.4)); f1.position.set(0, 0, FALLS.zBot); f1.rotation.x = -0.06; f1.renderOrder = 3; scene.add(f1);
    const f2 = new THREE.Mesh(geo.clone(), fallMat(40, 0.05, 3.1)); f2.position.set(0.3, 0, FALLS.zBot + 0.25); f2.scale.x = 0.8; f2.rotation.x = -0.06; f2.renderOrder = 4; scene.add(f2);
    const f3 = new THREE.Mesh(geo.clone(), fallMat(12, 0.0, 1.6)); f3.position.set(0, 0, FALLS.zBot - 0.5); f3.scale.x = 1.4; f3.rotation.x = -0.06; f3.renderOrder = 2; scene.add(f3); Wd.falls = [f1, f2, f3];
    Wd.churn = new THREE.Mesh(new THREE.CircleGeometry(4.5, 40).rotateX(-Math.PI / 2), shaderMat({ t: { value: 0 } }, `uniform float t; void main(){ vec2 q=vW.xz-vec2(0.,-11.2); float d=length(q); float f=fbm(q*1.4+vec2(t*0.7,-t*1.1))*0.7+fbm(q*3.+vec2(-t*1.3,t))*0.5; float a=smoothstep(0.5,0.9,f)*smoothstep(4.5,1.,d); gl_FragColor=vec4(vec3(0.95,0.97,0.95),a);
      #END
    }`, { mat: { transparent: true, depthWrite: false } })); Wd.churn.position.set(0, 0.02, -11.0); Wd.churn.renderOrder = 4; scene.add(Wd.churn); }
  Wd.pool = new THREE.Mesh(new THREE.PlaneGeometry(40, 34, 1, 1).rotateX(-Math.PI / 2).translate(0, 0, -4), shaderMat({ t: { value: 0 }, deep: { value: lin('#0b2c38') }, shal: { value: lin('#346c76') }, foam: { value: lin('#d3d6cc') }, sheen: { value: lin('#b9cbc6') } },
    `uniform float t; uniform vec3 deep, shal, foam, sheen;
    void main(){ vec2 q=vW.xz; float d=distance(q,vec2(0.,-11.4)); float e=length(vec2(q.x/11.,(q.y+4.)/9.));
      vec3 c=mix(deep,shal,smoothstep(0.55,1.,e)*0.6);
      float rip=sin(d*2.6-t*3.2+n2(q*0.6)*3.)*exp(-d*0.09)+0.5*sin(q.x*3.1+t*1.3+n2(q*1.7)*4.)*0.3;
      float fo=smoothstep(0.58,0.86,fbm(q*0.55+vec2(0.,t*0.35)-normalize(q-vec2(0.,-11.4))*t*0.6))*exp(-d*0.13)+exp(-d*0.9)*0.9;
      vec3 V=normalize(cameraPosition-vW); float fr=pow(1.-max(V.y,0.),3.);
      float glint=smoothstep(0.82,0.95,n2(q*4.+vec2(t*0.8,t*0.5)))*fr;
      c=mix(c,sheen,fr*0.55+rip*0.06+glint*0.6); c=mix(c,foam,clamp(fo,0.,1.)*0.85);
      gl_FragColor=vec4(c,1.);
      #END
    }`)); Wd.pool.position.y = -0.05; scene.add(Wd.pool);
  { const tex = g3Radial([[0, 'rgba(255,255,255,0.9)'], [0.5, 'rgba(255,255,255,0.35)'], [1, 'rgba(255,255,255,0)']]);
    Wd.mist = []; const R = RNG('mist'); for (let i = 0; i < 46; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: '#eef6f4', transparent: true, opacity: 0.28, depthWrite: false, fog: true }));
      s.userData = { x: R.n(7), y: R.r(0, 6), z: -10.5 + R.n(2), s: R.r(3, 8), v: R.r(0.2, 0.6), ph: R.f() * TAU }; s.renderOrder = 5; scene.add(s); Wd.mist.push(s); }
    const n = 1400, pos = new Float32Array(n * 3); Wd.sprayP = []; for (let i = 0; i < n; i++) Wd.sprayP.push({ x: R.n(5), z: -11 + R.n(2), v: R.r(1, 4), ph: R.f() });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); Wd.spray = new THREE.Points(g, new THREE.PointsMaterial({ color: '#eef6f4', size: 1.2, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false })); Wd.spray.frustumCulled = false; scene.add(Wd.spray);
    const nm = 260, mp = new Float32Array(nm * 3); Wd.moteP = []; for (let i = 0; i < nm; i++) Wd.moteP.push({ x: R.n(16), y: R.r(0.5, 9), z: R.r(-12, 14), ph: R.f() * TAU });
    const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(mp, 3)); Wd.motes = new THREE.Points(mg, new THREE.PointsMaterial({ color: '#f9bd5c', size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false })); Wd.motes.frustumCulled = false; scene.add(Wd.motes);
    const lg = new THREE.PlaneGeometry(0.12, 0.08); Wd.leafP = []; for (let i = 0; i < 70; i++) Wd.leafP.push({ x: R.n(14), z: R.r(-6, 16), y0: R.r(6, 16), v: R.r(0.4, 0.9), ph: R.f() * TAU });
    Wd.leaves = IM(lg, SM({ color: '#ffffff', side: THREE.DoubleSide }), Wd.leafP.length, false); Wd.leaves.frustumCulled = false; Wd.leafP.forEach((p, i) => Wd.leaves.setColorAt(i, lin(['#c8a040', '#9a6a30', '#7a8a40'][i % 3]))); scene.add(Wd.leaves); }
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, -0.7, 0.15, -0.2, -0.1, 0, -0.25, 0, 0, 0, 0.7, 0.15, -0.2, 0.1, 0, -0.25], 3)); g.computeVertexNormals();
    Wd.birds = IM(g, new THREE.MeshBasicMaterial({ color: '#06090f', side: THREE.DoubleSide, fog: true }), 9, false); Wd.birds.frustumCulled = false; scene.add(Wd.birds); }
  Wd.key = new THREE.PointLight('#d8c8a8', 0, 0); Wd.key.position.set(0, 30, -2); scene.add(Wd.key);
  Wd.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: g3Radial([[0, 'rgba(255,255,250,1)'], [0.18, 'rgba(240,245,240,1)'], [0.22, 'rgba(200,220,220,0.35)'], [1, 'rgba(160,200,200,0)']], 128), transparent: true, depthWrite: false, fog: false })); Wd.moon.scale.setScalar(60); Wd.moon.position.set(6, 120, -130); Wd.moon.visible = false; scene.add(Wd.moon);
  { const n = 1400, g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); Wd.splashP = []; const R = RNG('splash'); for (let i = 0; i < n; i++) Wd.splashP.push({ a: R.r(0, TAU), v: R.r(0.5, 4), u: R.r(3, 10), d: R.r(0, 0.3) });
    Wd.splash = new THREE.Points(g, new THREE.PointsMaterial({ color: '#eef6f4', size: 2.5, sizeAttenuation: false, depthWrite: false })); Wd.splash.frustumCulled = false; Wd.splash.visible = false; scene.add(Wd.splash); }
  Wd.man = mkMan(); scene.add(Wd.man);
  Wd.axe = mkAxe(); scene.add(Wd.axe);
  Wd.stump = mkStump(); Wd.stump.position.set(STUMP.x, th(STUMP.x, STUMP.z) - 0.1, STUMP.z); scene.add(Wd.stump);
  Wd.thr = mkThreads(9); scene.add(Wd.thr);
  Wd.thr2 = mkThreads(3); scene.add(Wd.thr2);
  Wd.sp = mkSpider(); Wd.sp.position.set(0, 25.0, -17.5); Wd.sp.scale.setScalar(2.6); scene.add(Wd.sp);
  { const deck = new THREE.Group(), wood = SM({ map: texPlank() }), rail = SM({ map: texPlank(), color: '#8a7058' });
    const pl = new THREE.Mesh(new THREE.BoxGeometry(7, 0.25, 3), wood); pl.position.y = 1.2; deck.add(pl);
    for (let i = 0; i <= 7; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.3, 0.12), rail); p.position.set(-3.5 + i, 1.9, -1.4); deck.add(p); const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 0.15), rail); l.position.set(-3.5 + i, 0.3, -1.4); deck.add(l); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.1, 0.14), rail); top.position.set(0, 2.55, -1.4); deck.add(top);
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.08), SM({ map: txCanvas('sign', 96, 64, (x, w, h) => { x.fillStyle = '#d8c8a0'; x.fillRect(0, 0, w, h); x.fillStyle = '#2a2016'; for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) x.fillRect(12 + c * 16, 10 + r * 12, 9, 7); }) }));
    sign.position.set(-3.2, 2.4, -0.4); deck.add(sign); const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 0.1), rail); post.position.set(-3.2, 1.1, -0.4); deck.add(post);
    deck.position.set(4.5, 0, 12.5); deck.rotation.y = -0.25; deck.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); scene.add(deck); Wd.deck = deck;
    const tc = [{ topCol: '#a8361a', legs: '#26304a' }, { topCol: '#eeeadb', legs: '#3f4542' }, { topCol: '#e8c34a', legs: '#191b18' }, { topCol: '#4e8389', legs: '#5a4430' }];
    Wd.tour = tc.map((c, i) => { const m = mkMan(Object.assign({ top: 'solid', skin: '#d8b090', wrap: c.legs, feet: '#191b18', band: null, hair: i === 1 ? '#5a4430' : '#0b0d10' }, c)); m.position.set(-2.4 + i * 1.5, 1.32, -0.6 + (i % 2) * 0.5); m.rotation.y = Math.PI + (hsh(i) - 0.5) * 0.6; deck.add(m);
      const ph = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.02), SM({ color: '#020306' })); ph.position.set(0, -0.08, 0.04); m.userData.J.handR.add(ph); return m; }); }
  const grad = new THREE.DataTexture(new Uint8Array([45, 45, 45, 255, 135, 135, 135, 255, 255, 255, 255, 255]), 3, 1); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const done = new Map();
  scene.traverse((m) => { if (!m.isMesh || !m.material || !m.material.isMeshStandardMaterial) return; const o = m.material;
    if (!done.has(o)) done.set(o, new THREE.MeshToonMaterial({ color: o.color, map: o.map, vertexColors: o.vertexColors, side: o.side, gradientMap: grad, transparent: o.transparent }));
    m.material = done.get(o); });
  WJ = Wd; return Wd;
}
const LIGHT = {
  night: { top: '#172728', hor: '#4e8389', cloud: '#346c76', cloudSh: '#0b141b', sunC: '#8fb1b0', sunI: 0.9, sunD: [-0.3, 0.55, -0.8], hemS: '#4e8389', hemG: '#06090f', hemI: 0.9, fog: '#1f3c44', fn: 2, ff: 55, cover: 0.42, exp: 1.0, mote: '#e8c34a', fall: 0.75, deep: '#06090f', shal: '#172728', sheen: '#1f3c44', lamp: '#f9bd5c' },
  day:   { top: '#346c76', hor: '#8fb1b0', cloud: '#d3d6cc', cloudSh: '#65969a', sunC: '#e8e6d4', sunI: 2.0, sunD: [0.55, 0.6, 0.6], hemS: '#a8c4c0', hemG: '#5a4430', hemI: 1.0, fog: '#65969a', fn: 6, ff: 75, cover: 0.5, exp: 1.1, mote: '#efd7a2', fall: 1, deep: '#0b1a22', shal: '#1f3c44', sheen: '#65969a' },
  dusk:  { top: '#141a2e', hor: '#65969a', cloud: '#8fb1b0', cloudSh: '#1f3c44', sunC: '#cfae78', sunI: 2.4, sunD: [0.9, 0.22, 0.25], hemS: '#4e8389', hemG: '#0b141b', hemI: 0.9, fog: '#1f3c44', fn: 8, ff: 85, cover: 0.48, exp: 1.05, mote: '#b9cbc6', fall: 0.95, deep: '#06090f', shal: '#172728', sheen: '#65969a', lamp: '#cfae78' },
  dawn:  { top: '#65969a', hor: '#d3d6cc', cloud: '#eeeadb', cloudSh: '#8fb1b0', sunC: '#e8e0c8', sunI: 1.6, sunD: [-0.7, 0.22, -0.6], hemS: '#d3d6cc', hemG: '#5a4430', hemI: 1.1, fog: '#8fb1b0', fn: 3, ff: 60, cover: 0.55, exp: 1.0, mote: '#fbf7ea', fall: 1.05, deep: '#172728', shal: '#346c76', sheen: '#8fb1b0' },
};
function setLight(Wd, L, focus) {
  const U = Wd.sky.material.uniforms; U.top.value.set(L.top); U.hor.value.set(L.hor); U.cloud.value.set(L.cloud); U.cloudSh.value.set(L.cloudSh); U.sunCol.value.set(L.sunC); U.sunDir.value.set(...L.sunD); U.cover.value = L.cover;
  Wd.sun.color.set(L.sunC); Wd.sun.intensity = L.sunI; const f = focus || V3(0, 4, -2); Wd.sun.target.position.copy(f); Wd.sun.position.copy(f).addScaledVector(V3(...L.sunD).normalize(), 90); Wd.sun.target.updateMatrixWorld();
  Wd.hemi.color.set(L.hemS); Wd.hemi.groundColor.set(L.hemG); Wd.hemi.intensity = L.hemI;
  Wd.scene.fog.color.set(L.fog); Wd.scene.fog.near = L.fn; Wd.scene.fog.far = L.ff;
  Wd.motes.material.color.set(L.mote); Wd.falls.forEach((m) => (m.material.uniforms.lit.value = L.fall));
  const P = Wd.pool.material.uniforms; P.deep.value.set(L.deep); P.shal.value.set(L.shal); P.sheen.value.set(L.sheen);
  Wd.lanterns.forEach((l) => l.userData.glow.material.color.set(L.lamp || '#2a2016'));
  rend().r.toneMappingExposure = L.exp;
}
function animWorld(Wd, t, o = {}) {
  WIND.value = t;
  Wd.falls.forEach((m) => (m.material.uniforms.t.value = t)); Wd.pool.material.uniforms.t.value = t; Wd.sky.material.uniforms.t.value = t; Wd.churn.material.uniforms.t.value = t;
  Wd.mist.forEach((s) => { const u = s.userData, k = mod(t * u.v * 0.12 + u.ph / TAU, 1); s.position.set(u.x + Math.sin(t * 0.2 + u.ph) * 1.5, u.y + k * 7, u.z + k * 4); s.scale.setScalar(u.s * (0.7 + k)); s.material.opacity = (o.mist ?? 0.22) * Math.sin(Math.PI * k); });
  { const P = Wd.spray.geometry.attributes.position; Wd.sprayP.forEach((p, i) => { const k = mod(t * 0.6 * p.v * 0.3 + p.ph, 1); P.setXYZ(i, p.x * (0.5 + k), 0.2 + Math.sin(Math.PI * k) * p.v * 1.2, p.z + k * 3); }); P.needsUpdate = true; }
  { const P = Wd.motes.geometry.attributes.position; Wd.moteP.forEach((p, i) => P.setXYZ(i, p.x + Math.sin(t * 0.3 + p.ph) * 0.8, p.y + Math.sin(t * 0.5 + p.ph * 2) * 0.5, p.z + Math.cos(t * 0.25 + p.ph) * 0.8)); P.needsUpdate = true; Wd.motes.visible = o.motes ?? true; }
  Wd.leafP.forEach((p, i) => { const k = mod(t * p.v * 0.08 + p.ph / TAU, 1), y = p.y0 * (1 - k); Wd.leaves.setMatrixAt(i, M4c(p.x + Math.sin(t * 0.8 + p.ph) * 0.8, Math.max(th(p.x, p.z), 0) + y, p.z + Math.cos(t * 0.6 + p.ph) * 0.5, t * 2 + p.ph, 1, 1, 1, t * 3 + p.ph, t * 1.7)); }); Wd.leaves.instanceMatrix.needsUpdate = true; Wd.leaves.visible = o.leaves ?? true;
  for (let i = 0; i < 9; i++) { const a = t * 0.12 + i * 0.7, r = 26 + 6 * Math.sin(i * 2.3), fl = Math.sin(t * 9 + i * 2) * 0.5; Wd.birds.setMatrixAt(i, M4c(Math.sin(a) * r, 46 + 4 * Math.sin(i + t * 0.2), -30 + Math.cos(a) * r * 0.6, -a + Math.PI / 2, 1.2, 1.2 + fl, 1.2)); }
  Wd.birds.instanceMatrix.needsUpdate = true; Wd.birds.visible = o.birds ?? true;
  hairSway(Wd.sp, t, o.wind ?? 1);
}

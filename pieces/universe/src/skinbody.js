
// =====================================================================
//  SKIN BODY — one smooth skinned mesh per person over the pose groups (hips, spine, neck, legs, arms):
//  the torso, legs and arms are continuous tubes whose rings blend between the bones across each joint,
//  so shoulders, elbows, hips and knees bend without seams. Clothes are vertex colours by region
//  (crisp edges at hems and sleeves), with a fabric weave in the bump. Hands get fingers.
// =====================================================================
let FABRIC = null;
const fabricTex = () => FABRIC || (FABRIC = wrap(g3Tex((x, w) => { const R = RNG('fabric'); x.fillStyle = '#808080'; x.fillRect(0, 0, w, w);
  for (let i = 0; i < w; i += 2) { x.fillStyle = `rgba(255,255,255,${R.r(0.04, 0.1)})`; x.fillRect(i, 0, 1, w); x.fillStyle = `rgba(0,0,0,${R.r(0.04, 0.1)})`; x.fillRect(0, i, w, 1); }
  for (let k = 0; k < 40; k++) { x.strokeStyle = `rgba(0,0,0,${R.r(0.05, 0.12)})`; x.lineWidth = R.r(2, 5); x.beginPath(); const y = R.r(0, w); x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + R.n(12), w * 0.6, y + R.n(12), w, y + R.n(8)); x.stroke(); } }, 256, 256, false), 6, 3));
function buildSkinBody(P, o) {
  const { root, hips, spine, neck, legs, arms } = P; root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert(), at = (g) => new THREE.Vector3().setFromMatrixPosition(g.matrixWorld).applyMatrix4(inv);
  const bones = [hips, spine, neck, legs[0].th, legs[0].kn, legs[0].ft, legs[1].th, legs[1].kn, legs[1].ft, arms[0].sh, arms[0].el, arms[0].hand, arms[1].sh, arms[1].el, arms[1].hand];
  const B = (g) => bones.indexOf(g), F = !!o.female;
  const cSkin = lin(o.skin || '#e8bb94'), cTop = lin(o.coat || o.top || '#3a6ab0'), cPants = lin(o.bottom || '#2b3a55'), cSleeve = lin(o.coat || o.top || '#3a6ab0');
  const pos = [], col = [], uv = [], si = [], sw = [], idx = [], SEG = 22;
  // a chain: c0 = top centre, joints (dy where each next bone starts), bones [b0, b1, ...], profile [[dy, rx, rz]], colour(dy), h = blend half-width
  function chain(c0, bl, joints, prof, colFn, cuts, h, dz = () => 0) {
    const ys = new Set(prof.map((p) => p[0])); cuts.forEach((c) => { ys.add(c + 0.0012); ys.add(c - 0.0012); });
    const list = [...ys].sort((a, b) => b - a), rAt = (dy) => { for (let i = 0; i < prof.length - 1; i++) if (dy <= prof[i][0] && dy >= prof[i + 1][0]) { const f = (dy - prof[i][0]) / (prof[i + 1][0] - prof[i][0]); return [lerp(prof[i][1], prof[i + 1][1], f), lerp(prof[i][2], prof[i + 1][2], f)]; } return dy > prof[0][0] ? [prof[0][1], prof[0][2]] : [prof[prof.length - 1][1], prof[prof.length - 1][2]]; };
    const base = pos.length / 3;
    list.forEach((dy, i) => { const [rx, rz] = rAt(dy); let j = 0, best = 9; joints.forEach((J, k) => { if (Math.abs(dy - J) < best) { best = Math.abs(dy - J); j = k; } });
      const w = ss(joints[j] + h, joints[j] - h, dy), a = B(bl[j]), b = B(bl[j + 1]), c = colFn(dy);
      for (let k = 0; k <= SEG; k++) { const ang = k / SEG * TAU, x = Math.sin(ang) * rx, z = Math.cos(ang) * rz + dz(dy, ang); pos.push(c0.x + x, c0.y + dy, c0.z + z); col.push(c.r, c.g, c.b); uv.push(k / SEG, -dy * 3); si.push(a, b, 0, 0); sw.push(1 - w, w, 0, 0); } });
    for (let i = 0; i < list.length - 1; i++) for (let k = 0; k < SEG; k++) { const p = base + i * (SEG + 1) + k, q = p + SEG + 1; idx.push(p, q, p + 1, q, q + 1, p + 1); }
  }
  // torso: crotch -> neck (hips -> spine -> neck); a bust / chest swell in front, a seat behind
  const hp = at(hips), sp = at(spine), nk = at(neck), y0 = hp.y;
  const tor = [[0.66, 0.05, 0.045], [0.62, 0.054, 0.05], [0.585, 0.08, 0.066], [0.56, F ? 0.15 : 0.165, 0.085], [0.53, F ? 0.18 : 0.2, 0.1], [0.49, F ? 0.18 : 0.198, 0.115], [0.45, F ? 0.172 : 0.188, 0.12], [0.4, F ? 0.168 : 0.18, 0.118], [0.32, F ? 0.152 : 0.165, 0.112], [0.24, F ? 0.135 : 0.152, 0.104], [0.16, F ? 0.138 : 0.15, 0.1], [0.08, F ? 0.158 : 0.155, 0.104], [0.0, F ? 0.172 : 0.16, 0.112], [-0.06, F ? 0.172 : 0.158, 0.112], [-0.12, 0.13, 0.09]];
  const neckCut = 0.56;
  chain(new THREE.Vector3(0, y0, 0), [hips, spine, neck], [sp.y - y0, nk.y - y0], tor, (dy) => (dy > neckCut ? cSkin : dy > -0.02 ? cTop : cPants), [neckCut, -0.02], 0.07,
    (dy, a) => { const front = Math.max(0, Math.cos(a)) ** 2, back = Math.max(0, -Math.cos(a)) ** 2; return (F ? 0.04 : 0.018) * front * Math.exp(-(((dy - 0.38) / 0.07) ** 2)) + 0.03 * back * Math.exp(-(((dy + 0.06) / 0.06) ** 2)) - 0.012 * front * Math.exp(-(((dy - 0.15) / 0.08) ** 2)); });
  // legs: hip -> knee -> ankle
  legs.forEach((L) => { const th = at(L.th), kn = at(L.kn), ft = at(L.ft), d1 = kn.y - th.y, d2 = ft.y - th.y;
    const prof = [[0.07, 0.08, 0.08], [0.0, 0.095, 0.096], [-0.08, 0.091, 0.094], [-0.2, 0.08, 0.084], [-0.33, 0.066, 0.07], [d1 + 0.02, 0.056, 0.06], [d1 - 0.03, 0.055, 0.059], [d1 - 0.12, 0.062, 0.068], [d1 - 0.22, 0.052, 0.056], [d2 + 0.09, 0.038, 0.04], [d2 + 0.03, 0.034, 0.036]];
    const shortCut = -0.17, colFn = (dy) => (o.skirt ? cSkin : o.shorts ? (dy > shortCut ? cPants : cSkin) : cPants);
    chain(th, [hips, L.th, L.kn, L.ft], [0.02, d1, d2], prof, colFn, o.shorts && !o.skirt ? [shortCut] : [], 0.05); });
  // arms: shoulder -> elbow -> wrist
  arms.forEach((A) => { const sh = at(A.sh), el = at(A.el), hd = at(A.hand), d1 = el.y - sh.y, d2 = hd.y - sh.y;
    const prof = [[0.035, 0.022, 0.022], [0.02, 0.05, 0.048], [0.0, 0.062, 0.058], [-0.08, 0.058, 0.054], [-0.17, 0.05, 0.047], [d1 + 0.02, 0.043, 0.041], [d1 - 0.03, 0.042, 0.04], [d1 - 0.1, 0.043, 0.04], [d2 + 0.08, 0.034, 0.03], [d2 + 0.01, 0.029, 0.024]];
    const cut = o.sleeve === 'short' ? -0.13 : d2 + 0.03, colFn = (dy) => (dy > cut ? cSleeve : cSkin);
    chain(sh, [spine, A.sh, A.el, A.hand], [0.03, d1, d2], prof, colFn, [cut], 0.045); });
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4)); geo.setIndex(idx); geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, side: THREE.DoubleSide, bumpMap: fabricTex(), bumpScale: 0.0025 });
  const mesh = new THREE.SkinnedMesh(geo, mat); mesh.castShadow = mesh.receiveShadow = true; mesh.frustumCulled = false; root.add(mesh); root.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones), mesh.matrixWorld);
  // hands with fingers (a palm and four curled fingers + a thumb), on the hand groups
  const skinM = STDm({ color: o.skin || '#e8bb94', roughness: 0.6 });
  arms.forEach((A) => { const s = A.s, g = A.hand; const pm = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 10).scale(1.05, 1.25, 0.5), skinM); pm.position.set(0, -0.04, 0); pm.castShadow = true; g.add(pm);
    for (let k = 0; k < 4; k++) { const f = new THREE.Group(); f.position.set((k - 1.5) * 0.017 * -s, -0.082, 0.002); f.rotation.x = 0.35 + 0.1 * k; g.add(f); const fm = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, 0.038 - Math.abs(k - 1.3) * 0.006, 4, 8).translate(0, -0.022, 0), skinM); fm.castShadow = true; f.add(fm); }
    const th = new THREE.Group(); th.position.set(s * 0.03, -0.035, 0.012); th.rotation.set(0.4, 0, s * 0.6); g.add(th); const tm = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.03, 4, 8).translate(0, -0.02, 0), skinM); tm.castShadow = true; th.add(tm); });
  P.body = mesh; return mesh;
}

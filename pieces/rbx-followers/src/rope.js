// rbx-rope ROPE kit: the world rope. A 3-strand laid hemp rope as one tube whose radius has 3 twisting lobes
// (real grooves) + a fibre texture, knots (every person's knot), name tags, mail hooks, wooden posts.
'use strict';
const ROPE = {};
(function () {
  const T = THREE, { cnv, tex, rng, normalCanvas, heightOf } = RBX, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z);
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  // hemp: strands run diagonally (slope matches the lobe twist in UV), fibres inside each strand slant the other way
  ROPE.mat = (o = {}) => once('ropeM' + JSON.stringify(o), () => {
    const S = 512, c = cnv(S, S), h = cnv(S, S), g = c.getContext('2d'), hg = h.getContext('2d'), r = rng(o.seed || 5);
    g.fillStyle = o.c || '#c9a467'; g.fillRect(0, 0, S, S); hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S);
    KIT.noiseOver(g, S, S, 77, 0.35, 8, 4);
    // fibres: short slanted strokes, light and dark
    for (let i = 0; i < 9000; i++) { const x = r() * S, y = r() * S, L = 10 + r() * 26, a = -0.55 + (r() - 0.5) * 0.25, lit = r() > 0.45;
      g.strokeStyle = lit ? `rgba(255,236,190,${0.12 + r() * 0.15})` : `rgba(70,45,15,${0.12 + r() * 0.18})`; g.lineWidth = 1 + r() * 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
      hg.strokeStyle = lit ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'; hg.lineWidth = 1.4; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); hg.stroke(); }
    // stray hairs
    for (let i = 0; i < 260; i++) { const x = r() * S, y = r() * S; g.strokeStyle = 'rgba(240,215,160,0.35)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 10, x + 16 * r(), y - 20 * r()); g.stroke(); }
    const m = new T.MeshStandardMaterial({ map: tex(c, { repeat: [1, 1] }), roughness: 0.95, vertexColors: true });
    m.normalMap = tex(normalCanvas(heightOf(h), S, S, 4), { srgb: false, repeat: [1, 1] }); m.normalScale.set(1.2, 1.2);
    [m.map, m.normalMap].forEach((t) => { t.wrapS = t.wrapT = T.RepeatWrapping; });
    return m;
  });
  // rope along points (Vector3[]): radius R, 3 lobes twisting with pitch 3.6R
  ROPE.make = function (pts, R = 0.3, o = {}) {
    const curve = pts.isCurve ? pts : new T.CatmullRomCurve3(pts, false, 'centripetal', 0.5), Lc = curve.getLength();
    const n = Math.max(8, Math.min(o.maxSeg || 6000, Math.ceil(Lc / (R * 0.32)))), rs = o.radial || 20;
    const fr = curve.computeFrenetFrames(n, false), pitch = R * 3.6, tw = (2 * PI) / pitch;
    const pos = new Float32Array((n + 1) * (rs + 1) * 3), uv = new Float32Array((n + 1) * (rs + 1) * 2), colr = new Float32Array((n + 1) * (rs + 1) * 3), idx = [];
    const P = new T.Vector3();
    for (let i = 0; i <= n; i++) { const u = i / n, s = u * Lc; curve.getPointAt(u, P); const Nn = fr.normals[i], B = fr.binormals[i];
      for (let j = 0; j <= rs; j++) { const th = (j / rs) * 2 * PI, ph = th - tw * s, lobe = Math.pow(Math.abs(Math.cos(1.5 * ph)), 0.6), rr = R * (0.78 + 0.22 * lobe), cx = Math.cos(th), sx = Math.sin(th);
        const k = (i * (rs + 1) + j); pos[k * 3] = P.x + rr * (cx * Nn.x + sx * B.x); pos[k * 3 + 1] = P.y + rr * (cx * Nn.y + sx * B.y); pos[k * 3 + 2] = P.z + rr * (cx * Nn.z + sx * B.z);
        uv[k * 2] = s / (R * 4); uv[k * 2 + 1] = j / rs; const sh = 0.45 + 0.55 * lobe; colr[k * 3] = colr[k * 3 + 1] = colr[k * 3 + 2] = sh; } }
    for (let i = 0; i < n; i++) for (let j = 0; j < rs; j++) { const a = i * (rs + 1) + j, b = a + rs + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setAttribute('color', new T.BufferAttribute(colr, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new T.Mesh(geo, o.mat || ROPE.mat(o.matO || {})); m.castShadow = o.shadow ?? true; m.receiveShadow = true; m.userData.curve = curve; m.userData.len = Lc; return m;
  };
  // a knot sitting on the rope at curve param u (a fat overhand bulge), optional tag text hanging below
  ROPE.knot = function (curve, u, R = 0.3, o = {}) {
    const g = new T.Group(), p = curve.getPointAt(u), t = curve.getTangentAt(u).normalize();
    const k = new T.Mesh(new T.TorusKnotGeometry(R * 1.05, R * 0.62, 120, 14, 2, 3), o.mat || ROPE.knotMat()); k.scale.set(1, 1, 1.25); k.castShadow = k.receiveShadow = true; g.add(k);
    g.position.copy(p); g.quaternion.setFromUnitVectors(V(0, 0, 1), t); g.scale.setScalar(o.scale || 1);
    if (o.tag) { const tg = ROPE.tag(o.tag, o.tagC); tg.position.set(0, -R * 1.7, 0); const w = new T.Group(); w.add(tg); w.quaternion.copy(g.quaternion).invert(); g.add(w); }
    return g;
  };
  ROPE.knotMat = () => once('knotM', () => { const m = ROPE.mat({ seed: 9 }).clone(); m.vertexColors = false; m.color = new T.Color('#f0e2c4'); [m.map, m.normalMap] = [m.map.clone(), m.normalMap.clone()]; [m.map, m.normalMap].forEach((x) => { x.repeat.set(3, 1); x.needsUpdate = true; }); return m; });
  // hanging name tag: string + punched wooden / paper tag with bold caps
  ROPE.tag = function (text, c = '#f2e2b8') {
    const g = new T.Group(), cv = cnv(256, 160), q = cv.getContext('2d');
    q.fillStyle = c; q.fillRect(0, 0, 256, 160); KIT.noiseOver(q, 256, 160, 3 + text.length, 0.18, 6, 3);
    q.strokeStyle = 'rgba(80,50,20,0.7)'; q.lineWidth = 6; q.strokeRect(8, 8, 240, 144); q.fillStyle = '#5a3a1a'; q.beginPath(); q.arc(128, 30, 10, 0, 7); q.fill();
    q.fillStyle = '#1a1410'; let fs = 64; q.font = `900 ${fs}px "Arial Black", sans-serif`; while (q.measureText(text).width > 220 && fs > 20) { fs -= 4; q.font = `900 ${fs}px "Arial Black", sans-serif`; }
    q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText(text, 128, 98);
    const t = tex(cv), side = new T.MeshStandardMaterial({ color: c, roughness: 0.8 }), face = new T.MeshStandardMaterial({ map: t, roughness: 0.75 });
    const b = new T.Mesh(new T.BoxGeometry(0.62, 0.39, 0.04), [side, side, side, side, face, face]); b.position.y = -0.36; b.castShadow = true; g.add(b);
    const s = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.2, 5), new T.MeshStandardMaterial({ color: '#6a4a2a' })); s.position.y = -0.08; g.add(s);
    g.rotation.y = 0.25; return g;
  };
  // mail hook: a little brass trolley wheel riding the rope + hook + envelope (birthday card)
  ROPE.mail = function (o = {}) {
    const g = new T.Group(), brass = new T.MeshPhysicalMaterial({ color: '#c8963e', metalness: 0.9, roughness: 0.3 });
    const w = new T.Mesh(new T.TorusGeometry(0.22, 0.07, 10, 24), brass); w.rotation.y = PI / 2; w.position.y = 0.32; g.add(w);
    const hook = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V(0, 0.3, 0), V(0, -0.2, 0), V(0, -0.5, 0.05), V(0, -0.6, 0.2), V(0, -0.5, 0.3)]), 20, 0.035, 6), brass); g.add(hook);
    const cv = cnv(256, 160), q = cv.getContext('2d'); q.fillStyle = o.c || '#f6efe0'; q.fillRect(0, 0, 256, 160); q.strokeStyle = 'rgba(0,0,0,0.25)'; q.lineWidth = 3; q.beginPath(); q.moveTo(0, 0); q.lineTo(128, 80); q.lineTo(256, 0); q.stroke();
    q.fillStyle = '#d0392b'; q.fillRect(200, 14, 40, 46); q.fillStyle = '#1a1a1a'; q.font = '700 22px sans-serif'; q.fillText(o.to || 'TO: THE OTHER END', 20, 130); q.fillStyle = '#c0392b'; q.beginPath(); q.arc(128, 84, 12, 0, 7); q.fill();
    const env = new T.Mesh(new T.BoxGeometry(1.0, 0.62, 0.03), new T.MeshStandardMaterial({ map: tex(cv), roughness: 0.8 })); env.position.set(0, -0.95, 0.05); env.rotation.y = PI / 2; env.castShadow = true; g.add(env);
    return g;
  };
  // rope helpers: a sagging rope through hold points (sag between neighbours)
  ROPE.through = function (holds, o = {}) { const pts = []; const sag = o.sag ?? 0.25;
    for (let i = 0; i < holds.length; i++) { pts.push(holds[i]); if (i + 1 < holds.length) { const m = holds[i].clone().lerp(holds[i + 1], 0.5); m.y -= sag * holds[i].distanceTo(holds[i + 1]) / 3; pts.push(m); } }
    return pts; };
  ROPE.at = (curve, u) => ({ p: curve.getPointAt(u), t: curve.getTangentAt(u) });
})();

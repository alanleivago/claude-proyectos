// rbx-chess CHESS kit: chess-piece headpieces for R6 avatars (head-local: head centre at origin, top y=0.6, face +z),
// piece badges, queen gown / king cape, the knight horse hood (built on RBX.dinoHood), the giant Hand, and
// CHESS.citizen(kind, side) presets. Two piece colours: 'w' (boxwood cream) and 'b' (ebony).
'use strict';
const CHESS = {};
(function () {
  const T = THREE, { cnv, tex, pbr, rng, fbm, tnoise, rbox } = RBX;
  const PI = Math.PI, V3 = (x, y, z) => new T.Vector3(x, y, z);
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  // lathe with phiStart = PI so the texture seam is at the back (u = 0.5 is the front, +z); v = normalised height
  function latheGeo(pts, seg = 48) {
    const g = new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r, y)), seg, PI), p = g.attributes.position, uv = g.attributes.uv;
    let y0 = Infinity, y1 = -Infinity; pts.forEach(([, y]) => { y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) - y0) / (y1 - y0 || 1));
    g.computeVertexNormals(); return g;
  }
  CHESS.latheGeo = latheGeo;

  // ---------- materials ----------
  const PIECE = { w: { base: '#efe0c0', streak: 'rgba(150,105,55,', dark: '#6a4a2a' }, b: { base: '#2e2420', streak: 'rgba(120,80,55,', dark: '#0c0908' } };
  CHESS.COL = { w: '#efe0c0', b: '#2e2420' };
  // lacquered turned wood (boxwood / ebony): grain runs vertically (along the lathe profile). o.paint(g, hg, S) adds marks
  function lacquerPair(side, seed, paint) {
    const S = 512, c = cnv(S, S), hc = cnv(S, S), g = c.getContext('2d'), hg = hc.getContext('2d'), P = PIECE[side];
    g.fillStyle = P.base; g.fillRect(0, 0, S, S); hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S);
    const warp = fbm(seed, 4, 3), r = rng(seed + 1), im = g.getImageData(0, 0, S, S), d = im.data;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const u = x / S, v = y / S, s = Math.sin((u * 46 + warp(u, v * 0.5) * 6) * PI * 2), k = 0.94 + 0.07 * s + 0.05 * (warp(u * 2, v) - 0.5), i = (y * S + x) * 4; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
    g.putImageData(im, 0, 0);
    for (let i = 0; i < 40; i++) { const x = r() * S, w = 1 + r() * 3; g.fillStyle = P.streak + (0.08 + r() * 0.12) + ')'; g.fillRect(x, 0, w, S); }
    if (paint) paint(g, hg, S);
    return { c, h: hc };
  }
  function lacquer(side, key = 'plain', paint) {
    return once('lq' + side + key, () => {
      const p = lacquerPair(side, side === 'w' ? 7 : 9, paint);
      const m = pbr(p.c, p.h, { physical: true, rough: side === 'w' ? 0.34 : 0.3, bump: 3, nscale: 0.6 });
      m.clearcoat = 0.85; m.clearcoatRoughness = 0.18; return m;
    });
  }
  CHESS.lacquer = lacquer;
  const gold = () => once('gold', () => { const S = 256, c = cnv(S, S), g = c.getContext('2d'); g.fillStyle = '#e2b450'; g.fillRect(0, 0, S, S); KIT.noiseOver(g, S, S, 51, 0.25, 8, 4);
    const m = new T.MeshPhysicalMaterial({ map: tex(c), color: '#ffffff', metalness: 0.9, roughness: 0.28, clearcoat: 0.4 }); m.envMapIntensity = 1; return m; });
  const goldDark = () => once('goldD', () => new T.MeshPhysicalMaterial({ color: '#a8742a', metalness: 0.85, roughness: 0.4 }));
  const velvet = (c) => once('velvet' + c, () => RBX.plushMat(c, '#ffb0c0', 33, 2));
  const gem = (c) => once('gem' + c, () => new T.MeshPhysicalMaterial({ color: c, roughness: 0.05, metalness: 0, clearcoat: 1, emissive: new T.Color(c), emissiveIntensity: 0.25 }));
  CHESS.gold = gold;

  // ---------- headpieces (head-local) ----------
  // pawn: lacquered skull cap -> collar -> ball (the pawn's crown, instantly readable)
  CHESS.pawnCap = function (side = 'w') {
    const g = new T.Group(); g.name = 'pawnCap'; const m = lacquer(side);
    g.add(mesh(latheGeo([[0.0, 0.66], [0.38, 0.68], [0.52, 0.63], [0.63, 0.5], [0.675, 0.32], [0.68, 0.16], [0.655, 0.12]]), m));
    g.add(mesh(latheGeo([[0.18, 0.66], [0.5, 0.7], [0.53, 0.74], [0.5, 0.79], [0.28, 0.83], [0.2, 0.9], [0.17, 0.96]]), m));
    const ball = mesh(new T.SphereGeometry(0.34, 40, 28), m, 0, 1.24, 0); g.add(ball);
    return g;
  };
  // rook: crenellated tower hat (+ taxi band and roof sign when taxi)
  CHESS.rookHat = function (side = 'w', taxi = false) {
    const g = new T.Group(); g.name = 'rookHat'; const m = lacquer(side);
    g.add(mesh(latheGeo([[0.66, 0.1], [0.72, 0.18], [0.72, 0.3], [0.63, 0.36], [0.6, 0.6], [0.58, 1.0], [0.64, 1.08], [0.74, 1.16], [0.76, 1.26], [0.6, 1.26], [0.0, 1.26]]), m));
    const mer = new T.Mesh(rbox(0.4, 0.3, 0.2, 0.04, 6), m), N = 6;
    for (let i = 0; i < N; i++) { const a = (i / N) * PI * 2 + PI / N, k = mer.clone(); k.position.set(Math.sin(a) * 0.66, 1.4, Math.cos(a) * 0.66); k.rotation.y = a; k.castShadow = true; g.add(k); }
    if (taxi) {
      const band = once('taxiBand', () => { const c = cnv(512, 64), q = c.getContext('2d'); for (let i = 0; i < 32; i++) for (let j = 0; j < 2; j++) { q.fillStyle = (i + j) % 2 ? '#141414' : '#f6c21c'; q.fillRect(i * 16, j * 32, 16, 32); } const t = tex(c); return new T.MeshPhysicalMaterial({ map: t, roughness: 0.35, clearcoat: 0.6 }); });
      const b = mesh(new T.CylinderGeometry(0.605, 0.6, 0.2, 48, 1, true), band, 0, 0.78, 0); g.add(b);
      const sign = once('taxiSign', () => { const c = cnv(256, 96), q = c.getContext('2d'); q.fillStyle = '#ffd23a'; q.fillRect(0, 0, 256, 96); q.fillStyle = '#1a1a1a'; q.font = '900 64px "Arial Black", sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('TAXI', 128, 52); const t = tex(c);
        return new T.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: new T.Color('#ffffff'), emissiveIntensity: 0.9, roughness: 0.4 }); });
      const sb = mesh(rbox(0.78, 0.3, 0.26, 0.05, 6), [sign, sign, gold(), gold(), sign, sign], 0, 1.52, 0); g.add(sb);
      g.add(mesh(new T.CylinderGeometry(0.05, 0.05, 0.2, 10), goldDark(), 0, 1.33, 0));
    }
    return g;
  };
  // bishop: tall mitre with the diagonal slit carved into the front (real groove + darker/lighter inner wood)
  CHESS.mitre = function (side = 'w') {
    const g = new T.Group(); g.name = 'mitre'; const m0 = lacquer(side);
    g.add(mesh(latheGeo([[0.655, 0.12], [0.69, 0.22], [0.75, 0.3], [0.75, 0.38], [0.6, 0.45], [0.5, 0.47]]), m0));
    const ctl = new T.SplineCurve([[0.6, 0.44], [0.665, 0.64], [0.68, 0.88], [0.62, 1.14], [0.5, 1.42], [0.33, 1.7], [0.16, 1.9], [0.0, 1.97]].map(([r, y]) => new T.Vector2(r, y)));
    const geo = latheGeo(ctl.getPoints(90).map((v) => [Math.max(0, v.x), v.y]), 128), p = geo.attributes.position, col = new Float32Array(p.count * 3);
    const n = V3(0.72, 0.69, 0).normalize(), yc = 1.2, w = 0.1, dep = 0.26, inner = side === 'w' ? [0.38, 0.27, 0.18] : [14, 10, 7];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z), d = n.x * x + n.y * (y - yc);
      let k = 0; if (Math.abs(d) < w && r > 0.05) k = (1 - (d / w) ** 2) * THREE.MathUtils.smoothstep(z / r, -0.35, 0.25);
      if (k > 0) { const s = Math.max(0.02, r - dep * k) / r; p.setX(i, x * s); p.setZ(i, z * s); }
      const c = k > 0.25 ? inner : [1, 1, 1]; col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const m = once('mitreM' + side, () => { const k = m0.clone(); k.vertexColors = true; return k; });
    g.add(mesh(geo, m)); g.add(mesh(new T.SphereGeometry(0.13, 24, 16), m0, 0, 2.06, 0));
    return g;
  };
  // queen: gold coronet of spikes with pearls over a velvet cap
  CHESS.queenCrown = function () {
    const g = new T.Group(); g.name = 'queenCrown'; const G = gold();
    g.add(mesh(latheGeo([[0.66, 0.36], [0.7, 0.42], [0.69, 0.62], [0.74, 0.68], [0.7, 0.72], [0.6, 0.7]]), G));
    const cap = mesh(new T.SphereGeometry(0.62, 40, 24, 0, PI * 2, 0, PI / 2), velvet('#8a1a3a'), 0, 0.62, 0); cap.scale.y = 0.62; g.add(cap);
    const N = 9, sp = new T.ConeGeometry(0.1, 0.78, 14); sp.translate(0, 0.39, 0); const pearl = new T.SphereGeometry(0.085, 18, 12), pm = new T.MeshPhysicalMaterial({ color: '#fbf6ee', roughness: 0.2, clearcoat: 1, sheen: 1, sheenColor: new T.Color('#ffe6f0') });
    for (let i = 0; i < N; i++) { const a = (i / N) * PI * 2, s = mesh(sp, G, Math.sin(a) * 0.66, 0.66, Math.cos(a) * 0.66); s.rotation.set(Math.cos(a) * 0.32, 0, -Math.sin(a) * 0.32); const k = i % 2 ? 0.8 : 1.06; s.scale.set(1, k, 1); g.add(s);
      const tip = V3(0, 0.78 * k, 0).applyEuler(s.rotation).add(s.position); g.add(mesh(pearl, pm, tip.x, tip.y + 0.03, tip.z)); }
    [[0, '#d0244a'], [PI * 0.5, '#2a7ad8'], [PI, '#d0244a'], [PI * 1.5, '#2a9a5a']].forEach(([a, c]) => { const e = mesh(new T.SphereGeometry(0.07, 16, 12), gem(c), Math.sin(a) * 0.71, 0.53, Math.cos(a) * 0.71); e.scale.z = 0.6; e.lookAt(0, 0.53, 0); g.add(e); });
    g.add(mesh(new T.SphereGeometry(0.12, 20, 14), G, 0, 1.06, 0));
    return g;
  };
  // king: gold crown with arches, orb and cross
  CHESS.kingCrown = function () {
    const g = new T.Group(); g.name = 'kingCrown'; const G = gold();
    g.add(mesh(latheGeo([[0.66, 0.34], [0.71, 0.4], [0.7, 0.66], [0.75, 0.7], [0.68, 0.74], [0.6, 0.72]]), G));
    const cap = mesh(new T.SphereGeometry(0.62, 40, 24, 0, PI * 2, 0, PI / 2), velvet('#7a1424'), 0, 0.66, 0); cap.scale.y = 0.75; g.add(cap);
    const arch = new T.TorusGeometry(0.66, 0.07, 10, 40, PI);
    [0, PI / 2].forEach((a) => { const t = mesh(arch, G, 0, 0.7, 0); t.scale.y = 0.85; t.rotation.y = a; g.add(t); });
    g.add(mesh(new T.SphereGeometry(0.14, 20, 14), G, 0, 1.3, 0));
    g.add(mesh(rbox(0.12, 0.5, 0.12, 0.03, 4), G, 0, 1.62, 0)); g.add(mesh(rbox(0.36, 0.12, 0.12, 0.03, 4), G, 0, 1.68, 0));
    for (let i = 0; i < 8; i++) { const a = (i / 8) * PI * 2; g.add(mesh(new T.SphereGeometry(0.075, 12, 10), G, Math.sin(a) * 0.7, 0.76, Math.cos(a) * 0.7)); }
    [[0, '#d0244a'], [PI / 2, '#2a7ad8'], [PI, '#2a9a5a'], [PI * 1.5, '#2a7ad8']].forEach(([a, c]) => { const e = mesh(new T.SphereGeometry(0.08, 16, 12), gem(c), Math.sin(a) * 0.715, 0.53, Math.cos(a) * 0.715); e.scale.z = 0.6; e.lookAt(0, 0.53, 0); g.add(e); });
    return g;
  };
  // baker: short pleated toque topped with the pawn ball
  CHESS.bakerToque = function () {
    const g = new T.Group(); g.name = 'toque';
    const cloth = once('toque', () => { const f = RBX.fleece(256, 256, '#f6f3ec', 61), q = f.g, hq = f.hg; for (let x = 0; x < 256; x += 16) { q.fillStyle = 'rgba(120,110,100,0.18)'; q.fillRect(x, 0, 4, 256); hq.fillStyle = '#000'; hq.fillRect(x, 0, 5, 256); } return pbr(f.c, f.h, { rough: 0.9, bump: 4 }); });
    g.add(mesh(latheGeo([[0.66, 0.2], [0.68, 0.5], [0.66, 0.62], [0.78, 0.8], [0.84, 1.05], [0.78, 1.22], [0.5, 1.32], [0.0, 1.34]], 48), cloth));
    g.add(mesh(new T.SphereGeometry(0.2, 24, 16), lacquer('w'), 0, 1.45, 0));
    return g;
  };

  // ---------- badges ----------
  const SIL = {
    pawn(q, s) { q.beginPath(); q.arc(0, -0.42 * s, 0.17 * s, 0, 7); q.fill(); q.beginPath(); q.moveTo(-0.13 * s, -0.24 * s); q.lineTo(0.13 * s, -0.24 * s); q.lineTo(0.2 * s, 0.25 * s); q.lineTo(0.3 * s, 0.32 * s); q.lineTo(0.3 * s, 0.42 * s); q.lineTo(-0.3 * s, 0.42 * s); q.lineTo(-0.3 * s, 0.32 * s); q.lineTo(-0.2 * s, 0.25 * s); q.closePath(); q.fill(); q.fillRect(-0.2 * s, -0.27 * s, 0.4 * s, 0.07 * s); },
    rook(q, s) { q.beginPath(); [[-0.28, -0.46], [-0.17, -0.46], [-0.17, -0.38], [-0.06, -0.38], [-0.06, -0.46], [0.06, -0.46], [0.06, -0.38], [0.17, -0.38], [0.17, -0.46], [0.28, -0.46], [0.28, -0.26], [0.2, -0.2], [0.22, 0.26], [0.32, 0.32], [0.32, 0.42], [-0.32, 0.42], [-0.32, 0.32], [-0.22, 0.26], [-0.2, -0.2], [-0.28, -0.26]].forEach(([x, y], i) => (i ? q.lineTo(x * s, y * s) : q.moveTo(x * s, y * s))); q.closePath(); q.fill(); },
    bishop(q, s) { q.beginPath(); q.arc(0, -0.5 * s, 0.07 * s, 0, 7); q.fill(); q.beginPath(); q.moveTo(0, -0.44 * s); q.bezierCurveTo(0.26 * s, -0.3 * s, 0.24 * s, -0.04 * s, 0.14 * s, 0.04 * s); q.lineTo(0.2 * s, 0.28 * s); q.lineTo(0.32 * s, 0.33 * s); q.lineTo(0.32 * s, 0.42 * s); q.lineTo(-0.32 * s, 0.42 * s); q.lineTo(-0.32 * s, 0.33 * s); q.lineTo(-0.2 * s, 0.28 * s); q.lineTo(-0.14 * s, 0.04 * s); q.bezierCurveTo(-0.24 * s, -0.04 * s, -0.26 * s, -0.3 * s, 0, -0.44 * s); q.fill();
      q.save(); q.globalCompositeOperation = 'destination-out'; q.lineWidth = 0.05 * s; q.beginPath(); q.moveTo(-0.02 * s, -0.12 * s); q.lineTo(0.14 * s, -0.3 * s); q.stroke(); q.restore(); },
    knight(q, s) { q.beginPath(); [[-0.3, 0.42], [0.32, 0.42], [0.32, 0.32], [0.22, 0.28], [0.26, 0.02], [0.24, -0.22], [0.12, -0.4], [0.02, -0.48], [-0.04, -0.4], [-0.12, -0.42], [-0.14, -0.32], [-0.3, -0.16], [-0.38, 0.0], [-0.33, 0.07], [-0.22, 0.04], [-0.08, -0.04], [-0.12, 0.12], [-0.22, 0.28], [-0.3, 0.32]].forEach(([x, y], i) => (i ? q.lineTo(x * s, y * s) : q.moveTo(x * s, y * s))); q.closePath(); q.fill(); },
    queen(q, s) { q.beginPath(); [[-0.32, -0.3], [-0.18, -0.06], [-0.14, -0.38], [-0.02, -0.08], [0.0, -0.44], [0.04, -0.08], [0.14, -0.38], [0.18, -0.06], [0.32, -0.3], [0.22, 0.24], [0.32, 0.32], [0.32, 0.42], [-0.32, 0.42], [-0.32, 0.32], [-0.22, 0.24]].forEach(([x, y], i) => (i ? q.lineTo(x * s, y * s) : q.moveTo(x * s, y * s))); q.closePath(); q.fill();
      [[-0.32, -0.32], [-0.14, -0.4], [0, -0.47], [0.14, -0.4], [0.32, -0.32]].forEach(([x, y]) => { q.beginPath(); q.arc(x * s, y * s, 0.05 * s, 0, 7); q.fill(); }); },
    king(q, s) { q.fillRect(-0.035 * s, -0.5 * s, 0.07 * s, 0.22 * s); q.fillRect(-0.1 * s, -0.44 * s, 0.2 * s, 0.06 * s); q.beginPath(); q.moveTo(0, -0.28 * s); q.bezierCurveTo(0.34 * s, -0.3 * s, 0.32 * s, -0.02 * s, 0.18 * s, 0.06 * s); q.lineTo(0.22 * s, 0.26 * s); q.lineTo(0.32 * s, 0.32 * s); q.lineTo(0.32 * s, 0.42 * s); q.lineTo(-0.32 * s, 0.42 * s); q.lineTo(-0.32 * s, 0.32 * s); q.lineTo(-0.22 * s, 0.26 * s); q.lineTo(-0.18 * s, 0.06 * s); q.bezierCurveTo(-0.32 * s, -0.02 * s, -0.34 * s, -0.3 * s, 0, -0.28 * s); q.fill(); },
  };
  CHESS.SIL = SIL;
  CHESS.silCanvas = function (kind, fill, bg, S = 256) { const c = cnv(S, S), q = c.getContext('2d'); if (bg) { q.fillStyle = bg; q.fillRect(0, 0, S, S); } q.translate(S / 2, S / 2 + S * 0.03); q.fillStyle = fill; SIL[kind](q, S * 0.85); return c; };
  // enamel pin on the chest: kind silhouette, piece side colour on the opposite field, gold rim
  CHESS.badge = function (kind, side = 'w', r = 0.26) {
    const key = 'badge' + kind + side;
    const face = once(key, () => { const S = 256, c = cnv(S, S), q = c.getContext('2d'); q.fillStyle = side === 'w' ? '#2a2320' : '#f2e6c8'; q.fillRect(0, 0, S, S);
      const rg = q.createRadialGradient(S * 0.4, S * 0.35, 10, S / 2, S / 2, S * 0.6); rg.addColorStop(0, 'rgba(255,255,255,0.18)'); rg.addColorStop(1, 'rgba(0,0,0,0.2)'); q.fillStyle = rg; q.fillRect(0, 0, S, S);
      q.save(); q.translate(S / 2, S / 2); q.rotate(-PI / 2); q.translate(0, 6); q.fillStyle = side === 'w' ? '#f2e6c8' : '#2a2320'; SIL[kind](q, S * 0.72); q.restore();
      return new T.MeshPhysicalMaterial({ map: tex(c), roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1 }); });
    const g = new T.Group(); g.name = 'badge';
    const disc = new T.CylinderGeometry(r, r, 0.05, 40); disc.rotateX(PI / 2);
    g.add(mesh(disc, [gold(), face, gold()]));
    const rim = new T.TorusGeometry(r, 0.035, 8, 40); g.add(mesh(rim, gold(), 0, 0, 0.02));
    return g;
  };

  // ---------- gown / cape / apron (body-local: torso centre at origin, torso bottom y=-1, feet y=-3) ----------
  CHESS.gown = function (color = '#efe0c0', trim = '#d9b04a') {
    const g = new T.Group(); g.name = 'gown';
    const f = RBX.fleece(512, 512, color, 71), q = f.g, hq = f.hg;
    for (let x = 0; x < 512; x += 42) { const gr = q.createLinearGradient(x, 0, x + 42, 0); gr.addColorStop(0, 'rgba(0,0,0,0.16)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(0,0,0,0.16)'); q.fillStyle = gr; q.fillRect(x, 0, 42, 512);
      const hg2 = hq.createLinearGradient(x, 0, x + 42, 0); hg2.addColorStop(0, '#202020'); hg2.addColorStop(0.5, '#e0e0e0'); hg2.addColorStop(1, '#202020'); hq.fillStyle = hg2; hq.fillRect(x, 0, 42, 512); }
    const m = pbr(f.c, f.h, { physical: true, rough: 0.6, bump: 2, nscale: 0.7, sheen: 1, sheenColor: '#ffffff' }); m.side = T.DoubleSide;
    const sk = mesh(latheGeo([[1.06, -0.7], [1.1, -1.0], [1.3, -1.6], [1.55, -2.4], [1.72, -2.95], [1.72, -3.0]], 56), m); sk.scale.z = 0.72; g.add(sk);
    const tm = new T.MeshPhysicalMaterial({ color: trim, metalness: 0.7, roughness: 0.35 });
    const hem = mesh(new T.TorusGeometry(1.7, 0.07, 8, 56), tm, 0, -2.93, 0); hem.rotation.x = PI / 2; hem.scale.y = 0.72; g.add(hem);
    const belt = mesh(new T.TorusGeometry(1.07, 0.08, 8, 48), tm, 0, -0.78, 0); belt.rotation.x = PI / 2; belt.scale.y = 0.62; g.add(belt);
    return g;
  };
  CHESS.cape = function (color = '#8a1428', fur = '#f4f0e6') {
    const g = new T.Group(); g.name = 'cape'; const m = velvet(color).clone(); m.side = T.DoubleSide;
    const geo = new T.PlaneGeometry(2.6, 5.6, 8, 16), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), t = (2.8 - y) / 5.6; p.setX(i, x * (0.85 + 0.45 * t)); p.setZ(i, -0.62 - 0.35 * t - 0.12 * Math.cos(x * 4.5) * t - 0.45 * (x / 1.3) ** 2 * (1 - t) * 0.5); }
    geo.computeVertexNormals(); const c = mesh(geo, m, 0, -1.6 + 0.28, 0); g.add(c);
    const fm = RBX.plushMat(fur, '#ffffff', 41, 2);
    const col = mesh(new T.TorusGeometry(0.85, 0.22, 12, 40), fm, 0, 1.0, -0.05); col.rotation.x = PI / 2; col.scale.set(1.25, 0.75, 1); g.add(col);
    [-0.6, 0, 0.6, -0.3, 0.3].forEach((x, i) => g.add(mesh(new T.SphereGeometry(0.05, 8, 6), new T.MeshStandardMaterial({ color: '#111' }), x, 0.98, -0.42 - (i > 2 ? 0.15 : 0))));
    return g;
  };
  CHESS.apron = function () {
    const g = new T.Group(); const f = RBX.fleece(256, 512, '#f4f1ea', 81), q = f.g; q.fillStyle = 'rgba(200,170,120,0.25)'; for (let i = 0; i < 14; i++) { q.beginPath(); q.arc(Math.random() * 256, 200 + Math.random() * 300, 6 + Math.random() * 16, 0, 7); q.fill(); }
    q.strokeStyle = 'rgba(0,0,0,0.25)'; q.lineWidth = 4; q.strokeRect(70, 240, 116, 80);
    const m = pbr(f.c, f.h, { rough: 0.95, bump: 2 }); m.side = T.DoubleSide;
    g.add(mesh(new T.PlaneGeometry(1.7, 3.6), m, 0, -1.15, 0.53));
    const st = new T.MeshStandardMaterial({ color: '#e8e2d6', roughness: 0.9 });
    g.add(mesh(new T.BoxGeometry(2.04, 0.14, 1.04), st, 0, -0.55, 0));
    return g;
  };

  // ---------- extra faces ----------
  const ln = (q, pts, w = 9) => { q.strokeStyle = '#141414'; q.lineWidth = w; q.lineCap = q.lineJoin = 'round'; q.beginPath(); q.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) q.lineTo(pts[i], pts[i + 1]); q.stroke(); };
  RBX.FACES.haughty = (q) => {   // heavy lids, eyes looking down the nose, one brow up, smirk, lashes
    ln(q, [218, 168, 262, 150, 300, 160], 10); ln(q, [344, 176, 384, 168, 420, 176], 10);
    [[262, 226], [378, 226]].forEach(([x, y]) => { q.save(); q.beginPath(); q.ellipse(x, y, 22, 26, 0, 0, 7); q.clip(); q.fillStyle = '#121212'; q.fillRect(x - 30, y - 30, 60, 60); q.fillStyle = '#efcfa8'; q.fillRect(x - 30, y - 30, 60, 26); q.restore(); ln(q, [x - 26, y - 4, x + 26, y - 4], 8); ln(q, [x + 22, y - 6, x + 34, y - 18], 5); });
    q.fillStyle = '#b8264a'; q.beginPath(); q.moveTo(290, 330); q.quadraticCurveTo(330, 346, 368, 318); q.quadraticCurveTo(334, 330, 290, 330); q.fill(); ln(q, [290, 330, 330, 340, 370, 316], 7);
  };
  RBX.FACES.kindly = (q) => { ln(q, [232, 196, 290, 186], 8); ln(q, [350, 186, 408, 196], 8); q.fillStyle = '#121212'; [[262, 230], [378, 230]].forEach(([x, y]) => { q.beginPath(); q.ellipse(x, y, 14, 20, 0, 0, 7); q.fill(); });
    q.strokeStyle = '#141414'; q.lineWidth = 9; q.beginPath(); q.moveTo(268, 316); q.quadraticCurveTo(320, 356, 372, 316); q.stroke(); q.fillStyle = '#eee'; q.fillRect(250, 300, 140, 10); q.fillStyle = '#d9d6d0';
    q.beginPath(); q.moveTo(240, 296); q.quadraticCurveTo(320, 270, 400, 296); q.quadraticCurveTo(410, 330, 380, 318); q.quadraticCurveTo(320, 300, 260, 318); q.quadraticCurveTo(230, 330, 240, 296); q.fill(); };
  RBX.FACES.lashes = (q) => { RBX.FACES.neutral(q); ln(q, [240, 196, 230, 184], 5); ln(q, [250, 194, 246, 180], 5); ln(q, [390, 194, 394, 180], 5); ln(q, [400, 196, 410, 184], 5); };
  RBX.FACES['lashes-talk'] = (q) => { RBX.FACES['neutral-talk'](q); ln(q, [240, 196, 230, 184], 5); ln(q, [250, 194, 246, 180], 5); ln(q, [390, 194, 394, 180], 5); ln(q, [400, 196, 410, 184], 5); };
  RBX.FACES['haughty-talk'] = (q) => { RBX.FACES.haughty(q); q.clearRect(270, 300, 120, 60); q.fillStyle = '#7a1018'; q.strokeStyle = '#141414'; q.lineWidth = 7; q.beginPath(); q.moveTo(292, 322); q.quadraticCurveTo(330, 366, 368, 314); q.quadraticCurveTo(330, 326, 292, 322); q.fill(); q.stroke(); };
  RBX.FACES['kindly-talk'] = (q) => { RBX.FACES.kindly(q); q.fillStyle = '#7a1018'; q.strokeStyle = '#141414'; q.lineWidth = 7; q.beginPath(); q.ellipse(320, 334, 26, 18, 0, 0, 7); q.fill(); q.stroke(); q.fillStyle = '#d9d6d0'; q.beginPath(); q.moveTo(240, 296); q.quadraticCurveTo(320, 270, 400, 296); q.quadraticCurveTo(410, 330, 380, 318); q.quadraticCurveTo(320, 300, 260, 318); q.quadraticCurveTo(230, 330, 240, 296); q.fill(); };

  // ---------- knight horse hood (built on the dino hood: same plush shell, horse muzzle, ears, mane, bridle) ----------
  CHESS.horseHood = function (av, o = {}) {
    const base = o.hoodColor || '#8a5232', maneC = o.mane || '#2a170e';
    const g = RBX.dinoHood(av.head, { hoodColor: base, spikeColor: maneC });
    const mat = RBX.plushMat(base, '#ffd0a0', 5, 3), maneM = RBX.plushMat(maneC, '#7a5038', 9, 2), muzM = RBX.plushMat(o.muzzle || '#e9d3b4', '#ffffff', 12, 1);
    // drop the dino bits: teeth (cones), spikes (lathes), nostrils, eyes, upper jaw + bridge
    const kill = []; g.children.forEach((m) => { const t = m.geometry && m.geometry.type; if (t === 'ConeGeometry' || t === 'LatheGeometry') kill.push(m); else if (t === 'SphereGeometry' && m.geometry.parameters.radius < 0.1) kill.push(m); });
    kill.forEach((m) => g.remove(m));
    const sph = g.children.filter((m) => m.geometry && m.geometry.type === 'SphereGeometry' && m.geometry.parameters.thetaStart === 0);   // snout, bridge, palate (in that order)
    const [snout, bridge, palate] = sph;
    // long horse face: forehead plate sloping forward into a muzzle above the face opening
    snout.scale.set(0.52, 0.4, 0.95); snout.position.set(0, 0.8, 0.8); snout.rotation.x = 0.22;
    bridge.scale.set(0.62, 0.46, 0.7); bridge.position.set(0, 0.9, 0.36); bridge.rotation.x = 0.45;
    palate.scale.set(0.46, 0.15, 0.6); palate.position.set(0, 0.6, 0.62);
    const nose = mesh(new T.SphereGeometry(1, 40, 28), muzM, 0, 0.62, 1.42); nose.scale.set(0.47, 0.34, 0.36); g.add(nose);
    const nM = new T.MeshStandardMaterial({ color: '#2a1408', roughness: 1 });
    [-0.17, 0.17].forEach((x) => { const n = mesh(new T.SphereGeometry(0.08, 16, 10), nM, x * 1.1, 0.67, 1.75); n.scale.set(0.8, 1.2, 0.5); g.add(n); });
    // mouth line on the muzzle tip
    const lip = mesh(new T.TorusGeometry(0.24, 0.022, 6, 20, PI), nM, 0, 0.5, 1.68); lip.rotation.set(PI * 0.62, 0, PI); g.add(lip);
    // eyes on the sides of the long face
    const eyeM = new T.MeshPhysicalMaterial({ color: '#0b0b0d', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }), whiteM = new T.MeshStandardMaterial({ color: '#f4efe6', roughness: 0.5 });
    [-1, 1].forEach((s) => { const w = mesh(new T.SphereGeometry(0.17, 20, 14), whiteM, s * 0.5, 1.0, 0.5); w.scale.set(0.55, 1, 1); g.add(w); const e = mesh(new T.SphereGeometry(0.13, 20, 14), eyeM, s * 0.55, 1.0, 0.54); e.scale.set(0.55, 1, 0.95); g.add(e);
      const hl = mesh(new T.SphereGeometry(0.03, 8, 6), new T.MeshBasicMaterial({ color: '#ffffff' }), s * 0.6, 1.05, 0.6); g.add(hl); });
    // ears
    const earG = new T.ConeGeometry(0.2, 0.62, 16); earG.translate(0, 0.31, 0); const earIn = RBX.plushMat('#5a2e1c', '#c08060', 14, 1);
    [-1, 1].forEach((s) => { const e = mesh(earG, mat, s * 0.36, 1.06, -0.05); e.rotation.set(-0.15, 0, -s * 0.32); e.scale.set(1, 1, 0.6); g.add(e);
      const ei = mesh(earG, earIn, s * 0.36, 1.08, 0.01); ei.rotation.copy(e.rotation); ei.scale.set(0.6, 0.8, 0.3); g.add(ei); });
    // mane: plush tufts from the forelock over the crown and down the back of the hood
    const tuft = new T.SphereGeometry(1, 20, 14), MAN = [[0.92, 0.42, 0.2, 0.14, -0.6], [1.08, 0.18, 0.24, 0.16, -0.3], [1.16, -0.08, 0.27, 0.17, 0.0], [1.12, -0.34, 0.27, 0.17, 0.35], [1.0, -0.56, 0.26, 0.16, 0.7], [0.8, -0.74, 0.25, 0.15, 1.0], [0.56, -0.86, 0.24, 0.15, 1.25], [0.3, -0.93, 0.22, 0.14, 1.4], [0.04, -0.96, 0.2, 0.13, 1.5], [-0.22, -0.94, 0.18, 0.12, 1.55]];
    MAN.forEach(([y, z, ry, rz, rx], i) => { const t = mesh(tuft, maneM, (i % 2 ? 0.04 : -0.04), y, z); t.scale.set(0.11, ry, rz); t.rotation.x = rx; g.add(t); });
    const fl = mesh(tuft, maneM, 0.06, 0.94, 0.5); fl.scale.set(0.1, 0.2, 0.12); fl.rotation.set(-1.0, 0, 0.3); g.add(fl);
    // bridle: leather noseband + cheek straps + brass rings (the family orange)
    const lea = new T.MeshPhysicalMaterial({ color: o.strap || '#d06a1e', roughness: 0.45, clearcoat: 0.5 }), brass = gold();
    const nb = mesh(new T.TorusGeometry(1, 0.04, 8, 48), lea, 0, 0.76, 1.22); nb.rotation.x = PI / 2 + 0.3; nb.scale.set(0.5, 0.42, 1); g.add(nb);
    [-1, 1].forEach((s) => { const r = mesh(new T.TorusGeometry(0.08, 0.025, 8, 20), brass, s * 0.5, 0.72, 1.2); r.rotation.y = PI / 2; g.add(r); });
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    av.hood = g; return g;
  };

  // ---------- citizens ----------
  const P = () => (typeof PROPS !== 'undefined' ? PROPS : null);
  const hair = (a, k, c) => { const pr = P(); if (pr && pr.hair) { try { a.head.add(pr.hair(k, c)); } catch (e) { console.log('hair', e.message); } } };
  const pin = (a, kind, side, r, x = 0.5, y = 0.5) => { const b = CHESS.badge(kind, side, r); b.position.set(x, y, 0.52); a.body.add(b); a.badge = b; return b; };
  // kind: hero | dad | pawn | rook | taxi | bishop | queen | king | baker   side: 'w' | 'b'
  CHESS.citizen = function (kind, side = 'w', o = {}) {
    const W = side === 'w', seed = o.seed || 500;
    const shirt = o.shirt || (W ? '#ece2cc' : '#34302e'), pants = o.pants || (W ? '#b9a88a' : '#1d1b1c');
    let a;
    if (kind === 'hero') { a = RBX.avatar({ hood: 'dino', face: o.face || 'neutral', headScale: 1.25 }); pin(a, 'pawn', 'w', 0.3, 0.5, 0.5); a.kind = 'pawn'; return a; }
    if (kind === 'dad') {
      a = RBX.avatar({ top: 'hoodie', shirt: o.shirt || '#b4581e', pants: o.pants || '#2c3140', face: o.face || 'determined', headScale: 1.2, scale: 1.12, seed: 41 });
      CHESS.horseHood(a, {}); pin(a, 'knight', 'w', 0.3, 0.5, 0.5); a.kind = 'knight'; return a;
    }
    if (kind === 'pawn') { a = RBX.avatar({ top: o.top || 'shirt', shirt, pants, face: o.face || 'neutral', seed }); if (o.hair) hair(a, o.hair, o.hairC || '#4a2c18'); a.head.add(CHESS.pawnCap(side)); pin(a, 'pawn', side, 0.22); }
    if (kind === 'rook' || kind === 'taxi') { a = RBX.avatar({ top: 'polo', shirt: o.shirt || (W ? '#ece2cc' : '#34302e'), pants, face: o.face || 'neutral', seed, scale: 1.12, collar: '#f6c21c' }); a.head.add(CHESS.rookHat(side, kind === 'taxi')); pin(a, 'rook', side, 0.22, -0.5); }
    if (kind === 'bishop') { a = RBX.avatar({ top: o.top || 'cardigan', shirt: o.shirt || (W ? '#ece2cc' : '#3a3240'), pants, face: o.face || 'smile', seed, scale: o.scale || 1.04, collar: o.collar, tie: o.tie }); if (o.hair) hair(a, o.hair, o.hairC || '#6b3a1e'); a.head.add(CHESS.mitre(side)); pin(a, 'bishop', side, 0.22, -0.5); }
    if (kind === 'queen') { a = RBX.avatar({ top: 'cardigan', shirt: o.shirt || '#efe0c0', pants: o.shirt || '#efe0c0', face: o.face || 'haughty', seed, scale: 1.1, collar: '#d9b04a' }); hair(a, 'bob', o.hairC || '#2a1a12'); { const cr = CHESS.queenCrown(); cr.scale.setScalar(1.12); a.head.add(cr); } a.body.add(CHESS.gown(o.shirt || '#efe0c0')); a.body.add(CHESS.cape('#5a1a6a')); pin(a, 'queen', side, 0.22, -0.5); }
    if (kind === 'king') { a = RBX.avatar({ top: 'suit', shirt: o.shirt || '#efe0c0', pants: o.pants || '#efe0c0', face: o.face || 'kindly', seed, scale: 1.1, tie: '#7a1424' }); hair(a, 'short', '#d8d8dc'); a.head.add(CHESS.kingCrown()); a.body.add(CHESS.cape('#8a1428')); pin(a, 'king', side, 0.22, -0.5); }
    if (kind === 'baker') { a = RBX.avatar({ top: 'shirt', shirt: '#f2eee6', pants: '#3a3a40', face: o.face || 'closed', seed, scale: 1.1 }); a.head.add(CHESS.bakerToque()); a.body.add(CHESS.apron()); pin(a, 'pawn', 'w', 0.2, -0.55, 0.62); }
    a.kind = kind; a.side = side; return a;
  };

  // ---------- THE HAND (giant player's hand from the sky) ----------
  // local: wrist at origin, fingers point -y, palm faces +z, thumb on the +x side. ~1 unit = palm width / 4.
  // userData.pose({curl:[i,m,r,p] 0..1, thumb:0..1, spread}) ; userData.pinch(k) ; userData.tipMid() (local point between thumb and index tips)
  CHESS.hand = function (o = {}) {
    const g = new T.Group(); g.name = 'hand';
    const skin = once('handSkin' + (o.skin || ''), () => { const S = 512, c = cnv(S, S), hc = cnv(S, S), q = c.getContext('2d'), hq = hc.getContext('2d');
      q.fillStyle = o.skin || '#e6b08c'; q.fillRect(0, 0, S, S); KIT.noiseOver(q, S, S, 91, 0.16, 6, 5); hq.fillStyle = '#808080'; hq.fillRect(0, 0, S, S);
      const r = rng(92); for (let i = 0; i < 9000; i++) { const x = r() * S, y = r() * S; hq.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.3})`; hq.fillRect(x, y, 1.6, 1.6); q.fillStyle = 'rgba(150,80,60,0.06)'; q.fillRect(x, y, 2, 2); }
      for (let i = 0; i < 60; i++) { const y = r() * S, x = r() * S, l = 20 + r() * 50; hq.strokeStyle = 'rgba(0,0,0,0.35)'; hq.lineWidth = 1.2; hq.beginPath(); hq.moveTo(x, y); hq.quadraticCurveTo(x + l / 2, y + (r() - 0.5) * 8, x + l, y + (r() - 0.5) * 6); hq.stroke(); }
      for (let i = 0; i < 26; i++) { const x = r() * S, y = r() * S, rr = 16 + r() * 40, gr = q.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(210,110,100,0.12)'); gr.addColorStop(1, 'rgba(210,110,100,0)'); q.fillStyle = gr; q.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
      const m = pbr(c, hc, { physical: true, rough: 0.5, bump: 2.5, nscale: 0.45, sheen: 0.6, sheenColor: '#ffc8b0', sheenRough: 0.4, repeat: [0.6, 0.6] }); m.clearcoat = 0.12; m.clearcoatRoughness = 0.5; return m; });
    const crease = once('handCrease', () => { const S = 256, c = cnv(S, S), hc = cnv(S, S), q = c.getContext('2d'), hq = hc.getContext('2d'); q.fillStyle = o.skin || '#e6b08c'; q.fillRect(0, 0, S, S); KIT.noiseOver(q, S, S, 93, 0.14, 6, 4); hq.fillStyle = '#808080'; hq.fillRect(0, 0, S, S);
      [0.06, 0.94].forEach((v) => { for (let k = -1; k <= 1; k++) { const y = v * S + k * 7; q.strokeStyle = 'rgba(140,70,55,0.35)'; q.lineWidth = 2; q.beginPath(); q.moveTo(S * 0.15, y); q.quadraticCurveTo(S / 2, y + 4, S * 0.85, y); q.stroke(); hq.strokeStyle = '#000'; hq.lineWidth = 3; hq.beginPath(); hq.moveTo(S * 0.15, y); hq.quadraticCurveTo(S / 2, y + 4, S * 0.85, y); hq.stroke(); } });
      const m = pbr(c, hc, { physical: true, rough: 0.5, bump: 3, nscale: 0.5, sheen: 0.6, sheenColor: '#ffc8b0' }); m.clearcoat = 0.12; return m; });
    const nail = new T.MeshPhysicalMaterial({ color: '#f2c8b8', roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 });
    const M = (geo, mat, x, y, z, par = g) => { const m = mesh(geo, mat, x, y, z); par.add(m); return m; };
    // palm (slightly cupped: two blocks) + back knuckles
    M(rbox(4.0, 4.4, 1.5, 0.6, 10), skin, 0, -2.2, 0);
    const pad = M(new T.SphereGeometry(1, 32, 20), skin, 1.0, -3.0, 0.45); pad.scale.set(1.35, 1.6, 0.45);   // thumb mound
    const FX = [1.47, 0.49, -0.49, -1.47], FL = [[2.0, 1.35, 1.05], [2.2, 1.5, 1.1], [2.05, 1.4, 1.05], [1.6, 1.1, 0.9]], FW = [0.94, 0.96, 0.92, 0.8];
    const fingers = [];
    FX.forEach((x, fi) => {
      M(new T.SphereGeometry(0.42 * FW[fi], 20, 14), skin, x, -4.3, -0.42).scale.set(1, 0.8, 0.6);   // knuckle bump
      let par = new T.Group(); par.position.set(x, -4.35, 0); g.add(par); const segs = [par];
      FL[fi].forEach((L, si) => { const w = FW[fi] * (1 - si * 0.06); M(rbox(w, L + 0.12, w * 0.95, w * 0.42, 10), si === 2 ? skin : crease, 0, -L / 2, 0, par);
        if (si === 2) { const n = M(rbox(w * 0.72, L * 0.62, 0.1, 0.05, 6), nail, 0, -L * 0.6, -w * 0.45, par); n.rotation.x = -0.08; }
        const nx = new T.Group(); nx.position.y = -L; par.add(nx); segs.push(nx); par = nx; });
      fingers.push(segs);
    });
    // thumb: from the palm's +x/+z corner, pointing down and toward the palm
    const tb = new T.Group(); tb.position.set(1.85, -2.1, 0.35); g.add(tb); const tsegs = [tb]; let tp = tb;
    [[1.9, 1.15], [1.45, 1.08]].forEach(([L, w], si) => { M(rbox(w, L + 0.15, w * 0.95, w * 0.44, 10), si ? skin : crease, 0, -L / 2, 0, tp);
      if (si) { const n = M(rbox(w * 0.72, L * 0.55, 0.1, 0.05, 6), nail, 0, -L * 0.62, -w * 0.45, tp); n.rotation.x = -0.08; }
      const nx = new T.Group(); nx.position.y = -L; tp.add(nx); tsegs.push(nx); tp = nx; });
    // wrist + sleeve going up into the clouds (knit, ribbed cuff)
    M(rbox(3.6, 2.2, 1.6, 0.6, 8), skin, 0, 0.6, 0);
    const sleeveMat = once('sleeve' + (o.sleeve || ''), () => { const f = RBX.fleece(512, 512, o.sleeve || '#3c5a8a', 95), q = f.g, hq = f.hg; for (let x = 0; x < 512; x += 12) { q.fillStyle = 'rgba(0,0,0,0.12)'; q.fillRect(x, 0, 4, 512); hq.fillStyle = 'rgba(0,0,0,0.5)'; hq.fillRect(x, 0, 5, 512); } return pbr(f.c, f.h, { rough: 0.95, bump: 3, repeat: [3, 6] }); });
    const cuffMat = once('cuff' + (o.sleeve || ''), () => { const f = RBX.fleece(256, 256, o.sleeve || '#3c5a8a', 96), q = f.g, hq = f.hg; for (let x = 0; x < 256; x += 10) { q.fillStyle = 'rgba(0,0,0,0.3)'; q.fillRect(x, 0, 4, 256); hq.fillStyle = '#000'; hq.fillRect(x, 0, 5, 256); } return pbr(f.c, f.h, { rough: 0.95, bump: 5, repeat: [6, 1] }); });
    const cuff = M(new T.CylinderGeometry(2.55, 2.45, 2.0, 40), cuffMat, 0, 2.0, 0); cuff.scale.z = 0.62;
    // sleeve with cloth folds: bunched rings near the cuff, diagonal drape creases, a sag at the elbow line
    const slG = new T.CylinderGeometry(3.4, 2.7, 80, 96, 160, true), sp = slG.attributes.position, fr = rng(97);
    const ph = Array.from({ length: 6 }, () => [fr() * 6.28, 0.6 + fr() * 0.9, fr() * 6.28]);
    for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i), a = Math.atan2(z, x), t = (y + 40) / 80, near = Math.exp(-t * 6);
      let d = 0.42 * near * Math.sin(y * 2.1 + Math.sin(a * 2) * 1.5) + 0.32 * Math.exp(-((t - 0.3) ** 2) / 0.01) * (0.5 + 0.5 * Math.sin(a * 3 + 1));
      ph.forEach(([p0, f, p1], k) => { d += 0.13 * Math.max(0, Math.sin(a * (2 + k) + y * 0.12 * f + p0)) ** 3 * (0.6 + 0.4 * Math.sin(y * 0.05 + p1)); });
      d += 0.18 * Math.sin(y * 0.7 + a * 4) * near; const k = 1 + d / Math.hypot(x, z); sp.setX(i, x * k); sp.setZ(i, z * k); }
    slG.computeVertexNormals();
    const sl = M(slG, sleeveMat, 0, 42.8, 0); sl.scale.z = 0.66; sl.material.side = T.DoubleSide;
    // posing
    const ud = g.userData; ud.fingers = fingers; ud.thumb = tsegs;
    ud.pose = (p = {}) => {
      const curl = p.curl || [0.15, 0.15, 0.15, 0.15], sp = p.spread ?? 0.05;
      fingers.forEach((segs, fi) => { const k = curl[fi]; segs[0].rotation.set(-k * 1.2, 0, (fi - 1.5) * -sp); segs[1].rotation.x = -k * 1.4; segs[2].rotation.x = -k * 1.1; });
      const tk = p.thumb ?? 0.2; tsegs[0].rotation.set(-0.35 - tk * 0.7, 0, 0.35 - tk * 0.55); tsegs[1].rotation.x = -tk * 0.6; tsegs[2].rotation.x = -tk * 0.5;
    };
    ud.pinch = (k = 1) => ud.pose({ curl: [0.15 + 0.48 * k, 0.25 + 0.6 * k, 0.35 + 0.65 * k, 0.45 + 0.6 * k], thumb: 0.25 + 0.9 * k, spread: 0.03 });
    ud.tipMid = () => { g.updateMatrixWorld(true); const a = fingers[0][3].getWorldPosition(V3()), b = tsegs[2].getWorldPosition(V3()); return g.worldToLocal(a.add(b).multiplyScalar(0.5)); };
    ud.pose();
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  };
})();

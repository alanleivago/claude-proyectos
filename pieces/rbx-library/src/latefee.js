// rbx-library: THE LATE FEE - custom creature (not a Roblox avatar). ~3 m librarian, about 2.4x the hero:
// endless knit cardigan that pools on the floor (open front, a column of buttons all the way down), narrow high shoulders,
// too-long thin arms (sleeve to the elbow, grey bony forearm) ending in two giant rubber stamps instead of hands
// (L = "LATE" red ink, R = date stamp "DUE" with rolling date bands), long neck in a lace collar, egg head mostly in shadow,
// round glasses whose lenses only glint (blank), beaded chain looped under the chin, tight grey bun stabbed with pencils,
// tiny prim mouth, stiff head tilt. kind:true = the friendly Friday build (lenses clear -> kind eyes, blush, smile).
// API like an avatar: { root, body, neck, head, armL, armR, elbowL, elbowR, stampL, stampR, pose(), setFace(), o }.
'use strict';
const LF = {};
(function () {
  const T = THREE, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z), { cnv, tex, rng } = RBX;
  const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new T.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; };
  const PM = (c, r = 0.6, o = {}) => new T.MeshPhysicalMaterial(Object.assign({ color: c, roughness: r, clearcoat: 0.1, clearcoatRoughness: 0.6 }, o));
  LF.H = 13.6;   // overall height (hero ~5.6)
  // cardigan profile (r, y): pooled hem -> waist -> bust -> narrow high shoulders
  const PROF = [[2.55, 0.0], [2.45, 0.18], [2.15, 0.9], [1.85, 2.4], [1.55, 4.2], [1.3, 5.8], [1.32, 7.0], [1.42, 8.0], [1.36, 8.9], [1.08, 9.5], [0.5, 9.82], [0.32, 9.9]];
  function lathe(prof, phiS, phiL, seg, wob) { const pts = prof.map(([r, y]) => new T.Vector2(r, y)); const g = new T.LatheGeometry(pts, seg, phiS, phiL); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z); if (y < 2.2) { const k = 1 + wob * (1 - y / 2.2) * Math.sin(a * 9 + 0.7); p.setX(i, x * k); p.setZ(i, z * k); } }
    g.computeVertexNormals(); return g; }
  const rAt = (y) => { for (let i = 1; i < PROF.length; i++) if (y <= PROF[i][1]) { const [r0, y0] = PROF[i - 1], [r1, y1] = PROF[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0.3; };
  // stamp pad text (mirrored on the rubber, readable on the side label)
  const stampTex = (text, ink, mirror, w = 512, h = 320, bg = null) => { const c = cnv(w, h), q = c.getContext('2d'); q.fillStyle = bg || '#4a1010'; q.fillRect(0, 0, w, h);
    if (mirror) { q.translate(w, 0); q.scale(-1, 1); } q.strokeStyle = ink; q.lineWidth = 16; q.strokeRect(26, 26, w - 52, h - 52); q.fillStyle = ink; q.textAlign = 'center'; q.textBaseline = 'middle';
    let s = 190; q.font = `900 ${s}px Arial Black, Arial`; while (q.measureText(text).width > w - 100) { s -= 6; q.font = `900 ${s}px Arial Black, Arial`; } q.fillText(text, w / 2, h / 2 + 8); return tex(c); };
  LF.stampTex = stampTex;
  function stamp(o) { // built hanging: knob at y=0 (wrist), pad face at the bottom
    const g = new T.Group(), wood = PM('#8a4a22', 0.35, { clearcoat: 0.8, clearcoatRoughness: 0.2 }), knobM = PM(o.knob, 0.3, { clearcoat: 1, clearcoatRoughness: 0.15 });
    const knob = M(new T.SphereGeometry(0.5, 24, 16), knobM, 0, -0.35, 0); knob.scale.set(1, 0.85, 1); g.add(knob);
    g.add(M(new T.CylinderGeometry(0.2, 0.3, 0.8, 16), wood, 0, -1.05, 0));
    const bw = 2.3, bh = 0.95, bd = 1.45, by = -1.45 - bh / 2;
    const side = new T.MeshStandardMaterial({ map: stampTex(o.text, o.labelInk || '#c81e1e', false, 512, 220, '#f2e6c8'), roughness: 0.6 });
    const blockM = [wood, wood, wood, wood, side, wood], blk = M(RBX.rbox(bw, bh, bd, 0.12, 4), wood, 0, by, 0); g.add(blk);
    const lab = M(new T.PlaneGeometry(bw * 0.82, bh * 0.66), side, 0, by, bd / 2 + 0.005); g.add(lab);
    const lab2 = lab.clone(); lab2.position.z = -bd / 2 - 0.005; lab2.rotation.y = PI; g.add(lab2);
    if (o.date) { // rolling date bands on the front + little wheels on the sides
      [-1, 1].forEach((s) => { const w = M(new T.CylinderGeometry(0.32, 0.32, 0.12, 20), PM('#2a2a30', 0.4, { metalness: 0.6 }), s * (bw / 2 + 0.06), by, 0); w.rotation.z = PI / 2; g.add(w); }); }
    const rub = PM('#2a0c0c', 0.85), padM = new T.MeshStandardMaterial({ map: stampTex(o.text, o.ink, true, 512, 320, '#3a0e0e'), roughness: 0.4, emissive: new T.Color(o.ink), emissiveIntensity: 0.0 });
    const pad = M(new T.BoxGeometry(bw * 0.94, 0.2, bd * 0.92), [rub, rub, rub, padM, rub, rub], 0, by - bh / 2 - 0.1, 0); g.add(pad);
    // wet ink shine on the pad underside
    g.userData = { pad, padM, bottom: by - bh / 2 - 0.2, labels: [lab, lab2] }; return g;
  }
  // ---- head textures ----
  function headTex(kind) { const W = 512, H = 256, c = cnv(W, H), q = c.getContext('2d'); const base = kind ? '#d8c8cc' : '#8a8098'; q.fillStyle = base; q.fillRect(0, 0, W, H);
    // the top half falls into shadow (creepy); cheek hollows; kind build stays lit
    const g = q.createLinearGradient(0, 0, 0, H); g.addColorStop(0, kind ? 'rgba(60,40,60,0.35)' : 'rgba(30,20,40,0.85)'); g.addColorStop(0.42, kind ? 'rgba(60,40,60,0.1)' : 'rgba(30,20,40,0.62)'); g.addColorStop(0.62, 'rgba(30,20,40,0)'); q.fillStyle = g; q.fillRect(0, 0, W, H);
    const r = rng(9); for (let i = 0; i < 1600; i++) { q.fillStyle = `rgba(80,60,80,${r() * 0.06})`; q.fillRect(r() * W, r() * H, 3, 3); } return tex(c); }
  // face decal (partial sphere over the front): mouth, cheeks, wrinkles. Drawn per expression.
  const FACE = {
    blank: (q, W, H) => { shadowTop(q, W, H); prim(q, W, H, 0); },
    tilt: (q, W, H) => { shadowTop(q, W, H); prim(q, W, H, 1); },
    shush: (q, W, H) => { shadowTop(q, W, H); q.fillStyle = '#2a1018'; q.beginPath(); q.ellipse(W / 2, H * 0.71, 9, 10, 0, 0, 7); q.fill(); pucker(q, W, H, 16); },
    frozen: (q, W, H) => { shadowTop(q, W, H, 0.6); prim(q, W, H, 0); },
    kind: (q, W, H) => { blush(q, W, H); q.strokeStyle = '#5a2030'; q.lineWidth = 6; q.lineCap = 'round'; q.beginPath(); q.moveTo(W / 2 - 34, H * 0.68); q.quadraticCurveTo(W / 2, H * 0.78, W / 2 + 34, H * 0.68); q.stroke(); },
    hum: (q, W, H) => { blush(q, W, H); q.fillStyle = '#5a2030'; q.beginPath(); q.ellipse(W / 2, H * 0.71, 10, 12, 0, 0, 7); q.fill(); },
    voices: (q, W, H) => { blush(q, W, H); q.fillStyle = '#3a0e18'; q.beginPath(); q.moveTo(W / 2 - 40, H * 0.66); q.quadraticCurveTo(W / 2, H * 0.62, W / 2 + 40, H * 0.66); q.quadraticCurveTo(W / 2 + 30, H * 0.86, W / 2, H * 0.87); q.quadraticCurveTo(W / 2 - 30, H * 0.86, W / 2 - 40, H * 0.66); q.fill();
      q.fillStyle = '#f6f2ea'; q.fillRect(W / 2 - 30, H * 0.655, 60, 9); q.fillStyle = '#e8708a'; q.beginPath(); q.ellipse(W / 2, H * 0.83, 18, 8, 0, 0, 7); q.fill(); },
  };
  function shadowTop(q, W, H, k = 0.97) { const g = q.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(18,10,26,${k})`); g.addColorStop(0.64, `rgba(18,10,26,${k * 0.92})`); g.addColorStop(0.7, `rgba(18,10,26,${k * 0.45})`); g.addColorStop(0.8, `rgba(18,10,26,${k * 0.2})`); g.addColorStop(1, `rgba(18,10,26,${k * 0.5})`); q.fillStyle = g; q.fillRect(0, 0, W, H);
    [[W / 2 - 70, H * 0.47], [W / 2 + 70, H * 0.47]].forEach(([x, y]) => { const r = q.createRadialGradient(x, y + 10, 4, x, y + 10, 60); r.addColorStop(0, `rgba(18,10,26,${k * 0.7})`); r.addColorStop(1, 'rgba(18,10,26,0)'); q.fillStyle = r; q.fillRect(x - 60, y - 50, 120, 120); }); }
  function prim(q, W, H, smile) { const y = H * 0.735; q.strokeStyle = '#2a1018'; q.lineWidth = 5; q.lineCap = 'round'; q.beginPath(); q.moveTo(W / 2 - 15, y + (smile ? -4 : 0)); q.quadraticCurveTo(W / 2, y + (smile ? 6 : 2), W / 2 + 15, y + (smile ? -4 : 0)); q.stroke(); pucker(q, W, H, 18); }
  function pucker(q, W, H, d) { q.strokeStyle = 'rgba(60,30,50,0.55)'; q.lineWidth = 2; [-1, 1].forEach((s) => { for (let k = 0; k < 3; k++) { q.beginPath(); q.moveTo(W / 2 + s * (d + k * 4), H * 0.69 - 4 + k * 4); q.lineTo(W / 2 + s * (d + 6 + k * 4), H * 0.69 - 2 + k * 4); q.stroke(); } });
    q.beginPath(); q.moveTo(W / 2 - 30, H * 0.6); q.quadraticCurveTo(W / 2 - 38, H * 0.7, W / 2 - 30, H * 0.8); q.moveTo(W / 2 + 30, H * 0.6); q.quadraticCurveTo(W / 2 + 38, H * 0.7, W / 2 + 30, H * 0.8); q.stroke(); }
  function blush(q, W, H) { [[W / 2 - 78, H * 0.6], [W / 2 + 78, H * 0.6]].forEach(([x, y]) => { const g = q.createRadialGradient(x, y, 2, x, y, 30); g.addColorStop(0, 'rgba(240,110,140,0.75)'); g.addColorStop(1, 'rgba(240,110,140,0)'); q.fillStyle = g; q.fillRect(x - 32, y - 32, 64, 64); }); }
  const FT = {}; const faceTex = (k) => FT[k] || (FT[k] = (() => { const W = 512, H = 384, c = cnv(W, H), q = c.getContext('2d'); (FACE[k] || FACE.blank)(q, W, H); const t = tex(c); return t; })());
  // lens: glint (blank) or eyes behind glass
  const LENS = {};
  const lensTex = (k) => LENS[k] || (LENS[k] = (() => { const S = 256, c = cnv(S, S), q = c.getContext('2d');
    if (k === 'glint') { const g = q.createRadialGradient(S * 0.45, S * 0.42, 4, S / 2, S / 2, S / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#e8f0ff'); g.addColorStop(1, '#a8b8d8'); q.fillStyle = g; q.fillRect(0, 0, S, S);
      q.fillStyle = 'rgba(255,255,255,0.95)'; q.save(); q.translate(S / 2, S / 2); q.rotate(-0.7); q.fillRect(-S, -16, S * 2, 22); q.fillRect(-S, 22, S * 2, 8); q.restore(); }
    else { q.fillStyle = '#e8eef4'; q.fillRect(0, 0, S, S); q.fillStyle = 'rgba(160,180,210,0.35)'; q.fillRect(0, 0, S, S);
      if (k === 'pin') { q.fillStyle = '#141414'; q.beginPath(); q.arc(S / 2, S / 2, 14, 0, 7); q.fill(); q.strokeStyle = 'rgba(20,20,20,0.5)'; q.lineWidth = 4; q.beginPath(); q.arc(S / 2, S / 2, 60, PI * 1.15, PI * 1.85); q.stroke(); }
      if (k === 'eyes') { q.fillStyle = '#2a1a1a'; q.beginPath(); q.ellipse(S / 2, S * 0.55, 30, 38, 0, 0, 7); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(S / 2 - 10, S * 0.48, 10, 0, 7); q.fill(); q.strokeStyle = '#2a1a1a'; q.lineWidth = 6; q.beginPath(); q.arc(S / 2, S * 0.5, 66, PI * 1.2, PI * 1.8); q.stroke(); }
      if (k === 'closed') { q.strokeStyle = '#2a1a1a'; q.lineWidth = 10; q.lineCap = 'round'; q.beginPath(); q.arc(S / 2, S * 0.62, 42, PI * 1.15, PI * 1.85); q.stroke(); }
      if (k === 'wide') { q.fillStyle = '#2a1a1a'; q.beginPath(); q.ellipse(S / 2, S * 0.52, 34, 44, 0, 0, 7); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(S / 2 - 12, S * 0.44, 12, 0, 7); q.fill(); q.strokeStyle = '#2a1a1a'; q.lineWidth = 6; q.beginPath(); q.arc(S / 2, S * 0.44, 74, PI * 1.25, PI * 1.75); q.stroke(); }
      q.fillStyle = 'rgba(255,255,255,0.7)'; q.save(); q.translate(S / 2, S / 2); q.rotate(-0.7); q.fillRect(-S, -60, S * 2, 10); q.restore(); }
    return tex(c); })());
  LF.stamp = (o) => stamp(Object.assign({ text: 'LATE', ink: '#e01818', knob: '#a01818' }, o));
  const LENSOF = { blank: 'glint', tilt: 'glint', shush: 'glint', frozen: 'pin', kind: 'eyes', hum: 'closed', voices: 'wide' };

  LF.make = function (o = {}) {
    const kind = !!o.kind, root = new T.Group(); root.name = 'latefee';
    const body = new T.Group(); root.add(body); const lower = new T.Group(), upper = new T.Group(); body.add(lower); body.add(upper);
    const cardC = o.cardigan || '#8a5a70', knit = GN.mat('knit', { c: cardC, tile: 0.125, bands: 4, bandK: 0.2, bump: 5, seed: 7 }).clone(); knit.side = T.DoubleSide;
    const rib = GN.mat('rib', { c: '#6a3a50', tile: 0.25, bump: 4 });
    // cardigan shell (open front) + dark dress inside
    const gap = 0.36, card = M(lathe(PROF, gap, PI * 2 - gap * 2, 64, 0.07), knit); lower.add(card);
    const dress = M(lathe(PROF.map(([r, y]) => [r * 0.95, y]), 0, PI * 2, 48, 0.0), PM(kind ? '#3a2a4a' : '#22182a', 0.85)); lower.add(dress);
    // button bands down both edges + a column of buttons all the way down (it never ends)
    const btnM = PM('#d8c8a0', 0.3, { clearcoat: 0.8 });
    [-1, 1].forEach((s) => { const pts = []; for (let y = 0.15; y <= 9.6; y += 0.3) { const r = rAt(y) + 0.02, a = s * gap; pts.push(V(Math.sin(a) * r, y, Math.cos(a) * r)); }
      lower.add(M(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 80, 0.11, 6), rib)); });
    for (let y = 0.5, k = 0; y < 9.3; y += 0.55, k++) { const r = rAt(y) + 0.1, a = gap * 0.9; const b = M(new T.CylinderGeometry(0.11, 0.11, 0.06, 14), btnM, Math.sin(a) * r, y, Math.cos(a) * r); b.rotation.x = PI / 2; b.rotation.z = -a; lower.add(b); }
    // patch pockets (one with a pencil and a bookmark)
    [-1, 1].forEach((s) => { const a = s * 0.85, y = 4.9, r = rAt(y) + 0.03; const p = M(new T.BoxGeometry(0.9, 0.85, 0.08), rib, Math.sin(a) * r, y, Math.cos(a) * r); p.rotation.y = a; lower.add(p); });
    { const a = 0.85, r = rAt(5.4) + 0.1; const pen = M(new T.CylinderGeometry(0.05, 0.05, 1.0, 6), PM('#f2c01a', 0.5), Math.sin(a) * r, 5.6, Math.cos(a) * r); pen.rotation.z = -0.2; lower.add(pen); }
    // lace collar
    const lace = PM('#ece6dc', 0.8, { side: T.DoubleSide }); for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2, k = M(new T.ConeGeometry(0.17, 0.42, 5), lace, Math.sin(a) * 0.42, 10.05, Math.cos(a) * 0.42 + 0.08); k.rotation.set(Math.cos(a) * -2.4, 0, Math.sin(a) * 2.4); upper.add(k); }
    // brooch
    lower.add(M(new T.SphereGeometry(0.13, 12, 10), PM('#3a8a6a', 0.2, { clearcoat: 1 }), 0, 9.55, 0.95));
    // ---- neck + head ----
    const neck = new T.Group(); neck.position.set(0, 9.85, 0.22); upper.add(neck);
    const skin = PM(kind ? '#d8c8cc' : '#9a90a8', 0.6);
    neck.add(M(new T.CylinderGeometry(0.24, 0.3, 1.3, 14), skin, 0, 0.55, 0));
    const head = new T.Group(); head.position.set(0, 2.05, 0.1); neck.add(head);
    const hm = new T.MeshPhysicalMaterial({ map: headTex(kind), roughness: 0.6, clearcoat: 0.05 }), hs = [0.82, 1.08, 0.86];
    const skull = M(new T.SphereGeometry(1, 48, 32), hm); skull.scale.set(...hs); head.add(skull);
    const faceMat = new T.MeshStandardMaterial({ map: faceTex(kind ? 'kind' : 'blank'), transparent: true, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
    const fdec = new T.Mesh(new T.SphereGeometry(1.004, 40, 24, PI / 2 - 0.9, 1.8, 0.95, 1.5), faceMat); fdec.scale.set(...hs); fdec.renderOrder = 2; head.add(fdec);
    // nose: thin and pointed
    const nose = M(new T.ConeGeometry(0.1, 0.42, 10), skin, 0, -0.08, 0.92); nose.rotation.x = PI / 2 + 0.35; head.add(nose);
    // glasses + chain
    const rimM = PM('#2a2024', 0.3, { metalness: 0.6 }), lensM = [-1, 1].map(() => new T.MeshStandardMaterial({ map: lensTex(kind ? 'eyes' : 'glint'), roughness: 0.2, emissive: new T.Color('#ffffff'), emissiveMap: lensTex(kind ? 'eyes' : 'glint'), emissiveIntensity: kind ? 0.25 : 2.4 }));
    [-1, 1].forEach((s, i) => { const rim = M(new T.TorusGeometry(0.31, 0.04, 10, 32), rimM, s * 0.36, 0.14, 0.86); head.add(rim); const l = M(new T.CircleGeometry(0.3, 32), lensM[i], s * 0.36, 0.14, 0.855); l.castShadow = false; head.add(l);
      head.add(M(new T.BoxGeometry(0.22, 0.05, 0.05), rimM, s * 0.75, 0.16, 0.8)); head.add(M(new T.BoxGeometry(0.05, 0.05, 0.95), rimM, s * 0.86, 0.16, 0.32)); });
    head.add(M(new T.TorusGeometry(0.1, 0.03, 8, 16, PI), rimM, 0, 0.16, 0.9));
    const beadM = PM('#e0b850', 0.25, { metalness: 0.9 }), chainPts = []; [[-0.86, 0.12, 0.6], [-0.95, -0.5, 0.45], [-0.8, -1.2, 0.6], [-0.4, -1.6, 0.85], [0, -1.7, 0.92], [0.4, -1.6, 0.85], [0.8, -1.2, 0.6], [0.95, -0.5, 0.45], [0.86, 0.12, 0.6]].forEach(([x, y, z]) => chainPts.push(V(x, y, z)));
    const cc = new T.CatmullRomCurve3(chainPts), NB = 120, beads = new T.InstancedMesh(new T.SphereGeometry(0.035, 6, 5), beadM, NB), mm = new T.Matrix4(); for (let i = 0; i < NB; i++) { mm.makeTranslation(...cc.getPoint(i / (NB - 1)).toArray()); beads.setMatrixAt(i, mm); } head.add(beads);
    // hair: tight grey cap + bun + pencils
    const hairM = new T.MeshPhysicalMaterial({ map: (() => { const c = cnv(256, 256), q = c.getContext('2d'); q.fillStyle = '#8e8894'; q.fillRect(0, 0, 256, 256); for (let i = 0; i < 400; i++) { q.strokeStyle = `rgba(${i % 2 ? 230 : 40},${i % 2 ? 226 : 36},${i % 2 ? 236 : 46},0.18)`; q.lineWidth = 1.5; q.beginPath(); const x = Math.random() * 256; q.moveTo(x, 0); q.bezierCurveTo(x + 20, 80, x - 20, 170, x + 6, 256); q.stroke(); } return tex(c); })(), roughness: 0.55, clearcoat: 0.4 });
    const cap = M(new T.SphereGeometry(1.04, 40, 20, 0, PI * 2, 0, 1.28), hairM); cap.scale.set(...hs); head.add(cap); const nape = M(new T.SphereGeometry(1.035, 40, 20, 0, PI * 2, 0, 1.3), hairM); nape.scale.set(...hs); nape.rotation.x = -1.0; head.add(nape);
    const bun = M(new T.SphereGeometry(0.62, 28, 18), hairM, 0, 1.05, -0.55); head.add(bun); const wrap = M(new T.TorusGeometry(0.5, 0.12, 10, 28), hairM, 0, 0.9, -0.48); wrap.rotation.x = PI / 2 + 0.5; head.add(wrap);
    const penc = (rx, rz, c, dx) => { const g = new T.Group(); g.add(M(new T.CylinderGeometry(0.065, 0.065, 1.7, 6), PM(c, 0.5))); g.add(M(new T.CylinderGeometry(0.07, 0.07, 0.14, 10), PM('#c8c8d0', 0.3, { metalness: 0.9 }), 0, 0.92, 0)); g.add(M(new T.CylinderGeometry(0.066, 0.066, 0.16, 10), PM('#f08aa0', 0.8), 0, 1.07, 0));
      g.add(M(new T.ConeGeometry(0.065, 0.24, 6), PM('#e8c890', 0.8), 0, -0.97, 0)); const tip = M(new T.ConeGeometry(0.022, 0.08, 6), PM('#2a2a2a', 0.4), 0, -1.07, 0); tip.rotation.x = PI; g.children[3].rotation.x = PI; g.add(tip); g.position.set(dx, 1.08, -0.56); g.rotation.set(rx, 0, rz); head.add(g); };
    penc(0.3, 1.1, '#f2c01a', 0); penc(-0.2, -1.25, '#f2c01a', 0.05); penc(0.9, 0.5, '#e84040', -0.05);
    // ---- arms: high shoulders, sleeve to the elbow, long grey forearm, stamp ----
    const bone = PM(kind ? '#cbbcc4' : '#a49aae', 0.55);
    const arm = (s, stampO) => { const sh = new T.Group(); sh.position.set(s * 1.12, 9.35, 0.05); upper.add(sh);
      sh.add(M(new T.SphereGeometry(0.46, 18, 12), knit, 0, 0, 0));
      const up = M(new T.CylinderGeometry(0.42, 0.34, 3.0, 16, 1, true), knit, 0, -1.5, 0); sh.add(up); const cuff = M(new T.CylinderGeometry(0.38, 0.38, 0.4, 16), rib, 0, -2.9, 0); sh.add(cuff);
      const el = new T.Group(); el.position.set(0, -3.05, 0); sh.add(el); el.add(M(new T.SphereGeometry(0.2, 12, 10), bone));
      el.add(M(new T.CylinderGeometry(0.13, 0.17, 2.9, 10), bone, 0, -1.45, 0)); el.add(M(new T.SphereGeometry(0.17, 10, 8), bone, 0, -2.9, 0));
      const st = stamp(stampO); st.scale.setScalar(1.18); st.position.set(0, -2.85, 0); el.add(st); return { sh, el, st }; };
    const L = arm(1, { text: 'LATE', ink: '#e01818', knob: '#a01818' }), R = arm(-1, { text: 'DUE', ink: '#7a3ad0', labelInk: '#5a2ab0', knob: '#2a2a30', date: true });
    // music notes (hum) - toggled by setFace
    const notes = new T.Group(); notes.visible = false; head.add(notes); const nm = new T.MeshBasicMaterial({ map: KIT.textTex(128, 128, (q) => { q.fillStyle = '#ffffff'; q.font = '900 110px serif'; q.textAlign = 'center'; q.fillText('♪', 64, 104); }), transparent: true, depthWrite: false });
    [[1.4, 0.9, 0.4, 0.55], [1.9, 1.5, 0.2, 0.42], [1.2, 1.9, 0.0, 0.34]].forEach(([x, y, z, s]) => { const p = new T.Mesh(new T.PlaneGeometry(s * 2, s * 2), nm); p.position.set(x, y, z); notes.add(p); });
    root.traverse((m) => { if (m.isMesh && !m.material.transparent) { m.castShadow = true; m.receiveShadow = true; } });
    root.scale.setScalar(o.scale || 1);
    const av = { root, body, neck, head, armL: L.sh, armR: R.sh, elbowL: L.el, elbowR: R.el, stampL: L.st, stampR: R.st, lensM, faceMat, notes, o: { face: kind ? 'kind' : 'blank', scale: o.scale || 1 }, isCreature: true, kind };
    const REST = kind ? { head: [0.1, 0, 0.18], armL: [0, 0, 0.12], armR: [0, 0, -0.12], elbowL: [0, 0, 0], elbowR: [0, 0, 0] } : { head: [0.22, 0, 0.36], armL: [0.04, 0, 0.1], armR: [0.04, 0, -0.1], elbowL: [0, 0, 0], elbowR: [0, 0, 0] };
    av.pose = (p = {}) => { const q = Object.assign({}, REST, p), set = (g, v = [0, 0, 0]) => g.rotation.set(v[0] || 0, v[1] || 0, v[2] || 0);
      set(L.sh, q.armL); set(R.sh, q.armR); set(L.el, q.elbowL); set(R.el, q.elbowR); set(neck, q.head); set(body, q.body); };
    av.setFace = (k) => { av.faceName = k; faceMat.map = faceTex(k); faceMat.needsUpdate = true; const lk = LENSOF[k] || 'glint', glow = lk === 'glint';
      lensM.forEach((m) => { m.map = lensTex(lk); m.emissiveMap = lensTex(lk); m.emissiveIntensity = glow ? 2.4 : 0.25; m.needsUpdate = true; }); notes.visible = k === 'hum' || k === 'voices'; };
    // sit (story time): the cardigan squashes onto a tiny chair, the upper body drops with it
    // keep the block labels upright when a stamp is raised upside down (the rubber pad stays mirrored)
    const _d = new T.Vector3(), _o = new T.Vector3(); av.fixLabels = () => { root.updateMatrixWorld(true); [L.st, R.st].forEach((st) => { st.getWorldPosition(_o); _d.copy(st.localToWorld(new T.Vector3(0, -1, 0))).sub(_o); st.userData.labels.forEach((l) => { l.rotation.z = _d.y > 0.05 ? PI : 0; }); }); };
    av.sit = (k = 1) => { lower.scale.y = k; upper.position.y = -(1 - k) * 9.6; };
    av.pose({}); av.setFace(av.o.face);
    return av;
  };
  LF.POSE = {
    high: { armL: [-2.45, 0.15, 0.32], armR: [-2.4, -0.15, -0.32], elbowL: [2.35, 0, 0], elbowR: [2.3, 0, 0], head: [0.3, 0, 0.42] },        // mantis: elbows up, stamps hanging pads-down over you        // two stamps up high
    stampDown: { armL: [-1.3, 0, 0.1], armR: [-2.6, 0, -0.4], elbowL: [-0.5, 0, 0], elbowR: [-0.9, 0, 0], head: [0.55, 0, 0.2] },
    reach: { armL: [-1.25, 0, 0.05], armR: [-0.25, 0, -0.12], elbowL: [-0.25, 0, 0], elbowR: [0, 0, 0], head: [0.4, 0, 0.3] },
    creep: { armL: [-0.45, 0, 0.18], armR: [-0.6, 0, -0.2], elbowL: [-0.4, 0, 0], elbowR: [-0.55, 0, 0], head: [0.35, 0.25, 0.42] },
    read: { armL: [-1.35, 0.35, 0.05], armR: [-1.35, -0.35, -0.05], elbowL: [-0.9, 0, 0], elbowR: [-0.9, 0, 0], head: [0.42, 0, 0.12] },
    voices: { armL: [-2.2, 0, 0.7], armR: [-1.3, -0.3, -0.1], elbowL: [-0.4, 0, 0], elbowR: [-1.0, 0, 0], head: [0.05, 0, -0.25] },
    stampDesk: { armL: [-1.0, 0.1, 0.05], armR: [-2.9, -0.1, -0.2], elbowL: [-1.1, 0, 0], elbowR: [-0.3, 0, 0], head: [0.5, 0, 0.25] },
  };
  // grey hand out of the drop box: thin grey arm, 4 bony fingers + thumb, gripping a small LATE stamp
  LF.hand = function (o = {}) { const g = new T.Group(), bone = PM('#9a90a6', 0.5), len = o.len || 2.6, knuck = PM('#8a8096', 0.5);
    g.add(M(new T.CylinderGeometry(0.17, 0.21, len, 12), bone, 0, len / 2, 0)); g.add(M(new T.SphereGeometry(0.2, 12, 10), bone, 0, len, 0));
    // stamp held out in front, pad facing +z (toward the victim)
    const st = new T.Group(), wood = PM('#8a4a22', 0.35, { clearcoat: 0.8 }); st.add(M(new T.SphereGeometry(0.26, 16, 12), PM('#a01818', 0.3, { clearcoat: 1 }), 0, 0, -0.62)); st.add(M(new T.CylinderGeometry(0.11, 0.15, 0.55, 12), wood, 0, 0, -0.3)); st.children[1].rotation.x = PI / 2;
    st.add(M(RBX.rbox(1.0, 0.7, 0.36, 0.06, 3), wood, 0, 0, 0)); const padM = new T.MeshStandardMaterial({ map: stampTex('LATE', '#e01818', true, 256, 180, '#3a0e0e') }), rub = PM('#2a0c0c', 0.85);
    st.add(M(new T.BoxGeometry(0.94, 0.64, 0.08), [rub, rub, rub, rub, padM, rub], 0, 0, 0.22)); st.position.set(0, len + 0.35, 0.55); g.add(st);
    // palm behind the handle + 4 long fingers curled over the handle, thumb under it
    g.add(M(RBX.rbox(0.62, 0.5, 0.3, 0.1, 4), bone, 0, len + 0.32, -0.15));
    [-0.22, -0.075, 0.075, 0.22].forEach((x, i) => { const f = new T.Group(); f.position.set(x, len + 0.55, -0.12); g.add(f); f.rotation.x = 1.0; const l1 = 0.42 + (i === 1 || i === 2 ? 0.1 : 0);
      f.add(M(new T.CylinderGeometry(0.065, 0.075, l1, 8), bone, 0, l1 / 2, 0)); f.add(M(new T.SphereGeometry(0.085, 8, 6), knuck, 0, l1, 0)); const f2 = new T.Group(); f2.position.y = l1; f.add(f2); f2.rotation.x = 1.5;
      f2.add(M(new T.CylinderGeometry(0.05, 0.065, 0.36, 8), bone, 0, 0.18, 0)); f2.add(M(new T.SphereGeometry(0.06, 8, 6), knuck, 0, 0.36, 0)); });
    const th = new T.Group(); th.position.set(0.3, len + 0.2, -0.05); th.rotation.set(0.9, 0, -0.5); g.add(th); th.add(M(new T.CylinderGeometry(0.065, 0.075, 0.5, 8), bone, 0, 0.25, 0));
    g.userData.stamp = st; return g; };
  // a red "LATE" ink mark (decal) for steps / palms / foreheads
  LF.mark = function (text = 'LATE', ink = '#d01818', w = 1.4, h = 0.85, rot = 0) { const c = cnv(256, 160), q = c.getContext('2d'); q.globalAlpha = 0.92; q.strokeStyle = ink; q.lineWidth = 10; q.strokeRect(12, 12, 232, 136); q.fillStyle = ink; q.textAlign = 'center'; q.textBaseline = 'middle';
    let s = 96; q.font = `900 ${s}px Arial Black, Arial`; while (q.measureText(text).width > 210) { s -= 4; q.font = `900 ${s}px Arial Black, Arial`; } q.fillText(text, 128, 84);
    q.globalCompositeOperation = 'destination-out'; const r = rng(text.length * 7 + Math.floor(rot * 100)); for (let i = 0; i < 220; i++) { q.globalAlpha = r() * 0.8; q.beginPath(); q.arc(r() * 256, r() * 160, r() * 4, 0, 7); q.fill(); }
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: tex(c), transparent: true, roughness: 0.3, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 })); m.rotation.z = rot; return m; };
})();

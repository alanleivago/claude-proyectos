// =====================================================================
//  styles/cartoon3d/exterior.js — OPT-IN exterior helpers (2026-11-10, pieces/lost-luggage), Ricks-like depth:
//   c3SkyDome(scene, o)      a sky sphere: zenith -> mid -> horizon gradient + clouds, unlit, no fog; o.paint (v5): painted
//                            volumetric cumulus + a warm sun-side horizon glow (Ricks colour study, fuentes/cartoon3d/ricks-color.md)
//   c3Car(o)                 a rounded car: bevelled body, glass cabin with reflections, wheels with rims + tyres,
//                            head/tail lights, chrome bumpers; o: { color, kind: 'sedan'|'hatch'|'pickup'|'suv', scale }
//   c3PineTree(s, seed) / c3LeafTree(s, seed)   layered trees with textured foliage (merged, cheap)
//   c3Backdrop(scene, o)     receding depth layers for a view out of a window/door or behind a street: rows of trees,
//                            low distant buildings, hills; everything fades into the horizon colour (atmospheric depth)
//  Add "styles/cartoon3d/exterior.js" to the build list after the kit / setlook files.
// =====================================================================
// o: { r, zenith, mid, midH, horizon, ground, sun: dir toward the sun, glow: '#hex' warm sun-side horizon/halo, glowK,
//      clouds: count, seed, layer, paint: true = painted volumetric cumulus (v5, Ricks), cloudLit/cloudShade: '#hex',
//      cloudBand: [v0, v1] (0 = high, 1 = horizon), cloudScale }
// painted clouds (v5, measured on the Ricks refs: soft cumulus banks, lit white-cream tops, lavender-grey undersides,
// soft edges, smaller + flatter + hazier toward the horizon): the texture stores LIGHT in rgb and COVERAGE in alpha, so
// the dome colours them per scene (sunset clouds peach/violet with the same shapes)
function c3PaintedCloudTex(o = {}) {
  // ~17 px per degree both ways (360 deg x 53 deg): round clouds, sharp enough at 1080
  const w = 6144, h = 1000, Rn = RNG('c3pclouds', o.seed ?? 3), sunX = Math.sign((o.sun ?? [0.5])[0] || 1);
  const mk = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, w, h); return [c, x]; };
  const [, cx] = mk(), [, lx] = mk(), [v0, v1] = o.cloudBand ?? [0.06, 0.96], n = o.clouds ?? 40, list = [];
  for (let i = 0; i < n; i++) { const v = v0 + (v1 - v0) * Math.pow(Rn.f(), 0.9); list.push({ u: Rn.f(), v, s: Rn.r(0.7, 1.35), bank: false }); }
  for (let i = 0; i < (o.high ?? 12); i++) list.push({ u: Rn.f(), v: Rn.r(v0, 0.45), s: Rn.r(0.8, 1.3), bank: false });   // big near clouds overhead (low-angle shots)
  for (let i = 0; i < (o.banks ?? 14); i++) list.push({ u: Rn.f(), v: Rn.r(0.86, 0.97), s: Rn.r(1.2, 2.0), bank: true });   // long low banks on the horizon
  list.sort((a, b) => a.v - b.v);
  for (const c of list) {
    const far = c.v, cw = w * (c.bank ? 0.085 : 0.07) * (o.cloudScale ?? 1) * c.s * (1.2 - 0.85 * far), flat = c.bank ? 0.3 : 0.86 - 0.46 * far;   // perspective: smaller + flatter low
    const base = c.v * h, nb = Math.round(c.bank ? Rn.r(9, 14) : Rn.r(6, 10)), bumps = [];
    for (let i = 0; i < nb; i++) { const u = (i + 0.5) / nb, e = 1 - Math.abs(u - 0.5) * 2, r = cw * (c.bank ? 0.07 + 0.05 * e : 0.08 + 0.12 * e) * Rn.r(0.75, 1.25);
      bumps.push([u * cw - cw / 2 + Rn.n(cw * 0.03), -r * Rn.r(0.15, 0.5) - e * cw * (c.bank ? 0.02 : 0.05), r]); }
    if (!c.bank) for (let i = 0; i < Math.round(nb * 0.7); i++) { const u = Rn.r(0.2, 0.8), e = 1 - Math.abs(u - 0.5) * 2, r = cw * Rn.r(0.07, 0.14) * (0.6 + e);
      bumps.push([u * cw - cw / 2, -cw * Rn.r(0.1, 0.24) * (0.5 + e), r]); }
    bumps.sort((a, b) => b[1] - a[1]);
    let top = 0; for (const [, by, r] of bumps) top = Math.min(top, by - r);
    const shape = (x, k = 1) => { x.beginPath(); for (const [bx, by, r] of bumps) { x.moveTo(bx + r * k, by); x.arc(bx, by, r * k, 0, TAU); } x.fill(); };
    // each cloud on its own small canvases (coverage + light), then composited: nearer clouds cover farther ones
    const S = Math.ceil(cw * 2.4), tc = Object.assign(document.createElement('canvas'), { width: S, height: S }), tl = Object.assign(document.createElement('canvas'), { width: S, height: S });
    const qc = tc.getContext('2d'), ql = tl.getContext('2d'), oy = S * 0.62;
    qc.save(); qc.translate(S / 2, oy); qc.scale(1, flat); qc.filter = `blur(${Math.max(1.5, cw * 0.01).toFixed(1)}px)`; qc.fillStyle = '#fff'; shape(qc);
    qc.filter = 'none'; qc.globalCompositeOperation = 'destination-out'; const bf = qc.createLinearGradient(0, -cw * 0.05, 0, cw * 0.06); bf.addColorStop(0, 'rgba(0,0,0,0)'); bf.addColorStop(1, 'rgba(0,0,0,1)'); qc.fillStyle = bf; qc.fillRect(-cw, -cw * 0.05, cw * 2, cw * 0.6); qc.restore();
    ql.save(); ql.translate(S / 2, oy); ql.scale(1, flat);
    const vg = ql.createLinearGradient(0, top, 0, cw * 0.04); vg.addColorStop(0, 'rgb(228,228,228)'); vg.addColorStop(0.5, 'rgb(158,158,158)'); vg.addColorStop(1, 'rgb(56,56,56)');
    // v6 (Ricks lobes): bump by bump, low ones first — each a sphere: the body value at its height, a soft shade rim on the
    // side away from the sun (so every lobe reads against the one behind it), a warm highlight toward the sun
    ql.fillStyle = vg; shape(ql, 1.05);
    for (const [bx, by, r] of bumps) {
      ql.fillStyle = vg; ql.beginPath(); ql.arc(bx, by, r, 0, TAU); ql.fill();
      const rx = bx + sunX * r * 0.22, ry = by - r * 0.26, rg = ql.createRadialGradient(rx, ry, r * 0.55, rx, ry, r * 1.22);
      rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(0.6, 'rgba(0,0,0,0.08)'); rg.addColorStop(1, 'rgba(0,0,0,0.24)'); ql.fillStyle = rg; ql.beginPath(); ql.arc(bx, by, r, 0, TAU); ql.fill();
      const hx = bx + sunX * r * 0.3, hy = by - r * 0.42, g = ql.createRadialGradient(hx, hy, 0, hx, hy, r * 0.95);
      ql.globalCompositeOperation = 'lighter'; g.addColorStop(0, 'rgba(255,255,255,0.36)'); g.addColorStop(0.5, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ql.fillStyle = g; ql.beginPath(); ql.arc(hx, hy, r * 0.95, 0, TAU); ql.fill();
      ql.globalCompositeOperation = 'source-over'; }
    ql.save(); ql.setTransform(1, 0, 0, 1, 0, 0); ql.filter = `blur(${Math.max(1.2, cw * 0.007).toFixed(1)}px)`; ql.drawImage(tl, 0, 0); ql.restore();   // soften (painted, not cut out)
    ql.filter = 'none'; ql.globalCompositeOperation = 'multiply';   // the side away from the sun a little darker
    const sg = ql.createLinearGradient(sunX * cw * 0.5, 0, -sunX * cw * 0.5, 0); sg.addColorStop(0, 'rgb(255,255,255)'); sg.addColorStop(1, 'rgb(200,200,200)'); ql.fillStyle = sg; ql.fillRect(-cw * 1.2, top - 20, cw * 2.4, -top + cw * 0.3);
    ql.restore(); ql.globalCompositeOperation = 'destination-in'; ql.drawImage(tc, 0, 0);
    for (const du of [0, -w, w]) { const X = c.u * w + du; if (X < -S || X > w + S) continue;
      cx.globalCompositeOperation = 'lighten'; cx.drawImage(tc, X - S / 2, base - oy); lx.drawImage(tl, X - S / 2, base - oy); }
  }
  const C = cx.getImageData(0, 0, w, h).data, Lp = lx.getImageData(0, 0, w, h).data, d = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h * 4; i += 4) { d[i] = d[i + 1] = d[i + 2] = Lp[i]; d[i + 3] = C[i]; }
  const t = new THREE.DataTexture(d, w, h, THREE.RGBAFormat); t.wrapS = THREE.RepeatWrapping; t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
}
function c3SkyDome(scene, o = {}) {
  const R = o.r ?? 2400, V = (c, d) => new THREE.Color(c ?? d), zen = V(o.zenith, '#3d7fd6'), hor = V(o.horizon, '#cfe4f6'), gnd = V(o.ground, '#9fb8a0');
  const paint = !!o.paint, mid = V(o.mid, '#' + zen.clone().lerp(hor, 0.55).getHexString());
  const cloudTex = paint ? c3PaintedCloudTex(o) : c3Tex((x, w, h) => { x.clearRect(0, 0, w, h); const Rn = RNG('c3clouds', o.seed ?? 3);
    for (let i = 0; i < (o.clouds ?? 22); i++) { const cx = Rn.f() * w, cy = h * (0.18 + Rn.f() * 0.5), sc = 0.6 + Rn.f() * 1.2;
      for (let k = 0; k < 9; k++) { const px = cx + (Rn.f() - 0.5) * 140 * sc, py = cy + (Rn.f() - 0.5) * 22 * sc, r = (22 + Rn.f() * 34) * sc;
        const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(0.55, 'rgba(250,252,255,0.45)'); g.addColorStop(1, 'rgba(240,246,255,0)');
        x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r * 1.5, r * 0.7, 0, 0, TAU); x.fill();
        x.fillStyle = 'rgba(170,190,215,0.18)'; x.beginPath(); x.ellipse(px, py + r * 0.35, r * 1.3, r * 0.3, 0, 0, TAU); x.fill(); } } }, 2048, 512, false);
  cloudTex.wrapS = THREE.RepeatWrapping;
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zen: { value: zen }, mid: { value: mid }, hor: { value: hor }, gnd: { value: gnd }, cl: { value: cloudTex }, sun: { value: new THREE.Vector3(...(o.sun ?? [0.5, 0.35, 0.6])).normalize() },
      midH: { value: o.midH ?? 0.2 }, glow: { value: V(o.glow, '#fff2dc') }, glowK: { value: o.glowK ?? 0.35 }, paint: { value: paint ? 1 : 0 },
      cLit: { value: V(o.cloudLit, '#fbf8f2') }, cSh: { value: V(o.cloudShade, '#a9a9cf') }, cRep: { value: o.cloudRepeat ?? 1 } },
    vertexShader: 'varying vec3 vP; varying vec2 vUv; void main(){ vP = normalize(position); vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: ['uniform vec3 zen, mid, hor, gnd, sun, glow, cLit, cSh; uniform float midH, glowK, paint, cRep; uniform sampler2D cl; varying vec3 vP; varying vec2 vUv;',
      'void main(){ float h = vP.y;',
      '  vec3 c = h > 0.0 ? (paint > 0.5 ? (h < midH ? mix(hor, mid, smoothstep(0.0, midH, h)) : mix(mid, zen, pow(smoothstep(midH, 0.85, h), 0.8))) : mix(hor, zen, pow(smoothstep(0.0, 0.75, h), 0.7))) : mix(hor, gnd, smoothstep(0.0, 0.08, -h));',
      '  float sd = max(0.0, dot(vP, sun)); vec2 az = normalize(vP.xz + 1e-5), saz = normalize(sun.xz + 1e-5); float side = max(0.0, dot(az, saz));',
      '  if (paint > 0.5) { c = mix(c, glow, glowK * (1.0 - smoothstep(0.0, 0.35, abs(h))) * side * side); c += glow * (pow(sd, 10.0) * 0.25 + pow(sd, 90.0) * 0.5); }',
      '  else c += vec3(1.0, 0.95, 0.85) * (pow(sd, 60.0) * 0.6 + pow(sd, 6.0) * 0.12);',
      '  if (h > 0.0) {',
      '    if (paint > 0.5) { vec2 uv = vec2(vUv.x * cRep, clamp(1.0 - h / 0.8, 0.0, 1.0)); vec4 k = texture2D(cl, uv); float lt = k.r;',
      '      vec3 cc = mix(cSh, cLit, smoothstep(0.25, 0.95, lt)) + glow * side * side * 0.18 * lt; cc = mix(cc, mix(hor, c, 0.4), (1.0 - smoothstep(0.0, 0.3, h)) * 0.5);',
      '      c = mix(c, cc, k.a * smoothstep(0.0, 0.04, h)); }',
      '    else { vec2 uv = vec2(vUv.x * 2.0, 1.0 - clamp(h / 0.55, 0.0, 1.0)); vec4 k = texture2D(cl, uv); float fade = smoothstep(0.0, 0.08, h); c = mix(c, mix(hor, vec3(1.0), 0.75), k.a * fade * 0.9); } }',
      '  gl_FragColor = vec4(c, 1.0); }'].join('\n') }));
  m.userData.noInk2 = m.userData.noCast = m.userData.noShade = true; m.renderOrder = -10; scene.add(m);
  if (o.layer !== undefined) c3Layer(m, o.layer); return m;
}
// ---- cars
const C3X_M = {};
function c3XMat(key, f) { return (C3X_M[key] ||= f()); }
function c3Car(o = {}) {
  const g = new THREE.Group(), col = o.color ?? '#c8402e', kind = o.kind ?? 'sedan';
  const paint = c3XMat('paint' + col, () => c3Prop(col, { rough: 0.22, metal: 0.35, env: 1.6 }));
  const glass = c3XMat('glass', () => c3Prop('#1c2a3a', { rough: 0.05, metal: 0.6, env: 2.2 })), chrome = c3XMat('chrome', () => c3Prop('#d8dce2', { rough: 0.12, metal: 0.95, env: 2 }));
  const tyre = c3XMat('tyre', () => c3Prop('#1a1a1e', { rough: 0.85 })), rim = c3XMat('rim', () => c3Prop('#b8bcc4', { rough: 0.25, metal: 0.9, env: 1.6 })), dark = c3XMat('cdark', () => c3Prop('#22242a', { rough: 0.6 }));
  const head = c3XMat('head', () => c3Prop('#fffbe8', { emissive: '#fff4d0', ei: 0.6, rough: 0.1 })), tail = c3XMat('tail', () => c3Prop('#c8202a', { emissive: '#a01018', ei: 0.4, rough: 0.2 }));
  const L = kind === 'pickup' ? 5.4 : kind === 'hatch' ? 3.9 : kind === 'suv' ? 4.8 : 4.7, Wd = 1.95, bh = kind === 'suv' ? 0.95 : 0.75, y0 = 0.55;
  const add = (mesh, x, y, z) => { mesh.position.set(x, y, z); g.add(mesh); return mesh; };
  add(new THREE.Mesh(c3RBox(L, bh, Wd, 0.32, 4), paint), 0, y0 + bh / 2, 0);   // lower body
  const cabL = kind === 'pickup' ? 2.0 : kind === 'hatch' ? 2.5 : kind === 'suv' ? 3.3 : 2.6, cabX = kind === 'pickup' ? 0.6 : kind === 'hatch' ? -0.3 : kind === 'suv' ? -0.4 : -0.2, cabH = kind === 'suv' ? 0.95 : 0.78;
  const cab = add(new THREE.Mesh(c3RBox(cabL, cabH, Wd * 0.9, 0.3, 4), paint), cabX, y0 + bh + cabH / 2 - 0.05, 0);
  const gl = add(new THREE.Mesh(c3RBox(cabL + 0.06, cabH * 0.66, Wd * 0.92, 0.22, 3), glass), cabX, y0 + bh + cabH * 0.42, 0);   // window band
  if (kind === 'pickup') { add(new THREE.Mesh(c3RBox(2.3, 0.5, Wd * 0.95, 0.08, 2), dark), -1.45, y0 + bh + 0.05, 0); }
  for (const sx of [-1, 1]) { add(new THREE.Mesh(c3RBox(0.22, 0.32, Wd * 0.98, 0.1, 2), chrome), sx * (L / 2 + 0.02), y0 + 0.3, 0);   // bumpers
    for (const sz of [-1, 1]) { const lamp = add(new THREE.Mesh(c3RBox(0.12, 0.2, 0.42, 0.06, 2), sx > 0 ? head : tail), sx * (L / 2 + 0.04), y0 + bh * 0.62, sz * Wd * 0.33); }
    for (const sz of [-1, 1]) { const wx = sx * L * 0.31, wz = sz * Wd * 0.47;
      const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.34, 20), tyre), wx, 0.42, wz); t.rotation.x = Math.PI / 2;
      const r = add(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.36, 12), rim), wx, 0.42, wz + sz * 0.01); r.rotation.x = Math.PI / 2;
      const hub = add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.38, 8), chrome), wx, 0.42, wz); hub.rotation.x = Math.PI / 2; } }
  add(new THREE.Mesh(new THREE.BoxGeometry(L * 0.9, 0.08, Wd * 0.8), dark), 0, y0 - 0.05, 0);   // underbody shadow line
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.15, Wd * 1.3), new THREE.MeshBasicMaterial({ map: c3XMat('carsh', () => c3Tex((x, w, h) => { const r = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(10,10,20,0.55)'); r.addColorStop(1, 'rgba(10,10,20,0)'); x.fillStyle = r; x.save(); x.scale(1, h / w); x.fillRect(0, 0, w, w); x.restore(); }, 128, 64, false)), transparent: true, depthWrite: false, toneMapped: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; shadow.userData.noInk2 = shadow.userData.noCast = true; g.add(shadow);
  g.traverse((m) => { if (m.isMesh && m !== shadow) m.userData.inkOcc = true; });
  if (o.scale) g.scale.setScalar(o.scale); return g;
}
// ---- trees (foliage = clustered spheres with a leafy canvas texture; one material per colour)
function c3LeafTex(col) { return c3XMat('leaf' + col, () => { const t = c3Tex((x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); const R = RNG('leaf', col);
  for (let i = 0; i < 900; i++) { const c = new THREE.Color(col).multiplyScalar(0.6 + R.f() * 0.7); x.fillStyle = '#' + c.getHexString(); x.beginPath(); x.ellipse(R.f() * w, R.f() * h, 3 + R.f() * 5, 2 + R.f() * 3, R.f() * 3, 0, TAU); x.fill(); } }, 256, 256, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t; }); }
function c3LeafTree(s = 1, seed = 1, col = '#4f8a3a') {
  const g = new THREE.Group(), R = RNG('c3lt', seed), bark = c3XMat('bark', () => c3Prop('#6a4a32', { rough: 0.9 })), leaf = c3XMat('leafm' + col, () => c3Prop('#ffffff', { map: c3LeafTex(col), rough: 0.85 }));
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.38 * s, 4 * s, 8), bark); tr.position.y = 2 * s; g.add(tr);
  for (let k = 0; k < 7; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s * R.r(1.4, 2.1), 1), leaf); b.position.set(R.n(1.5 * s), 4.6 * s + R.r(0, 2 * s), R.n(1.5 * s)); b.scale.y = 0.85; g.add(b); }
  g.traverse((m) => { if (m.isMesh) m.userData.inkOcc = true; }); return g;
}
function c3PineTree(s = 1, seed = 1, col = '#2f5a34') {
  const g = new THREE.Group(), R = RNG('c3pt', seed), bark = c3XMat('bark', () => c3Prop('#6a4a32', { rough: 0.9 })), leaf = c3XMat('leafm' + col, () => c3Prop('#ffffff', { map: c3LeafTex(col), rough: 0.85 }));
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.3 * s, 3 * s, 7), bark); tr.position.y = 1.5 * s; g.add(tr);
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(s * (2.6 - k * 0.55), s * 2.6, 9), leaf); c.position.y = s * (3 + k * 1.5); c.rotation.y = R.f() * 3; g.add(c); }
  g.traverse((m) => { if (m.isMesh) m.userData.inkOcc = true; }); return g;
}
// ---- receding layers behind an opening: o = { origin: [x, y, z], dir: [dx, dz] (away from the viewer), width, near, far, rows,
//      horizon colour (fade target), ground colour, cars: n, seed }. Fog-like fade is baked per layer (atmospheric perspective).
function c3Backdrop(scene, o = {}) {
  const g = new THREE.Group(), [ox, oy, oz] = o.origin ?? [0, 0, 0], d = new THREE.Vector2(...(o.dir ?? [0, -1])).normalize(), side = new THREE.Vector2(-d.y, d.x);
  const R = RNG('c3bd', o.seed ?? 1), hor = new THREE.Color(o.horizon ?? '#cfe4f6'), W = o.width ?? 160, near = o.near ?? 20, far = o.far ?? 400;
  const at = (dist, lat, y = 0) => new THREE.Vector3(ox + d.x * dist + side.x * lat, oy + y, oz + d.y * dist + side.y * lat);
  const fade = (col, dist) => '#' + new THREE.Color(col).lerp(hor, Math.min(0.85, (dist - near) / (far - near) * 0.9)).getHexString();
  // ground: asphalt lot near, grass further
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(W * 3, far * 1.2), c3Prop(o.ground ?? '#6f8a4f', { rough: 0.95 })); gr.rotation.x = -Math.PI / 2; gr.rotation.z = Math.atan2(d.x, d.y); gr.position.copy(at(far * 0.6, 0, -0.05)); g.add(gr);
  if (o.lot !== false) { const lot = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.6, near * 2.2), c3Prop('#ffffff', { map: c3XMat('lot', () => { const t = c3Tex((x, w, h) => { x.fillStyle = '#4a4c52'; x.fillRect(0, 0, w, h); const Rr = RNG('lot'); for (let i = 0; i < 2000; i++) { x.fillStyle = `rgba(${Rr.f() < 0.5 ? '255,255,255' : '0,0,0'},0.08)`; x.fillRect(Rr.f() * w, Rr.f() * h, 2, 2); } x.fillStyle = 'rgba(240,240,230,0.8)'; for (let i = 0; i < 8; i++) x.fillRect(i * w / 8, h * 0.1, 4, h * 0.35); }, 512, 256, true); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1); return t; }), rough: 0.9 }));
    lot.rotation.x = -Math.PI / 2; lot.rotation.z = Math.atan2(d.x, d.y); lot.position.copy(at(near * 1.2, 0, 0)); g.add(lot);
    const cols = ['#c8402e', '#2f6fb8', '#e8e4dc', '#2a2a30', '#8a8e96', '#3f8a5a', '#d8a83a'];
    for (let i = 0; i < (o.cars ?? 6); i++) { const c = c3Car({ color: cols[Math.floor(R.f() * cols.length)], kind: ['sedan', 'hatch', 'suv', 'pickup'][Math.floor(R.f() * 4)] }); c.position.copy(at(near * (0.8 + R.f() * 0.9), (R.f() - 0.5) * W * 0.9, 0)); c.rotation.y = Math.atan2(side.x, side.y) + (R.f() < 0.5 ? 0 : Math.PI); g.add(c); } }
  // tree rows + distant buildings + hills, faded with distance
  const rows = o.rows ?? 4;
  for (let r = 0; r < rows; r++) { const dist = near * 2.4 + (far * 0.55 - near * 2.4) * (r / Math.max(1, rows - 1)), sc = 1.6 + r * 0.5;
    for (let i = 0; i < 18; i++) { const lat = (R.f() - 0.5) * W * (1.2 + r * 0.6), t = (R.f() < 0.55 ? c3PineTree : c3LeafTree)(sc * (0.8 + R.f() * 0.5), r * 31 + i, fade(R.f() < 0.5 ? '#2f5a34' : '#4f8a3a', dist));
      t.position.copy(at(dist + R.f() * 12, lat, 0)); g.add(t); }
    if (r === 1) for (let i = 0; i < 7; i++) { const bw = 10 + R.f() * 18, bh = 5 + R.f() * 9, b = new THREE.Mesh(c3RBox(bw, bh, 8, 0.3, 2), c3Prop(fade(['#b8a890', '#8a9aa8', '#c89a7a', '#d8d0c0'][i % 4], dist + 20), { rough: 0.9 }));
      b.position.copy(at(dist + 20, (R.f() - 0.5) * W * 1.6, bh / 2)); b.rotation.y = Math.atan2(d.x, d.y); g.add(b); } }
  for (let i = 0; i < 5; i++) { const h = new THREE.Mesh(new THREE.SphereGeometry(far * 0.25, 24, 10, 0, TAU, 0, Math.PI / 2), c3Prop(fade('#5f7f5a', far * 0.95), { rough: 1 })); h.scale.set(1.6, 0.18 + R.f() * 0.12, 1); h.position.copy(at(far * 0.95, (i - 2) * far * 0.45, -2)); g.add(h); }
  g.traverse((m) => { if (m.isMesh) { m.userData.inkOcc = true; m.userData.noCast = m.userData.noCast || false; } });
  scene.add(g); if (o.layer !== undefined) c3Layer(g, o.layer); return g;
}

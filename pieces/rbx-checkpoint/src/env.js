// rbx-rope ENV: shared set pieces (Roblox-Studio "Future lighting" look): sky dome + PMREM env, sun/moon lights,
// textures (asphalt, grass, lap siding, shingles, cobbles, stone, sand, rock, water), suburban house, trees, poles, lamps, fog wall.
'use strict';
const ENV = {};
(function () {
  const T = THREE, { cnv, tex, rng, fbm, tnoise, normalCanvas, heightOf } = RBX, PI = Math.PI, V = (x, y, z) => new T.Vector3(x, y, z);
  const CACHE = {}, once = (k, f) => CACHE[k] || (CACHE[k] = f());
  const C = (h) => new T.Color(h);
  ENV.shadow = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  // ---------- textures (S px = 1 tile) ----------
  const mk = (S, draw, o = {}) => { const c = cnv(S, S), h = cnv(S, S), g = c.getContext('2d'), hg = h.getContext('2d'); hg.fillStyle = '#808080'; hg.fillRect(0, 0, S, S); draw(g, hg, S);
    const m = new (o.phys ? T.MeshPhysicalMaterial : T.MeshStandardMaterial)({ map: tex(c), roughness: o.rough ?? 0.9, metalness: 0 });
    m.normalMap = tex(normalCanvas(heightOf(h), S, S, o.bump ?? 3), { srgb: false }); m.normalScale.set(o.ns ?? 1, o.ns ?? 1); [m.map, m.normalMap].forEach((t) => { t.wrapS = t.wrapT = T.RepeatWrapping; });
    if (o.tile) ENV.rep(m, o.tile); return m; };
  ENV.rep = (m, tile) => { [m.map, m.normalMap, m.roughnessMap].forEach((t) => { if (t) { t.repeat.set(1 / tile, 1 / tile); t.needsUpdate = true; } }); return m; };
  // clone with own repeat (world-unit UVs: repeat = 1 / tile size)
  ENV.mt = (m, tile) => { const k = m.clone(); ['map', 'normalMap'].forEach((p) => { if (k[p]) { k[p] = k[p].clone(); k[p].repeat.set(1 / tile, 1 / tile); k[p].needsUpdate = true; } }); return k; };
  const noise = (g, S, seed, amt, per = 8) => KIT.noiseOver(g, S, S, seed, amt, per, 4);
  ENV.T = {
    asphalt: () => once('asphalt', () => mk(512, (g, hg, S) => { g.fillStyle = '#4a4c52'; g.fillRect(0, 0, S, S); noise(g, S, 3, 0.4, 16); const r = rng(4); for (let i = 0; i < 6000; i++) { const x = r() * S, y = r() * S, l = r() > 0.5; g.fillStyle = l ? 'rgba(200,200,205,0.25)' : 'rgba(0,0,0,0.3)'; g.fillRect(x, y, 1.6, 1.6); hg.fillStyle = l ? '#b0b0b0' : '#505050'; hg.fillRect(x, y, 2, 2); }
      for (let i = 0; i < 5; i++) { g.strokeStyle = 'rgba(20,20,22,0.5)'; g.lineWidth = 2; g.beginPath(); let x = r() * S, y = r() * S; g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 40; y += r() * 30; g.lineTo(x, y); } g.stroke(); } }, { rough: 0.85, bump: 2 })),
    grass: () => once('grass', () => mk(512, (g, hg, S) => { g.fillStyle = '#5aa83a'; g.fillRect(0, 0, S, S); noise(g, S, 5, 0.45, 8); const r = rng(6); for (let i = 0; i < 16000; i++) { const x = r() * S, y = r() * S, l = 0.6 + r() * 0.7; g.strokeStyle = `rgba(${60 * l},${150 * l},${40 * l},0.55)`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 4 - r() * 5); g.stroke(); hg.fillStyle = `rgba(255,255,255,${0.2 * r()})`; hg.fillRect(x, y - 4, 1.4, 4); } }, { rough: 0.95, bump: 2.5 })),
    siding: (c) => once('siding' + c, () => mk(256, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); const n = 8, q = S / n; for (let i = 0; i < n; i++) { const gr = g.createLinearGradient(0, i * q, 0, (i + 1) * q); gr.addColorStop(0, 'rgba(255,255,255,0.14)'); gr.addColorStop(0.85, 'rgba(0,0,0,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0.35)'); g.fillStyle = gr; g.fillRect(0, i * q, S, q);
      const hgg = hg.createLinearGradient(0, i * q, 0, (i + 1) * q); hgg.addColorStop(0, '#d0d0d0'); hgg.addColorStop(1, '#303030'); hg.fillStyle = hgg; hg.fillRect(0, i * q, S, q); } noise(g, S, 7, 0.12, 8); }, { rough: 0.7, bump: 3 })),
    shingle: (c) => once('shingle' + c, () => mk(256, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); const r = rng(9), rows = 8, q = S / rows; for (let y = 0; y < rows; y++) for (let x = -1; x < 6; x++) { const w = S / 5, k = 0.75 + r() * 0.45, cc = C(c).multiplyScalar(k); g.fillStyle = '#' + cc.getHexString(); g.fillRect(x * w + (y % 2) * w / 2 + 1, y * q + 1, w - 2, q - 2); hg.fillStyle = '#c0c0c0'; hg.fillRect(x * w + (y % 2) * w / 2 + 1, y * q + 1, w - 2, q - 4); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x * w + (y % 2) * w / 2, (y + 1) * q - 3, w, 3); } noise(g, S, 11, 0.2, 8); }, { rough: 0.85, bump: 3 })),
    cobble: () => once('cobble', () => mk(512, (g, hg, S) => { g.fillStyle = '#3a3634'; g.fillRect(0, 0, S, S); hg.fillStyle = '#101010'; hg.fillRect(0, 0, S, S); const r = rng(13), n = 10, q = S / n;
      for (let y = 0; y < n; y++) for (let x = -1; x <= n; x++) { const cx = (x + (y % 2) * 0.5 + 0.5) * q + (r() - 0.5) * 6, cy = (y + 0.5) * q + (r() - 0.5) * 6, k = 0.6 + r() * 0.5; g.fillStyle = `rgb(${120 * k},${112 * k},${104 * k})`; g.beginPath(); g.ellipse(cx, cy, q * 0.44, q * 0.4, r(), 0, 7); g.fill();
        const gr = hg.createRadialGradient(cx, cy, 2, cx, cy, q * 0.45); gr.addColorStop(0, '#f0f0f0'); gr.addColorStop(1, '#303030'); hg.fillStyle = gr; hg.beginPath(); hg.ellipse(cx, cy, q * 0.44, q * 0.4, 0, 0, 7); hg.fill(); } noise(g, S, 14, 0.3, 16); }, { rough: 0.8, bump: 5 })),
    stone: () => once('stone', () => { const t = KIT.bricks(512, 15, { rows: 7, cols: 4, color: '#8a8278', mortar: '#4a4640' }); const m = new T.MeshStandardMaterial({ map: tex(t.c), roughness: 0.9 }); m.normalMap = tex(normalCanvas(heightOf(t.h), 512, 512, 5), { srgb: false }); [m.map, m.normalMap].forEach((x) => { x.wrapS = x.wrapT = T.RepeatWrapping; }); return m; }),
    sand: () => once('sand', () => mk(512, (g, hg, S) => { g.fillStyle = '#d8c08c'; g.fillRect(0, 0, S, S); noise(g, S, 17, 0.25, 8); const r = rng(18); for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,245,210,0.35)' : 'rgba(120,90,50,0.25)'; g.fillRect(r() * S, r() * S, 1.5, 1.5); } for (let y = 0; y < S; y += 18) { hg.fillStyle = 'rgba(255,255,255,0.15)'; hg.fillRect(0, y, S, 6); } }, { rough: 1, bump: 2 })),
    rock: (c = '#7a7268') => once('rock' + c, () => mk(512, (g, hg, S) => { g.fillStyle = c; g.fillRect(0, 0, S, S); const n = fbm(19, 4, 5), im = g.getImageData(0, 0, S, S), hm = hg.getImageData(0, 0, S, S);
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = n(x / S, y / S), cr = Math.abs(Math.sin(v * 22)), i = (y * S + x) * 4, k = 0.62 + 0.55 * v; im.data[i] *= k; im.data[i + 1] *= k; im.data[i + 2] *= k; hm.data[i] = hm.data[i + 1] = hm.data[i + 2] = 255 * (0.5 * v + 0.5 * cr * v); }
      g.putImageData(im, 0, 0); hg.putImageData(hm, 0, 0); }, { rough: 0.95, bump: 6 })),
    wood: (c = '#7a5232') => once('wood' + c, () => { const t = KIT.woodPlanks(512, 21, { rows: 4, tones: [c, '#6a4428', '#83593a', '#5e3c22'], knots: 6 }); const m = new T.MeshStandardMaterial({ map: tex(t.c), roughness: 0.85 }); m.normalMap = tex(normalCanvas(heightOf(t.h), 512, 512, 3), { srgb: false }); [m.map, m.normalMap].forEach((x) => { x.wrapS = x.wrapT = T.RepeatWrapping; }); return m; }),
    dirt: () => once('dirt', () => mk(512, (g, hg, S) => { g.fillStyle = '#6a5440'; g.fillRect(0, 0, S, S); noise(g, S, 23, 0.5, 8); const r = rng(24); for (let i = 0; i < 3000; i++) { const x = r() * S, y = r() * S, s = 1 + r() * 4; g.fillStyle = `rgba(${90 + r() * 60},${80 + r() * 40},${60 + r() * 30},0.6)`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); hg.fillStyle = '#d0d0d0'; hg.beginPath(); hg.arc(x, y, s, 0, 7); hg.fill(); } }, { rough: 1, bump: 3 })),
  };
  ENV.waterNormal = () => once('wn', () => { const S = 512, n1 = fbm(31, 6, 4), n2 = tnoise(33, 24), H = new Float32Array(S * S); for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) H[y * S + x] = 0.6 * n1(x / S, y / S) + 0.4 * n2(x / S, y / S); const t = tex(normalCanvas(H, S, S, 6), { srgb: false }); t.wrapS = t.wrapT = T.RepeatWrapping; return t; });

  // ---------- sky dome (gradient + sun/moon glow), also baked to a PMREM environment ----------
  ENV.sky = function (scene, renderer, o = {}) {
    const mat = new T.ShaderMaterial({ side: T.BackSide, depthWrite: false, fog: false, toneMapped: false,
      uniforms: { top: { value: C(o.top || '#2f7fe0') }, mid: { value: C(o.mid || '#8cc4f4') }, hor: { value: C(o.hor || '#d6ecff') }, sunDir: { value: V(...(o.sun || [0.3, 0.5, -0.8])).normalize() }, sunC: { value: C(o.sunC || '#fff4dc') }, sunK: { value: o.sunK ?? 1.0 }, sunS: { value: o.sunS ?? 0.9994 }, glow: { value: o.glow ?? 0.35 }, gain: { value: o.gain ?? 1.0 } },
      vertexShader: 'varying vec3 vd; void main(){ vd = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
      fragmentShader: `uniform vec3 top, mid, hor, sunDir, sunC; uniform float sunK, sunS, glow, gain; varying vec3 vd;
        void main(){ float h = vd.y; vec3 c = h > 0.0 ? mix(mix(hor, mid, smoothstep(0.0, 0.18, h)), top, smoothstep(0.15, 0.75, h)) : mix(hor, hor * 0.7, smoothstep(0.0, -0.3, h));
          float d = dot(normalize(vd), sunDir); c += sunC * (glow * pow(max(d, 0.), 18.) + 0.25 * glow * pow(max(d, 0.), 3.)); c += sunC * sunK * 6. * smoothstep(sunS, sunS + 0.0003, d);
          gl_FragColor = vec4(c * gain, 1.); }` });
    const dome = new T.Mesh(new T.SphereGeometry(o.r || 2500, 48, 24), mat); dome.renderOrder = -10; scene.add(dome);
    if (renderer && o.env !== false) { const sc = new T.Scene(); const d2 = new T.Mesh(new T.SphereGeometry(10, 48, 24), mat); sc.add(d2); const pm = new T.PMREMGenerator(renderer); scene.environment = pm.fromScene(sc, 0.02).texture; pm.dispose(); }
    return dome;
  };
  // soft clouds: billboard-ish puffs of icosahedrons
  ENV.clouds = function (scene, n, o = {}) { const r = rng(o.seed || 41), m = new T.MeshStandardMaterial({ color: o.c || '#ffffff', roughness: 1, emissive: C(o.e || '#c8d8f0'), emissiveIntensity: o.ei ?? 0.5, fog: o.fog ?? false }), g = new T.Group();
    for (let i = 0; i < n; i++) { const c = new T.Group(), k = 3 + Math.floor(r() * 4); for (let j = 0; j < k; j++) { const s = new T.Mesh(new T.IcosahedronGeometry(1, 2), m); s.scale.set(1 + r(), 0.6 + r() * 0.4, 1 + r()).multiplyScalar(o.s || 18); s.position.set((j - k / 2) * (o.s || 18) * 1.1, r() * 6, r() * 8); c.add(s); }
      const a = (o.a0 ?? -2.2) + r() * (o.a1 ?? 1.2), d = (o.d || 700) + r() * 400; c.position.set(Math.sin(a) * d, (o.y || 160) + r() * 120, Math.cos(a) * d); g.add(c); }
    scene.add(g); return g; };

  // ---------- suburban house (Bloxburg): lap siding, gable shingle roof, windows, door, garage, porch light ----------
  ENV.house = function (o = {}) {
    const g = new T.Group(), r = rng(o.seed || 1), w = o.w || 12, d = o.d || 10, h = o.h || (r() > 0.5 ? 7 : 10), c = o.c || ['#e8e0cc', '#9ec4d8', '#e8c890', '#c8d8b0', '#f0d0c0', '#b8b8c8', '#f2ead8'][Math.floor(r() * 7)];
    const sid = ENV.mt(ENV.T.siding(c), 2.2), trim = new T.MeshStandardMaterial({ color: '#f6f4ee', roughness: 0.6 }), roofC = o.roof || ['#3a3e4a', '#5a3a2e', '#2e3a4e', '#4a4a4a'][Math.floor(r() * 4)];
    const BX = (W, H, D, m, x, y, z, uv = true) => { const geo = new T.BoxGeometry(W, H, D); if (uv) KIT.uvBox(geo, W, H, D); const me = new T.Mesh(geo, m); me.position.set(x, y, z); g.add(me); return me; };
    BX(w, h, d, sid, 0, h / 2, 0); BX(w + 0.3, 0.5, d + 0.3, trim, 0, 0.25, 0, false);
    // gable roof along x
    const rh = 3.6, sl = Math.hypot(d / 2 + 0.8, rh), ang = Math.atan2(rh, d / 2 + 0.8), rm = ENV.mt(ENV.T.shingle(roofC), 2.5);
    [-1, 1].forEach((s) => { const p = BX(w + 1.2, 0.35, sl, rm, 0, h + rh / 2, s * (d / 4 + 0.4)); p.rotation.x = s * ang; });
    const gab = new T.Shape(); gab.moveTo(-d / 2, 0); gab.lineTo(d / 2, 0); gab.lineTo(0, rh); gab.closePath(); const gg = new T.ExtrudeGeometry(gab, { depth: w - 0.02, bevelEnabled: false }); gg.translate(0, 0, -(w - 0.02) / 2); gg.rotateY(PI / 2);
    const gm = new T.Mesh(gg, ENV.mt(ENV.T.siding(c), 2.2)); gm.position.y = h; g.add(gm);
    BX(1.4, 3, 1.4, ENV.mt(ENV.T.stone(), 2), w * 0.3, h + 2.4, -d * 0.15);
    // windows on the front (+z)
    const glass = new T.MeshPhysicalMaterial({ color: '#1b2a3a', roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: C(o.lit ? '#ffb45a' : '#000000'), emissiveIntensity: o.lit ? 2.2 : 0 });
    const win = (x, y, ww = 2.2, wh = 2.4) => { BX(ww + 0.4, wh + 0.4, 0.2, trim, x, y, d / 2 + 0.05, false); BX(ww, wh, 0.22, glass, x, y, d / 2 + 0.06, false); BX(0.12, wh, 0.26, trim, x, y, d / 2 + 0.08, false); BX(ww, 0.12, 0.26, trim, x, y, d / 2 + 0.08, false); BX(ww + 0.8, 0.25, 0.5, trim, x, y - wh / 2 - 0.3, d / 2 + 0.2, false); };
    const garage = r() > 0.45 && !o.noGarage;
    if (garage) { BX(4.6, 3.6, 0.2, new T.MeshStandardMaterial({ color: '#f2f0ea', roughness: 0.5 }), -w * 0.25, 1.8, d / 2 + 0.06, false); for (let k = 1; k < 4; k++) BX(4.6, 0.06, 0.24, new T.MeshStandardMaterial({ color: '#c8c4bc' }), -w * 0.25, k * 0.9, d / 2 + 0.08, false); win(w * 0.3, 2.6); }
    else { win(-w * 0.3, 2.6); win(w * 0.3, 2.6); }
    BX(1.6, 3.0, 0.2, new T.MeshStandardMaterial({ color: o.door || ['#8a2a2a', '#2a4a7a', '#3a5a3a', '#5a3a2a'][Math.floor(r() * 4)], roughness: 0.5 }), garage ? w * 0.02 : 0, 1.5, d / 2 + 0.07, false);
    if (h > 8) { win(-w * 0.28, 7.2, 2, 2); win(w * 0.28, 7.2, 2, 2); }
    if (o.lit) { const L = new T.PointLight('#ffb060', 6, 14, 2); L.position.set(0, 3.4, d / 2 + 1); g.add(L); }
    return ENV.shadow(g);
  };
  // trees
  ENV.tree = function (o = {}) { const g = new T.Group(), r = rng(o.seed || 3), lm = new T.MeshStandardMaterial({ color: o.c || ['#3e8a32', '#4a9a3a', '#357a2e'][Math.floor(r() * 3)], roughness: 0.9, flatShading: true });
    const tr = new T.Mesh(new T.CylinderGeometry(0.35, 0.5, 4, 8), ENV.mt(ENV.T.wood('#5a3e28'), 2)); tr.position.y = 2; g.add(tr);
    for (let i = 0; i < 4; i++) { const b = new T.Mesh(new T.IcosahedronGeometry(2.2 + r() * 1.2, 1), lm); b.position.set((r() - 0.5) * 3, 5 + r() * 2.5, (r() - 0.5) * 3); g.add(b); } g.scale.setScalar(o.s || 1); return ENV.shadow(g); };
  ENV.pine = function (o = {}) { const g = new T.Group(), lm = new T.MeshStandardMaterial({ color: o.c || '#2e6a3a', roughness: 0.9, flatShading: true });
    const tr = new T.Mesh(new T.CylinderGeometry(0.3, 0.45, 3, 7), ENV.mt(ENV.T.wood('#4a3220'), 2)); tr.position.y = 1.5; g.add(tr);
    [[3.4, 4.2, 3.4], [2.7, 3.6, 5.6], [1.9, 3.0, 7.6]].forEach(([r, h, y]) => { const c = new T.Mesh(new T.ConeGeometry(r, h, 8), lm); c.position.y = y; g.add(c); }); g.scale.setScalar(o.s || 1); return ENV.shadow(g); };
  // utility pole with crossarm (wires added by the set)
  ENV.pole = function () { const g = new T.Group(), w = ENV.mt(ENV.T.wood('#5a4434'), 2); const p = new T.Mesh(new T.CylinderGeometry(0.22, 0.3, 14, 8), w); p.position.y = 7; g.add(p); const a = new T.Mesh(new T.BoxGeometry(4, 0.3, 0.3), w); a.position.y = 12.8; g.add(a);
    [-1.6, 0, 1.6].forEach((x) => { const i = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 0.35, 8), new T.MeshStandardMaterial({ color: '#7ab0a0', roughness: 0.2 })); i.position.set(x, 13.1, 0); g.add(i); }); return ENV.shadow(g); };
  ENV.wire = (a, b, sag = 0.8) => { const m = a.clone().lerp(b, 0.5); m.y -= sag; return new T.Mesh(new T.TubeGeometry(new T.QuadraticBezierCurve3(a, m, b), 24, 0.03, 4), new T.MeshBasicMaterial({ color: '#1a1a1a' })); };
  // lantern post with a warm point light
  ENV.lantern = function (o = {}) { const g = new T.Group(), iron = new T.MeshStandardMaterial({ color: '#1e1e22', roughness: 0.5, metalness: 0.6 });
    const p = new T.Mesh(new T.CylinderGeometry(0.12, 0.16, 5, 8), iron); p.position.y = 2.5; g.add(p); const box = new T.Mesh(new T.CylinderGeometry(0.42, 0.3, 0.9, 6), new T.MeshStandardMaterial({ color: '#ffcc80', emissive: C('#ffa040'), emissiveIntensity: 6, roughness: 0.4 })); box.position.y = 5.3; g.add(box);
    const cap = new T.Mesh(new T.ConeGeometry(0.6, 0.5, 6), iron); cap.position.y = 6; g.add(cap); if (o.light !== false) { const L = new T.PointLight('#ffa858', o.k ?? 18, o.dist ?? 22, 2); L.position.y = 5.3; g.add(L); } return g; };
  // fog wall: stacked soft noise sheets (+ low wisps); lit lavender, slightly self-luminous so it "hums"
  ENV.fogTex = () => once('fogTex', () => { const S = 512, c = cnv(S, S), g = c.getContext('2d'), n = fbm(51, 4, 5), im = g.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = n(x / S, y / S), i = (y * S + x) * 4, edge = Math.min(1, x / (S * 0.15), (S - x) / (S * 0.15)), vert = Math.min(1, (S - y) / (S * 0.2)) * Math.min(1, y / (S * 0.35)); im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = 255 * Math.max(0, Math.min(1, (v - 0.25) * 2.2)) * edge * vert; }
    g.putImageData(im, 0, 0); const t = tex(c); t.wrapS = T.RepeatWrapping; return t; });
  ENV.fogWall = function (o = {}) { const g = new T.Group(), n = o.n || 16, w = o.w || 400, h = o.h || 90, r = rng(o.seed || 61);
    for (let i = 0; i < n; i++) { const m = new T.MeshBasicMaterial({ map: ENV.fogTex(), color: C(o.c || '#c9c4e8').multiplyScalar(o.k ?? 1), transparent: true, opacity: o.op ?? 0.55, depthWrite: false, fog: o.fog ?? false, side: T.DoubleSide });
      m.map = m.map.clone(); m.map.offset.set(r(), 0); m.map.needsUpdate = true; const p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.set((r() - 0.5) * 30, h / 2 - 4 - r() * 6, -i * (o.gap || 3)); p.renderOrder = 5 + i; g.add(p); }
    return g; };
})();

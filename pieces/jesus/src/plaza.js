
// =====================================================================
//  PLAZA — a café terrace on an old town plaza at sunset. You sit at a marble bistro table (eye 0, 1.2, 0.75) facing
//  -z; your friend sits across. In front: the plaza (cobbles, a stone fountain, plane trees, iron lamps, a tram line),
//  closed by colonial facades and the town hall's clock tower; on the right another row of facades; on the left a
//  balustrade over the valley, a far city and hills, where the sun sets. Behind you: the café with its awning.
// =====================================================================
const PZ = { BAL: -26, FRONT: -46, RIGHT: 30, CAFE: 5 };
const EYE = [0, 1.2, 0.78];
// lit windows for far towers (warm, random)
function winLit(col, seed) { const m = STDm({ color: col, roughness: 0.6, metalness: 0.15 }), U = { uLit: { value: 1 } }; m.userData.U = U;
  m.onBeforeCompile = (sh) => { sh.uniforms.uLit = U.uLit; sh.vertexShader = 'varying vec3 vWp; varying vec3 vWn;\n' + sh.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n { mat4 IM4 = modelMatrix;\n#ifdef USE_INSTANCING\n IM4 = modelMatrix * instanceMatrix;\n#endif\n vWp = (IM4 * vec4(transformed, 1.0)).xyz; vWn = normalize(mat3(IM4) * objectNormal); }');
    sh.fragmentShader = 'uniform float uLit; varying vec3 vWp; varying vec3 vWn;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
      float win = 0.0, lit = 0.0; if (abs(vWn.y) < 0.5) { float u = abs(vWn.x) > 0.5 ? vWp.z : vWp.x; vec2 c = vec2(floor(u / 3.0), floor(vWp.y / 3.4)); float h = fract(sin(dot(c + ${seed.toFixed(1)}, vec2(12.9898, 78.233))) * 43758.5453);
        float wx = fract(u / 3.0), wy = fract(vWp.y / 3.4); win = step(0.16, wx) * step(wx, 0.84) * step(0.2, wy) * step(wy, 0.86); lit = win * step(0.5, h);
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.15, 0.2) + 0.1 * h, win * 0.85); }`).replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      totalEmissiveRadiance += vec3(1.0, 0.78, 0.48) * lit * uLit * 1.6;`); }; return m; }
function cobbleTex() { return wrap(g3Tex((x, w) => { const R = RNG('cobble'); x.fillStyle = '#7a6e62'; x.fillRect(0, 0, w, w); const n = 16, s = w / n;
  for (let j = 0; j < n; j++) for (let i = 0; i < n + 1; i++) { const cx = (i + (j % 2) * 0.5) * s, cy = (j + 0.5) * s, l = R.r(-14, 14); x.fillStyle = `rgb(${150 + l + R.r(-10, 10)},${138 + l},${124 + l - R.r(0, 10)})`;
    x.beginPath(); x.ellipse(cx + R.n(2), cy + R.n(2), s * R.r(0.46, 0.52), s * R.r(0.44, 0.5), R.r(-0.2, 0.2), 0, TAU); x.fill(); x.fillStyle = 'rgba(255,255,255,0.05)'; x.beginPath(); x.ellipse(cx - s * 0.1, cy - s * 0.1, s * 0.22, s * 0.16, 0, 0, TAU); x.fill(); }
  for (let k = 0; k < 40; k++) blot(x, R.r(0, w), R.r(0, w), R.r(20, 70), R.pick(['rgba(40,30,20,0.12)', 'rgba(255,240,220,0.06)'])); }, 512, 512), 1, 1); }
// a facade: plaster with stains, string courses, an arcade or shopfronts below, windows with stone surrounds and shutters,
// balconies on the first floor; map + emissive (lit windows and shops) from the same layout
function facadeTex(seed, wall, floors, bays, gH, fH, w, o = {}) { const ppm = 36, Wp = Math.round(w * ppm), Hp = Math.round((gH + floors * fH + 0.9) * ppm), bw = Wp / bays, Y = (m) => Hp - m * ppm;
  const draw = (x, em) => { const R = RNG('fac' + seed), Rn = RNG('facn' + seed); if (em) { x.fillStyle = '#000'; x.fillRect(0, 0, Wp, Hp); } else { x.fillStyle = wall; x.fillRect(0, 0, Wp, Hp);
      for (let k = 0; k < 60; k++) blot(x, Rn.r(0, Wp), Rn.r(0, Hp), Rn.r(10, 60), Rn.pick(['rgba(255,255,255,0.07)', 'rgba(60,40,20,0.08)', 'rgba(120,90,60,0.06)']));
      for (let k = 0; k < 30; k++) { const sx = Rn.r(0, Wp), g = x.createLinearGradient(0, Hp - 60, 0, Hp); g.addColorStop(0, 'rgba(40,30,20,0)'); g.addColorStop(1, 'rgba(40,30,20,0.22)'); x.fillStyle = g; x.fillRect(sx, Hp - Rn.r(30, 90), Rn.r(6, 30), 90); } }
    const shut = R.pick(['#3f6a52', '#5a7a8a', '#6a4a32', '#2f5a6a', '#7a3a2a']), stone = 'rgba(240,228,206,0.9)';
    // ground floor
    for (let b = 0; b < bays; b++) { const x0 = b * bw, cx = x0 + bw / 2; const glow = R.f() < 0.8;
      if (o.arcade) { const aw = bw * 0.72, top = Y(gH * 0.82), bot = Y(0); if (em) { if (glow) { const g = x.createLinearGradient(0, top, 0, bot); g.addColorStop(0, 'rgba(255,170,90,0.25)'); g.addColorStop(1, 'rgba(255,190,110,0.85)'); x.fillStyle = g; x.fillRect(cx - aw / 2 + 6, top + 10, aw - 12, bot - top - 10); } }
        else { x.fillStyle = '#2a2018'; x.beginPath(); x.moveTo(cx - aw / 2, bot); x.lineTo(cx - aw / 2, top + aw / 2); x.arc(cx, top + aw / 2, aw / 2, Math.PI, 0); x.lineTo(cx + aw / 2, bot); x.fill(); x.strokeStyle = stone; x.lineWidth = 5; x.beginPath(); x.arc(cx, top + aw / 2, aw / 2 + 3, Math.PI, 0); x.stroke(); } }
      else { const sw = bw * 0.7, top = Y(gH * 0.78), bot = Y(0.15); if (em) { if (glow) { x.fillStyle = 'rgba(255,196,120,0.9)'; x.fillRect(cx - sw / 2 + 4, top + 4, sw - 8, bot - top - 8); } }
        else { x.fillStyle = '#3a2a1e'; x.fillRect(cx - sw / 2 - 4, top - 4, sw + 8, bot - top + 8); x.fillStyle = '#1e2228'; x.fillRect(cx - sw / 2 + 4, top + 4, sw - 8, bot - top - 8); x.fillStyle = 'rgba(255,255,255,0.12)'; x.fillRect(cx - sw / 2 + 4, top + 4, sw - 8, (bot - top) * 0.3);
          const ac = R.pick(['#a83a2e', '#2e5aa8', '#2e7a4e', '#c8a040']); for (let s = 0; s < 8; s++) { x.fillStyle = s % 2 ? ac : '#f2ece0'; x.fillRect(cx - sw / 2 - 6 + s * (sw + 12) / 8, top - 26, (sw + 12) / 8, 18); } } } }
    if (!em) { x.fillStyle = 'rgba(255,245,225,0.55)'; x.fillRect(0, Y(gH) - 5, Wp, 8); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, Y(gH) + 3, Wp, 4); }
    // upper floors
    for (let f = 0; f < floors; f++) { const y0 = gH + f * fH; if (!em && f) { x.fillStyle = 'rgba(255,245,225,0.4)'; x.fillRect(0, Y(y0) - 3, Wp, 5); x.fillStyle = 'rgba(0,0,0,0.16)'; x.fillRect(0, Y(y0) + 2, Wp, 3); }
      for (let b = 0; b < bays; b++) { const cx = (b + 0.5) * bw, ww = bw * 0.4, wt = Y(y0 + fH * 0.88), wb = Y(y0 + fH * 0.16), open = R.f() < 0.55, lit = R.f() < (o.lit ?? 0.35), sc = R.f() < 0.25 ? R.pick(['#3f6a52', '#5a7a8a', '#6a4a32']) : shut;
        if (em) { if (lit && open) { x.fillStyle = `rgba(255,${R.r(170, 205) | 0},110,0.95)`; x.fillRect(cx - ww / 2 + 3, wt + 3, ww - 6, wb - wt - 6); } continue; }
        x.fillStyle = stone; x.fillRect(cx - ww / 2 - 7, wt - 7, ww + 14, wb - wt + 12); if (f === 0) { x.beginPath(); x.moveTo(cx - ww / 2 - 10, wt - 8); x.lineTo(cx, wt - 30); x.lineTo(cx + ww / 2 + 10, wt - 8); x.fill(); }
        const g = x.createLinearGradient(0, wt, 0, wb); g.addColorStop(0, '#6a7890'); g.addColorStop(1, '#1c2230'); x.fillStyle = g; x.fillRect(cx - ww / 2, wt, ww, wb - wt); x.fillStyle = 'rgba(240,240,255,0.5)'; x.fillRect(cx - 1.5, wt, 3, wb - wt); x.fillRect(cx - ww / 2, wt + (wb - wt) * 0.38, ww, 3);
        const slats = (sx, sw2) => { x.fillStyle = sc; x.fillRect(sx, wt, sw2, wb - wt); x.fillStyle = 'rgba(0,0,0,0.22)'; for (let yy = wt + 4; yy < wb; yy += 6) x.fillRect(sx + 2, yy, sw2 - 4, 2); };
        if (open) { slats(cx - ww / 2 - ww / 2 - 6, ww / 2); slats(cx + ww / 2 + 6, ww / 2); } else if (R.f() < 0.5) slats(cx - ww / 2, ww); else { slats(cx - ww / 2, ww / 2 - 1); slats(cx + 1, ww / 2 - 1); }
        if (f === 0 || (o.balc && R.f() < 0.4)) { x.fillStyle = 'rgba(30,26,24,0.9)'; const by = wb - (wb - wt) * 0.3; x.fillRect(cx - ww / 2 - 14, by, ww + 28, 3); for (let bx = cx - ww / 2 - 14; bx <= cx + ww / 2 + 14; bx += 6) x.fillRect(bx, by, 2, wb - by + 6); x.fillStyle = stone; x.fillRect(cx - ww / 2 - 18, wb + 4, ww + 36, 6); } } }
    if (!em) { const ty = Y(gH + floors * fH); x.fillStyle = 'rgba(255,245,225,0.6)'; x.fillRect(0, ty - 6, Wp, 10); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, ty + 4, Wp, 5); } };
  const mk = (em) => { const c = document.createElement('canvas'); c.width = Wp; c.height = Hp; draw(c.getContext('2d'), em); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t; };
  return { map: mk(false), em: mk(true), h: gH + floors * fH + 0.9 }; }
// a building (front = local +z): box with the facade on the front, cornice, first-floor balcony slabs, a tiled roof
function building(st, x, z, w, d, ry, seed, wall, floors, bays, o = {}) { const gH = o.gH || 4.4, fH = o.fH || 3.4, F = facadeTex(seed, wall, floors, bays, gH, fH, w, o), h = F.h, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; st.scene.add(g);
  const side = STDm({ color: wall, roughness: 0.9 }), front = STDm({ map: F.map, emissiveMap: F.em, emissive: '#ffffff', emissiveIntensity: 1.0, roughness: 0.85 }); front.userData.lit = true;
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), [side, side, side, side, front, side]); b.castShadow = b.receiveShadow = true; g.add(b);
  const lt = C3(wall, '#fff4e4', 0.4); g.add(mesh(new THREE.BoxGeometry(w + 0.5, 0.45, d + 0.5), STDm({ color: lt, roughness: 0.8 }), 0, h + 0.1, 0));
  for (let k = 0; k < bays; k++) g.add(mesh(new THREE.BoxGeometry(w / bays * 0.62, 0.12, 0.6), STDm({ color: lt }), -w / 2 + (k + 0.5) * w / bays, gH + 0.08, d / 2 + 0.3));
  if (o.roof !== false) { const rg = new THREE.CylinderGeometry(0.01, d * 0.62, 2.6, 4, 1).rotateY(Math.PI / 4).scale(w / d * 1.0, 1, 1); const r = mesh(rg, STDm({ color: '#a8583a', roughness: 0.9 }), 0, h + 1.6, 0); r.scale.set(1, 1, 0.72); g.add(r); }
  g.userData.front = front; return g; }
function clockTex() { return g3Tex((x, w) => { x.fillStyle = '#f4ecd8'; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 2, 0, TAU); x.fill(); x.strokeStyle = '#2a2420'; x.lineWidth = 10; x.stroke(); x.fillStyle = '#2a2420'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 34px Georgia, serif';
  ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((s, i) => { const a = i / 12 * TAU - Math.PI / 2; x.fillText(s, w / 2 + Math.cos(a) * w * 0.38, w / 2 + Math.sin(a) * w * 0.38); });
  const hand = (a, L, lw) => { x.lineWidth = lw; x.beginPath(); x.moveTo(w / 2, w / 2); x.lineTo(w / 2 + Math.cos(a) * L, w / 2 + Math.sin(a) * L); x.stroke(); }; hand((7 + 51 / 60) / 12 * TAU - Math.PI / 2, w * 0.22, 12); hand(51 / 60 * TAU - Math.PI / 2, w * 0.33, 7); }, 256, 256); }
const IRON = () => STDm({ color: '#1e1c1c', roughness: 0.5, metalness: 0.6 });
function bistroChair(par, x, z, ry, col = '#8a5a32') { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; par.add(c); const ir = IRON(), wd = STDm({ color: col, roughness: 0.7 });
  c.add(mesh(new THREE.CylinderGeometry(0.21, 0.2, 0.04, 20), wd, 0, 0.46, 0)); [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([a, b]) => { const l = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.47, 6).translate(0, 0.235, 0), ir, a, 0, b); l.rotation.set(b * 0.5, 0, -a * 0.5); c.add(l); });
  c.add(mesh(new THREE.TorusGeometry(0.17, 0.008, 6, 20).rotateX(Math.PI / 2), ir, 0, 0.18, 0)); const back = mesh(new THREE.TorusGeometry(0.2, 0.016, 8, 24, Math.PI), wd, 0, 0.62, -0.19); back.scale.set(1, 0.9, 1); c.add(back);
  [-0.2, 0.2].forEach((a) => c.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 6), wd, a, 0.55, -0.19))); for (let k = -2; k <= 2; k++) c.add(mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.2, 5), wd, k * 0.07, 0.6, -0.19)); return c; }
function bistroTable(par, x, z, props = true) { const g = new THREE.Group(); g.position.set(x, 0, z); par.add(g); const ir = IRON(), mar = STDm({ map: MARBLE || (MARBLE = g3Tex((c, w) => { const R = RNG('marble'); c.fillStyle = '#f2efe8'; c.fillRect(0, 0, w, w); for (let k = 0; k < 18; k++) { c.strokeStyle = `rgba(120,120,130,${R.r(0.08, 0.3)})`; c.lineWidth = R.r(0.5, 2.5); c.beginPath(); let px = R.r(0, w), py = R.r(0, w); c.moveTo(px, py); for (let j = 0; j < 12; j++) { px += R.r(-30, 30); py += R.r(-10, 30); c.lineTo(px, py); } c.stroke(); } }, 512, 512)), roughness: 0.25 });
  g.add(mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.03, 40), mar, 0, 0.745, 0)); g.add(mesh(new THREE.TorusGeometry(0.38, 0.012, 8, 40).rotateX(Math.PI / 2), STDm({ color: '#b89a6a', metalness: 0.8, roughness: 0.3 }), 0, 0.745, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.72, 10).translate(0, 0.37, 0), ir)); g.add(mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.12, 12), ir, 0, 0.66, 0));
  for (let k = 0; k < 3; k++) { const f = mesh(new THREE.BoxGeometry(0.42, 0.03, 0.05).translate(0.2, 0, 0), ir, 0, 0.03, 0); f.rotation.y = k * TAU / 3; g.add(f); }
  if (props) { const cup = (cx, cz) => { g.add(mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.01, 24), STDm({ color: '#f8f6f2', roughness: 0.3 }), cx, 0.765, cz)); g.add(mesh(new THREE.LatheGeometry([[0, 0], [0.03, 0], [0.042, 0.06], [0.044, 0.07], [0.04, 0.07], [0.0, 0.01]].map(([r, y]) => new THREE.Vector2(r, y)), 24), STDm({ color: '#f8f6f2', roughness: 0.25, side: THREE.DoubleSide }), cx, 0.77, cz));
      g.add(mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.004, 20), STDm({ color: '#4a2a18', roughness: 0.2 }), cx, 0.83, cz)); g.add(mesh(new THREE.TorusGeometry(0.018, 0.005, 6, 12), STDm({ color: '#f8f6f2' }), cx + 0.048, 0.81, cz)); };
    cup(-0.12, 0.16); cup(0.1, -0.18); g.add(mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.012, 24), STDm({ color: '#f8f6f2', roughness: 0.3 }), 0.18, 0.766, 0.08));
    const cr = mesh(new THREE.TorusGeometry(0.045, 0.026, 10, 16, Math.PI * 1.3), STDm({ color: '#c8843a', roughness: 0.6 }), 0.18, 0.79, 0.08); cr.rotation.x = -Math.PI / 2; g.add(cr);
    g.add(mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 14).translate(0, 0.06, 0), new THREE.MeshPhysicalMaterial({ color: '#e8f0f0', roughness: 0.05, transmission: 0.8, transparent: true, opacity: 0.7 }), -0.16, 0.76, -0.12));
    g.add(mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.18, 5).translate(0, 0.09, 0), STDm({ color: '#3a6a2a' }), -0.16, 0.76, -0.12)); g.add(mesh(new THREE.SphereGeometry(0.028, 10, 8), STDm({ color: '#d83a4a', roughness: 0.6 }), -0.16, 0.95, -0.12)); }
  return g; }
let MARBLE = null;
function tree(st, x, z, s, seed) { const R = RNG('tr' + seed), bark = STDm({ map: texNoise('bark' + (seed % 3), '#8a8270', ['#6a6458', '#a8a090', '#5a5448', '#c0b8a4'], 6000), roughness: 1 }), lm = STDm({ map: leafTex('lf' + (seed % 4), '#4a6a30'), roughness: 0.95 });
  st.scene.add(mesh(new THREE.CylinderGeometry(0.16 * s, 0.26 * s, 3.4 * s, 10).translate(0, 1.7 * s, 0), bark, x, 0, z));
  for (let k = 0; k < 3; k++) { const a = R.r(0, TAU), b = mesh(new THREE.CylinderGeometry(0.05 * s, 0.1 * s, 1.8 * s, 6).translate(0, 0.9 * s, 0), bark, x, 3.1 * s, z); b.rotation.set(0.6 * Math.cos(a), 0, 0.6 * Math.sin(a)); st.scene.add(b); }
  for (let k = 0; k < 6; k++) { const c = mesh(lumpyGeo(3, 0.3, seed * 7 + k), lm, x + R.n(1.3 * s), (4.4 + R.r(-0.4, 1.4)) * s, z + R.n(1.3 * s)); c.scale.setScalar(R.r(1.1, 1.7) * s); st.scene.add(c); } }
function ironLamp(st, x, z, S) { const ir = IRON(); st.scene.add(mesh(new THREE.CylinderGeometry(0.06, 0.12, 3.6, 10).translate(0, 1.8, 0), ir, x, 0, z)); st.scene.add(mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 10), ir, x, 0.15, z));
  st.scene.add(mesh(new THREE.CylinderGeometry(0.22, 0.12, 0.5, 6), STDm({ color: '#ffe6b0', emissive: '#ffcf80', emissiveIntensity: 1.5, roughness: 0.3 }), x, 3.85, z)); st.scene.add(mesh(new THREE.ConeGeometry(0.3, 0.25, 6), ir, x, 4.2, z));
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#ffcf90', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); sp.position.set(x, 3.85, z); sp.scale.setScalar(2.2); st.scene.add(sp); S.lampSp.push(sp); }

function buildPlaza(st) { const R = RNG('plaza'), S = { st, lampSp: [], fronts: [] };
  // ground: cobbles over the plaza; a stone slab under the terrace
  const cob = cobbleTex(); cob.repeat.set(105, 75); const gnd = new THREE.Mesh(new THREE.PlaneGeometry(140, 100).rotateX(-Math.PI / 2), STDm({ map: cob, roughness: 0.9 })); gnd.position.set(PZ.BAL + 70, 0, -20); gnd.receiveShadow = true; st.scene.add(gnd);
  // the balustrade on the left, the retaining wall, the valley
  const bal = STDm({ color: '#d8ccb4', roughness: 0.85 }); st.scene.add(mesh(new THREE.BoxGeometry(0.4, 0.14, 70), bal, PZ.BAL, 1.0, -18)); st.scene.add(mesh(new THREE.BoxGeometry(0.5, 0.18, 70), bal, PZ.BAL, 0.09, -18));
  { const bg = new THREE.LatheGeometry([[0.07, 0], [0.11, 0.08], [0.06, 0.25], [0.12, 0.55], [0.06, 0.82], [0.09, 0.9]].map(([r, y]) => new THREE.Vector2(r, y)), 10), bi = IM(bg, bal, 220); for (let i = 0; i < 220; i++) bi.setMatrixAt(i, M4c(PZ.BAL, 0.12, 16 - i * 0.32)); st.scene.add(bi); }
  st.scene.add(mesh(new THREE.BoxGeometry(2, 80, 80), STDm({ map: wrap(texNoise('wall', '#8a7a64', ['#7a6a56', '#9a8a72', '#6a5a48']), 10, 30), roughness: 1 }), PZ.BAL - 1.2, -40, -18));
  const vall = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000).rotateX(-Math.PI / 2), STDm({ map: wrap(g3Tex((x, w) => { const Rl = RNG('vall'); x.fillStyle = '#3a4a2e'; x.fillRect(0, 0, w, w); for (let k = 0; k < 500; k++) blot(x, Rl.r(0, w), Rl.r(0, w), Rl.r(8, 40), Rl.pick(['rgba(90,100,60,0.5)', 'rgba(40,50,30,0.6)', 'rgba(120,110,90,0.4)'])); }, 512, 512), 30, 30), roughness: 1 }));
  vall.position.set(-4500, -70, 0); st.scene.add(vall);
  { const ts = IM(lumpyGeo(2, 0.3, 77), STDm({ map: leafTex('vt', '#3a5a2a'), roughness: 1 }), 500, false); for (let i = 0; i < 500; i++) { const xx = R.r(-34, -400), zz = R.r(-400, 300), s = R.r(3, 7); ts.setMatrixAt(i, M4c(xx, -70 + s * 0.6 + Math.max(0, 50 + (xx + 34) * 0.9) * 0, zz, R.r(0, 6), s, s * 0.9, s)); } st.scene.add(ts); }
  S.towers = []; const tc = ['#5a5a66', '#6a6258', '#4a5260', '#7a7068', '#8a8070'];
  for (let k = 0; k < 260; k++) { const xx = -R.r(450, 2600), zz = R.r(-1800, 1200), h = R.r(12, 40) + 110 * Math.exp(-(((zz + 300) / 600) ** 2 + ((xx + 1300) / 500) ** 2)) * R.f(); const m = winLit(R.pick(tc), k % 13);
    const b = new THREE.Mesh(new THREE.BoxGeometry(R.r(18, 40), h, R.r(18, 40)).translate(0, h / 2, 0), m); b.position.set(xx, -70, zz); st.scene.add(b); S.towers.push(m); }
  S.hills = []; for (let k = 0; k < 16; k++) { const a = (-150 + k * 7) * DEG, r = R.r(4200, 5200), hm = new THREE.Mesh(lumpyGeo(3, 0.25, 300 + k), STDm({ color: '#6a6a88', roughness: 1 })); hm.position.set(Math.sin(a) * r, -300, -Math.cos(a) * r); hm.scale.set(R.r(700, 1100), R.r(380, 700), 700); st.scene.add(hm); S.hills.push(hm); }
  // facades: the front row (with the town hall and its clock tower) and the right row
  const walls = ['#e8c890', '#d89a72', '#f0dcc0', '#e4b8a0', '#c8a878', '#ecd2a8', '#d4b48c', '#f2e2c8'];
  let xx = PZ.BAL + 4; let k = 0; while (xx < 64) { const w = R.r(9, 14), fl = 2 + Math.floor(R.f() * 3); if (Math.abs(xx + w / 2 - 6) < 8) { xx = 14; continue; }
    S.fronts.push(building(st, xx + w / 2, PZ.FRONT - 6, w, 12, 0, k, walls[k % walls.length], fl, Math.max(2, Math.round(w / 3.2)), { arcade: k % 3 === 0, balc: true })); xx += w + 0.02; k++; }
  { const th = building(st, 6, PZ.FRONT - 7, 16, 14, 0, 50, '#e8d4b0', 3, 5, { arcade: true, gH: 5, fH: 3.8, balc: true, roof: false }); S.fronts.push(th);
    const tw = building(st, 6, PZ.FRONT - 9, 6.4, 6.4, 0, 51, '#ecdcbc', 7, 2, { gH: 16, fH: 3.2, roof: false, lit: 0.1 }); S.fronts.push(tw); const tH = 16 + 7 * 3.2 + 0.9;
    const cf = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), STDm({ map: clockTex(), roughness: 0.6, emissive: '#fff2d8', emissiveIntensity: 0.0 })); cf.position.set(6, tH - 3.6, PZ.FRONT - 9 + 3.25); st.scene.add(cf); S.clockM = cf.material;
    st.scene.add(mesh(new THREE.TorusGeometry(1.95, 0.12, 8, 48), STDm({ color: '#c8a050', metalness: 0.7, roughness: 0.3 }), 6, tH - 3.6, PZ.FRONT - 9 + 3.3));
    const stn = STDm({ color: '#e8d8b8', roughness: 0.85 }); [[-2.8, -2.8], [2.8, -2.8], [-2.8, 2.8], [2.8, 2.8]].forEach(([a, b]) => st.scene.add(mesh(new THREE.BoxGeometry(0.8, 4.2, 0.8), stn, 6 + a, tH + 2.4, PZ.FRONT - 9 + b)));
    st.scene.add(mesh(new THREE.BoxGeometry(7.2, 0.6, 7.2), stn, 6, tH + 4.7, PZ.FRONT - 9)); st.scene.add(mesh(new THREE.SphereGeometry(3.0, 24, 12, 0, TAU, 0, Math.PI / 2), STDm({ color: '#4a7a78', roughness: 0.5, metalness: 0.4 }), 6, tH + 5.0, PZ.FRONT - 9));
    st.scene.add(mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.4, 8), stn, 6, tH + 8.6, PZ.FRONT - 9)); st.scene.add(mesh(new THREE.ConeGeometry(0.6, 1.6, 8), STDm({ color: '#4a7a78', metalness: 0.4 }), 6, tH + 10.1, PZ.FRONT - 9));
    st.scene.add(mesh(new THREE.BoxGeometry(1.2, 1.4, 0.2), STDm({ color: '#6a4a2a', metalness: 0.5 }), 6, tH + 2.0, PZ.FRONT - 9)); }
  let zz = PZ.CAFE + 6; k = 20; while (zz > PZ.FRONT - 2) { const w = R.r(9, 13), fl = 2 + Math.floor(R.f() * 3); S.fronts.push(building(st, PZ.RIGHT + 6, zz - w / 2, w, 12, -Math.PI / 2, k, walls[(k + 3) % walls.length], fl, Math.max(2, Math.round(w / 3.2)), { arcade: k % 2 === 0, balc: true })); zz -= w + 0.02; k++; }
  // the café behind you: facade, awning, sign
  { const cafe = building(st, 2, PZ.CAFE + 5, 20, 10, Math.PI, 70, '#f0e2c4', 1, 6, { gH: 4.6, lit: 0.6 }); S.fronts.push(cafe);
    const aw = g3Tex((x, w, h) => { for (let s = 0; s < 24; s++) { x.fillStyle = s % 2 ? '#a8322a' : '#f4ecdc'; x.fillRect(s * w / 24, 0, w / 24 + 1, h); } x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(0, h * 0.85, w, h * 0.15); }, 512, 64);
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(15, 2.6), STDm({ map: aw, side: THREE.DoubleSide, roughness: 0.9 })); awn.position.set(4.2, 3.1, PZ.CAFE - 1.1); awn.rotation.x = -Math.PI / 2 + 0.28; awn.castShadow = true; st.scene.add(awn);
    sign(st, ['CAFÉ CENTRAL'], 2, 4.0, PZ.CAFE - 0.02, 4.6, 0.7, { bg: '#1e3a2e', fg: '#e8d090', border: '#c8a050', ry: Math.PI, glow: 0.5 }); }
  // tram rails and the overhead wire; the tram
  const rail = STDm({ color: '#8a8a8a', metalness: 0.9, roughness: 0.3 }); [-0.72, 0.72].forEach((o) => st.scene.add(mesh(new THREE.BoxGeometry(110, 0.03, 0.08), rail, 20, 0.015, -36 + o)));
  st.scene.add(mesh(new THREE.CylinderGeometry(0.01, 0.01, 110, 4).rotateZ(Math.PI / 2), IRON(), 20, 6.2, -36));
  { const tr = new THREE.Group(); st.scene.add(tr); S.tram = tr; const body = STDm({ color: '#f0e4c8', roughness: 0.5 }), red = STDm({ color: '#a8322a', roughness: 0.5 }), gl = STDm({ color: '#1c2430', roughness: 0.1, metalness: 0.3, emissive: '#ffcf90', emissiveIntensity: 0.25 });
    tr.add(mesh(new THREE.BoxGeometry(14, 1.2, 2.5), red, 0, 0.9, 0)); tr.add(mesh(new THREE.BoxGeometry(14, 1.5, 2.5), body, 0, 2.25, 0)); tr.add(mesh(new THREE.BoxGeometry(14.05, 1.0, 2.52), gl, 0, 2.3, 0)); tr.add(mesh(new THREE.BoxGeometry(14.2, 0.3, 2.6), red, 0, 3.15, 0));
    for (let k2 = -6; k2 <= 6; k2 += 1.75) tr.add(mesh(new THREE.BoxGeometry(0.12, 1.02, 2.56), body, k2, 2.3, 0)); { const pg = mesh(new THREE.BoxGeometry(0.1, 2.0, 0.1), IRON(), 0, 4.2, 0); pg.rotation.z = 0.5; tr.add(pg); } [-5, 5].forEach((wx) => tr.add(mesh(new THREE.CylinderGeometry(0.4, 0.4, 2.3, 16).rotateX(Math.PI / 2), IRON(), wx, 0.4, 0))); }
  // the fountain: basin, centre column with two bowls, water
  { const fx = 5, fz = -19, stn = STDm({ map: texNoise('fst', '#d8ccb0', ['#c8bca0', '#e8dcc4', '#b0a488'], 6000), roughness: 0.8 });
    st.scene.add(mesh(new THREE.LatheGeometry([[3.6, 0], [3.8, 0], [3.8, 0.7], [3.6, 0.75], [3.4, 0.7], [3.4, 0.2], [0, 0.2]].map(([r, y]) => new THREE.Vector2(r, y)), 48), stn, fx, 0, fz));
    const wm = new THREE.MeshPhysicalMaterial({ color: '#5a8aa0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 }); st.scene.add(mesh(new THREE.CircleGeometry(3.4, 48).rotateX(-Math.PI / 2), wm, fx, 0.55, fz));
    st.scene.add(mesh(new THREE.LatheGeometry([[0.35, 0], [0.25, 1.4], [0.3, 1.5], [1.4, 1.7], [1.5, 1.85], [0.2, 1.8], [0.15, 2.6], [0.7, 2.75], [0.75, 2.85], [0.1, 2.85], [0.1, 3.4], [0.2, 3.5], [0, 3.6]].map(([r, y]) => new THREE.Vector2(r, y)), 32), stn, fx, 0.2, fz));
    const wa = new THREE.MeshStandardMaterial({ color: '#d8ecf4', transparent: true, opacity: 0.55, roughness: 0.05, side: THREE.DoubleSide, depthWrite: false }); st.scene.add(mesh(new THREE.CylinderGeometry(1.5, 1.7, 1.75, 32, 1, true), wa, fx, 1.0, fz)); st.scene.add(mesh(new THREE.CylinderGeometry(0.75, 0.9, 0.9, 24, 1, true), wa, fx, 2.6, fz));
    st.scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.4, 8), wa, fx, 4.4, fz)); S.fount = [fx, fz]; }
  // trees, lamps, benches
  for (let z = -6; z > -42; z -= 7) { tree(st, -20, z, 1.15, Math.round(-z)); tree(st, 22, z - 3, 1.1, Math.round(-z) + 50); }
  [[-8, -12], [16, -12], [-8, -28], [16, -28], [-22, -2], [24, 0]].forEach(([x, z]) => ironLamp(st, x, z, S));
  [[-17, -10], [-17, -24], [19, -16], [19, -30]].forEach(([x, z]) => { const bn = new THREE.Group(); bn.position.set(x, 0, z); bn.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; st.scene.add(bn); const wd = STDm({ color: '#6a4a2e' }); for (let s = 0; s < 4; s++) bn.add(mesh(new THREE.BoxGeometry(1.8, 0.04, 0.09), wd, 0, 0.45, -0.18 + s * 0.12)); for (let s = 0; s < 3; s++) bn.add(mesh(new THREE.BoxGeometry(1.8, 0.09, 0.03), wd, 0, 0.6 + s * 0.13, -0.26)); [-0.8, 0.8].forEach((a) => bn.add(mesh(new THREE.BoxGeometry(0.06, 0.45, 0.5), IRON(), a, 0.22, -0.05))); });
  // string lights over the terrace
  { const pole = IRON(), pts = []; [-8, -2.5, 3, 8.5].forEach((x) => { st.scene.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.9, 8).translate(0, 1.95, 0), pole, x, 0, -7.5)); for (let i = 0; i <= 26; i++) { const u = i / 26; pts.push([x, lerp(3.85, 3.4, u) - 0.5 * Math.sin(u * Math.PI), lerp(-7.5, PZ.CAFE - 0.2, u)]); } });
    for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([lerp(-8, 8.5, u), 3.85 - 0.7 * Math.sin(u * Math.PI), -7.5]); }
    S.bulbs = IM(new THREE.SphereGeometry(0.05, 8, 6), STDm({ color: '#fff0c8', emissive: '#ffcf80', emissiveIntensity: 2.2 }), pts.length, false); pts.forEach((p, i) => S.bulbs.setMatrixAt(i, M4c(p[0], p[1], p[2]))); st.scene.add(S.bulbs); }
  // terrace: your table (with props), other tables and chairs
  S.table = bistroTable(st.scene, 0, 0); bistroChair(st.scene, 0, -0.78, 0, '#7a4a2a'); bistroChair(st.scene, 0, 0.78, Math.PI, '#7a4a2a');
  { const g = new THREE.Group(); st.scene.add(g); S.phoneT = g; g.add(mesh(new THREE.BoxGeometry(0.075, 0.008, 0.15), STDm({ color: '#141414', roughness: 0.3 }), -0.2, 0.765, 0.05)); g.rotation.y = 0; }
  const TBL = [[-2.5, -0.9], [2.6, -1.4], [-2.2, -3.8], [2.4, -4.4], [-0.6, -6.6], [5.2, -2.2]]; TBL.forEach(([x, z], i) => { bistroTable(st.scene, x, z, i % 2 === 0); bistroChair(st.scene, x - 0.78, z, Math.PI / 2); bistroChair(st.scene, x + 0.78, z, -Math.PI / 2); });
  // people
  const P = (o) => { const p = makePerson(o); st.scene.add(p.root); return p; };
  S.friend = P({ female: true, skin: SKINS[1], hair: HAIRS[1], hairStyle: 'long', top: '#2a8a8a', bottom: '#2b3a55', seed: 801 });
  S.din = []; const tops = ['#d94848', '#f4f1ea', '#2f6fd1', '#f0c33c', '#7b4fc9', '#3a8a5a', '#e86fa8', '#5a5a6a', '#c8a070', '#1f2d3d', '#ef8a3a', '#2a9d8f'];
  TBL.forEach(([x, z], i) => [-1, 1].forEach((s, j) => { const fem = (i + j) % 2 === 0, p = P(Object.assign({ female: fem, skin: SKINS[(i * 2 + j * 3) % 6], hair: HAIRS[(i + j * 2) % 7], hairStyle: fem ? ['bob', 'pony', 'bun', 'long', 'curly'][(i + j) % 5] : ['short', 'curly', 'short', 'none'][(i + j) % 4], top: tops[(i * 2 + j) % tops.length], bottom: BOTS[(i + j) % BOTS.length], sleeve: (i + j) % 2 ? 'short' : 'long', seed: 820 + i * 2 + j }));
    S.din.push({ P: p, x: x + s * 0.78, z, yaw: -s * Math.PI / 2, i: S.din.length }); }));
  S.waiter = P({ skin: SKINS[3], hair: HAIRS[0], hairStyle: 'short', top: '#f4f2ee', bottom: '#1a1a1a', vest: '#1a1a1a', seed: 860 });
  S.tray = new THREE.Group(); st.scene.add(S.tray); S.tray.add(mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.012, 24), STDm({ color: '#c0c0c0', metalness: 0.8, roughness: 0.3 })));
  [[-0.08, 0.05], [0.07, -0.06], [0.06, 0.08]].forEach(([a, b]) => S.tray.add(mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.12, 12).translate(0, 0.066, 0), new THREE.MeshPhysicalMaterial({ color: '#f0f4f4', roughness: 0.05, transmission: 0.7, transparent: true, opacity: 0.75 }), a, 0, b)));
  S.crip = P({ skin: SKINS[2], hair: HAIRS[6], hairStyle: 'short', top: '#7a5a3a', bottom: '#3a3a3a', seed: 870 }); S.crut = [0, 1].map(() => { const g = new THREE.Group(); st.scene.add(g); g.add(mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8).translate(0, 0.65, 0), STDm({ color: '#b0b4b8', metalness: 0.8, roughness: 0.3 }))); g.add(mesh(new THREE.BoxGeometry(0.16, 0.04, 0.05), STDm({ color: '#2a2a2a' }), 0, 1.3, 0)); g.add(mesh(new THREE.BoxGeometry(0.1, 0.03, 0.04), STDm({ color: '#2a2a2a' }), 0, 0.85, 0.03)); return g; });
  S.walk = [0, 1, 2, 3].map((i) => P(Object.assign(i % 2 ? { female: true, hairStyle: ['pony', 'bob'][i % 2] } : { hairStyle: 'short' }, { skin: SKINS[(i * 2 + 1) % 6], hair: HAIRS[(i * 3) % 7], top: ['#c2185b', '#1e5aa8', '#f2c94c', '#3cae5c'][i], bottom: BOTS[i % 5], seed: 880 + i })));
  S.phones = [S.din[1], S.din[4], S.din[9], S.walk[1]].map((d) => { const pp = d.P || d, ph = mesh(new THREE.BoxGeometry(0.075, 0.15, 0.01), STDm({ color: '#141414', emissive: '#a8c8ff', emissiveIntensity: 0.0 }), 0, -0.1, 0.035); pp.arms[1].hand.add(ph); ph.visible = false; return ph; });
  S.crowd = makeCrowd(110, { seed: 21 }); st.scene.add(S.crowd.grp); S.cl = []; for (let i = 0; i < 110; i++) { const r = R.r(0, 1); S.cl.push({ x: R.r(-22, 26), z: R.r(-12, -42), yaw: R.r(0, TAU), ph: R.r(0, 6), sp: R.f() < 0.5 ? R.r(0.6, 1.2) : 0, up: R.f() < 0.45, ts: 34.4 + R.r(0, 2.5), kneel: R.f() < 0.3 }); }
  // pigeons on the cobbles
  { const n = 36; S.pig = { n, L: [], body: IM(new THREE.SphereGeometry(0.1, 10, 8).scale(0.85, 0.75, 1.3), STDm({ color: '#7a7c88', roughness: 0.8 }), n), head: IM(new THREE.SphereGeometry(0.045, 8, 6), STDm({ color: '#5a6070', roughness: 0.7 }), n), wing: IM(new THREE.PlaneGeometry(0.26, 0.12).translate(0.13, 0, 0).rotateX(-Math.PI / 2), STDm({ color: '#8a8c96', side: THREE.DoubleSide }), n * 2) };
    for (let i = 0; i < n; i++) S.pig.L.push({ x: R.r(-6, 12), z: R.r(-5, -16), yaw: R.r(0, TAU), ph: R.r(0, 6), ts: 12.55 + R.r(0, 0.5), dir: R.r(-0.6, 0.6) }); [S.pig.body, S.pig.head, S.pig.wing].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; st.scene.add(m); }); }
  S.riseGlow = []; for (let i = 0; i < 12; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: '#fff2d8', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); sp.scale.setScalar(2.6); st.scene.add(sp); S.riseGlow.push(sp); }
  S.clouds = addSkyClouds(st, 26, 0, 0, 1800, 4500, 600, 1200, 'plz'); S.clouds.forEach((c) => c.material.color.set('#e8b8b0'));
  return S; }


// =====================================================================
//  HEAT — the sky heats up toward the edge of the universe (owned by the heat agent).
//  buildHeat(st, S); poseHeat(S, t, cam): steam, the brochure in your hand and its burning, trees burning, the sky glow
//  (red → plasma → white) and your raised hand. Pure function of t (camera-held props are gated by the absolute clock TT,
//  so they only show in their own shots and never pop up during the rewind).
// =====================================================================
// ---- a baked value-noise table (the same numbers in JS and in the shaders, so flames sit on the paper's burn front)
const HN = 64; let HNA = null, HNT = null;
function heatNoiseInit() { if (HNA) return; const R = RNG('heatN'), d = new Uint8Array(HN * HN * 4); HNA = new Float32Array(HN * HN);
  for (let i = 0; i < HN * HN; i++) { const b = Math.floor(R.f() * 256) & 255; HNA[i] = b / 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = b; d[i * 4 + 3] = 255; }
  HNT = new THREE.DataTexture(d, HN, HN, THREE.RGBAFormat); HNT.wrapS = HNT.wrapT = THREE.RepeatWrapping; HNT.magFilter = HNT.minFilter = THREE.LinearFilter; HNT.needsUpdate = true; }
function heatNs(u, v) { const x = u * HN - 0.5, y = v * HN - 0.5, i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, I = (a, b) => HNA[(((b % HN) + HN) % HN) * HN + (((a % HN) + HN) % HN)];
  return lerp(lerp(I(i, j), I(i + 1, j), fx), lerp(I(i, j + 1), I(i + 1, j + 1), fx), fy); }
// the brochure: 11.5 × 20 cm; its burn field (low = burns first): the edges, broken up by noise
const HP = { W: 0.115, H: 0.2 };
function heatPF(u, v) { const e = Math.min(Math.min(u, 1 - u) * HP.W, Math.min(v, 1 - v) * HP.H) / (HP.W / 2), n = heatNs(u * 0.05 + 0.17, v * 0.087 + 0.41) * 0.65 + heatNs(u * 0.16 + 0.5, v * 0.28 + 0.2) * 0.35;
  return e * 0.8 + (n - 0.5) * 0.7 + (1 - v) * 0.05; }
const HEAT_PF_GLSL = `uniform sampler2D uN; float hN(vec2 p){ return texture2D(uN, p).r; }
float PF(vec2 uv){ float e = min(min(uv.x, 1.0 - uv.x) * 0.115, min(uv.y, 1.0 - uv.y) * 0.2) / 0.0575; float n = hN(uv * vec2(0.05, 0.087) + vec2(0.17, 0.41)) * 0.65 + hN(uv * vec2(0.16, 0.28) + vec2(0.5, 0.2)) * 0.35;
  return e * 0.8 + (n - 0.5) * 0.7 + (1.0 - uv.y) * 0.05; }`;
const HEAT_TAIL = '\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n';
const hc = (a) => (Array.isArray(a) ? new THREE.Color(a[0], a[1], a[2]) : lin(a));

// ---- textures: a soft puff (steam/smoke), a flame tongue, a spark
function heatPuffTex(seed) { return g3Tex((x, w, h) => { const im = x.createImageData(w, h), o = seed * 0.37;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const u = i / w - 0.5, v = j / h - 0.5, r = Math.hypot(u, v) * 2, n = heatNs(i / w * 0.07 + o, j / h * 0.07 + o * 1.3) * 0.6 + heatNs(i / w * 0.19 + o, j / h * 0.19) * 0.4;
    const a = clamp((1 - r) * 1.6 + (n - 0.5) * 1.4) * clamp(1 - r * r), k = (j * w + i) * 4, l = 200 + 55 * n; im.data[k] = l; im.data[k + 1] = l; im.data[k + 2] = l; im.data[k + 3] = 255 * a * a; }
  x.putImageData(im, 0, 0); }, 128, 128); }
function heatFlameTex() { return g3Tex((x, w, h) => { const im = x.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const y = 1 - j / h, u = (i / w - 0.5) * 2, n = heatNs(i / w * 0.05, j / h * 0.08 + 0.3), wid = Math.pow(Math.max(0, 1 - y), 0.55) * Math.min(1, y * 7 + 0.3) * (0.8 + 0.4 * n);
    const d = Math.abs(u) / Math.max(0.001, wid), a = clamp((1 - d) * 2.2) * clamp((1 - y) * 3), core = clamp((1 - d * 1.7) * 2) * clamp(1 - y * 1.6), k = (j * w + i) * 4;
    im.data[k] = 255; im.data[k + 1] = 120 + 135 * core; im.data[k + 2] = 30 + 200 * core * core; im.data[k + 3] = 255 * a; }
  x.putImageData(im, 0, 0); }, 64, 128); }
// the brochure: "PALACIO", a pen drawing of the palace, the map of the esplanade (fountain, paths, trees, the lookout), a legend
function heatBrochureTex() { return g3Tex((x, w, h) => { const R = RNG('broch'), ink = '#5a3a24';
  x.fillStyle = '#f3ecd9'; x.fillRect(0, 0, w, h); for (let k = 0; k < 4000; k++) { x.fillStyle = `rgba(${R.r(90, 140)},${R.r(80, 110)},60,${R.r(0.03, 0.08)})`; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), 1); }
  x.fillStyle = '#1f4a3a'; x.fillRect(16, 16, w - 32, 132); x.strokeStyle = '#c8a860'; x.lineWidth = 3; x.strokeRect(24, 24, w - 48, 116);
  x.fillStyle = '#f4e8c8'; x.textAlign = 'center'; x.font = 'bold 74px Georgia, "Times New Roman", serif'; x.fillText('PALACIO', w / 2, 98); x.font = '600 19px Georgia, serif'; x.fillText('EXPLANADA · FUENTE · MIRADOR', w / 2, 128);
  // the palace drawing
  const py = 300; x.strokeStyle = ink; x.fillStyle = 'rgba(200,170,120,0.35)'; x.lineWidth = 2.2; x.fillRect(80, py - 70, w - 160, 70); x.strokeRect(80, py - 70, w - 160, 70);
  for (let k = 0; k < 15; k++) { const cx = 96 + k * (w - 192) / 14; x.beginPath(); x.moveTo(cx, py - 4); x.lineTo(cx, py - 60); x.stroke(); }
  x.beginPath(); x.moveTo(w / 2 - 56, py - 70); x.lineTo(w / 2 - 56, py - 100); x.lineTo(w / 2 + 56, py - 100); x.lineTo(w / 2 + 56, py - 70); x.stroke();
  x.beginPath(); x.ellipse(w / 2, py - 100, 58, 62, 0, Math.PI, TAU); x.fill(); x.stroke(); x.beginPath(); x.moveTo(w / 2, py - 162); x.lineTo(w / 2, py - 182); x.stroke(); x.beginPath(); x.arc(w / 2, py - 186, 5, 0, TAU); x.stroke();
  [92, w - 92].forEach((tx) => { x.strokeRect(tx - 14, py - 130, 28, 126); x.beginPath(); x.moveTo(tx - 18, py - 130); x.lineTo(tx, py - 156); x.lineTo(tx + 18, py - 130); x.stroke(); });
  for (let k = 0; k < 7; k++) { x.beginPath(); x.moveTo(70 + k * 4, py + 4 + k * 4); x.lineTo(w - 70 - k * 4, py + 4 + k * 4); x.stroke(); }
  // the map
  const mx = 34, my = 350, mw = w - 68, mh = 440; x.fillStyle = '#e6dcc0'; x.fillRect(mx, my, mw, mh); x.fillStyle = '#9cc47a'; x.fillRect(mx + 8, my + 8, mw - 16, mh - 16);
  x.fillStyle = '#e8dcc4'; x.fillRect(mx + 70, my + 8, mw - 140, mh - 70); x.strokeStyle = 'rgba(160,140,110,0.6)'; x.lineWidth = 1; for (let gx = mx + 70; gx < mx + mw - 70; gx += 14) { x.beginPath(); x.moveTo(gx, my + 8); x.lineTo(gx, my + mh - 62); x.stroke(); }
  const fx = w / 2, fy = my + 230; x.fillStyle = '#d0c4a8'; x.beginPath(); x.arc(fx, fy, 104, 0, TAU); x.fill(); x.fillStyle = '#5aa0d0'; x.beginPath(); x.arc(fx, fy, 94, 0, TAU); x.fill(); x.strokeStyle = '#2a6a9a'; x.lineWidth = 2; x.stroke();
  x.fillStyle = '#d0c4a8'; x.beginPath(); x.arc(fx, fy, 40, 0, TAU); x.fill(); x.fillStyle = '#7ab8e0'; x.beginPath(); x.arc(fx, fy, 32, 0, TAU); x.fill(); x.fillStyle = '#e8e0d0'; x.beginPath(); x.arc(fx, fy, 10, 0, TAU); x.fill();
  x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 1.5; for (let k = 0; k < 28; k++) { const a = k / 28 * TAU; x.beginPath(); x.moveTo(fx + Math.cos(a) * 90, fy + Math.sin(a) * 90); x.quadraticCurveTo(fx + Math.cos(a) * 66, fy + Math.sin(a) * 66 - 6, fx + Math.cos(a) * 46, fy + Math.sin(a) * 46); x.stroke(); }
  x.strokeStyle = '#c8b898'; x.lineWidth = 12; x.beginPath(); x.moveTo(fx, my + 8); x.lineTo(fx, fy - 104); x.moveTo(fx, fy + 104); x.lineTo(fx, my + mh - 62); x.stroke();
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; x.fillStyle = '#f0d890'; x.beginPath(); x.arc(fx + Math.cos(a) * 128, fy + Math.sin(a) * 128, 4, 0, TAU); x.fill(); }
  for (let k = 0; k < 22; k++) { const sd = k % 2 ? 1 : -1, tx = fx + sd * R.r(150, 200), ty = my + R.r(30, mh - 80); x.fillStyle = '#2f6a34'; x.beginPath(); x.ellipse(tx, ty, 6, 9, 0, 0, TAU); x.fill(); }
  for (let k = 0; k < 8; k++) { const sd = k % 2 ? 1 : -1, tx = fx + sd * R.r(118, 140), ty = my + R.r(40, mh - 100); x.strokeStyle = '#3a7a3a'; x.lineWidth = 2; for (let q = 0; q < 6; q++) { const a = q / 6 * TAU; x.beginPath(); x.moveTo(tx, ty); x.lineTo(tx + Math.cos(a) * 9, ty + Math.sin(a) * 9); x.stroke(); } }
  x.fillStyle = '#b8a888'; x.fillRect(mx + 8, my + mh - 62, mw - 16, 10); x.fillStyle = '#7a8aa0'; x.fillRect(mx + 8, my + mh - 52, mw - 16, 44);
  for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(230,220,200,${R.r(0.4, 0.8)})`; x.fillRect(mx + 12 + R.r(0, mw - 30), my + mh - 48 + R.r(0, 34), R.r(4, 10), R.r(3, 7)); }
  x.fillStyle = ink; x.font = 'bold 15px Georgia, serif'; x.fillText('FUENTE MONUMENTAL', fx, fy + 4 - 60); x.fillText('MIRADOR · LA CIUDAD', fx, my + mh - 24); x.fillText('PALACIO', fx, my + 26);
  x.font = 'italic 14px Georgia, serif'; x.fillText('cipreses', mx + 40, my + 140); x.fillText('palmeras', mx + mw - 44, my + 300);
  const yx = fx + 36, yy = fy + 150; x.fillStyle = '#d02828'; x.beginPath(); x.arc(yx, yy - 18, 11, 0, TAU); x.fill(); x.beginPath(); x.moveTo(yx - 9, yy - 14); x.lineTo(yx, yy); x.lineTo(yx + 9, yy - 14); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(yx, yy - 18, 4, 0, TAU); x.fill();
  x.fillStyle = '#d02828'; x.fillRect(yx + 16, yy - 30, 96, 22); x.fillStyle = '#fff'; x.font = 'bold 13px Arial, sans-serif'; x.fillText('ESTÁS AQUÍ', yx + 64, yy - 14);
  // the legend and the north arrow
  x.textAlign = 'left'; x.font = '13px Arial, sans-serif'; [['#9cc47a', 'JARDÍN'], ['#5aa0d0', 'AGUA'], ['#2f6a34', 'ÁRBOLES'], ['#f0d890', 'FAROLAS']].forEach(([c, l], k) => { x.fillStyle = c; x.fillRect(44 + k * 112, 816, 16, 16); x.fillStyle = ink; x.fillText(l, 66 + k * 112, 829); });
  x.fillStyle = ink; x.beginPath(); x.moveTo(w - 40, 852); x.lineTo(w - 32, 878); x.lineTo(w - 48, 878); x.fill(); x.font = 'bold 13px Arial'; x.fillText('N', w - 45, 848);
  x.font = '11px Arial, sans-serif'; x.fillText('Abierto todos los días · Entrada libre · Visitas guiadas 10:00 y 17:00', 34, 868);
  x.strokeStyle = 'rgba(120,100,70,0.25)'; x.lineWidth = 1.5; [h / 3, 2 * h / 3].forEach((fy2) => { x.beginPath(); x.moveTo(0, fy2); x.lineTo(w, fy2); x.stroke(); }); }, 512, 890); }

// ---- particles: camera-facing quads (one draw per system) driven by the clock: age = fract(t·rate + phase)
// per instance: aO origin, aV drift over a life, aP = (phase, rate, size, ignite time | burn-field value)
const HEAT_VS = `attribute vec3 aO; attribute vec3 aV; attribute vec4 aP;
uniform float uT, uAmt, uRise, uGrow, uWob, uWobF, uSpin, uRot, uIn, uOut, uBand, uFront, uBandW, uOnDur, uStretch, uShrink, uSizeOn;
varying vec2 vUv; varying float vA, vAge;
void main(){
  float on = uBand > 0.5 ? smoothstep(0.0, 0.02, aP.w - uFront) * (1.0 - smoothstep(uBandW * 0.4, uBandW, aP.w - uFront)) : smoothstep(aP.w, aP.w + uOnDur, uT);
  float age = fract(uT * aP.y + aP.x), sd = fract(aP.x * 7.31 + aP.z * 13.7);
  vec3 p = aO + aV * age + vec3(0.0, uRise * (0.5 * age + 0.5 * age * age), 0.0);
  p.x += uWob * age * sin(uT * uWobF + sd * 6.28 + age * 2.0); p.z += uWob * age * cos(uT * uWobF * 0.8 + sd * 5.0 + age * 1.7);
  float sz = aP.z * mix(1.0, 0.25 + 0.75 * on, uSizeOn) * (1.0 + uGrow * age) * max(0.0, 1.0 - uShrink * age);
  vec4 mv = modelViewMatrix * vec4(p, 1.0); float r = uRot * (sd * 6.2832 + age * uSpin), c = cos(r), s = sin(r); vec2 q = position.xy * vec2(1.0, uStretch);
  mv.xy += vec2(q.x * c - q.y * s, q.x * s + q.y * c) * sz; gl_Position = projectionMatrix * mv;
  vUv = uv; vAge = age; vA = on * uAmt * smoothstep(0.0, uIn, age) * (1.0 - smoothstep(uOut, 1.0, age)); }`;
const HEAT_FS = `uniform sampler2D uMap; uniform vec3 uC0, uC1; varying vec2 vUv; varying float vA, vAge;
void main(){ vec4 tx = texture2D(uMap, vUv); float a = tx.a * vA; if (a < 0.002) discard; gl_FragColor = vec4(mix(uC0, uC1, vAge) * tx.rgb, a);` + HEAT_TAIL + '}';
function heatParts(par, n, o, fill) { const pg = new THREE.PlaneGeometry(1, 1); if (o.pivot) pg.translate(0, 0.45, 0);
  const g = new THREE.InstancedBufferGeometry(); g.setIndex(pg.index); g.setAttribute('position', pg.attributes.position); g.setAttribute('uv', pg.attributes.uv);
  const O = new Float32Array(n * 3), V = new Float32Array(n * 3), P = new Float32Array(n * 4); for (let i = 0; i < n; i++) { const [o3, v3, p4] = fill(i); O.set(o3, i * 3); V.set(v3, i * 3); P.set(p4, i * 4); }
  g.setAttribute('aO', new THREE.InstancedBufferAttribute(O, 3)); g.setAttribute('aV', new THREE.InstancedBufferAttribute(V, 3)); g.setAttribute('aP', new THREE.InstancedBufferAttribute(P, 4)); g.instanceCount = n;
  const f = (v) => ({ value: v }), U = { uT: f(0), uAmt: f(0), uRise: f(o.rise || 0), uGrow: f(o.grow || 0), uWob: f(o.wob || 0), uWobF: f(o.wobF || 1), uSpin: f(o.spin || 0), uRot: f(o.rot ?? 1), uIn: f(o.fin ?? 0.15), uOut: f(o.fout ?? 0.6),
    uBand: f(o.band ? 1 : 0), uFront: f(0), uBandW: f(o.bandW || 0.1), uOnDur: f(o.onDur || 0.5), uStretch: f(o.stretch || 1), uShrink: f(o.shrink || 0), uSizeOn: f(o.sizeOn ?? 1), uMap: f(o.map), uC0: f(hc(o.c0)), uC1: f(hc(o.c1 || o.c0)) };
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: U, vertexShader: HEAT_VS, fragmentShader: HEAT_FS, transparent: true, depthWrite: false, fog: false, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }));
  m.frustumCulled = false; m.castShadow = m.receiveShadow = false; m.renderOrder = o.ro || 0; m.visible = false; par.add(m); return { m, U }; }
function heatSet(P, t, amt) { P.m.visible = amt > 0.001; P.U.uT.value = t; P.U.uAmt.value = amt; }

// ---- the sky at the edge: black → the CMB's mottled red glow → hot plasma (pink/green/yellow) → yellow-white glare
const HEAT_SKY_FS = `uniform float uT, uRed, uBright, uPlasma, uWhite, uFin; varying vec3 vD;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1, 0, 0)), f.x), mix(h3(i + vec3(0, 1, 0)), h3(i + vec3(1, 1, 0)), f.x), f.y), mix(mix(h3(i + vec3(0, 0, 1)), h3(i + vec3(1, 0, 1)), f.x), mix(h3(i + vec3(0, 1, 1)), h3(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.0, m = 0.5; for (int i = 0; i < 5; i++) { a += m * n3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); m *= 0.5; } return a; }
void main(){ vec3 d = normalize(vD); float hz = d.y; vec3 q = d * 2.6 + vec3(0.0, 0.0, uT * 0.05);
  float m = fbm(q * 1.4) * 0.65 + fbm(q * 4.2 + 7.0) * 0.35;
  vec3 red = mix(vec3(0.28, 0.015, 0.0), vec3(1.5, 0.16, 0.02), smoothstep(0.28, 0.72, m)); red += vec3(1.3, 0.42, 0.04) * smoothstep(0.58, 0.82, m) + vec3(0.6, 0.05, 0.0) * exp(-abs(hz) * 6.0);
  red *= uBright;
  vec3 w = vec3(fbm(q * 1.1 + 1.3 + uT * 0.04), fbm(q * 1.1 + 5.1 - uT * 0.03), 0.0); float f = fbm(q * 1.5 + w * 3.0 + vec3(0.0, uT * 0.06, 0.0));
  float b = 0.5 + 0.5 * sin(f * 26.0 + w.x * 6.0); float thin = smoothstep(0.82, 0.97, b), mid = smoothstep(0.35, 0.65, b);
  float ln = 1.0 - smoothstep(0.0, 0.06, abs(fract(f * 7.0 + w.y) - 0.5)), ln2 = 1.0 - smoothstep(0.0, 0.1, abs(fract(f * 4.0 - w.x * 2.0) - 0.5));
  vec3 pl = mix(vec3(1.35, 0.24, 0.03), vec3(1.5, 0.16, 0.5), smoothstep(0.44, 0.58, f)); pl = mix(pl, vec3(1.6, 0.85, 0.1), smoothstep(0.62, 0.76, w.x) * 0.5);
  pl = mix(pl, vec3(0.25, 1.4, 0.1), ln * 0.9); pl = mix(pl, vec3(1.7, 1.2, 0.25), ln2 * 0.2);
  vec3 wh = mix(vec3(1.35, 0.68, 0.06), vec3(1.7, 1.25, 0.22), smoothstep(0.38, 0.62, f)); wh = mix(wh, vec3(1.3, 0.38, 0.04), smoothstep(0.6, 0.8, m) * 0.7); wh = mix(wh, vec3(0.9, 1.4, 0.2), ln * 0.6);
  vec3 fin = mix(vec3(2.4, 2.0, 0.75), vec3(2.8, 2.6, 1.6), smoothstep(0.4, 0.6, f)); fin = mix(fin, vec3(1.5, 2.3, 0.45), ln * 0.75); fin = mix(fin, vec3(2.6, 1.4, 0.4), smoothstep(0.62, 0.8, m) * 0.5);
  vec3 col = vec3(0.004, 0.005, 0.012); col = mix(col, red, uRed); col = mix(col, pl, uPlasma); col = mix(col, wh, uWhite); col = mix(col, fin, uFin);
  gl_FragColor = vec4(col, 1.0);` + HEAT_TAIL + '}';

function buildHeat(st, S) { heatNoiseInit(); const H = (S.heat = {}), R = RNG('heat'), cam = st.cam;
  const puff = [0, 1, 2].map((k) => heatPuffTex(k + 1)), flame = heatFlameTex(), spark = glowTex();
  H.key0 = st.key.position.clone(); H.env0 = st.scene.environment;
  // environments (the light the sky throws on everything): night, red glow, plasma, white
  const env = (top, hor, sun, sc) => { const o = {}; skyEnv({ scene: o }, top, hor, sun, sc); return o.environment; }, sd = dirV(0, 12 * DEG);
  H.envs = [env('#020308', '#06070c', sd, '#000000'), env('#c02008', '#ff6a20', sd, '#ff4010'), env('#e05068', '#ffa040', sd, '#ffc070'), env('#ffc860', '#ff9a30', sd, '#ffe0a0')];
  // the sky dome (inside the day dome; drawn after it, at infinity)
  H.skyU = { uT: { value: 0 }, uRed: { value: 0 }, uBright: { value: 1 }, uPlasma: { value: 0 }, uWhite: { value: 0 }, uFin: { value: 0 } };
  H.sky = new THREE.Mesh(new THREE.SphereGeometry(20000, 64, 32), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: H.skyU,
    vertexShader: 'varying vec3 vD; void main(){ vD = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_Position = p.xyww; }', fragmentShader: HEAT_SKY_FS }));
  H.sky.renderOrder = -9; H.sky.frustumCulled = false; H.sky.visible = false; st.scene.add(H.sky);
  // steam over the fountain: from the whole basin, the inner tier and up the jets; a low mist later
  const FZ = ESP.FZ;
  H.steam = heatParts(st.scene, 420, { map: puff[0], rise: 7, grow: 2.4, wob: 1.6, wobF: 0.5, spin: 0.8, fin: 0.25, fout: 0.45, c0: [1.0, 0.86, 0.66], c1: [0.32, 0.33, 0.37], onDur: 1.2 }, (i) => {
    const a = R.r(0, TAU), r = i < 300 ? Math.sqrt(R.r(0.05, 1)) * 14.4 : R.r(0.5, 6), y = i < 300 ? (r < 6.2 ? 1.0 : 0.66) : R.r(1, 6);
    return [[Math.cos(a) * r, y, FZ + Math.sin(a) * r], [R.n(1.5), 0, R.n(1.5)], [R.f(), R.r(0.11, 0.2), R.r(1.4, 2.8), 46 + R.r(0, 1.2) + (r > 9 ? 0.4 : 0)]]; });
  H.mist = heatParts(st.scene, 160, { map: puff[1], rise: 1.2, grow: 1.6, wob: 2.5, wobF: 0.3, spin: 0.3, fin: 0.3, fout: 0.5, c0: [0.7, 0.62, 0.52], c1: [0.4, 0.4, 0.42] }, (i) => {
    const a = R.r(0, TAU), r = R.r(14, 34); return [[Math.cos(a) * r, 0.4, FZ + Math.sin(a) * r], [R.n(3), 0, R.n(3)], [R.f(), R.r(0.06, 0.1), R.r(3, 6), 48 + R.r(0, 2)]]; });
  // the trees burn: flames all over each cypress and in each palm crown; sparks; dark smoke
  const fl = [], sm = [], sk = [], tg = []; S.trees.forEach((T, ti) => { const ig = 49.95 + R.r(0, 0.8) + (T.x > 0 ? 0.3 : 0), cyp = T.kind === 'cyp', n = cyp ? 64 : 36;
    for (let k = 0; k < n; k++) { let p; if (cyp) { const a = R.r(0, TAU), y = R.r(-0.8, 0.95), rr = Math.sqrt(1 - y * y) * 1.45; p = [T.x + Math.cos(a) * rr, T.h * 0.5 + y * T.h * 0.5 * 0.85, T.z + Math.sin(a) * rr]; }
      else { const a = R.r(0, TAU), rr = k < 5 ? 0.2 : R.r(0.3, 2.6); p = k < 5 ? [T.x + R.n(0.3), R.r(2, 8), T.z + R.n(0.3)] : [T.x + Math.cos(a) * rr, 9.3 + R.r(-1, 0.8) - rr * 0.35, T.z + Math.sin(a) * rr]; }
      fl.push([p, ig + R.r(0, 0.5) + (cyp ? (1 - (p[1] / T.h)) * 0.3 : 0), cyp ? R.r(1.3, 2.8) : R.r(1.1, 2.2)]); }
    for (let k = 0; k < 3; k++) tg.push([[T.x, T.h * (0.3 + k * 0.28), T.z], ig + 0.2 + k * 0.25, T.h * 0.55]);
    for (let k = 0; k < 12; k++) sk.push([[T.x + R.n(1), R.r(2, T.h), T.z + R.n(1)], ig + 0.3]);
    for (let k = 0; k < 8; k++) sm.push([[T.x + R.n(1), T.h * R.r(0.7, 1.0), T.z + R.n(1)], ig + 0.4]); });
  // the benches round the fountain catch too
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + 0.3, x = Math.cos(a) * 18.5, z = FZ + Math.sin(a) * 18.5, ig = 50.4 + R.r(0, 1.2); for (let k = 0; k < 9; k++) fl.push([[x + R.n(0.8), 0.35, z + R.n(0.8)], ig, R.r(0.5, 0.9)]); sm.push([[x, 1, z], ig + 0.4]); }
  // the hillside below the balustrade burns (seen over the rail from the lookout)
  H.bush = IM(lumpyGeo(2, 0.35, 911), STDm({ color: '#140c08', roughness: 1 }), 46, false); for (let i = 0; i < 46; i++) { const s = R.r(1.6, 3); H.bush.setMatrixAt(i, M4c(-45 + i * 2 + R.n(0.8), -2.6 + R.r(0, 0.8), -83.5 - R.r(0, 5), R.r(0, 6), s * 1.3, s, s)); } H.bush.visible = false; st.scene.add(H.bush);
  for (let i = 0; i < 170; i++) { const p = [R.r(-46, 46), R.r(-2.2, 0.4), -83 - R.r(0, 6)]; fl.push([p, 51.2 + R.r(0, 2.2), R.r(1.6, 3.4)]); if (i % 4 === 0) sm.push([[p[0], 2, p[2]], 51.8 + R.r(0, 2)]); if (i % 2 === 0) sk.push([p, 51.5 + R.r(0, 2)]); }
  H.tFire = heatParts(st.scene, fl.length, { map: flame, add: true, pivot: true, rot: 0, rise: 0.9, shrink: 0.75, wob: 0.25, wobF: 9, fin: 0.08, fout: 0.35, stretch: 1.7, c0: [3.2, 2.0, 0.8], c1: [1.8, 0.35, 0.05], onDur: 0.6 },
    (i) => [fl[i][0], [R.n(0.2), 0, R.n(0.2)], [R.f(), R.r(1.2, 2.4), fl[i][2], fl[i][1]]]);
  H.tSpark = heatParts(st.scene, sk.length * 3, { map: spark, add: true, rise: 9, wob: 1.6, wobF: 3, fin: 0.05, fout: 0.5, c0: [3, 1.6, 0.4], c1: [2, 0.5, 0.05], onDur: 0.4 },
    (i) => { const s = sk[i % sk.length]; return [s[0], [R.n(2.5), 0, R.n(2.5)], [R.f(), R.r(0.35, 0.7), R.r(0.08, 0.18), s[1]]]; });
  H.tSmoke = heatParts(st.scene, sm.length * 4, { map: puff[2], rise: 16, grow: 3.5, wob: 3, wobF: 0.4, spin: 0.6, fin: 0.12, fout: 0.4, c0: [0.09, 0.07, 0.06], c1: [0.16, 0.15, 0.15], onDur: 1 },
    (i) => { const s = sm[i % sm.length]; return [s[0], [R.r(-1, 2), 0, R.n(1.5)], [R.f(), R.r(0.12, 0.2), R.r(1.6, 3), s[1]]]; });
  H.tGlow = heatParts(st.scene, tg.length, { map: spark, add: true, rot: 0, fin: 0.0001, fout: 0.9999, c0: [1.2, 0.36, 0.06], onDur: 0.8 }, (i) => [tg[i][0], [0, 0, 0], [R.f(), 0.0001, tg[i][2], tg[i][1]]]);
  // the city below catches fire: flames, a glow and smoke on hundreds of rooftops
  let cityIM = null; st.scene.traverse((o) => { if (o.isInstancedMesh && S.cityM.includes(o.material)) cityIM = o; });
  const cf = [], m4 = new THREE.Matrix4(), pp = new THREE.Vector3(), qq = new THREE.Quaternion(), sc = new THREE.Vector3();
  if (cityIM) for (let i = 0; i < cityIM.count; i++) { if (R.f() > 0.32) continue; cityIM.getMatrixAt(i, m4); m4.decompose(pp, qq, sc); cf.push({ x: pp.x, y: pp.y + sc.y, z: pp.z, w: Math.min(sc.x, sc.z), ig: 50.2 + R.r(0, 3.5) * (0.4 + 0.6 * R.f()) }); }
  H.cFire = heatParts(st.scene, cf.length * 4, { map: flame, add: true, pivot: true, rot: 0, rise: 4, shrink: 0.7, fin: 0.08, fout: 0.35, stretch: 1.6, c0: [3.4, 2.1, 0.8], c1: [2.0, 0.4, 0.05], onDur: 1 },
    (i) => { const c = cf[i >> 2]; return [[c.x + R.n(c.w * 0.35), c.y - 0.5, c.z + R.n(c.w * 0.35)], [0, 0, 0], [R.f(), R.r(0.9, 1.8), c.w * R.r(0.35, 0.7), c.ig + R.r(0, 0.4)]]; });
  H.cGlow = heatParts(st.scene, cf.length, { map: spark, add: true, rot: 0, fin: 0.0001, fout: 0.9999, c0: [1.4, 0.45, 0.08], onDur: 1.2 }, (i) => { const c = cf[i]; return [[c.x, c.y + c.w * 0.3, c.z], [0, 0, 0], [R.f(), 0.0001, c.w * 3.2, c.ig]]; });
  H.cSmoke = heatParts(st.scene, Math.floor(cf.length / 2) * 2, { map: puff[1], rise: 70, grow: 3, wob: 12, wobF: 0.3, spin: 0.4, fin: 0.15, fout: 0.4, c0: [0.1, 0.06, 0.05], c1: [0.14, 0.12, 0.12], onDur: 1.5 },
    (i) => { const c = cf[(i >> 1) * 2]; return [[c.x, c.y + 4, c.z], [R.r(-5, 25), 0, R.n(10)], [R.f(), R.r(0.1, 0.18), c.w * R.r(1.2, 2), c.ig + 0.5]]; });
  // embers drifting in the air at the lookout
  H.air = heatParts(st.scene, 360, { map: spark, add: true, rise: 7, wob: 2.5, wobF: 1.3, fin: 0.1, fout: 0.6, c0: [3, 1.5, 0.4], c1: [1.6, 0.4, 0.05], onDur: 1 },
    (i) => [[R.r(-30, 30), R.r(-3, 10), R.r(-90, -50)], [R.r(-2, 4), 0, R.n(3)], [R.f(), R.r(0.15, 0.3), R.r(0.05, 0.12), 52 + R.r(0, 3)]]);
  // fire lights (always in the scene, so the light count never changes)
  H.fl = [0, 1, 2].map(() => { const L = new THREE.PointLight('#ff7a30', 0, 45, 1.4); st.scene.add(L); return L; });
  H.hl = new THREE.PointLight('#ffd0a0', 0, 2.5, 1.2); cam.add(H.hl);
  // ---- held in your hand (children of the camera): the brochure, its fire, the hand and a sleeve
  const hold = (H.hold = new THREE.Group()); hold.visible = false; cam.add(hold);
  H.paperU = { uN: { value: HNT }, uMap: { value: heatBrochureTex() }, uBrown: { value: -1 }, uChar: { value: -1 }, uBurn: { value: -1 }, uGlow: { value: 0 }, uT: { value: 0 }, uLight: { value: new THREE.Color() }, uFireL: { value: new THREE.Color() } };
  const paper = (H.paper = new THREE.Mesh(new THREE.PlaneGeometry(HP.W, HP.H, 28, 48), new THREE.ShaderMaterial({ uniforms: H.paperU, side: THREE.DoubleSide,
    vertexShader: HEAT_PF_GLSL + `uniform float uBurn; varying vec2 vUv; varying float vF;
      void main(){ vUv = uv; float f = PF(uv); vF = f; vec3 p = position; float k = clamp((uBurn + 0.16 - f) / 0.16, 0.0, 1.0);
        p.z += k * k * 0.018 + 0.006 * (1.0 - 4.0 * (uv.x - 0.5) * (uv.x - 0.5)); p.xy -= normalize(p.xy + 1e-4) * k * k * 0.006;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader: HEAT_PF_GLSL + `uniform sampler2D uMap; uniform float uBrown, uChar, uBurn, uGlow, uT; uniform vec3 uLight, uFireL; varying vec2 vUv; varying float vF;
      void main(){ float f = PF(vUv); if (f < uBurn) discard; vec3 c = texture2D(uMap, vUv).rgb;
        float br = smoothstep(uBrown, uBrown - 0.28, f); c = mix(c, dot(c, vec3(0.3, 0.55, 0.15)) * vec3(0.72, 0.56, 0.4), br * 0.85); c = mix(c, vec3(0.16, 0.09, 0.04), smoothstep(uBrown - 0.12, uBrown - 0.42, f));
        float ch = smoothstep(uChar + 0.02, uChar - 0.05, f); c = mix(c, vec3(0.025, 0.018, 0.014), ch);
        vec3 col = c * (uLight + uFireL * (0.4 + 0.6 * smoothstep(uBurn + 0.35, uBurn, f)));
        float e = 1.0 - smoothstep(0.0, 0.03, f - uBurn), fl = 0.55 + 0.45 * hN(vUv * vec2(0.25, 0.4) + vec2(uT * 0.02, -uT * 0.05));
        float sp = smoothstep(0.62, 0.85, hN(vUv * vec2(0.5, 0.85) + vec2(0.3, uT * 0.004))) * ch * smoothstep(uBurn + 0.14, uBurn, f);
        float sm = smoothstep(uChar + 0.1, uChar, f) * (1.0 - ch) * smoothstep(0.6, 0.8, hN(vUv * vec2(0.35, 0.6) + vec2(uT * 0.006, 0.0)));
        col += vec3(3.4, 1.0, 0.18) * uGlow * (e * fl * 1.4 + sp * 1.6 + sm * 0.5); gl_FragColor = vec4(col, 1.0);` + HEAT_TAIL + '}' })));
  paper.position.set(0.006, -0.088, -0.36); paper.rotation.set(-0.5, -0.06, 0.05); paper.castShadow = false; paper.receiveShadow = false; hold.add(paper); paper.updateMatrix();
  // the paper's fire: flames, embers and smoke that live on its burn front (band mode: aP.w = the burn field there)
  const pts = []; for (let j = 0; j < 60; j++) for (let i = 0; i < 36; i++) { const u = (i + R.f()) / 36, v = (j + R.f()) / 60; pts.push([new THREE.Vector3((u - 0.5) * HP.W, (v - 0.5) * HP.H, 0.004).applyMatrix4(paper.matrix), heatPF(u, v)]); }
  const pick = (n) => Array.from({ length: n }, () => pts[Math.floor(R.f() * pts.length)]);
  const pf = pick(700), pe = pick(260), ps = pick(160);
  H.pFire = heatParts(hold, pf.length, { map: flame, add: true, pivot: true, rot: 0, band: true, bandW: 0.12, rise: 0.012, shrink: 0.6, wob: 0.004, wobF: 11, fin: 0.06, fout: 0.3, stretch: 1.9, c0: [3.0, 1.9, 0.7], c1: [1.7, 0.3, 0.04], ro: 3 },
    (i) => [pf[i][0].toArray(), [0, 0, 0], [R.f(), R.r(2.2, 4), R.r(0.008, 0.02), pf[i][1]]]);
  H.pEmb = heatParts(hold, pe.length, { map: spark, add: true, band: true, bandW: 0.25, rise: 0.16, wob: 0.03, wobF: 4, fin: 0.05, fout: 0.5, c0: [3, 1.6, 0.4], c1: [2, 0.4, 0.05], ro: 4 },
    (i) => [pe[i][0].toArray(), [R.n(0.04), 0, R.r(0, 0.06)], [R.f(), R.r(0.6, 1.2), R.r(0.0015, 0.0035), pe[i][1]]]);
  H.pSmoke = heatParts(hold, ps.length, { map: puff[2], band: true, bandW: 0.35, rise: 0.22, grow: 3, wob: 0.04, wobF: 1, spin: 0.8, fin: 0.15, fout: 0.4, c0: [0.25, 0.2, 0.17], c1: [0.12, 0.11, 0.11], ro: 2 },
    (i) => [ps[i][0].toArray(), [R.n(0.03), 0, R.r(0, 0.05)], [R.f(), R.r(0.4, 0.8), R.r(0.02, 0.04), ps[i][1]]]);
  // the hand + a sleeve; all its materials remembered so it can turn into a silhouette against the glare
  const HD = (H.hand = makeHand(1, { sleeve: '#2a3a5a' })); hold.add(HD.root);
  H.sleeve = mesh(new THREE.CylinderGeometry(0.05, 0.068, 0.8, 20, 1, true).translate(0, -0.66, 0), STDm({ color: '#2a3a5a', roughness: 0.9, side: THREE.DoubleSide })); H.sleeve.scale.set(1.25, 1, 0.9); HD.fore.add(H.sleeve);
  H.cuff = mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 24).rotateX(Math.PI / 2), H.sleeve.material, 0, -0.27, 0); H.cuff.scale.set(1.25, 1, 0.9); HD.fore.add(H.cuff);
  H.hm = []; HD.root.traverse((m) => { if (m.isMesh) { m.castShadow = false; (Array.isArray(m.material) ? m.material : [m.material]).forEach((mt) => { if (!H.hm.find((e) => e.m === mt)) H.hm.push({ m: mt, c: mt.color.clone(), s: mt.sheenColor ? mt.sheenColor.clone() : null }); }); } });
  // glare: a veil 0.9 m in front of you (behind the raised hand, so the hand stays a crisp silhouette)
  H.glareU = { uA: { value: 0 }, uC: { value: new THREE.Color() } };
  H.glare = new THREE.Mesh(new THREE.PlaneGeometry(2, 2.6), new THREE.ShaderMaterial({ uniforms: H.glareU, transparent: true, depthWrite: false, fog: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; varying vec2 vUv; void main(){ float r = length((vUv - vec2(0.5, 0.62)) * vec2(1.0, 1.3)); gl_FragColor = vec4(uC, uA * (1.0 - 0.55 * smoothstep(0.0, 0.7, r)));' + HEAT_TAIL + '}' }));
  H.glare.position.set(0, 0, -0.9); H.glare.renderOrder = 20; H.glare.visible = false; cam.add(H.glare);
  // people at the balustrade (crowd slots), fixed per index
  H.rail = []; for (let i = 0; i < 64; i++) H.rail.push({ x: -26 + i * 0.82 + R.n(0.25), z: -77.3 - (i % 3) * 0.7 - R.r(0, 0.5), yaw: Math.PI + R.n(0.35), up: R.f() < 0.25 ? R.r(0.3, 0.8) : 0 });
}

// orient an object: its +Y along `up`, its +Z as close as possible to `back`
const _hx = new THREE.Vector3(), _hy = new THREE.Vector3(), _hz = new THREE.Vector3(), _hm = new THREE.Matrix4();
function heatOrient(o, up, back) { _hy.copy(up).normalize(); _hz.copy(back).addScaledVector(_hy, -back.dot(_hy)).normalize(); _hx.crossVectors(_hy, _hz); _hm.makeBasis(_hx, _hy, _hz); o.quaternion.setFromRotationMatrix(_hm); }
const heatFlick = (t, s) => 0.72 + 0.16 * Math.sin(t * 17.3 + s) + 0.12 * Math.sin(t * 29.1 + s * 2.3);

function poseHeat(S, t, cam) { const H = S.heat; if (!H) return; const st = S.st, T = typeof TT === 'number' ? TT : t, on = t >= 43;
  // camera-held things: the brochure only in its two shots, the raised hand only in the last one
  const holdShot = (T >= 43 && T < 46 || T >= 48 && T < 50) && on, handShot = T >= 60 && T < 62 && on;
  H.sky.visible = on; st.scene.environment = !on ? H.env0 : H.envs[t < 52 ? 0 : t < 56 ? 1 : t < 58 ? 2 : 3];
  if (!on) { st.key.position.copy(H.key0); }
  const red = ss(51.4, 53.6, t), hot = ss(52.5, 56, t), pl = ss(55.7, 56.7, t) * (1 - ss(57.6, 59, t)), wh = ss(57.6, 59.2, t), fin = ss(59.6, 61.8, t);
  // ---- the sky and the light it throws
  const U = H.skyU; U.uT.value = t; U.uRed.value = red; U.uBright.value = lerp(0.45, 1.25, hot); U.uPlasma.value = pl; U.uWhite.value = wh; U.uFin.value = fin;
  if (on) { const k = red, hemiC = C3(C3('#ff5a24', '#ff9a50', hot), '#ffb850', wh), keyC = C3(C3('#ff4a1c', '#ff8a50', pl), '#ffd890', wh);
    S.fpl.intensity *= lerp(0.5, 1, k); st.hemi.color.lerp(hemiC, k); st.hemi.groundColor.lerp(lin('#3a1206'), k); st.hemi.intensity = lerp(st.hemi.intensity * (t < 52 ? 0.7 : 1), lerp(0.75, 1.15, hot) + 0.2 * wh + 0.5 * fin, k);
    st.key.color.lerp(keyC, k); st.key.intensity = lerp(st.key.intensity, lerp(1.6, 3.2, hot) + 0.5 * wh + 0.8 * fin, k);
    st.key.position.copy(st.key.target.position).addScaledVector(_hy.set(0, lerp(0.24, 0.42, wh), -1).normalize(), 300);
    const fog = st.scene.fog; fog.color.lerp(C3(C3('#3a0804', '#8a2a10', hot), '#e0a050', wh), k); fog.near = lerp(fog.near, 120, k); fog.far = lerp(fog.far, lerp(2600, 1800, wh), k);
    S.seaM.color.lerp(lin('#2a0602'), k); }
  // ---- steam, mist
  const steam = ss(46, 47.4, t) * (1 - 0.5 * ss(56, 60, t)); heatSet(H.steam, t, on ? steam * 0.62 : 0); H.steam.U.uC0.value.copy(C3('#ffe2b8', '#ff7a40', red)).multiplyScalar(lerp(1.1, 1.6, red)); H.steam.U.uC1.value.copy(C3('#5a5c64', '#a04a28', red)).multiplyScalar(lerp(0.55, 1.4, wh + red * 0.5));
  heatSet(H.mist, t, on ? ss(48, 51, t) * 0.25 : 0);
  // ---- fires: trees, benches, hillside, city; sparks, smoke, embers in the air
  const fire = on && t >= 50 ? 1 : 0; [H.tFire, H.tSpark, H.cFire, H.cGlow].forEach((P) => heatSet(P, t, fire)); heatSet(H.tGlow, t, fire * 0.8 * heatFlick(t, 6));
  heatSet(H.tSmoke, t, fire * 0.55 * (1 - 0.6 * hot) * (1 - 0.8 * pl) * (1 - 0.9 * wh)); heatSet(H.cSmoke, t, fire * 0.3 * (1 - 0.6 * hot) * (1 - pl) * (1 - wh));
  [H.tSmoke, H.cSmoke].forEach((P) => { P.U.uC0.value.copy(C3('#171310', '#5a2410', red)); P.U.uC1.value.copy(C3('#2a2828', '#8a4a2a', red)); }); heatSet(H.air, t, on && t >= 52 ? 1 : 0); H.bush.visible = on && t >= 50;
  H.cGlow.U.uC0.value.setRGB(1.4, 0.45, 0.08).multiplyScalar(lerp(1, 0.4, wh));
  // the trees char as they burn (the shared cypress material)
  const cy = S.trees[0] && S.trees[0].m && S.trees[0].m.material; if (cy) { if (!H.cyC) H.cyC = cy.color.clone(); const ch = on ? ss(50.3, 52.5, t) : 0; cy.color.copy(H.cyC).lerp(lin('#070403'), ch); cy.emissive.setRGB(0.12, 0.02, 0.0).multiplyScalar(ch * heatFlick(t, 3)); }
  // fire lights: on the trees on your left, then on the hillside below the rail
  const fl = fire * ss(50.1, 50.9, t); H.fl[0].position.set(-36, 6, -22); H.fl[1].position.set(-36, 6, -44); H.fl[2].position.set(0, 2, -86);
  H.fl[0].intensity = 3.2 * fl * heatFlick(t, 1); H.fl[1].intensity = 3.2 * fl * heatFlick(t, 2); H.fl[2].intensity = 2.5 * fire * ss(51.5, 53, t) * heatFlick(t, 4) * (1 - wh);
  // ---- the brochure in your hand
  H.hold.visible = holdShot || handShot; H.paper.visible = holdShot; const HD = H.hand;
  const brown = lerp(-0.45, 0.8, ss(47.9, 49.7, t)), char = lerp(-0.45, 0.6, ss(48.55, 50, t)), burn = lerp(-0.5, 0.5, EZ.i2(seg(t, 48.95, 50.05))), glow = ss(48.6, 49.0, t), blaze = ss(49.0, 49.4, t);
  if (holdShot) { const P = H.paperU; P.uBrown.value = brown; P.uChar.value = char; P.uBurn.value = burn; P.uGlow.value = glow * heatFlick(t, 7); P.uT.value = t;
    P.uLight.value.setRGB(0.42, 0.38, 0.32); P.uFireL.value.setRGB(0.9, 0.42, 0.14).multiplyScalar(blaze * heatFlick(t, 5));
    heatSet(H.pFire, t, blaze); heatSet(H.pEmb, t, glow); heatSet(H.pSmoke, t, glow * 0.7); [H.pFire, H.pEmb, H.pSmoke].forEach((Q) => (Q.U.uFront.value = burn));
    H.hl.position.set(0.05, 0.02, -0.1); H.hl.color.copy(C3('#ffe6cc', '#ffb070', blaze)); H.hl.intensity = 0.35 + 1.1 * blaze * heatFlick(t, 9);
    // the hand: wrist below the bottom-right corner, fingers up behind the paper, the thumb across its front
    const pm = H.paper.matrix, D = [0.02, -0.14, -0.01, -0.2, 0.9, -0.3]; HD.root.position.set(D[0], D[1], D[2]).applyMatrix4(pm); heatOrient(HD.root, _v.set(D[3], 1, 0).transformDirection(pm), new THREE.Vector3(D[5], 0, 1).transformDirection(pm));
    poseHand(HD, { curl: [0.0, 0.0, 0.02, 0.05], spread: 0.2, thumb: D[4], wristPitch: 0.0, tremble: 0.3 + glow });
  } else { [H.pFire, H.pEmb, H.pSmoke].forEach((Q) => heatSet(Q, t, 0)); H.hl.intensity = 0; }
  // ---- your raised hand against the glare (60–62): from the bottom right, open, a black silhouette
  if (handShot) { const u = ss(60, 60.9, t); HD.root.position.set(lerp(0.22, 0.05, u), lerp(-0.5, -0.03, u), -0.68);
    heatOrient(HD.root, _v.set(-0.42, 0.9, -0.12), new THREE.Vector3(-0.1, -0.1, -1)); poseHand(HD, { curl: [0.04, 0.02, 0.05, 0.1], spread: -1.8, thumb: -0.3, wristPitch: -0.15, wristRoll: 0.1, tremble: 0.6 }); }
  const sil = handShot ? 1 : 0; H.hm.forEach((e) => { e.m.color.copy(e.c).multiplyScalar(1 - 0.995 * sil); e.m.envMapIntensity = 1 - 0.85 * sil; if (e.s) e.m.sheenColor.copy(e.s).multiplyScalar(1 - sil); });
  // ---- the glare
  const ga = on ? 0.22 * fin : 0; H.glare.visible = ga > 0.001; H.glareU.uA.value = ga; H.glareU.uC.value.setRGB(1.3, 1.1, 0.45);
  // ---- people come to the balustrade to watch (52+); nobody runs any more
  if (on && t >= 52) { const ts = 8 + (t - 8) / 14, emo = { fear: 0.6, open: 0.5 }, up = -0.15 - 0.2 * wh;
    posePerson(S.dad, { x: -1.4, z: -76.6, yaw: Math.PI + 0.08, ph: ts * 5, headPitch: up, armL: [0.2, 0.2, 0.3], armR: [0.25, 0.15, 0.3], emo }); S.dad.root.updateMatrixWorld(true);
    { const n = new THREE.Vector3(); S.dad.neck.getWorldPosition(n); posePerson(S.kid, { x: n.x, y: n.y - 0.48, z: n.z + 0.05, yaw: Math.PI + 0.08, sit: 1, legL: [-1.3, 1.7], legR: [-1.3, 1.7], armL: [2.6, 0.4, 0.3], armR: [2.9, 0.3, 0.5], headPitch: up - 0.2, emo: { surprise: 1, open: 0.7 } }); }
    posePerson(S.mom, { x: 0.3, z: -77.0, yaw: Math.PI - 0.12, ph: ts * 5 + 1, headPitch: up, armR: [1.6, 0.2, 0.9], emo });
    posePerson(S.bubbleMan, { x: -4.6, z: -77.2, yaw: Math.PI + 0.2, headPitch: up, armL: [0.3, 0.1, 0.3], emo });
    S.others.forEach((p, i) => posePerson(p, { x: [2.4, 4.0, 5.4, -3.0][i], z: [-77.6, -76.8, -77.4, -76.2][i], yaw: Math.PI + [0.1, -0.2, 0.3, -0.1][i], walk: 0, run: 0, headPitch: up, armL: i === 1 ? [2.2, 0.3, 0.8] : undefined, emo }));
    H.rail.forEach((c, i) => S.crowd.set(i, c.x, 0, c.z, c.yaw, 1, c.up, 0.02 * Math.sin(ts * 2 + i))); S.crowd.done(); }
}

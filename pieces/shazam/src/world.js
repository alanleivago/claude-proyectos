// =====================================================================
//  WORLD — "Cómo te reconoce Shazam" (three.js r149). Places: the data stage (origin: the recording as a field of
//  columns that morphs from grey waveform ribbons to a coloured spectrogram, the peaks, the links), the song database
//  (z far back: many long fields), and the taquería (x = 100, pov3d people at tables).
//  Field: NT time columns × NF frequency rows, 0.1 m apart; t along +x, frequency along −z (low at front).
// =====================================================================
const NT = 120, NF = 36, DX = 0.1, DZ = 0.1;
const FX0 = -NT * DX / 2, FZ0 = NF * DZ / 2;
const fxp = (i) => FX0 + i * DX, fzp = (j) => FZ0 - j * DZ;
// the song: bass on beats (rows 2-5), a vocal line wandering (rows 12-24), drums broadband on 2 and 4, a hiss floor
function songVal(i, j, seed = 0, noise = 0) {
  const R = RNG('sv', seed, i, j), t = i * 0.05 + seed * 3.1, beat = (i + seed * 5) % 10;
  const bass = (j >= 2 && j <= 5 ? 1 : 0) * Math.exp(-beat * 0.5) * (0.8 + 0.2 * Math.sin(seed + j));
  const vf = 17 + 5 * Math.sin(t * 1.3 + seed) + 2 * Math.sin(t * 3.7 + seed * 2), vocal = Math.exp(-((j - vf) ** 2) / 3) * (0.6 + 0.4 * Math.sin(t * 2.1)) + 0.45 * Math.exp(-((j - vf * 1.5) ** 2) / 4);
  const drum = ((i + seed * 3) % 20 === 5 || (i + seed * 3) % 20 === 15 ? 1 : 0) * (0.5 + 0.5 * (j / NF)) * 0.75;
  const talk = noise * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.31 + j * 0.7))) * Math.exp(-((j - 14) ** 2) / 60);
  return clamp(bass + vocal + drum + 0.08 * R.f() + talk, 0, 1.6);
}
const SONG = []; for (let i = 0; i < NT; i++) { SONG[i] = []; for (let j = 0; j < NF; j++) SONG[i][j] = songVal(i, j, 0, 0); }
// the peaks: local maxima above a cut, strongest first
const PEAKS = (() => { const P = []; for (let i = 1; i < NT - 1; i++) for (let j = 1; j < NF - 1; j++) { const v = SONG[i][j]; let m = true; for (let a = -2; a <= 2 && m; a++) for (let b = -2; b <= 2; b++) { if (!a && !b) continue; const ii = i + a, jj = j + b; if (ii >= 0 && ii < NT && jj >= 0 && jj < NF && SONG[ii][jj] > v) { m = false; break; } } if (m && v > 0.6) P.push({ i, j, v }); }
  return P.sort((a, b) => b.v - a.v).slice(0, 80).sort((a, b) => a.i - b.i); })();
// links: each peak to up to 3 later peaks in its target zone (1-10 columns later, ±8 rows)
const LINKS = (() => { const L = []; PEAKS.forEach((p, k) => { let n = 0; for (let q = k + 1; q < PEAKS.length && n < 3; q++) { const d = PEAKS[q].i - p.i; if (d < 1) continue; if (d > 10) break; if (Math.abs(PEAKS[q].j - p.j) <= 8) { L.push([k, q]); n++; } } }); return L; })();
const peakPos = (p, h) => V3(fxp(p.i), h, fzp(p.j));
const HMAX = 0.9;

let G = null;
function g3() {
  if (G) return G;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.background = lin('#07090f'); scene.fog = new THREE.Fog(lin('#07090f'), 12, 60);
  const cam = new THREE.PerspectiveCamera(40, W / H, 0.01, 400); scene.add(cam);
  scene.add(new THREE.HemisphereLight(0x9aa6d8, 0x10101a, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.3); key.position.set(-4, 8, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 }); scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x6ad8e0, 0.5); rim.position.set(6, 3, -8); scene.add(rim);
  // the floor grid (data stage)
  { const p = []; for (let i = -60; i <= 60; i++) p.push(i * 0.5, -0.01, -60, i * 0.5, -0.01, 30, -30, -0.01, i * 0.5, 30, -0.01, i * 0.5); const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); scene.add(new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: lin('#141a2a'), toneMapped: false }))); }
  // the field: one column per cell
  const field = new THREE.InstancedMesh(new THREE.BoxGeometry(DX * 0.82, 1, DZ * 0.82), new THREE.MeshStandardMaterial({ color: lin('#ffffff'), roughness: 0.55, metalness: 0.05 }), NT * NF);
  { const c = new THREE.Color('#a8a8c8'); for (let k = 0; k < NT * NF; k++) field.setColorAt(k, c); }   // colours from the start, so every renderer compiles the shader with them (else frames flash white)
  field.castShadow = true; field.receiveShadow = true; scene.add(field);
  // the database: 7 long songs behind and around (lower resolution), and a corridor of them
  const DB = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1, 0.16), new THREE.MeshStandardMaterial({ color: lin('#ffffff'), roughness: 0.6 }), 7 * 160 * 10);
  { const m = new THREE.Matrix4(), c = new THREE.Color(); let k = 0; for (let s = 0; s < 7; s++) for (let i = 0; i < 160; i++) for (let j = 0; j < 10; j++, k++) { const v = songVal(i * 2, j * 3.6, s + 1), x = -16 + i * 0.2, z = -4 - s * 3.2 - j * 0.2, h = 0.05 + v * 0.7;
    m.compose(V3(x, h / 2, z), new THREE.Quaternion(), V3(1, h, 1)); DB.setMatrixAt(k, m); DB.setColorAt(k, c.set('#8a8ab0').lerp(lin('#d8d8f0'), v * 0.5)); } }
  DB.visible = false; scene.add(DB);
  // peaks: stems + glowing heads; links: one line-segments buffer drawn as far as a count
  const stemM = new THREE.MeshBasicMaterial({ color: lin('#f6e08a'), transparent: true, opacity: 0.8, toneMapped: false });
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), stemM, PEAKS.length); scene.add(stems);
  const headM = new THREE.MeshBasicMaterial({ color: lin('#fff2b0'), toneMapped: false }), heads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.03, 14, 10), headM, PEAKS.length); scene.add(heads);
  const ringM = new THREE.MeshBasicMaterial({ color: lin('#fff2b0'), transparent: true, opacity: 0.6, toneMapped: false, side: THREE.DoubleSide }), rings = new THREE.InstancedMesh(new THREE.RingGeometry(0.045, 0.055, 24), ringM, PEAKS.length); scene.add(rings);
  const linkG = new THREE.BufferGeometry(); linkG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(LINKS.length * 6), 3));
  const linkM = new THREE.LineBasicMaterial({ color: lin('#e8e4ff'), transparent: true, opacity: 0.7, toneMapped: false }), links = new THREE.LineSegments(linkG, linkM); scene.add(links);
  // a second constellation (the database song) for the matches, green
  const linkG2 = new THREE.BufferGeometry(); linkG2.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(LINKS.length * 6), 3));
  const link2M = new THREE.LineBasicMaterial({ color: lin('#3ce8a0'), transparent: true, opacity: 0.85, toneMapped: false }), links2 = new THREE.LineSegments(linkG2, link2M); scene.add(links2);
  const heads2 = new THREE.InstancedMesh(new THREE.SphereGeometry(0.028, 12, 8), new THREE.MeshBasicMaterial({ color: lin('#3ce8a0'), toneMapped: false }), PEAKS.length); scene.add(heads2);
  // the cut-off plane, the target zone box, the match bar, offset bars
  const cutP = new THREE.Mesh(new THREE.PlaneGeometry(NT * DX + 0.4, NF * DZ + 0.4), new THREE.MeshBasicMaterial({ color: lin('#7ad8ff'), transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, toneMapped: false })); cutP.rotation.x = -Math.PI / 2; scene.add(cutP);
  const zone = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 0.02, 1)), new THREE.LineBasicMaterial({ color: lin('#7ad8ff'), toneMapped: false })); scene.add(zone);
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.16, 1, 0.16), new THREE.MeshStandardMaterial({ color: lin('#8a92b0'), roughness: 0.5 }), 24); scene.add(bars);
  const bigBar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1, 0.22), new THREE.MeshStandardMaterial({ color: lin('#3ce8a0'), emissive: lin('#0a5a3a'), emissiveIntensity: 0.6, roughness: 0.4 })); scene.add(bigBar);
  // flying keys (fingerprints) for the send shot
  const keys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 0.02, 0.06), new THREE.MeshBasicMaterial({ color: lin('#fff2b0'), toneMapped: false }), 60); scene.add(keys);
  const server = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: lin('#1e2433'), roughness: 0.4, metalness: 0.5 }); for (let k = 0; k < 3; k++) { const b = mesh(new THREE.BoxGeometry(0.9, 1.6, 0.6), m, (k - 1) * 1.1, 0.8, 0); server.add(b); for (let l = 0; l < 8; l++) server.add(mesh(new THREE.BoxGeometry(0.6, 0.02, 0.01), basic(l % 3 ? '#3ce8a0' : '#7ad8ff'), (k - 1) * 1.1, 0.25 + l * 0.17, 0.31, { cast: false })); } }
  server.position.set(0, 0, -14); scene.add(server);
  // ---- the taquería (x = 100)
  const TX = 100, taq = new THREE.Group();
  const floorT = g3Tex((x, w) => { x.fillStyle = '#b8653a'; x.fillRect(0, 0, w, w); const R = RNG('tile'); for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { x.fillStyle = hexMix('#a8552a', '#c87848', R.f()); x.fillRect(a * 64 + 2, b * 64 + 2, 60, 60); } }, 512, 512, [6, 6]);
  taq.add(mesh(new THREE.PlaneGeometry(12, 12), std('#ffffff', { map: floorT, r: 0.8 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false }));
  const wallT = g3Tex((x, w, h) => { x.fillStyle = '#2a8a7a'; x.fillRect(0, 0, w, h); x.fillStyle = '#e8d8b8'; x.fillRect(0, h * 0.62, w, h * 0.38); x.fillStyle = '#c84a3a'; x.fillRect(0, h * 0.6, w, h * 0.03); }, 256, 256, [3, 1]);
  const wallM = std('#ffffff', { map: wallT, r: 0.9 }); taq.add(mesh(new THREE.PlaneGeometry(12, 3.2), wallM, 0, 1.6, -3, { cast: false })); taq.add(mesh(new THREE.PlaneGeometry(8, 3.2), wallM, -4, 1.6, 1, { ry: Math.PI / 2, cast: false }));
  // papel picado: little flags on strings
  { const cols = ['#e8283a', '#f0c33c', '#3cae5c', '#2f6fd1', '#e86fa8', '#ef8a3a'], R = RNG('pp'); for (let s = 0; s < 3; s++) for (let k = 0; k < 18; k++) { const x = -3.6 + k * 0.42, y = 2.75 - 0.18 * Math.sin((k / 17) * Math.PI) - s * 0.05, z = -2.2 + s * 1.4;
    taq.add(mesh(new THREE.PlaneGeometry(0.28, 0.32), new THREE.MeshStandardMaterial({ color: lin(R.pick(cols)), side: THREE.DoubleSide, roughness: 0.8 }), x, y - 0.16, z, { cast: false })); } }
  // the speaker (left wall, up)
  const spk = new THREE.Group(); spk.add(mesh(new THREE.BoxGeometry(0.4, 0.6, 0.32), std('#1a1a1e', { r: 0.5 }))); spk.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 24), std('#3a3a40', { r: 0.4 }), 0, -0.06, 0.17, { rx: Math.PI / 2 })); spk.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 16), std('#3a3a40'), 0, 0.17, 0.17, { rx: Math.PI / 2 }));
  spk.position.set(-3.7, 2.3, -1.2); spk.rotation.y = Math.PI / 2.6; taq.add(spk);
  // tables (round) with plates, glasses, salsas; seated people
  const tables = [[-1.6, -1.4], [0.9, -1.6], [-0.2, 0.6], [2.2, 0.3]], people = [];
  const wood = std('#6a4a30', { r: 0.6 }), plateM = std('#f4f0e8', { r: 0.3 }), red = std('#c8281e', { r: 0.4 }), green = std('#3a8a3a', { r: 0.4 });
  tables.forEach(([x, z], ti) => { taq.add(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.04, 28), wood, x, 0.74, z)); taq.add(mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.72, 10), wood, x, 0.36, z));
    for (let k = 0; k < 2; k++) { const a = ti + k * Math.PI, px = x + Math.cos(a) * 0.25, pz = z + Math.sin(a) * 0.25; taq.add(mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.02, 20), plateM, px, 0.77, pz)); taq.add(mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 12), std('#d8e8f0', { r: 0.1, tr: true, op: 0.7 }), px + 0.14, 0.82, pz)); }
    taq.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), red, x - 0.05, 0.81, z)); taq.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 10), green, x + 0.05, 0.81, z));
    for (let k = 0; k < 2; k++) { const a = ti * 0.7 + k * Math.PI + Math.PI / 2, sx = x + Math.cos(a) * 0.78, sz = z + Math.sin(a) * 0.78;
      taq.add(mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 16), std('#8a5a3a'), sx, 0.45, sz)); taq.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 8), std('#3a3a40'), sx, 0.22, sz));
      const p = randomPerson(ti * 2 + k + 3, { seated: true }); p.position.set(TX + sx, p.position.y + 0.03, sz); p.rotation.y = Math.atan2(x - sx, z - sz); scene.add(p); people.push(p); } });
  // the phone on the middle table (screen up) + a waiter standing
  const waiter = randomPerson(41, { shirt: '#f4f1ea', pants: '#1f2d3d' }); waiter.position.set(TX + 2.6, 0, -2.0); waiter.rotation.y = -0.6; scene.add(waiter); people.push(waiter);
  taq.position.set(TX, 0, 0); scene.add(taq);
  // the reference's look for this place: everything a cool grey (people included), only the sound lines in colour
  const greyOut = (root) => root.traverse((o) => { if (!o.isMesh || !o.material || !o.material.color) return; const m = o.material = o.material.clone(), c = m.color, L = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
    m.map = m.map === PPL_T ? m.map : null; m.color = new THREE.Color().setRGB(0.05 + L * 0.3, 0.055 + L * 0.3, 0.075 + L * 0.36); if (m.emissive) m.emissive.set('#000000'); m.needsUpdate = true; });
  greyOut(taq); people.forEach(greyOut); [0, 1, 2].forEach((k) => taq.children[k].material.color.multiplyScalar(0.35));
  const tl = new THREE.PointLight(0xc8d0ff, 1.3, 9, 1.4); tl.position.set(TX, 2.6, 0); scene.add(tl);
  const phone = buildPhone('#1a1c22'); scene.add(phone);
  // sound lines (tubes) and sparks
  const tubes = [0, 1, 2, 3, 4].map((i) => { const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: lin(['#ffb03a', '#9aa0b8', '#9aa0b8', '#e8e8f0', '#9aa0b8'][i]), transparent: true, opacity: 0.85, toneMapped: false })); m.visible = false; scene.add(m); return m; });
  const sparks = [...Array(90)].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex('255,230,170'), transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); return s; });
  // the mic ring
  const micRing = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: lin('#e8f0ff'), transparent: true, toneMapped: false })); micRing.visible = false; scene.add(micRing);
  G = { r, cv, scene, cam, key, field, DB, stems, heads, rings, links, linkG, linkM, links2, linkG2, link2M, heads2, cutP, zone, bars, bigBar, keys, server, people, phone, tubes, sparks, micRing, TX };
  return G;
}
// ---- per-frame
const _m4 = new THREE.Matrix4(), _q4 = new THREE.Quaternion(), _c4 = new THREE.Color(), HID = new THREE.Matrix4().makeScale(0, 0, 0);
const C_WAVE = lin('#a8a8c8'), C_LO = lin('#0a3a5a'), C_MID = lin('#1aa8a8'), C_HI = lin('#ffb03a'), C_TOP = lin('#fff2b0'), C_NOISE = lin('#c8c8d8');
// o: { wave 0..1 (grey ribbons ↔ spectrogram), flat 0..1 (heights → heat map), reveal 0..1 (columns grow in along time), noise 0..1, dim 0..1, wobble }
function setField(o = {}) {
  const g = g3(), wave = o.wave ?? 0, flat = o.flat ?? 0, rev = o.reveal ?? 1, nz = o.noise ?? 0, R = RNOW;
  let k = 0;
  for (let i = 0; i < NT; i++) { const env = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.37) * Math.cos(i * 0.11)) * (0.7 + 0.3 * Math.sin(i * 1.7)), live = 0.06 * Math.sin(R * 6 + i * 0.4) * (o.wobble ?? 1);
    const on = clamp((rev * (NT + 20) - i) / 20);
    for (let j = 0; j < NF; j++, k++) {
      const v = nz > 0 ? songVal(i, j, 0, nz) : SONG[i][j], vn = nz > 0 ? clamp(v - SONG[i][j], 0, 1) : 0;
      const hs = (0.04 + v * HMAX) * (1 + live), hw = (0.05 + env * 0.85) * (j % 3 === 0 ? 1 : 0.92) * (1 + live);
      const h = Math.max(0.005, lerp(lerp(hs, hw, wave), 0.01, flat) * on);
      if (on <= 0) { g.field.setMatrixAt(k, HID); continue; }
      _m4.compose(V3(fxp(i), h / 2, fzp(j)), _q4, V3(1, h, 1)); g.field.setMatrixAt(k, _m4);
      const cv = v / 1.2; _c4.copy(cv < 0.4 ? C_LO.clone().lerp(C_MID, cv / 0.4) : cv < 0.8 ? C_MID.clone().lerp(C_HI, (cv - 0.4) / 0.4) : C_HI.clone().lerp(C_TOP, clamp((cv - 0.8) / 0.4)));
      if (vn > 0) _c4.lerp(C_NOISE, clamp(vn * 1.5)); _c4.lerp(C_WAVE, wave); if (o.dim) _c4.multiplyScalar(1 - 0.75 * o.dim);
      g.field.setColorAt(k, _c4);
    } }
  g.field.instanceMatrix.needsUpdate = true; if (g.field.instanceColor) g.field.instanceColor.needsUpdate = true; g.field.visible = true;
}
// peaks: shown up to fraction u (in time order), at height level (0 = on the field, 1 = floating at a fixed plane), scale s
function setPeaks(u, o = {}) {
  const g = g3(), n = Math.floor(PEAKS.length * clamp(u)), lift = o.lift ?? 0, y0 = o.y0 ?? 0.95, flat = o.flat ?? 0;
  PEAKS.forEach((p, k) => { if (k >= n || (o.only && !o.only.includes(k))) { g.stems.setMatrixAt(k, HID); g.heads.setMatrixAt(k, HID); g.rings.setMatrixAt(k, HID); return; }
    const sp = EZ.back(clamp((u * PEAKS.length - k) / 3)), top = lerp(0.04 + p.v * HMAX * (1 - flat) + 0.02, y0, lift);
    _m4.compose(V3(fxp(p.i), top / 2, fzp(p.j)), _q4, V3(1, Math.max(0.001, top * (o.stem ?? 1)), 1)); g.stems.setMatrixAt(k, _m4);
    _m4.compose(V3(fxp(p.i), top + 0.02, fzp(p.j)), _q4, V3(sp, sp, sp).multiplyScalar(o.size ?? 1)); g.heads.setMatrixAt(k, _m4);
    _m4.compose(V3(fxp(p.i), top + 0.02, fzp(p.j)), new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), V3(sp, sp, sp).multiplyScalar((o.size ?? 1) * (1 + 0.15 * Math.sin(RNOW * 4 + k)))); g.rings.setMatrixAt(k, _m4); });
  [g.stems, g.heads, g.rings].forEach((m) => { m.instanceMatrix.needsUpdate = true; m.visible = n > 0; }); g.stems.material.opacity = 0.8 * (o.stemA ?? 1);
  return (k) => V3(fxp(PEAKS[k].i), lerp(0.04 + PEAKS[k].v * HMAX * (1 - flat) + 0.04, y0 + 0.02, lift), fzp(PEAKS[k].j));
}
// links drawn up to fraction u; at = peak position function; second set (green) offset by off
function setLinks(u, at, o = {}) {
  const g = g3(), n = Math.floor(LINKS.length * clamp(u)), a = g.linkG.attributes.position;
  LINKS.forEach(([p, q], k) => { const A = at(p), B = k < n ? at(q) : A; a.setXYZ(k * 2, A.x, A.y, A.z); a.setXYZ(k * 2 + 1, B.x, B.y, B.z); });
  a.needsUpdate = true; g.links.visible = n > 0; g.linkM.opacity = 0.7 * (o.a ?? 1); g.linkM.color.set(o.color ?? '#e8e4ff');
}
function setLinks2(u, at, off, o = {}) {
  const g = g3(), n = Math.floor(LINKS.length * clamp(u)), a = g.linkG2.attributes.position;
  LINKS.forEach(([p, q], k) => { const A = at(p).add(off), B = (k < n ? at(q) : at(p)).add(off); a.setXYZ(k * 2, A.x, A.y, A.z); a.setXYZ(k * 2 + 1, B.x, B.y, B.z); });
  a.needsUpdate = true; g.links2.visible = n > 0; g.link2M.opacity = 0.85 * (o.a ?? 1);
  PEAKS.forEach((p, k) => { if (n <= 0) { g.heads2.setMatrixAt(k, HID); return; } _m4.compose(at(k).add(off), _q4, V3(1, 1, 1)); g.heads2.setMatrixAt(k, _m4); }); g.heads2.instanceMatrix.needsUpdate = true; g.heads2.visible = n > 0;
}
let SPI2 = 0;
function resetWorld() {
  const g = g3(); SPI2 = 0;
  for (const k of ['field', 'DB', 'stems', 'heads', 'rings', 'links', 'links2', 'heads2', 'cutP', 'zone', 'bars', 'bigBar', 'keys', 'server', 'phone', 'micRing']) g[k].visible = false;
  g.tubes.forEach((m) => (m.visible = false)); g.sparks.forEach((s) => (s.visible = false));
  g.scene.fog.near = 12; g.scene.fog.far = 60;
}
function spark(p, s, a) { const q = g3().sparks[SPI2++]; if (!q || a <= 0) return; q.visible = true; q.position.copy(p); q.scale.set(s, s, 1); q.material.opacity = clamp(a); }
function tube(i, pts, u = 1, r = 0.012) { const m = g3().tubes[i]; if (u <= 0) return; const n = Math.max(2, Math.ceil(pts.length * u)); m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, n)), 80, r, 8, false); m.visible = true; }
const wpt = (obj, x, y, z) => { obj.updateMatrixWorld(); return V3(x, y, z).applyMatrix4(obj.matrixWorld); };

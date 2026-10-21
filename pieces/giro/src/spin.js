
// =====================================================================
//  SPIN — a city corner on the equator, morning: a four-lane avenue with a tree-lined median, a crossing in front of you,
//  brick, stucco and glass blocks with shops, towers behind, the bay at the far end. The Earth brakes; the air does not:
//  a wind from the sea (in your face) strips the street, the cars, the people and the buildings; then the ocean comes.
//  Built on scenes.js (sky, sea, quay, boats, people bodies, the wave, sprite pools); luna's town is hidden.
// =====================================================================
const blot2 = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const SUN = dirV(150 * DEG, 62 * DEG);                       // a morning sun behind you (east); shadows run down the avenue
const T_BRAKE = 11.0, T_WIND = 17.0, T_STOP = 57.0, T_HUSH = 60.8, T_HIT = 61.8;
const GY = PROM + 0.02, SW = GY + 0.16;                      // road level, sidewalk level
const ROADX = 10, BX = 14;                                    // road half width (4 lanes + median), building line
const OZ = 650;                                               // luna's sea, quay, hill and boats are moved this far back
const SEAZ = -78 - OZ;                                        // the new waterfront
const XSTREETS = [[-26, -14], [14, 46], [140, 152]]; const BLV = { z0: 14, z1: 46, r0: 18, r1: 42 }; for (let z = -86; z > SEAZ + 60; z -= 62) XSTREETS.push([z - 6, z + 6]);   // cross streets (z ranges)
const ZRUNS = (() => { const L = XSTREETS.slice().sort((a, b) => a[0] - b[0]); const R = []; let z = SEAZ + 2; L.forEach(([a, b]) => { R.push([z, a]); z = b; }); R.push([z, 320]); return R; })();
const CAMX = 13.0, CAMZ = 45.9, CAMY0 = SW + 4.7 + 1.65;   // a first-floor corner balcony
const spinK = (t) => knots([[0, 1670], [11, 1670], [17, 1580], [25, 1380], [33, 1080], [42, 720], [50, 340], [57, 0], [70, 0]], t);
const windKmh = (t) => (t < 15.5 ? 0 : Math.min(1670 - spinK(t), 1670) * ss(15.5, 19.5, t));
const W01 = (t) => clamp(windKmh(t) / 1100);
function flyP(q, t) { const tau = t - q.t0; if (tau <= 0) return null; const k = q.a / q.v, d = q.v * (tau - (1 - Math.exp(-k * tau)) / k);
  return { d, x: q.x + q.sx * d + Math.sin(tau * q.wob + q.ph) * q.wa, y: q.y + q.lift * d + (q.hop ? Math.abs(Math.sin(tau * 3.1 + q.ph)) * q.hop * Math.min(1, tau) : 0), z: q.z + d, r: tau * q.spin }; }
// cel shading: a 4-step toon ramp for everything in the city (the reference's look)
const GRAD = (() => { const d = new Uint8Array([112, 112, 112, 255, 165, 165, 165, 255, 218, 218, 218, 255, 255, 255, 255, 255]); const tx = new THREE.DataTexture(d, 4, 1); tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.generateMipmaps = false; tx.needsUpdate = true; return tx; })();
function TOON(o) { const p = Object.assign({}, o); delete p.roughness; delete p.metalness; return new THREE.MeshToonMaterial(Object.assign({ gradientMap: GRAD }, p)); }
const mkFly = (R, o) => Object.assign({ a: R.r(8, 16), v: R.r(40, 90), sx: R.n(0.08), wob: R.r(1, 3), wa: R.r(0, 1.5), ph: R.r(0, TAU), lift: R.r(0.1, 0.35), spin: R.r(1, 5), hop: 0 }, o);

// the camera: on the corner, looking down the avenue to the sea; a jolt when the planet brakes; it looks at the people, the
// cars, the buildings; the wind shoves it back and down; then it looks up at the ocean
const GL0 = [[5.2, 10.6, 14, -5], [11.6, 14.6, 22, -9], [14.4, 16.9, -24, -10], [17.4, 20.6, 4, 4], [25.6, 29.4, -16, -4], [29.2, 32.8, 26, 6], [33.4, 37.8, -34, 26], [37.6, 41.6, 30, 22], [42.4, 46.4, 8, 10], [46.2, 49.6, -30, 18], [50.2, 56.6, -28, 14], [57.2, 63, 6, 24]];
const GL = [[4.8, 9.0, -62, 2], [9.0, 11.2, 0, -4], [11.6, 14.4, 4, -9], [14.2, 16.9, -58, -4], [17.4, 20.6, 0, 4], [21.0, 24.8, -64, 4], [25.6, 29.4, 6, -2], [29.2, 32.8, -66, 8], [33.4, 37.8, -50, 24], [37.6, 41.6, 12, 20], [42.4, 46.4, -66, 10], [46.2, 49.6, 0, 16], [50.2, 56.6, -56, 12], [57.2, 63, 0, 24]];
function camPoseC(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c;
  let y = 0, p = 0; for (const [a, b, yw, pt] of GL) { const k = ss(a, a + 0.9, t) * (1 - ss(b - 0.9, b, t)); y += yw * k; p += pt * k; }
  const jolt = ss(T_BRAKE, T_BRAKE + 0.08, t) * (1 - ss(T_BRAKE + 0.6, T_BRAKE + 3.0, t)), w = W01(t), hit = ss(T_HIT - 0.03, T_HIT - 0.005, t) * (1 - ss(T_HIT + 0.3, T_HIT + 1.2, t));
  let near = 0; if (GC) for (const b of GC.BUI) if (b.dC < 70) { const d = t - b.tH; if (d > -0.5 && d < 3) near += Math.exp(-d * d / 0.4) * (1 - b.dC / 70); }
  const shake = 1.6 * jolt + 0.25 * ss(11, 13, t) * (1 - ss(17, 19, t)) + 1.1 * w * (t < T_HUSH ? 1 : 0.5) + 0.8 * Math.min(1.5, near) + 1.2 * ss(57.5, 61.7, t) + 2.0 * hit;
  const push = EZ.io(seg(t, 44, 52));
  return {
    x: CAMX + n(0.31, 1, 0.04) + shake * (n(29, 0, 0.03) + n(41, 1, 0.02)) - 3 * push,
    y: CAMY0 + n(0.43, 0.3, 0.025) + shake * n(33, 2, 0.03) - 0.25 * jolt - 0.6 * push + 0.6 * push * ss(55, 60, t),
    z: CAMZ + n(0.27, 2, 0.04) + 0.6 * jolt + 4 * push,
    yaw: (16 + y + n(0.21, 0.7, 0.6) + n(0.57, 2.1, 0.25) + shake * n(23, 3, 1.3)) * DEG,
    pitch: (-7 + p + n(0.33, 1.2, 0.35) + shake * n(37, 1, 1.6) - 9 * jolt) * DEG,
    roll: (n(0.27, 2.1, 0.35) + shake * n(19, 2, 1.4) + 9 * push * Math.sin(t * 0.7) + 6 * jolt) * DEG,
  };
}

function texAwn(key, a, b) { return g3Tex((x, w, h) => { const R = RNG(key); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? a : b; x.fillRect(i * w / 8, 0, w / 8, h); } x.fillStyle = 'rgba(0,0,0,0.14)'; x.fillRect(0, h * 0.84, w, h * 0.16);
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? a : b; x.beginPath(); x.arc((i + 0.5) * w / 16, h, w / 32, Math.PI, 0); x.fill(); } speck(x, w, h, 900, ['rgba(0,0,0,0.07)', 'rgba(255,255,255,0.08)'], R); for (let i = 0; i < w; i += 3) { x.fillStyle = 'rgba(0,0,0,0.05)'; x.fillRect(i, 0, 1, h); } }, 128, 64); }
// façade sheets: 12 m x 12 m (4 floors x 4 bays) — brick with white-framed windows; stucco with shutters and little balconies
const brickBg = (x, ox, oy, w, h, base, R) => { const [r0, g0, b0] = base; for (let r = 0; r < 96; r++) for (let c = 0; c < 26; c++) { const v = R.r(-20, 20); x.fillStyle = `rgb(${r0 + v},${g0 + v * 0.6},${b0 + v * 0.5})`; x.fillRect(ox + c * w / 24 - (r % 2) * w / 48, oy + r * h / 96, w / 24 - 1.5, h / 96 - 1.5); } speck(x, w, h, 0, [], R); };
function texBrickAtlas() { return g3Tex((x, w, H) => { const h = H / 4, R = RNG('brickA'); x.fillStyle = '#6a3a2a'; x.fillRect(0, 0, w, H);
  for (let v = 0; v < 4; v++) { const oy = v * h; brickBg(x, 0, oy, w, h, [[150, 78, 58], [118, 62, 46], [176, 92, 60], [196, 160, 112]][v], R);
    for (let fl = 0; fl < 4; fl++) { if (v === 1) { x.fillStyle = '#d8ccb8'; x.fillRect(0, oy + fl * h / 4 + h / 4 - 10, w, 8); }
      if (v === 2) { x.fillStyle = '#2a2a2a'; x.fillRect(0, oy + fl * h / 4 + h * 0.035, w, 6); }
      const bays = v === 2 ? 3 : 4; for (let b = 0; b < bays; b++) { const cw = w / bays, wx = b * cw + cw * (v === 2 ? 0.1 : v === 3 ? 0.18 : 0.2), ww = cw * (v === 2 ? 0.8 : v === 3 ? 0.28 : 0.6), wy = oy + fl * h / 4 + h * 0.055, wh = h / 4 * (v === 3 ? 0.42 : 0.6);
        const frame = ['#ece6da', '#2e4a36', '#1e1e1e', '#f2ece0'][v], glass = x.createLinearGradient(wx, wy, wx + ww, wy + wh); glass.addColorStop(0, R.f() < 0.3 ? '#7a8a9a' : '#2c3644'); glass.addColorStop(1, '#121820');
        const pane = (px, pw) => { x.fillStyle = frame; if (v === 1) { x.beginPath(); x.moveTo(px - 4, wy + wh + 4); x.lineTo(px - 4, wy + pw / 2); x.arc(px + pw / 2, wy + pw / 2, pw / 2 + 4, Math.PI, 0); x.lineTo(px + pw + 4, wy + wh + 4); x.fill(); x.fillStyle = glass; x.beginPath(); x.moveTo(px, wy + wh); x.lineTo(px, wy + pw / 2); x.arc(px + pw / 2, wy + pw / 2, pw / 2, Math.PI, 0); x.lineTo(px + pw, wy + wh); x.fill(); x.fillStyle = '#d8ccb8'; x.fillRect(px + pw / 2 - 5, wy - 6, 10, 10); }
          else { x.fillRect(px - 4, wy - 4, pw + 8, wh + 8); x.fillStyle = glass; x.fillRect(px, wy, pw, wh); }
          x.fillStyle = frame; if (v === 2) { for (let q = 1; q < 4; q++) x.fillRect(px + q * pw / 4 - 1.5, wy, 3, wh); for (let q = 1; q < 3; q++) x.fillRect(px, wy + q * wh / 3 - 1.5, pw, 3); } else { x.fillRect(px + pw / 2 - 2, wy + (v === 1 ? pw / 2 : 0), 4, wh - (v === 1 ? pw / 2 : 0)); x.fillRect(px, wy + wh * 0.5, pw, 3); }
          x.fillStyle = 'rgba(255,255,255,0.16)'; x.fillRect(px + 3, wy + 3 + (v === 1 ? pw / 3 : 0), pw * 0.28, wh * 0.35); x.fillStyle = '#c8b8a0'; x.fillRect(px - 6, wy + wh + 5, pw + 12, 6); };
        if (v === 3) { pane(wx, ww); pane(wx + ww + 12, ww); if ((fl + b) % 3 === 1) { x.fillStyle = '#9aa0a4'; x.fillRect(wx + 6, wy + wh + 12, ww * 0.9, 18); x.fillStyle = '#6a7074'; for (let q = 0; q < 6; q++) x.fillRect(wx + 8 + q * 6, wy + wh + 14, 2, 14); } if ((fl + b) % 2 === 0) { x.fillStyle = '#5a3a24'; x.fillRect(wx + ww + 8, wy + wh + 10, ww + 8, 8); for (let q = 0; q < 6; q++) { x.fillStyle = R.pick(['#c8302a', '#3a7a32', '#e8c040']); x.beginPath(); x.arc(wx + ww + 12 + q * (ww / 6 + 1), wy + wh + 8, 4, 0, TAU); x.fill(); } } }
        else pane(wx, ww); } } } }, 512, 2048); }
function texStuccoAtlas() { return g3Tex((x, w, H) => { const h = H / 4, R = RNG('stuccoA'); x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, H); for (let k = 0; k < 160; k++) blot2(x, R.r(0, w), R.r(0, H), R.r(20, 80), `rgba(${R.f() < 0.5 ? '160,150,140' : '255,255,255'},0.12)`); speck(x, w, H, 30000, ['rgba(90,80,70,0.12)', 'rgba(255,255,255,0.2)'], R, 1, 2);
  for (let v = 0; v < 4; v++) { const oy = v * h; for (let fl = 0; fl < 4; fl++) { x.fillStyle = 'rgba(0,0,0,0.14)'; x.fillRect(0, oy + fl * h / 4 + h / 4 - 6, w, 6); if (v === 3) { x.fillStyle = 'rgba(255,255,255,0.6)'; x.fillRect(0, oy + fl * h / 4 + h / 4 - 14, w, 6); for (let c = 0; c <= 4; c++) { x.fillStyle = 'rgba(0,0,0,0.08)'; x.fillRect(c * w / 4 - 6, oy + fl * h / 4, 12, h / 4); } }
      for (let b = 0; b < 4; b++) { const cw = w / 4, wx = b * cw + cw * (v === 2 ? 0.1 : 0.24), ww = cw * (v === 2 ? 0.8 : 0.52), wy = oy + fl * h / 4 + h * (v === 1 ? 0.03 : 0.05), wh = h / 4 * (v === 1 ? 0.78 : 0.6);
        x.fillStyle = '#1e2630'; if (v === 3) { x.beginPath(); x.moveTo(wx, wy + wh); x.lineTo(wx, wy + ww / 2); x.arc(wx + ww / 2, wy + ww / 2, ww / 2, Math.PI, 0); x.lineTo(wx + ww, wy + wh); x.fill(); } else x.fillRect(wx, wy, ww, wh);
        x.fillStyle = 'rgba(255,255,255,0.15)'; x.fillRect(wx + 3, wy + 3 + (v === 3 ? ww / 3 : 0), ww * 0.35, wh * 0.4);
        if (v === 0) { const sh = R.pick(['#3a6a5a', '#5a3a2a', '#2f4f7a', '#7a6a3a']); x.fillStyle = sh; x.fillRect(wx - ww * 0.3, wy, ww * 0.28, wh); x.fillRect(wx + ww * 1.02, wy, ww * 0.28, wh); x.fillStyle = 'rgba(0,0,0,0.25)'; for (let q = 0; q < wh; q += 5) { x.fillRect(wx - ww * 0.3, wy + q, ww * 0.28, 1); x.fillRect(wx + ww * 1.02, wy + q, ww * 0.28, 1); } }
        if (v === 1) { x.fillStyle = 'rgba(200,190,170,0.6)'; x.fillRect(wx + ww / 2 - 1, wy, 2, wh); x.fillStyle = '#1a1c1e'; x.fillRect(wx - 10, wy + wh * 0.62, ww + 20, 3); for (let q = 0; q < ww + 20; q += 6) x.fillRect(wx - 10 + q, wy + wh * 0.62, 2, wh * 0.38); x.fillRect(wx - 10, wy + wh, ww + 20, 5); if (R.f() < 0.6) for (let q = 0; q < 5; q++) { x.fillStyle = R.pick(['#3a7a32', '#4a8a3a', '#c8302a', '#e8a0c0']); x.beginPath(); x.arc(wx - 4 + q * (ww / 4), wy + wh * 0.6, 6, 0, TAU); x.fill(); } }
        if (v === 2) { x.fillStyle = 'rgba(230,226,218,0.85)'; for (let q = 0; q < wh * 0.55; q += 4) x.fillRect(wx, wy + q, ww, 2); x.fillStyle = R.pick(['#5a8a9a', '#c87a5a', '#8a9a5a']); x.fillRect(wx - 6, wy - 6, ww + 12, 5); x.fillRect(wx - 6, wy + wh, ww + 12, 5); }
        if (v === 3) { x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(wx - 6, wy + wh, ww + 12, 6); } } } } }, 512, 2048); }
function texGlassAtlas() { return g3Tex((x, w, H) => { const h = H / 4, R = RNG('glassA');
  for (let v = 0; v < 4; v++) { const oy = v * h, gr = x.createLinearGradient(0, oy, w * 0.5, oy + h); gr.addColorStop(0, ['#dfe8f2', '#c8d4dc', '#e8eef2', '#9ec4ec'][v]); gr.addColorStop(0.45, ['#8aa4c4', '#6a8494', '#a8b8c8', '#3a7ac8'][v]); gr.addColorStop(1, ['#3a4a62', '#2a3a44', '#5a6a7a', '#1a3a6a'][v]); x.fillStyle = gr; x.fillRect(0, oy, w, h);
    for (let k = 0; k < 8; k++) { const px = R.r(0, w), pw = R.r(8, 40), gg = x.createLinearGradient(px, 0, px + pw, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, 'rgba(255,255,255,0.22)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gg; x.fillRect(px, oy, pw, h); }
    if (v === 0) { const cw = w / 12, rh = h / 24; for (let r = 0; r < 24; r++) for (let q = 0; q < 12; q++) if (R.f() < 0.15) { x.fillStyle = `rgba(${R.f() < 0.5 ? '235,228,214' : '40,46,56'},0.4)`; x.fillRect(q * cw + 2, oy + r * rh + 2, cw - 4, rh * R.r(0.3, 0.9)); } x.fillStyle = 'rgba(30,34,40,0.85)'; for (let q = 0; q <= 12; q++) x.fillRect(q * cw - 1, oy, 2, h); x.fillStyle = 'rgba(70,76,86,0.9)'; for (let r = 0; r <= 24; r++) x.fillRect(0, oy + r * rh - 2, w, 4); }
    if (v === 1) { const rh = h / 24; for (let r = 0; r < 24; r++) { x.fillStyle = '#d8d2c6'; x.fillRect(0, oy + r * rh, w, rh * 0.42); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, oy + r * rh + rh * 0.42, w, 2); } }
    if (v === 2) { const cw = w / 16; for (let q = 0; q < 16; q++) { x.fillStyle = q % 2 ? '#e8e4dc' : 'rgba(0,0,0,0.0)'; if (q % 2) x.fillRect(q * cw, oy, cw * 0.45, h); } x.fillStyle = 'rgba(0,0,0,0.3)'; for (let r = 0; r <= 24; r++) x.fillRect(0, oy + r * h / 24, w, 2); }
    if (v === 3) { const cw = w / 8, rh = h / 24; x.fillStyle = 'rgba(200,170,90,0.9)'; for (let q = 0; q <= 8; q++) x.fillRect(q * cw - 2, oy, 4, h); for (let r = 0; r <= 24; r++) x.fillRect(0, oy + r * rh - 1.5, w, 3); } } }, 256, 2048); }
// shop fronts: 6 kinds (sign band with a name, two display windows with goods, a door), stacked vertically
function texShops() { return g3Tex((x, w, H) => { const h = H / 6, R = RNG('shops'), names = ['CAFÉ', 'FARMACIA', 'PANADERÍA', 'MODA', 'BODEGA', 'LIBROS'], cols = [['#2a5a3a', '#f4efe4'], ['#1f6a8a', '#ffffff'], ['#8a4a2a', '#f8e8c8'], ['#1e1e22', '#f2c94c'], ['#a8302a', '#ffffff'], ['#3a2a5a', '#e8dcc4']];
  for (let v = 0; v < 6; v++) { const oy = v * h, [bg, fg] = cols[v]; x.fillStyle = '#d8d0c4'; x.fillRect(0, oy, w, h); x.fillStyle = bg; x.fillRect(0, oy, w, h * 0.24); x.fillStyle = fg; x.font = `bold ${Math.round(h * 0.15)}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(names[v], w / 2, oy + h * 0.125);
    x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, oy + h * 0.24, w, 3);
    const win = (wx, ww) => { const gg = x.createLinearGradient(wx, oy + h * 0.3, wx + ww, oy + h); gg.addColorStop(0, '#5a6a78'); gg.addColorStop(1, '#1a2028'); x.fillStyle = '#2a2a2a'; x.fillRect(wx - 4, oy + h * 0.29, ww + 8, h * 0.7); x.fillStyle = gg; x.fillRect(wx, oy + h * 0.31, ww, h * 0.66);
      for (let sh = 0; sh < 3; sh++) { const sy = oy + h * (0.48 + sh * 0.16); x.fillStyle = 'rgba(200,190,170,0.5)'; x.fillRect(wx + 4, sy, ww - 8, 3); for (let k = 0; k < 9; k++) { x.fillStyle = R.pick(['#c8302a', '#f0c33c', '#3a8a4a', '#2f6fd1', '#e86fa8', '#f4f1ea', '#8a5a34']); x.fillRect(wx + 6 + k * (ww - 12) / 9, sy - R.r(8, 18), (ww - 12) / 9 - 3, R.r(8, 18)); } }
      x.fillStyle = 'rgba(255,255,255,0.18)'; x.beginPath(); x.moveTo(wx + ww * 0.1, oy + h * 0.31); x.lineTo(wx + ww * 0.35, oy + h * 0.31); x.lineTo(wx + ww * 0.15, oy + h * 0.97); x.lineTo(wx, oy + h * 0.97); x.fill(); };
    win(w * 0.04, w * 0.36); win(w * 0.6, w * 0.36); x.fillStyle = '#3a2a1e'; x.fillRect(w * 0.43, oy + h * 0.32, w * 0.14, h * 0.68); x.fillStyle = '#5a6a78'; x.fillRect(w * 0.45, oy + h * 0.36, w * 0.1, h * 0.36); x.fillStyle = '#c8b888'; x.fillRect(w * 0.535, oy + h * 0.68, 6, 6); } }, 512, 768); }
let GC = null;
function gC() {
  if (GC) return GC;
  const g = g3(), scene = g.scene;
  // hide luna's town and its ground: this is a flat city now
  [g.houses, g.roofs, g.chimI, g.capI, g.antI, g.church, g.poles, g.lamps, g.pools, g.hillL, g.car, g.moonG, g.rubble, g.beamPivot].forEach((m) => m && (m.visible = false));
  scene.children.forEach((ch) => { if (ch.isGroup && Math.abs(ch.position.x - TERR.x) < 0.01 && Math.abs(ch.position.z - TERR.z) < 0.01) ch.visible = false;
    const p = ch.geometry && ch.geometry.parameters; if (p && ((p.width === 340 && p.height === 120) || p.radiusTop === 0.18)) ch.visible = false; });
  for (const k in g.PM) { const m = g.PM[k]; for (let i = 0; i < m.count; i++) m.setMatrixAt(i, _hid); m.instanceMatrix.needsUpdate = true; }
  g.clouds.forEach((s) => (s.visible = false));
  if (!g.userData) g.userData = {}; if (!g.shifted) { const keep = new Set([g.cam, g.sky, g.stars, g.key, g.key.target, g.hemi, g.fill, g.wave, ...g.sprays, ...g.flames, ...g.smokes, ...g.billows]); scene.children.forEach((ch) => { if (!keep.has(ch)) ch.position.z -= OZ; }); g.shifted = true; }
  const R = RNG('city'), metal = TOON({ color: 0x2a2e33, metalness: 0.6, roughness: 0.4 });
  // your balcony: a corner slab with a complete railing on three sides (front, left, right): top rail, mid rail, balusters
  { const X0 = CAMX - 0.9, X1 = CAMX + 3.0, Z0 = CAMZ - 1.9, Z1 = CAMZ + 1.0, Y = SW + 4.6, railM = TOON({ color: 0x2a2e33 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 0.1, 0.22, Z1 - Z0 + 0.1), TOON({ color: 0x3e3a35 })); slab.position.set((X0 + X1) / 2, Y, (Z0 + Z1) / 2); slab.castShadow = true; scene.add(slab);
    const bar = (ax, az, bx, bz, y, th) => { const L = Math.hypot(bx - ax, bz - az), m = new THREE.Mesh(new THREE.BoxGeometry(th, th, L), railM); m.position.set((ax + bx) / 2, y, (az + bz) / 2); m.rotation.y = Math.atan2(bx - ax, bz - az); scene.add(m);
      for (let d = 0; d <= L + 1e-3; d += 0.24) { const u = d / L, p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.02, 0.03), railM); p.position.set(ax + (bx - ax) * u, Y + 0.62, az + (bz - az) * u); scene.add(p); } };
    [[X0, Z1, X0, Z0], [X0, Z0, X1, Z0], [X1, Z0, X1, Z1]].forEach(([ax, az, bx, bz]) => { bar(ax, az, bx, bz, Y + 1.12, 0.07); const L = Math.hypot(bx - ax, bz - az), m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, L), railM); m.position.set((ax + bx) / 2, Y + 0.5, (az + bz) / 2); m.rotation.y = Math.atan2(bx - ax, bz - az); scene.add(m); }); }
  // ---- the ground: asphalt with lane lines, crosswalks, sidewalks with curbs, the median with trees
  const asph = wrap(g3Tex((x, w) => { const Ra = RNG('asph'); x.fillStyle = '#4a4a4c'; x.fillRect(0, 0, w, w); speck(x, w, w, 26000, ['rgba(20,20,22,0.35)', 'rgba(140,140,140,0.25)', 'rgba(90,86,80,0.3)'], Ra, 1, 2); for (let k = 0; k < 30; k++) blot2(x, Ra.r(0, w), Ra.r(0, w), Ra.r(10, 60), 'rgba(20,20,20,0.12)'); }, 256, 256), 1, 1);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, 400 + OZ).rotateX(-Math.PI / 2), TOON({ map: asph, bumpMap: asph, bumpScale: 0.4, roughness: 0.92 })); ground.position.set(0, GY, (SEAZ + 322) / 2);
  { const uv = ground.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1800 / 6, uv.getY(i) * (400 + OZ) / 6); } ground.receiveShadow = true; scene.add(ground);
  const paint = new THREE.MeshStandardMaterial({ color: 0xf2f0e8, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 }), yel = new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 });
  const marks = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), paint, 3200, false); let nm = 0; const mark = (x, z, w, d, m = marks) => m.setMatrixAt(nm++, M4c(x, GY + 0.015, z, 0, w, 1, d));
  const inX = (z) => XSTREETS.some(([a, b]) => z > a - 1 && z < b + 1);
  for (let z = SEAZ + 2; z < 300; z += 6) if (!inX(z)) for (const x of [-5, 5]) mark(x, z, 0.15, 3);
  XSTREETS.forEach(([a, b]) => { for (let x = -ROADX + 0.5; x < ROADX; x += 1.1) { mark(x, a - 2.2, 0.6, 3.2); mark(x, b + 2.2, 0.6, 3.2); } for (let x = BX + 2; x < 300; x += 6) for (const s of [-1, 1]) if (nm < 3190) mark(s * x, (a + b) / 2, 3, 0.15); });
  marks.count = nm; scene.add(marks);
  const yl = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), yel, 2, false); yl.setMatrixAt(0, M4c(-1.05, GY + 0.015, (SEAZ + 300) / 2, 0, 0.12, 1, 300 - SEAZ)); yl.setMatrixAt(1, M4c(1.05, GY + 0.015, (SEAZ + 300) / 2, 0, 0.12, 1, 300 - SEAZ)); scene.add(yl);
  const conc = wrap(g3Tex((x, w) => { const Rc = RNG('conc'); x.fillStyle = '#b8b2a8'; x.fillRect(0, 0, w, w); speck(x, w, w, 9000, ['rgba(60,60,60,0.15)', 'rgba(255,255,255,0.15)'], Rc, 1, 2); x.fillStyle = 'rgba(60,56,50,0.5)'; for (let k = 0; k <= 4; k++) { x.fillRect(k * w / 4 - 1, 0, 2, w); x.fillRect(0, k * w / 4 - 1, w, 2); } }, 256, 256), 1, 1);
  const concM = TOON({ map: conc, bumpMap: conc, bumpScale: 0.5, roughness: 0.9 }), walks = [];
  const zRuns = ZRUNS;
  zRuns.forEach(([a, b]) => { for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(BX - ROADX + 30, 0.32, b - a), concM); m.position.set(s * (ROADX + (BX - ROADX + 30) / 2), GY, (a + b) / 2); m.receiveShadow = true; scene.add(m); walks.push(m);
      const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (BX - ROADX + 30) / 3, uv.getY(i) * (b - a) / 3); }
    const med = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, b - a - 4), concM); med.position.set(0, GY + 0.05, (a + b) / 2); scene.add(med); });
  for (const s2 of [-1, 1]) for (const [za, zb] of [[BLV.z0, BLV.r0], [BLV.r1, BLV.z1]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(600, 0.32, zb - za), concM); m.position.set(s2 * (ROADX + 300), GY, (za + zb) / 2); m.receiveShadow = true; scene.add(m);
    const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 600 / 3, uv.getY(i) * (zb - za) / 3); }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.3, 1.6), concM); m.position.set(0, GY + 0.05, (BLV.r0 + BLV.r1) / 2); scene.add(m); }
  // ---- buildings: brick, stucco and glass blocks along the avenue and the cross streets, taller rows behind, towers far back
  const facShader = (m, tw, th, nv = 4) => { m.onBeforeCompile = (sh) => {
    sh.vertexShader = 'attribute float aCut; attribute float aPeel; attribute float aVar; varying float vCut, vPeel, vVar; varying vec3 vTp; varying vec2 vTw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 lp = (position + 0.5) * sc; vTp = lp; vCut = aCut * sc.y; vPeel = aPeel; vVar = aVar;
      vTw = (abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y)) / vec2(${tw.toFixed(1)}, ${th.toFixed(1)}); if (abs(normal.y) > 0.5) vTw = vec2(0.02, 0.02);`);
    sh.fragmentShader = 'varying float vCut, vPeel, vVar; varying vec3 vTp; varying vec2 vTw;\n' + sh.fragmentShader.replace('#include <map_fragment>', `{ vec2 tw2 = vec2(fract(vTw.x), (fract(vTw.y) + vVar) / ${nv.toFixed(1)}); diffuseColor.rgb *= textureGrad(map, tw2, dFdx(vTw) * vec2(1.0, ${(1).toFixed(1)} / ${nv.toFixed(1)}), dFdy(vTw) * vec2(1.0, 1.0 / ${nv.toFixed(1)})).rgb * 1.05; }
      if (vPeel > 0.0) { vec3 q = vTp * 0.33; float n = 0.5 + 0.25 * sin(q.x * 2.3 + sin(q.y * 1.7) * 2.0 + q.z * 1.9) * sin(q.y * 2.1 - q.x * 0.7 + sin(q.z * 1.3)) + 0.15 * sin(q.x * 6.1 - q.y * 5.3 + q.z * 4.7) + 0.1 * sin(q.y * 13.0 + q.x * 11.0); if (n < vPeel) discard; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.52), 1.0 - smoothstep(vPeel, vPeel + 0.05, n)); }
      { float jag = 1.6 * sin(vTp.x * 0.9 + vTp.z * 1.3) + 1.1 * sin(vTp.x * 3.1 - vTp.z * 2.7) + 0.6 * sin(vTp.x * 7.3 + vTp.z * 5.1); if (vTp.y > vCut + jag) discard; float rim = 1.0 - smoothstep(0.0, 2.2, vCut + jag - vTp.y); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5, 0.46, 0.42), rim * step(vCut, 9000.0)); }`); }; return m; };
  const brickT = texBrickAtlas(), stucT = texStuccoAtlas(); [brickT, stucT].forEach((tx) => { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8; });
  const curtain = texGlassAtlas();
  curtain.wrapS = curtain.wrapT = THREE.RepeatWrapping;
  const MATS = { brick: facShader(TOON({ map: brickT, roughness: 0.85 }), 12, 12), stucco: facShader(TOON({ map: stucT, roughness: 0.85 }), 12, 12), glass: facShader(TOON({ map: curtain, roughness: 0.25, metalness: 0.35 }), 36, 72) };
  const COLS = { brick: ['#ffffff', '#f0e0d8', '#e8d0c0', '#d8c8c0', '#fff0e0'], stucco: ['#f2e6c8', '#e8c890', '#d8a878', '#c8d8d0', '#f0d0c0', '#e0e0d0', '#a8c0c8', '#f4ead8'], glass: ['#c8ccd4', '#b8bcc4', '#d4cfc6', '#aeb6c2'] };
  const floorsT = g3Tex((x, w, h) => { const Rf = RNG('floors'); x.fillStyle = '#2a2622'; x.fillRect(0, 0, w, h); for (let k = 0; k < 60; k++) blot2(x, Rf.r(0, w), Rf.r(0, h), Rf.r(8, 30), Rf.pick(['rgba(120,90,60,0.35)', 'rgba(60,70,80,0.35)', 'rgba(150,140,120,0.25)']));
    for (let fl = 0; fl < 4; fl++) { x.fillStyle = '#b8b0a2'; x.fillRect(0, fl * h / 4, w, h / 4 * 0.16); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(0, fl * h / 4 + h / 4 * 0.16, w, 4); }
    for (let c = 0; c < 4; c++) { x.fillStyle = '#8a847a'; x.fillRect(c * w / 4 + w / 8 - 6, 0, 12, h); } speck(x, w, h, 4000, ['rgba(255,255,255,0.08)', 'rgba(0,0,0,0.2)'], Rf, 1, 3); }, 256, 256);
  floorsT.wrapS = floorsT.wrapT = THREE.RepeatWrapping;
  const BL = { brick: [], stucco: [], glass: [] };
  const addB = (kind, x, z, sx, sz, h, row) => BL[kind].push({ kind, x, z, sx, sz, h, row, y0: GY, col: R.pick(COLS[kind]) });
  zRuns.forEach(([a, b]) => { for (const s of [-1, 1]) { let z = a + 1; while (z < b - 4) { const sz = Math.min(R.r(10, 22), b - 1 - z); if (sz < 6) break; const kind = R.f() < 0.5 ? 'brick' : R.f() < 0.75 ? 'stucco' : 'glass', sx = R.r(16, 24);
        addB(kind, s * (BX + sx / 2), z + sz / 2, sx, sz - 0.3, kind === 'glass' ? R.r(30, 60) : R.r(13, 34), 1); z += sz; }
      z = a + 2; while (z < b - 6) { const sz = Math.min(R.r(16, 30), b - 2 - z); if (sz < 8) break; const kind = R.f() < 0.45 ? 'glass' : R.f() < 0.6 ? 'brick' : 'stucco', sx = R.r(18, 28); addB(kind, s * (BX + 26 + sx / 2), z + sz / 2, sx, sz - 1, kind === 'glass' ? R.r(50, 120) : R.r(28, 60), 2); z += sz + R.r(1, 4); } } });
  for (const s2 of [-1, 1]) for (const [zEdge, dir] of [[BLV.z0, -1], [BLV.z1, 1]]) { let x = BX + 56; while (x < 520) { const sx = R.r(12, 26), sz = R.r(16, 24), kind = R.f() < 0.45 ? 'brick' : R.f() < 0.6 ? 'stucco' : 'glass';
      addB(kind, s2 * (x + sx / 2), zEdge + dir * sz / 2, sx - 0.3, sz, kind === 'glass' ? R.r(35, 90) : R.r(14, 40), x < 120 ? 1 : 2); x += sx; } }
  for (let bx = 72; bx < 520; bx += R.r(40, 52)) for (let bz = SEAZ + 30; bz < 300; bz += R.r(38, 50)) for (const s of [-1, 1]) { if (R.f() < 0.22 || (bz > BLV.z0 - 30 && bz < BLV.z1 + 30)) continue; const far = Math.abs(bz - CAMZ) > 200 || bx > 140, kind = R.f() < 0.4 ? 'glass' : R.f() < 0.55 ? 'brick' : 'stucco';
    addB(kind, s * (bx + R.r(-4, 4)), bz + R.r(-4, 4), R.r(20, 34), R.r(20, 34), kind === 'glass' ? R.r(40, 110) : R.r(18, 55), far ? 3 : 2); }
  for (let k = 0; k < 44; k++) { const x = R.r(60, 360) * (k % 4 === 0 ? -1 : 1), z = R.r(-480, 120), h = R.r(110, 240); addB('glass', x, z, R.r(26, 42), R.r(26, 42), h, 3); }
  const BUI = []; const meshes = {}; for (const kind in BL) { const L = BL[kind], geo = new THREE.BoxGeometry(1, 1, 1); geo.setAttribute('aCut', new THREE.InstancedBufferAttribute(new Float32Array(L.length).fill(9e3), 1)); geo.attributes.aCut.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aPeel', new THREE.InstancedBufferAttribute(new Float32Array(L.length), 1)); geo.attributes.aPeel.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aVar', new THREE.InstancedBufferAttribute(new Float32Array(L.map(() => Math.floor(R.f() * 4))), 1)); L.forEach((b, i) => (b.var = geo.attributes.aVar.array[i]));
    const m = IM(geo, MATS[kind], L.length); m.frustumCulled = false; L.forEach((b, i) => { m.setMatrixAt(i, M4c(b.x, GY + b.h / 2, b.z, 0, b.sx, b.h, b.sz)); m.setColorAt(i, lin(b.col)); b.mi = i; b.mesh = m;
      const d = Math.hypot(b.x - CAMX, b.z - CAMZ); b.dC = d; b.lean = R.r(0.05, 0.2) * (b.row === 3 ? 0.4 : 1); b.side = R.n(0.4); b.tH = 31 + 19 * clamp((b.z - SEAZ) / (CAMZ + 40 - SEAZ)) * (1 - 0.25 * clamp((Math.abs(b.x) - 60) / 400)) + R.r(-1.5, 1.5); b.dur = R.r(4, 7); BUI.push(b); }); scene.add(m); meshes[kind] = m; }
  const coreGeo = new THREE.BoxGeometry(1, 1, 1); coreGeo.setAttribute('aCut', new THREE.InstancedBufferAttribute(new Float32Array(BUI.length).fill(9e3), 1)); coreGeo.attributes.aCut.setUsage(THREE.DynamicDrawUsage); coreGeo.setAttribute('aPeel', new THREE.InstancedBufferAttribute(new Float32Array(BUI.length), 1)); coreGeo.setAttribute('aVar', new THREE.InstancedBufferAttribute(new Float32Array(BUI.length), 1));
  const cores = IM(coreGeo, facShader(TOON({ map: floorsT }), 12, 12, 1), BUI.length); cores.frustumCulled = false; cores.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(cores);
  BUI.forEach((b, i) => { b.ci = i; cores.setMatrixAt(i, M4c(b.x, GY + b.h / 2, b.z, 0, b.sx * 0.94, b.h * 0.99, b.sz * 0.94)); });
  // rubble piles that grow at the foot of each near building as it is eaten
  const PILE = []; BUI.forEach((b) => { if (b.row === 3) return; for (let k = 0; k < 5; k++) PILE.push({ b, x: b.x + R.r(-b.sx * 0.5, b.sx * 0.5), z: b.z + R.r(-b.sz * 0.4, b.sz * 0.6), s: R.r(2, 5) * Math.min(1, b.h / 25), r: R.r(0, 6) }); });
  const piles = IM(new THREE.DodecahedronGeometry(1, 1), TOON({ color: 0x8a6a58, roughness: 1, flatShading: true }), PILE.length); piles.instanceMatrix.setUsage(THREE.DynamicDrawUsage); piles.frustumCulled = false; scene.add(piles);
  // roof boxes (water tanks, AC units, parapets) on the near rows; they fly first
  const roofs = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ color: 0x8a8680, roughness: 0.8 }), 160); roofs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); roofs.frustumCulled = false; scene.add(roofs);
  const RF = []; BUI.forEach((b) => { if (b.row === 3 || RF.length >= 160) return; for (let k = 0; k < 2; k++) RF.push(mkFly(R, { b, x: b.x + R.r(-b.sx * 0.3, b.sx * 0.3), y: GY + b.h + 0.8, z: b.z + R.r(-b.sz * 0.3, b.sz * 0.3), s: [R.r(1.5, 3.5), R.r(1.2, 2.4), R.r(1.5, 3.5)], t0: b.tH - R.r(1.5, 4), v: R.r(40, 80), lift: R.r(0.2, 0.5) })); });
  // shop fronts on the avenue: dark glass, an awning, a sign
  const front = BUI.filter((b) => b.row === 1);
  const SHOPS = []; { const Rs = RNG('shopsel'); BUI.forEach((b) => { if (b.row === 3) return; const sa = Math.sign(b.x);
      if (b.row === 1 && Math.abs(Math.abs(b.x) - b.sx / 2 - BX) < 0.6 && !(b.z > BLV.z0 - 2 && b.z < BLV.z1 + 2)) SHOPS.push({ b, x: sa * (BX - 0.05), z: b.z, ry: -sa * Math.PI / 2, w: b.sz * 0.96, v: Math.floor(Rs.f() * 6) });
      if (Math.abs(b.z - b.sz / 2 - BLV.z1) < 0.6) SHOPS.push({ b, x: b.x, z: BLV.z1 + 0.05, ry: Math.PI, w: b.sx * 0.96, v: Math.floor(Rs.f() * 6) });
      if (Math.abs(b.z + b.sz / 2 - BLV.z0) < 0.6) SHOPS.push({ b, x: b.x, z: BLV.z0 - 0.05, ry: 0, w: b.sx * 0.96, v: Math.floor(Rs.f() * 6) }); }); }
  const shopGeo = new THREE.PlaneGeometry(1, 1); shopGeo.setAttribute('aV', new THREE.InstancedBufferAttribute(new Float32Array(SHOPS.map((q) => q.v)), 1));
  const shopM = TOON({ map: texShops() }); shopM.onBeforeCompile = (sh) => { sh.vertexShader = 'attribute float aV;\n' + sh.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vUv.y = (vUv.y + aV) / 6.0;'); };
  const shopG = IM(shopGeo, shopM, SHOPS.length, false); SHOPS.forEach((q, i) => shopG.setMatrixAt(i, M4c(q.x, GY + 2.05, q.z, q.ry, q.w, 4.0, 1))); shopG.instanceMatrix.setUsage(THREE.DynamicDrawUsage); shopG.frustumCulled = false; scene.add(shopG);
  // façade details: cornices, AC units, fire escapes (they come off with the skin)
  const corn = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ color: 0xd8d0c0 }), BUI.length); corn.instanceMatrix.setUsage(THREE.DynamicDrawUsage); corn.frustumCulled = false; scene.add(corn);
  const DET = []; { const Rd = RNG('details'); BUI.forEach((b) => { if (b.row !== 1 || b.dC > 260) return; const sa = Math.sign(b.x), fx = sa * (BX - 0.35), floors = Math.floor(b.h / 3);
      for (let fl = 1; fl < floors; fl++) for (let k = 0; k < 3; k++) if (Rd.f() < 0.22) DET.push(mkFly(Rd, { type: 'ac', b, x: fx, y: GY + fl * 3 + 0.4, z: b.z + Rd.r(-b.sz * 0.4, b.sz * 0.4), ry: 0, t0: b.tH - 6 + Rd.r(0, 5), v: Rd.r(40, 90), lift: Rd.r(0.2, 0.5) }));
      if (b.kind === 'brick' && Rd.f() < 0.7) { const zc = b.z + Rd.r(-b.sz * 0.2, b.sz * 0.2); for (let fl = 1; fl < floors; fl++) { DET.push(mkFly(Rd, { type: 'plat', b, x: sa * (BX - 0.6), y: GY + fl * 3 + 0.05, z: zc, ry: 0, t0: b.tH - 5 + Rd.r(0, 4), v: Rd.r(30, 70), lift: Rd.r(0.1, 0.3) }));
          DET.push(mkFly(Rd, { type: 'stair', b, x: sa * (BX - 0.55), y: GY + fl * 3 - 1.45, z: zc + (fl % 2 ? 0.6 : -0.6), ry: fl % 2 ? 1 : -1, t0: b.tH - 5 + Rd.r(0, 4), v: Rd.r(30, 70), lift: Rd.r(0.1, 0.3) })); } } }); }
  const detM = { ac: IM(new THREE.BoxGeometry(0.6, 0.45, 0.8), TOON({ color: 0xb8bcc0 }), DET.length, false), plat: IM(new THREE.BoxGeometry(1.1, 0.08, 3.4), TOON({ color: 0x1e1e1e }), DET.length, false), stair: IM(new THREE.BoxGeometry(0.7, 0.06, 3.4), TOON({ color: 0x1e1e1e }), DET.length, false) };
  const detRail = IM(new THREE.BoxGeometry(0.04, 0.9, 3.4), TOON({ color: 0x1e1e1e }), DET.length, false);
  [...Object.values(detM), detRail].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const awnT = [['#c8372d', '#f4efe4'], ['#1f6a4a', '#f4efe4'], ['#1f4e8a', '#f2c94c'], ['#e86f2a', '#f4efe4'], ['#6a2a5a', '#e8dcc4']].map(([a, b], k) => texAwn('awn' + k, a, b));
  const awnings = awnT.map((tx) => { const im = IM(new THREE.PlaneGeometry(1, 1), TOON({ map: tx, roughness: 0.85, side: THREE.DoubleSide }), 60); im.instanceMatrix.setUsage(THREE.DynamicDrawUsage); im.frustumCulled = false; scene.add(im); return im; });
  const AWN = [], acnt = [0, 0, 0, 0, 0]; front.forEach((b, k) => { if (R.f() < 0.25) return; const kind = k % 5, s = -Math.sign(b.x); AWN.push(mkFly(R, { b, kind, slot: acnt[kind]++, x: Math.sign(b.x) * BX + s * 0.7, y: GY + 3.05, z: b.z, L: b.sz * R.r(0.5, 0.8), depth: 1.6, s, t0: R.r(19.5, 26), lift: R.r(0.25, 0.5), spin: R.r(2, 6), v: R.r(35, 70) })); });
  const signs = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ roughness: 0.5, emissive: 0x111111 }), 60); signs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); signs.frustumCulled = false; scene.add(signs);
  const SIG = []; front.forEach((b) => { if (SIG.length >= 60 || R.f() < 0.4) return; SIG.push(mkFly(R, { x: Math.sign(b.x) * (BX - 0.1) - Math.sign(b.x) * 0.6, y: GY + 5.6, z: b.z + R.r(-2, 2), w: R.r(3, 7), col: R.pick(['#f2c94c', '#c8372d', '#2f6fd1', '#f4efe4', '#2a9d8f', '#1e1e22', '#e86fa8']), t0: R.r(20, 28), lift: R.r(0.3, 0.6), v: R.r(40, 80) })); }); SIG.forEach((q, i) => signs.setColorAt(i, lin(q.col)));
  // street furniture: traffic lights at the crossings, street lamps, a bus shelter, a kiosk, hydrants, bins, bollards
  const poleM = metal, POL = [];
  const pole = (x, z, h, arm, kind) => POL.push(mkFly(R, { x, y: GY, z, h, arm, kind, t0: R.r(27, 36), v: R.r(30, 60), lift: R.r(0.15, 0.35), spin: R.r(0.8, 2.5), a: R.r(5, 10) }));
  XSTREETS.forEach(([a, b]) => { for (const s of [-1, 1]) { pole(s * (ROADX + 0.8), a - 4.2, 5.2, s * -3.5, 'tl'); pole(s * (ROADX + 0.8), b + 4.2, 5.2, s * -3.5, 'tl'); } });
  for (let z = SEAZ + 6; z < 280; z += 24) if (!inX(z)) for (const s of [-1, 1]) pole(s * (ROADX + 0.6), z + (s > 0 ? 6 : 0), 8, s * -1.6, 'lamp');
  const polI = IM(new THREE.CylinderGeometry(0.09, 0.12, 1, 8).translate(0, 0.5, 0), poleM, POL.length), armI = IM(new THREE.CylinderGeometry(0.06, 0.06, 1, 6).translate(0, 0.5, 0), poleM, POL.length), headI = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ color: 0x1a1c1e, roughness: 0.5 }), POL.length * 2);
  [polI, armI, headI].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const lightsG = new THREE.BufferGeometry(); lightsG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(POL.length * 3), 3)); lightsG.setAttribute('color', new THREE.BufferAttribute(new Float32Array(POL.length * 3), 3));
  const glowTex = g3Radial([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(255,255,255,0.7)'], [1, 'rgba(255,255,255,0)']], 64);
  const tlights = new THREE.Points(lightsG, new THREE.PointsMaterial({ size: 0.55, map: glowTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); tlights.frustumCulled = false; scene.add(tlights);
  const SM = []; { const Rs = RNG('smalls'); for (let k = 0; k < 140; k++) { const s = Rs.f() < 0.5 ? -1 : 1, z = Rs.r(-70, 120), x = s * Rs.r(ROADX + 1.2, BX - 0.8); if (inX(z)) continue; const kind = Rs.pick(['bin', 'crate', 'chair', 'pot', 'scooter', 'table', 'box', 'hydrant', 'bollard', 'bench']);
    const dims = { bin: [0.6, 1.0, 0.6], crate: [0.6, 0.4, 0.4], chair: [0.45, 0.85, 0.45], pot: [0.6, 0.7, 0.6], scooter: [0.4, 1.0, 1.6], table: [0.8, 0.75, 0.8], box: [0.6, 0.5, 0.6], hydrant: [0.35, 0.8, 0.35], bollard: [0.25, 0.9, 0.25], bench: [0.6, 0.8, 1.8] }[kind];
    SM.push(mkFly(Rs, { x, y: SW + dims[1] / 2, z, dims, col: kind === 'hydrant' ? '#c8302a' : Rs.pick(['#3a6a3a', '#c8372d', '#8a6a48', '#2a2e33', '#f2efe8', '#2f6fd1', '#b0603a']), t0: Rs.r(20.5, 30), v: Rs.r(35, 75), lift: Rs.r(0.15, 0.4), hop: Rs.r(0, 1.2), spin: Rs.r(1.5, 5) })); } }
  const small = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ roughness: 0.7 }), SM.length); small.instanceMatrix.setUsage(THREE.DynamicDrawUsage); small.frustumCulled = false; scene.add(small); SM.forEach((q, i) => small.setColorAt(i, lin(q.col)));
  const kiosk = new THREE.Group(); kiosk.position.set(-ROADX - 2.4, SW, 22); scene.add(kiosk); { const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.4, 2.8), TOON({ color: 0x2a6a4a, roughness: 0.6 })); body.position.y = 1.2; body.castShadow = true; kiosk.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 3.4), TOON({ color: 0x1e3a2a })); top.position.y = 2.5; kiosk.add(top); const mags = IM(new THREE.BoxGeometry(0.02, 0.3, 0.22), TOON({ roughness: 0.6 }), 40, false); const Rm = RNG('mags'); for (let k = 0; k < 40; k++) { mags.setMatrixAt(k, M4c(1.12, 0.6 + (k % 4) * 0.4, -1.2 + Math.floor(k / 4) * 0.26)); mags.setColorAt(k, lin(Rm.pick(['#c8372d', '#f2c94c', '#2f6fd1', '#f4efe4', '#e86fa8']))); } kiosk.add(mags); }
  const kioskFly = mkFly(R, { x: kiosk.position.x, y: SW, z: 22, t0: 29.5, v: 40, a: 7, lift: 0.2, spin: 1.6, hop: 1.4 });
  // the median trees: trunks and crowns of leaf cards (they are stripped, then uprooted)
  const leafT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); const Rl = RNG('leafcard'); for (let k = 0; k < 90; k++) { const px = Rl.r(8, w - 8), py = Rl.r(8, w - 8), r = Rl.r(4, 9), a = Rl.r(0, TAU); x.fillStyle = Rl.pick(['#3a6a2a', '#4a7a32', '#2e5a24', '#5a8a3a', '#6a9a42']); x.beginPath(); x.ellipse(px, py, r, r * 0.5, a, 0, TAU); x.fill(); } }, 128, 128);
  const leafM = TOON({ map: leafT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.8 }), trunkM = TOON({ color: 0x5a4632, roughness: 0.95 });
  const TREES = []; for (let x = 16; x < 300; x += 12) TREES.push({ x, z: 30 + R.r(-0.3, 0.3), h: R.r(4.5, 6.5), t0: R.r(26, 34) }); for (let z = -330; z < 200; z += 12) if (!inX(z)) TREES.push({ x: R.r(-0.3, 0.3), z: z + R.r(-1, 1), h: R.r(4.5, 6.5), t0: R.r(26, 34) - (z < -100 ? 3 : 0) });
  const trunks = IM(new THREE.CylinderGeometry(0.16, 0.26, 1, 8).translate(0, 0.5, 0), trunkM, TREES.length); trunks.instanceMatrix.setUsage(THREE.DynamicDrawUsage); trunks.frustumCulled = false; scene.add(trunks);
  const LEAF = []; TREES.forEach((tr, ti) => { for (let k = 0; k < (tr.z > -120 && tr.x < 120 ? 40 : 16); k++) { const a = R.r(0, TAU), r = R.r(0, 2.2), y = tr.h + R.r(-1.2, 1.4); LEAF.push(mkFly(R, { ti, x: tr.x + Math.cos(a) * r, y: GY + y, z: tr.z + Math.sin(a) * r, s: R.r(1.2, 2.0), ry: R.r(0, TAU), rx: R.r(-0.8, 0.8), t0: R.r(17.8, 24) + (R.f() < 0.3 ? 8 : 0), v: R.r(40, 90), lift: R.r(0.2, 0.6), spin: R.r(3, 9) })); } });
  const leaves = IM(new THREE.PlaneGeometry(1, 1), leafM, LEAF.length, false); leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage); leaves.frustumCulled = false; scene.add(leaves);
  // traffic: cars, taxis and a bus driving both ways; they skid when the planet brakes; then the wind takes them
  const carShape = (pts, width) => { const sh = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); const gm = new THREE.ExtrudeGeometry(sh, { depth: width, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }); gm.translate(0, 0, -width / 2); gm.rotateY(-Math.PI / 2); gm.computeVertexNormals(); return gm; };
  const bodyG = carShape([[-2.12, 0.2], [2.12, 0.2], [2.2, 0.42], [2.12, 0.68], [0.95, 0.8], [0.3, 1.3], [-0.95, 1.32], [-1.65, 0.86], [-2.15, 0.78], [-2.22, 0.45]], 1.66);
  const glassG = carShape([[0.88, 0.83], [0.3, 1.27], [-0.93, 1.29], [-1.58, 0.88]], 1.72);
  const carBody = IM(bodyG, TOON({}), 124), carCab = IM(glassG, TOON({ color: 0x1e2834 }), 124), carWh = IM(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 16), TOON({ color: 0x151515 }), 124 * 4), carRim = IM(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 10), TOON({ color: 0xc8ccd0 }), 124 * 4), carLt = IM(new THREE.BoxGeometry(1.5, 0.12, 0.05), new THREE.MeshBasicMaterial({ color: 0xfff2d0 }), 124, false), carTl = IM(new THREE.BoxGeometry(1.5, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xc8201a }), 124, false), carBp = IM(new THREE.BoxGeometry(1.72, 0.16, 0.12), TOON({ color: 0x2a2a2a }), 248);
  [carBody, carCab, carWh, carRim, carLt, carTl, carBp].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const Rc2 = RNG('cross'), CAR = []; { const Rc = RNG('traffic'); const lanes = [[-7.5, 1], [-2.6, 1], [2.6, -1], [7.5, -1]];
    for (let k = 0; k < 90; k++) { let lane, z0, v, parked = false; if (k < 64) { lane = lanes[k % 4]; z0 = Rc.r(-420, 170); v = Rc.r(7, 12); } else { parked = true; const s = k % 2 ? 1 : -1; lane = [s * (ROADX - 1.1), 0]; z0 = Rc.r(-300, 130); v = 0; }
      if (inX(z0) && parked) z0 += 14; const taxi = Rc.f() < 0.2;
      CAR.push(mkFly(Rc, { lx: lane[0], dir: lane[1], z0, v0: v, parked, col: taxi ? '#2a8a5a' : Rc.pick(['#e8e4dc', '#c8372d', '#1f4e8a', '#2a2a2e', '#8a9aa8', '#5a5a60', '#f0f0f0', '#7a1e1e']), taxi, skid: Rc.r(2, 9), spinS: Rc.n(1.2), t0: Rc.r(24.5, 33), v: Rc.r(25, 55), a: Rc.r(5, 9), lift: Rc.r(0.08, 0.22), hop: Rc.r(0.6, 2.2), spin: Rc.r(0.6, 2.4) })); } }
    for (let k = 0; k < 34; k++) { const ln = [[21, 1], [26, 1], [34, -1], [39, -1]][k % 4]; CAR.push(mkFly(Rc2, { ax: true, lx: ln[0], dir: ln[1], z0: Rc2.r(-40, 330), v0: Rc2.r(7, 12), parked: false, col: Rc2.pick(['#e8e4dc', '#c8372d', '#1f4e8a', '#2a2a2e', '#8a9aa8', '#2a8a5a', '#f0f0f0']), skid: Rc2.r(2, 8), spinS: Rc2.n(1.2), t0: Rc2.r(24.5, 33), v: Rc2.r(25, 55), a: Rc2.r(5, 9), lift: Rc2.r(0.08, 0.22), hop: Rc2.r(0.6, 2.2), spin: Rc2.r(0.6, 2.4) })); }
  CAR.forEach((q, i) => carBody.setColorAt(i, lin(q.col)));
  const bus = new THREE.Group(); scene.add(bus); { const body = new THREE.Mesh(new THREE.BoxGeometry(2.55, 3.0, 12), TOON({ color: 0x2a7ab8, roughness: 0.4, metalness: 0.3 })); body.position.y = 1.8; body.castShadow = true; bus.add(body);
    const win = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.0, 11.2), TOON({ color: 0x1a222c, roughness: 0.05, metalness: 0.7 })); win.position.y = 2.45; bus.add(win); const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.25, 12.02), TOON({ color: 0xf2f0e8 })); stripe.position.y = 1.5; bus.add(stripe);
    for (const [wx, wz] of [[-1.2, -4], [1.2, -4], [-1.2, 4], [1.2, 4]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 16), TOON({ color: 0x151515 })); wh.rotation.z = Math.PI / 2; wh.position.set(wx, 0.5, wz); bus.add(wh); } }
  const busQ = mkFly(R, { x: 2.6, y: GY, z: -30, t0: 31.0, v: 30, a: 5, lift: 0.1, spin: 0.7, hop: 2.0 });
  // ground cracks in front of you (they open when the planet brakes)
  const CZ0 = -12, CZ1 = 52, CPATH = []; { const Rk = RNG('crackpaths'); const walk = (x, z, a, L, w0, dep) => { const pts = []; for (let d = 0; d < L; d += 0.45) { a += Rk.n(0.22); x += Math.cos(a) * 0.45; z += Math.sin(a) * 0.45; if (z < CZ0 + 1 || x < -12.5 || x > 12.5) break; pts.push([x, z, w0 * (1 - 0.7 * d / L) * Rk.r(0.55, 1.25)]);
      if (dep > 0 && Rk.f() < 0.035) walk(x, z, a + Rk.n(1.0), (L - d) * 0.45, w0 * 0.55, dep - 1); } CPATH.push(pts); };
    for (let k = 0; k < 7; k++) walk(Rk.r(-9, 11), 49 + Rk.r(-2, 2), -Math.PI / 2 + Rk.n(0.3), Rk.r(26, 58), Rk.r(0.1, 0.2), 3); for (let k = 0; k < 5; k++) walk(Rk.r(-9, 9), Rk.r(8, 40), Rk.r(0, TAU), Rk.r(6, 14), 0.07, 1); }
  const crackT = g3Tex((x, w, h) => { x.clearRect(0, 0, w, h); x.lineCap = 'round'; x.lineJoin = 'round'; const Rk = RNG('crackdraw'), U = (px) => (px + 13) / 26 * w, V = (pz) => (pz - CZ0) / (CZ1 - CZ0) * h, S = w / 26;
    const stroke = (pts, wf, col) => { for (let i = 1; i < pts.length; i++) { x.strokeStyle = col; x.lineWidth = Math.max(1, pts[i][2] * S * wf); x.beginPath(); x.moveTo(U(pts[i - 1][0]), V(pts[i - 1][1])); x.lineTo(U(pts[i][0]), V(pts[i][1])); x.stroke(); } };
    CPATH.forEach((pts) => stroke(pts, 2.4, 'rgba(30,28,26,0.35)')); CPATH.forEach((pts) => stroke(pts, 1.7, 'rgba(92,88,84,0.85)'));
    CPATH.forEach((pts) => stroke(pts, 1.3, 'rgba(22,20,18,1)')); CPATH.forEach((pts) => stroke(pts, 0.7, 'rgba(4,4,4,1)'));
    CPATH.forEach((pts) => pts.forEach(([px, pz, pw], i) => { if (i % 3) return; for (let k = 0; k < 3; k++) { const ox = Rk.n(pw * 2.5), oz = Rk.n(pw * 2.5), r = Rk.r(1, 4); x.fillStyle = Rk.f() < 0.5 ? 'rgba(110,104,98,0.9)' : 'rgba(30,26,22,0.9)'; x.beginPath(); x.moveTo(U(px + ox), V(pz + oz)); x.lineTo(U(px + ox) + r, V(pz + oz) + Rk.n(r)); x.lineTo(U(px + ox) + Rk.n(r), V(pz + oz) + r); x.fill(); } })); }, 1024, 2048, true);
  const crackM = new THREE.MeshBasicMaterial({ map: crackT, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 });
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(26, CZ1 - CZ0).rotateX(-Math.PI / 2), crackM); crack.position.set(0, GY + 0.03, (CZ0 + CZ1) / 2); crack.renderOrder = 3; scene.add(crack);
  const SLB = []; { const Rs = RNG('heave'); CPATH.forEach((pts) => { for (let i = 4; i < pts.length - 2; i += 5) { const [x0, z0, pw] = pts[i], [x1, z1] = pts[i + 1], a = Math.atan2(z1 - z0, x1 - x0); if (pw < 0.15) continue; for (const sd of [-1, 1]) { if (Rs.f() < 0.35) continue; const nx = -Math.sin(a) * sd, nz = Math.cos(a) * sd;
    SLB.push({ x: x0 + nx * (pw + 0.55), z: z0 + nz * (pw + 0.55), ry: -a, tilt: sd * Rs.r(0.06, 0.18), up: Rs.r(0.05, 0.22), w: Rs.r(1.0, 1.8), d: Rs.r(0.8, 1.4), t0: T_BRAKE + Rs.r(0.05, 0.6) }); } } }); }
  const slabs = IM(new THREE.BoxGeometry(1, 0.28, 1), TOON({ map: asph, color: 0xe8e4de }), SLB.length); slabs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); slabs.frustumCulled = false; scene.add(slabs);
  // flying chunks (brick / stucco / glass), recycled by birth time
  const CHN = 3200, chunkMs = { brick: TOON({ map: brickT, roughness: 0.9 }), stucco: TOON({ map: stucT, roughness: 0.9 }), glass: TOON({ map: curtain, roughness: 0.3, metalness: 0.3 }) }, chunks = {}, chL = { brick: [], stucco: [], glass: [] };
  { const Rc = RNG('chunks'); for (let i = 0; i < CHN; i++) { const near = Rc.f() < 0.6, pool = BUI.filter((b) => (near ? b.row < 3 && Math.hypot(b.x - CAMX, b.z - CAMZ) < 140 : true)); const b = pool[Math.floor(Rc.f() * pool.length)], u = Rc.r(0.05, 1), side = Rc.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    chL[b.kind].push(mkFly(Rc, { b, u, x: b.x + (side[0] ? side[0] * b.sx / 2 : Rc.r(-b.sx / 2, b.sx / 2)), z: b.z + (side[1] ? side[1] * b.sz / 2 : Rc.r(-b.sz / 2, b.sz / 2)), y: GY + b.h * u, s: b.row === 3 ? Rc.r(3, 8) : Rc.r(0.5, 3.2), t0: b.tH + (1 - u) * b.dur, v: Rc.r(45, 120), lift: Rc.r(0.08, 0.4), spin: Rc.r(1, 6), col: b.col })); } }
  for (const k in chL) { chunks[k] = IM(new THREE.BoxGeometry(1, 1, 1), chunkMs[k], chL[k].length, false); chunks[k].instanceMatrix.setUsage(THREE.DynamicDrawUsage); chunks[k].frustumCulled = false; chL[k].forEach((q, i) => chunks[k].setColorAt(i, lin(q.col))); scene.add(chunks[k]); }
  // facade panels that peel off as the skin goes (big thin slabs), per material
  const panels = {}, pnL = { brick: [], stucco: [], glass: [] }; { const Rp = RNG('panels'); BUI.forEach((b) => { if (b.row === 3) return; const n = Math.round(Math.min(40, b.sx * b.h / 40)); for (let k = 0; k < n; k++) { const u = Rp.r(0.05, 0.98), side = Rp.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    pnL[b.kind].push(mkFly(Rp, { b, x: b.x + (side[0] ? side[0] * b.sx / 2 : Rp.r(-b.sx / 2, b.sx / 2)), z: b.z + (side[1] ? side[1] * b.sz / 2 : Rp.r(-b.sz / 2, b.sz / 2)), y: GY + b.h * u, w: Rp.r(2.5, 5), h: Rp.r(2.2, 3.4), ry: side[0] ? Math.PI / 2 : 0, t0: b.tH - 7 + Rp.r(0, 6.5), v: Rp.r(40, 100), lift: Rp.r(0.1, 0.5), spin: Rp.r(0.8, 4), col: b.col })); } }); }
  for (const k in pnL) { panels[k] = IM(new THREE.BoxGeometry(1, 1, 0.22), chunkMs[k], pnL[k].length, false); panels[k].instanceMatrix.setUsage(THREE.DynamicDrawUsage); panels[k].frustumCulled = false; pnL[k].forEach((q, i) => panels[k].setColorAt(i, lin(q.col))); scene.add(panels[k]); }
  // fine debris: thousands of dark flecks (brick, glass, plaster) streaming up the avenue once things break
  const DBN = 9000, dbP = new Float32Array(DBN * 3), dbG = new THREE.BufferGeometry(); dbG.setAttribute('position', new THREE.BufferAttribute(dbP, 3));
  const debris = new THREE.Points(dbG, new THREE.PointsMaterial({ size: 0.28, color: 0x4a3a2e, transparent: true, depthWrite: false })); debris.frustumCulled = false; debris.renderOrder = 6; scene.add(debris);
  const dbL = []; { const Rd = RNG('dbpts'); for (let i = 0; i < DBN; i++) dbL.push([Rd.r(-70, 70), Rd.r(0, 70), Rd.r(0, 1), Rd.r(0.5, 1.5), Rd.r(0, TAU)]); }
  // what the ocean carries: chunks of houses, cars, slabs, tumbling in its face
  const wjL = []; { const Rw = RNG('wjunk'); for (let i = 0; i < 520; i++) wjL.push({ u: Rw.f(), v: Rw.r(0.05, 0.95), s: Rw.r(1.5, 9), r: Rw.r(0, TAU), sp: Rw.r(0.5, 2.5), col: Rw.pick(['#b8704e', '#d8c8a8', '#8aa4c4', '#5a4a3a', '#c8372d', '#e8e4dc', '#2a2e33']) }); }
  const wjunk = IM(new THREE.BoxGeometry(1, 0.5, 0.8), TOON({ map: brickT }), wjL.length, false); wjunk.instanceMatrix.setUsage(THREE.DynamicDrawUsage); wjunk.frustumCulled = false; wjL.forEach((q, i) => wjunk.setColorAt(i, lin(q.col))); scene.add(wjunk);
  // people: on both sidewalks, crossing in front of you, waiting at your corner, a few right by you
  const PG = g.PG, NP = 230, PMs = {}; for (const k in PG) { const [geo, n, , mat] = PG[k]; const m = IM(geo.clone(), TOON({}), NP * n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); PMs[k] = m; }
  const SHIRT = ['#d94848', '#2f6fd1', '#f0c33c', '#2a9d8f', '#e86fa8', '#7b4fc9', '#ef8a3a', '#3cae5c', '#1f2d3d', '#c2185b', '#f4f1ea', '#a8402a'], PANTS = ['#2b3a55', '#3a3a3a', '#c8b89a', '#1f2d3d', '#4a3a2a', '#6a7a8a'], SKIN = ['#e8bb94', '#d4a07a', '#b07a54', '#8a5a3a', '#5e3a26', '#f3cfae'], HAIR = ['#2a1d16', '#4a3020', '#1a1a1a', '#7a5230', '#b8b0a8'];
  const pp = [], RP = RNG('cityPeople');
  const mk = (o) => { const skin = lin(RP.pick(SKIN)), shirt = lin(RP.pick(SHIRT)), pants = lin(RP.pick(PANTS)), shorts = RP.f() < 0.4;
    pp.push(Object.assign({ s: RP.r(0.93, 1.06), w: RP.r(0.9, 1.15), ph: RP.r(0, TAU), c: { skin, shirt, pants, shin: shorts ? skin : pants, sleeve: shirt, fore: RP.f() < 0.3 ? shirt : skin, shoe: lin(RP.pick(['#1e1e22', '#f2f0ea', '#5a4030'])), hair: lin(RP.pick(HAIR)) },
      fall: RP.r(1.2, 3.2), fT: T_BRAKE + RP.r(0.05, 0.5), cling: RP.f() < 0.3, fly: mkFly(RP, { t0: RP.r(19.5, 31), v: RP.r(30, 70), a: RP.r(5, 11), lift: RP.r(0.12, 0.4), spin: RP.r(1.5, 5), hop: RP.r(0, 1) }) }, o)); };
  for (let k = 0; k < 130; k++) { const s = RP.f() < 0.5 ? -1 : 1, z = RP.r(-160, 130); if (inX(z)) continue; mk({ kind: 'walk', x: s * RP.r(ROADX + 1.2, BX - 0.6), z, v: RP.r(0.8, 1.4) * (RP.f() < 0.5 ? 1 : -1) }); }
  for (let k = 0; k < 64; k++) { const zz = k % 2 ? RP.r(42.6, 45.4) : RP.r(14.6, 17.4); mk({ kind: 'walkx', x: RP.r(16, 120) * (k % 6 === 0 ? -1 : 1), z: zz, v: RP.r(0.8, 1.4) * (RP.f() < 0.5 ? 1 : -1) }); }
  for (let k = 0; k < 10; k++) mk({ kind: 'cross', x: RP.r(-8, 8), z: 31.8 + RP.r(-1.2, 1.2), v: RP.r(0.9, 1.4) * (k % 2 ? 1 : -1), xing: true });
  [[10.6, 46.4, 2.6], [11.2, 47.4, 2.9], [13.0, 46.0, 3.3], [11.8, 44.4, 3.0], [13.6, 43.0, 3.2], [9.6, 48.6, 2.2], [12.6, 51.8, 3.1]].forEach(([x, z, yaw], k) => mk({ kind: 'stand', x, z: z + 1.5, yaw, near: true, fly: mkFly(RP, { t0: 21.5 + k * 1.4 + RP.r(0, 0.8), v: RP.r(28, 50), a: RP.r(4, 8), lift: RP.r(0.12, 0.3), spin: RP.r(1.5, 4), hop: 0.6 }) }));
  const capI = IM(new THREE.SphereGeometry(0.122, 14, 6, 0, TAU, 0, Math.PI * 0.5).scale(1, 0.9, 1.05).translate(0, 0.02, 0.0), TOON({}), NP, false), bagI = IM(new THREE.BoxGeometry(0.3, 0.38, 0.14), TOON({}), NP, false);
  [capI, bagI].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  pp.length = Math.min(pp.length, NP); pp.forEach((q, i) => { q.hasCap = RP.f() < 0.3; q.hasBag = RP.f() < 0.35; capI.setColorAt(i, lin(RP.pick(['#c8372d', '#1f2d3d', '#f2efe8', '#2f6fd1', '#f0c33c']))); bagI.setColorAt(i, lin(RP.pick(['#2a2e33', '#6a4a30', '#c8372d', '#3a6a3a']))); }); pp.forEach((q, i) => { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMs[k].setColorAt(i * PG[k][1] + j, q.c[PG[k][2]]); });
  // volumetric clouds (they race in from the sea once the wind comes)
  const cloudTex = [0, 1, 2].map((v) => g3Tex((x, w) => { const Rs = RNG('cloudV', v);
    for (let i = 0; i < 160; i++) { const a = Rs.r(0, TAU), d = Math.pow(Rs.f(), 0.6) * w * 0.36, px = w / 2 + Math.cos(a) * d, py = w / 2 + Math.sin(a) * d * 0.62, s = Rs.r(w * 0.05, w * 0.13) * (1.15 - d / (w * 0.5));
      const g2 = x.createRadialGradient(px, py - s * 0.45, 0, px, py, s), top = py < w / 2; g2.addColorStop(0, `rgba(255,255,255,${top ? 0.6 : 0.34})`); g2.addColorStop(0.6, `rgba(${top ? '238,236,240' : '170,176,196'},${Rs.r(0.18, 0.3)})`); g2.addColorStop(1, 'rgba(150,160,180,0)');
      x.fillStyle = g2; x.fillRect(px - s, py - s, 2 * s, 2 * s); } }, 256, 256));
  const vclouds = []; { const Rv = RNG('vcloudSpin'); for (let c = 0; c < 18; c++) { const az = Rv.r(-50, 50) * DEG, D = Rv.r(1500, 6000), cx = Math.sin(az) * D, cz = CAMZ - Math.cos(az) * D, cy = Rv.r(420, 1300), size = Rv.r(280, 680), n = 6 + Math.floor(Rv.f() * 6);
    for (let k = 0; k < n; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex[k % 3], transparent: true, depthWrite: false, fog: false, opacity: 0.8 }));
      s.userData = { x: cx + Rv.n(size * 0.55), y: cy + Rv.n(size * 0.14) + (k === 0 ? size * 0.12 : 0), z: cz + Rv.n(size * 0.4), w: size * Rv.r(0.6, 1.05), o: Rv.r(0.55, 0.9) }; s.renderOrder = 2; scene.add(s); vclouds.push(s); } } }
  const GN = 5000, gP = new Float32Array(GN * 3), gG = new THREE.BufferGeometry(); gG.setAttribute('position', new THREE.BufferAttribute(gP, 3));
  const grit = new THREE.Points(gG, new THREE.PointsMaterial({ size: 0.09, color: 0x8a7a64, transparent: true, depthWrite: false })); grit.frustumCulled = false; grit.renderOrder = 7; scene.add(grit);
  const gL = []; { const Rg = RNG('grit'); for (let i = 0; i < GN; i++) gL.push([Rg.r(-14, 14), Rg.r(-2, 26), Rg.r(0, 1), Rg.r(0.6, 1.4), Rg.r(0, TAU)]); }
  const scraps = IM(new THREE.PlaneGeometry(0.22, 0.16), TOON({ roughness: 0.8, side: THREE.DoubleSide }), 600, false); scraps.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scraps.frustumCulled = false; scene.add(scraps);
  { const Rs = RNG('scrapc'); for (let i = 0; i < 600; i++) scraps.setColorAt(i, lin(Rs.pick(['#f4f1ea', '#e8e0c8', '#6a8a3a', '#4a6a2a', '#c8a050', '#d8d0c0']))); }
  GC = { SHOPS, corn, DET, detM, detRail, capI, bagI, slabs, SLB, carRim, carTl, carBp, cores, panels, pnL, debris, dbP, dbG, dbL, wjunk, wjL, PILE, piles, meshes, BUI, roofs, RF, shopG, front, awnings, AWN, signs, SIG, POL, polI, armI, headI, tlights, lightsG, small, SM, kiosk, kioskFly, TREES, trunks, LEAF, leaves, carBody, carCab, carWh, carLt, CAR, bus, busQ, crack, crackM, chunks, chL, PMs, pp, vclouds, grit, gP, gG, gL, scraps };
  return GC;
}

// a person (from sol's poseS) + a whole-body tumble (tx, tz) for when the wind takes them
function poseP(PMx, PG, i, o) {
  const { x, y, z, yaw, s, w } = o, walk = o.walk || 0, p = o.p || 0, ears = o.ears || 0, bend = o.bend || 0, kneel = o.kneel || 0, lie = o.lie || 0, sway = o.sway || 0, flail = o.flail || 0, brace = o.brace || 0;
  let base = M4().compose(_v.set(x, y - 0.44 * kneel, z), _q.setFromEuler(_e.set(0, yaw, 0)), _s.set(s * w, s, s * w)), put = (k, j, m) => PMx[k].setMatrixAt(i * PG[k][1] + j, _m.copy(m));
  if (o.tx || o.tz) base = base.multiply(Tr(0, 0.9, 0)).multiply(Rx(o.tx || 0)).multiply(Rz(o.tz || 0)).multiply(Tr(0, -0.9, 0));
  if (lie > 0) base = base.multiply(Tr(0, 0.15 * lie, 0)).multiply(Rx(-1.45 * lie));
  const A = 0.42 * walk, Ak = 0.5 * walk, Aa = 0.35 * walk, by = 0.92, up = base.clone().multiply(Tr(0, by, 0)).multiply(Rx(0.85 * bend + 0.4 * brace)).multiply(Tr(0, -by, 0));
  for (const j of [0, 1]) { const fl = flail * Math.sin(TT * (9 + j * 3) + sway * (j + 1)), hip = lerp((j ? 1 : -1) * Math.sin(p) * A, -0.05, kneel) + 0.6 * fl, knee = lerp(0.04 + Ak * Math.max(0, Math.sin(p + 1.7 + (j ? Math.PI : 0))), 1.62, kneel) + 0.6 * Math.abs(fl);
    const th = base.clone().multiply(Tr(j ? 0.095 : -0.095, 0.9, 0)).multiply(Rx(hip)), sn = th.clone().multiply(Tr(0, -0.44, 0)).multiply(Rx(knee));
    put('thigh', j, th); put('shin', j, sn); put('shoe', j, sn.clone().multiply(Rx(-knee * 0.4 - hip * 0.3)));
    const sg = j ? 1 : -1, sh = ((j ? -1 : 1) * Math.sin(p) * Aa) * (1 - ears) * (1 - flail) - 0.25 * ears - 1.2 * brace - 2.2 * flail * (0.5 + 0.5 * Math.sin(TT * 7 + j * 2 + sway)), side = sg * (0.09 + 1.25 * ears + 0.9 * flail * (0.5 + 0.5 * Math.sin(TT * 5 + j + sway)));
    const ua = up.clone().multiply(Tr(j ? 0.2 : -0.2, 1.4, 0)).multiply(Rz(side)).multiply(Rx(sh)), fa = ua.clone().multiply(Tr(0, -0.29, 0)).multiply(Rz(-sg * 2.45 * ears)).multiply(Rx(-0.3 * (1 - ears) - 0.5 * brace));
    put('uarm', j, ua); put('farm', j, fa); put('hand', j, fa); }
  put('hips', 0, base.clone().multiply(Tr(0, by, 0))); put('torso', 0, up.clone().multiply(Tr(0, by + 0.02, 0)));
  put('neck', 0, up.clone().multiply(Tr(0, by + 0.53, 0))); const hd = up.clone().multiply(Tr(0, by + 0.68, 0)).multiply(Rx(0.18 * ears + 0.25 * bend + 0.3 * brace));
  put('head', 0, hd); put('hair', 0, hd.clone().multiply(Tr(0, 0.025, -0.012))); put('hairB', 0, hd.clone().multiply(Tr(0, -0.08, -0.07)));
  if (o.acc) { o.acc.cap.setMatrixAt(i, o.acc.q.hasCap ? hd.clone().multiply(Tr(0, 0.035, 0)) : _hid); o.acc.bag.setMatrixAt(i, o.acc.q.hasBag ? up.clone().multiply(Tr(0, by + 0.28, -0.17)) : _hid); }
}
const inXs = (z) => XSTREETS.some(([a, b]) => z > a - 1 && z < b + 1);
const groundY = (x, z) => ((Math.abs(x) > ROADX && !inXs(z)) || (z > BLV.z0 - 1 && z < BLV.z1 + 1 && Math.abs(x) > ROADX && (z < BLV.r0 || z > BLV.r1)) ? SW : GY);
function streetPose(q, t) {
  // before the brake: walking / crossing / standing; at the brake they are thrown east (towards you), stumble and fall; some
  // cling on to poles and cars; when the wind comes they are dragged, then lifted and tumbled up the street past you
  let x = q.x, z = q.z, yaw = q.yaw || 0, walk = 0, p = t * 5.6 + q.ph;
  const tw = Math.min(t, q.fT);
  if (q.kind === 'walk') { z = q.z + q.v * tw; yaw = q.v > 0 ? 0 : Math.PI; walk = t < q.fT ? 1 : 0; }
  if (q.kind === 'cross' || q.kind === 'walkx') { x = q.x + q.v * tw; yaw = q.v > 0 ? Math.PI / 2 : -Math.PI / 2; walk = t < q.fT ? 1 : 0; }
  const a = t - q.fT; z += a > 0 ? q.fall * EZ.o3(clamp(a / 0.9)) : 0;
  const fallen = ss(q.fT + 0.1, q.fT + 0.7, t), drag = Math.max(0, t - 17.5) * ss(17.5, 22, t) * (q.cling ? 0.15 : 0.5) * W01(t);
  z += drag * drag * 0.6;
  const f = flyP(q.fly, t);
  if (f) { if (f.z > CAMZ + 40 || f.d > 300) return null; return { x: x + f.x - q.fly.x, y: groundY(x, z) + f.y - q.fly.y, z: z + f.z - q.fly.z, yaw, walk: 0, p, tx: f.r * 0.9, tz: f.r * 0.5, flail: 1, lie: 0 }; }
  return { x, y: groundY(x, z), z, yaw, walk, p, lie: q.cling ? 0.5 * fallen : fallen, ears: a > 0 && a < 6 ? 0.6 * ss(q.fT + 0.8, q.fT + 1.4, t) : 0, brace: q.cling ? ss(16, 18, t) : 0, kneel: q.cling ? ss(q.fT + 1.0, q.fT + 1.8, t) : 0, flail: 0.25 * fallen * (q.cling ? 0.5 : 1) };
}
// a car before it flies: driving, then skidding east (towards you) and spinning when the planet brakes
function carPre(q, t) { const tb = Math.min(t, T_BRAKE), a = Math.max(0, t - T_BRAKE), run = q.dir * q.v0 * (tb + (1 - Math.exp(-a * 2.2)) / 2.2), sk = q.skid * EZ.o3(clamp(a / 1.6));
  if (q.ax) return { x: q.z0 + run, z: q.lx + sk * 0.6, yaw: (q.dir > 0 ? Math.PI / 2 : -Math.PI / 2) + q.spinS * EZ.o3(clamp(a / 1.4)) };
  return { x: q.lx + 0.4 * Math.sin(a * 0.8 + q.ph) * Math.min(1, a), z: q.z0 + run + sk, yaw: (q.dir > 0 ? 0 : Math.PI) + q.spinS * EZ.o3(clamp(a / 1.4)) }; }
const busPre = (t) => { const a = Math.max(0, t - T_BRAKE); return { x: 2.6 + 0.6 * Math.min(1, a), z: 58 - 6 * Math.min(t, T_BRAKE) - 6 * (1 - Math.exp(-a * 1.6)) / 1.6 + 5 * EZ.o3(clamp(a / 1.8)), yaw: Math.PI + 0.35 * EZ.o3(clamp(a / 1.5)) }; };

function updateSpin() {
  const g = g3(), o = gC(), t = TT, c = camPoseC(t), w = W01(t), dust = ss(31, 42, t), storm = ss(48, 54, t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.fov = 66; g.cam.updateProjectionMatrix();
  g.sky.position.copy(g.cam.position); g.stars.position.copy(g.cam.position); g.stars.visible = false;
  const su = g.skyU, wet = ss(57.5, 61, t), clear = ss(56, 58.5, t);
  su.top.value.copy(C3('#3f7fd8', '#8a6a4a', dust).lerp(lin('#3a3226'), storm * 0.6).lerp(lin('#1e2a2c'), wet)); su.mid.value.copy(C3('#88b8ea', '#b08a64', dust).lerp(lin('#6a5440'), storm * 0.5).lerp(lin('#2e3a3a'), wet)); su.hor.value.copy(C3('#dcecf6', '#c8a47c', dust).lerp(lin('#8a7258'), storm * 0.5).lerp(lin('#46504c'), wet));
  su.moonDir.value.copy(SUN); su.halo.value = 0.5 * (1 - dust); su.haloW.value = 0.004; su.fire.value = 0; su.dark.value = 0;
  o.vclouds.forEach((s) => { const u = s.userData, run = t < 17 ? 0 : Math.pow(t - 17, 2) * 9 * (0.4 + w); s.position.set(u.x, u.y, u.z + run); s.scale.set(u.w * (1 + 0.6 * dust), u.w * 0.62, 1); s.material.opacity = u.o * (1 - 0.7 * dust) * (1 - wet); s.material.color.copy(C3('#ffffff', '#c8a888', dust)); s.visible = s.material.opacity > 0.02 && u.z + run < CAMZ + 2000; });
  g.scene.fog.color.copy(C3('#dbe8f2', '#b8986e', dust).lerp(lin('#7a6248'), storm).lerp(lin('#2e3634'), wet)); g.scene.fog.near = lerp(lerp(300, 30, dust), 200, clear); g.scene.fog.far = lerp(lerp(12000, 2600, dust) * (1 - 0.25 * storm), 5000, clear);
  g.key.target.position.set(CAMX - 15, 0, CAMZ - 60); g.key.target.updateMatrixWorld(); g.key.position.copy(g.key.target.position).addScaledVector(SUN.clone().setY(0.32).normalize(), 500);
  if (!g.key.userData.boxed) { Object.assign(g.key.shadow.camera, { left: -110, right: 110, top: 110, bottom: -110, near: 200, far: 900 }); g.key.shadow.camera.updateProjectionMatrix(); g.key.shadow.bias = -0.0004; g.key.shadow.normalBias = 0.4; g.key.userData.boxed = true; }
  g.key.color.copy(C3('#fff2dc', '#e8c49a', dust)); g.key.intensity = lerp(3.0, 1.0, dust) * (1 - 0.6 * storm) * (1 - 0.7 * wet); g.fill.intensity = 0;
  g.hemi.color.copy(C3('#bcd6f4', '#c8a47c', dust).lerp(lin('#56605c'), wet)); g.hemi.groundColor.copy(C3('#8a7a64', '#5a4a38', dust)); g.hemi.intensity = 1.25 + 0.2 * dust;
  g.r.toneMappingExposure = 1.08 - 0.25 * wet;
  WIN.uOn.value = 0.12; WIN.uT.value = t; WIN.uPow.value = 0.3; WIN.uDead.value = 0; SNOW.value = 0;
  const sea = g.seaMat.uniforms; sea.uT.value = t * (1 + 2.5 * w); sea.uLevel.value = 0.3; g.seaMesh.position.y = 0.3; sea.uIce.value = 0;
  sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uFire.value = 0; sea.uDark.value = 0.25 * wet; sea.uToeOn.value = 0; sea.uFlood.value = 0; sea.uChurn.value = 0.5 + 2.6 * w;
  sea.uMoon.value.copy(SUN); sea.uMoonCol.value.copy(lin('#fff4e0')); sea.uGlit.value = 1.2 * (1 - dust); sea.uGK.value = 300;
  sea.uShallow.value.copy(C3('#1f9aa0', '#6a7a6a', dust)); sea.uMid.value.copy(C3('#1468a8', '#4a5a54', dust)); sea.uDeep.value.copy(C3('#0a447e', '#2e3a3a', dust)); sea.uFar.value.copy(C3('#9ac0e0', '#a88a6a', dust));
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.boats.forEach((b, bi) => { const bz = b.z - OZ, q = { x: b.x, y: 0.3 - 0.4 * b.D, z: bz, t0: 23 + (b.z + 300) / 300 * 4 + bi * 0.3, a: 4 + bi % 3, v: 30 + 4 * (bi % 5), sx: 0, wob: 1, wa: 0, ph: b.ph, lift: 0.12, spin: 0.6 + (bi % 4) * 0.3, hop: 3 }, f = flyP(q, t);
    if (!f) { b.grp.position.set(b.x, q.y + 0.08 * Math.sin(t * (1.3 + 3 * w) + b.ph) * (1 + 4 * w), bz); b.grp.rotation.set(0.05 * w * Math.sin(t * 2 + b.ph), b.yaw, 0.06 * Math.sin(t * 1.1 + b.ph) * (1 + 3 * w)); b.grp.visible = true; return; }
    b.grp.visible = f.z < CAMZ + 30; b.grp.position.set(f.x, Math.max(f.y, f.z > SEAZ ? GY + 1 : f.y), f.z); b.grp.rotation.set(f.r * 0.7, b.yaw + f.r * 0.3, f.r); });
  // buildings: eaten from the top (jagged rim), roof units first, chunks flung up the avenue past you
  for (const k in o.meshes) { const m = o.meshes[k], A = m.geometry.attributes.aCut; A.needsUpdate = true; }
  o.BUI.forEach((b) => { const a = clamp((t - b.tH) / b.dur), peel = ss(b.tH - 7, b.tH - 0.3, t) * (b.row === 3 ? 0.55 : 0.92), grow = ss(23, b.tH + b.dur, t), lean = b.lean * grow + 0.012 * w * Math.sin(t * (3.5 + b.dC * 0.01) + b.z), sideL = b.side * 0.3 * b.lean * grow + 0.008 * w * Math.sin(t * 4.3 + b.x);
    b.mesh.geometry.attributes.aCut.array[b.mi] = a <= 0 ? 9e3 : Math.max(0.0, 1 - a * 1.12); b.mesh.geometry.attributes.aPeel.array[b.mi] = peel > 0.01 ? peel : 0;
    const M = Tr(b.x, GY, b.z).multiply(Rx(lean)).multiply(Rz(sideL)); b.mesh.setMatrixAt(b.mi, M.clone().multiply(Tr(0, b.h / 2, 0)).multiply(M4().makeScale(b.sx, b.h, b.sz)));
    o.cores.setMatrixAt(b.ci, M.clone().multiply(Tr(0, b.h * 0.495, 0)).multiply(M4().makeScale(b.sx * 0.94, b.h * 0.99, b.sz * 0.94))); o.cores.geometry.attributes.aCut.array[b.ci] = a <= 0 ? 9e3 : Math.max(0.0, 1 - a * 0.97); });
  for (const k in o.meshes) { o.meshes[k].instanceMatrix.needsUpdate = true; o.meshes[k].geometry.attributes.aPeel.needsUpdate = true; } o.cores.instanceMatrix.needsUpdate = true; o.cores.geometry.attributes.aCut.needsUpdate = true;
  for (const k in o.pnL) { const L = o.pnL[k], m = o.panels[k]; L.forEach((q, i) => { const f = flyP(q, t); if (!f || f.d > 700 || f.z > CAMZ + 70) { m.setMatrixAt(i, _hid); return; } m.setMatrixAt(i, M4c(f.x, f.y, f.z, q.ry + f.r * 0.6, q.w, q.h, 1, f.r, f.r * 0.4)); }); m.instanceMatrix.needsUpdate = true; }
  o.PILE.forEach((q, i) => { const b = q.b, a = clamp((t - b.tH) / b.dur), s2 = q.s * Math.pow(a, 0.7); o.piles.setMatrixAt(i, s2 < 0.05 ? _hid : M4c(q.x, GY + s2 * 0.25, q.z + a * 3, q.r, s2 * 1.4, s2 * 0.7, s2)); }); o.piles.instanceMatrix.needsUpdate = true;
  o.RF.forEach((q, i) => { const f = flyP(q, t); o.roofs.setMatrixAt(i, !f ? M4c(q.x, q.y, q.z, 0, q.s[0], q.s[1], q.s[2]) : f.d > 500 ? _hid : M4c(f.x, f.y, f.z, f.r, q.s[0], q.s[1], q.s[2], f.r * 0.7, f.r * 0.4)); }); o.roofs.instanceMatrix.needsUpdate = true;
  o.SHOPS.forEach((q, i) => { const gone = t > q.b.tH + q.b.dur * 0.97; o.shopG.setMatrixAt(i, gone ? _hid : M4c(q.x, GY + 2.05, q.z, q.ry, q.w, 4.0, 1)); }); o.shopG.instanceMatrix.needsUpdate = true;
  o.BUI.forEach((b, i) => { const gone = t > b.tH - 1.5 || b.row === 3; o.corn.setMatrixAt(i, gone ? _hid : M4c(b.x, GY + b.h + 0.3 - 0.0, b.z, 0, b.sx + 0.7, 0.6, b.sz + 0.7)); }); o.corn.instanceMatrix.needsUpdate = true;
  { const cnt = { ac: 0, plat: 0, stair: 0 }; let nr = 0; o.DET.forEach((q) => { const f = flyP(q, t), m = o.detM[q.type], i = cnt[q.type]++; let M;
      if (!f) M = q.type === 'stair' ? M4c(q.x, q.y, q.z, 0, 1, 1, 1, q.ry * 0.72, 0) : M4c(q.x, q.y, q.z, 0); else M = f.d > 400 ? _hid : M4c(f.x, f.y, f.z, f.r, 1, 1, 1, f.r * 0.8, f.r * 0.5);
      m.setMatrixAt(i, M); if (q.type === 'plat') o.detRail.setMatrixAt(nr++, M === _hid ? _hid : M.clone().multiply(Tr(Math.sign(q.x) * -0.55, 0.45, 0))); });
    for (const k in o.detM) { const m = o.detM[k]; for (let i = cnt[k]; i < m.count; i++) m.setMatrixAt(i, _hid); m.instanceMatrix.needsUpdate = true; } for (let i = nr; i < o.detRail.count; i++) o.detRail.setMatrixAt(i, _hid); o.detRail.instanceMatrix.needsUpdate = true; }
  for (const k in o.chL) { const L = o.chL[k], m = o.chunks[k]; L.forEach((q, i) => { const f = flyP(q, t); if (!f || f.d > 700 || f.z > CAMZ + 70) { m.setMatrixAt(i, _hid); return; } m.setMatrixAt(i, M4c(f.x, f.y, f.z, f.r, q.s, q.s * 0.5, q.s * 0.8, f.r * 0.6, f.r * 0.3)); }); m.instanceMatrix.needsUpdate = true; }
  // street details
  const flap = (k) => 0.15 * w * Math.sin(t * (14 + 6 * k) + k);
  o.AWN.forEach((q) => { const im = o.awnings[q.kind], f = flyP(q, t); im.setMatrixAt(q.slot, !f ? M4().compose(_v.set(q.x, q.y, q.z), _q.setFromEuler(_e.set(-Math.PI / 2 + (0.3 + flap(q.slot)) * q.s, Math.PI / 2, 0, 'YXZ')), _s.set(q.L, q.depth, 1)) : f.d > 300 ? _hid : M4c(f.x, f.y, f.z, f.r, q.L, q.depth, 1, f.r * 1.3, f.r * 0.7)); });
  o.awnings.forEach((im) => (im.instanceMatrix.needsUpdate = true));
  o.SIG.forEach((q, i) => { const f = flyP(q, t); o.signs.setMatrixAt(i, !f ? M4c(q.x, q.y + 0.03 * w * Math.sin(t * 20 + i), q.z, 0, 0.18, 0.9, q.w, flap(i) * 0.3, 0) : f.d > 300 ? _hid : M4c(f.x, f.y, f.z, f.r, 0.18, 0.9, q.w, f.r * 1.2, f.r * 0.5)); }); o.signs.instanceMatrix.needsUpdate = true;
  { const LP = o.lightsG.attributes.position.array, LC = o.lightsG.attributes.color.array, phase = Math.floor(t / 6) % 2;
    o.POL.forEach((q, i) => { const f = flyP(q, t), lean = 0.08 * w * Math.sin(t * 9 + i); let B;
      if (!f) B = M4().compose(_v.set(q.x, SW, q.z), _q.setFromEuler(_e.set(lean * 0.5, 0, lean)), _s.set(1, 1, 1)); else if (f.d > 300) { o.polI.setMatrixAt(i, _hid); o.armI.setMatrixAt(i, _hid); o.headI.setMatrixAt(i * 2, _hid); o.headI.setMatrixAt(i * 2 + 1, _hid); LP[i * 3 + 1] = -1e4; return; }
      else B = M4().compose(_v.set(f.x, Math.max(SW, f.y), f.z), _q.setFromEuler(_e.set(f.r, f.r * 0.3, f.r * 0.6)), _s.set(1, 1, 1));
      o.polI.setMatrixAt(i, B.clone().multiply(M4().makeScale(1, q.h, 1))); const top = B.clone().multiply(Tr(0, q.h, 0)); o.armI.setMatrixAt(i, top.clone().multiply(Rz(-Math.sign(q.arm) * Math.PI / 2)).multiply(M4().makeScale(1, Math.abs(q.arm), 1)));
      const hd = top.clone().multiply(Tr(q.arm, -0.4, 0)); o.headI.setMatrixAt(i * 2, hd.clone().multiply(M4().makeScale(q.kind === 'tl' ? 0.35 : 0.7, q.kind === 'tl' ? 0.95 : 0.2, q.kind === 'tl' ? 0.35 : 0.35))); o.headI.setMatrixAt(i * 2 + 1, q.kind === 'tl' ? B.clone().multiply(Tr(0, 2.6, 0.25)).multiply(M4().makeScale(0.3, 0.8, 0.3)) : _hid);
      const lp = new THREE.Vector3().setFromMatrixPosition(hd.clone().multiply(Tr(0, phase ? 0.28 : -0.28, 0.2))); LP[i * 3] = lp.x; LP[i * 3 + 1] = q.kind === 'tl' && t < 24 ? lp.y : -1e4; LP[i * 3 + 2] = lp.z; const red = (phase + (Math.abs(q.x) > 0 ? 0 : 1)) % 2; LC[i * 3] = red ? 1 : 0.2; LC[i * 3 + 1] = red ? 0.15 : 1; LC[i * 3 + 2] = red ? 0.1 : 0.4; });
    [o.polI, o.armI, o.headI].forEach((m) => (m.instanceMatrix.needsUpdate = true)); o.lightsG.attributes.position.needsUpdate = true; o.lightsG.attributes.color.needsUpdate = true; }
  o.SM.forEach((q, i) => { const f = flyP(q, t), [a, b, d] = q.dims; o.small.setMatrixAt(i, !f ? M4c(q.x, q.y, q.z + (t > T_BRAKE ? 0.6 * EZ.o3(clamp(t - T_BRAKE)) : 0), 0, a, b, d) : f.d > 300 ? _hid : M4c(f.x, Math.max(groundY(f.x, f.z) + b / 2, f.y), f.z, f.r, a, b, d, f.r * 1.1, f.r * 0.6)); }); o.small.instanceMatrix.needsUpdate = true;
  { const f = flyP(o.kioskFly, t); if (f) { o.kiosk.position.set(f.x, Math.max(SW, f.y), f.z); o.kiosk.rotation.set(f.r * 0.7, f.r * 0.4, f.r * 0.3); o.kiosk.visible = f.d < 150; } }
  o.TREES.forEach((tr, i) => { const q = { x: tr.x, y: GY + 0.3, z: tr.z, t0: tr.t0 + 4, a: 7, v: 45, sx: 0, wob: 1, wa: 0.5, ph: i, lift: 0.25, spin: 2, hop: 0 }, f = flyP(q, t), bend = 0.3 * w * (1 + 0.3 * Math.sin(t * 7 + i));
    o.trunks.setMatrixAt(i, !f ? M4c(tr.x, GY + 0.3, tr.z, 0, 1, tr.h, 1, -bend * 0.6, 0) : f.d > 300 ? _hid : M4c(f.x, f.y, f.z, f.r, 1, tr.h, 1, f.r * 1.2, f.r * 0.5)); }); o.trunks.instanceMatrix.needsUpdate = true;
  o.LEAF.forEach((q, i) => { const f = flyP(q, t), sw = 0.25 * w * Math.sin(t * 11 + i * 0.7); o.leaves.setMatrixAt(i, !f ? M4c(q.x, q.y, q.z + 0.4 * w * (q.y - GY) * 0.15, q.ry + sw, q.s, q.s, q.s, q.rx + sw, 0) : f.d > 260 ? _hid : M4c(f.x, f.y, f.z, f.r, q.s, q.s, q.s, f.r * 1.5, f.r)); }); o.leaves.instanceMatrix.needsUpdate = true;
  o.CAR.forEach((q, i) => { const hideCar = () => { [o.carBody, o.carCab, o.carLt, o.carTl].forEach((m) => m.setMatrixAt(i, _hid)); o.carBp.setMatrixAt(i * 2, _hid); o.carBp.setMatrixAt(i * 2 + 1, _hid); for (let k = 0; k < 4; k++) { o.carWh.setMatrixAt(i * 4 + k, _hid); o.carRim.setMatrixAt(i * 4 + k, _hid); } };
    let P = q.parked ? { x: q.lx, z: q.z0 + (t > T_BRAKE ? q.skid * 0.4 * EZ.o3(clamp((t - T_BRAKE) / 1.4)) : 0), yaw: q.spinS * 0.2 * EZ.o3(clamp(t - T_BRAKE)) } : carPre(q, t), y = GY, rx = 0, rz = 0;
    if (t > q.t0) { const P0 = q.parked ? { x: q.lx, z: q.z0 + q.skid * 0.4, yaw: q.spinS * 0.2 } : carPre(q, q.t0), f = flyP(Object.assign({}, q, { x: P0.x, y, z: P0.z }), t); if (f.d > 260) return hideCar(); P = { x: f.x, z: f.z, yaw: P0.yaw + f.r }; y = Math.max(GY, f.y); rx = f.r * 0.8; rz = f.r * 0.5; }
    if (P.z > CAMZ + 60 || P.z < SEAZ) return hideCar();
    const B = M4().compose(_v.set(P.x, y, P.z), _q.setFromEuler(_e.set(rx, P.yaw, rz, 'YXZ')), _s.set(1, 1, 1)); o.carBody.setMatrixAt(i, B); o.carCab.setMatrixAt(i, B); o.carLt.setMatrixAt(i, B.clone().multiply(Tr(0, 0.6, 2.2))); o.carTl.setMatrixAt(i, B.clone().multiply(Tr(0, 0.66, -2.2))); o.carBp.setMatrixAt(i * 2, B.clone().multiply(Tr(0, 0.32, 2.24))); o.carBp.setMatrixAt(i * 2 + 1, B.clone().multiply(Tr(0, 0.32, -2.24)));
    [[-0.84, -1.4], [0.84, -1.4], [-0.84, 1.35], [0.84, 1.35]].forEach(([wx, wz], k) => { const Wm = B.clone().multiply(Tr(wx, 0.34, wz)).multiply(Rz(Math.PI / 2)); o.carWh.setMatrixAt(i * 4 + k, Wm); o.carRim.setMatrixAt(i * 4 + k, Wm.clone().multiply(Tr(0, Math.sign(wx) * 0.02, 0))); }); });
  [o.carBody, o.carCab, o.carWh, o.carRim, o.carLt, o.carTl, o.carBp].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  { let P = busPre(t), y = GY, r = [0, 0]; if (t > o.busQ.t0) { const P0 = busPre(o.busQ.t0), f = flyP(Object.assign({}, o.busQ, { x: P0.x, z: P0.z }), t); P = { x: f.x, z: f.z, yaw: P0.yaw + f.r * 0.5 }; y = Math.max(GY, f.y); r = [f.r * 0.6, f.r * 0.4]; } o.bus.position.set(P.x, y, P.z); o.bus.rotation.set(r[0], P.yaw, r[1], 'YXZ'); o.bus.visible = P.z < CAMZ + 40; }
  o.crackM.opacity = ss(T_BRAKE + 0.05, T_BRAKE + 0.4, t);
  o.SLB.forEach((q, i) => { const k = EZ.back(clamp((t - q.t0) / 0.5)); o.slabs.setMatrixAt(i, t < q.t0 + 0.01 ? _hid : M4c(q.x, GY - 0.1 + q.up * k, q.z, q.ry, q.w, 1, q.d, q.tilt * k, 0)); }); o.slabs.instanceMatrix.needsUpdate = true;
  const PG = g.PG, PMs = o.PMs; o.pp.forEach((q, i) => { const st = streetPose(q, t); if (!st) { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMs[k].setMatrixAt(i * PG[k][1] + j, _hid); o.capI.setMatrixAt(i, _hid); o.bagI.setMatrixAt(i, _hid); return; }
    poseP(PMs, PG, i, Object.assign({ s: q.s, w: q.w, sway: q.ph, acc: { cap: o.capI, bag: o.bagI, q } }, st)); }); for (const k in PMs) PMs[k].instanceMatrix.needsUpdate = true; o.capI.instanceMatrix.needsUpdate = true; o.bagI.instanceMatrix.needsUpdate = true;
  o.grit.visible = w > 0.03; if (o.grit.visible) { const P = o.gP, sp = 30 + 90 * w; o.gL.forEach(([x0, y0, z0, v, ph], i) => { const zz = mod(z0 + t * sp * v / 120, 1); P[i * 3] = c.x + x0 + Math.sin(t * 3 + ph) * 0.4; P[i * 3 + 1] = c.y - 3 + y0 * (0.4 + 0.6 * w) + Math.sin(t * 5 + ph) * 0.3; P[i * 3 + 2] = c.z - 120 + zz * 125; });
    o.gG.attributes.position.needsUpdate = true; o.grit.material.opacity = Math.min(1, 1.2 * w); o.grit.material.color.copy(C3('#d8d0c4', '#7a6248', dust)); o.grit.material.size = 0.06 + 0.08 * w; }
  { const on = ss(25, 34, t) * (1 - 0.7 * ss(59, 61.5, t)); o.debris.visible = on > 0.01; if (o.debris.visible) { const P = o.dbP, sp = 60 + 120 * w; o.dbL.forEach(([x0, y0, z0, v, ph], i) => { const zz = mod(z0 + t * sp * v / 320, 1); P[i * 3] = c.x + x0 + Math.sin(t * 2 + ph) * 1.5; P[i * 3 + 1] = GY + y0 * (0.25 + 0.75 * w) + Math.sin(t * 3 + ph) * 1.2; P[i * 3 + 2] = c.z - 300 + zz * 320; });
    o.dbG.attributes.position.needsUpdate = true; o.debris.material.opacity = Math.min(1, on * 1.2); o.debris.material.size = 0.22 + 0.2 * dust; } }
  { const Rs = RNG('scrapfly'), on = ss(16.5, 19, t) * (1 - wet); for (let i = 0; i < 600; i++) { const v = Rs.r(18, 60) * (0.4 + w), z0 = Rs.r(-160, 0), x0 = Rs.r(-12, 12), y0 = Rs.r(0.2, 16), ph = Rs.r(0, TAU), zz = mod(z0 + t * v, 180) - 170;
      o.scraps.setMatrixAt(i, on <= 0 || i > 600 * on ? _hid : M4c(c.x + x0 + Math.sin(t * 2 + ph) * 1.5, GY + y0 * (0.3 + w) + Math.sin(t * 4 + ph), c.z + zz, t * 6 + ph, 1, 1, 1, t * 9 + ph, t * 4)); } o.scraps.instanceMatrix.needsUpdate = true; }
  let si = 0, fi = 0, mi = 0, bi = 0; const SP = g.sprays, FL = g.flames, SMk = g.smokes, BLs = g.billows;
  const put = (pool, idx, x, y, z, sc, op, col, rot = 0) => { if (idx >= pool.length || op <= 0.004) return idx; const s = pool[idx]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col); s.material.rotation = rot; return idx + 1; };
  if (t > T_BRAKE && t < 14) { const R = RNG('brakedust'); for (let k = 0; k < 50; k++) { const a = mod((t - T_BRAKE) * 0.4 + R.f(), 1), x = R.r(-12, 12), z = R.r(-40, 46); bi = put(BLs, bi, x, GY + 0.3 + a * 1.5, z + a * 3, 1.2 + a * 3, 0.35 * Math.sin(a * Math.PI) * (1 - ss(13, 14, t)), '#c8b8a0', R.r(0, 6)); } }
  if (w > 0.02 && t < 61.5) { const R = RNG('streetdust'), n = Math.floor((90 + 280 * dust) * (1 - 0.8 * clear)); for (let k = 0; k < n; k++) { const v = R.r(25, 70) * (0.3 + w), z = mod(R.r(-200, 0) + t * v, 220) - 205 + c.z, x = c.x - 6 + R.n(10 + 20 * dust), y = GY + R.r(0, 4 + 30 * dust);
      bi = put(BLs, bi, x, y, z, R.r(3, 9) * (1 + 2 * dust), (0.08 + 0.2 * dust) * w * (1 - wet * 0.7), R.pick(['#b8a088', '#a89070', '#c8b49a', '#8a7458']), R.r(0, 6) + t * R.n(1)); } }
  if (w > 0.05) { const R = RNG('seaspray'); for (let k = 0; k < 120; k++) { const x = R.r(-300, 300), z = mod(R.r(-900, -100) + t * 40 * w, 820) - 900 - OZ, a = mod(t * 0.6 + R.f(), 1); si = put(SP, si, x, 0.5 + a * 20 * w, z, 8 + 20 * a, 0.35 * w * Math.sin(a * Math.PI) * (1 - dust * 0.5), '#ffffff', R.r(0, 6)); } }
  o.BUI.forEach((b, i) => { const a = (t - b.tH) / b.dur; if (a <= 0 || a > 1.4 || i % 2) return; const R = RNG('bdust', i), hf = GY + b.h * Math.max(0, 1 - a);
    for (let k = 0; k < (b.row === 3 ? 5 : 3); k++) bi = put(BLs, bi, b.x + R.n(b.sx * 0.5), hf + R.r(-4, 4), b.z + R.n(b.sz * 0.5) + a * R.r(10, 40), R.r(8, 20) * (b.row === 3 ? 2.2 : 1) * (0.7 + a), 0.7 * Math.min(1, a * 4) * (1 - ss(1, 1.4, a)), R.pick(['#c8b49a', '#b8a088', '#d8c8b0', '#a88a70']), R.r(0, 6)); });
  // the ocean: the planet has stopped, the water has not — a wall rises out of the bay and comes up the avenue (luna's wave)
  const zw = t < T_STOP ? -2000 : lerp(-1100 - OZ, CAMZ - 6, Math.pow(seg(t, T_STOP, T_HIT + 0.05), 1.15)), Hm = 180 * ss(T_STOP, T_STOP + 1.5, t), tc = Math.tan(38 * DEG), Hv = Math.min(Hm, (tc * (c.z - zw) + c.y) / (1.05 + 0.135 * tc));
  g.wave.visible = t >= T_STOP && t < 63; if (!g.wave.visible) { o.wjL.forEach((q, i) => o.wjunk.setMatrixAt(i, _hid)); o.wjunk.instanceMatrix.needsUpdate = true; }
  if (g.wave.visible) { const { wPos, wUv, wX, wProf, WNX, WNS, wArc } = g, Y0 = -16;
    for (let i = 0; i < WNX; i++) { const x = wX[i], hx = 1 + 0.035 * Math.sin(x * 0.0021 + 1.3) + 0.02 * Math.sin(x * 0.0063 + 0.4), cr = Hv * hx, zo = zw - x * x / 160000 + 0.02 * Hv * Math.sin(x * 0.0017 + 0.5);
      for (let j = 0; j < WNS; j++) { const k = i * WNS + j, [dn, yn] = wProf[j]; wPos[k * 3] = x; wPos[k * 3 + 1] = Y0 + yn * (cr - Y0); wPos[k * 3 + 2] = zo + dn * cr; wUv[k * 2] = x / 160; wUv[k * 2 + 1] = wArc[j] * (cr - Y0) / 160; } }
    g.wGeo.attributes.position.needsUpdate = true; g.wGeo.attributes.uv.needsUpdate = true; g.wGeo.computeVertexNormals();
    const wu = g.waveU; wu.uT.value = t; wu.uFogC.value.copy(g.scene.fog.color); wu.uFogFar.value = 3000; wu.uFogK.value = 0.35; wu.uSky.value.copy(su.hor.value); wu.uLight.value = 1.15; wu.uFoamC.value.copy(lin('#d8d0c4')); wu.uRim.value.copy(lin('#9ab0a8'));
    { const half = (c.z - zw) * 0.42 + 0.3 * Hv, on = Hv > 20 && t > 57.5; o.wjL.forEach((q, i) => { if (!on) { o.wjunk.setMatrixAt(i, _hid); return; } const x = c.x + (q.u * 2 - 1) * half, y = GY + q.v * Hv * 0.92, z = zw + 0.22 * Hv * (1 - q.v) * (1 - q.v) - x * x / 160000 + 3;
      o.wjunk.setMatrixAt(i, M4c(x, y, z, q.r + t * q.sp, q.s, q.s, q.s, t * q.sp * 0.7 + q.r, t * q.sp * 0.4)); }); o.wjunk.instanceMatrix.needsUpdate = true; }
    wu.uTop.value.copy(lin('#3a5a58')); wu.uMid.value.copy(lin('#1a3634')); wu.uBot.value.copy(lin('#0a1a1a'));
    if (Hv > 20) { const R = RNG('lip'), half = (c.z - zw) * 0.42 + 0.3 * Hv; for (let k = 0; k < 70; k++) { const age = mod(t * R.r(0.12, 0.22) + R.f(), 1), x = c.x + (R.f() * 2 - 1) * half;
        si = put(SP, si, x, Hv * (1 + 0.04 * Math.sin(x * 0.0021 + 1.3)) + age * 0.12 * Hv * R.r(0.3, 1.2), zw + 0.15 * Hv - x * x / 160000 + 8, Hv * R.r(0.06, 0.24) * (0.7 + age), 0.32 * Math.sin(age * Math.PI), '#ddd6cc', R.r(0, 6)); }
      { const Rt = RNG('wsplash'); for (let k = 0; k < 40; k++) { const a = mod(t * Rt.r(0.3, 0.6) + Rt.f(), 1); si = put(SP, si, Rt.r(-60, 60), GY + a * 0.25 * Hv, zw + 0.12 * Hv + Rt.r(0, 20), Hv * Rt.r(0.05, 0.15) * (0.6 + a), 0.6 * Math.sin(a * Math.PI), '#f0ece6', Rt.r(0, 6)); } } } }
  for (; si < SP.length; si++) SP[si].visible = false; for (; fi < FL.length; fi++) FL[fi].visible = false; for (; mi < SMk.length; mi++) SMk[mi].visible = false; for (; bi < BLs.length; bi++) BLs[bi].visible = false;
  g.debris.visible = false;
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: motion blur, bloom, wind streaks, the dust veil, the ocean hitting the lens and the crack, HUD, title, captions, card
function motionBlur(t) {
  const a = camPoseC(t), b = camPoseC(t - 1 / 48), f = (H / 2) / Math.tan(33 * DEG);
  let dx = -Math.atan2(Math.sin(a.yaw - b.yaw), Math.cos(a.yaw - b.yaw)) * f, dy = (a.pitch - b.pitch) * f; const L = Math.hypot(dx, dy); if (L < 3) return;
  const k = Math.min(1, 90 / L); dx *= k; dy *= k; const g = g3(); ctx.save(); screen();
  for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.16 * (1 - i / 8); ctx.drawImage(g.cv, -dx * i / 6, -dy * i / 6, W, H); } ctx.restore();
}
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.4) blur(9px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
// streaks of grit and air racing out from the vanishing point towards the edges (the wind in your face)
function windStreaks(t) { const w = W01(t) * (t < T_HUSH ? 1 : 0); if (w < 0.05) return; const R = RNG('streak', Math.floor(t * 24)), dust = ss(31, 42, t); ctx.save(); screen(); ctx.lineCap = 'round';
  for (let i = 0; i < 90 * w; i++) { const a = R.r(0, TAU), r0 = R.r(60, 700), L = R.r(60, 260) * (0.5 + w), x0 = CX + Math.cos(a) * r0, y0 = H * 0.42 + Math.sin(a) * r0 * 1.4;
    ctx.strokeStyle = dust > 0.3 ? `rgba(170,140,100,${R.r(0.08, 0.3) * w})` : `rgba(240,240,240,${R.r(0.06, 0.22) * w})`; ctx.lineWidth = R.r(1, 3.5); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L * 1.4); ctx.stroke(); }
  ctx.restore(); }
function dustVeil(t) { const k = (ss(33, 44, t) * 0.1 + ss(49, 54, t) * 0.08) * (1 - ss(56, 58.5, t)); if (k <= 0 || t >= T_HUSH) return; ctx.save(); screen(); const g2 = ctx.createRadialGradient(CX, H * 0.45, H * 0.15, CX, H * 0.45, H * 0.8); g2.addColorStop(0, `rgba(170,130,90,${k * 0.5})`); g2.addColorStop(1, `rgba(90,62,40,${k})`); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// the ocean on the lens: dark green water, bubbles, then the glass cracks
function oceanHit(t) { if (t < T_HIT - 0.02 || t >= 63.0) return; const k = t >= T_HIT - 0.02 ? 1 : 0, R = RNG('ohit', Math.floor(t * 12));
  ctx.save(); screen(); ctx.fillStyle = `rgba(14,36,36,${0.86 * k})`; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const x = R.r(0, W), y = R.r(0, H), r = R.r(80, 340), g2 = ctx.createRadialGradient(x, y, 0, x, y, r); g2.addColorStop(0, `rgba(120,150,140,${0.25 * k})`); g2.addColorStop(1, 'rgba(20,40,40,0)'); ctx.fillStyle = g2; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 120; i++) { const x = R.r(0, W), y = mod(R.r(0, H) - (t - T_HIT) * R.r(200, 600), H), r = R.r(2, 10); ctx.strokeStyle = `rgba(220,235,230,${R.r(0.2, 0.6) * k})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
  ctx.restore(); crackGlass(t); }
function crackGlass(t) {
  ctx.save(); screen(); ctx.lineCap = 'round';
  [[CX + 90, H * 0.4, 'crk1'], [CX - 260, H * 0.68, 'crk2'], [CX + 300, H * 0.78, 'crk3']].forEach(([cx, cy, key], ci) => { const R = RNG(key), grow = t >= T_HIT - 0.02 + ci * 0.15 ? 1 : 0, rays = []; if (!grow) return;
    for (let i = 0; i < 15; i++) { const a0 = i / 15 * TAU + R.n(0.15), L = R.r(300, ci ? 700 : 1300), pts = [[cx, cy]]; let a = a0, px = cx, py = cy; for (let s = 0; s < 14; s++) { a += R.n(0.12); px += Math.cos(a) * L / 14; py += Math.sin(a) * L / 14; pts.push([px, py]); } rays.push(pts); }
    const line = (pts, w, col) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); };
    rays.forEach((p) => { line(p, 5, 'rgba(0,0,0,0.3)'); line(p, 2, 'rgba(235,245,240,0.85)'); });
    for (let ring = 1; ring <= 4; ring++) for (let i = 0; i < rays.length; i++) { const A = rays[i], B = rays[(i + 1) % rays.length], idx = Math.min(A.length - 1, ring * 2 + (R.f() < 0.5 ? 1 : 0)); if (R.f() < 0.3) continue; line([A[idx], [(A[idx][0] + B[idx][0]) / 2 + R.n(12), (A[idx][1] + B[idx][1]) / 2 + R.n(12)], B[Math.min(B.length - 1, idx + 1)]], 1.3, 'rgba(235,245,240,0.7)'); }
    const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70); g2.addColorStop(0, 'rgba(255,255,255,0.8)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g2; ctx.fillRect(cx - 70, cy - 70, 140, 140); });
  ctx.restore();
}
const fmtK = (v) => `${Math.round(v).toLocaleString('es-ES').replace(/,/g, '.')}`.replace(/^(\d)(\d{3})$/, '$1.$2');
function hud() { const t = TT; if (t < 4.4 || t >= T_HUSH) return; const sp = spinK(t), wk = windKmh(t);
  pvHud('Giro de la Tierra', `${fmtK(sp)} km/h`, wk > 5 ? `viento ${fmtK(wk)} km/h` : 'en el ecuador', ev(4.4, 0.5) * (1 - ev(T_HUSH - 0.3, 0.3))); }
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(140, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 450;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 150 + lines.length * 80, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function capFit(str, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w));
    pvFeather(CX, 1374, 570, 120, a); pvText(str, CX, 1390, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(63.8, 0.7), b = ev(64.4, 0.8), c2 = ev(65.0, 0.8), d = ev(66.6, 0.6), d2 = ev(67.6, 0.5), e = ev(68.3, 0.6);
  const f = () => {
    pvGlow(CX, 760, 520 + 90 * Math.max(0, TT - 63.8), 'rgba(120,170,160,0.25)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));
    pvFeather(CX, 760, 520, 280, 0.8 * a);
    pvText('En el ecuador giras a', CX, 630, 56, { italic: true, align: 'center', alpha: a });
    pvText('1.670 km/h', CX, 770, 116, { align: 'center', alpha: b });
    pvText('y no lo notas.', CX, 890, 54, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#a8c8c0'; ctx.fillRect(CX - 60, 935, 120, 3); ctx.restore();
    pvFeather(CX, 1090, 500, 110, 0.7 * d);
    pvText('y tranquilo, esto nunca pasará', CX, 1080, 48, { italic: true, align: 'center', alpha: d });
    pvText('... o si?', CX, 1150, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1450, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function sceneSpin() {
  const t = TT;
  if (t < 63.0) { updateSpin(); motionBlur(t); bloom(0.28 * (1 - ss(31, 40, t)) + 0.12); windStreaks(t); dustVeil(t); }
  if (t >= T_BRAKE && t < T_BRAKE + 0.15) pvTint('#ffffff', 0.25 * (1 - seg(t, T_BRAKE, T_BRAKE + 0.15)));
  oceanHit(t);
  if (t >= T_HIT - 0.02 && t < T_HIT + 0.03) pvTint('#f4fbf8', 0.85);   // the slam: one white frame
  if (t >= 62.4 && t < 63) pvTint('#030505', ss(62.4, 62.95, t));
  if (t >= 63.0) fillAll('#030505');
  if (t >= 63.6) endCard();
  hud();
  bigTitle(['¿Que pasaría si la tierra', 'dejara de girar?'], 0.3, 4.8);
  capFit('Estás sobre el ecuador.', 5.3, 7.9);
  capFit('Aquí el suelo va a 1.670 km/h hacia el este.', 8.1, 10.9);
  capFit('La Tierra empieza a frenar.', 11.3, 14.0);
  capFit('Tú no. Nada lo hace.', 14.2, 16.9);
  capFit('El aire sigue girando.', 17.3, 24.8);
  capFit('Todo lo que no está anclado se va.', 25.3, 32.8);
  capFit('Ya es peor que cualquier huracán.', 33.3, 41.8);
  capFit('Los edificios no resisten.', 42.3, 49.8);
  capFit('El viento supera la velocidad del sonido.', 50.3, 56.8);
  capFit('La Tierra se detiene. El océano no.', 57.2, 60.6);
}

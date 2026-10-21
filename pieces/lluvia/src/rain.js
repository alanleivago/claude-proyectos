
// =====================================================================
//  RAIN — the same city (giro's avenue, boulevard, shops, bay) seen from a high rooftop. It rains for a thousand years:
//  the drains give up, the avenue becomes a river, boats and floating cars, life moves upstairs, the water covers the city,
//  a thousand years under water; the rain stops, the water takes centuries to leave, the forest takes over.
// =====================================================================
const blot2 = (x, px, py, r, col) => { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(px - r, py - r, 2 * r, 2 * r); };
const speck = (x, w, h, n, cols, R, s0 = 1, s1 = 3) => { for (let k = 0; k < n; k++) { x.fillStyle = R.pick(cols); x.fillRect(R.r(0, w), R.r(0, h), R.r(s0, s1), R.r(s0, s1)); } };
const SUN = dirV(160 * DEG, 48 * DEG);
// the sun moves like the reference's: an afternoon sun lowering over the first seconds; during the time-lapse it sweeps
// across the sky (one 'day' every ~3 s, dimmed by the rain); after the rain a clear sun that keeps travelling (moving shadows)
function sunAt(t) { let az, el, k;
  if (t < 10) { az = 158; el = 48; k = 1 - ss(8.5, 10.5, t); }
  else if (t < 55) { const ph = mod((t - 12) * 0.32, 1); az = lerp(80, 280, ph); el = 55 * Math.sin(Math.PI * ph); k = Math.max(0, Math.sin(Math.PI * ph)) * (t < 12 ? 0 : 1); }
  else { const u = seg(t, 55, 70); az = lerp(138, 168, u); el = lerp(58, 50, u); k = 1; }
  return { d: dirV(az * DEG, Math.max(4, el) * DEG), k }; }
const T_BRAKE = 11.0, T_THUNDER = 54.4, T_STOP = 55.0, ROOF = 24.0;
const GY = PROM + 0.02, SW = GY + 0.16;                      // road level, sidewalk level
const ROADX = 10, BX = 14;                                    // road half width (4 lanes + median), building line
const OZ = 650;                                               // luna's sea, quay, hill and boats are moved this far back
const SEAZ = -78 - OZ;                                        // the new waterfront
const XSTREETS = [[-26, -14], [14, 46], [140, 152]]; const BLV = { z0: 14, z1: 46, r0: 18, r1: 42 }; for (let z = -86; z > SEAZ + 60; z -= 62) XSTREETS.push([z - 6, z + 6]);   // cross streets (z ranges)
const ZRUNS = (() => { const L = XSTREETS.slice().sort((a, b) => a[0] - b[0]); const R = []; let z = SEAZ + 2; L.forEach(([a, b]) => { R.push([z, a]); z = b; }); R.push([z, 320]); return R; })();
const CAMX = 14.9, CAMZ = 47.0, CAMY0 = GY + ROOF + 1.7;   // on the roof of the corner block, 8 floors up
// the story's clocks: rain intensity, water above the street (m), darkness, window lights, the HUD's elapsed time (hours)
const rainK = (t) => ss(0.6, 6.5, t) * (1 - ss(T_STOP - 0.1, T_STOP + 0.6, t));
const LEVEL = [[0, 0], [8, 0], [10, 0.08], [12, 0.2], [14, 0.34], [17, 0.6], [19.5, 0.95], [22, 1.2], [25, 1.6], [29, 2.4], [33, 4], [37, 7.5], [40, 11], [44, 22], [47, 33], [54.9, 40], [55.6, 24.6], [58, 18], [62, 7], [65.5, 0.6], [67, 0], [75, 0]];
const level = (t) => knots(LEVEL, t);
const nightK = (t) => knots([[0, 0.0], [5, 0.1], [9, 0.3], [12.5, 1], [16.5, 0.9], [20, 0.62], [40, 0.68], [47, 0.8], [55, 0.8], [56, 0], [75, 0]], t);
const lightsK = (t) => knots([[0, 0.12], [10, 0.15], [13, 0.8], [33, 0.65], [40, 0.45], [42.5, 0.3], [44.2, 0], [75, 0]], t);
const HRS = [[4.5, 0], [10, 8], [13, 24], [17, 72], [25, 720], [29, 2160], [33, 5760], [40, 17520], [47, 61320], [54.4, 8760000]];
const hoursAt = (t) => knots(HRS, t);
const yearsAfter = (t) => knots([[55, 1000], [58, 1060], [62, 1180], [66, 1400], [70, 2000], [75, 2000]], t);
function flyP(q, t) { const tau = t - q.t0; if (tau <= 0) return null; const k = q.a / q.v, d = q.v * (tau - (1 - Math.exp(-k * tau)) / k);
  return { d, x: q.x + q.sx * d + Math.sin(tau * q.wob + q.ph) * q.wa, y: q.y + q.lift * d + (q.hop ? Math.abs(Math.sin(tau * 3.1 + q.ph)) * q.hop * Math.min(1, tau) : 0), z: q.z + d, r: tau * q.spin }; }
// cel shading: a 4-step toon ramp for everything in the city (the reference's look)
const GRAD = (() => { const d = new Uint8Array([112, 112, 112, 255, 165, 165, 165, 255, 218, 218, 218, 255, 255, 255, 255, 255]); const tx = new THREE.DataTexture(d, 4, 1); tx.minFilter = tx.magFilter = THREE.NearestFilter; tx.generateMipmaps = false; tx.needsUpdate = true; return tx; })();
function TOON(o) { return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.82, metalness: 0.0 }, o)); }   // (name kept from giro) — physically based, like sol-explota / corre / agujero
const mkFly = (R, o) => Object.assign({ a: R.r(8, 16), v: R.r(40, 90), sx: R.n(0.08), wob: R.r(1, 3), wa: R.r(0, 1.5), ph: R.r(0, TAU), lift: R.r(0.1, 0.35), spin: R.r(1, 5), hop: 0 }, o);

// the camera: on a rooftop over the crossing, looking down the avenue to the bay; it looks down at the street, along the
// boulevard, at the boats; it sinks with the water (underwater 47-55), comes up when the rain stops, looks up at the sun
const GL = [[4.6, 9.6, -30, -10], [10.2, 16.6, 8, -16], [17.4, 24.6, -40, -8], [25.4, 32.6, 14, -14], [33.4, 39.6, -34, 2], [40.4, 46.6, 6, 8], [47.4, 54.2, 0, -6], [55.4, 58.4, 4, 14], [58.6, 65.6, 6, -12], [66.2, 70, 10, -4]];
function camPoseC(t) {
  const n = (a, b, c) => Math.sin(t * a + b) * c;
  let y = 0, p = 0; for (const [a, b, yw, pt] of GL) { const k = ss(a, a + 1.0, t) * (1 - ss(b - 1.0, b, t)); y += yw * k; p += pt * k; }
  const under = ss(46.6, 47.4, t) * (1 - ss(55.2, 55.7, t)), thunder = ss(T_THUNDER, T_THUNDER + 0.05, t) * (1 - ss(T_THUNDER + 0.3, T_THUNDER + 1.5, t));
  const shake = 0.12 * rainK(t) + 1.4 * thunder;
  return {
    x: CAMX + n(0.31, 1, 0.05) + shake * n(29, 0, 0.03) + under * n(0.4, 2, 0.4),
    y: CAMY0 + n(0.43, 0.3, 0.04) + shake * n(33, 2, 0.03) + under * n(0.5, 1, 0.5),
    z: CAMZ + n(0.27, 2, 0.05) + under * n(0.3, 3, 0.4),
    yaw: (24 + y + n(0.21, 0.7, 0.7) + n(0.57, 2.1, 0.25) + shake * n(23, 3, 1.1) + under * n(0.2, 1, 4)) * DEG,
    pitch: (-22 + p + n(0.33, 1.2, 0.4) + shake * n(37, 1, 1.4) + under * n(0.25, 2, 3)) * DEG,
    roll: (n(0.27, 2.1, 0.35) + shake * n(19, 2, 1.0) + under * n(0.3, 0, 3)) * DEG,
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
const FX = { uCyc: { value: 0 }, uL: { value: 0 }, uWY: { value: 0 }, uMud: { value: 0 }, uMudY: { value: 0 }, uVine: { value: 0 }, uWet: { value: 0 } };   // shared façade uniforms
const GRND = {};
function texCityAtlas() { return g3Tex((x, w, H) => { const h = H / 4, R = RNG('cityA');
  const glassW = (gx, gy, gw, gh) => { const gg = x.createLinearGradient(gx, gy, gx, gy + gh); gg.addColorStop(0, R.f() < 0.3 ? '#4a5868' : '#2e3846'); gg.addColorStop(1, '#161c24'); x.fillStyle = gg; x.fillRect(gx, gy, gw, gh); x.fillStyle = 'rgba(200,215,230,0.13)'; x.fillRect(gx + 2, gy + 2, gw * 0.35, gh * 0.45); };
  // 0 brownstone: dark red-brown brick, tall windows with cream frames, stone lintels and sills
  { const oy = 0; for (let r = 0; r < 96; r++) for (let c = 0; c < 26; c++) { const v = R.r(-14, 14); x.fillStyle = `rgb(${104 + v},${56 + v * 0.6},${44 + v * 0.5})`; x.fillRect(c * w / 24 - (r % 2) * w / 48, oy + r * h / 96, w / 24 - 1.2, h / 96 - 1.2); }
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 4; b++) { const cw = w / 4, wx = b * cw + cw * 0.24, ww = cw * 0.52, wy = oy + fl * h / 4 + h * 0.045, wh = h / 4 * 0.64;
      x.fillStyle = '#d8ccb4'; x.fillRect(wx - 8, wy - 12, ww + 16, 10); x.fillRect(wx - 6, wy + wh + 2, ww + 12, 7); x.fillStyle = '#e8e0d0'; x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6); glassW(wx, wy, ww, wh); x.fillStyle = '#e8e0d0'; x.fillRect(wx, wy + wh * 0.48, ww, 4); x.fillRect(wx + ww / 2 - 1.5, wy, 3, wh); } }
  // 1 cream limestone tower: smooth stone, joint lines, a regular grid of dark windows with thin frames
  { const oy = h; x.fillStyle = '#d6ccb8'; x.fillRect(0, oy, w, h); speck(x, w, h, 0, [], R); for (let k = 0; k < 60; k++) blot2(x, R.r(0, w), oy + R.r(0, h), R.r(10, 40), 'rgba(150,140,120,0.12)');
    x.fillStyle = 'rgba(120,110,95,0.35)'; for (let r = 0; r <= 8; r++) x.fillRect(0, oy + r * h / 8 - 1, w, 2);
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 4; b++) { const cw = w / 4, wx = b * cw + cw * 0.2, ww = cw * 0.6, wy = oy + fl * h / 4 + h * 0.06, wh = h / 4 * 0.56; x.fillStyle = '#b8ae9a'; x.fillRect(wx - 3, wy - 3, ww + 6, wh + 6); glassW(wx, wy, ww, wh); x.fillStyle = '#8a8274'; x.fillRect(wx + ww / 2 - 1, wy, 2, wh); x.fillStyle = '#c8bea8'; x.fillRect(wx - 5, wy + wh + 3, ww + 10, 5); } }
  // 2 grey concrete tower: wide windows, deep concrete frames
  { const oy = 2 * h; x.fillStyle = '#9a9890'; x.fillRect(0, oy, w, h); for (let k = 0; k < 80; k++) blot2(x, R.r(0, w), oy + R.r(0, h), R.r(8, 30), R.f() < 0.5 ? 'rgba(60,60,60,0.12)' : 'rgba(220,220,215,0.1)');
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 2; b++) { const cw = w / 2, wx = b * cw + cw * 0.08, ww = cw * 0.84, wy = oy + fl * h / 4 + h * 0.05, wh = h / 4 * 0.6; x.fillStyle = '#6a6862'; x.fillRect(wx - 4, wy - 4, ww + 8, wh + 8); glassW(wx, wy, ww, wh); x.fillStyle = '#7a7872'; for (let q = 1; q < 4; q++) x.fillRect(wx + q * ww / 4 - 1.5, wy, 3, wh); } }
  // 3 tan brick walk-up: lighter brick, paired windows, black fire-escape-ish railings drawn under some windows
  { const oy = 3 * h; for (let r = 0; r < 96; r++) for (let c = 0; c < 26; c++) { const v = R.r(-14, 14); x.fillStyle = `rgb(${160 + v},${118 + v * 0.7},${90 + v * 0.6})`; x.fillRect(c * w / 24 - (r % 2) * w / 48, oy + r * h / 96, w / 24 - 1.2, h / 96 - 1.2); }
    for (let fl = 0; fl < 4; fl++) for (let b = 0; b < 4; b++) { const cw = w / 4, wx = b * cw + cw * 0.2, ww = cw * 0.25, wy = oy + fl * h / 4 + h * 0.06, wh = h / 4 * 0.55;
      for (const dx of [0, ww + 10]) { x.fillStyle = '#efe8dc'; x.fillRect(wx + dx - 3, wy - 3, ww + 6, wh + 6); glassW(wx + dx, wy, ww, wh); } x.fillStyle = '#b8a890'; x.fillRect(wx - 6, wy - 9, ww * 2 + 22, 6); } }
}, 512, 2048); }
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
  { const X0 = BX + 0.25, X1 = BX + 7, Z0 = 46.25, Z1 = 52, Y = GY + ROOF, railM = TOON({ color: 0x2a2e33 });
    const slab = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 0.1, 0.22, Z1 - Z0 + 0.1), TOON({ color: 0x3e3a35 })); slab.position.set((X0 + X1) / 2, Y, (Z0 + Z1) / 2); slab.visible = false;
    const bar = (ax, az, bx, bz, y, th) => { const L = Math.hypot(bx - ax, bz - az), m = new THREE.Mesh(new THREE.BoxGeometry(th, th, L), railM); m.position.set((ax + bx) / 2, y, (az + bz) / 2); m.rotation.y = Math.atan2(bx - ax, bz - az); scene.add(m);
      for (let d = 0; d <= L + 1e-3; d += 0.24) { const u = d / L, p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.02, 0.03), railM); p.position.set(ax + (bx - ax) * u, Y + 0.62, az + (bz - az) * u); scene.add(p); } };
    [].forEach(([ax, az, bx, bz]) => { bar(ax, az, bx, bz, Y + 1.12, 0.07); const L = Math.hypot(bx - ax, bz - az), m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, L), railM); m.position.set((ax + bx) / 2, Y + 0.5, (az + bz) / 2); m.rotation.y = Math.atan2(bx - ax, bz - az); scene.add(m); }); }
  // ---- the ground: asphalt with lane lines, crosswalks, sidewalks with curbs, the median with trees
  const asph = wrap(g3Tex((x, w) => { const Ra = RNG('asph'); x.fillStyle = '#4a4a4c'; x.fillRect(0, 0, w, w); speck(x, w, w, 26000, ['rgba(20,20,22,0.35)', 'rgba(140,140,140,0.25)', 'rgba(90,86,80,0.3)'], Ra, 1, 2); for (let k = 0; k < 30; k++) blot2(x, Ra.r(0, w), Ra.r(0, w), Ra.r(10, 60), 'rgba(20,20,20,0.12)'); }, 256, 256), 1, 1);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1800, 400 + OZ).rotateX(-Math.PI / 2), TOON({ map: asph, bumpMap: asph, bumpScale: 0.4, roughness: 0.92 })); ground.position.set(0, GY, (SEAZ + 322) / 2); GRND.ground = ground;
  { const uv = ground.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1800 / 6, uv.getY(i) * (400 + OZ) / 6); } ground.receiveShadow = true; scene.add(ground);
  const paint = new THREE.MeshStandardMaterial({ color: 0xf2f0e8, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 }), yel = new THREE.MeshStandardMaterial({ color: 0xf2c230, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2 });
  const marks = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), paint, 3200, false); let nm = 0; const mark = (x, z, w, d, m = marks) => m.setMatrixAt(nm++, M4c(x, GY + 0.015, z, 0, w, 1, d));
  const inX = (z) => XSTREETS.some(([a, b]) => z > a - 1 && z < b + 1);
  for (let z = SEAZ + 2; z < 300; z += 6) if (!inX(z)) for (const x of [-5, 5]) mark(x, z, 0.15, 3);
  XSTREETS.forEach(([a, b]) => { for (let x = -ROADX + 0.5; x < ROADX; x += 1.1) { mark(x, a - 2.2, 0.6, 3.2); mark(x, b + 2.2, 0.6, 3.2); } for (let x = BX + 2; x < 300; x += 6) for (const s of [-1, 1]) if (nm < 3190) mark(s * x, (a + b) / 2, 3, 0.15); });
  marks.count = nm; scene.add(marks);
  const yl = IM(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), yel, 2, false); yl.setMatrixAt(0, M4c(-1.05, GY + 0.015, (SEAZ + 300) / 2, 0, 0.12, 1, 300 - SEAZ)); yl.setMatrixAt(1, M4c(1.05, GY + 0.015, (SEAZ + 300) / 2, 0, 0.12, 1, 300 - SEAZ)); scene.add(yl);
  const conc = wrap(g3Tex((x, w) => { const Rc = RNG('conc'); x.fillStyle = '#b8b2a8'; x.fillRect(0, 0, w, w); speck(x, w, w, 9000, ['rgba(60,60,60,0.15)', 'rgba(255,255,255,0.15)'], Rc, 1, 2); x.fillStyle = 'rgba(60,56,50,0.5)'; for (let k = 0; k <= 4; k++) { x.fillRect(k * w / 4 - 1, 0, 2, w); x.fillRect(0, k * w / 4 - 1, w, 2); } }, 256, 256), 1, 1);
  const concM = TOON({ map: conc, bumpMap: conc, bumpScale: 0.5, roughness: 0.9 }), walks = []; GRND.conc = concM;
  const zRuns = ZRUNS;
  zRuns.forEach(([a, b]) => { for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(BX - ROADX + 30, 0.32, b - a), concM); m.position.set(s * (ROADX + (BX - ROADX + 30) / 2), GY, (a + b) / 2); m.receiveShadow = true; scene.add(m); walks.push(m);
      const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (BX - ROADX + 30) / 3, uv.getY(i) * (b - a) / 3); }
    const med = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, b - a - 4), concM); med.position.set(0, GY + 0.05, (a + b) / 2); scene.add(med); });
  for (const s2 of [-1, 1]) for (const [za, zb] of [[BLV.z0, BLV.r0], [BLV.r1, BLV.z1]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(600, 0.32, zb - za), concM); m.position.set(s2 * (ROADX + 300), GY, (za + zb) / 2); m.receiveShadow = true; scene.add(m);
    const uv = m.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 600 / 3, uv.getY(i) * (zb - za) / 3); }
  { const m = new THREE.Mesh(new THREE.BoxGeometry(1200, 0.3, 1.6), concM); m.position.set(0, GY + 0.05, (BLV.r0 + BLV.r1) / 2); scene.add(m); }
  // ---- buildings: brick, stucco and glass blocks along the avenue and the cross streets, taller rows behind, towers far back
  const facShader = (m, tw, th, nv = 4) => { m.onBeforeCompile = (sh) => { Object.assign(sh.uniforms, FX);
    sh.vertexShader = 'attribute float aCut; attribute float aPeel; attribute float aVar; varying float vCut, vPeel, vVar, vSeed; varying vec3 vTp; varying vec2 vTw;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 sc = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz)); vec3 lp = (position + 0.5) * sc; vTp = lp; vCut = aCut * sc.y; vPeel = aPeel; vVar = aVar; vSeed = instanceMatrix[3].x * 0.071 + instanceMatrix[3].z * 0.033;
      vTw = (abs(normal.x) > 0.5 ? vec2(lp.z, lp.y) : vec2(lp.x, lp.y)) / vec2(${tw.toFixed(1)}, ${th.toFixed(1)}); if (abs(normal.y) > 0.5) vTw = vec2(0.02, 0.02);`);
    sh.fragmentShader = 'uniform float uL, uWY, uMud, uMudY, uVine, uWet, uCyc; varying float vCut, vPeel, vVar, vSeed; varying vec3 vTp; varying vec2 vTw; float gWin;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance += mix(vec3(1.0, 0.74, 0.44), vec3(0.85, 0.9, 1.0), step(0.8, fract(floor(vSeed * 64.0 + 0.5) / 64.0 * 13.7))) * gWin * 1.25;').replace('#include <map_fragment>', `gWin = 0.0; { vec2 tw2 = vec2(fract(vTw.x), (fract(vTw.y) + vVar) / ${nv.toFixed(1)}); vec3 texel = textureGrad(map, tw2, dFdx(vTw) * vec2(1.0, ${(1).toFixed(1)} / ${nv.toFixed(1)}), dFdy(vTw) * vec2(1.0, 1.0 / ${nv.toFixed(1)})).rgb; diffuseColor.rgb *= texel * 1.05;
        float wy = vTp.y + ${GY.toFixed(2)}, lum = dot(texel, vec3(0.3, 0.59, 0.11)), isWin = 1.0 - smoothstep(0.12, 0.24, lum);
        vec2 cell = floor(vTw * 4.0); float hsh = fract(sin(dot(cell + vec2(vSeed, vSeed * 1.7), vec2(12.9898, 78.233))) * 43758.5453);
        float sd = floor(vSeed * 64.0 + 0.5) / 64.0, cyc = mod(uCyc, 97.0); float vi = ${(nv - 1).toFixed(1)} - floor(vVar + 0.5), yl = 1.0 - fract(vTw.y), xl = fract(vTw.x), bays = (vi > 1.5 && vi < 2.5) ? 2.0 : 4.0;
        float fy = fract(yl * 4.0), bx = fract(xl * bays);
        vec4 rc = vi < 0.5 ? vec4(0.24, 0.76, 0.18, 0.82) : vi < 1.5 ? vec4(0.2, 0.8, 0.24, 0.8) : vi < 2.5 ? vec4(0.08, 0.92, 0.2, 0.8) : vec4(0.2, 0.75, 0.24, 0.79);
        float glass = step(rc.x, bx) * step(bx, rc.y) * step(rc.z, fy) * step(fy, rc.w) * step(1.5, ${nv.toFixed(1)}); float mx = (rc.x + rc.y) * 0.5, my = mix(rc.z, rc.w, 0.48); glass *= 1.0 - 0.85 * max(step(abs(bx - mx), 0.012 * 4.0 / bays), step(abs(fy - my), 0.012));
        vec2 wcell = vec2(floor(xl * bays) + floor(vTw.x) * 8.0, floor(yl * 4.0) - floor(vTw.y) * 4.0); float hsh2 = fract(sin(dot(mod(wcell, 61.0) + vec2(fract(sd * 0.37) * 50.0, fract(sd * 0.71) * 50.0), vec2(12.9898, 78.233))) * 43758.5453);
        float hn = fract(sin(dot(mod(wcell, 61.0) + vec2(fract(sd * 0.53) * 40.0, cyc * 0.731), vec2(39.3, 11.7))) * 24634.63);
        gWin = glass * step(hn, uL * 0.55) * step(uWY + 0.4, wy) * (0.55 + 0.45 * hsh2); diffuseColor.rgb *= 1.0 - 0.7 * smoothstep(0.0, 0.5, gWin);
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.8, 0.86, 0.95) + vec3(0.04, 0.05, 0.07), glass * 0.5);
        diffuseColor.rgb *= (0.78 + 0.22 * smoothstep(0.0, 9.0, wy - 2.4)) * (0.93 + 0.07 * sin(vTp.x * 7.3 + sin(vTp.y * 0.21) * 3.0) * sin(vTp.z * 5.9 + vTp.x)) * (0.94 + 0.12 * fract(vSeed * 7.31)); diffuseColor.rgb *= 1.0 - 0.28 * uWet;
        if (vTp.y < 4.2 && vTp.y > 0.0) { float u12 = vTw.x * ${tw.toFixed(1)}, cellx = mod(u12, 12.0); vec3 stone = vec3(0.46, 0.43, 0.39) * (0.9 + 0.1 * sin(u12 * 3.1) * sin(vTp.y * 5.3));
          stone *= 1.0 - 0.18 * step(abs(fract(vTp.y / 0.6) - 0.5), 0.04); diffuseColor.rgb = stone * (0.94 + 0.12 * fract(vSeed * 7.31));
          float door = step(abs(cellx - 6.0), 1.0) * step(vTp.y, 2.7), frame = step(abs(cellx - 6.0), 1.2) * step(vTp.y, 2.95) * (1.0 - door);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.82, 0.74), frame); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.16, 0.11, 0.08) + 0.05 * step(abs(cellx - 6.0), 0.04), door);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.52), step(3.95, vTp.y)); gWin = 0.0; }
        float nz = 0.6 * sin(vTp.x * 0.9 + vTp.z * 0.7) + 0.4 * sin(vTp.x * 3.7 - vTp.z * 2.9);
        float mud = uMud * (1.0 - smoothstep(uMudY - 0.6 + nz * 0.4, uMudY + 0.2, wy)); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.42, 0.37, 0.29), mud * 0.72);
        for (int k = 1; k < 4; k++) { float ly = uMudY * float(k) / 4.0; diffuseColor.rgb *= 1.0 - 0.18 * uMud * (1.0 - smoothstep(0.0, 0.35, abs(wy - ly - nz * 0.3))); }
        float vh = uVine * (6.0 + 22.0 * (0.5 + 0.5 * sin(vTp.x * 0.37 + vTp.z * 0.29 + vSeed * 5.0))), vn = 0.5 + 0.5 * sin(vTp.x * 2.1 + sin(vTp.y * 1.3) * 2.0 + vTp.z * 1.7) * sin(vTp.y * 1.9 - vTp.x * 0.6);
        float vine = (1.0 - smoothstep(vh - 2.0, vh + 1.0, wy - vn * 3.0)) * smoothstep(0.35, 0.6, vn + 0.25 * uVine); diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.22, 0.42, 0.16), vec3(0.36, 0.56, 0.22), vn), vine * step(0.01, uVine)); }
      if (vPeel > 0.0) { vec3 q = vTp * 0.33; float n = 0.5 + 0.25 * sin(q.x * 2.3 + sin(q.y * 1.7) * 2.0 + q.z * 1.9) * sin(q.y * 2.1 - q.x * 0.7 + sin(q.z * 1.3)) + 0.15 * sin(q.x * 6.1 - q.y * 5.3 + q.z * 4.7) + 0.1 * sin(q.y * 13.0 + q.x * 11.0); if (n < vPeel) discard; diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.62, 0.58, 0.52), 1.0 - smoothstep(vPeel, vPeel + 0.05, n)); }
      { float jag = 1.6 * sin(vTp.x * 0.9 + vTp.z * 1.3) + 1.1 * sin(vTp.x * 3.1 - vTp.z * 2.7) + 0.6 * sin(vTp.x * 7.3 + vTp.z * 5.1); if (vTp.y > vCut + jag) discard; float rim = 1.0 - smoothstep(0.0, 2.2, vCut + jag - vTp.y); diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.5, 0.46, 0.42), rim * step(vCut, 9000.0)); }`); }; return m; };
  const brickT = texCityAtlas(), stucT = brickT; [brickT].forEach((tx) => { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.anisotropy = 8; });
  const curtain = brickT;
  curtain.wrapS = curtain.wrapT = THREE.RepeatWrapping;
  const MATS = { brick: facShader(TOON({ map: brickT, roughness: 0.85 }), 12, 12), stucco: facShader(TOON({ map: stucT, roughness: 0.85 }), 12, 12), glass: facShader(TOON({ map: curtain, roughness: 0.6, metalness: 0.05 }), 12, 12) };
  const COLS = { brick: ['#ffffff', '#f2ece6', '#e8e2dc', '#f6f0e8'], stucco: ['#ffffff', '#f4efe6', '#ebe4d8', '#f8f4ec'], glass: ['#ffffff', '#eceae6', '#e2e0dc', '#f4f2ee'] };
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
  { const c = BL.brick.concat(BL.stucco, BL.glass).filter((b) => b.row === 1 && b.x > 0 && b.z - b.sz / 2 > 45 && b.z - b.sz / 2 < 49).sort((a, b) => a.z - b.z)[0]; if (c) { c.h = ROOF; c.self = true; } }
  const BUI = []; const meshes = {}; for (const kind in BL) { const L = BL[kind], geo = new THREE.BoxGeometry(1, 1, 1); geo.setAttribute('aCut', new THREE.InstancedBufferAttribute(new Float32Array(L.length).fill(9e3), 1)); geo.attributes.aCut.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aPeel', new THREE.InstancedBufferAttribute(new Float32Array(L.length), 1)); geo.attributes.aPeel.setUsage(THREE.DynamicDrawUsage); geo.setAttribute('aVar', new THREE.InstancedBufferAttribute(new Float32Array(L.map((b) => (b.kind === 'brick' ? (R.f() < 0.6 ? 0 : 3) : b.kind === 'stucco' ? (R.f() < 0.5 ? 3 : 1) : (b.row === 3 ? (R.f() < 0.55 ? 1 : 2) : (R.f() < 0.5 ? 1 : 2))))), 1)); L.forEach((b, i) => (b.var = geo.attributes.aVar.array[i]));
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
// ---- what the rain adds to the city (built once, after gC): the water, the rain, umbrellas, boats, the forest
let GR = null;
function gR() {
  if (GR) return GR;
  const g = g3(), o = gC(), scene = g.scene;
  // the water: murky, rain-pocked (rings), sky in it; seen from above and from below
  const wU = { uT: { value: 0 }, uRain: { value: 0 }, uSky: { value: lin('#7a8a90') }, uDeep: { value: lin('#2a3a36') }, uShal: { value: lin('#5a5a48') }, uLev: { value: 0 }, uUnder: { value: 0 }, fogColor: { value: new THREE.Color() }, fogNear: { value: 1 }, fogFar: { value: 1000 } };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: wU, transparent: true, side: THREE.DoubleSide, depthWrite: false, fog: true,
    vertexShader: `varying vec3 vW;
      #include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform float uT, uRain, uLev, uUnder; uniform vec3 uSky, uDeep, uShal; varying vec3 vW;
      #include <fog_pars_fragment>
      float h2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main(){ vec2 p = vW.xz; float d = length(vW - cameraPosition);
        // rain rings: each 1.2 m cell has a drop landing at its own time; a ring spreads and fades
        vec2 n2 = vec2(0.0); float fine = 1.0 - smoothstep(20.0, 140.0, d);
        for (int k = 0; k < 2; k++) { float sc = k == 0 ? 0.8 : 1.9; vec2 q = p * sc + float(k) * 17.0; vec2 c = floor(q); vec2 f = fract(q) - 0.5; float ph = fract(uT * (0.9 + h2(c) * 0.8) + h2(c + 3.1)); vec2 o = vec2(h2(c + 1.3), h2(c + 7.7)) - 0.5; vec2 r = f - o * 0.5; float rr = length(r);
          float ring = sin((rr - ph * 0.5) * 60.0) * (1.0 - smoothstep(0.0, 0.09, abs(rr - ph * 0.5))) * (1.0 - ph); n2 += normalize(r + 1e-4) * ring * 0.35 * uRain * fine; }
        n2 += 0.04 * vec2(sin(p.x * 0.31 + uT * 1.1) + sin(p.y * 0.23 - uT * 0.8), sin(p.y * 0.29 + uT * 0.9) + sin(p.x * 0.17 + uT)) * (1.0 - 0.6 * uRain);
        float shallow = 1.0 - smoothstep(0.4, 3.0, uLev), flow = smoothstep(0.86, 1.0, sin(p.x * 5.3 + sin(p.y * 0.37 + p.x * 0.6) * 2.2)) * (0.5 + 0.5 * sin(p.y * 0.9 + uT * 7.0 + p.x * 0.8)) * shallow * fine;
        n2 += vec2(0.0, 0.12) * flow;
        vec3 n = normalize(vec3(n2.x, 1.0, n2.y)), V = normalize(vW - cameraPosition);
        float fres = 0.04 + 0.96 * pow(1.0 - abs(dot(-V, n)), 5.0);
        vec3 body = mix(uShal, uDeep, smoothstep(0.2, 6.0, uLev));
        vec3 col = mix(body, uSky * 1.15, clamp(0.25 + fres * 0.75, 0.0, 1.0));
        col += vec3(0.9) * pow(max(dot(reflect(V, n), normalize(vec3(0.3, 1.0, -0.4))), 0.0), 80.0) * 0.25 * (1.0 - uUnder);
        if (uUnder > 0.5) col = mix(vec3(0.42, 0.58, 0.56), vec3(0.12, 0.22, 0.22), smoothstep(0.0, 1.0, fres));
        col = mix(col, vec3(0.8, 0.78, 0.72), flow * 0.45);
        float al = mix(0.78, 0.95, smoothstep(0.1, 2.5, uLev)) ; if (uUnder > 0.5) al = 0.85;
        gl_FragColor = vec4(col, al);
        #include <fog_fragment>
      }` }));
  water.renderOrder = 4; water.frustumCulled = false; scene.add(water);
  // the rain: streaks in a box in front of you (wrapped), lit grey
  const RN = 7000, rP = new Float32Array(RN * 6), rG = new THREE.BufferGeometry(); rG.setAttribute('position', new THREE.BufferAttribute(rP, 3));
  const rain = new THREE.LineSegments(rG, new THREE.LineBasicMaterial({ color: 0xc8d2da, transparent: true, opacity: 0.5, depthWrite: false })); rain.frustumCulled = false; rain.renderOrder = 8; scene.add(rain);
  const rL = []; { const Rr = RNG('rain'); for (let i = 0; i < RN; i++) rL.push([Rr.r(-45, 45), Rr.r(0, 1), Rr.r(-110, 6), Rr.r(0.8, 1.2)]); }
  // umbrellas for the people on the street (before the night)
  const umb = IM(new THREE.ConeGeometry(0.55, 0.3, 10, 1, true).translate(0, 2.15, 0), TOON({ side: THREE.DoubleSide }), o.pp.length, false); umb.instanceMatrix.setUsage(THREE.DynamicDrawUsage); umb.frustumCulled = false; scene.add(umb);
  { const Ru = RNG('umb'); o.pp.forEach((q, i) => { q.umb = Ru.f() < 0.75; q.leave = Ru.r(9.5, 16.5); q.coat = Ru.f() < 0.5; umb.setColorAt(i, lin(Ru.pick(['#1e1e22', '#c8372d', '#2f6fd1', '#f0c33c', '#3a7a4a', '#7b4fc9', '#1e1e22']))); }); }
  // small boats: a hull, a seated rower; they come out once the street is a river
  const boatHull = IM(new THREE.BoxGeometry(1.3, 0.45, 3.6).translate(0, 0.1, 0), TOON({}), 16), boatTip = IM(new THREE.ConeGeometry(0.65, 1.2, 4).rotateX(Math.PI / 2).rotateZ(Math.PI / 4).scale(1, 0.5, 1).translate(0, 0.1, 2.4), TOON({}), 16);
  [boatHull, boatTip].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  const BT = []; { const Rb = RNG('boats'); for (let k = 0; k < 16; k++) { const onB = k % 3 === 0; BT.push({ ax: onB, lane: onB ? Rb.r(22, 38) : Rb.r(-8, 8), s0: onB ? Rb.r(16, 160) : Rb.r(-160, 40), v: Rb.r(0.8, 2.0) * (Rb.f() < 0.5 ? 1 : -1), t0: Rb.r(18, 27), col: Rb.pick(['#c8372d', '#f2efe8', '#2f6fd1', '#f0c33c', '#2a8a5a']) }); boatHull.setColorAt(k, lin(BT[k].col)); boatTip.setColorAt(k, lin(BT[k].col)); } }
  // the forest that takes the city back: trees in the streets, on the sidewalks and the median, crowns of leaf cards
  const leafT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); const Rl = RNG('leafcard2'); for (let k = 0; k < 110; k++) { const px = Rl.r(8, w - 8), py = Rl.r(8, w - 8), r = Rl.r(4, 10), a = Rl.r(0, TAU); x.fillStyle = Rl.pick(['#3a6a2a', '#4a7a32', '#2e5a24', '#5a8a3a', '#6a9a42', '#7aa848']); x.beginPath(); x.ellipse(px, py, r, r * 0.5, a, 0, TAU); x.fill(); } }, 128, 128);
  const FT = []; { const Rf = RNG('forest'); let tries = 0; while (FT.length < 1300 && tries++ < 20000) { const x = Rf.r(-160, 260), z = Rf.r(-420, 80); const inBld = o.BUI.some((b) => Math.abs(x - b.x) < b.sx / 2 + 0.5 && Math.abs(z - b.z) < b.sz / 2 + 0.5); if (inBld) continue; if (Math.hypot(x - CAMX, z - CAMZ) < 16) continue;
      FT.push({ x, z, h: Rf.r(5, 15), t0: Rf.r(61.5, 67.5), sp: Rf.r(0.7, 1.3) }); } }
  const ftr = IM(new THREE.CylinderGeometry(0.18, 0.32, 1, 7).translate(0, 0.5, 0), TOON({ color: 0x5a4632 }), FT.length), FC = [];
  FT.forEach((tr, ti) => { const Rc = RNG('crown', ti); for (let k = 0; k < 12; k++) { const a = Rc.r(0, TAU), r = Rc.r(0, 0.34), yy = Rc.r(-0.22, 0.22); FC.push({ ti, ox: Math.cos(a) * r, oy: 1 + yy, oz: Math.sin(a) * r, s: Rc.r(0.45, 0.7), ry: Rc.r(0, TAU), rx: Rc.r(-0.8, 0.8) }); } });
  const fcr = IM(new THREE.PlaneGeometry(1, 1), TOON({ map: leafT, alphaTest: 0.4, side: THREE.DoubleSide }), FC.length, false);
  [ftr, fcr].forEach((m) => { m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); });
  // grass and shrubs on the ground once the water is gone (instanced tufts)
  const tuftT = g3Tex((x, w) => { x.clearRect(0, 0, w, w); const Rt = RNG('tuft'); for (let k = 0; k < 60; k++) { const bx = Rt.r(10, w - 10); x.strokeStyle = Rt.pick(['#4a7a2a', '#5a8a32', '#6a9a3a', '#3a6a22']); x.lineWidth = Rt.r(2, 4); x.beginPath(); x.moveTo(bx, w); x.quadraticCurveTo(bx + Rt.n(10), w * 0.5, bx + Rt.n(20), Rt.r(4, w * 0.5)); x.stroke(); } }, 128, 128);
  const TF = []; { const Rt = RNG('tufts'); for (let k = 0; k < 9000; k++) { const x = CAMX + Rt.r(-120, 80), z = CAMZ + Rt.r(-300, 12); if (o.BUI.some((b) => Math.abs(x - b.x) < b.sx / 2 && Math.abs(z - b.z) < b.sz / 2)) continue; TF.push({ x, z, s: Rt.r(0.8, 2.2), ry: Rt.r(0, TAU), t0: Rt.r(60.5, 67) }); } }
  const tufts = IM(new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), TOON({ map: tuftT, alphaTest: 0.4, side: THREE.DoubleSide }), TF.length, false); tufts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); tufts.frustumCulled = false; scene.add(tufts);
  // silt and debris hanging in the water when you are under it
  const SN = 4000, sP = new Float32Array(SN * 3), sG = new THREE.BufferGeometry(); sG.setAttribute('position', new THREE.BufferAttribute(sP, 3));
  const silt = new THREE.Points(sG, new THREE.PointsMaterial({ size: 0.12, color: 0x9ab0a4, transparent: true, opacity: 0.7, depthWrite: false })); silt.frustumCulled = false; scene.add(silt);
  const sL = []; { const Rs = RNG('silt'); for (let i = 0; i < SN; i++) sL.push([Rs.r(-40, 40), Rs.r(-20, 20), Rs.r(-90, 4), Rs.r(0, TAU)]); }
  // things the flood scatters: cars resting where the water left them (random spots and angles)
  o.CAR.forEach((q, i) => { const Rq = RNG('carend', i); q.endX = Rq.r(-9, 9) + (Rq.f() < 0.3 ? Rq.r(-6, 30) : 0); q.endZ = q.z0 - Rq.r(10, 90); q.endYaw = Rq.r(0, TAU); q.endRoll = Rq.f() < 0.25 ? Math.PI * 0.5 * (Rq.f() < 0.5 ? 1 : -1) : 0; q.drift = Rq.r(0.4, 1.4); q.stopT = Rq.r(10.5, 15); });
  const FLT = []; { const Rd = RNG('flotsam'); for (let k = 0; k < 520; k++) { const onB = Rd.f() < 0.3; FLT.push({ x: onB ? Rd.r(14, 220) : Rd.r(-9.5, 9.5), z: onB ? Rd.r(19, 41) : Rd.r(-260, 40), s: [Rd.r(0.3, 2.2), Rd.r(0.08, 0.5), Rd.r(0.3, 1.2)], v: Rd.r(0.4, 1.6), ph: Rd.r(0, TAU), t0: Rd.r(11.5, 30), col: Rd.pick(['#6a4a30', '#8a6a48', '#2a2a2a', '#3a5a2a', '#c8b89a', '#5a4a3a', '#1e1e22', '#a8a090', '#4a6a8a']) }); } }
  const flot = IM(new THREE.BoxGeometry(1, 1, 1), TOON({ roughness: 0.9 }), FLT.length, false); flot.instanceMatrix.setUsage(THREE.DynamicDrawUsage); flot.frustumCulled = false; FLT.forEach((q, i) => flot.setColorAt(i, lin(q.col))); scene.add(flot);
  GR = { flot, FLT, water, wU, rain, rP, rG, rL, umb, boatHull, boatTip, BT, ftr, fcr, FT, FC, tufts, TF, silt, sP, sG, sL };
  return GR;
}
function streetPose(q, t) {
  // walk until they leave (9.5-16.5, they run for cover); a few in raincoats carry sandbags (17-25); then the street is empty
  if (t > q.leave + 0.8 && !(q.coat && q.kind === 'stand' && t > 17 && t < 25)) return null;
  let x = q.x, z = q.z, yaw = q.yaw || 0, walk = 0, p = t * 5.6 + q.ph, hurry = 1 + 0.6 * ss(4, 6, t);
  const tw = Math.min(t, q.leave);
  if (q.kind === 'walk') { z = q.z + q.v * hurry * tw; yaw = q.v > 0 ? 0 : Math.PI; walk = t < q.leave ? 1 : 0; }
  if (q.kind === 'cross' || q.kind === 'walkx') { x = q.x + q.v * hurry * tw; yaw = q.v > 0 ? Math.PI / 2 : -Math.PI / 2; walk = t < q.leave ? 1 : 0; }
  if (q.kind === 'stand' && t > 17) { walk = 0; return { x, y: groundY(x, z), z, yaw, walk, p, bend: 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + q.ph)), lie: 0 }; }
  return { x, y: groundY(x, z), z, yaw, walk, p: t * 5.6 * hurry + q.ph, lie: 0 };
}
const carAt = (q, t) => { if (q.parked) return { x: q.lx, z: q.z0, yaw: 0 }; const run = q.dir * q.v0 * Math.min(t, q.stopT) * 0.8; return q.ax ? { x: q.z0 + run, z: q.lx, yaw: q.dir > 0 ? Math.PI / 2 : -Math.PI / 2 } : { x: q.lx, z: q.z0 + run, yaw: q.dir > 0 ? 0 : Math.PI }; };

function updateRain() {
  const g = g3(), o = gC(), r = gR(), t = TT, c = camPoseC(t), lv = level(t), wy = GY + lv, night = nightK(t), rk = rainK(t), under = c.y < wy ? 1 : 0, after = ss(55.2, 57, t), green = ss(62.5, 69.5, t);
  g.cam.position.set(c.x, c.y, c.z); g.cam.rotation.set(c.pitch, c.yaw, c.roll); g.cam.fov = 64; g.cam.updateProjectionMatrix();
  g.sky.position.copy(g.cam.position); g.stars.visible = false; g.wave.visible = false;
  // one-time: hide giro's destruction systems
  if (!r.cleaned) { [o.cores, o.debris, o.wjunk, o.grit, o.scraps, o.piles, o.slabs, o.crack, ...Object.values(o.chunks), ...Object.values(o.panels)].forEach((m) => m && (m.visible = false)); r.cleaned = true; }
  // the light of each moment: grey storm day -> night -> the dim grey of a time-lapse of years -> under water -> sun
  const flash = [8.2, 15.3, 31.4, 38.6, 44.1].reduce((a, ft) => a + Math.max(0, 1 - Math.abs(t - ft) / 0.12) * (t < 47 ? 1 : 0), 0) + (t > T_THUNDER && t < T_THUNDER + 0.25 ? 1.5 : 0);
  const su = g.skyU, sky = { top: C3('#6a747c', '#1a1e26', night), mid: C3('#8a949a', '#262c34', night), hor: C3('#a8b0b4', '#343a42', night) };
  su.top.value.copy(sky.top.clone().lerp(lin('#3a7ad0'), after)); su.mid.value.copy(sky.mid.clone().lerp(lin('#7ab0e8'), after)); su.hor.value.copy(sky.hor.clone().lerp(lin('#e8f0f0'), after));
  [su.top.value, su.mid.value, su.hor.value].forEach((v) => v.addScalar(0.25 * flash));
  const SD = sunAt(t); su.moonDir.value.copy(SD.d); su.halo.value = 0.8 * after + 0.6 * SD.k * (1 - rk) * (t < 10 ? 1 : 0); su.haloW.value = 0.004; su.fire.value = 0; su.dark.value = 0;
  g.sky.visible = !under;
  o.vclouds.forEach((s) => { const u = s.userData; s.position.set(u.x, u.y * 0.7, u.z); s.scale.set(u.w * 1.6, u.w * 0.62, 1); s.material.opacity = u.o * (0.95 - 0.4 * night) * (1 - under) * (after > 0 ? 0.8 : 1); s.material.color.copy(C3('#7a8088', '#262a30', night).lerp(lin('#ffffff'), after)); s.visible = !under; });
  const fogC = under ? lin('#2e5a54') : C3('#a8b0b6', '#5e6c82', night).lerp(lin('#d8e6ea'), after).addScalar(0.15 * flash);
  g.scene.fog.color.copy(fogC); g.scene.fog.near = under ? 2 : lerp(lerp(30, 4, rk), 300, after); g.scene.fog.far = under ? lerp(300, 180, ss(47, 54, t)) : lerp(lerp(1400, 400, rk), 16000, after);
  g.key.target.position.set(CAMX - 20, 0, CAMZ - 60); g.key.target.updateMatrixWorld(); g.key.position.copy(g.key.target.position).addScaledVector(SD.d, 600);
  if (!g.key.userData.boxed) { Object.assign(g.key.shadow.camera, { left: -220, right: 220, top: 220, bottom: -220, near: 50, far: 1300 }); g.key.shadow.camera.updateProjectionMatrix(); g.key.shadow.bias = -0.0004; g.key.shadow.normalBias = 0.4; g.key.userData.boxed = true; }
  g.key.color.copy(C3('#fff0d8', '#ffc890', t < 10 ? ss(4, 10, t) : 0).lerp(lin('#c8d4e4'), rk * (1 - after)).lerp(lin('#fff0d8'), after)); g.key.intensity = SD.k * lerp(lerp(3.6, 0.75, rk), 3.6, after) * (t < 10 ? 1 : lerp(1, 0.45, ss(12, 20, t)) * (t >= 55 ? 1 / 0.45 : 1)) + 3.0 * flash; g.fill.intensity = 0;
  g.hemi.color.copy(C3('#c8d0d8', '#7a8aa8', night).lerp(lin('#bcd6f4'), after)); g.hemi.groundColor.copy(C3('#6a6a64', '#3a3e46', night)); const sunny = Math.max(t < 10 ? (1 - rk * 0.8) * (1 - ss(8.5, 10.5, t)) : 0, after); g.hemi.intensity = (under ? 0.9 : lerp(lerp(1.05, 0.8, night), 0.6, sunny)) + 0.8 * flash;
  if (under) g.hemi.color.set('#5a8a86');
  g.r.toneMappingExposure = 1.05 + 0.1 * after;
  // the façades: lights on in the evening, only above the water; they go out as it rises; mud lines and vines afterwards
  FX.uL.value = lightsK(t) * clamp(nightK(t) * 1.4); FX.uCyc.value = Math.floor(hoursAt(t) / 24); FX.uWY.value = wy; FX.uWet.value = rk * (1 - after); FX.uMud.value = ss(57, 63, t); FX.uMudY.value = GY + 30; FX.uVine.value = green;
  o.asphM = o.asphM || null; WIN.uOn.value = 0; SNOW.value = 0;
  // the sea at the end of the avenue: grey and choppy under the rain, blue after
  const sea = g.seaMat.uniforms; sea.uT.value = t; sea.uLevel.value = 0.3 + lv; g.seaMesh.position.y = 0.3 + lv; sea.uIce.value = 0; sea.uTop.value.copy(su.top.value); sea.uHor.value.copy(su.hor.value); sea.uFire.value = 0; sea.uDark.value = 0.3 * night; sea.uToeOn.value = 0; sea.uFlood.value = 0; sea.uChurn.value = 1.2 * rk;
  sea.uMoon.value.copy(SD.d); sea.uMoonCol.value.set('#fff4e0'); sea.uGlit.value = after; sea.uGK.value = 300; sea.uShallow.value.copy(C3('#5a6a6a', '#2f9aa0', after)); sea.uMid.value.copy(C3('#3a4a4e', '#1468a8', after)); sea.uDeep.value.copy(C3('#2a3438', '#0a447e', after)); sea.uFar.value.copy(C3('#8a9498', '#9ac0e0', after));
  sea.fogColor.value.copy(g.scene.fog.color); sea.fogNear.value = g.scene.fog.near; sea.fogFar.value = g.scene.fog.far;
  g.boats.forEach((b) => { b.grp.position.set(b.x, 0.3 + lv - 0.4 * b.D + 0.15 * Math.sin(t * 1.4 + b.ph) * (1 + rk), b.z - OZ); b.grp.rotation.set(0.04 * rk * Math.sin(t * 2 + b.ph), b.yaw, 0.06 * Math.sin(t * 1.1 + b.ph) * (1 + 2 * rk)); b.grp.visible = lv < 60; });
  // the water over the street
  r.water.visible = lv > 0.04; r.water.position.y = wy; const wu = r.wU; wu.uT.value = t; wu.uRain.value = rk; wu.uLev.value = lv; wu.uUnder.value = under; wu.uSky.value.copy(su.hor.value); wu.uDeep.value.copy(C3('#4a5e58', '#34464a', night).lerp(lin('#5a6a50'), after)); wu.uShal.value.copy(C3('#8a8264', '#5a5a4c', night).lerp(lin('#8a7a58'), after)); wu.fogColor.value.copy(g.scene.fog.color); wu.fogNear.value = g.scene.fog.near; wu.fogFar.value = g.scene.fog.far;
  // buildings stay (no destruction here)
  o.BUI.forEach((b) => { if (b.self) { b.mesh.setMatrixAt(b.mi, _hid); return; } b.mesh.geometry.attributes.aCut.array[b.mi] = 9e3; b.mesh.geometry.attributes.aPeel.array[b.mi] = 0; b.mesh.setMatrixAt(b.mi, M4c(b.x, GY + b.h / 2, b.z, 0, b.sx, b.h, b.sz)); });
  for (const k in o.meshes) { o.meshes[k].instanceMatrix.needsUpdate = true; o.meshes[k].geometry.attributes.aCut.needsUpdate = true; o.meshes[k].geometry.attributes.aPeel.needsUpdate = true; }
  o.RF.forEach((q, i) => o.roofs.setMatrixAt(i, Math.hypot(q.x - CAMX, q.z - CAMZ) < 16 ? _hid : M4c(q.x, q.y, q.z, 0, q.s[0], q.s[1], q.s[2]))); o.roofs.instanceMatrix.needsUpdate = true;
  o.SHOPS.forEach((q, i) => o.shopG.setMatrixAt(i, M4c(q.x, GY + 2.05, q.z, q.ry, q.w, 4.0, 1))); o.shopG.instanceMatrix.needsUpdate = true;
  o.BUI.forEach((b, i) => o.corn.setMatrixAt(i, b.row === 3 || b.dC < 14 || b.self ? _hid : M4c(b.x, GY + b.h + 0.3, b.z, 0, b.sx + 0.7, 0.6, b.sz + 0.7))); o.corn.instanceMatrix.needsUpdate = true;
  { const cnt = { ac: 0, plat: 0, stair: 0 }; let nr = 0; o.DET.forEach((q) => { const m = o.detM[q.type], i = cnt[q.type]++; const M = q.type === 'stair' ? M4c(q.x, q.y, q.z, 0, 1, 1, 1, q.ry * 0.72, 0) : M4c(q.x, q.y, q.z, 0); m.setMatrixAt(i, M); if (q.type === 'plat') o.detRail.setMatrixAt(nr++, M.clone().multiply(Tr(Math.sign(q.x) * -0.55, 0.45, 0))); });
    for (const k in o.detM) { const m = o.detM[k]; for (let i = cnt[k]; i < m.count; i++) m.setMatrixAt(i, _hid); m.instanceMatrix.needsUpdate = true; } for (let i = nr; i < o.detRail.count; i++) o.detRail.setMatrixAt(i, _hid); o.detRail.instanceMatrix.needsUpdate = true; }
  // awnings and signs: they drip and sag; gone once the water has had them
  o.AWN.forEach((q) => { const im = o.awnings[q.kind], gone = lv > 3.6 || t > 55; im.setMatrixAt(q.slot, gone ? _hid : M4().compose(_v.set(q.x, q.y, q.z), _q.setFromEuler(_e.set(-Math.PI / 2 + (0.3 + 0.1 * rk) * q.s, Math.PI / 2, 0, 'YXZ')), _s.set(q.L, q.depth, 1))); }); o.awnings.forEach((im) => (im.instanceMatrix.needsUpdate = true));
  o.SIG.forEach((q, i) => o.signs.setMatrixAt(i, t > 55 && Math.sin(i * 3.7) > 0 ? _hid : M4c(q.x, q.y, q.z, 0, 0.18, 0.9, q.w))); o.signs.instanceMatrix.needsUpdate = true;
  const LAMPS = []; { const LP = o.lightsG.attributes.position.array, LC = o.lightsG.attributes.color.array, phase = Math.floor(t / 4) % 2;
    o.POL.forEach((q, i) => { const lean = t > 58 ? 0.25 * Math.sin(i * 1.7) : 0, B = M4().compose(_v.set(q.x, SW, q.z), _q.setFromEuler(_e.set(lean * 0.5, 0, lean)), _s.set(1, 1, 1));
      o.polI.setMatrixAt(i, B.clone().multiply(M4().makeScale(1, q.h, 1))); const top = B.clone().multiply(Tr(0, q.h, 0)); o.armI.setMatrixAt(i, top.clone().multiply(Rz(-Math.sign(q.arm) * Math.PI / 2)).multiply(M4().makeScale(1, Math.abs(q.arm), 1)));
      const hd = top.clone().multiply(Tr(q.arm, -0.4, 0)); o.headI.setMatrixAt(i * 2, hd.clone().multiply(M4().makeScale(q.kind === 'tl' ? 0.35 : 0.7, q.kind === 'tl' ? 0.95 : 0.2, 0.35))); o.headI.setMatrixAt(i * 2 + 1, q.kind === 'tl' ? B.clone().multiply(Tr(0, 2.6, 0.25)).multiply(M4().makeScale(0.3, 0.8, 0.3)) : _hid);
      const on = (q.kind === 'tl' ? 1 : night) * (lv < q.h - 0.5 ? 1 : 0) * (t < 45 ? 1 : 0), lp = new THREE.Vector3().setFromMatrixPosition(hd.clone().multiply(Tr(0, q.kind === 'tl' ? (phase ? 0.28 : -0.28) : -0.15, 0.2)));
      LP[i * 3] = lp.x; LP[i * 3 + 1] = on > 0.05 ? lp.y : -1e4; LP[i * 3 + 2] = lp.z; if (q.kind === 'lamp' && on > 0.05) LAMPS.push([lp.x, lp.y, lp.z, on]); const red = (phase + (q.x > 0 ? 0 : 1)) % 2; if (q.kind === 'tl') { LC[i * 3] = red ? 1 : 0.2; LC[i * 3 + 1] = red ? 0.15 : 1; LC[i * 3 + 2] = red ? 0.1 : 0.4; } else { LC[i * 3] = 1.0 * on; LC[i * 3 + 1] = 0.8 * on; LC[i * 3 + 2] = 0.5 * on; } });
    [o.polI, o.armI, o.headI].forEach((m) => (m.instanceMatrix.needsUpdate = true)); o.lightsG.attributes.position.needsUpdate = true; o.lightsG.attributes.color.needsUpdate = true; o.tlights.material.size = 0.55 + 1.6 * night; }
  // loose things float off as the water rises (bins, crates, tables); gone after
  o.SM.forEach((q, i) => { const [a, b, d] = q.dims, fl = lv > b * 0.7; if (lv > 9 || t > 55) { o.small.setMatrixAt(i, _hid); return; } const dz = fl ? -(t - 20) * 0.9 * (0.5 + 0.5 * Math.sin(i)) : 0, y = fl ? wy - b * 0.3 : q.y;
    o.small.setMatrixAt(i, M4c(q.x + (fl ? Math.sin(t * 0.3 + i) * 1.2 : 0), y, q.z + dz, fl ? t * 0.2 + i : 0, a, b, d, fl ? 0.1 * Math.sin(t + i) : 0, 0)); }); o.small.instanceMatrix.needsUpdate = true;
  o.kiosk.position.set(-ROADX - 2.4, SW, 22); o.kiosk.rotation.set(0, 0, 0); o.kiosk.visible = t < 55;
  // median trees: they lose leaves under the water and are dead stumps after; the forest takes over
  o.TREES.forEach((tr, i) => o.trunks.setMatrixAt(i, M4c(tr.x, GY + 0.3, tr.z, 0, 1, t > 55 ? tr.h * 0.7 : tr.h, 1, t > 55 ? 0.15 * Math.sin(i) : 0, 0))); o.trunks.instanceMatrix.needsUpdate = true;
  o.LEAF.forEach((q, i) => { const gone = t > 47 || (lv > q.y - GY && t > 40); o.leaves.setMatrixAt(i, gone ? _hid : M4c(q.x, q.y, q.z, q.ry + 0.12 * rk * Math.sin(t * 7 + i), q.s, q.s, q.s, q.rx, 0)); }); o.leaves.instanceMatrix.needsUpdate = true;
  // cars: driving until the streets flood (they stop 10.5-15), float and drift once the water is deep, sink, and lie where it left them
  o.CAR.forEach((q, i) => { const P = carAt(q, t), hideCar = () => { [o.carBody, o.carCab, o.carLt, o.carTl].forEach((m) => m.setMatrixAt(i, _hid)); o.carBp.setMatrixAt(i * 2, _hid); o.carBp.setMatrixAt(i * 2 + 1, _hid); for (let k = 0; k < 4; k++) { o.carWh.setMatrixAt(i * 4 + k, _hid); o.carRim.setMatrixAt(i * 4 + k, _hid); } };
    let x = P.x, z = P.z, y = GY, yaw = P.yaw, rx = 0, rz = 0; const fl = clamp((lv - 0.9) / 0.6), drift = Math.max(0, t - 24) * q.drift;
    if (t < 55) { if (fl > 0) { y = GY + fl * (lv - 0.55); x += Math.sin(t * 0.21 + i) * 1.5 * fl; z -= drift * fl; yaw += 0.15 * drift * fl; rx = 0.05 * Math.sin(t * 1.3 + i) * fl; rz = 0.05 * Math.sin(t * 1.1 + i) * fl; }
      if (lv > 9) { const sk = ss(40, 45, t); y = lerp(y, GY, sk); } }
    else return hideCar();
    if (z > CAMZ + 40 || z < SEAZ) return hideCar();
    const B = M4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, yaw, rz, 'YXZ')), _s.set(1, 1, 1)); o.carBody.setMatrixAt(i, B); o.carCab.setMatrixAt(i, B); o.carLt.setMatrixAt(i, B.clone().multiply(Tr(0, 0.6, 2.2))); o.carTl.setMatrixAt(i, B.clone().multiply(Tr(0, 0.66, -2.2))); o.carBp.setMatrixAt(i * 2, B.clone().multiply(Tr(0, 0.32, 2.24))); o.carBp.setMatrixAt(i * 2 + 1, B.clone().multiply(Tr(0, 0.32, -2.24)));
    [[-0.84, -1.4], [0.84, -1.4], [-0.84, 1.35], [0.84, 1.35]].forEach(([wx, wz], k) => { const Wm = B.clone().multiply(Tr(wx, 0.34, wz)).multiply(Rz(Math.PI / 2)); o.carWh.setMatrixAt(i * 4 + k, Wm); o.carRim.setMatrixAt(i * 4 + k, Wm.clone().multiply(Tr(0, Math.sign(wx) * 0.02, 0))); }); });
  [o.carBody, o.carCab, o.carWh, o.carRim, o.carLt, o.carTl, o.carBp].forEach((m) => (m.instanceMatrix.needsUpdate = true));
  { const P0 = { x: 2.6, z: 58 - 5 * Math.min(t, 12) }, fl = clamp((lv - 1.5) / 0.8); let y = GY, z = P0.z, yaw = Math.PI; if (t < 55 && fl > 0) { y = GY + fl * (lv - 1.6); z -= Math.max(0, t - 26) * 0.7 * fl; yaw += 0.08 * Math.max(0, t - 26) * fl; if (lv > 12) y = lerp(y, GY, ss(40, 46, t)); } o.bus.position.set(P0.x, y, z); o.bus.rotation.set(0, yaw, 0); o.bus.visible = t < 55; }
  // boats: a rower on each, out once the street is a river (18-40); bobbing on the rain-pocked water
  r.BT.forEach((q, i) => { const on = t > q.t0 && lv > 0.6 && lv < 30 && t < 46; if (!on) { r.boatHull.setMatrixAt(i, _hid); r.boatTip.setMatrixAt(i, _hid); return; } const s = q.s0 + q.v * (t - q.t0) * 1.6, x = q.ax ? s : q.lane, z = q.ax ? q.lane : s, yaw = q.ax ? (q.v > 0 ? Math.PI / 2 : -Math.PI / 2) : (q.v > 0 ? 0 : Math.PI);
    const B = M4().compose(_v.set(x, wy + 0.08 * Math.sin(t * 2.3 + i), z), _q.setFromEuler(_e.set(0.04 * Math.sin(t * 1.7 + i), yaw, 0.05 * Math.sin(t * 2.1 + i), 'YXZ')), _s.set(1, 1, 1)); r.boatHull.setMatrixAt(i, B); r.boatTip.setMatrixAt(i, B); });
  r.boatHull.instanceMatrix.needsUpdate = true; r.boatTip.instanceMatrix.needsUpdate = true;
  // people: walking, umbrellas up; they run for cover at nightfall; sandbags; rowers in the boats; people on the roofs (33-44)
  const PG = g.PG, PMs = o.PMs; o.pp.forEach((q, i) => { let st = streetPose(q, t); const bi = i % r.BT.length, bq = r.BT[bi];
    if (!st && i < r.BT.length && t > bq.t0 && lv > 0.6 && lv < 30 && t < 46) { const s = bq.s0 + bq.v * (t - bq.t0) * 1.6, x = bq.ax ? s : bq.lane, z = bq.ax ? bq.lane : s; st = { x, y: wy - 0.35, z, yaw: bq.ax ? (bq.v > 0 ? Math.PI / 2 : -Math.PI / 2) : (bq.v > 0 ? 0 : Math.PI), walk: 0, p: 0, bend: 0.3 + 0.2 * Math.sin(t * 3 + i), kneel: 0.6, lie: 0 }; }
    if (!st && i >= r.BT.length && i < r.BT.length + 24 && t > 33 && t < 44.5) { const b = o.BUI.filter((bb) => bb.row === 1 && bb.dC < 160)[i % 20]; if (b && b.h > lv + 1) st = { x: b.x + Math.sin(i * 2.3) * b.sx * 0.3, y: GY + b.h, z: b.z + Math.cos(i * 1.7) * b.sz * 0.3, yaw: Math.atan2(CAMX - b.x, CAMZ - b.z), walk: 0, p: 0, ears: 0.0, lie: 0 }; }
    if (!st || (st.y < wy - 1.0 && st.y >= GY)) { for (const k in PG) for (let j = 0; j < PG[k][1]; j++) PMs[k].setMatrixAt(i * PG[k][1] + j, _hid); o.capI.setMatrixAt(i, _hid); o.bagI.setMatrixAt(i, _hid); r.umb.setMatrixAt(i, _hid); return; }
    poseP(PMs, PG, i, Object.assign({ s: q.s, w: q.w, sway: q.ph, acc: { cap: o.capI, bag: o.bagI, q } }, st));
    r.umb.setMatrixAt(i, q.umb && t < q.leave + 0.8 && t > 2 + (i % 7) * 0.4 ? M4c(st.x, st.y + 0.1, st.z, 0, q.s, q.s * ss(2 + (i % 7) * 0.4, 2.6 + (i % 7) * 0.4, t), q.s) : _hid); });
  for (const k in PMs) PMs[k].instanceMatrix.needsUpdate = true; o.capI.instanceMatrix.needsUpdate = true; o.bagI.instanceMatrix.needsUpdate = true; r.umb.instanceMatrix.needsUpdate = true;
  // flotsam riding the water, drifting with the current toward the bay, turning slowly
  r.FLT.forEach((q, i) => { const on = t > q.t0 && lv > 0.15 && t < 55; if (!on) { r.flot.setMatrixAt(i, _hid); return; } const a = t - q.t0, z = q.z - a * q.v * (0.6 + 0.4 * rk), x = q.x + Math.sin(a * 0.4 + q.ph) * 1.2;
    r.flot.setMatrixAt(i, M4c(x, wy + q.s[1] * 0.2 + 0.05 * Math.sin(t * 2 + q.ph), z, q.ph + a * 0.2, q.s[0], q.s[1], q.s[2], 0.06 * Math.sin(t * 1.7 + q.ph), 0.06 * Math.sin(t * 1.3 + q.ph))); }); r.flot.instanceMatrix.needsUpdate = true;
  // the forest and the grass: the asphalt and the pavements go to mud, then to grass
  if (GRND.ground) { const mudK = ss(57, 62, t), gr = ss(61, 68, t); GRND.ground.material.color.copy(C3('#ffffff', '#8a7a5a', mudK).lerp(lin('#5a8a3a'), gr)); GRND.conc.color.copy(C3('#ffffff', '#9a8a68', mudK).lerp(lin('#6a9a46'), gr * 0.9)); }
  // the forest and the grass
  r.FT.forEach((tr, i) => { const k = ss(tr.t0, tr.t0 + 4, t) * tr.sp; r.ftr.setMatrixAt(i, k < 0.02 ? _hid : M4c(tr.x, GY, tr.z, 0, 0.4 + k, tr.h * k, 0.4 + k)); }); r.ftr.instanceMatrix.needsUpdate = true;
  r.FC.forEach((q, i) => { const tr = r.FT[q.ti], k = ss(tr.t0, tr.t0 + 4, t) * tr.sp, H = tr.h * k, S = q.s * tr.h * k * 0.9; r.fcr.setMatrixAt(i, k < 0.02 ? _hid : M4c(tr.x + q.ox * tr.h * k, GY + H * q.oy, tr.z + q.oz * tr.h * k, q.ry + 0.05 * Math.sin(t + i), S, S, S, q.rx, 0)); }); r.fcr.instanceMatrix.needsUpdate = true;
  r.TF.forEach((q, i) => { const k = ss(q.t0, q.t0 + 2.5, t); r.tufts.setMatrixAt(i, k < 0.02 ? _hid : M4c(q.x, GY, q.z, q.ry, q.s * k, q.s * k, q.s * k)); }); r.tufts.instanceMatrix.needsUpdate = true;
  // the rain streaks round the camera
  r.rain.visible = rk > 0.02 && !under; if (r.rain.visible) { const P = r.rP, sp = 26; r.rL.forEach(([x0, y0, z0, v], i) => { const yy = mod(y0 - t * sp * v / 60, 1) * 60 - 30, x = c.x + x0 + yy * 0.42, y = c.y + yy, z = c.z + z0 + yy * 0.08; P.set([x, y, z, x - 0.7, y + 1.65, z - 0.13], i * 6); });
    r.rG.attributes.position.needsUpdate = true; r.rain.material.opacity = 0.45 * rk; r.rain.material.color.copy(C3('#c8d2da', '#8a96a2', night)); }
  // silt under the water
  r.silt.visible = under > 0; if (under) { const P = r.sP; r.sL.forEach(([x0, y0, z0, ph], i) => { P[i * 3] = c.x + x0 + Math.sin(t * 0.3 + ph) * 0.6; P[i * 3 + 1] = c.y + y0 + Math.sin(t * 0.2 + ph * 2) * 0.5; P[i * 3 + 2] = c.z + z0; }); r.sG.attributes.position.needsUpdate = true; }
  // sprites: splashes on the street and the water, mist of the downpour, drips from the eaves after the rain
  let si = 0, fi = 0, mi = 0, bi = 0; const SP = g.sprays, FL = g.flames, SMk = g.smokes, BLs = g.billows;
  const put = (pool, idx, x, y, z, sc, op, col, rot = 0) => { if (idx >= pool.length || op <= 0.004) return idx; const s = pool[idx]; s.visible = true; s.position.set(x, y, z); s.scale.set(sc, sc, 1); s.material.opacity = Math.min(1, op); s.material.color.set(col); s.material.rotation = rot; return idx + 1; };
  if (rk > 0.05 && !under) { const R = RNG('splash'); for (let k = 0; k < 260; k++) { const a = mod(t * R.r(2.5, 4) + R.f(), 1), x = CAMX + R.r(-30, 20), z = CAMZ + R.r(-80, -4), y = Math.max(groundY(x, z), wy); si = put(SP, si, x, y + 0.1 + a * 0.3, z, 0.3 + a * 0.6, 0.45 * rk * (1 - a), '#e8eef2', R.r(0, 6)); }
    const R2 = RNG('mist'); for (let k = 0; k < 70; k++) { const a = mod(t * 0.08 + R2.f(), 1), x = CAMX + R2.r(-120, 60), z = CAMZ + R2.r(-400, -30); bi = put(BLs, bi, x, wy + R2.r(2, 30), z - a * 20, R2.r(20, 50), 0.22 * rk * Math.sin(a * Math.PI), night > 0.5 ? '#3a4048' : '#9aa2a8', R2.r(0, 6)); } }
  // street lamps: a glow in the rain and a long wobbling reflection on the water
  LAMPS.forEach(([x, y, z, on], i) => { if (Math.hypot(x - c.x, z - c.z) > 260) return; fi = put(FL, fi, x, y, z, 5.5, 0.55 * on, '#ffc890'); fi = put(FL, fi, x, y, z, 1.4, 0.9 * on, '#fff0d8');
    if (lv > 0.05) for (let k = 1; k <= 6; k++) fi = put(FL, fi, x + Math.sin(t * 3 + k + i) * 0.25, wy - k * 0.9 * (y - wy) / 6, z, 1.6 + k * 0.25, 0.3 * on * (1 - k / 7), '#ffb070'); });
  if (t > 55 && t < 66) { const R = RNG('drips'); for (let k = 0; k < 120; k++) { const b = o.BUI[k % o.BUI.length]; if (b.row !== 1) continue; const a = mod(t * R.r(0.8, 1.6) + R.f(), 1); si = put(SP, si, b.x - Math.sign(b.x) * b.sx / 2 * 0.98, GY + b.h * (1 - a) - 0.2, b.z + R.r(-b.sz / 2, b.sz / 2), 0.15, 0.6 * (1 - ss(62, 66, t)), '#dfe8ee', 0); } }
  for (; si < SP.length; si++) SP[si].visible = false; for (; fi < FL.length; fi++) FL[fi].visible = false; for (; mi < SMk.length; mi++) SMk[mi].visible = false; for (; bi < BLs.length; bi++) BLs[bi].visible = false;
  g.debris.visible = false;
  g.r.render(g.scene, g.cam);
  ctx.save(); screen(); ctx.drawImage(g.cv, 0, 0, W, H); ctx.restore();
}

// ---- 2D: motion blur, bloom, drops on the lens, the underwater veil and light shafts, lightning, HUD, title, captions, card
function motionBlur(t) {
  const a = camPoseC(t), b = camPoseC(t - 1 / 48), f = (H / 2) / Math.tan(32 * DEG);
  let dx = -Math.atan2(Math.sin(a.yaw - b.yaw), Math.cos(a.yaw - b.yaw)) * f, dy = (a.pitch - b.pitch) * f; const L = Math.hypot(dx, dy); if (L < 3) return;
  const k = Math.min(1, 90 / L); dx *= k; dy *= k; const g = g3(); ctx.save(); screen();
  for (let i = 1; i <= 6; i++) { ctx.globalAlpha = 0.16 * (1 - i / 8); ctx.drawImage(g.cv, -dx * i / 6, -dy * i / 6, W, H); } ctx.restore();
}
let BLC = null;
function bloom(amt) { if (amt <= 0) return; if (!BLC) { BLC = document.createElement('canvas'); BLC.width = W / 4; BLC.height = H / 4; }
  const b = BLC.getContext('2d'); b.filter = 'brightness(0.62) contrast(2.4) blur(9px)'; b.clearRect(0, 0, BLC.width, BLC.height); b.drawImage(ctx.canvas, 0, 0, BLC.width, BLC.height); b.filter = 'none';
  ctx.save(); screen(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amt; ctx.drawImage(BLC, 0, 0, W, H); ctx.restore(); }
// raindrops on the lens: beads that sit, grow and run down, leaving a trail; a refraction-ish lighter rim
function lensDrops(t) { const k = rainK(t) * (camPoseC(t).y > GY + level(t) ? 1 : 0); if (k < 0.05) return; const R = RNG('lens'); ctx.save(); screen();
  for (let i = 0; i < 70; i++) { const life = R.r(1.5, 4), ph = mod(t / life + R.f(), 1), x = R.r(0, W), y0 = R.r(0, H * 0.9), run = ph > 0.6 ? (ph - 0.6) * R.r(300, 900) : 0, y = y0 + run, r = R.r(4, 14) * (0.6 + 0.4 * ph);
    if (run > 0) { ctx.strokeStyle = `rgba(220,230,236,${0.12 * k})`; ctx.lineWidth = r * 0.5; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y); ctx.stroke(); }
    const gg = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gg.addColorStop(0, `rgba(255,255,255,${0.35 * k})`); gg.addColorStop(0.6, `rgba(200,210,220,${0.12 * k})`); gg.addColorStop(1, `rgba(40,50,60,${0.25 * k})`); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
  ctx.restore(); }
// under the water: a green-teal veil, shafts of light from the surface, caustic ripples
function underVeil(t) { const c = camPoseC(t), u = c.y < GY + level(t) ? 1 : 0; if (!u) return; const R = RNG('shaft'); ctx.save(); screen();
  const g2 = ctx.createLinearGradient(0, 0, 0, H); g2.addColorStop(0, 'rgba(70,120,110,0.35)'); g2.addColorStop(1, 'rgba(8,24,26,0.6)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; for (let i = 0; i < 9; i++) { const x = R.r(-200, W + 200) + Math.sin(t * 0.4 + i) * 60, w = R.r(60, 180), gg = ctx.createLinearGradient(x, 0, x + 260, H); gg.addColorStop(0, `rgba(150,200,180,${R.r(0.08, 0.18)})`); gg.addColorStop(1, 'rgba(150,200,180,0)'); ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + w, 0); ctx.lineTo(x + w + 380, H); ctx.lineTo(x + 380, H); ctx.fill(); }
  ctx.restore(); }
function lightning(t) { const f = [8.2, 15.3, 31.4, 38.6, 44.1].reduce((a, ft) => a + Math.max(0, 1 - Math.abs(t - ft) / 0.1), 0) * (t < 47 ? 1 : 0) + (t > T_THUNDER && t < T_THUNDER + 0.2 ? 1 : 0); if (f <= 0) return; pvTint('#e8f0ff', 0.35 * Math.min(1, f)); }
const fmtN = (v) => `${Math.round(v)}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function hud() { const t = TT; if (t < 4.4 || t >= 70) return; const a = ev(4.4, 0.5) * (1 - ev(69.6, 0.4));
  if (t < T_STOP) { const h = hoursAt(t); const v = h < 48 ? `Hora ${Math.floor(h)}` : h < 24 * 60 ? `Día ${Math.floor(h / 24)}` : h < 24 * 730 ? `Mes ${Math.floor(h / 730)}` : `Año ${fmtN(Math.floor(h / 8760))}`; const lv = level(t);
    pvHud('Lloviendo', v, lv < 0.05 ? 'sin parar' : `agua: ${lv < 1 ? Math.round(lv * 100) + ' cm' : Math.round(lv) + ' m'} sobre la calle`, a); }
  else pvHud('Dejó de llover', `Año ${fmtN(Math.floor(yearsAfter(t)))}`, level(t) > 0.05 ? `agua: ${Math.max(1, Math.round(level(t)))} m sobre la calle` : 'la ciudad seca', a); }
function bigTitle(lines, t0, t1) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.5), 1 - ev(t1 - 0.5, 0.5));
  const f = () => { ctx.save(); ctx.font = `400 100px ${PV.serif}`; const wmax = Math.max(...lines.map((l) => ctx.measureText(l).width)); ctx.restore();
    const size = Math.min(165, Math.floor(100 * 770 / wmax)), lh = size * 1.12, y0 = 450;
    pvFeather(CX, y0 + (lines.length - 1) * lh / 2 - size * 0.32, 620, 150 + lines.length * 80, a);
    lines.forEach((l, i) => pvText(l, CX, y0 + i * lh, size, { align: 'center', alpha: a })); };
  if (DEFER) DEFER.push(f); else f();
}
function capFit(str, t0, t1, dy = 0) {
  if (TT < t0 || TT >= t1) return;
  const a = Math.min(ev(t0, 0.35), 1 - ev(t1 - 0.3, 0.3));
  const f = () => { ctx.save(); ctx.font = `italic 400 52px ${PV.serif}`; const w = ctx.measureText(str).width; ctx.restore(); const size = Math.min(52, Math.floor(52 * 760 / w));
    pvFeather(CX, 1374 + dy, 570, 120, a); pvText(str, CX, 1390 + dy, size, { italic: true, align: 'center', alpha: a }); };
  if (DEFER) DEFER.push(f); else f();
}
function endCard() {
  const a = ev(70.6, 0.6), b = ev(71.1, 0.7), c2 = ev(71.6, 0.7), d = ev(72.6, 0.5), d2 = ev(73.6, 0.5), e = ev(74.0, 0.5);
  const f = () => {
    pvGlow(CX, 760, 520 + 90 * Math.max(0, TT - 70.6), 'rgba(140,180,200,0.25)', a * (0.75 + 0.25 * Math.sin(TT * 1.3)));
    pvFeather(CX, 760, 540, 300, 0.8 * a);
    pvText('La lluvia más intensa registrada:', CX, 630, 48, { italic: true, align: 'center', alpha: a });
    pvText('1.825 mm en un día', CX, 770, 82, { align: 'center', alpha: b });
    pvText('(isla de la Reunión, 1966)', CX, 880, 44, { align: 'center', alpha: c2 });
    ctx.save(); screen(); ctx.globalAlpha = 0.5 * c2; ctx.fillStyle = '#a8c8d8'; ctx.fillRect(CX - 60, 925, 120, 3); ctx.restore();
    pvFeather(CX, 1090, 500, 110, 0.7 * d);
    pvText('y tranquilo, esto nunca pasará', CX, 1080, 48, { italic: true, align: 'center', alpha: d });
    pvText('... o si?', CX, 1150, 58, { italic: true, align: 'center', alpha: d2 });
    pvText('ALTERBASE.ESP', CX, 1450, 30, { font: PV.sans, weight: 700, spacing: 8, align: 'center', alpha: e * 0.9 });
  };
  if (DEFER) DEFER.push(f); else f();
}
function sceneRain() {
  const t = TT;
  if (t < 70.0) { updateRain(); motionBlur(t); bloom(0.4 + 0.15 * nightK(t) + 0.15 * ss(55.5, 57, t) * (1 - ss(69, 70, t))); underVeil(t); lensDrops(t); lightning(t); }
  if (t >= 69.2 && t < 70) pvTint('#050607', ss(69.2, 69.95, t));
  if (t >= 70.0) fillAll('#050607');
  if (t >= 70.5) endCard();
  hud();
  bigTitle(['¿Qué pasaría si', 'lloviera durante', '1,000 años?'], 0.3, 4.4);
  capFit('Empieza como cualquier tormenta.', 4.8, 9.8);
  capFit('Al anochecer, las alcantarillas no dan más.', 10.3, 16.8);
  capFit('La ciudad se adapta.', 17.3, 24.8);
  capFit('Siempre nos adaptamos.', 19.6, 24.8, 74);
  capFit('Al tercer mes, la avenida es un río.', 25.3, 32.8);
  capFit('La vida sube a los pisos altos.', 33.3, 39.8);
  capFit('Pero el agua no deja de subir.', 40.3, 46.8);
  capFit('Durante mil años, nada cambia.', 47.5, 54.0);
  capFit('Hasta que un día, la lluvia para.', 55.3, 57.9);
  capFit('El agua tarda siglos en irse.', 58.3, 65.8);
  capFit('Lo que queda es del bosque.', 66.2, 69.6);
}

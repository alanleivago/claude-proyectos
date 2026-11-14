// sets/radio.js — the station RADIO ROOM: transmitter rack (dials, VU meters, ON AIR lamp), desk mic, and a reel-to-reel
// tape recorder plugged into the transmitter (visible cable), reels spinning: the "emergency broadcast" is a loop.
// Shots: 63_radio_room (slow push-in; labels TAPE RECORDER / PLUGGED IN / LOOP on their words; VU needles follow the radio
// voice), 65_vickers_tag (close-up of the recorder; the embossed name tape VICKERS is revealed on "Vickers").
// Contract: SETS.md. World: room x [-2, 2], z [-2, 2], ceiling 2.6; rack against the back wall at x = -0.75, desk in front
// of the back wall (top y = 0.76, z in [-1.75, -1.05]); recorder on the desk at x = 0.55.
import { reText as bitText, reWidth as textWidth } from '../refont.js';

const STEP_PH = [0.12, 0.60];   // walk clip foot contacts (s in its 1.0 s cycle)
function walkSteps(at, speed, t0, t1) { const out = [], x0 = (t0 - at) * speed, x1 = (t1 - at) * speed; for (let n = Math.floor(x0) - 1; n <= Math.ceil(x1); n++) for (const c of STEP_PH) { const xx = n + c; if (xx >= x0 && xx < x1) out.push(+(at + xx / speed).toFixed(3)); } return out; }
const W63 = { go: -0.35, stop: 0.95, speed: 0.9 };   // 63a: Ava walks in from the door (s from the shot start)

function RDtimes(ctx) {
  const { T, at } = ctx;
  return {
    t63: T['63_radio_room'], t64: T['64_city'], t65: T['65_vickers_tag'],
    tape: at('l6', 'tape'), plugged: at('l6', 'plugged'), transmitter: at('l6', 'transmitter'), loop: at('l6', 'loop'),
    plug0: at('l6', 'plugged') - 0.1,   // 63: cut from the high corner (door) to the push-in on the recorder
    help: at('l6r', 0), name: at('l9', 'name'), recorder: at('l9', 'recorder'), vickers: at('l10', 'vickers'),
    e65: (() => { const i = ctx.CUTS.findIndex((c) => c[0] === '65_vickers_tag'); return ctx.CUTS[i + 1] ? ctx.CUTS[i + 1][1] : T['65_vickers_tag'] + 5.7; })(),
  };
}

export function sfx(ctx) {
  const r = RDtimes(ctx), out = [];
  // 63: room tone of the transmitter, reels turning (loop), tape hiss; labels on their words
  // 63a: the door has just been opened with the clover key (it swings to its stop), Ava steps in
  out.push([r.t63, 'door_open'], [r.t63 + 0.05, 'key_jingle']);
  for (const t of walkSteps(r.t63 + W63.go, W63.speed, r.t63, r.t63 + W63.stop)) out.push([t, 'step_walk']);
  out.push([r.t63, 'transmitter_hum'], [r.t63, 'reel_spin'], [r.t63 + 0.05, 'tape_hiss'],
    [r.tape, 'label_pop'], [r.plugged, 'label_pop'], [r.loop, 'label_pop'], [r.loop + 0.4, 'tape_click']);
  // 65: reels still turning, flashlight click, the name tape is revealed on "Vickers"
  out.push([r.t65, 'reel_spin'], [r.name - 0.3, 'flashlight_click'], [r.vickers, 'label_pop_danger'], [r.vickers + 0.02, 'sting_low']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L, TL } = ctx;
  const { THREE, LW, LH } = L;
  const r = RDtimes(ctx);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (a, b, c) => `rgb(${Math.max(0, Math.min(255, a | 0))},${Math.max(0, Math.min(255, b | 0))},${Math.max(0, Math.min(255, c | 0))})`;
  const hexRGB = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mixHex = (a, b, k) => '#' + hexRGB(a).map((v, i) => Math.round(v + (hexRGB(b)[i] - v) * k).toString(16).padStart(2, '0')).join('');
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const DS = THREE.DoubleSide;
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 40);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const voiceAmp = (t) => { let s = 0; for (let k = 0; k < 3; k++) { const c = TL.mouth[Math.floor(t * 15 + 1e-6) - k]; s += c === 'A' ? 1 : c === 'O' ? 0.8 : 0.06; } return s / 3; };
  const vignette = (o, k = 0.45) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.3, LW / 2, LH * 0.45, LH * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  function Dline(c, x0, y0, x1, y1, col) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
    c.fillStyle = col;
    for (let n = 0; n < 3000; n++) { c.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  }
  function Dlabel(o, text, cx, cy, col, tgt, k = 1, sc = 2) {
    if (k <= 0) return;
    const c = o.tctx, lines = text.split('\n'), lh = sc === 2 ? 17 : 13;
    const tw = Math.max(...lines.map((s) => textWidth(s, sc)));
    const w = Math.round(tw + 12), h = lines.length * lh + 9, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const bc = mixHex('#000000', col, k), fc = mixHex('#000000', '#f4f4f4', k);
    if (tgt) { Dline(c, cx, tgt[1] > cy ? y + h - 1 : y, tgt[0], tgt[1], bc); c.fillStyle = bc; c.fillRect(Math.round(tgt[0]) - 1, Math.round(tgt[1]) - 1, 3, 3); }
    c.fillStyle = '#0d0d12'; c.fillRect(x, y, w, h);
    c.fillStyle = bc; c.fillRect(x, y, w, 1); c.fillRect(x, y + h - 1, w, 1); c.fillRect(x, y, 1, h); c.fillRect(x + w - 1, y, 1, h);
    lines.forEach((s, i) => bitText(c, s, cx, y + 5 + Math.round(lh / 2) + i * lh, sc, fc, { outline: null }));
  }

  // ---------- textures ----------
  const tWall = L.cvs(64, 64, (c, w, h) => {   // painted plaster: pale institutional green over a dark wainscot, acoustic tiles above
    const rr = L.rng(1301);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 10 - 5, low = y > 40; px(c, x, y, low ? rgb(70 + n, 82 + n, 74 + n) : rgb(168 + n, 178 + n, 150 + n)); }
    px(c, 0, 40, '#2a3a30', w, 2); px(c, 0, 0, '#9aa08a', w, 1);
    for (let k = 0; k < 5; k++) px(c, rr() * 60 | 0, rr() * 36 | 0, 'rgba(90,80,60,0.4)', 2, 3);
  });
  const tFloor = L.cvs(64, 64, (c, w, h) => { const rr = L.rng(1302); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const dark = ((x >> 4) + (y >> 4)) & 1, n = rr() * 10 - 5, e = x % 16 === 0 || y % 16 === 0 ? 0.75 : 1; const b = dark ? [70, 62, 56] : [130, 120, 104]; px(c, x, y, rgb((b[0] + n) * e, (b[1] + n) * e, (b[2] + n) * e)); } });
  const tWood = (seed, a, b2) => L.cvs(32, 64, (c, w, h) => {
    const rr = L.rng(seed), A = hexRGB(a), Bc = hexRGB(b2);
    for (let x = 0; x < w; x++) { const g = rr(); for (let y = 0; y < h; y++) { const k = Math.min(1, Math.max(0, g * 0.5 + 0.35 * Math.sin(y * 0.25 + x * 0.9 + g * 6) + rr() * 0.2)); px(c, x, y, rgb(A[0] + (Bc[0] - A[0]) * k, A[1] + (Bc[1] - A[1]) * k, A[2] + (Bc[2] - A[2]) * k)); } }
  });
  const tRackPanel = (seed, kind) => L.cvs(64, 32, (c, w, h) => {   // 19" rack panels: grey hammertone, screws, knobs, switches, meters
    const rr = L.rng(seed);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 10 - 5; px(c, x, y, rgb(122 + n, 128 + n, 130 + n)); }
    for (const x of [2, 60]) for (const y of [3, 27]) px(c, x, y, '#4a4e52', 2, 2);
    px(c, 0, 0, '#d0d4d8', w, 1); px(c, 0, h - 1, '#3a3e42', w, 1);
    if (kind === 'knobs') { for (let k = 0; k < 4; k++) { c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(12 + k * 13, 14, 4.5, 0, 7); c.fill(); px(c, 12 + k * 13, 10, '#e8e8e0', 1, 4); px(c, 8 + k * 13, 22, '#e8e8e0', 8, 1); } for (let k = 0; k < 5; k++) px(c, 8 + k * 10, 26, '#2a2a2a', 2, 3); }
    if (kind === 'switch') { for (let k = 0; k < 6; k++) { px(c, 8 + k * 9, 10, '#d0d0c8', 3, 8); px(c, 9 + k * 9, 8, '#2a2a2a', 1, 4); } px(c, 6, 22, '#e8e8e0', 50, 1); }
    if (kind === 'freq') { px(c, 6, 6, '#0a140a', 52, 14); c.fillStyle = '#ff5a2a'; c.font = 'bold 10px monospace'; c.textBaseline = 'middle'; c.fillText('154.950', 10, 14); px(c, 6, 24, '#e8e8e0', 20, 1); c.fillStyle = '#c02020'; c.beginPath(); c.arc(50, 25, 3, 0, 7); c.fill(); }
    if (kind === 'vent') { for (let y = 6; y < 28; y += 3) px(c, 6, y, '#2a2e32', 52, 1); }
  });
  const tMeter = L.cvs(32, 24, (c) => {   // VU meter face (needle drawn as a separate mesh)
    c.fillStyle = '#f0e2b0'; c.fillRect(0, 0, 32, 24); c.strokeStyle = '#1a1a1a'; c.lineWidth = 1; c.beginPath(); c.arc(16, 26, 18, Math.PI * 1.2, Math.PI * 1.8); c.stroke();
    c.strokeStyle = '#c82020'; c.beginPath(); c.arc(16, 26, 18, Math.PI * 1.65, Math.PI * 1.8); c.stroke();
    for (let k = 0; k <= 6; k++) { const a = Math.PI * (1.2 + k * 0.1); px(c, Math.round(16 + Math.cos(a) * 16), Math.round(26 + Math.sin(a) * 16), '#1a1a1a', 1, 2); }
    c.fillStyle = '#1a1a1a'; c.font = 'bold 5px Tahoma'; c.textAlign = 'center'; c.fillText('VU', 16, 20); c.fillStyle = '#5a4a2a'; c.fillRect(0, 23, 32, 1);
  });
  const tOnAir = (on) => L.cvs(48, 16, (c) => { c.fillStyle = on ? '#ff2a1a' : '#4a1410'; c.fillRect(0, 0, 48, 16); c.fillStyle = on ? '#fff0e0' : '#8a4a40'; c.font = 'bold 9px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ON AIR', 24, 8.5); c.fillStyle = on ? '#ffd0c0' : '#6a2a20'; c.fillRect(0, 0, 48, 1); c.fillRect(0, 15, 48, 1); });
  const tReel = L.cvs(32, 32, (c) => {   // metal NAB reel with tape pack and 3 cut-outs (alpha)
    c.fillStyle = '#3a2418'; c.beginPath(); c.arc(16, 16, 11, 0, 7); c.fill();   // brown tape pack
    c.fillStyle = '#b8bcc0'; c.beginPath(); c.arc(16, 16, 15.5, 0, 7); c.arc(16, 16, 11.5, 0, 7, true); c.fill();
    for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; c.fillStyle = '#c8ccd0'; c.beginPath(); c.moveTo(16, 16); c.arc(16, 16, 10.5, a - 0.32, a + 0.32); c.fill(); }
    c.fillStyle = '#8a8e92'; c.beginPath(); c.arc(16, 16, 3.5, 0, 7); c.fill(); c.fillStyle = '#1a1a1a'; c.fillRect(15, 13, 2, 6);
  });
  const tDeck = L.cvs(64, 64, (c, w, h) => {   // recorder front: brushed alu top half, black transport, VU, buttons, brand
    const rr = L.rng(1303);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 8 - 4 + (x % 2) * 3; px(c, x, y, y < 46 ? rgb(176 + n, 178 + n, 176 + n) : rgb(36 + n, 36 + n, 38 + n)); }
    px(c, 22, 30, '#1a1a1a', 20, 10); px(c, 26, 33, '#c8c8c8', 3, 3); px(c, 35, 33, '#c8c8c8', 3, 3); px(c, 30, 36, '#5a5a5a', 4, 3);   // head block
    for (let k = 0; k < 6; k++) { px(c, 6 + k * 9, 50, '#d8d8d0', 7, 6); px(c, 7 + k * 9, 51, k === 3 ? '#c82020' : '#8a8a84', 5, 4); }
    px(c, 4, 58, '#f0e2b0', 10, 5); px(c, 50, 58, '#f0e2b0', 10, 5);
    c.fillStyle = '#e8e8e0'; c.font = 'bold 5px Tahoma'; c.textAlign = 'left'; c.fillText('AKARI  TR-7', 20, 61);
  });
  const tName = L.cvs(64, 16, (c) => {   // embossed Dymo label tape: red tape, raised white letters
    c.fillStyle = '#b81414'; c.fillRect(0, 2, 64, 12); c.fillStyle = '#d82a2a'; c.fillRect(0, 2, 64, 1); c.fillStyle = '#7a0a0a'; c.fillRect(0, 13, 64, 1);
    c.fillStyle = '#5a0606'; c.font = 'bold 10px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VICKERS', 33, 9);
    c.fillStyle = '#f4ece8'; c.fillText('VICKERS', 32, 8);
  });
  const tGlow = L.cvs(16, 16, (c) => { const g = c.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,250,220,1)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, 0, 16, 16); });
  const tMap = L.cvs(64, 48, (c) => { c.fillStyle = '#d8cca8'; c.fillRect(0, 0, 64, 48); const rr = L.rng(1304); c.strokeStyle = '#8a7a5a'; for (let k = 0; k < 12; k++) { c.beginPath(); c.moveTo(rr() * 64, 0); c.lineTo(rr() * 64, 48); c.stroke(); c.beginPath(); c.moveTo(0, rr() * 48); c.lineTo(64, rr() * 48); c.stroke(); }
    c.fillStyle = '#5a8ab0'; c.fillRect(40, 0, 6, 48); c.fillStyle = '#c82020'; for (let k = 0; k < 7; k++) c.fillRect(rr() * 60, rr() * 44, 3, 3); c.fillStyle = '#1a1a1a'; c.font = 'bold 6px Tahoma'; c.fillText('CITY GRID', 4, 8); });

  let keyGlint = null;
  // ---------- the room ----------
  const BG = 0x06080c;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 4, 10);
  scene.add(new THREE.HemisphereLight(0x8a98c0, 0x3a3028, 1.15));
  const lamp = new THREE.PointLight(0xffb868, 4.5, 3.5, 1.2); lamp.position.set(1.2, 1.35, -1.25); scene.add(lamp);         // desk lamp (warm)
  const onAirL = new THREE.PointLight(0xff3020, 1.6, 2.2, 1.4); onAirL.position.set(-0.75, 2.2, -1.6); scene.add(onAirL);  // red ON AIR spill
  const doorL = new THREE.PointLight(0x9ab0ff, 2.2, 6, 1.1); doorL.position.set(0.2, 1.9, 1.8); scene.add(doorL);          // corridor light from the door behind camera
  const torch = new THREE.SpotLight(0xfff0c8, 0, 6, 0.22, 0.55, 1.1); scene.add(torch, torch.target);
  const hallL = new THREE.PointLight(0x9ab0ff, 5, 5, 1.1); hallL.position.set(-2.6, 1.9, 1.0); scene.add(hallL);                // corridor light through the open door
  const RX = 2, RZ = 2, HH = 2.6;
  const mW = lam(L.rep(tWall, 3, 1));
  L.plane(2 * RX, HH, mW, 0, HH / 2, -RZ, scene);
  const DZ0 = 0.55, DZ1 = 1.45, DHt = 2.1;
  { const lw = (z0, z1, y0, y1) => L.plane(z1 - z0, y1 - y0, lam(L.rep(tWall, (z1 - z0) / (2 * RZ) * 3, (y1 - y0) / HH)), -RX, (y0 + y1) / 2, (z0 + z1) / 2, scene, Math.PI / 2);
    lw(-RZ, DZ0, 0, HH); lw(DZ1, RZ, 0, HH); lw(DZ0, DZ1, DHt, HH); }
  L.plane(2 * RZ, HH, mW, RX, HH / 2, 0, scene, -Math.PI / 2); L.plane(2 * RX, HH, mW, 0, HH / 2, RZ, scene, Math.PI);
  L.plane(2 * RX, 2 * RZ, lam(L.rep(tFloor, 3, 3)), 0, 0, 0, scene, 0, -Math.PI / 2);
  L.plane(2 * RX, 2 * RZ, lam(L.rep(L.cvs(16, 16, (c) => { c.fillStyle = '#c8c4b4'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#8a8676'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16); for (let k = 0; k < 12; k++) c.fillRect((k * 5) % 15 + 1, (k * 7) % 15 + 1, 1, 1); }), 8, 8)), 0, HH, 0, scene, 0, Math.PI / 2);
  // wall map + clock + window with blinds (night) on the right wall
  L.plane(0.9, 0.68, lam(tMap), 1.1, 1.6, -RZ + 0.01, scene);
  L.plane(0.28, 0.28, lam(L.cvs(16, 16, (c) => { c.fillStyle = '#f0ece0'; c.beginPath(); c.arc(8, 8, 7.5, 0, 7); c.fill(); c.strokeStyle = '#1a1a1a'; c.stroke(); c.fillStyle = '#1a1a1a'; c.fillRect(8, 3, 1, 5); c.fillRect(8, 8, 3, 1); }), 0xffffff, { alphaTest: 0.5 }), 0.15, 2.15, -RZ + 0.01, scene);
  L.plane(0.9, 0.9, L.basic(L.cvs(32, 32, (c) => { c.fillStyle = '#1a2a50'; c.fillRect(0, 0, 32, 32); for (let y = 0; y < 32; y += 3) { c.fillStyle = 'rgba(8,10,20,0.9)'; c.fillRect(0, y, 32, 2); } })), RX - 0.01, 1.55, -0.6, scene, -Math.PI / 2);

  // ---- the door the clover key opened: corridor beyond, frame, leaf swung into the room, brass clover key left in the lock
  L.plane(1.6, 1.4, lam(L.rep(tFloor, 1, 1), 0x9aa8c8), -RX - 0.7, 0.001, 1.0, scene, 0, -Math.PI / 2);
  L.plane(1.4, HH, lam(L.rep(tWall, 1, 1), 0x9aa8c8), -RX - 1.3, HH / 2, 1.0, scene, Math.PI / 2);
  { const mF = lam(tWood(1320, '#5a3a22', '#2e1c10')); B(0.12, DHt + 0.06, 0.07, mF, -RX, (DHt + 0.06) / 2, DZ0 - 0.035, scene); B(0.12, DHt + 0.06, 0.07, mF, -RX, (DHt + 0.06) / 2, DZ1 + 0.035, scene); B(0.12, 0.07, DZ1 - DZ0 + 0.14, mF, -RX, DHt + 0.035, (DZ0 + DZ1) / 2, scene); }
  const leafH = new THREE.Group(); leafH.position.set(-RX + 0.03, 0, DZ1); scene.add(leafH);
  const tLeaf = L.cvs(32, 64, (c, w, h) => { const rr = L.rng(1321); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = rr() * 10 - 5; px(c, x, y, rgb(122 + n, 86 + n, 54 + n)); }
    for (const [x0, y0, ww, hh] of [[4, 4, 24, 24], [4, 34, 24, 26]]) { px(c, x0, y0, '#5a3a20', ww, 1); px(c, x0, y0, '#5a3a20', 1, hh); px(c, x0, y0 + hh - 1, '#c89a6a', ww, 1); px(c, x0 + ww - 1, y0, '#c89a6a', 1, hh); }
    px(c, 7, 13, '#1a2a6a', 18, 7); px(c, 8, 15, '#e8e8e0', 16, 1); px(c, 8, 17, '#e8e8e0', 11, 1); });   // RADIO ROOM plate
  { const W = DZ1 - DZ0; B(0.045, DHt - 0.02, W, [lam(tLeaf), lam(tLeaf), lam(null, 0x6a4628), lam(null, 0x6a4628), lam(null, 0x6a4628), lam(null, 0x6a4628)], 0, DHt / 2, -W / 2, leafH);
    // lock plate with a clover engraving + the key (bow = three brass lobes, shaft into the lock)
    const lockG = new THREE.Group(); lockG.position.set(-0.03, 1.0, -W + 0.1); leafH.add(lockG);
    const tClover = L.cvs(16, 24, (c) => { c.fillStyle = '#b8902a'; c.fillRect(0, 0, 16, 24); c.fillStyle = '#e8c860'; c.fillRect(0, 0, 16, 1); c.fillStyle = '#5a4210'; for (const [x0, y0] of [[8, 5], [5, 8], [11, 8]]) { c.beginPath(); c.arc(x0, y0, 2.6, 0, 7); c.fill(); } c.fillRect(7, 9, 2, 5); c.fillStyle = '#1a1206'; c.fillRect(7, 16, 2, 5); });
    L.plane(0.07, 0.11, lam(tClover), -0.001, 0, 0, lockG, -Math.PI / 2);
    const mBr = L.lam(null, 0xe0b040), key = new THREE.Group(); key.position.set(0.0, -0.025, 0); key.scale.setScalar(1.7); lockG.add(key);
    cyl(0.006, 0.006, 0.07, 6, mBr, -0.035, 0, 0, key).rotation.z = Math.PI / 2;
    for (const [dy, dz] of [[0.03, 0], [0.012, 0.022], [0.012, -0.022]]) { const lb = cyl(0.016, 0.016, 0.008, 10, mBr, -0.075, dy, dz, key); lb.rotation.z = Math.PI / 2; }
    keyGlint = L.plane(0.12, 0.12, L.basic(L.cvs(16, 16, (c) => { c.fillStyle = 'rgba(255,240,180,0.95)'; c.fillRect(7, 0, 2, 16); c.fillRect(0, 7, 16, 2); c.fillRect(6, 6, 4, 4); }), 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), -0.09, 0.02, 0, key); }
  leafH.rotation.y = -1.35;   // swung open into the room

  // ---- transmitter rack (back wall, left): tall cabinet with panels, two VU meters, frequency readout; ON AIR lamp above
  const RACK = V(-0.75, 0, -RZ + 0.33);
  const rack = new THREE.Group(); rack.position.copy(RACK); scene.add(rack);
  const mCab = lam(null, 0x3a3e44);
  B(0.66, 1.95, 0.6, mCab, 0, 0.975, 0, rack);
  const panels = [['vent', 1.82], ['freq', 1.55], ['meters', 1.28], ['knobs', 1.01], ['switch', 0.74], ['vent', 0.47], ['knobs', 0.2]];
  const needles = [];
  panels.forEach(([kind, y], i) => {
    L.plane(0.6, 0.25, lam(tRackPanel(1310 + i, kind === 'meters' ? 'plain' : kind)), 0, y, 0.302, rack);
    if (kind === 'meters') for (const x of [-0.14, 0.14]) {
      L.plane(0.2, 0.15, L.basic(tMeter, 0xffe8c0), x, y, 0.305, rack);
      const nd = new THREE.Group(); nd.position.set(x, y - 0.075, 0.308); rack.add(nd);
      B(0.004, 0.13, 0.002, L.basic(null, 0x1a1a1a), 0, 0.065, 0, nd); needles.push(nd);
    }
  });
  const onAirOn = L.basic(tOnAir(true)), onAirOff = L.basic(tOnAir(false));
  const onAir = B(0.42, 0.15, 0.08, [mCab, mCab, mCab, mCab, onAirOn, mCab], -0.75, 2.13, -RZ + 0.05, scene);
  const onAirGlow = L.plane(0.9, 0.5, L.basic(tGlow, 0xff4030, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 }), -0.75, 2.13, -RZ + 0.1, scene);
  // coax up from the rack top to the wall (to the antenna)
  cyl(0.015, 0.015, 0.66, 6, lam(null, 0x1a1a1a), -0.47, 2.28, -RZ + 0.33, scene);   // (beside the ON AIR lamp, not across it)

  // ---- desk (right of the rack) with mic, headphones, logbook, mug, lamp; the recorder on it
  const DY = 0.76, mDesk = lam(L.rep(tWood(1305, '#6a4428', '#3a2414'), 2, 1));
  B(1.9, 0.05, 0.75, mDesk, 0.6, DY - 0.025, -RZ + 0.42, scene);
  for (const x of [-0.3, 1.5]) B(0.05, DY - 0.05, 0.7, lam(null, 0x2a1a10), x, (DY - 0.05) / 2, -RZ + 0.42, scene);
  B(0.5, 0.6, 0.65, lam(tWood(1306, '#5a3a22', '#2e1c10')), 1.25, 0.32, -RZ + 0.42, scene);   // drawer pedestal
  // classic desk mic on a base (chrome grille)
  { const g = new THREE.Group(); g.position.set(-0.05, DY, -1.45); g.rotation.y = 0.4; scene.add(g);
    cyl(0.06, 0.07, 0.02, 10, lam(null, 0x2a2a2a), 0, 0.01, 0, g); cyl(0.008, 0.008, 0.2, 6, lam(null, 0xb8bcc0), 0, 0.11, 0, g);
    const head = cyl(0.035, 0.035, 0.1, 10, lam(L.cvs(8, 8, (c) => { c.fillStyle = '#c8ccd0'; c.fillRect(0, 0, 8, 8); c.fillStyle = '#6a6e72'; for (let i = 0; i < 8; i += 2) c.fillRect(0, i, 8, 1); })), 0, 0.24, 0, g); head.rotation.x = 0.5;
    B(0.04, 0.012, 0.03, lam(null, 0x3a3a3a), 0, 0.03, 0.04, g); }
  { const g = new THREE.Group(); g.position.set(0.2, DY, -1.2); scene.add(g); const hp = L.mesh(new THREE.TorusGeometry(0.08, 0.008, 4, 10, Math.PI), lam(null, 0x1a1a1a), 0, 0.02, 0, g); hp.rotation.x = -Math.PI / 2;
    for (const x of [-0.08, 0.08]) cyl(0.035, 0.035, 0.025, 8, lam(null, 0x2a2a2a), x, 0.015, 0, g); }
  { const lb = B(0.24, 0.02, 0.3, [lam(null, 0xe8e0c8), lam(null, 0xe8e0c8), lam(L.cvs(16, 16, (c) => { c.fillStyle = '#ece4cc'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#6a6a8a'; for (let y = 2; y < 16; y += 2) c.fillRect(1, y, 12 - (y % 5), 1); })), lam(null, 0x2a3a6a), lam(null, 0x2a3a6a), lam(null, 0x2a3a6a)], -0.35 + 0.55, DY + 0.01, -1.05 - 0.3, scene); lb.rotation.y = -0.2; lb.position.set(0.95, DY + 0.01, -1.25); }
  cyl(0.04, 0.035, 0.09, 8, lam(null, 0xe8e4d8), 1.3, DY + 0.045, -1.15, scene);   // mug
  { const g = new THREE.Group(); g.position.set(1.35, DY, -1.7); scene.add(g); cyl(0.07, 0.08, 0.03, 8, lam(null, 0x1a3a1a), 0, 0.015, 0, g); cyl(0.01, 0.01, 0.4, 5, lam(null, 0xb09040), 0, 0.22, 0, g);
    const sh = cyl(0.08, 0.13, 0.12, 8, lam(null, 0x1e5a2e, { side: DS }), -0.05, 0.42, 0.08, g); sh.rotation.x = 0.5; L.mesh(new THREE.SphereGeometry(0.03, 6, 4), L.basic(null, 0xfff0c0), -0.05, 0.39, 0.1, g); }

  // ---- reel-to-reel recorder (upright deck, slightly tilted back), reels spin; name tape VICKERS on the lid edge
  const REC = V(0.55, DY, -1.55);
  const rec = new THREE.Group(); rec.position.copy(REC); rec.rotation.y = -0.25; scene.add(rec);
  const deck = new THREE.Group(); deck.position.set(0, 0, 0); deck.rotation.x = -0.18; rec.add(deck);
  const mDS = lam(null, 0x2a2a2c), mDT = lam(null, 0xa8aaa8);
  B(0.46, 0.52, 0.18, [mDS, mDS, mDT, mDS, lam(tDeck), mDS], 0, 0.27, 0, deck);
  const reels = [];
  for (const x of [-0.11, 0.11]) {
    const rg = new THREE.Group(); rg.position.set(x, 0.39, 0.1); deck.add(rg);
    L.mesh(new THREE.CircleGeometry(0.105, 16), lam(tReel, 0xffffff, { alphaTest: 0.5, side: DS }), 0, 0, 0, rg);
    cyl(0.012, 0.012, 0.02, 6, lam(null, 0x8a8a8a), x, 0.39, 0.095, deck).rotation.x = Math.PI / 2;
    reels.push(rg);
  }
  // tape path between the reels past the heads (thin brown strip)
  { const m = lam(null, 0x3a2418); B(0.3, 0.004, 0.004, m, 0, 0.33, 0.1, deck); for (const x of [-0.11, 0.11]) { const s = B(0.004, 0.06, 0.004, m, x * 0.9 + (x > 0 ? 0.06 : -0.06) * 0.2, 0.36, 0.1, deck); s.rotation.z = x > 0 ? 0.6 : -0.6; } }
  const nameTape = L.plane(0.16, 0.04, lam(tName), 0, 0.035, 0.0915, deck);   // embossed label tape on the front, under the buttons
  // cable from the recorder's back to the rack (LINE OUT -> AUDIO IN): black catenary with plugs
  {
    rec.updateMatrixWorld(true);
    const a = deck.localToWorld(V(-0.2, 0.12, -0.05)), b = RACK.clone().add(V(0.34, 0.98, 0.18));
    const mC = lam(null, 0x2a2a2e), N = 16, pts = [];
    for (let i = 0; i <= N; i++) { const u = i / N, p = a.clone().lerp(b, u); p.y -= Math.sin(u * Math.PI) * 0.35; p.z += Math.sin(u * Math.PI) * 0.25; if (p.y < DY + 0.014) p.y = DY + 0.014; pts.push(p); }
    for (let i = 0; i < N; i++) { const p = pts[i], q = pts[i + 1], d = q.clone().sub(p), m = L.mesh(new THREE.CylinderGeometry(0.013, 0.013, d.length() + 0.01, 5), mC, 0, 0, 0, scene); m.position.copy(p).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }
    B(0.03, 0.03, 0.06, lam(null, 0xb8bcc0), b.x - 0.01, b.y, b.z - 0.02, scene);                     // jack on the rack side
    B(0.03, 0.03, 0.05, lam(null, 0xb8bcc0), a.x, a.y, a.z, scene);
  }
  const lensGlow = L.plane(0.12, 0.12, L.basic(tGlow, 0xffffff, { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0, 0, scene); lensGlow.visible = false;

  const spin = (t) => { reels[0].rotation.z = -t * 2.6; reels[1].rotation.z = -t * 3.4; };   // supply / take-up (smaller pack = faster)
  const meters = (t) => { const a = voiceAmp(t), L1 = 0.2 + a * 0.75 + 0.05 * Math.sin(t * 23), L2 = 0.18 + a * 0.7 + 0.05 * Math.sin(t * 19 + 1); needles[0].rotation.z = 0.75 - 1.5 * L1; needles[1].rotation.z = 0.75 - 1.5 * L2; };
  const out = {};
  // ---- Ava (63a: steps in through the door, surprised, looks up at the lens)
  const ch = L.hero(); scene.add(ch.root); ch.root.visible = false;
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };

  // ======================================================================================================
  // 63_radio_room: slow push-in from the doorway; reels spin, ON AIR lit, VU meters move with the radio voice;
  // labels TAPE RECORDER ("tape"), PLUGGED IN ("plugged"), LOOP ("loop")
  // ======================================================================================================
  {
    const c63a = cam(56), c63 = cam(46);
    const recScr = () => { rec.updateMatrixWorld(true); return deck.localToWorld(V(0, 0.42, 0.1)); };
    const reelScr = () => { rec.updateMatrixWorld(true); return deck.localToWorld(V(0.11, 0.39, 0.1)); };
    out['63_radio_room'] = { scene, camera: c63, update(lt, t) {
      spin(t); meters(t); onAir.material[4] = onAirOn; onAirGlow.material.opacity = 0.6; torch.intensity = 0;
      const A = t < r.plug0; out['63_radio_room'].camera = A ? c63a : c63;
      // A: RE high corner over the desk: the door the clover key just opened, Ava steps in; the recorder in the foreground
      look(c63a, V(1.8, 2.25, -0.55), V(-0.75, 0.7, -0.35));
      ch.root.visible = A;
      if (A) {
        const P0 = V(-2.55, 0, 1.0), P1 = V(-1.4, 0, 0.85), u = L.clamp01((lt - W63.go) / (W63.stop - W63.go));
        ch.root.position.copy(P0.clone().lerp(P1, u)); ch.root.rotation.y = Math.atan2(P1.x - P0.x, P1.z - P0.z) + 0.5 * L.smooth((lt - W63.stop) / 0.3);
        ch.pose(lt, [L.seg('walk', W63.go, { loop: true, speed: W63.speed }), L.seg('idle', W63.stop, { from: 0.2, fade: 0.25 })], [[-99, 'surprised', mouthAt(t, 'surprised')]]);
        if (lt > W63.stop - 0.2) ch.lookAt(c63a, L.smooth((lt - W63.stop + 0.2) / 0.3), 40);
        keyGlint.visible = true; keyGlint.lookAt(c63a.position); keyGlint.scale.setScalar(0.7 + 0.3 * Math.sin(lt * 9));
      }
      // B: slow push-in on the recorder + transmitter
      const u = L.smooth((t - r.plug0) / (r.t64 - r.plug0));
      look(c63, V(0.75, 1.42, 1.0).lerp(V(0.45, 1.3, -0.15), u), V(-0.1, 1.27, -1.6).lerp(V(0.1, 1.05, -1.6), u));
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.4);
      const t0 = r.t63, t = t0 + lt, A = t < r.plug0, cc = A ? c63a : c63, p = L.toScreen(cc, ...recScr().toArray());
      if (A) { Dlabel(o, 'TAPE RECORDER', 470, 120, '#ff7b2e', p, L.clamp01((lt - (r.tape - t0)) / 0.1)); return; }
      Dlabel(o, 'TAPE RECORDER', Math.min(540, p[0] + 110), Math.max(96, p[1] - 90), '#ff7b2e', p, 1);
      rec.updateMatrixWorld(true);
      const mid = L.toScreen(c63, ...RACK.clone().add(V(0.36, 0.98, 0.18)).toArray());
      Dlabel(o, 'PLUGGED IN', Math.max(150, mid[0] - 40), Math.min(250, mid[1] + 50), '#ffd23f', mid, L.clamp01((lt - (r.plugged - t0)) / 0.1));
      const q = L.toScreen(c63, ...reelScr().toArray());   // ON A LOOP: below-right of the deck, its own leader to the take-up reel
      Dlabel(o, 'ON A LOOP', Math.min(560, q[0] + 120), Math.min(262, q[1] + 70), '#ff4030', q, L.clamp01((lt - (r.loop - t0)) / 0.1));
    } };
  }

  // ======================================================================================================
  // 65_vickers_tag: close-up of the recorder, reels turning; the camera tilts down to the label strip and the
  // flashlight finds the name tape VICKERS on "Vickers"
  // ======================================================================================================
  {
    const c65 = cam(34);
    out['65_vickers_tag'] = { scene, camera: c65, update(lt, t) {
      ch.root.visible = false; keyGlint.visible = false;
      spin(t); meters(t); onAir.material[4] = onAirOn;
      rec.updateMatrixWorld(true);
      const reelC = deck.localToWorld(V(0, 0.39, 0.1)), tagC = deck.localToWorld(V(0, 0.035, 0.092));
      const fwd = V(0, 0, 1).applyQuaternion(deck.getWorldQuaternion(new THREE.Quaternion()));
      const tn = r.name - r.t65, tv = r.vickers - r.t65;
      const k = L.smooth((lt - tn) / Math.max(0.6, tv - tn));
      // slow continuous push-in + tilt over the whole shot (no shake), on top of the reel->tag move
      const dr = Math.min(1, lt / Math.max(1, r.e65 - r.t65)), tgt = reelC.clone().lerp(tagC, k), dist = (0.75 - 0.33 * k) * (1 - 0.35 * dr);
      look(c65, tgt.clone().addScaledVector(fwd, dist).add(V(0.06 - 0.04 * dr, 0.05 + 0.07 * dr, 0)), tgt);
      // flashlight from off-screen right, its spot slides down onto the name tape and lands on "Vickers"
      const on = lt > tn - 0.3;
      torch.intensity = on ? 10 + 8 * Math.max(0, 1 - Math.abs(lt - tv) / 0.4) : 0;
      torch.position.copy(tgt).add(V(0.6, 0.5, 0.9)); torch.target.position.copy(reelC.clone().lerp(tagC, L.smooth((lt - tn) / Math.max(0.6, tv - tn - 0.05))));
      lamp.intensity = 3.0; onAirGlow.material.opacity = 0.6;
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.55);
      const tv = r.vickers - r.t65, k = L.clamp01((lt - tv) / 0.1);
      if (k > 0) { rec.updateMatrixWorld(true); const p = L.toScreen(c65, ...deck.localToWorld(V(0.08, 0.035, 0.092)).toArray()); Dlabel(o, 'B. VICKERS', 500, 110, '#ff4030', [p[0], p[1] - 8], k); }
    } };
  }
  void nameTape; void doorL; void lensGlow;
  return out;
}

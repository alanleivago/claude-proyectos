// sets/hall.js — ep3 "AVA: DAY 1 — The Police Station": ONE police-station lobby (RPD-like main hall, never "RPD"/"Raccoon")
// and its FRONT GLASS DOORS onto a rainy night street with abandoned patrol cars (lights off).
// Shots 02_hall 03_safe 04_isnt 11_lobby 13_knock 14_cop 16_badge 17_lights 18_fudge (shotlist.md rules).
// World: front glass wall at z=0 (lobby at +z, street at -z), lobby x in [-5,5], z in [0,13], ceiling 5 m, floor y=0.
// Barred gate in the back wall (x -4.4..-2.4), reception counter at z=9.2, columns at x=+-2.8, fluorescent rows on the ceiling.
// Every update() sets the whole state (lights, glass, Ava, zombies, cop). Only the glass ever shakes; Ava/camera never.

// ---------- sound events (global s) ----------
const T_CHAIN = 2.86, T_CLICK = 3.23;                                  // 02: she grabs the chained padlock, snaps it shut on "locked"
const HITS04 = [7.78, 8.12, 8.45, 8.74, 9.08];                         // 04: zombie palms slam the glass ("it isn't")
const TICKS13 = [38.85, 39.85];                                          // 13: wall clock second hand
const KNOCK13 = [40.08, 40.26, 40.44, 41.6, 41.78, 41.96];               // 13: three quick knocks on "knocks" (40.06), then three more
const KNOCK14 = [43.02, 43.24, 43.46, 45.5, 45.7, 45.9];               // 14: knuckles on the glass ("Police department" / "Open the door")
const FLASH16 = 52.2;                                                  // 16: lightning lights his face (thunder on the flash)
const KNOCK17 = [54.5, 54.72, 54.94];                                  // 17: "still knocking"
const T_LIGHT = 55.72, ROWS = 6, ROW_DT = 0.16;                        // 17: on "light", rows switch on one by one toward camera
const ROW_T = Array.from({ length: ROWS }, (_, i) => +(T_LIGHT + i * ROW_DT).toFixed(2));
const GLASS_HITS = [...HITS04, ...KNOCK13, ...KNOCK14, ...KNOCK17];

export const HALL_SFX = [
  [T_CHAIN, 'chain_rattle'], [T_CLICK, 'padlock_click'],
  ...HITS04.map((t) => [t, 'glass_hit']),
  ...TICKS13.map((t) => [t, 'clock_tick']),
  ...KNOCK13.map((t) => [t, 'glass_knock']),
  ...KNOCK14.map((t) => [t, 'glass_knock']),
  [FLASH16, 'thunder'],
  ...KNOCK17.map((t) => [t, 'glass_knock']),
  ...ROW_T.map((t) => [t, 'light_clack']),
  [T_LIGHT + 0.05, 'fluorescent_hum_start'],
];

import { reText, reWidth } from '../refont.js';

export async function shots({ L, TL }) {
  const { THREE, LW, LH } = L;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const rgb = (r, g, b) => `rgb(${Math.max(0, Math.min(255, r | 0))},${Math.max(0, Math.min(255, g | 0))},${Math.max(0, Math.min(255, b | 0))})`;
  const B = (w, h, d, m, x, y, z, p) => L.box(w, h, d, m, x, y, z, p);
  const cyl = (r1, r2, h, n, m, x, y, z, p) => L.mesh(new THREE.CylinderGeometry(r1, r2, h, n), m, x, y, z, p);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const lam = (t, col = 0xffffff, extra) => L.lam(t, col, extra);
  const DS = THREE.DoubleSide;

  const BG = 0x121826;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 9, 30);

  // ---------- lights (OFF: moon/streetlight blue through the glass + one warm desk lamp; ON: fluorescent rows) ----------
  const hemi = new THREE.HemisphereLight(0x7088c0, 0x2a2830, 1.15); scene.add(hemi);
  const moon = new THREE.DirectionalLight(0x9ab8ff, 1.0); moon.position.set(-1.5, 5, -8); moon.target.position.set(0.5, 0, 6); scene.add(moon, moon.target);
  const fill = new THREE.DirectionalLight(0x8aa0d0, 0.45); fill.position.set(0.5, 2.5, 6); fill.target.position.set(0, 1.2, -2); scene.add(fill, fill.target);
  const street = new THREE.PointLight(0xc8dcff, 9, 10, 1); street.position.set(1.6, 3.4, -2.8); scene.add(street);
  const flash = new THREE.DirectionalLight(0xe4ecff, 0); flash.position.set(0.6, 2.2, 3); flash.target.position.set(0.3, 1.5, -0.4); scene.add(flash, flash.target);
  const top = new THREE.PointLight(0xffffff, 0, 4, 1); scene.add(top);

  // ---------- textures ----------
  const tFloor = L.cvs(64, 64, (c, w, h) => {   // worn marble checker (2x2 tiles), veins, grout, grime
    const r = L.rng(301);
    for (let ty = 0; ty < 2; ty++) for (let tx = 0; tx < 2; tx++) {
      const dark = (tx + ty) % 2 === 1;
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const n = r() * 14 - 7, v = Math.sin((x + y * 0.6) * 0.35 + tx * 3) * 6;
        px(c, tx * 32 + x, ty * 32 + y, dark ? rgb(54 + n + v * 0.4, 56 + n + v * 0.4, 64 + n) : rgb(196 + n + v, 188 + n + v, 166 + n));
      }
      c.strokeStyle = dark ? 'rgba(130,130,140,0.45)' : 'rgba(120,110,90,0.45)'; c.lineWidth = 1;
      c.beginPath(); let x = tx * 32 + r() * 32, y = ty * 32; c.moveTo(x, y); for (let s = 0; s < 5; s++) { x += r() * 10 - 5; y += 6 + r() * 3; c.lineTo(x, y); } c.stroke();
    }
    px(c, 0, 0, '#2a2622', w, 1); px(c, 0, 32, '#2a2622', w, 1); px(c, 0, 0, '#2a2622', 1, h); px(c, 32, 0, '#2a2622', 1, h);
    for (let k = 0; k < 40; k++) px(c, r() * w | 0, r() * h | 0, 'rgba(40,30,20,0.35)', 1 + (r() * 3 | 0), 1);
  });
  const tWall = L.cvs(64, 128, (c, w, h) => {   // upper: beige ashlar plaster; lower 22 %: dark wood wainscot with panels + chair rail
    const r = L.rng(302), WY = Math.round(h * 0.78);
    for (let y = 0; y < WY; y++) for (let x = 0; x < w; x++) { const n = r() * 12 - 6; px(c, x, y, rgb(176 + n, 160 + n, 128 + n)); }
    for (let y = 0; y < WY; y += 16) { px(c, 0, y, '#8e7e60', w, 1); const off = (y / 16) % 2 ? 0 : 32; px(c, off, y, '#8e7e60', 1, 16); px(c, (off + 32) % 64 === 0 ? 63 : off + 31, y, 'rgba(0,0,0,0)', 1, 1); }
    for (let k = 0; k < 8; k++) { const x = r() * w | 0, y0 = r() * WY | 0; for (let y = y0; y < Math.min(WY, y0 + 12 + r() * 20); y++) if (r() < 0.8) px(c, x, y, 'rgba(90,70,40,0.25)'); }   // water stains
    for (let y = WY; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + (Math.sin(y * 0.9 + x * 0.05) > 0.8 ? -10 : 0); px(c, x, y, rgb(92 + n, 58 + n * 0.7, 34 + n * 0.4)); }
    px(c, 0, WY, '#c8a878', w, 2); px(c, 0, WY + 2, '#3a2414', w, 1);
    for (const x0 of [3, 35]) { c.strokeStyle = '#4a2c16'; c.strokeRect(x0 + 0.5, WY + 6.5, 25, h - WY - 12); c.strokeStyle = '#7a5434'; c.strokeRect(x0 + 1.5, WY + 7.5, 23, h - WY - 14); }
    px(c, 0, h - 3, '#2a1a0c', w, 3);
  });
  const tCeil = L.cvs(32, 32, (c, w, h) => { const r = L.rng(303); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const e = x < 2 || y < 2; const n = r() * 8; px(c, x, y, e ? rgb(60 + n, 56 + n, 50 + n) : rgb(120 + n, 114 + n, 100 + n)); } px(c, 3, 3, '#8a8474', 26, 1); px(c, 3, 3, '#8a8474', 1, 26); });
  const tWood = L.cvs(64, 32, (c, w, h) => {   // reception counter front: walnut raised panels
    const r = L.rng(304);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5 + Math.sin(x * 0.5 + Math.sin(y * 0.3) * 2) * 6; px(c, x, y, rgb(104 + n, 62 + n * 0.7, 34 + n * 0.4)); }
    for (const x0 of [2, 34]) { c.strokeStyle = '#3a200e'; c.strokeRect(x0 + 0.5, 4.5, 27, 23); c.strokeStyle = '#a07048'; c.strokeRect(x0 + 1.5, 5.5, 25, 21); }
    px(c, 0, 0, '#c89868', w, 2); px(c, 0, h - 2, '#24140a', w, 2);
  });
  const tTop = L.cvs(32, 16, (c, w, h) => { const r = L.rng(305); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 + Math.sin(x * 0.7) * 5; px(c, x, y, rgb(132 + n, 86 + n, 50 + n)); } });
  const tStone = L.cvs(32, 64, (c, w, h) => { const r = L.rng(306); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8; px(c, x, y, rgb(170 + n, 162 + n, 146 + n)); } for (let y = 0; y < h; y += 16) px(c, 0, y, '#7a7262', w, 1); px(c, 0, 0, '#7a7262', 1, h); for (let k = 0; k < 10; k++) px(c, r() * w | 0, r() * h | 0, '#8a8272', 2, 1); });
  const tIron = L.cvs(8, 32, (c, w, h) => { const r = L.rng(307); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r(); px(c, x, y, n < 0.12 ? '#6a3a1e' : n < 0.3 ? '#3e3e42' : x < 2 ? '#5a5a60' : '#2c2c30'); } });
  const tMetal = L.cvs(8, 32, (c, w, h) => { const r = L.rng(308); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10; px(c, x, y, x === 1 ? rgb(118 + n, 112 + n, 100 + n) : rgb(72 + n, 68 + n, 62 + n)); } });
  const tGlass = L.cvs(32, 64, (c, w, h) => {   // wet glass: blue-grey with vertical water streaks
    const r = L.rng(309);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const k = 0.8 + r() * 0.2 + (y / h) * 0.15; px(c, x, y, rgb(150 * k, 170 * k, 196 * k)); }
    for (let k = 0; k < 9; k++) { const x = r() * w | 0, y0 = r() * h | 0; for (let y = y0; y < y0 + 10 + r() * 30; y++) px(c, x + (y % 9 === 0 ? 1 : 0), y % h, 'rgb(220,232,250)'); }
  });
  const tDrops = L.cvs(32, 64, (c, w, h) => {   // rain drops + trails on the glass (alpha cut, scrolls down)
    c.clearRect(0, 0, w, h); const r = L.rng(310);
    for (let k = 0; k < 12; k++) { const x = r() * w | 0, y = r() * h | 0; px(c, x, y, '#e8f2ff', 1, 2); if (r() < 0.3) for (let t = 1; t < 4 + r() * 6; t++) px(c, x, (y - t * 2 + h) % h, 'rgba(200,220,245,1)', 1, 1); }
  });
  const tCork = L.cvs(64, 40, (c, w, h) => {   // notice board: cork, wood frame, pinned notices
    const r = L.rng(311);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 30 - 15; px(c, x, y, rgb(168 + n, 120 + n, 70 + n)); }
    c.strokeStyle = '#3a2210'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
    const paper = (x, y, pw, ph, col, title) => { px(c, x, y, col, pw, ph); for (let l = y + 5; l < y + ph - 2; l += 2) px(c, x + 2, l, 'rgba(40,40,50,0.55)', pw - 4 - (r() * 4 | 0), 1); px(c, x + pw / 2 | 0, y + 1, '#c02020', 1, 1); if (title) { c.fillStyle = '#202020'; c.font = 'bold 5px monospace'; c.textAlign = 'center'; c.textBaseline = 'top'; c.fillText(title, x + pw / 2, y + 1); } };
    paper(5, 5, 16, 20, '#e8e4d8', 'MISSING'); paper(24, 4, 14, 14, '#f0e090', 'CURFEW'); paper(41, 6, 18, 13, '#e0e0e0', 'NOTICE'); paper(26, 21, 12, 15, '#d8d0c0', ''); paper(43, 22, 15, 13, '#e8e4d8', 'WANTED');
    px(c, 8, 9, '#6a6a70', 9, 8);   // photo on MISSING
  });
  const tSign = L.cvs(128, 20, (c, w, h) => {   // "CITY POLICE": brass letters on a dark wood board
    c.fillStyle = '#2e1a0e'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a2c18'; c.fillRect(2, 2, w - 4, h - 4);
    c.fillStyle = '#b08a3a'; c.fillRect(0, 0, w, 1); c.fillRect(0, h - 1, w, 1);
    c.font = 'bold 13px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#1a0e06'; c.fillText('CITY  POLICE', w / 2 + 1, h / 2 + 2); c.fillStyle = '#e0b850'; c.fillText('CITY  POLICE', w / 2, h / 2 + 1);
    c.fillStyle = '#e0b850'; c.beginPath(); c.arc(8, h / 2, 4, 0, 7); c.fill(); c.beginPath(); c.arc(w - 8, h / 2, 4, 0, 7); c.fill();
  });
  const tFlagA = L.cvs(32, 20, (c, w, h) => { px(c, 0, 0, '#1e2e6a', w, h); c.fillStyle = '#d8b040'; c.beginPath(); c.arc(16, 10, 6, 0, 7); c.fill(); px(c, 13, 7, '#1e2e6a', 6, 6); px(c, 15, 5, '#d8b040', 2, 10); px(c, 0, 0, '#c0a030', w, 1); px(c, 0, h - 1, '#c0a030', w, 1); });
  const tFlagB = L.cvs(32, 20, (c, w, h) => { for (let y = 0; y < h; y++) px(c, 0, y, Math.floor(y / 2) % 2 ? '#e8e4dc' : '#b0242a', w, 1); px(c, 0, 0, '#22306a', 14, 10); for (let y = 1; y < 10; y += 2) for (let x = 1 + (y % 4 === 1 ? 0 : 1); x < 14; x += 3) px(c, x, y, '#e8e8e8'); });
  const tExt = L.cvs(16, 32, (c, w, h) => { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px(c, x, y, x === 3 ? '#f05040' : x > 12 ? '#801010' : '#c41e16'); px(c, 2, 12, '#e8e4d8', 12, 9); px(c, 4, 14, '#202020', 8, 1); px(c, 4, 16, '#202020', 6, 1); px(c, 4, 18, '#202020', 7, 1); });
  const tPot = L.cvs(16, 16, (c, w, h) => { const r = L.rng(312); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 20 - 10; px(c, x, y, y < 3 ? rgb(170 + n, 92 + n, 52 + n) : rgb(150 + n, 74 + n, 40 + n)); } px(c, 0, 3, '#6a3018', w, 1); });
  const leafTex = (col, dark) => L.cvs(32, 32, (c, w, h) => {
    c.clearRect(0, 0, w, h); const r = L.rng(313);
    for (let k = 0; k < 9; k++) { const cx = 4 + r() * 24, cy = 6 + r() * 22, a = r() * Math.PI;
      c.fillStyle = k % 3 ? col : dark; c.beginPath(); c.ellipse(cx, cy, 5, 2.2, a, 0, 7); c.fill(); c.fillStyle = dark; c.fillRect(cx | 0, cy | 0, 1, 1); }
    c.fillStyle = '#2a4a1a'; c.fillRect(15, 20, 2, 12);
  });
  const tSpray = L.cvs(32, 32, (c, w, h) => {   // First Aid Spray can: white, green band, red cross, text
    px(c, 0, 0, '#e8ecee', w, h); px(c, 0, 0, '#c8ccd0', w, 2); px(c, 0, 10, '#2a9a4a', w, 12); px(c, 0, 10, '#1a6a30', w, 1); px(c, 0, 21, '#1a6a30', w, 1);
    px(c, 4, 12, '#e8ecee', 6, 8); px(c, 6, 13, '#c82020', 2, 6); px(c, 4, 15, '#c82020', 6, 2);
    c.fillStyle = '#ffffff'; c.font = 'bold 5px monospace'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillText('FIRST', 12, 11); c.fillText('AID', 12, 16);
    px(c, 0, 26, '#9aa0a4', w, 1);
  });
  const tClock = L.cvs(64, 64, (c, w, h) => {   // wall clock face (hands are meshes)
    c.fillStyle = '#e8e2d0'; c.beginPath(); c.arc(32, 32, 31, 0, 7); c.fill();
    c.fillStyle = '#1a1a1a';
    for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r0 = k % 5 ? 28 : 25; for (let rr = r0; rr < 30; rr++) c.fillRect(Math.round(32 + Math.sin(a) * rr), Math.round(32 - Math.cos(a) * rr), 1, 1); }
    c.font = 'bold 9px "Times New Roman", serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let k = 1; k <= 12; k++) { const a = k / 12 * Math.PI * 2; c.fillText(String(k), 32 + Math.sin(a) * 20, 33 - Math.cos(a) * 20); }
    c.font = 'bold 4px monospace'; c.fillStyle = '#5a2a1a'; c.fillText('CITY POLICE', 32, 43);
  });
  const tAsph = L.cvs(64, 64, (c, w, h) => {   // wet asphalt: dark, puddles reflecting the streetlight
    const r = L.rng(314);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(40 + n, 44 + n, 54 + n)); }
    for (let k = 0; k < 6; k++) { const cx = r() * w, cy = r() * h, rx = 5 + r() * 9, ry = 2 + r() * 3; for (let y = -ry; y <= ry; y++) for (let x = -rx; x <= rx; x++) if (x * x / (rx * rx) + y * y / (ry * ry) < 1) px(c, (cx + x + w) % w | 0, (cy + y + h) % h | 0, (x + y) % 4 === 0 ? '#7a8aa8' : '#4e5a72'); }
    px(c, 0, 30, '#9a9068', w, 2);   // faded lane line
  });
  const tSide = L.cvs(32, 32, (c, w, h) => { const r = L.rng(315); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 14 - 7; px(c, x, y, rgb(92 + n, 94 + n, 100 + n)); } px(c, 0, 0, '#4a4c54', w, 1); px(c, 0, 0, '#4a4c54', 1, h); });
  const tBuild = L.cvs(64, 64, (c, w, h) => {   // building across the street: dark brick, windows (two lit warm), shop awning
    const r = L.rng(316);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5, m = (y % 4 === 0) || ((x + (Math.floor(y / 4) % 2) * 4) % 8 === 0); px(c, x, y, m ? rgb(30 + n, 26 + n, 28 + n) : rgb(58 + n, 40 + n, 40 + n)); }
    for (let wy = 6; wy < 44; wy += 12) for (let wx = 4; wx < 64; wx += 12) { const lit = (wx === 16 && wy === 18) || (wx === 52 && wy === 6); px(c, wx, wy, lit ? '#d8a050' : '#14182a', 7, 8); px(c, wx + 3, wy, '#2a2428', 1, 8); if (lit) px(c, wx + 1, wy + 1, '#f0c878', 2, 3); }
    px(c, 0, 50, '#1e3a2a', w, 4); for (let x = 0; x < w; x += 4) px(c, x, 54, '#e8e0d0', 2, 2); px(c, 0, 56, '#0e0e14', w, 8);
  });
  const tCarSide = L.cvs(64, 16, (c, w, h) => {   // classic black & white: white doors with POLICE, black fenders
    px(c, 0, 0, '#16161a', w, h); px(c, 14, 0, '#e4e4e0', 34, 11); px(c, 31, 0, '#9a9a96', 1, 11);
    c.fillStyle = '#16161a'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('POLICE', 31, 6);
    px(c, 0, 11, '#0a0a0c', w, 1); px(c, 0, 14, '#2a2a30', w, 2);
  });
  const tCarWin = L.cvs(32, 8, (c, w, h) => { px(c, 0, 0, '#e4e4e0', w, h); px(c, 2, 1, '#1a2234', 13, 7); px(c, 17, 1, '#1a2234', 13, 7); px(c, 3, 1, '#4a5a7a', 2, 2); px(c, 18, 1, '#4a5a7a', 2, 2); });
  const tCarFront = L.cvs(32, 16, (c, w, h) => { px(c, 0, 0, '#16161a', w, h); px(c, 2, 4, '#9a9a90', 6, 4); px(c, 24, 4, '#9a9a90', 6, 4); px(c, 10, 5, '#2a2a2e', 12, 6); for (let x = 11; x < 22; x += 2) px(c, x, 5, '#4a4a50', 1, 6); px(c, 0, 12, '#4a4a50', w, 3); });
  // zombie / cop textures (outside.js / ep1): plaid shirt + jeans, grey dead skin; navy police uniform
  const zTex = L.cvs(32, 64, (c) => {
    const r = L.rng(31);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const sx = x % 8 < 2, sy = y % 8 < 2, th = x % 8 === 5 || y % 8 === 5; const col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30]; const n = r() * 16 - 8; px(c, x, y, rgb(col[0] + n, col[1] + n / 2, col[2] + n / 2)); }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 18 - 9 + (x % 16 === 0 ? -18 : 0); px(c, x, y, rgb(58 + n, 84 + n, 138 + n)); }
    for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#5a0a08', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
  });
  zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
  const navyTex = L.cvs(32, 64, (c) => {   // top half: navy uniform shirt (seams, pocket flaps, buttons, blood); bottom: darker trousers, belt, side stripe
    const r = L.rng(32);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 10 - 5; px(c, x, y, rgb(30 + n, 40 + n, 70 + n)); }
    for (let x = 0; x < 32; x += 16) px(c, x + 7, 0, '#121a30', 1, 32);
    for (let x = 0; x < 32; x += 16) { px(c, x + 2, 8, '#18223e', 4, 2); px(c, x + 10, 8, '#18223e', 4, 2); px(c, x + 8, 4, '#a0a0a8', 1, 1); px(c, x + 8, 12, '#a0a0a8', 1, 1); px(c, x + 8, 20, '#a0a0a8', 1, 1); }
    for (let k = 0; k < 5; k++) px(c, Math.floor(r() * 30), 14 + Math.floor(r() * 16), '#3a0c0c', 2 + Math.floor(r() * 2), 1 + Math.floor(r() * 3));
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 8 - 4; px(c, x, y, rgb(20 + n, 26 + n, 46 + n)); }
    px(c, 0, 32, '#0c0c0e', 32, 3); px(c, 14, 32, '#9a8a50', 3, 3); for (let x = 0; x < 32; x += 16) px(c, x + 3, 36, '#3a4a7a', 1, 28);
  });
  navyTex.wrapS = THREE.RepeatWrapping; navyTex.wrapT = THREE.ClampToEdgeWrapping;
  const skinT = L.rep(L.cvs(32, 32, (c) => {
    const r = L.rng(33);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; px(c, x, y, rgb(138 + n, 150 + n, 152 + n)); }
    for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
  }), 1, 1);
  const tPlate = L.cvs(64, 16, (c, w, h) => {   // name plate VICKERS
    px(c, 0, 0, '#6a5420', w, h); px(c, 1, 1, '#d8bc60', w - 2, h - 2); px(c, 1, 1, '#f4e098', w - 2, 2); px(c, 1, h - 3, '#a08030', w - 2, 2);
    c.fillStyle = '#141008'; c.font = 'bold 11px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('VICKERS', w / 2, h / 2 + 1);
  });
  const tShield = L.cvs(16, 16, (c) => { c.clearRect(0, 0, 16, 16); c.fillStyle = '#d8bc60'; c.beginPath(); c.moveTo(8, 0); c.lineTo(15, 3); c.lineTo(14, 10); c.lineTo(8, 15); c.lineTo(2, 10); c.lineTo(1, 3); c.closePath(); c.fill(); c.fillStyle = '#806020'; c.beginPath(); c.arc(8, 7, 3, 0, 7); c.fill(); px(c, 4, 1, '#f8e8a8', 8, 1); });
  const tPaper = L.cvs(16, 16, (c) => { px(c, 0, 0, '#e8e4d8', 16, 16); for (let y = 3; y < 15; y += 2) px(c, 2, y, '#8a8a90', 9 + (y % 3), 1); });

  // ---------- materials ----------
  const mFloor = lam(L.rep(tFloor, 10 / 1.2, 13 / 1.2)), mCeil = lam(L.rep(tCeil, 10 / 1.2, 13 / 1.2));
  const mStone = lam(L.rep(tStone, 1, 2)), mIron = lam(tIron), mMetal = lam(tMetal), mDark = lam(null, 0x18181c), mBrass = lam(null, 0xc8a040);
  const mWoodC = lam(L.rep(tWood, 4, 1)), mTop = lam(L.rep(tTop, 6, 1)), mBench = lam(tTop, 0x9a7a5a);

  // ---------- lobby shell ----------
  const XW = 5, ZB = 13, HC = 5;
  L.plane(XW * 2, ZB, mFloor, 0, 0, ZB / 2, scene, 0, -Math.PI / 2);
  L.plane(XW * 2, ZB, mCeil, 0, HC, ZB / 2, scene, 0, Math.PI / 2);
  const mW = lam(tWall); mW.map.wrapS = mW.map.wrapT = THREE.RepeatWrapping;
  // wall part with world-mapped UVs (u = along/2 m, v = y/5 m) so cut walls keep the wainscot at the floor
  const wallPart = (a0, a1, y0, y1, place) => {
    const w = a1 - a0, h = y1 - y0, g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (a0 + uv.getX(i) * w) / 2, (y0 + uv.getY(i) * h) / HC);
    const m = L.mesh(g, mW, 0, (y0 + y1) / 2, 0, scene); place(m, (a0 + a1) / 2); return m;
  };
  const left = (m, c) => { m.position.set(-XW, m.position.y, c); m.rotation.y = Math.PI / 2; };
  const right = (m, c) => { m.position.set(XW, m.position.y, ZB - c); m.rotation.y = -Math.PI / 2; };
  const back = (m, c) => { m.position.set(-c, m.position.y, ZB); m.rotation.y = Math.PI; };   // a = -x along the back wall
  const front = (m, c) => { m.position.set(c, m.position.y, 0); };
  wallPart(0, ZB, 0, HC, left); wallPart(0, ZB, 0, HC, right);
  wallPart(-XW, 2.4, 0, HC, back); wallPart(4.4, XW, 0, HC, back); wallPart(2.4, 4.4, 2.6, HC, back);   // gate opening x -4.4..-2.4, y < 2.6
  wallPart(-XW, -2.25, 0, HC, front); wallPart(2.25, XW, 0, HC, front); wallPart(-2.25, 2.25, 3.25, HC, front);
  for (const [x, z, w, d] of [[-XW + 0.02, ZB / 2, 0.04, ZB], [XW - 0.02, ZB / 2, 0.04, ZB]]) B(w, 0.12, d, lam(null, 0x2a1a0c), x, 0.06, z, scene);   // skirting
  B(10, 0.2, 0.12, lam(null, 0x8a7a5a), 0, HC - 0.1, ZB - 0.06, scene);   // cornice
  B(0.12, 0.2, ZB, lam(null, 0x8a7a5a), -XW + 0.06, HC - 0.1, ZB / 2, scene); B(0.12, 0.2, ZB, lam(null, 0x8a7a5a), XW - 0.06, HC - 0.1, ZB / 2, scene);

  // columns (stone, base + capital) and the extinguisher on one of them
  for (const z of [2.6, 6.0, 9.6]) for (const x of [-2.8, 2.8]) {
    B(0.56, HC, 0.56, mStone, x, HC / 2, z, scene); B(0.72, 0.32, 0.72, mStone, x, 0.16, z, scene); B(0.72, 0.28, 0.72, mStone, x, HC - 0.34, z, scene);
    B(0.62, 0.06, 0.62, lam(null, 0x8a8270), x, 0.36, z, scene);
  }
  { const ex = new THREE.Group(); ex.position.set(-2.8, 0, 6.0 + 0.37); scene.add(ex);
    cyl(0.075, 0.075, 0.48, 10, lam(tExt), 0, 0.95, 0, ex); cyl(0.04, 0.06, 0.05, 8, lam(null, 0x1a1a1a), 0, 1.215, 0, ex);
    B(0.1, 0.03, 0.03, lam(null, 0x1a1a1a), 0.03, 1.25, 0, ex); B(0.02, 0.3, 0.02, lam(null, 0x101010), -0.08, 1.0, 0.03, ex);
    B(0.18, 0.06, 0.04, mMetal, 0, 0.72, -0.06, ex);   // wall bracket
    L.plane(0.2, 0.08, L.basic(L.cvs(32, 12, (c) => { px(c, 0, 0, '#c41e16', 32, 12); c.fillStyle = '#fff'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FIRE', 16, 6); })), 0, 1.45, -0.07, ex, 0);
  }

  // reception counter (walnut, two wings), desk lamp, First Aid Spray, papers, phone; CITY POLICE sign, flags
  const counter = new THREE.Group(); counter.position.set(0, 0, 9.2); scene.add(counter);
  B(4.6, 1.08, 0.7, [mWoodC, mWoodC, mTop, mTop, mWoodC, mWoodC], 0, 0.54, 0, counter);
  B(4.76, 0.06, 0.86, mTop, 0, 1.11, 0, counter);
  B(4.6, 0.1, 0.02, lam(null, 0x24140a), 0, 0.05, -0.36, counter);
  for (const s of [-1, 1]) { B(0.7, 1.08, 1.6, [mWoodC, mWoodC, mTop, mTop, mWoodC, mWoodC], s * 2.65, 0.54, 0.45, counter); B(0.86, 0.06, 1.76, mTop, s * 2.65, 1.11, 0.45, counter); }
  const LAMP = V(-1.4, 1.14, 9.05);
  { const lp = new THREE.Group(); lp.position.copy(LAMP); scene.add(lp);
    cyl(0.08, 0.1, 0.03, 8, lam(null, 0x2a4a2a), 0, 0.015, 0, lp); const arm = B(0.02, 0.32, 0.02, mBrass, 0, 0.17, 0, lp); arm.rotation.z = 0.2;
    const sh = cyl(0.04, 0.12, 0.12, 8, lam(null, 0x1e5a2e, { side: DS }), -0.07, 0.34, -0.02, lp); sh.rotation.z = -0.5;
    L.mesh(new THREE.CircleGeometry(0.1, 8), L.basic(null, 0xffe0a0), -0.1, 0.29, -0.02, lp).rotation.set(Math.PI / 2, 0, -0.5); }
  const lampL = new THREE.PointLight(0xffa860, 3.2, 6, 1); lampL.position.set(LAMP.x - 0.1, LAMP.y + 0.25, LAMP.z - 0.2); scene.add(lampL);
  { const sp = new THREE.Group(); sp.position.set(0.9, 1.14, 8.98); scene.add(sp);   // First Aid Spray (RE)
    cyl(0.038, 0.038, 0.15, 10, lam(tSpray), 0, 0.075, 0, sp).rotation.y = Math.PI * 0.5; cyl(0.03, 0.036, 0.03, 8, lam(null, 0xd8dcde), 0, 0.165, 0, sp); B(0.02, 0.02, 0.03, lam(null, 0x2a9a4a), 0, 0.19, -0.01, sp); }
  for (let k = 0; k < 3; k++) { const p = B(0.22, 0.008, 0.3, lam(tPaper), 0.25 + k * 0.03, 1.145 + k * 0.009, 9.25, scene); p.rotation.y = 0.2 * k - 0.1; }
  B(0.2, 0.07, 0.16, lam(null, 0x141416), 1.55, 1.175, 9.1, scene); B(0.2, 0.04, 0.05, lam(null, 0x141416), 1.55, 1.23, 9.1, scene);   // phone
  L.plane(3.2, 0.5, lam(tSign), 0, 3.5, ZB - 0.02, scene, Math.PI);
  for (const [x, t] of [[-1.85, tFlagA], [1.85, tFlagB]]) {
    cyl(0.02, 0.02, 2.6, 6, mBrass, x, 1.3, ZB - 0.3, scene); L.mesh(new THREE.SphereGeometry(0.04, 6, 4), mBrass, x, 2.63, ZB - 0.3, scene);
    cyl(0.18, 0.2, 0.06, 8, lam(null, 0x2a2a2a), x, 0.03, ZB - 0.3, scene);
    const f = L.plane(0.75, 0.5, lam(t, 0xffffff, { side: DS }), x + (x < 0 ? 0.39 : -0.39), 2.25, ZB - 0.3, scene, Math.PI); void f;
  }
  // RE herb pots by the counter: green left, red right (+ one green by the doors)
  const herb = (x, z, col, dark) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.17, 0.12, 0.28, 8, lam(tPot), 0, 0.14, 0, g); L.mesh(new THREE.CircleGeometry(0.15, 8), lam(null, 0x2a1a10), 0, 0.27, 0, g).rotation.x = -Math.PI / 2;
    const m = L.lam(leafTex(col, dark), 0xffffff, { alphaTest: 0.5, side: DS });
    for (let k = 0; k < 4; k++) { const p = L.plane(0.45, 0.45, m, 0, 0.47, 0, g, k * Math.PI / 4); p.rotation.x = 0.0; }
    return g;
  };
  herb(-2.2, 8.45, '#3aa03a', '#1e6a1e'); herb(2.2, 8.45, '#d0282a', '#8a1214'); herb(4.5, 1.0, '#3aa03a', '#1e6a1e');
  // benches along the walls
  const bench = (x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; scene.add(g);
    for (let k = 0; k < 3; k++) B(1.8, 0.04, 0.12, mBench, 0, 0.45, -0.14 + k * 0.14, g);
    for (let k = 0; k < 2; k++) B(1.8, 0.1, 0.03, mBench, 0, 0.7 + k * 0.16, -0.23, g);
    for (const sx of [-0.8, 0.8]) { B(0.05, 0.45, 0.4, lam(null, 0x2a2420), sx, 0.225, 0, g); B(0.05, 0.5, 0.04, lam(null, 0x2a2420), sx, 0.7, -0.24, g); }
  };
  bench(-4.5, 4.3, Math.PI / 2); bench(4.5, 4.3, -Math.PI / 2); bench(4.5, 7.0, -Math.PI / 2);
  // notice board (left wall)
  { B(1.5, 0.95, 0.04, lam(null, 0x3a2210), -XW + 0.03, 1.75, 6.4, scene); L.plane(1.42, 0.88, lam(tCork), -XW + 0.055, 1.75, 6.4, scene, Math.PI / 2); }
  // wall clock (back wall, right) — 3:14; hands are meshes
  const clock = new THREE.Group(); clock.position.set(3.3, 2.75, ZB - 0.03); clock.rotation.y = Math.PI; scene.add(clock);
  { const rim = cyl(0.25, 0.25, 0.06, 16, lam(null, 0x2a1a10), 0, 0, 0, clock); rim.rotation.x = Math.PI / 2;
    L.mesh(new THREE.CircleGeometry(0.22, 24), lam(tClock), 0, 0, 0.031, clock);
    L.mesh(new THREE.CircleGeometry(0.012, 8), lam(null, 0x101010), 0, 0, 0.04, clock); }
  const hand = (len, wid, col, z) => { const g = new THREE.Group(); g.position.z = z; clock.add(g); B(wid, len, 0.004, lam(null, col), 0, len / 2 - 0.02, 0, g); return g; };
  const hH = hand(0.12, 0.018, 0x101010, 0.034), hM = hand(0.18, 0.012, 0x101010, 0.037), hS = hand(0.19, 0.005, 0xb01818, 0.04);
  hH.rotation.z = -(3 + 14 / 60) / 12 * Math.PI * 2; hM.rotation.z = -14 / 60 * Math.PI * 2;
  // fluorescent rows (6, two fixtures each); tubes switch from dead grey to white
  const ROWZ = Array.from({ length: ROWS }, (_, i) => 1.6 + i * 2.0);
  const tubeOff = L.basic(null, 0x50565e), rows = [];
  for (const z of ROWZ) {
    const tubes = [];
    for (const x of [-1.8, 1.8]) { B(1.3, 0.08, 0.34, lam(null, 0xb8b8b0), x, HC - 0.05, z, scene); const t = B(1.2, 0.02, 0.24, tubeOff, x, HC - 0.1, z, scene); tubes.push(t); }
    const pl = new THREE.PointLight(0xf4f8ff, 0, 8, 1); pl.position.set(0, HC - 0.6, z); scene.add(pl);
    rows.push({ tubes, pl, mOn: L.basic(null, 0xf8fbff) });
  }
  // barred gate (back wall), chain + padlock at her lock height (set below once Ava's hand is measured)
  const GX = -3.4, GZ = ZB - 0.04;
  { L.plane(2.0, 2.6, lam(null, 0x0c0c10), GX, 1.3, ZB + 2.5, scene, 0);   // dark corridor behind
    L.plane(2.0, 2.5, mFloor, GX, 0.001, ZB + 1.25, scene, 0, -Math.PI / 2);
    for (const s of [-1, 1]) L.plane(2.5, 2.6, lam(null, 0x2a2a30), GX + s * 1.0, 1.3, ZB + 1.25, scene, -s * Math.PI / 2);
    for (const s of [-1, 1]) B(0.1, 2.7, 0.14, mIron, GX + s * 1.04, 1.35, GZ, scene);
    B(2.18, 0.1, 0.14, mIron, GX, 2.65, GZ, scene);
    for (const s of [-1, 1]) { const lx = GX + s * 0.5;
      for (const y of [0.12, 1.0, 2.5]) B(0.98, 0.05, 0.05, mIron, lx, y, GZ, scene);
      for (let k = 0; k < 8; k++) B(0.025, 2.5, 0.025, mIron, lx - 0.44 + k * 0.125, 1.3, GZ, scene);
      B(0.05, 2.5, 0.05, mIron, GX + s * 0.03, 1.3, GZ, scene); }
  }
  const padlock = new THREE.Group(); scene.add(padlock);
  const shackle = L.mesh(new THREE.TorusGeometry(0.022, 0.006, 4, 8, Math.PI), lam(null, 0xb8bcc0), 0, 0.035, 0, padlock);
  B(0.065, 0.065, 0.028, lam(null, 0xc89a30), 0, 0, 0, padlock); B(0.012, 0.02, 0.004, lam(null, 0x101010), 0, -0.01, 0.016, padlock);
  const chain = new THREE.Group(); scene.add(chain);

  // ---------- front glass doors (z=0): static metal frame + glass groups that shake ----------
  const frameM = mMetal;
  for (const x of [-2.25, -0.95, 0.95, 2.25]) B(0.1, 3.25, 0.14, frameM, x, 1.625, 0, scene);
  B(4.6, 0.12, 0.14, frameM, 0, 3.22, 0, scene); B(1.8, 0.1, 0.14, frameM, 0, 2.38, 0, scene);
  for (const s of [-1, 1]) B(1.2, 0.16, 0.14, frameM, s * 1.6, 0.08, 0, scene);
  const mGlass = L.basic(tGlass, 0xa8bcd8, { transparent: true, opacity: 0.13, depthWrite: false, side: DS });
  const dropMats = [], dropMeshes = [], streakMats = [];
  const tStreak = L.cvs(32, 128, (c, w, h) => {   // a few long fast water runs (bright head at the bottom, fading trail above)
    c.clearRect(0, 0, w, h); const r = L.rng(331);
    for (let k = 0; k < 3; k++) { const x = 3 + (r() * 26 | 0), y = 20 + (r() * 100 | 0), len = 14 + (r() * 16 | 0);
      for (let i = 0; i < len; i++) px(c, x, y - i, i < 2 ? '#f0f6ff' : 'rgba(200,220,245,1)', 1, 1); px(c, x, y + 1, '#ffffff', 1, 1); }
  });
  const pane = (w, h, x, y, parent) => {
    L.plane(w, h, mGlass, x, y, 0, parent);
    const t = L.rep(tDrops, w / 0.7, h / 1.4); dropMats.push(t);
    const st = L.rep(tStreak, w / 0.7, h / 2.8); st.userData.ph = streakMats.length * 0.37; streakMats.push(st);
    dropMeshes.push(L.plane(w, h, L.basic(st, 0xd8e6f8, { transparent: true, opacity: 0.45, depthWrite: false, alphaTest: 0.3, side: DS }), x, y, -0.007, parent));
    dropMeshes.push(L.plane(w, h, L.basic(t, 0xc8d8ee, { transparent: true, opacity: 0.4, depthWrite: false, alphaTest: 0.3, side: DS }), x, y, -0.006, parent));
  };
  const glassGroups = [];
  const leaf = (s) => {   // door leaf: pivot at its outer hinge; frame + glass + push bar
    const g = new THREE.Group(); g.position.set(s * 0.475, 0, 0); scene.add(g);
    B(0.07, 2.3, 0.06, frameM, -s * 0.4, 1.15, 0, g); B(0.07, 2.3, 0.06, frameM, s * 0.4, 1.15, 0, g);
    B(0.87, 0.08, 0.06, frameM, 0, 2.29, 0, g); B(0.87, 0.24, 0.06, frameM, 0, 0.12, 0, g);
    pane(0.73, 1.97, 0, 1.25, g);
    B(0.6, 0.04, 0.04, lam(null, 0xb8b4a8), 0, 1.05, 0.07, g); for (const k of [-0.27, 0.27]) B(0.03, 0.03, 0.06, lam(null, 0xb8b4a8), k, 1.05, 0.04, g);
    B(0.03, 0.4, 0.04, lam(null, 0xb8b4a8), -s * 0.34, 1.1, -0.06, g);   // outside pull handle
    glassGroups.push({ g, base: g.position.clone(), k: 1 }); return g;
  };
  leaf(-1); leaf(1);
  for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * 1.6, 0, 0); scene.add(g); pane(1.2, 3.0, 0, 1.68, g); glassGroups.push({ g, base: g.position.clone(), k: 0.6 }); }
  { const g = new THREE.Group(); scene.add(g); pane(1.8, 0.72, 0, 2.8, g); glassGroups.push({ g, base: g.position.clone(), k: 0.4 }); }
  // bloody handprint on the outside of the left leaf (from the zombies)
  const tPrint = await L.loadTex('tex/handprint.png', 128);
  const print = L.plane(0.24, 0.24, L.basic(tPrint, 0xffffff, { alphaTest: 0.4, side: DS }), -0.15, 1.55, -0.012, glassGroups[0].g); print.rotation.z = 0.3;
  // moonlight through the glass on the floor (additive panes with mullion shadows)
  const tSpill = L.cvs(64, 32, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a92c8'; for (const [x0, x1] of [[2, 15], [17, 31], [33, 47], [49, 62]]) c.fillRect(x0, 4, x1 - x0, h - 4); c.fillStyle = '#000'; c.fillRect(0, 14, w, 1); });
  const spill = L.plane(5.2, 4.2, L.basic(tSpill, 0xffffff, { transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), 0.5, 0.004, 2.2, scene, 0, -Math.PI / 2);
  spill.rotation.z = 0.12;
  // streetlamp haze behind the doors: the cop/zombies read as silhouettes against it
  const tGlow = L.cvs(32, 32, (c, w, h) => { const g = c.createRadialGradient(16, 16, 1, 16, 16, 16); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const glow = L.plane(5, 5, L.basic(tGlow, 0x6a86b8, { transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0.8, 2.2, -3.0, scene);

  // ---------- outside: landing, curb, wet street, building across, streetlamps, patrol cars, rain ----------
  L.plane(12, 3.6, lam(L.rep(tSide, 12 / 1.2, 3.6 / 1.2)), 0, 0, -1.8, scene, 0, -Math.PI / 2);
  B(12, 0.15, 0.25, lam(L.rep(tSide, 10, 1)), 0, -0.075, -3.7, scene);
  L.plane(40, 14, lam(L.rep(tAsph, 10, 3.5)), 0, -0.15, -10.6, scene, 0, -Math.PI / 2);
  L.plane(40, 2, lam(L.rep(tSide, 30, 1.5)), 0, -0.05, -16.5, scene, 0, -Math.PI / 2);
  L.plane(40, 12, lam(L.rep(tBuild, 6, 1.5), 0xb0b0b8), 0, 5.8, -17.5, scene);
  const lampPost = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    cyl(0.06, 0.08, 4.2, 6, lam(null, 0x2a2c30), 0, 2.1, 0, g); B(0.9, 0.06, 0.06, lam(null, 0x2a2c30), -0.42, 4.15, 0, g);
    B(0.4, 0.12, 0.22, lam(null, 0x3a3c40), -0.85, 4.1, 0, g); B(0.34, 0.02, 0.16, L.basic(null, 0xe4eeff), -0.85, 4.035, 0, g);
  };
  lampPost(2.4, -3.3); lampPost(-4.5, -12);
  const makeCar = () => {
    const g = new THREE.Group(), mS = lam(tCarSide), mF = lam(tCarFront), mBl = lam(null, 0x16161a), mWh = lam(null, 0xe4e4e0), mWin = lam(tCarWin), mGl = lam(null, 0x1a2234);
    B(4.6, 0.62, 1.8, [mF, mF, mBl, mBl, mS, mS], 0, 0.62, 0, g);
    B(2.3, 0.55, 1.62, [mGl, mGl, mWh, mBl, mWin, mWin], -0.2, 1.2, 0, g);
    B(1.3, 0.12, 0.3, lam(null, 0x5a1418), -0.2, 1.53, -0.0, g); B(0.64, 0.125, 0.31, lam(null, 0x14204a), -0.52, 1.53, 0, g);
    for (const sx of [-1.45, 1.45]) for (const sz of [-0.86, 0.86]) { const w = cyl(0.34, 0.34, 0.24, 10, lam(null, 0x0e0e10), sx, 0.34, sz, g); w.rotation.x = Math.PI / 2; }
    const door = B(1.0, 0.55, 0.05, mWh, 0, 0, 0, null); const hinge = new THREE.Group(); hinge.position.set(0.55, 0.75, 0.92); hinge.rotation.y = -0.75; g.add(hinge); door.position.set(-0.5, 0, 0); hinge.add(door);
    return g;
  };
  { const c1 = makeCar(); c1.position.set(-1.4, -0.15, -6.6); c1.rotation.y = 0.28; scene.add(c1);
    const c2 = makeCar(); c2.position.set(4.6, -0.15, -11.5); c2.rotation.y = -0.5; scene.add(c2); }
  // rain: deterministic falling streaks in front of the station
  const NR = 420, rr = L.rng(321), RAIN = [];
  for (let i = 0; i < NR; i++) RAIN.push([rr() * 14 - 7, rr() * 5.6, -0.25 - rr() * 13, 6 + rr() * 2]);
  const rainPos = new Float32Array(NR * 6), rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rain = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0x9ab0d4, transparent: true, opacity: 0.4, fog: true })); rain.frustumCulled = false; scene.add(rain);
  const setRain = (t) => {
    for (let i = 0; i < NR; i++) { const [x, y0, z, v] = RAIN[i], H = 5.8, y = H - 0.2 - (((H - y0) + t * v) % H);
      rainPos.set([x, y, z, x + 0.03, y + 0.26, z], i * 6); }
    rainGeo.attributes.position.needsUpdate = true;
    for (const d of dropMats) d.offset.y = t * 0.07;   // drops slide DOWN
    for (const d of streakMats) d.offset.y = t * 0.9 + d.userData.ph;   // occasional fast runs
  };

  // ---------- zombies (models' own hands) + the cop ----------
  window.__fx.renderer.localClippingEnabled = true;
  const GLB = {};
  const getG = async (n) => GLB[n] || (GLB[n] = await L.loadModel(`models/${n}.glb`));
  const city = await getG('city-zombie');
  city.scene.traverse((o) => {   // outside.js: the city GLB has no usable UVs -> planar UVs (shirt top half, trousers bottom half)
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const thinTex = await L.loadTex('tex/thin_zombie.png', 256); thinTex.flipY = false; thinTex.needsUpdate = true;
  const GLASS_CLIP = new THREE.Plane(V(0, 0, -1), -0.012);   // nothing of them passes the glass (keeps z <= -0.012)
  async function makeZ(kind, h, matFn, tint = 0xffffff) {
    const g = await getG(kind), root = L.ps1Clone(g.scene);
    root.traverse((o) => { if (!o.isMesh) return;
      if (matFn) o.material = matFn(o.material.name || '', o.material);
      for (const m of (Array.isArray(o.material) ? o.material : [o.material])) { m.clippingPlanes = [GLASS_CLIP]; m.side = DS; m.color.multiply(new THREE.Color(tint)); m.needsUpdate = true; } });
    const wrap = new THREE.Group(); wrap.add(root); root.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(root), k = h / (bb.max.y - bb.min.y);
    root.scale.multiplyScalar(k); root.position.y = -bb.min.y * k;
    const mixer = new THREE.AnimationMixer(root), acts = {};
    const clip = (n) => THREE.AnimationClip.findByName(g.animations, n);
    const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(clip(n)); a.play(); a.setEffectiveWeight(0); return a; })());
    let hip = null; const meshes = []; root.traverse((o) => { if (o.isSkinnedMesh) { if (!hip) hip = o.skeleton.bones[0]; meshes.push(o); } });
    const hip0 = hip.position.clone();
    const bone = (re) => { let b = null; root.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
    const hR = bone(/(hand.?R|RightHand)$/), hL = bone(/(hand.?L|LeftHand)$/), head = bone(/(^head|Head)$/) || bone(/spine.?006$/);
    if (!hR || !hL || !head) throw new Error(`bones ${kind}: ${[hR, hL, head].map((b) => b && b.name)}`);
    scene.add(wrap);
    return { wrap, root, meshes, hR, hL, head, bone, anims: g.animations.map((a) => a.name), dur: (n) => clip(n).duration,
      pose(list) { for (const a of Object.values(acts)) a.setEffectiveWeight(0); for (const [n, t, w] of list) { const a = act(n), d = a.getClip().duration; a.time = ((t % d) + d) % d; a.setEffectiveWeight(w); } mixer.update(0); hip.position.x = hip0.x; hip.position.z = hip0.z; wrap.updateMatrixWorld(true); } };
  }
  // best clip time: sample every clip, keep the frame that scores best (hands forward on the glass / one fist up to knock)
  const BAD = /dying|death|dead|hurt|hit|pain|logo|editpose|run|walk|forward|waddle|enter/i;
  function findPose(z, score, yaws = [0, Math.PI], clips = z.anims.filter((n) => !BAD.test(n))) {
    const keep = [z.wrap.position.clone(), z.wrap.rotation.y]; z.wrap.position.set(0, 0, 0);
    let best = null;
    for (const yaw of yaws) { z.wrap.rotation.y = yaw;
      for (const n of clips) { const d = z.dur(n); for (let i = 0; i <= 48; i++) { const t = d * i / 48; z.pose([[n, t, 1]]); const s = score(z.hL.getWorldPosition(V()), z.hR.getWorldPosition(V()), z.head.getWorldPosition(V())); if (!best || s > best.s) best = { n, t, s, yaw }; } } }
    z.wrap.position.copy(keep[0]); z.wrap.rotation.y = keep[1]; return best;
  }
  const press = (hl, hr, hd) => Math.min(hl.z, hr.z) * 2 - Math.abs((hl.y + hr.y) / 2 - 1.45) * 1.5 - Math.max(0, Math.abs(hl.x - hr.x) - 0.6) - Math.max(0, 1.5 - hd.y) * 3;
  const cityMat = (shirt) => (n) => n.includes('Outfit') ? L.lam(shirt) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x6a2a20);
  // three city zombies (their faces read through the glass; the thin-zombie face is too dark at this distance): plaid, faded blue plaid, mustard
  const ZS = [
    await makeZ('city-zombie', 1.78, cityMat(zTex), 0x9aa8c8),
    await makeZ('city-zombie', 1.84, cityMat(zTex)),
    await makeZ('city-zombie', 1.8, cityMat(zTex), 0xd8c890),
  ];
  const ZP = ZS.map((z, i) => findPose(z, press, [0]));
  // cop: city zombie in a dark-navy uniform; knock pose = right fist forward at head height, left hand down
  const cop = await makeZ('city-zombie', 1.86, cityMat(navyTex));
  const copSkin = []; cop.root.traverse((o) => { if (o.isMesh) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) if (m.map === skinT) copSkin.push(m); });
  const KN = { n: 'Zombie_Idle', t: 0.6, yaw: 0 };   // upright idle; the knocking arm is aimed at the glass by hand (aimBone)
  const attachAt = (bone, obj, Mw) => { bone.add(obj); bone.updateMatrixWorld(true); bone.matrixWorld.clone().invert().multiply(Mw).decompose(obj.position, obj.quaternion, obj.scale); };
  const capG = new THREE.Group(), eyes = new THREE.Group(), badge = new THREE.Group();
  let BADGE_LOCAL = V();
  {
    cop.wrap.position.set(0, 0, 0); cop.wrap.rotation.y = KN.yaw; cop.pose([[KN.n, KN.t, 1]]);
    const hd = cop.head.getWorldPosition(V()), topB = cop.bone(/HeadTop_End$/), tp = topB ? topB.getWorldPosition(V()) : hd.clone().add(V(0, 0.2, 0));
    // skinned vertices in world space (front surfaces for the cap, eyes and badge)
    const pts = []; for (const m of cop.meshes) { const p = V(), n = m.geometry.attributes.position.count; for (let i = 0; i < n; i += 1) { m.getVertexPosition(i, p); pts.push(p.clone().applyMatrix4(m.matrixWorld)); } }
    const frontAt = (x, y, r = 0.025, zmax = 9) => { let z = -9; for (const q of pts) if (Math.abs(q.x - x) < r && Math.abs(q.y - y) < r && q.z > z && q.z < zmax) z = q.z; return z; };
    const up = tp.clone().sub(hd).normalize(), fw = V(0, 0, 1).sub(up.clone().multiplyScalar(up.z)).normalize(), xx = up.clone().cross(fw).normalize();
    // head extents: highest vertex near the head axis -> cap sits on the crown
    let crown = -9; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.05 && Math.abs(q.z - hd.z) < 0.08 && q.y > crown) crown = q.y;
    let noseZ = -9, noseY = hd.y; for (const q of pts) if (Math.abs(q.x - hd.x) < 0.012 && q.y > hd.y && q.y < crown && q.z > noseZ) { noseZ = q.z; noseY = q.y; }
    const mNavy = lam(null, 0x1a2244), mBlk = lam(null, 0x0c0c0e), mGold = lam(null, 0xd8b850);
    // peaked police cap scaled to the head: band + slightly flared, low crown with a soft rounded top, short black visor
    // angled down, small gold cap badge. Origin = bottom of the band at the head centre, visor toward +z.
    let sx = 0, sz = 0, sn = 0; for (const q of pts) if (q.y > crown - 0.07 && Math.abs(q.x - hd.x) < 0.15 && Math.abs(q.z - hd.z) < 0.2) { sx += q.x; sz += q.z; sn++; }
    const cx = sn ? sx / sn : hd.x, cz = sn ? sz / sn : hd.z;
    let hw = 0, hdp = 0; for (const q of pts) if (q.y > crown - 0.09 && q.y < crown - 0.04 && Math.abs(q.z - cz) < 0.14 && Math.abs(q.x - cx) < 0.14) { hw = Math.max(hw, Math.abs(q.x - cx)); hdp = Math.max(hdp, Math.abs(q.z - cz)); }
    const R = Math.min(0.1, Math.max(0.07, hw || 0.085)), DZ = Math.min(1.25, Math.max(1.0, (hdp || R) / R));
    const cylG = (r0, r1, h, n = 12) => new THREE.CylinderGeometry(r0, r1, h, n);
    const band = L.mesh(cylG(R * 1.04, R * 1.04, 0.032), mBlk, 0, 0.016, 0, capG);
    const crownM = L.mesh(cylG(R * 1.2, R * 1.05, 0.038), mNavy, 0, 0.051, 0, capG);
    const dome = L.mesh(new THREE.SphereGeometry(R * 1.2, 12, 4, 0, Math.PI * 2, 0, Math.PI / 2), mNavy, 0, 0.07, 0, capG); dome.scale.y = 0.18;
    for (const m of [band, crownM, dome]) m.scale.z = DZ;
    L.mesh(cylG(R * 1.045, R * 1.045, 0.006), mGold, 0, 0.033, 0, capG).scale.z = DZ;                // thin gold cord above the band
    const visor = L.mesh(new THREE.CylinderGeometry(R * 0.95, R * 0.95, 0.008, 10, 1, false, -Math.PI / 2, Math.PI), mBlk, 0, 0.004, R * DZ * 0.55, capG);
    visor.scale.z = 0.75; visor.rotation.x = 0.38;                                                     // short half-disc peak, tipped down
    B(0.028, 0.03, 0.006, mGold, 0, 0.05, R * 1.13 * DZ, capG).rotation.x = -0.15;                   // cap badge on the crown front
    const capC = V(cx, crown - 0.055, cz);
    attachAt(cop.head, capG, new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)).setPosition(capC));
    const mEye = L.basic(null, 0xf4f4ee);
    for (const s of [-1, 1]) { const ey = noseY + 0.03, ex = hd.x + s * 0.032, ez = frontAt(ex, ey, 0.012); L.mesh(new THREE.PlaneGeometry(0.026, 0.014), mEye, s * 0.032, 0, 0, eyes).userData.z = ez; }
    { const ez = Math.max(frontAt(hd.x + 0.032, noseY + 0.03, 0.012), frontAt(hd.x - 0.032, noseY + 0.03, 0.012));
      attachAt(cop.head, eyes, new THREE.Matrix4().makeBasis(V(1, 0, 0), V(0, 1, 0), V(0, 0, 1)).setPosition(V(hd.x, noseY + 0.03, ez + 0.004))); }
    const sp = cop.bone(/Spine2$/), s2 = sp.getWorldPosition(V());
    const by = s2.y + 0.04, bxL = s2.x + 0.085, bxR = s2.x - 0.085;
    const zL = frontAt(bxL, by + 0.03, 0.03), zR = frontAt(bxR, by, 0.03);
    const plate = L.plane(0.1, 0.026, L.basic(tPlate), 0, 0, 0, null); const shield = L.plane(0.06, 0.06, L.basic(tShield, 0xffffff, { alphaTest: 0.5 }), 0, 0, 0, null);
    const gp = new THREE.Group(); gp.add(plate); const gs = new THREE.Group(); gs.add(shield);
    attachAt(sp, gp, new THREE.Matrix4().makeTranslation(s2.x - (bxL - s2.x), by, Math.max(zL, zR) + 0.02));
    attachAt(sp, gs, new THREE.Matrix4().makeTranslation(bxL, by + 0.035, Math.max(zL, zR) + 0.02));
    badge.userData.plate = plate; BADGE_LOCAL = V(bxR, by, zR + 0.012);
    void BADGE_LOCAL;
  }

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const palm = (clip, x) => { ch.root.position.set(0, 0, 0); ch.root.rotation.set(0, 0, 0); ch.pose(0, L.still(clip, x)); ch.root.updateMatrixWorld(true); return ch.hand('R').localToWorld(V(0, 0.78, 0)); };
  const KEY = palm('turn_key', 15 / 30);
  const LOCK = V(GX + 0.03, KEY.y, GZ - 0.075);
  const AVA02 = V(LOCK.x - KEY.x, 0, LOCK.z - KEY.z);
  padlock.position.copy(LOCK);
  { const mC = lam(null, 0x9a9ea4); for (let k = 0; k < 7; k++) { const l = L.mesh(new THREE.TorusGeometry(0.018, 0.005, 3, 6), mC, GX - 0.09 + k * 0.03, LOCK.y + 0.06 + (k % 2) * 0.004, GZ - 0.045, chain); l.rotation.y = k % 2 ? Math.PI / 2 : 0; } }

  // ---------- state ----------
  function setState({ hero = true, zs = false, copOn = false, lit = 0, padOpen = false } = {}) {
    ch.root.visible = hero; ch.root.rotation.set(0, 0, 0);
    ZS.forEach((z) => { z.wrap.visible = zs; }); xZone.visible = false; cop.wrap.visible = copOn; eyes.visible = false;
    shackle.position.y = padOpen ? 0.055 : 0.035;
    for (const g of glassGroups) { g.g.position.copy(g.base); g.g.rotation.set(0, 0, 0); }
    copSkin.forEach((m) => m.color.set(0xffffff)); flash.intensity = 0; top.intensity = 0;
    dropMeshes.forEach((m) => { m.visible = true; }); fill.intensity = 0.45; mGlass.opacity = 0.13; mGlass.map = tGlass;
    setLit(lit);
  }
  // lit: number of rows on (fractional row = flicker phase); 0 = dark night lobby
  function setLit(lit) {
    rows.forEach((r, i) => { const on = lit > i; r.tubes.forEach((t) => { t.material = on ? r.mOn : tubeOff; }); r.pl.intensity = on ? 7 : 0; });
    const k = Math.min(1, lit / ROWS);
    hemi.color.set(0x7088c0).lerp(new THREE.Color(0xfff4e4), k); hemi.groundColor.set(0x2a2830).lerp(new THREE.Color(0x7a7262), k); hemi.intensity = 1.15 + 1.0 * k;
    spill.visible = k < 0.5; lampL.intensity = 3.2 * (1 - k * 0.5);
  }
  // only the glass shakes on hits/knocks (global s)
  function rattle(t, k = 1) {
    let a = 0; for (const t0 of GLASS_HITS) { const d = t - t0; if (d >= 0 && d < 0.5) a += Math.exp(-d * 10) * Math.cos(d * 60); }
    for (const g of glassGroups) { g.g.position.z = g.base.z - 0.008 * k * g.k * a; g.g.rotation.x = 0.002 * k * g.k * a; }
    return a;
  }
  const pulse = (t, hits, w = 0.08) => { let p = 0; for (const h of hits) { const d = t - h; p = Math.max(p, Math.exp(-((d / w) ** 2))); } return p; };
  // zombie pressed on the glass at (x, yaw): pose near its best "hands forward" frame, palms slam on its hits
  // zombie pressed on the glass at (x, yaw), facing INTO the lobby (+z): idle body ~0.4 m behind the glass, both arms aimed
  // at the glass at shoulder height (the models' own hands, palms flattened by the clip plane); they slam on their hits
  const IDLE = ['Zombie_Idle', 'Zombie_Idle', 'Zombie_Idle'], IDT = [0.4, 1.3, 2.2];
  const armsOf = (z) => [z.hL, z.hR].map((h) => [h, h.parent, h.parent.parent]);
  ZS.forEach((z, i) => { z.wrap.position.set(0, 0, 0); z.wrap.rotation.y = 0; z.pose([[IDLE[i], IDT[i], 1]]); for (const [, f, a] of armsOf(z)) { f.userData.q0 = f.quaternion.clone(); a.userData.q0 = a.quaternion.clone(); } });
  function pressZ(i, x, yaw, t, hits, lt) {
    const z = ZS[i], p = pulse(t, hits);
    for (const [, f, a] of armsOf(z)) { f.quaternion.copy(f.userData.q0); a.quaternion.copy(a.userData.q0); }
    z.wrap.position.set(x, 0, -0.4 + 0.05 * p); z.wrap.rotation.y = yaw;
    z.pose([[IDLE[i], IDT[i], 1]]);
    for (const [h, f, a] of armsOf(z)) {
      const sh = a.getWorldPosition(V()), out = Math.sign(sh.x - x) || 1, k = h === z.hL ? 0 : 1;
      const tgt = V(sh.x + out * 0.12, sh.y + 0.08 + 0.05 * Math.sin(lt * 3 + i * 2 + k), -0.01 - 0.07 * (1 - p) - 0.03 * k * (1 - p));
      aimBone(a, h, tgt); aimBone(f, h, tgt);
    }
    z.wrap.updateMatrixWorld(true); void lt;
  }
  // cop knocking at x: right fist on the glass on each knock
  // rotate bone so that the direction bone->tip points at target (world), keeps the rest of the chain
  function aimBone(bone, tip, target) {
    const bp = bone.getWorldPosition(V()), cur = tip.getWorldPosition(V()).sub(bp).normalize(), want = target.clone().sub(bp).normalize();
    const qW = new THREE.Quaternion().setFromUnitVectors(cur, want), bw = bone.getWorldQuaternion(new THREE.Quaternion()), pw = bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(pw.invert().multiply(qW.multiply(bw))); bone.updateMatrixWorld(true);
  }
  // cop knocking at x: idle body ~0.45 m behind the glass, right fist aimed at the glass at head height, taps on each knock
  function copKnock(x, t, hits, knock = true) {
    const p = pulse(t, hits, 0.06);
    const fore = cop.hR.parent, arm = fore.parent;
    if (!arm.userData.q0) { arm.userData.q0 = arm.quaternion.clone(); fore.userData.q0 = fore.quaternion.clone(); }
    arm.quaternion.copy(arm.userData.q0); fore.quaternion.copy(fore.userData.q0);   // undo last aim (the mixer skips unchanged tracks)
    cop.wrap.position.set(x, 0, -0.5); cop.wrap.rotation.y = KN.yaw;
    cop.pose([[KN.n, KN.t, 1]]);
    if (!knock) return;
    const hp = cop.head.getWorldPosition(V());
    const tgt = V(hp.x - 0.38, hp.y - 0.02, -0.03 - 0.1 * (1 - p));
    aimBone(arm, cop.hR, tgt); aimBone(fore, cop.hR, tgt); cop.wrap.updateMatrixWorld(true);
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.03, 60);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); c.updateMatrixWorld(); };
  const vignette = (o, k = 0.4) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.28, LW / 2, LH * 0.45, LH * 0.64);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  const ov = (k) => (lt, dt, a, o) => vignette(o, k);
  // diagram label: 1 px box, small pixel text, thin line to the target
  const label = (o, text, x, y, col, tx, ty, n = 99) => {
    const c = o.tctx, s = text.slice(0, n), w = text.length * 6 + 10, h = 14;
    c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 0.5, y + (ty > y ? h / 2 : -h / 2) + 0.5); c.lineTo(tx + 0.5, ty + 0.5); c.stroke();
    c.fillStyle = col; c.fillRect(tx - 1, ty - 1, 3, 3);
    c.fillStyle = 'rgba(6,8,14,0.85)'; c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeRect(Math.round(x - w / 2) + 0.5, Math.round(y - h / 2) + 0.5, w - 1, h - 1);
    if (s) o.pixelText(s, x, y + 1, 9, col, 0, 0, { bold: 0, spacing: 1 });
  };
  // big phone-readable label: bold dark plate, 2 px border, RE font at sc 2-3, popping in, thin line to the target
  const bigLabel = (o, text, x, y, col, tx, ty, age, sc = 2) => {
    const c = o.tctx, k = age < 0.12 ? 0.6 + 0.4 * (age / 0.12) : 1, w = Math.round((reWidth(text, sc) + 20) * k), h = Math.round((sc * 9 + 12) * k);
    c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + (ty > y ? h / 2 : -h / 2)); c.lineTo(tx, ty); c.stroke();
    c.fillStyle = col; c.fillRect(tx - 3, ty - 3, 6, 6);
    c.fillStyle = 'rgba(6,6,12,0.9)'; c.fillRect(x - w / 2, y - h / 2, w, h);
    c.fillStyle = col; c.fillRect(x - w / 2, y - h / 2, w, 2); c.fillRect(x - w / 2, y + h / 2 - 2, w, 2); c.fillRect(x - w / 2, y - h / 2, 2, h); c.fillRect(x + w / 2 - 2, y - h / 2, 2, h);
    if (k >= 1) reText(c, text, x, y, sc, col, { outline: '#000000' });
  };
  const angTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
  const out = {};

  // 02 (2.55-5.2): dark lobby, she snaps the padlock on the barred gate (turn_key, click on "locked") and turns around
  { const c = cam(50), t0 = 2.55, tk = 0.05;
    const C0 = V(-1.35, 1.5, 10.2), C1 = V(-1.45, 1.47, 10.4);
    out['02_hall'] = { scene, camera: c, overlay: ov(0.4), update(lt, t) {
      setState({ padOpen: t < T_CLICK }); setRain(t);
      look(c, C0.clone().lerp(C1, lt / 2.65), V(-3.25, 1.05, 12.4));
      ch.root.position.copy(AVA02);
      const turn = L.smooth((lt - 1.35) / 0.6), face = angTo(AVA02, c.position);
      ch.root.rotation.y = face * turn;
      const talk = mouthAt(t, lt > 1.0 ? 'smile' : 'neutral');
      ch.pose(lt, [L.seg('idle', -99, { loop: true }), L.seg('turn_key', tk, { fade: 0.1 }), L.seg('idle', 1.2, { loop: true, from: 0.4, fade: 0.3 })],
        [[-99, 'open', talk], [0.75, 'half', talk], [0.95, 'happy', mouthAt(t, 'smileOpen')], [1.3, 'open', talk], [2.1, lt > 2.2 && lt < 2.3 ? 'blink' : 'relaxed', mouthAt(t, 'smile')]]);
      if (turn > 0.5) ch.lookAt(c, L.smooth((turn - 0.5) * 2), 40);
      void t0;
    } };
  }
  // 03 (5.2-7.6): frontal medium, confident: hands on hips -> smug wink; counter + columns + red herb behind
  { const c = cam(46), P = V(0.55, 0, 5.3);
    out['03_safe'] = { scene, camera: c, overlay: ov(0.4), update(lt, t) {
      setState({}); setRain(t);
      look(c, V(0.45, 1.4, 2.6 - lt * 0.05), V(0.5, 1.3, 5.3));
      ch.root.position.copy(P); ch.root.rotation.y = Math.PI;
      const eyes = lt > 0.55 && lt < 0.65 ? 'blink' : lt > 1.9 ? 'wink' : lt > 1.1 ? 'relaxed' : 'open';
      ch.pose(lt, [L.seg('hands_on_hips', 0, { from: 0.3, speed: 0.8 }), L.seg('smug', 1.05, { from: 0.1, fade: 0.25 })], [[-99, eyes, mouthAt(t, lt > 1.1 ? 'cat' : 'smile')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  // 04 (7.6-9.35): reverse: the glass doors from inside, 3 zombies pressed on the glass, palms slam on HITS04 (only the glass shakes)
  { const c = cam(50);
    const HZ = [[HITS04[0], HITS04[3]], [HITS04[1], HITS04[4]], [HITS04[2]]];
    out['04_isnt'] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ hero: false, zs: true }); setRain(t); rattle(t, 1.2); fill.intensity = 1.4;   // lobby-side light so their faces read through the glass
      pressZ(0, -0.6, 0.12, t, HZ[0], lt); pressZ(1, 0.02, -0.05, t, HZ[1], lt); pressZ(2, 0.7, -0.15, t, HZ[2], lt);
      look(c, V(0.05, 1.45, 3.3 - lt * 0.12), V(0.05, 1.38, 0));
    } };
  }
  // 11 (30.85-34.2): the lobby toward the glass doors (empty, rain); "GLASS" label on "glass", red X zone + "NEVER" on "never"
  const tX = L.cvs(64, 48, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = '#ff3a2a'; c.lineWidth = 2;
    for (let x = 2; x < w - 2; x += 6) { c.beginPath(); c.moveTo(x, 2); c.lineTo(Math.min(w - 2, x + 3), 2); c.moveTo(x, h - 2); c.lineTo(Math.min(w - 2, x + 3), h - 2); c.stroke(); }
    for (let y = 2; y < h - 2; y += 6) { c.beginPath(); c.moveTo(2, y); c.lineTo(2, Math.min(h - 2, y + 3)); c.moveTo(w - 2, y); c.lineTo(w - 2, Math.min(h - 2, y + 3)); c.stroke(); }
    c.lineWidth = 5; c.beginPath(); c.moveTo(12, 8); c.lineTo(w - 12, h - 8); c.moveTo(w - 12, 8); c.lineTo(12, h - 8); c.stroke();
  });
  const xZone = L.plane(4.4, 3.2, L.basic(tX, 0xffffff, { transparent: true, depthWrite: false, alphaTest: 0.2 }), 0, 0.012, 1.9, scene, 0, -Math.PI / 2);
  xZone.visible = false;
  { const c = cam(55), t0 = 30.85, tG = 31.71 - t0, tN = 32.47 - t0;
    out['11_lobby'] = { scene, camera: c, update(lt, t) {
      setState({ hero: false }); setRain(t);
      dropMeshes.forEach((m) => { m.visible = false; });   // user: the far glass twinkled -> steady glass in this wide shot
      look(c, V(1.3, 2.35, 10.4 - lt * 0.04), V(0.0, 1.0, 0.5));
      const k = L.smooth((lt - tN) / 0.12); xZone.visible = lt > tN; xZone.scale.setScalar(0.85 + 0.15 * k);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.4);
      if (lt > tG) { const [tx, ty] = L.toScreen(c, 0.45, 1.9, 0); bigLabel(o, 'GLASS', 240, 180, '#ff5a40', tx, ty, lt - tG, 3); }
      if (lt > tN) { const [tx, ty] = L.toScreen(c, -0.9, 0.02, 1.9); bigLabel(o, 'NEVER', 180, 345, '#ff3a2a', tx, ty, lt - tN, 3); }
    } };
  }
  // 13 (38.6-42.9): insert of the wall clock at 3:14 (second hand ticks); cut on "someone" to the glass doors:
  // cop silhouette behind the wet glass, streetlight backlight, dead patrol car; knocks on "knocks"
  { const c = cam(40), t0 = 38.6, tCut = 39.88 - t0;   // cut on "someone"
    out['13_knock'] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ hero: false, copOn: lt >= tCut }); setRain(t); rattle(t, 1);
      const sec = 37 + TICKS13.filter((x) => t >= x).length; hS.rotation.z = -sec / 60 * Math.PI * 2;
      if (lt < tCut) { c.fov = 40; c.updateProjectionMatrix(); look(c, V(3.28, 2.72, ZB - 1.15 + lt * 0.06), V(3.3, 2.74, ZB)); return; }
      copSkin.forEach((m) => m.color.set(0x3a4048));
      copKnock(0.35, t, KNOCK13);
      c.fov = 45; c.updateProjectionMatrix();
      look(c, V(0.15, 1.5, 4.0 - (lt - tCut) * 0.1), V(0.15, 1.45, 0));
    } };
  }
  // 14 (42.9-46.7): near the glass, Ava from behind in the foreground; the cop (face in shadow under the visor) knocks
  { const c = cam(46), P = V(-0.9, 0, 1.5);
    out['14_cop'] = { scene, camera: c, overlay: ov(0.42), update(lt, t) {
      setState({ copOn: true }); setRain(t); rattle(t, 1);
      copSkin.forEach((m) => m.color.set(0x3a4048));
      copKnock(0.55, t, KNOCK14);
      ch.root.position.copy(P); ch.root.rotation.y = angTo(P, V(0.3, 0, -0.3));
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.2, speed: 0.7 })], [[-99, 'open', 'neutral']]);
      look(c, V(-1.35, 1.72, 3.0 + lt * 0.03), V(0.55, 1.5, -0.3));
    } };
  }
  // 16 (51.85-54.0): close on the cop behind the glass; lightning lights his grey face + white eyes; on "vickers" close-up of the badge
  const flashK = (t) => { let k = 0; for (const [h, a] of [[FLASH16, 1], [FLASH16 + 0.2, 0.7], [52.86, 0.5]]) { const d = t - h; if (d > -0.04) k = Math.max(k, a * (d < 0 ? 1 + d / 0.04 : Math.exp(-d * 9))); } return k; };
  { const c = cam(38), t0 = 51.85, tV = 52.84 - t0;
    out['16_badge'] = { scene, camera: c, update(lt, t) {
      setState({ hero: false, copOn: true }); setRain(t);
      dropMeshes.forEach((m) => { m.visible = false; }); mGlass.opacity = 0.07; mGlass.map = null;   // close-up: clean thin wet film, no blocky drops
      const f = flashK(t);
      copKnock(0.3, t, [], false);
      copSkin.forEach((m) => m.color.set(0x2a2e34).lerp(new THREE.Color(0xd8e0e0), Math.min(1, f * 1.4)));
      eyes.visible = true; eyes.children.forEach((e) => e.material.color.setScalar(0.35 + 0.65 * Math.min(1, f * 1.5)));
      flash.intensity = 3.5 * f; scene.background.set(BG).lerp(new THREE.Color(0x8a9ac8), f * 0.6);
      cop.wrap.updateMatrixWorld(true);
      const hd = cop.head.getWorldPosition(V()), bp = badge.userData.plate.getWorldPosition(V());
      if (lt < tV) { c.fov = 38; c.updateProjectionMatrix(); look(c, V(hd.x + 0.05, hd.y - 0.12, 1.1 - lt * 0.06), V(hd.x, hd.y - 0.17, hd.z)); }
      else { c.fov = 30; c.updateProjectionMatrix(); const k = L.smooth((lt - tV) / 0.5); look(c, V(bp.x + 0.02, bp.y + 0.01, bp.z + 0.5 - 0.06 * k), bp); }
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45); const f = flashK(51.85 + lt);
      if (f > 0.02) { o.tctx.fillStyle = `rgba(200,215,255,${0.22 * f})`; o.tctx.fillRect(0, 0, LW, LH); }
    } };
  }
  // 17 (54.0-58.9): still knocking (glass shakes); on "light" the fluorescent rows clack on one by one toward camera, lobby lit; Ava turns, surprised
  { const c = cam(52), P = V(0.15, 0, 5.4), CP = V(1.0, 1.75, 8.3), t0 = 54.0;
    out['17_lights'] = { scene, camera: c, overlay: ov(0.35), update(lt, t) {
      let lit = 0; ROW_T.forEach((rt, i) => { const d = t - rt; if (d >= 0 && !(d > 0.05 && d < 0.09)) lit = i + 1; else if (d >= 0) lit = i; });
      setState({ copOn: true, lit }); setRain(t); rattle(t, 1);
      copSkin.forEach((m) => m.color.set(0x2a2e34)); copKnock(0.3, t, KNOCK17);
      look(c, CP, V(-0.05, 1.5, 0.5));
      const tT = T_LIGHT + 0.5 - t0, k = L.smooth((lt - tT) / 0.4);
      const a0 = angTo(P, V(0, 0, 0)), a1 = angTo(P, CP) - Math.PI * 2;
      ch.root.position.copy(P); ch.root.rotation.y = a0 + (a1 - a0) * k;
      const talk = mouthAt(t, lt > tT ? 'gasp' : 'neutral');
      ch.pose(lt, [L.seg('idle', 0, { loop: true, from: 0.6, speed: 0.6 }), L.seg('surprised', tT, { fade: 0.15 })],
        [[-99, 'open', talk], [T_LIGHT - t0, 'surprised', talk], [tT + 0.5, 'shocked', mouthAt(t, 'gasp')]]);
      if (k > 0) ch.lookAt(c, k, 40);
    } };
  }
  // 18 (58.9-60.7): frontal, white light above; "oh no" (shocked) -> nervous smile, scratching her head
  { const c = cam(40), P = V(0.15, 0, 5.4), CP = V(1.0, 1.75, 8.3);
    out['18_fudge'] = { scene, camera: c, overlay: ov(0.3), update(lt, t) {
      setState({ copOn: true, lit: ROWS }); setRain(t);
      copSkin.forEach((m) => m.color.set(0x2a2e34)); copKnock(0.3, t, []);
      top.position.set(P.x, 3.0, P.z + 0.3); top.intensity = 4;
      const a1 = angTo(P, CP); ch.root.position.copy(P); ch.root.rotation.y = a1;
      const d = V(Math.sin(a1), 0, Math.cos(a1));
      look(c, V(P.x + d.x * 2.0, 1.48, P.z + d.z * 2.0), V(P.x, 1.33, P.z));
      const tF = 60.01 - 58.9;
      const eyes = lt < 0.5 ? 'shocked' : lt < tF ? 'surprised' : lt > 1.45 && lt < 1.52 ? 'blink' : 'happy';
      ch.pose(lt, [L.seg('shrug', 0, { from: 0.25, speed: 0.5 }), L.seg('scratch_head', tF - 0.1, { fade: 0.25 })], [[-99, eyes, mouthAt(t, lt < 0.17 ? 'bigShock' : lt < tF ? 'gasp' : 'smile')]]);
      ch.lookAt(c, 1, 40);
    } };
  }
  return out;
}

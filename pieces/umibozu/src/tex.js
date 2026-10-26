// =====================================================================
//  TEXTURES — all drawn in code, seeded: gravel and earth, basalt with cracks and lichen, cedar bark and needles,
//  the woodcutter's kasuri indigo, her robe, the jorō abdomen, planks, stone. Neutral-ish so vertex colours can tint them.
// =====================================================================
const TX = {};
function txCanvas(key, w, h, draw, rep = [1, 1], srgb = true) {
  if (TX[key]) return TX[key];
  const t = g3Tex((x) => draw(x, w, h, RNG('tx', key)), w, h, srgb); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.magFilter = THREE.LinearFilter; t.anisotropy = 4; return (TX[key] = t);
}
const blob = (x, cx, cy, r, R, k = 7) => { x.beginPath(); for (let i = 0; i <= k; i++) { const a = (i / k) * TAU, rr = r * (0.75 + R.f() * 0.4); i ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.8); } x.closePath(); };
const tile = (x, w, h, f) => { for (const ox of [-w, 0, w]) for (const oy of [-h, 0, h]) { x.save(); x.translate(ox, oy); f(); x.restore(); } };
// gravel and earth: a dark bed, thousands of pebbles lit from the top
function texGravel() {
  return txCanvas('gravel', 512, 512, (x, w, h, R) => {
    x.fillStyle = '#4a4036'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(2, 9) * (R.f() < 0.1 ? 1.8 : 1), base = R.pick(['#8a8072', '#6f665a', '#9d927f', '#5e564c', '#b3a690', '#7c6a55', '#857b6c']);
      const sub = RNG('gp', i);
      tile(x, w, h, () => { blob(x, cx, cy + r * 0.25, r, sub); x.fillStyle = 'rgba(20,16,12,0.55)'; x.fill(); blob(x, cx, cy, r, RNG('gp', i)); x.fillStyle = base; x.fill(); blob(x, cx - r * 0.2, cy - r * 0.25, r * 0.55, RNG('gp2', i)); x.fillStyle = 'rgba(255,248,230,0.22)'; x.fill(); });
    }
  }, [36, 36]);
}
// earth with leaf litter and moss (for the steep banks and the plateau)
function texEarth() {
  return txCanvas('earth', 512, 512, (x, w, h, R) => {
    x.fillStyle = '#6a5a48'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(10, 40); x.fillStyle = R.pick(['rgba(60,48,36,0.35)', 'rgba(120,110,80,0.25)', 'rgba(70,90,60,0.35)', 'rgba(40,34,28,0.3)']); tile(x, w, h, () => { blob(x, cx, cy, r, RNG('eb', i)); x.fill(); }); }
    for (let i = 0; i < 1600; i++) { const cx = R.r(0, w), cy = R.r(0, h), a = R.r(0, TAU), l = R.r(4, 12); x.strokeStyle = R.pick(['#8c6a3e', '#a8834e', '#5b4630', '#7d8a5a', '#3a3026']); x.lineWidth = R.r(1.5, 4); tile(x, w, h, () => { x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); x.stroke(); }); }
  }, [30, 30]);
}
// basalt: grey, vertical cracks, horizontal joints, lichen and moss speckle, dark wet streaks
function texBasalt() {
  return txCanvas('basalt', 256, 512, (x, w, h, R) => {
    const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#7d827f'); g.addColorStop(0.5, '#9a9f9a'); g.addColorStop(1, '#6e7370'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = R.pick(['rgba(40,44,42,0.25)', 'rgba(200,205,195,0.18)', 'rgba(90,110,80,0.35)', 'rgba(150,160,120,0.3)']); x.fillRect(R.r(0, w), R.r(0, h), R.r(2, 8), R.r(2, 10)); }
    for (let i = 0; i < 14; i++) { let px = R.r(0, w), py = 0; x.strokeStyle = 'rgba(25,28,26,0.6)'; x.lineWidth = R.r(1, 3); x.beginPath(); x.moveTo(px, py); while (py < h) { py += R.r(10, 30); px += R.n(6); x.lineTo(px, py); } x.stroke(); }
    for (let i = 0; i < 6; i++) { const y = R.r(0, h); x.fillStyle = 'rgba(25,28,26,0.5)'; x.fillRect(0, y, w, R.r(2, 4)); x.fillStyle = 'rgba(220,225,215,0.2)'; x.fillRect(0, y - 2, w, 2); }
    for (let i = 0; i < 10; i++) { const cx = R.r(0, w); const g2 = x.createLinearGradient(0, 0, 0, h); g2.addColorStop(0, 'rgba(20,30,30,0)'); g2.addColorStop(0.6, 'rgba(20,30,30,0.35)'); g2.addColorStop(1, 'rgba(20,30,30,0.1)'); x.fillStyle = g2; x.fillRect(cx, 0, R.r(6, 22), h); }
    for (let i = 0; i < 60; i++) { x.fillStyle = R.pick(['rgba(110,130,70,0.55)', 'rgba(80,100,60,0.5)', 'rgba(170,175,120,0.45)']); blob(x, R.r(0, w), R.r(0, h), R.r(3, 12), RNG('lich', i)); x.fill(); }
  }, [1, 1]);
}
function texBark() {
  return txCanvas('bark', 128, 256, (x, w, h, R) => {
    x.fillStyle = '#6a4a36'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) { let px = R.r(0, w); x.strokeStyle = R.pick(['#3e2a1e', '#8a6448', '#54392a', '#9a7a5a']); x.lineWidth = R.r(2, 6); x.beginPath(); x.moveTo(px, 0); for (let y = 0; y < h; y += 16) { px += R.n(3); x.lineTo(px, y); } x.stroke(); }
  }, [1, 2]);
}
function texNeedles() {
  return txCanvas('needles', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#3e5232'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const cx = R.r(0, w), cy = R.r(0, h), a = R.r(1.2, 1.9), l = R.r(5, 14); x.strokeStyle = R.pick(['#2a3a24', '#55703f', '#6d8a4c', '#1e2a1a', '#4a6338']); x.lineWidth = R.r(1, 2.5); tile(x, w, h, () => { x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); x.stroke(); }); }
  }, [2, 2]);
}
// kasuri indigo: dark indigo with small broken white marks in rows
function texKasuri() {
  return txCanvas('kasuri', 128, 128, (x, w, h, R) => {
    x.fillStyle = '#26324c'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(16,22,36,0.4)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(4, 10)); }
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const cx = c * 16 + (r % 2) * 8, cy = r * 16; x.fillStyle = 'rgba(214,220,226,0.85)'; x.fillRect(cx + 2, cy + 6, 6, 2); x.fillRect(cx + 4, cy + 4, 2, 6); }
  }, [3, 3]);
}
function texCloth(key, base, line, rep = [2, 2]) {
  return txCanvas(key, 64, 64, (x, w, h, R) => { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let i = 0; i < 200; i++) { x.fillStyle = line; x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(2, 6)); } }, rep);
}
// her robe: pale silk with a faint web pattern
function texRobe() {
  return txCanvas('robe', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#e4dfd0'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { x.fillStyle = 'rgba(160,150,130,0.12)'; x.fillRect(R.r(0, w), R.r(0, h), 1, R.r(6, 20)); }
    const web = (cx, cy, r) => { x.strokeStyle = 'rgba(120,112,100,0.45)'; x.lineWidth = 1.5; for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); x.stroke(); } for (let j = 1; j < 5; j++) { x.beginPath(); for (let k = 0; k <= 8; k++) { const a = (k / 8) * TAU, rr = (r * j) / 5; k ? x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) : x.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.stroke(); } };
    web(64, 64, 52); web(192, 180, 60); web(200, 40, 30); web(50, 200, 34);
  }, [1, 2]);
}
// the jorō abdomen: bands of yolk and blue-black running along, a red patch near the tip (u along, v around)
function texJoro() {
  return txCanvas('joro', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#d8b440'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const y = i * 28 + 8; x.fillStyle = i % 2 ? '#141a2e' : '#e8c34a'; x.beginPath(); x.moveTo(0, y); for (let px = 0; px <= w; px += 16) x.lineTo(px, y + Math.sin(px * 0.05 + i) * 5); x.lineTo(w, y + 14); for (let px = w; px >= 0; px -= 16) x.lineTo(px, y + 14 + Math.sin(px * 0.05 + i + 1) * 5); x.fill(); }
    x.fillStyle = '#a8361a'; x.fillRect(0, 0, w, 22); x.fillStyle = '#6e1d0c'; x.fillRect(0, 0, w, 8);
    for (let i = 0; i < 400; i++) { x.fillStyle = 'rgba(20,20,30,0.25)'; x.fillRect(R.r(0, w), R.r(0, h), 2, 2); }
  }, [1, 1]);
}
function texPlank() {
  return txCanvas('plank', 256, 256, (x, w, h, R) => {
    for (let i = 0; i < 8; i++) { x.fillStyle = R.pick(['#7a5a3a', '#6a4c30', '#8a6a46', '#5e4430']); x.fillRect(0, i * 32, w, 32); x.fillStyle = 'rgba(20,14,10,0.6)'; x.fillRect(0, i * 32, w, 2);
      for (let k = 0; k < 14; k++) { x.strokeStyle = 'rgba(40,28,18,0.35)'; x.lineWidth = 1; x.beginPath(); const yy = i * 32 + R.r(4, 30); x.moveTo(0, yy); for (let px = 0; px < w; px += 32) x.lineTo(px, yy + R.n(2)); x.stroke(); } }
  }, [1, 1]);
}
function texStone() {
  return txCanvas('stone', 128, 128, (x, w, h, R) => {
    x.fillStyle = '#8a8c84'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 500; i++) { x.fillStyle = R.pick(['rgba(40,44,40,0.3)', 'rgba(200,200,190,0.25)', 'rgba(90,110,70,0.4)']); x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 5), R.r(1, 5)); }
    for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(80,100,60,0.5)'; blob(x, R.r(0, w), R.r(0, h), R.r(4, 14), RNG('st', i)); x.fill(); }
  }, [1, 1]);
}
const TXM = (o) => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.9, metalness: 0 }, o));
// pale scales: overlapping rounded plates, some lifted (dark undersides), cracks
function texScales() {
  return txCanvas('scales', 512, 512, (x, w, h, R) => {
    x.fillStyle = '#b8bcb4'; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 26; r++) for (let c = 0; c < 22; c++) {
      const cx = c * 24 + (r % 2) * 12 + R.n(3), cy = r * 20 + R.n(3), s = R.r(10, 15), lift = R.f() < 0.18;
      tile(x, w, h, () => {
        x.fillStyle = lift ? 'rgba(30,34,34,0.75)' : 'rgba(60,66,64,0.45)'; x.beginPath(); x.ellipse(cx, cy + 3, s, s * 0.8, 0, 0, TAU); x.fill();
        x.fillStyle = lift ? R.pick(['#e8e6dc', '#f2efe4']) : R.pick(['#c8ccc4', '#d6d8cf', '#aeb3ab', '#bfc3ba']); x.beginPath(); x.ellipse(cx, cy - (lift ? 3 : 0), s * 0.92, s * 0.72, 0, 0, TAU); x.fill();
        x.fillStyle = 'rgba(255,255,250,0.25)'; x.beginPath(); x.ellipse(cx - 3, cy - 4, s * 0.45, s * 0.25, 0, 0, TAU); x.fill();
      });
    }
    for (let i = 0; i < 40; i++) { let px = R.r(0, w), py = R.r(0, h); x.strokeStyle = 'rgba(30,34,34,0.5)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += R.n(14); py += R.r(4, 14); x.lineTo(px, py); } x.stroke(); }
  }, [3, 3]);
}
// volcanic tephra: reddish-brown and grey cinders, a few pale stones
function texTephra() {
  return txCanvas('tephra', 512, 512, (x, w, h, R) => {
    x.fillStyle = '#6a5446'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 3200; i++) { const cx = R.r(0, w), cy = R.r(0, h), r = R.r(1.5, 6) * (R.f() < 0.08 ? 2 : 1), base = R.pick(['#8a6a56', '#5a463c', '#9a8270', '#4a3e38', '#7a7068', '#a89a8a', '#6e4a3a']);
      tile(x, w, h, () => { blob(x, cx, cy + r * 0.3, r, RNG('tp', i)); x.fillStyle = 'rgba(20,14,10,0.5)'; x.fill(); blob(x, cx, cy, r, RNG('tp', i)); x.fillStyle = base; x.fill(); }); }
  }, [40, 40]);
}
function texDome() {
  return txCanvas('dome', 256, 256, (x, w, h, R) => {
    x.fillStyle = '#e6e8e4'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 16; i++) { x.fillStyle = 'rgba(80,90,90,0.35)'; x.fillRect(i * 16, 0, 2, h); }
    for (let j = 0; j < 8; j++) { x.fillStyle = 'rgba(80,90,90,0.25)'; x.fillRect(0, j * 32, w, 2); }
    for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(120,110,100,0.12)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(1, 3), R.r(4, 18)); }
  }, [1, 1]);
}
// the Behemoth's hide: grey with fine horizontal ridges, a few curved grooves, cracks and peeling patches
function texRidges() {
  return txCanvas('ridges', 512, 512, (x, w, h, R) => {
    x.fillStyle = '#a9aca6'; x.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) { x.fillStyle = 'rgba(40,44,44,0.55)'; x.fillRect(0, y, w, 2); x.fillStyle = 'rgba(235,235,228,0.35)'; x.fillRect(0, y + 3, w, 2); }
    for (let y = 0; y < h; y += 8) if (R.f() < 0.35) { x.fillStyle = R.pick(['rgba(176,96,52,0.55)', 'rgba(200,140,70,0.45)']); x.fillRect(R.r(-50, w * 0.6), y + 4, R.r(80, 300), 3); }
    for (let i = 0; i < 300; i++) { x.fillStyle = 'rgba(60,64,62,0.15)'; x.fillRect(R.r(0, w), R.r(0, h), R.r(10, 60), 3); }
    for (let i = 0; i < 26; i++) { const cx = R.r(0, w), cy = R.r(0, h), s = R.r(10, 34); tile(x, w, h, () => { blob(x, cx, cy, s, RNG('pp', i), 9); x.fillStyle = '#d8d8d0'; x.fill(); x.strokeStyle = 'rgba(30,32,32,0.8)'; x.lineWidth = 2; x.stroke(); }); }
    for (let i = 0; i < 18; i++) { const cx = R.r(0, w), cy = R.r(0, h), s = R.r(6, 20); tile(x, w, h, () => { blob(x, cx, cy, s, RNG('raw', i), 8); x.fillStyle = '#6e2a1c'; x.fill(); blob(x, cx - 2, cy - 2, s * 0.5, RNG('raw2', i), 6); x.fillStyle = '#9a4430'; x.fill(); x.strokeStyle = '#e8e6dc'; x.lineWidth = 2; blob(x, cx, cy, s * 1.15, RNG('raw', i), 8); x.stroke(); }); }
    for (let i = 0; i < 12; i++) { const cx = R.r(0, w), cy = R.r(0, h); x.strokeStyle = 'rgba(40,16,12,0.7)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + R.n(60), cy + R.n(20)); x.stroke(); }
    for (let i = 0; i < 50; i++) { let px = R.r(0, w), py = R.r(0, h); x.strokeStyle = 'rgba(25,28,28,0.7)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += R.n(16); py += R.n(10); x.lineTo(px, py); } x.stroke(); }
  }, [1, 1]);
}

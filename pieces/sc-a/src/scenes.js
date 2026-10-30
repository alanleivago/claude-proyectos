// =====================================================================
//  COMMON — shared texture helpers and builders for every set file (set-*.js).
//  Units: head radius = 1 (~0.22 m).
// =====================================================================
const S = {};
const wordT = (w, n = 1) => { let k = 0; for (const x of WORDS) if (x.w.replace(/[^\w$%]/g, '').toLowerCase() === w.toLowerCase() && ++k === n) return x.s; return null; };

// ---- texture helpers
function inked(x, txt, px, py, size, fill, o = {}) {
  x.save(); x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; x.textAlign = o.align ?? 'center'; x.textBaseline = 'middle';
  const maxW = o.maxW ?? x.canvas.width * 0.9, tw = x.measureText(txt).width;   // never spill past the sign: shrink to fit
  if (tw > maxW) { size *= maxW / tw; x.font = `${o.weight ?? 900} ${size}px ${o.font ?? C3.sub}`; }
  x.lineJoin = 'round'; if (o.stroke !== false) { x.strokeStyle = o.stroke ?? '#2a1208'; x.lineWidth = o.sw ?? size * 0.14; x.strokeText(txt, px, py); }
  x.fillStyle = fill; x.fillText(txt, px, py); x.restore();
}
const tex = (draw, w = 512, h = 512) => c3Tex(draw, w, h);
function texWallpaper() {   // 70s: brown ground, orange/mustard rings
  const t = tex((x, w, h) => { x.fillStyle = '#6b3a1e'; x.fillRect(0, 0, w, h);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const cx = (i + (j % 2) * 0.5) * w / 4, cy = (j + 0.5) * h / 4;
      for (const [r, c] of [[52, '#e07a2a'], [40, '#f0b040'], [28, '#c8551c'], [16, '#f6d27a']]) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fillStyle = c; x.fill(); } } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 2); return t;
}
function texPanel() { const t = tex((x, w, h) => { const R = RNG('panel'); for (let i = 0; i < 16; i++) { x.fillStyle = `hsl(25,${45 + R.r(-6, 6)}%,${26 + R.r(-4, 4)}%)`; x.fillRect(i * w / 16, 0, w / 16, h); x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(i * w / 16, 0, 3, h);
  for (let k = 0; k < 6; k++) { x.strokeStyle = 'rgba(30,12,4,0.25)'; x.beginPath(); x.moveTo(i * w / 16 + R.r(4, 28), 0); x.bezierCurveTo(i * w / 16 + R.r(0, 30), h / 3, i * w / 16 + R.r(0, 30), h * 2 / 3, i * w / 16 + R.r(4, 28), h); x.stroke(); } } });
  t.wrapS = THREE.RepeatWrapping; t.repeat.set(4, 1); return t; }
function texLino() { const t = tex((x, w, h) => { for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#d8c49a' : '#8a5a32'; x.fillRect(i * w / 8, j * h / 8, w / 8, h / 8); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 5); return t; }
function texWood() { const t = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#8a5228'); g.addColorStop(1, '#a8682e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = RNG('wood'); x.strokeStyle = 'rgba(60,28,8,0.35)'; for (let i = 0; i < 40; i++) { const y = R.r(0, h); x.lineWidth = R.r(1, 3); x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w / 3, y + R.n(20), w * 2 / 3, y + R.n(20), w, y + R.n(10)); x.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function texCalendar(month, year) {
  return tex((x, w, h) => { x.fillStyle = '#fbf3e0'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8321e'; x.fillRect(0, 0, w, h * 0.3);
    inked(x, month, w / 2, h * 0.12, h * 0.1, '#ffffff', { stroke: false }); inked(x, year, w / 2, h * 0.23, h * 0.08, '#ffe6a0', { stroke: false });
    x.fillStyle = '#5a3a22'; x.font = `700 ${h * 0.045}px Arial`; x.textAlign = 'center';
    for (let d = 0; d < 30; d++) { const c = (d + 4) % 7, r = Math.floor((d + 4) / 7); x.fillText(String(d + 1), w * (0.1 + c * 0.13), h * (0.4 + r * 0.11)); }
    x.strokeStyle = '#c8321e'; x.lineWidth = 6; x.beginPath(); x.arc(w * (0.1 + 4 * 0.13), h * 0.385, 22, 0, TAU); x.stroke(); }, 512, 640);
}
function texContract() {
  return tex((x, w, h) => { x.fillStyle = '#fbf7ec'; x.fillRect(0, 0, w, h); inked(x, 'PARTNERSHIP AGREEMENT', w / 2, h * 0.08, h * 0.04, '#2a1a10', { stroke: false, font: 'Georgia, serif', weight: 700 });
    x.fillStyle = 'rgba(40,30,20,0.55)'; const R = RNG('lines'); for (let i = 0; i < 22; i++) x.fillRect(w * 0.1, h * (0.15 + i * 0.03), w * R.r(0.5, 0.8), 3);
    x.strokeStyle = '#1a2a6a'; x.lineWidth = 4; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(w * 0.12, h * (0.86 + k * 0.035)); for (let i = 0; i < 12; i++) x.lineTo(w * (0.12 + i * 0.022), h * (0.86 + k * 0.035) + Math.sin(i * 1.7 + k) * 8); x.stroke(); }
    x.fillStyle = 'rgba(40,30,20,0.6)'; x.fillRect(w * 0.1, h * 0.9, w * 0.35, 2); }, 512, 700);
}
function texBlinds() { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#fff3d0'); g.addColorStop(1, '#ffc87a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(150,90,40,0.55)'; x.fillRect(0, i * h / 18, w, h / 36); } }, 256, 256); }
function texBox(label, c) { return tex((x, w, h) => { x.fillStyle = c; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(60,30,10,0.4)'; x.lineWidth = 6; x.strokeRect(8, 8, w - 16, h - 16);
  inked(x, label, w / 2, h * 0.45, h * 0.16, '#ffffff', { stroke: '#3a1a08' }); x.fillStyle = '#2a7a4a'; x.fillRect(w * 0.2, h * 0.65, w * 0.6, h * 0.12); }, 256, 256); }
function texSign(txt, c1, c2, k = 0.55) { return tex((x, w, h) => { x.fillStyle = '#1a0c10'; x.fillRect(0, 0, w, h); inked(x, txt, w / 2, h / 2, h * k, c1, { stroke: c2, sw: h * 0.06 }); }, 1024, 256); }
function texBill(i) { return tex((x, w, h) => { x.fillStyle = '#f6efe0'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(60,40,20,0.5)'; for (let k = 0; k < 6; k++) x.fillRect(w * 0.1, h * (0.15 + k * 0.1), w * (0.5 + 0.3 * ((k + i) % 2)), 4);
  x.save(); x.translate(w / 2, h * 0.7); x.rotate(-0.25); x.strokeStyle = '#d22a1e'; x.lineWidth = 7; x.strokeRect(-w * 0.36, -h * 0.09, w * 0.72, h * 0.18); inked(x, 'UNPAID', 0, 0, h * 0.13, '#d22a1e', { stroke: false }); x.restore(); }, 256, 256); }
function texWindows(seed) { const t = tex((x, w, h) => { x.fillStyle = '#141826'; x.fillRect(0, 0, w, h); const R = RNG('win', seed);
  for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) { const on = R.f() < 0.55; x.fillStyle = on ? (R.f() < 0.5 ? '#ffd890' : '#ffeec8') : '#232a40'; x.fillRect(i * w / 8 + 6, j * h / 16 + 5, w / 8 - 12, h / 16 - 10); } }, 256, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

// ---- shared builders
const rb = (w, h, d, mat, x, y, z, ink = 0.03) => { const m = c3Mesh(c3RBox(w, h, d, Math.min(0.12, w * 0.2, h * 0.2, d * 0.2)), mat, ink); m.position.set(x, y, z); return m; };
const pl = (w, h, mat, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); return m; };
const cyl = (r0, r1, h, mat, x, y, z, ink = 0.03, seg = 24) => { const m = c3Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), mat, ink); m.position.set(x, y, z); return m; };
function lights(scene, o = {}) {
  scene.add(new THREE.AmbientLight(o.amb ?? '#fff0e4', o.ambI ?? 0.3));
  scene.add(new THREE.HemisphereLight(o.sky ?? '#ffe2c0', o.ground ?? '#3a1c2a', 0.45));
  const key = new THREE.DirectionalLight(o.key ?? '#ffe9d0', o.keyI ?? 1.0); key.position.set(...(o.keyP ?? [6, 14, 12])); scene.add(key);
  const rim = new THREE.DirectionalLight(o.rim ?? '#ffb070', o.rimI ?? 0.6); rim.position.set(...(o.rimP ?? [-6, 9, -8])); scene.add(rim);
  scene.children.forEach((c) => c.isLight && c.layers.enableAll());
  return key;
}
function mug(c, x, y, z) { const g = new THREE.Group(); g.add(cyl(0.32, 0.28, 0.7, c3Prop(c, { rough: 0.3 }), 0, 0.35, 0, 0.02)); const h = c3Mesh(new THREE.TorusGeometry(0.18, 0.05, 8, 16, Math.PI), c3Prop(c, { rough: 0.3 }), 0.015); h.position.set(0.34, 0.38, 0); h.rotation.z = -Math.PI / 2; g.add(h); g.position.set(x, y, z); return g; }
function chair(x, z, ry, M) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
  g.add(rb(2.0, 0.3, 2.0, M.vinyl, 0, 2.3, 0)); g.add(rb(2.0, 2.2, 0.25, M.vinyl, 0, 3.6, -0.95));
  for (const [a, b] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) g.add(cyl(0.07, 0.07, 2.2, M.chrome, a, 1.1, b, 0.015, 8)); return g; }


// =====================================================================
//  SET bank — DETAIL PASS (toon-test v2). Ricks rooms are dense: framed pictures, a wall clock, a cork board with notes,
//  posters with a joke, a "now serving" display, an ATM, a water cooler, a bench with a newspaper, big-leaf plants, a rug
//  with a border, coffered ceiling with recessed lights, sconces, light pools, and a desk covered in clutter. A window with
//  blinds on the left wall throws striped light across the desk (an unseen "gobo" of slats in the key light's path), so
//  the people receive the room's light and shadow like Ricks'. Prefix bkd. Called from bkBuild before the env/shade pass.
// =====================================================================
const BKD_INK = '#2a1620';
function bkdFrameTex(kind) {
  return tex((g, w, h) => {
    const f = 34; g.fillStyle = '#b8862e'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8c062'; g.fillRect(6, 6, w - 12, h - 12); g.fillStyle = '#a07022'; g.fillRect(f - 8, f - 8, w - 2 * f + 16, h - 2 * f + 16);
    g.save(); g.beginPath(); g.rect(f, f, w - 2 * f, h - 2 * f); g.clip(); const W2 = w - 2 * f, H2 = h - 2 * f; g.translate(f, f);
    if (kind === 'founder') {
      const bg = g.createLinearGradient(0, 0, 0, H2); bg.addColorStop(0, '#3e6a52'); bg.addColorStop(1, '#1f3a2e'); g.fillStyle = bg; g.fillRect(0, 0, W2, H2);
      g.fillStyle = '#23263a'; g.beginPath(); g.ellipse(W2 / 2, H2 * 1.02, W2 * 0.36, H2 * 0.36, 0, 0, TAU); g.fill(); g.lineWidth = 7; g.strokeStyle = BKD_INK; g.stroke();
      g.fillStyle = '#f2ece2'; g.beginPath(); g.moveTo(W2 / 2 - 22, H2 * 0.68); g.lineTo(W2 / 2 + 22, H2 * 0.68); g.lineTo(W2 / 2, H2 * 0.82); g.fill(); g.fillStyle = '#b02a2a'; g.fillRect(W2 / 2 - 6, H2 * 0.7, 12, 40);
      const hx = W2 / 2, hy = H2 * 0.42, r = W2 * 0.27; g.fillStyle = '#f6eadc'; g.beginPath(); g.ellipse(hx, hy, r, r * 0.94, 0.05, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = BKD_INK; g.stroke();
      g.fillStyle = '#9a948e'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * r * 0.95, hy + 4, r * 0.16, r * 0.3, 0, 0, TAU); g.fill(); g.lineWidth = 4; g.stroke(); }
      g.fillStyle = BKD_INK; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(hx + s * r * 0.3, hy, 5, 8, 0, 0, TAU); g.fill(); g.fillRect(hx + s * r * 0.3 - 11, hy - 26, 22, 6); }
      g.fillStyle = '#5a4a44'; g.beginPath(); g.ellipse(hx - 14, hy + 30, 18, 8, 0.25, 0, TAU); g.ellipse(hx + 14, hy + 30, 18, 8, -0.25, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, W2, H2 * 0.3);
    } else if (kind === 'hills') {
      const sk = g.createLinearGradient(0, 0, 0, H2); sk.addColorStop(0, '#8ec8f0'); sk.addColorStop(1, '#ffe2b0'); g.fillStyle = sk; g.fillRect(0, 0, W2, H2);
      g.fillStyle = '#f2c862'; g.beginPath(); g.arc(W2 * 0.75, H2 * 0.3, 30, 0, TAU); g.fill(); g.lineWidth = 5; g.strokeStyle = BKD_INK; g.stroke();
      for (const [y, c] of [[0.55, '#7ab85a'], [0.68, '#5a9a44'], [0.82, '#4a8a3a']]) { g.fillStyle = c; g.beginPath(); g.moveTo(0, H2); for (let x = 0; x <= W2; x += 10) g.lineTo(x, H2 * y + Math.sin(x * 0.02 + y * 9) * 18); g.lineTo(W2, H2); g.fill(); g.lineWidth = 4; g.stroke(); }
      g.fillStyle = '#c84a32'; g.fillRect(W2 * 0.2, H2 * 0.5, 40, 30); g.strokeRect(W2 * 0.2, H2 * 0.5, 40, 30); g.fillStyle = '#8a3a2a'; g.beginPath(); g.moveTo(W2 * 0.2 - 6, H2 * 0.5); g.lineTo(W2 * 0.2 + 20, H2 * 0.5 - 20); g.lineTo(W2 * 0.2 + 46, H2 * 0.5); g.fill(); g.stroke();
      for (let i = 0; i < 5; i++) { g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(W2 * (0.45 + i * 0.09), H2 * (0.74 + (i % 2) * 0.05), 9, 6, 0, 0, TAU); g.fill(); g.lineWidth = 3; g.stroke(); }
    } else if (kind === 'wheel') {
      g.fillStyle = '#5a2a3a'; g.fillRect(0, 0, W2, H2); g.fillStyle = '#7a4a2a'; g.fillRect(0, H2 * 0.7, W2, H2 * 0.3);
      g.fillStyle = '#e8b04a'; g.beginPath(); g.ellipse(W2 / 2, H2 * 0.62, W2 * 0.34, H2 * 0.2, 0, 0, TAU); g.fill(); g.lineWidth = 6; g.strokeStyle = BKD_INK; g.stroke();
      g.fillStyle = '#f6d878'; g.beginPath(); g.ellipse(W2 / 2, H2 * 0.55, W2 * 0.34, H2 * 0.12, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#c84a32'; g.beginPath(); g.arc(W2 * 0.78, H2 * 0.36, 18, 0, TAU); g.fill(); g.stroke();
    }
    g.restore(); g.lineWidth = 8; g.strokeStyle = BKD_INK; g.strokeRect(4, 4, w - 8, h - 8); g.lineWidth = 4; g.strokeRect(f, f, w - 2 * f, h - 2 * f);
    if (kind === 'founder') { g.fillStyle = '#e8c062'; g.fillRect(w / 2 - 70, h - 30, 140, 22); g.strokeRect(w / 2 - 70, h - 30, 140, 22); inked(g, 'FONDATORE 1893', w / 2, h - 19, 14, '#3a2410', { stroke: false, font: 'Georgia, serif', weight: 700 }); }
  }, 360, kind === 'hills' ? 280 : 440);
}
function bkdClockTex() { return tex((g, w, h) => { const c = w / 2; g.clearRect(0, 0, w, h); g.fillStyle = '#d8322a'; g.beginPath(); g.arc(c, c, c - 4, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = BKD_INK; g.stroke();
  g.fillStyle = '#fffaf2'; g.beginPath(); g.arc(c, c, c * 0.84, 0, TAU); g.fill(); g.lineWidth = 5; g.stroke(); g.fillStyle = BKD_INK; g.font = `700 ${w * 0.09}px Arial`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; g.fillText(String(i), c + Math.cos(a) * c * 0.68, c + Math.sin(a) * c * 0.68); }
  for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; g.fillRect(c + Math.cos(a) * c * 0.8 - 1, c + Math.sin(a) * c * 0.8 - 1, 2, 2); }
  g.lineCap = 'round'; g.lineWidth = 9; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(-2.1) * c * 0.42, c + Math.sin(-2.1) * c * 0.42); g.stroke();
  g.lineWidth = 6; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(-0.95) * c * 0.62, c + Math.sin(-0.95) * c * 0.62); g.stroke();
  g.strokeStyle = '#d8322a'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(1.2) * c * 0.7, c + Math.sin(1.2) * c * 0.7); g.stroke(); g.fillStyle = BKD_INK; g.beginPath(); g.arc(c, c, 8, 0, TAU); g.fill(); }, 256, 256); }
function bkdBoardTex() { return tex((g, w, h) => { g.fillStyle = '#7a4a22'; g.fillRect(0, 0, w, h); g.fillStyle = '#c8955a'; g.fillRect(16, 16, w - 32, h - 32); const R = RNG('cork');
  for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${R.f() < 0.5 ? '120,70,30' : '230,190,130'},0.35)`; g.fillRect(R.r(16, w - 16), R.r(16, h - 16), 3, 3); }
  const note = (x, y, ww, hh, c, rot, lines, pin) => { g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = c; g.fillRect(-ww / 2, -hh / 2, ww, hh); g.lineWidth = 3; g.strokeStyle = BKD_INK; g.strokeRect(-ww / 2, -hh / 2, ww, hh);
    lines.forEach((l, i) => inked(g, l, 0, -hh / 2 + 24 + i * 24, i ? 15 : 19, '#2a1a12', { stroke: false, maxW: ww - 12 })); g.fillStyle = pin; g.beginPath(); g.arc(0, -hh / 2 + 8, 7, 0, TAU); g.fill(); g.stroke(); g.restore(); };
  note(110, 100, 150, 120, '#fff7c2', -0.06, ['TASSI', 'MUTUO 3.2%', 'CONTO 0.5%'], '#d8322a'); note(290, 92, 140, 110, '#ffffff', 0.05, ['CHIUSO', 'DOMENICA'], '#3a6ad8');
  note(420, 120, 120, 150, '#bfe6ff', -0.04, ['GATTO', 'PERSO!', 'TEL 0521'], '#2f8a3a'); note(150, 240, 170, 100, '#ffd8e2', 0.04, ['NO FORMAGGIO', 'NEL CAVEAU*', '*solo 24 mesi'], '#e2b23a');
  note(360, 270, 170, 110, '#ffffff', -0.03, ['PREMIO', 'CLIENTE', 'DEL MESE'], '#d8322a');
  g.fillStyle = '#f2c862'; g.beginPath(); g.arc(430, 300, 22, 0, TAU); g.fill(); }, 512, 360); }
function bkdPosterTex(title, sub, bg, fg, art) { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.lineWidth = 10; g.strokeStyle = BKD_INK; g.strokeRect(5, 5, w - 10, h - 10);
  inked(g, title, w / 2, h * 0.13, h * 0.09, fg, { stroke: BKD_INK, sw: 7, maxW: w * 0.86 }); inked(g, sub, w / 2, h * 0.9, h * 0.045, '#ffffff', { stroke: false, maxW: w * 0.86 });
  g.save(); g.translate(w / 2, h * 0.5); if (art === 'wheel') { g.fillStyle = '#e8b04a'; g.beginPath(); g.ellipse(0, 20, w * 0.3, h * 0.15, 0, 0, TAU); g.fill(); g.lineWidth = 7; g.stroke(); g.fillStyle = '#f6d878'; g.beginPath(); g.ellipse(0, -10, w * 0.3, h * 0.08, 0, 0, TAU); g.fill(); g.stroke();
    inked(g, '= €', w * 0.2, -h * 0.17, h * 0.07, '#ffffff', { stroke: BKD_INK, sw: 6 }); }
  else { g.fillStyle = '#ff9ab4'; g.beginPath(); g.ellipse(0, 0, w * 0.28, h * 0.17, 0, 0, TAU); g.fill(); g.lineWidth = 7; g.stroke(); g.fillStyle = BKD_INK; g.fillRect(-20, -h * 0.17 - 4, 40, 8);
    g.beginPath(); g.arc(w * 0.12, -h * 0.04, 6, 0, TAU); g.fill(); g.fillStyle = '#ff7a9a'; g.beginPath(); g.ellipse(w * 0.27, 0, 18, 14, 0, 0, TAU); g.fill(); g.stroke(); }
  g.restore(); }, 360, 520); }
function bkdServingTex() { return tex((g, w, h) => { g.fillStyle = '#1a1a22'; g.fillRect(0, 0, w, h); g.lineWidth = 10; g.strokeStyle = '#c9a040'; g.strokeRect(5, 5, w - 10, h - 10);
  inked(g, 'NUMERO', w * 0.27, h * 0.3, h * 0.16, '#fff3d6', { stroke: false }); inked(g, 'CASSA 2', w * 0.27, h * 0.68, h * 0.16, '#fff3d6', { stroke: false });
  g.fillStyle = '#300'; g.fillRect(w * 0.52, h * 0.15, w * 0.42, h * 0.7); g.shadowColor = '#ff3a2a'; g.shadowBlur = 16; inked(g, '042', w * 0.73, h * 0.52, h * 0.55, '#ff4a32', { stroke: false, font: '"Courier New", monospace', weight: 700 }); g.shadowBlur = 0; }, 512, 200); }
function bkdScreenTex() { return tex((g, w, h) => { g.fillStyle = '#1e3a8a'; g.fillRect(0, 0, w, h); g.fillStyle = '#9ad0ff'; g.fillRect(0, 0, w, 22); inked(g, 'PRESTITI.XLS', w / 2, 11, 14, '#1e3a8a', { stroke: false });
  g.strokeStyle = 'rgba(160,210,255,0.5)'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(0, 30 + i * 22); g.lineTo(w, 30 + i * 22); g.stroke(); } for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 22); g.lineTo(i * w / 4, h); g.stroke(); }
  g.fillStyle = '#ffe26a'; for (let i = 0; i < 8; i++) g.fillRect(w / 4 + 8, 36 + i * 22, 20 + (i * 37) % 60, 8); g.fillStyle = '#7aff9a'; g.fillRect(w * 0.55, 36 + 3 * 22, 70, 10); }, 256, 220); }
function bkdKeysTex() { return tex((g, w, h) => { g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4f0e6'; for (let j = 0; j < 4; j++) for (let i = 0; i < 14; i++) { g.fillRect(6 + i * 18 + (j % 2) * 5, 8 + j * 18, 14, 14); g.strokeStyle = 'rgba(40,30,30,0.5)'; g.strokeRect(6 + i * 18 + (j % 2) * 5, 8 + j * 18, 14, 14); } }, 264, 84); }
function bkdRugTex() { return tex((g, w, h) => { g.fillStyle = '#7a3430'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8b04a'; g.fillRect(14, 14, w - 28, h - 28); g.fillStyle = '#7a3434'; g.fillRect(28, 28, w - 56, h - 56);
  g.strokeStyle = '#e2b23a'; g.lineWidth = 4; for (let i = 0; i < 22; i++) { const x = 40 + i * (w - 80) / 21; g.beginPath(); g.moveTo(x, 34); g.lineTo(x + 8, 46); g.lineTo(x, 58); g.stroke(); g.beginPath(); g.moveTo(x, h - 34); g.lineTo(x + 8, h - 46); g.lineTo(x, h - 58); g.stroke(); }
  g.fillStyle = '#2a4a7a'; g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.22, h * 0.24, 0, 0, TAU); g.fill(); g.lineWidth = 8; g.strokeStyle = '#e2b23a'; g.stroke();
  g.fillStyle = '#e2b23a'; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * w * 0.13, h / 2 + Math.sin(a) * h * 0.14, 12, 8, a, 0, TAU); g.fill(); }
  const R = RNG('rug'); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${R.f() < 0.5 ? '0,0,0' : '255,230,200'},0.07)`; g.fillRect(R.r(0, w), R.r(0, h), 2, 5); } }, 512, 360); }
function bkdATMTex() { return tex((g, w, h) => { g.fillStyle = '#c8ccd4'; g.fillRect(0, 0, w, h); g.fillStyle = '#2f6a52'; g.fillRect(0, 0, w, h * 0.16); inked(g, 'BANCOMAT', w / 2, h * 0.08, h * 0.07, '#fff3d6', { stroke: false });
  g.fillStyle = '#1a2a4a'; g.fillRect(w * 0.15, h * 0.22, w * 0.7, h * 0.3); g.fillStyle = '#7ad0ff'; g.fillRect(w * 0.19, h * 0.25, w * 0.62, h * 0.24); inked(g, 'BENVENUTO', w / 2, h * 0.33, h * 0.045, '#1a2a4a', { stroke: false }); inked(g, 'inserire formaggio', w / 2, h * 0.41, h * 0.03, '#1a2a4a', { stroke: false });
  for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { g.fillStyle = j === 3 && i === 2 ? '#3aa84a' : j === 3 && i === 0 ? '#d8322a' : '#eef0f4'; g.fillRect(w * (0.3 + i * 0.14), h * (0.58 + j * 0.07), w * 0.11, h * 0.055); g.strokeStyle = BKD_INK; g.lineWidth = 2; g.strokeRect(w * (0.3 + i * 0.14), h * (0.58 + j * 0.07), w * 0.11, h * 0.055); }
  g.fillStyle = '#1a1a22'; g.fillRect(w * 0.25, h * 0.9, w * 0.5, h * 0.03); g.lineWidth = 8; g.strokeStyle = BKD_INK; g.strokeRect(4, 4, w - 8, h - 8); }, 256, 512); }
function bkdSignTex(txt, bg, fg, w = 512, h = 160) { return tex((g, W2, H2) => { g.fillStyle = bg; g.fillRect(0, 0, W2, H2); g.lineWidth = 10; g.strokeStyle = BKD_INK; g.strokeRect(5, 5, W2 - 10, H2 - 10); inked(g, txt, W2 / 2, H2 / 2 + 3, H2 * 0.5, fg, { stroke: false, maxW: W2 * 0.86 }); }, w, h); }
function bkdNewsTex() { return tex((g, w, h) => { g.fillStyle = '#f2ede0'; g.fillRect(0, 0, w, h); inked(g, 'GAZZETTA', w / 2, 26, 30, '#1a1a1a', { stroke: false, font: 'Georgia, serif' }); g.fillStyle = '#1a1a1a'; g.fillRect(10, 46, w - 20, 3);
  inked(g, 'FORMAGGIO VALE PIÙ DELL\'ORO', w / 2, 70, 18, '#1a1a1a', { stroke: false, maxW: w - 20 }); g.fillStyle = 'rgba(30,30,30,0.5)'; for (let i = 0; i < 12; i++) g.fillRect(10 + (i % 2) * (w / 2), 92 + Math.floor(i / 2) * 16, w / 2 - 20, 4); }, 256, 200); }
function bkdCofferTex() { const t = tex((g, w, h) => { g.fillStyle = '#e8d2a4'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9a76a'; g.fillRect(24, 24, w - 48, h - 48); g.fillStyle = '#f2e2bc'; g.fillRect(40, 40, w - 80, h - 80);
  g.strokeStyle = BKD_INK; g.lineWidth = 3; g.strokeRect(24, 24, w - 48, h - 48); g.strokeRect(40, 40, w - 80, h - 80); g.fillStyle = '#c9a040'; g.beginPath(); g.arc(w / 2, h / 2, 18, 0, TAU); g.fill(); g.stroke(); }, 256, 256);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9); return t; }
function bkdMarbleTex() { const t = tex((g, w, h) => { const n = 4; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { g.fillStyle = (i + j) % 2 ? '#5a8c78' : '#ece2cc'; g.fillRect(i * w / n, j * h / n, w / n, h / n); }
  const R = RNG('marble'); g.lineWidth = 2; for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(${R.f() < 0.5 ? '255,255,255' : '40,60,50'},0.18)`; g.beginPath(); let x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); for (let s = 0; s < 6; s++) { x += R.r(-40, 40); y += R.r(10, 40); g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(40,30,20,0.4)'; g.lineWidth = 3; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.moveTo(0, i * h / n); g.lineTo(w, i * h / n); g.stroke(); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9); return t; }
let BKD_GLOWT = null;
function bkdGlow(r, c, a) { BKD_GLOWT ||= c3Tex((x, w, h) => { const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, h); }, 128, 128, false);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * r, 2 * r), new THREE.MeshBasicMaterial({ map: BKD_GLOWT, color: c, transparent: true, opacity: a, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  m.userData.noInk2 = true; m.userData.noShade = true; return m; }
function bkdMonstera(g, s = 1, seed = 1) { const R = RNG('mon', seed), leafM = c3Prop('#3f8a3e', { rough: 0.7 }), leafM2 = c3Prop('#4f9a46', { rough: 0.7 });
  g.add(cyl(1.3 * s, 1.0 * s, 2.2 * s, c3Prop('#e8e2d6', { rough: 0.5 }), 0, 1.1 * s, 0, 0.02, 16));
  for (let i = 0; i < 9; i++) { const a = i * 2.4 + R.r(-0.3, 0.3), h = (3 + R.r(0, 3.5)) * s, stem = cyl(0.06 * s, 0.08 * s, h, leafM, Math.cos(a) * 0.5 * s, 2.2 * s + h / 2, Math.sin(a) * 0.5 * s, 0.006, 6); stem.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); g.add(stem);
    const lf = c3Mesh(new THREE.CircleGeometry(1.25 * s, 14, 0, Math.PI * 1.75), i % 2 ? leafM : leafM2, 0.02); lf.position.set(Math.cos(a) * (0.5 + h * 0.3) * s, 2.2 * s + h, Math.sin(a) * (0.5 + h * 0.3) * s); lf.rotation.set(-1.1 + R.r(-0.3, 0.3), a, R.r(0, 1)); lf.material.side = THREE.DoubleSide; g.add(lf); } }
// the bank cat (Ricks rooms often have one): a code-drawn card like the people, lit by the room
function bkdCat() {
  const k = 2, cv = document.createElement('canvas'); cv.width = 300 * k; cv.height = 260 * k; const g = cv.getContext('2d'); g.scale(k, k);
  const org = '#e8933c', light = -2.3, thick = Math.atan2(-Math.sin(light) + 0.9, -Math.cos(light));
  const tail = t3Spline([[200, 215], [262, 205], [276, 160], [258, 128]], 8); t3TaperPath(g, tail, 26, 18, T3.ink); t3TaperPath(g, tail, 17, 10, org);
  for (const q of [[262, 190], [272, 160]]) t3Stroke(g, [[q[0] - 7, q[1] - 4], [q[0] + 7, q[1] + 2]], 5, '#b8641e');
  const body = t3Blob(150, 190, 92, 52, 2.1, 2.6, 0.12, 64); t3Path(g, body); g.fillStyle = org; g.fill();
  g.save(); t3Path(g, body); g.clip(); g.fillStyle = '#fbf3ea'; g.beginPath(); g.ellipse(120, 215, 40, 34, 0, 0, TAU); g.fill();
  for (let i = 0; i < 5; i++) t3Stroke(g, t3Quad([170 + i * 16, 146], [176 + i * 16, 175], [168 + i * 16, 200], 6), 7, '#b8641e');
  g.restore(); t3Volume(g, body, 150, 190, 92, 52, light, { flat: 0.4, far: '#a8806a', mid: '#f0dcc8', rim: '#e8d0c0', ring0: 0.8, glow: 0.15 }); t3InkRing(g, body, 7, thick, 0.5);
  for (const x of [108, 134]) { g.beginPath(); g.ellipse(x, 238, 13, 9, 0, 0, TAU); g.fillStyle = '#fbf3ea'; g.fill(); g.lineWidth = 4; g.strokeStyle = T3.ink; g.stroke(); }
  const hx = 100, hy = 126;
  for (const s2 of [-1, 1]) { const ear = [[hx + s2 * 22, hy - 40], [hx + s2 * 46, hy - 86], [hx + s2 * 60, hy - 28]]; t3Path(g, ear); g.fillStyle = org; g.fill(); g.lineWidth = 6; g.strokeStyle = T3.ink; g.stroke();
    t3Path(g, [[hx + s2 * 31, hy - 42], [hx + s2 * 45, hy - 70], [hx + s2 * 52, hy - 36]]); g.fillStyle = '#f5a8b0'; g.fill(); }
  const head = t3Blob(hx, hy, 64, 54, 2.2, 2.2, 0.06, 64); t3Path(g, head); g.fillStyle = org; g.fill();
  g.save(); t3Path(g, head); g.clip(); g.fillStyle = '#fbf3ea'; g.beginPath(); g.ellipse(hx + 4, hy + 30, 34, 26, 0, 0, TAU); g.fill();
  for (const dx of [-14, 0, 14]) t3Stroke(g, [[hx + dx, hy - 52], [hx + dx * 1.1, hy - 34]], 6, '#b8641e'); g.restore();
  t3Volume(g, head, hx, hy, 64, 54, light, { flat: 0.45, far: '#a8806a', mid: '#f0dcc8', rim: '#e8d0c0', ring0: 0.8, glow: 0.18 }); t3InkRing(g, head, 7, thick, 0.5);
  for (const s2 of [-1, 1]) { const ex = hx + s2 * 24, ey = hy - 4; g.beginPath(); g.ellipse(ex, ey, 15, 17, 0, 0, TAU); g.fillStyle = '#c8e04a'; g.fill(); g.lineWidth = 4; g.strokeStyle = T3.ink; g.stroke();
    g.fillStyle = T3.ink; g.beginPath(); g.ellipse(ex + 3, ey + 1, 6, 11, 0, 0, TAU); g.fill(); t3Catch(g, ex + 3, ey - 2, 3, 1); }
  g.fillStyle = '#f07a8a'; t3Path(g, [[hx - 6, hy + 18], [hx + 6, hy + 18], [hx, hy + 25]]); g.fill(); g.lineWidth = 2.5; g.strokeStyle = T3.ink; g.stroke();
  t3Stroke(g, t3Quad([hx - 10, hy + 30], [hx - 5, hy + 35], [hx, hy + 28], 6), 3, T3.ink); t3Stroke(g, t3Quad([hx, hy + 28], [hx + 5, hy + 35], [hx + 10, hy + 30], 6), 3, T3.ink);
  for (const s2 of [-1, 1]) for (const dy of [-3, 6]) t3Stroke(g, [[hx + s2 * 28, hy + 24 + dy], [hx + s2 * 72, hy + 18 + dy * 1.6]], 1.8, T3.ink);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.12), new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide })); m.geometry.translate(0, 1.56, 0); return m;
}
function bkDetail(s) {
  const scene = s.scene, brass = c3Prop('#c9a040', { metal: 0.6, rough: 0.3 }), wood = c3Prop('#7a3f22', { rough: 0.55 }), dark = c3Prop('#2a2a30', { rough: 0.5 }), white = c3Prop('#f2efe6', { rough: 0.5 });
  const flat = (map) => c3Prop('#ffffff', { map, rough: 0.8 });
  // ---- walls: framed pictures, clock, cork board, posters, serving display, exit sign, sconces, baseboard
  const wallPic = (map, w, h, x, y, z, ry = 0) => { const m = rb(w, h, 0.25, flat(map), x, y, z, 0.02); m.rotation.y = ry; scene.add(m); return m; };
  wallPic(bkdFrameTex('founder'), 4.4, 5.4, 6, 13, 0.45);
  wallPic(bkdFrameTex('wheel'), 3.4, 4.2, -26, 21, 0.45);
  wallPic(bkdFrameTex('hills'), 7.2, 5.6, -35.7, 13, 40, Math.PI / 2);
  const ck = pl(4.2, 4.2, c3Flat('#ffffff', { map: bkdClockTex(), transparent: true }), 22, 14.5, 0.55); ck.material.alphaTest = 0.5; scene.add(ck); scene.add(cyl(2.05, 2.05, 0.4, c3Prop('#d8322a'), 22, 14.5, 0.3, 0.02, 32)).children.at(-1); scene.children.at(-1).rotation.x = Math.PI / 2;
  wallPic(bkdBoardTex(), 6, 4.2, -27, 10.5, 0.45);
  wallPic(bkdPosterTex('MUTUO FORMAGGIO', 'un caveau di gusto', '#2f6a52', '#ffe23a', 'wheel'), 4.4, 6.3, 35.7, 12, 52, -Math.PI / 2);
  wallPic(bkdPosterTex('RISPARMIA!', 'conto porcellino 0.5%', '#3a6ad8', '#ffffff', 'pig'), 4.4, 6.3, 35.7, 12, 26, -Math.PI / 2);
  { const d = rb(7, 2.7, 0.5, flat(bkdServingTex()), 25, 12.6, 17.2, 0.02); scene.add(d); for (const x of [22.5, 27.5]) scene.add(cyl(0.05, 0.05, 6, brass, x, 17, 17.2, 0, 4)); }
  wallPic(bkdSignTex('USCITA →', '#2f8a3a', '#ffffff'), 4.2, 1.3, -35.7, 19, 60, Math.PI / 2);
  wallPic(bkdSignTex('CASSA 1   CASSA 2   CASSA 3', '#23356a', '#fff3d6', 1024, 120), 20, 1.6, 25, 10.3, 16.9);
  { const c = pl(2.6, 3.2, c3Prop('#ffffff', { map: texCalendar('MARZO', '1987'), rough: 0.7 }), 11.2, 11.5, 0.42); scene.add(c); }
  for (const [x, y] of [[1.4, 15.8], [11.2, 16.4]]) wallPic(bkdSignTex('DIPLOMA', '#fbf3e0', '#7a4a22', 360, 260), 2.4, 1.8, x, y, 0.45);
  { const g = new THREE.Group(); g.position.set(0.6, 0, 1.6); scene.add(g); g.add(rb(4.6, 8.4, 1.6, wood, 0, 4.2, 0, 0.03)); const cols = ['#2a4a7a', '#7a2a2a', '#2f6a52', '#c9a040', '#5a3a6a', '#d8d2c4'];
    for (let r = 0; r < 4; r++) { g.add(rb(4.3, 0.15, 1.5, c3Prop('#5a2e18'), 0, 1.1 + r * 2.0, 0.1, 0.005)); for (let i = 0; i < 9; i++) { if ((i * 7 + r * 3) % 11 === 4) continue; const b = rb(0.36, 1.3 + ((i + r) % 3) * 0.15, 1.1, c3Prop(cols[(i * 5 + r) % 6], { rough: 0.6 }), -1.85 + i * 0.44, 1.85 + r * 2.0, 0.2, 0.006); if ((i + r) % 5 === 0) b.rotation.z = 0.25; g.add(b); } } }
  { const g = new THREE.Group(); g.position.set(-35.6, 0, 33); g.rotation.y = Math.PI / 2; scene.add(g); g.add(cyl(0.45, 0.45, 2.0, c3Prop('#d8322a', { rough: 0.35 }), 0, 4.4, 0.5, 0.02, 14)); g.add(rb(0.7, 0.5, 0.4, dark, 0, 5.6, 0.5, 0.01)); g.add(rb(1.6, 1.0, 0.1, c3Prop('#d8322a'), 0, 7.3, 0.1, 0.01)); }
  { const sw = rb(0.5, 0.8, 0.12, white, -35.8, 6.2, 56, 0.006); sw.rotation.y = Math.PI / 2; scene.add(sw); }
  // baseboards and a chair rail on every wall
  for (const [w, x, z, ry] of [[72, 0, 0.2, 0], [70, -35.8, 35, Math.PI / 2], [70, 35.8, 35, -Math.PI / 2], [72, 0, 69.8, Math.PI]]) {
    const b = rb(w, 0.9, 0.3, c3Prop('#3a2018', { rough: 0.6 }), x, 0.45, z, 0.01); b.rotation.y = ry; b.userData.noCast = true; scene.add(b); }
  for (const x of [-33, -18.5, 2, 26]) { const g = new THREE.Group(); g.position.set(x, 17, 0.5); scene.add(g); g.add(rb(0.5, 1.2, 0.4, brass, 0, 0, 0, 0.01));
    const sh = c3Mesh(new THREE.CylinderGeometry(0.5, 0.9, 1.3, 14, 1, true), c3Prop('#fff0c8', { emissive: '#ffd890', ei: 0.8, glow: '#ffd890' }), 0.015); sh.material.side = THREE.DoubleSide; sh.position.set(0, 0.9, 0.5); g.add(sh);
    const gl = bkdGlow(3.2, '#ffe0a8', 0.16); gl.position.set(0, 1.2, 0.3); g.add(gl); }
  // ---- window with blinds (left wall) + the unseen slats that throw its stripes across the desk
  { const g = new THREE.Group(); g.position.set(-35.6, 13, 22); g.rotation.y = Math.PI / 2; scene.add(g);
    g.add(rb(11, 11, 0.4, white, 0, 0, -0.1, 0.03)); const gl = pl(10, 10, c3Flat('#ffe6b0', { glow: '#ffe2a0' }), 0, 0, 0.15); gl.material.userData.glow = '#ffcf80'; g.add(gl);
    for (let i = 0; i < 11; i++) g.add(rb(10, 0.3, 0.3, c3Prop('#f2dcb0', { rough: 0.5 }), 0, -4.6 + i * 0.92, 0.3, 0)); g.add(rb(11.6, 0.6, 0.8, white, 0, -5.6, 0.4, 0.02)); }
  // (v3: the unseen blind "gobo" was removed — its hard bands read as noise)
  // ---- ceiling coffers + recessed lights + light pools on the floor
  scene.add(plNC(72, 70, c3Prop('#ffffff', { map: bkdCofferTex(), rough: 0.9 }), 0, BK_H - 0.05, 35, 0, Math.PI / 2));
  for (const [x, z] of [[-18, 24], [8, 24], [-18, 48], [8, 48], [26, 40]]) { const pool = bkdGlow(7, '#ffc070', 0.16); pool.rotation.x = -Math.PI / 2; pool.position.set(x, 0.06, z); pool.userData.noInk2 = true; scene.add(pool); }
  // ---- floor: marble, a rug under the desk, a bench with a newspaper, the water cooler, the ATM, plants, brochures, a bin
  scene.traverse((m) => { if (m.isMesh && m.geometry.type === 'PlaneGeometry' && m.geometry.parameters.width === 2 * BK_X && m.geometry.parameters.height === BK_Z && m.rotation.x < -1) m.material = c3Prop('#c4beb4', { map: bkdMarbleTex(), rough: 0.32, env: 0.45 }); });
  { const r = pl(17, 12, c3Prop('#ffffff', { map: bkdRugTex(), rough: 0.95 }), 4, 0.04, 34.4, 0, -Math.PI / 2); r.userData.noCast = true; scene.add(r); }
  { const g = new THREE.Group(); g.position.set(-21, 0, 44); g.rotation.y = Math.PI / 2; scene.add(g); g.add(rb(9, 0.5, 2.2, wood, 0, 2.3, 0, 0.02)); g.add(rb(9, 2.2, 0.3, wood, 0, 3.8, -1.0, 0.02));
    for (const x of [-4, 4]) for (const z of [-0.8, 0.8]) g.add(rb(0.3, 2.1, 0.3, dark, x, 1.05, z, 0.01)); const np = pl(2.4, 1.9, c3Prop('#ffffff', { map: bkdNewsTex() }), 1.5, 2.58, 0.2, 0, -Math.PI / 2); np.rotation.z = 0.3; g.add(np); }
  { const g = new THREE.Group(); g.position.set(-33, 0, 52); scene.add(g); g.add(rb(2.4, 4.6, 2.4, white, 0, 2.3, 0, 0.02)); g.add(cyl(1.0, 1.0, 2.6, c3Prop('#8ad0ff', { rough: 0.1, transparent: true, opacity: 0.75 }), 0, 6.0, 0, 0.02, 18));
    g.add(rb(0.4, 0.4, 0.3, c3Prop('#d8322a'), 0.5, 3.7, 1.25, 0.01)); g.add(rb(0.4, 0.4, 0.3, c3Prop('#3a6ad8'), -0.5, 3.7, 1.25, 0.01)); for (let i = 0; i < 4; i++) g.add(cyl(0.3, 0.22, 0.6, white, 1.6, 0.3 + i * 0.12, 0.6, 0.006, 10)); }
  { const a = rb(4, 9, 2.6, flat(bkdATMTex()), 35, 4.5, 44, 0.03); a.rotation.y = -Math.PI / 2; scene.add(a); }
  for (const [x, z, sc, sd] of [[-26, 37, 1.0, 1], [17.5, 46, 1.15, 2], [-31, 30, 1.1, 3]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); bkdMonstera(g, sc, sd); }
  { const g = new THREE.Group(); g.position.set(-4, 0, 22); scene.add(g); g.add(rb(3.4, 6, 0.8, wood, 0, 3, 0, 0.02)); const cols = ['#d8322a', '#3a6ad8', '#2f8a3a', '#e2b23a', '#8a4ad8', '#ff8a1c'];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) g.add(rb(1.3, 1.6, 0.2, c3Prop(cols[(i + j * 2) % 6]), -0.75 + i * 1.5, 1.6 + j * 1.8, 0.5, 0.01)); }
  { const b = cyl(0.8, 0.65, 1.8, c3Prop('#5a6470', { metal: 0.4, rough: 0.4 }), -4.4, 0.9, 38.5, 0.02, 16); scene.add(b); const pp = c3Mesh(new THREE.IcosahedronGeometry(0.4, 0), white, 0.01); pp.position.set(-4.2, 1.9, 38); scene.add(pp); }
  // ---- the desk: monitor, keyboard, phone, pen cup, paper stacks, in-tray, nameplate, calculator, a cactus, a mug (FOCUS)
  const D = new THREE.Group(); scene.add(D); const [kx, kz] = BK_DESK, y0 = 3.93;
  { const m = new THREE.Group(); m.position.set(kx + 2.4, y0, kz - 1.4); m.rotation.y = -0.35; D.add(m); m.add(rb(2.6, 2.2, 2.2, c3Prop('#e2dccc', { rough: 0.5 }), 0, 1.5, 0, 0.02)); m.add(rb(1.2, 0.3, 1.0, c3Prop('#e2dccc'), 0, 0.15, 0, 0.01));
    const sc = pl(2.0, 1.6, c3Flat('#ffffff', { map: bkdScreenTex() }), 0, 1.55, 1.12); sc.material.userData.glow = '#5a8ad8'; m.add(sc); }
  { const k = rb(2.2, 0.15, 0.75, c3Prop('#ffffff', { map: bkdKeysTex() }), kx - 0.6, y0 + 0.08, kz + 0.2, 0.008); k.rotation.y = -0.3; k.position.set(kx + 1.6, y0 + 0.08, kz + 0.2); D.add(k); }
  { const p = new THREE.Group(); p.position.set(kx - 2.8, y0, kz + 1.4); D.add(p); p.add(rb(1.1, 0.4, 1.0, c3Prop('#d8322a'), 0, 0.2, 0, 0.01)); const hs = rb(1.3, 0.25, 0.35, c3Prop('#d8322a'), 0, 0.55, 0, 0.01); p.add(hs); }
  { const c = cyl(0.3, 0.26, 0.7, c3Prop('#3a6ad8'), kx + 0.6, y0 + 0.35, kz - 1.8, 0.01, 12); D.add(c); for (const [dx, cc] of [[-0.1, '#d8322a'], [0.1, '#2a2a30'], [0, '#e2b23a']]) { const pe = cyl(0.04, 0.04, 1.1, c3Prop(cc), kx + 0.6 + dx, y0 + 0.9, kz - 1.8 + dx * 0.5, 0.004, 5); pe.rotation.z = dx * 2; D.add(pe); } }
  for (const [x, z, n] of [[kx - 1.0, kz - 1.6, 5], [kx + 0.2, kz - 1.5, 3]]) for (let i = 0; i < n; i++) { const pp = rb(1.4, 0.06, 1.8, white, x + (i % 2) * 0.06, y0 + 0.04 + i * 0.07, z, 0.004); pp.rotation.y = (i % 3) * 0.06; D.add(pp); }
  { const np = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 0.12), [wood, wood, wood, wood, c3Prop('#ffffff', { map: bkdSignTex('SIG. ROSSI', '#2a2018', '#e2b23a', 512, 140) }), wood]); np.position.set(kx + 0.4, y0 + 0.42, kz + 2.0); np.rotation.x = -0.25; D.add(c3Mesh(np.geometry, np.material, 0.01)); D.children.at(-1).position.copy(np.position); D.children.at(-1).rotation.copy(np.rotation); }
  { const c = rb(0.8, 0.12, 1.0, c3Prop('#3a3a44'), kx + 2.8, y0 + 0.06, kz + 1.2, 0.006); c.rotation.y = -0.3; D.add(c); }
  { const g = new THREE.Group(); g.position.set(kx + 3.4, y0, kz - 0.4); D.add(g); g.add(cyl(0.3, 0.24, 0.45, c3Prop('#c96a3f'), 0, 0.22, 0, 0.008, 10)); g.add(cyl(0.18, 0.2, 0.7, c3Prop('#4f9a44'), 0, 0.75, 0, 0.008, 10)); }
  { const m = mug('#f2efe6', kx + 1.6, y0, kz + 1.2); D.add(m); }
  // story props on the desk: post-its on the monitor, a coin stack, a cheese wedge on a saucer
  for (const [dx, dy, c] of [[-0.75, 2.6, '#ffe26a'], [0.85, 2.2, '#ff9ab4']]) { const pn = rb(0.55, 0.55, 0.04, c3Prop(c), kx + 2.4 + dx * 0.94, y0 + dy, kz - 0.25 + dx * 0.35, 0.004); pn.rotation.y = -0.35; D.add(pn); }
  for (let i = 0; i < 6; i++) D.add(cyl(0.26, 0.26, 0.07, c3Prop('#e2b23a', { metal: 0.7, rough: 0.3 }), kx - 0.4 + (i % 2) * 0.03, y0 + 0.04 + i * 0.075, kz + 1.6, 0.004, 14));
  { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.55, 3, 1, false, 0, 1.0), c3Prop('#f2c862', { rough: 0.6 })); w.position.set(kx - 1.5, y0 + 0.3, kz - 0.3); D.add(c3Mesh(w.geometry, w.material, 0.012)); D.children.at(-1).position.copy(w.position); D.children.at(-1).rotation.y = 0.6; }
  { const fr = rb(0.9, 1.1, 0.12, c3Prop('#c9a040', { metal: 0.5, rough: 0.35 }), kx - 2.9, y0 + 0.55, kz - 1.9, 0.006); fr.rotation.x = -0.15; fr.rotation.y = 0.4; D.add(fr);
    const ph = pl(0.66, 0.84, c3Flat('#ffffff', { map: bkdFrameTex('hills') }), kx - 2.86, y0 + 0.56, kz - 1.82, 0.4); ph.rotation.x = -0.15; D.add(ph); }   // a framed photo
  D.add(rb(1.0, 0.3, 0.32, c3Prop('#2a2a30'), kx + 3.3, y0 + 0.15, kz + 1.6, 0.006));   // stapler
  c3Layer(D, C3.L_FOCUS);
  // the teller counter: bell, pens on chains, cash trays, a CHIUSO sign, forms, a small plant
  { const T = new THREE.Group(); scene.add(T); const yt = 5.35;
    T.add(cyl(0.35, 0.45, 0.3, c3Prop('#c9a040', { metal: 0.6, rough: 0.3 }), 16.2, yt + 0.15, 19, 0.008, 14)); T.add(cyl(0.06, 0.06, 0.25, c3Prop('#c9a040'), 16.2, yt + 0.4, 19, 0.004, 6));
    for (const x of [19.5, 26.5, 32]) { T.add(cyl(0.2, 0.28, 0.5, c3Prop('#23356a'), x, yt + 0.25, 18.8, 0.006, 10)); const pe = cyl(0.04, 0.04, 1.0, c3Prop('#2a2a30'), x + 0.1, yt + 0.8, 18.8, 0.004, 5); pe.rotation.z = -0.4; T.add(pe); }
    for (const x of [22, 29]) T.add(rb(1.6, 0.2, 1.1, c3Prop('#5a6470', { metal: 0.4 }), x, yt + 0.1, 18.9, 0.006));
    { const sg = rb(2.2, 1.0, 0.12, c3Prop('#ffffff', { map: bkdSignTex('CHIUSO', '#c8323a', '#ffffff', 360, 160) }), 34, yt + 0.6, 19.1, 0.008); sg.rotation.x = -0.2; T.add(sg); }
    for (let i = 0; i < 4; i++) T.add(rb(1.2, 0.05, 1.5, c3Prop('#fbf7ee'), 24.5 + (i % 2) * 0.05, yt + 0.04 + i * 0.06, 18.8, 0.003));
    { const g = new THREE.Group(); g.position.set(13.8, yt, 18.6); T.add(g); g.add(cyl(0.35, 0.28, 0.5, c3Prop('#c96a3f'), 0, 0.25, 0, 0.006, 10)); for (let i = 0; i < 5; i++) { const lf = c3Mesh(new THREE.SphereGeometry(0.28, 8, 6), c3Prop('#4f9a44'), 0.006); lf.position.set(Math.cos(i * 1.3) * 0.2, 0.7 + (i % 2) * 0.2, Math.sin(i * 1.3) * 0.2); g.add(lf); } } }
  // floor: an A-frame "ATTENDERE QUI" sign, a gumball machine, a coat rack (coat, hat, umbrella), a side table with brochures + candy bowl
  { const g = new THREE.Group(); g.position.set(14.6, 0, 38.5); g.rotation.y = -0.3; scene.add(g); const sm = c3Prop('#ffffff', { map: bkdSignTex('ATTENDERE QUI', '#ffe23a', '#2a1620', 360, 420) });
    for (const sd of [-1, 1]) { const b = rb(2.0, 3.0, 0.12, sm, 0, 1.5, sd * 0.35, 0.012); b.rotation.x = sd * 0.22; g.add(b); } }
  { const g = new THREE.Group(); g.position.set(17.2, 0, 31.5); scene.add(g); g.add(cyl(0.5, 0.7, 2.6, c3Prop('#d8322a', { rough: 0.35 }), 0, 1.3, 0, 0.015, 14));
    const gl = c3Mesh(new THREE.SphereGeometry(1.0, 18, 14), c3Prop('#e8f4ff', { rough: 0.05, transparent: true, opacity: 0.55 }), 0.012); gl.position.y = 3.5; g.add(gl);
    const cols = ['#ff4a4a', '#ffe23a', '#3a6ad8', '#3aa84a', '#ff9ab4']; for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), c3Prop(cols[i % 5], { rough: 0.3 })); b.position.set(Math.cos(i * 2.4) * 0.55 * ((i % 3) / 3 + 0.4), 3.0 + (i / 26) * 0.9, Math.sin(i * 2.4) * 0.55 * ((i % 3) / 3 + 0.4)); g.add(b); }
    g.add(cyl(0.55, 0.55, 0.3, c3Prop('#d8322a'), 0, 4.55, 0, 0.01, 14)); }
  { const g = new THREE.Group(); g.position.set(-28.5, 0, 22); scene.add(g); const dw = c3Prop('#4a2a1a', { rough: 0.5 }); g.add(cyl(0.1, 0.1, 8.4, dw, 0, 4.2, 0, 0.01, 8)); g.add(cyl(0.8, 0.9, 0.2, dw, 0, 0.1, 0, 0.01, 12));
    for (let i = 0; i < 4; i++) { const pg = cyl(0.05, 0.05, 1.0, dw, Math.cos(i * 1.57) * 0.4, 8.0, Math.sin(i * 1.57) * 0.4, 0.004, 5); pg.rotation.set(Math.sin(i * 1.57) * 0.9, 0, -Math.cos(i * 1.57) * 0.9); g.add(pg); }
    const coat = c3Mesh(new THREE.CylinderGeometry(0.5, 1.0, 3.6, 12), c3Prop('#5a4a3a', { rough: 0.8 }), 0.015); coat.position.set(0.35, 6.0, 0.2); g.add(coat);
    const hat = c3Mesh(new THREE.CylinderGeometry(0.55, 0.6, 0.6, 14), c3Prop('#2a2a30'), 0.01); hat.position.set(-0.4, 8.5, 0); g.add(hat); const br2 = c3Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.08, 16), c3Prop('#2a2a30'), 0.008); br2.position.set(-0.4, 8.22, 0); g.add(br2);
    const um = cyl(0.06, 0.06, 4.2, c3Prop('#3a6ad8'), -0.7, 2.1, 0.4, 0.006, 6); um.rotation.z = 0.12; g.add(um); const uc = c3Mesh(new THREE.ConeGeometry(0.42, 2.6, 8), c3Prop('#3a6ad8'), 0.01); uc.position.set(-0.85, 2.3, 0.4); g.add(uc); }
  { const g = new THREE.Group(); g.position.set(-24.5, 0, 52); scene.add(g); g.add(cyl(1.4, 1.4, 0.15, c3Prop('#7a3f22'), 0, 2.6, 0, 0.012, 18)); g.add(cyl(0.12, 0.12, 2.5, c3Prop('#3a2a2a'), 0, 1.3, 0, 0.006, 8));
    g.add(cyl(0.6, 0.35, 0.4, c3Prop('#e8f4ff', { rough: 0.05, transparent: true, opacity: 0.7 }), 0.5, 2.9, 0.2, 0.008, 14)); for (let i = 0; i < 7; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), c3Prop(['#ff4a4a', '#ffe23a', '#3aa84a'][i % 3])); c.position.set(0.5 + Math.cos(i) * 0.3, 3.05, 0.2 + Math.sin(i) * 0.3); g.add(c); }
    for (let i = 0; i < 3; i++) { const b = rb(0.9, 0.04, 1.3, c3Prop(['#3a6ad8', '#d8322a', '#2f8a3a'][i]), -0.5 + i * 0.1, 2.72 + i * 0.05, -0.3 + i * 0.12, 0.004); b.rotation.y = i * 0.3; g.add(b); } }
  // a ceiling banner and a CCTV camera
  { const bn = pl(12, 2.4, c3Flat('#ffffff', { map: bkdSignTex('MUTUO FORMAGGIO 3,2%', '#2f6a52', '#ffe23a', 1024, 200) }), 6, 24.5, 14); scene.add(bn); for (const x of [0.5, 11.5]) scene.add(cyl(0.03, 0.03, 6.5, c3Prop('#2a2a30'), x, 28.9, 14, 0, 4)); }
  { const g = new THREE.Group(); g.position.set(34.5, 27, 2); g.rotation.y = -2.3; scene.add(g); g.add(rb(0.5, 0.5, 0.8, c3Prop('#e8e8e8'), 0, 0, 0, 0.01)); g.add(rb(0.8, 0.7, 1.6, c3Prop('#f2f2f2'), 0, -0.5, 0.9, 0.012)); g.add(cyl(0.22, 0.22, 0.1, c3Prop('#2a2a30'), 0, -0.5, 1.72, 0.004, 10)); }
  { const cat = bkdCat(); cat.position.set(12.6, 0.02, 38.8); cat.rotation.y = -0.15; cat.userData.person = true; scene.add(cat); c3Layer(cat, C3.L_FOCUS); }
}

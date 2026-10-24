// =====================================================================
//  SET phone — the phone and the ride app: s03 s04 s05 s08 s09 s14 s15 s30. Registers SHOT_FN[id] = (t, u, lt) => { ... }.
//  A glossy rounded phone held in your ink-brown mitten hand, its screen a live canvas (a generic "RIDE" app, no real
//  brand), rain landing on the glass, a rainy neon street melting into bokeh behind. One reverse shot (s08) shows your
//  face lit by the screen. Everything is a pure function of t. Helpers are prefixed p1p.
// =====================================================================
const P1P = { SW: 600, SH: 1200, PW: 1.5, PH: 3.0, PD: 0.16 };

// ---- textures
function p1pNeon(txt, c1, c2) {
  return tex((x, w, h) => { x.fillStyle = '#0c0a14'; x.fillRect(0, 0, w, h); x.save(); x.shadowColor = c1; x.shadowBlur = h * 0.25;
    inked(x, txt, w / 2, h / 2, h * 0.6, c1, { stroke: c2, sw: h * 0.05 }); x.restore(); }, 512, 160);
}
function p1pWindows(seed, warm) {
  const t = tex((x, w, h) => { x.fillStyle = '#17142a'; x.fillRect(0, 0, w, h); const R = RNG('p1pwin', seed);
    for (let j = 0; j < 10; j++) for (let i = 0; i < 5; i++) { const on = R.f() < 0.5; x.fillStyle = on ? (warm ? '#ffcf8a' : '#9fd4ff') : '#231f3a';
      x.fillRect(i * w / 5 + 8, j * h / 10 + 8, w / 5 - 16, h / 10 - 16); } }, 256, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// ---- the screen: one canvas redrawn every frame from a state
const P1P_CV = document.createElement('canvas'); P1P_CV.width = P1P.SW; P1P_CV.height = P1P.SH;
const P1P_TEX = new THREE.CanvasTexture(P1P_CV); P1P_TEX.encoding = THREE.sRGBEncoding; P1P_TEX.anisotropy = 8;
const p1pRR = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect(a, b, w, h, r); };
function p1pBattery(x, px, py, s, pct, red, blinkOn) {   // battery icon: outline, tip, fill
  x.save(); x.lineWidth = s * 0.09; x.strokeStyle = red ? '#ff4d4d' : '#ffffff';
  p1pRR(x, px, py, s * 2, s, s * 0.22); x.stroke(); x.fillStyle = x.strokeStyle; x.fillRect(px + s * 2.05, py + s * 0.3, s * 0.18, s * 0.4);
  if (blinkOn) { x.fillStyle = red ? '#ff3b3b' : '#ffffff'; p1pRR(x, px + s * 0.16, py + s * 0.16, Math.max(s * 0.1, (s * 2 - s * 0.32) * pct / 100), s * 0.68, s * 0.12); x.fill(); }
  x.restore();
}
function p1pMap(x, w, h, t, shift) {   // dark city map, glowing roads, little cars driving
  x.fillStyle = '#141a2c'; x.fillRect(0, 0, w, h);
  x.save(); x.translate(0, shift);
  const R = RNG('p1pmap'); x.fillStyle = '#1b2440';
  for (let i = 0; i < 26; i++) { x.fillRect(R.r(0, w), R.r(0, h), R.r(60, 160), R.r(60, 160)); }
  x.strokeStyle = '#2c3a66'; x.lineWidth = 22; x.lineCap = 'round';
  const roads = [[[-20, 300], [w + 20, 380]], [[-20, 760], [w + 20, 690]], [[150, -20], [210, h + 20]], [[440, -20], [400, h + 20]]];
  roads.forEach(([a, b]) => { x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); });
  x.strokeStyle = '#3b4f8a'; x.lineWidth = 8; roads.forEach(([a, b]) => { x.beginPath(); x.moveTo(...a); x.lineTo(...b); x.stroke(); });
  // the route and the pin
  x.strokeStyle = '#38e0b0'; x.lineWidth = 12; x.setLineDash([2, 22]); x.beginPath(); x.moveTo(205, 980); x.lineTo(185, 720); x.lineTo(420, 660); x.lineTo(410, 360); x.stroke(); x.setLineDash([]);
  x.fillStyle = '#ff5a7a'; x.beginPath(); x.arc(410, 340, 22, 0, TAU); x.fill(); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(410, 340, 8, 0, TAU); x.fill();
  // cars: small rounded rectangles sliding along the roads
  for (let i = 0; i < 6; i++) { const k = mod(t * 0.12 + i * 0.17, 1), road = roads[i % 4], cx = lerp(road[0][0], road[1][0], k), cy = lerp(road[0][1], road[1][1], k);
    x.save(); x.translate(cx, cy); x.rotate(Math.atan2(road[1][1] - road[0][1], road[1][0] - road[0][0])); x.fillStyle = '#f7d046'; p1pRR(x, -20, -11, 40, 22, 7); x.fill(); x.fillStyle = '#3a2a10'; x.fillRect(6, -8, 8, 16); x.restore(); }
  x.restore();
}
function p1pDrops(x, w, h, t, n = 26) {   // rain landing on the glass: each drop appears at its own time and slowly slides
  const R = RNG('p1pdrops');
  for (let i = 0; i < n; i++) {
    const t0 = R.r(-4, 60), px = R.r(20, w - 20), py0 = R.r(20, h - 40), r = R.r(10, 28), age = t - t0;
    if (age < 0) continue;
    const py = py0 + Math.max(0, age - 0.6) * R.r(5, 35) * (r / 20), a = Math.min(1, age * 8) * Math.exp(-Math.max(0, age - 6) * 0.4);
    if (a < 0.03 || py > h) continue;
    x.save(); x.globalAlpha = a * 0.85;
    const g = x.createRadialGradient(px - r * 0.3, py - r * 0.35, r * 0.1, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,0.55)'); g.addColorStop(0.45, 'rgba(200,225,255,0.14)'); g.addColorStop(0.85, 'rgba(10,20,40,0.30)'); g.addColorStop(1, 'rgba(255,255,255,0.0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r * 0.9, r, 0, 0, TAU); x.fill();
    x.restore();
  }
}
// st: { mode: 'home'|'map', battery, blink, price, surge, card, popup, accept, press, ripple, dim, black, reflect, eye, eyeOpen, shift, finding }
function p1pScreen(t, st) {
  const x = P1P_CV.getContext('2d'), w = P1P.SW, h = P1P.SH;
  x.save(); x.clearRect(0, 0, w, h);
  if (st.black) {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#07080c'); g.addColorStop(1, '#0d0f15'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    if (st.reflect > 0) {   // your face reflected in the dead glass
      x.save(); x.globalAlpha = 0.32 * st.reflect; x.translate(w * 0.52, h * 0.42); x.scale(-1, 1);
      const hd = asset('spr_head_white.png'), fc = asset('face_unimpressed.png'), hr = asset('spr_hair_ref_cap.png');
      if (hd) x.drawImage(hd, -190, -190, 380, 380); if (fc) x.drawImage(fc, -228, -228, 456, 456); if (hr) x.drawImage(hr, -200, -270, 400, 260);
      x.restore();
    }
    x.save(); x.globalAlpha = 0.16; const s = x.createLinearGradient(0, 0, w, h * 0.6); s.addColorStop(0.3, 'rgba(255,255,255,0)'); s.addColorStop(0.42, 'rgba(255,255,255,1)'); s.addColorStop(0.5, 'rgba(255,255,255,0)');
    x.fillStyle = s; x.fillRect(0, 0, w, h); x.restore();
    if (st.collapse > 0 && st.collapse < 1) {   // power-down: the picture collapses to a bright line, then a dot
      const k = st.collapse; x.fillStyle = '#e8f4ff'; const lh = Math.max(3, h * (1 - k * 3) * 0.5); x.globalAlpha = 1 - k;
      x.fillRect(w * 0.5 - w * 0.5 * (1 - Math.max(0, k - 0.5) * 2), h / 2 - lh / 2, w * (1 - Math.max(0, k - 0.5) * 2), lh);
    }
    p1pDrops(x, w, h, t); x.restore(); P1P_TEX.needsUpdate = true; return;
  }
  if (st.mode === 'home') {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a2a78'); g.addColorStop(1, '#e0558a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const icons = ['#5ac8fa', '#ffcc00', '#34c759', '#ff9500', '#af52de', '#ff3b30', '#64d2ff', '#30d158'];
    icons.forEach((c, i) => { const cx = 80 + (i % 4) * 147, cy = 330 + Math.floor(i / 4) * 170; x.fillStyle = c; p1pRR(x, cx - 50, cy - 50, 100, 100, 26); x.fill(); });
    // the RIDE app icon, tapped on "open"
    const k = st.tap ?? 0, sc = 1 - 0.12 * Math.sin(Math.PI * clamp(k));
    x.save(); x.translate(w / 2, 760); x.scale(sc, sc); x.fillStyle = '#111318'; p1pRR(x, -70, -70, 140, 140, 36); x.fill();
    inked(x, 'RIDE', 0, 4, 44, '#38e0b0', { stroke: false }); x.restore();
    inked(x, 'RIDE', w / 2, 860, 28, '#ffffff', { stroke: false, weight: 700 });
    if (st.splash > 0) {   // the app opens out of its icon
      const s = EZ.o3(st.splash); x.save(); x.globalAlpha = Math.min(1, st.splash * 3); x.fillStyle = '#111318';
      const ww = lerp(140, w * 1.2, s), hh = lerp(140, h * 1.2, s); p1pRR(x, w / 2 - ww / 2, lerp(760, h / 2, s) - hh / 2, ww, hh, lerp(36, 0, s)); x.fill();
      inked(x, 'RIDE', w / 2, lerp(764, h / 2, s), lerp(44, 120, s), '#38e0b0', { stroke: false }); x.restore();
    }
  } else {
    p1pMap(x, w, h, t, st.shift ?? 0);
    // top search bar
    x.fillStyle = 'rgba(255,255,255,0.95)'; p1pRR(x, 40, 120, w - 80, 86, 43); x.fill(); x.fillStyle = '#1a1d26'; x.font = '600 34px Arial'; x.textAlign = 'left'; x.fillText('Where to?  Home', 90, 175);
    if (st.card != null) {   // the ride card slides up from the bottom
      const cy = lerp(h + 20, h - 520, EZ.o3(st.card));
      x.save(); x.shadowColor = 'rgba(0,0,0,0.5)'; x.shadowBlur = 30; x.fillStyle = '#ffffff'; p1pRR(x, 0, cy, w, 560, 46); x.fill(); x.restore();
      x.fillStyle = '#d6d9e0'; p1pRR(x, w / 2 - 50, cy + 18, 100, 10, 5); x.fill();
      // car icon + text
      x.fillStyle = '#f7d046'; p1pRR(x, 50, cy + 70, 120, 64, 20); x.fill(); x.fillStyle = '#1a1d26'; x.beginPath(); x.arc(80, cy + 136, 14, 0, TAU); x.arc(140, cy + 136, 14, 0, TAU); x.fill();
      x.font = '800 40px Arial'; x.textAlign = 'left'; x.fillText('RIDE Standard', 200, cy + 100); x.font = '500 28px Arial'; x.fillStyle = '#6a6f7c'; x.fillText('4 min away · 4 seats', 200, cy + 142);
      // the price: big, rolling digits
      const p = st.price ?? 18.4, surge = st.surge ?? 0;
      x.fillStyle = surge > 0.5 ? '#e0213a' : '#1a1d26'; x.font = '900 112px Arial'; x.textAlign = 'center'; x.fillText('$' + p.toFixed(2), w / 2, cy + 300);
      if (surge > 0) { x.save(); x.globalAlpha = surge; const sx = w / 2, sy = cy + 360; x.fillStyle = '#e0213a'; p1pRR(x, sx - 210, sy - 30, 420, 60, 30); x.fill();
        x.fillStyle = '#ffffff'; x.font = '800 30px Arial'; x.fillText('⚡ HIGH DEMAND  1.9×', sx, sy + 11); x.restore(); }
      // the accept button
      if (st.accept != null) {
        const bx = w / 2, by = cy + 470, press = st.press ?? 0, s = 1 - 0.1 * press, done = st.accepted ?? 0;
        x.save(); x.translate(bx, by); x.scale(s * (1 + 0.04 * press), s); x.fillStyle = done > 0.5 ? '#16a34a' : '#111318'; p1pRR(x, -250, -52, 500, 104, 52); x.fill();
        x.fillStyle = '#ffffff'; x.font = '900 48px Arial'; x.fillText(done > 0.5 ? '✓ ACCEPTED' : 'ACCEPT · $' + p.toFixed(2), 0, 17); x.restore();
        if (st.ripple > 0 && st.ripple < 1) { x.save(); x.globalAlpha = (1 - st.ripple) * 0.7; x.strokeStyle = '#38e0b0'; x.lineWidth = 14 * (1 - st.ripple) + 2;
          x.beginPath(); x.arc(bx, by, 60 + 320 * EZ.o2(st.ripple), 0, TAU); x.stroke(); x.restore(); }
      }
      if (st.finding > 0) { x.save(); x.globalAlpha = st.finding; x.fillStyle = 'rgba(255,255,255,0.97)'; p1pRR(x, 0, cy, w, 560, 46); x.fill();
        x.fillStyle = '#1a1d26'; x.font = '800 44px Arial'; x.fillText('Finding your driver…', w / 2, cy + 200);
        x.strokeStyle = '#38e0b0'; x.lineWidth = 12; x.lineCap = 'round'; x.beginPath(); x.arc(w / 2, cy + 330, 50, t * 7, t * 7 + 4.2); x.stroke(); x.restore(); }
    }
  }
  // status bar
  x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, w, 86); x.fillStyle = '#ffffff'; x.font = '700 34px Arial'; x.textAlign = 'left'; x.fillText('11:48', 34, 58);
  const bs = st.bigBattery ?? 0, bat = st.battery ?? 1, red = bat <= 5, on = !st.blink || Math.floor(t * 4) % 2 === 0;
  if (red) { x.fillStyle = '#ff4d4d'; x.font = '800 30px Arial'; x.textAlign = 'right'; x.fillText(Math.round(bat) + '%', w - 108, 56); }
  p1pBattery(x, w - 96, 34, 28, bat, red, on);
  if (bs > 0) {   // the battery icon blown up in the middle of the screen (s03 "1%", s30)
    x.save(); x.globalAlpha = Math.min(1, bs * 2); const bg2 = x.createRadialGradient(w / 2, h * 0.45, 40, w / 2, h * 0.45, h * 0.7); bg2.addColorStop(0, '#3a0d18'); bg2.addColorStop(1, '#07060c'); x.fillStyle = bg2; x.fillRect(0, 0, w, h);
    const s = 120 * EZ.back(bs); p1pBattery(x, w / 2 - s * 1.1, h * 0.36 - s / 2, s, bat, red, on);   // kept high: the subtitle band is lower
    x.fillStyle = '#ff4d4d'; x.font = `900 ${Math.round(140 * EZ.back(bs))}px Arial`; x.textAlign = 'center'; x.fillText(Math.round(bat) + '%', w / 2, h * 0.36 + s * 1.45);
    if (st.eye > 0) {   // "but it noticed": an eye opens above the icon and looks at you
      const ey = h * 0.17, ew = 150, op = EZ.o3(st.eyeOpen ?? 0), look = st.look ?? 0;
      x.save(); x.globalAlpha = st.eye; x.beginPath(); x.moveTo(w / 2 - ew, ey); x.quadraticCurveTo(w / 2, ey - ew * 1.05 * op, w / 2 + ew, ey); x.quadraticCurveTo(w / 2, ey + ew * 1.05 * op, w / 2 - ew, ey); x.closePath();
      x.fillStyle = '#f4f1e8'; x.fill(); x.save(); x.clip(); x.fillStyle = '#d62f3a'; x.beginPath(); x.arc(w / 2 + look * 20, ey, 60, 0, TAU); x.fill(); x.fillStyle = '#111'; x.beginPath(); x.arc(w / 2 + look * 20, ey, 28, 0, TAU); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(w / 2 + look * 20 - 14, ey - 14, 9, 0, TAU); x.fill(); x.restore();
      x.lineWidth = 12; x.strokeStyle = '#ff4d4d'; x.beginPath(); x.moveTo(w / 2 - ew, ey); x.quadraticCurveTo(w / 2, ey - ew * 1.05 * op, w / 2 + ew, ey); x.quadraticCurveTo(w / 2, ey + ew * 1.05 * op, w / 2 - ew, ey); x.stroke(); x.restore();
    }
    x.restore();
  }
  if (st.popup > 0) {   // Battery Saver slides down from the top
    const py = lerp(-260, 130, EZ.back(st.popup)); x.save(); x.shadowColor = 'rgba(0,0,0,0.6)'; x.shadowBlur = 40; x.fillStyle = '#26262c'; p1pRR(x, 30, py, w - 60, 230, 40); x.fill(); x.restore();
    p1pBattery(x, 70, py + 50, 40, 1, true, true); x.fillStyle = '#ffd60a'; x.font = '800 44px Arial'; x.textAlign = 'left'; x.fillText('Battery Saver ON', 70, py + 150);
    x.fillStyle = '#c9c9d1'; x.font = '500 30px Arial'; x.fillText('1% left. Screen dimmed.', 70, py + 196);
  }
  if ((st.dim ?? 0) > 0) { x.fillStyle = `rgba(0,0,0,${0.55 * st.dim})`; x.fillRect(0, 0, w, h); }
  p1pDrops(x, w, h, t);
  x.restore(); P1P_TEX.needsUpdate = true;
}

// ---- the world: the phone (+ your mitten hand), you (for the reverse shot), the rainy neon street behind
function p1pBuild() {
  if (S.p1p) return S.p1p;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, W / H, 0.05, 400);
  scene.add(new THREE.AmbientLight('#7a86c8', 0.45)); scene.add(new THREE.HemisphereLight('#6a7ad8', '#1a0c20', 0.5));
  const key = new THREE.DirectionalLight('#b8c8ff', 0.7); key.position.set(-6, 12, 10); scene.add(key);
  const pink = new THREE.PointLight('#ff4fa8', 2.2, 40, 1.4); pink.position.set(-7, 6, -6); scene.add(pink);
  const cyan = new THREE.PointLight('#3fe0ff', 2.0, 40, 1.4); cyan.position.set(8, 5, -4); scene.add(cyan);
  scene.children.forEach((c) => c.isLight && c.layers.enableAll());
  const M = { body: c3Prop('#16171f', { rough: 0.18, metal: 0.4 }), frame: c3Chrome('#c8ccd8'), lens: c3Prop('#05060a', { rough: 0.05 }),
    street: c3Prop('#15131e', { rough: 0.12, metal: 0.5 }), wall: c3Prop('#241d36', { rough: 0.7 }), ink: c3Flat(C3.ink) };
  // street: wet asphalt, buildings with lit windows and neon signs, lamps, all far behind (BG layer)
  const bg = new THREE.Group(); scene.add(bg);
  const road = pl(160, 160, M.street, 0, -6, -40, 0, -Math.PI / 2); bg.add(road);
  const signs = [['HOTEL', '#ff4fa8', '#ffd0ea'], ['NOODLES', '#3fe0ff', '#d4f8ff'], ['OPEN 24H', '#ffd23f', '#fff4c8'], ['BAR', '#ff5a3a', '#ffd8c8'], ['TAXI', '#f7d046', '#fff5c0']];
  for (let i = 0; i < 9; i++) {
    const R = RNG('p1pb', i), side = i % 2 ? 1 : -1, bw = R.r(7, 11), bh = R.r(18, 34), z = -14 - i * 6, x0 = side * R.r(8, 13);
    const tx = p1pWindows(i, i % 3 === 0); tx.repeat.set(bw / 4, bh / 6);
    const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bw), c3Prop('#ffffff', { map: tx, rough: 0.5, emissive: '#ffffff', ei: 0.7, emissiveMap: tx })); b.position.set(x0, bh / 2 - 6, z); bg.add(b);
    const [txt, c1, c2] = signs[i % signs.length], sg = pl(5.5, 1.7, c3Flat('#ffffff', { map: p1pNeon(txt, c1, c2), glow: c1 }), x0 - side * (bw / 2 + 0.05), R.r(-1, 3), z + R.n(1.5), side > 0 ? -Math.PI / 2 : Math.PI / 2);
    bg.add(sg);
  }
  for (let i = 0; i < 8; i++) {   // street lamps: glowing heads = bokeh balls
    const z = -10 - i * 7, sx = i % 2 ? 6 : -6, pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 9, 8), M.body); pole.position.set(sx, -1.5, z); bg.add(pole);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 10), c3Flat('#ffe3a8', { glow: '#ffc870' })); head.position.set(sx, 3.2, z); bg.add(head);
  }
  for (let i = 0; i < 14; i++) {   // car tail lights and headlights far down the street
    const R = RNG('p1pcar', i), m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), c3Flat(i % 2 ? '#ff3030' : '#fff2c8', { glow: i % 2 ? '#ff2020' : '#fff0c0' }));
    m.position.set(R.r(-5, 5), -4.8, -20 - R.r(0, 50)); bg.add(m);
  }
  // rain streaks: falling instanced slivers (background, and a few big blurred ones near the lens)
  const streak = new THREE.PlaneGeometry(0.025, 0.7), rainM = new THREE.MeshBasicMaterial({ color: '#c9dcff', transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false });
  const rain = new THREE.InstancedMesh(streak, rainM, 900); rain.frustumCulled = false; bg.add(rain);
  const nearRainM = new THREE.MeshBasicMaterial({ color: '#dce8ff', transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false });
  const nearRain = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.006, 0.22), nearRainM, 16); nearRain.frustumCulled = false; scene.add(nearRain);
  c3Layer(bg, C3.L_BG); c3Layer(nearRain, C3.L_NEAR);
  // the phone: rounded glossy body, chrome band, the screen canvas, a camera bump on the back
  const phone = new THREE.Group(); scene.add(phone);
  phone.add(c3Mesh(c3RBox(P1P.PW, P1P.PH, P1P.PD, 0.2, 5), M.body, 0.03));
  const band = new THREE.Mesh(c3RBox(P1P.PW + 0.02, P1P.PH + 0.02, P1P.PD * 0.55, 0.2, 5), M.frame); phone.add(band);
  const screenM = new THREE.MeshBasicMaterial({ map: P1P_TEX, toneMapped: false }); screenM.userData.glow = '#2a3550';
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(P1P.PW - 0.12, P1P.PH - 0.12), screenM); scr.position.z = P1P.PD / 2 + 0.003; phone.add(scr);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(P1P.PW - 0.1, P1P.PH - 0.1), new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.03, metalness: 0, transparent: true, opacity: 0.04, envMapIntensity: 1.2 }));
  glass.position.z = P1P.PD / 2 + 0.006; phone.add(glass);
  const bump = c3Mesh(c3RBox(0.55, 0.55, 0.08, 0.12), M.body, 0.02); bump.position.set(-0.38, 1.05, -P1P.PD / 2 - 0.03); phone.add(bump);
  for (const [lx, ly] of [[-0.5, 1.17], [-0.26, 0.93]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 20), M.lens); l.rotation.x = Math.PI / 2; l.position.set(lx, ly, -P1P.PD / 2 - 0.08); phone.add(l); }
  // your mitten hand: an ink-brown palm behind the phone's lower left, a thumb over the edge, the arm going off frame
  const hand = new THREE.Group(); phone.add(hand);
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 18), M.ink); palm.scale.set(1, 1.2, 0.55); palm.position.set(-0.55, -1.05, -0.32); hand.add(palm);
  const thumb = new THREE.Group(); thumb.position.set(-0.82, -0.7, 0.12); hand.add(thumb);
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.55, 6, 12), M.ink); th.rotation.z = -0.9; th.position.set(0.18, 0.12, 0); thumb.add(th);
  const fingers = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.5, 6, 12), M.ink); fingers.rotation.z = Math.PI / 2; fingers.position.set(0.72, -1.2, -0.12); hand.add(fingers);
  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 3.2, 6, 12), M.ink); arm.position.set(-1.2, -2.6, -0.5); arm.rotation.z = 0.5; hand.add(arm);
  // the pressing finger (s14): another mitten coming in from the right
  const presser = new THREE.Group(); scene.add(presser);
  const pf = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.6, 6, 12), M.ink); pf.rotation.z = 0.5; presser.add(pf);
  const pfist = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 14), M.ink); pfist.scale.set(1, 0.9, 0.6); pfist.position.set(0.55, -0.75, -0.2); presser.add(pfist);
  const parm = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 3.0, 6, 12), M.ink); parm.position.set(1.4, -2.2, -0.3); parm.rotation.z = 0.55; presser.add(parm);
  c3Layer(phone, C3.L_FOCUS); c3Layer(presser, C3.L_FOCUS);
  // you, for the reverse shot (s08): the phone turns its back to the camera in front of your chest
  const you = c3Person({ key: 'you', outfit: 'teal', hairStyle: 'ref' }); scene.add(you.g); c3Layer(you.g, C3.L_FOCUS);
  you.g.traverse((m) => { if (m.material && m.material.color) m.userData.c0 = m.material.color.clone(); });
  const faceGlow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: C3_SPR.__shadow || null, color: '#7fd8ff', transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  scene.add(faceGlow); c3Layer(faceGlow, C3.L_FOCUS);
  c3Env(scene, { top: '#6a5ad0', mid: '#2a2044', bot: '#08060e', cards: [[-20, 10, -10, 8, 18, '#ff4fa8'], [20, 8, -10, 8, 18, '#3fe0ff'], [0, 30, 0, 30, 6, '#c8d4ff'], [0, 6, 30, 16, 6, '#ffd0a0']] });
  S.p1p = { scene, cam, phone, hand, thumb, presser, you, faceGlow, screenM, rain, nearRain, bg };
  return S.p1p;
}
// tint you as if lit by the screen: k = brightness, plus a cool cast
function p1pTint(d, k, cool = 0.25) {
  d.you.g.traverse((m) => { const c0 = m.userData.c0; if (!c0 || !m.material.color) return; m.material.color.setRGB(c0.r * k * (1 - cool * 0.35), c0.g * k * (1 - cool * 0.1), c0.b * k * (1 + cool * 0.15)); });
}
const P1P_M4 = new THREE.Matrix4(), P1P_Q = new THREE.Quaternion(), P1P_S = new THREE.Vector3(1, 1, 1);
function p1pRain(d, t) {
  const R = RNG('p1prain');
  for (let i = 0; i < 900; i++) {
    const x = R.r(-26, 26), z = R.r(-70, -4), y0 = R.r(-6, 30), v = R.r(16, 22), y = mod(y0 - t * v, 36) - 6;
    P1P_M4.compose(c3V(x, y, z), P1P_Q.setFromAxisAngle(c3V(0, 0, 1), 0.12), P1P_S); d.rain.setMatrixAt(i, P1P_M4);
  }
  d.rain.instanceMatrix.needsUpdate = true;
  // near streaks in camera space, falling through the frame (they are blurred on the near layer)
  d.cam.updateMatrixWorld(true); const R2 = RNG('p1pnear');
  for (let i = 0; i < 16; i++) {
    const dist = R2.r(1.2, 2.6), hh = dist * Math.tan(d.cam.fov * DEG / 2), hw = hh * d.cam.aspect;
    const nx = R2.r(-1.1, 1.1), ny = mod(R2.r(0, 2.4) - t * R2.r(1.6, 2.4), 2.4) - 1.2;
    const p = d.cam.localToWorld(c3V(nx * hw, ny * hh, -dist)); P1P_M4.compose(p, d.cam.quaternion.clone().multiply(P1P_Q.setFromAxisAngle(c3V(0, 0, 1), 0.12)), P1P_S); d.nearRain.setMatrixAt(i, P1P_M4);
  }
  d.nearRain.instanceMatrix.needsUpdate = true;
}
// the camera never stops: creep accelerating through the shot end (as in apple-wayne's sets)
function p1pMove(lt, dur, A, B, k = 0.55) {
  const x = lt / dur, p = x <= 1 ? (1 - k) * x + k * x * x * x : 1 + (1 + 2 * k) * (x - 1);
  return { p: A.p.map((v, i) => lerp(v, B.p[i], p)), l: A.l.map((v, i) => lerp(v, B.l[i], p)), fov: lerp(A.fov ?? 45, B.fov ?? 45, p) };
}
const p1pDur = (id) => { const i = SHOT_LIST.findIndex((s) => s[0] === id); return shotSpan(i)[1] - shotSpan(i)[0]; };
// POV phone pose: held in front of you, a little tilted, breathing with the hand (hops)
function p1pHold(d, t, o = {}) {
  d.phone.visible = true; d.you.g.visible = false; d.phone.scale.setScalar(1); d.faceGlow.material.opacity = 0; d.presser.visible = !!o.presser;
  d.phone.position.set(c3Hop('p1ph x', t, 0.03) + (o.x ?? 0), c3Hop('p1ph y', t, 0.03) + (o.y ?? 0), 0);
  d.phone.rotation.set(-0.08 + (o.rx ?? 0), (o.ry ?? 0.12) + c3Hop('p1ph r', t, 0.015), (o.rz ?? -0.05) + c3Hop('p1ph z', t, 0.01));
  d.hand.visible = o.hand !== false;
}
function p1pRender(d, t, o = {}) {
  p1pRain(d, t);
  c3Render(d.scene, d.cam, { bg: '#0a0812', bgBlur: o.bgBlur ?? 9, nearBlur: o.nearBlur ?? 9, glow: o.glow ?? 0.55, glowBlur: 16, bloom: o.bloom ?? 0.34 });
}
// screen-space camera helper: a camera k units in front of the phone's screen, looking at a screen point (sx, sy in phone units)
const p1pAt = (sx, sy, dist, ox = 0, oy = 0, fov = 40) => ({ p: [sx + ox, sy + oy, dist], l: [sx, sy, 0], fov });

// ---- s03 "and your phone is at 1%." — close on the phone in your hand; the battery blows up to a red 1% on "1%"
SHOT_FN.s03 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s03'), t1 = wordT('1%') ?? 2.62;
  p1pHold(d, t);
  const bs = clamp((t - (t1 - 0.06)) / 0.28);
  p1pScreen(t, { mode: 'home', battery: t < t1 - 0.06 ? 3 : 1, blink: t > t1, bigBattery: bs });
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0.3, 0.2, 7.6, 1.6, -0.6, 42), p1pAt(0.15, 0.25, 4.6, 0.7, -0.2, 40)));
  p1pRender(d, t, { bgBlur: lerp(6, 11, u) });
};
// ---- s04 "You open the ride app," — your thumb taps RIDE on "open", the app bursts out of its icon
SHOT_FN.s04 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s04'), to = wordT('open') ?? 3.6, ta = wordT('app') ?? 4.2;
  p1pHold(d, t, { ry: -0.1, rz: 0.04 });
  const tap = clamp((t - (to - 0.12)) / 0.24); d.thumb.position.set(-0.9 + 0.8 * Math.sin(Math.PI * tap), -1.25 + 0.6 * Math.sin(Math.PI * tap), 0.12 + 0.1 * Math.sin(Math.PI * tap));
  const sp = clamp((t - to) / 0.5);
  if (t < ta + 0.05) p1pScreen(t, { mode: 'home', battery: 1, blink: true, tap, splash: sp });
  else p1pScreen(t, { mode: 'map', battery: 1, blink: true, shift: -60 * (t - ta) });
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0, -0.1, 5.2, -1.3, 0.5, 42), p1pAt(0, 0.1, 4.2, 0.4, 0.2, 40)));
  p1pRender(d, t, { bgBlur: lerp(11, 8, u) });
};
// ---- s05 "and the price is almost double." — the ride card slides up; the price rolls up and lands at $34.90 on "double"
SHOT_FN.s05 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s05'), tp = wordT('price') ?? 4.7, td = wordT('double') ?? 5.24;
  p1pHold(d, t, { ry: 0.08 }); d.thumb.position.set(-0.9, -1.25, 0.12);
  const k = clamp((t - tp) / (td - tp)), price = t >= td ? 34.9 : Math.min(34.79, 18.4 + (34.9 - 18.4) * (1 - (1 - k) ** 3) + Math.floor(t * 30) % 7 * 0.11);   // rolls up, lands exactly on "double"
  p1pScreen(t, { mode: 'map', battery: 1, blink: true, card: clamp((t - 4.52) / 0.35), price, surge: clamp((t - td) / 0.15), shift: -60 * (t - 4.2) });
  // push into the price; a small jolt of the hand when it lands
  const jolt = t > td ? 0.06 * Math.exp(-(t - td) * 9) * Math.sin((t - td) * 40) : 0; d.phone.position.y += jolt;
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0, -0.6, 5.0, 0.9, 0.3, 40), p1pAt(0, -0.75, 2.9, 0.3, 0.1, 38)));
  p1pRender(d, t, { bgBlur: lerp(9, 12, u) });
};
// ---- s08 "Then the screen dims." — the reverse shot: your face lit by the screen; on "dims" the light drops
SHOT_FN.s08 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s08'), tdim = wordT('dims') ?? 8.8;
  d.phone.visible = true; d.presser.visible = false; d.hand.visible = false; d.you.g.visible = true;
  d.you.g.position.set(0, -3.9, -1.2); d.you.g.scale.setScalar(1);
  d.phone.position.set(-0.05, -2.05, 0.45); d.phone.rotation.set(-1.0, Math.PI + 0.1, 0.05); d.phone.scale.setScalar(0.5);
  const dim = clamp((t - (tdim - 0.05)) / 0.35);
  p1pScreen(t, { mode: 'map', battery: 1, blink: true, card: 1, price: 34.9, surge: 1, dim });
  c3SetCam(d.cam, p1pMove(lt, dur, { p: [1.0, -0.9, 9.0], l: [0, -0.7, -1.2], fov: 44 }, { p: [0.35, -0.6, 6.8], l: [0, -0.45, -1.2], fov: 42 }));
  c3PersonPose(d.you, d.cam, t, { expr: c3FaceAt([[0, 'smug'], [tdim, 'worried']], t, 'you'), gaze: [0, -0.7], head: [0.03, 0, -0.08],
    hand: { armL: [0.42, 1.75], armR: [-0.42, 1.75] }, shadow: 0 });
  const k = lerp(1.0, 0.5, dim); p1pTint(d, k, lerp(0.35, 0.6, dim));
  d.faceGlow.position.set(0, -0.4, -0.95); d.faceGlow.scale.set(3.6, 3.4, 1); d.faceGlow.lookAt(d.cam.position); d.faceGlow.material.opacity = lerp(0.35, 0.08, dim);
  p1pRender(d, t, { bgBlur: lerp(10, 13, u), glow: lerp(0.6, 0.3, dim) });
  p1pTint(d, 1, 0);
};
// ---- s09 "Battery saver kicks in," — the popup drops in on "Battery", the screen dims a notch more on "kicks"
SHOT_FN.s09 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s09'), tb = wordT('battery') ?? 9.56, tk = wordT('kicks') ?? 10.32;
  p1pHold(d, t, { ry: -0.14, rz: 0.06 }); d.thumb.position.set(-0.9, -1.25, 0.12);
  p1pScreen(t, { mode: 'map', battery: 1, blink: true, card: 1, price: 34.9, surge: 1, popup: clamp((t - (tb - 0.1)) / 0.35), dim: 0.55 + 0.35 * clamp((t - tk) / 0.2) });
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0, 0.6, 5.6, -1.2, 0.8, 42), p1pAt(0, 0.8, 3.6, -0.3, 0.3, 40)));
  p1pRender(d, t, { bgBlur: lerp(8, 12, u), glow: 0.4 });
};
// ---- s14 "So you smash accept," — a mitten comes in and smashes ACCEPT on "smash"; ripple; ACCEPTED on "accept"
SHOT_FN.s14 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s14'), ts = wordT('smash') ?? 17.08, ta = wordT('accept') ?? 17.38;
  p1pHold(d, t, { ry: 0.05, rz: -0.02, presser: true }); d.thumb.position.set(-0.9, -1.25, 0.12);
  const hit = ts + 0.18, k = t < hit ? EZ.i3(clamp((t - (ts - 0.25)) / 0.43)) : 1 - EZ.o2(clamp((t - hit - 0.12) / 0.4)) * 0.85;
  const press = t >= hit ? Math.exp(-(t - hit) * 7) : 0;
  // button centre in phone space (card at the bottom): x 0, y about -1.0
  d.presser.position.set(lerp(2.6, 0.12, k), lerp(-2.8, -1.05, k), lerp(2.2, P1P.PD / 2 + 0.22 - 0.1 * press, k)); d.presser.rotation.set(0, 0, 0.1 * press);
  d.phone.position.z -= 0.08 * press; d.phone.rotation.x -= 0.05 * press;
  p1pScreen(t, { mode: 'map', battery: 1, blink: true, card: 1, price: 34.9, surge: 1, accept: 1, press, ripple: clamp((t - hit) / 0.5), accepted: t > ta ? 1 : 0, dim: 0.75 });
  const punch = t > hit ? 0.35 * Math.exp(-(t - hit) * 6) : 0;   // a zoom punch on the hit (no shake)
  const c = p1pMove(lt, dur, p1pAt(0, -0.85, 4.4, 1.0, -0.4, 42), p1pAt(0, -0.95, 3.1, 0.4, -0.2, 40)); c.p[2] -= punch;
  c3SetCam(d.cam, c);
  p1pRender(d, t, { bgBlur: lerp(10, 13, u), glow: 0.45 });
};
// ---- s15 "and the screen goes black two seconds later." — Finding your driver…, then the picture collapses on "black":
// a dead black glass with your face reflected in it and the rain
SHOT_FN.s15 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s15'), tb = (wordT('two') ?? 19.04) - 0.02;
  p1pHold(d, t, { ry: -0.06, rz: 0.03 }); d.thumb.position.set(-0.9, -1.25, 0.12);
  if (t < tb) p1pScreen(t, { mode: 'map', battery: 1, blink: true, card: 1, price: 34.9, surge: 1, finding: 1, dim: 0.75 });
  else p1pScreen(t, { black: true, collapse: clamp((t - tb) / 0.25), reflect: clamp((t - tb - 0.3) / 0.5) });
  d.screenM.userData.glow = t < tb ? '#2a3550' : null;
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0, 0, 5.6, 1.0, 0.4, 42), p1pAt(0, 0.15, 3.4, 0.2, 0.15, 40)));
  p1pRender(d, t, { bgBlur: lerp(9, 13, u), glow: t < tb ? 0.45 : 0.35 });
  d.screenM.userData.glow = '#2a3550';
};
// ---- s30 "But it noticed." — the red 1% fills the screen and an eye opens above it on "noticed", looking at you
SHOT_FN.s30 = (t, u, lt) => {
  const d = p1pBuild(), dur = p1pDur('s30'), tn = wordT('noticed') ?? 52.38;
  p1pHold(d, t, { ry: 0.0, rz: 0.0 }); d.thumb.position.set(-0.9, -1.25, 0.12);
  p1pScreen(t, { mode: 'home', battery: 1, blink: true, bigBattery: 1, eye: clamp((t - (tn - 0.2)) / 0.15), eyeOpen: clamp((t - (tn - 0.12)) / 0.25), look: Math.sin(t * 3) * 0.3 });
  c3SetCam(d.cam, p1pMove(lt, dur, p1pAt(0, 0.35, 4.6, 0.3, 0.1, 40), p1pAt(0, 0.4, 2.6, 0.05, 0.02, 38), 0.6));
  p1pRender(d, t, { bgBlur: lerp(11, 14, u), glow: 0.6 });
};

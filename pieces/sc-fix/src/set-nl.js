// =====================================================================
//  SET nl — the Netherlands: s19 (a canal street, the supermarket chain's HQ at its end), s20 / s23 / s27 (the HQ
//  meeting room: the chart about older customers, the fast self-checkout that gets an X, the map of planned chat
//  checkouts), s21 (an old man alone at his kitchen table) and s22 (a city at dusk, a street board counting the lonely).
//  Registers SHOT_FN[id] = (t, u, lt) => { ... } (see shots.js). Helpers are prefixed nld.
//  Four small worlds, each built once. People are c3Person billboards at NLD_K x; a standing person's root sits at
//  NLD_FOOT; a seated one at the seat height. Everything random is drawn once at build (RNG), never per frame.
// =====================================================================
const NLD = {};
const NLD_K = 1.35, NLD_FOOT = 2.55 * NLD_K;
const nldW = (w, n = 1, fb = 0) => wordT(w, n) ?? fb;
const nldV = (x, y, z) => new THREE.Vector3(x, y, z);
const nldSpan = (id) => shotSpan(SHOT_LIST.findIndex((r) => r[0] === id));
// ---- camera: never still — keys give the move, a creep and a slow orbit keep it alive, the last 0.35 s rush into the cut
function nldCam(K, lt, id, o = {}) {
  const c = c3CamAt(K, lt), [a, b] = nldSpan(id), dur = b - a;
  const P = nldV(...c.p), L = nldV(...c.l), d = L.clone().sub(P), dist = d.length(); d.normalize();
  const off = P.clone().sub(L).applyAxisAngle(nldV(0, 1, 0), (o.orbit ?? 0.03) * lt);
  const tail = clamp((lt - (dur - 0.35)) / 0.35, 0, 1.6), push = (o.creep ?? 0.05) * lt + (o.rush ?? 0.09) * tail * tail;
  return { p: L.clone().add(off).add(d.multiplyScalar(dist * push)).toArray(), l: c.l, fov: c.fov };
}
const nldRack = (lt, id, a, b) => { const [t0, t1] = nldSpan(id); return lerp(a, b, EZ.io(clamp(lt / (t1 - t0)))); };
// blurred foreground objects: placed in the WORLD where `at` (camera space) is at the shot's first frame, then the camera
// moves past them (real parallax) while they also drift along the lens' right — never glued to the screen
function nldFg(s, list, K, id, lt, o = {}) {
  const c = NLD.tmpCam ||= new THREE.PerspectiveCamera(50, W / H, 0.1, 2000);
  c3SetCam(c, nldCam(K, 0, id, o)); c.updateMatrixWorld(true);
  const right = nldV(1, 0, 0).transformDirection(c.matrixWorld);
  s.fg.forEach((f) => { f.visible = false; });
  list.forEach(([name, at, drift, rz]) => {
    const f = s.fgBy[name]; f.visible = true;
    f.position.copy(c.localToWorld(nldV(...at))).addScaledVector(right, (drift ?? 1.4) * lt);
    f.quaternion.copy(c.quaternion); f.rotateZ(rz ?? 0);
  });
}
const nldFace = (m, cam) => { m.quaternion.copy(cam.quaternion); };
const nldSph = () => NLD.sph ||= new THREE.SphereGeometry(1, 20, 14);
const NLD_STAND = { foot: { legL: [0.55, -2.55], legR: [-0.55, -2.55] } };
const nldWalkFeet = (k, a = 0.55) => ({ foot: { legL: [0.5 + a * Math.sin(k), -2.55 + 0.35 * Math.max(0, Math.cos(k))], legR: [-0.5 - a * Math.sin(k), -2.55 + 0.35 * Math.max(0, -Math.cos(k))] } });
const nldPerson = (scene, o) => { const p = c3Person(o); p.g.scale.setScalar(NLD_K); p.g.userData.person = true; scene.add(p.g); return p; };

// ---- textures
function nldTexWater() {   // canal water: deep green-blue, soft ripple lines and pale reflection streaks
  const t = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a7a8a'); g.addColorStop(1, '#2a5a6e'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('nldwater'); for (let i = 0; i < 70; i++) { x.strokeStyle = R.f() < 0.5 ? 'rgba(255,255,255,0.22)' : 'rgba(10,40,50,0.25)'; x.lineWidth = R.r(1.5, 4); const y = R.r(0, h), x0 = R.r(0, w);
      x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + 20, y - 4, x0 + R.r(30, 90), y); x.stroke(); } }, 512, 512);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 14); return t;
}
function nldTexSign(lit) {   // the HQ sign: a red band, a cream shopping basket icon and SUPERMARKT (generic — no real brand)
  return tex((x, w, h) => { x.fillStyle = lit ? '#e8382e' : '#8a2a24'; x.fillRect(0, 0, w, h); x.strokeStyle = lit ? '#ffe8a0' : '#c8a070'; x.lineWidth = 10; x.strokeRect(10, 10, w - 20, h - 20);
    const c = lit ? '#fff6dc' : '#d8c8a8'; x.strokeStyle = c; x.fillStyle = c; x.lineWidth = 12; x.lineJoin = 'round';   // basket
    x.beginPath(); x.moveTo(60, 70); x.lineTo(210, 70); x.lineTo(190, 190); x.lineTo(80, 190); x.closePath(); x.stroke();
    x.beginPath(); x.arc(135, 70, 52, Math.PI, 0); x.stroke(); for (const bx of [105, 135, 165]) { x.beginPath(); x.moveTo(bx, 90); x.lineTo(bx - 3, 175); x.stroke(); }
    inked(x, 'SUPERMARKT', w * 0.6, h / 2 + 4, h * 0.46, c, { stroke: lit ? '#7a1a14' : '#4a1410', sw: h * 0.05 }); }, 1024, 256);
}
function nldTexOutside() {   // the meeting room's window: canal houses across the water (painted)
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ec0ec'); g.addColorStop(0.55, '#d8ecf8'); g.addColorStop(1, '#3a7a8a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('nldout'), C = ['#a8463a', '#6a3a2e', '#e8d8b8', '#c8704a', '#4a6a5a', '#8a5a3a', '#d8a868']; let px = -10;
    while (px < w) { const bw = R.r(70, 110), bh = R.r(h * 0.45, h * 0.62), y0 = h * 0.82 - bh, c = C[R.i(0, C.length - 1)];
      x.fillStyle = c; x.beginPath(); x.moveTo(px, h * 0.82); x.lineTo(px, y0); x.lineTo(px + bw * 0.2, y0); x.lineTo(px + bw * 0.5, y0 - bw * 0.42); x.lineTo(px + bw * 0.8, y0); x.lineTo(px + bw, y0); x.lineTo(px + bw, h * 0.82); x.fill();
      x.strokeStyle = 'rgba(40,20,10,0.6)'; x.lineWidth = 3; x.stroke();
      for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) { x.fillStyle = R.f() < 0.25 ? '#ffe2a0' : '#9cc4e4'; x.fillRect(px + bw * (0.18 + i * 0.4), y0 + 14 + j * (bh - 30) / 4, bw * 0.24, (bh - 30) / 4 * 0.62); x.fillStyle = '#f6efe2'; x.fillRect(px + bw * (0.16 + i * 0.4), y0 + 14 + j * (bh - 30) / 4 + (bh - 30) / 4 * 0.62, bw * 0.28, 4); }
      px += bw + 2; }
    x.fillStyle = '#3a7a8a'; x.fillRect(0, h * 0.82, w, h * 0.18); x.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 20; i++) x.fillRect(R.r(0, w), R.r(h * 0.84, h), R.r(20, 60), 3); }, 1024, 640);
}
function nldTexKiosk(x_) {   // the self-checkout's screen: SCAN FASTER with a lightning bolt; x_ (0..1) = the red X sticker slapped on
  return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a6ad8'); g.addColorStop(1, '#1a3a8a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    inked(x, 'SCAN', w / 2, h * 0.28, h * 0.17, '#ffffff', { stroke: false }); inked(x, 'FASTER', w / 2, h * 0.47, h * 0.17, '#ffd040', { stroke: false });
    x.fillStyle = '#ffd040'; x.beginPath(); x.moveTo(w * 0.55, h * 0.6); x.lineTo(w * 0.4, h * 0.8); x.lineTo(w * 0.5, h * 0.8); x.lineTo(w * 0.43, h * 0.95); x.lineTo(w * 0.62, h * 0.72); x.lineTo(w * 0.52, h * 0.72); x.closePath(); x.fill();
    if (x_ > 0) { x.save(); x.translate(w / 2, h / 2); x.scale(0.6 + 0.4 * x_, 0.6 + 0.4 * x_); x.lineCap = 'round';
      x.strokeStyle = '#5a0a08'; x.lineWidth = 64; x.beginPath(); x.moveTo(-w * 0.36, -h * 0.36); x.lineTo(w * 0.36, h * 0.36); x.moveTo(w * 0.36, -h * 0.36); x.lineTo(-w * 0.36, h * 0.36); x.stroke();
      x.strokeStyle = '#e8282a'; x.lineWidth = 46; x.stroke(); x.restore(); } }, 384, 512);
}
function nldTexChart(k) {   // the easel chart: OLDER CUSTOMERS, conversations per day — the CHECKOUT CHAT bar grows (k 0..1), OTHER CHATS stays tiny
  return tex((x, w, h) => { x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8bfae'; x.lineWidth = 6; x.strokeRect(6, 6, w - 12, h - 12);
    inked(x, 'OLDER CUSTOMERS', w / 2, h * 0.09, h * 0.065, '#2a2e38', { stroke: false, maxW: w * 0.86 });
    inked(x, 'conversations per day', w / 2, h * 0.16, h * 0.04, '#7a7268', { stroke: false, weight: 700 });
    x.strokeStyle = '#2a2e38'; x.lineWidth = 6; x.beginPath(); x.moveTo(w * 0.12, h * 0.22); x.lineTo(w * 0.12, h * 0.8); x.lineTo(w * 0.9, h * 0.8); x.stroke();
    const base = h * 0.8, tall = h * 0.52 * k;
    x.fillStyle = '#f2a830'; x.fillRect(w * 0.2, base - tall, w * 0.26, tall); x.strokeStyle = '#7a4a10'; x.lineWidth = 5; x.strokeRect(w * 0.2, base - tall, w * 0.26, tall);
    x.fillStyle = '#b8b2a8'; x.fillRect(w * 0.56, base - h * 0.03, w * 0.26, h * 0.03); x.strokeStyle = '#6a6460'; x.strokeRect(w * 0.56, base - h * 0.03, w * 0.26, h * 0.03);
    inked(x, 'CHAT AT', w * 0.33, h * 0.86, h * 0.04, '#2a2e38', { stroke: false }); inked(x, 'CHECKOUT', w * 0.33, h * 0.91, h * 0.04, '#2a2e38', { stroke: false });
    inked(x, 'ALL OTHER', w * 0.69, h * 0.86, h * 0.04, '#2a2e38', { stroke: false }); inked(x, 'CHATS', w * 0.69, h * 0.91, h * 0.04, '#2a2e38', { stroke: false });
    if (k > 0.95) inked(x, '#1', w * 0.33, base - tall - h * 0.05, h * 0.06, '#d8322a', { stroke: false }); }, 512, 720);
}
// the Netherlands outline (u, v in 0..1 of the map card), the IJsselmeer inside it, the Wadden islands
const NLD_NL = [[0.30, 0.95], [0.20, 0.88], [0.12, 0.80], [0.15, 0.72], [0.22, 0.64], [0.25, 0.53], [0.30, 0.43], [0.35, 0.33], [0.39, 0.24], [0.45, 0.17], [0.55, 0.12], [0.68, 0.09], [0.80, 0.08],
  [0.89, 0.13], [0.87, 0.25], [0.81, 0.33], [0.85, 0.43], [0.79, 0.53], [0.71, 0.58], [0.67, 0.66], [0.71, 0.75], [0.65, 0.81], [0.59, 0.85], [0.55, 0.93], [0.48, 0.97], [0.40, 0.94]];
const NLD_LAKE = [[0.49, 0.31], [0.57, 0.25], [0.64, 0.30], [0.63, 0.40], [0.56, 0.46], [0.50, 0.42]];
const nldInPoly = (u, v, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > v) !== (yj > v) && u < (xj - xi) * (v - yi) / (yj - yi) + xi) c = !c; } return c; };
function nldTexMap() {
  return tex((x, w, h) => { x.fillStyle = '#9ccfe8'; x.fillRect(0, 0, w, h); const R = RNG('nldsea'); x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 3;
    for (let i = 0; i < 26; i++) { const y = R.r(0, h), x0 = R.r(0, w * 0.4); x.beginPath(); x.moveTo(x0, y); x.quadraticCurveTo(x0 + 18, y - 6, x0 + 40, y); x.stroke(); }
    const path = (P) => { x.beginPath(); P.forEach(([u, v], i) => (i ? x.lineTo(u * w, v * h) : x.moveTo(u * w, v * h))); x.closePath(); };
    x.fillStyle = '#9fd08a'; path(NLD_NL); x.fill(); x.strokeStyle = '#3a6a3a'; x.lineWidth = 7; x.lineJoin = 'round'; x.stroke();
    x.fillStyle = '#9ccfe8'; path(NLD_LAKE); x.fill(); x.strokeStyle = '#3a6a3a'; x.lineWidth = 5; x.stroke();
    for (const [u, v, r] of [[0.42, 0.13, 0.03], [0.5, 0.09, 0.035], [0.6, 0.06, 0.03], [0.7, 0.05, 0.025]]) { x.fillStyle = '#e8d8a8'; x.beginPath(); x.ellipse(u * w, v * h, r * w, r * w * 0.35, -0.2, 0, TAU); x.fill(); x.strokeStyle = '#3a6a3a'; x.lineWidth = 4; x.stroke(); }
    x.strokeStyle = 'rgba(60,100,60,0.45)'; x.lineWidth = 3; x.setLineDash([10, 8]);   // province lines
    for (const L of [[[0.28, 0.5], [0.5, 0.52], [0.78, 0.48]], [[0.25, 0.7], [0.48, 0.7], [0.68, 0.68]], [[0.5, 0.52], [0.52, 0.7], [0.55, 0.9]], [[0.64, 0.4], [0.82, 0.38]]]) { x.beginPath(); L.forEach(([u, v], i) => (i ? x.lineTo(u * w, v * h) : x.moveTo(u * w, v * h))); x.stroke(); }
    x.setLineDash([]); inked(x, 'NEDERLAND', w * 0.6, h * 0.64, h * 0.05, '#2a5a2a', { stroke: '#e8f4d8', sw: 6 });
    x.fillStyle = '#3a6a8a'; x.font = `700 ${h * 0.035}px Arial`; x.fillText('NOORDZEE', w * 0.08, h * 0.36); }, 1024, 1280);
}
function nldTexPlaque(n) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6d870'); g.addColorStop(1, '#c89a30'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#7a5a10'; x.lineWidth = 8; x.strokeRect(6, 6, w - 12, h - 12); inked(x, 'CHAT CHECKOUTS', w / 2, h * 0.32, h * 0.22, '#4a3008', { stroke: false, maxW: w * 0.86 });
  inked(x, `PLANNED: ${n}`, w / 2, h * 0.7, h * 0.3, '#2a1a04', { stroke: false }); }, 768, 256); }
function nldTexClock() { return tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.46, 0, TAU); x.fill(); x.strokeStyle = '#3a2a1a'; x.lineWidth = 14; x.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.fillStyle = '#3a2a1a'; x.beginPath(); x.arc(w / 2 + Math.sin(a) * w * 0.37, h / 2 - Math.cos(a) * h * 0.37, i % 3 ? 5 : 9, 0, TAU); x.fill(); } }, 256, 256); }
function nldTexPhone() { return tex((x, w, h) => { x.fillStyle = '#1a1e2a'; x.fillRect(0, 0, w, h); const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2a3a6a'); g.addColorStop(1, '#1a2448'); x.fillStyle = g; x.fillRect(10, 18, w - 20, h - 36);
  inked(x, '0', w / 2, h * 0.42, h * 0.2, '#ffffff', { stroke: false }); inked(x, 'NEW', w / 2, h * 0.58, h * 0.07, '#a8b8e8', { stroke: false }); inked(x, 'MESSAGES', w / 2, h * 0.66, h * 0.07, '#a8b8e8', { stroke: false }); }, 192, 384); }
function nldTexCalendar() { return tex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8463a'; x.fillRect(0, 0, w, h * 0.2); inked(x, 'NOVEMBER', w / 2, h * 0.1, h * 0.09, '#ffffff', { stroke: false });
  x.strokeStyle = '#a89a88'; x.lineWidth = 2; for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) { const cx = w * (0.07 + i * 0.13), cy = h * (0.26 + j * 0.145); x.strokeRect(cx, cy, w * 0.12, h * 0.13);
    if (j * 7 + i < 26) { x.strokeStyle = '#7a8aa0'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx + 6, cy + 6); x.lineTo(cx + w * 0.12 - 6, cy + h * 0.13 - 6); x.stroke(); x.strokeStyle = '#a89a88'; x.lineWidth = 2; } } }, 384, 448); }
// the thought bubble: a little memory of the cashier saying "How was your week?" (k 0..1 = pop-in)
function nldTexBubble() { return tex((x, w, h) => { x.fillStyle = '#ffffff'; x.strokeStyle = '#2a1a10'; x.lineWidth = 10;
  const bumps = [[0.28, 0.42, 0.2], [0.5, 0.32, 0.24], [0.72, 0.42, 0.2], [0.62, 0.62, 0.2], [0.38, 0.62, 0.2], [0.5, 0.5, 0.26]];
  x.beginPath(); for (const [u, v, r] of bumps) { x.moveTo(u * w + r * w, v * h); x.arc(u * w, v * h, r * w, 0, TAU); } x.stroke(); x.fill();
  // the cashier: a white head, brown ponytail, a smile, a red polo
  const cx = w * 0.36, cy = h * 0.5; x.fillStyle = '#d8322a'; x.beginPath(); x.ellipse(cx, cy + h * 0.17, w * 0.1, h * 0.08, 0, Math.PI, 0); x.fill();
  x.fillStyle = '#7a4a2a'; x.beginPath(); x.ellipse(cx + w * 0.08, cy - h * 0.02, w * 0.035, h * 0.08, 0.4, 0, TAU); x.fill();
  x.fillStyle = '#fbf8f2'; x.beginPath(); x.arc(cx, cy, w * 0.085, 0, TAU); x.fill(); x.strokeStyle = '#2a1a10'; x.lineWidth = 5; x.stroke();
  x.fillStyle = '#7a4a2a'; x.beginPath(); x.arc(cx, cy - h * 0.03, w * 0.085, Math.PI * 1.05, Math.PI * 1.95); x.fill();
  x.fillStyle = '#2a1a10'; for (const ex of [-0.03, 0.03]) { x.beginPath(); x.arc(cx + ex * w, cy, 5, 0, TAU); x.fill(); }
  x.lineWidth = 4; x.beginPath(); x.arc(cx, cy + h * 0.015, w * 0.03, 0.2, Math.PI - 0.2); x.stroke();
  x.fillStyle = '#fff6d0'; x.strokeStyle = '#2a1a10'; x.lineWidth = 4; x.beginPath(); x.roundRect(w * 0.5, h * 0.36, w * 0.3, h * 0.2, 14); x.fill(); x.stroke();
  inked(x, 'How was', w * 0.65, h * 0.42, h * 0.05, '#2a1a10', { stroke: false }); inked(x, 'your week?', w * 0.65, h * 0.5, h * 0.05, '#2a1a10', { stroke: false }); }, 512, 512); }
// the street board's counter (lonely people), rolling: the number is shown with thousands separators
function nldTexBoard(n) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1e2a4a'); g.addColorStop(1, '#141c34'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#f2c84a'; x.lineWidth = 8; x.strokeRect(10, 10, w - 20, h - 20); inked(x, 'LONELY PEOPLE', w / 2, h * 0.2, h * 0.11, '#f2c84a', { stroke: false, maxW: w * 0.84 });
  inked(x, 'IN THE NETHERLANDS', w / 2, h * 0.33, h * 0.075, '#a8b8e8', { stroke: false, maxW: w * 0.84 });
  const s = Math.round(n).toLocaleString('en-US'), cw = w * 0.085, x0 = w / 2 - s.length * cw / 2;
  for (let i = 0; i < s.length; i++) { const ch = s[i], px = x0 + i * cw; if (ch !== ',') { x.fillStyle = '#0a0e1a'; x.fillRect(px + 3, h * 0.48, cw - 6, h * 0.34); }
    inked(x, ch, px + cw / 2, h * 0.66, h * 0.26, ch === ',' ? '#f2c84a' : '#ffffff', { stroke: false, font: 'Arial' }); } }, 1024, 640); }
// a lit window with a lone silhouette sitting in it (the city at dusk)
function nldTexLonely(v) { return tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffe2a0'); g.addColorStop(1, '#f2a85a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  x.fillStyle = 'rgba(200,80,60,0.5)'; x.fillRect(0, 0, w * 0.18, h); x.fillRect(w * 0.82, 0, w * 0.18, h);
  const cx = w * (v ? 0.58 : 0.44); x.fillStyle = 'rgba(40,20,24,0.95)'; x.beginPath(); x.arc(cx, h * 0.46, w * 0.21, 0, TAU); x.fill(); x.beginPath(); x.ellipse(cx, h * 0.95, w * 0.28, h * 0.3, 0, Math.PI, 0); x.fill();   // a big lone silhouette
  x.fillStyle = 'rgba(255,255,255,0.35)'; x.beginPath(); x.moveTo(w * 0.1, h); x.lineTo(w * 0.4, 0); x.lineTo(w * 0.5, 0); x.lineTo(w * 0.2, h); x.fill(); }, 128, 192); }

// ---- small props
function nldBike(color) {   // a Dutch city bike, upright, frame along +x (wheels r 0.75)
  const g = new THREE.Group(), fr = c3Prop(color, { metal: 0.3, rough: 0.4 }), blk = c3Toon('#2a2a30');
  for (const wx of [-1.15, 1.15]) { const w = c3Mesh(new THREE.TorusGeometry(0.75, 0.09, 8, 24), blk, 0.012); w.position.set(wx, 0.85, 0); g.add(w); const hub = cyl(0.08, 0.08, 0.2, c3Toon('#c8ccd6'), wx, 0.85, 0, 0.01, 8); hub.rotation.x = Math.PI / 2; g.add(hub); }
  const tb = c3Mesh(c3RBox(2.2, 0.14, 0.14, 0.05), fr, 0.012); tb.position.set(0.05, 1.45, 0); tb.rotation.z = -0.2; g.add(tb);
  const st = c3Mesh(c3RBox(0.14, 1.2, 0.14, 0.05), fr, 0.012); st.position.set(-0.55, 1.35, 0); st.rotation.z = 0.2; g.add(st);
  const fk = c3Mesh(c3RBox(0.12, 1.2, 0.12, 0.05), fr, 0.012); fk.position.set(1.0, 1.35, 0); fk.rotation.z = -0.25; g.add(fk);
  const sd = c3Mesh(c3RBox(0.7, 0.16, 0.32, 0.07), c3Toon('#3a2a20'), 0.01); sd.position.set(-0.7, 2.0, 0); g.add(sd);
  const hb = c3Mesh(c3RBox(0.12, 0.12, 1.1, 0.05), blk, 0.01); hb.position.set(0.85, 2.05, 0); g.add(hb);
  const bk = c3Mesh(c3RBox(0.8, 0.5, 0.7, 0.08), c3Prop('#a87a48', { rough: 0.7 }), 0.012); bk.position.set(1.45, 1.7, 0); g.add(bk);   // front basket
  return g;
}
function nldTulips(n, seed) {   // a wooden planter with a row of red and yellow tulips (length ~ n * 0.5)
  const g = new THREE.Group(), R = RNG('tulip', seed), L = n * 0.5;
  g.add(rb(L + 0.4, 0.9, 1.0, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a') }), 0, 0.45, 0, 0.03));
  for (let i = 0; i < n; i++) { const x = -L / 2 + (i + 0.5) * L / n, hgt = R.r(0.9, 1.3);
    g.add(cyl(0.035, 0.035, hgt, c3Toon('#3a8a3a'), x, 0.9 + hgt / 2, R.n(0.2), 0, 6));
    const b = c3Mesh(new THREE.CylinderGeometry(0.17, 0.1, 0.36, 10), c3Prop(['#e8282a', '#ffd040', '#f080b0', '#e8282a'][i % 4], { rough: 0.5 }), 0.012); b.position.set(x, 0.95 + hgt, R.n(0.2)); g.add(b);
    const lf = c3Mesh(nldSph(), c3Toon('#4aa04a'), 0.01); lf.scale.set(0.08, 0.35, 0.16); lf.position.set(x + 0.1, 1.2, 0); lf.rotation.z = -0.4; g.add(lf); }
  return g;
}
function nldChair(M) { const g = new THREE.Group(); g.add(rb(3.0, 0.4, 3.0, M, 0, 2.8, 0, 0.03)); g.add(rb(3.0, 3.6, 0.4, M, 0, 4.8, -1.3, 0.03));
  for (const [a, b] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) g.add(cyl(0.12, 0.12, 2.8, c3Toon('#3a3a42'), a, 1.4, b, 0.015, 8)); return g; }
function nldPlant(seed) { const g = new THREE.Group(); g.add(cyl(1.2, 0.9, 2.4, c3Prop('#d8c8b0', { rough: 0.6 }), 0, 1.2, 0, 0.04, 16));
  for (let i = 0; i < 11; i++) { const R = RNG('nldplant', seed, i), l = c3Mesh(nldSph(), c3Toon(i % 2 ? '#3a9a4a' : '#5ab85a'), 0.03); l.scale.set(0.45, 2.4, 0.3); l.position.set(R.n(0.8), 4.0 + R.r(0, 0.8), R.n(0.5)); l.rotation.set(R.n(0.4), 0, R.n(0.7)); g.add(l); }
  return g; }

// =====================================================================
//  world 1 — the canal street (s19): water down the middle between stone quays, tall gabled canal houses facing the
//  water on both sides (kit c3Building x4: the gable faces the street), elms, lamps, bikes leaning on the quay
//  railings, tulip planters, a brick bridge with bikes, a boat; the supermarket chain's HQ closes the view.
// =====================================================================
function nldBuildStreet() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.5, 4000), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff4e6', ambI: 0.55, sky: '#cfe6ff', ground: '#c8b89c', key: '#fff2d8', keyI: 1.2, keyP: [-60, 70, 40], rim: '#ffe0c0', rimI: 0.5, rimP: [50, 30, -60] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(2800, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'day', seed: 19, band: [0.12, 0.46], clouds: 70, scale: 0.65, midAt: 0.42, sun: [0.62, 0.28, 30] }), side: THREE.BackSide })));
  const S = 4, stone = c3Prop('#ffffff', { map: c3TexWall('brick', '#8a6a5a', { rep: [40, 1] }), rough: 0.8 }), dark = c3Toon('#2a2e38');
  scene.add(pl(52, 700, c3Prop('#ffffff', { map: nldTexWater(), rough: 0.12, metal: 0.15, env: 0.8 }), 0, -3, -150, 0, -Math.PI / 2));
  for (const sx of [-1, 1]) {
    scene.add(rb(4, 4.2, 700, stone, sx * 26, -1.6, -150, 0.04));   // quay walls
    scene.add(pl(42, 700, c3Prop('#ffffff', { map: c3TexWall('paving', '#b8a890', { rep: [6, 90] }), rough: 0.85 }), sx * 49, 0.02, -150, 0, -Math.PI / 2));   // cobbled street
    for (let z = 140; z > -400; z -= 9) scene.add(cyl(0.22, 0.22, 3.2, dark, sx * 27.2, 1.6, z, 0.015, 8));   // railing posts
    const rail = rb(0.3, 0.3, 540, dark, sx * 27.2, 3.0, -130, 0.012); scene.add(rail);
  }
  // the canal houses: narrow and tall, gable to the water; brick and plaster colours, white trims, shutters on some
  const C = ['#8a3a2a', '#a8463a', '#6a3a2e', '#e8d8b8', '#c8704a', '#4a6a5a', '#7a4a32', '#d8b888', '#2e4a5a'];
  s.houses = [];
  for (const sx of [-1, 1]) { let z = 150, i = 0;
    while (z > -380) { const R = RNG('canal', sx, i), w = R.r(6.5, 8.6), b = c3Building({ w, h: R.r(13, 17), d: 7, floors: 4, cols: 2 + (w > 8 ? 1 : 0), wall: R.f() < 0.7 ? 'brick' : 'plaster',
        color: C[(i * 3 + (sx > 0 ? 4 : 0)) % C.length], trim: '#f6f0e4', roof: 'gable', roofH: R.r(3.6, 5.2), roofColor: ['#3a3a42', '#5a3a2e', '#2e3a4a'][i % 3], shutters: R.f() < 0.35 ? ['#2a5a3a', '#2a3a6a', '#7a2a2a'][i % 3] : null,
        planters: R.f() < 0.5, lit: 0.12, door: ['#2a6a3a', '#1a3a6a', '#7a2a2a', '#3a2a1a'][i % 4], chimney: false, seed: 100 + i * 2 + (sx > 0), ink: 0.04 });
      b.scale.setScalar(S); b.rotation.y = -sx * Math.PI / 2; b.position.set(sx * 58, 0, z - w * S / 2); c3Shade(b); scene.add(b); s.houses.push(b);   // fronts on the street edge so they sit in frame
      z -= w * S + 0.6; i++; } }
  // street dressing: elms, lamps, bikes against the railings, tulip planters
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) { const z = 120 - i * 58 + (sx > 0 ? 24 : 0);
    const tr = c3Tree(5.5, i % 2 ? '#4a9a4a' : '#5aa84a', 30 + i + (sx > 0 ? 50 : 0)); tr.position.set(sx * 40, 0, z); scene.add(tr);
    const lp = c3Lamp(4.5); lp.scale.setScalar(3.4); lp.position.set(sx * 31, 0, z - 26); scene.add(lp); }
  const BK = ['#2a2a30', '#d8322a', '#2a6ad8', '#3aa05a', '#f2c230', '#7a4ad8'];
  for (const sx of [-1, 1]) for (let i = 0; i < 12; i++) { const R = RNG('bk', sx, i), bk = nldBike(BK[i % BK.length]); bk.scale.setScalar(3.2);
    bk.rotation.y = R.n(0.12) + (sx > 0 ? Math.PI : 0); bk.rotation.z = sx * 0.06; bk.position.set(sx * 29.5, 0, 110 - i * 9.5 - (i > 5 ? 40 : 0)); scene.add(bk); }
  for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const tp = nldTulips(9, i + (sx > 0 ? 10 : 0)); tp.scale.setScalar(3); tp.rotation.y = Math.PI / 2; tp.position.set(sx * 33, 0, 80 - i * 90); scene.add(tp); }
  // the brick bridge across the canal (an arch over the water), bikes parked on it, its own railings
  { const sh = new THREE.Shape(); sh.moveTo(-34, -4); sh.lineTo(34, -4); sh.lineTo(34, 6); sh.lineTo(-34, 6); sh.lineTo(-34, -4);
    const hole = new THREE.Path(); hole.moveTo(-17, -4); hole.lineTo(-17, -1); hole.absarc(0, -1, 17, Math.PI, 0, true); hole.lineTo(17, -4); hole.lineTo(-17, -4); sh.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 14, bevelEnabled: false }); geo.translate(0, 0, -7);
    const br = c3Mesh(geo, c3Prop('#ffffff', { map: c3TexWall('brick', '#a85a42', { rep: [6, 1] }), rough: 0.8 }), 0); br.position.set(0, 0, -150); scene.add(br); s.bridge = br;   // no ink hull: it drew a dark line along the arch
    scene.add(rb(70, 0.8, 15, c3Toon('#c8b8a0'), 0, 6.3, -150, 0.04));
    for (const z of [-143.5, -156.5]) { scene.add(rb(68, 0.4, 0.4, dark, 0, 9.6, z, 0.012)); for (let x = -32; x <= 32; x += 4) scene.add(cyl(0.18, 0.18, 3.4, dark, x, 8.0, z, 0.012, 8)); }
    for (let i = 0; i < 7; i++) { const bk = nldBike(BK[(i + 2) % BK.length]); bk.scale.setScalar(3.2); bk.position.set(-24 + i * 8, 6.7, -144.6); bk.rotation.z = 0.04; scene.add(bk); } }
  // the supermarket chain's HQ at the end of the canal: a wide brick block with a red sign band (generic SUPERMARKT)
  s.hq = c3Building({ w: 24, h: 17, d: 12, floors: 4, cols: 6, wall: 'brick', color: '#b0563e', trim: '#f6f0e4', roof: 'flat', roofColor: '#4a4e58', planters: true, lit: 0.3, doorCol: -1, seed: 77, ink: 0.04 });
  s.hq.scale.setScalar(S); s.hq.position.set(0, 0, -430); c3Shade(s.hq); scene.add(s.hq);
  const hz = -430 + 6 * S;
  scene.add(rb(110, 4, 50, c3Prop('#ffffff', { map: c3TexWall('paving', '#c8b8a0', { rep: [10, 5] }), rough: 0.85 }), 0, -1.9, -400, 0.03));   // the HQ forecourt over the canal's end
  s.signTexOff = nldTexSign(false); s.signTexOn = nldTexSign(true);
  s.sign = pl(64, 16, c3Flat('#ffffff', { map: s.signTexOff }), 0, 22, hz + 1.2); s.sign.material.toneMapped = false; scene.add(s.sign);
  scene.add(rb(66.5, 18.4, 1.2, dark, 0, 22, hz + 0.4, 0.04));
  scene.add(rb(18, 12, 0.6, c3Prop('#bfe2f0', { rough: 0.15, metal: 0.1 }), 0, 6, hz + 0.6, 0.03)); scene.add(rb(20, 1.4, 6, c3Toon('#3a3e48'), 0, 12.6, hz + 3, 0.04));   // glass doors + canopy
  // a little boat on the canal and two people walking on the left quay
  s.boat = new THREE.Group(); s.boat.add(rb(16, 3, 6, c3Toon('#2a5a8a'), 0, 1.5, 0, 0.05)); s.boat.add(rb(15, 0.6, 5.2, c3Toon('#c89a5a'), 0, 3.1, 0, 0.03)); s.boat.add(rb(5, 3, 4, c3Toon('#f6f2ea'), -3, 4.8, 0, 0.04));
  s.boat.rotation.y = Math.PI / 2; scene.add(s.boat);
  s.walkers = [{ key: 'nw1', outfit: 'blouse', hairStyle: 'beanie' }, { key: 'nw2', outfit: 'stripes', hairStyle: 'redcap' }].map((o) => nldPerson(scene, o));
  s.fgBy = { tulips: (() => { const g = nldTulips(7, 99); g.scale.setScalar(1.6); return g; })(), bike: (() => { const g = nldBike('#d8322a'); g.scale.setScalar(1.8); return g; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  [s.hq, s.sign, s.boat, s.bridge, ...s.walkers.map((p) => p.g)].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#9cc8f0', mid: '#f0e8dc', bot: '#a89a84', cards: [[0, 30, -30, 40, 8, '#ffffff'], [-30, 10, 10, 10, 18, '#cfe6ff'], [30, 12, -10, 10, 18, '#fff0d8']] });
  c3ShadeScene(scene, { dark: 0.3 });
  return s;
}

// =====================================================================
//  world 2 — the HQ meeting room (s20, s23, s27): warm wood floor, cream walls, a big window onto the canal houses,
//  the chart on an easel, the fast self-checkout prototype on a little stage, the map of the Netherlands on the wall,
//  a meeting table with chairs, plants. The exec stands where each shot needs him.
// =====================================================================
function nldBuildOffice() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 600), s = { scene, cam };
  s.key = lights(scene, { amb: '#fff2e4', ambI: 0.6, sky: '#fff4e0', ground: '#b88a5a', key: '#fff0d8', keyI: 0.95, keyP: [14, 30, 26], rim: '#ffd8a8', rimI: 0.45, rimP: [-14, 18, -20] });
  const wood = c3TexWall('wood', '#b8804e', { rep: [8, 8] });
  scene.add(pl(80, 70, c3Prop('#ffffff', { map: wood, rough: 0.4, env: 0.8 }), 0, 0, 0, 0, -Math.PI / 2));
  const wallM = c3Prop('#3aa88a', { rough: 0.85 }), dark = c3Toon('#2a2e38');   // saturated green office walls (Ricks)
  scene.add(pl(80, 30, wallM, 0, 15, -22)); scene.add(pl(70, 30, wallM, -36, 15, 8, Math.PI / 2)); scene.add(pl(70, 30, wallM, 36, 15, 8, -Math.PI / 2));
  scene.add(pl(80, 70, c3Prop('#ffe9a8', { rough: 0.9 }), 0, 30, 0, 0, Math.PI / 2));
  scene.add(rb(80, 1.2, 0.4, c3Toon('#8a5a3a'), 0, 0.6, -21.8, 0.02));   // skirting
  for (let i = 0; i < 4; i++) scene.add(pl(8, 1.0, c3Flat('#fffaf0', { glow: '#fff2d0' }), -22 + i * 15, 29.9, -6, 0, Math.PI / 2));
  // the big window onto the canal (left part of the back wall), with mullions
  const win = pl(30, 15, c3Flat('#ffffff', { map: nldTexOutside() }), -14, 13.5, -21.8); scene.add(win);
  scene.add(rb(31, 0.8, 1.2, c3Toon('#f6f2ea'), -14, 5.6, -21.4, 0.02)); scene.add(rb(31, 0.8, 1.2, c3Toon('#f6f2ea'), -14, 21.4, -21.4, 0.02));
  for (const x of [-29.2, -19, -9, 1.2]) scene.add(rb(0.8, 16.6, 1.2, c3Toon('#f6f2ea'), x, 13.5, -21.4, 0.02));
  // the chart on an easel (s20) — canvas redrawn only when its quantised progress changes
  s.chartCv = null; s.chartK = -1; s.chart = new THREE.Group(); s.chart.position.set(4, 0, -12); scene.add(s.chart);
  s.chartTex = new Map();
  s.chartFace = pl(9.6, 13.5, c3Flat('#ffffff', { map: nldTexChart(0) }), 0, 11.4, 0.36); s.chart.add(s.chartFace);
  s.chart.add(rb(10.4, 14.3, 0.5, c3Toon('#8a5a3a'), 0, 11.4, 0, 0.04));
  for (const [x, rz] of [[-3.6, 0.08], [3.6, -0.08]]) { const l = rb(0.5, 19, 0.5, c3Toon('#7a4a2a'), x, 8.6, -0.6, 0.03); l.rotation.z = rz; s.chart.add(l); }
  const back = rb(0.5, 17, 0.5, c3Toon('#7a4a2a'), 0, 7.6, -3.6, 0.03); back.rotation.x = -0.25; s.chart.add(back);
  s.chart.add(rb(10.6, 0.5, 1.4, c3Toon('#7a4a2a'), 0, 4.2, 0.4, 0.03));
  // the self-checkout prototype on a low stage (s23): a body, a sloped screen, a scanner plate with a red glow, a bag shelf
  s.kiosk = new THREE.Group(); s.kiosk.position.set(-16, 0, -9); scene.add(s.kiosk);
  s.kiosk.add(rb(14, 1.2, 10, c3Prop('#3a3e48', { rough: 0.6 }), 0, 0.6, 0, 0.03));
  s.kiosk.add(rb(5.2, 9.6, 4.2, c3Prop('#f2f4f8', { rough: 0.3 }), -1.4, 6, 0, 0.04));
  s.kiosk.add(rb(4.4, 0.5, 4.6, c3Prop('#2a6ad8', { rough: 0.3 }), -1.4, 10.9, 0.2, 0.03));
  s.kioskScreen = new THREE.Group(); s.kioskScreen.position.set(-1.4, 13.6, 0.6); s.kioskScreen.rotation.x = -0.22; s.kiosk.add(s.kioskScreen);
  s.kioskScreen.add(rb(4.6, 5.8, 0.5, c3Toon('#2a2e38'), 0, 0, 0, 0.04));
  s.kioskTex = new Map(); s.kioskFace = pl(4.0, 5.2, c3Flat('#ffffff', { map: nldTexKiosk(0), glow: '#6a9ae8' }), 0, 0, 0.27); s.kioskScreen.add(s.kioskFace);
  s.kiosk.add(rb(0.6, 3.4, 0.6, c3Toon('#2a2e38'), -1.4, 12, -0.8, 0.02));
  const scan = rb(3.6, 0.3, 2.6, c3Prop('#3a1a1a', { emissive: '#e8282a', ei: 0.6, glow: '#ff4040' }), 2.6, 7.6, 0.4, 0.02); s.kiosk.add(scan);
  s.kiosk.add(rb(3.8, 7.4, 3.4, c3Prop('#e8eaf0', { rough: 0.35 }), 2.6, 3.9, 0.4, 0.03));
  s.kiosk.add(rb(3.4, 0.4, 3.6, c3Toon('#c8ccd6'), 5.6, 6.2, 0.4, 0.02)); for (const z of [-1.2, 2.0]) s.kiosk.add(cyl(0.12, 0.12, 4, c3Toon('#c8ccd6'), 6.8, 8.2, z, 0.01, 8));
  // speed lines painted on the stage front: fast!
  // the map of the Netherlands on the right part of the back wall, framed, its plaque under it, ~200 pins (instanced)
  s.map = new THREE.Group(); s.map.position.set(22, 15, -21.4); scene.add(s.map);
  s.map.add(rb(17.2, 21.2, 0.6, c3Prop('#3a2a1e', { rough: 0.5 }), 0, 0, 0, 0.04)); s.map.add(pl(16, 20, c3Prop('#ffffff', { map: nldTexMap(), rough: 0.8 }), 0, 0, 0.32));
  s.plaqueTex = new Map(); s.plaque = pl(12, 4, c3Prop('#ffffff', { map: nldTexPlaque(0), rough: 0.3, metal: 0.4 }), 0, -12.6, 0.3); s.map.add(s.plaque);
  { const R = RNG('nldpins'), pts = []; while (pts.length < 200) { const u = R.r(0.12, 0.89), v = R.r(0.08, 0.97); if (nldInPoly(u, v, NLD_NL) && !nldInPoly(u, v, NLD_LAKE)) pts.push([u, v, R.r(0, 1)]); }
    pts.sort((a, b) => a[2] - b[2]); s.pinPts = pts;
    s.pinHeads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 10, 8), c3Prop('#e8282a', { rough: 0.3 }), 200);
    s.pinNeedle = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5), c3Prop('#c8ccd6', { metal: 0.8, rough: 0.3 }), 200);
    s.pinHeads.frustumCulled = s.pinNeedle.frustumCulled = false; s.map.add(s.pinHeads); s.map.add(s.pinNeedle); }
  // meeting table with chairs (left front), plants in the corners
  const tableM = c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a36'), rough: 0.4 });
  s.table = new THREE.Group(); s.table.position.set(-24, 0, 10); scene.add(s.table);
  s.table.add(rb(16, 0.6, 8, tableM, 0, 4.6, 0, 0.04)); for (const [x, z] of [[-6.5, -3], [6.5, -3], [-6.5, 3], [6.5, 3]]) s.table.add(cyl(0.25, 0.25, 4.4, c3Toon('#3a3a42'), x, 2.2, z, 0.015, 8));
  const chM = c3Prop('#2a6a8a', { rough: 0.6 }); for (const [x, z, ry] of [[-4, -6, 0], [4, -6, 0], [-4, 6, Math.PI], [4, 6, Math.PI]]) { const c = nldChair(chM); c.position.set(x, 0, z); c.rotation.y = ry; s.table.add(c); }
  s.table.add(mug('#f6f2ea', -2, 4.9, 1)); s.table.add(mug('#d8322a', 3, 4.9, -1.5));
  for (const [x, z, i] of [[-33, -18, 0], [32, -2, 1], [8, -19, 2]]) { const p = nldPlant(i); p.position.set(x, 0, z); scene.add(p); }
  s.exec = nldPerson(scene, { key: 'exec', outfit: 'suit', hairStyle: 'rk_boss' });
  s.fgBy = { plant: (() => nldPlant(7))(), chair: (() => nldChair(c3Prop('#2a6a8a', { rough: 0.6 })))() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  [s.chart, s.kiosk, s.map, s.exec.g].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#fff4e0', mid: '#f0dcc0', bot: '#8a6a4a', cards: [[0, 30, -30, 40, 8, '#ffffff'], [-30, 10, 10, 10, 18, '#fff0d8'], [30, 12, -10, 10, 18, '#ffe8c8']] });
  c3ShadeScene(scene, { dark: 0.3 });
  c3Shadows(scene, s.key, 44, { res: 2048 });
  return s;
}

// =====================================================================
//  world 3 — the old man's kitchen (s21): dusk outside the window, a ticking wall clock, a calendar of crossed-off days,
//  a lamp over a small table with a long cloth (it hides his legs), ONE cup of tea, a phone with 0 new messages.
// =====================================================================
function nldBuildHome() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 400), s = { scene, cam };
  s.key = lights(scene, { amb: '#ffe8d0', ambI: 0.5, sky: '#e8d8f0', ground: '#7a5a4a', key: '#ffe4c0', keyI: 1.0, keyP: [6, 22, 14], rim: '#a8a0e8', rimI: 0.5, rimP: [-12, 14, -14] });
  scene.add(pl(60, 50, c3Prop('#ffffff', { map: c3TexWall('wood', '#8a5a3a', { rep: [6, 6] }), rough: 0.5, env: 0.6 }), 0, 0, 0, 0, -Math.PI / 2));
  const wallM = c3Prop('#ffffff', { map: c3TexWall('siding', '#e0904a', { rep: [3, 3] }), rough: 0.85 });
  scene.add(pl(60, 26, wallM, 0, 13, -12)); scene.add(pl(50, 26, wallM, -20, 13, 10, Math.PI / 2)); scene.add(pl(50, 26, wallM, 20, 13, 10, -Math.PI / 2));
  scene.add(rb(60, 1.0, 0.4, c3Toon('#6a4a2e'), 0, 0.5, -11.8, 0.02));
  // the window: dusk sky, a few far lit windows; frame, sill, a small pot
  const dusk = tex((x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a3a86'); g.addColorStop(0.6, '#a86aa0'); g.addColorStop(1, '#f6a070'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const R = RNG('duskwin'); x.fillStyle = '#2a2448'; let px = 0; while (px < w) { const bw = R.r(40, 80), bh = R.r(h * 0.15, h * 0.35); x.fillRect(px, h - bh, bw, bh); for (let k = 0; k < 4; k++) if (R.f() < 0.5) { x.fillStyle = '#ffd890'; x.fillRect(px + R.r(6, bw - 14), h - bh + R.r(8, bh - 14), 8, 10); x.fillStyle = '#2a2448'; } px += bw + 4; }
    x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(w * 0.75, h * 0.2, 16, 0, TAU); x.fill(); }, 512, 512);
  scene.add(pl(12, 10, c3Flat('#ffffff', { map: dusk }), -8, 13, -11.8));
  scene.add(rb(13, 0.7, 1.4, c3Toon('#f6f2ea'), -8, 7.7, -11.4, 0.02)); scene.add(rb(13, 0.6, 0.8, c3Toon('#f6f2ea'), -8, 18.3, -11.5, 0.02));
  for (const x of [-14.3, -8, -1.7]) scene.add(rb(0.6, 10.6, 0.8, c3Toon('#f6f2ea'), x, 13, -11.5, 0.02));
  scene.add(rb(12, 0.5, 0.8, c3Toon('#f6f2ea'), -8, 13, -11.5, 0.012));
  { const pot = nldPlant(5); pot.scale.setScalar(0.45); pot.position.set(-11.5, 8.0, -11); scene.add(pot); }
  // the wall clock (hands turn with t) and the calendar
  s.clock = new THREE.Group(); s.clock.position.set(5, 16, -11.6); scene.add(s.clock);
  s.clock.add(cyl(2.4, 2.4, 0.5, c3Toon('#7a4a2a'), 0, 0, 0, 0.04, 32)); s.clock.children[0].rotation.x = Math.PI / 2;
  s.clock.add(pl(4.2, 4.2, c3Flat('#ffffff', { map: nldTexClock(), transparent: true }), 0, 0, 0.27));
  const hand = (l, wdt, c) => { const g = new THREE.Group(); const m = c3Mesh(c3RBox(wdt, l, 0.08, wdt * 0.4), c3Toon(c), 0); m.position.y = l / 2 - 0.2; g.add(m); g.position.z = 0.35; s.clock.add(g); return g; };
  s.hHour = hand(1.1, 0.22, '#2a1a10'); s.hMin = hand(1.6, 0.16, '#2a1a10'); s.hSec = hand(1.8, 0.07, '#d8322a');
  s.clock.add(cyl(0.16, 0.16, 0.2, c3Toon('#2a1a10'), 0, 0, 0.42, 0, 12)); s.clock.children[s.clock.children.length - 1].rotation.x = Math.PI / 2;
  const cal = pl(4.2, 4.9, c3Prop('#ffffff', { map: nldTexCalendar(), rough: 0.8 }), 12, 12, -11.7); scene.add(cal);
  // the table with a long cloth (hides his legs), the chair back behind him, one cup with steam, the phone face up
  s.table = new THREE.Group(); scene.add(s.table);
  const cloth = c3Prop('#ffffff', { map: tex((x, w, h) => { x.fillStyle = '#f2ece0'; x.fillRect(0, 0, w, h); x.strokeStyle = 'rgba(200,70,60,0.55)'; x.lineWidth = 6; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * w / 8, 0); x.lineTo(i * w / 8, h); x.stroke(); x.beginPath(); x.moveTo(0, i * h / 8); x.lineTo(w, i * h / 8); x.stroke(); } }, 256, 256), rough: 0.8 });
  s.table.add(rb(13, 0.5, 7, cloth, 0, 4.6, 1, 0.04)); s.table.add(rb(13, 4.4, 0.3, cloth, 0, 2.3, 4.55, 0.03)); s.table.add(rb(0.3, 4.4, 7, cloth, -6.55, 2.3, 1, 0.02)); s.table.add(rb(0.3, 4.4, 7, cloth, 6.55, 2.3, 1, 0.02));
  const chair = nldChair(c3Prop('#8a5a36', { rough: 0.5 })); chair.position.set(0, 0, -3.2); scene.add(chair);
  s.cup = mug('#f6f2ea', 2.4, 4.85, 2.4); scene.add(s.cup);
  s.cup.add(rb(0.7, 0.05, 0.7, c3Toon('#8a5a2a'), 0, 0.68, 0, 0));   // tea surface
  s.steam = [0, 1, 2].map((i) => { const m = c3Mesh(nldSph(), c3Flat('#ffffff', { transparent: true, depthWrite: false }), 0); m.material.opacity = 0; m.scale.setScalar(0.18); s.cup.add(m); return m; });
  s.phone = new THREE.Group(); s.phone.position.set(-2.8, 4.88, 2.4); s.phone.rotation.set(0, 0.3, 0); scene.add(s.phone);
  s.phone.add(rb(1.1, 0.12, 2.1, c3Toon('#1a1e2a'), 0, 0, 0, 0.012)); const scr = pl(0.95, 1.9, c3Flat('#ffffff', { map: nldTexPhone(), glow: '#4a6ab0' }), 0, 0.07, 0, 0, -Math.PI / 2); s.phone.add(scr);
  // the lamp over the table
  scene.add(cyl(0.05, 0.05, 6, c3Toon('#2a2a30'), 0, 23, 1, 0, 6));
  const shade = c3Mesh(new THREE.CylinderGeometry(1.0, 2.4, 1.8, 20, 1, true), c3Prop('#e8b048', { rough: 0.6 }), 0.03); shade.material.side = THREE.DoubleSide; shade.position.set(0, 19.4, 1); scene.add(shade);
  const bulb = c3Mesh(nldSph(), c3Flat('#fff4d0', { glow: '#ffd890' }), 0); bulb.scale.setScalar(0.5); bulb.position.set(0, 18.7, 1); scene.add(bulb);
  // him, seated behind the table; the thought bubble with its little trail
  s.man = nldPerson(scene, { key: 'oldman', outfit: 'blazer', hairStyle: 'baldsides' });
  s.bubble = pl(5.6, 5.6, c3Flat('#ffffff', { map: nldTexBubble(), transparent: true, depthWrite: false }), 0, 0, 0); s.bubble.renderOrder = 9; scene.add(s.bubble);
  s.trail = [0.32, 0.46, 0.62].map((r) => { const m = c3Mesh(new THREE.CircleGeometry(r, 20), c3Flat('#ffffff', { transparent: true, depthWrite: false }), 0); m.renderOrder = 9;
    const o = c3Mesh(new THREE.RingGeometry(r, r + 0.09, 20), c3Flat('#2a1a10', { transparent: true, depthWrite: false }), 0); o.renderOrder = 10; m.add(o); scene.add(m); return m; });
  s.fgBy = { lamp: (() => { const g = new THREE.Group(); g.add(c3Mesh(new THREE.CylinderGeometry(1.2, 2.6, 2.2, 20), c3Prop('#c8463a', { rough: 0.6 }), 0.03)); return g; })(), plant: nldPlant(3) };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  [s.table, s.cup, s.phone, s.man.g, s.bubble, ...s.trail, s.clock].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#ffe8c8', mid: '#d8b8a0', bot: '#4a3a3a', cards: [[0, 30, -30, 40, 8, '#fff0d8'], [-30, 10, 10, 10, 18, '#c8b8f0'], [30, 12, -10, 10, 18, '#ffe0c0']] });
  c3ShadeScene(scene, { dark: 0.3 });
  c3Shadows(scene, s.key, 26, { res: 2048 });
  return s;
}

// =====================================================================
//  world 4 — the city at dusk (s22): rows of apartment blocks (kit c3Building x3), dark windows that light up one by one
//  with a lone figure in each; in the foreground a street info board counts the lonely: 1,000,000.
// =====================================================================
function nldBuildCity() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, W / H, 0.5, 3000), s = { scene, cam };
  s.key = lights(scene, { amb: '#b8a8e0', ambI: 0.5, sky: '#8a7ab8', ground: '#4a3a5a', key: '#ffc8a0', keyI: 0.8, keyP: [40, 30, 60], rim: '#a890e8', rimI: 0.6, rimP: [-40, 30, -40] });
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), c3Flat('#ffffff', { map: c3SkyTex({ mood: 'dusk', seed: 22, band: [0.12, 0.4], clouds: 40, scale: 0.6, midAt: 0.4 }), side: THREE.BackSide })));
  { const moon = c3Mesh(nldSph(), c3Flat('#fff6d8', { glow: '#fff0c0' }), 0); moon.scale.setScalar(26); moon.position.set(300, 520, -1400); scene.add(moon); }
  scene.add(pl(800, 600, c3Prop('#ffffff', { map: c3TexWall('paving', '#5a5068', { rep: [40, 30] }), rough: 0.8 }), 0, 0, -150, 0, -Math.PI / 2));
  scene.add(pl(800, 26, c3Prop('#3a3448', { rough: 0.6, env: 0.6 }), 0, 0.05, 6, 0, -Math.PI / 2));   // a street across the foreground
  for (const x of [-60, -20, 20, 60]) scene.add(pl(8, 1.2, c3Flat('#e8e0c8'), x, 0.1, 6, 0, -Math.PI / 2));
  s.lonely = [nldTexLonely(0), nldTexLonely(1)];
  s.lit = [];
  const C = ['#5a6a9a', '#7a5a8a', '#9a6a6a', '#4a7a8a', '#8a7a5a', '#6a5a7a'];
  const S = 3;
  for (let row = 0; row < 3; row++) { let x = -150 + row * 18;
    for (let i = 0; x < 170; i++) { const R = RNG('city', row, i), w = R.r(10, 15), h = R.r(14, 26) + row * 4, F = Math.max(3, Math.round(h / 4)), Cc = Math.max(3, Math.round(w / 3.2));
      const o = { w, h, d: 9, floors: F, cols: Cc, wall: R.f() < 0.6 ? 'brick' : 'plaster', color: C[(i + row * 2) % C.length], trim: '#d8d0e0', roof: R.f() < 0.35 ? 'gable' : 'flat', roofColor: '#3a3448', lit: 0, chimney: false, seed: 300 + row * 40 + i, ink: 0.04, doorCol: Math.floor(Cc / 2) };
      const b = c3Building(o); b.scale.setScalar(S); b.position.set(x + w * S / 2, 0, -60 - row * 70); scene.add(b); c3Shade(b, { dark: 0.25 });
      // overlays over its windows (same layout as c3Building): a warm window with a lone figure, switched on at its own time
      const fh = (h - 0.6) / F, ww = Math.min(3.0, w / Cc * 0.72), wh = Math.min(fh * 0.78, 3.4);   // big enough that each lone figure reads
      for (let f = 0; f < F; f++) for (let c = 0; c < Cc; c++) { if (f === 0 && c === o.doorCol) continue; const R2 = RNG('cityw', row, i, f, c); if (R2.f() > 0.55) continue;
        const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), new THREE.MeshBasicMaterial({ map: s.lonely[R2.i(0, 1)] })); m.material.toneMapped = false;   // no glow pass: it washed the lone figure out of the window
        m.position.set(-w / 2 + (c + 0.5) * w / Cc, 0.35 + f * fh + fh * 0.55, 9 / 2 + 0.12); m.visible = false; b.add(m);
        s.lit.push({ m, t: 41.35 + Math.pow(R2.f(), 0.8) * 2.2 + row * 0.08 }); }
      x += w * S + R.r(1, 4); } }
  // trees and lamps along the street
  for (let i = 0; i < 9; i++) { const tr = c3Tree(4.5, '#3a6a5a', 60 + i); tr.position.set(-120 + i * 30, 0, -14); scene.add(tr); const lp = c3Lamp(4.5); lp.scale.setScalar(3); lp.position.set(-105 + i * 30, 0, -10); scene.add(lp); }
  // the street info board: a framed screen on two legs; its counter rolls to 1,000,000
  s.board = new THREE.Group(); s.board.position.set(-1.5, 0, 22); s.board.rotation.y = -0.08; scene.add(s.board);
  s.board.add(rb(17, 11.6, 1.2, c3Toon('#2a2e38'), 0, 21, 0, 0.05));
  s.boardTex = new Map(); s.boardFace = pl(16, 10, c3Flat('#ffffff', { map: nldTexBoard(0), glow: '#3a4a8a' }), 0, 21, 0.62); s.board.add(s.boardFace);
  for (const x of [-6, 6]) s.board.add(rb(0.9, 15.4, 0.9, c3Toon('#2a2e38'), x, 7.7, 0, 0.03));
  s.board.add(rb(17.6, 0.8, 1.6, c3Toon('#3a3e48'), 0, 27.2, 0, 0.03));
  s.fgBy = { tree: (() => { const t = c3Tree(2.6, '#2e5a4a', 999); return t; })(), lamp: (() => { const l = c3Lamp(6); l.scale.setScalar(1.5); return l; })() };
  s.fg = Object.values(s.fgBy); s.fg.forEach((f) => { scene.add(f); c3Layer(f, C3.L_NEAR); f.visible = false; });
  [s.board].forEach((o) => c3Layer(o, C3.L_FOCUS));
  c3Env(scene, { top: '#6a5aa8', mid: '#c88aa8', bot: '#2a2438', cards: [[0, 30, -30, 40, 8, '#ffd8b8'], [-30, 10, 10, 10, 18, '#a890e8'], [30, 12, -10, 10, 18, '#ffc8a0']] });
  c3ShadeScene(scene, { dark: 0.28 });
  return s;
}

const nldStreet = () => NLD.street ||= nldBuildStreet();
const nldOffice = () => NLD.office ||= nldBuildOffice();
const nldHome = () => NLD.home ||= nldBuildHome();
const nldCity = () => NLD.city ||= nldBuildCity();
const nldRender = (s, o = {}) => c3Render(s.scene, s.cam, Object.assign({ bg: '#9cc8f0', bgBlur: 2.0, nearBlur: 10, glow: 0.6, glowBlur: 14, bloom: 0.16 }, o));
// cached canvas textures: one per state (export workers render frames in any order — the state is the key)
const nldTexKey = (map, key, make) => { if (!map.has(key)) map.set(key, make()); return map.get(key); };
function nldOfficeReset(s) {
  s.exec.g.visible = false;
  s.pinHeads.count = 0; s.pinNeedle.count = 0;
}

// =====================================================================
//  s19 — "You see, in the Netherlands, a big supermarket chain": low over the canal, the camera glides forward and
//  rises between the gabled houses toward the HQ at the end; a boat chugs by, people walk on the quay, bikes and tulips
//  slide past; the SUPERMARKT sign lights up on "chain"
// =====================================================================
const NLD_K19 = [[0, [5, 13, 120], [0, 24, -420], 42], [2.6, [1.5, 24, 24], [0, 27, -420], 40]];
SHOT_FN['s19'] = (t, u, lt) => {
  const s = nldStreet();
  c3SetCam(s.cam, nldCam(NLD_K19, lt, 's19', { orbit: 0.02, creep: 0.04 }));
  const tOn = nldW('chain', 1, 34.8), on = t >= tOn || (t > tOn - 0.25 && Math.floor((t - tOn) * 30) % 2 === 0);
  s.sign.material.map = on ? s.signTexOn : s.signTexOff; s.sign.material.userData.glow = on ? '#ff6050' : null;
  s.boat.position.set(-8, -2.6 + 0.3 * Math.sin(t * 2), 40 - (t - 32.7) * 10); s.boat.rotation.z = 0.03 * Math.sin(t * 1.7);
  [[-42, 92, -1], [-46, 72, 1]].forEach(([x, z, dir], i) => { const p = s.walkers[i], k = t * 6 + i * 2;
    p.g.position.set(x, NLD_FOOT, z + dir * (t - 32.7) * 3); c3PersonPose(p, s.cam, t, { expr: i ? 'smile' : 'happy', ...nldWalkFeet(k), hand: { armL: [1.2 + 0.25 * Math.sin(k), -0.2], armR: [-1.2 - 0.25 * Math.sin(k), -0.2] } }); });
  nldFg(s, [['tulips', [-5.2, -8.2, -12], 1.6], ['bike', [6.0, -7.6, -14], 1.2]], NLD_K19, 's19', lt, { orbit: 0.02, creep: 0.04 });
  nldRender(s, { bgBlur: nldRack(lt, 's19', 1.4, 0.9), glow: 0.8 });
};

// =====================================================================
//  s20 — "noticed that for a lot of older customers,": the exec at the easel chart taps it; the CHAT AT CHECKOUT bar
//  shoots up while ALL OTHER CHATS stays a sliver; a "!" pops over his head on "noticed"
// =====================================================================
const NLD_K20 = [[0, [-0.5, 11.5, 26], [1.5, 11.2, -10], 46], [2.3, [1.0, 11.4, 22.5], [1.8, 11.4, -10], 45]];
SHOT_FN['s20'] = (t, u, lt) => {
  const s = nldOffice(); nldOfficeReset(s);
  c3SetCam(s.cam, nldCam(NLD_K20, lt, 's20', { orbit: 0.03 }));
  const tN = nldW('noticed', 1, 35.3), tB = nldW('lot', 1, 36.2), k = Math.round(EZ.o3(clamp((t - tB) / 0.6)) * 20) / 20;
  s.chartFace.material.map = nldTexKey(s.chartTex, k, () => nldTexChart(k));
  const e = s.exec; e.g.visible = true; e.g.position.set(-2.4, NLD_FOOT, -6.5);
  const tap = clamp((t - tB) / 0.25), point = tap * (1 - clamp((t - tB - 0.9) / 0.3));
  c3PersonPose(e, s.cam, t, { expr: c3FaceAt([[0, 'thinking'], [tN, 'surprised'], [tN + 0.6, 'smile'], [tB + 0.5, 'excited']], t, 'exec'), gaze: [0.6, 0.2],
    hand: { armL: [lerp(1.2, 3.1, point), lerp(-0.2, 2.6, point)], armR: [-1.2, -0.3] }, lift: (x) => 0.18 * Math.max(0, Math.sin(clamp((x - tN) / 0.3) * Math.PI)), ...NLD_STAND });
  e.extras.exclaim.visible = t > tN && t < tN + 0.9;
  nldFg(s, [['plant', [5.6, -7.0, -10], 1.2]], NLD_K20, 's20', lt, { orbit: 0.03 });
  nldRender(s, { bg: '#2a7a64', bgBlur: nldRack(lt, 's20', 2.2, 1.6), glow: 0.5 });
};

// =====================================================================
//  s21 — "the chat at the checkout was the only real conversation they'd have all day.": the old man alone at his table,
//  the clock ticking; on "conversation" a memory bubble rises from his head (the cashier: "How was your week?") and he
//  smiles; on "all day" it pops away and he's alone again; the tea steams, the phone shows 0 new messages
// =====================================================================
const NLD_K21 = [[0, [3.5, 11.5, 22], [0, 9.2, -2], 40], [3.7, [1.2, 10.6, 17.5], [0, 9.6, -2], 40]];
SHOT_FN['s21'] = (t, u, lt) => {
  const s = nldHome();
  c3SetCam(s.cam, nldCam(NLD_K21, lt, 's21', { orbit: 0.025, creep: 0.03 }));
  const sec = Math.floor(t), tick = EZ.back(clamp((t - sec) / 0.12));   // the second hand ticks
  s.hSec.rotation.z = -((sec - 1 + tick) % 60) / 60 * TAU; s.hMin.rotation.z = -(42 + t / 60) / 60 * TAU; s.hHour.rotation.z = -(6.7 + t / 3600) / 12 * TAU;
  s.steam.forEach((m, i) => { const k = ((t * 0.6 + i / 3) % 1); m.position.set(0.15 * Math.sin(t * 2 + i), 0.9 + k * 2.2, 0); m.scale.setScalar(0.18 + k * 0.35); m.material.opacity = 0.5 * Math.sin(k * Math.PI); });
  const m = s.man; m.g.position.set(0, 2.8, -2.4);
  const tC = nldW('conversation', 1, 39.4), tA = nldW('all', 2, 40.6);
  const bk = EZ.back(clamp((t - (tC - 0.3)) / 0.35)) * (1 - EZ.i2(clamp((t - tA) / 0.22)));
  c3PersonPose(m, s.cam, t, { expr: c3FaceAt([[0, 'sad'], [tC - 0.2, 'smile'], [tA + 0.1, 'sad']], t, 'oldman'), gaze: bk > 0.3 ? [0.4, 0.8] : [-0.2, -0.4], head: [bk > 0.3 ? 0.08 : -0.06, 0, 0],
    hand: { armL: [1.5, 1.35], armR: [-1.5, 1.35] }, foot: { legL: [0.6, -1.8], legR: [-0.6, -1.8] } });
  m.g.updateMatrixWorld(true);
  const head = m.root.localToWorld(nldV(0, 4.0, 0.2));
  s.bubble.visible = bk > 0.01; s.bubble.scale.setScalar(Math.max(0.01, bk)); s.bubble.position.copy(m.root.localToWorld(nldV(1.6, 6.9, 0.3))); nldFace(s.bubble, s.cam);
  s.trail.forEach((c, i) => { const k = clamp(bk * 3 - i * 0.6); c.visible = k > 0.01; c.scale.setScalar(Math.max(0.01, k));
    c.position.copy(head.clone().lerp(s.bubble.position, 0.22 + i * 0.2)).add(nldV(0.5 + i * 0.25, 0.2, 0)); nldFace(c, s.cam); });
  nldFg(s, [['lamp', [-4.8, 6.6, -9], 0.9], ['plant', [5.0, -7.0, -8], 1.1]], NLD_K21, 's21', lt, { orbit: 0.025, creep: 0.03 });
  nldRender(s, { bg: '#a85a2a', bgBlur: nldRack(lt, 's21', 2.4, 1.8), glow: 0.7, bloom: 0.2 });
};

// =====================================================================
//  s22 — "And loneliness there hits more than a million people.": dusk over the city; window after window lights up,
//  each with someone sitting alone; the street board's counter rolls up and lands on 1,000,000 on "million"
// =====================================================================
const NLD_K22 = [[0, [-3, 15, 60], [0, 22, -80], 46], [2.8, [-2, 19, 76], [0, 25, -80], 48]];
SHOT_FN['s22'] = (t, u, lt) => {
  const s = nldCity();
  c3SetCam(s.cam, nldCam(NLD_K22, lt, 's22', { orbit: -0.01, creep: 0.02 }));
  s.lit.forEach((w) => { w.m.visible = t >= w.t; });
  const tM = nldW('million', 1, 43.2), k = EZ.io(clamp((t - 41.4) / (tM - 41.4)));
  const n = k >= 1 ? 1000000 : Math.floor(Math.pow(k, 2.2) * 1000000 / 1111) * 1111;
  s.boardFace.material.map = nldTexKey(s.boardTex, n, () => nldTexBoard(n));
  s.board.scale.setScalar(1 + 0.05 * Math.max(0, Math.sin(clamp((t - tM) / 0.3) * Math.PI)));
  nldFg(s, [['lamp', [-7.2, -9.5, -13], 0.8]], NLD_K22, 's22', lt, { orbit: -0.02, creep: 0.02 });
  nldRender(s, { bg: '#3a3a86', bgBlur: nldRack(lt, 's22', 1.6, 1.0), glow: 0.95, glowBlur: 12, bloom: 0.24 });
};

// =====================================================================
//  s23 — "So instead of making checkouts faster,": the fast self-checkout prototype glows SCAN FASTER; the exec eyes it,
//  arms crossed, and shakes his head; on "faster" a big red X slaps onto its screen and the kiosk shudders
// =====================================================================
const NLD_K23 = [[0, [-13, 11.5, 22], [-20.5, 10.5, -7], 46], [2.0, [-15, 11.5, 18.5], [-20.8, 10.8, -7], 44]];
SHOT_FN['s23'] = (t, u, lt) => {
  const s = nldOffice(); nldOfficeReset(s);
  c3SetCam(s.cam, nldCam(NLD_K23, lt, 's23', { orbit: 0.03 }));
  const tF = nldW('faster', 1, 45.0), x = Math.round(EZ.back(clamp((t - (tF - 0.05)) / 0.18)) * 8) / 8;
  s.kioskFace.material.map = nldTexKey(s.kioskTex, x, () => nldTexKiosk(x)); s.kioskFace.material.userData.glow = x > 0 ? null : '#6a9ae8';
  s.kiosk.rotation.z = 0.02 * Math.sin(clamp((t - tF) / 0.4) * Math.PI * 4) * (1 - clamp((t - tF) / 0.4));
  const e = s.exec; e.g.visible = true; e.g.position.set(-22.4, NLD_FOOT, -1.5);
  const shake = Math.sin(clamp((t - (tF + 0.1)) / 0.6) * Math.PI * 3) * 0.12 * (t > tF ? 1 : 0);
  c3PersonPose(e, s.cam, t, { expr: c3FaceAt([[0, 'skeptical'], [tF, 'unimpressed']], t, 'exec'), gaze: [0.7, 0.1], head: [shake, 0, 0],
    hand: { armL: [-0.55, 1.35], armR: [0.55, 1.45] }, ...NLD_STAND });
  nldFg(s, [['chair', [-5.6, -7.6, -12], 1.0]], NLD_K23, 's23', lt, { orbit: 0.03 });
  nldRender(s, { bg: '#2a7a64', bgBlur: nldRack(lt, 's23', 2.2, 1.5), glow: 0.7 });
};

// =====================================================================
//  s27 — "It worked so well they planned about 200 more.": the wall map of the Netherlands; red pins pop in all over
//  the country (200 of them) while the plaque counts PLANNED: 0 → 200 on "200"; the exec throws his fists up on "well"
// =====================================================================
const NLD_K27 = [[0, [13, 12.5, 18], [19.5, 12.5, -21], 48], [2.7, [14.5, 13, 15], [19.5, 12.8, -21], 47]];
SHOT_FN['s27'] = (t, u, lt) => {
  const s = nldOffice(); nldOfficeReset(s);
  c3SetCam(s.cam, nldCam(NLD_K27, lt, 's27', { orbit: 0.01 }));
  const t0 = nldW('worked', 1, 52.1), t1 = nldW('200', 1, 53.5), tWell = nldW('well', 1, 52.5);
  const shown = Math.floor(200 * EZ.io(clamp((t - t0) / (t1 + 0.2 - t0)))), dm = new THREE.Object3D();
  s.pinHeads.count = s.pinNeedle.count = shown;
  for (let i = 0; i < shown; i++) { const [pu, pv] = s.pinPts[i], ti = t0 + (i / 200) * (t1 + 0.2 - t0), k = EZ.back(clamp((t - ti) / 0.16));
    const px = (pu - 0.5) * 16, py = (0.5 - pv) * 20;
    dm.position.set(px, py, 0.62 + 0.3 * k); dm.scale.setScalar(Math.max(0.01, k)); dm.rotation.set(0, 0, 0); dm.updateMatrix(); s.pinHeads.setMatrixAt(i, dm.matrix);
    dm.position.set(px, py, 0.42 + 0.15 * k); dm.rotation.set(Math.PI / 2, 0, 0); dm.updateMatrix(); s.pinNeedle.setMatrixAt(i, dm.matrix); }
  s.pinHeads.instanceMatrix.needsUpdate = s.pinNeedle.instanceMatrix.needsUpdate = true;
  const n = t >= t1 ? 200 : Math.floor(200 * clamp((t - t0) / (t1 - t0)) / 5) * 5;
  s.plaque.material.map = nldTexKey(s.plaqueTex, n, () => nldTexPlaque(n));
  const e = s.exec; e.g.visible = true; e.g.position.set(15.2, NLD_FOOT, -11.5);
  const up = EZ.back(clamp((t - tWell) / 0.25));
  c3PersonPose(e, s.cam, t, { expr: c3FaceAt([[0, 'smile'], [tWell, 'excited'], [t1, 'proud']], t, 'exec'), gaze: [0.8, 0.3],
    hand: { armL: [lerp(1.2, 1.8, up), lerp(-0.2, 4.6, up)], armR: [lerp(-1.2, -1.8, up), lerp(-0.2, 4.6, up)] }, lift: (x) => 0.25 * Math.max(0, Math.sin(clamp((x - tWell) / 0.35) * Math.PI)), ...NLD_STAND });
  e.extras.sparkle.visible = t > t1 - 0.1;
  nldFg(s, [['plant', [-5.4, -7.2, -11], 1.2]], NLD_K27, 's27', lt, { orbit: 0.01 });
  nldRender(s, { bg: '#2a7a64', bgBlur: nldRack(lt, 's27', 2.0, 1.4), glow: 0.5 });
};

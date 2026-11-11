// =====================================================================
//  SET store — the Unclaimed Baggage sales floor, Scottsboro, Alabama: a huge department-store hall (x -75..75,
//  z -20..100, ceiling 44) with warm yellow walls over a green wainscot, a polished tile floor with a red runner, an
//  exposed teal ceiling with beams, ducts and light rows, hanging department signs with sub-text. Front wall (z 100):
//  glass sliding doors (x -8..8) onto the blazing parking lot, the front window (x 16..64) with the TEMP 98°F sign
//  outside. The s13 row (z ~46): shirts rack · electronics glass case · headphones wall · bridal mannequins · ski boots.
//  Register counter (x -37..-23, z 70) with display, drawer, scanner, bags, candy rack. Luggage shelf (x 40..62, z 30).
//  Registers s11-s19, s36. Prefix st. Extras CAST.stA..stF.
// =====================================================================
const ST = {};
const ST_H = 44, ST_X = 75, ST_Z0 = -20, ST_Z1 = 100;
const ST_REG = [-30, 76], ST_CASH = [-33.4, 72.4], ST_JACK = [-25.2, 80.4], ST_SKI = [40, 93.6], ST_BAGP = [51, 30];
const ST_ROW = { shirts: -50, cams: -36, phones: -22, bridal: -8, boots: 8, z: 46 };
// extras (own costumes: hair / colours not used by the main cast)
CAST.stA = { key: 'stA', hair: 'bun', hairColor: 'chestnut', outfit: 'sweater', colors: { main: '#d8508a', rib: '#b83a70' }, skin: 'peach', body: 'avg' };
CAST.stB = { key: 'stB', hair: 'mop', hairColor: 'blond', outfit: 'shirt', colors: { main: '#f28a2a', tie: '#f28a2a', pocket: true }, skin: 'tan', body: 'fat' };
CAST.stC = { key: 'stC', hair: 'bob', hairColor: 'black', outfit: 'dress', colors: { main: '#7a5ab8', belt: '#3a2a5a' }, skin: 'pale', body: 'thin' };
CAST.stD = { key: 'stD', hair: 'bowl', hairColor: 'brown', outfit: 'hoodie', colors: { main: '#2fa8a0', cord: '#ffffff' }, skin: 'white', body: 'kid' };
CAST.stE = { key: 'stE', hair: 'bald', outfit: 'vest', colors: { main: '#3a5ac8', shirt: '#ffffff', tie: '#f2c23a' }, glasses: true, skin: 'brown', body: 'tall' };
CAST.stF = { key: 'stF', hair: 'topknot', hairColor: 'white', outfit: 'polo', colors: { main: '#e8d23a', collar: '#c8b028' }, skin: 'tan', body: 'short' };

// ---- batching: many coloured parts -> ONE mesh with vertex colours (keeps the set far under the mesh budget)
const stMx = new THREE.Matrix4(), stQt = new THREE.Quaternion(), stEu = new THREE.Euler();
function stG(geo, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { stEu.set(rx, ry, rz); stQt.setFromEuler(stEu); stMx.compose(V3(x, y, z), stQt, V3(sx, sy, sz)); return geo.applyMatrix4(stMx); }
const stBx = (w, h, d, x, y, z, ry = 0, rx = 0, rz = 0) => stG(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz);
const stCy = (r0, r1, h, x, y, z, rx = 0, ry = 0, rz = 0, seg = 14) => stG(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, rx, ry, rz);
function stMerge(parts, o = {}) {
  const L = parts.map(([g, c]) => [g.index ? g.toNonIndexed() : g, new THREE.Color(c)]); let n = 0; L.forEach(([g]) => { n += g.attributes.position.count; });
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3), C = new Float32Array(n * 3), U = new Float32Array(n * 2); let k = 0;
  for (const [g, c] of L) { const p = g.attributes.position, nn = g.attributes.normal, uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++, k++) { P[k * 3] = p.getX(i); P[k * 3 + 1] = p.getY(i); P[k * 3 + 2] = p.getZ(i); N[k * 3] = nn.getX(i); N[k * 3 + 1] = nn.getY(i); N[k * 3 + 2] = nn.getZ(i);
      const ao = o.ao === false ? 1 : 0.78 + 0.22 * clamp(p.getY(i) / 7); C[k * 3] = c.r * ao; C[k * 3 + 1] = c.g * ao; C[k * 3 + 2] = c.b * ao; if (uv) { U[k * 2] = uv.getX(i); U[k * 2 + 1] = uv.getY(i); } } }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(U, 2));
  const mat = o.flat ? new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true, toneMapped: false }) : c3Prop('#ffffff', { map: o.map, rough: o.rough ?? 0.5, metal: o.metal ?? 0, env: o.env ?? 1, emissive: o.emissive, ei: o.ei, glow: o.glow }); mat.vertexColors = true;
  const m = new THREE.Mesh(geo, mat); m.userData.noShade = true; if (o.noCast) m.userData.noCast = true; return m;
}
const stHsl = (h, s = 70, l = 52) => { const c = new THREE.Color(); c.setHSL(((h % 360) + 360) % 360 / 360, s / 100, l / 100); return '#' + c.getHexString(); };
const stPlane = (w, h, map, x, y, z, ry = 0, rx = 0, o = {}) => { const m = pl(w, h, o.lit ? c3Prop('#ffffff', { map, rough: 0.7 }) : c3Flat('#ffffff', { map, transparent: !!o.tr }), x, y, z, ry, rx); if (o.tr) m.material.alphaTest = 0; m.userData.noCast = true; return m; };

// ---- textures
function stWallMat(T, x0, w, y0, h) { const t = T.clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(w / 26, h / ST_H); t.offset.set(x0 / 26, y0 / ST_H); return c3Prop('#ffffff', { map: t, rough: 0.85 }); }
function stTexOutside() { return tex((g, w, h) => { const sk = g.createLinearGradient(0, 0, 0, h); sk.addColorStop(0, '#2f8ae0'); sk.addColorStop(0.55, '#8ccaf2'); sk.addColorStop(0.86, '#fff2c0'); sk.addColorStop(1, '#ffe8a0'); g.fillStyle = sk; g.fillRect(0, 0, w, h);
  const sx = w * 0.62, sy = h * 0.22, gl = g.createRadialGradient(sx, sy, 10, sx, sy, h * 0.6); gl.addColorStop(0, 'rgba(255,255,240,1)'); gl.addColorStop(0.12, 'rgba(255,250,200,0.95)'); gl.addColorStop(0.4, 'rgba(255,230,140,0.35)'); gl.addColorStop(1, 'rgba(255,220,120,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(sx, sy, h * 0.07, 0, TAU); g.fill();
  const R = RNG('st-out'); for (let i = 0; i < 70; i++) { const x = i / 70 * w + R.r(-10, 10), r = R.r(26, 60); g.fillStyle = i % 3 ? '#3f7a3a' : '#2f6a34'; g.beginPath(); g.moveTo(x - r * 0.6, h * 0.94); g.lineTo(x, h * 0.94 - r * 2.2); g.lineTo(x + r * 0.6, h * 0.94); g.fill(); }
  g.fillStyle = '#7a9a5a'; g.fillRect(0, h * 0.93, w, h * 0.07); g.fillStyle = 'rgba(255,240,200,0.35)'; for (let k = 0; k < 6; k++) g.fillRect(0, h * (0.8 + k * 0.025), w, 3); }, 2048, 1024); }
function stTexLot() { const t = tex((g, w, h) => { g.fillStyle = '#c8b8a2'; g.fillRect(0, 0, w, h); const R = RNG('lot'); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(90,70,50,${R.r(0.05, 0.15)})`; g.fillRect(R.r(0, w), R.r(0, h), 3, 3); }
  g.fillStyle = '#fbf6e8'; for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 8, h * 0.6); g.fillStyle = '#f2c23a'; g.fillRect(0, h * 0.8, w, 10); }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 3); return t; }
function stTexSign(big, sub, bgc, fg = '#ffffff', subc = '#ffe27a') { return tex((g, w, h) => { g.fillStyle = bgc; g.fillRect(0, 0, w, h); g.lineWidth = 18; g.strokeStyle = '#2a1208'; g.strokeRect(9, 9, w - 18, h - 18); g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.5)'; g.strokeRect(30, 30, w - 60, h - 60);
  inked(g, big, w / 2, h * 0.42, h * 0.38, fg, { stroke: '#2a1208', sw: h * 0.05, maxW: w * 0.86 }); inked(g, sub, w / 2, h * 0.78, h * 0.15, subc, { stroke: false, weight: 800, maxW: w * 0.84 }); }, 1024, 384); }
function stTexTemp() { return tex((g, w, h) => { g.fillStyle = '#1a1416'; g.fillRect(0, 0, w, h); g.lineWidth = 16; g.strokeStyle = '#c8c4bc'; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#d8322a'; g.fillRect(16, 16, w - 32, h * 0.24); inked(g, 'TEMP', w / 2, h * 0.14, h * 0.15, '#ffffff', { stroke: false });
  const tx = w * 0.17; g.fillStyle = '#f2ece0'; g.beginPath(); g.roundRect(tx - 18, h * 0.34, 36, h * 0.46, 18); g.fill(); g.beginPath(); g.arc(tx, h * 0.82, 34, 0, TAU); g.fill();
  g.fillStyle = '#ff2a1a'; g.beginPath(); g.roundRect(tx - 9, h * 0.38, 18, h * 0.44, 9); g.fill(); g.beginPath(); g.arc(tx, h * 0.82, 24, 0, TAU); g.fill();
  g.shadowColor = '#ff3a1a'; g.shadowBlur = 30; inked(g, '98°F', w * 0.6, h * 0.6, h * 0.46, '#ff4a2a', { stroke: false, font: 'Impact, "Arial Black", sans-serif', maxW: w * 0.66 }); g.shadowBlur = 0; }, 768, 512); }
function stTexGoods(seed, kind) { const t = tex((g, w, h) => { const R = RNG('gd' + kind, seed); g.fillStyle = '#5a3420'; g.fillRect(0, 0, w, h); const rows = 4;
  for (let r = 0; r < rows; r++) { const y0 = r * h / rows, y1 = y0 + h / rows - 14; g.fillStyle = '#e8e2d8'; g.fillRect(0, y1, w, 14); let x = 6;
    while (x < w - 20) { const c = stHsl(R.r(0, 360), R.r(55, 85), R.r(40, 62)), bw = kind === 'books' ? R.r(10, 22) : R.r(26, 54), bh = (y1 - y0) * R.r(0.55, 0.92);
      g.fillStyle = c; if (kind === 'toys' && R.f() < 0.4) { g.beginPath(); g.arc(x + bw / 2, y1 - bw / 2, bw / 2, 0, TAU); g.fill(); g.strokeStyle = '#2a1208'; g.lineWidth = 3; g.stroke(); }
      else if (kind === 'shades') { g.fillStyle = '#f2ece0'; g.fillRect(x, y1 - bh, bw, bh); g.fillStyle = '#1a1a22'; g.beginPath(); g.ellipse(x + bw * 0.3, y1 - bh * 0.6, bw * 0.2, bw * 0.14, 0, 0, TAU); g.ellipse(x + bw * 0.7, y1 - bh * 0.6, bw * 0.2, bw * 0.14, 0, 0, TAU); g.fill(); g.fillStyle = c; g.fillRect(x + bw * 0.2, y1 - bh * 0.6 - bw * 0.18, bw * 0.6, 3); }
      else { g.fillRect(x, y1 - bh, bw, bh); g.strokeStyle = 'rgba(30,10,0,0.6)'; g.lineWidth = 2; g.strokeRect(x, y1 - bh, bw, bh); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 3, y1 - bh + 6, bw - 6, 3); }
      x += bw + R.r(2, 6); } } }, 512, 512); t.wrapS = THREE.RepeatWrapping; return t; }
function stTexFaceShirts() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); ['#e8402e', '#f2c23a', '#2f8ae0'].forEach((c, i) => { const cx = w * (0.18 + i * 0.32), y = h * 0.12, sw = w * 0.26;
  g.beginPath(); g.moveTo(cx - sw * 0.2, y); g.lineTo(cx - sw * 0.5, y + 20); g.lineTo(cx - sw * 0.62, y + h * 0.36); g.lineTo(cx - sw * 0.44, y + h * 0.38); g.lineTo(cx - sw * 0.4, y + h * 0.82); g.lineTo(cx + sw * 0.4, y + h * 0.82); g.lineTo(cx + sw * 0.44, y + h * 0.38); g.lineTo(cx + sw * 0.62, y + h * 0.36); g.lineTo(cx + sw * 0.5, y + 20); g.lineTo(cx + sw * 0.2, y); g.closePath();
  g.fillStyle = c; g.fill(); g.lineWidth = 7; g.strokeStyle = '#2a1208'; g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(cx - sw * 0.2, y); g.lineTo(cx, y + 34); g.lineTo(cx + sw * 0.2, y); g.fill(); g.stroke();
  g.fillStyle = '#2a1208'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(cx, y + 60 + k * 44, 5, 0, TAU); g.fill(); }
  g.strokeStyle = '#2a1208'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, y); g.lineTo(cx, y - 28); g.arc(cx + 10, y - 28, 10, Math.PI, Math.PI * 1.9); g.stroke();
  g.fillStyle = '#fbf6e8'; g.fillRect(cx + sw * 0.18, y + h * 0.5, 50, 34); g.strokeRect(cx + sw * 0.18, y + h * 0.5, 50, 34); }); }, 768, 512); }
function stTexPeg() { return tex((g, w, h) => { g.fillStyle = '#e8842a'; g.fillRect(0, 0, w, h); g.fillStyle = '#a8501a'; for (let y = 16; y < h; y += 32) for (let x = 16; x < w; x += 32) { g.beginPath(); g.arc(x, y, 4, 0, TAU); g.fill(); }
  g.fillStyle = '#2a1208'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); }, 512, 512); }
function stTexCandy() { return tex((g, w, h) => { g.fillStyle = '#3a2214'; g.fillRect(0, 0, w, h); const R = RNG('candy'); for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = 8 + i * (w - 16) / 9, y = 8 + r * (h - 16) / 4, bw = (w - 16) / 9 - 6, bh = (h - 16) / 4 - 8;
  g.fillStyle = ['#e8402e', '#f2c23a', '#2f8ae0', '#8a4ab8', '#3fae5a', '#f27aa8', '#ff8a1c'][Math.floor(R.f() * 7)]; g.fillRect(x, y + 6, bw, bh - 6); g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x + 4, y + bh * 0.45, bw - 8, 6); } }, 512, 256); }
function stTexTag(price, c = '#fbf6e8') { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = c; g.beginPath(); g.moveTo(w * 0.25, 8); g.lineTo(w - 8, 8); g.lineTo(w - 8, h - 8); g.lineTo(w * 0.25, h - 8); g.lineTo(8, h / 2); g.closePath(); g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#2a1208'; g.beginPath(); g.arc(w * 0.17, h / 2, 9, 0, TAU); g.fill(); inked(g, price, w * 0.6, h / 2 + 2, h * 0.42, '#d8322a', { stroke: false, maxW: w * 0.66 }); }, 256, 128); }
function stTexBanner(l1, l2, c) { return tex((g, w, h) => { g.fillStyle = c; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
  inked(g, l1, w / 2, h * 0.4, h * 0.3, '#ffffff', { stroke: '#2a1208', sw: 10, maxW: w * 0.9 }); inked(g, l2, w / 2, h * 0.76, h * 0.15, '#ffe27a', { stroke: false, weight: 800, maxW: w * 0.9 }); }, 1024, 256); }
function stTexBills() { return tex((g, w, h) => { g.fillStyle = '#2a2a30'; g.fillRect(0, 0, w, h); for (let i = 0; i < 5; i++) { g.fillStyle = i < 3 ? '#7ab86a' : '#c8c4bc'; g.fillRect(8 + i * (w - 16) / 5, 10, (w - 16) / 5 - 8, h - 20); g.fillStyle = 'rgba(30,60,20,0.5)'; if (i < 3) g.fillRect(14 + i * (w - 16) / 5, h * 0.4, (w - 16) / 5 - 20, 8); } }, 256, 128); }
// the driver's licence (his own): blue header, jack's mini portrait, his name
function stTexLicence() { return tex((g, w, h) => { g.fillStyle = '#eef4fa'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = '#2a1208'; g.stroke();
  g.save(); g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 30); g.clip(); g.fillStyle = '#2f6fb8'; g.fillRect(0, 0, w, h * 0.24); g.restore();
  inked(g, 'DRIVER LICENSE', w / 2, h * 0.125, h * 0.12, '#ffffff', { stroke: false, maxW: w * 0.84 });
  const px = w * 0.06, py = h * 0.31, pw = w * 0.3, ph = h * 0.6; g.fillStyle = '#bcd8ee'; g.fillRect(px, py, pw, ph); g.lineWidth = 6; g.strokeStyle = '#2a1208'; g.strokeRect(px, py, pw, ph);
  { const im = ASSETS['lic_photo.jpg']; g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
    if (im && im.width) { const iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height, sc = Math.max(pw / iw, ph / ih) * 1.08, dw = iw * sc, dh = ih * sc; g.drawImage(im, px + (pw - dw) / 2, py + (ph - dh) * 0.35, dw, dh); }
    g.restore(); g.lineWidth = 6; g.strokeStyle = '#2a1208'; g.strokeRect(px, py, pw, ph); }
  inked(g, 'JACK P. MILLER', w * 0.68, h * 0.4, h * 0.1, '#2a1208', { stroke: false, maxW: w * 0.56 });
  g.fillStyle = 'rgba(40,40,60,0.55)'; for (let k = 0; k < 3; k++) g.fillRect(w * 0.42, h * (0.55 + k * 0.09), w * (0.46 - k * 0.08), 10);
  g.strokeStyle = '#1a2a6a'; g.lineWidth = 5; g.beginPath(); g.moveTo(w * 0.44, h * 0.86); for (let i = 0; i < 10; i++) g.lineTo(w * (0.44 + i * 0.03), h * 0.86 + Math.sin(i * 1.9) * 9); g.stroke(); }, 640, 400); }
function stTexSale() { return tex((g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffe23a'; g.beginPath(); g.moveTo(w * 0.5, 8); g.lineTo(w - 10, h * 0.2); g.lineTo(w - 10, h - 10); g.lineTo(10, h - 10); g.lineTo(10, h * 0.2); g.closePath(); g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1208'; g.stroke();
  g.fillStyle = '#2a1208'; g.beginPath(); g.arc(w * 0.5, h * 0.12, 14, 0, TAU); g.fill(); g.fillStyle = '#e8282a'; g.fillRect(26, h * 0.27, w - 52, h * 0.3);
  inked(g, 'SALE', w / 2, h * 0.42, h * 0.2, '#ffffff', { stroke: '#2a1208', sw: 10, maxW: w * 0.78 }); inked(g, '$19.99', w / 2, h * 0.76, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.8 }); }, 512, 640); }

// ---- v3 DETAIL pass: textured surfaces (noise, wear, scuffs), atlas fabrics, worn hard goods
const stTx = (draw, w, h, srgb = true) => c3Tex(draw, w, h, srgb);
function stSpeck(g, w, h, R, n, sz, rgb, a0, a1, x0 = 0, y0 = 0) { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${rgb},${R.r(a0, a1)})`; const s = R.r(1, sz); g.fillRect(x0 + R.r(0, w), y0 + R.r(0, h), s, s * R.r(0.6, 1.4)); } }
function stScuff(g, R, x, y, r, a, lw) { g.strokeStyle = `rgba(22,16,10,${a})`; g.lineWidth = lw; g.beginPath(); const a0 = R.r(0, TAU); g.arc(x, y, r, a0, a0 + R.r(0.4, 1.6)); g.stroke(); }
// polished vinyl tile: 8x8 tiles per repeat, each its own tone + mottling, dark grout, heel scuffs, worn traffic patches
function stTexFloor() { const R = RNG('stflr2'); return stTx((g, w, h) => { const N = 8, s = w / N; g.fillStyle = '#5e4630'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const l = 41 + R.r(-5, 5) + ((i + j) % 2 ? -3 : 1); g.fillStyle = `hsl(${30 + R.r(-3, 3)},${46 + R.r(-5, 5)}%,${l}%)`; g.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
    for (let k = 0; k < 26; k++) { g.fillStyle = R.f() < 0.55 ? `rgba(90,60,32,${R.r(0.04, 0.1)})` : `rgba(255,236,205,${R.r(0.04, 0.1)})`; g.beginPath(); g.arc(i * s + R.r(6, s - 6), j * s + R.r(6, s - 6), R.r(2, 9), 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(60,40,20,0.28)'; g.lineWidth = 3; g.strokeRect(i * s + 3.5, j * s + 3.5, s - 7, s - 7); g.fillStyle = 'rgba(255,245,225,0.10)'; g.fillRect(i * s + 5, j * s + 5, s - 10, 3); }
  for (let k = 0; k < 14; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(60, 160)); gr.addColorStop(0, `rgba(70,50,30,${R.r(0.06, 0.14)})`); gr.addColorStop(1, 'rgba(70,50,30,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  for (let k = 0; k < 120; k++) stScuff(g, R, R.r(0, w), R.r(0, h), R.r(5, 28), R.r(0.1, 0.32), R.r(1.2, 3.5));
  stSpeck(g, w, h, R, 2500, 2, '40,28,16', 0.05, 0.16); }, 1024, 1024); }
function stTexFloorR() { const R = RNG('stflr2r'); const t = stTx((g, w, h) => { const N = 8, s = w / N; g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, w, h);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const v = Math.round(R.r(110, 170)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); }
  for (let k = 0; k < 30; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(50, 140)); gr.addColorStop(0, 'rgba(220,220,220,0.55)'); gr.addColorStop(1, 'rgba(220,220,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  for (let k = 0; k < 160; k++) { g.strokeStyle = 'rgba(235,235,235,0.6)'; g.lineWidth = R.r(1, 3); g.beginPath(); const x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); g.lineTo(x + R.r(-40, 40), y + R.r(-40, 40)); g.stroke(); } }, 512, 512, false); return t; }
// painted block-wall: yellow with roller bands, touch-ups, nail holes + tape, cart scuffs; red chair rail; green panelled wainscot; rubber base
// v6: the wall's roller bands made faint (they read as wood planks)
function stTexWall() { const R = RNG('stwall2'); const t = tex((g, w, h) => { const wn = h * 0.84;
  const gr = g.createLinearGradient(0, 0, 0, wn); gr.addColorStop(0, '#c4945a'); gr.addColorStop(0.35, '#d0a460'); gr.addColorStop(0.75, '#d8ac64'); gr.addColorStop(1, '#b8894a');   // v5: a saturated warm ochre (Ricks interiors), not beige g.fillStyle = gr; g.fillRect(0, 0, w, wn);
  for (let y = 0; y < wn; y += 42) { g.fillStyle = 'rgba(90,55,0,0.05)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,240,190,0.06)'; g.fillRect(0, y + 2, w, 2); for (let x = (y / 42) % 2 ? 0 : 64; x < w; x += 128) { g.fillStyle = 'rgba(90,55,0,0.035)'; g.fillRect(x, y, 2, 42); } }   // block joints under the paint
  for (let x = 0; x < w;) { const bw = R.r(18, 60); g.fillStyle = R.f() < 0.5 ? `rgba(255,240,210,${R.r(0.01, 0.03)})` : `rgba(90,70,40,${R.r(0.015, 0.035)})`; g.fillRect(x, 0, bw, wn); x += bw; }
  for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(${R.f() < 0.5 ? '220,200,160' : '150,125,85'},${R.r(0.12, 0.25)})`; g.fillRect(R.r(0, w - 80), R.r(80, wn - 140), R.r(30, 90), R.r(20, 70)); }
  for (let k = 0; k < 18; k++) { const x = R.r(10, w - 10), y = R.r(200, wn - 160); g.fillStyle = 'rgba(60,35,10,0.55)'; g.fillRect(x, y, 3, 3); if (R.f() < 0.4) { g.fillStyle = 'rgba(255,250,232,0.55)'; g.save(); g.translate(x, y); g.rotate(R.r(-0.5, 0.5)); g.fillRect(-10, -4, 22, 9); g.restore(); } }
  stSpeck(g, w, wn, R, 3000, 2, '80,62,40', 0.05, 0.14); { const gw = g.createLinearGradient(0, 0, 0, wn); gw.addColorStop(0, 'rgba(40,30,20,0.28)'); gw.addColorStop(0.5, 'rgba(40,30,20,0)'); gw.addColorStop(0.9, 'rgba(60,45,30,0.06)'); gw.addColorStop(1, 'rgba(40,30,20,0.22)'); g.fillStyle = gw; g.fillRect(0, 0, w, wn); }
  for (let k = 0; k < 26; k++) { g.strokeStyle = `rgba(60,45,30,${R.r(0.08, 0.22)})`; g.lineWidth = R.r(1.5, 4); g.beginPath(); const x = R.r(0, w), y = wn - R.r(8, 90); g.moveTo(x, y); g.lineTo(x + R.r(10, 60), y + R.r(-6, 6)); g.stroke(); }
  g.fillStyle = '#c42e28'; g.fillRect(0, wn - 16, w, 14); g.fillStyle = 'rgba(255,200,180,0.35)'; g.fillRect(0, wn - 16, w, 3); g.fillStyle = 'rgba(40,0,0,0.45)'; g.fillRect(0, wn - 4, w, 4);
  g.fillStyle = '#2f5e46'; g.fillRect(0, wn, w, h - wn);
  for (let x = 0; x < w; x += 128) { const y0 = wn + 14, ph = h - wn - 38; g.fillStyle = 'rgba(0,25,10,0.5)'; g.fillRect(x + 10, y0, 108, ph); g.fillStyle = '#386c50'; g.fillRect(x + 14, y0 + 4, 100, ph - 8);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 14, y0 + 4, 100, 3); g.fillRect(x + 14, y0 + 4, 3, ph - 8); g.fillStyle = 'rgba(0,30,10,0.4)'; g.fillRect(x + 14, y0 + ph - 8, 100, 4); g.fillRect(x + 111, y0 + 4, 3, ph - 8);
    const gg = g.createLinearGradient(0, y0, 0, y0 + ph); gg.addColorStop(0, 'rgba(255,255,255,0.05)'); gg.addColorStop(1, 'rgba(0,20,5,0.18)'); g.fillStyle = gg; g.fillRect(x + 17, y0 + 7, 94, ph - 14); }
  stSpeck(g, w, h - wn, R, 900, 2, '0,20,8', 0.08, 0.2, 0, wn);
  for (let k = 0; k < 30; k++) { g.strokeStyle = `rgba(15,15,15,${R.r(0.15, 0.4)})`; g.lineWidth = R.r(1.5, 4); g.beginPath(); const x = R.r(0, w), y = h - R.r(20, 110); g.moveTo(x, y); g.lineTo(x + R.r(8, 50), y + R.r(-4, 4)); g.stroke(); }
  g.fillStyle = '#22261f'; g.fillRect(0, h - 16, w, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, h - 16, w, 2); }, 512, 1024); t.wrapS = THREE.RepeatWrapping; return t; }
// corrugated steel deck (painted teal), stripes along z
function stTexDeck() { const R = RNG('stdeck'); const t = tex((g, w, h) => { g.fillStyle = '#2b605c'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { const gr = g.createLinearGradient(x, 0, x + 32, 0); gr.addColorStop(0, '#1e4a47'); gr.addColorStop(0.3, '#336e69'); gr.addColorStop(0.6, '#2f6763'); gr.addColorStop(1, '#183e3b'); g.fillStyle = gr; g.fillRect(x, 0, 32, h); }
  stSpeck(g, w, h, R, 600, 3, '10,25,22', 0.1, 0.3); for (let k = 0; k < 8; k++) { g.fillStyle = `rgba(120,90,40,${R.r(0.08, 0.18)})`; g.fillRect(R.r(0, w), R.r(0, h), R.r(6, 30), R.r(30, 120)); } }, 256, 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2 * ST_X / 8, (ST_Z1 - ST_Z0) / 8); return t; }
// generic worn surface for batched hard goods (multiplies the vertex colour): edge darkening per face, grain, scratches
function stTexWorn() { const R = RNG('stworn'); return stTx((g, w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, w, h); stSpeck(g, w, h, R, 1400, 2, '40,40,40', 0.04, 0.12); stSpeck(g, w, h, R, 400, 2, '255,255,255', 0.2, 0.5);
  for (let k = 0; k < 24; k++) { g.strokeStyle = `rgba(${R.f() < 0.5 ? '60,60,60' : '255,255,255'},${R.r(0.08, 0.25)})`; g.lineWidth = 1; g.beginPath(); const x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); g.lineTo(x + R.r(-40, 40), y + R.r(-12, 12)); g.stroke(); }
  const e = 0.09; for (const [a, b, c, d] of [[0, 0, e, 0], [1, 0, 1 - e, 0], [0, 0, 0, e], [0, 1, 0, 1 - e]]) { const gr = g.createLinearGradient(a * w, b * h, c * w, d * h); gr.addColorStop(0, 'rgba(30,24,18,0.42)'); gr.addColorStop(1, 'rgba(30,24,18,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
  g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); }, 256, 256); }
// fabric atlas (4 columns): plain with folds, stripes, plaid, denim; each with vertical drape shading, a darker shoulder and hem
function stTexFabric() { const R = RNG('stfab'); return stTx((g, w, h) => { const cw = w / 4;
  for (let c = 0; c < 4; c++) { const x0 = c * cw; g.fillStyle = '#ececec'; g.fillRect(x0, 0, cw, h);
    if (c === 1) { for (let y = 0; y < h; y += 22) { g.fillStyle = 'rgba(40,40,60,0.32)'; g.fillRect(x0, y, cw, 8); } }
    if (c === 2) { for (let y = 0; y < h; y += 40) { g.fillStyle = 'rgba(30,20,20,0.26)'; g.fillRect(x0, y, cw, 12); } for (let x = 0; x < cw; x += 40) { g.fillStyle = 'rgba(30,20,20,0.22)'; g.fillRect(x0 + x, 0, 12, h); } for (let y = 0; y < h; y += 40) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x0, y + 24, cw, 3); } }
    if (c === 3) { for (let y = 0; y < h; y += 3) { g.fillStyle = `rgba(20,30,60,${R.r(0.1, 0.25)})`; g.fillRect(x0, y, cw, 1); } stSpeck(g, cw, h, R, 500, 2, '255,255,255', 0.1, 0.3, x0, 0); }
    stSpeck(g, cw, h, R, 600, 2, '0,0,0', 0.04, 0.1, x0, 0);
    for (let k = 0; k < 7; k++) { const fx = x0 + R.r(6, cw - 6), fw = R.r(6, 18), gr = g.createLinearGradient(fx - fw, 0, fx + fw, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.26)'); gr.addColorStop(0.6, 'rgba(255,255,255,0.16)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(fx - fw, h * R.r(0.05, 0.25), fw * 2, h); }
    const sh = g.createLinearGradient(0, 0, 0, h * 0.2); sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sh; g.fillRect(x0, 0, cw, h * 0.2);
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(x0, h - 14, cw, 3); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x0, h - 6, cw, 6);
    const e = g.createLinearGradient(x0, 0, x0 + cw, 0); e.addColorStop(0, 'rgba(0,0,0,0.3)'); e.addColorStop(0.12, 'rgba(0,0,0,0)'); e.addColorStop(0.88, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = e; g.fillRect(x0, 0, cw, h); } }, 512, 256); }
const stUvCol = (geo, col, n = 4) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, (col + Math.min(0.98, Math.max(0.02, uv.getX(i)))) / n); return geo; };
// slatwall (maroon): horizontal grooves with aluminium inserts, scuffs where bags were dragged
function stTexSlat() { const R = RNG('stslat'); const t = tex((g, w, h) => { g.fillStyle = '#9a2026'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(255,190,180,0.10)'; g.fillRect(0, y, w, 4); g.fillStyle = '#5a1418'; g.fillRect(0, y + 24, w, 6); g.fillStyle = '#b8bcc2'; g.fillRect(0, y + 26, w, 2); }
  stSpeck(g, w, h, R, 1200, 2, '40,0,0', 0.08, 0.2); for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(30,10,10,${R.r(0.1, 0.3)})`; g.lineWidth = R.r(1, 3); g.beginPath(); const x = R.r(0, w), y = R.r(0, h); g.moveTo(x, y); g.lineTo(x + R.r(10, 50), y + R.r(-3, 3)); g.stroke(); } }, 512, 512); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// laminate checkout front (red panels, seams, stainless kick plate, scuffs) and speckled counter top
function stTexCounterFront() { const R = RNG('stcf'); return tex((g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c42a2c'); gr.addColorStop(1, '#a82024'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += w / 5) { g.fillStyle = 'rgba(40,0,0,0.5)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(255,200,190,0.15)'; g.fillRect(x + 3, 0, 2, h); }
  stSpeck(g, w, h, R, 1500, 2, '60,0,0', 0.06, 0.16); const kp = h * 0.8; const kg = g.createLinearGradient(0, kp, 0, h); kg.addColorStop(0, '#d8dce2'); kg.addColorStop(0.5, '#9aa0a8'); kg.addColorStop(1, '#6a7078'); g.fillStyle = kg; g.fillRect(0, kp, w, h - kp);
  for (let y = kp; y < h; y += 3) { g.fillStyle = `rgba(255,255,255,${R.r(0.02, 0.1)})`; g.fillRect(0, y, w, 1); }
  for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(20,10,10,${R.r(0.15, 0.4)})`; g.lineWidth = R.r(1.5, 4); g.beginPath(); const x = R.r(0, w), y = R.r(kp - 60, h - 4); g.moveTo(x, y); g.lineTo(x + R.r(8, 40), y + R.r(-3, 3)); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.roundRect(w * 0.72, h * 0.2, w * 0.18, h * 0.22, 8); g.fill(); ['#1a4ab8', '#e8282a', '#f2a01a', '#2a2a30'].forEach((c, i) => { g.fillStyle = c; g.fillRect(w * (0.735 + i * 0.04), h * 0.27, w * 0.032, h * 0.08); });
  inked(g, 'WE ACCEPT', w * 0.81, h * 0.39, h * 0.045, '#2a1208', { stroke: false, maxW: w * 0.16 }); }, 1024, 256); }
function stTexTop() { const R = RNG('sttop'); return tex((g, w, h) => { g.fillStyle = '#e4ddd0'; g.fillRect(0, 0, w, h); stSpeck(g, w, h, R, 5000, 2, '90,80,70', 0.15, 0.4); stSpeck(g, w, h, R, 1500, 2, '255,255,255', 0.3, 0.6);
  const gr = g.createRadialGradient(w * 0.55, h * 0.5, 10, w * 0.55, h * 0.5, w * 0.35); gr.addColorStop(0, 'rgba(120,100,80,0.18)'); gr.addColorStop(1, 'rgba(120,100,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(80,60,40,0.5)'; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6); }, 1024, 256); }
// a sheet of paper on the wall: taped corners (drawn), one corner curls off the wall
function stPoster(par, w, h, map, x, y, z, ry) { const geo = new THREE.PlaneGeometry(w, h, 6, 6), P = geo.attributes.position;
  for (let i = 0; i < P.count; i++) { const u = (P.getX(i) / w + 0.5), v = (P.getY(i) / h + 0.5), d = Math.max(0, u + (1 - v) - 1.55); P.setZ(i, d * d * w * 0.9 + 0.01 * Math.sin(u * 9)); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, c3Prop('#ffffff', { map, rough: 0.8 })); m.material.side = THREE.DoubleSide; m.position.set(x, y, z); m.rotation.y = ry; m.userData.noCast = true; par.add(m); return m; }
function stTexPoster(l1, l2, l3, bg, fg) { const R = RNG('stp' + l1); return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(1, 'rgba(60,40,20,0.22)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  inked(g, l1, w / 2, h * 0.26, h * 0.13, fg, { stroke: false, maxW: w * 0.84 }); inked(g, l2, w / 2, h * 0.46, h * 0.1, '#2a1208', { stroke: false, maxW: w * 0.84 });
  g.fillStyle = 'rgba(40,20,10,0.5)'; for (let k = 0; k < 5; k++) g.fillRect(w * 0.14, h * (0.6 + k * 0.05), w * (k % 2 ? 0.6 : 0.72), 5); inked(g, l3, w / 2, h * 0.9, h * 0.05, '#4a3020', { stroke: false, maxW: w * 0.8 });
  stSpeck(g, w, h, R, 400, 3, '120,90,40', 0.05, 0.15); g.fillStyle = 'rgba(250,245,225,0.75)'; for (const [tx, ty, r] of [[0.06, 0.03, -0.6], [0.94, 0.03, 0.6], [0.06, 0.97, 0.6]]) { g.save(); g.translate(w * tx, h * ty); g.rotate(r); g.fillRect(-26, -9, 52, 18); g.restore(); } }, 384, 512); }
function stTexCard(l1, l2, bg = '#ffffff', fg = '#d8322a') { return tex((g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.lineWidth = 10; g.strokeStyle = fg; g.strokeRect(8, 8, w - 16, h - 16); inked(g, l1, w / 2, h * 0.4, h * 0.34, fg, { stroke: false, maxW: w * 0.86 }); inked(g, l2, w / 2, h * 0.76, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.86 }); }, 384, 256); }
function stTexExit() { return tex((g, w, h) => { g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, w, h); inked(g, 'EXIT', w / 2, h * 0.55, h * 0.62, '#e8201a', { stroke: false, font: 'Arial Black, Impact, sans-serif', maxW: w * 0.8 }); }, 256, 128); }


// ---- v4 garments: real hanging shapes (body with shoulders/waist/hem flare + drape folds, sleeves, collar, hanger), batched.
//  Local frame: x across the garment, y up (0 = hanger bar), z thickness. stGarment pushes [geo, colour] parts into P (fabric
//  parts get the atlas column via stUvCol) and hanger parts into H (hard batch). ry turns local z (the face normal) in the world.
function stSlab(prof, L, th, seed, nx = 6, ny = 10) { const g = new THREE.BoxGeometry(1, 1, 1, nx, ny, 1), P = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i), v = 0.5 - y, [wv, tv] = prof(v), X = x * wv, Y = -v * L;
    const fold = Math.sin(x * 9.4 + seed * 2.1) * 0.11 * th * (0.3 + v) + Math.sin(x * 4.1 + seed) * 0.08 * th;
    P.setXYZ(i, X, Y, z * th * tv + fold); uv.setXY(i, x + 0.5, 1 - v); }
  g.computeVertexNormals(); return g; }
function stGarment(P, H, kind, col, uvc, x, y, z, ry, seed = 1, sc = 1) {
  const place = (g) => stG(g.scale(sc, sc, sc), x, y, z, 0, ry, 0), F = (g, c = col) => P.push([stUvCol(place(g), uvc), c]);
  const sleeve = (sx, len, r0, r1, ang, y0, w0) => { const g = new THREE.CylinderGeometry(r1, r0, len, 7, 3); g.scale(1, 1, 0.55); g.translate(0, -len / 2, 0); g.rotateZ(sx * ang); g.translate(sx * w0, y0, 0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 0.1 + 0.15 * uv.getX(i)); F(g, t3Mul(col, 0.93)); };
  if (kind === 'shirt' || kind === 'jacket') { const J = kind === 'jacket', L = J ? 3.3 : 2.9, sw = J ? 2.3 : 2.05, th = J ? 0.55 : 0.34;
    F(stSlab((v) => [v < 0.1 ? 0.75 + (sw - 0.75) * (v / 0.1) : sw - 0.12 * Math.sin(Math.min(1, v) * 2.4) + (J ? 0.05 : 0), v < 0.06 ? 0.6 : 1], L, th, seed));
    sleeve(-1, J ? 2.6 : 1.5, J ? 0.36 : 0.32, J ? 0.3 : 0.26, 0.1, -0.28, sw / 2 - 0.1); sleeve(1, J ? 2.6 : 1.5, J ? 0.36 : 0.32, J ? 0.3 : 0.26, 0.1, -0.28, sw / 2 - 0.1);
    if (J) { for (const sx of [-1, 1]) P.push([place(stBx(0.5, 1.3, 0.06, sx * 0.35, -0.75, th / 2 + 0.02, 0, 0, sx * 0.28)), t3Mul(col, 0.72)]); P.push([place(stBx(0.08, L - 0.9, 0.04, 0, -0.45 - (L - 0.9) / 2, th / 2 + 0.02)), t3Mul(col, 0.6)]); }
    else { P.push([place(stBx(0.9, 0.22, th + 0.1, 0, -0.08, 0)), t3Mul(col, 1.1)]); for (let k = 0; k < 4; k++) P.push([place(stBx(0.09, 0.09, 0.04, 0, -0.45 - k * 0.55, th / 2 + 0.01)), '#f2efe6']); } }
  else if (kind === 'dress') { const L = 3.9, th = 0.36;
    F(stSlab((v) => [v < 0.08 ? 1.0 + 0.4 * v / 0.08 : v < 0.4 ? 1.4 - 0.35 * (v - 0.08) / 0.32 : 1.05 + 1.25 * ((v - 0.4) / 0.6) ** 1.3, v < 0.4 ? 0.9 : 1.15], L, th, seed, 7, 12));
    P.push([place(stBx(1.12, 0.16, th + 0.06, 0, -L * 0.4, 0)), t3Mul(col, 0.7)]); for (const sx of [-1, 1]) P.push([place(stBx(0.12, 0.4, 0.06, sx * 0.42, 0.05, 0)), col]); }
  else if (kind === 'pants') { const L = 3.7, th = 0.34;
    P.push([place(stBx(1.5, 0.3, th + 0.08, 0, -0.28, 0)), t3Mul(col, 0.8)]);
    for (const sx of [-1, 1]) { const g = stSlab((v) => [0.78 - 0.16 * v, 1], L - 0.4, th, seed + sx, 3, 9); g.translate(sx * 0.38, -0.42, 0); g.rotateZ(sx * 0.03); F(g); } }
  // hanger: hook + bar + shoulders (H batch)
  const hk = new THREE.TorusGeometry(0.17, 0.035, 5, 10, Math.PI * 1.3); hk.rotateZ(-0.2); hk.translate(0, 0.32, 0); H.push([place(hk), '#9aa0a8']); H.push([place(stCy(0.03, 0.03, 0.24, 0, 0.12, 0, 0, 0, 0, 5)), '#9aa0a8']);
  if (kind === 'pants') H.push([place(stBx(1.7, 0.1, 0.12, 0, -0.08, 0)), '#3a3a40'], [place(stBx(0.12, 0.2, 0.2, -0.6, -0.18, 0)), '#3a3a40'], [place(stBx(0.12, 0.2, 0.2, 0.6, -0.18, 0)), '#3a3a40']);
  else for (const sx of [-1, 1]) H.push([place(stBx(1.15, 0.12, 0.14, sx * 0.5, -0.17, 0, 0, 0, sx * -0.42)), '#6a4a2a']); }
const ST_KINDS = ['shirt', 'shirt', 'jacket', 'dress', 'pants', 'shirt', 'jacket', 'pants'];
// ---- v4 wedding gown: a bell skirt with deep folds, a back train and a hem ruffle, a fitted lathe bodice with a sweetheart top
function stGown(P, mx, mz, c, seed, back = -1) { const H = 6.4, BH = 2.15, y0 = 0.82, T = H + BH, g = new THREE.CylinderGeometry(1, 1, 1, 48, 30, false), Q = g.attributes.position;
  const bod = [[0, 0.6], [0.35, 0.66], [0.9, 0.64], [1.55, 0.78], [1.9, 0.84], [2.15, 0.62]], bodR = (h) => { for (let k = 1; k < bod.length; k++) if (h <= bod[k][0]) { const [h0, r0] = bod[k - 1], [h1, r1] = bod[k], f = (h - h0) / (h1 - h0); return r0 + (r1 - r0) * (f * f * (3 - 2 * f)); } return 0.62; };
  for (let i = 0; i < Q.count; i++) { const x = Q.getX(i), y = Q.getY(i), z = Q.getZ(i), rr = Math.hypot(x, z), a = Math.atan2(z, x), hh = (y + 0.5) * T;
    let r; if (hh < H) { const t = 1 - hh / H; r = 0.62 + 1.32 * Math.pow(t, 0.85) + 0.12 * Math.pow(t, 2) * Math.sin(a * 9 + seed) + 0.05 * t * Math.sin(a * 23 + seed * 3); const bk = Math.max(0, Math.cos(a - (back < 0 ? -Math.PI / 2 : Math.PI / 2))); r += 0.45 * Math.pow(t, 3) * bk * bk; }
    else r = bodR(hh - H);
    r *= rr > 0.999 ? 1 : rr;   // caps keep their centre
    Q.setXYZ(i, Math.cos(a) * r, y0 + hh, Math.sin(a) * r); }
  g.computeVertexNormals(); g.translate(mx, 0, mz); P.push([g, c]);
  const ru = new THREE.TorusGeometry(1.98, 0.15, 6, 48); ru.rotateX(Math.PI / 2); ru.translate(mx, y0 + 0.12, mz); P.push([ru, t3Mul(c, 0.95)]);
  P.push([stG(new THREE.TorusGeometry(0.64, 0.08, 6, 22), mx, y0 + H + 0.04, mz, Math.PI / 2), t3Mul(c, 0.9)]); }
// ---- v4 ski boot (toe toward +z): sole + heel, rounded lower shell with a toe cap, forward-leaning cuff with liner, 4 buckles, power strap
function stBoot(P, bx, by, bz, c, ry = 0) { const S = (geo, x, y, z, col, rx = 0, sx = 1, sy = 1, sz = 1) => { const [a, b] = [bx + (x * Math.cos(ry) + z * Math.sin(ry)), bz + (-x * Math.sin(ry) + z * Math.cos(ry))]; P.push([stG(geo, a, by + y, b, rx, ry, 0, sx, sy, sz), col]); };
  const dk = '#25262b', cf = t3Mul(c, 0.82);
  S(c3RBox(0.86, 0.16, 1.62, 0.07, 2), 0, 0.08, 0.2, dk); S(c3RBox(0.8, 0.12, 0.5, 0.05, 2), 0, 0.2, -0.38, dk);
  S(c3RBox(0.84, 0.66, 1.3, 0.26, 3), 0, 0.5, 0.18, c); S(new THREE.SphereGeometry(0.42, 12, 8, 0, TAU, 0, Math.PI / 2), 0, 0.2, 0.62, c, 0, 1, 1.05, 1.1);
  S(new THREE.CylinderGeometry(0.43, 0.47, 1.25, 14), 0, 1.3, -0.12, cf, 0.16, 1, 1, 1.12); S(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 12), 0.0, 1.95, -0.02, dk, 0.16);
  S(new THREE.CylinderGeometry(0.48, 0.48, 0.2, 14), 0, 1.78, -0.04, dk, 0.16, 1, 1, 1.12);
  for (let k = 0; k < 4; k++) { const y = 0.55 + k * 0.38, z = 0.55 - k * 0.22; S(new THREE.BoxGeometry(0.16, 0.08, 0.3), 0.44, y, z, '#d8dce2', -0.3); S(new THREE.BoxGeometry(0.05, 0.06, 0.34), 0.53, y + 0.03, z, '#9aa0a8', -0.3); } }
function stBuild() {
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(44, W / H, 0.1, 900), s = { scene, cam, p: {} };
  s.key = lights(scene, { amb: '#a8bcd8', ambI: 0.24, sky: '#b4c8e4', ground: '#c08a50',   // v6: a cooler, less violet fill (the shadows read mauve)
  key: '#ffcc8c', keyI: 2.5, keyP: [-14, 30, 46], rim: '#9ab0ff', rimI: 0.18, rimP: [40, 30, -30] });   // v4: the sun comes in through the front windows (raking, from +z)
  const WT = stTexWall(), cx = 0, cz = (ST_Z0 + ST_Z1) / 2, D = ST_Z1 - ST_Z0;
  // room shell: polished tile floor + red runner, yellow/green walls, teal ceiling
  ST.worn = stTexWorn(); ST.fab = stTexFabric(); const R2 = RNG('st-det');
  { const ft = stTexFloor(), fr = stTexFloorR(); for (const t of [ft, fr]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2 * ST_X / 14.4, D / 14.4); } const fm = c3Prop('#ffffff', { map: ft, rough: 1, env: 0.75 }); fm.roughnessMap = fr; scene.add(pl(2 * ST_X, D, fm, cx, 0, cz, 0, -Math.PI / 2)); }
  { const run = (vert, L) => { const R = RNG('strun' + vert); const t = tex((g, w, h) => { g.fillStyle = '#c4301c'; g.fillRect(0, 0, w, h); stSpeck(g, w, h, R, 4000, 2, '60,8,0', 0.1, 0.3); stSpeck(g, w, h, R, 1500, 2, '255,170,110', 0.06, 0.16);   // v5: an orange-leaning red (read magenta)
      for (let k = 0; k < 10; k++) { const x = R.r(0, w), y = R.r(0, h), gr = g.createRadialGradient(x, y, 4, x, y, R.r(30, 90)); gr.addColorStop(0, `rgba(60,30,20,${R.r(0.08, 0.2)})`); gr.addColorStop(1, 'rgba(60,30,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      g.fillStyle = '#7a1c10'; if (vert) { g.fillRect(0, 0, 18, h); g.fillRect(w - 18, 0, 18, h); g.fillStyle = '#e8b83a'; g.fillRect(22, 0, 5, h); g.fillRect(w - 27, 0, 5, h); } else { g.fillRect(0, 0, w, 18); g.fillRect(0, h - 18, w, 18); g.fillStyle = '#e8b83a'; g.fillRect(0, 22, w, 5); g.fillRect(0, h - 27, w, 5); } }, vert ? 256 : 1024, vert ? 1024 : 256); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(vert ? 1 : L / 24, vert ? L / 24 : 1); return c3Prop('#ffffff', { map: t, rough: 0.95, env: 0.3 }); };
    const r = pl(8, 40, run(true, 40), 0, 0.03, 78, 0, -Math.PI / 2); r.userData.noCast = true; scene.add(r); const r2 = pl(110, 6, run(false, 110), -8, 0.03, 56, 0, -Math.PI / 2); r2.userData.noCast = true; scene.add(r2); }
  scene.add(plNC(2 * ST_X, ST_H, stWallMat(WT, 0, 2 * ST_X, 0, ST_H), 0, ST_H / 2, ST_Z0));
  scene.add(plNC(D, ST_H, stWallMat(WT, 0, D, 0, ST_H), -ST_X, ST_H / 2, cz, Math.PI / 2)); scene.add(plNC(D, ST_H, stWallMat(WT, 0, D, 0, ST_H), ST_X, ST_H / 2, cz, -Math.PI / 2));
  for (const [x0, x1, y0, y1] of [[-75, -8, 0, ST_H], [-8, 8, 14, ST_H], [8, 16, 0, ST_H], [16, 64, 0, 2], [16, 64, 20, ST_H], [64, 75, 0, ST_H]]) { const m = pl(x1 - x0, y1 - y0, stWallMat(WT, x0, x1 - x0, y0, y1 - y0), (x0 + x1) / 2, (y0 + y1) / 2, ST_Z1, Math.PI); m.material.shadowSide = THREE.DoubleSide; scene.add(m); }   // v4: the front wall casts (sun patches only through doors/window)
  { const dm = c3Prop('#ffffff', { map: stTexDeck(), rough: 0.7, metal: 0.25 }); scene.add(plNC(2 * ST_X, D, dm, cx, ST_H, cz, 0, Math.PI / 2));
    const bm = c3Prop('#000000', { rough: 1 }); bm.colorWrite = false; bm.depthWrite = false; bm.side = THREE.DoubleSide; for (const [x, z] of [[-ST_X / 2, ST_Z0 + D / 4], [ST_X / 2, ST_Z0 + D / 4], [-ST_X / 2, ST_Z0 + 3 * D / 4], [ST_X / 2, ST_Z0 + 3 * D / 4]]) { const b = pl(ST_X + 0.2, D / 2 + 0.2, bm, x, ST_H + 0.6, z, 0, Math.PI / 2); b.userData.noInk2 = true; b.userData.stBlock = true; scene.add(b); } }   // v4: invisible roof that casts (no sun through the ceiling)
  // ceiling: beams, ducts, hanging light rows (one batch each)
  { const P = []; for (let z = ST_Z0 + 8; z < ST_Z1; z += 14) { P.push([stBx(2 * ST_X, 0.35, 0.9, 0, ST_H - 0.5, z), '#e2dccd'], [stBx(2 * ST_X, 0.35, 0.9, 0, ST_H - 3.1, z), '#e2dccd']);
      for (let i = 0, x = -ST_X + 0.8; x < ST_X; x += 1.6, i++) P.push([stBx(0.16, 3.05, 0.16, x, ST_H - 1.8, z, 0, 0, i % 2 ? 0.55 : -0.55), '#d0cabb']); }
    for (const x of [-44, -12, 22, 60]) { P.push([stCy(0.18, 0.18, D, x, ST_H - 4.2, cz, Math.PI / 2, 0, 0, 8), '#b8382e']); for (let z = ST_Z0 + 6; z < ST_Z1; z += 12) P.push([stCy(0.07, 0.07, 1.0, x, ST_H - 4.8, z, 0, 0, 0, 6), '#c8c4bc'], [stCy(0.28, 0.1, 0.14, x, ST_H - 5.35, z, 0, 0, 0, 8), '#d8d4cc']); }
    for (const x of [-70, -2, 70]) P.push([stCy(0.12, 0.12, D, x, ST_H - 2.4, cz, Math.PI / 2, 0, 0, 6), '#8a9098']);
    for (const x of [-34, 34]) for (let z = ST_Z0 + 19; z < ST_Z1; z += 18) P.push([stBx(1.2, 1.4, 1.2, x, ST_H - 8.2, z), '#c0c4c8'], [stBx(2.6, 0.35, 2.6, x, ST_H - 9.0, z), '#d8dade'], [stBx(1.8, 0.05, 1.8, x, ST_H - 9.2, z), '#3a3e44']);
    for (const x of [-56, -28, 0, 28, 56]) for (let z = ST_Z0 + 10; z < 96; z += 18) P.push([stBx(10.8, 0.7, 2.5, x, ST_H - 8.55, z), '#bfc2c4'], [stBx(0.2, 0.3, 1.9, x - 2.5, ST_H - 9.3, z), '#e0e2e4'], [stBx(0.2, 0.3, 1.9, x + 2.5, ST_H - 9.3, z), '#e0e2e4']); for (const x of [-50, -18, 18, 50]) P.push([stBx(1, 1.6, D, x, ST_H - 3.2, cz), '#d8d2c4']);
    for (const x of [-34, 34]) { P.push([stCy(1.6, 1.6, D, x, ST_H - 6, cz, Math.PI / 2, 0, 0, 16), '#c8ccd2']); for (let z = ST_Z0 + 4; z < ST_Z1; z += 10) P.push([stCy(1.75, 1.75, 0.5, x, ST_H - 6, z, Math.PI / 2, 0, 0, 16), '#a8acb4']); }
    const m = stMerge(P, { rough: 0.5, metal: 0.2, noCast: true, ao: false }); scene.add(m);
    const L = []; for (const x of [-56, -28, 0, 28, 56]) for (let z = ST_Z0 + 10; z < 96; z += 18) { L.push([stBx(10, 0.5, 1.8, x, ST_H - 9, z), '#ffffff']); L.push([stBx(0.12, 8.6, 0.12, x - 4, ST_H - 4.6, z), '#5a5a60']); L.push([stBx(0.12, 8.6, 0.12, x + 4, ST_H - 4.6, z), '#5a5a60']); }
    const lm = stMerge(L, { emissive: '#fff4d8', ei: 0.9, glow: '#fff4dc', noCast: true, ao: false }); scene.add(lm); }
  // outside: the blazing parking lot, cars, the TEMP 98°F sign (unlit, so it reads as hot sun)
  { c3SkyDome(scene, { r: 820, paint: true, zenith: '#78a6dc', mid: '#a8cbee', midH: 0.3, horizon: '#d0e0ea', glow: '#fff0d4', glowK: 0.3, ground: '#9aaa7a', sun: [-0.3, 0.55, 0.8], clouds: 40, seed: 5, cloudLit: '#ffffff', cloudShade: '#a4a8d6' });   // v5: same sky as the street
    const bd = c3Backdrop(scene, { origin: [0, 0, 0], dir: [0, 1], width: 150, near: 18, far: 290, rows: 4, horizon: '#d0e0ea', ground: '#6a7a46', cars: 9, seed: 7 });
    bd.scale.setScalar(2.4); bd.position.set(18, 0, ST_Z1 + 2);
    const fc = new Map(); bd.traverse((m) => { if (!m.isMesh) return; m.userData.noCast = true; m.userData.stOut = true; const mt = m.material; if (!mt || Array.isArray(mt)) return; if (!fc.has(mt)) { const c = mt.clone(); c.fog = false; if (c.color) c.color.multiplyScalar(0.5); c.envMapIntensity = 0.5; fc.set(mt, c); } m.material = fc.get(mt); });
    // sidewalk + curb right outside, the light poles, the bright (not white) hot concrete
    const swT = stTx((g, w, h) => { g.fillStyle = '#8e877a'; g.fillRect(0, 0, w, h); const Rs = RNG('stsw'); stSpeck(g, w, h, Rs, 3000, 2, '70,60,50', 0.06, 0.18); for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(60,50,40,0.35)'; g.fillRect(x, 0, 2, h); } g.fillStyle = '#e8c23a'; g.fillRect(0, h - 18, w, 10); }, 1024, 128);
    swT.wrapS = THREE.RepeatWrapping; swT.repeat.set(6, 1); const sw = pl(260, 9, c3Prop('#ffffff', { map: swT, rough: 0.9 }), 18, 0.02, ST_Z1 + 4.5, 0, -Math.PI / 2); sw.userData.noCast = true; sw.material = sw.material.clone(); sw.material.fog = false; scene.add(sw);
    const PO = []; for (const x of [-40, 6, 52, 98]) { PO.push([stCy(0.3, 0.36, 26, x, 13, 150, 0, 0, 0, 10), '#8a8a90'], [stBx(5, 0.7, 1.2, x + 2.2, 26, 150), '#7a7a80'], [stBx(1.6, 0.4, 1.0, x + 4.2, 25.6, 150), '#f6f2e0']); }
    const po = stMerge(PO, { rough: 0.5, metal: 0.4, noCast: true, ao: false }); po.material.fog = false; po.userData.stOut = true; scene.add(po);
    const tp = stMerge([[stCy(0.35, 0.35, 10, 30.5, 5, 116), '#c8c4bc'], [stBx(7.6, 5.4, 0.6, 30.5, 10.2, 116), '#1a1416']], { noCast: true }); tp.material.fog = false; scene.add(tp);
    s.temp = pl(7.2, 4.8, c3Flat('#ffffff', { map: stTexTemp(), glow: '#ff3a1a' }), 30.5, 10.2, 115.6, Math.PI); s.temp.material.fog = false; s.temp.userData.noCast = true; scene.add(s.temp); }
  // front: window glass + mullions, the sliding doors, sensor, mats, baskets by the door
  { const gm = c3Prop('#a8c8dc', { rough: 0.04, metal: 0.3, env: 2.2, transparent: true }); gm.opacity = 0.2; gm.depthWrite = false;
    const wg = pl(48, 18, gm, 40, 11, ST_Z1 - 0.05, Math.PI); wg.userData.noCast = true; wg.userData.noInk2 = true; scene.add(wg);
    const F = []; for (const x of [16, 28, 40, 52, 64]) F.push([stBx(0.8, 18.4, 0.8, x, 11, ST_Z1 - 0.3), '#2f6a4a']); F.push([stBx(48.8, 0.8, 1.4, 40, 2, ST_Z1 - 0.5), '#2f6a4a'], [stBx(48.8, 0.8, 0.8, 40, 20, ST_Z1 - 0.3), '#2f6a4a']);
    F.push([stBx(17.4, 1.2, 1.2, 0, 14.4, ST_Z1 - 0.4), '#2f6a4a'], [stBx(0.8, 14.4, 1.2, -8.4, 7.2, ST_Z1 - 0.4), '#2f6a4a'], [stBx(0.8, 14.4, 1.2, 8.4, 7.2, ST_Z1 - 0.4), '#2f6a4a'], [stBx(2.4, 0.8, 1, 0, 15.6, ST_Z1 - 0.8), '#3a3a40'], [stBx(0.5, 0.3, 0.3, 0, 15.2, ST_Z1 - 1.3), '#e8282a']);
    F.push([stBx(14, 0.08, 6, 0, 0.05, 96.5), '#3a3434']); for (let i = 0; i < 6; i++) { F.push([stBx(2.2, 0.9, 1.6, 12, 0.45 + i * 0.75, 95), '#e8282a']); } F.push([stBx(0.3, 1.6, 0.3, 11.2, 5.3, 95), '#c8282a'], [stBx(0.3, 1.6, 0.3, 12.8, 5.3, 95), '#c8282a']);
    scene.add(stMerge(F, { rough: 0.4 }));
    s.doors = [-1, 1].map((sd) => { const g = new THREE.Group(); const fr = stMerge([[stBx(8, 0.5, 0.4, 0, 13.6, 0), '#c8ccd2'], [stBx(8, 0.6, 0.4, 0, 0.3, 0), '#c8ccd2'], [stBx(0.5, 14, 0.4, -3.75, 7, 0), '#c8ccd2'], [stBx(0.5, 14, 0.4, 3.75, 7, 0), '#c8ccd2'], [stBx(0.3, 4, 0.5, -sd * 3.2, 6.5, 0), '#5a5a60']], { metal: 0.5, rough: 0.3 });
      const gl = pl(7.2, 13, gm, 0, 7, 0, Math.PI); gl.userData.noCast = true; gl.userData.noInk2 = true; g.add(fr, gl);
      g.add(stPlane(2.6, 1.0, tex((x, w, h) => { x.fillStyle = '#d8322a'; x.fillRect(0, 0, w, h); inked(x, 'AUTOMATIC DOOR', w / 2, h / 2, h * 0.4, '#ffffff', { stroke: false, maxW: w * 0.9 }); }, 512, 200), 0, 8.6, -0.25, Math.PI));
      g.position.set(sd * 4, 0, ST_Z1 - 0.9); scene.add(g); return g; }); }
  // hanging department signs (sub-text) + wall banners + the back-wall logo
  { const C = []; const sign = (big, sub, bg, x, y, z, w = 12, ry = 0) => { const m = stPlane(w, w * 0.375, stTexSign(big, sub, bg), x, y, z + 0.32 * Math.cos(ry), ry); scene.add(m); const b = stPlane(w, w * 0.375, stTexSign(big, sub, bg), x, y, z - 0.32 * Math.cos(ry), ry + Math.PI); scene.add(b);
      C.push([stBx(w + 0.4, w * 0.375 + 0.4, 0.5, x, y, z, ry), '#2a1208']); for (const sx of [-0.4, 0.4]) C.push([stBx(0.1, ST_H - y - w * 0.19, 0.1, x + sx * w * Math.cos(ry), (ST_H + y + w * 0.19) / 2, z - sx * w * Math.sin(ry)), '#3a3a40']); };
    sign("MEN'S", 'shirts · jackets · ties', '#2f6fd0', ST_ROW.shirts, 22, ST_ROW.z + 1, 11); sign('ELECTRONICS', 'cameras · phones · headphones', '#7a3ab8', (ST_ROW.cams + ST_ROW.phones) / 2, 25, ST_ROW.z + 1, 13);
    sign('BRIDAL', 'gowns · veils · rings', '#e85a8a', ST_ROW.bridal, 22, ST_ROW.z + 1, 10); sign('SPORTS', 'ski · golf · fishing', '#2f9a4a', ST_ROW.boots, 25, ST_ROW.z + 1, 11);
    sign("WOMEN'S", 'dresses · shoes · bags', '#d8322a', -52, 24, 16, 12); sign('BOOKS & TOYS', 'novels · games · sunglasses', '#ff8a1c', -8, 27, 12, 13); sign('LUGGAGE', 'suitcases · bags · trunks', '#c8282a', 51, 24, 36, 12);
    sign('SHOES', 'boots · sneakers · heels', '#2fa8a0', -16, 21, 64, 10); sign('JEWELRY', 'watches · rings · pearls', '#e8a020', 16, 23, 68, 10); sign('HOME', 'lamps · decor · kitchen', '#5a4ab8', 30, 27, 38, 10);
    sign('CHECKOUT', 'thank you for shopping!', '#d8322a', ST_REG[0], 19, ST_REG[1] - 1, 9);
    scene.add(stMerge(C, { noCast: true }));
    scene.add(stPlane(64, 12, stTexBanner('UNCLAIMED BAGGAGE', 'SCOTTSBORO, ALABAMA · EST. 1970', '#2f8a52'), 0, 31, ST_Z0 + 0.2));
    scene.add(stPlane(46, 8, stTexBanner('NEW ARRIVALS DAILY', 'everything here was once lost luggage', '#d8322a'), -ST_X + 0.2, 26, 30, Math.PI / 2));
    scene.add(stPlane(46, 8, stTexBanner('7,000 ITEMS A DAY', 'from bags nobody ever claimed', '#2f6fd0'), ST_X - 0.2, 26, 40, -Math.PI / 2));
    for (const [x, z, ry, k] of [[-ST_X + 0.25, 0, Math.PI / 2, 'shades'], [-ST_X + 0.25, 62, Math.PI / 2, 'goods'], [ST_X - 0.25, 10, -Math.PI / 2, 'goods'], [ST_X - 0.25, 66, -Math.PI / 2, 'toys'], [-38, ST_Z0 + 0.25, 0, 'books'], [38, ST_Z0 + 0.25, 0, 'goods']]) {
      const t = stTexGoods(x + z, k); t.repeat.set(3, 1); scene.add(stPlane(36, 9, t, x, 6.2, z, ry, 0, { lit: true })); }
    { const c = c3Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.4, 28), [c3Prop('#d8322a'), c3Flat('#ffffff', { map: texClock() }), c3Prop('#d8322a')], 0.02); c.rotation.x = Math.PI / 2; c.position.set(40, 30, ST_Z0 + 0.3); scene.add(c); } }
  // ---- furniture (layer swapped per shot: FOCUS in the wides so people between racks occlude right)
  const furn = new THREE.Group(); scene.add(furn); s.furn = furn;
  const R = RNG('st-furn');
  // clothing rails: [x0, z0, length, along ('x'|'z'), hue0, hue span]
  const GP = [];
  const GH = [];
  const rail = (P, x, z, len, al, h0, hs, n, o = {}) => { const ax = al === 'x', ex = (k) => ax ? [x + k, z] : [x, z + k];
    for (const k of [-len / 2, len / 2]) { const [a, b] = ex(k); P.push([stCy(0.14, 0.14, 7.4, a, 3.7, b, 0, 0, 0, 8), '#c8ccd2'], [stBx(ax ? 0.4 : 2.6, 0.3, ax ? 2.6 : 0.4, a, 0.15, b), '#8a8e96']); }
    P.push([stCy(0.12, 0.12, len, x, 7.4, z, ax ? 0 : Math.PI / 2, 0, ax ? Math.PI / 2 : 0, 8), '#d8dce2']);
    for (let i = 0; i < n; i++) { const k = -len / 2 + 0.6 + i * (len - 1.2) / (n - 1), [a, b] = ex(k), c = stHsl(h0 + hs * i / n, 72, 54), hh = 3.6 + R.r(-0.3, 0.5);
      const kd = o.kind || ST_KINDS[(i * 3 + Math.floor(h0 / 11)) % ST_KINDS.length]; stGarment(GP, GH, kd, stHsl(h0 + hs * i / n + R2.r(-8, 8), 48 + R2.r(-14, 8), 46 + R2.r(-12, 8)), (i * 5 + Math.floor(h0 / 7)) % 4, a, 7.25, b, ax ? Math.PI / 2 : 0, i + h0, 0.92 + hh * 0.02); } };
  { const P = []; rail(P, -64, 22, 22, 'z', 300, 80, 34); rail(P, -52, 24, 22, 'z', 180, 120, 34); rail(P, -40, 18, 18, 'z', 0, 60, 28); rail(P, -64, -6, 14, 'x', 200, 60, 22); rail(P, -46, -4, 14, 'x', 30, 50, 22);
    rail(P, 22, 6, 16, 'z', 90, 90, 24); rail(P, 32, 16, 14, 'x', 220, 80, 22);
    for (const [x, z] of [[-58, 40], [-34, 2]]) { P.push([stCy(0.2, 0.2, 7.2, x, 3.6, z, 0, 0, 0, 8), '#c8ccd2'], [stCy(1.4, 1.4, 0.3, x, 0.15, z, 0, 0, 0, 16), '#8a8e96']); P.push([stG(new THREE.TorusGeometry(2.6, 0.1, 6, 24), x, 7.1, z, Math.PI / 2), '#d8dce2']); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; stGarment(GP, GH, i % 3 ? 'dress' : 'shirt', stHsl(i * 22, 46, 48 + R2.r(-8, 6)), i % 4, x + Math.cos(a) * 2.6, 6.95, z + Math.sin(a) * 2.6, Math.PI / 2 - a, i, 0.85); } }
    furn.add(stMerge(P, { rough: 0.7 , map: ST.worn })); }
  // gondola shelving (books / toys / sunglasses), the ski rack and the wall of skis
  { const P = []; for (const [x, z0, z1] of [[-22, 0, 34], [-8, 0, 34], [6, 0, 34]]) { P.push([stBx(2.8, 13, z1 - z0, x, 6.5, (z0 + z1) / 2), '#e8e2d8'], [stBx(3.2, 1.2, z1 - z0 + 0.4, x, 13.6, (z0 + z1) / 2), '#d8322a']);
      for (let k = 0; k < 5; k++) P.push([stBx(4.2, 0.25, z1 - z0, x, 1 + k * 2.9, (z0 + z1) / 2), '#cfc8ba']); }
    for (let i = 0; i < 14; i++) P.push([stBx(0.5, 9 + R.r(-1, 1), 0.2, 28 + i * 0.9, 5, 26), stHsl(i * 40, 80, 52)]); P.push([stBx(14, 0.5, 1.2, 34, 8.2, 26.4), '#8a5a2c'], [stBx(14, 0.5, 1.2, 34, 2.2, 26.4), '#8a5a2c']);
    furn.add(stMerge(P, { rough: 0.6 , map: ST.worn }));
    for (const [x, z0, z1, k] of [[-22, 0, 34, 'books'], [-8, 0, 34, 'toys'], [6, 0, 34, 'shades']]) for (const sd of [-1, 1]) { const t = stTexGoods(x * 3 + sd, k); t.repeat.set((z1 - z0) / 9, 1); furn.add(stPlane(z1 - z0, 12.4, t, x + sd * 2.12, 6.5, (z0 + z1) / 2, sd * Math.PI / 2, 0, { lit: true })); } }
  // ---- the s13 row (z 46): shirts rack, electronics glass case, headphones wall, bridal, ski boots
  const zr = ST_ROW.z;
  { const P = []; rail(P, ST_ROW.shirts, zr, 10, 'x', 0, 300, 26); P.push([stBx(10, 7.6, 0.4, ST_ROW.shirts, 9.6, zr - 2.2), '#2f6fd0']); furn.add(stMerge(P, { rough: 0.7 , map: ST.worn }));
    { const Q = [], Hh = []; [['shirt', '#c8402e', -3.1], ['jacket', '#c89a3a', 0], ['shirt', '#2f6fb8', 3.1]].forEach(([k, c, dx], i) => { stGarment(Q, Hh, k, c, i === 1 ? 3 : i, ST_ROW.shirts + dx, 12.6, zr - 1.55, 0, i + 3, 0.95); Hh.push([stCy(0.06, 0.06, 0.5, ST_ROW.shirts + dx, 13.0, zr - 1.8, Math.PI / 2, 0, 0, 6), '#c8ccd2']); });
      furn.add(stMerge(Q, { rough: 0.88, map: ST.fab })); furn.add(stMerge(Hh, { rough: 0.4, metal: 0.3, ao: false })); } }
  { const x = ST_ROW.cams, P = [[stBx(10, 3.2, 3.4, x, 1.6, zr), '#c8282a'], [stBx(10.3, 0.3, 3.7, x, 3.3, zr), '#f2ece0'], [stBx(10.3, 0.3, 3.7, x, 6.3, zr), '#d8dce2'], [stBx(9.6, 0.2, 3, x, 4.6, zr), '#f6f2ea']];
    for (const sx of [-5, 5]) for (const sz of [-1.7, 1.7]) P.push([stBx(0.2, 3, 0.2, x + sx, 4.8, zr + sz), '#d8dce2']);
    for (let i = 0; i < 5; i++) { const cx0 = x - 3.8 + i * 1.9, c = ['#2a2a30', '#d8dce2', '#e8402e', '#2a2a30', '#f2c23a'][i]; P.push([stBx(1.3, 0.85, 0.7, cx0, 3.9, zr + 0.6), c], [stCy(0.32, 0.32, 0.5, cx0, 3.9, zr + 1.1, Math.PI / 2, 0, 0, 14), '#3a3a40'], [stCy(0.22, 0.22, 0.06, cx0, 3.9, zr + 1.37, Math.PI / 2, 0, 0, 14), '#6ab0e0']); }
    for (let i = 0; i < 6; i++) P.push([stBx(0.55, 1.05, 0.08, x - 3.6 + i * 1.45, 5.3, zr + 0.4, 0, -0.35), i % 2 ? '#2a2a34' : '#e8eef6'], [stBx(0.44, 0.82, 0.02, x - 3.6 + i * 1.45, 5.32, zr + 0.45, 0, -0.35), ['#7ad0ff', '#ff8ab0', '#8aff9a'][i % 3]]);
    P.push([stBx(1.6, 1.1, 0.9, x - 2, 6.95, zr), '#2a2a30'], [stCy(0.45, 0.45, 0.8, x - 2, 6.95, zr + 0.8, Math.PI / 2, 0, 0, 16), '#3a3a40'], [stBx(1.1, 0.8, 0.5, x + 2.2, 6.85, zr), '#e8eef6']);
    furn.add(stMerge(P, { rough: 0.35, env: 1.2 , map: ST.worn }));
    const gm = c3Prop('#dff4ff', { rough: 0.05, env: 1.6, transparent: true }); gm.opacity = 0.16; gm.depthWrite = false; const gl = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 3.4), gm); gl.position.set(x, 4.8, zr); gl.userData.noCast = true; gl.userData.noInk2 = true; furn.add(gl);
    furn.add(stPlane(2.2, 1.1, stTexTag('$89'), x + 3.6, 3.75, zr + 1.75, 0, 0, { tr: true })); }
  { const x = ST_ROW.phones, P = [[stBx(10, 0.6, 1.2, x, 0.3, zr - 1), '#2a1208']];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const hx = x - 3.6 + i * 2.4, hy = 3.4 + r * 2.6, c = stHsl(i * 70 + r * 130, 75, 50), hz = zr - 1.1;
      P.push([stCy(0.06, 0.06, 0.8, hx, hy + 0.9, hz + 0.4, Math.PI / 2, 0, 0, 6), '#c8ccd2']);
      P.push([stG(new THREE.TorusGeometry(0.7, 0.12, 6, 18, Math.PI), hx, hy, hz + 0.5), c], [stCy(0.36, 0.36, 0.34, hx - 0.72, hy - 0.1, hz + 0.5, 0, 0, Math.PI / 2, 14), c], [stCy(0.36, 0.36, 0.34, hx + 0.72, hy - 0.1, hz + 0.5, 0, 0, Math.PI / 2, 14), c], [stCy(0.3, 0.3, 0.1, hx - 0.92, hy - 0.1, hz + 0.5, 0, 0, Math.PI / 2, 14), '#2a2a30'], [stCy(0.3, 0.3, 0.1, hx + 0.92, hy - 0.1, hz + 0.5, 0, 0, Math.PI / 2, 14), '#2a2a30']); }
    furn.add(stMerge(P, { rough: 0.35 , map: ST.worn })); furn.add(stPlane(10, 10, stTexPeg(), x, 5.6, zr - 1.62, 0, 0, { lit: true }));
    furn.add(stPlane(2.2, 1.1, stTexTag('$25'), x + 4.0, 2.2, zr - 1.5, 0, 0, { tr: true })); }
  { const x = ST_ROW.bridal, P = [[stCy(5.2, 5.4, 0.7, x, 0.35, zr, 0, 0, 0, 28), '#f2a0b8'], [stCy(5.5, 5.5, 0.12, x, 0.76, zr, 0, 0, 0, 28), '#e8c060']];
    [[-3.7, '#fbf6f0'], [0, '#f6ead6'], [3.7, '#fbe2e6']].forEach(([dx, c], i) => { const mx = x + dx, mz = zr + (i === 1 ? -1.0 : 0.4);
      stGown(P, mx, mz, c, i * 1.7); P.push([stG(new THREE.SphereGeometry(0.95, 14, 10), mx, 9.4, mz, 0, 0, 0, 1.15, 0.5, 0.8), '#e8e0d4'],
        [stCy(0.22, 0.26, 0.9, mx, 10.0, mz, 0, 0, 0, 10), '#e8e0d4'], [stG(new THREE.SphereGeometry(0.62, 14, 10), mx, 10.9, mz, 0, 0, 0, 0.9, 1.1, 0.9), '#f0e8dc'], [stG(new THREE.TorusGeometry(0.62, 0.1, 6, 16), mx, 11.4, mz, Math.PI / 2), '#e8c060']);
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; P.push([stG(new THREE.SphereGeometry(0.22, 8, 6), mx + Math.cos(a) * 0.8, 7.4, mz + Math.sin(a) * 0.55 + 0.1), '#ffffff']); } });
    P.push([stBx(14, 9.6, 0.4, x, 4.8, zr - 3.4), '#f6c8d6'], [stBx(14.6, 0.6, 0.6, x, 9.7, zr - 3.3), '#e8c060']); for (let i = 0; i < 9; i++) P.push([stG(new THREE.SphereGeometry(0.5, 8, 6), x - 6.4 + i * 1.6, 9.0, zr - 3.0), i % 2 ? '#e85a8a' : '#ffffff']);
    furn.add(stMerge(P, { rough: 0.6 , map: ST.worn }));
    const vm = c3Prop('#ffffff', { rough: 0.9, transparent: true }); vm.opacity = 0.45; vm.depthWrite = false; vm.side = THREE.DoubleSide; const v = c3Mesh(new THREE.ConeGeometry(1.5, 4.6, 16, 1, true), vm, 0); v.position.set(x, 9.4, zr - 1.4); v.userData.noCast = true; v.userData.noInk2 = true; furn.add(v);
    furn.add(stPlane(2.2, 1.1, stTexTag('$150'), x + 5.8, 1.6, zr + 2.4, -0.3, 0, { tr: true })); }
  { const x = ST_ROW.boots, P = []; for (let k = 0; k < 4; k++) P.push([stBx(11, 0.4, 2, x, 0.8 + k * 2.4, zr - 1.6 + k * -0.4 + 1.2), '#8a5a2c']); P.push([stBx(0.5, 10.4, 3, x - 5.6, 5.2, zr - 1), '#6a3a1e'], [stBx(0.5, 10.4, 3, x + 5.6, 5.2, zr - 1), '#6a3a1e'], [stBx(11.6, 10.4, 0.3, x, 5.2, zr - 2.6), '#2f9a4a']);
    const BC = ['#e8402e', '#f2c23a', '#9ae83a', '#2fc8e8', '#e83ab8', '#ff8a1c', '#f6f2ea', '#2a2a34', '#3a6ae8'];
    for (let k = 0; k < 4; k++) for (let i = 0; i < 5; i++) for (const sd of [-0.5, 0.5]) { const bx = x - 4.2 + i * 2.1 + sd * 0.95, by = 1.0 + k * 2.4, bz = zr - 0.6 - k * 0.4 + 0.4, c = BC[(i * 3 + k * 2) % BC.length];
      stBoot(P, bx, by, bz, c, sd < 0 ? 0.06 : -0.06); }
    furn.add(stMerge(P, { rough: 0.35 , map: ST.worn })); furn.add(stPlane(2.2, 1.1, stTexTag('$40'), x + 4.6, 10.8, zr - 0.8, 0, 0, { tr: true })); }
  // try-on bench by the window, a boot display, a sunglasses spinner, potted plants, a bin
  { const P = [[stBx(12, 0.6, 2.6, ST_SKI[0], 2.4, ST_SKI[1] + 0.4), '#d8322a'], [stBx(12.4, 0.3, 2.8, ST_SKI[0], 2.75, ST_SKI[1] + 0.4), '#f2c23a']];
    for (const sx of [-5.4, 5.4]) P.push([stBx(0.5, 2.2, 2.2, ST_SKI[0] + sx, 1.1, ST_SKI[1] + 0.4), '#3a3a40']);
    for (let i = 0; i < 4; i++) { const bx = 29 + i * 1.3, c = ['#e8402e', '#2fc8e8', '#f2c23a', '#9ae83a'][i]; stBoot(P, bx, 0, 91.2, c, 0.1 * (i - 1.5)); }
    P.push([stCy(0.15, 0.15, 7, 58, 3.5, 88, 0, 0, 0, 8), '#c8ccd2'], [stCy(1.2, 1.2, 0.3, 58, 0.15, 88, 0, 0, 0, 16), '#8a8e96']); for (let k = 0; k < 4; k++) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; P.push([stBx(0.9, 0.35, 0.1, 58 + Math.cos(a) * 1.1, 2.6 + k * 1.2, 88 + Math.sin(a) * 1.1, -a + Math.PI / 2), stHsl(i * 60 + k * 20, 80, 45)]); }
    for (const [x, z] of [[-12, 96], [14, 96], [-70, 95], [70, 95]]) { P.push([stCy(1.6, 1.2, 2.6, x, 1.3, z, 0, 0, 0, 14), '#c8682a']); for (let i = 0; i < 9; i++) { const a = i * 2.4; P.push([stG(new THREE.SphereGeometry(1.1, 8, 6), x + Math.sin(a) * 1.1, 4.2 + (i % 3) * 0.8, z + Math.cos(a) * 1.1, 0.5 * Math.cos(a), a, -0.5 * Math.sin(a), 0.45, 1.8, 0.16), i % 2 ? '#4f9a44' : '#3f8a3a']); } }
    P.push([stCy(0.9, 0.8, 2.6, 66, 1.3, 70, 0, 0, 0, 12), '#2f6a4a']);
    furn.add(stMerge(P, { rough: 0.5 , map: ST.worn })); }
  // front half: round racks, folded-shirt tables, casual mannequins, golf bags (keeps the shot lanes clear)
  { const P = []; const round = (x, z, h0) => { P.push([stCy(0.2, 0.2, 7.2, x, 3.6, z, 0, 0, 0, 8), '#c8ccd2'], [stCy(1.4, 1.4, 0.3, x, 0.15, z, 0, 0, 0, 16), '#8a8e96'], [stG(new THREE.TorusGeometry(2.6, 0.1, 6, 24), x, 7.1, z, Math.PI / 2), '#d8dce2']);
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; stGarment(GP, GH, ST_KINDS[(i + Math.floor(h0 / 9)) % ST_KINDS.length], stHsl(h0 + i * 9 + R2.r(-6, 6), 48 + R2.r(-12, 6), 48 + R2.r(-9, 6)), (i + Math.floor(h0 / 9)) % 4, x + Math.cos(a) * 2.6, 6.95, z + Math.sin(a) * 2.6, Math.PI / 2 - a, i + h0, 0.85); } };
    for (const [x, z, h] of [[-62, 72, 330], [-50, 86, 200], [-64, 90, 20], [-68, 62, 260], [24, 74, 100], [58, 72, 180], [30, 62, 40], [64, 86, 280]]) round(x, z, h);
    const table = (x, z, ry) => { P.push([stBx(7, 0.4, 4, x, 3.2, z, ry), '#8a5a2c'], [stBx(6.4, 3, 3.4, x, 1.5, z, ry), '#6a3e1e']);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const lx = -2.4 + i * 1.6, lz = -0.8 + j * 1.6, n = 3 + ((i + j) % 3); for (let k = 0; k < n; k++) P.push([stBx(1.4, 0.32, 1.3, x + lx * Math.cos(ry) + lz * Math.sin(ry), 3.56 + k * 0.33, z - lx * Math.sin(ry) + lz * Math.cos(ry), ry), stHsl(i * 85 + j * 40 + k * 14, 65, 55)]); } };
    table(-14, 88, 0.2); table(52, 80, 0); table(26, 92, -0.3); table(-9, 78, 0); table(9, 76, 0.1);
    for (let k = 0; k < 4; k++) for (let i = 0; i < 4 - k; i++) { const c = ['#e8402e', '#2f9a4a', '#f2c23a', '#8a4ab8', '#2fc8e8', '#ff8a1c', '#f27aa8', '#2a2a34', '#3a6ae8', '#e8e2d8'][(k * 4 + i) % 10]; P.push([stBx(3.2, 2.2, 1.4, 5 + i * 3.4 + k * 1.7, 1.1 + k * 2.3, 86), c], [stBx(1.1, 0.24, 0.3, 5 + i * 3.4 + k * 1.7, 2.35 + k * 2.3, 86.6), '#2a2224']); }
    P.push([stBx(0.2, 9, 0.2, 19.5, 4.5, 86), '#3a3a40'], [stBx(6, 2.6, 0.3, 19.5, 9.6, 86), '#2a1208']);
    for (const [x, z, c1, c2] of [[18, 68, '#2f8ae0', '#f2c23a'], [22, 66, '#e8402e', '#2a2a34']]) P.push([stCy(1.2, 1.2, 0.3, x, 0.15, z, 0, 0, 0, 16), '#2a2a30'], [stCy(0.12, 0.12, 4.4, x, 2.4, z, 0, 0, 0, 8), '#c8ccd2'], [stCy(0.9, 0.8, 1.8, x, 5.2, z, 0, 0, 0, 14), c2], [stCy(1.0, 0.9, 2.6, x, 7.4, z, 0, 0, 0, 14), c1], [stG(new THREE.SphereGeometry(0.6, 12, 8), x, 9.4, z, 0, 0, 0, 0.9, 1.1, 0.9), '#e8e0d4']);
    for (let i = 0; i < 5; i++) P.push([stCy(0.6, 0.6, 4.4, 66 + i * 1.5, 2.2, 56, 0, 0, 0.08 * (i - 2), 12), ['#2a2a34', '#e8402e', '#f6f2ea', '#2f9a4a', '#2f6fd0'][i]], [stCy(0.15, 0.15, 1.6, 66 + i * 1.5, 5.0, 56, 0, 0, 0.08 * (i - 2), 6), '#c8ccd2']);
    furn.add(stMerge(P, { rough: 0.6 , map: ST.worn })); }
  furn.add(stPlane(5.6, 2.3, tex((g, w, h) => { g.fillStyle = '#f2c23a'; g.fillRect(0, 0, w, h); inked(g, "TODAY'S FINDS", w / 2, h * 0.4, h * 0.34, '#d8322a', { stroke: '#2a1208', sw: 8, maxW: w * 0.9 }); inked(g, 'fresh from lost bags', w / 2, h * 0.78, h * 0.17, '#2a1208', { stroke: false, maxW: w * 0.9 }); }, 512, 210), 19.5, 9.6, 86.17));
  // ---- v3 detail: fabric batch, carts, back station, dump bin, price toppers, aisle markers, wall dressing
  furn.add(stMerge(GP, { rough: 0.88, map: ST.fab })); furn.add(stMerge(GH, { rough: 0.4, metal: 0.3, ao: false }));
  const stRot = (x, z, ry, lx, lz) => [x + lx * Math.cos(ry) + lz * Math.sin(ry), z - lx * Math.sin(ry) + lz * Math.cos(ry)];
  const cart = (P, x, z, ry) => { const B = (w, h, d, lx, y, lz, c, rx = 0, rz = 0) => { const [a, b] = stRot(x, z, ry, lx, lz); P.push([stBx(w, h, d, a, y, b, ry, rx, rz), c]); };
    const ch = '#b8bec6'; B(3.8, 0.08, 2.3, 0, 3.0, 0, ch); B(3.8, 0.12, 0.08, 0, 5.4, 1.15, ch); B(3.8, 0.12, 0.08, 0, 5.4, -1.15, ch); B(0.08, 0.12, 2.3, 1.9, 5.4, 0, ch); B(0.08, 0.12, 2.3, -1.9, 5.4, 0, ch);
    for (let i = 0; i <= 12; i++) { const lx = -1.9 + i * 3.8 / 12; B(0.05, 2.4, 0.05, lx, 4.2, 1.15, ch); B(0.05, 2.4, 0.05, lx, 4.2, -1.15, ch); }
    for (let i = 0; i <= 7; i++) { const lz = -1.15 + i * 2.3 / 7; B(0.05, 2.4, 0.05, 1.9, 4.2, lz, ch); B(0.05, 2.4, 0.05, -1.9, 4.2, lz, ch); }
    for (const y of [3.8, 4.6]) { B(3.8, 0.05, 0.05, 0, y, 1.15, ch); B(3.8, 0.05, 0.05, 0, y, -1.15, ch); B(0.05, 0.05, 2.3, 1.9, y, 0, ch); B(0.05, 0.05, 2.3, -1.9, y, 0, ch); }
    B(0.12, 1.4, 0.12, -2.3, 5.9, 1.0, ch, 0, 0.35); B(0.12, 1.4, 0.12, -2.3, 5.9, -1.0, ch, 0, 0.35); B(0.32, 0.32, 2.4, -2.55, 6.5, 0, '#d8282a'); B(0.5, 0.6, 0.06, -1.6, 5.9, 0, '#e8402e');
    for (const [lx, lz] of [[-1.6, 1], [-1.6, -1], [1.6, 1], [1.6, -1]]) { B(0.12, 2.6, 0.12, lx, 1.6, lz, ch); const [a, b] = stRot(x, z, ry, lx, lz); P.push([stCy(0.32, 0.32, 0.22, a, 0.34, b, 0, ry, Math.PI / 2, 12), '#2a2a2e']); }
    B(3.6, 0.08, 2.1, 0, 0.9, 0, ch); };
  { const P = []; cart(P, -18, 70.5, 0.35); cart(P, -15.6, 93.2, 1.57); cart(P, -15.6, 91.0, 1.57);
    for (const [lx, w, h, d, c] of [[0.6, 1.6, 1.2, 1.2, '#b8865a'], [-0.8, 1.2, 1.8, 0.4, '#2f6fd0'], [0.9, 0.9, 0.5, 0.9, '#f2ece0']]) { const [a, b] = stRot(-18, 70.5, 0.35, lx, 0.1); P.push([stBx(w, h, d, a, 3.05 + h / 2, b, 0.35), c]); }
    // back wrap station behind the cashier: cabinet, counter top, bag rolls, hanger box, binder, radio, trash bin, boxes
    P.push([stBx(10, 4, 2.2, -32, 2, 68.3), '#7a4a26'], [stBx(10.4, 0.3, 2.5, -32, 4.15, 68.3), '#d8d0c0'], [stBx(9.6, 0.08, 0.06, -32, 2.9, 69.42), '#3a2410'], [stBx(9.6, 0.08, 0.06, -32, 1.2, 69.42), '#3a2410']);
    for (const x of [-35.5, -32, -28.5]) P.push([stBx(0.6, 0.12, 0.1, x, 3.4, 69.45), '#c8ccd2']);
    P.push([stCy(0.5, 0.5, 2.6, -35.4, 4.8, 68.2, 0, 0, Math.PI / 2, 14), '#e8eef2'], [stCy(0.12, 0.12, 2.8, -35.4, 4.8, 68.2, 0, 0, Math.PI / 2, 8), '#5a5a60']);
    P.push([stBx(2.2, 1.3, 1.6, -32.6, 4.95, 68.1), '#b8865a'], [stBx(2.22, 0.14, 1.62, -32.6, 5.5, 68.1), '#d8b880']); for (let i = 0; i < 6; i++) P.push([stBx(1.8, 0.06, 0.06, -32.6, 5.75 + i * 0.05, 67.7 + i * 0.14, 0, 0, 0.2 * (i % 2 ? 1 : -1)), '#2a2a2e']);
    P.push([stBx(0.5, 1.8, 1.4, -30.2, 5.2, 68.0, 0.12), '#2f6fd0'], [stBx(0.5, 1.7, 1.4, -29.6, 5.15, 68.0, -0.05), '#d8322a'], [stBx(1.6, 0.9, 0.7, -28.0, 4.75, 68.3), '#3a3a40'], [stCy(0.25, 0.25, 0.06, -28.4, 4.75, 68.67, Math.PI / 2, 0, 0, 12), '#8a8e96']);
    P.push([stCy(0.95, 0.8, 2.6, -38.6, 1.3, 69.5, 0, 0, 0, 16), '#3a3c40'], [stCy(1.0, 1.0, 0.15, -38.6, 2.62, 69.5, 0, 0, 0, 16), '#2a2c30']);
    P.push([stBx(2.6, 2.0, 2.0, -25.6, 1.0, 68.2, 0.1), '#b8865a'], [stBx(2.62, 0.2, 2.02, -25.6, 1.95, 68.2, 0.1), '#d8b880'], [stBx(2.0, 1.6, 1.6, -25.4, 2.8, 68.3, -0.15), '#a87a4e']);
    // dump bin of plush + its $1 card, end of the toys aisle
    P.push([stCy(1.5, 1.4, 2.6, -15, 1.3, 38.5, 0, 0, 0, 18), '#c8ccd2'], [stCy(1.55, 1.55, 0.12, -15, 2.6, 38.5, 0, 0, 0, 18), '#9aa0a8']); for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.3 + (i % 4) * 0.3; P.push([stG(new THREE.SphereGeometry(0.42, 10, 8), -15 + Math.cos(a) * r, 2.6 + (i % 3) * 0.18, 38.5 + Math.sin(a) * r), stHsl(i * 53, 65, 58)]); }
    P.push([stCy(0.06, 0.06, 3.4, -15, 4.1, 38.5, 0, 0, 0, 6), '#c8ccd2']);
    // price-topper holders on the round racks, wires for the aisle markers
    for (const [x, z] of [[-62, 72], [24, 74], [30, 62], [58, 72]]) P.push([stCy(0.07, 0.07, 1.8, x, 8.0, z, 0, 0, 0, 6), '#c8ccd2'], [stBx(2.7, 0.1, 0.12, x, 8.9, z), '#c8ccd2']);
    for (const x of [-22, -8, 6]) for (const sx of [-1.8, 1.8]) P.push([stBx(0.06, ST_H - 23.4, 0.06, x + sx, (ST_H + 23.4) / 2, 35.2), '#3a3a40']);
    furn.add(stMerge(P, { rough: 0.45, metal: 0.25, map: ST.worn }));
    furn.add(stPlane(1.9, 1.3, stTexCard('$1', 'each · plush'), -15, 6.2, 38.52, 0, 0, { lit: true }));
    [[-62, 72, 0.6, 'TEES $4.99', 'every colour'], [24, 74, -0.4, 'JACKETS $12', 'like new'], [30, 62, -0.2, 'JEANS $9.99', 'all sizes'], [58, 72, -0.6, 'DRESSES $15', 'from lost bags']].forEach(([x, z, ry, a, b]) => { const t = stTexCard(a, b); furn.add(stPlane(2.6, 1.6, t, x + 0.03 * Math.sin(ry), 9.75, z + 0.03 * Math.cos(ry), ry, 0, { lit: true })); furn.add(stPlane(2.6, 1.6, t, x - 0.03 * Math.sin(ry), 9.75, z - 0.03 * Math.cos(ry), ry + Math.PI, 0, { lit: true })); });
    [[-22, 'AISLE 1', 'novels · cookbooks · comics'], [-8, 'AISLE 2', 'toys · games · puzzles'], [6, 'AISLE 3', 'sunglasses · hats · watches']].forEach(([x, a, b]) => { const t = stTexSign(a, b, '#2a3a4a', '#ffffff', '#f2c23a'); furn.add(stPlane(4.4, 1.65, t, x, 22.6, 35.25, 0)); furn.add(stPlane(4.4, 1.65, t, x, 22.6, 35.15, Math.PI)); }); }
  // walls: 3D chair rail + rubber base, EXIT signs, extinguisher, outlets, conduit, taped posters
  { const P = [], run = (x0, z0, x1, z1, rail = true) => { const L = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0), nx = (z1 - z0) / L, nz = -(x1 - x0) / L, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
      P.push([stBx(L, 0.7, 0.2, mx + nx * 0.1, 0.35, mz + nz * 0.1, ry), '#22261f']); if (rail) P.push([stBx(L, 0.6, 0.32, mx + nx * 0.16, 7.42, mz + nz * 0.16, ry), '#c42e28'], [stBx(L, 0.12, 0.4, mx + nx * 0.2, 7.76, mz + nz * 0.2, ry), '#e0453a']); };
    run(-ST_X, ST_Z0, ST_X, ST_Z0); run(ST_X, ST_Z0, ST_X, ST_Z1); run(-ST_X, ST_Z1, -ST_X, ST_Z0); run(-8, ST_Z1, -ST_X, ST_Z1); run(16, ST_Z1, 8, ST_Z1); run(ST_X, ST_Z1, 64, ST_Z1); run(64, ST_Z1, 16, ST_Z1, false);
    P.push([stBx(3.4, 1.5, 0.5, -12, 17.6, ST_Z1 - 0.3), '#e8e4dc'], [stBx(0.2, 1.2, 0.2, -12, 19.0, ST_Z1 - 0.2), '#9aa0a8']);
    P.push([stBx(0.5, 1.5, 3.4, -ST_X + 0.3, 17.6, 84), '#e8e4dc'], [stBx(3.4, 1.5, 0.5, 30, 17.6, ST_Z0 + 0.3), '#e8e4dc']);
    P.push([stCy(0.42, 0.42, 1.9, 9.8, 4.3, ST_Z1 - 0.6, 0, 0, 0, 14), '#d8201a'], [stCy(0.2, 0.3, 0.4, 9.8, 5.45, ST_Z1 - 0.6, 0, 0, 0, 10), '#2a2a2e'], [stBx(0.5, 0.4, 0.3, 9.8, 4.6, ST_Z1 - 0.15), '#3a3a40'], [stBx(0.2, 1.2, 0.2, 9.4, 4.8, ST_Z1 - 0.95, 0, 0, 0.5), '#2a2a2e']);
    P.push([stCy(0.12, 0.12, ST_H - 21, 13.2, (ST_H + 21) / 2, ST_Z1 - 0.3, 0, 0, 0, 6), '#9aa0a8'], [stBx(0.8, 0.8, 0.4, 13.2, 20.6, ST_Z1 - 0.3), '#8a9098']);
    for (const [x, y, z, ry] of [[-20, 3.2, ST_Z1 - 0.06, 0], [-36, 3.2, ST_Z1 - 0.06, 0], [12.6, 3.2, ST_Z1 - 0.06, 0], [-ST_X + 0.06, 3.2, 60, 1], [ST_X - 0.06, 3.2, 70, 1], [-10, 3.2, ST_Z0 + 0.06, 0], [14, 3.2, ST_Z0 + 0.06, 0]]) P.push([stBx(ry ? 0.1 : 0.5, 0.8, ry ? 0.5 : 0.1, x, y, z), '#ece8e0']);
    scene.add(stMerge(P, { rough: 0.45, map: ST.worn, noCast: true }));
    const ex = stTexExit(); for (const [x, z, ry] of [[-12, ST_Z1 - 0.57, Math.PI], [-ST_X + 0.57, 84, Math.PI / 2], [30, ST_Z0 + 0.57, 0]]) { const m = pl(3.0, 1.2, c3Flat('#ffffff', { map: ex, glow: '#ff3020' }), x, 17.6, z, ry); m.userData.noCast = true; scene.add(m); }
    scene.add(stPlane(1.4, 0.9, stTexCard('FIRE', 'extinguisher', '#d8201a', '#ffffff'), 9.8, 6.6, ST_Z1 - 0.06, Math.PI, 0, { lit: true }));
    const PO = [['ALL SALES FINAL', 'no returns · no exchanges', 'thank you for understanding', '#f6f0e0', '#d8322a'], ['NOW HIRING', 'sorters · cashiers · stock', 'apply at the register', '#fff4c8', '#2f6fd0'], ['HALF-OFF TUESDAYS', 'every red tag item', 'some exclusions apply', '#fbe8e8', '#c8282a'],
      ['FOUND SOMETHING ODD?', 'show it to our museum staff', 'unclaimedbaggage', '#e8f2e8', '#2f8a52'], ['NO FOOD OR DRINK', 'in the fitting rooms', 'management', '#f6f0e0', '#2a1208'], ['GIFT CARDS', 'available at checkout', 'any amount', '#f0e8f6', '#7a3ab8']];
    [[-20, 10.6, ST_Z1 - 0.12, Math.PI], [-30, 10.2, ST_Z1 - 0.12, Math.PI], [ST_X - 0.12, 10.4, 24, -Math.PI / 2], [ST_X - 0.12, 10.8, 52, -Math.PI / 2], [-ST_X + 0.12, 10.4, 40, Math.PI / 2], [-12, 10.4, ST_Z0 + 0.12, 0]].forEach(([x, y, z, ry], i) => { const [a, b, c, bg, fg] = PO[i]; stPoster(scene, 3.0, 4.0, stTexPoster(a, b, c, bg, fg), x, y, z, ry); }); }
  // ---- FOCUS (always): the register counter and its kit, the luggage shelf with the blue BAG
  const F = new THREE.Group(); scene.add(F); s.F = F;
  { const [rx, rz] = ST_REG, P = [[stBx(14, 4.0, 3, rx, 2.0, rz), '#c8282a'], [stBx(14.6, 0.4, 3.6, rx, 4.2, rz), '#f2ece0'], [stBx(14.2, 0.5, 3.1, rx, 0.25, rz + 0.1), '#2a1208'], [stBx(13.6, 0.6, 0.1, rx, 2.6, rz + 1.52), '#2f8a52'],
      [stBx(3.6, 0.12, 2.4, rx + 4.6, 4.46, rz), '#2a2a30'], [stCy(0.2, 0.2, 2.4, rx + 6.4, 4.46, rz, Math.PI / 2, 0, 0, 10), '#c8ccd2'], [stCy(0.2, 0.2, 2.4, rx + 2.8, 4.46, rz, Math.PI / 2, 0, 0, 10), '#c8ccd2'],
      [stCy(0.18, 0.18, 9, rx - 7.6, 4.5, rz + 1.2, 0, 0, 0, 8), '#c8ccd2'], [stCy(0.9, 0.9, 0.6, rx - 7.6, 9.2, rz + 1.2, 0, 0, 0, 14), '#f2c23a'], [stBx(2.4, 1.6, 0.3, rx - 7.6, 10.6, rz + 1.2), '#2a1208'],
      [stBx(2.2, 0.6, 1.5, rx - 3.4, 4.7, rz - 0.4), '#f6f2ea'], [stBx(2.0, 0.6, 1.3, rx - 3.4, 5.25, rz - 0.4), '#f2efe6'], [stBx(0.25, 1.4, 0.2, rx - 4.4, 5.6, rz - 0.4), '#c8ccd2'], [stBx(0.25, 1.4, 0.2, rx - 2.4, 5.6, rz - 0.4), '#c8ccd2'],
      [stBx(3, 5.4, 1.6, rx - 5.2, 2.7, rz + 2.6), '#3a2214'], [stBx(3.2, 0.3, 1.8, rx - 5.2, 5.5, rz + 2.6), '#d8322a']];
    F.add(stMerge(P, { rough: 0.4 , map: ST.worn }));
    F.add(stPlane(2.9, 5.0, stTexCandy(), rx - 5.2, 2.75, rz + 3.42, 0, 0, { lit: true }));
    F.add(stPlane(14, 3.5, stTexCounterFront(), rx, 2.25, rz + 1.52, 0, 0, { lit: true })); F.add(stPlane(14.6, 3.6, stTexTop(), rx, 4.412, rz, 0, -Math.PI / 2, { lit: true }));
    { const C = [[stBx(1.0, 0.75, 1.1, rx + 1.95, 4.78, rz - 1.2), '#2a2a30'], [stBx(0.7, 0.03, 0.8, rx + 1.95, 5.17, rz - 0.85, 0, -0.5), '#f6f4ee'],
        [stCy(0.28, 0.32, 0.2, rx + 6.7, 4.5, rz + 1.3, 0, 0, 0, 12), '#2a2a30'], [stBx(0.1, 0.7, 0.1, rx + 6.7, 4.9, rz + 1.3), '#3a3a40'], [stBx(0.8, 1.1, 0.22, rx + 6.7, 5.55, rz + 1.38, 0, -0.45), '#2a2a30'], [stBx(0.56, 0.36, 0.03, rx + 6.7, 5.78, rz + 1.5, 0, -0.45), '#6ab0e0'],
        [stCy(0.3, 0.27, 0.8, rx - 6.8, 4.8, rz + 1.3, 0, 0, 0, 12), '#3a3a40'], [stCy(0.04, 0.04, 1.0, rx - 6.9, 5.3, rz + 1.25, 0, 0, 0.2, 6), '#2f6fd0'], [stCy(0.04, 0.04, 1.0, rx - 6.7, 5.3, rz + 1.35, 0.15, 0, -0.15, 6), '#e8282a'], [stCy(0.04, 0.04, 1.0, rx - 6.8, 5.32, rz + 1.2, -0.2, 0, 0, 6), '#2a2a2e'],
        [stBx(0.7, 0.14, 0.7, rx - 6.0, 4.47, rz + 1.35, 0.3), '#f2e23a'], [stBx(0.7, 0.14, 0.7, rx - 5.95, 4.6, rz + 1.32, 0.15), '#f2a8c8'],
        [stBx(0.9, 0.42, 0.42, rx - 5.0, 4.62, rz + 1.35), '#2a2a2e'], [stCy(0.2, 0.2, 0.3, rx - 5.1, 4.92, rz + 1.35, 0, 0, Math.PI / 2, 10), '#d8d0b0'],
        [stCy(0.3, 0.3, 0.7, rx - 6.9, 4.75, rz + 0.3, 0, 0, 0, 12), '#2f6fd0'], [stG(new THREE.TorusGeometry(0.2, 0.06, 6, 10), rx - 6.55, 4.8, rz + 0.3), '#2f6fd0'],
        [stBx(1.0, 0.32, 0.32, rx - 4.6, 4.56, rz + 0.5, 0.4), '#c8282a']];
      F.add(stMerge(C, { rough: 0.4, map: ST.worn })); }
    F.add(stPlane(2.3, 1.4, tex((g, w, h) => { g.fillStyle = '#2a1208'; g.fillRect(0, 0, w, h); inked(g, '1', w / 2, h / 2, h * 0.7, '#ffe23a', { stroke: false }); }, 128, 96), rx - 7.6, 10.6, rz + 1.36));
    // the register: body, keypad, display on a post (canvas: $0.00 -> $45.00), the cash drawer (pops out toward jack)
    const reg = new THREE.Group(); reg.position.set(rx - 0.4, 4.4, rz - 0.3); F.add(reg); s.reg = reg;
    reg.add(stMerge([[stBx(3, 1.5, 2.2, 0, 1.35, -0.1), '#3a3a44'], [stBx(2.4, 0.2, 1.0, 0, 2.2, 0.35, 0, -0.35), '#2a2a30'], [stBx(0.3, 0.9, 0.3, 0, 2.4, -0.95), '#2a2a30'], [stBx(3.5, 1.9, 0.3, 0, 2.75, -0.95, 0.2), '#2a2a30']], { rough: 0.4 }));
    { const K = []; for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) K.push([stBx(0.32, 0.12, 0.22, -0.9 + i * 0.45, 2.34 - j * 0.07, 0.15 + j * 0.25, 0, -0.35), i === 4 && j === 2 ? '#3fae5a' : i === 4 ? '#e8402e' : '#e8e2d8']); reg.add(stMerge(K, { rough: 0.4, ao: false })); }
    s.disp = canvasTex(512, 256); s.dispM = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.55), new THREE.MeshBasicMaterial({ map: s.disp.t, toneMapped: false })); s.dispM.material.userData.glow = '#3a8a3a'; s.dispM.position.set(0.03, 2.75, -0.78); s.dispM.rotation.y = 0.2; s.dispM.userData.noCast = true; reg.add(s.dispM);
    s.drawer = new THREE.Group(); reg.add(s.drawer); s.drawer.add(stMerge([[stBx(2.8, 0.55, 2.0, 0, 0.3, 0), '#4a4a54'], [stBx(1.0, 0.18, 0.12, 0, 0.32, 1.02), '#c8ccd2']], { rough: 0.4 })); s.drawer.add(stPlane(2.5, 1.7, stTexBills(), 0, 0.59, 0, 0, -Math.PI / 2));
    // the scanner gun (cashier's hand) and its red beam
    s.scan = new THREE.Group(); s.scan.add(stMerge([[stBx(0.36, 1.1, 0.4, 0, -0.5, 0, 0, 0, -0.25), '#2a2a30'], [stBx(1.2, 0.5, 0.5, 0.35, 0.1, 0), '#f2c23a'], [stBx(0.08, 0.4, 0.42, 0.97, 0.1, 0), '#e8282a']], { rough: 0.4 })); F.add(s.scan);
    s.beam = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.12), new THREE.MeshBasicMaterial({ color: '#ff2a2a', transparent: true, opacity: 0.85, depthWrite: false, toneMapped: false })); s.beam.material.userData.glow = '#ff3030'; s.beam.userData.noCast = true; s.beam.userData.noInk2 = true; F.add(s.beam);
    s.jtag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: stTexTag('$45'), transparent: true, side: THREE.DoubleSide, toneMapped: false })); s.jtag.userData.noCast = true; F.add(s.jtag);
    s.lic = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.0), new THREE.MeshBasicMaterial({ map: stTexLicence(), transparent: true, toneMapped: false })); s.lic.renderOrder = 6; s.lic.userData.noCast = true; s.lic.userData.noInk2 = true; F.add(s.lic);
    s.jk = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.3), new THREE.MeshBasicMaterial()); s.jk.visible = false; F.add(s.jk); }
  { const [lx, lz] = ST_BAGP, P = []; for (let k = 0; k < 4; k++) P.push([stBx(22, 0.35, 4.2, lx, 0.6 + k * 4.4, lz), '#8a96a4']); for (const sx of [-11, 11]) for (const sz of [-2, 2]) P.push([stBx(0.4, 15.4, 0.4, lx + sx, 7.7, lz + sz), '#5a6470']);
    P.push([stBx(22, 15, 0.3, lx, 7.7, lz - 2.15), '#c8282a']); for (let k = 0; k < 4; k++) P.push([stBx(22, 0.55, 0.1, lx, 0.62 + k * 4.4, lz + 2.14), '#e8e4dc']);
    { const sl = stTexSlat(); sl.repeat.set(22 / 8, 15 / 8); F.add(stPlane(21.6, 14.6, sl, lx, 7.7, lz - 1.98, 0, 0, { lit: true })); }
    const BCL = ['#3fae5a', '#e8402e', '#f2c23a', '#8a4ab8', '#2a2a30', '#ff8a1c', '#2fc8e8', '#f27aa8'];
    for (let k = 0; k < 4; k++) for (let i = 0; i < 5; i++) { if (k === 1 && (i === 2)) continue; const bx = lx - 8.4 + i * 4.2, by = 0.78 + k * 4.4, c = BCL[(i * 3 + k * 5) % BCL.length], bh = k === 3 ? 2.2 : R.r(2.8, 3.6), bw = R.r(2.6, 3.4);
      if (k === 3) { P.push([stBx(bw, bh, 2.6, bx, by + bh / 2, lz), c], [stBx(bw * 0.3, 0.4, 0.3, bx, by + bh + 0.2, lz + 0.8), '#2a2224']); continue; }
      P.push([stBx(bw, bh, 1.4, bx, by + bh / 2, lz + 0.2), c], [stBx(0.14, bh + 0.02, 1.44, bx - bw * 0.22, by + bh / 2, lz + 0.2), t3Mul(c, 0.78)], [stBx(0.14, bh + 0.02, 1.44, bx + bw * 0.22, by + bh / 2, lz + 0.2), t3Mul(c, 0.78)], [stBx(1.1, 0.24, 0.3, bx, by + bh + 0.3, lz + 0.2), '#2a2224'], [stBx(0.14, 0.4, 0.14, bx - 0.45, by + bh + 0.12, lz + 0.2), '#2a2224'], [stBx(0.14, 0.4, 0.14, bx + 0.45, by + bh + 0.12, lz + 0.2), '#2a2224']);
      F.add(stPlane(1.5, 0.75, stTexTag(['$24', '$35', '$19', '$29', '$45'][(i + k) % 5]), bx + bw * 0.25, by + 0.9, lz + 0.95, 0, 0, { tr: true })); }
    F.add(stMerge(P, { rough: 0.4 , map: ST.worn }));
    // the traveller's BAG, upright on the second tier (lid to the camera, handle up), + the SALE tag on its string
    const bag = suitcase3D({ color: BAG.color, sticker: BAG.sticker, scale: 1.0 }); const up = new THREE.Group(), turn = new THREE.Group(); bag.rotation.x = Math.PI / 2; turn.add(bag); turn.rotation.z = Math.PI; up.add(turn);
    up.position.set(lx, 0.78 + 4.4 + 0.2 + 1.8, lz + 0.1); F.add(up); s.bag = up; s.bagBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 1.3), new THREE.MeshBasicMaterial()); s.bagBox.visible = false; s.bagBox.position.set(lx, up.position.y, lz + 0.75); F.add(s.bagBox);
    s.salePiv = new THREE.Group(); s.salePiv.position.set(lx + 1.75, up.position.y + 1.3, lz + 1.9); s.salePiv.scale.setScalar(0.72); F.add(s.salePiv);
    s.salePiv.add(stMerge([[stBx(0.06, 0.6, 0.06, 0, -0.3, 0), '#2a1208']], { ao: false }));
    s.sale = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.25), new THREE.MeshBasicMaterial({ map: stTexSale(), transparent: true, side: THREE.DoubleSide, toneMapped: false })); s.sale.position.set(0, -0.6 - 1.45, 0.05); s.sale.userData.noCast = true; s.salePiv.add(s.sale);
    s.saleBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, 3.3, 0.3), new THREE.MeshBasicMaterial()); s.saleBox.visible = false; s.saleBox.scale.setScalar(0.72); s.saleBox.position.set(lx + 1.75, up.position.y + 1.3 - 1.5, lz + 1.9); F.add(s.saleBox); }
  c3Layer(F, C3.L_FOCUS);
  // the 3D shopping baskets the extras carry
  s.baskets = {}; for (const k of ['stA', 'stB', 'stC', 'stE', 'stF']) { const B = stMerge([[stBx(1.7, 0.1, 1.1, 0, 0.05, 0), '#c8202a'], [stBx(1.7, 1.0, 0.08, 0, 0.5, 0.52), '#e8282a'], [stBx(1.7, 1.0, 0.08, 0, 0.5, -0.52), '#e8282a'], [stBx(0.08, 1.0, 1.1, 0.83, 0.5, 0), '#e8282a'], [stBx(0.08, 1.0, 1.1, -0.83, 0.5, 0), '#e8282a'],
      [stBx(1.0, 0.5, 0.6, -0.2, 0.9, 0), stHsl(k.charCodeAt(2) * 47, 70, 55)], [stBx(0.1, 0.6, 0.1, -0.6, 1.3, 0), '#2a2a30'], [stBx(0.1, 0.6, 0.1, 0.6, 1.3, 0), '#2a2a30'], [stBx(1.3, 0.1, 0.12, 0, 1.6, 0), '#2a2a30']], { ao: false });
    B.visible = false; scene.add(B); c3Layer(B, C3.L_FOCUS); s.baskets[k] = B; }
  for (const k of ['shopper', 'skier', 'jack', 'cashier', 'stA', 'stB', 'stC', 'stD', 'stE', 'stF']) toonPerson(s, k);
  haze(scene, '#d8bc94', 0.0022);   // v5: warm golden depth
  c3Env(scene, { top: '#c4d0ec', mid: '#d8a878', bot: '#6a4030' }); c3ShadeScene(scene, { dark: 0.2 }); noFogOnCards(scene);
  c3SetLook(scene, { grime: 0.25, scale: 0.5, inkSet: false, bounce: ['#d8e4f8', '#9a6a40', 0.1],   // v4: fluorescent pools (brighter toward the front), darker back, sun shafts through the window + doors
    lights: [[-56, 34, 64, '#fff2dc', 1.05, 46], [-28, 34, 76, '#fff2dc', 1.2, 46], [0, 34, 60, '#fff2dc', 1.05, 46], [28, 34, 64, '#fff2dc', 1.05, 46], [56, 34, 70, '#fff2dc', 0.9, 46], [-40, 34, 40, '#ffeed4', 0.9, 42], [-6, 34, 44, '#ffeed4', 0.9, 42], [40, 34, 36, '#ffeed4', 0.9, 42], [-20, 34, 8, '#ffe8c8', 0.52, 38]],
    shafts: [[[28, 19, 99], [37, 0, 70], 3, 9, '#ffd8a0', 0.07], [[52, 19, 99], [61, 0, 70], 3, 9, '#ffd8a0', 0.07], [[0, 13, 99], [6, 0, 80], 2.5, 7, '#ffd8a0', 0.05]] });
  s.furnL = C3.L_BG; return s;
}
const stGet = () => ST.s ||= stBuild();
SETS.store = stGet;
function stFurn(s, focus) { const L = focus ? C3.L_FOCUS : C3.L_BG; if (s.furnL !== L) { c3Layer(s.furn, L); s.furnL = L; } }
function stReset(s, t, focus = false) { hideAll(s); hideGrips(s); stFurn(s, focus); [s.beam, s.jtag, s.lic, s.scan].forEach((m) => { m.visible = false; }); for (const k in s.baskets) s.baskets[k].visible = false;
  const k = clamp((t - 13.95) / 0.38); s.doors[0].position.x = -4 - 7.6 * EZ.io(k); s.doors[1].position.x = 4 + 7.6 * EZ.io(k);
  s.drawer.position.z = 0; s.salePiv.visible = false; redraw(s.disp, 'd0', (g, w, h) => stDisp(g, w, h, '$0.00')); }
const stCam = (s, id, lt, K) => c3SetCam(s.cam, camMove(K, lt, id));
const stCam2 = (s, id, lt, p, l, fov = 42) => stCam(s, id, lt, [[0, p, l, fov], [9, p, l, fov]]);
const stRender = (s, o = {}) => { if (s.scene.userData.c3shadow) { s.key.shadow.normalBias = 0.14; s.key.shadow.bias = -0.0008; } return c3Render(s.scene, s.cam, Object.assign({ bg: '#2a2030', bgBlur: 2.0, glow: 0.4, glowBlur: 12, grade: 'saturate(1.0) contrast(1.12) brightness(1.02)' }, o)); };
function stDisp(g, w, h, txt) { g.fillStyle = '#0e1a10'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a2a30'; g.lineWidth = 16; g.strokeRect(0, 0, w, h); g.fillStyle = 'rgba(80,255,120,0.08)'; for (let y = 10; y < h; y += 8) g.fillRect(0, y, w, 3);
  g.shadowColor = '#4aff7a'; g.shadowBlur = 24; inked(g, txt, w / 2, h * 0.54, h * 0.5, '#7aff9a', { stroke: false, font: 'Impact, "Arial Black", sans-serif', maxW: w * 0.84 }); g.shadowBlur = 0; }
// ---- the extras: each on a ping-pong path (absolute time), so they keep their places across the store shots
const ST_PATHS = { stA: [[-30, 56], [-12, 56], 5.0], stB: [[-15, 4], [-15, 30], 6.5], stC: [[-15.5, 50.5], [-15.5, 50.5], 0], stD: [[24, 58], [12, 58], 4.0], stE: [[36, 2], [36, 22], 6.0], stF: [[44, 37.5], [58, 37.5], 7.0] };
function stPath(k, t) { const [a, b, T] = ST_PATHS[k]; if (!T) return { x: a[0], z: a[1], vx: 0, vz: -1, walk: false, d: 0 };
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), x = t / T, f = x % 2 < 1 ? x % 1 : 2 - (x % 2), dir = x % 2 < 1 ? 1 : -1;
  return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, vx: (b[0] - a[0]) * dir, vz: (b[1] - a[1]) * dir, walk: true, d: x * L }; }
function stExtras(s, t, keys) { for (const k of keys) { const P = stPath(k, t);
  const fac = P.walk ? toonFacing(s.cam, P.x, P.z, P.vx, P.vz) : faceTo(s.cam, P.x, P.z, ST_ROW.bridal, ST_ROW.z);
  pose(s, k, t, P.x, P.z, { facing: fac === 'back' ? 'back' : fac, mode: P.walk ? 'walk' : 'stand', phase: P.d / 3.3, expr: P.walk ? 'smile' : 'thinking', hand: { L: 'down', R: P.walk ? 'down' : 'chin' } });
  const B = s.baskets[k]; if (B && P.walk) { gripProp(s, B, k, 'R', V3(0, 1.6, 0), { behind: 0.25, ry: Math.atan2(P.vx, P.vz) }); } } }
// ---- jack + the cashier at the register (same places s15-s19). Card arms: L = screen left (toward the cashier), R = screen right.
function stJack(s, t, o) { const p = pose(s, 'jack', t, ...ST_JACK, Object.assign({ facing: faceTo(s.cam, ...ST_JACK, ...ST_CASH), expr: 'neutral' }, o));
  const h = c3ToonHandWorld(p, 'L'); if (h) { s.jk.position.set(h.x, h.y - 1.7, h.z); s.jk.scale.set(3.4, 4.0, 1); s.jk.updateMatrixWorld(true); } return p; }
const stCashier = (s, t, o) => pose(s, 'cashier', t, ...ST_CASH, Object.assign({ facing: faceTo(s.cam, ...ST_CASH, ...ST_JACK), expr: 'smile', hand: { L: 'desk', R: 'desk' } }, o));
const ST_JACKET = { kind: 'jacket', color: '#8a5a2c', k: 1.7 };
const ST_UP = { h: [0.34, -0.5], pole: [1, 0.6], hand: 'grip' };   // the jacket held up by its hanger (L, toward the cashier)
const ST_POCKET = { h: [-0.64, 0.12], pole: [1, -0.5], hand: 'grip', front: true };   // R crosses to the jacket's pocket
const ST_LIC = { h: [0.42, -0.36], pole: [1, 0.6], hand: 'grip' };   // R raised beside his face with the licence

// ---- s11: You walk in — the sliding doors part, the shopper walks in; the camera travels back ahead of her
const stShopZ = (t) => 101 - 6.5 * (t - 14.07);
SHOT_FN.s11 = (t, u, lt) => { const s = stGet(); stReset(s, t, true);
  stCam(s, 's11', lt, [[0, [0.8, 7.6, 75], [0, 7.0, 99], 46], [0.6, [0.4, 7.4, 72], [0, 7.0, 96], 46]]);
  const z = stShopZ(t); pose(s, 'shopper', t, 0, z, { facing: 0, mode: 'walk', phase: (101 - z) / 3.3, expr: 'excited', gaze: [0, -0.4], hand: { L: 'down', R: 'down' } });
  stRender(s, { bgBlur: 2 }); };
SNAPS.s11 = 'free'; CAMF.s11 = { push: 0, orbit: 0, crane: 0 };
// ---- s12: and it's like a mall built out of other people's vacations — the big crane up over her shoulder: the whole store
SHOT_FN.s12 = (t, u, lt) => { const s = stGet(); stReset(s, t, true);
  stCam(s, 's12', lt, [[0, [2.6, 12.8, 99.3], [-1, 4, 62], 50], [1.2, [5.5, 22, 98.6], [-3, 3, 50], 52], [2.76, [10, 33, 98], [-8, 0, 32], 62]]);
  const z = stShopZ(t); pose(s, 'shopper', t, 0, z, { facing: 'back', mode: 'walk', phase: (101 - z) / 3.3, expr: 'excited', hand: { L: 'down', R: 'down' } });
  stExtras(s, t, ['stA', 'stB', 'stC', 'stD', 'stE', 'stF']); stRender(s, { bgBlur: 1.5 }); };
SNAPS.s12 = 'free'; CAMF.s12 = { push: 0, orbit: 0.015, crane: 0 };
// ---- s13: Shirts, cameras, headphones, wedding dresses, a whole rack of ski boots — one lateral travelling along the row
SHOT_FN.s13 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); const zc = 70, zl = ST_ROW.z, R = ST_ROW;
  const K = [[0, R.shirts], [0.24, R.shirts + 1], [0.42, R.cams], [0.66, R.cams + 1], [0.88, R.phones], [1.14, R.phones + 1], [1.40, R.bridal], [2.40, R.bridal + 1.4], [2.78, R.boots], [3.34, R.boots + 1.2]];
  stCam(s, 's13', lt, K.map(([k, x]) => [k, [x + 1.2, 7.4, zc], [x, 5.8, zl], 46]));
  stRender(s, { bgBlur: 2.5 }); };
SNAPS.s13 = 'free'; CAMF.s13 = { push: 0.02, orbit: 0, crane: 0 };
// ---- s14: In Alabama — the skier on the try-on bench by the window, a ski boot in hand, sweating; outside: TEMP 98°F
SHOT_FN.s14 = (t, u, lt) => { const s = stGet(); stReset(s, t, false);
  stCam(s, 's14', lt, [[0, [42.4, 6.6, 77.5], [38.6, 7.4, 96], 42], [0.76, [41.8, 6.9, 79.5], [38.6, 7.4, 96], 42]]);
  pose(s, 'skier', t, ST_SKI[0], ST_SKI[1], { facing: 0.4, sit: 1, seat: 2.9, expr: [[0, 'strain'], [20.86, 'nervous']], fx: 'sweat', bright: 1.15, hand: { L: 'lap', R: [[0, { h: [0.36, -0.22], pole: [1, 0.6], hand: 'grip' }], [20.86, { h: [0.38, -0.27], pole: [1, 0.6], hand: 'grip' }]] }, prop: { R: { kind: 'boot', color: '#2f9ae8', k: 1.3 } }, gaze: [-0.2, -0.3] });
  stRender(s, { bgBlur: 4 }); };
SNAPS.s14 = 'free'; CAMF.s14 = { push: 0.05, orbit: 0, crane: 0 };
// ---- s15: Then a guy at the register holds up a jacket — the counter, the cashier behind it; on "holds up" he raises it
SHOT_FN.s15 = (t, u, lt) => { const s = stGet(); stReset(s, t, true); stCam2(s, 's15', lt, [-49, 18, 88], [-28.4, 4.4, 76], 60);
  stCashier(s, t, { expr: [[0, 'smile'], [22.9, 'surprised']] });
  stJack(s, t, { expr: [[0, 'neutral'], [22.48, 'talk']], hand: { L: [[0, 'hold'], [22.48, ST_UP]], R: 'down' }, prop: { L: ST_JACKET } });
  stExtras(s, t, ['stA', 'stD']); stRender(s, { bgBlur: 2.5 }); };
SNAPS.s15 = [[21.50, ['p:jack', 'p:cashier', [ST_REG[0], 4.4, ST_REG[1], 14, 0.4, 3]], 0.97], [22.48, ['p:jack', 'u:cashier', 'o:jk'], 0.82]];
// ---- s16: Hey, this looks just like mine — closer, 3/4: he squints at the jacket, talking
SHOT_FN.s16 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); stCam2(s, 's16', lt, [-21.5, 9.4, 97], [-25.6, 8, ST_JACK[1]], 48);
  stCashier(s, t, { expr: 'surprised' });
  stJack(s, t, { facing: -1, expr: [[0, 'skeptical'], [24.42, 'talkO']], talk: t < 24.7 ? 0.8 : 0, gaze: [-0.6, -0.4], hand: { L: ST_UP, R: 'down' }, prop: { L: ST_JACKET } });
  stRender(s, { bgBlur: 6 }); };
SNAPS.s16 = [[23.54, ['u:jack', 'o:jk'], 0.8], [24.2, ['u:jack', 'o:jk'], 0.68]];
// ---- s17: He checks the pocket — his other hand dips into the jacket pocket
SHOT_FN.s17 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); stCam2(s, 's17', lt, [-21.5, 9.4, 97], [-25.6, 7.5, ST_JACK[1]], 48);
  stCashier(s, t, { expr: 'surprised' });
  stJack(s, t, { facing: -1, expr: [[0, 'skeptical'], [25.02, 'thinking']], gaze: [-0.6, 0.3], hand: { L: ST_UP, R: [[0, 'down'], [25.02, ST_POCKET]] }, prop: { L: ST_JACKET } });
  stRender(s, { bgBlur: 6 }); };
SNAPS.s17 = [[24.88, ['u:jack', 'o:jk'], 0.72], [25.38, ['o:jk', 'u:jack'], 0.7]];
// ---- s18: It is mine — out comes his own driver's licence (in his hand, his face + name), then his shocked face
SHOT_FN.s18 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); stCam2(s, 's18', lt, [-21.5, 9.6, 96], [-25.4, 8.5, ST_JACK[1]], 48);
  stCashier(s, t, { expr: 'surprised' });
  const p = stJack(s, t, { facing: -1, expr: [[0, 'surprised'], [26.26, 'shock']], gaze: [0.5, 0], hand: { L: ST_UP, R: ST_LIC }, prop: { L: ST_JACKET } });
  if (true) { const h = c3ToonHandWorld(p, 'R'), q = s.cam.quaternion, rt = V3(1, 0, 0).applyQuaternion(q), to = s.cam.position.clone().sub(h).normalize();
    s.lic.visible = true; s.lic.quaternion.copy(q); s.lic.position.copy(h).addScaledVector(rt, 1.25).addScaledVector(V3(0, 1, 0).applyQuaternion(q), 0.4).addScaledVector(to, 0.3); gripDot(s, 'jack', 'R'); }
  else s.lic.position.set(-23, 9, ST_JACK[1]);
  stRender(s, { bgBlur: 6 }); };
SNAPS.s18 = [[25.92, ['o:lic'], 0.7], [26.26, ['u:jack', 'o:lic'], 0.76]];
// ---- s19: G2 GAG — the cashier beeps the jacket's tag, the display reads $45.00, the drawer pops; his face falls
SHOT_FN.s19 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); stCam2(s, 's19', lt, [-46, 8.6, 93], [-28.4, 6.8, 76], 60);
  const beep = 27.02, pop = 27.35, OUT = { h: [0.5, 0.4], pole: [1, 0.6], hand: 'grip' };
  stCashier(s, t, { expr: [[0, 'smile'], [beep, 'grin']], hand: { L: 'desk', R: [[0, 'desk'], [26.92, { h: [0.9, -0.6], pole: [1, 0.6], hand: 'grip' }]] } });
  const p = stJack(s, t, { expr: [[0, 'shock'], [beep + 0.06, 'deadpan'], [pop, 'sad']], hand: { L: OUT, R: 'down' }, prop: { L: ST_JACKET }, gaze: [-0.6, 0.1] });
  const jh = c3ToonHandWorld(p, 'L'); s.jtag.visible = true; s.jtag.position.set(jh.x - 1.0, jh.y - 0.9, jh.z + 0.3); s.jtag.quaternion.copy(s.cam.quaternion);
  gripProp(s, s.scan, 'cashier', 'R', V3(0, -0.85, 0), { behind: -0.15, rz: -0.35 }); gripDot(s, 'cashier', 'R');
  if (t >= beep && t < beep + 0.2) { const a = V3(0.97, 0.1, 0).applyEuler(s.scan.rotation).add(s.scan.position), b = s.jtag.position.clone(), m = a.clone().add(b).multiplyScalar(0.5);
    s.beam.visible = true; s.beam.position.copy(m); s.beam.quaternion.copy(s.cam.quaternion); s.beam.scale.set(a.distanceTo(b), 1, 1);
    const sa = a.clone().project(s.cam), sb = b.clone().project(s.cam); s.beam.rotateZ(Math.atan2((sb.y - sa.y) * H, (sb.x - sa.x) * W)); }
  if (t >= beep + 0.04) redraw(s.disp, 'd45', (g, w, h) => stDisp(g, w, h, '$45.00'));
  const dk = t - pop; s.drawer.position.z = dk < 0 ? 0 : 1.5 * (1 - Math.exp(-dk * 18) * Math.cos(dk * 26));
  stRender(s, { bgBlur: 3 }); };
SNAPS.s19 = [[26.85, ['u:cashier', 'o:dispM', 'o:jk'], 0.84], [27.35, ['u:jack', 'u:cashier', 'o:dispM'], 0.78]];
// ---- s36: It's just in Alabama… on sale — his blue suitcase on the luggage shelf; on "sale" the SALE tag swings on
SHOT_FN.s36 = (t, u, lt) => { const s = stGet(); stReset(s, t, false); const [lx, lz] = ST_BAGP;
  stCam2(s, 's36', lt, [lx + 1.5, 8.6, lz + 24], [lx, 6.6, lz], 40);
  const k = t - 57.70; s.salePiv.visible = k > 0; s.salePiv.rotation.z = k < 0 ? 2.2 : k < 0.16 ? 2.2 * (1 - (k / 0.16) ** 2) : -0.32 * Math.exp(-(k - 0.16) * 5) * Math.sin((k - 0.16) * 14);
  stRender(s, { bgBlur: 5 }); };
SNAPS.s36 = [[56.58, ['o:bagBox', [ST_BAGP[0], 6.4, ST_BAGP[1] + 1, 9, 6, 2]], 0.75], [57.62, ['o:bagBox', 'o:saleBox'], 0.62]];
CAMF.s36 = { push: 0.1, orbit: 0.03, crane: 0.15 };

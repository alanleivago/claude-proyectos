// banner.js — banner de YouTube de Ava Restfield (2560x1440): pantalla de estado de RE2 (FILE / MAP / ITEM, retrato,
// CONDITION con el electro, EQUIP y casillas) sobre la partida en pausa: la horda en la niebla (sets/outside.js 13_horde).
// Se dibuja a 640x360 y se escala x4 (pixel PS1). Zonas de YouTube a 640x360: TV = todo; escritorio = franja y 127-233;
// movil (zona segura 1546x423) = x 127-513, y 127-233. Todo lo importante va dentro de la zona segura.
// Salida: window.OUT = { banner, ... } (dataURL). Render: node banner.mjs <outdir>
import * as L from './lib.js';
import { reText, reWidth } from './refont.js';
import { bitText as pxText } from './pixfont.js';
const { THREE } = L;
const W = 640, H = 360, K = 4;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

await L.loadHero();
const TL = await (await fetch('timeline.json')).json();
const ctx = { L, TL, hud() {}, hudState: () => 'FINE', youDied() {}, examine() {}, CUTS: [] };
const OS = await (await import('./sets/outside.js')).shots(ctx);
const DS = await (await import('./sets/diagrams.js')).shots(ctx);

const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.SRGBColorSpace;
function grab(scene, cam, w, h) {
  renderer.setSize(w, h, false); renderer.setClearColor(0x000000, 0); renderer.render(scene, cam);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(renderer.domElement, 0, 0); return cv;
}
const hasSkin = (o) => { let s = false; o.traverse((m) => { if (m.isSkinnedMesh) s = true; }); return s; };

// ---------- fondo: la horda, abierta a lo ancho (los de los lados se ven en la franja de escritorio) ----------
const horde = OS['13_horde'];
horde.update(1.3);
const zs = horde.scene.children.filter((o) => o.isGroup && hasSkin(o));
const camBG = new THREE.PerspectiveCamera(44, W / H, 0.03, 60); camBG.position.set(0, 1.4, 4.6); camBG.lookAt(0, 1.15, -4); camBG.updateMatrixWorld();
// postes y torre fuera: tapaban la horda; los dos de delante quedan en los lados de la franja de escritorio
for (const o of horde.scene.children) if ((o.isMesh || o.isGroup) && !hasSkin(o)) { const b = new THREE.Box3().setFromObject(o); if (b.max.y > 0.3) o.visible = false; }
const SPOT = [[-1.65, 1.6], [1.75, 1.4], [-2.7, -0.6], [2.8, -0.9], [-0.6, -2.2], [-4.0, -3.4], [4.3, -3.9], [0.9, -5.2], [-1.6, -7.5]];
zs.forEach((z, i) => { const [x, zz] = SPOT[i % SPOT.length]; z.position.set(x, 0, zz); z.rotation.y = Math.atan2(camBG.position.x - x, camBG.position.z - zz) + (i % 2 ? 0.15 : -0.15); });
const bg = grab(horde.scene, camBG, W, H);

// ---------- retrato: Ava a camara, media sonrisa ----------
const pScene = new THREE.Scene();
pScene.add(new THREE.AmbientLight(0xffffff, 1.1));
const kl = new THREE.DirectionalLight(0xfff2e0, 1.8); kl.position.set(-1.2, 1.6, 2.5); pScene.add(kl);
const ch = L.hero(); pScene.add(ch.root); ch.shadow.visible = false;
ch.pose(0, L.still('idle', 0), [[-99, 'open', 'smile']]); ch.root.updateMatrixWorld(true);
const head = V(); ch.bone.getObjectByName('Head').getWorldPosition(head);
const camP = new THREE.PerspectiveCamera(16, 48 / 54, 0.05, 20); camP.position.set(head.x + 0.1, head.y + 0.06, head.z + 1.55); camP.lookAt(head.x, head.y + 0.03, head.z); camP.updateMatrixWorld();
ch.lookAt(camP, 1, 40);
const portrait = grab(pScene, camP, 48, 54);

// ---------- iconos: los objetos RE2 del inventario del ep2 (sets/diagrams.js 08), vistos desde arriba en 3/4 ----------
const inv08 = DS['08_examine']; inv08.update(0);
const inv = inv08.scene.children.find((o) => o.isGroup);
const kids = inv.children.slice();
function icon(objs, w, h, half, tilt = 0.55) {
  kids.forEach((k) => { k.visible = objs.includes(k); });
  const box = new THREE.Box3(); objs.forEach((o) => box.expandByObject(o)); const c = box.getCenter(V());
  const cam = new THREE.OrthographicCamera(-half, half, half * h / w, -half * h / w, 0.01, 50);
  cam.position.set(c.x, c.y + 6 * Math.cos(tilt), c.z + 6 * Math.sin(tilt)); cam.lookAt(c); cam.updateMatrixWorld();
  inv08.scene.background = null; return grab(inv08.scene, cam, w, h);
}
const near = (x, z) => kids.reduce((b, k) => { const p = new THREE.Box3().setFromObject(k).getCenter(V()); const d = Math.hypot(p.x - x, p.z - z); return d < b[0] ? [d, k] : b; }, [1e9, null])[1];
// posiciones del mundo = casilla + inv.position (0,0,-0.35)
const spray = near(1.2, -1.15), herb = near(0.4, -0.35), shells = near(-1.2, 0.4);
// usuario: el spray de pie (boca arriba) y la maceta mas de frente
spray.rotation.set(0, 2.2, 0);
const ICON = { spray: icon([spray], 48, 42, 0.66, 1.3), herb: icon([herb], 48, 42, 0.56, 1.15), shells: icon([shells], 48, 42, 0.4) };

// pistola del ep1 (models/pistol-retro.glb), de perfil
const pg = await L.loadModel('models/pistol-retro.glb');
const gun = L.ps1Clone(pg.scene, { lit: true });
{ const b = new THREE.Box3().setFromObject(gun), s = b.getSize(V()), k = 1 / Math.max(s.x, s.y, s.z); gun.scale.multiplyScalar(k); const c = new THREE.Box3().setFromObject(gun).getCenter(V()); gun.position.sub(c); }
gun.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.emissive) m.emissive.setHex(0x3a3e46); }); });
const gScene = new THREE.Scene(); gScene.add(gun); gScene.add(new THREE.AmbientLight(0xffffff, 3.0));
const gl = new THREE.DirectionalLight(0xffffff, 3.5); gl.position.set(-1, 2, 3); gScene.add(gl);
const GROT = (L.QS.get('grot') ?? '0,1.5708,0').split(',').map(Number);
gun.parent.rotation.set(...GROT);
const camG = new THREE.OrthographicCamera(-0.62, 0.62, 0.36, -0.36, 0.01, 20); camG.position.set(0, 0.15, 5); camG.lookAt(0, 0, 0); camG.updateMatrixWorld();
const gunIcon = grab(gScene, camG, 72, 42);

// ---------- composicion 2D ----------
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
c.imageSmoothingEnabled = false;
c.drawImage(bg, 0, 0);
// pausa: velo azul noche + lineas de barrido + vineta
c.fillStyle = 'rgba(6,12,30,0.40)'; c.fillRect(0, 0, W, H);
c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < H; y += 2) c.fillRect(0, y, W, 1);
{ const g = c.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 400); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.7)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
// huella de sangre (la misma textura de Flow del ep2) en el "cristal", arriba a la derecha (solo TV)
const hp = await L.img('tex/handprint.png');
c.save(); c.globalAlpha = 0.85; c.translate(600, 52); c.rotate(-0.35); c.drawImage(hp, -24, -28, 48, 56); c.restore();

const rect = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
function bevel(x, y, w, h, base = '#5a5e6a', hi = '#b4b8c4', lo = '#22242c') {
  rect(x, y, w, h, base);
  c.fillStyle = 'rgba(255,255,255,0.08)'; for (let yy = y + 2; yy < y + h - 2; yy += 2) c.fillRect(x + 1, yy, w - 2, 1);
  rect(x, y, w, 1, hi); rect(x, y, 1, h, hi); rect(x, y + h - 1, w, 1, lo); rect(x + w - 1, y, 1, h, lo);
}
function inset(x, y, w, h, fill = '#060a16') { rect(x - 1, y - 1, w + 2, h + 2, '#16181e'); rect(x, y, w, h, fill); rect(x, y + h, w, 1, '#8a8e9a'); rect(x + w, y, 1, h + 1, '#8a8e9a'); }
function slot(x, y, w, h) {   // casilla RE2: azul muy oscuro con brillo arriba
  inset(x, y, w, h, '#0a1024');
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(70,90,150,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x, y, w, h);
  c.fillStyle = 'rgba(80,110,180,0.10)'; for (let yy = y + 2; yy < y + h; yy += 3) c.fillRect(x, yy, w, 1);
}
const left = (s, x, y, sc, col, o) => reText(c, s, x + reWidth(s, sc) / 2, y, sc, col, o);

// la barra (zona segura de movil: x 127-513, y 127-233)
const BX = 131, BY = 133, BW = 378, BH = 74;
rect(BX - 2, BY - 2, BW + 4, BH + 4, '#000000');
bevel(BX, BY, BW, BH, '#2c3040', '#7a8094', '#0c0e14');

// 1) retrato + placa del nombre (como CLAIRE)
bevel(BX + 4, BY + 4, 52, 66);
rect(BX + 7, BY + 7, 46, 11, '#141c4a'); rect(BX + 7, BY + 18, 46, 1, '#8a90a8');
reText(c, 'AVA', BX + 30, BY + 12, 1, '#e8eef8', { outline: null });
inset(BX + 7, BY + 21, 46, 46, '#1a2848');
{ const g = c.createLinearGradient(0, BY + 21, 0, BY + 67); g.addColorStop(0, '#3a5a9a'); g.addColorStop(1, '#0c1430'); c.fillStyle = g; c.fillRect(BX + 7, BY + 21, 46, 46); }
c.save(); c.beginPath(); c.rect(BX + 7, BY + 21, 46, 46); c.clip(); c.drawImage(portrait, BX + 6, BY + 19); c.restore();

// 2) pestanas FILE / MAP / ITEM / SUBSCRIBE (ITEM = pagina abierta, cursor amarillo sobre SUBSCRIBE)
const TX = BX + 60, TY = BY + 4, TW = BW - 64, TH = 14;
bevel(TX, TY, TW, TH, '#3c4050', '#9aa0b4', '#14161c');
const tabs = [['FILE', 52], ['MAP', 50], ['ITEM', 56], ['SUBSCRIBE', TW - 158 - 6]];
{ let x = TX + 3;
  for (const [s, w] of tabs) {
    const on = s === 'ITEM', sub = s === 'SUBSCRIBE';
    rect(x, TY + 2, w - 2, TH - 4, on ? '#2a4c94' : sub ? '#6a0c0c' : '#10142a');
    if (on) { rect(x, TY + 2, w - 2, 1, '#9ab8ff'); rect(x, TY + TH - 3, w - 2, 1, '#9ab8ff'); }
    if (sub) { rect(x, TY + 2, w - 2, 1, '#ff6a50'); rect(x, TY + TH - 3, w - 2, 1, '#ff6a50'); }
    reText(c, s, x + (w - 2) / 2 + (sub ? 4 : 0), TY + TH / 2, 1, on ? '#ffffff' : sub ? '#ffe0d0' : '#8a90a8', { outline: null });
    if (sub) { c.fillStyle = '#ffe048'; for (let i = 0; i < 4; i++) c.fillRect(x + 5 + i, TY + 4 + i, 1, 7 - 2 * i); }
    x += w;
  } }

// 3) CONDITION: el electro del HUD de los episodios, en Fine
const CX = BX + 60, CY = BY + 21, CW = 104, CHh = 49;
bevel(CX, CY, CW, CHh);
{ const sx = CX + 4, sy = CY + 4, sw = CW - 8, sh = 30;
  rect(sx, sy, sw, sh, '#04140a'); c.fillStyle = '#0f4a1a'; for (let yy = sy + 3; yy < sy + sh - 1; yy += 4) c.fillRect(sx + 1, yy, sw - 2, 1);
  c.fillStyle = '#2fb83c'; c.fillRect(sx, sy, sw, 1); c.fillRect(sx, sy + sh - 1, sw, 1); c.fillRect(sx, sy, 1, sh); c.fillRect(sx + sw - 1, sy, 1, sh);
  const base = sy + 13, n = sw - 8, head = Math.floor(n * 0.72); let prev = null;
  for (let i = 0; i < n; i++) {
    const u = ((i / n) * 2.0 + 0.1) % 1; let v = 0;
    if (u > 0.30 && u < 0.33) v = -2; else if (u > 0.40 && u < 0.43) v = 7; else if (u > 0.43 && u < 0.46) v = -9; else if (u > 0.46 && u < 0.49) v = 4; else if (u > 0.6 && u < 0.66) v = -2;
    const fade = ((head - i + n) % n) / n; c.fillStyle = '#62f05a'; c.globalAlpha = i > head ? 0.18 : 0.35 + 0.65 * (1 - fade);
    const yy = base + v, yp = prev ?? yy, lo = Math.min(yy, yp), hi = Math.max(yy, yp); c.fillRect(sx + 4 + i, lo, 1, hi - lo + 2); prev = yy;
  }
  c.globalAlpha = 1; rect(sx + 4 + head, base - 1, 2, 3, '#f4fff0');
  rect(sx + sw - 38, sy + sh - 13, 36, 11, '#071c0c'); reText(c, 'Fine', sx + sw - 20, sy + sh - 7, 1, '#62f05a', { outline: '#020a04' });
  reText(c, 'CONDITION', CX + CW / 2, CY + CHh - 7, 1, '#c4cad4', { outline: null }); }

// 4) EQUIP: la pistola de Ava con su municion
const EX = CX + CW + 4, EY = CY, EW = 100;
bevel(EX, EY, EW, CHh);
rect(EX + 3, EY + 3, 11, CHh - 6, '#141c4a');
'EQUIP'.split('').forEach((ch, i) => pxText(c, ch, EX + 9, EY + 9 + i * 8.5, 1, '#c8d0e8', { outline: null }));
slot(EX + 17, EY + 4, EW - 21, CHh - 8);
c.drawImage(gunIcon, EX + 17 + (EW - 21 - 72) / 2, EY + 4 + 0);
reText(c, '15', EX + EW - 12, EY + CHh - 11, 1, '#9cf09c', { outline: '#000000' });

// 5) casillas: First Aid Spray, hierba verde, cartuchos
const IX = EX + EW + 4, IW = BX + BW - 4 - IX, sw3 = Math.floor((IW - 4) / 3);
bevel(IX, CY, IW, CHh);
[['spray', null], ['herb', null], ['shells', 'x4']].forEach(([k, n], i) => {
  const x = IX + 3 + i * (sw3 + 0) + (i ? 1 : 0), y = CY + 4, w = sw3 - 2, h = CHh - 8;
  slot(x, y, w, h); c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(ICON[k], x + (w - 48) / 2, y + (h - 42) / 2); c.restore();
  if (n) reText(c, n, x + w - 8, y + h - 6, 1, '#9cf09c', { outline: '#000000' });
});

// 6) caja de mensaje (descripcion del objeto en RE2) bajo la barra: el nombre del canal
const MY = BY + BH + 4, MH = 21;
rect(BX - 2, MY - 2, BW + 4, MH + 4, '#000000'); bevel(BX, MY, BW, MH, '#2c3040', '#7a8094', '#0c0e14'); inset(BX + 3, MY + 3, BW - 6, MH - 6, '#04060e');
{ const a = 'AVA RESTFIELD', b = 'Zombie survival tips. Done properly.';
  const wa = reWidth(a, 2), wb = reWidth(b, 1), gap = 10, x0 = Math.round(W / 2 - (wa + gap + wb) / 2), y = MY + MH / 2;
  left(a, x0, y, 2, '#ffd23f', { outline: '#000000' }); left(b, x0 + wa + gap, y + 1, 1, '#e8e8e0', { outline: null }); }

// salida x4
function up(src, k) { const o = document.createElement('canvas'); o.width = src.width * k; o.height = src.height * k; const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(src, 0, 0, o.width, o.height); return o; }
const big = up(cv, K);
window.OUT = { banner: big.toDataURL('image/png'), parts: up((() => { const p = document.createElement('canvas'); p.width = 300; p.height = 60; const g = p.getContext('2d'); g.fillStyle = '#334'; g.fillRect(0, 0, 300, 60); g.drawImage(portrait, 0, 0); g.drawImage(gunIcon, 52, 0); g.drawImage(ICON.spray, 128, 0); g.drawImage(ICON.herb, 178, 0); g.drawImage(ICON.shells, 228, 0); return p; })(), 3).toDataURL('image/png') };
window.READY = true;

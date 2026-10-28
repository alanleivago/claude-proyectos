// sets/hall.js — the apartment entry (padded leather door "13", wooden casing, old Soviet wallpaper, black skulls).
// ONE set reused by 01 02 05 06 13 14 16 17 19; every shot's update() sets the whole state (door angle, bar, Ava, zombies).
// World: wall face z=0 (room at +z), door opening x in [-0.45, 0.45], hinges on the left, lever on the right, floor y=0.
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

export async function shots({ L, TL }) {
  const { THREE, LW, LH } = L;
  const R = L.rng(1313);
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0c0907);
  const amb = new THREE.AmbientLight(0xffe0c0, 0.72); scene.add(amb);
  const key = new THREE.DirectionalLight(0xffcf98, 0.85); key.position.set(1.6, 3.2, 3.0); scene.add(key);
  const hallLight = new THREE.PointLight(0xd8f0ff, 0, 4.5, 1.2); hallLight.position.set(0.1, 2.0, -0.6); scene.add(hallLight);

  // ---------- textures (drawn in code, nearest) ----------
  const px = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const wallTex = L.cvs(48, 48, (c, w, h) => {
    const r = L.rng(5);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 10 - 5; px(c, x, y, `rgb(${172 + n},${158 + n},${134 + n})`); }
    const med = (cx, cy, s) => {      // dark ornamental medallion: ring + inner eye + four scrolls
      c.strokeStyle = '#6e5a48'; c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(cx, cy, 8 * s, 10 * s, 0, 0, 7); c.stroke();
      c.beginPath(); c.ellipse(cx, cy, 3.5 * s, 4.5 * s, 0, 0, 7); c.stroke();
      px(c, cx - 1, cy - 1, '#4a3628', 2, 2);
      for (const [dx, dy] of [[0, -13], [0, 13], [-11, 0], [11, 0]]) { c.beginPath(); c.arc(cx + dx * s, cy + dy * s, 2.2 * s, 0, 7); c.stroke(); }
    };
    med(24, 24, 0.9); c.strokeStyle = '#9a8670'; c.lineWidth = 1;
    for (const [x, y] of [[0, 0], [48, 0], [0, 48], [48, 48]]) { c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x, y - 5); c.lineTo(x + 4, y); c.lineTo(x, y + 5); c.closePath(); c.stroke(); }
  });
  const DW = 96, DH = 216;   // door leather: diamond tufting, brass studs, border band with brass crosses
  const doorTex = L.cvs(DW, DH, (c) => {
    const B = 8, r = L.rng(9);
    for (let y = 0; y < DH; y++) for (let x = 0; x < DW; x++) {
      let col;
      if (x < B || x >= DW - B || y < B || y >= DH - B) { const n = r() * 10; col = [70 + n, 40 + n * 0.6, 26]; }
      else {
        const a = ((x - B) / 12 + (y - B) / 16) % 1, b = (((x - B) / 12 - (y - B) / 16) % 1 + 1) % 1;
        const s = Math.min(a, 1 - a) * Math.min(b, 1 - b) * 4, lit = (a < 0.5 ? 0.12 : -0.05) + (b < 0.5 ? 0.1 : -0.04);
        const k = 0.45 + 0.7 * Math.sqrt(s) + lit + r() * 0.06; col = [84 * k, 48 * k, 32 * k];
      }
      px(c, x, y, `rgb(${col[0] | 0},${col[1] | 0},${col[2] | 0})`);
    }
    for (let m = -12; m < 24; m++) for (let n = -12; n < 24; n++) {   // studs at the tuft points
      const x = B + 6 * (m + n), y = B + 8 * (m - n);
      if (x > B + 1 && x < DW - B - 1 && y > B + 1 && y < DH - B - 1) { px(c, x - 1, y - 1, '#2a160c', 3, 3); px(c, x, y, '#e8c060'); }
    }
    for (let y = B + 3; y < DH - B; y += 4) { px(c, B + 1, y, '#c8a050'); px(c, DW - B - 2, y, '#c8a050'); }
    for (let x = B + 3; x < DW - B; x += 4) { px(c, x, B + 1, '#c8a050'); px(c, x, DH - B - 2, '#c8a050'); }
    const cross = (x, y) => { px(c, x - 2, y, '#d8b060', 5, 1); px(c, x, y - 2, '#d8b060', 1, 5); px(c, x + 1, y + 1, '#6a4418', 1, 2); };
    for (let y = 10; y < DH - 6; y += 13) { cross(4, y); cross(DW - 5, y); }
    for (let x = 17; x < DW - 10; x += 13) { cross(x, 4); cross(x, DH - 5); }
  });
  const woodTex = L.cvs(16, 64, (c, w, h) => {
    const r = L.rng(3);
    for (let x = 0; x < w; x++) { const g = r() * 26 - 13; for (let y = 0; y < h; y++) { const n = g + r() * 8 + (Math.sin(y * 0.3 + x) > 0.85 ? -18 : 0); px(c, x, y, `rgb(${150 + n},${84 + n * 0.7},${38 + n * 0.3})`); } }
  });
  const floorTex = L.cvs(64, 64, (c) => {   // herringbone parquet
    const r = L.rng(11);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const u = (x + y) & 63, v = (x - y + 64) & 63, k = Math.floor(u / 8) + Math.floor(v / 32) * 7, dir = (Math.floor((x + 64 - y) / 8)) & 1;
      const plank = dir ? Math.floor((x + y) / 8) : Math.floor((x - y + 64) / 8);
      const t = [0.95, 0.8, 1.08, 0.88, 1.0, 0.75][(plank * 7 + k) % 6], seam = ((dir ? (x - y + 64) : (x + y)) % 16 === 0) || ((dir ? x + y : x - y + 64) % 8 === 0);
      const s = (seam ? 0.55 : 1) * t * (0.92 + r() * 0.12);
      px(c, x, y, `rgb(${(128 * s) | 0},${(70 * s) | 0},${(34 * s) | 0})`);
    }
  });
  const hallTex = L.cvs(32, 32, (c, w, h) => { const r = L.rng(21); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const n = r() * 16 - 8 + (y > 20 ? -14 : 0); px(c, x, y, `rgb(${120 + n},${150 + n},${142 + n})`); } });
  const grafTex = L.cvs(128, 32, (c) => {
    const r = L.rng(22); for (let y = 0; y < 32; y++) for (let x = 0; x < 128; x++) { const n = r() * 16 - 8; px(c, x, y, `rgb(${120 + n},${150 + n},${142 + n})`); }
    c.font = 'bold 15px "Arial Black", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#b01c16'; c.fillText('DO NOT ENTER', 64, 17);   // traducido del ruso (pedido del usuario)
    for (let k = 0; k < 9; k++) { const x = 8 + Math.floor(r() * 112); px(c, x, 22, '#a01812', 1, 3 + Math.floor(r() * 7)); }
  });
  const plateTex = L.cvs(20, 14, (c) => {
    px(c, 0, 0, '#5a4420', 20, 14); px(c, 1, 1, '#c09848', 18, 12); px(c, 1, 1, '#e0c070', 18, 1);
    const ink = '#3a2a10'; px(c, 5, 3, ink, 2, 8); px(c, 4, 4, ink, 1, 1); px(c, 4, 10, ink, 4, 1);     // 1
    px(c, 10, 3, ink, 5, 1); px(c, 14, 3, ink, 1, 8); px(c, 11, 6, ink, 4, 1); px(c, 10, 10, ink, 5, 1);   // 3
  });
  const threadTex = L.cvs(8, 16, (c) => { for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) px(c, x, y, ((x + y * 2) % 8) < 3 ? '#8a8270' : '#d8cfb4'); });

  // ---------- materials ----------
  const mWall = L.lam(L.rep(wallTex, 1, 1)), mWood = L.lam(woodTex), mCasing = L.lam(woodTex, 0xa87858);
  const mDoor = L.lam(doorTex), mDoorEdge = L.lam(null, 0x3a2016), mBrass = L.lam(null, 0xd0a850), mSteel = L.lam(null, 0xa8acb0);
  const mDark = L.lam(null, 0x141416), mSkull = L.lam(null, 0x2a2a2e, { flatShading: true }), mHall = L.basic(hallTex, 0.92);
  const tiled = (tex, m, w, h, tw, th) => { const t = L.rep(tex, w / tw, h / th); return m(t); };

  // ---------- room: walls, floor, ceiling ----------
  const WP = 0.62;   // wallpaper tile size (m)
  const wallPart = (x0, x1, y0, y1, z = 0) => {
    const w = x1 - x0, h = y1 - y0, g = new THREE.PlaneGeometry(w, h);
    const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * w) / WP, (y0 + uv.getY(i) * h) / WP);
    const t = L.rep(wallTex, 1, 1); const m = L.lam(t);
    return L.mesh(g, m, (x0 + x1) / 2, (y0 + y1) / 2, z, scene);
  };
  wallPart(-3.0, -0.45, 0, 2.7); wallPart(0.45, 3.2, 0, 2.7); wallPart(-0.45, 0.45, 2.05, 2.7);
  // left/right room walls (side view + wide shots)
  const sideWall = (x, ry) => { const p = L.plane(4, 2.7, tiled(wallTex, L.lam, 4, 2.7, WP, WP), x, 1.35, 2.0, scene, ry); return p; };
  sideWall(2.3, -Math.PI / 2); sideWall(-2.4, Math.PI / 2);
  const floor = L.plane(6, 6, tiled(floorTex, L.lam, 6, 6, 0.9, 0.9), 0, 0, 2.5, scene, 0, -Math.PI / 2);
  L.plane(6, 6, L.lam(null, 0x2a221c), 0, 2.7, 2.5, scene, 0, Math.PI / 2);
  // skirting board
  L.box(2.55, 0.08, 0.02, mWood, -1.73, 0.04, 0.01, scene); L.box(1.7, 0.08, 0.02, mWood, 1.4, 0.04, 0.01, scene);
  // reveal (jamb lining inside the 15 cm wall) + casing on the wall face
  const WT = 0.15;
  L.box(0.012, 2.05, WT, mWood, -0.456, 1.025, -WT / 2, scene); L.box(0.012, 2.05, WT, mWood, 0.456, 1.025, -WT / 2, scene);
  L.box(0.92, 0.012, WT, mWood, 0, 2.056, -WT / 2, scene);
  L.box(0.1, 2.15, 0.022, mCasing, -0.51, 1.075, 0.011, scene); L.box(0.1, 2.15, 0.022, mCasing, 0.51, 1.075, 0.011, scene);
  L.box(1.12, 0.1, 0.022, mCasing, 0, 2.11, 0.011, scene);
  // strike plate on the right reveal (13)
  const strike = L.box(0.004, 0.16, 0.026, mBrass, 0.449, 1.0, -0.035, scene);
  L.box(0.005, 0.03, 0.012, mDark, 0.448, 1.0, -0.035, scene);
  // hinges (14): barrel at the hinge gap, leaf plate on the casing
  const hinges = [];
  for (const hy of [1.72, 0.32]) {
    const bar = L.mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.11, 8), mBrass, -0.452, hy, 0.012, scene);
    const leaf = L.box(0.042, 0.1, 0.004, mBrass, -0.48, hy, 0.024, scene);
    hinges.push({ y: hy, bar, leaf });
  }

  // ---------- hallway behind the door (lit, teal) ----------
  const hall = new THREE.Group(); scene.add(hall);
  L.plane(3.0, 2.6, mHall, 0, 1.3, -2.4, hall);
  const graf = L.plane(1.3, 0.33, L.basic(grafTex, 0.92), 0.05, 2.05, -2.39, hall);
  L.plane(2.4, 2.6, mHall, -1.1, 1.3, -1.2, hall, Math.PI / 2); L.plane(2.4, 2.6, mHall, 1.1, 1.3, -1.2, hall, -Math.PI / 2);
  L.plane(2.2, 2.4, L.basic(null, 0x5a6058), 0, 0.001, -1.3, hall, 0, -Math.PI / 2);
  L.plane(2.2, 2.4, L.basic(null, 0xe8f0ec), 0, 2.6, -1.3, hall, 0, Math.PI / 2);
  L.plane(2.2, 2.4, mHall, 0, 1.3, -0.16, hall, Math.PI);   // back face of the wall (seen from the hall)
  const lamp = L.box(0.5, 0.04, 0.2, L.basic(null, 0xffffff), 0, 2.57, -1.2, hall);

  // ---------- the door leaf (pivot = hinge line) ----------
  const door = new THREE.Group(); door.position.set(-0.45, 0, -0.012); scene.add(door);
  const leaf = L.box(0.9, 2.04, 0.055, [mDoorEdge, mDoorEdge, mDoorEdge, mDoorEdge, mDoor, L.lam(doorTex, 0.8)], 0.45, 1.02, -0.0275, door);
  const plate = L.plane(0.1, 0.07, L.lam(plateTex), 0.45, 1.68, 0.003, door);
  // lever handle + rose (right side), thumb-turn above it
  const HX = 0.82;   // in door space (x from the hinge)
  const handle = new THREE.Group(); door.add(handle);
  L.box(0.045, 0.16, 0.012, mSteel, HX, 0, 0.006, handle);
  const lever = L.box(0.13, 0.022, 0.024, mSteel, HX - 0.055, 0.02, 0.05, handle);
  L.box(0.022, 0.022, 0.04, mSteel, HX, 0.02, 0.03, handle);
  const turnRose = L.mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 10), mSteel, HX, 0.15, 0.005, handle); turnRose.rotation.x = Math.PI / 2;
  const turn = new THREE.Group(); turn.position.set(HX, 0.15, 0.016); handle.add(turn);
  L.box(0.012, 0.042, 0.016, L.lam(null, 0xc8ccd0), 0, 0, 0, turn);

  // ---------- skulls on the wall, right of the door ----------
  function skull(x, y, s, ry = 0) {
    const g = new THREE.Group(); g.position.set(x, y, 0.07 * s); g.rotation.y = ry; g.scale.setScalar(s); scene.add(g);
    const cr = L.mesh(new THREE.IcosahedronGeometry(0.1, 1), mSkull, 0, 0.02, 0, g); cr.scale.set(0.9, 1.0, 0.85);
    L.box(0.13, 0.07, 0.11, mSkull, 0, -0.07, 0.015, g);
    L.box(0.035, 0.03, 0.02, mDark, -0.035, -0.0, 0.085, g); L.box(0.035, 0.03, 0.02, mDark, 0.035, -0.0, 0.085, g);
    L.box(0.015, 0.02, 0.02, mDark, 0, -0.045, 0.085, g); L.box(0.08, 0.008, 0.02, mDark, 0, -0.085, 0.077, g);
    return g;
  }
  skull(0.84, 1.72, 1.0); skull(0.80, 1.33, 0.85, -0.15);

  // ---------- shelf with jars (right) + blue couch (front right) ----------
  const shelf = new THREE.Group(); shelf.position.set(1.55, 0, 0.2); scene.add(shelf);
  const mShelf = L.lam(woodTex, 0x6a4a34);
  L.box(0.6, 1.9, 0.02, mShelf, 0, 0.95, -0.17, shelf); L.box(0.02, 1.9, 0.36, mShelf, -0.3, 0.95, 0, shelf); L.box(0.02, 1.9, 0.36, mShelf, 0.3, 0.95, 0, shelf);
  for (let k = 0; k < 5; k++) {
    const sy = 0.08 + k * 0.42; L.box(0.6, 0.02, 0.36, mShelf, 0, sy, 0, shelf);
    for (let j = 0; j < 4; j++) {
      const jh = 0.1 + R() * 0.08, jar = L.mesh(new THREE.CylinderGeometry(0.045, 0.045, jh, 7), L.lam(null, [0x9ab070, 0xc0a060, 0x8a3a2a, 0xd0c8a0][(k + j) % 4]), -0.21 + j * 0.14, sy + 0.01 + jh / 2, 0.02 + R() * 0.06, shelf);
      L.box(0.07, 0.03, 0.01, L.lam(null, 0x3a6a30), 0, 0, 0.045, jar);
    }
  }
  const couch = new THREE.Group(); couch.position.set(1.0, 0, 2.3); scene.add(couch);
  const mCouch = L.lam(null, 0x2a4a9a);
  L.box(1.9, 0.42, 0.85, mCouch, 0, 0.21, 0, couch); L.box(1.9, 0.45, 0.2, mCouch, 0, 0.6, 0.33, couch);
  L.box(0.2, 0.25, 0.85, mCouch, -0.95, 0.55, 0, couch); L.box(0.2, 0.25, 0.85, mCouch, 0.95, 0.55, 0, couch);

  // ---------- steel bar (pry/wedge bar): origin at the TOP end, runs along -Y ----------
  function makeBar(len) {
    const g = new THREE.Group();
    const sh = L.mesh(new THREE.CylinderGeometry(0.014, 0.014, len, 6), L.lam(null, 0x8c949c), 0, -len / 2, 0, g);
    L.box(0.07, 0.022, 0.03, L.lam(null, 0x70787e), 0, -0.005, 0, g);                                   // flat fork head
    L.mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.05, 7), L.lam(null, 0x1a1a1a), 0, -len + 0.025, 0, g); // rubber foot
    return g;
  }

  // ---------- Ava ----------
  const ch = L.hero(); scene.add(ch.root);
  const mouthAt = (t, base) => { const c = TL.mouth[Math.floor(t * 15 + 1e-6)]; return c === 'A' ? 'talkA' : c === 'O' ? 'talkO' : base; };
  const RL = {};
  let READY = 'pistol_ready';
  try { ch.pose(0, L.still('pistol_ready', 0)); } catch (e) { READY = 'idle'; /* TODO: pistol_ready missing in the GLB */ }
  // pistol (RE-style retro handgun), normalised to 0.2 m, origin at the grip
  const pg = await L.loadModel('models/pistol-retro.glb');
  const pistolRaw = L.ps1Clone(pg.scene, { lit: true });
  const pistol = new THREE.Group(); pistol.add(pistolRaw);
  { const b = new THREE.Box3().setFromObject(pistolRaw), s = b.getSize(V()), k = 0.2 / Math.max(s.x, s.y, s.z); pistolRaw.scale.multiplyScalar(k); const b2 = new THREE.Box3().setFromObject(pistolRaw), c = b2.getCenter(V()); pistolRaw.position.sub(c); }
  {   // grip in her right fist, muzzle forward-down: solve the hand-local transform from the gun's own parts
    pistol.updateMatrixWorld(true);
    const part = (n) => { const o = pistol.getObjectByName(n); return new THREE.Box3().setFromObject(o).getCenter(V()); };
    const mag = part('Pistol_magazine'), slide = part('Pistol_toppart'), m0 = pistol.getObjectByName('Pistol_magazine').matrixWorld;
    const fwdG = V(-1, 0, 0).transformDirection(m0), upG = V(0, 0, -1).transformDirection(m0);
    const grip = mag.clone().lerp(slide, 0.22);
    {   // recarga (plano 01): desplazamientos en el espacio local de cada pieza (corredera atras, cargador cae por la culata)
      const loc = (o, p0, d) => { const a0 = o.parent.worldToLocal(p0.clone()), a1 = o.parent.worldToLocal(p0.clone().add(d)); return a1.sub(a0); };
      const so = pistol.getObjectByName('Pistol_toppart'), mo = pistol.getObjectByName('Pistol_magazine');
      RL.slide = so; RL.slide0 = so.position.clone(); RL.slideD = loc(so, slide, fwdG.clone().multiplyScalar(-0.035));
      RL.mag = mo; RL.mag0 = mo.position.clone(); RL.magD = loc(mo, mag, upG.clone().multiplyScalar(-1));
    }
    ch.root.position.set(0.3, 0, 0.62); ch.root.rotation.y = 0; ch.pose(0, L.still(READY, 0.4)); ch.root.updateMatrixWorld(true);
    const fwdW = V(-0.75, -0.5, 0.75).normalize(), upW = V(0, 1, 0).sub(fwdW.clone().multiplyScalar(fwdW.y)).normalize();
    const basis = (f, u) => new THREE.Matrix4().makeBasis(f, u, f.clone().cross(u));
    const Rm = basis(fwdW, upW).multiply(basis(fwdG, upG).transpose());
    const q = new THREE.Quaternion().setFromRotationMatrix(Rm);
    const palm = ch.hand('R').localToWorld(V(0, 0.55, 0.15));
    const pos = palm.clone().sub(grip.clone().applyQuaternion(q));
    const mW = new THREE.Matrix4().compose(pos, q, V(1, 1, 1));
    ch.hand('R').add(pistol); ch.hand('R').matrixWorld.clone().invert().multiply(mW).decompose(pistol.position, pistol.quaternion, pistol.scale);
  }
  {   // cargador nuevo en la mano izq: misma pieza, transform tomado en el frame en que entra en la culata (f30 de 'reload')
    ch.pose(0, L.still('reload', 29 / 30)); ch.root.updateMatrixWorld(true);
    RL.held = RL.mag.clone(); ch.hand('L').add(RL.held);
    ch.hand('L').matrixWorld.clone().invert().multiply(RL.mag.matrixWorld).decompose(RL.held.position, RL.held.quaternion, RL.held.scale);
    RL.held.visible = false;
  }
  function reloadProps(lt) {   // tiempos = frames de la accion 'reload' (anim/build_anim.py A_reload)
    const q = L.q15(lt), f = q * 30 + 1;
    RL.mag.position.copy(RL.mag0); RL.mag.visible = true; RL.held.visible = false; RL.slide.position.copy(RL.slide0);
    // sin cargador visible (usuario: atravesaba la pistola); la recarga se cuenta con la mano, la corredera y los SFX
    const k = f < 36 ? 0 : f < 40 ? (f - 36) / 4 : f < 42 ? 1 - (f - 40) / 2 : 0;
    RL.slide.position.addScaledVector(RL.slideD, Math.max(0, k));
  }

  // ---------- wedge geometry (17/19) from Ava's push pose: L hand grips the bar top under the lever, R palm on the door ----------
  const PUSH = ['push_heavy', 0.7], PUSH0 = ['push_heavy', 0.1];
  const hw = (side) => ch.hand(side).localToWorld(V(0, 0.75, 0));   // palm centre
  ch.root.position.set(0, 0, 0); ch.root.rotation.y = Math.PI; ch.pose(0, L.still(...PUSH)); ch.root.updateMatrixWorld(true);
  const hL0 = hw('L'), hR0 = hw('R');
  const T = V(0.3, 0, 0.045);    // bar top: just under the lever, in front of the door face (x set below)
  T.y = hL0.y + 0.04;
  const WEDGE_ROOT = V(T.x - hL0.x, 0, T.z + 0.035 - hL0.z);
  const LEVER_Y = T.y + 0.035;                  // lever height follows her grip (~1.0 m)
  handle.position.set(0, LEVER_Y - 0.02, 0);
  const FOOT = V(T.x - 0.42, 0, T.z + 0.62), BARLEN = T.distanceTo(FOOT);
  const barWorld = makeBar(BARLEN); scene.add(barWorld);
  const wedgeQ = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), FOOT.clone().sub(T).normalize());
  // the same bar rigid in her left hand (hand-local transform computed at the final pose)
  ch.root.position.copy(WEDGE_ROOT); ch.root.updateMatrixWorld(true);
  const barHand = makeBar(BARLEN); ch.hand('L').add(barHand);
  { const mW = new THREE.Matrix4().compose(T, wedgeQ, V(1, 1, 1)); const inv = ch.hand('L').matrixWorld.clone().invert(); inv.multiply(mW).decompose(barHand.position, barHand.quaternion, barHand.scale); }
  const hR1 = hw('R');
  const LEAN = { p: V(1.02, 1.12, 0.03), q: new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), V(0.05, -1.12, 0.36).normalize()) };

  // ---------- gloved hand for 02 (her sleeve: brown leather, black fingerless glove) ----------
  const arm = new THREE.Group(); scene.add(arm);
  const mSleeve = L.lam(null, 0x5a3424), mGlove = L.lam(null, 0x161414), mSkin = L.lam(null, 0xe8c0a0);
  L.box(0.5, 0.085, 0.085, mSleeve, -0.3, 0, 0, arm);            // forearm along -x from the wrist
  L.box(0.04, 0.095, 0.095, L.lam(null, 0x40241a), -0.055, 0, 0, arm); // cuff
  const fist = new THREE.Group(); arm.add(fist);
  L.box(0.085, 0.08, 0.06, mGlove, 0.02, 0, 0, fist);
  for (let k = 0; k < 3; k++) L.box(0.035, 0.016, 0.05, mSkin, 0.075, 0.025 - k * 0.02, 0.0, fist);   // curled fingers
  L.box(0.05, 0.018, 0.02, mSkin, 0.065, 0.03, 0.03, fist);                                          // thumb
  L.box(0.04, 0.016, 0.018, mSkin, 0.08, 0.045, 0.012, fist);                                         // index tip (pinches the turn)

  // ---------- screws for 13/14: origin at the TIP, axis +Y toward the head ----------
  function makeScrew(len) {
    const g = new THREE.Group(), spin = new THREE.Group(); g.add(spin);
    const t = L.rep(threadTex, 2, len / 0.012);
    L.mesh(new THREE.CylinderGeometry(0.0032, 0.0032, len - 0.008, 8), L.lam(t), 0, 0.008 + (len - 0.008) / 2, 0, spin);
    L.mesh(new THREE.ConeGeometry(0.0032, 0.008, 8), L.lam(null, 0xd0c8b0), 0, 0.004, 0, spin).rotation.x = Math.PI;
    L.mesh(new THREE.CylinderGeometry(0.0068, 0.0045, 0.004, 10), L.lam(null, 0xd8d0b8), 0, len + 0.002, 0, spin);
    L.box(0.011, 0.0012, 0.0016, mDark, 0, len + 0.0042, 0, spin); L.box(0.0016, 0.0012, 0.011, mDark, 0, len + 0.0042, 0, spin);
    return { g, spin };
  }
  const SL = 0.076;
  const screwA = makeScrew(SL); scene.add(screwA.g); screwA.g.rotation.z = Math.PI / 2;          // lock: drives +x into the reveal
  const screwB = makeScrew(SL); scene.add(screwB.g); screwB.g.rotation.x = Math.PI / 2;          // hinge: drives -z into the casing

  // ---------- zombies (city-zombie, recoloured: red plaid shirt, blue jeans, pale skin) ----------
  const zg = await L.loadModel('models/city-zombie.glb');
  const zTex = L.cvs(32, 64, (c) => {
    const r = L.rng(31);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {            // top half: red plaid
      const sx = x % 8 < 2, sy = y % 8 < 2, th = x % 8 === 5 || y % 8 === 5;
      let col = sx && sy ? [60, 10, 10] : sx || sy ? [110, 18, 16] : th ? [210, 110, 90] : [176, 38, 30];
      const n = r() * 16 - 8; px(c, x, y, `rgb(${col[0] + n},${col[1] + n / 2},${col[2] + n / 2})`);
    }
    for (let y = 32; y < 64; y++) for (let x = 0; x < 32; x++) { const n = r() * 18 - 9 + (x % 16 === 0 ? -18 : 0); px(c, x, y, `rgb(${58 + n},${84 + n},${138 + n})`); }
    for (let k = 0; k < 7; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), '#5a0a08', 2 + Math.floor(r() * 3), 2 + Math.floor(r() * 3));
  });
  zTex.wrapS = THREE.RepeatWrapping; zTex.wrapT = THREE.ClampToEdgeWrapping;
  const skinTex = L.cvs(32, 32, (c) => {
    const r = L.rng(33);
    for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = r() * 20 - 10; px(c, x, y, `rgb(${138 + n},${150 + n},${152 + n})`); }
    for (let k = 0; k < 14; k++) px(c, Math.floor(r() * 30), Math.floor(r() * 30), r() < 0.5 ? '#6a7064' : '#7a1210', 1 + Math.floor(r() * 3), 1 + Math.floor(r() * 3));
  });
  const skinT = L.rep(skinTex, 1, 1);
  zg.scene.traverse((o) => {
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    o.material = n.includes('Outfit') ? L.lam(zTex) : n.includes('Body') ? L.lam(skinT) : L.lam(null, 0x8a2a20);
    o.material.side = THREE.DoubleSide; o.frustumCulled = false;
  });
  const fixRoot = (clip) => {   // drop root motion (hips x/z) so we place the zombie ourselves
    const c = clip.clone();
    for (const tr of c.tracks) if (/Hips\.position$/.test(tr.name)) { const v = tr.values; for (let i = 0; i < v.length; i += 3) { v[i] = v[0]; v[i + 2] = v[2]; } }
    return c;
  };
  const ZC = Object.fromEntries(zg.animations.map((c) => [c.name, fixRoot(c)]));
  function zombie() {
    const root = SkeletonUtils.clone(zg.scene), wrap = new THREE.Group(); wrap.add(root); scene.add(wrap);
    const sh = L.mesh(new THREE.CircleGeometry(0.32, 10), L.basic(null, 0x101014, { transparent: true, opacity: 0.55, depthWrite: false }), 0, 0.012, 0, wrap); sh.rotation.x = -Math.PI / 2;
    const mixer = new THREE.AnimationMixer(root), acts = {};
    const act = (n) => acts[n] || (acts[n] = (() => { const a = mixer.clipAction(ZC[n]); a.play(); a.setEffectiveWeight(0); return a; })());
    function pose(list) {   // list: [[clip, time, weight], ...]
      for (const a of Object.values(acts)) a.setEffectiveWeight(0);
      for (const [n, t, w] of list) { const a = act(n); a.time = ((t % ZC[n].duration) + ZC[n].duration) % ZC[n].duration; a.setEffectiveWeight(w); }
      mixer.update(0);
    }
    return { wrap, root, pose };
  }
  const zA = zombie(), zB = zombie();
  // splinters from the latch-side jamb
  const splint = []; for (let k = 0; k < 9; k++) { const s = L.box(0.012 + R() * 0.02, 0.06 + R() * 0.12, 0.012, L.lam(woodTex, 0xe0b080), 0, 0, 0, scene); splint.push({ s, v: V(-0.6 + R() * 1.4, 0.2 + R() * 1.6, 1.2 + R() * 1.6), y0: 0.85 + R() * 0.35, w: V(R() * 12, R() * 12, R() * 12) }); }

  // ---------- state ----------
  function setState({ doorA = 0, hallOn = 0, bar = 'lean', hero = false, pistolOn = false, zombies = false, couchOn = true, screws = '' } = {}) {
    door.rotation.y = doorA; hall.visible = doorA !== 0; hallLight.intensity = hallOn;
    barWorld.visible = bar === 'lean' || bar === 'wedge'; barHand.visible = bar === 'hand';
    if (bar === 'lean') { barWorld.position.copy(LEAN.p); barWorld.quaternion.copy(LEAN.q); }
    if (bar === 'wedge') { barWorld.position.copy(T); barWorld.quaternion.copy(wedgeQ); }
    ch.root.visible = hero; pistol.visible = pistolOn; arm.visible = false;
    zA.wrap.visible = zB.wrap.visible = zombies; for (const p of splint) p.s.visible = false;
    couch.visible = couchOn; screwA.g.visible = screws === 'A'; screwB.g.visible = screws === 'B';
    turn.rotation.z = 0; handle.rotation.z = 0;
  }
  // zombis empujando la puerta (pedido del usuario, como Learn with Alya): golpes en tiempos globales = THUMPS (mix.py pone un golpe en cada uno)
  // la hoja cede un poco hacia dentro y rebota, la manilla tiembla, la camara vibra; k = fuerza (con la barra puesta cede menos)
  const THUMPS = [8.82, 9.25, 9.55, 9.85, 10.05, 29.35, 29.95, 30.7, 31.35, 32.35, 33.0, 33.7, 38.1, 38.55, 39.05];
  function rattle(t, k, c) {
    let a = 0;
    for (const t0 of THUMPS) { const d = t - t0; if (d >= 0 && d < 0.6) a += Math.exp(-d * 9) * Math.cos(d * 55); }
    door.rotation.y += -0.025 * k * a; handle.rotation.z = 0.12 * k * a;
    // sin vibracion de camara: el usuario quiere que tiemble solo la puerta, no Ava
    return a;
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov, LW / LH, 0.02, 60);
  const look = (c, p, t) => { c.position.copy(p); c.lookAt(t); };
  const vignette = (o, k = 0.5) => {
    const c = o.tctx, g = c.createRadialGradient(LW / 2, LH * 0.45, LH * 0.25, LW / 2, LH * 0.45, LH * 0.62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${k})`); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
  };
  const ov = (k) => (lt, dt, a, o) => vignette(o, k);
  const out = {};

  // 01 (0-2.0): medium shot, Ava with the pistol at low ready in front of the door, talking
  { const c = cam(50);
    out['01_hero'] = { scene, camera: c, overlay: ov(0.55), update(lt, t) {
      setState({ hero: true, pistolOn: true });
      ch.root.position.set(0.3, 0, 0.62); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('reload', 0)], [[-99, lt > 1.62 && lt < 1.76 ? 'blink' : lt > 0.27 && lt < 1.45 ? 'angry' : 'open', mouthAt(t, 'neutral')]]); reloadProps(lt);
      look(c, V(0.36, 1.3, 2.5 - lt * 0.04), V(0.3, 1.12, 0));
    } };
  }
  // 02 (2.0-3.7, + 03 flash to 4.0): close-up of the lock side; her gloved hand comes in from the right and turns the lock on "lock"
  { const c = cam(46);
    out['02_lock'] = { scene, camera: c, overlay: ov(0.6), update(lt, t) {
      setState({ couchOn: false });
      const tip = V(0.37 + 0.0, LEVER_Y + 0.13 - 0.02, 0.05);     // fingertips at the thumb-turn
      const k = L.smooth((lt - 0.02) / 0.24), tw = L.smooth((lt - 0.27) / 0.2);
      arm.visible = true;
      const from = V(0.78, LEVER_Y - 0.3, 0.42), p = from.clone().lerp(tip, k);
      p.y += Math.sin(Math.min(1, k) * Math.PI) * 0.04;
      arm.position.copy(p).add(V(0.075, -0.035, 0.03));
      arm.quaternion.setFromUnitVectors(V(1, 0, 0), V(-0.62, 0.42, -0.35).normalize()); fist.rotation.x = -1.2 * tw;
      turn.rotation.z = -Math.PI / 2 * tw;
      look(c, V(0.38, LEVER_Y + 0.14, 1.0), V(0.42, LEVER_Y + 0.1, 0));
    } };
  }
  // 05 (8.7-10.2): wide frontal of the closed door, very slow push-in
  { const c = cam(50);
    out['05_door_wide'] = { scene, camera: c, overlay: ov(0.55), update(lt) {
      setState({ bar: 'lean' });
      look(c, V(0.05, 1.22, 3.35 - lt * 0.14), V(0.02, 1.12, 0)); rattle(8.7 + lt, 1.0, c);
    } };
  }
  // 06 (10.2-11.0): the door bursts in, hall light, "DO NOT ENTER", a zombie stumbles at camera (frozen at lt 0.78 under YOU DIED)
  { const c = cam(52);
    out['06_breach'] = { scene, camera: c, overlay: ov(0.5), update(lt) {
      const k = L.clamp01(lt / 0.2), a = -1.32 * (1 - Math.pow(1 - k, 3)) + (lt > 0.2 ? 0.1 * Math.sin((lt - 0.2) * 22) * Math.exp(-(lt - 0.2) * 7) : 0);
      setState({ doorA: a, hallOn: 2.2 * k, bar: 'lean', zombies: true, couchOn: false });
      for (const p of splint) {
        if (lt < 0.03) continue; const u = lt - 0.03; p.s.visible = true;
        p.s.position.set(0.47 + p.v.x * u * 0.6, Math.max(0.02, p.y0 + p.v.y * u - 4.9 * u * u), 0.02 + p.v.z * u * 0.7);
        p.s.rotation.set(p.w.x * u, p.w.y * u, p.w.z * u);
      }
      const zk = L.smooth(lt / 0.8);
      zA.wrap.position.set(0.08 - 0.06 * zk, 0, -1.0 + 2.25 * L.clamp01(lt / 0.8)); zA.wrap.rotation.y = 0.05;
      const att = L.smooth((lt - 0.38) / 0.3);
      zA.pose([['Walking', 0.35 + lt * 1.5, 1 - att], ['Zombie_Attack', 1.1 + (lt - 0.38) * 1.6, att]]);
      zB.wrap.position.set(0.32, 0, -2.0 + 1.3 * lt); zB.wrap.rotation.y = -0.1;
      zB.pose([['Walking', 0.9 + lt * 1.3, 1]]);
      look(c, V(0.08, 1.32, 2.7), V(0.06, 1.22, 0));
    } };
  }
  // 13 (23.8-25.0): close-up of the strike plate on the jamb (door open), a 3" screw spins in on "the lock"
  { const c = cam(44);
    out['13_lock_screw'] = { scene, camera: c, overlay: ov(0.5), update(lt) {
      setState({ doorA: -1.45, hallOn: 0.6, bar: null, couchOn: false, screws: 'A' });
      const d = L.smooth((lt - 0.15) / 0.75) * (SL - 0.002);
      screwA.g.position.set(0.447 + d, 1.035, -0.035);
      screwA.spin.rotation.y = -d / 0.0025;
      look(c, V(0.24, 1.07, 0.2), V(0.45, 1.03, -0.04));
    } };
  }
  // 14 (25.0-26.0): close-up of the upper hinge, a screw spins into the leaf on "hinges"; flashes white into 15
  { const c = cam(40);
    out['14_hinges'] = { scene, camera: c, update(lt) {
      setState({ bar: null, couchOn: false, screws: 'B' });
      const d = L.smooth((lt - 0.05) / 0.6) * (SL - 0.001);
      screwB.g.position.set(-0.48, 1.745, 0.026 - d);
      screwB.spin.rotation.y = d / 0.0025;
      look(c, V(-0.44, 1.73, 0.42), V(-0.455, 1.72, 0));
    }, overlay(lt, dt, a, o) { vignette(o, 0.5); if (lt > 0.8) { o.tctx.fillStyle = `rgba(250,248,244,${L.smooth((lt - 0.8) / 0.2) * 0.9})`; o.tctx.fillRect(0, 0, LW, LH); } } };
  }
  // 16 (29.1-32.0): medium frontal, hands on hips, smug
  { const c = cam(46);
    out['16_house'] = { scene, camera: c, overlay: ov(0.55), update(lt, t) {
      setState({ hero: true, bar: 'lean' });
      ch.root.position.set(0.12, 0, 0.6); ch.root.rotation.y = 0;
      ch.pose(lt, [L.seg('hands_on_hips', 0, { from: 0.6, speed: 0.4 })], [[-99, lt > 2.2 && lt < 2.32 ? 'blink' : 'open', mouthAt(t, 'smile')]]);
      look(c, V(0.12, 1.3, 2.25 - lt * 0.05), V(0.1, 1.18, 0)); c.updateMatrixWorld(); ch.lookAt(c, 1, 40); rattle(t, 0.6, c);   // usuario: mirando a camara; zombis empujan
    } };
  }
  // 17 (32.0-34.6): side view, she jams the bar under the handle (L hand on the bar top, R palm on the door)
  { const c = cam(50);
    out['17_wedge'] = { scene, camera: c, overlay: ov(0.55), update(lt, t) {
      setState({ hero: true, bar: 'hand', couchOn: false });
      ch.root.position.copy(WEDGE_ROOT); ch.root.rotation.y = Math.PI;
      ch.pose(lt, [L.seg('lift_bar', 0, { from: 0.3, speed: 0.15 }), L.seg(PUSH[0], 0.3, { from: PUSH[1] - 0.25, speed: 0.33, fade: 0.55 }), L.seg(PUSH[0], 1.05, { from: PUSH[1], speed: 0 })],
        [[-99, 'angry', mouthAt(t, 'neutral')]]);
      look(c, V(-1.55, 1.25, 2.05), V(0.3, 0.9, 0.25)); rattle(t, 0.35, c);
    } };
  }
  // 19 (38.0-39.6): the door with the bar wedged, still
  { const c = cam(48);
    out['19_congrats'] = { scene, camera: c, overlay: ov(0.55), update(lt) {
      setState({ bar: 'wedge' });
      look(c, V(0.16, 1.18, 2.6), V(0.12, 1.08, 0)); const a = rattle(38.0 + lt, 0.45, c);
      barWorld.position.copy(T).add(V(0, 0, 0.004 * a));   // la barra aguanta y se clava
    } };
  }
  return out;
}

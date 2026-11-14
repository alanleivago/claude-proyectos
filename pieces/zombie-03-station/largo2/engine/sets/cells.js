// sets/cells.js — the back hall with the four holding cells (chapter 1:10 AM). Cell 3 holds a turned prisoner (orange
// jumpsuit, grey skin: city-zombie recoloured). Shots: 48b_cells_hall (long corridor, fixed high at the far end, Ava small
// at the entrance sweeping the flashlight over the bars), 48c_cell3 (bars of cell 3 + plate '3' in the foreground, the beam
// finds him on "three"), 48d_prisoner (low dramatic angle, he slams the bars — only the bars rattle), 48d2_died (fake-out:
// Ava walks up to the bars on c3b, on "end" he grabs her -> red freeze + YOU DIED through the pause), 48f_rule5 (fixed high
// corner at the entrance, RULE 5 label on "back"), 48g_clover_door (Ava walks to the end door; close-up of the CLOVER lock
// on "clover", she rattles the handle on "open" — only the door rattles). Contract: SETS.md.
// World: corridor x [-1, 1], z from 2.5 (entrance) to -10.2 (end wall + clover door, x [-0.5, 0.5]); ceiling 2.8. Cells on
// the left (x -3.6..-1, bars at x = -1), centres z = 0.6, -1.8, -4.2, -6.6 (2.4 m each).
import { kit, walker } from './r2kit.js';

const CZ = [0.6, -1.8, -4.2, -6.6];   // cell centres (z)
function CLtimes(ctx) {
  const { T, at } = ctx;
  const r = {
    t48b: T['48b_cells_hall'], t48c: T['48c_cell3'], t48d: T['48d_prisoner'], t48d2: T['48d2_died'], end48d2: T['48e_steel'],
    t48f: T['48f_rule5'], t48g: T['48g_clover_door'], end48g: T['card_c0135'],
    sweep: at('c1', 'sweep'), three: at('c2', 'three'), empty: at('c2', 'empty'),
    walkW: at('c3b', 'walk'), bars: at('c3b', 'bars'), look: at('c3b', 'look'), end: at('c3c', 'end'),
    rule: at('c5', 'rule'), five: at('c5', 'five'), nobody: at('c6', 'nobody'), back: at('c6', 'back'), hall: at('c6', 'hall'),
    clover: at('c7', 'clover'), lock: at('c7', 'lock'), wont: at('c7', 'won'), open: at('c7', 'open'),
  };
  r.hits48d = [at('c3', 'orange'), at('c3', 'skin'), at('c3', 'before'), at('c3', 'him')];
  r.walk48b = walker([[0.15, 2.4], [0.0, 0.6]], r.t48b + 0.1, 0.75);
  r.walk48d2 = walker([[0.55, -2.55], [-0.5, -4.05]], r.walkW - 0.1, 0.95);
  r.grab = r.end + 0.02;               // he hits the bars + grabs
  r.freeze = r.end + 0.3;              // the picture freezes red, YOU DIED
  r.walk48f = walker([[-0.2, -3.2], [0.15, -0.3]], r.t48f - 0.5, 1.25);
  r.slam48f = r.hall;
  r.walk48g = walker([[0.35, -6.2], [0.25, -9.38]], r.t48g - 0.2, 1.2);
  r.reach48g = r.walk48g.t1 + 0.02;    // turn_key: hand on the handle from clip 0.35
  return r;
}

export function sfx(ctx) {
  const r = CLtimes(ctx), out = [];
  // 48b
  out.push([r.t48b, 'cells_room_tone'], [r.t48b + 0.08, 'flashlight_click'], [r.sweep, 'flashlight_sweep_whoosh']);
  out.push(...r.walk48b.steps('step_walk', r.t48b, r.t48c));
  // 48c: the beam lands on him, low growl when he stirs
  out.push([r.three, 'flashlight_rattle'], [r.empty, 'prisoner_growl']);
  // 48d: four slams, only the bars ring
  for (const h of r.hits48d) out.push([h - 0.22, 'prisoner_growl'], [h, 'bars_rattle'], [h + 0.01, 'body_hit_bars']);
  // 48d2
  out.push(...r.walk48d2.steps('step_walk', r.t48d2, r.end));
  out.push([r.look, 'heartbeat_soft'], [r.grab - 0.2, 'prisoner_scream'], [r.grab, 'bars_rattle'], [r.grab + 0.12, 'grab_cloth'], [r.freeze, 'you_died_sting']);
  // 48f
  out.push(...r.walk48f.steps('step_walk', r.t48f, r.t48g));
  out.push([r.rule, 'label'], [r.slam48f - 0.15, 'prisoner_growl_far'], [r.slam48f, 'bars_rattle_far']);
  // 48g
  out.push(...r.walk48g.steps('step_walk', r.t48g, r.end48g));
  out.push([r.clover, 'label'], [r.reach48g + 0.33, 'door_handle_grab'], [r.open, 'door_handle_rattle'], [r.open + 0.02, 'door_locked_rattle']);
  return out.sort((a, b) => a[0] - b[0]);
}

export async function shots(ctx) {
  const { L } = ctx;
  const K = kit(ctx), { THREE, LW, LH, V, px, rgb, B, cyl, lam, basic, DS, mouthAt, cam, look, vignette, label, pop } = K;
  const r = CLtimes(ctx);

  // ---------- textures ----------
  const tWallC = L.rep(K.tBlock(3101, '#6a6a5e', '#bdb8a2', 24), 1.5, 1.6);
  const tWallH = L.rep(K.tBlock(3102, '#4e5c6a', '#c8c4b4', 24), 6, 1.6);
  const tFloor = L.rep(K.tConcrete(3103, [150, 148, 140]), 2, 12);
  const tFloorC = L.rep(K.tConcrete(3104, [132, 128, 120]), 1, 1);
  const tMatt = L.cvs(16, 32, (c) => { const rr = L.rng(3105); for (let y = 0; y < 32; y++) for (let x = 0; x < 16; x++) { const st = (x >> 2) & 1; px(c, x, y, st ? rgb(140 + rr() * 10, 150, 160) : rgb(110 + rr() * 10, 118, 128)); } px(c, 0, 0, '#5a5e64', 16, 1); });
  const tBlanket = L.cvs(16, 16, (c) => { const rr = L.rng(3106); for (let i = 0; i < 256; i++) px(c, i % 16, i >> 4, rgb(96 + rr() * 16, 84 + rr() * 12, 70)); px(c, 0, 3, '#4a4036', 16, 1); });
  const tPlate = (n) => L.cvs(16, 16, (c) => { c.fillStyle = '#e8e4d8'; c.fillRect(0, 0, 16, 16); c.fillStyle = '#202020'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 15, 16, 1); c.fillRect(0, 0, 1, 16); c.fillRect(15, 0, 1, 16); c.font = 'bold 13px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), 8, 9); });
  const tSign = L.cvs(64, 16, (c) => { c.fillStyle = '#1a2a6a'; c.fillRect(0, 0, 64, 16); c.fillStyle = '#f0f0e8'; c.font = 'bold 9px Tahoma'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('HOLDING', 32, 8); });
  const tRules = L.cvs(32, 40, (c) => { c.fillStyle = '#ece8dc'; c.fillRect(0, 0, 32, 40); c.fillStyle = '#a01818'; c.fillRect(0, 0, 32, 7); c.fillStyle = '#fff'; c.font = 'bold 5px Tahoma'; c.textAlign = 'center'; c.fillText('NOTICE', 16, 5); c.fillStyle = '#404040'; for (let y = 10; y < 38; y += 3) c.fillRect(3, y, 22 + (y % 7), 1); });
  const tSkin = L.rep(L.cvs(32, 32, (c) => { const rr = L.rng(3107); for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) { const n = rr() * 20 - 10; px(c, x, y, rgb(132 + n, 142 + n, 140 + n)); }
    for (let k = 0; k < 14; k++) px(c, rr() * 30 | 0, rr() * 30 | 0, rr() < 0.5 ? '#5e665c' : '#6a1210', 1 + (rr() * 3 | 0), 1 + (rr() * 3 | 0)); }), 1, 1);
  const tSuit = L.cvs(32, 64, (c) => {   // orange county jumpsuit: shirt half (top 32 rows) + trousers half, seams, stains
    const rr = L.rng(3108);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = rr() * 18 - 9, seam = x % 16 === 0 || y === 31 || y === 32; px(c, x, y, seam ? rgb(150 + n, 60, 14) : rgb(226 + n, 104 + n * 0.6, 26)); }
    for (let k = 0; k < 9; k++) px(c, rr() * 30 | 0, rr() * 60 | 0, rr() < 0.5 ? '#6a1a0a' : '#7a4a20', 2 + (rr() * 3 | 0), 2 + (rr() * 3 | 0));
    c.fillStyle = '#2a1a10'; c.font = 'bold 5px Tahoma'; c.fillText('COUNTY', 8, 12);
  });
  tSuit.wrapS = THREE.RepeatWrapping; tSuit.wrapT = THREE.ClampToEdgeWrapping;
  const tLockPlate = L.cvs(32, 64, (c) => {   // brass escutcheon with a CLOVER engraved above the keyhole
    const rr = L.rng(3109);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = rr() * 16 - 8, g = Math.sin(y * 0.4) * 6; px(c, x, y, rgb(196 + n + g, 152 + n + g, 62 + n / 2)); }
    c.strokeStyle = '#6a4a14'; c.lineWidth = 1; c.strokeRect(1.5, 1.5, 29, 61);
    c.fillStyle = '#5a3a0e'; for (const [x, y] of [[4, 4], [27, 4], [4, 59], [27, 59]]) c.fillRect(x, y, 2, 2);
    // clover: four hearts + stem, engraved (dark groove + light edge)
    const leaf = (cx, cy, a) => { c.save(); c.translate(cx, cy); c.rotate(a); c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-6, -3, -6, -9, -2.5, -9.5); c.bezierCurveTo(-0.8, -9.8, 0, -8, 0, -7); c.bezierCurveTo(0, -8, 0.8, -9.8, 2.5, -9.5); c.bezierCurveTo(6, -9, 6, -3, 0, 0); c.restore(); };
    c.save(); c.translate(16, 22);
    for (let k = 0; k < 4; k++) { leaf(0, 0, k * Math.PI / 2 + Math.PI / 4); c.fillStyle = '#4a300a'; c.fill(); c.strokeStyle = '#f0d890'; c.stroke(); }
    c.strokeStyle = '#4a300a'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(3, 8, 7, 11); c.stroke(); c.restore();
    c.fillStyle = '#100a04'; c.beginPath(); c.arc(16, 44, 3, 0, 7); c.fill(); c.fillRect(15, 44, 2, 7);   // keyhole
  });
  const tDoorS = L.cvs(32, 64, (c) => { const rr = L.rng(3110); for (let y = 0; y < 64; y++) for (let x = 0; x < 32; x++) { const n = rr() * 10 - 5; px(c, x, y, rgb(70 + n, 82 + n, 78 + n)); }
    px(c, 0, 56, '#8a9090', 32, 8); for (let k = 0; k < 5; k++) px(c, 3, 8 + k * 9, '#5a6866', 26, 1); px(c, 2, 2, '#9a2a1a', 28, 5); c.fillStyle = '#f0e8d8'; c.font = 'bold 4px Tahoma'; c.fillText('NO ENTRY', 6, 6); });

  // ---------- the hall ----------
  const BG = 0x0c0e12;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 9, 20);
  scene.add(new THREE.HemisphereLight(0xb8c4d8, 0x5a5448, 1.9));   // lifted so the hall + bars read
  const HH = 2.8, ZE = 2.5, ZEND = -10.2;
  const LEN = ZE - ZEND, ZM = (ZE + ZEND) / 2;
  L.plane(2, LEN, lam(tFloor), 0, 0, ZM, scene, 0, -Math.PI / 2);
  L.plane(2, LEN, lam(null, 0x3a3c3e), 0, HH, ZM, scene, 0, Math.PI / 2);
  L.plane(LEN, HH, lam(tWallH), 1, HH / 2, ZM, scene, -Math.PI / 2);                     // right wall
  L.plane(LEN, 0.1, lam(null, 0x2a2c2a), 0.99, 0.05, ZM, scene, -Math.PI / 2);
  // left wall pieces above the cells + beyond them
  L.plane(LEN, HH - 2.35, lam(tWallH), -1, (HH + 2.35) / 2, ZM, scene, Math.PI / 2);
  L.plane(ZE - 1.8, 2.35, lam(tWallH), -1, 2.35 / 2, (ZE + 1.8) / 2, scene, Math.PI / 2);
  L.plane(-7.8 - ZEND, 2.35, lam(tWallH), -1, 2.35 / 2, (-7.8 + ZEND) / 2, scene, Math.PI / 2);
  // entrance wall with an open doorway (back to the station) and the end wall with the clover door
  { const m = lam(L.rep(K.tBlock(3111, '#4e5c6a', '#c8c4b4', 24), 1, 1.6));
    L.plane(0.55, HH, m, -0.72, HH / 2, ZE, scene, Math.PI); L.plane(0.55, HH, m, 0.72, HH / 2, ZE, scene, Math.PI); L.plane(0.9, HH - 2.1, m, 0, (HH + 2.1) / 2, ZE, scene, Math.PI);
    L.plane(0.9, 2.1, basic(null, 0x5a6470), 0, 1.05, ZE + 1.2, scene, Math.PI); L.plane(0.9, 1.2, lam(tFloor), 0, 0.001, ZE + 0.6, scene, 0, -Math.PI / 2); }
  L.plane(2, HH, lam(L.rep(K.tBlock(3112, '#4e5c6a', '#c8c4b4', 24), 1, 1.6)), 0, HH / 2, ZEND, scene);
  // fluorescents: four fixtures, the far one dead (dim)
  for (const [z, on] of [[1.2, 1], [-2.4, 1], [-6.0, 1], [-9.0, 0.6]]) {
    const f = K.fluor(scene, 0.1, HH - 0.03, z, 0.3, 1.2);
    if (on < 1) f.children[1].material = basic(null, 0x8a8e8a);
    const p = new THREE.PointLight(0xe8f0ff, 4.6 * on, 7, 1.2); p.position.set(0.1, 2.5, z); scene.add(p);
  }
  // right-wall details: pipe run, bench, extinguisher, HOLDING sign, notice
  { const mP = lam(null, 0x8a8478); const pipe = cyl(0.04, 0.04, LEN, 6, mP, 0.93, 2.45, ZM, scene); pipe.rotation.x = Math.PI / 2; const p2 = cyl(0.025, 0.025, LEN, 6, lam(null, 0xa04a2a), 0.94, 2.3, ZM, scene); p2.rotation.x = Math.PI / 2;
    B(0.4, 0.05, 1.6, lam(K.tWood(3113, '#7a5a3a')), 0.78, 0.45, -1.5, scene); for (const z of [-2.2, -0.8]) B(0.35, 0.45, 0.05, lam(null, 0x3a3c3e), 0.78, 0.22, z, scene);
    cyl(0.07, 0.07, 0.42, 8, lam(null, 0xb81a14), 0.88, 1.0, -4.9, scene); B(0.1, 0.06, 0.04, lam(null, 0x202020), 0.86, 1.25, -4.9, scene);
    L.plane(0.6, 0.15, lam(tSign), 0.99, 2.05, 1.6, scene, -Math.PI / 2); L.plane(0.32, 0.4, lam(tRules), 0.99, 1.5, -3.4, scene, -Math.PI / 2); }

  // ---------- the cells ----------
  const mBar = lam(K.tMetal(3114, '#7a8088')), mBarD = lam(null, 0x4a4e54);
  const barsOf = [];
  CZ.forEach((zc, n) => {
    const g = new THREE.Group(); g.position.set(0, 0, zc); scene.add(g);
    // floor, back wall, ceiling, partitions
    L.plane(2.6, 2.4, lam(tFloorC), -2.3, 0.002, 0, g, 0, -Math.PI / 2);
    L.plane(2.4, 2.35, lam(tWallC), -3.6, 2.35 / 2, 0, g, Math.PI / 2);
    L.plane(2.6, 2.4, lam(null, 0x3a3c3e), -2.3, 2.35, 0, g, 0, Math.PI / 2);
    for (const s of [-1, 1]) B(2.6, 2.35, 0.14, lam(tWallC), -2.3, 2.35 / 2, s * 1.2, g);
    // bunk (steel slab on the back wall) + mattress + blanket; steel toilet-sink in the back corner
    const zb = n === 2 ? 0.55 : -0.45;
    B(0.75, 0.06, 1.9, lam(K.tMetal(3115 + n, '#8a8e94')), -3.2, 0.45, zb, g); B(0.05, 0.45, 1.9, mBarD, -2.85, 0.22, zb, g);
    B(0.7, 0.08, 1.8, lam(tMatt), -3.2, 0.52, zb, g);
    B(0.66, 0.03, 0.8, lam(tBlanket), -3.18, 0.575, zb + (n % 2 ? 0.4 : -0.3), g).rotation.y = 0.15 * (n - 1.5);
    const zt = n === 2 ? -0.75 : 0.8, mSt = lam(K.tMetal(3120, '#b8bcc0'));
    B(0.4, 0.75, 0.5, mSt, -3.38, 0.375, zt, g); B(0.36, 0.05, 0.42, lam(null, 0x2a2c30), -3.3, 0.76, zt, g); B(0.42, 0.15, 0.55, mSt, -3.05, 0.4, zt, g);
    // bars: verticals every 13 cm, three flat bands, header + number plate
    const bars = new THREE.Group(); bars.position.set(-1.0, 0, 0); g.add(bars); barsOf.push(bars);
    const geoBar = new THREE.CylinderGeometry(0.018, 0.018, 2.3, 5);
    for (let k = 0; k < 18; k++) L.mesh(geoBar, mBar, 0, 1.15, -1.105 + k * 0.13, bars);
    for (const y of [0.06, 1.05, 2.2]) B(0.05, 0.05, 2.36, mBarD, 0, y, 0, bars);
    B(0.05, 2.3, 0.05, mBarD, 0, 1.15, -0.22, bars); B(0.05, 2.3, 0.05, mBarD, 0, 1.15, 0.62, bars);   // the door's stiles
    B(0.06, 0.12, 0.08, lam(null, 0x2a2c30), 0.01, 1.05, 0.55, bars);                               // lock box
    B(0.1, 0.12, 2.4, lam(K.tMetal(3121, '#5a5e64')), 0, 2.37, 0, g).position.x = -1.0;
    L.plane(0.2, 0.2, lam(tPlate(n + 1)), -0.94, 2.37, 0, g, Math.PI / 2);
    // cell light (caged bulb), dim, cells 1,2,4 on
    if (n !== 2) { const pl = new THREE.PointLight(0xffd8a0, 1.4, 3.2, 1.3); pl.position.set(-2.6, 2.2, 0); g.add(pl); }
  });
  const bars3 = barsOf[2];

  // ---------- the end door (clover lock) ----------
  const doorG = new THREE.Group(); doorG.position.set(0, 0, ZEND + 0.03); scene.add(doorG);
  const mFr = lam(K.tMetal(3122, '#3a4040'));
  B(0.08, 2.18, 0.12, mFr, -0.54, 1.09, 0, scene).position.z = ZEND + 0.02; B(0.08, 2.18, 0.12, mFr, 0.54, 1.09, 0, scene).position.z = ZEND + 0.02; B(1.16, 0.08, 0.12, mFr, 0, 2.18, ZEND + 0.02, scene);
  const doorLeaf = new THREE.Group(); doorG.add(doorLeaf);
  { const mE = lam(null, 0x4a5654);
    B(1.0, 2.12, 0.05, [mE, mE, mE, mE, lam(tDoorS), mE], 0, 1.06, 0, doorLeaf);
    L.plane(0.09, 0.18, lam(tLockPlate), 0.36, 1.12, 0.027, doorLeaf); }
  const handle = new THREE.Group(); handle.position.set(0.36, 1.0, 0.04); doorLeaf.add(handle);
  { const mH = lam(K.tMetal(3123, '#c8b060')); cyl(0.018, 0.018, 0.05, 6, mH, 0, 0, 0, handle).rotation.x = Math.PI / 2; B(0.13, 0.022, 0.025, mH, -0.06, 0, 0.03, handle); }

  // ---------- the prisoner (city-zombie, orange jumpsuit, grey skin) ----------
  const cityG = await L.loadModel('models/city-zombie.glb');
  cityG.scene.traverse((o) => {   // hall.js: no usable UVs -> planar UVs (shirt top half, trousers bottom half)
    if (!o.isMesh) return; const g = o.geometry, p = g.attributes.position, uv = new Float32Array(p.count * 2), n = o.material.name || '';
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      if (n.includes('Outfit')) { uv[i * 2] = (x * 0.8 + z * 0.9) * 3; uv[i * 2 + 1] = y > 0.97 ? 0.5 + Math.min(0.49, (y - 0.97) * 0.9) : Math.max(0.01, Math.min(0.48, (y - 0.25) * 0.66)); }
      else { uv[i * 2] = (x + z) * 4; uv[i * 2 + 1] = y * 4; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  });
  const zRoot = L.ps1Clone(cityG.scene);
  zRoot.traverse((o) => { if (!o.isMesh) return; const n = o.material.name || '';
    o.material = n.includes('Outfit') ? lam(tSuit) : n.includes('Body') ? lam(tSkin) : lam(null, 0x5a1a14); o.material.side = DS; });
  const pris = new THREE.Group(); pris.add(zRoot); scene.add(pris);
  { zRoot.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(zRoot), k = 1.8 / (bb.max.y - bb.min.y); zRoot.scale.multiplyScalar(k); zRoot.position.y = -bb.min.y * k; }
  const zMixer = new THREE.AnimationMixer(zRoot), zActs = {};
  const zClip = (n) => THREE.AnimationClip.findByName(cityG.animations, n);
  const zAct = (n) => zActs[n] || (zActs[n] = (() => { const a = zMixer.clipAction(zClip(n)); a.play(); a.setEffectiveWeight(0); return a; })());
  let zHip = null; zRoot.traverse((o) => { if (o.isSkinnedMesh && !zHip) zHip = o.skeleton.bones[0]; });
  const zHip0 = zHip.position.clone();
  const zBone = (re) => { let b = null; zRoot.traverse((o) => { if (!b && re.test(o.name)) b = o; }); return b; };
  const zhR = zBone(/(hand.?R|RightHand)$/i), zhL = zBone(/(hand.?L|LeftHand)$/i), zHead = zBone(/head$/i);
  function zPose(list) { for (const a of Object.values(zActs)) a.setEffectiveWeight(0); for (const [n, t, w] of list) { if (w <= 0) continue; const a = zAct(n), d = a.getClip().duration; a.time = ((t % d) + d) % d; a.setEffectiveWeight(w); } zMixer.update(0); zHip.position.x = zHip0.x; zHip.position.z = zHip0.z; pris.updateMatrixWorld(true); }
  // reach pose: both hands forward at chest height (searched once over the attack clips)
  const REACH = (() => {
    let best = null; const keep = [pris.position.clone(), pris.rotation.y]; pris.position.set(0, 0, 0); pris.rotation.y = 0;
    for (const n of ['Zombie_Attack', 'Zombie_Attack2', 'Zombie_Attack3', 'Zombie_Scream', 'Zombie_Idle2']) { const c = zClip(n); if (!c) continue;
      for (let i = 0; i <= 40; i++) { const t = c.duration * i / 40; zPose([[n, t, 1]]); const a = zhL.getWorldPosition(V()), b = zhR.getWorldPosition(V());
        const s = Math.min(a.z, b.z) * 2 - Math.abs((a.y + b.y) / 2 - 1.35) * 1.5 - Math.max(0, Math.abs(a.x - b.x) - 0.6); if (!best || s > best.s) best = { n, t, s }; } }
    pris.position.copy(keep[0]); pris.rotation.y = keep[1]; return best;
  })();
  const IDLE = 'Zombie_Idle';
  // lunge profile: 0 at rest, 1 at the bars (hit at h), back to rest after
  const lunge = (lt, h) => { const a = lt - (h - 0.24), b = lt - h; if (a < 0) return 0; if (b < 0) return L.smooth(a / 0.24); return 1 - L.smooth((b - 0.18) / 0.5); };

  // ---------- Ava + flashlight ----------
  const ch = L.hero(); scene.add(ch.root);
  const FL = K.flashlight(ch, scene);
  // 48b beam: bright at the lens, fading toward the far end (the kit cone fades the other way). Beam + spot come from the
  // torch prop's own axis (FL.on); FL.aim raises her right arm so that axis points at the lit target.
  const tBeamH = L.cvs(16, 32, (c) => { for (let y = 0; y < 32; y++) { const a = 0.34 * (1 - y / 32) ** 1.4 + 0.02; const g = c.createLinearGradient(0, 0, 16, 0); g.addColorStop(0, 'rgba(255,240,200,0)'); g.addColorStop(0.5, `rgba(255,244,210,${a})`); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(0, y, 16, 1); } });
  const tBeamK = FL.beam.material.map;
  const reset = () => { FL.unaim(); ch.root.visible = true; FL.show(); FL.beam.material.map = tBeamK; pris.visible = true; bars3.position.set(-1.0, 0, 0); doorLeaf.position.set(0, 0, 0); handle.rotation.z = 0; };
  const BAR_X = -1.0;
  const out = {};

  // ---- 48b: long corridor, fixed high at the far end; Ava small at the entrance, the beam sweeps the bars
  {
    const c = cam(38);
    out['48b_cells_hall'] = { scene, camera: c, update(lt, t) {
      reset();
      const w = r.walk48b, p = w.at(t);
      ch.root.position.set(p.x, 0, p.z); ch.root.rotation.y = w.at(w.t0 + 0.01).yaw;
      ch.pose(lt, [w.seg(r.t48b), L.seg('idle', w.t1 - r.t48b, { fade: 0.25, loop: true })], [[-99, 'open', mouthAt(t, 'neutral')]]);
      pris.position.set(-2.9, 0, -4.6); pris.rotation.y = -Math.PI / 2; zPose([[IDLE, lt, 1]]);
      look(c, V(0.55, 2.55, -9.6), V(-0.25, 0.95, 1.2));
      const u = L.smooth((t - r.sweep + 0.2) / 1.6);
      FL.beam.material.map = tBeamH;
      const tg = V(-1.3, 0.9 + 0.3 * Math.sin(u * 3), 0.9 - 5.2 * u);
      FL.aim(tg, 1); FL.on(lt > 0.08, c, tg, 1, true, 16);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }

  // ---- 48c: cell 3's bars + plate in the foreground; the beam slides off the bunk onto him on "three"
  {
    const c = cam(42);
    out['48c_cell3'] = { scene, camera: c, update(lt, t) {
      reset();
      ch.root.position.set(0.6, 0, -2.3); ch.root.rotation.y = Math.atan2(-2.6 - 0.6, -4.6 + 2.3);
      ch.pose(lt, L.still('idle', 0.3), [[-99, 'half', 'neutral']]);
      pris.position.set(-2.95, 0, -4.75); const turn = L.smooth((t - r.empty) / 0.5);
      pris.rotation.y = -Math.PI / 2 + turn * 2.0; zPose([[IDLE, lt * 0.8, 1]]);
      look(c, V(0.3, 1.95, -3.0), V(-2.2, 1.5, -4.65));
      const u = L.smooth((t - r.three + 0.35) / 0.4);
      const tg = V(-3.0, 0.6, -3.6).lerp(V(-2.95, 1.45, -4.75), u);
      FL.aim(tg, 1); FL.on(true, c, tg, 1, true, 18);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }

  // ---- 48d: low dramatic angle at the bars; he slams them on the anchor words; only the bars rattle
  {
    const c = cam(50);
    out['48d_prisoner'] = { scene, camera: c, update(lt, t) {
      reset();
      ch.root.position.set(0.55, 0, -2.5); ch.root.rotation.y = Math.atan2(-1.6 - 0.55, -4.3 + 2.5);
      ch.pose(lt, L.still('idle', 0.3), [[-99, 'open', 'neutral']]);
      const hs = r.hits48d.map((h) => h - r.t48d);
      let k = 0; for (const h of hs) k = Math.max(k, lunge(lt, h));
      pris.position.set(-1.75 + 0.42 * k, 0, -4.3); pris.rotation.y = Math.PI / 2;
      zPose([[IDLE, lt, 1 - k], [REACH.n, REACH.t, k]]);
      bars3.position.x = BAR_X + K.rattle(lt, hs, 0.016, 0.5); bars3.position.z = K.rattle(lt, hs, 0.006, 0.5, 23);
      look(c, V(-0.25, 0.22, -3.25), V(-1.25, 1.45, -4.35));
      const tg = V(-1.45, 1.5, -4.3);
      FL.aim(tg, 1); FL.on(true, c, tg, 0.8, false, 20);
    }, overlay: (lt, dt, a, o) => vignette(o, 0.5) };
  }

  // ---- 48d2: Ava walks up to the bars (high corner) -> on "end" low side angle, he grabs her -> red freeze + YOU DIED
  {
    const c1 = cam(44), c2 = cam(46);
    const shot = { scene, camera: c1, update(lt, t) {
      reset();
      const tf = Math.min(t, r.freeze), lf = tf - r.t48d2;   // frozen time
      const w = r.walk48d2, p = w.at(tf);
      ch.root.position.set(p.x, 0, p.z); ch.root.rotation.y = w.at(w.t0 + 0.01).yaw + L.smooth((tf - w.t1) / 0.4) * (-Math.PI / 2 - w.at(w.t0 + 0.01).yaw);
      const te = r.end - r.t48d2, tp = w.t1 - r.t48d2;
      ch.pose(lf, [w.seg(r.t48d2), L.seg('peek', tp, { fade: 0.3, loop: true }), L.seg('surprised', te + 0.05, { fade: 0.08 })],
        [[-99, 'half', mouthAt(tf, 'neutral')], [tp, 'open', mouthAt(tf, 'neutral')], [te + 0.06, 'shocked', 'bigShock']]);
      // prisoner: still in the dark corner, then lunges to the bars, arms through
      const k = L.smooth((tf - (r.grab - 0.24)) / 0.24);
      pris.position.set(-2.75 + 1.55 * k, 0, -4.35 + 0.1 * k); pris.rotation.y = Math.PI / 2;
      zPose([[IDLE, lf * 0.5, 1 - k], [REACH.n, REACH.t, k]]);
      bars3.position.x = BAR_X + K.rattle(lf, [r.grab - r.t48d2], 0.016, 0.5);
      const late = t >= r.end - 0.06;
      this.camera = late ? c2 : c1;
      if (!late) look(c1, V(0.9, 2.5, -2.0), V(-0.75, 0.9, -4.5));
      else look(c2, V(0.45, 1.05, -4.95), V(-0.95, 1.4, -4.2));
      const tg = V(-2.4, 1.0, -4.4).lerp(V(-1.5, 1.5, -4.3), k);
      FL.aim(tg, 1); FL.on(true, this.camera, tg, 0.9, true, 16);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.5);
      const f = lt - (r.freeze - r.t48d2); if (f < 0) return;
      const c = o.tctx;
      const k = L.smooth(f / 0.45);   // as the approved short: brief red tint that fades, black settles at 0.86 (frozen scene visible)
      c.fillStyle = `rgba(120,0,0,${0.55 * (1 - k)})`; c.fillRect(0, 0, LW, LH);
      c.fillStyle = `rgba(0,0,0,${Math.min(0.86, 0.35 + k)})`; c.fillRect(0, 0, LW, LH);
      if (f > 0.15) ctx.youDied(o, f - 0.15, { y0: 160 });
    } };
    shot.overlay = shot.overlay.bind(shot);
    shot.hudOff = (lt) => lt >= r.freeze - r.t48d2;   // YOU DIED tapa el HUD (como RE)
    out['48d2_died'] = shot;
  }

  // ---- 48f: fixed high corner at the entrance; Ava walks back up the hall, shakes her head at camera; RULE 5 label
  {
    const c = cam(42);
    out['48f_rule5'] = { scene, camera: c, update(lt, t) {
      reset();
      const w = r.walk48f, p = w.at(t), ts = w.t1 - r.t48f, tn = r.nobody - r.t48f;
      ch.root.position.set(p.x, 0, p.z); ch.root.rotation.y = w.at(w.t0 + 0.01).yaw;
      ch.pose(lt, [w.seg(r.t48f), L.seg('idle', ts, { fade: 0.25, loop: true }), L.seg('shake_head', Math.max(ts + 0.3, tn), { fade: 0.15 })],
        [[-99, 'half', mouthAt(t, 'neutral')], [ts, 'open', mouthAt(t, 'neutral')], [tn, 'angry', mouthAt(t, 'frown')]]);
      if (lt > ts) ch.lookAt(c, L.smooth((lt - ts) / 0.35), 45);
      const hs = [r.slam48f - r.t48f];
      const k = lunge(lt, hs[0]);
      pris.position.set(-1.75 + 0.42 * k, 0, -4.3); pris.rotation.y = Math.PI / 2; zPose([[IDLE, lt, 1 - k], [REACH.n, REACH.t, k]]);
      bars3.position.x = BAR_X + K.rattle(lt, hs, 0.016, 0.5);
      look(c, V(0.82, 2.55, 2.25), V(-0.35, 0.85, -3.6));
      const tg = V(p.x - 0.15, 0.25, p.z + 3.4);   // low-ready: beam on the floor well ahead, arm raised forward
      FL.aim(tg, 1); FL.on(true, c, tg, 0.5, false, 8);
    }, overlay: (lt, dt, a, o) => {
      vignette(o, 0.45);
      const k = pop(lt, r.rule - r.t48f);   // full label from "rule", held to the end of the shot
      if (k > 0) label(o, 'MY RULE 5\nNOBODY GOES DOWN\nTHE BACK HALL', 470, 74, '#ff4030', null, k, 2);
    } };
  }

  // ---- 48g: high behind Ava down the hall to the end door; on "clover" close side angle on the lock; handle rattles on "open"
  {
    const c1 = cam(40), c2 = cam(40);
    let off48g = null;   // root offset that puts her right hand on the handle (turn_key clip, hand forward from 0.35)
    const shot = { scene, camera: c1, update(lt, t) {
      reset();
      const w = r.walk48g, p = w.at(t), tr = r.reach48g - r.t48g;
      if (!off48g) { ch.root.position.set(p.x, 0, -9.38); ch.root.rotation.y = Math.PI; ch.pose(0, L.still('turn_key', 0.5)); ch.root.updateMatrixWorld(true); doorLeaf.updateMatrixWorld(true);
        const hp = ch.hand('R').getWorldPosition(V()), hd = handle.localToWorld(V(-0.07, 0, 0.03)); off48g = V(hd.x - hp.x, 0, hd.z - hp.z + 0.02); }
      const arrive = L.smooth((t - w.t1 + 0.1) / 0.35);
      ch.root.position.set(p.x + off48g.x * arrive, 0, p.z + off48g.z * arrive); ch.root.rotation.y = Math.PI;
      const tw = r.wont - r.t48g;
      ch.pose(lt, [w.seg(r.t48g), L.seg('turn_key', tr, { fade: 0.15 }), L.seg('turn_key', tr + 0.5, { from: 0.5, speed: 0 })],
        [[-99, 'open', mouthAt(t, 'neutral')], [tw, 'angry', mouthAt(t, 'frown')]]);
      const to = r.open - r.t48g;
      handle.rotation.z = lt > to ? -0.35 * Math.abs(Math.sin((lt - to) * 18)) * (1 - L.smooth((lt - to - 0.5) / 0.3)) : 0;
      doorLeaf.position.z = K.rattle(lt, [to, to + 0.12, to + 0.24], 0.008, 0.3, 19);
      pris.position.set(-2.9, 0, -4.6); pris.rotation.y = -Math.PI / 2; zPose([[IDLE, lt, 1]]);
      const late = t >= r.clover - 0.06;
      this.camera = late ? c2 : c1;
      if (!late) look(c1, V(0.75, 2.5, -4.6), V(0.0, 0.95, -10.0));
      else look(c2, V(0.9, 1.32, -9.62), V(0.3, 1.06, -10.17));
      const tg = V(0.3, 1.0, ZEND);
      FL.aim(tg, 1 - L.smooth((lt - tr + 0.15) / 0.3)); FL.on(true, this.camera, tg, 0.6, !late, 12);
    }, overlay(lt, dt, a, o) {
      vignette(o, 0.45);
      const k = pop(lt, r.clover - r.t48g);
      if (k > 0) { doorLeaf.updateMatrixWorld(true); const pp = doorLeaf.localToWorld(V(0.36, 1.16, 0.03)); const [x, y] = L.toScreen(o.camera, pp.x, pp.y, pp.z); label(o, 'CLOVER', 300, 90, '#8cff5a', [x, y], 1, 2); }
    } };
    shot.overlay = shot.overlay.bind(shot);
    out['48g_clover_door'] = shot;
  }
  return out;
}

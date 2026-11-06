// rbx-sock: INSIDE the laundry chute — a long square galvanized tube going down steeply (riveted seams, dents, scratches,
// socks stuck to the walls), warm house light from the square opening at the top, fading to dark with a faint warm glow
// far below (the sock cave). props.setScroll(v) slides the walls/socks along the axis to fake falling speed.
'use strict';
SETS.chute = async function (ctx) {
  const { cnv, tex, pbr, rng } = RBX;
  const { V, shadow, texPair, noiseOver } = KIT;
  const A = 1.9, TOP = 2, BOT = -90, L = TOP - BOT, TILE = 4, PER = 16, TILT = 0.22;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#020100');
  scene.fog = new THREE.FogExp2('#060302', 0.028);
  const tube = new THREE.Group(); tube.rotation.x = TILT; scene.add(tube);
  const r = rng(303);

  // env map: warm top, dark sides (for the metal)
  let envMap = null;
  if (ctx && ctx.renderer) {
    const pm = new THREE.PMREMGenerator(ctx.renderer), es = new THREE.Scene();
    es.add(new THREE.Mesh(new THREE.SphereGeometry(10, 16, 8), new THREE.MeshBasicMaterial({ color: '#141010', side: THREE.BackSide })));
    const t = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffd8a0').multiplyScalar(6) })); t.position.y = 9; es.add(t);
    const b = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 5), new THREE.MeshBasicMaterial({ color: new THREE.Color('#ff7a2a').multiplyScalar(1.2) })); b.position.y = -9; es.add(b);
    envMap = pm.fromScene(es, 0.04).texture;
  }

  // ---------------- galvanized wall texture: 1 tile = 4 units (seam + rivet row per tile) ----------------
  const galv = texPair(512, (g, hg, S) => {
    const q = rng(51);
    g.fillStyle = '#8f9497'; g.fillRect(0, 0, S, S);
    for (let i = 0; i < 300; i++) { const x = q() * S, y = q() * S, s = 10 + q() * 30, t = 0.82 + q() * 0.34; g.fillStyle = `rgba(${150 * t | 0},${156 * t | 0},${160 * t | 0},0.55)`; g.beginPath();
      for (let a = 0; a < 6; a++) { const ang = a + q() * 0.8; g.lineTo(x + Math.cos(ang) * s, y + Math.sin(ang) * s); } g.fill(); }
    noiseOver(g, S, S, 52, 0.3, 8, 4);
    // vertical scratches (things sliding down)
    for (let i = 0; i < 38; i++) { const x = q() * S, y = q() * S, len = 40 + q() * 200; g.strokeStyle = `rgba(225,232,238,${0.1 + q() * 0.25})`; g.lineWidth = 0.6 + q(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (q() - 0.5) * 10, y + len); g.stroke();
      hg.strokeStyle = 'rgba(40,40,40,0.6)'; hg.lineWidth = 1.2; hg.beginPath(); hg.moveTo(x, y); hg.lineTo(x + (q() - 0.5) * 10, y + len); hg.stroke(); }
    // dents (height blobs)
    for (let i = 0; i < 5; i++) { const x = 40 + q() * (S - 80), y = 40 + q() * (S - 80), s = 20 + q() * 40, gr = hg.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, 'rgba(20,20,20,0.9)'); gr.addColorStop(1, 'rgba(128,128,128,0)'); hg.fillStyle = gr; hg.fillRect(x - s, y - s, 2 * s, 2 * s);
      const gc = g.createRadialGradient(x - s * 0.3, y - s * 0.3, 0, x, y, s); gc.addColorStop(0, 'rgba(255,255,255,0.18)'); gc.addColorStop(0.6, 'rgba(0,0,0,0.15)'); gc.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gc; g.fillRect(x - s, y - s, 2 * s, 2 * s); }
    // rust / grime streaks running down from the seam
    for (let i = 0; i < 10; i++) { const x = q() * S, gr = g.createLinearGradient(0, 40, 0, 40 + 200); gr.addColorStop(0, 'rgba(120,70,30,0.45)'); gr.addColorStop(1, 'rgba(120,70,30,0)'); g.fillStyle = gr; g.fillRect(x, 40, 3 + q() * 7, 200); }
    for (let i = 0; i < 4; i++) { const x = q() * S, y = q() * S, s = 30 + q() * 60, gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, 'rgba(40,30,20,0.35)'); gr.addColorStop(1, 'rgba(40,30,20,0)'); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); }
    // the lap seam at the top of the tile + rivet row
    g.fillStyle = 'rgba(20,20,20,0.85)'; g.fillRect(0, 22, S, 5); g.fillStyle = 'rgba(210,215,220,0.5)'; g.fillRect(0, 27, S, 3);
    hg.fillStyle = '#000'; hg.fillRect(0, 20, S, 8); hg.fillStyle = '#c8c8c8'; hg.fillRect(0, 28, S, 22);
    for (let x = 18; x < S; x += 46) { g.fillStyle = '#6e7376'; g.beginPath(); g.arc(x, 40, 7, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x - 2, 37.5, 2.6, 0, 7); g.fill(); g.fillStyle = 'rgba(110,60,25,0.6)'; g.fillRect(x - 1.5, 46, 3, 18);
      const rg = hg.createRadialGradient(x, 40, 0, x, 40, 8); rg.addColorStop(0, '#ffffff'); rg.addColorStop(1, '#a0a0a0'); hg.fillStyle = rg; hg.beginPath(); hg.arc(x, 40, 8, 0, 7); hg.fill(); }
  });
  const wallM = pbr(galv.c, galv.h, { rough: 0.42, bump: 4, repeat: [(2 * A) / TILE, L / TILE] });
  wallM.metalness = 0.55; if (envMap) { wallM.envMap = envMap; wallM.envMapIntensity = 0.6; }
  const maps = [wallM.map, wallM.normalMap];

  // ---------------- walls (inward-facing planes, slight static waviness) ----------------
  const wallGeo = new THREE.PlaneGeometry(2 * A, L, 10, 90);
  { const p = wallGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), e = 1 - Math.abs(x) / A; p.setZ(i, e * (0.025 * Math.sin(y * 0.9 + x) + 0.02 * Math.sin(y * 2.3))); } wallGeo.computeVertexNormals(); }
  [[V(-A, 0, 0), Math.PI / 2], [V(A, 0, 0), -Math.PI / 2], [V(0, 0, -A), 0], [V(0, 0, A), Math.PI]].forEach(([p, ry]) => {
    const m = new THREE.Mesh(wallGeo, wallM); m.position.set(p.x, (TOP + BOT) / 2, p.z); m.rotation.y = ry; m.receiveShadow = true; tube.add(m); });
  // corner angle strips
  const stripM = new THREE.MeshStandardMaterial({ color: '#6f7477', roughness: 0.45, metalness: 0.7, envMap, envMapIntensity: 0.5 });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const s = new THREE.Mesh(new THREE.BoxGeometry(0.16, L, 0.16), stripM); s.position.set(sx * (A - 0.05), (TOP + BOT) / 2, sz * (A - 0.05)); s.rotation.y = Math.PI / 4; s.receiveShadow = true; tube.add(s); });

  // ---------------- top opening: hatch frame + warm house light beyond ----------------
  {
    const hc = cnv(512, 512), g = hc.getContext('2d');
    const gr = g.createRadialGradient(256, 256, 20, 256, 256, 360); gr.addColorStop(0, '#fff6dc'); gr.addColorStop(0.5, '#ffd79a'); gr.addColorStop(1, '#d08a48'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    // hallway ceiling seen from below: a ceiling lamp, a beam, the edge of a door frame
    g.fillStyle = 'rgba(150,90,40,0.55)'; g.fillRect(0, 0, 512, 60); g.fillRect(0, 0, 40, 512);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(300, 230, 70, 0, 7); g.fill();
    g.strokeStyle = 'rgba(160,110,60,0.6)'; g.lineWidth = 8; g.beginPath(); g.arc(300, 230, 80, 0, 7); g.stroke();
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(2 * A + 0.4, 2 * A + 0.4), new THREE.MeshBasicMaterial({ map: tex(hc), color: new THREE.Color(2.2, 2.0, 1.7), fog: false, toneMapped: false }));
    sky.rotation.x = Math.PI / 2; sky.position.y = TOP + 1.2; tube.add(sky);
    const wood = new THREE.MeshStandardMaterial({ color: '#7a5434', roughness: 0.7 });
    [[0, -A - 0.2, 2 * A + 0.8, 0.4], [0, A + 0.2, 2 * A + 0.8, 0.4]].forEach(([x, z, w, d]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), wood); b.position.set(x, TOP + 0.15, z); tube.add(b); });
    [[-A - 0.2, 0], [A + 0.2, 0]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 2 * A), wood); b.position.set(x, TOP + 0.15, z); tube.add(b); });
    // the little hatch door, swung open (dark silhouette against the light)
    const hatch = new THREE.Mesh(new THREE.BoxGeometry(2 * A, 0.12, 2 * A * 0.9), new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 0.6 })); hatch.position.set(0, TOP + 0.3 + A * 0.85, A + 0.2); hatch.rotation.x = -1.3; tube.add(hatch);
    // short walls above the rim (inside of the hatch box) so the light square has depth
    [[V(-A - 0.01, TOP + 0.6, 0), Math.PI / 2], [V(A + 0.01, TOP + 0.6, 0), -Math.PI / 2], [V(0, TOP + 0.6, -A - 0.01), 0]].forEach(([p, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * A, 1.2), new THREE.MeshStandardMaterial({ color: '#c8b8a0', roughness: 0.9 })); m.position.copy(p); m.rotation.y = ry; tube.add(m); });
  }
  // ---------------- far bottom: warm glow of the sock cave ----------------
  {
    const c = cnv(256, 256), g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, '#ffb060'); gr.addColorStop(0.35, '#d0581c'); gr.addColorStop(1, '#1a0602'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    const q = rng(9); for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(40,12,4,${0.4 + q() * 0.4})`; g.lineWidth = 6 + q() * 6; const x = q() * 256, y = q() * 256; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 20, y + 10, x + 10 - q() * 30, y + 30); g.stroke(); }
    const bot = new THREE.Mesh(new THREE.PlaneGeometry(2 * A, 2 * A), new THREE.MeshBasicMaterial({ map: tex(c), color: new THREE.Color(0.9, 0.8, 0.7), fog: false, toneMapped: false })); bot.rotation.x = -Math.PI / 2; bot.position.y = BOT + 0.5; tube.add(bot);
  }

  // ---------------- socks stuck to the walls (scroll group, repeats every PER units) ----------------
  const scroll = new THREE.Group(); tube.add(scroll);
  const stuck = [];
  const kinds = ['stripe', 'gym', 'dots', 'red', 'fadestripe', 'argyle', 'baby', 'knit', 'grandpa', 'star', 'green', 'grey'];
  const base = [];
  for (let i = 0; i < 9; i++) base.push({ wall: i % 4, u: (r() - 0.5) * 2 * (A - 0.7), y: -(i + r() * 0.8) * (PER / 9), k: kinds[i % kinds.length], a: (r() - 0.5) * 2.4, s: 0.6 + r() * 0.15 });
  for (let rep = -1; rep < Math.ceil(-BOT / PER) + 1; rep++) base.forEach((b, i) => {
    const s = SOCKS.one(b.k, b.s, 0.35), y = b.y - rep * PER, off = A - 0.1;
    const m = s.children[0]; m.rotation.x = b.a;   // in-plane tilt (flat axis stays x)
    if (b.wall === 0) { s.position.set(-off, y, b.u); }
    else if (b.wall === 1) { s.position.set(off, y, b.u); s.rotation.y = Math.PI; }
    else if (b.wall === 2) { s.position.set(b.u, y, -off); s.rotation.y = -Math.PI / 2; }
    else { s.position.set(b.u, y, off); s.rotation.y = Math.PI / 2; }
    s.userData.y0 = y; scroll.add(s); stuck.push(s);
  });

  // ---------------- speed streaks (hidden by default) ----------------
  const speedLines = new THREE.Group(); speedLines.visible = false; tube.add(speedLines);
  { const sm = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.3, 1.0), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: true });
    const sg = new THREE.PlaneGeometry(0.025, 5);
    for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(sg, sm), w = Math.floor(r() * 4), u = (r() - 0.5) * 2 * (A - 0.2), y = -r() * 50, d = A - 0.25 - r() * 0.4;
      if (w === 0) { m.position.set(-d, y, u); m.rotation.y = Math.PI / 2; } else if (w === 1) { m.position.set(d, y, u); m.rotation.y = Math.PI / 2; } else if (w === 2) { m.position.set(u, y, -d); } else { m.position.set(u, y, d); }
      m.userData.y0 = y; speedLines.add(m); } }

  // ---------------- lights ----------------
  shadow(scroll); speedLines.traverse((m) => { m.castShadow = false; m.receiveShadow = false; });
  scene.add(new THREE.HemisphereLight('#6a5040', '#100604', 0.5));
  const key = new THREE.SpotLight('#ffd09a', 900, 0, 0.62, 0.55, 2); key.position.set(0, TOP + 3.5, 0); key.target.position.set(0, -20, 0);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; key.shadow.camera.near = 1; key.shadow.camera.far = 60; key.shadow.radius = 3; tube.add(key, key.target);
  const rim = new THREE.PointLight('#ffcf98', 40, 12, 2); rim.position.set(0, TOP - 0.5, 0); tube.add(rim);
  const glow = new THREE.PointLight('#ff6a1e', 220, 50, 2); glow.position.set(0, BOT + 12, 0); tube.add(glow);
  const glow2 = new THREE.PointLight('#ff7a2a', 60, 30, 2); glow2.position.set(0, -40, 0); tube.add(glow2);
  // a little cold hint so the shadow side of the hero reads (no shadow)
  const cold = new THREE.PointLight('#5a6ac0', 6, 14, 2); cold.position.set(0.8, -17, -0.8); tube.add(cold);

  // ---------------- scroll ----------------
  function setScroll(v) {
    const k = ((v % PER) + PER) % PER;
    maps.forEach((t) => { t.offset.y = -v / TILE; });
    stuck.forEach((s) => { s.position.y = s.userData.y0 + k; s.visible = s.position.y < TOP - 1.2 && s.position.y > BOT + 1; });
    const kl = ((v * 1.0) % 50 + 50) % 50; speedLines.children.forEach((m) => { let y = m.userData.y0 + kl; if (y > 0) y -= 50; m.position.y = y; });
  }
  setScroll(0);

  tube.updateMatrixWorld(true);
  const W = (x, y, z) => { const p = tube.localToWorld(V(x, y, z)); return [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)]; };
  const fallP = W(0, -12, 0);
  return {
    scene, grade: 'night',
    marks: {
      p_fall: { p: W(0, -14.8, 0), ry: 0 },     // feet of an upright avatar whose middle sits at ~y -12 (local); rotate it to dive
      m_fall: { p: fallP }, m_top: { p: W(0, TOP, 0) }, m_glow: { p: W(0, BOT, 0) },
      cam_top: { p: W(0.55, -4.0, 0.75), l: W(0, -13, 0), fov: 62 },
      cam_below: { p: W(0.6, -25, -0.7), l: W(0, -12, 0), fov: 60 },
      cam_side: { p: W(1.45, -9.5, 1.45), l: W(-0.4, -14, -0.4), fov: 70 },
      cam_down: { p: W(0.3, 1.2, 0.3), l: W(0, -40, 0), fov: 70 },
    },
    props: { tube, scroll, speedLines, wallM, key, glow, setScroll, axis: (() => { const a = V(0, -1, 0).applyQuaternion(tube.quaternion); return [a.x, a.y, a.z]; })(), TILT, A, TOP, BOT },
    mood(n) { if (n === 'speed') { speedLines.visible = true; setScroll(7.3); } else { speedLines.visible = false; setScroll(0); } },
    views: {
      top: { p: W(0.55, -4.0, 0.75), l: W(0, -13, 0), fov: 62 },
      below: { p: W(0.6, -25, -0.7), l: W(0, -12, 0), fov: 60 },
      side: { p: W(1.45, -9.5, 1.45), l: W(-0.4, -14, -0.4), fov: 70 },
      down: { p: W(0.3, 1.2, 0.3), l: W(0, -40, 0), fov: 70 },
      speed: { p: W(0.55, -4.0, 0.75), l: W(0, -13, 0), fov: 62, mood: 'speed' },
    },
  };
};

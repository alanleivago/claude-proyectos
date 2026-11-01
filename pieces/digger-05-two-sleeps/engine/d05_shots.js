  // ===================================== DIGGER 05: "humans used to sleep twice" (vertical short) =====================================
  // sets, props, NPCs and clips from Expedition 01; sinaboto format (no "Operator… I dug up"); 270x480
  // ---- helpers ----
  function clock(o, x, y, txt, col = '#ff5a4a') {   // a bedside digital clock face (pixel)
    const c = o.tctx; cham(c, x - 40, y - 15, 80, 30, 4, '#040412'); cham(c, x - 38, y - 13, 76, 26, 3, '#1a1a22'); bitText(c, txt, x, y, 2, col, { outline: null }); }
  // the night as a bar: DUSK ... 00:00 ... DAWN, first/second sleep segments fill (k1, k2 in 0..1); merged = the modern single block
  function sleepBar(o, y, k1, k2, { merged = 0, labels = true } = {}) {
    const c = o.tctx, x0 = 22, w = LW - 44; cham(c, x0 - 3, y - 3, w + 6, 26, 3, '#040412'); c.fillStyle = '#18204a'; c.fillRect(x0, y, w, 20);
    const mid = x0 + w * 0.5, gap = Math.round(w * 0.12 * (1 - merged));
    const a0 = x0 + 4 + Math.round(w * 0.1 * merged), a1 = mid - gap / 2, b0 = mid + gap / 2, b1 = x0 + w - 4 - Math.round(w * 0.1 * merged);
    c.fillStyle = '#6b6fd6'; c.fillRect(a0, y + 4, Math.round((a1 - a0) * k1), 12); c.fillStyle = '#8a7ae8'; c.fillRect(b0, y + 4, Math.round((b1 - b0) * k2), 12);
    if (merged < 0.5) { c.fillStyle = '#fdd941'; c.fillRect(mid - gap / 2 + 2, y + 4, Math.max(0, gap - 4), 12); }
    if (labels) { bitText(c, 'DUSK', x0 + 12, y - 9, 1, '#c8f8ff'); bitText(c, '00:00', mid, y - 9, 1, '#fff2a0'); bitText(c, 'DAWN', x0 + w - 12, y - 9, 1, '#c8f8ff'); } }
  function lightBulb() { const g = new THREE.Group(); const glass = L.mesh(new THREE.SphereGeometry(0.09, 10, 8), L.basic(null, 0xfff4b0), 0, 0.13, 0, g); glass.scale.y = 1.15;
    L.mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.07, 10), litM(null, 0xb8bcc4), 0, 0.03, 0, g); for (let k = 0; k < 3; k++) L.mesh(new THREE.TorusGeometry(0.047, 0.006, 3, 10), litM(null, 0x8a8e98), 0, 0.01 + k * 0.022, 0, g).rotation.x = Math.PI / 2;
    L.mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.02, 8), litM(null, 0x2a2a2a), 0, -0.012, 0, g); return g; }
  function hearth(parent, x, z) {   // a stone hearth against the back wall with a small log fire
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    L.box(1.1, 0.9, 0.5, mm(MT.stone, 2, 1.5, 0xd0c8b8), 0, 0.45, -0.1, g); L.box(0.7, 0.55, 0.42, L.basic(null, 0x14100c), 0, 0.3, 0.0, g); L.box(1.2, 0.1, 0.55, mm(MT.darkWood, 2, 0.3), 0, 0.92, -0.08, g);
    for (let i = 0; i < 3; i++) { const lg = L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6), litM(null, 0x5a3418), 0, 0.08, 0.12, g); lg.rotation.set(Math.PI / 2, 0, i * 0.9 - 0.9); }
    const fl = [0, 1, 2, 3, 4].map((i) => L.mesh(new THREE.ConeGeometry(0.05, 0.2 + (i % 2) * 0.1, 5), L.basic(null, [0xff5a1a, 0xff9a2a, 0xffc43a][i % 3]), -0.12 + i * 0.06, 0.2, 0.12, g));
    const pl = new THREE.PointLight(0xffa850, 3.2, 3.5); pl.position.set(x, 0.6, z + 0.6); parent.add(pl);
    g.userData.tick = (t) => { const q = q15(t); fl.forEach((f, i) => { const k = 1 + 0.3 * Math.sin(q * (17 + i * 3) + i); f.scale.set(1, k, 1); f.position.y = 0.14 + 0.1 * k; }); }; return g; }
  function plants(scene, list) { for (const [x, z, s] of list) pottedTree(scene, x, z, s); }   // green balance in every interior
  function medRoom(scene) { tudorRoom(scene); plants(scene, [[-1.9, 0.4, 0.55], [1.95, -0.3, 0.5]]); }
  const PAR = (n) => n;   // paragraph numbers of guion.md
  // ===== 1. "If you wake up at 3 a.m.…"  her modern bedroom at night, she sits up, the clock reads 3:00
  SH([1, 'If'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.6 }); const bd = bed(scene, { x: -0.25, z: -0.1, full: true }); plants(scene, [[0.95, -0.55, 0.45]]);
    const ns = nightstandObj(); ns.position.set(0.55, 0, -0.95); scene.add(ns); nightGrade(scene); const ch = hero(scene); inBed(ch, bd); const tW = ws(1, 'wake'); cue(t0 + 0.05, 'tick'); cue(tW, 'gasp');
    const fx = new FX(LW, LH).add('exclaim', { obj: ch.root, bone: 'Head', offset: [0.1, 0.4, 0], t0: tW + 0.25, dur: 1.4 });
    return { scene, fx, cam: CAM([[0.9, 1.35, 1.7], [0.85, 1.32, 1.6]], [[-0.2, 0.75, -0.6]], 52), upd(t) { ch.drive(t, q15(t) < tW ? [seg('sleep_lie', -99, { loop: true })] : [seg('wake_sit_up', tW)], [[-99, 'blink', 'cat'], [tW, 'surprised', 'gasp']], false); },
      ov(o, t) { sunInWindow(o, this.cam, R0.win, 0.8, t - t0, 'moon'); clock(o, CX, 90, '3:00'); } }; });
  // ===== 2. "…you're not broken."  close on her face, she relaxes
  SH([1, "you're"], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.6 }); const bd = bed(scene, { x: -0.25, z: -0.1, full: true }); nightGrade(scene); const ch = hero(scene); inBed(ch, bd);
    const tB = ws(1, 'broken'); cue(tB, 'label');
    return { scene, cam: CAM([[0.35, 1.2, 0.75], [0.33, 1.18, 0.7]], [[-0.22, 0.95, -0.55]], 46), upd(t) { ch.drive(t, [still('wake_sit_up', 9)], [[-99, 'open', 'smile']]); },
      ov(o, t) { if (t >= tB) plateText(o, 'NOT BROKEN', CX, 70, { size: 14, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tB) }); } }; });
  // ===== 3. "You're doing what humans did for centuries."  a medieval town at night, one candle in a window
  SH([1, "You're", 2], 'M', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: false }); nightGrade(scene); cue(t0 + 0.1, 'night_amb');
    return { scene, cam: CAM([[0.6, 1.6, 6.0], [0.4, 1.7, 5.4]], [[-1.2, 2.4, -3.0]], 60), ov(o, t) { plateText(o, 'FOR CENTURIES', CX, 60, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 0.3) }); } }; });
  // ===== 4. "Before electric light, nights were long and dark."  the same town, darker; she walks with a lantern-candle
  SH([2, 'Before'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: false }); const ch = hero(scene, { p: [-0.8, 0, 0.6], ry: 0.4 }); nightGrade(scene, [ch]); cue(t0 + 0.2, 'footsteps');
    const cd = new THREE.Group(); scene.add(cd); L.mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8), L.basic(null, 0xf4ecd8), 0, 0, 0, cd); L.mesh(new THREE.ConeGeometry(0.018, 0.05, 5), L.basic(null, 0xffc040), 0, 0.085, 0, cd);
    const cl = new THREE.PointLight(0xffc070, 2.4, 2.4); scene.add(cl); const fp = V3([0, 0, 0]); const tD = ws(2, 'dark'); cue(tD, 'label');
    return { scene, cam: CAM([[-0.3, 1.25, 2.9], [-0.35, 1.25, 2.6]], [[-0.8, 1.05, 0.4]], 50), upd(t) { ch.drive(t, [still('light_candle', 1.2)], [[-99, 'open', 'neutral']]); scene.updateMatrixWorld(true); ch.fist('L', fp); cd.position.copy(fp).add(V3([0, 0.08, 0])); cl.position.copy(cd.position).add(V3([0, 0.1, 0.25])); },
      ov(o, t) { plateText(o, 'NO ELECTRIC LIGHT', CX, 60, { size: 12, border: '#ff9a5a', fg: '#ffe0c8' }); if (t >= tD) plateText(o, 'NIGHT: 12+ HOURS', CX, 86, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tD) }); } }; });
  // ===== 5. "People went to bed a couple of hours after sunset…"  a medieval family lies down on the straw sack; she yawns
  SH([2, 'People'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = strawBedRoom(scene); plants(scene, [[1.9, -0.3, 0.5]]); familyOnSack(scene, R0); const ch = hero(scene, { p: [0.95, 0, 0.75], ry: -0.6 }); cue(t0 + 0.3, 'straw');
    const tS = ws(2, 'sunset'); cue(tS, 'label');
    return { scene, cam: CAM([[0.55, 1.75, 2.9], [0.5, 1.7, 2.7]], [[0.2, 0.6, -0.2]], 52), upd(t) { ch.drive(t, [seg('idle', -99, { loop: true }), seg('shrug', tS, { fade: 0.15 })], [[-99, 'half', 'neutral'], [tS, 'open', 'smile']]); },
      ov(o, t) { if (t >= tS) plateText(o, 'SUNSET + 2 H', CX, 60, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tS) }); } }; });
  // ===== 6. "…and slept until around midnight. This is a first sleep."  she sleeps in a medieval bed; the night bar fills to 00:00
  SH([2, 'slept'], 'C', (t0, t1) => { const scene = new THREE.Scene(); medRoom(scene); const bd = bed(scene, { x: 0, z: 0.3, quilt: 0x7a5a3a, full: true }); const ch = hero(scene); inBed(ch, bd); nightGrade(scene);
    const tF = ws(2, 'first'); cue(t0 + 0.2, 'snore'); cue(tF, 'sting');
    return { scene, cam: CAM([[1.0, 1.55, 2.0], [0.95, 1.5, 1.85]], [[0, 0.55, 0.1]], 50), upd(t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); },
      ov(o, t) { zzz(o, 150, 230, t - t0); sleepBar(o, 380, clamp01((t - t0) / Math.max(0.5, tF - t0)), 0); if (t >= tF) plateText(o, 'FIRST SLEEP', CX, 60, { size: 14, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tF) }); } }; });
  // ===== 7. "Then they woke up, all by themselves, for an hour or so."  midnight: she sits up and lights a candle (Exp01 shot)
  SH([3, 'Then'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const bd = bed(scene, { x: -0.3, z: 0.3, quilt: 0x7a5a3a, full: true }); nightGrade(scene); const ch = hero(scene); inBed(ch, bd);
    const cd = new THREE.Group(); cd.position.set(0.45, 0.62, -0.4); scene.add(cd); L.box(0.36, 0.6, 0.32, litM(L.rep(OAK, 0.6, 0.6), 0x8a5a34), 0, -0.31, 0, cd); L.mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.13, 8), L.basic(null, 0xf4ecd8), 0, 0.07, 0, cd);
    const fl = L.mesh(new THREE.ConeGeometry(0.018, 0.05, 5), L.basic(null, 0xffc040), 0, 0.16, 0, cd); const cl = new THREE.PointLight(0xffc070, 0, 2.6); cl.position.set(0.45, 1.0, -0.2); scene.add(cl);
    const tW = t0 + 0.2, tL = ws(3, 'hour') - 0.2; cue(tW, 'bed_creak'); cue(tL - 0.3, 'match'); cue(tL, 'candle_fizz'); cue(ws(3, 'themselves'), 'label');
    return { scene, cam: CAM([[0.9, 1.35, 1.6], [0.85, 1.32, 1.5]], [[-0.15, 0.85, -0.2]], 52), upd(t) { ch.drive(t, [seg('wake_sit_up', tW)], [[-99, 'half', 'neutral'], [tW + 0.5, 'open', 'smile']], false); const on = q15(t) >= tL; fl.visible = on; cl.intensity = on ? 2.6 : 0; },
      ov(o, t) { sleepBar(o, 380, 1, 0); clock(o, CX, 90, '00:00', '#fff2a0'); if (t >= ws(3, 'themselves')) plateText(o, 'NO ALARM', CX, 60, { size: 14, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, ws(3, 'themselves')) }); } }; });
  // ===== 8. "And then they slept again until morning. This is a second sleep."  she lies back down; the second segment fills to dawn
  SH([3, 'And'], 'C', (t0, t1) => { const scene = new THREE.Scene(); medRoom(scene); const bd = bed(scene, { x: 0, z: 0.3, quilt: 0x7a5a3a, full: true }); const ch = hero(scene); inBed(ch, bd); nightGrade(scene);
    const tS = ws(3, 'second'); cue(t0 + 0.1, 'pillow_flop'); cue(tS, 'sting');
    return { scene, cam: CAM([[-0.9, 1.55, 2.0], [-0.85, 1.5, 1.85]], [[0, 0.55, 0.1]], 50), upd(t) { ch.drive(t, [seg('sleep_lie', -99, { loop: true })], [[-99, 'blink', 'cat']], false); },
      ov(o, t) { zzz(o, 120, 230, t - t0); sleepBar(o, 380, 1, clamp01((t - t0) / Math.max(0.5, tS - t0))); if (t >= tS) plateText(o, 'SECOND SLEEP', CX, 60, { size: 14, border: '#b0a0ff', fg: '#e8e0ff', scale: popS(t, tS) }); } }; });
  // ===== 9. "Operator Nina asks: So what did they do at midnight?"  the comment sticker; she reads it, curious
  SH([4, 'Operator'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const ch = hero(scene, { p: [0, 0, 0.75], ry: 0.1 }); nightGrade(scene, [ch]);
    const tN = ws(4, 'Nina'), tQ = ws(4, 'midnight'); cue(tN, 'comment_pop'); const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.14, 0.42, 0], t0: tQ, dur: 9, scale: 0.8 });
    return { scene, fx, cam: CAM([[0.1, 1.0, 3.1]], [[0.0, 0.95, 0.5]], 40), upd(t) { ch.drive(t, [seg('think', t0 - 0.2)], [[-99, 'open', 'talkO']]); },
      ov(o, t) { if (t >= tN) sticker(o, t - tN, { user: 'operator_nina', lines: ['so what did they do', 'at midnight?'], y: 92 }); } }; });
  // ===== 10. "Nina… they prayed, talked,"  she kneels by the bed with the candle and a prayer book; a neighbour talks at the door
  SH([4, 'Nina', 2], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const ch = hero(scene, { p: [-0.3, 0, 0.6], ry: 0.35 }); const bk = bookObj(0x7a2a1a); bk.position.set(0.2, 0.0, 0.7); bk.rotation.y = -0.5; scene.add(bk);
    const cd = new THREE.Group(); cd.position.set(0.32, 0.0, 0.45); scene.add(cd); L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 8), L.basic(null, 0xf4ecd8), 0, 0.07, 0, cd); L.mesh(new THREE.ConeGeometry(0.02, 0.06, 5), L.basic(null, 0xffc040), 0, 0.17, 0, cd);
    const cl = new THREE.PointLight(0xffc070, 2.4, 2.4); cl.position.set(0.3, 0.6, 0.7); scene.add(cl); nightGrade(scene, [ch]);
    const tP = ws(4, 'prayed'), tT = ws(4, 'talked'); cue(tP, 'label'); cue(tT, 'label'); cue(tT, 'murmur');
    return { scene, cam: CAM([[0.6, 1.1, 2.4], [0.55, 1.08, 2.25]], [[-0.1, 0.55, 0.4]], 50), upd(t) { ch.drive(t, [still('kneel', 1.5)], [[-99, 'relaxed', 'smile'], [tT, 'happy', 'smileOpen']]); },
      ov(o, t) { if (t >= tP) plateText(o, 'PRAY', 70, 60, { size: 14, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tP) }); if (t >= tT) plateText(o, 'TALK', 200, 60, { size: 14, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tT) }); } }; });
  // ===== 11. "…checked the fire…"  she kneels at the hearth and pokes the logs; sparks
  SH([4, 'checked'], 'C', (t0) => { const scene = new THREE.Scene(); medRoom(scene); const H0 = hearth(scene, 0.1, -0.45); const ch = hero(scene, { p: [0.55, 0, 0.25], ry: -2.2 }); cue(t0 + 0.1, 'fire_crackle');
    const fx = new FX(LW, LH).add('heat', { world: [0.1, 0.5, -0.33], t0, dur: 99, lines: 3, rise: 30 }).add('sparkle', { world: [0.1, 0.45, -0.3], t0: t0 + 0.3, dur: 99, n: 4, radius: 14, color: '#ffb040' });
    return { scene, fx, cam: CAM([[0.95, 0.95, 1.75], [0.9, 0.93, 1.65]], [[0.2, 0.45, -0.25]], 50), upd(t) { H0.userData.tick(t); ch.drive(t, [seg('dig_hands', -99, { loop: true, speed: 0.6 })], [[-99, 'open', 'smile']]); },
      ov(o, t) { plateText(o, 'FIRE CHECK', CX, 60, { size: 14, border: '#ff9a5a', fg: '#ffe0c8', scale: popS(t, t0 + 0.2) }); } }; });
  // ===== 12. "…and some visited the neighbors."  the midnight villagers with candles (Exp01) and she waves among them
  SH([4, 'some'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); const tV = ws(4, 'visited'); cue(t0 + 0.2, 'crowd_murmur'); cue(tV, 'label');
    const vs = [['bank_teller', 'grey', -1.0, -1.8, 0.4], ['homework_girl', 'blue', 0.7, -2.0, -0.4], ['art_student', 'violet', -0.2, -2.5, 0.1]].map(([id, v, x, z, ry]) => { const n = npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = ry; scene.add(n); if (id === 'bank_teller') nightcap(n); n.walk(0); return n; });
    const ch = hero(scene, { p: [0.15, 0, -0.6], ry: 0.1 }); nightGrade(scene, [...vs, ch]);
    for (const [x, z] of [[-0.75, -1.6], [0.95, -1.8]]) { const g = new THREE.Group(); g.position.set(x, 1.0, z); scene.add(g); L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), L.basic(null, 0xf4ecd8), 0, 0, 0, g); L.mesh(new THREE.ConeGeometry(0.02, 0.06, 5), L.basic(null, 0xffc040), 0, 0.09, 0, g); const p = new THREE.PointLight(0xffc070, 1.8, 3); p.position.set(x, 1.15, z + 0.3); scene.add(p); }
    return { scene, cam: CAM([[0.25, 1.35, 2.3], [0.2, 1.32, 2.15]], [[0.0, 1.05, -1.4]], 54), upd(t) { ch.drive(t, [seg('wave', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t) { if (t >= tV) plateText(o, 'VISIT THE NEIGHBORS', CX, 60, { size: 12, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, tV) }); plateText(o, '00:00 - 01:00', CX, 36, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); } }; });
  // ===== 13. "Historian Roger Ekirch found this in hundreds of old diaries and letters."  the desk of diaries; she reads one
  SH([5, 'Historian'], 'C', (t0) => { const scene = new THREE.Scene(); const C0 = cellSet(scene); plants(scene, [[-1.9, 0.6, 0.5]]); const ch = hero(scene, { p: [0.6, 0, 0.2], ry: -0.5 }); const bk = bookObj(0x2a4a6a); scene.add(bk); const fp = V3([0, 0, 0]);
    const pile = new THREE.Group(); pile.position.copy(C0.table); scene.add(pile); for (let i = 0; i < 9; i++) { const b = bookObj([0x7a2a1a, 0x2a4a6a, 0x5a4a2a][i % 3]); b.position.set(-0.35 + (i % 3) * 0.2, Math.floor(i / 3) * 0.04, -0.05 + (i % 2) * 0.05); b.rotation.y = i * 0.6; pile.add(b); }
    const tH = ws(5, 'hundreds'); cue(t0 + 0.2, 'page_turn'); cue(tH, 'paper');
    return { scene, cam: CAM([[0.6, 1.35, 1.9], [0.55, 1.33, 1.75]], [[0.5, 0.95, -0.4]], 50), upd(t) { ch.drive(t, [still('hold_up_object', 0.8)], [[-99, 'open', 'smile'], [tH, 'surprised', 'talkO']]); scene.updateMatrixWorld(true); ch.fist('R', fp); bk.position.copy(fp).add(V3([0.02, 0.06, 0.08])); bk.rotation.set(-1.2, 0.3, 0); },
      ov(o, t) { plateText(o, 'ROGER EKIRCH', CX, 36, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); plateText(o, 'HISTORIAN', CX, 58, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tH) plateText(o, 'HUNDREDS OF DIARIES', CX, 400, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tH) }); } }; });
  // ===== 14. "Even Chaucer mentions a 'first sleep', over 600 years ago."  a manuscript page (vertical), she points at the line
  SH([5, 'Even'], 'C', (t0) => { const scene = new THREE.Scene(); labSet(scene); const ch = hero(scene, { p: [-0.55, -0.6, 0.4], ry: 0.5 }); const tF = ws(5, 'first'); cue(t0, 'page_turn'); cue(tF, 'label');
    return { scene, cam: CAM([[0, 0.65, 3.4]], [[0, 0.65, 0]], 46), upd(t) { ch.drive(t, [seg('point', t0 - 0.2)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t, c) { cham(c, 96, 60, 166, 250, 5, '#141008'); cham(c, 98, 62, 162, 246, 4, '#efe4c8'); c.fillStyle = '#7a2a1a'; c.fillRect(98, 62, 162, 16); bitText(c, 'CHAUCER', 179, 70, 1, '#ffffff', { outline: null });
        bitText(c, 'c. 1390', 179, 92, 1, '#5a3a1c', { outline: null }); c.fillStyle = '#b8a888'; for (let y = 108; y < 300; y += 9) c.fillRect(110, y, 138, 1);
        c.fillStyle = '#c84a3a'; c.fillRect(110, 150, 14, 14); bitText(c, 'S', 117, 157, 1, '#fff2a0', { outline: null });
        if (t >= tF) { c.fillStyle = 'rgba(253,217,65,0.55)'; c.fillRect(106, 180, 146, 30); } bitText(c, 'SHE SLEPT HIR', 179, 188, 1, '#2a1a0a', { outline: null }); bitText(c, 'FIRSTE SLEEP', 179, 202, 1, '#2a1a0a', { outline: null });
        if (t >= tF) plateText(o, '600+ YEARS AGO', CX, 36, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tF) }); } }; });
  // ===== 15. "Then street lamps and gas lights made nights brighter."  the town at night, the lamps switch on one by one
  SH([6, 'Then'], 'M', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: false }); const ch = hero(scene, { p: [0.4, 0, 1.2], ry: -0.4 }); nightGrade(scene, [ch]); const tG = ws(6, 'gas');
    const lamps = [[-2.6, -2.7], [3.0, -2.6], [-6.4, 0.6], [6.6, 0.8]].map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x + 0.22, 2.42, z); scene.add(g); const b = L.box(0.24, 0.32, 0.24, L.basic(null, 0xffe8a0), 0, 0, 0, g); const p = new THREE.PointLight(0xffd890, 0, 6); p.position.set(x + 0.22, 2.2, z + 0.4); scene.add(p); g.visible = false; return [g, p, t0 + 0.4 + i * 0.35]; });
    lamps.forEach(([, , tt]) => cue(tt, 'click')); cue(tG, 'gas_whoosh');
    return { scene, cam: CAM([[1.6, 1.4, 4.2], [1.4, 1.5, 3.7]], [[-0.4, 2.0, -2.5]], 62), upd(t) { const q = q15(t); lamps.forEach(([g, p, tt]) => { const on = q >= tt; g.visible = on; p.intensity = on ? 3 : 0; }); ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'surprised', 'talkO']]); },
      ov(o, t) { plateText(o, 'STREET LAMPS', CX, 36, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, t0 + 0.4) }); if (t >= tG) plateText(o, 'GAS LIGHT', CX, 60, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tG) }); } }; });
  // ===== 16. "People stayed up later…"  the lit town, people still out walking; a clock 23:00
  SH([6, 'People'], 'C', (t0) => { const scene = new THREE.Scene(); mmlTown(scene, { preset: 'night', night: true }); cue(t0 + 0.1, 'crowd_murmur');
    const vs = [['homework_girl', 'red', -1.2, -1.0, 1.2], ['bank_teller', 'olive', 0.8, -1.6, -1.4], ['art_student', 'teal', 1.6, -0.6, -1.8]].map(([id, v, x, z, ry]) => { const n = npc(id, id, v); n.position.set(x, 0, z); n.rotation.y = ry; scene.add(n); if (id === 'bank_teller') tricorn(n); return n; });
    const ch = hero(scene, { p: [-0.2, 0, 0.4], ry: 0.2 }); nightGrade(scene, [...vs, ch]);
    return { scene, cam: CAM([[0.1, 1.3, 3.0], [0.05, 1.3, 2.8]], [[-0.1, 1.1, -0.8]], 54), upd(t) { const q = q15(t); vs.forEach((n, i) => { n.walk((q - t0) * 1.3 + i * 0.4); }); ch.drive(t, [seg('shrug', t0 - 0.1)], [[-99, 'open', 'smirk']]); },
      ov(o, t) { clock(o, CX, 70, '23:00', '#fff2a0'); plateText(o, 'STILL UP', CX, 105, { size: 12, border: '#ff9a5a', fg: '#ffe0c8', scale: popS(t, t0 + 0.3) }); } }; });
  // ===== 17. "…and the two sleeps got squeezed into one."  the night bar: the gap closes, two blocks become one; she presses her palms together
  SH([6, 'and', 2], 'C', (t0, t1) => { const scene = new THREE.Scene(); labSet(scene); const ch = hero(scene, { p: [0, -0.6, 0.5], ry: 0.05 }); const tO = ws(6, 'one'); cue(t0 + 0.2, 'squeeze'); cue(tO, 'punch');
    return { scene, cam: CAM([[0, 0.6, 3.0]], [[0, 0.5, 0]], 46), upd(t) { ch.drive(t, [seg('press_down', t0 - 0.1, { loop: true })], [[-99, 'angry', 'frown'], [tO, 'surprised', 'gasp']]); },
      ov(o, t) { const k = smooth((t - t0 - 0.2) / Math.max(0.4, tO - t0 - 0.2)); sleepBar(o, 90, 1, 1, { merged: k }); if (t >= tO) plateText(o, '2  >  1', CX, 140, { size: 14, border: '#ff6a6a', fg: '#ffd0d0', scale: popS(t, tO) }); } }; });
  // ===== 18. "In 1992, scientist Thomas Wehr…"  a sleep lab (Exp01's lab set, re-dated); the scientist in a lab coat
  SH([7, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); sleepLab(scene); plants(scene, [[-2.2, -1.6, 0.5]]); const sc = labCoat(npcAt(scene, 'bank_teller', 'grey', 0.55, -0.5, -0.4)); sc.walk(0); npcSet(sc, 'Bone004', -0.9);
    const ch = hero(scene, { p: [-0.55, 0, 0.5], ry: 0.4 }); const tW = ws(7, 'Wehr'); cue(t0 + 0.1, 'lab_hum'); cue(tW, 'label');
    return { scene, cam: CAM([[0.05, 1.35, 2.8], [0.0, 1.33, 2.6]], [[0.0, 1.0, -0.5]], 50), upd(t) { ch.drive(t, [seg('present', t0 - 0.1)], [[-99, 'happy', 'smileOpen']]); },
      ov(o, t) { plateText(o, '1992', CX, 36, { size: 14, border: '#ffd93b', fg: '#fff2a0' }); if (t >= tW) plateText(o, 'THOMAS WEHR', CX, 62, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tW) }); } }; });
  // ===== 19. "…gave volunteers 14 hours of darkness every night."  three volunteers in beds, the lights go off, 14:00 h
  function wardBeds(scene) { const vs = []; [-0.95, 0, 0.95].forEach((x, i) => { const b = bed(scene, { x, z: 0, quilt: [0x4a72b8, 0x7a5a3a, 0x4a8a5a][i], full: true }); vs.push(lieNpc(scene, ['homework_girl', 'bank_teller', 'art_student'][i], ['green', 'navy', 'teal'][i], x, 0.56, 0.75)); }); return vs; }
  SH([7, 'volunteers'], 'C', (t0) => { const scene = new THREE.Scene(); sleepLab(scene); const vs = wardBeds(scene); const tD = ws(7, 'darkness'); cue(tD - 0.15, 'click');
    let dark = false; return { scene, cam: CAM([[0.0, 2.2, 2.6], [0.0, 2.15, 2.45]], [[0.0, 0.5, -0.2]], 54), upd(t) { if (!dark && q15(t) >= tD - 0.15) { dark = true; nightGrade(scene); } },
      ov(o, t) { if (t >= tD) plateText(o, '14 H OF DARKNESS', CX, 60, { size: 12, border: '#7cf0ff', fg: '#c8f8ff', scale: popS(t, tD) }); } }; });
  // ===== 20. "After a few weeks, many started waking up in the middle of the night… then sleeping again."  "!" pops one by one, then Zs
  SH([7, 'After'], 'C', (t0) => { const scene = new THREE.Scene(); sleepLab(scene); const vs = wardBeds(scene); nightGrade(scene); const tM = ws(7, 'middle'), tS = ws(7, 'sleeping');
    const fx = new FX(LW, LH); vs.forEach((n, i) => { fx.add('exclaim', { target: n, offset: [0, 0.35, -1.2], t0: tM + i * 0.2, dur: tS - tM - i * 0.2, scale: 0.7 }); cue(tM + i * 0.2, 'blip'); }); cue(tS, 'snore');
    return { scene, fx, cam: CAM([[0.0, 2.2, 2.6], [0.0, 2.15, 2.45]], [[0.0, 0.5, -0.2]], 54),
      ov(o, t) { plateText(o, 'WEEK 4', CX, 36, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); sleepBar(o, 380, 1, t >= tS ? clamp01((t - tS) / 0.8) : 0); if (t >= tS) zzz(o, 160, 230, t - tS); } }; });
  // ===== 21. "So if you're awake at 3 a.m., your body might just remember the old schedule."  back in her bed, calm, the old bar as a ghost
  SH([8, 'So'], 'C', (t0) => { const scene = new THREE.Scene(); const R0 = roomWithWindow(scene, { preset: 'night', wx: 0.6 }); const bd = bed(scene, { x: -0.25, z: -0.1, full: true }); plants(scene, [[0.95, -0.55, 0.45]]); nightGrade(scene); const ch = hero(scene); inBed(ch, bd);
    const tO = ws(8, 'old'); cue(t0 + 0.1, 'tick'); cue(tO, 'warm_chord');
    return { scene, cam: CAM([[0.9, 1.35, 1.7], [0.85, 1.32, 1.6]], [[-0.2, 0.85, -0.6]], 52), upd(t) { ch.drive(t, [still('wake_sit_up', 9)], [[-99, 'relaxed', 'smile']]); },
      ov(o, t) { sunInWindow(o, this.cam, R0.win, 0.8, t - t0, 'moon'); clock(o, CX, 90, '3:00'); if (t >= tO) { sleepBar(o, 380, 1, 1); plateText(o, 'OLD SCHEDULE', CX, 345, { size: 12, border: '#b0a0ff', fg: '#e8e0ff', scale: popS(t, tO) }); } } }; });
  // ===== 22. "Humans had a free hour every night… and traded it for a light bulb?"  she holds up a glowing bulb, puzzled
  SH([9, 'Humans'], 'C', (t0) => { const scene = new THREE.Scene(); labSet(scene); const ch = hero(scene, { p: [0, -0.6, 0.6], ry: 0.05 }); const lb = lightBulb(); lb.scale.setScalar(1.6); scene.add(lb); const fp = V3([0, 0, 0]);
    const glow = new THREE.PointLight(0xfff0a0, 0, 2); scene.add(glow); const tB = ws(9, 'bulb'); cue(tB - 0.1, 'click'); cue(tB, 'question_pop');
    const fx = new FX(LW, LH).add('question', { obj: ch.root, bone: 'Head', offset: [0.15, 0.42, 0], t0: tB + 0.1, dur: 9 }).add('sparkle', { world: [0.15, 0.85, 0.8], t0: tB, dur: 9, n: 4, radius: 16, color: '#fff2a0' });
    return { scene, fx, cam: CAM([[0, 0.6, 2.7]], [[0, 0.55, 0]], 44), upd(t) { ch.drive(t, [seg('hold_up_object', t0 - 0.3)], [[-99, 'open', 'smile'], [tB, 'surprised', 'talkO']]); scene.updateMatrixWorld(true); ch.fist('R', fp); lb.position.copy(fp).add(V3([0, 0.06, 0.04])); glow.position.copy(lb.position); glow.intensity = q15(t) >= tB - 0.1 ? 2.5 : 0; },
      ov(o, t) { plateText(o, '1 FREE HOUR', CX, 60, { size: 14, border: '#9cf09c', fg: '#e0ffe0', scale: popS(t, t0 + 0.2) }); if (t >= tB) plateText(o, '= 1 LIGHT BULB?', CX, 86, { size: 12, border: '#ffd93b', fg: '#fff2a0', scale: popS(t, tB) }); } }; });
  // ===== 23. "The full bedroom expedition is on my channel. Humans… understood. Logging off."  the meadow (Exp01), she waves; small outro
  SH([10, 'The'], 'M', (t0) => { const scene = new THREE.Scene(); hillSet(scene); const ch = hero(scene, { p: [0.3, 0, 0.6], ry: 0.15 }); const tLo = ws(10, 'Logging'), tOut = TL.dur + 0.05; cue(t0 + 0.2, 'birds'); cue(tLo, 'blip'); cue(tOut, 'end_jingle');
    return { scene, cam: CAM([[0.4, 1.05, 3.0], [0.6, 1.25, 4.4]], [[0.25, 1.0, 0.4], [0.25, 1.05, 0.2]], 46), upd(t) { ch.drive(t, [seg('present', t0 - 0.2), seg('wave', tLo - 0.3, { fade: 0.12 })], [[-99, 'happy', 'smileOpen'], [tLo, 'wink', 'blushSmile']]); },
      ov(o, t, c) { if (t < tLo) { plateText(o, 'FULL EXPEDITION', CX, 40, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); plateText(o, 'ON MY CHANNEL', CX, 64, { size: 12, border: '#ffd93b', fg: '#fff2a0' }); }
        if (t >= tOut) { plateText(o, CHANNEL, CX, 40, { size: 12, border: '#fdd941', fg: '#fdd941', scale: popS(t, tOut) }); if (t >= tOut + 0.4) { const w = 90, h = 14, X = CX - w / 2, Y = 60; c.fillStyle = '#040412'; c.fillRect(X - 2, Y - 2, w + 4, h + 4); c.fillStyle = '#fe2c55'; c.fillRect(X, Y, w, h); bitText(c, 'FOLLOW', CX, Y + 7, 1, '#ffffff', { outline: null }); } } } }; });

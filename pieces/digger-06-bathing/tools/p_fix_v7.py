# user feedback v2: opening line, Henry = existing NPC + crown + royal cape, all pending review items
import os, re
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine")
p = os.path.join(E, "d06_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90])
    s = s.replace(a, b)
def block(k):   # the source of shot k (from its "// ===== k." comment to the next shot comment)
    i = s.index(f"  // ===== {k}. "); j = s.index("  // ===== ", i + 10); return i, j
def set_block(k, txt):
    global s
    i, j = block(k); s = s[:i] + txt + s[j:]

# ---------- helpers ----------
rep("  const IN = (ch, y) => {", """  // Henry VIII (user v2): an EXISTING lib NPC, only a crown on the head + a royal cape (red, ermine trim) around the shoulders, both parented to it
  function royalCape(n) { const h = headInfo(n), H = h.top, r = Math.max(h.rx, h.rz), g = new THREE.Group(); g.position.set(h.cx, 0, h.cz); n.add(g);
    const red = new THREE.MeshLambertMaterial({ color: 0xb01a2a, side: THREE.DoubleSide, flatShading: true }), erm = litM(L.rep(ERMINE, 4, 1), 0xffffff); erm.side = THREE.DoubleSide;
    L.mesh(new THREE.CylinderGeometry(r * 1.55, r * 2.25, H * 0.66, 12, 1, true, Math.PI * 0.32, Math.PI * 1.36), red, 0, H * 0.43, -r * 0.1, g);   // open at the front
    L.mesh(new THREE.CylinderGeometry(r * 2.27, r * 2.27, H * 0.05, 12, 1, true, Math.PI * 0.32, Math.PI * 1.36), erm, 0, H * 0.12, -r * 0.1, g);   // ermine hem
    const col = L.mesh(new THREE.TorusGeometry(r * 1.45, r * 0.28, 5, 14), litM(L.rep(ERMINE, 3, 1), 0xffffff), 0, H * 0.76, -r * 0.05, g); col.rotation.x = Math.PI / 2; col.scale.set(1.05, 0.8, 1);   // ermine collar on the shoulders
    n.updateMatrixWorld(true); (n.bones.Bone000 || n).attach(g); return n; }
  function plagueDoctor(n) { const h = headInfo(n), H = h.top, r = Math.max(h.rx, h.rz), g = new THREE.Group(); g.position.set(h.cx, 0, h.cz); n.add(g); const blk = new THREE.MeshLambertMaterial({ color: 0x1e1e26, side: THREE.DoubleSide, flatShading: true });
    L.mesh(new THREE.CylinderGeometry(r * 1.4, r * 2.1, H * 0.74, 10, 1, true), blk, 0, H * 0.4, 0, g);   // long waxed robe to the floor
    L.mesh(new THREE.CylinderGeometry(r * 1.42, r * 1.42, H * 0.04, 10), litM(null, 0x3a2a1a), 0, H * 0.5, 0, g);   // belt
    const bk = L.box(r * 1.1, r * 1.4, r * 0.35, litM(null, 0x6a2a1a), r * 0.9, H * 0.52, r * 1.9, g); bk.rotation.y = -0.3; L.box(r * 1.0, r * 1.3, r * 0.37, litM(null, 0xf0e8d0), r * 0.86, H * 0.52, r * 1.9, g).rotation.y = -0.3;   // the medical book
    const fl = new THREE.Group(); fl.position.set(-r * 1.25, H * 0.5, r * 1.6); g.add(fl); L.mesh(new THREE.SphereGeometry(r * 0.45, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5ac85a, transparent: true, opacity: 0.85 }), 0, 0, 0, fl); L.box(r * 0.2, r * 0.4, r * 0.2, litM(null, 0xc8a070), 0, r * 0.55, 0, fl);   // a flask of medicine
    n.updateMatrixWorld(true); (n.bones.Bone000 || n).attach(g);
    const hat = new THREE.Group(); L.mesh(new THREE.CylinderGeometry(r * 2.1, r * 2.1, r * 0.12, 14), litM(null, 0x18181c), 0, -r * 0.3, 0, hat); L.mesh(new THREE.CylinderGeometry(r * 0.95, r * 1.1, r * 0.9, 12), litM(null, 0x18181c), 0, r * 0.1, 0, hat);
    L.mesh(new THREE.CylinderGeometry(r * 1.11, r * 1.11, r * 0.16, 12), litM(null, 0x6a4a2a), 0, -r * 0.18, 0, hat); seat(n, hat); return n; }   // wide-brimmed period hat, seated on the head
  function strigil2() { const g = new THREE.Group(), st = new THREE.MeshBasicMaterial({ color: 0xf2f6fa }), ed = new THREE.MeshBasicMaterial({ color: 0x3a4250 });
    const bl = L.mesh(new THREE.TorusGeometry(0.13, 0.024, 4, 14, Math.PI * 0.85), st, 0, 0.16, 0, g); bl.rotation.z = Math.PI * 0.55; const be = L.mesh(new THREE.TorusGeometry(0.13, 0.03, 4, 14, Math.PI * 0.85), ed, 0, 0.16, -0.006, g); be.rotation.z = Math.PI * 0.55;   // bright silver blade with a dark rim
    L.box(0.045, 0.16, 0.045, litM(null, 0x5a3418), 0, 0.0, 0, g); return g; }
  function faceUp(ch, a) { let hd = null; ch.root.traverse((o) => { if (!hd && o.isBone && o.name === 'Head') hd = o; }); hd.rotation.x -= a; }   // hair off the face: lift the chin a little
  const IN = (ch, y) => {""")

# ---------- 1. opening line reordered: the shot starts at "Five" ----------
rep("SH([1, 'There'], 'C',", "SH([1, 'Five'], 'C',")

# ---------- hair / steam off her face: river, Roman pool, bathhouse ----------
rep("[seg('shiver', tF, { loop: true })], [[-99, 'happy', 'smile'], [tF, 'angry', 'frown']]); } }; });", "[seg('shiver', tF, { loop: true })], [[-99, 'happy', 'smile'], [tF, 'angry', 'frown']]); faceUp(ch, 0.3); } }; });")
rep("add('shake', { obj: ch.root, bone: 'Head', offset: [0, -0.1, 0], t0: tF, dur: 99 })", "add('shake', { obj: ch.root, bone: 'Head', offset: [0.22, 0.1, 0], t0: tF, dur: 99 })")
rep("add('steam', { obj: ch.root, bone: 'Head', offset: [0.08, -0.05, 0.12], t0: tF, dur: 99, every: 0.5, life: 0.8, rise: 16, color: '#e8f4ff', edge: '#a8c8d8' })", "add('steam', { obj: ch.root, bone: 'Head', offset: [0.2, -0.12, 0.12], t0: tF, dur: 99, every: 0.5, life: 0.8, rise: 10, color: '#e8f4ff', edge: '#a8c8d8' })")
rep("ch.drive(t, KNEEL_IN(t, t0), [[-99, 'relaxed', 'smile'], [t0 + 0.6, 'happy', 'smileOpen']]); } }; });", "ch.drive(t, KNEEL_IN(t, t0), [[-99, 'happy', 'smile'], [t0 + 0.6, 'happy', 'smileOpen']]); faceUp(ch, 0.45); } }; });")
rep("add('steam', { world: [0.05, 0.75, 0.3], t0, dur: 99, every: 0.22, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' })", "add('steam', { world: [-0.42, 0.75, 0.25], t0, dur: 99, every: 0.25, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' }).add('steam', { world: [0.52, 0.75, 0.25], t0: t0 + 0.12, dur: 99, every: 0.25, life: 1.5, rise: 55, color: '#ffffff', edge: '#c8d0d8' })")
rep("ch.drive(t, SIT_IN(), [[-99, 'relaxed', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]); } }; });", "ch.drive(t, SIT_IN(), [[-99, 'happy', 'smile'], [tS, 'happy', 'smileOpen'], [tR, 'surprised', 'gasp']]); faceUp(ch, 0.4); } }; });")
rep("add('sweat', { obj: ch.root, bone: 'Head', offset: [0.14, 0.2, 0.05], t0: tS, dur: 99 })", "add('sweat', { obj: ch.root, bone: 'Head', offset: [0.2, 0.22, 0.05], t0: tS, dur: 99 })")

# ---------- strigil: oil (flask pours, gleam on the arm), then a big bright strigil scraping, hands together in front ----------
set_block(5, """  // ===== 5. "No soap: you oiled your skin and scraped it off with a curved metal stick. This is a strigil."  hands together in front of her: the flask pours oil (gleam), then the big silver strigil scrapes along her arm; meter 2
  SH([3, 'No'], 'C', (t0) => { const scene = new THREE.Scene(); thermae(scene); const ch = hero(scene, { p: [0.0, 0, 1.15], ry: 0.1 }); sepia(scene, [ch]); const cam = CAM([[0.1, 1.25, 3.3], [0.08, 1.23, 3.15]], [[0.0, 1.05, 0.9]], 46); const mt = meter(scene, cam);
    const sg = strigil2(); sg.scale.setScalar(1.5); scene.add(sg); const fl = oilFlask(); fl.scale.setScalar(1.6); scene.add(fl); const fp = V3([0, 0, 0]), fq = V3([0, 0, 0]);
    const tS = ws(3, 'strigil'), tO = ws(3, 'oiled'), tSc = ws(3, 'scraped'); cue(tO, 'oil_pour'); cue(tSc, 'scrape'); cue(tSc + 0.6, 'scrape'); const lab = label3D(scene, 'STRIGIL', 0, 0, 0, tS, { size: 0.15 }); const lab2 = label3D(scene, 'OIL', 0, 0, 0, tO, { size: 0.12, front: 0xffd84a, side: 0x8a6a1a });
    const gl = new THREE.Group(); scene.add(gl); for (let i = 0; i < 4; i++) L.box(0.05, 0.012, 0.012, new THREE.MeshBasicMaterial({ color: 0xfff6a0 }), 0, i * 0.03, 0, gl);
    const fx = new FX(LW, LH).add('drip', { target: fl, offset: [0.1, 0.02, 0], t0: tO, dur: tSc - tO, color: '#f0c840' }).add('sparkle', { target: gl, offset: [0, 0.03, 0.03], t0: tO + 0.3, dur: tSc - tO, n: 5, radius: 14, color: '#fff2a0' })
      .add('sparkle', { target: sg, offset: [0, 0.2, 0.03], t0: tS, dur: 99, n: 4, radius: 16, color: '#ffffff' });
    return { scene, cam, fx, upd(t) { mt(t); lab(t); lab2(t); const q = q15(t); ch.drive(t, q < tS - 0.1 ? [seg('warm_hands', t0 - 0.3, { loop: true })] : [seg('hold_up_object', tS - 0.15)], [[-99, 'open', 'smile'], [tO, 'happy', 'smileOpen'], [tS, 'happy', 'smileOpen']]);
      scene.updateMatrixWorld(true); ch.fist('R', fp); ch.fist('L', fq); const oil = q >= tO - 0.2 && q < tSc; gl.visible = q >= tO; gl.position.copy(fq).lerp(fp, 0.5).add(V3([0, 0.02, 0.06]));
      if (oil) { fl.visible = true; fl.position.copy(fp).add(V3([0, 0.08, 0.05])); fl.rotation.set(0, 0, -1.25); } else { fl.visible = q < tO - 0.2; fl.position.set(-0.55, 0.0, 1.35); fl.rotation.set(0, 0, 0); }
      sg.visible = !oil && q >= tSc - 0.2; sg.position.copy(fp).add(V3([0, 0.02, 0.06])); if (q < tS - 0.1) { sg.lookAt(fq); sg.rotateX(-1.2 + 0.45 * Math.sin(q * 10)); } else sg.rotation.set(0, 0, 0.2); } }; });
""")

# ---------- Henry: existing NPC + crown + royal cape; her fist clear of him ----------
rep("L.box(1.0, 0.16, 0.9, mm(MT.carved, 1, 0.3), 0.5, 0.08, -0.5, scene); henryVIII(scene, 0.5, -0.5, 0.9, -0.3);",
    "L.box(0.9, 0.16, 0.8, mm(MT.carved, 1, 0.3), 0.65, 0.08, -0.5, scene); const hk = royalCape(npcAt(scene, 'bank_teller', 'navy', 0.65, -0.5, -0.35, 1.3)); hk.position.y = 0.16; hk.walk(0); crownOf(hk);")
rep("const ch = hero(scene, { p: [-0.3, 0, 0.9], ry: 0.3 });", "const ch = hero(scene, { p: [-0.55, 0, 0.95], ry: 0.25 });")
rep("const cam = CAM([[0.05, 1.45, 4.5], [0.05, 1.43, 4.3]], [[0.05, 1.5, 0]], 50);", "const cam = CAM([[-0.02, 1.45, 4.6], [-0.02, 1.43, 4.4]], [[-0.02, 1.45, 0]], 50);")
rep("woodTub(scene, -0.95, -0.2, 0.5, 0.58);", "woodTub(scene, -1.15, -0.6, 0.5, 0.58);")
rep("const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), -0.95, 0.62, 0.32, scene);", "const plank = L.box(1.15, 0.12, 0.05, mm(MT.wood, 1, 0.2), -1.15, 0.62, -0.08, scene);")

# ---------- doctor: plague-doctor-style robe, wide period hat, book + medicine flask ----------
rep("const dr = doctorOf(npcAt(scene, 'bank_teller', 'grey', -0.3, 0.35, 0.5, 1.05)); dr.walk(0); npcSet(dr, 'Bone004', -1.6);",
    "const dr = plagueDoctor(npcAt(scene, 'bank_teller', 'grey', -0.3, 0.35, 0.5, 1.05)); dr.walk(0); const ld = label3D(scene, 'DOCTOR', 0, 0, 0, t0 + 0.15, { size: 0.12, slot: 1, front: 0xffffff, side: 0x9a8a6a });")
rep("return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tD - 0.1, { fade: 0.1 })]", "return { scene, cam, fx, upd(t) { mt(t); lab(t); ld(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tD - 0.1, { fade: 0.1 })]")

# ---------- tin tub: the kettle IN the mother's hand ----------
rep("const mum = npcAt(scene, 'bank_teller', 'olive', -0.9, 0.5, 1.35, 0.9); mum.walk(0); const kt = kettle(scene, -0.64, 0.95, 0.45); kt.rotation.z = -0.95; kt.scale.setScalar(1.1);",
    "const mum = npcAt(scene, 'art_student', 'rose', -0.95, 0.45, 1.45, 0.95); mum.walk(0); npcSet(mum, 'Bone004', -1.25); const kt = kettle(scene, 0, 0, 0); kt.scale.setScalar(1.1); const hp0 = npcHand(mum, 'R'); kt.position.copy(hp0).add(V3([0.02, -0.14, 0])); mum.updateMatrixWorld(true); mum.bones.Bone005.attach(kt); const kr0 = kt.rotation.z;")
rep("const pour = stream(scene, V3([-0.47, 0.98, 0.45]), V3([-0.36, 0.45, 0.42])", "const pour = stream(scene, V3([-0.42, 0.88, 0.45]), V3([-0.34, 0.45, 0.42])")
rep("pour(t); pour.set(on); kt.rotation.z = on ? -0.95 : -0.3; }", "pour(t); pour.set(on); kt.rotation.z = kr0 + (on ? -0.8 : 0); }")

# ---------- baby last: the baby waits by the murky tub ----------
rep("const lab = label3D(scene, 'BABY: LAST', 0, 0, 0, tB, { size: 0.13 });",
    "const lab = label3D(scene, 'BABY: LAST', 0, 0, 0, tB, { size: 0.13 }); const bb = npcAt(scene, 'homework_girl', 'blue', 0.95, 0.75, -1.0, 0.42); bb.walk(0); const fx2 = new FX(LW, LH);\n"
    "    fx.add('question', { obj: bb, offset: [0, 0.8, 0], t0: tB, dur: 99 });")
rep("const cam = CAM([[0.2, 1.35, 3.1], [0.18, 1.33, 2.95]], [[0.15, 0.95, 0.3]], 50);", "const cam = CAM([[0.4, 1.3, 3.3], [0.38, 1.28, 3.15]], [[0.45, 0.85, 0.4]], 50);")

# ---------- modern shower: head on an arm, riser and heater pipe connected, heater pipe down to the floor ----------
i = s.index("const B = bathroom(scene); { const wh"); j = s.index("pottedTree(scene, -0.95, -0.85, 0.55);", i)
s = s[:i] + """const B = bathroom(scene); { const wh = litM(null, 0xf4f4f0), cu = litM(null, 0xc87a3a), ch2 = litM(null, 0xd8dce4);
      L.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12), wh, -0.75, 1.95, -0.92, scene); L.mesh(new THREE.SphereGeometry(0.24, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), wh, -0.75, 2.35, -0.92, scene); L.box(0.12, 0.08, 0.02, litM(null, 0xe84a3a), -0.75, 1.9, -0.67, scene);
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), cu, -0.75, 2.66, -0.92, scene); L.box(0.06, 0.06, 0.24, cu, -0.75, 2.76, -1.02, scene); L.box(0.78, 0.06, 0.06, cu, -0.37, 2.76, -1.12, scene);   // heater -> hot pipe -> the shower riser
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.55, 8), cu, -0.75, 0.78, -1.1, scene);   // supply pipe down into the floor
      L.mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 8), ch2, 0.0, 2.2, -1.12, scene); const a2 = L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 8), ch2, 0.0, 2.74, -0.95, scene); a2.rotation.x = Math.PI / 2;   // riser + arm
      L.mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), ch2, 0.0, 2.69, -0.77, scene); L.mesh(new THREE.CylinderGeometry(0.2, 0.09, 0.09, 14), ch2, 0.0, 2.6, -0.77, scene);   // the big shower head, hanging from the arm
      for (const [x, c] of [[-0.12, 0xe84a3a], [0.12, 0x4a8ae8]]) { L.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), litM(null, c), x, 1.2, -1.12, scene).rotation.x = Math.PI / 2; } B.head.visible = false; }
    """ + s[j:]
rep("const st = stream(scene, V3([0.0, 2.54, -0.78]),", "const st = stream(scene, V3([0.0, 2.55, -0.77]),")
open(p, "w", encoding="utf-8").write(s); print("ok")

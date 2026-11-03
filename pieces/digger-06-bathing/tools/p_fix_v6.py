# review v1 fixes (renders/digger06_bathing_v1_revision.md)
import os
E = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine")
p = os.path.join(E, "d06_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b):
    global s
    assert s.count(a) == 1, a[:80]
    s = s.replace(a, b)
# 7. river: no anachronistic aerial / window frame from hillSet; moving ripples, foam at the rocks
rep("function riverBank(scene) { hillSet(scene); scene.fog = null;",
    "function riverBank(scene) { meadow(scene); scene.fog = null; { const h = L.mesh(new THREE.SphereGeometry(4, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ map: meadowTex(32, 32, GRASS, [6, 3]), flatShading: true }), 0, -1.2, -4.6, scene); h.scale.y = 0.55; }")
rep("for (let i = 0; i < 9; i++) L.box(0.5, 0.012, 0.03, new THREE.MeshBasicMaterial({ color: 0xd8f0ff }), -2.2 + i * 0.55, 0.325, -0.4 + (i % 3) * 0.45, scene);",
    "const rip = []; for (let i = 0; i < 16; i++) { const r = L.box(0.35 + (i % 3) * 0.12, 0.02, 0.035, new THREE.MeshBasicMaterial({ color: 0xe8f8ff }), 0, 0.33, -0.75 + (i % 5) * 0.42, scene); r.userData.x0 = i * 0.61; rip.push(r); }\n"
    "    for (const [x, z] of [[-0.9, -0.3], [1.1, 0.5], [-1.6, 0.8]]) { const o = L.mesh(new THREE.DodecahedronGeometry(0.16, 0), mm(MT.stone, 1, 1), x, 0.3, z, scene); o.rotation.set(x, z, 0); const f = L.mesh(new THREE.TorusGeometry(0.2, 0.03, 4, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), x, 0.33, z, scene); f.rotation.x = Math.PI / 2; }")
rep("    return { water }; }\n  function thermae", "    return { water, rip }; }\n  function thermae")
rep("SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: 0.15 });",
    "SH([2, 'First'], 'C', (t0) => { const scene = new THREE.Scene(); const RB = riverBank(scene); const ch = hero(scene, { p: [0.0, 0, 0.35], ry: 0.15 }); sepia(scene, [ch]);")
rep("return { scene, cam, fx, upd(t) { mt(t); lab(t); ch.root.position.z = 0.35",
    "return { scene, cam, fx, upd(t) { mt(t); lab(t); RB.rip.forEach((r) => { r.position.x = ((r.userData.x0 + q15(t) * 0.5) % 5) - 2.5; }); ch.root.position.z = 0.35")
# 14. hook: face to camera from frame 0 (look_around starts turned)
rep("ch.drive(t, [seg('look_around', t0 - 0.2)], [[-99, 'open', 'neutral'], [tM, 'surprised', 'gasp']]);",
    "ch.drive(t, [seg('idle', -99, { loop: true }), seg('look_around', t0 + 1.2, { fade: 0.15 })], [[-99, 'open', 'neutral'], [tM, 'surprised', 'gasp']]);")
# 1. strigil: oil first (flask in hand, drips), then the strigil IN the right hand, scraping the outstretched left arm; smaller, face clear
rep("const sg = strigil(); sg.scale.setScalar(1.6);", "const sg = strigil(); sg.scale.setScalar(1.05);")
rep("const fx = new FX(LW, LH).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.25, -0.35, 0.1], t0: tO, dur: 99, n: 4, radius: 16, color: '#fff2a0' });",
    "const tSc = ws(3, 'scraped'); const fx = new FX(LW, LH).add('drip', { target: fl, offset: [0.12, 0.05, 0], t0: tO, dur: tSc - tO, color: '#e8c050' }).add('sparkle', { obj: ch.root, bone: 'Head', offset: [0.25, -0.35, 0.1], t0: tO + 0.3, dur: 99, n: 4, radius: 16, color: '#fff2a0' });")
rep("ch.fist('R', fp); ch.fist('L', fq); const k = q15(t) < ws(3, 'scraped') ? 0.15 : 0.35 + 0.25 * Math.sin(q15(t) * 8); sg.position.copy(fp).lerp(fq, k).add(V3([0, 0.05, 0.04])); sg.rotation.set(0, 0.3 - 0.75, -0.6); } }; });",
    "ch.fist('R', fp); ch.fist('L', fq); const q = q15(t), oil = q >= tO - 0.2 && q < tSc;\n"
    "      if (oil) { fl.position.copy(fp).add(V3([0, 0.02, 0.04])); fl.rotation.set(0, 0, -1.2); fl.scale.setScalar(1.3); } else { fl.position.set(-0.6, 0.0, 1.4); fl.rotation.set(0, 0, 0); fl.scale.setScalar(1.8); }\n"
    "      sg.visible = !oil; sg.position.copy(fp).add(V3([0, 0.03, 0.03])); sg.lookAt(fq); sg.rotateX(q >= tSc ? 0.25 * Math.sin(q * 9) : 0); } }; });")
# 5. meter: no flicker step on "down" (it read as a 3rd bar then back to 2)
rep("[ws(4, 'down'), 2, true], ", "")
# 13. one STEWS label only (the wall sign)
rep("const lab = label3D(scene, 'STEWS', 0, 0, 0, tS, { size: 0.17 });", "const lab = () => {};")
# 4. Henry: filled torso (belly), thicker hose legs
rep("L.box(0.14, 0.62, 0.15, white, s2 * 0.13, 0.31, 0, g);", "L.box(0.2, 0.62, 0.2, white, s2 * 0.14, 0.31, 0, g);")
rep("// broad barrel doublet", "// broad barrel doublet\n    { const b = L.mesh(new THREE.SphereGeometry(0.33, 10, 8), litM(L.rep(DOUBLET, 2, 2), 0xffffff), 0, 1.0, 0.1, g); b.scale.set(1.05, 0.95, 0.75); }   // the belly: a full, closed front")
# 15. doctor: cap seated on the head; basin (and its steam) moved clear of his arm
rep("L.mesh(new THREE.CylinderGeometry(r * 1.15, r * 1.15, r * 0.35, 10), litM(null, 0x18181c), 0, r * 0.05, 0, g);",
    "L.mesh(new THREE.CylinderGeometry(r * 1.2, r * 1.12, r * 0.4, 10), litM(null, 0x18181c), 0, -r * 0.22, 0, g);")
rep("const bs = woodTub(scene, 0.25, -0.45, 0.38, 0.45);", "const bs = woodTub(scene, 0.95, -0.55, 0.36, 0.45);")
rep("add('steam', { world: [0.25, 0.5, -0.45], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 })", "add('steam', { world: [0.95, 0.5, -0.55], t0, dur: 99, every: 0.3, life: 1.3, rise: 45 })")
# 8. dry wash: the shirt soaks up the dirt (browns over time), a real perfume bottle with an atomizer bulb
rep("let done = false; return () => { if (done) return;", "let done = false; const f = () => { if (done) return;")
rep("g.updateMatrixWorld(true); chest.attach(g); }; }", "g.updateMatrixWorld(true); chest.attach(g); }; f.mat = m; return f; }\n"
    "  function perfume2() { const g = new THREE.Group(); const gl = new THREE.MeshBasicMaterial({ color: 0xd8a8f0, transparent: true, opacity: 0.85 });\n"
    "    const b = L.mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.09, 6), gl, 0, 0.045, 0, g); L.mesh(new THREE.SphereGeometry(0.055, 6, 4), gl, 0, 0.09, 0, g).scale.y = 0.5;\n"
    "    L.mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.04, 6), litM(null, 0xe0b840), 0, 0.13, 0, g); const tb = L.box(0.07, 0.01, 0.01, litM(null, 0xe0b840), 0.04, 0.15, 0, g);\n"
    "    L.mesh(new THREE.SphereGeometry(0.03, 6, 4), litM(null, 0xe85a8a), 0.085, 0.15, 0, g).scale.set(1, 1.3, 1); return g; }")
rep("const pf = perfume(); pf.scale.setScalar(1.7);", "const pf = perfume2(); pf.scale.setScalar(1.7);")
rep("shirt(); scene.updateMatrixWorld(true); ch.fist('L', fp);", "shirt(); const kd = Math.min(1, Math.max(0, (q15(t) - ws(5, 'dirt')) / 1.2)); shirt.mat.color.setRGB(1 - 0.28 * kd, 1 - 0.38 * kd, 1 - 0.55 * kd); scene.updateMatrixWorld(true); ch.fist('L', fp);")
# 3. tin tub: metal handles, the mother pours a kettle pot by pot, the family (with the baby) queues in view
TUBH = "for (const s2 of [-1, 1]) { const hd = L.mesh(new THREE.TorusGeometry(0.08, 0.018, 4, 8, Math.PI), litM(null, 0xd8dce4), s2 * 0.76, 0.36, 0, T0.g); hd.rotation.y = Math.PI / 2; }"
rep("const K0 = cottageKitchen(scene); const T0 = tinTub(scene, -0.2, 0.4); T0.g.scale.setScalar(1.4);", "const K0 = cottageKitchen(scene); const T0 = tinTub(scene, -0.2, 0.4); T0.g.scale.setScalar(1.4); " + TUBH +
    "\n    const mum = npcAt(scene, 'bank_teller', 'olive', -1.05, 0.45, 1.35, 0.95); mum.walk(0); const kt = kettle(scene, -0.78, 1.0, 0.42); kt.rotation.z = -0.95; kt.scale.setScalar(1.4); const tF0 = ws(6, 'filled'), tF1 = ws(6, 'whole');\n"
    "    const pour = stream(scene, V3([-0.55, 1.05, 0.42]), V3([-0.42, 0.45, 0.4]), 0xbfe0f0, 0.025, 0.05);")
rep("[['bank_teller', 'olive', 0.7, -0.3, 0.95], ['homework_girl', 'red', 1.15, -0.6, 0.85], ['art_student', 'teal', 1.4, -0.9, 0.72]]",
    "[['bank_teller', 'grey', 0.55, -0.45, 0.95], ['homework_girl', 'red', 0.85, -0.72, 0.8], ['art_student', 'teal', 1.1, -0.98, 0.68], ['homework_girl', 'olive', 1.32, -1.2, 0.42]]")
rep("const cam = CAM(SIDE ? [[3.6, 1.0, 0.3]] : [[0.0, 1.45, 3.8], [0.0, 1.43, 3.6]], SIDE ? [[-0.2, 0.7, 0.3]] : [[-0.15, 0.95, 0.0]], 52);",
    "const cam = CAM(SIDE ? [[3.6, 1.0, 0.3]] : [[0.1, 1.5, 4.6], [0.1, 1.48, 4.4]], SIDE ? [[-0.2, 0.7, 0.3]] : [[0.1, 0.95, 0.0]], 52);")
rep("K0.H0.userData.tick(t); T0.water.material.color.set(", "K0.H0.userData.tick(t); { const on = q15(t) >= tF0 && q15(t) < tF1; pour(t); pour.set(on); kt.rotation.z = on ? -0.95 : -0.3; } T0.water.material.color.set(")
rep("const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.4);", "const T0 = tinTub(scene, 0.15, 0.4, 0x6a5a38); T0.g.scale.setScalar(1.4); " + TUBH)
# 2. Feetham: she PUMPS a lever (it follows her hand), then pulls a chain that runs from the tank to her hand
rep("return { scene, cam, upd(t) { mt(t); y(t); n(t); ch.drive(t, q15(t) < tC ? [seg('idle', -99, { loop: true })] : [seg('pull_chain', tC - 0.2)], [[-99, 'open', 'smile'], [tC, 'happy', 'smileOpen']]); } }; });",
    "const tPm = ws(7, 'pump'); const lever = L.box(0.05, 1, 0.05, litM(null, 0x3a3a40), 0, 0, 0, scene), pv = V3([0.85, 1.25, -0.2]); L.mesh(new THREE.SphereGeometry(0.05, 6, 4), litM(null, 0x3a3a40), 0.85, 1.25, -0.2, scene);\n"
    "    const links = []; for (let i = 0; i < 12; i++) links.push(L.box(0.025, 0.06, 0.015, litM(null, 0x8a8a90), 0, 0, 0, scene)); const top = V3([0.3, 2.44, -0.25]), fa = V3([0, 0, 0]), fb = V3([0, 0, 0]);\n"
    "    return { scene, cam, upd(t) { mt(t); y(t); n(t); const q = q15(t); ch.drive(t, q < tPm - 0.2 ? [seg('idle', -99, { loop: true })] : q < tC - 0.2 ? [seg('pull_chain', tPm - 0.2, { loop: true, speed: 1.4 })] : [seg('pull_chain', tC - 0.2)], [[-99, 'open', 'smile'], [tPm, 'happy', 'talkO'], [tC, 'happy', 'smileOpen']]);\n"
    "      scene.updateMatrixWorld(true); ch.fist('L', fa); ch.fist('R', fb); const hi = fa.y > fb.y ? fa : fb; const pumping = q >= tPm - 0.2 && q < tC - 0.2; const lt = pumping ? (fa.x > fb.x ? fa : fb) : V3([1.05, 0.95, -0.2]);\n"
    "      lever.position.copy(pv).lerp(lt, 0.5); lever.scale.y = pv.distanceTo(lt); lever.quaternion.setFromUnitVectors(V3([0, 1, 0]), lt.clone().sub(pv).normalize());\n"
    "      const end = q >= tC - 0.2 ? hi : V3([0.48, 1.75, -0.25]); links.forEach((l, i) => { l.position.copy(top).lerp(end, (i + 0.5) / links.length); l.rotation.y = i % 2 ? 1.57 : 0; }); } }; });")
# 11. SAME WATER: readable default colours
rep("const lab = label3D(scene, 'SAME WATER', 0, 0, 0, tA - 0.4, { size: 0.12, front: 0xc8a060, side: 0x6a4a1a });", "const lab = label3D(scene, 'SAME WATER', 0, 0, 0, tA - 0.4, { size: 0.13 });")
# 9. pipes and a water heater in the modern bathroom, hot/cold taps
rep("const B = bathroom(scene); pottedTree(scene, -0.95, -0.85, 0.55);",
    "const B = bathroom(scene); { const wh = litM(null, 0xf4f4f0), cu = litM(null, 0xc87a3a); L.mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12), wh, -0.75, 1.95, -0.92, scene); L.mesh(new THREE.SphereGeometry(0.24, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), wh, -0.75, 2.35, -0.92, scene);\n"
    "      L.box(0.12, 0.08, 0.02, litM(null, 0xe84a3a), -0.75, 1.9, -0.67, scene); L.box(0.04, 0.04, 0.68, cu, -0.75, 2.42, -0.9, scene).rotation.x = 0; L.box(0.7, 0.04, 0.04, cu, -0.4, 2.2, -1.1, scene); L.box(0.04, 0.6, 0.04, cu, -0.75, 1.45, -1.1, scene);\n"
    "      for (const [x, c] of [[-0.12, 0xe84a3a], [0.12, 0x4a8ae8]]) { L.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 8), litM(null, c), x, 1.2, -1.12, scene).rotation.x = Math.PI / 2; } }\n"
    "    pottedTree(scene, -0.95, -0.85, 0.55);")
rep("return (t) => { const q = q15(t); m.visible = true; drops.forEach", "const f = (t) => { const q = q15(t); drops.forEach")
rep("(r0 + (r1 - r0) * k)])); }); }; }\n", "(r0 + (r1 - r0) * k)])); }); }; f.set = (v) => { m.visible = v; drops.forEach((d) => { d.visible = v; }); }; return f; }\n")
rep("return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('present', t0 - 0.2)", "return { scene, cam, upd(t) { mt(t); lab(t); if (t >= tOut) cam.children.forEach((o) => { o.visible = false; }); ch.drive(t, [seg('present', t0 - 0.2)")
open(p, "w", encoding="utf-8").write(s)
# Feetham: nothing in the head needs to change; outro: hide the HUD/labels under the channel plate
print("ok")

# review v1 fixes: she USES every machine (hand on the crank / knob / keys), props held out in the hand, no tricorns, Edison speaks into the horn, framing, labels
import os
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d08_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
HELP = """  // place her so her fist (in a still pose) lands on a target (crank, knob, keys)
  function handTo(ch, side, target, segs) { ch.drive(0, segs, [[-99, 'open', 'neutral']], false); ch.root.updateMatrixWorld(true); const f = ch.fist(side, V3([0, 0, 0])); ch.root.position.x += target.x - f.x; ch.root.position.z += target.z - f.z; }
  // a crank turning around a pivot: arm + handle orbiting in the plane normal to the shaft (world axis ax)
  function crankSpin(scene, pivot, ax, r = 0.11) { const g = new THREE.Group(); g.position.copy(pivot); g.quaternion.setFromUnitVectors(V3([1, 0, 0]), ax.clone().normalize()); scene.add(g); const sp = new THREE.Group(); g.add(sp);
    L.box(0.02, r, 0.02, litM(null, 0x2a2a30), 0, r / 2, 0, sp); L.mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 6), litM(null, 0x6a3a1a), 0.04, r, 0, sp).rotation.z = Math.PI / 2; return (t) => { sp.rotation.x = q15(t) * 7; }; }
  function bowtie(n) { const h = headInfo(n), r = Math.max(h.rx, h.rz), g = new THREE.Group(); for (const s2 of [-1, 1]) { const b = L.mesh(new THREE.ConeGeometry(r * 0.28, r * 0.5, 4), litM(null, 0x18181c), s2 * r * 0.25, 0, 0, g); b.rotation.z = s2 * Math.PI / 2; } L.box(r * 0.15, r * 0.15, r * 0.15, litM(null, 0x18181c), 0, 0, 0, g);
    g.position.set(0, -r * 2.25, h.rz * 1.05); seat(n, g); return n; }
  function soundRings(scene, a, b, ta, tb) { const rs = []; for (let i = 0; i < 4; i++) { const m = L.mesh(new THREE.TorusGeometry(0.05, 0.008, 4, 12), new THREE.MeshBasicMaterial({ color: 0xffe21a }), 0, 0, 0, scene); m.quaternion.setFromUnitVectors(V3([0, 0, 1]), b.clone().sub(a).normalize()); rs.push(m); }
    return (t) => { const q = q15(t); rs.forEach((m, i) => { const k = ((q - ta) * 1.2 + i / 4) % 1; m.visible = q >= ta && q < tb; m.position.copy(a).lerp(b, k); m.scale.setScalar(0.6 + k * 0.8); }); }; }
"""
rep("  // ===================================== level steps =====================================", HELP + "  // ===================================== level steps =====================================")
# walkman: buttons + belt clip; music-box notes gold and bigger
rep("function walkman() { const g = new THREE.Group(); L.box(0.11, 0.15, 0.035, litM(null, 0x3a6ab8), 0, 0, 0, g); L.box(0.08, 0.05, 0.004, litM(null, 0x1a1a24), 0, 0.02, 0.019, g); L.box(0.03, 0.012, 0.012, litM(null, 0xd8dce4), 0.03, 0.08, 0, g); return g; }",
    "function walkman() { const g = new THREE.Group(); L.box(0.11, 0.15, 0.035, litM(null, 0x3a6ab8), 0, 0, 0, g); L.box(0.08, 0.06, 0.004, litM(null, 0x1a1a24), 0, 0.02, 0.019, g); L.box(0.06, 0.03, 0.005, litM(null, 0xf4ecd8), 0, 0.025, 0.021, g);\n"
    "    for (let k = 0; k < 4; k++) L.box(0.02, 0.012, 0.02, litM(null, [0xd8dce4, 0xe83a3a, 0xd8dce4, 0xd8dce4][k], 0), -0.036 + k * 0.024, 0.081, 0, g); L.box(0.04, 0.1, 0.008, litM(null, 0xb8bcc4), 0, 0, -0.022, g); L.mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), litM(null, 0xd8dce4), 0.04, 0.08, 0, g); return g; }")
# ---- 1: she plays the harpsichord (hands on the keys) after "wanted"; a raised lid so it reads as a harpsichord
rep("const hp = new THREE.Group(); hp.position.set(-1.0, 0, -1.1); scene.add(hp);", "const hp = new THREE.Group(); hp.position.set(-0.6, 0, -0.5); hp.rotation.y = 0.45; scene.add(hp);")
rep("for (const s2 of [-1, 1]) L.box(0.06, 0.75, 0.06, mm(MT.darkWood, 0.2, 1), s2 * 0.55, 0.37, 0, hp);\n    const ch = hero(scene, { p: [0.35, 0, 0.7], ry: -0.2 });",
    "for (const s2 of [-1, 1]) L.box(0.06, 0.75, 0.06, mm(MT.darkWood, 0.2, 1), s2 * 0.55, 0.37, 0, hp); const lidH = L.box(1.3, 0.03, 0.55, mm(MT.wood, 2, 0.5, 0x6a3a1a), 0, 1.15, -0.2, hp); lidH.rotation.x = 0.7;\n    const ch = hero(scene, { p: [0.1, 0, 0.35], ry: -0.75 }); scene.updateMatrixWorld(true); handTo(ch, 'R', hp.localToWorld(V3([0.15, 1.0, 0.25])), [still('press_down', 0.6)]);")
rep("const lab = label3D(scene, 'NO SPOTIFY', 0, 0, 0, tS, { size: 0.15 }); const qm = q3D(scene, ch, ws(1, 'music') + 0.2);", "const lab = label3D(scene, 'NO SPOTIFY', 0, 0, 0, tS, { size: 0.15 }); const qm = q3D(scene, ch, ws(1, 'music') + 0.2); const tWa = ws(1, 'wanted'); cue(tWa, 'sing_off'); const nt = notes3D(scene, V3([-0.4, 1.3, -0.2]), tWa, 99, { col: 0xc85a5a, wobble: 0.5, n: 4 });")
rep("return { scene, cam, upd(t) { mt(t); lab(t); ch.drive(t, [seg('look_around', t0 + 0.3, { loop: true })], [[-99, 'open', 'neutral'], [tS, 'surprised', 'talkO']]); qm(t); } }; });",
    "return { scene, cam, upd(t) { mt(t); lab(t); nt(t); ch.drive(t, [seg('look_around', t0 + 0.3, { loop: true }), seg('press_down', tWa - 0.3, { loop: true, fade: 0.15 })], [[-99, 'open', 'neutral'], [tS, 'surprised', 'talkO'], [tWa, 'open', 'smile']]); qm(t); } }; });")
rep("const cam = CAM([[0.2, 1.25, 3.8], [0.18, 1.22, 3.6]], [[0.1, 1.05, 0.2]], 48); const mt = meter(scene, cam); const tS = ws(1, 'Spotify');", "const cam = CAM([[0.15, 1.35, 3.6], [0.13, 1.32, 3.4]], [[-0.2, 1.0, 0.0]], 48); const mt = meter(scene, cam); const tS = ws(1, 'Spotify');")
# ---- 3/4: no tricorns (they floated), bowties; the middle player off her head; the coin passes from her hand to his
rep("const n = tricorn(npcAt(scene, id, v, x, z, 0, 0.95));", "const n = bowtie(npcAt(scene, id, v, x, z, 0, 0.95));")
rep("['art_student', 'teal', 0.0, -0.9]", "['art_student', 'teal', 0.45, -1.0]")
rep("['bank_teller', 'olive', 0.9, -0.6]", "['bank_teller', 'olive', 1.2, -0.6]")
rep("const mu = tricorn(npcAt(scene, 'bank_teller', 'navy', 0.55, 0.3, -0.5, 1.0));", "const mu = bowtie(npcAt(scene, 'bank_teller', 'navy', 0.6, 0.2, -0.5, 1.0));")
rep("const lab = label3D(scene, 'PAY THE BAND', 0, 0, 0, tP, { size: 0.13 }); const cs = [0, 1, 2].map(() => { const c = coin(2.2, 0xe8c040); scene.add(c); return c; });",
    "const lab = label3D(scene, 'PAY THE BAND', 0, 0, 0, tP, { size: 0.13 }); const cs = [0, 1, 2].map(() => { const c = coin(2.2, 0xe8c040); scene.add(c); return c; }); const fq = V3([0, 0, 0]);")
rep("cs.forEach((c, i) => { const k = Math.min(1, Math.max(0, (q - tP - i * 0.2) / 0.4)); c.visible = q >= tP + i * 0.2; c.position.set(hpL.x, hpL.y + 0.35 * (1 - k) + 0.03 + i * 0.012, hpL.z); c.rotation.y = q * 4; });\n      ch.drive(t, [seg('idle', -99, { loop: true }), seg('present', tP - 0.3, { fade: 0.15 })], [[-99, 'open', 'smile'], [tP, 'open', 'frown']]); } }; });",
    "ch.drive(t, [seg('idle', -99, { loop: true }), seg('present', tP - 0.5, { fade: 0.15 })], [[-99, 'open', 'smile'], [tP, 'open', 'frown']]); scene.updateMatrixWorld(true); ch.fist('L', fq);\n"
    "      cs.forEach((c, i) => { const k = Math.min(1, Math.max(0, (q - tP - i * 0.25) / 0.5)); c.visible = q >= tP - 0.2; c.position.copy(fq).lerp(V3([hpL.x, hpL.y + 0.04 + i * 0.012, hpL.z]), k).add(V3([0, 0.12 * Math.sin(k * Math.PI), 0])); c.rotation.y = q * 4; }); } }; });")
# ---- 5/6: the music box held OUT in her left hand (hands visible), notes gold
for _ in range(2):
    rep("const hold = holdIn(ch, 'R', mb, [0.1, -0.16, 0.12]);", "const hold = holdIn(ch, 'L', mb, [0.0, -0.02, 0.05], [0.3, -0.4, 0]);", 2) if _ == 0 else None
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tM, 'open', 'smileOpen']]); hold(); mb.userData.key.rotation.x = q15(t) * 5;", "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tM, 'open', 'smileOpen']]); hold(); mb.userData.key.rotation.x = q15(t) * 5;")
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tF, 'sleepy', 'neutral']]); hold();", "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tF, 'sleepy', 'neutral']]); hold();")
rep("const nt = notes3D(scene, V3([0.2, 1.4, 1.0]), tM, 99, { col: 0xf4f8ff, s: 0.09 });", "const nt = notes3D(scene, V3([0.55, 1.35, 0.9]), tM, 99, { s: 0.13 });")
rep("const nt = notes3D(scene, V3([0.2, 1.4, 1.0]), t0, 99, { col: 0xf4f8ff, s: 0.09 });", "const nt = notes3D(scene, V3([0.55, 1.35, 0.9]), t0, 99, { s: 0.13 });")
rep("const ch = hero(scene, { p: [0.15, 0, 0.7], ry: 0.05 }); const mb = musicBox();", "const ch = hero(scene, { p: [-0.15, 0, 0.7], ry: 0.15 }); const mb = musicBox();")
rep("const ch = hero(scene, { p: [0.15, 0, 0.7], ry: -0.1 }); const mb = musicBox();", "const ch = hero(scene, { p: [-0.1, 0, 0.7], ry: 0.1 }); const mb = musicBox();")
# ---- 7: Edison (dark coat + bowtie) speaks INTO the small horn (3D sound rings), she fully in frame, readable yellow name
rep("const ph = phonograph(scene, 0.35, -0.4, -0.2); const ed = labCoat(npcAt(scene, 'bank_teller', 'grey', 0.95, -0.25, -0.6, 1.05), 0x2a2a34); ed.walk(0);",
    "const ph = phonograph(scene, 0.4, -0.35, -0.2); const ed = bowtie(labCoat(npcAt(scene, 'bank_teller', 'grey', 0.55, -0.85, 0.1, 1.0), 0x2a2a34)); ed.walk(0); scene.updateMatrixWorld(true); const hi = headInfo(ed); const em = ed.localToWorld(V3([hi.cx, hi.top - 0.12, hi.cz + 0.12])); const sr = soundRings(scene, em, ph.localToWorld(V3([0, 1.22, 0.08])), ws(4, 'recited'), ws(4, 'played'));")
rep("const ch = hero(scene, { p: [-0.45, 0, 0.6], ry: 0.4 }); const cam = CAM([[0.15, 1.45, 4.0], [0.15, 1.43, 3.8]], [[0.2, 1.3, 0]], 50);", "const ch = hero(scene, { p: [-0.3, 0, 0.6], ry: 0.4 }); const cam = CAM([[0.15, 1.45, 4.1], [0.15, 1.43, 3.9]], [[0.15, 1.3, 0]], 50);")
rep("const n = label3D(scene, 'THOMAS EDISON', 0, 0, 0, tY + 0.25, { size: 0.12, slot: 1, front: 0xffffff, side: 0x9a8a6a });", "const n = label3D(scene, 'THOMAS EDISON', 0, 0, 0, tY + 0.25, { size: 0.12, slot: 1 });")
rep("return { scene, cam, upd(t) { mt(t); y(t); n(t); nt(t); ph.userData.cyl.rotation.x = q15(t) >= tB", "return { scene, cam, upd(t) { mt(t); y(t); n(t); nt(t); sr(t); ph.userData.cyl.rotation.x = q15(t) >= tB")
# ---- 8: she turns the crank (hand on it, crank spinning) and talks into the small horn beside her
rep("const ph = phonograph(scene, 0.3, 0.0, -0.75); ph.userData.crank.visible = false; const ch = hero(scene, { p: [-0.22, 0, 0.5], ry: 0.75 });",
    "const ph = phonograph(scene, 0.45, -0.1, Math.PI + 0.35); ph.userData.crank.visible = false; const ch = hero(scene, { p: [-0.3, 0, 0.45], ry: 0.35 }); scene.updateMatrixWorld(true); const pvw = ph.localToWorld(V3([0.36, 1.06, 0])); const ax = ph.localToWorld(V3([1.36, 1.06, 0])).sub(pvw); handTo(ch, 'L', ph.localToWorld(V3([0.42, 1.06, 0])), [still('present', 1.2)]); const cs2 = crankSpin(scene, pvw, ax);")
rep("scene.updateMatrixWorld(true); const pv = ph.localToWorld(V3([0.36, 1.06, 0])); const cr = crankTo(scene, pv, 0.14); const fp = V3([0, 0, 0]); const nt = notes3D(scene, V3([0.3, 1.5, 0.35]), tP, 99, { col: 0xd8c8a0, s: 0.09, n: 4 });",
    "const nt = notes3D(scene, ph.localToWorld(V3([0, 1.35, 0.1])), tP, 99, { col: 0xd8c8a0, s: 0.11, n: 4 });")
rep("ch.drive(t, [seg('pull_chain', t0 - 0.2, { loop: true, speed: 1.3 })], [[-99, 'open', 'talkO'], [tP, 'open', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); cr(fp); } }; });",
    "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'talkO'], [tP, 'open', 'smileOpen']]); cs2(t); } }; });")
rep("const cam = CAM([[-0.15, 1.5, 3.5], [-0.14, 1.48, 3.35]], [[0.05, 1.2, 0.3]], 48);", "const cam = CAM([[0.1, 1.45, 3.5], [0.1, 1.43, 3.35]], [[0.1, 1.15, 0.2]], 48);")
# ---- 9: a big torn foil flap
rep("const rip = L.box(0.1, 0.02, 0.005, litM(null, 0x4a4a52), 0.25, 1.13, 0.27, scene);", "const rip = L.box(0.12, 0.09, 0.006, litM(null, 0xeef2f6), 0.6, 1.02, 0.31, scene); rip.rotation.set(0.6, 0, 0.4);")
# ---- 10/11: her LEFT hand on the gramophone crank, the crank spinning; wider framing, face clear
for sh_ in ("Then", "for"):
    pass
rep("const gr = gramophone(scene, 0.45, -0.15, 0.0); const ch = hero(scene, { p: [-0.3, 0, 0.55], ry: 0.6 });",
    "const gr = gramophone(scene, 0.45, -0.15, 0.0); const ch = hero(scene, { p: [-0.3, 0, 0.55], ry: 0.3 }); scene.updateMatrixWorld(true); const pvg = gr.localToWorld(V3([-0.24, 0.95, 0])); handTo(ch, 'L', pvg.clone().add(V3([-0.06, 0, 0])), [still('present', 1.2)]); const csg = crankSpin(scene, pvg, V3([-1, 0, 0]));")
rep("const lab = label3D(scene, 'GRAMOPHONE', 0, 0, 0, tG, { size: 0.14 }); scene.updateMatrixWorld(true); const pv = gr.localToWorld(V3([-0.24, 0.95, 0])); const cr = crankTo(scene, pv, 0.17); const fp = V3([0, 0, 0]);", "const lab = label3D(scene, 'GRAMOPHONE', 0, 0, 0, tG, { size: 0.14 });")
rep("ch.drive(t, [seg('idle', -99, { loop: true }), seg('pull_chain', ws(5, 'cranked') - 0.2, { loop: true, speed: 1.3 })], [[-99, 'open', 'smile'], [tG, 'open', 'smileOpen']]); scene.updateMatrixWorld(true); ch.fist('R', fp); cr(fp); } }; });",
    "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tG, 'open', 'smileOpen']]); if (q15(t) >= ws(5, 'cranked')) csg(t); } }; });")
rep("const cam = CAM([[-0.1, 1.5, 3.6], [-0.1, 1.48, 3.45]], [[0.15, 1.2, 0.1]], 50);", "const cam = CAM([[0.1, 1.5, 3.9], [0.1, 1.48, 3.75]], [[0.15, 1.2, 0.1]], 50);")
rep("const gr = gramophone(scene, 0.45, 0.0, 0.0); const ch = hero(scene, { p: [-0.22, 0, 0.6], ry: 0.6 });",
    "const gr = gramophone(scene, 0.45, 0.0, 0.0); const ch = hero(scene, { p: [-0.22, 0, 0.6], ry: 0.3 }); scene.updateMatrixWorld(true); const pvg = gr.localToWorld(V3([-0.24, 0.95, 0])); handTo(ch, 'L', pvg.clone().add(V3([-0.06, 0, 0])), [still('present', 1.2)]); const csg = crankSpin(scene, pvg, V3([-1, 0, 0]));")
rep("scene.updateMatrixWorld(true); const pv = gr.localToWorld(V3([-0.24, 0.95, 0])); const cr = crankTo(scene, pv, 0.17); const fp = V3([0, 0, 0]); const fx = new FX(LW, LH)", "const fx = new FX(LW, LH)")
rep("ch.drive(t, [seg('pull_chain', t0 - 0.2, { loop: true, speed: 1.6 })], [[-99, 'open', 'talkO'], [tM, 'open', 'frown']]); scene.updateMatrixWorld(true); ch.fist('R', fp); cr(fp); } }; });",
    "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'talkO'], [tM, 'open', 'frown']]); csg(t); } }; });")
rep("const cam = CAM([[0.2, 1.6, 2.9], [0.2, 1.58, 2.8]], [[0.0, 1.2, 0.2]], 46);", "const cam = CAM([[0.15, 1.55, 3.4], [0.15, 1.53, 3.3]], [[0.1, 1.15, 0.2]], 46);")
# ---- 12: no loose yellow scribble (zap); the tuning knob bigger and turning
rep("const fx = new FX(LW, LH).add('zap', { world: [0.55, 0.8, 0.6], t0: tR, dur: ws(6, 'home') - tR });", "const fx = new FX(LW, LH);")
rep("const k = L.mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 10), litM(null, 0x2a1a10), s2 * 0.13, 0.17, 0.17, g);", "const k = L.mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.05, 10), litM(null, 0x2a1a10), s2 * 0.13, 0.17, 0.175, g); L.box(0.012, 0.04, 0.01, litM(null, 0xe0b850), 0, 0.03, 0.026, k).rotation.x = Math.PI / 2;")
# ---- 14/15/16: Walkman, cassette+pencil, phone held OUT in the left hand (present), screen/front to camera
rep("const hold = holdIn(ch, 'R', wk, [0.04, -0.02, 0.05], [-0.3, 0, 0]);", "const hold = holdIn(ch, 'L', wk, [0.0, 0.03, 0.04], [0, -0.35, 0]);")
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tW, 'open', 'smileOpen']]); hp2(); hold(); ch.root.position.y", "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tW, 'open', 'smileOpen']]); hp2(); hold(); ch.root.position.y")
rep("const ch = hero(scene, { p: [0.15, 0, 0.6], ry: 0.15 }); const hp2 = headphones(ch);", "const ch = hero(scene, { p: [-0.15, 0, 0.6], ry: 0.15 }); const hp2 = headphones(ch);")
rep("const hold = holdIn(ch, 'R', cs, [0.02, -0.02, 0.07], [-0.4, 0, 0]);", "const hold = holdIn(ch, 'L', cs, [0.0, 0.04, 0.05], [0, -0.35, 0]);")
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tT, 'surprised', 'gasp'], [tP, 'open', 'smileOpen']]); hp2(); hold();", "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tT, 'surprised', 'gasp'], [tP, 'open', 'smileOpen']]); hp2(); hold();")
rep("const ch = hero(scene, { p: [0.0, 0, 0.6], ry: 0.1 }); const hp2 = headphones(ch); const cs = cassette();", "const ch = hero(scene, { p: [-0.2, 0, 0.6], ry: 0.15 }); const hp2 = headphones(ch); const cs = cassette();")
rep("const cam = CAM([[0.2, 1.65, 2.8], [0.2, 1.63, 2.7]], [[0.05, 1.15, 0.6]], 46);", "const cam = CAM([[0.15, 1.5, 3.2], [0.15, 1.48, 3.1]], [[0.1, 1.15, 0.6]], 46);")
rep("const hold = holdIn(ch, 'R', ph, [0.0, -0.01, 0.05], [-0.4, 0, 0]);", "const hold = holdIn(ch, 'L', ph, [0.0, 0.05, 0.04], [0, -0.35, 0]);")
rep("ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tA, 'open', 'smileOpen']]); eb(); hold(); ch.root.rotation.y = 0.15 * Math.sin(q15(t) * 3);", "ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tA, 'open', 'smileOpen']]); eb(); hold();")
rep("const ch = hero(scene, { p: [0.25, 0, 0.6], ry: 0.0 }); const eb = earbuds(ch);", "const ch = hero(scene, { p: [-0.05, 0, 0.6], ry: 0.15 }); const eb = earbuds(ch);")
rep("const lab2 = label3D(scene, 'MUSIC', 0, 0, 0, tS, { size: 0.12, slot: 1, front: 0x9cf09c, side: 0x3a8a4a });", "const lab2 = label3D(scene, 'MUSIC', 0, 0, 0, tS, { size: 0.12, slot: 1 });")
open(p, "w", encoding="utf-8").write(s); print("ok")

# user approval fixes (#09 storyboard v1): discovery reads, distinct oasis/market shots, Addis close with bone + drill, cute germs,
# a filled 1938 lab with varied framing, frontal disgust, every label as 3D extruded yellow letters (camera space, off her face)
import os, re
p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "engine", "d09_body.js"); s = open(p, encoding="utf-8").read()
def rep(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:90]); s = s.replace(a, b)
def set_block(k, txt):
    global s
    i = s.index(f"  // ===== {k}. "); j = s.index("  // ===== ", i + 10); s = s[:i] + txt + s[j:]

# ---------- helpers ----------
rep("  function cup(parent, x, y, z) {", """  // a 3D extruded label in camera space (slot 0 top, slot 1 below), pops in at tw
  function L3(scene, cam, txt, tw, slot = 0, front, side) { if (!cam.parent) scene.add(cam); CURCAM = cam; return label3D(scene, txt, 0, 0, 0, tw, { slot, front, side, size: slot ? 0.12 : 0.15 }); }
  // the rotor wash: a translucent sand cone under the drone + sand grains flung outward
  function sandBlast(scene, at) { const cone = L.mesh(new THREE.ConeGeometry(0.55, 1, 14, 1, true), new THREE.MeshBasicMaterial({ color: 0xf0d89a, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }), at.x, 0.5, at.z, scene);
    const gr = []; for (let i = 0; i < 26; i++) gr.push(L.box(0.035, 0.035, 0.035, litM(null, i % 3 ? 0xe8cc88 : 0xd8b870), 0, 0, 0, scene));
    return (t, top, on) => { cone.visible = on; cone.scale.set(1 + 0.08 * Math.sin(t * 30), top, 1 + 0.08 * Math.sin(t * 30)); cone.position.y = top / 2; gr.forEach((g, i) => { const a = i / 26 * Math.PI * 2 + i, k = ((t * 1.6 + hash(i)) % 1); g.visible = on; g.position.set(at.x + Math.cos(a) * (0.2 + k * 1.1), 0.05 + Math.sin(k * Math.PI) * 0.35, at.z + Math.sin(a) * (0.2 + k * 0.8)); g.rotation.set(k * 6, i, 0); }); }; }
  function gimlet() { const g = new THREE.Group(); L.box(0.2, 0.035, 0.035, mm(MT.wood, 0.5, 0.2), 0, 0.12, 0, g); L.mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.14, 6), litM(null, 0x8a8e98), 0, 0.04, 0, g); return g; }
  function stickBundle(parent, x, y, z, s = 1, rz = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); g.rotation.z = rz; parent.add(g); for (let k = 0; k < 7; k++) { const c = chewStick(); c.position.set((k % 3 - 1) * 0.022, 0, (Math.floor(k / 3) - 1) * 0.022); c.rotation.set(0, k, (hash(k) - 0.5) * 0.15); g.add(c); }
    L.mesh(new THREE.TorusGeometry(0.045, 0.01, 4, 10), litM(null, 0xc83a2a), 0, -0.02, 0, g).rotation.x = Math.PI / 2; return g; }
  function cup(parent, x, y, z) {""")
# cute PS1 germs: round green blobs with stubby bumps, white eyes and a grin
i = s.index("  function germ("); j = s.index("\n", s.index("return g; }", i)) + 1
s = s[:i] + """  function germ(parent, x, y, z, s = 1) { const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g); const m = litM(null, 0x7ad84a); const b = L.mesh(new THREE.SphereGeometry(0.06, 8, 6), m, 0, 0, 0, g); b.scale.y = 0.85;
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; L.mesh(new THREE.SphereGeometry(0.02, 6, 4), m, Math.cos(a) * 0.06, 0.03 + (k % 2) * 0.02, Math.sin(a) * 0.04 - 0.01, g); }
    for (const s2 of [-1, 1]) { L.mesh(new THREE.SphereGeometry(0.016, 6, 4), litM(null, 0xffffff), s2 * 0.022, 0.012, 0.05, g); L.mesh(new THREE.SphereGeometry(0.008, 6, 4), litM(null, 0x18181c), s2 * 0.022, 0.012, 0.064, g); }
    L.box(0.03, 0.008, 0.008, litM(null, 0x2a5a1a), 0, -0.018, 0.055, g); return g; }
""" + s[j:]
# a filled 1938 lab: shelves of flasks, a bench with thread spools, a bobbin with a thread strand, hanging lamps, plants
rep("for (const s2 of [-1, 1]) L.box(0.06, 0.95, 0.06, litM(null, 0x2a2a30), s2 * 0.5, 0, 0.02, wn); pottedTree(scene, 2.2, -1.2, 0.55);",
    "for (const s2 of [-1, 1]) L.box(0.06, 0.95, 0.06, litM(null, 0x2a2a30), s2 * 0.5, 0, 0.02, wn); pottedTree(scene, 2.2, -1.2, 0.55);\n"
    "    for (let k = 0; k < 3; k++) { L.box(0.35, 0.03, 2.2, mm(MT.wood, 0.4, 2), -2.4, 1.2 + k * 0.5, -0.2, scene); for (let j2 = 0; j2 < 6; j2++) L.mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.16 + hash(j2 + k) * 0.1, 8), new THREE.MeshBasicMaterial({ color: [0x5ac85a, 0x5a8ae8, 0xe8c040, 0xc85a5a][(j2 + k) % 4], transparent: true, opacity: 0.85 }), -2.4, 1.3 + k * 0.5, -1.1 + j2 * 0.35, scene); }\n"
    "    const bn = new THREE.Group(); bn.position.set(0.9, 0, -1.25); scene.add(bn); L.box(1.6, 0.06, 0.55, litM(null, 0x3a4a52), 0, 0.88, 0, bn); for (const [x2, z2] of [[-0.75, -0.22], [0.75, -0.22], [-0.75, 0.22], [0.75, 0.22]]) L.box(0.05, 0.88, 0.05, litM(null, 0x2a2a30), x2, 0.44, z2, bn);\n"
    "    for (let k = 0; k < 5; k++) { const sp2 = L.mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12), litM(null, [0xf8f8f8, 0xe8e0d0, 0xf8f8f8, 0x8ad0f8, 0xf8f8f8][k]), -0.6 + k * 0.22, 0.96, 0.05, bn); L.mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 12), litM(null, 0xc83a2a), -0.6 + k * 0.22, 1.01, 0.05, bn); } pottedTree(bn, 0.6, -0.1, 0.35);\n"
    "    const bob = L.mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 12), litM(null, 0xf0f0f0), 0.15, 1.3, 0, mc); bob.rotation.z = Math.PI / 2; mc.userData.bob = bob; { const A = V3([-0.2, 1.48, 0]), B = V3([0.15, 1.42, 0]); const th2 = L.mesh(new THREE.CylinderGeometry(0.006, 0.006, A.distanceTo(B), 4), litM(null, 0xffffff), 0, 0, 0, mc); th2.position.copy(A).lerp(B, 0.5); th2.quaternion.setFromUnitVectors(V3([0, 1, 0]), B.clone().sub(A).normalize()); }\n"
    "    for (const x2 of [-1.2, 0.4, 1.6]) { L.box(0.01, 0.5, 0.01, litM(null, 0x2a2a30), x2, 3.0, -0.3, scene); L.mesh(new THREE.ConeGeometry(0.2, 0.16, 10, 1, true), litM(null, 0x3a8a8a), x2, 2.7, -0.3, scene).material.side = THREE.DoubleSide; L.mesh(new THREE.SphereGeometry(0.06, 6, 4), L.basic(null, 0xfff4c0), x2, 2.64, -0.3, scene); }")
rep("for (let k = 0; k < 3; k++) { const b = L.mesh(new THREE.SphereGeometry(0.1, 8, 6), L.basic(null, 0xfff4c0), -1 + k * 1.2, 2.8, -0.4, scene); }", "")

# ---------- 1. discovery ----------
set_block(1, """  // ===== 1. "Operator… my drone just blew the sand off another human artifact."  the drone hovers low: a sand cone + flung grains blow the mound away, the toothbrush rises with sparkles
  SH([1, 'Operator'], 'C', (t0) => { const scene = new THREE.Scene(); desert(scene); const dr = drone(); dr.scale.setScalar(1.6); scene.add(dr); const at = V3([0.45, 0, 0.75]); const mound = L.mesh(new THREE.ConeGeometry(0.5, 0.36, 12), new THREE.MeshLambertMaterial({ map: L.rep(SAND, 2, 2), flatShading: true }), at.x, 0.18, at.z, scene);
    const tb = toothbrush(); tb.position.set(at.x, 0.03, at.z); tb.rotation.set(-Math.PI / 2, 0, 0.6); tb.scale.setScalar(2.0); scene.add(tb); const sb = sandBlast(scene, at); const ch = hero(scene, { p: [-0.4, 0, 1.0], ry: 0.55 });
    const cam = CAM([[0.15, 1.45, 4.2], [0.1, 1.35, 3.8]], [[0.1, 0.8, 0.6]], 48); const tB = ws(1, 'blew'), tA = ws(1, 'artifact'); cue(t0 + 0.1, 'drone_buzz'); cue(tB, 'sand_whoosh'); cue(tA, 'sparkle');
    const fx = new FX(LW, LH).add('dust', { world: [at.x, 0.15, at.z], t0: tB - 0.2, dur: 2.0 }).add('sparkle', { world: [at.x, 0.12, at.z], t0: tA, dur: 99, n: 5, radius: 16 });
    return { scene, cam, fx, upd(t) { const q = q15(t); const dy = 1.15 + 0.05 * Math.sin(q * 3); dr.position.set(at.x + 0.04 * Math.sin(q * 2), dy, at.z); dr.userData.rot.forEach((r) => { r.rotation.y = q * 40; }); const k = Math.min(1, Math.max(0, (q - tB) / 1.4));
      mound.scale.set(Math.max(0.02, 1 - k), Math.max(0.02, 1 - k), Math.max(0.02, 1 - k)); sb(q, dy - 0.05, q >= tB - 0.3 && q < tA + 0.4); tb.visible = k > 0.3; tb.position.y = 0.03 + 0.05 * Math.max(0, k - 0.3);
      ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tA, 'surprised', 'gasp']]); } }; });
""")
# 2. scan -> ARTIFACT 004 as 3D letters
rep("""    return { scene, cam, fx, upd(t) { dr.userData.rot.forEach((r) => { r.rotation.y = q15(t) * 40; }); ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tT, 'open', 'smileOpen']]); hold(); },
      ov(o, t) { if (t >= tT) plateText(o, t < tT + 0.6 ? 'SCANNING' : ART, CX, 70, { size: 14, border: '#7cf0ff', fg: t < tT + 0.6 ? '#c8f8ff' : '#fff2a0', scale: t >= tT + 0.6 ? popS(t, tT + 0.6) : 1 }); } }; });""",
    """    const lsc = L3(scene, cam, 'SCANNING', tT, 1, 0xc8f8ff, 0x3a8a9a), lart = L3(scene, cam, ART, tT + 0.6, 0);
    return { scene, cam, fx, upd(t) { lsc(t < tT + 0.6 ? t : -99); lart(t); dr.userData.rot.forEach((r) => { r.rotation.y = q15(t) * 40; }); ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tT, 'open', 'smileOpen']]); hold(); } }; });""")
# ---------- 5. chewing: frontal, twig low at the side of the mouth, frayed end, chips ----------
set_block(5, """  // ===== 5. "If you chew the end of a twig until it frays… you have a toothbrush."  under the palms by the pond: face to camera, chewing a twig held at the side of her mouth (chips fly)
  SH([4, 'If'], 'C', (t0) => { const scene = new THREE.Scene(); desert(scene); const ch = hero(scene, { p: [-1.75, 0.04, -1.5], ry: 0.15 }); const cs = chewStick(); cs.scale.setScalar(2.0); const hold = holdIn(ch, 'R', cs, [0.02, 0.02, 0.06], [0, 0, 0.6]);
    const cam = CAM([[-1.45, 1.4, 1.2], [-1.47, 1.38, 1.05]], [[-1.6, 1.15, -1.5]], 44); const tC = ws(4, 'chew'), tF = ws(4, 'frays'); cue(tC, 'twig_chew'); cue(tC + 0.5, 'twig_chew'); cue(tF, 'twig_chew');
    const fx = new FX(LW, LH).add('dust', { target: cs, offset: [0, 0.2, 0.05], t0: tC, dur: tF - tC + 0.6 });
    return { scene, cam, fx, upd(t) { const q = q15(t), chew = q >= tC && q < tF + 0.6; ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'smile'], [tC, 'open', chew && Math.floor(q * 6) % 2 ? 'talkA' : 'talkO'], [tF + 0.6, 'open', 'smileOpen']], false); hold(); cs.rotation.x = chew ? 0.12 * Math.sin(q * 18) : 0; } }; });
""")
# 6. close-up stays (different framing), 3D label is done by the converter
# ---------- 7. the miswak market: its own place (two stalls, bundles, seller NPC, baskets) ----------
set_block(7, """  // ===== 7. "People used them for thousands of years. Some still do: the miswak."  a miswak market on the edge of the oasis: striped awnings, bundles of sticks, a seller behind the stall
  SH([5, 'People'], 'C', (t0) => { const scene = new THREE.Scene(); desert(scene); const mk = new THREE.Group(); mk.position.set(3.2, 0, -1.4); mk.rotation.y = -0.25; scene.add(mk);
    const AWN = tx(16, 4, (c) => { for (let x = 0; x < 16; x += 4) { c.fillStyle = (x / 4) % 2 ? '#f4ecd8' : '#2a8a6a'; c.fillRect(x, 0, 4, 4); } }), AWN2 = tx(16, 4, (c) => { for (let x = 0; x < 16; x += 4) { c.fillStyle = (x / 4) % 2 ? '#f4ecd8' : '#c85a3a'; c.fillRect(x, 0, 4, 4); } });
    for (const [ox, aw] of [[-0.6, AWN], [1.3, AWN2]]) { const st = new THREE.Group(); st.position.set(ox, 0, 0); mk.add(st); const roof = L.box(1.6, 0.05, 1.0, litM(L.rep(aw, 2, 1), 0xffffff), 0, 1.95, 0.1, st); roof.rotation.x = 0.18;
      for (const [x2, z2] of [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.5], [0.75, 0.5]]) L.box(0.05, 1.95, 0.05, mm(MT.wood, 0.2, 1), x2, 0.97, z2, st); L.box(1.4, 0.7, 0.5, mm(MT.wood, 2, 0.6, 0xa87040), 0, 0.35, 0.3, st);
      for (let k = 0; k < 5; k++) stickBundle(st, -0.55 + k * 0.27, 0.78, 0.3, 1.5, Math.PI / 2 + 0.05 * k);
      for (const s2 of [-1, 1]) { const bk = L.mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.25, 10, 1, true), litM(null, 0xc8a060), s2 * 0.95, 0.12, 0.65, st); bk.material.side = THREE.DoubleSide; for (let k = 0; k < 3; k++) stickBundle(st, s2 * 0.95 + (k - 1) * 0.06, 0.3, 0.65, 1.4, 0.1 * (k - 1)); } }
    const sel = npcAt(mk, 'bank_teller', 'olive', -0.6, -0.15, 0, 1.0); sel.walk(0); npcSet(sel, 'Bone002', -1.2); const n2 = npcAt(mk, 'art_student', 'teal', 1.3, -0.15, 0, 0.95); n2.walk(0); palm(mk, -1.9, -0.6, 1.0); palm(mk, 2.6, -0.5, 0.9); bush(mk, 0.35, -0.6, 0.35);
    const ch = hero(scene, { p: [2.75, 0, 0.4], ry: -0.1 }); const cam = CAM([[3.3, 1.45, 3.9], [3.28, 1.43, 3.7]], [[3.25, 1.0, -0.6]], 50); const tM = ws(5, 'miswak'); cue(t0 + 0.1, 'market_amb'); cue(tM, 'sting');
    const l1 = L3(scene, cam, 'THOUSANDS OF YEARS', ws(5, 'thousands'), 0), l2 = L3(scene, cam, 'MISWAK', tM, 1);
    return { scene, cam, upd(t) { l1(t < tM ? t : -99); l2(t); ch.drive(t, [seg('look_around', t0 - 0.2), seg('point', tM - 0.3, { fade: 0.15 })], [[-99, 'open', 'smile'], [tM, 'open', 'smileOpen']]); } }; });
""")
# ---------- 8. the comment: sitting on the pond's edge, a low wide framing ----------
set_block(8, """  // ===== 8. "Operator Leo asks: So who made the first real brush? Leo… China."  she sits at the pond's edge reading the comment sticker
  SH([6, 'Operator'], 'C', (t0) => { const scene = new THREE.Scene(); desert(scene); const ch = hero(scene, { p: [-2.0, 0.04, -1.95], ry: 0.2 }); const cam = CAM([[-1.75, 0.95, 0.4]], [[-1.95, 0.75, -2.0]], 46);
    const tN = ws(6, 'Leo'), tC = ws(6, 'China'); cue(tN, 'comment_pop'); const qm = q3D(scene, ch, ws(6, 'brush')); const lc = L3(scene, cam, 'CHINA', tC, 1);
    return { scene, cam, upd(t) { lc(t); ch.drive(t, [still('sit_floor', 1.5)], [[-99, 'open', 'talkO'], [tC, 'open', 'smileOpen']]); qm(t); },
      ov(o, t) { if (t >= tN) sticker(o, t - tN, { user: 'operator_leo', lines: ['so who made the', 'first real brush?'], y: 48 }); } }; });
""")
# ---------- 11. Gross: frontal disgust close-up ----------
set_block(11, """  // ===== 11. "Pig hair. In your mouth. Gross."  frontal reaction close-up: real disgust face, stink lines, shiver; the pig oinks behind her
  SH([8, 'Pig'], 'C', (t0) => { const scene = new THREE.Scene(); chinaRoom(scene); const pg = pig(scene, 0.7, -0.4, -0.9, 0.9); const ch = hero(scene, { p: [-0.05, 0, 0.85], ry: 0.0 });
    const cam = CAM([[0.0, 1.5, 2.75], [0.0, 1.5, 2.6]], [[0.0, 1.32, 0.8]], 44); const tG = ws(8, 'Gross'); cue(t0 + 0.1, 'oink'); cue(tG, 'gross');
    const fx = new FX(LW, LH).add('stink', { obj: ch.root, bone: 'Head', offset: [0.22, 0.05, 0.1], t0, dur: 99 }).add('shake', { obj: ch.root, bone: 'Head', offset: [0.0, -0.05, 0], t0: tG, dur: 1.2 });
    return { scene, cam, fx, upd(t) { ch.drive(t, [still('surprised', 1.0)], [[-99, 'disgust', 'disgust']]); } }; });
""")
# ---------- 12/13. Addis bigger and closer; bone + gimlet in his hands, tufts filling the holes ----------
set_block(12, """  // ===== 12. "The story goes, in 1770, William Addis sat in prison for starting a riot."  a stone cell: Addis (existing NPC + brown coat, bigger) on his bench; she by the bars
  SH([9, 'The'], 'C', (t0) => { const scene = new THREE.Scene(); prison(scene); const ad = labCoat(npcAt(scene, 'bank_teller', 'grey', -1.05, -1.0, 0.35, 1.25), 0x6a4a2a); ad.walk(0); const ch = hero(scene, { p: [0.35, 0, 0.55], ry: -0.4 });
    const cam = CAM([[-0.25, 1.55, 3.7], [-0.25, 1.53, 3.5]], [[-0.35, 1.15, -0.4]], 50); const tY = ws(9, '1770'), tR = ws(9, 'riot'); cue(tY, 'stamp'); cue(tR, 'jail_door');
    const l1 = L3(scene, cam, '1770', tY, 0), l2 = L3(scene, cam, 'WILLIAM ADDIS', tY + 0.3, 1);
    return { scene, cam, upd(t) { l1(t); l2(t); ch.drive(t, [seg('idle', -99, { loop: true }), seg('surprised', tR - 0.2, { fade: 0.15 })], [[-99, 'open', 'smile'], [tR, 'surprised', 'talkO']]); } }; });
""")
set_block(13, """  // ===== 13. "He drilled holes in a leftover bone… and tied in bristles."  medium close on Addis: the bone in one hand, a gimlet turning in the other; bristle tufts pop into the holes
  SH([9, 'He'], 'C', (t0) => { const scene = new THREE.Scene(); prison(scene); const ad = labCoat(npcAt(scene, 'bank_teller', 'grey', -0.35, -0.6, 0.15, 1.25), 0x6a4a2a); ad.walk(0); npcSet(ad, 'Bone002', -1.25); npcSet(ad, 'Bone004', -1.25);
    const hl = npcHand(ad, 'L'), hr = npcHand(ad, 'R'); const mid = hl.clone().lerp(hr, 0.5).add(V3([0, 0.06, 0.12]));
    const bone = new THREE.Group(); bone.position.copy(mid); scene.add(bone); const bm = litM(null, 0xeee4c8); L.box(0.05, 0.36, 0.03, bm, 0, 0, 0, bone); for (const s2 of [-1, 1]) L.mesh(new THREE.SphereGeometry(0.035, 6, 4), bm, 0, s2 * 0.19, 0, bone);
    const tufts = []; for (let k = 0; k < 6; k++) { L.box(0.016, 0.016, 0.034, litM(null, 0x3a3020), 0, 0.04 + k * 0.022, 0.0, bone); const tf = L.box(0.018, 0.018, 0.05, litM(null, 0x2a2420), 0, 0.04 + k * 0.022, 0.035, bone); tf.visible = false; tufts.push(tf); }
    bone.rotation.set(0.3, 0, 1.25); ad.updateMatrixWorld(true); ad.bones.Bone003.attach(bone); const gm = gimlet(); gm.scale.setScalar(1.3); gm.position.copy(mid).add(V3([0.04, 0.16, 0.05])); scene.add(gm); ad.bones.Bone005.attach(gm);
    const ch = hero(scene, { p: [0.65, 0, 0.55], ry: -0.55 }); const cam = CAM([[0.15, 1.45, 2.6], [0.15, 1.43, 2.48]], [[0.0, 1.05, -0.3]], 46);
    const tD = ws(9, 'drilled'), tT = ws(9, 'tied'); cue(tD, 'drill'); cue(tT, 'tie'); const fx = new FX(LW, LH).add('dust', { target: gm, offset: [0, -0.02, 0.03], t0: tD, dur: tT - tD });
    return { scene, cam, fx, upd(t) { const q = q15(t); gm.rotation.y = q >= tD && q < tT ? q * 14 : 0; tufts.forEach((tf, i) => { tf.visible = q >= tT + i * 0.12; }); ch.drive(t, [still('surprised', 1.0)], [[-99, 'open', 'talkO'], [tT, 'open', 'smileOpen']]); } }; });
""")
# ---------- 15. germs: close on the cup, big cute germs, drips ----------
set_block(15, """  // ===== 15. "But animal hair stayed wet… and grew germs."  close on the wet brush in a cup: drips, cute 3D germs pop up on the bristles; she recoils at the side
  SH([11, 'But'], 'C', (t0) => { const scene = new THREE.Scene(); shop(scene); cup(scene, 0.25, 0.95, -0.4); const bb = bristleBrush(); bb.scale.setScalar(1.9); bb.position.set(0.25, 1.15, -0.4); bb.rotation.z = 0.2; scene.add(bb);
    const gs = [[0.18, 1.42, -0.32], [0.32, 1.36, -0.33], [0.12, 1.3, -0.33], [0.3, 1.5, -0.35], [0.4, 1.25, -0.33], [0.08, 1.45, -0.36]].map(([x, y, z]) => germ(scene, x, y, z, 1.6)); const ch = hero(scene, { p: [-0.45, 0, 0.35], ry: 0.45 });
    const cam = CAM([[0.0, 1.45, 2.4], [0.0, 1.44, 2.3]], [[0.0, 1.15, -0.3]], 44); const tW = ws(11, 'wet'), tG = ws(11, 'germs'); cue(tW, 'drip'); cue(tG, 'germs');
    const fx = new FX(LW, LH).add('drip', { target: bb, offset: [0.03, 0.1, 0.04], t0: tW, dur: 99 }).add('drip', { target: bb, offset: [-0.03, 0.05, 0.04], t0: tW + 0.3, dur: 99 }); const lg = L3(scene, cam, 'GERMS', tG, 0, 0x9cf09c, 0x3a8a4a);
    return { scene, cam, fx, upd(t) { lg(t); gs.forEach((g, i) => { const k = Math.min(1, Math.max(0, (q15(t) - tG - i * 0.1) / 0.2)); g.scale.setScalar(1.6 * k + 0.001); g.rotation.y = 0.3 * Math.sin(q15(t) * 3 + i); g.position.y += 0; }); ch.drive(t, [seg('idle', -99, { loop: true }), seg('step_back', tG - 0.1, { fade: 0.1 })], [[-99, 'open', 'neutral'], [tG, 'disgust', 'disgust']]); } }; });
""")
# ---------- 16. wide lab with the machine; 17b. a different angle, close, from the window side ----------
set_block(16, """  // ===== 16. "In 1938 came nylon bristles. They dried fast…"  wide on the filled 1938 lab: the thread machine spinning, she holds the new brush
  SH([12, 'In'], 'C', (t0) => { const scene = new THREE.Scene(); const mc = lab1938(scene); const ch = hero(scene, { p: [0.15, 0, 0.6], ry: 0.15 }); const tb = toothbrush(0xe83a3a); tb.scale.setScalar(1.8); const hold = holdIn(ch, 'L', tb, [0.0, 0.05, 0.05], [0, -0.3, 0]);
    const cam = CAM([[0.1, 1.6, 4.4], [0.1, 1.58, 4.2]], [[-0.3, 1.2, -0.6]], 52); const tY = ws(12, '1938'), tD = ws(12, 'dried'); cue(tY, 'stamp'); cue(tD, 'sparkle'); cue(t0 + 0.2, 'machine');
    const fx = new FX(LW, LH).add('sparkle', { target: tb, offset: [0, 0.12, 0], t0: tD, dur: 99, n: 4, radius: 14 }); const l1 = L3(scene, cam, '1938', tY, 0), l2 = L3(scene, cam, 'NYLON', tY + 0.3, 1);
    return { scene, cam, fx, upd(t) { l1(t); l2(t); mc.userData.spool.rotation.x = q15(t) * 4; mc.userData.bob.rotation.x = q15(t) * 6; ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smile'], [tD, 'open', 'smileOpen']]); hold(); } }; });
""")
set_block("17b", """  // ===== 17b. "This is a nylon toothbrush."  a different angle: from the window side, close on her and the brush, the machine spinning behind
  SH([12, 'This'], 'C', (t0) => { const scene = new THREE.Scene(); const mc = lab1938(scene); const ch = hero(scene, { p: [-0.35, 0, -0.1], ry: -0.55 }); const tb = toothbrush(0xe83a3a); tb.scale.setScalar(2.0); const hold = holdIn(ch, 'R', tb, [0.0, 0.05, 0.05], [0, 0.3, 0]);
    const cam = CAM([[1.2, 1.4, 1.6], [1.15, 1.38, 1.5]], [[-0.4, 1.15, -0.4]], 44); const tN = ws(12, 'nylon', 2); cue(tN, 'sting'); const fx = new FX(LW, LH).add('sparkle', { target: tb, offset: [0, 0.12, 0], t0: tN, dur: 99, n: 4, radius: 14 }); const ln = L3(scene, cam, 'NYLON TOOTHBRUSH', tN, 0);
    return { scene, cam, fx, upd(t) { ln(t); mc.userData.spool.rotation.x = q15(t) * 4; mc.userData.bob.rotation.x = q15(t) * 6; ch.drive(t, [still('present', 1.2)], [[-99, 'open', 'smileOpen']]); hold(); } }; });
""")
# ---------- convert every remaining 2D label (lab2D in ov) to 3D letters ----------
COL = {"HOG HAIR": ("0xffb0c0", "0xa85a6a")}
parts = re.split(r"(?=  SH\(\[)", s); out = [parts[0]]
for b in parts[1:]:
    calls = re.findall(r"lab2D\(o, t, ([^,]+), '([^']+)'(?:, \d+(?:, '[^']+', '[^']+')?)?\);", b)
    if calls:
        lb = []
        for i, (tw, txt) in enumerate(calls):
            fr, sd = COL.get(txt, ("undefined", "undefined"))
            lb.append(f"L3(scene, cam, '{txt}', {tw}, {min(i, 1)}, {fr}, {sd})")
        b = re.sub(r" ?lab2D\(o, t, [^;]*\);", "", b)
        b = re.sub(r",\s*ov\(o, t\) \{\s*\}", "", b)
        k = b.index("    return { scene"); b = b[:k] + "    const LB = [" + ", ".join(lb) + "];\n" + b[k:]
        b = b.replace("upd(t) { ", "upd(t) { LB.forEach((f) => f(t)); ", 1)
    out.append(b)
s = "".join(out); assert "lab2D(o" not in s, "left"
open(p, "w", encoding="utf-8").write(s); print("ok")

# blender -b v3/tex.blend -P tools/v3_rig.py -- <stalker_dir> [out.glb]  -> stalker_ps1.glb (v3)
# Esqueleto simple con pesos geometricos y los MISMOS 19 huesos que la v2 / Lisa (hips, spine, chest, neck, head, thighL/R, shinL/R,
# upperarmL/R, forearmL/R, handL/R, fingersL/R, thumbL/R). Articulaciones medidas sobre la hoja (v3/joints.json = centros del brazo por fila).
import bpy, sys, json
from mathutils import Vector
a = sys.argv[sys.argv.index("--") + 1:]; D = a[0]; OUT = a[1] if len(a) > 1 else f"{D}/stalker_ps1.glb"
P = json.load(open(f"{D}/v3/profiles.json")); S, SOLE = P["S"], P["SOLE"]
z = lambda y: (SOLE - y) * S
J = {s: {int(y): Vector(v) for y, v in c} for s, c in json.load(open(f"{D}/v3/joints.json")).items()}
def jat(s, y):
    ks = sorted(J[s]); k = min(ks, key=lambda q: abs(q - y)); return J[s][k].copy()
def sstep(e0, e1, x):
    t = min(1, max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
def norm(w):
    t = sum(w.values()); return {k: v / t for k, v in w.items() if v / t > 1e-3}
def side(x): return "L" if x > 0 else "R"
ZH, ZS, ZC, ZN = 1.38, 1.72, z(146), z(118)          # cortes hips|spine|chest|neck|head
BANDS = [("hips", -9, ZH), ("spine", ZH, ZS), ("chest", ZS, ZC), ("neck", ZC, ZN), ("head", ZN, 9)]
def wbody(p):
    w = {}
    for i, (b, z0, z1) in enumerate(BANDS):
        lo = 1 if i == 0 else sstep(z0 - 0.04, z0 + 0.04, p.z); hi = 1 if i == len(BANDS) - 1 else 1 - sstep(z1 - 0.04, z1 + 0.04, p.z)
        if lo * hi > 1e-3: w[b] = lo * hi
    return norm(w)
def wtorso(p):
    w = wbody(p); k = sstep(0.30, 0.42, abs(p.x)) * sstep(1.85, 2.05, p.z) * 0.35
    if k: w = {q: v * (1 - k) for q, v in w.items()}; w[f"upperarm{side(p.x)}"] = k
    return norm(w)
def wskirt(p):
    w = wbody(p); legw = 0.45 * sstep(1.3, 0.45, p.z)
    if legw > 0:
        sl = sstep(-0.15, 0.15, p.x); w = {k: v * (1 - legw) for k, v in w.items()}; w["thighL"] = legw * sl; w["thighR"] = legw * (1 - sl)
    return norm(w)
ARM = {s: dict(sh=jat(s, 168), el=jat(s, 340), wr=jat(s, 404), kn=jat(s, 458), tip=jat(s, 495)) for s in "LR"}
def warm(p):
    s = side(p.x); A = ARM[s]; sg = 1 if s == "L" else -1
    if p.z > A["el"].z:
        u = sstep(A["el"].z - 0.05, A["el"].z + 0.06, p.z); w = {f"upperarm{s}": u, f"forearm{s}": 1 - u}
        c = sstep(A["sh"].z - 0.10, A["sh"].z + 0.04, p.z) * 0.45
        if c: w = {k: v * (1 - c) for k, v in w.items()}; w["chest"] = c
        return norm(w)
    if p.z > A["wr"].z + 0.03: return norm({f"forearm{s}": 1.0})
    h = sstep(A["wr"].z + 0.04, A["wr"].z - 0.02, p.z)
    if p.z > A["kn"].z + 0.02:
        thumb = (p.y < A["wr"].y - 0.035) and (sg * (p.x - A["kn"].x) < 0.0) and p.z < A["wr"].z - 0.03
        if thumb: return {f"thumb{s}": 1.0}
        return norm({f"forearm{s}": 1 - h, f"hand{s}": h})
    f = sstep(A["kn"].z + 0.02, A["kn"].z - 0.03, p.z); return norm({f"hand{s}": 1 - f, f"fingers{s}": f})
def whead(p): return norm({"neck": 1 - sstep(ZN - 0.03, ZN + 0.03, p.z), "head": sstep(ZN - 0.03, ZN + 0.03, p.z)}) if p.z < ZN + 0.03 else {"head": 1.0}
def wfeet(p): return {f"shin{side(p.x)}": 1.0}
WF = {"Torso": wtorso, "Skirt": wskirt, "Arms": warm, "Head": whead, "Feet": wfeet, "Box": lambda p: {"chest": 1.0}}
# ---------------- tubos rojo vino (salen de la caja y se separan sobre cada hombro) + abrazaderas amarillas ----------------
import math
from mathutils.bvhtree import BVHTree
dg = bpy.context.evaluated_depsgraph_get()
TREES = [BVHTree.FromObject(bpy.data.objects[n], dg) for n in ("Torso", "Arms")]
def push(p, clear):
    for t in TREES:
        loc, nrm, _, dist = t.find_nearest(p)
        if loc is not None and (nrm.dot(p - loc) < 0 or dist < clear): p = loc + nrm * clear
    return p
def spline(pts, per=4):
    pts = [Vector(q) for q in pts]; Pp = [pts[0]] + pts + [pts[-1]]; out = []
    for i in range(1, len(Pp) - 2):
        p0, p1, p2, p3 = Pp[i - 1], Pp[i], Pp[i + 1], Pp[i + 2]
        for k in range(per):
            t = k / per; out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1]); return out
HV = {"tubes": ([], [], []), "yellow": ([], [], [])}
def tube(m, path, r, n=6):
    vs, fs, uv = HV[m]; rings = []
    for i, c in enumerate(path):
        t = (path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]).normalized(); ref = Vector((0, 0, 1)) if abs(t.z) < 0.9 else Vector((1, 0, 0))
        aa = (ref - t * ref.dot(t)).normalized(); bb = t.cross(aa); ring = []
        for j in range(n):
            th = 2 * math.pi * j / n; vs.append(c + aa * r * math.cos(th) + bb * r * math.sin(th)); ring.append(len(vs) - 1)
        rings.append(ring)
    for i in range(len(rings) - 1):
        for j in range(n):
            j1 = (j + 1) % n; fs.append((rings[i][j], rings[i][j1], rings[i + 1][j1], rings[i + 1][j])); uv.append(((j / n, i / 4), ((j + 1) / n, i / 4), ((j + 1) / n, (i + 1) / 4), (j / n, (i + 1) / 4)))
    for ring in (rings[0], rings[-1]): fs.append(tuple(ring)); uv.append(tuple((0.5 + 0.4 * math.cos(2 * math.pi * j / n), 0.5 + 0.4 * math.sin(2 * math.pi * j / n)) for j in range(n)))
box = bpy.data.objects["Box"]; bc = sum((v.co for v in box.data.vertices), Vector()) / len(box.data.vertices)
TP = [[bc + Vector((0.0, 0.0, 0.11)), (0.22, -0.30, 2.17), (0.36, -0.12, 2.27), (0.43, 0.12, 2.24), (0.40, 0.30, 2.02)],
      [bc + Vector((0.08, 0.0, 0.06)), (0.36, -0.26, 2.10), (0.50, -0.06, 2.20), (0.54, 0.18, 2.12), (0.50, 0.32, 1.92)],
      [bc + Vector((0.09, 0.0, -0.04)), (0.34, -0.30, 1.92), (0.52, -0.16, 2.02), (0.62, 0.02, 1.98), (0.64, 0.12, 1.80)],
      [bc + Vector((-0.07, 0.0, 0.09)), (-0.10, -0.31, 2.20), (-0.30, -0.13, 2.28), (-0.42, 0.10, 2.24), (-0.40, 0.30, 2.02)],
      [(-0.12, -0.27, 2.24), (-0.36, -0.20, 2.19), (-0.52, -0.06, 2.13), (-0.60, 0.06, 1.98), (-0.64, 0.10, 1.80)]]
for pts in TP:
    path = spline(pts, 4); path = [path[0]] + [push(q, 0.035) for q in path[1:]]
    tube("tubes", path, 0.026)
    i = len(path) // 2 + 1; c = path[i]; t = (path[i + 1] - path[i - 1]).normalized()
    tube("yellow", [c - t * 0.035, c + t * 0.035], 0.042)
for sg in (1, -1):   # abrazaderas amarillas de los hombros (delante, sobre la costura)
    c = push(Vector((sg * 0.46, -0.20, 2.10)), 0.02); tube("yellow", [c + Vector((0, 0, -0.04)), c + Vector((0, 0, 0.04))], 0.035, 4)
for m, (vs, fs, uv) in HV.items():
    me = bpy.data.meshes.new(m); me.from_pydata([tuple(v) for v in vs], [], fs); me.update()
    ul = me.uv_layers.new(name="UVMap")
    for pi, poly in enumerate(me.polygons):
        for k, l in enumerate(poly.loop_indices): ul.data[l].uv = uv[pi][k]
    for p in me.polygons: p.use_smooth = m == "tubes"
    o = bpy.data.objects.new(m.capitalize(), me); bpy.context.scene.collection.objects.link(o)
    mat = bpy.data.materials.new("stalker_" + m); mat.use_nodes = True; nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); ti = nt.nodes.new("ShaderNodeTexImage")
    ti.image = bpy.data.images.load(f"{D}/tex/{m}.png"); ti.interpolation = "Closest"   # texturas PS1 de la v2 (128 px, 32 colores)
    nt.links.new(ti.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = 0.5
    me.materials.append(mat); WF[o.name] = lambda p: {"chest": 1.0}
meshes = [bpy.data.objects[n] for n in WF]
for o in meshes:
    o.vertex_groups.clear()
    for v in o.data.vertices:
        for k, val in WF[o.name](v.co).items():
            g = o.vertex_groups.get(k) or o.vertex_groups.new(name=k); g.add([v.index], val, "REPLACE")
# ---------------- esqueleto ----------------
ad = bpy.data.armatures.new("StalkerRig"); rig = bpy.data.objects.new("StalkerRig", ad); bpy.context.scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig
for o in bpy.context.scene.objects: o.select_set(o == rig)
bpy.ops.object.mode_set(mode="EDIT")
def bone(n, h, t, parent=None):
    b = ad.edit_bones.new(n); b.head, b.tail = Vector(h), Vector(t); b.roll = 0
    if parent: b.parent = ad.edit_bones[parent]; b.use_connect = False
yb = 0.05
bone("hips", (0, yb, 1.18), (0, yb, ZH)); bone("spine", (0, yb, ZH), (0, yb, ZS), "hips"); bone("chest", (0, yb, ZS), (0, yb, ZC), "spine")
bone("neck", (0, yb, ZC), (0, 0.0, ZN), "chest"); bone("head", (0, 0.0, ZN), (0, 0.0, z(45)), "neck")
for s, sg in (("L", 1), ("R", -1)):
    A = ARM[s]
    bone(f"upperarm{s}", A["sh"], A["el"], "chest"); bone(f"forearm{s}", A["el"], A["wr"], f"upperarm{s}")
    bone(f"hand{s}", A["wr"], A["kn"], f"forearm{s}"); bone(f"fingers{s}", A["kn"], A["tip"], f"hand{s}")
    bone(f"thumb{s}", A["wr"] + Vector((-sg * 0.02, -0.05, -0.04)), A["kn"] + Vector((-sg * 0.04, -0.09, -0.02)), f"hand{s}")
    bone(f"thigh{s}", (sg * 0.17, yb, 1.18), (sg * 0.24, 0.0, 0.62), "hips"); bone(f"shin{s}", (sg * 0.24, 0.0, 0.62), (sg * 0.30, -0.02, 0.08), f"thigh{s}")
bpy.ops.object.mode_set(mode="OBJECT")
for o in meshes:
    o.parent = rig; md = o.modifiers.new("arm", "ARMATURE"); md.object = rig
for o in list(bpy.context.scene.objects):
    if o not in meshes and o != rig: bpy.data.objects.remove(o)
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=False, export_skins=True, export_yup=True, export_image_format="AUTO", use_selection=False)
print("TOTAL TRIS", sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in meshes))
print("BONES", len(ad.bones), [b.name for b in ad.bones])
lo = Vector((1e9,) * 3); hi = -lo
for o in meshes:
    for v in o.data.vertices: lo = Vector(map(min, lo, v.co)); hi = Vector(map(max, hi, v.co))
print("BBOX m", tuple(round(c, 3) for c in lo), tuple(round(c, 3) for c in hi))

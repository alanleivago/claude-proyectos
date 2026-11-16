# blender -b -P tools/build.py -- <stalker_dir (ruta absoluta)> [out.glb]
# v2: las partes organicas salen de tools/sdf_body.py (src/*.npz, marching cubes de campos de distancia).
# Aqui: decimado PS1 por parte, UV planar por cara (texturas tileables de tex/, 128 px / 32 colores),
# piezas duras (dientes torcidos, ojo, grapas en zigzag, caja hexagonal + luz verde, tubos, abrazaderas, costuras)
# pegadas a la superficie con raycast, y esqueleto con pesos geometricos con los nombres de Lisa
# (zombie-05-pt/lisa/tools/build.py) + handL/R, fingersL/R, thumbL/R. Ejes: Z arriba, mira a -Y (+Z en three.js). L = +X.
import bpy, bmesh, sys, math, random
import numpy as np
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
a = sys.argv[sys.argv.index("--") + 1:]; D = a[0]
OUT = a[1] if len(a) > 1 else f"{D}/stalker_ps1.glb"
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
X, Y, Z = Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))
def V(x, y, z): return Vector((x, y, z))
def sstep(e0, e1, x):
    t = min(1, max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
def norm(w):
    t = sum(w.values()); return {k: v / t for k, v in w.items() if v / t > 1e-3}
def side(x): return "L" if x > 0 else "R"
random.seed(5)

# ---------------- pesos por posicion ----------------
BANDS = [("hips", -9, 1.38), ("spine", 1.38, 1.68), ("chest", 1.68, 2.16), ("neck", 2.16, 2.30), ("head", 2.30, 9)]
def wbody(p):
    w = {}
    for i, (b, z0, z1) in enumerate(BANDS):
        lo = 1 if i == 0 else sstep(z0 - 0.04, z0 + 0.04, p.z); hi = 1 if i == len(BANDS) - 1 else 1 - sstep(z1 - 0.04, z1 + 0.04, p.z)
        if lo * hi > 1e-3: w[b] = lo * hi
    return norm(w)
def wcoatT(p):
    S = side(p.x); armw = sstep(0.50, 0.64, abs(p.x)) * (1 - 0.5 * sstep(2.02, 2.2, p.z))
    w = {k: v * (1 - armw) for k, v in wbody(p).items()}
    if armw > 0:
        u = sstep(1.47, 1.58, p.z); w[f"upperarm{S}"] = armw * u; w[f"forearm{S}"] = armw * (1 - u)
    return norm(w)
def wskirt(p):
    w = wbody(p); legw = 0.45 * sstep(1.25, 0.45, p.z)
    if legw > 0:
        sl = sstep(-0.12, 0.12, p.x); w = {k: v * (1 - legw) for k, v in w.items()}
        w["thighL"] = legw * sl; w["thighR"] = legw * (1 - sl)
    return norm(w)
def whand(p):
    S = side(p.x); s = 1 if S == "L" else -1; y0 = -0.03
    if p.z > 1.11: return norm({f"forearm{S}": sstep(1.11, 1.17, p.z), f"hand{S}": 1 - sstep(1.11, 1.17, p.z)})
    if (p.y - y0) < -0.07 and p.z < 1.075 and s * (p.x - s * 0.83) < -0.015: return {f"thumb{S}": 1.0}
    f = sstep(0.985, 0.935, p.z); return norm({f"hand{S}": 1 - f, f"fingers{S}": f})
def wfoot(p):
    S = side(p.x); k = sstep(0.55, 0.68, p.z); return norm({f"thigh{S}": k, f"shin{S}": 1 - k})
def wfix(b): return lambda p: {b: 1.0}

# ---------------- mallas organicas (npz) -> decimado PS1 ----------------
ORG = {  # parte: (material, triangulos objetivo, pesos)
    "head": ("skin", 1800, wbody), "gums": ("gums", 110, wfix("head")), "coatT": ("coatT", 2500, wcoatT), "coat": ("coat", 1150, wskirt),
    "handL": ("skin", 560, whand), "handR": ("skin", 560, whand), "footL": ("skin", 320, wfoot), "footR": ("skin", 320, wfoot)}
UVS = {"skin": 4.0, "coatT": 2.6, "coat": 2.2, "gums": 8.0}
objs = {}
for part, (mat, target, wf) in ORG.items():
    z = np.load(f"{D}/src/{part}.npz"); v, f = z["verts"], z["faces"]
    me = bpy.data.meshes.new(part); me.from_pydata([tuple(map(float, q)) for q in v], [], [tuple(map(int, q)) for q in f]); me.update()
    o = bpy.data.objects.new(part, me); sc.collection.objects.link(o)
    md = o.modifiers.new("dec", "DECIMATE"); md.ratio = target / len(f); md.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); me2 = bpy.data.meshes.new_from_object(o.evaluated_get(dg), depsgraph=dg)
    o.modifiers.clear(); o.data = me2; bpy.data.meshes.remove(me)
    bm = bmesh.new(); bm.from_mesh(me2)
    # quita islas sueltas chicas (restos del marching cubes)
    seen, isl = set(), []
    for fc in bm.faces:
        if fc in seen: continue
        st, cur = [fc], []
        seen.add(fc)
        while st:
            g = st.pop(); cur.append(g)
            for e in g.edges:
                for h in e.link_faces:
                    if h not in seen: seen.add(h); st.append(h)
        isl.append(cur)
    big = max(len(i) for i in isl)
    bmesh.ops.delete(bm, geom=[fc for i in isl if len(i) < 0.05 * big for fc in i], context="FACES")
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me2); bm.free()
    me2.name = part; objs[part] = (o, mat, wf)

# ---------------- acumulador de piezas duras ----------------
ACC = {}
def acc(m): return ACC.setdefault(m, {"v": [], "f": [], "uv": [], "w": []})
def addv(m, p, w):
    A = acc(m); A["v"].append(Vector(p)); A["w"].append(w); return len(A["v"]) - 1
def addf(m, idx, uvs):
    A = acc(m); A["f"].append(tuple(idx)); A["uv"].append(tuple(uvs))
def box(m, c, ax, ay, az, sx, sy, sz, w):
    c = Vector(c); idx = [addv(m, c + ax * sx * dx + ay * sy * dy + az * sz * dz, w) for dz in (-1, 1) for dy in (-1, 1) for dx in (-1, 1)]
    for fc in [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]: addf(m, [idx[k] for k in fc], ((0, 0), (1, 0), (1, 1), (0, 1)))
def frame(t, ref=Z):
    t = t.normalized(); r = ref if abs(ref.dot(t)) < 0.95 else Y
    aa = (r - t * r.dot(t)).normalized(); return aa, t.cross(aa)
def tube(m, path, rad, n, w, caps=True, th0=0.0):
    rings = []; L = 0
    for i, c in enumerate(path):
        t = path[min(i + 1, len(path) - 1)] - path[max(i - 1, 0)]; aa, bb = frame(t)
        r = rad[i] if isinstance(rad, (list, tuple)) else rad
        rings.append([addv(m, c + aa * r * math.cos(th0 + 2 * math.pi * j / n) + bb * r * math.sin(th0 + 2 * math.pi * j / n), w) for j in range(n)])
    for i in range(len(rings) - 1):
        for j in range(n):
            j1 = (j + 1) % n; addf(m, (rings[i][j], rings[i][j1], rings[i + 1][j1], rings[i + 1][j]), ((j / n, i / 4), ((j + 1) / n, i / 4), ((j + 1) / n, (i + 1) / 4), (j / n, (i + 1) / 4)))
    if caps:
        for ring, c in ((rings[0], path[0]), (rings[-1], path[-1])):
            ci = addv(m, c, w)
            for j in range(n): addf(m, (ring[j], ring[(j + 1) % n], ci), ((0, 0), (1, 0), (0.5, 1)))
def spline(pts, per=4):
    pts = [Vector(p) for p in pts]; Pp = [pts[0]] + pts + [pts[-1]]; out = []
    for i in range(1, len(Pp) - 2):
        p0, p1, p2, p3 = Pp[i - 1], Pp[i], Pp[i + 1], Pp[i + 2]
        for k in range(per):
            t = k / per; out.append(0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1]); return out
def bvh(part):
    me = objs[part][0].data; return BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [tuple(p.vertices) for p in me.polygons])
BH, BC = bvh("head"), bvh("coatT")
def hit(tree, x, z, y0=-1.0, d=Y):
    loc, nrm, _, _ = tree.ray_cast(V(x, y0, z), d)
    if loc is None: raise RuntimeError(f"sin impacto en {x},{z}")
    if nrm.dot(d) > 0: nrm = -nrm
    return loc, nrm
def push_out(tree, p, clear):
    loc, nrm, _, dist = tree.find_nearest(p)
    if loc is None: return p
    if nrm.dot(p - loc) < 0 or dist < clear: return loc + nrm * clear
    return p
HD = wfix("head")({})

# dientes torcidos sobre las encias (fila de arriba cae, la de abajo sube; boca algo abierta)
GC, GR = V(0, -0.118, 2.34), (0.058, 0.045, 0.05)
for row, (zr, sgn) in enumerate(((2.372, -1), (2.302, 1))):
    NT = 9
    for k in range(NT):
        al = math.radians(-58 + 116 * (k + 0.5) / NT); h = random.uniform(0.026, 0.04) * (1 - 0.25 * abs(al) / 1.0)
        wdt = random.uniform(0.0055, 0.0075); tilt = random.uniform(-0.3, 0.3)
        nn = V(math.sin(al) / GR[0], -math.cos(al) / GR[1], 0).normalized()
        base = V(GC.x + GR[0] * 0.98 * math.sin(al), GC.y - GR[1] * 0.98 * math.cos(al) - 0.004, zr)
        tg = Z.cross(nn).normalized(); up = (Z * math.cos(tilt) + tg * math.sin(tilt)).normalized()
        box("teeth", base + up * sgn * h * 0.5 + nn * random.uniform(0.002, 0.008), tg, nn, up, wdt, 0.0065, h * 0.5, HD)
# ojo lechoso grande (+X)
ec = V(0.046, -0.127, 2.468)
for i in range(6):
    t0, t1 = math.pi * i / 6, math.pi * (i + 1) / 6
    for j in range(8):
        p0, p1 = 2 * math.pi * j / 8, 2 * math.pi * (j + 1) / 8
        q = lambda t, p: ec + V(math.sin(t) * math.cos(p), math.sin(t) * math.sin(p), math.cos(t)) * 0.026
        idx = [addv("eye", q(t0, p0), HD), addv("eye", q(t0, p1), HD), addv("eye", q(t1, p1), HD), addv("eye", q(t1, p0), HD)]
        addf("eye", idx, ((j / 8, i / 6), ((j + 1) / 8, i / 6), ((j + 1) / 8, (i + 1) / 6), (j / 8, (i + 1) / 6)))
# cicatriz + grapas grandes en zigzag sobre la cuenca (-X), de la frente a la mejilla
SC = [(-0.03, 2.565), (-0.038, 2.53), (-0.046, 2.50), (-0.048, 2.468), (-0.052, 2.435), (-0.064, 2.40)]
scar = []
for x, z in SC:
    loc, nrm = hit(BH, x, z); scar.append(loc + nrm * 0.003)
tube("gums", spline(scar, 2), 0.006, 4, HD)
for k in range(8):
    t = k / 7; i = min(int(t * (len(SC) - 1)), len(SC) - 2); u = t * (len(SC) - 1) - i
    x = SC[i][0] + (SC[i + 1][0] - SC[i][0]) * u; z = SC[i][1] + (SC[i + 1][1] - SC[i][1]) * u
    loc, nrm = hit(BH, x, z); tg = Z.cross(nrm).normalized()
    ang = math.radians(30 if k % 2 else -30); ax = (tg * math.cos(ang) + Z * math.sin(ang)).normalized(); az = nrm.cross(ax).normalized()
    c = loc + nrm * 0.006
    box("metal", c, ax, nrm, az, 0.015, 0.0045, 0.005, HD)
    for e in (-1, 1): box("metal", c + ax * 0.014 * e - nrm * 0.006, ax, nrm, az, 0.004, 0.009, 0.005, HD)

# caja hexagonal de hierro oxidado en el pecho + luz verde tenue + pernos
CH = wfix("chest")({})
loc, nrm = hit(BC, 0.19, 1.87); bn = (nrm + V(0, -0.6, 0.1)).normalized(); bc = loc - bn * 0.03
tube("rust", [bc, bc + bn * 0.15], [0.15, 0.135], 6, CH, th0=math.pi / 6)
gc = bc + bn * 0.151; tube("green", [gc, gc + bn * 0.008], [0.065, 0.055], 6, CH, th0=math.pi / 6)
aa, bb = frame(bn)
for e in range(6):
    t = math.pi / 6 + e * math.pi / 3; box("metal", bc + bn * 0.152 + aa * 0.11 * math.cos(t) + bb * 0.11 * math.sin(t), aa, bb, bn, 0.01, 0.01, 0.008, CH)
for k in range(3):   # rejilla lateral del lado de arriba
    box("metal", bc + bn * (0.04 + 0.04 * k) + aa * 0.0 + bb * 0.0 + Z * 0.125, X, Y, Z, 0.07, 0.006, 0.01, CH)

# tubos rojo vino del pecho por encima de los hombros (empujados fuera de la goma) + abrazaderas
for s in (1, -1):
    for k, off in enumerate((0.0, 0.07)):
        st = bc + bn * 0.08 + V(s * (0.06 + off * 0.6), 0, 0.1 + off * 0.5)
        pts = [st, st + V(s * 0.05, -0.07, 0.08), V(s * (0.30 + off), -0.28 + off, 2.14), V(s * (0.50 + off), -0.10 + off, 2.31),
               V(s * (0.62 + off), 0.17, 2.25), V(s * (0.56 + off), 0.34, 1.95)]
        P = spline(pts, 3); P = [P[0], P[1]] + [push_out(BC, p, 0.045) for p in P[2:]]
        tube("tubes", P, 0.034, 5, CH)
        i = len(P) // 2 + 2; c = P[i]; t = (P[i + 1] - P[i - 1]).normalized(); aa2, bb2 = frame(t)
        tube("yellow", [c - t * 0.04, c + t * 0.04], 0.052, 6, CH)
P = spline([bc + bn * 0.09 + V(-0.06, 0, 0.1), V(-0.06, -0.30, 2.06), V(-0.13, -0.17, 2.18), V(-0.2, -0.06, 2.21)], 4)
tube("tubes", [P[0]] + [push_out(BC, p, 0.04) for p in P[1:]], 0.028, 6, CH)
for s in (1, -1):   # abrazaderas amarillas grandes en los hombros
    loc, nrm = BC.ray_cast(V(s * 0.64, 0.0, 3.0), -Z)[:2]
    w = {"chest": 0.6, f"upperarm{side(s)}": 0.4}
    box("yellow", loc + Z * 0.03, X, Y, Z, 0.07, 0.08, 0.04, w); box("coatT", loc + Z * 0.072, X, Y, Z, 0.05, 0.06, 0.006, w)
# costuras/rajas mostaza entre placas (siguen la superficie)
for sm in [[(0.0, 2.10), (-0.10, 1.98), (-0.22, 1.86), (-0.30, 1.72)], [(0.35, 2.05), (0.40, 1.92), (0.42, 1.78)], [(-0.36, 1.70), (-0.24, 1.62), (-0.10, 1.58)],
           [(0.30, 1.62), (0.16, 1.55), (0.04, 1.52)], [(-0.12, 1.50), (-0.14, 1.42), (-0.12, 1.34)]]:
    pts = []
    for x, z in sm:
        l, n = hit(BC, x, z); pts.append(l + n * 0.008)
    tube("yellow", spline(pts, 3), 0.011, 4, wbody(V(0, 0, sum(z for _, z in sm) / len(sm))))

# ---------------- objetos finales: una malla por material ----------------
groups = {}
for part, (o, mat, wf) in objs.items(): groups.setdefault(mat, []).append(o)
for m, A in ACC.items():
    me = bpy.data.meshes.new(m + "_hard"); me.from_pydata([tuple(v) for v in A["v"]], [], A["f"]); me.update()
    uv = me.uv_layers.new(name="UVMap")
    for pi, poly in enumerate(me.polygons):
        for k, l in enumerate(poly.loop_indices): uv.data[l].uv = A["uv"][pi][k]
    o = bpy.data.objects.new(m + "_hard", me); sc.collection.objects.link(o); groups.setdefault(m, []).append(o)
    o["hard_w"] = 1; objs[m + "_hard"] = (o, m, None); ACC[m]["obj"] = o
# UV planar por cara (organicas) antes de unir
for part, (o, mat, wf) in objs.items():
    if wf is None: continue
    me = o.data; uv = me.uv_layers.new(name="UVMap"); sca = UVS.get(mat, 4.0)
    for poly in me.polygons:
        n = poly.normal; ax = max(range(3), key=lambda i: abs(n[i])); ids = [i for i in range(3) if i != ax]
        for l in poly.loop_indices:
            co = me.vertices[me.loops[l].vertex_index].co; uv.data[l].uv = (co[ids[0]] * sca, co[ids[1]] * sca)
# pesos por vertice guardados como capa temporal y union por material
final = []
for m, lst in groups.items():
    for o in lst:
        info = objs[o.name]; wf = info[2]
        for i, v in enumerate(o.data.vertices):
            w = wf(v.co) if wf else ACC[m]["w"][i]
            for k, val in norm(w).items():
                g = o.vertex_groups.get(k) or o.vertex_groups.new(name=k); g.add([i], val, "REPLACE")
    bpy.ops.object.select_all(action="DESELECT")
    for o in lst: o.select_set(True)
    bpy.context.view_layer.objects.active = lst[0]
    if len(lst) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; o.name = m; o.data.name = m
    for p in o.data.polygons: p.use_smooth = m not in ("teeth", "metal", "rust", "green", "yellow")
    mat = bpy.data.materials.new("stalker_" + m); mat.use_nodes = True; nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); tx = nt.nodes.new("ShaderNodeTexImage")
    tx.image = bpy.data.images.load(f"{D}/tex/{m}.png"); tx.interpolation = "Closest"
    nt.links.new(tx.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Roughness"].default_value = 1; bsdf.inputs["Metallic"].default_value = 0
    if m == "green": nt.links.new(tx.outputs["Color"], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = 1.5
    o.data.materials.clear(); o.data.materials.append(mat); final.append(o)
    print("TRIS", m, sum(len(p.vertices) - 2 for p in o.data.polygons))

# ---------------- esqueleto ----------------
ad = bpy.data.armatures.new("StalkerRig"); rig = bpy.data.objects.new("StalkerRig", ad); sc.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode="EDIT")
def bone(n, h, t, parent=None):
    b = ad.edit_bones.new(n); b.head, b.tail = Vector(h), Vector(t); b.roll = 0
    if parent: b.parent = ad.edit_bones[parent]; b.use_connect = False
bone("hips", (0, 0.01, 1.20), (0, 0.01, 1.38)); bone("spine", (0, 0.01, 1.38), (0, 0.01, 1.68), "hips"); bone("chest", (0, 0.01, 1.68), (0, 0.01, 2.16), "spine")
bone("neck", (0, 0.0, 2.16), (0, -0.035, 2.30), "chest"); bone("head", (0, -0.035, 2.30), (0, -0.03, 2.60), "neck")
for s in (1, -1):
    S = side(s); x0, y0 = s * 0.83, -0.03
    bone(f"upperarm{S}", (s * 0.64, 0.02, 1.98), (s * 0.79, 0.02, 1.52), "chest"); bone(f"forearm{S}", (s * 0.79, 0.02, 1.52), (x0, y0, 1.14), f"upperarm{S}")
    bone(f"hand{S}", (x0, y0, 1.14), (x0 - s * 0.01, y0, 0.96), f"forearm{S}"); bone(f"fingers{S}", (x0 - s * 0.01, y0, 0.96), (x0 - s * 0.09, y0, 0.78), f"hand{S}")
    bone(f"thumb{S}", (x0 - s * 0.04, y0 - 0.085, 1.06), (x0 - s * 0.085, y0 - 0.125, 0.91), f"hand{S}")
    bone(f"thigh{S}", (s * 0.17, 0.02, 1.22), (s * 0.2, 0.02, 0.62), "hips"); bone(f"shin{S}", (s * 0.2, 0.02, 0.62), (s * 0.2, 0.05, 0.08), f"thigh{S}")
bpy.ops.object.mode_set(mode="OBJECT")
for o in final:
    o.parent = rig; md = o.modifiers.new("arm", "ARMATURE"); md.object = rig

bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=False, export_skins=True, export_yup=True, export_image_format="AUTO", use_selection=False)
lo = Vector((1e9,) * 3); hi = -lo
for o in final:
    for v in o.data.vertices: lo = Vector(map(min, lo, v.co)); hi = Vector(map(max, hi, v.co))
print("TOTAL TRIS", sum(sum(len(p.vertices) - 2 for p in o.data.polygons) for o in final))
print("BONES", [b.name for b in ad.bones])
print("BBOX m", tuple(round(c, 3) for c in lo), tuple(round(c, 3) for c in hi))

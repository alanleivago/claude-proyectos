# blender -b -P build.py -- <gltf> <lisa_dir>
# Lisa (P.T.) de Sketchfab (geladeiracomoeuamo1234, CC-BY 4.0) -> lisa/lisa_ps1.glb para three.js:
#  1) decimado moderado por pieza (cara y pelo conservan mas), 2) escala a 1,75 m, pies en z=0,
#  3) brazos de T-pose abajo (skinning lineal propio, sin heat weights), 4) esqueleto simple con pesos geometricos
#  (hips/spine/chest/neck/head, brazos, piernas) para animar en el motor (shuffle, inclinacion), 5) texturas de lisa/tex (PS1, 32 colores).
import bpy, bmesh, sys, math, mathutils
from mathutils import Vector, Matrix
a = sys.argv[sys.argv.index("--") + 1:]; SRC, D = a[0], a[1]
bpy.ops.wm.read_factory_settings(use_empty=True); bpy.ops.import_scene.gltf(filepath=SRC)
sc = bpy.context.scene
K = 1.75 / 80.2                                      # alto original ~80,2 (z -1,74..78,42)
RATIO = {"dress": 0.5, "head": 0.7, "hair": 0.7, "teeth": 1.0, "eyes": 1.0, "hands and legs": 0.5, "shoes": 1.0}
ARM_DOWN = math.radians(76)
if "nodec" in a: RATIO = {k: 1.0 for k in RATIO}
OUT = a[2] if len(a) > 2 and a[2].endswith(".glb") else f"{D}/lisa_ps1.glb"
dg = bpy.context.evaluated_depsgraph_get()
meshes = []
for o in [o for o in sc.objects if o.type == "MESH"]:
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4); bm.to_mesh(o.data); bm.free()   # el gltf separa vertices en las costuras UV: el decimado abria agujeros
    if RATIO[o.name] < 1:
        md = o.modifiers.new("dec", "DECIMATE"); md.ratio = RATIO[o.name]; md.use_collapse_triangulate = True
    dg = bpy.context.evaluated_depsgraph_get(); oe = o.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(oe, depsgraph=dg); me.transform(o.matrix_world)
    me.transform(Matrix.Translation((0, 0, 1.738 * K)) @ Matrix.Scale(K, 4))
    for poly in me.polygons: poly.use_smooth = True   # v3: sombreado suave (se veia facetada)
    n = bpy.data.objects.new(o.name, me); sc.collection.objects.link(n); meshes.append(n)
for o in [o for o in sc.objects if o not in meshes]: bpy.data.objects.remove(o)
for o in meshes: o.name = o.name.split(".")[0]
for o in meshes: print("DEC", o.name, sum(len(p.vertices) - 2 for p in o.data.polygons))

J = lambda x, y, z: Vector((x, y, z + 1.738)) * K       # juntas en unidades originales -> metros
# donde estan los brazos: centroide en y/z de los vertices con |x| > 15 (para poner la junta en el centro del brazo)
arm = [v.co for o in meshes if o.name in ("dress", "hands and legs") for v in o.data.vertices if abs(v.co.x) > 15 * K]
ay = sum(v.y for v in arm) / len(arm) / K; az = sum(v.z for v in arm) / len(arm) / K - 1.738
print("ARM y/z", round(ay, 2), round(az, 2))
SH, EL, WR, TIP = 6.0, 19.0, 31.0, 37.0
def sstep(e0, e1, x): t = min(1, max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

def weights(name, co):
    x, y, z = co.x / K, co.y / K, co.z / K - 1.738; s = abs(x); side = "L" if x > 0 else "R"; w = {}
    armw = sstep(6, 10, s) * sstep(az - 6, az - 3.5, z) if name != "shoes" else 0
    if armw > 0:
        u = sstep(EL - 2, EL + 2, s); h = sstep(WR - 1.5, WR + 1.5, s)
        w[f"upperarm.{side}"] = armw * (1 - u); w[f"forearm.{side}"] = armw * u * (1 - h); w[f"hand.{side}"] = armw * u * h
    rest = 1 - armw
    if rest > 0:
        legz = 38 if name != "dress" else 30
        legw = (1 - sstep(legz - 4, legz, z)) * (1 if name != "dress" else 0.3)
        if legw > 0:
            k = sstep(17, 23, z)
            w[f"thigh.{side}"] = w.get(f"thigh.{side}", 0) + rest * legw * k; w[f"shin.{side}"] = rest * legw * (1 - k)
        t = rest * (1 - legw)
        bands = [("hips", -99, 44), ("spine", 44, 54), ("chest", 54, 64.5), ("neck", 64.5, 68.5), ("head", 68.5, 999)]
        for i, (b, z0, z1) in enumerate(bands):
            lo = 1 if i == 0 else sstep(z0 - 1.5, z0 + 1.5, z); hi = 1 if i == len(bands) - 1 else 1 - sstep(z1 - 1.5, z1 + 1.5, z)
            if lo * hi > 0: w[b] = w.get(b, 0) + t * lo * hi
    tot = sum(w.values()); return {k: v / tot for k, v in w.items() if v / tot > 1e-3}

# brazos abajo: rotacion en el hombro (y en x hacia el frente un poco, para no atravesar la falda)
def Rarm(side):
    sgn = 1 if side == "L" else -1
    return Matrix.Translation(J(sgn * SH, ay, az)) @ Matrix.Rotation(sgn * ARM_DOWN, 4, "Y") @ Matrix.Translation(-J(sgn * SH, ay, az))
RA = {"L": Rarm("L"), "R": Rarm("R")}
W = {}
for o in meshes:
    W[o.name] = []
    for v in o.data.vertices:
        w = weights(o.name, v.co); W[o.name].append(w)
        aw = sum(val for k, val in w.items() if k.split(".")[0] in ("upperarm", "forearm", "hand"))
        if aw > 0:
            side = "L" if v.co.x > 0 else "R"; v.co = (RA[side] @ v.co) * aw + v.co * (1 - aw)

# esqueleto (reposo = brazos abajo)
ad = bpy.data.armatures.new("LisaRig"); arm_ob = bpy.data.objects.new("LisaRig", ad); sc.collection.objects.link(arm_ob)
bpy.context.view_layer.objects.active = arm_ob; bpy.ops.object.mode_set(mode="EDIT")
def bone(n, h, t, parent=None):
    b = ad.edit_bones.new(n); b.head, b.tail = h, t
    if parent: b.parent = ad.edit_bones[parent]; b.use_connect = False
    return b
bone("hips", J(0, ay, 38), J(0, ay, 44)); bone("spine", J(0, ay, 44), J(0, ay, 54), "hips"); bone("chest", J(0, ay, 54), J(0, ay, 64.5), "spine")
bone("neck", J(0, ay, 64.5), J(0, ay, 68.5), "chest"); bone("head", J(0, ay, 68.5), J(0, ay, 78.4), "neck")
for side, sg in (("L", 1), ("R", -1)):
    R = RA[side]; P = lambda s: R @ J(sg * s, ay, az)
    bone(f"upperarm.{side}", P(SH), P(EL), "chest"); bone(f"forearm.{side}", P(EL), P(WR), f"upperarm.{side}"); bone(f"hand.{side}", P(WR), P(TIP), f"forearm.{side}")
    bone(f"thigh.{side}", J(sg * 3.8, ay, 38), J(sg * 3.8, ay, 20), "hips"); bone(f"shin.{side}", J(sg * 3.8, ay, 20), J(sg * 3.8, ay, 1.5), f"thigh.{side}")
for b in ad.edit_bones: b.roll = 0
bpy.ops.object.mode_set(mode="OBJECT")
for o in meshes:
    o.parent = arm_ob; m = o.modifiers.new("arm", "ARMATURE"); m.object = arm_ob
    groups = {}
    for i, w in enumerate(W[o.name]):
        for k, val in w.items():
            g = groups.get(k) or o.vertex_groups.new(name=k); groups[k] = g; g.add([i], val, "REPLACE")

# texturas PS1
for o in meshes:
    mat = o.data.materials[0]; n = next(n for n in mat.node_tree.nodes if n.type == "TEX_IMAGE")
    img = bpy.data.images.load(f"{D}/tex/{o.name.replace(' ', '_')}.png"); n.image = img; n.interpolation = "Closest"
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    for s in ("Metallic",): bsdf.inputs[s].default_value = 0
    bsdf.inputs["Roughness"].default_value = 1
    mat.name = "lisa_" + o.name.replace(" ", "_")
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_animations=False, export_skins=True, export_yup=True,
                          export_image_format="AUTO", use_selection=False)
lo = Vector((1e9,) * 3); hi = -lo
for o in meshes:
    for v in o.data.vertices: lo = Vector(map(min, lo, v.co)); hi = Vector(map(max, hi, v.co))
print("BBOX m", tuple(round(c, 3) for c in lo), tuple(round(c, 3) for c in hi))

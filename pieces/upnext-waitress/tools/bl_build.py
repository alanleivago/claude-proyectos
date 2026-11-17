"""blender -b --factory-startup --python bl_build.py -- <build.json> <out.blend> [out.glb]
Mesh + materials (nearest, alpha clip) + 23-bone humanoid rig (girl2 names) + actions Apose/Tpose/idle/walk."""
import sys, json, math, bpy
from mathutils import Vector, Quaternion, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
J = json.load(open(argv[0]))
OUT_BLEND = argv[1]
OUT_GLB = argv[2] if len(argv) > 2 else None
C = J["centre_x"]
cv = lambda p: Vector((p[0] - C, -p[2], p[1]))       # OBJ (x, y up, z front) -> Blender, centred on x

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = 24

# ---------------------------------------------------------------- materials
mats = []
for i, path in enumerate(J["tex"]):
    img = bpy.data.images.load(path)
    img.name = ["ST1AT_40", "ST1AT_41", "lower"][i]
    m = bpy.data.materials.new(["waitress_clut40", "waitress_clut41", "waitress_lower"][i])
    m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tx = nt.nodes.new("ShaderNodeTexImage"); tx.image = img; tx.interpolation = "Closest"
    nt.links.new(tx.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 1.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bsdf.inputs: bsdf.inputs[nm].default_value = 0.0
    if i < 2:                                          # hair spikes use the CLUT alpha -> MASK
        gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5
        nt.links.new(tx.outputs["Alpha"], gt.inputs[0]); nt.links.new(gt.outputs[0], bsdf.inputs["Alpha"])
        try: m.surface_render_method = "DITHERED"
        except Exception: pass
    m.use_backface_culling = False
    mats.append(m)

# ---------------------------------------------------------------- mesh
me = bpy.data.meshes.new("waitress")
verts = [cv(p) for p in J["verts"]]
faces = [f["v"] for f in J["faces"]]
me.from_pydata(verts, [], faces)
for m in mats: me.materials.append(m)
uvl = me.uv_layers.new(name="UVMap")
li = 0
for poly, f in zip(me.polygons, J["faces"]):
    poly.material_index = f["mat"]
    poly.use_smooth = False
    for k, li in enumerate(poly.loop_indices):
        uvl.data[li].uv = f["uv"][k]
me.validate(); me.update()
ob = bpy.data.objects.new("waitress", me)
sc.collection.objects.link(ob)
groups = {}
for vi, w in enumerate(J["weights"]):
    for b, x in w.items():
        if b not in groups: groups[b] = ob.vertex_groups.new(name=b)
        groups[b].add([vi], x, "REPLACE")
# part tag (for checks) as an int attribute on faces
parts = sorted({f["part"] for f in J["faces"]})
at = me.attributes.new("part", "INT", "FACE")
for i, f in enumerate(J["faces"]): at.data[i].value = parts.index(f["part"])
ob["parts"] = json.dumps(parts)

# ---------------------------------------------------------------- armature
ad = bpy.data.armatures.new("waitress_rig")
arm = bpy.data.objects.new("waitress_rig", ad)
sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
B = J["bones"]
for n, b in B.items():
    eb = ad.edit_bones.new(n); eb.head = cv(b["head"]); eb.tail = cv(b["tail"])
    eb.align_roll(Vector((0, -1, 0)) if abs((eb.tail - eb.head).normalized().y) < 0.9 else Vector((0, 0, 1)))
for n, b in B.items():
    if b["parent"]: ad.edit_bones[n].parent = ad.edit_bones[b["parent"]]
bpy.ops.object.mode_set(mode="OBJECT")
ob.parent = arm
mod = ob.modifiers.new("Armature", "ARMATURE"); mod.object = arm
missing = [g for g in groups if g not in B]
assert not missing, missing

# ---------------------------------------------------------------- actions
pb = arm.pose.bones
for p in pb: p.rotation_mode = "QUATERNION"
REST = {p.name: p.bone.matrix_local.to_quaternion() for p in pb}

def qa(axis, deg):
    return Quaternion(Vector(axis), math.radians(deg))

def setrot(name, q_arm):
    R = REST[name]
    pb[name].rotation_quaternion = R.inverted() @ q_arm @ R

def setloc(name, d):
    R = pb[name].bone.matrix_local.to_3x3()
    pb[name].location = R.inverted() @ Vector(d)

def clear():
    for p in pb:
        p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0)

def key(f):
    for p in pb:
        p.keyframe_insert("rotation_quaternion", frame=f)
        p.keyframe_insert("location", frame=f)

X, Y, Z = (1, 0, 0), (0, 1, 0), (0, 0, 1)
SKIRT = "SkirtFL" in B

def legs(side, flex, knee, foot):
    setrot("Thigh." + side, qa(X, -flex))
    setrot("Calf." + side, qa(X, knee))
    setrot("Foot." + side, qa(X, foot))
    if SKIRT:
        f = 0.6 * max(flex, 0) + 0.15 * min(flex, 0)
        b = 0.6 * min(flex, 0) + 0.15 * max(flex, 0)
        setrot("SkirtF" + side, qa(X, -f)); setrot("SkirtB" + side, qa(X, -b))

def make_action(name, frames, fn):
    a = bpy.data.actions.new(name); a.use_fake_user = True
    arm.animation_data_create(); arm.animation_data.action = a
    for f in frames:
        clear(); fn(f); key(f)
    for fc in getattr(a, "fcurves", []):
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    tr = arm.animation_data.nla_tracks.new(); tr.name = name
    st = tr.strips.new(name, int(frames[0]), a); st.name = name
    arm.animation_data.action = None
    return a

make_action("Apose", [1], lambda f: None)

def tpose(f):
    setrot("UpperArm.R", qa(Y, 74)); setrot("UpperArm.L", qa(Y, -74))
make_action("Tpose", [1], tpose)

def idle(f):
    t = 2 * math.pi * (f - 1) / 48
    setloc("Pelvis", (0.006 * math.sin(t), 0, 0.002 * math.sin(2 * t)))
    setrot("Pelvis", qa(Y, 1.5 * math.sin(t)))
    setrot("Spine", qa(Y, -1.0 * math.sin(t)) @ qa(X, 0.8 * math.sin(2 * t)))
    setrot("Chest", qa(X, -1.2 * math.sin(2 * t)))
    setrot("Head", qa(Z, 3 * math.sin(t * 0.5 + 0.4)) @ qa(X, 1.0 * math.sin(2 * t + 1)))
    for s, sg in (("L", 1), ("R", -1)):
        setrot("UpperArm." + s, qa(X, -2 * math.sin(t + (0 if s == "L" else 1))) @ qa(Y, sg * -1.5 * (1 + math.sin(2 * t)) / 2))
        setrot("Forearm." + s, qa(X, -6 - 2 * math.sin(t)))
        legs(s, 0.8 * sg * math.sin(t), 1.5 + 0.8 * (1 + sg * math.sin(t)), -0.6 * sg * math.sin(t))
make_action("idle", list(range(1, 50, 2)), idle)

def walk(f):
    t = 2 * math.pi * (f - 1) / 24
    setloc("Pelvis", (0, 0, 0.012 * math.cos(2 * t) - 0.006))
    setrot("Pelvis", qa(Z, 5 * math.sin(t)) @ qa(Y, 2.5 * math.sin(t + math.pi / 2)))
    setrot("Spine", qa(Z, -3 * math.sin(t)))
    setrot("Chest", qa(Z, -3 * math.sin(t)) @ qa(X, 2))
    setrot("Head", qa(Z, 1 * math.sin(t)))
    for s, ph in (("L", 0.0), ("R", math.pi)):
        tt = t + ph
        flex = 24 * math.sin(tt)
        knee = 6 + 46 * max(0.0, math.cos(tt - 0.25)) ** 1.6
        foot = max(-25, min(25, 0.75 * (flex - knee)))
        legs(s, flex, knee, foot)
        setrot("UpperArm." + s, qa(X, 16 * math.sin(tt)))
        setrot("Forearm." + s, qa(X, -12 - 8 * max(0, -math.sin(tt))))
make_action("walk", list(range(1, 26)), walk)
clear()

bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
print("BUILD saved", OUT_BLEND, len(me.vertices), "verts", len(me.polygons), "faces")
if OUT_GLB:
    bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB", export_yup=True, export_skins=True,
                              export_animations=True, export_animation_mode="NLA_TRACKS", export_apply=False)
    print("BUILD glb", OUT_GLB)

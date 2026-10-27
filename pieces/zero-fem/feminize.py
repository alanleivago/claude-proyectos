"""blender -b ZeroVolnutt.blend --python feminize.py -- <out_dir>
Female proportions for the Megaman-Legends-style model: fuller chest, narrower waist, wider hips and butt.
Edits mesh vertices in rest space (Body has both halves; Arms/legs are mirrored from the +X half).
v2: the ponytail is tilted down to hang behind the head (mesh + Hair bone rest), hair_*.png turnaround.
Saves zero_fem.blend + zero_fem.glb in out_dir and renders before/after turnarounds. Never saves the source.
Chain after this: python face/build_face.py, then blender -b out/zero_fem.blend --python anim/build_anim.py."""
import bpy, sys, os, math
from mathutils import Vector

OUT = os.path.abspath(sys.argv[sys.argv.index("--") + 1:][0])   # absolute: Blender resolves relative render paths elsewhere
os.makedirs(OUT, exist_ok=True)
CHEST, WAIST, HIPS, BUTT = 0.6, 0.86, 1.18, 0.48      # tuning knobs


def smooth(t):  # 0..1 bell
    t = max(0.0, min(1.0, t)); return t * t * (3 - 2 * t)


def render(tag):
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = 480, 720
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.world.use_nodes = True
    next(n for n in sc.world.node_tree.nodes if n.type == "BACKGROUND").inputs["Color"].default_value = (0, 0, 0, 1)
    cam = sc.camera
    for i, a in enumerate((0, 45, 90, 180)):
        r = math.radians(a)
        cam.location = (20 * math.sin(r), -20 * math.cos(r), -1.2)
        cam.rotation_euler = (math.radians(90), 0, r)
        cam.data.lens = 50
        sc.render.filepath = os.path.join(OUT, f"{tag}_{i}.png")
        bpy.ops.render.render(write_still=True)


TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex", "ZeroVolnuttTexture.png")   # with lashes
mat = bpy.data.materials["Zero"]; nt = mat.node_tree
tex = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
tex.image = bpy.data.images.load(TEX); tex.image.pack()
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
out_node = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
emit = nt.nodes.new("ShaderNodeEmission")                 # unlit preview, like the author's Render.png
nt.links.new(tex.outputs["Color"], emit.inputs["Color"])
nt.links.new(emit.outputs["Emission"], out_node.inputs["Surface"])

arm = bpy.data.objects["Armature"]
for a in (arm,):
    if a.animation_data:
        a.animation_data.action = None
for pb in arm.pose.bones:
    pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.rotation_euler = (0, 0, 0); pb.scale = (1, 1, 1)
from mathutils import Quaternion
for side, s in (("L", 1), ("R", -1)):                       # arms down for the preview only (not saved)
    pb = arm.pose.bones[f"UpperArm.{side}"]; pb.rotation_mode = "QUATERNION"
    rest = arm.data.bones[f"UpperArm.{side}"].matrix_local.to_quaternion()
    pb.rotation_quaternion = rest.inverted() @ Quaternion((0, 1, 0), s * math.radians(72)) @ rest
bpy.context.view_layer.update()
render("before")

body = bpy.data.objects["Body"].data
for v in body.vertices:
    x, y, z = v.co
    # chest: the front plate (with the orb) moves forward as one piece so its texture keeps its shape;
    # only the plain red faces above and below it stretch
    if y < -0.4 and 0.3 < z < 1.0:
        v.co.y -= CHEST
    elif y < -0.4 and 1.0 <= z < 1.35:
        v.co.y -= CHEST * 0.3
    # waist: the band between ribcage and pelvis pulls in
    if -1.1 < z < -0.5:
        v.co.x *= WAIST
    # hips: pelvis widens; butt: back of the pelvis pushes out
    if -2.0 < z < -1.35:
        v.co.x *= HIPS
        if y > 0.2:
            v.co.y += BUTT * smooth(1 - abs(z + 1.75) / 0.45)

legs = bpy.data.objects["Arms"]
vgn = {g.index: g.name for g in legs.vertex_groups}
for v in legs.data.vertices:
    ws = {vgn[g.group]: g.weight for g in v.groups}
    if ws.get("Thigh.L", 0) < 0.5 and ws.get("Thigh.R", 0) < 0.5:
        continue
    x, y, z = v.co
    k = smooth((z + 3.6) / 1.3)                             # top of the thigh only, fading down to mid-thigh
    v.co.x *= 1 + 0.12 * k                                  # outer hip line
    if y > 0:
        v.co.y += BUTT * 0.7 * k                            # butt continues onto the back of the thigh
bpy.context.view_layer.update()
render("after")

# ponytail (v2): the author's spike sticks straight back and fills the frame; tilt it down behind the head so it
# hangs like long hair. PonyTail (8 verts, all on bone Hair, mirrored in X) and the Hair bone's rest are rotated
# together about the root at the back of the head, so the skinning is unchanged. Narrower and a bit shorter.
HAIR_DOWN, HAIR_W, HAIR_L = -64, 0.62, 0.92                # degrees about X (+Y = back), width, length
from mathutils import Matrix
pt = bpy.data.objects["PonyTail"]
root = Vector((0.0, 0.712, 0.1))                           # root ring centre, PonyTail mesh space
Rx = Matrix.Rotation(math.radians(HAIR_DOWN), 3, "X")
for v in pt.data.vertices:
    d = v.co - root
    k = max(0.0, min(1.0, d.y / 6.0))                       # the root ring keeps its width
    v.co = root + Rx @ Vector((d.x * (1 + (HAIR_W - 1) * k), d.y * HAIR_L, d.z * HAIR_L))
pivot = arm.matrix_world.inverted() @ pt.matrix_world @ root
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
eb = arm.data.edit_bones["Hair"]
eb.head, eb.tail = pivot + Rx @ (eb.head - pivot), pivot + Rx @ ((eb.tail - pivot) * HAIR_L)
bpy.ops.object.mode_set(mode="POSE")
bpy.ops.object.mode_set(mode="OBJECT")
bpy.context.view_layer.update()
render("hair")
for pb in arm.pose.bones:
    pb.rotation_quaternion = (1, 0, 0, 0)
bpy.context.view_layer.update()
nt.links.new(bsdf.outputs["BSDF"], out_node.inputs["Surface"])      # back to the textured BSDF for the GLB
nt.nodes.remove(emit)

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "zero_fem.blend"), copy=True)
for o in bpy.data.objects:
    o.select_set(o.type in ("MESH", "ARMATURE"))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "zero_fem.glb"), use_selection=True, export_apply=True,
                          export_animations=False, export_yup=True)
print("DONE")

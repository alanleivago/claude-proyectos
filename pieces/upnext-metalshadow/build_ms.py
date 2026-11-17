"""MetalShadow -> engine-ready base (keeps the pack's mesh, texture and 14-bone FK skeleton).

    blender -b -Y <assets/metalshadow/MetalShadow.blend> --python build_ms.py      # -> out/metalshadow.blend

- drops the pack's Hover action, its leg IK helpers (LegIKTarget / FootRoll / LegIKPoleTarget) and every bone constraint,
  so the clips are plain FK and export exactly;
- moves mesh + skeleton up so the soles sit on z = 0 (front = -Y, up = +Z, T-pose rest kept);
- splits the 4 eye quads into their own material 'ms_eyes' with tex/ms_eyes.png (build_face.py) and maps their UVs onto
  cell 0 of that atlas (screen-left eye as is, screen-right eye mirrored), so the engine swaps expressions by map.offset;
- nearest-filter textures, packed into the .blend so the glTF embeds them."""
import os, bpy, bmesh
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
OUTD = os.path.join(HERE, "out"); os.makedirs(OUTD, exist_ok=True)
COLS, ROWS = 8, 5

arm = bpy.data.objects["Armature"]
mesh = next(o for o in bpy.data.objects if o.type == "MESH")
mesh.name = "MetalShadow"; mesh.data.name = "MetalShadow"
for o in [o for o in bpy.data.objects if o.type in ("CAMERA", "LIGHT")]:
    bpy.data.objects.remove(o)

# ---- animation + constraints out
if arm.animation_data:
    arm.animation_data.action = None
    for t in list(arm.animation_data.nla_tracks): arm.animation_data.nla_tracks.remove(t)
for a in list(bpy.data.actions): bpy.data.actions.remove(a)
for pb in arm.pose.bones:
    for c in list(pb.constraints): pb.constraints.remove(c)
    pb.location, pb.rotation_quaternion, pb.scale = Vector(), (1, 0, 0, 0), Vector((1, 1, 1))
    pb.rotation_euler = (0, 0, 0)

# ---- soles to z = 0
zmin = min((mesh.matrix_world @ v.co).z for v in mesh.data.vertices)
dz = -zmin
for v in mesh.data.vertices: v.co.z += dz
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="EDIT")
eb = arm.data.edit_bones
for n in [b.name for b in eb if b.name.startswith(("LegIK", "FootRoll"))]:
    eb.remove(eb[n])
HT = {b.name: (b.head.copy(), b.tail.copy()) for b in eb}       # absolute targets (connected joints move together)
for _ in range(2):
    for b in eb:
        h, t = HT[b.name]; b.head = h + Vector((0, 0, dz)); b.tail = t + Vector((0, 0, dz))
bpy.ops.object.mode_set(mode="OBJECT")
arm["ms_zshift"] = dz
print("bones", [b.name for b in arm.data.bones], "dz", round(dz, 3))

# ---- eye material + UVs
img_main = bpy.data.images["MetalShadowTexture.png"]
img_main.filepath = os.path.join(os.path.dirname(bpy.data.filepath), "MetalShadowTexture.png"); img_main.reload(); img_main.pack()
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE": n.interpolation = "Closest"
eyes = bpy.data.materials.new("ms_eyes"); eyes.use_nodes = True
nt = eyes.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
tex = nt.nodes.new("ShaderNodeTexImage"); tex.interpolation = "Closest"
eimg = bpy.data.images.load(os.path.join(HERE, "tex", "ms_eyes.png")); eimg.pack(); tex.image = eimg
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
try: bsdf.inputs["Roughness"].default_value = 1.0
except KeyError: pass
me = mesh.data
me.materials.append(eyes); EI = len(me.materials) - 1
uv = me.uv_layers.active.data
n_eye = 0
for p in me.polygons:
    us = [uv[l].uv.copy() for l in p.loop_indices]
    px = [(u.x * 128, (1 - u.y) * 128) for u in us]                    # texture pixels, y down
    if max(x for x, _ in px) <= 64.5 and min(y for _, y in px) >= -0.5 and max(y for _, y in px) <= 64.5 \
            and (max(x for x, _ in px) - min(x for x, _ in px)) > 20:    # the 4 big eye quads (front + side per eye)
        p.material_index = EI; n_eye += 1
        right = p.center.x > 0                                          # +X = screen right seen from the front (-Y)
        for l, (x, y) in zip(p.loop_indices, px):
            cx = (128 - x) if right else x                              # cell px, 128 x 64
            uv[l].uv = (cx / 128 / COLS, 1 - (y / 64) / ROWS)
print("eye quads", n_eye)
assert n_eye == 4

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTD, "metalshadow.blend"), copy=False)
print("BUILD DONE")

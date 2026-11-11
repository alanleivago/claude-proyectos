"""Kit v3 human loader (inside any Blender scene, e.g. the zaw-dog kit via build.py's exec mode).
    sys.path.insert(0, "<repo>/styles/zawdog/humans"); import human as HU
    P = HU.Human("owner")            # appends humans/owner/owner.blend (rig + body), kit flat shading (50% emission)
    P.face("scared")                  # hard expression swap: neutral smile surprised crying laughing scared
    P.place((x, y), yaw)              # root on the floor, facing -Y rotated by yaw
    P.action = HU.load_action(...)    # see styles/zawdog/tools/retarget.py (mocap -> this rig)
Bone names are MakeHuman's "default" skeleton (upperarm01.L, lowerarm01.L, spine02, finger1-1.L ...)."""
import math
import os

import bpy
from mathutils import Euler, Vector

H = os.path.dirname(os.path.abspath(__file__))
EXPR = ("neutral", "smile", "surprised", "crying", "laughing", "scared")


def flat(m):
    """the kit's 'almost unlit' look: 50% emission + 50% diffuse from the image, Closest filtering."""
    nt = m.node_tree; t = nt.nodes["img"]; out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    for n in [n for n in nt.nodes if n not in (t, out)]:
        nt.nodes.remove(n)
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission"); mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.5
    nt.links.new(t.outputs[0], dif.inputs["Color"]); nt.links.new(t.outputs[0], emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2]); nt.links.new(mix.outputs[0], out.inputs[0])


class Human:
    def __init__(self, name, flat_shading=True):
        self.name = name; self.dir = os.path.join(H, name)
        path = os.path.join(self.dir, name + ".blend")
        with bpy.data.libraries.load(path, link=False) as (src, dst):
            dst.objects = [n for n in src.objects if n in (name + "_rig", name + "_body")]
        for o in dst.objects:
            bpy.context.scene.collection.objects.link(o)
        self.rig = bpy.data.objects[dst.objects[0].name if dst.objects[0].type == "ARMATURE" else dst.objects[1].name]
        self.body = next(o for o in dst.objects if o.type == "MESH")
        self.mface = self.body.material_slots[1].material; self.msheet = self.body.material_slots[0].material
        if flat_shading:
            flat(self.mface); flat(self.msheet)
        self.faces = {}
        for e in EXPR:
            p = os.path.join(self.dir, "faces", e + ".png")
            if os.path.exists(p):
                im = bpy.data.images.load(p, check_existing=True); im.pack(); self.faces[e] = im
        self.rig.rotation_mode = "XYZ"
        self.cur = "neutral"
        self.rest()                       # pose bones -> QUATERNION (the baked actions key rotation_quaternion)

    def play(self, action, offset=0):
        """assign a baked action (Blender 5 slotted actions: the slot must be set too); offset shifts it in time."""
        ad = self.rig.animation_data or self.rig.animation_data_create()
        ad.action = action
        if hasattr(ad, "action_slot") and action.slots:
            ad.action_slot = action.slots[0]
        return ad

    def face(self, expr):
        self.mface.node_tree.nodes["img"].image = self.faces[expr]; self.cur = expr

    def place(self, loc, yaw=0.0):
        self.rig.location = (loc[0], loc[1], loc[2] if len(loc) > 2 else 0.0); self.rig.rotation_euler = (0, 0, yaw)

    def show(self, on=True):
        for o in (self.rig, self.body):
            o.hide_render = o.hide_viewport = not on

    def bone_world(self, bn, tail=False):
        bpy.context.view_layer.update(); pb = self.rig.pose.bones[bn]
        return self.rig.matrix_world @ (pb.tail if tail else pb.head)

    def rest(self):
        for pb in self.rig.pose.bones:
            pb.rotation_mode = "QUATERNION"; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)

    def arms_down(self):
        """quick check pose (the mesh's rest is MakeHuman's A-pose): upper arms ~35 deg further down."""
        self.rest()
        for s, sg in (("L", 1), ("R", -1)):
            pb = self.rig.pose.bones[f"upperarm01.{s}"]; pb.rotation_mode = "XYZ"; pb.rotation_euler = Euler((0, 0, 0))
            pb.rotation_mode = "QUATERNION"
            from mathutils import Quaternion
            ax = (self.rig.matrix_world.to_3x3() @ pb.bone.matrix_local.to_3x3()).inverted() @ Vector((0, 1, 0))
            pb.rotation_quaternion = Quaternion(ax, math.radians(-38) * sg)


def load_action(name):
    """an action baked by styles/zawdog/tools/retarget.py (motions/baked/<name>.blend)."""
    if name in bpy.data.actions:
        return bpy.data.actions[name]
    path = os.path.join(H, "..", "motions", "baked", name + ".blend")
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.actions = [name]
    return dst.actions[0]

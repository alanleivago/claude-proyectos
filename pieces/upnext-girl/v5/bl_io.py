"""Blender <-> numpy: export rest pieces + rigid pose matrices; import bone world matrices as a pose."""
import bpy, json, numpy as np
from mathutils import Matrix, Vector
V5 = r"F:/Claude Proyectos/pieces/upnext-girl/v5/"
ARM = bpy.data.objects["Armature"]


def export_state(tag):
    bpy.context.view_layer.update()
    out = {"pieces": {}, "bones": {}}
    for o in bpy.data.collections["GirlV5"].all_objects:
        if o.type != "MESH": continue
        out["pieces"][o.name] = dict(bone=o.vertex_groups[0].name, verts=[list(v.co) for v in o.data.vertices],
                                     faces=[list(p.vertices) for p in o.data.polygons])
    for pb in ARM.pose.bones:
        out["bones"][pb.name] = dict(rest=[list(r) for r in pb.bone.matrix_local], pose=[list(r) for r in pb.matrix],
                                     parent=pb.parent.name if pb.parent else None,
                                     length=pb.bone.length)
    json.dump(out, open(V5 + f"state_{tag}.json", "w"))


def set_world(bone, M):
    pb = ARM.pose.bones[bone]; pb.matrix = Matrix(M); bpy.context.view_layer.update()


def import_pose(tag):
    """state json 'target' = {bone: 4x4 armature-space pose matrix} applied in hierarchy order; legs through IK controls"""
    d = json.load(open(V5 + f"target_{tag}.json"))
    order = ["Pelvis", "Chest", "Neck", "Head", "UpperArm.L", "Forearm.L", "Hand.L", "UpperArm.R", "Forearm.R", "Hand.R"]
    for b in order:
        if b in d: set_world(b, d[b])
    for s in "LR":
        if f"Calf.{s}" not in d: continue
        Mt, Mc, Mf = Matrix(d[f"Thigh.{s}"]), Matrix(d[f"Calf.{s}"]), Matrix(d[f"Foot.{s}"])
        hip = Mt.translation; knee = Mc.translation
        ankle = Mc @ Vector((0, ARM.pose.bones[f"Calf.{s}"].bone.length, 0))
        fc = ARM.pose.bones[f"FootControl.{s}"]; R = fc.bone.matrix_local.to_3x3().to_4x4(); R.translation = ankle
        fc.matrix = R
        pole = knee + (knee - (hip + ankle) / 2).normalized() * 4
        pt = ARM.pose.bones[f"FootPoleTarget.{s}"]; R = pt.bone.matrix_local.copy(); R.translation = pole; pt.matrix = R
        bpy.context.view_layer.update()
        fr = ARM.pose.bones[f"FootRotation.{s}"]
        R = Mf.to_3x3() @ ARM.pose.bones[f"Foot.{s}"].bone.matrix_local.to_3x3().inverted() @ fr.bone.matrix_local.to_3x3()
        R = R.to_4x4(); R.translation = fr.matrix.translation; fr.matrix = R
        bpy.context.view_layer.update()

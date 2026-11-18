"""Blender: key the fitted poses as actions (tut_hip from pose_hip.json, his_rest from pose_front.json)."""
import bpy, json, math
from mathutils import Euler
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
ARM = bpy.data.objects["Armature"]


def set_state(bones, extra=None):
    for pb in ARM.pose.bones: pb.matrix_basis.identity()
    for b, v in bones.items():
        v = list(v)
        if extra and b in extra: v = [a + d for a, d in zip(v, extra[b])]
        pb = ARM.pose.bones[b]; pb.location = v[:3]
        q = Euler([math.radians(a) for a in v[3:]], "XYZ").to_quaternion()
        if pb.rotation_mode == "QUATERNION": pb.rotation_quaternion = q
        else: pb.rotation_euler = q.to_euler(pb.rotation_mode)
    bpy.context.view_layer.update()


def key_state_action(name, path, keys):
    """keys: [(frame, extra_offsets_or_None)]"""
    st = json.load(open(path))
    act = bpy.data.actions.get(name)
    if act: bpy.data.actions.remove(act)
    ad = ARM.animation_data_create()
    for t in ad.nla_tracks: t.mute = True
    act = bpy.data.actions.new(name); act.use_fake_user = True; ad.action = act
    for f, extra in keys:
        set_state(st["bones"], extra)
        for pb in ARM.pose.bones:
            pb.keyframe_insert("location", frame=f)
            pb.keyframe_insert("rotation_quaternion" if pb.rotation_mode == "QUATERNION" else "rotation_euler", frame=f)
    ad.action = None
    return act


BREATH = {"Chest": [0, 0, 0, -2, 0, 0], "Head": [0, 0, 0, -2, 0, 0], "Pelvis": [0, 0.05, 0, 0, 0, 0]}


def make_v5_actions():
    key_state_action("tut_hip", V5 + "pose_hip.json", [(1, None), (24, BREATH), (48, None)])
    key_state_action("his_rest", V5 + "pose_front.json", [(1, None)])
    key_state_action("tut_idle", V5 + "pose_idle.json", [(1, None), (21, BREATH), (41, None)])
    run_loop()


def run_loop():
    """his running punch (12:44, t=764.0 / 764.4): two fitted keys, looped 1 -> 9 -> 17"""
    A = json.load(open(V5 + "pose_runA.json")); B = json.load(open(V5 + "pose_runB.json"))
    act = bpy.data.actions.get("tut_run")
    if act: bpy.data.actions.remove(act)
    ad = ARM.animation_data_create(); act = bpy.data.actions.new("tut_run"); act.use_fake_user = True; ad.action = act
    for f, st in ((1, A), (9, B), (17, A)):
        set_state(st["bones"])
        for pb in ARM.pose.bones:
            pb.keyframe_insert("location", frame=f)
            pb.keyframe_insert("rotation_quaternion" if pb.rotation_mode == "QUATERNION" else "rotation_euler", frame=f)
    ad.action = None

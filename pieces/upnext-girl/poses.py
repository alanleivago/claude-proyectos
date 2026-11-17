"""The author's three final poses (video 11:26-13:20: idle, running punch, hand on hip) + a relaxed turnaround pose,
keyed as actions on the Zero-fem rig. exec in Blender after build.py:
    exec(open(r"F:/Claude Proyectos/pieces/upnext-girl/poses.py").read()); make_all()
Poses are written as armature-space targets (bone directions, foot positions), so they read like the reference.
Directions use (x = her left, y = back, z = up); 'L'/'R' specs are given for her left side and mirrored.
"""
import bpy, math
from mathutils import Vector, Quaternion, Matrix, Euler

ARM = bpy.data.objects["Armature"]
PB = ARM.pose.bones
D = math.radians

# face per pose (engine names): played in Blender via the Mapping node offset, exported in face_tracks.json
POSE_FACES = {"tut_idle": ("open", "smile"), "tut_hip": ("open", "talkO"), "tut_run": ("happy", "smileOpen"),
              "turn_pose": ("open", "neutral")}


def upd(): bpy.context.view_layer.update()


def rest_rot(name): return ARM.data.bones[name].matrix_local.to_3x3()


def rest_dir(name):
    b = ARM.data.bones[name]; return (b.tail_local - b.head_local).normalized()


def set_rot(name, R):
    """absolute armature-space rotation (3x3 applied on top of the rest orientation), head stays where the parent put it"""
    pb = PB[name]; head = pb.matrix.translation.copy()
    M = (R @ rest_rot(name)).to_4x4(); M.translation = head; pb.matrix = M; upd()


def aim(name, d, twist=0.0):
    d = Vector(d).normalized(); q = rest_dir(name).rotation_difference(d)
    if twist: q = Quaternion(d, D(twist)) @ q
    set_rot(name, q.to_matrix())


def euler(name, p=0, r=0, y=0):
    set_rot(name, Euler((D(p), D(r), D(y)), "XYZ").to_matrix())


def move(name, delta, R=None):
    pb = PB[name]; b = ARM.data.bones[name]
    M = ((R or Matrix.Identity(3)) @ b.matrix_local.to_3x3()).to_4x4(); M.translation = b.head_local + Vector(delta)
    pb.matrix = M; upd()


def mir(v, side): return Vector((v[0] * (1 if side == "L" else -1), v[1], v[2]))


def clear():
    for pb in PB: pb.matrix_basis.identity()
    upd()


def pose(spec):
    """spec: pelvis (loc, euler), chest/neck/head euler, arms {side: (up, fore, hand)}, feet {side: (delta, rot_euler)}"""
    clear()
    loc, e = spec.get("pelvis", ((0, 0, 0), (0, 0, 0)))
    pb = PB["Pelvis"]; b = ARM.data.bones["Pelvis"]
    M = (Euler(tuple(D(a) for a in e)).to_matrix() @ b.matrix_local.to_3x3()).to_4x4(); M.translation = b.head_local + Vector(loc)
    pb.matrix = M; upd()
    for n in ("Chest", "Neck", "Head"):
        euler(n, *spec.get(n.lower(), (0, 0, 0)))
    for side, (up, fore, hand) in spec["arms"].items():
        aim(f"UpperArm.{side}", mir(up, side)); aim(f"Forearm.{side}", mir(fore, side)); aim(f"Hand.{side}", mir(hand, side))
    for side, (delta, fe) in spec.get("feet", {}).items():
        d = mir(delta, side); r = Euler(tuple(D(a) * (1 if (i == 0 or side == "L") else -1) for i, a in enumerate(fe))).to_matrix()
        move(f"FootControl.{side}", d)
        move(f"FootRotation.{side}", d + Vector((0, 0, 0)), r)
    upd()


def mirror_spec(sp):
    """swap her left/right: arm/foot specs trade sides, roll/yaw of the body flip"""
    out = dict(sp)
    if "pelvis" in sp:
        (x, y, z), (p, r, yw) = sp["pelvis"]; out["pelvis"] = ((-x, y, z), (p, -r, -yw))
    for k in ("chest", "neck", "head"):
        if k in sp: p, r, yw = sp[k]; out[k] = (p, -r, -yw)
    out["arms"] = {("R" if s == "L" else "L"): v for s, v in sp["arms"].items()}
    if "feet" in sp: out["feet"] = {("R" if s == "L" else "L"): v for s, v in sp["feet"].items()}
    return out


def key_action(name, keys, end=None):
    """keys: [(frame, spec), ...]; a loop repeats the first key at 'end'"""
    act = bpy.data.actions.get(name)
    if act: bpy.data.actions.remove(act)
    ARM.animation_data_create()
    for t in ARM.animation_data.nla_tracks: t.mute = True
    act = bpy.data.actions.new(name); act.use_fake_user = True; ARM.animation_data.action = act
    if end: keys = list(keys) + [(end, keys[0][1])]
    for f, spec in keys:
        pose(spec)
        for pb in PB:
            pb.keyframe_insert("location", frame=f); pb.keyframe_insert("rotation_quaternion", frame=f)
    return act


# ---------------------------------------------------------------- the poses (read off the reference frames)
def breathe(sp, k):
    """idle variant: chest/head a little up, pelvis a hair higher"""
    out = dict(sp); (x, y, z), e = sp.get("pelvis", ((0, 0, 0), (0, 0, 0))); out["pelvis"] = ((x, y, z + 0.05 * k), e)
    p, r, yw = sp.get("chest", (0, 0, 0)); out["chest"] = (p - 2 * k, r, yw)
    p, r, yw = sp.get("head", (0, 0, 0)); out["head"] = (p - 2 * k, r, yw)
    return out


TURN = dict(arms={"L": ((0.30, 0.0, -0.95), (0.28, -0.06, -0.96), (0.25, -0.08, -0.96)),
                  "R": ((0.30, 0.0, -0.95), (0.28, -0.06, -0.96), (0.25, -0.08, -0.96))})
# 12:44 left figure: stands straight, arms angled out from the body, fists, slight knee bend, head tilted
IDLE = dict(pelvis=((0, 0, -0.12), (0, 2, 0)), chest=(0, -2, 0), head=(4, 6, -6),
            arms={"L": ((0.30, 0.02, -0.95), (0.42, -0.30, -0.86), (0.40, -0.35, -0.85)),
                  "R": ((0.28, 0.02, -0.96), (0.40, -0.28, -0.87), (0.38, -0.32, -0.87))},
            feet={"L": ((0.05, -0.15, 0.0), (0, 0, -8)), "R": ((0.05, 0.10, 0.0), (0, 0, -6))})
# 12:14 turntable: her right fist on the hip, left arm bent forward with the fist out, weight on the left leg
HIP = dict(pelvis=((0.25, 0, -0.18), (0, -6, 8)), chest=(2, 6, -6), neck=(0, 4, 0), head=(6, 10, 10),
           arms={"R": ((0.62, 0.45, -0.62), (-0.55, -0.35, -0.75), (-0.75, -0.55, -0.35)),
                 "L": ((0.62, -0.30, -0.72), (0.35, -0.90, -0.25), (0.25, -0.95, -0.20))},
           feet={"L": ((-0.15, -0.05, 0.0), (0, 0, -10)), "R": ((0.75, -0.55, 0.35), (12, 0, 25))})
# 12:46 middle figure: run cycle in place, fists pumping (punch forward), body leaning, eyes half shut
RUN_A = dict(pelvis=((0, -0.3, -0.45), (14, 0, 8)), chest=(18, 0, 10), head=(-10, 0, -6),
             arms={"R": ((0.35, -0.55, -0.76), (0.15, -0.95, 0.25), (0.10, -0.98, 0.15)),      # right fist punching forward
                   "L": ((0.40, 0.70, -0.60), (0.35, 0.20, -0.92), (0.30, 0.15, -0.94))},      # left arm swung back
             feet={"L": ((0.0, -1.7, 0.25), (-12, 0, 0)), "R": ((0.0, 2.1, 1.7), (70, 0, 0))})
RUN_P = dict(pelvis=((0, -0.3, -0.15), (14, 0, 0)), chest=(18, 0, 0), head=(-10, 0, 0),
             arms={"R": ((0.40, -0.10, -0.90), (0.25, -0.75, -0.40), (0.20, -0.85, -0.30)),
                   "L": ((0.40, 0.25, -0.88), (0.30, -0.60, -0.55), (0.25, -0.75, -0.45))},
             feet={"L": ((0.0, 0.2, 0.0), (0, 0, 0)), "R": ((0.0, -0.4, 2.2), (30, 0, 0))})
ACTIONS = {
    "turn_pose": ([(1, TURN)], None),
    "tut_idle": ([(1, IDLE), (21, breathe(IDLE, 1))], 41),
    "tut_hip": ([(1, HIP), (24, breathe(HIP, 1))], 48),
    "tut_run": ([(1, RUN_A), (5, RUN_P), (9, mirror_spec(RUN_A)), (13, mirror_spec(RUN_P))], 17),
}
POSE_FACES["tut_run"] = ("angry", "talkA")


def make_all():
    for n, (keys, end) in ACTIONS.items():
        key_action(n, keys, end)
    ARM.animation_data.action = None; clear()
    print("POSES", list(ACTIONS))


def show(name):
    """apply a pose action + its face for renders"""
    for t in ARM.animation_data.nla_tracks: t.mute = True
    ARM.animation_data.action = bpy.data.actions.get(name); bpy.context.scene.frame_set(1)
    if name in POSE_FACES: set_face(*POSE_FACES[name])


EYES = ["open", "half", "blink", "happy", "surprised", "angry", "sad", "wink", "hearts", "shocked", "dizzy", "relaxed",
        "disgust", "smirk", "soft", "sparkle"]
MOUTHS = ["neutral", "smile", "smileOpen", "talkA", "talkO", "surprised", "frown", "shout", "blep", "cat", "gasp",
          "bigShock", "disgust", "smirk", "blushSmile", "blushGasp"]


def set_face(eyes="open", mouth="neutral"):
    for mn, lst, v in (("face_eyes", EYES, eyes), ("face_mouth", MOUTHS, mouth)):
        m = bpy.data.materials[mn]
        mp = next(n for n in m.node_tree.nodes if n.type == "MAPPING")
        mp.inputs["Location"].default_value[0] = lst.index(v) / 16.0

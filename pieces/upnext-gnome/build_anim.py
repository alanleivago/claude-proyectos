"""Pip the gnome: animation library + glTF for the three.js engine.

    blender -b out/gnome.blend --python build_anim.py      # -> out/gnome_anim.glb, out/face_tracks.json, out/actions.json, out/gnome_anim.blend

Poses are written as WORLD rotations per bone (quaternions composed from world axes; front = -Y, up = +Z) and converted
to bone-local keys, so the parent chain (Body > Head > Face/Beard, Body > Arm > Hand, Body > Leg) is handled exactly.
World axes:  RX(+a) tips the top forward (head nods down) and swings a hanging limb BACK;  RX(-a) raises it forward.
             RZ(+a) turns the face toward +X (character's left).   RY(+a) leans the top toward +X / swings a hanging limb toward -X.
Body height in walk / sit is solved per frame so the lowest sole (or seat) touches z=0 and nothing goes below it.
All clips start from the rest pose (except none) so they chain with a short crossFadeTo; 30 fps; face tracks are
[frame, eyes, mouth] with frame 1 = t 0 and constant interpolation (same format as zero-fem/anim/face_tracks.json)."""
import os, json, math, bpy
from mathutils import Quaternion, Vector, Matrix
from bpy_extras import anim_utils

HERE = os.path.dirname(os.path.abspath(__file__)); OUTD = os.path.join(HERE, "out")
sc = bpy.context.scene; sc.render.fps = 30
arm = bpy.data.objects["Armature"]; mesh = bpy.data.objects["Gnome"]
K = arm["servbot_to_gnome_scale"]; Z0 = arm["servbot_zmin"]
PB = arm.pose.bones
for pb in PB:
    pb.rotation_mode = "QUATERNION"
REST = {b.name: b.matrix_local.to_quaternion() for b in arm.data.bones}          # bone -> armature space
HEADS = {b.name: b.head_local.copy() for b in arm.data.bones}
PARENT = {b.name: (b.parent.name if b.parent else None) for b in arm.data.bones}
ORDER = ["Body", "Head", "Face", "Beard", "Arm.L", "Hand.L", "Arm.R", "Hand.R", "Leg.L", "Leg.R"]
me = mesh.data
VG = {g.index: g.name for g in mesh.vertex_groups}


def o2n(x, y, z):                       # Servbot units -> gnome units (soles at 0)
    return Vector((x * K, y * K, (z - Z0) * K))


def RX(d): return Quaternion((1, 0, 0), math.radians(d))
def RY(d): return Quaternion((0, 1, 0), math.radians(d))
def RZ(d): return Quaternion((0, 0, 1), math.radians(d))
I = Quaternion()


def aim(direction, base=Vector((0, 0, -1))):
    """world rotation that turns the hanging rest direction (0,0,-1) to `direction`"""
    return base.rotation_difference(Vector(direction).normalized())


def full(pose):
    """world rotation of every bone: given ones as is, missing ones follow their parent (local identity)."""
    W = {}
    for b in ORDER:
        W[b] = pose[b] if b in pose else (W[PARENT[b]] if PARENT[b] else I)
    return W


def solve(pose):
    """pose: {bone: world quaternion (rotation applied to rest geometry)}, '_loc': body offset (world).
    returns local quaternions + world matrices (for FK checks)."""
    W = full(pose)
    local = {}
    for b in ORDER:
        p = PARENT[b]
        rel = (W[p].inverted() @ W[b]) if p else W[b]
        local[b] = REST[b].inverted() @ rel @ REST[b]
    return W, local


def world_points(pose, pts_by_bone):
    """FK in armature space for points given in rest positions, per bone (rigid)."""
    W, _ = solve(pose)
    off = pose.get("_loc", Vector())
    pos = {}
    for b in ORDER:                                         # posed head positions
        p = PARENT[b]
        if not p:
            pos[b] = HEADS[b] + off
        else:
            pos[b] = pos[p] + W[p] @ (HEADS[b] - HEADS[p])
    out = []
    for b, pts in pts_by_bone.items():
        out += [pos[b] + W[b] @ (q - HEADS[b]) for q in pts]
    return out


# rest vertices per bone (dominant weight) for the floor solver
BV = {}
for v in me.vertices:
    g = max(v.groups, key=lambda e: e.weight)
    BV.setdefault(VG[g.group], []).append(v.co.copy())


def floor_offset(pose, bones=("Leg.L", "Leg.R", "Body", "Hand.L", "Hand.R", "Beard")):
    pts = world_points(pose, {b: BV[b] for b in bones if b in BV})
    return -min(p.z for p in pts)


# ---------------------------------------------------------------- keys
LIB, FACES = {}, {}


def new_action(name, frames, loop):
    old = bpy.data.actions.get(name)
    if old: bpy.data.actions.remove(old)
    a = bpy.data.actions.new(name); a.use_fake_user = True
    arm.animation_data.action = a
    LIB[name] = {"frames": frames, "loop": loop}
    return a


def key(f, pose):
    W, local = solve(pose)
    off = pose.get("_loc", Vector())
    for b in ORDER:
        pb = PB[b]
        pb.rotation_quaternion = local[b]
        pb.keyframe_insert("rotation_quaternion", frame=f, group=b)
        if b == "Body":
            pb.location = REST["Body"].inverted() @ off          # world offset -> bone-local
            pb.keyframe_insert("location", frame=f, group=b)


def fix_signs(act):
    """keep quaternion keys on the short path (sign continuity per bone)."""
    cb = anim_utils.action_get_channelbag_for_slot(act, arm.animation_data.action_slot)
    by = {}
    for fc in cb.fcurves:
        if fc.data_path.endswith("rotation_quaternion"):
            by.setdefault(fc.data_path, {})[fc.array_index] = fc
    for fcs in by.values():
        n = len(fcs[0].keyframe_points); prev = None
        for i in range(n):
            q = Vector([fcs[c].keyframe_points[i].co[1] for c in range(4)])
            if prev is not None and prev.dot(q) < 0:
                q = -q
                for c in range(4): fcs[c].keyframe_points[i].co[1] = q[c]
            prev = q
    for fc in cb.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = "BEZIER"; kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"
        fc.update()


def ease(t): return t * t * (3 - 2 * t)


def lerpq(a, b, t): return a.slerp(b, t)


def blend(p0, p1, t):
    w0, w1 = full(p0), full(p1)
    out = {b: lerpq(w0[b], w1[b], t) for b in ORDER}
    out["_loc"] = p0.get("_loc", Vector()).lerp(p1.get("_loc", Vector()), t)
    return out


def keyed_poses(name, frames, loop, keys, face):
    """keys: list of (frame, pose). Every frame is sampled (smoothstep between keys) so the glTF is exact."""
    new_action(name, frames, loop)
    for f in range(1, frames + 2):
        for (fa, pa), (fb, pb) in zip(keys, keys[1:]):
            if fa <= f <= fb:
                t = ease((f - fa) / max(1, fb - fa)); key(f, blend(pa, pb, t)); break
        else:
            key(f, keys[-1][1])
    fix_signs(arm.animation_data.action)
    FACES[name] = face


S = K                                      # Servbot unit -> gnome unit for offsets

# ---------------------------------------------------------------- clips
def A_idle():
    n = 60; new_action("idle", n, True)
    for f in range(1, n + 2):
        ph = 2 * math.pi * (f - 1) / n
        br = math.sin(ph)
        key(f, {"_loc": Vector((0, 0, 0.12 * S * (br + 1))),
                "Body": RX(0.6 * br),
                "Head": RX(-1.2 * math.sin(ph - 0.5)) @ RZ(1.0 * math.sin(ph * 0.5)),
                "Beard": RX(-1.2 * math.sin(ph - 0.5) + 1.5 * math.sin(ph - 1.2)),
                "Arm.L": RY(-2.5 - 1.5 * br), "Hand.L": RY(-2.5 - 1.5 * br),
                "Arm.R": RY(2.5 + 1.5 * br), "Hand.R": RY(2.5 + 1.5 * br)})
    fix_signs(arm.animation_data.action)
    FACES["idle"] = [[1, "deadpan", "neutral"], [40, "unimpressed", "neutral"], [41, "blink", "neutral"],
                     [43, "unimpressed", "neutral"], [44, "deadpan", "neutral"]]


def A_talk():
    n = 40; new_action("talk", n, True)
    for f in range(1, n + 2):
        ph = 2 * math.pi * (f - 1) / n
        beat = max(0.0, math.sin(ph * 2))                    # two hand beats per loop
        g = RX(-28 - 14 * beat) @ RY(6)
        key(f, {"_loc": Vector((0, 0, 0.08 * S * (1 + math.sin(ph * 2)))),
                "Body": RZ(3 * math.sin(ph)),
                "Head": RZ(3 * math.sin(ph)) @ RX(2.5 * math.sin(ph * 2 + 0.6)) @ RY(-2.0 * math.sin(ph)),
                "Beard": RZ(3 * math.sin(ph)) @ RX(2.5 * math.sin(ph * 2 + 0.6) - 2 * math.sin(ph * 2 + 1.4)),
                "Arm.R": RZ(3 * math.sin(ph)) @ g, "Hand.R": RZ(3 * math.sin(ph)) @ RX(-55 - 18 * beat) @ RY(-10),
                "Arm.L": RY(-3), "Hand.L": RY(-3)})
    fix_signs(arm.animation_data.action)
    FACES["talk"] = [[1, "deadpan", "talkA"], [4, "deadpan", "talkM"], [7, "deadpan", "talkE"], [10, "deadpan", "talkO"],
                     [13, "deadpan", "talkM"], [16, "deadpan", "talkA"], [19, "deadpan", "neutral"],
                     [22, "unimpressed", "talkE"], [23, "blink", "talkE"], [25, "deadpan", "talkO"],
                     [28, "deadpan", "talkM"], [31, "deadpan", "talkA"], [34, "deadpan", "talkE"], [37, "deadpan", "neutral"]]


def A_point():
    up = aim((0.80, -0.55, 0.18))                          # Arm.L to screen right (+X), a bit forward, slightly up
    keys = [(1, {}),
            (6, {"Arm.L": RX(8) @ RY(-6), "Hand.L": RX(8) @ RY(-6), "Head": RZ(-4), "Beard": RZ(-4), "Body": RZ(-3)}),
            (12, {"Arm.L": aim((0.78, -0.55, 0.28)), "Hand.L": aim((0.74, -0.55, 0.38)), "Head": RZ(26) @ RY(3),
                  "Beard": RZ(26) @ RY(3), "Body": RZ(8), "Arm.R": RY(4), "Hand.R": RY(4)}),
            (18, {"Arm.L": up, "Hand.L": aim((0.80, -0.55, 0.24)), "Head": RZ(22) @ RY(2), "Beard": RZ(22) @ RY(2) @ RX(-2),
                  "Body": RZ(6), "Arm.R": RY(3), "Hand.R": RY(3)}),
            (36, {"Arm.L": up, "Hand.L": aim((0.80, -0.55, 0.24)), "Head": RZ(22) @ RY(2), "Beard": RZ(22) @ RY(2),
                  "Body": RZ(6), "Arm.R": RY(3), "Hand.R": RY(3)})]
    keyed_poses("point", 36, False, keys,
                [[1, "deadpan", "neutral"], [12, "deadpan", "talkM"], [16, "deadpan", "neutral"], [27, "unimpressed", "neutral"],
                 [28, "blink", "neutral"], [30, "unimpressed", "neutral"], [31, "deadpan", "neutral"]])


def A_shrug():
    def sh(a, lift, tilt):
        return {"_loc": Vector((0, 0, lift * S)),
                "Arm.L": RY(-a) @ RX(-22), "Hand.L": RY(-a - 25) @ RX(-60) @ RZ(-25),
                "Arm.R": RY(a) @ RX(-22), "Hand.R": RY(a + 25) @ RX(-60) @ RZ(25),
                "Head": RY(tilt) @ RX(-3), "Beard": RY(tilt) @ RX(-3)}
    keys = [(1, {}), (5, {"_loc": Vector((0, 0, -0.25 * S)), "Head": RX(3), "Beard": RX(3)}),
            (11, sh(42, 0.75, 11)), (17, sh(36, 0.5, 9)), (36, sh(36, 0.5, 9))]
    keyed_poses("shrug", 36, False, keys, [[1, "deadpan", "neutral"], [8, "skeptical", "smirk"]])


def A_arms_crossed():
    def cr(lift):
        # upper arms straight forward (they stay outside the body's width), forearms/hands fold inward under the
        # beard, which rests on them (Beard bone lifted); R slightly lower so the hands overlap like crossed arms
        return {"Arm.L": RX(-84), "Hand.L": RZ(-76) @ RX(-84),
                "Arm.R": RX(-78), "Hand.R": RZ(80) @ RX(-74),
                "Beard": RX(-30 - lift), "Head": RX(-5), "_loc": Vector((0, 0, 0.1 * S))}
    p = cr(0)
    keys = [(1, {}), (6, {"Arm.L": RX(6), "Hand.L": RX(6), "Arm.R": RX(6), "Hand.R": RX(6)}),
            (13, dict(cr(6), Head=RX(-6))), (19, p), (36, p)]
    keyed_poses("arms_crossed", 36, False, keys,
                [[1, "deadpan", "neutral"], [10, "unimpressed", "frown"], [26, "blink", "frown"], [28, "unimpressed", "frown"]])


WALK = {}


def A_walk():
    n = 30; new_action("walk", n, True)
    L = (12.1) * S                                          # hip -> sole
    STEP = 4.6 * S                                          # foot travel per stance (half cycle)
    roll0 = 8.0
    feet = {"Leg.L": [], "Leg.R": []}
    for f in range(1, n + 2):
        ph = ((f - 1) % n) / n
        def leg(ph):                                        # forward angle (deg): stance linear in foot position
            if ph < 0.5:
                s = STEP / 2 - STEP * (ph / 0.5)
            else:
                t = (ph - 0.5) / 0.5; s = -STEP / 2 + STEP * ease(t)
            return math.degrees(math.asin(s / L)), ph >= 0.5
        aL, swL = leg(ph); aR, swR = leg((ph + 0.5) % 1)
        roll = roll0 * math.sin(2 * math.pi * ph)            # lean onto the stance leg: + toward +X (left) in 0..0.5
        yaw = 2.5 * math.sin(2 * math.pi * ph)
        body = RZ(yaw) @ RY(roll) @ RX(2)
        pose = {"Body": body,
                "Leg.L": RX(-aL), "Leg.R": RX(-aR),
                "Arm.L": RZ(yaw) @ RX(0.8 * aR) @ RY(-3), "Hand.L": RZ(yaw) @ RX(0.8 * aR - 6) @ RY(-3),
                "Arm.R": RZ(yaw) @ RX(0.8 * aL) @ RY(3), "Hand.R": RZ(yaw) @ RX(0.8 * aL - 6) @ RY(3),
                "Head": RZ(yaw * 0.4) @ RY(-roll * 0.6), "Beard": RZ(yaw * 0.4) @ RY(-roll * 0.2) @ RX(2 * math.sin(4 * math.pi * ph))}
        pose["_loc"] = Vector((0, 0, 0))
        pose["_loc"] = Vector((0, 0, floor_offset(pose, ("Leg.L", "Leg.R"))))
        key(f, pose)
        for lg in feet:
            pts = world_points(pose, {lg: [v for v in BV[lg] if v.z < 0.05]})
            feet[lg].append((min(p.z for p in pts), sum(p.y for p in pts) / len(pts)))
    fix_signs(arm.animation_data.action)
    # slide check: in stance each foot must move back at a constant rate (root moves forward at that speed)
    v = STEP / 15
    err = 0.0
    for lg, off in (("Leg.L", 0), ("Leg.R", 15)):
        for i in range(off, off + 14):
            dy = feet[lg][i + 1][1] - feet[lg][i][1]
            err = max(err, abs(dy - v))
    clear = min(feet["Leg.L"][i][0] for i in range(19, 27))                  # mid-swing of the left foot
    WALK.update(speed_per_s=round(v * 30, 4), cycle_distance=round(STEP * 2, 4), slide_err_per_frame=round(err, 5),
                swing_clearance=round(clear, 4))
    LIB["walk"].update(WALK)
    print("WALK", WALK)
    FACES["walk"] = [[1, "deadpan", "neutral"], [18, "unimpressed", "neutral"], [19, "blink", "neutral"],
                     [21, "unimpressed", "neutral"], [22, "deadpan", "neutral"]]


def A_nod():
    keys = [(1, {})]
    for i, f0 in enumerate((4, 16)):
        keys += [(f0 + 4, {"Head": RX(11), "Beard": RX(6)}), (f0 + 10, {"Head": RX(-2), "Beard": RX(-3)})]
    keys += [(30, {})]
    keyed_poses("nod", 30, False, keys, [[1, "deadpan", "neutral"], [7, "unimpressed", "neutral"], [11, "deadpan", "neutral"],
                                          [19, "unimpressed", "neutral"], [23, "deadpan", "neutral"]])


def A_shake_head():
    keys = [(1, {})]
    for i, f0 in enumerate((3, 11, 19)):
        keys += [(f0 + 2, {"Head": RZ(17), "Beard": RZ(15) @ RY(-3)}), (f0 + 6, {"Head": RZ(-17), "Beard": RZ(-15) @ RY(3)})]
    keys += [(32, {}), (36, {})]
    keyed_poses("shake_head", 36, False, keys, [[1, "deadpan", "neutral"], [4, "annoyed", "frown"]])


def A_sit():
    def sitp(legs, lean, arms):
        p = {"Leg.L": RZ(24) @ RX(-legs), "Leg.R": RZ(-24) @ RX(-legs), "Body": RX(lean),      # feet splayed in a V
             "Head": RX(lean * 0.4), "Beard": RX(lean * 0.4 - 6),
             "Arm.L": RX(lean) @ RY(-arms) @ RX(-8), "Hand.L": RX(lean) @ RY(-arms - 20) @ RX(-40),
             "Arm.R": RX(lean) @ RY(arms) @ RX(-8), "Hand.R": RX(lean) @ RY(arms + 20) @ RX(-40)}
        p["_loc"] = Vector((0, 0.6 * S, 0)); p["_loc"] = Vector((0, 0.6 * S, floor_offset(p)))
        return p
    stand = {}
    keys = [(1, stand), (7, {"Body": RX(6), "Head": RX(4), "Arm.L": RX(-8), "Arm.R": RX(-8), "Hand.L": RX(-8), "Hand.R": RX(-8)}),
            (15, sitp(56, -16, 30)), (19, sitp(68, -9, 34)), (25, sitp(62, -12, 32)), (45, sitp(62, -12, 32))]
    keyed_poses("sit", 45, False, keys, [[1, "deadpan", "neutral"], [15, "surprised", "talkO"], [19, "blink", "neutral"],
                                          [21, "annoyed", "frown"]])


def export():
    ad = arm.animation_data
    for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
    for name in LIB:
        act = bpy.data.actions[name]
        act.use_frame_range = True; act.frame_start, act.frame_end = 1, LIB[name]["frames"] + 1
        tr = ad.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, 1, act)
        st.action_frame_start, st.action_frame_end = 1, LIB[name]["frames"] + 1
    ad.action = None
    for pb in PB: pb.location, pb.rotation_quaternion, pb.scale = Vector(), Quaternion(), Vector((1, 1, 1))
    sc.frame_start, sc.frame_end = 1, max(v["frames"] + 1 for v in LIB.values())
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTD, "gnome_anim.blend"), copy=False)
    for o in bpy.data.objects:
        o.select_set(o.type in ("MESH", "ARMATURE"))
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, "gnome_anim.glb"), use_selection=True, export_apply=True,
        export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
        export_anim_slide_to_zero=True, export_optimize_animation_size=False, export_reset_pose_bones=True,
        export_yup=True, export_extras=True)
    # option B eyes (small gnome eyes + brows): same GLB with the other eye atlas; same cell names, same face_tracks.json
    mat = bpy.data.materials["gnome_eyes"]
    tex = next(n for n in mat.node_tree.nodes if n.type == "TEX_IMAGE")
    keep = tex.image
    imb = bpy.data.images.load(os.path.join(HERE, "tex", "gnome_eyes_b.png")); imb.pack(); tex.image = imb
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, "gnome_anim_eyesB.glb"), use_selection=True, export_apply=True,
        export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
        export_anim_slide_to_zero=True, export_optimize_animation_size=False, export_reset_pose_bones=True,
        export_yup=True, export_extras=True)
    tex.image = keep
    json.dump(FACES, open(os.path.join(OUTD, "face_tracks.json"), "w"), indent=1)
    json.dump(LIB, open(os.path.join(OUTD, "actions.json"), "w"), indent=1)


if __name__ == "__main__":
    arm.animation_data_create()
    for k in [k for k in list(globals()) if k.startswith("A_")]:
        globals()[k]()
    export()
    print("ANIM DONE", list(LIB))

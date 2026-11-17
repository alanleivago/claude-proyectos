"""MetalShadow: animation library + glTF for the three.js engine (same clip names / track format as upnext-gnome).

    blender -b out/metalshadow.blend --python build_anim.py   # -> out/metalshadow_anim.glb, face_tracks.json, actions.json, metalshadow_anim.blend

Same method as pieces/upnext-gnome/build_anim.py: poses are WORLD rotations per bone (front = -Y, up = +Z) converted to
bone-local keys.  RX(+a) tips the top forward / swings a hanging limb BACK, RX(-a) raises it forward; RZ(+a) turns the face
toward +X (character's left = screen right); RY(+a) leans the top toward +X / swings a hanging limb toward -X.
The rest pose is the pack's T-pose: an arm's world rotation is (given rotation) @ DOWN, DOWN = arm hanging at the side,
so arm rotations read exactly like the gnome's (hanging rest). Missing bones follow their parent (arms follow the torso).
Legs: Thigh > Calf > Foot; the walk / sit / flop legs are placed with a planar 2-bone IK (knee forward).
Each clip starts from the stand pose (arms down) so clips chain with a short crossFadeTo; 30 fps.
face_tracks.json: {clip: [[frame, eyes, mouth]]}, frame 1 = t 0, constant; this model has no mouth -> mouth is always 'none';
talking = alternate '<expr>' and '<expr>+talk' (pupils pulse). '_meta' describes the eye atlas (build_face.py)."""
import os, json, math, bpy
from mathutils import Quaternion, Vector
from bpy_extras import anim_utils

HERE = os.path.dirname(os.path.abspath(__file__)); OUTD = os.path.join(HERE, "out")
sc = bpy.context.scene; sc.render.fps = 30
arm = bpy.data.objects["Armature"]; mesh = bpy.data.objects["MetalShadow"]
PB = arm.pose.bones
for pb in PB: pb.rotation_mode = "QUATERNION"
REST = {b.name: b.matrix_local.to_quaternion() for b in arm.data.bones}
HEADS = {b.name: b.head_local.copy() for b in arm.data.bones}
TAILS = {b.name: b.tail_local.copy() for b in arm.data.bones}
PARENT = {b.name: (b.parent.name if b.parent else None) for b in arm.data.bones}
ORDER = ["Body", "Head", "Upperarm.L", "Forearm.L", "Hand.L", "Upperarm.R", "Forearm.R", "Hand.R",
         "Thigh.L", "Calf.L", "Foot.L", "Thigh.R", "Calf.R", "Foot.R"]
VG = {g.index: g.name for g in mesh.vertex_groups}
H = 7.17                                                     # model height (units); the engine scales it to metres


def RX(d): return Quaternion((1, 0, 0), math.radians(d))
def RY(d): return Quaternion((0, 1, 0), math.radians(d))
def RZ(d): return Quaternion((0, 0, 1), math.radians(d))
I = Quaternion()
DOWN = {"L": RY(80), "R": RY(-80)}                           # T-pose arm -> hanging, 10 deg out from the body
CALF0 = math.degrees(math.atan2(TAILS["Calf.L"].y - HEADS["Calf.L"].y, HEADS["Calf.L"].z - TAILS["Calf.L"].z))   # rest calf lean (back)
L1 = (TAILS["Thigh.L"] - HEADS["Thigh.L"]).length; L2 = (TAILS["Calf.L"] - HEADS["Calf.L"]).length
ANK = HEADS["Foot.L"].z                                      # ankle height when the sole is flat on the floor


def aim(direction, base=Vector((0, 0, -1))):
    """world rotation that turns the hanging direction (0,0,-1) to `direction` (use for arms and legs)"""
    return base.rotation_difference(Vector(direction).normalized())


def full(pose):
    W = {}
    for b in ORDER:
        p = PARENT[b]
        side = b[-1]
        if b.startswith("Upperarm"):
            W[b] = (pose[b] if b in pose else W["Body"]) @ DOWN[side]
        elif b.startswith(("Forearm", "Hand")) and b in pose:
            W[b] = pose[b] @ DOWN[side]
        else:
            W[b] = pose[b] if b in pose else (W[p] if p else I)
    return W


def solve(pose):
    W = full(pose); local = {}
    for b in ORDER:
        p = PARENT[b]
        rel = (W[p].inverted() @ W[b]) if p else W[b]
        local[b] = REST[b].inverted() @ rel @ REST[b]
    return W, local


def joint_pos(pose):
    W = full(pose); off = pose.get("_loc", Vector()); pos = {}
    for b in ORDER:
        p = PARENT[b]
        pos[b] = HEADS[b] + off if not p else pos[p] + W[p] @ (HEADS[b] - HEADS[p])
    return W, pos


def world_points(pose, pts_by_bone):
    W, pos = joint_pos(pose); out = []
    for b, pts in pts_by_bone.items():
        out += [pos[b] + W[b] @ (q - HEADS[b]) for q in pts]
    return out


BV = {}
for v in mesh.data.vertices:
    g = max(v.groups, key=lambda e: e.weight); BV.setdefault(VG[g.group], []).append(v.co.copy())


def floor_offset(pose, bones=None):
    pts = world_points(pose, {b: BV[b] for b in (bones or BV) if b in BV})
    return -min(p.z for p in pts)


def grounded(pose, bones=None):
    pose = dict(pose); loc = pose.get("_loc", Vector()).copy(); pose["_loc"] = loc
    pose["_loc"] = Vector((loc.x, loc.y, loc.z + floor_offset(pose, bones))); return pose


def leg_ik(pose, side, ankle, foot=None, splay=0.0):
    """place Thigh/Calf so the ankle reaches `ankle` (world, armature space); knee bends forward (-Y). Planar in the
    leg's YZ plane (x of the ankle is honoured by a small RY swing). foot: world rotation of the foot (default flat)."""
    W, pos = joint_pos(pose)
    hip = pos["Thigh." + side]
    d = Vector(ankle) - hip
    dist = min(d.length, (L1 + L2) * 0.9995)
    # angle of the hip->ankle line from straight down, in YZ (positive = toward +Y / back)
    base = math.atan2(d.y, -d.z)
    side_sw = math.atan2(d.x, -d.z)
    cos_k = (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist)
    a_thigh = base - math.acos(max(-1, min(1, cos_k)))                     # thigh swings forward of the line
    cos_c = (L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2)
    knee = math.pi - math.acos(max(-1, min(1, cos_c)))
    sw = RY(-math.degrees(side_sw) + splay)
    pose["Thigh." + side] = sw @ RX(math.degrees(a_thigh))
    pose["Calf." + side] = sw @ RX(math.degrees(a_thigh + knee) - CALF0)
    pose["Foot." + side] = foot if foot is not None else I
    return pose


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
    W, local = solve(pose); off = pose.get("_loc", Vector())
    for b in ORDER:
        pb = PB[b]; pb.rotation_quaternion = local[b]
        pb.keyframe_insert("rotation_quaternion", frame=f, group=b)
        if b == "Body":
            pb.location = REST["Body"].inverted() @ off
            pb.keyframe_insert("location", frame=f, group=b)


def fix_signs(act):
    cb = anim_utils.action_get_channelbag_for_slot(act, arm.animation_data.action_slot)
    by = {}
    for fc in cb.fcurves:
        if fc.data_path.endswith("rotation_quaternion"): by.setdefault(fc.data_path, {})[fc.array_index] = fc
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
            kp.interpolation = "LINEAR"
        fc.update()


def ease(t): return t * t * (3 - 2 * t)


def blend(p0, p1, t):
    w0, w1 = full(p0), full(p1)
    out = {}
    for b in ORDER:
        q = w0[b].slerp(w1[b], t)
        if b.startswith(("Upperarm", "Forearm", "Hand")): q = q @ DOWN[b[-1]].inverted()
        out[b] = q
    out["_loc"] = p0.get("_loc", Vector()).lerp(p1.get("_loc", Vector()), t)
    return out


def keyed_poses(name, frames, loop, keys, face):
    new_action(name, frames, loop)
    for f in range(1, frames + 2):
        for (fa, pa), (fb, pb) in zip(keys, keys[1:]):
            if fa <= f <= fb:
                key(f, blend(pa, pb, ease((f - fa) / max(1, fb - fa)))); break
        else:
            key(f, keys[-1][1])
    fix_signs(arm.animation_data.action)
    FACES[name] = face


def talk_track(expr, frames, start=1, every=3, pattern=(1, 1, 0, 1, 0, 0, 1, 0)):
    """speech: alternate expr / expr+talk on a fixed irregular pattern"""
    out = []; i = 0
    for f in range(start, frames + 1, every):
        out.append([f, expr + ("+talk" if pattern[i % len(pattern)] else ""), "none"]); i += 1
    return out


def blink_at(track, f, base):
    return track + [[f, "blink", "none"], [f + 2, base, "none"]]


def F(rows):                                     # [frame, eyes] -> [frame, eyes, 'none'], sorted
    return sorted([[r[0], r[1], "none"] for r in rows], key=lambda r: r[0])


# ---------------------------------------------------------------- clips
def A_idle():
    n = 60; new_action("idle", n, True)
    for f in range(1, n + 2):
        ph = 2 * math.pi * (f - 1) / n; br = math.sin(ph)
        key(f, {"_loc": Vector((0, 0, 0.012 * H * (br + 1) * 0.5)),
                "Body": RX(1.0 * br),
                "Head": RX(-1.5 * math.sin(ph - 0.5)) @ RZ(2.0 * math.sin(ph * 0.5)),
                "Upperarm.L": RY(-3 - 2 * br), "Forearm.L": RY(-3 - 2 * br) @ RX(-8),
                "Upperarm.R": RY(3 + 2 * br), "Forearm.R": RY(3 + 2 * br) @ RX(-8)})
    fix_signs(arm.animation_data.action)
    FACES["idle"] = F([[1, "neutral"], [40, "blink"], [42, "neutral"]])


def A_talk():
    n = 40; new_action("talk", n, True)
    for f in range(1, n + 2):
        ph = 2 * math.pi * (f - 1) / n; beat = max(0.0, math.sin(ph * 2))
        sway = RZ(3 * math.sin(ph))
        key(f, {"_loc": Vector((0, 0, 0.008 * H * (1 + math.sin(ph * 2)))),
                "Body": sway,
                "Head": sway @ RX(3 * math.sin(ph * 2 + 0.6)) @ RY(-2.5 * math.sin(ph)),
                "Upperarm.R": sway @ RX(-20 - 10 * beat) @ RY(10), "Forearm.R": sway @ RX(-70 - 20 * beat) @ RY(-15),
                "Hand.R": sway @ RX(-75 - 25 * beat) @ RY(-25),
                "Upperarm.L": RY(-4), "Forearm.L": RY(-4) @ RX(-10)})
    fix_signs(arm.animation_data.action)
    FACES["talk"] = blink_at(talk_track("neutral", n), 22, "neutral+talk")
    FACES["talk"].sort(key=lambda r: r[0])


def A_point():
    up = aim((0.80, -0.55, 0.18))
    keys = [(1, {}),
            (6, {"Upperarm.L": RX(8) @ RY(-6), "Head": RZ(-4), "Body": RZ(-3)}),
            (12, {"Upperarm.L": aim((0.78, -0.55, 0.28)), "Forearm.L": aim((0.74, -0.55, 0.38)), "Hand.L": aim((0.74, -0.55, 0.38)),
                  "Head": RZ(26) @ RY(3), "Body": RZ(8), "Upperarm.R": RY(4)}),
            (18, {"Upperarm.L": up, "Forearm.L": aim((0.80, -0.55, 0.22)), "Hand.L": aim((0.80, -0.55, 0.22)),
                  "Head": RZ(22) @ RY(2), "Body": RZ(6), "Upperarm.R": RY(3)}),
            (36, {"Upperarm.L": up, "Forearm.L": aim((0.80, -0.55, 0.22)), "Hand.L": aim((0.80, -0.55, 0.22)),
                  "Head": RZ(22) @ RY(2), "Body": RZ(6), "Upperarm.R": RY(3)})]
    keyed_poses("point", 36, False, keys, F([[1, "neutral"], [12, "neutral+talk"], [15, "neutral"], [27, "blink"], [29, "neutral"]]))


def A_shrug():
    def sh(a, lift, tilt):
        return {"_loc": Vector((0, 0, lift * 0.01 * H)),
                "Upperarm.L": RY(-a) @ RX(-15), "Forearm.L": RY(-a - 30) @ RX(-70) @ RZ(-20), "Hand.L": RY(-a - 50) @ RX(-70) @ RZ(-30),
                "Upperarm.R": RY(a) @ RX(-15), "Forearm.R": RY(a + 30) @ RX(-70) @ RZ(20), "Hand.R": RY(a + 50) @ RX(-70) @ RZ(30),
                "Head": RY(tilt) @ RX(-3)}
    keys = [(1, {}), (5, {"_loc": Vector((0, 0, -0.02 * H)), "Head": RX(3)}),
            (11, sh(45, 1.5, 11)), (17, sh(38, 1.0, 9)), (36, sh(38, 1.0, 9))]
    keyed_poses("shrug", 36, False, keys, F([[1, "neutral"], [8, "skeptical"]]))


def A_arms_crossed():
    def cr(lift):
        # chest is deep (thruster disc): elbows forward and out, forearms cross in front of the disc, R arm under L
        return {"Upperarm.L": aim((0.38, -0.86, -0.34)), "Forearm.L": aim((-0.84, -0.5, 0.12)), "Hand.L": aim((-0.75, -0.25, 0.55)),
                "Upperarm.R": aim((-0.38, -0.84, -0.42)), "Forearm.R": aim((0.84, -0.53, 0.02)), "Hand.R": aim((0.75, -0.3, 0.5)),
                "Head": RX(-4 - lift) @ RZ(-6), "Body": RX(-3), "_loc": Vector((0, 0, 0.004 * H))}
    p = cr(0)
    keys = [(1, {}), (6, {"Upperarm.L": RX(6), "Upperarm.R": RX(6)}), (13, cr(4)), (19, p), (36, p)]
    keyed_poses("arms_crossed", 36, False, keys, F([[1, "neutral"], [10, "unimpressed"], [26, "blink"], [28, "unimpressed"]]))


WALK = {}


def A_walk():
    n = 30; new_action("walk", n, True)
    STEP = 0.95                                              # ankle travel per stance (half cycle), model units
    LIFT = 0.42; CROUCH = 0.13
    feet = {"L": [], "R": []}
    for f in range(1, n + 2):
        ph = ((f - 1) % n) / n
        def ank(ph, x):                                      # ankle (y, z, pitch) for phase ph; stance 0..0.5
            if ph < 0.5:
                y = -STEP / 2 + STEP * (ph / 0.5); z = ANK; pit = 0.0
                if ph > 0.38: pit = 18 * (ph - 0.38) / 0.12                 # heel lifts before toe-off
            else:
                t = (ph - 0.5) / 0.5; y = STEP / 2 - STEP * ease(t); z = ANK + LIFT * math.sin(math.pi * t) ** 1.3
                pit = 18 * (1 - t) - 14 * math.sin(math.pi * min(1, t * 1.25)) * (t > 0.6)
            return Vector((x, y + HEADS["Foot.L"].y, z)), pit
        bob = 0.045 * math.cos(4 * math.pi * ph)
        roll = 3.5 * math.sin(2 * math.pi * ph); yaw = 4 * math.sin(2 * math.pi * ph)
        pose = {"_loc": Vector((0, 0, -CROUCH + bob)), "Body": RZ(-yaw) @ RY(roll) @ RX(4),
                "Head": RZ(yaw * 0.5) @ RY(-roll * 0.6) @ RX(-3),
                "Upperarm.L": RZ(-yaw) @ RX(28 * math.sin(2 * math.pi * ph)) @ RY(-4),
                "Forearm.L": RZ(-yaw) @ RX(28 * math.sin(2 * math.pi * ph) - 25) @ RY(-4),
                "Upperarm.R": RZ(-yaw) @ RX(-28 * math.sin(2 * math.pi * ph)) @ RY(4),
                "Forearm.R": RZ(-yaw) @ RX(-28 * math.sin(2 * math.pi * ph) - 25) @ RY(4)}
        aL, pL = ank(ph, HEADS["Foot.L"].x); aR, pR = ank((ph + 0.5) % 1, HEADS["Foot.R"].x)
        for s_, a_, p_ in (("L", aL, pL), ("R", aR, pR)):
            leg_ik(pose, s_, a_, RX(p_))                     # pitched foot: raise the ankle until the sole clears z 0
            lo = min(q.z for q in world_points(pose, {"Foot." + s_: BV["Foot." + s_]}))
            if lo < 0: leg_ik(pose, s_, a_ + Vector((0, 0, -lo)), RX(p_))
        key(f, pose)
        for s in "LR":
            pts = world_points(pose, {"Foot." + s: BV["Foot." + s]})
            feet[s].append((min(p.z for p in pts), sum(p.y for p in pts) / len(pts)))
    fix_signs(arm.animation_data.action)
    v = STEP / 15
    err = max(abs((feet[s][i + 1][1] - feet[s][i][1]) - v) for s, off in (("L", 0), ("R", 15)) for i in range(off, off + 10))
    WALK.update(speed_per_s=round(v * 30, 4), cycle_distance=round(STEP * 2, 4), slide_err_per_frame=round(err, 5),
                min_sole_z=round(min(min(z for z, _ in feet[s]) for s in "LR"), 4))
    LIB["walk"].update(WALK); print("WALK", WALK)
    FACES["walk"] = F([[1, "neutral"], [18, "blink"], [20, "neutral"]])


def A_nod():
    keys = [(1, {})]
    for f0 in (4, 16):
        keys += [(f0 + 4, {"Head": RX(12), "Body": RX(2)}), (f0 + 10, {"Head": RX(-2)})]
    keys += [(30, {})]
    keyed_poses("nod", 30, False, keys, F([[1, "neutral"], [7, "half"], [11, "neutral"], [19, "half"], [23, "neutral"]]))


def A_shake_head():
    keys = [(1, {})]
    for f0 in (3, 11, 19):
        keys += [(f0 + 2, {"Head": RZ(18) @ RY(-2)}), (f0 + 6, {"Head": RZ(-18) @ RY(2)})]
    keys += [(32, {}), (36, {})]
    keyed_poses("shake_head", 36, False, keys, F([[1, "neutral"], [4, "annoyed"]]))


def sit_pose(lean, legs, arms):
    """sitting on the floor, legs out in front (knees a little up), hands on the floor beside the hips"""
    p = {"Body": RX(lean), "Head": RX(-lean * 0.6 + 4),
         "Upperarm.L": RX(lean) @ RY(-arms) @ RX(14), "Forearm.L": RX(lean) @ RY(-arms) @ RX(10),
         "Upperarm.R": RX(lean) @ RY(arms) @ RX(14), "Forearm.R": RX(lean) @ RY(arms) @ RX(10)}
    p["Thigh.L"] = RY(-8) @ RX(-legs); p["Calf.L"] = RY(-8) @ RX(-legs + 22 - CALF0); p["Foot.L"] = RY(-8) @ RX(-legs + 30)
    p["Thigh.R"] = RY(8) @ RX(-legs); p["Calf.R"] = RY(8) @ RX(-legs + 22 - CALF0); p["Foot.R"] = RY(8) @ RX(-legs + 30)
    p["_loc"] = Vector((0, 0.08 * H, 0))
    return grounded(p)


def A_sit():
    keys = [(1, {}), (7, {"_loc": Vector((0, 0, -0.03 * H)), "Body": RX(8), "Head": RX(4)}),
            (15, sit_pose(-18, 70, 22)), (19, sit_pose(-10, 82, 26)), (25, sit_pose(-13, 78, 25)), (45, sit_pose(-13, 78, 25))]
    keyed_poses("sit", 45, False, keys, F([[1, "neutral"], [15, "surprised"], [19, "blink"], [21, "annoyed"]]))


def A_lie_flop():
    """falls back flat onto his back (arms out, legs splayed): end pose holds."""
    def lie(t):
        b = -90 * t
        p = {"Body": RX(b), "Head": RX(b + 28 * t),
             "Upperarm.L": RX(b) @ RY(-70 * t) @ RX(-10 * t), "Forearm.L": RX(b) @ RY(-80 * t) @ RX(-10 * t),
             "Upperarm.R": RX(b) @ RY(70 * t) @ RX(-10 * t), "Forearm.R": RX(b) @ RY(80 * t) @ RX(-10 * t),
             "Thigh.L": RX(b) @ RY(-14 * t) @ RX(-12 * t), "Thigh.R": RX(b) @ RY(14 * t) @ RX(-12 * t),
             "Foot.L": RX(b) @ RY(-14 * t) @ RX(-40 * t), "Foot.R": RX(b) @ RY(14 * t) @ RX(-40 * t)}
        p["Calf.L"] = p["Thigh.L"]; p["Calf.R"] = p["Thigh.R"]
        p["_loc"] = Vector((0, 0.18 * H * t, 0))
        return grounded(p)
    crouch = {"_loc": Vector((0, 0, -0.03 * H)), "Body": RX(6), "Head": RX(6), "Upperarm.L": RX(-25), "Upperarm.R": RX(-25)}
    keys = [(1, {}), (6, crouch), (12, lie(0.55)), (16, lie(1.04)), (19, lie(0.97)), (22, lie(1.0)), (45, lie(1.0))]
    keyed_poses("lie_flop", 45, False, keys, F([[1, "neutral"], [6, "surprised"], [16, "blink"], [18, "sleepy"], [34, "blink"], [36, "sleepy"]]))


def A_arms_up():
    """both arms thrown up in a V (cheer / stretch / ta-da), small hop; end pose holds."""
    def up(a, lift):
        return {"_loc": Vector((0, 0, lift * H)),
                "Upperarm.L": aim((math.sin(math.radians(a)), -0.3, math.cos(math.radians(a)))),
                "Forearm.L": aim((math.sin(math.radians(a - 8)), -0.1, math.cos(math.radians(a - 8)))),
                "Hand.L": aim((math.sin(math.radians(a - 14)), -0.15, math.cos(math.radians(a - 14)))),
                "Upperarm.R": aim((-math.sin(math.radians(a)), -0.3, math.cos(math.radians(a)))),
                "Forearm.R": aim((-math.sin(math.radians(a - 8)), -0.1, math.cos(math.radians(a - 8)))),
                "Hand.R": aim((-math.sin(math.radians(a - 14)), -0.15, math.cos(math.radians(a - 14)))),
                "Head": RX(-8), "Body": RX(-3)}
    crouch = {"_loc": Vector((0, 0, -0.03 * H)), "Body": RX(8), "Head": RX(6), "Upperarm.L": RY(-10), "Upperarm.R": RY(10)}
    keys = [(1, {}), (5, crouch), (10, up(56, 0.05)), (14, up(60, 0.0)), (17, up(64, -0.006)), (21, up(62, 0.0)), (36, up(62, 0.0))]
    keyed_poses("arms_up", 36, False, keys, F([[1, "neutral"], [5, "blink"], [7, "happy"]]))


def A_hover():
    """bonus: the pack's signature hover (feet pointed down, floating ~1.1 units (soles ~0.2 m up at 0.72 m), slow bob); loops."""
    n = 60; new_action("hover", n, True)
    for f in range(1, n + 2):
        ph = 2 * math.pi * (f - 1) / n; b = math.sin(ph)
        key(f, {"_loc": Vector((0, 0, 1.15 + 0.08 * b)), "Body": RX(4 + 1.5 * b), "Head": RX(-3 - 1.5 * math.sin(ph - 0.6)),
                "Upperarm.L": RX(10) @ RY(-6), "Forearm.L": RX(14) @ RY(-6), "Upperarm.R": RX(10) @ RY(6), "Forearm.R": RX(14) @ RY(6),
                "Thigh.L": RX(8 + 2 * b), "Calf.L": RX(22 + 2 * b), "Foot.L": RX(62 + 3 * b),
                "Thigh.R": RX(12 + 2 * b), "Calf.R": RX(28 + 2 * b), "Foot.R": RX(66 + 3 * b)})
    fix_signs(arm.animation_data.action)
    FACES["hover"] = F([[1, "neutral"], [44, "blink"], [46, "neutral"]])


def export():
    ad = arm.animation_data
    for t in list(ad.nla_tracks): ad.nla_tracks.remove(t)
    for name in LIB:
        act = bpy.data.actions[name]
        act.use_frame_range = True; act.frame_start, act.frame_end = 1, LIB[name]["frames"] + 1
        tr = ad.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, 1, act); st.action_frame_start, st.action_frame_end = 1, LIB[name]["frames"] + 1
    ad.action = None
    for pb in PB: pb.location, pb.rotation_quaternion, pb.scale = Vector(), Quaternion(), Vector((1, 1, 1))
    sc.frame_start, sc.frame_end = 1, max(v["frames"] + 1 for v in LIB.values())
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUTD, "metalshadow_anim.blend"), copy=False)
    for o in bpy.data.objects: o.select_set(o.type in ("MESH", "ARMATURE"))
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, "metalshadow_anim.glb"), use_selection=True, export_apply=True,
        export_animations=True, export_animation_mode="NLA_TRACKS", export_force_sampling=True, export_frame_step=1,
        export_anim_slide_to_zero=True, export_optimize_animation_size=False, export_reset_pose_bones=True,
        export_yup=True, export_extras=True)
    meta = json.load(open(os.path.join(HERE, "tex", "ms_eyes_meta.json")))
    meta["height_units"] = H
    json.dump(dict({"_meta": meta}, **FACES), open(os.path.join(OUTD, "face_tracks.json"), "w"), indent=1)
    json.dump(LIB, open(os.path.join(OUTD, "actions.json"), "w"), indent=1)


if __name__ == "__main__":
    arm.animation_data_create()
    for k in [k for k in list(globals()) if k.startswith("A_")]:
        globals()[k]()
    export()
    print("ANIM DONE", list(LIB))

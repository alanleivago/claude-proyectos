"""Kit v3: mocap (BVH / Kimodo GLB) -> MakeHuman "default" rig action, headless, with foot planting.
    Blender -b -P styles/zawdog/tools/retarget.py -- <motion.bvh|.glb> <action_name> [start=a end=b] [fps=30]
            [human=owner] [plant=1] [yaw=auto|path|none|<deg>] [origin=1] [scale=auto|<k>] [ground=frame|clip] [arms=relax|off] [rest=auto|frame|swing] [still=1: standing gesture, both feet locked] [stance=<m>: with still, half foot spacing]
-> styles/zawdog/motions/baked/<action_name>.blend : one Action (fake user) for any humans/<name> rig (same bone names).
   + styles/zawdog/motions/baked/<action_name>.json : frames, contacts, root path, foot QA numbers.
Use in a scene:  act = HU.load_action("walk_in"); P.rig.animation_data_create(); P.rig.animation_data.action = act
Method (rest-pose independent, so CMU's splayed rest, 100STYLE's T-pose and Kimodo's SOMA skeleton all land on the
MakeHuman A-pose): per mapped bone, world rotation delta of the source from its rest, applied to the target rest after
swinging the target's rest bone onto the source's rest direction:  R_dst(f) = (R_src(f) R_src_rest^-1) C R_dst_rest.
Root translation is scaled by the hip-height ratio. Unmapped bones (twist, spine04/02, toes, face) follow their parent;
fingers get a relaxed curl. Then foot planting: contact frames (ankle low + slow) lock the ankle at its contact
position with an analytic 2-bone leg IK (knee keeps its plane), blended over 3 frames; the root is lowered/raised so
the planted sole sits on z = 0. Baked as quaternion keys (the same result a Copy Rotation/Location + nla.bake setup
gives when the rests match; the explicit math is what makes mismatched rests work)."""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
ZD = os.path.join(ROOT, "styles", "zawdog")
sys.path.insert(0, os.path.join(ZD, "humans"))
A = sys.argv[sys.argv.index("--") + 1:]
SRC, NAME = A[0], A[1]
OPT = dict(fps="30", human="owner", plant="1", yaw="auto", origin="1", scale="auto")
OPT.update(dict(a.split("=") for a in A[2:]))
OUT = os.path.join(ZD, "motions", "baked"); os.makedirs(OUT, exist_ok=True)

# source joint -> MakeHuman bone (first hit wins per source skeleton)
MAPS = {
    "cmu": {"Hips": "root", "LowerBack": "spine05", "Spine": "spine03", "Spine1": "spine01", "Neck": "neck01", "Neck1": "neck03",
            "Head": "head", "LeftShoulder": "clavicle.L", "LeftArm": "upperarm01.L", "LeftForeArm": "lowerarm01.L", "LeftHand": "wrist.L",
            "RightShoulder": "clavicle.R", "RightArm": "upperarm01.R", "RightForeArm": "lowerarm01.R", "RightHand": "wrist.R",
            "LeftUpLeg": "upperleg01.L", "LeftLeg": "lowerleg01.L", "LeftFoot": "foot.L",
            "RightUpLeg": "upperleg01.R", "RightLeg": "lowerleg01.R", "RightFoot": "foot.R"},
    "100style": {"Hips": "root", "Chest": "spine05", "Chest2": "spine03", "Chest4": "spine01", "Neck": "neck01", "Head": "head",
                 "LeftCollar": "clavicle.L", "LeftShoulder": "upperarm01.L", "LeftElbow": "lowerarm01.L", "LeftWrist": "wrist.L",
                 "RightCollar": "clavicle.R", "RightShoulder": "upperarm01.R", "RightElbow": "lowerarm01.R", "RightWrist": "wrist.R",
                 "LeftHip": "upperleg01.L", "LeftKnee": "lowerleg01.L", "LeftAnkle": "foot.L",
                 "RightHip": "upperleg01.R", "RightKnee": "lowerleg01.R", "RightAnkle": "foot.R"},
    "soma": {"Hips": "root", "Spine1": "spine05", "Spine2": "spine03", "Chest": "spine01", "Neck1": "neck01", "Neck2": "neck03", "Head": "head",
             "LeftShoulder": "clavicle.L", "LeftArm": "upperarm01.L", "LeftForeArm": "lowerarm01.L", "LeftHand": "wrist.L",
             "RightShoulder": "clavicle.R", "RightArm": "upperarm01.R", "RightForeArm": "lowerarm01.R", "RightHand": "wrist.R",
             "LeftLeg": "upperleg01.L", "LeftShin": "lowerleg01.L", "LeftFoot": "foot.L",
             "RightLeg": "upperleg01.R", "RightShin": "lowerleg01.R", "RightFoot": "foot.R"},
}
# clavicles take the source collar's rotation delta WITHOUT the rest swing (swinging MakeHuman's clavicle onto the
# source collar bone hunched the shoulders into "wings"; not mapping them stretched the shoulder tops when arms rise)
LIMB = ("upperarm01", "lowerarm01", "upperleg01", "lowerleg01")   # feet: no swing (flat in both rests;
#  swinging MakeHuman's foot onto CMU's steep heel->toe bone pointed the toes down)

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)

# ---- source
if SRC.lower().endswith(".bvh"):
    bpy.ops.preferences.addon_enable(module="io_anim_bvh")
    bpy.ops.import_anim.bvh(filepath=SRC, global_scale=1.0, rotate_mode="NATIVE", axis_forward="-Z", axis_up="Y", update_scene_fps=False, update_scene_duration=True)
else:
    bpy.ops.import_scene.gltf(filepath=SRC)
src = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
sb = {b.name for b in src.data.bones}
kind = "100style" if "Chest4" in sb else ("soma" if "LeftShin" in sb else "cmu")
MAP = {k: v for k, v in MAPS[kind].items() if k in sb}
act = src.animation_data.action
f_lo, f_hi = int(act.frame_range[0]), int(act.frame_range[1])
src_fps = None
if SRC.lower().endswith(".bvh"):
    for ln in open(SRC):
        if ln.strip().startswith("Frame Time"):
            src_fps = 1.0 / float(ln.split(":")[1]); break
src_fps = src_fps or bpy.context.scene.render.fps
FPS = float(OPT["fps"]); step = src_fps / FPS
start = int(OPT.get("start", f_lo)); end = int(OPT.get("end", f_hi))
# (the BVH importer puts file frame 0 at scene frame 1)
off = 1 if SRC.lower().endswith(".bvh") else 0
frames = []
x = start
while x <= end:
    frames.append(x + off); x += step
print(f"source {kind}: {len(MAP)} mapped joints, {src_fps:.0f} fps -> {FPS:.0f} fps, {len(frames)} frames")

# ---- target
import human as HU  # noqa: E402
P = HU.Human(OPT["human"], flat_shading=False)
dst = P.rig; P.rest(); bpy.context.view_layer.update()
DB = dst.data.bones
order = [b.name for b in DB]                      # parents before children
RW_dst = {b.name: (dst.matrix_world @ b.matrix_local) for b in DB}
RW_src = {b.name: (src.matrix_world @ b.matrix_local) for b in src.data.bones}


def rot(m):
    return m.to_quaternion()


# rest correction C per mapped target bone: swing the target rest direction onto the source rest direction (limbs)
C = {}
for s_, d_ in MAP.items():
    if d_.startswith(LIMB):
        # the visible segment (upperarm01 head -> elbow ...), not the bone axis: MakeHuman splits arms and legs into
        # two bones (01 + twist 02) that are not collinear, which left the elbows out and the knees off
        nxt = {"upperarm01": "lowerarm01", "lowerarm01": "wrist", "upperleg01": "lowerleg01", "lowerleg01": "foot"}.get(d_.split(".")[0])
        if nxt:
            dd = (RW_dst[nxt + "." + d_.split(".")[1]].translation - RW_dst[d_].translation).normalized()
        else:
            dd = (RW_dst[d_].to_3x3() @ Vector((0, 1, 0))).normalized()
        sd = (RW_src[s_].to_3x3() @ Vector((0, 1, 0))).normalized()
        C[d_] = dd.rotation_difference(sd)
    else:
        C[d_] = Quaternion()
# Sources whose rest pose is NOT an upright figure (the official Kimodo 77-joint SOMA BVH: BONES-SEED rest, bones laid
# along +X in cm) need a full rest frame per bone, not just a limb swing: C maps the target's rest bone frame (y = the
# segment to the next mapped joint, x = the skeleton's left-right axis) onto the source's.
DNEXT = {"root": "spine05", "spine05": "spine03", "spine03": "spine01", "spine01": "neck01", "neck01": "neck03", "neck03": "head",
         "clavicle.L": "upperarm01.L", "upperarm01.L": "lowerarm01.L", "lowerarm01.L": "wrist.L", "wrist.L": "finger3-1.L",
         "clavicle.R": "upperarm01.R", "upperarm01.R": "lowerarm01.R", "lowerarm01.R": "wrist.R", "wrist.R": "finger3-1.R",
         "upperleg01.L": "lowerleg01.L", "lowerleg01.L": "foot.L", "foot.L": "toe3-1.L",
         "upperleg01.R": "lowerleg01.R", "lowerleg01.R": "foot.R", "foot.R": "toe3-1.R"}
SNEXT_EXTRA = {"Head": "HeadEnd", "LeftHand": "LeftHandMiddle1", "RightHand": "RightHandMiddle1", "LeftFoot": "LeftToeBase", "RightFoot": "RightToeBase"}
INV = {d: s for s, d in MAP.items()}
_lr = ([n for n in ("LeftUpLeg", "LeftHip", "LeftLeg") if n in sb][0], [n for n in ("RightUpLeg", "RightHip", "RightLeg") if n in sb][0])
_sp = [n for n in ("Chest", "Spine1", "Chest4", "Spine") if n in sb]
_up = (RW_src[_sp[0]].translation - RW_src["Hips"].translation).normalized() if _sp else Vector((0, 0, 1))
UPRIGHT = _up.z > 0.8
REST_MODE = OPT.get("rest", "auto")
if REST_MODE == "frame" or (REST_MODE == "auto" and not UPRIGHT):
    def frame(head, nxt, lat):
        y = (nxt - head); y = y.normalized() if y.length > 1e-6 else Vector((0, 0, 1))
        x = lat - lat.project(y); x = x.normalized() if x.length > 1e-6 else Vector((1, 0, 0))
        z = x.cross(y)
        return Matrix((x, y, z)).transposed()                          # columns x, y, z
    lat_s = RW_src[_lr[0]].translation - RW_src[_lr[1]].translation
    lat_d = RW_dst["upperleg01.L"].translation - RW_dst["upperleg01.R"].translation
    for s_, d_ in MAP.items():
        dn = DNEXT.get(d_); sn = INV.get(dn) if dn else None
        sn = sn or SNEXT_EXTRA.get(s_)
        dh = RW_dst[d_].translation; sh = RW_src[s_].translation
        dt = RW_dst[dn].translation if dn in RW_dst else (RW_dst[d_] @ Vector((0, DB[d_].length, 0)))
        st = RW_src[sn].translation if sn in RW_src else (RW_src[s_] @ Vector((0, src.data.bones[s_].length, 0)))
        C[d_] = (frame(sh, st, lat_s) @ frame(dh, dt, lat_d).transposed()).to_quaternion()
    print(f"rest mode: per-bone frames (source rest not upright, spine dir {tuple(round(v, 2) for v in _up)})")

# the hand continues the forearm: same rest correction (CMU's hand joint has zero length, so its own axis is noise and the
# hands came out bent 90 deg outward at the wrist)
for s_ in "LR":
    if f"wrist.{s_}" in C and f"lowerarm01.{s_}" in C and UPRIGHT and REST_MODE != "frame":
        C[f"wrist.{s_}"] = C[f"lowerarm01.{s_}"]

# translation scale = leg-length ratio (hip joint -> knee -> ankle), so the scaled stride matches the target's legs and a
# planted foot can actually stay planted
LEGJ = {"cmu": ("LeftUpLeg", "LeftLeg", "LeftFoot"), "100style": ("LeftHip", "LeftKnee", "LeftAnkle"), "soma": ("LeftLeg", "LeftShin", "LeftFoot")}[kind]
_sj = [RW_src[n].translation for n in LEGJ]
_dj = [RW_dst[n].translation for n in ("upperleg01.L", "lowerleg01.L", "foot.L")]
leg_src = (_sj[1] - _sj[0]).length + (_sj[2] - _sj[1]).length
leg_dst = (_dj[1] - _dj[0]).length + (_dj[2] - _dj[1]).length
scale = float(OPT["scale"]) if OPT["scale"] != "auto" else leg_dst / leg_src
lowest_src = min((RW_src[b.name].translation.z for b in src.data.bones), default=0.0)


def src_world(f):
    bpy.context.scene.frame_set(int(f), subframe=f - int(f))
    return {b.name: (src.matrix_world @ src.pose.bones[b.name].matrix) for b in src.data.bones}


# global yaw: the source's facing at the first frame -> -Y
W0 = src_world(frames[0])
yaw = 0.0
lr = ([n for n in ("LeftUpLeg", "LeftHip", "LeftLeg") if n in sb][0], [n for n in ("RightUpLeg", "RightHip", "RightLeg") if n in sb][0])
if OPT["yaw"] == "auto":
    r = W0[lr[0]].translation - W0[lr[1]].translation; r.z = 0       # toward the person's left
    fwd = r.cross(Vector((0, 0, 1)))                                    # left x up = forward
    yaw = -math.pi / 2 - math.atan2(fwd.y, fwd.x)                       # turn it onto -Y (MakeHuman's facing)
elif OPT["yaw"] == "path":                                             # walks: the overall travel direction -> -Y
    W1 = src_world(frames[-1]); dv = W1["Hips"].translation - W0["Hips"].translation
    yaw = -math.pi / 2 - math.atan2(dv.y, dv.x)
elif OPT["yaw"] != "none":
    yaw = math.radians(float(OPT["yaw"]))
RZ = Matrix.Rotation(yaw, 4, "Z"); QZ = RZ.to_quaternion()
p0 = RZ @ W0["Hips"].translation

# ---- per frame: desired world rotations + root position
REST_LOCAL = {b.name: ((b.parent.matrix_local.inverted() @ b.matrix_local) if b.parent else b.matrix_local.copy()) for b in DB}
CURL = {f"finger{i}-{j}.{s}": (14 if i == 1 else (24 + 4 * j)) for i in range(1, 6) for j in (1, 2, 3) for s in "LR"}   # relaxed curl


def frame_pose(W):
    """returns armature-space matrices of every target bone (FK), from the source world matrices W."""
    des = {}
    for s_, d_ in MAP.items():
        q = (QZ @ rot(W[s_])) @ rot(RW_src[s_]).inverted() @ C[d_] @ rot(RW_dst[d_])
        des[d_] = q
    hp = RZ @ W["Hips"].translation
    if OPT["origin"] == "1":
        hp = Vector((hp.x - p0.x, hp.y - p0.y, hp.z))
    root_pos = Vector((hp.x * scale, hp.y * scale, (hp.z - lowest_src) * scale))
    M = {}
    inv_w = dst.matrix_world.inverted()
    for n in order:
        b = DB[n]
        base = (M[b.parent.name] @ REST_LOCAL[n]) if b.parent else REST_LOCAL[n].copy()
        if n in des:
            r3 = (inv_w.to_quaternion() @ des[n]).to_matrix()
            m = r3.to_4x4(); m.translation = base.translation
            if n == "root":                                        # hips joint -> leg-joint height, root keeps its offset
                m.translation = inv_w @ (root_pos + Vector((0, 0, RW_dst["root"].translation.z - RW_dst["upperleg01.L"].translation.z)))
            base = m
        if n in CURL:
            base = base @ Matrix.Rotation(math.radians(CURL[n]), 4, "X")
        M[n] = base
    return M


POSES = [frame_pose(src_world(f)) for f in frames]
NF = len(POSES)
CHILDREN = {n: [c.name for c in DB[n].children] for n in order}


def propagate(M, bone, old):
    """after M[bone] changed: rebuild all its descendants keeping their local (basis) rotations."""
    stack = list(CHILDREN[bone])
    while stack:
        n = stack.pop(0); par = DB[n].parent.name
        basis = (old[par] @ REST_LOCAL[n]).inverted() @ old[n]
        old_n = old[n].copy(); M[n] = M[par] @ REST_LOCAL[n] @ basis; old[n] = old_n
        stack += CHILDREN[n]


def swing(M, bone, a, b, new_b):
    """rotate `bone` about point a so that the segment a->b points along a->new_b; descendants follow."""
    q = (b - a).rotation_difference(new_b - a)
    old = {k: v.copy() for k, v in M.items()}
    M[bone] = Matrix.Translation(a) @ q.to_matrix().to_4x4() @ Matrix.Translation(-a) @ M[bone]
    propagate(M, bone, old)


# ---- relaxed arms: CMU / Kimodo actors (and MakeHuman's broad A-pose shoulders) leave hanging arms out to the sides
#      ("numb" arms). When an arm hangs (wrist well below the shoulder) the elbow and wrist are pulled in next to the body
#      (elbow ~3 cm, wrist ~5 cm outside the shoulder line, never inside the thigh), fading out as the arm is raised, so
#      gestures (shrug, startle) keep their shape.
if OPT.get("arms", "relax") == "relax":
    for M in POSES:
        lat = (M["upperleg01.L"].translation - M["upperleg01.R"].translation); lat.z = 0; lat.normalize()
        C0 = M["spine01"].translation
        for s, sx in (("L", 1), ("R", -1)):
            S = M[f"upperarm01.{s}"].translation; E = M[f"lowerarm01.{s}"].translation; Wr = M[f"wrist.{s}"].translation
            L_ = (E - S).length + (Wr - E).length
            d0 = (Wr - C0).dot(lat) * sx
            # 1) idle forearms held up/forward -> a relaxed ~15 deg elbow (not while the hands are raised or spread out)
            g = max(0.0, min(1.0, ((S.z - Wr.z) / L_ - 0.30) / 0.25)) * (1 - max(0.0, min(1.0, (d0 - 0.33) / 0.1)))
            g = g * g * (3 - 2 * g)
            ua = (E - S).normalized(); fa = (Wr - E)
            bend = math.degrees(ua.angle(fa.normalized()))
            if g > 0 and bend > 15:
                tb = math.radians(bend + (15 - bend) * g)
                ax = ua.cross(fa.normalized())
                if ax.length > 1e-6:
                    nf = Quaternion(ax.normalized(), tb) @ ua
                    swing(M, f"lowerarm01.{s}", E, Wr, E + nf * fa.length)
            S = M[f"upperarm01.{s}"].translation; E = M[f"lowerarm01.{s}"].translation; Wr = M[f"wrist.{s}"].translation
            hang = (S.z - Wr.z) / L_
            h = max(0.0, min(1.0, (hang - 0.55) / 0.3)); h = h * h * (3 - 2 * h)
            if h <= 0:
                continue
            d = lambda P: (P - C0).dot(lat) * sx                       # noqa: E731  lateral distance from the body midline
            for seg, a_n, b_n, extra in ((f"upperarm01.{s}", f"upperarm01.{s}", f"lowerarm01.{s}", 0.03), (f"lowerarm01.{s}", f"lowerarm01.{s}", f"wrist.{s}", 0.05)):
                a = M[a_n].translation; b = M[b_n].translation
                over = d(b) - (d(S) + extra)
                if over > 0:
                    nb = b - lat * sx * over * h
                    nb = a + (nb - a).normalized() * (b - a).length
                    swing(M, seg, a, b, nb)


# ---- floor, per frame: the lower sole (ankle or ball of the foot vs their standing heights) is put on z = 0 whenever it
#      is near the floor (< 8 cm), smoothed over 3 frames; clearly airborne frames (hops, jumps) keep their height
ANK0 = (dst.matrix_world @ DB["foot.L"].head_local).z
BALL0 = (dst.matrix_world @ DB["foot.L"].tail_local).z
GROUND = OPT.get("ground", "frame")


# the real shoe: every body vertex driven by foot / toe bones, stored in its foot bone's rest space
_vg = {g.index: g.name for g in P.body.vertex_groups}
SHOE = {"L": [], "R": []}
for v in P.body.data.vertices:
    gs = sorted(v.groups, key=lambda g: -g.weight)
    if gs:
        n_ = _vg[gs[0].group]
        for s_ in "LR":
            if n_.startswith(("foot", "toe")) and n_.endswith("." + s_):
                SHOE[s_].append(RW_dst[f"foot.{s_}"].inverted() @ (P.body.matrix_world @ v.co))


def shoe_low(M, s):
    m = M[f"foot.{s}"]
    return min((m @ p).z for p in SHOE[s])


def sole(M):
    return min(shoe_low(M, s) for s in "LR")


_lo = [sole(M) for M in POSES]
if GROUND == "frame":
    base = min(_lo)
    corr = [-(v if v - base < 0.08 else base) for v in _lo]          # the lower shoe touches z = 0
    corr = [sum(corr[max(0, i - 1):i + 2]) / len(corr[max(0, i - 1):i + 2]) for i in range(NF)]
else:
    corr = [-min(_lo)] * NF
for M, c in zip(POSES, corr):
    for n in M:
        M[n] = Matrix.Translation((0, 0, c)) @ M[n]

# ---- foot planting (armature space == world here: the rig object sits at the origin, unrotated)
def chain(M, s):
    return M[f"upperleg01.{s}"].translation.copy(), M[f"lowerleg01.{s}"].translation.copy(), M[f"foot.{s}"].translation.copy()


ANK_REST = RW_dst["foot.L"].translation.z
contacts = {}
qa = {}
def ball(M, s):
    return (M[f"foot.{s}"] @ Vector((0, DB[f"foot.{s}"].length, 0)))


def runs(flags, min_len=2):
    out = []; i = 0
    while i < len(flags):
        if flags[i]:
            j = i
            while j + 1 < len(flags) and flags[j + 1]:
                j += 1
            if j - i >= min_len:
                out.append((i, j))
            i = j + 1
        else:
            i += 1
    return out


if OPT["plant"] == "1":
    # two contact phases per foot: HEEL (ankle low + slow) and BALL (ball of the foot low + slow). During a ball phase the
    # ball is locked and the ankle follows the animated foot rotation (the heel lifts naturally, no toe drag); during a
    # heel-only phase the ankle is locked.
    PH = {}
    for s in "LR":
        A_ = [chain(M, s)[2] for M in POSES]; B_ = [ball(M, s) for M in POSES]
        sp = lambda P_, i: (P_[min(i + 1, NF - 1)] - P_[max(i - 1, 0)]).length * FPS / 2
        # low + slow, or (standing clips) a foot that hovers a few cm but does not move: put it down too
        heel = [(A_[i].z < ANK0 + 0.03 and sp(A_, i) < 0.5) or (A_[i].z < ANK0 + 0.10 and sp(A_, i) < 0.12) for i in range(NF)]
        bal = [(B_[i].z < BALL0 + 0.03 and sp(B_, i) < 0.5) or (B_[i].z < BALL0 + 0.10 and sp(B_, i) < 0.12) for i in range(NF)]
        if OPT.get("still") == "1":                                   # standing gestures: both feet stay down all clip
            heel = [A_[i].z < ANK0 + 0.14 for i in range(NF)]; bal = [False] * NF
        for f_ in (heel, bal):
            for i in range(1, NF - 1):
                if not f_[i] and f_[i - 1] and f_[i + 1]:
                    f_[i] = True
        PH[s] = (heel, bal, A_, B_)
        contacts[s] = runs([h or b_ for h, b_ in zip(heel, bal)])

    def _rebuild(M, s, which, foot_rot):
        """children of the leg from their (new) parents with rest-local offsets; lowerleg01 keeps its own world rotation
        when only the thigh moved (it is re-aimed right after), the foot keeps its animated world rotation."""
        for n in order:
            b = DB[n]
            if not (b.parent and n.endswith("." + s) and n.startswith(which)):
                continue
            base = M[b.parent.name] @ REST_LOCAL[n]
            if n.startswith("lowerleg01"):
                M[n] = Matrix.Translation(base.translation) @ (M[b.parent.name].to_3x3() @ REST_LOCAL[n].to_3x3()).to_4x4()
            elif n.startswith("foot"):
                M[n] = Matrix.Translation(base.translation) @ foot_rot.to_4x4()
            else:
                M[n] = base

    def ik(M, s, target):
        h, k, a = chain(M, s)
        l1, l2 = (k - h).length, (a - k).length
        d = target - h; L = min(d.length, (l1 + l2) * 0.999); dn = d.normalized()
        # knee direction: the current knee offset from the hip->target line, biased toward the toes (a nearly straight
        # leg has no reliable offset and the knee used to flip inward: knock-kneed standing clips)
        off = k - (h + (k - h).project(dn))
        toe = M[f"foot.{s}"].to_3x3() @ Vector((0, 1, 0)); toe = toe - toe.project(dn)
        pole = off + (toe.normalized() * 0.04 if toe.length > 1e-6 else Vector())
        pole = (pole - pole.project(dn)).normalized() if (pole - pole.project(dn)).length > 1e-6 else Vector((0, -1, 0))
        ca = (l1 * l1 + L * L - l2 * l2) / (2 * l1 * L); ca = max(-1, min(1, ca))
        knee = h + dn * (l1 * ca) + pole * (l1 * math.sqrt(1 - ca * ca))
        ank = h + dn * L
        foot_rot = M[f"foot.{s}"].to_3x3()
        # swing the thigh so hip->knee points at the new knee (the segment, not the bone axis: upperleg01/02 and
        # lowerleg01/02 are not collinear), rebuild, then swing the shin so knee->ankle points at the target
        q = (k - h).rotation_difference(knee - h)
        M[f"upperleg01.{s}"] = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ M[f"upperleg01.{s}"].to_3x3().to_4x4()
        _rebuild(M, s, ("upperleg02", "lowerleg01", "lowerleg02", "foot", "toe"), foot_rot)
        h2, k2, a2 = chain(M, s)
        q2 = (a2 - k2).rotation_difference(ank - k2)
        M[f"lowerleg01.{s}"] = Matrix.Translation(k2) @ q2.to_matrix().to_4x4() @ M[f"lowerleg01.{s}"].to_3x3().to_4x4()
        _rebuild(M, s, ("lowerleg02", "foot", "toe"), foot_rot)
        return
        # rebuild the children of the leg from the new parents (rest-local offsets), keep the foot's world rotation
        for n in order:
            b = DB[n]
            if b.parent and n.endswith("." + s) and n.startswith(("upperleg02", "lowerleg01", "lowerleg02", "foot", "toe")):
                base = M[b.parent.name] @ REST_LOCAL[n]
                if n.startswith(("upperleg02", "lowerleg02")):
                    M[n] = base
                elif n.startswith("lowerleg01"):
                    M[n] = Matrix.Translation(base.translation) @ M[n].to_3x3().to_4x4()
                elif n.startswith("foot"):
                    M[n] = Matrix.Translation(base.translation) @ foot_rot.to_4x4()
                else:
                    M[n] = M[b.parent.name] @ REST_LOCAL[n]

    IKR = []
    JOBS = {}                                                          # frame -> [(side, target, weight)]
    for s in "LR":
        heel, bal, A_, B_ = PH[s]
        for a, b in contacts[s]:
            lockB = lockA = None
            tgt = {}
            for i in range(a, b + 1):
                if bal[i]:
                    if lockB is None:
                        lockB = B_[i].copy(); lockB.z = BALL0
                    tgt[i] = lockB - (B_[i] - A_[i])                     # ankle so that the ball stays put
                    tgt[i].z = max(tgt[i].z, ANK0 - 0.005)
                else:
                    if lockA is None:
                        lockA = A_[i].copy(); lockA.z = ANK0
                        if "stance" in OPT:                            # still clips: feet this far either side of the hips
                            rx = POSES[i]["root"].translation.x
                            lockA.x = rx + (1 if s == "L" else -1) * float(OPT["stance"])
                    tgt[i] = lockA
            for i in range(max(0, a - 3), min(NF, b + 4)):
                if a <= i <= b:
                    w, t_ = 1.0, tgt[i]
                else:
                    w = 1 - (a - i) / 4 if i < a else 1 - (i - b) / 4
                    t_ = tgt[a] if i < a else tgt[b] + (A_[i] - A_[b])
                JOBS.setdefault(i, []).append((s, t_, w))
    # a planted foot the leg cannot reach (the source stood on a raised foot / straighter legs): lower the whole body
    LEGLEN = {s: (RW_dst[f"lowerleg01.{s}"].translation - RW_dst[f"upperleg01.{s}"].translation).length +
              (RW_dst[f"foot.{s}"].translation - RW_dst[f"lowerleg01.{s}"].translation).length for s in "LR"}
    need = [0.0] * NF
    for i, jobs in JOBS.items():
        for s, t_, w in jobs:
            if w < 1.0:
                continue
            h = chain(POSES[i], s)[0]; d = t_ - h
            over = d.length - 0.985 * LEGLEN[s]
            if over > 0:                                                # drop dz so that |t - (h - dz)| = 0.985 L
                hz = d.z; r2 = d.x * d.x + d.y * d.y; L2 = (0.985 * LEGLEN[s]) ** 2
                need[i] = max(need[i], (-hz - math.sqrt(max(L2 - r2, 0.0))) if L2 > r2 else over)
    need = [max(need[max(0, i - 3):i + 4]) for i in range(NF)]
    need = [sum(need[max(0, i - 2):i + 3]) / len(need[max(0, i - 2):i + 3]) for i in range(NF)]
    for i in range(NF):
        if need[i] > 0:
            for n in POSES[i]:
                POSES[i][n] = Matrix.Translation((0, 0, -need[i])) @ POSES[i][n]
    for i, jobs in sorted(JOBS.items()):
        for s, t_, w in jobs:
            cur = chain(POSES[i], s)[2]
            ik(POSES[i], s, cur.lerp(t_, w))
            if w == 1.0:
                IKR.append((chain(POSES[i], s)[2] - t_).length)
    # no shoe through the floor: lift that ankle by the deficit (heel strikes with the toes up dip the heel corner)
    for i, M in enumerate(POSES):
        for s in "LR":
            lo = shoe_low(M, s)
            if lo < -0.004:
                ik(M, s, chain(M, s)[2] + Vector((0, 0, -lo)))
    print(f"IK residual max {max(IKR or [0]):.4f} m, mean {sum(IKR or [0]) / max(len(IKR), 1):.4f} m")
    # QA: ankle slide during contacts + lowest ankle
    for s in "LR":
        slide = 0.0
        for a, b in contacts[s]:
            pts = [ball(POSES[i], s) if PH[s][1][i] else chain(POSES[i], s)[2] for i in range(a, b + 1)]
            pts = pts[[PH[s][1][i] for i in range(a, b + 1)].index(True):] if any(PH[s][1][a:b + 1]) else pts
            slide = max(slide, max((p - pts[0]).length for p in pts))
        qa[s] = dict(contacts=contacts[s], max_slide_m=round(slide, 4), min_ankle_z=round(min(chain(M, s)[2].z for M in POSES), 4))

# ---- bake: armature-space matrices -> pose-bone basis, quaternion keys
action = bpy.data.actions.new(NAME); action.use_fake_user = True
dst.animation_data_create(); dst.animation_data.action = action
for pb in dst.pose.bones:
    pb.rotation_mode = "QUATERNION"
for i, M in enumerate(POSES):
    for n in order:
        b = DB[n]; pb = dst.pose.bones[n]
        parent_rest = (M[b.parent.name] @ REST_LOCAL[n]) if b.parent else REST_LOCAL[n]
        basis = parent_rest.inverted() @ M[n]
        pb.rotation_quaternion = basis.to_quaternion()
        if n == "root":
            pb.location = basis.translation
        if n in MAP.values() or n in CURL or n == "root" or n.startswith(("upperleg", "lowerleg", "foot")):
            pb.keyframe_insert("rotation_quaternion", frame=i + 1)
            if n == "root":
                pb.keyframe_insert("location", frame=i + 1)
# self-check: the baked rig must reproduce the intended pose (max bone-direction error over mapped bones, degrees)
err = 0.0
for i in range(0, NF, max(1, NF // 12)):
    bpy.context.scene.frame_set(i + 1)
    for n in MAP.values():
        pb = dst.pose.bones[n]
        a = (pb.matrix.to_3x3() @ Vector((0, 1, 0))); b_ = (POSES[i][n].to_3x3() @ Vector((0, 1, 0)))
        err = max(err, math.degrees(a.angle(b_)))
print(f"bake check: max bone direction error {err:.2f} deg")
root_path = [[round(v, 3) for v in POSES[i]["root"].translation] for i in (0, NF // 2, NF - 1)]
info = dict(source=os.path.relpath(SRC, ROOT), kind=kind, frames=NF, fps=FPS, src_range=[start, end], yaw_deg=round(math.degrees(yaw), 1),
            scale=round(scale, 4), bake_err_deg=round(err, 2), root_path=root_path, feet=qa)
json.dump(info, open(os.path.join(OUT, NAME + ".json"), "w"), indent=1)
bpy.data.libraries.write(os.path.join(OUT, NAME + ".blend"), {action}, fake_user=True)
print("RETARGET", json.dumps(info))

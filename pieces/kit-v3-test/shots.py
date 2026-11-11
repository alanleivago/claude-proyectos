"""Kit v3 test clip (~8.3 s): MakeHuman/MPFB2 owner + real mocap + Flow expression swaps, in the zaw-dog kit living room.
Runs INSIDE the approved zaw-dog-05 kit (sets, dog v2, PS1 snap, flat light) through its exec mode, one process per shot:
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/kit-v3-test/shots.py <A|B|C|all> <mode> [step]
  mode: board (1 mid frame -> review/board/<shot>.png), frames (every <step> frame, 540x960 -> review/anim/<shot>/),
        final (1080x1920 -> renders/frames/#####.png), feet (lowest shoe / dog vertex per frame -> review/feet_<shot>.txt)
Shots (30 fps):  A 0-75     human height, moving camera: the owner walks in (CMU 02_01 walk, retargeted)
                 B 75-165   the dog hops up barking; the owner startles (Kimodo SOMA-SEED "a man startles and jumps back",
                            generated on this Mac) and his face hard-swaps neutral -> scared; slow push-in to a face close-up
                 C 165-250  the owner shrugs (CMU 141_21), surprised -> smile swap on the shrug; the dog wags."""
import math
import os
import sys

import bpy
from mathutils import Vector

KV = os.path.join(ROOT, "pieces", "kit-v3-test")                       # noqa: F821  (ROOT, K, D, ... come from build.py)
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

XA = ARGS[2:]                                                           # noqa: F821
SHOT, XMODE = XA[0], XA[1]
STEP = int(XA[2]) if len(XA) > 2 else 1
SH = {"A": (0, 75), "B": (75, 165), "C": (165, 250)}
END_F = 250

# ---- the kit v3 human
PM = HU.Human("owner")
PM.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]   # characters wobble, the set does not
ACT = {k: HU.load_action(k) for k in ("walk_test", "startle_kimodo", "shrug_cmu141")}
# the dog bed moves out of the walking path (it sat on the A/B floor line)
for n_, xy in (("dogbed", (1.85, 0.62)), ("dogbed_c", (1.85, 0.62))):
    o_ = bpy.data.objects[n_]; o_.location.x, o_.location.y = xy
bpy.data.objects["toy_bone"].location = (-0.9, 0.95, 0.004)
SHADOW = CSH[3]                                                         # noqa: F821  contact blob under the human


def human(action, af, loc, yaw, face):
    """the MakeHuman owner playing `action` at its frame af (clamped to the clip), placed at loc / yaw."""
    a = ACT[action]; PM.show(True); PM.play(a)
    a0, a1 = a.frame_range
    PM.rig.animation_data.action_extrapolation = "HOLD"
    PM.place(loc, yaw)
    sc.frame_set(int(min(max(af, a0), a1)))                             # noqa: F821
    PM.face(face)
    bpy.context.view_layer.update()
    r = PM.bone_world("root"); SHADOW.hide_render = SHADOW.hide_viewport = False
    SHADOW.location = (r.x, r.y, 0.004); SHADOW.scale = (0.62, 0.5, 1); SHADOW.rotation_euler = (0, 0, yaw)


def head_pt(dz=0.0):
    return PM.bone_world("head") + Vector((0, 0, 0.09 + dz))


def ease(x):
    x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)


def lerp(a, b, u):
    return Vector(a).lerp(Vector(b), u)


# ---- shot A: he walks in from the hallway door; human-height camera trucks back and pans with him
A_START = (2.35, -1.62)


def shot_a(f):
    t = f / 30.0
    human("walk_test", f + 1, A_START, -math.pi / 2, "neutral")
    dd = dog(0, (-0.55, -0.6, 0), yaw_to((-0.55, -0.6), (1.2, -1.6)), "neutral", t)   # noqa: F821  the dog waits in the foreground, watching him come in
    D.expr_pose(dd["arm"], "neutral", t)                                 # noqa: F821
    u = ease(f / 75.0)
    tgt = PM.bone_world("spine01") + Vector((0, 0, 0.15))
    pos = lerp((-1.75, -0.05, 1.52), (-2.05, -0.45, 1.48), u)          # 3/4 front, trucking back as he comes closer
    cam(tuple(pos), tuple(tgt), 22)                                     # noqa: F821


# ---- shot B: dog hop + bark, startle, face swap, slow push-in to his face
B_LOC = (0.25, -1.05)
B_DOG = (-0.42, -1.18)
HOP0, BARK_F, SCARE_F = 6, 9, 11                                         # frames into the shot (scare = Kimodo frame 9)
K_OFF = 2                                                                # Kimodo frame 1 at shot frame 2


def shot_b(f):
    k = f - 75; t = k / 30.0
    af = k - K_OFF + 1
    human("startle_kimodo", af, B_LOC, -math.pi / 2, "scared" if k >= SCARE_F else "neutral")
    dd = dog(0, (B_DOG[0], B_DOG[1], 0), yaw_to(B_DOG, B_LOC), "shocked" if k >= HOP0 else "neutral", t)   # noqa: F821
    arm = dd["arm"]
    h = (k - HOP0) / 12.0                                                # 0.4 s hop: rear up on the hind legs, front paws up
    if 0 <= h <= 1:
        s_ = math.sin(math.pi * h)
        dd["mv"].location.z = 0.10 * s_
        D.rot(arm, "root", (math.cos(dd["mv"].rotation_euler.z), math.sin(dd["mv"].rotation_euler.z), 0), -0.42 * s_)   # noqa: F821
    for kk in (BARK_F, BARK_F + 12):                                     # two barks: jaw snaps open and shut
        b = (k - kk) / 6.0
        if 0 <= b <= 1:
            D.rot(arm, "jaw", (1, 0, 0), 0.5 * math.sin(math.pi * b))    # noqa: F821
            D.rot2(arm, "neck", [((1, 0, 0), -0.25 * math.sin(math.pi * b))])   # noqa: F821
    ground_dog(0)                                                        # noqa: F821
    # camera: medium at human height -> slow push-in onto the face. Smooth path from fixed key points (it used to follow
    # the head every frame and inherited the step bob = camera shake): the face ends ~1.3 m back (+X) after his jump.
    u = ease(k / 90.0)
    end_face = Vector((B_LOC[0] + 1.32, B_LOC[1], 1.62))
    near = end_face + Vector((-1.35, -0.6, -0.08))                       # medium close-up, not the face filling the frame
    far = Vector((-1.2, -2.25, 1.45))                                    # the dog's hop reads on the left of frame
    pos = far.lerp(near, u)
    tgt = Vector((B_LOC[0] - 0.2, B_LOC[1], 1.05)).lerp(end_face, ease(k / 75.0))
    cam(tuple(pos), tuple(tgt), 24 + 6 * u)                             # noqa: F821


# ---- shot C: the shrug (palms up) with the smile; the dog wags; short orbit
C_LOC = (1.45, -0.95)
C_DOG = (0.3, -1.5)


def shot_c(f):
    k = f - 165; t = k / 30.0
    face = "surprised" if k < 19 else "smile"
    human("shrug_cmu141", k + 1, C_LOC, -math.pi / 2, face)
    dd = dog(0, (C_DOG[0], C_DOG[1], 0), yaw_to(C_DOG, C_LOC), "happy", t)   # noqa: F821
    D.happy_wag(dd["arm"], t, 1.0, 4.6, up=0.25)                         # noqa: F821
    ground_dog(0)                                                        # noqa: F821
    orbit(k, 85, (0.1, -2.05, 1.42), (1.05, -1.05, 0.98), 24, 22, rise=0.08)   # noqa: F821


SHOTS = {"A": shot_a, "B": shot_b, "C": shot_c}


def frame(f):
    reset()                                                              # noqa: F821
    s = next(k for k, (a, b) in SH.items() if a <= f < b)
    SHOTS[s](f)
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)              # noqa: F821


def shoe_low():
    dg = bpy.context.evaluated_depsgraph_get(); ev = PM.body.evaluated_get(dg); mw = ev.matrix_world
    return min((mw @ v.co).z for v in ev.data.vertices)


names = list(SH) if SHOT == "all" else [SHOT]
for s in names:
    a, b = SH[s]
    if XMODE == "board":
        out = os.path.join(KV, "review", "board"); os.makedirs(out, exist_ok=True)
        for tag, f in (("a", a + 2), ("m", (a + b) // 2), ("z", b - 2)):
            frame(f); render(os.path.join(out, f"{s}_{tag}.png"), (540, 960))   # noqa: F821
    elif XMODE == "frames":
        out = os.path.join(KV, "review", "anim", s); os.makedirs(out, exist_ok=True)
        for f in range(a, b, STEP):
            frame(f); render(os.path.join(out, f"{f:05d}.png"), (270, 480))   # noqa: F821
    elif XMODE == "final":
        out = os.path.join(KV, "renders", "frames"); os.makedirs(out, exist_ok=True)
        for f in range(a, b):
            p = os.path.join(out, f"{f:05d}.png")
            if not os.path.exists(p):
                frame(f); render(p, (1080, 1920))                         # noqa: F821
    elif XMODE == "feet":
        rows = []
        for f in range(a, b):
            frame(f)
            rows.append((f, shoe_low(), float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min())))   # noqa: F821
        txt = f"{s}: human lowest vertex {min(r[1] for r in rows):+.3f}..{max(r[1] for r in rows):+.3f} m; " \
              f"dog lowest vertex {min(r[2] for r in rows):+.3f}..{max(r[2] for r in rows):+.3f} m\n" + \
              "\n".join(f"{f} {h:+.3f} {d:+.3f}" for f, h, d in rows)
        open(os.path.join(KV, "review", f"feet_{s}.txt"), "w").write(txt + "\n"); print(txt.splitlines()[0])

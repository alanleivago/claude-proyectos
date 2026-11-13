"""zaw-dog #7 "Your Dog Knows When You're Lying" - shots, run INSIDE the approved zaw-dog-05 kit through its exec mode,
ONE FRESH BLENDER PER SHOT (copied from zaw-dog-06/shots.py, the latest approved pipeline):
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-07/shots.py <mode> [beat ...]
  mode: board (1 frame -> review/raw/<beat>.png + review/beats.json), ends (first/last -> review/ends/),
        frames <beat> [step] (-> review/anim/<beat>/), feet (review/feet_check.txt), iso (self-check -> review/iso/)
Cast (kit v6, as-is): the owner (the "liar") + the mailman (the stranger). Mocap: k_point_forward (owner bake),
z7_mail_point (Kimodo point_forward baked on the mailman), c_*_idle, k_sad_slump. Set: the kit living room only, the
#6 v1 pixel sky behind the windows. Props: the kit's Flow-photo lofted steel bowls (food / empty)."""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

Z7 = os.path.join(ROOT, "pieces", "zaw-dog-07")                        # noqa: F821  (ROOT, K, D, cam, dog ... from build.py)
Z6 = os.path.join(ROOT, "pieces", "zaw-dog-06")                        # noqa: F821
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

XA = ARGS[2:]                                                           # noqa: F821
XMODE = XA[0] if XA else "board"
T7 = json.load(open(os.path.join(Z7, "voice", "timing.json")))
FPS7 = 30
CUT7 = [max(0, round((s - 0.15) * FPS7)) if i else 0 for i, s in enumerate(T7["starts"])] + [round(T7["end"] * FPS7)]
END7 = CUT7[-1]
WL = [[w for w in T7["words"] if w["line"] == i] for i in range(len(T7["starts"]))]


def wf(line, idx, pre=0.08):
    return round((WL[line][idx]["s"] - pre) * FPS7)


_g0, _g1 = WL[0][2]["e"], WL[0][3]["s"]                                # the hero bark: in the gap after "knows"
BARK7 = round((_g0 + 0.1) * FPS7) / FPS7

# ---------------------------------------------------------------- set dressing (same kit fixes as #6)
_pic = bpy.data.objects["pic1"]; _pic.data.materials.clear(); _pic.data.materials.append(mtex("pic_dog"))   # noqa: F821
box("tv_cab_top", (1.66, 0.5, 0.03), (0, LY0 + 0.25, 0.555), CT, 2.0)  # noqa: F821
for n_ in ("tv", "tv_screen"):
    bpy.data.objects[n_].location.z += 0.03
for n_, xy in (("dogbed", (1.85, -1.9)), ("dogbed_c", (1.85, -1.9))):
    o_ = bpy.data.objects[n_]; o_.location.x, o_.location.y = xy
for n_ in ("towel_lump", "toy_bone"):
    hide(bpy.data.objects[n_], True)                                    # noqa: F821  (toy_bone is a flat floor card: off)
for n_ in ("mirror", "mirror_f"):                                       # #6 board-v3 fix: a real framed picture, not the box "mirror"
    hide(bpy.data.objects[n_], True)                                    # noqa: F821
_PF = mcol("#3B2716"); _PW, _PH, _PB, _PD = 0.5, 0.717, 0.055, 0.05      # noqa: F821
_PX, _PY, _PZ = LX0 + 0.0, -2.0, 1.55                                   # noqa: F821
box("pf_back", (0.012, _PW + 0.01, _PH + 0.01), (_PX + 0.006, _PY, _PZ - (_PH + 0.01) / 2), mcol("#1E1610"))   # noqa: F821
for nm_, sz_, cy_, cz_ in (("pf_top", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ + _PH / 2), ("pf_bot", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ - _PH / 2 - _PB),
                           ("pf_l", (_PD, _PB, _PH), _PY - _PW / 2 - _PB / 2, _PZ - _PH / 2), ("pf_r", (_PD, _PB, _PH), _PY + _PW / 2 + _PB / 2, _PZ - _PH / 2)):
    box(nm_, sz_, (_PX + _PD / 2, cy_, cz_), _PF)                       # noqa: F821
PIC_IMG = bpy.data.images.load(os.path.join(Z6, "tex", "pic_beagle_desk.png")); PIC_IMG.pack()
K.plane("pf_photo", _PW, _PH, (_PX + 0.031, _PY, _PZ), rot=(math.pi / 2, 0, math.pi / 2), mat=K.mat_image("pf_photo_m", PIC_IMG, emit_only=False))   # noqa: F821

# the #6 final sky (v1 photo, pixelated + saturated) and the softer grass
SWAP = {"sky.png": "sky_v1px.png", "grass.png": "grass_soft.png"}
_new = {k: bpy.data.images.load(os.path.join(Z6, "tex", v)) for k, v in SWAP.items()}
for im_ in _new.values():
    im_.pack()
for m_ in bpy.data.materials:
    if m_.node_tree:
        for n_ in m_.node_tree.nodes:
            if n_.type == "TEX_IMAGE" and n_.image and os.path.basename(n_.image.filepath) in SWAP:
                n_.image = _new[os.path.basename(n_.image.filepath)]
                if n_.image.name.startswith("sky_v1px"):
                    n_.interpolation = "Closest"
DAY_IMG = _new["sky.png"]

# ---------------------------------------------------------------- the cast (kit v6, .blend as-is)
CAST = {}
for s_ in ("owner", "mailman"):
    P_ = HU.Human(s_)
    P_.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
    P_.ik = {}
    for sd in "LR":
        tg = K.link(bpy.data.objects.new(f"{s_}_ik{sd}", None))     # noqa: F821
        c_ = P_.rig.pose.bones[f"lowerarm02.{sd}"].constraints.new("IK"); c_.target = tg; c_.chain_count = 4; c_.influence = 0.0
        P_.ik[sd] = (c_, tg)
    P_.show(False); P_.place((0, -40, 0)); CAST[s_] = P_
OWN, MAIL = CAST["owner"], CAST["mailman"]
ACT7 = {k: HU.load_action(k) for k in ("c_owner_idle", "k_point_forward", "k_sad_slump", "c_mailman_idle", "z7_mail_point")}
FINGER_OPEN = 0.65


def hpose(P, act, f, loc, yaw, face="neutral", sh=None):
    a = ACT7[act]; P.show(True); P.place(loc, yaw); P.play(a)
    a0, a1 = a.frame_range
    sc.frame_set(int(min(max(round(f), a0), a1)))                       # noqa: F821
    vals = [(pb, pb.rotation_quaternion.copy(), pb.location.copy()) for pb in P.rig.pose.bones]
    P.rig.animation_data.action = None
    for pb, q, l_ in vals:
        pb.rotation_quaternion = q; pb.location = l_
    for pb in P.rig.pose.bones:
        if pb.name.startswith("finger"):
            pb.rotation_quaternion = pb.rotation_quaternion.slerp(Quaternion((1, 0, 0, 0)), FINGER_OPEN)
    for c_, _ in P.ik.values():
        c_.influence = 0.0
    P.face(face)
    if sh is not None:
        bpy.context.view_layer.update(); r = P.bone_world("root")
        cshadow(sh, r.x, r.y, 0.0, 0.62, 0.5, yaw)                     # noqa: F821
    return P


def reach(P, sd, pt, k=1.0):
    c_, tg = P.ik[sd]; tg.location = Vector(pt); c_.influence = k


def head_c(P):
    bpy.context.view_layer.update()
    return P.bone_world("head").lerp(P.bone_world("head", tail=True), 0.35)


POINT_SD = {}


def point_at(P, act, f, loc, yaw, target, face, sh, k=1.0):
    """the Kimodo point clip at frame f, then the pointing arm (the one the clip raises) is aimed by IK at `target`
    (a bowl on the floor): the wrist goes 0.55 m from the shoulder along the shoulder->target line."""
    dy = (yaw_to(loc, target) - yaw + math.pi) % (2 * math.pi) - math.pi   # noqa: F821  the body turns 45 % toward the target
    hpose(P, act, f, loc, yaw + 0.45 * dy, face, sh)
    bpy.context.view_layer.update()
    if P.name not in POINT_SD:
        POINT_SD[P.name] = max("LR", key=lambda s: P.bone_world(f"wrist.{s}").z)
    sd = POINT_SD[P.name]; s_ = P.bone_world(f"upperarm01.{sd}")
    d_ = (Vector(target) - s_).normalized()
    reach(P, sd, s_ + d_ * 0.55, k)
    if P.name == "owner":                                               # a real pointing hand (the mailman keeps his letters)
        point_hand(P, sd, k)
    return sd


ROLL = float(os.environ.get("Z7_ROLL", "1.4"))


def point_hand(P, sd, k=1.0):
    """index straight, middle/ring/pinky curled (the clip's relaxed curl x3 about its own axis), thumb tucked, and the
    palm rolled toward the floor (wrist about its bone axis)."""
    for pb in P.rig.pose.bones:
        if not (pb.name.startswith("finger") and pb.name.endswith(sd)):
            continue
        n = int(pb.name[6])
        q0 = pb.rotation_quaternion.copy()
        if n == 2:
            q = Quaternion((1, 0, 0, 0))
        else:
            ax, an = q0.to_axis_angle(); f_ = 3.0 if n == 1 else 8.0   # (hpose already opened the curl 65 %)
            q = Quaternion(ax, min(1.5, an * f_)) if an > 1e-4 else q0
        pb.rotation_quaternion = q0.slerp(q, k)
    pw = P.rig.pose.bones[f"wrist.{sd}"]
    pw.rotation_quaternion = pw.rotation_quaternion @ Quaternion((0, 1, 0), ROLL * k * (1 if sd == "R" else -1))


def ease7(x):
    x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)


def fx(t, shake=0.0, snap=None, whip=None):
    """#6 camera accents: shake (smooth handheld), snap=(t0, lens factor), whip=(rad, dur) settling from the cut."""
    yaw = pitch = roll = 0.0
    if shake:
        yaw += 0.6 * shake * (0.65 * math.sin(2 * math.pi * 0.8 * t) + 0.35 * math.sin(2 * math.pi * 1.55 * t + 1.0))
        pitch += 0.6 * shake * (0.6 * math.sin(2 * math.pi * 1.0 * t + 2.0) + 0.4 * math.sin(2 * math.pi * 1.7 * t))
        roll += 0.6 * shake * 0.6 * math.sin(2 * math.pi * 0.7 * t + 0.5)
    if whip:
        yaw += whip[0] * (1 - ease7(t / whip[1])) ** 2
    if yaw or pitch or roll:
        from mathutils import Euler
        bpy.context.view_layer.update()
        CAM.matrix_world = CAM.matrix_world @ Euler((pitch, yaw, roll)).to_matrix().to_4x4()   # noqa: F821
    if snap and t >= snap[0]:
        CAM.data.lens *= 1 + (snap[1] - 1) * ease7((t - snap[0]) / 0.12)  # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def ccam(t, d, p0, p1, a0, a1, l0=22, l1=None, e=1.0):
    u = ease7(t / d) if e == 1.0 else 1 - (1 - min(1.0, t / d)) ** e
    l1 = l0 if l1 is None else l1
    cam(lerpv(p0, p1, u), lerpv(a0, a1, u), l0 + (l1 - l0) * u)        # noqa: F821


def bark_jaw(dd, t, t0, amp=0.5):
    b = (t - t0) / 0.2
    if 0 <= b <= 1:
        D.rot(dd["arm"], "jaw", (1, 0, 0), amp * math.sin(math.pi * b))   # noqa: F821
        D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.25 * math.sin(math.pi * b))])   # noqa: F821


TXT["kyoto"] = K.Letters3D("t_kyoto", "KYOTO, 2015", size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)   # noqa: F821

# ---------------------------------------------------------------- staging (living room, coffee table out)
OWNP = (0.0, 0.72)                     # the owner behind the two bowls, facing the dog (-y)
FOODB = (-0.62, -0.12); EMPTYB = (0.62, -0.12)   # food on the owner's RIGHT: the clip points with the right arm
DOGS0 = (0.0, -1.0)                    # the dog's sitting spot, facing the owner
MAILP = (-0.98, 0.72)                  # the mailman, the owner's right, nearer the food bowl
OWN_YAW = yaw_to(OWNP, (0.0, -2.0))    # noqa: F821
BOWL_PT_F = (FOODB[0], FOODB[1], 0.05); BOWL_PT_E = (EMPTYB[0], EMPTYB[1], 0.05)


def room(bowls="FE"):
    for o in LR_CT:                                                     # noqa: F821
        hide(o, True)                                                   # noqa: F821
    if "F" in bowls:
        put(BOWL_F, (FOODB[0], FOODB[1], 0))                            # noqa: F821
    if "E" in bowls:
        put(BOWL_E, (EMPTYB[0], EMPTYB[1], 0))                          # noqa: F821


def dog_sit_at(p, look, expr, t, wag=0.0):
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, look), expr, t)              # noqa: F821
    if wag:
        D.happy_wag(dd["arm"], t, wag, 3.0, up=0.0)                     # noqa: F821  (wag first: it resets the hips)
    sit_grounded(0)                                                     # noqa: F821
    return dd


def dog_go(t, t0, dur, p0, bowl, expr, rate=2.0, eat_expr=None):
    """the dog trots from p0 to the bowl (eased), then eats from it (nose in the bowl)."""
    u = ease7((t - t0) / dur) if t > t0 else 0.0
    stop = (bowl[0] + (p0[0] - bowl[0]) * 0.0, bowl[1])
    yaw = yaw_to(p0, bowl)                                              # noqa: F821
    if u < 1.0:
        dv = Vector((bowl[0] - p0[0], bowl[1] - p0[1], 0)); L_ = dv.length - 0.55
        p = Vector((p0[0], p0[1], 0)) + dv.normalized() * L_ * u
        dd = dog(0, (p.x, p.y, 0), yaw, expr, t)                        # noqa: F821
        if t > t0:
            dog_walk(0, t, rate)                                        # noqa: F821
        ground_dog(0)                                                   # noqa: F821
        return dd, False
    dd = dog(0, (stop[0], stop[1], 0), yaw, eat_expr or expr, t)        # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25)]); D.move(dd["arm"], "chest", (0, 0, -0.12))   # noqa: F821
    D.rot(dd["arm"], "jaw", (1, 0, 0), 0.12 + 0.1 * math.sin(2 * math.pi * 4 * t)); nose_at(0, bowl, -0.02); ground_dog(0)   # noqa: F821
    return dd, True


# ================================================================ beats (t = s into the beat, d = beat length)
def b01a(t, d):   # LEVEL dog height, push-in; the dog faces us, suspicious; the owner grins behind; SNAP-ZOOM on the hero bark
    room("")
    T0 = t
    hpose(OWN, "c_owner_idle", 1 + t * 30, (0.38, 0.62), yaw_to((0.38, 0.62), (0.1, -2.0)), "smile", sh=3)   # noqa: F821
    dd = dog_sit_at((-0.12, -0.45), (-0.05, -2.6), "judging", t)
    bark_jaw(dd, T0, BARK7)
    ccam(t, d, (-0.1, -2.05, 0.5), (-0.12, -1.6, 0.5), (0.05, 0.2, 0.6), (-0.04, 0.0, 0.55), 22, e=1.6)
    fx(t, snap=(BARK7 - 0.03, 1.14))


def b01b(t, d):   # HUMAN height, orbit + rise: his lying grin, the dog's head low in the foreground
    room("")
    t1 = (BY7["01b"][1] - BY7["01a"][1]) / FPS7 + t
    hpose(OWN, "c_owner_idle", 1 + t1 * 30, (0.38, 0.62), yaw_to((0.38, 0.62), (0.1, -2.0)), "smile", sh=3)   # noqa: F821
    dd = dog_sit_at((-0.12, -0.45), (0.38, 0.62), "judging", t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.2)])                      # noqa: F821
    hc = head_c(OWN)
    orbit(t, d, (hc.x - 0.55, hc.y - 1.25, hc.z - 0.05), (hc.x - 0.1, hc.y, hc.z - 0.22), 26, 26, rise=0.12)   # noqa: F821


def b02a(t, d):   # gentle HIGH over the dog's shoulder, push-in: he points at the FOOD bowl
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3, ease7(t / 0.25))
    dog_sit_at(DOGS0, OWNP, "happy", t, wag=0.7)
    ccam(t, d, (0.55, -2.1, 1.25), (0.4, -1.65, 1.15), (-0.2, 0.2, 0.55), (-0.25, 0.1, 0.5), 22, e=1.5)


def b02b(t, d):   # LEVEL low, a FOLLOW from the right: the dog runs straight over to the food and eats; WHIP-in
    room("FE")
    point_at(OWN, "k_point_forward", 50, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3)
    dd, eat = dog_go(t, 0.0, 0.62, DOGS0, FOODB, "happy", 2.4)
    D.happy_wag(dd["arm"], t, 0.8, 4.0, up=0.0)                         # noqa: F821
    ccam(t, d, (-2.0, -1.75, 0.5), (-1.7, -1.2, 0.47), (0.0, -0.8, 0.3), (-0.55, -0.15, 0.25), 22, e=1.4)
    fx(t, whip=(-0.25, 0.22))


def b03a(t, d):   # TOP-DOWN insert on the two bowls (full | empty), a slow crane rotate; KYOTO, 2015
    room("FE")
    u = ease7(t / d)                                                    # the frame's long side across the two bowls (roll 90 deg)
    cam((0.0, -0.32 + 0.08 * u, 1.5 - 0.2 * u), (0.0, -0.12, 0.0), 22, roll=math.radians(90 - 12 + 24 * u))   # noqa: F821
    text_at("kyoto", t, 0.12, 0.08, 0.0, 1.0, 0.6)                       # noqa: F821  (small, top of frame)


def b03b(t, d):   # HUMAN height 3/4, push-in: he points at the EMPTY bowl (smile); the dog trots to it
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_E, "smile", 3, ease7(t / 0.25))
    dd, eat = dog_go(t, 0.35, 0.75, DOGS0, EMPTYB, "happy", 2.0, eat_expr="neutral")
    if not eat:
        D.happy_wag(dd["arm"], t, 0.7, 3.5, up=0.0)                     # noqa: F821
    ccam(t, d, (-1.15, -1.95, 1.5), (-0.85, -1.5, 1.35), (0.2, 0.0, 0.7), (0.3, -0.05, 0.6), 22, e=1.4)


def b04a(t, d):   # LEVEL behind the empty bowl: nose in it ... nothing; looks up into the lens, shocked -> judging; SNAP; red cross
    room("FE")
    look = ease7((t - 0.25) / 0.2)
    dd = dog(0, (EMPTYB[0], EMPTYB[1], 0), yaw_to(DOGS0, EMPTYB), "shocked" if t < 0.6 else "judging", t)   # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.1 * (1 - look) - 0.05 * look)])   # noqa: F821
    nose_at(0, EMPTYB, 0.0 * (1 - look) + 0.12 * look); ground_dog(0)  # noqa: F821
    ccam(t, d, (EMPTYB[0] + 0.15, EMPTYB[1] + 1.05, 0.5), (EMPTYB[0] + 0.12, EMPTYB[1] + 0.8, 0.48), (EMPTYB[0], EMPTYB[1] - 0.5, 0.35), (EMPTYB[0], EMPTYB[1] - 0.5, 0.4), 24)
    fx(t, snap=(0.27, 1.22))
    text_at("x", t, 0.3, 0.27, 0.5, 1.0, 0.6)                           # noqa: F821


def b04b(t, d):   # gentle HIGH from the side, orbit: he points at the food again ... the dog sits and does not move
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3, ease7(t / 0.2))
    dog_sit_at(DOGS0, OWNP, "judging", t)
    orbit(t, d, (1.45, -1.55, 1.2), (-0.05, -0.3, 0.6), 22, 22, rise=0.1)   # noqa: F821


def b04c(t, d):   # HUMAN height face close-up, fast push: smile -> SCARED (gasp #1)
    room("FE")
    point_at(OWN, "k_point_forward", 50, OWNP, OWN_YAW, BOWL_PT_F, "smile" if t < 0.3 else "scared", 3)
    hc = head_c(OWN)
    ccam(t, d, (hc.x - 0.2, hc.y - 1.0, hc.z + 0.02), (hc.x - 0.04, hc.y - 0.62, hc.z), (hc.x, hc.y, hc.z - 0.1), (hc.x, hc.y, hc.z - 0.08), 30, e=1.6)
    fx(t, shake=0.006)


def b05a(t, d):   # HUMAN height, WHIP-in + push: the mailman points at the food; the owner beside him, scared
    room("FE")
    point_at(MAIL, "z7_mail_point", 25 + t * 25, MAILP, yaw_to(MAILP, (0.2, -2.0)), BOWL_PT_F, "smile", 2, ease7(t / 0.3))   # noqa: F821
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWNP, OWN_YAW, "scared", sh=3)
    dog_sit_at(DOGS0, MAILP, "neutral", t)
    ccam(t, d, (-0.55, -1.75, 1.55), (-0.65, -1.3, 1.5), (-0.75, 0.6, 1.0), (-0.85, 0.6, 1.05), 22, e=1.5)
    fx(t, whip=(0.25, 0.22))


def b05b(t, d):   # LEVEL low, a FOLLOW from the left as the dog sprints to the food: off they went
    room("FE")
    point_at(MAIL, "z7_mail_point", 50, MAILP, yaw_to(MAILP, (0.2, -2.0)), BOWL_PT_F, "smile", 2)   # noqa: F821
    hpose(OWN, "c_owner_idle", 30 + t * 30, OWNP, OWN_YAW, "scared", sh=3)
    dd, eat = dog_go(t, 0.0, 0.9, DOGS0, FOODB, "happy", 2.6)
    D.happy_wag(dd["arm"], t, 0.9, 4.2, up=0.0)                         # noqa: F821
    ccam(t, d, (-0.6, 0.5, 0.62), (-0.58, 0.38, 0.58), (0.1, -1.0, 0.35), (-0.25, -0.5, 0.3), 22, e=1.4)   # (from behind the food bowl: it runs at us)


MD = (-0.68, 0.16)                       # the dog sits at the mailman's feet, looking up at him


def b06a(t, d):   # CRANE up from dog height: the dog sits at the mailman's feet, wagging, looking up; he laughs
    room("FE")
    hpose(MAIL, "c_mailman_idle", 1 + t * 30, MAILP, yaw_to(MAILP, (-0.4, -2.0)), "smile" if t < 0.6 else "laughing", sh=2)   # noqa: F821
    dog_sit_at((-0.62, 0.3), (-0.3, -2.0), "happy", t, wag=0.9)         # beaming by his leg, facing us
    ccam(t, d, (-0.5, -0.62, 0.45), (-0.55, -0.95, 1.3), (-0.64, 0.3, 0.42), (-0.82, 0.6, 1.15), 22, e=1.3)   # crane from its face up to his laugh


def b06b(t, d):   # HUMAN height face push: the owner, surprised -> crying (gasp #2)
    room("FE")
    hpose(OWN, "c_owner_idle", 40 + t * 30, OWNP, yaw_to(OWNP, (-0.6, -2.0)), "surprised" if t < 0.35 else "crying", sh=3)   # noqa: F821
    hc = head_c(OWN)
    ccam(t, d, (hc.x - 0.25, hc.y - 1.05, hc.z), (hc.x - 0.08, hc.y - 0.65, hc.z - 0.02), (hc.x, hc.y, hc.z - 0.1), (hc.x, hc.y, hc.z - 0.08), 30, e=1.6)
    fx(t, snap=(0.35, 1.1))


def b06c(t, d):   # gentle HIGH pull-out that rises: the dog leans happily on the mailman; behind, the owner slumps, crying
    room("FE")
    hpose(MAIL, "c_mailman_idle", 20 + t * 30, MAILP, yaw_to(MAILP, MD), "laughing", sh=2)   # noqa: F821
    hpose(OWN, "k_sad_slump", 10 + t * 18, (0.5, 0.75), yaw_to((0.5, 0.75), (-0.3, -2.0)), "crying", sh=3)   # noqa: F821
    dd = dog_sit_at((-0.62, 0.3), (-0.3, -2.0), "happy", t, wag=0.9)   # beside his legs, facing us, beaming
    ccam(t, d, (-0.1, -1.55, 1.15), (-0.12, -2.05, 1.45), (-0.15, 0.4, 0.75), (-0.17, 0.4, 0.7), 22, 20)


C = CUT7
BEATS7 = [  # name, f0, f1, fn, board fraction
    ("01a", 0, round(_g1 * FPS7) - 2, b01a, 0.8), ("01b", round(_g1 * FPS7) - 2, C[1], b01b, 0.6),
    ("02a", C[1], wf(1, 4), b02a, 0.6), ("02b", wf(1, 4), C[2], b02b, 0.75),
    ("03a", C[2], wf(2, 3), b03a, 0.6), ("03b", wf(2, 3), C[3], b03b, 0.6),
    ("04a", C[3], wf(3, 2), b04a, 0.8), ("04b", wf(3, 2), wf(3, 5), b04b, 0.6), ("04c", wf(3, 5), C[4], b04c, 0.75),
    ("05a", C[4], wf(4, 3), b05a, 0.6), ("05b", wf(4, 3), C[5], b05b, 0.4),
    ("06a", C[5], wf(5, 5), b06a, 0.6), ("06b", wf(5, 5), wf(5, 8) + 4, b06b, 0.7), ("06c", wf(5, 8) + 4, END7, b06c, 0.5),
]
BY7 = {b[0]: b for b in BEATS7}


def reset7():
    reset()                                                             # noqa: F821
    for P in CAST.values():
        P.show(False); P.place((0, -40, 0))
        for c_, _ in P.ik.values():
            c_.influence = 0.0


def frame7(beat, f):
    name, f0, f1, fn, _ = beat
    reset7(); fn((f - f0) / FPS7, (f1 - f0) / FPS7)
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def people_low7():
    dg = bpy.context.evaluated_depsgraph_get(); out = {}
    for s_, P in CAST.items():
        if P.body.hide_render:
            continue
        ev = P.body.evaluated_get(dg); mw = ev.matrix_world
        out[s_] = min((mw @ v.co).z for v in ev.data.vertices)
    return out


def dog_bowl_gap():
    """min distance of the dog's mesh to each bowl's axis minus the bowl radius (negative = inside the steel)."""
    dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg); out = {}   # noqa: F821
    for nm, b in (("food", FOODB), ("empty", EMPTYB)):
        r = ((P_[:, 0] - b[0]) ** 2 + (P_[:, 1] - b[1]) ** 2) ** 0.5
        m = P_[:, 2] < 0.07
        out[nm] = float((r[m] - 0.11).min()) if m.any() else 9.0
    return out


names = XA[1:] if XMODE in ("board", "ends", "feet") and len(XA) > 1 else [b[0] for b in BEATS7]
if XMODE == "board":
    out = os.path.join(Z7, "review", "raw"); os.makedirs(out, exist_ok=True)
    for n in names:
        b = BY7[n]; f = round(b[1] + b[4] * (b[2] - b[1])); frame7(b, f); render(os.path.join(out, f"{n}.png"), (540, 960))   # noqa: F821
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS7}, open(os.path.join(Z7, "review", "beats.json"), "w"), indent=1)
elif XMODE == "ends":
    out = os.path.join(Z7, "review", "ends"); os.makedirs(out, exist_ok=True)
    for n in names:
        b = BY7[n]
        frame7(b, b[1]); render(os.path.join(out, f"{n}_a.png"), (360, 640))   # noqa: F821
        frame7(b, b[2] - 1); render(os.path.join(out, f"{n}_b.png"), (360, 640))   # noqa: F821
elif XMODE == "frames":
    b = BY7[XA[1]]; step = int(XA[2]) if len(XA) > 2 else 1
    out = os.path.join(Z7, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        frame7(b, f); render(os.path.join(out, f"{f:05d}.png"), (270, 480))   # noqa: F821
elif XMODE == "feet":
    rows = []
    for n in names:
        b = BY7[n]; pl, dl, bg = [], [], []
        for f in range(b[1], b[2], 2):
            frame7(b, f); pl.append(people_low7())
            if not DOGS[0]["o"].hide_render:                            # noqa: F821
                dl.append(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()))   # noqa: F821
                bg.append(min(dog_bowl_gap().values()))
        line = f"{n}:" + (f" dog lowest {min(dl):+.3f}..{max(dl):+.3f} m, dog-bowl gap min {min(bg):+.3f} m" if dl else "")
        for s_ in sorted({k for p_ in pl for k in p_}):
            v_ = [p_[s_] for p_ in pl if s_ in p_]; line += f" | {s_} lowest {min(v_):+.3f}..{max(v_):+.3f} m"
        rows.append(line); print("FEET", line)
    open(os.path.join(Z7, "review", "feet_check.txt"), "a").write("\n".join(rows) + "\n")
elif XMODE == "iso":
    # self-check BEFORE the board: each human isolated (key pose: front / side / head front, 3/4, profile / both hands)
    # and the dog isolated (front, side, face close-up, sitting, eating) on the bare kit floor
    out = os.path.join(Z7, "review", "iso"); os.makedirs(out, exist_ok=True)
    for tag, P, act, f, fc, tgt in (("owner_point", OWN, "k_point_forward", 50, "smile", (0.62, -0.84, 0.05)),
                                    ("owner_scared", OWN, "c_owner_idle", 20, "scared", None),
                                    ("owner_slump", OWN, "k_sad_slump", 40, "crying", None),
                                    ("mailman_point", MAIL, "z7_mail_point", 50, "smile", (0.62, -0.84, 0.05)),
                                    ("mailman_idle", MAIL, "c_mailman_idle", 20, "laughing", None)):
        reset7(); room(""); loc = (0.0, 0.0)
        if tgt:
            sd = point_at(P, act, f, loc, 0.0, tgt, fc, 3)
        else:
            hpose(P, act, f, loc, 0.0, fc, sh=3); sd = "R"
        bpy.context.view_layer.update(); r = P.bone_world("root"); hc = head_c(P)
        views = [("front", (r.x, r.y - 2.2, 1.0), (r.x, r.y, 0.9), 26), ("side", (r.x + 2.4, r.y, 1.0), (r.x, r.y, 0.9), 26),
                 ("head_f", (hc.x, hc.y - 0.75, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_34", (hc.x + 0.55, hc.y - 0.55, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_side", (hc.x + 0.78, hc.y, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35)]
        for s2 in "LR":
            bpy.context.view_layer.update(); w_ = P.bone_world(f"wrist.{s2}", tail=True)
            views.append((f"hand{s2}", (w_.x + (0.3 if s2 == "L" else -0.3), w_.y - 0.5, w_.z + 0.08), tuple(w_), 35))
        views.append(("handR_side", (w_.x + 0.45, w_.y - 0.1, w_.z + 0.1), tuple(w_), 35))
        for v, cp, aim, lens in views:
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "point arm", sd, "lowest", round(people_low7().get(P.name, 9), 3))
    for tag, fn in (("dog_sit", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "judging", 0.3)),
                    ("dog_shocked", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "shocked", 0.3)),
                    ("dog_eat", lambda: (put(BOWL_F, (0.0, -0.55, 0)), dog_go(2.0, 0.0, 0.5, (0.0, 0.6), (0.0, -0.55), "happy")))):   # noqa: F821
        reset7(); room(""); fn(); bpy.context.view_layer.update(); hd = dog_head(0)   # noqa: F821
        for v, cp, aim, lens in (("front", (0.0, -1.6, 0.5), (0.0, 0.0, 0.35), 26), ("side", (1.6, 0.0, 0.5), (0.0, 0.0, 0.35), 26),
                                 ("face", (hd.x, hd.y - 0.6, hd.z), tuple(hd), 35)):
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "dog lowest", round(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()), 3))   # noqa: F821

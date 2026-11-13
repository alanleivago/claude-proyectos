"""zaw-dog #6 "Your Dog Is Stressed Because You Are" - shots, run INSIDE the approved zaw-dog-05 kit (every set, dog v2,
PS1 snap, flat light) through its exec mode, ONE FRESH BLENDER PER SHOT:
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-06/shots.py <mode> [beat ...]
  mode: board (1 frame -> review/raw/<beat>.png + review/beats.json), ends (first/last -> review/ends/),
        frames <beat> [step] (-> review/anim/<beat>/), feet (review/feet_check.txt), iso (cast self-check -> review/iso/),
        final <f0> <f1> (1080x1920 -> renders/frames/)
Kit v5 cast (styles/zawdog/humans): owner, businesswoman (the boss), mailman, scientist. Mocap = baked clips
(styles/zawdog/motions/baked: k_* Kimodo, z6_* baked for this video, c_*_idle). Each human is posed from its clip at a
frame and the action is then dropped (hpose), so code can add IK reaches (hands on props) on top."""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Quaternion, Vector

Z6 = os.path.join(ROOT, "pieces", "zaw-dog-06")                        # noqa: F821  (ROOT, K, D, cam, dog ... from build.py)
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

XA = ARGS[2:]                                                           # noqa: F821
XMODE = XA[0] if XA else "board"
T6 = json.load(open(os.path.join(Z6, "voice", "timing.json")))
FPS6 = 30
CUT6 = [max(0, round((s - 0.15) * FPS6)) if i else 0 for i, s in enumerate(T6["starts"])] + [round(T6["end"] * FPS6)]
END6 = CUT6[-1]
WL = [[w for w in T6["words"] if w["line"] == i] for i in range(len(T6["starts"]))]


def wf(line, idx, pre=0.08):
    """frame where word idx of line (0-based) starts (a cut just before it)."""
    return round((WL[line][idx]["s"] - pre) * FPS6)


def ws(line, idx):
    return WL[line][idx]["s"]


# the hero bark: in the comma gap after "stressed,"
_g0, _g1 = WL[0][3]["e"], WL[0][4]["s"]
BARK6 = round((_g0 + 0.1) * FPS6) / FPS6

# ---------------------------------------------------------------- set dressing (all kit sets; no new set)
_pic = bpy.data.objects["pic1"]; _pic.data.materials.clear(); _pic.data.materials.append(mtex("pic_dog"))   # noqa: F821
box("tv_cab_top", (1.66, 0.5, 0.03), (0, LY0 + 0.25, 0.555), CT, 2.0)  # noqa: F821  (kit-v3 review fix)
for n_ in ("tv", "tv_screen"):
    bpy.data.objects[n_].location.z += 0.03
for n_, xy in (("dogbed", (1.85, -1.9)), ("dogbed_c", (1.85, -1.9))):
    o_ = bpy.data.objects[n_]; o_.location.x, o_.location.y = xy
hide(bpy.data.objects["towel_lump"], True)                             # noqa: F821  the loose blue box on the rug (#5's park towel lump: its
#                                                                         parent line was commented out in build.py, so it sat at (0.22, 0.1))
CT_TOP = [bpy.data.objects[n] for n in ("ct_top", "ct_shelf", "ct_leg0", "ct_leg1", "ct_leg2", "ct_leg3")]

# ---------------------------------------------------------------- the cast (kit v5)
CAST = {}
for s_ in ("owner", "businesswoman", "mailman", "scientist"):
    P_ = HU.Human(s_)
    P_.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]   # characters wobble, the set does not
    P_.ik = {}
    for sd in "LR":
        tg = K.link(bpy.data.objects.new(f"{s_}_ik{sd}", None))     # noqa: F821
        c_ = P_.rig.pose.bones[f"lowerarm02.{sd}"].constraints.new("IK"); c_.target = tg; c_.chain_count = 4; c_.influence = 0.0
        P_.ik[sd] = (c_, tg)
    P_.show(False); P_.place((0, -40, 0)); CAST[s_] = P_
OWN, BOSS, MAIL, SCI = (CAST[k] for k in ("owner", "businesswoman", "mailman", "scientist"))
import bmesh  # noqa: E402
_bm = bmesh.new(); _bm.from_mesh(BOSS.body.data)                       # the briefcase (solid0-2 boxes) off: it clipped her thigh
bmesh.ops.delete(_bm, geom=[f for f in _bm.faces if f.material_index >= 4], context="FACES"); _bm.to_mesh(BOSS.body.data); _bm.free()
ACT6 = {k: HU.load_action(k) for k in ("c_owner_idle", "k_facepalm", "k_sad_slump", "z6_owner_startle", "z6_owner_elated",
                                         "walk_test", "c_businesswoman_idle", "z6_boss_fist", "c_mailman_idle",
                                         "c_scientist_idle", "z6_sci_point")}


FINGER_OPEN = 0.65


def hpose(P, act, f, loc, yaw, face="neutral", sh=None):
    """pose P from baked clip `act` at frame f (clamped), then drop the action so code can add IK on top."""
    a = ACT6[act]; P.show(True); P.place(loc, yaw); P.play(a)
    a0, a1 = a.frame_range
    sc.frame_set(int(min(max(round(f), a0), a1)))                       # noqa: F821
    vals = [(pb, pb.rotation_quaternion.copy(), pb.location.copy()) for pb in P.rig.pose.bones]
    P.rig.animation_data.action = None
    for pb, q, l_ in vals:
        pb.rotation_quaternion = q; pb.location = l_
    for pb in P.rig.pose.bones:                                          # v6.1: fingers 65 % back toward the open rest pose:
        if pb.name.startswith("finger"):                                 # the mocap curl read as stumps / fists at distance
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


def rotw(P, bn, axis_w, ang):
    """extra rotation of a pose bone about a WORLD axis (applied on top of the clip pose)."""
    bpy.context.view_layer.update(); pb = P.rig.pose.bones[bn]
    m = (P.rig.matrix_world @ pb.matrix).to_3x3().normalized()
    ax = (m.inverted() @ Vector(axis_w)).normalized()
    pb.rotation_quaternion = pb.rotation_quaternion @ Quaternion(ax, ang)


def fwd(P):
    y = P.rig.rotation_euler.z; return Vector((math.sin(y), -math.cos(y), 0))


def side(P):
    f = fwd(P); return Vector((-f.y, f.x, 0))                         # the person's LEFT


def hand_pt(P, sd, out=0.07):
    """the palm centre: the wrist tail pushed along the hand."""
    bpy.context.view_layer.update(); pb = P.rig.pose.bones[f"wrist.{sd}"]
    h_, t_ = P.rig.matrix_world @ pb.head, P.rig.matrix_world @ pb.tail
    return t_ + (t_ - h_).normalized() * out


def head_c(P):
    bpy.context.view_layer.update()
    return P.bone_world("head").lerp(P.bone_world("head", tail=True), 0.35)


# ---------------------------------------------------------------- look: the v1 sky (user, board v3: sky6 rejected) + softer grass
# The kit images are PACKED, so each swap loads a fresh image and assigns it to the nodes. The sky stays the #5 kit photo
# (tex/sky.png) used in v1; sky_v1seam.png is that photo with only a 6 % wrap-blend at its left/right edges (invisible seam fix
# for the hard strip where sky planes meet). The night photo, the front-door street view and the world colour are the kit's own.
SWAP = {"sky.png": "sky_v1px.png", "grass.png": "grass_soft.png"}   # v1 sky + seam fix, 1/3.5 res + 28 % saturation (user, final)
_new = {k: bpy.data.images.load(os.path.join(Z6, "tex", v)) for k, v in SWAP.items()}
for im_ in _new.values():
    im_.pack()
for m_ in bpy.data.materials:
    if m_.node_tree:
        for n_ in m_.node_tree.nodes:
            if n_.type == "TEX_IMAGE" and n_.image and os.path.basename(n_.image.filepath) in SWAP:
                n_.image = _new[os.path.basename(n_.image.filepath)]
                if n_.image.name.startswith("sky_v1px"):
                    n_.interpolation = "Closest"                         # the pixels read, never blurred
DAY_IMG = _new["sky.png"]                                               # build.set_night() swaps DAY_IMG back in: rebind it

# ---------------------------------------------------------------- props
GLASS = K.mat_color("z6_glass", "#CFE6F0")                              # noqa: F821
HAIR_M = mcol("#5A3A22"); HAIR_D = mcol("#1E1A18")                      # noqa: F821
VIAL = K.link(bpy.data.objects.new("z6_vial", None))                    # noqa: F821
_v = frustum("z6_vial_g", 0.014, 0.014, 0.11, (0, 0, -0.02), GLASS, seg=8); _v.parent = VIAL   # noqa: F821
_vc = frustum("z6_vial_c", 0.016, 0.016, 0.02, (0, 0, 0.09), mcol("#D0302A"), seg=8); _vc.parent = VIAL   # noqa: F821
_vh = box("z6_vial_h", (0.012, 0.012, 0.06), (0, 0, -0.005), HAIR_M); _vh.parent = VIAL   # noqa: F821
# the rack (v6.1, readable): two labelled trays of standing test tubes, each with a hair tuft inside - front tray 58 dog
# samples (red caps, brown tufts), back tray 58 owner samples (blue caps, dark tufts)
RACK = K.link(bpy.data.objects.new("z6_rack", None))                    # noqa: F821
for g_, (y0_, cap_, hair_) in enumerate(((-0.11, "#D0302A", HAIR_M), (0.11, "#2F5FD0", HAIR_D))):
    tr_ = box(f"z6_tray{g_}", (0.82, 0.17, 0.03), (0, y0_, 0), mcol("#F2F2EE")); tr_.parent = RACK   # noqa: F821
    for k_ in range(58):
        x_ = -0.385 + (k_ % 29) * 0.0275; y_ = y0_ - 0.035 + (k_ // 29) * 0.07
        for nm_, r_, h_, z_, mt_ in (("g", 0.0105, 0.075, 0.03, GLASS), ("c", 0.012, 0.016, 0.105, mcol(cap_)), ("h", 0.006, 0.04, 0.035, hair_)):
            o_ = frustum(f"z6_rv{g_}_{k_}{nm_}", r_, r_, h_, (x_, y_, z_), mt_, seg=6); o_.parent = RACK   # noqa: F821
# the giant hair strand (v6.1, reads as A HAIR): a tapered, gently curved strand with a root bulb, on the bare wood floor;
# cortisol = glowing bands along it (one per month)
STRAND = K.link(bpy.data.objects.new("z6_strand", None))               # noqa: F821
_N = 16; _L = 3.4
_pts = [Vector((_L * i / _N, 0.18 * math.sin(math.pi * i / _N * 1.3), 0.0)) for i in range(_N + 1)]
for i in range(_N):
    a_, b_ = _pts[i], _pts[i + 1]; r0 = 0.048 * (1 - i / _N * 0.82); r1 = 0.048 * (1 - (i + 1) / _N * 0.82)
    sg = frustum(f"z6_hs{i}", r0, r1, (b_ - a_).length + 0.004, (0, 0, 0), HAIR_M, seg=8); sg.parent = STRAND   # noqa: F821
    sg.matrix_basis = Matrix.Translation(a_ + Vector((0, 0, r0))) @ (b_ - a_).to_track_quat("Z", "Y").to_matrix().to_4x4()
_bulb = frustum("z6_bulb", 0.075, 0.05, 0.13, (0, 0, 0), mcol("#E8D6C0"), seg=8); _bulb.parent = STRAND   # noqa: F821
_bulb.matrix_basis = Matrix.Translation(Vector((-0.11, 0, 0.06))) @ Vector((1, 0, 0)).to_track_quat("Z", "Y").to_matrix().to_4x4()
_BANDS = ["#FFE14A", "#FFB52E", "#FF7A1A", "#F24A1C", "#FFB52E", "#FFE14A"]
for k_, hx in enumerate(_BANDS):
    i = 2 + 2 * k_; a_, b_ = _pts[i], _pts[i + 1]; r0 = 0.048 * (1 - i / _N * 0.82) + 0.008
    o_ = frustum(f"z6_band{k_}", r0, r0, 0.07, (0, 0, 0), K.mat_color(f"z6_bandm{k_}", hx, emit_only=True), seg=8); o_.parent = STRAND   # noqa: F821
    o_.matrix_basis = Matrix.Translation(a_ + Vector((0, 0, r0 - 0.008))) @ (b_ - a_).to_track_quat("Z", "Y").to_matrix().to_4x4()
# activity tracker (v6.1): a black band AROUND the neck with a small device + green LED under the throat
TRACK = K.link(bpy.data.objects.new("z6_tracker", None))               # noqa: F821
_tb = frustum("z6_trk_band", 1.0, 1.0, 1.0, (0, 0, -0.5), mcol("#161616"), seg=12); _tb.parent = TRACK   # noqa: F821  (scaled per shot)
TRK_DEV = K.link(bpy.data.objects.new("z6_trk_dev", None))             # noqa: F821
_tk = box("z6_trk", (0.055, 0.03, 0.035), (0, 0, -0.0175), mcol("#2A2A2A")); _tk.parent = TRK_DEV   # noqa: F821
_tl = box("z6_trk_led", (0.012, 0.004, 0.012), (0.012, -0.017, 0.0), K.mat_color("z6_led", "#38F05A", emit_only=True)); _tl.parent = TRK_DEV   # noqa: F821
# bills (v6.1, big and readable): envelopes with an address strip and a red PAY NOW stamp
def bills_group(name, n, w=0.24, h=0.14, th=0.014, step=0.016, spin=0.14):
    root = K.link(bpy.data.objects.new(name, None))                     # noqa: F821
    for k_ in range(n):
        z_ = step * k_
        e_ = box(f"{name}_e{k_}", (w, h, th), (0.012 * math.sin(k_ * 2.3), 0.01 * math.cos(k_ * 1.7), z_), mcol("#F6F3EA" if k_ % 2 else "#EDE5D0"))   # noqa: F821
        e_.rotation_euler = (0, 0, spin * math.sin(k_ * 1.9)); e_.parent = root
        for nm_, sz_, off_, col_ in (("st", (0.05, 0.03), (0.07, 0.035), "#C8281E"), ("ad", (0.11, 0.012), (-0.03, -0.02), "#4A5A7A"), ("ad2", (0.09, 0.012), (-0.04, -0.042), "#4A5A7A")):
            s_ = box(f"{name}_{nm_}{k_}", (sz_[0], sz_[1], 0.002), (off_[0], off_[1], th + 0.0005), mcol(col_)); s_.parent = e_   # noqa: F821
    return root


BURDEN = bills_group("z6_burden", 7)
MINICAR = CAR.copy(); bpy.context.scene.collection.objects.link(MINICAR)  # noqa: F821
for c_ in CAR.children:                                                 # noqa: F821
    cc = c_.copy(); bpy.context.scene.collection.objects.link(cc); cc.parent = MINICAR
MINICAR.parent = BURDEN; MINICAR.scale = (0.04, 0.04, 0.04); MINICAR.location = (0.0, 0.0, 0.016 * 7 + 0.002); MINICAR.rotation_euler = (0, 0, 0.3)
HANDBILLS = bills_group("z6_handbills", 3, w=0.26, h=0.16, step=0.012, spin=0.25)
PROPS6 = [VIAL, RACK, STRAND, TRACK, TRK_DEV, BURDEN, HANDBILLS]

# board v3 review: the thing that read as a shapeless cut-out in 03a (~8 s) was the "mirror" left of the bookcase: a thin
# box with a dog photo wrapped round it by box UVs (fragments of the photo on every face). It is replaced by a proper framed
# picture: a solid wooden frame with depth (4 bevelled bars + backing), a new Flow photo (beagle at a desk full of bills,
# tex/pic_beagle_desk.png) on a single plane with correct UVs, set just inside the frame. (The Flow bookshelf and the
# magazine pile stay exactly as in the kit.)
for n_ in ("mirror", "mirror_f"):
    hide(bpy.data.objects[n_], True)                                    # noqa: F821
_PF = mcol("#3B2716"); _PW, _PH, _PB, _PD = 0.5, 0.717, 0.055, 0.05      # noqa: F821  inner w / h, bar width, depth
_PX, _PY, _PZ = LX0 + 0.0, -2.0, 1.55                                   # noqa: F821  on the left wall, same spot as the mirror
box("pf_back", (0.012, _PW + 0.01, _PH + 0.01), (_PX + 0.006, _PY, _PZ - (_PH + 0.01) / 2), mcol("#1E1610"))   # noqa: F821
for nm_, sz_, cy_, cz_ in (("pf_top", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ + _PH / 2), ("pf_bot", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ - _PH / 2 - _PB),
                           ("pf_l", (_PD, _PB, _PH), _PY - _PW / 2 - _PB / 2, _PZ - _PH / 2), ("pf_r", (_PD, _PB, _PH), _PY + _PW / 2 + _PB / 2, _PZ - _PH / 2)):
    box(nm_, sz_, (_PX + _PD / 2, cy_, cz_), _PF)                       # noqa: F821
for nm_, sz_, cy_, cz_ in (("pf_li_t", (0.006, _PW, 0.012), _PY, _PZ + _PH / 2 - 0.012), ("pf_li_b", (0.006, _PW, 0.012), _PY, _PZ - _PH / 2),
                           ("pf_li_l", (0.006, 0.012, _PH), _PY - _PW / 2 + 0.006, _PZ - _PH / 2), ("pf_li_r", (0.006, 0.012, _PH), _PY + _PW / 2 - 0.006, _PZ - _PH / 2)):
    box(nm_, sz_, (_PX + 0.034, cy_, cz_), mcol("#C9A227"))             # noqa: F821  a thin gold inner lip
PIC_IMG = bpy.data.images.load(os.path.join(Z6, "tex", "pic_beagle_desk.png")); PIC_IMG.pack()
_pm = K.mat_image("pf_photo_m", PIC_IMG, emit_only=False)               # noqa: F821
K.plane("pf_photo", _PW, _PH, (_PX + 0.031, _PY, _PZ), rot=(math.pi / 2, 0, math.pi / 2), mat=_pm)   # noqa: F821


# big yellow 3D texts (the whole word pops at once; pixelated edges in post)
for k_, v_ in (("swe", "SWEDEN, 2019"), ("n58", "58 DOGS\n58 OWNERS"), ("cort", "CORTISOL"), ("months", "MONTHS"),
               ("stress", "STRESSED"), ("calm", "CALM"), ("winter", "WINTER"), ("summer", "SUMMER"),
               ("act", "ACTIVITY"), ("pers", "PERSONALITY"), ("barely", "BARELY"),
               ("boss", "BOSS"), ("bills", "BILLS"), ("traffic", "TRAFFIC")):
    TXT[k_] = K.Letters3D(f"t_{k_}", v_, size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)   # noqa: F821


def reset6():
    reset()                                                             # noqa: F821
    for P in CAST.values():
        P.show(False); P.place((0, -40, 0))
        for c_, _ in P.ik.values():
            c_.influence = 0.0
    for o in PROPS6:
        o.location = (0, -40, 0); o.rotation_euler = (0, 0, 0); o.scale = (1, 1, 1); showkids(o, False)   # noqa: F821
    for o in CT_TOP:
        hide(o, False)                                                  # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, 0)                                 # noqa: F821


def put6(o, loc, rot=(0, 0, 0), s=1.0):
    o.location = loc; o.rotation_euler = rot; o.scale = (s, s, s); showkids(o, True)   # noqa: F821
    for c in o.children:
        showkids(c, True)                                               # noqa: F821


def ease6(x):
    x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)


def bark_jaw(dd, t, t0, amp=0.5):
    b = (t - t0) / 0.2
    if 0 <= b <= 1:
        D.rot(dd["arm"], "jaw", (1, 0, 0), amp * math.sin(math.pi * b))   # noqa: F821
        D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.25 * math.sin(math.pi * b))])   # noqa: F821


def lr_lab():
    for o in LR_CT:                                                     # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in CT_TOP:
        hide(o, True)                                                   # noqa: F821


# ================================================================ beats (t = s into the beat, d = beat length)
# v6.1 camera (user: same shot choices, MORE movement): faster push-ins, orbits with parallax, crane/rise moves, follow
# moves, a few motivated whip / snap-zoom accents on beats, a light handheld feel on the scared beats. Moves go in DEPTH
# over grass / rug (lateral pans over them crawl).
def fx(t, shake=0.0, snap=None, whip=None):
    """camera accents on top of the shot's move: shake (rad, smooth handheld), snap=(t0, lens factor) a snap-zoom eased
    in over 0.12 s, whip=(rad, dur) a whip-in that settles from `rad` of yaw to 0 over `dur` s from the cut."""
    yaw = pitch = roll = 0.0
    if shake:
        yaw += 0.6 * shake * (0.65 * math.sin(2 * math.pi * 0.8 * t) + 0.35 * math.sin(2 * math.pi * 1.55 * t + 1.0))   # (QA: slower + smaller: fewer pixel flip-flops)
        pitch += 0.6 * shake * (0.6 * math.sin(2 * math.pi * 1.0 * t + 2.0) + 0.4 * math.sin(2 * math.pi * 1.7 * t))
        roll += 0.6 * shake * 0.6 * math.sin(2 * math.pi * 0.7 * t + 0.5)
    if whip:
        yaw += whip[0] * (1 - ease6(t / whip[1])) ** 2
    if yaw or pitch or roll:
        from mathutils import Euler
        bpy.context.view_layer.update()                                  # (cam() set loc/rot: refresh matrix_world first)
        CAM.matrix_world = CAM.matrix_world @ Euler((pitch, yaw, roll)).to_matrix().to_4x4()   # noqa: F821
    if snap and t >= snap[0]:
        CAM.data.lens *= 1 + (snap[1] - 1) * ease6((t - snap[0]) / 0.12)  # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def ccam(t, d, p0, p1, a0, a1, l0=22, l1=None, e=1.0):
    """an eased camera move whose ease can be sharper (e > 1: faster in, settles), with a lens ramp."""
    u = ease6(t / d) if e == 1.0 else 1 - (1 - min(1.0, t / d)) ** e
    l1 = l0 if l1 is None else l1
    cam(lerpv(p0, p1, u), lerpv(a0, a1, u), l0 + (l1 - l0) * u)        # noqa: F821


# ---- L1 LIVING ROOM: the owner, stressed (Kimodo facepalm), the dog in front, sad; the hero bark in the gap
OWN_A = (0.45, 0.35)
DOG_A = (-0.2, -0.6)


def b01a(t, d):   # LEVEL dog height, full, a quick push-in; SNAP-ZOOM on the hero bark
    lr_lab()
    T0 = CUT6[0] / FPS6 + t
    hpose(OWN, "k_facepalm", 18 + t * 30, OWN_A, yaw_to(OWN_A, (0.2, -2.0)), "crying" if t > 0.75 else "neutral", sh=3)   # noqa: F821
    dd = dog(0, (DOG_A[0], DOG_A[1], 0), yaw_to(DOG_A, (-0.1, -2.6)), "shocked" if T0 >= BARK6 - 0.05 else "sad", t)   # noqa: F821
    bark_jaw(dd, T0, BARK6); ground_dog(0)                             # noqa: F821
    ccam(t, d, (-0.12, -1.95, 0.5), (-0.13, -1.72, 0.52), (0.05, 0.1, 0.6), (-0.02, 0.0, 0.6), 22, e=1.6)   # (v2 review: ends at a medium: whole dog + set)
    fx(t, snap=(BARK6 - 0.03, 1.12))


def b01b(t, d):   # HUMAN height, orbit with parallax + rise: his crying face, the dog looking up at him
    lr_lab()
    t1 = (BY6["01b"][1] - BY6["01a"][1]) / FPS6 + t
    hpose(OWN, "k_facepalm", 18 + t1 * 30, OWN_A, yaw_to(OWN_A, (0.2, -2.0)), "crying", sh=3)   # noqa: F821
    dd = dog(0, (DOG_A[0], DOG_A[1], 0), yaw_to(DOG_A, OWN_A), "sad", t)   # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.25)]); ground_dog(0)      # noqa: F821
    orbit(t, d, (-0.6, -1.35, 1.25), (0.3, 0.1, 1.05), 30, 22, rise=0.2)   # noqa: F821


# ---- L2 the "lab" (living room, coffee table out): the scientist with a hair vial, owner + dog
SCI_P = (-0.48, 0.35); OWN_L = (0.48, 0.3); DOG_L = (0.0, -0.45)


def b02a(t, d):   # HUMAN height, wide, a fast push-in craning down a touch; SWEDEN, 2019
    lr_lab()
    hpose(SCI, "z6_sci_point", 20 + t * 30, SCI_P, yaw_to(SCI_P, (0.4, -1.4)), "smile", sh=2)
    hp = hand_pt(SCI, "L", 0.05); put6(VIAL, hp)
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWN_L, yaw_to(OWN_L, (-0.3, -1.3)), "neutral", sh=3)
    dd = dog(0, (DOG_L[0], DOG_L[1], 0), yaw_to(DOG_L, (0.0, -2.6)), "neutral", t); sit_grounded(0)   # noqa: F821
    ccam(t, d, (0.0, -1.95, 1.6), (0.0, -1.3, 1.35), (0.0, 0.2, 1.0), (0.0, 0.2, 0.95), 20, e=1.5)
    text_at("swe", t, 0.25, 0.0, 0.74, 1.6, 0.9)                         # noqa: F821


def b02b(t, d):   # 50-deg HIGH insert, WHIP-IN on the cut, then a push down: two trays of hair-sample tubes; 58 DOGS / 58 OWNERS above them
    for o in LR_CT:                                                     # noqa: F821  (only the bare table top under the rack)
        if not o.name.startswith("ct_"):
            hide(o, True)                                               # noqa: F821
    put6(RACK, (0.0, 0.15, 0.455))
    ccam(t, d, (0.08, -0.32, 1.02), (0.03, -0.16, 0.86), (0.0, 0.14, 0.47), (0.0, 0.16, 0.47), 26, e=1.4)
    fx(t, whip=(0.3, 0.2))
    text_at("n58", t, 0.15, 0.0, 0.235, 0.55, 0.22)                         # noqa: F821  (top of frame, clear of the tubes)


# ---- L3 the giant hair strand on the wood floor (scale gag), the dog sniffs its root bulb
ST_LOC = (-1.0, -1.35, 0.0); DOG_ST = (-1.55, -1.75)


def strand_set():
    lr_lab(); put6(STRAND, ST_LOC, (0, 0, 0.04))


def b03a(t, d):   # LEVEL low, a dolly IN along the strand toward the dog at its root (depth move); CORTISOL at the word
    strand_set()
    dd = dog(0, (DOG_ST[0], DOG_ST[1], 0), yaw_to(DOG_ST, (ST_LOC[0] - 0.1, ST_LOC[1])), "neutral", t)   # noqa: F821
    na, ht = sniff_motion(t)                                            # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.45 + na)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.1), ((0, 0, 1), ht)]); ground_dog(0)   # noqa: F821
    ccam(t, d, (1.75, -1.75, 0.42), (0.65, -1.62, 0.36), (-1.0, -1.3, 0.12), (-1.5, -1.35, 0.16), 22, 24)
    tc = (ws(2, 5) - T6["starts"][2]) - (BY6["03a"][1] - CUT6[2]) / FPS6
    text_at("cort", t, max(0.1, tc), 0.0, 0.5, 1.6, 0.85)               # noqa: F821


def b03b(t, d):   # CRANE up fast into a high view of the whole hair, its month bands lit; MONTHS
    strand_set()
    dd = dog(0, (DOG_ST[0], DOG_ST[1], 0), yaw_to(DOG_ST, (0.3, -2.4)), "judging", t); ground_dog(0)   # noqa: F821
    ccam(t, d, (0.3, -1.9, 0.85), (0.0, -1.5, 2.3), (-0.6, -1.4, 0.0), (-0.3, -1.05, 0.0), 22, 18, e=1.5)
    text_at("months", t, 0.1, 0.0, 0.62, 1.6, 0.9)                       # noqa: F821


# ---- L4 / L5 living room: stressed pair, then calm pair
def b04(t, d):    # LEVEL 0.75 m, a fast push-in with a handheld edge: he hunches, crying; the dog shocked
    lr_lab()
    hpose(OWN, "k_facepalm", 40 + t * 30, (0.35, 0.3), yaw_to((0.35, 0.3), (-0.2, -2.0)), "crying", sh=3)   # noqa: F821
    dd = dog(0, (-0.45, -0.25, 0), yaw_to((-0.45, -0.25), (-0.2, -2.6)), "shocked", t); ground_dog(0)   # noqa: F821
    ccam(t, d, (-0.2, -1.95, 0.75), (-0.1, -1.25, 0.8), (0.0, 0.2, 0.85), (0.0, 0.2, 0.9), 22, e=1.6)
    fx(t, shake=0.006)
    text_at("stress", t, 0.12, 0.0, 0.62, 1.6, 0.8)                       # noqa: F821


def b05(t, d):    # gentle HIGH, a pull-out that rises (crane up and back): he bounces happily, the dog wags
    lr_lab()
    hpose(OWN, "z6_owner_elated", 1 + t * 30, (0.3, 0.3), yaw_to((0.3, 0.3), (-0.1, -2.0)), "laughing" if t > 0.6 else "smile", sh=3)   # noqa: F821
    dd = dog(0, (-0.5, -0.25, 0), yaw_to((-0.5, -0.25), (-0.3, -2.6)), "happy", t)   # noqa: F821
    D.happy_wag(dd["arm"], t, 0.6, 2.6, up=0.0); ground_dog(0)          # noqa: F821  (QA: the 4.6 Hz body wag read as trembling)
    ccam(t, d, (0.2, -1.15, 1.2), (0.3, -1.9, 1.75), (-0.05, 0.2, 0.7), (-0.05, 0.2, 0.62), 22, 20)
    text_at("calm", t, 0.12, -0.3, 0.72, 1.6, 0.9)                         # noqa: F821


# ---- L6 street: winter night walk on snow, summer day walk
SNOW_M = K.mat_color("z6_snow", "#F4F8FF", emit_only=True)           # noqa: F821
SNOW = [K.box(f"z6_snow{k}", (0.045, 0.045, 0.045), (0, -40, 0), SNOW_M) for k in range(80)]   # noqa: F821  (fewer, bigger, slower: QA flicker)
PROPS6 += SNOW
SNOW_G = mcol("#E6ECF4")                                                # noqa: F821  the snowed ground


def snow(t):
    """WINTER: big low-poly flakes falling slowly in a box in front of the camera."""
    rng = __import__("random").Random(6); bpy.context.view_layer.update(); m = CAM.matrix_world   # noqa: F821
    for o in SNOW:
        x, y, z0, v = rng.uniform(-1.6, 1.6), rng.uniform(-0.6, 3.0), rng.uniform(0, 3.2), rng.uniform(0.18, 0.3)
        z = (z0 - v * t) % 3.2 - 1.2
        o.location = m @ Vector((x * 0.7, z, -(1.4 + y))); o.rotation_euler = (t * 0.8 + x, y, 0); showkids(o, True)   # noqa: F821


def snow_ground():
    """WINTER: every grass / concrete / asphalt ground and the hedge tops of the street go white (snow-covered)."""
    for o in bpy.data.objects:
        if o.type == "MESH" and o.data.materials and abs(o.location.y - WALK_Y) < 12 and -30 < o.location.x < 30:   # noqa: F821
            for i_, m_ in enumerate(o.data.materials):
                if m_ and m_.node_tree and any(n_.type == "TEX_IMAGE" and n_.image and os.path.basename(n_.image.filepath).split(".")[0] in
                                              ("grass_soft", "concrete", "asphalt", "grass") for n_ in m_.node_tree.nodes):
                    o.data.materials[i_] = SNOW_G


def walk_pair(t, x0, night):
    """the owner (CMU walk) and the dog (code walk) side by side along the sidewalk toward +X."""
    set_night(night); street_warm(night)                               # noqa: F821
    a = ACT6["walk_test"]; n = int(a.frame_range[1] - a.frame_range[0])
    fr = 1 + (t * 30) % n
    hpose(OWN, "walk_test", fr, (x0, WALK_Y + 0.35), EAST, "neutral", sh=3)   # noqa: F821
    bpy.context.view_layer.update(); r = OWN.bone_world("root")
    dx = r.x - x0
    dd = dog(0, (x0 + dx + 0.35, WALK_Y - 0.25, 0), EAST, "neutral" if night else "happy", t)   # noqa: F821
    dog_walk(0, t, 1.0); ground_dog(0)                                 # noqa: F821
    sh_ = OWN.bone_world("upperarm01.R")                                # the right fist held low and out, holding the leash
    reach(OWN, "R", sh_ + fwd(OWN) * 0.12 - side(OWN) * 0.16 - Vector((0, 0, 0.52)))
    clip = collar_on(0); leash(clip, hand_pt(OWN, "R", 0.0), 0.12)      # noqa: F821
    return r


def b06a(t, d):   # LEVEL, a FOLLOW move: the camera leads them, backing away slower than they walk (they grow in frame); WINTER
    snow_ground()
    r = walk_pair(t, -3.6, True)
    cam((r.x + 2.3 - 0.45 * t, WALK_Y - 1.1, 0.6), (r.x + 0.35, WALK_Y + 0.05, 0.7), 22)   # noqa: F821
    text_at("winter", t, 0.1, 0.0, 0.8, 1.6, 0.9); snow(t)             # noqa: F821


def b06b(t, d):   # gentle HIGH, a follow + CRANE down from the other side; SUMMER
    r = walk_pair(t, -3.2, False)
    u = ease6(t / d)
    cam((r.x + 2.2 - 0.4 * t, WALK_Y - 1.3, 1.65 - 0.5 * u), (r.x + 0.3, WALK_Y + 0.05, 0.55), 22)   # noqa: F821
    text_at("summer", t, 0.1, -0.22, 0.92, 1.6, 0.9)                       # noqa: F821


# ---- L7 / L8 park: the activity collar, zoomies, then the deadpan stop
PK = (PX + 0.5, PY + 1.0)                                               # noqa: F821


def b07a(t, d):   # LEVEL, orbit with parallax + push on the collar band (green LED under the throat); ACTIVITY
    dd = dog(0, (PK[0], PK[1], 0), yaw_to(PK, (PK[0] - 0.3, PK[1] - 2)), "neutral", t); ground_dog(0)   # noqa: F821
    bpy.context.view_layer.update(); am = dd["arm"]; pb = am.pose.bones["neck"]
    h_, t_ = am.matrix_world @ pb.head, am.matrix_world @ pb.tail
    c = h_.lerp(t_, 0.5); ax = (t_ - h_).normalized(); yaw = dd["mv"].rotation_euler.z
    fw_ = Vector((math.sin(yaw), -math.cos(yaw), 0))
    put6(TRACK, c, (0, 0, 0)); TRACK.matrix_world = Matrix.Translation(c) @ ax.to_track_quat("Z", "Y").to_matrix().to_4x4() @ Matrix.Diagonal((0.108, 0.138, 0.045, 1))
    dn = fw_ * 0.75 + Vector((0, 0, -0.25)); dn = (dn - ax * ax.dot(dn)).normalized()   # the front of the neck ring (toward the lens)
    put6(TRK_DEV, c + dn * 0.125, (0, 0, 0)); TRK_DEV.matrix_world = Matrix.Translation(c + dn * 0.125) @ dn.to_track_quat("Z", "Y").to_matrix().to_4x4()
    u = ease6(t / d)
    orbit(t, d, (c.x + fw_.x * (1.05 - 0.3 * u) - 0.2, c.y + fw_.y * (1.05 - 0.3 * u), c.z - 0.05), (c.x, c.y, c.z - 0.06), 28, 38)   # noqa: F821
    text_at("act", t, 0.15, 0.0, 0.16, 0.45, 0.15)                       # noqa: F821


def b07b(t, d):   # zoomies: the camera RISES (crane) while it turns with the dog's circle - vertical move, little lateral sweep
    a = 1.2 + t * 1.5; R = 1.3
    cx, cy = PK[0], PK[1] + 0.6
    p = (cx + R * math.cos(a), cy + R * math.sin(a))
    tan = (-math.sin(a), math.cos(a))
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, (p[0] + tan[0], p[1] + tan[1])), "happy", t)   # noqa: F821
    dog_walk(0, t, 1.8); ground_dog(0)                                 # noqa: F821
    collar_on(0)                                                        # noqa: F821
    u = ease6(t / d)
    cam((cx, cy - 2.7 + 0.5 * u, 0.55 + 1.1 * u), (cx + 0.35 * (p[0] - cx), cy + 0.35 * (p[1] - cy), 0.3), 20)   # noqa: F821


def b08(t, d):    # LEVEL, a push-in with a SNAP-ZOOM on the dead stop; a red cross
    p = (PK[0], PK[1] + 0.2)
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, (p[0], p[1] - 2)), "judging", t); sit_grounded(0); collar_on(0)   # noqa: F821
    ccam(t, d, (p[0] + 0.1, p[1] - 2.3, 0.5), (p[0] + 0.05, p[1] - 1.7, 0.5), (p[0], p[1], 0.42), (p[0], p[1], 0.42), 24)
    fx(t, snap=(0.12, 1.28))
    text_at("x", t, 0.2, 0.2, 0.36, 1.0, 1.0)                            # noqa: F821


# ---- L9 / L10 living room: the owner's six faces flip; the dog's barely change
def b09(t, d):    # HUMAN height face close-up, a fast push with a small arc: neutral -> smile -> crying -> laughing -> surprised; PERSONALITY
    seq = ["neutral", "smile", "crying", "laughing", "surprised"]
    fc = seq[min(len(seq) - 1, int(t / (d / len(seq))))]
    lr_lab()
    hpose(OWN, "c_owner_idle", 1 + t * 30, (0.3, 0.2), yaw_to((0.3, 0.2), (0.1, -2.0)), fc)   # noqa: F821
    hc = head_c(OWN)
    ccam(t, d, (hc.x - 0.3, hc.y - 1.05, hc.z + 0.05), (hc.x - 0.02, hc.y - 0.62, hc.z), (hc.x, hc.y, hc.z - 0.1), (hc.x, hc.y, hc.z - 0.08), 30, e=1.5)
    text_at("pers", t, 0.1, 0.0, 0.19, 0.5, 0.2)                        # noqa: F821


def b10(t, d):    # LEVEL dog height, a wide orbit + push: the dog, a head tilt and a blank stare; BARELY
    lr_lab(); p = (-0.2, -0.3)
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, (p[0], p[1] - 2)), "neutral" if t < d * 0.55 else "judging", t)   # noqa: F821
    D.rot2(dd["arm"], "head", [((0, 1, 0), 0.25 * ease6(t / 0.5))]); sit_grounded(0)   # noqa: F821
    orbit(t, d, (p[0] + 0.1, p[1] - 1.45 + 0.4 * ease6(t / d), 0.52), (p[0], p[1], 0.48), -44, 24)   # noqa: F821
    text_at("barely", t, 0.15, 0.0, 0.78, 1.6, 0.9)                       # noqa: F821


# ---- L11 / L12 hallway front door: the boss yells (Kimodo fist), the mailman's bills; street: traffic
HALL_HIDE = [o for o in bpy.data.objects if o.name.startswith("facade_e")]
DOOR_OUT = (HX, 3.15)                                                   # noqa: F821  (on the porch)
OWN_H = (HX - 0.05, 1.45)                                               # noqa: F821


def b11a(t, d):   # HUMAN height over his shoulder, a fast push toward the boss with a handheld edge; BOSS
    [hide(o, True) for o in HALL_HIDE]                                  # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, 1.6)                               # noqa: F821
    hpose(BOSS, "z6_boss_fist", 10 + t * 30, DOOR_OUT, yaw_to(DOOR_OUT, OWN_H), "surprised", sh=2)   # noqa: F821
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWN_H, yaw_to(OWN_H, DOOR_OUT), "neutral", sh=3)   # noqa: F821
    ccam(t, d, (HX + 0.35, OWN_H[1] - 1.3, 1.62), (HX + 0.25, OWN_H[1] - 0.65, 1.6), (HX - 0.05, DOOR_OUT[1], 1.35), (HX - 0.05, DOOR_OUT[1], 1.45), 24, e=1.6)   # noqa: F821
    fx(t, shake=0.005)
    text_at("boss", t, 0.12, 0.0, 0.62, 1.6, 0.9)                        # noqa: F821


def b11b(t, d):   # over the boss's shoulder, a SNAP push to his SCARED face (gasp #1), handheld; he jumps back (Kimodo)
    [hide(o, True) for o in HALL_HIDE]                                  # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, 1.6)                               # noqa: F821
    t1 = (BY6["11b"][1] - BY6["11a"][1]) / FPS6 + t
    hpose(BOSS, "z6_boss_fist", 10 + t1 * 30, DOOR_OUT, yaw_to(DOOR_OUT, OWN_H), "surprised", sh=2)   # noqa: F821
    hpose(OWN, "z6_owner_startle", 2 + t * 30, OWN_H, yaw_to(OWN_H, DOOR_OUT), "scared", sh=3)   # noqa: F821  (user: the scared face, never the amused one)
    hc = head_c(OWN)
    ccam(t, d, (HX + 0.3, 3.9, 1.62), (HX + 0.22, 3.45, 1.6), (OWN_H[0], OWN_H[1], 1.35), (hc.x, hc.y, hc.z - 0.12), 24, 30, e=2.0)   # noqa: F821
    fx(t, shake=0.012)


def b12a(t, d):   # from the porch over the mailman's RIGHT shoulder, push + handheld: big bills held out; his face SCARED (gasp #2); BILLS
    [hide(o, True) for o in HALL_HIDE]                                  # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, 1.6)                               # noqa: F821
    mp = (HX + 0.1, 2.95); op = (HX - 0.02, 2.05)                       # noqa: F821
    hpose(MAIL, "c_mailman_idle", 1 + t * 30, mp, yaw_to(mp, op), "smile", sh=2)   # noqa: F821
    bpy.context.view_layer.update(); sh_ = MAIL.bone_world("upperarm01.R")
    k = ease6(t / 0.3)
    reach(MAIL, "R", sh_ + fwd(MAIL) * 0.45 - Vector((0, 0, 0.0)) - side(MAIL) * 0.22, k)   # bills up in front of his chest, clear of the bag
    bpy.context.view_layer.update(); hp_ = hand_pt(MAIL, "R", 0.06)
    put6(HANDBILLS, hp_ + Vector((0, 0, 0.02)), (math.pi / 2 - 0.25, 0.15, math.atan2(-(3.8 - hp_.y), (HX - 0.38) - hp_.x) + math.pi / 2), 1.45)   # noqa: F821  (faces the lens)
    hpose(OWN, "c_owner_idle", 1 + t * 30, op, yaw_to(op, mp), "scared" if t > 0.15 else "neutral", sh=3)   # noqa: F821
    ccam(t, d, (HX - 0.42, 4.1, 1.6), (HX - 0.36, 3.6, 1.56), (HX - 0.08, 2.4, 1.3), (HX - 0.06, 2.35, 1.38), 24, e=1.5)   # noqa: F821
    fx(t, shake=0.008)
    text_at("bills", t, 0.1, 0.0, 0.62, 1.6, 0.9)                        # noqa: F821


def b12b(t, d):   # LEVEL dog height: a WHIP pan following the car past, handheld; he jumps (Kimodo startle); TRAFFIC
    p = (0.0, WALK_Y + 0.3)                                             # noqa: F821
    hpose(OWN, "z6_owner_startle", 4 + t * 30, p, yaw_to(p, (-0.6, 3.0)), "scared", sh=3)   # noqa: F821
    dd = dog(0, (-0.55, WALK_Y - 0.2, 0), yaw_to((-0.55, WALK_Y - 0.2), (-0.9, 3.0)), "shocked", t); ground_dog(0)   # noqa: F821
    CAR.location = (-5.0 + 14.0 * t / d, 10.6, -0.04)                  # noqa: F821
    ccam(t, d, (-0.9, WALK_Y - 2.0, 0.55), (-0.7, WALK_Y - 1.55, 0.58), (-0.1, WALK_Y + 1.0, 0.9), (-0.15, WALK_Y + 1.0, 0.95), 22)   # noqa: F821
    fx(t, shake=0.01, whip=(-0.22, 0.25))
    text_at("traffic", t, 0.08, -0.25, 0.78, 1.6, 0.9)                     # noqa: F821


# ---- L13 / L14 living room: the dog carries it; he slumps home -> loop
def b13(t, d):    # gentle HIGH 3/4, the camera backs away just slower than the dog walks (follow in depth): a BIG stack of bills + the toy car on its back
    lr_lab(); p0, p1 = (0.7, 0.3), (-0.12, -0.5)
    u = t / d; p = (p0[0] + (p1[0] - p0[0]) * u, p0[1] + (p1[1] - p0[1]) * u)
    dd = dog(0, (p[0], p[1], 0), yaw_to(p0, p1), "sad", t)              # noqa: F821
    dog_walk(0, t, 0.55); ground_dog(0)                                # noqa: F821
    bpy.context.view_layer.update(); am = dd["arm"]; pb = am.pose.bones["hips"]
    back = (am.matrix_world @ pb.head).lerp(am.matrix_world @ am.pose.bones["neck"].head, 0.45)
    put6(BURDEN, back + Vector((0, 0, 0.07)), (0, 0, dd["mv"].rotation_euler.z), 1.5)
    fw_ = Vector((p1[0] - p0[0], p1[1] - p0[1], 0)).normalized(); rt = Vector((fw_.y, -fw_.x, 0))   # its right side
    cp = Vector((p[0], p[1], 0)) + rt * (0.95 - 0.15 * u) + fw_ * 0.55; cp.z = 1.05 - 0.1 * u
    cam(tuple(cp), (p[0] + fw_.x * 0.1, p[1] + fw_.y * 0.1, 0.5), 24)   # noqa: F821  (3/4 from its right side, high: the stack reads on the back)


def b14a(t, d):   # HUMAN height, a push-in that rises a little: he slumps (Kimodo sad slump), crying; the dog watches
    lr_lab(); p = (0.4, 0.3)
    hpose(OWN, "k_sad_slump", 8 + t * 15, p, yaw_to(p, (0.0, -2.0)), "crying", sh=3)   # noqa: F821
    dd = dog(0, (-0.35, -0.3, 0), yaw_to((-0.35, -0.3), p), "sad", t); ground_dog(0)   # noqa: F821
    ccam(t, d, (-0.35, -1.95, 0.85), (-0.15, -1.3, 1.0), (0.2, 0.2, 1.1), (0.25, 0.25, 1.2), 22, e=1.4)   # (low enough to see his bowed face)


def b14b(t, d):   # LEVEL close, orbit + push: the dog looks up at him, sad -> cut to 01a
    lr_lab(); p = (-0.35, -0.3); op = (0.4, 0.3)
    hpose(OWN, "k_sad_slump", 8 + (BY6["14b"][1] - BY6["14a"][1]) / FPS6 * 15 + t * 15, op, yaw_to(op, (0.0, -2.0)), "crying", sh=3)   # noqa: F821
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, op), "sad", t)     # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.3)]); sit_grounded(0)     # noqa: F821
    hd = dog_head(0)                                                    # noqa: F821
    dv = Vector((op[0] - p[0], op[1] - p[1], 0)).normalized(); pv = Vector((-dv.y, dv.x, 0))
    cp = hd + dv * (0.8 - 0.2 * ease6(t / d)) - pv * 0.3; cp.z = 0.6
    orbit(t, d, tuple(cp), (hd.x, hd.y, hd.z - 0.04), -15, 26)   # noqa: F821


C = CUT6
BEATS6 = [  # name, f0, f1, fn, board fraction
    ("01a", 0, round(_g1 * FPS6) - 2, b01a, 0.85), ("01b", round(_g1 * FPS6) - 2, C[1], b01b, 0.5),
    ("02a", C[1], wf(1, 5), b02a, 0.6), ("02b", wf(1, 5), C[2], b02b, 0.6),
    ("03a", C[2], wf(2, 6), b03a, 0.8), ("03b", wf(2, 6), C[3], b03b, 0.6),
    ("04", C[3], C[4], b04, 0.6), ("05", C[4], C[5], b05, 0.65),
    ("06a", C[5], wf(5, 4), b06a, 0.6), ("06b", wf(5, 4), C[6], b06b, 0.6),
    ("07a", C[6], wf(6, 8), b07a, 0.6), ("07b", wf(6, 8), C[7], b07b, 0.5),
    ("08", C[7], C[8], b08, 0.7), ("09", C[8], C[9], b09, 0.5), ("10", C[9], C[10], b10, 0.7),
    ("11a", C[10], wf(10, 3), b11a, 0.5), ("11b", wf(10, 3), C[11], b11b, 0.7),
    ("12a", C[11], wf(11, 2), b12a, 0.7), ("12b", wf(11, 2), C[12], b12b, 0.5),
    ("13", C[12], C[13], b13, 0.5),
    ("14a", C[13], wf(13, 7), b14a, 0.6), ("14b", wf(13, 7), END6, b14b, 0.5),
]
BY6 = {b[0]: b for b in BEATS6}


def frame6(beat, f):
    name, f0, f1, fn, _ = beat
    reset6(); fn((f - f0) / FPS6, (f1 - f0) / FPS6)
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def people_low6():
    dg = bpy.context.evaluated_depsgraph_get(); out = {}
    for s_, P in CAST.items():
        if P.body.hide_render:
            continue
        ev = P.body.evaluated_get(dg); mw = ev.matrix_world
        out[s_] = min((mw @ v.co).z for v in ev.data.vertices)
    return out


names = XA[1:] if XMODE in ("board", "ends", "feet") and len(XA) > 1 else [b[0] for b in BEATS6]
if XMODE == "board":
    out = os.path.join(Z6, "review", "raw"); os.makedirs(out, exist_ok=True)
    for n in names:
        b = BY6[n]; f = round(b[1] + b[4] * (b[2] - b[1])); frame6(b, f); render(os.path.join(out, f"{n}.png"), (540, 960))   # noqa: F821
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS6}, open(os.path.join(Z6, "review", "beats.json"), "w"), indent=1)
elif XMODE == "ends":
    out = os.path.join(Z6, "review", "ends"); os.makedirs(out, exist_ok=True)
    for n in names:
        b = BY6[n]
        frame6(b, b[1]); render(os.path.join(out, f"{n}_a.png"), (360, 640))   # noqa: F821
        frame6(b, b[2] - 1); render(os.path.join(out, f"{n}_b.png"), (360, 640))   # noqa: F821
elif XMODE == "frames":
    b = BY6[XA[1]]; step = int(XA[2]) if len(XA) > 2 else 1
    out = os.path.join(Z6, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        frame6(b, f); render(os.path.join(out, f"{f:05d}.png"), (270, 480))   # noqa: F821
elif XMODE == "feet":
    rows = []
    for n in names:
        b = BY6[n]; pl, dl = [], []
        for f in range(b[1], b[2], 2):
            frame6(b, f); pl.append(people_low6())
            if not DOGS[0]["o"].hide_render:                            # noqa: F821
                dl.append(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()))   # noqa: F821
        line = f"{n}:" + (f" dog lowest {min(dl):+.3f}..{max(dl):+.3f} m" if dl else "")
        for s_ in sorted({k for p_ in pl for k in p_}):
            v_ = [p_[s_] for p_ in pl if s_ in p_]; line += f" | {s_} lowest {min(v_):+.3f}..{max(v_):+.3f} m"
        rows.append(line); print(line)
    open(os.path.join(Z6, "review", "feet_check.txt"), "a").write("\n".join(rows) + "\n")
elif XMODE == "iso":
    # cast self-check: each human isolated in its key pose (front + side), nothing else in frame but the kit floor
    out = os.path.join(Z6, "review", "iso"); os.makedirs(out, exist_ok=True)
    ISO = [("owner_facepalm", OWN, "k_facepalm", 45, "crying", None), ("owner_startle", OWN, "z6_owner_startle", 20, "scared", None),
           ("owner_elated", OWN, "z6_owner_elated", 30, "laughing", None), ("owner_slump", OWN, "k_sad_slump", 60, "crying", None),
           ("owner_walk", OWN, "walk_test", 30, "neutral", None), ("boss_fist", BOSS, "z6_boss_fist", 40, "surprised", None),
           ("sci_point", SCI, "z6_sci_point", 45, "smile", "vial"), ("mail_bills", MAIL, "c_mailman_idle", 20, "smile", "reach")]
    for tag, P, act, f, fc, extra in ISO:
        reset6(); lr_lab(); loc = (0.0, 0.5)
        hpose(P, act, f, loc, 0.0, fc, sh=3)
        if extra == "vial":
            put6(VIAL, hand_pt(P, "L", 0.05))
        if extra == "reach":
            bpy.context.view_layer.update(); sh_ = P.bone_world("upperarm01.R")
            reach(P, "R", sh_ + fwd(P) * 0.5 - Vector((0, 0, 0.32)) - side(P) * 0.08, 1.0)
        bpy.context.view_layer.update(); r = P.bone_world("root")
        for v, cp in (("front", (r.x, r.y - 2.5, 1.0)), ("side", (r.x + 2.3, r.y, 1.0))):
            cam(cp, (r.x, r.y, 0.9), 26); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 640))     # noqa: F821
        print("ISO", tag, "lowest", round(people_low6().get(P.name, 9), 3))
elif XMODE == "iso2":
    # v6.1 self-check close-ups: head + neck (front, 3/4, profile), both hands, and a mid-distance full body, per cast human
    out = os.path.join(Z6, "review", "iso2"); os.makedirs(out, exist_ok=True)
    for tag, P, act, f, fc in (("owner", OWN, "c_owner_idle", 20, "scared"), ("businesswoman", BOSS, "c_businesswoman_idle", 20, "surprised"),
                               ("mailman", MAIL, "c_mailman_idle", 20, "smile"), ("scientist", SCI, "c_scientist_idle", 20, "smile")):
        reset6(); lr_lab(); hpose(P, act, f, (0.0, 0.5), 0.0, fc, sh=3); bpy.context.view_layer.update()
        hc = head_c(P); r = P.bone_world("root")
        shots_ = [("head_f", (hc.x, hc.y - 0.75, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                  ("head_34", (hc.x + 0.55, hc.y - 0.55, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                  ("head_side", (hc.x + 0.78, hc.y, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35)]
        for sd in "LR":
            hp_ = hand_pt(P, sd, 0.0); shots_.append((f"hand{sd}", (hp_.x + (0.25 if sd == "L" else -0.25), hp_.y - 0.45, hp_.z + 0.05), tuple(hp_), 35))
        shots_.append(("mid", (r.x + 0.6, r.y - 2.6, 1.2), (r.x, r.y, 0.95), 26))
        for v, cp, aim, lens in shots_:
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
elif XMODE == "final":
    a_, b_ = int(XA[1]), int(XA[2])
    out = os.path.join(Z6, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a_, min(b_, END6)):
        p_ = os.path.join(out, f"{f:05d}.png")
        if not os.path.exists(p_):
            frame6(next(x for x in BEATS6 if x[1] <= f < x[2]), f); render(p_, (1080, 1920))   # noqa: F821
if XMODE == "thumb":
    # thumbnail plate: the dog, wide-eyed, buried under a tall stack of bills + the toy car; behind, he rubs his face
    # (scared) while the boss shakes her fist at him.  thumb.py adds "IT'S YOUR STRESS".
    out = os.path.join(Z6, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset6(); lr_lab()
    hpose(OWN, "k_facepalm", 45, (0.25, 0.55), yaw_to((0.25, 0.55), (0.0, -2.0)), "scared", sh=3)
    hpose(BOSS, "z6_boss_fist", 62, (-0.75, 0.65), yaw_to((-0.75, 0.65), (0.25, 0.55)), "surprised", sh=2)
    dd = dog(0, (-0.05, -0.55, 0), yaw_to((-0.05, -0.55), (-1.4, -1.9)), "sad", 0.0); ground_dog(0)
    bpy.context.view_layer.update(); am = dd["arm"]
    back = (am.matrix_world @ am.pose.bones["hips"].head).lerp(am.matrix_world @ am.pose.bones["neck"].head, 0.45)
    put6(BURDEN, back + Vector((0, 0, 0.1)), (0, 0, dd["mv"].rotation_euler.z), 2.2)
    for k_ in range(9):                                                 # the tottering stack: more bills on top
        e_ = box(f"z6_tb{k_}", (0.32, 0.2, 0.025), (0, 0, 0), mcol("#F4F1E8" if k_ % 2 else "#E6DCC4"))   # noqa: F821
        e_.location = back + Vector((0.02 * math.sin(k_ * 1.7), 0.02 * math.cos(k_ * 1.3), 0.43 + 0.026 * k_)); e_.rotation_euler = (0, 0.05 * math.sin(k_), 0.3 * math.sin(k_ * 2.1))
    cam((0.2, -2.0, 1.15), (-0.3, -0.1, 0.72), 22)
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821
    render(os.path.join(out, "A.png"), (1080, 1920))                    # noqa: F821

"""zaw-dog #7 "Your Dog Knows When You're Lying" - shots v2 (board v2, 2026-11-13), run INSIDE the approved zaw-dog-05
kit through its exec mode, ONE FRESH BLENDER PER SHOT:
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-07/shots.py <mode> [beat ...]
  mode: board (1 frame -> review/raw/<beat>.png + review/beats.json), ends (first/last -> review/ends/),
        frames <beat> [step] (-> review/anim/<beat>/), feet (review/feet_check.txt), iso (self-check -> review/iso/)
v2 = the Zaw framing rules measured in fuentes/zawpolyshorts-style/planos/ENCUADRE.md (v1 kept in v1/shots_v1.py):
  - set scale 1.35 (build.py scale_set): furniture / rooms / doors 35 % bigger vs the dog and the people;
  - lens 25 mm; dog shots at 0.75-0.85 m camera height pitched 5-15 deg down, the dog 0.40-0.60 of the frame height
    (1.0-1.4 m away); people waist- or knee-up (0.65-1.0 m away, camera at chest height, head top ~0.2 from the top)
    or only an arm/hand entering the frame; no full-body people, no ceilings in dog shots, at most 1 upward shot;
  - TWO sets: the kit living room (lines 1-4) and the kit hallway + FRONT DOOR (open, porch + street) for the mailman;
  - fixes: owner pointing hand (index straight, three fingers fully curled, thumb tucked), the mailman points with his
    FREE left hand (letters stay in the right), sitting dog's head levelled (no howling / low-angle read), the 06c owner
    faces the camera crying, kit-v6 seams repaired for THIS video only (tex/<name>_body_fix.png from tools/fix_body.py:
    straight sleeve hem + collar line, skin toned to the face; hair strand shading; nothing shared is modified).
Cast (kit v6): owner + mailman. Mocap: k_point_forward (owner), c_*_idle. Props: the kit's steel bowls (full / empty)."""
import json
import math
import os
import sys

import bpy
from mathutils import Quaternion, Vector

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
SET7 = float(os.environ.get("Z7_SET_S", "1.35"))                        # ENCUADRE.md: set scale vs the characters
LENS = 25


def wf(line, idx, pre=0.08):
    return round((WL[line][idx]["s"] - pre) * FPS7)


_g0, _g1 = WL[0][2]["e"], WL[0][3]["s"]                                # the hero bark: in the gap after "knows"
BARK7 = round((_g0 + 0.1) * FPS7) / FPS7

# ---------------------------------------------------------------- set dressing (same kit fixes as #6), in SET units
_pic = bpy.data.objects["pic1"]; _pic.data.materials.clear(); _pic.data.materials.append(mtex("pic_dog"))   # noqa: F821
box("tv_cab_top", (1.66, 0.5, 0.03), (0, LY0 + 0.25, 0.555), CT, 2.0)  # noqa: F821
for n_ in ("tv", "tv_screen"):
    bpy.data.objects[n_].location.z += 0.03
for n_, xy in (("dogbed", (1.85, -1.9)), ("dogbed_c", (1.85, -1.9))):
    o_ = bpy.data.objects[n_]; o_.location.x, o_.location.y = xy
for n_ in ("towel_lump", "toy_bone", "mirror", "mirror_f", "h_bowl"):
    hide(bpy.data.objects[n_], True)                                    # noqa: F821
_PF = mcol("#3B2716"); _PW, _PH, _PB, _PD = 0.5, 0.717, 0.055, 0.05      # noqa: F821
_PX, _PY, _PZ = LX0 + 0.0, -2.0, 1.55                                   # noqa: F821
box("pf_back", (0.012, _PW + 0.01, _PH + 0.01), (_PX + 0.006, _PY, _PZ - (_PH + 0.01) / 2), mcol("#1E1610"))   # noqa: F821
for nm_, sz_, cy_, cz_ in (("pf_top", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ + _PH / 2), ("pf_bot", (_PD, _PW + 2 * _PB, _PB), _PY, _PZ - _PH / 2 - _PB),
                           ("pf_l", (_PD, _PB, _PH), _PY - _PW / 2 - _PB / 2, _PZ - _PH / 2), ("pf_r", (_PD, _PB, _PH), _PY + _PW / 2 + _PB / 2, _PZ - _PH / 2)):
    box(nm_, sz_, (_PX + _PD / 2, cy_, cz_), _PF)                       # noqa: F821
PIC_IMG = bpy.data.images.load(os.path.join(Z6, "tex", "pic_beagle_desk.png")); PIC_IMG.pack()
K.plane("pf_photo", _PW, _PH, (_PX + 0.031, _PY, _PZ), rot=(math.pi / 2, 0, math.pi / 2), mat=K.mat_image("pf_photo_m", PIC_IMG, emit_only=False))   # noqa: F821

SWAP = {"sky.png": "sky_v1px.png", "grass.png": "grass_soft.png"}      # the #6 final sky (v1 photo, pixelated) + softer grass
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
SKYO = [o for o in bpy.data.objects if o.type == "MESH" and any(m_ and m_.node_tree and any(n_.type == "TEX_IMAGE" and n_.image and n_.image.name.startswith("sky_v1px")
        for n_ in m_.node_tree.nodes) for m_ in o.data.materials)]           # the photo-sky planes of all kit sets
FACADE = [bpy.data.objects[n_] for n_ in ("facade_e0", "facade_e_eave")]   # the house front cuts through the kit hallway
_rmat = bpy.data.objects["rug_hd"].data.materials[0]                    # the hall runner's 'rug_soft' photo is blurry: use the
_rn = bpy.data.objects["runner"]; _rn.data.materials.clear(); _rn.data.materials.append(_rmat)   # living-room rug photo (sharp),
_uvl = _rn.data.uv_layers.active                                        # its long side along the runner (u = length, v = width)
for p_ in _rn.data.polygons:
    for li, vi in zip(p_.loop_indices, p_.vertices):
        c_ = _rn.matrix_world @ _rn.data.vertices[vi].co
        _uvl.data[li].uv = ((c_.y + 0.4 + 2.3) / 2.6, (c_.x - HX + 0.4) / 0.8)   # noqa: F821

# the front door: a panelled low-poly leaf (raised panels both faces, brass knob + rose) on the kit's photo slab, swinging
# with DOOR_PIV; the kit's stretched street photo outside the door is dropped (the 3D street + the #6 sky show instead)
_DG = mcol("#24452F"); _BR = mcol("#C9A24A")                            # noqa: F821
for sy_ in (-1, 1):
    for i_, (px_, pz_, ph_) in enumerate([(px, pz, ph) for px in (0.235, 0.665) for pz, ph in ((0.18, 0.52), (0.82, 0.5), (1.43, 0.46))]):
        o_ = K.box(f"door_pan{sy_}_{i_}", (0.3, 0.018, ph_), (0, 0, 0), _DG); o_.parent = DOOR_PIV   # noqa: F821
        o_.location = (px_, sy_ * 0.036, pz_ + ph_ / 2)
        for j_, (dx_, dz_, sx_, sz_) in enumerate(((0, ph_ / 2 - 0.012, 0.3, 0.024), (0, -ph_ / 2 + 0.012, 0.3, 0.024))):
            r_ = K.box(f"door_mold{sy_}_{i_}_{j_}", (sx_, 0.026, sz_), (0, 0, 0), mcol("#1A3323")); r_.parent = DOOR_PIV   # noqa: F821
            r_.location = (px_ + dx_, sy_ * 0.038, pz_ + ph_ / 2 + dz_)
    kn_ = K.box(f"door_rose{sy_}", (0.07, 0.012, 0.16), (0, 0, 0), _BR); kn_.parent = DOOR_PIV   # noqa: F821
    kn_.location = (0.81, sy_ * 0.037, 0.93)
    kb_ = K.box(f"door_knob{sy_}", (0.06, 0.05, 0.06), (0, 0, 0), _BR); kb_.parent = DOOR_PIV   # noqa: F821
    kb_.location = (0.81, sy_ * 0.06, 0.98)
hide(bpy.data.objects["h_out"], True)                                   # noqa: F821

TXT["kyoto"] = K.Letters3D("t_kyoto", "KYOTO, 2015", size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)   # noqa: F821
scale_set(SET7)                                                         # noqa: F821  (build.py; set objects keep set-unit .location)

# ---------------------------------------------------------------- the cast (kit v6) + #7-only seam repairs
CAST = {}


def fix_human(P):
    """#7 only, in memory: the repaired body texture (straight sleeve hem / collar, skin toned to the face) and strand
    shading on the hair mesh so it stops reading as a smooth cap."""
    fx_ = bpy.data.images.load(os.path.join(Z7, "tex", f"{P.name}_body_fix.png")); fx_.pack()
    P.msheet.node_tree.nodes["img"].image = fx_
    P.mface.node_tree.nodes["skin"].image = fx_
    nf = P.mface.node_tree; mk_ = nf.nodes["mask"]                       # softer face edge: mask^1.5 (the photo fades into
    lk_ = next(l_ for l_ in nf.links if l_.from_node == mk_)            # the toned skin sooner, no hard jaw line in 3/4)
    pw_ = nf.nodes.new("ShaderNodeMath"); pw_.operation = "POWER"; pw_.inputs[1].default_value = 1.5
    to_ = lk_.to_socket; nf.links.remove(lk_); nf.links.new(mk_.outputs[0], pw_.inputs[0]); nf.links.new(pw_.outputs[0], to_)
    mh = P.body.material_slots[2].material; nt = mh.node_tree; im = nt.nodes["img"]
    tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (90, 90, 14)
    nz = nt.nodes.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 1.0; nz.inputs["Detail"].default_value = 3.0
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.62; mr.inputs["To Max"].default_value = 1.2
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs[0].default_value = 1.0
    nt.links.new(tc.outputs["Object"], mp.inputs[0]); nt.links.new(mp.outputs[0], nz.inputs[0]); nt.links.new(nz.outputs[0], mr.inputs[0])
    nt.links.new(im.outputs[0], mx.inputs[6]); nt.links.new(mr.outputs[0], mx.inputs[7])
    for l_ in [l_ for l_ in nt.links if l_.from_node == im and l_.from_socket == im.outputs[0] and l_.to_node not in (mx,)]:
        to_ = l_.to_socket; nt.links.remove(l_); nt.links.new(mx.outputs[2], to_)


for s_ in ("owner", "mailman"):
    P_ = HU.Human(s_)
    fix_human(P_)
    P_.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
    P_.ik = {}
    for sd in "LR":
        tg = K.link(bpy.data.objects.new(f"{s_}_ik{sd}", None))     # noqa: F821
        c_ = P_.rig.pose.bones[f"lowerarm02.{sd}"].constraints.new("IK"); c_.target = tg; c_.chain_count = 4; c_.influence = 0.0
        P_.ik[sd] = (c_, tg)
    P_.show(False); P_.place((0, -40, 0)); CAST[s_] = P_
OWN, MAIL = CAST["owner"], CAST["mailman"]
ACT7 = {k: HU.load_action(k) for k in ("c_owner_idle", "k_point_forward", "c_mailman_idle")}
FINGER_OPEN = 0.65


def hpose(P, act, f, loc, yaw, face="neutral", sh=None, relax=FINGER_OPEN):
    a = ACT7[act]; P.show(True); P.place(loc, yaw); P.play(a)
    a0, a1 = a.frame_range
    sc.frame_set(int(min(max(round(f), a0), a1)))                       # noqa: F821
    vals = [(pb, pb.rotation_quaternion.copy(), pb.location.copy()) for pb in P.rig.pose.bones]
    P.rig.animation_data.action = None
    for pb, q, l_ in vals:
        pb.rotation_quaternion = q; pb.location = l_
    for pb in P.rig.pose.bones:
        if pb.name.startswith("finger"):
            pb.rotation_quaternion = pb.rotation_quaternion.slerp(Quaternion((1, 0, 0, 0)), relax)
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


CURL = {1: (0.55, 0.45, 0.3), 3: (1.35, 1.55, 1.1), 4: (1.4, 1.6, 1.1), 5: (1.45, 1.6, 1.1)}   # finger n -> segment angles
ROLL = float(os.environ.get("Z7_ROLL", "1.4"))
ROLL7 = os.environ.get("Z7_ROLL7", "1") == "1"                        # palm-down wrist roll in 02a / 03b


def point_hand(P, sd, k=1.0, roll=True):
    """a clear pointing hand: index straight, middle/ring/pinky FULLY curled (fixed angles about each finger's local +X),
    the thumb folded over them; the palm rolled toward the floor."""
    for pb in P.rig.pose.bones:
        if not (pb.name.startswith("finger") and pb.name.endswith(sd)):
            continue
        n, seg = int(pb.name[6]), int(pb.name[8])
        q0 = pb.rotation_quaternion.copy()
        if n == 2:
            q = Quaternion((1, 0, 0, 0))
        else:
            q = Quaternion((1, 0, 0), CURL[n][min(seg, 3) - 1])          # local +X = the curl (tested: -X claws, Z splays)
        pb.rotation_quaternion = q0.slerp(q, k)
    if roll:
        pw = P.rig.pose.bones[f"wrist.{sd}"]
        pw.rotation_quaternion = pw.rotation_quaternion @ Quaternion((0, 1, 0), ROLL * k * (1 if sd == "R" else -1))


def aim_arm(P, sd, target, k=1.0, reach_m=0.55):
    bpy.context.view_layer.update(); s_ = P.bone_world(f"upperarm01.{sd}")
    d_ = (Vector(target) - s_).normalized()
    reach(P, sd, s_ + d_ * reach_m, k)


def point_at(P, act, f, loc, yaw, target, face, sh, k=1.0, sd=None, roll=True):
    """owner: the Kimodo point clip at frame f, the arm it raises aimed by IK at `target`, a real pointing hand.
    mailman (sd='L'): his idle (letters in the right hand), the FREE left arm aimed at the target, a pointing hand."""
    dy = (yaw_to(loc, target) - yaw + math.pi) % (2 * math.pi) - math.pi   # noqa: F821  the body turns 45 % toward the target
    hpose(P, act, f, loc, yaw + 0.45 * dy, face, sh)
    bpy.context.view_layer.update()
    if sd is None:
        sd = max("LR", key=lambda s: P.bone_world(f"wrist.{s}").z)
    aim_arm(P, sd, (target[0], target[1], 0.55), k, 0.6)                # aim above the bowl: a clear forward point, not a dangle
    point_hand(P, sd, k, roll)
    aim_hand(P, sd, target, 0.85 * k)
    return sd


def aim_hand(P, sd, target, k=1.0):
    """bend the wrist so the hand (and its straight index) points AT the target, not along the lifted forearm."""
    bpy.context.view_layer.update()
    pb = P.rig.pose.bones[f"wrist.{sd}"]; h = P.bone_world(f"wrist.{sd}"); tl = P.bone_world(f"wrist.{sd}", tail=True)
    cur = (tl - h).normalized(); want = (Vector(target) - h).normalized()
    qw = Quaternion((1, 0, 0, 0)).slerp(cur.rotation_difference(want), k)
    mq = (P.rig.matrix_world @ pb.matrix).to_quaternion()
    pb.rotation_quaternion = pb.rotation_quaternion @ (mq.inverted() @ qw @ mq)


def droop(P, a=0.16):
    """the head hangs a little (crying, still facing the lens)."""
    for bn, f_ in (("neck01", 0.5), ("head", 0.5)):
        if bn in P.rig.pose.bones:
            pb = P.rig.pose.bones[bn]; pb.rotation_quaternion = Quaternion((1, 0, 0), a * f_) @ pb.rotation_quaternion


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


def zc(t, d, p0, p1, s0, s1, e=1.0):
    """Zaw camera: aim point p (x, y, z) and a state s = (azimuth deg, horizontal distance m, camera height m, lens):
    azimuth 0 = the camera on the -Y side of the aim looking +Y. Everything eased together (push / orbit / crane)."""
    u = ease7(t / d) if e == 1.0 else 1 - (1 - min(1.0, t / d)) ** e
    p = lerpv(p0, p1, u); az, dist, h, lens = lerpv(s0, s1, u)         # noqa: F821
    a = math.radians(az)
    cam((p[0] + dist * math.sin(a), p[1] - dist * math.cos(a), h), p, lens)   # noqa: F821


def bark_jaw(dd, t, t0, amp=0.5):
    b = (t - t0) / 0.2
    if 0 <= b <= 1:
        D.rot(dd["arm"], "jaw", (1, 0, 0), amp * math.sin(math.pi * b))   # noqa: F821
        nod(dd, -0.2 * math.sin(math.pi * b))


def nod(dd, a):
    """pitch the neck (+ = nose down) on top of the current pose."""
    arm = dd["arm"]; pb = arm.pose.bones["neck"]
    pb.rotation_quaternion = Quaternion(D.local_axis(arm, "neck", (1, 0, 0)), a) @ pb.rotation_quaternion   # noqa: F821


# ---------------------------------------------------------------- staging (WORLD metres; the set is scaled x SET7)
OWNP = (0.0, 0.55)                     # the owner in front of the (scaled) sofa, facing the dog (-y)
FOODB = (-0.55, -0.25); EMPTYB = (0.55, -0.25)   # food on the owner's RIGHT (the point clip raises the right arm)
DOGS0 = (0.0, -1.05)                   # the dog's sitting spot, facing the owner
OWN_YAW = yaw_to(OWNP, (0.0, -2.0))    # noqa: F821
BOWL_PT_F = (FOODB[0], FOODB[1], 0.05); BOWL_PT_E = (EMPTYB[0], EMPTYB[1], 0.05)
HXW, DOORY = sw((HX, 0.0))[0], sw((0.0, 2.5))[1]   # noqa: F821  the hallway centre line and the front door (world)
MAILP = (HXW - 0.12, DOORY + 0.28)    # the mailman on the doorstep, facing in (-y)
FOODH = (HXW + 0.3, DOORY - 0.75)      # the food bowl just inside the door, at his left (his free hand)
DOGH0 = (HXW - 0.05, DOORY - 3.6)      # the dog deep in the hallway
MDOG = (HXW + 0.38, DOORY - 0.28)      # the dog sitting at the mailman's feet, beside his left leg
OWNH = (HXW - 0.42, DOORY - 2.35)      # the owner in the hallway, back to the door


def room(bowls="FE"):
    for o in LR_CT:                                                     # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:
        hide(o, False)                                                  # noqa: F821
    for o in FACADE + RACK:                                             # noqa: F821
        hide(o, False)                                                  # noqa: F821
    if "F" in bowls:
        put(BOWL_F, (FOODB[0], FOODB[1], 0))                            # noqa: F821
    if "E" in bowls:
        put(BOWL_E, (EMPTYB[0], EMPTYB[1], 0))                          # noqa: F821


def hall(bowl=True, door=-1.75):
    for o in FACADE + RACK:                                             # noqa: F821  (+ the untextured shoe rack)
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:                                                      # side sky planes of other sets cut the clouds in
        hide(o, o.name in ("r_sky", "st_sky0", "st_sky1", "p_sky2", "p_sky3"))   # noqa: F821  the door view: hide them
    DOOR_PIV.rotation_euler = (0, 0, door)                              # noqa: F821  (the front door swung open, inside)
    if bowl:
        put(BOWL_F, (FOODH[0], FOODH[1], 0))                            # noqa: F821


def dog_sit_at(p, look, expr, t, wag=0.0, level=0.3):
    """sitting dog; `level` pitches the neck down on top of dog_sit (kit dog_sit lifts the head: it read as howling)."""
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, look), expr, t)              # noqa: F821
    if wag:
        D.happy_wag(dd["arm"], t, wag, 3.0, up=0.0)                     # noqa: F821  (wag first: it resets the hips)
    sit_grounded(0)                                                     # noqa: F821
    nod(dd, level)
    return dd


def dog_go(t, t0, dur, p0, bowl, expr, rate=2.0, eat_expr=None, stop=0.55):
    """the dog trots from p0 to the bowl (eased), then eats from it (nose in the bowl)."""
    u = ease7((t - t0) / dur) if t > t0 else 0.0
    yaw = yaw_to(p0, bowl)                                              # noqa: F821
    if u < 1.0:
        dv = Vector((bowl[0] - p0[0], bowl[1] - p0[1], 0)); L_ = dv.length - stop
        p = Vector((p0[0], p0[1], 0)) + dv.normalized() * L_ * u
        dd = dog(0, (p.x, p.y, 0), yaw, expr, t)                        # noqa: F821
        if t > t0:
            dog_walk(0, t, rate)                                        # noqa: F821
        ground_dog(0)                                                   # noqa: F821
        return dd, False
    dd = dog(0, (bowl[0], bowl[1], 0), yaw, eat_expr or expr, t)        # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25)]); D.move(dd["arm"], "chest", (0, 0, -0.12))   # noqa: F821
    D.rot(dd["arm"], "jaw", (1, 0, 0), 0.12 + 0.1 * math.sin(2 * math.pi * 4 * t)); nose_at(0, bowl, -0.02); ground_dog(0)   # noqa: F821
    return dd, True


# ================================================================ beats (t = s into the beat, d = beat length)
# framing numbers (lens 25 mm, sensor 36 mm vertical): frame height = 1.44 x distance. Dog sitting = 0.87 m tall.
def b01a(t, d):   # dog MFS -> MS (0.45 -> 0.6 of the frame), camera 0.8 m pitched down, push-in; owner cropped at the right edge; SNAP on the bark
    room("")
    hpose(OWN, "c_owner_idle", 1 + t * 30, (1.3, 0.75), yaw_to((1.3, 0.75), (0.2, -2.5)), "smile", sh=3)   # noqa: F821
    dd = dog_sit_at((0.0, -0.55), (0.0, -3.0), "judging", t)
    bark_jaw(dd, t, BARK7)
    zc(t, d, (0.0, -0.55, 0.55), (0.0, -0.55, 0.57), (-8, 1.35, 0.74, LENS), (-3, 1.02, 0.73, LENS), e=1.6)
    fx(t, snap=(BARK7 - 0.03, 1.14))


def b01b(t, d):   # owner knee-up -> waist-up (head top ~0.2 from the top), chest-height camera, orbit + push; the dog's head low in frame, side-eyeing him
    room("")
    t1 = (BY7["01b"][1] - BY7["01a"][1]) / FPS7 + t
    op = (0.98, 0.55)
    hpose(OWN, "c_owner_idle", 1 + t1 * 30, op, yaw_to(op, (0.5, -2.0)), "smile", sh=3)   # noqa: F821
    dog_sit_at((0.62, -0.02), op, "judging", t, level=0.0)
    zc(t, d, (op[0] - 0.12, op[1], 1.35), (op[0] - 0.05, op[1], 1.4), (-24, 1.05, 1.3, LENS), (-8, 0.85, 1.36, LENS))


def b02a(t, d):   # gentle HIGH beside his right arm: his POINTING HAND in the foreground, the food bowl, the dog sitting beyond, eager
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3, ease7(t / 0.25), roll=ROLL7)
    dog_sit_at(DOGS0, OWNP, "happy", t, wag=0.7)
    zc(t, d, (-0.05, -1.0, 0.5), (-0.03, -1.0, 0.5), (203, 1.95, 0.92, 28), (206, 1.78, 0.9, 28), e=1.5)   # beside his right hip: arm + hand in profile


def b02b(t, d):   # dog level (0.75 m) low behind the food bowl (foreground 0.6 m): the dog runs straight at us and eats; WHIP-in; his leg at the edge
    room("FE")
    point_at(OWN, "k_point_forward", 50, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3)
    dd, eat = dog_go(t, 0.0, 0.62, DOGS0, FOODB, "happy", 2.4)
    D.happy_wag(dd["arm"], t, 0.8, 4.0, up=0.0)                         # noqa: F821
    zc(t, d, (-0.22, -0.92, 0.45), (-0.5, -0.55, 0.36), (196, 1.25, 0.68, LENS), (192, 1.0, 0.64, LENS), e=1.4)
    fx(t, whip=(-0.25, 0.22))


def b03a(t, d):   # TOP-DOWN insert (long side along the room): full | empty bowl left / right, the dog's head at the bottom
    # looking up; his arm + POINTING HAND swing in from the top (0.6 m from the lens) to the EMPTY bowl on "pointed";
    # slow rotate + crane down; KYOTO, 2015
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_E, "smile", 3, ease7((t - 0.25) / 0.55))
    dog_sit_at((0.0, -0.95), OWNP, "happy", t, wag=0.6, level=-0.1)
    u = ease7(t / d)
    cam((0.02, -0.27 + 0.02 * u, 1.85 - 0.13 * u), (0.02, -0.2, 0.0), LENS, roll=math.radians(-10 + 20 * u))   # never exactly vertical: a dead-vertical look flipped 180 deg on frame 0   # noqa: F821
    text_at("kyoto", t, 0.12, 0.0, -0.1, 1.0, 0.6)                       # between the bowls, under the arm, above the caption                        # noqa: F821


def b03b(t, d):   # close on his POINTING HAND (0.7-0.9 m, from the side, hand in profile) over the EMPTY bowl; the dog trots in to it
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_E, "smile", 3, 0.35 + 0.65 * ease7(t / 0.45), roll=ROLL7)
    dd, eat = dog_go(t, 0.3, 0.8, DOGS0, EMPTYB, "happy", 2.0, eat_expr="neutral")
    if not eat:
        D.happy_wag(dd["arm"], t, 0.7, 3.5, up=0.0)                     # noqa: F821
    bpy.context.view_layer.update(); hw = OWN.bone_world("wrist.R", tail=True)
    a0 = hw.lerp(Vector((EMPTYB[0], EMPTYB[1], 0.3)), 0.4)
    zc(t, d, tuple(a0), tuple(a0 + Vector((0.03, -0.04, -0.03))), (-62, 1.0, 1.02, LENS), (-54, 0.86, 0.98, LENS), e=1.4)


def b04a(t, d):   # dog MS over the empty bowl: nose in it ... nothing; looks up into the lens, SHOCKED -> judging; SNAP; red cross
    room("FE")
    look = ease7((t - 0.25) / 0.2)
    yaw = yaw_to(DOGS0, EMPTYB)                                         # noqa: F821
    dd = dog(0, (EMPTYB[0], EMPTYB[1], 0), yaw, "shocked" if t < 0.6 else "judging", t)   # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.1 * (1 - look) + 0.12 * look)])   # noqa: F821
    nose_at(0, EMPTYB, 0.0 * (1 - look) + 0.12 * look); ground_dog(0)  # noqa: F821
    zc(t, d, (EMPTYB[0], EMPTYB[1] - 0.25, 0.5), (EMPTYB[0], EMPTYB[1] - 0.28, 0.54), (math.degrees(yaw) + 8, 0.95, 0.72, LENS),
       (math.degrees(yaw) + 3, 0.8, 0.7, LENS))
    fx(t, snap=(0.27, 1.2))
    text_at("x", t, 0.3, 0.13, 0.3, 1.0, 0.95)                          # bigger, right by the dog's head (it read as a stray mark)                          # noqa: F821


def b04b(t, d):   # dog MFS, sitting, judging, does not move; behind it he points at the food again (cropped at the chest); short orbit
    room("FE")
    point_at(OWN, "k_point_forward", 30 + t * 20, OWNP, OWN_YAW, BOWL_PT_F, "smile", 3, ease7(t / 0.2))
    dog_sit_at(DOGS0, OWNP, "judging", t)                               # facing him, not moving
    zc(t, d, (0.02, -1.0, 0.5), (0.0, -1.0, 0.5), (199, 1.95, 0.86, 28), (196, 1.75, 0.84, 28))   # from beside his hip: his arm + hand in, cropped


def b04c(t, d):   # owner waist-up with his POINTING FINGER in the lower frame -> MCU: smile -> SCARED (gasp #1); push, handheld
    room("FE")
    point_at(OWN, "k_point_forward", 50, OWNP, OWN_YAW, BOWL_PT_F, "smile" if t < 0.3 else "scared", 3)
    hc = head_c(OWN)
    zc(t, d, (hc.x - 0.06, hc.y, hc.z - 0.4), (hc.x - 0.02, hc.y, hc.z - 0.14), (6, 1.0, 1.4, LENS), (2, 0.68, 1.5, LENS), e=1.6)
    fx(t, shake=0.006)


def b05a(t, d):   # FRONT DOOR: the mailman on the doorstep, knee-up, points with his FREE LEFT hand at the bowl; street behind; whip-in + push
    hall()
    point_at(MAIL, "c_mailman_idle", 25 + t * 25, MAILP, yaw_to(MAILP, (HXW, DOORY - 3.0)), (FOODH[0], FOODH[1], 0.05), "smile", 2,   # noqa: F821
             ease7(t / 0.3), sd="L")
    zc(t, d, (HXW, MAILP[1] - 0.15, 1.25), (HXW + 0.04, MAILP[1] - 0.15, 1.25), (6, 2.25, 1.22, LENS), (2, 1.95, 1.24, LENS), e=1.5)
    fx(t, whip=(0.25, 0.22))


def b05b(t, d):   # hallway, dog level, low by the bowl at the door: the dog sprints down the hall straight at us and eats
    hall()
    point_at(MAIL, "c_mailman_idle", 50, MAILP, yaw_to(MAILP, (HXW, DOORY - 3.0)), (FOODH[0], FOODH[1], 0.05), "smile", 2, sd="L")   # noqa: F821
    dd, eat = dog_go(t, 0.0, 1.12, DOGH0, FOODH, "happy", 2.6)
    D.happy_wag(dd["arm"], t, 0.9, 4.2, up=0.0)                         # noqa: F821
    zc(t, d, (HXW, DOORY - 2.6, 0.22), (HXW + 0.1, DOORY - 1.7, 0.2), (176, 1.85, 0.82, LENS), (174, 1.6, 0.8, LENS), e=1.4)


def b06a(t, d):   # CRANE from the dog's face (dog level) up to his laugh (waist-up, level at the end): the dog at his feet, beaming, wagging
    hall()
    hpose(MAIL, "c_mailman_idle", 1 + t * 30, MAILP, yaw_to(MAILP, (HXW + 0.2, DOORY - 3.0)), "smile" if t < 0.6 else "laughing", sh=2)   # noqa: F821
    dog_sit_at(MDOG, (HXW + 0.1, DOORY - 3.0), "happy", t, wag=0.9)
    zc(t, d, (MDOG[0], MDOG[1], 0.55), (MAILP[0] + 0.18, MAILP[1], 1.6), (6, 1.0, 0.78, LENS), (-2, 1.05, 1.56, LENS), e=1.3)


def b06b(t, d):   # the owner in the hallway, waist-up -> MCU: SURPRISED (gasp #2) -> CRYING; face push + snap
    hall()
    hpose(OWN, "c_owner_idle", 40 + t * 30, OWNH, yaw_to(OWNH, (HXW - 0.2, DOORY - 5.0)), "surprised" if t < 0.35 else "crying", sh=3)   # noqa: F821
    hc = head_c(OWN)
    zc(t, d, (hc.x, hc.y, hc.z - 0.22), (hc.x, hc.y, hc.z - 0.1), (-12, 0.78, 1.48, LENS), (-6, 0.6, 1.52, LENS), e=1.6)
    fx(t, snap=(0.35, 1.1))


def b06c(t, d):   # the owner in the FOREGROUND, waist-up, facing us, crying; behind him at the open door the dog beams beside the laughing mailman; slow pull-out + rise
    hall()
    hpose(MAIL, "c_mailman_idle", 20 + t * 30, MAILP, yaw_to(MAILP, (HXW + 0.3, DOORY - 3.0)), "laughing", sh=2)   # noqa: F821
    dog_sit_at(MDOG, (HXW - 0.1, DOORY - 3.0), "happy", t, wag=0.9)
    cp_ = (OWNH[0] + 0.15, OWNH[1] - 1.0)
    hpose(OWN, "c_owner_idle", 60 + t * 20, OWNH, yaw_to(OWNH, cp_), "crying", sh=3)   # noqa: F821
    droop(OWN)
    zc(t, d, (OWNH[0] + 0.2, OWNH[1] + 0.9, 1.32), (OWNH[0] + 0.22, OWNH[1] + 0.9, 1.3), (0, 1.72, 1.4, LENS), (2, 1.95, 1.46, LENS))


C = CUT7
BEATS7 = [  # name, f0, f1, fn, board fraction
    ("01a", 0, round(_g1 * FPS7) - 2, b01a, 0.8), ("01b", round(_g1 * FPS7) - 2, C[1], b01b, 0.6),
    ("02a", C[1], wf(1, 4), b02a, 0.6), ("02b", wf(1, 4), C[2], b02b, 0.75),
    ("03a", C[2], wf(2, 3), b03a, 0.6), ("03b", wf(2, 3), C[3], b03b, 0.6),
    ("04a", C[3], wf(3, 2), b04a, 0.8), ("04b", wf(3, 2), wf(3, 5), b04b, 0.6), ("04c", wf(3, 5), C[4], b04c, 0.75),
    ("05a", C[4], wf(4, 3), b05a, 0.6), ("05b", wf(4, 3), C[5], b05b, 0.5),
    ("06a", C[5], wf(5, 5), b06a, 0.7), ("06b", wf(5, 5), wf(5, 8) + 4, b06b, 0.7), ("06c", wf(5, 8) + 4, END7, b06c, 0.5),
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
    """min distance of the dog's mesh to each visible bowl's axis minus the bowl radius (negative = inside the steel)."""
    dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg); out = {}   # noqa: F821
    for nm, o in (("food", BOWL_F), ("empty", BOWL_E)):                 # noqa: F821
        b = o.location
        if b.y < -30:
            continue
        r = ((P_[:, 0] - b[0]) ** 2 + (P_[:, 1] - b[1]) ** 2) ** 0.5
        m = P_[:, 2] < 0.07
        out[nm] = float((r[m] - 0.11).min()) if m.any() else 9.0
    return out or {"none": 9.0}


def dog_in_people():
    """dog vertices inside a human mesh (ray parity on a BVH of each visible human), and the dog-to-human min distance."""
    from mathutils.bvhtree import BVHTree
    dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg); out = {}   # noqa: F821
    for s_, P in CAST.items():
        if P.body.hide_render:
            continue
        ev = P.body.evaluated_get(dg); me = ev.to_mesh(); mw = ev.matrix_world
        bvh = BVHTree.FromPolygons([mw @ v.co for v in me.vertices], [tuple(p.vertices) for p in me.polygons])
        ev.to_mesh_clear(); n_in = 0; dmin = 9.0
        for v in P_[::3]:
            v = Vector(v); hit = bvh.find_nearest(v)
            if hit[0] is not None:
                dmin = min(dmin, hit[3])
                if hit[3] < 0.15:
                    k = 0; o_ = v.copy()
                    for _ in range(8):
                        h_ = bvh.ray_cast(o_, Vector((0, 0, 1)))
                        if h_[0] is None:
                            break
                        k += 1; o_ = h_[0] + Vector((0, 0, 1e-4))
                    n_in += k % 2
        out[s_] = (n_in, round(dmin, 3))
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
        b = BY7[n]; pl, dl, bg, ip = [], [], [], []
        for f in range(b[1], b[2], 2):
            frame7(b, f); pl.append(people_low7())
            if not DOGS[0]["o"].hide_render:                            # noqa: F821
                dl.append(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()))   # noqa: F821
                bg.append(min(dog_bowl_gap().values())); ip.append(dog_in_people())
        line = f"{n}:" + (f" dog lowest {min(dl):+.3f}..{max(dl):+.3f} m, dog-bowl gap min {min(bg):+.3f} m" if dl else "")
        for s_ in sorted({k for p_ in pl for k in p_}):
            v_ = [p_[s_] for p_ in pl if s_ in p_]; line += f" | {s_} lowest {min(v_):+.3f}..{max(v_):+.3f} m"
        for s_ in sorted({k for p_ in ip for k in p_}):
            v_ = [p_[s_] for p_ in ip if s_ in p_]
            line += f" | dog in {s_}: {max(x[0] for x in v_)} verts, min gap {min(x[1] for x in v_):.3f} m"
        rows.append(line); print("FEET", line)
    open(os.path.join(Z7, "review", "feet_check.txt"), "a").write("\n".join(rows) + "\n")
elif XMODE == "final":
    # full-res frames for the final cut: renders/frames/#####.png (skips frames already rendered)
    a_, b_ = int(XA[1]), int(XA[2])
    out = os.path.join(Z7, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a_, min(b_, END7)):
        p_ = os.path.join(out, f"{f:05d}.png")
        if not os.path.exists(p_):
            frame7(next(x for x in BEATS7 if x[1] <= f < x[2]), f); render(p_, (1080, 1920))   # noqa: F821
elif XMODE == "thumb":
    # thumbnail plate (guion.md): the living room; the owner points hard at the EMPTY bowl with a guilty grin; the dog sits
    # facing the lens, judging; behind, the mailman laughs and waves. thumb.py adds sweat drops, the red "?" and "IT KNOWS."
    from bpy_extras.object_utils import world_to_camera_view
    out = os.path.join(Z7, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset7(); room("E"); put(BOWL_E, (-0.38, -0.8, 0))                 # noqa: F821
    point_at(OWN, "k_point_forward", 50, (-0.82, -0.1), yaw_to((-0.82, -0.1), (0.6, -2.4)), (-0.38, -0.8, 0.05), "smile", 3)   # noqa: F821
    hpose(MAIL, "c_mailman_idle", 20, (0.85, 0.75), yaw_to((0.85, 0.75), (0.0, -2.5)), "laughing", sh=2)   # noqa: F821
    aim_arm(MAIL, "L", (0.55, 0.3, 1.95), 1.0, 0.6)                      # the free hand up: a wave
    aim_arm(OWN, "R", (-0.38, -0.8, 0.95), 1.0, 0.62)                     # pointing HARD: the arm straight out at the bowl
    dd = dog_sit_at((-0.1, -0.72), (-0.25, -3.0), "judging", 0.3)
    cam((-0.2, -2.15, 0.88), (-0.18, -0.2, 0.95), 22)                      # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821
    render(os.path.join(out, "A.png"), (1080, 1920))                    # noqa: F821
    pts = {"dog_head": dog_head(0), "owner_head": head_c(OWN), "mail_head": head_c(MAIL)}   # noqa: F821
    json.dump({k: [round(c, 4) for c in world_to_camera_view(sc, CAM, v)[:2]] for k, v in pts.items()}, open(os.path.join(out, "pts.json"), "w"))   # noqa: F821
elif XMODE == "iso":
    # self-check BEFORE the board (v2 fixes): each human isolated in the key pose (front / side / head front, 3/4,
    # profile / both hands / the pointing hand from the side) and the dog isolated (sitting levelled, shocked, eating)
    out = os.path.join(Z7, "review", "iso"); os.makedirs(out, exist_ok=True)
    for tag, P, act, f, fc, tgt, sd0 in (("owner_point", OWN, "k_point_forward", 50, "smile", (-0.6, -0.84, 0.05), None),
                                         ("owner_cry", OWN, "c_owner_idle", 60, "crying", None, None),
                                         ("mailman_point", MAIL, "c_mailman_idle", 50, "smile", (0.35, -0.8, 0.05), "L"),
                                         ("mailman_laugh", MAIL, "c_mailman_idle", 20, "laughing", None, None)):
        reset7(); room(""); loc = (0.0, 0.0)
        if tgt:
            sd = point_at(P, act, f, loc, 0.0, tgt, fc, 3, sd=sd0)
        else:
            hpose(P, act, f, loc, 0.0, fc, sh=3); sd = "R"
            if tag == "owner_cry":
                droop(P)
        bpy.context.view_layer.update(); r = P.bone_world("root"); hc = head_c(P)
        views = [("front", (r.x, r.y - 2.2, 1.0), (r.x, r.y, 0.9), 26), ("side", (r.x + 2.4, r.y, 1.0), (r.x, r.y, 0.9), 26),
                 ("head_f", (hc.x, hc.y - 0.75, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_34", (hc.x + 0.55, hc.y - 0.55, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_side", (hc.x + 0.78, hc.y, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("shoulder", (hc.x - 0.6, hc.y - 0.55, hc.z - 0.2), (hc.x - 0.15, hc.y, hc.z - 0.3), 35)]
        for s2 in "LR":
            bpy.context.view_layer.update(); w_ = P.bone_world(f"wrist.{s2}", tail=True)
            views.append((f"hand{s2}", (w_.x + (0.35 if s2 == "L" else -0.35), w_.y - 0.45, w_.z + 0.1), tuple(w_), 35))
        bpy.context.view_layer.update(); w_ = P.bone_world(f"wrist.{sd}", tail=True)
        views.append(("hand_point_side", (w_.x + (0.5 if sd == "L" else -0.5), w_.y + 0.05, w_.z + 0.12), tuple(w_), 35))
        for v, cp, aim, lens in views:
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "point arm", sd, "lowest", round(people_low7().get(P.name, 9), 3))
    for tag, fn in (("dog_sit", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "judging", 0.3)),
                    ("dog_happy", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "happy", 0.3, wag=0.9)),
                    ("dog_shocked", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "shocked", 0.3)),
                    ("dog_eat", lambda: (put(BOWL_F, (0.0, -0.55, 0)), dog_go(2.0, 0.0, 0.5, (0.0, 0.6), (0.0, -0.55), "happy")))):   # noqa: F821
        reset7(); room(""); fn(); bpy.context.view_layer.update(); hd = dog_head(0)   # noqa: F821
        for v, cp, aim, lens in (("front", (0.0, -1.4, 0.8), (0.0, 0.0, 0.45), LENS), ("side", (1.5, 0.0, 0.8), (0.0, 0.0, 0.45), LENS),
                                 ("face", (hd.x, hd.y - 0.6, hd.z), tuple(hd), 35)):
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "dog lowest", round(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()), 3))   # noqa: F821

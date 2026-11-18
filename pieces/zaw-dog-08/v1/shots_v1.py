"""zaw-dog #8 "Your Dog Knows When You're Teasing Him" - shots (board v1, 2026-11-16), run INSIDE the approved zaw-dog-05
kit through its exec mode, ONE FRESH BLENDER PER SHOT:
  Blender -b -P pieces/zaw-dog-05/build.py -- exec pieces/zaw-dog-08/shots.py <mode> [beat ...]
  mode: board (1 frame -> review/raw/<beat>.png + review/beats.json), frames <beat> [step] (-> review/anim/<beat>/),
        feet (review/feet_check.txt), iso (self-check -> review/iso/), final a b
Pipeline and framing copied from #7 (Zaw rules, fuentes/zawpolyshorts-style/planos/ENCUADRE.md): set x1.35, lens 25 mm,
dog shots 0.75-0.85 m pitched down, people waist/knee-up or an arm, every shot moves, snap/whip accents.
Study: Schuenemann et al. 2021 (Sci Rep 11:14967): food passed through a 15 cm gap between two transparent walls;
unwilling (pulled back, 'ha-ha'), unable-clumsy (dropped, rolled to her side), unable-blocked (not shown).
Sets: the kit HALLWAY (owner + dog, lines 1 and 7) and the kit LIVING ROOM as the lab with a low-poly 3D glass wall.
Cast (kit v6): owner (tex/owner_body_fix.png = #7 seam fix) + scientist (as-is body, #7 softer face edge + hair strands).
Props: a low-poly 3D bone biscuit (kit treat_sw photo texture), the glass wall (wood frames, clear panes, feet)."""
import json
import math
import os
import sys

import bpy
from mathutils import Quaternion, Vector

Z8 = os.path.join(ROOT, "pieces", "zaw-dog-08")                        # noqa: F821  (ROOT, K, D, cam, dog ... from build.py)
Z6 = os.path.join(ROOT, "pieces", "zaw-dog-06")                        # noqa: F821
sys.path.insert(0, os.path.join(ROOT, "styles", "zawdog", "humans"))  # noqa: F821
import human as HU  # noqa: E402

XA = ARGS[2:]                                                           # noqa: F821
XMODE = XA[0] if XA else "board"
T8 = json.load(open(os.path.join(Z8, "voice", "timing.json")))
FPS8 = 30
CUT8 = [max(0, round((s - 0.15) * FPS8)) if i else 0 for i, s in enumerate(T8["starts"])] + [round(T8["end"] * FPS8)]
END8 = CUT8[-1]
WL = [[w for w in T8["words"] if w["line"] == i] for i in range(len(T8["starts"]))]
SET8 = 1.35
LENS = 25


def wf(line, idx, pre=0.08):
    return round((WL[line][idx]["s"] - pre) * FPS8)


def wt(line, idx):
    return WL[line][idx]["s"]


BARK8 = round((WL[0][6]["e"] + 0.3) * FPS8) / FPS8                     # the hero bark in the clean gap AFTER "him"

# ---------------------------------------------------------------- set dressing (same kit fixes as #7), in SET units
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

SWAP = {"sky.png": "sky_v1px.png", "grass.png": "grass_soft.png"}      # the #6/#7 sky (v1 photo, pixelated) + softer grass
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
        for n_ in m_.node_tree.nodes) for m_ in o.data.materials)]
FACADE = [bpy.data.objects[n_] for n_ in ("facade_e0", "facade_e_eave")]
_rmat = bpy.data.objects["rug_hd"].data.materials[0]
_rn = bpy.data.objects["runner"]; _rn.data.materials.clear(); _rn.data.materials.append(_rmat)
_uvl = _rn.data.uv_layers.active
for p_ in _rn.data.polygons:
    for li, vi in zip(p_.loop_indices, p_.vertices):
        c_ = _rn.matrix_world @ _rn.data.vertices[vi].co
        _uvl.data[li].uv = ((c_.y + 0.4 + 2.3) / 2.6, (c_.x - HX + 0.4) / 0.8)   # noqa: F821

_DG = mcol("#24452F"); _BR = mcol("#C9A24A")                            # noqa: F821  (#7 panelled front door)
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

TXT["germany"] = K.Letters3D("t_germany", "GERMANY, 2021", size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)   # noqa: F821
scale_set(SET8)                                                         # noqa: F821  (everything built after this is NOT scaled)

# ---------------------------------------------------------------- the lab glass wall (world metres, unscaled prop)
GY = 0.30                       # the wall plane (y); the scientist behind it (+y), the dog in front (-y)
GAP = 0.15                      # the study's 15 cm gap between the two walls
GW, GH = 1.15, 1.05             # each wall: width, height
GLASS_OBJS = []


def mat_glass():
    m = bpy.data.materials.new("glass8"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.78, 0.92, 1.0, 1)
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.35       # more tint at grazing angles
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.10; mr.inputs["To Max"].default_value = 0.42
    mx = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(lw.outputs["Facing"], mr.inputs[0]); nt.links.new(mr.outputs[0], mx.inputs[0])
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    m.surface_render_method = "BLENDED"
    return m


def mat_glare():
    m = bpy.data.materials.new("glare8"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (1, 1, 1, 1)
    mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = 0.16
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    m.surface_render_method = "BLENDED"
    return m


GLASS_M, GLARE_M = mat_glass(), mat_glare()
FRAME_M = mcol("#8B6A45"); FEET_M = mcol("#5C4430")                    # noqa: F821
FR = 0.045                                                              # frame timber
for sx in (-1, 1):
    x0, x1 = sx * GAP / 2, sx * (GAP / 2 + GW)
    xc = (x0 + x1) / 2
    pane = K.plane(f"glass{sx}", GW - FR, GH - 2 * FR, (xc, GY, 0.06 + GH / 2), rot=(math.pi / 2, 0, 0), mat=GLASS_M)
    GLASS_OBJS.append(pane)
    for k, (gx, gz, gl) in enumerate(((0.22, 0.75, 0.42), (0.36, 0.62, 0.22))):   # two glare streaks (diagonal)
        g_ = K.plane(f"glare{sx}_{k}", 0.022, gl, (xc + sx * (gx - GW / 2), GY - 0.004, 0.06 + gz), rot=(math.pi / 2, 0.6, 0), mat=GLARE_M)
        GLASS_OBJS.append(g_)
    for nm, size, loc in ((f"gpost_in{sx}", (FR, FR, GH), (x0 + sx * FR / 2, GY, 0.06 + GH / 2)),
                          (f"gpost_out{sx}", (FR, FR, GH), (x1 - sx * FR / 2, GY, 0.06 + GH / 2)),
                          (f"grail_top{sx}", (GW, FR, FR), (xc, GY, 0.06 + GH - FR / 2)),
                          (f"grail_bot{sx}", (GW, FR, FR), (xc, GY, 0.06 + FR / 2)),
                          (f"gfoot_in{sx}", (0.06, 0.3, 0.06), (x0 + sx * FR / 2, GY, 0.03)),
                          (f"gfoot_out{sx}", (0.06, 0.3, 0.06), (x1 - sx * FR / 2, GY, 0.03))):
        GLASS_OBJS.append(K.box(nm, size, loc, FEET_M if "foot" in nm else FRAME_M))
for o_ in GLASS_OBJS:
    if o_.data.materials and o_.data.materials[0] in (GLASS_M, GLARE_M):
        o_.visible_shadow = False

# ---------------------------------------------------------------- the treat: a low-poly bone biscuit (kit photo texture)
TREAT = K.link(bpy.data.objects.new("treat8", None))
_TM = mtex("treat_sw")                                                  # noqa: F821
_tp = [K.box("treat_mid", (0.075, 0.026, 0.02), (0, 0, 0), _TM)]
for ix in (-1, 1):
    for iy in (-1, 1):
        _tp.append(K.box(f"treat_knob{ix}{iy}", (0.03, 0.028, 0.022), (ix * 0.045, iy * 0.014, 0), _TM))
for o_ in _tp:
    loc_ = o_.location.copy(); o_.parent = TREAT; o_.location = loc_
TREAT.location = (0, -40, 0)

# ---------------------------------------------------------------- the cast (kit v6) + #7 seam repairs
CAST = {}


def fix_human(P):
    """#7 per-video fixes, in memory: the repaired body texture (when tex/<name>_body_fix.png exists: straight sleeve hem /
    collar, skin toned to the face), a softer face edge (mask^1.5) and strand shading on the hair mesh."""
    fp = os.path.join(Z8, "tex", f"{P.name}_body_fix.png")
    if os.path.exists(fp):
        fx_ = bpy.data.images.load(fp); fx_.pack()
        P.msheet.node_tree.nodes["img"].image = fx_
        P.mface.node_tree.nodes["skin"].image = fx_
    nf = P.mface.node_tree; mk_ = nf.nodes["mask"]
    lk_ = next(l_ for l_ in nf.links if l_.from_node == mk_)
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


for s_ in ("owner", "scientist"):
    P_ = HU.Human(s_)
    fix_human(P_)
    P_.body.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
    P_.ik = {}
    for sd in "LR":
        tg = K.link(bpy.data.objects.new(f"{s_}_ik{sd}", None))     # noqa: F821
        c_ = P_.rig.pose.bones[f"lowerarm02.{sd}"].constraints.new("IK"); c_.target = tg; c_.chain_count = 4; c_.influence = 0.0
        P_.ik[sd] = (c_, tg)
    P_.show(False); P_.place((0, -40, 0)); CAST[s_] = P_
OWN, SCI = CAST["owner"], CAST["scientist"]
ACT8 = {k: HU.load_action(k) for k in ("c_owner_idle", "c_scientist_idle")}
FINGER_OPEN = 0.65


def hpose(P, act, f, loc, yaw, face="neutral", sh=None, relax=FINGER_OPEN):
    a = ACT8[act]; P.show(True); P.place(loc, yaw); P.play(a)
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


GRIP = {1: (0.5, 0.45, 0.3), 2: (1.0, 1.1, 0.8), 3: (1.15, 1.3, 0.9), 4: (1.2, 1.35, 0.9), 5: (1.25, 1.35, 0.9)}


def grip_hand(P, sd, k=1.0):
    """a closed hand holding the biscuit: all fingers curled about their local +X (the #7 point_hand axis)."""
    for pb in P.rig.pose.bones:
        if not (pb.name.startswith("finger") and pb.name.endswith(sd)):
            continue
        n, seg = int(pb.name[6]), int(pb.name[8])
        pb.rotation_quaternion = pb.rotation_quaternion.slerp(Quaternion((1, 0, 0), GRIP[n][min(seg, 3) - 1]), k)


def treat_in_hand(P, sd, fwd=0.045):
    """the biscuit in the closed hand: just past the wrist bone's tail, across the hand."""
    bpy.context.view_layer.update()
    h = P.bone_world(f"wrist.{sd}"); tl = P.bone_world(f"wrist.{sd}", tail=True); dv = (tl - h).normalized()
    TREAT.location = tl + dv * fwd
    TREAT.rotation_euler = (0, 0, math.atan2(dv.y, dv.x) + math.pi / 2)
    return Vector(TREAT.location)


def treat_fall(t, t0, p0, p1, roll_to=None, roll_d=0.5):
    """dropped: falls from p0 (hand) under gravity to the floor at p1 (x, y), small bounce, then rolls to roll_to."""
    u = t - t0
    tf = math.sqrt(max(0.02, 2 * (p0[2] - 0.012) / 9.81))
    if u <= tf:
        k = u / tf
        TREAT.location = (p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, max(0.012, p0[2] - 0.5 * 9.81 * u * u))
        TREAT.rotation_euler = (2.5 * u * 6, 1.2 * u * 6, 0.6)
        return
    v = u - tf; bh = 0.05 * max(0.0, math.sin(math.pi * min(1.0, v / 0.2))) if v < 0.2 else 0.0
    q = 0.0 if roll_to is None else ease8(v / roll_d)
    end = p1 if roll_to is None else roll_to
    TREAT.location = (p1[0] + (end[0] - p1[0]) * q, p1[1] + (end[1] - p1[1]) * q, 0.012 + bh)
    TREAT.rotation_euler = (0, 0, 0.6 + 4.0 * q)


def ease8(x):
    x = min(1.0, max(0.0, x)); return x * x * (3 - 2 * x)


def fx(t, shake=0.0, snap=None, whip=None):
    """#6/#7 camera accents: shake (smooth handheld), snap=(t0, lens factor), whip=(rad, dur) settling from the cut."""
    yaw = pitch = roll = 0.0
    if shake:
        yaw += 0.6 * shake * (0.65 * math.sin(2 * math.pi * 0.8 * t) + 0.35 * math.sin(2 * math.pi * 1.55 * t + 1.0))
        pitch += 0.6 * shake * (0.6 * math.sin(2 * math.pi * 1.0 * t + 2.0) + 0.4 * math.sin(2 * math.pi * 1.7 * t))
        roll += 0.6 * shake * 0.6 * math.sin(2 * math.pi * 0.7 * t + 0.5)
    if whip:
        yaw += whip[0] * (1 - ease8(t / whip[1])) ** 2
    if yaw or pitch or roll:
        from mathutils import Euler
        bpy.context.view_layer.update()
        CAM.matrix_world = CAM.matrix_world @ Euler((pitch, yaw, roll)).to_matrix().to_4x4()   # noqa: F821
    if snap and t >= snap[0]:
        CAM.data.lens *= 1 + (snap[1] - 1) * ease8((t - snap[0]) / 0.12)  # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def zc(t, d, p0, p1, s0, s1, e=1.0):
    """Zaw camera: aim point p and state s = (azimuth deg, horizontal distance m, camera height m, lens);
    azimuth 0 = the camera on the -Y side of the aim looking +Y; 180 = on the +Y side looking -Y."""
    u = ease8(t / d) if e == 1.0 else 1 - (1 - min(1.0, t / d)) ** e
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


def wag_on(dd, t, amp, hz=4.2):
    if amp > 0.01:
        D.happy_wag(dd["arm"], t, amp, hz, up=0.0)                      # noqa: F821


# ---------------------------------------------------------------- staging (WORLD metres; the set is scaled x SET8)
HXW, DOORY = sw((HX, 0.0))[0], sw((0.0, 2.5))[1]   # noqa: F821  the hallway centre line and the front door (world)
OWNH = (HXW - 0.25, DOORY - 2.3)       # the owner in the hallway, back to the open front door, facing the dog (-y)
DOGH = (HXW - 0.15, DOORY - 3.35)      # the dog sitting in the hallway, facing him (+y)
OWN_YAW = yaw_to(OWNH, (DOGH[0], DOGH[1] - 1.0))   # noqa: F821
SCIP = (-0.18, 0.62)                   # the scientist just behind the glass wall, facing the dog (-y)
SCI_YAW = yaw_to(SCIP, (-0.1, -2.0))   # noqa: F821
DOGL = (0.02, -0.38)                   # the dog in front of the gap (lab)
GAPP = (0.0, GY - 0.07, 0.95)          # the hand + biscuit just through the gap (dog side)
DROP_AT = (0.05, GY + 0.1)             # the biscuit lands on HER side ...
ROLL_TO = (0.30, 0.62)                 # ... and rolls a little away from her feet (the study's ramp)
AROUND = [(0.02, -0.38), (0.8, -0.36), (1.38, 0.0), (1.42, 0.55), (0.95, 0.68), (0.68, 0.66)]   # around the +x end


def room():
    for o in LR_CT:                                                     # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:
        hide(o, False)                                                  # noqa: F821
    for o in FACADE + RACK:                                             # noqa: F821
        hide(o, False)                                                  # noqa: F821
    for o in GLASS_OBJS:
        hide(o, False)                                                  # noqa: F821


def hall(door=-1.75):
    for o in FACADE + RACK:                                             # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:
        hide(o, o.name in ("r_sky", "st_sky0", "st_sky1", "p_sky2", "p_sky3"))   # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, door)                              # noqa: F821
    for o in GLASS_OBJS:
        hide(o, True)                                                   # noqa: F821


def dog_sit_at(p, look, expr, t, wag=0.0, level=0.3):
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, look), expr, t)              # noqa: F821
    wag_on(dd, t, wag)
    sit_grounded(0)                                                     # noqa: F821
    nod(dd, level)
    return dd


def dog_stand(p, look, expr, t, wag=0.0, head=0.0):
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, look), expr, t)              # noqa: F821
    wag_on(dd, t, wag); nod(dd, head); ground_dog(0)                    # noqa: F821
    return dd


def path_pt(pts, u):
    seg = [(Vector(a) - Vector(b)).length for a, b in zip(pts[1:], pts[:-1])]; L_ = sum(seg); s = min(max(u, 0.0), 1.0) * L_
    for (a, b), l_ in zip(zip(pts[:-1], pts[1:]), seg):
        if s <= l_ or (a, b) == (pts[-2], pts[-1]):
            k = s / l_ if l_ else 0.0
            return Vector(a).lerp(Vector(b), min(k, 1.0))
        s -= l_


def dog_path(t, t0, dur, pts, expr, rate=3.0):
    """the dog trots along a polyline (eased), heading smoothed along the path."""
    u = ease8((t - t0) / dur) if t > t0 else 0.0
    p = path_pt(pts, u); q0, q1 = path_pt(pts, max(0.0, u - 0.04)), path_pt(pts, min(1.0, u + 0.04))
    yaw = yaw_to(tuple(q0), tuple(q1)) if (q1 - q0).length > 1e-4 else yaw_to(pts[0], pts[1])   # noqa: F821
    dd = dog(0, (p.x, p.y, 0), yaw, expr, t)                            # noqa: F821
    if 0.0 < u < 1.0:
        dog_walk(0, t, rate)                                            # noqa: F821
    ground_dog(0)                                                       # noqa: F821
    return dd, u


def dog_eat(p, target, expr, t):
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, target), expr, t)            # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25)]); D.move(dd["arm"], "chest", (0, 0, -0.12))   # noqa: F821
    D.rot(dd["arm"], "jaw", (1, 0, 0), 0.12 + 0.1 * math.sin(2 * math.pi * 4 * t)); nose_at(0, (target[0], target[1], 0.0), -0.01); ground_dog(0)   # noqa: F821
    return dd


def gap_side(P):
    bpy.context.view_layer.update()
    return min("LR", key=lambda s: (P.bone_world(f"upperarm01.{s}") - Vector((GAPP[0], GY, 1.3))).length)


def sci_offer(t, f, face, hand_pt, k=1.0, grip=True, treat=True):
    """the scientist behind the glass, her gap-side arm reaching to hand_pt (IK) with the biscuit in her closed hand."""
    hpose(SCI, "c_scientist_idle", f, SCIP, SCI_YAW, face, sh=2)
    sd = gap_side(SCI)
    reach(SCI, sd, hand_pt, k)
    if grip:
        grip_hand(SCI, sd, 1.0)
    if treat:
        treat_in_hand(SCI, sd)
    return sd


def sci_hand(t, t_pass, t_back, back_pt, ease_in=0.35):
    """hand path: from her chest out through the gap (t_pass), held, then (t_back) yanked back to back_pt."""
    start = Vector((SCIP[0] + 0.12, SCIP[1] - 0.12, 1.05)); gp = Vector(GAPP)
    if t_back is not None and t >= t_back:
        u = ease8((t - t_back) / 0.16)                                  # a FAST pull-back
        return tuple(gp.lerp(Vector(back_pt), u))
    u = ease8((t - t_pass) / ease_in)
    return tuple(start.lerp(gp, u))


# ================================================================ beats (t = s into the shot, d = shot length)
def b01a(t, d):   # hallway, dog MFS -> MS, camera 0.78 m pitched down, push-in: the dog faces us, suspicious; owner's leg + treat hand cropped
    hall()
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWNH, OWN_YAW, "smile", sh=3)
    reach(OWN, "R", (OWNH[0] + 0.25, OWNH[1] - 0.32, 1.05 + 0.04 * math.sin(2 * math.pi * 1.6 * t))); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.25)
    zc(t, d, (DOGH[0], DOGH[1], 0.55), (DOGH[0], DOGH[1], 0.57), (146, 1.4, 0.8, LENS), (152, 1.12, 0.78, LENS), e=1.6)


def b01b(t, d):   # the owner waist-up, chest-height camera, orbit + push: he dangles the biscuit up by his face, teasing grin
    hall()
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWNH, OWN_YAW, "smile", sh=3)
    hc = head_c(OWN)
    wig = 0.05 * math.sin(2 * math.pi * 1.8 * t)
    reach(OWN, "R", (hc.x - 0.12 + wig, hc.y - 0.42, hc.z - 0.3 + 0.03 * math.sin(2 * math.pi * 3.6 * t))); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.1)
    zc(t, d, (hc.x - 0.05, hc.y, hc.z - 0.42), (hc.x - 0.04, hc.y, hc.z - 0.34), (-16, 1.6, 1.22, LENS), (-6, 1.32, 1.28, LENS), e=1.4)


def b01c(t, d):   # dog MS 3/4, the HERO BARK in the gap after "him"; SNAP-zoom on it
    hall()
    dd = dog_sit_at(DOGH, (OWNH[0] + 0.3, OWNH[1]), "judging", t)
    bark_jaw(dd, t + BY8["01b"][1] / FPS8, BARK8)
    p_ = (DOGH[0], DOGH[1] - 0.02, 0.6)
    zc(t, d, p_, (p_[0], p_[1], 0.62), (196, 0.95, 0.78, LENS), (190, 0.82, 0.76, LENS), e=1.4)
    fx(t, snap=(BARK8 - BY8["01b"][1] / FPS8 - 0.03, 1.15))


def b02a(t, d):   # THE LAB (the one location shot): the scientist knee-up behind the glass wall, the dog's head in the
    room()        # foreground; "GERMANY, 2021" pops on "Germany"; crane down + push
    hpose(SCI, "c_scientist_idle", 1 + t * 30, SCIP, SCI_YAW, "smile", sh=2)
    sd = gap_side(SCI); grip_hand(SCI, sd); reach(SCI, sd, (SCIP[0] + 0.15, SCIP[1] - 0.2, 1.1), 1.0); treat_in_hand(SCI, sd)
    dog_sit_at((DOGL[0] + 0.3, DOGL[1] - 0.25), (0.0, 1.0), "happy", t, wag=0.7, level=0.0)
    zc(t, d, (0.0, 0.3, 0.92), (0.0, 0.3, 0.86), (-6, 2.35, 1.3, LENS), (-2, 2.0, 1.2, LENS), e=1.5)
    text_at("germany", t, wt(1, 2) - BY8["02a"][1] / FPS8 - 0.05, 0.0, 0.47, 1.0, 0.82)   # noqa: F821


def b02b(t, d):   # profile at the gap: her hand + the biscuit come THROUGH the gap in the glass; the dog stands, nose up to it
    room()
    sci_offer(t, 30 + t * 25, "smile", sci_hand(t, 0.05, None, None))
    dd = dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.8, head=-0.25)
    zc(t, d, (0.0, 0.08, 0.72), (0.0, 0.06, 0.74), (-80, 1.3, 0.92, LENS), (-72, 1.08, 0.9, LENS), e=1.4)


def b02c(t, d):   # "a gap in a glass wall": the dog's side, 3/4 front, push in on the GAP: the biscuit through it, nose at it
    room()
    sci_offer(t, 60 + t * 25, "smile", GAPP)
    dd = dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.9, head=-0.25)
    zc(t, d, (0.0, 0.12, 0.66), (0.0, 0.1, 0.68), (128, 1.15, 0.85, LENS), (138, 0.92, 0.82, LENS), e=1.3)
    fx(t, whip=(0.2, 0.2))


def b03a(t, d):   # "dropped the treat": low behind the dog's head, through the glass: the biscuit slips out of her hand and falls
    room()
    t0 = (BY8["03a"][2] - BY8["03a"][1]) / FPS8 * 0.0 + max(0.15, wt(2, 2) - BY8["03a"][1] / FPS8)
    sd = sci_offer(t, 40 + t * 25, "smile" if t < t0 + 0.2 else "surprised", GAPP, grip=t < t0)
    if t >= t0:
        bpy.context.view_layer.update(); p0 = SCI.bone_world(f"wrist.{sd}", tail=True)
        treat_fall(t, t0, (GAPP[0], GY + 0.03, GAPP[2] - 0.02), DROP_AT, ROLL_TO, 0.5)
    dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.6, head=-0.2)
    zc(t, d, (0.0, 0.12, 0.66), (0.02, 0.2, 0.42), (-82, 1.3, 0.9, LENS), (-74, 1.1, 0.82, LENS), e=1.4)


def b03b(t, d):   # "by accident": her side of the glass, waist-up: "oops" (surprised), hands open; the biscuit at her feet
    room()
    hpose(SCI, "c_scientist_idle", 70 + t * 25, SCIP, SCI_YAW, "surprised", sh=2)
    sd = gap_side(SCI); reach(SCI, sd, (SCIP[0] + 0.2, SCIP[1] - 0.3, 1.0), 1.0)
    TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012); TREAT.rotation_euler = (0, 0, 2.6)
    dog_stand(DOGL, (0.1, GY), "neutral", t, head=0.15)
    hc = head_c(SCI)
    zc(t, d, (hc.x + 0.05, hc.y, hc.z - 0.32), (hc.x + 0.04, hc.y, hc.z - 0.26), (-16, 1.25, 1.3, LENS), (-6, 1.0, 1.32, LENS), e=1.4)
    fx(t, snap=(0.12, 1.08))


def b04a(t, d):   # "pulled it back": profile at the gap, the biscuit right at the dog's nose ... YANKED back on "pulled"
    room()
    tb = max(0.25, wt(3, 3) - BY8["04a"][1] / FPS8)
    hp_ = sci_hand(t, -1.0, tb, (SCIP[0] + 0.12, SCIP[1] - 0.05, 1.42))
    sci_offer(t, 50 + t * 25, "smile", hp_)
    dd = dog_stand(DOGL, (0.0, GY), "happy" if t < tb + 0.15 else "shocked", t, wag=0.8 if t < tb else 0.0, head=-0.25)
    zc(t, d, (0.0, 0.1, 0.82), (0.0, 0.14, 0.92), (-78, 1.25, 0.95, LENS), (-70, 1.1, 1.0, LENS), e=1.3)
    fx(t, whip=(0.0, 0.2), snap=(tb + 0.05, 1.08))


def b04b(t, d):   # "on purpose": through the glass from behind the dog's head: she holds the biscuit up and LAUGHS ("ha-ha")
    room()
    sci_offer(t, 80 + t * 25, "laughing", (SCIP[0] + 0.12 + 0.03 * math.sin(2 * math.pi * 2.2 * t), SCIP[1] - 0.05, 1.42))
    dog_stand(DOGL, (0.0, GY), "shocked", t, head=-0.1)
    zc(t, d, (SCIP[0] + 0.05, SCIP[1], 1.2), (SCIP[0] + 0.05, SCIP[1], 1.26), (8, 1.6, 1.3, LENS), (4, 1.3, 1.32, LENS), e=1.4)
    fx(t, shake=0.004)


def b05a(t, d):   # "when it was an accident": from her side through the glass, the biscuit in the fg on the floor; the dog
    room()        # sees it ... and sets off round the end of the wall
    hpose(SCI, "c_scientist_idle", 100 + t * 25, SCIP, SCI_YAW, "neutral", sh=2)
    TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012); TREAT.rotation_euler = (0, 0, 2.6)
    ts = max(0.4, wt(4, 4) - BY8["05a"][1] / FPS8)                       # sets off on "accident"
    dd, u = dog_path(t, ts, RUN_D, AROUND, "happy")
    if u <= 0.0:
        nod(dd, 0.25)
    zc(t, d, (0.35, 0.15, 0.32), (0.55, 0.1, 0.34), (160, 1.2, 0.8, LENS), (150, 1.2, 0.8, LENS), e=1.2)


RUN_D = 1.9                                                             # the trot round the wall (s)


def b05b(t, d):   # "walked around to grab it": round the end of the glass, dog-level track, to the biscuit: eats it, wagging
    room()
    hpose(SCI, "c_scientist_idle", 130 + t * 25, SCIP, SCI_YAW, "smile", sh=2)
    t_pre = (BY8["05b"][1] - BY8["05a"][1]) / FPS8 - max(0.4, wt(4, 4) - BY8["05a"][1] / FPS8)
    dur = RUN_D; te = max(0.0, dur - t_pre - 0.05)
    if t < te:
        dd, u = dog_path(t + t_pre, 0.0, dur, AROUND, "happy")
        TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012); TREAT.rotation_euler = (0, 0, 2.6)
    else:
        dd = dog_eat(AROUND[-1], ROLL_TO, "happy", t); TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012) if t < te + 0.25 else (0, -40, 0)
    wag_on(dd, t, 0.9)
    zc(t, d, (0.62, 0.62, 0.36), (0.55, 0.64, 0.33), (236, 1.15, 0.8, LENS), (228, 0.95, 0.78, LENS), e=1.2)   # fixed aim: he trots INTO the frame (tracking him made the rug crawl)


def b06a(t, d):   # "but when they were teased": her hand yanks the biscuit back through the gap again; the dog's head in the fg
    room()
    hp_ = sci_hand(t, -1.0, 0.3, (SCIP[0] + 0.12, SCIP[1] - 0.05, 1.42))
    sci_offer(t, 140 + t * 25, "smile" if t < 0.3 else "laughing", hp_)
    dog_stand(DOGL, (0.0, GY), "happy" if t < 0.4 else "shocked", t, head=-0.15)
    zc(t, d, (0.0, GY + 0.05, 1.0), (0.0, GY + 0.05, 1.05), (-38, 1.5, 0.85, LENS), (-28, 1.28, 0.88, LENS), e=1.3)
    fx(t, whip=(-0.22, 0.2))


def b06b(t, d):   # "they waited way longer": from her side through the glass, the dog SITS and waits, sad, ears back; slow orbit
    room()
    sci_offer(t, 170 + t * 25, "smile", (SCIP[0] + 0.12, SCIP[1] - 0.05, 1.42))
    dog_sit_at(DOGL, (0.0, GY), "sad", t, level=0.0)
    zc(t, d, (DOGL[0], DOGL[1], 0.5), (DOGL[0], DOGL[1], 0.52), (132, 1.4, 0.82, LENS), (144, 1.15, 0.8, LENS), e=1.3)


_TB = {}


def b06c(t, d):   # "and stopped wagging their tails": low insert behind the sitting dog: the tail wags ... slows ... STOPS
    room()
    sci_offer(t, 200 + t * 25, "smile", (SCIP[0] + 0.12, SCIP[1] - 0.05, 1.42))
    ts = max(0.25, wt(5, 10) - BY8["06c"][1] / FPS8)
    k = 1.0 - ease8((t - ts) / 0.55)
    dd = dog(0, (DOGL[0], DOGL[1], 0), yaw_to(DOGL, (0.0, GY)), "neutral" if k > 0.5 else "sad", t)   # noqa: F821
    D.happy_wag(dd["arm"], t, 0.9 * k, 4.0, up=-0.45 * (1 - k))          # noqa: F821  (always: the sad face must not tuck it out of sight)
    sit_grounded(0); nod(dd, 0.0)                                       # noqa: F821
    bpy.context.view_layer.update(); arm_ = dd["arm"]; tb = arm_.matrix_world @ arm_.pose.bones["tail1"].head
    if "tb" not in _TB:
        _TB["tb"] = Vector(tb)                                          # aim at the tail root once per shot (no jitter)
    tb = _TB["tb"]
    zc(t, d, (tb.x, tb.y + 0.12, tb.z + 0.05), (tb.x, tb.y + 0.12, tb.z + 0.08), (-58, 0.95, 0.5, LENS), (-44, 0.78, 0.48, LENS), e=1.3)


def b07a(t, d):   # "so next time you fake a treat": the owner knee-up in the hallway offers the biscuit low ... then whips it up
    hall()        # out of reach with a grin (the fake)
    hpose(OWN, "c_owner_idle", 40 + t * 30, OWNH, OWN_YAW, "smile", sh=3)
    tf = max(0.3, wt(6, 4) - BY8["07a"][1] / FPS8)
    lo = Vector((OWNH[0] + 0.2, OWNH[1] - 0.5, 0.82)); hi = Vector((OWNH[0] + 0.42, OWNH[1] - 0.22, 1.62))
    u = ease8((t - tf) / 0.18)
    reach(OWN, "R", tuple(lo.lerp(hi, u))); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "happy" if t < tf + 0.2 else "judging", t, wag=0.7 if t < tf else 0.0, level=0.1)
    hc = head_c(OWN)
    zc(t, d, (hc.x - 0.05, hc.y - 0.3, hc.z - 0.36), (hc.x - 0.05, hc.y - 0.3, hc.z - 0.3), (-30, 0.98, 1.3, LENS), (-20, 0.86, 1.32, LENS), e=1.3)
    fx(t, whip=(0.22, 0.2))


def b07b(t, d):   # "he knows exactly": the dog MS, flat judging squint up at him, does NOT move; slow push, SNAP on "exactly"
    hall()
    hpose(OWN, "c_owner_idle", 70 + t * 30, OWNH, OWN_YAW, "smile", sh=3)
    reach(OWN, "R", (OWNH[0] + 0.42, OWNH[1] - 0.22, 1.62)); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.15)
    p_ = (DOGH[0], DOGH[1], 0.6)
    zc(t, d, p_, (p_[0], p_[1], 0.62), (200, 0.85, 0.8, LENS), (194, 0.72, 0.78, LENS), e=1.4)
    fx(t, snap=(max(0.1, wt(6, 9) - BY8["07b"][1] / FPS8 - 0.05), 1.15))


def b07c(t, d):   # "what you're doing": over the judging dog's head (fg), the owner BUSTED: grin -> surprised (gasp) -> scared
    hall()
    ts = 0.25
    hpose(OWN, "c_owner_idle", 90 + t * 30, OWNH, OWN_YAW, "smile" if t < ts else ("surprised" if t < ts + 0.6 else "scared"), sh=3)
    u = ease8((t - ts) / 0.25)
    reach(OWN, "R", tuple(Vector((OWNH[0] + 0.42, OWNH[1] - 0.22, 1.62)).lerp(Vector((OWNH[0] + 0.22, OWNH[1] - 0.15, 1.2)), u)), 1.0)
    grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "judging", t, level=-0.05)
    hc = head_c(OWN)
    zc(t, d, (hc.x, hc.y, hc.z - 0.5), (hc.x, hc.y, hc.z - 0.42), (-6, 1.6, 0.98, 30), (-3, 1.42, 1.02, 30), e=1.4)
    fx(t, snap=(ts + 0.02, 1.1))


C = CUT8
F_HIM = round((WL[0][6]["e"] + 0.12) * FPS8)
BEATS8 = [  # name, f0, f1, fn, board fraction
    ("01a", 0, wf(0, 6), b01b, 0.6), ("01b", wf(0, 6), C[1], b01c, 0.6),
    ("02a", C[1], wf(1, 6), b02a, 0.8), ("02b", wf(1, 6), wf(1, 10), b02b, 0.7), ("02c", wf(1, 10), C[2], b02c, 0.6),
    ("03a", C[2], wf(2, 4), b03a, 0.8), ("03b", wf(2, 4), C[3], b03b, 0.6),
    ("04a", C[3], wf(3, 5), b04a, 0.8), ("04b", wf(3, 5), C[4], b04b, 0.6),
    ("05a", C[4], wf(4, 8), b05a, 0.7), ("05b", wf(4, 8), C[5], b05b, 0.85),
    ("06a", C[5], wf(5, 6), b06a, 0.7), ("06b", wf(5, 6), wf(5, 10), b06b, 0.6), ("06c", wf(5, 10), C[6], b06c, 0.85),
    ("07a", C[6], wf(6, 7), b07a, 0.8), ("07b", wf(6, 7), wf(6, 10), b07b, 0.7), ("07c", wf(6, 10), END8, b07c, 0.6),
]
BY8 = {b[0]: b for b in BEATS8}


def reset8():
    reset()                                                             # noqa: F821
    TREAT.location = (0, -40, 0); TREAT.rotation_euler = (0, 0, 0)
    for P in CAST.values():
        P.show(False); P.place((0, -40, 0))
        for c_, _ in P.ik.values():
            c_.influence = 0.0


def frame8(beat, f):
    name, f0, f1, fn, _ = beat
    reset8(); fn((f - f0) / FPS8, (f1 - f0) / FPS8)
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821


def people_low8():
    dg = bpy.context.evaluated_depsgraph_get(); out = {}
    for s_, P in CAST.items():
        if P.body.hide_render:
            continue
        ev = P.body.evaluated_get(dg); mw = ev.matrix_world
        out[s_] = min((mw @ v.co).z for v in ev.data.vertices)
    return out


def dog_glass():
    """dog vertices on the wrong side of the glass plane inside a pane's x-range (|x| > gap/2): >0 = through the glass."""
    if bpy.data.objects["glass1"].hide_render:
        return 0
    P_ = dog_low(bpy.context.evaluated_depsgraph_get())                 # noqa: F821
    side = P_[:, 1] < GY
    near = abs(P_[:, 1] - GY) < 0.03
    inx = (abs(P_[:, 0]) > GAP / 2) & (abs(P_[:, 0]) < GAP / 2 + GW) & (P_[:, 2] < GH + 0.06)
    return int((near & inx).sum())


def dog_in_people():
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


def people_glass():
    """human vertices within 2 cm of the glass plane inside a pane (the arm must pass through the GAP only)."""
    if bpy.data.objects["glass1"].hide_render:
        return 0
    dg = bpy.context.evaluated_depsgraph_get(); n = 0
    for P in CAST.values():
        if P.body.hide_render:
            continue
        ev = P.body.evaluated_get(dg); mw = ev.matrix_world
        for v in ev.data.vertices:
            w = mw @ v.co
            if abs(w.y - GY) < 0.02 and GAP / 2 < abs(w.x) < GAP / 2 + GW and w.z < GH + 0.06:
                n += 1
    return n


names = XA[1:] if XMODE in ("board", "feet") and len(XA) > 1 else [b[0] for b in BEATS8]
if XMODE == "board":
    out = os.path.join(Z8, "review", "raw"); os.makedirs(out, exist_ok=True)
    for n in names:
        b = BY8[n]; f = round(b[1] + b[4] * (b[2] - b[1])); frame8(b, f); render(os.path.join(out, f"{n}.png"), (540, 960))   # noqa: F821
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS8}, open(os.path.join(Z8, "review", "beats.json"), "w"), indent=1)
elif XMODE == "frames":
    b = BY8[XA[1]]; step = int(XA[2]) if len(XA) > 2 else 1
    out = os.path.join(Z8, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        frame8(b, f); render(os.path.join(out, f"{f:05d}.png"), (270, 480))   # noqa: F821
elif XMODE == "feet":
    rows = []
    for n in names:
        b = BY8[n]; pl, dl, ip, gl, pg = [], [], [], [], []
        for f in range(b[1], b[2], 2):
            frame8(b, f); pl.append(people_low8()); pg.append(people_glass())
            if not DOGS[0]["o"].hide_render:                            # noqa: F821
                dl.append(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()))   # noqa: F821
                ip.append(dog_in_people()); gl.append(dog_glass())
        line = f"{n}:" + (f" dog lowest {min(dl):+.3f}..{max(dl):+.3f} m, dog verts at the glass {max(gl)}" if dl else "")
        line += f", human verts at the glass panes {max(pg)}"
        for s_ in sorted({k for p_ in pl for k in p_}):
            v_ = [p_[s_] for p_ in pl if s_ in p_]; line += f" | {s_} lowest {min(v_):+.3f}..{max(v_):+.3f} m"
        for s_ in sorted({k for p_ in ip for k in p_}):
            v_ = [p_[s_] for p_ in ip if s_ in p_]
            line += f" | dog in {s_}: {max(x[0] for x in v_)} verts, min gap {min(x[1] for x in v_):.3f} m"
        rows.append(line); print("FEET", line)
    open(os.path.join(Z8, "review", "feet_check.txt"), "a").write("\n".join(rows) + "\n")
elif XMODE == "final":
    a_, b_ = int(XA[1]), int(XA[2])
    out = os.path.join(Z8, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a_, min(b_, END8)):
        p_ = os.path.join(out, f"{f:05d}.png")
        if not os.path.exists(p_):
            frame8(next(x for x in BEATS8 if x[1] <= f < x[2]), f); render(p_, (1080, 1920))   # noqa: F821
elif XMODE == "iso":
    # self-check BEFORE the board: each human isolated in the key pose (front / side / head front, 3/4, profile, shoulder,
    # both hands, the treat hand) and the dog isolated (sitting levelled, sad, judging, standing nose up, eating)
    out = os.path.join(Z8, "review", "iso"); os.makedirs(out, exist_ok=True)
    for tag, P, act, f, fc in (("owner_tease", OWN, "c_owner_idle", 40, "smile"), ("owner_scared", OWN, "c_owner_idle", 90, "scared"),
                               ("sci_offer", SCI, "c_scientist_idle", 40, "smile"), ("sci_laugh", SCI, "c_scientist_idle", 80, "laughing")):
        reset8(); room(); [hide(o, True) for o in GLASS_OBJS]; loc = (0.0, -0.6)   # noqa: F821
        hpose(P, act, f, loc, 0.0, fc, sh=3)
        hc = head_c(P); sd = "R"
        reach(P, sd, (hc.x - 0.2, hc.y - 0.35, hc.z - 0.15 if "tease" in tag or "laugh" in tag else 0.95)); grip_hand(P, sd); treat_in_hand(P, sd)
        bpy.context.view_layer.update(); r = P.bone_world("root"); hc = head_c(P)
        views = [("front", (r.x, r.y - 2.2, 1.0), (r.x, r.y, 0.9), 26), ("side", (r.x + 2.4, r.y, 1.0), (r.x, r.y, 0.9), 26),
                 ("head_f", (hc.x, hc.y - 0.75, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_34", (hc.x + 0.55, hc.y - 0.55, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_side", (hc.x + 0.78, hc.y, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("shoulder", (hc.x - 0.6, hc.y - 0.55, hc.z - 0.2), (hc.x - 0.15, hc.y, hc.z - 0.3), 35)]
        for s2 in "LR":
            bpy.context.view_layer.update(); w_ = P.bone_world(f"wrist.{s2}", tail=True)
            views.append((f"hand{s2}", (w_.x + (0.35 if s2 == "L" else -0.35), w_.y - 0.45, w_.z + 0.1), tuple(w_), 35))
        for v, cp, aim, lens in views:
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "lowest", round(people_low8().get(P.name, 9), 3))
    for tag, fn in (("dog_sit", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "judging", 0.3)),
                    ("dog_sad", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "sad", 0.3, level=0.0)),
                    ("dog_shocked", lambda: dog_stand((0.0, 0.0), (0.0, -2.0), "shocked", 0.3, head=-0.1)),
                    ("dog_noseup", lambda: dog_stand((0.0, 0.0), (0.0, -2.0), "happy", 0.3, wag=0.8, head=-0.25)),
                    ("dog_eat", lambda: dog_eat((0.0, 0.0), (0.0, -0.62), "happy", 0.3))):
        reset8(); room(); [hide(o, True) for o in GLASS_OBJS]; fn(); bpy.context.view_layer.update(); hd = dog_head(0)   # noqa: F821
        for v, cp, aim, lens in (("front", (0.0, -1.4, 0.8), (0.0, 0.0, 0.45), LENS), ("side", (1.5, 0.0, 0.8), (0.0, 0.0, 0.45), LENS),
                                 ("face", (hd.x, hd.y - 0.6, hd.z), tuple(hd), 35)):
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "dog lowest", round(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()), 3))   # noqa: F821
    # the glass wall + biscuit prop, isolated in the lab
    reset8(); room(); TREAT.location = (0.3, 0.0, 0.012)
    for v, cp, aim in (("glass_front", (0.4, -2.2, 0.9), (0.0, GY, 0.55)), ("glass_side", (2.2, -0.9, 0.9), (0.0, GY, 0.55)),
                       ("treat", (0.45, -0.25, 0.25), (0.3, 0.0, 0.02))):
        cam(cp, aim, LENS); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
        render(os.path.join(out, f"prop_{v}.png"), (360, 480))          # noqa: F821

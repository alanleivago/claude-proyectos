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
GW, GH = 1.15, 1.3              # each wall: width, height (the gap is open full height, so the hand passes above the rails too)
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
    mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = 0.09
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
_y0, _y1, _hx = GY - 0.2, GY + 0.37, GAP / 2 - 0.006               # the study's ramp: one solid wedge under the gap,
_RAMP = K.mesh_from("glass_ramp", [(-_hx, _y0, 0), (_hx, _y0, 0), (_hx, _y1, 0), (-_hx, _y1, 0), (-_hx, _y0, 0.31), (_hx, _y0, 0.31)],
                    [(0, 1, 2, 3), (0, 4, 5, 1), (4, 3, 2, 5), (0, 3, 4), (1, 5, 2)], FRAME_M, (0, 0, 0))   # high on the dog side
GLASS_OBJS.append(_RAMP)
for o_ in GLASS_OBJS:
    if o_.data.materials and o_.data.materials[0] in (GLASS_M, GLARE_M):
        o_.visible_shadow = False

# ---------------------------------------------------------------- v2: the living room dressed as a LAB (user: "the lab reads as the
# living room"): the home furniture hidden, plain grey wall panels with seams, a lab bench (clipboard, beakers, stopwatch),
# two traffic cones, yellow floor-tape marks and a video camera on a tripod. All low-poly 3D, flat colours (no new photos).
def kb(name, size, loc, mat):
    """K.box is centred: this one takes the BOTTOM centre."""
    return K.box(name, size, (loc[0], loc[1], loc[2] + size[2] / 2), mat)


LR_HOME = [o for o in bpy.data.objects if o.name.startswith(("armchair", "sofa_", "cush", "pillow", "throw", "rug", "bookshelf", "books",
           "shelf", "plant", "floor_lamp", "lamp_", "tv", "dogbed", "basket", "magstack", "pic", "mirror", "curt", "shoes_lr", "clock",
           "pf_", "sconce", "lr_tag", "out1", "out2", "out3", "lsw", "side", "st_", "vase", "end_table", "ftable"))]
LR_HOME += [c for o in list(LR_HOME) for c in o.children_recursive]
LAB_OBJS = []
_PAN = mcol("#D6DADD"); _SEAM = mcol("#9EA5AA"); _BENCH = mcol("#EEF0F1"); _MET = mcol("#8C9399"); _ORG = mcol("#F07A1A")   # noqa: F821
_WHT = mcol("#F4F4F2"); _YEL = mcol("#F2C230"); _BLK = mcol("#1C1C1E"); _CLIP = mcol("#7A5432")                          # noqa: F821
LXW, LYW0, LYW1 = sw((LX1, 0))[0], sw((0, LY0))[1], sw((0, LY1))[1]     # noqa: F821  the living-room walls in world metres
for nm, size, loc in (("lab_pan_win", (2 * LXW, 0.02, 3.3), (0, LYW1 - 0.02, 1.65)), ("lab_pan_back", (2 * LXW, 0.02, 3.3), (0, LYW0 + 0.02, 1.65)),
                      ("lab_pan_l", (0.02, LYW1 - LYW0, 3.3), (-LXW + 0.02, (LYW0 + LYW1) / 2, 1.65)),
                      ("lab_pan_r", (0.02, LYW1 - LYW0, 3.3), (LXW - 0.02, (LYW0 + LYW1) / 2, 1.65))):
    LAB_OBJS.append(kb(nm, size, (loc[0], loc[1], 0.0), _PAN))
for i in range(-3, 4):                                                  # vertical panel seams + a skirting band
    for nm, size, loc in ((f"lab_seam_w{i}", (0.025, 0.03, 3.2), (i * 1.0, LYW1 - 0.045, 0.0)), (f"lab_seam_b{i}", (0.025, 0.03, 3.2), (i * 1.0, LYW0 + 0.045, 0.0)),
                          (f"lab_seam_l{i}", (0.03, 0.025, 3.2), (-LXW + 0.045, i * 0.9, 0.0)), (f"lab_seam_r{i}", (0.03, 0.025, 3.2), (LXW - 0.045, i * 0.9, 0.0))):
        LAB_OBJS.append(kb(nm, size, loc, _SEAM))
for nm, size, loc in (("lab_skirt_w", (2 * LXW, 0.03, 0.12), (0, LYW1 - 0.05, 0)), ("lab_skirt_b", (2 * LXW, 0.03, 0.12), (0, LYW0 + 0.05, 0)),
                      ("lab_skirt_l", (0.03, LYW1 - LYW0, 0.12), (-LXW + 0.05, (LYW0 + LYW1) / 2, 0)), ("lab_skirt_r", (0.03, LYW1 - LYW0, 0.12), (LXW - 0.05, (LYW0 + LYW1) / 2, 0))):
    LAB_OBJS.append(kb(nm, size, loc, _SEAM))
for k, (img_, px_, py_, ry_) in enumerate((("pic_lab1", -1.4, LYW1 - 0.04, 0.0), ("pic_meme3", 1.3, LYW0 + 0.06, math.pi))):
    fr_ = kb(f"lab_poster_fr{k}", (0.78, 0.03, 1.02), (px_, py_, 1.15), _BLK); LAB_OBJS.append(fr_)
    pp_ = K.plane(f"lab_poster{k}", 0.7, 0.94, (px_, py_ - 0.025 * (1 if ry_ == 0 else -1), 1.66), rot=(math.pi / 2, 0, ry_), mat=mtex(img_) if isinstance(img_, str) else K.mat_image(f"lab_poster_m{k}", img_, emit_only=False))   # noqa: F821
    LAB_OBJS.append(pp_)
for k, (nm_, px_, py_, ry_) in enumerate((("pic_meme1", -LXW + 0.05, -0.4, math.pi / 2), ("pic_lab3", LXW - 0.05, 0.9, -math.pi / 2))):
    LAB_OBJS.append(kb(f"lab_poster_frs{k}", (0.03, 0.66, 0.86), (px_ + (0.01 if k == 0 else -0.01), py_, 1.2), _BLK))
    LAB_OBJS.append(K.plane(f"lab_posters{k}", 0.6, 0.8, (px_ + (0.03 if k == 0 else -0.03), py_, 1.63), rot=(math.pi / 2, 0, ry_), mat=mtex(nm_)))   # noqa: F821
_LITE = K.mat_color("lab_lite", "#F6F8FA", emit_only=True)
for k, (lx_, ly_) in enumerate(((-1.2, -1.2), (1.2, -1.2), (-1.2, 1.2), (1.2, 1.2))):   # ceiling light panels
    LAB_OBJS.append(K.box(f"lab_light{k}", (1.2, 0.3, 0.03), (lx_, ly_, sw((0, 0, LH))[2] - 0.03), _LITE))   # noqa: F821
LAB_OBJS.append(kb("lab_shelf", (1.2, 0.3, 0.03), (-1.8, LYW0 + 0.2, 1.45), _BENCH))
for k, (dx, w_, h_, col_) in enumerate(((-0.4, 0.22, 0.2, "#C9A86A"), (-0.12, 0.2, 0.28, "#7FA7C9"), (0.18, 0.26, 0.16, "#E0E0DA"), (0.42, 0.14, 0.24, "#9CC59A"))):
    LAB_OBJS.append(kb(f"lab_box{k}", (w_, 0.22, h_), (-1.8 + dx, LYW0 + 0.2, 1.48), mcol(col_)))   # noqa: F821
BX, BY = 1.6, 1.75                                                      # the lab bench behind the scientist
LAB_OBJS.append(kb("lab_bench_top", (1.8, 0.7, 0.04), (BX, BY, 0.88), _BENCH))
LAB_OBJS.append(kb("lab_bench_shelf", (1.7, 0.6, 0.03), (BX, BY, 0.25), _MET))
for ix in (-1, 1):
    for iy in (-1, 1):
        LAB_OBJS.append(kb(f"lab_bench_leg{ix}{iy}", (0.05, 0.05, 0.88), (BX + ix * 0.85, BY + iy * 0.3, 0), _MET))
LAB_OBJS.append(kb("lab_clipboard", (0.24, 0.32, 0.012), (BX - 0.45, BY - 0.1, 0.92), _CLIP))
LAB_OBJS.append(kb("lab_clip_paper", (0.21, 0.27, 0.004), (BX - 0.45, BY - 0.12, 0.932), _WHT))
LAB_OBJS.append(kb("lab_clip_clip", (0.09, 0.03, 0.02), (BX - 0.45, BY + 0.05, 0.932), _MET))
for k, (bx, r0, r1, hh) in enumerate(((BX + 0.1, 0.05, 0.035, 0.16), (BX + 0.25, 0.04, 0.04, 0.12), (BX + 0.38, 0.035, 0.035, 0.2))):
    LAB_OBJS.append(frustum(f"lab_beaker{k}", r0, r1, hh, (bx, BY + 0.05, 0.9), mcol(("#BFE3F0", "#CDEBD6", "#E8E0F6")[k]), seg=10))   # noqa: F821
LAB_OBJS.append(frustum("lab_watch", 0.05, 0.05, 0.025, (BX + 0.62, BY - 0.12, 0.9), _BLK, seg=12))   # noqa: F821
LAB_OBJS.append(frustum("lab_watch_face", 0.042, 0.042, 0.004, (BX + 0.62, BY - 0.12, 0.925), _WHT, seg=12))   # noqa: F821
for k, cx in enumerate((-1.75, 2.45)):                                  # traffic cones beside the wall ends
    LAB_OBJS.append(kb(f"lab_cone_base{k}", (0.3, 0.3, 0.03), (cx, -0.15, 0), _ORG))
    LAB_OBJS.append(frustum(f"lab_cone{k}", 0.12, 0.02, 0.48, (cx, -0.15, 0.03), _ORG, seg=10))   # noqa: F821
    LAB_OBJS.append(frustum(f"lab_cone_band{k}", 0.085, 0.07, 0.07, (cx, -0.15, 0.2), _WHT, seg=10))   # noqa: F821
for nm, size, loc in (("lab_tape_start", (0.7, 0.05, 0.004), (0.0, -0.95, 0.0)), ("lab_tape_l", (0.05, 0.5, 0.004), (-0.33, -0.72, 0.0)),
                      ("lab_tape_r", (0.05, 0.5, 0.004), (0.33, -0.72, 0.0)), ("lab_tape_x1", (0.3, 0.04, 0.004), (0.3, 0.75, 0.0)),
                      ("lab_tape_x2", (0.04, 0.3, 0.004), (0.3, 0.75, 0.0))):
    LAB_OBJS.append(kb(nm, size, loc, _YEL))
TRI = (-1.55, -1.7)                                                     # video camera on a tripod, aimed at the gap
for k in range(3):
    a_ = 2 * math.pi * k / 3; lg = K.box(f"lab_tri_leg{k}", (0.025, 0.025, 1.22), (0, 0, 0), _BLK)
    lg.location = (TRI[0] + 0.2 * math.cos(a_), TRI[1] + 0.2 * math.sin(a_), 0.6); lg.rotation_euler = (0.18 * math.sin(a_), -0.18 * math.cos(a_), 0)
    LAB_OBJS.append(lg)
_cy = yaw_to(TRI, (0.0, GY))                                            # noqa: F821
_fw = (math.sin(_cy), -math.cos(_cy))                                    # the camera's forward (kit yaw convention: 0 = facing -y)
for nm, size, fo, sd_, zz in (("lab_cam_body", (0.14, 0.24, 0.13), 0.0, 0.0, 1.2), ("lab_cam_lens", (0.09, 0.1, 0.09), 0.16, 0.0, 1.22),
                              ("lab_cam_vf", (0.05, 0.08, 0.05), -0.04, 0.08, 1.33)):
    o_ = K.box(nm, size, (0, 0, 0), _BLK); o_.rotation_euler = (0, 0, _cy)
    o_.location = (TRI[0] + fo * _fw[0] + sd_ * _fw[1], TRI[1] + fo * _fw[1] - sd_ * _fw[0], zz)
    LAB_OBJS.append(o_)
LAB_OBJS.append(frustum("lab_cam_red", 0.012, 0.012, 0.01, (TRI[0], TRI[1], 1.33), mcol("#E0201A"), seg=6))   # noqa: F821


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
    # v2: body skin tone, garment seams and the softer face edge are now IN the kit (photo_tools/skin_match.py + kit_fix.py)
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
    a = ACT8[act] if act in ACT8 else ACT8.setdefault(act, HU.load_action(act)); P.show(True); P.place(loc, yaw); P.play(a)
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
    abduct(P)
    P.face(face)
    if sh is not None:
        bpy.context.view_layer.update(); r = P.bone_world("root")
        cshadow(sh, r.x, r.y, 0.0, 0.62, 0.5, yaw)                     # noqa: F821
    return P


def pose_of(P, act, f):
    a = ACT8[act] if act in ACT8 else ACT8.setdefault(act, HU.load_action(act)); P.play(a)
    a0, a1 = a.frame_range; sc.frame_set(int(min(max(round(f), a0), a1)))   # noqa: F821
    out = {pb.name: (pb.rotation_quaternion.copy(), pb.location.copy()) for pb in P.rig.pose.bones}
    P.rig.animation_data.action = None
    return out


def hpose_blend(P, actA, fA, actB, fB, u, loc, yaw, face="neutral", sh=None):
    """v2: a smooth move between two mocap poses (per-bone quaternion slerp, eased u): natural arcs, no IK flips."""
    P.show(True); P.place(loc, yaw)
    A, B = pose_of(P, actA, fA), pose_of(P, actB, fB); u = ease8(u)
    for pb in P.rig.pose.bones:
        qa, la = A[pb.name]; qb, lb = B[pb.name]
        pb.rotation_quaternion = qa.slerp(qb, u); pb.location = la.lerp(lb, u)
    for pb in P.rig.pose.bones:
        if pb.name.startswith("finger"):
            pb.rotation_quaternion = pb.rotation_quaternion.slerp(Quaternion((1, 0, 0, 0)), FINGER_OPEN)
    for c_, _ in P.ik.values():
        c_.influence = 0.0
    abduct(P)
    P.face(face)
    if sh is not None:
        bpy.context.view_layer.update(); r = P.bone_world("root")
        cshadow(sh, r.x, r.y, 0.0, 0.62, 0.5, yaw)                     # noqa: F821


ABDUCT = {"scientist": 9.0, "owner": 10.0}   # deg: hanging arms clear the torso / coat (v2 arm-vs-torso QA)


def abduct(P, deg=None):
    """swing each HANGING upper arm out from the body about the body's forward axis (scaled by how much it hangs), so
    the hands never sink into the torso / lab-coat surface; raised or reaching arms are left as the mocap has them."""
    deg = ABDUCT.get(P.name, 0.0) if deg is None else deg
    if not deg:
        return
    bpy.context.view_layer.update()
    fwd = (P.rig.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized(); c = P.bone_world("spine03")
    for sd in "LR":
        pb = P.rig.pose.bones[f"upperarm01.{sd}"]
        h = P.bone_world(f"upperarm01.{sd}"); tl = P.bone_world(f"upperarm01.{sd}", tail=True); d = (tl - h).normalized()
        k = min(1.0, max(0.0, -d.z - 0.3) / 0.6)
        if k <= 0:
            continue
        side = h - c; side.z = 0; side.normalize()
        best = None
        for sg in (1, -1):
            q = Quaternion(fwd, sg * math.radians(deg) * k)
            if best is None or (q @ d).dot(side) > (best @ d).dot(side):
                best = q
        mq = (P.rig.matrix_world @ pb.matrix).to_quaternion()
        pb.rotation_quaternion = pb.rotation_quaternion @ (mq.inverted() @ best @ mq)
        bpy.context.view_layer.update()


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


def ramp_z(y):
    """top of the wedge ramp under the gap at y (world)."""
    return 0.011 + 0.31 * max(0.0, min(1.0, (GY + 0.37 - y) / 0.57))


def treat_fall(t, t0, p0, roll_to, slide_d=0.35, roll_d=0.45):
    """dropped (the study's clumsy condition): falls from the hand onto the ramp under the gap, slides down it to her side,
    small bounce on the floor, rolls on to roll_to."""
    u = t - t0; zr = ramp_z(p0[1])
    tf = math.sqrt(max(0.01, 2 * max(0.0, p0[2] - zr) / 9.81))
    yb = GY + 0.37                                                       # the ramp's foot (her side)
    if u <= tf:
        TREAT.location = (p0[0], p0[1], p0[2] - 0.5 * 9.81 * u * u); TREAT.rotation_euler = (9.0 * u, 4.0 * u, 0.6); return
    v = u - tf
    if v <= slide_d:
        k = (v / slide_d) ** 1.6; y = p0[1] + (yb - p0[1]) * k
        TREAT.location = (p0[0], y, ramp_z(y)); TREAT.rotation_euler = (-math.atan2(0.31, 0.57), 0, 0.6 + 2.0 * k); return
    w = v - slide_d; q = ease8(w / roll_d); bh = 0.03 * math.sin(math.pi * min(1.0, w / 0.15)) if w < 0.15 else 0.0
    TREAT.location = (p0[0] + (roll_to[0] - p0[0]) * q, yb + (roll_to[1] - yb) * q, 0.012 + bh)
    TREAT.rotation_euler = (0, 0, 2.6 + 3.0 * q)


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
DOGH = (HXW - 0.15, DOORY - 3.5)       # the dog sitting in the hallway, facing him (+y)
OWN_YAW = yaw_to(OWNH, (DOGH[0], DOGH[1] - 1.0))   # noqa: F821
SCIP = (-0.18, 0.62)                   # the scientist just behind the glass wall, facing the dog (-y)
SCI_YAW = yaw_to(SCIP, (-0.1, -2.0))   # noqa: F821
DOGL = (0.02, -0.38)                   # the dog in front of the gap (lab)
GAPP = (0.0, GY - 0.07, 0.95)          # the hand + biscuit just through the gap (dog side)
DROP_AT = (0.05, GY + 0.1)             # the biscuit lands on HER side ...
ROLL_TO = (0.48, 0.62)                 # ... and rolls a little away from her feet (the study's ramp)
AROUND = [(0.02, -0.38), (0.8, -0.36), (1.38, 0.0), (1.42, 0.55), (1.1, 0.68), (0.86, 0.66)]   # around the +x end


def room():
    for o in LR_CT:                                                     # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:
        hide(o, False)                                                  # noqa: F821
    for o in FACADE + RACK:                                             # noqa: F821
        hide(o, False)                                                  # noqa: F821
    for o in GLASS_OBJS + LAB_OBJS:
        hide(o, False)                                                  # noqa: F821
    for o in LR_HOME:
        hide(o, True)                                                   # noqa: F821


def hall(door=-1.75):
    for o in FACADE + RACK:                                             # noqa: F821
        hide(o, True)                                                   # noqa: F821
    for o in SKYO:
        hide(o, o.name in ("r_sky", "st_sky0", "st_sky1", "p_sky2", "p_sky3"))   # noqa: F821
    DOOR_PIV.rotation_euler = (0, 0, door)                              # noqa: F821
    for o in GLASS_OBJS + LAB_OBJS:
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


def dog_eat_blend(p, target, expr, t, k):
    """dog_eat, eased in over k (0 = standing at the end of the trot, 1 = nose on the biscuit): head, neck, chest and the
    small body shift that puts the nose on it all blend, so the cut from trot to eating no longer pops."""
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, target), expr, t)            # noqa: F821
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3 * k)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25 * k)]); D.move(dd["arm"], "chest", (0, 0, -0.12 * k))   # noqa: F821
    D.rot(dd["arm"], "jaw", (1, 0, 0), k * (0.12 + 0.1 * math.sin(2 * math.pi * 4 * t)))   # noqa: F821
    mv = DOGS[0]["mv"]; l0 = mv.location.copy(); nose_at(0, (target[0], target[1], 0.0), -0.01); l1 = mv.location.copy()   # noqa: F821
    mv.location = l0.lerp(l1, k); ground_dog(0)                          # noqa: F821
    return dd


def clip_frame(t, keys):
    """piecewise mapping shot time -> clip frame, eased inside each segment (no speed kinks at the hold keys)."""
    if t <= keys[0][0]:
        return keys[0][1]
    for (t0, f0), (t1, f1) in zip(keys[:-1], keys[1:]):
        if t <= t1:
            u = (t - t0) / max(t1 - t0, 1e-6)
            return f0 + (f1 - f0) * (u if abs(f1 - f0) / max(t1 - t0, 1e-6) < 40 else ease8(u))
    return keys[-1][1]


_SP = {}


def offer_side(act, hold):
    """the hand that reaches forward in the clip (toward the glass = -y once she faces it)."""
    hpose(SCI, act, hold, (0, 3.0), SCI_YAW)
    bpy.context.view_layer.update()
    return min("LR", key=lambda s_: SCI.bone_world(f"wrist.{s_}", tail=True).y)


def sci_place(act, hold):
    """v2 (user: "the hand motion at ~10 s looks horrible" -> real Kimodo mocap, no IK): she is PLACED so the clip's own
    held offer puts her hand (+ biscuit) just through the gap; the body stays behind the glass."""
    if act in _SP:
        return _SP[act]
    sd = offer_side(act, hold)
    hpose(SCI, act, hold, SCIP, SCI_YAW); grip_hand(SCI, sd); bpy.context.view_layer.update()
    w = treat_in_hand(SCI, sd)
    loc = (SCIP[0] - w.x, SCIP[1] + (GY - 0.06) - w.y)
    _SP[act] = (loc, sd, w.z)
    return _SP[act]


def sci_act(act, f, face, hold, treat=True, grip=True):
    loc, sd, _ = sci_place(act, hold)
    hpose(SCI, act, f, loc, SCI_YAW, face, sh=2)
    if grip:
        grip_hand(SCI, sd, 1.0)
    if treat:
        treat_in_hand(SCI, sd)
    return sd


def sci_idle(f, face, treat=True, act="c_scientist_idle"):
    """her idle (or the laugh clip), standing where the offer clip placed her, the biscuit in her closed hand."""
    loc, sd, _ = sci_place("z8_sci_offer_pull", OFFER_HOLD)
    hpose(SCI, act, f, loc, SCI_YAW, face, sh=2)
    if treat:
        grip_hand(SCI, sd, 1.0); treat_in_hand(SCI, sd)
    return sd


def owner_act(act, f, face, sd="R", treat=True):
    hpose(OWN, act, f, OWNH, OWN_YAW, face, sh=3)
    if treat:
        grip_hand(OWN, sd, 1.0); treat_in_hand(OWN, sd)


OFFER_HOLD = 55                       # z8_sci_offer_pull: reach 1-20, hold 20-97, withdraw 97-115
DROP_HOLD = 30                        # z8_sci_offer_drop (keys set after the bake check)
DROP_REL = 40                         # its release frame


# ================================================================ beats (t = s into the shot, d = shot length)
def b01a(t, d):   # hallway, dog MFS -> MS, camera 0.78 m pitched down, push-in: the dog faces us, suspicious; owner's leg + treat hand cropped
    hall()
    hpose(OWN, "c_owner_idle", 1 + t * 30, OWNH, OWN_YAW, "smile", sh=3)
    reach(OWN, "R", (OWNH[0] + 0.25, OWNH[1] - 0.32, 1.05 + 0.04 * math.sin(2 * math.pi * 1.6 * t))); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.25)
    zc(t, d, (DOGH[0], DOGH[1], 0.55), (DOGH[0], DOGH[1], 0.57), (146, 1.4, 0.8, LENS), (152, 1.12, 0.78, LENS), e=1.6)


def b01b(t, d):   # over the dog's head (fg): the owner TEASES - Kimodo z8_owner_tease, the biscuit wiggled by his face
    hall()
    owner_act("z8_owner_tease", clip_frame(t, [(0.0, 25), (0.6, 27.5), (1.63, 31)]), "smile", sd=TEASE_SD)
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.1)
    hc = head_c(OWN)
    zc(t, d, (hc.x - 0.05, hc.y, hc.z - 0.42), (hc.x - 0.04, hc.y, hc.z - 0.34), (-16, 1.6, 1.22, LENS), (-6, 1.32, 1.28, LENS), e=1.4)


def b01c(t, d):   # dog MS 3/4, the HERO BARK in the gap after "him"; SNAP-zoom on it
    hall()
    dd = dog_sit_at(DOGH, (OWNH[0] + 0.3, OWNH[1]), "judging", t)
    bark_jaw(dd, t + BY8["01b"][1] / FPS8, BARK8)
    p_ = (DOGH[0], DOGH[1] - 0.02, 0.6)
    zc(t, d, p_, (p_[0], p_[1], 0.62), (196, 1.12, 0.8, 30), (190, 0.98, 0.78, 30), e=1.4)
    fx(t, snap=(BARK8 - BY8["01b"][1] / FPS8 - 0.03, 1.15))


def b02a(t, d):   # THE LAB (the one location shot): the scientist knee-up behind the glass wall, the dog's head in the
    room()        # foreground; "GERMANY, 2021" pops on "scientists"; crane down + push
    sci_idle(1 + t * 30, "smile")
    dog_sit_at((DOGL[0] + 0.3, DOGL[1] - 0.25), (0.0, 1.0), "happy", t, wag=0.7, level=0.0)
    zc(t, d, (0.0, 0.4, 1.0), (0.0, 0.4, 0.94), (-6, 2.45, 1.32, LENS), (-2, 2.1, 1.24, LENS), e=1.5)
    text_at("germany", t, wt(1, 2) - BY8["02a"][1] / FPS8 - 0.05, 0.0, 0.47, 1.0, 0.82)   # noqa: F821


def b02b(t, d):   # profile at the gap: her hand + the biscuit come THROUGH the gap (Kimodo offer clip); the dog, nose up to it
    room()
    sci_act("z8_sci_offer_pull", clip_frame(t, [(0.0, 1), (0.9, 22), (d, 30)]), "smile", OFFER_HOLD)
    zh = _SP["z8_sci_offer_pull"][2]
    dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.8, head=-0.4)
    zc(t, d, (0.0, 0.05, (0.75 + zh) / 2 - 0.08), (0.0, 0.03, (0.75 + zh) / 2 - 0.06), (-80, 1.4, 1.12, LENS), (-72, 1.18, 1.1, LENS), e=1.4)


def b02c(t, d):   # "a gap in a glass wall": her side, 3/4, push in on the GAP: the biscuit through it, the dog's nose at it
    room()
    sci_act("z8_sci_offer_pull", clip_frame(t, [(0.0, 30), (d, 55)]), "smile", OFFER_HOLD)
    zh = _SP["z8_sci_offer_pull"][2]
    dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.9, head=-0.4)
    zc(t, d, (0.0, 0.12, zh - 0.3), (0.0, 0.1, zh - 0.28), (128, 1.3, 1.08, LENS), (138, 1.08, 1.05, LENS), e=1.3)
    fx(t, whip=(0.2, 0.2))


def drop_keys(d):
    """v2: the drop uses the SAME Kimodo offer clip (its held reach), the fingers open on "dropped"; the drop-specific bake
    (z8_sci_offer_drop) only held the reach for 0.2 s, so it is not used. 03b continues into the clip's slow withdrawal."""
    tr = max(0.3, wt(2, 2) - BY8["03a"][1] / FPS8)
    return tr, [(0.0, 40), (d, 40 + d * 22), (d + 0.5, 97), (d + 1.2, 115), (d + 3.0, 119)]


_P0 = {}


def drop_p0():
    """where the biscuit leaves her hand: the offer clip's hold, at the release time."""
    if "p0" not in _P0:
        d3 = (BY8["03a"][2] - BY8["03a"][1]) / FPS8; tr, keys = drop_keys(d3)
        sci_act("z8_sci_offer_pull", clip_frame(tr, keys), "smile", OFFER_HOLD); _P0["p0"] = tuple(TREAT.location)
    return _P0["p0"]


def b03a(t, d):   # "dropped the treat": profile at the gap: her fingers open, the biscuit falls on the RAMP, slides to HER side
    room()
    tr, keys = drop_keys(d)
    p0 = drop_p0()
    sd = sci_act("z8_sci_offer_pull", clip_frame(t, keys), "smile" if t < tr + 0.15 else "surprised", OFFER_HOLD, treat=t < tr, grip=False)
    grip_hand(SCI, sd, 1.0 - 0.8 * ease8((t - tr) / 0.15))               # the fingers OPEN (the drop), smoothly
    if t >= tr:
        treat_fall(t, tr, p0, ROLL_TO)
    dog_stand(DOGL, (0.0, GY), "happy", t, wag=0.6 if t < tr else 0.2, head=-0.4 if t < tr else 0.2)
    zh = _SP["z8_sci_offer_pull"][2]
    zc(t, d, (0.0, 0.15, zh - 0.25), (0.02, 0.25, 0.45), (-82, 1.4, 0.98, LENS), (-74, 1.15, 0.86, LENS), e=1.4)


def b03b(t, d):   # "by accident": her side of the glass, waist-up: "oops" (surprised), the open hand drawn back slowly
    room()
    d3 = (BY8["03a"][2] - BY8["03a"][1]) / FPS8; tr, keys = drop_keys(d3)
    sd = sci_act("z8_sci_offer_pull", clip_frame(t + d3, keys), "surprised", OFFER_HOLD, treat=False, grip=False)
    grip_hand(SCI, sd, 0.2)
    treat_fall(t + d3, tr, drop_p0(), ROLL_TO)
    dog_stand(DOGL, (0.1, GY), "neutral", t, head=0.15)
    hc = head_c(SCI)
    zc(t, d, (hc.x + 0.05, hc.y, hc.z - 0.32), (hc.x + 0.04, hc.y, hc.z - 0.26), (-16, 1.3, 1.32, LENS), (-6, 1.05, 1.34, LENS), e=1.4)
    fx(t, snap=(0.12, 1.08))


def pull_keys(t_pull, d, f_in=60):
    """offer held (natural micro-motion of the clip's hold), then the clip's own withdrawal played 1.5x fast."""
    return [(0.0, f_in), (t_pull, 97), (t_pull + 0.4, 115), (max(d, t_pull + 0.5), 119)]


def b04a(t, d):   # "pulled it back": profile at the gap, the biscuit at the dog's nose ... PULLED back on "pulled" (mocap)
    room()
    tb = max(0.25, wt(3, 3) - BY8["04a"][1] / FPS8)
    sci_act("z8_sci_offer_pull", clip_frame(t, pull_keys(tb, d)), "smile" if t < tb + 0.25 else "laughing", OFFER_HOLD)
    zh = _SP["z8_sci_offer_pull"][2]
    dog_stand(DOGL, (0.0, GY), "happy" if t < tb + 0.15 else "shocked", t, wag=0.8 if t < tb else 0.0, head=-0.4 if t < tb else -0.15)
    zc(t, d, (0.0, 0.08, (0.75 + zh) / 2), (0.0, 0.12, (0.75 + zh) / 2 + 0.06), (-78, 1.35, 1.3, LENS), (-70, 1.2, 1.32, LENS), e=1.3)
    fx(t, snap=(tb + 0.05, 1.08))


def b04b(t, d):   # "on purpose": through the glass over the dog's head: she LAUGHS ("ha-ha") - Kimodo laugh clip, biscuit in hand
    room()
    sci_idle(60 + t * 30, "laughing")                                  # (the laugh clip put her forearm into her chest: arm-vs-torso QA)
    dog_stand(DOGL, (0.0, GY), "shocked", t, head=-0.1)
    loc = _SP["z8_sci_offer_pull"][0]
    zc(t, d, (loc[0] + 0.05, loc[1], 1.45), (loc[0] + 0.05, loc[1], 1.5), (10, 1.45, 1.4, LENS), (5, 1.22, 1.42, LENS), e=1.4)
    fx(t, shake=0.004)


def b05a(t, d):   # "when it was an accident": from her side through the glass, the biscuit in the fg on the floor; the dog
    room()        # sees it ... and sets off round the end of the wall
    sci_idle(100 + t * 25, "neutral", treat=False)
    TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012); TREAT.rotation_euler = (0, 0, 2.6)
    ts = max(0.4, wt(4, 4) - BY8["05a"][1] / FPS8)                       # sets off on "accident"
    dd, u = dog_path(t, ts, RUN_D, AROUND, "happy", rate=2.4)
    if u <= 0.0:
        nod(dd, 0.25)
    mv = DOGS[0]["mv"].location                                         # noqa: F821  follow him (smooth: the eased path, not the head)
    zc(t, d, (0.3 + 0.5 * (mv.x - 0.3), 0.1, 0.36), (0.3 + 0.5 * (mv.x - 0.3), 0.12, 0.38), (158, 1.3, 0.8, LENS), (146, 1.25, 0.8, LENS), e=1.2)


RUN_D = 1.7                                                             # the trot round the wall (s): arrives on "grab"


def b05b(t, d):   # "walked around to grab it": round the end of the glass, dog-level track, to the biscuit: eats it, wagging
    room()
    sci_idle(130 + t * 25, "smile", treat=False)
    t_pre = (BY8["05b"][1] - BY8["05a"][1]) / FPS8 - max(0.4, wt(4, 4) - BY8["05a"][1] / FPS8)
    dur = RUN_D; te = max(0.0, dur - t_pre - 0.05)
    if t < te:
        dd, u = dog_path(t + t_pre, 0.0, dur, AROUND, "happy", rate=2.4)
        TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012); TREAT.rotation_euler = (0, 0, 2.6)
    else:
        dd = dog_eat_blend(AROUND[-1], ROLL_TO, "happy", t, ease8((t - te) / 0.35))   # final QA: eased into the eat (it popped)
        TREAT.location = (ROLL_TO[0], ROLL_TO[1], 0.012) if t < te + 0.45 else (0, -40, 0)
    wag_on(dd, t, 0.35 if t < te else 0.8, 3.2)                        # v2: a small wag on the trot (a wide fast wag bent the tail tip into a block)
    zc(t, d, (0.72, 0.62, 0.3), (0.66, 0.63, 0.26), (196, 1.0, 0.72, LENS), (188, 0.88, 0.7, LENS), e=1.2)   # side-on: nose + biscuit readable   # fixed aim: he trots INTO the frame (tracking him made the rug crawl)


def b06a(t, d):   # "but when they were teased": low 3/4 over the dog's head: the offer pulled back again (mocap) + her laugh
    room()
    sci_act("z8_sci_offer_pull", clip_frame(t, pull_keys(0.3, d, 85)), "smile" if t < 0.5 else "laughing", OFFER_HOLD)
    dog_stand(DOGL, (0.0, GY), "happy" if t < 0.45 else "shocked", t, head=-0.3 if t < 0.4 else -0.1)
    zh = _SP["z8_sci_offer_pull"][2]
    zc(t, d, (0.0, GY + 0.05, zh - 0.15), (0.0, GY + 0.05, zh - 0.1), (-38, 1.6, 1.25, LENS), (-28, 1.35, 1.27, LENS), e=1.3)
    fx(t, whip=(-0.22, 0.2))


def b06b(t, d):   # "they waited way longer": her side through the glass, the dog SITS and waits, sad, ears back; slow orbit
    room()
    sci_idle(170 + t * 25, "smile")
    dog_sit_at(DOGL, (0.0, GY), "sad", t, level=0.0)
    zc(t, d, (DOGL[0], DOGL[1], 0.5), (DOGL[0], DOGL[1], 0.52), (132, 1.4, 0.82, LENS), (144, 1.15, 0.8, LENS), e=1.3)


def b06c(t, d):   # "and stopped wagging their tails": SIDE view of the sitting dog, face + tail both in frame: wag slows ... STOPS
    room()
    sci_idle(200 + t * 25, "smile")
    ts = max(0.25, wt(5, 10) - BY8["06c"][1] / FPS8)
    k = 1.0 - ease8((t - ts) / 0.55)
    dd = dog(0, (DOGL[0], DOGL[1], 0), yaw_to(DOGL, (0.0, GY)), "neutral" if k > 0.5 else "sad", t)   # noqa: F821
    D.happy_wag(dd["arm"], t, 0.9 * k, 4.0, up=-0.45 * (1 - k))          # noqa: F821  (always: the sad face must not tuck it out of sight)
    sit_grounded(0); nod(dd, 0.0)                                       # noqa: F821
    zc(t, d, (DOGL[0], DOGL[1] - 0.02, 0.36), (DOGL[0], DOGL[1] - 0.05, 0.34), (-100, 1.8, 0.74, LENS), (-90, 1.6, 0.72, LENS), e=1.3)


def fake_pose(tg, tf, face):
    """the fake: he offers the biscuit low (Kimodo z8_owner_fake) ... on "fake" it is lifted up out of reach (blend into the
    raised arm of k_wave_hello over 0.45 s: elbow bent, hand above the head), then held there with a slow sway."""
    if tg < tf:
        owner_act("z8_owner_fake", 10 + tg * 30, face, sd=FAKE_SD); return
    hpose_blend(OWN, "z8_owner_fake", 10 + tg * 30, "k_wave_hello", RAISE_F + (tg - tf) * 5, (tg - tf) / 0.45, OWNH, OWN_YAW, face, sh=3)
    grip_hand(OWN, FAKE_SD, 1.0); treat_in_hand(OWN, FAKE_SD)


def b07a(t, d):   # "so next time you fake a treat": the owner knee-up offers the biscuit low ... lifts it away on "fake"
    hall()
    tf = max(0.3, wt(6, 4) - BY8["07a"][1] / FPS8)
    fake_pose(t, tf, "smile")
    dog_sit_at(DOGH, OWNH, "happy" if t < tf + 0.2 else "judging", t, wag=0.7 if t < tf else 0.0, level=0.1)
    hc = head_c(OWN)
    zc(t, d, (hc.x - 0.05, hc.y - 0.3, hc.z - 0.36), (hc.x - 0.05, hc.y - 0.3, hc.z - 0.18), (-30, 1.3, 1.3, LENS), (-20, 1.2, 1.36, LENS), e=1.3)   # tilts up with the lift
    fx(t, whip=(0.22, 0.2))


def b07b(t, d):   # "he knows exactly": the dog MS, flat judging squint up at him, does NOT move; slow push, SNAP on "exactly"
    hall()
    d7 = (BY8["07a"][2] - BY8["07a"][1]) / FPS8; tf = max(0.3, wt(6, 4) - BY8["07a"][1] / FPS8)
    fake_pose(t + d7, tf, "smile")
    dog_sit_at(DOGH, OWNH, "judging", t, level=0.15)
    p_ = (DOGH[0], DOGH[1], 0.6)
    zc(t, d, p_, (p_[0], p_[1], 0.62), (200, 1.02, 0.8, 30), (194, 0.88, 0.78, 30), e=1.4)
    fx(t, snap=(max(0.1, wt(6, 9) - BY8["07b"][1] / FPS8 - 0.05), 1.15))


def b07c(t, d):   # "what you're doing": over the judging dog's head (fg), the owner BUSTED: a real startle (z6_owner_startle),
    hall()        # grin -> surprised (gasp) -> scared; the biscuit stays in his hand, the arms clear of the body
    ts = 0.25
    owner_act("z6_owner_startle", STARTLE_F0 + max(0.0, t - ts) * 30, "smile" if t < ts else ("surprised" if t < ts + 0.6 else "scared"), sd=STARTLE_SD)
    dog_sit_at(DOGH, OWNH, "judging", t, level=-0.05)
    hc = head_c(OWN)
    zc(t, d, (hc.x, hc.y, hc.z - 0.5), (hc.x, hc.y, hc.z - 0.42), (-6, 1.6, 0.98, 30), (-3, 1.42, 1.02, 30), e=1.4)
    fx(t, snap=(ts + 0.02, 1.1))


TEASE_SD = FAKE_SD = STARTLE_SD = "R"
STARTLE_F0 = 1
TEASE_UP = 25                         # z8_owner_tease: the frame with the hand up and out beside his head
RAISE_F = 28                          # k_wave_hello: the raised arm (hand above the head, elbow bent)


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


_GRP = {}


def arm_torso():
    """v2 QA (user: "the man's arm passes through his body"): per visible human, arm / hand vertices that are INSIDE the torso
    surface (nearest torso face, behind its normal by > 15 mm, within 10 cm), ignoring the shoulder blend zone (< 12 cm from
    the upper-arm joint). Returns {name: worst count, side}."""
    from mathutils.bvhtree import BVHTree
    dg = bpy.context.evaluated_depsgraph_get(); out = {}
    for s_, P in CAST.items():
        if P.body.hide_render:
            continue
        if s_ not in _GRP:
            vgn = {g.index: g.name for g in P.body.vertex_groups}; dom = []
            for v in P.body.data.vertices:
                g = max(v.groups, key=lambda g_: g_.weight) if v.groups else None
                dom.append(vgn[g.group] if g else "")
            tor = {i for i, n in enumerate(dom) if n.startswith(("spine", "clavicle", "breast", "pelvis", "root"))}
            arm = [i for i, n in enumerate(dom) if n.startswith(("lowerarm", "wrist", "finger", "metacarpal", "upperarm02"))]
            tf = [tuple(p.vertices) for p in P.body.data.polygons if all(i in tor for i in p.vertices)]
            _GRP[s_] = (arm, tf)
        arm, tf = _GRP[s_]
        ev = P.body.evaluated_get(dg); me = ev.to_mesh(); mw = ev.matrix_world
        W = [mw @ v.co for v in me.vertices]; ev.to_mesh_clear()
        bvh = BVHTree.FromPolygons(W, tf)
        sh = [P.bone_world(f"upperarm01.{sd}") for sd in "LR"]
        n = 0
        for i in arm:
            v = W[i]
            if min((v - j).length for j in sh) < 0.12:
                continue
            hit = bvh.find_nearest(v, 0.1)
            if hit[0] is not None and (v - hit[0]).dot(hit[1]) < -0.015:   # > 1.5 cm deep (a hand resting on the hip is 0-1 cm)
                n += 1
        out[s_] = n
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
        b = BY8[n]; pl, dl, ip, gl, pg, at = [], [], [], [], [], []
        for f in range(b[1], b[2], int(os.environ.get("FSTEP", "1"))):    # v2: every frame by default
            frame8(b, f); pl.append(people_low8()); pg.append(people_glass()); at.append(arm_torso())
            if not DOGS[0]["o"].hide_render:                            # noqa: F821
                dl.append(float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()))   # noqa: F821
                ip.append(dog_in_people()); gl.append(dog_glass())
        line = f"{n}:" + (f" dog lowest {min(dl):+.3f}..{max(dl):+.3f} m, dog verts at the glass {max(gl)}" if dl else "")
        line += f", human verts at the glass panes {max(pg)}"
        for s_ in sorted({k for a_ in at for k in a_}):
            line += f" | {s_} arm-in-torso verts max {max(a_.get(s_, 0) for a_ in at)}"
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
elif XMODE == "thumb":
    # thumbnail plate (guion.md): the hallway; the owner holds the biscuit HIGH out of reach with a smug grin; the dog sits
    # facing the lens with a flat judging squint. thumb.py adds the red "?" and "HE KNOWS."
    from bpy_extras.object_utils import world_to_camera_view
    out = os.path.join(Z8, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset8(); hall()
    hpose(OWN, "k_wave_hello", RAISE_F, OWNH, OWN_YAW, "smile", sh=3); grip_hand(OWN, "R"); treat_in_hand(OWN, "R")
    TREAT.scale = (1.6, 1.6, 1.6)
    dd = dog_sit_at((DOGH[0], DOGH[1] + 0.35), (DOGH[0], DOGH[1] - 3.0), "judging", 0.3, level=0.15)
    cam((DOGH[0] - 0.05, DOGH[1] - 0.75, 0.95), (DOGH[0] + 0.0, DOGH[1] + 1.0, 1.05), 22)   # noqa: F821
    bpy.context.view_layer.update(); K.ps1_snap_update(CAM)             # noqa: F821
    render(os.path.join(out, "A.png"), (1080, 1920))                    # noqa: F821
    pts = {"dog_head": dog_head(0), "owner_head": head_c(OWN), "treat": Vector(TREAT.location)}   # noqa: F821
    json.dump({k: [round(c, 4) for c in world_to_camera_view(sc, CAM, v)[:2]] for k, v in pts.items()}, open(os.path.join(out, "pts.json"), "w"))   # noqa: F821
elif XMODE == "iso":
    # v2 self-check BEFORE the board: each human isolated (front / 3/4 / profile, head front / 3/4 / profile, shoulder, both
    # hands) in the key mocap poses incl. the raised arm and the laugh; the dog trotting (side, 3 phases) and sitting.
    out = os.path.join(Z8, "review", "iso"); os.makedirs(out, exist_ok=True)
    for f_ in os.listdir(out):
        os.remove(os.path.join(out, f_))
    poses = [("owner_tease", OWN, "z8_owner_tease", 45, "smile"), ("owner_raised", OWN, "k_wave_hello", RAISE_F, "smile"),
             ("owner_startle", OWN, "z6_owner_startle", STARTLE_F0 + 20, "scared"), ("owner_laugh", OWN, "c_owner_idle", 40, "laughing"),
             ("sci_offer", SCI, "z8_sci_offer_pull", OFFER_HOLD, "smile"), ("sci_laugh", SCI, "k_laugh_bend_back", 30, "laughing")]
    for tag, P, act, f, fc in poses:
        reset8(); room(); [hide(o, True) for o in GLASS_OBJS]; loc = (0.0, -0.6)   # noqa: F821
        hpose(P, act, f, loc, 0.0, fc, sh=3)
        bpy.context.view_layer.update()
        sd = min("LR", key=lambda s_: P.bone_world(f"wrist.{s_}", tail=True).y) if "offer" in tag else max("LR", key=lambda s_: P.bone_world(f"wrist.{s_}", tail=True).z)
        grip_hand(P, sd); treat_in_hand(P, sd)
        bpy.context.view_layer.update(); r = P.bone_world("root"); hc = head_c(P)
        views = [("front", (r.x, r.y - 2.3, 1.05), (r.x, r.y, 0.95), 26), ("34", (r.x + 1.6, r.y - 1.6, 1.05), (r.x, r.y, 0.95), 26),
                 ("side", (r.x + 2.4, r.y, 1.05), (r.x, r.y, 0.95), 26),
                 ("head_f", (hc.x, hc.y - 0.75, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_34", (hc.x + 0.55, hc.y - 0.55, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("head_side", (hc.x + 0.78, hc.y, hc.z - 0.05), (hc.x, hc.y, hc.z - 0.1), 35),
                 ("shoulder", (hc.x - 0.6, hc.y - 0.55, hc.z - 0.2), (hc.x - 0.15, hc.y, hc.z - 0.3), 35)]
        for s2 in "LR":
            bpy.context.view_layer.update(); w_ = P.bone_world(f"wrist.{s2}", tail=True)
            views.append((f"hand{s2}", (w_.x + (0.3 if s2 == "L" else -0.3), w_.y - 0.4, w_.z + 0.1), tuple(w_), 35))
        for v, cp, aim, lens in views:
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
        print("ISO", tag, "lowest", round(people_low8().get(P.name, 9), 3), "arm-in-torso", arm_torso())
    for tag, fn in (("dog_trot1", lambda: dog_path(0.55, 0.0, 1.7, [(0.0, 0.6), (0.0, -1.2)], "happy", rate=2.4)),
                    ("dog_trot2", lambda: dog_path(0.75, 0.0, 1.7, [(0.0, 0.6), (0.0, -1.2)], "happy", rate=2.4)),
                    ("dog_trot3", lambda: dog_path(0.95, 0.0, 1.7, [(0.0, 0.6), (0.0, -1.2)], "happy", rate=2.4)),
                    ("dog_sad", lambda: dog_sit_at((0.0, 0.0), (0.0, -2.0), "sad", 0.3, level=0.0)),
                    ("dog_noseup", lambda: dog_stand((0.0, 0.0), (0.0, -2.0), "happy", 0.3, wag=0.8, head=-0.4))):
        reset8(); room(); [hide(o, True) for o in GLASS_OBJS]; r_ = fn(); dd_ = r_[0] if isinstance(r_, tuple) else r_
        if "trot" in tag:
            wag_on(dd_, 0.4, 0.35, 3.2)
        bpy.context.view_layer.update(); hd = dog_head(0)                # noqa: F821
        mv = DOGS[0]["mv"].location                                     # noqa: F821
        for v, cp, aim, lens in (("side", (mv.x + 1.6, mv.y, 0.7), (mv.x, mv.y, 0.4), LENS), ("rear34", (mv.x + 1.0, mv.y + 1.2, 0.6), (mv.x, mv.y, 0.35), LENS),
                                 ("face", (hd.x, hd.y - 0.6, hd.z), tuple(hd), 35)):
            cam(cp, aim, lens); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
            render(os.path.join(out, f"{tag}_{v}.png"), (360, 480))     # noqa: F821
    reset8(); room(); TREAT.location = (0.3, 0.62, 0.012)
    for v, cp, aim in (("lab_front", (0.4, -2.6, 1.2), (0.0, GY, 0.8)), ("lab_back", (0.2, 2.2, 1.3), (0.0, -0.5, 0.6)),
                       ("ramp", (0.7, -0.4, 0.6), (0.0, GY, 0.2))):
        cam(cp, aim, LENS); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)   # noqa: F821
        render(os.path.join(out, f"prop_{v}.png"), (360, 480))          # noqa: F821

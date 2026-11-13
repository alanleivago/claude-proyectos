"""zaw-dog #5 "You Should Let Your Dog Sniff Everything on Walks" - Blender scenes + storyboard frames.
Copied from zaw-dog-04 (approved): every kit set is built (living room = the "lab", the street outside its window, hallway,
bedroom, DOG PARK). Used in #5: street, living room, park only - no new set.
New for #5 (Flow props sheet 2026-11-10, prep_05.py): steel bowls (food / empty / mystery, lofted + top-down photo), the
cast-iron lamppost (lantern + pole lofted), striped towel, treats, newspaper headline cards, 20 dog portrait cards,
sparkles, the 3D texts 300,000,000 / 6,000,000 / BARNARD COLLEGE, 2019 / check / cross / ? / 2 WEEKS / NO! / MORE OPTIMISTIC.
ONE FRESH BLENDER PROCESS PER SHOT (a long single session left skin-coloured plane artefacts in 03):
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- board <beat>          one frame -> review/raw/<beat>.png
                                                              -- frames <beat> [step]   every frame of a beat -> review/anim/<beat>/
                                                              -- feetscan [beat ...]     review/feet_check.txt
Camera grammar from ../zaw-dog-03/ref/CAMERA.md (wide 22-30 mm, dog-eye height, hold then slow push/track, hard cuts)."""
import json
import math
import os
import random
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
for p in (H, os.path.join(ROOT, "pieces", "zaw-dog-v2"), os.path.join(ROOT, "pieces", "lps-onoda"), os.path.join(ROOT, "pieces", "lps-lowpoly-test")):
    sys.path.insert(0, p)
import bmesh  # noqa: E402
import numpy as np  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
import lpskit as K  # noqa: E402
import dog as D  # noqa: E402
import photoprop as PP  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["board"]
MODE = ARGS[0]
T = os.path.join(H, "tex")
TIM = json.load(open(os.path.join(H, "voice", "timing.json")))
FPS = 30
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
PROPS = json.load(open(os.path.join(T, "props.json")))


def word_cut(line, idx):
    w = [x for x in TIM["words"] if x["line"] == line][idx]
    return round((w["s"] - 0.15) * FPS)


# ---------------------------------------------------------------- materials / building blocks

def img(n):
    im = bpy.data.images.load(os.path.join(T, f"{n}.png"), check_existing=True)
    im.pack()
    return im


_mats = {}


def mtex(n, repeat=(1, 1)):
    key = (n, repeat)
    if key not in _mats:
        _mats[key] = K.mat_image(f"m_{n}", img(n), repeat=repeat)
    return _mats[key]


def mcol(hexc):
    if hexc not in _mats:
        _mats[hexc] = K.mat_color(f"c_{hexc}", hexc)
    return _mats[hexc]


def mcut(n):
    """photo cut-out: alpha clip (> 0.5) + dithered, so cards sort correctly."""
    key = ("cut", n)
    if key not in _mats:
        m = bpy.data.materials.new(f"cut_{n}"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
        out = nt.nodes.new("ShaderNodeOutputMaterial"); t = nt.nodes.new("ShaderNodeTexImage")
        t.image = img(n); t.interpolation = "Closest"
        gt = nt.nodes.new("ShaderNodeMath"); gt.operation = "GREATER_THAN"; gt.inputs[1].default_value = 0.5
        nt.links.new(t.outputs[1], gt.inputs[0])
        K.flat_shader(nt, t.outputs[0], out, gt.outputs[0])
        m.surface_render_method = "DITHERED"
        _mats[key] = m
    return _mats[key]


def aspect(n):
    w, h = img(n).size
    return w / h


def box(name, size, loc, mat, uv=1.0):
    """box by its BOTTOM centre (props stand on the floor: no floating)."""
    return K.box(name, size, (loc[0], loc[1], loc[2] + size[2] / 2), mat, uv_scale=uv)


def card(name, n, h, loc, yaw=0.0, w=None):
    """standing photo cut-out, bottom centre at loc, facing -Y rotated by yaw."""
    w = w or h * aspect(n)
    o = K.plane(name, w, h, (0, 0, 0), rot=(math.pi / 2, 0, yaw), mat=mcut(n))
    o.location = (loc[0], loc[1], loc[2] + h / 2)
    return o


def front_box(name, n, size, loc, yaw=0.0, side="#6B4A30", uvr=(0, 0, 1, 1)):
    """textured box: the photo on its front (-Y before yaw), a matching colour on the other faces."""
    o = box(name, size, (0, 0, 0), mtex(n)); me = o.data; me.materials.append(mcol(side))
    w, d, h = size; u0, v0, u1, v1 = uvr; uvl = me.uv_layers.active
    for p in me.polygons:
        if p.normal.y < -0.5:
            p.material_index = 0
            for li, vi in zip(p.loop_indices, p.vertices):
                c = me.vertices[vi].co
                uvl.data[li].uv = (u0 + (c.x / w + 0.5) * (u1 - u0), v0 + (c.z / h + 0.5) * (v1 - v0))
        else:
            p.material_index = 1
    o.location = (loc[0], loc[1], loc[2] + h / 2); o.rotation_euler = (0, 0, yaw)
    return o


def prism(name, r, depth, loc, yaw, n, seg=16, side="#DDDDDD"):
    """round wall disc (clock, plate): photo on the front cap (-Y), facing -Y rotated by yaw."""
    vs, fs = [], []
    for k in range(seg):
        a = 2 * math.pi * k / seg
        vs += [(r * math.cos(a), 0, r * math.sin(a)), (r * math.cos(a), depth, r * math.sin(a))]
    fs.append([2 * k for k in range(seg)][::-1]); fs.append([2 * k + 1 for k in range(seg)])
    fs += [(2 * k, 2 * ((k + 1) % seg), 2 * ((k + 1) % seg) + 1, 2 * k + 1) for k in range(seg)]
    o = K.mesh_from(name, vs, fs); me = o.data
    me.materials.append(mtex(n)); me.materials.append(mcol(side))
    uvl = me.uv_layers.new()
    for p in me.polygons:
        p.material_index = 0 if p.index == 0 else 1
        for li, vi in zip(p.loop_indices, p.vertices):
            c = me.vertices[vi].co; uvl.data[li].uv = (0.5 + c.x / (2 * r), 0.5 + c.z / (2 * r))
    o.location = loc; o.rotation_euler = (0, 0, yaw)
    return o


def frustum(name, r0, r1, h, loc, mat, seg=8):
    vs = [(r * math.cos(2 * math.pi * k / seg), r * math.sin(2 * math.pi * k / seg), z) for z, r in ((0, r0), (h, r1)) for k in range(seg)]
    fs = [(k, (k + 1) % seg, seg + (k + 1) % seg, seg + k) for k in range(seg)] + [list(range(seg))[::-1], list(range(seg, 2 * seg))]
    o = K.mesh_from(name, vs, fs, mat, loc)
    me = o.data; uvl = me.uv_layers.new()
    for p in me.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c = me.vertices[vi].co; uvl.data[li].uv = (math.atan2(c.y, c.x) / 6.283 + 0.5, c.z / max(h, 1e-3))
    return o


def wall(name, axis, at, a0, a1, z0, z1, holes, mat, t=0.12, uv=1.0):
    """a wall with real thickness and rectangular openings, split into boxes. axis 'y': wall plane y=at running along x."""
    cuts = sorted(holes)
    segs = []
    x = a0
    for (h0, h1, hz0, hz1) in cuts:
        segs.append((x, h0, z0, z1))
        if hz0 > z0:
            segs.append((h0, h1, z0, hz0))
        if hz1 < z1:
            segs.append((h0, h1, hz1, z1))
        x = h1
    segs.append((x, a1, z0, z1))
    out = []
    for i, (p0, p1, q0, q1) in enumerate(segs):
        if p1 - p0 < 1e-3 or q1 - q0 < 1e-3:
            continue
        if axis == "y":
            out.append(K.box(f"{name}{i}", (p1 - p0, t, q1 - q0), ((p0 + p1) / 2, at, (q0 + q1) / 2), mat, uv_scale=uv))
        else:
            out.append(K.box(f"{name}{i}", (t, p1 - p0, q1 - q0), (at, (p0 + p1) / 2, (q0 + q1) / 2), mat, uv_scale=uv))
    for o in out:
        world_uv(o, uv)
    return out


def world_uv(o, sc_):
    """UVs from world position (u along the wall, v = height), so the texture's skirting grime lines up with z = 0."""
    me = o.data; uvl = me.uv_layers.active; L_ = o.location
    for p in me.polygons:
        n = p.normal
        for li, vi in zip(p.loop_indices, p.vertices):
            c = me.vertices[vi].co + L_
            uvl.data[li].uv = ((c.y if abs(n.x) > 0.5 else c.x) * sc_, (c.z if abs(n.z) < 0.5 else (c.y if abs(n.x) < 0.5 else c.x)) * sc_)


def mat_wall(n, top=0.22, bottom=0.12, zmid=1.25, ztop=2.6):
    """photo wall texture x light falloff: darker toward the ceiling corner and toward the skirting."""
    m = bpy.data.materials.new(f"wall_{n}"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); t_ = nt.nodes.new("ShaderNodeTexImage"); t_.image = img(n); t_.interpolation = "Closest"
    geo = nt.nodes.new("ShaderNodeNewGeometry"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(geo.outputs["Position"], sp.inputs[0])
    def mth(op, a, b):
        x = nt.nodes.new("ShaderNodeMath"); x.operation = op; x.use_clamp = op in ("MULTIPLY_ADD",)
        for i, v in enumerate((a, b)):
            if isinstance(v, (int, float)):
                x.inputs[i].default_value = v
            else:
                nt.links.new(v, x.inputs[i])
        return x.outputs[0]
    up = mth("MINIMUM", mth("MAXIMUM", mth("DIVIDE", mth("SUBTRACT", sp.outputs[2], zmid), ztop - zmid), 0.0), 1.0)
    dn = mth("MINIMUM", mth("MAXIMUM", mth("DIVIDE", mth("SUBTRACT", 0.6, sp.outputs[2]), 0.6), 0.0), 1.0)
    f = mth("SUBTRACT", mth("SUBTRACT", 1.0, mth("MULTIPLY", up, top)), mth("MULTIPLY", dn, bottom))
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = "SCALE"; nt.links.new(t_.outputs[0], mul.inputs[0]); nt.links.new(f, mul.inputs["Scale"])
    K.flat_shader(nt, mul.outputs[0], out)
    return m


def frame_pic(name, n, w, loc, yaw, frame="#3A2A1C"):
    """framed picture on a wall: backing board, four frame bars around the image, the full image (UV 0..1, its own
    aspect) 1 cm proud of the backing and inside the bars - nothing overlaps it, so no z-fight under the PS1 snap."""
    h = w / aspect(n); b = 0.04
    R_ = __import__("mathutils").Euler((0, 0, yaw))
    def put(o, off):
        v = Vector(off); v.rotate(R_); o.location = Vector(loc) + v; o.rotation_euler = (o.rotation_euler.x, 0, yaw)
    back = K.box(name + "_back", (w + 2 * b, 0.01, h + 2 * b), (0, 0, 0), mcol(frame)); put(back, (0, -0.005, 0))
    for k, (sz, off) in enumerate((((w + 2 * b, 0.035, b), (0, -0.0175, (h + b) / 2)), ((w + 2 * b, 0.035, b), (0, -0.0175, -(h + b) / 2)),
                                   ((b, 0.035, h), ((w + b) / 2, -0.0175, 0)), ((b, 0.035, h), (-(w + b) / 2, -0.0175, 0)))):
        bar = K.box(f"{name}_bar{k}", (sz[0], 0.05, sz[2]), (0, 0, 0), mcol(frame)); put(bar, (off[0], -0.025, off[2]))
    p = K.plane(name, w, h, (0, 0, 0), rot=(math.pi / 2, 0, yaw), mat=mtex(n)); put(p, (0, -0.03, 0))
    f = back
    return f, p


# ---------------------------------------------------------------- scene

sc = K.reset("#C9D5E2")
sc.eevee.taa_render_samples = 8
SUN = bpy.data.objects["Sun"]; SUN.data.use_shadow = True; SUN.data.angle = math.radians(3); SUN.data.energy = 2.4
SUN.rotation_euler = (math.radians(-48), 0, math.radians(-18))        # afternoon sun through the living-room window (+Y -> -Y)

CT = mtex("floor_wood"); WOOD = mtex("floor_wood"); WALLP = mat_wall("wall_lr"); WALLH = mat_wall("wall_hall", top=0.28, bottom=0.18); TRIM = mcol("#F1ECE2")
CEIL = mcol("#CFC6B4")                                                    # (the plaster photo tiled into radial streaks on the ceilings: QA)

# ===== LIVING ROOM (x -2.6..2.6, y -2.6..2.0), window wall y = 2.0 facing the street
LX0, LX1, LY0, LY1, LH = -2.6, 2.6, -2.6, 2.0, 2.6
WIN = (-0.8, 0.8, 0.92, 2.48)
box("lr_floor", (LX1 - LX0, LY1 - LY0 + 0.3, 0.06), ((LX0 + LX1) / 2, (LY0 + LY1) / 2, -0.06), WOOD, 0.9)
K.box("lr_ceil", (LX1 - LX0, LY1 - LY0, 0.08), ((LX0 + LX1) / 2, (LY0 + LY1) / 2, LH + 0.04), CEIL)
wall("lr_wwin", "y", LY1 + 0.06, LX0, LX1, 0, LH, [WIN], WALLP, uv=0.4)
wall("lr_wback", "y", LY0 - 0.06, LX0, LX1, 0, LH, [], WALLP, uv=0.4)
wall("lr_wl", "x", LX0 - 0.06, LY0, LY1, 0, LH, [], WALLP, uv=0.4)
wall("lr_wr", "x", LX1 + 0.06, LY0, LY1, 0, LH, [(-2.1, -1.2, 0, 2.05)], WALLP, uv=0.4)        # door to the hallway
for nm, size, loc in [("sk_b", (LX1 - LX0, 0.03, 0.1), (0, LY0 + 0.015, 0)), ("sk_l", (0.03, LY1 - LY0, 0.1), (LX0 + 0.015, -0.3, 0)),
                      ("sk_w", (LX1 - LX0, 0.03, 0.1), (0, LY1 - 0.015, 0))]:
    box(nm, size, loc, TRIM)
CROWN = mcol("#E4DDCC")
for nm, size, loc in [("cr_b", (LX1 - LX0, 0.09, 0.09), (0, LY0 + 0.045, LH - 0.09)), ("cr_w", (LX1 - LX0, 0.09, 0.09), (0, LY1 - 0.045, LH - 0.09)),
                      ("cr_l", (0.09, LY1 - LY0, 0.09), (LX0 + 0.045, (LY0 + LY1) / 2, LH - 0.09)), ("cr_r", (0.09, LY1 - LY0, 0.09), (LX1 - 0.045, (LY0 + LY1) / 2, LH - 0.09)),
                      ("cr_b2", (LX1 - LX0, 0.04, 0.04), (0, LY0 + 0.1, LH - 0.06)), ("cr_w2", (LX1 - LX0, 0.04, 0.04), (0, LY1 - 0.1, LH - 0.06)),
                      ("cr_l2", (0.04, LY1 - LY0, 0.04), (LX0 + 0.1, (LY0 + LY1) / 2, LH - 0.06)), ("cr_r2", (0.04, LY1 - LY0, 0.04), (LX1 - 0.1, (LY0 + LY1) / 2, LH - 0.06)),
                      ("sk_r1", (0.03, 0.85, 0.1), (LX1 - 0.015, -2.55 + 0.425, 0)), ("sk_r2", (0.03, 3.2, 0.1), (LX1 - 0.015, -1.2 + 1.6, 0))]:
    box(nm, size, loc, CROWN if nm.startswith("cr") else TRIM)


def outlet(name, loc, yaw):
    o = box(name, (0.075, 0.012, 0.115), (0, 0, 0), mcol("#F4F2EC")); o.location = (loc[0], loc[1], loc[2]); o.rotation_euler = (0, 0, yaw)
    for k, dz in enumerate((0.03, -0.025)):
        for dx in (-0.012, 0.012):
            h_ = K.box(f"{name}_h{k}{dx}", (0.006, 0.006, 0.014), (0, 0, 0), mcol("#2A2A2A")); off = Vector((dx, -0.008, 0.057 + dz)); off.rotate(o.rotation_euler)
            h_.location = Vector(loc) + off


outlet("out1", (1.3, LY0 + 0.006, 0.28), math.pi); outlet("out2", (LX0 + 0.006, 0.4, 0.28), -math.pi / 2); outlet("out3", (LX1 - 0.006, -0.3, 0.28), math.pi / 2)
box("lsw", (0.075, 0.012, 0.12), (LX1 - 0.006, -1.0, 1.2), mcol("#F4F2EC")).rotation_euler = (0, 0, math.pi / 2)
# wall shelf over the TV with books, a vase and a small plant
box("shelf", (1.0, 0.22, 0.03), (-1.4, LY0 + 0.11, 1.55), CT, 2.0)
box("books", (0.24, 0.16, 0.24), (-1.32, LY0 + 0.11, 1.58), mcol("#808080"))
PP.loft(os.path.join(T, "src", "vase.png"), "vase", height=0.22, sides=8, loc=(-1.12, LY0 + 0.11, 1.58))
card("shelf_plant", "plant", 0.26, (-1.65, LY0 + 0.12, 1.58), yaw=math.pi)
box("mirror_f", (0.05, 0.62, 0.9), (LX0 + 0.03, -2.0, 1.1), mcol("#6A4A2A")); box("mirror", (0.012, 0.52, 0.8), (LX0 + 0.06, -2.0, 1.15), mcol("#B8C8D0"))
for i, y_ in enumerate((-0.2, 1.6)):
    box(f"sconce{i}", (0.06, 0.1, 0.1), (LX1 - 0.03, y_, 1.85), mcol("#3A3530")); frustum(f"sconce_s{i}", 0.06, 0.09, 0.14, (LX1 - 0.12, y_, 1.9), K.mat_color(f"sconce_m{i}", "#FFE9B8", emit_only=True))
# window: deep sill, frame, transom (no centre mullion: the dog's head sits there), curtains
WFR = mcol("#9A9EA2")
box("win_sill", (1.9, 0.26, 0.05), (0, LY1 + 0.02, 0.87), WFR)
for nm, size, loc in [("wf_l", (0.08, 0.16, 1.56), (-0.84, LY1 + 0.06, 0.92)), ("wf_r", (0.08, 0.16, 1.56), (0.84, LY1 + 0.06, 0.92)),
                      ("wf_t", (1.76, 0.16, 0.06), (0, LY1 + 0.06, 2.46)),
                      ("rev_l", (0.04, 0.3, 1.56), (-0.82, LY1 + 0.13, 0.92)), ("rev_r", (0.04, 0.3, 1.56), (0.82, LY1 + 0.13, 0.92)),   # recess reveals
                      ("rev_t", (1.68, 0.3, 0.03), (0, LY1 + 0.13, 2.48))]:
    box(nm, size, loc, WFR)
CURT = mtex("wallpaper", (2, 2))                                         # curtains: the unused Flow linen-stripe tile
for sx in (-1, 1):
    for k in range(3):                                            # pleated: three staggered slabs per side
        box(f"curt{sx}{k}", (0.16, 0.06, 2.0), (sx * (0.86 + 0.12 * k), LY1 - 0.08 - 0.03 * (k % 2), 0.52), CURT)
box("curt_rod", (3.2, 0.04, 0.04), (0, LY1 - 0.1, 2.53), mcol("#4A3A2A"))
# sofa (modelled from boxes, fabric texture), against the window wall
FAB = mtex("fabric")
SOFA_Y = 1.45
box("sofa_base", (2.1, 0.95, 0.23), (0, SOFA_Y, 0.04), FAB, 1.4)        # zaw-dog-03: seat 13 cm lower (people sit on it)
box("sofa_back", (2.1, 0.24, 0.40), (0, SOFA_Y + 0.36, 0.27), FAB, 1.4)
for sx in (-1, 1):
    box(f"sofa_arm{sx}", (0.2, 0.95, 0.30), (sx * 0.95, SOFA_Y, 0.27), FAB, 1.4)
for sx in (-1, 0, 1):
    box(f"cush{sx}", (0.64, 0.7, 0.11), (sx * 0.62, SOFA_Y - 0.08, 0.27), FAB, 1.4)     # zaw-dog-03: cushions touch (no dark gap)
for i, (x, y) in enumerate(((-0.95, 0.5), (-0.95, 1.95), (0.95, 0.5), (0.95, 1.95))):
    box(f"sofa_leg{i}", (0.06, 0.06, 0.04), (x * 1.0, SOFA_Y - 0.45 + 0.9 * (y > 1), 0), mcol("#2A1E14"))
box("pillow1", (0.36, 0.12, 0.3), (-0.68, SOFA_Y + 0.17, 0.38), mcol("#C8963E")).rotation_euler = (0.25, 0, 0.12)
box("pillow2", (0.36, 0.12, 0.32), (0.72, SOFA_Y + 0.17, 0.38), mcol("#7E8C5E")).rotation_euler = (0.25, 0, -0.1)
box("throw", (0.42, 0.55, 0.03), (0.68, SOFA_Y - 0.08, 0.38), mcol("#9AA3B4")).rotation_euler = (0, 0, 0.08)   # inside the seat
SEAT_Z = 0.38
# rug, coffee table + clutter
box("rug", (2.6, 1.7, 0.012), (0, 0.15, 0), mtex("rug_soft"), 0.42)      # zaw-dog-03: pre-softened (no shimmer on pushes)
CT = mtex("floor_wood")
box("ct_top", (1.1, 0.55, 0.05), (0, 0.15, 0.40), CT, 2.0)
box("ct_shelf", (1.0, 0.48, 0.03), (0, 0.15, 0.12), CT, 2.0)
for i, (x, y) in enumerate(((-0.5, -0.24), (0.5, -0.24), (-0.5, 0.24), (0.5, 0.24))):
    box(f"ct_leg{i}", (0.05, 0.05, 0.40), (x, 0.15 + y, 0), mcol("#5C3A20"))
for i, (x, y, c) in enumerate(((-0.32, 0.05, "#E8E2D6"), (0.12, 0.3, "#2F5A8A"))):
    img("mug").alpha_mode = "CHANNEL_PACKED"; frustum(f"mug{i}", 0.04, 0.045, 0.1, (x, y, 0.45), mtex("mug"))    # mug photo wrapped
box("mag1", (0.3, 0.22, 0.012), (0.3, 0.05, 0.45), mtex("pic_land")).rotation_euler = (0, 0, 0.3)
box("mag2", (0.28, 0.2, 0.012), (-0.1, 0.25, 0.45), mcol("#B83A3A")).rotation_euler = (0, 0, -0.2)
box("remote", (0.05, 0.16, 0.02), (-0.15, 0.0, 0.45), mcol("#1C1C1C")).rotation_euler = (0, 0, 0.6)
# TV cabinet (photo front, split: cabinet + TV) on the back wall, facing +Y
tvw = 1.6
front_box("tv_cab", "tv_cabinet", (tvw, 0.45, 0.56), (0, LY0 + 0.25, 0), math.pi, "#8A5A2C", (0, 0, 1, 0.52))
front_box("tv", "tv_cabinet", (0.95, 0.06, 0.58), (0, LY0 + 0.3, 0.56), math.pi, "#141414", (0.18, 0.52, 0.82, 1.0))
# bookshelf on the left wall facing +X
front_box("bookshelf", "bookshelf", (0.9, 0.32, 1.95), (LX0 + 0.17, -0.9, 0), math.pi / 2, "#6B4A2E")
# plant (lofted from its photo), floor lamp (modelled), side table, dog bed, wall clock, pictures, door
PLANT = PP.loft(os.path.join(T, "src", "plant.png"), "plant", height=0.95, sides=8, loc=(LX0 + 0.45, 1.55, 0))
LAMP_X, LAMP_Y = 1.55, 1.75
frustum("lamp_base", 0.16, 0.14, 0.04, (LAMP_X, LAMP_Y, 0), mcol("#2E2A26"))
box("lamp_pole", (0.03, 0.03, 1.45), (LAMP_X, LAMP_Y, 0.04), mcol("#3A3530"))
FLAMP = PP.loft(os.path.join(T, "src", "floor_lamp.png"), "floor_lamp", height=0.32, sides=8, loc=(LAMP_X, LAMP_Y, 1.4))   # shade lofted from its photo (the thin pole is below the silhouette threshold)
box("st_top", (0.5, 0.45, 0.04), (-1.6, 1.6, 0.56), CT, 2.0)
for i, (x, y) in enumerate(((-0.2, -0.18), (0.2, -0.18), (-0.2, 0.18), (0.2, 0.18))):
    box(f"st_leg{i}", (0.04, 0.04, 0.56), (-1.6 + x, 1.6 + y, 0), mcol("#5C3A20"))
frustum("st_lamp", 0.08, 0.06, 0.25, (-1.6, 1.6, 0.6), mcol("#3C6E8C")); frustum("st_shade", 0.15, 0.09, 0.18, (-1.6, 1.6, 0.85), mcol("#F2E6C4"))
box("dogbed", (0.95, 0.75, 0.16), (1.75, -1.7, 0), mcol("#7A4B34"))
box("dogbed_c", (0.75, 0.55, 0.06), (1.75, -1.7, 0.12), mcol("#C9B49A"))
K.plane("toy_bone", 0.26, 0.26 * 0.42, (0.9, -0.9, 0.004), rot=(0, 0, 0.7), mat=mcut("ropebone"))
card("shoes_lr", "sneakers_grey", 0.13, (1.98, -0.2, 0), yaw=-math.pi / 2 + 0.2)
box("magstack", (0.3, 0.24, 0.12), (-1.7, -1.9, 0), mcol("#A8483A"))      # photo: mags (photo_group below)
box("magstack2", (0.28, 0.22, 0.05), (-1.7, -1.9, 0.12), mtex("pic_land")).rotation_euler = (0, 0, 0.2)
box("basket", (0.45, 0.35, 0.3), (-2.15, -2.1, 0), mtex("fabric"), 2.0)
CLOCK_POS = (LX1 - 0.03, 0.2, 1.75)
prism("clock", 0.24, 0.05, CLOCK_POS, -math.pi / 2, "clock_face", side="#2A2A2A")
frame_pic("pic1", "pic_owner", 0.32, (LX1 - 0.03, -0.75, 1.55), -math.pi / 2)
frame_pic("pic2", "pic_meme1", 0.5, (LX0 + 0.03, 0.9, 1.6), math.pi / 2)
frame_pic("pic3", "pic_bed4", 0.5, (-1.65, LY1 - 0.02, 1.65), 0)
frame_pic("pic4", "pic_meme2", 0.42, (LX1 - 0.03, 1.05, 1.5), -math.pi / 2)
front_box("lr_door", "door_green", (0.9, 0.05, 2.05), (LX1 + 0.1, -1.65, 0), -math.pi / 2, "#1F3A2C")     # (seen from inside: closed hallway door)
for nm, size, loc in [("df_a", (0.05, 0.07, 2.1), (LX1 - 0.01, -2.13, 0)), ("df_b", (0.05, 0.07, 2.1), (LX1 - 0.01, -1.17, 0)),
                      ("df_t", (0.05, 1.03, 0.07), (LX1 - 0.01, -1.65, 2.05))]:
    box(nm, size, loc, TRIM)
# hands of the wall clock (3D, so they can show any time)
HAND_H = box("clock_hh", (0.025, 0.015, 0.13), (0, 0, 0), mcol("#141414"))
HAND_M = box("clock_hm", (0.018, 0.015, 0.19), (0, 0, 0), mcol("#141414"))
for hnd in (HAND_H, HAND_M):
    hnd.data.transform(__import__("mathutils").Matrix.Translation((0, 0, -0.01)))
    hnd.location = (CLOCK_POS[0] - 0.035, CLOCK_POS[1], CLOCK_POS[2]); hnd.rotation_mode = "XYZ"


def set_clock(hh, mm, hands=(HAND_H, HAND_M), axis="x"):
    a_h = math.radians((hh % 12) * 30 + mm * 0.5); a_m = math.radians(mm * 6)
    for hnd, a in zip(hands, (a_h, a_m)):
        hnd.rotation_euler = (a, 0, 0) if axis == "x" else (0, a, 0)     # clock faces -X: +rot about X = clockwise from 12


set_clock(4, 50)

# ===== HOUSE FRONT + STREET (outside the window, +Y)
BRICK = mtex("brick")
wall("facade", "y", LY1 + 0.15, -7, 7, 0, 3.0, [(WIN[0], WIN[1], WIN[2], WIN[3])], BRICK, t=0.06, uv=0.9)
box("eave", (14.5, 0.6, 0.18), (0, LY1 + 0.35, 3.0), mcol("#4D4A48"))
box("found", (14, 0.1, 0.2), (0, LY1 + 0.21, 0), mcol("#8E8A84"))
box("out_sill", (1.9, 0.2, 0.06), (0, LY1 + 0.28, 0.86), mcol("#9A9EA2"))
GRASS, CONC, ASPH = mtex("grass"), mtex("concrete"), mtex("asphalt")
box("lawn_near", (60, 5.0, 0.04), (0, LY1 + 2.7, -0.04), GRASS, 1.6)
box("walk", (60, 1.6, 0.05), (0, 6.0, -0.028), CONC, 0.6)             # (zaw-dog-05: above the lawn, no z-fight)
box("kerb", (60, 0.15, 0.12), (0, 6.85, -0.06), CONC, 1.0)
box("road", (60, 6.0, 0.04), (0, 9.95, -0.08), ASPH, 0.35)
box("walk_far", (60, 1.6, 0.05), (0, 13.75, -0.04), CONC, 0.6)
box("lawn_far", (60, 12, 0.04), (0, 20.5, -0.04), GRASS, 1.6)
for i, x in enumerate((-5.5, -3.2, 3.0, 5.4)):                     # foundation shrubs (photo cards, like Zaw's bush sprites)
    card(f"bush{i}", "plant", 0.85 + 0.15 * (i % 2), (x, LY1 + 0.55, 0), yaw=math.pi)
box("mailbox_post", (0.08, 0.08, 1.0), (4.2, 6.3, 0), mcol("#4A3A2A")); box("mailbox", (0.22, 0.45, 0.24), (4.2, 6.3, 1.0), mcol("#2C3E5A"))
box("pole", (0.25, 0.25, 8.0), (-8.5, 14.0, 0), mcol("#6A5A48"))
box("driveway", (3.0, 4.6, 0.045), (-4.6, 4.3, -0.04), CONC, 0.6)
far = K.plane("far", 110, 110 * 96 / 256, (0, 45, 0), mat=mcut("street_far"))
far.location = (0, 45, -9.5 + 110 * 96 / 256 / 2)
_sid = np.zeros((64, 64, 3), np.uint8)
for r_ in range(64):
    _sid[r_] = (150, 156, 160) if r_ % 8 else (110, 114, 118)
_sid = (_sid * (1 + (np.random.default_rng(2).random((64, 64, 1)) - 0.5) * 0.08)).clip(0, 255).astype(np.uint8)
SIDING = mtex("siding")                                              # Flow photo of vinyl siding (was a code texture)


def roof_uv(o, sc_=0.5):
    me = o.data; uvl = me.uv_layers.new()
    for p in me.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c = me.vertices[vi].co; uvl.data[li].uv = (c.x * sc_, (c.y + c.z) * sc_)
    return o


def house(name, x, y, w, d, h, roof, body=None, door="#7A2A22"):
    """a suburban bungalow across the street: siding walls, gable roof, windows with frames, door, garage."""
    box(name + "_w", (w, d, h), (x, y, 0), body or SIDING, 0.6)
    vs = [(x - w / 2 - 0.3, y - d / 2 - 0.4, h), (x + w / 2 + 0.3, y - d / 2 - 0.4, h), (x + w / 2 + 0.3, y, h + roof), (x - w / 2 - 0.3, y, h + roof),
          (x - w / 2 - 0.3, y + d / 2 + 0.4, h), (x + w / 2 + 0.3, y + d / 2 + 0.4, h)]
    roof_uv(K.mesh_from(name + "_roof", vs, [(0, 1, 2, 3), (3, 2, 5, 4), (0, 3, 4), (1, 5, 2)], mtex("roof")))
    for i, wx in enumerate((-w * 0.3, w * 0.05)):
        box(f"{name}_wf{i}", (1.2, 0.06, 1.1), (x + wx, y - d / 2 - 0.02, 0.9), TRIM)
        box(f"{name}_wg{i}", (1.0, 0.07, 0.9), (x + wx, y - d / 2 - 0.03, 1.0), mcol("#3A4A58"))
        box(f"{name}_wm{i}", (0.05, 0.08, 0.9), (x + wx, y - d / 2 - 0.035, 1.0), TRIM)
    box(name + "_door", (0.95, 0.06, 2.05), (x + w * 0.28, y - d / 2 - 0.02, 0), mcol(door))
    box(name + "_step", (1.4, 0.6, 0.15), (x + w * 0.28, y - d / 2 - 0.3, 0), CONC, 0.6)
    box(name + "_drive", (3.2, 5.0, 0.03), (x - w * 0.32, y - d / 2 - 2.5, -0.02), CONC, 0.6)


for i, (x_, w_, c_) in enumerate(((-15.0, 10, None), (-3.0, 11, "brick"), (9.0, 10, None), (21.0, 11, "brick"))):
    house(f"hs{i}", x_, 21.5, w_, 7, 3.0, 1.6, body=BRICK if c_ else None, door=("#7A2A22", "#2A4A6A", "#3A5A3A", "#6A5A3A")[i])
for i, (x_, y_, n_, h_) in enumerate(((-9.0, 19.0, "tree_round", 6.5), (3.2, 18.5, "tree_tall", 7.5), (15.0, 19.2, "tree_round", 6.0),
                                     (-21, 19, "tree_tall", 7.0), (6.5, 4.5, "tree_round", 5.5), (-8.0, 4.2, "tree_tall", 6.5))):
    card(f"tree{i}", n_, h_, (x_, y_, 0), yaw=math.pi)
for i, x_ in enumerate((-17.5, -12.5, -6.5, -0.5, 6.5, 11.5, 18.5, 23.5)):
    card(f"hedge{i}", "hedge" if i % 2 else "shrub", 0.9, (x_, 17.7, 0), yaw=math.pi)
for i, x_ in enumerate((-9.5, -1.0, 6.0)):
    box(f"mbox{i}", (0.08, 0.08, 1.0), (x_, 15.2, 0), mcol("#4A3A2A")); box(f"mboxb{i}", (0.22, 0.45, 0.24), (x_, 15.2, 1.0), mcol(("#2C3E5A", "#7A2A22", "#2A2A2A")[i]))
K.plane("sky", 160, 70, (0, 60, 30), mat=K.mat_image("m_sky", img("sky"), emit_only=True))
K.plane("sky_back", 200, 80, (0, -60, 30), rot=(math.pi / 2, 0, math.pi), mat=K.mat_image("m_sky2", img("sky"), emit_only=True))
roof_uv(K.mesh_from("roof_gable", [(-7.2, LY1 + 0.6, 3.0), (7.2, LY1 + 0.6, 3.0), (7.2, -0.6, 4.7), (-7.2, -0.6, 4.7)], [(0, 1, 2, 3)], mtex("roof")))


def car_mesh(name="car"):
    """owner's car (v2): the side photo's silhouette extruded 1.8 m; side windows cut open onto a modelled interior
    (seats, headrests, dash, wheel) behind tinted glass; 3D wheels with hubcaps in dark arches; bumpers, head/tail
    lights, mirrors; front photo on the nose. Drives along -X (nose to -X)."""
    C = json.load(open(os.path.join(T, "car_outline.json"))); CP = json.load(open(os.path.join(T, "car_parts.json")))
    L = 4.5; Hc = L * C["h"] / C["w"]; Wd = 1.8
    pts = [((u - 0.5) * L, v * Hc) for u, v in C["pts"]]
    n = len(pts); vs = [(x, -Wd / 2, z) for x, z in pts] + [(x, Wd / 2, z) for x, z in pts]
    fs = [list(range(n))[::-1], list(range(n, 2 * n))] + [(k, (k + 1) % n, n + (k + 1) % n, n + k) for k in range(n)]
    root = K.link(bpy.data.objects.new(name, None))
    kids = []
    o = K.mesh_from(name + "_body", vs, fs); kids.append(o)
    me = o.data; me.materials.append(mcut("car_side_black")); me.materials.append(mcol("#141416"))   # zaw-dog-03: black car
    me.materials.append(mcol("#22262C")); me.materials.append(mcol("#1B1B1E"))      # 2 = glass (wind/rear screen), 3 = roof/hood (lighter)
    uvl = me.uv_layers.new()
    for p in me.polygons:
        c_ = p.center; n_ = p.normal
        if p.index < 2:
            p.material_index = 0
        elif c_.z > 0.62 * Hc and n_.z > 0.25 and abs(n_.x) > 0.3:
            p.material_index = 2                                             # sloped screens
        elif n_.z > 0.6:
            p.material_index = 3
        else:
            p.material_index = 1
        for li, vi in zip(p.loop_indices, p.vertices):
            c = me.vertices[vi].co; uvl.data[li].uv = (c.x / L + 0.5, c.z / Hc)
    kids.append(K.box(name + "_grille", (0.04, 0.9, 0.16), (-L / 2 + 0.03, 0, 0.58), mcol("#141618")))
    for k_ in range(3):
        kids.append(K.box(f"{name}_grl{k_}", (0.045, 0.86, 0.015), (-L / 2 + 0.03, 0, 0.53 + 0.05 * k_), mcol("#5A5E64")))
    gu0, gv0, gu1, gv1 = CP["glass"]
    gx0, gx1, gz0, gz1 = (gu0 - 0.5) * L, (gu1 - 0.5) * L, gv0 * Hc, gv1 * Hc
    glass = bpy.data.materials.new("car_glass"); glass.use_nodes = True; nt = glass.node_tree; nt.nodes.clear()
    go = nt.nodes.new("ShaderNodeOutputMaterial"); ge = nt.nodes.new("ShaderNodeEmission"); ge.inputs[0].default_value = (*K.srgb("#7C93A8"), 1)
    gt = nt.nodes.new("ShaderNodeBsdfTransparent"); gm = nt.nodes.new("ShaderNodeMixShader"); gm.inputs[0].default_value = 0.38
    nt.links.new(gt.outputs[0], gm.inputs[1]); nt.links.new(ge.outputs[0], gm.inputs[2]); nt.links.new(gm.outputs[0], go.inputs[0])
    glass.surface_render_method = "BLENDED"
    for sg in (-1, 1):
        g = K.plane(f"{name}_glass{sg}", gx1 - gx0, gz1 - gz0, (0, 0, 0), rot=(math.pi / 2, 0, 0 if sg < 0 else math.pi), mat=glass)
        g.location = ((gx0 + gx1) / 2, sg * (Wd / 2 - 0.05), (gz0 + gz1) / 2); kids.append(g)
    seat, dark = mcol("#3A3A40"), mcol("#202024")
    for sx_ in (-1, 1):
        kids.append(K.box(f"{name}_seat{sx_}", (0.5, 0.5, 0.12), (gx0 + 0.55, sx_ * 0.38, gz0 - 0.25), seat))
        kids.append(K.box(f"{name}_sback{sx_}", (0.12, 0.5, 0.6), (gx0 + 0.85, sx_ * 0.38, gz0 + 0.05), seat))
        kids.append(K.box(f"{name}_head{sx_}", (0.1, 0.26, 0.18), (gx0 + 0.86, sx_ * 0.38, gz0 + 0.42), seat))
    kids.append(K.box(name + "_bench", (0.14, 1.5, 0.55), (gx1 - 0.15, 0, gz0 + 0.02), seat))
    kids.append(K.box(name + "_rhead", (0.1, 1.2, 0.14), (gx1 - 0.12, 0, gz0 + 0.37), seat))
    kids.append(K.box(name + "_dash", (0.5, 1.6, 0.25), (gx0 - 0.15, 0, gz0 - 0.02), dark))
    sw = prism(name + "_steer", 0.18, 0.03, (gx0 + 0.1, -0.38, gz0 + 0.12), math.pi / 2, "hubcap", side="#202024"); sw.rotation_euler = (0, -0.45, math.pi / 2); kids.append(sw)
    for i, u in enumerate(CP["wheels_u"]):
        x = (u - 0.5) * L
        for sg in (-1, 1):
            arch = prism(f"{name}_arch{i}{sg}", 0.37, 0.012, (x, sg * (Wd / 2 + 0.004), 0.33), 0 if sg < 0 else math.pi, "hubcap", side="#141416")
            arch.data.materials[0] = mcol("#141416"); kids.append(arch)
            w_ = prism(f"{name}_wheel{i}{sg}", 0.32, 0.22, (x, sg * (Wd / 2 + 0.03), 0.32), 0 if sg < 0 else math.pi, "hubcap", side="#1A1A1C")
            kids.append(w_)
    bump = mcol("#1E1E22")
    kids.append(K.box(name + "_bump_f", (0.2, Wd + 0.04, 0.2), (-L / 2 + 0.06, 0, 0.36), bump))
    kids.append(K.box(name + "_bump_r", (0.2, Wd + 0.04, 0.2), (L / 2 - 0.06, 0, 0.42), bump))
    for sg in (-1, 1):
        kids.append(K.box(f"{name}_hl{sg}", (0.08, 0.32, 0.12), (-L / 2 + 0.05, sg * 0.62, 0.62), K.mat_color(f"{name}_hlm", "#FFF6D8", emit_only=True)))
        kids.append(K.box(f"{name}_tl{sg}", (0.08, 0.34, 0.14), (L / 2 - 0.05, sg * 0.6, 0.72), K.mat_color(f"{name}_tlm", "#C81818", emit_only=True)))
        kids.append(K.box(f"{name}_mir{sg}", (0.1, 0.14, 0.09), (gx0 - 0.05, sg * (Wd / 2 + 0.1), gz0 + 0.02), mcol("#141416")))
        kids.append(K.box(f"{name}_mirg{sg}", (0.012, 0.11, 0.065), (gx0 - 0.1, sg * (Wd / 2 + 0.1), gz0 + 0.02), mcol("#9AAAB8")))
        kids.append(K.box(f"{name}_plate", (0.02, 0.5, 0.12), (L / 2 + 0.05, 0, 0.5), mcol("#F0E8C0")))
    for k_ in kids:
        k_.parent = root
    return root


CAR = car_mesh()
CAR.location = (0, 10.6, -0.04)

# ===== HALLWAY (x 19.35..20.65, y -3..2.5), front door at y = 2.5
HX = 20.0; HW = 0.75
box("h_floor", (2 * HW + 0.2, 6.0, 0.06), (HX, -0.25, -0.06), WOOD, 0.9)
K.box("h_ceil", (2 * HW, 6.0, 0.08), (HX, -0.25, LH + 0.04), CEIL)
wall("h_wl", "x", HX - HW - 0.06, -3.2, 2.5, 0, LH, [(-1.6, -0.8, 0, 2.05)], WALLH, uv=0.4)     # opening into the living room
wall("h_wr", "x", HX + HW + 0.06, -3.2, 2.5, 0, LH, [(-0.2, 0.6, 0, 2.05)], WALLH, uv=0.4)      # opening into the kitchen
wall("h_wd", "y", 2.56, HX - HW, HX + HW, 0, LH, [(HX - 0.46, HX + 0.46, 0, 2.08), (HX + 0.52, HX + 0.7, 0.35, 2.0)], WALLH, uv=0.4)   # door + sidelight
wall("h_wbk", "y", -3.26, HX - HW, HX + HW, 0, LH, [], WALLH, uv=0.4)
WAIN = mcol("#E9E3D6")
H_SEGS = {-1: [(-3.2, -1.6), (-0.8, 2.5)], 1: [(-3.2, -0.2), (0.6, 2.5)]}         # wainscot/skirting stop at the doorways
for sx in (-1, 1):
    for j, (y0_, y1_) in enumerate(H_SEGS[sx]):
        box(f"h_wain{sx}_{j}", (0.03, y1_ - y0_, 0.9), (HX + sx * (HW - 0.015), (y0_ + y1_) / 2, 0), WAIN)
        box(f"h_rail{sx}_{j}", (0.05, y1_ - y0_, 0.05), (HX + sx * (HW - 0.025), (y0_ + y1_) / 2, 0.9), TRIM)
        box(f"h_skirt{sx}_{j}", (0.035, y1_ - y0_, 0.12), (HX + sx * (HW - 0.03), (y0_ + y1_) / 2, 0), mcol("#D6CFC0"))
box("runner", (0.8, 4.6, 0.012), (HX, -0.4, 0), mtex("rug_soft"), 0.42)
for sx in (-1, 1):
    box(f"h_crown{sx}", (0.09, 5.7, 0.09), (HX + sx * (HW - 0.045), -0.35, LH - 0.09), CROWN)
    box(f"h_crown2{sx}", (0.04, 5.7, 0.04), (HX + sx * (HW - 0.1), -0.35, LH - 0.06), CROWN)
for i, y_ in enumerate((-1.9, -0.3, 1.3)):                               # ceiling beams / trim bands
    box(f"h_beam{i}", (2 * HW, 0.12, 0.08), (HX, y_, LH - 0.08), mcol("#D8CFBC"))
box("doormat", (0.8, 0.5, 0.015), (HX, 2.15, 0), mtex("doormat"), 1.0)
world_uv(bpy.data.objects["doormat"], 1.0)
dm = bpy.data.objects["doormat"].data; uvl_ = dm.uv_layers.active
for p_ in dm.polygons:
    for li, vi in zip(p_.loop_indices, p_.vertices):
        c_ = dm.vertices[vi].co; uvl_.data[li].uv = (c_.x / 0.8 + 0.5, c_.y / 0.5 + 0.5)
card("h_shoe0", "sneakers_grey", 0.13, (HX - 0.6, 0.88, 0), yaw=math.pi / 2 - 0.15)
card("h_shoe1", "boots", 0.17, (HX + 0.45, 1.42, 0), yaw=-0.2)
for i, (x_, c) in enumerate(((0.0, "#F2F0EA"), (0.06, "#E8E0C8"))):
    box(f"h_mail{i}", (0.2, 0.14, 0.008), (HX - HW + 0.18 + x_ * 0.3, 0.12 + x_, 0.75 + 0.008 * i), mcol(c)).rotation_euler = (0, 0, 0.3 * i)
frustum("h_keybowl", 0.06, 0.08, 0.04, (HX - HW + 0.2, 0.3, 0.75), mcol("#3C6E8C"))
box("h_side_glass", (0.18, 0.02, 1.65), (HX + 0.61, 2.56, 0.35), K.mat_color("h_glass", "#BFD3DF", emit_only=True))
for nm, size, loc in [("hsl_l", (0.04, 0.12, 1.7), (HX + 0.5, 2.5, 0.33)), ("hsl_r", (0.04, 0.12, 1.7), (HX + 0.72, 2.5, 0.33)),
                      ("hsl_t", (0.26, 0.12, 0.05), (HX + 0.61, 2.5, 2.0)), ("hsl_b", (0.26, 0.14, 0.05), (HX + 0.61, 2.5, 0.31))]:
    box(nm, size, loc, TRIM)
for nm, size, loc in [("hdl_a", (0.05, 0.07, 2.1), (HX - HW - 0.01 + 0.03, -1.63, 0)), ("hdl_b", (0.05, 0.07, 2.1), (HX - HW + 0.02, -0.77, 0)),
                      ("hdl_t", (0.05, 0.92, 0.07), (HX - HW + 0.02, -1.2, 2.05)), ("hdk_a", (0.05, 0.07, 2.1), (HX + HW - 0.02, -0.23, 0)),
                      ("hdk_b", (0.05, 0.07, 2.1), (HX + HW - 0.02, 0.63, 0)), ("hdk_t", (0.05, 0.92, 0.07), (HX + HW - 0.02, 0.2, 2.05))]:
    box(nm, size, loc, TRIM)
# rooms behind the hallway's side doorways: living-room corner (left) and kitchen corner (right)
for nm, x0_, x1_, y0_, y1_, fl, wm in (("hl", HX - HW - 2.3, HX - HW - 0.12, -2.8, 0.4, WOOD, WALLP), ("hk", HX + HW + 0.12, HX + HW + 2.3, -1.4, 1.8, mtex("checker"), mcol("#E6DCC4"))):
    box(nm + "_floor", (x1_ - x0_, y1_ - y0_, 0.06), ((x0_ + x1_) / 2, (y0_ + y1_) / 2, -0.06), fl, 0.9 if nm == "hl" else 1.0)
    K.box(nm + "_ceil", (x1_ - x0_, y1_ - y0_, 0.08), ((x0_ + x1_) / 2, (y0_ + y1_) / 2, LH + 0.04), CEIL)
    xb = x0_ if nm == "hl" else x1_
    wall(nm + "_wb", "x", xb, y0_, y1_, 0, LH, [], wm, uv=0.4)
    wall(nm + "_w0", "y", y0_ - 0.06, x0_, x1_, 0, LH, [], wm, uv=0.4)
    wall(nm + "_w1", "y", y1_ + 0.06, x0_, x1_, 0, LH, [], wm, uv=0.4)
front_box("hl_sofa", "tv_cabinet", (0.5, 1.6, 0.5), (HX - HW - 2.0, -1.2, 0), -math.pi / 2, "#8A5A2C", (0, 0, 1, 0.52))
frame_pic("hl_pic", "pic_bed1", 0.5, (HX - HW - 2.3 + 0.01, -1.2, 1.5), math.pi / 2)
front_box("hk_fridge", "fridge", (0.75, 0.7, 1.85), (HX + HW + 1.9, 0.2, 0), math.pi / 2, "#E8E8E4")
front_box("hk_cab", "cabinets", (1.2, 0.6, 0.86), (HX + HW + 2.0, -0.8, 0), math.pi / 2, "#EDEDE8", (0, 0, 0.75, 0.5))
box("h_radiator", (0.1, 0.7, 0.5), (HX + HW - 0.08, -1.9, 0.15), mcol("#E8E6E0"))
for i in range(7):
    box(f"h_rad_fin{i}", (0.11, 0.02, 0.48), (HX + HW - 0.08, -2.2 + 0.1 * i, 0.16), mcol("#CFCCC4"))
DOOR_PIV = K.link(bpy.data.objects.new("door_piv", None)); DOOR_PIV.location = (HX - 0.45, 2.5, 0)
dr = front_box("front_door", "door_green", (0.9, 0.06, 2.05), (0, 0, 0), 0.0, "#1F3A2C"); dr.parent = DOOR_PIV
dr.location = (0.45, 0.0, 1.025); dr.rotation_euler = (0, 0, 0)
for nm, size, loc in [("hdf_l", (0.07, 0.1, 2.12), (HX - 0.495, 2.5, 0)), ("hdf_r", (0.07, 0.1, 2.12), (HX + 0.495, 2.5, 0)),
                      ("hdf_t", (1.06, 0.1, 0.07), (HX, 2.5, 2.08))]:
    box(nm, size, loc, TRIM)
for i, (z_, h_) in enumerate(((0.0, 0.04), (0.2, 0.03), (0.42, 0.03))):
    box(f"shoe_rack_s{i}", (0.3, 0.6, h_), (HX + HW - 0.17, 1.75, z_ + 0.02), mcol("#6B4224"))
for dy in (-0.28, 0.28):
    box(f"shoe_rack_e{dy}", (0.3, 0.03, 0.47), (HX + HW - 0.17, 1.75 + dy, 0), mcol("#5A3820"))
card("sneakers", "sneakers", 0.16, (HX + HW - 0.25, 1.75, 0.45), yaw=-math.pi / 2)
RACK = [o for o in bpy.data.objects if o.name.startswith(("shoe_rack", "sneakers"))]
card("coat_rack", "coat_rack", 1.75, (HX - HW + 0.18, 1.95, 0), yaw=math.pi / 2 - 0.3)
box("h_table_top", (0.34, 0.55, 0.04), (HX - HW + 0.18, 0.15, 0.71), CT, 2.0)
box("h_table_dr", (0.3, 0.5, 0.12), (HX - HW + 0.18, 0.15, 0.58), mcol("#7A4A28"))
box("h_table_kn", (0.02, 0.06, 0.03), (HX - HW + 0.34, 0.15, 0.63), mcol("#C8A050"))
for i, (dx, dy) in enumerate(((-0.13, -0.24), (0.13, -0.24), (-0.13, 0.24), (0.13, 0.24))):
    box(f"h_table_leg{i}", (0.04, 0.04, 0.71), (HX - HW + 0.18 + dx, 0.15 + dy, 0), mcol("#5C3A20"))
card("h_bowl", "dog_bowl", 0.08, (HX + 0.3, -2.4, 0), yaw=0.0)
frame_pic("hp1", "pic_owner", 0.28, (HX - HW + 0.01, 0.9, 1.5), math.pi / 2)
frame_pic("hp2", "pic_meme1", 0.4, (HX - HW + 0.01, -0.2, 1.6), math.pi / 2)
frame_pic("hp4", "pic_meme3", 0.4, (HX - HW + 0.01, -2.3, 1.55), math.pi / 2)
frame_pic("hp5", "pic_dog", 0.3, (HX + HW - 0.01, -2.6, 1.6), -math.pi / 2)
frame_pic("hp3", "pic_meme4", 0.4, (HX + HW - 0.01, -1.6, 1.55), -math.pi / 2)
frustum("h_lamp_base", 0.09, 0.09, 0.02, (HX, 0.0, LH - 0.02), mcol("#B89A5A"))
frustum("h_lamp", 0.07, 0.2, 0.12, (HX, 0.0, LH - 0.14), K.mat_color("h_lampm", "#FFF2C8", emit_only=True))
frustum("h_lamp_rim", 0.205, 0.205, 0.015, (HX, 0.0, LH - 0.025), mcol("#B89A5A"))
# outside the front door: porch + street photo
box("porch", (4, 3, 0.06), (HX, 4.0, -0.06), CONC, 0.6)
K.plane("h_out", 14, 14 * 144 / 256, (HX, 9.0, 1.6), mat=K.mat_image("m_hout", img("street_view"), emit_only=True))

def photo_group(names, n, origin, u_dir, x0, x1, z0, z1):
    """VLVT 'boxes take the photo from the front': every face of a group of boxes gets the object's straight-on photo,
    projected along the group's front axis (u = position along u_dir from origin, v = height); tops and sides read the
    photo's nearest edge texels. Replaces flat colours on modelled furniture with the real thing."""
    bpy.context.view_layer.update()
    img(n).alpha_mode = "CHANNEL_PACKED"                          # keep the bled RGB under the cut-out's alpha (not black)
    mat = mtex(n); ux, uy = u_dir
    for nm in names:
        o = bpy.data.objects[nm]; me = o.data; me.materials.clear(); me.materials.append(mat)
        uvl = me.uv_layers.active or me.uv_layers.new(); mw = o.matrix_world
        for p in me.polygons:
            p.material_index = 0
            for li, vi in zip(p.loop_indices, p.vertices):
                w = mw @ me.vertices[vi].co
                u = ((w.x - origin[0]) * ux + (w.y - origin[1]) * uy - x0) / (x1 - x0)
                v = (w.z - z0) / (z1 - z0)
                if p.normal.z > 0.7:
                    v = min(v, 0.97)
                uvl.data[li].uv = (min(max(u, 0.01), 0.99), min(max(v, 0.01), 0.99))


# photo-textured furniture (Flow product photos, cut out by prep_tex.py): sofa, side/hall/coffee/kitchen tables
photo_group(["sofa_base", "sofa_back", "sofa_arm-1", "sofa_arm1", "cush-1", "cush0", "cush1"] + [f"sofa_leg{i}" for i in range(4)],
            "sofa_front", (0, 0), (1, 0), -1.06, 1.06, 0.0, 0.67)
photo_group(["st_top"] + [f"st_leg{i}" for i in range(4)], "side_table", (-1.6, 1.6), (1, 0), -0.26, 0.26, 0.0, 0.6)
photo_group(["ct_top", "ct_shelf"] + [f"ct_leg{i}" for i in range(4)], "side_table", (0, 0.15), (1, 0), -0.56, 0.56, 0.0, 0.45)
photo_group(["h_table_top", "h_table_dr", "h_table_kn"] + [f"h_table_leg{i}" for i in range(4)], "side_table",
            (HX - HW + 0.18, 0.15), (0, 1), -0.29, 0.29, 0.0, 0.75)
photo_group(["books"], "books", (-1.32, 0), (1, 0), -0.12, 0.12, 1.58, 1.82)
photo_group(["pillow1"], "pillow_y", (-0.68, 0), (1, 0), -0.2, 0.2, 0.34, 0.71)
photo_group(["pillow2"], "pillow_g", (0.72, 0), (1, 0), -0.2, 0.2, 0.34, 0.73)
photo_group(["dogbed", "dogbed_c"], "dogbed", (1.75, 0), (1, 0), -0.49, 0.49, 0.0, 0.2)
photo_group(["magstack"], "mags", (-1.7, 0), (1, 0), -0.16, 0.16, 0.0, 0.13)
photo_group(["basket"], "basket", (-2.15, 0), (1, 0), -0.23, 0.23, 0.0, 0.31)
photo_group(["h_radiator"] + [f"h_rad_fin{i}" for i in range(7)], "radiator", (0, -1.9), (0, -1), -0.37, 0.37, 0.14, 0.66)


def hide(o, h=True):
    o.hide_render = h; o.hide_viewport = h


# ================================================================ zaw-dog #3 additions
# ----- VLVT furniture: modelled boxes, the Flow FRONT photo projected on faces that face front/back, the SIDE photo on
# faces that face sideways (u along the depth), tops read the photo's top edge. Built in local space (front = -Y).
def vlvt_group(root_name, parts, front, side, W, Dp, Hh, loc, yaw, z_off=0.0):
    """parts: [(name, size, bottom-centre loc)] in local metres; front/side: tex names; W, Dp, Hh: the photo extents."""
    root = K.link(bpy.data.objects.new(root_name, None))
    for n_ in (front, side):
        img(n_).alpha_mode = "CHANNEL_PACKED"
    mf, ms = mtex(front), mtex(side)
    for nm, size, lc in parts:
        o = box(nm, size, lc, mf); me = o.data; me.materials.clear(); me.materials.append(mf); me.materials.append(ms)
        uvl = me.uv_layers.active
        for p in me.polygons:
            sidef = abs(p.normal.x) > 0.6
            p.material_index = 1 if sidef else 0
            for li, vi in zip(p.loop_indices, p.vertices):
                c = me.vertices[vi].co + o.location
                v = (c.z - z_off) / Hh
                if p.normal.z > 0.7:
                    v = min(v, 0.95)
                u = (c.y / Dp + 0.5) if sidef else (c.x / W + 0.5)
                uvl.data[li].uv = (min(max(u, 0.01), 0.99), min(max(v, 0.01), 0.99))
        o.parent = root
    root.location = loc; root.rotation_euler = (0, 0, yaw)
    return root


# ----- living room: armchair (mustard velvet, Flow front + side photos), facing +X across the rug
ARM_AT = (-1.6, 0.35)
ARMCHAIR = vlvt_group("armchair", [
    ("ac_base", (0.86, 0.8, 0.2), (0, 0.0, 0.1)), ("ac_seat", (0.58, 0.62, 0.08), (0, -0.06, 0.3)),
    ("ac_back", (0.86, 0.2, 0.52), (0, 0.3, 0.3)), ("ac_armL", (0.15, 0.8, 0.27), (-0.355, 0.0, 0.3)),
    ("ac_armR", (0.15, 0.8, 0.27), (0.355, 0.0, 0.3))] + [(f"ac_leg{i}", (0.05, 0.05, 0.1), (x, y, 0)) for i, (x, y) in
                                                         enumerate(((-0.36, -0.33), (0.36, -0.33), (-0.36, 0.33), (0.36, 0.33)))],
    "armchair_front", "armchair_side", 0.9, 0.84, 0.82, (ARM_AT[0], ARM_AT[1], 0), math.pi / 2)
ARM_SEAT_Z = 0.37                   # cushion top 0.38 (seat lowered for her short photo legs)
TV_SCREEN = K.plane("tv_screen", 0.86, 0.86 * 144 / 256, (0, LY0 + 0.265, 0.56 + 0.29), rot=(math.pi / 2, 0, math.pi),
                    mat=K.mat_image("m_tvins", img("tv_insert"), emit_only=True))
frame_pic("pic_n1", "pic_bed3", 0.42, (1.65, LY0 + 0.03, 1.5), math.pi)      # the crying beagle (night easter egg)
LR_CT = [o for o in bpy.data.objects if o.name.startswith(("ct_", "mug", "mag1", "mag2", "remote", "tissue_box"))]

# ----- night: the window sky -> the Flow night sky, a warm lamp, the TV glows blue
SKY_MATS = [bpy.data.materials["m_sky"], bpy.data.materials["m_sky2"]]
NIGHT_IMG = img("sky_night"); DAY_IMG = img("sky")
TV_LIGHT = bpy.data.lights.new("tv_light", "AREA"); TV_LIGHT.energy = 0.0; TV_LIGHT.color = (0.45, 0.6, 1.0); TV_LIGHT.size = 1.0
_tvl = K.link(bpy.data.objects.new("tv_light", TV_LIGHT)); _tvl.location = (0, LY0 + 0.6, 0.9); _tvl.rotation_euler = (-math.pi / 2, 0, 0)


def set_night(on):
    for m in SKY_MATS:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE":
                n.image = NIGHT_IMG if on else DAY_IMG
    SUN.data.energy = 0.7 if on else 2.4
    TV_LIGHT.energy = 60.0 if on else 0.0
    hide(TV_SCREEN, not on)


# ----- street (line 3): the brick house across the road gets a warm-lit window
WARM = K.mat_color("warm_win", "#FFC56A", emit_only=True); COLD = mcol("#3A4A58")


def street_warm(on):
    for nm in ("hs1_wg0", "hs1_wg1"):
        o = bpy.data.objects[nm]; o.data.materials[0] = WARM if on else COLD


# ----- bedroom behind the hallway's right doorway (replaces the kitchen corner), clear acrylic door in the doorway
for o in [o for o in bpy.data.objects if o.name.startswith("hk_")]:
    bpy.data.objects.remove(o)
RX0, RX1, RY0, RY1 = HX + HW + 0.12, HX + HW + 3.8, -1.9, 2.0
WALLB = mat_wall("wall_lr", top=0.18, bottom=0.1)
box("r_floor", (RX1 - RX0, RY1 - RY0, 0.06), ((RX0 + RX1) / 2, (RY0 + RY1) / 2, -0.06), WOOD, 0.9)
K.box("r_ceil", (RX1 - RX0, RY1 - RY0, 0.08), ((RX0 + RX1) / 2, (RY0 + RY1) / 2, LH + 0.04), CEIL)
RWIN = (RY0 + 0.9, RY0 + 2.1, 0.95, 2.2)                                            # window on the far wall (x = RX1)
wall("r_wfar", "x", RX1 + 0.06, RY0, RY1, 0, LH, [(RWIN[0], RWIN[1], RWIN[2], RWIN[3])], WALLB, uv=0.4)
wall("r_w0", "y", RY0 - 0.06, RX0, RX1, 0, LH, [], WALLB, uv=0.4)
wall("r_w1", "y", RY1 + 0.06, RX0, RX1, 0, LH, [], WALLB, uv=0.4)
for nm, size, loc in [("r_sk0", (RX1 - RX0, 0.03, 0.1), ((RX0 + RX1) / 2, RY0 + 0.015, 0)), ("r_sk1", (RX1 - RX0, 0.03, 0.1), ((RX0 + RX1) / 2, RY1 - 0.015, 0)),
                      ("r_sk2", (0.03, RY1 - RY0, 0.1), (RX1 - 0.015, (RY0 + RY1) / 2, 0))]:
    box(nm, size, loc, TRIM)
for nm, size, loc in [("rw_sill", (0.26, 1.36, 0.05), (RX1 - 0.02, (RWIN[0] + RWIN[1]) / 2, RWIN[2] - 0.05)),
                      ("rw_l", (0.16, 0.08, RWIN[3] - RWIN[2]), (RX1 + 0.06, RWIN[0] + 0.04, RWIN[2])),
                      ("rw_r", (0.16, 0.08, RWIN[3] - RWIN[2]), (RX1 + 0.06, RWIN[1] - 0.04, RWIN[2])),
                      ("rw_t", (0.16, RWIN[1] - RWIN[0], 0.06), (RX1 + 0.06, (RWIN[0] + RWIN[1]) / 2, RWIN[3] - 0.06)),
                      ("rw_m", (0.1, 0.04, RWIN[3] - RWIN[2]), (RX1 + 0.08, (RWIN[0] + RWIN[1]) / 2, RWIN[2]))]:
    box(nm, size, loc, WFR)
for k in range(2):                                                                        # curtains
    box(f"r_curt{k}", (0.06, 0.2, 1.9), (RX1 - 0.1, RWIN[0] - 0.12 + k * (RWIN[1] - RWIN[0] + 0.24), 0.45), CURT)
for i, (y_, n_, h_) in enumerate(((-1.0, "tree_round", 5.0), (0.8, "tree_tall", 6.0))):    # the garden outside the window
    card(f"r_tree{i}", n_, h_, (RX1 + 4.0 + 1.5 * i, y_, 0), yaw=-math.pi / 2)
box("r_lawn", (12, 12, 0.04), (RX1 + 6, 0, -0.04), mtex("grass"), 1.6)
K.plane("r_sky", 40, 18, (RX1 + 14, 0, 6), rot=(math.pi / 2, 0, -math.pi / 2), mat=K.mat_image("m_rsky", img("sky"), emit_only=True))
# bed (Flow foot-end + side photos), headboard against the far wall, bedside table + lamp, rug, slippers
BED_C = (RX1 - 1.05, 1.15)
vlvt_group("bed", [("bed_base", (2.0, 1.5, 0.3), (0, 0, 0.08)), ("bed_duvet", (2.02, 1.52, 0.18), (0, 0, 0.38)),
                   ("bed_pill", (0.45, 1.3, 0.12), (0.72, 0, 0.56))] +
           [(f"bed_leg{i}", (0.06, 0.06, 0.08), (x, y, 0)) for i, (x, y) in enumerate(((-0.95, -0.7), (0.95, -0.7), (-0.95, 0.7), (0.95, 0.7)))],
           "bed_side", "bed_front", 2.0, 1.5, 0.7, (BED_C[0], BED_C[1], 0), 0.0)
front_box("headboard", "headboard", (1.55, 0.06, 1.05), (RX1 - 0.04, BED_C[1], 0), -math.pi / 2, "#C79A62")
front_box("bedside", "bedside", (0.42, 0.4, 0.8), (RX1 - 0.25, BED_C[1] - 1.05, 0), -math.pi / 2, "#B98A55")
box("r_rug", (1.6, 1.2, 0.012), (RX0 + 1.35, 0.1, 0), mtex("rug_soft"), 0.42)
card("slippers", "slippers", 0.09, (RX0 + 1.6, -0.75, 0), yaw=math.pi / 2 + 0.3)
frame_pic("r_pic1", "pic_bed1", 0.5, ((RX0 + RX1) / 2 + 0.6, RY1 - 0.02, 1.55), 0)
frame_pic("r_pic2", "pic_bed4", 0.42, (RX0 + 0.9, RY1 - 0.02, 1.5), 0)
frame_pic("r_pic3", "pic_bed2", 0.4, ((RX0 + RX1) / 2, RY0 + 0.02, 1.55), math.pi)
K.plane("r_tag", 0.5, 0.156, (RX1 - 0.025, 0.8, 1.62), rot=(math.pi / 2, 0, -math.pi / 2), mat=mtex("tag_doggo"))   # in line with the doorway: reads whole   # the channel's wall tag
# the hall table + its clutter go (the door-test cameras stand there): props vary per video
for o in [o for o in bpy.data.objects if o.name.startswith(("h_table", "h_mail", "h_keybowl"))]:
    bpy.data.objects.remove(o)

# ================================================================ zaw-dog #4 additions
# wall tags "DOGGO POLY SHORTS" (living room left wall, hallway)
K.plane("lr_tag", 0.62, 0.62 * 80 / 256, (LX0 + 0.025, -0.1, 1.95), rot=(math.pi / 2, 0, math.pi / 2), mat=mtex("tag_doggo"))
K.plane("h_tag", 0.5, 0.156, (HX + HW - 0.012, 1.1, 1.62), rot=(math.pi / 2, 0, -math.pi / 2), mat=mtex("tag_doggo"))
frame_pic("pic5", "pic_bed2", 0.38, (LX0 + 0.03, -0.95, 1.95), math.pi / 2)            # funny dog pictures (kit Flow images)

# ===== DOG PARK (new hook set; joins the kit). Origin PX, PY. Grass, wooden picket fence, benches, trees, a poop-bag
# dispenser + bin, a "DOG PARK" sign, a bin and a fountain - every piece from the Flow sheet (VLVT: photo-textured boxes,
# lofted round props, crossed photo cards for the foliage like Zaw's sprites)
PX, PY = 60.0, 0.0


def xcard(name, n, h, loc, yaw=0.0):
    """a tree / bush from two crossed photo cards (reads 3D from any angle)."""
    return [card(name + "_a", n, h, loc, yaw), card(name + "_b", n, h, loc, yaw + math.pi / 2)]


box("p_grass", (60, 60, 0.04), (PX, PY + 10, -0.04), mtex("grass"), 1.4)
FW = 2.34                                                                            # one fence photo = 2.34 m x 1.0 m
for i in range(-5, 6):                                                               # back fence y = 6.5, front y = -6, sides x = +-7
    card(f"fence_b{i}", "fence", 1.0, (PX + i * FW, PY + 6.5, 0), 0.0, FW)
    card(f"fence_f{i}", "fence", 1.0, (PX + i * FW, PY - 6.0, 0), math.pi, FW)
for sx in (-1, 1):
    for j in range(-3, 4):
        card(f"fence_s{sx}{j}", "fence", 1.0, (PX + sx * 7.0, PY + j * FW + 0.5, 0), math.pi / 2, FW)
FWOOD = mcol("#8A7258")
for i in range(-5, 7):                                                               # 3D posts every panel (depth)
    box(f"fpost{i}", (0.09, 0.09, 1.08), (PX + (i - 0.5) * FW, PY + 6.5, 0), FWOOD)
BENCH_PARTS = [("bseat", (1.5, 0.42, 0.06), (0, 0.0, 0.42)), ("bback", (1.5, 0.06, 0.42), (0, 0.2, 0.5))] + \
    [(f"bleg{i}", (0.06, 0.42, 0.42), (x, 0.0, 0)) for i, x in enumerate((-0.6, 0.6))]
for k, (bx, by, yaw) in enumerate(((PX - 2.6, PY + 5.2, 0.0), (PX + 4.6, PY + 3.0, -math.pi / 2 + 0.2))):
    vlvt_group(f"bench{k}", [(f"{n}{k}", s, l) for n, s, l in BENCH_PARTS], "bench_front", "bench_side", 1.62, 0.6, 0.92, (bx, by, 0), yaw)
# poop-bag dispenser on its post + the bin under it
DX0, DY0_ = PX - 4.6, PY + 5.6
box("disp_post", (0.07, 0.07, 1.55), (DX0, DY0_, 0), mcol("#2E5E3C"))
front_box("disp_box", "dispenser_box", (0.3, 0.16, 0.4), (DX0, DY0_ - 0.1, 1.2), 0.0, "#2E6A44")
PP.loft(os.path.join(T, "src", "bin_park.png"), "disp_bin", height=0.55, sides=8, loc=(DX0, DY0_ - 0.12, 0.12))
# the "DOG PARK" sign: board + two posts
SGN = (PX + 0.9, PY + 5.9)
for sx in (-1, 1):
    box(f"sign_post{sx}", (0.09, 0.09, 1.75), (SGN[0] + sx * 0.62, SGN[1], 0), mtex("dp_post"))
front_box("sign_board", "dp_sign", (1.55, 0.06, 0.37), (SGN[0], SGN[1] - 0.06, 1.25), 0.0, "#5A3A26")
PP.loft(os.path.join(T, "src", "bin_park.png"), "bin_park", height=0.85, sides=10, loc=(PX + 3.9, PY + 5.6, 0))
PP.loft(os.path.join(T, "src", "fountain.png"), "fountain", height=1.0, sides=8, loc=(PX - 5.6, PY + 2.2, 0))
for i, (x_, y_, n_, h_) in enumerate(((-4.0, 8.5, "tree_park", 5.8), (1.5, 9.5, "tree_park", 6.5), (6.0, 8.2, "tree_park", 5.5),
                                      (-8.5, 4.0, "tree_park", 6.0), (9.0, 1.5, "tree_park", 6.2), (-9.5, -3.0, "tree_round", 6.0),
                                      (9.5, -4.5, "tree_tall", 7.0), (-1.5, 14.0, "tree_tall", 7.5), (5.0, 15.0, "tree_round", 6.5),
                                      (-7.0, 13.0, "tree_round", 6.0), (11.0, 10.0, "tree_park", 6.0), (-12.0, 9.0, "tree_park", 6.5),
                                      (-4.0, -9.0, "tree_park", 6.0), (3.0, -10.0, "tree_round", 6.5), (10.0, -9.0, "tree_park", 5.8))):
    xcard(f"ptree{i}", n_, h_, (PX + x_, PY + y_, 0), 0.3 * i)
for i, x_ in enumerate((-5.5, -3.6, -0.6, 2.6, 5.3)):
    xcard(f"pbush{i}", "bush_park", 0.75 + 0.15 * (i % 2), (PX + x_, PY + 6.9, 0), 0.4 * i)
for k, (loc, rot) in enumerate((((PX, PY + 35, 12), (math.pi / 2, 0, 0)), ((PX, PY - 30, 12), (math.pi / 2, 0, math.pi)),
                                ((PX + 32, PY, 12), (math.pi / 2, 0, -math.pi / 2)), ((PX - 32, PY, 12), (math.pi / 2, 0, math.pi / 2)))):
    K.plane(f"p_sky{k}", 170, 130, (loc[0], loc[1], 45), rot=rot, mat=bpy.data.materials["m_sky"])   # tall: no top edge from the low angle

# ===== PROPS (Flow props sheet): pumpkin pail (lofted, black handle), pop-up book (photo card on a base), the fake
# plush dog (heightfield-inflated from its Flow side photo), room divider (three photo panels), fleece tube, leash, collar
PAIL = K.link(bpy.data.objects.new("pail", None))
_pb = PP.loft(os.path.join(T, "src", "pail.png"), "pail_body", height=0.2, sides=10, loc=(0, 0, 0)); _pb.parent = PAIL   # carved face -> -Y
_bm = bmesh.new(); _bm.from_mesh(_pb.data); _bm.faces.ensure_lookup_table()                                  # an open pail: drop the
bmesh.ops.delete(_bm, geom=[max(_bm.faces, key=lambda f_: f_.calc_center_median().z)], context="FACES_ONLY")   # top cap (no red lid)
_bm.to_mesh(_pb.data); _bm.free()
for k in range(7):                                                                       # the handle: an arc of bars
    a0, a1 = math.pi * k / 7, math.pi * (k + 1) / 7
    p0 = Vector((0.115 * math.cos(a0), 0, 0.2 + 0.1 * math.sin(a0))); p1 = Vector((0.115 * math.cos(a1), 0, 0.2 + 0.1 * math.sin(a1)))
    hb = K.box(f"pail_h{k}", ((p1 - p0).length + 0.006, 0.012, 0.012), (0, 0, 0), mcol("#141414")); hb.parent = PAIL
    hb.location = (p0 + p1) / 2; hb.rotation_euler = (0, -math.atan2(p1.z - p0.z, p1.x - p0.x), 0)
BOOK = K.link(bpy.data.objects.new("book", None))
_bk = card("book_card", "popup_book", 0.2, (0, 0, 0.0), 0.0); _bk.parent = BOOK
DIV = K.link(bpy.data.objects.new("divider", None))
for k in range(3):                                                                       # zig-zag panels, 0.5 m wide, 1.7 m tall
    pv = K.link(bpy.data.objects.new(f"div_p{k}", None)); pv.parent = DIV
    pv.location = ((k - 1) * 0.48, 0.06 * (k % 2), 0); pv.rotation_euler = (0, 0, 0.25 * (1 if k % 2 else -1))
    pn = front_box(f"div_{k}", f"divider_{k + 1}", (0.48, 0.03, 1.72), (0, 0, 0), 0.0, "#8A5A34"); pn.parent = pv
    pn.location = (0, 0, 0.86)
    bk = front_box(f"div_b{k}", f"divider_{k + 1}", (0.48, 0.005, 1.72), (0, 0, 0), math.pi, "#8A5A34"); bk.parent = pv
    bk.location = (0, 0.018, 0.86); bk.rotation_euler = (0, 0, math.pi)                    # the fabric seen from behind too
FLEECE = K.link(bpy.data.objects.new("fleece", None))
_fl = frustum("fleece_tube", 0.09, 0.09, 0.42, (0, 0, 0), mtex("fleece_tube"), seg=10); _fl.parent = FLEECE
_fl.rotation_euler = (0, math.pi / 2, 0); _fl.location = (-0.21, 0, 0.09)
LEASH_M = mtex("leash_sw")
LEASH = [K.box(f"leash{k}", (1.0, 0.016, 0.006), (0, 0, 0), LEASH_M) for k in range(18)]


def plush_build():
    """the fake dog: its Flow side photo (plush_side.png, alpha = silhouette) inflated into a soft heightfield on a grid
    (thickness ~ sqrt(distance to the outline), the 'teddy' inflation), the same photo on both flanks. Separate parts so
    it can bark (head) and wag (tail); the side view's single leg per pair is built twice, side by side."""
    im = img("plush_side"); W, Hh = im.size
    px = np.array(im.pixels[:]).reshape(Hh, W, 4)[::-1]                                  # row 0 = top
    A = px[..., 3] > 0.5
    S = 0.34 / Hh                                                                        # 34 cm tall plush
    st = 3                                                                               # grid step (px)

    def dist(m):
        d = np.zeros(m.shape); cur = m.copy(); k = 0
        while cur.any():
            k += 1; d[cur] = k
            cur = cur & np.roll(cur, 1, 0) & np.roll(cur, -1, 0) & np.roll(cur, 1, 1) & np.roll(cur, -1, 1)
        return d
    yy, xx = np.mgrid[:Hh, :W]
    BELLY = 0.70
    parts = {"head": A & (xx < 0.46 * W) & (yy < 0.48 * Hh), "tail": A & (xx > 0.74 * W) & (yy < 0.55 * Hh)}
    parts["body"] = A & ~(A & (xx < 0.40 * W) & (yy < 0.40 * Hh)) & ~(A & (xx > 0.80 * W) & (yy < 0.55 * Hh)) & (yy < (BELLY + 0.03) * Hh)
    parts["legs"] = A & (yy >= BELLY * Hh) & ~parts["head"]
    mat = K.mat_image("plush_m", im)
    root = K.link(bpy.data.objects.new("plush", None))
    piv = {"head": (0.44 * W, 0.42 * Hh), "tail": (0.76 * W, 0.52 * Hh)}
    out = {}
    for nm, m in parts.items():
        d = dist(m); dm = max(d.max(), 1)
        tmax = {"head": 0.07, "tail": 0.024, "body": 0.08, "legs": 0.032}[nm]
        for off in ((-0.042, 0.042) if nm == "legs" else (0.0,)):
            gy = np.arange(0, Hh, st); gx = np.arange(0, W, st)
            ins = m[np.ix_(gy, gx)]
            vid = {}; verts = []; uvs = []
            P0 = piv.get(nm, (W / 2, Hh))
            for i, y_ in enumerate(gy):
                for j, x_ in enumerate(gx):
                    if not ins[i, j]:
                        continue
                    edge = not (0 < i < len(gy) - 1 and 0 < j < len(gx) - 1 and ins[i - 1, j] and ins[i + 1, j] and ins[i, j - 1] and ins[i, j + 1])
                    t = 0.0 if edge else tmax * (d[y_, x_] / dm) ** 0.5
                    if nm == "legs":
                        t = 0.0 if edge else tmax * min(1.0, (d[y_, x_] / 8.0) ** 0.5)
                    lyv, lz = (x_ - P0[0]) * S, (P0[1] - y_) * S
                    uv = (x_ / W, 1 - y_ / Hh)
                    for sd in ((0,) if edge else (-1, 1)):
                        vid[(i, j, sd)] = len(verts); verts.append((off + sd * t, lyv, lz)); uvs.append(uv)
                    if edge:
                        vid[(i, j, -1)] = vid[(i, j, 1)] = vid[(i, j, 0)]
            faces = []
            for i in range(len(gy) - 1):
                for j in range(len(gx) - 1):
                    q = [(i, j), (i, j + 1), (i + 1, j + 1), (i + 1, j)]
                    if all(ins[a, b] for a, b in q):
                        for sd in (-1, 1):
                            f = [vid[(a, b, sd)] for a, b in q]
                            faces.append(f if sd > 0 else f[::-1])
            faces = [f for f in faces if len(set(f)) >= 3]
            me = bpy.data.meshes.new(f"plush_{nm}{off}"); me.from_pydata(verts, [], [tuple(dict.fromkeys(f)) for f in faces]); me.update()
            uvl = me.uv_layers.new(name="UV")
            for p in me.polygons:
                for li, vi in zip(p.loop_indices, p.vertices):
                    uvl.data[li].uv = uvs[vi]
            me.materials.append(mat)
            o = K.link(bpy.data.objects.new(f"plush_{nm}{off}", me))
            pe = K.link(bpy.data.objects.new(f"plush_piv_{nm}{off}", None)); pe.parent = root
            pe.location = (0, (P0[0] - W / 2) * S, (Hh - P0[1]) * S); o.parent = pe
            out[nm] = pe
    return root, out


PLUSH, PLUSH_P = plush_build()
PLUSH_PARTS = [o for o in bpy.data.objects if o.name.startswith("plush_") and o.type == "MESH"]


def plush(loc, yaw, t=0.0, bark=0.0, wag=1.0, roll=0.0, surface=None):
    """place the fake dog (faces -Y rotated by yaw); bark lifts the head, wag swings the tail (mechanical, 5 Hz).
    A contact shadow sits on the surface under it (surface z: given, or its own base when upright)."""
    for o in PLUSH_PARTS:
        hide(o, False)
    sz = surface if surface is not None else (loc[2] if abs(roll) < 0.3 else max(0.0, loc[2] - 0.09))
    if loc[2] - sz < 0.2:
        cshadow(3, loc[0], loc[1], sz, 0.36, 0.24, yaw + math.pi / 2)
    PLUSH.location = loc; PLUSH.rotation_euler = (0, roll, yaw)
    PLUSH_P["head"].rotation_euler = (-0.28 * bark, 0, 0)
    PLUSH_P["tail"].rotation_euler = (0, 0.5 * wag * math.sin(2 * math.pi * 5 * t), 0)

# ================================================================ zaw-dog #5 additions (Flow props sheet 2026-11-10, prep_05.py)
# big yellow 3D texts (user: clean bright yellow, square to the lens, the whole word pops at once; edges pixelated in post)
UNI = "C:/Windows/Fonts/seguisym.ttf" if os.name == "nt" else "/Library/Fonts/Arial Unicode.ttf"   # (the logo font has no check / cross)
TXT = {k: K.Letters3D(f"t_{k}", v, size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)
       for k, v in (("r300", "300,000,000"), ("r6", "6,000,000"), ("barn", "BARNARD COLLEGE,\n2019"), ("wk2", "2 WEEKS"),
                    ("opt", "MORE\nOPTIMISTIC"), ("qm", "?"), ("no", "NO!"))}
TXT["ok"] = K.Letters3D("t_ok", "✓", size=0.16, front="#22D23A", side="#0E7A1E", font=UNI, seed=3, jitter=0.0)
TXT["x"] = K.Letters3D("t_x", "✗", size=0.16, front="#F0221C", side="#8E0E0A", font=UNI, seed=3, jitter=0.0)


def bowl_build(name, src, food=False):
    """a steel dog bowl: its Flow 3/4 photo lofted (rings above the rim dropped in prep_05), the Flow top-down photo on
    the open top, and for the food bowl the Flow kibble heap as a low mound inside the rim."""
    root = K.link(bpy.data.objects.new(name, None))
    P_ = json.load(open(os.path.join(T, "src", src + ".prop.json"))); x0, x1, y0, y1 = P_["box"]
    rmax = max(r for _, r in P_["rings"]); hgt = 0.11 * (y1 - y0) / rmax                 # 22 cm across the rim / flange
    b = PP.loft(os.path.join(T, "src", src + ".png"), name + "_body", height=hgt, sides=14); b.parent = root
    top_z = max(v.co.z for v in b.data.vertices); bot_z = min(v.co.z for v in b.data.vertices)   # (rings start at the rim row)
    b.scale = (1, 1, 0.07 / (top_z - bot_z)); b.location.z = -bot_z * b.scale.z               # 7 cm tall, ON the floor
    rr = P_["rings"][0][1] * hgt / (y1 - y0)                                               # rim radius
    tp = K.plane(name + "_top", 2 * rr * 1.02, 2 * rr * 1.02, (0, 0, 0.0705), rot=(0, 0, 0), mat=mcut("bowl_top")); tp.parent = root
    if food:
        fm = K.plane(name + "_kib", 2 * rr * 0.86, 2 * rr * 0.86, (0, 0, 0.078), rot=(0, 0, 0), mat=mcut("kibble_top")); fm.parent = root
    return root


BOWL_F = bowl_build("bowl_food", "bowl_food", food=True)
BOWL_E = bowl_build("bowl_empty", "bowl")
BOWL_M = bowl_build("bowl_myst", "bowl")
# the lamppost (street, line 1-4 + 14): the Flow cast-iron post, lantern and pole lofted separately (the thin neck
# between them stops one profile), 3.6 m, on the lawn edge of the sidewalk in front of the house
LAMP = (0.9, 5.0)
_lp = PP.loft(os.path.join(T, "src", "lamp_pole.png"), "lamp_pole", height=2.85, sides=10, loc=(LAMP[0], LAMP[1], 0)); _lp.scale = (1.5, 1.5, 1)
_lh = PP.loft(os.path.join(T, "src", "lamp_head.png"), "lamp_head", height=0.72, sides=8, loc=(LAMP[0], LAMP[1], 2.83)); _lh.scale = (1.2, 1.2, 1)
LAMP_OBJS = [_lp, _lh]
K.plane("st_tag", 0.9, 0.9 * 80 / 256, (-2.4, LY1 + 0.215 + 0.004, 1.15), rot=(math.pi / 2, 0, math.pi), mat=mtex("tag_doggo"))   # (review 3: read as a floating leash handle next to his hand)   # the channel tag on the facade
for i, x_ in enumerate((-1.6, -0.6, 2.4, 3.6)):                                      # a low hedge along the lawn (kit hedge photo)
    card(f"st_hedge{i}", "hedge", 0.55, (x_, 3.3, 0), yaw=math.pi)
# park props: the striped towel (Flow top photo on a thin slab) with a treat under its corner, treats in the grass
TOWEL = K.link(bpy.data.objects.new("towel", None))
_tw = K.plane("towel_top", 0.72, 0.48, (0, 0, 0.012), rot=(0, 0, 0), mat=mtex("towel_top")); _tw.parent = TOWEL
_tl = K.box("towel_lump", (0.16, 0.12, 0.035), (0.22, 0.1, 0.0), mcol("#7FA7D6"))   # (the photo on a box showed a black corner); _tl.parent = TOWEL     # a treat hidden under it
TREATS = [card(f"treat_pile{k}", "treats", 0.07, (0, -40, 0)) for k in range(3)]
TREAT_BITS = [K.box(f"treat_bit{k}", (0.035, 0.025, 0.018), (0, -40, 0), mtex("treat_sw")) for k in range(8)]
# line 2 headline cards: the Flow newspaper, headline overprinted (prep_05)
NEWS = {k: card(f"card_{k}", k, 0.42, (0, -40, 0)) for k in ("news_buster", "news_newdog")}
# line 5: 20 dog cards (the kit's Flow dog portraits, two mirrored) in a 5 x 4 grid
PORTS = []
for k in range(20):
    pm = mtex(f"port_{k % 18:02d}")
    pc = K.plane(f"port{k}", 0.2, 0.2, (0, -40, 0), mat=pm)
    if k >= 18:
        pc.data.uv_layers.active.data.foreach_set("uv", [1 - u if j % 2 == 0 else u for j, u in enumerate(np.array([d.uv[:] for d in pc.data.uv_layers.active.data]).ravel())])
    PORTS.append(pc)
# line 12: sparkles (four-point stars, emissive yellow-white)
SPARK_M = K.mat_color("spark_m", "#FFF6B0", emit_only=True)
SPARKS = []
for k in range(7):
    pts = [(math.cos(a) * (1.0 if j % 2 == 0 else 0.28), math.sin(a) * (1.0 if j % 2 == 0 else 0.28)) for j, a in enumerate(math.pi / 4 * np.arange(8) + math.pi / 2)]
    SPARKS.append(K.extrude_poly(f"spark{k}", [(x * 0.045, y * 0.045) for x, y in pts], 0.01, SPARK_M, (0, -40, 0), (math.pi / 2, 0, 0)))
NEW5 = [BOWL_F, BOWL_E, BOWL_M, TOWEL] + TREATS + TREAT_BITS + list(NEWS.values()) + PORTS + SPARKS

# ----- review fixes (revisar_render 2026-11-10)
# the street continues past our house: brick walls both sides + eaves, and sky photos west / east (no white void)
for nm, x0, x1 in (("facade_w", -32.0, -7.0), ("facade_e", 7.0, 32.0)):
    wall(nm, "y", LY1 + 0.15, x0, x1, 0, 3.0, [], BRICK, t=0.06, uv=0.9)
    box(nm + "_eave", (x1 - x0 + 0.2, 0.6, 0.18), ((x0 + x1) / 2, LY1 + 0.35, 3.0), mcol("#4D4A48"))
for k, (x_, yaw_) in enumerate(((-45.0, -math.pi / 2), (45.0, math.pi / 2))):
    K.plane(f"st_sky{k}", 120, 70, (x_, 10, 25), rot=(math.pi / 2, 0, yaw_), mat=bpy.data.materials["m_sky"])
for i, x_ in enumerate((-9.5, -12.5, 9.0, 12.0)):
    card(f"st_tree{i}", "tree_round" if i % 2 else "tree_tall", 5.5 + 0.5 * (i % 2), (x_, LY1 + 1.2, 0), yaw=math.pi)
# the blank mirror on the living-room wall -> a funny dog picture (review: empty blue frame)
_mir = bpy.data.objects["mirror"]; _mir.data.materials.clear(); _mir.data.materials.append(mtex("pic_meme4"))
# park front fence: bushes + a bench in the middle distance (review: vast empty lawn behind the heel walk)
for i, x_ in enumerate((-3.2, -0.4, 2.4)):
    xcard(f"pbush_f{i}", "bush_park", 0.8, (PX + x_, PY - 5.4, 0), 0.5 * i)
vlvt_group("bench2", [(f"{n}2", s_, l_) for n, s_, l_ in BENCH_PARTS], "bench_front", "bench_side", 1.62, 0.6, 0.92, (PX + 1.0, PY - 5.2, 0), math.pi)
TOWEL_PARTS = [_tw, _tl]

# ----- user standing rules (2026-11-10, all Doggo videos): crisp rug photo (new Flow image, Closest filtering); the new
# high-res Flow sky is tex/sky.png (prep_05.py) and feeds every sky / window material
hide(bpy.data.objects["rug"], True)
RUG_HD = K.plane("rug_hd", 2.6, 1.7, (0, 0.15, 0.0125), rot=(0, 0, 0), mat=mtex("rug_hd"))

# ---------------------------------------------------------------- characters
DOGS = []
for i in range(2):                                     # 0 = our dog (approved v2), 1 = the park rival (v2, white fluffy coat)
    o, arm, fn = D.build()
    mv = K.link(bpy.data.objects.new(f"mover{i}", None)); arm.parent = mv
    sh = D.blob_shadow(mv)
    DOGS.append(dict(o=o, arm=arm, fn=fn, mv=mv, sh=sh))
# the rival: own material + the recoloured atlases (prep_04.py), 0.82 x size, inflated + tufted coat, tail curled up
_rv = DOGS[1]; _rm = _rv["o"].material_slots[0].material.copy(); _rm.name = "rival_m"; _rv["o"].material_slots[0].material = _rm
_rv["fn"] = next(n for n in _rm.node_tree.nodes if n.type == "TEX_IMAGE")
RIVAL_IMG = {e: img(f"rival_atlas_{e}") for e in ("neutral", "happy", "sad", "judging", "shocked")}
_rv["atlas"] = RIVAL_IMG
_me = _rv["o"].data; _pa = [0] * len(_me.polygons); _me.attributes["part"].data.foreach_get("value", _pa)
_vg = _rv["o"].vertex_groups.new(name="fluff"); _coat = {D.PARTS.index(x) for x in ("torso", "neck", "leg_f", "leg_h", "tail")}
_ex = {v for p in _me.polygons if _pa[p.index] not in _coat for v in p.vertices}
_vg.add([v.index for v in _me.vertices if v.index not in _ex], 1.0, "REPLACE")
_ss = _rv["o"].modifiers.new("soft", "SUBSURF"); _ss.levels = _ss.render_levels = 1                    # rounder coat silhouette in close-ups
_dm = _rv["o"].modifiers.new("fluff", "DISPLACE"); _dm.mid_level = 0.0; _dm.strength = 0.02; _dm.vertex_group = "fluff"   # fluffier, rounder body
_tx = bpy.data.textures.new("tufts", "CLOUDS"); _tx.noise_scale = 0.035
_dm2 = _rv["o"].modifiers.new("tufts", "DISPLACE"); _dm2.texture = _tx; _dm2.mid_level = 0.35; _dm2.strength = 0.03; _dm2.vertex_group = "fluff"
_rv["mv"].scale = (0.82, 0.82, 0.82)

import photohuman2 as PH  # noqa: E402   (welded shoulders, wrap-textured heads, Flow photo hands + shoes)
OWNER = PH.PhotoPerson("owner")
ASSIST = PH.PhotoPerson("pointer")         # the leash assistant (lines 11-13): own face, body, mustard sweater, cargo trousers
PEOPLE = (OWNER, ASSIST)
COLLAR = frustum("collar", 0.072, 0.07, 0.03, (0, 0, 0), mtex("leash_sw"), seg=10)
CSH = [K.plane(f"cshadow{i}", 1.0, 1.0, (0, -40, 0), mat=bpy.data.materials["blob"]) for i in range(4)]   # contact shadows


def cshadow(i, x, y, z, w, h=None, yaw=0.0):
    o = CSH[i]; hide(o, False); o.location = (x, y, z + 0.004); o.scale = (w, h or w, 1); o.rotation_euler = (0, 0, yaw)


def person_shadow(i, P, w=0.75):
    bpy.context.view_layer.update(); hp = bone_w(P, "hips"); cshadow(i, hp.x, hp.y, 0.0, w, w * 0.8, P.arm.rotation_euler.z)

CAM = K.camera("Cam", 24)
K.ps1_snap(CAM, grid_h=300)
_SNAP = {d["o"].name for d in DOGS} | {o.name for P_ in PEOPLE for o in P_.parts} | {o.name for L_ in TXT.values() for o, *_ in L_.letters} | \
    {o.name for o in PLUSH_PARTS}
for o in bpy.data.objects:                                         # static set unsnapped: only characters wobble
    if o.type == "MESH" and o.name not in _SNAP and o.modifiers.get("ps1"):
        o.modifiers.remove(o.modifiers["ps1"])
_GRAZE = ("floor_wood", "rug", "rug_hd", "grass", "asphalt", "concrete", "brick", "doormat", "fabric", "roof")
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image and n.image.name.split(".")[0] in _GRAZE:
                n.interpolation = "Linear"
sc.eevee.taa_render_samples = 16

# ---------------------------------------------------------------- helpers
def dog(i, loc, yaw, expr="neutral", t=0.0, prev=None, a=1.0):
    d = DOGS[i]
    for k in ("o", "sh"):
        hide(d[k], False)
    d["mv"].location = loc; d["mv"].rotation_euler = (0, 0, yaw)
    D.rest(d["arm"]); D.set_face(d["fn"], expr); D.expr_pose(d["arm"], expr, t, prev=prev, a=a)
    return d


def dog_walk(i, t, rate=1.0):
    D.walk_pose(DOGS[i]["arm"], (t * FPS * rate) % D.WALK_T, key=False)


def dog_speed(rate):
    return D.WALK_SPEED * FPS * rate


def dog_sit(i, k=1.0):
    """sit: rump down, chest up, hind paws tucked forward; IK keeps all four paws planted."""
    arm = DOGS[i]["arm"]
    D.move(arm, "hips", (0, 0.0, -0.27 * k))
    D.rot(arm, "hips", (1, 0, 0), -0.55 * k)
    for s_, sx in (("L", 1), ("R", -1)):
        D.move(arm, f"ik_h.{s_}", (0.03 * sx * k, -0.2 * k, 0.0)); D.move(arm, f"ik_f.{s_}", (0, 0.06 * k, 0.0))
    from mathutils import Quaternion
    for bn, a_ in (("neck", 0.42), ("head", 0.15)):
        pb = arm.pose.bones[bn]; pb.rotation_quaternion = Quaternion(D.local_axis(arm, bn, (1, 0, 0)), a_ * k) @ pb.rotation_quaternion


def dog_head(i):
    d = DOGS[i]; bpy.context.view_layer.update()
    return d["arm"].matrix_world @ d["arm"].pose.bones["head"].tail


def dog_nose_to(i, target, k=1.0):
    """place the dog (yaw already set) so its nose (0.5 m ahead of the mover) sits on target's xy."""
    mv = DOGS[i]["mv"]; yaw = mv.rotation_euler.z
    mv.location = (target[0] - 0.5 * math.sin(yaw), target[1] + 0.5 * math.cos(yaw), 0)


def yaw_to(src, dst):
    return math.atan2(dst[0] - src[0], -(dst[1] - src[1]))


def smooth(x):
    x = clamp01(x); return x * x * (3 - 2 * x)


def move(t, d, pos0, pos1, aim0, aim1, lens=24):
    """a smooth eased camera move on the set (dolly / track / crane), from (pos0 -> aim0) to (pos1 -> aim1)."""
    u = smooth(t / d); cam(lerpv(pos0, pos1, u), lerpv(aim0, aim1, u), lens)


def orbit(t, d, pos, aim, deg, lens=24, rise=0.0):
    """a short eased orbit of `deg` degrees round the aim point (vertical axis), optionally rising `rise` m."""
    u = smooth(t / d); a = math.radians(deg) * (u - 0.5)
    dx, dy = pos[0] - aim[0], pos[1] - aim[1]
    cam((aim[0] + dx * math.cos(a) - dy * math.sin(a), aim[1] + dx * math.sin(a) + dy * math.cos(a), pos[2] + rise * (u - 0.5)), aim, lens)


def level(pos, aim_xy, lens=24):
    """Zaw's base shot: the camera at pos (dog-eye height), dead level (horizontal), looking toward aim_xy."""
    cam(pos, (aim_xy[0], aim_xy[1], pos[2]), lens)


def cam(pos, target, lens=24, roll=0.0):
    CAM.data.lens = lens; K.look(CAM, pos, target, roll); K.ps1_snap_update(CAM)


def lerpv(a, b, u):
    return tuple(x + (y - x) * u for x, y in zip(a, b))


def clamp01(x):
    return min(1.0, max(0.0, x))


def bone_w(P, bn, tail=False):
    bpy.context.view_layer.update(); pb = P.arm.pose.bones[bn]
    return P.arm.matrix_world @ (pb.tail if tail else pb.head)


def pvec(P, v):
    return P.arm.matrix_world.to_3x3() @ Vector(v)


def face_pt(P, fwd=0.11, up=0.08, side=0.0):
    """a point in front of the face (person's own axes: their left = +X, front = -Y)."""
    return bone_w(P, "head") + pvec(P, (side, -fwd, up))


def arm_w(P, s, elbow, hand, tip=None):
    """two-bone IK: the wrist lands ON `hand` (world); `elbow` (world) is the pole the elbow bends toward; the hand
    points at `tip`. Upper arm and forearm keep their lengths, so the arm stays welded to the shoulder."""
    for b_ in ("upperarm", "forearm", "hand"):
        P.rot(f"{b_}.{s}", [])
    bpy.context.view_layer.update()
    S = bone_w(P, f"upperarm.{s}"); a = P.arm.data.bones[f"upperarm.{s}"].length; b = P.arm.data.bones[f"forearm.{s}"].length
    v = Vector(hand) - S; dd = min(v.length, (a + b) * 0.995); n = v.normalized(); Hd = S + n * dd
    pole = Vector(elbow) - S; pole = (pole - n * pole.dot(n))
    pole = pole.normalized() if pole.length > 1e-5 else Vector((0, 0, -1))
    x = (a * a - b * b + dd * dd) / (2 * dd); hgt = math.sqrt(max(a * a - x * x, 0.0))
    E = S + n * x + pole * hgt
    tip = tip if tip is not None else Hd + (Hd - E)
    P.aim_bone(f"upperarm.{s}", E); P.aim_bone(f"forearm.{s}", Hd); P.aim_bone(f"hand.{s}", tip)


def sit(P, hip, yaw, seat_z, a1=1.45, lean=0.0):
    """sit on a seat (or the floor): thighs forward, shins solved so both ankles land at 8 cm (soles on the floor)."""
    zc = P.J["z_crotch"]; P.show(True, (hip[0], hip[1], seat_z + 0.03 - zc), yaw)

    def legs(a1_, a2_):
        for s in "LR":
            P.rot(f"thigh.{s}", [((1, 0, 0), -a1_)]); P.rot(f"shin.{s}", [((1, 0, 0), a2_)]); P.rot(f"foot.{s}", [((1, 0, 0), -(a2_ - a1_))])
        return min(bone_w(P, f"foot.{s}").z for s in "LR") - 0.08
    if legs(a1, a1) > 0:                                            # dangling: slope the thighs down until the feet land
        lo, hi = 0.3, a1
        for _ in range(18):
            m_ = (lo + hi) / 2
            if legs(m_, m_) > 0:
                hi = m_
            else:
                lo = m_
        a1 = lo; legs(a1, a1)
    else:                                                           # too long: swing the shins forward
        lo, hi = a1 - 1.6, a1
        for _ in range(18):
            m_ = (lo + hi) / 2
            if legs(a1, m_) > 0:
                lo = m_
            else:
                hi = m_
        legs(a1, hi)
    P.rot("chest", [((1, 0, 0), lean)])


def cry_tissue(P, s="R", k=1.0, sob=0.0):
    """dab the eyes with the tissue (Flow photo hand round a crumpled tissue); the other hand on the thigh."""
    sx = 1 if s == "L" else -1
    f_ = face_pt(P, 0.12, -0.07 + 0.015 * sob, sx * 0.04)             # the wrist under the cheek: the fist + tissue at the eye
    sh = bone_w(P, f"upperarm.{s}")
    el = sh + pvec(P, (sx * 0.15, -0.1, -0.3)); arm_w(P, s, el, f_, f_ + pvec(P, (-sx * 0.03, 0.02, 0.15)))
    P.hand(s, "tissue")


def hands_on_face(P, sob=0.0):
    """both open palms over the face, fingers up."""
    for s, sx in (("L", 1), ("R", -1)):
        f_ = face_pt(P, 0.12, -0.08 + 0.012 * sob, sx * 0.04)
        el = bone_w(P, f"upperarm.{s}") + pvec(P, (sx * 0.15, -0.1, -0.3))
        arm_w(P, s, el, f_, f_ + pvec(P, (-sx * 0.01, 0.02, 0.15))); P.hand(s, "open")


def hands_lap(P, s_list="LR"):
    for s in s_list:
        sx = 1 if s == "L" else -1
        k_ = bone_w(P, f"shin.{s}")                                # knee
        h_ = k_ + pvec(P, (-sx * 0.02, 0.12, 0.09))
        el = bone_w(P, f"upperarm.{s}") + pvec(P, (sx * 0.08, 0.02, -0.26))
        arm_w(P, s, el, h_, h_ + pvec(P, (0, -0.12, -0.02))); P.hand(s, "relax")


def arms_open(P, k=1.0):
    for s, sx in (("L", 1), ("R", -1)):
        sh = bone_w(P, f"upperarm.{s}")
        el = sh + pvec(P, (sx * 0.24 * k + sx * 0.04, -0.12, -0.08 - 0.12 * (1 - k)))
        h_ = sh + pvec(P, (sx * (0.45 * k + 0.05), -0.25, 0.05 - 0.3 * (1 - k)))
        arm_w(P, s, el, h_); P.hand(s, "open")


def gesture(P, t):
    """talking: both open hands in front of the chest, bobbing out of phase."""
    for s, sx, ph in (("L", 1, 0.0), ("R", -1, 1.7)):
        sh = bone_w(P, f"upperarm.{s}"); b = math.sin(7.0 * t + ph)
        el = sh + pvec(P, (sx * 0.12, -0.1, -0.24)); h_ = sh + pvec(P, (sx * (0.1 + 0.04 * b), -0.36, -0.14 + 0.05 * b))
        arm_w(P, s, el, h_); P.hand(s, "open"); P.twist(s, -sx * 0.8)


def hum(P, t):
    P.rot("neck", [((0, 1, 0), 0.12 * math.sin(4.0 * t)), ((1, 0, 0), -0.12)])


def pop(o, t, t0, s=1.0):
    u = t - t0
    k = 0.0 if u <= 0 else (1.15 * K.ease(u / 0.12) if u < 0.12 else 1.15 - 0.15 * K.ease((u - 0.12) / 0.15))
    o.scale = (s * k, s * k, s * k)


def cam_pt(dx, dy, dist):
    bpy.context.view_layer.update()
    return CAM.matrix_world @ Vector((dx, dy, -dist))


def text_at(key, t, t0, dx, dy, dist=1.6, scale=1.0):
    """a Zaw pop-in 3D text (yellow, wobbling) fixed in the frame; the whole word pops at once (user, zaw-dog-04)."""
    L_ = TXT[key]; bpy.context.view_layer.update()
    L_.root.matrix_world = CAM.matrix_world @ __import__("mathutils").Matrix.Translation((dx, dy, -dist))
    L_.anim(t, t0, stagger=0.0, wobble=0.25, scale=scale)                 # (user: reads straight, little skew)


def showkids(o, on=True):
    hide(o, not on)
    for c in o.children:
        hide(c, not on)



# ---------------------------------------------------------------- zaw-dog #4 helpers
def dog(i, loc, yaw, expr="neutral", t=0.0, prev=None, a=1.0):
    d = DOGS[i]
    for k in ("o", "sh"):
        hide(d[k], False)
    d["mv"].location = loc; d["mv"].rotation_euler = (0, 0, yaw)
    D.rest(d["arm"])
    if "atlas" in d:
        d["fn"].image = d["atlas"][expr]
    else:
        D.set_face(d["fn"], expr)
    D.expr_pose(d["arm"], expr, t, prev=prev, a=a)
    return d


_NOSE_V = {}


def nose_at(i, target, gap=0.0):
    """move the posed dog so its REAL nose tip (the front-most vertex of the mesh's 'nose' part) sits `gap` m short of
    target (xy). (The front-most vertex of the whole mesh is the forehead / ears once the head is lowered.)"""
    o = DOGS[i]["o"]
    if o.name not in _NOSE_V:
        me = o.data; pa = [0] * len(me.polygons); me.attributes["part"].data.foreach_get("value", pa)
        _NOSE_V[o.name] = sorted({v for p in me.polygons if pa[p.index] == D.PARTS.index("nose") for v in p.vertices})
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); ev = o.evaluated_get(dg)
    if len(ev.data.vertices) != len(o.data.vertices):                                   # (subdivided rival: whole-mesh fallback)
        P_ = np.array([tuple(ev.matrix_world @ v.co) for v in ev.data.vertices])
    else:
        P_ = np.array([tuple(ev.matrix_world @ ev.data.vertices[k].co) for k in _NOSE_V[o.name]])
    yaw = DOGS[i]["mv"].rotation_euler.z; fw = np.array([math.sin(yaw), -math.cos(yaw), 0.0])
    nose = Vector(P_[np.argmax(P_ @ fw)])
    goal = Vector((target[0], target[1], 0)) - Vector((fw[0], fw[1], 0)) * gap
    DOGS[i]["mv"].location += Vector((goal.x - nose.x, goal.y - nose.y, 0))
    return Vector((goal.x, goal.y, nose.z))


def ground_dog(i=0):
    """lift the dog if a tilt pushed any vertex under the floor (feetscan)."""
    bpy.context.view_layer.update(); lo = float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min())
    if lo < -0.008:
        DOGS[i]["mv"].location.z -= lo + 0.004


def collar_on(i=0):
    """the red collar ring round our dog's neck (the leash clips to it); returns the clip point (world)."""
    bpy.context.view_layer.update(); am = DOGS[i]["arm"]; pb = am.pose.bones["neck"]
    h_, t_ = am.matrix_world @ pb.head, am.matrix_world @ pb.tail
    c = h_.lerp(t_, 0.55); ax = (t_ - h_).normalized()
    hide(COLLAR, False)
    COLLAR.matrix_world = __import__("mathutils").Matrix.Translation(c - ax * 0.015) @ ax.to_track_quat("Z", "Y").to_matrix().to_4x4()
    return c + Vector((0, 0, 0.035))                                                      # (zaw-dog-05: the ring top, never up on the head)


def leash(p0, p1, sag=0.0):
    """the leash from the collar clip p0 to the hand p1: straight when taut (sag 0), a hanging curve when slack."""
    p0, p1 = Vector(p0), Vector(p1); n = len(LEASH)
    pts = [p0.lerp(p1, k / n) - Vector((0, 0, sag * 4 * (k / n) * (1 - k / n))) for k in range(n + 1)]
    for k, o in enumerate(LEASH):
        a, b = pts[k], pts[k + 1]; hide(o, False)
        o.matrix_world = __import__("mathutils").Matrix.Translation((a + b) / 2) @ (b - a).to_track_quat("X", "Z").to_matrix().to_4x4() @ \
            __import__("mathutils").Matrix.Diagonal(((b - a).length + 0.004, 1, 1, 1))


def put(o, loc, yaw=0.0, kids=True):
    o.location = loc; o.rotation_euler = (0, 0, yaw); showkids(o, True)
    for c in o.children:
        showkids(c, True)


def hand_on(P, s, contact, fwd, k_el=(0.0, 0.0, 0.0), palm_down=True, pose="open"):
    """the photo hand lies on `contact` (palm down), fingers along `fwd` (world xy)."""
    sx = 1 if s == "L" else -1; f = Vector(fwd).normalized()
    wr = Vector(contact) - f * 0.09 + Vector((0, 0, 0.035))
    el = bone_w(P, f"upperarm.{s}") + pvec(P, (sx * 0.22, -0.05, -0.25)) + Vector(k_el)
    arm_w(P, s, el, wr, wr + f * 0.2 - Vector((0, 0, 0.02))); P.hand(s, pose)
    if palm_down:
        P.twist(s, -sx * 1.55)


def crouch(P, hip, yaw, lean=0.45):
    """a KNEEL (user: no sitting in the air): the left knee on the ground with the shin flat behind, the right foot
    planted in front (thigh forward, shin solved so the sole lands on the floor); hips set so the knee touches."""
    zc = P.J["z_crotch"]; P.show(True, (hip[0], hip[1], 0.5 - zc), yaw)
    P.rot("thigh.L", [((1, 0, 0), -0.25)])
    lo_, hi_ = 0.6, 2.6                                                              # bend the shin until it lies level behind the knee
    for _ in range(18):
        m_ = (lo_ + hi_) / 2; P.rot("shin.L", [((1, 0, 0), m_)]); P.rot("foot.L", [((1, 0, 0), 1.3)])   # toe pointing back, flat
        bpy.context.view_layer.update()
        if bone_w(P, "foot.L").z < bone_w(P, "shin.L").z - 0.02:                  # ankle still below the knee: bend more
            lo_ = m_
        else:
            hi_ = m_
    P.rot("thigh.R", [((1, 0, 0), -1.35)]); P.rot("shin.R", [((1, 0, 0), 1.35)])     # (the front leg folded first: only the knee is lowest)
    bpy.context.view_layer.update(); dg_ = bpy.context.evaluated_depsgraph_get(); ev_ = P.body.evaluated_get(dg_)
    gi_ = {P.body.vertex_groups[g].index for g in ("shin.L", "foot.L") if g in P.body.vertex_groups}
    ids_ = [v.index for v in P.body.data.vertices if any(gg.group in gi_ and gg.weight > 0.5 for gg in v.groups)]
    P.arm.location.z -= min((ev_.matrix_world @ ev_.data.vertices[i].co).z for i in ids_) + 0.002     # knee + shin ON the ground
    def rleg(a2):
        P.rot("thigh.R", [((1, 0, 0), -1.35)]); P.rot("shin.R", [((1, 0, 0), a2)]); P.rot("foot.R", [((1, 0, 0), -(a2 - 1.35))])
        bpy.context.view_layer.update(); return bone_w(P, "foot.R").z - 0.08
    lo, hi = 0.0, 2.2
    for _ in range(18):
        m_ = (lo + hi) / 2
        if rleg(m_) > 0:
            lo = m_
        else:
            hi = m_
    rleg(hi); P.rot("chest", [((1, 0, 0), lean)])


def reset():
    for d in DOGS:
        hide(d["o"], True); hide(d["sh"], True)
    for P_ in PEOPLE:
        P_.show(False); P_.rest(); P_.arm.location = (0, -40, 0)
    for L_ in TXT.values():
        L_.hide()
    for o in (PAIL, BOOK, DIV, FLEECE, PLUSH):
        o.location = (0, -40, 0); o.rotation_euler = (0, 0, 0)
    for o in PLUSH_PARTS + LEASH + [COLLAR] + CSH:
        hide(o, True)
    for o in (PLUSH_P["head"], PLUSH_P["tail"]):
        o.rotation_euler = (0, 0, 0)
    set_night(False); street_warm(False); DOOR_PIV.rotation_euler = (0, 0, 0); hide(bpy.data.objects["coat_rack"], False)
    for o in LR_CT:
        hide(o, False)


# ---------------------------------------------------------------- zaw-dog #5 beats (t = s into the beat, d = beat length)
def wt(line, idx):
    return [x for x in TIM["words"] if x["line"] == line][idx]["s"]


BARK = round(1.62 * FPS) / FPS                     # the hero bark: in the gap after "everything," (1.51 -> 2.26 s); mix HERO_T 1.62 s
WALK_Y = 6.0                                       # the owner walks the sidewalk centre line (+X)
EAST = math.pi / 2                                 # a person / dog facing +X
POLE_R = 0.13                                      # the lamppost base radius at nose height
NOSE = [Vector()]
_reset4 = reset


def reset5():
    _reset4()
    for o in NEW5:
        o.location = (0, -40, 0); o.scale = (1, 1, 1); showkids(o, False)


def plant_feet(P):
    bpy.context.view_layer.update(); _dg = bpy.context.evaluated_depsgraph_get(); _ev = P.body.evaluated_get(_dg)
    P.arm.location.z -= min((_ev.matrix_world @ v.co).z for v in _ev.data.vertices)


def hold_leash(P, s, toward, reach=0.32, z=0.86, out=0.12):
    """the photo fist ('handle') holds the leash, the hand reaching `reach` m toward the dog; returns the grip point."""
    sx = 1 if s == "L" else -1
    sh = bone_w(P, f"upperarm.{s}"); tv = Vector(toward) - sh; tv.z = 0; tv.normalize()
    hnd = Vector((sh.x + tv.x * reach, sh.y + tv.y * reach, z))
    el = sh + pvec(P, (sx * out, 0.04, -0.24))
    arm_w(P, s, el, hnd, hnd + tv * 0.14 - Vector((0, 0, 0.03))); P.hand(s, "handle")
    return P.grip_point(s, 0.0)


def arm_hang(P, s, fwd=0.0):
    sx = 1 if s == "L" else -1; sh = bone_w(P, f"upperarm.{s}")
    h_ = sh + pvec(P, (sx * 0.06, -fwd, -0.55)); arm_w(P, s, sh + pvec(P, (sx * 0.08, 0.04, -0.28)), h_, h_ + pvec(P, (0, -0.03, -0.15))); P.hand(s, "relax")


def sniff_motion(t, period=1.9, work=0.65):
    """a natural sniff: the nose travels slowly up and down (one smooth swing per `period`, then a pause), with a slow
    small head turn. Returns (neck_add, head_turn). No high-frequency jitter (user: the old 7 Hz sniff read as trembling)."""
    p = (t % period) / period
    w = math.sin(2 * math.pi * p / work) if p < work else 0.0
    return 0.07 * w * (0.5 - 0.5 * math.cos(2 * math.pi * min(1.0, p / work))), 0.07 * math.sin(2 * math.pi * t / 3.3)


def dog_at_pole(t, expr="neutral", side=0.0, k=1.0, sn=True):
    """our dog west of the lamppost, facing +X, nose glued to the post's base; NOSE[0] = its nose tip."""
    dd = dog(0, (LAMP[0] - 0.6, LAMP[1] + side, 0), EAST + side * 0.8, expr, t)
    na, ht = sniff_motion(t) if sn else (0.0, 0.0)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), (0.55 + na) * k)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.15 * k), ((0, 0, 1), ht * k)])
    D.move(dd["arm"], "hips", (0, 0.03, -0.02)); D.rot(dd["arm"], "root", (1, 0, 0), -0.04)     # rump back: feet planted
    NOSE[0] = nose_at(0, LAMP, POLE_R + 0.008); ground_dog(0)
    return dd


def sit_grounded(i=0):
    """dog_sit, then raise the hips (bisection) until the rump rests ON the floor/rug (lowest vertex ~ -4 mm); the IK
    keeps all four paws planted, so the front legs stay on the floor (user: no rump sinking into the rug)."""
    dog_sit(i); arm = DOGS[i]["arm"]; lo_, hi_ = -0.27, -0.10
    if "hips" in _SIT:                                                                   # solved once per shot (one process per shot):
        D.move(arm, "hips", (0, 0.0, _SIT["hips"])); return                              # a per-frame solve made the body jitter
    for _ in range(12):
        m_ = (lo_ + hi_) / 2; D.move(arm, "hips", (0, 0.0, m_)); bpy.context.view_layer.update()
        if float(dog_low(bpy.context.evaluated_depsgraph_get())[:, 2].min()) < -0.004:
            lo_ = m_
        else:
            hi_ = m_
    D.move(arm, "hips", (0, 0.0, hi_)); _SIT["hips"] = hi_


_SIT = {}


def owner_at(x, y, yaw, t=0.0, walk=0.0):
    OWNER.show(True, (x, y, 0), yaw)
    if walk:
        OWNER.walk(t, 0.85 * walk, 0.95)
    plant_feet(OWNER)


# ---- STREET (kit, zaw-dog-03) -------------------------------------------------------------------------------
def b01a(t, d):   # HOOK, level at dog height, full: he tugs the leash, the dog plants its feet at the lamppost; the bark; slow push
    dd = dog_at_pole(t)
    bk = clamp01((t - (BARK - 0.12)) / 0.12) * (1 - clamp01((t - (BARK + 0.35)) / 0.2))      # the head comes up and round to him
    if bk > 0:
        D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.55 * bk), ((0, 0, 1), -0.5 * bk)]); D.rot2(dd["arm"], "head", [((0, 0, 1), -0.3 * bk)])
        D.rot(dd["arm"], "jaw", (1, 0, 0), 0.45 * math.sin(math.pi * clamp01((t - BARK) / 0.22)))
    owner_at(LAMP[0] + 0.95, 5.65, EAST)
    tug = 0.5 + 0.5 * math.sin(2 * math.pi * 1.4 * t)
    OWNER.rot("chest", [((0, 0, 1), 0.55), ((1, 0, 0), 0.12 + 0.05 * tug)]); OWNER.rot("head", [((0, 0, 1), 0.5)])
    clip = collar_on(0)
    gp = hold_leash(OWNER, "R", clip, 0.34 + 0.04 * tug, 0.84); arm_hang(OWNER, "L", 0.05)
    leash(clip, gp, 0.0)
    move(t, d, (LAMP[0] + 0.25, 8.35, 0.5), (LAMP[0] + 0.3, 7.95, 0.5), (LAMP[0] + 0.3, 5.0, 0.5), (LAMP[0] + 0.3, 5.0, 0.5), 17)   # LEVEL, full, push-in


def b01b(t, d):   # LEVEL close, short orbit: "it's reading the news" - nose on the post, eyes reading
    dd = dog_at_pole(t, "judging")
    clip = collar_on(0); leash(clip, clip + Vector((1.2, 0.6, 0.35)), 0.03)
    hd = Vector((LAMP[0] - 0.3, LAMP[1] + 0.02, 0.4))                                   # a FIXED aim (the head moves: no camera jitter)
    orbit(t, d, (hd.x + 0.45, hd.y - 0.85, 0.42), (hd.x + 0.05, hd.y + 0.05, 0.38), -12, 26)   # LEVEL close, orbit (the street behind: calmer than the bricks)


def b02a(t, d):   # gentle HIGH, track along the sidewalk: the post; the headline card "BUSTER WAS HERE" pops beside it
    dog_at_pole(t)
    clip = collar_on(0); leash(clip, clip + Vector((1.4, 0.7, 0.45)), 0.05)
    c = NEWS["news_buster"]; c.rotation_euler = (math.pi / 2, 0, math.pi - 0.25); hide(c, False)   # taped to the FRONT of the post
    nrm = Vector((math.sin(math.pi - 0.25), -math.cos(math.pi - 0.25), 0)); c.location = Vector((LAMP[0], LAMP[1], 1.05)) + nrm * 0.075   # (user: never through the iron)
    pop(c, t, 0.15, 1.0)
    move(t, d, (1.8, 7.05, 1.4), (1.35, 7.1, 1.38), (0.8, 5.1, 0.45), (0.65, 5.1, 0.45), 24)   # gentle HIGH, track


def b02b(t, d):   # LEVEL, medium, push-in: on the lawn the dog sniffs a patch of grass, facing us; "NEW DOG IN TOWN" pops over it
    gp = (2.6, 4.45)
    dd = dog(0, (0, 0, 0), math.pi - 0.35, "neutral", t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.3)]); D.move(dd["arm"], "chest", (0, 0, -0.12))
    na, ht = sniff_motion(t); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.3 + na), ((0, 0, 1), ht)])
    nose_at(0, gp, 0.0); ground_dog(0)
    D.happy_wag(dd["arm"], t, 0.6, 3.0, up=0.0)
    clip = collar_on(0); leash(clip, (gp[0] + 1.3, 6.0, 0.85), 0.15)
    c = NEWS["news_newdog"]; c.location = (gp[0] + 0.45, gp[1] - 0.15, 0.21); c.rotation_euler = (math.pi / 2 - 0.12, 0, math.pi + 0.2); hide(c, False)   # stuck in the grass, leaning
    pop(c, t, 0.1, 1.0)
    move(t, d, (gp[0] + 0.55, 6.25, 0.5), (gp[0] + 0.45, 5.95, 0.5), (gp[0] + 0.15, 4.4, 0.5), (gp[0] + 0.15, 4.4, 0.5), 24)


def b03(t, d):    # LEVEL close side shot: the wet nose twitching at the post; big "300,000,000"; small orbit
    dd = dog_at_pole(t, "neutral")                                                       # natural sniff (sniff_motion)
    n0 = Vector((LAMP[0] - POLE_R - 0.008, LAMP[1], 0.33))                               # a FIXED aim: the camera never follows the nose
    clip = collar_on(0); leash(clip, clip + Vector((1.3, -0.5, -0.05)), 0.05)           # (runs out low and away: clear of 300,000,000)
    n = n0
    orbit(t, d, (n.x - 0.12, n.y + 0.85 - 0.15 * smooth(t / d), n.z + 0.03), (n.x - 0.1, n.y, n.z), -18, 26)   # LEVEL close side, orbit + push
    text_at("r300", t, 0.25, 0.0, 0.22, 0.45, 0.25)                                      # near the lens: never behind the head or the post                                      # (review: off the top edge)


def b04(t, d):    # HUMAN height, medium, pull-out: he bends to the post and sniffs it too, confused; "6,000,000"
    op = (LAMP[0] + 0.4, LAMP[1] + 0.06)                                                   # east of the post, facing it (-X)
    owner_at(op[0], op[1], yaw_to(op, LAMP))
    sniff = math.sin(2 * math.pi * 3.2 * t) * clamp01((t - 0.25) / 0.2)                     # quick sniffing nods
    OWNER.rot("hips", [((1, 0, 0), 0.12)]); OWNER.rot("chest", [((1, 0, 0), 0.62)])
    OWNER.rot("head", [((1, 0, 0), -0.32 + 0.05 * sniff), ((0, 0, 1), 0.05 * sniff)])     # nose right at the iron
    fp = face_pt(OWNER, 0.12, -0.02); off = Vector((fp.x - LAMP[0], fp.y - LAMP[1], 0))   # (user: his nose AT the post, touching distance)
    OWNER.arm.location -= off - off.normalized() * 0.07
    hand_on(OWNER, "L", (LAMP[0] + 0.05, LAMP[1] + 0.07, 1.02), (-0.7, 0.3, 0), pose="open")   # steadying hand on the post
    dp = (LAMP[0] + 1.15, LAMP[1] - 0.2)                                                     # the dog on the lawn, watching him (no sidewalk strip)
    dd = dog(0, (dp[0], dp[1], 0), yaw_to(dp, (op[0], op[1])) - 0.7, "judging", t)    # 3/4 to the lens: the tilt reads
    sit_grounded(0)
    tilt = K.ease(clamp01((t - 0.4) / 0.35)); D.rot2(dd["arm"], "head", [((0, 1, 0), 0.4 * tilt)])   # the confused head tilt
    clip = collar_on(0)
    gp = hold_leash(OWNER, "R", clip, 0.24, 0.85); leash(clip, gp, 0.12)
    move(t, d, (LAMP[0] + 0.55, LAMP[1] + 2.45, 1.5), (LAMP[0] + 0.5, LAMP[1] + 2.85, 1.52), (LAMP[0] + 0.75, LAMP[1] + 0.4, 0.9), (LAMP[0] + 0.75, LAMP[1] + 0.4, 0.88), 22)
    text_at("r6", t, 0.2, 0.0, 0.5, 1.0, 0.7)


# ---- LIVING ROOM as the "lab" (kit): the dog starts by the TV, the bowls stand on a line nearer the sofa -----------
FOOD = (1.3, -0.25); EMPTY = (-0.95, -0.25); MYST = (0.15, -0.25); START = (0.15, -1.4)   # (start clear of the TV unit, y < -2.12)


def lab(bowls="FEM"):
    for o in LR_CT + TOWEL_PARTS + [bpy.data.objects["toy_bone"]]:                       # (towel slab, the toy-bone card)
        hide(o, True)
    if "F" in bowls:
        put(BOWL_F, (FOOD[0], FOOD[1], 0))
    if "E" in bowls:
        put(BOWL_E, (EMPTY[0], EMPTY[1], 0))
    if "M" in bowls:
        put(BOWL_M, (MYST[0], MYST[1], 0))


def b05(t, d):    # HUMAN height, wide, push-in: the lab; 20 dog cards pop in a grid, row by row; "BARNARD COLLEGE, 2019"
    lab("")
    dd = dog(0, (START[0], START[1] + 0.9, 0), math.pi, "happy", t); D.happy_wag(dd["arm"], t, 0.7, 3.5, up=0.0); sit_grounded(0)   # (wag first: it resets the hips)
    move(t, d, (0.15, 1.35, 1.5), (0.15, 1.0, 1.48), (0.15, -2.2, 0.62), (0.15, -2.2, 0.62), 22)
    bpy.context.view_layer.update()
    for k, pc in enumerate(PORTS):
        r_, c_ = divmod(k, 5)
        hide(pc, False)
        pc.matrix_world = CAM.matrix_world @ __import__("mathutils").Matrix.Translation(((c_ - 2) * 0.2, 0.5 - r_ * 0.2, -1.6))
        pop(pc, t, 0.45 + 0.12 * r_, 1.0)                                              # (review 4: no gaps between the cards)
    text_at("barn", t, 0.15, 0.0, 0.84, 1.6, 0.88)


def b06(t, d):    # gentle HIGH, track left: the food bowl; the dog trots to it and eats, facing us; a big check
    lab("F")
    u = clamp01(t / (0.5 * d)); a0 = (FOOD[0] - 0.6, FOOD[1] - 0.8)                      # (clear of the dog bed)
    p = lerpv(a0, (FOOD[0], FOOD[1] - 0.55), K.ease(u))
    dd = dog(0, (p[0], p[1], 0), yaw_to(a0, FOOD) * (1 - K.ease(u)) + math.pi * K.ease(u), "happy", t)
    if u < 1:
        dog_walk(0, t, 2.0)
    else:
        D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25)]); D.move(dd["arm"], "chest", (0, 0, -0.12))
        D.rot(dd["arm"], "jaw", (1, 0, 0), 0.12 + 0.1 * math.sin(2 * math.pi * 4 * t)); nose_at(0, FOOD, -0.02)
    D.happy_wag(dd["arm"], t, 0.8, 4.0, up=0.0); ground_dog(0)
    move(t, d, (0.45, 0.95, 1.35), (0.95, 0.95, 1.33), (0.95, -0.6, 0.2), (1.3, -0.6, 0.2), 22)   # gentle HIGH, track left
    text_at("ok", t, 0.75, 0.2, 0.62, 1.6, 2.4)


def b07(t, d):    # LEVEL, push-in, medium: the empty bowl; the dog sniffs it, then looks up into the lens, sad; a big cross
    lab("E")
    look = K.ease(clamp01((t - 0.7) / 0.3))
    dd = dog(0, (0, 0, 0), math.pi, "sad" if look > 0.5 else "neutral", t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.95 * (1 - look) + 0.05 * look)])
    na, ht = sniff_motion(t, 1.6); D.rot2(dd["arm"], "head", [((0, 0, 1), ht * (1 - look))])
    nose_at(0, EMPTY, 0.07 * (1 - look) + 0.16 * look); ground_dog(0)                    # (user: no trembling)
    move(t, d, (EMPTY[0] + 0.32, EMPTY[1] + 1.35, 0.5), (EMPTY[0] + 0.3, EMPTY[1] + 1.05, 0.5), (EMPTY[0] + 0.05, EMPTY[1] - 0.5, 0.45), (EMPTY[0] + 0.05, EMPTY[1] - 0.5, 0.45), 24)   # (clear of the armchair's edge)
    text_at("x", t, 0.85, 0.2, 0.5, 1.6, 2.4)


def b08(t, d):    # TOP-DOWN insert on the middle bowl, crane up and back to the dog behind it, head tilting; a big "?"
    lab("FEM")
    dd = dog(0, (MYST[0], MYST[1] - 1.12, 0), math.pi, "neutral", t); sit_grounded(0)      # (clear of the TV unit)
    tilt = K.ease(clamp01((t - 0.6) / 0.35)); D.rot2(dd["arm"], "head", [((0, 1, 0), 0.38 * tilt)])
    u = smooth(t / d)
    pos = lerpv((MYST[0], MYST[1] + 0.05, 0.95), (MYST[0], MYST[1] + 0.22, 1.12), u)       # a gentle crane: the crisp rug must not shimmer
    aim = lerpv((MYST[0], MYST[1] - 0.02, 0.0), (MYST[0], MYST[1] - 0.32, 0.08), u)
    cam(pos, aim, 28)                                                                     # TOP-DOWN -> crane up / back
    text_at("qm", t, 0.15, 0.13, 0.12, 1.0, 2.0)


# ---- DOG PARK (kit, zaw-dog-04) -------------------------------------------------------------------------------
TW = (PX + 0.6, PY + 2.2)


def park_props():
    put(TOWEL, (TW[0], TW[1], 0), 0.3)
    for k, (dx, dy) in enumerate(((-1.4, 0.4), (-0.6, -0.25), (1.1, 0.6))):
        o = TREATS[k]; o.location = (TW[0] + dx, TW[1] + dy, 0.035); o.rotation_euler = (math.pi / 2, 0, 0.0); hide(o, False)
    rng = random.Random(5)
    for k, o in enumerate(TREAT_BITS):
        o.location = (TW[0] - 1.6 + 0.4 * k + rng.uniform(-0.1, 0.1), TW[1] + rng.uniform(-0.5, 0.4), 0.005); o.rotation_euler = (0, 0, rng.uniform(0, 3)); hide(o, False)


def b09(t, d):    # LEVEL, track with the dog: treats hidden in the grass and under the towel; it hunts, nose down; "2 WEEKS"
    park_props()
    u = t / d; p = (TW[0] - 1.35 + 0.8 * u, TW[1] + 0.02 + 0.06 * math.sin(1.4 * t))
    dd = dog(0, (p[0], p[1], 0), EAST + 0.08 * math.sin(1.4 * t), "happy", t); dog_walk(0, t, 0.6)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.0)]); D.move(dd["arm"], "chest", (0, 0, -0.07)); ground_dog(0)
    D.happy_wag(dd["arm"], t, 1.0, 4.5, up=0.0)
    cam(lerpv((TW[0] - 1.25, TW[1] - 1.75, 0.48), (TW[0] - 0.45, TW[1] - 1.7, 0.48), smooth(u)), (TW[0] - 1.2 + 0.8 * smooth(u), TW[1] + 0.32, 0.46), 22)   # LEVEL, tracking
    text_at("wk2", t, 0.25, 0.0, 0.62, 1.6, 1.45)


def b10(t, d):    # gentle HIGH, dolly alongside: the heel walk - nose forward, stiff, at his left; he points at it: "NO!"
    u = t / d; x = PX - 2.2 + 1.05 * u
    owner_at(x, PY + 1.15, EAST, t, 0.8)
    dpos = (x + 0.12, PY + 1.78)                                                         # (review 3: leash visible fist -> collar)
    dd = dog(0, (dpos[0], dpos[1], 0), EAST, "judging", t); dog_walk(0, t, 1.0)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.15)]); ground_dog(0)                       # head up, nose forward: no sniffing
    clip = collar_on(0)
    gp = hold_leash(OWNER, "L", clip, 0.16, 0.86, 0.12); leash(clip, gp, 0.04)           # the Flow fist ON the leash (review)
    arm_hang(OWNER, "R", 0.04)
    OWNER.rot("head", [((1, 0, 0), 0.35), ((0, 0, 1), 0.4)])
    move(t, d, (x - 0.35, PY + 4.2, 1.4), (x + 0.15, PY + 4.15, 1.38), (x - 0.05, PY + 1.3, 0.62), (x + 0.2, PY + 1.3, 0.62), 20)   # gentle HIGH, dolly
    text_at("no", t, 0.35, 0.28, 0.6, 1.6, 1.35)                                        # (review: bigger)


# ---- back in the lab ----------------------------------------------------------------------------------------
def b11(t, d):    # LEVEL, wide, pan with the dog: the sniffer sprints to the "?" bowl
    lab("FEM")
    for n_ in ("dogbed", "dogbed_c"):
        hide(bpy.data.objects[n_], True)                                                  # (review: the blurry bed filled the foreground)
    u = clamp01(t / (0.8 * d)); p = lerpv(START, (MYST[0], MYST[1] - 0.55), K.ease(u))
    dd = dog(0, (p[0], p[1], 0), math.pi, "happy", t)
    if u < 1:
        dog_walk(0, t, 4.2); D.move(dd["arm"], "root", (0, 0, 0.025 * abs(math.sin(2 * math.pi * 3.5 * t))))   # a bounding run
    else:
        D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.9)]); nose_at(0, MYST, 0.05)
    D.happy_wag(dd["arm"], t, 1.0, 5.0, up=0.0); ground_dog(0)
    cpos = lerpv((2.2, -1.55, 0.45), (2.15, -0.95, 0.45), smooth(t / d))                 # LEVEL, wide: pan (+ slight track) with it
    cam(cpos, (p[0], p[1] + 0.2, 0.42), 20)
    bpy.context.view_layer.update(); L_ = TXT["qm"]; L_.root.location = (MYST[0], MYST[1] + 0.05, 0.28)    # the "?" marks the middle bowl
    L_.root.rotation_euler = (math.pi / 2, 0, math.atan2(CAM.location.x - MYST[0], -(CAM.location.y - MYST[1]))); L_.anim(t, 0.0, stagger=0.0, wobble=0.25, scale=1.7)


def b12(t, d):    # LEVEL, medium, slow push-in: it sits by the bowl beaming; sparkles; "MORE OPTIMISTIC"
    lab("M")
    dd = dog(0, (MYST[0] - 0.42, MYST[1] - 0.12, 0), math.pi - 0.15, "happy", t); D.happy_wag(dd["arm"], t, 1.0, 4.0, up=0.0); sit_grounded(0)   # BESIDE the bowl (wag first: it resets the hips)
    move(t, d, (-0.05, 1.0, 0.55), (-0.05, 0.62, 0.52), (-0.12, -0.8, 0.4), (-0.12, -0.8, 0.38), 22)   # (a push-in that reads; clear of the sofa)
    bpy.context.view_layer.update(); hd = dog_head(0)
    for k, s_ in enumerate(SPARKS):
        a = 2 * math.pi * k / len(SPARKS) + 0.6 * t; r = 0.23 + 0.02 * math.sin(1.5 * t + k)            # (slow drift: no frame-to-frame pops)
        s_.location = (hd.x + r * math.cos(a), hd.y + 0.05, hd.z + 0.05 + r * math.sin(a)); hide(s_, False)
        s_.rotation_euler = (math.pi / 2, 0, math.pi); s_.scale = [0.8 + 0.2 * math.sin(2.2 * t + 1.3 * k)] * 3
    text_at("opt", t, 0.3, 0.0, 1.0, 1.6, 1.18)                                         # (bigger: OPTIMISTIC reads after the edge steps)


def b13(t, d):    # gentle HIGH, slow pull-out: the heel walker plods to the "?" bowl toward us, unimpressed
    lab("FEM")
    u = t / d; p = lerpv((START[0] + 0.45, START[1] + 0.15), (MYST[0] + 0.12, MYST[1] - 0.62), u)   # ON the floor, toward the bowl
    dd = dog(0, (p[0], p[1], 0), yaw_to(p, MYST), "judging", t); dog_walk(0, t, 0.6)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.2)]); ground_dog(0)
    move(t, d, (1.75, -0.15, 1.3), (1.95, 0.15, 1.38), (0.2, -1.2, 0.18), (0.2, -1.15, 0.18), 22)   # gentle HIGH from the side, pull-out (floor all round its feet)


# ---- STREET again: the loop -----------------------------------------------------------------------------------
def b14a(t, d):   # HUMAN height, medium, push-in: the leash goes taut, he stops ... and lets it go slack
    sl = 0.0                                                                             # (review 3: tight all through "…goes tight,")
    owner_at(2.45, WALK_Y, EAST, t, 0.7)
    OWNER.rot("chest", [((1, 0, 0), 0.12)])                                              # leaning into the pull
    OWNER.rot("head", [((0, 0, 1), 0.55 * sl), ((1, 0, 0), 0.2)]); OWNER.rot("chest", [((0, 0, 1), 0.25 * sl)])
    dog_at_pole(t, "neutral")
    clip = collar_on(0)
    gp = hold_leash(OWNER, "R", clip, 0.22 + 0.25 * sl, 0.85 - 0.08 * sl); arm_hang(OWNER, "L", 0.02)
    leash(clip, gp, 0.22 * sl)
    move(t, d, (0.55, 8.75, 1.5), (0.7, 8.45, 1.48), (1.45, 5.55, 0.95), (1.45, 5.55, 0.9), 20)   # HUMAN height, medium-full, push-in, from behind-left (review)


def b14b(t, d):   # LEVEL, medium, lateral track: the dog dives into the grass verge, facing us, tail going; leash slack -> line 1
    gp = (LAMP[0] + 1.25, 4.45)
    dd = dog(0, (0, 0, 0), math.pi + 0.3, "happy", t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 1.35)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.35)]); D.move(dd["arm"], "chest", (0, 0, -0.14))
    na, ht = sniff_motion(t, 1.4); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.35 + na), ((0, 0, 1), ht)])
    nose_at(0, gp, -0.02); ground_dog(0); D.happy_wag(dd["arm"], t, 0.7, 4.0, up=0.0)
    clip = collar_on(0); leash(clip, (gp[0] + 1.7, 6.0, 0.8), 0.3)
    move(t, d, (gp[0] + 0.4, 6.15, 0.45), (gp[0] + 0.12, 6.15, 0.45), (gp[0] + 0.1, 4.4, 0.4), (gp[0] - 0.08, 4.4, 0.4), 24)   # LEVEL, medium, lateral track


L = word_cut
BEATS = [  # name, f0, f1, fn, board fraction
    ("01a", 0, L(0, 5), b01a, 0.78), ("01b", L(0, 5), CUT[1], b01b, 0.5),
    ("02a", CUT[1], L(1, 6), b02a, 0.6), ("02b", L(1, 6), CUT[2], b02b, 0.6),
    ("03", CUT[2], CUT[3], b03, 0.6),
    ("04", CUT[3], CUT[4], b04, 0.65),
    ("05", CUT[4], CUT[5], b05, 0.8),
    ("06", CUT[5], CUT[6], b06, 0.8),
    ("07", CUT[6], CUT[7], b07, 0.8),
    ("08", CUT[7], CUT[8], b08, 0.3),
    ("09", CUT[8], CUT[9], b09, 0.55),
    ("10", CUT[9], CUT[10], b10, 0.6),
    ("11", CUT[10], CUT[11], b11, 0.55),
    ("12", CUT[11], CUT[12], b12, 0.6),
    ("13", CUT[12], CUT[13], b13, 0.55),
    ("14a", CUT[13], L(13, 7), b14a, 0.75), ("14b", L(13, 7), END, b14b, 0.5),
]
BY = {b[0]: b for b in BEATS}
reset = reset5



def render(path, res=(540, 960)):
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)


def do_frame(beat, f, path, res=None):
    name, f0, f1, fn, _ = beat
    t, d = (f - f0) / FPS, (f1 - f0) / FPS
    sc.frame_set(f)
    fns = fn if isinstance(fn, list) else [fn]
    for i, g in enumerate(fns):
        reset(); g(t, d); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)
        r = res or (540, 960)
        render(path if len(fns) == 1 else path.replace(".png", f"_p{i}.png"), r if len(fns) == 1 else (r[0], r[1] // len(fns)))


def dog_low(dg):
    dd = DOGS[0]; ev = dd["o"].evaluated_get(dg); mw = ev.matrix_world
    return np.array([tuple(mw @ v.co) for v in ev.data.vertices])


def people_low(dg):
    out = {}
    for P_ in PEOPLE:
        if P_.body.hide_render:
            continue
        ev = P_.body.evaluated_get(dg); mw = ev.matrix_world
        out[P_.name] = min((mw @ v.co).z for v in ev.data.vertices)
    return out


# ================================================================ set scale (2026-11-13, fuentes/zawpolyshorts-style/planos/ENCUADRE.md)
# Zaw's furniture is ~2x taller than his cat; with real-size furniture our big dog (0.87 m sitting) dwarfs the sofa.
# scale_set(s) makes every static set object (rooms, furniture, street, park) s times bigger about the world origin
# through one parent empty; the dog, the people, the 3D texts, the bowls/props, contact shadows, leash, collar and the
# camera keep their size. NEVER called here: #5/#6 (and anything that does not call it) render exactly as before.
# Call it from a shot script AFTER its own set dressing and BEFORE loading kit humans (objects added later are not
# scaled). Set coordinates (as written in this file) -> world: sw((x, y[, z])). Set objects keep set-unit .location.
SET_S = [1.0]


def scale_set(s, keep=()):
    if abs(s - 1.0) < 1e-6:
        return None
    mov = set(keep) | {CAM.name}
    for d_ in DOGS:
        mov |= {d_[k].name for k in ("o", "sh", "mv", "arm") if d_.get(k) is not None}
    for P_ in PEOPLE:
        mov |= {o.name for o in P_.parts} | {P_.arm.name}
    for L_ in TXT.values():
        mov |= {o.name for o, *_ in L_.letters} | ({L_.root.name} if getattr(L_, "root", None) else set())
    for o in PLUSH_PARTS + LEASH + [COLLAR, PLUSH, PAIL, BOOK, DIV, FLEECE] + CSH + NEW5:
        mov.add(o.name)
    root = K.link(bpy.data.objects.new("set_scale_root", None))
    bpy.context.view_layer.update()
    for o in list(bpy.data.objects):
        if o is root or o.parent is not None or o.name in mov or o.type in ("CAMERA",) or (o.type == "LIGHT" and o.data.type == "SUN"):
            continue
        mw = o.matrix_world.copy(); o.parent = root; o.matrix_parent_inverse.identity(); o.matrix_world = mw
    root.scale = (s, s, s); SET_S[0] = s
    bpy.context.view_layer.update()
    return root


def sw(p):
    return tuple(v * SET_S[0] for v in p)


if MODE == "board":
    out = os.path.join(H, "review", "raw"); os.makedirs(out, exist_ok=True)
    names = ARGS[1:] or [b[0] for b in BEATS]
    for n in names:
        for f_ in os.listdir(out):
            if f_.startswith(n + ".") or f_.startswith(n + "_p"):
                os.remove(os.path.join(out, f_))
        b = BY[n]; do_frame(b, round(b[1] + b[4] * (b[2] - b[1])), os.path.join(out, f"{n}.png"))
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS}, open(os.path.join(H, "review", "beats.json"), "w"), indent=1)
elif MODE == "frames":
    b = BY[ARGS[1]]; step = int(ARGS[2]) if len(ARGS) > 2 else 1
    out = os.path.join(H, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        do_frame(b, f, os.path.join(out, f"{f:05d}.png"), (270, 480))
elif MODE == "ends":
    # motion check: the first and last frame of one beat -> review/ends/<beat>_a.png / _b.png (tools/motion_sheet.py)
    out = os.path.join(H, "review", "ends"); os.makedirs(out, exist_ok=True)
    for n in ARGS[1:]:
        b = BY[n]; do_frame(b, b[1], os.path.join(out, f"{n}_a.png"), (360, 640)); do_frame(b, b[2] - 1, os.path.join(out, f"{n}_b.png"), (360, 640))
elif MODE == "compare":
    # opener + key frames at the Zaw reference size for ref compare sheets
    out = os.path.join(H, "review", "compare"); os.makedirs(out, exist_ok=True)
    for n in ARGS[1:] or ["01a", "02", "06", "10a", "12"]:
        b = BY[n]; do_frame(b, round(b[1] + b[4] * (b[2] - b[1])), os.path.join(out, f"{n}.png"))
elif MODE == "feetscan":
    # every 2nd frame of every beat (every panel): the dog's lowest vertex vs the floor, paw tips, people's lowest vertex
    rows = []
    for b in BEATS:
        fns = b[3] if isinstance(b[3], list) else [b[3]]
        for pi_, g in enumerate(fns):
            worst, pl = [], []
            for f in range(b[1], b[2], 2):
                sc.frame_set(f); reset(); g((f - b[1]) / FPS, (b[2] - b[1]) / FPS); bpy.context.view_layer.update()
                dg = bpy.context.evaluated_depsgraph_get()
                pl.append(people_low(dg))
                if DOGS[0]["o"].hide_render:
                    continue
                P_ = dog_low(dg)
                am = DOGS[0]["arm"]; paws = [(am.matrix_world @ am.pose.bones[bn].tail).z for bn in ("paw_f.L", "paw_f.R", "paw_h.L", "paw_h.R")]
                worst.append((f, float(P_[:, 2].min()), min(paws), max(paws)))
            tag = b[0] + (f"_p{pi_}" if len(fns) > 1 else "")
            line = f"{tag}:"
            if worst:
                line += f" dog lowest vertex {min(w[1] for w in worst):+.3f}..{max(w[1] for w in worst):+.3f} m, highest paw tip {max(w[3] for w in worst):+.3f} m"
            for nm in sorted({k for p_ in pl for k in p_}):
                v_ = [p_[nm] for p_ in pl if nm in p_]
                line += f" | {nm} lowest {min(v_):+.3f}..{max(v_):+.3f} m"
            rows.append(line)
    open(os.path.join(H, "review", "feet_check.txt"), "w").write("\n".join(rows) + "\n"); print("\n".join(rows))
elif MODE == "save":
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(H, "zaw_dog_04.blend"))
elif MODE == "final":
    # full-res frames for the final cut: renders/frames/#####.png (split beats: #####_p0/_p1, stacked in final_post.py)
    a_, b_ = int(ARGS[1]), int(ARGS[2])
    out = os.path.join(H, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a_, min(b_, END)):
        p_ = os.path.join(out, f"{f:05d}.png")
        if os.path.exists(p_) or os.path.exists(p_.replace(".png", "_p1.png")):
            continue
        do_frame(next(x for x in BEATS if x[1] <= f < x[2]), f, p_, (1080, 1920))
elif MODE == "thumb":
    # thumbnail plate (guion.md): the street; the dog's nose on the lamppost wearing tiny reading glasses, a newspaper
    # floating in front of it; the owner pulls the leash, annoyed.  thumb.py adds "LET HIM READ!".
    out = os.path.join(H, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    TG = ARGS[1:] and json.loads(ARGS[1]) or {}
    reset(); dd = dog_at_pole(0.0, "judging", sn=False)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.25)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.05)]); NOSE[0] = nose_at(0, LAMP, POLE_R + 0.01)
    op_ = (LAMP[0] - 1.9, LAMP[1] - 1.1); owner_at(op_[0], op_[1], yaw_to(op_, (op_[0] - 1, op_[1] - 0.6)))   # behind the dog, pulling it away
    OWNER.rot("chest", [((0, 0, 1), -0.6), ((1, 0, 0), -0.12)]); OWNER.rot("head", [((0, 0, 1), -0.6), ((1, 0, 0), 0.05)])
    clip = collar_on(0); gp = hold_leash(OWNER, "R", clip, 0.45, 0.95); arm_hang(OWNER, "L", 0.1); leash(clip, gp, 0.0)
    bpy.context.view_layer.update(); am = dd["arm"]; hb = am.pose.bones["head"]
    hh, ht = am.matrix_world @ hb.head, am.matrix_world @ hb.tail
    cpos = Vector(TG.get("cam", (LAMP[0] + 0.12, LAMP[1] + 0.8, 0.5)))
    fwd = Vector((1, 0, 0))                                                              # the dog faces +X at the post
    eye = NOSE[0] - fwd * TG.get("back", 0.17) + Vector((0, 0, TG.get("up", 0.085)))        # the glasses sit across the eyes
    eye += Vector((0, 0.06, 0)) + (cpos - eye).normalized() * 0.04                           # on the near (lens-side) eye, just in front of it
    GLS = card("thumb_glasses", "glasses", 0.065, (0, -40, 0)); GLS.scale = (1.0, 1.0, 1.0)
    GLS.location = eye; GLS.rotation_euler = (math.pi / 2, 0, math.atan2(cpos.x - eye.x, -(cpos.y - eye.y)))
    NP_ = card("thumb_paper", "newspaper", 0.16, (0, -40, 0))
    npl = eye + Vector(TG.get("poff", (-0.04, 0.3, -0.2)))
    NP_.location = npl; NP_.rotation_euler = (math.pi / 2 - 0.1, 0.12, math.atan2(cpos.x - npl.x, -(cpos.y - npl.y)))
    cam(tuple(cpos), tuple(Vector(TG.get("aim", (LAMP[0] - 0.42, LAMP[1] - 0.05, 0.56)))), TG.get("lens", 20))
    render(os.path.join(out, "A.png"), (1080, 1920))
elif MODE == "exec":
    exec(open(ARGS[1]).read())

"""zaw-dog #3 "Your Dog Thinks You're Hurt When You Cry" - Blender scenes + storyboard frames.
Kit sets copied from zaw-dog-01/02 (approved): living room (+ the street outside its window), hallway. New for #3: the
mustard armchair (VLVT: Flow front + side photos projected on modelled boxes), the bedroom behind the hallway's right
doorway (bed / headboard / bedside from Flow photos), the clear acrylic door with two magnets (Flow photo reflections),
the night look (Flow night sky, TV glow + the in-house cartoon on the TV), 18 Flow dog portraits, 3D notes / bubble / counters.
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- board [beat ...]      one frame per beat -> review/raw/
                                                              -- frames <beat> [step]   every frame of a beat -> review/anim/<beat>/
                                                              -- feetscan                review/feet_check.txt
Camera grammar from ref/CAMERA.md (wide 22-26 mm, pet-eye height, hold then slow push/track, hard cuts)."""
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
frame_pic("pic3", "pic_lake", 0.6, (-1.65, LY1 - 0.02, 1.65), 0)
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
box("walk", (60, 1.6, 0.05), (0, 6.0, -0.04), CONC, 0.6)
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
frame_pic("hl_pic", "pic_lake", 0.6, (HX - HW - 2.3 + 0.01, -1.2, 1.5), math.pi / 2)
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
frame_pic("hp2", "pic_lake", 0.45, (HX - HW + 0.01, -0.2, 1.6), math.pi / 2)
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
# tissue box on the coffee table (Flow photo, both sides) + the night TV picture
TBOX = front_box("tissue_box", "tissue_box", (0.24, 0.12, 0.1), (-0.25, 0.22, 0.45), 0.25, "#F4F4F2")
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
# the clear acrylic door (Flow photo of the panel on black -> additive reflections), hinged on the doorway's +Y jamb
DX_, DY0, DY1 = HX + HW, -0.2, 0.6


def acrylic_mat():
    m = bpy.data.materials.new("acrylic"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); t_ = nt.nodes.new("ShaderNodeTexImage"); t_.image = img("acrylic"); t_.interpolation = "Linear"
    em = nt.nodes.new("ShaderNodeEmission"); nt.links.new(t_.outputs[0], em.inputs[0]); em.inputs[1].default_value = 5.0
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); tr.inputs[0].default_value = (0.78, 0.87, 0.94, 1)
    gl = nt.nodes.new("ShaderNodeBsdfGlossy"); gl.inputs["Roughness"].default_value = 0.03     # mirrors what is on screen (the dog)
    mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = 0.3
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(gl.outputs[0], mx.inputs[2])
    add = nt.nodes.new("ShaderNodeAddShader"); nt.links.new(mx.outputs[0], add.inputs[0]); nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs[0]); m.surface_render_method = "BLENDED"; m.use_backface_culling = False
    return m


DOOR3 = K.link(bpy.data.objects.new("door3_piv", None)); DOOR3.location = (DX_, DY1 - 0.01, 0)
_pl = K.plane("door3_glass", DY1 - DY0 - 0.03, 2.0, (0, 0, 0), rot=(math.pi / 2, 0, math.pi / 2), mat=acrylic_mat())
_pl.parent = DOOR3; _pl.location = (0, -(DY1 - DY0 - 0.03) / 2, 1.02)
for nm, size, off in (("door3_e0", (0.014, 0.012, 2.0), (0, -0.006, 0.02)), ("door3_e1", (0.014, 0.012, 2.0), (0, -(DY1 - DY0 - 0.03) + 0.006, 0.02)),
                      ("door3_e2", (0.014, DY1 - DY0 - 0.03, 0.012), (0, -(DY1 - DY0 - 0.03) / 2, 2.02)),
                      ("door3_e3", (0.014, DY1 - DY0 - 0.03, 0.012), (0, -(DY1 - DY0 - 0.03) / 2, 0.02))):
    e_ = box(nm, (0.024, max(size[1], 0.022), max(size[2], 0.022)), (0, 0, 0), K.mat_color("acr_edge", "#EAF6FF", emit_only=True)); e_.parent = DOOR3; e_.location = (off[0], off[1], off[2] + size[2] / 2)
for k_, z_ in enumerate((0.45, 1.5)):                                                   # two magnets on the frame + plates on the door
    prism(f"magnet{k_}", 0.035, 0.03, (DX_ + 0.03, DY0 + 0.04, z_), -math.pi / 2, "magnet", side="#1C1C1C")
    pl_ = box(f"mplate{k_}", (0.012, 0.05, 0.06), (0, 0, 0), mcol("#B8BCC0")); pl_.parent = DOOR3; pl_.location = (0.012, -(DY1 - DY0 - 0.03) + 0.03, z_ - 0.03)


def door3(ang):
    DOOR3.rotation_euler = (0, 0, ang)                                                    # + = swings into the bedroom (+X)


# the hall table + its clutter go (the door-test cameras stand there): props vary per video
for o in [o for o in bpy.data.objects if o.name.startswith(("h_table", "h_mail", "h_keybowl"))]:
    bpy.data.objects.remove(o)

# ----- line 3: 18 portrait cards (Flow dog portraits), parented to the camera later
PORTS = []
for k in range(18):
    root = K.link(bpy.data.objects.new(f"pt{k}", None))
    fr = K.box(f"pt{k}_fr", (0.26, 0.26, 0.012), (0, 0, -0.008), mcol("#F4F0E6")); fr.parent = root
    pl = K.plane(f"pt{k}_img", 0.23, 0.23, (0, 0, 0.0), rot=(0, 0, 0), mat=mtex(f"port_{k:02d}")); pl.parent = root
    PORTS.append(root)
# ----- 3D props: musical notes, a speech bubble with dots
NOTE_M = K.mat_color("note_m", "#1A1A1A", emit_only=True)


def note_mesh(name):
    root = K.link(bpy.data.objects.new(name, None))
    hd = prism(name + "_h", 0.045, 0.025, (0, 0, 0), 0.0, "magnet", side="#1A1A1A"); hd.data.materials[0] = NOTE_M; hd.parent = root
    hd.scale = (1.25, 1, 0.9); hd.rotation_euler = (0, 0.4, 0)
    st = K.box(name + "_s", (0.012, 0.012, 0.2), (0.048, 0.0, 0.1), NOTE_M); st.parent = root
    fl = K.box(name + "_f", (0.06, 0.012, 0.022), (0.075, 0.0, 0.19), NOTE_M); fl.parent = root; fl.rotation_euler = (0, 0.5, 0)
    return root


NOTES = [note_mesh(f"note{i}") for i in range(3)]
BUB = K.link(bpy.data.objects.new("bubble", None))
_b = prism("bub_d", 0.2, 0.04, (0, 0, 0), 0.0, "magnet", side="#E8E8E8"); _b.data.materials[0] = K.mat_color("bub_w", "#FAFAFA", emit_only=True)
_b.scale = (1.12, 1, 1); _b.parent = BUB                               # (user: rounder, not stretched)
_t = K.box("bub_t", (0.07, 0.04, 0.1), (-0.12, 0, -0.2), bpy.data.materials["bub_w"]); _t.rotation_euler = (0, 0.6, 0); _t.parent = BUB
for k in range(3):
    for yy, rz in ((-0.022, 0.0), (0.052, math.pi)):                   # "..." on both faces of the bubble
        d_ = prism(f"bub_dot{k}_{rz:.0f}", 0.03, 0.01, (-0.09 + 0.09 * k, yy, 0), rz, "magnet", side="#222222"); d_.data.materials[0] = NOTE_M; d_.parent = BUB
# the sky card for the tilt-up (03b): a Flow sky photo fixed to the camera far away, so the sky fills the frame (no plane edge)
SKYCARD = K.plane("skycard", 60, 90, (0, -40, 0), rot=(0, 0, 0), mat=K.mat_image("m_skycard", img("sky"), emit_only=True))
# tears (line 14): small glossy blue drops on his cheeks + wet eye glints, placed on the face each frame
TEAR_M = K.mat_color("tear_m", "#8FD4FF", emit_only=True); GLINT_M = K.mat_color("glint_m", "#FFFFFF", emit_only=True)
TEARS = []
for k in range(2):
    td = K.box(f"tear{k}", (0.0065, 0.004, 0.03), (0, -40, 0), TEAR_M); gl_ = K.box(f"glint{k}", (0.006, 0.003, 0.004), (0, -40, 0), GLINT_M)
    TEARS += [td, gl_]
TXT = {k: K.Letters3D(f"t_{k}", v, size=0.16, front="#FFE21A", side="#B8860B", seed=3, jitter=0.12)
       for k, v in (("c15", "15/18"), ("c6", "6/18"), ("same", "SAME"), ("x3", "3x"))}


# (user: no grain - the texts stay bright clean yellow; their EDGES get pixelated in post, final_post.pixelate_text)

# ---------------------------------------------------------------- characters
DOGS = []
for i in range(1):
    o, arm, fn = D.build()
    mv = K.link(bpy.data.objects.new(f"mover{i}", None)); arm.parent = mv
    sh = D.blob_shadow(mv)
    DOGS.append(dict(o=o, arm=arm, fn=fn, mv=mv, sh=sh))
# the dog's reflection in the clear acrylic door (line 11): a second copy of the v2 dog, mirrored across the door plane,
# posed like the real one each frame, in a see-through copy of its material (reads as a reflection through the glass)
_o2, _a2, _f2 = D.build()
GHOST = dict(o=_o2, arm=_a2, fn=_f2, mv=K.link(bpy.data.objects.new("ghost_mv", None))); _a2.parent = GHOST["mv"]
_gm = _o2.material_slots[0].material.copy(); _gm.name = "dog_ghost"; _nt = _gm.node_tree
_out = next(n for n in _nt.nodes if n.type == "OUTPUT_MATERIAL"); _src = _out.inputs[0].links[0].from_socket
_tr = _nt.nodes.new("ShaderNodeBsdfTransparent"); _mx = _nt.nodes.new("ShaderNodeMixShader"); _mx.inputs[0].default_value = 0.62
_nt.links.new(_src, _mx.inputs[1]); _nt.links.new(_tr.outputs[0], _mx.inputs[2]); _nt.links.new(_mx.outputs[0], _out.inputs[0])
_gm.surface_render_method = "BLENDED"; _o2.material_slots[0].material = _gm
for _n in _nt.nodes:
    if _n.type == "TEX_IMAGE" and _n.image and _n.image.name.startswith("dog_atlas"):
        GHOST["fn"] = _n


def reflect_dog(on=True):
    hide(GHOST["o"], not on)
    if not on:
        return
    bpy.context.view_layer.update()
    from mathutils import Matrix
    Mir = Matrix.Translation((2 * DX_ - 0.02, 0, 0)) @ Matrix.Scale(-1, 4, (1, 0, 0))
    GHOST["mv"].matrix_world = Mir @ DOGS[0]["mv"].matrix_world
    for pb in DOGS[0]["arm"].pose.bones:
        GHOST["arm"].pose.bones[pb.name].matrix_basis = pb.matrix_basis.copy()
    GHOST["fn"].image = DOGS[0]["fn"].image


import photohuman2 as PH  # noqa: E402   (welded shoulders, wrap-textured heads, Flow photo hands + shoes)
OWNER = PH.PhotoPerson("owner")
STR = PH.PhotoPerson("stranger")            # the woman stranger: own face, bob, olive cardigan, charcoal trousers, boots
PEOPLE = (OWNER, STR)

CAM = K.camera("Cam", 24)
K.ps1_snap(CAM, grid_h=300)
_SNAP = {d["o"].name for d in DOGS} | {o.name for P_ in PEOPLE for o in P_.parts} | {o.name for L_ in TXT.values() for o, *_ in L_.letters}
for o in bpy.data.objects:                                         # static set unsnapped: only characters wobble
    if o.type == "MESH" and o.name not in _SNAP and o.modifiers.get("ps1"):
        o.modifiers.remove(o.modifiers["ps1"])
_GRAZE = ("floor_wood", "rug", "grass", "asphalt", "concrete", "brick", "doormat", "fabric", "roof")
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image and n.image.name.split(".")[0] in _GRAZE:
                n.interpolation = "Linear"
sc.eevee.taa_render_samples = 16
try:
    sc.eevee.use_raytracing = True                                  # screen-space reflections: the dog in the acrylic door
    sc.eevee.ray_tracing_options.screen_trace_quality = 0.5
except Exception as _e:
    print("raytracing", _e)


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
    """a Zaw pop-in 3D text (yellow, wobbling) fixed in the frame."""
    L_ = TXT[key]; bpy.context.view_layer.update()
    L_.root.matrix_world = CAM.matrix_world @ __import__("mathutils").Matrix.Translation((dx, dy, -dist))
    L_.anim(t, t0, wobble=0.25, scale=scale)                               # (user: reads straight, little skew)


def reset():
    for d in DOGS:
        hide(d["o"], True); hide(d["sh"], True)
    for P_ in PEOPLE:
        P_.show(False); P_.rest(); P_.arm.location = (0, -40, 0)
    for o in PORTS + NOTES + [BUB]:
        hide(o, True)
        for c in o.children:
            hide(c, True)
        o.location = (0, -40, 0)
    for L_ in TXT.values():
        L_.hide()
    door3(0.0); set_night(False); street_warm(False)
    for o in TEARS + [SKYCARD, GHOST["o"]]:
        hide(o, True)
    for o in LR_CT:
        hide(o, False)


def showkids(o, on=True):
    hide(o, not on)
    for c in o.children:
        hide(c, not on)


# ---------------------------------------------------------------- beats (t = s into the beat, d = beat length)
OWN_SOFA = (0.28, 1.3)            # the owner's hips on the sofa (faces -Y, the TV)
STR_CHAIR = (ARM_AT[0] + 0.12, ARM_AT[1])   # the stranger's hips in the armchair (faces +X)
SEAT = 0.42                         # cushion top 0.38 (+4 cm: thighs rest on it); his knees are at 0.39 m
DOG_N = (0.6, -0.75)              # night: the dog on the rug in front of the coffee table, facing the sofa
BARK = round((TIM["words"][1]["e"] + 0.08 - 0.15) * FPS) / FPS     # the hero bark: just after "crying," (s into the video)


def owner_sofa(lean=0.3):
    sit(OWNER, OWN_SOFA, 0.0, SEAT, lean=lean)


DOG_F = (0.42, -0.95)              # night: the dog on the rug between the coffee table and the TV, facing the lens (-Y)


def dog_face_snap(t, expr_before="neutral"):
    """line 1: head down, then on the bark the head snaps up, shocked, ears forward, jaw on the bark."""
    snap = clamp01((t - (BARK - 0.05)) / 0.1)
    dd = dog(0, (DOG_F[0], DOG_F[1], 0), 0.12, "shocked" if snap > 0.3 else expr_before, t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.38 * (1 - snap) - 0.12 * snap)])
    D.rot2(dd["arm"], "head", [((1, 0, 0), -0.05 * snap)])
    if snap > 0:
        D.rot(dd["arm"], "jaw", (1, 0, 0), 0.4 * math.sin(math.pi * clamp01((t - BARK) / 0.25)))
    return dd


def sob(P, t, s="R", lean=0.32):
    owner_sofa(lean); P.rot("head", [((1, 0, 0), 0.25 + 0.05 * math.sin(14 * t))]); cry_tissue(P, s, sob=math.sin(14 * t)); hands_lap(P, "L" if s == "R" else "R")


def b01a(t, d):   # night, Zaw framing: the dog faces us on the rug, he sobs on the sofa behind it; bark -> the face snaps up, shocked
    set_night(True); sob(OWNER, t)
    dog_face_snap(t)
    u = K.ease(clamp01((t - 0.3) / (d - 0.3)))
    cam(lerpv((0.3, -2.25, 0.6), (0.3, -2.15, 0.6), u), (0.35, 0.2, 0.8), 28)


def b01b(t, d):   # slow push-in: past the dog's shocked face toward the sobbing owner
    set_night(True); sob(OWNER, t + 1.2)
    dog_face_snap(t + 2.0)
    u = K.ease(t / d)
    cam(lerpv((0.3, -2.12, 0.62), (0.32, -1.98, 0.63), u), (0.36, 0.15, 0.84), 32)


def b02(t, d):    # over the owner's shoulder onto the TV (the sad cartoon); the dog between, looking from one to the other
    set_night(True)
    owner_sofa(0.12); hands_lap(OWNER); OWNER.rot("head", [((1, 0, 0), 0.1)])
    dd = dog(0, (0.05, -1.25, 0), math.pi, "judging", t)
    k = math.sin(math.pi * clamp01(t / d) * 1.5)
    D.rot2(dd["arm"], "neck", [((0, 0, 1), 0.7 * k)]); D.rot2(dd["arm"], "head", [((0, 0, 1), 0.3 * k)])
    u = K.ease(t / d)
    cam(lerpv((0.8, 1.76, 1.34), (0.68, 1.76, 1.34), u), lerpv((-0.05, -2.3, 0.72), (-0.15, -2.3, 0.72), u), 28)


def b03a(t, d):   # street bridge shot: brick houses, the sidewalk, the black car; slow push on the warm window
    street_warm(True)
    CAR.location = (-0.6, 12.5, -0.04)
    u = K.ease(t / d)
    cam(lerpv((3.6, 7.9, 1.3), (2.8, 9.4, 1.35), u), lerpv((-3.0, 17.9, 1.2), (-2.6, 17.9, 1.25), u), 24)


def b03b(t, d):   # tilt up to the sky (a sky card fills the frame): 18 dog portraits pop in a 6x3 grid, one row at a time
    street_warm(True); CAR.location = (-0.6, 12.5, -0.04)
    u = K.ease(clamp01(t / 0.6))
    cam((2.8, 9.4, 1.4), lerpv((-2.6, 17.9, 1.6), (-2.0, 18.0, 5.0), u), 24)
    bpy.context.view_layer.update()
    hide(SKYCARD, False); SKYCARD.matrix_world = CAM.matrix_world @ __import__("mathutils").Matrix.Translation((0, 0, -45))
    for k, o in enumerate(PORTS):
        r_, c_ = k // 6, k % 6
        showkids(o)
        o.matrix_world = CAM.matrix_world @ __import__("mathutils").Matrix.Translation(((c_ - 2.5) * 0.335, (0.66 - r_ * 0.335), -2.6))
        pop(o, t, 0.45 + 0.33 * r_, 1.15)


DOG_MID = (-0.15, 0.4)


def split_cam(side, u, look_up=0.0):
    if side == 0:      # the owner, the dog's back-3/4 in the foreground
        cam(lerpv((-1.0, 0.2, 0.62), (-0.9, 0.27, 0.62), u), (0.35, 1.2, 0.72 + look_up), 26)
    else:              # the stranger
        cam(lerpv((0.35, -0.3, 0.66), (0.27, -0.2, 0.66), u), (-1.55, 0.42, 0.74 + look_up), 26)


def p04(side):
    def f(t, d):  # day split: top = the owner fake-cries into his hands; bottom = the stranger in the armchair; dog between
        for o in LR_CT:
            hide(o, True)
        owner_sofa(0.35); OWNER.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(OWNER, math.sin(12 * t))
        sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.35); STR.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(STR, math.sin(11 * t + 1))
        dd = dog(0, (DOG_MID[0], DOG_MID[1], 0), math.pi * 0.75 if side == 0 else -math.pi * 0.75, "neutral", t); dog_sit(0)
        split_cam(side, K.ease(t / d))
    return f


def p05(side):
    def f(t, d):  # same split: he hums, notes float up; she chats with her hands, a speech bubble; the dog yawns
        for o in LR_CT:
            hide(o, True)
        owner_sofa(0.05); hands_lap(OWNER); hum(OWNER, t)
        sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.1); gesture(STR, t)
        dd = dog(0, (DOG_MID[0], DOG_MID[1], 0), math.pi * 0.75 if side == 0 else -math.pi * 0.75, "neutral", t); dog_sit(0)
        y_ = math.sin(math.pi * clamp01((t - 0.3) / 1.0))
        D.rot(dd["arm"], "jaw", (1, 0, 0), 0.55 * y_); D.rot2(dd["arm"], "head", [((1, 0, 0), -0.35 * y_)])
        notes_at(OWNER, t, side == 0)
        sh_ = bone_w(STR, "head", True); showkids(BUB, side == 1)
        split_cam(side, K.ease(t / d), 0.05); bpy.context.view_layer.update()
        cp = CAM.matrix_world.translation; yb = yaw_to((sh_.x, sh_.y), (cp.x, cp.y))
        BUB.rotation_euler = (0, 0, yb)                                     # level, square to the lens
        pop(BUB, t, 0.2, 0.78)                                              # (user: ~78 % of the old size)
        from mathutils import Matrix as _M
        tip = _M.Rotation(yb, 3, "Z") @ Vector((-0.152, 0.0, -0.245)) * BUB.scale.x      # the tail tip in the bubble's frame
        BUB.location = sh_ + Vector((0, 0, 0.015 + 0.01 * math.sin(4 * t))) - tip         # tail tip just above the top of her head
        split_cam(side, K.ease(t / d), 0.05)
    return f


def notes_at(P, t, on=True, face=None):
    hp = bone_w(P, "head", True); yaw = P.arm.rotation_euler.z; fw = Vector((math.sin(yaw), -math.cos(yaw), 0))
    for i, n_ in enumerate(NOTES):
        showkids(n_, on)
        if not on:
            continue
        u_ = (t * 0.6 + i * 0.33) % 1.0
        n_.location = hp + fw * 0.12 + Vector((0.1 * math.sin(3 * t + i), 0.1 * math.cos(2 * t + i), 0.05 + 0.45 * u_))
        n_.rotation_euler = (0, 0, (face if face is not None else 0.3) + 0.3 * math.sin(2 * t + i)); pop(n_, t, 0.15 * i, 1.2)


def b06(t, d):    # side-on at knee height: he cries; the dog walks in and rests its chin on his knee (sad); "15/18"
    for o in LR_CT:
        hide(o, True)
    owner_sofa(0.35); OWNER.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(OWNER, math.sin(12 * t))
    kn = bone_w(OWNER, "shin.R")                                       # his right knee (the -X one, toward the lens)
    T_ = 1.0; u_ = clamp01(t / T_)
    yaw = math.pi + 0.05                                                # facing +Y, into his lap
    goal = (kn.x, kn.y + 0.06)
    start = (goal[0] - 0.02, goal[1] - 0.75)
    dd = dog(0, (0, 0, 0), yaw, "sad", t); dog_nose_to(0, lerpv(start, goal, u_))
    dog_walk(0, min(t, T_), 2.2); D.expr_pose(dd["arm"], "sad", t)       # the stride freezes where it stops (no snap to rest)
    k = K.ease(clamp01((t - T_ + 0.15) / 0.35))
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.32 * k)]); D.rot2(dd["arm"], "head", [((1, 0, 0), -0.12 * k)])   # the chin settles on the knee
    u = K.ease(t / d)
    cam(lerpv((kn.x - 1.25, kn.y - 0.55, 0.6), (kn.x - 1.05, kn.y - 0.45, 0.62), u), (kn.x + 0.05, kn.y - 0.05, 0.62), 28)
    text_at("c15", t, 0.75, 0.13, 0.36, 0.9, 0.6)


def b07(t, d):    # hard cut: he hums with a smile; the dog stays on the rug and scratches its ear with a hind paw; "6/18"
    for o in LR_CT:
        hide(o, True)
    owner_sofa(0.05); hands_lap(OWNER); hum(OWNER, t)
    yaw = math.pi / 2 - 0.35                                            # right flank to the lens, head toward the left of frame
    dd = dog(0, (-0.3, -0.25, 0), yaw, "judging", t); dog_sit(0)
    sc_ = math.sin(2 * math.pi * 6.5 * t)
    am = dd["arm"]
    from mathutils import Quaternion as _Q
    for bn, ax, ang in (("chest", (0, 0, 1), -0.45), ("neck", (0, 0, 1), -0.9), ("neck", (1, 0, 0), 0.55), ("head", (0, 1, 0), -0.6)):
        pb_ = am.pose.bones[bn]; pb_.rotation_quaternion = _Q(D.local_axis(am, bn, ax), ang) @ pb_.rotation_quaternion   # head bent back + down to the right hind paw
    bpy.context.view_layer.update()
    ear = am.pose.bones["ear.R"].head.copy(); rest = am.data.bones["ik_h.R"].head_local.copy()
    D.move(am, "ik_h.R", tuple(ear - rest + Vector((0.0, 0.08, -0.04 + 0.035 * sc_))))   # the hind paw scratches at the ear
    cam((-0.75, -1.55, 0.52), (-0.3, -0.25, 0.42), 28)
    notes_at(OWNER, t, False)
    text_at("c6", t, 0.12, -0.25, 0.72, 2.0, 1.4)


DOG8 = [(0.6, 0.3), (-0.45, 0.62), (-0.95, 0.45)]          # in front of the owner's knees -> to the stranger's hand


def offer_hand(t=0.0):
    """her right hand held out low toward the dog, palm DOWN, fingers relaxed (to be sniffed)."""
    sh = bone_w(STR, "upperarm.R"); hnd = sh + pvec(STR, (-0.1, -0.42, -0.36))
    arm_w(STR, "R", sh + pvec(STR, (-0.2, -0.15, -0.25)), hnd, hnd + pvec(STR, (-0.02, -0.16, -0.05))); STR.hand("R", "open"); STR.twist("R", -1.55)
    return hnd


def b08a(t, d):   # she cries in the armchair; the dog trots past the owner (arms open) to her
    for o in LR_CT:
        hide(o, True)
    owner_sofa(0.05); arms_open(OWNER, 1.0)
    sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.35); STR.rot("head", [((1, 0, 0), 0.3)]); cry_tissue(STR, "L", sob=math.sin(11 * t)); hands_lap(STR, "R")
    u_ = clamp01(t / d); a, b = DOG8[0], DOG8[1]
    p = lerpv(a, b, u_)
    dd = dog(0, (p[0], p[1], 0), yaw_to(a, b), "happy", t); dog_walk(0, t, 3.0); D.expr_pose(dd["arm"], "happy", t)
    u = K.ease(t / d)
    cam(lerpv((0.55, -1.05, 0.64), (0.3, -0.98, 0.64), u), lerpv((-0.15, 0.85, 0.72), (-0.45, 0.85, 0.72), u), 26)


def b08b(t, d):   # tight on her held-out hand: the dog sniffs it, then licks it (happy wag)
    for o in LR_CT:
        hide(o, True)
    OWNER.show(False)                                                   # (off to the right, outside this frame)
    sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.3); STR.rot("head", [((1, 0, 0), 0.25)])
    cry_tissue(STR, "L", sob=math.sin(11 * t))
    hnd = offer_hand(t)
    yaw = -math.pi / 2 + 0.25                                           # the dog faces -X (her), coming from her right
    u_ = clamp01(t / 0.45)
    dd = dog(0, (0, 0, 0), yaw, "happy", t)
    lk = clamp01((t - 0.75) / 0.15)
    tgt = (hnd.x + 0.07, hnd.y - 0.01)
    dog_nose_to(0, lerpv((tgt[0] + 0.35, tgt[1] - 0.12), tgt, K.ease(u_)))
    if u_ < 1:
        dog_walk(0, t, 2.0)
    D.happy_wag(dd["arm"], t, 1.0, 4.4, up=0.25)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.12 + 0.05 * math.sin(18 * t) * (1 - lk))])
    if lk > 0:
        D.rot(dd["arm"], "jaw", (1, 0, 0), 0.25 * lk)
    u = K.ease(t / d)
    cam(lerpv((hnd.x + 0.2, hnd.y - 0.95, 0.56), (hnd.x + 0.14, hnd.y - 0.8, 0.56), u), (hnd.x + 0.1, hnd.y + 0.05, 0.52), 28)


def b09(t, d):    # side CU at floor level: the dog creeps in, head low, ears back, tail tucked, then nuzzles her knee (sad)
    for o in LR_CT:
        hide(o, True)
    sit(STR, STR_CHAIR, math.pi / 2, ARM_SEAT_Z, lean=0.35); STR.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(STR, math.sin(11 * t))
    knee = bone_w(STR, "shin.R")
    T_ = 1.15; u_ = clamp01(t / T_)
    goal = (knee.x + 0.06, knee.y + 0.02)
    dd = dog(0, (0, 0, 0), -math.pi / 2, "sad", t); dog_nose_to(0, lerpv((goal[0] + 0.6, goal[1]), goal, u_))
    if u_ < 1:
        dog_walk(0, t, 0.9); D.expr_pose(dd["arm"], "sad", t)
    am = dd["arm"]
    D.move(am, "hips", (0, 0, -0.1)); D.move(am, "chest", (0, 0, -0.06))                  # belly low: the creep
    D.rot2(am, "neck", [((1, 0, 0), 0.62)]); D.rot2(am, "head", [((1, 0, 0), -0.38)])     # head low, eyes up
    for s_, sx in (("L", 1), ("R", -1)):                                                  # ears pinned flat back
        D.rot2(am, f"ear.{s_}", [((0, 1, 0), -sx * 0.55), ((1, 0, 0), 0.75)])
    D.rotl(am, "tail1", [((1, 0, 0), -0.9)]); D.rotl(am, "tail2", [((1, 0, 0), -0.6)]); D.rotl(am, "tail3", [((1, 0, 0), -0.4)])   # tail tucked under
    if u_ >= 1:
        k = K.ease(clamp01((t - T_) / 0.35)); D.rot2(am, "head", [((1, 0, 0), -0.38 - 0.15 * k), ((0, 1, 0), 0.25 * k)])
    u = K.ease(t / d)
    cam(lerpv((goal[0] + 0.3, goal[1] - 1.05, 0.28), (goal[0] + 0.28, goal[1] - 0.92, 0.29), u), (goal[0] + 0.12, goal[1], 0.36), 26)


# ----- hallway + bedroom (the door test)
HALL_DOG = (HX + 0.3, -1.7)
OWN_FLOOR = (RX0 + 1.2, 0.3)      # the owner sits on the bedroom floor facing the door (-X), the bed behind him


def owner_floor(lean=0.25):
    sit(OWNER, OWN_FLOOR, -math.pi / 2, 0.095, a1=2.0, lean=lean)      # seat 9.5 cm: the buttocks rest ON the floor (feetscan)


def b10a(t, d):   # hallway at dog height: he walks into the bedroom doorway (the clear door), the dog watches
    u_ = clamp01(t / d)
    p = lerpv((HX - 0.05, -0.45), (HX + 1.0, 0.2), K.ease(u_))
    OWNER.show(True, (p[0], p[1], 0), yaw_to((HX - 0.05, -0.45), (HX + 1.0, 0.2))); OWNER.walk(t, 0.9, 0.95)
    for s_, sg in (("L", 1), ("R", -1)):                                # keep the swinging foot's sole level (no toe dip)
        w_ = math.sin(2 * math.pi * 0.95 * t) * sg
        OWNER.rot(f"foot.{s_}", [((1, 0, 0), 0.38 * 0.9 * w_ - 0.45 * 0.9 * max(0.0, w_))])
    bpy.context.view_layer.update(); _dg = bpy.context.evaluated_depsgraph_get(); _ev = OWNER.body.evaluated_get(_dg)
    _low = min((_ev.matrix_world @ v.co).z for v in _ev.data.vertices); OWNER.arm.location.z -= _low          # the planted sole exactly on the floor
    door3(math.radians(70) * (1 - K.ease(clamp01((t - 0.75) / 0.5))))
    dd = dog(0, (HALL_DOG[0], HALL_DOG[1], 0), yaw_to(HALL_DOG, (HX + 0.75, 0.2)), "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((HX - 0.3, -2.75, 0.66), (HX - 0.28, -2.55, 0.66), u), (HX + 0.35, 0.3, 0.85), 26)


def b10b(t, d):   # the door clacks shut on its two magnets; through it he sits down on the floor
    door3(math.radians(14) * (1 - K.ease(clamp01(t / 0.2))))
    owner_floor(0.15); hands_lap(OWNER)
    dd = dog(0, (HX - 0.2, -0.75, 0), yaw_to((HX - 0.2, -0.75), (HX + 0.75, 0.2)), "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((HX - 0.6, -0.3, 0.66), (HX - 0.5, -0.27, 0.64), u), (OWN_FLOOR[0], OWN_FLOOR[1] - 0.05, 0.55), 26)


def bed_cam(t, d, push=0.14):
    u = K.ease(t / d)
    cam(lerpv((HX - 0.62, 0.4, 0.98), (HX - 0.62 + push, 0.38, 0.96), u), (OWN_FLOOR[0], OWN_FLOOR[1] - 0.12, 0.6), 28)


def b11a(t, d):   # over the dog's head through the clear door: he cries by the bed; the dog mirrored in the acrylic
    owner_floor(0.35); OWNER.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(OWNER, math.sin(12 * t))
    dd = dog(0, (0, 0, 0), math.pi / 2 + 0.1, "shocked", t); dog_nose_to(0, (DX_ - 0.07, 0.1))
    reflect_dog(True)
    bed_cam(t, d)


def b11b(t, d):   # hard jump: same shot, he hums and sways (notes)
    owner_floor(0.1); hands_lap(OWNER); hum(OWNER, t)
    OWNER.rot("chest", [((1, 0, 0), 0.1), ((0, 1, 0), 0.12 * math.sin(3.5 * t))])
    dd = dog(0, (0, 0, 0), math.pi / 2 + 0.1, "neutral", t); dog_nose_to(0, (DX_ - 0.07, 0.1))
    D.rot2(dd["arm"], "head", [((0, 1, 0), 0.25 * math.sin(2.5 * t))])
    notes_at(OWNER, t, True, face=-math.pi / 2 + 0.6)
    reflect_dog(True)
    bed_cam(t, d)


DOOR_W = DY1 - DY0 - 0.03


def door_tip(ang):
    return (DX_ + DOOR_W * math.sin(ang), DY1 - 0.01 - DOOR_W * math.cos(ang))


def door_dog(t, push_t0, push_dur, expr="neutral", open_to=62):
    """the dog walks up and noses the door's free edge; the door swings in as the nose follows the edge."""
    k = clamp01((t - push_t0) / push_dur)
    ang = math.radians(open_to) * K.ease(k); door3(ang)
    tip = door_tip(ang)
    nose = (tip[0] - 0.03, tip[1] + 0.06)
    if t < push_t0:
        a = clamp01(t / push_t0); nose = lerpv((DX_ - 0.6, DY0 + 0.02), (DX_ - 0.03, DY0 + 0.07), K.ease(a))
    yaw = yaw_to((nose[0] - 0.5, nose[1] - 0.12), nose)
    dd = dog(0, (0, 0, 0), yaw, expr, t); dog_nose_to(0, nose)
    if t < push_t0 + push_dur:
        dog_walk(0, t, 1.3); D.expr_pose(dd["arm"], expr, t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.12)])
    return dd


DOOR_CAM = ((HX - 0.6, -0.55, 0.92), (HX + 0.95, 0.12, 0.42))


def p12(side):
    def f(t, d):  # split: top = crying, bottom = humming; in each the dog noses the clear door open, same pace; "SAME"
        if side == 0:
            owner_floor(0.35); OWNER.rot("head", [((1, 0, 0), 0.3)]); hands_on_face(OWNER, math.sin(12 * t))
        else:
            owner_floor(0.1); hands_lap(OWNER); hum(OWNER, t); notes_at(OWNER, t, True, face=-math.pi / 2 + 0.6)
        door_dog(t, 0.45, 0.9)
        cam(DOOR_CAM[0], DOOR_CAM[1], 24)
        if side == 0:
            text_at("same", t, 1.2, 0.0, -0.3, 0.9, 1.0)
    return f


def lap_dog(t):
    """the dog pressed against his right side (+Y, seen through the doorway), front paws on his thigh, nose up; happy wag."""
    th = bone_w(OWNER, "shin.R"); hp = bone_w(OWNER, "thigh.R"); m = (th + hp) / 2
    dd = dog(0, (0, 0, 0), -0.35, "happy", t); dog_nose_to(0, (m.x - 0.02, m.y + 0.06))
    for s_ in "LR":
        D.move(dd["arm"], f"ik_f.{s_}", (0.0, 0.06, 0.12))
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.3)])
    D.happy_wag(dd["arm"], t, 1.0, 4.4, up=0.25)
    return dd


def p13(side):
    def f(t, d):  # the race: crying side = the dog already at his side; humming side = still sniffing the frame, pawing it
        if side == 0:
            owner_floor(0.2); hands_lap(OWNER, "R"); door3(math.radians(75))
            lap_dog(t); OWNER.rot("head", [((1, 0, 0), 0.15)])
        else:
            owner_floor(0.1); hands_lap(OWNER); hum(OWNER, t); door3(math.radians(3 + 2 * max(0.0, math.sin(5 * t))))
            OWNER.rot("chest", [((1, 0, 0), 0.1), ((0, 1, 0), 0.12 * math.sin(3.5 * t))])
            notes_at(OWNER, t, True, face=-math.pi / 2 + 0.6)
            dd = dog(0, (0, 0, 0), math.pi / 2 - 0.35, "judging", t); dog_nose_to(0, (DX_ - 0.05, DY0 + 0.02 + 0.06 * math.sin(2.2 * t)))
            am = dd["arm"]
            D.rot2(am, "neck", [((1, 0, 0), 0.25), ((0, 0, 1), 0.2 * math.sin(2.2 * t))])
            D.rot2(am, "head", [((1, 0, 0), 0.1 + 0.08 * math.sin(16 * t))])                  # sniff sniff
            D.move(am, "ik_f.L", (0.0, -0.05, 0.08 + 0.06 * max(0.0, math.sin(7 * t))))         # a paw scratches at the frame
            D.rotl(am, "tail1", [((0, 0, 1), 0.35 * math.sin(2 * math.pi * 1.4 * t))])
        cam(DOOR_CAM[0], DOOR_CAM[1], 24)
    return f


def b13b(t, d):   # slow push on the crying side: the dog at his lap (happy, tongue out); a big "3x" pops
    owner_floor(0.2); hands_lap(OWNER, "R"); door3(math.radians(75))
    lap_dog(t)
    u = K.ease(t / d)
    cam(lerpv((HX - 0.35, 0.05, 0.74), (HX - 0.05, 0.08, 0.72), u), (OWN_FLOOR[0], OWN_FLOOR[1] + 0.3, 0.55), 26)
    text_at("x3", t, 0.15, 0.12, 0.33, 0.8, 1.3)


def place_tears(P, k_well):
    """two drops on his cheeks under the eyes + a glint on each eye (they swell with k_well)."""
    for i, sx in enumerate((-1, 1)):
        hb = bone_w(P, "head"); R3 = (P.arm.matrix_world @ P.arm.pose.bones["head"].matrix).to_3x3().normalized()
        def at(off):
            return hb + R3 @ Vector(off)
        td, gl_ = TEARS[2 * i], TEARS[2 * i + 1]
        hide(td, False); hide(gl_, True)                                     # (the glint read as a dot on the forehead: off)
        td.matrix_world = __import__("mathutils").Matrix.Translation(at((sx * 0.033, 0.066 - 0.022 * k_well, 0.1))) @ R3.to_4x4()
        td.scale = (1, 1, 0.4 + 0.9 * k_well)
        gl_.matrix_world = __import__("mathutils").Matrix.Translation(at((sx * 0.03, 0.086, 0.099))) @ R3.to_4x4()


def b14(t, d):    # night: CU, the dog's nose an inch from his wet face (tears well up); cuts into shot 1
    set_night(True)
    for o in LR_CT:
        hide(o, True)
    owner_sofa(1.0); OWNER.rot("head", [((1, 0, 0), 0.05)]); hands_lap(OWNER)
    wr = face_pt(OWNER, 0.08, -0.2, 0.03)                                # his fist + tissue under the chin (covers the neck seam)
    arm_w(OWNER, "R", bone_w(OWNER, "upperarm.R") + pvec(OWNER, (-0.1, -0.25, -0.3)), wr, face_pt(OWNER, 0.1, -0.08, 0.02)); OWNER.hand("R", "tissue")
    f_ = face_pt(OWNER, 0.1, 0.0)
    dd = dog(0, (0, 0, 0), math.pi + 0.1, "sad", t)
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.75)]); D.rot2(dd["arm"], "head", [((1, 0, 0), -0.3)])
    dog_nose_to(0, (f_.x, f_.y - 0.3))
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg)
    yaw = DOGS[0]["mv"].rotation_euler.z; fw = np.array([math.sin(yaw), -math.cos(yaw), 0.0])
    nose = Vector(P_[np.argmax(P_ @ fw)])
    gap = 0.04 + 0.03 * (1 - K.ease(clamp01(t / d)))
    goal = f_ - Vector((fw[0], fw[1], 0)) * gap
    DOGS[0]["mv"].location += Vector((goal.x - nose.x, goal.y - nose.y, 0)); nose = Vector((goal.x, goal.y, nose.z))
    place_tears(OWNER, K.ease(clamp01(t / d)))
    mid = (nose + f_) / 2; side = Vector((-fw[1], fw[0], 0)); fv = Vector((fw[0], fw[1], 0))
    u = K.ease(t / d)
    cam(lerpv(tuple(mid + side * 0.32 - fv * 0.58 - Vector((0, 0, 0.05))), tuple(mid + side * 0.28 - fv * 0.5 - Vector((0, 0, 0.05))), u),
        tuple(f_ + Vector((0, 0, 0.03))), 30)


def word_cut(line, idx):
    w = [x for x in TIM["words"] if x["line"] == line][idx]
    return round((w["s"] - 0.15) * FPS)


L = word_cut
BEATS = [  # name, f0, f1, fn | [panel fns], board fraction
    ("01a", 0, L(0, 2), b01a, 0.88), ("01b", L(0, 2), CUT[1], b01b, 0.6),
    ("02", CUT[1], CUT[2], b02, 0.6),
    ("03a", CUT[2], L(2, 6), b03a, 0.6), ("03b", L(2, 6), CUT[3], b03b, 0.85),
    ("04", CUT[3], CUT[4], [p04(0), p04(1)], 0.5),
    ("05", CUT[4], CUT[5], [p05(0), p05(1)], 0.55),
    ("06", CUT[5], CUT[6], b06, 0.8),
    ("07", CUT[6], CUT[7], b07, 0.6),
    ("08a", CUT[7], L(7, 4), b08a, 0.6), ("08b", L(7, 4), CUT[8], b08b, 0.75),
    ("09", CUT[8], CUT[9], b09, 0.8),
    ("10a", CUT[9], L(9, 5), b10a, 0.45), ("10b", L(9, 5), CUT[10], b10b, 0.6),
    ("11a", CUT[10], L(10, 5), b11a, 0.5), ("11b", L(10, 5), CUT[11], b11b, 0.5),
    ("12", CUT[11], CUT[12], [p12(0), p12(1)], 0.8),
    ("13a", CUT[12], L(12, 8), [p13(0), p13(1)], 0.6), ("13b", L(12, 8), CUT[13], b13b, 0.6),
    ("14", CUT[13], END, b14, 0.6),
]
BY = {b[0]: b for b in BEATS}


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
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(H, "zaw_dog_03.blend"))
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
    # thumbnail plate (guion.md): night living room, he sobs on the sofa with a giant tissue + popcorn, the sad cartoon on
    # the TV behind him; the dog mid-leap toward him, ears flying, a red first-aid box in its mouth, tears streaming back;
    # a big red 3D "!" over the dog.  thumb.py adds "YOU'RE HURT?!"
    out = os.path.join(H, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset(); set_night(True); TV_LIGHT.energy = 90.0
    sob(OWNER, 0.4, "R", 0.25)
    bowl = frustum("popcorn_bowl", 0.11, 0.17, 0.1, (0, 0, 0), mcol("#C8202A"))
    lap = (bone_w(OWNER, "thigh.L", True) + bone_w(OWNER, "thigh.R", True)) / 2
    bowl.location = (lap.x, lap.y + 0.12, lap.z + 0.04)
    rng_ = np.random.default_rng(5)
    for k in range(26):
        b_ = K.box(f"pop{k}", (0.035, 0.035, 0.03), (0, 0, 0), mcol(("#FFF6D8", "#F4E2A0", "#FFFFFF")[k % 3]))
        b_.location = (lap.x + rng_.uniform(-0.12, 0.12), lap.y + 0.12 + rng_.uniform(-0.12, 0.12), lap.z + 0.15 + rng_.uniform(0, 0.05))
        b_.rotation_euler = tuple(rng_.uniform(0, 3, 3))
    tis = K.box("giant_tissue", (0.22, 0.02, 0.26), (0, 0, 0), mcol("#FAFAFA")); fp = face_pt(OWNER, 0.16, -0.06, -0.12)
    tis.location = fp; tis.rotation_euler = (0.2, 0.4, 0.3)
    for o in LR_CT + [o for o in bpy.data.objects if o.name.startswith(("floor_lamp", "lamp_base", "lamp_pole"))]:
        hide(o, True)
    yaw = yaw_to((1.5, 0.75), (0.5, 0.95)) - 0.35                  # leaping toward him, face turned 3/4 to the lens
    dd = dog(0, (1.35, 0.6, 0.3), yaw, "sad", 0.0); dog_walk(0, 0.35, 4.5)
    am = dd["arm"]; D.rot(am, "root", (1, 0, 0), -0.18)                       # mid-leap: nose up, body stretched
    for s_ in "LR":
        D.rot2(am, f"ear.{s_}", [((1, 0, 0), 1.1), ((0, 1, 0), 0.6 * (1 if s_ == "L" else -1))])   # ears flying back
    D.rot(am, "jaw", (1, 0, 0), 0.22)
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg)
    fw = np.array([math.sin(yaw), -math.cos(yaw), 0.0]); nose = Vector(P_[np.argmax(P_ @ fw)])
    kit = K.box("first_aid", (0.2, 0.08, 0.14), (0, 0, 0), mcol("#D21E1E")); kit.location = nose - Vector(fw) * 0.07 + Vector((0, 0, -0.06)); kit.rotation_euler = (0, 0, yaw)
    for k, sz in enumerate(((0.12, 0.085, 0.035), (0.035, 0.085, 0.1))):
        c_ = K.box(f"kit_cross{k}", sz, (0, 0, 0), K.mat_color("kit_w", "#FFFFFF", emit_only=True)); c_.location = kit.location; c_.rotation_euler = (0, 0, yaw)
    hd = dog_head(0); side_ = Vector((-fw[1], fw[0], 0))
    for k in range(8):                                                      # big blue tears streaming back
        for sg in (-1, 1):
            tr_ = K.box(f"dtear{k}{sg}", (0.03, 0.03, 0.05), (0, 0, 0), K.mat_color("dtear_m", "#5AB4FF", emit_only=True))
            tr_.location = hd + side_ * sg * 0.09 - Vector(fw) * (0.06 + 0.07 * k) + Vector((0, 0, -0.06 + 0.012 * k))
            tr_.rotation_euler = (0.4, 0, yaw); tr_.scale = (1 - 0.06 * k,) * 3
    EX = K.Letters3D("excl", "!", size=0.5, front="#E52521", side="#8C0F0F", seed=2, jitter=0.3)
    EX.root.location = (hd.x, hd.y, hd.z + 0.45)
    cpos = (0.85, -1.15, 0.72)
    EX.root.rotation_euler = (math.pi / 2, 0, math.atan2(cpos[0] - hd.x, -(cpos[1] - hd.y))); EX.anim(2.0, 0.0, scale=1.0)
    cam(cpos, (0.85, 0.85, 0.92), 24)
    render(os.path.join(out, "A.png"), (1080, 1920))
elif MODE == "exec":
    exec(open(ARGS[1]).read())

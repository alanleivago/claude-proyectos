"""zaw-dog #1 "Your Dog Can Smell How Late You Are" — Blender scenes + storyboard frames.
/Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- board [beat ...]      one frame per beat -> review/raw/
                                                              -- frames <beat> [step]   every frame of a beat -> review/anim/<beat>/
                                                              -- compare                 our opener frames for ref/compare.jpg
Sets are modelled like the low-poly tutorials (boxes/planes with real thickness, UVs in metres, photo textures
from Flow cut to 128-256 px, Closest): living room + the house front + the street (one continuous set), hallway,
kitchen (night), lab. Camera grammar from ref/CAMERA.md (wide 22-26 mm, pet-eye height, slow push/track, hard cuts)."""
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
box("sofa_base", (2.1, 0.95, 0.36), (0, SOFA_Y, 0.04), FAB, 1.4)
box("sofa_back", (2.1, 0.24, 0.36), (0, SOFA_Y + 0.36, 0.40), FAB, 1.4)
for sx in (-1, 1):
    box(f"sofa_arm{sx}", (0.2, 0.95, 0.30), (sx * 0.95, SOFA_Y, 0.40), FAB, 1.4)
for sx in (-1, 0, 1):
    box(f"cush{sx}", (0.6, 0.66, 0.11), (sx * 0.62, SOFA_Y - 0.1, 0.40), FAB, 1.4)
for i, (x, y) in enumerate(((-0.95, 0.5), (-0.95, 1.95), (0.95, 0.5), (0.95, 1.95))):
    box(f"sofa_leg{i}", (0.06, 0.06, 0.04), (x * 1.0, SOFA_Y - 0.45 + 0.9 * (y > 1), 0), mcol("#2A1E14"))
box("pillow1", (0.36, 0.12, 0.3), (-0.68, SOFA_Y + 0.17, 0.51), mcol("#C8963E")).rotation_euler = (0.25, 0, 0.12)
box("pillow2", (0.36, 0.12, 0.32), (0.72, SOFA_Y + 0.17, 0.51), mcol("#7E8C5E")).rotation_euler = (0.25, 0, -0.1)
box("throw", (0.42, 0.55, 0.03), (0.68, SOFA_Y - 0.08, 0.51), mcol("#9AA3B4")).rotation_euler = (0, 0, 0.08)   # inside the seat
SEAT_Z = 0.51
# rug, coffee table + clutter
box("rug", (2.6, 1.7, 0.012), (0, 0.15, 0), mtex("rug"), 0.42)
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
PP.loft(os.path.join(T, "src", "ball.png"), "ball", height=0.08, sides=8, loc=(-0.9, -1.4, 0))
card("shoes_lr", "sneakers_grey", 0.13, (1.98, -0.2, 0), yaw=-math.pi / 2 + 0.2)
box("magstack", (0.3, 0.24, 0.12), (-1.7, -1.9, 0), mcol("#A8483A"))      # photo: mags (photo_group below)
box("magstack2", (0.28, 0.22, 0.05), (-1.7, -1.9, 0.12), mtex("pic_land")).rotation_euler = (0, 0, 0.2)
box("basket", (0.45, 0.35, 0.3), (-2.15, -2.1, 0), mtex("fabric"), 2.0)
frustum("can_lr", 0.035, 0.035, 0.12, (-0.6, -0.9, 0), mcol("#C8202A"))
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
    me = o.data; me.materials.append(mcut("car_side_cut")); me.materials.append(mcol("#1E2C4A"))
    me.materials.append(mcol("#2E3E52")); me.materials.append(mcol("#26364C"))      # 2 = glass (wind/rear screen), 3 = roof/hood (lighter)
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
    bump = mcol("#2C3440")
    kids.append(K.box(name + "_bump_f", (0.2, Wd + 0.04, 0.2), (-L / 2 + 0.06, 0, 0.36), bump))
    kids.append(K.box(name + "_bump_r", (0.2, Wd + 0.04, 0.2), (L / 2 - 0.06, 0, 0.42), bump))
    for sg in (-1, 1):
        kids.append(K.box(f"{name}_hl{sg}", (0.08, 0.32, 0.12), (-L / 2 + 0.05, sg * 0.62, 0.62), K.mat_color(f"{name}_hlm", "#FFF6D8", emit_only=True)))
        kids.append(K.box(f"{name}_tl{sg}", (0.08, 0.34, 0.14), (L / 2 - 0.05, sg * 0.6, 0.72), K.mat_color(f"{name}_tlm", "#C81818", emit_only=True)))
        kids.append(K.box(f"{name}_mir{sg}", (0.1, 0.14, 0.09), (gx0 - 0.05, sg * (Wd / 2 + 0.1), gz0 + 0.02), mcol("#1E2C4A")))
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
box("runner", (0.8, 4.6, 0.012), (HX, -0.4, 0), mtex("rug"), 0.42)
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

# ===== KITCHEN at night (x 38..42, y -2..2)
KX = 40.0
box("k_floor", (4.2, 4.2, 0.06), (KX, 0, -0.06), mtex("checker"), 1.0)
K.box("k_ceil", (4.2, 4.2, 0.08), (KX, 0, LH + 0.04), CEIL)
KWALL = mat_wall("wall_kitchen", top=0.12, bottom=0.08)
wall("k_wb", "y", 2.06, KX - 2.1, KX + 2.1, 0, LH, [(KX - 0.2, KX + 0.8, 1.25, 1.95)], KWALL)
wall("k_wl", "x", KX - 2.06, -2.1, 2.1, 0, LH, [(-1.2, -0.3, 0, 2.05)], KWALL)
wall("k_wr", "x", KX + 2.06, -2.1, 2.1, 0, LH, [], KWALL)
wall("k_wf", "y", -2.06, KX - 2.1, KX + 2.1, 0, LH, [], KWALL)
front_box("k_base1", "cabinets", (1.6, 0.6, 0.86), (KX - 1.2, 1.7, 0), 0.0, "#EDEDE8", (0, 0, 1, 0.5))
front_box("k_stove", "stove", (0.7, 0.6, 0.9), (KX - 0.05, 1.7, 0), 0.0, "#B8B8B4")
front_box("k_base2", "cabinets", (1.2, 0.6, 0.86), (KX + 0.9, 1.7, 0), 0.0, "#EDEDE8", (0, 0, 0.75, 0.5))
box("k_top1", (1.66, 0.64, 0.05), (KX - 1.2, 1.68, 0.86), mtex("concrete"), 1.5)       # counter tops: stone photo tile
box("k_top2", (1.26, 0.64, 0.05), (KX + 0.9, 1.68, 0.86), mtex("concrete"), 1.5)
front_box("k_upper", "cabinets", (1.4, 0.35, 0.75), (KX - 1.25, 1.85, 1.5), 0.0, "#EDEDE8", (0, 0.5, 1, 1))
front_box("k_fridge", "fridge", (0.75, 0.7, 1.85), (KX + 1.75, 1.6, 0), 0.0, "#E8E8E4")
K.plane("k_night", 3.0, 3.0 * 144 / 256, (KX + 0.3, 4.5, 1.6), mat=K.mat_image("m_night", img("street_night"), emit_only=True))
box("k_wsill", (1.1, 0.2, 0.04), (KX + 0.3, 1.98, 1.22), TRIM)
frustum("k_lamp", 0.28, 0.14, 0.12, (KX, 0.2, LH - 0.12), K.mat_color("k_lampm", "#FFE7A8", emit_only=True))
box("k_table", (1.0, 0.7, 0.04), (KX + 1.3, -1.25, 0.72), CT, 2.0)
for i, (x, y) in enumerate(((-0.45, -0.3), (0.45, -0.3), (-0.45, 0.3), (0.45, 0.3))):
    box(f"k_tleg{i}", (0.05, 0.05, 0.72), (KX + 1.3 + x, -1.25 + y, 0), mcol("#5C3A20"))
card("k_bag1", "bag_paper", 0.42, (KX - 1.3, 1.6, 0.91), yaw=0.15)
for i, (n_, x_, y_, h_) in enumerate((("g_pineapple", -1.75, 1.45, 0.34), ("g_bananas", -1.55, 1.42, 0.12), ("g_cola", -0.6, 1.45, 0.33),
                                     ("g_milk", 0.55, 1.5, 0.25), ("g_cereal", 0.8, 1.6, 0.3), ("g_bread", 1.05, 1.45, 0.12),
                                     ("g_wine", 0.38, 1.62, 0.32), ("g_eggs", -1.05, 1.4, 0.08), ("g_steak", 0.25, 1.4, 0.06))):
    card(f"k_{n_}", n_, h_, (KX + x_, y_, 0.91), yaw=0.1 * ((i % 3) - 1))
card("k_bag2", "bag_plastic", 0.36, (KX - 0.85, 1.55, 0.91), yaw=-0.1)
card("k_bowl", "dog_bowl", 0.09, (KX - 1.6, -0.9, 0), yaw=0.3)
for i, (x, c, hgt) in enumerate(((KX - 1.75, "#C8202A", 0.13), (KX - 1.62, "#C8202A", 0.13), (KX + 0.55, "#2A6A3A", 0.3), (KX + 0.75, "#E8D24A", 0.22))):
    frustum(f"k_can{i}", 0.035 if hgt < 0.2 else 0.05, 0.035 if hgt < 0.2 else 0.03, hgt, (x, 1.55, 0.91), mcol(c))
box("k_board", (0.4, 0.26, 0.02), (KX - 0.95, 1.5, 0.91), CT, 2.0)
frame_pic("k_pic", "pic_family", 0.45, (KX - 2.0 + 0.01, 0.6, 1.5), math.pi / 2)        # kitchen easter egg

# ===== LAB (x -22..-18, y -2..2)
BX = -20.0
box("b_floor", (4.2, 4.2, 0.06), (BX, 0, -0.06), K.mat_image("m_bt", K.tex_tiles("lab_t", 64, 4, "#E6E8EA", "#CDD2D6", "#9AA0A4")), 0.5)
K.box("b_ceil", (4.2, 4.2, 0.08), (BX, 0, LH + 0.04), CEIL)
BW = mat_wall("wall_lab", top=0.12, bottom=0.08)
wall("b_wb", "y", 2.06, BX - 2.1, BX + 2.1, 0, LH, [], BW)
wall("b_wl", "x", BX - 2.06, -2.1, 2.1, 0, LH, [], BW)
wall("b_wr", "x", BX + 2.06, -2.1, 2.1, 0, LH, [], BW)
box("b_band", (4.1, 0.03, 0.9), (BX, 2.0, 0), mcol("#9EB8C0"))
K.plane("b_sign", 1.3, 0.325, (BX - 0.2, 1.98, 2.17), mat=mtex("lab_sign"))
box("b_bench", (1.8, 0.7, 0.05), (BX + 0.9, 1.6, 0.9), mcol("#E8E8E4"))
front_box("b_bench_c", "cabinets", (1.8, 0.66, 0.9), (BX + 0.9, 1.62, 0), 0.0, "#EDEDE8", (0, 0, 1, 0.5))
card("microscope", "microscope", 0.34, (BX + 0.62, 1.55, 0.95), yaw=0.2)         # below the graph, not over it
for i, c in enumerate(("#E04444", "#44AA88", "#4488CC")):
    pass
card("flasks", "flasks", 0.2, (BX + 1.2, 1.6, 0.95), yaw=0.1)
card("stool", "stool", 0.75, (BX - 1.2, 1.1, 0), yaw=0.15)
K.plane("whiteboard", 0.8, 0.55, (BX + 0.45, 1.975, 1.6), mat=mtex("whiteboard"))       # 2.5 cm off the wall (was coplanar: z-fight)
box("wb_tray", (0.8, 0.05, 0.02), (BX + 0.45, 1.95, 1.3), mcol("#9A9EA2"))
# lab dressing (QA: the lab was bare): door on the left wall, dog crate, poster, ceiling light panels, treats jar
front_box("b_door", "door_green", (0.9, 0.05, 2.05), (BX - 2.0, -0.9, 0), math.pi / 2, "#1F3A2C")
for nm, size, loc in [("bdf_a", (0.06, 0.07, 2.1), (BX - 2.0, -1.38, 0)), ("bdf_b", (0.06, 0.07, 2.1), (BX - 2.0, -0.42, 0)),
                      ("bdf_t", (0.06, 1.03, 0.07), (BX - 2.0, -0.9, 2.05))]:
    box(nm, size, loc, TRIM)
CRATE = mcol("#4A4E56")
box("crate_floor", (0.8, 0.55, 0.03), (BX - 1.45, -1.55, 0), mcol("#2E3036"))
for nm, loc, yaw, w_ in (("crate_f", (BX - 1.45, -1.83, 0.03), 0.0, 0.8), ("crate_b", (BX - 1.45, -1.27, 0.03), math.pi, 0.8),
                         ("crate_l", (BX - 1.85, -1.55, 0.03), -math.pi / 2, 0.56), ("crate_r", (BX - 1.05, -1.55, 0.03), math.pi / 2, 0.56)):
    card(nm, "crate", 0.56, loc, yaw=yaw, w=w_)                          # the wire crate photo (see-through cut-out)
box("crate_top", (0.82, 0.57, 0.02), (BX - 1.45, -1.55, 0.59), CRATE)
frame_pic("b_pic_clock", "pic_meme2", 0.22, (BX + 1.35, 1.99, 1.43), 0.0)          # under the lab clock (no bare wall)
frame_pic("b_poster", "pic_meme3", 0.55, (BX + 2.0 - 0.01, 0.3, 1.5), -math.pi / 2)
frame_pic("b_poster2", "pic_meme4", 0.4, (BX - 2.0 + 0.01, 0.75, 1.5), math.pi / 2)
for i, y_ in enumerate((-0.9, 0.9)):
    box(f"b_light{i}", (1.2, 0.3, 0.03), (BX, y_, LH - 0.03), K.mat_color(f"b_lightm{i}", "#F4F8FF", emit_only=True))
PP.loft(os.path.join(T, "src", "jar.png"), "b_jar", height=0.16, sides=8, loc=(BX + 1.55, 1.5, 0.95))
K.plane("b_clip", 0.22, 0.3, (BX + 0.25, 1.45, 0.957), rot=(0, 0, 0.25), mat=mcut("clipboard"))
LAB_CLOCK = (BX + 1.35, 1.99, 1.9)
prism("b_clock", 0.3, 0.05, LAB_CLOCK, 0.0, "clock_face", side="#2A2A2A")
B_HH = box("b_hh", (0.03, 0.015, 0.16), (0, 0, 0), mcol("#141414")); B_HH.data.transform(__import__("mathutils").Matrix.Translation((0, 0, -0.01)))
B_HH.location = (LAB_CLOCK[0], LAB_CLOCK[1] - 0.035, LAB_CLOCK[2]); B_HH.rotation_euler = (0, math.radians(-120), 0)
B_SH = box("b_sh", (0.008, 0.01, 0.26), (0, 0, 0), mcol("#C81818")); B_SH.data.transform(__import__("mathutils").Matrix.Translation((0, 0, 0.04)))
B_SH.location = (LAB_CLOCK[0], LAB_CLOCK[1] - 0.05, LAB_CLOCK[2]); B_SH.rotation_euler = (0, math.radians(200), 0)
frustum("b_pin", 0.02, 0.02, 0.012, (LAB_CLOCK[0], LAB_CLOCK[1] - 0.05, LAB_CLOCK[2]), mcol("#141414")).rotation_euler = (math.pi / 2, 0, 0)
card("b_plantc", "plant", 0.9, (BX + 1.7, -1.5, 0.0), yaw=0.4)

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
            "sofa_front", (0, 0), (1, 0), -1.06, 1.06, 0.0, 0.78)
photo_group(["st_top"] + [f"st_leg{i}" for i in range(4)], "side_table", (-1.6, 1.6), (1, 0), -0.26, 0.26, 0.0, 0.6)
photo_group(["ct_top", "ct_shelf"] + [f"ct_leg{i}" for i in range(4)], "side_table", (0, 0.15), (1, 0), -0.56, 0.56, 0.0, 0.45)
photo_group(["h_table_top", "h_table_dr", "h_table_kn"] + [f"h_table_leg{i}" for i in range(4)], "side_table",
            (HX - HW + 0.18, 0.15), (0, 1), -0.29, 0.29, 0.0, 0.75)
photo_group(["books"], "books", (-1.32, 0), (1, 0), -0.12, 0.12, 1.58, 1.82)
photo_group(["pillow1"], "pillow_y", (-0.68, 0), (1, 0), -0.2, 0.2, 0.47, 0.84)
photo_group(["pillow2"], "pillow_g", (0.72, 0), (1, 0), -0.2, 0.2, 0.47, 0.86)
photo_group(["dogbed", "dogbed_c"], "dogbed", (1.75, 0), (1, 0), -0.49, 0.49, 0.0, 0.2)
photo_group(["magstack"], "mags", (-1.7, 0), (1, 0), -0.16, 0.16, 0.0, 0.13)
photo_group(["basket"], "basket", (-2.15, 0), (1, 0), -0.23, 0.23, 0.0, 0.31)
photo_group(["h_radiator"] + [f"h_rad_fin{i}" for i in range(7)], "radiator", (0, -1.9), (0, -1), -0.37, 0.37, 0.14, 0.66)
photo_group(["k_table"] + [f"k_tleg{i}" for i in range(4)], "side_table", (KX + 1.3, -1.25), (1, 0), -0.52, 0.52, 0.0, 0.76)


def hide(o, h=True):
    o.hide_render = h; o.hide_viewport = h


# ---------------------------------------------------------------- scent (v2, user: the puffs were ugly and drowned the shots)
# Cartoon smell grammar (Pepé Le Pew / Tom & Jerry food smells, "stink lines" in games): a few THIN wavy wisps rising
# from the smelly thing, a soft trail that snakes along the floor toward the nose, and tiny drifting motes.
# Pale cream-yellow, 15-40 % opacity, faded at both ends, only on the sources - never in front of the dog.
def scent_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission")
    e.inputs[0].default_value = (*K.srgb("#FBF0B4"), 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader")
    uv = nt.nodes.new("ShaderNodeUVMap"); sp = nt.nodes.new("ShaderNodeSeparateXYZ"); nt.links.new(uv.outputs[0], sp.inputs[0])
    m1 = nt.nodes.new("ShaderNodeMath"); m1.operation = "MULTIPLY"; m1.inputs[1].default_value = math.pi; nt.links.new(sp.outputs[1], m1.inputs[0])
    sn = nt.nodes.new("ShaderNodeMath"); sn.operation = "SINE"; nt.links.new(m1.outputs[0], sn.inputs[0])
    v = nt.nodes.new("ShaderNodeValue"); v.name = "A"; v.outputs[0].default_value = 0.3
    m2 = nt.nodes.new("ShaderNodeMath"); m2.operation = "MULTIPLY"; nt.links.new(sn.outputs[0], m2.inputs[0]); nt.links.new(v.outputs[0], m2.inputs[1])
    nt.links.new(m2.outputs[0], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2])
    nt.links.new(mx.outputs[0], out.inputs[0])
    m.surface_render_method = "BLENDED"; m.use_backface_culling = False
    return m


def tube(pts, r):
    """3-sided tube along pts; uv.y runs 0..1 along the length (the material fades both ends)."""
    vs, fs, uvs = [], [], []
    n = len(pts)
    for i, p in enumerate(pts):
        d = (Vector(pts[min(i + 1, n - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        a = d.orthogonal().normalized(); b = d.cross(a)
        rr = r * (0.4 + 0.6 * math.sin(math.pi * i / (n - 1)))
        for k in range(3):
            th = 2 * math.pi * k / 3
            vs.append(tuple(Vector(p) + (a * math.cos(th) + b * math.sin(th)) * rr)); uvs.append((k / 3, i / (n - 1)))
    for i in range(n - 1):
        for k in range(3):
            fs.append((i * 3 + k, i * 3 + (k + 1) % 3, (i + 1) * 3 + (k + 1) % 3, (i + 1) * 3 + k))
    return vs, fs, uvs


class Scent:
    """wisps: [(base xyz, height, phase)] rising S-curves; trails: [list of xyz] floor paths; motes around the wisps."""
    def __init__(self, name, wisps=(), trails=(), motes=0, seed=1, r=0.021):
        self.name, self.wisps, self.trails, self.r = name, list(wisps), list(trails), r
        self.mat = scent_mat(name); self.objs = []
        for i in range(len(self.wisps) + len(self.trails)):
            me = bpy.data.meshes.new(f"{name}{i}"); me.materials.append(self.mat)
            self.objs.append(K.link(bpy.data.objects.new(f"{name}{i}", me)))
        rng = random.Random(seed); self.motes = []
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.011)
        mm = bpy.data.meshes.new(name + "_mote"); bm.to_mesh(mm); bm.free(); mm.materials.append(K.mat_color(name + "_motem", "#FFF6C8", emit_only=True))
        for i in range(motes):
            w = self.wisps[i % len(self.wisps)] if self.wisps else (self.trails[0][0], 0.4, 0)
            o = K.link(bpy.data.objects.new(f"{name}_m{i}", mm))
            o["b"] = [w[0][0] + rng.uniform(-0.25, 0.25), w[0][1] + rng.uniform(-0.2, 0.2), w[0][2] + rng.uniform(0, w[1])]
            o["ph"] = rng.random(); self.motes.append(o)
        self.density(0)

    def density(self, k, alpha=0.3, t=0.0):
        on = k > 0.01; self.mat.node_tree.nodes["A"].outputs[0].default_value = min(0.62, alpha * 1.9) * min(1.0, k + 0.2)
        nw = max(1, round(len(self.wisps) * min(1.0, k))) if on else 0
        for i, (b, hgt, ph) in enumerate(self.wisps):
            o = self.objs[i]; hide(o, i >= nw)
            if i < nw:
                pts = [(b[0] + 0.05 * math.sin(7 * s * hgt + 2.2 * t + ph) * (0.3 + s), b[1] + 0.03 * math.cos(5 * s * hgt + 1.7 * t + ph),
                        b[2] + s * hgt) for s in [j / 13 for j in range(14)]]
                self._set(o, pts)
        for j, path in enumerate(self.trails):
            o = self.objs[len(self.wisps) + j]; hide(o, not on)
            if on:
                pts = [(p[0], p[1], p[2] + 0.03 * math.sin(3 * i + 2 * t)) for i, p in enumerate(path)]
                self._set(o, pts, self.r * 0.8)
        for i, o in enumerate(self.motes):
            hide(o, not on or i >= round(len(self.motes) * k))
            b = o["b"]; u = (o["ph"] + 0.12 * t) % 1.0
            o.location = (b[0] + 0.03 * math.sin(2 * t + 6 * o["ph"]), b[1], b[2] + 0.25 * u)
            s_ = math.sin(math.pi * u); o.scale = (s_, s_, s_)

    def _set(self, o, pts, r=None):
        vs, fs, uvs = tube(pts, r or self.r); me = o.data; me.clear_geometry(); me.from_pydata(vs, [], fs)
        uvl = me.uv_layers.new() if not me.uv_layers else me.uv_layers[0]
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices):
                uvl.data[li].uv = uvs[vi]
        me.update()

    def hide_all(self):
        self.density(0)


def path(*pts, n=14):
    """smooth floor path through control points (Catmull-ish by linear + sine wobble)."""
    out = []
    for i in range(n):
        u = i / (n - 1) * (len(pts) - 1); k = min(int(u), len(pts) - 2); f = u - k
        a, b = Vector(pts[k]), Vector(pts[k + 1]); p = a.lerp(b, f)
        out.append((p.x + 0.06 * math.sin(i * 1.3), p.y, p.z))
    return out


# sofa: wisps off the cushions where the owner sat; the room: a trail from the sofa round the rug to the door + shoes
HZ_SOFA = Scent("sc_sofa", wisps=[((-0.6, 1.35, 0.52), 0.55, 0.0), ((0.05, 1.3, 0.52), 0.7, 1.3), ((0.65, 1.35, 0.52), 0.5, 2.1),
                                   ((-0.3, 1.25, 0.52), 0.45, 4.0), ((0.35, 1.28, 0.52), 0.6, 5.1),
                                   ((-0.75, SOFA_Y + 0.15, 0.68), 0.4, 3.0)], motes=10, seed=3)
HZ_ROOM = Scent("sc_room", wisps=[((1.95, -0.2, 0.1), 0.5, 0.4), ((2.05, -0.1, 0.1), 0.38, 2.4), ((LX1 - 0.1, -1.65, 0.9), 0.6, 1.0),
                                   ((-1.6, 1.6, 0.62), 0.4, 3.3)],
                trails=[path((-0.9, 1.0, 0.12), (-1.6, 0.0, 0.1), (-1.0, -1.5, 0.1), (1.0, -1.9, 0.1), (2.3, -1.65, 0.12), n=22)], motes=14, seed=4)
HZ_HALL = Scent("sc_hall", wisps=[((HX + 0.25, 2.2, 0.1), 0.5, 0.2), ((HX + HW - 0.25, 1.75, 0.5), 0.45, 1.5), ((HX - HW + 0.18, 1.95, 1.0), 0.6, 2.5),
                                   ((HX - 0.1, 2.35, 0.9), 0.55, 0.8)],
                trails=[path((HX - 0.2, -2.6, 0.1), (HX + 0.15, -1.0, 0.1), (HX - 0.15, 0.6, 0.1), (HX + 0.1, 2.3, 0.15), n=22)], motes=12, seed=5)
# split top: thick wisps right round the happy dog (strong = you just left)
HZ_TOP = Scent("sc_top", wisps=[((-0.15, -0.45, 0.02), 0.6, 0.3), ((0.85, -0.35, 0.02), 0.55, 1.7), ((0.2, 0.15, 0.02), 0.5, 2.9),
                                 ((0.65, 0.2, 0.02), 0.65, 4.2), ((-0.35, -0.95, 0.02), 0.45, 5.0)],      # beside/behind the dog, never over it
               trails=[path((-0.6, 0.6, 0.06), (-0.45, -0.1, 0.06), (-0.3, -0.7, 0.1), (-0.12, -0.8, 0.3), n=18)], motes=12, seed=9)
# the lab clock: its minute hand is a scent wisp, from the centre toward 1 o'clock, fading out
HZ_CLOCK = Scent("sc_clock", trails=[[(LAB_CLOCK[0] + rr * math.sin(math.radians(35)) + 0.012 * math.sin(rr * 40), LAB_CLOCK[1] - 0.06,
                                       LAB_CLOCK[2] + rr * math.cos(math.radians(35))) for rr in [0.01 + 0.02 * i for i in range(12)]]],
                 motes=0, r=0.02)

# ---------------------------------------------------------------- characters
DOGS = []


for i in range(3):
    o, arm, fn = D.build()
    mv = K.link(bpy.data.objects.new(f"mover{i}", None)); arm.parent = mv
    sh = D.blob_shadow(mv)
    DOGS.append(dict(o=o, arm=arm, fn=fn, mv=mv, sh=sh))
PEOPLE = os.path.join(T, "people")
import people3d as P3  # noqa: E402
OWNER_SPEC = dict(skin=(196, 146, 122), hair=(40, 29, 22), top=(238, 238, 234), bottom=(62, 92, 140), waist_z=1.0, sleeve_z=1.24,
                  collar=True, belt=(58, 40, 28), shoe=(238, 238, 238), sole=(196, 198, 204))
FRIEND_SPEC = dict(skin=(214, 166, 144), hair=(178, 80, 36), hair_vol=1.14, hairline=0.42, top=(44, 96, 64), bottom=(192, 150, 60), waist_z=1.0, sleeve_z=0.0,
                   cuff=True, shoe=(112, 72, 42), sole=(40, 28, 20), shoe_h=0.14, scale=(1.1, 0.93), head_w=1.04,
                   radii={"pelvis": (0.17, 0.115), "waist": (0.155, 0.105), "chest": (0.17, 0.115), "upchest": (0.15, 0.10)})
SCI_SPEC = dict(skin=(150, 100, 74), hair=(176, 176, 172), hair_vol=1.05, hairline=0.45, top=(242, 242, 238), bottom=(56, 60, 70),
                waist_z=1.0, sleeve_z=0.0, collar=True, coat_z=0.6, shoe=(52, 40, 32), sole=(28, 26, 24),
                scale=(1.02, 0.98))                                # the dog scientist: white lab coat to the knees, blue shirt
import photohuman as PH  # noqa: E402
# people v3 (user: build humans ENTIRELY from photos, VLVT guide): Flow front/side/back A-pose sheets -> lofted blocks
# with the photos projected (photohuman.py); the old skin-modifier people (people3d.py) are kept for reference only
OWNER = PH.PhotoPerson("owner")
FRIEND = PH.PhotoPerson("friend")                                  # a different person: shorter, stouter, own face
SCI = PH.PhotoPerson("sci")
TSHIRT = card("tshirt_held", "tshirt", 0.55, (0, -30, 0))
BAG_A = card("bag_held_a", "bag_paper", 0.42, (0, -30, 0)); BAG_B = card("bag_held_b", "bag_plastic", 0.38, (0, -30, 0))
QMARK = K.Letters3D("qmark", "?", size=0.9, front="#E52521", side="#8C0F0F", seed=4, jitter=0.4)
QCLOCK = prism("qclock", 0.45, 0.06, (0, -30, 0), 0.0, "clock_face", side="#B01818")

CAM = K.camera("Cam", 24)
K.ps1_snap(CAM, grid_h=300)
# flicker fix: the vertex snap made every static wall/rug/decal jump in 8 px steps on slow moves and broke the depth of
# coplanar-ish layers (z-fight). Static sets render unsnapped; only the characters keep the PS1 wobble (finer grid).
_SNAP = {d["o"].name for d in DOGS} | {o.name for P_ in (OWNER, FRIEND, SCI) for o in P_.parts}
for o in bpy.data.objects:
    if o.type == "MESH" and o.name not in _SNAP and o.modifiers.get("ps1"):
        o.modifiers.remove(o.modifiers["ps1"])
# flicker fix 2: big tiled surfaces seen at grazing angles (floors, rugs, lawn, road, brick) shimmered with Closest
# sampling (no mip-maps). They sample Linear (mip-mapped, like Zaw's bilinear textures); props/faces/pictures stay Closest.
_GRAZE = ("floor_wood", "rug", "checker", "lab_t", "grass", "asphalt", "concrete", "brick", "doormat", "fabric", "wall_kitchen", "roof")   # + ceilings (radial aliasing)
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE" and n.image and n.image.name.split(".")[0] in _GRAZE:
                n.interpolation = "Linear"
sc.eevee.taa_render_samples = 16                                  # thin rods/frames: steadier anti-aliasing


# ---------------------------------------------------------------- helpers per frame

def h_show(r, on, loc=None, yaw=0.0):
    r.show(on, loc, yaw)


def h_rest(r):
    r.rest()


def h_walk(r, t, speed=1.0, amp=1.0):
    r.walk(t * speed, amp)


def h_carry(r):
    """arms down and slightly out, the bags hang from the hands."""
    for side, sg in (("L", 1), ("R", -1)):
        r.rot(f"upperarm.{side}", [((1, 0, 0), -0.1), ((0, 1, 0), -0.22 * sg)])
        r.rot(f"forearm.{side}", [((1, 0, 0), -0.25)])
    for bag, side in zip((BAG_A, BAG_B), "LR"):
        hx, hy, hz = r.hand_pos(side)
        hide(bag, False); bag.location = (hx, hy, hz - 0.36); bag.rotation_euler = (math.pi / 2, 0, r.root.rotation_euler.z)


def h_flap(r, t):
    """the second person waving the owner's sweaty t-shirt overhead."""
    r.rot("upperarm.R", [((1, 0, 0), -2.55 + 0.25 * math.sin(9 * t)), ((0, 1, 0), 0.5)])
    r.rot("forearm.R", [((1, 0, 0), -0.3 - 0.35 * math.sin(9 * t + 1))])
    r.rot("upperarm.L", [((1, 0, 0), -0.5), ((0, 1, 0), -0.2)])
    r.rot("forearm.L", [((1, 0, 0), -1.2)])
    hx, hy, hz = r.hand_pos("R")
    z = r.root.rotation_euler.z; side = Vector((-math.cos(z), -math.sin(z), 0))       # her right, in world
    hide(TSHIRT, False); TSHIRT.location = Vector((hx, hy, hz - 0.2)) + side * 0.06        # hangs from the fist by its collar
    TSHIRT.rotation_euler = (math.pi / 2, math.radians(30 * math.sin(9 * t)), z)


def dog(i, loc, yaw, expr="neutral", t=0.0, prev=None, a=1.0):
    d = DOGS[i]
    for k in ("o", "sh"):
        hide(d[k], False)
    d["mv"].location = loc; d["mv"].rotation_euler = (0, 0, yaw)
    D.rest(d["arm"]); D.set_face(d["fn"], expr); D.expr_pose(d["arm"], expr, t, prev=prev, a=a)
    return d


def happy_wag(arm, t, amp=1.0, hz=4.4, up=0.25):
    """v2 dog: the dynamic wag (overlap down tail1-3, hips wiggling) lives in dog.py."""
    D.happy_wag(arm, t, amp, hz, up=0.25)


def dog_lie(i):
    """flat on the floor: hips + chest sink, the IK paws stay planted and slide forward (front) / back (hind)."""
    arm = DOGS[i]["arm"]
    D.move(arm, "hips", (0, 0.04, -0.2))
    D.rot(arm, "hips", (1, 0, 0), 0.06)                           # chest dips a little lower than the rump
    for s, sx in (("L", 1), ("R", -1)):
        D.move(arm, f"ik_f.{s}", (0.02 * sx, -0.27, 0.0)); D.move(arm, f"ik_h.{s}", (0.05 * sx, -0.06, 0.0))


def dog_head(i):
    d = DOGS[i]; bpy.context.view_layer.update()
    pb = d["arm"].pose.bones["head"]
    return d["arm"].matrix_world @ pb.tail


def cam(pos, target, lens=24, roll=0.0):
    CAM.data.lens = lens; K.look(CAM, pos, target, roll); K.ps1_snap_update(CAM)
    if not TSHIRT.hide_render:                                    # the waved t-shirt always shows its face to the lens
        o = TSHIRT.location; TSHIRT.rotation_euler.z = math.atan2(pos[0] - o.x, -(pos[1] - o.y))


def lerpv(a, b, u):
    return tuple(x + (y - x) * u for x, y in zip(a, b))


def reset():
    for d in DOGS:
        hide(d["o"], True); hide(d["sh"], True)
    h_show(OWNER, False); h_show(FRIEND, False); h_show(SCI, False); h_rest(OWNER); h_rest(FRIEND); h_rest(SCI)
    for o in (TSHIRT, BAG_A, BAG_B, QCLOCK):
        hide(o, True)
    QMARK.hide(); DOOR_PIV.rotation_euler = (0, 0, 0)
    for hz in (HZ_SOFA, HZ_ROOM, HZ_HALL, HZ_CLOCK, HZ_TOP):
        hz.density(0)
    CAR.location = (60, 10.6, -0.04); CAR.rotation_euler = (0, 0, 0)
    for n_ in ("tv", "tv_cab"):
        hide(bpy.data.objects[n_], False)
    for o in RACK:
        hide(o, False)
    set_clock(4, 50)


# ---------------------------------------------------------------- beats (t = s into the beat, d = beat length)
# dog on the sofa looking out: mover on the seat, facing +Y (yaw pi)
SOFA_DOG = (0.0, 1.49, SEAT_Z)            # v2 dog is longer: all four paws on the seat cushions (y 1.02..1.68)


YIP_T = 1.05                                                     # the opening yip (sound/mix_zaw.py cue at 1.046 s)


def yip(t):
    """0..1 pulse around the yip: quick head jerk + open jaw."""
    return math.exp(-((t - YIP_T - 0.05) / 0.07) ** 2)


def b01a(t, d, loop=False):   # behind the dog's head at the window; the owner's car pulls away (left); the dog yips at it
    dog(0, SOFA_DOG, math.pi, "neutral", t)
    k = yip(t) if not loop else 0.0
    e = K.ease(t / 1.7)
    turn = -0.45 + 0.95 * e                                       # follows the car right -> left: the profile shows
    D.rot2(DOGS[0]["arm"], "head", [((0, 0, 1), turn), ((1, 0, 0), 0.03 * math.sin(3 * t) - 0.25 * k)])
    D.rot(DOGS[0]["arm"], "jaw", (1, 0, 0), 0.32 * k)
    D.rot2(DOGS[0]["arm"], "neck", [((0, 0, 1), -0.15 + 0.4 * e), ((1, 0, 0), -0.1 * k)])
    CAR.location = (2.0 - 3.4 * t, 10.6, -0.04)
    u = K.ease(t / d)
    cam(lerpv((0.07, 0.34, 1.53), (-0.01, 0.56, 1.48), u), lerpv((0.3, 9.0, 1.08), (-0.3, 9.0, 1.0), u), 29)


def b01b(t, d):   # outside: square to the brick wall, hold then slow push to the dog in the window
    dog(0, SOFA_DOG, math.pi, "neutral", t)
    for n_ in ("tv", "tv_cab"):                                   # QA: the black TV read as a card behind the dog's head
        hide(bpy.data.objects[n_], True)
    u = K.ease(max(0, t - 0.2) / (d - 0.2))
    cam(lerpv((0.0, 5.0, 1.55), (0.0, 3.35, 1.5), u), (0.0, 2.0, 1.42), 26)


def b02a(t, d):   # ECU on the dog's nose, front 3/4 from the window side: twitching, side-eye
    dog(0, SOFA_DOG, math.pi, "judging", t)
    D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), -0.1 + 0.035 * math.sin(16 * t)), ((0, 0, 1), 0.25)])
    hp = Vector(dog_head(0)); u = K.ease(t / d)
    cam(lerpv((hp.x - 0.3, hp.y + 0.36, hp.z + 0.02), (hp.x - 0.26, hp.y + 0.3, hp.z + 0.01), u), (hp.x + 0.02, hp.y - 0.02, hp.z - 0.06), 24, roll=math.radians(4))


def b02(t, d):    # over the dog's shoulder: red "?" in clear sky above the far car turns into a clock
    dog(0, SOFA_DOG, math.pi, "judging", t)
    D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), -0.12 + 0.03 * math.sin(14 * t))])      # sniffing
    CAR.location = (-3.2, 10.6, -0.04)
    hp = Vector(dog_head(0))
    u = K.ease(t / d)
    cp = lerpv((hp.x + 0.62, hp.y - 0.62, hp.z + 0.08), (hp.x + 0.55, hp.y - 0.55, hp.z + 0.07), u)
    a = math.radians(123); cam(cp, (cp[0] + 3 * math.cos(a), cp[1] + 3 * math.sin(a), hp.z + 0.1), 24)
    q = Vector((-3.6, 10.6, 4.3)); yaw = math.atan2(cp[0] - q.x, -(cp[1] - q.y))      # above the roofline, faces the camera
    if t < d * 0.55:
        QMARK.root.location = q; QMARK.root.rotation_euler = (math.pi / 2, 0, yaw); QMARK.anim(t, 0.05, scale=1.6)
    else:
        hide(QCLOCK, False); QCLOCK.location = q + Vector((0, 0, 0.55)); QCLOCK.rotation_euler = (0, 0, yaw)
        s = min(1.0, (t - d * 0.55) / 0.15) * 1.5; QCLOCK.scale = (s, s, s)


def b03a(t, d):   # dog's-nose view, low, slow track across the sofa: scent wisps off the cushions
    HZ_SOFA.density(1.0, 0.3, t); HZ_ROOM.density(0.35, 0.18, t)
    u = K.ease(t / d)
    cam(lerpv((1.45, -1.15, 0.5), (1.1, -0.95, 0.5), u), lerpv((-0.6, 1.5, 0.55), (-0.2, 1.5, 0.55), u), 22)


def b03b(t, d):   # hallway dolly at dog height toward the front door; the trail thins
    k = 1.0 - 0.75 * (t / d)
    HZ_HALL.density(1.0, 0.32 * k + 0.05, t)
    u = K.ease(t / d)
    cam(lerpv((HX, -2.9, 0.55), (HX, -1.0, 0.6), u), (HX, 2.5, 0.75), 22)


SCI_AT = (BX - 0.3, 1.2, 0)


def b04a(t, d):   # lab: the dog scientist in his lab coat points at the SMELL vs TIME graph under the BARNARD DOG LAB sign
    h_show(SCI, True, SCI_AT, math.radians(-8))
    k = K.ease(min(1.0, t / 0.45))
    SCI.rot("upperarm.L", [((1, 0, 0), -0.55 * k), ((0, 1, 0), -1.1 * k)])                 # points at the fading curve
    SCI.rot("forearm.L", [((1, 0, 0), -0.2 * k - 0.08 * math.sin(7 * t) * k)])
    SCI.rot("upperarm.R", [((0, 1, 0), 0.06)]); SCI.rot("forearm.R", [((1, 0, 0), -0.15)])                       # relaxed
    SCI.rot("neck", [((0, 0, 1), -0.12 + 0.1 * K.ease(min(1.0, t / 0.8))), ((1, 0, 0), 0.04)])
    u = K.ease(t / d)
    cam(lerpv((BX + 0.25, -1.55, 1.32), (BX + 0.12, -0.95, 1.3), u), (BX - 0.05, 1.6, 1.42), 24)


def b04b(t, d):   # ECU of the lab wall clock: its minute hand is a fading scent trail; the second hand ticks
    HZ_CLOCK.density(1.0, 0.55, t)
    B_SH.rotation_euler = (0, math.radians(200 + 6 * math.floor(t + 0.3)), 0)
    u = K.ease(min(1.0, t / 0.7))                                                   # punch-in, then hold on the tick
    cam(lerpv((LAB_CLOCK[0] + 0.14, 0.6, 1.62), (LAB_CLOCK[0] + 0.08, 0.98, 1.66), u),
        (LAB_CLOCK[0], LAB_CLOCK[1], LAB_CLOCK[2] - 0.13), 26, roll=math.radians(-6 - 2 * u))


# split screen (05a + 05b): ONE continuous push over the whole line (both beats share the clock), each half acts its beat:
# TOP = strong smell: the dog bouncing and wagging hard in thick wisps; BOTTOM = faint smell: the dog lying sad at the door.
def t05():
    return (sc.frame_current - CUT[4]) / FPS


D05 = (CUT[5] - CUT[4]) / FPS
TOP_DOG = (0.35, -0.5, 0)


def p05_top(t, d):
    T = t05()
    HZ_ROOM.density(1.0, 0.45, T); HZ_SOFA.density(1.0, 0.45, T); HZ_TOP.density(1.0, 0.5, T)
    hop = abs(math.sin(math.pi * 2.0 * T))
    dd = dog(0, (TOP_DOG[0], TOP_DOG[1], 0.11 * hop), math.radians(-55), "happy", T)
    D.rot(dd["arm"], "root", (1, 0, 0), -0.22 * hop)                                       # play-bounce: chest up
    for s_ in "LR":
        D.move(dd["arm"], f"ik_f.{s_}", (0, -0.04 * hop, 0.1 * hop))
    happy_wag(dd["arm"], T, 1.15)                                                       # big fast wag
    D.rot2(dd["arm"], "head", [((0, 1, 0), 0.18 * math.sin(2 * math.pi * 1.2 * T)), ((1, 0, 0), -0.05)])
    u = K.ease(T / D05)
    c = Vector(TOP_DOG)
    cam(lerpv((c.x - 0.42, c.y - 1.5, 0.62), (c.x - 0.3, c.y - 1.12, 0.58), u), (c.x + 0.02, c.y + 0.1, 0.36), 26)


BOT_DOG = (HX - 0.05, 1.95, 0)


def p05_bot(t, d):
    T = t05()
    for o in RACK:
        hide(o, True)
    HZ_HALL.density(0.2, 0.08, T)
    dd = dog(0, BOT_DOG, math.radians(8), "sad", T); dog_lie(0)
    D.move(dd["arm"], "chest", (0, 0, 0.008 * math.sin(2.2 * T)))                         # slow sad breathing
    D.rot2(dd["arm"], "head", [((1, 0, 0), 0.32 + 0.04 * math.sin(1.1 * T)), ((0, 0, 1), 0.06 * math.sin(0.7 * T))])
    u = K.ease(T / D05)
    c = Vector(BOT_DOG)
    cam(lerpv((c.x + 0.3, c.y - 1.45, 0.5), (c.x + 0.22, c.y - 1.08, 0.46), u), (c.x, c.y + 0.1, 0.24), 26)


def b06a(t, d):   # side MS: the dog hops onto the sofa by the window
    hop = max(0.0, 1 - t / 0.5)
    dog(0, (SOFA_DOG[0], SOFA_DOG[1] - 0.8 * hop, SEAT_Z * (1 - hop) + 0.35 * math.sin(math.pi * (1 - hop)) * (hop > 0)), math.pi, "neutral", t)
    u = K.ease(t / d)
    cam(lerpv((2.15, 0.35, 0.95), (2.0, 0.55, 0.95), u), (0.0, 1.45, 0.85), 22)


def b06b(t, d):   # over the dog's shoulder at the window: the owner's car turns the corner, right on cue (slow push)
    dog(0, SOFA_DOG, math.pi, "neutral", t)
    k = K.ease(min(1.0, max(0.0, t - 0.6) / 0.4))
    D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), -0.12 * k)])                                # ears up: head lifts as the car comes
    u = K.ease(t / d)
    CAR.location = (9.0 - 7.5 * u, 10.6, -0.04)
    cam(lerpv((0.4, 0.46, 1.31), (0.3, 0.64, 1.28), u), (-0.15, 9.0, 1.0), 24)


FRIEND_AT = (-0.85, -0.75, 0)


def b07a(t, d):   # the second person waves the owner's sweaty t-shirt; dog bottom-right, rear 3/4 (Zaw doorway framing)
    h_show(FRIEND, True, FRIEND_AT, math.radians(-25)); h_flap(FRIEND, t)
    dog(0, (0.45, -1.45, 0), math.radians(125), "judging", t)
    HZ_ROOM.density(0.15 + 0.35 * t / d, 0.18, t)
    u = K.ease(t / d)
    cam(lerpv((1.3, -2.5, 0.95), (1.12, -2.36, 0.97), u), (-0.9, -0.3, 1.0), 22)


def b07b(t, d):   # wide, slightly high: the wisps flood back to full; slow push
    h_show(FRIEND, True, FRIEND_AT, math.radians(-25)); h_flap(FRIEND, t + 1.3)
    dog(0, (0.65, -1.75, 0), math.radians(125), "judging", t)
    HZ_ROOM.density(1.0, 0.28, t); HZ_SOFA.density(1.0, 0.26, t)
    u = K.ease(t / d)
    cam(lerpv((2.2, -2.35, 1.7), (1.95, -2.05, 1.6), u), (-0.6, 0.0, 0.7), 22)


def b08a(t, d):   # high CU, dutch: the dog flat on the rug, not getting up, shocked, looking up into the lens (slow push down)
    dog(0, (0.2, -0.6, 0.012), math.radians(-15), "shocked", t); dog_lie(0)
    HZ_ROOM.density(1.0, 0.24, t)
    hp = dog_head(0); u = K.ease(t / d)
    cam(lerpv((hp.x + 0.14, hp.y - 0.66, hp.z + 0.58), (hp.x + 0.1, hp.y - 0.54, hp.z + 0.48), u), (hp.x, hp.y + 0.05, hp.z - 0.05), 24, roll=math.radians(-9))


def b08b(t, d):   # inside, behind the EMPTY sofa: the owner's car pulls up outside; nobody at the window
    u = K.ease(t / d)
    CAR.location = (-6.5 + 6.0 * u, 10.6, -0.04)
    dog(0, (0.2, -0.45, 0.012), 0.0, "judging", t); dog_lie(0)
    D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), -0.08 + 0.03 * math.sin(15 * t))])      # sniff-sniff: "his nose said..."
    HZ_ROOM.density(1.0, 0.32, t)
    hp = Vector((0.2, -0.45 - 0.5, 0.42))
    cam(lerpv((hp.x - 0.28, hp.y - 0.62, hp.z + 0.05), (hp.x - 0.24, hp.y - 0.5, hp.z + 0.04), u), (hp.x + 0.1, hp.y + 2.5, hp.z + 0.35), 24)


def b09a(t, d):   # wide, slightly high: the dog alone at home, resting on its bed; clock on the wall
    dog(0, (1.75, -1.65, 0.18), math.radians(60), "neutral", t); dog_lie(0)
    D.move(DOGS[0]["arm"], "chest", (0, 0, 0.006 * math.sin(2.4 * t)))
    set_clock(12, 30)
    u = K.ease(t / d)
    cam(lerpv((-1.9, 1.3, 1.85), (-1.5, 1.0, 1.75), u), (1.6, -0.9, 0.7), 22)


CLOCKS = [(12, 30), (2, 0), (4, 0)]


def p09(i):
    def f(t, d):
        dog(0, (1.75, -1.65, 0.18), math.radians(-116), "neutral" if i == 0 else "sad", t); dog_lie(0)
        if i == 2:
            D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), 0.45)])                     # 4:00 - chin down on the paws
        set_clock(*CLOCKS[i])
        D.move(DOGS[0]["arm"], "chest", (0, 0, 0.006 * math.sin(2.4 * t + i)))      # breathing
        D.rotl(DOGS[0]["arm"], "tail1", [((0, 0, 1), 0.25 * math.sin(6 * t) if i else 0.0)])
        u = K.ease(t / d)
        cam(lerpv((0.15, -0.95, 0.95), (0.35, -1.05, 0.9), u), (1.9, -1.0, 0.7), 30)
    return f


def b10a(t, d):   # door opens; the 0:30 dog gives one tail wag (owner centred in the door, dog bottom right), slow push
    DOOR_PIV.rotation_euler = (0, 0, -math.radians(95) * K.ease(t / 0.6))
    h_show(OWNER, True, (HX, 2.15, 0), 0.0); h_walk(OWNER, t, amp=0.4)
    dog(0, (HX + 0.24, 0.3, 0), math.radians(185), "neutral", t)
    w1 = max(0.0, min(1.0, (t - 0.53) / 0.5))                    # ONE wag, on the 28.05 s thump
    D.rotl(DOGS[0]["arm"], "tail1", [((0, 0, 1), 0.55 * math.sin(2 * math.pi * w1))])
    u = K.ease(t / d)
    cam(lerpv((HX - 0.1, -1.9, 0.95), (HX - 0.07, -1.5, 0.97), u), (HX, 2.4, 1.05), 22)


OWNER_IN = (HX - 0.29, 1.98, 0)


def b10b(t, d):   # the 2:00 and 4:00 dogs launch at the owner (seen from beside the door, their faces to the lens)
    DOOR_PIV.rotation_euler = (0, 0, -math.radians(95))
    h_show(OWNER, True, OWNER_IN, math.radians(-45))
    for side, sg in (("L", 1), ("R", -1)):
        OWNER.rot(f"upperarm.{side}", [((1, 0, 0), -0.9), ((0, 1, 0), -0.4 * sg)]); OWNER.rot(f"forearm.{side}", [((1, 0, 0), -0.5)])
    for i, (x, y0, ph) in enumerate(((0.12, 1.1, 0.0), (0.4, 0.68, 0.35))):        # both dogs clear of the owner
        j = abs(math.sin(math.pi * (t * 1.6 + ph)))
        dd = dog(i + 1, (HX + x, y0 + 0.1 * j, 0.36 * j), math.pi + 0.25, "happy", t + ph)
        D.rot(dd["arm"], "root", (1, 0, 0), -0.32 * j)                  # body pitched up, front legs reaching
        for s in "LR":
            D.move(dd["arm"], f"ik_f.{s}", (0, -0.08 * j, 0.12 * j)); D.move(dd["arm"], f"ik_h.{s}", (0, 0.08 * j, 0.0))
        happy_wag(dd["arm"], t + 0.11 * i, 1.2)                                       # the owner is right there
    u = K.ease(t / d)
    for o in RACK:                                                 # QA: the rack + sneaker card read as a brown block / white strip
        hide(o, True)
    cam(lerpv((HX + 0.02, 3.5, 1.05), (HX + 0.01, 3.3, 1.02), u), (HX + 0.12, 0.5, 0.62), 28)          # from the porch, through the door


def b11(t, d):    # kitchen at night: the owner unloads the bags; the dog in front stares at us, judging (slow push)
    h_show(OWNER, True, (KX - 0.3, 1.05, 0), math.radians(-30)); h_carry(OWNER)
    k = K.ease(min(1.0, t / 1.0))                                                  # lifts the paper bag onto the counter
    OWNER.rot("upperarm.L", [((1, 0, 0), -0.25 - 0.75 * k), ((0, 1, 0), -0.2)]); OWNER.rot("forearm.L", [((1, 0, 0), -0.5 * k)])
    OWNER.rot("neck", [((0, 0, 1), -0.35 * K.ease(min(1.0, max(0.0, t - 1.0) / 0.4)))])   # then turns to the dog
    hx, hy, hz = OWNER.hand_pos("L"); BAG_A.location = (hx, hy, hz - 0.3 + 0.12 * k)
    hide(BAG_B, True)                                                   # QA: the white plastic bag read as a loose patch by the dog's ear
    dog(0, (KX - 0.02, -0.82, 0), 0.62, "judging", t)
    happy_wag(DOGS[0]["arm"], t, 0.9)                                   # judging face, but the tail can't hide it: he's home
    u = K.ease(t / d)
    cam(lerpv((KX + 0.75, -1.95, 0.9), (KX + 0.68, -1.8, 0.9), u), (KX - 0.4, 0.5, 0.8), 22)


def b12a(t, d):   # outside the window again, push in (mirror of 01b)
    dog(0, SOFA_DOG, math.pi, "neutral", t)
    for n_ in ("tv", "tv_cab"):
        hide(bpy.data.objects[n_], True)
    u = K.ease(t / d)
    cam(lerpv((0.3, 5.0, 1.55), (0.08, 3.35, 1.5), u), (0.0, 2.0, 1.42), 26)


def b12b(t, d):   # loop: behind the head, the car pulls away again (same as 01a, no yip)
    b01a(t, d, loop=True)


L = lambda line, idx: word_cut(line, idx)
BEATS = [  # name, f0, f1, fn | panels, board fraction
    ("01a", 0, L(0, 8), b01a, 0.1), ("01b", L(0, 8), CUT[1], b01b, 0.6),
    ("02a", CUT[1], L(1, 4), b02a, 0.5), ("02b", L(1, 4), CUT[2], b02, 0.45),
    ("03a", CUT[2], L(2, 4), b03a, 0.5), ("03b", L(2, 4), CUT[3], b03b, 0.4),
    ("04a", CUT[3], L(3, 4), b04a, 0.5), ("04b", L(3, 4), CUT[4], b04b, 0.5),
    ("05a", CUT[4], L(4, 5), [p05_top, p05_bot], 0.5), ("05b", L(4, 5), CUT[5], [p05_top, p05_bot], 0.5),
    ("06a", CUT[5], L(5, 9), b06a, 0.6), ("06b", L(5, 9), CUT[6], b06b, 0.85),
    ("07a", CUT[6], L(6, 5), b07a, 0.5), ("07b", L(6, 5), CUT[7], b07b, 0.6),
    ("08a", CUT[7], L(7, 4), b08a, 0.5), ("08b", L(7, 4), CUT[8], b08b, 0.7),
    ("09a", CUT[8], L(8, 6), b09a, 0.5), ("09b", L(8, 6), CUT[9], [p09(0), p09(1), p09(2)], 0.5),
    ("10a", CUT[9], L(9, 4), b10a, 0.6), ("10b", L(9, 4), CUT[10], b10b, 0.4),
    ("11", CUT[10], CUT[11], b11, 0.5),
    ("12a", CUT[11], L(11, 8), b12a, 0.5), ("12b", L(11, 8), END, b12b, 0.12),
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


if MODE == "board":
    out = os.path.join(H, "review", "raw"); os.makedirs(out, exist_ok=True)
    names = ARGS[1:] or [b[0] for b in BEATS]
    for n in names:
        b = BY[n]; f = round(b[1] + b[4] * (b[2] - b[1]))
        do_frame(b, f, os.path.join(out, f"{n}.png"))
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS}, open(os.path.join(H, "review", "beats.json"), "w"), indent=1)
elif MODE == "frames":
    b = BY[ARGS[1]]; step = int(ARGS[2]) if len(ARGS) > 2 else 1
    out = os.path.join(H, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        do_frame(b, f, os.path.join(out, f"{f:05d}.png"), (270, 480))
elif MODE == "final":
    # full-res frames for the final cut: renders/frames/#####.png (split beats: #####_p0.. stacked in final_post.py)
    a, b_ = int(ARGS[1]), int(ARGS[2])
    out = os.path.join(H, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a, b_):
        bt = next(x for x in BEATS if x[1] <= f < x[2])
        do_frame(bt, f, os.path.join(out, f"{f:05d}.png"), (1080, 1920))
elif MODE == "thumb":
    # thumbnail plates: A = the sad dog at the window from outside, a wall clock behind it whose hands are scent wisps;
    # B = behind the dog's head, the owner tiny down the street.  thumb.py composes + text.
    out = os.path.join(H, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset()
    ck = (0.82, LY0 + 0.03, 1.55)
    prism("thumb_clock", 0.46, 0.05, ck, math.pi, "clock_face", side="#2A2A2A")
    tc = Scent("sc_thumb", trails=[[(ck[0] + 0.004 * i + 0.012 * math.sin(i), ck[1] + 0.07, ck[2] + 0.03 * i) for i in range(13)],
                                    [(ck[0] + 0.024 * i, ck[1] + 0.07, ck[2] + 0.01 * i + 0.008 * math.sin(i * 1.3)) for i in range(12)]],
               motes=0, r=0.05)
    tc.mat.node_tree.nodes["Emission"].inputs[0].default_value = (*K.srgb("#FFD21E"), 1)
    tc.density(1.0, 0.8, 0.0); tc.mat.node_tree.nodes["A"].outputs[0].default_value = 0.95
    d0 = dog(0, SOFA_DOG, math.pi, "sad", 0.4)
    hp = dog_head(0)
    cam((hp.x + 0.18, hp.y + 1.25, hp.z + 0.12), (hp.x + 0.12, hp.y, hp.z - 0.12), 30)
    render(os.path.join(out, "A.png"), (1080, 1920))
    reset(); dog(0, SOFA_DOG, math.pi, "sad", 0.4)
    h_show(OWNER, True, (-2.6, 13.8, 0), math.radians(90)); h_walk(OWNER, 0.3, amp=0.8)
    cam((0.03, 0.42, 1.5), (-0.6, 9.0, 1.05), 29)
    render(os.path.join(out, "B.png"), (1080, 1920))
elif MODE == "check":
    # self-check: at every board frame, each visible dog's lowest paw must sit on its support (floor/seat/bed)
    import numpy as np
    rows = []
    for b in BEATS:
        f = round(b[1] + b[4] * (b[2] - b[1])); t, d = (f - b[1]) / FPS, (b[2] - b[1]) / FPS
        fns = b[3] if isinstance(b[3], list) else [b[3]]
        for k, g in enumerate(fns):
            reset(); g(t, d); bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()
            for i, dd in enumerate(DOGS):
                if dd["o"].hide_render:
                    continue
                ev = dd["o"].evaluated_get(dg); mw = ev.matrix_world
                zs = np.array([(mw @ v.co).z for v in ev.data.vertices])
                sup = dd["mv"].location.z
                rows.append(f"{b[0]}{'' if len(fns) == 1 else '_p%d' % k} dog{i}: support {sup:.3f}  lowest vertex {zs.min():.3f}  gap {zs.min() - sup:+.3f}")
    open(os.path.join(H, "review", "feet_check.txt"), "w").write("\n".join(rows) + "\n"); print("\n".join(rows))
elif MODE == "dogcheck":
    # self-check of the photo-projected dog (rev 3): back, 3/4 back, top, side, head under the ears, + the happy wag
    out = os.path.join(H, "review", "dog_back"); os.makedirs(out, exist_ok=True)
    VIEWS = [("back", (0.0, 0.85, 0.75), 0), ("back34", (0.75, 0.7, 0.8), 0), ("top", (0.05, -0.35, 2.0), 0),
             ("side", (1.4, -0.3, 0.55), 0), ("ear_cu", (0.42, -1.05, 0.72), 0), ("back_cu", (0.3, 0.45, 0.95), 0),
             ("wag_a", (0.75, 0.7, 0.8), 0.00), ("wag_b", (0.75, 0.7, 0.8), 0.06), ("wag_c", (0.75, 0.7, 0.8), 0.11)]
    for nm, pos, tw in VIEWS:
        reset()
        d = dog(0, (BX + 0.3, -0.3, 0), 0.0, "happy" if nm.startswith("wag") else "neutral", 0.3)
        if nm.startswith("wag"):
            happy_wag(d["arm"], tw)
        tgt = (BX + 0.3, -0.45, 0.55) if nm == "ear_cu" else (BX + 0.3, -0.2, 0.45)
        cam((BX + 0.3 + pos[0], pos[1], pos[2]), tgt, 30 if nm.endswith("cu") else 24)
        render(os.path.join(out, f"{nm}.png"))
elif MODE == "feetscan":
    # every 2nd frame of the hop / jump / launch shots: the lowest dog vertex against the FLOOR (z = 0, or the sofa/bed)
    import numpy as np
    rows = []
    for nm, fn_, floor in (("05a", p05_top, 0.0), ("05b", p05_top, 0.0), ("06a", b06a, None), ("10b", b10b, 0.0), ("10a", b10a, 0.0), ("11", b11, 0.0)):
        b = BY[nm]
        for f in range(b[1], b[2], 2):
            sc.frame_set(f); reset(); fn_((f - b[1]) / FPS, (b[2] - b[1]) / FPS); bpy.context.view_layer.update()
            dg = bpy.context.evaluated_depsgraph_get()
            for i, dd in enumerate(DOGS):
                if dd["o"].hide_render:
                    continue
                ev = dd["o"].evaluated_get(dg); mw = ev.matrix_world
                P_ = np.array([tuple(mw @ v.co) for v in ev.data.vertices]); zs = P_[:, 2]; rows.append((nm, f, i, float(zs.min())))
                if nm == "06a" and (f - b[1]) / FPS > 0.5:                       # landed: paws must stay on the seat cushions
                    low = P_[zs < SEAT_Z + 0.04]
                    am = dd["arm"]; pw = {bn: am.matrix_world @ am.pose.bones[bn].tail for bn in ("paw_f.L", "paw_f.R", "paw_h.L", "paw_h.R", "tail3")}
                    print(f"SEAT 06a f{f}: " + " ".join(f"{k} y{v.y:.2f} z{v.z:.2f}" for k, v in pw.items()) + f" | lowest z {zs.min():.3f}")
    for nm in ("05a", "05b", "06a", "10b", "10a", "11"):
        r = [x for x in rows if x[0] == nm]
        print(f"FEET {nm}: min lowest vertex {min(x[3] for x in r):+.3f} m over {len(r)} dog-frames")
elif MODE == "save":
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(H, "zaw_dog_01.blend"))

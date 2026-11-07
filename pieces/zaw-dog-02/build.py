"""zaw-dog #2 "How You're Accidentally Ruining Your Dog's Trust" — Blender scenes + storyboard frames.
Sets + kit copied from zaw-dog-01 (approved Short #1): living room, hallway, kitchen (day, dressed as the Kyoto lab).
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
# kitchen window (zaw-dog-02 fix: was a flat photo in the hole): modelled frame, mullions, deep sill, reveals, recessed
# tinted glass, and a real 3D back garden behind it (lawn, fence, hedge + tree cards, a neighbour's house, the street_far
# backdrop and the blue cloud sky far away) so the view has depth and parallax.
KWX0, KWX1, KWZ0, KWZ1 = KX - 0.2, KX + 0.8, 1.25, 1.95
KWC = (KWX0 + KWX1) / 2
box("k_wsill", (1.16, 0.26, 0.04), (KWC, 1.97, KWZ0 - 0.04), TRIM)                       # inner sill, proud of the wall
for nm, size, loc in [("k_rev_l", (0.03, 0.12, KWZ1 - KWZ0), (KWX0 + 0.015, 2.06, KWZ0)), ("k_rev_r", (0.03, 0.12, KWZ1 - KWZ0), (KWX1 - 0.015, 2.06, KWZ0)),
                      ("k_rev_t", (KWX1 - KWX0, 0.12, 0.03), (KWC, 2.06, KWZ1 - 0.03)), ("k_rev_b", (KWX1 - KWX0, 0.12, 0.02), (KWC, 2.06, KWZ0))]:
    box(nm, size, loc, TRIM)                                                              # reveals: the wall's real depth
for nm, size, loc in [("k_wf_l", (0.05, 0.06, KWZ1 - KWZ0), (KWX0 + 0.055, 2.09, KWZ0)), ("k_wf_r", (0.05, 0.06, KWZ1 - KWZ0), (KWX1 - 0.055, 2.09, KWZ0)),
                      ("k_wf_t", (KWX1 - KWX0 - 0.06, 0.06, 0.05), (KWC, 2.09, KWZ1 - 0.08)), ("k_wf_b", (KWX1 - KWX0 - 0.06, 0.06, 0.05), (KWC, 2.09, KWZ0 + 0.02)),
                      ("k_wm_v", (0.035, 0.05, KWZ1 - KWZ0 - 0.1), (KWC, 2.095, KWZ0 + 0.05)), ("k_wm_h", (KWX1 - KWX0 - 0.1, 0.05, 0.03), (KWC, 2.095, 1.62))]:
    box(nm, size, loc, mcol("#F4F1EA"))                                                    # frame + cross mullions
box("k_osill", (1.1, 0.12, 0.04), (KWC, 2.17, KWZ0 - 0.05), mcol("#C9C4BA"))                # outside sill
_kg = bpy.data.materials.new("k_glass"); _kg.use_nodes = True; _nt = _kg.node_tree; _nt.nodes.clear()
_o = _nt.nodes.new("ShaderNodeOutputMaterial"); _e = _nt.nodes.new("ShaderNodeEmission"); _e.inputs[0].default_value = (*K.srgb("#CFE2EE"), 1)
_t = _nt.nodes.new("ShaderNodeBsdfTransparent"); _m = _nt.nodes.new("ShaderNodeMixShader"); _m.inputs[0].default_value = 0.1
_nt.links.new(_t.outputs[0], _m.inputs[1]); _nt.links.new(_e.outputs[0], _m.inputs[2]); _nt.links.new(_m.outputs[0], _o.inputs[0]); _kg.surface_render_method = "BLENDED"
K.plane("k_glass", KWX1 - KWX0 - 0.1, KWZ1 - KWZ0 - 0.1, (KWC, 2.1, (KWZ0 + KWZ1) / 2), mat=_kg)  # recessed 4 cm behind the frame face
box("kg_lawn", (24, 40, 0.04), (KX, 22.2, -0.04), mtex("grass"), 1.6)                       # back garden (outside the window)
box("kg_patio", (4.4, 1.6, 0.05), (KX, 2.95, -0.03), mtex("concrete"), 0.6)
for i in range(13):                                                                        # wooden fence, 6 m out
    box(f"kg_post{i}", (0.08, 0.08, 1.3), (KX - 6 + i, 8.0, 0), mcol("#6B4E34"))
box("kg_rail0", (12.2, 0.04, 0.08), (KX, 8.0, 0.45), mcol("#7A5A3C")); box("kg_rail1", (12.2, 0.04, 0.08), (KX, 8.0, 1.05), mcol("#7A5A3C"))
for i in range(60):
    box(f"kg_board{i}", (0.16, 0.025, 1.2), (KX - 6 + 0.2 * i, 8.04, 0), mcol(("#8A6A48", "#7E6040", "#94724E")[i % 3]))
for i, (x_, y_, n_, h_) in enumerate(((-1.6, 5.2, "hedge", 1.1), (1.9, 5.6, "shrub", 1.0), (-3.5, 9.5, "tree_round", 5.0),
                                      (2.6, 11.0, "tree_tall", 6.5), (0.4, 6.4, "plant", 0.9), (5.5, 9.0, "tree_round", 4.6))):
    card(f"kg_tree{i}", n_, h_, (KX + x_, y_, 0), yaw=math.pi)
box("kg_shed", (1.6, 1.2, 1.9), (KX + 2.2, 6.8, 0), SIDING, 0.6)
box("kg_shed_roof", (1.8, 1.4, 0.08), (KX + 2.2, 6.8, 1.9), mtex("roof"), 0.5)
house("kg_house", KX - 1.0, 17.0, 10, 7, 3.0, 1.6, body=BRICK, door="#2A4A6A")
frustum("k_lamp_base", 0.08, 0.08, 0.02, (KX, 0.2, LH - 0.02), mcol("#B89A5A")); frustum("k_lamp", 0.07, 0.17, 0.11, (KX, 0.2, LH - 0.13), K.mat_color("k_lampm", "#FFF2C8", emit_only=True)); frustum("k_lamp_rim", 0.175, 0.175, 0.015, (KX, 0.2, LH - 0.025), mcol("#B89A5A"))
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
for _n in ["k_table"] + [f"k_tleg{i}" for i in range(4)]:
    bpy.data.objects.remove(bpy.data.objects[_n])          # zaw-dog-02: the low lab cameras need the floor


def hide(o, h=True):
    o.hide_render = h; o.hide_viewport = h



# ================================================================ zaw-dog #2 additions
# ----- kitchen dressed as the Kyoto lab (it stays a cosy kitchen: groceries, fridge, family photo)
K.plane("k_sign", 1.1, 0.275, (KX + 2.035, 0.2, 2.15), rot=(math.pi / 2, 0, math.pi / 2), mat=mtex("lab_sign2"))    # right wall, 2.5 cm proud
K.plane("k_wboard", 0.9, 0.62, (KX + 2.03, -0.75, 1.45), rot=(math.pi / 2, 0, math.pi / 2), mat=mtex("whiteboard"))
box("k_wb_tray", (0.05, 0.9, 0.02), (KX + 2.0, -0.75, 1.12), mcol("#9A9EA2"))
card("k_microscope", "microscope", 0.32, (KX + 0.55, 1.62, 0.91), yaw=-0.2)
card("k_flasks", "flasks", 0.18, (KX + 1.0, 1.62, 0.91), yaw=0.1)
K.plane("k_clip", 0.22, 0.3, (KX - 0.35, 1.5, 0.915), rot=(0, 0, 0.25), mat=mcut("clipboard2"))
PP.loft(os.path.join(T, "src", "succulent.png"), "k_succ", height=0.14, sides=8, loc=(KX - 1.5, 1.75, 0.91))
PP.loft(os.path.join(T, "src", "mug_red.png"), "k_mug", height=0.1, sides=8, loc=(KX + 1.25, 1.5, 0.91))
PP.loft(os.path.join(T, "src", "bowl_steel.png"), "k_bowl2", height=0.07, sides=10, loc=(KX - 1.55, -1.5, 0))
frame_pic("k_lab1", "pic_lab1", 0.42, (KX - 2.0 + 0.01, 1.35, 1.55), math.pi / 2)        # left wall: beagle in a lab coat
frame_pic("k_lab2", "pic_lab2", 0.4, (KX - 0.9, -2.0 + 0.01, 1.5), math.pi)               # front wall
frame_pic("k_lab3", "pic_lab3", 0.36, (KX + 0.6, -2.0 + 0.01, 1.6), math.pi)
frame_pic("k_lab4", "pic_lab4", 0.38, (KX + 2.0 - 0.01, 1.05, 1.5), -math.pi / 2)        # right wall: the cups dog
box("k_mat", (1.6, 1.1, 0.012), (KX, -0.35, 0), mtex("rug"), 0.42)                         # test mat under the cups
# behind the kitchen's left doorway: a strip of hallway, so the door never shows a black void
box("kb_floor", (1.6, 2.2, 0.06), (KX - 2.9, -0.75, -0.06), WOOD, 0.9)
K.box("kb_ceil", (1.6, 2.2, 0.08), (KX - 2.9, -0.75, LH + 0.04), CEIL)
wall("kb_wb", "x", KX - 3.7, -1.85, 0.35, 0, LH, [], WALLH, uv=0.4)
wall("kb_w0", "y", -1.91, KX - 3.7, KX - 2.1, 0, LH, [], WALLH, uv=0.4)
wall("kb_w1", "y", 0.41, KX - 3.7, KX - 2.1, 0, LH, [], WALLH, uv=0.4)
card("kb_rack", "coat_rack", 1.75, (KX - 3.4, -0.75, 0), yaw=math.pi / 2)
frame_pic("kb_pic", "pic_meme1", 0.4, (KX - 3.69, -0.2, 1.55), math.pi / 2)

# ----- props
BALL = PP.loft(os.path.join(T, "src", "ball2.png"), "ball2", height=0.066, sides=8, loc=(0, -30, 0))
CUP_A = (KX - 0.25, -0.05)                 # -X cup (the empty one in line 5)
CUP_B = (KX + 0.25, -0.05)                 # +X cup (the treat)
CUPS = [PP.loft(os.path.join(T, "src", "cup_red.png"), f"cup{i}", height=0.12, sides=10, loc=(c[0], c[1], 0)) for i, c in enumerate((CUP_A, CUP_B))]
TREAT = card("treat", "biscuit", 0.035, (CUP_B[0], CUP_B[1], 0.0))
TREAT.rotation_euler = (0.0, 0, 0); TREAT.scale = (1, 1, 1)
def glow_mat(name, hexc, a):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (*K.srgb(hexc), 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = a
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    m.surface_render_method = "BLENDED"; m.use_backface_culling = False
    return m
_n = 48; _yy, _xx = np.mgrid[:_n, :_n]; _dd = np.hypot(_xx - _n / 2 + 0.5, _yy - _n / 2 + 0.5) / (_n / 2)
_ga = np.zeros((_n, _n, 4), np.uint8); _ga[..., :3] = (255, 226, 80); _ga[..., 3] = (np.clip(1 - _dd, 0, 1) ** 1.6 * 150).astype(np.uint8)
GLOW = K.plane("treat_glow", 0.34, 0.34, (0, -30, 0), rot=(0, 0, 0), mat=K.mat_image("treat_glow", K.image_from_array("glow", _ga), emit_only=True, alpha=True))
BOXC = front_box("box_clear", "box_clear", (0.24, 0.17, 0.13), (0, -30, 0), 0.0, "#C8D8E0")
SNACKS = [card(f"snack{i}", "biscuit", 0.035, (0, -30, 0)) for i in range(2)]
# floating portraits (line 9): each stranger's own face, framed, drifting above the dog
PORTRAITS = []
for i, n in enumerate(("stranger_a", "stranger_b", "researcher", "pointer")):
    root = K.link(bpy.data.objects.new(f"port{i}", None))
    fr = K.box(f"port{i}_fr", (0.2, 0.02, 0.25), (0, 0.012, 0), mcol("#3A2A1C")); fr.parent = root
    pl = K.plane(f"port{i}_img", 0.16, 0.21, (0, -0.001, 0), rot=(math.pi / 2, 0, 0), mat=mtex(f"face_{n}")); pl.parent = root
    PORTRAITS.append(root)

# ---------------------------------------------------------------- characters
DOGS = []
for i in range(1):
    o, arm, fn = D.build()
    mv = K.link(bpy.data.objects.new(f"mover{i}", None)); arm.parent = mv
    sh = D.blob_shadow(mv)
    DOGS.append(dict(o=o, arm=arm, fn=fn, mv=mv, sh=sh))
import photohuman as PH  # noqa: E402
OWNER = PH.PhotoPerson("owner")
RES = PH.PhotoPerson("researcher")          # Kyoto researcher: own face + body (lab coat)
PNT = PH.PhotoPerson("pointer")             # the second pointer: own face + body (mustard sweatshirt)
STA = PH.PhotoPerson("stranger_a")          # the unhelpful stranger (burgundy vest)
STB = PH.PhotoPerson("stranger_b")          # the other stranger (teal cardigan)
PEOPLE = (OWNER, RES, PNT, STA, STB)
SKIN = {"owner": "#C4927A", "researcher": "#D9B097", "pointer": "#6E4632", "stranger_a": "#D9A890", "stranger_b": "#B98466"}
FINGERS = {}
for P_ in PEOPLE:
    for s in "LR":
        f_ = K.box(f"{P_.name}_finger{s}", (0.016, 0.065, 0.016), (0, 0, 0), mcol(SKIN[P_.name]))
        f_.parent = P_.arm; f_.parent_type = "BONE"; f_.parent_bone = f"hand.{s}"; f_.location = (0, 0.0, 0); f_.hide_render = True
        FINGERS[(P_.name, s)] = f_
QMARK = K.Letters3D("qmark", "?", size=0.42, front="#E52521", side="#8C0F0F", seed=4, jitter=0.4)

CAM = K.camera("Cam", 24)
K.ps1_snap(CAM, grid_h=300)
_SNAP = {d["o"].name for d in DOGS} | {o.name for P_ in PEOPLE for o in P_.parts}
for o in bpy.data.objects:                                         # static set unsnapped: only characters wobble
    if o.type == "MESH" and o.name not in _SNAP and o.modifiers.get("ps1"):
        o.modifiers.remove(o.modifiers["ps1"])
_GRAZE = ("floor_wood", "rug", "checker", "lab_t", "grass", "asphalt", "concrete", "brick", "doormat", "fabric", "wall_kitchen", "roof")
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
    """walk/run cycle pose at time t (rate 1 = walk, ~2.4 = run); the caller moves the mover by dog_speed(rate) m/s."""
    D.walk_pose(DOGS[i]["arm"], (t * FPS * rate) % D.WALK_T, key=False)


def dog_speed(rate):
    return D.WALK_SPEED * FPS * rate


def dog_sit(i, k=1.0):
    """sit: rump down, chest up (hips pitch), hind paws tucked forward, neck brings the nose level; IK keeps all
    four paws planted (tested: lowest vertex -0.005 m)."""
    arm = DOGS[i]["arm"]
    D.move(arm, "hips", (0, 0.0, -0.27 * k))                       # feetscan-tuned: front toes stay on the floor (z 0.012-0.02)
    D.rot(arm, "hips", (1, 0, 0), -0.55 * k)
    for s_, sx in (("L", 1), ("R", -1)):
        D.move(arm, f"ik_h.{s_}", (0.03 * sx * k, -0.2 * k, 0.0)); D.move(arm, f"ik_f.{s_}", (0, 0.06 * k, 0.0))
    from mathutils import Quaternion
    for bn, a_ in (("neck", 0.42), ("head", 0.15)):                 # compose: keeps the expression / beat head turn
        pb = arm.pose.bones[bn]; pb.rotation_quaternion = Quaternion(D.local_axis(arm, bn, (1, 0, 0)), a_ * k) @ pb.rotation_quaternion


def dog_head(i):
    d = DOGS[i]; bpy.context.view_layer.update()
    return d["arm"].matrix_world @ d["arm"].pose.bones["head"].tail


def happy_wag(arm, t, amp=1.0, hz=4.4, up=0.25):
    D.happy_wag(arm, t, amp, hz, up=0.25)


def yaw_to(src, dst):
    """yaw for a dog/person (both face -Y at yaw 0) at src looking toward dst."""
    return math.atan2(dst[0] - src[0], -(dst[1] - src[1]))


def aim_bone(P, bone, target):
    """rotate one pose bone about its head (armature space) so it points at target (world)."""
    from mathutils import Matrix
    bpy.context.view_layer.update()
    pb = P.arm.pose.bones[bone]; h, tl = pb.head.copy(), pb.tail.copy(); tg = P.arm.matrix_world.inverted() @ Vector(target)
    q = (tl - h).normalized().rotation_difference((tg - h).normalized())
    pb.matrix = Matrix.Translation(h) @ q.to_matrix().to_4x4() @ Matrix.Translation(-h) @ pb.matrix
    bpy.context.view_layer.update()


def wpt(P, local):
    """a point in the person's own space (faces -Y, their left = +X, z up from the floor) -> world."""
    return P.arm.matrix_world @ Vector(local)


def aim(P, side, target, bend=0.0):
    """point a straight arm at target (world): upper arm, forearm and hand all aimed."""
    for b_ in ("upperarm", "forearm", "hand"):
        P.rot(f"{b_}.{side}", [])
    for b_ in ("upperarm", "forearm", "hand"):
        aim_bone(P, f"{b_}.{side}", target)


def pose_arm(P, side, elbow, hand):
    """two-point arm pose in the person's own space: shoulder -> elbow -> hand (local points, mirrored for R)."""
    sx = 1 if side == "L" else -1
    for b_ in ("upperarm", "forearm", "hand"):
        P.rot(f"{b_}.{side}", [])
    e = wpt(P, (sx * elbow[0], elbow[1], elbow[2])); h_ = wpt(P, (sx * hand[0], hand[1], hand[2]))
    aim_bone(P, f"upperarm.{side}", e); aim_bone(P, f"forearm.{side}", h_); aim_bone(P, f"hand.{side}", h_ + (h_ - e))


def finger(P, side, on=True):
    hide(FINGERS[(P.name, side)], not on)


def crouch(P, loc, yaw, k=1.0):
    """squat beside the dog: hips drop, thighs forward, shins back, feet flat."""
    J = P.J; zc = J["z_crotch"]; lt = zc * 0.48; ls = zc * 0.52 - 0.08
    a1, a2 = 1.5 * k, 2.25 * k
    drop = zc - (ls * math.cos(a2 - a1) + lt * math.cos(a1) + 0.08)
    P.show(True, (loc[0], loc[1], loc[2] - drop), yaw)
    for s in "LR":
        P.rot(f"thigh.{s}", [((1, 0, 0), -a1)]); P.rot(f"shin.{s}", [((1, 0, 0), a2)]); P.rot(f"foot.{s}", [((1, 0, 0), -(a2 - a1))])
    P.rot("chest", [((1, 0, 0), 0.25 * k)])
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); ev = P.body.evaluated_get(dg)
    low = min((ev.matrix_world @ v.co).z for v in ev.data.vertices)
    P.arm.location.z -= low - loc[2]                                  # soles exactly on the floor


def cam(pos, target, lens=24, roll=0.0):
    CAM.data.lens = lens; K.look(CAM, pos, target, roll); K.ps1_snap_update(CAM)


def lerpv(a, b, u):
    return tuple(x + (y - x) * u for x, y in zip(a, b))


def clamp01(x):
    return min(1.0, max(0.0, x))


def reset():
    for d in DOGS:
        hide(d["o"], True); hide(d["sh"], True)
    for P_ in PEOPLE:
        P_.show(False); P_.rest(); P_.arm.location = (0, -40, 0)
        for s in "LR":
            finger(P_, s, False)
    for o in [BALL, BOXC, GLOW, TREAT] + SNACKS + PORTRAITS:
        hide(o, True)
        for c in o.children:
            hide(c, True)
    for c, (x, y) in zip(CUPS, (CUP_A, CUP_B)):
        hide(c, True); c.location = (x, y, 0); c.rotation_euler = (0, 0, 0)
    QMARK.hide(); CAR.location = (60, 10.6, -0.04)


def show_cups(glow=True):
    for c in CUPS:
        hide(c, False)
    TREAT.location = (CUP_B[0], CUP_B[1], 0.0); hide(TREAT, False)
    if glow:
        hide(GLOW, False); GLOW.location = (CUP_B[0], CUP_B[1], 0.017)


def hold_ball(P, side="R"):
    hx, hy, hz = P.hand_pos(side); hide(BALL, False); BALL.location = (hx, hy, hz - 0.045)


# ---------------------------------------------------------------- beats (t = s into the beat, d = beat length)
OWN_LR = (0.35, -0.55, 0)                  # living room: the owner faces +X (the hallway door at x = 2.6)
DOG_LR = (0.6, -1.25, 0)


def windup(t):
    """right arm: wind up behind the head (0..0.45 s), whip forward (0.45..0.62), the ball never leaves the hand."""
    if t < 0.45:
        return -1.0 - 2.3 * K.ease(t / 0.45)
    return -3.3 + 1.9 * K.ease((t - 0.45) / 0.17)


def b01a(t, d):   # living room, dog height: the owner fake-throws; the dog launches after the "ball" toward the door
    OWNER.show(True, OWN_LR, math.pi / 2)
    OWNER.rot("upperarm.R", [((1, 0, 0), windup(t))]); OWNER.rot("forearm.R", [((1, 0, 0), -0.5)])
    OWNER.rot("upperarm.L", [((1, 0, 0), -0.35)])
    hold_ball(OWNER)
    go = max(0.0, t - 0.55)
    dd = dog(0, (DOG_LR[0] + 1.6 * go, DOG_LR[1], 0), math.pi / 2, "happy", t)
    if go > 0:
        dog_walk(0, go, 4.5); D.expr_pose(dd["arm"], "happy", t)
    else:
        D.rot2(dd["arm"], "head", [((1, 0, 0), -0.2), ((0, 0, 1), 0.25)])          # eyes on the ball
    u = K.ease(t / d)
    cam(lerpv((-1.9, -2.25, 0.5), (-1.7, -2.15, 0.5), u), lerpv((0.9, -0.6, 0.75), (1.2, -0.8, 0.7), u), 22)


def b01b(t, d):   # hallway, low: the dog sprints toward us, skids, turns its head back: no ball anywhere (shocked)
    run = clamp01(1 - t / 0.55)
    y = -2.0 + 1.6 * min(t, 0.55) + 0.25 * K.ease(clamp01((t - 0.55) / 0.3))
    dd = dog(0, (HX + 0.05, y, 0), math.pi, "happy" if t < 0.45 else "shocked", t)
    if t < 0.55:
        dog_walk(0, t, 4.5); D.expr_pose(dd["arm"], "happy", t)
    else:
        k = K.ease(clamp01((t - 0.55) / 0.25))
        D.rot(dd["arm"], "root", (1, 0, 0), 0.12 * (1 - k))                       # skid: front dips, then settles
        D.rot2(dd["arm"], "neck", [((0, 0, 1), 0.9 * k)]); D.rot2(dd["arm"], "head", [((0, 0, 1), 0.5 * k), ((1, 0, 0), -0.12)])
    u = K.ease(t / d)
    cam(lerpv((HX - 0.15, 1.0, 0.42), (HX - 0.12, 0.85, 0.42), u), (HX + 0.05, -1.0, 0.3), 24)


def b01c(t, d):   # living room, low behind the dog: the ball is still in the owner's raised hand
    OWNER.show(True, OWN_LR, math.pi / 2 + 0.5)
    OWNER.rot("upperarm.R", [((1, 0, 0), -1.5), ((0, 1, 0), -0.4)]); OWNER.rot("forearm.R", [((1, 0, 0), -1.2)])
    hold_ball(OWNER)
    dd = dog(0, (1.75, -1.0, 0), yaw_to((1.75, -1.0), OWN_LR), "shocked", t)
    D.rot2(dd["arm"], "head", [((1, 0, 0), -0.22)])
    u = K.ease(clamp01((t - 0.3) / (d - 0.3)))
    cam(lerpv((2.35, -1.55, 0.6), (2.25, -1.45, 0.62), u), (0.5, -0.3, 1.25), 24)


# ----- kitchen lab
RES_AT = (KX, 0.75, 0)
DOG_START = (KX, -1.35, 0)


def res_finger_up(P, t):
    k = K.ease(clamp01(t / 0.35)); za = P.J["z_armpit"]
    pose_arm(P, "L", lerpv((0.22, 0.0, za - 0.3), (0.24, -0.12, za - 0.2), k), lerpv((0.24, 0.0, za - 0.6), (0.2, -0.22, za + 0.12), k))
    finger(P, "L")


def b02a(t, d):   # kitchen-lab wide at dog height: the researcher holds up one finger ("KYOTO, 2015"), slow push
    RES.show(True, RES_AT, 0.0); res_finger_up(RES, t)
    RES.rot("neck", [((1, 0, 0), 0.08)])
    show_cups()
    dog(0, DOG_START, math.pi, "neutral", t)
    u = K.ease(clamp01((t - 0.3) / (d - 0.3)))
    cam(lerpv((KX - 0.6, -1.95, 0.55), (KX - 0.5, -1.7, 0.55), u), (KX, 0.6, 0.85), 22)


def b02b(t, d):   # MS: the finger up beside her face; the dog bottom-right in rear 3/4 (Zaw framing)
    RES.show(True, RES_AT, 0.0); res_finger_up(RES, 1.0)
    show_cups()
    dog(0, (KX + 0.25, -0.85, 0), math.pi + 0.25, "neutral", t)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.65, -1.6, 0.75), (KX + 0.6, -1.45, 0.78), u), (KX - 0.05, 0.75, 1.15), 24)


def b03(t, d):    # low close-up on the mat: two upside-down cups, one glowing faintly yellow (the treat)
    show_cups()
    s = 1.0 + 0.06 * math.sin(5 * t); GLOW.scale = (s, s, 1)
    u = K.ease(t / d)
    cam(lerpv((KX - 0.04, -1.15, 0.26), (KX - 0.03, -0.98, 0.24), u), (KX, 0.05, 0.05), 26)


def b04a(t, d):   # low behind the dog: the researcher points at the treat cup
    RES.show(True, RES_AT, 0.0)
    k = K.ease(clamp01(t / 0.4))
    aim(RES, "L", lerpv((KX + 0.6, 0.6, 0.5), (CUP_B[0], CUP_B[1], 0.6), k)); finger(RES, "L")
    RES.rot("neck", [((1, 0, 0), 0.25 * k)])
    show_cups()
    dog(0, DOG_START, math.pi, "neutral", t)
    D.rot2(DOGS[0]["arm"], "head", [((1, 0, 0), -0.12)])
    u = K.ease(t / d)
    cam(lerpv((KX - 1.35, -1.55, 0.6), (KX - 1.2, -1.4, 0.6), u), (KX + 0.15, 0.35, 0.7), 22)


def b04b(t, d):   # side-on low: the dog trots to the treat cup, knocks it over, happy tongue out
    RES.show(True, RES_AT, 0.0); aim(RES, "L", (CUP_B[0], CUP_B[1], 0.6)); finger(RES, "L")
    show_cups()
    goal = (CUP_B[0], CUP_B[1] - 0.58)
    yaw = yaw_to(DOG_START, goal); dist = math.dist(DOG_START[:2], goal); T_ = dist / dog_speed(3.0)
    k = min(t, T_) / T_
    p = lerpv(DOG_START[:2], goal, k)
    dd = dog(0, (p[0], p[1], 0), yaw if k < 1 else 0.98 * yaw + 0.02 * math.pi, "happy", t)
    if k < 1:
        dog_walk(0, t, 3.0); D.expr_pose(dd["arm"], "happy", t)
    hit = clamp01((t - T_) / 0.25)
    if hit > 0:
        D.rot2(dd["arm"], "head", [((1, 0, 0), 0.25 * math.sin(math.pi * hit))])                   # nose bump
    c = CUPS[1]; tip = K.ease(clamp01((t - T_ - 0.1) / 0.25))
    c.rotation_euler = (-math.pi / 2 * tip, 0, 0); c.location = (CUP_B[0], CUP_B[1] + 0.06 * tip, 0.045 * tip)
    if tip > 0.3:
        hide(GLOW, True)
    u = K.ease(t / d)
    cam(lerpv((KX + 1.75, -1.7, 0.5), (KX + 1.62, -1.58, 0.5), u), (KX, -0.25, 0.35), 22)


def b05a(t, d):   # the researcher lifts both cups: one has the treat, the other is empty
    RES.show(True, RES_AT, 0.0)
    k = K.ease(clamp01(t / 0.5))
    for side, cx, ci in (("R", CUP_A[0], 0), ("L", CUP_B[0], 1)):
        aim(RES, side, (cx, CUPS[ci].location.y, 0.12 + 0.35 * k))
        hx, hy, hz = RES.hand_pos(side); CUPS[ci].location = (cx, CUP_A[1], max(0.0, hz - 0.12))
    TREAT.location = (CUP_B[0], CUP_B[1], 0.0); hide(TREAT, False)
    for c in CUPS:
        hide(c, False)
    dog(0, DOG_START, math.pi, "neutral", t)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.8, -1.9, 0.85), (KX + 0.74, -1.74, 0.83), u), (KX - 0.05, 0.3, 0.6), 22)


def b05b(t, d):   # cups down; she points at the EMPTY cup (the -X one)
    RES.show(True, RES_AT, 0.0); aim(RES, "R", (CUP_A[0], CUP_A[1], 0.6)); finger(RES, "R")
    show_cups(glow=True)
    dog(0, DOG_START, math.pi, "neutral", t)
    D.rot2(DOGS[0]["arm"], "head", [((0, 0, 1), -0.2 * K.ease(clamp01(t / 0.4)))])
    u = K.ease(t / d)
    cam(lerpv((KX + 1.3, -1.5, 0.55), (KX + 1.15, -1.35, 0.55), u), (KX - 0.2, 0.35, 0.7), 22)


def b05c(t, d):   # side-on: the dog lifts the empty cup with its nose: nothing under it. shocked
    show_cups()
    goal = (CUP_A[0], CUP_A[1] - 0.55)
    dd = dog(0, (goal[0], goal[1], 0), math.pi, "shocked", t)
    lift = K.ease(clamp01((t - 0.1) / 0.35))
    D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.45 - 0.6 * lift)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.3 - 0.45 * lift)])
    hp = dog_head(0); c = CUPS[0]
    c.location = lerpv((CUP_A[0], CUP_A[1], 0.0), (hp.x, hp.y + 0.02, hp.z - 0.1), lift); c.rotation_euler = (-0.6 * lift, 0, 0)
    u = K.ease(t / d)
    cam(lerpv((KX - 1.45, -0.95, 0.42), (KX - 1.32, -0.88, 0.42), u), (KX - 0.25, -0.2, 0.38), 24)


def b06(t, d):    # she points back at the treat cup; a red 3D "?" pops in clear space above her hand
    RES.show(True, RES_AT, 0.0); aim(RES, "L", (CUP_B[0], CUP_B[1], 0.6)); finger(RES, "L")
    show_cups()
    dog(0, DOG_START, math.pi, "neutral", t)
    hx, hy, hz = RES.hand_pos("L")
    QMARK.root.location = (hx + 0.12, hy - 0.05, hz + 0.32); QMARK.root.rotation_euler = (math.pi / 2, 0, 0.0)
    QMARK.anim(t, 0.25, scale=1.0)
    u = K.ease(clamp01((t - 0.3) / (d - 0.3)))
    cam(lerpv((KX - 1.25, -1.5, 0.62), (KX - 1.1, -1.32, 0.64), u), (KX + 0.2, 0.45, 0.85), 22)


def b07(t, d):    # low 3/4-front CU: the dog sits still, side-eye at the finger (judging), slow push
    RES.show(True, RES_AT, 0.0); aim(RES, "L", (CUP_B[0], CUP_B[1], 0.6)); finger(RES, "L")
    show_cups()
    dd = dog(0, DOG_START, math.pi, "judging", t); dog_sit(0)
    hp = dog_head(0); u = K.ease(t / d)
    cam(lerpv((hp.x - 0.62, hp.y + 0.5, hp.z - 0.05), (hp.x - 0.52, hp.y + 0.42, hp.z - 0.05), u), (hp.x + 0.05, hp.y - 0.1, hp.z - 0.05), 24)


def b08a(t, d):   # a new person steps in and points at the treat cup
    k = K.ease(clamp01(t / 0.45))
    PNT.show(True, (KX + 1.0 - 0.95 * k, 0.75, 0), -0.2 * (1 - k)); PNT.walk(t, amp=0.6 * (1 - k))
    if k > 0.6:
        aim(PNT, "L", lerpv((KX + 0.6, 0.6, 0.9), (CUP_B[0], CUP_B[1], 0.6), clamp01((k - 0.6) / 0.4))); finger(PNT, "L")
    show_cups()
    dog(0, DOG_START, math.pi, "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((KX - 0.55, -1.95, 0.6), (KX - 0.48, -1.78, 0.6), u), (KX + 0.3, 0.5, 0.85), 22)


def b08b(t, d):   # the dog goes at once (happy, tongue out)
    PNT.show(True, (KX + 0.05, 0.75, 0), 0.0); aim(PNT, "L", (CUP_B[0], CUP_B[1], 0.6)); finger(PNT, "L")
    show_cups()
    goal = (CUP_B[0], CUP_B[1] - 0.58)
    T_ = math.dist(DOG_START[:2], goal) / dog_speed(2.4); k = min(t, T_) / T_
    p = lerpv(DOG_START[:2], goal, k)
    dd = dog(0, (p[0], p[1], 0), yaw_to(DOG_START, goal) if k < 1 else math.pi, "happy", t)
    if k < 1:
        dog_walk(0, t, 2.4); D.expr_pose(dd["arm"], "happy", t)
    u = K.ease(t / d)
    cam(lerpv((KX + 1.75, -1.75, 0.55), (KX + 1.62, -1.6, 0.55), u), (KX, -0.1, 0.5), 22)


def b09(t, d):    # hallway: behind the dog peeking into the kitchen doorway; strangers' portraits drift over its head
    dd = dog(0, (HX + 0.45, 0.2, 0), math.pi / 2 + 0.25, "judging", t)
    D.rot2(dd["arm"], "neck", [((0, 0, 1), 0.08 * math.sin(1.5 * t))])
    hp = dog_head(0)
    for i, o in enumerate(PORTRAITS):
        hide(o, False)
        for c in o.children:
            hide(c, False)
        off = (i - 1.5) * 0.2 - 0.14
        o.location = (hp.x - 0.05 + 0.02 * t, hp.y + off, hp.z + 0.36 + 0.03 * math.sin(1.6 * t + 1.3 * i))
        o.rotation_euler = (0, 0.06 * math.sin(1.2 * t + i), -math.pi / 2 + 0.55)
    u = K.ease(t / d)
    cam(lerpv((HX - 0.55, -0.55, 0.85), (HX - 0.45, -0.45, 0.85), u), (HX + 0.9, 0.35, 0.75), 22)


# ----- line 10: the owner can't open the clear box; the stranger next to him turns away
OWN_K = (KX - 0.45, 1.05, 0)
STA_K = (KX + 0.42, 1.0, 0)
DOG_K = (KX - 0.75, -0.05, 0)


def box_struggle(t, k=1.0, yaw=0.5):
    OWNER.show(True, OWN_K, yaw); za = OWNER.J["z_armpit"]; w = 0.03 * math.sin(14 * t) * k
    pose_arm(OWNER, "L", (0.18, -0.2, za - 0.25), (0.1 + w, -0.42, za - 0.12 + w))
    pose_arm(OWNER, "R", (0.18, -0.2, za - 0.25), (0.1 - w, -0.42, za - 0.12 - w))
    OWNER.rot("neck", [((1, 0, 0), 0.3)])
    l, r = OWNER.hand_pos("L"), OWNER.hand_pos("R")
    hide(BOXC, False); BOXC.location = ((l.x + r.x) / 2, (l.y + r.y) / 2, (l.z + r.z) / 2 - 0.065)
    BOXC.rotation_euler = (0.12 * math.sin(11 * t) * k, 0.15 * math.sin(9 * t) * k, yaw)


def arms_crossed(P, k=1.0):
    za = P.J["z_armpit"]
    for side in "LR":
        pose_arm(P, side, lerpv((0.2, 0.0, za - 0.3), (0.2, -0.1, za - 0.27), k), lerpv((0.22, 0.0, za - 0.6), (-0.12, -0.2, za - 0.2), k))


def b10a(t, d):   # low 3/4: owner struggles with the clear box at the counter; the stranger next to him; the dog watches
    box_struggle(t)
    STA.show(True, STA_K, -0.45); STA.rot("neck", [((0, 0, 1), 0.3)])
    dog(0, DOG_K, yaw_to(DOG_K, OWN_K), "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.15, -1.85, 0.5), (KX + 0.12, -1.7, 0.52), u), (KX - 0.2, 0.7, 0.95), 22)


def b10b(t, d):   # counter height: he turns to the stranger and asks; the stranger turns his back, arms crossed
    yaw = 0.5 + 0.7 * K.ease(clamp01(t / 0.3))
    box_struggle(t, 0.3, yaw)
    turn = K.ease(clamp01((t - 0.15) / 0.4))
    STA.show(True, STA_K, -0.45 + 2.6 * turn); arms_crossed(STA, turn)
    dog(0, DOG_K, yaw_to(DOG_K, OWN_K), "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.05, -1.3, 1.3), (KX + 0.03, -1.12, 1.28), u), (KX, 1.0, 1.15), 24)


def b10c(t, d):   # low CU from the counter side: the dog watching from the floor, sad puppy eyes
    yaw = yaw_to(DOG_K, OWN_K)                        # (the people stand behind the lens here: the final QA caught the
                                                      #  camera inside the owner's leg in the first half, so they're off)
    dd = dog(0, DOG_K, yaw, "sad", t); dog_sit(0)
    hp = dog_head(0); u = K.ease(t / d); fx, fy = math.sin(yaw), -math.cos(yaw)
    cam(lerpv((hp.x + 0.62 * fx - 0.15 * fy, hp.y + 0.62 * fy + 0.15 * fx, hp.z + 0.05), (hp.x + 0.52 * fx - 0.12 * fy, hp.y + 0.52 * fy + 0.12 * fx, hp.z + 0.05), u),
        (hp.x, hp.y, hp.z - 0.02), 24)


# ----- lines 11-12: both strangers crouch, a snack on each open palm, looking away from the dog
DOG_S = (KX, 0.55, 0)              # the dog sits facing -Y (the lens); its nose ~0.5 m in front of the mover
STA_C = (KX - 0.62, 0.1, 0)       # unhelpful stranger on the dog's left of frame (-X), facing +X
STB_C = (KX + 0.62, 0.1, 0)       # the other one (+X), facing -X
PALM = {"A": (KX - 0.24, -0.02, 0.5), "B": (KX + 0.24, -0.02, 0.5)}


def offer(P, loc, yaw, side, snack, palm, look=1.0):
    # final QA: the deep crouch smeared the legs/shoes; now they stand and bend over, the palm at the sitting dog's nose
    P.show(True, loc, yaw); P.rot("chest", [((1, 0, 0), 0.5 * max(look, 0.4))]); P.rot("hips", [((1, 0, 0), 0.12)])
    aim(P, side, palm, bend=0.1)
    P.rot("neck", [((0, 0, 1), (0.85 if P is STA else -0.85) * look)])     # looking away from the dog (toward the back wall)
    hx, hy, hz = P.hand_pos(side); hide(snack, False); snack.location = (hx, hy, hz + 0.004)


def both_offer(k=1.0, eaten=False):
    offer(STA, STA_C, math.pi / 2, "L", SNACKS[0], PALM["A"], k)
    offer(STB, STB_C, -math.pi / 2, "R", SNACKS[1], PALM["B"], k)
    if eaten:
        hide(SNACKS[1], True)


def b11a(t, d):   # wide at dog height, square on: both strangers crouch either side of the sitting dog, snacks out
    k = K.ease(clamp01(t / 0.5)); both_offer(k)
    dog(0, DOG_S, 0.0, "neutral", t); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.02, -1.88, 0.62), (KX + 0.02, -1.7, 0.6), u), (KX, 0.4, 0.5), 20)


def b11b(t, d):   # CU over the unhelpful stranger's snack: the dog looks from one palm to the other
    both_offer()
    dd = dog(0, DOG_S, 0.0, "neutral", t)
    D.rot2(dd["arm"], "head", [((0, 0, 1), 0.35 * math.sin(2.4 * t)), ((1, 0, 0), 0.3)]); dog_sit(0)
    u = K.ease(t / d)
    cam(lerpv((KX + 0.14, -0.62, 0.36), (KX + 0.12, -0.52, 0.37), u), (KX + 0.04, 0.2, 0.42), 22)


def eat_path(t, T_=0.75):
    goal = (PALM["B"][0] - 0.1, PALM["B"][1] + 0.42)
    k = K.ease(clamp01(t / T_)); p = lerpv(DOG_S[:2], goal, k)
    return p, yaw_to(goal, PALM["B"]) * k, k


def b12a(t, d):   # the dog gets up, walks past the unhelpful palm and eats from the other one (happy wag)
    p, yaw, k = eat_path(t)
    both_offer(eaten=t > 1.0)
    dd = dog(0, (p[0], p[1], 0), yaw, "happy", t)
    if k < 1:
        dog_walk(0, t, 1.4); D.expr_pose(dd["arm"], "happy", t)
    else:
        D.rot2(dd["arm"], "neck", [((1, 0, 0), 0.3)]); D.rot2(dd["arm"], "head", [((1, 0, 0), 0.2 + 0.08 * math.sin(14 * t))])
    happy_wag(dd["arm"], t, 1.0)
    u = K.ease(t / d)
    cam(lerpv((KX - 0.3, -1.4, 0.5), (KX - 0.2, -1.25, 0.5), u), (KX + 0.1, 0.3, 0.4), 22)


def b12b(t, d):   # CU: chewing, he side-eyes back over his shoulder at the unhelpful stranger (judging)
    both_offer(eaten=True)
    p, yaw, _ = eat_path(9.0)
    dd = dog(0, (p[0], p[1], 0), yaw, "judging", t)
    hp = dog_head(0)                                   # camera on the head BEFORE the side-eye turn (QA: no whip pan)
    k = K.ease(clamp01(t / 0.35))
    D.rot2(dd["arm"], "neck", [((0, 0, 1), -0.55 * k)]); D.rot2(dd["arm"], "head", [((0, 0, 1), -0.4 * k), ((1, 0, 0), 0.04 * math.sin(12 * t))])
    happy_wag(dd["arm"], t, 0.6)
    u = K.ease(t / d)
    cam(lerpv((p[0] + 0.4, p[1] - 1.4, 0.68), (p[0] + 0.36, p[1] - 1.25, 0.66), u), (p[0] + 0.12, p[1] - 0.05, 0.5), 24)


def b13a(t, d):   # living room: ball raised behind his head, he freezes mid-wind-up (slow push)
    OWNER.show(True, OWN_LR, math.pi / 2)
    OWNER.rot("upperarm.R", [((1, 0, 0), -3.2)]); OWNER.rot("forearm.R", [((1, 0, 0), -0.7)]); OWNER.rot("upperarm.L", [((1, 0, 0), -0.35)])
    hold_ball(OWNER)
    dd = dog(0, (1.2, -0.75, 0), yaw_to((1.2, -0.75), OWN_LR), "sad", t); dog_sit(0)
    D.rot2(dd["arm"], "head", [((1, 0, 0), -0.25)])
    u = K.ease(clamp01((t - 0.3) / (d - 0.3)))
    cam(lerpv((2.2, -1.9, 0.55), (2.05, -1.75, 0.58), u), (0.6, -0.5, 1.05), 22)


def b13b(t, d):   # the owner's POV, high CU, dutch: the dog looks up into the lens with tears; cuts into 01a
    dd = dog(0, (1.2, -0.75, 0), yaw_to((1.2, -0.75), OWN_LR), "sad", t); dog_sit(0)
    D.rot2(dd["arm"], "head", [((1, 0, 0), -0.35)])
    hp = dog_head(0); u = K.ease(t / d); yaw = yaw_to((1.2, -0.75), OWN_LR); fx, fy = math.sin(yaw), -math.cos(yaw)
    cam(lerpv((hp.x + 0.36 * fx, hp.y + 0.36 * fy, hp.z + 0.48), (hp.x + 0.3 * fx, hp.y + 0.3 * fy, hp.z + 0.4), u), (hp.x, hp.y, hp.z - 0.08), 24, roll=math.radians(-9))


def word_cut(line, idx):
    w = [x for x in TIM["words"] if x["line"] == line][idx]
    return round((w["s"] - 0.15) * FPS)


L = word_cut
BEATS = [  # name, f0, f1, fn, board fraction
    ("01a", 0, L(0, 4), b01a, 0.55), ("01b", L(0, 4), L(0, 10), b01b, 0.75), ("01c", L(0, 10), CUT[1], b01c, 0.6),
    ("02a", CUT[1], L(1, 5), b02a, 0.6), ("02b", L(1, 5), CUT[2], b02b, 0.5),
    ("03", CUT[2], CUT[3], b03, 0.5),
    ("04a", CUT[3], L(3, 5), b04a, 0.6), ("04b", L(3, 5), CUT[4], b04b, 0.75),
    ("05a", CUT[4], L(4, 4), b05a, 0.7), ("05b", L(4, 4), L(4, 9), b05b, 0.5), ("05c", L(4, 9), CUT[5], b05c, 0.7),
    ("06", CUT[5], CUT[6], b06, 0.6),
    ("07", CUT[6], CUT[7], b07, 0.5),
    ("08a", CUT[7], L(7, 4), b08a, 0.8), ("08b", L(7, 4), CUT[8], b08b, 0.6),
    ("09", CUT[8], CUT[9], b09, 0.5),
    ("10a", CUT[9], L(9, 4), b10a, 0.5), ("10b", L(9, 4), L(9, 11), b10b, 0.7), ("10c", L(9, 11), CUT[10], b10c, 0.5),
    ("11a", CUT[10], L(10, 6), b11a, 0.7), ("11b", L(10, 6), CUT[11], b11b, 0.5),
    ("12a", CUT[11], L(11, 5), b12a, 0.75), ("12b", L(11, 5), CUT[12], b12b, 0.6),
    ("13a", CUT[12], L(12, 4), b13a, 0.5), ("13b", L(12, 4), END, b13b, 0.5),
]
BY = {b[0]: b for b in BEATS}


def render(path, res=(540, 960)):
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)


def do_frame(beat, f, path, res=None):
    name, f0, f1, fn, _ = beat
    t, d = (f - f0) / FPS, (f1 - f0) / FPS
    sc.frame_set(f); reset(); fn(t, d); bpy.context.view_layer.update(); K.ps1_snap_update(CAM)
    render(path, res or (540, 960))


def dog_low(dg):
    dd = DOGS[0]; ev = dd["o"].evaluated_get(dg); mw = ev.matrix_world
    return np.array([tuple(mw @ v.co) for v in ev.data.vertices])


if MODE == "board":
    out = os.path.join(H, "review", "raw"); os.makedirs(out, exist_ok=True)
    names = ARGS[1:] or [b[0] for b in BEATS]
    for n in names:
        b = BY[n]; do_frame(b, round(b[1] + b[4] * (b[2] - b[1])), os.path.join(out, f"{n}.png"))
    json.dump({b[0]: [b[1], b[2], round(b[1] + b[4] * (b[2] - b[1]))] for b in BEATS}, open(os.path.join(H, "review", "beats.json"), "w"), indent=1)
elif MODE == "frames":
    b = BY[ARGS[1]]; step = int(ARGS[2]) if len(ARGS) > 2 else 1
    out = os.path.join(H, "review", "anim", b[0]); os.makedirs(out, exist_ok=True)
    for f in range(b[1], b[2], step):
        do_frame(b, f, os.path.join(out, f"{f:05d}.png"), (270, 480))
elif MODE == "final":
    # full-res frames for the final cut: renders/frames/#####.png  (args: first last)
    a_, b_ = int(ARGS[1]), int(ARGS[2])
    out = os.path.join(H, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a_, b_):
        p_ = os.path.join(out, f"{f:05d}.png")
        if os.path.exists(p_):
            continue
        do_frame(next(x for x in BEATS if x[1] <= f < x[2]), f, p_, (1080, 1920))
elif MODE == "thumb":
    # thumbnail plate: the owner mid fake-throw (arm forward, empty hand), the ball hidden behind his back in the other
    # hand; the dog sits in front of him giving a heavy side-eye; red 3D "?" over the empty hand.  thumb.py adds "LIAR."
    out = os.path.join(H, "renders", "thumb"); os.makedirs(out, exist_ok=True)
    reset()
    o_at = (0.59, -0.22, 0); cpos = (2.05, -2.4, 0.8)
    OWNER.show(True, o_at, yaw_to(o_at, (o_at[0] - 0.76, o_at[1] - 0.65)))
    za = OWNER.J["z_armpit"]
    pose_arm(OWNER, "R", (0.24, -0.3, za + 0.05), (0.22, -0.6, za + 0.2))
    pose_arm(OWNER, "L", (0.2, 0.12, za - 0.3), (0.1, 0.26, za - 0.45))
    OWNER.rot("neck", [((0, 0, 1), 0.15)])
    hold_ball(OWNER, "L")
    d_at = (1.24, -1.72, 0)
    dd = dog(0, d_at, yaw_to(d_at, (cpos[0] - 0.5, cpos[1])), "judging", 0.3); dog_sit(0)
    hx, hy, hz = OWNER.hand_pos("R")
    QMARK.root.location = (hx, hy, hz + 0.32); QMARK.root.rotation_euler = (math.pi / 2, 0, math.atan2(cpos[0] - hx, -(cpos[1] - hy)))
    QMARK.anim(2.0, 0.0, scale=1.3)
    cam(cpos, (0.6, -0.7, 0.95), 24)
    render(os.path.join(out, "A.png"), (1080, 1920))
elif MODE == "feetscan":
    # every 2nd frame of every beat: the dog's lowest vertex against its support (floor z = 0) + the paw tips
    rows = []
    for b in BEATS:
        worst = []
        for f in range(b[1], b[2], 2):
            sc.frame_set(f); reset(); b[3]((f - b[1]) / FPS, (b[2] - b[1]) / FPS); bpy.context.view_layer.update()
            if DOGS[0]["o"].hide_render:
                continue
            dg = bpy.context.evaluated_depsgraph_get(); P_ = dog_low(dg)
            am = DOGS[0]["arm"]; paws = [(am.matrix_world @ am.pose.bones[bn].tail).z for bn in ("paw_f.L", "paw_f.R", "paw_h.L", "paw_h.R")]
            worst.append((f, float(P_[:, 2].min()), min(paws), max(paws)))
        if worst:
            lo = min(w[1] for w in worst); hi = max(w[1] for w in worst); pmax = max(w[3] for w in worst)
            rows.append(f"{b[0]}: lowest vertex {lo:+.3f}..{hi:+.3f} m, highest paw tip {pmax:+.3f} m over {len(worst)} frames")
    open(os.path.join(H, "review", "feet_check.txt"), "w").write("\n".join(rows) + "\n"); print("\n".join(rows))
elif MODE == "pose":
    # pose self-check: beat poses seen from the side (feet, extra arms, floating, hands)
    out = os.path.join(H, "review", "pose"); os.makedirs(out, exist_ok=True)
    TESTS = [("01a", 0.3), ("01a", 0.55), ("01a", 0.8), ("02a", 1.0), ("04a", 1.0), ("05a", 0.9), ("07", 0.5), ("10a", 0.5), ("10b", 1.0), ("11a", 1.0), ("12a", 1.2), ("13a", 0.5)]
    for nm, tt in TESTS:
        b = BY[nm]; reset(); b[3](tt, (b[2] - b[1]) / FPS); bpy.context.view_layer.update()
        vis = [P_ for P_ in PEOPLE if not P_.body.hide_render]
        c = Vector(DOGS[0]["mv"].location) if not vis else sum((Vector(P_.arm.location) for P_ in vis), Vector()) / len(vis)
        x0 = KX if c.x > 30 else HX if c.x > 15 else 0.0
        for k, (px, py) in enumerate(((x0 + 1.8, -1.9), (x0 - 1.8, -1.9))):
            cam((px, py, 1.0), (c.x, c.y, 0.65), 26)
            render(os.path.join(out, f"{nm}_{tt:.2f}_{k}.png"), (360, 480))
elif MODE == "save":
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(H, "zaw_dog_02.blend"))

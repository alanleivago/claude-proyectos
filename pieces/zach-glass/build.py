"""zach-glass — recreation of ref 3 ("Making A Glass Cup From A Bottle") in the zach3d style.

    /Applications/Blender.app/Contents/MacOS/Blender -b -P pieces/zach-glass/build.py -- --frames 70,420,660 --out pieces/zach-glass/look
Each beat is a set placed at its own X so sets never see each other.
"""
import math
import os
import sys

import bpy
from mathutils import Euler, Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "styles", "zach3d", "kit"))
import zk  # noqa: E402

A = zk.args()
S = zk.reset()
S.frame_start, S.frame_end = 0, 31 * zk.FPS
S.cycles.samples = A["samples"]
S.render.resolution_percentage = A["scale"]
zk.world()

# ---------------------------------------------------------------- shared props

BOTTLE = [(0.0001, 0.0), (0.029, 0.0), (0.0315, 0.003), (0.0325, 0.010), (0.0325, 0.120), (0.0312, 0.134),
          (0.0255, 0.154), (0.0175, 0.171), (0.0128, 0.184), (0.0116, 0.198), (0.0113, 0.221), (0.0127, 0.2235),
          (0.0131, 0.2275), (0.0119, 0.2295)]
R_BODY = 0.0325
STRING_Z = 0.07
WALL = 0.0028
M = {
    "glass": zk.glass("glass", "#E4F1F3"),
    "label": zk.image_mat("label", os.path.join(HERE, "assets", "label.png")),
    "cap": zk.mat("cap", "#C9CBCE", rough=0.24, metal=1.0),
    "wood": zk.wood("wood"),
    "woodSide": zk.wood("woodSide", "#9A4F2C", "#5A2914", grain=30),
    "galv": zk.galvanized("galv"),
}
M["galvMacro"] = M["galv"].copy()
M["galvMacro"].name = "galvMacro"
for _nd in M["galvMacro"].node_tree.nodes:
    if _nd.bl_idname in ("ShaderNodeTexVoronoi", "ShaderNodeTexWave", "ShaderNodeTexNoise"):
        _nd.inputs["Scale"].default_value *= 9
string_mat, string_state = zk.mix_states("string", ["#B5915F", "#6E5538", "#141210"], rough=0.95)


def solid(o, t=WALL):
    md = o.modifiers.new("wall", "SOLIDIFY")
    md.thickness, md.offset = t, -1
    return o


def bottle(name, loc=(0, 0, 0), rot=(0, 0, 0), profile=BOTTLE, label=True, cap=True, string=True):
    b = solid(zk.lathe(name, profile))
    zk.assign(b, M["glass"])
    b.location, b.rotation_euler = loc, rot
    if label:
        lb = zk.lathe(name + "_label", [(0.01185, 0.1885), (0.01175, 0.2055)], seg=128, close_bottom=False)
        zk.assign(lb, M["label"])
        lb.parent = b
    if cap:
        c = zk.crown_cap(name + "_cap", material=M["cap"])
        c.location.z = 0.2285
        c.parent = b
    if string:
        s = zk.cord(name + "_cord", R_BODY, STRING_Z, string_mat, knot=math.radians(-80))
        s.parent = b
    return b


def table(x, w=1.3, d=0.5, n=7):
    """Plank table top that runs out of frame, satin wood, bevelled planks + a darker apron."""
    pw = d / n
    for i in range(n):
        p = zk.rbox(f"plank{x}_{i}", (w, pw - 0.003, 0.028), bevel=0.0035, loc=(x, -d / 2 + (i + 0.5) * pw, -0.014))
        p.location.z += 0.0008 * math.sin(i * 2.3)
        zk.assign(p, M["wood"])
    ap = zk.rbox(f"apron{x}", (w - 0.03, d - 0.05, 0.075), bevel=0.006, loc=(x, 0.0, -0.067))
    zk.assign(ap, M["woodSide"])


# ---------------------------------------------------------------- beat 2: the bottle tinted on "glass bottle"

X2 = 0.0
table(X2)
b2 = bottle("bottle2", (X2, 0.0, 0.0))
hl2 = zk.highlight(b2, "#F2E26A", scale=1.03, strength=2.2)
zk.pulse(hl2, 70, 96, fade_in=5, fade_out=8)
zk.studio((X2, 0, 0.12), k=0.55)
cam2 = zk.camera("cam_b2", fov_v=30)
zk.cam_move(cam2, 60, 102, (X2 + 0.03, -0.62, 0.21), (X2 + 0.03, -0.70, 0.22), (X2, 0, 0.105), (X2, 0, 0.11))
zk.backdrop(cam2)

# ---------------------------------------------------------------- beat 7: cross-section of the hot band, under water

X7 = 3.0
cutter = zk.rbox("cutter7", (0.3, 0.2, 0.5), bevel=0.0, loc=(X7, -0.1, 0.1))
cutter.hide_render = True
cutter.hide_viewport = True


def halve(o):
    bo = o.modifiers.new("half", "BOOLEAN")
    bo.object, bo.operation, bo.solver = cutter, "DIFFERENCE", "EXACT"
    return o


ROT7 = (0, math.radians(180), math.radians(4))   # upside down, held by its base under the water
LOC7 = (X7, 0, 0.16)
b7 = halve(bottle("bottle7", LOC7, ROT7, profile=BOTTLE[:6], label=False, cap=False, string=False))
# heat map inside the wall section, only where the cut shows it: red core, orange fringe (spec 8.3, ref 3 [13.25])
for i, (hz, em, col) in enumerate([(0.003, 12.0, "#FF1E14"), (0.005, 6.0, "#FF3220"), (0.0075, 3.0, "#FF4A2C"),
                                   (0.010, 1.5, "#FF6A44"), (0.013, 0.6, "#FF8A66")]):
    slab = zk.rbox(f"heat7_{i}", (WALL * (0.80 - 0.07 * i), 0.0016 + 0.0004 * i, 2 * hz), bevel=WALL * 0.3,
                   loc=(0, 0, 0))
    slab.parent = b7
    slab.location = (R_BODY - WALL / 2, 0.0010 + 0.0004 * i, STRING_Z)  # world -X wall after the flip
    zk.assign(slab, zk.mat(f"heat{i}", col, rough=0.3, emit=col, emit_k=em, alpha=0.95 - 0.17 * i))
burnt = zk.cord("cord7", R_BODY, STRING_Z, zk.mat("char", "#121010", rough=0.9), tails=0.0)
burnt.location, burnt.rotation_euler = LOC7, ROT7
for o in [burnt, *burnt.children]:
    o.parent = None
    o.location, o.rotation_euler = LOC7, ROT7
    o = zk.to_mesh(o)
    # drop the front half by hand: a boolean on this open tube left a big plane at y=0 that hid the whole set
    import bmesh
    bmc = bmesh.new()
    bmc.from_mesh(o.data)
    mw_ = Matrix.LocRotScale(Vector(LOC7), Euler(ROT7), None)
    bmesh.ops.delete(bmc, geom=[v for v in bmc.verts if (mw_ @ v.co).y < 0], context="VERTS")
    bmc.to_mesh(o.data)
    bmc.free()
bucket7 = zk.lathe("bucket7", [(0.15, -0.12), (0.16, 0.30)], seg=160, close_bottom=False)
bucket7.location = (X7, 0.0, -0.05)
zk.assign(bucket7, M["galvMacro"])
floor7 = zk.cyl("bucketfloor7", 0.16, 0.004, loc=(X7, 0, -0.12))
zk.assign(floor7, M["galv"])
water = zk.rbox("water7", (0.33, 0.33, 0.36), bevel=0.0, loc=(X7, 0, 0.06))
wm = bpy.data.materials.new("water")
wm.use_nodes = True
wm.node_tree.nodes.remove(wm.node_tree.nodes["Principled BSDF"])
va = wm.node_tree.nodes.new("ShaderNodeVolumeAbsorption")
va.inputs["Color"].default_value = (*zk.srgb("#9FB8BE"), 1)
va.inputs["Density"].default_value = 1.2
wm.node_tree.links.new(va.outputs[0], wm.node_tree.nodes["Material Output"].inputs["Volume"])
zk.assign(water, wm)
ice_m = zk.mat("ice", "#EAF8FF", rough=0.12, trans=0.95, ior=1.31)
for i, (ix, iy, iz, r) in enumerate([(0.05, 0.06, 0.20, 20), (-0.07, 0.09, 0.21, 50), (0.10, 0.10, 0.19, 10),
                                      (-0.03, 0.05, 0.215, 70), (0.02, -0.03, 0.205, 35)]):
    c = zk.rbox(f"ice{i}", (0.03, 0.03, 0.03), bevel=0.005, loc=(X7 + ix, iy, iz))
    c.rotation_euler = (math.radians(r), math.radians(r * 0.7), math.radians(r * 1.3))
    zk.assign(c, ice_m)
bub_m = zk.mat("bubble", "#FFFFFF", rough=0.03, trans=1.0, ior=1.33)
for i in range(24):
    a = i * 2.4
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0005 + 0.0004 * (i % 3), location=(
        X7 - R_BODY - 0.002 - 0.006 * math.cos(a), -0.004 - 0.01 * abs(math.sin(a * 1.7)), 0.05 + 0.004 * i))
    zk.smooth(bpy.context.object)
    zk.assign(bpy.context.object, bub_m)
zk.area("key7", (X7 - 0.12, -0.18, 0.4), (X7 + R_BODY, 0, 0.09), 0.3, 18, "#EAF6FF")
zk.area("wall7", (X7 - 0.06, -0.10, 0.22), (X7 + 0.03, 0.17, 0.06), 0.5, 14, "#DDE8EC")
band7 = halve(zk.lathe("band7", [(R_BODY + 0.0004, STRING_Z - 0.0055), (R_BODY + 0.0004, STRING_Z + 0.0055)],
                       close_bottom=False))
band7.location, band7.rotation_euler = LOC7, ROT7
zk.assign(band7, zk.mat("soot", "#0E0C0B", rough=0.85))
zk.area("rim7", (X7 - 0.15, 0.12, 0.2), (X7 - R_BODY, 0, 0.09), 0.2, 10, "#9FD8EA")
# the soot band on the far inner wall, seen through the cut (right of the strip, ref 3 [14.0])
_bc = bpy.data.curves.new("farband7", "CURVE")
_bc.dimensions, _bc.extrude = "3D", 0.0055
_sp = _bc.splines.new("POLY")
_sp.points.add(63)
for i in range(64):
    a = math.pi * (0.02 + 0.96 * i / 63)
    _sp.points[i].co = ((R_BODY + 0.0006) * math.cos(a), (R_BODY + 0.0006) * math.sin(a), 0, 1)
_fb = zk.link("farband7", _bc)
_bc.materials.append(bpy.data.materials["soot"])
_fb.location = (X7, 0, LOC7[2] - STRING_Z)
cam7 = zk.camera("cam_b7", fov_v=28, dof=0.10, fstop=32)
zk.cam_move(cam7, 400, 488, (X7 - R_BODY + 0.004, -0.115, 0.092), (X7 - R_BODY + 0.005, -0.095, 0.090),
            (X7 - R_BODY + 0.009, 0.0, 0.090), (X7 - R_BODY + 0.009, 0.0, 0.090), roll0=14, roll1=16)
zk.backdrop(cam7, "#4E6E78", "#1E3038", dist=0.5)

# ---------------------------------------------------------------- beat 9: the two halves glowing

X9 = 6.0
BASE = [p for p in BOTTLE if p[1] < STRING_Z] + [(R_BODY, STRING_Z)]
base = solid(zk.lathe("base9", BASE, close_bottom=True))
zk.assign(base, M["glass"])
base.location = (X9 + 0.03, -0.004, 0.118)
base.rotation_euler = (math.radians(-55), math.radians(-28), math.radians(-10))
NECK = [(R_BODY, STRING_Z)] + [p for p in BOTTLE if p[1] > STRING_Z]
neck = solid(zk.lathe("neck9", NECK, close_bottom=False))
zk.assign(neck, M["glass"])
neck.location = (X9 - 0.15, 0.06, -0.125)
neck.rotation_euler = (math.radians(-40), math.radians(38), 0)
hb9 = zk.highlight(base, "#58F24A", scale=1.02, strength=3.2)
hn9 = zk.highlight(neck, "#6E6BFF", scale=1.02, strength=3.6)
zk.pulse(hb9, 650, 690, 4, 8)
zk.pulse(hn9, 652, 690, 4, 8)
POSES = {"grip": dict(curl=(0.35, 0.42, 0.48, 0.55, 0.62), spread=0.05, thumb_open=0.55, arm=0.22),
         "open": dict(curl=(0.1, 0.1, 0.1, 0.12, 0.15), spread=0.1, thumb_open=0.9, arm=0.22)}
h9 = zk.Hand("hand9", POSES, side=1)
h9.key(600, "grip")
h9.root.location = (X9 + 0.115, 0.012, 0.062)
h9.root.rotation_euler = (math.radians(180), math.radians(-25), math.radians(-95))
rim = zk.lathe("rim9", [(0.16, -0.25), (0.165, 0.0), (0.172, 0.006), (0.176, 0.0)], seg=160, close_bottom=False)
rim.location = (X9 + 0.13, 0.05, -0.12)
rim.rotation_euler = (math.radians(-25), 0, 0)
zk.assign(rim, M["galv"])
zk.studio((X9, 0, 0.1))
cam9 = zk.camera("cam_b9", fov_v=32)
zk.cam_move(cam9, 630, 688, (X9 - 0.02, -0.60, 0.07), (X9 - 0.02, -0.60, 0.05), (X9 - 0.02, 0, 0.06),
            (X9 - 0.02, 0, 0.045))
zk.backdrop(cam9)

# ================================================================ storyboard sets (moments 1, 3-6, 8, 10-12)
# the cord darkens on "soak" and chars while it burns (one shared material, so every set agrees in time)
zk.key(string_state, "value", [(102, 0.0), (162, 1.0), (205, 1.0), (300, 2.0)], interp="LINEAR")


def M_(loc, rot=(0, 0, 0)):
    return Matrix.LocRotScale(Vector(loc), Euler(rot), None)


def deg(*a):
    return tuple(math.radians(v) for v in a)


# the approved beat-9 grip (hand around the base), reused as a relation hand <-> bottle base
GRIP_REL = M_(base.location, base.rotation_euler).inverted() @ M_(h9.root.location, h9.root.rotation_euler)
MIRROR = Matrix.Scale(-1, 4, (1, 0, 0))
POSES.update({
    "pinch": dict(curl=(0.35, 0.30, 0.55, 0.70, 0.80), spread=0.06, thumb_open=0.55, arm=0.20),
    "press": dict(curl=(0.15, 0.30, 0.32, 0.36, 0.40), spread=0.07, thumb_open=0.75, arm=0.22),
    "neck": dict(curl=(0.55, 0.62, 0.70, 0.78, 0.85), spread=0.03, thumb_open=0.40, arm=0.22),
    # wrap a 6.5 cm glass/bottle body: fingers follow the side, thumb around the other way (self-check: wrap_check)
    "wrap": dict(curl=((15, 10, 10), (42, 58, 40), (45, 60, 40), (47, 62, 40), (50, 64, 40)), spread=0.015,
                 thumb_open=0.5, arm=0.32, thumb_dir=(0.0, 0.35, -0.94), thumb_bend=(15, 20)),
    # palm on top of a lying bottle: fingers down the front (clear of the table), thumb over the back, away from the
    # fire (solved offline: skin >= 1.5 mm off the glass, >= 8 mm above the table)
    "roll": dict(curl=((15, 10, 10), (8, 55, 45), (10, 58, 45), (12, 61, 45), (14, 64, 45)), spread=0.015,
                 thumb_open=0.5, arm=0.32, thumb_dir=(-0.3, -0.9, -0.2), thumb_bend=(15, 20)),
    # left hand over the neck of the LYING bottle: a full fist cannot fit between neck and table, so the fingers
    # drape over the front and the thumb lies over the back (solved offline: >= 3 mm off glass and table)
    "neckdrape": dict(curl=((15, 10, 10), (0, 40, 30), (2, 44, 30), (6, 46, 30), (10, 48, 30)), spread=0.01,
                      thumb_open=0.5, arm=0.32, thumb_dir=(-0.3, -0.9, -0.2), thumb_bend=(15, 20)),
    # wrap a 2.5 cm bottle neck: nearly a fist
    "neckwrap": dict(curl=((15, 10, 10), (62, 82, 55), (64, 86, 56), (68, 88, 56), (72, 90, 56)), spread=0.01,
                     thumb_open=0.5, arm=0.32, thumb_dir=(0.0, 0.9, -0.45), thumb_bend=(20, 30)),
    # thumb + index pinch: the thumb aim was solved offline so the two pads meet (self-check: isolated pinch views)
    "pinch2": dict(curl=((15, 10, 10), (60, 85, 25), (48, 68, 40), (54, 74, 44), (60, 80, 45)), spread=0.05,
                   thumb_open=0.4, arm=0.32, thumb_bend=(8, 12), thumb_dir=(-0.0801, 0.7618, -0.6428)),
})
_, _n = zk.hand_points(**POSES["pinch2"])
PINCH_P = (_n[0][0] + _n[1][0]) / 2              # midpoint of thumb tip and index tip, hand-local (right hand)


def pinch_at(name, side, point, fingers, back, pose="pinch2"):
    """Place a hand so its thumb-index pinch lands on `point` (world)."""
    m = frame_from(fingers, back, (0, 0, 0))
    pl = Vector((PINCH_P.x * side, PINCH_P.y, PINCH_P.z))
    m.translation = Vector(point) - m.to_3x3() @ pl
    return hand(name, pose, m, side)


def hand(name, pose, m, side=1):
    h = zk.Hand(name, POSES, side=side)
    h.key(1, pose)
    h.root.matrix_world = m
    return h.snap_nails()


def hold(name, obj_m, spin=0.0, pose="grip", side=1):
    rel = GRIP_REL if side > 0 else MIRROR @ GRIP_REL @ MIRROR
    return hand(name, pose, obj_m @ Matrix.Rotation(math.radians(spin), 4, "Z") @ rel, side)


def frame_from(fingers, back, origin):
    """Hand root matrix: fingers (+Y local) along `fingers`, back of the hand (+Z local) along `back`."""
    y = Vector(fingers).normalized()
    z = (Vector(back) - y * Vector(back).dot(y)).normalized()
    x = y.cross(z)
    m = Matrix((x, y, z)).transposed().to_4x4()
    m.translation = Vector(origin)
    return m


def fire_mat(name, k=28.0, alpha_blend=0.45):
    """Licking flame: white-yellow core facing the camera -> orange edges, edges fade to transparent,
    tips orange (Generated Z)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    L = nt.links.new
    N = nt.nodes.new
    out, tr, em, add = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfTransparent"), N("ShaderNodeEmission"), \
        N("ShaderNodeAddShader")
    tc, sep, lw, mxc, ramp, rz, mx, mul = (N(t) for t in (
        "ShaderNodeTexCoord", "ShaderNodeSeparateXYZ", "ShaderNodeLayerWeight", "ShaderNodeMath",
        "ShaderNodeValToRGB", "ShaderNodeValToRGB", "ShaderNodeMixShader", "ShaderNodeMath"))
    # colour: facing (core) and height both push to white; edges and tips orange
    mxc.operation = "MULTIPLY"
    inv = N("ShaderNodeMath")
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    L(lw.outputs["Facing"], inv.inputs[1])
    L(inv.outputs[0], mxc.inputs[0])
    L(tc.outputs["Generated"], sep.inputs[0])
    rz.color_ramp.elements[0].color = (1, 1, 1, 1)
    rz.color_ramp.elements[1].color = (0.25, 0.25, 0.25, 1)
    rz.color_ramp.elements[0].position, rz.color_ramp.elements[1].position = 0.25, 0.95
    L(sep.outputs["Z"], rz.inputs["Fac"])
    L(rz.outputs["Color"], mxc.inputs[1])
    ramp.color_ramp.elements[0].color = (*zk.srgb("#FF6A1A"), 1)
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[1].color = (*zk.srgb("#FFF8E0"), 1)
    ramp.color_ramp.elements[1].position = 0.85
    L(mxc.outputs[0], ramp.inputs["Fac"])
    L(ramp.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = k
    # opacity: soft edges (facing^0.5)
    lw.inputs["Blend"].default_value = alpha_blend
    mul.operation = "POWER"
    mul.inputs[1].default_value = 0.3
    L(inv.outputs[0], mul.inputs[0])
    L(mul.outputs[0], mx.inputs["Fac"])
    L(tr.outputs[0], mx.inputs[1])
    L(em.outputs[0], add.inputs[0])
    L(tr.outputs[0], add.inputs[1])
    L(add.outputs[0], mx.inputs[2])
    L(mx.outputs[0], out.inputs["Surface"])
    return m


def halo_mat(name, col="#FF8A30", k=2.5):
    """Soft additive glow shell: emission falls off towards the silhouette (fake bloom in-render)."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    N, L = nt.nodes.new, nt.links.new
    out, tr, em, add, lw, pw = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfTransparent"), \
        N("ShaderNodeEmission"), N("ShaderNodeAddShader"), N("ShaderNodeLayerWeight"), N("ShaderNodeMath")
    pw.operation = "POWER"
    pw.inputs[1].default_value = 4.0
    lw.inputs["Blend"].default_value = 0.5
    inv = N("ShaderNodeMath")                     # Facing is 0 toward the camera: invert -> bright centre
    inv.operation = "SUBTRACT"
    inv.inputs[0].default_value = 1.0
    L(lw.outputs["Facing"], inv.inputs[1])
    L(inv.outputs[0], pw.inputs[0])
    em.inputs["Color"].default_value = (*zk.srgb(col), 1)
    mk = N("ShaderNodeMath")
    mk.operation = "MULTIPLY"
    mk.inputs[1].default_value = k
    L(pw.outputs[0], mk.inputs[0])
    L(mk.outputs[0], em.inputs["Strength"])
    L(tr.outputs[0], add.inputs[0])
    L(em.outputs[0], add.inputs[1])
    L(add.outputs[0], out.inputs["Surface"])
    return m


FIRE = fire_mat("fire")
FIRE_CORE = zk.mat("firecore", "#FFF8E0", emit="#FFF8E0", emit_k=320)
HALO_IN = halo_mat("firehalo_in", "#FFC070", 14.0)
HALO_OUT = halo_mat("firehalo_out", "#FF7A2A", 6.0)


def fire_ring(name, bm, R=R_BODY, z=STRING_Z, n=90, h=0.022, k=1.0):
    """Ring of fire on the cord (ref 3 [6.75]): a thin, very bright white-yellow line right on the cord, many small
    thin licking tongues (teardrops bent and tilted by deterministic noise, rising in WORLD +Z, shorter under the
    ring) and two soft additive halo shells as in-render bloom."""
    M0 = bm @ Matrix.Translation((0, 0, z))
    core = zk.torus(name + "_core", R + 0.0021, 0.00075, mnr=10)
    core.matrix_world = M0
    zk.assign(core, FIRE_CORE)
    for nm_, rr_, mat_ in (("_halo1", 0.0032, HALO_IN), ("_halo2", 0.0085, HALO_OUT)):
        hl = zk.torus(name + nm_, R + 0.0024, rr_ * k, mnr=24)
        hl.matrix_world = M0
        zk.assign(hl, mat_)
        hl.visible_shadow = hl.visible_diffuse = hl.visible_glossy = False
    up = Vector((0, 0, 1))
    for i in range(n):
        th = 2 * math.pi * (i + 0.5 * math.sin(i * 7.3)) / n
        rr = R + 0.0023
        local = Vector((rr * math.cos(th), rr * math.sin(th), z))
        nrm = (bm.to_3x3() @ Vector((math.cos(th), math.sin(th), 0))).normalized()
        f = 0.3 + 0.7 * max(0.0, 0.3 + 0.7 * nrm.dot(up))
        nz1 = 0.5 + 0.5 * math.sin(i * 2.71 + 1.3)
        nz2 = 0.5 + 0.5 * math.sin(i * 5.17 + 0.4)
        hh = h * k * f * (0.45 + 0.75 * nz1 * nz2 + 0.25 * nz2)
        w = 0.0020 * (0.75 + 0.5 * nz1)
        t = zk.lathe(f"{name}_t{i}", [(0.0001, 0), (w * 1.1, 0.12 * hh), (w * 1.15, 0.3 * hh), (w * 0.6, 0.6 * hh),
                                     (w * 0.2, 0.88 * hh), (0.00005, hh)], seg=12)
        bx, by = 0.35 * math.sin(i * 3.7), 0.35 * math.cos(i * 4.9)     # lateral S-bend: licking
        for v in t.data.vertices:
            u = v.co.z / hh
            v.co.x += hh * bx * u * u
            v.co.y += hh * by * u * u * (1 - u) * 2
        t.location = bm @ local + nrm * 0.0006
        t.rotation_euler = Euler((0.22 * math.sin(i * 1.7) + 0.35 * nrm.y, -0.35 * nrm.x + 0.22 * math.cos(i * 2.3), 0))
        zk.assign(t, FIRE)
        t.visible_shadow = False
    return core


def label_plane(name, img, size, parent, loc, rot):
    bpy.ops.mesh.primitive_plane_add(size=1)
    p = bpy.context.object
    p.name = name
    p.scale = (*size, 1)
    p.parent, p.location, p.rotation_euler = parent, loc, rot
    zk.assign(p, zk.image_mat(name, os.path.join(HERE, "assets", img), rough=0.35))
    return p


def lighter(name, loc, rot):
    body = zk.rbox(name, (0.016, 0.075, 0.009), bevel=0.0035, loc=(0, 0, 0))
    zk.assign(body, zk.mat(name + "_m", "#D42A2A", rough=0.25, coat=0.5))
    body.location, body.rotation_euler = loc, rot
    top = zk.rbox(name + "_top", (0.0165, 0.014, 0.0095), bevel=0.002, loc=(0, 0.044, 0))
    zk.assign(top, M["cap"])
    top.parent = body
    wheel = zk.cyl(name + "_wheel", 0.0035, 0.006, loc=(0, 0.05, 0.004), verts=24)
    wheel.rotation_euler = (0, math.radians(90), 0)
    zk.assign(wheel, zk.mat(name + "_wm", "#3A3C40", rough=0.4, metal=1.0))
    wheel.parent = body
    label_plane(name + "_lbl", "lighter_label.png", (0.04, 0.011), body, (0, -0.006, 0.0046), (0, 0, math.radians(90)))
    return body


def arrow(name, center, axis_rot, r, a0, a1, width=0.006, col="#2F4CF0"):
    """Curved 3D rotation arrow: a flat extruded arc + a wide triangular head (spec 8.4)."""
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.extrude, cu.bevel_depth, cu.bevel_resolution = width * 0.5, width * 0.18, 3
    sp = cu.splines.new("POLY")
    N = 48
    sp.points.add(N - 1)
    for i in range(N):
        a = a0 + (a1 - a0) * i / (N - 1)
        sp.points[i].co = (r * math.cos(a), r * math.sin(a), 0, 1)
    o = zk.link(name, cu)
    m = zk.mat(name + "_m", col, rough=0.3, emit=col, emit_k=0.6, coat=0.4)
    cu.materials.append(m)
    o.matrix_world = Matrix.Translation(center) @ axis_rot
    hd = zk.rbox(name + "_head", (1, 1, 1), bevel=0.0008, loc=(0, 0, 0))
    me = hd.data
    me.clear_geometry()
    L_, Wd = width * 1.9, width * 1.8
    vs = [(0, -Wd / 2, -width * 0.35), (0, Wd / 2, -width * 0.35), (L_, 0, -width * 0.35),
          (0, -Wd / 2, width * 0.35), (0, Wd / 2, width * 0.35), (L_, 0, width * 0.35)]
    me.from_pydata(vs, [], [(0, 2, 1), (3, 4, 5), (0, 1, 4, 3), (1, 2, 5, 4), (2, 0, 3, 5)])
    hd.modifiers["bevel"].width = 0.0009
    zk.assign(hd, m)
    hd.parent = o
    d = 1 if a1 > a0 else -1
    hd.location = (r * math.cos(a1), r * math.sin(a1), 0)
    # head points along the tangent, its flat side in the arc plane (curve extrude is along local Z)
    hd.rotation_euler = (math.radians(90), 0, a1 + d * math.pi / 2)
    return o


def bucket_set(x):
    """The beat-7 bucket: scratched galvanized wall + floor, filled with water."""
    b = zk.lathe(f"bucket{x}", [(0.15, -0.12), (0.16, 0.30)], seg=160, close_bottom=False)
    b.location = (x, 0.0, -0.05)
    zk.assign(b, M["galv"])
    fl = zk.cyl(f"bucketfloor{x}", 0.16, 0.004, loc=(x, 0, -0.12))
    zk.assign(fl, M["galv"])
    wv = zk.rbox(f"water{x}", (0.33, 0.33, 0.36), bevel=0.0, loc=(x, 0, 0.06))
    zk.assign(wv, wm)
    return b


# ---------------------------------------------------------------- moment 1: hands tie the cord (ECU of the knot)

X1 = 10.0
table(X1)
b1 = bottle("bottle1", (X1, 0, 0))
KN = math.radians(-80)
kpos = Vector((X1 + 0.0368 * math.cos(KN), 0.0368 * math.sin(KN), STRING_Z + 0.002))
tens = zk.mat("tension", "#F0D890", rough=0.4, emit="#F2E26A", emit_k=4.0)
for i in range(9):                      # radial tension strokes around the knot (spec 8.4, ref 3 [1.75])
    side = -1 if i % 2 else 1
    th = KN + side * math.radians(16 + 13 * (i // 2))
    rr_ = R_BODY + 0.006
    p = Vector((X1 + rr_ * math.cos(th), rr_ * math.sin(th), STRING_Z + 0.002 + (0.0065 if i % 3 else -0.006)))
    s = zk.rbox(f"tens{i}", (0.0011, 0.0011, 0.0065), bevel=0.0005)
    s.location = p   # rbox bakes loc into the mesh, so rotated boxes get their location afterwards
    s.rotation_euler = (0, side * math.radians(20 + 8 * (i // 2)) * (1 if p.z > STRING_Z else -1), th + math.pi / 2)
    zk.assign(s, tens)
# fingertips from both sides pinch the two loops next to the knot
for sd in (1, -1):    # thumb + index pinch the cord either side of the knot
    th_ = KN + sd * math.radians(42)
    pp = Vector((X1 + (R_BODY + 0.0065) * math.cos(th_), (R_BODY + 0.0065) * math.sin(th_), STRING_Z + 0.002))
    nn = Vector((math.cos(th_), math.sin(th_), 0))
    # the cord runs across the pads (hand X = cord tangent); fingers up from below, back of the hand facing out
    pinch_at(f"hand1{'r' if sd > 0 else 'l'}", sd, pp, nn * 0.25 + Vector((0, 0, 1)), nn)
zk.studio((X1, 0, 0.08), k=0.55)
cam1 = zk.camera("cam_b1", fov_v=30, dof=0.37, fstop=8)
zk.cam_move(cam1, 30, 60, (X1 + 0.006, -0.42, 0.080), (X1 + 0.006, -0.37, 0.076), (X1 + 0.004, 0, 0.074),
            (X1 + 0.004, 0, 0.073))
zk.backdrop(cam1, dist=1.5)

# ---------------------------------------------------------------- moment 3: lighter fluid on the cord (low angle)

X3 = 14.0
table(X3)
b3 = bottle("bottle3", (X3, 0, 0))
can = zk.rbox("can3", (0.072, 0.03, 0.13), bevel=0.006, loc=(0, 0, 0))
zk.assign(can, zk.mat("canm", "#141416", rough=0.32, metal=0.6, coat=0.5))
can.location, can.rotation_euler = (X3 + 0.078, -0.035, 0.112), deg(0, -62, -22)
label_plane("can3_lbl", "fluid_label.png", (0.06, 0.09), can, (0, -0.0153, -0.005), deg(90, 0, 0))
nz = zk.cyl("can3_nozzle", 0.0035, 0.014, loc=(-0.026, 0, 0.068), verts=24, bevel=0.0008)
zk.assign(nz, zk.mat("nozz", "#B8BCC2", rough=0.25, metal=1.0))
nz.parent = can
bpy.context.view_layer.update()
tip = can.matrix_world @ Vector((-0.026, 0, 0.075))
hit = Vector((X3 + 0.026, -0.022, STRING_Z + 0.004))
cu = bpy.data.curves.new("stream3", "CURVE")
cu.dimensions, cu.bevel_depth, cu.bevel_resolution = "3D", 0.0011, 4
sp = cu.splines.new("BEZIER")
sp.bezier_points.add(1)
for bp_, co, hl_, hr_ in ((sp.bezier_points[0], tip, tip, tip + Vector((-0.015, 0.002, 0.004))),
                          (sp.bezier_points[1], hit, hit + Vector((0.006, -0.002, 0.012)), hit)):
    bp_.co, bp_.handle_left, bp_.handle_right = co, hl_, hr_
fluid = zk.mat("fluid", "#F4EEC8", rough=0.03, trans=0.92, ior=1.38)
zk.link("stream3", cu).data.materials.append(fluid)
for i in range(5):                      # drips running off the soaked cord
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0012 - 0.00012 * i,
                                         location=(X3 + 0.02 - 0.009 * i, -0.031 + 0.002 * i, 0.062 - 0.006 * (i % 3)))
    bpy.context.object.scale.z = 1.5
    zk.smooth(bpy.context.object)
    zk.assign(bpy.context.object, fluid)
zk.studio((X3, 0, 0.1), k=0.6)
cam3 = zk.camera("cam_b3", fov_v=34)
zk.cam_move(cam3, 102, 160, (X3 - 0.01, -0.21, 0.016), (X3 - 0.0, -0.19, 0.014), (X3 + 0.035, 0, 0.125),
            (X3 + 0.035, 0, 0.125), roll0=-11, roll1=-13)
zk.backdrop(cam3, dist=1.5)

# ---------------------------------------------------------------- moment 4: lighter, ring of fire, hand tilts it

X4 = 18.0
table(X4)
TILT4 = math.radians(-16)
LOC4 = (X4 + 0.02, 0.0, R_BODY * math.sin(abs(TILT4)) + 0.0005)
b4 = bottle("bottle4", LOC4, (0, TILT4, 0))
bm4 = M_(LOC4, (0, TILT4, 0))
fire_ring("fire4", bm4, k=1.0)
lighter("lighter4", (X4 + 0.10, -0.07, 0.0045), deg(0, 0, -35))
neck4 = bm4 @ Vector((0, 0, 0.20))
hand("hand4", "neckwrap", zk.wrap_matrix(bm4, 0.0122, 0.200, 243, side=1, contact_y=0.072), side=1)
zk.studio((X4, 0, 0.1), k=0.6)
cam4 = zk.camera("cam_b4", fov_v=34)
zk.cam_move(cam4, 162, 210, (X4 + 0.16, -0.50, 0.28), (X4 + 0.15, -0.48, 0.27), (X4, 0, 0.10), (X4, 0, 0.10))
zk.backdrop(cam4, dist=1.5)

# ---------------------------------------------------------------- moment 5: spin it — blue rotation arrows, brown band

X5 = 22.0
table(X5)
ROT5 = (0, math.radians(90), 0)
LOC5 = (X5 - 0.09, 0.0, R_BODY + 0.0005)
b5 = bottle("bottle5", LOC5, ROT5)
bm5 = M_(LOC5, ROT5)
band5 = zk.lathe("band5", [(R_BODY + 0.0003, STRING_Z - 0.008), (R_BODY + 0.0003, STRING_Z + 0.008)],
                 close_bottom=False)
band5.parent = b5
zk.assign(band5, zk.mat("brownband", "#8A4A22", rough=0.45, alpha=0.9))
fire_ring("fire5", bm5, k=0.75)
ring5 = bm5 @ Vector((0, 0, STRING_Z))
for j, (dx, a0, a1) in enumerate(((0.026, 200, 320), (0.052, 20, 140))):
    arrow(f"arrow5_{j}", ring5 + Vector((dx, 0, 0)), Matrix.Rotation(math.radians(90), 4, "Y"),
          0.056, math.radians(a0), math.radians(a1), col="#2F4CF0")
# palm on top of the base end, fingers wrap down the front (arm goes away from camera); left fist on the neck
hand("hand5r", "roll", zk.wrap_matrix(bm5, R_BODY, 0.012, 185, side=1, contact_y=0.09, gap=0.003), side=1)
hand("hand5l", "neckdrape", zk.wrap_matrix(bm5, 0.0122, 0.210, 180, side=-1, contact_y=0.072, gap=0.002), side=-1)
zk.studio((X5, 0, 0.05), k=0.6)
cam5 = zk.camera("cam_b5", fov_v=34)
zk.cam_move(cam5, 210, 260, (X5 - 0.30, -0.42, 0.30), (X5 - 0.27, -0.38, 0.27), (X5 - 0.02, 0, 0.03),
            (X5 - 0.02, 0, 0.03))
zk.backdrop(cam5, dist=1.5)

# ---------------------------------------------------------------- moment 6: dunk it in ice water — tinted blue

X6 = 26.0
table(X6, d=0.6)
bk = zk.lathe("bucket6", [(0.125, 0.0), (0.158, 0.21)], seg=160, close_bottom=True)
solid(bk, 0.0025)
bk.location = (X6, 0.0, 0.003)
zk.assign(bk, M["galv"])
rim6 = zk.torus("bucketrim6", 0.159, 0.0042)
rim6.location = (X6, 0, 0.213)
zk.assign(rim6, M["galv"])
for s_ in (-1, 1):
    ear = zk.rbox(f"ear6{s_}", (0.004, 0.02, 0.025), bevel=0.003, loc=(X6 + s_ * 0.152, 0, 0.19))
    zk.assign(ear, M["galv"])
hcu = bpy.data.curves.new("handle6", "CURVE")
hcu.dimensions, hcu.bevel_depth = "3D", 0.0025
sp = hcu.splines.new("POLY")
sp.points.add(40)
for i in range(41):
    a = math.pi * i / 40
    sp.points[i].co = (0.154 * math.cos(a), 0, 0.12 * math.sin(a), 1)
hdl = zk.link("handle6", hcu)
hcu.materials.append(M["galv"])
hdl.location, hdl.rotation_euler = (X6, 0, 0.19), (math.radians(-62), 0, 0)
w6 = zk.lathe("water6", [(0.0001, 0.006), (0.123, 0.006), (0.148, 0.165), (0.0001, 0.165)], seg=128)
w6.location = (X6, 0, 0.003)
w6m = zk.mat("water6m", "#C8DCE0", rough=0.02, trans=1.0, ior=1.33)
_va = w6m.node_tree.nodes.new("ShaderNodeVolumeAbsorption")
_va.inputs["Color"].default_value = (*zk.srgb("#6E9AA4"), 1)
_va.inputs["Density"].default_value = 5.0
w6m.node_tree.links.new(_va.outputs[0], w6m.node_tree.nodes["Material Output"].inputs["Volume"])
zk.assign(w6, w6m)
for i, (ix, iy, r) in enumerate([(-0.07, 0.05, 15), (-0.03, 0.09, 40), (0.02, 0.10, 70), (-0.09, -0.02, 25),
                                 (-0.05, -0.07, 55), (0.0, -0.09, 10), (0.06, -0.08, 33), (-0.10, 0.07, 80),
                                 (0.08, 0.07, 60), (-0.01, 0.03, 5)]):
    c = zk.rbox(f"ice6_{i}", (0.026, 0.026, 0.024), bevel=0.0045)
    c.location = (X6 + ix, iy, 0.168)
    c.rotation_euler = (math.radians(r * 0.3), math.radians(r * 0.2), math.radians(r))
    zk.assign(c, ice_m)
ROT6 = (math.radians(180), math.radians(-14), 0)
LOC6 = (X6 + 0.045, -0.01, 0.31)
b6 = bottle("bottle6", LOC6, ROT6, label=True)
bm6 = M_(LOC6, ROT6)
hb6 = zk.highlight(b6, "#2A55FF", scale=1.02, strength=3.0)
zk.pulse(hb6, 330, 380, 5, 8)
hold("hand6", bm6, spin=200)
steam = zk.rbox("steam6", (0.22, 0.22, 0.08), bevel=0.0)
steam.location = (X6, 0, 0.215)
stm = bpy.data.materials.new("steam")
stm.use_nodes = True
_s = stm.node_tree
_s.nodes.remove(_s.nodes["Principled BSDF"])
_spv = _s.nodes.new("ShaderNodeVolumePrincipled")
_snz = _s.nodes.new("ShaderNodeTexNoise")
_snz.inputs["Scale"].default_value = 30
_snz.inputs["Detail"].default_value = 3
_smr = _s.nodes.new("ShaderNodeMapRange")
_smr.inputs["From Min"].default_value, _smr.inputs["From Max"].default_value = 0.55, 0.8
_smr.inputs["To Max"].default_value = 14.0
_sg = _s.nodes.new("ShaderNodeTexGradient")      # fades out upwards
_sg.gradient_type = "SPHERICAL"
_stc = _s.nodes.new("ShaderNodeTexCoord")
_smul = _s.nodes.new("ShaderNodeMath")
_smul.operation = "MULTIPLY"
_s.links.new(_stc.outputs["Object"], _snz.inputs["Vector"])
_smp = _s.nodes.new("ShaderNodeMapping")
_smp.inputs["Scale"].default_value = (5, 5, 9)
_s.links.new(_stc.outputs["Object"], _smp.inputs["Vector"])
_s.links.new(_smp.outputs[0], _sg.inputs["Vector"])
_s.links.new(_snz.outputs["Fac"], _smr.inputs["Value"])
_s.links.new(_smr.outputs[0], _smul.inputs[0])
_s.links.new(_sg.outputs[0], _smul.inputs[1])
_s.links.new(_smul.outputs[0], _spv.inputs["Density"])
_spv.inputs["Color"].default_value = (1, 1, 1, 1)
_s.links.new(_spv.outputs[0], _s.nodes["Material Output"].inputs["Volume"])
zk.assign(steam, stm)
zk.studio((X6, 0, 0.17), k=0.7)
cam6 = zk.camera("cam_b6", fov_v=34)
zk.cam_move(cam6, 300, 396, (X6 - 0.03, -0.40, 0.66), (X6 - 0.03, -0.45, 0.70), (X6 + 0.02, 0.0, 0.17),
            (X6 + 0.02, 0.0, 0.17))
zk.backdrop(cam6, dist=1.5)

# ---------------------------------------------------------------- moment 8: the crack runs around the black band

X8 = 30.0
bucket_set(X8)
ROT8 = (math.radians(180), 0, 0)
LOC8 = (X8, 0, 0.16)
b8 = bottle("bottle8", LOC8, ROT8, label=False, cap=False, string=False)
bm8 = M_(LOC8, ROT8)
band8 = zk.lathe("band8", [(R_BODY + 0.0004, STRING_Z - 0.0055), (R_BODY + 0.0004, STRING_Z + 0.0055)],
                 close_bottom=False)
band8.parent = b8
zk.assign(band8, bpy.data.materials["soot"])
cr = bpy.data.curves.new("crack8", "CURVE")
cr.dimensions, cr.bevel_depth, cr.bevel_resolution = "3D", 0.00009, 2
sp = cr.splines.new("POLY")
N = 220
sp.points.add(N - 1)
for i in range(N):                      # jagged: zig-zag + two incommensurate wobbles (deterministic)
    th = math.radians(220 * i / (N - 1))
    zz = STRING_Z + 0.0011 * math.sin(9 * th) + 0.0007 * math.sin(31 * th + 1.0) + (0.00028 if (i // 2) % 2 else -0.00028)
    rr_ = R_BODY + 0.0009
    sp.points[i].co = (rr_ * math.cos(th), rr_ * math.sin(th), zz, 1)
crack = zk.link("crack8", cr)
cr.materials.append(zk.mat("crackm", "#FFFFFF", rough=0.2, emit="#F4FBFF", emit_k=2.0))
crack.parent = b8
zk.area("key8", (X8 - 0.12, -0.18, 0.4), (X8, 0, 0.09), 0.3, 18, "#EAF6FF")
zk.area("wall8", (X8 - 0.06, -0.10, 0.22), (X8 + 0.03, 0.17, 0.06), 0.5, 22, "#DDE8EC")
c8p, c8t = Vector((X8 - 0.062, -0.036, 0.098)), Vector((X8 - 0.004, -0.0345, 0.0895))
cam8 = zk.camera("cam_b8", fov_v=30, dof=(c8t - c8p).length, fstop=22)
zk.cam_move(cam8, 486, 540, c8p, c8p + Vector((0.004, 0.0, 0)), c8t, c8t + Vector((0.006, 0.0, 0)),
            roll0=-22, roll1=-24)
zk.backdrop(cam8, "#4E6E78", "#1E3038", dist=0.5)

TOP = STRING_Z - 0.0014
RI = R_BODY - WALL
# one closed shell (outside up, rounded sanded lip, inside down): no solidify, so the normals agree and the
# cup reads as a thin-walled glass instead of a solid block
CUP = [(0.0001, 0.0), (0.029, 0.0), (0.0315, 0.003), (R_BODY, 0.010), (R_BODY, TOP - 0.0012),
       (R_BODY - 0.0004, TOP - 0.0002), (R_BODY - WALL / 2, TOP), (RI + 0.0004, TOP - 0.0002), (RI, TOP - 0.0012),
       (RI, 0.012), (RI - 0.0025, 0.0055), (0.0001, 0.0050)]


# ---------------------------------------------------------------- moment 10: sandpaper on the cut rim (blue rim)

X10 = 34.0
glass10 = zk.lathe("glass10", CUP, seg=128, close_bottom=False)
zk.assign(glass10, M["glass"])
ROT10 = (0, math.radians(-90), math.radians(-12))
LOC10 = (X10 + 0.04, 0, 0.06)
glass10.location, glass10.rotation_euler = LOC10, ROT10
bm10 = M_(LOC10, ROT10)
hg10 = zk.highlight(glass10, "#2448F0", scale=1.015, strength=3.2)
zk.pulse(hg10, 712, 760, 5, 8)
rimc = bm10 @ Vector((0, 0, TOP))
grit = zk.mat("grit", "#7A2B22", rough=0.95)
_n = grit.node_tree
_vo = _n.nodes.new("ShaderNodeTexVoronoi")
_vo.inputs["Scale"].default_value = 2600
_bmp = _n.nodes.new("ShaderNodeBump")
_bmp.inputs["Strength"].default_value = 0.8
_bmp.inputs["Distance"].default_value = 0.0002
_n.links.new(_vo.outputs["Distance"], _bmp.inputs["Height"])
_n.links.new(_bmp.outputs["Normal"], _n.nodes["Principled BSDF"].inputs["Normal"])
_cr = _n.nodes.new("ShaderNodeMapRange")
_cmx = _n.nodes.new("ShaderNodeMix")
_cmx.data_type = "RGBA"
_cmx.inputs["A"].default_value = (*zk.srgb("#5E1E18"), 1)
_cmx.inputs["B"].default_value = (*zk.srgb("#9A3E30"), 1)
_n.links.new(_vo.outputs["Distance"], _cr.inputs["Value"])
_n.links.new(_cr.outputs[0], _cmx.inputs["Factor"])
_n.links.new(_cmx.outputs["Result"], _n.nodes["Principled BSDF"].inputs["Base Color"])
paper = zk.rbox("paper10", (0.0016, 0.085, 0.11), bevel=0.0006, loc=(0, 0, 0))
AX10 = (bm10.to_3x3() @ Vector((0, 0, 1))).normalized()        # rim -> base direction is -AX10
paper.location = rimc + AX10 * 0.0011 + Vector((0, 0.01, 0.034))  # flush on the rim, covering its top
paper.rotation_euler = deg(0, 0, -12)
zk.assign(paper, grit)
back = zk.rbox("paperback10", (0.0006, 0.0852, 0.1102), bevel=0.0002, loc=(-0.0011, 0, 0))
zk.assign(back, zk.mat("paperbk", "#D8C2AE", rough=0.9))
back.parent = paper
dust = zk.mat("dust", "#EAF4FF", rough=0.3, trans=0.5, ior=1.5)
for i in range(46):                     # glass dust falling from the contact point
    u = i / 46
    p = rimc + Vector((0.0015 * math.sin(i * 2.1) - 0.002, -0.028 + 0.010 * math.sin(i * 1.3),
                       -0.026 - 0.075 * u ** 1.2 + 0.003 * math.sin(i * 4.7)))
    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.00028 + 0.00022 * (0.5 + 0.5 * math.sin(i * 3.3)),
                                          subdivisions=1, location=p)
    zk.assign(bpy.context.object, dust)
zk.studio((X10, 0, 0.06), k=0.7)
c10t = rimc + Vector((0.004, -0.024, -0.012))
cam10 = zk.camera("cam_b10", fov_v=30, dof=0.16, fstop=8)
zk.cam_move(cam10, 696, 783, c10t + Vector((0.10, -0.15, 0.01)), c10t + Vector((0.085, -0.125, 0.01)), c10t, c10t)
zk.backdrop(cam10, dist=1.5)

# ---------------------------------------------------------------- moment 11: rinse, then soda + striped straw



def finished_glass(name, loc, rot):
    g = zk.lathe(name, CUP, seg=128, close_bottom=False)
    zk.assign(g, M["glass"])
    g.location, g.rotation_euler = loc, rot
    g.visible_shadow = False   # no refractive caustics: let the key reach the soda
    return g


soda_m = zk.mat("soda", "#F2861A", rough=0.12, trans=0.15, ior=1.34, coat=0.4)
foam_m = zk.mat("foam", "#FFD9A0", rough=0.6, sss=0.4)


def soda(name, g, level):
    s = zk.lathe(name, [(0.0001, 0.0045), (R_BODY - WALL - 0.0004, 0.0045), (R_BODY - WALL - 0.0004, level),
                        (0.0001, level)], close_bottom=True)
    zk.assign(s, soda_m)
    s.parent = g
    for i in range(18):
        a = i * 2.39
        rr_ = 0.006 + 0.019 * ((i * 0.37) % 1)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0007 + 0.0004 * (i % 3),
                                             location=(rr_ * math.cos(a), rr_ * math.sin(a), 0.01 + (level - 0.014)
                                                       * ((i * 0.61) % 1)))
        zk.smooth(bpy.context.object)
        zk.assign(bpy.context.object, bub_m)
        bpy.context.object.parent = g
    return s


def straw_mat():
    m = zk.mat("straw", "#FFFFFF", rough=0.25, coat=0.6)
    nt = m.node_tree
    wv = nt.nodes.new("ShaderNodeTexWave")
    wv.wave_type, wv.bands_direction, wv.wave_profile = "BANDS", "DIAGONAL", "SIN"
    wv.inputs["Scale"].default_value = 3.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (60, 60, 9)
    rp = nt.nodes.new("ShaderNodeValToRGB")
    rp.color_ramp.interpolation = "CONSTANT"
    rp.color_ramp.elements[0].color = (*zk.srgb("#E85A5A"), 1)
    rp.color_ramp.elements[1].position = 0.5
    rp.color_ramp.elements[1].color = (*zk.srgb("#FFFFFF"), 1)
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"])
    nt.links.new(mp.outputs[0], wv.inputs["Vector"])
    nt.links.new(wv.outputs["Fac"], rp.inputs["Fac"])
    nt.links.new(rp.outputs["Color"], nt.nodes["Principled BSDF"].inputs["Base Color"])
    return m


STRAW = straw_mat()


def straw(name, pts, r=0.0028):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions, cu.bevel_depth, cu.bevel_resolution = "3D", r, 4
    sp = cu.splines.new("NURBS")
    sp.points.add(len(pts) - 1)
    for p_, c in zip(sp.points, pts):
        p_.co = (*c, 1)
    sp.use_endpoint_u, sp.order_u = True, 3
    o = zk.link(name, cu)
    cu.materials.append(STRAW)
    return o


X11 = 38.0
LOC11, ROT11 = (X11 - 0.005, 0, 0.02), deg(-6, 4, 0)
g11 = finished_glass("glass11", LOC11, ROT11)
soda(name="soda11", g=g11, level=0.046)
foam = zk.cyl("foam11", R_BODY - WALL - 0.0006, 0.004, loc=(0, 0, 0.047), verts=64, bevel=0.0015)
zk.assign(foam, foam_m)
foam.parent = g11
bm11 = M_(LOC11, ROT11)
pour = bpy.data.curves.new("pour11", "CURVE")
pour.dimensions, pour.bevel_depth, pour.bevel_resolution = "3D", 0.0034, 4
sp = pour.splines.new("POLY")
sp.points.add(30)
top11 = bm11 @ Vector((-0.004, 0, 0.049))
for i in range(31):
    u = i / 30
    sp.points[i].co = (top11.x - 0.004 * u + 0.0008 * math.sin(u * 9), top11.y, top11.z + 0.26 * (1 - u), 1)
pr = zk.link("pour11", pour)
pour.materials.append(zk.mat("pour", "#F27A0E", rough=0.2, trans=0.1, ior=1.34))
for i in range(14):                     # splash crown where the stream lands
    a = i * 2 * math.pi / 14 + 0.3
    rr_ = 0.008 + 0.004 * math.sin(i * 1.9)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.0012 + 0.0006 * math.sin(i * 2.3),
                                         location=top11 + Vector((rr_ * math.cos(a), rr_ * math.sin(a),
                                                                  0.004 + 0.006 * (0.5 + 0.5 * math.sin(i * 3.1)))))
    zk.smooth(bpy.context.object)
    zk.assign(bpy.context.object, soda_m)
straw("straw11", [bm11 @ Vector((0.012, 0.004, 0.006)), bm11 @ Vector((0.019, 0.004, 0.08)),
                  bm11 @ Vector((0.030, 0.004, 0.20))])
hand("hand11", "wrap", zk.wrap_matrix(bm11, R_BODY, 0.033, 90, side=1), side=1)
zk.studio((X11, 0, 0.08))
cam11 = zk.camera("cam_b11", fov_v=32)
zk.cam_move(cam11, 783, 870, (X11 + 0.0, -0.46, 0.10), (X11 + 0.0, -0.44, 0.10), (X11 - 0.005, 0, 0.085),
            (X11 - 0.005, 0, 0.085))
zk.backdrop(cam11, dist=1.5)

# ---------------------------------------------------------------- moment 12: the sip — no face, the straw does it

X12 = 42.0
LOC12, ROT12 = (X12 - 0.02, 0, 0.05), deg(-4, 14, 0)
g12 = finished_glass("glass12", LOC12, ROT12)
soda(name="soda12", g=g12, level=0.034)
bm12 = M_(LOC12, ROT12)
sp12 = [bm12 @ Vector((0.010, 0.0, 0.006)), bm12 @ Vector((0.014, 0.0, 0.085)), bm12 @ Vector((0.018, 0.0, 0.11)),
        bm12 @ Vector((0.05, 0.0, 0.13)), bm12 @ Vector((0.16, 0.0, 0.20))]
# the sip: a clear straw with red stripes, the soda column rising inside it up past the frame edge
STRAW_CLEAR = STRAW.copy()
STRAW_CLEAR.name = "strawclear"
_nt = STRAW_CLEAR.node_tree
_rp = next(n for n in _nt.nodes if n.bl_idname == "ShaderNodeValToRGB")
_tr = _nt.nodes.new("ShaderNodeValToRGB")
_tr.color_ramp.interpolation = "CONSTANT"
_tr.color_ramp.elements[0].color = (0.15, 0.15, 0.15, 1)   # red stripe: mostly opaque
_tr.color_ramp.elements[1].position = 0.5
_tr.color_ramp.elements[1].color = (1, 1, 1, 1)            # between stripes: clear plastic
_nt.links.new(_rp.inputs["Fac"].links[0].from_socket, _tr.inputs["Fac"])
_nt.links.new(_tr.outputs["Color"], _nt.nodes["Principled BSDF"].inputs["Transmission Weight"])
_nt.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.12
s12 = straw("straw12", sp12)
s12.data.materials[0] = STRAW_CLEAR
s12.visible_shadow = False
col12 = straw("sodaup12", sp12, r=0.0021)
col12.data.materials[0] = zk.mat("sodacol", "#F2861A", rough=0.15, sss=0.3, emit="#F28A1A", emit_k=0.15)
hand("hand12", "wrap", zk.wrap_matrix(bm12, R_BODY, 0.033, 90, side=1), side=1)
zk.studio((X12, 0, 0.1))
cam12 = zk.camera("cam_b12", fov_v=32)
zk.cam_move(cam12, 870, 930, (X12 - 0.06, -0.34, 0.02), (X12 - 0.07, -0.44, 0.015), (X12 + 0.0, 0, 0.11),
            (X12 + 0.0, 0, 0.11))
zk.backdrop(cam12, dist=1.5)

zk.shots([(0, cam1), (60, cam2), (102, cam3), (162, cam4), (210, cam5), (300, cam6), (396, cam7), (486, cam8),
          (582, cam9), (696, cam10), (783, cam11), (870, cam12)])

# ---------------------------------------------------------------- render

out = A["out"] or os.path.join(HERE, "frames")
os.makedirs(out, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "zach-glass.blend"))
if A["frames"]:
    for f in A["frames"]:
        S.frame_set(f)
        S.camera = max((m for m in S.timeline_markers if m.frame <= f), key=lambda m: m.frame).camera
        if os.environ.get("WIDE"):        # debug: see what is just outside the frame
            S.camera.data.lens = 12 / math.tan(math.radians(80) / 2)
        S.render.filepath = os.path.join(out, f"{f:05d}.png")
        bpy.ops.render.render(write_still=True)
        print("RENDERED", f, flush=True)

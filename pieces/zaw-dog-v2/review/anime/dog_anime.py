"""zaw-dog v2: cute low-poly PS1 puppy (Blender side). Import from a piece's build script (see README.md).

Mesh   = lofted low-poly sections, one object, one material, one 256 px atlas (tex/atlas_<expr>.png, baked by bake.py
         from a single 3D colour function, so the brown/white is the same everywhere and UV seams cannot show).
UVs    = stored in tex/uv.json (made once by `build.py -- export`), so every build is identical to the baked atlas.
Rig    = same bone names/API as the v1 dog (pieces/zaw-dog-test/dog.py): root, hips, chest, neck, head, jaw, tongue,
         ear.L/R, tail1-3, legs with IK targets ik_f/ik_h + poles; paws copy the IK control rotation (stay flat).
Faces  = set_face(node, expr) swaps the whole atlas (only the face texels differ); expr_pose() does ears/head/tail/jaw."""
import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Quaternion, Vector

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
if os.path.join(ROOT, "pieces", "lps-onoda") not in sys.path:
    sys.path.insert(0, os.path.join(ROOT, "pieces", "lps-onoda"))
import lpskit as K  # noqa: E402

TEX = os.path.join(H, "tex")
EXPRS = ["neutral", "happy", "sad", "judging", "shocked"]
PARTS = ["torso", "neck", "head", "muzzle", "nose", "jaw", "mouth", "tongue", "ear", "leg_f", "leg_h", "tail"]
FRONT_X, HIND_X = 0.088, 0.097

# ---------------------------------------------------------------- shape tables (metres; the dog faces -Y, paws on z=0)
# torso sections: (y, z_top, z_bottom, half width)
TORSO = [(-0.268, 0.500, 0.362, 0.080), (-0.250, 0.566, 0.292, 0.124), (-0.200, 0.595, 0.256, 0.150),
         (-0.125, 0.601, 0.245, 0.156), (-0.035, 0.594, 0.252, 0.152), (0.055, 0.585, 0.272, 0.146),
         (0.145, 0.586, 0.288, 0.150), (0.230, 0.584, 0.298, 0.157), (0.295, 0.556, 0.322, 0.140),
         (0.333, 0.504, 0.365, 0.094)]
TORSO_CAP = (0.348, 0.440)
# head parts are written in "design space" and scaled by HEAD_SCALE about the head pivot (bigger, cuter head)
HEAD_SCALE = 1.13
HEAD_PARTS = ("head", "muzzle", "nose", "jaw", "mouth", "tongue", "ear")
# cranium sections along y: (y, centre z, half width, half height)
SKULL = [(-0.108, 0.658, 0.094, 0.090), (-0.165, 0.666, 0.140, 0.129), (-0.232, 0.666, 0.150, 0.136),
         (-0.296, 0.661, 0.145, 0.130), (-0.340, 0.656, 0.134, 0.119), (-0.366, 0.652, 0.112, 0.099),
         (-0.380, 0.650, 0.072, 0.066)]
SKULL_CAP = (-0.387, 0.650)
MUZZLE = [(-0.318, 0.601, 0.086, 0.058), (-0.380, 0.603, 0.080, 0.054), (-0.415, 0.605, 0.068, 0.047),
          (-0.436, 0.607, 0.048, 0.036)]
MUZZLE_CAP = (-0.444, 0.607)
NOSE = [(-0.425, 0.619, 0.031, 0.021), (-0.445, 0.621, 0.030, 0.021), (-0.457, 0.619, 0.021, 0.015)]
NOSE_CAP = (-0.461, 0.617)
JAW = [(-0.318, 0.568, 0.529, 0.052), (-0.360, 0.566, 0.533, 0.046), (-0.385, 0.563, 0.540, 0.032)]
JAW_CAP = (-0.394, 0.556)
# ear: path of section centres (x>0 side), breadth, thickness
EAR = [((0.116, -0.206, 0.770), 0.064, 0.034), ((0.153, -0.210, 0.737), 0.094, 0.040),
       ((0.172, -0.213, 0.674), 0.104, 0.038), ((0.177, -0.215, 0.605), 0.094, 0.031),
       ((0.170, -0.216, 0.553), 0.056, 0.020)]
EAR_CAP = (0.165, -0.216, 0.537)
EAR_FLARE = 0.22          # the ear's front edge turns out a little, so the ears frame the face from the front
# legs: (y, z, half width x, half depth y) per ring + weights
FLEG = [(-0.130, 0.380, 0.050, 0.060, {"@chest": 0.5, "upper_arm": 0.5}), (-0.126, 0.268, 0.061, 0.066, {"upper_arm": 0.7, "forearm": 0.3}),
(-0.135, 0.082, 0.050, 0.052, {"forearm": 0.5, "paw_f": 0.5}),
        (-0.150, 0.050, 0.058, 0.066, {"paw_f": 1.0}), (-0.158, 0.022, 0.062, 0.073, {"paw_f": 1.0}),
        (-0.158, 0.000, 0.055, 0.066, {"paw_f": 1.0})]
HLEG = [(0.236, 0.400, 0.060, 0.075, {"@hips": 0.5, "thigh": 0.5}), (0.232, 0.315, 0.074, 0.092, {"thigh": 1.0}),
        (0.214, 0.200, 0.058, 0.062, {"thigh": 0.5, "shin": 0.5}),
        (0.280, 0.078, 0.048, 0.050, {"shin": 0.5, "paw_h": 0.5}), (0.268, 0.049, 0.056, 0.064, {"paw_h": 1.0}),
        (0.258, 0.022, 0.061, 0.071, {"paw_h": 1.0}), (0.258, 0.000, 0.054, 0.064, {"paw_h": 1.0})]
# tail: (y, z, radius)
TAIL = [(0.312, 0.505, 0.036), (0.352, 0.553, 0.044), (0.388, 0.617, 0.050), (0.404, 0.688, 0.049),
        (0.396, 0.750, 0.043), (0.369, 0.788, 0.033), (0.337, 0.798, 0.016)]
TAIL_W = [{"hips": 0.6, "tail1": 0.4}, {"tail1": 1.0}, {"tail1": 0.5, "tail2": 0.5}, {"tail2": 1.0},
          {"tail2": 0.5, "tail3": 0.5}, {"tail3": 1.0}, {"tail3": 1.0}]
# bones (rest; head-part bones in design space, scaled like the mesh)
B_HIPS, B_CHEST, B_NECK, B_HEAD, B_NOSE = (0, 0.30, 0.43), (0, 0.03, 0.43), (0, -0.20, 0.45), (0, -0.19, 0.615), (0, -0.435, 0.630)
B_JAW = ((0, -0.300, 0.582), (0, -0.400, 0.548))
B_TONGUE = ((0, -0.318, 0.571), (0, -0.376, 0.568))


def hs(v):
    """design space -> world for head parts."""
    p = Vector(B_HEAD)
    return p + (Vector(v) - p) * HEAD_SCALE


# ---------------------------------------------------------------- mesh building

def prof_circle(n, phase=math.pi / 2):
    return [(math.cos(2 * math.pi * i / n + phase), math.sin(2 * math.pi * i / n + phase)) for i in range(n)]


def prof_super(n, e=2.6, phase=math.pi / 2):
    """superellipse: e>2 = squarer (rounded box), symmetric about x=0 (a vertex on top)."""
    out = []
    for c, s in prof_circle(n, phase):
        out.append((math.copysign(abs(c) ** (2 / e), c), math.copysign(abs(s) ** (2 / e), s)))
    return out


def prof_head(n):
    """round skull: puffy cheeks low on the sides, slightly flatter crown and throat."""
    out = []
    for c, s in prof_circle(n):
        m = 1 + 0.07 * math.exp(-((s + 0.42) / 0.32) ** 2)
        out.append((c * m, s * (0.94 if s < -0.7 else 1.0)))
    return out


def prof_muzzle(n):
    """puppy muzzle: narrower over the nose bridge, puffy whisker pads low on the sides, flat underside."""
    out = []
    for c, s in prof_super(n, 2.4):
        k = 0.82 + 0.18 * (1 - max(s, 0)) + 0.06 * math.exp(-((s + 0.35) / 0.35) ** 2)
        out.append((c * k, s))
    return out


def prof_torso(n):
    out = []
    for c, s in prof_super(n, 2.15):
        out.append((c * (0.88 if s < -0.5 else 1.0), s))           # belly a little narrower than the back
    return out


def prof_jaw():
    return [(1, 0.6), (0.45, 1), (-0.45, 1), (-1, 0.6), (-0.8, -0.35), (-0.35, -1), (0.35, -1), (0.8, -0.35)]


class Builder:
    def __init__(self):
        self.verts, self.faces, self.fpart = [], [], []
        self.vw, self.vpart, self.vparam = [], [], []

    def vert(self, co, w, part, param=0.0):
        self.verts.append(Vector(co)); self.vw.append(w); self.vpart.append(part); self.vparam.append(param)
        return len(self.verts) - 1

    def ring(self, c, t, rx, rn, prof, w, part, param=0.0, a=None):
        """section centred at c, perpendicular to tangent t; profile u along `a` (default world X), v along t x a."""
        t = Vector(t).normalized(); a = Vector(a or (1, 0, 0))
        a = (a - t * a.dot(t)).normalized(); b = t.cross(a).normalized()
        return [self.vert(Vector(c) + a * u * rx + b * v * rn, w, part, param) for u, v in prof]

    def add(self, f, part, inside):
        """face with outward winding (away from `inside`)."""
        vs = [self.verts[i] for i in f]
        n = (vs[1] - vs[0]).cross(vs[2] - vs[0])
        cen = sum(vs, Vector()) / len(vs)
        if n.dot(cen - Vector(inside)) < 0:
            f = f[::-1]
        self.faces.append(list(f)); self.fpart.append(part)

    def loft(self, rings, centres, part, cap0=None, cap1=None):
        n = len(rings[0])
        for k, (r0, r1) in enumerate(zip(rings, rings[1:])):
            inside = (Vector(centres[k]) + Vector(centres[k + 1])) / 2
            for i in range(n):
                self.add([r0[i], r0[(i + 1) % n], r1[(i + 1) % n], r1[i]], part, inside)
        for ring, cap, cen in ((rings[0], cap0, centres[0]), (rings[-1], cap1, centres[-1])):
            if cap is None:
                continue
            pc, w, prm = cap
            ci = self.vert(pc, w, part, prm)
            inside = Vector(cen) - (Vector(pc) - Vector(cen)) * 0.5
            for i in range(n):
                self.add([ring[i], ring[(i + 1) % n], ci], part, inside)


def build_mesh():
    B = Builder()
    # torso (chest -> rump), 10 sides
    rs, cs = [], []
    nT = len(TORSO)
    for i, (y, zt, zb, hw) in enumerate(TORSO):
        c = (0, y, (zt + zb) / 2); cs.append(c)
        k = min(1, max(0, (y + 0.10) / 0.36))
        w = {"chest": 1 - k, "hips": k} if 0 < k < 1 else ({"chest": 1.0} if k == 0 else {"hips": 1.0})
        rs.append(B.ring(c, (0, 1, 0), hw, (zt - zb) / 2, prof_torso(10), w, "torso", i / (nT - 1)))
    B.loft(rs, cs, "torso", cap0=((0, -0.282, 0.435), {"chest": 1.0}, 0.0), cap1=((0, TORSO_CAP[0], TORSO_CAP[1]), {"hips": 1.0}, 1.0))
    # neck: short and thick, mostly hidden by the big head (open ends are buried)
    NK = [((0, -0.190, 0.470), 0.112, 0.100, {"chest": 1.0}), ((0, -0.195, 0.560), 0.108, 0.098, {"chest": 0.4, "neck": 0.6}),
          ((0, -0.185, 0.640), 0.098, 0.090, {"neck": 0.5, "head": 0.5})]
    rs = []
    for i, (c, rx, rn, w) in enumerate(NK):
        t = Vector(NK[min(i + 1, 2)][0]) - Vector(NK[max(i - 1, 0)][0])
        rs.append(B.ring(c, t, rx, rn, prof_circle(8), w, "neck", i / 2))
    B.loft(rs, [c for c, *_ in NK], "neck")
    # skull: 12-sided round head
    HD = {"head": 1.0}
    rs, cs = [], []
    for i, (y, cz, rx, rz) in enumerate(SKULL):
        cs.append((0, y, cz)); rs.append(B.ring((0, y, cz), (0, -1, 0), rx, rz, prof_head(14), HD, "head", i / 6))
    B.loft(rs, cs, "head", cap0=((0, -0.086, 0.656), HD, 0.0), cap1=((0, SKULL_CAP[0], SKULL_CAP[1]), HD, 1.0))
    # muzzle (upper jaw): short, soft rounded box
    rs, cs = [], []
    for i, (y, cz, rx, rz) in enumerate(MUZZLE):
        cs.append((0, y, cz)); rs.append(B.ring((0, y, cz), (0, -1, 0), rx, rz, prof_muzzle(10), HD, "muzzle", i / 3))
    B.loft(rs, cs, "muzzle", cap1=((0, MUZZLE_CAP[0], MUZZLE_CAP[1]), HD, 1.0))
    # nose button
    rs, cs = [], []
    for i, (y, cz, rx, rz) in enumerate(NOSE):
        cs.append((0, y, cz)); rs.append(B.ring((0, y, cz), (0, -1, 0), rx, rz, prof_super(6, 2.2, 0.0), HD, "nose", i / 2))
    B.loft(rs, cs, "nose", cap1=((0, NOSE_CAP[0], NOSE_CAP[1]), HD, 1.0))
    # lower jaw: flat top under the lip, round chin
    JW = {"jaw": 1.0}
    rs, cs = [], []
    for i, (y, zt, zb, rx) in enumerate(JAW):
        c = (0, y, (zt + zb) / 2); cs.append(c)
        rs.append(B.ring(c, (0, -1, 0), rx, (zt - zb) / 2, prof_jaw(), JW, "jaw", i / 2))
    B.loft(rs, cs, "jaw", cap1=((0, JAW_CAP[0], JAW_CAP[1]), JW, 1.0))
    # mouth inside: a dark box, top on the head, bottom on the jaw -> it fills the gap when the jaw opens
    q = []
    for y in (-0.322, -0.372):
        for z, w in ((0.552, {"jaw": 1.0}), (0.578, {"head": 1.0})):
            for x in (-0.030, 0.030):
                q.append(B.vert((x * (0.8 if y < -0.36 else 1), y, z), w, "mouth"))
    ins = (0, -0.37, 0.568)
    for f in ([0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]):
        B.add([q[i] for i in f], "mouth", ins)
    # tongue: rests inside the mouth; the `tongue` bone pulls it out (happy)
    TG = {"tongue": 1.0}
    rs, cs = [], []
    for i, (y, z, rx, rz) in enumerate([(-0.322, 0.571, 0.025, 0.009), (-0.350, 0.570, 0.028, 0.009), (-0.374, 0.568, 0.023, 0.008)]):
        cs.append((0, y, z)); rs.append(B.ring((0, y, z), (0, -1, 0), rx, rz, prof_super(4, 2.0, 0.0), TG, "tongue", i / 2))
    B.loft(rs, cs, "tongue", cap0=((0, -0.314, 0.571), TG, 0.0), cap1=((0, -0.382, 0.567), TG, 1.0))
    # ears: thick soft leathers hanging beside the cheeks (lens section, 6 sides), rounded tip
    lens = [(-1, 0), (-0.55, 1), (0.55, 1), (1, 0), (0.55, -1), (-0.55, -1)]
    for side, sx in (("L", 1), ("R", -1)):
        rs, cs = [], []
        pts = [Vector((sx * p[0], p[1], p[2])) for p, _, _ in EAR]
        for k, (p, br, th) in enumerate(EAR):
            t = pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]
            w = {f"ear.{side}": 1.0}
            # breadth runs front-back (a = -Y, tilted a little with the ear), thickness across
            rs.append(B.ring(pts[k], t, br / 2, th / 2, lens, w, "ear", k / (len(EAR) - 1), a=(sx * EAR_FLARE, -1, 0.0)))
            cs.append(pts[k])
        cap = Vector((sx * EAR_CAP[0], EAR_CAP[1], EAR_CAP[2]))
        B.loft(rs, cs, "ear", cap0=(pts[0] + Vector((-sx * 0.012, 0, 0.006)), {f"ear.{side}": 1.0}, 0.0),
               cap1=(cap, {f"ear.{side}": 1.0}, 1.0))
    # legs (8 sides, horizontal rings), big round paws
    for side, sx in (("L", 1), ("R", -1)):
        for spec, X, part in ((FLEG, FRONT_X, "leg_f"), (HLEG, HIND_X, "leg_h")):
            rs, cs = [], []
            for y, z, rx, ry, w in spec:
                w = {(k[1:] if k[0] == "@" else f"{k}.{side}"): v for k, v in w.items()}
                c = (sx * X, y, z); cs.append(c)
                rs.append(B.ring(c, (0, 0, -1), rx, ry, prof_super(8, 2.05), w, part, z))
            paw = f"{'paw_f' if part == 'leg_f' else 'paw_h'}.{side}"
            B.loft(rs, cs, part, cap1=((sx * X, spec[-1][0], -0.002), {paw: 1.0}, 0.0))
    # tail: fluffy plume curling up (6 sides, alternating tufts)
    rs, cs = [], []
    pts = [Vector((0, y, z)) for y, z, _ in TAIL]
    for i, ((y, z, r), w) in enumerate(zip(TAIL, TAIL_W)):
        t = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]
        tuft = [(u * (1.12 if j % 2 == 0 else 0.92), v * (1.12 if j % 2 == 0 else 0.92)) for j, (u, v) in enumerate(prof_circle(6, math.pi / 2 + i * 0.5))]
        rs.append(B.ring(pts[i], t, r, r, tuft, w, "tail", i / (len(TAIL) - 1)))
        cs.append(pts[i])
    tip = pts[-1] + (pts[-1] - pts[-2]).normalized() * 0.014
    B.loft(rs, cs, "tail", cap1=(tip, {"tail3": 1.0}, 1.0))
    for i, pt in enumerate(B.vpart):
        if pt in HEAD_PARTS:
            B.verts[i] = hs(B.verts[i])
    return B


def tri_count(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


def make_object(B, with_uv=True):
    me = bpy.data.meshes.new("Dog")
    me.from_pydata([tuple(v) for v in B.verts], [], B.faces)
    me.update()
    for p in me.polygons:
        p.use_smooth = B.fpart[p.index] != "mouth"
    pa = me.attributes.new("part", "INT", "FACE")
    pa.data.foreach_set("value", [PARTS.index(x) for x in B.fpart])
    pm = me.attributes.new("param", "FLOAT", "POINT")
    pm.data.foreach_set("value", B.vparam)
    uvl = me.uv_layers.new(name="UV")
    if with_uv:
        uvs = json.load(open(os.path.join(TEX, "uv.json")))
        assert len(uvs) == 2 * len(me.loops), "uv.json does not match the mesh: run build.py -- export + bake.py"
        uvl.data.foreach_set("uv", uvs)
    o = bpy.data.objects.new("Dog", me); K.link(o)
    for vi, w in enumerate(B.vw):
        for g, val in w.items():
            vg = o.vertex_groups.get(g) or o.vertex_groups.new(name=g)
            vg.add([vi], val, "REPLACE")
    m = K.mat_image("dog_atlas", face_image("neutral") if with_uv else K.image_from_array("blank", __import__("numpy").full((4, 4, 3), 180, "uint8")))
    me.materials.append(m)
    return o, next(n for n in m.node_tree.nodes if n.type == "TEX_IMAGE")


_faces = {}


def face_image(expr):
    if expr not in _faces or _faces[expr].name not in bpy.data.images:
        im = bpy.data.images.load(os.path.join(TEX, f"atlas_{expr}.png")); im.pack(); im.name = f"dog_atlas_{expr}"
        _faces[expr] = im
    return _faces[expr]


def set_face(face_node, expr):
    face_node.image = face_image(expr)


# ---------------------------------------------------------------- armature

def build_armature():
    a = bpy.data.armatures.new("DogRig"); arm = bpy.data.objects.new("DogRig", a); K.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    eb = a.edit_bones

    def bone(name, h, t, parent=None, deform=True, connect=False):
        b = eb.new(name); b.head = h; b.tail = t; b.roll = 0.0; b.use_deform = deform
        if parent:
            b.parent = eb[parent]; b.use_connect = connect
        return b
    bone("root", (0, 0, 0), (0, -0.25, 0), deform=False)
    bone("hips", B_HIPS, B_CHEST, "root")
    bone("chest", B_CHEST, B_NECK, "hips", connect=True)
    bone("neck", B_NECK, B_HEAD, "chest", connect=True)
    bone("head", B_HEAD, hs(B_NOSE), "neck", connect=True)
    bone("jaw", hs(B_JAW[0]), hs(B_JAW[1]), "head")
    bone("tongue", hs(B_TONGUE[0]), hs(B_TONGUE[1]), "jaw")
    tp = [Vector((0, y, z)) for y, z, _ in TAIL]
    bone("tail1", tp[0], tp[2], "hips"); bone("tail2", tp[2], tp[4], "tail1", connect=True)
    bone("tail3", tp[4], tp[6], "tail2", connect=True)
    for side, sx in (("L", 1), ("R", -1)):
        e0 = hs((sx * EAR[0][0][0], EAR[0][0][1], EAR[0][0][2]))
        bone(f"ear.{side}", e0, hs((sx * EAR[-1][0][0], EAR[-1][0][1], EAR[-1][0][2])), "head")
        X = sx * FRONT_X
        sh, el, wr, toe = (X, -0.130, 0.400), (X, -0.090, 0.245), (X, -0.135, 0.075), (X, -0.195, 0.012)
        bone(f"upper_arm.{side}", sh, el, "chest"); bone(f"forearm.{side}", el, wr, f"upper_arm.{side}", connect=True)
        bone(f"paw_f.{side}", wr, toe, f"forearm.{side}", connect=True)
        bone(f"ik_f.{side}", wr, toe, "root", deform=False)
        bone(f"pole_f.{side}", Vector(el) + Vector((0, 0.35, 0)), Vector(el) + Vector((0, 0.40, 0)), "root", deform=False)
        X = sx * HIND_X
        hp, st, an, toe = (X, 0.236, 0.400), (X, 0.212, 0.200), (X, 0.282, 0.075), (X, 0.218, 0.012)
        bone(f"thigh.{side}", hp, st, "hips"); bone(f"shin.{side}", st, an, f"thigh.{side}", connect=True)
        bone(f"paw_h.{side}", an, toe, f"shin.{side}", connect=True)
        bone(f"ik_h.{side}", an, toe, "root", deform=False)
        bone(f"pole_h.{side}", Vector(st) + Vector((0, -0.35, 0)), Vector(st) + Vector((0, -0.40, 0)), "root", deform=False)
    bpy.ops.object.mode_set(mode="OBJECT")
    for pb in arm.pose.bones:
        pb.rotation_mode = "QUATERNION"
    for side in "LR":
        for ch, ik, pole, paw in (("forearm", "ik_f", "pole_f", "paw_f"), ("shin", "ik_h", "pole_h", "paw_h")):
            c = arm.pose.bones[f"{ch}.{side}"].constraints.new("IK")
            c.target = arm; c.subtarget = f"{ik}.{side}"; c.pole_target = arm; c.pole_subtarget = f"{pole}.{side}"
            c.chain_count = 2
            cr = arm.pose.bones[f"{paw}.{side}"].constraints.new("COPY_ROTATION")
            cr.target = arm; cr.subtarget = f"{ik}.{side}"
    fit_pole_angles(arm)
    return arm


def fit_pole_angles(arm):
    """pole angle that keeps each IK chain in its rest pose."""
    for side in "LR":
        for ch, up in (("forearm", "upper_arm"), ("shin", "thigh")):
            c = arm.pose.bones[f"{ch}.{side}"].constraints["IK"]
            best = None
            for deg in range(-180, 180, 2):
                c.pole_angle = math.radians(deg)
                bpy.context.view_layer.update()
                err = 0
                for b in (up, ch):
                    pb = arm.pose.bones[f"{b}.{side}"]
                    err += sum(abs(x) for r in (pb.matrix - pb.bone.matrix_local) for x in r)
                if best is None or err < best[0]:
                    best = (err, deg)
            c.pole_angle = math.radians(best[1])


def rig(o, arm):
    m = o.modifiers.new("Armature", "ARMATURE"); m.object = arm
    o.parent = arm


# ---------------------------------------------------------------- posing helpers (same API as v1)

def local_axis(arm, bone, axis_world):
    return (arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(axis_world)).normalized()


def rot(arm, bone, axis_world, ang, f=None):
    pb = arm.pose.bones[bone]
    pb.rotation_quaternion = Quaternion(local_axis(arm, bone, axis_world), ang)
    if f is not None:
        pb.keyframe_insert("rotation_quaternion", frame=f)


def rot2(arm, bone, rots, f=None):
    """several (axis_world, angle) rotations composed."""
    q = Quaternion()
    for ax, ang in rots:
        q = Quaternion(local_axis(arm, bone, ax), ang) @ q
    pb = arm.pose.bones[bone]; pb.rotation_quaternion = q
    if f is not None:
        pb.keyframe_insert("rotation_quaternion", frame=f)


def rotl(arm, bone, rots, f=None):
    """several (bone-local axis, angle) rotations composed. For the tail bones (roll 0, in the YZ plane) local Z swings
    the tail sideways whatever its angle (a world-Z rotation would only twist a raised tail) and local X lifts it."""
    q = Quaternion()
    for ax, ang in rots:
        q = Quaternion(Vector(ax), ang) @ q
    pb = arm.pose.bones[bone]; pb.rotation_quaternion = q
    if f is not None:
        pb.keyframe_insert("rotation_quaternion", frame=f)


def move(arm, bone, off_world, f=None):
    pb = arm.pose.bones[bone]
    pb.location = arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(off_world)
    if f is not None:
        pb.keyframe_insert("location", frame=f)


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * min(max(t, 0), 1))


def rest(arm):
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)


# ---------------------------------------------------------------- walk

WALK_T = 22          # frames per cycle (short puppy legs: quicker steps)
STRIDE_A = 0.062     # half stride (m)
STANCE = 0.62
PHASE = {"ik_h.L": 0.0, "ik_f.L": 0.25, "ik_h.R": 0.5, "ik_f.R": 0.75}
WALK_SPEED = 2 * STRIDE_A / (STANCE * WALK_T)   # m per frame along -Y, so planted paws do not slide


def walk_pose(arm, f, key=True):
    """one walk-cycle pose at frame f (0..WALK_T): IK paws, body bob, head bob, tail wag, ear bounce."""
    k = f if key else None
    for b, ph in PHASE.items():
        p = (f / WALK_T + ph) % 1
        if p < STANCE:
            y = -STRIDE_A + 2 * STRIDE_A * p / STANCE; z = 0.0; pitch = 0.0
        else:
            s = (p - STANCE) / (1 - STANCE)
            y = STRIDE_A - 2 * STRIDE_A * ease(s); z = 0.042 * math.sin(math.pi * s)
            pitch = -0.40 * math.sin(math.pi * s) * (1.0 if b.startswith("ik_h") else 0.6)
        move(arm, b, (0, y, z), k)
        rot(arm, b, (1, 0, 0), pitch, k)
    w = 2 * math.pi * f / WALK_T
    move(arm, "hips", (0, 0, 0.008 * math.cos(2 * w)), k)
    rot2(arm, "hips", [((0, 1, 0), 0.045 * math.sin(w)), ((0, 0, 1), 0.035 * math.sin(w))], k)
    rot2(arm, "chest", [((0, 1, 0), -0.06 * math.sin(w + 0.8)), ((0, 0, 1), -0.045 * math.sin(w))], k)
    rot(arm, "neck", (1, 0, 0), 0.05 * math.cos(2 * w - 0.6), k)
    rot2(arm, "head", [((1, 0, 0), -0.04 * math.cos(2 * w - 1.2)), ((0, 1, 0), 0.035 * math.sin(w))], k)
    for i, bn in enumerate(("tail1", "tail2", "tail3")):
        rotl(arm, bn, [((0, 0, 1), (0.30, 0.26, 0.24)[i] * math.sin(2 * w - 0.8 * i))], k)
    for side, sx in (("L", 1), ("R", -1)):
        rot2(arm, f"ear.{side}", [((0, 1, 0), -sx * (0.06 + 0.06 * math.sin(2 * w - 1.6))),
                                   ((1, 0, 0), 0.10 * math.cos(2 * w - 1.6))], k)
    rot(arm, "jaw", (1, 0, 0), 0.0, k)


def _linear(act):
    fcs = list(getattr(act, "fcurves", []) or [])
    try:
        for layer in act.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    fcs += list(cb.fcurves)
    except AttributeError:
        pass
    for fc in fcs:
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"


def make_walk_action(arm, repeats, start=1):
    """key one cycle into an action and loop it in an NLA strip (Ovi Gomy tutorial)."""
    arm.animation_data_create()
    for f in range(WALK_T + 1):
        walk_pose(arm, f)
    act = arm.animation_data.action; act.name = "walk"; act.use_fake_user = True
    _linear(act)
    ad = arm.animation_data
    slot = ad.action_slot
    tr = ad.nla_tracks.new(); tr.name = "walk"
    st = tr.strips.new("walk", start, act)
    try:
        st.action_slot = slot
    except Exception:
        pass
    st.action_frame_start, st.action_frame_end = 0, WALK_T
    st.repeat = repeats
    ad.action = None
    return st


# ---------------------------------------------------------------- expressions

# Emotion through dog body language; the face texture does the eyes/brows/mouth (always a dog face).
# out: ears lift sideways (+ away from the head); back: ear tips swing back (+) or forward (-)
# neck/head: + = nose down; turn: head yaw; tilt: head roll; tail_up: + up, - tucked; tail_curl: + curls, - straightens
# wag: amplitude (rad), wag_hz; jaw: open (rad); tongue: 0..1 out; wiggle: hip wiggle with the wag
EXPR_POSE = {
    "neutral": dict(out=0.05, back=0.0, neck=0.0, head=0.0, turn=0.0, tilt=0.0, tail_up=0.0, tail_curl=0.0, wag=0.18, wag_hz=1.2, jaw=0.0, tongue=0.0, wiggle=0.0),
    "happy":   dict(out=0.22, back=0.35, neck=-0.04, head=-0.02, turn=0.0, tilt=0.14, tail_up=0.25, tail_curl=0.0, wag=1.0, wag_hz=4.4, jaw=0.20, tongue=1.0, wiggle=1.0),
    "sad":     dict(out=-0.10, back=0.55, neck=0.14, head=0.10, turn=0.0, tilt=-0.08, tail_up=-1.3, tail_curl=-0.6, wag=0.0, wag_hz=0.0, jaw=0.0, tongue=0.0, wiggle=0.0),
    "judging": dict(out=0.70, back=0.20, neck=-0.06, head=-0.05, turn=0.24, tilt=0.10, tail_up=-0.4, tail_curl=-0.3, wag=0.0, wag_hz=0.0, jaw=0.0, tongue=0.0, wiggle=0.0),
    "shocked": dict(out=0.45, back=-0.55, neck=-0.20, head=-0.12, turn=0.0, tilt=0.0, tail_up=0.15, tail_curl=-0.8, wag=0.0, wag_hz=0.0, jaw=0.36, tongue=0.0, wiggle=0.0),
}


def happy_wag(arm, t, amp=1.0, hz=4.4, up=0.25):
    """happy dynamic wag: fast and wide, overlapping down tail1-3 (each segment lags the one before), the hips
    wiggling against the tail."""
    w = 2 * math.pi * hz * t
    rotl(arm, "tail1", [((0, 0, 1), 0.62 * amp * math.sin(w)), (local_axis(arm, "tail1", (1, 0, 0)), up)])
    rotl(arm, "tail2", [((0, 0, 1), 0.55 * amp * math.sin(w - 0.9)), (local_axis(arm, "tail2", (1, 0, 0)), 0.10)])
    rotl(arm, "tail3", [((0, 0, 1), 0.50 * amp * math.sin(w - 1.8))])
    rot2(arm, "hips", [((0, 0, 1), -0.07 * amp * math.sin(w)), ((0, 1, 0), 0.035 * amp * math.sin(w))])


def expr_pose(arm, e, t=0.0, prev=None, a=1.0):
    """absolute pose for ears/neck/head/tail/jaw/tongue for expression e at time t (s); blends in from `prev`."""
    a = ease(a)
    P_ = {key: v * a + (EXPR_POSE[prev][key] if prev else v) * (1 - a) for key, v in EXPR_POSE[e].items()}
    hz = EXPR_POSE[e]["wag_hz"] or (EXPR_POSE[prev]["wag_hz"] if prev else 0.0)
    w = 2 * math.pi * t
    rot2(arm, "neck", [((1, 0, 0), P_["neck"])])
    rot2(arm, "head", [((1, 0, 0), P_["head"]), ((0, 0, 1), P_["turn"]), ((0, 1, 0), P_["tilt"])])
    for s_, sx in (("L", 1), ("R", -1)):
        asym = 1.0 if sx > 0 else 0.7                      # one ear a little different: less mechanical
        sway = 0.04 * math.sin(1.1 * w + 1.3 * sx) + 0.025 * math.sin(1.7 * w + sx)
        rot2(arm, f"ear.{s_}", [((0, 1, 0), -sx * (P_["out"] * asym + sway)), ((1, 0, 0), P_["back"] * (2 - asym) * 0.8 + sway)])
    if P_["wiggle"] > 0.01:
        happy_wag(arm, t, P_["wag"], hz, up=P_["tail_up"])
    else:
        wag = P_["wag"] * math.sin(hz * w)
        rotl(arm, "tail1", [((0, 0, 1), wag), (local_axis(arm, "tail1", (1, 0, 0)), P_["tail_up"])])
        rotl(arm, "tail2", [((0, 0, 1), 0.8 * math.sin(hz * w - 0.8) * P_["wag"]), (local_axis(arm, "tail2", (1, 0, 0)), P_["tail_curl"] * 0.6)])
        rotl(arm, "tail3", [((0, 0, 1), 0.7 * math.sin(hz * w - 1.6) * P_["wag"]), (local_axis(arm, "tail3", (1, 0, 0)), P_["tail_curl"] * 0.6)])
    pant = 0.04 * math.sin(2 * math.pi * 2.6 * t) * P_["tongue"]           # happy panting
    rot(arm, "jaw", (1, 0, 0), P_["jaw"] + pant)
    tg = P_["tongue"]
    pb = arm.pose.bones["tongue"]
    pb.scale = (1.0, 1.0 + 0.25 * tg, 1.0)
    pb.location = (0.0, 0.042 * tg, 0.0)                                   # slides out along its length over the lip
    rot(arm, "tongue", (1, 0, 0), 0.30 * tg + 0.06 * tg * math.sin(2 * math.pi * 2.6 * t))


# ---------------------------------------------------------------- scene helpers

def blob_shadow(parent, r=0.40):
    import numpy as np
    n = 32; y, x = np.mgrid[:n, :n]; d = np.hypot(x - n / 2 + 0.5, y - n / 2 + 0.5) / (n / 2)
    a = np.zeros((n, n, 4), np.uint8); a[..., 3] = (np.clip(1 - d, 0, 1) ** 0.8 * 120).astype(np.uint8)
    img = K.image_from_array("blob", a)
    m = K.mat_image("blob", img, emit_only=True, alpha=True)
    o = K.plane("blob", r * 1.2, r * 2.3, (0, 0.03, 0.003), rot=(0, 0, 0), mat=m)
    o.parent = parent
    return o


def build(with_uv=True):
    """-> (mesh object, armature, face image node). Move/turn the dog by parenting the armature to an empty."""
    B = build_mesh()
    o, face_node = make_object(B, with_uv)
    arm = build_armature()
    rig(o, arm)
    print(f"DOG v2: {len(o.data.vertices)} verts, {len(o.data.polygons)} faces, {tri_count(o)} tris")
    return o, arm, face_node

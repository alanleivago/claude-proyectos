"""zaw-dog v2: realistic low-poly PS1 mixed-breed dog (Blender side). Import from a piece's build script (README.md).

Mesh   = lofted low-poly sections fitted to the old dog's real photos (side_real.jpg + faces2), one object, one material,
         one 256 px atlas (tex/atlas_<expr>.png, baked by bake.py from those photos, colour-matched to one brown and one
         white and blended, so there are no patches or stickers).
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
# ---------------------------------------------------------------- shape tables
# Realistic adult mixed breed, fitted to the old dog's photos (VLVT method): the side silhouette of
# pieces/zaw-dog-test/ref/side_real.jpg (side px -> metres with SIDE_S, the dog faces -Y, paws on z=0) and the widths of
# the front face photo ref/faces2/neutral.jpg (face px -> metres with FACE_K). bake.py projects the same two photos.
SIDE_REF = os.path.join(ROOT, "pieces", "zaw-dog-test", "ref", "side_real.jpg")
FACE_REF = os.path.join(ROOT, "pieces", "zaw-dog-test", "ref", "faces2")
SIDE_S, SIDE_X0, SIDE_G = 0.00122, 570, 810       # side px -> m, px column of y=0, px row of the ground
FACE_K, FACE_X0 = 0.000323, 512                    # face px -> m (x), centre column
# face photo rows -> world z (eyes, nose, mouth, chin land on the same heights as in the side photo)
FACE_ROWS = [(0, 0.884), (120, 0.844), (388, 0.756), (630, 0.698), (760, 0.652), (800, 0.618), (915, 0.570), (1024, 0.535)]


def Pw(px, py, X=0.0):
    """side photo px -> world."""
    return Vector((X, (px - SIDE_X0) * SIDE_S, (SIDE_G - py) * SIDE_S))


def L(px):
    return px * SIDE_S


# torso sections: (side px x, top py, bottom py, half width m)
TORSO = [(372, 405, 492, 0.055), (395, 350, 543, 0.100), (440, 315, 578, 0.126), (520, 296, 584, 0.132),
         (610, 306, 566, 0.130), (690, 305, 536, 0.123), (750, 301, 522, 0.118), (820, 302, 543, 0.126),
         (880, 312, 545, 0.130), (930, 334, 505, 0.118), (955, 370, 450, 0.070)]
TORSO_CAP = (962, 410)
# neck rings: (centre px, half depth px, half width m)
NECK = [((470, 425), 80, 0.105), ((432, 325), 92, 0.096), ((402, 238), 82, 0.086)]
# skull sections along -Y: (side px x, top py, bottom py, half width m)
SKULL = [(452, 165, 245, 0.055), (425, 136, 268, 0.078), (385, 121, 285, 0.090), (340, 117, 296, 0.093),
         (296, 124, 296, 0.082), (272, 140, 288, 0.062), (258, 160, 274, 0.046)]
SKULL_CAP0, SKULL_CAP1 = (462, 205), (252, 212)
MUZZLE = [(275, 172, 292, 0.068), (232, 193, 289, 0.057), (195, 211, 281, 0.050), (168, 225, 267, 0.035)]
MUZZLE_CAP = (160, 246)
NOSE = [(196, 236, 16, 0.030), (172, 235, 18, 0.031), (158, 238, 12, 0.020)]   # (px x, centre py, half h px, hw m)
NOSE_CAP = (153, 238)
JAW = [(286, 287, 316, 0.048), (248, 285, 309, 0.041), (218, 280, 301, 0.031)]
JAW_CAP = (207, 293)
# ear: path of section centres (x>0 side, world m), breadth, thickness (from the side ear + the front ear)
# the root ring sits INSIDE the skull and the bone pivots there, so the ear stays attached in every pose
# (v2.1: 25% longer and wider than the photo fit, at the user's request)
EAR = [((0.035, -0.214, 0.800), 0.080, 0.032), ((0.080, -0.220, 0.795), 0.130, 0.026),
       ((0.101, -0.226, 0.751), 0.156, 0.024), ((0.103, -0.229, 0.699), 0.131, 0.020),
       ((0.099, -0.230, 0.664), 0.075, 0.013)]
EAR_CAP = (0.095, -0.230, 0.646)
EAR_FLARE = 0.35          # the ear's front edge turns out, so the ear face shows from the front like in the photo
FRONT_X, HIND_X = 0.072, 0.078
# legs: (side px x, py, half depth px, half width m, weights)
FLEG = [(485, 430, 56, 0.050, {"@chest": 0.5, "upper_arm": 0.5}), (484, 595, 48, 0.054, {"upper_arm": 0.6, "forearm": 0.4}),
        (476, 742, 33, 0.042, {"forearm": 0.5, "paw_f": 0.5}), (462, 775, 44, 0.049, {"paw_f": 1.0}),
        (455, 797, 51, 0.053, {"paw_f": 1.0}), (455, 810, 46, 0.048, {"paw_f": 1.0})]
HLEG = [(860, 440, 80, 0.079, {"@hips": 0.5, "thigh": 0.5}), (872, 565, 90, 0.077, {"thigh": 1.0}),
        (902, 640, 60, 0.056, {"thigh": 0.5, "shin": 0.5}), (950, 702, 34, 0.041, {"shin": 0.5, "paw_h": 0.5}),
        (936, 788, 41, 0.048, {"paw_h": 1.0}), (933, 802, 48, 0.052, {"paw_h": 1.0}), (933, 810, 46, 0.048, {"paw_h": 1.0})]
# tail: centre path px + radius px (curls up and forward over the back, like the photo)
TAIL = [(905, 325, 24), (940, 295, 32), (975, 250, 38), (990, 210, 38), (970, 182, 32), (930, 180, 22), (893, 205, 10)]
TAIL_W = [{"hips": 0.6, "tail1": 0.4}, {"tail1": 1.0}, {"tail1": 0.5, "tail2": 0.5}, {"tail2": 1.0},
          {"tail2": 0.5, "tail3": 0.5}, {"tail3": 1.0}, {"tail3": 1.0}]
# bones (rest, side px)
B_HIPS, B_CHEST, B_NECK, B_HEAD, B_NOSE = (905, 420), (640, 425), (455, 420), (412, 232), (160, 238)
B_JAW = ((300, 280), (205, 298))
B_TONGUE = ((282, 291), (226, 291))
HEAD_PARTS = ("head", "muzzle", "nose", "jaw", "mouth", "tongue", "ear")


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
    """dog skull: flatter, narrower crown, full cheeks low on the sides, narrower throat."""
    out = []
    for c, s in prof_circle(n):
        m = (0.86 if s > 0.5 else 1.0) + 0.06 * math.exp(-((s + 0.35) / 0.35) ** 2)
        out.append((c * m * (0.8 if s < -0.7 else 1.0), s))
    return out


def prof_muzzle(n):
    """muzzle: narrower over the nose bridge, full lips low on the sides, flat underside."""
    out = []
    for c, s in prof_super(n, 2.4):
        k = 0.84 + 0.16 * (1 - max(s, 0)) + 0.05 * math.exp(-((s + 0.35) / 0.35) ** 2)
        out.append((c * k, s))
    return out


def prof_torso(n):
    """deep-chested dog: full ribs, a narrower keel underneath."""
    out = []
    for c, s in prof_super(n, 2.2):
        out.append((c * (0.80 if s < -0.5 else 1.0), s))
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


def _sections(B, table, prof, w, part, cap0=None, cap1=None, along=(0, -1, 0)):
    """lofts (px x, top py, bottom py, hw) sections along -Y; caps given in px."""
    rs, cs = [], []
    for i, (px, top, bot, hw) in enumerate(table):
        c = Pw(px, (top + bot) / 2); cs.append(c)
        ww = w(px) if callable(w) else w
        rs.append(B.ring(c, along, hw, L(bot - top) / 2, prof, ww, part, i / (len(table) - 1)))
    wc = w(table[0][0]) if callable(w) else w
    c0 = (Pw(*cap0), wc, 0.0) if cap0 else None
    c1 = (Pw(*cap1), w(table[-1][0]) if callable(w) else w, 1.0) if cap1 else None
    B.loft(rs, cs, part, cap0=c0, cap1=c1)


def build_mesh():
    B = Builder()
    # torso (chest -> rump), 10 sides; chest/hips weights blend over the middle of the back
    def tw(px):
        k = min(1, max(0, (px - 560) / 260))
        return {"chest": 1 - k, "hips": k} if 0 < k < 1 else ({"chest": 1.0} if k == 0 else {"hips": 1.0})
    _sections(B, TORSO, prof_torso(10), tw, "torso", cap0=(362, 448), cap1=TORSO_CAP, along=(0, 1, 0))
    # neck: thick, tilted from the shoulders up into the back of the skull (open ends are buried)
    NW = [{"chest": 1.0}, {"chest": 0.4, "neck": 0.6}, {"neck": 0.4, "head": 0.6}]
    pts = [Pw(*c) for c, _, _ in NECK]
    rs = []
    for i, ((c, hd, hw), w) in enumerate(zip(NECK, NW)):
        t = pts[min(i + 1, 2)] - pts[max(i - 1, 0)]
        rs.append(B.ring(pts[i], t, hw, L(hd), prof_circle(10), w, "neck", i / 2))
    B.loft(rs, pts, "neck")
    HD = {"head": 1.0}
    _sections(B, SKULL, prof_head(12), HD, "head", cap0=SKULL_CAP0, cap1=SKULL_CAP1)
    _sections(B, MUZZLE, prof_muzzle(10), HD, "muzzle", cap1=MUZZLE_CAP)
    rs, cs = [], []
    for i, (px, cy, hh, hw) in enumerate(NOSE):
        c = Pw(px, cy); cs.append(c); rs.append(B.ring(c, (0, -1, 0), hw, L(hh), prof_super(6, 2.2, 0.0), HD, "nose", i / 2))
    B.loft(rs, cs, "nose", cap1=(Pw(*NOSE_CAP), HD, 1.0))
    rs, cs = [], []
    JW = {"jaw": 1.0}
    for i, (px, top, bot, hw) in enumerate(JAW):
        c = Pw(px, (top + bot) / 2); cs.append(c)
        rs.append(B.ring(c, (0, -1, 0), hw, L(bot - top) / 2, prof_jaw(), JW, "jaw", i / 2))
    B.loft(rs, cs, "jaw", cap1=(Pw(*JAW_CAP), JW, 1.0))
    # mouth inside: a dark box, top on the head, bottom on the jaw -> it fills the gap when the jaw opens
    q = []
    for px in (280, 236):
        for py, w in ((298, {"jaw": 1.0}), (287, {"head": 1.0})):
            for x in (-0.020, 0.020):
                q.append(B.vert(Pw(px, py, x * (0.8 if px < 250 else 1)), w, "mouth"))
    ins = Pw(258, 292)
    for f in ([0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]):
        B.add([q[i] for i in f], "mouth", ins)
    # tongue: rests on the jaw inside the mouth; the `tongue` bone slides it out (happy)
    TG = {"tongue": 1.0}
    rs, cs = [], []
    for i, (px, hw) in enumerate([(280, 0.022), (252, 0.026), (228, 0.021)]):
        c = Pw(px, 291); cs.append(c); rs.append(B.ring(c, (0, -1, 0), hw, 0.009, prof_super(4, 2.0, 0.0), TG, "tongue", i / 2))
    B.loft(rs, cs, "tongue", cap0=(Pw(288, 291), TG, 0.0), cap1=(Pw(220, 292), TG, 1.0))
    # ears: soft leathers hanging from the top of the skull beside the cheeks (lens section, 6 sides)
    lens = [(-1, 0), (-0.55, 1), (0.55, 1), (1, 0), (0.55, -1), (-0.55, -1)]
    for side, sx in (("L", 1), ("R", -1)):
        rs, cs = [], []
        pts = [Vector((sx * p[0], p[1], p[2])) for p, _, _ in EAR]
        for k, (p, br, th) in enumerate(EAR):
            t = pts[min(k + 1, len(pts) - 1)] - pts[max(k - 1, 0)]
            rs.append(B.ring(pts[k], t, br / 2, th / 2, lens, {f"ear.{side}": 1.0}, "ear", k / (len(EAR) - 1),
                             a=(sx * EAR_FLARE, -1, 0.0)))
            cs.append(pts[k])
        B.loft(rs, cs, "ear", cap0=(pts[0] + Vector((-sx * 0.012, 0, 0.0)), {f"ear.{side}": 1.0}, 0.0),
               cap1=(Vector((sx * EAR_CAP[0], EAR_CAP[1], EAR_CAP[2])), {f"ear.{side}": 1.0}, 1.0))
    # legs (8 sides, horizontal rings)
    for side, sx in (("L", 1), ("R", -1)):
        for spec, X, part in ((FLEG, FRONT_X, "leg_f"), (HLEG, HIND_X, "leg_h")):
            rs, cs = [], []
            for px, py, hd, hw, w in spec:
                w = {(k[1:] if k[0] == "@" else f"{k}.{side}"): v for k, v in w.items()}
                c = Pw(px, py, sx * X); cs.append(c)
                rs.append(B.ring(c, (0, 0, -1), hw, L(hd), prof_super(8, 2.05), w, part, c.z))
            paw = f"{'paw_f' if part == 'leg_f' else 'paw_h'}.{side}"
            B.loft(rs, cs, part, cap1=(Pw(spec[-1][0], SIDE_G + 2, sx * X), {paw: 1.0}, 0.0))
    # tail: plume curling up over the back (6 sides, alternating tufts)
    rs = []
    pts = [Pw(px, py) for px, py, _ in TAIL]
    for i, ((px, py, r), w) in enumerate(zip(TAIL, TAIL_W)):
        t = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]
        tuft = [(u * (1.10 if j % 2 == 0 else 0.93), v * (1.10 if j % 2 == 0 else 0.93)) for j, (u, v) in enumerate(prof_circle(6, math.pi / 2 + i * 0.5))]
        rs.append(B.ring(pts[i], t, L(r), L(r), tuft, w, "tail", i / (len(TAIL) - 1)))
    tip = pts[-1] + (pts[-1] - pts[-2]).normalized() * 0.012
    B.loft(rs, pts, "tail", cap1=(tip, {"tail3": 1.0}, 1.0))
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
    bone("hips", Pw(*B_HIPS), Pw(*B_CHEST), "root")
    bone("chest", Pw(*B_CHEST), Pw(*B_NECK), "hips", connect=True)
    bone("neck", Pw(*B_NECK), Pw(*B_HEAD), "chest", connect=True)
    bone("head", Pw(*B_HEAD), Pw(*B_NOSE), "neck", connect=True)
    bone("jaw", Pw(*B_JAW[0]), Pw(*B_JAW[1]), "head")
    bone("tongue", Pw(*B_TONGUE[0]), Pw(*B_TONGUE[1]), "jaw")
    tp = [Pw(px, py) for px, py, _ in TAIL]
    bone("tail1", tp[0], tp[2], "hips"); bone("tail2", tp[2], tp[4], "tail1", connect=True)
    bone("tail3", tp[4], tp[6], "tail2", connect=True)
    for side, sx in (("L", 1), ("R", -1)):
        e0 = Vector((sx * EAR[0][0][0], EAR[0][0][1], EAR[0][0][2]))
        bone(f"ear.{side}", e0, Vector((sx * EAR[-1][0][0], EAR[-1][0][1], EAR[-1][0][2])), "head")
        X = sx * FRONT_X
        sh, el, wr, toe = Pw(485, 420, X), Pw(498, 590, X), Pw(476, 745, X), Pw(425, 800, X)
        bone(f"upper_arm.{side}", sh, el, "chest"); bone(f"forearm.{side}", el, wr, f"upper_arm.{side}", connect=True)
        bone(f"paw_f.{side}", wr, toe, f"forearm.{side}", connect=True)
        bone(f"ik_f.{side}", wr, toe, "root", deform=False)
        bone(f"pole_f.{side}", el + Vector((0, 0.40, 0)), el + Vector((0, 0.45, 0)), "root", deform=False)
        X = sx * HIND_X
        hp, st, an, toe = Pw(860, 430, X), Pw(895, 632, X), Pw(952, 702, X), Pw(905, 800, X)
        bone(f"thigh.{side}", hp, st, "hips"); bone(f"shin.{side}", st, an, f"thigh.{side}", connect=True)
        bone(f"paw_h.{side}", an, toe, f"shin.{side}", connect=True)
        bone(f"ik_h.{side}", an, toe, "root", deform=False)
        bone(f"pole_h.{side}", st + Vector((0, -0.40, 0)), st + Vector((0, -0.45, 0)), "root", deform=False)
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

WALK_T = 26          # frames per cycle
STRIDE_A = 0.070     # half stride (m)
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
            y = STRIDE_A - 2 * STRIDE_A * ease(s); z = 0.050 * math.sin(math.pi * s)
            pitch = -0.40 * math.sin(math.pi * s) * (1.0 if b.startswith("ik_h") else 0.6)
        move(arm, b, (0, y - (0.02 if b.startswith("ik_h") else 0.0), z), k)
        rot(arm, b, (1, 0, 0), pitch, k)
    w = 2 * math.pi * f / WALK_T
    move(arm, "hips", (0, 0, -0.022 + 0.007 * math.cos(2 * w)), k)      # walks a little crouched: slack for planted paws
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
    "neutral": dict(out=0.05, back=0.0, neck=0.0, head=0.0, turn=0.0, tilt=0.0, tail_up=0.0, tail_curl=0.0, wag=0.18, wag_hz=1.2, jaw=0.0, tongue=0.0, wiggle=0.0, crouch=0.0),
    "happy":   dict(out=0.22, back=0.35, neck=-0.04, head=-0.02, turn=0.0, tilt=0.14, tail_up=0.25, tail_curl=0.0, wag=1.0, wag_hz=4.4, jaw=0.10, tongue=1.0, wiggle=1.0, crouch=0.0),
    # sad (ethology: ears back/flattened, head lowered but eyes up at you, tail low/tucked, body lowered; the face
    # photo does the raised inner brows, upward gaze, closed lips and the small tears)
    "sad":     dict(out=-0.18, back=0.45, neck=0.32, head=-0.16, turn=0.0, tilt=-0.06, tail_up=-2.2, tail_curl=-1.5, wag=0.0, wag_hz=0.0, jaw=0.0, tongue=0.0, wiggle=0.0, crouch=0.035),
    "judging": dict(out=0.70, back=0.20, neck=-0.06, head=-0.05, turn=0.24, tilt=0.10, tail_up=-0.4, tail_curl=-0.3, wag=0.0, wag_hz=0.0, jaw=0.0, tongue=0.0, wiggle=0.0, crouch=0.0),
    "shocked": dict(out=0.45, back=-0.55, neck=-0.20, head=-0.12, turn=0.0, tilt=0.0, tail_up=0.15, tail_curl=-0.8, wag=0.0, wag_hz=0.0, jaw=0.12, tongue=0.0, wiggle=0.0, crouch=0.0),
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
    if P_["crouch"] > 0.001:                                               # body lowered (added to any walk/hand pose)
        pb = arm.pose.bones["hips"]
        pb.location = pb.location + arm.data.bones["hips"].matrix_local.to_3x3().inverted() @ Vector((0, 0, -P_["crouch"]))
    pant = 0.04 * math.sin(2 * math.pi * 2.6 * t) * P_["tongue"]           # happy panting
    rot(arm, "jaw", (1, 0, 0), P_["jaw"] + pant)
    tg = P_["tongue"]
    pb = arm.pose.bones["tongue"]
    pb.scale = (1.0, 1.0 + 0.25 * tg, 1.0)
    pb.location = (0.0, 0.042 * tg, 0.0)                                   # slides out along its length over the lip
    rot(arm, "tongue", (1, 0, 0), 0.30 * tg + 0.06 * tg * math.sin(2 * math.pi * 2.6 * t))


# ---------------------------------------------------------------- scene helpers

def blob_shadow(parent, r=0.46):
    import numpy as np
    n = 32; y, x = np.mgrid[:n, :n]; d = np.hypot(x - n / 2 + 0.5, y - n / 2 + 0.5) / (n / 2)
    a = np.zeros((n, n, 4), np.uint8); a[..., 3] = (np.clip(1 - d, 0, 1) ** 0.8 * 120).astype(np.uint8)
    img = K.image_from_array("blob", a)
    m = K.mat_image("blob", img, emit_only=True, alpha=True)
    o = K.plane("blob", r * 1.0, r * 2.4, (0, 0.03, 0.003), rot=(0, 0, 0), mat=m)
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

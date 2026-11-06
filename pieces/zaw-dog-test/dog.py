"""Low-poly PS1 dog for the zaw-dog channel (Blender side, imported by build.py).
Mesh = lofted low-poly sections (half model mirrored in X, like the John Flynn tutorial), body textured by projecting the
side photo (tex/body.png), head/ears/jaw by projecting the front face sheet (tex/face_<expr>.png, swapped per expression).
Hand armature (3D Code Academy tutorial): root, hips, chest, neck, head, jaw, ears, 3 tail bones, legs with IK targets +
poles; paws copy the IK control's rotation so they stay flat. Weights are assigned per section ring (no auto weights)."""
import math
import os

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector

import lpskit as K

H = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(H, "tex")
EXPRS = ["neutral", "happy", "sad", "judging", "shocked"]

S = 0.001                      # side photo px -> m
CROP = (120, 90, 1080, 834)    # = prep.BODY_CROP
KF = 0.0005                    # face sheet px -> m
ZN = 0.62                      # world z of the nose centre (face px y = 540)
FRONT_X, HIND_X = 0.085, 0.095


def P(x, y, X=0.0):
    """side photo px -> world (dog faces -Y, paws on z=0)."""
    return Vector((X, (x - 650) * S, (810 - y) * S))


def hz(fy):
    return ZN - (fy - 540) * KF


def uv_side(co):
    x = co.y / S + 650; y = 810 - co.z / S
    return ((x - CROP[0]) / (CROP[2] - CROP[0]), 1 - (y - CROP[1]) / (CROP[3] - CROP[1]))


def uv_face(co):
    fx = co.x / KF + 512; fy = 540 - (co.z - ZN) / KF
    return (fx / 1024, 1 - fy / 1024)


UV_BROWN = (640 / 1024, 1 - 170 / 1024)   # brown forehead in all five sheets
UV_WHITE = (395 / 1024, 1 - 520 / 1024)
HS_Y, HS_Z = (-0.50, -0.14), (0.47, 0.84)  # head_side.png covers this Y (nose..back) x Z box (= prep)
BIB_X, BIB_Z = (-0.17, 0.17), (0.18, 0.62)


def uv_head_side(co):
    """Side projection of the head onto the painted head_side.png (clean fur, markings continue the face sheet)."""
    return ((co.y - HS_Y[0]) / (HS_Y[1] - HS_Y[0]), (co.z - HS_Z[0]) / (HS_Z[1] - HS_Z[0]))


def uv_bib(co):
    return ((co.x - BIB_X[0]) / (BIB_X[1] - BIB_X[0]), (co.z - BIB_Z[0]) / (BIB_Z[1] - BIB_Z[0]))


# ---------------------------------------------------------------- mesh building

class Builder:
    def __init__(self):
        self.verts, self.faces, self.fmeta, self.vw, self.vc = [], [], [], [], {}

    def ring(self, c, t, rx, rn, n, w, phase=None, sq=None, prof=None):
        """n-gon section centred at c, perpendicular to tangent t; rx along world X, rn along the other axis."""
        t = Vector(t).normalized(); a = Vector((1, 0, 0))
        b = t.cross(a).normalized()
        sc = 1 / math.cos(math.pi / n)
        ph = math.pi / n if phase is None else phase
        idx = []
        if prof:                                             # explicit unit profile (ccw), e.g. the rounded jaw
            for ca, sa in prof:
                self.verts.append(Vector(c) + a * ca * rx + b * sa * rn)
                self.vw.append(w); idx.append(len(self.verts) - 1); self.vc[idx[-1]] = Vector(c)
            return idx
        for i in range(n):
            th = 2 * math.pi * i / n + ph
            ca, sa = math.cos(th) * sc, math.sin(th) * sc
            if sq is not None:                       # squarer octagon: the short coordinate 0.414 -> sq
                ca, sa = (math.copysign(sq, ca), math.copysign(1, sa)) if abs(ca) < abs(sa) else (math.copysign(1, ca), math.copysign(sq, sa))
            self.verts.append(Vector(c) + a * ca * rx + b * sa * rn)
            self.vw.append(w); idx.append(len(self.verts) - 1); self.vc[idx[-1]] = Vector(c)
        return idx

    def loft(self, rings, part, mat, cap0=True, cap1=True):
        n = len(rings[0])
        for r0, r1 in zip(rings, rings[1:]):
            for i in range(n):
                self.add([r0[i], r0[(i + 1) % n], r1[(i + 1) % n], r1[i]], part, mat)
        if cap0:
            self.add(rings[0][::-1], part, mat)
        if cap1:
            self.add(rings[-1], part, mat)

    def add(self, f, part, mat):
        self.faces.append(list(f)); self.fmeta.append((part, mat))

    def extrude_poly(self, pts, y0, y1, w, part, mat):
        a = []; b = []
        for x, z in pts:
            self.verts.append(Vector((x, y0, z))); self.vw.append(w); a.append(len(self.verts) - 1)
        for x, z in pts:
            self.verts.append(Vector((x, y1, z))); self.vw.append(w); b.append(len(self.verts) - 1)
        self.loft([a, b], part, mat)

    def box(self, lo, hi, w, part, mat):
        (x0, y0, z0), (x1, y1, z1) = lo, hi
        r0 = []; r1 = []
        for x, z in ((x0, z0), (x1, z0), (x1, z1), (x0, z1)):
            self.verts.append(Vector((x, y0, z))); self.vw.append(w); r0.append(len(self.verts) - 1)
        for x, z in ((x0, z0), (x1, z0), (x1, z1), (x0, z1)):
            self.verts.append(Vector((x, y1, z))); self.vw.append(w); r1.append(len(self.verts) - 1)
        self.loft([r0, r1], part, mat)


def mix(a, b, t):
    return {a: 1 - t, b: t} if a != b else {a: 1.0}


def build_mesh():
    B = Builder()
    # torso: vertical sections along the body (side px x, top y, bottom y, half width px)
    T = [(965, 372, 515, 70), (938, 318, 585, 122), (862, 300, 574, 150), (760, 297, 550, 156),
         (620, 299, 553, 160), (500, 284, 548, 160), (430, 258, 530, 150), (392, 280, 512, 128),
         (362, 320, 478, 92), (348, 362, 448, 50)]                 # rounded chest: the bib tapers into the neck
    rings = []
    for x, yt, yb, hw in T:
        c = (P(x, yt) + P(x, yb)) / 2
        hipw = min(1, max(0, (x - 560) / 260))
        rings.append(B.ring(c, (0, -1, 0), hw * S, (yb - yt) / 2 * S, 8, mix("chest", "hips", hipw)))
    B.loft(rings, "torso", 0)
    # neck: tilted loft from the chest up into the back of the skull
    n0, n1, n2 = Vector((0, -0.15, 0.40)), Vector((0, -0.21, 0.53)), Vector((0, -0.25, 0.66))
    B.loft([B.ring(n0, n1 - n0, 0.105, 0.10, 8, {"chest": 1.0}),
            B.ring(n1, n2 - n0, 0.10, 0.095, 8, mix("chest", "neck", 0.6)),
            B.ring(n2, n2 - n1, 0.095, 0.09, 8, mix("neck", "head", 0.5))], "neck", 0)
    # legs (horizontal rings, side px centre x, y, half depth px, half width px)
    FL = [(485, 470, 52, 46, {"upper_arm": 0.6, "@chest": 0.4}), (482, 592, 42, 42, "uf"),
          (474, 756, 33, 36, "fp"), (458, 810, 54, 46, {"paw_f": 1})]
    HL = [(870, 478, 74, 58, {"thigh": 0.6, "@hips": 0.4}), (878, 600, 50, 48, "ts"), (928, 672, 38, 39, {"shin": 1}),
          (938, 758, 33, 36, "sp"), (924, 810, 54, 46, {"paw_h": 1})]
    joint = {"uf": ("upper_arm", "forearm"), "fp": ("forearm", "paw_f"), "ts": ("thigh", "shin"), "sp": ("shin", "paw_h")}
    for side, sx in (("L", 1), ("R", -1)):
        for spec, X in ((FL, FRONT_X), (HL, HIND_X)):
            rs = []
            for x, y, ry, rx, w in spec:
                w = mix(*joint[w], 0.5) if isinstance(w, str) else w
                w = {(k[1:] if k[0] == "@" else f"{k}.{side}"): v for k, v in w.items()}
                k = 1.0 if y < 500 else 1.2                     # chunkier legs than the slim reference
                rs.append(B.ring(P(x, y, sx * X), (0, 0, -1), rx * S * k, ry * S * k, 6, w, phase=0.0))
            B.loft(rs, "leg", 0)
    # tail: curl from the rump (side px)
    TP = [(925, 340, 26), (965, 292, 24), (992, 238, 21), (985, 192, 17), (945, 178, 13), (895, 214, 6)]
    TW = [{"hips": 0.5, "tail1": 0.5}, {"tail1": 1}, mix("tail1", "tail2", 0.5), {"tail2": 1}, mix("tail2", "tail3", 0.5),
          {"tail3": 1}]
    pts = [P(x, y) for x, y, _ in TP]
    rs = []
    for i, ((x, y, r), w) in enumerate(zip(TP, TW)):
        t = pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]
        rs.append(B.ring(pts[i], t, r * S, r * S, 5, w))
    B.loft(rs, "tail", 0)
    # head (face sheet px: y rows, half widths)
    def hring(y, ft, fb, fw, w, n=8, sq=None, prof=None):
        return B.ring(Vector((0, y, (hz(ft) + hz(fb)) / 2)), (0, -1, 0), fw * KF, (hz(ft) - hz(fb)) / 2, n, w, sq=sq, prof=prof)
    HD = {"head": 1.0}
    # rounder skull from the side: the back of the head steps in over 3 rings, the face plane is chamfered
    B.loft([hring(-0.150, 290, 640, 105, mix("neck", "head", 0.7)), hring(-0.185, 190, 730, 175, HD),
            hring(-0.240, 130, 790, 215, HD), hring(-0.310, 112, 808, 226, HD), hring(-0.380, 135, 795, 218, HD),
            hring(-0.408, 205, 752, 178, HD)], "skull", 1)
    # muzzle slopes down from the stop to the nose (dog profile, not a box)
    B.loft([hring(-0.380, 468, 712, 160, HD, sq=0.55), hring(-0.445, 488, 712, 152, HD, sq=0.55),
            hring(-0.492, 508, 705, 116, HD, sq=0.55)], "muzzle", 1)
    JW = {"jaw": 1.0}
    # jaw: flat top under the lip, rounded chin (no boxy band), set back a little behind the nose
    JP = [(1, 0.25), (1, 1), (-1, 1), (-1, 0.25), (-0.62, -0.62), (0, -1), (0.62, -0.62)]
    B.loft([hring(-0.385, 712, 802, 125, JW, prof=JP), hring(-0.440, 712, 786, 112, JW, prof=JP),
            hring(-0.470, 712, 758, 78, JW, prof=JP)], "jaw", 1)
    B.box((-0.035, -0.47, hz(722)), (0.035, -0.40, hz(705)), {"head": 1.0}, "mouth", 2)
    # ears: a lofted leather with thickness and a lengthwise fold (centre pushed back), tapering to the tip
    EAR = [(305, 185, 72, 0.018), (200, 255, 104, 0.017), (135, 355, 100, 0.015), (125, 445, 80, 0.012), (148, 520, 40, 0.008)]
    for side, sx in (("L", 1), ("R", -1)):
        i0 = len(B.verts); rs = []
        cs = [Vector((sx * (512 - fx) * KF, -0.303, hz(fy))) for fx, fy, _, _ in EAR]
        for k, (fx, fy, fb, th) in enumerate(EAR):
            t = cs[min(k + 1, len(cs) - 1)] - cs[max(k - 1, 0)]
            br = Vector((t.z, 0, -t.x)).normalized()            # breadth: perpendicular to the midline in the face plane
            cup = 0.016 * (1 - k / (len(EAR) + 1))
            ring = []
            for u, face in ((-1, -1), (0, -1), (1, -1), (1, 1), (0, 1), (-1, 1)):
                v = cs[k] + br * u * fb * KF + Vector((0, face * th / 2 + (cup if u == 0 else 0), 0))
                B.verts.append(v); B.vw.append({f"ear.{side}": 1.0}); ring.append(len(B.verts) - 1)
            rs.append(ring)
        B.loft(rs, "ear", 3)
        px, py, a = sx * 0.085, -0.303, math.radians(28)
        for v in B.verts[i0:]:
            dx = v.x - px
            v.x, v.y = px + dx * math.cos(a), v.y + abs(dx) * math.sin(a)   # the further out, the further back
    return B


def make_object(B):
    me = bpy.data.meshes.new("Dog")
    me.from_pydata([tuple(v) for v in B.verts], [], B.faces)
    me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free(); me.update()
    uvl = me.uv_layers.new(name="UV")
    for p in me.polygons:
        part, mat = B.fmeta[p.index]
        p.material_index = mat
        for li, vi in zip(p.loop_indices, p.vertices):
            co = me.vertices[vi].co
            if mat == 0:
                c = B.vc.get(vi) if part in ("leg", "tail") else None
                if c is not None:                               # wrap round the limb: sample inside its own photo area
                    d = co - c
                    co = Vector((0, c.y + (0.012 if part == 'leg' and c.y < 0 else 0) + 0.3 * math.copysign(math.hypot(d.x, d.y), d.y), c.z + 0.6 * d.z))
                elif part == "torso" and p.normal.y < -0.45 and co.y < -0.12:   # chest front: painted soft bib
                    p.material_index = 5; uvl.data[li].uv = uv_bib(co); continue
                elif part == "torso" and p.normal.z > 0.55:     # top of the back: clean painted fur (no photo streaks)
                    p.material_index = 4
                    uvl.data[li].uv = (0.6 + 0.35 * min(max((co.y + 0.35) / 0.7, 0), 1), 0.45 + 0.4 * min(max((co.x + 0.17) / 0.34, 0), 1))
                    continue
                elif part in ("torso", "neck") and p.normal.y > 0.3:   # back of neck / rump: clean painted brown fur
                    p.material_index = 4
                    uvl.data[li].uv = (0.93, 0.35 + 0.5 * min(max((co.z - 0.15) / 0.6, 0), 1)); continue
                elif part in ("torso", "neck"):                 # sample inside the silhouette, not on its painted edge
                    co = co - Vector((0, p.normal.y, p.normal.z)) * (0.06 if p.normal.y > 0.4 else 0.035)
                uv = uv_side(co)
            elif part == "skull" and p.normal.y > 0.35:
                p.material_index = 4; uv = uv_head_side(Vector((0, -0.16, co.z)))      # back of the head: brown fur
            elif (abs(p.normal.y) < 0.55 and p.normal.z < 0.75) or (part == "ear" and p.normal.y > -0.6) \
                    or (part in ("muzzle", "jaw") and abs(p.normal.y) < 0.85):           # only true front faces carry the mouth line
                p.material_index = 4; uv = uv_head_side(co)
            elif part == "ear":                                 # ear front: stay below the sheet's ear-top edge
                uv = uv_face(Vector((co.x, co.y, min(co.z, hz(215)))))
            else:
                uv = uv_face(co)
            uvl.data[li].uv = uv
    o = bpy.data.objects.new("Dog", me); K.link(o)
    for vi, w in enumerate(B.vw):
        for g, val in w.items():
            vg = o.vertex_groups.get(g) or o.vertex_groups.new(name=g)
            vg.add([vi], val, "REPLACE")
    body = bpy.data.images.load(os.path.join(TEX, "body.png")); body.pack()
    me.materials.append(K.mat_image("dog_body", body))
    fm = K.mat_image("dog_face", face_image("neutral"))
    me.materials.append(fm)
    me.materials.append(K.mat_color("dog_mouth", "#3A0E12"))
    me.materials.append(K.mat_image("dog_ear", face_image("neutral")))     # ears keep the neutral sheet; poses do the emotion
    hs = bpy.data.images.load(os.path.join(TEX, "head_side.png")); hs.pack()
    me.materials.append(K.mat_image("dog_headside", hs))
    bib = bpy.data.images.load(os.path.join(TEX, "bib.png")); bib.pack()
    me.materials.append(K.mat_image("dog_bib", bib))
    return o, next(n for n in fm.node_tree.nodes if n.type == "TEX_IMAGE")


_faces = {}


def face_image(expr):
    if expr not in _faces:
        im = bpy.data.images.load(os.path.join(TEX, f"face_{expr}.png")); im.pack(); _faces[expr] = im
    return _faces[expr]


def tri_count(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)


# ---------------------------------------------------------------- armature

def build_armature():
    a = bpy.data.armatures.new("DogRig"); arm = bpy.data.objects.new("DogRig", a); K.link(arm)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode="EDIT")
    eb = a.edit_bones

    def bone(name, h, t, parent=None, deform=True, connect=False, roll=0.0):
        b = eb.new(name); b.head = h; b.tail = t; b.roll = roll; b.use_deform = deform
        if parent:
            b.parent = eb[parent]; b.use_connect = connect
        return b
    bone("root", (0, 0, 0), (0, -0.25, 0), deform=False)
    bone("hips", P(935, 405), P(700, 405), "root")
    bone("chest", P(700, 405), P(430, 405), "hips", connect=True)
    bone("neck", P(430, 405), (0, -0.25, 0.64), "chest", connect=True)
    bone("head", (0, -0.25, 0.64), (0, -0.45, 0.64), "neck", connect=True)
    bone("jaw", (0, -0.385, hz(712)), (0, -0.48, hz(728)), "head")
    tp = [P(925, 340), P(992, 238), P(956, 178), P(880, 238)]
    bone("tail1", tp[0], tp[1], "hips"); bone("tail2", tp[1], tp[2], "tail1", connect=True)
    bone("tail3", tp[2], tp[3], "tail2", connect=True)
    for side, sx in (("L", 1), ("R", -1)):
        ea = Vector((sx * 0.090, -0.304, hz(235))); bone(f"ear.{side}", ea, ea + Vector((sx * 0.05, 0, -0.16)), "head")
        X = sx * FRONT_X
        sh, el, wr, toe = P(485, 450, X), P(482, 600, X), P(474, 776, X), P(420, 800, X)
        bone(f"upper_arm.{side}", sh, el, "chest"); bone(f"forearm.{side}", el, wr, f"upper_arm.{side}", connect=True)
        bone(f"paw_f.{side}", wr, toe, f"forearm.{side}", connect=True)
        bone(f"ik_f.{side}", wr, toe, "root", deform=False)
        bone(f"pole_f.{side}", el + Vector((0, 0.35, 0)), el + Vector((0, 0.40, 0)), "root", deform=False)
        X = sx * HIND_X
        hp, st, an, toe = P(870, 450, X), P(878, 610, X), P(938, 776, X), P(884, 800, X)
        bone(f"thigh.{side}", hp, st, "hips"); bone(f"shin.{side}", st, an, f"thigh.{side}", connect=True)
        bone(f"paw_h.{side}", an, toe, f"shin.{side}", connect=True)
        bone(f"ik_h.{side}", an, toe, "root", deform=False)
        bone(f"pole_h.{side}", st + Vector((0, -0.35, 0)), st + Vector((0, -0.40, 0)), "root", deform=False)
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
    """Pick the pole angle that keeps each IK chain in its rest pose (tutorial: 'adjust Pole Angle until it bends right')."""
    for side in "LR":
        for ch, up in (("forearm", "upper_arm"), ("shin", "thigh")):
            c = arm.pose.bones[f"{ch}.{side}"].constraints["IK"]
            best = None
            for deg in range(-180, 180, 5):
                c.pole_angle = math.radians(deg)
                bpy.context.view_layer.update()
                err = 0
                for b in (up, ch):
                    pb = arm.pose.bones[f"{b}.{side}"]
                    err += sum(abs(x) for r in (pb.matrix - pb.bone.matrix_local) for x in r)
                if best is None or err < best[0]:
                    best = (err, deg)
            c.pole_angle = math.radians(best[1])
            print(f"pole {ch}.{side}: {best[1]} deg (err {best[0]:.4f})")


def rig(o, arm):
    m = o.modifiers.new("Armature", "ARMATURE"); m.object = arm
    o.parent = arm


# ---------------------------------------------------------------- posing helpers

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


def move(arm, bone, off_world, f=None):
    pb = arm.pose.bones[bone]
    pb.location = arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(off_world)
    if f is not None:
        pb.keyframe_insert("location", frame=f)


def ease(t):
    return 0.5 - 0.5 * math.cos(math.pi * min(max(t, 0), 1))


WALK_T = 24          # frames per cycle
STRIDE_A = 0.075     # half stride (m)
STANCE = 0.62
PHASE = {"ik_h.L": 0.0, "ik_f.L": 0.25, "ik_h.R": 0.5, "ik_f.R": 0.75}
WALK_SPEED = 2 * STRIDE_A / (STANCE * WALK_T)   # m per frame, so planted paws do not slide


def walk_pose(arm, f, key=True):
    """One walk-cycle pose at frame f (0..WALK_T): IK paws, body bob, head bob, tail wag, ear bounce."""
    k = f if key else None
    for b, ph in PHASE.items():
        p = (f / WALK_T + ph) % 1
        if p < STANCE:
            y = -STRIDE_A + 2 * STRIDE_A * p / STANCE; z = 0.0; pitch = 0.0
        else:
            s = (p - STANCE) / (1 - STANCE)
            y = STRIDE_A - 2 * STRIDE_A * ease(s); z = 0.055 * math.sin(math.pi * s)
            pitch = -0.45 * math.sin(math.pi * s) * (1.0 if b.startswith("ik_h") else 0.6)
        move(arm, b, (0, y, z), k)
        rot(arm, b, (1, 0, 0), pitch, k)
    w = 2 * math.pi * f / WALK_T
    move(arm, "hips", (0, 0, 0.010 * math.cos(2 * w)), k)
    rot2(arm, "hips", [((0, 1, 0), 0.05 * math.sin(w)), ((0, 0, 1), 0.04 * math.sin(w))], k)
    rot2(arm, "chest", [((0, 1, 0), -0.07 * math.sin(w + 0.8)), ((0, 0, 1), -0.05 * math.sin(w))], k)
    rot(arm, "neck", (1, 0, 0), 0.06 * math.cos(2 * w - 0.6), k)
    rot2(arm, "head", [((1, 0, 0), -0.05 * math.cos(2 * w - 1.2)), ((0, 1, 0), 0.04 * math.sin(w))], k)
    for i, bn in enumerate(("tail1", "tail2", "tail3")):
        rot(arm, bn, (0, 0, 1), (0.42, 0.30, 0.30)[i] * math.sin(2 * w - 0.7 * i), k)
    for side, sx in (("L", 1), ("R", -1)):
        rot2(arm, f"ear.{side}", [((0, 1, 0), -sx * (0.22 + 0.12 * math.sin(2 * w - 1.6))),
                                   ((1, 0, 0), 0.40 + 0.12 * math.cos(2 * w - 1.6))], k)
    rot(arm, "jaw", (1, 0, 0), 0.05 + 0.03 * math.sin(2 * w), k)


def make_walk_action(arm, repeats, start=1):
    """Key one cycle into an action, push it down to an NLA strip that repeats (Ovi Gomy tutorial)."""
    arm.animation_data_create()
    for f in range(WALK_T + 1):
        walk_pose(arm, f)
    act = arm.animation_data.action; act.name = "walk"; act.use_fake_user = True
    for fc in getattr(act, "fcurves", []):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    try:
        for layer in act.layers:
            for strip in layer.strips:
                for cb in strip.channelbags:
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points:
                            kp.interpolation = "LINEAR"
    except AttributeError:
        pass
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


# Emotion through dog body language (ZawPolyShorts: the animal face stays an animal; the pose sells the feeling).
# ears: out = lift sideways (+ = away from the head), back = tips swing back (+) or forward (-)
# neck/head pitch: + = nose down; tail_up: tail1 pitch (+ = up/forward, - = down/tucked); tail_curl: + curls, - straightens
EXPR_POSE = {
    "neutral": dict(out=0.05, back=0.0, neck=0.0, head=0.0, turn=0.0, tilt=0.0, tail_up=0.0, tail_curl=0.0, wag=0.25, wag_hz=1.2, jaw=0.0),
    "happy":   dict(out=0.25, back=0.45, neck=-0.05, head=0.05, turn=0.0, tilt=0.16, tail_up=0.15, tail_curl=0.0, wag=0.55, wag_hz=3.0, jaw=0.05),
    "sad":     dict(out=-0.05, back=0.55, neck=0.38, head=0.30, turn=0.0, tilt=-0.06, tail_up=-1.7, tail_curl=-0.9, wag=0.0, wag_hz=0.0, jaw=0.0),
    "judging": dict(out=0.85, back=0.25, neck=-0.08, head=-0.06, turn=0.22, tilt=0.10, tail_up=-0.5, tail_curl=-0.4, wag=0.0, wag_hz=0.0, jaw=0.0),
    "shocked": dict(out=0.55, back=-0.75, neck=-0.25, head=-0.15, turn=0.0, tilt=0.0, tail_up=0.2, tail_curl=-1.0, wag=0.0, wag_hz=0.0, jaw=0.12),
}


def expr_pose(arm, e, t=0.0, prev=None, a=1.0):
    """Absolute pose for ears/neck/head/tail/jaw for expression e at time t (s); blends in from `prev` while a < 1."""
    a = ease(a)
    P_ = {key: v * a + (EXPR_POSE[prev][key] if prev else v) * (1 - a) for key, v in EXPR_POSE[e].items()}
    w = 2 * math.pi * t
    rot2(arm, "neck", [((1, 0, 0), P_["neck"])])
    rot2(arm, "head", [((1, 0, 0), P_["head"]), ((0, 0, 1), P_["turn"]), ((0, 1, 0), P_["tilt"])])
    for s_, sx in (("L", 1), ("R", -1)):
        asym = 1.0 if sx > 0 else 0.62                      # one ear flatter than the other reads less mechanical
        sway = 0.05 * math.sin(1.1 * w + 1.3 * sx) + 0.03 * math.sin(1.7 * w + sx)
        rot2(arm, f"ear.{s_}", [((0, 1, 0), -sx * (P_["out"] * asym + sway)), ((1, 0, 0), P_["back"] * (2 - asym) + sway)])
    wag = P_["wag"] * math.sin(P_["wag_hz"] * w)
    rot2(arm, "tail1", [((1, 0, 0), P_["tail_up"]), ((0, 0, 1), wag)])
    rot2(arm, "tail2", [((1, 0, 0), P_["tail_curl"] * 0.6), ((0, 0, 1), 0.6 * wag)])
    rot2(arm, "tail3", [((1, 0, 0), P_["tail_curl"] * 0.6), ((0, 0, 1), 0.5 * wag)])
    rot(arm, "jaw", (1, 0, 0), P_["jaw"] + (0.03 * math.sin(4 * w) if e == "happy" else 0.0))


def rest(arm):
    for pb in arm.pose.bones:
        pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)


def blob_shadow(parent, r=0.42):
    import numpy as np
    n = 32; y, x = np.mgrid[:n, :n]; d = np.hypot(x - n / 2 + 0.5, y - n / 2 + 0.5) / (n / 2)
    a = np.zeros((n, n, 4), np.uint8); a[..., 3] = (np.clip(1 - d, 0, 1) ** 0.8 * 120).astype(np.uint8)
    img = K.image_from_array("blob", a)
    m = K.mat_image("blob", img, emit_only=True, alpha=True)
    o = K.plane("blob", r * 1.2, r * 2.4, (0, 0.02, 0.003), rot=(0, 0, 0), mat=m)
    o.parent = parent
    return o


def build():
    B = build_mesh()
    o, face_node = make_object(B)
    arm = build_armature()
    rig(o, arm)
    print(f"DOG: {len(o.data.vertices)} verts, {len(o.data.polygons)} faces, {tri_count(o)} tris")
    return o, arm, face_node


def set_face(face_node, expr):
    face_node.image = face_image(expr)

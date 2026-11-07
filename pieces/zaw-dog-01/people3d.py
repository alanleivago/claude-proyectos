"""Low-poly humans for zaw-dog (Blender side), remodelled after Zaw's owner (ref/analysis_*.md: stiff mid-poly avatar,
normal adult proportions, white tee/polo + jeans, short dark hair, stubble).
- body: a skin-modifier skeleton (the low-poly "skin + subsurf 1" modelling route) -> one continuous mesh with real
  shoulders, elbows, hands with a thumb, knees; weighted to a named armature by distance to each bone
- head: an ellipsoid with jaw taper, nose, brow, ears; the Flow passport photo projected on the front faces, hair /
  skin colour on the rest (atlas 384x256 -> Closest)
- clothing: per-vertex colours (PS1-style Gouraud) with fold shading (armpits, elbows, crotch, knees, waist drape)
- shoes: separate low-poly shoe meshes on the foot bones, sole on z = 0
Person faces -Y; +X is the person's left. P = Person("owner", OWNER_SPEC); P.root is the armature (place/turn it)."""
import json
import math
import os

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Quaternion, Vector

import lpskit as K

H = os.path.dirname(os.path.abspath(__file__))

# skeleton: name -> (pos, (rx, ry)); L side, mirrored for R
SKEL = {"pelvis": ((0, 0, 0.97), (0.15, 0.10)), "waist": ((0, 0.005, 1.12), (0.142, 0.096)),
        "chest": ((0, 0, 1.30), (0.19, 0.118)), "upchest": ((0, 0.005, 1.41), (0.182, 0.105)),
        "neck0": ((0, 0.01, 1.49), (0.07, 0.07)), "neck1": ((0, 0.016, 1.58), (0.064, 0.064)),
        "sh": ((0.218, 0.01, 1.42), (0.07, 0.068)), "elbow": ((0.262, 0.02, 1.15), (0.05, 0.05)),
        "wrist": ((0.268, 0.0, 0.905), (0.033, 0.028)), "palm": ((0.274, -0.005, 0.83), (0.018, 0.043)),
        "fing": ((0.278, -0.005, 0.745), (0.013, 0.036)), "thumb": ((0.256, -0.047, 0.855), (0.013, 0.013)),
        "hip": ((0.097, 0, 0.92), (0.096, 0.096)), "knee": ((0.10, 0.0, 0.52), (0.063, 0.065)),
        "ankle": ((0.10, 0.015, 0.11), (0.04, 0.04))}
EDGES = [("pelvis", "waist"), ("waist", "chest"), ("chest", "upchest"), ("upchest", "neck0"), ("neck0", "neck1"),
         ("upchest", "sh"), ("sh", "elbow"), ("elbow", "wrist"), ("wrist", "palm"), ("palm", "fing"), ("wrist", "thumb"),
         ("pelvis", "hip"), ("hip", "knee"), ("knee", "ankle")]
SIDED = {"sh", "elbow", "wrist", "palm", "fing", "thumb", "hip", "knee", "ankle"}
# bones: name -> (head, tail, parent)
BONES = {"hips": ("pelvis", "waist", None), "chest": ("waist", "upchest", "hips"), "neck": ("upchest", "neck1", "chest"),
         "head": ("neck1", (0, 0.012, 1.82), "neck"),
         "clav": ("upchest", "sh", "chest"), "upperarm": ("sh", "elbow", "clav"), "forearm": ("elbow", "wrist", "upperarm"),
         "hand": ("wrist", "fing", "forearm"), "pelv": ("pelvis", "hip", "hips"), "thigh": ("hip", "knee", "pelv"),
         "shin": ("knee", "ankle", "thigh"), "foot": ("ankle", (0.10, -0.14, 0.03), "shin")}


def side_name(n, s):
    return f"{n}.{s}" if n in SIDED or n in ("clav", "upperarm", "forearm", "hand", "pelv", "thigh", "shin", "foot") else n


def P(n, s="L"):
    p = SKEL[n][0]
    return Vector((p[0] * (1 if s == "L" else -1), p[1], p[2]))


def flat_vcol_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); at = nt.nodes.new("ShaderNodeVertexColor"); at.layer_name = "Col"
    K.flat_shader(nt, at.outputs[0], out)
    return m


class Person:
    def __init__(self, name, spec):
        self.name, self.spec = name, spec
        sx, sz = spec.get("scale", (1, 1))
        self.arm = self._armature(sx, sz)
        self.body = self._body(sx, sz)
        self.head = self._head(sx, sz)
        self.shoes = [self._shoe(s, sx, sz) for s in "LR"]
        self.root = self.arm
        self.parts = [self.body, self.head] + self.shoes + self.extra

    # ---------------------------------------------------------------- build
    def _pt(self, n, s, sx, sz):
        p = P(n, s); return Vector((p.x * sx, p.y * sx, p.z * sz))

    def _armature(self, sx, sz):
        a = bpy.data.armatures.new(self.name + "_rig"); arm = K.link(bpy.data.objects.new(self.name, a))
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.mode_set(mode="EDIT")
        for s in "LR":
            for b, (h, t, par) in BONES.items():
                bn = side_name(b, s)
                if bn in a.edit_bones:
                    continue
                e = a.edit_bones.new(bn)
                e.head = self._pt(h, s, sx, sz) if isinstance(h, str) else Vector(h)
                tt = self._pt(t, s, sx, sz) if isinstance(t, str) else Vector((t[0] * (1 if s == "L" else -1) * sx, t[1] * sx, t[2] * sz))
                e.tail = tt
                if par:
                    e.parent = a.edit_bones[side_name(par, s)]
        bpy.ops.object.mode_set(mode="OBJECT")
        for pb in arm.pose.bones:
            pb.rotation_mode = "QUATERNION"
        arm.hide_render = True
        return arm

    def _body(self, sx, sz):
        names, vs = [], []
        for n in SKEL:
            for s in ("LR" if n in SIDED else "C"):
                names.append((n, s)); vs.append(self._pt(n, "L" if s == "C" else s, sx, sz))
        idx = {k: i for i, k in enumerate(names)}
        key = lambda n, s: (n, s if n in SIDED else "C")
        es = sorted({(idx[key(a, s)], idx[key(b, s)]) for a, b in EDGES for s in "LR"})
        me = bpy.data.meshes.new(self.name + "_skel"); me.from_pydata([tuple(v) for v in vs], es, []); me.update()
        o = K.link(bpy.data.objects.new(self.name + "_skel", me))
        sk = o.modifiers.new("skin", "SKIN"); sk.branch_smoothing = 0.6
        for i, (n, s) in enumerate(names):
            r = self.spec.get("radii", {}).get(n, SKEL[n][1])
            me.skin_vertices[0].data[i].radius = (r[0] * sx, r[1] * sx)
        me.skin_vertices[0].data[idx[("pelvis", "C")]].use_root = True
        o.modifiers.new("sub", "SUBSURF").levels = 2
        dg = bpy.context.evaluated_depsgraph_get(); bm = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        bpy.data.objects.remove(o); bm.name = self.name + "_body"
        body = K.link(bpy.data.objects.new(self.name + "_body", bm))
        for p_ in bm.polygons:
            p_.use_smooth = True                                     # Gouraud, rounder like Zaw's avatar
        # weights: distance to each bone segment, soft-min
        segs = [(pb.name, Vector(pb.head_local), Vector(pb.tail_local)) for pb in self.arm.data.bones]
        V = np.array([v.co[:] for v in bm.vertices]); D = []
        for _, a, b in segs:
            a, b = np.array(a[:]), np.array(b[:]); ab = b - a
            t = np.clip(((V - a) @ ab) / max(ab @ ab, 1e-9), 0, 1)
            D.append(np.linalg.norm(V - (a + t[:, None] * ab), axis=1))
        D = np.array(D); W = np.exp(-(D - D.min(0)) / 0.018); W[D - D.min(0) > 0.06] = 0; W /= W.sum(0)
        groups = {n: body.vertex_groups.new(name=n) for n, _, _ in segs}
        for j, (n, _, _) in enumerate(segs):
            for i in np.flatnonzero(W[j] > 0.01):
                groups[n].add([int(i)], float(W[j, i]), "REPLACE")
        body.modifiers.new("arm", "ARMATURE").object = self.arm; body.parent = self.arm
        self._paint(body, D, segs)
        body.data.materials.append(flat_vcol_mat(self.name + "_cloth"))
        return body

    def _classify(self, B, Z, x, y):
        sp = self.spec; sx = sp.get("scale", (1, 1))[0]
        skin = np.array(sp["skin"], float); top = np.array(sp["top"], float); bottom = np.array(sp["bottom"], float)
        col = np.tile(top, (len(B), 1))
        legs = np.isin(B, ["thigh", "shin", "foot"]) | (np.isin(B, ["pelv", "hips"]) & (Z < sp["waist_z"]))
        col[legs] = bottom
        col[(B == "hand") | ((B == "neck") & (Z > 1.475))] = skin
        col[np.isin(B, ["forearm", "upperarm"]) & (Z < sp["sleeve_z"])] = skin
        col[(B == "chest") & (Z > 1.47) & (np.abs(x) < 0.07 * sx) & (y < 0.02)] = skin          # crew / polo neckline
        if sp.get("collar"):
            col[(B == "chest") & (Z > 1.42) & (Z <= 1.47)] = top * 0.86
            col[(B == "chest") & (y < -0.05) & (np.abs(x) < 0.02) & (Z > 1.33) & (Z < 1.47)] = top * 0.8   # placket
        if sp.get("cuff"):
            col[(B == "forearm") & (Z < 0.96)] = top * 0.78
        col[(B == "upperarm") & (np.abs(Z - sp["sleeve_z"] - 0.015) < 0.015)] = top * 0.85          # sleeve hem
        if sp.get("coat_z"):                                                                   # lab coat to the knees
            col[(B == "thigh") & (Z > sp["coat_z"])] = top * 0.96
            col[np.isin(B, ["pelv", "hips"])] = top * 0.96
        col[(B == "shin") & (Z < 0.17)] = bottom * 0.8
        return col, legs

    def _paint(self, body, D, segs):
        """clothing: crisp per-polygon colours (PS1 flat patches) x per-vertex fold shading (Gouraud)."""
        sp = self.spec; me = body.data; V = np.array([v.co[:] for v in me.vertices]); N = np.array([v.normal[:] for v in me.vertices])
        base = np.array([segs[k][0].split(".")[0] for k in D.argmin(0)]); sz = sp.get("scale", (1, 1))[1]; sx = sp.get("scale", (1, 1))[0]
        x, y, z = V.T; Z = z / sz
        # per-face classification from the face centre, the bone most of its corners belong to
        fc, fb = [], []
        for p in me.polygons:
            vi = list(p.vertices); fc.append(V[vi].mean(0))
            u, c = np.unique(base[vi], return_counts=True); fb.append(u[np.argmax(c)])
        fc = np.array(fc); fb = np.array(fb)
        fcol, _ = self._classify(fb, fc[:, 2] / sz, fc[:, 0], fc[:, 1])
        _, legs = self._classify(base, Z, x, y)
        f = np.ones(len(V)); B = base
        f[(B == "pelv") & (np.abs(x) < 0.07 * sx) & (Z < 0.96)] *= 0.8                     # crotch
        f[(B == "upperarm") & (np.abs(x) < 0.21 * sx)] *= 0.88                             # armpit / inner arm
        f[(B == "forearm") & (Z > 1.08) & (y < 0)] *= 0.86                                 # elbow crease
        f[(B == "thigh") & (Z < 0.6) & (y > 0)] *= 0.86; f[(B == "shin") & (Z > 0.46) & (y > 0)] *= 0.86
        torso = np.isin(B, ["chest", "hips"]) & ~legs; ang = np.arctan2(y, x)
        f[torso] *= 0.97 + 0.035 * np.sin(ang[torso] * 5 + Z[torso] * 18)                 # drape
        f[legs] *= 0.95 + 0.05 * np.sin(Z[legs] * 40 + ang[legs] * 2)                      # whiskers
        f[(B == "chest") & (Z < 1.3) & (y < 0)] *= 0.97                                    # under the pecs
        f *= 0.9 + 0.1 * np.clip(N[:, 2] * 0.5 + 0.5, 0, 1)                                # baked top light
        f *= 1 + np.random.default_rng(len(self.name)).uniform(-0.03, 0.03, len(V))
        cols = []
        for pi_, p in enumerate(me.polygons):
            for vi in p.vertices:
                cols.append(fcol[pi_] * f[vi])
        col = np.clip(np.array(cols), 0, 255) / 255
        lin = np.where(col <= 0.04045, col / 12.92, ((col + 0.055) / 1.055) ** 2.4)
        ca = me.color_attributes.new("Col", "FLOAT_COLOR", "CORNER")
        ca.data.foreach_set("color", np.concatenate([lin, np.ones((len(col), 1))], 1).ravel())

    def _bone_parent(self, o, bone):
        bpy.context.view_layer.update()
        b = self.arm.data.bones[bone]
        M = self.arm.matrix_world @ b.matrix_local @ Matrix.Translation((0, b.length, 0))
        o.parent = self.arm; o.parent_type = "BONE"; o.parent_bone = bone
        o.matrix_parent_inverse = M.inverted()

    def _head(self, sx, sz):
        sp = self.spec
        c = Vector((0, 0.008 * sx, 1.70 * sz)); rx, ry, rz = 0.094 * sp.get("head_w", 1), 0.112, 0.133
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=18, v_segments=12, radius=1.0)
        for f_ in bm.faces:
            f_.smooth = True
        for v in bm.verts:
            x, y, z = v.co
            if z < 0:                                           # jaw taper
                x *= 1 - 0.28 * (-z) ** 1.4; y *= 1 - 0.12 * (-z)
            if y < -0.5 and z < 0.35:
                y = -0.5 - (-y - 0.5) * 0.55                    # flatter face plane
            if y > 0.3 and z > -0.2:
                y *= 1.06                                       # fuller skull at the back
            v.co = Vector((x * rx, y * ry, z * rz))
        bm.verts.ensure_lookup_table()
        nose = min(bm.verts, key=lambda v: (v.co - Vector((0, -ry, -0.18 * rz))).length); nose.co.y -= 0.022; nose.co.z -= 0.004
        brow = [v for v in bm.verts if v.co.y < -0.6 * ry and 0.1 * rz < v.co.z < 0.35 * rz]
        for v in brow:
            v.co.y -= 0.006
        me = bpy.data.meshes.new(self.name + "_head"); bm.to_mesh(me); bm.free()
        o = K.link(bpy.data.objects.new(self.name + "_head", me)); o.location = c
        # atlas: photo crop (left), hair + skin (right)
        ph = bpy.data.images.load(os.path.join(H, "tex", "flow", f"face_{self.name}.jpg"), check_existing=True)
        eyes = json.load(open(os.path.join(H, "tex", "flow", "eyes.json")))[f"face_{self.name}"]
        (lx, ly), (rx_, ry_) = eyes["l"], eyes["r"]; ex, ey = (lx + rx_) / 2, (ly + ry_) / 2
        s = 0.068 * sp.get("head_w", 1) / (rx_ - lx)                   # m per photo px
        pw, phh = ph.size
        a = np.array(ph.pixels[:], np.float32).reshape(phh, pw, 4)[::-1]     # top row first
        X0, X1, Y0, Y1 = int(ex - 0.1 / s), int(ex + 0.1 / s), int(ey - 0.14 / s), int(ey + 0.13 / s)
        crop = a[max(Y0, 0):Y1, max(X0, 0):X1, :3]
        yi = np.linspace(0, crop.shape[0] - 1, 255 * 2).astype(int); xi = np.linspace(0, crop.shape[1] - 1, 170 * 2).astype(int)
        big = crop[yi][:, xi]; cim = big.reshape(255, 2, 170, 2, 3).mean((1, 3))               # 2x2 box down-sample
        cim = np.where(cim <= 0.0031308, cim * 12.92, 1.055 * cim ** (1 / 2.4) - 0.055)          # image pixels are linear
        # skin match + blend (user: the face looked white / pasted on): gain the photo so its cheeks have the body's
        # skin colour, lift the features' contrast a little, then feather the photo into flat skin outside a face oval
        hw_ = sp.get("head_w", 1); skin_ = np.array(sp["skin"], float) / 255
        jj = X0 + (np.arange(170) + 0.5) * (X1 - X0) / 170; ii = Y0 + (np.arange(255) + 0.5) * (Y1 - Y0) / 255
        mx_ = (jj[None, :] - ex) * s; mz_ = -(ii[:, None] - ey) * s                 # metres from the eye line centre
        cheek = (np.abs(np.abs(mx_) - 0.03) < 0.012) & (np.abs(mz_ + 0.035) < 0.012)
        cheek = np.broadcast_to(cheek, cim.shape[:2])
        med = np.median(cim[cheek], 0)
        cim = np.clip(cim * (skin_ / np.maximum(med, 1e-3)), 0, 1)
        gk = np.exp(-0.5 * (np.arange(-7, 8) / 2.5) ** 2); gk /= gk.sum()            # separable gaussian (no scipy in Blender)
        pad = np.pad(cim, ((7, 7), (7, 7), (0, 0)), mode="edge")
        blur = np.apply_along_axis(lambda v: np.convolve(v, gk, "valid"), 0, pad)
        blur = np.apply_along_axis(lambda v: np.convolve(v, gk, "valid"), 1, blur)
        cim = np.clip(cim + 0.7 * (cim - blur), 0, 1)                                # unsharp: eyes/brows/mouth read
        r_ = np.sqrt((mx_ / (0.058 * hw_)) ** 2 + ((mz_ + 0.022) / np.where(mz_ + 0.022 > 0, 0.085, 0.1)) ** 2)
        wgt = np.clip((1.12 - r_) / 0.3, 0, 1)[..., None]
        cim = cim * wgt + skin_ * (1 - wgt)
        atlas = np.zeros((256, 384, 3), np.uint8); atlas[:255, :170] = (np.clip(cim, 0, 1) * 255).astype(np.uint8)
        hair = np.array(sp["hair"], float); skin = np.array(sp["skin"], float)
        rng = np.random.default_rng(3)
        atlas[:128, 192:] = np.clip(hair * (1 + rng.uniform(-0.18, 0.18, (128, 192, 1))), 0, 255)
        atlas[128:, 192:] = np.clip(skin * (1 + rng.uniform(-0.04, 0.04, (128, 192, 1))), 0, 255)
        atlas[255:, :192] = skin; atlas[:, 170:192] = skin
        img = K.image_from_array(self.name + "_headtex", atlas)
        me.materials.append(K.mat_image(self.name + "_headm", img))
        uvl = me.uv_layers.new()
        eye_z = 0.012                                                  # eyes just above the head centre
        for p in me.polygons:
            n = p.normal
            for li, vi in zip(p.loop_indices, p.vertices):
                co = me.vertices[vi].co
                if n.y < -0.05 and abs(co.x) < 0.68 * rx and co.z > -0.98 * rz:          # face oval: photo
                    px = ex + co.x / s; py = ey - (co.z - eye_z) / s
                    py = min(py, ey + 0.105 * sp.get("head_w", 1) / s)               # under the chin: chin row, not the shirt
                    u = (px - X0) / (X1 - X0) * 170 / 384; v = 1 - (py - Y0) / (Y1 - Y0) * 255 / 256
                    uvl.data[li].uv = (u, v)
                elif n.y > 0.35 and co.z > -0.3 * rz:
                    uvl.data[li].uv = (0.75 + 0.2 * (co.x / rx), 0.75 + 0.2 * (co.z / rz))     # hair (back, under the shell)
                else:
                    uvl.data[li].uv = (0.75, 0.2)                                              # skin
        self._bone_parent(o, "head")
        self.extra = [self._hair(c, rx, ry, rz)]
        for sgn in ():                                                  # ears come from the wrapped photo
            e = K.box(f"{self.name}_ear{sgn}", (0.018, 0.035, 0.055), (sgn * (rx + 0.004), c.y + 0.012, c.z - 0.005), K.mat_color(self.name + "_earm", "#%02X%02X%02X" % tuple(int(x * 0.92) for x in skin)))
            self._bone_parent(e, "head"); self.extra.append(e)
        return o

    def _hair(self, c, rx, ry, rz):
        sp = self.spec; k = sp.get("hair_vol", 1.07)
        bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=14, v_segments=10, radius=1.0)
        cut = []
        for f_ in bm.faces:
            m_ = f_.calc_center_median()
            front_low = m_.y < -0.35 and m_.z < sp.get("hairline", 0.5)          # forehead / face stays open
            side_low = m_.z < (-0.1 if m_.y < 0.3 else -0.55)                     # above the ears at the sides, nape at the back
            if front_low or side_low:
                cut.append(f_)
        bmesh.ops.delete(bm, geom=cut, context="FACES")
        for f_ in bm.faces:
            f_.smooth = True
        for v in bm.verts:
            x, y, z = v.co
            v.co = Vector((x * rx * k, y * ry * k * 1.02, z * rz * k + 0.012))
        me = bpy.data.meshes.new(self.name + "_hair"); bm.to_mesh(me); bm.free()
        o = K.link(bpy.data.objects.new(self.name + "_hair", me)); o.location = c
        hc = np.array(sp["hair"], float); rng = np.random.default_rng(5)
        a = np.zeros((32, 32, 3)); streak = rng.uniform(0.75, 1.25, (1, 32, 1)) * rng.uniform(0.9, 1.1, (32, 32, 1))
        a[:] = hc * streak
        me.materials.append(K.mat_image(self.name + "_hairm", K.image_from_array(self.name + "_hairt", np.clip(a, 0, 255).astype(np.uint8))))
        uvl = me.uv_layers.new()
        for p in me.polygons:
            for li, vi in zip(p.loop_indices, p.vertices):
                co = me.vertices[vi].co; uvl.data[li].uv = (math.atan2(co.y, co.x) / 6.283 + 0.5, co.z / (2 * rz) + 0.5)
        self._bone_parent(o, "head")
        return o

    def _shoe(self, s, sx, sz):
        sp = self.spec; L, Wd, Hh = 0.26, 0.094, sp.get("shoe_h", 0.085)
        x0 = 0.10 * sx * (1 if s == "L" else -1); y0, y1 = 0.07, -0.18
        prof = [(y1, 0.0), (y1 + 0.01, 0.045), (y1 + 0.06, Hh * 0.75), (y0 - 0.05, Hh), (y0, Hh * 0.95), (y0 + 0.01, 0.0)]
        vs = []
        for (yy, zz) in prof:
            w = Wd / 2 * (0.82 if yy < y1 + 0.05 else 1.0)
            vs += [(x0 - w, yy, zz), (x0 + w, yy, zz)]
        n = len(prof)
        fs = [(2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1) for i in range(n - 1)] + [(2 * (n - 1), 0, 1, 2 * (n - 1) + 1)]
        fs.append(tuple(2 * i for i in range(n))[::-1]); fs.append(tuple(2 * i + 1 for i in range(n)))
        o = K.mesh_from(f"{self.name}_shoe{s}", vs, fs)
        me = o.data; up, sole = np.array(sp["shoe"], float) / 255, np.array(sp["sole"], float) / 255
        ca = me.color_attributes.new("Col", "FLOAT_COLOR", "POINT")
        cols = []
        for v in me.vertices:
            c = sole if v.co.z < 0.02 else up * (0.9 if v.co.y < y1 + 0.08 else 1.0)
            c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4); cols += [*c, 1]
        ca.data.foreach_set("color", cols)
        me.materials.append(flat_vcol_mat(f"{self.name}_shoem"))
        self._bone_parent(o, f"foot.{s}")
        return o

    # ---------------------------------------------------------------- pose
    def show(self, on=True, loc=None, yaw=0.0):
        for o in self.parts:
            o.hide_render = not on; o.hide_viewport = not on
        if loc is not None:
            self.arm.location = loc; self.arm.rotation_euler = (0, 0, yaw)

    def rest(self):
        for pb in self.arm.pose.bones:
            pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)

    def rot(self, bone, rots):
        """rotations [(axis in the person's space, angle)], composed, relative to rest."""
        q = Quaternion()
        for ax, ang in rots:
            la = (self.arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(ax)).normalized()
            q = Quaternion(la, ang) @ q
        self.arm.pose.bones[bone].rotation_quaternion = q

    def walk(self, t, amp=1.0, hz=0.9):
        w = 2 * math.pi * hz * t; s_ = math.sin(w)
        for side, sg in (("L", 1), ("R", -1)):
            self.rot(f"thigh.{side}", [((1, 0, 0), -0.38 * amp * s_ * sg)])
            self.rot(f"shin.{side}", [((1, 0, 0), 0.45 * amp * max(0.0, s_ * sg))])
            self.rot(f"upperarm.{side}", [((1, 0, 0), 0.3 * amp * s_ * sg), ((0, 1, 0), -0.08 * sg)])
            self.rot(f"forearm.{side}", [((1, 0, 0), -0.25 * amp)])
        self.arm.pose.bones["hips"].location = (0, 0, 0)

    def arms_down(self):
        for side, sg in (("L", 1), ("R", -1)):
            self.rot(f"upperarm.{side}", [((0, 1, 0), -0.1 * sg)])

    def hand_pos(self, side):
        bpy.context.view_layer.update()
        pb = self.arm.pose.bones[f"hand.{side}"]
        return self.arm.matrix_world @ pb.tail

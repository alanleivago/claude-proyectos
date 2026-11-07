"""Low-poly PS1 humans built ENTIRELY from photos (VLVT guide method, fuentes/blender-lowpoly/vlvt-guide.md).
Input: one Flow sheet per person, the same person three times on flat magenta - front, right profile (facing right), back -
in an A-pose (arms straight, ~40 deg down, not touching the body).
1) venv:    python photohuman.py prep <name> <sheet.jpg> <height_m>   -> tex/people2/<name>.json + _body.png + _head.png
   reads the silhouettes row by row: width per height (front), depth per height (side), the crotch / armpit / neck rows,
   each arm's axis and thickness; makes the PS1 atlases (front | side | back, body 256 px tall, head 128 px, 48 colours).
2) Blender: PhotoPerson(name) -> lofted low-poly blocks (head+torso 8 sides, legs 6, arms 6 along their own axis), each
   face textured by projecting the view it faces (front / back / side; arms take the front view on their sides), Closest.
   Simple rig (hips, chest, neck, head, upperarm, forearm, hand, thigh, shin, foot); the A-pose arms are brought down in
   the rest pose, so poses written for arms-down people still work. Same API as people3d.Person."""
import json, math, os, sys
import numpy as np

H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "tex", "people2")


# ---------------------------------------------------------------------------------------------- venv: analyse the sheet
def _mask(a):
    r, g, b = (a[..., i].astype(int) for i in range(3))
    bg = (r > 150) & (b > 150) & (g < 130) & (np.abs(r - b) < 90)
    return ~bg


def _runs(row):
    xs = np.flatnonzero(row)
    if not len(xs):
        return []
    cuts = np.flatnonzero(np.diff(xs) > 2)
    st = np.r_[xs[0], xs[cuts + 1]]; en = np.r_[xs[cuts], xs[-1]]
    return [(int(a), int(b)) for a, b in zip(st, en) if b - a >= 2]


def prep(name, sheet, height):
    from PIL import Image
    from scipy import ndimage as nd
    os.makedirs(OUT, exist_ok=True)
    im = Image.open(sheet).convert("RGB"); A = np.asarray(im)
    M = nd.binary_opening(_mask(A), iterations=2)
    lab, n = nd.label(M); sizes = nd.sum(M, lab, range(1, n + 1))
    big = [i + 1 for i in np.argsort(sizes)[::-1][:3]]
    views = sorted(big, key=lambda i: np.flatnonzero((lab == i).any(0)).mean())
    V = {}
    for key, li in zip(("front", "side", "back"), views):
        m = nd.binary_fill_holes(lab == li)
        ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        V[key] = dict(m=m, y0=int(y0), y1=int(y1), x0=int(x0), x1=int(x1), s=height / (y1 - y0))
    F, S, B = V["front"], V["side"], V["back"]
    Hp = F["y1"] - F["y0"]
    zf = lambda y, v: (v["y1"] - y) * v["s"]                       # image row -> metres above the floor
    yrow = lambda z, v: int(round(v["y1"] - z / v["s"]))
    mid = (F["y0"] + F["y1"]) // 2
    cx = np.mean([(a + b) / 2 for a, b in _runs(F["m"][int(F["y0"] + 0.45 * Hp)]) if a < (F["x0"] + F["x1"]) / 2 < b] or [(F["x0"] + F["x1"]) / 2])

    def central(y):
        rs = _runs(F["m"][y]); c = [r for r in rs if abs((r[0] + r[1]) / 2 - cx) < 0.13 * Hp or r[0] <= cx <= r[1]]
        return rs, c
    # crotch (or coat hem): bottom-up, where the two legs merge into one run
    crotch = None; seen2 = False
    for y in range(F["y1"] - 3, mid - int(0.2 * Hp), -1):
        rs, c = central(y)
        if len(c) >= 2:
            seen2 = True
        elif seen2 and len(c) == 1:
            crotch = y; break
    # armpit: top-down, the first row with an arm run on each side of the torso
    armpit = None
    for y in range(F["y0"] + int(0.12 * Hp), mid):
        rs = _runs(F["m"][y])
        if len(rs) >= 3 and rs[0][1] < cx < rs[-1][0]:
            armpit = y; break
    # neck: the narrowest central run between the head and the shoulders
    ws = {y: (lambda c: c[0][1] - c[0][0] if c else 1e9)(central(y)[1]) for y in range(F["y0"] + int(0.115 * Hp), min(armpit, F["y0"] + int(0.19 * Hp)))}
    neck = min(ws, key=ws.get)
    chin = neck - int(0.015 * Hp)
    torso_w_arm = np.median([(lambda c: c[0][1] - c[0][0])(central(y)[1]) for y in range(armpit + 2, armpit + 8)])

    def side_run(z):
        y = min(max(yrow(z, S), S["y0"]), S["y1"]); rs = _runs(S["m"][y])
        if not rs:
            return None
        sc = (S["x0"] + S["x1"]) / 2
        return min(rs, key=lambda r: 0 if r[0] <= sc <= r[1] else min(abs(r[0] - sc), abs(r[1] - sc)))
    scx = np.median([(lambda r: (r[0] + r[1]) / 2)(side_run(z)) for z in np.linspace(0.5, 0.9, 9) * height if side_run(z)])
    rings = []                                                     # (z, cx, cy, half width, half depth)
    ztop, zc = zf(F["y0"], F), zf(crotch, F)
    for z in list(np.linspace(zc, zf(armpit, F), 6)[:-1]) + list(np.linspace(zf(armpit, F), zf(neck, F), 5)[:-1]) + \
            list(np.linspace(zf(neck, F), ztop - 0.012, 7)) + [ztop]:
        y = yrow(z, F); rs, c = central(y)
        if not c:
            continue
        a, b = min(r[0] for r in c), max(r[1] for r in c)
        if y < armpit and z < zf(neck, F) - 0.03:                   # shoulders: not the arms
            hw_cap = torso_w_arm * 0.55
            a, b = max(a, cx - hw_cap), min(b, cx + hw_cap)
        hw = (b - a) / 2 * F["s"]; xc = ((a + b) / 2 - cx) * F["s"]
        sr = side_run(z)
        hd, yc = (hw * 0.6, 0.0) if sr is None else ((sr[1] - sr[0]) / 2 * S["s"], -((sr[0] + sr[1]) / 2 - scx) * S["s"])
        hd = min(max(hd, 0.45 * hw), (1.35 if z > zf(neck, F) else 0.95) * hw)
        if z >= ztop - 1e-6:
            hw, hd = hw * 0.35, hd * 0.35
        rings.append([float(z), float(xc), float(yc), float(max(hw, 0.012)), float(max(hd, 0.012))])
    legs = {"L": [], "R": []}
    for z in [0.0, 0.035, 0.075] + list(np.linspace(0.12, zc + 0.03, 8)):   # shoe rings + leg; top ring tucked into the torso
        y = min(yrow(z, F), F["y1"] - 1); rs, c = central(y)
        c = sorted(c)
        if len(c) < 2:
            c = [(c[0][0], int(cx)), (int(cx), c[0][1])] if c else []
        if not c:
            continue
        sr = side_run(z)
        hd, yc = (0.06, 0.0) if sr is None else ((sr[1] - sr[0]) / 2 * S["s"], -((sr[0] + sr[1]) / 2 - scx) * S["s"])
        for side, r in (("R", c[0]), ("L", c[-1])):               # image left = the person's right
            hw = (r[1] - r[0]) / 2 * F["s"]
            if z < 0.12:
                hw = max(hw, 0.05)                                      # shoes: a real block, not a flat tab
            legs[side].append([float(z), float(((r[0] + r[1]) / 2 - cx) * F["s"]), float(yc), float(hw), float(min(hd, 2.4 * hw if z < 0.12 else 1.1 * hw))])
    arms = {}
    for side in "RL":
        rows = {}
        for y in range(armpit, F["y1"]):
            rs, c = central(y)
            lo, hi = min(r[0] for r in c), max(r[1] for r in c)          # torso (or both legs) span
            o = [r for r in rs if (r[1] < lo if side == "R" else r[0] > hi)]
            if not o:
                if rows:
                    break                                                # past the fingertips
                continue
            rows[y] = o[-1] if side == "R" else o[0]                     # the run nearest the torso
        ys = sorted(rows)
        pts = np.array([[(rows[y][0] + rows[y][1]) / 2, y] for y in ys], float)
        p0 = pts[: max(3, len(pts) // 4)].mean(0); p1 = pts[-max(3, len(pts) // 6):].mean(0)
        d = (p1 - p0) / np.linalg.norm(p1 - p0)
        w0 = (rows[ys[2]][1] - rows[ys[2]][0]) * abs(d[1])            # thickness across the arm near the armpit
        sh = p0 - d * (np.dot(p0 - np.array([p0[0], armpit]), d) + 0.9 * w0)    # up the axis into the shoulder
        end = pts[-1] + d * 0.5 * (rows[ys[-1]][1] - rows[ys[-1]][0]) * abs(d[1])
        L = np.linalg.norm(end - sh); nrm = np.array([-d[1], d[0]])
        secs = []
        for t in np.linspace(0, 1, 8):
            p = sh + (end - sh) * t
            wpx = 0
            for sgn in (-1, 1):                                      # walk across the arm both ways
                k = 0
                while k < 0.06 * Hp:
                    q = p + nrm * sgn * k
                    if not (0 <= int(q[1]) < F["m"].shape[0] and 0 <= int(q[0]) < F["m"].shape[1]) or not F["m"][int(q[1]), int(q[0])]:
                        break
                    k += 1
                wpx += k
            if p[1] < armpit + 0.5 * w0:                                 # inside the shoulder the walk runs into the torso
                wpx = 0.95 * w0
            hw = wpx / 2 * F["s"]
            secs.append([float((p[0] - cx) * F["s"]), float(zf(p[1], F)), float(hw), float(hw * (0.45 if t > 0.82 else 0.85))])
        arms[side] = dict(axis=[float(d[0]), float(-d[1])], secs=secs)
    # ---- atlases: views side by side, bled edges (no magenta fringe), PS1 size + palette
    def strip(top, bot, tex_h, half=None):
        tiles, rects = [], {}
        for key in ("front", "side", "back"):
            v = V[key]; ya, yb = int(v["y1"] - top / v["s"]), int(v["y1"] - bot / v["s"])
            pad = int(0.02 * Hp); xa, xb = max(0, v["x0"] - pad), min(A.shape[1], v["x1"] + pad)
            if half:                                                     # head strip: just around the head
                hc = np.flatnonzero(v["m"][ya:yb].any(0)); hc = (hc.min() + hc.max()) / 2 if key == "side" else \
                    np.mean(np.flatnonzero(v["m"][int(v["y0"] + 0.06 * Hp)]))
                xa, xb = int(max(0, hc - half / v["s"])), int(min(A.shape[1], hc + half / v["s"]))
            crop = A[ya:yb, xa:xb].astype(int); mm = nd.binary_erosion(v["m"][ya:yb, xa:xb], iterations=3)   # drop the keyed rim
            ex = np.clip(np.minimum(crop[..., 0], crop[..., 2]) - crop[..., 1], 0, None)               # magenta despill
            crop[..., 0] -= ex; crop[..., 2] -= ex; crop = np.clip(crop, 0, 255).astype(np.uint8)
            _, (iy, ix) = nd.distance_transform_edt(~mm, return_indices=True); crop = crop[iy, ix]
            tw = max(8, int(round(tex_h * crop.shape[1] / crop.shape[0])))
            tiles.append(Image.fromarray(crop).resize((tw, tex_h), Image.BOX))
            rects[key] = dict(xa=xa, xb=xb, ya=ya, yb=yb)
        W = sum(t.size[0] for t in tiles); W4 = (W + 3) // 4 * 4
        at = Image.new("RGB", (W4, tex_h)); x = 0
        for key, t in zip(("front", "side", "back"), tiles):
            at.paste(t, (x, 0)); rects[key].update(u0=x / W4, u1=(x + t.size[0]) / W4); x += t.size[0]
        at = at.quantize(48, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")
        return at, rects
    body, rb = strip(height + 0.01, -0.005, 256)
    head, rh = strip(height + 0.01, zf(neck, F) - 0.04, 128, half=0.17)
    body.save(os.path.join(OUT, f"{name}_body.png")); head.save(os.path.join(OUT, f"{name}_head.png"))
    J = dict(name=name, height=height, z_crotch=zc, z_armpit=zf(armpit, F), z_neck=zf(neck, F), z_chin=zf(chin, F),
             rings=rings, legs=legs, arms=arms,
             views={k: dict(s=v["s"], y1=v["y1"], c=float(cx if k == "front" else scx if k == "side" else 0)) for k, v in V.items()},
             body=rb, head=rh, head_z0=zf(neck, F) - 0.04)
    # the back view's axis: centre of its torso run at mid height
    bv = V["back"]; yb_ = int(bv["y0"] + 0.45 * (bv["y1"] - bv["y0"])); rsb = _runs(bv["m"][yb_])
    J["views"]["back"]["c"] = float(np.mean([(a + b) / 2 for a, b in rsb if a < (bv["x0"] + bv["x1"]) / 2 < b] or [(bv["x0"] + bv["x1"]) / 2]))
    json.dump(J, open(os.path.join(OUT, f"{name}.json"), "w"), indent=1)
    print(name, f"crotch {zc:.2f} armpit {J['z_armpit']:.2f} neck {J['z_neck']:.2f} m; rings {len(rings)}, legs {len(legs['L'])}, "
          f"arm axis L {arms['L']['axis']}, atlas {body.size} / {head.size}")


# ---------------------------------------------------------------------------------------------- Blender: build + rig
class PhotoPerson:
    def __init__(self, name, scale=1.0):
        import bpy
        import lpskit as K
        self.name = name; self.J = J = json.load(open(os.path.join(OUT, f"{name}.json")))
        self.K = K
        verts, faces, fpart, vbone = [], [], [], []

        def ring(c, a, b, ra, rb, n, ph):
            idx = []
            for k in range(n):
                th = 2 * math.pi * k / n + ph
                ca, sa = math.cos(th), math.sin(th)
                ca, sa = math.copysign(abs(ca) ** 0.8, ca), math.copysign(abs(sa) ** 0.8, sa)      # a little boxy (PS1)
                verts.append(tuple(np.array(c) + a * ca * ra + b * sa * rb)); idx.append(len(verts) - 1)
            return idx

        def loft(rs, part, bones, cap0=True, cap1=True):
            n = len(rs[0])
            for k in range(len(rs) - 1):
                for i in range(n):
                    faces.append((rs[k][i], rs[k][(i + 1) % n], rs[k + 1][(i + 1) % n], rs[k + 1][i])); fpart.append(part)
            if cap0:
                faces.append(tuple(rs[0][::-1])); fpart.append(part)
            if cap1:
                faces.append(tuple(rs[-1])); fpart.append(part)
            for r, bw in zip(rs, bones):
                for v in r:
                    vbone.append(bw)
        X, Y = np.array([1.0, 0, 0]), np.array([0, 1.0, 0])
        zn, zc, za = J["z_neck"], J["z_crotch"], J["z_armpit"]

        def torso_bone(z):
            if z > zn + 0.02:
                return {"head": 1.0}
            if z > zn - 0.04:
                return {"neck": 1.0}
            if z > za - 0.12:
                return {"chest": 1.0}
            if z > zc + 0.12:
                k = (z - zc - 0.12) / (za - zc - 0.24 + 1e-6); k = min(max(k, 0), 1)
                return {"chest": k, "hips": 1 - k}
            return {"hips": 1.0}
        rs = [ring((r[1], r[2], r[0]), X, Y, r[3], r[4], 8, math.pi / 8) for r in J["rings"]]
        loft(rs, "torso", [torso_bone(r[0]) for r in J["rings"]])
        zk = zc * 0.52
        for s in "LR":
            L = J["legs"][s]
            rs = [ring((r[1], r[2], r[0]), X, Y, r[3], r[4], 6, math.pi / 6) for r in L]
            bw = []
            for r in L:
                z = r[0]
                bw.append({f"foot.{s}": 1.0} if z < 0.06 else {f"shin.{s}": 1.0} if z < zk - 0.04 else
                          {f"shin.{s}": 0.5, f"thigh.{s}": 0.5} if z < zk + 0.04 else {f"thigh.{s}": 1.0})
            loft(rs, "leg", bw)
            A_ = J["arms"][s]; d = np.array([A_["axis"][0], 0, A_["axis"][1]]); nrm = np.cross(d, Y); nrm /= np.linalg.norm(nrm)
            secs = A_["secs"]; rs = []; bw = []
            for k, (x, z, hw, hd) in enumerate(secs):
                t = k / (len(secs) - 1)
                rs.append(ring((x, 0.0, z), nrm, Y, hw, hd, 6, math.pi / 6))
                bw.append({f"upperarm.{s}": 1.0} if t < 0.4 else {f"upperarm.{s}": 0.5, f"forearm.{s}": 0.5} if t < 0.5 else
                          {f"forearm.{s}": 1.0} if t < 0.78 else {f"hand.{s}": 1.0})
            loft(rs, "arm", bw)
        me = bpy.data.meshes.new(name + "_body"); me.from_pydata(verts, [], faces); me.update()
        import bmesh
        bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
        uvl = me.uv_layers.new(name="UV")
        imb = bpy.data.images.load(os.path.join(OUT, f"{name}_body.png"), check_existing=True); imb.pack()
        imh = bpy.data.images.load(os.path.join(OUT, f"{name}_head.png"), check_existing=True); imh.pack()
        me.materials.append(K.mat_image(name + "_bodym", imb)); me.materials.append(K.mat_image(name + "_headm", imh))
        Vw = J["views"]
        for p in me.polygons:
            n = p.normal; part = fpart[p.index]
            head = part == "torso" and p.center.z > J["head_z0"] + 0.02
            R = J["head" if head else "body"]; p.material_index = 1 if head else 0
            side_arm = (not head) and part == "torso" or (part == "leg" and p.center.z > J["z_crotch"] - 0.35)
            if n.y < -0.35 or (part == "arm" and n.y <= 0.35) or (side_arm and abs(n.y) <= 0.35):
                key = "front"                  # (the profile shows the arm painted over the torso/thigh: extra arms)
            elif n.y > 0.35:
                key = "back"
            else:
                key = "side"
            for li, vi in zip(p.loop_indices, p.vertices):
                co = me.vertices[vi].co; v = Vw[key]; r = R[key]
                if key == "front" and abs(n.y) <= 0.35:                  # side face: the front view's edge, just inside
                    px = v["c"] + co.x * 0.86 / v["s"]
                elif key == "front":
                    px = v["c"] + co.x / v["s"]
                elif key == "back":
                    px = v["c"] - co.x / v["s"]
                else:
                    px = v["c"] - co.y / v["s"]
                py = v["y1"] - co.z / v["s"]
                u = r["u0"] + (px - r["xa"]) / (r["xb"] - r["xa"]) * (r["u1"] - r["u0"])
                vv = 1 - (py - r["ya"]) / (r["yb"] - r["ya"])
                uvl.data[li].uv = (min(max(u, r["u0"] + 1e-3), r["u1"] - 1e-3), min(max(vv, 1e-3), 1 - 1e-3))
        if scale != 1.0:
            me.transform(__import__("mathutils").Matrix.Scale(scale, 4))
        self.body = K.link(bpy.data.objects.new(name + "_body", me))
        self.arm = self._rig(scale)
        for i, w in enumerate(vbone):
            for g, val in w.items():
                vg = self.body.vertex_groups.get(g) or self.body.vertex_groups.new(name=g)
                vg.add([i], val, "REPLACE")
        self.body.modifiers.new("arm", "ARMATURE").object = self.arm; self.body.parent = self.arm
        self.root = self.arm; self.parts = [self.body]
        self.rest()

    def _rig(self, sc):
        import bpy
        from mathutils import Vector
        J = self.J; K = self.K
        a = bpy.data.armatures.new(self.name + "_rig"); arm = K.link(bpy.data.objects.new(self.name, a))
        bpy.context.view_layer.objects.active = arm; bpy.ops.object.mode_set(mode="EDIT"); eb = a.edit_bones
        zc, za, zn, top = J["z_crotch"], J["z_armpit"], J["z_neck"], J["rings"][-1][0]
        R0 = {r[0]: r for r in J["rings"]}
        yc = lambda z: min(J["rings"], key=lambda r: abs(r[0] - z))[2]
        V = lambda x, y, z: Vector((x, y, z)) * sc

        def bone(nm, h, t, par=None):
            b = eb.new(nm); b.head = h; b.tail = t
            if par:
                b.parent = eb[par]
            return b
        bone("hips", V(0, yc(zc), zc), V(0, yc(zc + 0.15), zc + 0.15))
        bone("chest", V(0, yc(zc + 0.15), zc + 0.15), V(0, yc(zn - 0.04), zn - 0.04), "hips")
        bone("neck", V(0, yc(zn - 0.04), zn - 0.04), V(0, yc(zn + 0.03), zn + 0.03), "chest")
        bone("head", V(0, yc(zn + 0.03), zn + 0.03), V(0, yc(top - 0.05), top), "neck")
        zk = zc * 0.52
        self.base = {}
        for s in "LR":
            Lg = J["legs"][s]; xl = np.mean([r[1] for r in Lg]); yl = np.mean([r[2] for r in Lg])
            bone(f"thigh.{s}", V(xl, yl, zc), V(xl, yl, zk), "hips")
            bone(f"shin.{s}", V(xl, yl, zk), V(xl, yl, 0.08), f"thigh.{s}")
            bone(f"foot.{s}", V(xl, yl, 0.08), V(xl, yl - 0.14, 0.03), f"shin.{s}")
            secs = J["arms"][s]["secs"]; p = lambda t: np.array(secs[0][:2]) + (np.array(secs[-1][:2]) - np.array(secs[0][:2])) * t
            sh, el, wr, en = p(0.0), p(0.45), p(0.78), p(1.0)
            bone(f"upperarm.{s}", V(sh[0], 0, sh[1]), V(el[0], 0, el[1]), "chest")
            bone(f"forearm.{s}", V(el[0], 0, el[1]), V(wr[0], 0, wr[1]), f"upperarm.{s}")
            bone(f"hand.{s}", V(wr[0], 0, wr[1]), V(en[0], 0, en[1]), f"forearm.{s}")
            ax = J["arms"][s]["axis"]; alpha = math.atan2(abs(ax[0]), -ax[1])        # A-pose angle from straight down
            self.base[s] = (alpha - 0.09) * (1 if s == "L" else -1)                      # rest: arms down, a hand off the hip
        bpy.ops.object.mode_set(mode="OBJECT")
        for pb in arm.pose.bones:
            pb.rotation_mode = "QUATERNION"
        arm.hide_render = True
        return arm

    def _q(self, bone, rots):
        from mathutils import Quaternion, Vector
        q = Quaternion()
        for ax, ang in rots:
            la = (self.arm.data.bones[bone].matrix_local.to_3x3().inverted() @ Vector(ax)).normalized()
            q = Quaternion(la, ang) @ q
        return q

    def _base(self, bone):
        if bone.startswith("upperarm."):
            return self._q(bone, [((0, 1, 0), self.base[bone[-1]])])
        from mathutils import Quaternion
        return Quaternion()

    # ---- people3d.Person API
    def show(self, on=True, loc=None, yaw=0.0):
        for o in self.parts:
            o.hide_render = not on; o.hide_viewport = not on
        if loc is not None:
            self.arm.location = loc; self.arm.rotation_euler = (0, 0, yaw)

    def rest(self):
        for pb in self.arm.pose.bones:
            pb.rotation_quaternion = self._base(pb.name); pb.location = (0, 0, 0)

    def rot(self, bone, rots):
        """rotations [(axis in the person's space, angle)], applied after the rest pose (arms down)."""
        self.arm.pose.bones[bone].rotation_quaternion = self._q(bone, rots) @ self._base(bone)

    def walk(self, t, amp=1.0, hz=0.9):
        w = 2 * math.pi * hz * t; s_ = math.sin(w)
        for side, sg in (("L", 1), ("R", -1)):
            self.rot(f"thigh.{side}", [((1, 0, 0), -0.38 * amp * s_ * sg)])
            self.rot(f"shin.{side}", [((1, 0, 0), 0.45 * amp * max(0.0, s_ * sg))])
            self.rot(f"upperarm.{side}", [((1, 0, 0), 0.3 * amp * s_ * sg)])
            self.rot(f"forearm.{side}", [((1, 0, 0), -0.25 * amp)])

    def arms_down(self):
        for side in "LR":
            self.rot(f"upperarm.{side}", [])

    def hand_pos(self, side):
        import bpy
        bpy.context.view_layer.update()
        return self.arm.matrix_world @ self.arm.pose.bones[f"hand.{side}"].tail


if __name__ == "__main__" and len(sys.argv) > 1 and sys.argv[1] == "prep":
    prep(sys.argv[2], sys.argv[3], float(sys.argv[4]))

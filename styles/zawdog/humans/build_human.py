"""Kit v3: any Flow face + outfit sheet -> a rigged low-poly PS1 human (MakeHuman / MPFB2 body, CC0 output).
    1) .venv/bin/python styles/zawdog/humans/prep_human.py <name>        (faces/*.png, face.json, sheet_bleed.png, sheet.json)
    2) Blender -b -P styles/zawdog/humans/build_human.py -- <name> [height=1.78 gender=1 muscle=0.55 weight=0.5 ratio=0.16]
       -> humans/<name>/<name>.blend : armature "<name>_rig" (MakeHuman "default" skeleton: root, spine01-05, neck01-03,
          head, clavicle/shoulder01/upperarm01-02/lowerarm01-02/wrist, finger1-5 x 1-3, upperleg01-02, lowerleg01-02,
          foot, toes ... .L/.R) + mesh "<name>_body" (2 materials: "<name>_sheet" body atlas, "<name>_face" portrait).
Inputs in humans/<name>/: src/sheet.jpg (the same person front | right profile | back, A-pose, flat magenta - the
photohuman2 sheet) and faces/neutral.jpg (+ smile, surprised, crying, laughing, scared: Flow edits of neutral).
Texturing = region-normalised projection (no hand UV work): every body part is projected from the sheet view it faces,
with its width/depth normalised per height to the photo's silhouette (torso, each leg, each arm along its own axis), so
MakeHuman proportions never misalign the clothes. The front of the head + neck takes the portrait (face swap = image swap).
Shoes: the bare MakeHuman feet are inflated into a sneaker volume with a flat sole at z = 0. Needs MPFB2 installed
(Blender extension 'mpfb', user_default repo)."""
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Vector

H = os.path.dirname(os.path.abspath(__file__))
A = sys.argv[sys.argv.index("--") + 1:]
NAME = A[0]
OPT = dict(height=1.78, gender=1.0, muscle=0.55, weight=0.5, ratio=0.16)
OPT.update({k: float(v) for k, v in (a.split("=") for a in A[1:])})
D = os.path.join(H, NAME)
SJ = json.load(open(os.path.join(D, "sheet.json")))
FJ = json.load(open(os.path.join(D, "face.json")))
W_, H_ = SJ["w"], SJ["h"]
V = SJ["views"]

bpy.ops.preferences.addon_enable(module="bl_ext.user_default.mpfb")
from bl_ext.user_default.mpfb.services.humanservice import HumanService  # noqa: E402
from bl_ext.user_default.mpfb.services.targetservice import TargetService  # noqa: E402

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
md = TargetService.get_default_macro_info_dict()
md.update(gender=OPT["gender"], muscle=OPT["muscle"], weight=OPT["weight"])
body = HumanService.create_human(macro_detail_dict=md, scale=0.1)

# ---- bake the macro shape keys, scale to the photo height, drop helper geometry (keep the eyeballs)
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
zmax = max(v.co.z for v in body.data.vertices); zmin = min(v.co.z for v in body.data.vertices)
body.data.transform(__import__("mathutils").Matrix.Scale(OPT["height"] / (zmax - zmin), 4))      # (helpers included: the
body.data.transform(__import__("mathutils").Matrix.Translation((0, 0, -min(v.co.z for v in body.data.vertices))))  # rig fits to them)
rig = HumanService.add_builtin_rig(body, "default")
rig.name = rig.data.name = NAME + "_rig"; body.name = body.data.name = NAME + "_body"
gi = {g.name: g.index for g in body.vertex_groups}
keep_g = {gi["body"], gi["helper-l-eye"], gi["helper-r-eye"]}
bm = bmesh.new(); bm.from_mesh(body.data); dl = bm.verts.layers.deform.active
bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not any(g in keep_g and w > 0.5 for g, w in v[dl].items())], context="VERTS")
bm.to_mesh(body.data); bm.free()
for m in [m for m in body.modifiers if m.type != "ARMATURE"]:
    body.modifiers.remove(m)
BONES = {b.name for b in rig.data.bones}
for g in [g for g in body.vertex_groups if g.name not in BONES]:     # MPFB's helper / joint groups are not needed
    body.vertex_groups.remove(g)
bpy.context.view_layer.update()
me = body.data
B = {b.name: b for b in rig.data.bones}
names = [g.name for g in body.vertex_groups]


# ---- region of every vertex = its dominant bone
def region(bn):
    if bn.startswith(("head", "jaw", "eye", "oris", "special", "levator", "risorius", "orbicularis", "oculi", "temporalis", "tongue")):
        return "head"
    if bn.startswith("neck"):
        return "neck"
    for s in "LR":
        if bn.endswith("." + s):
            if bn.startswith(("upperarm", "lowerarm", "wrist", "finger", "metacarpal")):
                return "arm" + s
            if bn.startswith(("upperleg", "lowerleg")):
                return "leg" + s
            if bn.startswith(("foot", "toe")):
                return "foot" + s
    return "torso"


vreg = []
for v in me.vertices:
    gs = sorted(((g.weight, names[g.group]) for g in v.groups), reverse=True)
    vreg.append(("eye" if gs[0][1].startswith("eye.") else region(gs[0][1])) if gs else "torso")
CO = np.array([v.co[:] for v in me.vertices])
REG = np.array(vreg)

# ---- shoes: inflate the feet into a sneaker, flat sole on the floor
for i, v in enumerate(me.vertices):
    if REG[i].startswith("foot") or (REG[i].startswith("leg") and v.co.z < 0.13):
        k = 1.0 if REG[i].startswith("foot") else max(0.0, (0.13 - v.co.z) / 0.05)
        v.co += v.normal * 0.018 * min(k, 1.0)                        # a real sneaker volume, not a flat tab
        v.co.z = max(v.co.z, 0.0)
CO = np.array([v.co[:] for v in me.vertices])
Z_CROTCH = min(CO[REG == "torso"][:, 2].min() + 0.03, 0.9)
Z_TOP = CO[:, 2].max()


# ---- the sheet: rows of runs per view
def row_of(view, z):
    v = V[view]; s = OPT["height"] / (v["y1"] - v["y0"])
    return int(min(max(round(v["y1"] - z / s), v["y0"]), v["y1"])), s


def central(view, y, cx):
    rs = V[view]["runs"][y]
    if not rs:
        return None
    hp = V[view]["y1"] - V[view]["y0"]
    rs = [r for r in rs if abs((r[0] + r[1]) / 2 - cx) < 0.12 * hp or r[0] <= cx <= r[1]] or rs     # never the hands
    return min(rs, key=lambda r: 0 if r[0] <= cx <= r[1] else min(abs(r[0] - cx), abs(r[1] - cx)))


def vcentre(view):
    v = V[view]; y = int(v["y0"] + 0.45 * (v["y1"] - v["y0"]))
    r = central(view, y, (v["x0"] + v["x1"]) / 2); return (r[0] + r[1]) / 2


CX = {k: vcentre(k) for k in V}


def mesh_band(mask, z, axis, dz=0.012):
    sel = mask & (np.abs(CO[:, 2] - z) < dz)
    if sel.sum() < 3:
        sel = mask & (np.abs(CO[:, 2] - z) < 3 * dz)
    if sel.sum() < 2:
        return None
    a = CO[sel, axis] if axis == 0 else -CO[sel, 1]
    return (a.min() + a.max()) / 2, max((a.max() - a.min()) / 2, 0.004)


def uv_body(view, z, mask, coord, run_pick=None):
    """sheet pixel for a vertex: row from its height, column from its across-coordinate normalised to the silhouette."""
    y, s = row_of(view, z)
    axis = 1 if view == "side" else 0
    mb = mesh_band(mask, z, axis)
    cx = CX[view]
    r = run_pick(y) if run_pick else central(view, y, cx)
    if r is None or mb is None:
        return (cx / W_, 1 - y / H_)
    mc, mhw = mb; rc, rhw = (r[0] + r[1]) / 2, max((r[1] - r[0]) / 2, 1)
    t = (coord - mc) / mhw
    t = max(-0.97, min(0.97, t))
    col = rc + t * rhw
    return (col / W_, 1 - (y + 0.5) / H_)


TORSO = np.isin(REG, ["torso", "neck"]) | (np.char.startswith(REG.astype(str), "leg") & (CO[:, 2] > Z_CROTCH))
HEAD = np.isin(REG, ["head", "eye"])
LEG = {s: (np.isin(REG, ["leg" + s, "foot" + s])) & (CO[:, 2] <= Z_CROTCH) for s in "LR"}


def leg_run(view, s):
    def pick(y):
        rs = V[view]["runs"][y]
        if not rs:
            return None
        if view == "side":
            return (min(r[0] for r in rs), max(r[1] for r in rs))
        hp = V[view]["y1"] - V[view]["y0"]; cx = CX[view]
        rs = sorted([r for r in rs if abs((r[0] + r[1]) / 2 - cx) < 0.12 * hp or r[0] <= cx <= r[1]], key=lambda r: r[0])   # not the hands
        if not rs:
            return None
        if len(rs) == 1:
            a, b = rs[0]; m_ = (a + b) // 2
            rs = [(a, m_), (m_, b)]
        right_img = rs[-1]; left_img = rs[0]
        # front view: the person's left (.L, +x) is on the image right; back view: the image left
        return (right_img if s == "L" else left_img) if view == "front" else (left_img if s == "L" else right_img)
    return pick


# ---- arms: parameter along the shoulder -> fingertip axis (mesh) vs the same axis in the front / back photo
def sheet_arm(view, s):
    v = V[view]; cx = CX[view]
    image_right = (s == "L") == (view == "front")
    rows = {}
    for y in range(v["y0"] + int(0.15 * (v["y1"] - v["y0"])), v["y1"]):
        rs = v["runs"][y]; c = central(view, y, cx)
        if not rs or c is None:
            continue
        o = [r for r in rs if (r[0] > c[1] if image_right else r[1] < c[0])]
        if not o:
            if len(rows) > 10:
                break
            continue
        rows[y] = o[0] if image_right else o[-1]
    ys = sorted(rows); pts = np.array([[(rows[y][0] + rows[y][1]) / 2, y] for y in ys], float)
    p0 = pts[: max(3, len(pts) // 4)].mean(0); p1 = pts[-max(3, len(pts) // 6):].mean(0)
    d = (p1 - p0) / np.linalg.norm(p1 - p0)
    w0 = rows[ys[2]][1] - rows[ys[2]][0]
    sh = p0 - d * (np.dot(p0 - pts[0], d) + 0.9 * w0 * abs(d[1]))
    end = pts[-1] + d * 0.5 * (rows[ys[-1]][1] - rows[ys[-1]][0]) * abs(d[1])
    nrm = np.array([-d[1], d[0]])
    hws = []
    for t in np.linspace(0, 1, 21):
        p = sh + (end - sh) * t; wpx = 0
        for sg in (-1, 1):
            k = 0
            while k < 60:
                q = p + nrm * sg * k; yy, xx = int(q[1]), int(q[0])
                if not (0 <= yy < H_) or not any(a <= xx <= b for a, b in v["runs"][yy]):
                    break
                k += 1
            wpx += k
        hws.append(max(wpx / 2, 3))
    return sh, end, nrm, np.array(hws)


ARMS = {}
for s in "LR":
    sh = rig.matrix_world @ B[f"upperarm01.{s}"].head_local
    tip = rig.matrix_world @ B[f"finger3-3.{s}"].tail_local
    d = (tip - sh); L = d.length; d.normalize()
    nrm = Vector((0, 1, 0)).cross(d).normalized()                    # across the arm, in the frontal plane
    m = REG == "arm" + s
    P = CO[m] - np.array(sh[:]); t = P @ np.array(d[:]) / L; a = P @ np.array(nrm[:])
    bins = np.clip((t * 20).round().astype(int), 0, 20)
    hw = np.array([max(np.abs(a[bins == k]).max() if (bins == k).any() else 0.03, 0.01) for k in range(21)])
    ARMS[s] = dict(sh=np.array(sh[:]), d=np.array(d[:]), L=L, nrm=np.array(nrm[:]), hw=hw,
                   front=sheet_arm("front", s), back=sheet_arm("back", s))


def uv_arm(s, co, view):
    A_ = ARMS[s]; P = co - A_["sh"]; t = float(np.clip(P @ A_["d"] / A_["L"], 0, 1)); a = P @ A_["nrm"]
    k = int(round(t * 20)); a_n = max(-0.97, min(0.97, a / A_["hw"][k]))
    t = max(t, 0.08)                                                  # the shoulder cap samples the sleeve, not past the photo's shoulder
    sh, end, nrm, hws = A_[view]
    mirror = 1.0 if view == "front" else -1.0                         # the back photo is seen from behind
    p = sh + (end - sh) * t + nrm * a_n * hws[k] * mirror * (1 if s == "L" else -1) * np.sign(nrm[0] if abs(nrm[0]) > 1e-3 else 1)
    return (p[0] / W_, 1 - p[1] / H_)


# ---- the head: the portrait's landmarks vs the mesh's
z_eye = (rig.matrix_world @ B["eye.L"].head_local).z
headv = CO[HEAD]
front_head = HEAD & (CO[:, 1] < np.percentile(headv[:, 1], 35))
z_chin = CO[front_head][:, 2].min()
band = HEAD & (np.abs(CO[:, 2] - (z_eye - 0.035)) < 0.02)
ear_hw = np.abs(CO[band][:, 0]).max()


Z_COLLAR = z_chin - 0.10                                               # mesh neck base, where the shirt starts


def uv_face(co):
    x, z = co[0], co[2]
    u = FJ["cx"] + x / ear_hw * FJ["ear_hw"]
    if z >= z_eye:
        v = FJ["eye"] + (FJ["top"] - FJ["eye"]) * (z - z_eye) / (Z_TOP - z_eye)
    elif z >= z_chin:
        v = FJ["eye"] + (FJ["chin"] - FJ["eye"]) * (z_eye - z) / (z_eye - z_chin)
    else:                                                              # the throat: MakeHuman's neck is longer than the photo's,
        v = FJ["chin"] + (FJ.get("collar", FJ["chin"] + 0.07) - 0.012 - FJ["chin"]) * (z_chin - z) / (z_chin - Z_COLLAR)   # so chin..collar
        #                                                                is stretched over chin..neck base (skin down to the shirt)
    return (u, 1 - min(v, 0.995))


# ---- assign per face: material + projected UVs
uvl = me.uv_layers.new(name="proj"); me.uv_layers.active = uvl
for u_ in [u for u in me.uv_layers if u.name != "proj"]:
    me.uv_layers.remove(u_)
FACE_SET = set()
for p in me.polygons:
    n = p.normal; vs = list(p.vertices)
    regs = [REG[i] for i in vs]; r = max(set(regs), key=regs.count)
    view = "front" if n.y < -0.45 else ("back" if n.y > 0.45 else "side")
    if view == "side" and not r.startswith(("arm", "head", "eye", "neck")) and 0.5 < p.center.z < 1.5:
        # in the profile photo the hanging arm and hand cover the hips/thighs: take the silhouette edge of the
        # front (or back) photo instead, so no skin from the hand lands on the jeans or the shirt
        view = "front" if p.center.y < 0.0 else "back"
    portrait = r == "eye" or (r in ("head", "neck") and (n.y < -0.25 or (r == "head" and n.z > 0.55 and p.center.y < CO[HEAD][:, 1].mean())))
    if r == "neck":                                                    # the whole neck (front + sides) down to the collar takes the
        portrait = n.y < 0.3 and p.center.z > Z_COLLAR and abs(p.center.x) < 0.085   # portrait: one skin, no seam
        #                                                                under the jaw; the trapezius keeps the sheet's shirt
    if portrait:
        FACE_SET.add(p.index)
    for li, vi in zip(p.loop_indices, vs):
        co = CO[vi]
        if portrait:                                                   # under the jaw: sample the throat, not the
            uv = uv_face(co - np.array((0, 0, 0.03))) if (n.z < -0.3 and p.center.z < z_chin + 0.02) else uv_face(co)   # jaw shadow
        elif r.startswith("arm"):
            uv = uv_arm(r[-1], co, "back" if n.y > 0.2 else "front")
        elif r.startswith(("leg", "foot")) and co[2] <= Z_CROTCH:
            s = r[-1]
            coord = co[0] if view != "side" else -co[1]
            uv = uv_body(view, co[2], LEG[s], coord if view != "back" else co[0], leg_run(view, s))
            if view == "back":
                uv = (2 * (sum(leg_run(view, s)(row_of(view, co[2])[0]) or (0, 0)) / 2) / W_ - uv[0], uv[1])
        else:
            mask = HEAD if r == "head" else TORSO
            if r != "head" and co[2] > 1.36 and abs(co[0]) > 0.05:    # shoulder tops: sample the shirt just below the
                co = np.array((co[0] * 0.6, co[1] * 0.6, 1.36))       # photo's shoulder line, toward the chest (no skin, magenta
                #                                                       edge or the grey armpit shadow on the shoulder tops)
                view = "front" if view == "side" and p.center.y < 0 else ("back" if view == "side" else view)
            if view == "side":
                uv = uv_body("side", co[2], mask, -co[1])
            else:
                uv = uv_body(view, co[2], mask, co[0])
                if view == "back":                                    # seen from behind: mirror around the view centre
                    uv = (2 * CX["back"] / W_ - uv[0], uv[1])
        uvl.data[li].uv = uv


# ---- materials (Closest, as the kit): body atlas + portrait
def mat(name, path):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new("ShaderNodeOutputMaterial"); t = nt.nodes.new("ShaderNodeTexImage"); b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    t.image = bpy.data.images.load(path); t.image.pack(); t.interpolation = "Closest"; t.name = "img"
    b.inputs["Roughness"].default_value = 0.9
    nt.links.new(t.outputs[0], b.inputs[0]); nt.links.new(b.outputs[0], o.inputs[0])
    return m


me.materials.clear()
me.materials.append(mat(NAME + "_sheet", os.path.join(D, "sheet_bleed.png")))
me.materials.append(mat(NAME + "_face", os.path.join(D, "faces", "neutral.png")))
for p in me.polygons:
    p.material_index = 1 if p.index in FACE_SET else 0
    p.use_smooth = False

# ---- skin weights: rigid sneakers (every shoe vertex 100 % on its foot bone: no crumpling at toe-off) and smoothed
#      shoulders (MakeHuman's clavicle/shoulder/upper-arm weights fold the shirt into flaps when the arms rise)
gidx = {g.name: g.index for g in body.vertex_groups}
for i, v in enumerate(me.vertices):
    if REG[i].startswith("foot"):
        s_ = REG[i][-1]
        for g in list(v.groups):
            body.vertex_groups[g.group].remove([i])
        body.vertex_groups[f"foot.{s_}"].add([i], 1.0, "REPLACE")
zone = [i for i in range(len(me.vertices)) if CO[i][2] > 1.12 and 0.05 < abs(CO[i][0]) < 0.34 and REG[i] in ("torso", "neck", "armL", "armR")
        and CO[i][2] > 1.0]
zs = set(zone)
nbr = {i: [] for i in zone}
for e in me.edges:
    a, b = e.vertices
    if a in zs:
        nbr[a].append(b)
    if b in zs:
        nbr[b].append(a)
GN = [g.name for g in body.vertex_groups]
for _ in range(6):
    W = {i: {GN[g.group]: g.weight for g in me.vertices[i].groups} for i in set(zone) | {j for i in zone for j in nbr[i]}}
    for i in zone:
        acc = {}
        for j in nbr[i]:
            for k, w in W[j].items():
                acc[k] = acc.get(k, 0.0) + w / max(len(nbr[i]), 1)
        new = {k: 0.5 * W[i].get(k, 0.0) + 0.5 * acc.get(k, 0.0) for k in set(W[i]) | set(acc)}
        tot = sum(new.values()) or 1.0
        for k, w in new.items():
            if w / tot > 0.004:
                body.vertex_groups[k].add([i], w / tot, "REPLACE")
            elif k in W[i]:
                body.vertex_groups[k].remove([i])

# ---- PS1 low poly: decimate (hands, face and shoulders lose less), applied under the armature
keep = body.vertex_groups.new(name="_keep")
keep.add(zone, 0.7, "REPLACE")
keep.add([i for i in range(len(me.vertices)) if REG[i].startswith("arm") and CO[i][2] < 1.0], 1.0, "REPLACE")
keep.add([i for i in range(len(me.vertices)) if REG[i] in ("head", "eye")], 0.6, "REPLACE")
dec = body.modifiers.new("dec", "DECIMATE"); dec.ratio = OPT["ratio"]; dec.vertex_group = "_keep"; dec.invert_vertex_group = True
dec.vertex_group_factor = 4.0; dec.use_collapse_triangulate = False
body.modifiers.move(len(body.modifiers) - 1, 0)
bpy.context.view_layer.objects.active = body
bpy.ops.object.modifier_apply(modifier="dec")
body.vertex_groups.remove(body.vertex_groups["_keep"])
print(f"{NAME}: {len(me.polygons)} faces, {len(me.vertices)} verts, {len(rig.data.bones)} bones; z_eye {z_eye:.3f} chin {z_chin:.3f} top {Z_TOP:.3f}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, NAME + ".blend"))

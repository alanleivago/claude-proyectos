"""Kit v4 human (2026-11-11, replaces the sheet projection of build_human.py): a MakeHuman / MPFB2 body with
  - a real skin texture on its own MakeHuman UV (skin.png from prep_look.py), the Flow photo ONLY inside the face oval
    (faces/mask.png), blended into that skin -> no photo on the neck, no mask edge; face swap = swap the "img" image;
  - real MakeHuman CC0 clothing meshes (mhclo, own UVs + weights) tinted with the colours of the Flow outfit sheet
    (look.json): every UV island above the waist takes the top colour (or the inner colour for a shirt under a jacket),
    below it the bottom colour; regular-fit trouser legs (inflated at calf / ankle);
  - a MakeHuman hair mesh tinted to the portrait's hair colour; modelled accessories (glasses, cap, flat cap, badge,
    mail bag, lab-coat skirt, apron) and the kit's modelled rigid shoes.
Same rig ("default" MakeHuman skeleton, bone names unchanged) and the same object / material contract as before, so
human.py, retarget.py and every baked motion keep working:  "<name>_rig", "<name>_body" (slot 0 skin, slot 1 face).
    Blender -b -P styles/zawdog/humans/build_human2.py -- <name> height=1.78 gender=1 ... top=male_casualsuit01 hair=short02
      [skin_age...] [glasses=r,g,b] [cap=r,g,b] [flatcap=r,g,b] [badge=r,g,b] [bag=r,g,b] [coat=r,g,b] [apron=r,g,b]
      [inflate=0.014] [shoe=sneaker|boot|shoe upper= sole= accent=]
Needs MPFB2 + the MakeHuman CC0 system assets unzipped in ~/Library/Application Support/Blender/5.2/mpfb/data."""
import json
import math
import os
import sys

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

H = os.path.dirname(os.path.abspath(__file__))
UD = os.path.expanduser("~/Library/Application Support/Blender/5.2/mpfb/data")
A = sys.argv[sys.argv.index("--") + 1:]
NAME = A[0]
OPT = dict(height=1.78, gender=1.0, muscle=0.55, weight=0.5, ratio=0.16, age=0.5, proportions=0.5, cupsize=0.5, race="",
           shoe="sneaker", upper="238,237,233", sole="186,176,160", accent="190,190,192", top="male_casualsuit06", hair="",
           inflate=0.012)
STR = ("race", "shoe", "upper", "sole", "accent", "top", "hair", "glasses", "cap", "flatcap", "badge", "bag", "coat", "apron")
OPT.update({k: (v if k in STR else float(v)) for k, v in (a.split("=", 1) for a in A[1:])})
K = OPT["height"] / 1.78
D = os.path.join(H, NAME)
FJ = json.load(open(os.path.join(D, "face.json")))
LOOK = json.load(open(os.path.join(D, "look.json")))

bpy.ops.preferences.addon_enable(module="bl_ext.user_default.mpfb")
from bl_ext.user_default.mpfb.services.humanservice import HumanService  # noqa: E402
from bl_ext.user_default.mpfb.services.targetservice import TargetService  # noqa: E402

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o)
md = TargetService.get_default_macro_info_dict()
md.update(gender=OPT["gender"], muscle=OPT["muscle"], weight=OPT["weight"], age=OPT["age"], proportions=OPT["proportions"],
          cupsize=OPT["cupsize"])
if OPT["race"]:
    md["race"] = dict(zip(("asian", "caucasian", "african"), (float(x) for x in OPT["race"].split(","))))
body = HumanService.create_human(macro_detail_dict=md, scale=0.1)
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
zmax = max(v.co.z for v in body.data.vertices); zmin = min(v.co.z for v in body.data.vertices)
body.data.transform(Matrix.Scale(OPT["height"] / (zmax - zmin), 4))
body.data.transform(Matrix.Translation((0, 0, -min(v.co.z for v in body.data.vertices))))
rig = HumanService.add_builtin_rig(body, "default")
rig.name = rig.data.name = NAME + "_rig"; body.name = body.data.name = NAME + "_body"
B = {b.name: b for b in rig.data.bones}
KS = B["upperarm01.L"].head_local.z / 1.417
KN = (B["head"].head_local.z - B["neck01"].head_local.z) / 0.098


def strip_mods(o):
    for m in [m for m in o.modifiers if m.type != "ARMATURE"]:
        o.modifiers.remove(m)


# ---- MakeHuman clothes + hair (fitted to the full basemesh, helpers still there), rigged from the body's weights
CLOTHES = []
for cn in [c for c in OPT["top"].split("+") if c]:
    c = HumanService.add_mhclo_asset(os.path.join(UD, "clothes", cn, cn + ".mhclo"), body, asset_type="Clothes", subdiv_levels=0)
    strip_mods(c); c["src"] = cn; CLOTHES.append(c)
HAIR = None
if OPT["hair"]:
    HAIR = HumanService.add_mhclo_asset(os.path.join(UD, "hair", OPT["hair"], OPT["hair"] + ".mhclo"), body, asset_type="Hair",
                                        subdiv_levels=0)
    strip_mods(HAIR)

# ---- body: drop helpers and every vertex a garment hides (no poke-through), keep the eyeballs
gi = {g.name: g.index for g in body.vertex_groups}
keep_g = {gi["body"], gi["helper-l-eye"], gi["helper-r-eye"]}
del_g = {i for n_, i in gi.items() if n_.startswith("Delete.")}
bm = bmesh.new(); bm.from_mesh(body.data); dl = bm.verts.layers.deform.active; bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not any(g in keep_g and w > 0.5 for g, w in v[dl].items())], context="VERTS")
bm.normal_update()
for v in bm.verts:                                     # skin a garment hides: kept (no see-through holes when the cloth
    if any(g in del_g and w > 0.5 for g, w in v[dl].items()):   # stretches) but pulled 1.2 cm inside it (no poke-through)
        v.co -= v.normal * 0.012 * K
bm.to_mesh(body.data); bm.free()
strip_mods(body)
BONES = {b.name for b in rig.data.bones}
for o in [body] + CLOTHES + ([HAIR] if HAIR else []):
    for g in [g for g in o.vertex_groups if g.name not in BONES]:
        o.vertex_groups.remove(g)
bpy.context.view_layer.update()
me = body.data
names = [g.name for g in body.vertex_groups]


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
REG = np.array(vreg)
CO = np.array([v.co[:] for v in me.vertices])

# ---- feet: measured for the modelled shoes, then shrunk inside them
FOOT = {}
for s_ in "LR":
    P_ = CO[REG == "foot" + s_]
    L_ = P_[:, 1].max() - P_[:, 1].min()
    heel = P_[P_[:, 1] > P_[:, 1].max() - 0.15 * L_].mean(0); toe = P_[P_[:, 1] < P_[:, 1].min() + 0.15 * L_].mean(0)
    FOOT[s_] = dict(heel=heel, toe=toe, w=np.ptp(P_[:, 0]), c=P_.mean(0))
for i, v in enumerate(me.vertices):
    if REG[i].startswith("foot"):
        c_ = FOOT[REG[i][-1]]["c"]
        v.co.x = c_[0] + (v.co.x - c_[0]) * 0.55; v.co.z = 0.02 + v.co.z * 0.55; v.co.y = c_[1] + (v.co.y - c_[1]) * 0.85
CO = np.array([v.co[:] for v in me.vertices])
Z_TOP = CO[:, 2].max()
HEAD = np.isin(REG, ["head", "eye"])

# ---- the face: portrait landmarks vs the mesh's (eye line, lip line, chin, ear width)
z_eye = B["eye.L"].head_local.z
front_head = HEAD & (CO[:, 1] < np.percentile(CO[HEAD][:, 1], 35))
z_chin = CO[front_head][:, 2].min()
z_mouth = B["oris06"].head_local.z + 0.004 * KN
band = HEAD & (np.abs(CO[:, 2] - (z_eye - 0.035 * KN)) < 0.02 * KN)
ear_hw = np.abs(CO[band][:, 0]).max()
y_head = CO[HEAD][:, 1].mean()


def uv_face(co):
    x, z = co[0], co[2]
    u = FJ["cx"] + x / ear_hw * FJ["ear_hw"]
    if z >= z_eye:
        v = FJ["eye"] + (FJ["top"] - FJ["eye"]) * (z - z_eye) / (Z_TOP - z_eye)
    elif "mouth" in FJ and z >= z_mouth:
        v = FJ["eye"] + (FJ["mouth"] - FJ["eye"]) * (z_eye - z) / (z_eye - z_mouth)
    elif "mouth" in FJ and z >= z_chin:
        v = FJ["mouth"] + (FJ["chin"] - FJ["mouth"]) * (z_mouth - z) / (z_mouth - z_chin)
    elif z >= z_chin:
        v = FJ["eye"] + (FJ["chin"] - FJ["eye"]) * (z_eye - z) / (z_eye - z_chin)
    else:
        v = FJ["chin"] + 0.3 * (z_chin - z)                            # under the chin: outside the mask -> skin
    return (min(max(u, 0.002), 0.998), 1 - min(max(v, 0.002), 0.998))


OUT_UV = (0.002, 0.998)                                                # a corner of the portrait where the mask is 0

# ---- UVs: the MakeHuman UV for the skin ("UVMap") + the portrait projection ("proj", face polys only)
uvmh = me.uv_layers[0]; uvmh.name = "UVMap"
for u_ in list(me.uv_layers)[1:]:
    me.uv_layers.remove(u_)
proj = me.uv_layers.new(name="proj")
uvmh = me.uv_layers["UVMap"]; uvmh.active_render = True; me.uv_layers.active = uvmh
FACE_SET = set()
for p in me.polygons:
    vs = list(p.vertices); regs = [REG[i] for i in vs]; r = max(set(regs), key=regs.count)
    if r in ("head", "eye", "neck"):
        FACE_SET.add(p.index)
    front = r in ("head", "eye") and (p.normal.y < 0.25 or r == "eye") and p.center.y < y_head and p.center.z > z_chin - 0.02 * KN
    for li, vi in zip(p.loop_indices, vs):
        proj.data[li].uv = uv_face(CO[vi]) if front else OUT_UV


# ---- materials: every textured material keeps an image node named "img" (human.py flat() / face swap)
def img_load(path, closest=True):
    im = bpy.data.images.load(path, check_existing=True); im.pack(); return im


def flat_tree(m, img_node, alpha=False):
    nt = m.node_tree; out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL")
    dif = nt.nodes.new("ShaderNodeBsdfDiffuse"); emi = nt.nodes.new("ShaderNodeEmission"); mix = nt.nodes.new("ShaderNodeMixShader")
    mix.inputs[0].default_value = 0.5
    nt.links.new(img_node.outputs[0], dif.inputs["Color"]); nt.links.new(img_node.outputs[0], emi.inputs["Color"])
    nt.links.new(dif.outputs[0], mix.inputs[1]); nt.links.new(emi.outputs[0], mix.inputs[2])
    last = mix
    if alpha:
        tr = nt.nodes.new("ShaderNodeBsdfTransparent"); am = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(img_node.outputs[1], am.inputs[0]); nt.links.new(tr.outputs[0], am.inputs[1]); nt.links.new(mix.outputs[0], am.inputs[2])
        last = am
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = "DITHERED"
    nt.links.new(last.outputs[0], out.inputs[0])


def mat_img(name, path_or_img, alpha=False, uv=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    nt.nodes.new("ShaderNodeOutputMaterial"); t = nt.nodes.new("ShaderNodeTexImage"); t.name = "img"
    t.image = path_or_img if not isinstance(path_or_img, str) else img_load(path_or_img); t.interpolation = "Closest"
    if uv:
        u = nt.nodes.new("ShaderNodeUVMap"); u.uv_map = uv; nt.links.new(u.outputs[0], t.inputs[0])
    flat_tree(m, t, alpha); m["flat_ready"] = 1
    return m


def mat_face():
    """photo (proj UV, swapped by human.py) over the skin (MakeHuman UV) through the feathered face mask."""
    m = bpy.data.materials.new(NAME + "_face"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    nt.nodes.new("ShaderNodeOutputMaterial")
    up = nt.nodes.new("ShaderNodeUVMap"); up.uv_map = "proj"; uu = nt.nodes.new("ShaderNodeUVMap"); uu.uv_map = "UVMap"
    ph = nt.nodes.new("ShaderNodeTexImage"); ph.name = "img"; ph.image = img_load(os.path.join(D, "faces", "neutral.png")); ph.interpolation = "Closest"
    mk = nt.nodes.new("ShaderNodeTexImage"); mk.name = "mask"; mk.image = img_load(os.path.join(D, "faces", "mask.png"))
    mk.image.colorspace_settings.name = "Non-Color"; mk.extension = "CLIP"
    sk = nt.nodes.new("ShaderNodeTexImage"); sk.name = "skin"; sk.image = img_load(os.path.join(D, "skin.png")); sk.interpolation = "Closest"
    for a_, b_ in ((up, ph), (up, mk), (uu, sk)):
        nt.links.new(a_.outputs[0], b_.inputs[0])
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"
    nt.links.new(mk.outputs[0], mx.inputs[0]); nt.links.new(sk.outputs[0], mx.inputs[6]); nt.links.new(ph.outputs[0], mx.inputs[7])
    flat_tree(m, type("o", (), {"outputs": [mx.outputs[2]]})())
    m["flat_ready"] = 1
    return m


me.materials.clear()
me.materials.append(mat_img(NAME + "_skin", os.path.join(D, "skin.png"), uv="UVMap"))
me.materials.append(mat_face())
for p in me.polygons:
    p.material_index = 1 if p.index in FACE_SET else 0
    p.use_smooth = False


# ---- tinted clothes: the MakeHuman texture as detail (luminance) x the Flow colour, 256 px; islands -> top / inner / bottom
def detail_px(path, size=256):
    im = bpy.data.images.load(path); im.scale(size, size)
    a = np.array(im.pixels[:], np.float32).reshape(size, size, 4); bpy.data.images.remove(im)
    return a


def box_blur(x, r):
    for ax in (0, 1):
        c = np.cumsum(np.pad(x, [(r + 1, r) if i == ax else (0, 0) for i in range(2)], mode="edge"), axis=ax)
        x = (np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax) - np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax)) / (2 * r + 1)
    return x


def tinted(a, col, tag, keep_alpha=False, ao=None):
    """detail = the garment's baked AO (folds) x the fine weave (high-pass of the texture): prints / logos and the
    original colour blocks are dropped, only the Flow colour remains."""
    lum = a[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)
    ok = a[..., 3] > 0.5
    if keep_alpha:
        d = np.clip((lum / max(np.median(lum[ok]) if ok.any() else 0.5, 1e-3)) ** 0.8, 0.35, 1.6)
    else:
        hp = np.clip(lum / np.maximum(box_blur(lum, 2), 1e-3), 0.93, 1.07)   # weave only (no print edges)
        d = hp * (np.clip(ao, 0.25, 1.0) ** 0.7 / max(np.median(ao), 0.3) if ao is not None else 1.0)
        d = np.clip(d, 0.35, 1.3)
    c = np.array(col, np.float32) / 255.0
    rgb = np.clip(d[..., None] * (c ** 2.2)[None, None, :], 0, 1)          # linear pixels (the image is sRGB -> decode)
    rgb = rgb ** (1 / 2.2)
    out = np.dstack([rgb, a[..., 3:] if keep_alpha else np.ones_like(a[..., 3:])])
    im = bpy.data.images.new(f"{NAME}_{tag}", a.shape[1], a.shape[0], alpha=True); im.pixels = out.ravel()
    im.filepath_raw = os.path.join(D, f"tex_{tag}.png"); im.file_format = "PNG"; im.save(); im.pack()
    return im, d


Z_WAIST = B["upperleg01.L"].head_local.z + 0.06 * KS
Z_KNEE = B["lowerleg01.L"].head_local.z


def islands(o):
    bm_ = bmesh.new(); bm_.from_mesh(o.data); uvl = bm_.loops.layers.uv.active; bm_.faces.ensure_lookup_table()
    par = list(range(len(bm_.faces)))

    def f(i):
        while par[i] != i:
            par[i] = par[par[i]]; i = par[i]
        return i
    for e in bm_.edges:
        lf = e.link_faces
        if len(lf) != 2:
            continue
        a_, b_ = lf

        def uvs(fc):
            return {l.vert.index: tuple(round(x, 4) for x in l[uvl].uv) for l in fc.loops if l.vert in e.verts}
        if uvs(a_) == uvs(b_):
            par[f(a_.index)] = f(b_.index)
    res = [f(i) for i in range(len(bm_.faces))]
    cz = [fc.calc_center_median().z for fc in bm_.faces]
    uvc = [np.mean([tuple(l[uvl].uv) for l in fc.loops], 0) for fc in bm_.faces]
    bm_.free()
    return res, cz, uvc


for c in CLOTHES:
    src = c["src"]; a = detail_px(os.path.join(UD, "clothes", src, src + "_diffuse.png"))
    aop = os.path.join(UD, "clothes", src, src + "_ao.png")
    AO = box_blur(detail_px(aop)[..., :3].mean(-1), 12) if os.path.exists(aop) else None   # folds only (the AO bake holds the print too)
    isl, cz, uvc = islands(c)
    groups = {}
    for fi, (k_, z_) in enumerate(zip(isl, cz)):
        groups.setdefault(k_, []).append(fi)
    lum = a[..., :3] @ np.array([0.3, 0.59, 0.11], np.float32)
    S_ = a.shape[0]
    def isl_lum(fs):
        return float(np.mean([lum[min(int((1 - uvc[i][1]) * S_), S_ - 1), min(int(uvc[i][0] * S_), S_ - 1)] for i in fs]))
    Z_MID = (Z_WAIST + Z_KNEE) / 2                                           # trousers / skirts reach below mid-thigh,
    up = {k_: fs for k_, fs in groups.items() if min(cz[i] for i in fs) > Z_MID}   # jacket hems + pockets do not
    main = max(up, key=lambda k_: len(up[k_])) if up else None
    ml = isl_lum(up[main]) if main is not None else 0
    im_top, _ = tinted(a, LOOK["top"], src + "_top", ao=AO); im_bot, _ = tinted(a, LOOK["bottom"], src + "_bot", ao=AO)
    im_in, _ = tinted(a, LOOK.get("inner", LOOK["top"]), src + "_inner", ao=AO)
    c.data.materials.clear()
    for tag, im in (("top", im_top), ("bot", im_bot), ("inner", im_in)):
        c.data.materials.append(mat_img(f"{NAME}_{src}_{tag}", im))
    use_inner = OPT.get("inner_on", 0) > 0                                   # a shirt / blouse under a jacket (explicit)
    def isl_x(fs):
        return float(np.mean([abs(c.data.polygons[i].center.x) for i in fs]))
    for k_, fs in groups.items():
        if k_ in up:
            idx = 2 if (use_inner and main is not None and abs(isl_lum(fs) - ml) > 0.22 and len(fs) < 0.5 * len(up[main])
                        and isl_x(fs) < 0.09 * K) else 0
        else:
            idx = 1
        for fi in fs:
            c.data.polygons[fi].material_index = idx
    for p in c.data.polygons:
        p.use_smooth = False
    # regular-fit legs: push the trouser vertices out from each leg's axis (more at calf / ankle)
    if OPT["inflate"] > 0:
        cen = {}
        for s_, sg in (("L", 1), ("R", -1)):
            lv = CO[np.char.startswith(REG.astype(str), "leg" + s_)]
            cen[s_] = (lv, sg)
        for v in c.data.vertices:
            z = v.co.z
            if z > Z_WAIST - 0.12 * KS:
                continue
            s_ = "L" if v.co.x > 0 else "R"
            lv = cen[s_][0]; bandv = lv[np.abs(lv[:, 2] - z) < 0.03]
            if len(bandv) < 3:
                continue
            ctr = bandv[:, :2].mean(0); d2 = np.array(v.co[:2]) - ctr; n_ = np.linalg.norm(d2)
            if n_ < 1e-4:
                continue
            f_ = OPT["inflate"] * K * (1.0 + 0.25 * np.clip((Z_KNEE - z) / Z_KNEE, 0, 1)) * min(1.0, (Z_WAIST - 0.12 * KS - z) / 0.1)
            v.co.x += d2[0] / n_ * f_; v.co.y += d2[1] / n_ * f_

if HAIR is not None:
    import glob as _g
    a = detail_px(sorted(_g.glob(os.path.join(UD, "hair", OPT["hair"], "*diffuse*.png")))[0], 256)
    im_h, _ = tinted(a, LOOK["hair"], "hair", keep_alpha=True)
    HAIR.data.materials.clear(); HAIR.data.materials.append(mat_img(NAME + "_hair", im_h, alpha=True))
    for p in HAIR.data.polygons:
        p.use_smooth = False

# ---- skin weights: smoothed shoulders (as build_human.py) on the body
gidx = {g.name: g.index for g in body.vertex_groups}
for i, v in enumerate(me.vertices):
    if REG[i].startswith("foot"):
        for g in list(v.groups):
            body.vertex_groups[g.group].remove([i])
        body.vertex_groups[f"foot.{REG[i][-1]}"].add([i], 1.0, "REPLACE")


# ---- PS1 low poly: decimate the body and heavy garments (applied under the armature)
def decimate(o, ratio, keep=None):
    if keep:
        g = o.vertex_groups.new(name="_keep"); g.add(keep, 0.7, "REPLACE")
    d = o.modifiers.new("dec", "DECIMATE"); d.ratio = ratio; d.use_collapse_triangulate = False
    if keep:
        d.vertex_group = "_keep"; d.invert_vertex_group = True; d.vertex_group_factor = 4.0
    o.modifiers.move(len(o.modifiers) - 1, 0)
    bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.modifier_apply(modifier="dec")
    if keep:
        o.vertex_groups.remove(o.vertex_groups["_keep"])


decimate(body, max(OPT["ratio"] * 1.6, 0.25), keep=[i for i in range(len(me.vertices)) if REG[i] in ("head", "eye") or REG[i].startswith("arm")])
for c in CLOTHES:
    if len(c.data.polygons) > 3000:
        decimate(c, 2600 / len(c.data.polygons))


# ---- modelled rigid shoes (build_human.py's shoe, kept identical)
def shoe_texture(path):
    KIND = OPT["shoe"]; UP, SO, AC = (np.array([float(x) for x in OPT[k].split(",")]) for k in ("upper", "sole", "accent"))
    T = np.zeros((128, 128, 3), np.float32); v = (np.arange(128)[::-1] + 0.5)[:, None] / 128; u = (np.arange(128) + 0.5)[None, :] / 128
    if KIND != "sneaker":
        T[:] = UP
        T[(v < (0.14 if KIND == "boot" else 0.08)).repeat(128, 1)] = SO
        T[((v >= 0.035) & (v < 0.05)).repeat(128, 1)] = SO * 0.6
        sh = 1 + 0.10 * np.cos((u - 0.5) * 2 * np.pi); up_ = (v >= 0.14) & (v < 0.75)
        T *= np.where(up_, sh, 1.0)[..., None]
        T[np.broadcast_to(up_ & ((u < 0.05) | (u > 0.95)), (128, 128))] = UP * 0.75
        st = up_ & (np.abs(v - (0.2 if KIND == "boot" else 0.16)) < 0.006); T[np.broadcast_to(st, (128, 128))] = AC
        top = v >= 0.78; T[np.broadcast_to(top, (128, 128))] = UP * 0.9
        if KIND == "boot":
            lace = top & (np.abs(u - 0.5) < 0.085) & (((v - 0.78) * 128).astype(int) % 5 < 2) & (v > 0.84) & (v < 0.97)
            T[np.broadcast_to(lace, (128, 128))] = AC
    else:
        T[:] = UP
        T[(v < 0.12).repeat(128, 1)] = SO
        T[((v >= 0.12) & (v < 0.18)).repeat(128, 1)] = (246, 246, 244)
        T[((v >= 0.035) & (v < 0.05)).repeat(128, 1)] = (120, 112, 100)
        up_ = (v >= 0.2) & (v < 0.75)
        T[np.broadcast_to(up_ & (np.abs(u - 0.5) < 0.09), (128, 128))] = (214, 214, 210)
        T[np.broadcast_to(up_ & ((u < 0.06) | (u > 0.94)), (128, 128))] = (150, 150, 150)
        for c_ in (0.27, 0.73):
            st = up_ & (np.abs((u - c_) - 0.35 * (v - 0.45)) < 0.035) & (v > 0.3) & (v < 0.62)
            T[np.broadcast_to(st, (128, 128))] = AC
        top = v >= 0.78
        T[np.broadcast_to(top & (np.abs(u - 0.5) < 0.1), (128, 128))] = (225, 225, 222)
        lace = top & (np.abs(u - 0.5) < 0.085) & (((v - 0.78) * 128).astype(int) % 5 < 2) & (v > 0.84) & (v < 0.95)
        T[np.broadcast_to(lace, (128, 128))] = (70, 70, 76)
    im = bpy.data.images.new("shoe_tex", 128, 128)
    im.pixels = np.dstack([T[::-1].clip(0, 255) / 255.0, np.ones((128, 128))]).ravel()
    im.filepath_raw = path; im.file_format = "PNG"; im.save()
    return path


def mk_obj(name, verts, faces, fuv=None, groups=None, col=None, mat=None):
    m = bpy.data.meshes.new(name); m.from_pydata(verts, [], faces); m.update()
    bm_ = bmesh.new(); bm_.from_mesh(m); bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces); bm_.to_mesh(m); bm_.free()
    ul = m.uv_layers.new(name="UVMap")
    if fuv:
        for pi, poly in enumerate(m.polygons):
            uvs = dict(zip(faces[pi], fuv[pi]))
            for li, vi in zip(poly.loop_indices, poly.vertices):
                ul.data[li].uv = uvs[vi]
    o = bpy.data.objects.new(name, m); bpy.context.scene.collection.objects.link(o)
    for gname, idx_w in (groups or {}).items():
        g = o.vertex_groups.get(gname) or o.vertex_groups.new(name=gname)
        for i_, w_ in idx_w:
            g.add([i_], w_, "REPLACE")
    if mat is None and col is not None:
        mat = solid_mat(name, col)
    if mat is not None:
        m.materials.append(mat)
    for p in m.polygons:
        p.use_smooth = False
    return o


SOLIDS = {}


def solid_mat(tag, col):
    key = tuple(col)
    if key in SOLIDS:
        return SOLIDS[key]
    c = np.array(col, np.float32) / 255.0
    rng = np.random.default_rng(len(SOLIDS))
    px = np.clip(c[None, None, :] * (1 + 0.02 * rng.standard_normal((8, 8, 1))), 0, 1)
    im = bpy.data.images.new(f"{NAME}_solid{len(SOLIDS)}", 8, 8); im.pixels = np.dstack([px, np.ones((8, 8, 1))]).ravel(); im.pack()
    SOLIDS[key] = mat_img(f"{NAME}_solid{len(SOLIDS)}", im)
    return SOLIDS[key]


def sneaker(s_, smat):
    F = FOOT[s_]; heel, toe = F["heel"], F["toe"]
    d = np.array((toe[0] - heel[0], toe[1] - heel[1])); Lf = np.linalg.norm(d); d /= Lf; nrm = np.array((-d[1], d[0]))
    L = Lf + 0.075 * K; W = max(F["w"], 0.085 * K) + 0.02 * K; org = np.array((heel[0], heel[1])) - d * 0.03
    TS = [0.0, 0.08, 0.25, 0.45, 0.65, 0.82, 0.93, 1.0]; WF = [0.62, 0.86, 0.94, 1.0, 1.0, 0.9, 0.7, 0.32]
    HT = [0.105, 0.105, 0.098, 0.085, 0.066, 0.052, 0.044, 0.038]
    hk = {"boot": 1.45, "shoe": 0.82}.get(OPT["shoe"], 1.0) * max(K, 0.8); HT = [h * hk for h in HT]
    outline = [(t, +1, wf, h) for t, wf, h in zip(TS, WF, HT)] + [(t, -1, wf, h) for t, wf, h in zip(TS[::-1], WF[::-1], HT[::-1])]
    n = len(outline); rings = [(0.0, 1.03, 0.0), (0.03, 1.03, 0.12), (0.03, 1.0, 0.2), (None, 0.97, 0.55), (None, 0.6, 0.75)]
    verts, faces, fuv = [], [], []
    for z, ws, vv in rings:
        for t, sd, wf, h in outline:
            p2 = org + d * (t * L) + nrm * sd * wf * ws * W / 2
            verts.append((p2[0], p2[1], z if z is not None else (0.03 + (h - 0.03) * (0.6 if ws > 0.9 else 1.0))))
    per = np.cumsum([0] + [np.linalg.norm(np.array(verts[(k + 1) % n][:2]) - np.array(verts[k][:2])) for k in range(n)]); per /= per[-1]
    for r in range(len(rings) - 1):
        for k in range(n):
            k2 = (k + 1) % n; faces.append((r * n + k, r * n + k2, (r + 1) * n + k2, (r + 1) * n + k))
            u0, u1 = per[k], per[k + 1] if k + 1 < n else 1.0
            fuv.append([(u0, rings[r][2]), (u1, rings[r][2]), (u1, rings[r + 1][2]), (u0, rings[r + 1][2])])
    top = len(rings) - 1; half = n // 2
    for k in range(half - 1):
        faces.append((top * n + k, top * n + k + 1, top * n + (n - 2 - k), top * n + (n - 1 - k)))
        tv = lambda kk: 0.78 + 0.22 * TS[min(kk, half - 1)]  # noqa: E731
        fuv.append([(0.6, tv(k)), (0.6, tv(k + 1)), (0.4, tv(k + 1)), (0.4, tv(k))])
    faces.append(tuple(range(n))[::-1]); fuv.append([(0.5 + 0.4 * np.cos(2 * np.pi * k / n), 0.06 + 0.05 * np.sin(2 * np.pi * k / n)) for k in range(n)][::-1])
    return mk_obj(f"shoe_{s_}", verts, faces, fuv, {f"foot.{s_}": [(i, 1.0) for i in range(len(verts))]}, mat=smat)


smat = mat_img(NAME + "_shoe", shoe_texture(os.path.join(D, "shoe.png")))
EXTRA = [sneaker(s_, smat) for s_ in "LR"]


# ---- accessories (rigid, simple PS1 meshes)
def ring_mesh(rings_, n=12):
    """rings_: [(cx, cy, z, rx, ry)] bottom->top; returns verts, quad faces (open tube)."""
    vs, fs = [], []
    for cx_, cy_, z_, rx, ry in rings_:
        for k in range(n):
            a_ = 2 * math.pi * k / n; vs.append((cx_ + rx * math.cos(a_), cy_ + ry * math.sin(a_), z_))
    for r in range(len(rings_) - 1):
        for k in range(n):
            k2 = (k + 1) % n; fs.append((r * n + k, r * n + k2, (r + 1) * n + k2, (r + 1) * n + k))
    return vs, fs


ALLC = np.concatenate([np.array([v.co[:] for v in c.data.vertices]) for c in CLOTHES]) if CLOTHES else CO
ALLC = ALLC[np.abs(ALLC[:, 0]) < 0.19 * K]                                       # the torso / hips, not the hanging arms


def torso_front(z):
    sel = ALLC[(np.abs(ALLC[:, 2] - z) < 0.02) & (np.abs(ALLC[:, 0]) < 0.12 * K)]
    return sel[:, 1].min() if len(sel) else -0.12 * K


def girth(z, pts=ALLC):
    sel = pts[np.abs(pts[:, 2] - z) < 0.02]
    if not len(sel):
        return 0.0, 0.0, 0.17 * K, 0.11 * K
    return sel[:, 0].mean(), sel[:, 1].mean(), np.ptp(sel[:, 0]) / 2, np.ptp(sel[:, 1]) / 2


hv = CO[HEAD]; hx0, hx1 = hv[:, 0].min(), hv[:, 0].max(); hy0, hy1 = hv[:, 1].min(), hv[:, 1].max()
if HAIR is not None:
    hv2 = np.array([v.co[:] for v in HAIR.data.vertices]); hv2 = hv2[hv2[:, 2] > z_eye]
    hx0, hx1 = min(hx0, np.percentile(hv2[:, 0], 3)), max(hx1, np.percentile(hv2[:, 0], 97))
    hy0, hy1 = min(hy0, np.percentile(hv2[:, 1], 3)), max(hy1, np.percentile(hv2[:, 1], 97))
    Z_TOP = max(Z_TOP, np.percentile(hv2[:, 2], 99))

for key, flat in (("cap", 0.0), ("flatcap", 1.0)):
    if OPT.get(key) and HAIR is not None:                                      # hair under the cap: only below its band
        zcut = z_eye + (0.045 if flat else 0.06) * KN
        bmh = bmesh.new(); bmh.from_mesh(HAIR.data)
        bmesh.ops.delete(bmh, geom=[f for f in bmh.faces if f.calc_center_median().z > zcut], context="FACES")
        bmh.to_mesh(HAIR.data); bmh.free()
    if OPT.get(key):
        col = [float(x) for x in OPT[key].split(",")]
        cxh, cyh = (hx0 + hx1) / 2, (hy0 + hy1) / 2 + 0.004; rx, ry = (hx1 - hx0) / 2 + 0.008 * K, (hy1 - hy0) / 2 + 0.008 * K
        zb = z_eye + (0.045 if flat else 0.06) * KN; zt = Z_TOP + 0.01 * K - flat * 0.025 * K
        rings_ = [(cxh, cyh + flat * 0.01 * K, zb + (zt - zb) * t, rx * math.sqrt(max(1 - t * t, 0.02)) * (1 + flat * 0.06 * (1 - t)),
                   ry * math.sqrt(max(1 - t * t, 0.02)) * (1 + flat * 0.12 * (1 - t))) for t in (0, 0.35, 0.65, 0.88, 1.0)]
        vs, fs = ring_mesh(rings_); n = 12
        L_ = (0.075 if not flat else 0.045) * K; base = len(vs)
        for k in range(7):                                                   # the visor: a half disc at the front
            a_ = math.pi + math.pi * k / 6
            vs.append((cxh + rx * 1.02 * math.cos(a_), cyh + ry * math.sin(a_), zb))
            vs.append((cxh + rx * 0.9 * math.cos(a_), cyh + ry * math.sin(a_) - L_ * abs(math.sin(a_)) ** 0.5, zb - 0.012 * K))
        for k in range(6):
            fs.append((base + 2 * k, base + 2 * k + 2, base + 2 * k + 3, base + 2 * k + 1))
        EXTRA.append(mk_obj(key, vs, fs + [tuple(range(len(rings_) * n - n, len(rings_) * n))], groups={"head": [(i, 1.0) for i in range(len(vs))]}, col=col))

if OPT.get("glasses"):
    col = [float(x) for x in OPT["glasses"].split(",")]
    ey = hy0 - 0.008 * K; ez = z_eye + 0.006 * KN; ex = abs(B["eye.L"].head_local.x); w_, h_, t_ = 0.020 * K, 0.011 * K, 0.0016
    vs, fs = [], []

    def box(c, s):
        b0 = len(vs)
        for dz in (-1, 1):
            for dy in (-1, 1):
                for dx in (-1, 1):
                    vs.append((c[0] + dx * s[0], c[1] + dy * s[1], c[2] + dz * s[2]))
        fs.extend([(b0, b0 + 1, b0 + 3, b0 + 2), (b0 + 4, b0 + 6, b0 + 7, b0 + 5), (b0, b0 + 4, b0 + 5, b0 + 1),
                   (b0 + 2, b0 + 3, b0 + 7, b0 + 6), (b0, b0 + 2, b0 + 6, b0 + 4), (b0 + 1, b0 + 5, b0 + 7, b0 + 3)])
    for sx in (-1, 1):
        cx_ = sx * ex
        box((cx_, ey, ez + h_), (w_, t_, t_)); box((cx_, ey, ez - h_), (w_, t_, t_))
        box((cx_ - w_, ey, ez), (t_, t_, h_)); box((cx_ + w_, ey, ez), (t_, t_, h_))
        box((sx * (ex + w_ + 0.006 * K), (ey + hy1) / 2 - 0.02 * K, ez + h_ * 0.6), (t_, ((hy1 - ey) / 2 - 0.02 * K), t_))
    box((0, ey, ez + h_ * 0.5), (ex - w_, t_, t_ * 0.8))
    EXTRA.append(mk_obj("glasses", vs, fs, groups={"head": [(i, 1.0) for i in range(len(vs))]}, col=col))

Z_SH = B["upperarm01.L"].head_local.z
if OPT.get("badge"):
    col = [float(x) for x in OPT["badge"].split(",")]
    z_ = Z_SH - 0.11 * KS; y_ = torso_front(z_) - 0.004; x_ = 0.085 * K                  # the person's LEFT chest (+x), not mirrored
    vs = [(x_ + 0.022 * K * math.cos(a_), y_, z_ + 0.026 * K * math.sin(a_)) for a_ in np.linspace(0, 2 * math.pi, 7)[:-1]]
    EXTRA.append(mk_obj("badge", vs, [tuple(range(6))], groups={"spine02": [(i, 1.0) for i in range(6)]}, col=col))

if OPT.get("bag"):
    col = [float(x) for x in OPT["bag"].split(",")]
    zc = Z_WAIST - 0.02 * KS; gx, gy, rx, ry = girth(zc); x_ = -(rx + 0.055 * K); bw, bd, bh = 0.06 * K, 0.17 * K, 0.13 * K
    vs = []; fs = []
    for dz in (-1, 1):
        for dy in (-1, 1):
            for dx in (-1, 1):
                vs.append((x_ + dx * bw / 2, gy + dy * bd, zc + dz * bh))
    fs = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    gr = {"spine05": [(i, 1.0) for i in range(8)]}
    b0 = len(vs); pts = []                                                    # strap: right hip -> left shoulder, front and back
    for side in (-1, 1):
        for t in np.linspace(0, 1, 6):
            z_ = zc + bh + t * (Z_SH + 0.03 * KS - zc - bh); x2 = x_ + t * (0.14 * K - x_)
            _, gy2, _, ry2 = girth(z_); y2 = gy2 + side * (ry2 + 0.012 * K)
            pts.append((x2, y2, z_))
    for side in range(2):
        for t in range(6):
            p_ = pts[side * 6 + t]; vs += [(p_[0] - 0.02 * K, p_[1], p_[2] + 0.01), (p_[0] + 0.02 * K, p_[1], p_[2] - 0.01)]
        for t in range(5):
            i0 = b0 + side * 12 + 2 * t; fs.append((i0, i0 + 1, i0 + 3, i0 + 2))
    gr["spine02"] = [(i, 1.0) for i in range(b0, len(vs))]
    EXTRA.append(mk_obj("mailbag", vs, fs, groups=gr, col=col))

if OPT.get("coat") or OPT.get("apron"):
    pass

if OPT.get("coat"):                                                            # lab-coat skirt: a cloth tube waist -> knee
    col = [float(x) for x in OPT["coat"].split(",")]
    zs = np.linspace(Z_WAIST + 0.07 * KS, Z_KNEE + 0.0 * KS, 5)            # from above the shirt hem
    rings_ = []
    for j, z_ in enumerate(zs):
        gx, gy, rx, ry = girth(max(z_, Z_WAIST - 0.06 * KS))
        fl = 1 + 0.08 * j
        rings_.append((0.0, gy, z_, rx * fl + 0.015 * K, ry * fl + 0.02 * K))
    vs, fs = ring_mesh(rings_, 16)
    gr = {}
    for i, v_ in enumerate(vs):
        j = i // 16; t = j / 4.0
        side = "upperleg01.L" if v_[0] > 0 else "upperleg01.R"
        gr.setdefault("spine05", []).append((i, 1 - 0.6 * t)); gr.setdefault(side, []).append((i, 0.6 * t))
    EXTRA.append(mk_obj("coatskirt", vs, fs, groups=gr, col=col))

if OPT.get("apron"):
    col = [float(x) for x in OPT["apron"].split(",")]
    zs = np.linspace(Z_SH - 0.06 * KS, Z_KNEE - 0.02 * KS, 7); vs, fs = [], []
    for j, z_ in enumerate(zs):
        gx, gy, rx, ry = girth(min(z_, Z_SH - 0.08 * KS)); y_ = torso_front(min(z_, Z_WAIST)) - 0.012 * K if z_ > Z_WAIST else (gy - ry - 0.02 * K)
        hw = (0.10 if j == 0 else 0.17) * K
        for k in range(5):
            xk = -hw + 2 * hw * k / 4; vs.append((xk, y_ + 0.01 * K * (xk / hw) ** 2 * 3, z_))
    for j in range(6):
        for k in range(4):
            i0 = j * 5 + k; fs.append((i0, i0 + 1, i0 + 6, i0 + 5))
    gr = {}
    for i, v_ in enumerate(vs):
        if v_[2] > Z_WAIST:
            gr.setdefault("spine02" if v_[2] > Z_WAIST + 0.2 * KS else "spine04", []).append((i, 1.0))
        else:
            t = min(1.0, (Z_WAIST - v_[2]) / (Z_WAIST - Z_KNEE)); gr.setdefault("spine05", []).append((i, 1 - 0.5 * t))
            gr.setdefault("upperleg01.L" if v_[0] > 0 else "upperleg01.R", []).append((i, 0.5 * t))
    EXTRA.append(mk_obj("apron", vs, fs, groups=gr, col=col))

# ---- join everything into "<name>_body" (body first: slot 0 skin, slot 1 face), parented / deformed by the rig
parts = CLOTHES + ([HAIR] if HAIR else []) + EXTRA
for o in parts:
    for m_ in [m_ for m_ in o.modifiers]:
        o.modifiers.remove(m_)
    if o.parent:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    for u_ in o.data.uv_layers:
        u_.name = "UVMap" if u_ == o.data.uv_layers[0] else u_.name
bpy.ops.object.select_all(action="DESELECT")
for o in parts:
    o.select_set(True)
body.select_set(True); bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
me = body.data
for u_ in [u_ for u_ in me.uv_layers if u_.name not in ("UVMap", "proj")]:
    me.uv_layers.remove(u_)
me.uv_layers["UVMap"].active_render = True
if not any(m_.type == "ARMATURE" for m_ in body.modifiers):
    am = body.modifiers.new("Armature", "ARMATURE"); am.object = rig
body.parent = rig
for p in me.polygons:
    p.use_smooth = False
print(f"{NAME}: {len(me.polygons)} faces, {len(me.vertices)} verts, {len(me.materials)} mats; clothes {OPT['top']} hair {OPT['hair']}; "
      f"z_eye {z_eye:.3f} chin {z_chin:.3f} top {Z_TOP:.3f}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, NAME + ".blend"))

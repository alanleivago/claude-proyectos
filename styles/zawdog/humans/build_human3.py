"""Kit v5 human (2026-11-11, user correction of v4): the LOW-POLY single-mesh body again (~2.7k faces, PS1), with the
clothes PAINTED into its own MakeHuman-UV texture (garments.py: clean procedural garments coloured from the Flow outfit
sheet, never a camera projection) and the garment silhouette from the body itself (inflated torso / regular-fit legs),
so nothing can poke through; the v4 face (photo only in a soft face oval over a tone-matched real skin), a MakeHuman
hair mesh tinted, low-poly modelled accessories (temples-only glasses, caps, badge, mail bag + strap on the chest,
lab-coat flaps, apron) and one held prop per role (rigid on the right hand).
v4 notes (kept for the shared parts):
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
UD = (os.path.join(os.environ["APPDATA"], "Blender Foundation/Blender/5.2/mpfb/data") if os.name == "nt"
      else os.path.expanduser("~/Library/Application Support/Blender/5.2/mpfb/data"))
A = sys.argv[sys.argv.index("--") + 1:]
NAME = A[0]
OPT = dict(height=1.78, gender=1.0, muscle=0.55, weight=0.5, ratio=0.16, age=0.5, proportions=0.5, cupsize=0.5, race="",
           shoe="sneaker", upper="238,237,233", sole="186,176,160", accent="190,190,192", top="male_casualsuit06", hair="",
           inflate=0.012, prop="")
STR = ("race", "shoe", "upper", "sole", "accent", "top", "hair", "glasses", "cap", "flatcap", "badge", "bag", "coat", "apron", "prop")
OPT.update({k: (v if k in STR else float(v)) for k, v in (a.split("=", 1) for a in A[1:])})
K = OPT["height"] / 1.78
D = os.path.join(H, NAME)
FJ = json.load(open(os.path.join(D, "face.json")))
LOOK = json.load(open(os.path.join(D, "look.json")))
GARM = json.load(open(os.path.join(D, "garment.json")))
sys.path.insert(0, H)
import garments as GA  # noqa: E402

import importlib  # noqa: E402
import addon_utils  # noqa: E402
_MPFB = next(m.__name__ for m in addon_utils.modules() if m.__name__.endswith(".mpfb"))   # Mac: user_default, PC: blender_org
bpy.ops.preferences.addon_enable(module=_MPFB)
HumanService = importlib.import_module(_MPFB + ".services.humanservice").HumanService
TargetService = importlib.import_module(_MPFB + ".services.targetservice").TargetService

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



# ---- MakeHuman hair (fitted to the full basemesh while the helpers are still there)
HAIR = None
if OPT["hair"]:
    HAIR = HumanService.add_mhclo_asset(os.path.join(UD, "hair", OPT["hair"], OPT["hair"] + ".mhclo"), body, asset_type="Hair",
                                        subdiv_levels=0)
    strip_mods(HAIR)

# ---- body: drop the helper geometry, keep the eyeballs
gi = {g.name: g.index for g in body.vertex_groups}
keep_g = {gi["body"], gi["helper-l-eye"], gi["helper-r-eye"]}
bm = bmesh.new(); bm.from_mesh(body.data); dl = bm.verts.layers.deform.active; bm.verts.ensure_lookup_table()
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not any(g in keep_g and w > 0.5 for g, w in v[dl].items())], context="VERTS")
bm.to_mesh(body.data); bm.free()
strip_mods(body)
BONES = {b.name for b in rig.data.bones}
for o in [body] + ([HAIR] if HAIR else []):
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
    sk = nt.nodes.new("ShaderNodeTexImage"); sk.name = "skin"; sk.image = img_load(os.path.join(D, "body.png")); sk.interpolation = "Closest"
    for a_, b_ in ((up, ph), (up, mk), (uu, sk)):
        nt.links.new(a_.outputs[0], b_.inputs[0])
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"
    nt.links.new(mk.outputs[0], mx.inputs[0]); nt.links.new(sk.outputs[0], mx.inputs[6]); nt.links.new(ph.outputs[0], mx.inputs[7])
    flat_tree(m, type("o", (), {"outputs": [mx.outputs[2]]})())
    m["flat_ready"] = 1
    return m


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


# ---- garments painted into the body texture (garments.py) + the garment silhouette (vertex inflation)
GKEY = dict(top=dict(GARM.get("top", {})), bottom=dict(GARM.get("bottom", {})))
GKEY["top"].setdefault("col", LOOK["top"]); GKEY["top"].setdefault("inner", LOOK.get("inner", LOOK["top"]))
GKEY["bottom"].setdefault("col", LOOK["bottom"])
torso_pts = CO[np.isin(REG, ["torso"])]


def yc(zz):
    zs = np.linspace(0, Z_TOP, 60); ys = []
    for z_ in zs:
        sel = torso_pts[np.abs(torso_pts[:, 2] - z_) < 0.03]
        ys.append(sel[:, 1].mean() if len(sel) else (torso_pts[:, 1].mean()))
    return np.interp(zz, zs, ys)


legpts = CO[np.char.startswith(REG.astype(str), "leg")]
LM = dict(K=K, crotch=B["upperleg01.L"].head_local.z - 0.07 * KS, neck=B["neck01"].head_local.z, sh=B["upperarm01.L"].head_local.z, waist=B["upperleg01.L"].head_local.z + 0.06 * KS,
          knee=B["lowerleg01.L"].head_local.z, ankle=B["foot.L"].head_local.z + 0.035 * K, yc=yc,
          legx=float(np.median(np.abs(legpts[:, 0]))),
          arm={s: (tuple(B[f"upperarm01.{s}"].head_local), tuple(B[f"wrist.{s}"].head_local)) for s in "LR"})
import shutil
shutil.copy(os.path.join(D, "skin.png"), os.path.join(D, "body.png"))   # placeholder: painted after the decimation
OFF = GA.inflation(CO, REG, LM, GKEY)
for i, v in enumerate(me.vertices):
    if OFF[i] > 0:
        v.co += v.normal * float(OFF[i])
CO = np.array([v.co[:] for v in me.vertices])


me.materials.clear()
me.materials.append(mat_img(NAME + "_skin", os.path.join(D, "body.png"), uv="UVMap"))
me.materials.append(mat_face())
for p in me.polygons:
    p.material_index = 1 if p.index in FACE_SET else 0
    p.use_smooth = False



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


def decimate_un(o):
    """PS1 low poly by un-subdividing the MakeHuman quad grid once (~13.5k -> ~3.4k faces): the kept vertices keep
    their exact UVs, so the painted garment edges stay straight (a collapse decimation warps the UVs into zigzags)."""
    d = o.modifiers.new("dec", "DECIMATE"); d.decimate_type = "UNSUBDIV"; d.iterations = int(OPT.get("unsub", 1))
    o.modifiers.move(len(o.modifiers) - 1, 0)
    bpy.ops.object.select_all(action="DESELECT"); bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.modifier_apply(modifier="dec")


CO_D, REG_D = CO.copy(), REG.copy()
decimate_un(body) if OPT.get("unsub", 0) else decimate(body, OPT["ratio"], keep=[i for i in range(len(me.vertices)) if REG[i] in ("head", "eye") or (REG[i].startswith("arm") and CO[i][2] < LM["waist"] + 0.15 * KS)])


# ---- paint the garments on the FINAL low-poly faces (their own UVs: straight hems / sleeves, no decimation warp)
me = body.data
names = [g.name for g in body.vertex_groups]
vreg = []
for v in me.vertices:
    gs = sorted(((g.weight, names[g.group]) for g in v.groups), reverse=True)
    vreg.append(("eye" if gs[0][1].startswith("eye.") else region(gs[0][1])) if gs else "torso")
REG = np.array(vreg); CO = np.array([v.co[:] for v in me.vertices]); HEAD = np.isin(REG, ["head", "eye"])
S = 512
uvl = me.uv_layers["UVMap"]
tri_uv, tri_pos, tri_nrm, tri_reg = [], [], [], []
VN = np.array([v.normal[:] for v in me.vertices])
RCODE = np.array([GA.RC.get(r, 0) for r in REG], np.float32)
for p in me.polygons:
    li = list(p.loop_indices); vs = list(p.vertices)
    for k in range(1, len(vs) - 1):
        ids = (0, k, k + 1)
        tri_uv.append([tuple(uvl.data[li[i]].uv) for i in ids]); tri_pos.append([CO[vs[i]] for i in ids])
        tri_nrm.append([VN[vs[i]] for i in ids]); tri_reg.append([[RCODE[vs[i]]] for i in ids])
tri_uv = np.array(tri_uv, np.float32); tri_uv[..., 1] = 1 - tri_uv[..., 1]          # image rows from the top
(PM, NM, RM), COV, CORN = GA.raster(tri_uv, [np.array(tri_pos, np.float32), np.array(tri_nrm, np.float32), np.array(tri_reg, np.float32)], S)
flat_reg = np.array(tri_reg, np.float32).reshape(-1)
REGM = np.where(CORN >= 0, flat_reg[np.maximum(CORN, 0)], 0).astype(int)
skin_im = bpy.data.images.load(os.path.join(D, "skin.png")); skin_im.scale(S, S)
SK = (np.array(skin_im.pixels[:], np.float32).reshape(S, S, 4)[::-1, :, :3] * 255)
TEX = GA.paint(PM, NM, REGM, COV, SK, LM, GKEY)
TEX = GA.dilate(TEX, COV, 6)
TEX = TEX.reshape(S // 2, 2, S // 2, 2, 3).mean((1, 3))                             # 256 px PS1 texels
bim = next(im for im in bpy.data.images if os.path.basename(im.filepath) == "body.png")
bim.unpack(method="REMOVE") if bim.packed_file else None
bim.scale(S // 2, S // 2); bim.pixels = np.dstack([TEX[::-1] / 255.0, np.ones((S // 2, S // 2, 1))]).ravel()
bim.filepath_raw = os.path.join(D, "body.png"); bim.file_format = "PNG"; bim.save(); bim.pack()


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



# ---- accessories + props (rigid, low-poly)
TP = CO_D[np.isin(REG_D, ["torso"]) & (np.abs(CO_D[:, 0]) < 0.19 * K)]          # the dense (pre-decimation) body surface


def surf_y(x_, z_, back=False):
    for dz, dx in ((0.025, 0.03), (0.05, 0.06), (0.1, 0.2), (0.3, 1.0)):
        sel = TP[(np.abs(TP[:, 2] - z_) < dz) & (np.abs(TP[:, 0] - x_) < dx)]
        if len(sel):
            break
    if not len(sel):
        return float(TP[:, 1].min()) - 0.007
    return (sel[:, 1].max() + 0.007) if back else (sel[:, 1].min() - 0.007)


def girth(z_):
    for dz in (0.025, 0.05, 0.1, 0.3):
        sel = TP[np.abs(TP[:, 2] - z_) < dz]
        if len(sel) > 3:
            break
    return sel[:, 0].mean(), sel[:, 1].mean(), np.ptp(sel[:, 0]) / 2, np.ptp(sel[:, 1]) / 2


def boxv(c, ax, size):
    """8 verts + 6 quads of a box centred at c with axes ax (3 unit vectors) and half sizes."""
    vs = [tuple(Vector(c) + ax[0] * (sx * size[0]) + ax[1] * (sy * size[1]) + ax[2] * (sz * size[2]))
          for sz in (-1, 1) for sy in (-1, 1) for sx in (-1, 1)]
    return vs, [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]


def multi_box(name, parts, bone):
    vs, fs, mats = [], [], []
    for c, ax, size, col in parts:
        v_, f_ = boxv(c, ax, size); b0 = len(vs); vs += v_; fs += [tuple(i + b0 for i in f) for f in f_]; mats += [tuple(col)] * 6
    o = mk_obj(name, vs, fs, groups={bone: [(i, 1.0) for i in range(len(vs))]})
    for col in dict.fromkeys(mats):
        o.data.materials.append(solid_mat(name, col))
    keys = list(dict.fromkeys(mats))
    for pi, p in enumerate(o.data.polygons):
        p.material_index = keys.index(mats[pi])
    return o


hv = CO[HEAD]; hx0, hx1 = hv[:, 0].min(), hv[:, 0].max(); hy0, hy1 = hv[:, 1].min(), hv[:, 1].max()
Z_SH = B["upperarm01.L"].head_local.z; Z_WAIST = LM["waist"]; Z_KNEE = LM["knee"]
for key, flat in (("cap", 0.0), ("flatcap", 1.0)):
    if not OPT.get(key):
        continue
    zb = z_eye + (0.045 if flat else 0.06) * KN
    if HAIR is not None:                                                         # hair under the cap: only below its band
        bmh = bmesh.new(); bmh.from_mesh(HAIR.data)
        bmesh.ops.delete(bmh, geom=[f for f in bmh.faces if f.calc_center_median().z > zb], context="FACES")
        bmh.to_mesh(HAIR.data); bmh.free()
    col = [float(x) for x in OPT[key].split(",")]
    cxh, cyh = (hx0 + hx1) / 2, (hy0 + hy1) / 2 + 0.003; rx, ry = (hx1 - hx0) / 2 + 0.012 * K, (hy1 - hy0) / 2 + 0.012 * K
    zt = Z_TOP + (0.012 if not flat else 0.004) * K
    prof = (0, 0.4, 0.7, 0.9, 1.0)
    rings_ = [(cxh, cyh + flat * 0.008 * K * (1 - t_), zb + (zt - zb) * (t_ if not flat else t_ ** 0.7),
               rx * math.sqrt(max(1 - t_ * t_, 0.03)) * (1 + flat * 0.03), ry * math.sqrt(max(1 - t_ * t_, 0.03)) * (1 + flat * 0.07))
              for t_ in prof]
    vs, fs = ring_mesh(rings_, 10); n = 10
    Lb = (0.07 if not flat else 0.04) * K; base = len(vs)
    for k in range(7):
        a_ = math.pi + math.pi * k / 6
        vs.append((cxh + rx * 1.0 * math.cos(a_), cyh + ry * math.sin(a_), zb))
        vs.append((cxh + rx * 0.9 * math.cos(a_), cyh + ry * math.sin(a_) - Lb * abs(math.sin(a_)) ** 0.5, zb - (0.012 if not flat else 0.006) * K))
    for k in range(6):
        fs.append((base + 2 * k, base + 2 * k + 2, base + 2 * k + 3, base + 2 * k + 1))
    EXTRA.append(mk_obj(key, vs, fs + [tuple(range(len(rings_) * n - n, len(rings_) * n))], groups={"head": [(i, 1.0) for i in range(len(vs))]}, col=col))

if OPT.get("glasses"):                                                           # temples only: the front is the photo's
    col = [float(x) for x in OPT["glasses"].split(",")]; ex = abs(B["eye.L"].head_local.x)
    vs, fs = [], []
    for sx in (-1, 1):
        a0 = Vector((sx * (ex + 0.022 * K), hy0 + 0.006 * K, z_eye + 0.008 * KN)); a1 = Vector((sx * (ear_hw * 0.98), hy0 + 0.55 * (hy1 - hy0), z_eye - 0.004 * KN))
        v_, f_ = boxv((a0 + a1) / 2, [Vector((1, 0, 0)), (a1 - a0).normalized(), Vector((0, 0, 1))], (0.0018, (a1 - a0).length / 2, 0.0022))
        b0 = len(vs); vs += v_; fs += [tuple(i + b0 for i in f) for f in f_]
    EXTRA.append(mk_obj("glasses", vs, fs, groups={"head": [(i, 1.0) for i in range(len(vs))]}, col=col))

if OPT.get("badge"):
    col = [float(x) for x in OPT["badge"].split(",")]
    z_ = Z_SH - 0.11 * KS; x_ = 0.085 * K; y_ = surf_y(x_, z_) - 0.002          # the person's LEFT chest (+x)
    vs = [(x_ + 0.02 * K * math.cos(a_), y_, z_ + 0.024 * K * math.sin(a_)) for a_ in np.linspace(0, 2 * math.pi, 7)[:-1]]
    EXTRA.append(mk_obj("badge", vs, [tuple(range(6))], groups={"spine02": [(i, 1.0) for i in range(6)]}, col=col))

if OPT.get("bag"):
    col = [float(x) for x in OPT["bag"].split(",")]
    zc = Z_WAIST - 0.02 * KS; gx, gy, rx, ry = girth(zc); x_ = -(rx + 0.045 * K)
    parts_ = [((x_, gy, zc), [Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))], (0.03 * K, 0.16 * K, 0.12 * K), col),
              ((x_ - 0.032 * K, gy, zc + 0.07 * K), [Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))], (0.004, 0.16 * K, 0.05 * K), [c * 0.8 for c in col])]
    EXTRA.append(multi_box("mailbag", parts_, "spine05"))
    vs, fs, gr = [], [], {}
    for side in (False, True):                                                   # strap: right hip -> left shoulder, on the body
        b0 = len(vs)
        for k in range(8):
            t_ = k / 7; z_ = zc + 0.12 * K + t_ * (Z_SH + 0.02 * KS - zc - 0.12 * K); x2 = x_ + 0.02 * K + t_ * (0.12 * K - x_)
            y2 = surf_y(x2, z_, back=side)
            vs += [(x2 - 0.018 * K, y2, z_ + 0.012), (x2 + 0.018 * K, y2, z_ - 0.012)]
            bn = "spine05" if z_ < Z_WAIST + 0.05 else ("spine03" if z_ < Z_SH - 0.15 * KS else "spine01")
            gr.setdefault(bn, []).extend([(len(vs) - 2, 1.0), (len(vs) - 1, 1.0)])
        for k in range(7):
            i0 = b0 + 2 * k; fs.append((i0, i0 + 1, i0 + 3, i0 + 2))
    EXTRA.append(mk_obj("bagstrap", vs, fs, groups=gr, col=[c * 0.85 for c in col]))

if OPT.get("coat"):                                                              # lab-coat skirt: one closed low-poly tube;
    col = [float(x) for x in OPT["coat"].split(",")]                             # each side follows its thigh, blended at the seams
    gx, gy, rx, ry = girth(Z_WAIST - 0.06 * KS)
    zs = np.linspace(Z_WAIST + 0.02 * KS, Z_KNEE - 0.02 * KS, 4)
    rings_ = [(gx, gy, z_, (rx + 0.04 * K) * (1 + 0.15 * j), (ry + 0.055 * K) * (1 + 0.15 * j)) for j, z_ in enumerate(zs)]
    vs, fs = ring_mesh(rings_, 16); gr = {}
    for i_, v_ in enumerate(vs):
        j = i_ // 16; t_ = 0.9 * j / (len(zs) - 1)
        sL = float(np.clip(0.5 + (v_[0] - gx) / (rx * 0.9), 0, 1))
        gr.setdefault("spine05", []).append((i_, 1 - t_))
        if sL > 0:
            gr.setdefault("upperleg01.L", []).append((i_, t_ * sL))
        if sL < 1:
            gr.setdefault("upperleg01.R", []).append((i_, t_ * (1 - sL)))
    EXTRA.append(mk_obj("coatskirt", vs, fs, groups=gr, col=col))

if OPT.get("apron"):
    col = [float(x) for x in OPT["apron"].split(",")]
    zs = np.linspace(Z_SH - 0.07 * KS, Z_KNEE - 0.02 * KS, 7); vs, fs, gr = [], [], {}
    for j, z_ in enumerate(zs):
        hw = (0.10 if j == 0 else 0.18) * K
        for k in range(5):
            xk = -hw + 2 * hw * k / 4
            y_ = surf_y(xk * 0.7, max(z_, Z_WAIST - 0.04 * KS)) - (0.004 if z_ > Z_WAIST else 0.02 * K + 0.03 * K * (Z_WAIST - z_) / max(Z_WAIST - Z_KNEE, 0.1))
            vs.append((xk, y_, z_))
            if z_ > Z_WAIST:
                gr.setdefault("spine02" if z_ > Z_WAIST + 0.2 * KS else "spine04", []).append((len(vs) - 1, 1.0))
            else:
                w_ = min(1.0, (Z_WAIST - z_) / (Z_WAIST - Z_KNEE))
                gr.setdefault("spine05", []).append((len(vs) - 1, 1 - w_))
                gr.setdefault("upperleg01.L" if xk > 0 else "upperleg01.R", []).append((len(vs) - 1, w_))
    for j in range(6):
        for k in range(4):
            i0 = j * 5 + k; fs.append((i0, i0 + 1, i0 + 6, i0 + 5))
    EXTRA.append(mk_obj("apron", vs, fs, groups=gr, col=col))

# held prop (right hand, rigid on wrist.R): u = along the fingers, w = palm normal (toward the body), v = u x w
if OPT["prop"]:
    wh, wt = B["wrist.R"].head_local, B["wrist.R"].tail_local
    u = (wt - wh).normalized(); w = Vector((1, 0, 0)); w = (w - u * w.dot(u)).normalized(); v = u.cross(w)
    A0 = wt + u * 0.05 * K
    P = OPT["prop"]; parts_ = []
    if P == "clipboard":
        parts_ = [(A0 + u * 0.10 * K - w * 0.02, [u, v, w], (0.15 * K, 0.11 * K, 0.006), (120, 84, 52)),
                  (A0 + u * 0.11 * K - w * 0.027, [u, v, w], (0.13 * K, 0.095 * K, 0.002), (242, 242, 236)),
                  (A0 - u * 0.03 * K - w * 0.025, [u, v, w], (0.01, 0.04 * K, 0.008), (160, 160, 165))]
    elif P == "letters":
        parts_ = [(A0 + u * 0.03 * K - w * 0.018, [u, v, w], (0.09 * K, 0.055 * K, 0.012), (244, 242, 236)),
                  (A0 + u * 0.03 * K - w * 0.031, [u, v, w], (0.08 * K, 0.05 * K, 0.001), (220, 200, 160))]
    elif P == "parcel":
        parts_ = [(A0 + u * 0.13 * K - w * 0.02, [u, v, w], (0.11 * K, 0.15 * K, 0.10 * K), (176, 132, 84)),
                  (A0 + u * 0.13 * K - w * 0.02, [u, v, w], (0.112 * K, 0.02 * K, 0.102 * K), (210, 190, 150))]
    elif P == "spatula":
        parts_ = [(A0 + u * 0.06 * K, [u, v, w], (0.13 * K, 0.01, 0.008), (30, 30, 32)),
                  (A0 + u * 0.24 * K, [u, v, w], (0.06 * K, 0.045 * K, 0.003), (190, 190, 195))]
    elif P == "briefcase":
        parts_ = [(A0 + u * 0.03 * K, [u, v, w], (0.02 * K, 0.05 * K, 0.008), (30, 22, 18)),
                  (A0 + u * 0.20 * K, [u, v, w], (0.15 * K, 0.21 * K, 0.045 * K), (52, 36, 26)),
                  (A0 + u * 0.06 * K, [u, v, w], (0.004, 0.2 * K, 0.046 * K), (190, 170, 110))]
    elif P == "leash":
        parts_ = [(A0 + u * 0.01, [u, v, w], (0.05 * K, 0.012, 0.012), (200, 40, 40))]
        tip = Vector((wt.x, wt.y - 0.06, 0.25))                                       # the strap hangs to a clip near the floor
        mid = (A0 + tip) / 2; d_ = (tip - A0)
        parts_.append((mid, [d_.normalized(), Vector((0, 1, 0)).cross(d_.normalized()).normalized(), Vector((0, 1, 0))], (d_.length / 2, 0.006, 0.0025), (200, 40, 40)))
        parts_.append((tip, [Vector((1, 0, 0)), Vector((0, 1, 0)), Vector((0, 0, 1))], (0.012, 0.012, 0.02), (170, 170, 175)))
    if parts_:
        EXTRA.append(multi_box("prop_" + P, parts_, "wrist.R"))

# ---- join everything into "<name>_body" (body first: slot 0 body texture, slot 1 face), deformed by the rig
parts = ([HAIR] if HAIR else []) + EXTRA
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
print(f"{NAME}: {len(me.polygons)} faces, {len(me.vertices)} verts, {len(me.materials)} mats; garment {GKEY['top'].get('type')}/{GKEY['bottom'].get('type')} "
      f"hair {OPT['hair']} prop {OPT['prop']}; z_eye {z_eye:.3f} chin {z_chin:.3f} top {Z_TOP:.3f}")
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, NAME + ".blend"))


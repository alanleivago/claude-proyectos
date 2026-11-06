"""The Toilet That Killed 60 Nobles — punkpolyshorts #4 (Blender 5.2, EEVEE). Copied/adapted from lps-blind.
blender -b -P build.py -- --board [1,2,..]   -> review/board/raw/shot_XXa_#####.png (half res, raw; post.py --board adds dither + captions)
blender -b -P build.py -- --test [names]     -> test/selfcheck_*.png (cast + props isolated)
blender -b -P build.py -- --frames a,b       -> renders/frames/#####.png (full res)  [NOT run yet: board first]
Ten sets along +X (A void 0, B map 40, C red void 80, D throne 120 (+ horse field 140), E upper hall 160, F floor macro 200,
G cross-section 240, H pit 280, I exterior night 320, J modern bathroom 360). One shot per voice line,
CUT = round((start - 0.15) * 30). Every state is a function of the frame."""
import json
import math
import os
import sys

import bpy
import numpy as np
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lpskit as K  # noqa: E402
import photoprop as PP  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TIM = json.load(open(os.path.join(HERE, "voice", "timing.json")))
FPS = K.FPS
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
SHOT_RANGES = [(CUT[i], (CUT[i + 1] if i + 1 < len(CUT) else END)) for i in range(len(CUT))]
REF = os.path.join(HERE, "ref")
PROPS = os.path.join(HERE, "tex", "props")
PEOPLE = os.path.join(HERE, "tex", "people")
FACES = os.path.join(HERE, "tex", "faces")
MEDIEVAL = os.path.join(HERE, "tex", "medieval")


def wt(line, prefix, end=False):
    """Seconds into shot `line` (0-based) where the word starting with prefix is spoken."""
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-:").lower().startswith(prefix))
    return (w["e"] if end else w["s"]) - CUT[line] / FPS


sc = K.reset("#101014")
cam = K.camera("Cam", 35)
_mc = {}


def col(hexc, emit=False):
    k = (hexc, emit)
    if k not in _mc:
        _mc[k] = K.mat_color(f"c_{hexc}_{int(emit)}", hexc, emit_only=emit)
    return _mc[k]


def img(path):
    return bpy.data.images.load(path, check_existing=True)


def tinted(name, image, tint=(1, 1, 1), alpha=False):
    """mat_image with a multiply tint (night set)."""
    m = K.mat_image(name, image, alpha=alpha)
    nt = m.node_tree; t = next(n for n in nt.nodes if n.type == "TEX_IMAGE")
    mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs[0].default_value = 1.0
    mx.inputs[7].default_value = (*tint, 1)
    for l in list(t.outputs[0].links):
        to = l.to_socket; nt.links.remove(l); nt.links.new(mx.outputs[2], to)
    nt.links.new(t.outputs[0], mx.inputs[6])
    if alpha:
        m.surface_render_method = "DITHERED"
    return m


def egg(name, w, loc, frame="#2A1E14", rot=(math.pi / 2, 0, 0), border=0.04):
    """Framed easter-egg picture (tex/eggs, nearest). The frame box sits 2 cm behind the picture."""
    im = img(os.path.join(HERE, "tex/eggs", name + ".png")); h = w * im.size[1] / im.size[0]
    n = Matrix.Rotation(rot[2], 3, "Z") @ Vector((0, -1, 0))
    f = K.box("eggf_" + name, (w + 2 * border, 0.03, h + 2 * border), Vector(loc) - n * 0.02, col(frame))
    f.rotation_euler = (0, 0, rot[2])
    return K.plane("egg_" + name, w, h, loc, rot=rot, mat=K.mat_image("egg_" + name, im, emit_only=True))


def cutout(path, name, height, loc, rot=(math.pi / 2, 0, 0), tint=None):
    """Photo prop / set piece as an alpha cut-out plane (ONE Flow photo, magenta keyed by tex/despill.py)."""
    im = img(path); w = height * im.size[0] / im.size[1]
    m = tinted(name + "_m", im, tint, alpha=True) if tint else K.mat_image(name + "_m", im, alpha=True)
    m.surface_render_method = "DITHERED"
    return K.plane(name, w, height, loc, rot=rot, mat=m), w


def cross_cut(path, name, height, loc):
    """Two perpendicular cut-outs (the PS1 'X' prop) for things with legs (stool)."""
    a, w = cutout(path, name + "_a", height, (0, 0, height / 2))
    b, _ = cutout(path, name + "_b", height, (0, 0, height / 2), rot=(math.pi / 2, 0, math.pi / 2))
    root = K.link(bpy.data.objects.new(name, None)); root.location = loc
    a.parent = b.parent = root
    return root


def photobox(name, size, loc, front, top, yaw=0.0):
    """Box whose sides show the photo's front planks and whose top shows the lid (latrine from ONE Flow photo)."""
    o = K.box(name, size, loc)
    o.data.materials.append(K.mat_image(name + "_f", img(front))); o.data.materials.append(K.mat_image(name + "_t", img(top)))
    uv = o.data.uv_layers.active.data
    for p in o.data.polygons:
        p.material_index = 1 if p.normal.z > 0.5 else 0
        vs = [o.data.vertices[v].co for v in p.vertices]
        n = p.normal
        ax = (0, 1) if abs(n.z) > 0.5 else ((1, 2) if abs(n.x) > 0.5 else (0, 2))
        lo = [min(v[a] for v in vs) for a in ax]; hi = [max(v[a] for v in vs) for a in ax]
        for li, vi in zip(p.loop_indices, p.vertices):
            c = o.data.vertices[vi].co
            uv[li].uv = tuple((c[a] - l) / max(h - l, 1e-6) for a, l, h in zip(ax, lo, hi))
    o.rotation_euler = (0, 0, yaw)
    return o


def mat_glow(name, hexc, alpha):
    m = K.mat_color(name, hexc, emit_only=True); nt = m.node_tree
    out = next(n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"); em = next(n for n in nt.nodes if n.type == "EMISSION")
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); mx = nt.nodes.new("ShaderNodeMixShader"); mx.inputs[0].default_value = alpha
    nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(em.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], out.inputs[0])
    m.surface_render_method = "BLENDED"
    return m


def cone(name, r0, r1, h, loc, mat, seg=12):
    v = [(r0 * math.cos(2 * math.pi * i / seg), r0 * math.sin(2 * math.pi * i / seg), 0) for i in range(seg)] + \
        [(r1 * math.cos(2 * math.pi * i / seg), r1 * math.sin(2 * math.pi * i / seg), h) for i in range(seg)]
    f = [(i, (i + 1) % seg, seg + (i + 1) % seg, seg + i) for i in range(seg)] + [list(range(seg))[::-1], list(range(seg, 2 * seg))]
    return K.mesh_from(name, v, f, mat, loc)


wood = K.mat_image("planks", K.tex_planks("pl", base="#7A5230", seed=3))
stone = K.mat_image("stone", K.tex_tiles("st", px=64, tiles=4, a="#8A8478", b="#7A7468", grout="#4A463E", seed=5))
BEAM_IMG = img(os.path.join(REF, "beam_tex.png"))
beam_m = K.mat_image("beam", BEAM_IMG)


def beam(name, length, sec, loc, axis="X"):
    """A rotten oak beam: box with the Flow beam photo along its length."""
    s = (length, sec, sec) if axis == "X" else (sec, length, sec)
    o = K.box(name, s, loc, beam_m)
    uv = o.data.uv_layers.active.data
    for p in o.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c = o.data.vertices[vi].co
            a = c.x if axis == "X" else c.y
            uv[li].uv = (a / 1.6 + 0.5, 0.5 + (c.z + (c.y if axis == "X" else c.x)) / (2 * sec))     # repeats every 1.6 m: crisp grain
    return o


# ================================================================ A. VOID STAGE (x=0): toilet on a pedestal, 60 tiny nobles
AX = 0.0
K.box("A_floor", (30, 30, 0.1), (AX, 0, -0.05), col("#050506", True))
K.box("A_back", (30, 0.1, 30), (AX, 8, 5), col("#030304", True))
K.box("A_disc", (3.2, 3.2, 0.02), (AX, 0.6, 0.01), col("#5A5A66", True))
cone("A_ped", 0.42, 0.38, 0.55, (AX, 1.1, 0.0), stone, seg=8)
TOILET_A = photobox("toilet_A", (0.62, 0.42, 0.42), (AX, 1.1, 0.55 + 0.21), os.path.join(PROPS, "toilet_front.png"), os.path.join(PROPS, "toilet_top.png"))

# tiny crowd figures (cheap, 5 looks) ---------------------------------------------------------------
LOOKS = [dict(tunic="#2A50A0", cape="#C0A030", legs="#3A2A1C", hat="helmet"),
         dict(tunic="#A02028", cape="#202020", legs="#5A4030", hat="cap_red"),
         dict(tunic="#2E7A3A", cape="#E8E0C8", legs="#2A2A2A", hat="none"),
         dict(tunic="#6A3A8A", cape="#704828", legs="#3A3030", hat="helmet"),
         dict(tunic="#C8B890", cape="#902020", legs="#4A3A2A", hat="cap_blue")]
SKINS = ["#E0B090", "#C89070", "#F0C8A8", "#A87050"]


def tiny(name, look, loc, s=0.22, yaw=0.0, skin="#E0B090"):
    """One cheap low-poly crowd noble (~s m tall): legs, tunic, cape, head, hat/helmet."""
    L = LOOKS[look]; r = K.link(bpy.data.objects.new(name, None)); r.location = loc; r.rotation_euler = (0, 0, yaw)
    parts = [K.box(name + "_lg", (0.18 * s, 0.12 * s, 0.42 * s), (0, 0, 0.21 * s), col(L["legs"])),
             K.box(name + "_tu", (0.32 * s, 0.2 * s, 0.4 * s), (0, 0, 0.6 * s), col(L["tunic"])),
             K.box(name + "_cp", (0.34 * s, 0.04 * s, 0.5 * s), (0, 0.12 * s, 0.56 * s), col(L["cape"])),
             K.uv_sphere(name + "_hd", 0.12 * s, (0, 0, 0.92 * s), col(skin), seg=6, rings=4)]
    if L["hat"] == "helmet":
        parts.append(cone(name + "_hm", 0.13 * s, 0.02 * s, 0.16 * s, (0, 0, 0.95 * s), col("#9A9CA4"), seg=6))
    elif L["hat"].startswith("cap"):
        parts.append(K.box(name + "_hm", (0.2 * s, 0.2 * s, 0.07 * s), (0, 0, 1.04 * s), col("#B02020" if "red" in L["hat"] else "#2040A0")))
    for p in parts:
        p.parent = r
    return r


CROWD_A = []
rng = np.random.default_rng(11)
for j in range(6):
    for i in range(10):
        x = AX - 0.99 + i * 0.22 + rng.uniform(-0.02, 0.02); y = 0.45 - j * 0.2
        CROWD_A.append(tiny(f"tA{j}{i}", int(rng.integers(5)), (x, y, 0.02), s=0.2, yaw=rng.uniform(-0.3, 0.3), skin=SKINS[int(rng.integers(4))]))
T60 = K.Letters3D("t60", "60", size=0.6, seed=4, front="#FFE21A", side="#C89A00")

# ================================================================ B. MAP (x=40): parchment of the Empire, pin on Erfurt
BX = 40.0
MAP_IMG = img(os.path.join(REF, "map.jpg")); MW = 3.0; MH = MW * MAP_IMG.size[1] / MAP_IMG.size[0]
MAP = K.plane("map", MW, MH, (BX, 0, 0), rot=(0, 0, 0), mat=K.mat_image("map_m", MAP_IMG))
K.box("B_table", (MW + 1.2, MH + 1.2, 0.1), (BX, 0, -0.06), K.mat_image("tablewood", K.tex_planks("tw", base="#5A3A20", seed=9)), uv_scale=0.6)
ERFURT = Vector((BX + (0.527 - 0.5) * MW, (0.5725 - 0.5) * MH, 0.0))
PIN = K.link(bpy.data.objects.new("pin", None))
K.box("pin_needle", (0.012, 0.012, 0.22), (0, 0, 0.11), col("#C8C8D0")).parent = PIN
K.uv_sphere("pin_head", 0.05, (0, 0, 0.24), col("#E02020"), seg=8, rings=6).parent = PIN
T1184 = K.Letters3D("t1184", "1184", size=0.4, seed=7, front="#F4E6C0", side="#8A6A3A")

# ================================================================ C. RED ABSTRACT VOID (x=80): tug-of-war over a chunk of land
CXX = 80.0
K.box("C_bg", (40, 0.1, 40), (CXX, 9, 2), col("#B01818", True))
K.box("C_floor", (40, 40, 0.1), (CXX, 0, -0.05), col("#8A1010", True))
CHUNK = K.link(bpy.data.objects.new("chunk", None)); CHUNK.location = (CXX, 0.6, 1.25)


def terrain_chunk():
    n = 6; s = 0.9; v = []; f = []
    r = np.random.default_rng(4)
    hgt = r.uniform(0.0, 0.12, (n + 1, n + 1)); hgt[2:5, 2:5] += 0.08
    for j in range(n + 1):
        for i in range(n + 1):
            v.append(((i / n - 0.5) * s, (j / n - 0.5) * s, hgt[j, i]))
    for j in range(n):
        for i in range(n):
            a = j * (n + 1) + i; f.append((a, a + 1, a + n + 2, a + n + 1))
    top = K.mesh_from("chunk_top", v, f, col("#4E9A3A")); top.parent = CHUNK
    for p in top.data.polygons:
        p.use_smooth = False
    dirt = cone("chunk_dirt", 0.62, 0.12, -0.55, (0, 0, 0.0), col("#6A4428"), seg=7); dirt.parent = CHUNK
    dirt.scale = (1, 1, 1)
    for k, (x, y) in enumerate(((-0.25, 0.2), (0.22, -0.18), (-0.1, -0.28))):        # little trees
        cone(f"tree{k}", 0.09, 0.0, 0.26, (x, y, 0.1), col("#2A6A2A"), seg=5).parent = CHUNK
        K.box(f"trunk{k}", (0.03, 0.03, 0.08), (x, y, 0.08), col("#5A3A20")).parent = CHUNK
    K.box("keep", (0.14, 0.14, 0.22), (0.12, 0.15, 0.2), stone).parent = CHUNK           # a tiny castle
    cone("keep_roof", 0.12, 0.0, 0.12, (0.12, 0.15, 0.31), col("#3A3A50"), seg=4).parent = CHUNK


terrain_chunk()
ROPES = [K.box(f"rope{i}", (0.03, 0.03, 1.0), (0, 0, -50), col("#C8A870")) for i in range(2)]

# ================================================================ D. THRONE ROOM (x=120) + horse field (x=140)
DX = 120.0
K.box("D_floor", (10, 10, 0.1), (DX, 0, -0.05), K.mat_image("Dfl", K.tex_tiles("dfl", a="#6A5A48", b="#5A4C3C", grout="#2A241C", tiles=2)), uv_scale=0.5)
K.box("D_back", (10, 0.3, 6), (DX, 2.5, 3), stone, uv_scale=0.6)
K.box("D_left", (0.3, 10, 6), (DX - 3.5, 0, 3), stone, uv_scale=0.6)
K.box("D_right", (0.3, 10, 6), (DX + 3.5, 0, 3), stone, uv_scale=0.6)
K.box("D_carpet", (1.4, 6, 0.02), (DX, -1.0, 0.01), col("#9A1820"))
for i, x in enumerate((-2.2, 2.2)):
    K.box(f"banner{i}", (0.8, 0.04, 2.2), (DX + x, 2.33, 3.1), col("#B01C20"))
    K.box(f"banner_s{i}", (0.25, 0.05, 2.2), (DX + x, 2.31, 3.1), col("#E0B030"))
THRONE, TW = cutout(os.path.join(REF, "throne_cut.png"), "throne", 1.9, (DX + 0.6, 1.92, 0.18 + 0.95))
K.box("throne_body", (TW * 0.8, 0.4, 0.95), (DX + 0.6, 2.13, 0.18 + 0.47), col("#4A2A16"))
egg("snail", 1.1, (DX - 3.33, -2.7, 2.0), rot=(math.pi / 2, 0, math.pi / 2), frame="#B08A3A")
egg("grossup_jester", 0.7, (DX + 2.65, 2.34, 1.7), frame="#B08A3A")
FX = 140.0                                                     # horse field
K.box("F_ground", (30, 30, 0.1), (FX, 0, -0.05), K.mat_image("grass", K.tex_noise("gr", base="#4A8A34", amp=14)), uv_scale=0.4)
K.plane("F_sky", 40, 22, (FX, 10, 8), mat=K.mat_image("sky", K.tex_sky("sky")))
HORSE, HW = cutout(os.path.join(REF, "horse_cut.png"), "horse", 1.7, (FX, 0.0, 0.85))

# ================================================================ E. UPPER HALL (x=160): timber room, stone window niche, beams
EX = 160.0
NY = 3.0                                                       # back wall inner face
E_FLOOR = K.box("E_floor", (9, 6.5, 0.12), (EX, 0, -0.06), wood, uv_scale=0.8)
E_PIT = K.box("E_pit", (12, 12, 0.1), (EX, 0, -6.0), K.mat_image("sludgeE", K.tex_noise("slE", base="#4A3418", amp=18)), uv_scale=0.3)
E_PIT_WALLS = [K.box(f"E_pw{i}", s, l, stone, uv_scale=0.6) for i, (s, l) in enumerate((((9, 0.2, 6), (EX, -3.3, -3)), ((0.2, 6.5, 6), (EX - 4.5, 0, -3)), ((0.2, 6.5, 6), (EX + 4.5, 0, -3))))]
plank_wall = K.mat_image("Ewall", K.tex_planks("ew", base="#8A6038", seed=12))
for nm, s, l in (("bl", (3.6, 0.8, 4), (EX - 2.7, NY + 0.4, 2)), ("br", (3.6, 0.8, 4), (EX + 2.7, NY + 0.4, 2)),
                 ("bb", (1.8, 0.8, 0.45), (EX, NY + 0.4, 0.225)), ("bt", (1.8, 0.8, 1.4), (EX, NY + 0.4, 3.3)),
                 ("l", (0.2, 6.5, 4), (EX - 4.5, 0, 2)), ("r", (0.2, 6.5, 4), (EX + 4.5, 0, 2)), ("f", (9, 0.2, 4), (EX, -3.3, 2))):
    K.box("E_w" + nm, s, l, stone if nm.startswith("b") else plank_wall, uv_scale=0.8)
NICHE_SEAT = K.box("E_seat", (1.6, 0.6, 0.06), (EX, NY + 0.32, 0.47), stone, uv_scale=1.2)
K.box("E_niche_l", (0.06, 0.8, 2.15), (EX - 0.9, NY + 0.4, 1.52), stone)
K.box("E_niche_r", (0.06, 0.8, 2.15), (EX + 0.9, NY + 0.4, 1.52), stone)
E_SKY = K.plane("E_sky", 1.8, 2.2, (EX, NY + 0.95, 1.5), mat=K.mat_image("Esky", K.tex_sky("esky", top="#4A80D0", bot="#C8E0F8")))
iron = col("#2A2A2E")
BAR_Z = 2.05
for i in range(5):
    K.box(f"bar{i}", (0.035, 0.035, 2.0), (EX - 0.6 + 0.3 * i, NY + 0.72, 1.55), iron)
CROSSBAR = K.box("crossbar", (1.6, 0.04, 0.04), (EX, NY + 0.72, BAR_Z), iron)
K.box("E_ceil", (9, 6.5, 0.1), (EX, 0, 4.0), col("#3A2818"))
E_BEAMS = [beam(f"E_beam{i}", 9, 0.28, (EX, -2.2 + 1.5 * i, 3.8)) for i in range(4)]
for i, (x, c) in enumerate(((-3.2, "#B01C20"), (3.2, "#1C3A90"))):
    K.box(f"Eban{i}", (0.7, 0.04, 1.6), (EX + x, NY - 0.02, 2.9), col(c))
    K.box(f"Eban_s{i}", (0.18, 0.05, 1.6), (EX + x, NY - 0.04, 2.9), col("#E0B030"))
egg("drake", 0.75, (EX - 2.3, NY - 0.02, 2.0))
egg("comic", 1.3, (EX + 2.5, NY - 0.02, 1.85), frame="#5A3A22")
egg("grossup_monk", 0.6, (EX - 4.38, -0.6, 2.0), rot=(math.pi / 2, 0, math.pi / 2), frame="#B08A3A")
egg("buttons", 0.5, (EX + 4.38, 0.8, 1.9), rot=(math.pi / 2, 0, -math.pi / 2))
E_PROPS = [PP.loft(os.path.join(REF, "barrel.jpg"), "barrelE1", height=0.9, sides=10, loc=(EX + 1.6, 1.9, 0)),
           PP.loft(os.path.join(REF, "barrel.jpg"), "barrelE2", height=0.9, sides=10, loc=(EX + 2.25, 2.2, 0)),
           PP.loft(os.path.join(REF, "goblet.jpg"), "gobE1", height=0.2, sides=8, loc=(EX + 1.55, 1.85, 0.9)),
           PP.loft(os.path.join(REF, "goblet.jpg"), "gobE2", height=0.2, sides=8, loc=(EX + 2.3, 2.25, 0.9)),
           cross_cut(os.path.join(REF, "stool_cut.png"), "stoolE", 0.48, (EX - 2.4, 1.4, 0))]

# ================================================================ F. MACRO INSIDE THE FLOOR (x=200): giant boards, worm, crack
FMX = 200.0
for i in range(5):
    beam(f"F_board{i}", 14, 0.5, (FMX, -1.2 + i * 0.62, 1.4), axis="X").scale = (1, 1.05, 0.5)
F_JOIST = beam("F_joist", 14, 0.9, (FMX, 0.9, 0.55), axis="X")
K.box("F_dark", (30, 30, 0.1), (FMX, 0, -0.3), col("#0A0806", True))
CRACK = K.box("crack", (0.06, 1.0, 0.04), (0, 0, -50), col("#0A0604", True))
# woodworm: fat ribbed cream larva, brown head with mandibles (faceted spheres, alternating shades = segments)
WORM = [K.uv_sphere(f"worm{i}", 0.07 - 0.005 * i, (0, 0, -50), col("#F2E2B8" if i % 2 else "#DCC898"), seg=8, rings=5) for i in range(9)]
WORM_HEAD = K.link(bpy.data.objects.new("worm_head", None))
K.uv_sphere("worm_hd", 0.06, (0, 0, 0), col("#7A3A14"), seg=7, rings=5).parent = WORM_HEAD
for sx in (-1, 1):
    cone(f"mand{sx}", 0.012, 0.0, 0.05, (sx * 0.025, -0.05, -0.01), col("#2A1408"), seg=4).parent = WORM_HEAD
    WORM_HEAD.children[-1].rotation_euler = (math.radians(100), 0, sx * 0.4)
rf = np.random.default_rng(31)
HOLES = []
for i in range(16):                                              # bore holes: dark discs with a pale powder rim
    x, y = FMX - 1.6 + rf.uniform(0, 3.2), 0.9 + rf.uniform(-0.4, 0.4)
    HOLES.append(cone(f"hole{i}", 0.04, 0.04, 0.003, (x, y, 1.0), col("#0A0602", True), seg=7))
    cone(f"holerim{i}", 0.06, 0.06, 0.002, (x, y, 0.999), col("#D8C8A0"), seg=7)
for i in range(40):                                              # sawdust / frass
    K.box(f"frass{i}", (0.015, 0.015, 0.01), (FMX - 1.6 + rf.uniform(0, 3.2), 0.9 + rf.uniform(-0.45, 0.45), 1.003), col("#E8D8A8"))
for i in range(9):                                               # rot: pale fungus brackets + soft dark blotches on the joist
    x = FMX - 1.4 + i * 0.36 + rf.uniform(-0.1, 0.1); side = 1 if i % 2 else -1
    br = K.uv_sphere(f"fungus{i}", 0.09 + 0.04 * rf.random(), (x, 0.9 + side * 0.47, 0.75 + rf.uniform(-0.15, 0.1)), col(("#E8E0C0", "#C8B890", "#B0A070")[i % 3]), seg=7, rings=4)
    br.scale = (1.3, 0.6, 0.35)
    K.box(f"rotpatch{i}", (0.28, 0.3, 0.004), (x + 0.1, 0.9 + rf.uniform(-0.3, 0.3), 1.0015), col("#3A2A14"))
for i in range(8):                                               # splinters lifting off the cracked top
    sp = K.box(f"splint{i}", (0.3, 0.025, 0.02), (FMX - 0.4 + i * 0.12, 0.9 + rf.uniform(-0.1, 0.1), 1.02), col("#A07848"))
    sp.rotation_euler = (0, math.radians(rf.uniform(-12, 12)), rf.uniform(-0.6, 0.6))
CRACK2 = K.box("crack2", (0.03, 1.0, 0.05), (0, 0, -50), col("#000000", True))

# ================================================================ G. CROSS-SECTION (x=240): diagram cutaway, floors fold down
GX = 240.0
K.box("G_bg", (30, 0.1, 30), (GX, 1.0, 3), col("#E8DEC4", True))
gw = col("#B89A70"); gl = col("#6A4A2A")
K.box("G_wallL", (0.25, 0.4, 5.0), (GX - 2.0, 0, 2.5), gw); K.box("G_wallR", (0.25, 0.4, 5.0), (GX + 2.0, 0, 2.5), gw)
cone("G_roof", 2.9, 0.0, 1.6, (GX, 0, 5.0), col("#5A4A6A"), seg=4).rotation_euler = (0, 0, math.pi / 4)
K.box("G_ground", (8, 0.4, 0.2), (GX, 0, -0.1), col("#7A6A4A"))
K.box("G_pit", (3.2, 0.36, 1.6), (GX, 0, -0.95), col("#5A3A10", True))
K.box("G_pitline", (3.4, 0.38, 0.06), (GX, 0, -0.17), col("#3A2A10"))
K.box("G_dirt", (8, 0.38, 3.0), (GX, 0.02, -1.6), col("#9A8460"))
CESS = K.text3d("cesspit", "CESSPIT", size=0.55, extrude=0.04, front="#F4E8C8", side="#3A2A10", font=K.FONT_BOLD, loc=(GX, -0.24, -0.95))
SLABS = {}
G_FIGS = []
for lvl, z in (("up", 2.6), ("gr", 0.15)):
    for side in (-1, 1):
        piv = K.link(bpy.data.objects.new(f"G_{lvl}{side}", None)); piv.location = (GX + side * 1.87, 0, z)
        s = K.box(f"G_slab_{lvl}{side}", (1.87, 0.36, 0.14), (-side * 0.935, 0, 0), gl); s.parent = piv
        SLABS[(lvl, side)] = piv
        for i in range(5):                                      # tiny people on that half
            t_ = tiny(f"tG{lvl}{side}{i}", (i + (2 if lvl == "gr" else 0)) % 5, (GX + side * 1.87 - side * (0.25 + 0.34 * i), -0.02, z + 0.07), s=0.42, skin=SKINS[i % 4])
            G_FIGS.append((t_, lvl, side, i, Vector(t_.location)))       # free figures: they tumble and fall with the floor
G_NICHE = K.box("G_niche", (0.3, 0.42, 0.6), (GX - 1.86, 0, 3.05), col("#8A7A60"))

# ================================================================ H. TOP-DOWN PIT (x=280): sludge, helmets, cape, bubbles, fly
HX = 280.0


def sludge_mesh():
    """Faceted low-poly muck: a 28x28 grid with lumps, flat-shaded, chunky brown-green PS1 texture."""
    n = 28; size = 15.0; r = np.random.default_rng(12); v = []; f = []; uvs = []
    hgt = r.random((n + 1, n + 1))
    for _ in range(2):                                           # box blur (no scipy in Blender's python)
        hgt = (hgt + np.roll(hgt, 1, 0) + np.roll(hgt, -1, 0) + np.roll(hgt, 1, 1) + np.roll(hgt, -1, 1)) / 5
    hgt = (hgt - hgt.mean()) / hgt.std() * 0.09
    for j in range(n + 1):
        for i in range(n + 1):
            v.append(((i / n - 0.5) * size, (j / n - 0.5) * size, hgt[j, i])); uvs.append((i / n * 4, j / n * 4))
    for j in range(n):
        for i in range(n):
            a = j * (n + 1) + i; f.append((a, a + 1, a + n + 2, a + n + 1))
    o = K.mesh_from("sludge", v, f, loc=(HX, 0, 0))
    uv = o.data.uv_layers.new()
    for p in o.data.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            uv.data[li].uv = uvs[vi]
    t = np.zeros((32, 32, 3)); rr = np.random.default_rng(3)
    base = np.array([[58, 46, 20], [74, 60, 26], [92, 76, 34], [48, 52, 22], [110, 92, 44]])
    t[:] = base[rr.integers(0, 5, (32, 32))]
    o.data.materials.append(K.mat_image("sludge_m", K.image_from_array("sludge_t", t.astype(np.uint8))))
    return o


SLUDGE = sludge_mesh()
for i in range(30):                                              # muck lumps
    lm = K.uv_sphere(f"lump{i}", rh_ := 0.15 + 0.25 * np.random.default_rng(i).random(), (HX + np.random.default_rng(i + 50).uniform(-6, 6), np.random.default_rng(i + 90).uniform(-6, 6), 0.0),
                     col(("#4A3A18", "#5E4A20", "#3A3414")[i % 3]), seg=6, rings=4)
    lm.scale = (1.4, 1.0, 0.4)
K.box("H_rimN", (16, 1.0, 1.0), (HX, 7.4, 0.3), stone, uv_scale=0.5)
K.box("H_rimS", (16, 1.0, 1.0), (HX, -7.4, 0.3), stone, uv_scale=0.5)
K.box("H_rimW", (1.0, 16, 1.0), (HX - 7.4, 0, 0.3), stone, uv_scale=0.5)
K.box("H_rimE", (1.0, 16, 1.0), (HX + 7.4, 0, 0.3), stone, uv_scale=0.5)
rh = np.random.default_rng(8)
FLOATS = []
for i in range(22):                                             # helmets, hats, boots, capes, broken boards, a goblet, straw
    x, y = rh.uniform(-5, 5), rh.uniform(-5, 5); k_ = i % 7
    if k_ == 0:
        o = K.uv_sphere(f"helm{i}", 0.3, (HX + x, y, 0.0), col("#9A9CA4"), seg=8, rings=4); o.scale = (1, 1, 0.6)
    elif k_ == 1:
        o = K.box(f"board{i}", (1.8, 0.35, 0.1), (HX + x, y, 0.04), wood); o.rotation_euler = (0, 0, rh.uniform(0, 3))
    elif k_ == 2:
        o = K.box(f"cape{i}", (1.2, 1.0, 0.03), (HX + x, y, 0.03), col(("#B01C20", "#1C3A90", "#2E7A3A")[i % 3])); o.rotation_euler = (0.05, 0.05, rh.uniform(0, 3))
    elif k_ == 3:                                               # floating hat: brim + crown
        o = cone(f"hat{i}", 0.3, 0.28, 0.04, (HX + x, y, 0.02), col(("#5A1E6A", "#1C3A90", "#5A3E26")[i % 3]), seg=8)
        cone(f"hatc{i}", 0.17, 0.13, 0.16, (0, 0, 0.03), col(("#5A1E6A", "#1C3A90", "#5A3E26")[i % 3]), seg=8).parent = o
    elif k_ == 4:                                               # boot (photo cut-out, lying on its side)
        o, _ = cutout(os.path.join(REF, "boot_cut.png"), f"boot{i}", 0.6, (HX + x, y, 0.05), rot=(0, 0, rh.uniform(0, 3)))
    elif k_ == 5:
        o = PP.loft(os.path.join(REF, "goblet.jpg"), f"pgob{i}", height=0.35, sides=8, loc=(HX + x, y, -0.05)); o.rotation_euler = (1.2, 0, rh.uniform(0, 3))
    else:
        o = K.box(f"pstraw{i}", (0.8, 0.05, 0.03), (HX + x, y, 0.03), col("#D8B850")); o.rotation_euler = (0, 0, rh.uniform(0, 3))
    FLOATS.append((o, Vector(o.location)))
BUBBLES = [K.uv_sphere(f"bub{i}", 0.14, (HX + rh.uniform(-5, 5), rh.uniform(-5, 5), 0.0), col("#9A7A3A"), seg=7, rings=4) for i in range(16)]
H_LEDGE = K.box("H_ledge", (4.0, 1.4, 0.7), (HX + 0.3, -1.45, -0.05), stone, uv_scale=1.0)       # stone edge he climbs onto (s10)
NAME = K.Letters3D("name_lg", "LANDGRAVE\nLOUIS III", size=0.22, front="#F4E8C8", side="#7A2018", seed=12, jitter=0.4)
FLY = K.link(bpy.data.objects.new("fly", None)); FLY.scale = (3, 3, 3)
K.uv_sphere("fly_b", 0.05, (0, 0, 0), col("#101010"), seg=6, rings=4).parent = FLY
for sx in (-1, 1):
    K.plane(f"fly_w{sx}", 0.07, 0.04, (sx * 0.05, 0, 0.03), rot=(0, 0, 0), mat=mat_glow(f"flyw{sx}", "#D0E0F0", 0.6)).parent = FLY
TALLY = K.plane("tally", 0.32, 0.2, (0, 0, -50), mat=K.mat_image("tally_m", img(os.path.join(PROPS, "tally_0.png")), emit_only=True))
TALLY_IMGS = {n: img(os.path.join(PROPS, f"tally_{n}.png")) for n in list(range(0, 61, 3)) + ["final"]}
DRIPS = [K.box(f"drip{i}", (0.02, 0.02, 0.05), (0, 0, -50), col("#5A4218")) for i in range(8)]

# ================================================================ I. EXTERIOR AT NIGHT (x=320): facade, two hanging, ladder
IX = 320.0
NIGHT = (0.42, 0.48, 0.78)
FAC_H = 11.0
FACADE, FAC_W = cutout(os.path.join(REF, "facade_cut.png"), "facade", FAC_H, (IX, 0.0, FAC_H / 2), tint=NIGHT)
K.box("facade_body", (FAC_W * 0.8, 6, FAC_H * 0.6), (IX, 3.05, FAC_H * 0.3), tinted("fbody", K.tex_tiles("fb", a="#6A645A", b="#5E584E", grout="#3A3630"), NIGHT))
K.plane("I_sky", 80, 40, (IX, 20, 12), mat=col("#0C1430", True))
K.uv_sphere("moon", 1.2, (IX - 9, 19, 17), col("#F0EED8", True), seg=10, rings=6)
K.box("I_ground", (60, 40, 0.1), (IX, 0, -0.05), tinted("Igr", K.tex_noise("igr", base="#3A3A2A", amp=12), NIGHT))
SILL_Z = FAC_H * 0.47
SILL = K.box("sill", (1.6, 0.35, 0.14), (IX, -0.18, SILL_Z), tinted("sillm", K.tex_noise("sl", base="#8A8478", amp=10), NIGHT))
LADDER, LAD_W = cutout(os.path.join(REF, "ladder_cut.png"), "ladder", 9.0, (0, 0, -50), tint=(0.75, 0.75, 0.9))
LADDER.scale = (0.32, 1, 1); LAD_W *= 0.32                     # a narrow ladder, absurdly long
TORCH = K.uv_sphere("torch", 0.12, (0, 0, -50), col("#FFB030", True), seg=6, rings=4)

# ================================================================ J. MODERN BATHROOM (x=360)
JX = 360.0
tile = K.mat_image("Jtiles", K.tex_tiles("jt", a="#EEF2F2", b="#EEF2F2", grout="#9AA4A8"))
K.box("J_back", (5, 0.1, 3), (JX, 1.4, 1.5), tile, uv_scale=2)
K.box("J_left", (0.1, 5, 3), (JX - 1.8, -0.5, 1.5), tile, uv_scale=2)
K.box("J_right", (0.1, 5, 3), (JX + 1.8, -0.5, 1.5), tile, uv_scale=2)
K.box("J_ceil", (5, 5, 0.1), (JX, -0.5, 3.0), col("#E8ECEE"))
jfl = K.mat_image("Jfloor", K.tex_tiles("jf", px=64, tiles=2, a="#3C4CA0", b="#E8E8F0", grout="#20283C"))
for j in range(8):
    for i in range(8):
        if (i, j) != (4, 2):
            K.box(f"Jft{i}{j}", (0.5, 0.5, 0.06), (JX - 2.0 + 0.5 * i + 0.25, -2.6 + 0.5 * j + 0.25, -0.03), jfl, uv_scale=2)
CREAK_TILE = K.box("Jft_creak", (0.5, 0.5, 0.06), (JX - 2.0 + 0.5 * 4 + 0.25, -2.6 + 0.5 * 2 + 0.25, -0.03), jfl, uv_scale=2)
CREAK_CRACK = K.box("Jcrack", (0.3, 0.012, 0.004), (0, 0, -50), col("#101010", True))
WC, WCW = cutout(os.path.join(REF, "wc_cut.png"), "wc", 0.8, (JX, 0.9, 0.4))
K.box("wc_body", (WCW * 0.5, 0.45, 0.42), (JX, 1.12, 0.21), col("#F2F2F2"))
K.box("wc_seat", (WCW * 0.75, 0.42, 0.04), (JX, 0.86, 0.43), col("#F8F8F8"))
egg("goose", 0.42, (JX - 0.95, 1.34, 1.75), frame="#B08A3A")
egg("pikachu", 0.42, (JX + 0.95, 1.34, 1.7))
egg("boxart", 0.36, (JX - 1.74, -0.4, 1.7), rot=(math.pi / 2, 0, math.pi / 2))
K.box("J_tp", (0.1, 0.12, 0.12), (JX + 0.55, 1.3, 0.75), col("#F8F8F4"))

# ================================================================ DRESSING (v2: user asked for more detail everywhere)
FLAME = col("#FFB030", True); FLAME2 = col("#FFE070", True)
CANDLE_N = [0]
_rd = np.random.default_rng(21)


def flame(loc, s=1.0):
    f = cone(f"flame{CANDLE_N[0]}", 0.035 * s, 0.0, 0.12 * s, loc, FLAME, seg=5); CANDLE_N[0] += 1
    g = cone(f"flame{CANDLE_N[0]}", 0.018 * s, 0.0, 0.07 * s, (loc[0], loc[1], loc[2] + 0.005), FLAME2, seg=4); CANDLE_N[0] += 1
    return f


def candle(loc, h=0.22):
    o = PP.loft(os.path.join(REF, "candle.jpg"), f"candle{CANDLE_N[0]}", height=h, sides=8, loc=loc); CANDLE_N[0] += 1
    flame((loc[0], loc[1] - 0.0, loc[2] + h * 0.98), s=h / 0.22)
    return o


def torch(loc, yaw, h=0.7, tint=None):
    """Wall torch from ONE Flow photo (alpha cut-out) + an emissive low-poly flame on top."""
    n = Matrix.Rotation(yaw, 3, "Z") @ Vector((0, -1, 0))
    p, w = cutout(os.path.join(REF, "torch_cut.png"), f"torch{CANDLE_N[0]}", h, Vector(loc) + n * 0.03, rot=(math.pi / 2, 0, yaw), tint=tint)
    CANDLE_N[0] += 1
    flame(Vector(loc) + n * 0.09 + Vector((0, 0, h * 0.42)), s=2.4)
    return p


def shield(name, loc, yaw, h=0.7, tint=None):
    n = Matrix.Rotation(yaw, 3, "Z") @ Vector((0, -1, 0))
    p, w = cutout(os.path.join(REF, f"shield_{name}_cut.png"), f"shield_{name}{CANDLE_N[0]}", h, Vector(loc) + n * 0.02, rot=(math.pi / 2, 0, yaw), tint=tint)
    CANDLE_N[0] += 1
    return p


def tapestry(loc, yaw, w=1.6):
    im = img(os.path.join(REF, "tapestry_tex.png")); h = w * im.size[1] / im.size[0]
    n = Matrix.Rotation(yaw, 3, "Z") @ Vector((0, -1, 0))
    t = K.plane(f"tap{CANDLE_N[0]}", w, h, Vector(loc) + n * 0.03, rot=(math.pi / 2, 0, yaw), mat=K.mat_image("tapm", im)); CANDLE_N[0] += 1
    r = K.box(f"taprod{CANDLE_N[0]}", (w + 0.2, 0.05, 0.05), Vector(loc) + n * 0.05 + Vector((0, 0, h / 2 + 0.03)), col("#4A3020")); r.rotation_euler = (0, 0, yaw)
    return t


def straw_bale(loc, yaw=0.0):
    im = img(os.path.join(REF, "straw_cut.png"))
    o = K.box(f"bale{CANDLE_N[0]}", (0.9, 0.5, 0.45), (loc[0], loc[1], loc[2] + 0.225), K.mat_image("balem", im), uv_scale=1.0); CANDLE_N[0] += 1
    uv = o.data.uv_layers.active.data
    for pl in o.data.polygons:
        vs = [o.data.vertices[v].co for v in pl.vertices]; n_ = pl.normal
        ax = (0, 1) if abs(n_.z) > 0.5 else ((1, 2) if abs(n_.x) > 0.5 else (0, 2))
        lo = [min(v[a] for v in vs) for a in ax]; hi = [max(v[a] for v in vs) for a in ax]
        for li, vi in zip(pl.loop_indices, pl.vertices):
            c_ = o.data.vertices[vi].co
            uv[li].uv = tuple(0.08 + 0.84 * (c_[a] - l) / max(h_ - l, 1e-6) for a, l, h_ in zip(ax, lo, hi))
    o.rotation_euler = (0, 0, yaw)
    return o


def straw_floor(cx, cy, w, d, n=70, z=0.005):
    m = col("#D8B850"); m2 = col("#B89838")
    for i in range(n):
        o = K.box(f"straw{CANDLE_N[0]}", (_rd.uniform(0.08, 0.2), 0.012, 0.008), (cx + _rd.uniform(-w / 2, w / 2), cy + _rd.uniform(-d / 2, d / 2), z),
                  m if i % 3 else m2); CANDLE_N[0] += 1
        o.rotation_euler = (0, 0, _rd.uniform(0, 3.14))


def feast_table(loc, w=2.0, yaw=0.0, food=True, tint=None):
    """Trestle table + photo feast platter (cross cut-out) + jug, goblets, candles, bread."""
    root = K.link(bpy.data.objects.new(f"table{CANDLE_N[0]}", None)); CANDLE_N[0] += 1
    objs = [K.box("tt", (w, 0.8, 0.07), (0, 0, 0.76), wood, uv_scale=1.2)]
    for sx in (-1, 1):
        objs.append(K.box("tl", (0.08, 0.6, 0.72), (sx * (w / 2 - 0.2), 0, 0.36), col("#4A3020")))
        objs.append(K.box("tf", (0.08, 0.7, 0.06), (sx * (w / 2 - 0.2), 0, 0.05), col("#4A3020")))
    objs.append(K.box("cloth", (w * 0.9, 0.82, 0.01), (0, 0, 0.8), col("#E8E0C8")))
    if food:
        f = cross_cut(os.path.join(REF, "feast_cut.png"), "feast", 0.32, (0, 0.0, 0.8)); objs.append(f)
        objs.append(PP.loft(os.path.join(REF, "jug_body.jpg"), "jug", height=0.3, sides=8, loc=(-w * 0.3, 0.12, 0.8)))
        objs.append(PP.loft(os.path.join(REF, "goblet.jpg"), "gob", height=0.18, sides=8, loc=(w * 0.28, -0.15, 0.8)))
        objs.append(PP.loft(os.path.join(REF, "goblet.jpg"), "gob", height=0.18, sides=8, loc=(-w * 0.15, -0.22, 0.8)))
        for k_ in range(3):
            b = K.uv_sphere("bread", 0.07, (w * 0.38 - k_ * 0.12, 0.22, 0.83), col("#C88A40"), seg=6, rings=4); b.scale = (1.3, 1, 0.6); objs.append(b)
        objs.append(K.uv_sphere("apple", 0.04, (w * 0.12, -0.25, 0.83), col("#C02020"), seg=6, rings=4))
    for o in objs:
        o.parent = root
    root.location = loc; root.rotation_euler = (0, 0, yaw)
    M = Matrix.Translation(loc) @ Matrix.Rotation(yaw, 4, "Z")
    for x in (-w * 0.42, w * 0.42):                              # candles + flames placed in world
        candle(tuple(M @ Vector((x, -0.05, 0.8))), 0.2)
    return root


def stand_candles(cx, cy, z, r, n):
    for i in range(n):
        a = 2 * math.pi * i / n
        K.box(f"cst{CANDLE_N[0]}", (0.05, 0.05, 1.0), (cx + r * math.cos(a), cy + r * math.sin(a), z + 0.5), col("#2A2A2E")); CANDLE_N[0] += 1
        candle((cx + r * math.cos(a), cy + r * math.sin(a), z + 1.0), 0.24)


# A: candles round the pedestal (the void stays black)
stand_candles(AX, 1.1, 0.0, 0.85, 6)
# B: a war-room table round the map
for x, y in ((-1.8, 2.2), (1.8, 2.2), (-1.8, -2.2), (1.8, -2.2)):
    candle((BX + x, y, 0.0), 0.32)
PP.loft(os.path.join(REF, "jug_body.jpg"), "B_jug", height=0.32, sides=8, loc=(BX + 1.95, 0.4, 0.0))
PP.loft(os.path.join(REF, "goblet.jpg"), "B_gob", height=0.2, sides=8, loc=(BX + 1.85, -0.3, 0.0))
K.box("B_quill", (0.02, 0.4, 0.01), (BX - 1.85, -0.6, 0.01), col("#F0F0E8")).rotation_euler = (0, 0, 0.4)
cone("B_seal", 0.06, 0.06, 0.03, (BX - 1.9, 0.5, 0.0), col("#B01818"), seg=8)
cone("B_ink", 0.05, 0.04, 0.09, (BX - 1.95, -0.1, 0.0), col("#1A1A22"), seg=6)
# C: floating crests + crozier + rocks on the red void
shield("mainz", (CXX - 2.4, 1.8, 2.4), 0.25, 0.9); shield("thuringia", (CXX + 2.4, 1.8, 2.4), -0.25, 0.9)
for i in range(9):
    rk = K.uv_sphere(f"rock{i}", _rd.uniform(0.05, 0.16), (CXX + _rd.uniform(-2.5, 2.5), _rd.uniform(0, 3), _rd.uniform(0.6, 3.0)), col(("#6A4428", "#4E9A3A", "#7A7468")[i % 3]), seg=5, rings=3)
    rk.rotation_euler = tuple(_rd.uniform(0, 3, 3))
# D: tapestries, torches, crests, footstool, a feast table, candle stands
tapestry((DX - 1.9, 2.34, 2.6), 0.0, 1.5)
torch((DX - 3.33, 0.6, 2.0), math.pi / 2); torch((DX + 3.33, 0.6, 2.0), -math.pi / 2); torch((DX - 0.85, 2.34, 2.2), 0.0); torch((DX + 1.75, 2.34, 2.2), 0.0)
shield("thuringia", (DX - 3.33, -1.0, 2.3), math.pi / 2, 0.6); shield("mainz", (DX + 3.33, -1.0, 2.3), -math.pi / 2, 0.6)
K.box("D_dais", (2.4, 1.6, 0.18), (DX + 0.6, 1.8, 0.09), stone, uv_scale=1.0)
feast_table((DX - 1.8, -1.2, 0), 1.8, yaw=math.pi / 2)
stand_candles(DX + 0.6, 1.8, 0.18, 1.25, 2)
straw_floor(DX, -1.5, 5, 3, 30)
# E: tables with food, straw, torches, tapestry, crests, bales, candles
feast_table((EX - 2.6, -1.6, 0), 2.0, yaw=0.1)
feast_table((EX + 2.6, -1.0, 0), 2.0, yaw=-0.08)
straw_floor(EX, 0, 8.5, 6, 110)
torch((EX - 4.38, 1.8, 2.2), math.pi / 2); torch((EX + 4.38, -1.6, 2.2), -math.pi / 2); torch((EX - 1.3, NY - 0.02, 2.4), 0.0); torch((EX + 1.3, NY - 0.02, 2.4), 0.0)
tapestry((EX - 4.38, -2.0, 2.1), math.pi / 2, 1.2)
shield("thuringia", (EX - 1.4, NY - 0.02, 3.3), 0.0, 0.5); shield("mainz", (EX + 1.4, NY - 0.02, 3.3), 0.0, 0.5)
straw_bale((EX - 3.8, 2.4, 0), 0.2); straw_bale((EX - 3.6, 2.5, 0.45), -0.1)
PP.loft(os.path.join(REF, "barrel.jpg"), "barrelE3", height=0.9, sides=10, loc=(EX + 3.6, 2.4, 0))
for x in (-0.7, 0.7):
    candle((EX + x, NY + 0.15, 0.5), 0.18)
# G: tiny furniture in the cutaway
for side in (-1, 1):
    for lvl, z in (("up", 2.67), ("gr", 0.22)):
        piv = SLABS[(lvl, side)]
        tb = K.box(f"Gt{lvl}{side}", (0.4, 0.2, 0.05), (-side * 1.4, 0.05, 0.27), col("#8A5A30")); tb.parent = piv
        for k_ in (-1, 1):
            K.box(f"Gtl{lvl}{side}{k_}", (0.03, 0.03, 0.25), (-side * 1.4 + k_ * 0.17, 0.05, 0.13), col("#5A3A20")).parent = piv
        K.box(f"Gban{lvl}{side}", (0.16, 0.02, 0.4), (GX + side * 1.6, -0.12, z + 1.4), col("#B01C20" if side < 0 else "#1C3A90"))
        flame((GX + side * 1.82, -0.15, z + 1.1), s=1.6)
for i in range(6):
    K.box(f"Gbarrel{i}", (0.16, 0.16, 0.22), (GX - 1.6 + i * 0.25, 0.08, -0.05 if False else -1.6), col("#6A4428"))
# I: torches, bales, barrels by the door
NIGHT = (0.42, 0.48, 0.78)
torch((IX - 1.4, -0.05, 2.6), 0.0, 0.8, tint=(0.8, 0.8, 0.9)); torch((IX + 1.4, -0.05, 2.6), 0.0, 0.8, tint=(0.8, 0.8, 0.9))
for k_, x in enumerate((-2.6, -3.4)):
    straw_bale((IX + x, -0.6 - 0.1 * k_, 0), 0.3 * k_)
PP.loft(os.path.join(REF, "barrel.jpg"), "barrelI1", height=0.9, sides=10, loc=(IX + 2.4, -0.6, 0))
PP.loft(os.path.join(REF, "barrel.jpg"), "barrelI2", height=0.9, sides=10, loc=(IX + 2.95, -0.4, 0))
shield("thuringia", (IX - 0.0, -0.05, 2.4), 0.0, 0.7, tint=(0.8, 0.8, 0.9))
# J: sink, mirror, towel, plunger, duck, mat, cabinet
K.box("J_sink", (0.6, 0.42, 0.18), (JX + 1.1, 1.1, 0.85), col("#F6F6F6")); K.box("J_sinkped", (0.18, 0.18, 0.76), (JX + 1.1, 1.18, 0.38), col("#ECECEC"))
K.box("J_mirror", (0.55, 0.03, 0.75), (JX + 1.1, 1.33, 1.6), col("#BFD8E8", True)); K.box("J_mirf", (0.61, 0.025, 0.81), (JX + 1.1, 1.34, 1.6), col("#3A3A3A"))
K.box("J_tap", (0.04, 0.12, 0.12), (JX + 1.1, 1.24, 1.0), col("#C0C4C8"))
K.box("J_towelbar", (0.6, 0.04, 0.03), (JX - 1.1, 1.32, 1.25), col("#C0C4C8")); K.box("J_towel", (0.45, 0.04, 0.6), (JX - 1.1, 1.3, 1.0), col("#E05A7A"))
K.box("J_towel2", (0.45, 0.045, 0.08), (JX - 1.1, 1.29, 0.82), col("#FFFFFF"))
cone("J_plunger", 0.08, 0.06, 0.08, (JX - 0.55, 0.95, 0.0), col("#B01818"), seg=8); K.box("J_plstick", (0.03, 0.03, 0.55), (JX - 0.55, 0.95, 0.35), col("#C89A50"))
K.uv_sphere("J_duck", 0.07, (JX + 1.0, 1.05, 0.98), col("#F8D820"), seg=8, rings=5); K.uv_sphere("J_duckh", 0.045, (JX + 1.05, 1.0, 1.06), col("#F8D820"), seg=6, rings=4)
K.box("J_mat", (0.7, 0.5, 0.01), (JX, 0.2, 0.005), col("#5A8AC8"))
K.box("J_cab", (0.5, 0.35, 0.8), (JX - 1.5, 1.0, 0.4), col("#D8CCB0")); K.box("J_cabd", (0.02, 0.36, 0.7), (JX - 1.25, 1.0, 0.42), col("#C0B498"))
K.box("J_roll", (0.12, 0.12, 0.12), (JX + 0.55, 1.3, 0.85), col("#F8F8F4"))

# ================================================================ CAST
HERO = K.Kaneda("hero", (EX, NY + 0.1, 0), faces_dir=MEDIEVAL)


def person(name, loc, yaw, scale=(1, 1, 1)):
    """A distinct person (never a Kaneda recolour): hombre's body with their own Flow face + medieval clothes."""
    r = K.hombre(name, loc, yaw=yaw, tex={"head": os.path.join(PEOPLE, f"{name}_head_128.png"), "body": os.path.join(PEOPLE, f"{name}_body_256.png")})
    r.scale = scale
    return r


ARCH = person("archbishop", (0, 0, 0), 0, (0.98, 0.98, 1.0))
LAND = person("landgrave", (0, 0, 0), 0, (1.06, 1.06, 1.02))
BARB = person("barbarossa", (0, 0, 0), 0, (1.12, 1.12, 1.03))
PEAS = person("peasant", (0, 0, 0), 0, (0.92, 0.92, 0.98))
NOBLES = [person("noble1", (0, 0, 0), 0, (1.18, 1.18, 0.95)), person("noble2", (0, 0, 0), 0, (0.95, 0.95, 1.04)),
          person("noble3", (0, 0, 0), 0, (1.08, 1.08, 1.0)), person("noble4", (0, 0, 0), 0, (0.94, 0.94, 0.96)),
          person("noble5", (0, 0, 0), 0, (1.0, 1.0, 1.0))]
CROWDP = [person("crowd1", (0, 0, 0), 0, (1.15, 1.15, 0.97)), person("crowd2", (0, 0, 0), 0, (0.92, 0.92, 1.0)),
          person("crowd3", (0, 0, 0), 0, (1.0, 1.0, 0.98)), person("crowd4", (0, 0, 0), 0, (1.08, 1.08, 1.03))]
CITIZ = [person("citizen1", (0, 0, 0), 0, (0.92, 0.92, 0.94)), person("citizen2", (0, 0, 0), 0, (0.98, 0.98, 0.97))]
PEOPLE_ALL = [ARCH, LAND, BARB, PEAS] + NOBLES + CROWDP + CITIZ


def head_box(r):
    bpy.context.view_layer.update()
    hd = K.hpart(r, "head"); P = [hd.matrix_world @ v.co for v in hd.data.vertices]
    lo = Vector((min(p.x for p in P), min(p.y for p in P), min(p.z for p in P)))
    hi = Vector((max(p.x for p in P), max(p.y for p in P), max(p.z for p in P)))
    return hd, lo, hi


def on_head(r, objs):
    """Parent hats to the head part keeping their world placement (built at the root's rest pose)."""
    hd = K.hpart(r, "head"); bpy.context.view_layer.update()
    for o in objs:
        mw = o.matrix_world.copy(); o.parent = hd; o.matrix_world = mw


def crown_mesh(name, r, h, pts, mat, loc):
    """Ring with `pts` triangular points on top (open top)."""
    n = pts * 2; v = []; f = []
    for i in range(n):
        a = 2 * math.pi * i / n
        v.append((r * math.cos(a), r * math.sin(a), 0)); v.append((r * math.cos(a), r * math.sin(a), h * (1.0 if i % 2 == 0 else 0.55)))
    for i in range(n):
        a, b = 2 * i, 2 * ((i + 1) % n)
        f.append((a, b, b + 1, a + 1))
    o = K.mesh_from(name, v, f, mat, loc)
    o.data.polygons.foreach_set("use_smooth", [False] * len(o.data.polygons))
    return o


GOLD = col("#E0B030")
for r in PEOPLE_ALL:                                   # rest pose at the origin while hats are fitted
    r.location = (0, 0, 0); r.rotation_euler = (0, 0, 0)
# archbishop's mitre: two pointed white panels with gold bands, on the crown of the head
hd, lo, hi = head_box(ARCH); c = (lo + hi) / 2; hw = (hi.x - lo.x) / 2
mit = []
for k, dy in enumerate((-0.025, 0.025)):
    pts = [(-hw * 0.92, 0), (hw * 0.92, 0), (hw * 0.8, 0.16), (0, 0.3), (-hw * 0.8, 0.16)]
    p = K.extrude_poly(f"mitre{k}", pts, 0.02, col("#F2EEE0"), loc=(c.x, c.y + dy, hi.z - 0.05)); mit.append(p)
    b = K.box(f"mitre_band{k}", (0.025, 0.024, 0.28), (c.x, c.y + dy - 0.012 * (1 if dy < 0 else -1) * 0 + (-0.012 if dy < 0 else 0.012) * 0, hi.z + 0.09), GOLD)
    mit.append(b)
mit.append(K.box("mitre_rim", (hw * 1.9, (hi.y - lo.y) * 0.95, 0.04), (c.x, c.y, hi.z - 0.04), GOLD))
on_head(ARCH, mit)
# Barbarossa's crown
hd, lo, hi = head_box(BARB); c = (lo + hi) / 2
on_head(BARB, [crown_mesh("barb_crown", max(hi.x - lo.x, hi.y - lo.y) * 0.5, 0.1, 6, GOLD, (c.x, c.y, hi.z - 0.06))])
# landgrave: a plain fur hat
hd, lo, hi = head_box(LAND); c = (lo + hi) / 2
fh = cone("land_cap", (hi.x - lo.x) * 0.52, (hi.x - lo.x) * 0.36, 0.1, (c.x, c.y + 0.005, hi.z - 0.05), col("#A01820"), seg=8)
fc = crown_mesh("land_circlet", (hi.x - lo.x) * 0.55, 0.05, 8, GOLD, (c.x, c.y + 0.005, hi.z - 0.065))
on_head(LAND, [fh, fc])
# noble hats: a few distinct ones
for r, kind in zip(NOBLES, ("chaperon", "none", "coif", "cap", "feather")):
    hd, lo, hi = head_box(r); c = (lo + hi) / 2; rr = (hi.x - lo.x) * 0.55
    if kind == "chaperon":
        on_head(r, [cone(r.name + "_hat", rr, rr * 0.8, 0.07, (c.x, c.y, hi.z - 0.04), col("#1C3A90"), seg=8)])
    elif kind == "coif":
        h_ = K.uv_sphere(r.name + "_hat", rr * 1.02, (c.x, c.y + 0.01, hi.z - 0.07), col("#8A8C94"), seg=8, rings=5); h_.scale = (1, 1, 0.8)
        on_head(r, [h_])
    elif kind == "cap":
        on_head(r, [K.box(r.name + "_hat", (rr * 2, rr * 2, 0.06), (c.x, c.y, hi.z - 0.01), col("#5A1E6A"))])
    elif kind == "feather":
        on_head(r, [cone(r.name + "_hat", rr, rr * 0.9, 0.06, (c.x, c.y, hi.z - 0.03), col("#2E6A3A"), seg=8),
                    K.box(r.name + "_feather", (0.02, 0.02, 0.22), (c.x + rr * 0.6, c.y + 0.04, hi.z + 0.08), col("#E8E0C8"))])

for r in PEOPLE_ALL:
    K.hpart(r, "head").scale = (1.2, 1.2, 1.2)
LAND_TEX = {}
for o in LAND.children_recursive:                                 # landgrave: clean and mucky texture sets (s10)
    for sl in getattr(o, "material_slots", []):
        for n in (sl.material.node_tree.nodes if sl.material and sl.material.use_nodes else []):
            if n.type == "TEX_IMAGE" and n.image and "landgrave" in n.image.name:
                key = "head" if "head" in n.image.name else "body"
                LAND_TEX.setdefault(key, []).append(n)
LAND_IMG = {k: (LAND_TEX[k][0].image, img(os.path.join(PEOPLE, f"landgrave_muck_{k}_{'head_128' if k == 'head' else 'body_256'}.png".replace("_head_head", "_head").replace("_body_body", "_body")))) for k in LAND_TEX}


def land_muck(on):
    for k, nodes in LAND_TEX.items():
        for n in nodes:
            n.image = LAND_IMG[k][1 if on else 0]


# night tint on the people and Henry too (user): a multiply node after every character texture
TINT_NODES = []
for o in [m for r in PEOPLE_ALL for m in r.children_recursive] + HERO.meshes:
    for sl in getattr(o, "material_slots", []):
        mt = sl.material
        if not mt or not mt.use_nodes or mt.get("tinted"):
            continue
        mt["tinted"] = 1; nt = mt.node_tree
        for t_ in [n for n in nt.nodes if n.type == "TEX_IMAGE"]:
            mx = nt.nodes.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs[0].default_value = 1.0
            mx.inputs[7].default_value = (1, 1, 1, 1)
            for l in list(t_.outputs[0].links):
                to = l.to_socket; nt.links.remove(l); nt.links.new(mx.outputs[2], to)
            nt.links.new(t_.outputs[0], mx.inputs[6]); TINT_NODES.append(mx)


def night(on):
    for mx in TINT_NODES:
        mx.inputs[7].default_value = (*((0.55, 0.6, 0.9) if on else (1, 1, 1)), 1)


# archbishop's crozier (photo cut-out), held through his right fist
CROZIER, CZW = cutout(os.path.join(REF, "crozier_cut.png"), "crozier", 1.9, (0, 0, -50))


def hold_crozier(r):
    """Right forearm forward, the staff passes vertically through the closed hand (its centre)."""
    hpose(r, "upperarm_R", (-18, 0, -6)); hpose(r, "forearm_R", (-62, 0, 0))
    h = hhand(r, "R") + Vector((0, -0.01, -0.05))
    CROZIER.location = (h.x, h.y, 0.95 + 0.05 + (h.z - 0.95) * 0)
    CROZIER.location.z = h.z + 0.12                     # crook above his head, foot near the floor
    d = (cam.matrix_world.translation - CROZIER.location); CROZIER.rotation_euler = (math.pi / 2, 0, math.atan2(d.x, -d.y))


# Henry's tiny crown: fitted on the Head bone (too small: it sits on top of the hair)
bpy.context.view_layer.update()
_dg = bpy.context.evaluated_depsgraph_get(); _P = []
for _hm in HERO.meshes:                                       # hair spikes are the top-most verts of any Kaneda mesh
    _ev = _hm.evaluated_get(_dg); _me = _ev.to_mesh(); _P += [_ev.matrix_world @ v.co for v in _me.vertices]; _ev.to_mesh_clear()
_top = max(p.z for p in _P); _near = [p for p in _P if p.z > _top - 0.05]
_c = sum(_near, Vector()) / len(_near)
def henry_crown(loc, r=0.058, hb=0.026, n=10, pts=5):
    """Henry's crown (v4, user): faceted 10-sided gold band with a pixel-art texture (engraving + coloured gem pixels),
    5 faceted points with cross tips and a cut gem at each point's foot. Still a size too small: it sits on his hair."""
    import numpy as _np
    t = _np.zeros((8, 40, 3), _np.uint8); t[:] = (214, 168, 48)
    t[0] = t[7] = (150, 104, 24); t[1] = t[6] = (238, 200, 92)                 # rims: dark edge + bright bead
    t[3:5, ::2] = (138, 92, 20)                                                # engraved zig-zag
    t[4, 1::2] = (138, 92, 20)
    for k, gc in enumerate(((200, 24, 32), (36, 80, 200), (40, 150, 70), (200, 24, 32), (36, 80, 200))):
        x = 4 + k * 8; t[2:6, x:x + 3] = gc; t[2, x] = (255, 240, 240)          # gem pixels with a highlight
    band_m = K.mat_image("crown_band", K.image_from_array("crown_band_t", t))
    v = []; f = []; uvs = []
    ri = r * 0.86
    for i in range(n + 1):                                                     # outer wall (UV wraps the texture)
        a = 2 * math.pi * i / n
        v += [(r * math.cos(a), r * math.sin(a), 0), (r * math.cos(a), r * math.sin(a), hb),
              (ri * math.cos(a), ri * math.sin(a), 0), (ri * math.cos(a), ri * math.sin(a), hb)]
        uvs += [(i / n, 0), (i / n, 1), (i / n, 0), (i / n, 1)]
    for i in range(n):
        o0, o1 = 4 * i, 4 * (i + 1)
        f += [(o0, o1, o1 + 1, o0 + 1), (o1 + 2, o0 + 2, o0 + 3, o1 + 3), (o0 + 1, o1 + 1, o1 + 3, o0 + 3), (o0 + 2, o1 + 2, o1, o0)]
    band = K.mesh_from("henry_crown", v, f, band_m, loc)
    uvl = band.data.uv_layers.new()
    for p in band.data.polygons:
        p.use_smooth = False
        for li, vi in zip(p.loop_indices, p.vertices):
            uvl.data[li].uv = uvs[vi]
    gold = col("#E2B238"); gold_d = col("#B0821C")
    for k in range(pts):
        a = 2 * math.pi * k / pts + math.pi / 2
        c = Vector((r * 0.93 * math.cos(a), r * 0.93 * math.sin(a), hb))
        w = 0.022; h = 0.034; tn = Vector((-math.sin(a), math.cos(a), 0)); nr = Vector((math.cos(a), math.sin(a), 0))
        pv = [c - tn * w / 2, c + tn * w / 2, c + tn * w / 2 - nr * 0.008, c - tn * w / 2 - nr * 0.008,
              c + Vector((0, 0, h)), c + Vector((0, 0, h)) - nr * 0.006]
        pt = K.mesh_from(f"crown_pt{k}", [tuple(x) for x in pv], [(0, 1, 4), (1, 2, 5, 4), (2, 3, 5), (3, 0, 4, 5), (0, 3, 2, 1)], gold)
        pt.parent = band
        top = c + Vector((0, 0, h))
        K.box(f"crown_cx{k}", (0.005, 0.005, 0.018), tuple(top + Vector((0, 0, 0.008))), gold_d).parent = band     # cross tip
        cb = K.box(f"crown_cy{k}", (0.013, 0.005, 0.005), tuple(top + Vector((0, 0, 0.011))), gold_d); cb.rotation_euler = (0, 0, a + math.pi / 2); cb.parent = band
        gm = K.uv_sphere(f"crown_gem{k}", 0.0065, tuple(c + nr * 0.004 + Vector((0, 0, -0.012))), col(("#D01820", "#2050D0", "#20A040")[k % 3], True), seg=4, rings=2)
        gm.parent = band
    return band


CROWN = henry_crown((_c.x, _c.y, _top - 0.022))
GEMS = list(CROWN.children_recursive)
bpy.context.view_layer.update()
CROWN_OFF = (HERO.arm.matrix_world @ HERO.arm.pose.bones["Head"].matrix).inverted() @ CROWN.matrix_world
CROWN_DROP = [0.0]


def crown_follow():
    """The crown rides the Head bone (set every frame after the pose); CROWN_DROP lifts it for the drop-in."""
    bpy.context.view_layer.update()
    m = HERO.arm.matrix_world @ HERO.arm.pose.bones["Head"].matrix @ CROWN_OFF
    m.translation.z += CROWN_DROP[0]
    CROWN.matrix_world = m
    for g in GEMS:
        g.hide_render = CROWN.hide_render

# ================================================================ camera helpers (from #1-#3)


def shake(t, a=1.0):
    off = Vector((0.012 * math.sin(2.3 * t) + 0.006 * math.sin(5.1 * t + 1), 0.0, 0.010 * math.sin(1.9 * t + 2) + 0.005 * math.sin(4.7 * t)))
    return off * a, math.radians(1.5 * math.sin(1.7 * t) + 0.8 * math.sin(3.9 * t)) * a


def lk(pos, target, t, roll=0.0, a=1.0):
    off, r = shake(t, a)
    K.look(cam, Vector(pos) + off, Vector(target) + off * 0.5, roll + r)


def punch(t, t0, k=1.8, dur=0.45):
    return 1.0 / (1.0 + (k - 1.0) * K.ease((t - t0) / dur))


def face_cam(k, dist, lens=35, dx=0.0, dz=0.0, roll=0.0, orbit=0.0, t=0.0, a=1.0):
    c = k.head_world()
    fwd = (k.arm.matrix_world.to_3x3().normalized() @ Vector((0, -1, 0))).normalized()
    fwd = Matrix.Rotation(orbit, 3, "Z") @ fwd
    side = fwd.cross(Vector((0, 0, 1))).normalized()
    cam.data.lens = lens
    lk(c + fwd * dist + side * dx + Vector((0, 0, dz)), c + Vector((0, 0, dz * 0.4)), t, roll, a)


def park(o):
    o.location = (0, 0, -50)


def cam_frame(depth):
    hh = depth * cam.data.sensor_height / 2 / cam.data.lens
    return hh * 1080 / 1920, hh


def on_screen(o, x, y, depth, tilt=(0.0, 0.0, 0.0)):
    bpy.context.view_layer.update()
    hw, hh = cam_frame(depth)
    m = cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt[0], 3, "X") @ Matrix.Rotation(tilt[1], 3, "Y") @ Matrix.Rotation(tilt[2], 3, "Z")
    w = m.to_4x4(); w.translation = cam.matrix_world @ Vector((x * hw, y * hh, -depth))
    o.matrix_world = w @ Matrix.Diagonal((*o.scale, 1))


def letters_on_screen(L, t, t_in, t_out=None, x=0.0, y=0.45, width=0.85, depth=1.0, tilt=math.radians(-8), drop=0.0):
    """A Letters3D title in camera space, `width` of the frame wide. drop > 0: it falls in from above."""
    bpy.context.view_layer.update()
    hw, hh = cam_frame(depth)
    n = sum(1 for ch in L.letters)
    sc_ = width * 2 * hw / (0.66 * L.size * (n + 1))
    yy = y + drop * (1 - K.ease((t - t_in) / 0.3)) if t >= t_in else y + drop
    L.root.matrix_world = Matrix.Translation(cam.matrix_world @ Vector((x * hw, yy * hh, -depth))) @ \
        (cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt, 3, "Y")).to_4x4()
    L.anim(t, t_in, t_out=t_out, scale=sc_)


def place(k, loc, yaw, drop=0.0):
    k.arm.location = (loc[0], loc[1], (loc[2] if len(loc) > 2 else 0) + K.KZ - drop); k.arm.rotation_euler = (0, 0, yaw)


def legs(k, dx, dy, dz):
    """Move both IK leg controls by (dx outward, dy, dz) model units (sitting / straddling)."""
    bpy.context.view_layer.update()
    for s, sx in (("L", 1), ("R", -1)):
        pb = k.arm.pose.bones["LegControl." + s]
        m = pb.matrix.copy(); m.translation += Vector((sx * dx, dy, dz)); pb.matrix = m
        bpy.context.view_layer.update()


SIT_DZ, SIT_DY = 1.04, -1.06


def sit(k, loc, yaw, spread=0.0):
    """Seated: thighs level, shins down. Hips end ~0.52 m above loc.z."""
    place(k, loc, yaw, drop=SIT_DZ * K.KS)
    legs(k, spread, SIT_DY, SIT_DZ)


def arms(k, up=None, fore=None, hand=None):
    """Aim both arms (model-space directions, L side; R mirrored in x)."""
    for s, sx in (("L", 1), ("R", -1)):
        for bone, d in (("Upperarm", up), ("Forearm", fore), ("Hand", hand)):
            if d is not None:
                k.aim(f"{bone}.{s}", (sx * d[0], d[1], d[2]))


def hand_world(k, s):
    bpy.context.view_layer.update()
    return k.arm.matrix_world @ k.arm.pose.bones["Hand." + s].tail


def hpose(r, part, deg):
    K.hpart(r, part).rotation_euler = tuple(math.radians(a) for a in deg)


def pose_reset(r):
    for o in r.children_recursive:
        if o.type == "MESH" and o.parent != r and o.name.split(".")[0] in r["parts"] and not o.name.startswith(r.name):
            o.rotation_euler = (0, 0, 0)


def hhand(r, s):
    bpy.context.view_layer.update()
    return K.hpart(r, "hand_" + s).matrix_world.translation.copy()


def pput(r, loc, yaw, lean=0.0):
    r.location = loc; r.rotation_euler = (lean, 0, yaw)


def show(r, on):
    for o in r.children_recursive:
        o.hide_render = not on
    r.hide_render = not on


def rope(o, a, b):
    a, b = Vector(a), Vector(b); v = b - a
    o.location = (a + b) / 2; o.rotation_euler = v.to_track_quat("Z", "Y").to_euler(); o.scale = (1, 1, v.length)


# ================================================================ shots (t = seconds into the shot, d = length)


def s01(t, d):   # "Sixty nobles died in one afternoon because of a toilet." — void stage, 60 tiny nobles, 3D "60" drops in
    u = K.ease(t / d)
    cam.data.lens = 28
    lk((AX + 0.7 - 0.5 * u, -2.2 + 0.5 * u, 0.55 + 0.2 * u), (AX, 0.9, 0.62), t, math.radians(-7 + 6 * u))
    letters_on_screen(T60, t, 0.05, t_out=wt(0, "because") - 0.1, y=0.5, width=0.55, drop=0.6)
    tt = wt(0, "toilet") - 0.1
    if t > tt:                                                           # punch on the toilet
        cam.data.lens = 28 * (1 + 0.6 * K.ease((t - tt) / 0.25))
        lk(cam.location, (AX, 1.1, 0.75), t, math.radians(-3))


def s02(t, d):   # "July 1184. Erfurt, Germany." — the map, "1184", the pin drops on Erfurt, the dive
    te = wt(1, "erfurt") - 0.1
    PIN.location = ERFURT + Vector((0, 0, 1.6 * (1 - K.ease((t - te + 0.3) / 0.25))))
    if t < te:
        cam.data.lens = 24; u = K.ease(t / max(te, 0.1))
        lk((BX + 0.3, -2.6 + 0.4 * u, 3.6 - 0.3 * u), (BX, 0.1, 0), t, math.radians(-8 + 4 * u))
        letters_on_screen(T1184, t, wt(1, "july") + 0.25, t_out=te - 0.25, y=0.5, width=0.75)
    else:                                                                # the dive into Erfurt
        u = K.ease((t - te) / max(d - te, 0.1)); cam.data.lens = 30
        lk(ERFURT + Vector((0.25 * (1 - u), -1.4 * (1 - u) - 0.15, 2.4 - 1.9 * u)), ERFURT + Vector((0, 0, 0.1)), t, math.radians(10 * u), a=1.5)


def tug(r, side, t):
    """Lean back and pull: arms forward, hands at chest height; returns the mid point between the hands."""
    hpose(r, "upperarm_R", (-75, 0, -12 * side)); hpose(r, "upperarm_L", (-75, 0, 12 * side))
    hpose(r, "forearm_R", (-25, 0, 0)); hpose(r, "forearm_L", (-25, 0, 0))
    return (hhand(r, "R") + hhand(r, "L")) / 2


def s03(t, d):   # "The Archbishop of Mainz and the Landgrave of Thuringia were feuding over land." — tug-of-war on the red void
    yank = math.sin(t * 5.0) * 0.12
    CHUNK.location = (CXX + yank, 0.6, 1.25 + 0.05 * math.sin(t * 2.3)); CHUNK.rotation_euler = (0.08 * math.sin(t * 3), 0.1 * yank, 0.3 * t)
    pput(ARCH, (CXX - 1.4 + yank * 0.5, 0.6, 0), math.radians(90), math.radians(-14 - 6 * math.sin(t * 5)))
    pput(LAND, (CXX + 1.4 + yank * 0.5, 0.6, 0), math.radians(-90), math.radians(-14 + 6 * math.sin(t * 5)))
    for r, sd, i in ((ARCH, 1, 0), (LAND, -1, 1)):
        h = tug(r, sd, t)
        bpy.context.view_layer.update()
        rope(ROPES[i], h + Vector((-sd * 0.05, 0, 0)), CHUNK.matrix_world.translation + Vector((-sd * 0.5, 0, 0.0)))
    CROZIER.location = (CXX - 2.35, 0.9, 1.2 + 0.08 * math.sin(t * 2)); CROZIER.rotation_euler = (math.pi / 2, 0.25, 0.3)
    u = K.ease(t / d)
    tl = wt(2, "landgrave") - 0.1
    cam.data.lens = 22
    if t < tl:                                                           # on the archbishop
        lk((CXX - 0.8, -1.5 + 0.2 * u, 1.55), (CXX - 1.2, 0.6, 1.45), t, math.radians(-6))
    elif t < wt(2, "feuding") - 0.1:                                     # on the landgrave
        lk((CXX + 0.8, -1.5, 1.55), (CXX + 1.2, 0.6, 1.45), t, math.radians(6))
    else:                                                                # wide: both + the land
        cam.data.lens = 20
        lk((CXX + 0.3 * math.sin(t), -4.9 + 0.3 * u, 1.45), (CXX, 0.6, 1.1), t, math.radians(-4 + 8 * u))


def s04(t, d):   # "So the emperor sent his son Henry, eighteen, to make them shake hands." — throne room, tiny crown, then the horse
    th = wt(3, "henry") - 0.15; tm = wt(3, "make") - 0.1
    if t < tm:
        pput(BARB, (DX + 0.6, 1.72, 0.2), math.radians(-12))                         # seated on the throne
        for sd in "LR":
            hpose(BARB, "thigh_" + sd, (-90, 0, 0)); hpose(BARB, "calf_" + sd, (90, 0, 0))
        hpose(BARB, "upperarm_R", (-85, 0, -25)); hpose(BARB, "forearm_R", (-8, 0, 0))     # points off-screen at Henry
        hpose(BARB, "upperarm_L", (-30, 0, 15)); hpose(BARB, "forearm_L", (-50, 0, 0))
        place(HERO, (DX + 0.7, -0.4, 0), math.radians(160))
        HERO.face("nervous" if t > th + 0.3 else "neutral")
        CROWN_DROP[0] = 0.6 * (1 - K.ease((t - th) / 0.3))
        CROWN.hide_render = t < th
        if t < th:                                                       # emperor: points
            cam.data.lens = 24; u = K.ease(t / th)
            lk((DX - 0.4 + 0.3 * u, -1.5 + 0.3 * u, 1.55), (DX + 0.5, 1.7, 1.25), t, math.radians(5))
        else:                                                            # the crown lands on Henry
            face_cam(HERO, 0.95 * punch(t, th, 1.3, 0.3), 30, dz=0.08, orbit=-0.2, roll=math.radians(-5), t=t)
    else:                                                                # hard cut: Henry on a horse
        place(HERO, (FX + 0.28, -0.02, 0), -math.pi / 2, drop=0.0)
        HERO.arm.location.z = K.KZ + 0.3
        legs(HERO, 0.55, -0.55, 1.0)
        arms(HERO, up=(0.2, -0.6, -1), fore=(0.1, -1, -0.1))
        HERO.face("nervous")
        bob = 0.03 * math.sin(t * 14); HORSE.location.z = 0.85 + bob; HERO.arm.location.z += bob
        u = K.ease((t - tm) / max(d - tm, 0.1)); cam.data.lens = 24
        lk((FX - 1.5 + 1.1 * u, -3.6 + 1.4 * u, 1.6 - 0.1 * u), (FX + 0.1, 0, 1.45), t, math.radians(4 - 6 * u), a=2.0)


HALL_SPOTS = [(-1.6, 0.9, 20), (-0.7, 1.4, -10), (0.9, 1.3, 15), (1.7, 0.6, -25), (-2.4, 0.1, 30), (0.2, 0.3, 5), (-1.0, -0.2, -15)]


def hall_people(t, packed=True):
    for i, r in enumerate(NOBLES + [ARCH, LAND]):
        x, y, yw = HALL_SPOTS[i]
        pput(r, (EX + x, y, 0), math.radians(yw + 180 + 4 * math.sin(t * 2 + i)))
        hpose(r, "head", (0, 0, 8 * math.sin(t * 1.3 + i)))


def s05(t, d):   # "Dozens of counts and knights crammed into one room upstairs." — packed hall, Henry on the niche bench
    hall_people(t)
    hold_crozier(ARCH)
    sit(HERO, (EX, NY + 0.36, 0), 0.0)
    arms(HERO, up=(0.25, -0.45, -1), fore=(0.05, -1, -0.15))
    HERO.face("stern")
    u = K.ease(t / d); cam.data.lens = 20
    tr = wt(4, "room") - 0.1
    if t < tr:                                                           # squeeze through the crowd
        lk((EX - 0.8 + 1.0 * u, -2.6 + 0.7 * u, 1.65), (EX + 0.2, 1.6, 1.35), t, math.radians(-6 + 5 * u), a=1.2)
    else:                                                                # to Henry in the niche
        face_cam(HERO, 1.1 - 0.2 * K.ease((t - tr) / 0.8), 28, dz=0.05, orbit=0.3, roll=math.radians(4), t=t)


def s06(t, d):   # "Nobody checked the beams. They were rotten." — macro between the floorboards: worm, crack
    tr = wt(5, "rotten") - 0.15
    u = K.ease(t / d); cam.data.lens = 18
    for i, w in enumerate(WORM):                                          # a woodworm crawling out of a bore hole
        x = FMX - 0.75 + 0.22 * t - (i + 1) * 0.085
        w.location = (x, 0.82 + 0.03 * math.sin(t * 5 - i * 0.8), 1.0 + 0.045 + 0.02 * max(0, math.sin(t * 9 - i * 0.9)))
    WORM_HEAD.location = (FMX - 0.75 + 0.22 * t, 0.82 + 0.03 * math.sin(t * 5), 1.05); WORM_HEAD.rotation_euler = (0, 0, math.radians(-90 + 10 * math.sin(t * 7)))
    if t > tr:
        k = K.ease((t - tr) / 0.6)
        CRACK.location = (FMX - 0.1, 0.9 - 0.45 + 0.45 * k, 1.003); CRACK.scale = (2.0, max(k, 0.01) * 0.9, 1); CRACK.rotation_euler = (0, 0, 0.1)
        CRACK2.location = (FMX - 0.35, 0.9 - 0.3 + 0.3 * k, 1.003); CRACK2.scale = (1, max(k, 0.01) * 0.6, 1); CRACK2.rotation_euler = (0, 0, -0.5)
    lk((FMX - 1.55 + 0.45 * u, 0.32, 1.22), (FMX - 0.5, 0.92, 0.99), t, math.radians(-8 + 10 * u), a=0.5)
    if t > tr:
        cam.data.lens = 18 * (1 + 0.5 * K.ease((t - tr) / 0.3))


def s07(t, d):   # "The floor gave way, then the floor below it." — cutaway; floors fold in sequence; Henry shocked
    tg = wt(6, "gave") - 0.1; tb = wt(6, "below") - 0.15
    for (lvl, side), piv in SLABS.items():
        t0 = tg if lvl == "up" else tb
        piv.rotation_euler = (0, side * math.radians(80) * K.ease((t - t0) / 0.35) * (-1), 0)
    for fig, lvl, side, i, rest in G_FIGS:                                  # the tiny nobles tumble down with their floor
        t0 = (tg if lvl == "up" else tb) + 0.05 + 0.04 * (4 - i)
        dt = max(0.0, t - t0)
        floor_z = (0.22 if t < tb + 0.1 else -1.62) if lvl == "up" else -1.62
        z = max(rest.z - 5.0 * dt * dt, floor_z + 0.02 * i)
        fig.location = (rest.x + side * 0.25 * dt - side * 0.15 * min(dt, 0.4), rest.y, z)
        spin = dt * (5.0 + i) * (1 if (i + (lvl == "up")) % 2 else -1)
        fig.rotation_euler = (0, min(abs(spin), 1.57 + 0.3 * i) * (1 if spin > 0 else -1) if z <= floor_z + 0.02 * i + 1e-3 else spin, 0)
    ts = wt(6, "it") + 0.05 if any(w["line"] == 6 and w["w"].lower().startswith("it") for w in TIM["words"]) else d - 0.6
    if t < ts:
        u = K.ease(t / d); cam.data.lens = 24
        lk((GX + 0.4 - 0.4 * u, -7.4 + 0.8 * u, 2.2), (GX, 0, 1.75), t, math.radians(-3 + 3 * u), a=0.6)
    else:                                                                 # cut: Henry, shocked, in the niche
        E_FLOOR.hide_render = True
        sit(HERO, (EX, NY + 0.36, 0), 0.0); arms(HERO, up=(0.6, -0.2, -0.4), fore=(0.3, -1, 0.3))
        HERO.face("shocked")
        face_cam(HERO, 0.8 * punch(t, ts, 1.3, 0.25), 30, dz=0.0, orbit=-0.35, roll=math.radians(-8), t=t)


def pit_anim(t):
    for i, (o, p) in enumerate(FLOATS):
        o.location = p + Vector((0.1 * math.sin(t * 0.7 + i), 0.1 * math.cos(t * 0.6 + i), 0.02 * math.sin(t * 2 + i)))
    for i, b in enumerate(BUBBLES):
        ph = (t * 0.9 + i * 0.37) % 1.0
        s = 0.3 + 1.2 * ph if ph < 0.85 else 0.0
        b.scale = (s, s, s * 0.6)
    a = t * 4.0
    FLY.location = (HX + 1.2 * math.cos(a), 0.8 * math.sin(a), 1.4 + 0.2 * math.sin(a * 2.3))


def s08(t, d):   # "Under all that was the latrine pit." — straight down into the pit, a fly circles
    pit_anim(t)
    u = K.ease(t / d); cam.data.lens = 24
    lk((HX + 0.01, -0.02, 14.0 - 9.0 * u), (HX, 0, 0), t, math.radians(30 * u), a=0.4)


def s09(t, d):   # "About sixty men died down there, crushed or choking in the sewage." — slow pull-up, tally to "~60"
    pit_anim(t + 2.0)
    u = K.ease(t / d); cam.data.lens = 24
    lk((HX + 0.01, -0.02, 6.0 + 8.0 * u), (HX, 0, 0), t, math.radians(-20 + 10 * u), a=0.4)
    t0 = wt(8, "about") - 0.05; t1 = wt(8, "men")
    n = int(min(max((t - t0) / max(t1 - t0 + 0.6, 0.1), 0), 1) * 20) * 3
    key = "final" if t > t1 + 0.7 else n
    TALLY.data.materials[0].node_tree.nodes["Image Texture"].image = TALLY_IMGS[key]
    TALLY.scale = (1, 1, 1)
    on_screen(TALLY, 0.55, -0.62, 1.0, tilt=(0, 0, math.radians(-90)))
    TALLY.rotation_euler.rotate_axis("Z", math.radians(90))
    bpy.context.view_layer.update()
    m = cam.matrix_world.normalized().to_3x3().to_4x4(); m.translation = TALLY.matrix_world.translation
    TALLY.matrix_world = m @ Matrix.Rotation(math.radians(-6), 4, "Z") @ Matrix.Diagonal((0.55, 0.55, 1, 1))


def s10(t, d):   # "The landgrave fell in too. He lived." — the Landgrave of Thuringia hauls himself out of the muck onto the stone edge
    pit_anim(t + 4.0)
    land_muck(True); H_LEDGE.hide_render = False; FLY.location = (0, 0, -50)
    tp = 0.15
    k = K.ease((t - tp) / 0.5)
    z = -1.15 + 0.75 * k + (0.06 * math.sin((t - tp) * 9) * math.exp(-(t - tp) * 2) if t > tp else 0)
    pput(LAND, (HX + 0.3, -0.42, z), math.radians(8), math.radians(10 * k))         # leaning forward onto the ledge
    for sd, sg in (("R", 1), ("L", -1)):                                            # both forearms flat on the stone
        hpose(LAND, "upperarm_" + sd, (-78, 0, -sg * 8)); hpose(LAND, "forearm_" + sd, (-12, 0, 0))
    hpose(LAND, "head", (-8, 0, 0))
    bpy.context.view_layer.update()
    hz = min(min((K.hpart(LAND, "hand_" + sd).matrix_world @ v.co).z for v in K.hpart(LAND, "hand_" + sd).data.vertices) for sd in "RL")
    H_LEDGE.location.z = min(hz, 0.4) - 0.35 - 0.005                                # ledge top just under his hands
    sh = K.hpart(LAND, "torso").matrix_world.translation
    for i, dr in enumerate(DRIPS):                                                  # muck dripping off the fur trim
        ph = ((t * 1.6 + i * 0.29) % 1.0)
        dr.location = sh + Vector((0.2 * math.cos(i * 1.7), -0.05 + 0.1 * math.sin(i * 1.3), 0.3 - 0.7 * ph)); dr.scale = (1.6, 1.6, 1.6)
    c = sh + Vector((0, 0, 0.5))
    cam.data.lens = 28
    if t < wt(9, "lived") - 0.15:
        lk(c + Vector((0.5, -2.0, 0.45)), c + Vector((0, 0, -0.05)), t, math.radians(-6), a=0.8)
    else:                                                                            # punch on "He lived."
        lk(c + Vector((0.2, -1.15, 0.15)), c + Vector((0, 0, 0.05)), t, math.radians(5), a=0.5)
    letters_on_screen(NAME, t, 0.35, y=0.58, width=1.5, depth=1.0, tilt=math.radians(-6))


def hang(k, bar_z, bar_y, x, yaw):
    """Hanging by both hands from a horizontal bar at (bar_y, bar_z): arms straight up, feet dangling."""
    place(k, (x, bar_y + (0.13 if yaw == math.pi else -0.13), 0), yaw)
    arms(k, up=(0.12, -0.05, 1), fore=(0.05, -0.05, 1), hand=(0.03, 0, 1))
    hz = (hand_world(k, "L") + hand_world(k, "R")).z / 2
    k.arm.location.z += bar_z - hz - 0.01
    bpy.context.view_layer.update()


def s11(t, d):   # "Henry was sitting in a stone window niche, so he just hung on." — no floor, he clings to the bars, orbit
    E_FLOOR.hide_render = True
    for r in NOBLES + [ARCH, LAND]:
        show(r, False)
    tso = wt(10, "so") - 0.1
    if t < tso:                                                           # QA: show him SITTING in the niche first, the hall floor gone below
        sit(HERO, (EX, NY + 0.36, 0), 0.0); arms(HERO, up=(0.6, -0.2, -0.4), fore=(0.3, -1, 0.3))
        HERO.face("nervous")
        u = K.ease(t / max(tso, 0.1))
        c = Vector((EX, NY + 0.2, 0.8))
        cam.data.lens = 20
        lk(c + Vector((1.6 - 1.0 * u, -2.6 + 0.6 * u, 1.0 - 0.4 * u)), c + Vector((0, 0.1, -0.3)), t, math.radians(-8 + 6 * u), a=1.2)
        return
    NICHE_SEAT.hide_render = True
    hang(HERO, BAR_Z - 0.03, NY + 0.72, EX, math.pi)
    sw = math.radians(4 * math.sin(t * 3)); HERO.arm.rotation_euler = (0, sw, math.pi)
    HERO.face("nervous")
    hl = wt(10, "hung") - 0.1
    u = K.ease((t - tso) / max(hl - tso, 0.1))
    if t < hl:                                                            # from outside, through the bars: his face, the void behind
        E_SKY.hide_render = True
        cam.data.lens = 24; ang = -0.5 + 0.8 * u
        c = Vector((EX, NY + 0.6, 1.55))
        lk(c + Vector((1.7 * math.sin(ang), 1.7 * math.cos(ang), 0.25 - 0.2 * u)), c + Vector((0, -0.3, -0.25)), t, math.radians(-8 + 10 * u))
    else:                                                                 # inside: orbit to the side, the drop under his feet
        cam.data.lens = 22; v = K.ease((t - hl) / max(d - hl, 0.1)); ang = 1.2 - 0.4 * v
        c = Vector((EX, NY + 0.5, 1.0))
        lk(c + Vector((-2.2 * math.sin(ang), -2.2 * math.cos(ang), 0.9)), c + Vector((0, 0, -0.4)), t, math.radians(8))


def s12(t, d):   # "The archbishop hung on next to him, until someone found a ladder." — night facade, the absurd ladder
    CROWN.hide_render = False
    night(True)
    hang(HERO, SILL_Z + 0.07, -0.18 - 0.17, IX + 0.38, 0.0)
    HERO.arm.location.y -= 0.0
    HERO.face("skeptic" if t > wt(11, "until") else "nervous")
    show(ARCH, True)
    pput(ARCH, (IX - 0.38, -0.38, 0), 0.0)
    for s in "RL":
        hpose(ARCH, "upperarm_" + s, (-178, 0, 8 if s == "R" else -8)); hpose(ARCH, "forearm_" + s, (0, 0, 0))
    hz = (hhand(ARCH, "R").z + hhand(ARCH, "L").z) / 2
    ARCH.location.z = SILL_Z + 0.07 - (hz - ARCH.location.z) - 0.02
    tl = wt(11, "someone") - 0.2
    show(PEAS, t > tl - 0.3)
    run = K.ease((t - tl) / 1.4)
    px = IX + 6.5 - 5.0 * run
    pput(PEAS, (px, -1.6, 0.0 + 0.04 * abs(math.sin(t * 12))), math.radians(90))
    hpose(PEAS, "upperarm_R", (-165, 0, 0)); hpose(PEAS, "forearm_R", (-10, 0, 0))     # right hand up under the ladder rail
    hpose(PEAS, "upperarm_L", (-30 * math.sin(t * 12), 0, 0)); hpose(PEAS, "thigh_R", (-25 * math.sin(t * 12), 0, 0)) if "thigh_R" in PEAS["parts"] else None
    bpy.context.view_layer.update()
    hp = K.hpart(PEAS, "hand_R"); hv = [o.matrix_world @ v.co for o in [hp] + list(hp.children) for v in o.data.vertices]
    h = Vector((sum(p.x for p in hv) / len(hv), sum(p.y for p in hv) / len(hv), max(p.z for p in hv)))   # ladder rests ON the fingertips
    LADDER.rotation_euler = (math.pi / 2, math.pi / 2 - 0.06, 0)                         # lying along X, on edge
    LADDER.location = h + Vector((1.8, 0.0, LAD_W / 2 + 0.005))
    TORCH.location = (IX - 3.0, -0.6, 2.2)
    u = K.ease(t / d)
    if t < wt(11, "until") + 0.1:                                         # low, looking up at the two hanging men
        cam.data.lens = 30 * (1 + 0.25 * u)
        lk((IX + 0.9 * math.sin(-0.6 + 1.0 * u), -3.0 + 0.6 * u, SILL_Z - 1.4 + 0.3 * u), (IX, -0.25, SILL_Z - 0.75), t, math.radians(-6 + 8 * u), a=1.4)
    elif t < tl + 0.2:                                                    # Henry's skeptic look
        face_cam(HERO, 0.9, 32, dz=0.0, orbit=0.3, roll=math.radians(6), t=t)
    else:                                                                 # the peasant runs in, the ladder is far too long
        cam.data.lens = 22
        lk((IX + 3.4, -6.6, 1.5), (IX + 1.9, -0.5, 3.0), t, math.radians(-5))


def s13(t, d):   # "So if your bathroom floor ever creaks, remember:" — modern Kaneda on the toilet, a tile creaks, slow look down
    HERO.faces_dir = FACES; CROWN.hide_render = True
    sit(HERO, (JX, 0.88, 0.0), math.pi + math.pi)
    HERO.arm.rotation_euler = (0, 0, 0)
    arms(HERO, up=(0.25, -0.45, -1), fore=(0.05, -1, -0.15))
    tc = wt(12, "creaks") - 0.2
    k = K.ease((t - tc) / 0.15) * (1 - K.ease((t - tc - 0.25) / 0.3))
    CREAK_TILE.location.z = -0.03 + 0.012 * k; CREAK_TILE.rotation_euler = (math.radians(2.5 * k), 0, 0)
    if t > tc:
        CREAK_CRACK.location = (JX + 0.25 + 0.0, -1.35, 0.002); CREAK_CRACK.rotation_euler = (0, 0, 0.6)
    down = K.ease((t - tc - 0.1) / 1.2)
    HERO.turn_head(0, math.radians(32 * down))
    HERO.face("nervous" if t > tc + 0.4 else "blank")
    u = K.ease(t / d); cam.data.lens = 26
    if t < tc + 0.3:
        cam.data.lens = 20
        lk((JX + 0.25 - 0.2 * u, -2.3 + 0.5 * u, 1.45), (JX + 0.05, 0.7, 0.95), t, math.radians(-5 + 3 * u))
    else:
        face_cam(HERO, 0.95 - 0.15 * K.ease((t - tc - 0.3) / 1.2), 30, dz=0.1, orbit=0.25, roll=math.radians(-6), t=t)


SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13]
assert len(SHOTS) == len(SHOT_RANGES), (len(SHOTS), len(SHOT_RANGES))
CAST = {s03: [ARCH, LAND], s04: [BARB], s05: NOBLES + [ARCH, LAND], s10: [LAND], s12: [ARCH, PEAS]}
HERO_IN = {s04, s05, s07, s11, s12, s13}


def apply(frame):
    i = max(j for j in range(len(SHOT_RANGES)) if SHOT_RANGES[j][0] <= frame)
    f0, f1 = SHOT_RANGES[i]; t = (frame - f0) / FPS; d = (f1 - f0) / FPS
    for o in [PIN, CRACK, CRACK2, WORM_HEAD, TALLY, LADDER, TORCH, CREAK_CRACK] + ROPES + WORM + DRIPS:
        park(o)
    for o in [CRACK, CRACK2] + ROPES:
        o.scale = (1, 1, 1)
    for L in (T60, T1184):
        L.hide()
    E_FLOOR.hide_render = False; NICHE_SEAT.hide_render = False; E_SKY.hide_render = False
    night(False); land_muck(False); H_LEDGE.hide_render = True; NAME.hide(); park(CROZIER)
    for dr in DRIPS:
        dr.scale = (1, 1, 1)
    HERO.rest(); HERO.faces_dir = MEDIEVAL; HERO.face("neutral"); CROWN.hide_render = False; CROWN_DROP[0] = 0.0
    place(HERO, (EX, NY + 0.1, 0), math.pi)
    for (lvl, side), piv in SLABS.items():
        piv.rotation_euler = (0, 0, 0)
    for fig, *_, rest in G_FIGS:
        fig.location = rest; fig.rotation_euler = (0, 0, 0)
    CREAK_TILE.location.z = -0.03; CREAK_TILE.rotation_euler = (0, 0, 0); HORSE.location.z = 0.85
    fn = SHOTS[i]
    vis = CAST.get(fn, [])
    for r in PEOPLE_ALL:
        pose_reset(r); show(r, r in vis); r.rotation_euler = (0, 0, 0)
    HERO.hide(fn not in HERO_IN)
    CROWN.hide_render = fn not in HERO_IN or fn is s13
    cam.data.lens = 35
    fn(t, d)
    crown_follow()
    K.ps1_snap_update(cam)
    bpy.context.view_layer.update()


def handler(scene, depsgraph=None):
    apply(scene.frame_current)


exec(open(os.path.join(HERE, "v3.py")).read())                 # v3: concrete places with depth (user, 2026-11-04)
K.ps1_snap(cam, grid_h=int(os.environ.get("PS1_GRID", 240)))   # 240 rows (approved config)
bpy.app.handlers.frame_change_pre.clear()
bpy.app.handlers.frame_change_pre.append(handler)
sc.frame_start, sc.frame_end = 0, END - 1


def board_frames(i, f0, f1):
    """ONE key frame per shot: the moment that sells the line."""
    s = lambda line, w, dt=0.12: f0 + round((wt(line, w) + dt) * FPS)
    picks = {0: [s(0, "nobles", 0.3), s(0, "toilet", 0.25)], 1: s(1, "1184", 0.6), 2: s(2, "feuding", 0.3), 3: [s(3, "emperor", 0.3), s(3, "18", 0.2), s(3, "shake", 0.2)],
             4: s(4, "crammed", 0.1), 5: s(5, "rotten", 0.3), 6: s(6, "then", 0.25), 7: s(7, "latrine", 0.1),
             8: s(8, "choking", 0.2), 9: s(9, "lived", 0.15), 10: s(10, "niche", 0.0), 11: s(11, "ladder", 0.1),
             12: s(12, "creaks", 0.7)}
    p_ = picks[i] if isinstance(picks[i], list) else [picks[i]]
    return [min(max(f, f0), f1 - 1) for f in p_]


def render_to(path):
    if "hands_follow" in globals():
        hands_follow()
    sc.render.filepath = path; bpy.ops.render.render(write_still=True)


if "--test" in ARGS:                                               # self-check: cast + props isolated
    out = os.path.join(HERE, "test"); os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = 50
    bpy.app.handlers.frame_change_pre.clear(); apply(SHOT_RANGES[4][0])
    nxt = ARGS[ARGS.index("--test") + 1] if len(ARGS) > ARGS.index("--test") + 1 else ""
    only = nxt.split(",") if nxt and not nxt.startswith("--") else None
    TX = 500.0                                                   # empty lineup stage
    K.box("T_floor", (40, 10, 0.1), (TX, 0, -0.05), col("#5A5E66")); K.plane("T_bg", 60, 20, (TX, 4, 5), mat=col("#8A9098", True))

    def lineup():
        for r in PEOPLE_ALL:
            show(r, True); pose_reset(r)
        for j, r in enumerate(PEOPLE_ALL):
            pput(r, (TX - 4.0 + j * 1.0, 0, 0), 0.0)

    def shot(nm, pos, tgt, lens=30):
        if only and nm not in only:
            return
        cam.data.lens = lens; K.look(cam, Vector(pos), Vector(tgt)); K.ps1_snap_update(cam); bpy.context.view_layer.update()
        render_to(os.path.join(out, f"selfcheck_{nm}.png"))

    HERO.hide(True)
    lineup()
    shot("cast_front", (TX, -9.5, 1.2), (TX, 0, 1.0), 26)
    for r in PEOPLE_ALL:
        r.rotation_euler = (0, 0, math.radians(35))
    shot("cast_34", (TX - 0.3, -7.5, 1.7), (TX, 0, 1.4), 30)
    for r in PEOPLE_ALL:
        r.rotation_euler = (0, 0, 0)
    shot("heads_a", (TX - 2.5, -2.6, 1.65), (TX - 2.5, 0, 1.55), 35)
    shot("heads_b", (TX + 1.5, -2.6, 1.65), (TX + 1.5, 0, 1.55), 35)
    shot("heads_c", (TX - 3.5, -2.6, 1.65), (TX - 3.5, 0, 1.55), 35)
    shot("heads_d", (TX - 0.5, -2.6, 1.65), (TX - 0.5, 0, 1.55), 35)
    shot("heads_e", (TX + 3.5, -2.6, 1.65), (TX + 3.5, 0, 1.55), 35)
    for r in PEOPLE_ALL:
        r.rotation_euler = (0, 0, math.radians(90))
    shot("cast_side", (TX, -9.5, 1.2), (TX, 0, 1.0), 26)
    for r in PEOPLE_ALL:
        show(r, False)
    HERO.hide(False); HERO.rest(); place(HERO, (TX, 0, 0), 0.0); HERO.face("nervous"); CROWN.hide_render = False
    crown_follow()
    shot("henry_front", (TX + 0.2, -2.2, 1.4), (TX, 0, 1.0), 30)
    shot("henry_crown", (TX + 0.35, -0.75, 1.75), (TX, 0, 1.6), 40)
    sit(HERO, (TX, 0, 0), 0.0); arms(HERO, up=(0.25, -0.45, -1), fore=(0.05, -1, -0.15)); crown_follow()
    K.box("T_seat", (0.6, 0.45, 0.06), (TX, 0.1, 0.47), stone)
    shot("henry_sit_side", (TX + 2.2, -0.3, 0.8), (TX, 0, 0.7), 30)
    crown_follow()
    HERO.rest(); hang(HERO, 2.0, 0.0, TX + 3, 0.0); crown_follow()
    K.box("T_bar", (1.0, 0.04, 0.04), (TX + 3, 0.0, 2.0), iron)
    shot("henry_hang", (TX + 3.6, -2.2, 1.6), (TX + 3, 0, 1.3), 30)
    # props
    HERO.hide(True)
    photobox("T_toilet", (0.62, 0.42, 0.42), (TX - 6, 0, 0.21), os.path.join(PROPS, "toilet_front.png"), os.path.join(PROPS, "toilet_top.png"))
    PP.loft(os.path.join(REF, "barrel.jpg"), "T_barrel", height=0.9, sides=10, loc=(TX - 5, 0, 0))
    PP.loft(os.path.join(REF, "goblet.jpg"), "T_gob", height=0.3, sides=8, loc=(TX - 4.4, 0, 0))
    cross_cut(os.path.join(REF, "stool_cut.png"), "T_stool", 0.48, (TX - 3.9, 0, 0))
    beam("T_beam", 1.6, 0.25, (TX - 5.5, 0.6, 1.2))
    for o in bpy.data.objects:
        if o.type == "MESH" and o.name.startswith("T_") and not any(m.type == "NODES" for m in o.modifiers):
            o.modifiers.new("ps1", "NODES").node_group = bpy.data.node_groups["PS1Snap"]
    shot("props", (TX - 5.0, -3.2, 1.1), (TX - 5.0, 0, 0.5), 30)
    print("TEST done")
if "--board" in ARGS:
    out = os.path.join(HERE, "review", "board", "raw"); os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = 50
    nxt = ARGS[ARGS.index("--board") + 1] if len(ARGS) > ARGS.index("--board") + 1 else ""
    picks = nxt.split(",") if nxt and not nxt.startswith("--") else None
    for i, (f0, f1) in enumerate(SHOT_RANGES):
        if picks and str(i + 1) not in picks:
            continue
        for tag, f in zip("abc", board_frames(i, f0, f1)):
            sc.frame_set(f)
            render_to(os.path.join(out, f"shot_{i + 1:02d}{tag}_{f:05d}.png"))
    print("BOARD", len(SHOT_RANGES))
if "--frames" in ARGS:
    a, b = (int(x) for x in ARGS[ARGS.index("--frames") + 1].split(","))
    out = os.path.join(HERE, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a, b + 1):
        sc.frame_set(f)
        render_to(os.path.join(out, f"{f:05d}.png"))
    print("FRAMES", a, b)

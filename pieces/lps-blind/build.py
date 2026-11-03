"""You're Blind 40 Minutes A Day — punkpolyshorts #3 (Blender 5.2, EEVEE).
blender -b -P build.py -- --board [1,2,..]   -> review/board/raw/shot_XX[abc].png (half res, raw; post.py --board adds dither + captions)
blender -b -P build.py -- --frames a,b       -> renders/frames/#####.png (full res)
blender -b -P build.py -- --feed             -> tex/props/feed_*.png (what Kaneda sees: the control-room monitors)
blender -b -P build.py -- --test             -> test/selfcheck_*.png (cast + props isolated)
Shot timing from voice/timing.json (one shot per voice line); every state is a function of the frame."""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lpskit as K  # noqa: E402
import photoprop as PP  # noqa: E402
import motion as MO  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TIM = json.load(open(os.path.join(HERE, "voice", "timing.json")))
FPS = K.FPS
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
SHOT_RANGES = [(CUT[i], (CUT[i + 1] if i + 1 < len(CUT) else END)) for i in range(len(CUT))]
FACES = os.path.join(HERE, "tex", "faces")
REF = os.path.join(HERE, "ref")
PROPS = os.path.join(HERE, "tex", "props")


def wt(line, prefix, end=False):
    """Seconds into shot `line` (0-based) where the word starting with prefix is spoken."""
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))
    return (w["e"] if end else w["s"]) - CUT[line] / FPS


sc = K.reset("#20242C")
cam = K.camera("Cam", 35)


def egg(name, w, loc, frame="#2A1E14", rot=(math.pi / 2, 0, 0), border=0.04):
    """Framed easter-egg picture (tex/eggs, nearest). The frame box sits 2 cm behind the picture, whatever wall it is on."""
    img = bpy.data.images.load(os.path.join(HERE, "tex/eggs", name + ".png")); h = w * img.size[1] / img.size[0]
    n = Matrix.Rotation(rot[2], 3, "Z") @ Vector((0, -1, 0))                      # the picture's facing direction
    f = K.box("eggf_" + name, (w + 2 * border, 0.03, h + 2 * border), Vector(loc) - n * 0.02, K.mat_color("eggf_" + name, frame))
    f.rotation_euler = (0, 0, rot[2])
    return K.plane("egg_" + name, w, h, loc, rot=rot, mat=K.mat_image("egg_" + name, img, emit_only=True))


def wallprop(name, height, loc, yaw, depth=0.0, body="#8A6038"):
    """Set piece from ONE Flow photo (ref/<name>_cut.png, alpha cut-out) + an optional body box behind it."""
    p, w = cutout(os.path.join(REF, name + "_cut.png"), name, height, loc, rot=(math.pi / 2, 0, yaw))
    if depth:
        n = Matrix.Rotation(yaw, 3, "Z") @ Vector((0, -1, 0))
        b = K.box(name + "_body", (w * 0.94, depth, height * 0.97), Vector(loc) - n * (depth / 2 + 0.006), K.mat_color(name + "_b", body))
        b.rotation_euler = (0, 0, yaw)
    return p


def cutout(path, name, height, loc, rot=(math.pi / 2, 0, 0)):
    """Photo prop as an alpha cut-out plane (CRT front, mirror frame): the photo's silhouette, PS1 palette."""
    img = bpy.data.images.load(path); w = height * img.size[0] / img.size[1]
    m = K.mat_image(name + "_m", img, alpha=True)
    m.surface_render_method = "DITHERED"
    return K.plane(name, w, height, loc, rot=rot, mat=m), w


# ---------------------------------------------------------------- ROOM (x=0): Kaneda at his standing desk, faces -Y
wall = K.mat_image("wallpaper", K.tex_wallpaper("wp", base="#5E7FA8", motif="#52719A"))
K.box("room_back", (5, 0.1, 3), (0, 1.3, 1.5), wall, uv_scale=0.6)
K.box("room_front", (5, 0.1, 3), (0, -2.6, 1.5), wall, uv_scale=0.6)
K.box("room_left", (0.1, 5, 3), (-2.0, -0.6, 1.5), wall, uv_scale=0.6)
K.box("room_right", (0.1, 5, 3), (2.0, -0.6, 1.5), wall, uv_scale=0.6)
K.box("room_floor", (5, 5, 0.1), (0, -0.6, -0.05), K.mat_image("planks", K.tex_planks("pl")), uv_scale=0.8)
K.box("room_ceil", (5, 5, 0.1), (0, -0.6, 2.9), K.mat_color("ceil", "#D8D4CC"))
wood = K.mat_image("deskwood", K.tex_planks("dw", base="#7A5230", seed=7))
DESK_Z = 1.0
K.box("desk_top", (1.5, 0.7, 0.05), (0, -0.62, DESK_Z - 0.025), wood, uv_scale=1.5)
for sx in (-1, 1):
    for sy in (-1, 1):
        K.box(f"desk_leg{sx}{sy}", (0.05, 0.05, DESK_Z - 0.05), (sx * 0.7, -0.62 + sy * 0.3, (DESK_Z - 0.05) / 2), K.mat_color("deskleg", "#3A2A1C"))
# CRT (photo cut-out front + beige body behind it), facing Kaneda (+Y)
CRT_INFO = json.load(open(os.path.join(REF, "crt_cut.json")))


def crt(name, loc, yaw, height=0.42):
    """A photo CRT: alpha front (ref/crt_cut.png) + tapered beige body + its own screen plane (returned)."""
    root = K.link(bpy.data.objects.new(name, None)); root.location = loc; root.rotation_euler = (0, 0, yaw)
    front, w = cutout(os.path.join(REF, "crt_cut.png"), name + "_front", height, (0, 0, height / 2))
    front.parent = root
    s = CRT_INFO["screen"]
    bm = K.mat_color("crt_body", "#CFC6AE")
    K.box(name + "_body", (w * 0.9, height * 0.55, height * 0.62), (0, height * 0.29, height * 0.52), bm).parent = root
    K.box(name + "_tail", (w * 0.6, height * 0.35, height * 0.42), (0, height * 0.7, height * 0.5), bm).parent = root
    sw, sh = (s[1] - s[0]) * w * 0.98, (s[3] - s[2]) * height * 0.98
    scr = K.plane(name + "_screen", sw, sh, (((s[0] + s[1]) / 2 - 0.5) * w, -0.004, height * (1 - (s[2] + s[3]) / 2)),
                  mat=K.mat_color(name + "_off", "#101410", emit_only=True))
    scr.parent = root
    return root, scr


CRT_ROOM, CRT_ROOM_SCR = crt("crt_room", (0, -0.78, DESK_Z), math.pi)
MUG = PP.loft(os.path.join(REF, "mug.jpg"), "mug", height=0.11, sides=10, loc=(0.45, -0.45, DESK_Z))
LAMP = PP.loft(os.path.join(REF, "lamp.jpg"), "lamp", height=0.46, sides=8, loc=(-0.55, -0.75, DESK_Z))
LAMP.rotation_euler = (0, 0, math.pi)
# wall clock on the right wall, facing -X (photo of a handless clock, lathe squashed to a disc) + code hands
CLK_C = Vector((1.94, -0.25, 1.95)); CLK_R = 0.2
CLOCK = PP.loft(os.path.join(REF, "clock_nohands.jpg"), "clock", height=2 * CLK_R, sides=12, loc=(0, 0, 0))
CLOCK.scale = (1, 0.18, 1); CLOCK.rotation_euler = (0, 0, -math.pi / 2); CLOCK.location = CLK_C - Vector((0, 0, CLK_R))


def hand(name, length, width, hexc, dx):
    o = K.box(name, (0.008, width, length), (0, 0, 0), K.mat_color(name, hexc, emit_only=True))
    for v in o.data.vertices:
        v.co.z += length / 2 - length * 0.15
    o.location = CLK_C + Vector((-CLK_R * 0.18 - dx, 0, 0))
    return o


H_HOUR = hand("h_hour", CLK_R * 0.5, 0.022, "#111111", 0.006)
H_MIN = hand("h_min", CLK_R * 0.75, 0.016, "#111111", 0.012)
H_SEC = hand("h_sec", CLK_R * 0.85, 0.007, "#D01818", 0.018)
H_HOUR.rotation_euler = (math.radians(-60), 0, 0); H_MIN.rotation_euler = (math.radians(60), 0, 0)
# eggs: the user's favourites from #1 stay in the mirror set; here the real memes about eyes
egg("distracted", 0.95, (-0.75, 1.24, 1.85))
egg("kaneda_selfie", 0.42, (0.9, 1.24, 1.85), frame="#F4F0E8") if os.path.exists(os.path.join(HERE, "tex/eggs/kaneda_selfie.png")) else None   # tourist selfie in Paris
egg("boxart", 0.42, (-1.94, 0.45, 1.75), rot=(math.pi / 2, 0, math.pi / 2))     # PS1 box art, left wall
egg("potato", 0.36, (1.94, -1.25, 1.85), rot=(math.pi / 2, 0, -math.pi / 2), frame="#B08A3A")   # weird painting, right wall
wallprop("door", 2.05, (1.94, 0.72, 1.025), -math.pi / 2)
wallprop("window", 1.25, (-1.94, -0.95, 1.55), math.pi / 2)
wallprop("shelf", 1.2, (1.45, 0.95, 0.6), 0.0, depth=0.28)
FEED_IMG = None
FEED_SCR = K.mat_image("feed_room_scr", bpy.data.images.load(os.path.join(HERE, "tex/eggs/thisisfine.png")), emit_only=True)
CRT_ROOM_SCR.data.materials[0] = FEED_SCR                       # the meme he's staring at

# ---------------------------------------------------------------- CONTROL ROOM (x=40): the brain at the console
CX = 40.0
K.box("ctl_back", (6, 0.1, 3.2), (CX, 1.6, 1.6), K.mat_image("ctlw", K.tex_tiles("ctw", a="#2A3550", b="#26304A", grout="#151B2C", tiles=4)), uv_scale=1)
K.box("ctl_floor", (6, 6, 0.1), (CX, 0, -0.05), K.mat_image("ctlf", K.tex_tiles("ctf", a="#3A3F48", b="#30343C", grout="#1A1C20", tiles=2)), uv_scale=1.5)
K.box("ctl_left", (0.1, 6, 3.2), (CX - 2.6, 0, 1.6), K.mat_color("ctll", "#232C42"))
K.box("ctl_right", (0.1, 6, 3.2), (CX + 2.6, 0, 1.6), K.mat_color("ctlr", "#232C42"))
K.box("ctl_ceil", (6, 6, 0.1), (CX, 0, 3.2), K.mat_color("ctlc", "#1A2030"))
MONS = []
for j, z in enumerate((0.95, 1.62)):                                          # bigger feeds (user): 3 x 2, 0.62 m CRTs
    for i, x in enumerate((-0.72, 0.0, 0.72)):
        MONS.append(crt(f"mon{j}{i}", (CX + x, 1.25, z), 0.0, height=0.62))
K.box("mon_shelf0", (2.4, 0.6, 0.06), (CX, 1.4, 0.92), K.mat_color("shelf", "#4A4E58"))
K.box("mon_shelf1", (2.4, 0.6, 0.06), (CX, 1.4, 1.59), K.mat_color("shelf", "#4A4E58"))
K.box("console", (2.2, 0.5, 0.75), (CX, 0.55, 0.375), K.mat_color("console", "#6A707C"))
K.box("console_top", (2.2, 0.55, 0.05), (CX, 0.53, 0.77), K.mat_color("consolet", "#3C4048"))
for i in range(12):
    K.box(f"btn{i}", (0.06, 0.06, 0.03), (CX - 0.9 + i * 0.12 + (0.5 if i > 5 else 0) * 0, 0.4 + 0.1 * (i % 2), 0.8),
          K.mat_color(f"btn{i}", ("#E02020", "#20C040", "#F0D020", "#2080F0")[i % 4], emit_only=True))
LEVER_PIV = K.link(bpy.data.objects.new("lever_piv", None)); LEVER_PIV.location = (CX - 0.5, 0.45, 0.8)
K.box("lever_base", (0.16, 0.12, 0.05), (CX - 0.5, 0.45, 0.81), K.mat_color("leverb", "#202020"))
LEVER = K.box("lever", (0.025, 0.025, 0.32), (0, 0, 0.16), K.mat_color("lever", "#B0B4BC")); LEVER.parent = LEVER_PIV
KNOB = K.uv_sphere("knob", 0.04, (0, 0, 0.33), K.mat_color("knob", "#E02020"), seg=8, rings=6); KNOB.parent = LEVER_PIV
BRAIN = K.brain("brain", 0.3, (CX, 0.0, 1.06))                                  # faces +Y: it watches the screens
BRAIN_YAW = math.pi
STOOL = PP.loft(os.path.join(REF, "stool.jpg"), "stool", height=0.8, sides=10, loc=(CX, 0.0, 0.0))
PUPILS = [o for o in BRAIN.children if "pupil" in o.name]
PUPIL_X = [o.location.x for o in PUPILS]
NOODLE = K.box("noodle", (0.04, 0.04, 1.0), (0, 0, 0), K.mat_color("noodle", "#F0A0A8"))
egg("thisisfine", 0.45, (CX - 1.75, 1.54, 2.25))                              # meme
egg("chicken", 0.42, (CX + 1.8, 1.54, 2.2), frame="#B08A3A")                   # eerie Courage-style painting
egg("duck", 0.42, (CX - 2.54, -0.3, 1.7), rot=(math.pi / 2, 0, math.pi / 2), frame="#5A3A22")   # random object photo
CTL_LABEL = K.Letters3D("ctl_lbl", "LIVE FEED", size=0.2, front="#F0F0F0", side="#808080", loc=(CX, 1.05, 2.42), seed=5, jitter=0.4)
NOW_IMG = bpy.data.images.load(os.path.join(PROPS, "feed_now.png")) if os.path.exists(os.path.join(PROPS, "feed_now.png")) else None
NEXT_IMG = bpy.data.images.load(os.path.join(PROPS, "feed_next.png")) if os.path.exists(os.path.join(PROPS, "feed_next.png")) else None
M_NOW = K.mat_image("m_now", NOW_IMG, emit_only=True) if NOW_IMG else K.mat_color("m_now", "#5080C0", emit_only=True)
M_NEXT = K.mat_image("m_next", NEXT_IMG, emit_only=True) if NEXT_IMG else K.mat_color("m_next", "#C08050", emit_only=True)
M_BLACK = K.mat_color("m_black", "#050505", emit_only=True)
PHOTO = K.box("photo", (0.36, 0.012, 0.28), (0, 0, -50), K.mat_color("photo_back", "#F4F0E6"))      # the pasted photo
PHOTO_IMG = K.plane("photo_img", 0.32, 0.24, (0, -0.007, 0), mat=M_NEXT); PHOTO_IMG.parent = PHOTO
STAMP = K.Letters3D("stamp", "ON TIME", size=0.11, front="#E02020", side="#801010", seed=9, jitter=0.5)

# ---------------------------------------------------------------- EYE (x=80): stylised eyeball cutaway in the head
EX = 80.0
K.water_bg("eye_bg", 14, 14, (EX, 2.5, 1.5), colors=("#5A1020", "#8A2030", "#B84050", "#E07080"), px=72, speed=0.03)
EYE = K.link(bpy.data.objects.new("eye", None)); EYE.location = (EX, 0, 1.5); EYE.scale = (1.35, 1.35, 1.35)
_scl = K.uv_sphere("sclera", 0.34, (0, 0, 0), K.mat_image("sclera_m", K.image_from_array("sclera_t", __import__("numpy").array(
    [[[248, 244, 240] if (x * 7 + y * 3) % 23 else [214, 80, 90] for x in range(32)] for y in range(32)], dtype="uint8"))), seg=14, rings=10)
_scl.parent = EYE
_iris = K.uv_sphere("iris", 0.16, (0, -0.305, 0), K.mat_color("iris", "#3A7CC8"), seg=12, rings=6); _iris.scale = (1, 0.35, 1); _iris.parent = EYE
_pup = K.uv_sphere("pupil", 0.08, (0, -0.345, 0), K.mat_color("pupil", "#050505", emit_only=True), seg=10, rings=6); _pup.scale = (1, 0.3, 1); _pup.parent = EYE
_hl = K.uv_sphere("eye_hl", 0.028, (0.05, -0.37, 0.055), K.mat_color("hl", "#FFFFFF", emit_only=True), seg=6, rings=4); _hl.parent = EYE
NERVE = K.box("nerve", (0.16, 1.6, 0.16), (EX, 1.2, 1.5), K.mat_color("nerve", "#E8A0A0"))
for i, (x, z) in enumerate(((-0.25, 0.1), (0.2, -0.15), (0.0, 0.25))):
    K.box(f"muscle{i}", (0.05, 0.9, 0.05), (EX + x, 0.75, 1.5 + z), K.mat_color("muscle", "#B03040"))
TGT_Y = -1.0
TARGETS = []
for i, (nm, img, x, z, w) in enumerate((("t_clock", os.path.join(REF, "clock_nohands_cut.png"), -0.42, 2.1, 0.3),
                                        ("t_mug", os.path.join(REF, "mug_cut.png"), 0.42, 1.95, 0.22),
                                        ("t_lamp", os.path.join(REF, "lamp_cut.png"), -0.42, 0.95, 0.26),
                                        ("t_monkey", os.path.join(HERE, "tex/eggs/monkey.png"), 0.4, 0.95, 0.3))):
    im = bpy.data.images.load(img); h = w * im.size[1] / im.size[0]
    mt = K.mat_image(nm + "_m", im, emit_only=True, alpha=nm != "t_monkey")
    if nm != "t_monkey":
        mt.surface_render_method = "DITHERED"
    TARGETS.append(K.plane(nm, w, h, (EX + x, TGT_Y, z), mat=mt))          # what the eye looks at, facing the camera
YEL = K.mat_color("yel", "#F5EB30", emit_only=True)
JUMPS = [K.box(f"jump{i}", (0.03, 0.03, 1.0), (0, 0, -50), YEL) for i in range(4)]
DOTS = [K.uv_sphere(f"dot{i}", 0.05, (0, 0, -50), YEL, seg=8, rings=5) for i in range(5)]
GAZE_ORDER = [3, 0, 1, 2, 3]                                    # monkey -> clock -> mug -> lamp -> monkey

# ---------------------------------------------------------------- BATH (x=120): the mirror set of video #1 + a photo frame
BX = 120.0
tile = K.mat_image("tiles", K.tex_tiles("tl", a="#EEF2F2", b="#EEF2F2", grout="#9AA4A8"))
tile_r = K.mat_image("tiles_r", K.tex_tiles("tl2", a="#DDE6EA", b="#DDE6EA", grout="#8C989E"))
MY, MW, MH, MZ = 0.6, 0.95, 1.15, 1.5
for nm, sx, cx in (("l", 3.0, BX - MW / 2 - 1.5), ("r", 3.0, BX + MW / 2 + 1.5)):
    K.box("bath_w" + nm, (sx, 0.1, 3.2), (cx, MY + 0.05, 1.6), tile, uv_scale=2)
K.box("bath_wb", (MW, 0.1, MZ - MH / 2), (BX, MY + 0.05, (MZ - MH / 2) / 2), tile, uv_scale=2)
K.box("bath_wt", (MW, 0.1, 3.2 - MZ - MH / 2), (BX, MY + 0.05, (3.2 + MZ + MH / 2) / 2), tile, uv_scale=2)
_fw, _fh = MW / (0.787 - 0.211), MH / (0.836 - 0.163)
FRAME, _ = cutout(os.path.join(REF, "mirror_frame_cut.png"), "mirror_frame", _fh, (BX, MY - 0.045, MZ))   # opening centred (0.50, 0.50)
K.box("bath_sink", (0.7, 0.45, 0.2), (BX, MY - 0.25, 0.75), K.mat_color("sink", "#F8F8F8"))
K.box("bath_ped", (0.25, 0.25, 0.65), (BX, MY - 0.2, 0.33), K.mat_color("ped", "#E6E6E6"))
K.box("bath_floor", (6, 6, 0.1), (BX, 0, -0.05), K.mat_image("btile", K.tex_tiles("bt", a="#3C4CA0", b="#E8E8F0", grout="#20283C", tiles=2)), uv_scale=1.5)
K.box("bath_back", (6, 0.1, 3.2), (BX, -2.4, 1.6), tile, uv_scale=2)
K.box("bath_ceil", (6, 6, 0.1), (BX, -0.9, 3.2), K.mat_color("bceil", "#E8ECEE"))
K.box("refl_back", (6, 0.1, 3.2), (BX, 2 * MY + 2.4, 1.6), tile_r, uv_scale=2)
K.box("refl_floor", (6, 6, 0.1), (BX, 2 * MY + 1.2, -0.05), K.mat_color("rfloor", "#8E9AC8"))
K.box("refl_l", (0.1, 6, 3.2), (BX - 2.0, 2 * MY + 1.2, 1.6), tile_r, uv_scale=2)
K.box("refl_r", (0.1, 6, 3.2), (BX + 2.0, 2 * MY + 1.2, 1.6), tile_r, uv_scale=2)
K.box("refl_ceil", (6, 6, 0.1), (BX, 2 * MY + 1.2, 3.2), K.mat_color("rceil", "#D8E0E4"))
glass = K.mat_color("glass", "#BFE8FF", emit_only=True)
g_out = next(n for n in glass.node_tree.nodes if n.type == "OUTPUT_MATERIAL")
g_em = next(n for n in glass.node_tree.nodes if n.type == "EMISSION")
g_tr = glass.node_tree.nodes.new("ShaderNodeBsdfTransparent"); g_mx = glass.node_tree.nodes.new("ShaderNodeMixShader")
g_mx.inputs[0].default_value = 0.04                         # lighter tint: s09 is shot through it
glass.node_tree.links.new(g_tr.outputs[0], g_mx.inputs[1]); glass.node_tree.links.new(g_em.outputs[0], g_mx.inputs[2])
glass.node_tree.links.new(g_mx.outputs[0], g_out.inputs[0]); glass.surface_render_method = "BLENDED"
K.plane("mirror_glass", MW, MH, (BX, MY - 0.03, MZ), mat=glass)
egg("meme_mirror", 0.62, (BX - 1.25, MY - 0.01, 1.7), frame="#F4F0E8")
egg("monkey", 0.5, (BX + 1.2, MY - 0.01, 1.65))
egg("goldfish", 0.42, (BX + 0.75, -2.34, 1.8), rot=(math.pi / 2, 0, math.pi), frame="#B08A3A")   # eerie Courage-style painting, back wall
wallprop("door", 2.05, (BX - 0.9, -2.34, 1.025), math.pi)

# ---------------------------------------------------------------- cast
HERO = K.Kaneda("hero", (0, 0, 0), faces_dir=FACES)
REFL = K.Kaneda("refl", (BX, 2 * MY, 0), yaw=0.0, mirror=True, faces_dir=FACES)
PEOPLE = os.path.join(HERE, "tex", "people")


def person(name, loc, yaw, scale=(1, 1, 1)):
    """A distinct person (never a Kaneda recolour): hombre's body with their own Flow face + clothes (tex/people.py)."""
    r = K.hombre(name, loc, yaw=yaw, tex={"head": os.path.join(PEOPLE, f"{name}_head_128.png"), "body": os.path.join(PEOPLE, f"{name}_body_256.png")})
    r.scale = scale
    return r


FRIEND = person("friend", (BX + 0.5, -0.7, 0), math.radians(160), (0.96, 0.96, 0.95))


def add_bun(r, hexc="#24170F"):
    """Her own hairstyle (user): a curly bun on top-back of the head, parented to the head part."""
    bpy.context.view_layer.update()
    hd = K.hpart(r, "head"); P = [hd.matrix_world @ v.co for v in hd.data.vertices]
    top = max(p.z for p in P); c = sum(P, Vector()) / len(P)
    back = Matrix.Rotation(r.rotation_euler.z, 3, "Z") @ Vector((0, 1, 0))
    rad = 0.062 * r.scale.x
    b = K.uv_sphere(r.name + "_bun", rad, Vector((c.x, c.y, top)) + back * 0.06 - Vector((0, 0, 0.025)),
                    K.mat_image(r.name + "_bunm", K.tex_noise("bun_t", px=16, base=hexc, amp=14)), seg=9, rings=6)
    b.scale = (1.0, 1.0, 0.82)
    for v in b.data.vertices:                                                 # lumpy curls
        v.co *= 1 + 0.12 * math.sin(v.co.x * 90) * math.cos(v.co.z * 70)
    bpy.context.view_layer.update()
    mw = b.matrix_world.copy(); b.parent = hd; b.matrix_world = mw
    return b


BUN = add_bun(FRIEND)
ALL_K = [HERO, REFL]
T40 = K.Letters3D("t40", "40 MIN", size=0.3, seed=4)
TRY = K.Letters3D("try", "TRY IT", size=0.3, front="#A0FF3C", side="#4C8A10", seed=6)
ZIPS = [K.arrow(f"zip{i}", 0.09, YEL, (0, 0, -50), (math.pi / 2, 0, 0)) for i in range(2)]
def _paper_tex():
    """A printed sheet: white paper, a black 'blackout frame' printed at the top, grey text lines below (64x48)."""
    import numpy as np
    a = np.full((48, 64, 3), 242, np.uint8); a[..., 2] = 232
    a[4:22, 6:58] = 18                                                       # the printed black frame
    a[4:22, 6:7] = a[4:22, 57:58] = a[4:5, 6:58] = a[21:22, 6:58] = 90
    rng = np.random.default_rng(5)
    for y in range(26, 45, 3):                                               # lines of print
        a[y, 6:6 + int(rng.integers(30, 52))] = 120
    return K.image_from_array("paper_t", a)


CARD_SIDE = K.mat_color("card_side", "#E8E6DE")
CARD_TOP = K.mat_image("card_top", _paper_tex())
CARDS = []
for i in range(26):                                                          # paper sheets (were solid black slabs)
    c = K.box(f"card{i}", (0.3, 0.22, 0.004), (0, 0, -50), CARD_SIDE)
    top = K.plane(f"card{i}_top", 0.3, 0.22, (0, 0, 0.0025), rot=(0, 0, 0), mat=CARD_TOP); top.parent = c
    CARDS.append(c)

# ---------------------------------------------------------------- camera helpers (from #1 / #2)


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
    hh = depth * cam.data.sensor_width / 2 / cam.data.lens
    return hh * 1080 / 1920, hh


def on_screen(o, x, y, depth, tilt=(0.0, 0.0, 0.0)):
    """Put o at screen (x, y) (frame half-sizes) at depth m, facing the camera (its front = local +Z)."""
    bpy.context.view_layer.update()
    hw, hh = cam_frame(depth)
    m = cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt[0], 3, "X") @ Matrix.Rotation(tilt[1], 3, "Y") @ Matrix.Rotation(tilt[2], 3, "Z")
    w = m.to_4x4(); w.translation = cam.matrix_world @ Vector((x * hw, y * hh, -depth))
    o.matrix_world = w @ Matrix.Diagonal((*o.scale, 1))


def letters_on_screen(L, t, t_in, t_out=None, x=0.0, y=0.45, width=0.85, depth=1.0, tilt=math.radians(-8)):
    """A Letters3D title in camera space, `width` of the frame wide (glyphs ~0.62 x size each)."""
    bpy.context.view_layer.update()
    hw, hh = cam_frame(depth)
    n = sum(1 for ch in L.letters)
    sc_ = width * 2 * hw / (0.66 * L.size * (n + 1))
    L.root.matrix_world = Matrix.Translation(cam.matrix_world @ Vector((x * hw, y * hh, -depth))) @ \
        (cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt, 3, "Y")).to_4x4()
    L.anim(t, t_in, t_out=t_out, scale=sc_)


def eyes(k, base, d):
    """Eye direction by atlas swap: d = 'L', 'R' or '' (centre)."""
    k.face(f"{base}_{d}" if d else base)


def noodle(a, b):
    """The brain's pink noodle arm as a box stretched from a to b."""
    a, b = Vector(a), Vector(b); v = b - a
    NOODLE.location = (a + b) / 2
    NOODLE.rotation_euler = v.to_track_quat("Z", "Y").to_euler()
    NOODLE.scale = (1, 1, v.length)


def head_look(k, yaw=0.0, pitch=0.0):
    k.turn_head(yaw, pitch); bpy.context.view_layer.update()


# ---------------------------------------------------------------- shots (t = seconds into the shot, d = length)


def s01(t, d):   # "You're blind for about forty minutes every day. And you've never noticed." — desk, 1-frame black (post), "40 MIN"
    HERO.face("blank")
    t40 = wt(0, "40") - 0.05; t_and = wt(0, "and")
    u = K.ease(t / d)
    face_cam(HERO, 2.0 * punch(t, 0.0, 1.4, 0.5) - 0.3 * u, 28, dx=-0.2 + 0.15 * u, dz=-0.12, orbit=0.55 - 0.2 * u, roll=math.radians(-6 + 4 * u), t=t)
    letters_on_screen(T40, t, t40, t_out=t_and - 0.1, y=0.55)
    if t > t_and:                                                     # "never noticed": push in on the blank face
        face_cam(HERO, 0.75 - 0.12 * K.ease((t - t_and) / 1.0), 35, dz=-0.02, orbit=0.15, roll=math.radians(-5), t=t)


def s02(t, d):   # "Your eyes don't glide across things. They jump, three or four times a second." — eyes slide (no), then the eyeball snaps
    tj = wt(1, "they") - 0.1
    if t < tj:
        HERO.face("neutral")
        k = int(t * 3.2) % 3; eyes(HERO, "neutral", ("L", "", "R")[k])
        face_cam(HERO, 0.62 - 0.06 * t, 40, dz=0.0, orbit=0.08, roll=math.radians(3), t=t)
        return
    tt = t - tj
    hits = [0.0] + [wt(1, w) - tj for w in ("jump", "three", "four", "second")]
    k = max(i for i, h in enumerate(hits) if h <= tt)                 # current fixation
    tgt = TARGETS[GAZE_ORDER[k]].location
    snap = min(1.0, (tt - hits[k]) / 0.04)                            # ~1 frame: a saccade, no glide
    prv = TARGETS[GAZE_ORDER[max(k - 1, 0)]].location
    aim = prv.lerp(tgt, snap)
    EYE.rotation_euler = (Vector((0, -1, 0)).rotation_difference((aim - EYE.location).normalized())).to_euler()
    for i in range(k):                                                # the jump lines drawn so far
        a = TARGETS[GAZE_ORDER[i]].location + Vector((0, -0.03, 0)); b = TARGETS[GAZE_ORDER[i + 1]].location + Vector((0, -0.03, 0))
        v = b - a; JUMPS[i].location = (a + b) / 2; JUMPS[i].rotation_euler = v.to_track_quat("Z", "Y").to_euler(); JUMPS[i].scale = (1, 1, v.length)
    for i in range(k + 1):
        DOTS[i].location = TARGETS[GAZE_ORDER[i]].location + Vector((0, -0.04, 0))
    cam.data.lens = 22
    u = K.ease(tt / max(d - tj, 0.1))
    lk((EX + 0.45 - 0.3 * u, -2.75 + 0.3 * u, 1.75 - 0.1 * u), (EX + 0.03, -0.6, 1.5), t, math.radians(-6 + 5 * u), a=1.4)


def s03(t, d):   # "Mid-jump, everything would smear like a shaky phone video." — whip pans round the room (smear in post)
    HERO.face("nervous")
    yaw = MO.s03_yaw(t)
    c = HERO.head_world()
    cam.data.lens = 26
    p = c + Matrix.Rotation(yaw, 3, "Z") @ Vector((0.25, -1.25, 0.05))
    tgt = p + Matrix.Rotation(0.6 * yaw, 3, "Z") @ (c + Vector((0, 0, -0.05)) - p)        # the view whips past him
    lk(p, tgt, t, math.radians(9 * math.sin(t * 7)), a=2.5)


def cam_behind(t, u):
    """Over the brain's shoulder: its back in the corner, the monitor wall it watches fills the frame."""
    cam.data.lens = 22
    lk((CX - 0.5 + 0.15 * u, -1.0 + 0.2 * u, 1.5), (CX + 0.05, 1.25, 1.3), t, math.radians(5 - 4 * u))


def cam_front(t, u):
    """Reverse from the screens' side: the brain's face and eyes looking at the monitors (the camera)."""
    cam.data.lens = 21
    lk((CX + 0.32 - 0.12 * u, 0.98, 1.3 + 0.03 * u), (CX, 0.0, 1.08), t, math.radians(-6 + 4 * u), a=0.7)


def gaze(dx=0.0):
    """Brain pupils slide sideways (local x) inside its eyes; 0 = straight at the screens."""
    for o, x0 in zip(PUPILS, PUPIL_X):
        o.location.x = x0 + dx


def lever(pull):
    LEVER_PIV.rotation_euler = (math.radians(-35 + 75 * pull), 0, 0)
    bpy.context.view_layer.update()
    knob = KNOB.matrix_world.translation
    bpy.context.view_layer.update()
    side = min((BRAIN.matrix_world @ Vector((sx * 0.3 * 1.12, 0, -0.05)) for sx in (-1, 1)), key=lambda p: (p - knob).length)
    noodle(side, knob + (side - knob).normalized() * 0.045)


def monitors(mat):
    for root, scr in MONS:
        scr.data.materials[0] = mat


def s04(t, d):   # "So your brain just cuts the feed." — behind: it watches the feed; front: it yanks the lever
    tc = wt(3, "cuts") - 0.05
    pull = K.ease((t - tc) / 0.12)
    lever(pull)
    monitors(M_BLACK if t > tc + 0.08 else M_NOW)
    BRAIN.rotation_euler = (0, 0, BRAIN_YAW + math.radians(4 * math.sin(t * 3)))
    u = K.ease(t / d)
    if t < tc - 0.12:                                                # angle 1: over its shoulder, the screens it watches
        cam_behind(t, u)
        CTL_LABEL.anim(t, -1.0, wobble=0.6)                             # already fully popped in
        gaze(0.02 * math.sin(t * 6))
    else:                                                             # angle 2 (clean cut): its eyes on the screens, the yank
        cam_front(t, u)
        cam.data.lens = 21 * (1 + 0.35 * K.ease((t - tc) / 0.2))      # punch on the cut
        gaze(0.0)


def s05(t, d):   # "Then it fills the gap with whatever you saw next, and lies about the timing." — paste + stamp, Kaneda skeptic
    tl = wt(4, "lies") - 0.1
    if t >= tl + 0.75:                                              # cut: Kaneda doesn't buy it
        HERO.face("skeptic")
        face_cam(HERO, 0.7 - 0.08 * K.ease((t - tl) / 1.0), 35, dx=-0.1, orbit=-0.3, roll=math.radians(-7), t=t)
        return
    lever(1.0); monitors(M_BLACK)
    BRAIN.rotation_euler = (0, 0, BRAIN_YAW)
    m = MONS[4][1]                                                   # the centre monitor of the top row
    bpy.context.view_layer.update()
    dst = m.matrix_world.translation + Vector((0, -0.02, 0))
    src = BRAIN.matrix_world.translation + Vector((0, 0.32, 0.1))
    tf = wt(4, "fills") - 0.05
    u = K.ease((t - tf) / 0.45)
    if t < tl - 0.05:                                                 # angle 1: behind it, the photo goes onto the screen
        PHOTO.location = src.lerp(dst, u) + Vector((0, 0, 0.25 * math.sin(math.pi * u)))
        PHOTO.rotation_euler = (0, 0, math.radians(30 * (1 - u)))
        s = 0.6 + 0.4 * u; PHOTO.scale = (s, s, s)
        if t > tf + 0.45:
            m.data.materials[0] = M_NEXT; park(PHOTO)
        cam_behind(t, K.ease(t / d))
        cam.data.lens = 22 * (1 + 0.45 * K.ease((t - tf - 0.3) / 0.5))
        lk(cam.location, dst.lerp(Vector((CX, 0.6, 1.3)), 0.35), t)
    else:                                                             # angle 2: its eyes dart (the lie), "ON TIME"
        m.data.materials[0] = M_NEXT
        cam_front(t, K.ease((t - tl) / 0.7))
        gaze(0.035 * (1 if int((t - tl) * 7) % 2 else -1))
        letters_on_screen(STAMP, t, tl + 0.05, y=0.5, width=0.8, tilt=math.radians(-12))


def s06(t, d):   # "That's why the first tick of a clock sometimes lasts too long." — glance, the first second hangs, shocked
    tg = wt(5, "first") - 0.15; tl = wt(5, "lasts") - 0.05
    if t < tg:                                                        # the glance: eyes jump to the clock
        HERO.face("stern" if t < 0.35 else "stern_R")
        head_look(HERO, math.radians(-30 * K.ease((t - 0.3) / 0.15)))
        face_cam(HERO, 0.8, 32, dx=0.1, orbit=0.35, roll=math.radians(5), t=t)
        return
    if t > tl + 0.45:                                                 # "too long": shocked
        HERO.face("shocked"); head_look(HERO, math.radians(-30))
        face_cam(HERO, 0.75 * punch(t, tl + 0.45, 1.3, 0.3), 35, orbit=-0.25, roll=math.radians(-6), t=t)
        return
    tt = t - tg
    hold = 1.15                                                       # chronostasis: the first tick hangs ~1.15 s
    n = 0 if tt < hold else 1 + int(tt - hold)
    H_SEC.rotation_euler = (math.radians(6 * (n + 45)), 0, 0)
    cam.data.lens = 40
    c = CLK_C
    lk(c + Vector((-1.2 + 0.25 * K.ease(tt / 2.0), -0.15, -0.08)), c, t, math.radians(-4), a=0.6)


def bath_ots(t):
    cam.data.lens = 28; u = K.ease(t / 2.5)
    lk((BX + 0.45 - 0.3 * u, -0.85 + 0.25 * u, 1.75), (BX - 0.02, MY + 0.6, 1.55), t, math.radians(-6 + 8 * u))


def s07(t, d):   # "Want proof? Find a mirror. Look at your left eye, then your right." — mirror set, "TRY IT"
    place(HERO, (BX, 0, 0), math.pi)
    tl = wt(6, "left"); tr = wt(6, "right")
    dirn = "" if t < tl else ("L" if t < tr else "R")
    for k in (HERO, REFL):
        eyes(k, "stern", dirn)
    bath_ots(t)
    if t < tl - 0.1:
        letters_on_screen(TRY, t, wt(6, "proof") - 0.1, t_out=tl - 0.35, y=0.55, width=0.75)
    else:                                                             # over the shoulder -> on the reflection's eyes
        c = REFL.head_world(); h = HERO.head_world()
        cam.data.lens = 45
        lk(h + Vector((0.2, -0.28, 0.06)), c, t, math.radians(-3), a=0.5)


def s08(t, d):   # "You'll never see your own eyes move." — the reflection: eyes jump, nothing in between
    place(HERO, (BX, 0, 0), math.pi)
    k = int(t / 0.33) % 4
    d_ = ("L", "R", "L", "R")[k] if t > 0.15 else ""
    for kk in (HERO, REFL):
        eyes(kk, "blankp", d_)                                     # blank stare with dot pupils: the jump reads
    c = REFL.head_world()
    cam.data.lens = 55
    lk(c + Vector((0.0, -1.1 + 0.35 * K.ease(t / d), 0.0)), c + Vector((0, 0, -0.01)), t, math.radians(2), a=0.4)


def s09(t, d):   # "Your friend standing behind you sees them move just fine." — from inside the mirror: she sees the eyes travel
    place(HERO, (BX, 0, 0), math.pi)
    HERO.face("angry")
    ph = (t * 3.0) % 2.0                                              # L -> centre -> R -> centre: the motion she sees
    d_ = "L" if ph < 0.45 else ("" if ph < 0.55 or (0.95 < ph < 1.05) or ph > 1.95 else ("R" if ph < 1.45 else ""))
    HERO.face("stern" + ("_" + d_ if d_ else ""))
    if t > wt(8, "fine") - 0.2:
        HERO.face("angry")
    FRIEND.rotation_euler = (0, 0, math.radians(165))
    K.hpart(FRIEND, "head").rotation_euler = (0, 0, math.radians(-10))
    c = HERO.head_world()
    cam.data.lens = 30; u = K.ease(t / d)
    lk(Vector((BX - 0.25 + 0.15 * u, MY + 0.35, 1.6)), c + Vector((0.18, 0, -0.08)), t, math.radians(-5 + 4 * u), a=0.8)
    ts = wt(8, "sees") - 0.1                                          # yellow motion arrows by his eyes while they travel
    if t > ts:
        bpy.context.view_layer.update()
        right = cam.matrix_world.to_3x3() @ Vector((1, 0, 0))
        for i, z in enumerate(ZIPS):
            z.location = c + right * (0.13 * (1 if i else -1)) + Vector((0, 0.04, 0.0))      # beside his eyes, mirror side
            z.rotation_euler = (math.pi / 2, 0, 0 if ph < 1.0 else math.pi)


def s10(t, d):   # "Add up all those tiny blackouts, and you're blind for about forty minutes every day." — black frames stack into "40 MIN"
    HERO.face("blank")
    t40 = wt(9, "40") - 0.05
    n = len(CARDS)
    base = Vector((0.42, -0.62, DESK_Z + 0.006))
    for i, c in enumerate(CARDS):
        ti = 0.15 + 1.9 * (i / n) ** 0.8                              # faster and faster
        u = K.ease((t - ti) / 0.25)
        if t < ti:
            continue
        land = base + Vector((0.01 * math.sin(i * 2.1), 0.01 * math.cos(i * 1.7), i * 0.014))
        start = land + Vector((1.3, -0.25 * math.sin(i * 1.3), 0.06 + 0.04 * math.cos(i)))     # low, from the right: below his face
        c.location = start.lerp(land, u)
        c.rotation_euler = (0, 0, math.radians(15 * math.sin(i * 1.9)) + (1 - u) * 3.0)
    cam.data.lens = 30
    u = K.ease(t / d)
    if t < t40 - 0.3:
        lk((0.95 - 0.25 * u, -1.75, 1.6), (0.25, -0.55, 1.2 + 0.15 * u), t, math.radians(6 - 4 * u))
    else:                                                             # loop: back to the s01 framing
        tt = t - (t40 - 0.3)
        face_cam(HERO, 2.0 * punch(tt, 0.0, 1.4, 0.5), 28, dx=-0.2, dz=-0.12, orbit=0.55, roll=math.radians(-6), t=t)
        letters_on_screen(T40, t, t40, y=0.5)


SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10]
assert len(SHOTS) == len(SHOT_RANGES), (len(SHOTS), len(SHOT_RANGES))
CAST = {s01: [HERO], s02: [HERO], s03: [HERO], s05: [HERO], s06: [HERO], s07: [HERO, REFL], s08: [REFL], s09: [HERO, FRIEND], s10: [HERO]}


def place(k, loc, yaw):
    k.arm.location = (loc[0], loc[1], (loc[2] if len(loc) > 2 else 0) + K.KZ); k.arm.rotation_euler = (0, 0, yaw)


def hide_hombre(r, h):
    for o in r.children_recursive:
        o.hide_render = h


def apply(frame):
    i = max(j for j in range(len(SHOT_RANGES)) if SHOT_RANGES[j][0] <= frame)
    f0, f1 = SHOT_RANGES[i]; t = (frame - f0) / FPS; d = (f1 - f0) / FPS
    for o in [PHOTO, NOODLE] + JUMPS + DOTS + ZIPS + CARDS:
        park(o)
    PHOTO.scale = NOODLE.scale = (1, 1, 1)
    for L in (T40, TRY, STAMP, CTL_LABEL):
        L.hide()
    for k in ALL_K:
        k.rest()
    place(HERO, (0, 0, 0), 0); place(REFL, (BX, 2 * MY, 0), 0)
    HERO.face("neutral"); REFL.face("neutral")
    H_SEC.rotation_euler = (math.radians(6 * 45), 0, 0)
    lever(0.0); monitors(M_NOW); BRAIN.rotation_euler = (0, 0, BRAIN_YAW); gaze(0.0)
    EYE.rotation_euler = (0, 0, 0)
    cam.data.lens = 35
    fn = SHOTS[i]
    vis = CAST.get(fn, [])
    for k in ALL_K:
        k.hide(k not in vis)
    hide_hombre(FRIEND, FRIEND not in vis)
    for o in FRIEND.children_recursive:
        if o.type == "MESH" and o.parent != FRIEND:
            o.rotation_euler = (0, 0, 0)
    fn(t, d)
    K.ps1_snap_update(cam)
    bpy.context.view_layer.update()


def handler(scene, depsgraph=None):
    apply(scene.frame_current)


K.ps1_snap(cam, grid_h=int(os.environ.get("PS1_GRID", 240)))   # 240 rows (approved config)
bpy.app.handlers.frame_change_pre.clear()
bpy.app.handlers.frame_change_pre.append(handler)
sc.frame_start, sc.frame_end = 0, END - 1


def board_frames(i, f0, f1):
    """Key frames per shot for the board: the moment that sells the line."""
    s = lambda line, w, dt=0.12: f0 + round((wt(line, w) + dt) * FPS)
    picks = {0: [s(0, "40", 0.35), s(0, "never", 0.2)], 1: [f0 + 12, s(1, "four", 0.1)], 2: [f0 + 25, (f0 + f1) // 2 + 6],
             3: [f0 + 8, s(3, "feed", 0.05)], 4: [s(4, "gap", 0.0), s(4, "about", 0.1), s(4, "timing", 0.3)],
             5: [f0 + 14, s(5, "tick", 0.2), f1 - 6], 6: [s(6, "mirror", 0.0), s(6, "right", 0.05)],
             7: [f0 + 14, f0 + 24], 8: [s(8, "sees", 0.15), f1 - 8], 9: [f0 + 22, s(9, "and", 0.0), s(9, "40", 0.45)]}
    return [min(max(f, f0), f1 - 1) for f in picks[i]]


if "--feed" in ARGS:                                               # what Kaneda sees -> the control-room monitors
    os.makedirs(PROPS, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 320, 240, 100
    bpy.app.handlers.frame_change_pre.clear(); apply(0)
    HERO.hide(True); cam.data.lens = 24; cam.data.sensor_fit = "HORIZONTAL"; cam.data.sensor_width = 36
    for nm, tgt in (("feed_now", (0, -0.78, DESK_Z + 0.2)), ("feed_next", (CLK_C.x, CLK_C.y, CLK_C.z - 0.1))):
        K.look(cam, (0, 0.05, 1.62), tgt); K.ps1_snap_update(cam)
        sc.render.filepath = os.path.join(PROPS, nm + ".png"); bpy.ops.render.render(write_still=True)
    print("FEED done")
if "--selfie" in ARGS:                                             # wall picture: Kaneda's tourist selfie in Paris
    bpy.app.handlers.frame_change_pre.clear(); apply(0)
    SX = 200.0
    paris = bpy.data.images.load(os.path.join(HERE, "tex/eggs/src/paris.jpg"))
    K.plane("paris", 7.5, 7.5 * paris.size[1] / paris.size[0], (SX, 3.0, 0.4), mat=K.mat_image("paris_m", paris, emit_only=True))
    HERO.hide(False); place(HERO, (SX - 0.15, 0, 0), math.radians(-12)); HERO.face("happy")
    HERO.turn_head(math.radians(8), math.radians(-6))
    sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 600, 800, 100
    cam.data.lens = 24; c = HERO.head_world()
    K.look(cam, c + Vector((0.25, -0.62, 0.12)), c + Vector((0.1, 0, -0.08)), math.radians(-8)); K.ps1_snap_update(cam)
    sc.render.filepath = os.path.join(HERE, "tex/eggs/src/kaneda_selfie_raw.png"); bpy.ops.render.render(write_still=True)
    print("SELFIE done")
if "--thumb" in ARGS:                                              # cover: shocked Kaneda, a giant saccading eyeball, "40 MIN"
    bpy.app.handlers.frame_change_pre.clear(); apply(0)
    HERO.hide(False); place(HERO, (EX, -1.55, 0.35), 0.0); HERO.face("shocked")
    EYE.scale = (2.6, 2.6, 2.6); EYE.location = (EX + 0.15, -0.2, 2.15)
    EYE.rotation_euler = (math.radians(-12), 0, math.radians(18))
    for o in TARGETS + [NERVE]:
        o.hide_render = True
    cam.data.lens = 24; c = HERO.head_world()
    K.look(cam, c + Vector((0.1, -0.95, 0.4)), c + Vector((0.0, 0, 0.38)), math.radians(-6)); K.ps1_snap_update(cam)
    bpy.context.view_layer.update()
    letters_on_screen(T40, 2.0, 0.0, y=0.36, width=0.98, depth=0.6, tilt=math.radians(-10))
    sc.render.resolution_percentage = 100
    sc.render.filepath = os.path.join(HERE, "renders", "thumb_raw.png"); bpy.ops.render.render(write_still=True)
    print("THUMB done")
if "--test" in ARGS:                                               # self-check: cast + props isolated
    out = os.path.join(HERE, "test"); os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = 50
    bpy.app.handlers.frame_change_pre.clear(); apply(0)
    views = {"kaneda_front": (HERO.head_world() + Vector((0.3, -2.4, -0.5)), HERO.head_world() + Vector((0, 0, -0.6)), 30),
             "desk": (Vector((0.9, -2.0, 1.55)), Vector((0, -0.6, 1.1)), 30),
             "clock": (CLK_C + Vector((-1.0, 0.0, 0)), CLK_C, 40),
             "friend": (Vector((BX + 0.5, -2.6, 1.0)), Vector((BX + 0.5, -0.7, 0.95)), 35),
             "friend_face": (Vector((BX + 0.62, 0.0, 1.6)), Vector((BX + 0.5, -0.7, 1.55)), 40),
             "control": (Vector((CX - 1.2, -1.5, 1.6)), Vector((CX, 0.6, 1.2)), 24),
             "eye": (Vector((EX + 0.45, -2.75, 1.75)), Vector((EX, -0.6, 1.5)), 22),
             "mirror": (Vector((BX + 0.4, -1.2, 1.6)), Vector((BX, MY, 1.5)), 28),
             "control_front": (None, None, 26), "room_wide": (Vector((0.3, -2.4, 1.7)), Vector((0, 0.4, 1.3)), 18)}
    only = ARGS[ARGS.index("--test") + 1].split(",") if len(ARGS) > ARGS.index("--test") + 1 else list(views)
    for nm in only:
        p, tg, lens = views[nm]
        place(HERO, (BX, 0, 0), math.pi) if nm == "mirror" else None
        HERO.hide(nm not in ("kaneda_front", "desk", "mirror")); REFL.hide(nm != "mirror"); hide_hombre(FRIEND, not nm.startswith("friend"))
        if nm == "control":
            lever(0.6)
        if nm == "control_front":
            lever(0.6); cam_front(0, 0); K.ps1_snap_update(cam); bpy.context.view_layer.update()
            sc.render.filepath = os.path.join(out, f"selfcheck_{nm}.png"); bpy.ops.render.render(write_still=True); continue
        cam.data.lens = lens; K.look(cam, p, tg); K.ps1_snap_update(cam); bpy.context.view_layer.update()
        sc.render.filepath = os.path.join(out, f"selfcheck_{nm}.png"); bpy.ops.render.render(write_still=True)
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
            sc.render.filepath = os.path.join(out, f"shot_{i + 1:02d}{tag}_{f:05d}.png")
            bpy.ops.render.render(write_still=True)
    print("BOARD", len(SHOT_RANGES))
if "--frames" in ARGS:
    a, b = (int(x) for x in ARGS[ARGS.index("--frames") + 1].split(","))
    out = os.path.join(HERE, "renders", "frames"); os.makedirs(out, exist_ok=True)
    for f in range(a, b + 1):
        sc.frame_set(f)
        sc.render.filepath = os.path.join(out, f"{f:05d}.png")
        bpy.ops.render.render(write_still=True)
    print("FRAMES", a, b)

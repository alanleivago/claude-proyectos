"""You've Never Seen Your Own Face — punkpolyshorts #1 (Blender 5.2, EEVEE).
blender -b -P build.py -- --board            -> review/board/shot_XX.png (one still per shot, half res)
blender -b -P build.py -- --frames a,b       -> renders/frames/#####.png for that range (full res)
Shot timing comes from voice/timing.json (line starts); every visual state is a function of the frame
(frame_change_pre handler), so stills and animation render identically."""
import json
import math
import os
import sys

import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lpskit as K  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TIM = json.load(open(os.path.join(HERE, "voice", "timing.json")))
FPS = K.FPS
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
_w30 = next(w for w in TIM["words"] if w["w"].strip(".,").lower() in ("30", "thirty"))
PCT_T = _w30["s"] - CUT[5] / FPS                # seconds into shot 6
SWELL_T = next(w for w in TIM["words"] if w["line"] == 5 and w["w"].lower().startswith("nose"))["s"] - CUT[5] / FPS
YEAR_OUT = next(w for w in TIM["words"] if w["line"] == 7 and "19" in w["w"])["e"] - CUT[7] / FPS + 0.1
SHOT_RANGES = [(CUT[i], (CUT[i + 1] if i + 1 < len(CUT) else END)) for i in range(len(CUT))]

sc = K.reset("#9AA0A8")
cam = K.camera("Cam", 35)

# ---------------------------------------------------------------- sets
# APT (x=0): lavender wallpaper living room, Kaneda faces -Y
wall = K.mat_image("wallpaper", K.tex_wallpaper("wp"), repeat=(1, 1))
K.box("apt_back", (8, 0.1, 4), (0, 1.6, 2), wall, uv_scale=0.6)
K.box("apt_left", (0.1, 8, 4), (-2.6, -2, 2), wall, uv_scale=0.6)
K.box("apt_floor", (8, 8, 0.1), (0, -2, -0.05), K.mat_image("planks", K.tex_planks("pl")), uv_scale=0.8)
K.box("apt_ceil", (8, 8, 0.1), (0, -2, 3.0), K.mat_color("ceil", "#E8E4DC"))
K.box("apt_winframe", (1.3, 0.12, 1.1), (1.3, 1.56, 1.75), K.mat_color("winf", "#F4F0E8"))
# easter eggs (user, 2026-10-30): comic pictures on the walls, made with Flow -> tex/eggs (224 px, nearest)
def egg(name, w, loc, frame="#2A1E14", rot=(math.pi / 2, 0, 0), border=0.05):
    img = bpy.data.images.load(os.path.join(HERE, "tex/eggs", name + ".png")); h = w * img.size[1] / img.size[0]
    back = loc[1] + 0.03
    K.box("eggf_" + name, (w + 2 * border, 0.03, h + 2 * border), (loc[0], back, loc[2]), K.mat_color("eggf_" + name, frame))
    return K.plane("egg_" + name, w, h, loc, rot=rot, mat=K.mat_image("egg_" + name, img, emit_only=True))


egg("meme_mirror", 1.05, (1.3, 1.49, 1.75), frame="#F4F0E8")          # the old window: Hide-the-Pain Harold, "ME IN EVERY PHOTO"
egg("family_armslength", 0.8, (-0.9, 1.53, 1.85))                       # above the couch
K.box("apt_couch", (2.0, 0.8, 0.45), (-0.9, 1.0, 0.25), K.mat_color("couch", "#7A4A30"))
K.box("apt_couchb", (2.0, 0.25, 0.6), (-0.9, 1.35, 0.7), K.mat_color("couchb", "#6A3E28"))
K.box("apt_lamp", (0.08, 0.08, 1.5), (1.9, 1.1, 0.75), K.mat_color("lamp", "#303030"))
K.box("apt_shade", (0.4, 0.4, 0.3), (1.9, 1.1, 1.6), K.mat_color("shade", "#F2E2A0", emit_only=True))

# BATH (x=30): tiled bathroom; Kaneda at y=0 faces +Y into a mirror at y=0.6; reflection room behind it
BX = 30.0
tile = K.mat_image("tiles", K.tex_tiles("tl", a="#EEF2F2", b="#EEF2F2", grout="#9AA4A8"))
tile_r = K.mat_image("tiles_r", K.tex_tiles("tl2", a="#DDE6EA", b="#DDE6EA", grout="#8C989E"))
MY, MW, MH, MZ = 0.6, 0.95, 1.15, 1.5
for nm, sx, cx in (("l", 3.0, BX - MW / 2 - 1.5), ("r", 3.0, BX + MW / 2 + 1.5)):
    K.box("bath_w" + nm, (sx, 0.1, 3.2), (cx, MY + 0.05, 1.6), tile, uv_scale=2)
K.box("bath_wb", (MW, 0.1, MZ - MH / 2), (BX, MY + 0.05, (MZ - MH / 2) / 2), tile, uv_scale=2)
K.box("bath_wt", (MW, 0.1, 3.2 - MZ - MH / 2), (BX, MY + 0.05, (3.2 + MZ + MH / 2) / 2), tile, uv_scale=2)
wood = K.mat_color("mframe", "#5A3A22")
for nm, s, l in (("t", (MW + 0.1, 0.06, 0.05), (BX, MY - 0.02, MZ + MH / 2)), ("b", (MW + 0.1, 0.06, 0.05), (BX, MY - 0.02, MZ - MH / 2)),
                 ("l", (0.05, 0.06, MH), (BX - MW / 2, MY - 0.02, MZ)), ("r", (0.05, 0.06, MH), (BX + MW / 2, MY - 0.02, MZ))):
    K.box("mirror_" + nm, s, l, wood)
K.box("bath_sink", (0.7, 0.45, 0.2), (BX, MY - 0.25, 0.85), K.mat_color("sink", "#F8F8F8"))
K.box("bath_ped", (0.25, 0.25, 0.75), (BX, MY - 0.2, 0.38), K.mat_color("ped", "#E6E6E6"))
K.box("bath_floor", (6, 6, 0.1), (BX, 0, -0.05), K.mat_image("btile", K.tex_tiles("bt", a="#3C4CA0", b="#E8E8F0", grout="#20283C", tiles=2)), uv_scale=1.5)
K.box("bath_back", (6, 0.1, 3.2), (BX, -2.4, 1.6), tile, uv_scale=2)
# reflection room (behind the mirror): mirrored back wall + a sink copy + a faint glass tint
K.box("refl_back", (6, 0.1, 3.2), (BX, 2 * MY + 2.4, 1.6), tile_r, uv_scale=2)
K.box("refl_floor", (6, 6, 0.1), (BX, 2 * MY + 1.2, -0.05), K.mat_color("rfloor", "#8E9AC8"))
K.box("refl_l", (0.1, 6, 3.2), (BX - 2.0, 2 * MY + 1.2, 1.6), tile_r, uv_scale=2)
K.box("refl_r", (0.1, 6, 3.2), (BX + 2.0, 2 * MY + 1.2, 1.6), tile_r, uv_scale=2)
K.box("refl_ceil", (6, 6, 0.1), (BX, 2 * MY + 1.2, 3.2), K.mat_color("rceil", "#D8E0E4"))
glass = K.mat_color("glass", "#BFE8FF", emit_only=True)
glass.use_nodes = True
g_out = next(n for n in glass.node_tree.nodes if n.type == "OUTPUT_MATERIAL")
g_em = next(n for n in glass.node_tree.nodes if n.type == "EMISSION")
g_tr = glass.node_tree.nodes.new("ShaderNodeBsdfTransparent"); g_mx = glass.node_tree.nodes.new("ShaderNodeMixShader")
g_mx.inputs[0].default_value = 0.12
glass.node_tree.links.new(g_tr.outputs[0], g_mx.inputs[1]); glass.node_tree.links.new(g_em.outputs[0], g_mx.inputs[2])
glass.node_tree.links.new(g_mx.outputs[0], g_out.inputs[0]); glass.surface_render_method = "BLENDED"
K.plane("mirror_glass", MW, MH, (BX, MY - 0.03, MZ), mat=glass)

# LAB (x=60)
LX = 60.0
K.box("lab_back", (8, 0.1, 4), (LX, 2.0, 2), K.mat_image("labt", K.tex_tiles("lt", a="#F4F6F6", b="#E4E8EA", grout="#B4BCC0", tiles=8)), uv_scale=1)
K.box("lab_floor", (8, 8, 0.1), (LX, 0, -0.05), K.mat_image("labf", K.tex_tiles("lf", a="#9AA8A8", b="#8A9898", grout="#6E7A7A", tiles=4)), uv_scale=1)
K.box("lab_bench", (3.0, 0.7, 0.9), (LX, 1.4, 0.45), K.mat_color("bench", "#DADDE0"))
K.box("lab_top", (3.1, 0.75, 0.05), (LX, 1.4, 0.92), K.mat_color("benchtop", "#2E3A40"))
for i, c in enumerate(("#3CF060", "#2C6EE0", "#E01818")):
    K.box(f"lab_flask{i}", (0.12, 0.12, 0.25), (LX - 1.0 + i * 0.35, 1.45, 1.07), K.mat_color(f"fl{i}", c))
K.box("lab_screen", (0.7, 0.05, 0.5), (LX + 0.9, 1.55, 1.3), K.mat_color("scr", "#20282C"))
egg("mirror_of_month", 0.62, (LX - 1.45, 1.93, 2.05), frame="#C8C8C8")   # lab back wall
egg("mona_selfie", 0.55, (LX, 1.93, 2.15), frame="#B08A2A")
egg("pie_prefer", 0.62, (LX + 1.45, 1.93, 2.05), frame="#C8C8C8")
K.box("lab_ceil", (8, 8, 0.1), (LX, 0, 3.4), K.mat_color("labc", "#E4E8EA"))
for sx_ in (-4.0, 4.0):
    K.box(f"lab_side{sx_:+.0f}", (0.1, 8, 4), (LX + sx_, 0, 2), K.mat_image(f"labs{sx_:+.0f}", K.tex_tiles(f"ls{sx_:+.0f}", a="#F4F6F6", b="#E4E8EA", grout="#B4BCC0", tiles=8)), uv_scale=1)

# STREET (x=90)
SX = 90.0
K.box("st_ground", (40, 40, 0.1), (SX, 5, -0.05), K.mat_image("asph", K.tex_noise("as", base="#4A4C50")), uv_scale=0.5)
K.box("st_walk", (40, 3.0, 0.14), (SX, 9.5, 0.0), K.mat_image("walk", K.tex_tiles("wk", a="#A8A8A0", b="#A0A098", grout="#70706A", tiles=2)), uv_scale=1)
for i in range(6):
    col = ("#B45A3C", "#C8A070", "#7A8A9A", "#A04848", "#D0B890", "#6A7A5A")[i]
    K.box(f"st_bld{i}", (6.2, 6, 10 + (i % 3) * 3), (SX - 15 + i * 6.4, 14, (10 + (i % 3) * 3) / 2),
          K.mat_image(f"fac{i}", K.tex_facade(f"fc{i}", wall=col, seed=i)), uv_scale=0.25)
sky = K.mat_image("sky", K.tex_sky("sk2"), emit_only=True)
K.plane("st_sky", 120, 60, (SX, 40, 20), mat=sky)

# MIND (x=120): brain with eyes on animated violet water
NX = 120.0
K.water_bg("mind_bg", 9, 16, (NX, 3.0, 1.5), colors=("#24104A", "#3E1A78", "#6A2AA8", "#A050E0"))
BRAIN = K.brain("brain", 0.55, (NX, 0, 1.5))
LOGO = K.Letters3D("logo", "Punk\nPoly\nShorts", size=0.2, extrude=0.056, font=K.FONT_PUNK, loc=(NX, -0.9, 1.78), line_h=0.92, jitter=1.6)

# PHOTO / REAL vs MIRROR assets
import numpy as np  # noqa: E402


def photo_img(name, flip):
    p = os.path.join(K.ROOT, "pieces/lps-hombre/out/punk_faces/neutral_front.png")
    im = bpy.data.images.load(p); w, h = im.size
    a = (np.array(im.pixels[:], np.float32).reshape(h, w, 4)[::-1] * 255)
    a = a[int(h * 0.12):int(h * 0.88), int(w * 0.18):int(w * 0.82)]
    bgc = np.array([150, 170, 205, 255], np.float32)
    a = a[..., :3] * (a[..., 3:] / 255) + bgc[:3] * (1 - a[..., 3:] / 255)
    a = a[::4, ::4]                              # chunky pixels: a PS1 'photo'
    if flip:
        a = a[:, ::-1]
    a = np.pad(a, ((6, 14), (6, 6), (0, 0)), constant_values=246)
    bpy.data.images.remove(im)
    return K.image_from_array(name, np.clip(a, 0, 255).astype(np.uint8))


PH_REAL = photo_img("ph_real", False)
PH_MIRR = photo_img("ph_mirr", True)
ph_ar = PH_REAL.size[1] / PH_REAL.size[0]
photo_r = K.plane("photo_real", 0.42, 0.42 * ph_ar, (LX - 0.45, -0.1, 1.12), mat=K.mat_image("phr", PH_REAL, emit_only=True))
photo_m = K.plane("photo_mirr", 0.42, 0.42 * ph_ar, (LX + 0.45, -0.1, 1.12), mat=K.mat_image("phm", PH_MIRR, emit_only=True))
LIME = "#A0FF3C"
lab_real = K.Letters3D("lbl_real", "REAL", size=0.13, front=LIME, side="#4C8A10", loc=(LX - 0.45, -0.14, 1.47), seed=5, jitter=0.6)
lab_mirr = K.Letters3D("lbl_mirr", "MIRROR", size=0.13, front=LIME, side="#4C8A10", loc=(LX + 0.45, -0.14, 1.47), seed=6, jitter=0.6)
YEAR = K.Letters3D("year", "1977", size=0.38, loc=(LX, -0.4, 2.25), seed=8)
GREEN = K.mat_color("green", "#3CF060", emit_only=True)
CHECK = K.check("check", 0.35, GREEN, (0, 0, -50))
PCT = K.Letters3D("pct", "+30%", size=0.042, seed=9)
YEL = K.mat_color("yel", "#F5EB30", emit_only=True)
ARROWS = [K.arrow(f"arrow{i}", 0.22, YEL, (0, 0, -50), (math.pi / 2, 0, 0)) for i in range(2)]

# phone
PHONE = K.box("phone", (0.075, 0.012, 0.15), (0, 0, -50), K.mat_color("phoneb", "#141418"))
SCREEN_RED = K.mat_color("scr_red", "#E01818", emit_only=True)
SCREEN_PH = K.mat_image("scr_ph", PH_REAL, emit_only=True)
SCREEN = K.plane("phone_screen", 0.064, 0.13, (0, -0.0065, 0), mat=SCREEN_PH)
SCREEN.parent = PHONE
SCREEN.data.materials.append(SCREEN_RED)

# POV nose: chunky skin pixels in camera space (bottom centre of a lens-18 frame: half-height 0.1 at z=-0.1),
# lit side / shaded side split by the ridge, rounded tip, nostril wing; each pixel can be "deleted" (shot 16)
NOSE_PX = 0.0042
NOSE_COLS = ["#F2B48E", "#D8957A", "#FAC8A4", "#B8735C"]          # lit, shade, tip highlight, nostril


def nose_cell(x, y):
    """Seen from the eyes the bridge is the narrow top and the tip the wide round bulb at the bottom
    (nostrils stay hidden below the tip)."""
    yb, yt = -0.086, -0.03                                         # bulb centre, top of the bridge
    k = min(1.0, max(0.0, (y - yb) / (yt - yb)))                   # 0 at the bulb, 1 at the bridge top
    cx = 0.003 - 0.004 * k
    bulb = (x - 0.003) ** 2 / 0.031 ** 2 + (y - yb) ** 2 / 0.024 ** 2 < 1
    ridge = yb <= y <= yt and abs(x - cx) < 0.03 - 0.022 * k ** 0.8
    if not (bulb or ridge):
        return None
    if (x + 0.005) ** 2 + (y - (yb + 0.006)) ** 2 < 0.008 ** 2:
        return 2                                                   # tip highlight
    if bulb and y < yb - 0.016:
        return 3                                                   # underside of the tip turning away
    return 0 if x < cx - 0.003 else 1                              # lit / shaded side of the ridge


cells, vs, fs, mi = [], [], [], []
for iy in range(-25, -6):
    for ix in range(-14, 14):
        x, y = (ix + 0.5) * NOSE_PX, (iy + 0.5) * NOSE_PX
        c = nose_cell(x, y)
        if c is None:
            continue
        h = NOSE_PX / 2; n = len(vs)
        vs += [(x - h, y - h, -0.1), (x + h, y - h, -0.1), (x + h, y + h, -0.1), (x - h, y + h, -0.1)]
        fs.append((n, n + 1, n + 2, n + 3)); mi.append(c); cells.append((x, y))
NOSE = K.mesh_from("pov_nose", vs, fs)
for i, hx in enumerate(NOSE_COLS):
    NOSE.data.materials.append(K.mat_color(f"nose{i}", hx, emit_only=True))
NOSE.data.polygons.foreach_set("material_index", mi)
NOSE.parent = cam
NOSE_CO = np.array(vs, np.float32)
NOSE_ORDER = np.random.default_rng(3).permutation(len(cells))     # deletion order


def nose_dissolve(u):
    """u in [0,1]: fraction of nose pixels deleted (collapsed to their centre)."""
    co = NOSE_CO.copy(); gone = NOSE_ORDER[:int(round(u * len(cells)))]
    for j in gone:
        co[4 * j:4 * j + 4, :2] = cells[j]
    NOSE.data.vertices.foreach_set("co", co.ravel()); NOSE.data.update()


# characters
HERO = K.Kaneda("hero", (0, 0, 0))
REFL = K.Kaneda("refl", (BX, 2 * MY, 0), yaw=0.0, mirror=True)
HERO_B = K.Kaneda("hero_bath", (BX, 0, 0), yaw=math.pi)
HERO_L = K.Kaneda("hero_lab", (LX - 1.0, -0.7, 0), yaw=math.radians(-20))
FRIENDS = [K.Kaneda("friend_g", (LX - 1.05, -1.25, 0), yaw=math.radians(20), recolor="green"),
           K.Kaneda("friend_r", (LX - 1.75, -0.75, 0), yaw=math.radians(30), recolor="red")]
HERO_S = K.Kaneda("hero_st", (SX, 0, 0))
rng = np.random.default_rng(7)
CROWD = []
for i in range(9):
    x = SX + rng.uniform(-2.2, 2.2); y = rng.uniform(0.9, 3.6)
    if abs(x - SX) < 0.5:
        x += 0.8 * (1 if x >= SX else -1)
    k = K.Kaneda(f"crowd{i}", (x, y, 0), yaw=0.0, recolor=["green", "red", "purple", "orange"][i % 4])
    k.yaw0 = rng.choice([-1, 1]) * rng.uniform(1.2, 2.4)          # walking past, side-on / away
    CROWD.append(k)
RES = [K.hombre("res_a", (LX - 0.45, 0.35, 0), tex={"head": os.path.join(HERE, "tex/prof_head_128.png")}),                                       # old professor (mustard jacket)
       K.hombre("res_b", (LX + 0.45, 0.35, 0), tex={"head": os.path.join(HERE, "tex/sci_head_128.png"),
                                                    "body": os.path.join(HERE, "tex/sci_body_256.png")})]   # lab scientist
BUN = K.uv_sphere("res_bun", 0.05, (0, 0, 0), K.mat_color("bun", "#1A1410"), seg=6, rings=4)
BUN.parent = K.hpart(RES[1], "head"); BUN.location = (0, 0.085, 0.215); BUN.scale = (1, 0.8, 0.85)
ALL_K = [HERO, REFL, HERO_B, HERO_L, HERO_S] + FRIENDS + CROWD


def park(o):
    o.location = (0, 0, -50)


def point(k, side, target_dir):
    """Raise one arm and point it along a model-space direction (forearm + hand follow)."""
    for b in (f"Upperarm.{side}", f"Forearm.{side}", f"Hand.{side}"):
        k.aim(b, target_dir)


# ---------------------------------------------------------------- shots
# each shot: f(t, d) with t = seconds into the shot, d = shot length

def shake(t, a=1.0):
    """Hand-held micro drift (spec: never fully still): position offset + roll."""
    off = Vector((0.012 * math.sin(2.3 * t) + 0.006 * math.sin(5.1 * t + 1), 0.0, 0.010 * math.sin(1.9 * t + 2) + 0.005 * math.sin(4.7 * t)))
    return off * a, math.radians(1.5 * math.sin(1.7 * t) + 0.8 * math.sin(3.9 * t)) * a


def lk(pos, target, t, roll=0.0, a=1.0):
    off, r = shake(t, a)
    K.look(cam, Vector(pos) + off, Vector(target) + off * 0.5, roll + r)


def punch(t, t0, k=1.8, dur=0.45):
    """LPS punch-in: distance divided by k over dur (x1.6-x2 in 0.4-0.5 s)."""
    return 1.0 / (1.0 + (k - 1.0) * K.ease((t - t0) / dur))


def face_cam(k, dist, lens=35, dx=0.0, dz=0.0, roll=0.0, orbit=0.0, t=0.0, a=1.0):
    c = k.head_world()
    fwd = (k.arm.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()
    fwd = Matrix.Rotation(orbit, 3, "Z") @ fwd
    side = fwd.cross(Vector((0, 0, 1))).normalized()
    cam.data.lens = lens
    lk(c + fwd * dist + side * dx + Vector((0, 0, dz)), c + Vector((0, 0, dz * 0.4)), t, roll, a)


def orbit_pos(center, r, ang, h):
    return Vector(center) + Vector((r * math.sin(ang), -r * math.cos(ang), h))


def s01(t, d):     # "You have never seen your own face." — punch-in from a dutch three-quarter
    u = K.ease(t / d)
    HERO.face("neutral")
    face_cam(HERO, 1.3 * punch(t, 0.05, 2.0, 0.5) - 0.04 * t, 35, dz=-0.13, orbit=-0.45 + 0.42 * u, roll=math.radians(9 - 7 * u), t=t)


def s02(t, d):     # "Not once." — macro on the eyes, blink, sliding across
    HERO.face("blink" if 0.25 < t < 0.45 else "neutral")
    c = HERO.head_world() + Vector((0, 0, -0.035))
    cam.data.lens = 50; u = t / d
    lk(c + Vector((0.08 - 0.16 * u, -0.55 + 0.14 * K.ease(u), 0.02)), c, t, math.radians(-7 + 9 * u))


def s03(t, d):     # "Every mirror you've ever looked into flipped it," — fast truck over the shoulder into the mirror
    HERO_B.face("stern"); REFL.face("stern")                  # LPS deadpan at the mirror
    cam.data.lens = 28; u = t / d
    lk((BX + 0.6 - 0.45 * u, -0.8 + 0.2 * u, 1.75 - 0.1 * u), (BX - 0.02, MY + 0.6, 1.5), t, math.radians(-6 + 8 * u))
    for i, a in enumerate(ARROWS):
        s = K.ease(t / 0.4)
        a.location = (BX + (-0.22 if i == 0 else 0.22), MY - 0.08, MZ + MH / 2 - 0.12)
        a.rotation_euler = (math.pi / 2, 0, 0 if i else math.pi)
        a.scale = (s, s, s)


def s04(t, d):     # "so the face you know is backwards." — orbit + punch on the card flip
    HERO_B.face("shocked"); REFL.face("shocked")
    u = K.ease((t - 0.3) / 0.6)
    REFL.arm.scale.x = -K.KS * math.cos(math.pi * u)
    cam.data.lens = 40
    ang = math.radians(32 - 14 * K.ease(t / d))          # stays behind his shoulder (y < 0)
    lk(orbit_pos((BX - 0.02, MY + 0.6, 1.52), 1.75 * punch(t, 0.25, 1.35, 0.45), ang, 0.1), (BX - 0.02, MY + 0.6, 1.52), t, math.radians(5))


def s05(t, d):     # "Photos don't help either." — a phone drops into frame, click + flash; fast push
    HERO.face("stern" if t > 0.62 else "neutral")
    face_cam(HERO, 2.1 - 0.6 * K.ease(t / d), 30, dz=-0.15, orbit=0.3 - 0.4 * t / d, roll=math.radians(-5), t=t)
    hw = HERO.head_world()
    y = max(0.0, 0.45 - 1.6 * t * t)
    PHONE.location = hw + Vector((0.36, -0.85, -0.05 + y)); PHONE.rotation_euler = (math.radians(-8), math.radians(-10), math.radians(-16))
    SCREEN.data.materials[0] = SCREEN_PH


def s06(t, d):     # "Held at arm's length, a phone lens can make your nose look about thirty percent wider."
    HERO.face("grimace" if t > SWELL_T else "neutral")
    c = HERO.head_world()
    cam.data.lens = 18                         # wide selfie lens at ~45 cm: real perspective swelling
    k = punch(t, SWELL_T, 1.25, 0.5)
    lk(c + Vector((0.04 * math.sin(t * 1.4), (-0.36 + 0.015 * t) * k, -0.05)), c + Vector((0, 0, -0.1)), t,
       math.radians(6 * math.sin(t * 1.3)), a=1.8)
    u = K.ease((t - SWELL_T) / 0.6)           # swells on "nose look about"
    pb = HERO.arm.pose.bones["Head"]
    pb.scale = (1, 1, 1 + 0.3 * u)             # Head bone Z = model X (width)
    PCT.root.location = c + Vector((-0.01, -0.12, -0.15)); PCT.root.rotation_euler = (math.pi / 2, 0, math.radians(-10))
    PCT.anim(t, PCT_T, wobble=0.15)            # pops on the spoken "30"


def s07(t, d):     # "You see, your brain loves the version it sees the most." — orbit round the brain + logo
    cam.data.lens = 35
    ang = math.radians(-18 + 36 * t / d)
    lk(orbit_pos((NX, 0, 1.5), 3.3 - 0.45 * K.ease(t / d), ang, 0.1 + 0.25 * math.sin(t * 1.5)), (NX, 0, 1.55), t, math.radians(7 * math.sin(t * 2)))
    BRAIN.rotation_euler = (0, 0, 0.25 * math.sin(t * 1.4))
    LOGO.anim(t, 0.05, t_out=1.85)
    LOGO.root.rotation_euler = (math.pi / 2 - math.radians(14), math.radians(3 * math.sin(t * 1.6)), ang * 0.7 + math.radians(-16 + 5 * math.sin(t * 2)))


def res_pose(t, u):
    """Researchers: u = 0 photos hidden behind the back, 1 held out to the camera (whip in between)."""
    for k, (r, ph) in enumerate(zip(RES, (photo_r, photo_m))):
        sgn = -1 if k == 0 else 1
        hold = (LX + 0.45 * sgn, -0.1, 1.12)
        back = (LX + 0.42 * sgn, 0.8, 0.95)
        for side in ("L", "R"):
            K.hpart(r, f"upperarm_{side}").rotation_euler = (math.radians(22 - 72 * u), 0, math.radians((8 - 14 * u) * (1 if side == "L" else -1)))
            K.hpart(r, f"forearm_{side}").rotation_euler = (math.radians(-20 - 20 * u), 0, 0)
        talk = (1 - u) * math.radians(28) * -sgn + math.radians(3 * math.sin(t * 5 + k))
        K.hpart(r, "head").rotation_euler = (math.radians(4 * math.sin(t * 6.3 + 2 * k) * (1 - u) - 4 * u), 0, talk)
        K.hpart(r, "torso").rotation_euler = (0, 0, (1 - u) * math.radians(12) * -sgn)
        ph.location = (back[0] + (hold[0] - back[0]) * u, back[1] + (hold[1] - back[1]) * u,
                       back[2] + (hold[2] - back[2]) * u + 0.45 * math.sin(math.pi * u))
        ph.rotation_euler = (math.pi / 2, 0, math.pi * (1 - u) * 2 * sgn)       # one full flip on the way out
        sc_ = (0.7 + 0.3 * min(u * 3, 1)) * (1 + 0.25 * math.sin(math.pi * min(u * 1.25, 1)))
        ph.scale = (sc_, sc_, sc_)


SHOW_T = next(w for w in TIM["words"] if w["line"] == 7 and w["w"].lower().startswith("showed"))["s"] - CUT[7] / FPS


def s08(t, d):     # "In 1977, researchers showed people two photos of themselves." — two researchers chat, then whip the photos out
    u = K.ease((t - SHOW_T + 0.05) / 0.4)
    res_pose(t, u)
    cam.data.lens = 24
    c = K.ease(t / SHOW_T)                                   # crane: from the "1977" down to the two researchers
    ang = math.radians(16 - 16 * c - 7 * K.ease((t - SHOW_T) / (d - SHOW_T)))
    r = (2.2 + 0.4 * c) * punch(t, SHOW_T, 1.3, 0.4)
    lk(orbit_pos((LX, 0.2, 0.0), r, ang, 2.35 - 1.05 * c), (LX, 0.0, 2.2 - 0.9 * c - 0.1 * u), t, math.radians(-10 + 13 * c))
    YEAR.anim(t, 0.05, t_out=YEAR_OUT); YEAR.root.rotation_euler = (math.pi / 2, 0, math.radians(4 * math.sin(t * 2)))


def s09(t, d):     # "The real one, and a mirrored one." — fast truck from one photo to the other
    res_pose(t + 9, 1.0)
    cam.data.lens = 30; u = K.ease(t / d)
    lk((LX - 0.55 + 1.1 * u, -1.9 + 0.15 * u, 1.1), (LX - 0.4 + 0.8 * u, -0.1, 1.0), t, math.radians(-5 + 10 * u))
    lab_real.anim(t, 0.1); lab_mirr.anim(t, d * 0.45)


def s10(t, d):     # "They picked the mirrored one." — low-angle orbit, punch on the check
    res_pose(t + 9, 1.0)
    HERO_L.face("happy")
    point(HERO_L, "L", (0.55, -0.6, 0.35))
    cam.data.lens = 22
    ang = math.radians(-25 + 35 * t / d)
    lk(orbit_pos((LX - 0.45, 0.0, 0.0), 2.9 * punch(t, 0.3, 1.35, 0.45), ang, 0.85), (LX - 0.3, 0.0, 1.45), t, math.radians(-8))
    lab_real.anim(t + 3, 0); lab_mirr.anim(t + 3, 0)
    s = K.ease((t - 0.35) / 0.2); CHECK.scale = (s, s, s); CHECK.location = (LX + 0.45, -0.2, 1.95)
    CHECK.rotation_euler = (math.pi / 2, 0, 0)


def s11(t, d):     # "Their friends picked the real one." — dutch push-in
    res_pose(t + 9, 1.0)
    for f in FRIENDS:
        f.face("neutral")
        point(f, "L", (0.6, -0.5, 0.35))
    cam.data.lens = 24; u = K.ease(t / d)
    lk((LX - 0.7 + 0.15 * u, -3.9 + 0.9 * u, 1.45 - 0.2 * u), (LX - 0.7, 0.0, 1.15), t, math.radians(10 - 6 * u))
    lab_real.anim(t + 3, 0); lab_mirr.anim(t + 3, 0)
    s = K.ease((t - 0.35) / 0.2); CHECK.scale = (s, s, s); CHECK.location = (LX - 0.45, -0.2, 1.95)
    CHECK.rotation_euler = (math.pi / 2, 0, 0)


def s12(t, d):     # "That's why your photos look wrong to you." — orbit round face and phone
    HERO.face("skeptic")                      # one brow up at his own photo
    hw = HERO.head_world()
    HERO.aim("Upperarm.R", (-0.2, -0.55, -0.6)); HERO.aim("Forearm.R", (0.35, -0.5, 0.8)); HERO.aim("Hand.R", (0.35, -0.5, 0.8))
    hand = HERO.arm.matrix_world @ HERO.arm.pose.bones["Hand.R"].tail
    PHONE.location = hand + Vector((0.0, -0.02, 0.02)); PHONE.rotation_euler = (math.radians(-15), 0, math.radians(8))
    SCREEN.data.materials[0] = SCREEN_RED if (t > d * 0.45 and int(t * 8) % 2 == 0) else SCREEN_PH
    cam.data.lens = 35
    ang = 0.55 - 0.45 * K.ease(t / d); r = 1.15 - 0.3 * K.ease(t / d)
    lk(hw + Vector((r * math.sin(ang), -r * math.cos(ang), -0.03)), hw + Vector((-0.03, -0.2, -0.1)), t, math.radians(-6))


def s13(t, d):     # "They're the face everyone else gets." — low orbit, punch when the crowd snaps round
    HERO_S.face("nervous" if t > 0.5 else "neutral")   # the crowd snaps round: wide eyes, sweat drop
    cam.data.lens = 26
    ang = math.radians(-30 + 55 * t / d)
    lk(orbit_pos((SX, 0.0, 0.0), 2.4 * punch(t, 0.25, 1.3, 0.4), ang, 0.75), (SX, 1.2, 1.35), t, math.radians(-6), a=1.4)
    u = K.ease((t - 0.25) / 0.25)
    for k in CROWD:                            # everyone snaps round to stare at him (rigid, LPS-style)
        d_ = Vector((SX, 0, 0)) - k.arm.location
        y1 = math.atan2(d_.x, -d_.y)
        dy = (y1 - k.yaw0 + math.pi) % (2 * math.pi) - math.pi
        k.arm.rotation_euler.z = k.yaw0 + dy * u
        k.face("blank" if t > 0.6 else "neutral")


def s14(t, d):     # "The closest you'll ever come is the tip of your nose." — punch-in on the cross-eyed face
    HERO.face("crosseyed")
    face_cam(HERO, 1.35 * punch(t, 0.05, 2.0, 0.45) - 0.05 * t, 35, dz=-0.13, roll=math.radians(5 * math.sin(t * 2.5)), t=t)


def pov(origin, target, t):
    NOSE.hide_render = False
    cam.data.lens = 18
    tg = Vector(target) + Vector((0.9 * math.sin(t * 2.4), 0, 0.25 * math.sin(t * 3.1)))   # head looking around
    lk(origin, tg, t, math.radians(8 * math.sin(t * 5.5)), a=1.5)


def s15(t, d):     # "It's in everything you look at." — POV in three quick cuts, the nose always there
    k = min(2, int(3 * t / d))
    if k == 0:
        pov((SX, 0.0, 1.6), (SX + 0.3, 6, 1.4), t)
    elif k == 1:
        pov((BX, -0.1, 1.6), (BX, MY + 1, 1.45), t)
    else:
        pov((LX - 1.3, -0.4, 1.6), (LX - 0.2, 0.3, 1.3), t)


def s16(t, d):     # "Your brain just deletes it." — the nose breaks into pixels and vanishes
    pov((SX, 0.0, 1.6), (SX + 0.3, 6, 1.4), t)
    nose_dissolve(min(1.0, max(0.0, (t - 0.25) / (d - 0.55))))   # deleted pixel by pixel


def s17(t, d):     # "Which means, technically, you have never seen your own face." — fast push back to the face
    u = K.ease(t / d)
    HERO.face("bloodshot" if t > 0.6 else "neutral")
    face_cam(HERO, 1.6 - 1.0 * u, 35, dz=-0.13, orbit=0.4 * (1 - u), roll=math.radians(7 * (1 - u)), t=t)


SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17]
HERO_CHARS = {s03: [HERO_B, REFL], s04: [HERO_B, REFL], s08: [], s09: [], s10: [HERO_L], s11: FRIENDS,
              s13: [HERO_S] + CROWD}


def apply(frame):
    i = max(j for j in range(len(SHOT_RANGES)) if SHOT_RANGES[j][0] <= frame)
    f0, f1 = SHOT_RANGES[i]; t = (frame - f0) / FPS; d = (f1 - f0) / FPS
    # defaults: park props, rest poses, show the right characters
    for o in [CHECK, PHONE] + ARROWS:
        park(o)
    for w in (YEAR, lab_real, lab_mirr, PCT, LOGO):
        w.hide()
    BRAIN.hide_render = False
    NOSE.hide_render = True; nose_dissolve(0.0)
    REFL.arm.scale.x = -K.KS
    for k in ALL_K:
        k.rest()
    HERO.arm.pose.bones["Head"].scale = (1, 1, 1)
    fn = SHOTS[i]
    vis = HERO_CHARS.get(fn, [HERO])
    for k in ALL_K:
        k.hide(k not in vis)
    for r in RES:
        for o in r.children_recursive:
            o.hide_render = fn not in (s08, s09, s10, s11)
    if fn in (s15, s16):
        for k in ALL_K:
            k.hide(True)
    fn(t, d)
    K.ps1_snap_update(cam)
    bpy.context.view_layer.update()


def handler(scene, depsgraph=None):
    apply(scene.frame_current)


K.ps1_snap(cam, grid_h=int(os.environ.get("PS1_GRID", 240)))   # 240 rows: the jitter reads at 1080 (640 was invisible)
bpy.app.handlers.frame_change_pre.clear()
bpy.app.handlers.frame_change_pre.append(handler)
sc.frame_start, sc.frame_end = 0, END - 1

if "--board" in ARGS:
    out = os.path.join(HERE, "review", "board"); os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = 50
    picks = ARGS[ARGS.index("--board") + 1].split(",") if len(ARGS) > ARGS.index("--board") + 1 and not ARGS[ARGS.index("--board") + 1].startswith("--") else None
    for i, (f0, f1) in enumerate(SHOT_RANGES):
        if picks and str(i + 1) not in picks:
            continue
        for tag, f in (("a", f0 + 2), ("b", (f0 + f1) // 2 + 3)):
            sc.frame_set(f)
            sc.render.filepath = os.path.join(out, f"shot_{i + 1:02d}{tag}.png")
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
if "--save" in ARGS:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, "renders", "scene.blend"))

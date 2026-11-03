"""The Soldier Who Fought For 29 Extra Years — punkpolyshorts #2 (Blender 5.2, EEVEE).
blender -b -P build.py -- --board [1,2,..]   -> review/board/shot_XXa/b.png (half res)
blender -b -P build.py -- --frames a,b       -> renders/frames/#####.png (full res)
Shot timing from voice/timing.json (one shot per voice line); every state is a function of the frame."""
import json
import math
import os
import random
import sys

import bpy
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import lpskit as K  # noqa: E402
from jungle import jungle  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
TIM = json.load(open(os.path.join(HERE, "voice", "timing.json")))
FPS = K.FPS
CUT = [max(0, round((s - 0.15) * FPS)) if i else 0 for i, s in enumerate(TIM["starts"])]
END = round(TIM["end"] * FPS)
SHOT_RANGES = [(CUT[i], (CUT[i + 1] if i + 1 < len(CUT) else END)) for i in range(len(CUT))]
SOLD = os.path.join(HERE, "tex", "soldier")
PROPS = os.path.join(HERE, "tex", "props")


def wt(line, prefix, end=False):
    """Seconds into shot `line` (0-based) where the word starting with prefix is spoken."""
    w = next(w for w in TIM["words"] if w["line"] == line and w["w"].strip(".,!?-").lower().startswith(prefix))
    return (w["e"] if end else w["s"]) - CUT[line] / FPS


sc = K.reset("#9CC4A8")
cam = K.camera("Cam", 35)

# ---------------------------------------------------------------- sets
# JUNGLE (x=0): clearing at the origin; Onoda faces -Y; his camp (lean-to + fire) behind him at y=+1.6
J = jungle(origin=(0, 0, 0), size=(18, 18), seed=4, clearing_r=2.2)
wood = K.mat_color("hut_wood", "#6A4A2A"); thatch = K.mat_color("thatch", "#B09048")
for x in (-4.3, -2.7):
    K.box(f"hut_post{x}", (0.08, 0.08, 1.5), (x, 3.3, 0.75), wood)
K.box("hut_roof", (2.0, 1.4, 0.08), (-3.5, 2.95, 1.45), K.mat_image("thatch", K.tex_planks("th", base="#A88A48")), uv_scale=1.5).rotation_euler = (math.radians(-24), 0, 0)
FX, FY = 1.2, 1.4                                   # campfire: ring of stones, crossed logs, 3 flickering low-poly flames
_stone = K.mat_color("stones", "#6E6E6A"); _stone2 = K.mat_color("stones2", "#55554F")
for i in range(9):
    a = i / 9 * 2 * math.pi; s_ = 0.07 + 0.02 * (i % 3)
    K.box(f"fire_stone{i}", (s_, s_ * 1.2, s_ * 0.7), (FX + 0.24 * math.cos(a), FY + 0.24 * math.sin(a), s_ * 0.35),
          _stone if i % 2 else _stone2).rotation_euler = (0, 0, a + 0.3 * (i % 2))
for i, a in enumerate((0.5, -0.6)):
    K.box(f"fire_log{i}", (0.36, 0.06, 0.06), (FX, FY, 0.05 + 0.03 * i), K.mat_color(f"fire_log{i}", "#4A3020")).rotation_euler = (0, 0, a)


def _flame(name, r, h, hexc):
    n = 5
    verts = [(r * math.cos(k / n * 2 * math.pi), r * math.sin(k / n * 2 * math.pi), 0) for k in range(n)] + [(0, 0, h)]
    faces = [(k, (k + 1) % n, n) for k in range(n)] + [tuple(range(n - 1, -1, -1))]
    return K.mesh_from(name, verts, faces, K.mat_color(name, hexc, emit_only=True))


FLAMES = [(_flame("flame0", 0.11, 0.34, "#FF7A18"), (0.0, 0.0), 0.0), (_flame("flame1", 0.07, 0.24, "#FFB830"), (0.06, -0.04), 1.7),
          (_flame("flame2", 0.06, 0.2, "#FFD860"), (-0.05, 0.03), 3.1)]


def fire(t):
    for o, (dx, dy), ph in FLAMES:
        o.location = (FX + dx, FY + dy, 0.08)
        k = 1 + 0.18 * math.sin(t * 11 + ph) + 0.1 * math.sin(t * 23 + 2 * ph)
        o.scale = (1 + 0.08 * math.sin(t * 13 + ph), 1, k); o.rotation_euler = (0.08 * math.sin(t * 9 + ph), 0, t * 0.7 + ph)


def poster(name, w, loc, rot_z=0.0):
    img = bpy.data.images.load(os.path.join(HERE, "tex/eggs", name + ".png")); h = w * img.size[1] / img.size[0]
    return K.plane("egg_" + name, w, h, loc, rot=(math.pi / 2, 0, rot_z), mat=K.mat_image("egg_" + name, img, emit_only=True))


# easter eggs nailed to the trunks at the clearing edge (Suzuki's search)
poster("missing_panda", 0.42, (-1.6, 1.25, 1.35), math.radians(25))
poster("wanted_yeti", 0.42, (1.75, 1.0, 1.4), math.radians(-30))

# MAP (x=-40): top-down Philippines, a cartoon plane flies to Lubang
MX = -40.0
def map_terrain():
    """Low-poly relief map: a 56x56 grid lifted by the island height map, coloured by the pixel-art map texture."""
    import numpy as np
    hm = bpy.data.images.load(os.path.join(PROPS, "map_height.png")); w, h = hm.size
    hp = np.array(hm.pixels[:], np.float32).reshape(h, w, 4)[..., 0]
    for _ in range(2):                                          # soften the speckle noise (it shredded the LUZON label)
        p = np.pad(hp, 1, mode="edge")
        hp = sum(p[1 + dy:h + 1 + dy, 1 + dx:w + 1 + dx] for dy in (-1, 0, 1) for dx in (-1, 0, 1)) / 9
    # LUZON label (map.png px x 70-98, y 20-33 from the top; pixels[] rows run bottom-up): a flat plateau under it
    y0, y1 = round(h * (1 - 33 / 128)), round(h * (1 - 20 / 128)); x0, x1 = round(w * 70 / 128), round(w * 98 / 128)
    hp[y0:y1, x0:x1] = hp[y0:y1, x0:x1].max()
    N = 56; verts, faces = [], []
    for j in range(N + 1):
        for i in range(N + 1):
            u, v = i / N, j / N
            z = hp[min(int(v * (h - 1)), h - 1), min(int(u * (w - 1)), w - 1)] * 0.55
            verts.append((MX - 3 + 6 * u, -3 + 6 * v, z))
    for j in range(N):
        for i in range(N):
            a = j * (N + 1) + i; faces.append((a, a + 1, a + N + 2, a + N + 1))
    o = K.mesh_from("map", verts, faces, K.mat_image("map", bpy.data.images.load(os.path.join(PROPS, "map.png"))))
    uvl = o.data.uv_layers.new(name="UV")
    for poly in o.data.polygons:
        for li in poly.loop_indices:
            x, y, _ = verts[o.data.loops[li].vertex_index]; uvl.data[li].uv = ((x - MX + 3) / 6, (y + 3) / 6)
    return o


map_terrain()
cloud = K.mat_color("cloud", "#F4F6F8", emit_only=True)
for i, (x, y, z, s_) in enumerate(((-1.8, 1.2, 1.6, 1.0), (1.6, -0.4, 1.9, 0.8), (0.6, 2.3, 1.7, 1.2), (-2.4, -2.6, 1.5, 0.9))):
    for j in range(3):                                          # chunky low-poly clouds floating over the sea
        K.box(f"cloud{i}_{j}", (0.5 * s_, 0.35 * s_, 0.18 * s_), (MX + x + 0.3 * j * s_, y + 0.1 * (j % 2), z + 0.06 * (j == 1)), cloud)
route = K.mat_color("route", "#FFFFFF", emit_only=True)
for i in range(9):                                              # dashed flight path down to Lubang
    u = i / 9
    K.box(f"route{i}", (0.05, 0.16, 0.01), (MX + 0.9 - 1.3 * u, 2.6 - 3.8 * u, 0.62), route).rotation_euler = (0, 0, math.atan2(1.3, -3.8))
PIN = K.box("pin", (0.12, 0.12, 0.5), (MX - 0.45, -1.3, 0.45), K.mat_color("pin", "#E02020"))


def plane_model(name):
    body, wing, glass = K.mat_color(name + "_b", "#C8CCC4"), K.mat_color(name + "_w", "#A8ACA4"), K.mat_color(name + "_g", "#304050")
    parts = [K.box(name + "_fus", (0.3, 1.6, 0.3), (0, 0, 0), body), K.box(name + "_wing", (2.2, 0.35, 0.05), (0, 0.1, 0.02), wing),
             K.box(name + "_tail", (0.7, 0.2, 0.04), (0, 0.75, 0.05), wing), K.box(name + "_fin", (0.04, 0.25, 0.35), (0, 0.75, 0.22), wing),
             K.box(name + "_cock", (0.2, 0.3, 0.12), (0, -0.35, 0.2), glass), K.box(name + "_prop", (0.6, 0.03, 0.08), (0, -0.82, 0), glass)]
    root = bpy.data.objects.new(name, None); K.link(root)
    for p in parts:
        p.parent = root
    return root


PLANE = plane_model("plane")

# CITY (x=40): 1945, street of facades, cheering crowd, confetti, banner
CX = 40.0
fac = K.mat_image("facade", K.tex_facade("fc"))
K.box("city_back", (14, 0.2, 7), (CX, 3.0, 3.5), fac, uv_scale=0.35)
K.box("city_street", (14, 10, 0.1), (CX, -1, -0.05), K.mat_image("asph", K.tex_noise("asph", base="#4A4C50")), uv_scale=0.8)
K.box("city_banner", (5.6, 0.05, 0.9), (CX, 2.85, 3.0), K.mat_color("banner", "#F4F0E4"))
BANNER = K.Letters3D("banner_t", "WAR IS OVER!", size=0.42, front="#E02020", side="#801010", loc=(CX, 2.7, 2.9), seed=3, jitter=0.5)
CROWD = []
CONF = []
rnd = random.Random(7)
for i in range(60):
    c = K.plane(f"conf{i}", 0.06, 0.04, (CX, 0, 0), mat=K.mat_color(f"conf{i}", rnd.choice(["#FF4040", "#FFD020", "#40C0FF", "#60E060", "#FF80E0"]), emit_only=True))
    CONF.append((c, rnd.uniform(-3, 3), rnd.uniform(-1.5, 2.5), rnd.uniform(0, 4), rnd.uniform(0.6, 1.2), rnd.uniform(0, 6)))

# BOOKSHOP (x=80): 1974, the old commander behind the counter
BX = 80.0
books = K.mat_image("books", bpy.data.images.load(os.path.join(PROPS, "books.png")))
K.box("bk_wall", (6, 0.1, 3.2), (BX, 1.6, 1.6), K.mat_image("bk_wp", K.tex_wallpaper("bkwp", base="#B49870", motif="#A08460")), uv_scale=0.6)
for x in (-1.9, 1.9):
    K.box(f"bk_shelf{x}", (1.6, 0.4, 2.4), (BX + x, 1.35, 1.2), books, uv_scale=0.8)
K.box("bk_floor", (6, 5, 0.1), (BX, -0.5, -0.05), K.mat_image("bk_pl", K.tex_planks("bkpl")), uv_scale=0.8)
K.box("bk_counter", (1.8, 0.6, 0.95), (BX, -0.2, 0.47), K.mat_color("counter", "#5A3820"))
K.box("bk_ceil", (6, 5, 0.1), (BX, -0.5, 3.1), K.mat_color("bk_ceil", "#E0D8C8"))
poster("dummies", 0.5, (BX - 0.55, 1.53, 1.75))
poster("surrender_economy", 0.5, (BX + 0.55, 1.53, 1.75))

# ---------------------------------------------------------------- cast
HERO = K.Kaneda("onoda", (0, 0, 0), faces_dir=os.path.join(SOLD, "w0"))


def _hand_pts(k, side):
    """Kaneda's hand vertices (rest pose) in the Hand bone's own space, so props can sit on the real mesh surface."""
    bpy.context.view_layer.update()
    inv = (k.arm.matrix_world @ k.arm.pose.bones[f"Hand.{side}"].matrix).inverted()
    dg = bpy.context.evaluated_depsgraph_get(); pts = []
    for o in k.meshes:
        ev = o.evaluated_get(dg); me = ev.to_mesh()
        for v in me.vertices:
            p = inv @ (o.matrix_world @ v.co)
            if -0.03 < p.y < 0.42 and abs(p.x) < 0.2 and abs(p.z) < 0.21:
                pts.append(p)
        ev.to_mesh_clear()
    return pts


HAND_PTS = {s: _hand_pts(HERO, s) for s in "LR"}
CAP = K.field_cap(HERO, "cap", flaps=True)
SLUNG = K.rifle("rifle_slung")


def _sling_on_back(o, k, x=-0.02, z=1.18):
    """Muzzle up over the right shoulder, the sling side flat on the back; pushed back from y = 0.1 until it clears
    every body mesh (rest pose) by GAP."""
    from mathutils.bvhtree import BVHTree
    yd = Vector((-0.5, 0, 0.866)); xd = Vector((0, 1, 0)); zd = xd.cross(yd)
    dg = bpy.context.evaluated_depsgraph_get(); body_t = []
    for m in k.meshes:
        ev = m.evaluated_get(dg); me = ev.to_mesh()
        body_t.append(BVHTree.FromPolygons([m.matrix_world @ v.co for v in me.vertices], [tuple(p.vertices) for p in me.polygons]))
        ev.to_mesh_clear()
    rv = [v.co.copy() for v in o.data.vertices]; rp = [tuple(p.vertices) for p in o.data.polygons]
    y = 0.1
    while True:
        m = Matrix((xd, yd, zd)).transposed().to_4x4(); m.translation = (x, y, z)
        t = BVHTree.FromPolygons([m @ v for v in rv], rp)
        if not any(t.overlap(b) for b in body_t):
            break
        y += 0.004
    m.translation = (x, y + 0.008, z)                     # GAP plus a little for the PS1 wobble
    o.matrix_world = m


_sling_on_back(SLUNG, HERO); K.attach(SLUNG, HERO, "Chest")


def hand_world(k, side):
    bpy.context.view_layer.update()
    return k.arm.matrix_world @ k.arm.pose.bones[f"Hand.{side}"].tail


HELD = K.rifle("rifle_held")                       # in both hands, placed in world space by aim_rifle()

PEOPLE = os.path.join(HERE, "tex", "people")


def person(name, loc, yaw, scale=(1, 1, 1)):
    """A distinct person (user: never Kaneda recolours): hombre's body with their own Flow face + clothes (tex/people.py)."""
    r = K.hombre(name, loc, yaw=yaw, tex={"head": os.path.join(PEOPLE, f"{name}_head_128.png"), "body": os.path.join(PEOPLE, f"{name}_body_256.png")})
    r.scale = scale
    return r


# Onoda's three comrades (Akatsu, Shimada, Kozuka): different builds and faces
COMRADES = [person("akatsu", (-0.8, 1.2, 0), math.radians(-20), (0.95, 0.95, 1.0)),
            person("shimada", (0.3, 1.75, 0), math.radians(5), (1.12, 1.12, 0.96)),
            person("kozuka", (0.95, 0.95, 0), math.radians(30), (1.05, 1.05, 0.98))]
SUZUKI = person("suzuki", (0, -0.9, 0), math.pi, (0.95, 0.95, 1.02))             # the college dropout, backpack on
_pk, _pk2, _st = K.mat_color("pack", "#C83020"), K.mat_color("pack_flap", "#9A2418"), K.mat_color("pack_strap", "#3A3028")
PACK_PARTS = []


def _pk_box(name, size, loc, mat):                # parented straight to SUZUKI (local, his back = +Y), never rotated
    o = K.box(name, size, (0, 0, 0), mat); o.parent = SUZUKI; o.location = loc; PACK_PARTS.append(o)
    return o


PACK = _pk_box("pack", (0.3, 0.15, 0.38), (0, 0.205, 1.17), _pk)                    # body against the back (torso back +0.128)
_pk_box("pack_round", (0.26, 0.17, 0.3), (0, 0.215, 1.16), _pk)                     # bulge, so it isn't a slab
_pk_box("pack_flap", (0.31, 0.17, 0.05), (0, 0.208, 1.375), _pk2)                   # flap over the top ...
_pk_box("pack_flap_f", (0.27, 0.025, 0.14), (0, 0.29, 1.3), _pk2)                   # ... hanging down the outside
_pk_box("pack_pocket", (0.2, 0.04, 0.12), (0, 0.3, 1.06), _pk2)
for sx in (-1, 1):
    _pk_box(f"pack_side{sx}", (0.04, 0.11, 0.18), (sx * 0.165, 0.2, 1.08), _pk2)
    _pk_box(f"pack_strap_top{sx}", (0.05, 0.3, 0.025), (sx * 0.085, 0.0, 1.47), _st)  # over the shoulder
    _pk_box(f"pack_strap_f{sx}", (0.045, 0.02, 0.3), (sx * 0.085, -0.155, 1.33), _st)  # down the chest
CHECK = K.plane("checklist", 0.22, 0.19, (0, 0, 0), mat=K.mat_image("checklist", bpy.data.images.load(os.path.join(PROPS, "checklist.png")), emit_only=True))
CHECK_DONE = bpy.data.images.load(os.path.join(PROPS, "checklist_done.png"))
CHECK_TODO = CHECK.data.materials[0].node_tree.nodes["Image Texture"].image

for i, (n, sc_) in enumerate((("woman", (0.92, 0.92, 0.95)), ("sailor", (1.0, 1.0, 1.04)), ("oldman", (1.08, 1.08, 0.95)), ("worker", (1.1, 1.1, 1.05)))):
    CROWD.append(person(n, (CX - 1.05 + 0.7 * i, 0.3 + 0.45 * (i % 2), 0), math.radians(rnd.uniform(-15, 15)), sc_))

CMDR = K.hombre("cmdr", (0, -1.1, 0), yaw=math.pi, tex={"head": os.path.join(HERE, "..", "lps-own-face", "tex", "prof_head_128.png"),
                                                       "body": os.path.join(HERE, "tex", "people", "akatsu_body_256.png")})
SELLER = K.hombre("seller", (BX, 0.3, 0), yaw=0.0, tex={"head": os.path.join(HERE, "..", "lps-own-face", "tex", "prof_head_128.png"), "body": os.path.join(HERE, "tex", "people", "oldman_body_256.png")})
K.hpart(SELLER, "head").location.z -= 0.03          # chin tucked into the collar: no white gap under the photo head
ORDER = K.plane("order", 0.2, 0.32, (0, 0, 0), mat=K.mat_image("order", bpy.data.images.load(os.path.join(PROPS, "order.png")), emit_only=True))
LEAF = [K.plane(f"leaf{i}", 0.21, 0.28, (0, 0, -50), mat=K.mat_image("leaflet", bpy.data.images.load(os.path.join(PROPS, "leaflet.png"), check_existing=True), emit_only=True)) for i in range(14)]
for p in LEAF[1:]:
    p.data.materials[0] = LEAF[0].data.materials[0]

T29 = K.Letters3D("t29", "29", size=0.55, seed=2, jitter=0.8)
YEARS = {y: K.Letters3D(f"y{y}", y, size=0.32, seed=int(y) % 13) for y in ("1944", "1945", "1955", "1965", "1974")}
ALL_K = [HERO]
ALL_P = COMRADES + CROWD + [SUZUKI]

# ---------------------------------------------------------------- camera helpers (from video #1)


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
    fwd = (k.arm.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()
    fwd = Matrix.Rotation(orbit, 3, "Z") @ fwd
    side = fwd.cross(Vector((0, 0, 1))).normalized()
    cam.data.lens = lens
    lk(c + fwd * dist + side * dx + Vector((0, 0, dz)), c + Vector((0, 0, dz * 0.4)), t, roll, a)


def park(o):
    o.location = (0, 0, -50)


def aim_arm(k, side, up, fore, hand=None):
    k.aim(f"Upperarm.{side}", up); k.aim(f"Forearm.{side}", fore); k.aim(f"Hand.{side}", hand or fore)


GAP = 0.006                  # prop-to-skin clearance (m): above the PS1 vertex-snap wobble, so nothing pokes through


def body(k, p):
    """Point in Kaneda's body frame (metres from his feet, facing -Y) -> world."""
    return Matrix.Translation(k.arm.location - Vector((0, 0, K.KZ))) @ Matrix.Rotation(k.arm.rotation_euler.z, 4, "Z") @ Vector(p)


def body_dir(k, d):
    return Matrix.Rotation(k.arm.rotation_euler.z, 3, "Z") @ Vector(d)


def reach(k, side, target, pole):
    """2-bone IK: aim Upperarm/Forearm so the wrist (Hand head) lands on target (world); the elbow bends toward pole."""
    bpy.context.view_layer.update()
    mw = k.arm.matrix_world; to_model = mw.to_3x3().inverted()
    pu = k.arm.pose.bones[f"Upperarm.{side}"]
    s = mw @ pu.head; a = pu.length * K.KS; b = k.arm.pose.bones[f"Forearm.{side}"].length * K.KS
    d = Vector(target) - s; n = d.normalized(); ln = min(d.length, (a + b) * 0.999)
    ca = max(-1.0, min(1.0, (a * a + ln * ln - b * b) / (2 * a * ln)))
    p = Vector(pole); p = (p - n * p.dot(n)).normalized()
    e = s + n * a * ca + p * a * math.sqrt(1 - ca * ca)
    k.aim(f"Upperarm.{side}", to_model @ (e - s)); k.aim(f"Forearm.{side}", to_model @ (s + n * ln - e))


def set_hand(k, side, fingers, palm):
    """Orient a hand bone: fingers (bone +Y) and the palm normal (bone -Z: the flat inner face of the mitten), world."""
    pb = k.arm.pose.bones[f"Hand.{side}"]
    r = k.arm.matrix_world.to_3x3().normalized().inverted()
    y = (r @ Vector(fingers)).normalized(); z = -(r @ Vector(palm)); z = (z - y * z.dot(y)).normalized()
    m = Matrix((y.cross(z), y, z)).transposed().to_4x4(); m.translation = pb.matrix.translation
    pb.matrix = m
    bpy.context.view_layer.update()


def hand_pts(k, side):
    m = k.arm.matrix_world @ k.arm.pose.bones[f"Hand.{side}"].matrix
    return [m @ p for p in HAND_PTS[side]]


def palm(pts, n, band=0.012):
    """Outermost skin along n (distance) and the centre of the palm face there."""
    ext = max(p.dot(n) for p in pts)
    f = [p for p in pts if p.dot(n) > ext - band]
    return ext, sum(f, Vector()) / len(f)


def aim_rifle(k, pitch=math.radians(5), yaw=math.radians(35), grip=(-0.13, -0.28, 1.2), lead=0.26):
    """Rifle at the ready, pointing forward-left and up. The arms reach (IK) for where the hands go on a rifle with
    that pitch/yaw/grip (body frame), the hands turn to grip it (right palm on the right side of the stock wrist,
    left palm up under the handguard), then HELD is fitted to the actual hand meshes: its wrist touches the right palm,
    its forend rests on the left palm, both GAP off the skin. So the rifle follows the hands, whatever the pose."""
    o = body(k, grip)
    d = body_dir(k, (math.sin(yaw) * math.cos(pitch), -math.cos(yaw) * math.cos(pitch), math.sin(pitch)))
    z = Vector((0, 0, 1))
    for it in range(6):
        u = (z - d * z.dot(d)).normalized(); s = d.cross(u)                 # rifle up, rifle right (shooter's right)
        if it == 0:                                                          # arms reach for the planned grips
            reach(k, "R", o + s * 0.075 + u * 0.075 - d * 0.02, body_dir(k, (-1, 0.5, 0.1)))
            reach(k, "L", o + d * lead - s * 0.075 - u * 0.075, body_dir(k, (0.6, 0.1, -1)))
        set_hand(k, "R", -u * 0.9 + d * 0.3, -s)                             # fingers down round the wrist, palm in
        set_hand(k, "L", s + d * 0.25, u)                                    # fingers across under the forend, palm up
        # right palm -> stock wrist
        n = -s; ext, c = palm(hand_pts(k, "R"), n)
        yc = (c - o).dot(d)
        hw = max(K.rifle_profile(yc + t * 0.013)[2] for t in range(-5, 6))
        o = c + n * (ext - c.dot(n) + hw + GAP)
        o += u * (-(o - c).dot(u))                                           # wrist centred on the palm height
        # left palm -> under the forend
        ext, c = palm(hand_pts(k, "L"), u)
        yl = (c - o).dot(d)
        zb = min(K.rifle_profile(yl + t * 0.013)[0] for t in range(-5, 6))
        if yl - 0.065 < 0.2:                                                  # floorplate under the magazine well
            zb = min(zb, -0.048)
        a = c + u * (ext - c.dot(u) - zb + GAP)
        d = (a - o).normalized()
    u = (z - d * z.dot(d)).normalized(); s = d.cross(u)
    m = Matrix((s, d, u)).transposed().to_4x4(); m.translation = o
    HELD.matrix_world = m
    return yl


def place(k, loc, yaw):
    k.arm.location = (loc[0], loc[1], (loc[2] if len(loc) > 2 else 0) + K.KZ); k.arm.rotation_euler = (0, 0, yaw)


def pop(t, t0, dur=0.18):    # 0 -> 1.1 -> 1 scale pop
    u = min(max((t - t0) / dur, 0), 1)
    return 0.0 if t < t0 else (1.1 * math.sin(u * math.pi / 2) if u < 1 else 1.0)


WRIST_BACK = -50


def sheet_on_palm(sheet, pts, n, up, overlap, scale=(1, 1), spin=0.0, clear=()):
    """Lay a paper plane (front = local +Z) flat against a palm: its face GAP off the outermost skin along n (the palm
    normal), centred on the palm, its lower part over the palm (overlap m) and the rest above along up (the fingers)."""
    n = Vector(n).normalized(); up = Vector(up); up = (up - n * up.dot(n)).normalized()
    ext, c = palm(pts, n)
    up = Matrix.Rotation(spin, 3, n) @ up
    h = sheet.data.vertices[2].co.y * 2 * scale[1]
    ext = max([ext] + [p.dot(n) for p in clear])                   # also clear other skin under the sheet (forearm)
    loc = c + n * (ext - c.dot(n) + GAP) + up * (h / 2 - overlap)
    m = Matrix((up.cross(n), up, n)).transposed().to_4x4() @ Matrix.Diagonal((scale[0], scale[1], 1, 1))
    m.translation = loc
    sheet.matrix_world = m


def hhand(r, side):
    """An hombre hand (hand + finger parts) in world space: vertices, palm normal (hand_R local +X, hand_L -X) and the
    finger direction (local -Z)."""
    bpy.context.view_layer.update()
    h = K.hpart(r, f"hand_{side}"); pts = []
    for o in [h] + list(h.children):
        pts += [o.matrix_world @ v.co for v in o.data.vertices]
    r3 = h.matrix_world.to_3x3().normalized()
    return pts, r3 @ Vector((1 if side == "R" else -1, 0, 0)), r3 @ Vector((0, 0, -1))


def suz(loc, yaw, t, hands_up=False):
    """Suzuki: walk/stand at loc, checklist held up in his right hand (or both hands up at gunpoint). The hand is
    turned palm-forward and the card lies on the palm, facing out."""
    SUZUKI.location = loc; SUZUKI.rotation_euler = (0, 0, yaw)
    K.hpart(SUZUKI, "upperarm_R").rotation_euler = (math.radians(-190 if hands_up else -15), 0, math.radians(-30 if hands_up else 0))
    K.hpart(SUZUKI, "forearm_R").rotation_euler = (math.radians(-35 if hands_up else -115), 0, 0)
    hr = K.hpart(SUZUKI, "hand_R"); hr.rotation_mode = "ZYX"                               # twist palm forward, then
    hr.rotation_euler = (math.radians(WRIST_BACK), 0, math.radians(90))                     # bend back off the forearm
    K.hpart(SUZUKI, "upperarm_L").rotation_euler = (math.radians(-190 if hands_up else 8 * math.sin(t * 8)), 0, math.radians(30 if hands_up else 0))
    if hands_up:                                                                            # hands beside the head
        K.hpart(SUZUKI, "forearm_L").rotation_euler = (math.radians(-35), 0, 0)
    pts, n, up = hhand(SUZUKI, "R")
    fa = K.hpart(SUZUKI, "forearm_R"); w = K.hpart(SUZUKI, "hand_R").matrix_world.translation
    near = [fa.matrix_world @ v.co for v in fa.data.vertices]; near = [p for p in near if (p - w).length < 0.16]
    sheet_on_palm(CHECK, pts, n, up, 0.06, clear=near)


def suz_head():
    bpy.context.view_layer.update()
    return K.hpart(SUZUKI, "head").matrix_world.translation + Vector((0, 0, 0.1))


def hide_hombre(r, h):
    for o in r.children_recursive:
        o.hide_render = h

# ---------------------------------------------------------------- v3 props: crumpled ball, calendar, tear; camera-space helpers
import bmesh  # noqa: E402

_bm = bmesh.new(); bmesh.ops.create_icosphere(_bm, subdivisions=1, radius=0.045, calc_uvs=True)
_rb = random.Random(5)
for v in _bm.verts:                                       # lumpy: every vertex pushed in or out
    v.co *= _rb.uniform(0.7, 1.3)
_me = bpy.data.meshes.new("leaf_ball"); _bm.to_mesh(_me); _bm.free()
BALL = K.link(bpy.data.objects.new("leaf_ball", _me)); _me.materials.append(LEAF[0].data.materials[0])
_uvl = _me.uv_layers.active or _me.uv_layers.new(name="UV")
for _poly in _me.polygons:                                # scrunched: each facet shows a scrap of the printed leaflet
    _u0, _v0 = _rb.uniform(0.05, 0.75), _rb.uniform(0.1, 0.75)
    for _k, _li in enumerate(_poly.loop_indices):
        _uvl.data[_li].uv = (_u0 + 0.2 * (_k == 1), _v0 + 0.2 * (_k == 2))
BALL_R = 0.045


def _page(name, yr, w=0.24):
    h = w * 112 / 96
    o = K.plane(name, w, h, (0, 0, 0), mat=K.mat_image(f"{name}_{yr}", bpy.data.images.load(os.path.join(PROPS, f"cal_{yr}.png")), emit_only=True))
    for v in o.data.vertices:                             # hinge on the top edge (tear-off pad)
        v.co.y -= h / 2
    return o


CAL_YEARS = ("1945", "1946", "1955", "1965")
CAL_MATS = [K.mat_image(f"cal_{y}", bpy.data.images.load(os.path.join(PROPS, f"cal_{y}.png")), emit_only=True) for y in CAL_YEARS]
CAL, CAL_FLIP = _page("cal", "1945"), _page("cal_flip", "1945")
CAL_BACK = K.box("cal_back", (0.26, 0.012, 0.3), (0, 0, 0), K.mat_color("cal_back", "#3A2A1A"))
TEAR = K.plane("tear", 0.022, 0.033, (0, 0, 0), mat=K.mat_image("tear", bpy.data.images.load(os.path.join(PROPS, "tear.png")), emit_only=True, alpha=True))
MUZZLE_Y = max(v.co.y for v in HELD.data.vertices)
NOSE_GAP = 0.05        # rifle space: +Y to the muzzle
V3_PROPS = [BALL, CAL, CAL_FLIP, CAL_BACK, TEAR]
TEAR_EYE = (-0.46, 0.2, 0.12, 0.15)                       # starts right under the closed (happy) eye                       # head-bone space: under his left eye, slide length


def cam_frame(depth):
    """Half-width / half-height (m) of the 9:16 frame at depth m in front of the camera (sensor fit: the height)."""
    hh = depth * cam.data.sensor_width / 2 / cam.data.lens
    return hh * 1080 / 1920, hh


def cam_depth(p):
    bpy.context.view_layer.update()
    return -(cam.matrix_world.inverted() @ Vector(p)).z


def screen_xy(p):
    """p (world) -> (x, y) in frame half-sizes, -1..1 inside the frame."""
    q = cam.matrix_world.inverted() @ Vector(p); hw, hh = cam_frame(-q.z)
    return q.x / hw, q.y / hh


def on_screen(o, x, y, depth, tilt=(0.0, 0.0, 0.0)):
    """Put o at screen (x, y) (frame half-sizes) at depth m, facing the camera (its front = local +Z)."""
    hw, hh = cam_frame(depth)
    m = cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt[0], 3, "X") @ Matrix.Rotation(tilt[1], 3, "Y") @ Matrix.Rotation(tilt[2], 3, "Z")
    w = m.to_4x4(); w.translation = cam.matrix_world @ Vector((x * hw, y * hh, -depth))
    o.matrix_world = w @ Matrix.Diagonal((*o.scale, 1))


def number_by_face(L, t, t_in, t_out=None, tilt=math.radians(-14), side=1):
    """A Letters3D number beside the face, fully inside the frame: same depth as the head, on the emptier side,
    about 40 % of the frame width."""
    head = HERO.head_world(); dep = cam_depth(head); hx, hy = screen_xy(head)
    hw, hh = cam_frame(dep)
    x = 0.52 * side; y = min(max(hy + 0.22, -0.2), 0.62)            # fixed side per shot: no jumping
    sc = 0.8 * hw / (1.15 * L.size)                       # the glyphs are about 1.15 x size wide for two digits
    L.root.matrix_world = Matrix.Translation(cam.matrix_world @ Vector((x * hw, y * hh, -dep))) @ \
        (cam.matrix_world.normalized().to_3x3() @ Matrix.Rotation(tilt * (1 if x > 0 else -1), 3, "Y")).to_4x4()
    L.anim(t, t_in, t_out=t_out, scale=sc)


# ---------------------------------------------------------------- shots (t = seconds into the shot, d = length)


def s01(t, d):   # "This man kept fighting World War Two for 29 years after it ended." — he rises out of the ferns, rifle up; "29"
    HERO.face("stern" if t > 0.5 else "neutral")
    u = K.ease(t / 0.6); place(HERO, (0, 0, -0.9 * (1 - u)), 0)
    aim_rifle(HERO, pitch=0.0, yaw=math.radians(55), grip=(-0.13, -0.3, 1.2), lead=0.24)   # across the body, clear of both arms (BVH-checked)
    HELD.hide_render = False; SLUNG.hide_render = True
    t29 = wt(0, "29")
    face_cam(HERO, 1.6 * punch(t, t29 - 0.1, 1.6), 30, dz=-0.15, orbit=0.35 - 0.25 * K.ease(t / d), roll=math.radians(-6), t=t)
    number_by_face(T29, t, t29 - 0.05)


def s02(t, d):   # "In 1944, Japan sent him to a tiny island in the Philippines with one order." — map, plane to Lubang
    u = K.ease(t / d)
    PLANE.location = (MX + 1.2 - 1.6 * u, 3.0 - 4.3 * u, 0.9); PLANE.rotation_euler = (0, math.radians(8 * math.sin(t * 3)), math.radians(200))
    PLANE.scale = (0.45,) * 3
    PIN.scale = (1, 1, pop(t, d * 0.75))
    y = YEARS["1944"]; y.root.location = (MX + 0.2, 0.2, 2.2); y.root.rotation_euler = (math.radians(55), 0, 0); y.root.scale = (1.8,) * 3; y.anim(t, 0.05, t_out=d - 0.2)
    lk((MX - 0.1 + 0.5 * u, -4.2 + 1.2 * u, 5.2 - 1.6 * u), (MX - 0.2, 0.3 - 1.0 * u, 0), t, math.radians(-5 + 8 * u))


def s03(t, d):   # "Never surrender." — the commander barks the order; punch on Onoda
    hide_hombre(CMDR, False)
    HERO.face("angry"); SLUNG.hide_render = False; HELD.hide_render = True
    K.hpart(CMDR, "upperarm_R").rotation_euler = (math.radians(-80), 0, math.radians(-10))      # pointing at him
    K.hpart(CMDR, "head").rotation_euler = (math.radians(6 * math.sin(t * 14)), 0, 0)         # barking
    if t < d * 0.45:
        lk((0.9, -2.6, 1.7), (0.1, -0.6, 1.5), t, math.radians(8))
    else:
        face_cam(HERO, 0.55 * punch(t, d * 0.45, 1.5, 0.3), 35, dz=0.06, roll=math.radians(-8), t=t, a=1.6)


def s04(t, d):   # "A year later, the war ended." — 1945, the city goes wild
    BANNER.root.location = (CX, 2.7, 2.9); BANNER.root.rotation_euler = (math.pi / 2, 0, 0); BANNER.anim(t, 0.1)
    y = YEARS["1945"]; y.root.location = (CX - 1.3, 0.2, 2.2); y.root.rotation_euler = (math.pi / 2, 0, math.radians(10)); y.anim(t, 0.0, t_out=d - 0.25)
    for i, r in enumerate(CROWD):
        s = math.sin(t * 9 + i * 1.7)
        for side in ("L", "R"):
            K.hpart(r, f"upperarm_{side}").rotation_euler = (math.radians(-165 + 12 * s), 0, math.radians(12 if side == "L" else -12))
            K.hpart(r, f"forearm_{side}").rotation_euler = (math.radians(-15), 0, 0)
        r.location.z = 0.1 * max(s, 0)
    for c, x, y0, z0, sp, ph in CONF:
        c.location = (CX + x, y0, (z0 - sp * t) % 4.0); c.rotation_euler = (t * 6 + ph, t * 4, ph)
    lk((CX + 1.0 - 0.8 * K.ease(t / d), -3.2, 1.3), (CX, 0.6, 1.5), t, math.radians(6))


def s05(t, d):   # "Nobody told him." — hard cut back to the bushes, slow push on a blank face
    HERO.face("blank"); place(HERO, (0, 0, -0.35), 0); SLUNG.hide_render = False; HELD.hide_render = True
    face_cam(HERO, 1.3 - 0.5 * K.ease(t / d), 40, dz=-0.05, orbit=-0.25, t=t, a=0.5)


def s06(t, d):   # "Well, they tried. Planes dropped leaflets saying it was over." — plane over the canopy, leaflets rain
    HERO.face("skeptic"); SLUNG.hide_render = False; HELD.hide_render = True
    PLANE.scale = (1.4,) * 3; PLANE.location = (-6 + 10 * t / d, 4, 9); PLANE.rotation_euler = (0, 0, math.radians(-90))
    hw = HERO.head_world()
    for i, p in enumerate(LEAF):
        r = random.Random(i); t0 = r.uniform(0, d * 0.5); fall = max(t - t0, 0)
        p.location = (r.uniform(-2.5, 2.5) - 2 + 6 * t0 / d, r.uniform(-1.5, 2), 8.5 - 2.6 * fall)
        p.rotation_euler = (math.pi / 2 + math.sin(fall * 5 + i), fall * 3, math.sin(fall * 4) * 0.6)
        if t < t0:
            park(p)
    up = t < d * 0.55
    if up:
        lk((0.6, -2.4, 0.5), (0.0, 1.5, 6.5), t, math.radians(-8))           # low angle up at the plane
    else:                                                                       # one leaflet lands on his face
        u = K.ease((t - d * 0.55) / 0.35)
        LEAF[0].location = hw + Vector((0, -0.09, 0.0)) + Vector((0.3, -0.2, 0.9)) * (1 - u)
        LEAF[0].rotation_euler = (math.pi / 2, 0, math.radians(10 * (1 - u)))
        face_cam(HERO, 0.75, 35, dz=0.02, roll=math.radians(5), t=t)


def s07(t, d):   # "He decided they were fake." — crumples it and tosses it
    HERO.face("stern"); SLUNG.hide_render = False; HELD.hide_render = True
    u = min(t / (d * 0.6), 1)
    aim_arm(HERO, "R", (-0.3, -0.7, -0.5), (0.1, -0.6, 1.0 - 1.6 * max(u - 0.7, 0)))      # forearm up, leaflet held out
    set_hand(HERO, "R", body_dir(HERO, (0.1, -0.35, 1)), body_dir(HERO, (0.15, -1, -0.2)))  # fingers up, palm out
    p = LEAF[0]; hw = hand_world(HERO, "R")
    pp = hand_pts(HERO, "R"); m3 = HERO.arm.matrix_world.to_3x3().normalized() @ HERO.arm.pose.bones["Hand.R"].matrix.to_3x3()
    n = -m3.col[2].normalized(); ext, c = palm(pp, n)
    on_palm = c + n * (ext - c.dot(n) + GAP + BALL_R)
    tb, tt = 0.5, d * 0.72                                          # sheet crumples until tb, ball on the palm until tt, then tossed
    if t < tb:                                                       # the sheet scrunches: shrinks, twists, buckles
        s = 1 - 0.55 * K.ease(t / tb)
        sheet_on_palm(p, pp, n, m3.col[1], 0.05 * s, (s * (1 - 0.15 * math.sin(t * 40) ** 2), s), spin=0.6 * math.sin(14 * t) * t / tb)
    else:
        park(p)
        g = min((t - tb) / 0.08, 1); BALL.scale = (0.7 + 0.3 * g, 0.7 + 0.3 * g * (1 - 0.15 * math.sin(t * 30)), 0.7 + 0.3 * g)
        BALL.rotation_euler = (t * 7, t * 5, t * 3)
        v = max(t - tt, 0)
        BALL.location = on_palm + Vector((1.6 * v, -0.4 * v, 1.4 * v - 4.9 * v * v))
    c = (HERO.head_world() + hw) / 2                                    # frame the face AND the hand with the paper
    fwd = Matrix.Rotation(0.35, 3, "Z") @ body_dir(HERO, (0, -1, 0)); cam.data.lens = 30
    lk(c + fwd * (1.35 - 0.2 * K.ease(t / d)) + Vector((0, 0, 0.05)), c, t, math.radians(-5))


def s08(t, d):   # "So he kept going. One year. Ten. Twenty." — montage, the uniform wears out each beat
    beats = [0.0, wt(7, "one"), wt(7, "ten"), wt(7, "twenty")]
    i = max(j for j in range(4) if beats[j] <= t)
    wear = ("w0", "w1", "w2", "w3")[i]
    HERO.faces_dir = os.path.join(SOLD, wear)
    HERO.face(("stern", "neutral", "nervous", "bloodshot")[i]); SLUNG.hide_render = False; HELD.hide_render = True
    face_cam(HERO, (1.3, 0.9, 0.7, 0.55)[i], 35, orbit=(0.5, -0.4, 0.3, -0.1)[i], roll=math.radians((6, -7, 5, -3)[i]), dz=-0.05, t=t, a=1.4)
    # tear-off calendar beside his head: the old year's page flips up and away on every beat
    head = HERO.head_world(); dep = cam_depth(head); hx, hy = screen_xy(head); hw, hh = cam_frame(dep)
    x = -0.6 if hx > 0 else 0.6; y = 0.8
    sz = 0.5 * hw / 0.24                                   # page width = a quarter of the frame
    for o in (CAL, CAL_FLIP):
        o.scale = (sz, sz, 1)
    CAL.data.materials[0] = CAL_MATS[i]
    on_screen(CAL, x, y, dep, (0, math.radians(-12 if x < 0 else 12), 0))
    if i > 0 and t - beats[i] < 0.3:
        CAL_FLIP.data.materials[0] = CAL_MATS[i - 1]
        a = math.radians(175) * K.ease((t - beats[i]) / 0.28)
        on_screen(CAL_FLIP, x, y, dep - 0.01, (0, math.radians(-12 if x < 0 else 12), 0))
        CAL_FLIP.matrix_world = CAL_FLIP.matrix_world @ Matrix.Rotation(-a, 4, "X")


def s09(t, d):   # "His three comrades left, one by one." — camp at dusk; they pop out of existence one at a time
    HERO.faces_dir = os.path.join(SOLD, "w2"); HERO.face("sad"); place(HERO, (-0.15, 0.3, 0), math.radians(-10))
    gone = [wt(8, "left"), wt(8, "one"), wt(8, "by") + 0.35]
    for r, tg in zip(COMRADES, gone):
        hide_hombre(r, t > tg)
    cam.data.lens = 26
    lk((0.2, -2.3, 1.35), (0.1, 1.0, 0.95), t, math.radians(-4 + 4 * t / d))


def s10(t, d):   # "In 1974, a college dropout went into that jungle looking for three things." — Suzuki on the trail
    u = t / d
    suz((0.6 - 1.2 * u, -1.6 + 1.6 * u, 0.04 * abs(math.sin(t * 8))), math.pi + math.radians(20), t)
    y = YEARS["1974"]; y.root.location = suz_head() + Vector((0.5, 0.4, 0.35)); y.root.rotation_euler = (math.pi / 2, 0, math.radians(200)); y.anim(t, 0.05, t_out=d - 0.3)
    lk((1.4 - 0.8 * u, 1.6, 1.5), suz_head() + Vector((0, 0, -0.3)), t, math.radians(5))


def s11(t, d):   # "A panda, the Yeti, and Lieutenant Onoda." — the checklist fills the frame, then the two posters
    suz((-0.6, 0.0, 0), math.pi + math.radians(20), t)
    tp, ty = wt(10, "apanda"), wt(10, "yeti")
    if t < tp + 0.35:
        n = CHECK.matrix_world.to_3x3().col[2].normalized()                          # straight at the card's face
        lk(CHECK.location + n * 0.4 + Vector((0.08, 0, 0.1)), CHECK.location, t, math.radians(-6))
    elif t < ty - 0.05:                                                              # cut on "Yeti"
        lk((-1.0, 0.2, 1.4), (-1.6, 1.25, 1.35), t, math.radians(8), a=1.5)           # MISSING panda poster
    else:
        lk((1.0, 0.1, 1.45), (1.75, 1.0, 1.4), t, math.radians(-8), a=1.5)            # wanted Yeti


def s12(t, d):   # "He found one of them." — side two-shot: the muzzle stops a few cm from Suzuki's nose
    HERO.faces_dir = os.path.join(SOLD, "w3"); HERO.face("stern"); place(HERO, (0.0, 0.45, 0), 0.0)
    HELD.hide_render = False; SLUNG.hide_render = True
    CHECK.data.materials[0].node_tree.nodes["Image Texture"].image = CHECK_DONE
    pitch, sx, sy = math.radians(10), 0.0, -0.8
    for _ in range(4):                     # rifle pitched at his nose; Suzuki stepped so the muzzle stops NOSE_GAP short
        aim_rifle(HERO, pitch=pitch, yaw=0.0, grip=(-0.12, -0.3, 1.3), lead=0.26)
        m = HELD.matrix_world; o = m.translation.copy(); dvec = m.to_3x3().col[1].normalized()
        muzzle = o + dvec * MUZZLE_Y
        suz((sx, sy, 0), math.pi, t, hands_up=True)
        hd = K.hpart(SUZUKI, "head"); bb = [hd.matrix_world @ Vector(c) for c in hd.bound_box]
        hc = sum(bb, Vector()) / 8; nose = hc + Vector((0, 0.11, -0.02))                    # he faces +Y, toward Onoda
        tgt = muzzle + dvec * NOSE_GAP
        sx += tgt.x - nose.x; sy += tgt.y - nose.y
        pitch = math.atan2(nose.z - o.z, (Vector((nose.x, nose.y, 0)) - Vector((o.x, o.y, 0))).length)
    hero_h = HERO.head_world(); mid = (hero_h + nose) / 2
    e = K.ease(t / d)
    cam.data.lens = 20 + 2 * e
    lk(mid + Vector((1.6 - 0.12 * e, -0.27, 0.05)), mid + Vector((0, -0.12, -0.08)), t, math.radians(-2), a=0.8)   # from the side, a touch toward Onoda's face


def s13(t, d):   # "Onoda still wouldn't stop, unless his old commander ordered him to." — arms crossed, deadpan
    HERO.faces_dir = os.path.join(SOLD, "w3"); HERO.face("stern" if t < d * 0.5 else "skeptic"); SLUNG.hide_render = False; HELD.hide_render = True
    aim_arm(HERO, "R", (-0.1, -0.5, -0.8), (0.9, -0.3, 0.15)); aim_arm(HERO, "L", (0.1, -0.5, -0.8), (-0.9, -0.3, 0.25))
    HERO.turn_head(math.radians(-25 if t < d * 0.5 else 15))
    e = K.ease(t / d)                                       # slow orbit round him + push in, a punch on the head turn
    face_cam(HERO, (1.3 - 0.55 * e) * punch(t, d * 0.5, 1.25, 0.3), 35, dz=-0.22 + 0.12 * e, orbit=-0.7 + 1.2 * e,
             roll=math.radians(6 - 10 * e), t=t, a=1.3)


def s14(t, d):   # "So Japan found that commander, who was selling books by then, and flew him to the island."
    tf = wt(13, "flew")
    if t < tf:
        hide_hombre(SELLER, False)
        K.hpart(SELLER, "head").rotation_euler = (math.radians(-12), 0, 0)
        lk((BX + 0.6 - 0.5 * K.ease(t / tf), -2.6 + 0.6 * K.ease(t / tf), 1.6), (BX, 0.3, 1.45), t, math.radians(5))
    else:
        u = K.ease((t - tf) / (d - tf))
        PLANE.scale = (0.45,) * 3; PLANE.location = (MX + 1.0 - 1.4 * u, 2.2 - 3.2 * u, 0.9); PLANE.rotation_euler = (0, 0, math.radians(200))
        PIN.scale = (1, 1, 1)
        lk((MX + 0.3, -3.0, 4.2), (MX - 0.3, -0.6, 0), t, math.radians(-6))


CMDR_IN = 30


def s15(t, d):   # "He read the order out loud." — the old man unrolls the order in front of him
    hide_hombre(CMDR, False); place(HERO, (0, 0, 0), 0)
    HERO.faces_dir = os.path.join(SOLD, "w3"); HERO.face("sad"); SLUNG.hide_render = False; HELD.hide_render = True
    for sd, sg in (("R", 1), ("L", -1)):                     # both hands up in front, palms out, holding the top corners
        K.hpart(CMDR, f"upperarm_{sd}").rotation_euler = (math.radians(-45), 0, sg * math.radians(CMDR_IN))
        K.hpart(CMDR, f"forearm_{sd}").rotation_euler = (math.radians(-105), 0, 0)
        h = K.hpart(CMDR, f"hand_{sd}"); h.rotation_mode = "ZYX"
        h.rotation_euler = (math.radians(WRIST_BACK), 0, sg * math.radians(90))
    (pr, nr, ur), (pl, nl, ul) = hhand(CMDR, "R"), hhand(CMDR, "L")
    n = (nr + nl).normalized()
    wide = ((palm(pr, n)[1] - palm(pl, n)[1]).length + 0.07) / 0.2                        # spans both palms
    sy = max(K.ease(t / 0.4), 0.05)                                                      # unrolls downward from the hands
    near = []
    for sd in "RL":
        fa = K.hpart(CMDR, f"forearm_{sd}"); w = K.hpart(CMDR, f"hand_{sd}").matrix_world.translation
        near += [q for q in (fa.matrix_world @ v.co for v in fa.data.vertices) if (q - w).length < 0.16]
    sheet_on_palm(ORDER, pr + pl, n, ur + ul, 0.32 * sy - 0.04, (wide, sy), clear=near)
    lk((0.55, 0.9, 1.6), (0.0, -1.0, 1.4), t, math.radians(6))                      # over Onoda's shoulder


def s16(t, d):   # "And Onoda saluted," — salute, one tear
    HERO.faces_dir = os.path.join(SOLD, "w3"); HERO.face("sad" if t < 0.5 else "happy")
    SLUNG.hide_render = False; HELD.hide_render = True
    u = K.ease(t / 0.35)
    aim_arm(HERO, "R", (-0.85 * u - 0.1, -0.3 * u, -1 + 1.05 * u), (0.75 * u, -0.25, -1 + 1.6 * u), (0.6 * u, -0.1, -1 + 1.7 * u))
    face_cam(HERO, 0.9 * punch(t, 0.3, 1.4, 0.3), 35, dz=0.02, orbit=0.2, roll=math.radians(-4), t=t)
    if t > 0.55:                                            # one tear under his left eye, sliding down the cheek
        v = K.ease((t - 0.55) / 0.8); pb = HERO.arm.pose.bones["Head"]
        p = HERO.arm.matrix_world @ (pb.matrix @ Vector((TEAR_EYE[0], TEAR_EYE[1] - TEAR_EYE[3] * v, TEAR_EYE[2])))
        on_screen(TEAR, *screen_xy(p), cam_depth(p) - 0.02)


def s17(t, d):   # "and went home, after 29 years of fighting a war that was already over." — the uniform turns back blue; loop
    tb = d * 0.35
    blue = t > tb
    HERO.faces_dir = K.FACES if blue else os.path.join(SOLD, "w3"); HERO.face("neutral" if blue else "happy")
    CAP.hide_render = blue; SLUNG.hide_render = blue; HELD.hide_render = True
    u = t / d
    place(HERO, (0.2 - 0.4 * u, -0.2 - 1.2 * u, 0.03 * abs(math.sin(t * 7))), math.radians(8))
    t29 = wt(16, "29")
    face_cam(HERO, 1.7 - 0.9 * K.ease(t / d), 35, dz=-0.1, orbit=-0.3 + 0.6 * u, roll=math.radians(5 - 10 * u), t=t)
    number_by_face(T29, t, t29 - 0.05, t_out=d - 0.5)


SHOTS = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12, s13, s14, s15, s16, s17]
assert len(SHOTS) == len(SHOT_RANGES), (len(SHOTS), len(SHOT_RANGES))
CAST = {s01: [HERO], s03: [HERO], s05: [HERO], s06: [HERO], s07: [HERO], s08: [HERO], s09: [HERO] + COMRADES,
        s10: [SUZUKI], s11: [SUZUKI], s12: [HERO, SUZUKI], s13: [HERO], s15: [HERO], s16: [HERO], s17: [HERO], s04: CROWD}


def apply(frame):
    i = max(j for j in range(len(SHOT_RANGES)) if SHOT_RANGES[j][0] <= frame)
    f0, f1 = SHOT_RANGES[i]; t = (frame - f0) / FPS; d = (f1 - f0) / FPS
    for o in [PLANE, CHECK, ORDER] + LEAF + V3_PROPS:
        park(o)
    for L in [T29, BANNER] + list(YEARS.values()):
        L.hide()
    PIN.scale = (1, 1, 0.001); PLANE.scale = (1, 1, 1)
    for r in (CMDR, SELLER):
        hide_hombre(r, True)
    for k in ALL_K:
        k.rest()
    HERO.faces_dir = os.path.join(SOLD, "w0"); place(HERO, (0, 0, 0), 0); CAP.hide_render = False
    LEAF[0].scale = (1, 1, 1)
    CHECK.data.materials[0].node_tree.nodes["Image Texture"].image = CHECK_TODO
    cam.data.lens = 35                                      # reset per frame: no state carried from the previous shot
    fn = SHOTS[i]
    vis = CAST.get(fn, [])
    for k in ALL_K:
        k.hide(k not in vis)
    CAP.hide_render = HERO not in vis
    SLUNG.hide_render = HELD.hide_render = True
    for o in PACK_PARTS:
        o.hide_render = SUZUKI not in vis
    fire(frame / FPS)
    for r in ALL_P:
        for o in r.children_recursive:
            if o.type == "MESH" and o.parent != r:
                o.rotation_euler = (0, 0, 0)                        # rest pose for the hinged parts
        hide_hombre(r, r not in vis)
    fn(t, d)
    if HERO not in vis:
        SLUNG.hide_render = HELD.hide_render = CAP.hide_render = True
    K.ps1_snap_update(cam)
    bpy.context.view_layer.update()


def handler(scene, depsgraph=None):
    apply(scene.frame_current)


K.ps1_snap(cam, grid_h=int(os.environ.get("PS1_GRID", 240)))   # 240 rows: back to video #1 (user, 2026-10-31)
bpy.app.handlers.frame_change_pre.clear()
bpy.app.handlers.frame_change_pre.append(handler)
sc.frame_start, sc.frame_end = 0, END - 1

if "--board" in ARGS:
    out = os.path.join(HERE, "review", "board"); os.makedirs(out, exist_ok=True)
    sc.render.resolution_percentage = 50
    nxt = ARGS[ARGS.index("--board") + 1] if len(ARGS) > ARGS.index("--board") + 1 else ""
    picks = nxt.split(",") if nxt and not nxt.startswith("--") else None
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

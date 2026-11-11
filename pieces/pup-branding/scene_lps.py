"""Pup Poly Shorts banner, @LowPolyShorts-style (no words): an empty low-poly field - huge pixelated sky photo, a dark
rocky ridge, a flat ground with big texels - and the v2 dog several times in a deadpan line-up, each copy in a different
pose (happy wag, sitting head tilt, lying down, sniffing, sad with tears; extra poses out in the desktop/TV width).
  /Applications/Blender.app/Contents/MacOS/Blender -b -P scene_lps.py -- render   -> renders/banner_lps_raw.png
                                                                     -- check    -> review/lps_check.txt (+ review/lps_side.png)
post_lps.py adds the PS1 dither + previews. The set sits at x = -200, far from the zaw-dog-02 rooms that build.py makes."""
import math
import os
import runpy
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["render"]
MODE = ARGS[0]
sys.argv = [sys.argv[0], "--", "none"]
G = runpy.run_path(os.path.join(ROOT, "pieces", "zaw-dog-02", "build.py"), run_name="zd02")
import bpy  # noqa: E402
import numpy as np  # noqa: E402
from mathutils import Vector  # noqa: E402
from bpy_extras.object_utils import world_to_camera_view  # noqa: E402
K, D = G["K"], G["D"]
sc = G["sc"]; CAM = G["CAM"]
X0 = -200.0                                                    # origin of the field
W, Hh = 2560, 1440
SAFE = (507, 508, 2053, 931)
os.makedirs(os.path.join(H, "renders"), exist_ok=True); os.makedirs(os.path.join(H, "review"), exist_ok=True)


def uv_world(o, s=1.0, axes="xy"):
    me = o.data; uvl = me.uv_layers.new()
    for p in me.polygons:
        for li, vi in zip(p.loop_indices, p.vertices):
            c = o.matrix_world @ me.vertices[vi].co
            a = {"x": c.x, "y": c.y, "z": c.z}
            uvl.data[li].uv = (a[axes[0]] * s, a[axes[1]] * s)
    return o


def noise_tex(name, base, spread, n=64, seed=1):
    r = np.random.default_rng(seed)
    a = np.array(base, float)[None, None, :] * (1 + (r.random((n, n, 1)) - 0.5) * spread)
    a = a + (r.random((n, n, 3)) - 0.5) * 10
    img = K.image_from_array(name, np.dstack([a.clip(0, 255), np.full((n, n), 255)]).astype(np.uint8))
    return img


# ---------------------------------------------------------------- the field
GROUND = K.mat_image("lps_grass", G["img"]("grass"), repeat=(1, 1))
g = K.plane("lps_ground", 400, 400, (X0, 150, 0.0), rot=(0, 0, 0), mat=GROUND)
[g.data.uv_layers.remove(l) for l in list(g.data.uv_layers)]; uv_world(g, 0.35)          # ~3 m per tile: big readable texels like LPS's sand
def rock_tex(n=128, seed=5):
    """rocky ridge texture: fractal value noise (dark grey-brown), ledges and cracks, light speckle - like LPS's rock."""
    r = np.random.default_rng(seed); acc = np.zeros((n, n))
    for k, amp in ((4, 1.0), (8, 0.6), (16, 0.4), (32, 0.25), (64, 0.18)):
        g = r.random((k, k)); acc += amp * np.kron(g, np.ones((n // k, n // k)))
    acc = (acc - acc.min()) / (acc.max() - acc.min())
    ledges = (np.sin(np.arange(n)[:, None] * 0.55 + acc * 6.0) > 0.86) * -0.35          # dark horizontal strata
    cracks = (r.random((n, n)) > 0.985) * -0.4
    speck = (r.random((n, n)) > 0.93) * 0.35
    v = np.clip(0.42 + 0.75 * (acc - 0.5) + ledges + cracks + speck, 0.05, 1.0)
    base = np.array((92, 86, 78), float)
    rgb = base[None, None, :] * (0.35 + 1.1 * v[..., None])
    return K.image_from_array("rock2", np.dstack([rgb.clip(0, 255), np.full((n, n), 255)]).astype(np.uint8))


ROCK = K.mat_image("lps_rock", rock_tex())
# ridge: a jagged low-poly band of hills across the back (front edge buried in the ground)
xs = np.linspace(X0 - 150, X0 + 150, 31)
rng = np.random.default_rng(7)
tops = 2.4 + 1.1 * np.sin(xs * 0.05) + rng.random(len(xs)) * 1.0          # lower ridge: more sky
tops[13:18] = [2.8, 3.7, 4.2, 3.4, 2.9]                          # a peak a little left of centre, as in the LPS banner
vs, fs = [], []
for i, (x, z) in enumerate(zip(xs, tops)):                        # three jittered rows: faceted rock, not a flat sheet
    vs += [(x, 26.0, -0.5), (x + rng.normal(0, 1.2), 29.5 + rng.random() * 2, z * (0.45 + rng.random() * 0.2)), (x, 34.0 + rng.random() * 3, z)]
for i in range(len(xs) - 1):
    for r_ in range(2):
        fs.append((3 * i + r_, 3 * i + 3 + r_, 3 * i + 4 + r_, 3 * i + 1 + r_))
ridge = K.mesh_from("lps_ridge", vs, fs, ROCK)
uv_world(ridge, 0.5, "xz")
# sky: the set's cloud photo, stretched huge behind everything (big pixels, like LPS's sky)
SKY = K.mat_image("lps_sky", G["img"]("sky"), emit_only=True)
K.plane("lps_sky", 260, 110, (X0, 70, 40), mat=SKY)

# ---------------------------------------------------------------- the dogs
while len(G["DOGS"]) < 7:                                        # build.py makes one dog: add copies
    o, arm, fn = D.build()
    mv = K.link(bpy.data.objects.new(f"mover{len(G['DOGS'])}", None)); arm.parent = mv
    G["DOGS"].append(dict(o=o, arm=arm, fn=fn, mv=mv, sh=D.blob_shadow(mv)))
DOGS = G["DOGS"]; dog, dog_sit = G["dog"], G["dog_sit"]


def dog_lie(i):
    """from zaw-dog-01: flat on the floor, IK paws stay planted and slide forward (front) / back (hind)."""
    arm = DOGS[i]["arm"]
    D.move(arm, "hips", (0, 0.04, -0.2)); D.rot(arm, "hips", (1, 0, 0), 0.06)
    for s, sx in (("L", 1), ("R", -1)):
        D.move(arm, f"ik_f.{s}", (0.02 * sx, -0.27, 0.0)); D.move(arm, f"ik_h.{s}", (0.05 * sx, -0.06, 0.0))


G["reset"]()
CAM_POS = (X0, -3.3, 0.42)
LINE_Y = 0.0
POSES = [  # (name, x, y, yaw, expr, t, extra)  - five in the safe area, two more out in the TV/desktop width
    ("happy_wag", X0 - 1.78, LINE_Y + 0.1, 1.1, "happy", 0.06, "look"),
    ("sit_tilt", X0 - 0.98, LINE_Y, 1.0, "judging", 0.3, "sit_side"),
    ("lying", X0 - 0.1, LINE_Y + 0.1, -1.2, "happy", 0.4, "lie"),
    ("sniff", X0 + 1.02, LINE_Y + 0.2, -1.2, "neutral", 0.2, "sniff"),
    ("sad_tears", X0 + 1.8, LINE_Y, -1.0, "sad", 0.2, "sad_sit"),
    ("shocked", X0 - 3.15, LINE_Y + 0.2, 0.35, "shocked", 0.1, None),
    ("walk", X0 + 3.2, LINE_Y + 0.2, -1.35, "neutral", 0.0, "walk"),
]
for i, (nm, x, y, yaw, e, t, ex) in enumerate(POSES):
    dd = dog(i, (x, y, 0), yaw, e, t)
    arm = dd["arm"]
    from mathutils import Quaternion

    def compose(bone, axis, ang):
        pb = arm.pose.bones[bone]; pb.rotation_quaternion = Quaternion(D.local_axis(arm, bone, axis), ang) @ pb.rotation_quaternion
    if ex == "sit_side":                                         # side-on so the haunches + folded hind legs read; head to the lens
        dog_sit(i); compose("head", (0, 0, 1), -0.45)
    elif ex == "sad_sit":                                        # sit + head hung low, ears dropped flat back, tear face
        dog_sit(i); compose("neck", (1, 0, 0), 0.38); compose("head", (1, 0, 0), 0.12); compose("head", (0, 0, 1), 0.35)
        for s_, sx in (("L", 1), ("R", -1)):
            D.rot2(arm, f"ear.{s_}", [((0, 1, 0), sx * 0.38), ((1, 0, 0), 0.1)])     # hanging flat against the cheeks
    elif ex == "lie":                                            # belly down, front legs out, side-on, head to the lens
        dog_lie(i)
        D.rot2(arm, "head", [((1, 0, 0), -0.05), ((0, 0, 1), 0.45), ((0, 1, 0), 0.12)])
    elif ex == "sniff":                                          # nose to the grass
        D.rot2(arm, "neck", [((1, 0, 0), 0.85)]); D.rot2(arm, "head", [((1, 0, 0), 0.4)])
    elif ex == "look":                                           # side-on, head turned to the lens (mid-wag)
        D.rot2(arm, "neck", [((1, 0, 0), -0.04), ((0, 0, 1), -0.3)])
        D.rot2(arm, "head", [((1, 0, 0), -0.02), ((0, 0, 1), -0.38), ((0, 1, 0), -0.2)])
    elif ex == "walk":
        D.walk_pose(arm, 6, key=False)
    if nm == "sit_tilt":
        from mathutils import Quaternion
        pb = arm.pose.bones["head"]
        pb.rotation_quaternion = Quaternion(D.local_axis(arm, "head", (0, 1, 0)), 0.32) @ pb.rotation_quaternion   # the head tilt
bpy.context.view_layer.update()
CAM.data.lens = 28
K.look(CAM, CAM_POS, (X0, 20.0, 0.42 + 0.0)); K.ps1_snap_update(CAM)
sc.render.resolution_x, sc.render.resolution_y = W, Hh


def dog_points(i):
    dg = bpy.context.evaluated_depsgraph_get(); ev = DOGS[i]["o"].evaluated_get(dg); mw = ev.matrix_world
    return [mw @ v.co for v in ev.data.vertices]


def report():
    bpy.context.view_layer.update()
    rows, boxes = [], []
    for i, p in enumerate(POSES):
        P = dog_points(i); lo = min(v.z for v in P)
        uv = [world_to_camera_view(sc, CAM, v) for v in P]
        b = (round(min(u.x for u in uv) * W), round((1 - max(u.y for u in uv)) * Hh), round(max(u.x for u in uv) * W), round((1 - min(u.y for u in uv)) * Hh))
        inside = SAFE[0] <= b[0] and b[2] <= SAFE[2] and SAFE[1] <= b[1] and b[3] <= SAFE[3]
        outside = b[2] < SAFE[0] or b[0] > SAFE[2]
        fr = 0 <= b[0] and b[2] <= W and 0 <= b[1] and b[3] <= Hh
        xy = np.array([(v.x, v.y) for v in P])
        boxes.append((xy.min(0), xy.max(0)))
        rows.append(f"{p[0]:10s} lowest vertex z {lo:+.4f} m | px box {b} h {b[3]-b[1]} | "
                    f"{'INSIDE safe' if inside else ('fully OUTSIDE safe (desktop/TV only)' if outside else 'CROSSES the safe edge !!')} | in frame {fr}")
    pts = [np.array([(v.x, v.y, v.z) for v in dog_points(i)]) for i in range(len(POSES))]
    for i in range(len(POSES)):                                  # real 3D gap between every pair of copies (vertex to vertex)
        for j in range(i + 1, len(POSES)):
            dmin = np.sqrt(((pts[i][:, None, :] - pts[j][None, :, :]) ** 2).sum(-1)).min()
            if dmin < 0.25:
                rows.append(f"{'!! ' if dmin < 0.05 else ''}gap {POSES[i][0]} / {POSES[j][0]} = {dmin:.3f} m")
    rows.append("all neighbouring copies >= 5 cm apart" if not any(r.startswith("!!") for r in rows) else "!! copies touch")
    txt = "\n".join(rows); open(os.path.join(H, "review", "lps_check.txt"), "w").write(txt + "\n"); print(txt)


report()
if MODE == "render":
    G["render"](os.path.join(H, "renders", "banner_lps_raw.png"), (W, Hh))
elif MODE == "check":                                            # a low side view along the line to see every paw on the ground
    K.look(CAM, (X0 - 5.5, -1.2, 0.3), (X0, 0.1, 0.25)); CAM.data.lens = 35; K.ps1_snap_update(CAM)
    G["render"](os.path.join(H, "review", "lps_side.png"), (1600, 600))

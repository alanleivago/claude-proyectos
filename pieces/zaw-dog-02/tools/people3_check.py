"""Blender: isolated checks of the v2 photo-people (photohuman2): front / 3-4 / side / back / 3-4 back + head close-ups
(3/4 and side) + hands (relax / grip a ball / point / open palm with a snack) -> review/people3/.
/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/people3_check.py -- [name ...]"""
import math, os, sys
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path[:0] = [H, os.path.join(H, "..", "lps-onoda"), os.path.join(H, "..", "lps-lowpoly-test")]
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
import lpskit as K  # noqa: E402
import photohuman2 as PH  # noqa: E402
import photoprop as PP  # noqa: E402
OUT = os.path.join(H, "review", "people3"); os.makedirs(OUT, exist_ok=True)
names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv and sys.argv[-1] != "--" else ["owner", "researcher", "pointer", "stranger_a", "stranger_b"]
sc = K.reset("#8A8A8A"); sc.eevee.taa_render_samples = 8
cam = K.camera("Cam", 50)
K.box("floor", (6, 6, 0.02), (0, 0, -0.01), K.mat_color("fl", "#B8B0A0"))
BALL = PP.loft(os.path.join(H, "tex", "src", "ball2.png"), "ball", height=0.066, sides=8, loc=(0, 0, -5))
SNACK = K.box("snack", (0.06, 0.025, 0.015), (0, 0, -5), K.mat_color("sn", "#B07A40"))


def shot(path, pos, tgt, lens=50, res=(360, 640)):
    sc.render.resolution_x, sc.render.resolution_y = res
    K.look(cam, pos, tgt); cam.data.lens = lens; sc.render.filepath = path; bpy.ops.render.render(write_still=True)


for name in names:
    for o in list(bpy.data.objects):
        if o.name not in ("Cam", "Sun", "floor", "ball", "snack") and o.type in ("MESH", "ARMATURE", "EMPTY"):
            bpy.data.objects.remove(o)
    P = PH.PhotoPerson(name); h = P.J["height"]; P.show(True, (0, 0, 0), 0.0); P.rest()
    BALL.location = (0, 0, -5); SNACK.location = (0, 0, -5)
    for view, pos in (("front", (0, -6, h / 2)), ("f34", (4.2, -4.2, h / 2)), ("side", (6, 0, h / 2)), ("back", (0, 6, h / 2)), ("b34", (-4.2, 4.2, h / 2))):
        cam.data.type = "ORTHO"; cam.data.ortho_scale = h * 1.08; shot(os.path.join(OUT, f"{name}_{view}.png"), pos, (0, 0, h / 2))
    cam.data.type = "PERSP"
    hz = P.J["z_neck"] + 0.12
    for view, pos in (("head34", (0.55, -0.6, hz + 0.03)), ("headside", (0.85, -0.02, hz)), ("headfront", (0, -0.85, hz))):
        shot(os.path.join(OUT, f"{name}_{view}.png"), pos, (0, 0, hz), 50, (360, 360))
    # hands: grip a ball held forward, point, open palm up with a snack
    za = P.J["z_armpit"]
    P.pose_arm("R", (0.2, -0.22, za - 0.2), (0.16, -0.48, za - 0.1)); P.hand("R", "grip")
    BALL.location = tuple(P.grip_point("R", 0.033) - Vector((0, 0, 0.033)))
    P.pose_arm("L", (0.22, -0.2, za - 0.18), (0.24, -0.45, za - 0.05)); P.hand("L", "point")
    bpy.context.view_layer.update()
    for view, pos in (("hands_f34", (0.9, -1.3, za + 0.05)), ("hands_side", (1.4, -0.25, za)), ("hands_top", (0.1, -0.9, za + 0.6))):
        shot(os.path.join(OUT, f"{name}_{view}.png"), pos, (0, -0.4, za - 0.08), 40, (480, 480))
    P.rest(); BALL.location = (0, 0, -5)
    P.pose_arm("L", (0.2, -0.2, za - 0.3), (0.18, -0.45, za - 0.28)); P.hand("L", "open"); P.twist("L", -math.pi / 2)
    bpy.context.view_layer.update(); SNACK.location = tuple(P.grip_point("L", 0.0) + Vector((0, 0, 0.012)))
    shot(os.path.join(OUT, f"{name}_palm.png"), (0.9, -1.1, za + 0.2), (0.15, -0.45, za - 0.3), 40, (480, 480))

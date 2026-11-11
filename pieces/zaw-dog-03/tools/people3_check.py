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
names = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv and sys.argv[-1] != "--" else ["owner", "stranger"]
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
    # feet (zaw-dog-03): 3/4 front and 3/4 back close-ups at shoe height - one clean shoe per foot, no ghost copy
    for view, pos in (("feetfront", (0.0, -1.0, 0.3)), ("feet34", (0.75, -0.75, 0.32)), ("feetb34", (-0.7, 0.75, 0.32)), ("feetside", (0.95, 0.0, 0.2))):
        shot(os.path.join(OUT, f"{name}_{view}.png"), pos, (0, 0, 0.08), 50, (360, 360))
    # ankle-in-shoe fit, side views: mid-stride walk and seated (thighs forward, shins down), soles on the floor
    import bpy as _b

    def _ground():
        _b.context.view_layer.update(); dg = _b.context.evaluated_depsgraph_get(); ev = P.body.evaluated_get(dg)
        P.arm.location.z -= min((ev.matrix_world @ v.co).z for v in ev.data.vertices)
    P.arm.location = (0, 0, 0); P.walk(0.28, 1.0, 0.9); _ground()
    shot(os.path.join(OUT, f"{name}_feetwalk.png"), (1.0, -0.05, 0.25), (0, -0.05, 0.12), 45, (360, 360))
    P.rest(); P.arm.location = (0, 0, 0)
    for s_ in "LR":
        P.rot(f"thigh.{s_}", [((1, 0, 0), -1.35)]); P.rot(f"shin.{s_}", [((1, 0, 0), 1.35)]); P.rot(f"foot.{s_}", [])
    _ground()
    yk = P.arm.matrix_world @ P.arm.pose.bones["foot.L"].head
    shot(os.path.join(OUT, f"{name}_feetsit.png"), (1.0, yk.y, 0.25), (0, yk.y, 0.12), 45, (360, 360))
    shot(os.path.join(OUT, f"{name}_feetsit34.png"), (0.7, yk.y - 0.7, 0.35), (0, yk.y, 0.1), 45, (360, 360))
    shot(os.path.join(OUT, f"{name}_feetsitfront.png"), (0.0, yk.y - 1.0, 0.3), (0, yk.y, 0.12), 45, (360, 360))
    P.rest(); P.arm.location = (0, 0, 0)
    # hands (zaw-dog-03): R = the Flow tissue fist raised to the face, L = open hand held out palm-DOWN (to be sniffed)
    za = P.J["z_armpit"]; zn = P.J["z_neck"]
    P.pose_arm("R", (0.2, -0.12, za - 0.22), (0.05, -0.2, zn - 0.02), (0.03, -0.2, zn + 0.16)); P.hand("R", "tissue")
    P.pose_arm("L", (0.22, -0.2, za - 0.18), (0.24, -0.45, za - 0.05)); P.hand("L", "open"); P.twist("L", 1.5)
    bpy.context.view_layer.update()
    for view, pos in (("hands_f34", (0.9, -1.3, za + 0.05)), ("hands_side", (1.4, -0.25, za)), ("hands_top", (0.1, -0.9, za + 0.6))):
        shot(os.path.join(OUT, f"{name}_{view}.png"), pos, (0, -0.4, za - 0.08), 40, (480, 480))
    P.rest(); BALL.location = (0, 0, -5)
    P.pose_arm("L", (0.2, -0.2, za - 0.3), (0.18, -0.45, za - 0.28)); P.hand("L", "open"); P.twist("L", -math.pi / 2)
    bpy.context.view_layer.update(); SNACK.location = tuple(P.grip_point("L", 0.0) + Vector((0, 0, 0.012)))
    shot(os.path.join(OUT, f"{name}_palm.png"), (0.9, -1.1, za + 0.2), (0.15, -0.45, za - 0.3), 40, (480, 480))

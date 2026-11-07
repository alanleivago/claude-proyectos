"""Blender: the photo-built people (photohuman.PhotoPerson) rendered from the photo angles (front / side / back, A-pose)
and in the rest + walk + wave poses, for the side-by-side director check against the Flow sheets -> review/people2/.
/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/people2_check.py"""
import math, os, sys
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path[:0] = [H, os.path.join(H, "..", "lps-onoda")]
import bpy  # noqa: E402
import lpskit as K  # noqa: E402
import photohuman as PH  # noqa: E402
OUT = os.path.join(H, "review", "people2"); os.makedirs(OUT, exist_ok=True)
sc = K.reset("#8A8A8A"); sc.eevee.taa_render_samples = 8
sc.render.resolution_x, sc.render.resolution_y = 360, 640
cam = K.camera("Cam", 50)
for name in ("owner", "friend", "sci"):
    for o in list(bpy.data.objects):
        if o.type in ("MESH", "ARMATURE"):
            bpy.data.objects.remove(o)
    P = PH.PhotoPerson(name); h = P.J["height"]
    for pb in P.arm.pose.bones:                                     # A-pose = the photo pose
        pb.rotation_quaternion = (1, 0, 0, 0)
    for view, pos in (("front", (0, -6, h / 2)), ("side", (6, 0, h / 2)), ("back", (0, 6, h / 2))):
        K.look(cam, pos, (0, 0, h / 2)); cam.data.type = "ORTHO"; cam.data.ortho_scale = h * 1.08
        sc.render.filepath = os.path.join(OUT, f"{name}_{view}.png"); bpy.ops.render.render(write_still=True)
    cam.data.type = "PERSP"
    POSES = {"rest_f34": ((1.4, -2.6, 1.3), None), "rest_b34": ((-1.2, 2.6, 1.4), None), "rest_side": ((2.9, -0.2, 1.2), None),
             "rest_back": ((0.0, 2.9, 1.3), None), "walk": ((1.4, -2.6, 1.3), "walk"), "wave": ((1.4, -2.6, 1.3), "wave"),
             "carry": ((-1.4, -2.6, 1.3), "carry"), "point": ((0.6, -2.8, 1.3), "point"), "arms_out_b34": ((-1.0, 2.7, 1.2), "out")}
    for pose, (pos, kind) in POSES.items():
        P.rest()
        if kind == "walk":
            P.walk(0.28)
        if kind == "wave":                                            # build.h_flap
            P.rot("upperarm.R", [((1, 0, 0), -2.5), ((0, 1, 0), 0.5)]); P.rot("forearm.R", [((1, 0, 0), -0.4)])
            P.rot("upperarm.L", [((1, 0, 0), -0.5), ((0, 1, 0), -0.2)]); P.rot("forearm.L", [((1, 0, 0), -1.2)])
        if kind == "carry":                                           # build.h_carry + b11 lift
            P.rot("upperarm.L", [((1, 0, 0), -1.0), ((0, 1, 0), -0.2)]); P.rot("forearm.L", [((1, 0, 0), -0.5)])
            P.rot("upperarm.R", [((1, 0, 0), -0.1), ((0, 1, 0), 0.22)]); P.rot("forearm.R", [((1, 0, 0), -0.25)])
        if kind == "point":                                           # b04a
            P.rot("upperarm.L", [((1, 0, 0), -0.55), ((0, 1, 0), -1.1)]); P.rot("forearm.L", [((1, 0, 0), -0.2)])
        if kind == "out":                                             # b10b
            for sd, sg in (("L", 1), ("R", -1)):
                P.rot(f"upperarm.{sd}", [((1, 0, 0), -0.9), ((0, 1, 0), -0.4 * sg)]); P.rot(f"forearm.{sd}", [((1, 0, 0), -0.5)])
        K.look(cam, pos, (0, 0, h * 0.52))
        sc.render.filepath = os.path.join(OUT, f"{name}_{pose}.png"); bpy.ops.render.render(write_still=True)

"""Blender: cameras matched to his frames (calibrated turntable camera / his viewport rest frame), with his frame as
camera background image. render_ref(view, path) renders our model through it."""
import bpy, json, math, numpy as np
from mathutils import Vector, Matrix, Quaternion
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
FR = r"/Users/alanleiva/claude-proyectos/fuentes/mml2-girl-tutorial/frames/"
import sys; sys.path.insert(0, V5)
import importlib, rast; importlib.reload(rast)
TURN = json.load(open(V5 + "turn_cam.json"))
REFS = {"q3": (45, "turn5/t046.png"), "side": (10, "turn5/t011.png"), "back": (15, "turn5/t016.png"), "front3": (0, "turn5/t001.png")}


def cam_params(view):
    if view == "front": return json.load(open(V5 + "pose_front.json"))["cam"], FR + "rest2/r011.png"
    if view in ("runA", "runB"): return json.load(open(V5 + f"pose_{view}.json"))["cam"], FR + ("cam/run_764.0.png" if view == "runA" else "cam/run_764.4.png")
    if view == "idle": return json.load(open(V5 + "pose_idle.json"))["cam"], FR + "cam/front_idle.png"
    k, img = REFS[view]; th0 = json.load(open(V5 + "pose_hip.json"))["theta0"]
    p = dict(TURN); p["theta"] = th0 - 7.2 * k; return p, FR + img


def make_cam(view):
    p, img = cam_params(view)
    C, R, U, F = rast.cam_basis(p)
    name = "RefCam_" + view
    cam = bpy.data.objects.get(name)
    if not cam:
        cam = bpy.data.objects.new(name, bpy.data.cameras.new(name)); bpy.context.scene.collection.objects.link(cam)
    cd = cam.data; cd.type = "PERSP"; cd.lens = p["f"]; cd.sensor_width = 36; cd.sensor_fit = "HORIZONTAL"; cd.clip_end = 500
    M = Matrix((tuple(R), tuple(U), tuple(-F))).transposed()     # columns: X=R, Y=U, Z=-F
    cam.matrix_world = Matrix.Translation(Vector(C)) @ M.to_4x4()
    cd.show_background_images = True
    im = bpy.data.images.load(img, check_existing=True)
    bg = cd.background_images[0] if cd.background_images else cd.background_images.new()
    bg.image = im; bg.alpha = 0.5; bg.display_depth = "FRONT"; bg.frame_method = "FIT"
    return cam


def render_ref(view, path, res=(1920, 1080), pct=50):
    sc = bpy.context.scene; cam = make_cam(view); old = sc.camera; sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.resolution_percentage = pct
    sc.render.film_transparent = True; sc.render.filepath = path; sc.render.image_settings.color_mode = "RGBA"
    bpy.ops.render.render(write_still=True); sc.camera = old; sc.render.film_transparent = False; sc.render.image_settings.color_mode = "RGB"
    sc.render.resolution_percentage = 100

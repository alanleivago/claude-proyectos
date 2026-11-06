"""Blender: /Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- <mode>
modes: check  -> renders/check/*.png (front, side, 3/4, face close-up, back, top + walk frames 0..WALK_T)
       turn   -> renders/frames_turn/#####.png (180 f turntable, faces cycle)
       walk   -> renders/frames_walk/#####.png (living room walk, 180 f)
       expr   -> renders/expr/<expr>.png (face close-ups for the sheet)
Then venv: python post.py <mode> (ps1_post dither + mp4/sheet)."""
import math
import os
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
sys.path.insert(0, H); sys.path.insert(0, os.path.join(ROOT, "pieces", "lps-onoda"))
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
import lpskit as K  # noqa: E402
import dog as D  # noqa: E402

MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "check"
OUT = os.path.join(H, "renders")


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def studio(bg="#C9B79C"):
    sc = K.reset(bg)
    sc.eevee.taa_render_samples = 4
    floor = K.mat_image("floor", K.tex_tiles("floor_t", 64, 4, "#D8C7A8", "#CDB894", "#A8906C"), repeat=(1, 1))
    K.box("floor", (8, 8, 0.02), (0, 0, -0.01), floor, uv_scale=1.0)
    K.plane("backdrop", 12, 8, (0, 4, 3), mat=K.mat_color("bd", bg))
    return sc


def living_room():
    sc = K.reset("#F2D9B0")
    sc.eevee.taa_render_samples = 4
    # floor planks + rug
    K.box("floor", (6, 8, 0.04), (0, 0, -0.02), K.mat_image("planks", K.tex_planks("pl", 64, "#A0703F"), repeat=(1, 1)), uv_scale=1.0)
    K.box("rug", (1.5, 2.6, 0.012), (0.15, 0.1, 0.006), K.mat_image("rug", K.tex_tiles("rugt", 64, 8, "#B8504A", "#C9A35C", "#7A3530"), repeat=(1, 1)), uv_scale=0.8)
    wallm = K.mat_image("wall", K.tex_wallpaper("wp", 64, "#E7C99A", "#D8B583"), repeat=(1, 1))
    trim = K.mat_color("trim", "#F4EEE2")
    # back wall (x = -1.4) with a window hole: y -0.2..0.9, z 0.9..1.9
    WX = -1.4
    for name, (y0, y1, z0, z1) in {"wl": (-4, -0.2, 0, 3), "wr": (0.9, 4, 0, 3), "wb": (-0.2, 0.9, 0, 0.9), "wt": (-0.2, 0.9, 1.9, 3)}.items():
        K.box(name, (0.1, y1 - y0, z1 - z0), (WX, (y0 + y1) / 2, (z0 + z1) / 2), wallm, uv_scale=1.0)
    for name, size, loc in [("sill", (0.22, 1.3, 0.05), (WX + 0.05, 0.35, 0.88)), ("fl", (0.12, 0.06, 1.0), (WX + 0.02, -0.2, 1.4)),
                            ("fr", (0.12, 0.06, 1.0), (WX + 0.02, 0.9, 1.4)), ("ft", (0.12, 1.16, 0.06), (WX + 0.02, 0.35, 1.9)),
                            ("fm", (0.08, 0.04, 1.0), (WX + 0.02, 0.35, 1.4)), ("fh", (0.08, 1.1, 0.04), (WX + 0.02, 0.35, 1.4)),
                            ("skirt", (0.06, 8, 0.1), (WX + 0.07, 0, 0.05))]:
        K.box(name, size, loc, trim)
    sky = bpy.data.images.load(os.path.join(H, "tex", "sky.png")); sky.pack()
    K.plane("sky", 4.0, 3.0, (WX - 1.2, 0.35, 1.5), rot=(math.pi / 2, 0, math.pi / 2), mat=K.mat_image("sky", sky, emit_only=True))
    # curtains
    cur = K.mat_color("curtain", "#6E8F6A")
    K.box("curL", (0.06, 0.25, 1.35), (WX + 0.12, -0.38, 1.3), cur); K.box("curR", (0.06, 0.25, 1.35), (WX + 0.12, 1.08, 1.3), cur)
    # side wall (y = -2.6) so the frame never sees a void
    K.box("wside", (6, 0.1, 3), (1.6, -2.6, 1.5), wallm)
    K.box("wside2", (6, 0.1, 3), (1.6, 3.4, 1.5), wallm)
    # sofa against the back wall, left of the window
    sof, cush = K.mat_color("sofa", "#3F6E8C"), K.mat_color("cush", "#5A8BAA")
    K.box("sofa_base", (0.8, 1.8, 0.4), (WX + 0.48, -1.45, 0.22), sof)
    K.box("sofa_back", (0.25, 1.8, 0.75), (WX + 0.18, -1.45, 0.55), sof)
    K.box("sofa_armL", (0.8, 0.2, 0.6), (WX + 0.48, -2.35, 0.3), sof); K.box("sofa_armR", (0.8, 0.2, 0.6), (WX + 0.48, -0.55, 0.3), sof)
    K.box("cush1", (0.62, 0.78, 0.14), (WX + 0.52, -1.86, 0.49), cush); K.box("cush2", (0.62, 0.78, 0.14), (WX + 0.52, -1.04, 0.49), cush)
    K.box("pillow", (0.1, 0.4, 0.36), (WX + 0.36, -1.9, 0.72), K.mat_color("pil", "#E8B04A"))
    # plant, lamp, picture, side table, toy bone
    K.box("pot", (0.3, 0.3, 0.35), (WX + 0.4, 1.4, 0.175), K.mat_color("pot", "#B25E3C"))
    leaf = K.mat_color("leaf", "#3E8A44")
    for i, (dy, h) in enumerate([(0, 0.9), (0.12, 0.7), (-0.12, 0.75)]):
        o = K.box(f"leaf{i}", (0.22, 0.08, h), (WX + 0.4, 1.4 + dy, 0.35 + h / 2), leaf); o.rotation_euler = (dy * 2.5, 0, i)
    K.box("tbl", (0.45, 0.45, 0.04), (WX + 0.5, 2.3, 0.55), K.mat_color("tbl", "#7A4E2C"))
    K.box("tbl_leg", (0.06, 0.06, 0.55), (WX + 0.5, 2.3, 0.275), K.mat_color("tbl2", "#5C3A20"))
    K.box("lamp", (0.12, 0.12, 0.3), (WX + 0.5, 2.3, 0.72), K.mat_color("lampb", "#D9D2C2"))
    K.box("shade", (0.34, 0.34, 0.26), (WX + 0.5, 2.3, 0.98), K.mat_color("shade", "#F7E7B4", emit_only=True))
    K.box("frame", (0.04, 0.7, 0.5), (WX + 0.07, -1.45, 1.55), K.mat_color("frm", "#4A3220"))
    K.box("pic", (0.02, 0.6, 0.4), (WX + 0.09, -1.45, 1.55), K.mat_image("pic", K.tex_sky("pics", 32, 32, "#F0A040", "#F8E0A0"), emit_only=True))
    K.box("bowl", (0.22, 0.22, 0.08), (0.75, -1.9, 0.04), K.mat_color("bowl", "#C83A3A"))
    K.box("toy", (0.06, 0.24, 0.05), (0.55, 1.6, 0.025), K.mat_color("toy", "#F2EEDC"))
    return sc


def scene_dog(with_shadow=True):
    o, arm, fn = D.build()
    mover = bpy.data.objects.new("mover", None); K.link(mover); arm.parent = mover
    if with_shadow:
        D.blob_shadow(mover)
    return o, arm, fn, mover


def view(cam, pos, target, lens):
    cam.data.lens = lens; K.look(cam, pos, target); K.ps1_snap_update(cam)


if MODE == "check":
    sc = studio()
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(OUT, "check"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 540, 960
    c = Vector((0, -0.05, 0.36))
    views = {"front": (0, -3.2, 0.5), "side": (3.2, -0.05, 0.4), "q34": (2.2, -2.3, 0.9), "back": (-1.6, 2.8, 0.8),
             "top": (0.01, -0.05, 3.4), "low": (1.8, -1.6, 0.06)}
    for k, p in views.items():
        view(cam, p, c, 50); render(os.path.join(d, f"{k}.png"))
    for e in D.EXPRS:
        D.set_face(fn, e); view(cam, (0.35, -1.3, 0.68), (0, -0.33, 0.62), 50); render(os.path.join(d, f"face_{e}.png"))
    D.set_face(fn, "neutral")
    # walk frames (in place) side + 3/4
    D.make_walk_action(arm, 2, start=0)
    for f in range(0, D.WALK_T + 1, 1):
        sc.frame_set(f)
        view(cam, (2.6, -0.4, 0.45), Vector((0, -0.05, 0.33)), 50); render(os.path.join(d, f"walk_side_{f:02d}.png"))
    for f in (0, 6, 12, 18):
        sc.frame_set(f); view(cam, (1.9, -2.0, 0.7), c, 50); render(os.path.join(d, f"walk_q34_{f:02d}.png"))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "dog.blend"))

elif MODE == "blend":
    # the approved dog, ready to append into new shorts: mesh + rig + 'walk' action (NLA) + 5 face images packed
    K.reset("#9AA0A8")
    o, arm, fn = D.build()
    for e in D.EXPRS:
        D.face_image(e).use_fake_user = True
    D.make_walk_action(arm, 1, start=0)
    arm.animation_data.nla_tracks["walk"].mute = True       # rest pose by default; unmute or reuse the action
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(H, "zaw_dog.blend"))

elif MODE == "head":
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 60); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(OUT, "head"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1080
    hc = Vector((0, -0.32, 0.60))
    for k, p in {"side": (1.4, -0.32, 0.62), "q34": (1.0, -1.25, 0.70), "q34b": (1.0, 0.45, 0.80), "front": (0.0, -1.5, 0.64),
                 "back": (0.0, 0.9, 0.85), "chest": (0.0, -1.6, 0.42)}.items():
        view(cam, p, hc if k != "chest" else Vector((0, -0.2, 0.40)), 60); render(os.path.join(d, f"{k}.png"))
    D.rest(arm); D.expr_pose(arm, "judging", 0.1); D.set_face(fn, "judging"); bpy.context.view_layer.update()
    view(cam, (0.0, -1.5, 0.66), hc, 50); render(os.path.join(d, "judging_front.png"))

elif MODE == "expr":
    sc = studio("#F3D9A8")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(OUT, "expr"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1352
    for e in D.EXPRS:
        D.rest(arm); D.expr_pose(arm, e, 0.1)
        D.set_face(fn, e); bpy.context.view_layer.update()
        view(cam, (0.80, -1.18, 0.70), (0.0, -0.18, 0.44), 40); render(os.path.join(d, f"{e}.png"))

elif MODE == "turn":
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 40); K.ps1_snap(cam, grid_h=240)
    view(cam, (0, -2.25, 0.72), (0, 0, 0.40), 40)
    d = os.path.join(OUT, "frames_turn"); os.makedirs(d, exist_ok=True)
    N = 180
    for f in range(N):
        t = f / 30
        mover.rotation_euler = (0, 0, 2 * math.pi * f / N)
        D.rest(arm)
        i = min(int(t / 1.2), 4); e = D.EXPRS[i]
        D.set_face(fn, e)
        D.expr_pose(arm, e, t, prev=D.EXPRS[i - 1] if i else None, a=(t - 1.2 * i) / 0.25)
        D.move(arm, "hips", (0, 0, 0.006 * math.sin(1.6 * math.pi * t)))
        D.rot(arm, "chest", (1, 0, 0), 0.02 * math.sin(1.6 * math.pi * t))
        sc.frame_set(f); bpy.context.view_layer.update()
        render(os.path.join(d, f"{f:05d}.png"))

elif MODE == "walk":
    sc = living_room()
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 30); K.ps1_snap(cam, grid_h=240)
    D.set_face(fn, "happy")
    N = 180
    D.make_walk_action(arm, math.ceil(N / D.WALK_T) + 1, start=0)
    y0 = 1.3
    d = os.path.join(OUT, "frames_walk"); os.makedirs(d, exist_ok=True)
    for f in range(N):
        sc.frame_set(f)
        yd = y0 - D.WALK_SPEED * f
        mover.location = (0, yd, 0)
        cy = yd - 0.25 - 0.1 * f / N
        view(cam, (1.25, cy - 0.68, 0.60), (0, cy + 0.08, 0.60), 30)   # level camera: wall, not rug   # closer: the dog fills ~3/4 of the width
        bpy.context.view_layer.update()
        render(os.path.join(d, f"{f:05d}.png"))

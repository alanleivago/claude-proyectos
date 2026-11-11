"""Pup Poly Shorts branding plates (Blender, headless). Builds the approved zaw-dog-02 sets + the v2 dog by running
pieces/zaw-dog-02/build.py as a module (mode "none": scene only), dresses the living room for the banner and renders:
  /Applications/Blender.app/Contents/MacOS/Blender -b -P scene.py -- banner   -> renders/banner_raw.png  (2560x1440)
                                                                 -- avatar   -> renders/avatar_raw.png  (1600x1600)
                                                                 -- check    -> review/side_*.png (feet / floating check)
post.py adds the PS1 dither and the type."""
import math
import os
import runpy
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["banner"]
MODE = ARGS[0]
sys.argv = [sys.argv[0], "--", "none"]                       # build.py: build the sets, render nothing
G = runpy.run_path(os.path.join(ROOT, "pieces", "zaw-dog-02", "build.py"), run_name="zd02")
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
K, D = G["K"], G["D"]
sc = G["sc"]; box, mcol, mtex, frame_pic, card = G["box"], G["mcol"], G["mtex"], G["frame_pic"], G["card"]
dog, dog_sit, cam, reset = G["dog"], G["dog_sit"], G["cam"], G["reset"]
LY1 = G["LY1"]
os.makedirs(os.path.join(H, "renders"), exist_ok=True); os.makedirs(os.path.join(H, "review"), exist_ok=True)


def mark_tag():
    """the Zaw-style marker scribble "Pup Poly Shorts" (tex/tag.png from post.py tag) on the left wall."""
    p = os.path.join(H, "tex", "tag.png")
    im = bpy.data.images.load(p, check_existing=True); im.pack()
    m = K.mat_image("m_tag", im, alpha=True)
    w = 0.62; h_ = w * im.size[1] / im.size[0]
    return K.plane("pup_tag", w, h_, (G["LX0"] + 0.012, 0.1, 1.05), rot=(math.pi / 2, 0, math.pi / 2), mat=m)   # left wall, under the Mona Lisa beagle


def dress_living_room():
    # more funny dog art on the walls the banner camera sees (window wall, both side walls)
    frame_pic("b_pic5", "pic_meme3", 0.46, (1.55, LY1 - 0.02, 1.78), 0.0)           # Napoleon dog, right of the window
    frame_pic("b_pic6", "pic_lab2", 0.34, (-1.15, LY1 - 0.02, 2.02), 0.0)           # graduate dachshund over the lake
    frame_pic("b_pic7", "pic_meme4", 0.4, (-2.6 + 0.03, -0.35, 1.55), math.pi / 2)       # left wall, dog in the car window
    # move the floor lamp to the right-hand corner so it does not cover the new pictures
    for n in ("lamp_base", "lamp_pole", "floor_lamp"):
        o = bpy.data.objects.get(n)
        if o:
            o.location.x += 0.75; o.location.y -= 0.05
    # a ball and the rope bone on the rug in front of the dog
    for n in ("tv_cab", "tv"):                              # the camera stands where the TV was
        G["hide"](bpy.data.objects[n], True)
    G["BALL"].location = (0.55, -0.45, 0.0)
    # floor props that give the foreground depth: dog bed front-left, food bowl + rope bone + a chewed sneaker
    for n, dx, dy, rz in (("dogbed", -3.5, 1.15, 0.3), ("dogbed_c", -3.5, 1.15, 0.3)):
        o = bpy.data.objects[n]; o.location.x += dx; o.location.y += dy; o.rotation_euler.z = rz
    PP = G["PP"]; T = G["T"]
    PP.loft(os.path.join(T, "src", "dog_bowl.png"), "b_bowl", height=0.08, sides=10, loc=(1.85, -0.25, 0))
    bone = bpy.data.objects["toy_bone"]; bone.location = (0.25, -1.15, 0.004); bone.rotation_euler = (0, 0, 0.4)
    card("b_shoe", "sneakers_grey", 0.13, (-0.95, -0.85, 0), yaw=0.6)
    G["hide"](G["BALL"], False)


def side_check(tag, target):
    """two low side views to see the paws on the floor (nothing floats) + the lowest dog vertex (floor = 0)."""
    bpy.context.view_layer.update()
    lo = G["dog_low"](bpy.context.evaluated_depsgraph_get())[:, 2].min()
    open(os.path.join(H, "review", f"feet_{tag}.txt"), "w").write(f"{tag}: lowest dog vertex z = {lo:+.4f} m\n")
    print(f"FEET {tag}: lowest dog vertex z = {lo:+.4f} m")
    for k, (dx, dy) in enumerate(((-2.0, 0.0), (0.0, -2.2))):
        cam((target[0] + dx, target[1] + dy, 0.35), (target[0], target[1], 0.3), 30)
        G["render"](os.path.join(H, "review", f"side_{tag}_{k}.png"), (480, 360))


def dog_bbox(tag, W, Hh):
    """pixel bbox of the posed dog in the current camera (x0, y0, x1, y1), written to review/dog_bbox_<tag>.txt."""
    from bpy_extras.object_utils import world_to_camera_view
    sc.render.resolution_x, sc.render.resolution_y = W, Hh
    bpy.context.view_layer.update(); K.ps1_snap_update(G["CAM"])
    P = G["dog_low"](bpy.context.evaluated_depsgraph_get())
    uv = [world_to_camera_view(sc, G["CAM"], Vector(p)) for p in P]
    xs = [u.x * W for u in uv]; ys = [(1 - u.y) * Hh for u in uv]
    b = (round(min(xs)), round(min(ys)), round(max(xs)), round(max(ys)))
    open(os.path.join(H, "review", f"dog_bbox_{tag}.txt"), "w").write(f"{tag} dog bbox px (x0,y0,x1,y1) = {b}, height {b[3]-b[1]} px\n")
    print("BBOX", tag, b, b[3] - b[1])
    return b


BANNER_DOG = (1.0, 0.05, 0)                                  # 2.55 m from the lens: ~400 px tall inside the 423 px strip
BANNER_CAM = ((0.0, -2.5, 0.42), (0.0, 2.0, 0.42), 28)       # level at the dog's mid-height: the strip is centred on it


def pose_banner():
    reset(); dress_living_room()
    d_at = BANNER_DOG
    dd = dog(0, d_at, -1.0, "happy", 0.06)                   # side-on, tongue out, tail mid-wag
    D.rot2(dd["arm"], "neck", [((1, 0, 0), -0.04), ((0, 0, 1), 0.3)])
    D.rot2(dd["arm"], "head", [((1, 0, 0), -0.02), ((0, 0, 1), 0.35), ((0, 1, 0), 0.22)])    # head turned to us + cute tilt
    return d_at


AV_YAW = -0.25
AV_LOW, AV_TZ, AV_RX, AV_TX = 0.3, -0.05, 0.05, 0.1       # camera drop under the head, aim height, side offsets


def pose_avatar():
    reset()
    d_at = (0.6, 3.6, 0)                                     # front lawn, the street and the houses behind
    dd = dog(0, d_at, AV_YAW, "happy", 0.05)                 # standing (the validated pose): no sit, so the neck is not stretched
    arm = dd["arm"]
    G["hide"](bpy.data.objects["pole"], True)                 # the street pole would stand behind the head
    D.rot2(arm, "head", [((1, 0, 0), -0.02), ((0, 0, 1), 0.48), ((0, 1, 0), 0.08)])    # turn to the lens, light tilt
    D.rot(arm, "jaw", (1, 0, 0), 0.06)                        # mouth just open
    tg = arm.pose.bones["tongue"]; tg.scale = (1.0, 1.0, 1.0); tg.location = (0.0, 0.008, 0.0)   # tongue tip only, inside the mouth
    D.rot(arm, "tongue", (1, 0, 0), 0.08)
    return d_at


bpy.context.view_layer.update()
if MODE in ("banner", "check_banner"):
    mark_tag()
    d_at = pose_banner()
    if MODE == "check_banner":
        side_check("banner", d_at)
    else:
        cam(*BANNER_CAM)
        dog_bbox("banner", 2560, 1440)
        G["render"](os.path.join(H, "renders", "banner_raw.png"), (2560, 1440))
elif MODE in ("avatar", "check_avatar"):
    d_at = pose_avatar()
    if MODE == "check_avatar":
        side_check("avatar", d_at)
    else:
        bpy.context.view_layer.update()
        hp = G["dog_head"](0)
        a_ = AV_YAW + 1.0                                   # 3/4 front: the approved happy face reads best off-axis
        fx, fy = math.sin(a_), -math.cos(a_)
        rx, ry = math.cos(a_), math.sin(a_)                  # camera right
        cam((hp.x + 1.15 * fx + AV_RX * rx, hp.y + 1.15 * fy + AV_RX * ry, hp.z - AV_LOW),   # low, looking up: sky behind the head
            (hp.x + AV_TX * rx, hp.y + AV_TX * ry, hp.z + AV_TZ), 70)
        # sky backdrop: the cloud photo on a plane 8 m behind the dog, square to the lens (no houses, no poles)
        cm = G["CAM"]; bpy.context.view_layer.update()
        look = cm.matrix_world.to_3x3() @ Vector((0, 0, -1))
        sk = bpy.data.images.load(os.path.join(H, "tex", "sky_avatar.png")); sk.pack()          # bluest part of the set's sky photo
        bd = K.plane("av_sky", 6.4 * 130 / 114, 6.4, (0, 0, 0), rot=(0, 0, 0), mat=K.mat_image("m_av_sky", sk, emit_only=True))
        up = cm.matrix_world.to_3x3() @ Vector((0, 1, 0))
        bd.location = cm.location + look * 9.0 + up * 0.0; bd.rotation_euler = cm.rotation_euler   # a blue gap behind the head
        if bd.modifiers.get("ps1"):
            bd.modifiers.remove(bd.modifiers["ps1"])
        dog_bbox("avatar", 1600, 1600)
        G["render"](os.path.join(H, "renders", "avatar_raw.png"), (1600, 1600))

"""Blender: the TV's sad movie (line 2) - a crude low-poly cartoon dog on a station platform waving goodbye at a
departing train, rendered in-house to tex/tv_insert.png (256x144, the TV screen image).
/Applications/Blender.app/Contents/MacOS/Blender -b -P tools/tv_insert.py"""
import math, os, sys
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
sys.path[:0] = [os.path.join(H, "..", "lps-onoda")]
import bpy  # noqa: E402
import lpskit as K  # noqa: E402
sc = K.reset("#9CC8F0"); sc.eevee.taa_render_samples = 4
c = lambda n, h: K.mat_color(n, h)
K.box("ground", (30, 12, 0.1), (0, 2, -0.05), c("g", "#5FA04A"))
K.box("platform", (8, 1.6, 0.4), (0, -1.0, 0.2), c("p", "#B8B0A0"))
K.box("edge", (8, 0.12, 0.05), (0, -0.25, 0.42), c("e", "#F2D23C"))
for i in range(2):
    K.box(f"rail{i}", (30, 0.06, 0.06), (0, 0.6 + 0.6 * i, 0.03), c("r", "#555555"))
for k in range(4):                                          # the train pulling away to the right (+X)
    x = 1.2 + 2.3 * k
    K.box(f"car{k}", (2.1, 1.0, 1.1), (x, 0.9, 0.85), c(f"cr{k}", "#C8302A" if k == 0 else "#2E5E9A"))
    K.box(f"roof{k}", (2.2, 1.05, 0.1), (x, 0.9, 1.45), c("rf", "#3A3A3A"))
    for j in range(3):
        K.box(f"win{k}{j}", (0.4, 0.02, 0.3), (x - 0.6 + 0.6 * j, 0.39, 1.0), K.mat_color("wn", "#FFF2B0", emit_only=True))
    for j in (-0.6, 0.6):
        K.box(f"wh{k}{j}", (0.36, 1.04, 0.36), (x + j, 0.9, 0.22), c("wh", "#1E1E1E"))
K.box("smoke", (0.5, 0.5, 0.5), (0.4, 0.9, 2.0), c("sm", "#E8E8E8")); K.box("smoke2", (0.7, 0.6, 0.6), (0.0, 0.9, 2.5), c("sm2", "#F4F4F4"))
B = c("dog", "#B5793E"); W = c("dw", "#F2E6D2")             # the cartoon dog: boxes, big head, one paw waving
dx = -1.6
K.box("d_body", (0.7, 0.35, 0.35), (dx, -1.0, 0.75), B)
for sx in (-0.25, 0.25):
    K.box(f"d_leg{sx}", (0.1, 0.1, 0.32), (dx + sx, -1.0, 0.56), B)
K.box("d_head", (0.42, 0.4, 0.4), (dx + 0.42, -1.0, 1.08), B)
K.box("d_snout", (0.2, 0.22, 0.16), (dx + 0.66, -1.0, 1.02), W)
K.box("d_nose", (0.06, 0.08, 0.06), (dx + 0.77, -1.0, 1.07), c("n", "#141414"))
K.box("d_ear", (0.1, 0.06, 0.28), (dx + 0.32, -1.18, 1.18), c("de", "#6E4424"))
K.box("d_eye", (0.06, 0.02, 0.06), (dx + 0.52, -1.21, 1.15), c("ey", "#141414"))
K.box("d_tear", (0.04, 0.02, 0.12), (dx + 0.52, -1.22, 1.03), K.mat_color("tr", "#5AB4FF", emit_only=True))
paw = K.box("d_paw", (0.09, 0.09, 0.42), (dx + 0.3, -1.0, 1.1), B); paw.rotation_euler = (0, math.radians(-35), 0)
K.box("d_tail", (0.3, 0.06, 0.06), (dx - 0.45, -1.0, 0.8), B).rotation_euler = (0, math.radians(30), 0)
K.box("sign", (1.2, 0.05, 0.4), (-3.0, -0.5, 1.9), c("sg", "#1E3A6A")); K.box("post", (0.08, 0.08, 1.5), (-3.0, -0.5, 1.0), c("ps", "#333333"))
for i, (x, h) in enumerate(((-9, 3), (-6, 4), (7, 3.5), (10, 4.5))):
    K.box(f"hill{i}", (5, 2, h), (x, 7, h / 2 - 1), c(f"hl{i}", "#4E8A3E"))
cam = K.camera("Cam", 28); K.look(cam, (-0.6, -4.0, 1.35), (0.0, 0, 1.0))
sc.render.resolution_x, sc.render.resolution_y = 256, 144
sc.render.filepath = os.path.join(H, "tex", "tv_insert.png"); bpy.ops.render.render(write_still=True)

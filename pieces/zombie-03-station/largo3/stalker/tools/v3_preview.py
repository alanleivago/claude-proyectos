# blender -b <blend> -P tools/v3_preview.py -- <stalker_dir> <name> [textured]
# como zombie-girl/model/preview.py: render ortogonal frente/perfil/espalda a la escala exacta de la hoja -> v3/<name>_{front,side,back}.png
# y la hoja con el contorno rojo de la malla encima -> v3/<name>_cmp.png (como cmp.py)
import bpy, sys, math, json
import numpy as np
a = sys.argv[sys.argv.index("--") + 1:]; D, name = a[0], a[1]; textured = "textured" in a
P = json.load(open(f"{D}/v3/profiles.json")); S, CF, CS, CB, SOLE = P["S"], P["CF"], P["CS"], P["CB"], P["SOLE"]
sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sh = sc.display.shading
sh.light = "FLAT" if textured else "STUDIO"; sh.color_type = "TEXTURE" if textured else "SINGLE"; sh.single_color = (0.75, 0.75, 0.75)
sh.show_backface_culling = False; sh.background_type = "VIEWPORT"; sh.background_color = (0, 0, 0)
sc.view_settings.view_transform = "Standard"; sc.render.film_transparent = True
cam = bpy.data.cameras.new("c"); cam.type = "ORTHO"; cam.ortho_scale = 768 * S
co = bpy.data.objects.new("cam", cam); sc.collection.objects.link(co); sc.camera = co
zc = (SOLE - 384) * S
VIEWS = {"front": (P["F"], ((CF - CF) * S, -6, zc), 0, lambda c: ((c - CF) * S)), "side": (P["SIDE"], (6, 0, zc), 90, None), "back": (P["B"], (0, 6, zc), 180, None)}
for v, (rng, loc, rz, _) in VIEWS.items():
    w = rng[1] - rng[0] + 41; mid = (rng[0] + rng[1]) / 2
    sc.render.resolution_x, sc.render.resolution_y = int(w), 768
    if v == "front": co.location = ((mid - CF) * S, -6, zc)
    if v == "side": co.location = (6, (mid - CS) * S, zc)
    if v == "back": co.location = (-(mid - CB) * S, 6, zc)
    co.rotation_euler = (math.radians(90), 0, math.radians(rz))
    sc.render.filepath = f"{D}/v3/{name}_{v}.png"; bpy.ops.render.render(write_still=True)
print("DONE")

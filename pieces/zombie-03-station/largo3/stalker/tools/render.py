# blender -b -P tools/render.py -- <stalker_dir>
# Stills PS1 del GLB final (texturas nearest, baja resolucion; compose.py los escala sin filtrar): renders/s_*.png
import bpy, sys, math
from mathutils import Vector
D = sys.argv[sys.argv.index("--") + 1:][0]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=f"{D}/stalker_ps1.glb")
for m in bpy.data.materials:
    if m.node_tree:
        for n in m.node_tree.nodes:
            if n.type == "TEX_IMAGE": n.interpolation = "Closest"
for eng in ("BLENDER_EEVEE", "BLENDER_EEVEE_NEXT"):
    try: sc.render.engine = eng; break
    except TypeError: pass
sc.render.resolution_x, sc.render.resolution_y = 240, 426; sc.render.film_transparent = True
sc.render.filter_size = 0.01; sc.view_settings.view_transform = "Standard"
w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
bg = next(n for n in w.node_tree.nodes if n.type == "BACKGROUND"); bg.inputs[0].default_value = (0.42, 0.42, 0.43, 1); bg.inputs[1].default_value = 0.1
def light(t, loc, rot, e, col=(1, 1, 1), size=None):
    ld = bpy.data.lights.new(t, t); ld.energy = e; ld.color = col
    if size: ld.shape = "DISK"; ld.size = size
    o = bpy.data.objects.new(t, ld); sc.collection.objects.link(o); o.location = loc; o.rotation_euler = [math.radians(r) for r in rot]; return o
light("SUN", (0, 0, 10), (55, 0, -75), 6.5, (1.0, 0.72, 0.45))          # v2: luz calida lateral (como en el juego)
light("SUN", (0, 0, 10), (-110, 0, 120), 1.4, (0.55, 0.6, 0.8))      # contraluz frio
light("SUN", (0, 0, 10), (70, 0, 35), 1.3, (0.75, 0.78, 0.9))      # v3: relleno suave del otro lado (se lee el frente)
gp = sc.objects.get("green");
def cam(name, loc, look, lens):
    cd = bpy.data.cameras.new(name); cd.lens = lens; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 24; o = bpy.data.objects.new(name, cd); sc.collection.objects.link(o); o.location = loc
    d = Vector(look) - Vector(loc); o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); return o
SHOTS = [("s1_front_low", (0.0, -4.4, 0.45), (0, 0, 1.35), 22), ("s2_34", (2.8, -3.3, 1.0), (0, 0, 1.3), 24),
         ("s3_head", (-0.22, -1.25, 2.30), (0, -0.07, 2.40), 45), ("s4_bust_low", (0.3, -1.9, 1.3), (0, 0, 1.95), 18)]
for n, loc, look, lens in SHOTS:
    sc.camera = cam(n, loc, look, lens); sc.render.filepath = f"{D}/renders/{n}.png"; bpy.ops.render.render(write_still=True)

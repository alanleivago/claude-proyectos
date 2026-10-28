# Render gris facetado frente/perfil/espalda a la escala de la hoja -> out/<name>_{front,side,back}.png
# blender -b out/heroine_mesh.blend --python preview.py -- <name> [textured]
import bpy, sys, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
name = args[0] if args else 'mesh'
textured = 'textured' in args
sc = bpy.context.scene
sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading
sh.light = 'FLAT' if textured else 'STUDIO'
sh.color_type = 'TEXTURE' if textured else 'SINGLE'
sh.single_color = (0.75, 0.75, 0.75)
sh.show_object_outline = False
sh.show_backface_culling = False
sc.render.resolution_x, sc.render.resolution_y = 560, 675     # mismo recorte que ref/front.png
sc.render.image_settings.media_type = 'IMAGE'
sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'Standard'
w = bpy.data.worlds.new('w'); w.color = (0.533, 0.533, 0.533); sc.world = w
sc.display.shading.background_type = 'WORLD'
S = 1.70 / 655
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 675 * S
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
zc = (717 - (50 + 675 / 2)) * S
views = {'front': ((0, -5, zc), 0), 'side': ((5, 0, zc), 90), 'back': ((0, 5, zc), 180)}
for v, (loc, rz) in views.items():
    co.location = loc
    co.rotation_euler = (math.radians(90), 0, math.radians(rz))
    sc.render.filepath = os.path.join(HERE, 'out', f'{name}_{v}.png')
    bpy.ops.render.render(write_still=True)

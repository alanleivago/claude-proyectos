# malla gris facetada en 5 angulos -> out/turn_<name>.png (tira)
import bpy, sys, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index('--') + 1:]
name = args[0]; textured = 'textured' in args
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading; sh.light = 'FLAT' if textured else 'STUDIO'
sh.color_type = 'TEXTURE' if textured else 'SINGLE'; sh.single_color = (0.72, 0.72, 0.72)
sh.show_backface_culling = False; sh.background_type = 'VIEWPORT'; sh.background_color = (0.08, 0.08, 0.09)
sc.render.resolution_x, sc.render.resolution_y = 420, 760
sc.render.image_settings.media_type = 'IMAGE'; sc.render.image_settings.file_format = 'PNG'
sc.view_settings.view_transform = 'Standard'
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 1.85
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
paths = []
for i, ang in enumerate([0, 35, 90, 145, 180]):
    a = math.radians(ang); co.location = (5 * math.sin(a), -5 * math.cos(a), 0.86)
    co.rotation_euler = (math.radians(90), 0, a)
    p = os.path.join(HERE, 'out', f'_t{i}.png'); sc.render.filepath = p; bpy.ops.render.render(write_still=True); paths.append(p)
print('DONE')

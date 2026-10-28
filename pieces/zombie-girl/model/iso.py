import bpy, sys, math, os
keep = sys.argv[sys.argv.index('--') + 1]
for o in bpy.data.objects:
    if o.type == 'MESH' and o.name != keep: o.hide_render = True
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading; sh.light = 'FLAT'; sh.color_type = 'TEXTURE'; sh.show_backface_culling = False
sh.background_type = 'VIEWPORT'; sh.background_color = (0.1, 0.1, 0.12)
sc.render.resolution_x, sc.render.resolution_y = 400, 400
sc.render.image_settings.media_type = 'IMAGE'; sc.render.image_settings.file_format = 'PNG'; sc.view_settings.view_transform = 'Standard'
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 0.5
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
for i, ang in enumerate([0, 35, 90]):
    a = math.radians(ang); co.location = (5 * math.sin(a), -5 * math.cos(a), 1.45); co.rotation_euler = (math.radians(90), 0, a)
    sc.render.filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', f'_iso_{keep}_{i}.png'); bpy.ops.render.render(write_still=True)

import bpy, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
act, f = sys.argv[sys.argv.index('--') + 1], int(sys.argv[-1])
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading; sh.light = 'FLAT'; sh.color_type = 'TEXTURE'; sh.show_backface_culling = False
sh.background_type = 'VIEWPORT'; sh.background_color = (0.09, 0.09, 0.1)
sc.render.resolution_x, sc.render.resolution_y = 300, 420
sc.render.image_settings.media_type = 'IMAGE'; sc.render.image_settings.file_format = 'PNG'; sc.view_settings.view_transform = 'Standard'
arm = bpy.data.objects['Armature']; ad = arm.animation_data
for t in ad.nla_tracks: t.mute = True
ad.action = bpy.data.actions[act]; sc.frame_set(f)
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 16
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
for i, ang in enumerate([0, 90, 30]):
    a = math.radians(ang); co.location = (40 * math.sin(a), -40 * math.cos(a), -2.2); co.rotation_euler = (math.radians(90), 0, a)
    sc.render.filepath = os.path.join(HERE, f'_v{i}.png'); bpy.ops.render.render(write_still=True)

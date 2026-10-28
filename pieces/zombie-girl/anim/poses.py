# hoja de poses: una key por accion, vista 3/4, textura plana -> poses.png (via _p*.png)
import bpy, math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SEL = [('idle', 25), ('walk', 8), ('point', 20), ('talk_gesture', 10), ('surprised', 14), ('think', 25),
       ('push_door', 8), ('lift_bar', 15), ('peek', 11), ('push_heavy', 11), ('shrug', 18), ('hands_on_hips', 20),
       ('turn_key', 14), ('squat', 30), ('kneel', 40), ('sick', 20)]
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'
sh = sc.display.shading; sh.light = 'FLAT'; sh.color_type = 'TEXTURE'; sh.show_backface_culling = False
sh.background_type = 'VIEWPORT'; sh.background_color = (0.09, 0.09, 0.1)
sc.render.resolution_x, sc.render.resolution_y = 300, 420
sc.render.image_settings.media_type = 'IMAGE'; sc.render.image_settings.file_format = 'PNG'; sc.view_settings.view_transform = 'Standard'
arm = bpy.data.objects['Armature']
ad = arm.animation_data
for t in ad.nla_tracks: t.mute = True
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 16
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
a = math.radians(30); co.location = (40 * math.sin(a), -40 * math.cos(a), -2.2); co.rotation_euler = (math.radians(90), 0, a)
for i, (n, f) in enumerate(SEL):
    ad.action = bpy.data.actions[n]; sc.frame_set(f)
    sc.render.filepath = os.path.join(HERE, f'_p{i:02d}.png'); bpy.ops.render.render(write_still=True)
print('POSES', len(SEL))

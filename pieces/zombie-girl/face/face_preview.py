# Primeros planos de la cara con combinaciones de celdas (ojos, boca) -> _f*.png
import bpy, os, math
HERE = os.path.dirname(os.path.abspath(__file__))
COMBOS = [(0, 0), (2, 0), (1, 3), (0, 4), (4, 5), (5, 7), (6, 6), (3, 2), (9, 11), (7, 1), (11, 10), (12, 12)]
sc = bpy.context.scene
try: sc.render.engine = 'BLENDER_EEVEE'
except TypeError: sc.render.engine = 'BLENDER_EEVEE_NEXT'
sc.view_settings.view_transform = 'Standard'
sc.render.resolution_x, sc.render.resolution_y = 240, 240
sc.render.image_settings.media_type = 'IMAGE'; sc.render.image_settings.file_format = 'PNG'
w = bpy.data.worlds.new('w'); w.color = (0.05, 0.05, 0.06); sc.world = w
maps = {}
for name in ('face_eyes', 'face_mouth'):
    nt = bpy.data.materials[name].node_tree
    ti = next(n for n in nt.nodes if n.type == 'TEX_IMAGE')
    tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping')
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector']); nt.links.new(mp.outputs['Vector'], ti.inputs['Vector'])
    maps[name] = mp
cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = 0.32
co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
co.location = (0.0, -3, 1.55); co.rotation_euler = (math.radians(90), 0, 0)
for i, (e, m) in enumerate(COMBOS):
    maps['face_eyes'].inputs['Location'].default_value[0] = e / 16
    maps['face_mouth'].inputs['Location'].default_value[0] = m / 16
    sc.render.filepath = os.path.join(HERE, f'_f{i:02d}.png'); bpy.ops.render.render(write_still=True)
print('FACES', len(COMBOS))

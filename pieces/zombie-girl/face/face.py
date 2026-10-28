# Expresiones de la heroina (parte 2, Blender): re-proyecta Head con cada hoja de variants/ (face_sheets.py) y arma
# los atlas face_eyes / face_mouth de 16 celdas (mismo orden que zero-fem: material.map.offset.x = celda/16).
# blender -b ../model/out/heroine_tex.blend --python face.py  -> ../model/out/heroine_face.blend
import bpy, os, runpy, numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
MODEL = os.path.join(HERE, '..', 'model')
T = runpy.run_path(os.path.join(MODEL, 'texture.py'), run_name='lib')
G = T['bake'].__globals__
EYES = ['open', 'half', 'blink', 'happy', 'surprised', 'angry', 'sad', 'wink', 'hearts', 'shocked',
        'dizzy', 'relaxed', 'disgust', 'free13', 'free14', 'free15']
MOUTH = ['neutral', 'smile', 'smileOpen', 'talkA', 'talkO', 'surprised', 'frown', 'shout', 'blep', 'cat',
         'gasp', 'bigShock', 'disgust', 'free13', 'free14', 'free15']

def load(path):
    im = bpy.data.images.load(path); w, h = im.size
    a = np.array(im.pixels[:], np.float32).reshape(h, w, 4)[::-1, :, :3]
    bpy.data.images.remove(im); return a

head = bpy.data.objects['Head']
R = T['SIZES']['Head']
def bake_with(arr):
    G['sheet'] = arr
    T['bake'](head, R)
    return np.array(bpy.data.images[head.name + '_tex'].pixels[:] if False else load(os.path.join(MODEL, 'out', 'tex', 'Head.png')))

def atlas(kind, names):
    cells = [bake_with(load(os.path.join(HERE, 'variants', f'{kind}_{n}.png'))) for n in names]
    A = np.concatenate(cells, 1)[::-1]
    h, w = A.shape[:2]
    im = bpy.data.images.new(f'face_{kind}', w, h)
    im.pixels[:] = np.concatenate([A, np.ones((h, w, 1), np.float32)], 2).ravel()
    path = os.path.join(HERE, f'face_{kind}.png'); im.filepath_raw = path; im.file_format = 'PNG'; im.save()
    return path

pe = atlas('eyes', EYES)
pm = atlas('mouth', MOUTH)
base = bake_with(load(os.path.join(HERE, '..', 'ref', 'sheet3.jpg')))   # deja Head.png y su material como antes
# polígonos de ojos y boca -> materiales con atlas; UV x/16 (celda 0)
K = 1.70 / 655
def zf(y): return (717 - y) * K
me = head.data
def mat(name, path):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    im = bpy.data.images.load(path); ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = im; ti.interpolation = 'Closest'
    em = nt.nodes.new('ShaderNodeEmission'); o = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(ti.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], o.inputs['Surface'])
    me.materials.append(m); return len(me.materials) - 1
ie, im_ = mat('face_eyes', pe), mat('face_mouth', pm)
uv = me.uv_layers.active.data
n_e = n_m = 0
for p in me.polygons:
    c = p.center; nrm = p.normal
    if nrm.y > -0.3 or abs(c.x) > 0.095: continue
    if zf(150) < c.z < zf(112): p.material_index = ie; n_e += 1
    elif zf(178) < c.z <= zf(150): p.material_index = im_; n_m += 1
    else: continue
    for li in p.loop_indices: uv[li].uv.x /= 16
print('FACE polys eyes', n_e, 'mouth', n_m)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(MODEL, 'out', 'heroine_face.blend'))

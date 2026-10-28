# Proyecta la hoja 3 sobre la malla (equivalente por script del stencil del tutorial) y hornea texturas PS1
# blender -b out/heroine_mesh.blend --python texture.py  -> out/tex/*.png + out/heroine_tex.blend
import bpy, bmesh, os, numpy as np
from math import isfinite

HERE = os.path.dirname(os.path.abspath(__file__))
TEX = os.path.join(HERE, 'out', 'tex'); os.makedirs(TEX, exist_ok=True)
S = 1.70 / 655; SOLE = 717
CF, CSD, CB = 291.5, 690, 1079.5            # centros: frente, perfil, espalda (px de la hoja)
SIZES = {'Body': 256, 'Head': 128, 'Hair': 128}
SS = 4                                      # supermuestreo

img = bpy.data.images.load(os.path.join(HERE, '..', 'ref', 'sheet3.jpg'))
W, H = img.size
sheet = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[::-1, :, :3]   # fila 0 = arriba
# la sombra gris bajo el borde de la camiseta (filas 279-285 de la hoja, frente) caia como una raya sobre la barriga: piel
for _x0, _x1 in ((262, 322), (1050, 1110)):
    sheet[279:286, _x0:_x1] = sheet[287:288, _x0:_x1]

def sample(px, py):
    px = np.clip(px, 0, W - 1.001); py = np.clip(py, 0, H - 1.001)
    x0 = px.astype(int); y0 = py.astype(int); fx = (px - x0)[:, None]; fy = (py - y0)[:, None]
    a = sheet[y0, x0]; b = sheet[y0, x0 + 1]; c = sheet[y0 + 1, x0]; d = sheet[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

def project(P, N, part):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    py = SOLE - z / S
    cf = sample(CF + x / S, py)
    cb = sample(CB - x / S, py)
    cs = sample(CSD + y / S, py)
    nx, ny, nz = N[:, 0], N[:, 1], N[:, 2]
    wf = np.clip(-ny, 0, 1) ** 4 + 0.6 * nz ** 4 * (y <= 0)
    wb = np.clip(ny, 0, 1) ** 4 + 0.6 * nz ** 4 * (y > 0)
    ws = np.abs(nx) ** 4
    arm = np.abs(x) > 0.165
    ws = np.where(arm, 0, ws)                                   # el perfil muestra el puno, no la manga
    wf = np.where(arm, wf + 0.5 * (y <= 0.0), wf); wb = np.where(arm, wb + 0.5 * (y > 0.0), wb)
    if part == 'Head':   # cara: solo la vista frontal (el perfil trae el ojo de lado con sus pestanas)
        face = (np.abs(x) < 0.095) & (y < 0) & (py > 108) & (py < 180)
        wf = np.where(face, wf + ws + 0.01, wf); ws = np.where(face, 0, ws)
    if part == 'Body':
        chest = (py > 196) & (py < 244) & (np.abs(x) < 0.17)
        wf = np.where(chest, wf + ws * (y <= 0.0), wf); wb = np.where(chest, wb + ws * (y > 0.0), wb)
        ws = np.where(chest, 0, ws)
    def fg(c):   # 0 si el color es el gris del fondo de la hoja
        sat = c.max(1) - c.min(1)
        return ~((np.abs(c - 0.533).max(1) < 0.10) & (sat < 0.06)) * 1.0
    gf, gb, gs = fg(cf), fg(cb), fg(cs)
    if part == 'Hair':   # solo color de pelo: amarillo saturado (r > g > b)
        def hairlike(c):
            r, g, b = c[:, 0], c[:, 1], c[:, 2]
            return ((b < 0.48 * r) & (g > 0.6 * r) & (r > 0.35)) * 1.0
        gf, gb, gs = gf * hairlike(cf), gb * hairlike(cb), gs * hairlike(cs)
    wf2, wb2, ws2 = wf * gf, wb * gb, ws * gs
    t = wf2 + wb2 + ws2
    weak = t < 0.02 * (wf + wb + ws + 1e-6)
    wf2 = np.where(weak, gf * 1e-3, wf2); wb2 = np.where(weak, gb * 1e-3, wb2); ws2 = np.where(weak, gs * 1e-3, ws2)
    t = wf2 + wb2 + ws2
    ok = t > 0
    t = np.where(ok, t, 1)
    return (cf * wf2[:, None] + cb * wb2[:, None] + cs * ws2[:, None]) / t[:, None], ok

def bake(ob, R):
    me = ob.data
    if not me.uv_layers:
        bpy.context.view_layer.objects.active = ob
        for o in bpy.context.scene.objects: o.select_set(o == ob)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.02)
        bpy.ops.object.mode_set(mode='OBJECT')
    me.calc_loop_triangles()
    uv = me.uv_layers.active.data
    RR = R * SS
    acc = np.zeros((RR, RR, 3), np.float32); cov = np.zeros((RR, RR), bool)
    V = np.array([ob.matrix_world @ v.co for v in me.vertices])
    for lt in me.loop_triangles:
        n = np.array(ob.matrix_world.to_3x3() @ lt.normal); n /= np.linalg.norm(n) + 1e-9
        T = np.array([uv[l].uv for l in lt.loops]) * RR
        X = V[list(lt.vertices)]
        x0, y0 = np.floor(T.min(0) - 1).astype(int); x1, y1 = np.ceil(T.max(0) + 1).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, RR - 1), min(y1, RR - 1)
        if x1 < x0 or y1 < y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
        p = np.stack([gx.ravel(), gy.ravel()], 1)
        a, b, c = T
        d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-12: continue
        l1 = ((b[1] - c[1]) * (p[:, 0] - c[0]) + (c[0] - b[0]) * (p[:, 1] - c[1])) / d
        l2 = ((c[1] - a[1]) * (p[:, 0] - c[0]) + (a[0] - c[0]) * (p[:, 1] - c[1])) / d
        l3 = 1 - l1 - l2
        e = -0.6 / max(1.0, np.abs(T.max(0) - T.min(0)).max())   # medio texel de margen
        m = (l1 >= e) & (l2 >= e) & (l3 >= e)
        if not m.any(): continue
        L = np.stack([l1[m], l2[m], l3[m]], 1)
        P = L @ X
        N = np.repeat(n[None], len(P), 0)
        col, ok = project(P, N, ob.name)
        ix = p[m, 0].astype(int)[ok]; iy = p[m, 1].astype(int)[ok]
        acc[iy, ix] = col[ok]; cov[iy, ix] = True
    # dilatar para que el filtrado no traiga el fondo a las costuras
    for _ in range(12 * SS):
        if cov.all(): break
        sh = [(1, 0), (-1, 0), (0, 1), (0, -1)]
        nacc = acc.copy(); ncov = cov.copy()
        for dy, dx in sh:
            c2 = np.roll(cov, (dy, dx), (0, 1)); a2 = np.roll(acc, (dy, dx), (0, 1))
            fill = c2 & ~ncov
            nacc[fill] = a2[fill]; ncov |= fill
        acc, cov = nacc, ncov
    out = acc.reshape(R, SS, R, SS, 3).mean((1, 3))          # 1024 -> 256 promediando
    im = bpy.data.images.new(ob.name + '_tex', R, R)
    px = np.concatenate([out, np.ones((R, R, 1), np.float32)], 2)
    im.pixels[:] = px.ravel()
    im.filepath_raw = os.path.join(TEX, ob.name + '.png'); im.file_format = 'PNG'; im.save()
    mat = bpy.data.materials.new(ob.name + '_mat'); mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    ti = nt.nodes.new('ShaderNodeTexImage'); ti.image = im; ti.interpolation = 'Closest'
    em = nt.nodes.new('ShaderNodeEmission'); outn = nt.nodes.new('ShaderNodeOutputMaterial')
    nt.links.new(ti.outputs['Color'], em.inputs['Color']); nt.links.new(em.outputs[0], outn.inputs['Surface'])
    me.materials.clear(); me.materials.append(mat)
    print('BAKED', ob.name, R, 'coverage', round(float(cov.mean()), 3))

if __name__ == '__main__':
    for name, R in SIZES.items(): bake(bpy.data.objects[name], R)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'out', 'heroine_tex.blend'))

# blender -b v3/mesh.blend -P tools/v3_texture.py -- <stalker_dir>  -> v3/tex/*.png (128 px, 32 colores) + v3/tex.blend
# Igual que zombie-girl/model/texture.py: proyecta la hoja (frente / perfil / espalda) sobre la malla segun la normal,
# hornea por triangulo en UV smart project con supermuestreo, dilata costuras y reduce a 32 colores (k-means).
import bpy, os, sys, json, numpy as np
D = sys.argv[sys.argv.index("--") + 1:][0]
P = json.load(open(f"{D}/v3/profiles.json")); S, CF, CS, CB, SOLE = P["S"], P["CF"], P["CS"], P["CB"], P["SOLE"]
TEX = f"{D}/v3/tex"; os.makedirs(TEX, exist_ok=True)
R, SS = 128, 4
img = bpy.data.images.load(f"{D}/v3/sheet.jpg"); W, H = img.size
sheet = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)[::-1, :, :3]
mask = np.load(f"{D}/v3/mask.npy")
def sample(px, py):
    px = np.clip(px, 0, W - 1.001); py = np.clip(py, 0, H - 1.001)
    x0 = px.astype(int); y0 = py.astype(int); fx = (px - x0)[:, None]; fy = (py - y0)[:, None]
    a = sheet[y0, x0]; b = sheet[y0, x0 + 1]; c = sheet[y0 + 1, x0]; d = sheet[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy, mask[y0, x0] * 1.0

def skin(c):   # piel rosa-violacea de la hoja (no el rojo vino de los tubos ni el amarillo)
    r, g, b = c[:, 0], c[:, 1], c[:, 2]
    return (r > 0.22) & (r > 1.07 * g) & (r < 1.9 * g) & (b > 0.62 * g) & (r > b * 0.98)
RUBBER = np.array([0.035, 0.03, 0.032], np.float32)
MUST = np.array([0.79, 0.60, 0.10], np.float32)
ZWR = (SOLE - 402) * S          # puno de la manga: arriba es tela, abajo mano
ZNECK = (SOLE - 128) * S
NECK = sample(np.array([CF, CF - 12, CF + 12]), np.array([72.0, 72.0, 72.0]))[0].mean(0)

def project(Pt, N, part):
    x, y, z = Pt[:, 0], Pt[:, 1], Pt[:, 2]; py = SOLE - z / S
    cf, gf = sample(CF + x / S, py); cb, gb = sample(CB - x / S, py); cs, gs = sample(CS + y / S, py)
    nx, ny, nz = N[:, 0], N[:, 1], N[:, 2]
    wf = np.clip(-ny, 0, 1) ** 4 + 0.6 * nz ** 4 * (y <= 0); wb = np.clip(ny, 0, 1) ** 4 + 0.6 * nz ** 4 * (y > 0); ws = np.abs(nx) ** 4
    if part == "Head":   # la cara solo desde el frente (el perfil trae la cara de lado)
        face = (y < -0.02) & (np.abs(x) < 0.12); wf = np.where(face, wf + ws + 0.01, wf); ws = np.where(face, ws * 0.15, ws)
    if part in ("Torso", "Skirt"):   # en el perfil el brazo tapa el costado del torso: costado desde frente/espalda arriba de la cintura
        up = py < 330; wf = np.where(up, wf + ws * (y <= 0), wf); wb = np.where(up, wb + ws * (y > 0), wb); ws = np.where(up, ws * 0.1, ws)
    if part == "Arms":   # el perfil muestra el brazo izquierdo: sirve para el lado de afuera de ambos
        inner = (x * nx) < 0; ws = np.where(inner, 0, ws); wf = np.where(inner, wf + 0.4 * (y <= 0), wf); wb = np.where(inner, wb + 0.4 * (y > 0), wb)
    if part == "Box": wf = wf + 1.0; wb = wb * 0; ws = ws * 0.3
    wf2, wb2, ws2 = wf * gf, wb * gb, ws * gs; t = wf2 + wb2 + ws2
    weak = t < 0.02 * (wf + wb + ws + 1e-6)
    wf2 = np.where(weak, gf * 1e-3 + 1e-6, wf2); wb2 = np.where(weak, gb * 1e-3, wb2); ws2 = np.where(weak, gs * 1e-3, ws2); t = wf2 + wb2 + ws2
    col = (cf * wf2[:, None] + cb * wb2[:, None] + cs * ws2[:, None]) / t[:, None]
    if part in ("Torso", "Skirt", "Arms"):
        # v3.1: pliegues, placas y costuras pintados a mano encima de la proyeccion (se leen a 128 px)
        lum = col.mean(1)
        if part != "Arms":
            phi = np.arctan2(-x, -(y - 0.03))
            sash = (z < (SOLE - 300) * S) & (z > (SOLE - 348) * S); st = np.sin(z * 2 * np.pi / 0.045 + 0.8 * np.sin(phi * 3))
            col = np.where((sash & (st > 0.6))[:, None], np.maximum(col, 0.40), col); col = np.where((sash & (st < -0.4))[:, None], col * 0.2, col)
            zp = (SOLE - 262) * S                                                         # borde inferior de la placa del pecho
            col = np.where(((np.abs(z - zp) < 0.012) & (y < 0.05))[:, None], RUBBER, col)
            col = np.where(((z - zp > 0.012) & (z - zp < 0.028) & (y < 0.05))[:, None], np.maximum(col, 0.40), col)
        ax = np.abs(x); band = np.abs(ax - (0.40 + np.clip(2.22 - z, 0, 1) * 0.35)) < 0.024   # tiras mostaza sobre los hombros
        col = np.where((band & (z > 1.95) & (z < 2.24))[:, None], MUST, col)
        # la piel de la hoja (cuello, manos, cara) caia sobre la tela -> esa vista no cuenta; si todas son piel, negro de goma
        cloth = np.ones(len(z), bool) if part != "Arms" else z > ZWR
        sk = [skin(c) & cloth for c in (cf, cb, cs)]
        w3 = [np.where(k, 0, w) for k, w in zip(sk, (wf2, wb2, ws2))]; t3 = w3[0] + w3[1] + w3[2]
        good = t3 > 1e-4; t3 = np.where(good, t3, 1)
        c2 = (cf * w3[0][:, None] + cb * w3[1][:, None] + cs * w3[2][:, None]) / t3[:, None]
        col = np.where(good[:, None], c2, col)
        col = np.where((skin(col) & cloth)[:, None], RUBBER, col)
    if part == "Head":   # v3.1: franja rara en la base del cuello (la hoja ahi muestra el cuello del abrigo/tubos) -> piel del cuello
        low = z < ZNECK; bad = low & ~skin(col)
        col = np.where(bad[:, None], NECK, col)
    return col

BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]], np.float32) / 16 - 0.5
TONES = np.array([[0.025, 0.022, 0.024], [0.07, 0.062, 0.066], [0.15, 0.137, 0.142], [0.30, 0.285, 0.29], [0.55, 0.53, 0.53]], np.float32)
MUSTARD, MUSTARD_D = np.array([0.79, 0.60, 0.10], np.float32), np.array([0.45, 0.32, 0.05], np.float32)
def rubber_paint(px):
    """goma negra estilo PS1: la luminancia de la hoja (pliegues, placas, reflejos) se realza y se posteriza a 5 tonos
    con dithering Bayer 4x4; costuras mostaza saturadas; tubos/caja/piel de las manos quedan como estan"""
    img = px.reshape(R, R, 3); r, g, b = img[..., 0], img[..., 1], img[..., 2]
    lum = 0.3 * r + 0.55 * g + 0.15 * b
    sat = img.max(2) - img.min(2)
    yellow = (r > 0.25) & (g > 0.55 * r) & (b < 0.55 * g) & (sat > 0.12)
    keep = (~yellow) & ((sat > 0.14) | skin(px).reshape(R, R))          # tubos rojos, oxido, verde, manos
    # luminancia suavizada 3x3 y cortes duros a 5 tonos (bandas limpias que siguen los pliegues de la hoja); dithering solo en el borde
    from numpy.lib.stride_tricks import sliding_window_view as sw
    l2 = sw(np.pad(lum, 1, mode="edge"), (3, 3)).mean((2, 3))
    d = np.tile(BAYER, (R // 4, R // 4)) * 0.035
    idx = np.digitize(l2 + d, [0.085, 0.17, 0.3, 0.48])
    out = TONES[idx]
    ym = np.where((lum > 0.35)[..., None], MUSTARD, MUSTARD_D)
    out = np.where(yellow[..., None], ym, out)
    out = np.where(keep[..., None], img, out)
    return out.reshape(-1, 3).astype(np.float32)

def kmeans32(px):
    rng = np.random.default_rng(1); c = px[rng.choice(len(px), 32, replace=False)]
    for _ in range(12):
        l = ((px[:, None, :] - c[None]) ** 2).sum(2).argmin(1)
        for k in range(32):
            if (l == k).any(): c[k] = px[l == k].mean(0)
    return c[l]

def head_uv(ob):
    """UV cilindrica con la cara agrandada: el frente (+-60 grados) ocupa ~la mitad del ancho y el cuello solo el 20 % del alto,
    asi la cara (grapas, ojo, dientes) tiene mas texeles en los 128 px"""
    import math
    me = ob.data; uvl = me.uv_layers.new(name="UVMap"); me.uv_layers.active = uvl
    co = [v.co for v in me.vertices]; zs = [c.z for c in co]; z0, z1 = min(zs), max(zs); zn = (SOLE - 126) * S
    yc = sum(c.y for c in co) / len(co)
    def uv(c):
        th = math.atan2(c.x, -(c.y - yc)); t = abs(th) / math.pi
        u = 0.5 + 0.5 * math.copysign(t ** 0.6, th) * 0.96
        v = 0.2 * (c.z - z0) / (zn - z0) if c.z < zn else 0.2 + 0.8 * (c.z - zn) / (z1 - zn)
        return u, min(0.99, max(0.01, v))
    for poly in me.polygons:
        us = [uv(co[me.loops[l].vertex_index]) for l in poly.loop_indices]
        if max(q[0] for q in us) - min(q[0] for q in us) > 0.5:   # costura de atras: todo al mismo lado
            us = [(q[0] if q[0] > 0.5 else 0.98, q[1]) for q in us]
        for l, q in zip(poly.loop_indices, us): uvl.data[l].uv = q

def bake(ob):
    me = ob.data
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.scene.objects: o.select_set(o == ob)
    if ob.name == "Head": head_uv(ob)
    else:
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.05); bpy.ops.object.mode_set(mode="OBJECT")
    me.calc_loop_triangles(); uv = me.uv_layers.active.data; RR = R * SS
    acc = np.zeros((RR, RR, 3), np.float32); cov = np.zeros((RR, RR), bool)
    V = np.array([ob.matrix_world @ v.co for v in me.vertices])
    VN = np.array([ob.matrix_world.to_3x3() @ v.normal for v in me.vertices])
    for lt in me.loop_triangles:
        T = np.array([uv[l].uv for l in lt.loops]) * RR; X = V[list(lt.vertices)]; NN = VN[list(lt.vertices)]
        x0, y0 = np.floor(T.min(0) - 1).astype(int); x1, y1 = np.ceil(T.max(0) + 1).astype(int)
        x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, RR - 1), min(y1, RR - 1)
        if x1 < x0 or y1 < y0: continue
        gx, gy = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5); p = np.stack([gx.ravel(), gy.ravel()], 1)
        a, b, c = T; d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1])
        if abs(d) < 1e-12: continue
        l1 = ((b[1] - c[1]) * (p[:, 0] - c[0]) + (c[0] - b[0]) * (p[:, 1] - c[1])) / d
        l2 = ((c[1] - a[1]) * (p[:, 0] - c[0]) + (a[0] - c[0]) * (p[:, 1] - c[1])) / d; l3 = 1 - l1 - l2
        e = -0.6 / max(1.0, np.abs(T.max(0) - T.min(0)).max()); mk = (l1 >= e) & (l2 >= e) & (l3 >= e)
        if not mk.any(): continue
        L = np.stack([l1[mk], l2[mk], l3[mk]], 1); Pt = L @ X; N = L @ NN; N /= np.linalg.norm(N, axis=1)[:, None] + 1e-9
        col = project(Pt, N, ob.name); ix = p[mk, 0].astype(int); iy = p[mk, 1].astype(int)
        acc[iy, ix] = col; cov[iy, ix] = True
    for _ in range(12 * SS):
        if cov.all(): break
        nacc = acc.copy(); ncov = cov.copy()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            c2 = np.roll(cov, (dy, dx), (0, 1)); a2 = np.roll(acc, (dy, dx), (0, 1)); fill = c2 & ~ncov; nacc[fill] = a2[fill]; ncov |= fill
        acc, cov = nacc, ncov
    out = acc.reshape(R, SS, R, SS, 3).mean((1, 3)).reshape(-1, 3)
    if ob.name in ("Torso", "Skirt", "Arms"): out = rubber_paint(out)   # v3.1: goma pintada a mano (posterizado + dithering)
    out = kmeans32(out).reshape(R, R, 3)                  # PS1: 32 colores
    im = bpy.data.images.new(ob.name + "_tex", R, R); im.pixels[:] = np.concatenate([out, np.ones((R, R, 1), np.float32)], 2).ravel()
    im.filepath_raw = f"{TEX}/{ob.name}.png"; im.file_format = "PNG"; im.save()
    mat = bpy.data.materials.new("stalker_" + ob.name); mat.use_nodes = True; nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"); ti = nt.nodes.new("ShaderNodeTexImage"); ti.image = im; ti.interpolation = "Closest"
    nt.links.new(ti.outputs["Color"], bsdf.inputs["Base Color"]); bsdf.inputs["Metallic"].default_value = 0
    rubber = ob.name in ("Torso", "Skirt", "Arms")
    bsdf.inputs["Roughness"].default_value = 0.62 if rubber else 0.9          # brillo de goma en el abrigo
    bsdf.inputs["Specular IOR Level"].default_value = 0.4 if rubber else 0.25
    me.materials.clear(); me.materials.append(mat); print("BAKED", ob.name, "coverage", round(float(cov.mean()), 3))

for n in ("Torso", "Skirt", "Arms", "Head", "Feet", "Box"): bake(bpy.data.objects[n])
bpy.ops.wm.save_as_mainfile(filepath=f"{D}/v3/tex.blend")

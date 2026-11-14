# ep8 (granja) - blender -b -P tools/build_ep8.py : props PS1 desde foto aislada (metodo vlvt) -> glb/<name>.glb
# (+ copia en engine/models) y compare/<name>_<view>.png. Texturas, siluetas y medidas: prep_ep8.py (rows/_info.json).
# Ejes Blender: X derecha, -Y = frente (en el GLB +Z), Z arriba; base en z=0. Medidas reales en metros.
import bpy, bmesh, os, math, json, shutil
from mathutils import Vector
_T = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(_T, "build_ep6.py"), encoding="utf8").read().split("# 1 BANERA")[0].replace('exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.py")', 'exec(open(os.path.join(_T, "build.py")'))
INFO = json.load(open(f"{H}/rows/_info.json")); EP7 = H + "/../../zombie-07-saferoom/engine/models"
_mat0 = mat


def mat(name, tex=None, rgb=(0.5, 0.5, 0.5), alpha=False):
    """material PS1 (Closest, sin brillo); alpha=True: recorte alfa (Round -> glTF MASK) y doble cara"""
    m = _mat0(name, tex, rgb); m.use_backface_culling = False
    if alpha:
        nt = m.node_tree; t = next(n for n in nt.nodes if n.type == "TEX_IMAGE"); b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
        r = nt.nodes.new("ShaderNodeMath"); r.operation = "ROUND"; nt.links.new(t.outputs["Alpha"], r.inputs[0]); nt.links.new(r.outputs[0], b.inputs["Alpha"])
        for k, v in (("blend_method", "CLIP"), ("surface_render_method", "DITHERED")):
            try: setattr(m, k, v)
            except Exception: pass
    return m


def paint(name, w, h, base, noise=0.12, seed=1):
    """textura pintada en codigo (metal, concreto): color base + ruido por pixel, 32 niveles"""
    import random; random.seed(seed); px = []
    for i in range(w * h):
        f = 1 + (random.random() - 0.5) * 2 * noise; px += [min(1, max(0, round(c * f * 31) / 31)) for c in base] + [1]
    im = bpy.data.images.new(name, w, h); im.pixels = px; im.filepath_raw = f"{TEX}{name}.png"; im.file_format = "PNG"; im.save(); return name


def bm_new(): bm = bmesh.new(); return bm, bm.loops.layers.uv.new()


def shots8(name, size, center, dist=6, views=("front", "34")):
    sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sh = sc.display.shading; sh.light = "FLAT"; sh.color_type = "TEXTURE"
    sc.render.resolution_x, sc.render.resolution_y = 512, 512; sc.render.film_transparent = False
    w = bpy.data.worlds.new("w"); sc.world = w; w.color = (0.08, 0.08, 0.09)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cx, cy, cz = center
    P = {"front": ((cx, cy - dist, cz), True), "back": ((cx, cy + dist, cz), True), "side": ((cx + dist, cy, cz), True),
         "34": ((cx + dist * 0.6, cy - dist * 0.75, cz + dist * 0.45), False)}
    for tag in views:
        pos, ortho = P[tag]; cam.location = pos; d = Vector(center) - Vector(pos); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        cam.data.type = "ORTHO" if ortho else "PERSP"; cam.data.ortho_scale = size; cam.data.clip_start = dist * 0.01
        if not ortho: cam.data.angle = 2 * math.atan(size * 0.62 / d.length)
        sc.render.filepath = f"{H}/compare/{name}_{tag}.png"; bpy.ops.render.render(write_still=True)


def done8(name, size, center, dist=6, views=("front", "34")):
    export(name); shutil.copy(f"{H}/glb/{name}.glb", f"{ENG}/{name}.glb"); shots8(name, size, center, dist, views)


def slab(name, R, sx, sz, ox, oz, d, mF, mE, uvmap):
    """tiras por fila (runs de prep) extruidas d: frente/dorso con la foto, cantos con mE. uvmap(u, v) -> uv de la textura"""
    bm, uvl = bm_new(); Y = d / 2
    for v0, v1, rr in R:
        for u0, u1 in rr:
            x0, x1, z0, z1 = ox + u0 * sx, ox + u1 * sx, oz + v0 * sz, oz + v1 * sz; uv = [uvmap(u0, v0), uvmap(u1, v0), uvmap(u1, v1), uvmap(u0, v1)]
            quad(bm, uvl, [(x0, -Y, z0), (x1, -Y, z0), (x1, -Y, z1), (x0, -Y, z1)], uv, 0)
            quad(bm, uvl, [(x1, Y, z0), (x0, Y, z0), (x0, Y, z1), (x1, Y, z1)], [uv[1], uv[0], uv[3], uv[2]], 0)
            for vs in ([(x0, Y, z0), (x0, -Y, z0), (x0, -Y, z1), (x0, Y, z1)], [(x1, -Y, z0), (x1, Y, z0), (x1, Y, z1), (x1, -Y, z1)],
                       [(x0, -Y, z1), (x1, -Y, z1), (x1, Y, z1), (x0, Y, z1)], [(x0, Y, z0), (x1, Y, z0), (x1, -Y, z0), (x0, -Y, z0)]):
                quad(bm, uvl, vs, [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    return obj_from(bm, name, [mF, mE])


# 1 GENERADOR: caja con recorte alfa (marco tubular abierto). Frente = lado largo con el panel de enchufes
def generator():
    reset(); W = 0.68; Ht = W * INFO["gen_front"]; D = Ht / INFO["gen_side"]
    mF, mS, mT = mat("gen_front", "gen_front", alpha=True), mat("gen_side", "gen_side", alpha=True), mat("gen_top", "gen_top", alpha=True)
    boxuv("generator", W, Ht, D, {"front": (0, FULL), "back": (0, FULL), "left": (1, FULL), "right": (1, FULL), "top": (2, FULL), "bottom": (2, FULL)}, [mF, mS, mT])
    mK = mat("gen_dark", None, (0.13, 0.13, 0.12))   # nucleo macizo (se ve por los huecos del marco): tanque arriba, motor abajo
    for nm, w, d, z0, z1 in (("tank", 0.85, 0.8, 0.715, 0.945), ("eng", 0.8, 0.75, 0.08, 0.66)):
        boxuv(f"gen_{nm}", W * w, Ht * (z1 - z0), D * d, {"front": (0, FULL), "back": (0, FULL), "left": (1, FULL), "right": (1, FULL)},
              [mat(f"gen_{nm}_front", f"gen_{nm}_front"), mat(f"gen_{nm}_side", f"gen_{nm}_side"), mK], y=Ht * z0)
    done8("generator", 1.0, (0, 0, Ht / 2), 4, ("front", "side", "34"))


# 2 BIDON (jerry can 20 l): contorno por filas extruido 0.165 m, alfa en las caras (hueco de la manija)
def jerrycan():
    reset(); h = 0.47; w = h / INFO["jerrycan"]
    ext("jerrycan", rows("jerrycan"), h, w, 0.165, mat("jerrycan", "jerrycan", alpha=True), mat("jerrycan_edge", None, (0.55, 0.08, 0.06)))
    done8("jerrycan", 0.6, (0, 0, h / 2), 3)


# 4 BOMBA DE MANO sobre poste (foto de costado: perfil en X-Z, cano a -X, palanca a +X) + losa de concreto del pozo
def handpump():
    reset(); I = INFO["pump"]; Wp, Hp = I["W"], I["H"]; Ht = 1.40; s = Ht / Hp; px0, px1, pt = I["post"]; cx = (px0 + px1) / 2
    X = lambda px: (px - cx) * s; Z = lambda py: (Hp - py) * s
    pw = (px1 - px0) * s; mP = mat("pump_post", "pump_post"); mW = mat("post_top", None, (0.42, 0.40, 0.36))
    boxuv("pump_post", pw, Z(pt), pw * 0.9, {k: (0, FULL) for k in ("front", "back", "left", "right")}, [mP, mW])
    # cuerpo (barril) = loft de 10 lados sobre el poste
    bt = I["bar_top"]; R = rows("pump_barrel"); hb = Z(bt) - Z(pt); mB = mat("pump_barrel", "pump_barrel"); mC = mat("pump_cap", None, (0.24, 0.17, 0.12))
    ring = []
    for v, x0, x1 in R:
        r = (x1 - x0) / 2 * Wp * s * 0.95; xc = X((x0 + x1) / 2 * Wp)
        ring.append([(xc + r * math.sin(a), -r * math.cos(a), Z(pt) + v * hb, (x0 + x1) / 2 + (x1 - x0) / 2 * math.sin(a), v) for a in [2 * math.pi * k / 10 + math.pi / 10 for k in range(10)]])
    bm, uvl = bm_new(); loft(bm, uvl, ring, 0); disc(bm, uvl, ring[-1], Z(bt), 1); obj_from(bm, "pump_body", [mB, mC])
    # cano + brida (tiras extruidas 5 cm) y palanca con varilla (4 cm, nodo aparte con pivote en el perno)
    mT, mE = mat("pump", "pump", alpha=True), mat("pump_edge", None, (0.20, 0.22, 0.17))
    slab("pump_spout", I["body_runs"], Wp * s, Z(0) - Z(pt), X(0), Z(pt), 0.05, mT, mE, lambda u, v: (u, 1 - pt * (1 - v) / Hp))
    hd = slab("pump_handle", I["hand_runs"], Wp * s, Ht, X(0), 0, 0.04, mT, mE, lambda u, v: (u, v))
    pvx, pvy = 405, 105   # perno de la palanca en el recorte (px)
    pv = Vector((X(pvx), 0, Z(pvy)))
    for vtx in hd.data.vertices: vtx.co -= pv
    hd.location = pv
    # losa redonda de concreto del pozo (8 lados) bajo el poste
    mK = mat("well_pad", paint("well_pad", 16, 16, (0.55, 0.54, 0.50), 0.15)); bm, uvl = bm_new()
    rg = [(0.45 * math.cos(2 * math.pi * k / 8 + math.pi / 8), 0.45 * math.sin(2 * math.pi * k / 8 + math.pi / 8)) for k in range(8)]
    top = [(x, y, 0.08, 0.5 + x / 0.9, 0.5 + y / 0.9) for x, y in rg]; bot = [(x, y, 0.0, 0.5 + x / 0.9, 0.5 + y / 0.9) for x, y in rg]
    loft(bm, uvl, [bot, top], 0); disc(bm, uvl, top, 0.08, 0); o = obj_from(bm, "well_pad", [mK])
    for ob in bpy.context.scene.objects:   # todo sube 8 cm (el poste apoya en la losa)
        if ob.name != "well_pad": ob.location.z += 0.08
    done8("handpump", 1.7, (0, 0, 0.78), 6)


# 5 CANDADO: cuerpo de laton (caja con la foto) + arco de acero como nodo "shackle" (origen en la boca del cuerpo)
def padlock():
    reset(); I = INFO["padlock"]; s = 0.075 / I["W"]; bt = I["body_top"]; hb = (I["H"] - bt) * s; D = 0.03
    mF, mE = mat("padlock_body", "padlock_body"), mat("brass", paint("brass", 8, 8, I["brass"], 0.1, 3))
    boxuv("padlock_body", 0.075, hb, D, {"front": (0, FULL), "back": (0, FULL)}, [mF, mE])
    l0, l1 = I["leg_row"]; g0, g1 = I["gap"]; xl, xr = (l0 + g0) / 2, (g1 + l1) / 2; xc = (xl + xr) / 2; R = (xr - xl) / 2 * s; r = (g0 - l0) / 2 * s
    zc = (I["H"] - (I["top"] + (g0 - l0) / 2 + (xr - xl) / 2)) * s; X0 = (xc - I["W"] / 2) * s; zin = hb - 0.008
    pts = [(X0 + R, 0, zin), (X0 + R, 0, zc)] + [(X0 + R * math.cos(a), 0, zc + R * math.sin(a)) for a in [math.pi * k / 8 for k in range(1, 8)]] + [(X0 - R, 0, zc), (X0 - R, 0, zin)]
    o = tube("shackle", pts, r, mat("steel", paint("steel", 8, 8, I["steel"], 0.12, 5)), 6)
    for v in o.data.vertices: v.co.z -= hb
    o.location.z = hb
    done8("padlock", 0.13, (0, 0, 0.055), 1)


# 5b CADENA: 14 eslabones ovalados (tubo de 6 lados por un estadio), alternados 90 grados, a lo largo de X
def chain():
    reset(); m = mat("chain_steel", paint("chain_steel", 16, 16, (0.46, 0.46, 0.47), 0.18, 7))
    rw, a, b = 0.0055, 0.0245, 0.0125; pitch = 2 * (a - rw) + 0.0; n = 14; x0 = -(n - 1) * pitch / 2
    path = []
    for k in range(13):   # estadio: dos rectas + dos semicirculos (centro en 0)
        t = 2 * math.pi * k / 12; c, sn = math.cos(t), math.sin(t)
        path.append(((a - b) * (1 if c >= 0 else -1) + b * c, b * sn))
    for i in range(n):
        vertical = i % 2 == 1
        pts = [(x, 0, y) if vertical else (x, y, 0) for x, y in path]
        o = tube(f"link_{i:02d}", pts, rw, m, 4); o.location = (x0 + i * pitch, 0, b + rw)
    done8("chain", 0.6, (0, 0, 0.02), 2)


# 6 PICKUP: perfil del costado extruido por columnas (2 m de ancho), caja abierta, portón; 4 ruedas como nodos
def pickup():
    reset(); S = INFO["pickup_side"]; bx, by = S["box"][:2]; W_, H_ = S["W"], S["H"]; L = 5.3; s = L / W_; WD = 1.95; hw = WD / 2
    Fb, Bb = INFO["pickup_front_box"], INFO["pickup_back_box"]; FW, FH = Fb[2] - Fb[0], Fb[3] - Fb[1]; BW, BH = Bb[2] - Bb[0], Bb[3] - Bb[1]
    mS, mF, mB = mat("pickup_side", "pickup_side"), mat("pickup_front", "pickup_front"), mat("pickup_back", "pickup_back")
    mR, mU, mI = mat("pickup_paint", None, (0.50, 0.16, 0.13)), mat("pickup_under", None, (0.06, 0.06, 0.06)), mat("pickup_bed", None, (0.20, 0.08, 0.07))
    def lerp(tab, z):
        for (z0, p0), (z1, p1) in zip(tab, tab[1:]):
            if z <= z1 or (z1, p1) == tab[-1]: t = (z - z0) / (z1 - z0); return p0 + (p1 - p0) * max(0, min(1, t))
    FT = [(0, 815), (0.32, 710), (0.72, 560), (1.18, 400), (1.31, 300), (1.835, 122)]; BT = [(0, 845), (0.40, 690), (0.62, 595), (1.27, 318), (1.835, 232)]
    def uvF(x, z):
        t = max(0, min(1, (z - 1.31) / 0.525)); a, b = 208 + (370 - 208) * t, 1012 + (855 - 1012) * t
        px = a + (x / WD + 0.5) * (b - a); return ((px - Fb[0]) / FW, 1 - (lerp(FT, z) - Fb[1]) / FH)
    def uvB(x, z):
        a, b = (190, 1010) if z <= 1.28 else (365, 850); px = a + (0.5 - x / WD) * (b - a); return ((px - Bb[0]) / BW, 1 - (lerp(BT, z) - Bb[1]) / BH)
    uvS = lambda y, z: ((y + L / 2) / L, z / (H_ * s))
    Z = lambda py: (H_ - py) * s
    wheels = S["wheels"]; cols = S["cols"]; n = len(cols); bed0, bed1 = 745 - bx, 1300 - bx; zfloor, zrail = 0.85, Z(305 - by)
    C = []
    for k, c in enumerate(cols):
        x = (k + 0.5) / n * W_; top, bot = c
        bot = min(bot, 360 if (x < 90 or x > W_ - 60) else 340)
        for wx, wy, wr in wheels:
            if abs(x - wx) < 1.12 * wr: bot = min(bot, wy - math.sqrt((1.12 * wr) ** 2 - (x - wx) ** 2))
        ztop = Z(top); bed = bed0 + 8 < x < bed1 - 8
        C.append((-L / 2 + x * s, Z(bot), zfloor if bed else ztop, bed, ztop))
    bm, uvl = bm_new()
    def face(vs, kind):
        if kind == "S": uv = [uvS(v[1], v[2]) for v in vs]; mi = 0
        elif kind == "F": uv = [uvF(v[0], v[2]) for v in vs]; mi = 1
        elif kind == "B": uv = [uvB(v[0], v[2]) for v in vs]; mi = 2
        else: uv = [(0, 0), (1, 0), (1, 1), (0, 1)]; mi = {"T": 3, "U": 4, "I": 5}[kind]
        k = lambda z: 1 - 0.16 * max(0, min(1, (z - 1.31) / 0.5))   # cabina: el techo se angosta (como en la foto de frente)
        quad(bm, uvl, [(v[0] * k(v[2]), v[1], v[2]) for v in vs], uv, mi)
    for (y0, b0, t0, _, _), (y1, b1, t1, _, _) in zip(C, C[1:]):
        face([(hw, y0, b0), (hw, y1, b1), (hw, y1, t1), (hw, y0, t0)], "S")
        face([(-hw, y1, b1), (-hw, y0, b0), (-hw, y0, t0), (-hw, y1, t1)], "S")
        dz, dy = t1 - t0, y1 - y0; nz = dy / math.hypot(dy, dz); ny = -dz / math.hypot(dy, dz)
        face([(-hw, y0, t0), (hw, y0, t0), (hw, y1, t1), (-hw, y1, t1)], "T" if nz > 0.82 else ("F" if ny < 0 else "B"))
        face([(-hw, y1, b1), (hw, y1, b1), (hw, y0, b0), (-hw, y0, b0)], "U")
    y, b_, t_ = C[0][:3]; face([(-hw, y, b_), (hw, y, b_), (hw, y, t_), (-hw, y, t_)], "F")
    y, b_, t_ = C[-1][:3]; face([(hw, y, b_), (-hw, y, b_), (-hw, y, t_), (hw, y, t_)], "B")
    # caja: paredes laterales (5 cm) del piso a la baranda, portón trasero
    BC = [c for c in C if c[3]]; tw = 0.05
    for sgn in (1, -1):
        xo, xi = sgn * hw, sgn * (hw - tw)
        for (y0, _, _, _, r0), (y1, _, _, _, r1) in zip(BC, BC[1:]):
            r0 = r1 = zrail; vs = [(xo, y0, zfloor), (xo, y1, zfloor), (xo, y1, r1), (xo, y0, r0)]; face(vs if sgn > 0 else [vs[1], vs[0], vs[3], vs[2]], "S")
            vi = [(xi, y1, zfloor), (xi, y0, zfloor), (xi, y0, r0), (xi, y1, r1)]; face(vi if sgn > 0 else [vi[1], vi[0], vi[3], vi[2]], "I")
            face([(xi, y0, zrail), (xo, y0, zrail), (xo, y1, zrail), (xi, y1, zrail)] if sgn > 0 else [(xo, y0, zrail), (xi, y0, zrail), (xi, y1, zrail), (xo, y1, zrail)], "T")
    ye = C[-1][0]; yi = ye - tw
    face([(hw, ye, zfloor), (-hw, ye, zfloor), (-hw, ye, zrail), (hw, ye, zrail)], "B")
    face([(-hw, yi, zfloor), (hw, yi, zfloor), (hw, yi, zrail), (-hw, yi, zrail)], "I")
    face([(-hw, yi, zrail), (hw, yi, zrail), (hw, ye, zrail), (-hw, ye, zrail)], "T")
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); obj_from(bm, "pickup_body", [mS, mF, mB, mR, mU, mI])
    for nm, sx in (("mirror_l", 1), ("mirror_r", -1)):
        boxuv(nm, 0.06, 0.16, 0.22, {}, [mat(nm, None, (0.08, 0.08, 0.08))], x=sx * (hw + 0.05), y=1.22, z=-L / 2 + (468 - bx) * s)
    # ruedas: 10 lados, llanta de la foto en las tapas, banda de rodadura oscura; origen en el eje
    mT = mat("tire", None, (0.05, 0.05, 0.05))
    for nm, sx, k in (("wheel_fl", 1, 0), ("wheel_fr", -1, 0), ("wheel_rl", 1, 1), ("wheel_rr", -1, 1)):
        wx, wy, wr = wheels[k]; r = wr * s; wd = 0.26; mW = mat(f"pickup_wheel{k}", f"pickup_wheel{k}")
        bm, uvl = bm_new(); ang = [2 * math.pi * j / 10 for j in range(10)]
        A = [(wd / 2, r * math.cos(a), r * math.sin(a), 0.5 + 0.5 * math.cos(a), 0.5 + 0.5 * math.sin(a)) for a in ang]
        B = [(-wd / 2, r * math.cos(a), r * math.sin(a), 0.5 - 0.5 * math.cos(a), 0.5 + 0.5 * math.sin(a)) for a in ang]
        for j in range(10):
            j2 = (j + 1) % 10; quad(bm, uvl, [B[j][:3], B[j2][:3], A[j2][:3], A[j][:3]], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
        for ring, flip in ((A, False), (B, True)):
            rr = ring[::-1] if flip else ring; f = bm.faces.new([bm.verts.new(q[:3]) for q in rr]); f.material_index = 0
            for l, q in zip(f.loops, rr): l[uvl].uv = q[3:]
        o = obj_from(bm, nm, [mW, mT]); o.location = (sx * (hw - wd / 2 - 0.02), -L / 2 + wx * s, r * math.cos(math.pi / 10))
    done8("pickup", 6.0, (0, 0, 1.0), 14, ("front", "side", "back", "34"))


# 7 FARDOS: rectangular (caja con frente y punta) y redondo (cilindro acostado de 12 lados)
def haybale():
    reset(); L = 0.9; h = L * INFO["hay_front"]; d = h / INFO["hay_side"]; mF, mS = mat("hay_front", "hay_front"), mat("hay_side", "hay_side")
    boxuv("haybale", L, h, d, {"front": (0, FULL), "back": (0, FULL), "top": (0, FULL), "bottom": (0, FULL), "left": (1, FULL), "right": (1, FULL)}, [mF, mS])
    done8("haybale", 1.1, (0, 0, h / 2), 4, ("front", "side", "34"))


def haybale_round():
    reset(); R, Wd, N = 0.75, 1.2, 12; mF, mS = mat("hayr_face", "hayr_face"), mat("hay_front", "hay_front")
    bm, uvl = bm_new(); ang = [2 * math.pi * j / N for j in range(N)]
    A = [(Wd / 2, R * math.cos(a), R + R * math.sin(a)) for a in ang]; B = [(-Wd / 2, q[1], q[2]) for q in A]
    for j in range(N):
        j2 = (j + 1) % N; u0, u1 = 3 * j / N, 3 * (j + 1) / N
        quad(bm, uvl, [B[j], B[j2], A[j2], A[j]], [(u0, 0), (u1, 0), (u1, 1), (u0, 1)], 1)
    for ring, sgn in ((A, 1), (B, -1)):
        rr = ring if sgn > 0 else ring[::-1]; f = bm.faces.new([bm.verts.new(q) for q in rr]); f.material_index = 0
        for l, q in zip(f.loops, rr): l[uvl].uv = (0.5 - 0.46 * sgn * q[1] / R, 0.5 + 0.46 * (q[2] - R) / R)
    obj_from(bm, "haybale_round", [mF, mS]); done8("haybale_round", 1.8, (0, 0, R), 6, ("front", "side", "34"))


def loftobj(name, tex, h, w, sides, top=None, bot=None, step=1):   # como en build_ep7
    m = mat(name, tex); R = rings_from(tex, h, w, sides, step=step); bm, uvl = bm_new(); loft(bm, uvl, R, 0); mats = [m]
    for ring, z, col, flip in ((R[-1], h, top, False), (R[0], 0.0, bot, True)):
        if col is None: continue
        mats.append(mat(f"{name}_cap{len(mats)}", None, col)); disc(bm, uvl, ring, z, len(mats) - 1, flip)
    return obj_from(bm, name, mats)


# 8 SACO de alimento 50 lb: loft por filas de 10 lados, seccion eliptica (fondo = 38 % del ancho)
def feedsack():
    reset(); h = 0.85; w = h / INFO["feedsack"]; o = loftobj("feedsack", "feedsack", h, w, 10, top=(0.78, 0.74, 0.64), bot=(0.6, 0.57, 0.5))
    for v in o.data.vertices: v.co.y *= 0.38
    done8("feedsack", 1.0, (0, 0, h / 2), 4)


# 3 + 9 BALDE y TELEFONO: se reusan los GLB de ep6/ep7 (copia + render para la hoja)
def reuse(name, size, center, dist):
    reset(); bpy.ops.import_scene.gltf(filepath=f"{EP7}/{name}.glb"); shutil.copy(f"{EP7}/{name}.glb", f"{H}/glb/{name}.glb"); shutil.copy(f"{EP7}/{name}.glb", f"{ENG}/{name}.glb")
    shots8(name, size, center, dist)


import sys
ONLY = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ALL = {"generator": generator, "jerrycan": jerrycan, "handpump": handpump, "padlock": padlock, "chain": chain, "pickup": pickup,
       "haybale": haybale, "haybale_round": haybale_round, "feedsack": feedsack,
       "bucket": lambda: reuse("bucket", 0.6, (0, 0, 0.26), 3), "phone": lambda: reuse("phone", 0.2, (0, 0, 0.075), 1)}
for k, f in ALL.items():
    if not ONLY or k in ONLY: f()
rep = []
for n in ALL:
    reset(); bpy.ops.import_scene.gltf(filepath=f"{H}/glb/{n}.glb"); dg = bpy.context.evaluated_depsgraph_get(); P = []; tris = 0; names = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH": continue
        names.append(o.name); me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles)
        P += [o.matrix_world @ v.co for v in me.vertices]
    lo = [min(p[i] for p in P) for i in range(3)]; hi = [max(p[i] for p in P) for i in range(3)]
    rep.append(f"{n}: {os.path.getsize(f'{H}/glb/{n}.glb') // 1024} KB tris={tris} x[{lo[0]:.3f},{hi[0]:.3f}] y[{lo[2]:.3f},{hi[2]:.3f}] z[{-hi[1]:.3f},{-lo[1]:.3f}] parts={sorted(names)}")
open(H + "/glb/_report.txt", "w").write("\n".join(rep)); print("\n".join(rep))

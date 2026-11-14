# ep6 (piso 30) — blender -b -P tools/build_ep6.py : props PS1 desde foto aislada (metodo vlvt) -> glb/<name>.glb + compare/<name>_front/_34.png
# Texturas y siluetas de prep_ep6.py. Ejes Blender: X derecha, -Y = frente (en el GLB +Z), Z arriba; base en z=0, centrado en x/y.
import bpy, bmesh, os, math, json, shutil
from mathutils import Vector
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.py"), encoding="utf8").read().split("\ndef car():")[0])
os.makedirs(H + "/glb", exist_ok=True); os.makedirs(H + "/compare", exist_ok=True)
ENG = H + "/../engine/models"; FULL = (0, 0, 1, 1)
def rows(n): return json.load(open(f"{H}/rows/{n}.json"))


def rings_from(name, h, w, sides, trim=0.05, step=1):
    """anillos del loft desde la silueta; las filas de los extremos (elipse de la perspectiva) se reemplazan por la vecina"""
    R = [r for r in rows(name) if trim <= r[0] <= 1 - trim]; R = R[::step] if R[-1] in R[::step] else R[::step] + [R[-1]]; R = [[0.0] + R[0][1:]] + R + [[1.0] + R[-1][1:]]
    out = []
    for v, x0, x1 in R:
        r = (x1 - x0) / 2 * w; xc = (x0 + x1) / 2
        out.append([(r * math.sin(a), -r * math.cos(a), v * h, xc + (x1 - x0) / 2 * math.sin(a), v) for a in [2 * math.pi * k / sides + math.pi / sides for k in range(sides)]])
    return out


def loft(bm, uvl, rings, mi):
    for A, B in zip(rings[1:], rings[:-1]):
        n = len(A)
        for k in range(n):
            k2 = (k + 1) % n; p = [B[k], B[k2], A[k2], A[k]]; quad(bm, uvl, [q[:3] for q in p], [q[3:] for q in p], mi)


def disc(bm, uvl, ring, z, mi, flip=False):
    vs = [(q[0], q[1], z) for q in ring]; r = max(math.hypot(q[0], q[1]) for q in ring) or 1
    uvs = [(0.5 + q[0] / r / 2, 0.5 + q[1] / r / 2) for q in ring]
    if flip: vs, uvs = vs[::-1], uvs[::-1]
    f = bm.faces.new([bm.verts.new(v) for v in vs]); f.material_index = mi
    for l, uv in zip(f.loops, uvs): l[uvl].uv = uv


def tube(name, pts, r, m, sides=4):
    """alambre: prisma de 'sides' lados por una polilinea"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); P = [Vector(p) for p in pts]; R = []
    for i, p in enumerate(P):
        t = (P[min(i + 1, len(P) - 1)] - P[max(i - 1, 0)]).normalized(); a = t.cross(Vector((0, 1, 0))).normalized(); b = t.cross(a)
        R.append([p + (a * math.cos(2 * math.pi * k / sides) + b * math.sin(2 * math.pi * k / sides)) * r for k in range(sides)])
    for A, B in zip(R[:-1], R[1:]):
        for k in range(sides):
            k2 = (k + 1) % sides; quad(bm, uvl, [A[k], A[k2], B[k2], B[k]], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
    return obj_from(bm, name, [m])


def ext(name, rw, h, w, d, mF, mE):
    """contorno por filas extruido d: frente y dorso con la foto, cantos con mE"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
    P = [((x0 - 0.5) * w, (x1 - 0.5) * w, v * h, x0, x1, v) for v, x0, x1 in rw]
    for a, b in zip(P[1:], P[:-1]):
        for y, flip in ((-d / 2, False), (d / 2, True)):
            vs = [(b[0], y, b[2]), (b[1], y, b[2]), (a[1], y, a[2]), (a[0], y, a[2])]; uv = [(b[3], b[5]), (b[4], b[5]), (a[4], a[5]), (a[3], a[5])]
            if flip: vs, uv = vs[::-1], uv[::-1]
            quad(bm, uvl, vs, uv, 0)
        for i, s in ((0, -1), (1, 1)):
            vs = [(b[i], -d / 2, b[2]), (b[i], d / 2, b[2]), (a[i], d / 2, a[2]), (a[i], -d / 2, a[2])]
            quad(bm, uvl, vs if s > 0 else vs[::-1], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    for row, s in ((P[0], 1), (P[-1], -1)):   # tapas de arriba/abajo
        vs = [(row[0], -d / 2, row[2]), (row[1], -d / 2, row[2]), (row[1], d / 2, row[2]), (row[0], d / 2, row[2])]
        quad(bm, uvl, vs if s > 0 else vs[::-1], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    return obj_from(bm, name, [mF, mE])


def shots(name, size, center, dist=6, top=False, wh=(512, 512)):
    """como render() de build.py; top=True: la vista 'frente' es cenital (foto del cuaderno)"""
    sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sh = sc.display.shading; sh.light = "FLAT"; sh.color_type = "TEXTURE"
    sc.render.resolution_x, sc.render.resolution_y = wh
    w = bpy.data.worlds.new("w"); sc.world = w; w.color = (0.08, 0.08, 0.09)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cx, cy, cz = center; fpos = (cx, cy - 0.001, cz + dist) if top else (cx, cy - dist, cz)
    for tag, pos, ortho in (("front", fpos, True), ("34", (cx + dist * 0.6, cy - dist * 0.75, cz + dist * 0.45), False)):
        cam.location = pos; d = Vector(center) - Vector(pos); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        cam.data.type = "ORTHO" if ortho else "PERSP"; cam.data.ortho_scale = size; cam.data.clip_start = dist * 0.01
        if not ortho: cam.data.angle = 2 * math.atan(size * 0.62 / d.length)
        sc.render.filepath = f"{H}/compare/{name}_{tag}.png"; bpy.ops.render.render(write_still=True)


def done(name, size, center, dist=6, top=False):
    export(name); shutil.copy(f"{H}/glb/{name}.glb", f"{ENG}/{name}.glb"); shots(name, size, center, dist, top)


# 1 BANERA: casco (faldon de la foto + borde), cuenco abierto (paredes + piso separado a 0.12 m), grifo cromado en -X
def bathtub():
    reset(); W, D, Ht = 1.52, 0.76, 0.50; X, Y = W / 2, D / 2
    mF, mR, mI, mC = mat("tub_front", "tub_front"), mat("tub_rim", "tub_rim"), mat("tub_inner", "tub_inner"), mat("chrome", "chrome")
    ox0, ox1, oy0, oy1 = -0.60, 0.68, -0.30, 0.28      # boca del cuenco (Blender y; frente = -y)
    fx0, fx1, fy0, fy1, fz = -0.52, 0.58, -0.22, 0.20, 0.12
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
    quad(bm, uvl, [(-X, -Y, 0), (X, -Y, 0), (X, -Y, Ht), (-X, -Y, Ht)], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
    for vs in ([(X, -Y, 0), (X, Y, 0), (X, Y, Ht), (X, -Y, Ht)], [(X, Y, 0), (-X, Y, 0), (-X, Y, Ht), (X, Y, Ht)], [(-X, Y, 0), (-X, -Y, 0), (-X, -Y, Ht), (-X, Y, Ht)]):
        quad(bm, uvl, vs, [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    O = [(-X, -Y), (X, -Y), (X, Y), (-X, Y)]; I = [(ox0, oy0), (ox1, oy0), (ox1, oy1), (ox0, oy1)]
    for k in range(4):   # borde: marco entre el contorno y la boca
        a, b = O[k], O[(k + 1) % 4]; c, d = I[(k + 1) % 4], I[k]
        quad(bm, uvl, [(*a, Ht), (*b, Ht), (*c, Ht), (*d, Ht)], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    obj_from(bm, "tub_body", [mF, mR])
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); F = [(fx0, fy0), (fx1, fy0), (fx1, fy1), (fx0, fy1)]
    for k in range(4):
        a, b = I[k], I[(k + 1) % 4]; c, d = F[(k + 1) % 4], F[k]
        quad(bm, uvl, [(*a, Ht), (*b, Ht), (*c, fz), (*d, fz)], [(0, 1), (1, 1), (1, 0), (0, 0)], 0)
    obj_from(bm, "basin_walls", [mI])
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
    quad(bm, uvl, [(fx0, fy0, fz), (fx1, fy0, fz), (fx1, fy1, fz), (fx0, fy1, fz)], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
    obj_from(bm, "basin_floor", [mat("tub_floor", "tub_floor")])
    fxx = -0.69
    cyl("faucet_riser", 0.022, 0.16, mC, 8, (fxx, 0, Ht + 0.08))
    cyl("faucet_spout", 0.018, 0.15, mC, 8, (fxx + 0.075, 0, 0.64), (0, math.pi / 2, 0))
    cyl("faucet_nozzle", 0.016, 0.04, mC, 8, (-0.545, 0, 0.625))
    for nm, yy in (("handle_hot", -0.13), ("handle_cold", 0.13)):
        cyl(nm, 0.026, 0.05, mC, 6, (fxx, yy, Ht + 0.025)); cyl(nm + "_lever", 0.008, 0.07, mC, 4, (fxx + 0.03, yy, Ht + 0.055), (0, math.pi / 2, 0))
    done("bathtub", 1.75, (0, 0, 0.32), 6)


# 2 BALDE naranja: loft 12 lados (silueta), pared interior + piso a 3 cm, asa de alambre con agarre
def bucket():
    reset(); h, w, S = 0.37, 0.30 / 0.982, 12; m, mi = mat("bucket", "bucket"), mat("bucket_in", "bucket_in")
    R = rings_from("bucket", h, w, S); bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); loft(bm, uvl, R, 0); disc(bm, uvl, R[0], 0.0, 1, True)
    top = R[-1]; inner = [(q[0] * 0.9, q[1] * 0.9, h, q[3], 1) for q in top]
    bot = [(q[0] * 0.82, q[1] * 0.82, 0.03, q[3], 0) for q in top]
    for k in range(S):   # labio superior y pared interior
        k2 = (k + 1) % S
        quad(bm, uvl, [top[k][:3], top[k2][:3], inner[k2][:3], inner[k][:3]], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
        quad(bm, uvl, [inner[k][:3], inner[k2][:3], bot[k2][:3], bot[k][:3]], [(0, 1), (1, 1), (1, 0), (0, 0)], 1)
    obj_from(bm, "bucket_body", [m, mi])
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); disc(bm, uvl, bot, 0.03, 0); obj_from(bm, "bucket_floor", [mi])
    # asa (plano del frente, como en la foto): orejas a 0.31 m, arco hasta 0.51 m
    px, pz, tz = 0.157, 0.312, 0.505
    pts = [(px * math.cos(t), 0, pz + (tz - pz) * math.sin(t) ** 0.8) for t in [math.pi * k / 8 for k in range(9)]]
    tube("handle_wire", pts, 0.003, mat("wire", None, (0.62, 0.63, 0.64)))
    cyl("handle_grip", 0.011, 0.08, mat("grip", "grip"), 6, (0, 0, tz + 0.002), (0, math.pi / 2, 0))
    done("bucket", 0.62, (0, 0, 0.26), 4)


# 3 HELADERA: caja con el frente de la foto
def fridge():
    reset(); mF, mS = mat("fridge_front", "fridge_front"), mat("fridge_side", "fridge_side")
    boxuv("fridge", 0.76, 1.70, 0.72, {"front": (0, FULL)}, [mF, mS]); done("fridge", 2.0, (0, 0, 0.85), 8)


# 4 COMODA: caja con el frente de la foto; tapa/costados con su madera
def dresser():
    reset(); mF, mW = mat("dresser_front", "dresser_front"), mat("dresser_wood", "dresser_wood")
    boxuv("dresser", 1.10, 0.95, 0.48, {"front": (0, FULL)}, [mF, mW]); done("dresser", 1.4, (0, 0, 0.47), 6)


# 5 CUADERNO abierto: tapa, dos bloques de hojas, page_L / page_R (UV 0..1 cada una) y espiral
def notebook():
    reset(); mC, mP, mL, mR, mS = mat("cover", None, (0.36, 0.33, 0.29)), mat("paper", None, (0.93, 0.93, 0.92)), mat("page_L", "page_L"), mat("page_R", "page_R"), mat("spiral", "spiral")
    boxuv("cover", 0.42, 0.002, 0.28, {}, [mC])
    PW, PD, gap, zt = 0.198, 0.272, 0.007, 0.0065
    for nm, x0, m in (("page_L", -gap - PW, mL), ("page_R", gap, mR)):
        boxuv(nm + "_stack", PW, zt - 0.0025, PD, {}, [mP], x=x0 + PW / 2, y=0.002)
        bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
        quad(bm, uvl, [(x0, -PD / 2, zt), (x0 + PW, -PD / 2, zt), (x0 + PW, PD / 2, zt), (x0, PD / 2, zt)], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
        obj_from(bm, nm, [m])
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); r, zc, bw = 0.0065, 0.0055, 0.0025
    for i in range(14):
        y = -0.125 + i * 0.25 / 13; C = [(r * 1.1 * math.cos(2 * math.pi * k / 6), r * math.sin(2 * math.pi * k / 6) + zc) for k in range(6)]
        for k in range(6):
            a, b = C[k], C[(k + 1) % 6]
            quad(bm, uvl, [(a[0], y - bw / 2, a[1]), (b[0], y - bw / 2, b[1]), (b[0], y + bw / 2, b[1]), (a[0], y + bw / 2, a[1])], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
    obj_from(bm, "spiral", [mS])
    done("notebook", 0.48, (0, 0, 0.005), 2, top=True)


# 6 LATA "BEANS": loft 10 lados + tapas; y la pila de 6 (3-2-1)
def can_obj(nm="can", loc=(0, 0, 0)):
    h, w, S = 0.11, 0.075 / 0.976, 10; m, mt = mat(nm, "can"), mat(nm + "_top", "can_top")
    R = rings_from("can", h, w, S, step=5); bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); loft(bm, uvl, R, 0)
    disc(bm, uvl, R[-1], h, 1); disc(bm, uvl, R[0], 0, 1, True); o = obj_from(bm, nm, [m, mt]); o.location = loc; return o


def cans():
    reset(); can_obj(); done("can", 0.14, (0, 0, 0.055), 2)
    reset(); h, dx = 0.11, 0.078
    for i, (x, z) in enumerate([(-dx, 0), (0, 0), (dx, 0), (-dx / 2, h), (dx / 2, h), (0, 2 * h)]): can_obj(f"can_{i}", (x, 0, z))
    done("cans_stack", 0.36, (0, 0, 0.165), 3)


# 7 TELEFONO: contorno redondeado de la foto extruido 8 mm + plano 'screen' (UV 0..1) a +4.5 mm del centro
def phone():
    reset(); W, Hp, Dp = 0.072, 0.15, 0.008; rw = [[v, x0 / 0.992, x1 / 0.992] for v, x0, x1 in rows("phone")]
    ext("phone_body", rw, Hp, W, Dp, mat("phone_front", "phone_front"), mat("phone_edge", None, (0.05, 0.05, 0.06)))
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); sw, sh, zc = 0.068, 0.145, Hp / 2
    quad(bm, uvl, [(-sw / 2, -0.0045, zc - sh / 2), (sw / 2, -0.0045, zc - sh / 2), (sw / 2, -0.0045, zc + sh / 2), (-sw / 2, -0.0045, zc + sh / 2)], [(0, 0), (1, 0), (1, 1), (0, 1)], 0)
    obj_from(bm, "screen", [mat("screen", None, (0.02, 0.03, 0.05))])
    done("phone", 0.19, (0, 0, 0.075), 1)


# 8 TABLON
def plank():
    reset(); mP, mE = mat("plank", "plank"), mat("plank_edge", "plank_edge")
    boxuv("plank", 1.0, 0.10, 0.025, {"front": (0, FULL), "back": (0, (1, 0, 0, 1))}, [mP, mE]); done("plank", 1.1, (0, 0, 0.05), 5)


bathtub(); bucket(); fridge(); dresser(); notebook(); cans(); phone(); plank()

# verificacion: bbox en coords GLB (x, y arriba, z frente) y triangulos
rep = []
for n in ["bathtub", "bucket", "fridge", "dresser", "notebook", "can", "cans_stack", "phone", "plank"]:
    reset(); bpy.ops.import_scene.gltf(filepath=f"{H}/glb/{n}.glb"); dg = bpy.context.evaluated_depsgraph_get(); P = []; tris = 0; names = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH": continue
        names.append(o.name); me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles)
        P += [o.matrix_world @ v.co for v in me.vertices]
    lo = [min(p[i] for p in P) for i in range(3)]; hi = [max(p[i] for p in P) for i in range(3)]
    rep.append(f"{n}: tris={tris} x[{lo[0]:.3f},{hi[0]:.3f}] y[{lo[2]:.3f},{hi[2]:.3f}] z[{-hi[1]:.3f},{-lo[1]:.3f}] parts={sorted(names)}")
open(H + "/glb/_report.txt", "w").write("\n".join(rep)); print("\n".join(rep))

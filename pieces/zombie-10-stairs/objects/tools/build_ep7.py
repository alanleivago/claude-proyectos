# ep7 (safe room) — blender -b -P tools/build_ep7.py : props PS1 desde foto aislada (metodo vlvt) -> glb/<name>.glb
# (+ copia en engine/models) y compare/<name>_front/_34.png. Texturas y siluetas: prep_ep7.py.
# Ejes Blender: X derecha, -Y = frente (en el GLB +Z), Z arriba; base en z=0. Tapas con pivote en la bisagra (chest_lid, kit_lid).
import bpy, bmesh, os, math, json, shutil
from mathutils import Vector
_T = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(_T, "build_ep6.py"), encoding="utf8").read().split("# 1 BANERA")[0].replace('exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.py")', 'exec(open(os.path.join(_T, "build.py")'))
ASP = json.load(open(f"{H}/rows/_aspect.json"))


def openbox(name, w, h, d, mF, mS, mIn, uvF=FULL):
    """caja sin tapa: frente con la foto, costados/dorso con mS, paredes interiores y fondo oscuros (se ve al abrir)"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); X, Y = w / 2, d / 2; u0, v0, u1, v1 = uvF; t = 0.02
    quad(bm, uvl, [(-X, -Y, 0), (X, -Y, 0), (X, -Y, h), (-X, -Y, h)], [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], 0)
    for vs in ([(X, -Y, 0), (X, Y, 0), (X, Y, h), (X, -Y, h)], [(X, Y, 0), (-X, Y, 0), (-X, Y, h), (X, Y, h)], [(-X, Y, 0), (-X, -Y, 0), (-X, -Y, h), (-X, Y, h)], [(-X, Y, 0), (X, Y, 0), (X, -Y, 0), (-X, -Y, 0)]):
        quad(bm, uvl, vs, [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    x, y = X - t, Y - t; O = [(-X, -Y), (X, -Y), (X, Y), (-X, Y)]; I = [(-x, -y), (x, -y), (x, y), (-x, y)]
    for k in range(4):
        a, b = O[k], O[(k + 1) % 4]; c, dd = I[(k + 1) % 4], I[k]
        quad(bm, uvl, [(*a, h), (*b, h), (*c, h), (*dd, h)], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)       # canto superior
        quad(bm, uvl, [(*I[(k + 1) % 4], h), (*I[k], h), (*I[k], t), (*I[(k + 1) % 4], t)], [(0, 1), (1, 1), (1, 0), (0, 0)], 2)   # pared interior
    quad(bm, uvl, [(-x, -y, t), (x, -y, t), (x, y, t), (-x, y, t)], [(0, 0), (1, 0), (1, 1), (0, 1)], 2)
    return obj_from(bm, name, [mF, mS, mIn])


def lid(name, w, h, d, hz, mF, mT, mIn, uvF=FULL):
    """tapa como caja cerrada con el origen en la bisagra (borde de atras, abajo) a la altura hz"""
    o = boxuv(name, w, h, d, {"front": (0, uvF), "top": (1, FULL), "left": (1, FULL), "right": (1, FULL), "back": (1, FULL), "bottom": (2, FULL)}, [mF, mT, mIn])
    for v in o.data.vertices: v.co.y -= d / 2
    o.location = (0, d / 2, hz); return o


def loftobj(name, tex, h, w, sides, top=None, bot=None, step=1):
    m = mat(name, tex); R = rings_from(tex, h, w, sides, step=step); bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); loft(bm, uvl, R, 0)
    mats = [m]
    for ring, z, col, flip in ((R[-1], h, top, False), (R[0], 0.0, bot, True)):
        if col is None: continue
        mats.append(mat(f"{name}_cap{len(mats)}", None, col)); disc(bm, uvl, ring, z, len(mats) - 1, flip)
    return obj_from(bm, name, mats)


# 1 BAUL (item box): cuerpo abierto + tapa con bisagra
def chest():
    reset(); W, D = 0.9, 0.5; Ht = W * ASP["chest"]; hb = Ht * 0.76
    mB, mS, mIn = mat("chest_body", "chest_body"), mat("chest_side", "chest_side"), mat("chest_in", None, (0.10, 0.07, 0.05))
    openbox("chest_body", W, hb, D, mB, mS, mIn)
    lid("chest_lid", W, Ht - hb, D, hb, mat("chest_lid", "chest_lid"), mS, mIn)
    done("chest", 1.1, (0, 0, Ht / 2), 6)


# 2 BOTIQUIN rojo: cuerpo (mitad baja de la foto) + tapa con la cruz y los cierres + manija
def kit():
    reset(); W, D = 0.36, 0.14; Ht = W * ASP["kit"]; hh = Ht * 0.22; hk = Ht - hh; hb = hk * 0.5   # manija = 22 % de arriba
    mF, mS, mIn = mat("kit_front", "kit_front"), mat("kit_side", "kit_side"), mat("kit_in", None, (0.85, 0.85, 0.82))
    fb = hb / Ht; fl = hk / Ht
    openbox("kit_body", W, hb, D, mF, mS, mIn, (0, 0, 1, fb))
    L_ = lid("kit_lid", W, hk - hb, D, hb, mF, mS, mIn, (0, fb, 1, fl))
    mR = mat("kit_red", None, (0.62, 0.06, 0.05))
    for nm, (w, h, x, z) in {"kit_h_top": (0.2, 0.025, 0, hh - 0.012), "kit_h_l": (0.025, hh, -0.0875, hh / 2), "kit_h_r": (0.025, hh, 0.0875, hh / 2)}.items():
        o = boxuv(nm, w, h, 0.03, {}, [mR]); o.parent = L_; o.location = (x, -D / 2, (hk - hb) + z - h / 2)
    done("kit", 0.45, (0, 0, Ht / 2), 3)


def charger():
    reset(); W, Hc, D = 0.075, 0.075 * ASP["charger"], 0.016
    boxuv("charger", W, Hc, D, {"front": (0, FULL)}, [mat("charger", "charger"), mat("charger_edge", None, (0.05, 0.05, 0.06))])
    done("charger", 0.2, (0, 0, Hc / 2), 2)


def spray():
    reset(); h = 0.19; loftobj("spray", "spray", h, h / ASP["spray"], 12, top=(0.9, 0.9, 0.9), bot=(0.6, 0.6, 0.62)); done("spray", 0.24, (0, 0, h / 2), 2)


def bandage():
    reset(); h = 0.10; loftobj("bandage", "bandage", h, h / ASP["bandage"], 12, top=(0.93, 0.92, 0.88), bot=(0.9, 0.9, 0.86)); done("bandage", 0.14, (0, 0, h / 2), 2)


def battery():
    reset(); h = 0.05; loftobj("battery", "battery", h, h / ASP["battery"], 8, top=(0.75, 0.7, 0.6), bot=(0.6, 0.6, 0.62)); done("battery", 0.07, (0, 0, h / 2), 1)


def flashlight():
    reset(); h = 0.16; loftobj("flashlight", "flashlight", h, h / ASP["flashlight"], 10, top=(0.85, 0.88, 0.9), bot=(0.08, 0.08, 0.09)); done("flashlight", 0.2, (0, 0, h / 2), 2)


def water():
    reset(); h = 0.28; loftobj("water", "water", h, h / ASP["water"], 8, top=(0.15, 0.35, 0.75), bot=(0.75, 0.8, 0.85)); done("water", 0.34, (0, 0, h / 2), 2)


chest(); kit(); charger(); spray(); bandage(); battery(); flashlight(); water()
rep = []
for n in ["chest", "kit", "charger", "spray", "bandage", "battery", "flashlight", "water"]:
    reset(); bpy.ops.import_scene.gltf(filepath=f"{H}/glb/{n}.glb"); dg = bpy.context.evaluated_depsgraph_get(); P = []; tris = 0; names = []
    for o in bpy.context.scene.objects:
        if o.type != "MESH": continue
        names.append(o.name); me = o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); tris += len(me.loop_triangles)
        P += [o.matrix_world @ v.co for v in me.vertices]
    lo = [min(p[i] for p in P) for i in range(3)]; hi = [max(p[i] for p in P) for i in range(3)]
    rep.append(f"{n}: tris={tris} x[{lo[0]:.3f},{hi[0]:.3f}] y[{lo[2]:.3f},{hi[2]:.3f}] z[{-hi[1]:.3f},{-lo[1]:.3f}] parts={sorted(names)}")
open(H + "/glb/_report.txt", "w").write("\n".join(rep)); print("\n".join(rep))

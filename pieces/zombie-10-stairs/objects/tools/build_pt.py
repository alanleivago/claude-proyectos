# ep5 (P.T.) — blender -b -P tools/build_pt.py : props PS1 desde foto (metodo vlvt) -> glb/<name>.glb + compare/pt_props_*.png
# Cajas con la foto rectificada (tex/*.png de prep_pt.py) y lofts por silueta (rows/*.json): farol 6 lados, lampara 8 lados,
# reloj de pared extruido. Usa los helpers de build.py (mat, boxuv, export, render).
import bpy, bmesh, os, math, json
from mathutils import Vector
exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "build.py"), encoding="utf8").read().split("\ndef car():")[0])
os.makedirs(H + "/glb", exist_ok=True); os.makedirs(H + "/compare", exist_ok=True)
FULL = (0, 0, 1, 1)
def rows(n): return json.load(open(f"{H}/rows/{n}.json"))

def revolve(name, tex, h, w, sides):
    """loft redondo: anillo por fila con el radio de la silueta; UV = la foto proyectada de frente"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); R = rows(name); m = mat(name, tex)
    rings = []
    for v, x0, x1 in R:
        r = max(0.004, (x1 - x0) / 2 * w); xc = (x0 + x1) / 2
        rings.append([(r * math.sin(a), -r * math.cos(a), v * h, xc + (x1 - x0) / 2 * math.sin(a), v) for a in [2 * math.pi * k / sides for k in range(sides)]])
    for A, B in zip(rings[1:], rings[:-1]):   # de arriba hacia abajo
        for k in range(sides):
            k2 = (k + 1) % sides; p = [B[k], B[k2], A[k2], A[k]]
            if all(abs(q[0]) < 1e-3 and abs(q[1]) < 1e-3 for q in p): continue
            quad(bm, uvl, [q[:3] for q in p], [q[3:] for q in p], 0)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    return obj_from(bm, name, [m])

def slab(name, tex, h, w, d):
    """objeto plano (reloj): contorno por filas extruido d; frente y dorso con la foto, cantos oscuros"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); R = rows(name); m = mat(name, tex); me = mat(name + "_edge", None, (0.12, 0.08, 0.06))
    P = [((x0 - 0.5) * w, (x1 - 0.5) * w, v * h, x0, x1, v) for v, x0, x1 in R if x1 - x0 > 0.02]
    for a, b in zip(P[1:], P[:-1]):
        for y, flip in ((-d / 2, False), (d / 2, True)):
            vs = [(b[0], y, b[2]), (b[1], y, b[2]), (a[1], y, a[2]), (a[0], y, a[2])]; uv = [(b[3], b[5]), (b[4], b[5]), (a[4], a[5]), (a[3], a[5])]
            if flip: vs, uv = vs[::-1], uv[::-1]
            quad(bm, uvl, vs, uv, 0)
        for i, s in ((0, -1), (1, 1)):
            vs = [(b[i], -d / 2, b[2]), (b[i], d / 2, b[2]), (a[i], d / 2, a[2]), (a[i], -d / 2, a[2])]
            quad(bm, uvl, vs if s > 0 else vs[::-1], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    return obj_from(bm, name, [m, me])

def one(name, build):
    reset(); build(); export(name)

wood = (0.16, 0.10, 0.06)
one("radio", lambda: boxuv("radio", 0.46, 0.23, 0.15, {"front": (0, FULL), "left": (1, FULL), "right": (1, FULL), "top": (2, FULL), "back": (2, FULL)},
                           [mat("radio_f", "radio_front"), mat("radio_s", "radio_side"), mat("radio_t", None, (0.2, 0.13, 0.08))]))
one("frame_photo", lambda: boxuv("frame_photo", 0.22, 0.22, 0.025, {"front": (0, FULL)}, [mat("fp", "frame_photo"), mat("fp_e", None, (0.55, 0.45, 0.2))]))
one("painting_a", lambda: boxuv("painting_a", 0.62, 0.52, 0.04, {"front": (0, FULL)}, [mat("pa", "painting_a"), mat("pa_e", None, wood)]))
one("painting_b", lambda: boxuv("painting_b", 0.46, 0.42, 0.04, {"front": (0, FULL)}, [mat("pb", "painting_b"), mat("pb_e", None, wood)]))
one("door_leaf", lambda: boxuv("door_leaf", 0.86, 2.02, 0.045, {"front": (0, FULL), "back": (0, (1, 0, 0, 1))}, [mat("dl", "door_leaf"), mat("dl_e", "door_jamb")]))
one("door_double", lambda: boxuv("door_double", 1.5, 2.25, 0.06, {"front": (0, FULL), "back": (0, (1, 0, 0, 1))}, [mat("dd", "door_double"), mat("dd_e", None, wood)]))
one("crt", lambda: boxuv("crt", 0.56, 0.46, 0.46, {"front": (0, FULL)}, [mat("crt_f", "crt_front"), mat("crt_s", "crt_side")], taper=(0.36, 0.3)))
one("dresser", lambda: boxuv("dresser", 1.25, 0.86, 0.45, {"front": (0, FULL), "top": (1, FULL), "left": (1, FULL), "right": (1, FULL), "back": (1, FULL)},
                             [mat("dr_f", "dresser_front"), mat("dr_t", "dresser_top")]))
one("side_table", lambda: boxuv("side_table", 0.5, 0.66, 0.4, {"front": (0, (0.0, 0.0, 0.33, 1.0)), "top": (1, FULL), "left": (1, FULL), "right": (1, FULL), "back": (1, FULL)},
                                [mat("st_f", "dresser_front"), mat("st_t", "dresser_top")]))
one("lantern", lambda: revolve("lantern", "lantern", 0.55, 0.55 * 0.495, 6))
one("table_lamp", lambda: revolve("table_lamp", "table_lamp", 0.58, 0.58 * 0.489, 8))
one("wall_clock", lambda: slab("wall_clock", "wall_clock", 0.8, 0.8 * 0.59, 0.1))

# hoja de comparacion: todos en fila, frente y 3/4
reset()
for i, n in enumerate(["radio", "frame_photo", "painting_a", "door_leaf", "door_double", "crt", "dresser", "lantern", "table_lamp", "wall_clock"]):
    bpy.ops.import_scene.gltf(filepath=f"{H}/glb/{n}.glb")
    for o in bpy.context.selected_objects:
        if o.parent is None: o.location.x += [0, 0.6, 1.05, 1.9, 3.0, 4.3, 5.4, 6.45, 6.9, 7.4][i]
render("pt_props", 8.4, (3.7, 0, 1.1), dist=12, wh=(1400, 420))

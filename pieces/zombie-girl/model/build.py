# Construye la heroina low poly (metodo del tutorial: anillos sobre la hoja 3) -> out/heroine_mesh.blend
# blender -b --python build.py
import bpy, bmesh, json, math, os
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
P = json.load(open(os.path.join(HERE, 'profiles.json')))
S = P['scale']
SOLE, CX, CS = 717, 291.5, 690
def z(y): return (SOLE - y) * S
def sy(px): return (px - CS) * S

def interp(rows, key, y):
    rows = sorted(rows, key=lambda r: r['y'])
    for a, b in zip(rows, rows[1:]):
        if a['y'] <= y <= b['y']:
            t = (y - a['y']) / max(1e-6, b['y'] - a['y'])
            return a[key] + (b[key] - a[key]) * t
    return rows[0][key] if y < rows[0]['y'] else rows[-1][key]

def sgnpow(v, p): return math.copysign(abs(v) ** p, v)

def ring_pt(phi, xc, hw, yf, yb, zz, p=0.75):
    """phi grados: 0 = frente (-Y), 90 = derecha del personaje (-X), 180 = atras."""
    s, c = math.sin(math.radians(phi)), math.cos(math.radians(phi))
    ym = (yf + yb) / 2
    x = xc - hw * sgnpow(s, p)
    y = ym - (ym - yf) * abs(c) ** p if c >= 0 else ym + (yb - ym) * abs(c) ** p
    return Vector((x, y, zz))

verts, faces = [], []
def add(v): verts.append(v); return len(verts) - 1
def bridge(a, b):           # dos anillos (listas de indices) del mismo tamano, cerrados
    n = len(a)
    for i in range(n): faces.append((a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]))
def bridge_open(a, b):
    for i in range(len(a) - 1): faces.append((a[i], a[i + 1], b[i + 1], b[i]))
def cap(r): faces.append(tuple(r))

# ---------------- torso (12 por anillo) ----------------
T = P['torso']
MANUAL = {  # filas tapadas por brazos / pelo / puno en el perfil: medidas a ojo sobre la hoja
    192: dict(hw=0.062, yf=sy(662), yb=sy(712)),
    204: dict(hw=0.140, yf=sy(650), yb=sy(726)),
    220: dict(hw=0.160, yf=sy(640), yb=sy(730)),
    236: dict(hw=0.158, yf=sy(636), yb=sy(731)),
}
TROWS = [192, 204, 220, 236, 252, 268, 284, 289, 294, 302, 318, 334, 350, 366, 382, 398]
INDENT_F = {252: 0.014, 268: 0.010}            # entre los pechos
INDENT_B = {350: 0.012, 366: 0.016, 382: 0.014}  # raya de los gluteos
torso = []
for y in TROWS:
    if y in MANUAL: m = MANUAL[y]; hw, yf, yb = m['hw'], m['yf'], m['yb']
    else: hw, yf, yb = interp(T, 'hw', y), interp(T, 'yf', y), interp(T, 'yb', y)
    r = []
    for i in range(12):
        v = ring_pt(i * 30, 0, hw, yf, yb, z(y))
        if i == 0: v.y += INDENT_F.get(y, 0)
        if i == 6: v.y -= INDENT_B.get(y, 0)
        r.append(add(v))
    torso.append(r)
for a, b in zip(torso, torso[1:]): bridge(a, b)
cap(list(reversed(torso[0])))   # tapa del cuello (queda dentro del cuello)

# ---------------- piernas (8 por anillo) ----------------
L = P['leg']
crotch = torso[-1]
C = add(Vector((0, (crotch[0] and verts[crotch[0]].y + verts[crotch[6]].y) / 2, z(406))))
LROWS = [412, 430, 452, 474, 494, 506, 520, 552, 590, 630, 660, 680, 696, 708, 716]
PHI = [-40, 0, 45, 90, 135, 180, 220, 270]
def leg_rings(side):
    m = 1 if side == 'R' else -1
    first = [crotch[i if side == 'R' else (12 - i) % 12] for i in range(7)] + [C]
    rings = [first]
    for y in LROWS:
        x0, x1 = interp(L, 'x0', y), interp(L, 'x1', y)
        xc, hw = (x0 + x1) / 2, (x1 - x0) / 2
        yf, yb = interp(L, 'yf', y), interp(L, 'yb', y)
        if y >= 680:   # pie: el centro del anillo se adelanta con la puntera
            pass
        r = []
        for ph in PHI:
            v = ring_pt(ph, xc, hw, yf, yb, z(y))
            v.x *= m
            r.append(add(v))
        rings.append(r)
    for a, b in zip(rings, rings[1:]): bridge(a, b)
    cap(rings[-1])
for s in 'RL': leg_rings(s)

# ---------------- brazos (6 por anillo, a lo largo de X) ----------------
A = sorted(P['arm'], key=lambda r: r['x'])
def arm_at(x):
    rows = A
    for a, b in zip(rows, rows[1:]):
        if a['x'] <= x <= b['x']:
            t = (x - a['x']) / (b['x'] - a['x'])
            return a['z0'] + (b['z0'] - a['z0']) * t, a['z1'] + (b['z1'] - a['z1']) * t
    return rows[0]['z0'], rows[0]['z1']
AX = [-0.12, -0.19, -0.27, -0.35, -0.40, -0.47, -0.55, -0.60]
ARM_Y = sy(683)
def arm(side):
    m = 1 if side == 'R' else -1
    rings = []
    for x in AX:
        z0, z1 = arm_at(x)
        if x > -0.2: z0, z1 = z(234), z(206)          # hombro: tapado por el torso
        zc, rz = (z0 + z1) / 2, (z1 - z0) / 2
        ry = rz * 0.92
        r = []
        for k in range(6):
            a = math.radians(k * 60)
            r.append(add(Vector((x * m, ARM_Y - ry * math.cos(a), zc + rz * math.sin(a)))))
        rings.append(r)
    for a, b in zip(rings, rings[1:]): bridge(a, b)
    cap(list(reversed(rings[0])));
    # mano: puno en bloque (mitón) + pulgar
    w = rings[-1]
    x0, x1 = -0.60, -0.712
    zc = z(222)
    box = [Vector((x1 * m, ARM_Y + dy, zc + dz)) for dy, dz in
           [(-0.042, 0.0), (-0.030, 0.042), (0.030, 0.042), (0.042, 0.0), (0.030, -0.040), (-0.030, -0.040)]]
    # anillo intermedio de nudillos
    mid = [Vector(((x0 + (x1 - x0) * 0.55) * m, ARM_Y + v.y * 1.08, zc + (v.z - zc) * 1.05)) for v in box]
    rm = [add(v) for v in mid]; re = [add(v) for v in box]
    bridge(w, rm); bridge(rm, re); cap(re)
    # pulgar: cuna delante del puno
    t0 = add(Vector(((x0 - 0.02) * m, ARM_Y - 0.045, zc + 0.01)))
    t1 = add(Vector(((x0 - 0.055) * m, ARM_Y - 0.052, zc - 0.005)))
    t2 = add(Vector(((x0 - 0.03) * m, ARM_Y - 0.040, zc - 0.030)))
    faces.extend([(t0, t1, t2)])
for s in 'RL': arm(s)

# ---------------- cuello ----------------
neck = []
for y in (200, 182, 168):
    r = []
    for k in range(8):
        a = math.radians(k * 45)
        r.append(add(Vector((-0.046 * math.sin(a), sy(684) - 0.05 * math.cos(a), z(y)))))
    neck.append(r)
for a, b in zip(neck, neck[1:]): bridge(a, b)

body = (verts[:], faces[:])

# ---------------- cabeza (10 por anillo) ----------------
verts, faces = [], []
HEAD = [  # y, hw, frente px, atras px, extra al centro delantero (nariz/menton) en m
    (176, 0.030, 662, 690, 0.000),
    (168, 0.056, 655, 708, 0.004),
    (158, 0.070, 650, 720, 0.000),
    (146, 0.077, 646, 727, 0.010),
    (134, 0.082, 648, 732, 0.000),
    (122, 0.085, 650, 735, 0.000),
    (104, 0.083, 653, 736, 0.000),
    (86,  0.071, 664, 728, 0.000),
    (73,  0.042, 682, 714, 0.000),
]
hr = []
for y, hw, f, b, nose in HEAD:
    r = []
    for i in range(10):
        v = ring_pt(i * 36, 0, hw, sy(f), sy(b), z(y), p=0.8)
        if i == 0: v.y -= nose
        r.append(add(v))
    hr.append(r)
for a, b in zip(hr, hr[1:]): bridge(a, b)
top = add(Vector((0, sy(698), z(68))))
for i in range(10): faces.append((hr[-1][i], hr[-1][(i + 1) % 10], top))
cap(list(reversed(hr[0])))
head = (verts[:], faces[:])

# ---------------- pelo (cascaron) ----------------
verts, faces = [], []
# filas cerradas arriba (flequillo), abiertas en U abajo para dejar la cara libre
HAIR = [  # y, hw, frente px, atras px, abierto?
    (67,  0.050, 680, 718, False),
    (76,  0.092, 657, 735, False),
    (92,  0.110, 645, 744, False),
    (110, 0.118, 641, 748, False),
    (128, 0.122, 668, 749, True),
    (150, 0.127, 676, 751, True),
    (172, 0.134, 682, 752, True),
    (192, 0.140, 690, 751, True),
    (210, 0.138, 698, 747, True),
    (228, 0.118, 708, 740, True),
]
rings = []
for y, hw, f, b, open_ in HAIR:
    angs = [i * 30 for i in range(12)] if not open_ else [50 + i * 26 for i in range(11)]  # 50..310
    r = []
    for a in angs:
        v = ring_pt(a, 0, hw, sy(f), sy(b), z(y), p=0.7)
        r.append(add(v))
    rings.append((r, open_))
for (a, oa), (b, ob) in zip(rings, rings[1:]):
    if not oa and not ob: bridge(a, b)
    elif oa and ob: bridge_open(a, b)
    else:  # cerrado(12) -> abierto(11): usar los 11 verts traseros del cerrado (indices 2..10 + extremos)
        sel = [a[k] for k in (2, 3, 4, 5, 6, 7, 8, 9, 10)]
        sel = [a[1]] + sel + [a[11]]
        bridge_open(sel, b)
crown = add(Vector((0, sy(700), z(64))))
r0 = rings[0][0]
for i in range(12): faces.append((r0[i], r0[(i + 1) % 12], crown))
hair = (verts[:], faces[:])

# ---------------- objetos ----------------
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
def make(name, data):
    vs, fs = data
    me = bpy.data.meshes.new(name); me.from_pydata([tuple(v) for v in vs], [], fs); me.update()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = False
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    return ob
obs = [make('Body', body), make('Head', head), make('Hair', hair)]
tris = 0
for ob in obs:
    t = sum(len(p.vertices) - 2 for p in ob.data.polygons); tris += t
    print('OBJ', ob.name, len(ob.data.vertices), 'v', t, 'tris')
print('TOTAL TRIS', tris)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'out', 'heroine_mesh.blend'))

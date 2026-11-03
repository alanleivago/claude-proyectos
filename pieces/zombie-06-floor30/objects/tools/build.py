# Blender (blender -b -P tools/build.py): props PS1 desde foto (metodo vlvt). Malla por silueta/loft, UV planar con la
# foto rectificada (tex/*.png, 128 px, 32 colores, Closest) -> glb/<name>.glb + compare/<name>_front.png / _34.png
import bpy, bmesh, os, math
from mathutils import Vector
H = os.path.dirname(os.path.abspath(__file__)) + "/.."; TEX = H + "/tex/"


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, tex=None, rgb=(0.5, 0.5, 0.5)):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree
    b = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    b.inputs["Roughness"].default_value = 1.0
    for k in ("Specular IOR Level", "Specular"):
        if k in b.inputs: b.inputs[k].default_value = 0.0
    if tex:
        im = bpy.data.images.load(TEX + tex + ".png"); t = nt.nodes.new("ShaderNodeTexImage"); t.image = im; t.interpolation = "Closest"
        nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    else:   # color liso como imagen de 4x4 (Workbench TEXTURE y el GLB lo leen igual)
        im = bpy.data.images.new(name + "_c", 4, 4); im.pixels = [*rgb, 1] * 16; im.filepath_raw = f"{H}/tex/_solid_{name}.png"; im.file_format = "PNG"; im.save()
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = im; t.interpolation = "Closest"; nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    return m


def obj_from(bm, name, mats):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(o)
    for m in mats: me.materials.append(m)
    return o


def quad(bm, uvl, vs, uvs, mi):
    f = bm.faces.new([bm.verts.new(v) for v in vs]); f.material_index = mi
    for l, uv in zip(f.loops, uvs): l[uvl].uv = uv
    return f


def boxuv(name, w, h, d, faces, mats, x=0, y=0, z=0, taper=None):
    """caja: w ancho (X), h alto (Blender Z), d fondo (Blender Y; el frente mira a -Y). faces: nombre -> (mat, (u0,v0,u1,v1))"""
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new()
    tw, td = taper or (w, d); X, Y = w / 2, d / 2; tX, tY = tw / 2, td / 2
    B = [(-X, -Y, 0), (X, -Y, 0), (X, Y, 0), (-X, Y, 0)]; T = [(-tX, -tY, h), (tX, -tY, h), (tX, tY, h), (-tX, tY, h)]
    F = {"front": [B[0], B[1], T[1], T[0]], "back": [B[2], B[3], T[3], T[2]], "right": [B[1], B[2], T[2], T[1]],
         "left": [B[3], B[0], T[0], T[3]], "top": [T[0], T[1], T[2], T[3]], "bottom": [B[3], B[2], B[1], B[0]]}
    for k, vs in F.items():
        mi, (u0, v0, u1, v1) = faces.get(k, (len(mats) - 1, (0, 0, 1, 1)))
        quad(bm, uvl, vs, [(u0, v0), (u1, v0), (u1, v1), (u0, v1)], mi)
    o = obj_from(bm, name, mats); o.location = (x, z, y); return o


def cyl(name, r, L, m, sides=6, loc=(0, 0, 0), rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=sides, radius=r, depth=L, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.data.materials.append(m); return o


def export(name):
    for o in bpy.context.scene.objects: o.select_set(o.type == "MESH")
    bpy.ops.export_scene.gltf(filepath=f"{H}/glb/{name}.glb", export_format="GLB", use_selection=True, export_apply=True, export_yup=True)


def render(name, size, center, dist=10, wh=(512, 512)):
    sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sh = sc.display.shading
    sh.light = "FLAT"; sh.color_type = "TEXTURE"
    sc.render.resolution_x, sc.render.resolution_y = wh
    w = bpy.data.worlds.new("w"); sc.world = w; w.color = (0.08, 0.08, 0.09)
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cx, cy, cz = center
    for tag, pos, ortho in (("front", (cx, cy - dist, cz), True), ("34", (cx + dist * 0.6, cy - dist * 0.75, cz + dist * 0.3), False)):
        cam.location = pos; d = Vector(center) - Vector(pos); cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        cam.data.type = "ORTHO" if ortho else "PERSP"; cam.data.ortho_scale = size
        if not ortho: cam.data.angle = 2 * math.atan(size * 0.62 / d.length)
        sc.render.filepath = f"{H}/compare/{name}_{tag}.png"; bpy.ops.render.render(write_still=True)


def car():
    """vagon: loft de 6 lados a lo largo (seccion medida en la silueta frontal: costados rectos, techo achaflanado)"""
    reset(); W, Hc, L = 3.05, 3.3, 15.5
    mF, mS, mD, mR = mat("car_front", "car_front"), mat("car_side", "car_side"), mat("car_door", "car_side"), mat("car_roof", None, (0.32, 0.33, 0.35))
    sec = [(-W / 2, 0), (W / 2, 0), (W / 2, Hc * 0.84), (W * 0.36, Hc), (-W * 0.36, Hc), (-W / 2, Hc * 0.84)]
    bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); rep = L / 2.6
    for i in range(1, 6):
        a, b = sec[i], sec[(i + 1) % 6]
        vs = [(a[0], 0, a[1]), (b[0], 0, b[1]), (b[0], L, b[1]), (a[0], L, a[1])]
        if i in (1, 5):
            v0, v1 = a[1] / (Hc * 0.84), b[1] / (Hc * 0.84)
            quad(bm, uvl, vs, [(0, v0), (0, v1), (rep, v1), (rep, v0)], 1)
        else:
            quad(bm, uvl, vs, [(0, 0), (1, 0), (1, 1), (0, 1)], 3)
    for yy, flip in ((0, False), (L, True)):
        vs = [(x, yy, z) for x, z in sec]; uvs = [((x + W / 2) / W, z / Hc) for x, z in sec]
        if flip: vs, uvs = vs[::-1], uvs[::-1]
        f = bm.faces.new([bm.verts.new(v) for v in vs]); f.material_index = 0
        for l, uv in zip(f.loops, uvs): l[uvl].uv = uv
    o = obj_from(bm, "car_body", [mF, mS, mD, mR]); o.location = (0, 0, 0.35)
    for k, yy in enumerate((2.6, 6.4, 10.2, 14.0)):
        for side, sx in (("R", W / 2 + 0.02), ("L", -W / 2 - 0.02)):
            for leaf, dy in (("a", -0.32), ("b", 0.32)):
                boxuv(f"door_{side}{k}{leaf}", 0.03, 2.0, 0.64, {"right": (0, (0.35, 0.05, 0.75, 0.62)), "left": (0, (0.35, 0.05, 0.75, 0.62))},
                      [mD, mR], x=sx, y=0.5, z=yy + dy)
    mW = mat("wheel", None, (0.07, 0.07, 0.07))
    for yy in (2.0, 3.6, 11.9, 13.5):
        for sx in (-1.1, 1.1): cyl("wheel", 0.43, 0.15, mW, 8, (sx, yy, 0.0), (0, math.pi / 2, 0))
    boxuv("skirt", W * 0.9, 0.35, L - 1.0, {}, [mW], y=0.0, z=L / 2)
    export("subway_car"); render("subway_car", 4.2, (0, 0, 1.9), 20)


def turnstile():
    reset(); mF, mS, mM = mat("turn_front", "turn_front"), mat("turn_side", "turn_side"), mat("steel", None, (0.55, 0.56, 0.58))
    # silueta lateral de la foto: arriba mas largo (1.30) que abajo (1.05) -> loft de 2 anillos
    boxuv("cabinet", 0.26, 1.02, 1.05, {"front": (0, (0, 0, 1, 1)), "back": (0, (0, 0, 1, 1)), "left": (1, (0, 0, 1, 1)), "right": (1, (0, 0, 1, 1))},
          [mF, mS, mM], taper=(0.26, 1.30))
    cyl("hub", 0.09, 0.10, mM, 8, (-0.17, 0, 0.86), (0, math.pi / 2, 0))
    for k, dv in enumerate((Vector((-1, 0, 0)), Vector((-0.4, -0.45, -0.8)).normalized(), Vector((-0.4, 0.45, -0.8)).normalized())):   # tripode (foto: un brazo horizontal cruzando el paso, dos hacia abajo)
        L = 0.5; o = cyl(f"arm{k}", 0.025, L, mM, 6, Vector((-0.2, 0, 0.86)) + dv * L / 2)
        o.rotation_mode = "QUATERNION"; o.rotation_quaternion = dv.to_track_quat("Z", "Y")
    export("turnstile"); render("turnstile", 1.8, (0, 0, 0.6), 8)


def ticketm():
    reset(); mF, mS, mT = mat("ticket_front", "ticket_front"), mat("ticket_side", "ticket_side"), mat("tm_top", None, (0.42, 0.43, 0.45))
    boxuv("ticket_machine", 0.95, 1.76, 0.6, {"front": (0, (0, 0, 1, 1)), "left": (1, (0, 0, 1, 1)), "right": (1, (0, 0, 1, 1)), "back": (1, (0, 0, 1, 1))}, [mF, mS, mT])
    export("ticket_machine"); render("ticket_machine", 2.2, (0, 0, 0.88), 8)


def clock():
    reset(); mF, mS = mat("clock_front", "clock_front"), mat("clock_side", "clock_side")
    boxuv("clock", 0.92, 0.40, 0.16, {"front": (0, (0, 0, 1, 1)), "back": (0, (0, 0, 1, 1)), "left": (1, (0, 0, 1, 1)), "right": (1, (0, 0, 1, 1))}, [mF, mS])
    cyl("rod", 0.015, 0.5, mS, 6, (-0.3, 0, 0.65)); cyl("rod2", 0.015, 0.5, mS, 6, (0.3, 0, 0.65))
    export("platform_clock"); render("platform_clock", 1.3, (0, 0, 0.35), 6)


def phone(rows):
    """loft por filas de la silueta de la foto (esquinas redondeadas), extruido 9 mm"""
    reset(); mF, mB = mat("phone_front", "phone_front"), mat("phone_back", None, (0.03, 0.03, 0.035))
    Wp, Hp, Dp = 0.075, 0.158, 0.009; bm = bmesh.new(); uvl = bm.loops.layers.uv.new(); F, Bk = [], []
    for v, wr in rows:
        z = v * Hp; x = wr * Wp / 2; F.append(((-x, -Dp / 2, z), (x, -Dp / 2, z), v, wr)); Bk.append(((-x, Dp / 2, z), (x, Dp / 2, z)))
    for i in range(len(rows) - 1):
        (a0, a1, va, wa), (b0, b1, vb, wb) = F[i], F[i + 1]
        quad(bm, uvl, [a0, a1, b1, b0], [(0.5 - wa / 2, va), (0.5 + wa / 2, va), (0.5 + wb / 2, vb), (0.5 - wb / 2, vb)], 0)
        c0, c1 = Bk[i]; d0, d1 = Bk[i + 1]
        quad(bm, uvl, [c1, c0, d0, d1], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
        quad(bm, uvl, [a1, c1, d1, b1], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
        quad(bm, uvl, [c0, a0, b0, d0], [(0, 0), (1, 0), (1, 1), (0, 1)], 1)
    obj_from(bm, "phone", [mF, mB]); export("phone"); render("phone", 0.2, (0, 0, Hp / 2), 1)


def sign():
    reset(); mF, mS = mat("sign_front", "sign_front"), mat("sign_edge", None, (0.12, 0.14, 0.32))
    boxuv("sign", 2.2, 0.41, 0.04, {"front": (0, (0, 0, 1, 1)), "back": (0, (0, 0, 1, 1))}, [mF, mS])
    export("station_sign"); render("station_sign", 2.4, (0, 0, 0.2), 6)


def bench():
    """banco de anden: tablones (respaldo y asiento de la foto) sobre 3 patas de hierro negro con apoyabrazos"""
    reset(); mB, mS, mI = mat("bench_back", "bench_back"), mat("bench_seat", "bench_seat"), mat("iron", None, (0.05, 0.05, 0.055))
    boxuv("seat", 2.0, 0.05, 0.42, {"top": (1, (0, 0, 1, 1)), "front": (1, (0, 0, 1, 0.3)), "back": (1, (0, 0, 1, 0.3))}, [mB, mS, mI], y=0.43)
    o = boxuv("backrest", 2.0, 0.30, 0.04, {"front": (0, (0, 0, 1, 1)), "back": (0, (0, 0, 1, 1))}, [mB, mS, mI], y=0.52, z=0.2); o.rotation_euler.x = math.radians(-12)
    for x in (-0.95, 0, 0.95):
        boxuv("leg", 0.05, 0.43, 0.06, {}, [mI], x=x, y=0, z=-0.12); boxuv("leg2", 0.05, 0.43, 0.06, {}, [mI], x=x, y=0, z=0.14)
        boxuv("arm", 0.05, 0.04, 0.46, {}, [mI], x=x, y=0.66, z=0.0) if x else None
        boxuv("post", 0.04, 0.34, 0.04, {}, [mI], x=x, y=0.45, z=0.22)
    export("bench"); render("bench", 2.4, (0, 0, 0.4), 8)


car(); bench(); turnstile(); ticketm(); clock(); sign()
phone([tuple(map(float, l.split())) for l in open(TEX + "phone_rows.txt")])

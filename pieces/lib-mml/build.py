"""lib-mml / build.py
Importa los modelos PS1 (Megaman Legends) de assets/mm12-extracted, los limpia,
los escala a metros reales y exporta un GLB por modelo.

Uso (Blender en segundo plano, escena vacia):
  "C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe" -b --factory-startup --python build.py

Salida:
  models/<id>.glb          (textura original embebida)
  textures/<tex>_orig.png  (copia de la textura original)
  data/uv_<id>.json        (triangulos UV + hueso por cara, lo usa recolor.py)
  data/stats.json          (tris, medidas, huesos...)

Blender 5.x ya no trae importador COLLADA, asi que los .dae se leen con un
parser propio (skin rigido de 1 hueso por vertice, joints solo con traslacion,
sin animaciones).
"""
import bpy, bmesh, json, os, shutil, sys
import xml.etree.ElementTree as ET
from mathutils import Matrix, Vector

SRC = r"F:\Claude Proyectos\assets\mm12-extracted"
OUT = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(OUT, "models"), exist_ok=True)
os.makedirs(os.path.join(OUT, "textures"), exist_ok=True)
os.makedirs(os.path.join(OUT, "data"), exist_ok=True)

# size: ("height", m) | ("length", m)  (length = extension en Y, el eje adelante/atras)
#       ("factor_of", id)  -> reutiliza el factor de escala de otro modelo (misma escala del juego)
# rot_z: giro (grados) para que el modelo mire a -Y en Blender (= +Z en three.js)
MODELS = [
    dict(id="frog", src="Animals - Frog/Frog", fmt="dae", tex="frog", size=("length", 0.08), rot_z=0),
    dict(id="hawk", src="Animals - Hawk/Hawk", fmt="dae", tex="hawk", size=("length", 0.5), rot_z=0),
    dict(id="hound", src="Animals - Old City Hound/Old_City_Hound", fmt="dae", tex="hound", size=("height", 0.7), rot_z=0),
    dict(id="seagull", src="Animals - Seagull/Seagull", fmt="dae", tex="seagull", size=("length", 0.4), rot_z=0),
    dict(id="bank_teller", src="Non-Playable Characters - Bank Teller/Bank_Teller", fmt="dae", tex="bank_teller", size=("height", 1.65), rot_z=0),
    dict(id="art_student", src="Non-Playable Characters - Art School Student/Art_School_Student", fmt="dae", tex="art_student", size=("factor_of", "bank_teller"), rot_z=0),
    dict(id="homework_girl", src="Non-Playable Characters - Homework Girl/Homework_Girl", fmt="dae", tex="homework_girl", size=("factor_of", "bank_teller"), rot_z=0),
    dict(id="old_woman_sitting", src="Non-Playable Characters - Sitting Old Woman/Sitting_Old_Woman", fmt="dae", tex="old_woman_sitting", size=("factor_of", "bank_teller"), rot_z=0),
    dict(id="trashcan", src="Objects - Trash Can/PS1-MegaManLegends-TrashCan/PS1-MegaManLegends-TrashCan", fmt="obj", tex="trashcan", size=("height", 0.9), rot_z=0),
    dict(id="trashcan_open", src="Objects - Trash Can/PS1-MegaManLegends-TrashCan-Open/PS1-MegaManLegends-TrashCan-Open", fmt="obj", tex="trashcan", size=("factor_of", "trashcan"), rot_z=0),
    dict(id="trashcan_lid", src="Objects - Trash Can/PS1-MegaManLegends-TrashCan-Lid/PS1-MegaManLegends-TrashCan-Lid", fmt="obj", tex="trashcan", size=("factor_of", "trashcan"), rot_z=0),
    dict(id="red_car", src="Vehicles - Red Car/PS1-MegaManLegends-RedCar", fmt="obj", tex="red_car", size=("length", 4.2), rot_z=0),
    dict(id="mini_red_car", src="Vehicles - Mini Red Car/PS1-MegaManLegends-RedMiniCar", fmt="obj", tex="mini_red_car", size=("length", 3.8), rot_z=0),
    dict(id="blue_pickup", src="Vehicles - Blue Pickup/PS1-MegaManLegends-BluePickupCar", fmt="obj", tex="blue_pickup", size=("length", 5.0), rot_z=0),
    dict(id="yellow_pickup", src="Vehicles - Yellow Pickup/PS1-MegaManLegends-YellowPickupCar", fmt="obj", tex="yellow_pickup", size=("factor_of", "blue_pickup"), rot_z=0),
]
ONLY = [a for a in sys.argv[sys.argv.index("--") + 1:]] if "--" in sys.argv else []


def strip(tag):
    return tag.split("}")[-1]


def children(el, name):
    return [c for c in el if strip(c.tag) == name]


def find(el, name):
    for c in el.iter():
        if strip(c.tag) == name:
            return c
    return None


def floats(el):
    return [float(x) for x in el.text.split()]


def ints(el):
    return [int(x) for x in el.text.split()]


# DAE (Y-up, diestro) -> Blender (Z-up): conversion estandar (x, -z, y). Los .dae quedan
# los .dae ya quedan mirando a -Y (adelante).
def dae_to_bl(v):
    return Vector((v[0], -v[2], v[1]))


def node_local(node):
    m = Matrix.Identity(4)
    for c in node:
        t = strip(c.tag)
        if t == "translate":
            m = m @ Matrix.Translation(Vector(floats(c)))
        elif t == "rotate":
            a = floats(c)
            m = m @ Matrix.Rotation(__import__("math").radians(a[3]), 4, Vector(a[:3]))
        elif t == "scale":
            s = floats(c)
            m = m @ Matrix.Diagonal(Vector((s[0], s[1], s[2], 1)))
        elif t == "matrix":
            f = floats(c)
            m = m @ Matrix([f[0:4], f[4:8], f[8:12], f[12:16]])
    return m


def parse_dae(path):
    root = ET.parse(path).getroot()
    srcs = {}
    for s in root.iter():
        if strip(s.tag) == "source":
            fa = find(s, "float_array")
            na = find(s, "Name_array")
            acc = find(s, "accessor")
            stride = int(acc.get("stride", "1")) if acc is not None else 1
            if fa is not None:
                srcs[s.get("id")] = (floats(fa), stride)
            elif na is not None:
                srcs[s.get("id")] = (na.text.split(), 1)
    mesh = find(root, "mesh")
    verts_el = children(mesh, "vertices")[0]
    pos_id = children(verts_el, "input")[0].get("source")[1:]
    pl = children(mesh, "polylist")[0]
    inputs = {i.get("semantic"): (int(i.get("offset")), i.get("source")[1:]) for i in children(pl, "input")}
    nstride = max(o for o, _ in inputs.values()) + 1
    vcount = ints(children(pl, "vcount")[0])
    p = ints(children(pl, "p")[0])
    P, _ = srcs[pos_id]
    positions = [P[i:i + 3] for i in range(0, len(P), 3)]
    N, _ = srcs[inputs["NORMAL"][1]]
    normals = [N[i:i + 3] for i in range(0, len(N), 3)]
    T, _ = srcs[inputs["TEXCOORD"][1]]
    uvs = [T[i:i + 2] for i in range(0, len(T), 2)]
    faces = []
    k = 0
    for vc in vcount:
        corners = []
        for _ in range(vc):
            c = p[k:k + nstride]
            corners.append((c[inputs["VERTEX"][0]], c[inputs["NORMAL"][0]], c[inputs["TEXCOORD"][0]]))
            k += nstride
        faces.append(corners)
    # skin
    skin = find(root, "skin")
    joints_el = children(skin, "joints")[0]
    jname_src = [i.get("source")[1:] for i in children(joints_el, "input") if i.get("semantic") == "JOINT"][0]
    jsids = srcs[jname_src][0]
    vw = children(skin, "vertex_weights")[0]
    vwin = {i.get("semantic"): (int(i.get("offset")), i.get("source")[1:]) for i in children(vw, "input")}
    W = srcs[vwin["WEIGHT"][1]][0]
    wstride = max(o for o, _ in vwin.values()) + 1
    vwc = ints(children(vw, "vcount")[0])
    vv = ints(children(vw, "v")[0])
    vgroups = []
    k = 0
    for c in vwc:
        lst = []
        for _ in range(c):
            e = vv[k:k + wstride]
            lst.append((jsids[e[vwin["JOINT"][0]]], W[e[vwin["WEIGHT"][0]]]))
            k += wstride
        vgroups.append(lst)
    # joints (visual scene)
    vs = find(root, "visual_scene")
    joints = {}  # sid -> dict(name, world, parent_sid)
    mesh_world = Matrix.Identity(4)

    def walk(node, parent_m, parent_sid):
        nonlocal mesh_world
        m = parent_m @ node_local(node)
        sid = parent_sid
        if node.get("type") == "JOINT":
            sid = node.get("sid")
            joints[sid] = dict(name=node.get("name"), world=m, parent=parent_sid)
        if children(node, "instance_controller") or children(node, "instance_geometry"):
            mesh_world = m
        for c in children(node, "node"):
            walk(c, m, sid)

    for n in children(vs, "node"):
        walk(n, Matrix.Identity(4), None)
    return dict(positions=[(mesh_world @ Vector(v)) for v in positions], normals=normals,
                uvs=uvs, faces=faces, vgroups=vgroups, joints=joints, mesh_world=mesh_world)


def make_material(name, img_path):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(img_path)
    tex.interpolation = "Closest"
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    rnd = nt.nodes.new("ShaderNodeMath")
    rnd.operation = "ROUND"  # el exportador glTF lo traduce a alphaMode MASK (cutoff 0.5)
    nt.links.new(tex.outputs["Alpha"], rnd.inputs[0])
    nt.links.new(rnd.outputs[0], bsdf.inputs["Alpha"])
    bsdf.inputs["Roughness"].default_value = 1.0
    bsdf.inputs["Metallic"].default_value = 0.0
    for nm in ("Specular IOR Level", "Specular"):
        if nm in bsdf.inputs:
            bsdf.inputs[nm].default_value = 0.0
    mat.use_backface_culling = False  # doubleSided en glTF
    try:
        mat.surface_render_method = "DITHERED"
    except Exception:
        pass
    return mat


def build_dae(m, path):
    d = parse_dae(path)
    pos = [dae_to_bl(v) for v in d["positions"]]
    nrm = [dae_to_bl(v) for v in d["normals"]]
    faces = []
    for f in d["faces"]:
        idx = [c[0] for c in f]
        a, b, c = pos[idx[0]], pos[idx[1]], pos[idx[2]]
        gn = (b - a).cross(c - a)
        sn = Vector((0, 0, 0))
        for co in f:
            sn += nrm[co[1]]
        if gn.dot(sn) < 0:  # el mapeo DAE->Blender es un espejo: ordenar segun la normal guardada
            f = list(reversed(f))
        faces.append(f)
    me = bpy.data.meshes.new(m["id"])
    me.from_pydata([tuple(v) for v in pos], [], [[c[0] for c in f] for f in faces])
    uvl = me.uv_layers.new(name="UVMap")
    li = 0
    for poly, f in zip(me.polygons, faces):
        for lidx, co in zip(poly.loop_indices, f):
            uvl.data[lidx].uv = d["uvs"][co[2]]
    ob = bpy.data.objects.new(m["id"], me)
    bpy.context.scene.collection.objects.link(ob)
    # armature
    arm = bpy.data.armatures.new(m["id"] + "_rig")
    ao = bpy.data.objects.new(m["id"] + "_rig", arm)
    bpy.context.scene.collection.objects.link(ao)
    bpy.context.view_layer.objects.active = ao
    bpy.ops.object.mode_set(mode="EDIT")
    J = d["joints"]
    heads = {sid: dae_to_bl(j["world"].to_translation()) for sid, j in J.items()}
    kids = {sid: [s for s, j in J.items() if j["parent"] == sid] for sid in J}
    size = max((max(v[i] for v in pos) - min(v[i] for v in pos)) for i in range(3))
    eb = {}
    for sid, j in J.items():
        b = arm.edit_bones.new(j["name"])
        h = heads[sid]
        if kids[sid]:
            t = sum((heads[k] for k in kids[sid]), Vector()) / len(kids[sid])
        elif j["parent"]:
            t = h + (h - heads[j["parent"]]) * 0.5
        else:
            t = h + Vector((0, 0, size * 0.1))
        if (t - h).length < size * 0.02:
            t = h + Vector((0, 0, size * 0.05))
        b.head, b.tail = h, t
        eb[sid] = b
    for sid, j in J.items():
        if j["parent"]:
            eb[sid].parent = eb[j["parent"]]
    bpy.ops.object.mode_set(mode="OBJECT")
    sid2name = {sid: j["name"] for sid, j in J.items()}
    for sid, nm in sid2name.items():
        ob.vertex_groups.new(name=nm)
    for vi, lst in enumerate(d["vgroups"]):
        for sid, w in lst:
            if w > 0:
                ob.vertex_groups[sid2name[sid]].add([vi], w, "REPLACE")
    return ob, ao


def build_obj(m, path):
    bpy.ops.wm.obj_import(filepath=path)
    obs = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    ob = obs[0]
    ob.name = m["id"]
    ob.data.materials.clear()
    return ob, None


def bbox(ob):
    vs = [ob.matrix_world @ v.co for v in ob.data.vertices]
    mn = Vector((min(v[i] for v in vs) for i in range(3)))
    mx = Vector((max(v[i] for v in vs) for i in range(3)))
    return mn, mx


factors = {}
stats = {}
statpath = os.path.join(OUT, "data", "stats.json")
if ONLY and os.path.exists(statpath):
    stats = json.load(open(statpath))
    factors = {k: v["factor"] for k, v in stats.items()}

for m in MODELS:
    if ONLY and m["id"] not in ONLY:
        continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    base = os.path.join(SRC, m["src"])
    folder = os.path.dirname(base)
    png = [f for f in os.listdir(folder) if f.lower().endswith(".png")][0]
    png_path = os.path.join(folder, png)
    texname = m["tex"] + "_orig.png"
    shutil.copyfile(png_path, os.path.join(OUT, "textures", texname))
    if m["fmt"] == "dae":
        ob, ao = build_dae(m, base + ".dae")
    else:
        ob, ao = build_obj(m, base + ".obj")
    # rotacion para mirar a -Y
    R = Matrix.Rotation(__import__("math").radians(m["rot_z"]), 4, "Z")
    ob.data.transform(ob.matrix_world)
    ob.matrix_world = Matrix.Identity(4)
    ob.data.transform(R)
    if ao:
        ao.data.transform(R)
    mn, mx = bbox(ob)
    native = mx - mn
    kind, val = m["size"]
    if kind == "height":
        f = val / native.z
    elif kind == "length":
        f = val / native.y
    else:
        f = factors[val]
    factors[m["id"]] = f
    centre = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z))
    T = Matrix.Diagonal(Vector((f, f, f, 1))) @ Matrix.Translation(-centre)
    ob.data.transform(T)
    if ao:
        ao.data.transform(T)
    # limpieza: merge por distancia (por hueso si hay rig, para no romper el skin), normales, triangulos
    bm = bmesh.new()
    bm.from_mesh(ob.data)
    before = len(bm.verts)
    dist = 1e-5 * max(native) * f
    if ao:
        dl = bm.verts.layers.deform.verify()
        groups = {}
        for v in bm.verts:
            g = max(v[dl].items(), key=lambda kv: kv[1])[0] if v[dl] else -1
            groups.setdefault(g, []).append(v)
        for g, vs in groups.items():
            bmesh.ops.remove_doubles(bm, verts=vs, dist=dist)
    else:
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=dist)
    bmesh.ops.triangulate(bm, faces=bm.faces)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    after = len(bm.verts)
    bm.to_mesh(ob.data)
    bm.free()
    for p in ob.data.polygons:
        p.use_smooth = False
    ob.data.update()
    mat = make_material("mml_" + m["tex"], os.path.join(OUT, "textures", texname))
    ob.data.materials.clear()
    ob.data.materials.append(mat)
    if ao:
        ob.parent = ao
        mod = ob.modifiers.new("Armature", "ARMATURE")
        mod.object = ao
    mn, mx = bbox(ob)
    dims = mx - mn
    # datos UV + hueso por cara para recolor.py
    uvl = ob.data.uv_layers.active.data
    tris = []
    for p in ob.data.polygons:
        bone = None
        if ao:
            cnt = {}
            for vi in p.vertices:
                for g in ob.data.vertices[vi].groups:
                    nm = ob.vertex_groups[g.group].name
                    cnt[nm] = cnt.get(nm, 0) + 1
            bone = max(cnt, key=cnt.get) if cnt else None
        tris.append(dict(uv=[list(uvl[l].uv) for l in p.loop_indices], bone=bone,
                         z=sum((ob.data.vertices[v].co.z for v in p.vertices)) / 3))
    bones = {}
    if ao:
        for b in ao.data.bones:
            bones[b.name] = dict(head=list(b.head_local), tail=list(b.tail_local),
                                 parent=b.parent.name if b.parent else None)
    json.dump(dict(id=m["id"], tex=m["tex"], tris=tris, bones=bones),
              open(os.path.join(OUT, "data", "uv_%s.json" % m["id"]), "w"))
    img = mat.node_tree.nodes["Image Texture"].image if "Image Texture" in mat.node_tree.nodes else None
    stats[m["id"]] = dict(src=m["src"], fmt=m["fmt"], tex=m["tex"], tris=len(ob.data.polygons),
                          verts_before_merge=before, verts=after,
                          native_dims=list(native), factor=f,
                          dims_m=[round(x, 3) for x in dims],
                          tex_size=list(img.size) if img else None,
                          rigged=bool(ao), bones=len(bones), animations=[])
    print("MODEL", m["id"], json.dumps(stats[m["id"]]))
    # export
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, "models", m["id"] + ".glb"),
                              export_format="GLB", use_selection=True, export_yup=True,
                              export_apply=False, export_skins=bool(ao), export_animations=False,
                              export_materials="EXPORT", export_image_format="AUTO")

json.dump(stats, open(statpath, "w"), indent=1)
print("DONE")

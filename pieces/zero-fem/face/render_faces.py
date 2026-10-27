"""Verification sheet: renders front close-ups of the exported GLB for every expression -> face/expressions.png

    python face/render_faces.py [glb] [--compare other.glb]

Imports the GLB in background Blender (EEVEE, emission-only like feminize.py, black world, Standard view),
picks each cell with a Mapping node offset x = cell/16 (same as texture.offset.x in three.js) and stitches
the labelled tiles. --compare renders the neutral face of another GLB and reports how many pixels differ."""
import os, sys, json, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(os.path.dirname(HERE), "out")
BLENDER = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
TILES = os.path.join(HERE, "_tiles")
sys.path.insert(0, HERE)
from paint_face import EYES, MOUTHS, N

SHOTS = ([(f"eyes: {e}", e, "neutral") for e in EYES] +
         [(f"mouth: {m}", "open", m) for m in MOUTHS] +
         [("hearts + blep", "hearts", "blep"), ("shocked + bigShock", "shocked", "bigShock"),
          ("dizzy + gasp", "dizzy", "gasp"), ("relaxed + cat", "relaxed", "cat"),
          ("happy + smileOpen", "happy", "smileOpen"), ("angry + shout", "angry", "shout"),
          ("sad + frown", "sad", "frown"), ("wink + smile", "wink", "smile"), ("disgust + disgust", "disgust", "disgust")])
RES = 320


def blender_main(glb, jobs):
    import bpy, math
    from mathutils import Vector
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=glb)
    maps = {}
    for mat in bpy.data.materials:
        if not mat.node_tree:
            continue
        nt = mat.node_tree
        tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None)
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL"), None)
        if not tex or not out:
            continue
        tex.interpolation = "Closest"
        emit = nt.nodes.new("ShaderNodeEmission")
        nt.links.new(tex.outputs["Color"], emit.inputs["Color"])
        nt.links.new(emit.outputs["Emission"], out.inputs["Surface"])
        if mat.name.startswith("face_"):
            tc = nt.nodes.new("ShaderNodeTexCoord"); mp = nt.nodes.new("ShaderNodeMapping")
            nt.links.new(tc.outputs["UV"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], tex.inputs["Vector"])
            maps[mat.name] = mp
    sc = bpy.context.scene
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = sc.render.resolution_y = RES
    sc.view_settings.view_transform = "Standard"
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True
    next(n for n in w.node_tree.nodes if n.type == "BACKGROUND").inputs["Color"].default_value = (0, 0, 0, 1)
    head = next(o for o in bpy.data.objects if o.type == "MESH" and o.name.startswith("Head"))
    dg = bpy.context.evaluated_depsgraph_get(); ev = head.evaluated_get(dg); me = ev.to_mesh()
    names = [m.name if m else "" for m in me.materials]
    pts = [ev.matrix_world @ me.vertices[v].co for p in me.polygons if names[p.material_index].startswith("face_")
           for v in p.vertices] or [ev.matrix_world @ v.co for v in me.vertices]
    lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)])
    c = (lo + hi) / 2
    cj = os.path.join(TILES, "cam.json")             # same framing for every GLB rendered in one run
    if os.path.exists(cj):
        loc, scale = json.load(open(cj))
    else:
        loc, scale = (c.x, lo.y - 10, c.z + 0.05 * (hi.z - lo.z)), max(hi.x - lo.x, hi.z - lo.z) * 1.45
        json.dump([loc, scale], open(cj, "w"))
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc.collection.objects.link(cam); sc.camera = cam
    cam.data.type = "ORTHO"; cam.data.ortho_scale = scale
    cam.location = loc; cam.rotation_euler = (math.radians(90), 0, 0)
    for path, e, m in jobs:
        if "face_eyes" in maps: maps["face_eyes"].inputs["Location"].default_value[0] = EYES.index(e) / N
        if "face_mouth" in maps: maps["face_mouth"].inputs["Location"].default_value[0] = MOUTHS.index(m) / N
        sc.render.filepath = path
        bpy.ops.render.render(write_still=True)


def run_blender(glb, jobs):
    spec = os.path.join(TILES, "jobs.json")
    json.dump({"glb": glb, "jobs": jobs}, open(spec, "w"))
    subprocess.run([BLENDER, "-b", "--factory-startup", "--python", os.path.abspath(__file__), "--", spec],
                   check=True, timeout=900, stdout=subprocess.DEVNULL)


def main():
    from PIL import Image, ImageDraw, ImageChops
    args = sys.argv[1:]
    glb = os.path.abspath(args[0]) if args and not args[0].startswith("--") else os.path.join(OUT, "zero_fem.glb")
    os.makedirs(TILES, exist_ok=True)
    if os.path.exists(os.path.join(TILES, "cam.json")):
        os.remove(os.path.join(TILES, "cam.json"))
    jobs = [(os.path.join(TILES, f"t{i:02d}.png"), e, m) for i, (_, e, m) in enumerate(SHOTS)]
    if "--compare" in args:
        jobs.append((os.path.join(TILES, "neutral_new.png"), "open", "neutral"))
    run_blender(glb, jobs)
    cols, pad, lab = 8, 6, 22
    rows = (len(SHOTS) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * (RES + pad) + pad, rows * (RES + lab + pad) + pad), (16, 16, 16))
    d = ImageDraw.Draw(sheet)
    for i, (label, _, _) in enumerate(SHOTS):
        x, y = pad + (i % cols) * (RES + pad), pad + (i // cols) * (RES + lab + pad)
        sheet.paste(Image.open(jobs[i][0]).convert("RGB"), (x, y + lab))
        d.text((x + 4, y + 5), f"{label}", fill=(255, 255, 255))
    sheet.save(os.path.join(HERE, "expressions.png"))
    print("wrote", os.path.join(HERE, "expressions.png"))
    if "--compare" in args:
        other = os.path.abspath(args[args.index("--compare") + 1])
        ref = os.path.join(TILES, "neutral_ref.png")
        run_blender(other, [(ref, "open", "neutral")])
        diff = ImageChops.difference(Image.open(ref).convert("RGB"), Image.open(jobs[-1][0]).convert("RGB"))
        n = sum(1 for p in diff.getdata() if max(p) > 0)
        print(f"neutral vs {os.path.basename(other)}: {n} differing pixels of {RES * RES}")


if __name__ == "__main__":
    if "--" in sys.argv and sys.argv[-1].endswith("jobs.json"):
        spec = json.load(open(sys.argv[-1]))
        blender_main(spec["glb"], spec["jobs"])
    else:
        main()

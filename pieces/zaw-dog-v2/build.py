"""Blender: /Applications/Blender.app/Contents/MacOS/Blender -b -P build.py -- <mode>
export  -> tex/uv.json + tex/bake_mesh.json (UV layout; then venv: python bake.py makes tex/atlas_<expr>.png)
check   -> review/check/*.png (front, side, q34, q34b, back, top, low)
head    -> review/head/*.png (head close-ups: front, side, q34, q34b, back, top) + face_<expr>.png
expr    -> review/expr/<expr>.png (3/4 face close-ups with the expression body language)
turn    -> renders/frames_turn/ (180 f turntable, faces cycle)
walk    -> renders/frames_walk/ (180 f walk in a room) + review/walk_feet.json (paw world positions per frame)
wag     -> review/wag/ (happy wag, 3/4 back)
blend   -> renders/zaw_dog_v2.blend
Then venv: python post.py <mode>."""
import json
import math
import os
import sys

H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(H, "..", ".."))
sys.path.insert(0, H); sys.path.insert(0, os.path.join(ROOT, "pieces", "lps-onoda"))
import bmesh  # noqa: E402
import bpy  # noqa: E402
from mathutils import Vector  # noqa: E402
import lpskit as K  # noqa: E402
import dog as D  # noqa: E402

MODE = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "check"
OUT = os.path.join(H, "renders"); REV = os.path.join(H, "review")


def render(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def studio(bg="#C9B79C", floor_c=("#D8C7A8", "#CDB894", "#A8906C")):
    sc = K.reset(bg)
    sc.eevee.taa_render_samples = 4
    floor = K.mat_image("floor", K.tex_tiles("floor_t", 64, 4, *floor_c), repeat=(1, 1))
    K.box("floor", (8, 8, 0.02), (0, 0, -0.01), floor, uv_scale=1.0)
    K.plane("backdrop", 14, 8, (0, 4, 3), mat=K.mat_color("bd", bg))
    return sc


def scene_dog(with_shadow=True):
    o, arm, fn = D.build()
    mover = bpy.data.objects.new("mover", None); K.link(mover); arm.parent = mover
    if with_shadow:
        D.blob_shadow(mover)
    return o, arm, fn, mover


def view(cam, pos, target, lens):
    cam.data.lens = lens; K.look(cam, pos, target); K.ps1_snap_update(cam)


# ---------------------------------------------------------------- export (UV layout + bake data)

def area3(vs):
    return 0.5 * sum(((vs[0] - vs[i]).cross(vs[0] - vs[i + 1])).length for i in range(1, len(vs) - 1))


def area2(uv):
    return 0.5 * abs(sum(uv[i][0] * uv[i - 1][1] - uv[i - 1][0] * uv[i][1] for i in range(len(uv))))


def make_uvs(o):
    me = o.data
    part = [D.PARTS[v.value] for v in me.attributes["part"].data]
    HEADP = {"head", "muzzle", "jaw"}
    group = {}
    for p in me.polygons:
        pt = part[p.index]
        if pt in HEADP and p.normal.y < -0.35 and p.center.y < -0.30:
            group[p.index] = "face"
        elif pt == "ear":
            # ears: two planar (y, z) islands per ear (outer / inner leather); the thin edges sit on the outer one
            group[p.index] = "ear_in" if p.normal.x * (1 if p.center.x > 0 else -1) < -0.2 else "ear_out"
        elif pt in HEADP | {"nose", "tongue", "mouth"}:
            group[p.index] = "head"
        else:
            group[p.index] = "body"
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    for g in ("head", "body"):
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="DESELECT"); bpy.ops.object.mode_set(mode="OBJECT")
        for p in me.polygons:
            p.select = group[p.index] == g
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.02, area_weight=0.0, scale_to_bounds=False)
        bpy.ops.object.mode_set(mode="OBJECT")
    uvl = me.uv_layers.active
    # face fronts: planar front projection (x, z) -> one clean island per part, eyes never cut by a seam
    for p in me.polygons:
        if group[p.index] == "face":
            for li, vi in zip(p.loop_indices, p.vertices):
                co = me.vertices[vi].co
                uvl.data[li].uv = (co.x, co.z)
    for p in me.polygons:
        g = group[p.index]
        if g.startswith("ear"):
            off = (0.0 if p.center.x > 0 else 1.0) + (0.0 if g == "ear_out" else 2.0)   # keeps the 4 islands apart
            for li, vi in zip(p.loop_indices, p.vertices):
                co = me.vertices[vi].co
                uvl.data[li].uv = (co.y + off, co.z)
    # texel density per group: face 4.2x, rest of head and ears 1.8x, body 1x
    target = {"face": 4.2, "head": 1.8, "ear_out": 1.8, "ear_in": 1.8, "body": 1.0}
    dens = {}
    for g in target:
        a3 = a2 = 0.0
        for p in me.polygons:
            if group[p.index] != g:
                continue
            a3 += area3([me.vertices[v].co for v in p.vertices]); a2 += area2([tuple(uvl.data[li].uv) for li in p.loop_indices])
        if g.startswith("ear"):
            dens[g] = 1.0 / 1.0                    # planar metres: density comes out right after scaling by body's
            continue
        dens[g] = math.sqrt(a2 / a3)
    for p in me.polygons:
        g = group[p.index]; k = target[g] / dens[g] * dens["body"]
        for li in p.loop_indices:
            u, v = uvl.data[li].uv; uvl.data[li].uv = (u * k, v * k)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.select_all(action="SELECT")
    bpy.ops.uv.pack_islands(rotate=True, margin=0.012)
    bpy.ops.object.mode_set(mode="OBJECT")
    return group


if MODE == "export":
    K.reset("#9AA0A8")
    o, arm, fn = D.build(with_uv=False)
    group = make_uvs(o)
    me = o.data; uvl = me.uv_layers.active
    os.makedirs(D.TEX, exist_ok=True)
    flat = []
    for d in uvl.data:
        flat += [round(d.uv[0], 6), round(d.uv[1], 6)]
    json.dump(flat, open(os.path.join(D.TEX, "uv.json"), "w"))
    me.calc_loop_triangles()
    part = [v.value for v in me.attributes["part"].data]
    prm = [v.value for v in me.attributes["param"].data]
    vn = [tuple(v.normal) for v in me.vertices]
    tris = []
    for lt in me.loop_triangles:
        p = me.polygons[lt.polygon_index]
        tris.append(dict(part=D.PARTS[part[lt.polygon_index]], face=group[lt.polygon_index] == "face",
                         uv=[tuple(uvl.data[li].uv) for li in lt.loops],
                         co=[tuple(me.vertices[v].co) for v in lt.vertices],
                         n=[vn[v] if p.use_smooth else tuple(p.normal) for v in lt.vertices],
                         fn=tuple(p.normal), prm=[prm[v] for v in lt.vertices]))
    json.dump(dict(tris=tris, legs=dict(f=[D.FRONT_X, D.Pw(D.FLEG[-1][0], 0).y], h=[D.HIND_X, D.Pw(D.HLEG[-1][0], 0).y]),
                   proj=dict(side_ref=D.SIDE_REF, face_ref=D.FACE_REF, side_s=D.SIDE_S, side_x0=D.SIDE_X0, side_g=D.SIDE_G,
                             face_k=D.FACE_K, face_x0=D.FACE_X0, face_rows=D.FACE_ROWS)),
              open(os.path.join(D.TEX, "bake_mesh.json"), "w"))
    print("EXPORT tris", D.tri_count(o), "loops", len(me.loops))

elif MODE == "check":
    sc = studio()
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "check"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 720, 960
    c = Vector((0, 0.0, 0.42))
    views = {"front": (0, -3.0, 0.55), "side": (3.0, 0.0, 0.45), "q34": (2.1, -2.2, 0.85), "q34b": (-2.0, 2.2, 0.95),
             "back": (0.0, 3.0, 0.75), "top": (0.01, 0.0, 3.2), "low": (1.7, -1.6, 0.08), "sideR": (-3.0, 0.0, 0.45)}
    for k, p in views.items():
        view(cam, p, c, 50); render(os.path.join(d, f"{k}.png"))
    # orthographic side on a flat backdrop, 1 px = 1 mm, for the overlay on the reference photo (review/overlay.py)
    for o_ in bpy.data.objects:
        if o_.name in ("floor", "blob"):
            o_.hide_render = True
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 1.2; sc.render.resolution_x = sc.render.resolution_y = 1200
    K.look(cam, (3.0, 0.0, 0.5), (0.0, 0.0, 0.5)); render(os.path.join(d, "ortho_side.png"))

elif MODE == "head":
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "head"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1080
    hc = Vector((0, -0.34, 0.73))
    for k, p in {"front": (0.0, -1.50, 0.77), "side": (1.40, -0.34, 0.75), "q34": (0.98, -1.22, 0.83),
                 "q34b": (0.95, 0.50, 0.95), "back": (0.0, 0.95, 1.05), "top": (0.01, -0.36, 2.0), "low": (0.6, -1.05, 0.45)}.items():
        view(cam, p, hc, 50); render(os.path.join(d, f"{k}.png"))
    for e in D.EXPRS:
        D.set_face(fn, e); D.rest(arm); D.expr_pose(arm, e, 0.1); bpy.context.view_layer.update()
        fc = arm.matrix_world @ (arm.pose.bones["head"].head + 0.45 * (arm.pose.bones["head"].tail - arm.pose.bones["head"].head))
        view(cam, fc + Vector((0.0, -0.95, 0.07)), fc + Vector((0, 0, 0.0)), 50); render(os.path.join(d, f"face_{e}.png"))

elif MODE == "expr":
    sc = studio("#F3D9A8")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "expr"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1352
    for e in D.EXPRS:
        D.rest(arm); D.expr_pose(arm, e, 0.1)
        D.set_face(fn, e); bpy.context.view_layer.update()
        view(cam, (1.05, -1.60, 0.92), (0.0, -0.08, 0.50), 40); render(os.path.join(d, f"{e}.png"))
        view(cam, (0.32, -1.25, 0.72), (0.0, -0.30, 0.63), 50); render(os.path.join(d, f"cu_{e}.png"))

elif MODE == "wag":
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 45); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "wag"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 720, 960
    D.set_face(fn, "happy")
    for i in range(12):
        t = i / 30
        D.rest(arm); D.expr_pose(arm, "happy", t); bpy.context.view_layer.update()
        view(cam, (0.9, 2.1, 1.05), Vector((0, 0.1, 0.48)), 45); render(os.path.join(d, f"wag_{i:02d}.png"))

elif MODE == "turn":
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 40); K.ps1_snap(cam, grid_h=240)
    view(cam, (0, -2.35, 0.82), (0, 0.02, 0.50), 40)
    d = os.path.join(OUT, "frames_turn"); os.makedirs(d, exist_ok=True)
    N = 180
    for f in range(N):
        t = f / 30
        mover.rotation_euler = (0, 0, 2 * math.pi * f / N)
        D.rest(arm)
        i = min(int(t / 1.2), 4); e = D.EXPRS[i]
        D.set_face(fn, e)
        D.expr_pose(arm, e, t, prev=D.EXPRS[i - 1] if i else None, a=(t - 1.2 * i) / 0.25)
        D.move(arm, "chest", (0, 0, 0.005 * math.sin(1.6 * math.pi * t)))
        sc.frame_set(f); bpy.context.view_layer.update()
        render(os.path.join(d, f"{f:05d}.png"))

elif MODE == "walk":
    sc = studio("#DCC7A0", ("#B98A5A", "#AD7E50", "#7A5434"))
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 30); K.ps1_snap(cam, grid_h=240)
    D.set_face(fn, "happy")
    N = 180
    D.make_walk_action(arm, math.ceil(N / D.WALK_T) + 1, start=0)
    y0 = 1.6
    d = os.path.join(OUT, "frames_walk"); os.makedirs(d, exist_ok=True)
    feet = []
    for f in range(N):
        sc.frame_set(f)
        yd = y0 - D.WALK_SPEED * f
        mover.location = (0, yd, 0)
        bpy.context.view_layer.update()
        feet.append({b: list(arm.matrix_world @ arm.pose.bones[b].head) for b in ("paw_f.L", "paw_f.R", "paw_h.L", "paw_h.R")})
        cy = yd - 0.05
        view(cam, (1.55, cy - 1.25, 0.66), (0, cy + 0.02, 0.45), 32)
        render(os.path.join(d, f"{f:05d}.png"))
    json.dump(feet, open(os.path.join(REV, "walk_feet.json"), "w"))

elif MODE == "poses":
    # the poses pieces/zaw-dog-01/build.py drives by hand (dog_lie, play-bounce, sniff, chin on paws), on the v2 rig
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 45); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "poses"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 720, 720

    def lie():
        D.move(arm, "hips", (0, 0.04, -0.2)); D.rot(arm, "hips", (1, 0, 0), 0.06)
        for s_, sx in (("L", 1), ("R", -1)):
            D.move(arm, f"ik_f.{s_}", (0.02 * sx, -0.27, 0.0)); D.move(arm, f"ik_h.{s_}", (0.05 * sx, -0.06, 0.0))
    poses = {
        "lie_sad": lambda: (lie(), D.set_face(fn, "sad"), D.rot2(arm, "head", [((1, 0, 0), 0.45)])),
        "lie_judging": lambda: (lie(), D.set_face(fn, "judging"), D.expr_pose(arm, "judging", 0.2)),
        "bounce_happy": lambda: (D.set_face(fn, "happy"), D.expr_pose(arm, "happy", 0.07), D.rot(arm, "root", (1, 0, 0), -0.22),
                                 [D.move(arm, f"ik_f.{s_}", (0, -0.04, 0.1)) for s_ in "LR"]),
        "sniff": lambda: (D.set_face(fn, "neutral"), D.rot2(arm, "head", [((1, 0, 0), 0.25)]), D.rot2(arm, "neck", [((1, 0, 0), 0.25)])),
        "jump_up": lambda: (D.set_face(fn, "happy"), D.expr_pose(arm, "happy", 0.03), D.rot(arm, "root", (1, 0, 0), -0.32),
                            [(D.move(arm, f"ik_f.{s_}", (0, -0.08, 0.12)), D.move(arm, f"ik_h.{s_}", (0, 0.08, 0.0))) for s_ in "LR"]),
    }
    for name, fnc in poses.items():
        D.rest(arm); fnc(); bpy.context.view_layer.update()
        for vn, p in (("q34", (1.5, -1.7, 0.75)), ("side", (2.1, -0.05, 0.4))):
            view(cam, p, Vector((0, -0.05, 0.32)), 45); render(os.path.join(d, f"{name}_{vn}.png"))

elif MODE == "ears":
    # ear attachment check: 5 expressions x 5 head views + 3 walk frames (head bob)
    sc = studio("#E9C48E")
    o, arm, fn, mover = scene_dog()
    cam = K.camera("Cam", 50); K.ps1_snap(cam, grid_h=240)
    d = os.path.join(REV, "ears"); os.makedirs(d, exist_ok=True)
    sc.render.resolution_x, sc.render.resolution_y = 480, 480
    hc = Vector((0, -0.30, 0.72))
    VIEWS = {"front": (0.0, -0.95, 0.76), "side": (0.62, -0.32, 0.76), "q34": (0.45, -0.72, 0.84), "back": (0.30, 0.30, 0.95),
             "top": (0.02, -0.30, 1.30)}
    for e in D.EXPRS:
        D.rest(arm); D.set_face(fn, e); D.expr_pose(arm, e, 0.37); bpy.context.view_layer.update()
        hp = arm.matrix_world @ arm.pose.bones["head"].head
        for k, p in VIEWS.items():
            view(cam, Vector(p) + (hp - Vector((0, -0.17, 0.70))), hp + Vector((0, -0.12, 0.02)), 40)
            render(os.path.join(d, f"{e}_{k}.png"))
    D.rest(arm); D.set_face(fn, "neutral"); D.make_walk_action(arm, 2, start=0)
    for f in (3, 9, 16):
        sc.frame_set(f); bpy.context.view_layer.update()
        hp = arm.matrix_world @ arm.pose.bones["head"].head
        view(cam, Vector((0.45, -0.72, 0.84)) + (hp - Vector((0, -0.17, 0.70))), hp + Vector((0, -0.12, 0.02)), 40)
        render(os.path.join(d, f"walk_{f:02d}.png"))

elif MODE == "blend":
    K.reset("#9AA0A8")
    o, arm, fn = D.build()
    for e in D.EXPRS:
        D.face_image(e).use_fake_user = True
    D.make_walk_action(arm, 1, start=0)
    arm.animation_data.nla_tracks["walk"].mute = True       # rest pose by default; unmute or reuse the action
    os.makedirs(OUT, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "zaw_dog_v2.blend"))

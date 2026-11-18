"""Blender: fit a pose of the rig to his turntable (silhouette + colour classes, 13 calibrated views).
exec(open(r".../v5/bl_posefit.py").read()); init_from_action("tut_hip"); fit_round(...)
State in v5/pose_<name>.json: {"theta0": deg, "bones": {bone: [lx,ly,lz, rx,ry,rz (deg, XYZ euler of matrix_basis)]}}"""
import bpy, json, math, sys, time, numpy as np
from mathutils import Euler, Vector, Quaternion
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
sys.path.insert(0, V5)
import importlib, rast; importlib.reload(rast)
ARM = bpy.data.objects["Armature"]
CAM = json.load(open(V5 + "turn_cam.json"))
HC = np.load(V5 + "turn_cls_q.npy")
BONES = ["Pelvis", "Chest", "Neck", "Head", "UpperArm.L", "Forearm.L", "Hand.L", "UpperArm.R", "Forearm.R", "Hand.R",
         "FootControl.L", "FootRotation.L", "FootControl.R", "FootRotation.R"]
LOC = {"Pelvis", "FootControl.L", "FootControl.R"}


def objs():
    return [o for o in bpy.data.collections["GirlV5"].all_objects if o.type == "MESH"]


_TOPO = {}
_PIDX = {}


def topo(o):
    if o.name not in _TOPO or _TOPO[o.name][1] != len(o.data.vertices):
        o.data.calc_loop_triangles()
        t = np.array([lt.vertices[:] for lt in o.data.loop_triangles], int)
        _TOPO[o.name] = (t, len(o.data.vertices))
    return _TOPO[o.name][0]


def posed_tris():
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get()
    T, C = [], []
    for o in objs():
        t = topo(o); oe = o.evaluated_get(dg); me = oe.data
        co = np.empty(len(me.vertices) * 3); me.vertices.foreach_get("co", co); co = co.reshape(-1, 3)
        M = np.array(o.matrix_world); co = co @ M[:3, :3].T + M[:3, 3]
        T.append(co[t])
        if "fcol" in o.keys():
            fc = np.array(o["fcol"], float).reshape(-1, 3)
            if o.name not in _PIDX or len(_PIDX[o.name]) != len(t):
                o.data.calc_loop_triangles(); _PIDX[o.name] = np.array([lt.polygon_index for lt in o.data.loop_triangles])
            C.append(fc[_PIDX[o.name]])
        else: C.append(np.tile(np.array(o["col"], float), (len(t), 1)))
    return np.concatenate(T), np.concatenate(C)


def apply(state):
    for b, v in state["bones"].items():
        pb = ARM.pose.bones[b]
        pb.location = v[:3]
        q = Euler([math.radians(a) for a in v[3:]], "XYZ").to_quaternion()
        if pb.rotation_mode == "QUATERNION": pb.rotation_quaternion = q
        else: pb.rotation_euler = q.to_euler(pb.rotation_mode)


def init_from_action(name, frame=1, theta0=-25.0, out="hip"):
    ad = ARM.animation_data
    for t in ad.nla_tracks: t.mute = True
    ad.action = bpy.data.actions.get(name); bpy.context.scene.frame_set(frame)
    st = {"theta0": theta0, "bones": {}}
    for b in BONES:
        pb = ARM.pose.bones[b]
        q = pb.rotation_quaternion if pb.rotation_mode == "QUATERNION" else pb.rotation_euler.to_quaternion()
        e = q.to_euler("XYZ"); st["bones"][b] = list(pb.location) + [math.degrees(a) for a in e]
    ad.action = None
    json.dump(st, open(V5 + f"pose_{out}.json", "w"), indent=1); apply(st); return st


VIEWS = sorted(set(list(range(0, 50, 3)) + [10, 10, 15, 45, 25, 37]))
MODE = "mix"


def score(state, views=VIEWS, scale=0.25):
    apply(state); T, C = posed_tris(); s = []
    for k in views:
        p = dict(CAM); p["theta"] = state["theta0"] - 7.2 * k
        oc = rast.raster_cls(T, C, p, scale)
        if MODE == "sil":
            a, b = oc != 0, HC[k] != 0; s.append((a & b).sum() / max(1, (a | b).sum()))
        else: s.append(0.5 * rast.cls_score(oc, HC[k]) + 0.5 * ((oc != 0) & (HC[k] != 0)).sum() / max(1, ((oc != 0) | (HC[k] != 0)).sum()))
    return float(np.mean(s))


def fit_round(out="hip", step_rot=6.0, step_loc=0.15, bones=None, tmax=100):
    st = json.load(open(V5 + f"pose_{out}.json")); t0 = time.time()
    best = score(st); n = 0
    params = [("theta0", None)] + [(b, i) for b in (bones or BONES) for i in (range(6) if b in LOC else range(3, 6))]
    for b, i in params:
        if time.time() - t0 > tmax: break
        for sgn in (1, -1):
            cand = json.loads(json.dumps(st))
            if b == "theta0": cand["theta0"] += sgn * step_rot * 0.5
            else: cand["bones"][b][i] += sgn * (step_loc if i < 3 else step_rot)
            s = score(cand); n += 1
            if s > best + 1e-5: best, st = s, cand; break
    json.dump(st, open(V5 + f"pose_{out}.json", "w"), indent=1); apply(st)
    return round(best, 4), n, round(time.time() - t0, 1)


def save_posed(tag, out="hip"):
    st = json.load(open(V5 + f"pose_{out}.json")); apply(st); T, C = posed_tris()
    np.savez(V5 + f"posed_{tag}.npz", tris=T, col=C, theta0=st["theta0"])

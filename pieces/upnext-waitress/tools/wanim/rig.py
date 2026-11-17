"""Waitress rig (Blender metres: x = her left, -y = her front, z up, feet on z = 0) shared by retarget (system python)
and bl_build2 (Blender python): names, parents, rest heads / tails, bone frames Rb, rest verts + weights + part tags."""
import json, numpy as np

ORDER = ["Pelvis", "Spine", "Chest", "Neck", "Head", "Clavicle.L", "UpperArm.L", "Forearm.L", "Hand.L", "Clavicle.R",
         "UpperArm.R", "Forearm.R", "Hand.R", "Thigh.L", "Calf.L", "Foot.L", "Thigh.R", "Calf.R", "Foot.R", "Bust.L", "Bust.R"]
S_ENGINE = 8.208977237173169          # Ashley's GLB units per metre (upnext-girl2 rig2 'S'); floor at z = -9 units
FLOOR = -9.0


def nrm(v): return v / (np.linalg.norm(v) + 1e-12)


def frame(h, t):
    y = nrm(t - h); ref = np.array([0, -1.0, 0]) if abs(y @ [0, -1, 0]) < 0.9 else np.array([0, 0, 1.0])
    z = nrm(ref - (ref @ y) * y); x = np.cross(y, z)
    return np.stack([x, y, z], 1)


def load(build_json):
    J = json.load(open(build_json)); C = J["centre_x"]
    cv = lambda p: np.array([p[0] - C, -p[2], p[1]], float)
    B = J["bones"]
    names = ORDER; BI = {n: i for i, n in enumerate(names)}
    par = np.array([BI[B[n]["parent"]] if B[n]["parent"] else -1 for n in names])
    Hr = np.array([cv(B[n]["head"]) for n in names]); Tr = np.array([cv(B[n]["tail"]) for n in names])
    Rb = np.array([frame(Hr[i], Tr[i]) for i in range(len(names))])
    Vr = np.array([cv(p) for p in J["verts"]])
    W = np.zeros((len(Vr), len(names)))
    for i, w in enumerate(J["weights"]):
        for n, x in w.items(): W[i, BI[n]] = x
    vpart = [""] * len(Vr)
    for f in J["faces"]:
        for v in f["v"]: vpart[v] = vpart[v] or f["part"]
    return dict(J=J, C=C, names=names, BI=BI, par=par, Hr=Hr, Tr=Tr, Rb=Rb, Vr=Vr, W=W, vpart=np.array(vpart), cv=cv)

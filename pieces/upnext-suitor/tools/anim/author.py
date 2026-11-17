"""Procedural clip authoring for the suitor (masculine set, keyed poses + analytic IK, no per-frame corrections).
 Every clip = keys of a pose (partial dicts over the 'stand' base) + optional periodic overlays; per frame the key weights
 (Catmull-Rom, linear in the key values) blend the scalar channels, then the arm targets are evaluated ON THE CURRENT body
 pose and blended with the same weights (contacts stay attached), legs = 2-bone IK to world ankle targets (feet planted),
 arms = 2-bone IK with explicit poles (no straight-limb roll flips), hands = local euler on the forearm.
 Coordinates: char frame (x = his left, f = forward, z = up, metres); Blender = (x, -f, z).
 python -I tools/anim/author.py [clip,clip]  -> ref/anim.npz, out/actions.json, out/face_tracks.json"""
import sys, os, json, math
import numpy as np
from scipy.spatial.transform import Rotation as Rot

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import rig as RG

R_ = RG.load(os.path.join(ROOT, "ref", "build_wine.json"))
NAMES = R_["names"]; BI = R_["BI"]; PAR = R_["par"]; Hr = R_["Hr"]; Tr = R_["Tr"]; Rb = R_["Rb"]; Vr = R_["Vr"]; W = R_["W"]; NB = len(NAMES)
VPART = R_["vpart"]
K = R_["J"]["height"] / 1.82                                 # landmark constants below are in 1.82 m units
FPS = 30
nrm = RG.nrm
MX = np.diag([-1.0, 1, 1])


def B(x, f, z): return np.array([x, -f, z], float)                 # char frame -> blender
def axang(ax, deg):
    ax = np.asarray(ax, float); n = np.linalg.norm(ax)
    return np.eye(3) if n < 1e-9 or abs(deg) < 1e-9 else Rot.from_rotvec(ax / n * math.radians(deg)).as_matrix()
EX, EY, EZ = np.array([1.0, 0, 0]), np.array([0, 1.0, 0]), np.array([0, 0, 1.0])


def euler(p=0, y=0, r=0):
    """pitch + = bend forward, yaw + = turn to his left, roll + = lean to his left (world rest axes)"""
    return axang(EZ, y) @ axang(EX, p) @ axang(EY, r)


def frame_map(u0, n0, u1, n1):
    n0 = nrm(n0 - (n0 @ u0) * u0); M0 = np.stack([u0, n0, np.cross(u0, n0)], 1)
    n1 = nrm(n1 - (n1 @ u1) * u1); M1 = np.stack([u1, n1, np.cross(u1, n1)], 1)
    return M1 @ M0.T


def two_bone(s0, t, a, b, pole):
    d = t - s0; L = np.linalg.norm(d); L = np.clip(L, abs(a - b) + 1e-3, 0.9995 * (a + b)); u = nrm(d); t = s0 + u * L
    ca = np.clip((a * a + L * L - b * b) / (2 * a * L), -1, 1); sa = math.sqrt(1 - ca * ca)
    v = pole - (pole @ u) * u; v = nrm(v) if np.linalg.norm(v) > 1e-6 else nrm(np.cross(u, [1, 0, 0]))
    return s0 + a * (ca * u + sa * v), t, v


def fk(Q, Hp):
    H = Hr.copy(); H[0] = Hp
    for i in range(1, NB): H[i] = H[PAR[i]] + Q[PAR[i]] @ (Hr[i] - Hr[PAR[i]])
    return H


blen = lambda n: float(np.linalg.norm(Tr[BI[n]] - Hr[BI[n]]))
REST_DIR = {n: nrm(Tr[BI[n]] - Hr[BI[n]]) for n in NAMES}
# rest bend planes: elbows point back (+y blender), knees forward (-y)
LIMB = {}
for s in "LR":
    LIMB[("arm", s)] = (REST_DIR[f"UpperArm.{s}"], REST_DIR[f"Forearm.{s}"], nrm(np.cross(EY, REST_DIR[f"UpperArm.{s}"])))
    LIMB[("leg", s)] = (REST_DIR[f"Thigh.{s}"], REST_DIR[f"Calf.{s}"], nrm(np.cross(-EY, REST_DIR[f"Thigh.{s}"])))
SH0 = {s: Hr[BI[f"UpperArm.{s}"]] for s in "LR"}
ANK0 = {s: Hr[BI[f"Foot.{s}"]] for s in "LR"}
ARMLEN = blen("UpperArm.L") + blen("Forearm.L")
SHOE = {s: np.nonzero((VPART == "shoe") & ((Vr[:, 0] > 0) == (s == "L")))[0] for s in "LR"}


def lift_for(Rf, s):
    """ankle height that puts the lowest sole vertex on the floor for a foot rotation Rf"""
    P = (Vr[SHOE[s]] - ANK0[s]) @ Rf.T
    return -P[:, 2].min()


ANK_H = lift_for(np.eye(3), "L")

# ------------------------------------------------------------------ landmarks (bone, geom-1.82 coords x left / y up / z front, L side)
LM = {
    "hip": ("Pelvis", (0.200, 0.935, -0.005)),       # wrist spot for a fist / hand on the hip
    "pocket": ("Pelvis", (0.122, 0.885, 0.090)),     # wrist at the front pocket opening (hand goes in, pointing down)
    "back": ("Pelvis", (0.060, 0.930, -0.150)),      # wrists clasped behind the back
    "nape": ("Head", (0.140, 1.560, -0.110)),        # wrist below / behind the ear: hand rubs the back of the head
    "face": ("Head", (0.050, 1.500, 0.230)),         # facepalm wrist (hand up over the eyes)
    "chin": ("Head", (0.040, 1.400, 0.200)),         # think: fist under the chin
    "chest": ("Chest", (0.000, 1.260, 0.150)),       # in front of the chest centre
    "elbow_rest": ("Chest", (0.150, 1.220, 0.150)),  # arms crossed: wrist sits near the other elbow
    "belly": ("Spine", (0.020, 1.080, 0.140)),
    "knee": ("Thigh", (0.090, 0.420, 0.110)),        # on top of the knee (side picks L/R thigh)
}


def lm_world(name, s, Q, H):
    bone, p = LM[name]
    if bone == "Thigh": bone = f"Thigh.{s}"
    p = np.array([p[0], p[1], p[2]]) * K
    pb = np.array([p[0], -p[2], p[1]])
    if s == "R": pb = MX @ pb
    i = BI[bone]
    return H[i] + Q[i] @ (pb - Hr[i])


# ------------------------------------------------------------------ pose channels
STAND = dict(
    root=(0, 0, -0.012), pel=(0, 0, 0), spine=(0, 0, 0), chest=(0, 0, 0), neck=(0, 0, 0), head=(0, 0, 0),
    clavL=(0, 0), clavR=(0, 0),
    # arm: ("aim", abduct deg, flex fwd deg, elbow bend deg) | ("lm", name, (dx out, df, dz)) | ("t", (out, f, z) from the shoulder, chest frame)
    armL=("aim", 7, 4, 12), armR=("aim", 7, 4, 12),
    poleL=(0.45, -1.0, 0.0), poleR=(0.45, -1.0, 0.0),             # elbow direction hint (out, fwd, up) in the chest frame
    handL=(0, 0, 0), handR=(0, 0, 0),                              # twist (+ = palm forward), flex (+ = palm-ward), deviation (+ = thumb-ward)
    footL=(0.022, 0.0, 0.0, 7, 0), footR=(0.022, 0.0, 0.0, 7, 0),  # ankle (out, f, z above the floor contact), yaw out deg, pitch toe up deg
    kneeL=0.15, kneeR=0.15,                                        # knee pole outward bias
)
SCAL = ["root", "pel", "spine", "chest", "neck", "head", "clavL", "clavR", "poleL", "poleR", "handL", "handR", "footL", "footR", "kneeL", "kneeR"]


def flat(p):
    return np.concatenate([np.atleast_1d(np.array(p[k], float)) for k in SCAL])


def unflat(v):
    out, i = {}, 0
    for k in SCAL:
        n = len(np.atleast_1d(STAND[k])); out[k] = v[i:i + n] if n > 1 else float(v[i]); i += n
    return out


def key_weights(frames, n, loop, ease_ends=True):
    """W[f, k]: Catmull-Rom weights of each key at frame f (keys at the given frames; loop: period n, key 0 repeats at n)"""
    fr = list(frames); m = len(fr); Wt = np.zeros((n, m))
    for f in range(n):
        for k in range(m):
            e = np.zeros(m); e[k] = 1.0; Wt[f, k] = cr_eval(fr, e, f, n, loop, ease_ends)
    return Wt


def cr_eval(fr, vals, t, n, loop, ease_ends):
    m = len(fr)
    if m == 1: return vals[0]
    if loop:
        X = list(fr) + [fr[0] + n]; Y = list(vals) + [vals[0]]
        t = t % n
        if t < X[0]: t += n
    else:
        X, Y = list(fr), list(vals)
        if t <= X[0]: return Y[0]
        if t >= X[-1]: return Y[-1]
    j = max(i for i in range(len(X) - 1) if X[i] <= t)
    x0, x1 = X[j], X[j + 1]; y0, y1 = Y[j], Y[j + 1]; h = x1 - x0; u = (t - x0) / h
    def slope(i):
        if loop:
            ip, inn = (i - 1) % m, (i + 1) % m
            xp = X[i] - (fr[i % m] - fr[ip]) % n if True else 0
            dxp = (fr[i % m] - fr[ip]) % n or n; dxn = (fr[inn] - fr[i % m]) % n or n
            return (vals[inn] - vals[ip]) / (dxp + dxn)
        if i == 0 or i == len(X) - 1:
            return 0.0 if ease_ends else (Y[min(i + 1, len(X) - 1)] - Y[max(i - 1, 0)]) / (X[min(i + 1, len(X) - 1)] - X[max(i - 1, 0)])
        if Y[i - 1] == Y[i] or Y[i] == Y[i + 1]: return 0.0          # holds stay flat (no overshoot into contacts)
        return (Y[i + 1] - Y[i - 1]) / (X[i + 1] - X[i - 1])
    m0, m1 = slope(j) * h, slope(j + 1) * h
    u2, u3 = u * u, u * u * u
    return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * m1


# ------------------------------------------------------------------ solve one frame
def body(pv):
    Q = np.tile(np.eye(3), (NB, 1, 1))
    rx, rf, rz = pv["root"]; Hp = Hr[0] + B(rx, rf, rz)
    Q[0] = euler(*pv["pel"])
    for n, k in (("Spine", "spine"), ("Chest", "chest"), ("Neck", "neck"), ("Head", "head")):
        Q[BI[n]] = Q[PAR[BI[n]]] @ euler(*pv[k])
    for s in "LR":
        up, fw = pv["clav" + s]; L = axang(EY, -up) @ axang(EZ, fw)          # raise = roll the clavicle up, fwd = swing forward
        if s == "R": L = MX @ L @ MX
        Q[BI[f"Clavicle.{s}"]] = Q[BI["Chest"]] @ L
        for n in ("UpperArm", "Forearm", "Hand"): Q[BI[f"{n}.{s}"]] = Q[BI[f"Clavicle.{s}"]]
        for n in ("Thigh", "Calf", "Foot"): Q[BI[f"{n}.{s}"]] = Q[0]
    return Q, Hp


def solve_legs(Q, Hp, pv):
    H = fk(Q, Hp)
    for s in "LR":
        out, f, z, yaw, pit = pv["foot" + s]; sg = 1 if s == "L" else -1
        Rf = axang(EZ, sg * yaw) @ axang(EX, -pit)
        a0 = ANK0[s] + B(sg * out, f, 0); a0[2] = lift_for(Rf, s) + z
        it, ic, i_f = BI[f"Thigh.{s}"], BI[f"Calf.{s}"], BI[f"Foot.{s}"]
        hip = H[it]
        fwd = Q[0] @ (-EY); pole = nrm(fwd + Q[0] @ (EX * sg) * pv["knee" + s])
        e, t, v = two_bone(hip, a0, blen(f"Thigh.{s}"), blen(f"Calf.{s}"), pole)
        u0, f0, n0 = LIMB[("leg", s)]; u = nrm(t - hip); n1 = nrm(np.cross(v, u))
        Q[it] = frame_map(u0, n0, nrm(e - hip), n1); Q[ic] = frame_map(f0, n0, nrm(t - e), n1); Q[i_f] = Rf
    return Q


def arm_target(spec, s, Q, H):
    sg = 1 if s == "L" else -1; ic = BI["Chest"]; sh = H[BI[f"UpperArm.{s}"]]
    kind = spec[0]
    if kind == "aim":
        _, abd, flex, bend = spec
        d = axang(EY, -sg * abd) @ axang(EX, -flex) @ np.array([0, 0, -1.0])          # abduct out, flex forward (rest-chest axes)
        a, b = blen(f"UpperArm.{s}"), blen(f"Forearm.{s}")
        L = math.sqrt(a * a + b * b + 2 * a * b * math.cos(math.radians(bend)))
        return sh + Q[ic] @ (d * L)
    if kind == "lm":
        _, name, off = spec
        return lm_world(name, s, Q, H) + Q[ic] @ B(sg * off[0], off[1], off[2])
    if kind == "t":
        o = spec[1]; return sh + Q[ic] @ B(sg * o[0], o[1], o[2])
    raise ValueError(spec)


def solve_arms(Q, Hp, pv, targets):
    H = fk(Q, Hp); ic = BI["Chest"]
    for s in "LR":
        sg = 1 if s == "L" else -1
        iu, il, ih = BI[f"UpperArm.{s}"], BI[f"Forearm.{s}"], BI[f"Hand.{s}"]
        sh = H[iu]; po = pv["pole" + s]; pole = Q[ic] @ nrm(B(sg * po[0], po[1], po[2]))
        e, t, v = two_bone(sh, targets[s], blen(f"UpperArm.{s}"), blen(f"Forearm.{s}"), pole)
        u0, f0, n0 = LIMB[("arm", s)]; u = nrm(t - sh); n1 = nrm(np.cross(v, u))
        Q[iu] = frame_map(u0, n0, nrm(e - sh), n1); Q[il] = frame_map(f0, n0, nrm(t - e), n1)
        tw, fl, dv = pv["hand" + s]
        d0 = REST_DIR[f"Hand.{s}"]; palm0 = np.array([-sg, 0, 0.0]); thumb0 = -EY
        E = axang(d0, -sg * tw) @ axang(thumb0 * sg, fl) @ axang(palm0, dv * 0)    # twist about the hand axis, flex about the thumb axis
        if dv: E = E @ axang(nrm(np.cross(d0, palm0)), dv)
        Q[ih] = Q[il] @ E
    return Q


def local_basis(Q, H):
    qs = np.zeros((NB, 4))
    for i in range(NB):
        p = PAR[i]; L = Q[i] if p < 0 else Q[p].T @ Q[i]
        Bm = Rb[i].T @ L @ Rb[i]; x, y, z, w = Rot.from_matrix(Bm).as_quat(); qs[i] = [w, x, y, z]
    return qs, Rb[0].T @ (H[0] - Hr[0])


def skin(Q, H, idx=None):
    V = Vr if idx is None else Vr[idx]; Wm = W if idx is None else W[idx]
    out = np.zeros_like(V)
    for i in range(NB):
        w = Wm[:, i]; m = w > 0
        if m.any(): out[m] += w[m, None] * ((V[m] - Hr[i]) @ Q[i].T + H[i])
    return out


# ------------------------------------------------------------------ clip evaluation
def resolve(p):
    q = dict(STAND); q.update(p); return q


def run_clip(c):
    n = c["frames"]; loop = c.get("loop", False)
    keys = [(f, resolve(p)) for f, p in c["keys"]]
    fr = [f for f, _ in keys]
    Wt = key_weights(fr, n, loop, c.get("ease", True))
    vals = np.array([flat(p) for _, p in keys])
    out = []
    for f in range(n):
        v = Wt[f] @ vals; pv = unflat(v)
        for ov in c.get("overlay", []): ov(pv, f, n)
        Q, Hp = body(pv); Q = solve_legs(Q, Hp, pv); H = fk(Q, Hp)
        tg = {}
        for s in "LR":
            T = sum(w * arm_target(p["arm" + s], s, Q, H) for w, (_, p) in zip(Wt[f], keys))
            for ov in c.get("arm_overlay", []): T = ov(T, s, f, n, Q, H)
            tg[s] = T
        Q = solve_arms(Q, Hp, pv, tg); H = fk(Q, Hp)
        out.append((Q, H))
    return out


def sinw(f, n, cycles=1, phase=0.0): return math.sin(2 * math.pi * (cycles * f / n + phase))


def add(pv, key, delta):
    v = np.array(np.atleast_1d(pv[key]), float) + np.array(delta, float); pv[key] = v if v.size > 1 else float(v[0])


def main():
    import clips as CL
    allc = CL.CLIPS
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    npz = os.path.join(ROOT, "ref", "anim.npz")
    data = dict(np.load(npz, allow_pickle=True)) if (only and os.path.exists(npz)) else {}
    data.pop("clips", None)
    for name, c in allc.items():
        if only and name not in only: continue
        res = run_clip(c)
        qs = [local_basis(Q, H) for Q, H in res]
        data["q_" + name] = np.array([q for q, _ in qs]); data["l_" + name] = np.array([l for _, l in qs])
        print("CLIP", name, len(res), flush=True)
    names = [k for k in allc if "q_" + k in data]
    data = {k: v for k, v in data.items() if k[2:] in names}
    np.savez(npz, clips=json.dumps(names), **data)
    acts = {}
    for k in names:
        c = allc[k]; n = c["frames"]
        a = {"frames": n - 1 if c.get("loop") else n, "fps": FPS, "seconds": round(n / FPS, 3), "loop": bool(c.get("loop"))}
        for x in ("speed_m_per_s", "cam", "props", "note"):
            if x in c: a[x] = c[x]
        if "speed_m_per_s" in a: a["speed_units_per_s"] = round(a["speed_m_per_s"] * RG.S_ENGINE, 3)
        acts[k] = a
    json.dump(acts, open(os.path.join(ROOT, "out", "actions.json"), "w"), indent=1)
    meta = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
    ft = {"_meta": meta}; ft.update({k: allc[k].get("face", [[1, "open", "neutral"]]) for k in names})
    json.dump(ft, open(os.path.join(ROOT, "out", "face_tracks.json"), "w"), indent=1)
    print("AUTHOR clips", len(names))


if __name__ == "__main__":
    main()

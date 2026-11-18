"""Pose solver for girl2 (rig2): high-level pose params -> per-bone world delta rotations + posed heads, skinning,
Blender local bases. All lengths in model metres (x = her left, -y = her front, z = up), angles in degrees.
Euler helper E(x, y, z) = Rz Ry Rx in armature axes:  +x = bend forward, +y = lean to her left, +z = turn to her left."""
import json, numpy as np
from scipy.spatial.transform import Rotation as Rot

G = np.load("ref/rig2.npz", allow_pickle=True)
NAMES = [str(n) for n in G["names"]]; BI = {n: i for i, n in enumerate(NAMES)}; NB = len(NAMES)
PAR = G["par"]; Hr = G["Hr"]; Tr = G["Tr"]; Hp = G["Hp"]; Rb = G["Rb"]; W = G["W"]; Vr = G["Vr"]; QIDLE = G["Qidle"]
J = {k: np.array(v) for k, v in json.loads(str(G["joints"])).items()}
LAB = G["lab"]; CDOM = {int(k): v for k, v in json.loads(str(G["comp_dom"])).items()}


def E(x=0, y=0, z=0):
    return Rot.from_euler("ZYX", [z, y, x], degrees=True).as_matrix()


def axang(ax, deg):
    ax = np.asarray(ax, float); n = np.linalg.norm(ax)
    return np.eye(3) if n < 1e-9 or abs(deg) < 1e-9 else Rot.from_rotvec(ax / n * np.radians(deg)).as_matrix()


def nrm(v): return v / (np.linalg.norm(v) + 1e-12)


# rest limb data
LEN = {n: np.linalg.norm(Tr[BI[n]] - Hr[BI[n]]) for n in NAMES}


def limb_rest(up, lo):
    a, b = Hr[BI[up]], Hr[BI[lo]]; c = Tr[BI[lo]]
    u0 = nrm(b - a); f0 = nrm(c - b); n0 = nrm(np.cross(b - a, c - b))
    return u0, f0, n0


REST_LIMB = {s: {"arm": limb_rest(f"UpperArm.{s}", f"Forearm.{s}"), "leg": limb_rest(f"Thigh.{s}", f"Calf.{s}")} for s in "LR"}
# his_idle knee pole (posed): knee offset from the hip-ankle line
IDLE_POLE = {}
for s in "LR":
    h, k, a = J["hip" + s], J["knee" + s], J["ankle" + s]; u = nrm(a - h); IDLE_POLE[s] = nrm((k - h) - ((k - h) @ u) * u)
IDLE_ANK = {s: J["ankle" + s].copy() for s in "LR"}
BALL = {s: J["ball" + s].copy() for s in "LR"}
FOOTDIR = {s: nrm((J["toe" + s] - J["ankle" + s]) * [1, 1, 0]) for s in "LR"}


def _hand0(s):
    i = BI[f"Hand.{s}"]; m = W[:, i] > 0.5; P = Vr[m]; c = P.mean(0)
    ax = np.linalg.svd(P - c)[2][2]; d0 = nrm(Tr[i] - Hr[i])
    p0 = ax if (ax @ ([-1, 0.2, 0] if s == "L" else [0.3, 1, 0])) > 0 else -ax   # palm: L faces in (rest hangs), R fist faces the chest
    p0 = nrm(p0 - (p0 @ d0) * d0)
    return d0, p0


HAND0 = ({s: (np.asarray(G["hand0"][k][0]), np.asarray(G["hand0"][k][1])) for k, s in enumerate("LR")} if "hand0" in G.files
         else {s: _hand0(s) for s in "LR"})          # v6: fixed hand frames (the rebuilt hands are modelled in them)


def two_bone(s0, t, a, b, pole):
    d = t - s0; L = np.linalg.norm(d); L = np.clip(L, abs(a - b) + 1e-3, 0.999 * (a + b)); u = nrm(d); t = s0 + u * L
    ca = np.clip((a * a + L * L - b * b) / (2 * a * L), -1, 1); sa = np.sqrt(1 - ca * ca)
    v = pole - (pole @ u) * u; v = nrm(v) if np.linalg.norm(v) > 1e-6 else nrm(np.cross(u, [1, 0, 0]))
    e = s0 + a * (ca * u + sa * v)
    return e, t


def frame_map(u0, n0, u1, n1):
    M0 = np.stack([u0, n0, np.cross(u0, n0)], 1); n1 = nrm(n1 - (n1 @ u1) * u1); M1 = np.stack([u1, n1, np.cross(u1, n1)], 1)
    return M1 @ M0.T


def space_xform(sp, Q, H):
    """(rotation, rest origin, posed origin) of a target space"""
    if sp == "world": return np.eye(3), np.zeros(3), np.zeros(3)
    if sp == "chestN": i = BI["Chest"]; return Q[i] @ CHEST_UNTWIST, Hr[i], H[i]
    i = BI[{"chest": "Chest", "pelvis": "Pelvis", "head": "Head", "spine": "Spine", "thighL": "Thigh.L", "thighR": "Thigh.R",
            "neck": "Neck"}[sp]]
    return Q[i], Hr[i], H[i]


CHEST_UNTWIST = Rot.from_euler("z", 10, degrees=True).as_matrix()   # his_idle chest is twisted ~10 deg (right shoulder forward)


def to_world(sp, p, Q, H):
    R, o0, o1 = space_xform(sp, Q, H); return o1 + R @ (np.asarray(p, float) - o0)


def solve(P, arms_world=None):
    """P: dict of numeric channels (see clips.py), plus P['armL'/'armR'] = None (rest) or dict(t=world pos, pole=world dir, wr=(tw,flex,dev)),
    P['legL'/'legR'] = dict(ank=world, pole=world dir, yaw, heel).  Returns Q (NB,3,3), H (NB,3)."""
    g = lambda k: P.get(k, 0.0)
    Q = np.tile(np.eye(3), (NB, 1, 1)); H = Hr.copy()

    def setb(n, Rloc):
        i = BI[n]; p = PAR[i]
        if p < 0: Q[i] = Rloc; return
        Q[i] = Q[p] @ Rloc; H[i] = H[p] + Q[p] @ (Hr[i] - Hr[p])
    i = BI["Pelvis"]; Q[i] = E(g("prx"), g("pry"), g("prz")); H[i] = Hr[i] + [g("px"), g("py"), g("pz")]
    setb("Spine", E(g("sx"), g("sy"), g("sz"))); setb("Chest", E(g("cx"), g("cy"), g("cz")))
    setb("Neck", E(g("nx"), g("ny"), g("nz"))); setb("Head", E(g("hx"), g("hy"), g("hz")))
    for s in "LR":
        if f"Bust.{s}" in BI: setb(f"Bust.{s}", P.get("_bust" + s, np.eye(3)))
    if "Press.R" in BI: setb("Press.R", axang([1, 0, 0], P.get("_pressR", 0.0)))
    for s, sg in (("L", 1), ("R", -1)):
        setb(f"Clavicle.{s}", E(0, -sg * g(f"cl{s}_up"), -sg * g(f"cl{s}_fw")))
        n_up, n_lo, n_h = f"UpperArm.{s}", f"Forearm.{s}", f"Hand.{s}"
        setb(n_up, np.eye(3))
        arm = P.get("arm" + s)
        u0, f0, n0 = REST_LIMB[s]["arm"]
        if arm is None:
            setb(n_lo, np.eye(3)); setb(n_h, np.eye(3))
        else:
            sh = H[BI[n_up]]; e, t = two_bone(sh, np.asarray(arm["t"], float), LEN[n_up], LEN[n_lo], np.asarray(arm["pole"], float))
            u1 = nrm(e - sh); f1 = nrm(t - e); n1 = np.cross(e - sh, t - e)
            if np.linalg.norm(n1) < 1e-6: n1 = Q[BI[n_up]] @ n0
            n1 = nrm(n1)
            Qu = frame_map(u0, n0, u1, n1); Qf = frame_map(f0, n0, f1, n1)
            iu, il, ih = BI[n_up], BI[n_lo], BI[n_h]; pq = Q[PAR[iu]]
            Q[iu] = Qu; Q[il] = Qf; H[il] = e
            tw, fl, dv = arm.get("wr", (0, 0, 0))
            M0 = np.stack([f0, n0, np.cross(f0, n0)], 1)
            if arm.get("hand") is not None:           # explicit hand orientation: (fingers dir, palm normal) in world
                fd, pd = arm["hand"]; Q[ih] = frame_map(HAND0[s][0], HAND0[s][1], nrm(np.asarray(fd, float)), np.asarray(pd, float))
                if any(abs(x) > 1e-6 for x in (tw, fl, dv)):   # extra wrist offset (drag / flop) in the forearm frame
                    Mf = Qf @ M0; Q[ih] = Mf @ E(tw, fl, dv) @ Mf.T @ Q[ih]
            else:
                Q[ih] = Qf @ M0 @ E(tw, fl, dv) @ M0.T
            H[ih] = t
        # legs
        leg = P.get("leg" + s)
        n_t, n_c, n_f = f"Thigh.{s}", f"Calf.{s}", f"Foot.{s}"
        setb(n_t, np.eye(3))
        hip = H[BI[n_t]]; u0, f0, n0 = REST_LIMB[s]["leg"]
        e, t = two_bone(hip, np.asarray(leg["ank"], float), LEN[n_t], LEN[n_c], np.asarray(leg["pole"], float))
        u1 = nrm(e - hip); f1 = nrm(t - e); n1 = np.cross(e - hip, t - e)
        n1 = nrm(n1) if np.linalg.norm(n1) > 1e-7 else nrm(np.cross(u1, [sg * 0, -1, 0]))
        it, ic, i_f = BI[n_t], BI[n_c], BI[n_f]
        Q[it] = frame_map(u0, n0, u1, n1); Q[ic] = frame_map(f0, n0, f1, n1); H[ic] = e; H[i_f] = t
        lat = nrm(np.cross(FOOTDIR[s], [0, 0, 1]))
        Q[i_f] = axang([0, 0, 1], leg.get("yaw", 0)) @ axang(lat, -leg.get("heel", 0)) @ QIDLE[i_f]
    for s in "LR":                                     # boot-cuff hinge: folds the back of the cuff away from a bent knee
        if f"Cuff.{s}" not in BI: continue
        it, ic, ib = BI[f"Thigh.{s}"], BI[f"Calf.{s}"], BI[f"Cuff.{s}"]
        ut = Q[it] @ nrm(Tr[it] - Hr[it]); uc = Q[ic] @ nrm(Tr[ic] - Hr[ic]); th = np.degrees(np.arccos(np.clip(ut @ uc, -1, 1)))
        Q[ib] = Q[ic] @ axang(CUFF_AX[s], CUFF_SIGN * CUFF_K * max(0.0, th - 20.0)); H[ib] = H[ic] + Q[ic] @ (Hr[ib] - Hr[ic])
    skirt(Q, H, P.get("_skirt"))
    return Q, H


CUFF_K, CUFF_SIGN = 0.30, 1.0
CUFF_AX = {}
for _s in "LR":
    if f"Cuff.{_s}" in BI:
        _ic = BI[f"Calf.{_s}"]; _cd = nrm(Tr[_ic] - Hr[_ic]); _fd = nrm((J["toe" + _s] - J["ankle" + _s]) * [1, 1, 0])
        CUFF_AX[_s] = nrm(np.cross(_cd, _fd))


SK = {"SkirtFL": ("L", np.array([0.7, -0.7, 0])), "SkirtFR": ("R", np.array([-0.7, -0.7, 0])),
      "SkirtBL": ("L", np.array([0.7, 0.7, 0])), "SkirtBR": ("R", np.array([-0.7, 0.7, 0]))}
SKIRT_K = 0.92


def skirt(Q, H, dyn=None):
    ip = BI["Pelvis"]; Qp = Q[ip]
    Rd = dyn["R"] if dyn else np.eye(3); fl = dyn["flare"] if dyn else 0.0
    kf = dyn.get("kf", SKIRT_K) if dyn else SKIRT_K; kb = dyn.get("kb", SKIRT_K) if dyn else SKIRT_K
    for n, (s, o) in SK.items():
        it = BI[f"Thigh.{s}"]
        d0 = QIDLE[it] @ nrm(Tr[it] - Hr[it])                     # his_idle thigh dir (pelvis frame = rest frame)
        d1 = Qp.T @ Q[it] @ nrm(Tr[it] - Hr[it])                   # current thigh dir in pelvis frame
        m = (d1 - d0) * [1, 1, 0.3]; mn = np.linalg.norm(m)
        ang = np.degrees(np.arccos(np.clip(d0 @ d1, -1, 1)))
        k = np.clip((m / (mn + 1e-9)) @ o * 1.5, 0, 1) if mn > 1e-4 else 0
        # also open a little to the side the knee goes
        Rl = axang(np.cross(d0, d1), max(0.0, ang - 4.0) * (kf if n.startswith("SkirtF") else kb) * k)
        Rf = axang(np.cross([0, 0, -1.0], o), fl) if fl else np.eye(3)
        i = BI[n]; Q[i] = Qp @ Rd @ Rf @ Rl; H[i] = H[ip] + Qp @ (Hr[i] - Hr[ip])


def skin(Q, H, V=None):
    V = Vr if V is None else V
    out = np.zeros_like(V)
    for i in range(NB):
        w = W[:, i]; m = w > 0
        if m.any(): out[m] += w[m, None] * ((V[m] - Hr[i]) @ Q[i].T + H[i])
    return out


def local_basis(Q, H):
    """Blender pose: per bone quaternion (w,x,y,z) of matrix_basis and the root location (bone space, metres)"""
    qs = np.zeros((NB, 4)); loc = np.zeros(3)
    for i in range(NB):
        p = PAR[i]; L = Q[i] if p < 0 else Q[p].T @ Q[i]
        B = Rb[i].T @ L @ Rb[i]; x, y, z, w = Rot.from_matrix(B).as_quat(); qs[i] = [w, x, y, z]
    ip = BI["Pelvis"]; loc = Rb[ip].T @ (H[ip] - Hr[ip])
    return qs, loc

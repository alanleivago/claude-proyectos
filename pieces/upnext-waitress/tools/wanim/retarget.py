"""Retarget Ashley's animation set (upnext-girl2, snapshot in ref/ashley/) onto the waitress rig.
python -I tools/wanim/retarget.py [clip,clip,...]
 per frame: pelvis / spine / neck / head / clavicle / bust rotations copied; legs = two-bone IK to Ashley's ankles mapped
 by the leg-length ratio (feet planted where hers are, floor contacts kept); arms = two-bone IK to a wrist target blended
 from shoulder-, chest-, head-, pelvis-, thigh- and floor-relative mappings by how close her wrist is to each part
 (contacts land on the waitress body), hands oriented like hers; then arm / body proxy push-out (no clipping into
 corset, hips, thighs, head), temporal smoothing, floor pass, self-checks.
 -> ref/anim_w.npz (Blender basis quats + root loc, metres), out/actions.json, out/face_tracks.json, ref/checks.txt"""
import sys, os, json, numpy as np
from scipy.spatial.transform import Rotation as Rot

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import rig as RG

W_ = RG.load(os.path.join(ROOT, "ref", "build2_B.json"))
NB = len(W_["names"]); BI = W_["BI"]; PAR = W_["par"]; HrW = W_["Hr"]; TrW = W_["Tr"]; RbW = W_["Rb"]; VrW = W_["Vr"]; WW = W_["W"]
VPART = W_["vpart"]
GA = np.load(os.path.join(ROOT, "ref", "ashley", "rig2.npz"), allow_pickle=True)
AN = np.load(os.path.join(ROOT, "ref", "ashley", "anim2.npz"), allow_pickle=True)
NA = [str(n) for n in GA["names"]]; BA = {n: i for i, n in enumerate(NA)}; NBA = len(NA)
PARA = GA["par"]; HrA = GA["Hr"]; TrA = GA["Tr"]; RbA = GA["Rb"]; WA = GA["W"]; VrA = GA["Vr"]
nrm = RG.nrm


def axang(ax, deg):
    ax = np.asarray(ax, float); n = np.linalg.norm(ax)
    return np.eye(3) if n < 1e-9 or abs(deg) < 1e-9 else Rot.from_rotvec(ax / n * np.radians(deg)).as_matrix()


def qmat(q): return Rot.from_quat([q[1], q[2], q[3], q[0]]).as_matrix()


def two_bone(s0, t, a, b, pole):
    d = t - s0; L = np.linalg.norm(d); L = np.clip(L, abs(a - b) + 1e-3, 0.999 * (a + b)); u = nrm(d); t = s0 + u * L
    ca = np.clip((a * a + L * L - b * b) / (2 * a * L), -1, 1); sa = np.sqrt(1 - ca * ca)
    v = pole - (pole @ u) * u; v = nrm(v) if np.linalg.norm(v) > 1e-6 else nrm(np.cross(u, [1, 0, 0]))
    return s0 + a * (ca * u + sa * v), t


def frame_map(u0, n0, u1, n1):
    n0 = nrm(n0 - (n0 @ u0) * u0)
    M0 = np.stack([u0, n0, np.cross(u0, n0)], 1); n1 = nrm(n1 - (n1 @ u1) * u1); M1 = np.stack([u1, n1, np.cross(u1, n1)], 1)
    return M1 @ M0.T


# ------------------------------------------------------------------ rest data both characters
def blen(H, T, n, B): return np.linalg.norm(T[B[n]] - H[B[n]])
K = (HrW[BI["Thigh.L"]][2] - HrW[BI["Foot.L"]][2] + HrW[BI["Thigh.R"]][2] - HrW[BI["Foot.R"]][2]) / \
    (HrA[BA["Thigh.L"]][2] - HrA[BA["Foot.L"]][2] + HrA[BA["Thigh.R"]][2] - HrA[BA["Foot.R"]][2])     # leg length ratio
ARM_A = {s: blen(HrA, TrA, f"UpperArm.{s}", BA) + blen(HrA, TrA, f"Forearm.{s}", BA) for s in "LR"}
ARM_W = {s: blen(HrW, TrW, f"UpperArm.{s}", BI) + blen(HrW, TrW, f"Forearm.{s}", BI) for s in "LR"}
ANKO_A = (HrA[BA["Foot.L"]] + HrA[BA["Foot.R"]]) / 2; ANKO_W = (HrW[BI["Foot.L"]] + HrW[BI["Foot.R"]]) / 2


def limb_rest(H, T, B, up, lo):
    a, b, c = H[B[up]], H[B[lo]], T[B[lo]]
    n = np.cross(b - a, c - b)
    if np.linalg.norm(n) < 1e-6: n = np.array([1.0, 0, 0])
    return nrm(b - a), nrm(c - b), nrm(n)


def dom_verts(W, B, names, thr=0.5):
    return np.nonzero(W[:, [B[n] for n in names if n in B]].sum(1) > thr)[0]


def box(V, idx):
    P = V[idx]; mn, mx = P.min(0), P.max(0); return (mn + mx) / 2, (mx - mn) / 2


ANCH = {"Chest": ["Chest", "Bust.L", "Bust.R"], "Head": ["Head"], "Pelvis": ["Pelvis", "SkirtFL", "SkirtFR", "SkirtBL", "SkirtBR"],
        "Spine": ["Spine"], "Thigh.L": ["Thigh.L"], "Thigh.R": ["Thigh.R"]}
BOX = {}
for a, ns in ANCH.items():
    ca, ea = box(VrA, dom_verts(WA, BA, ns)); cw, ew = box(VrW, dom_verts(WW, BI, ns))
    BOX[a] = (ca, ea, cw, ew)
# Ashley hand frames (core._hand0) and the waitress ones (palm towards the body at rest)
def hand0(H, T, V, Wm, B, s, medial, svd=True):
    i = B[f"Hand.{s}"]; P = V[Wm[:, i] > 0.5]; c = P.mean(0); ax = np.linalg.svd(P - c)[2][2]; d0 = nrm(T[i] - H[i])
    if not svd: ax = np.asarray(medial, float)          # her fist has no flat palm: palm = towards the body at rest
    p0 = ax if ax @ medial > 0 else -ax; return d0, nrm(p0 - (p0 @ d0) * d0)
HAND_A = {s: hand0(HrA, TrA, VrA, WA, BA, s, np.array([-1, 0.2, 0]) if s == "L" else np.array([0.3, 1, 0])) for s in "LR"}
HAND_W = {s: hand0(HrW, TrW, VrW, WW, BI, s, np.array([-1.0, 0, 0]) if s == "L" else np.array([1.0, 0, 0]), svd=False) for s in "LR"}
FOOT_A = {s: (nrm(TrA[BA[f"Foot.{s}"]] - HrA[BA[f"Foot.{s}"]]),) for s in "LR"}
FOOT_W = {s: (nrm(TrW[BI[f"Foot.{s}"]] - HrW[BI[f"Foot.{s}"]]),) for s in "LR"}
LIMB_W = {s: {"arm": limb_rest(HrW, TrW, BI, f"UpperArm.{s}", f"Forearm.{s}"), "leg": limb_rest(HrW, TrW, BI, f"Thigh.{s}", f"Calf.{s}")} for s in "LR"}


def swing(a, b):
    """minimal rotation taking unit a to unit b"""
    a, b = nrm(a), nrm(b); v = np.cross(a, b); c = float(a @ b)
    if np.linalg.norm(v) < 1e-9: return np.eye(3) if c > 0 else axang(np.cross(a, [1, 0, 0]) if abs(a[0]) < 0.9 else np.cross(a, [0, 1, 0]), 180)
    return axang(v, np.degrees(np.arctan2(np.linalg.norm(v), c)))


# rest (no-twist) poles: the pole that reproduces the rest roll of each limb, carried by a pure swing (v5)
REST_POLE = {}
for _s in "LR":
    for _k, (_a, _b, _c) in (("arm", (f"UpperArm.{_s}", f"Forearm.{_s}", f"Hand.{_s}")), ("leg", (f"Thigh.{_s}", f"Calf.{_s}", f"Foot.{_s}"))):
        _u0, _f0, _n0 = LIMB_W[_s][_k]; _d0 = nrm(HrW[BI[_c]] - HrW[BI[_a]])
        _v0 = np.cross(_d0, _n0); REST_POLE[(_s, _k)] = (_d0, nrm(_v0 - (_v0 @ _d0) * _d0))


def calm_pole(s, kind, R_parent, root, target, pole_a, bend):
    """Ashley's pole for a clearly bent limb, the no-twist pole (rest pole swung onto the current limb direction) for a
    straight one: a straight limb has no defined bend plane, which made shoulders / thighs spin (v5)"""
    d0, v0 = REST_POLE[(s, kind)]
    u1 = R_parent.T @ nrm(target - root)
    pm = R_parent @ (swing(d0, u1) @ v0)
    w = float(np.clip((bend - 0.05) / 0.22, 0.0, 1.0)); w = w * w * (3 - 2 * w)
    return nrm(w * nrm(pole_a) + (1 - w) * pm) if np.linalg.norm(pole_a) > 1e-6 else pm
# floor contact groups
BOOT_A = {s: np.nonzero((WA[:, BA[f"Calf.{s}"]] + WA[:, BA[f"Foot.{s}"]] > 0.5) & (VrA[:, 2] < 0.25))[0] for s in "LR"}
BODY_A = np.setdiff1d(np.arange(len(VrA)), np.r_[BOOT_A["L"], BOOT_A["R"]])
SHOE_W = {s: np.nonzero((VPART == "shoe") & ((VrW[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
LOWLEG_W = {s: np.nonzero(np.isin(VPART, ["leg", "legcap"]) & (VrW[:, 2] < 0.25) & ((VrW[:, 0] > 0) == (s == "L")))[0] for s in "LR"}
BODY_W = np.nonzero(~np.isin(VPART, ["shoe", "legcap"]))[0]
ARMV_W = np.nonzero(np.isin(VPART, ["uparm", "uparm_m", "forearm", "forearm_m"]))[0]


# ------------------------------------------------------------------ Ashley decode
def decode(clip):
    q = AN["q_" + clip][:, :NBA]; l = AN["l_" + clip]
    out = []
    for f in range(len(q)):
        Q = np.zeros((NBA, 3, 3)); H = HrA.copy()
        for i in range(NBA):
            L = RbA[i] @ qmat(q[f, i]) @ RbA[i].T; p = PARA[i]
            Q[i] = L if p < 0 else Q[p] @ L
            H[i] = HrA[i] + RbA[i] @ l[f] if p < 0 else H[p] + Q[p] @ (HrA[i] - HrA[p])
        out.append((Q, H))
    return out


def skin(V, Wm, Hr, Q, H, idx=None):
    V = V if idx is None else V[idx]; Wm = Wm if idx is None else Wm[idx]
    out = np.zeros_like(V)
    for i in range(len(Hr)):
        w = Wm[:, i]; m = w > 0
        if m.any(): out[m] += w[m, None] * ((V[m] - Hr[i]) @ Q[i].T + H[i])
    return out


# ------------------------------------------------------------------ waitress pose
def fk(Q, Hp):
    H = HrW.copy(); H[0] = Hp
    for i in range(1, NB): H[i] = H[PAR[i]] + Q[PAR[i]] @ (HrW[i] - HrW[PAR[i]])
    return H


# per-clip fixes for her bigger bust / torso (her hands got sandwiched in Ashley's poses)
ADJ = {"arms_crossed": dict(wrist_fwd=0.07), "hands_on_knees": dict(unbend=12.0, wrist_fwd=0.03), "kneel": dict(spread_ankles=0.0, wrist_pel=(0.0, 0.0, 0.015)),
       "hug_knees": dict(wrist_pel=(0.0, -0.075, 0.02)), "crouch_pickup": dict(wrist_pel=(0.0, -0.045, 0.025))}
CUR = {"clip": None}


def body_pose(Qa, Ha, dz=0.0):
    Q = np.tile(np.eye(3), (NB, 1, 1))
    Q[0] = Qa[BA["Pelvis"]]
    Hp = HrW[0] + K * (Ha[BA["Pelvis"]] - HrA[BA["Pelvis"]]) + [0, 0, dz]
    adj = ADJ.get(CUR["clip"], {})
    for n in ["Spine", "Chest", "Neck", "Head", "Bust.L", "Bust.R", "Clavicle.L", "Clavicle.R"]:
        ia = BA[n]; pa = PARA[ia]; i = BI[n]
        L = Qa[pa].T @ Qa[ia]
        if n in ("Spine", "Chest") and adj.get("unbend"): L = axang([1, 0, 0], -adj["unbend"] / 2) @ L
        if n == "Head" and adj.get("unbend"): L = axang([1, 0, 0], adj["unbend"] * 0.6) @ L
        Q[i] = Q[PAR[i]] @ L
    for n in ["UpperArm", "Forearm", "Hand"]:
        for s in "LR": Q[BI[f"{n}.{s}"]] = Q[BI[f"Clavicle.{s}"]]
    for n in ["Thigh", "Calf", "Foot"]:
        for s in "LR": Q[BI[f"{n}.{s}"]] = Q[0]
    return Q, Hp


def leg_targets(Qa, Ha):
    out = {}
    for s in "LR":
        A = Ha[BA[f"Foot.{s}"]]; hip = Ha[BA[f"Thigh.{s}"]]; kn = Ha[BA[f"Calf.{s}"]]
        T = ANKO_W + K * (A - ANKO_A)
        u = nrm(A - hip); pole = (kn - hip) - ((kn - hip) @ u) * u
        bend = np.linalg.norm(pole) / np.linalg.norm(TrA[BA[f"Thigh.{s}"]] - HrA[BA[f"Thigh.{s}"]])
        fd = Qa[BA[f"Foot.{s}"]] @ FOOT_A[s][0]
        up = Qa[BA[f"Foot.{s}"]] @ nrm(np.cross(np.cross(FOOT_A[s][0], [0, 0, 1]), FOOT_A[s][0]))
        out[s] = dict(t=T, pole=nrm(pole) if np.linalg.norm(pole) > 1e-5 else Qa[0] @ [0, -1, 0], fd=fd, up=up, bend=bend)
    return out


def solve_legs(Q, Hp, LT):
    H = fk(Q, Hp)
    for s in "LR":
        it, ic, i_f = BI[f"Thigh.{s}"], BI[f"Calf.{s}"], BI[f"Foot.{s}"]
        hip = H[it]; a, b = np.linalg.norm(HrW[ic] - HrW[it]), np.linalg.norm(HrW[i_f] - HrW[ic])
        pole = calm_pole(s, "leg", Q[0], hip, LT[s]["t"], LT[s]["pole"], LT[s].get("bend", 1.0))
        e, t = two_bone(hip, LT[s]["t"], a, b, pole)
        u0, f0, n0 = LIMB_W[s]["leg"]; n1 = np.cross(e - hip, t - e)
        uu = nrm(LT[s]["t"] - hip); vv = pole - (pole @ uu) * uu
        n1 = nrm(np.cross(nrm(vv), uu)) if np.linalg.norm(vv) > 1e-6 else Q[0] @ n0
        Q[it] = frame_map(u0, n0, nrm(e - hip), n1); Q[ic] = frame_map(f0, n0, nrm(t - e), n1)
        fd0 = FOOT_W[s][0]; up0 = nrm(np.cross(np.cross(fd0, [0, 0, 1]), fd0))
        Q[i_f] = frame_map(fd0, up0, LT[s]["fd"], LT[s]["up"])
    return Q


def anchor_point(name, Qa, Ha, Q, H, p_a):
    ca, ea, cw, ew = BOX[name]
    ia = BA[name if name in BA else "Pelvis"]; iw = BI[name]
    Ca = Ha[ia] + Qa[ia] @ (ca - HrA[ia]); Cw = H[iw] + Q[iw] @ (cw - HrW[iw])
    off = Qa[ia].T @ (p_a - Ca)
    return Cw + Q[iw] @ (off * (ew / np.maximum(ea, 1e-3))), Ca, ea


def box_dist(p_local, e):
    d = np.maximum(np.abs(p_local) - e, 0); return np.linalg.norm(d)


def arm_targets(Qa, Ha, Q, H):
    out = {}
    for s in "LR":
        Sa, Ea, Wa = Ha[BA[f"UpperArm.{s}"]], Ha[BA[f"Forearm.{s}"]], Ha[BA[f"Hand.{s}"]]
        Sw = H[BI[f"UpperArm.{s}"]]
        T_sh = Sw + (Wa - Sa) * (ARM_W[s] / ARM_A[s])
        ext = np.linalg.norm(Wa - Sa) / ARM_A[s]
        Ts, ws = [T_sh], [0.12 + 1.5 * max(0.0, ext - 0.8)]
        for nm in ["Chest", "Head", "Pelvis", "Spine", "Thigh.L", "Thigh.R"]:
            T, Ca, ea = anchor_point(nm, Qa, Ha, Q, H, Wa)
            ia = BA[nm]; d = box_dist(Qa[ia].T @ (Wa - Ca), ea)
            Ts.append(T); ws.append(np.exp(-(d / 0.055) ** 2) * (1.4 if nm == "Head" else 1.0))
        if Wa[2] < 0.10:                                                    # on / near the floor
            Tf = ANKO_W + K * (Wa - ANKO_A); Tf[2] = Wa[2] * K
            Ts.append(Tf); ws.append(3.0 * np.exp(-(Wa[2] / 0.05) ** 2))
        ws = np.array(ws); T = (np.array(Ts) * ws[:, None]).sum(0) / ws.sum()
        fw = ADJ.get(CUR["clip"], {}).get("wrist_fwd", 0.0)
        if fw: T = T + Q[BI["Chest"]] @ np.array([0, -fw, 0])
        wp = ADJ.get(CUR["clip"], {}).get("wrist_pel")
        if wp is not None: T = T + Q[0] @ np.array(wp)
        u = nrm(Wa - Sa); pole = (Ea - Sa) - ((Ea - Sa) @ u) * u
        bend = np.linalg.norm(pole) / np.linalg.norm(TrA[BA[f"UpperArm.{s}"]] - HrA[BA[f"UpperArm.{s}"]])
        pole = calm_pole(s, "arm", Q[BI["Chest"]], Sw, T, pole, bend)
        hd = Qa[BA[f"Hand.{s}"]]
        out[s] = dict(t=T, pole=pole,
                      fd=hd @ HAND_A[s][0], pd=hd @ HAND_A[s][1])
    return out


def solve_arms(Q, Hp, AT):
    H = fk(Q, Hp)
    for s in "LR":
        iu, il, ih = BI[f"UpperArm.{s}"], BI[f"Forearm.{s}"], BI[f"Hand.{s}"]
        sh = H[iu]; a, b = np.linalg.norm(HrW[il] - HrW[iu]), np.linalg.norm(HrW[ih] - HrW[il])
        u = nrm(AT[s]["t"] - sh); pole = AT[s]["pole"]; v = pole - (pole @ u) * u
        if np.linalg.norm(v) < 0.35:                                         # pole along the arm: blend in a stable default
            dflt = Q[BI["Chest"]] @ np.array([0.6 * (1 if s == "L" else -1), 0.6, -0.5])
            w = (0.35 - np.linalg.norm(v)) / 0.35 * 2.0; pole = nrm(pole + w * nrm(dflt))
        e, t = two_bone(sh, AT[s]["t"], a, b, pole)
        v = pole - (pole @ u) * u; v = nrm(v) if np.linalg.norm(v) > 1e-6 else nrm(np.cross(u, [1, 0, 0]))
        u0, f0, n0 = LIMB_W[s]["arm"]; n1 = nrm(np.cross(v, u))              # arm plane from the pole: no flips when straight
        Q[iu] = frame_map(u0, n0, nrm(e - sh), n1); Q[il] = frame_map(f0, n0, nrm(t - e), n1)
        Q[ih] = frame_map(HAND_W[s][0], HAND_W[s][1], nrm(AT[s]["fd"]), AT[s]["pd"])
    return Q


# ------------------------------------------------------------------ body proxies (ellipsoids in bone frames) for arm push-out
def make_proxy(bone, names, shrink=1.0, pad=0.0):
    i = BI[bone]; idx = dom_verts(WW, BI, names)
    P = (VrW[idx] - HrW[i]) @ RbW[i]                       # bone-frame coords
    mn, mx = P.min(0), P.max(0); c = (mn + mx) / 2; r = (mx - mn) / 2 * shrink + pad
    return dict(bone=i, c=c, r=r)


PROX = {"head": make_proxy("Head", ["Head"], 0.92), "chest": make_proxy("Chest", ["Chest", "Bust.L", "Bust.R"], 0.86),
        "waist": make_proxy("Spine", ["Spine"], 0.95), "hips": make_proxy("Pelvis", ["Pelvis"], 0.95),
        "thighL": make_proxy("Thigh.L", ["Thigh.L"], 0.90), "thighR": make_proxy("Thigh.R", ["Thigh.R"], 0.90)}


def arm_points(H, Q, s):
    sh, el, wr = H[BI[f"UpperArm.{s}"]], H[BI[f"Forearm.{s}"]], H[BI[f"Hand.{s}"]]
    hd = Q[BI[f"Hand.{s}"]] @ HAND_W[s][0]
    return {"ua": ((sh + el) / 2, 0.038), "el": (el, 0.034), "fa": ((el + wr) / 2, 0.032), "wr": (wr, 0.032), "hd": (wr + hd * 0.055, 0.043)}


def penetration(p, rad, pr, Q, H):
    i = pr["bone"]; R = Q[i] @ RbW[i]; c = H[i] + R @ pr["c"]
    loc = R.T @ (p - c); rr = pr["r"] + rad; rho = np.linalg.norm(loc / rr)
    if rho >= 1.0: return 0.0, None
    g = R @ nrm(loc / rr ** 2)
    return (1.0 - rho) * float(np.mean(rr)), g


SKIP = {("ua", "chest"), ("ua", "waist"), ("el", "chest")}


def push(Q, Hp, AT, iters=6):
    tot = {s: np.zeros(3) for s in "LR"}; ptot = {s: np.zeros(3) for s in "LR"}
    for _ in range(iters):
        Q = solve_arms(Q, Hp, AT); H = fk(Q, Hp); moved = False
        for s in "LR":
            for k, (p, r) in arm_points(H, Q, s).items():
                for nm, pr in PROX.items():
                    if (k, nm) in SKIP: continue
                    d, g = penetration(p, r, pr, Q, H)
                    if d <= 0: continue
                    moved = True; step = g * (d + 0.004)
                    if k in ("wr", "hd", "fa"): AT[s]["t"] = AT[s]["t"] + step * (1.0 if k != "fa" else 0.7); tot[s] += step
                    if k in ("el", "ua"): AT[s]["t"] = AT[s]["t"] + step * 0.6
                    if k in ("el", "ua", "fa"):
                        AT[s]["pole"] = nrm(AT[s]["pole"] + 3.0 * step / max(np.linalg.norm(step), 1e-6) * min(1.0, d * 25)); ptot[s] += step
        if not moved: break
    return Q, AT


def max_pen(Q, H):
    worst = (0.0, "")
    for s in "LR":
        for k, (p, r) in arm_points(H, Q, s).items():
            for nm, pr in PROX.items():
                if (k, nm) in SKIP: continue
                d, _ = penetration(p, r, pr, Q, H)
                if d > worst[0]: worst = (d, f"{k}{s}-{nm}")
    return worst


def smooth(arr, loop, w=2):
    arr = np.asarray(arr, float); n = len(arr); out = np.zeros_like(arr)
    for i in range(n):
        idx = [(i + j) % n if loop else min(max(i + j, 0), n - 1) for j in range(-w, w + 1)]
        out[i] = arr[idx].mean(0)
    return out


def local_basis(Q, H):
    qs = np.zeros((NB, 4))
    for i in range(NB):
        p = PAR[i]; L = Q[i] if p < 0 else Q[p].T @ Q[i]
        B = RbW[i].T @ L @ RbW[i]; x, y, z, w = Rot.from_matrix(B).as_quat(); qs[i] = [w, x, y, z]
    return qs, RbW[0].T @ (H[0] - HrW[0])



# ------------------------------------------------------------------ mesh-based push-out (same metric as mesh_check)
from scipy.spatial import cKDTree
_F = np.array([f["v"] for f in W_["J"]["faces"]]); _FP = np.array([f["part"] for f in W_["J"]["faces"]])
_XS = np.array([VrW[f[0], 0] for f in _F])
BODYF = _F[np.isin(_FP, ["torso", "band", "pelvis", "head", "face", "neck", "leg"])]
ARMV = {s: np.nonzero(np.isin(VPART, ["forearm" if s == "R" else "forearm_m"]))[0] for s in "LR"}
HANDV = {s: ARMV[s][VrW[ARMV[s], 2] < 0.93] for s in "LR"}
LEGF = {s: _F[(_FP == "leg") & ((_XS > 0) == (s == "L"))] for s in "LR"}
LEGLOW = {s: (lambda v: v[VrW[v, 2] < 0.80])(np.unique(LEGF[s][VrW[LEGF[s]].mean(1)[:, 2] < 0.78])) for s in "LR"}   # crotch ring excluded


def _closest(p, a, b, c):
    ab, ac, ap = b - a, c - a, p - a
    d1, d2 = (ab * ap).sum(1), (ac * ap).sum(1); bp = p - b; d3, d4 = (ab * bp).sum(1), (ac * bp).sum(1)
    cp = p - c; d5, d6 = (ab * cp).sum(1), (ac * cp).sum(1)
    va = d3 * d6 - d5 * d4; vb = d5 * d2 - d1 * d6; vc = d1 * d4 - d3 * d2
    den = np.where(np.abs(va + vb + vc) < 1e-15, 1e-15, va + vb + vc); v = vb / den; w = vc / den
    res = a + ab * v[:, None] + ac * w[:, None]
    m = (d1 <= 0) & (d2 <= 0); res[m] = a[m]
    m = (d3 >= 0) & (d4 <= d3); res[m] = b[m]
    m = (d6 >= 0) & (d5 <= d6); res[m] = c[m]
    m = (vc <= 0) & (d1 >= 0) & (d3 <= 0); t = d1 / np.where(d1 - d3 == 0, 1e-15, d1 - d3); res[m] = (a + ab * t[:, None])[m]
    m = (vb <= 0) & (d2 >= 0) & (d6 <= 0); t = d2 / np.where(d2 - d6 == 0, 1e-15, d2 - d6); res[m] = (a + ac * t[:, None])[m]
    m = (va <= 0) & ((d4 - d3) >= 0) & ((d5 - d6) >= 0); t = (d4 - d3) / np.where((d4 - d3) + (d5 - d6) == 0, 1e-15, (d4 - d3) + (d5 - d6))
    res[m] = (b + (c - b) * t[:, None])[m]
    return res


def sdepth(V, pts, faces, k=8, maxd=0.10):
    """per point: inward depth (>0 = under the surface) and the outward normal of the nearest triangle"""
    A, B, Cc = V[faces[:, 0]], V[faces[:, 1]], V[faces[:, 2]]; N = np.cross(B - A, Cc - A); N /= np.linalg.norm(N, axis=1)[:, None] + 1e-12
    tree = cKDTree((A + B + Cc) / 3); P = V[pts]; _, idx = tree.query(P, k=min(k, len(faces)))
    D = np.zeros(idx.shape); DOT = np.zeros(idx.shape)
    for j in range(idx.shape[1]):
        ii = idx[:, j]; cp = _closest(P, A[ii], B[ii], Cc[ii]); D[:, j] = np.linalg.norm(P - cp, axis=1)
        DOT[:, j] = ((P - cp) * N[ii]).sum(1)
    best = D.min(1); tie = D <= best[:, None] + 2e-4                     # closest point on an edge / vertex: vote of all
    vote = (DOT * tie).sum(1)                                              # faces sharing it (pseudo-normal sign)
    nn = np.zeros((len(P), 3))
    for k in range(len(P)):
        js = np.nonzero(tie[k])[0]; nn[k] = nrm(N[idx[k, js]].sum(0))
    return np.where((vote < 0) & (best < maxd), best, 0.0), nn      # deeper than a limb = open-rim artefact


def mesh_push(Q, Hp, AT, iters=7):
    for _ in range(iters):
        Q = solve_arms(Q, Hp, AT); H = fk(Q, Hp); V = skin(VrW, WW, HrW, Q, H); moved = False
        for s in "LR":
            d, n = sdepth(V, ARMV[s], BODYF)
            if d.max() <= 0.002: continue
            j = int(d.argmax()); m = d > 0.002
            g = (n[m] * d[m, None]).sum(0) / d[m].sum()                      # all penetrating verts: opposite sides cancel
            if np.linalg.norm(g) < 0.35: g = Q[BI["Chest"]] @ np.array([0, -1.0, 0])   # sandwiched: come out in front
            step = nrm(g) * (d[j] + 0.006); moved = True
            AT[s]["t"] = AT[s]["t"] + step
            if ARMV[s][j] not in HANDV[s]:                                  # forearm near the elbow: also swing the elbow out
                AT[s]["pole"] = nrm(AT[s]["pole"] + 2.0 * nrm(step))
        if not moved: break
    return Q, AT


def arm_depth(Q, Hp):
    H = fk(Q, Hp); V = skin(VrW, WW, HrW, Q, H)
    return max(float(sdepth(V, ARMV[s], BODYF)[0].max()) for s in "LR")


def leg_depth(V):
    return max(float(sdepth(V, LEGLOW["L"], LEGF["R"], maxd=0.06)[0].max()), float(sdepth(V, LEGLOW["R"], LEGF["L"], maxd=0.06)[0].max()))

# ------------------------------------------------------------------ one clip
def gsmooth(arr, loop, sigma):
    arr = np.asarray(arr, float); n = len(arr)
    if sigma <= 0 or n < 3: return arr.copy()
    r = int(np.ceil(3 * sigma)); k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    out = np.zeros_like(arr)
    for j, w in zip(range(-r, r + 1), k):
        idx = (np.arange(n) + j) % n if loop else np.clip(np.arange(n) + j, 0, n - 1)
        out += w * arr[idx]
    return out


def envelope(vecs, loop, half=4, sigma=0.0):
    """smooth corrections that keep their peaks: every frame's correction spreads to its neighbours with a raised-cosine
    bump (weight 1 at the frame itself); each frame takes the largest weighted bump that reaches it"""
    V = np.asarray(vecs, float); n = len(V); mag = np.linalg.norm(V.reshape(n, -1), axis=1); E = np.zeros_like(V); best = np.zeros(n)
    for j in np.nonzero(mag > 1e-5)[0]:
        for k in range(-half, half + 1):
            i = (j + k) % n if loop else j + k
            if not (0 <= i < n): continue
            w = 0.5 * (1 + np.cos(np.pi * k / (half + 1)))
            if w * mag[j] > best[i]: best[i] = w * mag[j]; E[i] = w * V[j]
    return gsmooth(E, loop, sigma) if sigma > 0 else E


def to_local(Qc, Hc, AT):
    return {s: dict(t=Qc.T @ (AT[s]["t"] - Hc), pole=Qc.T @ AT[s]["pole"], fd=Qc.T @ AT[s]["fd"], pd=Qc.T @ AT[s]["pd"]) for s in "LR"}


def to_world(Qc, Hc, L):
    return {s: dict(t=Hc + Qc @ L[s]["t"], pole=nrm(Qc @ L[s]["pole"]), fd=nrm(Qc @ L[s]["fd"]), pd=Qc @ L[s]["pd"]) for s in "LR"}


def run_clip(clip, loop):
    CUR["clip"] = clip
    frames = decode(clip); n = len(frames); ic = BI["Chest"]
    # pass 1: body + legs, floor contacts, leg spread (per frame); the leg target offsets are then smoothed in time
    rec = []
    for Qa, Ha in frames:
        Va = skin(VrA, WA, HrA, Qa, Ha)
        rec.append(dict(Qa=Qa, Ha=Ha, za_body=Va[BODY_A, 2].min(), za_foot={s: Va[BOOT_A[s], 2].min() for s in "LR"}))
    adj = ADJ.get(clip, {})
    for r in rec:
        Q, Hp = body_pose(r["Qa"], r["Ha"]); LT = leg_targets(r["Qa"], r["Ha"]); r["LT0"] = {s: LT[s]["t"].copy() for s in "LR"}; dz = 0.0
        for _ in range(3):
            Q = solve_legs(Q, Hp + [0, 0, dz], LT); H = fk(Q, Hp + [0, 0, dz]); V = skin(VrW, WW, HrW, Q, H)
            for s in "LR":
                mz = V[SHOE_W[s], 2].min()
                if r["za_foot"][s] < 0.012 or mz < -0.002: LT[s]["t"] = LT[s]["t"] + [0, 0, max(-mz, -0.03) if r["za_foot"][s] < 0.012 else -mz]
            if r["za_body"] < 0.025:
                bz = V[BODY_W, 2].min(); dz += (max(r["za_body"], 0.0) - bz) * 0.8
        for _ in range(4):
            Q = solve_legs(Q, Hp + [0, 0, dz], LT); V = skin(VrW, WW, HrW, Q, fk(Q, Hp + [0, 0, dz]))
            dl = leg_depth(V)
            if dl <= 0.004: break
            lat = Q[0] @ np.array([1.0, 0, 0]); ka = adj.get("spread_ankles", 1.0)
            for s, sg in (("L", 1), ("R", -1)):
                LT[s]["t"] = LT[s]["t"] + lat * sg * (dl / 2 + 0.004) * ka
                LT[s]["pole"] = nrm(LT[s]["pole"] + lat * sg * 0.35 * (2 - ka))
        r["dz"] = dz; r["LT"] = LT
    dzs = gsmooth([r["dz"] for r in rec], loop, 1.0)
    for s in "LR":
        off = gsmooth([r["LT"][s]["t"] - r["LT0"][s] for r in rec], loop, 1.2)
        pol = gsmooth([r["LT"][s]["pole"] for r in rec], loop, 1.2)
        for r, o, pp in zip(rec, off, pol): r["LT"][s]["t"] = r["LT0"][s] + o; r["LT"][s]["pole"] = nrm(pp)
    # pass 2: raw arm targets in the chest frame, smoothed (removes anchor-blend / pole noise)
    base, loc = [], []
    for r, dz in zip(rec, dzs):
        Q, Hp = body_pose(r["Qa"], r["Ha"], dz); Q = solve_legs(Q, Hp, r["LT"]); H = fk(Q, Hp)
        base.append((Q, Hp, H)); loc.append(to_local(Q[ic], H[ic], arm_targets(r["Qa"], r["Ha"], Q, H)))
    for s in "LR":
        for key, sig in (("t", 1.0), ("pole", 1.5), ("fd", 1.0), ("pd", 1.0)):
            sm = gsmooth([L[s][key] for L in loc], loop, sig)
            for L, v in zip(loc, sm): L[s][key] = v

    return backend(clip, loop, rec, base, loc)


def backend(clip, loop, rec, base, loc):
    """shared back end: elbow-path smoothing, peak-keeping push-out rounds, final solve with floor pass, twist calming"""
    ic = BI["Chest"]
    cur = [{s: dict(L[s]) for s in "LR"} for L in loc]
    # elbow path smoothing: solve, take the elbow in the chest frame, smooth it, re-aim the poles at it
    for _ in range(2):
        els = {s: [] for s in "LR"}
        for (Q, Hp, H), L in zip(base, cur):
            AT = to_world(Q[ic], H[ic], L); Q2 = solve_arms(Q.copy(), Hp, AT); H2 = fk(Q2, Hp)
            for s in "LR": els[s].append(Q[ic].T @ (H2[BI[f"Forearm.{s}"]] - H2[BI[f"UpperArm.{s}"]]))
        for s in "LR":
            sm = gsmooth(els[s], loop, 1.6)
            for (Q, Hp, H), L, e in zip(base, cur, sm):
                u = L[s]["t"] - (Q[ic].T @ (fk(Q, Hp)[BI[f"UpperArm.{s}"]] - H[ic])); u = nrm(u)
                v = e - (e @ u) * u
                w = float(np.clip((np.linalg.norm(v) - 0.01) / 0.04, 0.0, 1.0))     # straight arm: elbow offset is noise, keep the pole
                if w > 0: L[s]["pole"] = nrm(w * nrm(v) + (1 - w) * nrm(L[s]["pole"]))
    # pass 3: push-out offsets per frame (chest frame), envelope-smoothed in time, a few rounds
    def offsets(cur):
        dts, dps = {s: [] for s in "LR"}, {s: [] for s in "LR"}
        for (Q, Hp, H), L in zip(base, cur):
            AT = to_world(Q[ic], H[ic], L); t0 = {s: AT[s]["t"].copy() for s in "LR"}; p0 = {s: AT[s]["pole"].copy() for s in "LR"}
            Q2, AT = mesh_push(Q.copy(), Hp, AT, iters=10)
            H2 = fk(Q2, Hp); V = skin(VrW, WW, HrW, Q2, H2)
            for _ in range(3):                                              # arms resting on the floor: not through it
                low = V[ARMV_W, 2].min()
                if low >= -0.003: break
                for s in "LR": AT[s]["t"] = AT[s]["t"] + [0, 0, -0.003 - low]
                Q2 = solve_arms(Q2, Hp, AT); H2 = fk(Q2, Hp); V = skin(VrW, WW, HrW, Q2, H2)
            for s in "LR":
                dts[s].append(Q[ic].T @ (AT[s]["t"] - t0[s])); dps[s].append(Q[ic].T @ (AT[s]["pole"] - p0[s]))
        return dts, dps
    for rnd in range(4):
        dts, dps = offsets(cur)
        if max(np.abs(np.array(dts[s])).max() for s in "LR") < 1e-4: break
        for s in "LR":
            e_t = envelope(dts[s], loop, 5, 1.6); e_p = envelope(dps[s], loop, 5, 1.6)
            for L, a, b in zip(cur, e_t, e_p): L[s]["t"] = L[s]["t"] + a; L[s]["pole"] = L[s]["pole"] + b
    # final low-pass of the corrected targets / poles, then one more peak-keeping push round
    for s in "LR":
        for key, sig in (("t", 1.3), ("pole", 1.6)):
            sm = gsmooth([L[s][key] for L in cur], loop, sig)
            for L, v in zip(cur, sm): L[s][key] = v
    dts, dps = offsets(cur)
    for s in "LR":
        e_t = envelope(dts[s], loop, 6, 2.2); e_p = envelope(dps[s], loop, 6, 2.2)
        for L, a_, b_ in zip(cur, e_t, e_p): L[s]["t"] = L[s]["t"] + a_; L[s]["pole"] = L[s]["pole"] + b_
    # final solve (shoes kept on / above the floor), twist calming, then a residual push on the calmed frames
    def final(cur):
        out, hps = [], []
        for fi, ((Q, Hp, H), L) in enumerate(zip(base, cur)):
            AT = to_world(Q[ic], H[ic], L); Q = solve_arms(Q.copy(), Hp, AT); H = fk(Q, Hp); V = skin(VrW, WW, HrW, Q, H)
            for s in "LR":
                ms = V[SHOE_W[s], 2].min()
                if ms < -0.002:
                    rec[fi]["LT"][s]["t"] = rec[fi]["LT"][s]["t"] + [0, 0, -ms]; Q = solve_legs(Q, Hp, rec[fi]["LT"]); Q = solve_arms(Q, Hp, AT)
                    H = fk(Q, Hp); V = skin(VrW, WW, HrW, Q, H)
            mz = V[:, 2].min()
            if mz < -0.004:
                Hp = Hp + [0, 0, -0.004 - mz]; Q = solve_legs(Q, Hp, rec[fi]["LT"]); Q = solve_arms(Q, Hp, AT); H = fk(Q, Hp)
            out.append((Q.copy(), H.copy())); hps.append(Hp)
        return calm_twist(out, loop), hps
    for rnd in range(5):
        out, hps = final(cur); push_t = {s: [] for s in "LR"}; worst = 0.0
        for (Q, H), Hp in zip(out, hps):
            V = skin(VrW, WW, HrW, Q, H)
            for s in "LR":
                d, nn_ = sdepth(V, ARMV[s], BODYF); j = int(d.argmax()); worst = max(worst, float(d[j]))
                if d[j] > 0.002:
                    m = d > 0.002; g = (nn_[m] * d[m, None]).sum(0) / d[m].sum()
                    if np.linalg.norm(g) < 0.35: g = Q[ic] @ np.array([0, -1.0, 0])
                    push_t[s].append(Q[ic].T @ (nrm(g) * (d[j] + 0.006)))
                else:
                    push_t[s].append(np.zeros(3))
        if worst <= 0.002: break
        for s in "LR":
            e_t = envelope(push_t[s], loop, 5, 1.6)
            for L, a_ in zip(cur, e_t): L[s]["t"] = L[s]["t"] + a_
    rep = dict(pen=(0.0, ""), floor=0.0, slide=0.0); prev_shoe = None
    for fi, ((Q, H), Hp) in enumerate(zip(out, hps)):
        V = skin(VrW, WW, HrW, Q, H)
        pen = max(float(sdepth(V, ARMV[s], BODYF)[0].max()) for s in "LR"); lg = leg_depth(V)
        if pen > rep["pen"][0]: rep["pen"] = (pen, f"arm@{fi}")
        rep["leg"] = max(rep.get("leg", 0.0), lg); rep["floor"] = min(rep["floor"], float(V[:, 2].min()))
        sh = {s: V[SHOE_W[s]].mean(0) for s in "LR"}
        if prev_shoe is not None:
            for s in "LR":
                if rec[fi]["za_foot"][s] < 0.006 and rec[fi - 1]["za_foot"][s] < 0.006:
                    if np.linalg.norm(rec[fi]["Ha"][BA[f"Foot.{s}"]] - rec[fi - 1]["Ha"][BA[f"Foot.{s}"]]) < 0.002:
                        rep["slide"] = max(rep["slide"], float(np.linalg.norm((sh[s] - prev_shoe[s])[:2])))
        prev_shoe = sh
    return [local_basis(Q, H) for Q, H in out], rep


# ------------------------------------------------------------------ twist calming (v5)
TWIST_K = {"UpperArm": 0.2, "Forearm": 0.3}      # parents first


def calm_twist(frames, loop):
    """The roll of the upper arms (puff sleeves) and thighs about their own axis: split each bone's rotation into the
    no-twist swing from rest + a twist, unwrap the twist over the clip, smooth it and keep only part of it. The child
    (forearm / calf) keeps its world orientation, so elbows, knees, hands and feet do not move; only the spin is calmed."""
    out = [(Q.copy(), H) for Q, H in frames]
    for base, kk in TWIST_K.items():
        for s in "LR":
            i = BI[f"{base}.{s}"]; p = PAR[i]; d0 = nrm(TrW[i] - HrW[i]); th = []; Ls = []
            for Q, H in out:
                L = Q[p].T @ Q[i]; sw = swing(d0, L @ d0); R = sw.T @ L
                c = Rot.from_matrix(R).as_rotvec(); th.append(float(c @ d0)); Ls.append(sw)
            th = np.unwrap(np.array(th)); n = len(th)
            med = np.array([np.median(th[[(j % n) if loop else min(max(j, 0), n - 1) for j in range(i - 2, i + 3)]]) for i in range(n)])
            th = gsmooth(med, loop, 4.5) * kk                                     # median kills 1-2 frame flips
            for (Q, H), sw, t in zip(out, Ls, th):
                Q[i] = Q[p] @ sw @ axang(d0, np.degrees(t))
    return out


def main():
    A0 = json.load(open(os.path.join(ROOT, "ref", "ashley", "actions.json")))
    F0 = json.load(open(os.path.join(ROOT, "ref", "ashley", "face_tracks.json")))
    clips = json.loads(str(AN["clips"]))
    only = sys.argv[1].split(",") if len(sys.argv) > 1 else None
    npz = os.path.join(ROOT, "ref", "anim_w.npz")
    data = dict(np.load(npz, allow_pickle=True)) if os.path.exists(npz) else {}
    data.pop("clips", None)
    if not only: data = {k: v for k, v in data.items() if k[2:] not in clips}      # keep authored (non-Ashley) clips
    lines = []
    for c in clips:
        if only and c not in only: continue
        loop = bool(A0.get(c, {}).get("loop", False))
        res, rep = run_clip(c, loop)
        data["q_" + c] = np.array([r[0] for r in res]); data["l_" + c] = np.array([r[1] for r in res])
        ln = (f"{c:18s} frames {len(res):3d}  arm-body penetration {rep['pen'][0] * 1000:5.1f} mm ({rep['pen'][1]})  "
              f"leg-leg {rep.get('leg', 0) * 1000:5.1f} mm  min z {rep['floor'] * 1000:6.1f} mm  planted-foot slide {rep['slide'] * 1000:4.1f} mm/f")
        print(ln, flush=True); lines.append(ln)
    names = sorted(k[2:] for k in data if k.startswith("q_"))
    np.savez(npz, clips=json.dumps(names), **data)
    # actions / face tracks (same clip names, speeds scaled to her legs, engine units = Ashley's)
    old_a = json.load(open(os.path.join(ROOT, "out", "actions.json"))) if os.path.exists(os.path.join(ROOT, "out", "actions.json")) else {}
    old_f = json.load(open(os.path.join(ROOT, "out", "face_tracks.json"))) if os.path.exists(os.path.join(ROOT, "out", "face_tracks.json")) else {}
    acts = {c: old_a[c] for c in names if c not in clips and c in old_a}
    for c in [c for c in names if c in clips]:
        a = dict(A0.get(c, {})); a["frames"] = len(data["q_" + c]) - 1 if c != "his_idle" else a.get("frames", 99)
        if "speed_m_per_s" in a:
            a["speed_m_per_s"] = round(a["speed_m_per_s"] * K, 4); a["speed_units_per_s"] = round(a["speed_m_per_s"] * RG.S_ENGINE, 3)
        a["note"] = "waitress (retargeted from Ashley): " + a.get("note", "")
        acts[c] = a
    json.dump(acts, open(os.path.join(ROOT, "out", "actions.json"), "w"), indent=1)
    meta = json.load(open(os.path.join(ROOT, "ref", "face_meta.json")))
    REMAP = {"oh": "surprised", "parted": "talkSmall", "kissBlow": "kiss", "bedroomSide": "bedroom", "winkL": "winkR", "eyeRoll": "lookUp",
             "dreamy": "soft", "glance": "gazeR"}                                # cells replaced by the flirty set
    def fix(n, lst):
        b = n.replace("+blush", ""); sfx = n[len(b):]
        return n if n in lst else REMAP.get(b, b) + sfx
    ft = {"_meta": meta}
    for c in names:
        if c in clips: ft[c] = [[k[0], fix(k[1], meta["face_eyes"]), fix(k[2], meta["face_mouth"])] for k in F0.get(c, [[1, "open", "neutral"]])]
        elif c in old_f: ft[c] = old_f[c]
    json.dump(ft, open(os.path.join(ROOT, "out", "face_tracks.json"), "w"), indent=1)
    if not only: open(os.path.join(ROOT, "ref", "checks.txt"), "w").write("\n".join(lines) + "\n")
    print("RETARGET K", round(K, 4), "clips", len(names))


if __name__ == "__main__":
    main()

"""Joints of her idle pose (metres, model space) from the fitted part tubes + skinning weights per vertex.
part layouts follow build_init.py (rings first, caps last)."""
import numpy as np
LAYOUT = dict(bootR=(20, 44), bootL=(20, 44), legR=(14, 34), legL=(14, 34), skirt=(28, 26), torso=(24, 40), neck=(10, 10),
              uarmR=(12, 16), farmR=(12, 22), uarmL=(12, 16), farmL=(12, 22))


def part_verts(D, name):
    names = list(D["names"]); i = names.index(name)
    fs = D["F"][D["P"] == i]; lo, hi = fs.min(), fs.max()
    return lo, hi + 1


def rings(D, name):
    lo, hi = part_verts(D, name); nr, ns = LAYOUT[name]
    return D["V"][lo:lo + nr * ns].reshape(ns, nr, 3).mean(1)


def at_z(ax, z):
    i = np.argsort(ax[:, 2]); return np.array([np.interp(z, ax[i, 2], ax[i, k]) for k in range(3)])


def estimate(D):
    J = {}
    for s in "LR":
        bt = rings(D, "boot" + s); lg = rings(D, "leg" + s)
        lo, hi = part_verts(D, "boot" + s); BV = D["V"][lo:hi]
        J["ankle" + s] = at_z(bt, 0.085)
        sole = BV[BV[:, 2] < 0.03]; toe = sole[np.argmin(sole[:, 1])]
        J["toe" + s] = np.array([toe[0], toe[1] + 0.01, 0.02])
        J["knee" + s] = at_z(lg, 0.465)
        J["hip" + s] = at_z(lg, 0.80)
        ua = rings(D, "uarm" + s); fa = rings(D, "farm" + s)
        J["shoulder" + s] = ua[1] * 0.5 + ua[2] * 0.5
        J["elbow" + s] = 0.5 * (ua[-2] + fa[1])
        # wrist: 70 % along the forearm tube (bracelets), hand tip = last ring
        L = np.r_[0, np.cumsum(np.linalg.norm(np.diff(fa, axis=0), axis=1))]
        t = 0.62 * L[-1]; J["wrist" + s] = np.array([np.interp(t, L, fa[:, k]) for k in range(3)])
        J["handtip" + s] = fa[-1]
    to = rings(D, "torso")
    J["pelvis"] = 0.5 * (J["hipL"] + J["hipR"]) + [0, 0, -0.035]
    J["spine"] = at_z(to, 0.975)
    J["neck"] = at_z(to, 1.27)
    nk = rings(D, "neck"); J["headbase"] = nk[-2]
    lo, hi = part_verts(D, "hair" if "hair" in list(D["names"]) else "head"); HV = D["V"][lo:hi]
    J["headtop"] = np.array([J["headbase"][0], J["headbase"][1], HV[:, 2].max()])
    return {k: np.asarray(v, float) for k, v in J.items()}


# bone -> (head joint, tail joint)
BONES = {"Pelvis": ("pelvis", "spine"), "Chest": ("spine", "neck"), "Neck": ("neck", "headbase"), "Head": ("headbase", "headtop")}
for s in "LR":
    BONES.update({f"UpperArm.{s}": ("shoulder" + s, "elbow" + s), f"Forearm.{s}": ("elbow" + s, "wrist" + s), f"Hand.{s}": ("wrist" + s, "handtip" + s),
                  f"Thigh.{s}": ("hip" + s, "knee" + s), f"Calf.{s}": ("knee" + s, "ankle" + s), f"Foot.{s}": ("ankle" + s, "toe" + s)})


def seg_t(P, a, b):
    d = b - a; return ((P - a) @ d) / (d @ d)


def weights(D, J):
    """list of dict(bone -> w) per vertex"""
    names = list(D["names"]); V = D["V"]; W = [None] * len(V)
    vpart = np.zeros(len(V), int)
    for fi, f in enumerate(D["F"]): vpart[f] = D["P"][fi]
    def band(t, t0, wdt):          # 0 below t0-wdt, 1 above t0+wdt
        return np.clip((t - (t0 - wdt)) / (2 * wdt), 0, 1)
    for i, v in enumerate(V):
        n = names[vpart[i]]; s = n[-1]
        if n in ("head", "hair", "face"): w = {"Head": 1.0}
        elif n == "neck": w = {"Neck": 1.0}
        elif n == "skirt":                    # lower skirt follows the thigh on its side a little (less clipping)
            t = float(np.clip((0.93 - v[2]) / 0.19, 0, 1)); wt = 0.55 * t
            sL = 1 / (1 + np.exp(-(v[0] - J["pelvis"][0]) / 0.025))
            w = {"Pelvis": 1 - wt, "Thigh.L": wt * sL, "Thigh.R": wt * (1 - sL)}
        elif n == "torso":
            b = band(v[2], J["spine"][2] + 0.02, 0.04); w = {"Chest": b, "Pelvis": 1 - b}
        elif n.startswith("leg"):
            t = seg_t(v, J["hip" + s], J["ankle" + s]); tk = seg_t(J["knee" + s], J["hip" + s], J["ankle" + s])
            b = band(t, tk, 0.06); wp = 0.5 * float(np.clip((v[2] - 0.68) / 0.08, 0, 1))     # hip area shares the pelvis
            w = {f"Calf.{s}": b * (1 - wp), f"Thigh.{s}": (1 - b) * (1 - wp), "Pelvis": wp}
        elif n.startswith("boot"):
            fwd = (v - J["ankle" + s]) @ (J["toe" + s] - J["ankle" + s]) / np.linalg.norm(J["toe" + s] - J["ankle" + s]) ** 2
            b = np.clip((0.12 - v[2]) / 0.06, 0, 1) * np.clip(fwd / 0.35, 0, 1); w = {f"Foot.{s}": b, f"Calf.{s}": 1 - b}
        elif n.startswith("uarm"): w = {f"UpperArm.{s}": 1.0}
        elif n.startswith("farm"):
            t = seg_t(v, J["elbow" + s], J["handtip" + s]); tw = seg_t(J["wrist" + s], J["elbow" + s], J["handtip" + s])
            b = band(t, tw, 0.04); w = {f"Hand.{s}": b, f"Forearm.{s}": 1 - b}
        else: w = {"Chest": 1.0}
        W[i] = {k: float(x) for k, x in w.items() if x > 1e-4}
    return W

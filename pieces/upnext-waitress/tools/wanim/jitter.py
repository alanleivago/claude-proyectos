"""Arm jitter metric per clip: frame-to-frame acceleration of the elbows / wrists / hand tips (world, metres) compared
with Ashley's own (x leg ratio). A spike = waitress acceleration above 1.5 x hers + 2 mm/frame^2.
python -I tools/wanim/jitter.py [anim.npz] [out.json]"""
import sys, os, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import retarget as T


def joints_w(q, l):
    out = []
    for f in range(len(q)):
        Q = np.zeros((T.NB, 3, 3))
        for i in range(T.NB):
            L = T.RbW[i] @ T.qmat(q[f, i]) @ T.RbW[i].T; p = T.PAR[i]; Q[i] = L if p < 0 else Q[p] @ L
        H = T.fk(Q, T.HrW[0] + T.RbW[0] @ l[f]); pts = []
        for s in "LR":
            ih = T.BI[f"Hand.{s}"]; pts += [H[T.BI[f"Forearm.{s}"]], H[ih], H[ih] + Q[ih] @ (T.TrW[ih] - T.HrW[ih])]
        out.append(pts)
    return np.array(out)


def joints_a(clip):
    out = []
    for Qa, Ha in T.decode(clip):
        pts = []
        for s in "LR":
            ih = T.BA[f"Hand.{s}"]; pts += [Ha[T.BA[f"Forearm.{s}"]], Ha[ih], Ha[ih] + Qa[ih] @ (T.TrA[ih] - T.HrA[ih])]
        out.append(pts)
    return np.array(out) * T.K


def acc(P):
    return np.linalg.norm(P[2:] - 2 * P[1:-1] + P[:-2], axis=-1)          # (n-2, joints)


def zigzag(P, Pa):
    """visible tremble: the acceleration flips direction on consecutive frames with > 6 mm/f^2 while hers does not"""
    A = P[2:] - 2 * P[1:-1] + P[:-2]; Aa = Pa[2:] - 2 * Pa[1:-1] + Pa[:-2]
    m = np.linalg.norm(A, axis=-1); ma = np.linalg.norm(Aa, axis=-1)
    flip = ((A[1:] * A[:-1]).sum(-1) < 0) & (m[1:] > 0.006) & (m[:-1] > 0.006)
    flip_a = ((Aa[1:] * Aa[:-1]).sum(-1) < 0) & (ma[1:] > 0.004) & (ma[:-1] > 0.004)
    return int((flip & ~flip_a).sum())


def measure(npz):
    A = np.load(npz, allow_pickle=True); clips = json.loads(str(A["clips"])); res = {}
    for c in clips:
        Pw, Pa = joints_w(A["q_" + c], A["l_" + c]), joints_a(c)
        aw = acc(Pw); aa = acc(Pa)
        ex = aw - (1.5 * aa + 0.002)
        res[c] = dict(max_excess_mm=float(max(ex.max(), 0) * 1000), spikes=int((ex > 0).sum()), zigzag=zigzag(Pw, Pa),
                      acc_w=aw.max(1).tolist(), acc_a=aa.max(1).tolist())
    return res


if __name__ == "__main__":
    npz = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "ref", "anim_w.npz")
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "ref", "jitter.json")
    R = measure(npz); json.dump(R, open(out, "w"))
    for c, r in sorted(R.items(), key=lambda kv: -kv[1]["max_excess_mm"]):
        print(f"{c:18s} jitter excess {r['max_excess_mm']:5.1f} mm/f^2   spike frames {r['spikes']:3d}   tremble (zig-zag) frames {r['zigzag']}")

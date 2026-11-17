"""Twist-jump detector: per frame, the roll of each upper arm / forearm / thigh / calf about its own axis, measured against
its parent's frame (minimal-rotation reference), and per-frame changes. Flags jumps > THR deg/frame.
python -I tools/wanim/twist.py [anim.npz] [thr]"""
import sys, os, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import retarget as T

BONES = ["Clavicle.L", "UpperArm.L", "Forearm.L", "Clavicle.R", "UpperArm.R", "Forearm.R", "Thigh.L", "Calf.L", "Thigh.R", "Calf.R"]


def roll(Ql):
    """twist (deg) of a local rotation about the bone's rest axis (swing-twist split in the bone frame)"""
    from scipy.spatial.transform import Rotation as Rot
    x, y, z, w = Rot.from_matrix(Ql).as_quat()
    return np.degrees(2 * np.arctan2(y, w))        # bone axis = local Y in Blender bone frames


def spins(frames_Q, Rb, idx):
    """true spin of each bone about its own axis between consecutive frames (deg), world frames Q @ Rb"""
    out = np.zeros((len(frames_Q) - 1, len(idx)))
    for f in range(len(frames_Q) - 1):
        for k, i in enumerate(idx):
            A = frames_Q[f][i] @ Rb[i]; B = frames_Q[f + 1][i] @ Rb[i]
            tr = T.swing(A[:, 1], B[:, 1]); xa = tr @ A[:, 0]; xb = B[:, 0]
            out[f, k] = np.degrees(np.arctan2(np.cross(xa, xb) @ B[:, 1], xa @ xb))
    return out


def world_Q(q):
    out = []
    for f in range(len(q)):
        Q = np.zeros((T.NB, 3, 3))
        for i in range(T.NB):
            L = T.RbW[i] @ T.qmat(q[f, i]) @ T.RbW[i].T; p = T.PAR[i]; Q[i] = L if p < 0 else Q[p] @ L
        out.append(Q)
    return out


def measure(npz, thr=6.0):
    A = np.load(npz, allow_pickle=True); clips = json.loads(str(A["clips"])); out = {}
    iw = [T.BI[b] for b in BONES]; ia = [T.BA[b] for b in BONES]
    for c in clips:
        sw = np.abs(spins(world_Q(A["q_" + c]), T.RbW, iw))
        sa = np.abs(spins([Q for Q, H in T.decode(c)], T.RbA, ia))
        bad = (sw > thr) & (sw > 2 * sa + 3)
        hits = [(int(f) + 1, BONES[k], round(float(sw[f, k]), 1), round(float(sa[f, k]), 1)) for f, k in zip(*np.nonzero(bad))]
        out[c] = dict(max_jump=float((sw * bad).max()) if bad.any() else 0.0, hits=hits)
    return out


if __name__ == "__main__":
    npz = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "ref", "anim_w.npz")
    thr = float(sys.argv[2]) if len(sys.argv) > 2 else 6.0
    R = measure(npz, thr); json.dump(R, open(sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, "ref", "twist.json"), "w"))
    tot = 0
    for c, r in sorted(R.items(), key=lambda kv: -kv[1]["max_jump"]):
        tot += len(r["hits"])
        if r["hits"]: print(f"{c:18s} max spin {r['max_jump']:6.1f} deg/frame  hits {len(r['hits'])}  e.g. (frame, bone, ours, hers) {r['hits'][:3]}")
    print("TOTAL spin jumps (> thr and > 2x Ashley's + 3 deg):", tot)

"""Self-checks for the authored flirty clips (no Ashley reference): tremble (zig-zag) of elbows / wrists / hand tips,
bone spin about its own axis, mesh penetration (arms into body, legs into legs). python -I tools/wanim/flirty_check.py"""
import sys, os, json, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import retarget as T, jitter as J, twist as TW, mesh_check as M, flirty as FL

A = np.load(os.path.join(ROOT, "ref", "anim_w.npz"), allow_pickle=True)
iw = [T.BI[b] for b in TW.BONES]; lines = []
for c in FL.CLIPS:
    q, l = A["q_" + c], A["l_" + c]
    P = J.joints_w(q, l); Acc = P[2:] - 2 * P[1:-1] + P[:-2]; m = np.linalg.norm(Acc, axis=-1)
    trem = int((((Acc[1:] * Acc[:-1]).sum(-1) < 0) & (m[1:] > 0.006) & (m[:-1] > 0.006)).sum())
    sp = np.abs(TW.spins(TW.world_Q(q), T.RbW, iw)); spin_hits = int((sp > 6).sum())
    da, dl = [], []
    for f in range(len(q)):
        Q, H = M.pose(q, l, f); V = T.skin(T.VrW, T.WW, T.HrW, Q, H)
        da.append(max(M.depth(V, M.ARM[s], M.BODYF) for s in "LR")); dl.append(max(M.depth(V, M.LEGV["L"], M.LEGF["R"], maxd=0.06), M.depth(V, M.LEGV["R"], M.LEGF["L"], maxd=0.06)))
    ln = (f"{c:20s} tremble frames {trem:2d}  spin>6deg/f {spin_hits:2d} (max {sp.max():4.1f})  max acc {m.max() * 1000:5.1f} mm/f2  "
          f"arm-into-body {max(da) * 1000:4.1f} mm  leg-into-leg {max(dl) * 1000:4.1f} mm")
    print(ln); lines.append(ln)
open(os.path.join(ROOT, "ref", "flirty_selfcheck.txt"), "w").write("\n".join(lines) + "\n")

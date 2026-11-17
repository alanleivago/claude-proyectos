"""Per-frame turntable angle refinement against a fine hull (SC=0.25)."""
import os; os.environ["SC"] = "0.25"
import sys; sys.path.insert(0, "tools")
from calib import *
p = json.load(open("ref/cam0.json"))
def grid2(step): 
    xs, ys, zs = np.arange(-0.25, 0.42, step), np.arange(-0.26, 0.28, step), np.arange(-0.06, 1.68, step)
    return np.stack(np.meshgrid(xs, ys, zs, indexing="ij"), -1).reshape(-1, 3)
import calib; calib.grid = lambda step, **kw: grid2(step)
alphas = np.array([alpha_of(k, p) for k in range(250)])
if os.path.exists("ref/alphas.npy") and "--fresh" not in sys.argv: alphas = np.load("ref/alphas.npy")
fr = list(range(0, 250, 3))
for it in range(2):
    Q = carve(p, fr, 0.006, alphas=alphas[fr]); print("hull pts", len(Q), flush=True)
    new = alphas.copy(); sc = []
    for k in range(250):
        best = None
        for da in np.arange(-2.0, 2.01, 0.25):
            r = reproj(Q, p, k, a=alphas[k] + da); s = (r & M[k]).sum() / (r | M[k]).sum()
            if best is None or s > best[0]: best = (s, da)
        new[k] = alphas[k] + best[1]; sc.append(best[0])
    print("it", it, "mean IoU", np.mean(sc), "min", np.min(sc), "argmin", int(np.argmin(sc)), "max shift", np.abs(new - alphas).max(), flush=True)
    alphas = new; np.save("ref/alphas.npy", alphas)
np.save("ref/alpha_iou.npy", np.array(sc))
print(" ".join(f"{a:.1f}" for a in alphas[::10]))

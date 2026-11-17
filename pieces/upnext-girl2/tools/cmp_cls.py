"""Class-map comparison of a mesh npz vs his frames: python tools/cmp_cls.py <mesh.npz> <out.png> [scale]"""
import sys, json, numpy as np; sys.path.insert(0, "tools")
from PIL import Image
from raster import raster
D = np.load(sys.argv[1], allow_pickle=True); V, F, C = D["V"], D["F"], D["C"]
cam = json.loads(str(D["cam"])) if "cam" in D.files else json.load(open("ref/cam1.json"))
A = D["alphas"] if "alphas" in D.files else np.load("ref/alphas.npy")
S = float(sys.argv[3]) if len(sys.argv) > 3 else 0.25; k = int(round(1 / S))
CL = np.load("ref/cls.npz")["c"]
LUT = np.array([(0, 0, 0), (255, 190, 170), (220, 170, 60), (180, 90, 20), (40, 160, 40), (140, 60, 200), (90, 50, 20)], np.uint8)
frames = [0, 25, 50, 70, 90, 110, 130, 150, 170, 190, 210, 235]
cols = []; stats = []
for f in frames:
    fid, _, _ = raster(V, F, cam, A[f], S)
    ours = np.where(fid >= 0, C[np.clip(fid, 0, None)], 0)
    his = CL[f][k // 2::k, k // 2::k][:ours.shape[0], :ours.shape[1]]
    a, b = ours > 0, his > 0
    iou = (a & b).sum() / (a | b).sum(); agree = ((ours == his) & a & b).sum() / (a | b).sum()
    stats.append((f, round(iou, 4), round(agree, 4)))
    diff = np.zeros(ours.shape + (3,), np.uint8); diff[a & b & (ours == his)] = (90, 90, 90)
    diff[a & ~b] = (255, 0, 0); diff[b & ~a] = (0, 140, 255); diff[a & b & (ours != his)] = (255, 255, 0)
    col = np.concatenate([LUT[his], LUT[ours], diff], 0)[:, int(ours.shape[1] * 0.12):int(ours.shape[1] * 0.88)]
    cols.append(col)
img = np.concatenate(cols, 1); Image.fromarray(img).save(sys.argv[2])
print("frame, silhouette IoU, class agreement:", stats)
print("mean IoU", np.mean([s[1] for s in stats]).round(4), "mean class agree", np.mean([s[2] for s in stats]).round(4))

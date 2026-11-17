import sys, json, numpy as np; sys.path.insert(0, "."); from hull import *
from skimage import measure
th0 = json.load(open(sys.argv[1]))["theta0"]; out = sys.argv[2]
cam = json.load(open("turn_cam.json"))
P, occ, shape, lo = carve(cam, list(range(50)), 0.035, 0.5, theta0=th0)
occ = occ.reshape(shape)
vol = nd.gaussian_filter(occ.astype(float), 0.7)
v, f, n, _ = measure.marching_cubes(vol, 0.5); v = v * 0.035 + lo
with open(out, "w") as fo:
    for p in v: fo.write("v %.4f %.4f %.4f\n" % tuple(p))
    for t in f: fo.write("f %d %d %d\n" % tuple(t[::-1] + 1))
print(th0, len(v), len(f))

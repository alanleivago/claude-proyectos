import sys, json; sys.path.insert(0, ".")
from hull import *
from scipy.optimize import minimize
fr = list(range(0, 50, 2))
cam = dict(phi=8, dist=42, u=-0.3, v=0.0, roll=0, f=50)
def norm(cam):
    for _ in range(3):
        P, occ, shape, lo = carve(cam, fr, 0.12, 0.25)
        z = P[occ][:, 2]; z0, z1 = np.percentile(z, 0.05), z.max()
        s = 13.24 / (z1 - z0); cam["dist"] *= s
        # shift so the sole is at -9: moving the target down by dz moves the figure up in world coords
        P, occ, shape, lo = carve(cam, fr, 0.12, 0.25); z = P[occ][:, 2]; z0 = np.percentile(z, 0.05)
        cam["v"] -= (z0 - (-9.0))
    return cam
cam = norm(cam); print(cam)
def f(x):
    c = dict(cam); c.update(phi=x[0], u=x[1], roll=x[2]); return -consistency(c, fr, 0.1, 0.25)[0]
r = minimize(f, [cam["phi"], cam["u"], 0.0], method="Nelder-Mead",
             options=dict(initial_simplex=[[8, -0.4, 0], [12, -0.4, 0], [8, -0.2, 0], [8, -0.4, 2]], maxiter=80))
cam.update(phi=r.x[0], u=r.x[1], roll=r.x[2]); cam = norm(cam)
print("cal", cam, -r.fun, consistency(cam, list(range(50)), 0.08, 0.25))
json.dump(cam, open("turn_cam.json", "w"), indent=1)

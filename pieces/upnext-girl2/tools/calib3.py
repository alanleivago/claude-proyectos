import sys; sys.path.insert(0, "tools")
from calib import *
fr = list(range(0, 250, 5)); ST = 0.012
KEYS = ["phi", "u", "roll", "f", "T", "ka", "kb"]
out = {}
for sign in (-1.0,):
    p = dict(phi=5.0, d=2.8, u=0.026, tz=0.9, roll=0.0, f=50.0, a0=0.0, T=360.0, ka=0.0, kb=249.0, sign=sign)
    p = normalize(p, fr, ST)
    def fun(x):
        q = dict(p); q.update(dict(zip(KEYS, x)))
        q = normalize(q, fr, 0.02)
        return -consistency(q, fr, ST)[0]
    x0 = [p[k] for k in KEYS]; st = [4, 0.02, 1.5, 15, 15, 8, 8]
    sim = [x0] + [[x0[j] + (st[i] if j == i else 0) for j in range(len(x0))] for i in range(len(x0))]
    r = minimize(fun, x0, method="Nelder-Mead", options=dict(maxiter=260, initial_simplex=sim, xatol=1e-3, fatol=1e-5))
    p.update(dict(zip(KEYS, r.x))); p = normalize(p, fr, ST)
    s = consistency(p, fr, ST)[0]; print("sign", sign, round(s, 4), {k: round(float(v), 3) for k, v in p.items()}, flush=True)
    out[sign] = (s, {k: float(v) for k, v in p.items()})
best = max(out.values(), key=lambda t: t[0]); json.dump(best[1], open("ref/cam0.json", "w"), indent=1)

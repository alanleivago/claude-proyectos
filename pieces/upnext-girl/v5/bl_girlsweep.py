"""Vertex sweep on the final Girl mesh (50/50 joints included); writes the result back into pieces.json (same vertex order)."""
import os, time
V5 = r"F:/Claude Proyectos/pieces/upnext-girl/v5/"
exec(open(V5 + "bl_posefit.py").read())
MODE = "sil"
G = bpy.data.objects["Girl"]; G["col"] = (250, 209, 160)
objs = lambda: [G]


def girl_sweep(pieces, d=0.05, tmax=100, key="gs", views=None):
    global VIEWS
    if views: VIEWS = views
    P = json.load(open(V5 + "pieces.json")); off = {}; o = 0
    for n, dd in P.items(): off[n] = (o, o + len(dd["verts"])); o += len(dd["verts"])
    ids = [i for n in pieces for i in range(*off[n])]
    pf = V5 + f"_{key}.json"; pos = json.load(open(pf)) if os.path.exists(pf) else {"i": 0}
    st = json.load(open(V5 + "pose_hip.json")); apply(st); best = score(st); t0 = time.time(); acc = 0
    me = G.data
    while pos["i"] < len(ids) and time.time() - t0 < tmax:
        vi = ids[pos["i"]]; pos["i"] += 1; v = me.vertices[vi]; c0 = v.co.copy(); nn = v.normal.copy()
        for sgn in (1, -1):
            v.co = c0 + nn * d * sgn; me.update(); s = score(st)
            if s > best + 1e-5: best = s; acc += 1; break
            v.co = c0; me.update()
    json.dump(pos, open(pf, "w"))
    for n, (a, b) in off.items(): P[n]["verts"] = [[round(x, 4) for x in me.vertices[i].co] for i in range(a, b)]
    json.dump(P, open(V5 + "pieces.json", "w"), indent=0)
    return round(best, 4), acc, pos["i"], len(ids)

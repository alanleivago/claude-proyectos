import time
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
exec(open(V5 + "bl_pieces.py").read()); exec(open(V5 + "bl_posefit.py").read())
MODE = "sil"


def piece_sweep(names, step_t=0.06, step_s=0.04, tmax=100):
    st = json.load(open(V5 + "pose_hip.json")); apply(st); best = score(st); t0 = time.time(); acc = []
    for n in names:
        if time.time() - t0 > tmax: break
        o = bpy.data.objects[n]; co0 = [v.co.copy() for v in o.data.vertices]
        c = sum(co0, Vector()) / len(co0)
        for kind, delta in (("x", step_t), ("x", -step_t), ("y", step_t), ("y", -step_t), ("z", step_t), ("z", -step_t),
                            ("s", step_s), ("s", -step_s)):
            cur = [v.co.copy() for v in o.data.vertices]
            for v in o.data.vertices:
                if kind == "s": v.co = c + (v.co - c) * (1 + delta)
                else: v.co["xyz".index(kind)] += delta
            o.data.update(); s = score(st)
            if s > best + 1e-5: best = s; acc.append((n, kind, delta))
            else:
                for v, cc in zip(o.data.vertices, cur): v.co = cc
                o.data.update()
    read_back(); return round(best, 4), acc


def vertex_sweep(names, d=0.06, tmax=100, key="vs", filt=None):
    """move single vertices along their normal (+/-d) when the silhouette score improves; resumable"""
    import os
    pf = V5 + f"_{key}.json"; pos = json.load(open(pf)) if os.path.exists(pf) else {"i": 0}
    jobs = [(n, i) for n in names for i in range(len(bpy.data.objects[n].data.vertices))]
    st = json.load(open(V5 + "pose_hip.json")); apply(st); best = score(st); t0 = time.time(); acc = 0
    while pos["i"] < len(jobs) and time.time() - t0 < tmax:
        n, i = jobs[pos["i"]]; pos["i"] += 1
        o = bpy.data.objects[n]; v = o.data.vertices[i]; c0 = v.co.copy(); nn = v.normal.copy()
        if filt and not filt(n, v.co): continue
        for sgn in (1, -1):
            v.co = c0 + nn * d * sgn; o.data.update(); s = score(st)
            if s > best + 1e-5: best = s; acc += 1; break
            v.co = c0; o.data.update()
    json.dump(pos, open(pf, "w")); read_back()
    return round(best, 4), acc, pos["i"], len(jobs)


def sym_sweep(name, d=0.06, tmax=100, key="sym", axes=(0, 1, 2), views=None):
    """move a vertex and its x-mirror partner together along world axes (keeps his symmetric layout)"""
    import os
    global VIEWS
    if views: VIEWS = views
    o = bpy.data.objects[name]; me = o.data
    co = [v.co.copy() for v in me.vertices]
    pair = {}
    for i, c in enumerate(co):
        m = Vector((-c.x, c.y, c.z)); j = min(range(len(co)), key=lambda k: (co[k] - m).length)
        pair[i] = j if (co[j] - m).length < 0.02 else None
    jobs = [(i, a) for i in range(len(co)) if (pair[i] is None or pair[i] >= i) for a in axes]
    pf = V5 + f"_{key}.json"; pos = json.load(open(pf)) if os.path.exists(pf) else {"i": 0}
    st = json.load(open(V5 + "pose_hip.json")); apply(st); best = score(st); t0 = time.time(); acc = 0
    while pos["i"] < len(jobs) and time.time() - t0 < tmax:
        i, a = jobs[pos["i"]]; pos["i"] += 1; j = pair[i]
        if a == 0 and j == i: continue
        c0 = me.vertices[i].co.copy(); c1 = me.vertices[j].co.copy() if j is not None else None
        for sgn in (1, -1):
            dv = Vector((0, 0, 0)); dv[a] = d * sgn
            me.vertices[i].co = c0 + dv
            if j is not None and j != i: dm = dv.copy(); dm.x = -dm.x; me.vertices[j].co = c1 + dm
            me.update(); s = score(st)
            if s > best + 1e-5: best = s; acc += 1; break
            me.vertices[i].co = c0
            if j is not None and j != i: me.vertices[j].co = c1
            me.update()
    json.dump(pos, open(pf, "w")); read_back([name])
    return round(best, 4), acc, pos["i"], len(jobs)

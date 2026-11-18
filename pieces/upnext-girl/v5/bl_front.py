"""Blender: his rest pose in the viewport (11:29, t=689 s): camera + arms-down pose fit on the front silhouette."""
import time
V5 = r"/Users/alanleiva/claude-proyectos/pieces/upnext-girl/v5/"
exec(open(V5 + "bl_posefit.py").read())
FM = np.load(V5 + "front_mask_q.npy")
CUTQ = int(1062 * 0.25)
FB = ["UpperArm.L", "Forearm.L", "Hand.L", "UpperArm.R", "Forearm.R", "Hand.R", "Pelvis", "Head", "Chest"]


def fscore(fs, mask=FM, cut=CUTQ):
    apply(fs); T, C = posed_tris(); oc = rast.raster_cls(T, C, fs["cam"], 0.25) != 0
    oc[cut:] = False; m = mask.copy(); m[cut:] = False
    return float((oc & m).sum() / max(1, (oc | m).sum()))


def fit_front(path, tmax=100, sr=3.0, sc=0.05, mask=None, cut=CUTQ, campar=("theta", "phi", "dist", "u", "v", "roll")):
    mask = FM if mask is None else mask
    fs = json.load(open(path)); best = fscore(fs, mask, cut); t0 = time.time()
    params = [("cam", k) for k in campar] + [(b, i) for b in FB for i in range(3, 6)] +              [(b, i) for b in ("FootControl.L", "FootControl.R", "Pelvis") for i in range(3)] + [(b, i) for b in ("FootRotation.L", "FootRotation.R") for i in range(3, 6)]
    while time.time() - t0 < tmax:
        imp = False
        for g, k in params:
            if time.time() - t0 > tmax: break
            for sgn in (1, -1):
                c = json.loads(json.dumps(fs))
                if g == "cam": c["cam"][k] += sgn * {"theta": sr, "phi": sr, "dist": 1.0, "u": sc, "v": sc, "roll": 1.0}[k]
                else: c["bones"][g][k] += sgn * (sr if k >= 3 else sc)
                s = fscore(c, mask, cut)
                if s > best + 1e-5: best, fs, imp = s, c, True; break
        if not imp: break
    json.dump(fs, open(path, "w"), indent=1); apply(fs); return round(best, 4)

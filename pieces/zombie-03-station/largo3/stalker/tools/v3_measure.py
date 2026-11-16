# python tools/v3_measure.py <stalker_dir>  -> v3/mask.npy + v3/profiles.json
# v3 (metodo de Ava, pieces/zombie-girl/model/measure.py): silueta de la hoja turnaround de Flow (frente | perfil mirando a la
# izquierda | espalda), perfiles por altura en metros. Escala: coronilla (fila TOP) a suela (SOLE) = 2,6 m.
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
D = sys.argv[1]
im = np.asarray(Image.open(f"{D}/v3/sheet.jpg").convert("RGB")).astype(int)
bg = np.median(np.concatenate([im[:15].reshape(-1, 3), im[-15:].reshape(-1, 3)]), 0)
m = (np.abs(im - bg).sum(2) > 22) | ((im.max(2) - im.min(2)) > 12)
m = nd.binary_opening(m, iterations=1); m = nd.binary_closing(m, iterations=3); m = nd.binary_fill_holes(m)
lab, n = nd.label(m); sz = nd.sum(m, lab, range(1, n + 1)); m = np.isin(lab, 1 + np.where(sz > 2000)[0])
np.save(f"{D}/v3/mask.npy", m)
H, W = m.shape
cols = m.any(0); segs, s = [], None
for x, c in enumerate(list(cols) + [False]):
    if c and s is None: s = x
    if not c and s is not None: segs.append((s, x - 1)); s = None
segs = [g for g in segs if g[1] - g[0] > 100]; assert len(segs) == 3, segs
(F0, F1), (S0, S1), (B0, B1) = segs
rows = np.where(m[:, F0:F1 + 1].any(1))[0]; TOP, SOLE = int(rows.min()), int(rows.max())
S = 2.6 / (SOLE - TOP)
def runs(y, a, b):
    r, s = [], None
    for x in range(a, b + 2):
        v = m[y, x] if x <= b else False
        if v and s is None: s = x
        if not v and s is not None:
            if x - s > 2: r.append((s, x - 1))
            s = None
    return r
def center(a, b):  # centro del faldon (filas 600-680)
    return float(np.mean([(r[0][0] + r[-1][1]) / 2 for y in range(600, 680, 4) for r in [runs(y, a, b)] if r]))
CF, CB = center(F0, F1), center(B0, B1)
# perfil: centro del pecho a la altura de los hombros
CS = float(np.mean([(lambda r: (r[0][0] + r[-1][1]) / 2)(runs(y, S0, S1)) for y in range(200, 260, 4)]))
z = lambda y: (SOLE - y) * S
out = dict(TOP=TOP, SOLE=SOLE, S=S, CF=CF, CB=CB, CS=CS, F=[F0, F1], SIDE=[S0, S1], B=[B0, B1], rows={})
for y in range(TOP, SOLE + 1):
    fr = runs(y, F0, F1); sr = runs(y, S0, S1)
    if not fr: continue
    body = [r for r in fr if r[0] <= CF <= r[1]]
    left = [r for r in fr if r[1] < CF and not (r[0] <= CF <= r[1])]; right = [r for r in fr if r[0] > CF]
    out["rows"][y] = dict(z=z(y), full=[fr[0][0], fr[-1][1]], body=list(body[0]) if body else None,
                         armR=[min(r[0] for r in left), max(r[1] for r in left)] if left else None,
                         armL=[min(r[0] for r in right), max(r[1] for r in right)] if right else None,
                         runs=fr, side=[sr[0][0], sr[-1][1]] if sr else None)
json.dump(out, open(f"{D}/v3/profiles.json", "w"))
print("TOP", TOP, "SOLE", SOLE, "S", round(S, 5), "CF", CF, "CB", CB, "CS", CS)

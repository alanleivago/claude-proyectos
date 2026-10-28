# Mide la silueta de la hoja 3 (frente + perfil) y guarda los perfiles en metros -> profiles.json
import json, numpy as np
from PIL import Image

im = np.asarray(Image.open('../ref/sheet3.jpg').convert('RGB')).astype(int)
mask = np.abs(im - 136).sum(2) > 40
TOP, SOLE = 62, 717
S = 1.70 / (SOLE - TOP)          # m por px
CX, CS = 291.5, 690              # centro frente, centro perfil

def runs(row, off):
    r, s = [], None
    for x, v in enumerate(list(row) + [False]):
        if v and s is None: s = x
        if not v and s is not None:
            if x - s > 2: r.append((s + off, x - 1 + off))
            s = None
    return r

def z(y): return (SOLE - y) * S
def fx(px): return (px - CX) * S
def sy(px): return (px - CS) * S

def front_run(y):          # extremos de los tramos sobre el torso (la camiseta blanca parte la fila)
    r = [t for t in runs(mask[y, 16:567], 16) if t[1] > CX - 75 and t[0] < CX + 75]
    if r: return min(t[0] for t in r), max(t[1] for t in r)
def side_run(y):           # el tramo mas ancho del perfil
    r = runs(mask[y, 622:758], 622)
    return max(r, key=lambda t: t[1] - t[0]) if r else None

out = {'scale': S, 'torso': [], 'leg': [], 'arm': []}
# torso: de la entrepierna (398) al cuello (186); filas de brazos/pelo se interpolan luego
for y in range(186, 399, 2):
    f, s = front_run(y), side_run(y)
    if not f or not s: continue
    out['torso'].append({'y': y, 'z': z(y), 'hw': (f[1] - f[0]) / 2 * S, 'xc': fx((f[0] + f[1]) / 2),
                         'yf': sy(s[0]), 'yb': sy(s[1])})
# pierna derecha (izquierda de la imagen) de la entrepierna a la suela
for y in range(398, 718, 2):
    r = runs(mask[y, 16:567], 16)
    leg = [t for t in r if t[1] < CX]
    s = side_run(y)
    if not leg or not s: continue
    a, b = leg[-1]
    out['leg'].append({'y': y, 'z': z(y), 'x0': fx(a), 'x1': fx(b), 'yf': sy(s[0]), 'yb': sy(s[1])})
# brazo derecho: por columna, arriba/abajo de la manga en la vista frontal
for x in range(17, 240, 3):
    col = np.where(mask[190:240, x])[0]
    if len(col) == 0: continue
    out['arm'].append({'x': fx(x), 'z0': z(190 + col.max()), 'z1': z(190 + col.min())})
json.dump(out, open('profiles.json', 'w'), indent=1)
print(len(out['torso']), len(out['leg']), len(out['arm']))
for a in out['arm'][::6]: print('arm', round(a['x'], 3), round(a['z0'], 3), round(a['z1'], 3))

# contorno rojo de la malla sobre la hoja + la malla sola, por vista
import sys, numpy as np
from PIL import Image, ImageFilter
n = sys.argv[1]; out = sys.argv[2]
tiles = []
for v in ('front', 'side', 'back'):
    r = Image.open(f'../ref/c_{v}.png').convert('RGB'); m = Image.open(f'out/{n}_{v}.png').convert('RGB')
    M = np.asarray(m).astype(int); a = np.abs(M - M[2, 2]).sum(2) > 6
    mk = Image.fromarray((a * 255).astype('uint8'))
    edge = np.asarray(mk.filter(ImageFilter.FIND_EDGES)) > 0
    o = np.asarray(r).copy(); o[edge] = (255, 0, 0)
    tiles += [Image.fromarray(o), m]
W = sum(t.width for t in tiles); S = Image.new('RGB', (W, 675)); x = 0
for t in tiles: S.paste(t, (x, 0)); x += t.width
S.save(out)

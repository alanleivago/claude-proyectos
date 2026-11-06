# reveal.py: the quiet reveal face (beat 24), from gen/f24_quiet.jpg (Flow: a calm man, closed small smile, waxy skin).
#   pre : Flow drew a thin white frame round the picture -> cropped off and scaled back to 1376x768 (gen/f24_q.jpg)
#   post: after gentle.py, a faint fold-seam of the thing's pale flesh is drawn on the grid: a 1-cell grey line two
#         cells inside the hairline across the forehead, and one round the base of the neck (assets/f24_q.png).
# The sinking eyes and the 1-second-late right half are in code (scenes.js sceneReveal).
import sys, numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
if sys.argv[1] == 'pre':
    im = Image.open(D + 'gen/f24_quiet.jpg').convert('RGB')
    im.crop((16, 10, 1362, 752)).resize((1376, 768), Image.LANCZOS).save(D + 'gen/f24_q.jpg', quality=95); print('f24_q cropped')
else:
    a = np.asarray(Image.open(D + 'assets/f24_q.png')).copy(); L = a[..., 0].astype(int); n = 0
    T7 = [0, 46, 87, 128, 168, 214, 255]
    def seam(xs, ys):   # a smooth 1-cell grey fold (the column hits median-smoothed, so it reads as one line, not specks)
        global n
        ys = np.array(ys, float); ok = ~np.isnan(ys)
        if ok.sum() < 5: return
        sm = np.array([np.nanmedian(ys[max(0, i - 5):i + 6]) for i in range(len(ys))])
        for x, y in zip(xs, sm):
            if np.isnan(y): continue
            y = int(round(y))
            if L[y, x] >= 128: L[y, x] = T7[max(0, T7.index(L[y, x]) - 2) if L[y, x] in T7 else 2]; n += 1   # the fold: two tones darker than the skin
    xs = list(range(194, 288)); ys = []
    for x in xs:                                  # the forehead: first skin cell under the hair, the fold 3 below
        col = L[40:100, x]; w = np.where((col[1:] >= 128) & (col[:-1] == 0))[0]; ys.append(40 + w[0] + 4 if len(w) else np.nan)
    seam(xs, ys)
    xs = list(range(206, 276)); ys = []
    for x in xs:                                  # the neck: last skin cell above the collar/headset, the fold 3 above
        col = L[185:235, x]; w = np.where((col[:-1] >= 128) & (col[1:] < 87))[0]; ys.append(185 + w[-1] - 3 if len(w) else np.nan)
    seam(xs, ys)
    a[..., 0] = a[..., 1] = a[..., 2] = L.astype(np.uint8); Image.fromarray(a).save(D + 'assets/f24_q.png'); print('seam cells', n)

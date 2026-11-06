# wrong.py: the reveal face (beat 24), after gentle.py. Flow would not distort a realistic face (every edit came back
# near-identical, gen/stale), so the wrongness is made here and in code:
#  - the mouth is re-drawn on the 480x268 grid a little WIDER than Flow's (corners pushed into the cheeks' stretch lines)
#    and filled with far too many small identical teeth: two rows, 3-cell rounded teeth with 1-cell black gaps (~30 a row);
#  - the right half of the face slips down and arrives late in code (scenes.js sceneReveal, SLIP).
import numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
a = np.asarray(Image.open(D + 'assets/f24_base.png')).copy(); L = a[..., 0].astype(int)
XC, HW = 246, 60                      # mouth centre and half-width in cells (Flow's corners were ~193/299)
for x in range(XC - HW, XC + HW + 1):
    t = (x - XC) / HW
    yU = round(182 - 6 * t * t); yL = round(203 - 25 * t * t); ym = (yU + yL) // 2
    L[yU:yL + 1, x] = 0
    if yL - yU < 4: continue
    k = x - (XC - HW)
    ku, kl = k % 4, (k + 2) % 4                   # 3-cell teeth, 1-cell gaps; the lower row offset half a tooth
    if ku != 3: L[yU + 1:ym - (ku != 1), x] = 253   # upper row, the tip rounded (its side cells a row shorter)
    if kl != 3: L[ym + 1 + (kl != 1):yL, x] = 253   # lower row
a[..., 0] = a[..., 1] = a[..., 2] = L.astype(np.uint8)
Image.fromarray(a).save(D + 'assets/f24_reveal.png'); print('mouth re-drawn')

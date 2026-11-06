# boards.py: Flow-resolution composites for board shots where Flow drew the thing wrong (a cartoon ghost), so the
# thing on a screen or a print is OUR approved stage image, and the series reads as the real progression:
#   b07_monitorc: the control-room monitor shows the dive-2 imprint (clipped around the two heads)
#   b12_stillsc : the five pinned prints show dive 1, 2, 3, then two of empty black water (beat 12 comes before dive 4)
#   b28_threec  : Flow's thin white frame cropped off
import numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/gen/'
A = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/assets/'
def crop(src, cx, cy, w, aspect):
    # a .png source is the approved grid asset (with the stage fixes), scaled back up to Flow px
    im = Image.open(A + src).convert('L').resize((1376, 768), Image.NEAREST) if src.endswith('.png') else Image.open(D + src).convert('L'); h = w / aspect
    return im.crop((int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2)))
# round 16: beat 7 = the SIDE view (b07_optB_side + its frightened edit _b, user's pick). The monitor faces right in
# perspective: our dive-2 face is warped into its screen quad (left edge x 1166 y 232-528, right edge x 1306 y 172-560).
for src, dst in (('b07_optB_side', 'b07_monitorc'), ('b07_optB_side_b', 'b07_monitorc_b')):
    a = np.asarray(Image.open(D + src + '.jpg').convert('L')).astype(np.float32).copy()
    face = np.asarray(crop('d2_imprint.png', 860, 330, 520, 0.62).resize((300, 480), Image.LANCZOS)).astype(np.float32)
    for x in range(1166, 1307):
        u = (x - 1166) / 140; top = 232 - 60 * u; bot = 528 + 32 * u
        for y in range(int(top) + 2, int(bot) - 1):
            v = (y - top) / (bot - top); a[y, x] = face[min(479, int(v * 480)), min(299, int(u * 300))] * 0.85
    Image.fromarray(a.astype(np.uint8)).convert('RGB').save(D + dst + '.jpg', quality=95)
# the prints (inner picture rects)
a = np.asarray(Image.open(D + 'b12_stills.jpg').convert('L')).copy()
P = [((115, 180, 405, 520), ('d1_mass.png', 900, 330, 720)), ((472, 200, 675, 475), ('d2_imprint.png', 885, 360, 420)),
     ((735, 248, 895, 490), ('d3_out.png', 905, 250, 330)), ((940, 275, 1068, 495), ('d1_mass.jpg', 200, 120, 200)),
     ((1100, 283, 1205, 470), ('d1_mass.jpg', 150, 100, 150))]   # beat 12 is before dive 4: the last two prints are black water (more to come)
for (x0, y0, x1, y1), (src, cx, cy, w) in P:
    a[y0:y1, x0:x1] = np.asarray(crop(src, cx, cy, w, (x1 - x0) / (y1 - y0)).resize((x1 - x0, y1 - y0), Image.LANCZOS))
Image.fromarray(a).convert('RGB').save(D + 'b12_stillsc.jpg', quality=95)
im = Image.open(D + 'b28_three.jpg').convert('RGB'); im.crop((14, 10, 1362, 758)).resize((1376, 768), Image.LANCZOS).save(D + 'b28_threec.jpg', quality=95)
# b10: the glass close-up. Flow's inside hand (left) on empty black water (right); the outside hand is OUR seven-finger
# hand (gen/d3_hand7.jpg widened as in mirror.py), flipped so it mirrors his, set a little lower (a beat behind),
# lighten-composited inside the glass; Flow's bent last finger is the wrong joint, as in dive 3
h = np.asarray(Image.open(D + 'd3_hand7.jpg').convert('L').crop((440, 12, 940, 768))).astype(np.float32)
st = h[:, 655 - 440:745 - 440]; h = np.concatenate([h[:, :305], st, st, h[:, 305:]], 1)
# no cut: the wrist runs out of the bottom of the frame (a cut or fade read as a torn sheet / a grey band)
h = h[:, ::-1]; hi = Image.fromarray(h.astype(np.uint8)); S_ = 0.78; hi = hi.resize((round(hi.width * S_), round(hi.height * S_)), Image.LANCZOS)
a = np.asarray(Image.open(D + 'b10_inside.jpg').convert('L')).astype(np.float32).copy(); hh = np.asarray(hi).astype(np.float32)
x, y = 1000 - hh.shape[1] // 2, 215; y1 = min(768, y + hh.shape[0]); x1 = min(1376, x + hh.shape[1])
yy, xx = np.mgrid[:768, :1376]; glass = (xx < 1250) & (yy > 30)
reg = a[y:y1, x:x1]; a[y:y1, x:x1] = np.where(glass[y:y1, x:x1], np.maximum(reg, hh[:y1 - y, :x1 - x]), reg)
Image.fromarray(a.astype(np.uint8)).convert('RGB').save(D + 'b10_glassc.jpg', quality=95)
# b23: Flow framed the shot inside a black border with a white floor strip: the inner picture, scaled to fill
Image.open(D + 'b23_smiling.jpg').convert('RGB').crop((214, 40, 1160, 572)).resize((1376, 768), Image.LANCZOS).save(D + 'b23_smilingc.jpg', quality=95)
print('boards composites done')

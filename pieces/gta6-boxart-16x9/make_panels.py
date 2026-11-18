"""Panel layers for the box-art test from the REDRAWN characters (v4 hybrid): plate crop + character crop.
Window per panel is fitted to the character's alpha: top margin above the head, the figure fills the panel."""
import cv2, numpy as np
A = 'pieces/gta6-parallax-16x9/assets/'; O = 'pieces/gta6-boxart-16x9/assets/'
P = {  # name: character layer, plate, panel rect (x,y,w,h), zoom (window height / figure height)
 'jason':   ('c_jason', 'jl_plate', (602, 18, 716, 500), 1.0),
 'lucia':   ('c_lucia', 'dimez_plate', (602, 536, 352, 244), 1.15),
 'cal':     ('c_cal', 'bay_plate', (966, 536, 352, 244), 1.15),
 'brian':   ('c_brian', 'brian_plate', (18, 18, 566, 330), 1.1),
 'dimez':   ('c_dimez', 'dimez_plate', (18, 366, 566, 330), 1.1),
 'raul':    ('c_raul', 'raul_plate', (18, 714, 566, 348), 1.1),
 'boobie':  ('c_boobie', 'boobie_plate', (1336, 18, 566, 430), 1.08),
 'drequan': ('c_drequan', 'drequan_plate', (1336, 466, 566, 596), 1.0),
}
M = 1.1
for name, (ch, plate, (px, py, pw, ph), zoom) in P.items():
    c = cv2.imread(A + ch + '.png', cv2.IMREAD_UNCHANGED); pl = cv2.imread(A + plate + '.jpg')
    ys, xs = np.nonzero(c[..., 3] > 128)
    top, fx0, fx1 = ys.min(), np.percentile(xs, 3), np.percentile(xs, 97)
    wh = min(1080 / M, (1080 - top) * zoom + 0.15 * 1080)      # window height: head-room + figure (margin must fit)
    ww = wh * pw / ph
    if ww > 1920 / M: ww = 1920 / M; wh = ww * ph / pw
    cx = (fx0 + fx1) / 2
    y0 = max(0, top - 0.14 * wh); y0 = min(y0, 1080 - wh)
    W2, H2 = ww * M, wh * M                                     # 10 % margin for the parallax drift
    x0 = int(np.clip(cx - W2 / 2, 0, 1920 - W2)); y0m = int(np.clip(y0 - (H2 - wh) / 2, 0, 1080 - H2))
    sl = (slice(y0m, int(y0m + H2)), slice(x0, int(x0 + W2)))
    ow, oh = int(pw * M), int(ph * M)
    cv2.imwrite(O + f'{name}_plate.jpg', cv2.resize(pl[sl], (ow, oh), interpolation=cv2.INTER_AREA), [cv2.IMWRITE_JPEG_QUALITY, 92])
    cv2.imwrite(O + f'{name}.png', cv2.resize(c[sl], (ow, oh), interpolation=cv2.INTER_AREA))
    print(name, [px, py, pw, ph])

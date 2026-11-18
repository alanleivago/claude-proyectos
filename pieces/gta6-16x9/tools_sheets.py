"""Final character sheets: official art crop + Flow turnaround sheet + palette measured on the official art."""
import cv2, numpy as np, sys
sys.path.insert(0, 'styles/gta6/tools')
from cut_layer import saturate
R = 'pieces/gta6-16x9/'
C = {  # name: (flow sheet, official art, x-range of the person in the 1920 art)
 'jason':   ('2026-11-13T20-44-33-character-reference-sheet-of-the-man-wit-1.jpg', 'JasonandLucia3', (1100, 1920), 1240),
 'lucia':   ('2026-11-13T20-44-55-character-reference-sheet-of-the-woman-w-1.jpg', 'JasonandLucia3', (600, 1150), 950),
 'cal_hampton': ('2026-11-13T20-45-18-character-reference-sheet-of-the-man-fro-1.jpg', 'CalHampton', (0, 1920)),
 'brian_heder': ('2026-11-13T20-45-42-character-reference-sheet-of-the-older-m-1.jpg', 'BrianHeder', (0, 1920)),
 'boobie_ike':  ('2026-11-13T20-46-30-character-reference-sheet-of-the-big-bea-1.jpg', 'BoobieIke', (0, 1920)),
 'drequan_priest': ('2026-11-13T20-46-50-character-reference-sheet-of-the-young-m-1.jpg', 'DreQuanPriest', (0, 1920)),
 'raul_bautista':  ('2026-11-13T20-47-10-character-reference-sheet-of-the-man-in--1.jpg', 'RaulBautista', (0, 1920)),
 'real_dimez':     ('2026-11-13T20-47-31-character-reference-sheet-of-the-two-wom-1.jpg', 'RealDimez', (0, 1920), 1290),
}
LABEL = {'jason': 'JASON', 'lucia': 'LUCIA', 'cal_hampton': 'CAL HAMPTON', 'brian_heder': 'BRIAN HEDER', 'boobie_ike': 'BOOBIE IKE',
         'drequan_priest': 'DREQUAN PRIEST', 'raul_bautista': 'RAUL BAUTISTA', 'real_dimez': 'REAL DIMEZ'}
for name, v in C.items():
    sheet, art, (xa, xb) = v[:3]; fcx = v[3] if len(v) > 3 else None
    a = cv2.imread(R + f'work/{art}.jpg'); m = np.load(R + f'work/{art}_person.npy').astype(np.float32) > 0.5
    xm = np.zeros_like(m); xm[:, xa:xb] = True; m &= xm
    ys, xs = np.nonzero(m); y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    pad = 30; y1 = int(y0 + 0.62 * (y1 - y0)); crop = a[max(0, y0 - pad):y1, max(0, x0 - pad):min(1920, x1 + pad)]
    # palette: k-means on the character's pixels in Lab, sorted dark -> light
    lab = cv2.cvtColor(a, cv2.COLOR_BGR2LAB).reshape(-1, 3)[m.ravel()].astype(np.float32)
    _, lbl, cen = cv2.kmeans(lab, 10, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5), 3, cv2.KMEANS_PP_CENTERS)
    cen = cen[np.argsort(cen[:, 0])]
    pal = cv2.cvtColor(cen.reshape(1, -1, 3).astype(np.uint8), cv2.COLOR_LAB2BGR)[0]
    pal = saturate(pal.reshape(1, -1, 3), 1.25)[0]
    sh = saturate(cv2.imread(R + 'sheets/' + sheet), 1.15)
    W, H = 1920, 1080; top, bot = 80, 110
    out = np.full((H, W, 3), (0xE0, 0xC8, 0xE6), np.uint8)
    out[:top] = (0x18, 0x08, 0x14)
    cv2.putText(out, LABEL[name], (30, 58), cv2.FONT_HERSHEY_DUPLEX, 1.6, (0xB8, 0xE9, 0xFF), 2, cv2.LINE_AA)
    cv2.putText(out, 'character sheet  |  left: official GTA VI artwork  |  right: v4 turnaround (Flow NB2 on the official art)  |  bottom: palette measured on the official art',
                (560, 52), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (230, 220, 235), 1, cv2.LINE_AA)
    ah = H - top - bot - 20; cs = ah / crop.shape[0]; cw = min(560, int(crop.shape[1] * cs))
    cr = cv2.resize(crop, (int(crop.shape[1] * cs), ah))
    cx0 = (cr.shape[1] - cw) // 2
    if fcx is not None:
        cx0 = int(np.clip((fcx - max(0, x0 - pad)) * cs - cw / 2, 0, cr.shape[1] - cw))
    cr = cr[:, cx0:cx0 + cw]
    out[top + 10:top + 10 + ah, 10:10 + cw] = cr
    sw = W - cw - 30; shh = int(sh.shape[0] * sw / sh.shape[1])
    if shh > ah: shh = ah; sw = int(sh.shape[1] * ah / sh.shape[0])
    out[top + 10:top + 10 + shh, cw + 20:cw + 20 + sw] = cv2.resize(sh, (sw, shh), interpolation=cv2.INTER_AREA)
    pw = (W - 20) // len(pal)
    for i, c in enumerate(pal):
        x = 10 + i * pw; cv2.rectangle(out, (x, H - bot + 5), (x + pw - 8, H - 10), tuple(int(v) for v in c), -1)
        hx = '#%02X%02X%02X' % (c[2], c[1], c[0]); lum = 0.3 * c[2] + 0.59 * c[1] + 0.11 * c[0]
        cv2.putText(out, hx, (x + 10, H - 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (20, 10, 20) if lum > 128 else (240, 240, 240), 1, cv2.LINE_AA)
    cv2.imwrite(R + f'sheets/sheet_{name}.jpg', out, [cv2.IMWRITE_JPEG_QUALITY, 92])
    print('sheet', name)

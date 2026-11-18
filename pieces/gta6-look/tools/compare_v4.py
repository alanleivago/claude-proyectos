"""Comparison sheets for the gta6 look test v4 (run from the project root)."""
import cv2, numpy as np
R = 'pieces/gta6-look/'
TW, TH = 420, 746
def fit(im):
    h, w = im.shape[:2]; s = max(TW / w, TH / h); im = cv2.resize(im, (int(w * s + .5), int(h * s + .5)), interpolation=cv2.INTER_AREA)
    y = (im.shape[0] - TH) // 2; x = (im.shape[1] - TW) // 2; return im[y:y + TH, x:x + TW]
def over(png, bgf):
    a = cv2.imread(png, cv2.IMREAD_UNCHANGED); b = cv2.resize(cv2.imread(bgf), (a.shape[1], a.shape[0])).astype(np.float32); al = a[..., 3:] / 255.
    return (a[..., :3] * al + b * (1 - al)).astype(np.uint8)
def lab(im, t):
    im = im.copy(); cv2.rectangle(im, (0, 0), (im.shape[1], 34), (20, 10, 24), -1)
    cv2.putText(im, t, (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (230, 240, 255), 1, cv2.LINE_AA); return im
tut = cv2.imread('fuentes/gta6-style/tutorial/final.png')[0:1080, 300:900]
bri = cv2.imread('fuentes/gta6-style/refs/Artwork-BrianHeder-GTAVI.jpg')[0:2160, 1900:3150]
cal = cv2.imread('fuentes/gta6-style/refs/Artwork-CalHampton-GTAVI.jpg')[0:2160, 1300:2600]
codeman = over(R + 'work4/barman4.png', R + 'assets/bar4_plate.jpg'); codew = over(R + 'work4/womancar4.png', R + 'assets/street4_plate.jpg')
row1 = [lab(fit(tut), 'tutorial 21DPS (target)'), lab(fit(bri), 'official GTA VI art'), lab(fit(cv2.imread(R + 'review/v2_still_1.5s.jpg')), 'v2 Flow NB2 + relight'),
        lab(fit(cv2.imread(R + 'review/v3_still_1.5s.jpg')), 'v3 rockstarize.py'), lab(fit(codeman), 'v4 code block-in only'),
        lab(fit(cv2.imread(R + 'review/v4_still_1.5s.png')), 'v4 block-in+Flow pass+finish')]
row2 = [lab(fit(cal), 'official GTA VI art'), lab(fit(cv2.imread(R + 'review/v2_still_8.5s.jpg')), 'v2'), lab(fit(cv2.imread(R + 'review/v3_still_8.5s.jpg')), 'v3'),
        lab(fit(codew), 'v4 code block-in only'), lab(fit(cv2.imread(R + 'review/v4_still_8.5s.png')), 'v4 final'),
        lab(fit(cv2.imread(R + 'flow4/womancar4_photo.jpg')), 'v4 input: Flow photo ref')]
sheet = np.vstack([np.hstack(row1), np.full((10, TW * 6, 3), 20, np.uint8), np.hstack(row2)])
cv2.imwrite(R + 'review/compare_v4_refs_v2_v3_v4.jpg', sheet, [cv2.IMWRITE_JPEG_QUALITY, 90])
def crop(im, box): h, w = im.shape[:2]; x0, y0, x1, y1 = [int(v * s) for v, s in zip(box, [w, h, w, h])]; return im[y0:y1, x0:x1]
f = [crop(cv2.imread('fuentes/gta6-style/tutorial/final.png'), (0.25, 0.0, 0.45, 0.35)), crop(cv2.imread('fuentes/gta6-style/refs/Artwork-BrianHeder-GTAVI.jpg'), (0.57, 0.03, 0.78, 0.42)),
     crop(cv2.imread(R + 'flow4/barman4_photo.jpg'), (0.3, 0.12, 0.85, 0.5)), crop(codeman, (0.3, 0.12, 0.85, 0.5)),
     crop(over(R + 'work4/barman4_final.png', R + 'assets/bar4_plate.jpg'), (0.3, 0.12, 0.85, 0.5))]
f = [cv2.resize(x, (int(x.shape[1] * 560 / x.shape[0]), 560)) for x in f]
for x, n in zip(f, ['tutorial', 'official', 'photo ref', 'v4 code only', 'v4 final']):
    cv2.rectangle(x, (0, 0), (x.shape[1], 30), (20, 10, 24), -1); cv2.putText(x, n, (8, 21), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (230, 240, 255), 1, cv2.LINE_AA)
cv2.imwrite(R + 'review/compare_v4_faces.jpg', np.hstack(f), [cv2.IMWRITE_JPEG_QUALITY, 90])
print('wrote review/compare_v4_refs_v2_v3_v4.jpg, review/compare_v4_faces.jpg')

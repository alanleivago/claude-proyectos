"""Cut the people out of a finished artwork into a full-frame RGBA layer, or boost a plate.

  python cut_layer.py art.jpg out.png [--size 1920x1080] [--sat 1.25] [--hole 0.004] [--grow 0]
  python cut_layer.py plate.jpg out.jpg --plate [--size 1920x1080] [--sat 1.25]

Person mask = segformer clothes model (gta_parse.py), which reads painted art well; small holes
(white tank tops read as background) are filled, real gaps (arm to body) above --hole of the frame stay open.
--sat scales Lab chroma (luminance kept): the user's "more saturation" default for gta6 is 1.25.
"""
import argparse
import os
import sys
import cv2
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gta_parse as gp


def saturate(bgr, k):
    lab = cv2.cvtColor(bgr.astype(np.float32) / 255, cv2.COLOR_BGR2LAB)
    lab[..., 1:] *= k
    return np.clip(cv2.cvtColor(lab, cv2.COLOR_LAB2BGR) * 255, 0, 255).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('src'); ap.add_argument('out')
    ap.add_argument('--size', default='1920x1080')
    ap.add_argument('--sat', type=float, default=1.25)
    ap.add_argument('--hole', type=float, default=0.004)
    ap.add_argument('--grow', type=int, default=0)
    ap.add_argument('--plate', action='store_true')
    a = ap.parse_args()
    W, H = map(int, a.size.split('x'))
    im = cv2.imread(a.src)
    s = max(W / im.shape[1], H / im.shape[0])
    im = cv2.resize(im, (round(im.shape[1] * s), round(im.shape[0] * s)), interpolation=cv2.INTER_AREA)
    y0, x0 = (im.shape[0] - H) // 2, (im.shape[1] - W) // 2
    im = im[y0:y0 + H, x0:x0 + W]
    im = saturate(im, a.sat)
    if a.plate:
        cv2.imwrite(a.out, im, [cv2.IMWRITE_JPEG_QUALITY, 93])
        print('wrote', a.out)
        return
    p = 1 - gp.segformer('clothes', cv2.cvtColor(im, cv2.COLOR_BGR2RGB))[0]
    m = (p > 0.5).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(1 - m, 4)
    for i in range(1, n):
        x, y, w, h, area = st[i]
        touches = x == 0 or y == 0 or x + w == W or y + h == H
        if not touches and area < a.hole * W * H:
            m[lab == i] = 1
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool)
    keep[1:] = st[1:, cv2.CC_STAT_AREA] > 0.002 * W * H
    m = keep[lab].astype(np.uint8)
    if a.grow:
        m = cv2.dilate(m, np.ones((3, 3), np.uint8), iterations=a.grow)
    alpha = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.9)
    cv2.imwrite(a.out, np.dstack([im, (alpha * 255).astype(np.uint8)]))
    print('wrote', a.out, f'{W}x{H}')


if __name__ == '__main__':
    main()

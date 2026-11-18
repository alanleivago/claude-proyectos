"""v2 pilot assets: plates/sets/inserts -> assets/<id>_bg.jpg (1920x1080, Lab chroma x1.25, light unsharp);
characters -> assets/<id>_ch.webp (same fit, offset 0, colour-matched to the plate: multiply by the plate's
mean colour cast (x1.6, clamped) at MATCH strength, so a warm figure picks up the set's cold teal/violet light).
  python prep_v2.py            (all)    python prep_v2.py s1_02 s1_03   (some)"""
import os, sys
import numpy as np
from PIL import Image, ImageFilter
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'v2'); A = os.path.join(V, 'pilot', 'assets')
MATCH = {'default': 0.45, 's0_02': 0.3}
SETS = {'st01': 'sets/st01_aerial.jpg', 'st03': 'sets/st03_prison.jpg', 'st04': 'sets/st04_corridor.jpg',
        **{f'i0{i}': f'ins/i0{i}.jpg' for i in range(1, 6)}}
def fit(im):
    s = 1080 / im.height; im = im.resize((round(im.width * s), 1080), Image.LANCZOS)
    x = (im.width - 1920) // 2; return im.crop((x, 0, x + 1920, 1080))
def sat(im, k=1.25):                                   # Lab chroma x k, luminance kept (same as cut_layer.py)
    import cv2
    lab = cv2.cvtColor(np.array(im).astype(np.float32) / 255, cv2.COLOR_RGB2LAB); lab[..., 1:] *= k
    return Image.fromarray(np.clip(cv2.cvtColor(lab, cv2.COLOR_LAB2RGB) * 255, 0, 255).astype(np.uint8))
def bg(src, out):
    im = sat(fit(Image.open(src).convert('RGB'))).filter(ImageFilter.UnsharpMask(2, 60, 2))
    im.save(out, quality=90); return im
only = set(sys.argv[1:])
for k, p in SETS.items():
    if not only or k in only: bg(os.path.join(V, p), os.path.join(A, k + '_bg.jpg'))
for f in sorted(os.listdir(os.path.join(V, 'plates'))):
    sid = f[:-4]
    if not f.endswith('.jpg') or '_' not in sid or sid.count('_') > 1 or (only and sid not in only): continue
    plate = bg(os.path.join(V, 'plates', f), os.path.join(A, sid + '_bg.jpg'))
    cp = os.path.join(V, 'chars', sid + '_final.png')
    if not os.path.exists(cp): continue
    ch = fit(Image.open(cp).convert('RGBA')); a = np.array(ch).astype(np.float32)
    m = np.array(plate).reshape(-1, 3).astype(np.float32).mean(0); tint = np.clip(1 + 1.6 * (m / m.mean() - 1), 0.88, 1.1)
    k = MATCH.get(sid, MATCH['default'])
    a[..., :3] = a[..., :3] * (1 - k) + a[..., :3] * tint * k * 0.95
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').save(os.path.join(A, sid + '_ch.webp'), quality=92, method=6)
    print(sid, 'tint', np.round(tint, 2))

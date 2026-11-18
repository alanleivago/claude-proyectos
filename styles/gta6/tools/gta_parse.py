"""Analysis pass for make_character.py: person mask, clothing/face parsing and depth, cached as .npz.

Models (free, ONNX, run on CPU with onnxruntime; download once with `python gta_parse.py --download`):
  depth.onnx   = onnx-community/depth-anything-v2-small
  clothes.onnx = Xenova/segformer_b2_clothes  (18 labels: hair, upper-clothes, pants, face, arms, legs...)
  face.onnx    = Xenova/face-parsing          (19 labels: skin, nose, eyes, brows, lips, hair...)
"""
import os
import sys
import numpy as np
import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(HERE, 'models')
REPOS = {'depth': 'onnx-community/depth-anything-v2-small', 'clothes': 'Xenova/segformer_b2_clothes',
         'face': 'Xenova/face-parsing'}
CLOTHES = ['bg', 'hat', 'hair', 'sunglasses', 'upper', 'skirt', 'pants', 'dress', 'belt', 'lshoe', 'rshoe', 'face',
           'lleg', 'rleg', 'larm', 'rarm', 'bag', 'scarf']
FACE = ['bg', 'skin', 'nose', 'eye_g', 'l_eye', 'r_eye', 'l_brow', 'r_brow', 'l_ear', 'r_ear', 'mouth', 'u_lip',
        'l_lip', 'hair', 'hat', 'ear_r', 'neck_l', 'neck', 'cloth']
MEAN = np.array([0.485, 0.456, 0.406], np.float32)
STD = np.array([0.229, 0.224, 0.225], np.float32)
_sess = {}


def download():
    import urllib.request
    os.makedirs(MODELS, exist_ok=True)
    for n, r in REPOS.items():
        p = os.path.join(MODELS, n + '.onnx')
        if not os.path.exists(p):
            print('downloading', r)
            urllib.request.urlretrieve(f'https://huggingface.co/{r}/resolve/main/onnx/model.onnx', p)


def sess(n):
    import onnxruntime as ort
    if n not in _sess:
        p = os.path.join(MODELS, n + '.onnx')
        if not os.path.exists(p):
            download()
        _sess[n] = ort.InferenceSession(p, providers=['CPUExecutionProvider'])
    return _sess[n]


def prep(rgb, w, h):
    x = cv2.resize(rgb, (w, h), interpolation=cv2.INTER_CUBIC).astype(np.float32) / 255
    return ((x - MEAN) / STD).transpose(2, 0, 1)[None]


def segformer(n, rgb):
    """softmax probabilities (C,H,W) at the input size"""
    H, W = rgb.shape[:2]
    lo = sess(n).run(None, {'pixel_values': prep(rgb, 512, 512)})[0][0]
    lo = np.stack([cv2.resize(c, (W, H), interpolation=cv2.INTER_LINEAR) for c in lo])
    e = np.exp(lo - lo.max(0, keepdims=True))
    return e / e.sum(0, keepdims=True)


def depth(rgb):
    H, W = rgb.shape[:2]
    s = 518 / max(H, W)
    h, w = int(round(H * s / 14)) * 14, int(round(W * s / 14)) * 14
    d = sess('depth').run(None, {'pixel_values': prep(rgb, w, h)})[0][0]
    d = cv2.resize(d, (W, H), interpolation=cv2.INTER_CUBIC)
    return (d - d.min()) / (d.max() - d.min() + 1e-6)          # 1 = near


def analyse(rgb, cache=None):
    """rgb uint8 HxWx3 -> dict(person, clothes(H,W) int, face(H,W) int, depth(H,W) float)"""
    if cache and os.path.exists(cache):
        z = np.load(cache)
        return {k: z[k] for k in z.files}
    H, W = rgb.shape[:2]
    pc = segformer('clothes', rgb)
    clothes = pc.argmax(0).astype(np.uint8)
    person = 1 - pc[0]
    # face parsing on a square crop around head (clothes labels face + hair)
    face = np.zeros((H, W), np.uint8)
    hm = np.isin(clothes, [1, 2, 3, 11]).astype(np.uint8)
    if hm.sum() > 50:
        ys, xs = np.nonzero(hm)
        cx, cy = xs.mean(), ys.mean()
        r = int(max(xs.max() - xs.min(), ys.max() - ys.min()) * 0.8)
        x0, y0 = int(max(0, cx - r)), int(max(0, cy - r))
        x1, y1 = int(min(W, cx + r)), int(min(H, cy + r * 1.15))
        pf = segformer('face', rgb[y0:y1, x0:x1])
        face[y0:y1, x0:x1] = pf.argmax(0)
    out = dict(person=person.astype(np.float32), clothes=clothes, face=face, depth=depth(rgb).astype(np.float32))
    if cache:
        np.savez_compressed(cache, **out)
    return out


if __name__ == '__main__':
    if '--download' in sys.argv:
        download()

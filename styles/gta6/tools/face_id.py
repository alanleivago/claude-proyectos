"""Identity check: is the face in a new image the same person as in the official artwork?

  python face_id.py ref.jpg cand.jpg [--rx 0.7] [--cx 0.4] [--sheet out.jpg]

YuNet face detector + SFace recogniser (OpenCV zoo, ONNX, CPU; models/yunet.onnx, models/sface.onnx).
--rx / --cx pick the face nearest that x position (0..1) when an image has several people.
Prints the cosine similarity; see STYLE.md for the thresholds calibrated on the official art.
"""
import argparse
import os
import cv2
import numpy as np

M = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models')
_det = {}
_rec = None


def faces(img, min_score=0.7):
    h, w = img.shape[:2]
    s = 1280 / max(h, w)
    im = cv2.resize(img, None, fx=s, fy=s) if s < 1 else img
    s = s if s < 1 else 1.0
    key = im.shape[:2]
    if key not in _det:
        _det[key] = cv2.FaceDetectorYN.create(os.path.join(M, 'yunet.onnx'), '', (im.shape[1], im.shape[0]), min_score, 0.3, 50)
    _, f = _det[key].detect(im)
    if f is None:
        return []
    f = f.copy()
    f[:, :14] /= s
    return list(f)


def pick(fs, W, x=None):
    if not fs:
        return None
    if x is None:
        return max(fs, key=lambda f: f[2] * f[3])
    return min(fs, key=lambda f: abs((f[0] + f[2] / 2) / W - x) - 0.15 * (f[2] * f[3]) ** 0.5 / W)


def embed(img, f):
    global _rec
    if _rec is None:
        _rec = cv2.FaceRecognizerSF.create(os.path.join(M, 'sface.onnx'), '')
    al = _rec.alignCrop(img, f)
    return _rec.feature(al), al


def score(ref, cand, rx=None, cx=None):
    """-> (cosine, ref_crop, cand_crop) ; cosine = -1 when a face is missing"""
    fr, fc = pick(faces(ref), ref.shape[1], rx), pick(faces(cand), cand.shape[1], cx)
    if fr is None or fc is None:
        return -1.0, None, None
    er, ar = embed(ref, fr)
    ec, ac = embed(cand, fc)
    return float(_rec.match(er, ec, cv2.FaceRecognizerSF_FR_COSINE)), ar, ac


def sheet(ref, cand, s, out, label=''):
    """official face | new face, with the score"""
    fr, fc = pick(faces(ref), ref.shape[1]), pick(faces(cand), cand.shape[1])
    tiles = []
    for im, f in ((ref, fr), (cand, fc)):
        x, y, w, h = [int(v) for v in f[:4]]
        p = int(0.45 * max(w, h))
        c = im[max(0, y - p):y + h + p, max(0, x - p):x + w + p]
        tiles.append(cv2.resize(c, (360, int(360 * c.shape[0] / c.shape[1]))))
    hh = max(t.shape[0] for t in tiles)
    tiles = [cv2.copyMakeBorder(t, 0, hh - t.shape[0], 0, 0, cv2.BORDER_CONSTANT) for t in tiles]
    im = np.hstack(tiles)
    cv2.rectangle(im, (0, 0), (720, 28), (20, 10, 24), -1)
    cv2.putText(im, f'{label} official | new   SFace cos {s:.3f}', (8, 20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 240, 255), 1, cv2.LINE_AA)
    cv2.imwrite(out, im)


def check(cand_img, char, cx=None, ids_path=None):
    """identity vs the official anchors of `char`: (mean cosine to its anchors, rank among all characters, table)"""
    import json
    root = os.path.abspath(os.path.join(M, '..', '..', '..', '..'))
    ids = json.load(open(ids_path or os.path.join(root, 'styles/gta6/characters/official_ids.json')))
    fc = pick(faces(cand_img), cand_img.shape[1], cx)
    if fc is None:                                    # head down / sunglasses: retry with a looser detector
        _det.clear()
        fc = pick(faces(cand_img, 0.4), cand_img.shape[1], cx)
        _det.clear()
    if fc is None:
        return -1.0, 99, {}
    ec, _ = embed(cand_img, fc)
    tab = {}
    for name, anchors in ids.items():
        if name.startswith('_'):
            continue
        ss = []
        for path, x in anchors:
            im = cv2.imread(os.path.join(root, path))
            f = pick(faces(im), im.shape[1], x)
            ss.append(_rec.match(embed(im, f)[0], ec, cv2.FaceRecognizerSF_FR_COSINE))
        tab[name] = float(np.mean(ss))
    rankable = {k: v for k, v in tab.items() if not k.endswith('_shots')}
    order = sorted(rankable, key=rankable.get, reverse=True)
    return tab[char], order.index(char) + 1, tab


def passes(char, s, rank, tab, ids_path=None):
    """identity gate: rank 1 + per-character thresholds from official_ids.json "_gates" (default 0.45)"""
    import json
    root = os.path.abspath(os.path.join(M, '..', '..', '..', '..'))
    gates = json.load(open(ids_path or os.path.join(root, 'styles/gta6/characters/official_ids.json'))).get('_gates', {})
    g = gates.get(char, {char: 0.45})
    return rank == 1 and all(tab.get(k, -1) >= v for k, v in g.items())


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('ref'); ap.add_argument('cand', nargs='?')
    ap.add_argument('--char', help='check REF (a new image) against the official anchors of this character')
    ap.add_argument('--rx', type=float); ap.add_argument('--cx', type=float)
    ap.add_argument('--sheet')
    a = ap.parse_args()
    if a.char:
        s, rank, tab = check(cv2.imread(a.ref), a.char, a.cx)
        ok = passes(a.char, s, rank, tab)
        print(f'{a.char}: {s:.3f} rank {rank} {"PASS" if ok else "FAIL"} | ' + ' '.join(f'{k} {v:.2f}' for k, v in sorted(tab.items(), key=lambda kv: -kv[1])[:4]))
        raise SystemExit(0 if ok else 1)
    r, c = cv2.imread(a.ref), cv2.imread(a.cand)
    s, _, _ = score(r, c, a.rx, a.cx)
    print(f'{s:.3f}')
    if a.sheet and s > -1:
        sheet(r, c, s, a.sheet)

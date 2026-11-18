"""Build Lucia's multi-reference identity anchor from all official images (art + screenshots)."""
import sys, glob, json, cv2, numpy as np
sys.path.insert(0, 'styles/gta6/tools'); import face_id as fi
ids = json.load(open('styles/gta6/characters/official_ids.json'))
seed = []
for path, x in ids['lucia']:
    im = cv2.imread(path); seed.append(fi.embed(im, fi.pick(fi.faces(im), im.shape[1], x))[0])
jason = []
for path, x in ids['jason']:
    im = cv2.imread(path); jason.append(fi.embed(im, fi.pick(fi.faces(im), im.shape[1], x))[0])
m = lambda a, b: fi._rec.match(a, b, cv2.FaceRecognizerSF_FR_COSINE)
rows = []
for f in sorted(glob.glob('fuentes/gta6-style/refs_lucia/*.jpg')):
    im = cv2.imread(f)
    best = None
    for fc in fi.faces(im, 0.6):
        if fc[2] < 60 * im.shape[1] / 1920: continue
        e, al = fi.embed(im, fc)
        sl = np.mean([m(e, s) for s in seed]); sj = np.mean([m(e, s) for s in jason])
        if sl > sj and (best is None or sl > best[0]): best = (sl, sj, fc, e)
    if best: rows.append((f, best)); print(f'{f.split("/")[-1]:45s} lucia {best[0]:.2f} jason {best[1]:.2f} face {int(best[2][2])}px x {best[2][0]/im.shape[1]:.2f}')
    else: print(f, 'no Lucia face')
json.dump([[f, float(b[2][0] + b[2][2] / 2) / cv2.imread(f).shape[1], float(b[0])] for f, b in rows], open('pieces/gta6-16x9/id/lucia_candidates.json', 'w'), indent=1)

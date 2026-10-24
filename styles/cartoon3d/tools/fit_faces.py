"""Ajusta cada capa de cara (sprites/png_raw/face_*.png -> sprites/png/face_*.png, lienzo 320x320) a la ref 6.

Medido en la ref (ref_faces.json + grillas; D = diámetro de la cabeza):
  ojos punto: separados 0.24 D, 0.138 D de alto, a 0.045 D sobre el centro de la cabeza
  boca: su centro 0.21 D bajo el centro de los ojos (neutral, grin y smug)
  ojos saltones (aros): 0.22 D de diámetro, casi tocándose (centros a 0.235 D); sonrisa del grin 0.38 D de ancho
  cejas: más pegadas a los ojos que en Flow (BROW_K)
En el lienzo D = 244 px (plano de cara = 1.2 HS, disco de la cabeza = 0.915 HS).
Cada ojo (con su ceja) y la boca se recortan por separado y se recolocan en esas posiciones.
"""
import shutil
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

PNG = Path(__file__).resolve().parents[1] / "sprites" / "png"
RAW = PNG.parent / "png_raw"
D = 244.0
C = 160.0
EYE_SP, DOT_H, EYE_Y = 0.24 * D, 0.138 * D, C - 0.045 * D
MOUTH_DY, RING_D, RING_SP, GRIN_W = 0.21 * D, 0.22 * D, 0.235 * D, 0.38 * D
BROW_K = 0.72
RING = {'grin', 'surprised', 'panic', 'scared', 'screaming', 'shocked', 'starstruck', 'love', 'dizzy'}
LID = {'smug', 'unimpressed', 'bored', 'tired', 'sleepy', 'sly', 'suspicious', 'half', 'skeptical'}
# faces copied 1:1 from the ref keep the ref's own mouth width
MOUTH_W = {"neutral": 0.113 * D, "smug": 0.12 * D, "grin": GRIN_W}


def blobs(alpha):
    lab, n = ndimage.label(alpha > 100)
    out = []
    for i, o in enumerate(ndimage.find_objects(lab)):
        area = int((lab[o] == i + 1).sum())
        if area < 25:
            continue
        out.append({"i": i + 1, "y0": o[0].start, "y1": o[0].stop, "x0": o[1].start, "x1": o[1].stop, "area": area,
                    "cx": (o[1].start + o[1].stop) / 2, "cy": (o[0].start + o[0].stop) / 2, "w": o[1].stop - o[1].start, "h": o[0].stop - o[0].start})
    return lab, out


def fit(path, name):
    a = np.asarray(Image.open(path).convert("RGBA"))
    lab, bs = blobs(a[..., 3])
    if len(bs) < 2:
        return "skip"
    big = sorted(bs, key=lambda b: -b["area"])
    pair = None
    w0 = big[0]
    if w0["w"] > 1.6 * w0["h"] and w0["cy"] < 175 and w0["area"] > 2 * (big[1]["area"] if len(big) > 1 else 1):
        big = []   # both eyes drawn as one wide blob: handled below
    # the eyes are the LOWEST side-by-side pair above the mouth (thick brows also form a pair, higher up)
    mouth_top = max(bs, key=lambda b: b["cy"])["y0"]
    cands = []
    for i in range(min(8, len(big))):
        for j in range(i + 1, min(8, len(big))):
            p, q = big[i], big[j]
            if abs(p["cy"] - q["cy"]) < 18 and abs(p["cx"] - q["cx"]) > 30 and p["area"] < 5 * q["area"] < 25 * p["area"] and max(p["y1"], q["y1"]) <= mouth_top + 4:
                cands.append(sorted((p, q), key=lambda b: b["cx"]))
    if cands:
        # ringed eyes: the biggest pair (the lowest would be the pupils); other faces: the lowest pair (not the brows)
        pair = max(cands, key=(lambda pq: pq[0]["area"] + pq[1]["area"]) if name in RING else (lambda pq: pq[0]["cy"] + pq[1]["cy"]))
    if pair is None:
        wide = next((b for b in sorted(bs, key=lambda b: -b["area"])[:2] if b["w"] > 1.6 * b["h"] and b["cy"] < 175), None)
        if wide is None:
            return "no eyes"
        L = dict(wide, cx=wide["cx"] - wide["w"] / 4, w=wide["w"] / 2); R = dict(wide, cx=wide["cx"] + wide["w"] / 4, w=wide["w"] / 2)
        pair = [L, R]; eye_ids = {wide["i"]}
    else:
        eye_ids = {pair[0]["i"], pair[1]["i"]}
    L, R = pair
    sp = R["cx"] - L["cx"]; eh = max(L["h"], R["h"]); ew = max(L["w"], R["w"])
    ring = name in RING; lid = name in LID   # eye type by expression (blob shapes are too noisy to tell reliably)
    eye_y0, eye_y1 = min(L["y0"], R["y0"]), max(L["y1"], R["y1"]); eye_cy = (eye_y0 + eye_y1) / 2
    split_x = (L["cx"] + R["cx"]) / 2
    mouth = [b for b in bs if b["y0"] >= eye_y1 - 2 and b["i"] not in eye_ids]
    upper = [b for b in bs if b not in mouth]
    brows = [b for b in upper if b["i"] not in eye_ids]
    if ring:
        s = RING_D / eh; gap = RING_SP
    elif lid:
        s = EYE_SP / sp; gap = EYE_SP
    else:
        s = min(DOT_H / eh, EYE_SP / sp * 1.25); gap = EYE_SP
    # the refs keep the features small on the big head: cap the eyes' overall width
    span = lambda: gap + ew * s
    cap = 0.5 * D if ring else 0.42 * D
    if span() > cap:
        k = cap / span(); s *= k; gap *= max(k, 0.85)
    out = Image.new("RGBA", (320, 320), (0, 0, 0, 0))

    def paste(ids, scale, ax, ay, tx, ty, xsel=None):
        m = np.isin(lab, list(ids))
        if xsel is not None:
            xs = np.arange(320)[None, :]; m = m & ((xs < split_x) if xsel < 0 else (xs >= split_x))
        if not m.any(): return
        ys, xs_ = np.where(m); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs_.min(), xs_.max() + 1
        crop = a[y0:y1, x0:x1].copy(); crop[..., 3] = np.where(m[y0:y1, x0:x1], crop[..., 3], 0)
        c = Image.fromarray(crop, "RGBA").resize((max(1, round((x1 - x0) * scale)), max(1, round((y1 - y0) * scale))), Image.LANCZOS)
        out.alpha_composite(c, (int(round(tx + (x0 - ax) * scale)), int(round(ty + (y0 - ay) * scale))))

    for side, E, tx in ((-1, L, C - gap / 2), (1, R, C + gap / 2)):
        paste(eye_ids, s, E["cx"], eye_cy, tx, EYE_Y, xsel=side)
        if brows:   # this side's brow(s), riding closer to the eye than Flow drew them
            bcy = np.mean([b["cy"] for b in brows])
            paste({b["i"] for b in brows}, s, E["cx"], eye_cy, tx, EYE_Y + (bcy - eye_cy) * s * (BROW_K - 1), xsel=side)
    if mouth:
        ids = {b["i"] for b in mouth}
        mx0 = min(b["x0"] for b in mouth); mx1 = max(b["x1"] for b in mouth); my0 = min(b["y0"] for b in mouth); my1 = max(b["y1"] for b in mouth)
        sm = MOUTH_W[name] / (mx1 - mx0) if name in MOUTH_W else (GRIN_W / (mx1 - mx0) if ring and (mx1 - mx0) * s > GRIN_W else s)
        sm = min(sm, (GRIN_W if ring or name == 'grin' else 0.3 * D) / (mx1 - mx0))
        mh = (my1 - my0) * sm
        eye_bottom = EYE_Y + (RING_D / 2 if ring else eh * s / 2)
        ty = max(EYE_Y + MOUTH_DY, eye_bottom + 0.02 * D + mh / 2)
        dx = ((mx0 + mx1) / 2 - split_x) * sm   # keep a smirk's sideways offset
        paste(ids, sm, (mx0 + mx1) / 2, (my0 + my1) / 2, C + dx, ty)
    out.save(path)
    return f"ok s={s:.2f} ring={ring} lid={lid}"


def main():
    if not RAW.exists():
        RAW.mkdir(); [shutil.copy(p, RAW / p.name) for p in PNG.glob("face_*.png")]
    for p in sorted(RAW.glob("face_*.png")):
        shutil.copy(p, PNG / p.name)
        print(p.stem, fit(PNG / p.name, p.stem[5:]))


if __name__ == "__main__":
    main()

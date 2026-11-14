"""Eye-line boxes for censor bars: python tools/face_eyes.py img.png [more...] -> prints JSON per image: list of faces {cx, cy, w, angle} (eye centre, eye-span width incl. margins, roll deg).
Uses MediaPipe FaceLandmarker (tools/models/face_landmarker.task)."""
import sys, json, math
from pathlib import Path
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
M = Path(__file__).parent / "models/face_landmarker.task"
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=str(M)), num_faces=10, min_face_detection_confidence=0.3))
out = {}
import numpy as np
from PIL import Image
def detect_tiles(pil):
    """run on the whole image and on overlapping tiles (upscaled) so small faces are found; returns landmark lists in image px"""
    W, H = pil.size; res = []
    wins = [(0, 0, W, H)]
    for t in (int(min(W, H) * 0.5), int(min(W, H) * 0.3), int(min(W, H) * 0.18)):
        if t < 120: continue
        for y in range(0, max(1, H - t // 2), t // 2):
            for x in range(0, max(1, W - t // 2), t // 2):
                wins.append((x, y, min(W, x + t), min(H, y + t)))
    for (x0, y0, x1, y1) in wins:
        crop = pil.crop((x0, y0, x1, y1)); sc = 640 / max(crop.size); crop = crop.resize((max(1, int(crop.width * sc)), max(1, int(crop.height * sc))))
        r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(np.asarray(crop))))
        for lm in r.face_landmarks:
            res.append([(x0 + l.x * crop.width / sc, y0 + l.y * crop.height / sc) for l in lm])
    # dedupe by eye centre
    keep = []
    for f in res:
        c = ((f[33][0] + f[263][0]) / 2, (f[33][1] + f[263][1]) / 2); s = math.hypot(f[263][0] - f[33][0], f[263][1] - f[33][1])
        if all(math.hypot(c[0] - k[0], c[1] - k[1]) > s * 0.6 for k, _ in keep): keep.append((c, f))
    return [f for _, f in keep]
for p in sys.argv[1:]:
    pil = Image.open(p)
    if pil.mode == "RGBA":
        bg = Image.new("RGB", pil.size, (128, 128, 128)); bg.paste(pil, (0, 0), pil); pil = bg
    pil = pil.convert("RGB"); faces = []
    for lmk in detect_tiles(pil):
        L = lambda i: lmk[i]
        lo, li, ri, ro = L(33), L(133), L(362), L(263)          # eye corners
        top = min(L(159)[1], L(386)[1], L(105)[1] * 0 + 1e9); bot = max(L(145)[1], L(374)[1])
        cx = (lo[0] + ro[0]) / 2; cy = (lo[1] + ro[1] + li[1] + ri[1]) / 4
        span = math.hypot(ro[0] - lo[0], ro[1] - lo[1]); ang = math.degrees(math.atan2(ro[1] - lo[1], ro[0] - lo[0]))
        faces.append({"cx": round(cx, 1), "cy": round(cy, 1), "eye_span": round(span, 1), "bar_w": round(span * 1.75, 1), "bar_h": round(span * 0.42, 1), "angle": round(ang, 1)})
    out[p] = faces
print(json.dumps(out, indent=1))

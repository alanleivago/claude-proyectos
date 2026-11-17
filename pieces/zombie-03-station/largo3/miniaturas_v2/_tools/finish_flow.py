# finish_flow.py — Flow (Nano Banana Pro) -> 1280x720 + texto Anton (mismo text() que compose_code.py)
import os, numpy as np
from PIL import Image
import compose_code as C
F = os.path.join(C.OUT, '_flow')
JOBS = [
    ('flow_B1_notext', '2026-11-16T22-44-52-horizontal-169-aaa-survival-horror-video-3.jpg', None),
    ('flow_B2_text', '2026-11-16T22-45-34-horizontal-169-key-art-poster-in-authent-3.jpg', [('IT FOLLOWED ME', 200, (0.97, 0.97, 0.95), 0, 3, 70, 1380)]),
    ('flow_B3_notext', '2026-11-16T22-45-34-horizontal-169-key-art-poster-in-authent-1.jpg', None),
    ('flow_B4_text', '2026-11-16T22-44-52-horizontal-169-aaa-survival-horror-video-4.jpg', [('RUN', 290, (0.97, 0.97, 0.95), 0, 4, 70, 1180), ('OR FIGHT?', 165, (0.90, 0.14, 0.12), 0, 3, 74, 1380)]),
    ('flow_B5_notext', '2026-11-16T22-44-52-horizontal-169-aaa-survival-horror-video-2.jpg', None),
]
for name, src, txt in JOBS:
    im = Image.open(os.path.join(F, src)).convert('RGB'); w, h = im.size; tw = round(h * 16 / 9)
    im = im.crop(((w - tw) // 2, 0, (w - tw) // 2 + tw, h)).resize((C.W, C.H), Image.LANCZOS)
    img = np.asarray(im).astype(np.float32) / 255
    for (t, size, rgb, dy, trk, x, y) in (txt or []):
        img = C.text(img, [(t, size, rgb, dy, trk)], x, y)
    C.save(img, name)

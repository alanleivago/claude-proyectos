"""python -I tools/anim/all_poses.py : every clip at a key frame (front, 3/4) in sheets of 12 clips -> review/_allposes_<k>.png (no rebuild)"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(ROOT, "tools"))
import numpy as np
import anim_review as AR, review as RV
from PIL import Image
import clips as CL
names = list(CL.CLIPS)
def key_frame(c):
    k = CL.CLIPS[c]; n = k["frames"]
    if k.get("loop") or not k.get("keys"): return n // 3
    fr = [f for f, _ in k["keys"]]; return fr[len(fr) // 2] if len(fr) > 2 else n // 2
shots = []
for c in names:
    f = key_frame(c); e, m = AR.face_at(c, f)
    for v in ("front", "3q"):
        shots.append(dict(out=os.path.join(AR.TMP, f"ap_{c}_{v}.png"), clip=c, frame=f + 1, view=v, eyes=e, mouth=m, **AR.frame_ctr(c)))
AR.render(AR.GLB["wine"], shots, 260)
per = 12
for k in range(0, len(names), per):
    grp = names[k:k + per]; cells = []
    for c in grp:
        a = Image.open(os.path.join(AR.TMP, f"ap_{c}_front.png")); b = Image.open(os.path.join(AR.TMP, f"ap_{c}_3q.png"))
        im = Image.new("RGB", (520, 260)); im.paste(a, (0, 0)); im.paste(b, (260, 0)); p = os.path.join(AR.TMP, f"apc_{c}.png"); im.save(p); cells.append(p)
    rows = [cells[i:i + 4] for i in range(0, len(cells), 4)]
    while len(rows[-1]) < 4: rows[-1].append(rows[-1][-1])
    labs = [" | ".join(grp[i:i + 4]) for i in range(0, len(grp), 4)]
    RV.grid(rows, os.path.join(ROOT, "review", f"_allposes_{k // per}.png"), None, None, "  /  ".join(grp))

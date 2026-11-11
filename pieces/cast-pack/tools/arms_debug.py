"""draw build_human.py's detected arm axes on humans/<slug>/sheet_bleed.png -> review/work/<slug>_arms.png"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
H = os.path.join(R, "styles/zawdog/humans"); slug = sys.argv[1]
src = open(os.path.join(H, "build_human.py")).read(); ns = {"np": np}
SJ = json.load(open(os.path.join(H, slug, "sheet.json"))); ns.update(V=SJ["views"], W_=SJ["w"], H_=SJ["h"], OPT={"height": 1.7})
for fn in ("central", "vcentre", "sheet_arm"):
    exec(re.search(r"\ndef %s\(.*?(?=\n\S)" % fn, src, re.S).group(0), ns)
ns["CX"] = {k: ns["vcentre"](k) for k in ns["V"]}
im = Image.open(os.path.join(H, slug, "sheet_bleed.png")); d = ImageDraw.Draw(im)
for view in ("front", "back"):
    for s in "LR":
        sh, end, nrm, hws = ns["sheet_arm"](view, s)
        d.line([tuple(sh), tuple(end)], fill=(0, 255, 0), width=3)
        for t, w in zip(np.linspace(0, 1, 21), hws):
            p = sh + (end - sh) * t; d.line([tuple(p - nrm * w), tuple(p + nrm * w)], fill=(255, 255, 0), width=1)
out = os.path.join(R, "pieces/cast-pack/review/work", slug + "_arms.png"); im.resize((SJ["w"] // 2, SJ["h"] // 2)).save(out); print(out)

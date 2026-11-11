"""humans/<slug>/faces/<expr>/<flow file>.jpg -> faces/<expr>.jpg (newest wins), + a 6-face strip for review.
    .venv/bin/python pieces/cast-pack/tools/collect_faces.py <slug>"""
import glob, os, shutil, sys
from PIL import Image
R = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", ".."))
D = os.path.join(R, "styles", "zawdog", "humans", sys.argv[1], "faces")
E = ("neutral", "smile", "surprised", "crying", "laughing", "scared")
for e in E:
    fs = sorted(glob.glob(os.path.join(D, e, "*.jpg")))
    if fs:
        shutil.move(fs[-1], os.path.join(D, e + ".jpg")); shutil.rmtree(os.path.join(D, e))
S = Image.new("RGB", (6 * 256, 256))
for i, e in enumerate(E):
    p = os.path.join(D, e + ".jpg")
    if os.path.exists(p):
        S.paste(Image.open(p).convert("RGB").resize((256, 256)), (i * 256, 0))
out = os.path.join(R, "pieces", "cast-pack", "review", "work", sys.argv[1] + "_faces.jpg"); os.makedirs(os.path.dirname(out), exist_ok=True)
S.save(out); print(out)

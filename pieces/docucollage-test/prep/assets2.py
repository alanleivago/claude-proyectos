"""v2 assets (reel-1 rebuild): Flow gens -> cutouts (rembg birefnet-general), treatments, blurred copies, face/eye boxes (MediaPipe) for censor bars.
python prep/assets2.py"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter
R = Path(__file__).resolve().parent.parent; O = R / "assets/img2"; O.mkdir(exist_ok=True)
G2, G3, G4 = R / "flow/gen2", R / "flow/gen3", R / "flow/gen4"
def g(d, k): return next(d.glob(f"*{k}*.jpg"))
from rembg import new_session, remove
S = new_session("birefnet-general")
def cut(p, name, w):
    o = remove(Image.open(p).convert("RGB"), session=S); o = o.crop(o.getbbox())
    o = o.resize((w, round(o.height * w / o.width)), Image.LANCZOS); o.save(O / f"{name}.png"); return o
def photo(p, name, w=1080, bw=False, blur=True):
    im = Image.open(p).convert("RGB"); im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    if bw: im = im.convert("L").point(lambda v: min(255, max(0, (v - 128) * 1.15 + 128))).convert("RGB")
    im.save(O / f"{name}.jpg", quality=90)
    if blur: im.filter(ImageFilter.GaussianBlur(22)).save(O / f"{name}_blur.jpg", quality=85)
    return im
jobs = {
 "salesman": (g(G4, "23-07-06"), "cut", 760), "check": (g(G3, "23-06-10"), "cut", 900), "magnifier": (g(G2, "23-02-50"), "cut", 520),
 "chain": (g(G2, "23-03-24"), "cut", 1180), "register": (g(G2, "23-03-42"), "cut", 760), "bill": (g(G3, "23-06-25"), "cut", 420),
 "duffel": (g(G2, "23-04-15"), "cut", 860), "thermo": (g(G2, "23-04-56"), "cut", 560), "redjersey": (g(G4, "23-07-27"), "cut", 480),
}
for n, (p, kind, w) in jobs.items():
    if not (O / f"{n}.png").exists(): cut(p, n, w); print("cut", n)
photo(g(G2, "23-02-28"), "locker"); photo(g(G2, "23-03-07"), "shopwin"); photo(g(G2, "23-03-59"), "rack")
photo(g(G2, "23-04-33"), "regtable", bw=True); photo(g(G2, "23-04-50"), "huddle", bw=True); photo(g(G3, "23-06-30"), "team")
# team: separate kids layer for parallax (bg = blurred copy)
if not (O / "team_kids.png").exists():
    t = Image.open(O / "team.jpg"); k = remove(t, session=S); k.save(O / "team_kids.png")
# family selective + people layer
fam = Image.open(R / "assets/img/family_sel.jpg"); fam.save(O / "family.jpg", quality=90)
if not (O / "family_people.png").exists():
    fp = remove(Image.open(R / "assets/img/family.jpg").convert("RGB"), session=S); fp.save(O / "family_people.png")
# B&W field / coach reuse from v1 assets (not used elsewhere in v2)
Image.open(R / "assets/img/field.jpg").save(O / "field.jpg"); Image.open(R / "assets/img/field_blur.jpg").save(O / "field_blur.jpg")
co = Image.open(g(G2, "23-02-28").parent.parent / "gen" / next((R / "flow/gen").glob("*19-48-13*.jpg")).name).convert("L").convert("RGB")
co.resize((1080, round(co.height * 1080 / co.width))).save(O / "coach.jpg", quality=90)
co.resize((1080, round(co.height * 1080 / co.width))).filter(ImageFilter.GaussianBlur(22)).save(O / "coach_blur.jpg", quality=85)
# face / eye boxes
files = [str(O / f) for f in ["salesman.png", "family.jpg", "coach.jpg", "regtable.jpg", "huddle.jpg", "team.jpg"]]
out = subprocess.run([sys.executable, str(R.parent.parent / "tools/face_eyes.py")] + files, capture_output=True, text=True).stdout
faces = json.loads(out[out.index("{"):])
faces = {Path(k).name: [f for f in v if abs(f["angle"]) < 25 and f["eye_span"] > 18] for k, v in faces.items()}
(O / "faces.json").write_text(json.dumps(faces, indent=1))
for k, v in faces.items(): print(k, len(v), [(f["cx"], f["cy"], f["bar_w"]) for f in v])

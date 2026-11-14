"""Flow generations -> transparent PNG assets (rembg birefnet-general), cropped to content."""
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent; G = R / "flow/gen"; O = R / "assets/flow"; O.mkdir(parents=True, exist_ok=True)
sess = new_session("birefnet-general")
def cut(src, name, box=None, flip=False):
    im = Image.open(G / src).convert("RGB")
    if box: im = im.crop(box)
    o = remove(im, session=sess)
    o = o.crop(o.getbbox())
    if flip: o = o.transpose(Image.FLIP_LEFT_RIGHT)
    o.save(O / f"{name}.png"); print(name, o.size)
f = sorted(p.name for p in G.glob("*.jpg"))
cut(f[0], "van_side")
cut(f[2], "van_top")
cut(f[3], "jersey_back")
cut(f[4], "jersey_front")
im = Image.open(G / f[5]); w, h = im.size
cut(f[5], "sneaker_l", (0, 0, w // 2, h)); cut(f[5], "sneaker_r", (w // 2, 0, w, h))
cut(f[6], "chevron")
cut(f[8], "thumb")
cut(f[9], "heart")
im = Image.open(G / f[10]); w, h = im.size
for nm, b in [("ball", (0, 0, w // 2, h // 2)), ("box", (w // 2, 0, w, h // 2)), ("house", (0, h // 2, w // 2, h)), ("coin", (w // 2, h // 2, w, h))]:
    cut(f[10], nm, b)

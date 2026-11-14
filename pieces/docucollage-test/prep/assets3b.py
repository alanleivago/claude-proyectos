"""v3b assets: grunge overlay sequence (user's Overlays folder) + houses/ground layer (clubhouse) + new climber cutout.
python prep/assets3b.py"""
import subprocess, numpy as np
from pathlib import Path
from PIL import Image, ImageFilter
R = Path(__file__).resolve().parent.parent; O = R / "assets/img3b"; O.mkdir(parents=True, exist_ok=True)
G = R / "assets/grunge"; G.mkdir(parents=True, exist_ok=True)
OV = Path("D:/Alan/Fiverr Upwork trabajo fotos y videos/Overlays")
TMP = R / "assets/grunge/_src"; TMP.mkdir(exist_ok=True)

# ---- grunge: paper texture that changes every few frames ("scracth bueno que cambia") x dust specks ("grunge 1", inverted)
N = 36   # 3 s at 12 fps, loops
if not (G / f"g_{N - 1:03d}.png").exists():
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(OV / "scracth bueno que cambia.mp4"), "-t", "3", "-vf", "fps=12,transpose=1,format=gray",
                    str(TMP / "p_%03d.png")], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "1", "-i", str(OV / "grunge 1.mp4"), "-t", "3", "-vf", "fps=12,transpose=2,negate,format=gray",
                    str(TMP / "s_%03d.png")], check=True)
    for i in range(N):
        p = np.asarray(Image.open(TMP / f"p_{i + 1:03d}.png").resize((1080, 1920)), np.float32)
        s = np.asarray(Image.open(TMP / f"s_{i + 1:03d}.png").resize((1080, 1920)), np.float32)
        p = np.clip(p / np.percentile(p, 97), 0, 1)              # paper normalised: mean ~0.9, fibres/specks darker
        p = 1 - (1 - p) * 2.2                                     # boost the fibre contrast a bit
        s = np.clip(s / 255, 0, 1)
        g = np.clip(p, 0, 1) * (1 - (1 - s) * 0.9)
        Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8)).save(G / f"g_{i:03d}.png")
    print("grunge frames", N)

# ---- houses + ground layer from clubhouse.jpg (rembg gives the building; the lawn below its base is added back)
c = Image.open(R / "assets/img3/clubhouse.jpg").convert("RGB")
a = np.asarray(Image.open(O / "clubhouse_rembg.png").split()[-1]).copy()
h, w = a.shape
for x in range(w):
    ys = np.where(a[:, x] > 128)[0]
    if len(ys): a[ys.max() - 6:, x] = 255
m = Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.8))
hg = c.convert("RGBA"); hg.putalpha(m); hg.save(O / "houses_ground.png"); print("houses_ground", hg.getbbox())

# ---- bench + man + ground (S02) and seats + spectators foreground (S16)
from rembg import new_session, remove
if not (O / "bench_rembg.png").exists():
    remove(Image.open(R / "assets/img3/bench.jpg").convert("RGB"), session=new_session("birefnet-general")).save(O / "bench_rembg.png")
import scipy.ndimage as nd
im = np.asarray(Image.open(R / "assets/img3/bench.jpg").convert("RGB")).astype(float)   # rembg drops the backrest and the jersey box:
H_, W_, _ = im.shape; xs = np.arange(W_)                                                 # add them back from a per-row sky fit + colour rules
orange = (im[..., 0] > im[..., 1] + 30) & (im[..., 0] > 110)
diff = np.zeros((H_, W_))
for y in range(650, 900):
    row = im[y]; keep = np.ones(W_, bool)
    for it in range(4):
        fit = np.stack([np.polyval(np.polyfit(xs[keep], row[keep, c], 2), xs) for c in range(3)], 1)
        d = np.abs(row - fit).max(1); keep = d < max(8, np.percentile(d[keep], 70) * 2)
    diff[y] = d
m = np.asarray(Image.open(O / "bench_rembg.png").split()[-1]) > 128; m = m.copy(); m[858:] = True   # ground under the horizon
box = np.zeros_like(m); box[715:880, 450:660] = True; m |= (diff > 22) & box & ~orange
rest = np.zeros_like(m); rest[770:880, 85:680] = True; m |= rest & (im.mean(2) < 150) & ~orange
m = nd.binary_fill_holes(nd.binary_closing(nd.binary_opening(m, iterations=1), iterations=2))
bl = Image.open(R / "assets/img3/bench.jpg").convert("RGBA"); bl.putalpha(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)))
bl.save(O / "bench_layer.png"); print("bench_layer", bl.getbbox())

s = np.asarray(Image.open(R / "assets/img3/bleachers.jpg").convert("HSV")).astype(int)
pa = np.asarray(Image.open(R / "assets/img3/bleachers.png").split()[-1])
seat = (s[..., 0] > 18) & (s[..., 0] < 40) & (s[..., 1] > 120) & (s[..., 2] > 110)
top = np.full(s.shape[1], s.shape[0])
for x in range(s.shape[1]):
    ys = np.where((seat[560:, x]) | (pa[560:, x] > 128))[0]
    if len(ys): top[x] = 560 + ys.min()
top = nd.median_filter(top, 9)
m = np.zeros(s.shape[:2], np.uint8)
for x in range(s.shape[1]): m[top[x]:, x] = 255
m = np.maximum(m, pa)
fg = Image.open(R / "assets/img3/bleachers.jpg").convert("RGBA"); fg.putalpha(Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.2))); fg.save(O / "seats_fg.png")
print("seats_fg", fg.getbbox(), int(np.median(top)))

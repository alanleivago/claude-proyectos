"""Head-only cutout (cap + face, no hoodie) of the whole edit -> assets/face.webm (alpha, 480x560 box).
BiRefNet-portrait matte x ellipse that follows the Haar-detected face (cut at the chin)."""
import subprocess, numpy as np, cv2
from pathlib import Path
from PIL import Image
from rembg import new_session, remove
R = Path(__file__).resolve().parent.parent
SRC = R.parent / "stimulus-05-hf/assets/edit.mp4"
F = R / "prep/face"; F.mkdir(exist_ok=True)
X0, Y0, W, H = 335, 560, 480, 560          # crop box in the 1080x1920 edit (head moves inside it)
if not (F / "f0001.png").exists():
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SRC), "-vf", f"crop={W}:{H}:{X0}:{Y0}", str(F / "f%04d.png")], check=True)
fr = sorted(F.glob("f*.png"))
sess = new_session("birefnet-portrait")
yy, xx = np.mgrid[0:H, 0:W]
T = []
RANGES = [(0, 2.0), (3.5, 5.15), (9.75, 12.2), (18.5, 20.95), (32.9, 34.9)]
for i, f in enumerate(fr):
    out = F / f"o{i:04d}.png"
    if out.exists(): continue
    t = i / 23.976
    if not any(a <= t <= b for a, b in RANGES):
        Image.new("RGBA", (W, H), (0, 0, 0, 0)).save(out); continue
    im = Image.open(f).convert("RGB")
    a = np.asarray(remove(im, session=sess, only_mask=True), np.float32)
    a = np.clip((a - 40) * 255 / 175, 0, 255)
    rows = np.where((a > 128).sum(1) > 20)[0]
    top = rows[0] if len(rows) else 120
    band = a[top:top + 260] > 128
    xs = np.where(band.any(0))[0]
    cxm = (np.nonzero(band)[1].mean()) if band.any() else W / 2
    T.append((top, cxm))
    w, h = 250.0, 290.0
    x, y = cxm - w / 2, top + 20
    cx, cy = cxm, y + h * 0.40
    ax, ay = w * 0.46, h * 0.66
    e = ((xx - cx) / ax) ** 2 + ((yy - cy) / ay) ** 2
    m = np.clip((1.0 - e) / 0.06, 0, 1)       # soft ellipse edge
    m[yy < cy] = 1.0                          # never cut the cap top
    chin = y + h * 1.02
    m *= np.clip((chin - yy) / 10.0, 0, 1)    # hard-ish horizontal chin cut
    a = (a * m).astype(np.uint8)
    im.putalpha(Image.fromarray(a)); im.save(out)
    if i % 50 == 0: print(i, len(fr), flush=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", "24000/1001", "-i", str(F / "o%04d.png"), "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "6M", str(R / "assets/face.webm")], check=True)
print("done")

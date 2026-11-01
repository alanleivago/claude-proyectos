"""Sheets for the purchased-model analysis (venv). Reads out/compra/*.png renders."""
from pathlib import Path
from PIL import Image, ImageDraw
import sys
sys.path.insert(0, str(Path(__file__).parent))
import os
O = Path(__file__).parent / "out" / os.environ.get("SHEET_DIR", "compra")


def bg(im):
    import numpy as np
    w, h = im.size
    y = np.linspace(0, 1, h)[:, None, None]
    g = np.array([150, 152, 158.0]) * (1 - y) + np.array([108, 108, 112.0]) * y
    b = Image.fromarray(np.broadcast_to(g, (h, w, 3)).astype("uint8")).convert("RGBA")
    b.alpha_composite(im.convert("RGBA"))
    return b.convert("RGB")


def row(prefix, scale=0.5):
    raw = [Image.open(O / f"{prefix}_{v}.png") for v in ("front", "34", "side", "back")]
    boxes = [r.getchannel("A").getbbox() for r in raw]
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes); x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    m = 40
    ims = [bg(r.crop((max(0, x0 - m), max(0, y0 - m), min(r.width, x1 + m), min(r.height, y1 + m)))) for r in raw]
    ims = [i.resize((int(i.width * scale), int(i.height * scale)), Image.LANCZOS) for i in ims]
    w, h = ims[0].size
    s = Image.new("RGB", (w * 4, h)); d = ImageDraw.Draw(s)
    for k, (i, lab) in enumerate(zip(ims, ("front", "3/4", "side", "back"))):
        s.paste(i, (k * w, 0)); d.text((k * w + 10, 10), f"{prefix} {lab}", fill=(255, 235, 48))
    s.save(O / f"{prefix}_turnaround.png")


def crop(path):
    r = Image.open(path)
    return r.crop(r.getchannel("A").getbbox())


def compare():
    """Kaneda (scaled to 1.72 m) next to lps-hombre (1.72 m): same pixel height = same scale."""
    R = Path(__file__).parent / "out" / "renders"
    H = 1500
    pairs = [("lps-hombre front", crop(R / "turn_front.png")), ("Kaneda front", crop(O / "Kaneda_rest_front.png")),
             ("lps-hombre 3/4", crop(R / "turn_34.png")), ("Kaneda 3/4", crop(O / "Kaneda_rest_34.png"))]
    pairs = [(l, i.resize((int(i.width * H / i.height), H), Image.LANCZOS)) for l, i in pairs]
    W = sum(i.width for _, i in pairs) + 80 * (len(pairs) + 1)
    canvas = Image.new("RGBA", (W, H + 160), (0, 0, 0, 0))
    x = 80
    for l, i in pairs:
        canvas.alpha_composite(i.convert("RGBA"), (x, 100)); x += i.width + 80
    out = bg(canvas); d = ImageDraw.Draw(out)
    x = 80
    for l, i in pairs:
        d.text((x, 40), l + "  (1.72 m)", fill=(255, 235, 48)); x += i.width + 80
    out.save(O / "compare_kaneda_vs_lps.png")


for p in sys.argv[1:]:
    row(p)
if os.environ.get("SHEET_DIR", "compra") == "compra":
    compare()
print("ok")

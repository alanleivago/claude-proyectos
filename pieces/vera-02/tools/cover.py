"""vera-02 delivery cover (1080x1920): Vera (wink, top) / Theo (heart eyes, bottom) split on a diagonal, the episode title in the
series' pixel serif across the split, no other words (v2). Engine stills from sb.html?only=13,26 (stills/cover, frames 30 + 120).
usage: python tools/cover.py <out.png>"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, str(Path(__file__).resolve().parent))
import post_film as P

PIECE = Path(__file__).resolve().parents[1]; W, H = 1080, 1920
vera = Image.open(PIECE / 'engine' / 'stills' / 'cover_v' / 'f_0030.png').convert('RGB').resize((W, H), Image.NEAREST)   # v3 (user): Vera facing the camera, eyes open (sb.html?coververa)
theo = Image.open(PIECE / 'engine' / 'stills' / 'cover' / 'f_0120.png').convert('RGB').resize((W, H), Image.NEAREST)
# v2 (user, standing rules): Vera gets ~60 % of the frame (framed to show a little cleavage), Theo below; both images fill their side
# of the diagonal completely (no black corners); the only words are the episode card, as one block on the divider.
YL, YR = 1210, 1070                                    # diagonal: y at the left / right edge
top = vera.crop((0, 0, W, YL + 10))              # her panel covers everything above the line
img = Image.new('RGB', (W, H)); img.paste(top, (0, 0))
y0 = min(YL, YR) - 12; bot = theo.crop((0, 30, W, 30 + H - y0))   # his panel starts above the highest point of the line
mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon([(0, YL), (W, YR), (W, H), (0, H)], fill=255)
canvas_b = Image.new('RGB', (W, H)); canvas_b.paste(bot, (0, y0)); img.paste(canvas_b, (0, 0), mask)
d = ImageDraw.Draw(img); d.line([(0, YL), (W, YR)], fill=(16, 10, 8), width=14); d.line([(0, YL), (W, YR)], fill=(0xF0, 0x8A, 0xA0), width=4)
a = np.asarray(img).astype(np.float32); yy, xx = np.mgrid[0:H, 0:W]
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2); a *= (1 - np.clip((r - 0.62) / 0.38, 0, 1) ** 1.6 * 0.35)[..., None]
img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')

def put(m, col, cx, cy, ow=11, shadow=5):
    o = m.filter(ImageFilter.MaxFilter(ow)); x0, y0 = cx - m.width // 2, cy - m.height // 2
    pad = Image.new('L', (o.width + 60, o.height + 60), 0); pad.paste(o, (30, 30)); gl = pad.filter(ImageFilter.GaussianBlur(11)).point(lambda v: int(v * P.GLOW))
    img.paste(Image.new('RGBA', gl.size, (255, 255, 250, 255)), (x0 - 30, y0 - 30), gl)
    blk = Image.new('RGBA', m.size, P.BLACK + (255,)); img.paste(blk, (x0 + shadow, y0 + shadow), o); img.paste(blk, (x0, y0), o); img.paste(Image.new('RGBA', m.size, col + (255,)), (x0, y0), m)

t = P.title_mask(); t = t.resize((int(t.width * 1.12), int(t.height * 1.12)), Image.NEAREST)
TY = (YL + YR) // 2
put(t, P.WHITE, W // 2, TY, 15, 6)
put(P.pixelify_mask('EPISODE 1', 52), P.CORAL, W // 2, TY - t.height // 2 - 40, 9)
img.convert('RGB').save(sys.argv[1]); print(sys.argv[1])

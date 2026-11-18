"""v2: composite a shot's plate + character layer(s) at offset 0 (same photo geometry) -> preview jpg.
  python comp.py out.jpg plate.jpg [char_final.png ...] [--w 1280]
Plate and layers are scaled to height 1080 and centre-cropped to 1920 (the engine does the same)."""
import sys
from PIL import Image
args = sys.argv[1:]; w = 1280
if '--w' in args: i = args.index('--w'); w = int(args[i + 1]); del args[i:i + 2]
out, plate, *chars = args
def fit(im):
    s = 1080 / im.height; im = im.resize((round(im.width * s), 1080), Image.LANCZOS)
    x = (im.width - 1920) // 2; return im.crop((x, 0, x + 1920, 1080))
base = fit(Image.open(plate).convert('RGBA'))
for c in chars: base.alpha_composite(fit(Image.open(c).convert('RGBA')))
base.convert('RGB').resize((w, round(w * 1080 / 1920)), Image.LANCZOS).save(out, quality=90)
print('wrote', out)

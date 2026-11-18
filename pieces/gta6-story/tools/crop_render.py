"""Wide shots: the Flow render pass redraws small figures freely. Render a 16:9 crop around the figure instead.
  python crop_render.py prep  v2/chars/<id>   -> <id>_flatcrop.jpg (+ <id>_crop.json)
  python crop_render.py merge v2/chars/<id> painted_crop.jpg -> <id>_painted.jpg (full frame on the flat key)"""
import json, sys
import numpy as np
from PIL import Image
mode, stem = sys.argv[1], sys.argv[2]
if mode == 'prep':
    a = np.array(Image.open(stem + '.png'))[..., 3] > 20
    flat = Image.open(stem + '_flat.jpg'); W, H = flat.size
    ys, xs = np.where(a); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    h = max((y1 - y0) * 1.15, (x1 - x0) * 1.15 * 9 / 16, H * 0.4); w = h * 16 / 9
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    bx = int(np.clip(cx - w / 2, 0, W - w)); by = int(np.clip(cy - h / 2, 0, H - h)); box = [bx, by, int(bx + w), int(by + h)]
    flat.crop(box).resize((1920, 1080), Image.LANCZOS).save(stem + '_flatcrop.jpg', quality=93)
    json.dump({'box': box, 'size': [W, H]}, open(stem + '_crop.json', 'w')); print('crop', box)
else:
    c = json.load(open(stem + '_crop.json')); W, H = c['size']; b = c['box']
    flat = Image.open(stem + '_flat.jpg').convert('RGB')
    key = flat.getpixel((5, 5)); base = Image.new('RGB', (W, H), key)
    p = Image.open(sys.argv[3]).convert('RGB').resize((b[2] - b[0], b[3] - b[1]), Image.LANCZOS)
    base.paste(p, (b[0], b[1])); base.save(stem + '_painted.jpg', quality=94); print('merged', stem + '_painted.jpg')

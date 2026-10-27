"""python tex/prep_tex.py -> grass.png, hedge.png (alpha) at PS1 sizes from the Flow images in tex/flow/."""
import glob, os
import numpy as np
from PIL import Image, ImageEnhance
H = os.path.dirname(os.path.abspath(__file__))
g = Image.open(glob.glob(os.path.join(H, 'flow/grass/*.jpg'))[0]).convert('RGB')
g = ImageEnhance.Color(g).enhance(0.9).resize((128, 128), Image.LANCZOS)
g.save(os.path.join(H, 'grass.png'))
h = Image.open(glob.glob(os.path.join(H, 'flow/hedge/*.jpg'))[0]).convert('RGB')
h = ImageEnhance.Color(ImageEnhance.Brightness(h).enhance(1.25)).enhance(1.35)
a = np.asarray(h).astype(int)
white = (a.min(axis=2) > 215)
rgba = np.dstack([a, np.where(white, 0, 255)]).astype(np.uint8)
im = Image.fromarray(rgba, 'RGBA')
im = im.crop(im.getbbox())
k = 256 / im.width
im = im.resize((256, max(1, round(im.height * k))), Image.NEAREST)
im.save(os.path.join(H, 'hedge.png')); print(im.size)

def match(path, out, mean, px=128):
    a = np.asarray(Image.open(path).convert('RGB').resize((px, px), Image.LANCZOS)).astype(float)
    a = a * (np.array(mean) / a.reshape(-1, 3).mean(0))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(out)
match(os.path.join(H, 'grass.png'), os.path.join(H, 'grass.png'), (92, 148, 50))
match(os.path.join(H, 'dirt.png'), os.path.join(H, 'dirt_ref.png'), (165, 122, 73))
match(os.path.join(H, 'dirt.png'), os.path.join(H, 'mud.png'), (150, 136, 92))
match(os.path.join(H, 'brick.png'), os.path.join(H, 'brick_ref.png'), (170, 140, 128))

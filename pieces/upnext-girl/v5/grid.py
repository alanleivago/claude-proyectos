import sys
from PIL import Image, ImageDraw
def grid(src, box, out, s=2, step=20):
    im = Image.open(src).convert("RGB").crop(box); W, H = im.size
    im = im.resize((W * s, H * s), Image.LANCZOS); d = ImageDraw.Draw(im)
    for x in range(0, W, step):
        d.line([(x * s, 0), (x * s, H * s)], fill=(0, 255, 255) if x % 100 == 0 else (0, 110, 130), width=1)
        if x % 100 == 0: d.text((x * s + 2, 2), str(box[0] + x), fill=(0, 255, 255))
    for y in range(0, H, step):
        d.line([(0, y * s), (W * s, y * s)], fill=(0, 255, 255) if y % 100 == 0 else (0, 110, 130), width=1)
        if y % 100 == 0: d.text((2, y * s + 2), str(box[1] + y), fill=(0, 255, 255))
    im.save(out)
if __name__ == "__main__":
    a = sys.argv; grid(a[1], tuple(int(v) for v in a[2].split(",")), a[3], int(a[4]) if len(a) > 4 else 2)

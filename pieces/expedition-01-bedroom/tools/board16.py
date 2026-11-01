# board16.py STILLS META OUTPREFIX [per] -> 16:9 boards: middle still of each shot, number + start time
import glob, re, json, os, sys
from PIL import Image, ImageDraw, ImageFont
D, META, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; per = int(sys.argv[4]) if len(sys.argv) > 4 else 16
meta = json.load(open(META, encoding='utf-8')); shots = meta['film']['shots']; words = meta.get('words') or []
fs = {}
for f in glob.glob(os.path.join(D, 's*_f*.png')):
    m = re.match(r's(\d+)([abc])_f', os.path.basename(f)); fs.setdefault(int(m.group(1)), {})[m.group(2)] = f
W, H, cols = 384, 216, 4; n = len(shots); fb = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15); fsm = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
for part in range(0, n, per):
    grp = list(range(part, min(n, part + per))); rows = (len(grp) + cols - 1) // cols
    im = Image.new('RGB', (W * cols, rows * (H + 40)), (16, 16, 20)); d = ImageDraw.Draw(im)
    for k, i in enumerate(grp):
        x, y = (k % cols) * W, (k // cols) * (H + 40); f = fs.get(i + 1, {}).get('b')
        if f: im.paste(Image.open(f).convert('RGB').resize((W, H)), (x, y))
        t0 = shots[i][1]; t1 = shots[i + 1][1] if i + 1 < n else meta['film']['dur']
        txt = ' '.join(w[2] for w in words if t0 - 0.05 <= w[0] < t1)[:56]
        d.text((x + 4, y + H + 2), f"#{i + 1}  {int(t0 // 60)}:{int(t0 % 60):02d}", fill=(255, 220, 80), font=fb); d.text((x + 4, y + H + 21), txt, fill=(200, 200, 210), font=fsm)
    im.save(f'{OUT}{part // per + 1}.png')
print(n, 'shots')

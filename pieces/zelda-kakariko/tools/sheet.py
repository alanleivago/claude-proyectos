# contact sheet: every board frame with its panel number, time span and the narration it carries
# usage: python tools/sheet.py board/times.json board/board.jpg
import json, sys, textwrap
from PIL import Image, ImageDraw, ImageFont
T = json.load(open(sys.argv[1])); V = json.load(open('voice.json'))
PS = [('p01','l01'),('p02','l02'),('p03','l03'),('p04','l04'),('p05','l05'),('p06','l06'),('p07','l07'),('p08','l08'),('p09','l09'),('p10','l10'),('p11','l11'),('p12','l12 l13'),('p13','l14'),('p14','')]
txt = {l['id']: l['text'] for l in V['lines']}
fmt = lambda t: '%d:%04.1f' % (int(t // 60), t % 60)
cw, ch, cols = 400, 711, 7; th = 230
try: F = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia.ttf', 19); FB = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 24)
except Exception: F = FB = ImageFont.load_default()
rows = (len(T) + cols - 1) // cols
S = Image.new('RGB', (cols * cw, rows * (ch + th)), (24, 18, 26)); d = ImageDraw.Draw(S)
for i, p in enumerate(T):
    x, y = (i % cols) * cw, (i // cols) * (ch + th)
    im = Image.open('board/%s.jpg' % p['id']).convert('RGB').resize((cw - 8, ch - 8)); S.paste(im, (x + 4, y + 4))
    d.text((x + 10, y + ch + 6), '%s  %s–%s' % (p['id'].upper(), fmt(p['t0']), fmt(p['t1'])), font=FB, fill=(240, 200, 120))
    s = ' '.join(txt[l] for l in PS[i][1].split()) if PS[i][1] else '(sign-off) AMPHORUS · "What the shadows buried stays buried"'
    for j, ln in enumerate(textwrap.wrap(s, 36)[:8]): d.text((x + 10, y + ch + 40 + j * 23), ln, font=F, fill=(240, 232, 214))
S.save(sys.argv[2], quality=88); print(sys.argv[2], S.size)

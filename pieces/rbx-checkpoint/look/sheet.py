# python look/sheet.py -> look/c_expr.png (hero / Turbo / Flagman x 5 moods), look/d_poof.png (trip -> poof / pop-in at the flag)
# and look/look_sheet.jpg (6x2 labelled panels)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
try:
    F = lambda s: ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', s)
    font, big = F(26), F(30)
except Exception:
    font = big = ImageFont.load_default()
EX = {'hero': ['calm', 'ohno', 'laugh', 'scream', 'calm-talk'], 'turbo': ['calm', 'happy', 'shock', 'sad', 'bark'], 'flagman': ['proud', 'shout-talk', 'laugh', 'terror', 'whistle']}
ex = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(ex); tw, th = 360, 384
for ci, (n, moods) in enumerate(EX.items()):
    for ri, m in enumerate(moods):
        im = Image.open(os.path.join(d, 'x_%s_%s.png' % (n, m))).convert('RGB').crop((60, 470, 1020, 1494)).resize((tw, th), Image.LANCZOS)
        x, y = ci * tw, ri * th; ex.paste(im, (x, y)); g.rectangle([x, y + th - 34, x + tw, y + th], fill=(0, 0, 0)); g.text((x + 8, y + th - 30), '%s  %s' % (n, m), font=font, fill=(255, 255, 255))
ex.save(os.path.join(d, 'c_expr.png'))
po = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(po)
for i, (n, lab) in enumerate([('d1_trip', 'trips on the sidewalk -> POOF'), ('d2_pop', '-> pops in at his flag (Clock Tower)')]):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB').crop((0, 480, 1080, 1440)); po.paste(im, (0, i * 960))
    g.rectangle([0, i * 960 + 960 - 44, W, i * 960 + 960], fill=(0, 0, 0)); g.text((12, i * 960 + 960 - 38), lab, font=big, fill=(255, 255, 255))
po.save(os.path.join(d, 'd_poof.png'))
P = [('a_cast', 'a  main cast (Gneef hair / outfits / faces)'), ('b_cast2', 'b  school, water park, parade, top guy'), ('c_expr', 'c  faces change all the time (+ talk)'),
     ('d_poof', 'd  the POOF: trip -> respawn at your flag'), ('e_square', 'e  square: Turbo boops the town flag'), ('f_school', 'f  math room checkpoint: back to fractions'),
     ('g_pool', 'g  water park roof: save, then jump'), ('h_tower', 'h  Clock Tower: 300 steps down'), ('i_fair', 'i  the Fair: the square cracks'),
     ('j_hole', 'j  the sinkhole at night'), ('k_climb', 'k  rock to rock, root to root'), ('l_end', 'l  ending: Turbo boops my flag')]
w, h = 540, 960
sheet = Image.new('RGB', (w * 6, h * 2), 'black'); g = ImageDraw.Draw(sheet)
for i, (n, label) in enumerate(P):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % 6) * w, (i // 6) * h; sheet.paste(im, (x, y))
    g.rectangle([x, y, x + w, y + 40], fill=(0, 0, 0)); g.text((x + 10, y + 8), label, font=font, fill=(255, 255, 255))
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=90); print('ok')

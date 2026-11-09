# python look/sheet.py -> look/b_faces.png + look/j_expr.png (tiled head renders) + look/look_sheet.jpg (5x2 labelled panels)
import os
from PIL import Image, ImageDraw, ImageFont
d = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
try:
    F = lambda s: ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', s)
    font, small = F(26), F(30)
except Exception:
    font = small = ImageFont.load_default()
# faces panel: 6 head close-ups, 2 columns x 3 rows, each 540x640 crop around the head, labelled with the face code
FC = [('fc1', 'hero  F8 oh-no'), ('fc2', 'Oona  F2 humming'), ('fc3', '1971 guy  F12 SNEEZE'), ('fc4', 'girl  F5 laugh'), ('fc5', 'worker  F14 strain'), ('fc6', 'moustache  F13 terror')]
faces = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(faces)
for i, (n, lab) in enumerate(FC):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB')
    c = im.crop((0, 320, 1080, 1600)).resize((540, 640), Image.LANCZOS)
    x, y = (i % 2) * 540, (i // 2) * 640; faces.paste(c, (x, y))
    g.rectangle([x, y + 640 - 44, x + 540, y + 640], fill=(0, 0, 0)); g.text((x + 12, y + 640 - 38), lab, font=small, fill=(255, 255, 255))
faces.save(os.path.join(d, 'b_faces.png'))
# expressions panel: hero / Oona / girl (columns) x 5 moods (rows): the same character changes face over time
EX = {'hero': ['calm', 'ohno', 'strain', 'laugh', 'scream'], 'oona': ['calm', 'laugh', 'sad', 'terror', 'calm-talk'], 'girl': ['calm', 'shock', 'grin', 'worry', 'laugh-talk']}
ex = Image.new('RGB', (W, H), 'black'); g = ImageDraw.Draw(ex); tw, th = 360, 384
for ci, (n, moods) in enumerate(EX.items()):
    for ri, m in enumerate(moods):
        im = Image.open(os.path.join(d, 'x_%s_%s.png' % (n, m))).convert('RGB').crop((60, 470, 1020, 1494)).resize((tw, th), Image.LANCZOS)
        x, y = ci * tw, ri * th; ex.paste(im, (x, y)); g.rectangle([x, y + th - 34, x + tw, y + th], fill=(0, 0, 0)); g.text((x + 8, y + th - 30), '%s  %s' % (n, m), font=font, fill=(255, 255, 255))
ex.save(os.path.join(d, 'j_expr.png'))
P = [('a_cast', 'a  cast line-up (Gneef hair / outfits / faces)'), ('b_faces', 'b  face decals at the extremes'), ('c_city', 'c  the rope down every street'),
     ('d_gags', 'd  one-handed wedding + baby gloves'), ('e_coast', 'e  across the ocean on posts'), ('f_front', 'f  the Front: knot No.1 at the Fog'),
     ('g_fog', 'g  inside the Fog, hand over hand'), ('h_ridge', 'h  over the ridge: the other world'), ('i_waveday', 'i  Wave Day'), ('j_expr', 'j  faces change over time (talk / react)')]
w, h = 540, 960
sheet = Image.new('RGB', (w * 5, h * 2), 'black'); g = ImageDraw.Draw(sheet)
for i, (n, label) in enumerate(P):
    im = Image.open(os.path.join(d, n + '.png')).convert('RGB').resize((w, h), Image.LANCZOS)
    x, y = (i % 5) * w, (i // 5) * h; sheet.paste(im, (x, y))
    g.rectangle([x, y, x + w, y + 40], fill=(0, 0, 0)); g.text((x + 12, y + 8), label, font=font, fill=(255, 255, 255))
sheet.save(os.path.join(d, 'look_sheet.jpg'), quality=90); print('ok')

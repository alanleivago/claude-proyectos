# learning-faces thumbnails, the World of Horror search look: round 14 = the film's own soft.py 7-tone grid, a tight off-centre face crop cut by the frame, a small
# STRAIGHT kanji-only box in the emptiest corner (Nosutaru dot, bold), at most one red accent word, fine grain, and the
# hand-drawn white border (borde encima, keyed) on top. Faces: Japanese WoH/Junji characters from the film.
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, '/Users/alanleiva/claude-proyectos/pieces/bells/tools')
P = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'; OUT = P + 'thumbs/'; FD = '/Users/alanleiva/claude-proyectos/fonts/'
src = open('/Users/alanleiva/claude-proyectos/pieces/bells/tools/thumbs.py').read()
ns = {}
exec(src[:src.index('made = []')], ns)            # lut, crop, grain, pixmask, put, BORDER, BW, ACCENT, KANJI
for k in ('clean', 'emptiest', 'small_box', 'stamp_jp'):
    L_ = src[src.index('def ' + k):].split('\n'); blk = [L_[0]]
    for ln in L_[1:]:
        if ln and not ln[0].isspace(): break
        blk.append(ln)
    exec('\n'.join(blk), ns)
lut, grain, put, pixmask, BW, ACCENT, KANJI, BORDER = (ns[k] for k in ('lut', 'grain', 'put', 'pixmask', 'BW', 'ACCENT', 'KANJI', 'BORDER'))
small_box, clean = ns['small_box'], ns['clean']
def nat(n): return np.array(Image.open(P + 'assets/' + n).convert('L'))
def frame(img, k, x0, y0):   # the 4-px grid image scaled k x nearest and cropped to 1280x720
    h, w = img.shape; return Image.fromarray(np.dstack([img] * 3)).resize((w * k, h * k), Image.NEAREST).crop((x0, y0, x0 + 1280, y0 + 720))
def holes(img, eyes, r):   # the reveal's last look: the eyes sunk into two black holes with a dark grey rim (as the film ends it)
    a = img.copy(); yy, xx = np.mgrid[:a.shape[0], :a.shape[1]]
    for ex, ey in eyes:
        d = np.hypot(xx - ex, (yy - ey) * 1.1); a[(d <= r * 1.2) & (d > r) & (a > 46)] = 46; a[d <= r] = 0
    return a
def red(im, word, pos, k=4):
    g = pixmask(word, KANJI, 20, k, bold=True); return put(im, g, pos[0], pos[1], ACCENT, 'lt', outline=4)
made = []
def finish(im, name):
    im = grain(im, 4).convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made.append(name)
Q = nat('f24_q.png'); QH = holes(Q, [(211, 116), (269, 116)], 10)
D5, D2, D4, PI, CA = nat('d5_smile.png'), nat('d2_imprint.png'), nat('d4_draft.png'), nat('f09_pilot_b.png'), nat('b23_smilingc.png')   # no clean(): soft.py only
# t1: the copied face with the hole-eyes, tight, cut by the right edge; box bottom-left; red 次は (next)
im = frame(QH, 7, 900, 260); im, b = small_box(im, '誰の顔', k=5, pos=(40, 40)); finish(red(im, '次は', (60, b[3] + 20), k=5), 't1_holes_dareno_red')
# t2: the same face centred, almost perfect (his eyes still his), box top-right: 顔
im = frame(Q, 6, 840, 230); im, _ = small_box(im, '顔', k=8, avoid=[(250, 0, 1050, 720)]); finish(im, 't2_face_kao')
# t3: dive 5, nearly a man dissolving into the flesh, box left
im = frame(D5, 5, 900, 0); im, _ = small_box(im, '学ぶ顔', k=5, avoid=[(380, 0, 1280, 720)]); finish(im, 't3_dive5_manabu')
# t4: dive 2, the pressed-in face, extreme close-up; box + red
im = frame(D2, 7, 1450, 350); im, b = small_box(im, '見るな', k=5, avoid=[(200, 0, 1100, 720)]); finish(red(im, '海の底', (1280 - 60 - 230, 620), k=4), 't4_dive2_mirumna_red')
# t5: the pilot staring at the glass (terror), box bottom-right
im = frame(PI, 5, 450, 120); im, _ = small_box(im, '真似', k=6, avoid=[(0, 0, 900, 720)]); finish(im, 't5_pilot_mane')
# t6: dive 4, the drafted face (one eye, a dent, a seam), box right
im = frame(D4, 6, 900, 0); im, _ = small_box(im, '未完成', k=5, avoid=[(250, 0, 1000, 720)]); finish(im, 't6_dive4_mikansei')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet); f = ImageFont.load_default()
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm, fill=(240, 200, 140), font=f)
d.text((10, 10), 'learning-faces thumbnails: WoH search look (flat grid, tight face, straight kanji box, one red accent) + 320x180 check', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet.png'); print(made)

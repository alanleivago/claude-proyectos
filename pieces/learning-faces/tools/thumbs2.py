# thumbs2.py (round 17, new set): WoH search-results thumbnails from new Flow scene compositions (gen/thumbs/n*.jpg):
# a Japanese character confronting the thing. soft.py processing at thumbnail size (4-px cells, median, 7 tones),
# a fine 2-px checker only in the deep shadows (the WoH texture, nowhere else), a small straight Japanese-only box placed
# off the key image, at most one red word, the hand-drawn white frame on top, grain. Sheet with the 320x180 check.
import numpy as np, sys
from PIL import Image, ImageDraw, ImageFont
P = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'; OUT = P + 'thumbs/'
src = open('/Users/alanleiva/claude-proyectos/pieces/bells/tools/thumbs.py').read(); ns = {}
exec(src[:src.index('made = []')], ns)
for k in ('stamp_jp',):
    L_ = src[src.index('def ' + k):].split('\n'); blk = [L_[0]]
    for ln in L_[1:]:
        if ln and not ln[0].isspace(): break
        blk.append(ln)
    exec('\n'.join(blk), ns)
grain, put, pixmask, ACCENT, KANJI, BORDER, stamp_jp = (ns[k] for k in ('grain', 'put', 'pixmask', 'ACCENT', 'KANJI', 'BORDER', 'stamp_jp'))
LV = np.array([0.0, 0.18, 0.34, 0.50, 0.66, 0.84, 1.0]); T7 = np.round(LV * 255).astype(np.uint8)
def soft(path):
    a = np.asarray(Image.open(path).convert('L').resize((1280, 720), Image.LANCZOS), np.float32) / 255
    c = 4; h, w = 720 // c, 1280 // c
    g = np.median(a.reshape(h, c, w, c).transpose(0, 2, 1, 3).reshape(h, w, c * c), axis=2)
    q = T7[np.abs(g[..., None] - LV).argmin(-1)]
    big = np.kron(q, np.ones((c, c), np.uint8))
    yy, xx = np.mgrid[:720, :1280]; chk = ((xx // 2 + yy // 2) % 2 == 0)
    big = np.where((big == 46) & chk, 0, np.where(big == 46, 87, big)).astype(np.uint8)   # deep shadows only: a fine checker
    return Image.fromarray(np.dstack([big] * 3))
def box(im, kanji, pos, k=5): return stamp_jp(im, kanji, pos[0], pos[1], k=k)
def red(im, word, pos, k=4): return put(im, pixmask(word, KANJI, 20, k, bold=True), pos[0], pos[1], ACCENT, 'lt', outline=4)
made = []
def finish(im, name):
    im = grain(im, 4).convert('RGBA'); im.alpha_composite(BORDER); im.convert('RGB').save(OUT + name + '.png'); made.append(name)
G = P + 'gen/thumbs/'
finish(red(box(soft(G + 'n1_porthole.jpg'), '真似', (60, 520)), '次は', (1060, 60)), 'x1_porthole_mane_red')        # top pick
finish(box(soft(G + 'n2_camcorder.jpg'), '誰の顔', (60, 520)), 'x2_camcorder_dareno')
finish(box(soft(G + 'n3_diver.jpg'), '見るな', (60, 60), k=6), 'x3_diver_mirumna')                                     # top pick
finish(red(box(soft(G + 'n4_photos.jpg'), '次はあなた', (60, 50)), '顔', (1120, 600), k=5), 'x4_photos_anata_red')
finish(box(soft(G + 'n5_visor.jpg'), '後ろ', (950, 520), k=6), 'x5_visor_ushiro')
finish(box(soft(G + 'n6_tank.jpg'), '私の顔', (60, 520)), 'x6_tank_watashi')
finish(red(box(soft(G + 'n7_skin.jpg'), '空っぽ', (540, 500)), '誰', (60, 60), k=5), 'x7_skin_karappo_red')
sheet = Image.new('RGB', (2 * 1000 + 10, 4 * 390 + 60), (40, 40, 40)); d = ImageDraw.Draw(sheet); f = ImageFont.load_default()
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); col, row = i % 2, i // 2; cx, cy = 10 + col * 1000, 50 + row * 390
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
    d.text((cx + 650, cy + 190), nm + ('  <- TOP PICK' if nm in ('x1_porthole_mane_red', 'x3_diver_mirumna') else ''), fill=(240, 200, 140), font=f)
d.text((10, 10), 'learning-faces thumbnails (new set): WoH scene compositions, soft 7 tones + deep-shadow checker, straight Japanese box, one red word max, 320x180 check', fill=(255, 255, 255), font=f)
sheet.save(OUT + 'sheet_new.png'); print(made)

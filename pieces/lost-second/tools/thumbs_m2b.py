# m2b: the m2 thumbnail (the man on the right, the subway in red and black) with the man closer and a vertical white
# kanji title on the left (Nosutaru pixel font, bold pass, black edge). Columns read top to bottom, right to left.
exec(open(__file__.replace('thumbs_m2b.py', 'thumbs_m.py')).read().split("made = []")[0])
made = []
def vert(im, columns, x_right, y_top, k, gap=10, colgap=24):
    """columns: strings, the first is the rightmost; each glyph centred in a square cell of 20*k px"""
    cell = 20 * k; x = x_right
    for col in columns:
        for j, ch in enumerate(col):
            g = pixmask(ch, KANJI, 20, k, bold=True); h, w = g.shape
            im = put(im, g, x - cell // 2 - w // 2, y_top + j * (cell + gap) + (cell - h) // 2, outline=5)
        x -= cell + colgap
    return im
K, X0, Y0 = 7, 120, 0                                            # him at x7, cropped so he stays on the right
for i, cols in enumerate((['失われ', 'た一秒'], ['残り一歩'], ['振り向', 'く男'])):
    im = grain(crop(scene(), K, X0, Y0))
    k = 7; top = (720 - max(len(c) for c in cols) * (20 * k + 10)) // 2   # big, centred in the height
    im = vert(im, cols, 70 + (20 * k) * len(cols) + 24 * (len(cols) - 1), top, k)
    finish(im, f'm2b_{i + 1}')
sheet = Image.new('RGB', (1000 + 10, 3 * 380 + 10), (40, 40, 40))
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); cy = 10 + i * 380
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (10, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (660, cy))
sheet.save(OUT + 'sheet_m2b.png'); print(made)

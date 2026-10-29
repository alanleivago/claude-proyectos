# m2c: m2b with the kanji in ONE vertical column, centred in the gap between the frame and the man, in two renderings
# of the same font file (fonts/Nosutaru-dotMPlusH-10-Regular.ttf):
#   'bold20' = how m1-m2b drew it: at 20 px (twice its design size) with an extra bold pass;
#   'native' = the font as designed: at 12 px its outlines land exactly on its dot grid (no grey), no bold, every dot
#   scaled up whole (at 10 px, its name's size, PIL renders it blurred: the dots fall between pixels).
exec(open(__file__.replace('thumbs_m2c.py', 'thumbs_m.py')).read().split("made = []")[0])
made = []
K, X0, Y0 = 7, 120, 0
LEFT_IN, TOP_IN, BOT_IN = 32, 28, 692                       # inside edges of the frame overlay
figx = np.where(np.kron(FIG, np.ones((K, K), bool))[Y0:Y0 + 720, X0:X0 + 1280], np.arange(1280)[None, :], 9999).min(1)   # his leftmost px per row
STYLES = {'bold20': dict(size=20, bold=True), 'native': dict(size=12, bold=False)}
def column(im, text, style, margin=40, gap=10):
    st = STYLES[style]; n = len(text); avail = BOT_IN - TOP_IN - 2 * margin
    k = max(1, (avail // n - gap) // st['size']); k = min(k, 12 if st['size'] == 12 else 7)   # as big as fits, capped
    cell = st['size'] * k; total = n * cell + (n - 1) * gap; top = (TOP_IN + BOT_IN - total) // 2
    gl = [pixmask(ch, KANJI, st['size'], k, bold=st['bold']) for ch in text]
    wmax = max(g.shape[1] for g in gl)
    right = figx[max(0, top):top + total].min() - 12                   # the gap's right side: his nearest edge over the column
    cx = (LEFT_IN + right) // 2
    for j, g in enumerate(gl):
        h, w = g.shape; im = put(im, g, cx - w // 2, top + j * (cell + gap) + (cell - h) // 2, outline=5)
    return im, k, cx, wmax, right
for style in STYLES:
    for i, text in enumerate(('失われた一秒', '残り一歩', '振り向く男')):
        im, k, cx, wmax, right = column(grain(crop(scene(), K, X0, Y0)), text, style)
        print(style, text, 'scale', k, 'centre x', cx, 'glyph w', wmax, 'gap to him', right - (cx + wmax // 2), 'gap to frame', cx - wmax // 2 - LEFT_IN)
        finish(im, f'm2c_{style}_{i + 1}')
sheet = Image.new('RGB', (2 * 1000 + 10, 3 * 380 + 10), (40, 40, 40))
for i, nm in enumerate(made):
    im = Image.open(OUT + nm + '.png'); cx, cy = 10 + (i // 3) * 1000, 10 + (i % 3) * 380
    sheet.paste(im.resize((640, 360), Image.LANCZOS), (cx, cy)); sheet.paste(im.resize((320, 180), Image.LANCZOS), (cx + 650, cy))
sheet.save(OUT + 'sheet_m2c.png'); print(made)

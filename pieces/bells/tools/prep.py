# prep.py (bells): every Flow image -> native grid (native.py flat4) -> assets/. The log's handwriting is finer than the
# native grid (it turns to mush at 240x134), so the pages are blanked on the native layer and the ink goes to its own
# layer, log_ink.png, sampled at HALF the native period (480x268, 4 px a cell on screen), 1-bit black on transparent.
# Flow's nonsense margin labels (13AM..18AM) and the struck-through last rows of the right page are left out of the ink.
import subprocess, sys, numpy as np
from PIL import Image
PY, D = sys.executable, '/Users/alanleiva/claude-proyectos/pieces/bells/'
run = lambda *a: subprocess.run([PY, *a], check=True, cwd=D, timeout=300)
# the fog face is candidate A1 ("the sky is the face"), closed and its wide-eye edit (user pick, round 3)
BOARD = ['b01_monastery', 'b02_plague', 'b02_war', 'b03_monks', 'b04_died', 'b05_bell', 'b06_dogs', 'b07_window', 'b07_window_b',
         'b08_fog', 'b09_sunrise', 'b11_slits', 'b11_half', 'b12_rope', 'b13_archive', 'b15_oldest', 'b16_historians', 'b17_band',
         'b18_scratched', 'b19_cemetery', 'b20_empty', 'b21_carry', 'b22_hands', 'b23_above', 'b25_rang', 'b26_sliver', 'b27_monk',
         'b28_town', 'b29_empty', 'b03_villagers']
for _new in ['b12_rope_new']: pass
for n, g in [('face_closed', 'cand_A1'), ('face_open', 'eyes_O4'), ('reveal', 'reveal_all'), ('log', 'log')] + [(b, b) for b in BOARD]:
    run('tools/native.py', f'gen/{g}.jpg', f'assets/{n}.png', 'flat4')
src = Image.open(D + 'gen/log.jpg').convert('L'); SW, SH = src.size
INK = [(402, 168, 676, 572), (704, 168, 1038, 517)]   # text boxes in source px: left page (no margin labels), right page (no struck rows)
# the ink layer: Flow's handwriting turns to mush at any pixel grid, so ONE hand-drawn pixel word "Asleep" (slanted
# script, 4 px cells) is stamped in rows over both pages, every copy the same word, with a little hand jitter that grows
# toward the end of the right page (the ink gets shakier)
WORD = {   # rows 0-8: cap height 0-6, x-height 3-6, descender 7-8
 'A': ['..#..', '.#.#.', '.#.#.', '#...#', '#####', '#...#', '#...#', '.....', '.....'],
 's': ['...', '...', '...', '.##', '#..', '.#.', '##.', '...', '...'],
 'l': ['#.', '#.', '#.', '#.', '#.', '#.', '.#', '..', '..'],
 'e': ['....', '....', '....', '.##.', '####', '#...', '.###', '....', '....'],
 'p': ['....', '....', '....', '###.', '#..#', '#..#', '###.', '#...', '#...'],
}
rows = ['' for _ in range(9)]
for ch in 'Asleep':
    for r in range(9): rows[r] += WORD[ch][r] + '.'
WW = len(rows[0]) + 3
spr = np.zeros((9, WW), bool)
for r in range(9):
    sh = (8 - r) // 3   # the slant: top rows lean right
    for c, v in enumerate(rows[r]):
        if v == '#': spr[r, c + sh] = True
rng = np.random.default_rng(7)
ink = np.zeros((268, 480), bool)
PAGES = [(128, 236, 60, 200, 3, 0.0), (250, 358, 60, 192, 3, 1.0)]   # x0, x1, y0, y1 (ink cells), words per row, shake ramp
for x0, x1, y0, y1, nw, ramp in PAGES:
    gap = ((x1 - x0) - nw * WW) / max(1, nw - 1)
    nrow = (y1 - y0) // 11
    for ri in range(nrow):
        k = ri / max(1, nrow - 1); j = 1 + int(round(ramp * k * 1.5))
        for wi in range(nw):
            x = int(x0 + wi * (WW + gap) + rng.integers(-j, j + 1)); y = int(y0 + ri * 11 + rng.integers(-(j > 1), (j > 1) + 1))
            ink[y:y + 9, x:x + WW] |= spr
rgba = np.zeros((268, 480, 4), np.uint8); rgba[ink, 3] = 255
Image.fromarray(rgba, 'RGBA').save(D + 'assets/log_ink.png'); print('log_ink: stamped words')
# the native layer: the page area (labels and struck rows included) goes white
lg = np.asarray(Image.open(D + 'assets/log.png')).copy(); h, w = lg.shape[:2]
for x0, y0, x1, y1 in [(352, 168, 676, 574), (704, 168, 1040, 572)]:
    a, b, c, d = round(x0 * w / SW), round(y0 * h / SH), round(x1 * w / SW), round(y1 * h / SH)
    lg[b:d, a:c, :3] = 253
Image.fromarray(lg).save(D + 'assets/log.png'); print('log pages blanked')
# the page stacks: Flow's edges came out as noisy black/white blobs -> clean stripes (pages seen edge-on): vertical
# on the side stacks, horizontal along the bottom; only the black/white cells are re-drawn, so the outline stays
lg = np.asarray(Image.open(D + 'assets/log.png')).copy(); L = lg[..., 0]
def stripes(x0, x1, y0, y1, vertical):
    for y in range(y0, y1):
        for x in range(x0, x1):
            if L[y, x] in (0, 253): lg[y, x, :3] = 253 if ((x if vertical else y) % 2 == 0) else 0
stripes(47, 62, 30, 99, True); stripes(180, 194, 30, 99, True); stripes(56, 186, 99, 109, False)
Image.fromarray(lg).save(D + 'assets/log.png'); print('log: page stacks striped')
# the chapter tag font (the user's own tag, from their video AMpBNywoQB0): Nosutaru dot 10 px, 1-bit, one cell per glyph
# (12x12, glyph at +1,+1); src/tagfont.js gets the char list and advances. Drawn x4 in code (40 px glyphs at 1080).
from PIL import ImageDraw, ImageFont
TAGS = ['修道院-THE MONASTERY', '深夜-02:59 AM', '午前三時-03:00 AM', '沈黙-HOURS SILENT', '記録-THE LOG', '鐘-THE BELLS 1939-1945',
        '奪われた鐘-BELLS TAKEN', '冬-WINTER 1942', '第七夜-NIGHT 7', '0123456789,']
f = ImageFont.truetype('/Users/alanleiva/claude-proyectos/fonts/Nosutaru-dotMPlusH-10-Regular.ttf', 10)
chars = sorted(set(''.join(TAGS)) | set(' '))
atl = Image.new('RGBA', (12 * 16, 12 * ((len(chars) + 15) // 16)), (0, 0, 0, 0)); d = ImageDraw.Draw(atl); d.fontmode = '1'
for i, ch in enumerate(chars): d.text(((i % 16) * 12 + 1, (i // 16) * 12 + 1), ch, font=f, fill=(0, 0, 0, 255))
atl.save(D + 'assets/tagfont.png')
open(D + 'src/tagfont.js', 'w').write('// generated by tools/prep.py: Nosutaru dot 10 px atlas for the chapter tags\nconst TF_CHARS = ' + __import__('json').dumps(''.join(chars), ensure_ascii=False) + ';\nconst TF_ADV = ' + str([int(f.getlength(c)) for c in chars]) + ';\n')
print('tagfont', len(chars), 'glyphs')
# beat 27: Flow's gibberish sign on the barrier is blanked to flat grey (the code letters "DRUM ÎNCHIS" on it)
m = np.asarray(Image.open(D + 'assets/b27_monk.png')).copy(); h, w = m.shape[:2]
x0, y0, x1, y1 = round(604 * w / 1376), round(648 * h / 768), round(808 * w / 1376), round(748 * h / 768)
m[y0 + 1:y1 - 1, x0 + 1:x1 - 1, :3] = 142; Image.fromarray(m).save(D + 'assets/b27_monk.png'); print('b27 sign blanked', x0, y0, x1, y1)
# beat 25: Flow drew a second, distant monastery left of the face; it is painted out with the clouds/slope from just left of it
m = np.asarray(Image.open(D + 'assets/b25_rang.png')).copy()
m[50:82, 50:78] = m[50:82, 22:50]; Image.fromarray(m).save(D + 'assets/b25_rang.png'); print('b25: second monastery painted out')
# the end card (beat 30) in the outro wordmark's font and spacing (That That New Pixel square, letters packed by closest
# ink GAP font pixels apart, as tools/outro.py does for "madfable"), two lines, white 1-bit on transparent; per-line char
# right edges go to src/cardtext.js so the card can type them on
SIZE, U, GAP = 120, 6, 1   # 120 px -> 6 px font pixels at 1080
fc = ImageFont.truetype('/Users/alanleiva/claude-proyectos/fonts/thatthatnewpixelfamilytest-square.otf', SIZE)
def packed(text):
    c = np.zeros((300, 3000), bool); x = 20; ends = []
    for i, ch in enumerate(text):
        if ch == ' ': x += 4 * U; ends.append(x); continue
        if ch == "'":   # the font has no apostrophe: one font pixel wide, three tall, at the ascender top
            hg = Image.new('L', (300, 300)); ImageDraw.Draw(hg).text((20, 40), 'h', font=fc, fill=255); ht = hg.getbbox()[1]
            gl = np.zeros((300, U), bool); gl[ht:ht + 3 * U] = True
        else:
            g = Image.new('L', (300, 300)); ImageDraw.Draw(g).text((20, 40), ch, font=fc, fill=255)
            bb = g.getbbox()
            if not bb: ends.append(x); continue
            l, _, r, _ = bb; gl = np.asarray(g.crop((l, 0, r, 300))) > 127
        right = np.where(c.any(1), c.shape[1] - 1 - np.argmax(c[:, ::-1], 1), -10**6)
        right = np.max([np.roll(right, k) for k in range(-U, U + 1)], 0)
        left = np.where(gl.any(1), np.argmax(gl, 1), 10**6); rows = (right > -10**6) & (left < 10**6)
        pos = max(x, int((right[rows] + GAP * U + 1 - left[rows]).max())) if rows.any() and i and text[i - 1] != ' ' else x
        c[:, pos:pos + gl.shape[1]] |= gl; x = pos + gl.shape[1]; ends.append(x)
    ys, xs = np.nonzero(c); x0 = xs.min()
    n = (c[ys.min():ys.max() + 1, x0:xs.max() + 1] * 255).astype(np.uint8)
    return n, [int(max(0, e - x0)) for e in ends], int(ys.min())
card = []
for k, t in enumerate(['who will ring them', "when we're gone?"]):
    n, ends, top = packed(t)
    Image.fromarray(np.dstack([np.where(n > 0, 253, 0).astype(np.uint8)] * 3 + [n]), 'RGBA').save(D + f'assets/card_l{k + 1}.png')
    card.append({'text': t, 'ends': ends, 'w': int(n.shape[1]), 'h': int(n.shape[0]), 'top': int(top)})
open(D + 'src/cardtext.js', 'w').write('// generated by tools/prep.py: end-card lines in the outro wordmark font\nconst CARD_TXT = ' + __import__('json').dumps(card) + ';\n')
print('card lines', [(c['w'], c['h']) for c in card])
# beat 22: the hands read muddy in flat4 (grey hands on a dark grey wall) -> the 3-level flat pass: hands light, wall black
# levels first (Flow's greys sit in a narrow band): wall 0.08 -> black, sleeves 0.2 -> dark grey, hands 0.66 -> white;
# then flat4, then the thin Flow outline (it breaks into stray dashes on the grid) is removed: a white cell with fewer
# than 3 light neighbours, sitting in the dark, goes to the dark around it
_h = np.asarray(Image.open(D + 'gen/b22_hands.jpg').convert('RGB')).astype(np.float32) / 255
_h = np.clip((_h - 0.10) / 0.58, 0, 1); Image.fromarray((_h * 255).astype(np.uint8)).save(D + 'native/b22_levels.png')
run('tools/native.py', 'native/b22_levels.png', 'assets/b22_hands.png', 'flat4')
_m = np.asarray(Image.open(D + 'assets/b22_hands.png')).copy(); _L = _m[..., 0].astype(int); _n = 0
for _ in range(2):
    _P = np.pad(_L, 1, constant_values=0)
    light = sum((_P[1 + dy:1 + dy + _L.shape[0], 1 + dx:1 + dx + _L.shape[1]] >= 142).astype(int) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    dark = sum(_P[1 + dy:1 + dy + _L.shape[0], 1 + dx:1 + dx + _L.shape[1]] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    kill = (_L == 253) & (light < 3)
    _L[kill] = np.where(dark[kill] > 8 * 40, 56, 0); _n += int(kill.sum())
for _ in range(2):   # the wall: lone dark-grey specks in the black go black
    _P = np.pad(_L, 1, constant_values=0)
    nz = sum((_P[1 + dy:1 + dy + _L.shape[0], 1 + dx:1 + dx + _L.shape[1]] > 0).astype(int) for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    _L[(_L == 56) & (nz < 4)] = 0
_m[..., :3] = _L[..., None]; Image.fromarray(_m).save(D + 'assets/b22_hands.png'); print('b22: levels + flat4, stray outline cells removed', _n)
# b22: small white specks left in the black (bottom right) after the outline cleanup -> black
from scipy import ndimage as _nd
_m = np.asarray(Image.open(D + 'assets/b22_hands.png')).copy(); _w = _m[..., 0] == 253
_lab, _k = _nd.label(_w); _sz = _nd.sum(_w, _lab, range(1, _k + 1))
_small = np.isin(_lab, 1 + np.where(_sz < 8)[0]); _m[_small, :3] = 0; Image.fromarray(_m).save(D + 'assets/b22_hands.png'); print('b22 specks', int(_small.sum()))

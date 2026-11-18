"""vera-01 storyboard post: on every engine still (engine/stills/<dir>/f_XXXX.png, shot i at frame (3i+1)*30) adds the UpNext subtitle card
(Pixelify Sans Bold 66 px x0.84 wide, -1 tracking, 4 px black outline + (4,4) hard shadow + soft light glow, line 1 centred on y=1325;
white = Vera, #F3DF6A = Theo), the episode title card on top while it is on screen (0-3.4 s: "EPISODE 1" coral, "THE LAST SLICE" white,
thicker outline, y ~ 17-22 %), vignette (interior -30 %, street -45 %) and grain. No rounded frame (the missmedannypsx ref has none).
Writes storyboard/shot_<id>.png and the contact sheet storyboard/board.png (shot, time, line, clip, face).
usage: python tools/compose.py <stills dir> [--set <set stills dir>]"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
sys.path.insert(0, str(Path(__file__).resolve().parent))

PIECE = Path(__file__).resolve().parents[1]
ENG = PIECE / 'engine'; OUT = PIECE / 'storyboard'
FONT = str(ENG / 'fonts' / 'PixelifySans.ttf')
W, H = 1080, 1920
WHITE, YELLOW, BLACK, CORAL = (255, 255, 255), (0xF3, 0xDF, 0x6A), (0x0A, 0x0A, 0x10), (0xF0, 0x8A, 0xA0)
TITLE_END = 3.4
STREET = {'29'}


def font(size, weight=b'Bold'):
    f = ImageFont.truetype(FONT, size)
    try: f.set_variation_by_name(weight)
    except Exception: pass
    return f


def text_mask(s, size=66, squeeze=0.84, track=-1):
    f = font(size); adv = [f.getlength(c) + track for c in s]; w = int(sum(adv)) + 20
    m = Image.new('L', (w, size * 2), 0); d = ImageDraw.Draw(m); x = 10
    for c, a in zip(s, adv): d.text((x, size // 2), c, font=f, fill=255); x += a
    m = m.point(lambda v: 255 if v > 120 else 0); bb = m.getbbox(); m = m.crop((bb[0], 0, bb[2], m.height))
    return m.resize((max(1, int(m.width * squeeze)), m.height), Image.NEAREST)


def draw_line(img, s, color, cy, size=66, outline=9, glow=0.75):
    m = text_mask(s, size); o = m.filter(ImageFilter.MaxFilter(outline))
    x0, y0 = W // 2 - m.width // 2, cy - m.height // 2
    pad = Image.new('L', (o.width + 60, o.height + 60), 0); pad.paste(o, (30, 30))
    gl = pad.filter(ImageFilter.GaussianBlur(11)).point(lambda v: int(v * glow))   # soft light halo like the approved UpNext subtitles
    img.paste(Image.new('RGB', gl.size, (255, 255, 250)), (x0 - 30, y0 - 30), gl)
    blk = Image.new('RGB', m.size, BLACK)
    img.paste(blk, (x0 + 4, y0 + 4), o); img.paste(blk, (x0, y0), o); img.paste(Image.new('RGB', m.size, color), (x0, y0), m)


def lines_of(s):
    if len(s) <= 28: return [s]
    w = s.split(' '); k = min(range(1, len(w)), key=lambda k: abs(len(' '.join(w[:k])) - len(' '.join(w[k:]))))
    return [' '.join(w[:k]), ' '.join(w[k:])]


def subtitle(img, s, color, y=1325):
    for i, ln in enumerate(lines_of(s)): draw_line(img, ln, color, y + i * 80)


def title_card(img):   # same layer as the film (tools/post_film.py)
    import post_film
    L = post_film.title_layer(); img.paste(L, (0, 0), L)


def post(img, street, seed):
    a = np.asarray(img).astype(np.float32); yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    a *= (1 - np.clip((r - 0.62) / 0.38, 0, 1) ** 1.6 * (0.45 if street else 0.30))[..., None]
    a += np.random.default_rng(seed).integers(-6, 7, (H // 2, W // 2)).repeat(2, 0).repeat(2, 1).astype(np.float32)[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def wrap(d, t, f, width):
    out, line = [], ''
    for w_ in t.split(' '):
        if line and d.textlength(line + ' ' + w_, font=f) > width: out.append(line); line = w_
        else: line = (line + ' ' + w_).strip()
    return out + [line]


def main():
    sdir = Path(sys.argv[1]); OUT.mkdir(exist_ok=True)
    meta = json.loads((ENG / 'stills' / 'sb_meta.json').read_text(encoding='utf-8'))
    TL = json.loads((PIECE / 'work' / 'timeline.json').read_text(encoding='utf-8')); T = {s['id']: s for s in TL['shots']}
    cells = []
    for i, m in enumerate(meta):
        sid = m['id']; img = Image.open(sdir / f'f_{(i * 3 + 1) * 30:04d}.png').convert('RGB').resize((W, H), Image.NEAREST)
        img = post(img, sid in STREET, i)
        if T[sid]['t0'] < TITLE_END: title_card(img)
        if m.get('line'): subtitle(img, m['line'], WHITE if m['who'].startswith('VERA') else YELLOW)
        img.save(OUT / f'shot_{sid}.png'); cells.append((m, T[sid], img))
    # contact sheet: 6 x 5, thumb + notes under it
    tw, th, nh, cols = 300, 533, 250, 6; rows = (len(cells) + cols - 1) // cols
    board = Image.new('RGB', (cols * (tw + 16) + 16, 110 + rows * (th + nh + 16)), (16, 16, 20)); d = ImageDraw.Draw(board)
    d.text((16, 18), f'vera-01  EP 1 "THE LAST SLICE"  storyboard v1  -  {TL["dur"]:.1f} s, {len(cells)} shots, mean {TL["dur"] / len(cells):.2f} s/shot  -  white = VERA, yellow = THEO (test voices)', font=font(30), fill=(240, 240, 240))
    d.text((16, 62), 'Engine stills at final framing (upnext-01 engine: unlit chars, face cells, lens 0.016, bloom, DOF on 50 mm CUs). Mosaic transitions at 02, 14, 21. Chars step at 15 fps in the film (afps=15).', font=font(20, b'Regular'), fill=(170, 170, 180))
    fb, fs = font(24), font(18, b'Regular')
    for k, (m, t, img) in enumerate(cells):
        x, y = 16 + (k % cols) * (tw + 16), 110 + (k // cols) * (th + nh + 16)
        board.paste(img.resize((tw, th), Image.LANCZOS), (x, y))
        yy = y + th + 8; d.text((x, yy), f'#{m["id"]}  {t["t0"]:.1f}-{t["t1"]:.1f} s ({t["t1"] - t["t0"]:.1f})', font=fb, fill=(255, 220, 120)); yy += 32
        col = (255, 255, 255) if m['who'].startswith('VERA') else (243, 223, 106) if m['who'].startswith('THEO') else (170, 170, 170)
        for ln in wrap(d, (f'{m["who"]}: "{m["line"]}"' if m.get('line') else '(no line)'), fs, tw)[:3]: d.text((x, yy), ln, font=fs, fill=col); yy += 22
        for lab, val in (('clip', m['clip']), ('face', m['face']), ('cam', m.get('lens', ''))):
            for ln in wrap(d, f'{lab}: {val}', fs, tw)[:3]: d.text((x, yy), ln, font=fs, fill=(200, 200, 205)); yy += 22
    board.save(OUT / 'board.png'); print('board', board.size, len(cells), 'shots')
    if '--set' in sys.argv:   # cafe set stills
        sd = Path(sys.argv[sys.argv.index('--set') + 1]); fs_ = sorted(sd.glob('f_*.png')); names = ['set_wide', 'set_window', 'set_counter', 'set_street']
        sheet = Image.new('RGB', (len(fs_) * 540 + (len(fs_) + 1) * 12, 960 + 24), (16, 16, 20))
        for j, f in enumerate(fs_):
            im = post(Image.open(f).convert('RGB').resize((W, H), Image.NEAREST), names[j] == 'set_street', 100 + j); im.save(OUT / f'{names[j]}.png')
            sheet.paste(im.resize((540, 960), Image.LANCZOS), (12 + j * 552, 12))
        sheet.save(OUT / 'set.png'); print('set', len(fs_))


if __name__ == '__main__':
    main()

"""upnext-01 storyboard post: UpNext subtitle (Pixelify Sans Bold 66 px, x0.84 wide, -1 tracking, 6 px black outline + hard
(4,4) shadow, line 1 centred on y=1325, white = girl / #F3DF6A = Pip), vignette, grain and the rounded black frame on every
engine still, then ref|ours pairs and the contact sheet board.png.
usage: python tools/compose.py <stills dir> [board name]   (reads <engine>/stills/sb_meta.json, writes storyboard/)
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PIECE = Path(__file__).resolve().parents[1]
ENG = PIECE / 'engine'
OUT = PIECE / 'storyboard'
FONT = str(ENG / 'fonts' / 'PixelifySans.ttf')
W, H = 1080, 1920
WHITE, YELLOW, BLACK = (255, 255, 255), (0xF3, 0xDF, 0x6A), (0x0A, 0x0A, 0x10)
NIGHT = {'01', '02', '03', '12', '13', '14'}


def font(size, weight=b'Bold'):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_name(weight)
    except Exception:
        pass
    return f


def text_mask(s, size=66, squeeze=0.84, track=-1):
    f = font(size)
    adv = [f.getlength(c) + track for c in s]
    w = int(sum(adv)) + 20
    m = Image.new('L', (w, size * 2), 0)
    d = ImageDraw.Draw(m)
    x = 10
    for c, a in zip(s, adv):
        d.text((x, size // 2), c, font=f, fill=255)
        x += a
    m = m.point(lambda v: 255 if v > 120 else 0)          # hard 1-bit glyphs
    bb = m.getbbox()
    m = m.crop((bb[0], 0, bb[2], m.height))
    return m.resize((max(1, int(m.width * squeeze)), m.height), Image.NEAREST)


def subtitle(img, s, color, y=1325):
    lines = [s]
    if len(s) > 28:                                       # two balanced lines
        words = s.split(' ')
        best = min(range(1, len(words)), key=lambda k: abs(len(' '.join(words[:k])) - len(' '.join(words[k:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    for i, ln in enumerate(lines):
        m = text_mask(ln)
        out = m.filter(ImageFilter.MaxFilter(7))          # 3 px outward = 6 px total outline
        cx, cy = W // 2, y + i * 80
        x0, y0 = cx - m.width // 2, cy - m.height // 2
        blk = Image.new('RGB', m.size, BLACK)
        img.paste(blk, (x0 + 4, y0 + 4), out)              # hard shadow
        img.paste(blk, (x0, y0), out)
        img.paste(Image.new('RGB', m.size, color), (x0, y0), m)


def post(img, night, seed):
    a = np.asarray(img).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    k = np.clip((r - 0.62) / 0.38, 0, 1) ** 1.6 * (0.45 if night else 0.30)
    a *= (1 - k)[..., None]
    rng = np.random.default_rng(seed)
    g = rng.integers(-6, 7, (H // 2, W // 2)).repeat(2, 0).repeat(2, 1).astype(np.float32)
    a += g[..., None]
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle((14, 28, W - 15, H - 29), radius=32, fill=255)
    frame = Image.new('RGB', (W, H), (0, 0, 0))
    frame.paste(img, (0, 0), mask)
    return frame


def main():
    sdir = Path(sys.argv[1])
    meta = json.loads((ENG / 'stills' / 'sb_meta.json').read_text(encoding='utf-8'))
    OUT.mkdir(exist_ok=True)
    pairs = []
    for i, m in enumerate(meta):
        sid = m['id']
        img = Image.open(sdir / f'f_{(i * 3 + 1) * 30:04d}.png').convert('RGB').resize((W, H), Image.NEAREST)
        img = post(img, sid in NIGHT, i)
        if m.get('line'):
            spk = m['who'].split('/')[0].strip().split(' ')[0]
            subtitle(img, m['line'].replace('...', '…'), WHITE if spk == 'GIRL' else YELLOW)
        img.save(OUT / f'shot_{sid}.png')
        ref = Image.open(OUT / 'ref' / f'r_{sid}.png').convert('RGB').resize((W, H))
        pair = Image.new('RGB', (W * 2 + 40, H + 120), (18, 18, 22))
        pair.paste(ref, (0, 120)); pair.paste(img, (W + 40, 120))
        d = ImageDraw.Draw(pair); f = font(48)
        d.text((20, 30), f'REF  {m["t"][0]:.1f}-{m["t"][1]:.1f} s', font=f, fill=(200, 200, 200))
        d.text((W + 60, 30), f'OURS  shot {sid}', font=f, fill=(255, 220, 120))
        pair.save(OUT / f'pair_{sid}.png')
        pairs.append((m, ref, img))
    # board: 2 entries per row, each = ref | ours | notes
    tw, th, nw = 240, 427, 470
    ew = tw * 2 + nw + 20
    rows = (len(pairs) + 1) // 2
    board = Image.new('RGB', (ew * 2 + 20, 90 + rows * (th + 20)), (16, 16, 20))
    d = ImageDraw.Draw(board)
    d.text((20, 20), 'upnext-01 storyboard v2  -  remake of @jongmin.design Dd2YemoPJ9-  (ref | ours)  -  Ashley (tights) + Pip  -  72.7 s, 23 shots / 24 stills', font=font(30), fill=(240, 240, 240))
    fs, fb = font(20, b'Regular'), font(24)
    for k, (m, ref, img) in enumerate(pairs):
        x, y = (k % 2) * (ew + 20), 90 + (k // 2) * (th + 20)
        board.paste(ref.resize((tw, th)), (x + 10, y)); board.paste(img.resize((tw, th)), (x + 10 + tw + 6, y))
        tx = x + 10 + 2 * tw + 20
        d.text((tx, y), f'#{m["id"]}   {m["t"][0]:.1f}-{m["t"][1]:.1f} s  ({m["t"][1] - m["t"][0]:.1f} s)', font=fb, fill=(255, 220, 120))
        txt = []
        if m.get('line'):
            txt.append(f'{m["who"]}: "{m["line"]}"')
        if m.get('line2'):
            txt.append(m['line2'])
        txt += [f'clip: {m["clip"]}', f'face: {m["face"]}']
        if m.get('note'):
            txt.append('note: ' + m['note'])
        yy = y + 36
        for t in txt:
            words, line = t.split(' '), ''
            for w_ in words:
                if d.textlength(line + ' ' + w_, font=fs) > nw - 10:
                    d.text((tx, yy), line.strip(), font=fs, fill=(225, 225, 225)); yy += 25; line = ''
                line += ' ' + w_
            d.text((tx, yy), line.strip(), font=fs, fill=(225, 225, 225)); yy += 31
    board.save(OUT / (sys.argv[2] if len(sys.argv) > 2 else 'board.png'))
    print('board', board.size, len(pairs), 'stills')


if __name__ == '__main__':
    main()

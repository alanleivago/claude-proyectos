"""vera-01 film post: engine intermediate (render_film_up.mjs "film=1") -> UpNext subtitle cards (typewriter, Pixelify Sans Bold 66 px x0.84,
4 px outline + (4,4) hard shadow + glow, line 1 at y 1325; white = Vera, #F3DF6A = Theo), the episode title card on top (0-3.4 s,
"EPISODE 1" coral + "THE LAST SLICE" white), vignette (interior -30 %, street -45 %), animated grain. No rounded frame (the ref has none).
Muxed with the mix -> share encode (libx264 CRF 24 slow, yuv420p, AAC 192k, +faststart).
usage: python tools/post_film.py work/engine_v1.mkv audio/mix_v1.wav render/vera01_v1.mp4"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

PIECE = Path(__file__).resolve().parents[1]
ENG = PIECE / 'engine'
FONT = str(ENG / 'fonts' / 'PixelifySans.ttf')
W, H, FPS = 1080, 1920, 30
WHITE, YELLOW, BLACK, CORAL = (255, 255, 255), (0xF3, 0xDF, 0x6A), (0x0A, 0x0A, 0x10), (0xF0, 0x8A, 0xA0)
TL = json.loads((ENG / 'film_timeline.json').read_text(encoding='utf-8'))
NIGHT = {'29'}   # the street tail gets the stronger vignette
TITLE_END = 3.4
_f = ImageFont.truetype(FONT, 66)
try: _f.set_variation_by_name(b'Bold')
except Exception: pass


def lines_of(s):
    if len(s) <= 28: return [s]
    w = s.split(' '); k = min(range(1, len(w)), key=lambda k: abs(len(' '.join(w[:k])) - len(' '.join(w[k:]))))
    return [' '.join(w[:k]), ' '.join(w[k:])]


_cache = {}
GLOW = 0.75   # glow alpha scale (v2: the ref subtitles carry a faint light halo)
def line_mask(full, n, squeeze=0.84, track=-1):
    """mask of the first n characters of `full`, laid out exactly where they sit in the full line (text grows, never moves)"""
    key = (full, n)
    if key in _cache: return _cache[key]
    adv = [_f.getlength(c) + track for c in full]; w = int(sum(adv)) + 20
    def draw(k):
        m = Image.new('L', (w, 132), 0); d = ImageDraw.Draw(m); x = 10
        for c, a in zip(full[:k], adv[:k]): d.text((x, 33), c, font=_f, fill=255); x += a
        return m.point(lambda v: 255 if v > 120 else 0)
    full_m = draw(len(full)); bb = full_m.getbbox()
    m = draw(n).crop((bb[0], 0, bb[2], 132)); m = m.resize((max(1, int(m.width * squeeze)), 132), Image.NEAREST)
    o = m.filter(ImageFilter.MaxFilter(9))   # v2: 4 px outline (the ref's dark rim reaches ~7-10 px with the shadow)
    pad = Image.new('L', (o.width + 60, o.height + 60), 0); pad.paste(o, (30, 30))
    glow = pad.filter(ImageFilter.GaussianBlur(11)).point(lambda v: int(v * GLOW))   # soft light halo (measured on the ref: ~+2/255 at 14-30 px)
    out = (m, o, glow); _cache[key] = out; return out


def card_layer(card, T):
    """RGBA overlay (as a PIL image + paste box) of a card at time T, or None"""
    if not (card['start'] <= T < card['end']): return None
    text = card['text']; ls = lines_of(text); total = sum(len(l) for l in ls)
    k = clampi(int(round((T - card['start']) / max(0.05, card['typed'] - card['start']) * total)), 1, total)
    col = WHITE if card['spk'] == 'V' else YELLOW
    layer = Image.new('RGBA', (W, 380), (0, 0, 0, 0)); used = 0
    for i, l in enumerate(ls):
        n = min(len(l), max(0, k - used)); used += len(l)
        if n <= 0: continue
        m, o, gl = line_mask(l, n)
        fm = line_mask(l, len(l))[0]; x0 = W // 2 - fm.width // 2; y0 = 100 + i * 80 - 66
        layer.paste(Image.new('RGBA', gl.size, (255, 255, 250, 255)), (x0 - 30, y0 - 30), gl)
        blk = Image.new('RGBA', m.size, BLACK + (255,))
        layer.paste(blk, (x0 + 4, y0 + 4), o); layer.paste(blk, (x0, y0), o); layer.paste(Image.new('RGBA', m.size, col + (255,)), (x0, y0), m)
    return layer


def clampi(v, a, b): return max(a, min(b, v))


TITLE_FONT = str(PIECE.parents[1] / 'fonts' / 'thatthatnewpixelfamilytest-square.otf')   # v2 (user): the episode title in this pixel serif


def title_mask():
    """'The Last Slice' (v3: Title Case, bigger) at the font's native 16 px grid, tight tracking (-1 px between letters, word spaces kept), x8 nearest"""
    f = ImageFont.truetype(TITLE_FONT, 16); s = 'The Last Slice'
    adv = [f.getlength(c) + (0 if c == ' ' or (i + 1 < len(s) and s[i + 1] == ' ') else -1) for i, c in enumerate(s)]
    m = Image.new('L', (int(sum(adv)) + 12, 40), 0); d = ImageDraw.Draw(m); x = 4
    for c, a_ in zip(s, adv): d.text((x, 8), c, font=f, fill=255); x += a_
    m = m.point(lambda v: 255 if v > 110 else 0); m = m.crop(m.getbbox())
    return m.resize((m.width * 8, m.height * 8), Image.NEAREST)


def pixelify_mask(text, size):
    f = ImageFont.truetype(FONT, size)
    try: f.set_variation_by_name(b'Bold')
    except Exception: pass
    adv = [f.getlength(c) - 1 for c in text]; w = int(sum(adv)) + 20
    m = Image.new('L', (w, size * 2), 0); d = ImageDraw.Draw(m); x = 10
    for c, a_ in zip(text, adv): d.text((x, size // 2), c, font=f, fill=255); x += a_
    m = m.point(lambda v: 255 if v > 120 else 0); bb = m.getbbox(); m = m.crop((bb[0], 0, bb[2], m.height))
    return m.resize((max(1, int(m.width * 0.84)), m.height), Image.NEAREST)


def title_layer():
    L = Image.new('RGBA', (W, 560), (0, 0, 0, 0))
    for m, col, cy, ow in ((pixelify_mask('EPISODE 1', 48), CORAL, 300, 9), (title_mask(), WHITE, 405, 15)):
        o = m.filter(ImageFilter.MaxFilter(ow)); x0, y0 = W // 2 - m.width // 2, cy - m.height // 2
        pad = Image.new('L', (o.width + 60, o.height + 60), 0); pad.paste(o, (30, 30)); gl = pad.filter(ImageFilter.GaussianBlur(11)).point(lambda v: int(v * GLOW))
        L.paste(Image.new('RGBA', gl.size, (255, 255, 250, 255)), (x0 - 30, y0 - 30), gl)
        blk = Image.new('RGBA', m.size, BLACK + (255,)); L.paste(blk, (x0 + 5, y0 + 5), o); L.paste(blk, (x0, y0), o); L.paste(Image.new('RGBA', m.size, col + (255,)), (x0, y0), m)
    return L


TITLE = None


def shot_at(T):
    s = TL['shots'][0]
    for x in TL['shots']:
        if x['t0'] <= T: s = x
    return s['id']


def main():
    global TITLE
    src, audio, out = sys.argv[1:4]; TITLE = title_layer()
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    vig = np.clip((r - 0.62) / 0.38, 0, 1) ** 1.6
    rng = np.random.default_rng(3); grains = [rng.integers(-6, 7, (H // 2, W // 2)).repeat(2, 0).repeat(2, 1).astype(np.int16) for _ in range(12)]
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE, env={**os.environ})
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-i', audio,
                            '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out], stdin=subprocess.PIPE, env={**os.environ})
    f = 0; nb = W * H * 3
    while True:
        buf = dec.stdout.read(nb)
        if len(buf) < nb: break
        T = f / FPS; sid = shot_at(T)
        k = 0.45 if sid in NIGHT else 0.30
        a = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        a *= (1 - vig * k)[..., None]; a += grains[(f * 7) % 12][..., None]
        img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        for c in TL['cards']:
            L = card_layer(c, T)
            if L is not None: img.paste(L, (0, 1325 - 100), L)
        if T < TITLE_END: img.paste(TITLE, (0, 0), TITLE)
        enc.stdin.write(np.asarray(img, np.uint8).tobytes()); f += 1
        if f % 300 == 0: print('post', f, flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    print('done', out, f, 'frames')


if __name__ == '__main__':
    main()

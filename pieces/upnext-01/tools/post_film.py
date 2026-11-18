"""upnext-01 film post: engine intermediate (render_film_up.mjs) -> UpNext subtitles (typewriter, Pixelify Sans Bold 66 px x0.84,
6 px outline + (4,4) hard shadow, line 1 at y 1325; white = Ashley, #F3DF6A = mentor), vignette (night -45 % / day -30 %),
animated grain, rounded black frame; muxed with the mix -> share encode (libx264 CRF 24 slow, yuv420p, AAC 192k, +faststart).
usage: python tools/post_film.py work/engine_<m>.mkv audio/mix_<m>.wav render/upnext01_<m>.mp4"""
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
WHITE, YELLOW, BLACK = (255, 255, 255), (0xF3, 0xDF, 0x6A), (0x0A, 0x0A, 0x10)
TL = json.loads((ENG / 'film_timeline.json').read_text(encoding='utf-8'))
NIGHT = {'01', '02', '03', '12', '13', '14'}
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
    col = WHITE if card['spk'] == 'G' else YELLOW
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


def shot_at(T):
    s = TL['shots'][0]
    for x in TL['shots']:
        if x['t0'] <= T: s = x
    return s['id']


def main():
    src, audio, out = sys.argv[1:4]
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / np.sqrt(2)
    vig = np.clip((r - 0.62) / 0.38, 0, 1) ** 1.6
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle((14, 28, W - 15, H - 29), radius=32, fill=255)
    maskf = (np.asarray(mask, np.float32) / 255)[..., None]
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
        k = 0.45 if sid in NIGHT else (lambda lt: 0.45 + (0.30 - 0.45) * min(1, max(0, lt / 1.5)))(T - 9.3) if sid == '04' else 0.30
        a = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        a *= (1 - vig * k)[..., None]; a += grains[(f * 7) % 12][..., None]
        img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        for c in TL['cards']:
            L = card_layer(c, T)
            if L is not None: img.paste(L, (0, 1325 - 100), L)
        a = np.asarray(img, np.float32) * maskf
        enc.stdin.write(a.astype(np.uint8).tobytes()); f += 1
        if f % 300 == 0: print('post', f, flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    print('done', out, f, 'frames')


if __name__ == '__main__':
    main()

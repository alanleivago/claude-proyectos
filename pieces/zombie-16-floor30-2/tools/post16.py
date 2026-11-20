"""ep16 post (same as pieces/vera-02/tools/post_film.py, minus its subtitles/title cards): vignette (interior -30 %, exterior/night -45 %)
+ animated 2x2 grain (+-6, 12 patterns), then the share encode (libx264 CRF 24 slow, yuv420p, AAC 192k, +faststart).
These two effects are POST-ONLY: they do not show in the live preview.
usage: python tools/post16.py renders/raw.mp4 audio/mix16.wav "renders/<title>.mp4"
(raw.mp4 = node engine/render_film.mjs final renders/raw.mp4 audio/mix16.wav)"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np

PIECE = Path(__file__).resolve().parents[1]
W, H, FPS = 1080, 1920, 30
CUE = json.loads((PIECE / 'engine' / 'cues.json').read_text(encoding='utf-8'))
NIGHT = {'01_crane'}   # exterior: stronger vignette (Vera: the street tail)


def shot_at(T):
    sid = '01_crane'
    for k, v in sorted(CUE['T'].items(), key=lambda kv: kv[1]):
        if v <= T: sid = k
    return sid


def main():
    src, audio, out = sys.argv[1:4]
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
        k = 0.45 if shot_at(f / FPS) in NIGHT else 0.30
        a = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32)
        a *= (1 - vig * k)[..., None]; a += grains[(f * 7) % 12][..., None]
        enc.stdin.write(np.clip(a, 0, 255).astype(np.uint8).tobytes()); f += 1
        if f % 300 == 0: print('post', f, flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    print('done', out, f, 'frames')


if __name__ == '__main__':
    main()

"""vera-01: find set flicker in a render: per-pixel 'blink' = a pixel that changes at frame f and changes BACK at f+1 (A-B-A),
counted per frame at 270x480, away from cuts. Reports frames with many blinking pixels and saves crops of where they are.
usage: python tools/flicker_scan.py work/engine_v1.mkv [out_dir]"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image
PIECE = Path(__file__).resolve().parents[1]
src = sys.argv[1]; out = Path(sys.argv[2] if len(sys.argv) > 2 else PIECE / 'work' / 'flicker'); out.mkdir(parents=True, exist_ok=True)
TL = json.loads((PIECE / 'engine' / 'film_timeline.json').read_text(encoding='utf-8')); cuts = [round(s['t0'] * 30) for s in TL['shots']]
W, H = 270, 480
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], stdout=subprocess.PIPE)
fr = []
while True:
    b = p.stdout.read(W * H)
    if len(b) < W * H: break
    fr.append(np.frombuffer(b, np.uint8).astype(np.int16))
fr = np.stack(fr).reshape(-1, H, W); n = len(fr); res = []
for f in range(1, n - 1):
    if any(abs(f - c) <= 2 for c in cuts): continue
    d1 = fr[f] - fr[f - 1]; d2 = fr[f + 1] - fr[f]; back = np.abs(fr[f + 1] - fr[f - 1])
    blink = (np.abs(d1) > 18) & (np.abs(d2) > 18) & (np.sign(d1) != np.sign(d2)) & (back < 8)
    res.append((f, int(blink.sum()), blink))
cnt = np.array([r[1] for r in res]); thr = max(25, np.percentile(cnt, 99))
hits = [(f, c) for f, c, _ in res if c >= thr]
print('frames', n, 'threshold', thr, 'hits', len(hits))
shot_of = lambda f: max((s for s in TL['shots'] if s['t0'] * 30 <= f), key=lambda s: s['t0'])['id']
for f, c, bl in res:
    if c >= thr:
        ys, xs = np.where(bl); print(f'f{f} t={f / 30:.2f}s shot {shot_of(f)} blink px {c} bbox x{xs.min()}-{xs.max()} y{ys.min()}-{ys.max()}')
        im = np.stack([fr[f]] * 3, -1).astype(np.uint8); im[bl] = [255, 0, 255]; Image.fromarray(im).resize((W * 2, H * 2), Image.NEAREST).save(out / f'f{f:04d}.png')
json.dump([[f, c] for f, c, _ in res], open(out / 'blink.json', 'w'))

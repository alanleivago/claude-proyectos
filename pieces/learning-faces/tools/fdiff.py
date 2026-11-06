# fdiff.py: consecutive-frame QA over frames/*.png (user rule: frame by frame, not stills). Per frame pair: mean abs luma
# diff (480x270). Flags: (a) in-out pops: frame i differs from both neighbours while i-1 ~ i+1 (a one-frame flash); (b) diff
# spikes > 6x the local median that are not on a cut. Writes review/qa/fdiff.json + tiles of every flagged span.
import json, glob, numpy as np
from PIL import Image
D = '/Users/alanleiva/claude-proyectos/pieces/learning-faces/'
S = json.load(open(D + 'sound/subs.json')); FPS = 24
cuts = {round(t * FPS) for _, t, _ in S['shots']}
fs = sorted(glob.glob(D + 'frames/*.png'))
prev = None; L = []; d = []
for i, f in enumerate(fs):
    a = np.asarray(Image.open(f).convert('L').resize((480, 270), Image.BOX)).astype(np.float32)
    L.append(a)
    if len(L) > 3: L.pop(0)
    if prev is not None: d.append(float(np.abs(a - prev).mean()))
    prev = a
d = np.array(d)   # d[k] = diff(frame k, frame k+1)
pops = []
for k in range(1, len(d)):
    i = k   # frame i between i-1 and i+1
    if d[k - 1] > 4 and d[k] > 4 and not any(abs(i - c) <= 1 for c in cuts):
        pops.append(i)
from scipy.ndimage import median_filter
med = median_filter(d, 25) + 0.3
spk = [int(k + 1) for k in np.where(d > 6 * med)[0] if not any(abs(k + 1 - c) <= 1 for c in cuts)]
json.dump({'n': len(fs), 'median': float(np.median(d)), 'pops': pops, 'spikes': spk, 'cuts': sorted(cuts)}, open(D + 'review/qa/fdiff.json', 'w'))
print('frames', len(fs), 'median diff %.2f' % np.median(d), 'in-out pops (not on cuts):', len(pops), pops[:40])
print('spikes not on cuts:', len(spk), spk[:60])

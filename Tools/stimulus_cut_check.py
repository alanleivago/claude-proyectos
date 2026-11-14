"""Stimulus cut check: python tools/stimulus_cut_check.py <piece>/index.html <piece>/prep/cuts.json
Lists zoom-move start frames, b-roll edges and any two events (cut / zoom start / b-roll edge) closer than 8 frames.
A zoom start exactly 1 frame after a cut = starts ON the cut (ok)."""
import re, json, sys
html = open(sys.argv[1], encoding="utf-8").read(); cuts = json.load(open(sys.argv[2]))["frames"]
fps = 24000 / 1001
sets = [(float(t), float(v)) for v, t in re.findall(r'tl\.set\("#stage-v, #stage-c",\{scale:([0-9.]+)\},([0-9.]+)\)', html)]
vals = {}; cur = None; j = 0
N = int(float(re.search(r'data-composition-id="main" data-start="0" data-duration="([0-9.]+)"', html).group(1)) * fps)
sc = []
for n in range(N):
    t = n / fps
    while j < len(sets) and sets[j][0] <= t + 1e-4: cur = sets[j][1]; j += 1
    sc.append(cur)
mv = [n for n in range(1, N) if sc[n] and sc[n - 1] and abs(sc[n] / sc[n - 1] - 1) > 0.0005]
ab = [n for n in mv if n - 1 not in mv]   # move starts (first frame the framing changes)
br = []
for m in re.finditer(r'id="broll\d+" class="clip" data-start="([0-9.]+)" data-duration="([0-9.]+)"', html):
    s0, d = float(m.group(1)), float(m.group(2)); br += [round(s0 * fps + 0.05), round((s0 + d) * fps + 0.05)]
ev = sorted(set([("cut", c) for c in cuts] + [("zoom", a) for a in ab] + [("broll", b) for b in br]), key=lambda x: x[1])
bad = [(a, b) for a, b in zip(ev, ev[1:]) if 0 < b[1] - a[1] < 8]
print("zoom move start frames:", ab)
print("broll edges:", br)
print("events closer than 8 frames:", [(a, b) for a, b in bad])

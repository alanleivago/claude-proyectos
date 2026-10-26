# combine.py: sum the mix.py stems (music, amb, sfx; pre-master) + the synth layer, master to -14 LUFS with the
# real-sound master.py, write audio/final.wav (48 kHz stereo, exactly 510.0 s) and gain-matched stems in audio/stems/,
# then print the QA numbers the brief asks for (LUFS, TP, loudest 100 ms, near-silence before the hit).
import json, os, subprocess, sys
import numpy as np, soundfile as sf

SR = 48000; N = int(510.0 * SR)
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = os.path.expanduser("~/tools/earshot/.venv/bin/python")
MASTER = os.path.expanduser("~/.claude/skills/real-sound/scripts/master.py")
SYNTH_DB = json.load(open(os.path.join(A, "design", "synth_bus.json")))["gain_db"]

def rd(p):
    x, sr = sf.read(p, dtype="float64", always_2d=True); assert sr == SR, p
    if x.shape[1] == 1: x = np.repeat(x, 2, 1)
    x = x[:N]; return np.pad(x, ((0, N - len(x)), (0, 0)))

st = {k: rd(os.path.join(A, "work", "mix", "stems", f"{k}.wav")) for k in ("music", "amb", "sfx")}
st["synth"] = rd(os.path.join(A, "work", "synth.wav")) * 10 ** (SYNTH_DB / 20)
# the barrel's tube (tools/tube.py: real wave recordings through a code-made tube impulse response) joins the ambience
st["amb"] = st["amb"] + rd(os.path.join(A, "work", "tube.wav"))
# the airliner: a dynamic dip of the ambience (wave roar, wind) at 1-6 kHz under the jet, 218.0-229.5, -7 dB at full depth
from scipy import signal as _sg0
j0, j1 = int(217.5 * SR), int(230.5 * SR)
band = _sg0.sosfiltfilt(_sg0.butter(2, [1000, 6000], "band", fs=SR, output="sos"), st["amb"][j0:j1], axis=0)
ej = np.interp(np.arange(j1 - j0) / SR + 217.5, [217.5, 219.0, 228.0, 230.5], [0, 1, 1, 0])[:, None]
st["amb"][j0:j1] -= band * ej * (1 - 10 ** (-7 / 20))
pre = sum(st.values())
# the Moon hit is dense on purpose so the master's limiter does not flatten it below the beds: over 467.95-471.0 the sum
# is split at 140 Hz (zero-phase, exact reconstruction); the band above gets +5 dB drive into a soft clipper
# (c * tanh(x / c), c = -6 dBFS), the band below a gentle clip at -10 dBFS (a clipped sub turns square and makes the
# true-peak limiter duck the hit). The difference is carried by the sfx stem, so the stems still sum to the master input.
from scipy import signal as _sg
HC, HL = 10 ** (-6 / 20), 10 ** (-10 / 20); i0, i1 = int(467.95 * SR), int(471.0 * SR)
seg = pre[i0:i1]; tt_ = np.arange(i1 - i0) / SR + 467.95
lo = _sg.sosfiltfilt(_sg.butter(4, 140, "low", fs=SR, output="sos"), seg, axis=0); hi = seg - lo
drv = 10 ** (np.interp(tt_, [467.95, 469.3, 471.0], [5.0, 5.0, 0.0]) / 20)[:, None]
new = HC * np.tanh(hi * drv / HC) + HL * np.tanh(lo / HL)
bl = np.ones(i1 - i0); r_ = int(0.05 * SR); bl[-r_:] = np.linspace(1, 0, r_)
new = seg + (new - seg) * bl[:, None]
st["sfx"][i0:i1] += new - seg
pre = sum(st.values())
pp =os.path.join(A, "work", "premaster.wav"); sf.write(pp, pre.astype(np.float32), SR, subtype="FLOAT")
fin = os.path.join(A, "final.wav")
r = subprocess.run([PY, "-I", MASTER, pp, fin, "--lufs", "-14", "--ceiling", "0.77", "--max-tp", "-1.5", "--no-glue", "--no-comp",
                    "--json", os.path.join(A, "work", "master.json")], capture_output=True, text=True)
print(r.stdout[-1500:], r.stderr[-1500:])
y, _ = sf.read(fin, dtype="float64", always_2d=True)
assert len(y) == N, (len(y), N)
# the master's static gain: median ratio over 1 s windows where the limiter is idle (pre and post nearly linear)
w = SR; g = []
for i in range(0, N - w, w):
    a = np.sqrt(np.mean(pre[i:i + w] ** 2)); b = np.sqrt(np.mean(y[i:i + w] ** 2))
    if a > 1e-4: g.append(b / a)
gain = float(np.median(g))
os.makedirs(os.path.join(A, "stems"), exist_ok=True)
names = {"music": "music", "amb": "ambience", "sfx": "sfx", "synth": "synth"}
for k, v in st.items():
    sf.write(os.path.join(A, "stems", f"{names[k]}.wav"), (v * gain).astype(np.float32), SR, subtype="FLOAT")
# QA
def rms_db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
hop = int(0.01 * SR); win = int(0.1 * SR)
p = np.cumsum(np.r_[0, (y ** 2).mean(1)])
idx = np.arange(0, N - win, hop); L = 10 * np.log10((p[idx + win] - p[idx]) / win + 1e-15)
top = idx[np.argmax(L)] / SR
mask = np.abs(idx / SR - top) > 3.0
second = idx[mask][np.argmax(L[mask])] / SR
gap = y[int(467.3 * SR):int(467.97 * SR)]
q = {"gain_db": round(20 * np.log10(gain), 2), "loudest_100ms_t": round(top, 2), "loudest_100ms_db": round(float(L.max()), 2),
     "next_loudest_100ms_t": round(second, 2), "next_loudest_100ms_db": round(float(L[mask].max()), 2),
     "gap_467.30-467.97_rms_dbfs": round(rms_db(gap), 1), "gap_peak_dbfs": round(20 * np.log10(np.abs(gap).max() + 1e-12), 1),
     "teaser_6.2-7.0_rms_dbfs": round(rms_db(y[int(6.2 * SR):int(7.0 * SR)]), 1), "samples": len(y)}
order = np.argsort(-L); picked = []
for i in order:
    t = idx[i] / SR
    if all(abs(t - u) > 3 for u, _ in picked): picked.append((round(t, 2), round(float(L[i]), 2)))
    if len(picked) >= 8: break
q["top_100ms"] = picked
sys.path.insert(0, os.path.dirname(MASTER)); from master import blocks
tm, LM = blocks(y, 0.4, 0.05); o = np.argsort(-LM); pk = []
for i in o:
    if all(abs(tm[i] - u) > 3 for u, _ in pk): pk.append((round(float(tm[i]), 2), round(float(LM[i]), 2)))
    if len(pk) >= 6: break
q["top_momentary_lufs"] = pk
print(json.dumps(q, indent=1)); json.dump(q, open(os.path.join(A, "work", "qa_combine.json"), "w"), indent=1)

# combine.py: sum the mix.py stems (music, amb, sfx; pre-master) + the synth layer, master to -14 LUFS with the real-sound
# master.py, write audio/final.wav (48 kHz stereo, exactly 510.0 s) and gain-matched stems in audio/stems/, then print the QA
# numbers the brief asks for (LUFS, TP, silence 6.2-7.0, near-silence 466.0-466.7 before the edge tick, the tick itself).
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
# hard silence where the picture is black (6.2-7.0) and a clean near-silence before the edge (466.0-466.68): gate every stem
def gate(t0, t1, r=0.01):
    g = np.ones(N); i0, i1 = int(t0 * SR), int(t1 * SR); n = int(r * SR)
    g[i0:i1] = 0; g[i0 - n:i0] = np.linspace(1, 0, n); g[i1:i1 + n] = np.linspace(0, 1, n); return g[:, None]
G = gate(6.2, 7.0) * gate(466.02, 466.68, 0.02)
for k in st: st[k] = st[k] * G
pre = sum(st.values())
pp = os.path.join(A, "work", "premaster.wav"); sf.write(pp, pre.astype(np.float32), SR, subtype="FLOAT")
fin = os.path.join(A, "final.wav")
r = subprocess.run([PY, "-I", MASTER, pp, fin, "--lufs", "-14", "--ceiling", "0.77", "--max-tp", "-1.5", "--no-glue",
                    "--json", os.path.join(A, "work", "master.json")], capture_output=True, text=True)
print(r.stdout[-1200:], r.stderr[-1200:])
y, _ = sf.read(fin, dtype="float64", always_2d=True)
if len(y) != N: y = np.pad(y[:N], ((0, max(0, N - len(y))), (0, 0))); sf.write(fin, y.astype(np.float32), SR, subtype="PCM_24")
w = SR; g = []
for i in range(0, N - w, w):
    a = np.sqrt(np.mean(pre[i:i + w] ** 2)); b = np.sqrt(np.mean(y[i:i + w] ** 2))
    if a > 1e-4: g.append(b / a)
gain = float(np.median(g))
os.makedirs(os.path.join(A, "stems"), exist_ok=True)
for k, nm in (("music", "music"), ("amb", "ambience"), ("sfx", "sfx"), ("synth", "synth")):
    sf.write(os.path.join(A, "stems", f"{nm}.wav"), (st[k] * gain).astype(np.float32), SR, subtype="FLOAT")
def rms_db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)), 1)
def pk_db(x): return round(float(20 * np.log10(np.abs(x).max() + 1e-12)), 1)
tick = y[int(466.69 * SR):int(466.79 * SR)]
q = {"samples": len(y), "seconds": len(y) / SR, "gain_db": round(20 * np.log10(gain), 2),
     "silence_6.2-7.0_rms": rms_db(y[int(6.2 * SR):int(7.0 * SR)]),
     "gap_466.0-466.7_rms": rms_db(y[int(466.0 * SR):int(466.69 * SR)]), "gap_peak": pk_db(y[int(466.0 * SR):int(466.69 * SR)]),
     "tick_peak": pk_db(tick), "tick_rms_100ms": rms_db(tick)}
sys.path.insert(0, os.path.dirname(MASTER)); from master import blocks
tm, LM = blocks(y, 0.4, 0.05); o = np.argsort(-LM); pk = []
for i in o:
    if all(abs(tm[i] - u) > 3 for u, _ in pk): pk.append((round(float(tm[i]), 2), round(float(LM[i]), 2)))
    if len(pk) >= 8: break
q["top_momentary_lufs"] = pk
print(json.dumps(q, indent=1)); json.dump(q, open(os.path.join(A, "work", "qa_combine.json"), "w"), indent=1)

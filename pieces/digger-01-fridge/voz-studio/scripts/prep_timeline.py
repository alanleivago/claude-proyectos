# words.json (whisper, aligned) -> engine/timeline_<voice>.json: word starts/ends refined on the audio envelope
# (whisper glues a word after a pause to the end of the previous one), caption text, mouth track at 15 fps.
import sys, json, re, numpy as np, soundfile as sf
V = sys.argv[1]
HERE = r"F:/Claude Proyectos/pieces/digger-01-fridge"
d = json.load(open(f"{HERE}/voz-studio/v2/{V}_words.json", encoding="utf-8"))
x, sr = sf.read(f"{HERE}/voz-studio/v2/{V}_track.wav"); x = x.mean(1) if x.ndim > 1 else x
H = int(0.01 * sr); env = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)])
db = 20 * np.log10(env + 1e-9)
SIL = -42
def silent(t0, t1): i0, i1 = max(0, int(t0 * 100)), min(len(db), int(t1 * 100)); return db[i0:i1]
W = [list(w) for w in d["words"]]
for i, w in enumerate(W):
    s, e = w[1], w[2]
    # onset: last silent->voiced transition inside [s-0.05, s+0.7] that comes after >=80 ms silence
    i0, i1 = int(max(0, s - 0.05) * 100), int(min(e + 0.1, s + 0.8) * 100)
    run, best = 0, None
    for k in range(i0, min(i1, len(db))):
        if db[k] < SIL: run += 1
        else:
            if run >= 8: best = k
            run = 0
    if best is not None and best / 100 < e - 0.05: w[1] = round(best / 100 - 0.01, 3)
    # offset: first >=80 ms silence that starts inside the word
    k = int(w[1] * 100) + 5; run = 0
    while k < min(len(db), int((e + 0.3) * 100)):
        if db[k] < SIL:
            run += 1
            if run >= 8: w[2] = round((k - run + 1) / 100, 3); break
        else: run = 0
        k += 1
    if i + 1 < len(W): w[2] = min(w[2], W[i + 1][1]) if W[i + 1][1] > w[1] else w[2]
for i in range(1, len(W)):   # keep order
    if W[i][1] < W[i - 1][1] + 0.05: W[i][1] = round(W[i - 1][1] + 0.05, 3)
def cap(t):
    t = t.replace("\u2026", "").replace('"', "").replace(":", "")
    return t if t == "I" else t.lower()
# mouth track at 15 fps: '-' closed, 'A' / 'O' open by the syllable's vowel
def syl(word):
    g = re.findall(r"[aeiouy]+", word.lower()) or ["a"]
    return ["O" if re.search(r"[ou]", v) else "A" for v in g]
N = int(len(x) / sr * 15) + 1; mouth = ["-"] * N
for w in W:
    sy = syl(w[0]); s, e = w[1], max(w[2], w[1] + 0.07)
    for f in range(int(s * 15), int(e * 15) + 1):
        t = (f + 0.5) / 15
        if t < s or t > e + 0.03 or f >= N: continue
        lvl = np.max(silent(f / 15, (f + 1) / 15)) if len(silent(f / 15, (f + 1) / 15)) else -99
        if lvl < -34: continue
        k = min(len(sy) - 1, int((t - s) / (e - s + 1e-6) * len(sy)))
        mouth[f] = sy[k]
out = dict(voice=V, dur=d["dur"], words=[[cap(w[0]), w[1], w[2], w[3], w[0]] for w in W], mouth="".join(mouth))
json.dump(out, open(f"{HERE}/engine/timeline_{V}.json", "w", encoding="utf-8"), ensure_ascii=False)
print(V, out["dur"], len(W), "open steps", sum(c != "-" for c in mouth), "/", N)
for w in W[:14]: print(w)

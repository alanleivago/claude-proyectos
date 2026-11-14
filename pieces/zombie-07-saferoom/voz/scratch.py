# SCRATCH (sin voz: VoiceStudio apagado). Tiempos estimados por silabas para armar el storyboard con el motor real.
# Escribe lines.json y ../engine/timeline.json con el MISMO formato que prep.py + assemble.py; build_cues.py los lee igual.
# Cuando exista la voz real: gen.py -> pick.py -> prep.py -> assemble.py -> build_cues.py (esto se descarta).
import json, re, os, soundfile as sf, numpy as np
H = os.path.dirname(os.path.abspath(__file__))
src = open(f"{H}/prep.py", encoding="utf8").read(); Ltxt = "L = [" + src.split("L = [", 1)[1].split("PAUSE, T0")[0]
ids = lambda *t: ",".join(t); P = {}
exec(Ltxt)
PAUSE, T0, SYL, COMMA, TARGET = 0.3, 0.3, 0.158, 0.2, 57.85
EXTRA = {('06_tap', 0): 0.1, ('12_cta', 0): 0.15}
def syl(w):
    w = w.lower().replace("fema", "fema")
    if re.fullmatch(r"\d+", w): return {"2": 1}.get(w, 2)
    return max(1, len(re.findall(r"[aeiouy]+", re.sub(r"e$", "", w))))
SPOKEN = {"FEMA": "fee-ma", "2": "two"}
x, sr = sf.read(f"{H}/../../zombie-01-door/voz/lines/13_fudge.wav"); x = x if x.ndim == 1 else x.mean(1)
r = np.array([np.sqrt(np.mean(x[i:i + sr // 100] ** 2)) for i in range(0, len(x) - sr // 100, sr // 100)]); nz = np.where(r > r.max() * 10 ** (-45 / 20))[0]
FUDGE = (nz[-1] - nz[0] + 1) / 100
lines, words, t = [], [], T0
for p, (lid, tk, text, gap) in enumerate(L, 1):
    parts = [s.strip() for s in text.split("…")]; starts = []
    for j, part in enumerate(parts):
        starts.append(round(t, 3)); ws = re.findall(r"[\w'’.-]+[,.:?]*", part)
        if tk == "ep1":
            words += [["oh", t, t + 0.25, p, "Oh,"], ["fudge", t + 0.38, t + FUDGE, p, "fudge."]]; t += FUDGE
        else:
            for w in ws:
                core = w.rstrip(",.:?"); d = syl(core) * SYL + 0.03
                words.append([core.lower().replace("’", "'"), round(t, 3), round(t + d, 3), p, w]); t += d
                if w[-1] in ",:" : t += COMMA
                elif w[-1] in ".?" and w is not ws[-1]: t += COMMA + 0.1
        t += (PAUSE + EXTRA.get((lid, j), 0)) if j < len(parts) - 1 else gap
    lines.append([lid, starts, tk, text])
vend = max(w[2] for w in words); k = (TARGET - T0) / (vend - T0)
print(f"estimado sin escalar: voz termina en {vend:.2f} s -> escala x{k:.3f} para terminar en {TARGET}")
S = lambda v: round(T0 + (v - T0) * k, 3)
for w in words: w[1], w[2] = S(w[1]), S(w[2])
for ln in lines: ln[1] = [S(v) for v in ln[1]]
DUR = 62.2; N = int(DUR * 15) + 1; mouth = ["-"] * N
for w in words:
    sy = ["O" if re.search(r"[ou]", v) else "A" for v in (re.findall(r"[aeiouy]+", w[0]) or ["a"])]
    for f in range(int(w[1] * 15), int(w[2] * 15) + 1):
        tt = (f + 0.5) / 15
        if w[1] <= tt <= w[2] and f < N: mouth[f] = sy[min(len(sy) - 1, int((tt - w[1]) / (w[2] - w[1] + 1e-6) * len(sy)))]
json.dump(lines, open(f"{H}/lines.json", "w", encoding="utf-8"), ensure_ascii=False, indent=0)
out = dict(voice="SCRATCH", dur=DUR, words=[[re.sub(r"[…\".,:?]", "", w[0]), w[1], w[2], w[3], w[4]] for w in words], mouth="".join(mouth))
json.dump(out, open(f"{H}/../engine/timeline.json", "w", encoding="utf-8"), ensure_ascii=False)
for ln in lines: print(ln[0], ln[1])

# v4: elige por toma la semilla mas viva (rango de F0 en semitonos + modulacion de energia) entre las que whisper oye bien.
# Lee takes/<id>_s<k>.wav y gen_report.txt; escribe pick.json y el informe pick.txt. python pick.py
import glob, json, os, re, numpy as np, soundfile as sf
from num2words import num2words
REP = {}
for ln in open("gen_report.txt", encoding="utf8"):
    m = re.match(r"(OK |DIF) (takes/\S+)\s+([\d.]+)s \| (.*)", ln.strip())
    if m: REP[m.group(2)] = m.group(4)
T = {tid: txt for tid, txt in re.findall(r'\("(\d\d_\w)", f?"([^"]+)"\)', open("gen.py", encoding="utf8").read())}
def norm(s):
    s = s.replace("{FEMA}", "fema").replace("dot gov", "gov"); s = re.sub(r"(\d+)[.:](\d+)", lambda g: f"{g.group(1)} {g.group(2)}", s.lower()).replace("%", " percent")
    s = re.sub(r"\d+", lambda g: num2words(int(g.group())), s)
    return re.sub(r"[^a-z]", "", s.replace("missed", "miss"))
def f0(x, sr):
    H, Wn = int(0.01 * sr), int(0.04 * sr); out = []
    for i in range(0, len(x) - Wn, H):
        s = x[i:i + Wn]
        if np.sqrt(np.mean(s ** 2)) < 0.03 * np.abs(x).max(): continue
        s = s - s.mean(); ac = np.correlate(s, s, "full")[Wn - 1:]; lo, hi = int(sr / 400), int(sr / 130); k = lo + np.argmax(ac[lo:hi])
        if ac[k] > 0.45 * ac[0]: out.append(sr / k)
    f = np.array(out); med = np.median(f); f = f[(f > med / 1.6) & (f < med * 1.6)]   # sin saltos de octava
    return 12 * np.log2(f / med)
pick, rep = {}, []
for tid, txt in T.items():
    best = None
    for p in sorted(glob.glob(f"takes/{tid}_s*.wav")):
        key = p.replace("\\", "/"); heard = REP.get(key, "")
        ok = norm(heard) == norm(txt)
        x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
        st = f0(x, sr); rng = np.percentile(st, 90) - np.percentile(st, 10) if len(st) > 10 else 0
        H = int(0.02 * sr); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)]); e = 20 * np.log10(e[e > 0.02 * e.max()] + 1e-9)
        score = rng + 0.15 * np.std(e)
        if heard.strip().endswith('?') and not txt.strip().endswith('?'): score -= 4   # ep6: entonacion de pregunta donde no va
        rep.append(f"{tid} {os.path.basename(p):14s} {'OK ' if ok else 'DIF'} f0rango {rng:4.1f} st  score {score:4.1f} | {heard}")
        if ok and (best is None or score > best[0]): best = (score, os.path.basename(p)[:-4])
    pick[tid] = best[1] if best else None; rep.append(f"  -> {pick[tid]}")
json.dump(pick, open("pick.json", "w"), indent=1); open("pick.txt", "w", encoding="utf8").write("\n".join(rep)); print("\n".join(r for r in rep if "->" in r))

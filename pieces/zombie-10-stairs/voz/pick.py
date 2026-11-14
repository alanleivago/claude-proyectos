# v4: elige por toma la semilla mas viva (rango de F0 en semitonos + modulacion de energia) entre las que whisper oye bien.
# Lee takes/<id>_s<k>.wav y gen_report.txt; escribe pick.json y el informe pick.txt. python pick.py
import glob, json, os, re, numpy as np, soundfile as sf
from num2words import num2words
REP = {}
for ln in open("gen_report.txt", encoding="utf8"):
    m = re.match(r"(OK |DIF) (takes/\S+)\s+([\d.]+)s \| (.*)", ln.strip())
    if m: REP[m.group(2)] = m.group(4)
T = {tid: txt for tid, txt in re.findall(r'\("(\d\d_\w+)", f?"([^"]+)"(?:, "\w+")?\)', open("gen.py", encoding="utf8").read())}
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
pick, rep = {}, []; DUR, RISE = {}, {}
for tid, txt in T.items():
    best = None; cands = []
    for p in sorted(glob.glob(f"takes/{tid}_s*.wav")):
        key = p.replace("\\", "/"); heard = REP.get(key, "")
        ok = norm(heard) == norm(txt)
        x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1)
        st = f0(x, sr); rng = np.percentile(st, 90) - np.percentile(st, 10) if len(st) > 10 else 0
        H = int(0.02 * sr); e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, len(x) - H, H)]); e = 20 * np.log10(e[e > 0.02 * e.max()] + 1e-9)
        n4 = max(4, len(st) // 4); rise = (np.median(st[-n4:]) - np.median(st[-2 * n4:-n4])) if len(st) > 12 else 0
        DUR.setdefault(tid, []).append(len(x) / sr)
        score = rng + 0.15 * np.std(e)
        if txt.strip().endswith('.') and rise > 1.5: score -= 2.0 * (rise - 1.5)   # v4: afirmacion que sube al final = suena a pregunta
        RISE[os.path.basename(p)] = round(float(rise), 1)
        if heard.strip().endswith('?') and not txt.strip().endswith('?'): score -= 4   # ep6: entonacion de pregunta donde no va
        rep.append(f"{tid} {os.path.basename(p):14s} {'OK ' if ok else 'DIF'} f0rango {rng:4.1f} st  final {RISE[os.path.basename(p)]:+4.1f} st  {len(x)/sr:4.2f}s  score {score:4.1f} | {heard}")
        cands.append((score, os.path.basename(p)[:-4], len(x) / sr, ok))
    md = np.median([c[2] for c in cands]) if cands else 1
    for sc, nm, d, ok in cands:   # v4: ritmo, castiga tomas mucho mas lentas o rapidas que la mediana de sus semillas
        sc2 = sc - 6 * abs(np.log(d / md))
        if ok and (best is None or sc2 > best[0]): best = (sc2, nm)
    pick[tid] = best[1] if best else None; rep.append(f"  -> {pick[tid]}  (mediana {md:.2f}s)")
json.dump(pick, open("pick.json", "w"), indent=1); open("pick.txt", "w", encoding="utf8").write("\n".join(rep)); print("\n".join(r for r in rep if "->" in r))

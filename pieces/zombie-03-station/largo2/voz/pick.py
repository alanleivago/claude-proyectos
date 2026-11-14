# LARGO 2: elige por toma la semilla con transcripcion EXACTA (whisper) y, entre esas, la mas viva cuyo F0 BAJA al final
# en afirmaciones (no suena a pregunta) y con ritmo cerca de la mediana de sus semillas. Lee takes/<id>_s<k>.wav +
# gen_report.txt; escribe pick.json, pick.txt y copia la elegida a lines/<id>.wav. python pick.py
import glob, json, os, re, shutil, numpy as np, soundfile as sf
from num2words import num2words
from takes import T
REP = {}
for ln in open("gen_report.txt", encoding="utf8"):
    m = re.match(r"(OK |DIF) (takes/\S+)\s+([\d.]+)s \| (.*)", ln.strip())
    if m: REP[m.group(2)] = (m.group(1).strip(), m.group(4))
def f0(x, sr, lo=130, hi=400):
    H, Wn = int(0.01 * sr), int(0.04 * sr); out = []
    for i in range(0, len(x) - Wn, H):
        s = x[i:i + Wn]
        if np.sqrt(np.mean(s ** 2)) < 0.03 * np.abs(x).max(): continue
        s = s - s.mean(); ac = np.correlate(s, s, "full")[Wn - 1:]; a, b = int(sr / hi), int(sr / lo); k = a + np.argmax(ac[a:b])
        if ac[k] > 0.45 * ac[0]: out.append(sr / k)
    f = np.array(out)
    if len(f) < 8: return np.zeros(0)
    med = np.median(f); f = f[(f > med / 1.6) & (f < med * 1.6)]; return 12 * np.log2(f / med)
pick, rep = {}, []
os.makedirs("lines", exist_ok=True)
for tid, ch, who, text, reuse, gap in T:
    if reuse is not None: continue
    lo, hi = (65, 260) if who in ("dutch", "radio") else (130, 400)
    cands = []
    for p in sorted(glob.glob(f"takes/{tid}_s*.wav")):
        key = p.replace("\\", "/"); ok, heard = REP.get(key, ("DIF", ""))
        x, sr = sf.read(p); x = x if x.ndim == 1 else x.mean(1); st = f0(x, sr, lo, hi)
        rng = (np.percentile(st, 90) - np.percentile(st, 10)) if len(st) > 10 else 0
        n4 = max(4, len(st) // 4); rise = (np.median(st[-n4:]) - np.median(st[-2 * n4:-n4])) if len(st) > 12 else 0
        score = rng
        if not text.strip().endswith("?") and rise > 0.8: score -= 2.5 * (rise - 0.8)   # afirmacion que sube = suena a pregunta
        if heard.strip().endswith("?") and not text.strip().endswith("?"): score -= 4
        if who in ("think", "shake"): score = -abs(rng - 4)                              # susurros: parejos, sin picos
        cands.append([score, os.path.basename(p)[:-4], len(x) / sr, ok == "OK", round(float(rise), 1), heard])
    if not cands: rep.append(f"{tid} SIN TOMAS"); continue
    md = np.median([c[2] for c in cands])
    for c in cands: c[0] -= 6 * abs(np.log(c[2] / md))
    good = [c for c in cands if c[3]] or cands
    best = max(good, key=lambda c: c[0]); pick[tid] = best[1]
    shutil.copy(f"takes/{best[1]}.wav", f"lines/{tid}.wav")
    rep.append(f"{tid:5s} -> {best[1]:12s} {'OK ' if best[3] else 'DIF'} final {best[4]:+.1f} st  ({sum(c[3] for c in cands)}/{len(cands)} OK) | {best[5]}")
json.dump(pick, open("pick.json", "w"), indent=1); open("pick.txt", "w", encoding="utf8").write("\n".join(rep)); print("\n".join(r for r in rep if "DIF" in r or "SIN" in r)); print(len(pick), "elegidas")

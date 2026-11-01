# gen_exp.py PROFILE OUTDIR PREFIX [seeds] [only]: one WAV per guion.md paragraph via VoiceStudio REST (num_step 32, wav, raw),
# Whisper (small) check per take, keeps the best seed (stops at match >= 0.97). TTS text replaces years / foreign words.
import sys, os, re, requests, numpy as np, wave, json, difflib
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
prof, out, pre = sys.argv[1:4]
seeds = [int(s) for s in (sys.argv[4] if len(sys.argv) > 4 else "1,2,3,4").split(",")]
ONLY = [int(x) for x in sys.argv[5].split(",")] if len(sys.argv) > 5 else None
g = open(r"F:/Claude Proyectos/pieces/digger-05-two-sleeps/guion.md", encoding="utf-8").read(); body = g.split("---\n", 2)[2].split("\n---")[0]
pars = [l.strip() for l in body.split("\n") if l.strip() and not l.startswith(("#", "**", "---")) and not re.match(r"^\d\. ", l)]
TTS = [("\u2026", "..."), ("3 a.m.", "three A M"), ("1992", "nineteen ninety-two"), ("14 hours", "fourteen hours"), ("600 years", "six hundred years"), ("1776", "seventeen seventy-six"), ("1953", "nineteen fifty-three"), ("1964", "nineteen sixty-four"), ("1907", "nineteen-oh-seven"), ("1956", "nineteen fifty-six"),
       ("1800s", "eighteen-hundreds"), ('"p\u0101y,"', '"pie,"'), ('"j\u0101ma,"', '"jaama,"'), ("R-E-M", "R. E. M."), ("Ekirch", "Eekirk"), ("!", ".")]   # v3: never "!" in TTS text; Ekirch is said "EE-kirk"
def tts(t):
    for a, b in TTS: t = t.replace(a, b)
    return t
m = WhisperModel("small", device="cpu", compute_type="int8")
def load(fn):
    w = wave.open(fn); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
from num2words import num2words
def _num(m):
    n = int(m.group(0)); return num2words(n, to="year") if 1100 <= n <= 2099 else num2words(n)
def norm(s): s = re.sub(r"\d+", _num, s.replace("%", " percent")); return re.sub(r"[^a-z ]", " ", s.lower().replace("-", " ")).split()
os.makedirs(out, exist_ok=True); log = []
for i, t in enumerate(pars, 1):
    if ONLY and i not in ONLY: continue
    best = None; fn = os.path.join(out, f"{pre}_p{i:02d}.wav"); tt = tts(t)
    for s in seeds:
        r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=tt, language="en", profile_id=prof, num_step=32, seed=s, effect_preset="raw"), timeout=900)
        r.raise_for_status(); open(fn, "wb").write(r.content); a = load(fn)
        segs, _ = m.transcribe(a, language="en", beam_size=5); hyp = " ".join(x.text.strip() for x in segs)
        ratio = difflib.SequenceMatcher(None, norm(tt), norm(hyp), autojunk=False).ratio()
        print(f"p{i:02d} seed {s} match {ratio:.3f} dur {len(a) / 16000:.2f} | {hyp}", flush=True)
        if best is None or ratio > best[0]: best = (ratio, s, hyp, r.content)
        if ratio >= 0.97: break
    open(fn, "wb").write(best[3]); log.append(dict(p=i, seed=best[1], match=round(best[0], 3), text=t, whisper=best[2]))
json.dump(log, open(os.path.join(out, f"{pre}_gen{sys.argv[5].replace(',', '_')[:20] if ONLY else ''}.json"), "w"), indent=1, ensure_ascii=False)
print("DONE", len(pars))

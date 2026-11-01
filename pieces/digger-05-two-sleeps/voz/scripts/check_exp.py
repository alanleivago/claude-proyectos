# check_exp.py TAKEDIR PREFIX [only]: Whisper (small) word check of every paragraph take against guion.md (numbers -> words,
# word-level diff, no autojunk). Prints the mismatching words per paragraph and writes TAKEDIR/PREFIX_check.json
import sys, os, re, json, difflib, wave, numpy as np
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
from num2words import num2words
d, pre = sys.argv[1:3]; ONLY = [int(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 else None
g = open(r"F:/Claude Proyectos/pieces/digger-05-two-sleeps/guion.md", encoding="utf-8").read(); body = g.split("---\n", 2)[2].split("\n---")[0]
pars = [l.strip() for l in body.split("\n") if l.strip() and not l.startswith(("#", "**", "---")) and not re.match(r"^\d\. ", l)]
SUB = [("3 a.m.", "3 am"), ("R-E-M", "REM"), ("p\u0101y", "pie"), ("j\u0101ma", "jama"), ("1800s", "eighteen hundreds")]
def _num(m): n = int(m.group(0)); return num2words(n, to="year") if 1100 <= n <= 2099 else num2words(n)
def norm(s):
    for a, b in SUB: s = s.replace(a, b)
    s = re.sub(r"(\d+)s\b", lambda m: _num(m) + "s", s); s = re.sub(r"\d+", _num, s.replace("%", " percent").replace("6:30", "six thirty"))
    return re.sub(r"[^a-z ]", " ", s.lower().replace("-", " ")).split()
m = WhisperModel("small", device="cpu", compute_type="int8"); res = []
for i, t in enumerate(pars, 1):
    if ONLY and i not in ONLY: continue
    fn = os.path.join(d, f"{pre}_p{i:02d}.wav"); w = wave.open(fn); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if w.getnchannels() > 1: a = a.reshape(-1, w.getnchannels()).mean(1)
    a16 = resample_poly(a, 16000, sr).astype(np.float32); segs, _ = m.transcribe(a16, language="en", beam_size=5); hyp = " ".join(x.text.strip() for x in segs)
    A, B = norm(t), norm(hyp); sm = difflib.SequenceMatcher(None, A, B, autojunk=False); bad = [(op, " ".join(A[i1:i2]), " ".join(B[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    res.append(dict(p=i, match=round(sm.ratio(), 3), dur=round(len(a) / sr, 2), diff=bad, whisper=hyp))
    print(f"p{i:02d} {sm.ratio():.3f} {len(a) / sr:6.2f}s", bad if bad else "", flush=True)
json.dump(res, open(os.path.join(d, f"{pre}_check.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)

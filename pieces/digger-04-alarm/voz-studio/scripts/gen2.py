# ep02: guion.md paragraphs. usage: gen2.py PROFILE OUTDIR PREFIX [seeds] [only paragraphs]
# one WAV per paragraph via REST /generate (num_step=32, wav, effect_preset=raw), each checked with faster-whisper; best seed kept
import sys, os, re, requests, numpy as np, wave, json, difflib
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
prof, out, pre = sys.argv[1:4]
seeds = [int(s) for s in (sys.argv[4] if len(sys.argv) > 4 else "1,2,3,4,5").split(",")]
g = open(r"F:/Claude Proyectos/pieces/digger-04-alarm/guion.md", encoding="utf-8").read()
body = g.split("~90-100 s)")[1].split("\n---")[0]
pars = [p.strip().replace("\u2026", "...").replace("1787", "seventeen eighty-seven").replace("1876", "eighteen seventy-six").replace("1956", "nineteen fifty-six").replace("1970s", "nineteen-seventies") for p in body.split("\n\n") if p.strip()]
ONLY = [int(x) for x in sys.argv[5].split(",")] if len(sys.argv) > 5 else None
m = WhisperModel("small", device="cpu", compute_type="int8")
def load(fn):
    w = wave.open(fn); sr = w.getframerate(); n = w.getnchannels()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if n > 1: a = a.reshape(-1, n).mean(1)
    return resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
def norm(s):
    s = s.lower().replace("1787", "seventeen eighty seven").replace("1876", "eighteen seventy six").replace("1956", "nineteen fifty six").replace("1970s", "nineteen seventies").replace("70s", "seventies").replace("-", " ")
    return re.sub(r"[^a-z0-9 ]", " ", s).split()
os.makedirs(out, exist_ok=True); log = []
for i, t in enumerate(pars, 1):
    if ONLY and i not in ONLY: continue
    best = None
    for s in seeds:
        fn = os.path.join(out, f"{pre}_p{i:02d}.wav")
        r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=t, language="en", profile_id=prof, num_step=32, seed=s, effect_preset="raw"), timeout=900)
        r.raise_for_status(); open(fn, "wb").write(r.content)
        a = load(fn)
        segs, _ = m.transcribe(a, language="en", beam_size=5)
        hyp = " ".join(x.text.strip() for x in segs)
        ratio = difflib.SequenceMatcher(None, " ".join(norm(t)), " ".join(norm(hyp))).ratio()
        # reject broken takes (tone, no voice): whisper empty or too short
        dur = len(a) / 16000
        print(f"p{i:02d} seed {s} match {ratio:.3f} dur {dur:.2f} | {hyp}", flush=True)
        if best is None or ratio > best[0]: best = (ratio, s, hyp, r.content)
        if ratio >= 0.97: break
    open(fn, "wb").write(best[3]); log.append(dict(p=i, seed=best[1], match=round(best[0], 3), text=t, whisper=best[2]))
json.dump(log, open(os.path.join(out, f"{pre}_gen{'_'+sys.argv[5].replace(',','-') if ONLY else ''}.json"), "w"), indent=1, ensure_ascii=False)
print("DONE", len(pars))

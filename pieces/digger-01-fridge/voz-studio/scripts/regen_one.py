# regen_one.py PROFILE OUTDIR PREFIX PAR seeds  -> tries seeds for one paragraph, prints whisper; files OUTDIR/PREFIX_pNN_sS.wav
import sys, os, requests, numpy as np, wave
from faster_whisper import WhisperModel
from scipy.signal import resample_poly
prof, out, pre, par, seeds = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), [int(s) for s in sys.argv[5].split(",")]
g = open(r"F:/Claude Proyectos/pieces/digger-01-fridge/guion.md", encoding="utf-8").read()
pars = [p.strip().replace("\u2026", "...") for p in g.split("target ~75 s)")[1].split("\n---")[0].split("\n\n") if p.strip()]
m = WhisperModel("small", device="cpu", compute_type="int8"); os.makedirs(out, exist_ok=True)
for s in seeds:
    fn = os.path.join(out, f"{pre}_p{par:02d}_s{s}.wav")
    r = requests.post("http://127.0.0.1:3900/generate", data=dict(text=pars[par - 1], language="en", profile_id=prof, num_step=32, seed=s, effect_preset="raw"), timeout=900)
    open(fn, "wb").write(r.content)
    w = wave.open(fn); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    a = resample_poly(a, 16000, w.getframerate()).astype(np.float32)
    segs, _ = m.transcribe(a, language="en", beam_size=5)
    print(s, round(len(a) / 16000, 2), " ".join(x.text.strip() for x in segs), flush=True)

# v3 (correcciones del usuario): genera variantes de las tomas cambiadas -> takes/fix/<id>_<var>_s<seed>.wav + fix_report.txt
# python gen_fix.py   (VoiceStudio REST, omnivoice, steps 32, wav)
import json, os, sys, urllib.request, numpy as np, soundfile as sf
from takes import T, VOICE
API = "http://127.0.0.1:3900/v1/audio/speech"; OUT = "takes/fix"; os.makedirs(OUT, exist_ok=True)
MI = "female, middle-aged, low pitch, american accent"   # Marla con voz (sin 'whisper' del perfil)
VAR = {}
for tid in ("u7",): VAR[tid] = {"wA": (0.88, "whisper"), "wB": (0.96, "whisper")}
for tid in ("w5",): VAR[tid] = {"wA": (0.88, "whisper"), "wB": (0.96, "whisper")}
for tid in ("m3", "m5", "g3", "g5", "g6", "g11"): VAR[tid] = {"v": (0.9, MI)}
for tid in ("k8", "k8b", "k9"): VAR[tid] = {"n": (0.88, None)}
SEEDS = range(1, int(sys.argv[1]) + 1) if len(sys.argv) > 1 else range(1, 7)
TXT = {x[0]: x for x in T}
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
def heard(path):
    x, sr = sf.read(path); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; x = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    seg, _ = m.transcribe(x.astype(np.float32), language="en"); return " ".join(s.text.strip() for s in seg), len(x) / 16000
for sd in SEEDS:
    for tid, vs in VAR.items():
        _, ch, who, text, _, _ = TXT[tid]
        for vn, (sp, ins) in vs.items():
            out = f"{OUT}/{tid}_{vn}_s{sd}.wav"
            if os.path.exists(out): continue
            t = text.replace("A.M.", "A M")
            body = {"model": "omnivoice", "input": t, "voice": VOICE[who], "language": "en", "response_format": "wav", "num_step": 32, "speed": sp, "seed": sd}
            if ins: body["instruct"] = ins
            req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
            h, d = heard(out); line = f"{out:34s} {d:5.2f}s | {h}"
            print(line, flush=True); open("fix_report.txt", "a", encoding="utf-8").write(line + "\n")

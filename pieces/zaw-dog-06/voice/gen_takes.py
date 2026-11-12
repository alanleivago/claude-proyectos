"""VoiceStudio "3d cartoon" (227af074 on the Mac) one take per line and seed -> takes/lNN_<seed>.wav, Whisper diff.
.venv/bin/python voice/gen_takes.py [seed ...]"""
import io, json, re, sys, difflib, urllib.request
from pathlib import Path
import numpy as np, soundfile as sf, scipy.signal as ss
from faster_whisper import WhisperModel
API = "http://127.0.0.1:3900/v1/audio/speech"; SR = 44100
V = Path(__file__).parent; LINES = json.load(open(V / "lines.json"))
seeds = [int(s) for s in sys.argv[1:]] or [1]
import os
only = [int(x) for x in os.environ.get("ONLY", "").split(",") if x]
m = WhisperModel("small.en", compute_type="int8")
norm = lambda t: re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("-", " ")).split()
for s in seeds:
    for i, text in enumerate(LINES, 1):
        if only and i not in only:
            continue
        p = V / "takes" / f"l{i:02d}_{s}.wav"
        if not p.exists():
            body = json.dumps({"model": "omnivoice", "input": text, "voice": ("227af074" if sys.platform == "darwin" else "d9b69bea"),
                               "response_format": "wav", "num_step": 32, "language": "English", "seed": s}).encode()
            r = urllib.request.urlopen(urllib.request.Request(API, data=body, headers={"Content-Type": "application/json"}), timeout=900)
            a, sr = sf.read(io.BytesIO(r.read()), dtype="float32"); a = a.mean(1) if a.ndim > 1 else a
            if sr != SR: a = ss.resample_poly(a, SR, sr).astype("float32")
            sf.write(p, a, SR)
        a = sf.read(p, dtype="float32")[0]
        heard = " ".join(sg.text for sg in m.transcribe(ss.resample_poly(a, 16000, SR).astype("float32"), language="en")[0])
        r_ = difflib.SequenceMatcher(None, norm(text), norm(heard)).ratio()
        print(f"l{i:02d}_{s} {r_:.2f} {len(a)/SR:.2f}s | {heard.strip()}", flush=True)

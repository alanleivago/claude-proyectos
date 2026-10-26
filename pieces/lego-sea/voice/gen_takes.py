"""Tomas VoiceStudio '3D cartoon 2' (guidance 3.0, steps 32) + diff whisper contra el guion."""
import io, json, re, sys, difflib, urllib.request
from pathlib import Path
import numpy as np, soundfile as sf, scipy.signal as ss
API = "http://127.0.0.1:3900/v1/audio/speech"; SR = 48000
here = Path(__file__).parent; text = (here.parent / "script.txt").read_text(encoding="utf-8").strip()
seeds = [int(s) for s in sys.argv[1:]] or list(range(11, 19))
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
norm = lambda t: re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("-", " ")).split()
for s in seeds:
    p = here / "takes" / f"take_{s}.wav"
    if not p.exists():
        body = json.dumps({"model": "omnivoice", "input": text, "voice": "d9b69bea", "response_format": "wav", "num_step": 32,
                           "language": "English", "seed": s, "guidance_scale": 3.0, "duration": 61.0}).encode()
        r = urllib.request.urlopen(urllib.request.Request(API, data=body, headers={"Content-Type": "application/json"}), timeout=900)
        a, sr = sf.read(io.BytesIO(r.read()), dtype="float32"); a = a.mean(1) if a.ndim > 1 else a
        if sr != SR: a = ss.resample_poly(a, SR, sr).astype("float32")
        sf.write(p, a, SR)
    a = sf.read(p, dtype="float32")[0]
    segs, _ = m.transcribe(ss.resample_poly(a, 16000, SR).astype("float32"), language="en", word_timestamps=True)
    W = [w for sg in segs for w in sg.words]
    got, ref = norm(" ".join(w.word for w in W)), norm(text)
    ops = [(op, " ".join(ref[i1:i2]), " ".join(got[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, ref, got).get_opcodes() if op != "equal"]
    gaps = [round(W[i].end, 1) for i in range(len(W) - 1) if W[i + 1].start - W[i].end > 0.45]
    print(f"take {s}: {len(a)/SR:.1f}s  diffs {len(ops)} {ops[:4]}  gaps>0.45s at {gaps}", flush=True)

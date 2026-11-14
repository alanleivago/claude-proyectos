# Ep8 largo: tomas de VoiceStudio, voz "ava bread buena" f2a102da, steps 32, wav, speed 0.85 (a 1.0 iba a 4.3 palabras/s), 4 semillas por toma (takes/<id>_s<k>.wav).
# Cada mitad de un "..." es su propia toma (takes.py). Verifica con faster-whisper y escribe gen_report.txt.
# python gen.py [ids...] [--redo] [--seeds 1,2,3,4]
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf, scipy.signal as ss
from takes import T
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
SAY = {"Ready dot gov": "Ready dot gov"}
args = sys.argv[1:]; redo = "--redo" in args
SEEDS = [int(s) for s in (args[args.index("--seeds") + 1] if "--seeds" in args else "1,2,3,4").split(",")]
only = [a for a in args if not a.startswith("--") and not re.fullmatch(r"[\d,]+", a)]
def tts(text, seed, out):
    for a, b in SAY.items(): text = text.replace(a, b)
    body = {"model": "omnivoice", "input": text.replace("…", ","), "voice": VOICE, "language": "en", "response_format": "wav", "num_step": 32, "speed": 0.85, "seed": seed}
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
from num2words import num2words
def norm(s):
    s = re.sub(r"\d+", lambda g: num2words(int(g.group())), s.lower().replace("ready.gov", "ready dot gov"))
    return re.sub(r"[^a-z]", "", s.replace("-", " "))
os.makedirs("takes", exist_ok=True)
for tid, ch, who, text, reuse, gap in T:
    if reuse is not None or (only and tid not in only): continue
    for sd in SEEDS:
        out = f"takes/{tid}_s{sd}.wav"
        if redo or not os.path.exists(out): tts(text, sd, out)
        x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1); y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
        h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="Ready dot gov, Ribbon, First Aid Spray, decibels")[0])
        ok = norm(h) == norm(text)
        line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
        print(line, flush=True); open("gen_report.txt", "a", encoding="utf-8").write(line + "\n")
print("DONE", flush=True)

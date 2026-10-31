# Genera las tomas nuevas del largo con VoiceStudio (REST del mismo backend que el MCP generate_speech): steps 32, wav,
# speed 1.0. Ava = 3824e262, radio = cf919aa6 (la voz del policia: la cinta es de Vickers). Reanudable; verifica cada toma
# con faster-whisper small (cpu int8, arrays numpy) y escribe gen_report.txt. python gen.py [ids...] [--redo] [--seed N]
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
from takes import T
API = "http://127.0.0.1:3900/v1/audio/speech"
VOICE = {"ava": "f2a102da", "radio": "cf919aa6", "cop": "cf919aa6", "marla": "996b1578"}
SAY = {"K-9": "K nine", "point one oh": "point one oh", "World's Okayest": "World's Okayest", "A.M.": "A M", "FEMA's": "Fema's", "nine-millimeter": "nine millimeter"}
OUT = "takes"; os.makedirs(OUT, exist_ok=True)
args = sys.argv[1:]; redo = "--redo" in args; seed = None
if "--seed" in args: seed = int(args[args.index("--seed") + 1])
only = [a for a in args if not a.startswith("--") and not a.isdigit()]

def tts(text, voice, out):
    for a, b in SAY.items(): text = text.replace(a, b)
    body = {"model": "omnivoice", "input": text, "voice": voice, "language": "en", "response_format": "wav", "num_step": 32, "speed": 1.0}
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())

from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
from num2words import num2words
def norm(s):
    s = re.sub(r"(\d+):(\d+)", r" ", s.lower().replace("k-9", "k nine").replace("k9", "k nine"))
    s = re.sub(r"\d+", lambda g: num2words(int(g.group())), s)
    return re.sub(r"[^a-z ]", "", s.replace("-", " ").replace(",", " ")).split()
def heard(path):
    x, sr = sf.read(path); x = x if x.ndim == 1 else x.mean(1)
    if sr != 16000:
        import scipy.signal as ss; x = ss.resample_poly(x, 16000, sr)
    seg, _ = m.transcribe(x.astype(np.float32), language="en")
    return " ".join(s.text.strip() for s in seg), len(x) / 16000
rep = []
for tid, ch, who, text, reuse, gap in T:
    if reuse is not None or (only and tid not in only): continue
    out = f"{OUT}/{tid}.wav"
    if redo or not os.path.exists(out): tts(text, VOICE[who], out)
    h, d = heard(out)
    ok = norm(h) == norm(text.replace("A.M.", "AM"))
    line = f"{'OK ' if ok else 'DIF'} {tid:4s} {d:5.2f}s | {text} || {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

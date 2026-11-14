# Tomas de VoiceStudio para el ep9 (The Last Train, Part 2): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto. Ep9 v4: TODAS las lineas de nuevo, 8 semillas (usuario: varias partes no convencian). Estructura de prep.py v3
 ("01_0", "Last time, you had to choose,"), ("01_2", "get on,"), ("01_3", "or stay."),
 ("02_a", "Say you stay."), ("02_0", "Say you stay. The doors close, and the train leaves without you."), ("02_1", "On the floor you find the rest of rule two,"), ("02_2", "if you hear footsteps behind you, don't turn around."),
 ("03_0", "And right then, you hear footsteps. So you turn around."), ("03_1", "Two eyes in the dark,"), ("03_2", "and a smile way too wide for a face."),
 ("04_0", "You run for the exit, but the gate is still locked."),
 ("05_0", "Okay, let's rewind."),
 ("06_0", "This time, you get on. The doors shut right in its face, and it bangs on the glass,"), ("06_1", "but you're inside. You finally breathe."),
 ("07_0", "Then the train speeds up. It switches tracks and stops in a tunnel you've never seen,"), ("07_1", "and the lights go out."),
 ("08_0", "A screen turns on. Welcome to the last stop, you have one minute."), ("08_2", "Red,"), ("08_3", "you leave the train."), ("08_4", "White,"), ("08_5", "you stay on board."),
 ("09_0", "Then the doors open,"), ("09_1", "on total darkness."), ("09_2", "Five seconds left,"), ("09_3", "and something out there is breathing."),
 ("10_0", "So, what do you do? Leave,"), ("10_1", "or stay?"), ("10_2", "Comment one or two."),
]
SPEED = float(args[args.index("--speed") + 1]) if "--speed" in args else 1.0
redo = "--redo" in args; seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
only = [a for a in args if re.fullmatch(r"\d\d_\w", a)]
def tts(text, out):
    body = {"model": "omnivoice", "input": text, "voice": VOICE, "language": "en", "response_format": "wav", "num_step": 32, "speed": SPEED}
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "").replace("fema", "fema")).split()
OUTD = "takes4"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text in T:
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="Last train, get on or stay, rule two, Oh, fudge.")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report4.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

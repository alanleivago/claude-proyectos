# Tomas de VoiceStudio para el ep6 (Floor 30): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto (la mitad que sigue termina en coma: entonacion que continua). Ep6 "Floor 30"
 ("01_0", "Imagine you live on the thirtieth floor,"), ("01_1", "and that was the worst thing about your apartment. Until tonight."),
 ("02_0", "Then every phone in the building goes off at once."),
 ("03_0", "First problem, water. The building's pumps run on electricity,"), ("03_1", "so Ava fills the tub, and a bucket, while there's still pressure. A full tub is about forty gallons."),
 ("04_0", "Next, she counts the food,"), ("04_1", "and splits it into days."),
 ("05_0", "Around seven, the city goes dark, block by block,"), ("05_1", "then her building. The fridge dies."),
 ("06_0", "Ava tries the faucet,"), ("06_1", "nothing."), ("06_2", "Without power, the pumps can't push water up thirty floors."),
 ("07_0", f"{FEMA} says a gallon a day per person,"), ("07_1", "so that tub is about forty days. And her phone's at eighteen percent."),
 ("08_0", "So she pushes the dresser against the door."),
 ("09_0", "Close to midnight, footsteps in the hallway. She freezes,"), ("09_1", "and the footsteps stop too."),
 ("10_0", "Through the peephole, it's the guy from thirty-eleven,"), ("10_1", "staring right at it."),
 ("12_0", "So, do you open the door, or stay quiet?"), ("12_1", "Comment one or two,"), ("12_2", "most comments decide Part 2."),
]
SPEED = float(args[args.index("--speed") + 1]) if "--speed" in args else 1.0
redo = "--redo" in args; seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
only = [a for a in args if re.fullmatch(r"\d\d_\d", a)]
def tts(text, out):
    body = {"model": "omnivoice", "input": text, "voice": VOICE, "language": "en", "response_format": "wav", "num_step": 32, "speed": SPEED}
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "").replace("fema", "fema")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text in T:
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="FEMA, thirty-eleven, peephole")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

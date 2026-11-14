# Tomas de VoiceStudio para el ep6 (Floor 30): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto (la mitad que sigue termina en coma: entonacion que continua). Ep7 "The Safe Room"
 ("01_a", "In a zombie outbreak,"), ("01_0", "you can't defend the whole house,"), ("01_1", "so you pick one room."),
 ("02_0", "So you pick the living room. It's the biggest."), ("02_1", "Three windows, and two doors."),
 ("03_0", "Every window is a door for them."),
 ("04_0", "So you go small. One door, no windows,"), ("04_1", "right in the middle of the house, like a bathroom or a walk-in closet."), ("04_2", "Even Ready dot gov says it, an inside room with as few windows as possible."),
 ("05_0", "Then you fix its door like last time,"), ("05_1", "you drive three inch screws into the stud, and wedge a bar under the handle. You already know how."),
 ("06_0", "Now, your item box."), ("06_1", "Water, food, a flashlight with spare batteries, a radio, and a charger, all in one chest."), ("06_2", "Pretty much Fema's own list."),
 ("07_0", "And while you're packing, you cut your hand on a nail from the barricade, and it won't stop bleeding."), ("07_1", "So you spray it, put the bandage on,"), ("07_2", "and press down hard for a full fifteen minutes, no peeking."),
 ("08_0", "Day three, you save your game."), ("08_1", "Congratulations,"), ("08_2", "you have a safe room."),
 ("10_0", "Stairs are next week."),
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
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text in T:
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="Ready.gov, FEMA, safe room, walk-in closet, three-inch screws")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

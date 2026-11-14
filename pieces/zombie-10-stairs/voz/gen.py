# Tomas de VoiceStudio para el ep10 (The Stairs): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, voz]. Ep10 "The Stairs": una toma por mitad de cada "…"
 ("01_0", "In a zombie outbreak, your safe room won't hold forever,"), ("01_1", "so you go up."),
 ("02_0", "Most people stay downstairs, with two doors and five windows to guard at once."),
 ("03_0", "Then the front door gives, and they pour in,"), ("03_1", "and you're too late for the stairs."),
 ("04_0", "In this world, zombies are terrible at stairs."), ("04_1", "So you go up. The staircase becomes your wall, only one can climb at a time."),
 ("05_0", "First, you block the bottom steps. Tip the sofa, stack the dresser on it,"), ("05_1", "and screw them together with three inch screws. You already know how."),
 ("06_0", "Then the top. You screw a door across the stairs on its edge, and push a heavy shelf against it."),
 ("07_0", "But don't trap yourself. Your exit is the upstairs window, with an escape ladder."), ("07_1", "Fire safety says every room needs two ways out."),
 ("08_0", "You carry up the water, the backpack, the radio, and the First Aid Spray."), ("08_1", "Day four, you save your game."),
 ("09_0", "Then someone knocks downstairs. Zombies don't knock."),
 ("09_m0", "Hello?", "b0469a54"), ("09_m1", "Please,", "b0469a54"), ("09_m2", "I'm not bitten!", "b0469a54"),
 ("10_0", "So, should you open the door?"), ("10_1", "Let them in, or stay quiet?"), ("10_2", "Comment one or two."),
]
SPEED = float(args[args.index("--speed") + 1]) if "--speed" in args else 1.0
redo = "--redo" in args; seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
only = [a for a in args if re.fullmatch(r"\d\d_\w+", a)]
def tts(text, out, voice):
    body = {"model": "omnivoice", "input": text, "voice": voice, "language": "en", "response_format": "wav", "num_step": 32, "speed": SPEED}
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "").replace("fema", "fema")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text, *vv in T:
    VOICE_ = vv[0] if vv else VOICE
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out, VOICE_)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="safe room, staircase, dresser, three-inch screws, escape ladder, First Aid Spray")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

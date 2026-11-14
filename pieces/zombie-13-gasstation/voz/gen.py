# Tomas de VoiceStudio para el ep13 (Gas Station, Part 1): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, voz]. Ep13 "Gas Station, Part 1": una toma por mitad de cada "…"
 ("01_0", "It's 2 AM, and you're alone at a gas station, filling up."), ("01_1", "Then the lights flicker, and the pump stops at twelve forty."),
 ("02_0", "Your tank's only a quarter full, and the hose is dead."), ("02_1", "Gas pumps run on electricity, so no power means no gas."),
 ("03_0", "So you head into the shop and grab what matters."), ("03_1", "Water before snacks, then a flashlight and some bandages."), ("03_2", "You can last weeks without food, but only about three days without water."),
 ("04_0", "Don't hide by the windows. Glass breaks, and they can see you through it."), ("04_1", "The walk-in cooler has one door, thick walls, and no windows. That's your safe room."),
 ("05_0", "Outside, shapes cross in front of a car's headlights."), ("05_1", "Flashlight off. Stay low, and don't move."), ("05_2", "A flashlight behind all that glass can be seen from the road."),
 ("06_0", "Someone knocks from inside the locked bathroom."),
 ("07_s0", "Please,", "b0469a54"), ("07_s1", "let me in. I'm not bitten.", "b0469a54"), ("07_s2", "I cut my hand on the glass.", "b0469a54"),
 ("08_0", "A hand slides out under the door, wrapped in a bandage."),
 ("09_0", "A drop of blood rolls out after it."), ("09_2", "Bites bleed, but so do cuts."),
 ("10_0", "So, would you unlock it?"), ("10_1", "Unlock it, or leave it locked?"), ("10_2", "Comment one or two."),
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
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text, *vv in T:
    VOICE_ = vv[0] if vv else VOICE
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out, VOICE_)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="gas station, 2 AM, walk-in cooler, flashlight, bandages, twelve forty")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

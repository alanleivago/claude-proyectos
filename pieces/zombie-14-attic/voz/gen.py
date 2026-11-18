# Tomas de VoiceStudio para el ep14 (The Attic): voz "Ava Restfield" f2f8f8dc, speed 0.88, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2f8f8dc"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, instruct]. Ep14 "The Attic (Stairs, Part 2)": una toma por mitad de cada "…"
 ("01_0", "In a zombie outbreak, there's one room in your house nobody ever checks."), ("01_1", "The attic."),
 ("02_0", "Last time, someone knocked downstairs and begged to come in."), ("02_1", "And most of you said stay quiet."), ("02_2", "So you stay quiet."), ("02_3", "And the knocking stops."),
 ("03_0", "From now on it's silence. Normal talking is about sixty decibels, and a whisper is around thirty."), ("03_1", "So you whisper, or you don't talk at all."),
 ("04_0", "Light's even worse. In total darkness, one small flame can be seen from more than a mile away."), ("04_1", "So the blanket goes over the window, and the flashlight points at the floor."),
 ("05_0", "Day five. You save your game."),
 ("06_0", "Then you go up to the attic with the water and the mattress."), ("06_1", "The floor pulls heat out of you faster than the air does, so you never sleep on bare boards."),
 ("07_0", "Footsteps outside. Heavy ones.", "whisper"), ("07_1", "And bare.", "whisper"),
 ("08_0", "That's not a zombie.", "whisper, low pitch"),
 ("09_0", "Low sounds carry farther than high ones, so everything for blocks just heard that."),
 ("10_0", "It tilts its head."), ("10_1", "And looks up at the attic."),
 ("11_0", "Only one of them can climb your stairs at a time."), ("11_1", "This one doesn't need to."),
 ("12_0", "So what do you do?"), ("12_1", "One, stay still. Two, jump to the neighbor's roof."), ("12_2", "Comment one or two."),
]
SPEED = float(args[args.index("--speed") + 1]) if "--speed" in args else 0.88
redo = "--redo" in args; seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
only = [a for a in args if re.fullmatch(r"\d\d_\w+", a)]
def tts(text, out, ins):
    body = {"model": "omnivoice", "input": text, "voice": VOICE, "language": "en", "response_format": "wav", "num_step": 32, "speed": SPEED}
    if seed is not None: body["seed"] = seed
    if ins: body["instruct"] = ins
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text, *vv in T:
    INS = vv[0] if vv else None
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out, INS)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="zombie outbreak, attic, decibels, flashlight, mattress, neighbor's roof")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

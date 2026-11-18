# Tomas de VoiceStudio para el ep15 (Last Train 3): voz "Ava Restfield" f2f8f8dc, speed 0.88, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2f8f8dc"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, instruct]. Ep15 "The Last Train, Part 3": una toma por mitad de cada "…"
 ("01_0", "You stayed on the last train."), ("01_1", "But who's driving it?"),
 ("02_0", "Some of you pressed red. So you step off into the tunnel. Don't touch the third rail, it carries about six hundred volts."),
 ("03_0", "Then footsteps behind you."), ("03_1", "And you turn around."),
 ("05_0", "Let's rewind."),
 ("06_0", "Most of you pressed white. The doors close, and the hunter stays outside. Then the train speeds up, with nobody driving."),
 ("07_0", "Trains have a dead man's switch. If the driver lets go, it brakes on its own."), ("07_1", "This one doesn't."),
 ("08_0", "Rule three says never enter the cab. You go in anyway, rip the tape off the lever, and pull the brake."),
 ("09_0", "It stops in the dark. Then footsteps in the next car."), ("09_1", "The hunter got on board."),
 ("10_0", "Ten seconds. Run for the exit."), ("10_1", "Or lock yourself in the cab?"), ("10_2", "Comment one or two."),
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
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="last train, third rail, six hundred volts, dead man's switch, the cab, rewind")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

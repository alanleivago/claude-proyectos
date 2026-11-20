# Tomas de VoiceStudio para el ep16 (Floor 30 Part 2): voz "Ava Restfield" f2f8f8dc, speed 0.88, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2f8f8dc"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, instruct]. Ep16 "Stuck On Floor 30, Part 2": una toma por mitad de cada "…"
 ("01_0", "Thirty floors up, the stairs are the only way out."), ("01_1", "And tonight, something big just walked into the building."),
 ("02_0", "Last time, someone knocked on thirty-twelve. Some of you said open it. So you move the dresser and open the door."), ("02_1", "And his arm is bitten."),
 ("05_0", "Let's rewind."),
 ("06_0", "Most of you said stay quiet. So you wait."), ("06_1", "And a note slides under the door."), ("06_2", "The stairs. It's coming up."),
 ("07_0", "Your phone's at eighteen percent. Airplane mode alone can stretch that by hours."),
 ("08_0", "Then footsteps in the stairwell, heavy and bare. In a stairwell, sound carries up floor after floor."),
 ("09_0", "Through the peephole."), ("09_1", "The hunter reaches your floor."),
 ("10_0", "Hide in the tub."), ("10_1", "Or climb down to the balcony below?"), ("10_2", "Comment one or two."),
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
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="thirty-twelve, peephole, stairwell, airplane mode, the hunter, rewind")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

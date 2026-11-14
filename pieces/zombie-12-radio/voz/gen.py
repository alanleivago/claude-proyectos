# Tomas de VoiceStudio para el ep12 (The Radio): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, voz]. Ep12 "The Radio": una toma por mitad de cada "…"
 ("01_0", "The lights are out, and your phone has no bars."), ("01_1", "When the phones die, this is your best friend."),
 ("02_0", "A hand-crank or battery radio doesn't need the power grid or a cell tower."), ("02_1", "Crank it for a minute, and it keeps talking for a while."),
 ("03_0", "Plug in one earbud and keep the speaker off, because noise brings them."), ("03_1", "Your other ear stays on the house."),
 ("04_0", "At night, AM stations bounce off the sky and carry for hundreds of miles."), ("04_1", "So scan the dial after dark."), ("04_2", "In the daytime, they don't reach nearly as far."),
 ("05_0", "Save your batteries and listen at the top of the hour, when the news comes on."), ("05_1", "Then write down every time and frequency."),
 ("06_0", "Listen for what keeps repeating, like shelters, safe routes, and curfew times."), ("06_1", "If you hear it every hour, it's probably official."),
 ("07_0", "But a stranger inviting you somewhere isn't a rescue."), ("07_1", "Listening is free. Talking back tells them where you are."), ("07_2", "Anyone can say they're the army."),
 ("08_r0", "Anyone out there?", "b0469a54"), ("08_r1", "We're at the police station. We have food.", "b0469a54"), ("08_r2", "Come to the front gate.", "b0469a54"),
 ("10_0", "So, what do you do?"), ("10_1", "Answer them, or stay silent?"), ("10_2", "Comment one or two."),
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
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="hand-crank radio, earbud, AM stations, curfew, police station")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

# Tomas de VoiceStudio para el ep5 (P.T.): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
PT = "P.T."   # se sobreescribe con --pt "Pee Tee" si VoiceStudio lo lee mal
args = sys.argv[1:]
if "--pt" in args: PT = args[args.index("--pt") + 1]
T = [  # id, texto (la mitad que sigue termina en coma: entonacion que continua)
 ("01_0", f"Did you know that in {PT},"), ("01_1", "the ghost walks right behind you the whole time?"),
 ("02_0", "And nobody noticed for five years."),
 ("03_0", "The whole game is one hallway. You walk out the door at the end,"), ("03_1", "and you're right back at the start, and every loop gets a little weirder."),
 ("04_0", "You'd hear breathing behind you,"), ("04_1", "you'd turn around,"), ("04_2", "and nothing."),
 ("05_0", "Then a modder hacked the camera,"), ("05_1", "so he could finally see behind the player."),
 ("06_0", "And there she was."), ("06_1", "Lisa."), ("06_2", "Stuck to your back from the moment you pick up the flashlight,"), ("06_3", "following you step by step."),   # v3: lectura lenta, pausa real tras Lisa
 ("07_0", "Every time you turned around,"), ("07_1", "the game would hide her. Face forward again,"), ("07_2", "and she's back."),
 ("08_0", "So Ava tried a little trick. If you can't turn around,"), ("08_1", "use the front camera."),
 ("08_2", "She held up the phone,"), ("08_3", "and there was a second face on the screen."),
 ("09_0", "Then she felt cold breath right on her neck."),
 ("10_0", "So that feeling of someone right behind you? It was real."),
 ("11_0", "Send this to the friend who plays at night,"), ("11_1", "and never looks back."),
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
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "").replace("p.t.", "pt").replace("pee tee", "pt").replace("p t", "pt")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text in T:
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="P.T., Lisa, modder")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

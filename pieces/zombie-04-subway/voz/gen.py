# Tomas de VoiceStudio para el ep4: voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] [--seed N]
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
T = [  # id, texto que se manda (la mitad que sigue termina en coma: entonación que continúa)
 ("01_0", "Imagine you miss the last train,"), ("01_1", "and the station locks you in."),   # v4: abre con "Imagine you…" como la referencia
 ("02_0", "Your phone has no signal and three percent battery. It's eleven forty-two,"), ("02_1", "and the next train isn't until five thirty."),
 ("03_0", "Then you find a sheet taped up in the ticket booth, night shift instructions. Rule one says never board an empty train."),
 ("04_0", "Rule two is torn off halfway through,"), ("04_1", "if you hear footsteps behind you, don't,"), ("04_2", "and that's where the paper ends."),
 ("05_0", "You laugh it off. It's probably the staff pranking the new guy."),
 ("06_0", "At eleven fifty-nine you're still waiting. When the clock hits midnight,"), ("06_1", "every light in the station goes out."),
 ("07_0", "A train pulls in with two headlights,"), ("07_1", "and it doesn't make a sound. The doors slide open on an empty car."),
 ("08_0", "Then you hear slow footsteps behind you. Something is standing right there,"), ("08_1", "and you can feel it breathing on your neck."),
 ("10_0", "And the doors start closing."),
 ("11_0", "So do you get on,"),
 ("11_2", "or do you stay?"), ("12_0", "Comment one or two, and most comments decide Part two."),   # revision API: pausa antes del CTA
]
args = sys.argv[1:]; redo = "--redo" in args; seed = int(args[args.index("--seed") + 1]) if "--seed" in args else None
only = [a for a in args if not a.startswith("--") and not a.isdigit()]
def tts(text, out):
    body = {"model": "omnivoice", "input": text, "voice": VOICE, "language": "en", "response_format": "wav", "num_step": 32, "speed": 1.0}
    if seed is not None: body["seed"] = seed
    req = urllib.request.Request(API, json.dumps(body).encode(), {"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r, open(out, "wb") as f: f.write(r.read())
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "")).split()
OUTD = "takes_v4" if "--v4" in args else "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text in T:
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

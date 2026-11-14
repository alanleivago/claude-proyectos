# Tomas de VoiceStudio para el ep11 (How Not to Turn): voz "ava bread buena" f2a102da, steps 32, wav. Una toma por mitad de cada "…"
# (nunca se corta una toma en "…"). Verifica con whisper. python gen.py [ids...] [--redo] --seed N
import json, re, sys, os, urllib.request, numpy as np, soundfile as sf
API = "http://127.0.0.1:3900/v1/audio/speech"; VOICE = "f2a102da"
args = sys.argv[1:]
FEMA = "Fema"   # VoiceStudio: "FEMA" lo deletrea; "Fema" se lee FEE-muh
T = [  # id, texto[, voz]. Ep11 "How Not to Turn": una toma por mitad de cada "…"
 ("01_0", "In a zombie outbreak, the bite isn't what turns you,"), ("01_1", "the X-virus is."),
 ("02_0", "In this world, it spreads like rabies. It's in their blood and spit, and it gets in through a bite, a scratch, or a splash in your eyes or mouth."),
 ("03_0", "Most people fight with bare arms,"), ("03_0b", "Most people fight with bare arms."), ("03_1", "then one drop of blood hits their eye. A splash counts as a bite."),
 ("04_0", "So cover up. Long sleeves, gloves, goggles, and a mask or a bandana."), ("04_1", "Blood on a sleeve is just laundry."),
 ("05_0", "If you get bitten or scratched anyway, wash the wound with soap and running water for a full fifteen minutes,"), ("05_1", "then disinfect it."), ("05_2", "and get real medical help, fast."),
 ("06_0", "After a fight or a cleanup, don't touch your face. Wash your hands first."),
 ("07_0", "In this world, it moves fast. Day one, fever and headache. Day two, red eyes and a blank stare,"), ("07_1", "Day three, you don't want to know."),
 ("08_0", "So anyone who shows up, even the guy at the door, stays alone and watched for seventy-two hours before joining you."),
 ("09_0", "Then you spot a scratch on your arm,"), ("09_1", "when did that happen?"),
 ("10_0", "So, what do you do?"), ("10_1", "Wash it for fifteen minutes, or quarantine yourself?"), ("10_2", "Comment one or two."),
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
norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("-", " ").replace("'", "").replace("ex virus", "x virus").replace("ex-virus", "x virus")).split()
OUTD = "takes"; os.makedirs(OUTD, exist_ok=True); rep = []
for tid, text, *vv in T:
    VOICE_ = vv[0] if vv else VOICE
    if only and tid not in only: continue
    out = f"{OUTD}/{tid}{'' if seed is None else '_s%d' % seed}.wav"
    if redo or not os.path.exists(out): tts(text, out, VOICE_)
    x, sr = sf.read(out); x = x if x.ndim == 1 else x.mean(1)
    import scipy.signal as ss; y = ss.resample_poly(x, 16000, sr) if sr != 16000 else x
    h = " ".join(s.text.strip() for s in m.transcribe(y.astype(np.float32), language="en", initial_prompt="X-virus, rabies, bandana, goggles, quarantine, seventy-two hours")[0])
    ok = norm(h) == norm(text); line = f"{'OK ' if ok else 'DIF'} {out:22s} {len(x)/sr:5.2f}s | {h}"
    print(line, flush=True); rep.append(line)
open("gen_report.txt", "a", encoding="utf-8").write("\n".join(rep) + "\n")

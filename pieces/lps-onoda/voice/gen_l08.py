"""venv: l08 with real pauses between the years (user: "One year. Ten. Twenty." was too fast).
"So he kept going." / "One year." / "Ten." / "Twenty." are generated as separate takes ("3d cartoon" 227af074, 3 seeds
each, Whisper picks), trimmed of silence and joined with pauses. assemble.py plays every line at 1.1x tempo, so the
pauses are written 1.1x longer here: ~0.25 s after "going" and ~0.35 s between the years in the final voice.
Writes voice/l08.wav (the previous one is kept as voice/takes/l08v/l08_fast.wav)."""
import os, re, shutil, subprocess, urllib.request, uuid, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel

V = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(V, "takes", "l08v"); os.makedirs(T, exist_ok=True)
PROFILE, SR, TEMPO = "227af074", 44100, 1.1
PARTS = [("So he kept going.", 0.25), ("One year.", 0.35), ("Ten.", 0.35), ("Twenty.", 0.0)]


def gen(text, seed, out):
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
             {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())


def pcm(p, sr):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                                        capture_output=True, check=True).stdout, np.float32).copy()


def trim(x, thr_db=-28, pad=0.02):
    e = np.convolve(x ** 2, np.ones(441) / 441, "same"); on = np.where(10 * np.log10(e + 1e-12) > thr_db + 10 * np.log10(e.max()))[0]
    a, b = max(on[0] - int(pad * SR), 0), min(on[-1] + int(pad * SR), len(x))
    y = x[a:b].copy(); f = np.linspace(0, 1, 220, dtype=np.float32); y[:220] *= f; y[-220:] *= f[::-1]
    return y


norm = lambda s: re.sub(r"[^a-z ]", "", s.lower().replace("10", "ten").replace("20", "twenty"))
asr = WhisperModel("small.en", compute_type="int8")
if os.path.exists(os.path.join(V, "l08.wav")) and not os.path.exists(os.path.join(T, "l08_fast.wav")):
    shutil.copy(os.path.join(V, "l08.wav"), os.path.join(T, "l08_fast.wav"))
out = []
for k, (text, pause) in enumerate(PARTS):
    best = None
    for sd in (1, 2, 3):
        f = os.path.join(T, f"p{k}_s{sd}.wav")
        if not os.path.exists(f):
            gen(text, sd, f)
        heard = " ".join(s.text for s in asr.transcribe(pcm(f, 16000), language="en")[0])
        x = trim(pcm(f, SR)); sc = SequenceMatcher(None, norm(text), norm(heard)).ratio()
        print(f"{text!r} s{sd} {sc:.2f} {len(x) / SR:.2f}s | {heard.strip()}")
        if best is None or (sc, -len(x)) > (best[0], -len(best[1])):
            best = (sc, x, sd)
    print("  pick", text, "seed", best[2])
    out += [best[1], np.zeros(int(pause * TEMPO * SR), np.float32)]
y = np.concatenate(out)
with wave.open(os.path.join(V, "l08.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
print("l08", round(len(y) / SR, 2), "s (before the 1.1x tempo)")

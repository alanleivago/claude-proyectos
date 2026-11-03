"""venv: VoiceStudio "3d cartoon" (227af074) takes, 3 seeds per part; Whisper picks the take (ties -> shortest).
Line 1 and line 10 share the SAME "You're blind for about forty minutes every day." samples (p01a), so "forty
minutes" sounds identical: l10 = p10a + pause + "And" (cut from p10b) + p01a.  Writes voice/lXX.wav + script.json."""
import json, os, re, subprocess, urllib.request, uuid, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel

V = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(V, "takes"); PROFILE = "227af074"; SR = 44100
PARTS = {"p01a": "You're blind for about forty minutes every day.",
         "p01b": "And you've never noticed.",
         "p02": "Your eyes don't glide across things. They jump, three or four times a second.",
         "p03": "Mid-jump, everything would smear like a shaky phone video.",
         "p04": "So your brain just cuts the feed.",
         "p05": "Then it fills the gap with whatever you saw next, and lies about the timing.",
         "p06": "That's why the first tick of a clock sometimes lasts too long.",
         "p07": "Want proof? Find a mirror. Look at your left eye, then your right.",
         "p08": "You'll never see your own eyes move.",
         "p09": "Your friend standing behind you sees them move just fine.",
         "p10a": "Add up all those tiny blackouts.",
         "p10b": "And you're blind for about forty minutes every day."}
LINES = ["You're blind for about forty minutes every day. And you've never noticed."] + [PARTS[f"p{i:02d}"] for i in range(2, 10)] + \
        ["Add up all those tiny blackouts, and you're blind for about forty minutes every day."]


def gen(text, seed, out):
    b = uuid.uuid4().hex
    parts = [f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n' for k, v in
             {"text": text, "profile_id": PROFILE, "language": "en", "seed": str(seed), "speed": "1.0"}.items()]
    req = urllib.request.Request("http://localhost:3900/generate", data=("".join(parts) + f"--{b}--\r\n").encode(),
                                 headers={"Content-Type": f"multipart/form-data; boundary={b}"})
    open(out, "wb").write(urllib.request.urlopen(req, timeout=600).read())


def pcm(p, sr=16000):
    return np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"],
                                        capture_output=True).stdout, np.float32).copy()


def trim(x, thr=0.01):                       # strip leading/trailing silence (keep 30 ms)
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 1300):idx[-1] + 1300] if len(idx) else x


norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " "))
asr = WhisperModel("small.en", compute_type="int8"); best = {}
for k, text in PARTS.items():
    cand = None
    for sd in (1, 2, 3):
        f = f"{T}/{k}_s{sd}.wav"
        if not os.path.exists(f):
            gen(text, sd, f)
        x = pcm(f); heard = " ".join(s.text for s in asr.transcribe(x, language="en")[0])
        sc = SequenceMatcher(None, norm(text), norm(heard)).ratio(); dur = len(x) / 16000
        print(f"{k} s{sd} {sc:.2f} {dur:.2f}s | {heard.strip()}", flush=True)
        if cand is None or (round(sc, 2), -dur) > (round(cand[0], 2), -cand[1]):
            cand = (sc, dur, f)
    best[k] = cand

A = {k: trim(pcm(v[2], SR)) for k, v in best.items()}
# "And" out of p10b: cut at the energy minimum between "And" and "you're"
segs, _ = asr.transcribe(pcm(best["p10b"][2]), language="en", word_timestamps=True)
ws = [w for s in segs for w in s.words]
raw = pcm(best["p10b"][2], SR); lo, hi = int((ws[0].end - 0.03) * SR), int((ws[1].start + 0.05) * SR)
e = np.convolve(raw[lo:hi] ** 2, np.ones(441), "same"); cut = lo + int(np.argmin(e))
and_ = trim(raw[:cut]); and_[-330:] *= np.linspace(1, 0, 330, dtype=np.float32)
gap = lambda s: np.zeros(int(s * SR), np.float32)
L = {1: np.concatenate([A["p01a"], gap(0.30), A["p01b"]]),
     10: np.concatenate([A["p10a"], gap(0.22), and_, gap(0.05), A["p01a"]])}
for i in range(2, 10):
    L[i] = A[f"p{i:02d}"]
script = []
for i in range(1, 11):
    with wave.open(f"{V}/l{i:02d}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(L[i], -1, 1) * 32767).astype(np.int16).tobytes())
    script.append({"id": f"l{i:02d}", "text": LINES[i - 1], "file": f"l{i:02d}.wav"})
json.dump({"lines": script, "takes": {k: [os.path.basename(v[2]), round(v[0], 2)] for k, v in best.items()}},
          open(f"{V}/script.json", "w"), indent=1)
print({k: round(v[0], 2) for k, v in best.items()})

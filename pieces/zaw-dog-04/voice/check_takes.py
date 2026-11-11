"""venv: Whisper-check each take against the script, trim edge silence, write lXX.wav + script.json."""
import json, os, re, subprocess, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100
LINES = ["Pet another dog, and your dog thinks you're cheating.",
 "In its head, your hand is spoken for.",
 "You see, researchers had thirty-six owners ignore their dogs",
 "and pet something else right in front of them.",
 "A plastic pumpkin, a book, or a fake dog that barked and wagged.",
 "With the pumpkin, under half the dogs pushed in.",
 "With the fake dog, almost eighty percent did.",
 "A third squeezed between the owner and the rival.",
 "A quarter snapped at it.",
 "And eighty-six percent sniffed its butt, just to be sure.",
 "Years later, another team hid the fake dog behind a screen.",
 "The dogs couldn't see it, but still pulled their leash just as hard.",
 "With a fleece tube back there, they barely bothered.",
 "So expect a full inspection the second you"]
TAKE = {11: "d", 13: "b"}   # zaw-dog-04: retakes that keep "hid" and "fleece tube" through the retro EQ   # line -> take letter override (retro-EQ Whisper check)
pcm = lambda p, sr: np.frombuffer(subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar",str(sr),"-f","f32le","-"],capture_output=True).stdout, np.float32).copy()
def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]; return x[max(0, idx[0]-1300):idx[-1]+1300]
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " "))
asr = WhisperModel("small.en", compute_type="int8"); out = []
for i, t in enumerate(LINES, 1):
    f = f"{V}/takes/l{i:02d}_{TAKE.get(i,'a')}.wav"
    heard = " ".join(s.text for s in asr.transcribe(pcm(f, 16000), language="en")[0]).strip()
    a = trim(pcm(f, SR))
    print(f"l{i:02d} {SequenceMatcher(None, norm(t), norm(heard)).ratio():.2f} {len(a)/SR:.2f}s | {heard}")
    with wave.open(f"{V}/l{i:02d}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a,-1,1)*32767).astype(np.int16).tobytes())
    out.append({"id": f"l{i:02d}", "text": t, "file": f"l{i:02d}.wav"})
json.dump({"lines": out}, open(f"{V}/script.json", "w"), indent=1)

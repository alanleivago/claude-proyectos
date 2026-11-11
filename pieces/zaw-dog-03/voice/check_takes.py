"""venv: Whisper-check each take against the script, trim edge silence, write lXX.wav + script.json."""
import json, os, re, subprocess, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100
LINES = ["Start crying, and your dog thinks you're hurt.",
 "It has no idea what a sad movie is.",
 "You see, researchers had people fake-cry in front of eighteen dogs.",
 "Sometimes the owner, sometimes a stranger.",
 "They also hummed, or talked.",
 "Fifteen dogs came over to the crier.",
 "Humming got six.",
 "When the stranger cried, they went to her, not their owner.",
 "Most came in heads low, tails tucked.",
 "Another team shut owners behind a see-through door.",
 "The owner either cried or hummed \"Twinkle Twinkle\".",
 "About as many dogs opened it either way.",
 "But the ones that did were three times faster when the owner cried.",
 "So expect a nose in your face the second you"]
TAKE = {4: "c", 9: "c"}   # line -> take letter override (retro-EQ Whisper check)
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

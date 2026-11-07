"""venv: Whisper-check each take against the script, trim edge silence, write lXX.wav + script.json."""
import json, os, re, subprocess, wave
from difflib import SequenceMatcher
import numpy as np
from faster_whisper import WhisperModel
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100
LINES = ["Fake-throw the ball, and your dog might trust you a little less.",
 "Kyoto researchers tested something close, with a pointing finger.",
 "Two cups, one treat.",
 "Someone pointed at the treat, and most dogs went right to it.",
 "Then the same person pointed at a cup they'd just seen was empty.",
 "Then back to the treat.",
 "Far fewer dogs bothered.",
 "A new person pointed, and the dogs went.",
 "Dogs keep tabs on strangers too.",
 "In another Kyoto study, a stranger refused to help an owner open a container.",
 "Then that stranger and another one both offered the dog a snack.",
 "The dogs took the other one's snack more often.",
 "So think twice the next time you're about to"]
TAKE = {}   # line -> take letter override
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

"""venv: chosen take per line -> trimmed voice/lNN.wav + voice/script.json.  python voice/pick_takes.py"""
import json, os, subprocess, wave
import numpy as np
V = os.path.dirname(os.path.abspath(__file__)); SR = 44100
LINES = json.load(open(f"{V}/lines.json"))
TAKE = {2: 5, 6: 2, 11: 2, 14: 2}                     # line -> seed (default 1)
pcm = lambda p: np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout, np.float32).copy()
def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]; return x[max(0, idx[0] - 1300):idx[-1] + 1300]
out = []
for i, t in enumerate(LINES, 1):
    a = trim(pcm(f"{V}/takes/l{i:02d}_{TAKE.get(i, 1)}.wav"))
    with wave.open(f"{V}/l{i:02d}.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    out.append({"id": f"l{i:02d}", "text": t, "file": f"l{i:02d}.wav", "take": TAKE.get(i, 1)}); print(i, round(len(a) / SR, 2))
json.dump({"lines": out}, open(f"{V}/script.json", "w"), indent=1)

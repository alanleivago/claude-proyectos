"""Whisper stretches words back to the end of the previous one; move each start to the real voice onset (energy)."""
import json, subprocess, numpy as np
W = json.load(open("prep/words_whisper.json"))
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", "audio/voice.wav", "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
H = 160   # 10 ms frames
env = np.sqrt(np.convolve(x ** 2, np.ones(H) / H, "same"))[::H]
moved = []
for w in W:
    a, b = int(w["s"] * 100), int(w["e"] * 100)
    if b - a < 8: continue
    seg = env[a:b]; pk = seg.max()
    half = seg[: max(3, len(seg) // 2)]
    i0 = int(half.argmin())
    if half[i0] > pk * 0.2: continue              # no dip: connected speech, keep whisper's start
    on = next((i for i in range(i0, len(seg)) if seg[i] > max(pk * 0.25, half[i0] * 3)), i0)
    ns = round((a + on) / 100 - 0.02, 2)
    if ns - w["s"] > 0.06:
        moved.append((w["w"], w["s"], ns)); w["s"] = ns
json.dump(W, open("prep/words.json", "w"), indent=0)
print(len(moved), "moved"); print(moved[:20])

"""Ashton raw, first ~20 s: trim pauses ONLY inside silence (never inside a word) -> ash/edit.mp4 (29.97 fps) + ash/words_edit.json + ash/edl.json
Only true-silence runs (RMS < -20 dBFS) >= 0.12 s are shortened to 0.07 s."""
import json, subprocess, numpy as np
from pathlib import Path
R = Path(__file__).resolve().parent; RAW = r"D:\Alan\Fiverr Upwork trabajo fotos y videos\Crudos\Mios\2 ash.mp4"
ws = json.loads((R / "words_medium.json").read_text(encoding="utf-8")); db = np.load(R / "rms_db.npy")
END_SRC = 20.83                                      # inside the silence after "boca," (20.79-20.87, -25 dB)
FIX = {"Consigui\ufffd": "Consiguió", "d\ufffdas": "días", "subi\ufffd": "subió", "cambi\ufffd": "cambió", "ma\ufffdana,": "mañana,"}
segs = []; a = 0.0
# silence = runs of 10 ms frames under -20 dBFS (the raw is already cut tight: longest pause 0.15 s). Whisper word edges are NOT trusted (they fall inside
# consonants here); only true-silence runs >= 0.12 s are shortened to 0.07 s, cutting their middle.
q = db < -20; i = 13
while i < int(END_SRC * 100):
    if q[i]:
        j = i
        while j < len(q) and q[j]: j += 1
        if (j - i) >= 12 and j / 100 < END_SRC - 0.05:
            rem = (j - i) / 100 - 0.07; c0 = i / 100 + 0.035; c1 = c0 + rem
            print(f"pause {i/100:.2f}-{j/100:.2f} ({(j-i)/100:.2f}s, min {db[i:j].min():.1f} dB): cut {c0:.3f}-{c1:.3f}")
            segs.append((a, c0)); a = c1
        i = j
    else: i += 1
segs.append((a, END_SRC))
tot = sum(b - x for x, b in segs); print("segments", len(segs), "out duration", round(tot, 3))
def remap(t):
    o = 0.0
    for x, b in segs:
        if t <= b: return o + max(0, t - x)
        o += b - x
    return o
out = []
for w in ws:
    if w["s"] >= END_SRC: break
    out.append({"w": FIX.get(w["w"], w["w"]), "s": round(remap(w["s"]), 3), "e": round(remap(w["e"]), 3)})
(R / "words_edit.json").write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding="utf-8")
(R / "edl.json").write_text(json.dumps(segs))
vf = "".join(f"[0:v]trim={x:.3f}:{b:.3f},setpts=PTS-STARTPTS,fps=30000/1001[v{i}];" for i, (x, b) in enumerate(segs))
af = "".join(f"[0:a]atrim={x:.3f}:{b:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,afade=t=out:st={b - x - 0.006:.3f}:d=0.006[a{i}];" for i, (x, b) in enumerate(segs))
cat = "".join(f"[v{i}][a{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=1:a=1[v][a]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", RAW, "-filter_complex", vf + af + cat, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "14", "-preset", "fast",
                "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-ar", "48000", str(R / "edit.mov")], check=True, timeout=600)
print("ash/edit.mov")

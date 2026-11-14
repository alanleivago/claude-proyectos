"""Cut the raw take into one continuous edit (pauses tightened inside measured silence) + remap word times.

Writes assets/edit.mp4 (picture + processed voice) and prep/words_edit.json. Uses the analysis from ../stimulus-01.
"""
import json, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
RAW = ROOT.parent.parent / "Ref videos Dariel/Stimulus/raw footage/9.mp4"
VOICE = ROOT / "audio/voice.wav"
FPS = 24000 / 1001
RAW_DUR = float(__import__("subprocess").run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(RAW)], capture_output=True, text=True).stdout)

words = json.loads((HERE / "words.json").read_text())
pauses = json.loads((HERE / "pauses.json").read_text())
pauses[0]["quiet"] = [0.40, 0.81]   # user: the cut was inside "uniform" (onset 0.72 by RMS): resume at 0.709, still silence
snap = lambda s: round(round(s * FPS) / FPS, 4)
keep, cur = [], 0.0
for p in pauses:
    qs, qe = p["quiet"]
    if qe - qs < 0.40:
        continue
    keep.append((cur, snap(qs + 0.10))); cur = snap(qe - 0.10)
keep.append((cur, snap(min(words[-1]["e"] + 0.65, RAW_DUR - 0.05))))

segs, t = [], 0.0
for s, e in keep:
    segs.append({"src": s, "dur": round(e - s, 4), "at": round(t, 4)}); t += e - s

def m(src):
    for g in segs:
        if g["src"] - 0.001 <= src <= g["src"] + g["dur"] + 0.001:
            return round(g["at"] + src - g["src"], 3)
    g = min(segs, key=lambda g: min(abs(src - g["src"]), abs(src - g["src"] - g["dur"])))
    return round(g["at"] + min(max(src - g["src"], 0), g["dur"]), 3)

out = [{"i": i, "w": w["w"], "s": m(w["s"]), "e": m(w["e"])} for i, w in enumerate(words)]
(HERE / "words_edit.json").write_text(json.dumps({"segments": segs, "duration": round(t, 3), "words": out}, indent=1))

vf = "".join(f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}];" for i, (s, e) in enumerate(keep))
af = "".join(f"[1:a]atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,afade=t=out:st={e - s - 0.006:.4f}:d=0.006[a{i}];" for i, (s, e) in enumerate(keep))
cat = "".join(f"[v{i}][a{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[v][a]"
(ROOT / "assets").mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-i", str(VOICE), "-filter_complex", vf + af + cat,
                "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p",
                "-r", "24000/1001", "-c:a", "aac", "-b:a", "256k", str(ROOT / "assets/edit2.mp4")], check=True)   # edit.mp4 is locked by Premiere (roto source)
print(f"{len(segs)} shots, {t:.2f}s")

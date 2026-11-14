"""Client round 2026-11-10: cut 00:23-00:25 "only your club leaders see that extra part" (words 79-86).
The phrase is exactly edit segment 8 (at 22.9811-25.3585), whose borders already sit in measured silence
(RMS -45 dB after "store," / -65 dB before "And"). Drops that segment from assets/edit_v.mp4 -> new edit_v.mp4
(old one kept as edit_v_pre_cut.mp4; edit.mp4 = Premiere roto source, untouched) and remaps prep/words_edit.json
(old one kept as words_edit_pre_cut.json). Run once.
"""
import json, shutil, subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
A = ROOT / "assets"
WJ, WJ0 = HERE / "words_edit.json", HERE / "words_edit_pre_cut.json"
EV, EV0 = A / "edit_v.mp4", A / "edit_v_pre_cut.mp4"
if not WJ0.exists(): shutil.copyfile(WJ, WJ0)
if not EV0.exists(): shutil.copyfile(EV, EV0)
W = json.loads(WJ0.read_text())
SEG, W0, W1 = 8, 79, 86
g = W["segments"][SEG]
c0, c1 = g["at"], round(g["at"] + g["dur"], 4)
d = round(c1 - c0, 4)
assert W["words"][W0 - 1]["e"] < c0 < W["words"][W0]["s"] and W["words"][W1]["e"] < c1 < W["words"][W1 + 1]["s"]
segs = [dict(s) for k, s in enumerate(W["segments"]) if k != SEG]
for s in segs:
    if s["at"] >= c1 - 1e-6: s["at"] = round(s["at"] - d, 4)
words = []
for w in W["words"]:
    if W0 <= w["i"] <= W1: continue
    w = dict(w)
    if w["s"] >= c1: w["s"] = round(w["s"] - d, 3); w["e"] = round(w["e"] - d, 3)
    w["i"] = len(words); words.append(w)
WJ.write_text(json.dumps({"segments": segs, "duration": round(W["duration"] - d, 3), "words": words}, indent=1))

fc = (f"[0:v]trim=0:{c0},setpts=PTS-STARTPTS[v0];[0:v]trim=start={c1},setpts=PTS-STARTPTS[v1];"
      f"[0:a]atrim=0:{c0},asetpts=PTS-STARTPTS,afade=t=out:st={c0 - 0.006:.4f}:d=0.006[a0];"
      f"[0:a]atrim=start={c1},asetpts=PTS-STARTPTS,afade=t=in:d=0.006[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(EV0), "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "24000/1001",
                "-c:a", "aac", "-b:a", "256k", str(EV)], check=True)
print(f"cut {c0}-{c1} ({d} s), {len(W['words'])}->{len(words)} words, D {W['duration']}->{round(W['duration'] - d, 3)}")

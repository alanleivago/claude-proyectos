"""Ronda 4 (2026-11-11): cut_v10.py left a 2-frame leftover in the picture at 22.98 s: frames 551-552 = raw 10.mp4
frames 692-693, then frame 553 jumps to raw 708 (two cuts 2 frames apart). Replace frames 551-552 with raw 706-707
(the frames just before 708, same shot) -> one clean cut at frame 551. Audio copied untouched (keeps the 105 ms sync fix).
Backup: assets/edit_v_v4.mp4. Run once."""
import shutil, subprocess
from pathlib import Path
A = Path(__file__).resolve().parent.parent / "assets"
RAW = A.parent.parent.parent / "Ref videos Dariel/Stimulus/raw footage/10.mp4"
EV, BAK = A / "edit_v.mp4", A / "edit_v_v4.mp4"
assert not BAK.exists(), "already run"
shutil.copyfile(EV, BAK)
fc = ("[0:v]trim=start_frame=0:end_frame=551,setpts=PTS-STARTPTS[a];"
      "[1:v]trim=start_frame=706:end_frame=708,setpts=PTS-STARTPTS[b];"
      "[0:v]trim=start_frame=553,setpts=PTS-STARTPTS[c];"
      "[a][b][c]concat=n=3:v=1:a=0,setpts=N/(24000/1001)/TB[v]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(BAK), "-i", str(RAW), "-filter_complex", fc, "-map", "[v]", "-map", "0:a",
                "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", "-r", "24000/1001", "-c:a", "copy", str(EV)], check=True)

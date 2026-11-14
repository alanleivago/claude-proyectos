"""Round 3 (2026-11-11): client "raise the voice". Plain gain on the current edit_v.mp4 voice (music untouched),
a transparent look-ahead peak limiter only to keep the true peak under -1 dBTP (no compression). Backup: edit_v_v3.mp4."""
import shutil, subprocess
from pathlib import Path
A = Path(__file__).resolve().parent.parent / "assets"
EV, BAK = A / "edit_v.mp4", A / "edit_v_v3.mp4"
GAIN = 1.5
if not BAK.exists(): shutil.copyfile(EV, BAK)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(BAK), "-map", "0:v", "-map", "0:a", "-c:v", "copy",
                "-af", f"aresample=192000,volume={GAIN}dB,alimiter=limit=0.87:attack=2:release=60:level=disabled,aresample=48000",
                "-c:a", "aac", "-b:a", "256k", str(EV)], check=True)

"""Round 3 (2026-11-11): (1) lip sync. Measured (mouth-openness vs voice-envelope cross-correlation, template-tracked
mouth): raw 10.mp4 camera audio already lags the lips ~105 ms (raw 5.mp4: ~35 ms) and voice.wav adds +30 ms, edit_v +5 ms
-> edit_v voice ~140 ms behind the mouth. Advance the voice SHIFT s (audio only, picture untouched) so it sits where V5's does.
(2) client "raise the voice a bit": plain +GAIN dB, transparent look-ahead peak limiter only for true peak <= -1 dBTP.
Word times shift with the voice (captions/SFX stay on the words). Backups: edit_v_v3.mp4, words_edit_v3.json. Run once."""
import json, shutil, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent
A = HERE.parent / "assets"
SHIFT, GAIN = 0.105, 1.0
EV, BAK = A / "edit_v.mp4", A / "edit_v_v3.mp4"
WJ, WJB = HERE / "words_edit.json", HERE / "words_edit_v3.json"
assert not BAK.exists() and not WJB.exists(), "already run"
shutil.copyfile(EV, BAK); shutil.copyfile(WJ, WJB)
W = json.loads(WJB.read_text())
for w in W["words"]:
    w["s"], w["e"] = round(max(w["s"] - SHIFT, 0), 3), round(max(w["e"] - SHIFT, 0.01), 3)
WJ.write_text(json.dumps(W, indent=1))
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(BAK), "-map", "0:v", "-map", "0:a", "-c:v", "copy",
                "-af", f"atrim=start={SHIFT},asetpts=PTS-STARTPTS,apad=pad_dur={SHIFT + 0.05},aresample=192000,volume={GAIN}dB,"
                       "alimiter=limit=0.87:attack=2:release=60:level=disabled,aresample=48000",
                "-c:a", "aac", "-b:a", "256k", "-t", subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                "-of", "csv=p=0", str(BAK)], capture_output=True, text=True).stdout.strip(), str(EV)], check=True)

"""venv: Whisper on the FINAL mp4 audio: line 1 (with the bark in its gap) and the loop seam (last 2.4 s -> first 3.1 s).
python tools/whisper_check.py  -> review/whisper_final.txt"""
import glob, os, subprocess
import numpy as np
from faster_whisper import WhisperModel
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
mp4 = glob.glob(os.path.join(H, "renders", "*.mp4"))[0]
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
m = WhisperModel("medium.en", compute_type="int8"); out = []
def hear(seg, tag):
    segs, _ = m.transcribe(np.concatenate([np.zeros(4000, np.float32), seg]), language="en", beam_size=5, word_timestamps=True)
    ws = [(w.word.strip(), round(w.start - 0.25, 2)) for s in segs for w in s.words]
    out.append(f"{tag}: " + " ".join(w for w, _ in ws)); out.append("   words: " + str(ws))
hear(x[:int(3.1 * 16000)], "line 1 (0-3.1 s)")
hear(np.concatenate([x[-int(2.4 * 16000):], x[:int(3.1 * 16000)]]), "loop seam (end -> start)")
import json as _j
_T = _j.load(open(os.path.join(H, "voice", "timing.json")))["starts"] + [99]
for li in (10, 12):                                                                # lines 11 and 13 (re-recorded)
    hear(x[int((_T[li] - 0.1) * 16000):int((_T[li + 1] - 0.05) * 16000)], f"line {li + 1}")
open(os.path.join(H, "review", "whisper_final.txt"), "w").write("\n".join(out) + "\n"); print("\n".join(out))

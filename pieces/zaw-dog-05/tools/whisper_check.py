"""venv: Whisper (medium.en) on the FINAL mp4 audio: every line (spans from voice/timing.json), line 1 with the bark in its
gap (word times), and the loop seam (last 2.6 s -> first 3.2 s).  python tools/whisper_check.py -> review/whisper_final.txt"""
import glob, json, os, subprocess
from difflib import SequenceMatcher
import re
import numpy as np
from faster_whisper import WhisperModel
H = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
mp4 = glob.glob(os.path.join(H, "renders", "*.mp4"))[0]
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", mp4, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
T = json.load(open(os.path.join(H, "voice", "timing.json"))); S = [l["text"] for l in json.load(open(os.path.join(H, "voice", "script.json")))["lines"]]
m = WhisperModel("medium.en", compute_type="int8"); out = []
NUM = {"300": "three hundred", "20": "twenty", "6": "six"}
norm = lambda s: re.sub(r"[^a-z ]", "", " ".join(NUM.get(w, w) for w in s.lower().replace("-", " ").replace(",", "").split()))
def hear(seg, words=False):
    segs, _ = m.transcribe(np.concatenate([np.zeros(4000, np.float32), seg]), language="en", beam_size=5, word_timestamps=words)
    segs = list(segs); txt = " ".join(s.text for s in segs).strip()
    return txt, [(w.word.strip(), round(w.start - 0.25, 2)) for s in segs for w in (s.words or [])]
ends = T["starts"][1:] + [T["end"]]
for i, (a, b) in enumerate(zip(T["starts"], ends)):
    txt, _ = hear(x[int(max(0, a - 0.1) * 16000):int((b - 0.02) * 16000)])
    r = SequenceMatcher(None, norm(S[i]), norm(txt)).ratio()
    out.append(f"line {i + 1:2d} match {r:.2f} | heard: {txt} || script: {S[i]}")
txt, ws = hear(x[:int(3.2 * 16000)], True); out.append(f"line 1 + bark (0-3.2 s): {txt}"); out.append("   words: " + str(ws))
txt, _ = hear(np.concatenate([x[-int(2.6 * 16000):], x[:int(3.2 * 16000)]])); out.append(f"loop seam (end -> start): {txt}")
open(os.path.join(H, "review", "whisper_final.txt"), "w").write("\n".join(out) + "\n"); print("\n".join(out))

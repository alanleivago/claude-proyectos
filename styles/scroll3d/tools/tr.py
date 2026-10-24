"""Transcribe with word times (faster-whisper on CPU).
   usage: python tr.py <audio or video> <out.json> [lang=en]"""
import sys, json, subprocess
import numpy as np
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]; lang = sys.argv[3] if len(sys.argv) > 3 else "en"
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
m = WhisperModel("small" if lang == "en" else "medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe(a, word_timestamps=True, language=lang)
res = []
for s in segs:
    print(f"[{s.start:6.2f}-{s.end:6.2f}] {s.text.strip()}")
    res.append({"start": s.start, "end": s.end, "text": s.text.strip(), "words": [{"w": w.word, "s": w.start, "e": w.end} for w in s.words]})
json.dump(res, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

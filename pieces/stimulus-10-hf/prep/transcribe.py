"""Raw take -> audio/voice.wav (processed) + prep/words.json (word timestamps) + prep/pauses.json (measured silences).

python prep/transcribe.py <raw.mp4>
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from faster_whisper import WhisperModel

ROOT = Path(__file__).resolve().parent.parent
RAW = Path(sys.argv[1])
VOICE = ROOT / "audio/voice.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(RAW), "-vn", "-ac", "2", "-ar", "48000", "-af",
                "highpass=f=80,afftdn=nr=18:nf=-42:tn=1,agate=threshold=0.012:ratio=2:attack=5:release=180,acompressor=threshold=-20dB:ratio=3:attack=5:release=120:makeup=2,loudnorm=I=-15:TP=-2:LRA=7,alimiter=limit=0.79,volume=-1.8dB",
                str(VOICE)], check=True)

model = WhisperModel("medium.en", device="cpu", compute_type="int8")
pcm = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(VOICE), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                                   capture_output=True).stdout, np.int16).astype(np.float32) / 32768   # array input: avoids the PyAV open() bug
segs, _ = model.transcribe(pcm, word_timestamps=True, language="en", vad_filter=False)
words = [{"s": round(w.start, 3), "e": round(w.end, 3), "w": w.word.strip()} for s in segs for w in s.words]
(ROOT / "prep/words.json").write_text(json.dumps(words, indent=0))

# silences: 10 ms RMS frames under (floor + 10 dB) between consecutive words
a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(VOICE), "-ac", "1", "-ar", "16000", "-f", "s16le", "-"],
                                 capture_output=True).stdout, np.int16) / 32768
fr = 160
db = 20 * np.log10(np.sqrt(np.mean(a[: len(a) // fr * fr].reshape(-1, fr) ** 2, axis=1)) + 1e-9)
thr = np.percentile(db, 10) + 10
pauses = []
for w0, w1 in zip(words, words[1:]):
    lo, hi = int((w0["e"] - 0.08) * 100), int((w1["s"] + 0.08) * 100)
    q = db[lo:hi] < thr
    best, cur, start = (0, 0, 0), 0, 0
    for k, v in enumerate(q):
        if v:
            if cur == 0: start = k
            cur += 1
            if cur > best[0]: best = (cur, start, start + cur)
        else:
            cur = 0
    if best[0] >= 15:   # >= 150 ms of real silence
        pauses.append({"after": w0["w"], "before": w1["w"], "quiet": [round((lo + best[1]) / 100, 3), round((lo + best[2]) / 100, 3)], "len": best[0] / 100})
(ROOT / "prep/pauses.json").write_text(json.dumps(pauses, indent=1))
print(len(words), "words,", len(pauses), "pauses, dur", round(len(a) / 16000, 2))
print(" ".join(w["w"] for w in words))

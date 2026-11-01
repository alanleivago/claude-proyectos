"""venv: join voice/lXX.wav into voice/voice.wav (tight LPS pacing), word times with faster-whisper,
captions in 1-4 word blocks.
Writes voice/timing.json {starts, end, words, captions}."""
import json, os, re, subprocess
import numpy as np
from faster_whisper import WhisperModel

H = os.path.dirname(os.path.abspath(__file__)); V = os.path.join(H, "voice")
SR, GAP, PRE, TEMPO = 44100, 0.09, 0.15, 1.1
COMMA = {}                                      # l07 now carries its own pause (stressed "You see." + rest, joined)
S = json.load(open(os.path.join(V, "script.json")))
asr = WhisperModel("small.en", compute_type="int8")


def load(p, sr=SR):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


out = [np.zeros(int(PRE * SR), np.float32)]; t = PRE; starts = []; words = []
for i, L in enumerate(S["lines"]):
    a = load(os.path.join(V, L["file"]))
    segs, _ = asr.transcribe(load(os.path.join(V, L["file"]), 16000), language="en", word_timestamps=True)
    ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    for j, (w, s0, s1) in enumerate(ws):           # spoken comma: "You see, your brain..." gets a breath
        if w.lower().strip(",") in COMMA and j + 1 < len(ws):
            lo, hi = int((s1 - 0.04) * SR), int((ws[j + 1][1] + 0.04) * SR)
            e = np.convolve(a[lo:hi] ** 2, np.ones(441), "same")
            cut = lo + int(np.argmin(e)); pad = COMMA[w.lower().strip(",")]
            fd = np.linspace(1, 0, 330, dtype=np.float32)                          # 7.5 ms fades: no click at the gap
            a[cut - 330:cut] *= fd; a[cut:cut + 330] *= fd[::-1]
            a = np.concatenate([a[:cut], np.zeros(int(pad * SR), np.float32), a[cut:]])
            ws = ws[:j + 1] + [(x, p + pad, q + pad) for x, p, q in ws[j + 1:]]
            print("comma pause", w, "line", i, "at", round(t + cut / SR, 3))
    starts.append(round(t, 3))
    for w, s0, s1 in ws:
        words.append({"w": w, "s": round(t + s0, 3), "e": round(t + s1, 3), "line": i})
    out.append(a); t += len(a) / SR
    if i < len(S["lines"]) - 1:
        out.append(np.zeros(int(GAP * SR), np.float32)); t += GAP
out.append(np.zeros(int(0.6 * SR), np.float32)); t += 0.6     # tail: the last line ends, then a beat
v = np.concatenate(out)
import wave
with wave.open(os.path.join(V, "voice.wav"), "wb") as f:
    f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
    f.writeframes((np.clip(v, -1, 1) * 32767).astype(np.int16).tobytes())

# captions: lowercase, no punctuation, break at punctuation / line ends, max 3 words (4 if the last is short)
caps, cur = [], []
for j, w in enumerate(words):
    txt = re.sub(r"[^\w'%]", "", w["w"].lower())
    cur.append((txt, w))
    last = j == len(words) - 1 or words[j + 1]["line"] != w["line"]
    if last or re.search(r"[,.?!]$", w["w"]) or len(cur) >= 3:
        caps.append({"text": " ".join(c[0] for c in cur), "s": cur[0][1]["s"], "e": cur[-1][1]["e"]})
        cur = []
json.dump({"starts": starts, "end": round(t, 3), "words": words, "captions": caps}, open(os.path.join(V, "timing.json"), "w"), indent=1)
print("voice", round(t, 2), "s,", len(words), "words,", len(caps), "caption blocks")
print("starts", starts)

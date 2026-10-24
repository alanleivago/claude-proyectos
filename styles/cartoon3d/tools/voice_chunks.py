"""Genera la voz de un guion frase por frase con VoiceStudio, elige la toma más limpia y las une.

Por qué: una toma larga mete murmullos sueltos entre palabras y pausas largas. Por frase, con N tomas,
se elige la que (1) whisper transcribe igual al texto, (2) no tiene energía suelta antes/después de la voz
y (3) dura lo normal. Las frases se unen con pausas al ritmo de las refs (0.12 s tras coma / 0.2 s tras punto).

Uso: python voice_chunks.py guion.txt pieces/<name>/voice --voice d9ac3ed9 [--takes 2]
Salida: chunks/, voice.wav (48 kHz), words.json, report.txt
"""
import argparse, io, json, re, urllib.request
from pathlib import Path

import numpy as np
import soundfile as sf
import scipy.signal as ss

API = "http://127.0.0.1:3900/v1/audio/speech"
SR = 48000
SPEED = 1.0


def split(text):
    # sentences; long ones split at a comma near the middle so each chunk is 3-14 words
    out = []
    for s in re.split(r"(?<=[.?!])\s+", text.strip()):
        words = s.split()
        if len(words) > 16:
            cut = min((i for i, w in enumerate(words) if w.endswith(",") and 5 <= i <= len(words) - 5), key=lambda i: abs(i - len(words) / 2), default=None)
            if cut is not None:
                out += [" ".join(words[:cut + 1]), " ".join(words[cut + 1:])]; continue
        out.append(s)
    return out


def tts(text, voice, seed):
    body = json.dumps({"model": "omnivoice", "input": text, "voice": voice, "response_format": "wav", "num_step": 32, "language": "English", "seed": seed, "speed": SPEED}).encode()
    r = urllib.request.urlopen(urllib.request.Request(API, data=body, headers={"Content-Type": "application/json"}), timeout=600)
    a, sr = sf.read(io.BytesIO(r.read()), dtype="float32")
    a = a.mean(1) if a.ndim > 1 else a
    return ss.resample_poly(a, SR, sr).astype("float32") if sr != SR else a


def norm(t): return re.sub(r"[^a-z0-9 ]", "", t.lower().replace("%", " percent").replace("1 percent", "one percent")).split()


def score(a, text, model):
    segs, _ = model.transcribe(ss.resample_poly(a, 16000, SR).astype("float32"), language="en", word_timestamps=True)
    W = [w for s in segs for w in s.words]
    if not W: return 1e9, None, None
    got, want = norm(" ".join(w.word for w in W)), norm(text)
    import difflib
    miss = 1 - difflib.SequenceMatcher(None, got, want).ratio()
    s0, s1 = W[0].start, W[-1].end
    hop = int(0.02 * SR); db = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9) if len(x) else -99
    stray = max(db(a[max(0, int((s0 - 0.6) * SR)):max(0, int((s0 - 0.12) * SR))]), db(a[int((s1 + 0.25) * SR):]))   # loose sound outside the speech
    gaps = max([W[i + 1].start - W[i].end for i in range(len(W) - 1)] or [0])
    return miss * 100 + max(0, stray + 45) * 0.5 + max(0, gaps - 0.3) * 20, s0, s1


def trim_energy(a, s0, s1):
    """Cut to the voiced part by ENERGY (whisper's word ends are early): from 30 ms before the first frame above
    -38 dB near s0, to 70 ms after the last frame above -44 dB that follows s1 without a gap > 0.15 s."""
    hop = int(0.01 * SR); n = len(a) // hop
    db = 20 * np.log10(np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    i0 = max(0, int((s0 - 0.3) / 0.01)); 
    while i0 < n and db[i0] < -38: i0 += 1
    j = min(n - 1, int(s1 / 0.01)); last = j; quiet = 0
    while j < n and quiet < 15:
        if db[j] > -44: last = j; quiet = 0
        else: quiet += 1
        j += 1
    a = a[max(0, (i0 - 3) * hop):min(len(a), (last + 7) * hop)].copy()
    f = int(0.008 * SR); a[:f] *= np.linspace(0, 1, f); a[-f:] *= np.linspace(1, 0, f)
    return a


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("out"); ap.add_argument("--voice", default="d9ac3ed9"); ap.add_argument("--takes", type=int, default=2); ap.add_argument("--speed", type=float, default=1.0)
    o = ap.parse_args(); global SPEED; SPEED = o.speed; out = Path(o.out); (out / "chunks").mkdir(parents=True, exist_ok=True)
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3", device="cpu", compute_type="int8")
    lines = split(Path(o.script).read_text(encoding="utf-8")); rep = []; parts = []
    for i, line in enumerate(lines):
        best = None
        for k in range(o.takes):
            a = tts(line, o.voice, 1000 + i * 10 + k)
            sc, s0, s1 = score(a, line, model)
            rep.append(f"{i:02d}.{k} score {sc:6.1f}  {line}")
            if best is None or sc < best[0]: best = (sc, a, s0, s1)
        sc, a, s0, s1 = best
        sf.write(out / "chunks" / f"{i:02d}_raw.wav", a, SR)
        a = trim_energy(a, s0, s1)
        sf.write(out / "chunks" / f"{i:02d}.wav", a, SR); parts.append((line, a))
    y = []
    for i, (line, a) in enumerate(parts):
        y.append(a)
        if i + 1 < len(parts): y.append(np.zeros(int((0.16 if line[-1] in ".?!" else 0.08) * SR), "float32"))
    y = np.concatenate([np.zeros(int(0.05 * SR), "float32")] + y + [np.zeros(int(0.5 * SR), "float32")])
    sf.write(out / "voice.wav", y, SR)
    segs, _ = model.transcribe(ss.resample_poly(y, 16000, SR).astype("float32"), language="en", word_timestamps=True)
    W = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
    (out / "words.json").write_text(json.dumps(W, indent=1), encoding="utf-8")
    (out / "report.txt").write_text("\n".join(rep), encoding="utf-8")
    print(f"{len(lines)} chunks, {len(y) / SR:.2f} s, {len(W)} words, {len(W) / (W[-1]['e'] - W[0]['s']) * 60:.0f} wpm")


if __name__ == "__main__":
    main()

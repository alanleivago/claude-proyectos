"""Recorta las pausas de una voz al ritmo cartoon3d y temporiza cada palabra.

Método (tutorial + refs medidas): pausa tras oración ~0.20 s (nunca > 0.30 s), pausas internas <= 0.12 s.
Solo se corta dentro de silencios (huecos entre palabras de faster-whisper, y por debajo de -40 dB),
con fundidos de 10 ms: nunca dentro de una palabra.

Uso:
    python trim_voice.py voz.mp3 pieces/<name>/voice
Salida: voice.wav (48 kHz mono), words.json [{w, s, e}], y el informe en consola.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 48000
SENT, INNER, FADE = 0.20, 0.12, 0.010


def load(path):
    tmp = Path(path).with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-ac", "1", "-ar", str(SR), str(tmp)], check=True)
    a, _ = sf.read(str(tmp), dtype="float32"); tmp.unlink()
    return a


def words_of(a):
    from faster_whisper import WhisperModel
    import scipy.signal as ss
    a16 = ss.resample_poly(a, 1, 3).astype("float32")
    segs, _ = WhisperModel("large-v3", device="cpu", compute_type="int8").transcribe(a16, language="en", word_timestamps=True, beam_size=5)
    return [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]


def quiet_span(a, s, e, db=-40):
    """Inside [s, e] (seconds), the longest run whose 10 ms RMS stays under db."""
    i0, i1 = int(s * SR), int(e * SR); hop = int(0.01 * SR)
    if i1 - i0 < hop:
        return None
    seg = a[i0:i1]; n = len(seg) // hop
    rms = 20 * np.log10(np.sqrt((seg[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    best, cur = (0, 0), None
    for k, q in enumerate(rms < db):
        if q and cur is None: cur = k
        if (not q or k == n - 1) and cur is not None:
            end = k + 1 if q else k
            if end - cur > best[1] - best[0]: best = (cur, end)
            cur = None
    if best[1] - best[0] < 3:
        return None
    return s + best[0] * 0.01, s + best[1] * 0.01


def main():
    src, out = Path(sys.argv[1]), Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    a = load(src)
    W = words_of(a)
    cuts = []   # (from, to) seconds to remove
    for i in range(len(W) - 1):
        gap = W[i + 1]["s"] - W[i]["e"]
        keep = SENT if W[i]["w"][-1:] in ".?!" else INNER
        if gap <= keep + 0.03:
            continue
        q = quiet_span(a, W[i]["e"], W[i + 1]["s"])
        if not q:
            continue   # no true silence: never cut (whisper's word ends are early; a cut there clips the word — user)
        qs, qe = q
        qs = max(qs, W[i]["e"] + 0.08)   # keep at least 80 ms after whisper's word end (it marks ends early)
        remove = min(gap - keep, (qe - qs) - 2 * FADE)
        if remove > 0.02:
            mid = (qs + qe) / 2
            cuts.append((mid - remove / 2, mid + remove / 2))
    # lead-in / tail
    lead = 0.0   # never trim the head: the first word starts the piece
    parts, t = [], lead
    for c0, c1 in cuts:
        parts.append((t, c0)); t = c1
    # tail: keep everything until the audio has been silent (< -45 dB) for 0.25 s after the last word, plus 0.4 s
    hop = int(0.01 * SR); end = int(W[-1]["e"] * SR); quiet = 0
    while end + hop < len(a) and quiet < 25:
        quiet = quiet + 1 if 20 * np.log10(np.sqrt((a[end:end + hop] ** 2).mean()) + 1e-9) < -45 else 0
        end += hop
    parts.append((t, min(len(a) / SR, end / SR + 0.4)))
    f = int(FADE * SR); ramp = np.linspace(0, 1, f, dtype="float32")
    chunks = []
    for p0, p1 in parts:
        c = a[int(p0 * SR):int(p1 * SR)].copy()
        c[:f] *= ramp; c[-f:] *= ramp[::-1]
        chunks.append(c)
    y = np.concatenate(chunks)
    sf.write(str(out / "voice.wav"), y, SR)

    def remap(x):
        removed = lead + sum(min(c1, x) - c0 for c0, c1 in cuts if x > c0)
        return round(x - removed, 3)
    W2 = [{"w": w["w"], "s": remap(w["s"]), "e": remap(w["e"])} for w in W]
    (out / "words.json").write_text(json.dumps(W2, ensure_ascii=False, indent=1), encoding="utf-8")
    sent = [round(W2[i + 1]["s"] - W2[i]["e"], 3) for i in range(len(W2) - 1) if W2[i]["w"][-1:] in ".?!"]
    dur = len(y) / SR
    print(f"original {len(a) / SR:.2f}s -> {dur:.2f}s ({len(cuts)} cortes, {len(a) / SR - dur:.2f}s de silencio fuera)")
    print(f"palabras {len(W2)}, {len(W2) / (W2[-1]['e'] - W2[0]['s']) * 60:.0f} wpm, pausas fin de oración: {sent}")


if __name__ == "__main__":
    main()

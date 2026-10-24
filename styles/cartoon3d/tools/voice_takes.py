"""Varias tomas completas de VoiceStudio (semillas distintas), elige la más limpia y la pule.

Puntúa cada toma con whisper: palabras que faltan o sobran, murmullos sueltos (energía entre -40 y -22 dB que
no cae dentro de ninguna palabra), pausas > 0.3 s y finales de palabra cortados (la energía cae de golpe).
La elegida se pule: los murmullos sueltos se silencian y las pausas de silencio real > 0.28 s se acortan a 0.2.

Uso: python voice_takes.py script.txt pieces/<name>/voice --voice d9ac3ed9 --takes 4
"""
import argparse, difflib, io, json, re, urllib.request
from pathlib import Path

import numpy as np, soundfile as sf, scipy.signal as ss

API = "http://127.0.0.1:3900/v1/audio/speech"; SR = 48000; HOP = 0.01


def tts(text, voice, seed):
    body = json.dumps({"model": "omnivoice", "input": text, "voice": voice, "response_format": "wav", "num_step": 32, "language": "English", "seed": seed}).encode()
    r = urllib.request.urlopen(urllib.request.Request(API, data=body, headers={"Content-Type": "application/json"}), timeout=900)
    a, sr = sf.read(io.BytesIO(r.read()), dtype="float32"); a = a.mean(1) if a.ndim > 1 else a
    return ss.resample_poly(a, SR, sr).astype("float32") if sr != SR else a


def words(a, model):
    segs, _ = model.transcribe(ss.resample_poly(a, 16000, SR).astype("float32"), language="en", word_timestamps=True)
    return [{"w": w.word.strip(), "s": w.start, "e": w.end} for s in segs for w in s.words]


def norm(t): return re.sub(r"[^a-z0-9 ]", " ", t.lower().replace("%", " percent ")).split()


def frames_db(a):
    h = int(HOP * SR); n = len(a) // h
    return 20 * np.log10(np.sqrt((a[:n * h].reshape(n, h) ** 2).mean(1)) + 1e-9)


def analyse(a, W, text):
    db = frames_db(a); n = len(db); inword = np.zeros(n, bool)
    for w in W: inword[int(w["s"] / HOP):min(n, int((w["e"] + 0.12) / HOP))] = True   # whisper ends early: +120 ms
    loose = (~inword) & (db > -40) & (db < -22)
    lab = np.diff(np.concatenate([[0], loose.astype(int), [0]])); st, en = np.where(lab == 1)[0], np.where(lab == -1)[0]
    murmurs = [(s * HOP, e * HOP) for s, e in zip(st, en) if e - s >= 4]
    gaps = [(W[i]["e"], W[i + 1]["s"]) for i in range(len(W) - 1) if W[i + 1]["s"] - W[i]["e"] > 0.3]
    miss = 1 - difflib.SequenceMatcher(None, norm(" ".join(w["w"] for w in W)), norm(text)).ratio()
    return miss, murmurs, gaps


def polish(a, W, murmurs):
    a = a.copy(); f = int(0.01 * SR)
    for s, e in murmurs:   # silence loose murmurs (short fades)
        i, j = int(s * SR), int(e * SR); a[i:j] = 0; a[max(0, i - f):i] *= np.linspace(1, 0, min(f, i)); a[j:j + f] *= np.linspace(0, 1, len(a[j:j + f]))
    db = frames_db(a); out = []; t = 0
    for i in range(len(W) - 1):   # shorten long TRUE silences between words to 0.2 s
        s, e = W[i]["e"] + 0.12, W[i + 1]["s"] - 0.03
        if e - s > 0.2 and (db[int(s / HOP):int(e / HOP)] < -45).all():
            cut0 = s + 0.1; cut1 = e - 0.1 + 0.0
            if cut1 - cut0 > 0.02: out.append((cut0, cut1))
    lead = max(0.0, min(W[0]["s"] - 0.08, 0.3)) if (db[:max(1, int((W[0]["s"] - 0.05) / HOP))] < -40).all() else 0.0
    parts, t = [], lead
    for c0, c1 in out: parts.append((t, c0)); t = c1
    parts.append((t, len(a) / SR))
    y = np.concatenate([a[int(p0 * SR):int(p1 * SR)] for p0, p1 in parts])
    return y, [(c0, c1) for c0, c1 in out], lead


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("script"); ap.add_argument("out"); ap.add_argument("--voice", default="d9ac3ed9"); ap.add_argument("--takes", type=int, default=4); ap.add_argument("--seed", type=int, default=7)
    o = ap.parse_args(); out = Path(o.out); (out / "takes").mkdir(parents=True, exist_ok=True)
    from faster_whisper import WhisperModel
    model = WhisperModel("large-v3", device="cpu", compute_type="int8"); text = Path(o.script).read_text(encoding="utf-8").strip()
    best = None
    for k in range(o.takes):
        p = out / "takes" / f"take_{o.seed + k}.wav"
        a = sf.read(p, dtype="float32")[0] if p.exists() else tts(text, o.voice, o.seed + k)
        sf.write(p, a, SR); W = words(a, model); miss, mur, gaps = analyse(a, W, text)
        sc = miss * 300 + len(mur) * 3 + sum(min(e - s, 1.0) for s, e in mur) * 10 + len(gaps)
        print(f"take {o.seed + k}: {len(a) / SR:.1f}s  miss {miss:.3f}  murmurs {len(mur)}  long gaps {len(gaps)}  score {sc:.1f}", flush=True)
        if best is None or sc < best[0]: best = (sc, k, a, W, mur)
    sc, k, a, W, mur = best
    y, cuts, lead = polish(a, W, mur)
    sf.write(out / "voice.wav", np.concatenate([y, np.zeros(int(0.3 * SR), "float32")]), SR)
    W2 = words(y, model); (out / "words.json").write_text(json.dumps([{"w": w["w"], "s": round(w["s"], 3), "e": round(w["e"], 3)} for w in W2], indent=1), encoding="utf-8")
    print(f"chose take {o.seed + k}: {len(mur)} murmurs silenced, {len(cuts)} long pauses shortened -> {len(y) / SR:.2f}s, {len(W2) / (W2[-1]['e'] - W2[0]['s']) * 60:.0f} wpm")


if __name__ == "__main__":
    main()

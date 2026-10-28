# Voz del remake: cada linea en su tiempo de la referencia -> track.wav (48 kHz mono, HPF 170 + comp suave)
# + whisper por palabra (verifica contra el guion) -> ../engine/timeline.json (formato del motor Mechayuki:
# words [caption, start, end, linea, texto], mouth a 15 fps). python assemble.py
import json, re, subprocess, numpy as np, soundfile as sf
from faster_whisper import WhisperModel

HERE = r"F:/Claude Proyectos/pieces/zombie-01-door/voz"
LINES = json.load(open(f"{HERE}/lines.json", encoding="utf-8"))
SR, DUR = 48000, 49.0

def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-af", "highpass=f=170,acompressor=threshold=-20dB:ratio=3:attack=5:release=80",
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)

track = np.zeros(int(DUR * SR), np.float32)
m = WhisperModel("small", device="cpu", compute_type="int8")
words, report, prev_end = [], [], 0
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " ")).split()
import os
def trim(x):   # recorta silencios sin comerse consonantes suaves: umbral -45 dB del pico, margen 80/180 ms
    H0 = int(0.01 * SR); r = np.array([np.sqrt(np.mean(x[i:i + H0] ** 2)) for i in range(0, len(x) - H0, H0)])
    nz = np.where(r > r.max() * 10 ** (-45 / 20))[0]
    return x[max(0, nz[0] * H0 - int(0.08 * SR)):min(len(x), nz[-1] * H0 + H0 + int(0.18 * SR))]
for p, (lid, starts, _, text) in enumerate(LINES, 1):
    if os.path.exists(f"{HERE}/lines/{lid}_0.wav"):   # una toma por parte: se concatenan con 0,4 s de silencio y se corta en el silencio
        xs = [trim(load(f"{HERE}/lines/{lid}_{j}.wav")) for j in range(len(starts))]
        gap = np.zeros(int(0.4 * SR), np.float32); x = np.concatenate(sum([[v, gap] for v in xs], [])[:-1])
        SEP = [sum(len(v) + len(gap) for v in xs[:j]) - len(gap) // 2 for j in range(1, len(xs))]
    else:
        x = load(f"{HERE}/lines/{lid}.wav"); SEP = None
    if SEP is None: x = trim(x)
    segs, _ = m.transcribe(np.concatenate([np.zeros(8000, np.float32), x[::3], np.zeros(8000, np.float32)]), language="en", word_timestamps=True)
    ws = [(w.word.strip(), w.start - 0.5, w.end - 0.5) for s_ in segs for w in s_.words]
    if SEP is not None:   # tomas separadas: palabras de cada toma por separado (en la union whisper estiraba "that" sobre el silencio)
        ws, off = [], 0
        for v in xs:
            sg, _ = m.transcribe(np.concatenate([np.zeros(8000, np.float32), v[::3], np.zeros(8000, np.float32)]), language="en", word_timestamps=True)
            rv = np.array([np.sqrt(np.mean(v[i:i + 480] ** 2)) for i in range(0, len(v) - 480, 480)]); on = np.argmax(rv > rv.max() * 0.1) * 0.01
            wv = [[w.word.strip(), w.start - 0.5 + off, w.end - 0.5 + off] for s_ in sg for w in s_.words]
            wv[0][1] = max(wv[0][1], off + on)                 # whisper estira la 1a palabra sobre el silencio inicial
            ws += [tuple(w) for w in wv]; off += (len(v) + int(0.4 * SR)) / SR
        ws = [(w[0], w[1], min(w[2], ws[i + 1][1]) if i + 1 < len(ws) else w[2]) for i, w in enumerate(ws)]
    heard = " ".join(w[0] for w in ws); ok = norm(heard) == norm(text)
    tt = re.findall(r"[\w'’-]+[…,.]*", text)
    tw = tt if len(tt) == len(ws) else [w[0] for w in ws]
    # cortes: tras cada palabra con "…" (en el punto mas silencioso de la pausa); si whisper cuenta distinto,
    # se busca la misma palabra en lo oido
    cuts = []
    for k, w in enumerate(tt[:-1]):
        if "…" not in w or len(cuts) >= len(starts) - 1: continue
        if len(tt) == len(ws): cuts.append(k); continue
        key = norm(w)[0]; cand = [i for i, v in enumerate(ws) if norm(v[0])[:1] == [key]]
        cuts.append(min(cand, key=lambda i: abs(i - k)))
    bounds = [0]
    H = int(0.01 * SR)
    for k in cuts:   # corte en el centro del tramo silencioso mas largo entre las dos palabras (nunca dentro de una palabra)
        a0, b0 = int((ws[k][2] - 0.1) * SR), int((ws[k + 1][1] + 0.1) * SR)
        e = np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(a0, b0 - H, H)])
        q = e < e.min() * 2.0 + 1e-4; best, run, st = (0, 0), 0, 0
        for i, v in enumerate(q):
            if v: run = run + 1 if run else 1; st = i - run + 1
            else: run = 0
            if run > best[1]: best = (st, run)
        bounds.append(a0 + (best[0] + best[1] // 2) * H + H // 2)
    if SEP is not None: bounds = [0] + SEP
    bounds.append(len(x))
    for j, t0 in enumerate(starts):
        piece = x[bounds[j]:bounds[j + 1]].copy(); f, g = int(0.005 * SR), int(0.03 * SR); piece[:f] *= np.linspace(0, 1, f); piece[-g:] *= np.linspace(1, 0, g)
        rr = np.array([np.sqrt(np.mean(piece[i:i + H] ** 2)) for i in range(0, len(piece) - H, H)]); vz = np.where(rr > rr.max() * 10 ** (-40 / 20))[0]
        lead, speech = vz[0] * H / SR, (vz[-1] - vz[0] + 1) * H / SR      # el sonido (no el margen de silencio) cae en t0
        t0 = max(t0, prev_end + 0.12)
        i0 = max(0, int((t0 - lead) * SR)); track[i0:i0 + len(piece)] += piece
        shift = i0 / SR - bounds[j] / SR
        for k, w in enumerate(ws):
            lo = -9 if j == 0 else bounds[j] / SR - 0.08; hi = 99 if j == len(starts) - 1 else bounds[j + 1] / SR - 0.08
            if lo <= w[1] < hi:
                words.append([tw[k], round(max(t0, w[1] + shift), 3), round(max(t0 + 0.05, w[2] + shift), 3), p, tw[k]])
        prev_end = t0 + speech
        report.append(f"{lid:12s} part{j} {t0:5.2f}-{prev_end:5.2f} {'OK ' if ok else 'DIF'} | {heard if j == 0 else ''}")
        heardp = " ".join(v[0] for s_ in m.transcribe(np.concatenate([np.zeros(8000, np.float32), piece[::3], np.zeros(8000, np.float32)]), language="en")[0] for v in [(s_.text,)])
        report.append(f"   part{j} oye: {heardp.strip()}")
track /= max(1e-6, np.abs(track).max()) / 0.89
sf.write(f"{HERE}/track.wav", track, SR)
print("\n".join(report))

# boca a 15 fps
def syl(word):
    g = re.findall(r"[aeiouy]+", word.lower()) or ["a"]
    return ["O" if re.search(r"[ou]", v) else "A" for v in g]
H = int(0.01 * SR); env = np.array([np.sqrt(np.mean(track[i:i + H] ** 2)) for i in range(0, len(track) - H, H)])
db = 20 * np.log10(env + 1e-9)
N = int(DUR * 15) + 1; mouth = ["-"] * N
for w in words:
    sy = syl(w[0]); s, e = w[1], max(w[2], w[1] + 0.07)
    for f in range(int(s * 15), int(e * 15) + 1):
        t = (f + 0.5) / 15
        if t < s or t > e + 0.03 or f >= N: continue
        seg = db[int(f / 15 * 100):int((f + 1) / 15 * 100)]
        if len(seg) == 0 or seg.max() < -34: continue
        mouth[f] = sy[min(len(sy) - 1, int((t - s) / (e - s + 1e-6) * len(sy)))]
def cap(t): return re.sub(r"[…\".,:]", "", t).lower()
out = dict(voice="ava", dur=DUR, words=[[cap(w[0]), w[1], w[2], w[3], w[4]] for w in words], mouth="".join(mouth))
import os; os.makedirs(f"{HERE}/../engine", exist_ok=True)
json.dump(out, open(f"{HERE}/../engine/timeline.json", "w", encoding="utf-8"), ensure_ascii=False)
print("words", len(words), "mouth open", sum(c != "-" for c in mouth), "/", N)

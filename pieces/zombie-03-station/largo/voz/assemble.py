# Voz del LARGO: pone las tomas de takes.py en fila (sin cortar nunca dentro de una toma) -> track.wav (48 kHz mono) y
# ../engine/timeline.json (mismo formato que el corto + takes/takeChapter/chapters). Base: ../../voz/assemble.py.
# - Ava/policia: HPF 170 + compresion suave (como el corto). Radio: banda 400-3000 Hz + saturacion suave + compresion, y una tos
#   real (Freesound CC0, ../audio/cand/cough) tras cada toma de radio, tambien por la radio.
# - Recorte -45 dB del pico con margen 80/180 ms; el primer SONIDO de cada toma cae en su hora; pausa = la de takes.py
#   (<= 0.5 s; 1.0 s al cerrar capitulo para la tarjeta a maquina).
# - Palabras por toma con faster-whisper (small, cpu int8, arrays numpy); la 1a palabra se fija al inicio real del sonido.
# python assemble.py
import json, re, os, subprocess, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
from takes import T, CH
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
COUGH = json.load(open(f"{HERE}/../audio/cough_pick.json"))["file"] if os.path.exists(f"{HERE}/../audio/cough_pick.json") else None
FX = {"ava": "highpass=f=170,acompressor=threshold=-20dB:ratio=3:attack=5:release=80",
      "cop": "highpass=f=170,acompressor=threshold=-20dB:ratio=3:attack=5:release=80",
      "marla": "highpass=f=200,lowpass=f=2200,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,volume=2dB",   # tras la puerta
      "radio": "highpass=f=400,highpass=f=400,lowpass=f=3000,lowpass=f=3000,volume=9dB,asoftclip=type=tanh,volume=-6dB,"
               "acompressor=threshold=-22dB:ratio=4:attack=3:release=60"}

def load(path, who):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-af", FX[who], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()
H = int(0.01 * SR)
def env(x): return np.array([np.sqrt(np.mean(x[i:i + H] ** 2)) for i in range(0, max(1, len(x) - H), H)])
def trim(x, db=-45):
    r = env(x); nz = np.where(r > r.max() * 10 ** (db / 20))[0]
    return x[max(0, nz[0] * H - int(0.08 * SR)):min(len(x), nz[-1] * H + H + int(0.25 * SR))]   # v2: margen final 250 ms (se comia el final de "four")
m = WhisperModel("small", device="cpu", compute_type="int8")
def wwords(x):
    pad = np.zeros(8000, np.float32)
    sg, _ = m.transcribe(np.concatenate([pad, x[::3], pad]), language="en", word_timestamps=True)
    return [[w.word.strip(), w.start - 0.5, w.end - 0.5] for s_ in sg for w in s_.words]

def source(tid, who, reuse):
    if reuse is None: return trim(load(f"{HERE}/takes/{tid}.wav", who))
    if reuse.startswith("take:"): return trim(load(f"{HERE}/takes/{reuse[5:]}.wav", who))
    if reuse.startswith("r1:"):   # 2a frase de la emision ("Help arrives in seven days."), cortada en sus silencios
        x = trim(load(f"{HERE}/takes/r1.wav", "radio")); ws = wwords(x)
        i0 = next(i for i, w in enumerate(ws) if w[0].lower().startswith("help")); i1 = next(i for i, w in enumerate(ws) if w[0].lower().startswith("days"))
        def quiet(a, b):   # punto mas silencioso entre a y b (s)
            e = env(x[int(a * SR):int(b * SR)]); return a + (int(np.argmin(e)) + 0.5) * 0.01
        a = quiet(ws[i0 - 1][2] - 0.05, ws[i0][1] + 0.03) if i0 else 0
        b = quiet(ws[i1][2] - 0.02, ws[i1 + 1][1] + 0.05) if i1 + 1 < len(ws) else len(x) / SR
        return trim(x[int(a * SR):int(b * SR)])
    return trim(load(f"{HERE}/lines/{reuse}.wav", who))


import difflib
from num2words import num2words
SPLIT = {"9mm": ["nine", "millimeter"], "db": ["decibels"], "247": ["two", "forty", "seven"], "314": ["three", "fourteen"], "k9": ["k", "9"]}
def ntok(w):   # palabra -> tokens normalizados (cifras en letra)
    w = w.lower().replace("’", "'")
    if re.sub(r"[^a-z0-9]", "", w) in SPLIT: return SPLIT[re.sub(r"[^a-z0-9]", "", w)]
    w = re.sub(r"\d+", lambda g: " " + num2words(int(g.group())) + " ", w)
    return [t for t in re.sub(r"[^a-z0-9' ]", " ", w.replace("-", " ")).split() if t not in ("and",) or True]
def align(tt, ws):
    # tokens finos de lo oido, con el tiempo de su palabra repartido a partes iguales
    fine = []
    for w, a, b in ws:
        ts = ntok(w) or [w.lower()]
        for i, t_ in enumerate(ts): fine.append([t_, a + (b - a) * i / len(ts), a + (b - a) * (i + 1) / len(ts)])
    # tokens del guion (cada palabra del guion puede ser varios tokens: "forty-seven", "A.M.")
    sc = [(k, t_) for k, w in enumerate(tt) for t_ in (ntok(w) or [w.lower()])]
    sm = difflib.SequenceMatcher(a=[x[1] for x in sc], b=[f[0] for f in fine], autojunk=False)
    tim = [None] * len(sc)
    for blk in sm.get_matching_blocks():
        for i in range(blk.size): tim[blk.a + i] = fine[blk.b + i][1:]
    # huecos: interpolar entre vecinos
    for i in range(len(sc)):
        if tim[i] is None:
            pa = next((tim[j][1] for j in range(i - 1, -1, -1) if tim[j]), fine[0][1])
            nb = next((tim[j][0] for j in range(i + 1, len(sc)) if tim[j]), fine[-1][2])
            run = [j for j in range(len(sc)) if tim[j] is None]
            tim[i] = [pa, max(pa + 0.05, nb)] if nb > pa else [pa, pa + 0.1]
    out = []
    for k, w in enumerate(tt):
        ix = [i for i, x in enumerate(sc) if x[0] == k]
        out.append([w, tim[ix[0]][0], tim[ix[-1]][1]])
    return out

pieces, t = [], 0.3
words, report, chapters, prev = [], [], [], None
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " ")).split()
cough = trim(load(COUGH, "radio"), -40) * 0.8 if COUGH else None
for p, (tid, ch, who, text, reuse, gap) in enumerate(T, 1):
    x = source(tid, who, reuse)
    f, g = int(0.005 * SR), int(0.03 * SR); x[:f] *= np.linspace(0, 1, f); x[-g:] *= np.linspace(1, 0, g)
    r = env(x); vz = np.where(r > r.max() * 10 ** (-40 / 20))[0]; lead, speech = vz[0] * 0.01, (vz[-1] - vz[0] + 1) * 0.01
    if ch != prev: chapters.append([ch, CH[ch], round(t, 3)]); prev = ch
    ws = wwords(x); ws[0][1] = max(ws[0][1], lead)
    ws = [[w[0], w[1], min(w[2], ws[i + 1][1]) if i + 1 < len(ws) else w[2]] for i, w in enumerate(ws)]
    tt = re.findall(r"[\w'’-]+[…,.?:]*", text)
    if len(tt) != len(ws): ws = align(tt, ws)   # whisper escribe cifras ("160 dB", "247"): se reparten en las palabras del guion
    tw = tt
    i0 = int((t - lead) * SR); pieces.append((i0, x, who))
    for k, w in enumerate(ws): words.append([tw[k], round(t - lead + w[1], 3), round(t - lead + max(w[2], w[1] + 0.05), 3), p, tw[k]])
    heard = " ".join(w[0] for w in ws); ok = norm(heard) == norm(text)
    report.append(f"{'OK ' if ok else 'DIF'} {tid:4s} {t:7.2f}-{t + speech:7.2f} {who:5s} | {heard}")
    t += speech
    if who == "radio" and cough is not None:   # tos al final de la emision (la misma en cada repeticion)
        tc = t + 0.18; pieces.append((int(tc * SR), cough, "radio")); words.append(["*cough*", round(tc, 3), round(tc + 0.4, 3), p, "*cough*"])
        t = tc + len(cough) / SR - 0.12
    t += gap
DUR = round(t + 6.0, 2)
track = np.zeros(int(DUR * SR), np.float32)
for i0, x, who in pieces: track[i0:i0 + len(x)] += x * (0.8 if who == "radio" else 1.0)
track /= max(1e-6, np.abs(track).max()) / 0.89
sf.write(f"{HERE}/track.wav", track, SR)
print("\n".join(report))

def syl(word):
    g = re.findall(r"[aeiouy]+", word.lower()) or ["a"]
    return ["O" if re.search(r"[ou]", v) else "A" for v in g]
db = 20 * np.log10(env(track) + 1e-9)
N = int(DUR * 15) + 1; mouth = ["-"] * N
for w in words:
    if T[w[3] - 1][2] != "ava" or w[0] == "*cough*": continue   # la boca de Ava solo con su voz
    sy = syl(w[0]); s, e = w[1], max(w[2], w[1] + 0.07)
    for fr in range(int(s * 15), int(e * 15) + 1):
        tf = (fr + 0.5) / 15
        if tf < s or tf > e + 0.03 or fr >= N: continue
        sg = db[int(fr / 15 * 100):int((fr + 1) / 15 * 100)]
        if len(sg) == 0 or sg.max() < -34: continue
        mouth[fr] = sy[min(len(sy) - 1, int((tf - s) / (e - s + 1e-6) * len(sy)))]
cap = lambda s: re.sub(r"[…\".,:?]", "", s).lower()
words = [w for w in words if w[0] != "*cough*"]
out = dict(voice="ava", dur=DUR, takes=[x[0] for x in T], takeChapter={x[0]: x[1] for x in T}, chapters=chapters,
           words=[[cap(w[0]), w[1], w[2], w[3], w[4]] for w in words], mouth="".join(mouth))
json.dump(out, open(f"{HERE}/../engine/timeline.json", "w", encoding="utf-8"), ensure_ascii=False)
gaps = [round(b[1] - a[2], 2) for a, b in zip(words, words[1:]) if T[b[3] - 1][1] == T[a[3] - 1][1] and b[1] - a[2] > 0.55]
print("DUR", DUR, "words", len(words), "dead air >0.55 s dentro de capitulo:", gaps)

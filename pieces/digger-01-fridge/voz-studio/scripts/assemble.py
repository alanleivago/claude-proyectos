# Assemble one voice track per voice from the per-paragraph processed WAVs (v2), with natural pauses, cutting only in silence.
# Then word timings (faster-whisper small, cpu int8, wave+numpy) on the assembled track, aligned to the script words.
# usage: assemble.py VOICE PRESET   -> v2/<VOICE>_track.wav + v2/<VOICE>_words.json
import sys, os, re, json, wave, difflib, numpy as np, soundfile as sf
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
V, PRE = sys.argv[1], sys.argv[2]
HERE = r"F:/Claude Proyectos/pieces/digger-01-fridge/voz-studio/v2"
g = open(r"F:/Claude Proyectos/pieces/digger-01-fridge/guion.md", encoding="utf-8").read()
pars = [p.strip() for p in g.split("target ~75 s)")[1].split("\n---")[0].split("\n\n") if p.strip()]
# pause AFTER paragraph i (1-based); default 0.42 s. Hook (p1) and payoff setup (before p11) longer, sign-off longer.
GAP = {1: 0.62, 2: 0.42, 3: 0.75, 4: 0.85, 5: 0.5, 6: 0.55, 7: 0.45, 8: 0.45, 9: 0.4, 10: 0.65, 11: 0.5, 12: 0.45, 13: 0.62}   # v2: longer after "icehouse" and after "Gross"
# extra silence inserted INSIDE a paragraph after the given script word index (only if the gap there is silent)
INNER = {5: [("underneath", 0.22)], 3: [("summer", 0.1)], 4: [("swimming.", 0.5)], 14: [("understood.", 0.18)]}   # v2: "Gross" gets room
REPLAY = sys.argv[3] if len(sys.argv) > 3 else None   # same cuts applied to another (sample-aligned) preset folder
m = WhisperModel("small", device="cpu", compute_type="int8")
def load_wave(fn):
    w = wave.open(fn); sr = w.getframerate(); n = w.getnchannels(); sw = w.getsampwidth(); raw = w.readframes(w.getnframes())
    if sw == 3:
        b = np.frombuffer(raw, dtype=np.uint8).reshape(-1, 3)
        a = (b[:, 0].astype(np.int32) | (b[:, 1].astype(np.int32) << 8) | (b[:, 2].astype(np.int32) << 16)); a = np.where(a >= 1 << 23, a - (1 << 24), a).astype(np.float32) / (1 << 23)
    else: a = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    if n > 1: a = a.reshape(-1, n).mean(1)
    return a, sr
def words_of(a, sr):
    x = resample_poly(a, 16000, sr).astype(np.float32)
    segs, _ = m.transcribe(x, language="en", word_timestamps=True, beam_size=5)
    return [dict(w=w.word.strip(), s=w.start, e=w.end) for s in segs for w in s.words]
def norm(s): return re.sub(r"[^a-z0-9']", "", s.lower().replace("\u2019", "'"))
def script_tokens(t):
    toks = t.replace("\u2026", "\u2026 ").split()
    return [x for x in toks if norm(x)]
NUM = {"26": ["twenty", "six"], "-26": ["minus", "twenty", "six"]}
def expand(ws):   # whisper words -> normalized tokens with times (26 -> twenty six)
    out = []
    for w in ws:
        n = norm(w["w"])
        parts = re.split(r"[- ]", w["w"].lower())
        if n in NUM:
            k = NUM[n]; d = (w["e"] - w["s"]) / len(k)
            for j, p in enumerate(k): out.append(dict(n=p, s=w["s"] + j * d, e=w["s"] + (j + 1) * d))
        elif len([p for p in parts if norm(p)]) > 1:
            pp = [norm(p) for p in parts if norm(p)]; d = (w["e"] - w["s"]) / len(pp)
            for j, p in enumerate(pp): out.append(dict(n=p, s=w["s"] + j * d, e=w["s"] + (j + 1) * d))
        else: out.append(dict(n=n, s=w["s"], e=w["e"]))
    return out
def align(script, ws):
    """script display tokens -> [disp, start, end] using whisper times; hyphenated script tokens take the span of their parts"""
    sp = []
    for i, t in enumerate(script):
        for p in re.split(r"-", t):
            if norm(p): sp.append((i, norm(p)))
    hx = expand(ws)
    sm = difflib.SequenceMatcher(None, [p for _, p in sp], [h["n"] for h in hx], autojunk=False)
    tim = [None] * len(sp)
    for a, b, n in sm.get_matching_blocks():
        for k in range(n): tim[a + k] = (hx[b + k]["s"], hx[b + k]["e"])
    for op, a1, a2, b1, b2 in sm.get_opcodes():   # replaced spans: spread the whisper span over the script parts
        if op == "replace" and b2 > b1:
            s0, e0 = hx[b1]["s"], hx[b2 - 1]["e"]; d = (e0 - s0) / (a2 - a1)
            for k in range(a1, a2): tim[k] = (s0 + (k - a1) * d, s0 + (k - a1 + 1) * d)
    for k in range(len(tim)):   # leftovers: between neighbours
        if tim[k] is None:
            prv = next((tim[j] for j in range(k - 1, -1, -1) if tim[j]), (0, 0)); nxt = next((tim[j] for j in range(k + 1, len(tim)) if tim[j]), (prv[1] + 0.3, 0))
            tim[k] = (prv[1], max(prv[1] + 0.05, nxt[0]))
    out = {}
    for (i, _), t in zip(sp, tim):
        if i in out: out[i][1] = t[1]
        else: out[i] = [t[0], t[1]]
    return [[script[i], round(out[i][0], 3), round(out[i][1], 3)] for i in range(len(script))]
def rms_db(a, sr, t0, t1):
    i0, i1 = max(0, int(t0 * sr)), min(len(a), int(t1 * sr)); seg = a[i0:i1]
    return 20 * np.log10(np.sqrt(np.mean(seg ** 2)) + 1e-9) if len(seg) else -120
def quietest(a, sr, t0, t1, win=0.02):
    best = (1e9, t0)
    t = t0
    while t + win <= t1:
        v = rms_db(a, sr, t, t + win); best = min(best, (v, t + win / 2)); t += 0.005
    return best
def trim_idx(a, sr, thr=-50):
    fr = int(0.01 * sr); e = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(a) - fr, fr)])
    on = np.where(e > thr)[0]
    if not len(on): return 0, len(a)
    return max(0, on[0] * fr - int(0.04 * sr)), min(len(a), (on[-1] + 1) * fr + int(0.06 * sr))
def trim(a, sr, thr=-50):   # trim leading/trailing silence, keep 40 ms margins
    fr = int(0.01 * sr); e = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + fr] ** 2)) + 1e-9) for i in range(0, len(a) - fr, fr)])
    on = np.where(e > thr)[0]
    if not len(on): return a
    s = max(0, on[0] * fr - int(0.04 * sr)); t = min(len(a), (on[-1] + 1) * fr + int(0.06 * sr))
    return a[s:t]
fade = lambda n: np.linspace(0, 1, n)
pieces, log, rpieces = [], [], []
sr0 = None
for i, t in enumerate(pars, 1):
    fn = f"{HERE}/{V}/{PRE}/{V}_p{i:02d}.wav"
    a, sr = load_wave(fn); sr0 = sr
    i0, i1 = trim_idx(a, sr); a = a[i0:i1]
    if REPLAY: b, _ = load_wave(fn.replace(f"/{PRE}/", f"/{REPLAY}/")); b = b[i0:i1]
    if i in INNER:
        ws = align(script_tokens(t), words_of(a, sr))
        for word, extra in sorted(INNER[i], key=lambda x: -[norm(w[0]) for w in ws].index(norm(x[0]))):
            k = [norm(w[0]) for w in ws].index(norm(word))
            e0, s1 = ws[k][2], ws[k + 1][1]
            v, tc = quietest(a, sr, e0 - 0.03, s1 + 0.03)
            if v > -42: log.append(f"p{i:02d} after '{word}': no silence ({v:.0f} dB) -> skipped"); continue
            c = int(tc * sr); n = int(0.008 * sr)
            a = np.concatenate([a[:c - n], a[c - n:c] * fade(n)[::-1], np.zeros(int(extra * sr)), a[c:c + n] * fade(n), a[c + n:]])
            if REPLAY: b = np.concatenate([b[:c - n], b[c - n:c] * fade(n)[::-1], np.zeros(int(extra * sr)), b[c:c + n] * fade(n), b[c + n:]])
            log.append(f"p{i:02d} after '{word}': +{extra:.2f}s at {tc:.3f}s ({v:.0f} dB)")
    pieces.append(a)
    if REPLAY: rpieces.append(b)
    if i < len(pars):
        pieces.append(np.zeros(int(GAP[i] * sr)))
        if REPLAY: rpieces.append(np.zeros(int(GAP[i] * sr)))
tail = np.zeros(int(0.15 * sr0))
track = np.concatenate([np.zeros(int(0.12 * sr0))] + pieces + [tail])   # 0.12 s lead-in
st = np.column_stack([track, track])
sf.write(f"{HERE}/{V}_track.wav", st, sr0, subtype="PCM_24")
if REPLAY:
    rt = np.concatenate([np.zeros(int(0.12 * sr0))] + rpieces + [tail]); assert len(rt) == len(track)
    sf.write(f"{HERE}/{V}_track_{REPLAY}.wav", np.column_stack([rt, rt]), sr0, subtype="PCM_24")
# word timings on the assembled track, per paragraph window
ws_all = words_of(track, sr0)
script_all = [w for t in pars for w in script_tokens(t)]
al = align(script_all, ws_all)
par_of = [i for i, t in enumerate(pars) for _ in script_tokens(t)]
json.dump(dict(voice=V, preset=PRE, dur=round(len(track) / sr0, 3), words=[[w, s, e, p + 1] for (w, s, e), p in zip(al, par_of)], log=log),
          open(f"{HERE}/{V}_words.json", "w", encoding="utf-8"), indent=0, ensure_ascii=False)
hyp = " ".join(w["w"] for w in ws_all)
print("\n".join(log)); print(V, "dur", round(len(track) / sr0, 2), "words", len(al)); print("whisper:", hyp)

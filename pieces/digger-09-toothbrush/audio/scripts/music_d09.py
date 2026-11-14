# music_exp.py TIMELINE.json OUT.wav  -> OUT.wav (+ OUT_stem_<name>.wav)
# Expedition 01 "the bedroom": ORIGINAL music in the style of the Mega Man Legends 2 areas (fuentes/megaman-legends2/
# NOTAS-ESTILO-MML2.md), no Capcom melody used. One "area" per stretch of the video, switching like MML2 changes music by
# location (0.35 s fade out, the new area starts on its own downbeat):
#   dungeon  128 BPM A minor: marimba + pizz ostinato, walking upright bass, hand percussion (shaker, snaps, low thumps)
#   past     104 BPM F major soft jazz: pizz "guitar" comping, walking bass, brushes, clarinet melody, marimba fills
#   manual    90 BPM C major: music box/celesta melody, pizz, soft pad (the Human Body Manual lab)
#   boss     132 BPM E minor: pizz strings ostinato in 16ths, low reed "brass" stabs, timpani-like thumps
#   closing   88 BPM D major ballad: pad, music box, clarinet melody, soft bass
# ITEM GET: the area music stops for a 1.6 s fanfare (marimba + pizz arpeggio + music box), then resumes.
# Real instrument one-shots: VSCO-2 CE (CC0, sgossner) + CC0 kit hits (see CREDITS.md), pitch-shifted by resampling.
import sys, os, json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100
TL = json.load(open(sys.argv[1], encoding="utf-8")); OUT = sys.argv[2]
W = TL["words"]; END = TL["dur"] + 4.0
N = int((END + 0.5) * SR); rng = np.random.default_rng(31)
stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "reed", "jingle")}
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
def pstart(p): return min(w[1] for w in W if w[3] == p)

def place(buf, x, t):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += x[:j - i]
def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, timeout=60).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64); a = np.abs(x); i0 = int(np.argmax(a > a.max() * 0.05))
    x = x[max(0, i0 - 40):]; return x / (np.abs(x).max() + 1e-9)
def modal(freq, dur, ratios, decays, amps):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for r, d, a in zip(ratios, decays, amps): x += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d)
    return x * np.minimum(1, t / 0.002)
def musicbox(m, dur=1.2): return modal(mtof(m), dur, [1, 2.0, 5.4, 8.9], [0.6, 0.3, 0.12, 0.05], [1, 0.25, 0.2, 0.08])
def reed(m, dur, vib=1.0, att=0.05, lp=1600):
    n = int(dur * SR); t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.006 * vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h ** 1.8 for h in (1, 3, 5, 7)) + 0.05 * sum(np.sin(h * ph) / h ** 2 for h in (2, 4))
    x = sosfilt(butter(2, lp / (SR / 2), output="sos"), x)
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 0.08)
def brass(m, dur): return np.tanh(2.2 * reed(m, dur, vib=0.3, att=0.03, lp=2400)) * 0.8
def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.08):
            f = mtof(m) * 2 ** (d / 12); x += sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3, 4))
    x = sosfilt(butter(2, 1500 / (SR / 2), output="sos"), x)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6) / len(ms)
CM3 = r"F:/Claude Proyectos/pieces/digger-03-lock/audio/cand_music"; CM = r"F:/Claude Proyectos/pieces/digger-01-fridge/audio/cand_music"
def _smp(path, midi):
    x = load(path); a = np.abs(x); e = np.convolve(a, np.ones(441) / 441, "same"); above = np.where(e > e.max() * 0.004)[0]
    return (midi, x[:above[-1] if len(above) else len(x)])
SAMPLES = {"pizz": [_smp(f"{CM3}/pizz/374522.mp3", 57), _smp(f"{CM3}/pizz/374524.mp3", 59), _smp(f"{CM3}/pizz/374519.mp3", 66), _smp(f"{CM3}/pizz/374521.mp3", 79)],
           "bass": [_smp(f"{CM3}/upright/383697.mp3", 37), _smp(f"{CM3}/pizz/372743.mp3", 40)],
           "marimba": [_smp(f"{CM3}/marimba/373578.mp3", 83)], "clar": [_smp(f"{CM3}/clarinet/257968.mp3", 60)]}
def sampler(kind, m, dur, rel=0.04, pick=None):
    bank = SAMPLES[kind]; m0, x = pick if pick else min(bank, key=lambda b: abs(b[0] - m))
    r = 2 ** ((m - m0) / 12); n = int(dur * SR); idx = np.arange(n) * r; idx = idx[idx < len(x) - 1]
    y = np.interp(idx, np.arange(len(x)), x); out = np.zeros(n); out[:len(y)] = y
    k = int(min(rel, dur / 3) * SR); out[n - k:] *= np.linspace(1, 0, k); return out
def pizz(m, dur): return sampler("pizz", m, dur, rel=0.03)
def upright(m, dur): return sampler("bass", m, dur, pick=SAMPLES["bass"][0] if m < 44 else SAMPLES["bass"][1])
def marimba(m, dur=0.35): return sampler("marimba", m, dur, rel=0.05)
def clar(m, dur): x = sampler("clar", m, dur, rel=0.08); t = np.arange(len(x)) / SR; return x * np.minimum(1, t / 0.03)
KICK, HAT, SHAK, SNAP = load(f"{CM}/kick/581457.mp3")[:int(0.35 * SR)], load(f"{CM}/hat/504929.mp3")[:int(0.12 * SR)], load(f"{CM}/shaker/375633.mp3")[:int(0.2 * SR)], load(f"{CM}/clap/589137.mp3")[:int(0.25 * SR)]
for s in (KICK, HAT, SHAK, SNAP): s[-200:] *= np.linspace(1, 0, 200)
LOW = sosfilt(butter(2, 160 / (SR / 2), output="sos"), KICK) * 2.5   # a low "conga/timpani" thump

def C(root, tones, q="M"): return (root, tones, q)
# ---------------- the areas (each one returns notes for bar b, bar start t0) ----------------
def area_dungeon(b, t0, BEAT):
    S8 = BEAT / 2; prog = [C(45, [69, 72, 76], "m"), C(41, [69, 72, 77]), C(43, [67, 71, 74]), C(40, [68, 71, 76])]   # Am F G E
    root, ch, q = prog[b % 4]; nroot = prog[(b + 1) % 4][0]
    walk = [root, root + 7, root + 12, nroot + (1 if b % 2 else -1)]
    for i, m in enumerate(walk): place(stems["bass"], upright(m, 0.9 * BEAT), t0 + i * BEAT)
    ost = [ch[0], ch[2], ch[1], ch[2], ch[0] + 12, ch[2], ch[1], ch[2]]   # marimba ostinato in 8ths
    for i, m in enumerate(ost): place(stems["marimba"], marimba(m, 0.3) * (0.55 if i % 2 else 0.8), t0 + i * S8)
    if b % 8 >= 4:   # pizz answer line in the second half of each 8 bars
        mel = [[(0, 76), (2, 77), (3, 76), (4, 72), (6, 69)], [(0, 77), (2, 76), (4, 72), (5, 74), (6, 76)], [(0, 79), (2, 77), (3, 76), (4, 74), (6, 71)], [(0, 76), (2, 75), (4, 76), (6, 80)]][b % 4]
        for s, m in mel: place(stems["pluck"], pizz(m, 0.3), t0 + s * S8)
    for s in (0, 3, 4): place(stems["drums"], LOW * (0.7 if s != 3 else 0.45), t0 + s * S8)
    for s in (2, 6): place(stems["drums"], SNAP * 0.5, t0 + s * S8)
    for s in range(16): place(stems["drums"], SHAK * (0.09 if s % 2 else 0.15), t0 + s * S8 / 2)
def area_past(b, t0, BEAT):
    S8 = BEAT / 2; prog = [C(41, [65, 69, 72, 76]), C(38, [65, 69, 72, 74], "m"), C(43, [65, 70, 74, 77], "m"), C(36, [64, 67, 70, 72])]   # Fmaj7 Dm7 Gm7 C7
    root, ch, q = prog[b % 4]; nroot = prog[(b + 1) % 4][0]
    third = root + (4 if q == "M" else 3)
    for i, m in enumerate([root, third, root + 7, nroot - 1]): place(stems["bass"], upright(m, 0.92 * BEAT), t0 + i * BEAT)
    for s in (1, 3, 5, 6):   # swung pizz comping ("guitar")
        for k, m in enumerate(ch[:3]): place(stems["pluck"], pizz(m - 12, 0.25) * 0.5, t0 + s * S8 + (0.03 if s % 2 else 0) + k * 0.012)
    mel = [[(0, 2, 72), (2, 1, 74), (3, 1, 76), (4, 4, 77)], [(0, 2, 74), (2, 2, 72), (4, 4, 69)], [(0, 1, 70), (1, 1, 72), (2, 2, 74), (4, 2, 77), (6, 2, 74)], [(0, 6, 72), (6, 2, 67)]]
    if b % 8 >= 2:
        for s, l, m in mel[b % 4]: place(stems["reed"], clar(m, l * S8 * 0.95), t0 + s * S8)
    if b % 4 == 3: [place(stems["marimba"], marimba(m + 12, 0.3) * 0.5, t0 + (5 + i) * S8 / 1.5) for i, m in enumerate(ch[:3])]
    for s in range(8): place(stems["drums"], SHAK * (0.10 if s % 2 else 0.16), t0 + s * S8 + (0.04 if s % 2 else 0))   # brushes
    for s in (2, 6): place(stems["drums"], SNAP * 0.3, t0 + s * S8)
    place(stems["drums"], KICK * 0.4, t0)
def area_manual(b, t0, BEAT):
    S8 = BEAT / 2; prog = [C(48, [72, 76, 79]), C(45, [69, 72, 76], "m"), C(41, [69, 72, 77]), C(43, [67, 71, 74])]   # C Am F G
    root, ch, q = prog[b % 4]
    place(stems["bass"], upright(root, 1.8 * BEAT), t0); place(stems["bass"], upright(root + 7, 1.8 * BEAT), t0 + 2 * BEAT)
    place(stems["pad"], pad(ch, 4 * BEAT + 0.3), t0)
    mel = [[(0, 84), (2, 83), (3, 79), (4, 76), (6, 79)], [(0, 81), (2, 79), (4, 76), (6, 72)], [(0, 77), (1, 79), (2, 81), (4, 84), (6, 81)], [(0, 79), (2, 77), (4, 74), (6, 71)]][b % 4]
    for s, m in mel: place(stems["box"], musicbox(m, 1.4) * 0.8, t0 + s * S8)
    for s in (1, 3, 5, 7): place(stems["pluck"], pizz(ch[s % 3], 0.2) * 0.35, t0 + s * S8)
    place(stems["drums"], SHAK * 0.08, t0 + 2 * BEAT)
def area_boss(b, t0, BEAT):
    S16 = BEAT / 4; prog = [C(40, [64, 67, 71], "m"), C(40, [64, 67, 71], "m"), C(36, [64, 67, 72]), C(35, [63, 66, 71])]   # Em Em C B
    root, ch, q = prog[b % 4]
    for i in range(16): place(stems["pluck"], pizz(ch[(0, 1, 2, 1)[i % 4]] - (12 if i % 8 < 4 else 0), 0.16) * (0.8 if i % 4 == 0 else 0.5), t0 + i * S16)
    for s in (0, 6, 8, 14): place(stems["bass"], upright(root, 1.2 * S16 * 2), t0 + s * S16)
    if b % 2 == 0: place(stems["reed"], brass(ch[0] - 12, 2 * BEAT) * 0.7, t0); place(stems["reed"], brass(ch[2] - 12, BEAT) * 0.7, t0 + 3 * BEAT)
    for s in (0, 8): place(stems["drums"], LOW * 0.9, t0 + s * S16)
    for s in (4, 12): place(stems["drums"], SNAP * 0.5, t0 + s * S16)
    for s in range(16): place(stems["drums"], HAT * (0.14 if s % 2 else 0.22), t0 + s * S16)
def area_closing(b, t0, BEAT):
    S8 = BEAT / 2; prog = [C(38, [62, 66, 69]), C(43, [62, 67, 71]), C(47, [62, 66, 71], "m"), C(45, [61, 64, 69])]   # D G Bm A
    root, ch, q = prog[b % 4]
    place(stems["bass"], upright(root, 3.6 * BEAT), t0); place(stems["pad"], pad(ch, 4 * BEAT + 0.4), t0)
    for i, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]): place(stems["box"], musicbox(m, 1.2) * 0.5, t0 + i * BEAT)
    mel = [[(0, 4, 78), (4, 2, 76), (6, 2, 74)], [(0, 3, 74), (3, 1, 76), (4, 4, 79)], [(0, 4, 78), (4, 4, 74)], [(0, 6, 76), (6, 2, 73)]][b % 4]
    if b >= 1:
        for s, l, m in mel: place(stems["reed"], clar(m - 12, l * S8 * 0.95), t0 + s * S8)
AREAS = {"dungeon": (128, area_dungeon), "past": (104, area_past), "manual": (90, area_manual), "boss": (132, area_boss), "closing": (88, area_closing)}

# ---------------- the map: paragraph -> area ----------------
PMAP = {1: "past", 6: "manual", 8: "dungeon", 11: "past", 12: "closing"}   # digger 09: desert + oasis / China / prison + shop / 1938 lab / goodbye
ks = sorted(PMAP); SECS = []
for i, p in enumerate(ks):
    a = max(0.0, pstart(p) - 0.25); b = (max(0.0, pstart(ks[i + 1]) - 0.25) if i + 1 < len(ks) else END); SECS.append((a, b, PMAP[p]))
ITEMS = []   # digger 05: no ITEM GET cards
JINGLE = 1.6
for a, b, kind in SECS:
    bpm, fn = AREAS[kind]; BEAT = 60 / bpm; BAR = 4 * BEAT
    seg = {k: np.zeros(N) for k in stems if k != "jingle"}; keep = stems; globals()["stems"] = seg
    nb = int(np.ceil((b - a) / BAR)) + 1
    for k in range(nb): fn(k, a + k * BAR, BEAT)
    globals()["stems"] = keep
    i0, i1 = int(a * SR), min(N, int(b * SR)); f = int(0.35 * SR)
    for k, x in seg.items():
        g = np.zeros(N); g[i0:i1] = 1
        if i1 - f > i0: g[i1 - f:i1] = np.linspace(1, 0, f)
        if a > 0: g[i0:i0 + int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))
        stems[k] += x * g
# ITEM GET fanfare: the area music stops, marimba + pizz arpeggio up, music box sparkle, a held chord; then the area resumes
for t in ITEMS:
    i0, i1 = int((t - 0.03) * SR), int((t + JINGLE) * SR); f = int(0.03 * SR); f2 = int(0.25 * SR)
    for k in stems:
        if k == "jingle": continue
        stems[k][i0:i0 + f] *= np.linspace(1, 0, f); stems[k][i0 + f:i1] = 0; stems[k][i1:i1 + f2] *= np.linspace(0, 1, f2)
    for i, m in enumerate([72, 76, 79, 84, 88]): place(stems["jingle"], marimba(m, 0.4) * 0.8, t + i * 0.08); place(stems["jingle"], pizz(m - 12, 0.3) * 0.5, t + i * 0.08)
    for i, m in enumerate([96, 91, 96]): place(stems["jingle"], musicbox(m, 1.0) * 0.4, t + 0.45 + i * 0.1)
    for m in (60, 64, 67, 72): place(stems["jingle"], clar(m, 0.9) * 0.35, t + 0.45)
    place(stems["jingle"], upright(36, 1.0), t + 0.45)
# the end jingle after the last word: resolve on D (pizz strum + box + low D)
tj = TL["dur"] + 0.1
for i, m in enumerate([50, 54, 57, 62, 66]): place(stems["pluck"], pizz(m + 12, 1.2), tj + i * 0.035)
for i, m in enumerate([86, 81, 86, 93]): place(stems["box"], musicbox(m, 2.0) * 0.55, tj + 0.35 + i * 0.18)
place(stems["bass"], upright(38, 2.2), tj)
LV = {"bass": 1.15, "pluck": 0.7, "marimba": 0.4, "box": 0.12, "drums": 0.42, "pad": 0.12, "reed": 0.34, "jingle": 0.6}
for k in stems: stems[k] = sosfilt(butter(2, 30 / (SR / 2), btype="high", output="sos"), stems[k]) * LV[k]
stems["pluck"] = sosfilt(butter(2, 5500 / (SR / 2), output="sos"), stems["pluck"])
for k in stems: stems[k] = sosfilt(butter(4, 15500 / (SR / 2), output="sos"), stems[k])
n_end = int(END * SR); fo = int(1.0 * SR)
out = sum(stems.values())[:n_end]; out[-fo:] *= np.linspace(1, 0, fo)
pk = np.abs(out).max() / 0.7
os.makedirs(os.path.dirname(OUT), exist_ok=True)
for k, x in stems.items(): sf.write(OUT.replace(".wav", f"_stem_{k}.wav"), (x[:len(out)] / pk).astype(np.float32), SR)
sf.write(OUT, (out / pk).astype(np.float32), SR)
json.dump({"sections": SECS, "items": ITEMS}, open(OUT.replace(".wav", "_map.json"), "w"), indent=1)
print("music_exp", round(len(out) / SR, 2), "s;", len(SECS), "areas;", len(ITEMS), "item jingles")

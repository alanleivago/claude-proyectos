# music2.py VOICE -> audio/<voice>/music.wav + stem_*.wav : ORIGINAL playful explainer bed in the style measured on the
# sinaboto refs (demucs stems + earshot: ~103-112 BPM, major key, round bass guitar/sub as the loudest stem, plucked
# pizzicato / marimba / music-box melody, soft light drums, tonal, mostly mono, dark spectrum). Composed here; no
# melody is taken from the refs. Instruments are physical-model / additive synthesis (Karplus-Strong pizzicato, modal
# marimba, bell music box, saturated round bass) + CC0 Freesound one-shots for the kit (audio/cand_music, CREDITS.md).
import sys, os, json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100
V = sys.argv[1]
ROOT = r"F:/Claude Proyectos/pieces/digger-01-fridge"; CM = f"{ROOT}/audio/cand_music"
meta = json.load(open(f"{ROOT}/engine/review_meta_{V}.json")); st = {n: t for n, t, h in meta["film"]["shots"]}; DUR = meta["film"]["dur"]
TL = json.load(open(f"{ROOT}/engine/timeline_{V}.json", encoding="utf-8")); T_END = TL["dur"]
BPM = 110; BEAT = 60 / BPM; BAR = 4 * BEAT; S8 = BEAT / 2
N = int((DUR + 0.5) * SR); rng = np.random.default_rng(7)
stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad")}
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def place(buf, x, t):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += x[:j - i]

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, timeout=60).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64); a = np.abs(x); i0 = int(np.argmax(a > a.max() * 0.05))
    x = x[max(0, i0 - 40):]; return x / (np.abs(x).max() + 1e-9)

def ks(freq, dur, bright=0.5, decay=0.996):   # Karplus-Strong plucked string (pizzicato / ukulele-ish)
    n = int(dur * SR); P = max(2, int(round(SR / freq))); buf = (rng.random(P) * 2 - 1)
    buf = sosfilt(butter(1, min(0.99, 0.15 + bright * 0.6), output="sos"), buf)
    out = np.empty(n); prev = buf.copy(); k = 0
    while k < n:
        m = min(P, n - k); out[k:k + m] = prev[:m]
        nxt = decay * 0.5 * (prev + np.roll(prev, 1)); nxt[0] = decay * 0.5 * (prev[0] + prev[-1]); prev = nxt; k += m
    e = np.ones(n); r = int(0.03 * SR); e[-r:] = np.linspace(1, 0, r); return out * e

def modal(freq, dur, ratios, decays, amps):    # struck bar / bell: sum of decaying partials
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for r, d, a in zip(ratios, decays, amps): x += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d)
    x *= np.minimum(1, t / 0.002); return x

def marimba(m, dur=0.6): return modal(mtof(m), dur, [1, 3.93, 9.2], [0.35, 0.1, 0.04], [1, 0.5, 0.2])
def musicbox(m, dur=1.2): return modal(mtof(m), dur, [1, 2.0, 5.4, 8.9], [0.6, 0.3, 0.12, 0.05], [1, 0.25, 0.2, 0.08])

def bass(m, dur):   # round electric bass: fundamental + 2nd/3rd harmonics, pluck envelope, gentle tanh warmth
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.12) + 0.15 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.06)
    e = np.minimum(1, t / 0.012) * (0.55 + 0.45 * np.exp(-t / 0.18)); r = int(min(0.05, dur / 3) * SR); e[-r:] *= np.linspace(1, 0, r)
    return np.tanh(1.6 * x * e) / np.tanh(1.6)

def pad(ms, dur):   # soft felt-pad: detuned triangle-ish additive, slow attack
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for d in (-0.06, 0.06):
            f = mtof(m) * 2 ** (d / 12); x += sum(np.sin(2 * np.pi * f * k * t) / k ** 2 for k in (1, 3, 5))
    e = np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6); return x * e / len(ms)

KICK, HAT, SHAK, SNAP = load(f"{CM}/kick/581457.mp3")[:int(0.35 * SR)], load(f"{CM}/hat/504929.mp3")[:int(0.12 * SR)], load(f"{CM}/shaker/375633.mp3")[:int(0.2 * SR)], load(f"{CM}/clap/589137.mp3")[:int(0.25 * SR)]
for s in (KICK, HAT, SHAK, SNAP): s[-200:] *= np.linspace(1, 0, 200)

# F major: I - vi - IV - V  (F, Dm, Bb, C); second half of each 8-bar phrase: IV - V - iii - vi for variety
PROG = [("F", 41, [65, 69, 72]), ("Dm", 38, [62, 65, 69]), ("Bb", 34, [62, 65, 70]), ("C", 36, [64, 67, 72]),
        ("Bb", 34, [62, 65, 70]), ("C", 36, [64, 67, 72]), ("Am", 33, [64, 69, 72]), ("Dm", 38, [62, 65, 69])]
# melody (original): 8th-note steps, (step, len8, midi) per bar, motif + answer, pizzicato
MEL = [[(0, 1, 72), (1, 1, 77), (2, 1, 76), (3, 1, 72), (4, 2, 69), (6, 1, 72), (7, 1, 74)],
       [(0, 2, 74), (2, 1, 72), (3, 1, 69), (4, 3, 65), (7, 1, 69)],
       [(0, 1, 70), (1, 1, 74), (2, 1, 77), (3, 1, 74), (4, 2, 72), (6, 2, 70)],
       [(0, 3, 72), (3, 1, 67), (4, 1, 70), (5, 1, 72), (6, 2, 76)],
       [(0, 1, 77), (1, 1, 74), (2, 1, 70), (3, 1, 74), (4, 2, 77), (6, 2, 79)],
       [(0, 2, 76), (2, 1, 72), (3, 1, 67), (4, 4, 72)],
       [(0, 1, 76), (1, 1, 72), (2, 1, 69), (3, 1, 72), (4, 2, 76), (6, 2, 74)],
       [(0, 4, 74), (4, 1, 72), (5, 1, 69), (6, 2, 65)]]
b_of = lambda t: int(round(t / BAR))
B_BREAK0, B_BREAK1, B_PAY = b_of(st["#13"]), b_of(st["#15"]), b_of(st["#22"])
B_END = int(T_END // BAR)
for b in range(B_END + 1):
    t0 = b * BAR; name, root, ch = PROG[b % 8]; brk = B_BREAK0 <= b < B_BREAK1; intro = b < 1
    # bass: bouncy root / octave / fifth 8ths, staccato (the loudest element, like the refs)
    pat = [(0, 0, 1.6), (2, 12, 0.7), (3, 7, 0.7), (4, 0, 1.6), (6, 12, 0.7), (7, 7, 0.7)] if not brk else [(0, 0, 3.6), (4, 0, 3.6)]
    for s, o, l in pat: place(stems["bass"], bass(root + o, l * S8 * 0.9), t0 + s * S8)   # v3b: real bass register (F2 = 87 Hz)
    # marimba comping: off-beat chord stabs
    if not intro:
        for s in ((1, 3, 5, 7) if not brk else (2, 6)):
            for m in ch: place(stems["marimba"], marimba(m) * 0.55, t0 + s * S8)
    # pizzicato melody from bar 2, rests in the breakdown; every 4th bar thinner (room for the voice)
    if b >= 2 and not brk:
        for s, l, m in MEL[b % 8]:
            if b % 4 == 3 and s % 2: continue
            place(stems["pluck"], ks(mtof(m), max(0.25, l * S8 * 1.6), bright=0.75), t0 + s * S8)
    # music box sparkle at phrase starts + in the breakdown
    if b % 4 == 0 or brk:
        for i, m in enumerate([ch[2] + 12, ch[1] + 12, ch[0] + 12] if not brk else [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]):
            place(stems["box"], musicbox(m) * 0.5, t0 + i * (S8 if not brk else BEAT))
    if brk: place(stems["pad"], pad(ch, BAR + 0.4), t0)
    # light drums: soft kick on 1 and the "and" of 2, snap on 2/4, hats 8ths, shaker 16ths ghosting
    if not intro and not brk:
        for s in (0, 3, 4): place(stems["drums"], KICK * (0.9 if s != 3 else 0.6), t0 + s * S8)
        for s in (2, 6): place(stems["drums"], SNAP * 0.55, t0 + s * S8)
        for s in range(8): place(stems["drums"], HAT * (0.3 if s % 2 else 0.4), t0 + s * S8)
        for s in range(16): place(stems["drums"], SHAK * (0.12 if s % 2 else 0.18), t0 + s * S8 / 2)
        if b == B_PAY - 1:
            for k in range(4): place(stems["drums"], SNAP * (0.4 + 0.12 * k), t0 + (12 + k) * S8 / 2)
# ending: resolve on the outro (no hard stop): F chord pizz arpeggio + music box + bass, then a soft tail to the end
tj = T_END + 0.05
for i, m in enumerate([65, 69, 72, 77, 81]): place(stems["pluck"], ks(mtof(m), 1.2, bright=0.6), tj + i * 0.09)
for i, m in enumerate([84, 89]): place(stems["box"], musicbox(m, 2.0) * 0.6, tj + 0.5 + i * 0.25)
place(stems["bass"], bass(41, 2.0), tj); place(stems["pad"], pad([65, 69, 72], DUR - tj + 0.3), tj)
cut = int(T_END * SR)
for k in ("marimba", "drums"): stems[k][cut + int(0.15 * SR):] = 0
LV = {"bass": 1.1, "pluck": 0.85, "marimba": 0.42, "box": 0.3, "drums": 0.38, "pad": 0.2}
for k in stems: stems[k] = sosfilt(butter(2, 30 / (SR / 2), btype="high", output="sos"), stems[k]) * LV[k]
stems["pluck"] = sosfilt(butter(2, 8000 / (SR / 2), output="sos"), stems["pluck"])
for k in stems: stems[k] = sosfilt(butter(4, 15500 / (SR / 2), output="sos"), stems[k])   # refs top out at ~16 kHz (TikTok AAC)
out = sum(stems.values()); pk = np.abs(out).max() / 0.7
os.makedirs(f"{ROOT}/audio/{V}", exist_ok=True)
for k, x in stems.items(): sf.write(f"{ROOT}/audio/{V}/stem2_{k}.wav", (x / pk).astype(np.float32), SR)
sf.write(f"{ROOT}/audio/{V}/music2.wav", (out / pk).astype(np.float32), SR)
print(V, "music2", round(N / SR, 2), "s; bars", B_END + 1, "break", B_BREAK0, B_BREAK1, "payoff", B_PAY)

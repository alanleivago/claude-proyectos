# music5.py SECTIONS.json OUT.wav  -> OUT.wav (+ OUT_stem_<name>.wav)
# Digger 04 "the alarm clock": ORIGINAL bright "rise and shine" bed, same family as ep01-03 (real upright/cello pizzicato
# bass, violin pizzicato melody, marimba, music box, clarinet answers, soft CC0 kit) but a new tune: 112 BPM in D major,
# a bouncy walking bass, a skipping pizz melody, the music box rings an "alarm" motif (D-A-D) at every phrase start.
# Progression per bar: D Bm G A | D F#m G A (I vi IV V | I iii IV V).
# "gross" in SECTIONS = the "Rude." moment: the band stops dead, a pizz "pea-pop" flicks up and a low clarinet "harrumph",
# then the groove re-enters on the beat.
# SECTIONS.json: {"dur": total s, "breakdown": [t0, t1], "gross": t, "outro": t, "end": dur}
import sys, os, json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100
SEC = json.load(open(sys.argv[1])); OUT = sys.argv[2]
DUR = SEC["dur"]; BRK = SEC.get("breakdown", [-1, -1]); STING = SEC.get("gross"); T_OUT = SEC.get("outro", DUR - 3); END = SEC.get("end", DUR)
CM = r"F:/Claude Proyectos/pieces/digger-01-fridge/audio/cand_music"   # CC0 one-shots (CREDITS: johnnydekk, Brandao38, sgossner, MrFossy)
BPM = 112; BEAT = 60 / BPM; BAR = 4 * BEAT; S8 = BEAT / 2
N = int((END + 0.5) * SR); rng = np.random.default_rng(23)
stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "reed", "sting")}
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def place(buf, x, t):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += x[:j - i]

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, timeout=60).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64); a = np.abs(x); i0 = int(np.argmax(a > a.max() * 0.05))
    x = x[max(0, i0 - 40):]; return x / (np.abs(x).max() + 1e-9)

def ks(freq, dur, bright=0.35, decay=0.993):   # Karplus-Strong plucked string
    n = int(dur * SR); P = max(2, int(round(SR / freq))); buf = (rng.random(P) * 2 - 1)
    buf = sosfilt(butter(1, min(0.99, 0.08 + bright * 0.5), output="sos"), buf)
    out = np.empty(n); prev = buf.copy(); k = 0
    while k < n:
        m = min(P, n - k); out[k:k + m] = prev[:m]
        nxt = decay * 0.5 * (prev + np.roll(prev, 1)); nxt[0] = decay * 0.5 * (prev[0] + prev[-1]); prev = nxt; k += m
    e = np.ones(n); r = int(min(0.03, dur / 3) * SR); e[-r:] = np.linspace(1, 0, r); return out * e

# wooden "body" of a string instrument: a few broad resonances (makes the pluck read as a pizzicato string, not a chip)
BODY = [butter(2, [f * 0.8 / (SR / 2), f * 1.25 / (SR / 2)], btype="band", output="sos") for f in (280, 520, 1100, 2400)]
def body(x, g=(1.0, 0.8, 0.5, 0.25)): return sum(gi * sosfilt(s, x) for gi, s in zip(g, BODY)) + 0.35 * x
def pizz(m, dur):   # muted staccato string pluck
    x = ks(mtof(m), dur, bright=0.3, decay=0.988); t = np.arange(len(x)) / SR
    return body(x) * np.exp(-t / 0.16)

def upright(m, dur):   # walking upright bass: low KS pluck + sine fundamental, soft thump, short release
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    k = ks(f, dur, bright=0.18, decay=0.997) * 0.6; s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.12)
    e = np.minimum(1, t / 0.006) * (0.45 + 0.55 * np.exp(-t / 0.22)); r = int(min(0.05, dur / 3) * SR); e[-r:] *= np.linspace(1, 0, r)
    return np.tanh(1.1 * (s * e + k * e)) / np.tanh(1.1)

def modal(freq, dur, ratios, decays, amps):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for r, d, a in zip(ratios, decays, amps): x += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d)
    return x * np.minimum(1, t / 0.002)
MALLET = sosfilt(butter(2, [1500 / (SR / 2), 6000 / (SR / 2)], btype="band", output="sos"), np.random.default_rng(5).standard_normal(int(0.012 * SR))) * np.linspace(1, 0, int(0.012 * SR))
def marimba(m, dur=0.35):   # staccato (dead-stroked) wooden bar: modal partials + a short felt-mallet noise click + slight inharmonic detune
    x = modal(mtof(m), dur, [1, 3.98, 9.4, 1.003], [0.16, 0.05, 0.015, 0.14], [1, 0.35, 0.08, 0.3]); x[:len(MALLET)] += MALLET * 0.25
    return x
def musicbox(m, dur=1.2): return modal(mtof(m), dur, [1, 2.0, 5.4, 8.9], [0.6, 0.3, 0.12, 0.05], [1, 0.25, 0.2, 0.08])

def reed(m, dur, vib=1.0, att=0.05):   # soft clarinet-like reed: odd harmonics, breath noise, gentle vibrato, low-passed
    n = int(dur * SR); t = np.arange(n) / SR
    f = mtof(m) * (1 + 0.006 * vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.3)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(h * ph) / h ** 1.8 for h in (1, 3, 5, 7)) + 0.05 * sum(np.sin(h * ph) / h ** 2 for h in (2, 4))
    x += 0.03 * sosfilt(butter(2, [800 / (SR / 2), 3000 / (SR / 2)], btype="band", output="sos"), rng.standard_normal(n))
    x = sosfilt(butter(2, 1600 / (SR / 2), output="sos"), x)
    return x * np.minimum(1, t / att) * np.minimum(1, (dur - t) / 0.08)

def pad(ms, dur):   # soft string-ish pad (detuned, low-passed saw-ish)
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for d in (-0.08, 0.08):
            f = mtof(m) * 2 ** (d / 12); x += sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 2, 3, 4))
    x = sosfilt(butter(2, 1500 / (SR / 2), output="sos"), x)
    return x * np.minimum(1, t / 0.5) * np.minimum(1, (dur - t) / 0.6) / len(ms)

# v2: REAL instrument one-shots (Freesound CC0, mostly the VSCO-2 CE library by sgossner), pitch-shifted by resampling
# from the nearest sample: violin pizzicato (melody), standup bass + cello pizzicato (walking bass), marimba, clarinet
CM3 = r"F:/Claude Proyectos/pieces/digger-03-lock/audio/cand_music"
def _smp(path, midi):
    x = load(path); a = np.abs(x); env = np.convolve(a, np.ones(441) / 441, "same"); end = len(x)
    above = np.where(env > env.max() * 0.004)[0]; end = above[-1] if len(above) else end
    return (midi, x[:end])
SAMPLES = {
    "pizz": [_smp(f"{CM3}/pizz/374522.mp3", 57), _smp(f"{CM3}/pizz/374524.mp3", 59), _smp(f"{CM3}/pizz/374519.mp3", 66), _smp(f"{CM3}/pizz/374521.mp3", 79)],
    "bass": [_smp(f"{CM3}/upright/383697.mp3", 37), _smp(f"{CM3}/pizz/372743.mp3", 40)],
    "marimba": [_smp(f"{CM3}/marimba/373578.mp3", 83)],
    "clar": [_smp(f"{CM3}/clarinet/257968.mp3", 60)],   # pitches verified by spectrum (374521 = G5, 257968 = C4)
}
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

# chords per bar: (bass root midi, chord tones, quality 'M'/'m')
D, Bm, G, A, Fm = (38, [62, 66, 69], "M"), (47, [62, 66, 71], "m"), (43, [62, 67, 71], "M"), (45, [61, 64, 69], "M"), (42, [61, 66, 69], "m")
PROG = [D, Bm, G, A, D, Fm, G, A]
# melody (pizz): per bar (8th step, length in 8ths, midi). Skipping, sunny, with rests for the voice
MEL = [[(0, 1, 74), (1, 1, 78), (2, 1, 81), (3, 1, 78), (4, 2, 79), (6, 1, 78), (7, 1, 76)],
       [(0, 2, 74), (2, 1, 71), (3, 1, 74), (4, 1, 78), (5, 1, 76), (6, 2, 74)],
       [(0, 1, 79), (1, 1, 83), (2, 1, 86), (3, 1, 83), (4, 2, 81), (6, 1, 79), (7, 1, 78)],
       [(0, 3, 76), (3, 1, 73), (4, 1, 76), (5, 1, 81), (6, 2, 85)],
       [(0, 1, 86), (1, 1, 85), (2, 1, 86), (3, 1, 81), (4, 2, 78), (6, 1, 74), (7, 1, 76)],
       [(0, 1, 78), (2, 1, 81), (3, 1, 78), (4, 1, 81), (5, 1, 85), (6, 2, 81)],
       [(0, 2, 83), (2, 1, 81), (3, 1, 79), (4, 1, 76), (5, 1, 79), (6, 2, 78)],
       [(0, 2, 76), (2, 1, 78), (3, 1, 73), (4, 4, 74)]]
# clarinet answers (bars 5-8 of each 8): (beat, beats, midi)
REED = {4: [(2, 2, 66)], 5: [(2, 1.5, 69), (3.5, 0.5, 68)], 6: [(2, 2, 67)], 7: [(0, 1, 64), (1, 3, 66)]}
in_brk = lambda t: BRK[0] <= t < BRK[1]
B_END = int(T_OUT // BAR)
for b in range(B_END + 1):
    t0 = b * BAR; brk = in_brk(t0 + 0.01); intro = b < 1
    root, ch, q = PROG[b % 8]; nroot = PROG[(b + 1) % 8][0]
    if t0 >= T_OUT: break
    # walking bass: root, 5th, 3rd/6th, chromatic approach into the next root (half-step below or above)
    if not brk:
        third = root + (4 if q == "M" else 3)
        walk = [root, root + 7, third + 12 if third + 12 - root < 14 else third, nroot - 1 if (b % 2) else nroot + 1]
        for i, m in enumerate(walk): place(stems["bass"], upright(m, 0.92 * BEAT), t0 + i * BEAT)
    else:
        place(stems["bass"], upright(root, 1.9 * BEAT), t0); place(stems["bass"], upright(root + 7, 1.9 * BEAT), t0 + 2 * BEAT)
    # marimba: staccato off-beat stabs on the "and" of 2 and 4 (sparser in the breakdown)
    if not intro:
        for s in ((3, 7) if not brk else (3,)):
            for m in ch: place(stems["marimba"], marimba(m + 12) * 0.45, t0 + s * S8)
    if brk: place(stems["pad"], pad(ch, BAR + 0.4), t0)
    if b >= 2 and not brk:   # muted pizz melody; every 4th bar thinner (room for the voice)
        for s, l, m in MEL[b % 8]:
            if b % 4 == 3 and s % 2: continue
            place(stems["pluck"], pizz(m, max(0.18, l * S8 * 1.2)), t0 + s * S8)
        for bt, ln, m in REED.get(b % 8, []):   # the reed answers in the second half of the 8 bars
            if b >= 4: place(stems["reed"], clar(m, ln * BEAT * 0.95), t0 + bt * BEAT)
    if brk:   # breakdown: slow reed line over the pad + music box
        place(stems["reed"], clar(ch[2], 2 * BEAT * 0.95), t0); place(stems["reed"], clar(ch[1], 2 * BEAT * 0.95), t0 + 2 * BEAT)
    if b % 4 == 0 or brk:   # music box: rising arpeggio at phrase starts, slow arpeggio in the breakdown
        seq = [86, 81, 86] if not brk else [ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]
        for i, m in enumerate(seq): place(stems["box"], musicbox(m) * 0.45, t0 + i * (S8 if not brk else BEAT))
    if not intro and not brk:   # soft kit: kick 1 and 3, finger snaps 2 and 4, light hats, shaker 16ths
        for s in (0, 4): place(stems["drums"], KICK * 0.8, t0 + s * S8)
        if b % 2: place(stems["drums"], KICK * 0.45, t0 + 7 * S8)
        for s in (2, 6): place(stems["drums"], SNAP * 0.55, t0 + s * S8)
        for s in range(8): place(stems["drums"], HAT * (0.22 if s % 2 else 0.32), t0 + s * S8)
        for s in range(16): place(stems["drums"], SHAK * (0.08 if s % 2 else 0.13), t0 + s * S8 / 2)
        if in_brk(t0 + BAR + 0.01):   # tiptoe fill into the breakdown
            for k in range(4): place(stems["drums"], SNAP * (0.25 + 0.08 * k), t0 + (12 + k) * S8 / 2)
# "Sneaky.": the band stops dead (30 ms fade), low reed + pizz tiptoe up chromatically, the groove re-enters on the beat
if STING is not None:
    g0 = STING - 0.04; back = np.ceil((STING + 1.1) / BEAT) * BEAT
    for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "reed"):
        i0, i1 = int(g0 * SR), int(back * SR); f = int(0.03 * SR)
        stems[k][i0:i0 + f] *= np.linspace(1, 0, f); stems[k][i0 + f:i1] = 0; stems[k][i1:i1 + f] *= np.linspace(0, 1, f)
    for i, m in enumerate([74, 81]):   # pea-pop: two quick high pizz flicks
        place(stems["sting"], pizz(m + 12, 0.12) * 0.9, STING + 0.22 + i * 0.09)
    place(stems["sting"], reed(43, 0.36, vib=0.2) * 0.9, STING + 0.5); place(stems["sting"], reed(41, 0.3, vib=0.2) * 0.8, STING + 0.84)   # harrumph
# outro: resolve on Bb: pizz strum + music box jingle + low Bb + reed note, pad tail to the end
tj = T_OUT
for i, m in enumerate([50, 54, 57, 62, 66]): place(stems["pluck"], pizz(m + 12, 1.2), tj + i * 0.035)
for i, m in enumerate([86, 81, 86, 93]): place(stems["box"], musicbox(m, 2.0) * 0.55, tj + 0.35 + i * 0.18)
place(stems["bass"], upright(38, 2.2), tj); place(stems["pad"], pad([62, 66, 69], max(0.8, END - tj + 0.3)), tj)
place(stems["reed"], clar(66, min(2.0, max(0.5, END - tj - 0.2))) * 0.7, tj + 0.1)
place(stems["drums"], KICK * 0.8, tj)
cut = int(T_OUT * SR); stems["marimba"][cut + int(0.1 * SR):] = 0
LV = {"bass": 1.2, "pluck": 0.75, "marimba": 0.32, "box": 0.07, "drums": 0.45, "pad": 0.12, "reed": 0.32, "sting": 0.55}
for k in stems: stems[k] = sosfilt(butter(2, 30 / (SR / 2), btype="high", output="sos"), stems[k]) * LV[k]
stems["pluck"] = sosfilt(butter(2, 5500 / (SR / 2), output="sos"), stems["pluck"])
for k in stems: stems[k] = sosfilt(butter(4, 15500 / (SR / 2), output="sos"), stems[k])
fo = int(0.4 * SR); n_end = int(END * SR)
out = sum(stems.values())[:n_end + fo]
if len(out) > n_end - fo: out[n_end - fo:] *= np.concatenate([np.linspace(1, 0, fo), np.zeros(max(0, len(out) - n_end))])[:len(out) - (n_end - fo)]
pk = np.abs(out).max() / 0.7
os.makedirs(os.path.dirname(OUT), exist_ok=True)
for k, x in stems.items(): sf.write(OUT.replace(".wav", f"_stem_{k}.wav"), (x[:len(out)] / pk).astype(np.float32), SR)
sf.write(OUT, (out / pk).astype(np.float32), SR)
print("music5", round(len(out) / SR, 2), "s; bars", B_END + 1, "bpm", BPM, "breakdown", BRK, "sting", STING, "outro", T_OUT)

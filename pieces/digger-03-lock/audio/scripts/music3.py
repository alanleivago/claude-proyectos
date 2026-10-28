# music3.py SECTIONS.json OUT.wav  -> OUT.wav (+ OUT_stem_<name>.wav)
# Digger 02 "the toilet": ORIGINAL playful bed, same family as ep01 v3 (music2.py: round real-register bass, plucked
# melody, marimba off-beats, music box, soft CC0 kit) but a new tune: 108 BPM in G major, oom-pah "plumbing" bounce
# (root/fifth bass with chromatic walk-ups), ukulele-like Karplus-Strong plucks with cheeky chromatic grace notes,
# progression I-IV-I-V | IV-V-vi-V/V (G C G D | C D Em A7-D). A comic low "bassoon" slide is the Gross sting.
# SECTIONS.json: {"dur": total s, "breakdown": [t0, t1], "gross": t, "outro": t, "end": dur}
import sys, os, json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100
SEC = json.load(open(sys.argv[1])); OUT = sys.argv[2]
DUR = SEC["dur"]; BRK = SEC.get("breakdown", [-1, -1]); GROSS = SEC.get("gross"); T_OUT = SEC.get("outro", DUR - 3); END = SEC.get("end", DUR)
CM = r"F:/Claude Proyectos/pieces/digger-01-fridge/audio/cand_music"   # CC0 one-shots (CREDITS: johnnydekk, Brandao38, sgossner, MrFossy)
BPM = 108; BEAT = 60 / BPM; BAR = 4 * BEAT; S8 = BEAT / 2
N = int((END + 0.5) * SR); rng = np.random.default_rng(11)
stems = {k: np.zeros(N) for k in ("bass", "pluck", "marimba", "box", "drums", "pad", "sting")}
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def place(buf, x, t):
    i = int(round(t * SR)); j = min(len(buf), i + len(x))
    if 0 <= i < len(buf): buf[i:j] += x[:j - i]

def load(p):
    raw = subprocess.run(["ffmpeg", "-v", "quiet", "-i", p, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, timeout=60).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64); a = np.abs(x); i0 = int(np.argmax(a > a.max() * 0.05))
    x = x[max(0, i0 - 40):]; return x / (np.abs(x).max() + 1e-9)

def ks(freq, dur, bright=0.5, decay=0.995):   # Karplus-Strong plucked string (ukulele / pizzicato)
    n = int(dur * SR); P = max(2, int(round(SR / freq))); buf = (rng.random(P) * 2 - 1)
    buf = sosfilt(butter(1, min(0.99, 0.15 + bright * 0.6), output="sos"), buf)
    out = np.empty(n); prev = buf.copy(); k = 0
    while k < n:
        m = min(P, n - k); out[k:k + m] = prev[:m]
        nxt = decay * 0.5 * (prev + np.roll(prev, 1)); nxt[0] = decay * 0.5 * (prev[0] + prev[-1]); prev = nxt; k += m
    e = np.ones(n); r = int(min(0.03, dur / 3) * SR); e[-r:] = np.linspace(1, 0, r); return out * e

def modal(freq, dur, ratios, decays, amps):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for r, d, a in zip(ratios, decays, amps): x += a * np.sin(2 * np.pi * freq * r * t) * np.exp(-t / d)
    return x * np.minimum(1, t / 0.002)
def marimba(m, dur=0.5): return modal(mtof(m), dur, [1, 3.93, 9.2], [0.3, 0.09, 0.035], [1, 0.45, 0.18])
def musicbox(m, dur=1.2): return modal(mtof(m), dur, [1, 2.0, 5.4, 8.9], [0.6, 0.3, 0.12, 0.05], [1, 0.25, 0.2, 0.08])

def bass(m, dur):   # round plucked bass (fundamental + decaying 2nd/3rd), tanh warmth
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(4 * np.pi * f * t) * np.exp(-t / 0.1) + 0.18 * np.sin(6 * np.pi * f * t) * np.exp(-t / 0.05)
    e = np.minimum(1, t / 0.01) * (0.5 + 0.5 * np.exp(-t / 0.15)); r = int(min(0.05, dur / 3) * SR); e[-r:] *= np.linspace(1, 0, r)
    return np.tanh(1.7 * x * e) / np.tanh(1.7)

def pad(ms, dur):
    n = int(dur * SR); t = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for d in (-0.07, 0.07):
            f = mtof(m) * 2 ** (d / 12); x += sum(np.sin(2 * np.pi * f * k * t) / k ** 2 for k in (1, 3, 5))
    return x * np.minimum(1, t / 0.45) * np.minimum(1, (dur - t) / 0.6) / len(ms)

def bassoon(m0, m1, dur):   # comic low reed: band-limited saw with a downward glide + slow vibrato, soft attack
    n = int(dur * SR); t = np.arange(n) / SR; k = t / dur
    f = mtof(m0) * (mtof(m1) / mtof(m0)) ** np.clip(k * 1.3, 0, 1) * (1 + 0.012 * np.sin(2 * np.pi * 5.5 * t) * k)
    ph = 2 * np.pi * np.cumsum(f) / SR; x = sum(np.sin(h * ph) / h for h in range(1, 9))
    x = sosfilt(butter(2, 1400 / (SR / 2), output="sos"), x)
    return x * np.minimum(1, t / 0.04) * np.minimum(1, (dur - t) / 0.12)

KICK, HAT, SHAK, SNAP = load(f"{CM}/kick/581457.mp3")[:int(0.35 * SR)], load(f"{CM}/hat/504929.mp3")[:int(0.12 * SR)], load(f"{CM}/shaker/375633.mp3")[:int(0.2 * SR)], load(f"{CM}/clap/589137.mp3")[:int(0.25 * SR)]
for s in (KICK, HAT, SHAK, SNAP): s[-200:] *= np.linspace(1, 0, 200)

# (name, bass root midi, chord tones) per HALF bar (8 bars x 2): G C G D | C D Em A7 D
G, C, D, Em, A7 = (43, [67, 71, 74]), (36, [64, 67, 72]), (38, [66, 69, 74]), (40, [64, 67, 71]), (45, [64, 67, 73])
PROG = [[G, G], [C, C], [G, G], [D, D], [C, C], [D, D], [Em, Em], [A7, D]]
# melody: per bar, (8th step, length in 8ths, midi); grace = chromatic lower neighbour 1/32 before (cheeky)
MEL = [[(0, 1, 74), (1, 1, 71), (2, 1, 74), (3, 1, 79), (4, 2, 78), (6, 2, 76)],
       [(0, 1, 76), (1, 1, 72), (2, 1, 76), (3, 1, 79), (4, 3, 81), (7, 1, 79)],
       [(0, 1, 79), (1, 1, 78), (2, 1, 79), (3, 1, 74), (4, 2, 71), (6, 1, 72), (7, 1, 73)],
       [(0, 3, 74), (3, 1, 78), (4, 1, 81), (5, 1, 78), (6, 2, 74)],
       [(0, 1, 76), (1, 1, 79), (2, 1, 84), (3, 1, 79), (4, 2, 76), (6, 2, 72)],
       [(0, 1, 74), (1, 1, 78), (2, 1, 81), (3, 1, 78), (4, 2, 74), (6, 1, 78), (7, 1, 79)],
       [(0, 2, 83), (2, 1, 79), (3, 1, 76), (4, 2, 71), (6, 2, 76)],
       [(0, 2, 73), (2, 1, 76), (3, 1, 79), (4, 2, 78), (6, 1, 74), (7, 1, 74)]]
GRACE = {(0, 3), (1, 4), (3, 4), (5, 2), (6, 0)}   # (bar, step) with a chromatic grace note
in_brk = lambda t: BRK[0] <= t < BRK[1]
B_END = int(T_OUT // BAR)
for b in range(B_END + 1):
    t0 = b * BAR; brk = in_brk(t0 + 0.01); intro = b < 1
    for h in (0, 1):
        root, ch = PROG[b % 8][h]; th = t0 + h * 2 * BEAT
        if th >= T_OUT: break
        # bass: oom-pah bounce: root on the beat, fifth on the next; 8th pickup walking up into the next chord
        if not brk:
            place(stems["bass"], bass(root, 0.9 * BEAT), th); place(stems["bass"], bass(root + 7, 0.45 * S8 * 2), th + BEAT)
            if h == 1: place(stems["bass"], bass(root + 9 if b % 2 else root + 11, 0.4 * S8 * 2), th + BEAT + S8)
        else: place(stems["bass"], bass(root, 1.9 * BEAT), th)
        # marimba off-beat stabs (the "and" of each beat), sparser in the breakdown
        if not intro:
            for s in ((1, 3) if not brk else (2,)):
                for m in ch: place(stems["marimba"], marimba(m) * 0.5, th + s * S8)
        if brk: place(stems["pad"], pad(ch, 2 * BEAT + 0.4), th)
    if b >= 2 and not brk:   # ukulele melody; every 4th bar thinner (room for the voice)
        for s, l, m in MEL[b % 8]:
            if b % 4 == 3 and s % 2: continue
            tt = t0 + s * S8
            if (b % 8, s) in GRACE: place(stems["pluck"], ks(mtof(m - 1), 0.12, bright=0.8) * 0.6, tt - S8 / 4)
            place(stems["pluck"], ks(mtof(m), max(0.22, l * S8 * 1.4), bright=0.6, decay=0.994), tt)
    if b % 4 == 0 or brk:   # music box: rising arpeggio at phrase starts, slow arpeggio in the breakdown
        ch = PROG[b % 8][0][1]
        seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12] if not brk else [ch[2] + 12, ch[1] + 12, ch[0] + 12, ch[1] + 12]
        for i, m in enumerate(seq): place(stems["box"], musicbox(m) * 0.5, t0 + i * (S8 if not brk else BEAT))
    if not intro and not brk:   # soft kit: kick 1 and 3 (oom), snap 2 and 4 (pah), hats 8ths, shaker 16ths
        for s in (0, 4): place(stems["drums"], KICK * 0.85, t0 + s * S8)
        if b % 2: place(stems["drums"], KICK * 0.5, t0 + 7 * S8)
        for s in (2, 6): place(stems["drums"], SNAP * 0.5, t0 + s * S8)
        for s in range(8): place(stems["drums"], HAT * (0.28 if s % 2 else 0.38), t0 + s * S8)
        for s in range(16): place(stems["drums"], SHAK * (0.1 if s % 2 else 0.16), t0 + s * S8 / 2)
        if in_brk(t0 + BAR + 0.01) or (BRK[1] > 0 and abs((t0 + BAR) - BRK[0]) < BAR / 2):   # fill into the breakdown
            for k in range(4): place(stems["drums"], SNAP * (0.3 + 0.1 * k), t0 + (12 + k) * S8 / 2)
# Gross: the band stops dead on the word (fast 30 ms fade), a comic low bassoon "bwa-bwaaa" slides down, the groove
# re-enters on the next beat after ~0.85 s
if GROSS is not None:
    g0 = GROSS - 0.04; back = np.ceil((GROSS + 0.85) / BEAT) * BEAT
    for k in ("bass", "pluck", "marimba", "box", "drums", "pad"):
        i0, i1 = int(g0 * SR), int(back * SR); f = int(0.03 * SR)
        stems[k][i0:i0 + f] *= np.linspace(1, 0, f); stems[k][i0 + f:i1] = 0; stems[k][i1:i1 + f] *= np.linspace(0, 1, f)
    place(stems["sting"], bassoon(50, 49, 0.22) * 0.9, GROSS + 0.3); place(stems["sting"], bassoon(49, 43, 0.55), GROSS + 0.55)
# outro: resolve on G: uke strum + music box jingle + low G, pad tail to the end
tj = T_OUT
for i, m in enumerate([55, 59, 62, 67, 71]): place(stems["pluck"], ks(mtof(m + 12), 1.4, bright=0.7), tj + i * 0.035)
for i, m in enumerate([86, 83, 91]): place(stems["box"], musicbox(m, 2.0) * 0.6, tj + 0.35 + i * 0.22)
place(stems["bass"], bass(43, 2.2), tj); place(stems["pad"], pad([67, 71, 74], max(0.8, END - tj + 0.3)), tj)
place(stems["drums"], KICK * 0.8, tj)
cut = int(T_OUT * SR)
for k in ("marimba",): stems[k][cut + int(0.1 * SR):] = 0
LV = {"bass": 1.1, "pluck": 0.8, "marimba": 0.4, "box": 0.2, "drums": 0.36, "pad": 0.2, "sting": 0.55}
for k in stems: stems[k] = sosfilt(butter(2, 30 / (SR / 2), btype="high", output="sos"), stems[k]) * LV[k]
stems["pluck"] = sosfilt(butter(2, 7500 / (SR / 2), output="sos"), stems["pluck"])
for k in stems: stems[k] = sosfilt(butter(4, 15500 / (SR / 2), output="sos"), stems[k])
fo = int(0.4 * SR); n_end = int(END * SR)
out = sum(stems.values())[:n_end + fo]; out[n_end - fo:] *= np.concatenate([np.linspace(1, 0, fo), np.zeros(len(out) - n_end)]) if len(out) > n_end else 1
pk = np.abs(out).max() / 0.7
os.makedirs(os.path.dirname(OUT), exist_ok=True)
for k, x in stems.items(): sf.write(OUT.replace(".wav", f"_stem_{k}.wav"), (x[:len(out)] / pk).astype(np.float32), SR)
sf.write(OUT, (out / pk).astype(np.float32), SR)
print("music3", round(len(out) / SR, 2), "s; bars", B_END + 1, "bpm", BPM, "breakdown", BRK, "gross", GROSS, "outro", T_OUT)

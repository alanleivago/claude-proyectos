# music_edit.py: the bar-line edit of "Ethernight Club" (K. MacLeod, CC BY 4.0) for luckier, rendered to work/music_edit.wav
# (48 kHz stereo float, 510 s). Grid measured on the kicks (work/grid2.py): 117.0 BPM, beats at 0.0174 + n * 0.512821 s,
# downbeats on beats = 0 mod 4, 8-bar phrases (section changes at beats 32, 64, 128 ...). Bar b starts at BAR(b).
# Processing per segment: "full" (the mix as is), "harm" (the harmonic part of an HPSS split: the drums dropped),
# lp = a low-pass cutoff (Hz), rev = wet share of a seeded synthetic hall (a filtered pad for the island).
# Deterministic: no randomness except the seeded reverb IR. The music bus levels live in sounddesign.json.
import os, io, json, subprocess, zlib
import numpy as np, soundfile as sf
from scipy import signal

SR = 48000; N = int(510.0 * SR)
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(A, "assets", "music", "km_ethernight-club.mp3")
P = 60 / 117.0; O = 0.0174
def BAR(b): return O + 4 * P * b
LB = 4 * P

def load():
    r = subprocess.run(["ffmpeg", "-v", "quiet", "-i", SRC, "-f", "wav", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True)
    x, _ = sf.read(io.BytesIO(r.stdout), always_2d=True); return x

full = load()
hp = os.path.join(A, "work", "music_harm.wav")
if os.path.exists(hp):
    harm, _ = sf.read(hp, always_2d=True)
else:
    import librosa
    harm = np.stack([librosa.istft(librosa.decompose.hpss(librosa.stft(full[:, c], n_fft=4096, hop_length=1024), margin=(1.0, 3.0))[0],
                                   hop_length=1024, length=len(full)) for c in (0, 1)], 1)
    sf.write(hp, harm.astype(np.float32), SR, subtype="FLOAT")

def hall(seconds=3.2, seed=117):
    r = np.random.default_rng(seed + zlib.crc32(b"hall")); n = int(seconds * SR); t = np.arange(n) / SR
    ir = r.standard_normal((n, 2)) * (10 ** (-3 * t / seconds))[:, None]
    ir = signal.sosfilt(signal.butter(2, [150, 3500], "band", fs=SR, output="sos"), ir, axis=0)
    ir[: int(0.02 * SR)] *= np.linspace(0, 1, int(0.02 * SR))[:, None]
    return ir / np.sqrt(np.sum(ir ** 2, 0, keepdims=True))
IR = hall()

# [first bar, last bar (inclusive), film time of the first bar, processing]
SEG = [
 (0, 1, 7.0, "full", {}, "intro bars 0-1: the coin flick, gentle marimba"),
 (0, 37, 7.0 + 2 * LB, "full", {}, "intro again; drums at bar 8 = 27.51 (the lights turn green), full section at 43.92 (the cafe bell)"),
 (36, 37, 7.0 + 40 * LB, "full", {}, "2-bar insert so the breakdown lands on 'losers' (97.26)"),
 (38, 127, 7.0 + 42 * LB, "full", {}, "continuous: breakdown 97.26, drums back 113.67, casino, storm (no-drum breakdown 212.1), big section 228.5, soft reprise 261.4"),
 (128, 143, 7.0 + 132 * LB, "harm", {"lp": 1800}, "the cost act: the full section with the drums dropped, low-passed"),
 (40, 47, 7.0 + 148 * LB, "harm", {"lp": 1400}, "breakdown, darker"),
 (96, 103, 7.0 + 156 * LB, "harm", {"lp": 1200}, "breakdown 2, darker"),
 (120, 127, 7.0 + 164 * LB, "harm", {"lp": 1000}, "the reprise, darker: signs, leave"),
]
t = 7.0 + 172 * LB; k = 0
while t < 466.0:   # the island pad: the soft intro phrase, harmonic only, low-passed, in a hall; stops by 465.9 (bus automation)
    b0 = 0 if k % 2 == 0 else 120
    SEG.append((b0, b0 + 3, t, "harm", {"lp": 900, "rev": 0.55}, "island pad"))
    t += 4 * LB; k += 1
RES = 496.0 - (300.53 - BAR(144))   # the final hit (src 300.53, on bar 146 beat 3) lands on 496.0, the end card
SEG += [
 (120, 123, RES - 10 * LB, "full", {}, "resolve: the soft reprise after the coin lands"),
 (0, 5, RES - 6 * LB, "full", {}, "resolve: the intro phrase, warm"),
 (144, 149, RES, "full", {"tail": True}, "the outro; its last note on 496.0 rings into the end card"),
]

out = np.zeros((N, 2)); log = []
PRE, XF = 0.006, 0.25
for b0, b1, at, proc, o, *lab in SEG:
    x = harm if proc == "harm" else full
    s0 = BAR(b0) - PRE; s1 = BAR(b1 + 1) + XF if not o.get("tail") else len(full) / SR
    i0, i1 = int(round(s0 * SR)), min(len(x), int(round(s1 * SR)))
    y = x[i0:i1].copy()
    if "lp" in o: y = signal.sosfiltfilt(signal.butter(4, o["lp"], "low", fs=SR, output="sos"), y, axis=0)
    if "rev" in o:
        wet = np.stack([signal.fftconvolve(y[:, c], IR[:, c])[: len(y)] for c in (0, 1)], 1)
        y = (1 - o["rev"]) * y + o["rev"] * wet * (np.sqrt(np.mean(y ** 2)) / (np.sqrt(np.mean(wet ** 2)) + 1e-12))
    fi = int(PRE * SR); y[:fi] *= np.linspace(0, 1, fi)[:, None]
    if not o.get("tail"):
        fo = int(XF * SR); y[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 2
    else:
        fo = int(2.5 * SR); y[-fo:] *= np.linspace(1, 0, fo)[:, None]
    j0 = int(round((at - PRE) * SR)); j1 = min(N, j0 + len(y)); out[j0:j1] += y[: j1 - j0]
    log.append({"bars": [b0, b1], "src": [round(BAR(b0), 3), round(BAR(b1 + 1), 3)], "at": round(at, 3), "end": round(at + (b1 + 1 - b0) * LB, 3),
                "proc": proc, **o, "label": lab[0] if lab else ""})
sf.write(os.path.join(A, "work", "music_edit.wav"), out.astype(np.float32), SR, subtype="FLOAT")
json.dump({"_doc": "Ethernight Club bar-line edit (tools/music_edit.py)", "bpm": 117.0, "beat0": O, "bar_s": LB, "segments": log},
          open(os.path.join(A, "design", "music_edit.json"), "w"), indent=1)
for l in log: print(l["at"], l["end"], l["bars"], l["proc"], l.get("lp", ""), l["label"][:60])

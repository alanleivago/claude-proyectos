"""upnext-01 ORIGINAL score in code (no samples, no existing songs): 92 BPM, C major, I-vi-IV-V, three sections like the ref
(remake/ESTILO.md section 6): A soft chiptune + glockenspiel (0 -> 22.75 s), B lo-fi beat with marimba + pizzicato bass
(-> 54.7 s), C warm plucked-guitar arpeggios + pad + bass + shaker (-> end). The music DROPS OUT for ~0.5 s right before each
punchline and comes back on it (4.0 / 7.86 / 28.7 / 42.0 / 58.0) and before the last line (70.0 -> 70.9).
out: audio/music.wav (48 kHz stereo). usage: python tools/music_upnext.py"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf

PIECE = Path(__file__).resolve().parents[1]
SR = 48000
TL = json.loads((PIECE / 'engine' / 'film_timeline.json').read_text(encoding='utf-8'))
DUR = TL['dur']
BPM = 92.0; BEAT = 60 / BPM; BAR = 4 * BEAT
A_END, B_END = 22.75, 54.7
DROPS = [(3.45, 4.0), (7.3, 7.86), (22.35, 22.95), (28.15, 28.7), (41.45, 42.0), (57.45, 58.0), (69.95, 70.9)]
rng = np.random.default_rng(7)
N = int((DUR + 3) * SR)
L = np.zeros(N); R = np.zeros(N)
midi = lambda m: 440.0 * 2 ** ((m - 69) / 12)
CH = [[48, 52, 55, 60, 64], [45, 48, 52, 57, 60], [41, 45, 48, 53, 57], [43, 47, 50, 55, 59]]   # C, Am, F, G
ROOT = [36, 33, 29, 31]


def env(n, a=0.004, d=0.3):
    t = np.arange(n) / SR; e = np.minimum(1, t / a) * np.exp(-t / d); return e


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N: return
    s = sig[: max(0, N - i)] * gain
    L[i:i + len(s)] += s * np.cos((pan + 1) * np.pi / 4); R[i:i + len(s)] += s * np.sin((pan + 1) * np.pi / 4)


def glock(f, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / d) for k, a, d in [(1, 1, 0.9), (2.76, 0.35, 0.25), (5.4, 0.15, 0.08)]) * np.minimum(1, t / 0.002)


def marimba(f, dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t / d) for k, a, d in [(1, 1, 0.35), (3.93, 0.3, 0.06), (9.2, 0.08, 0.02)]) * np.minimum(1, t / 0.003)


def soft_square(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * k * t) / k for k in (1, 3, 5, 7)) * 0.6
    return s * np.minimum(1, t / 0.01) * np.exp(-t / (dur * 0.6))


def pluck(f, dur=1.4, damp=0.996, bright=0.5):
    n = int(dur * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p) * bright + rng.uniform(-1, 1, p) * (1 - bright) * 0.3
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = damp * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    return out * np.minimum(1, np.arange(n) / (0.002 * SR))


def bass(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) + 0.08 * np.sin(6 * np.pi * f * t)) * env(n, 0.006, dur * 0.7)


def pizz(f, dur=0.5):
    return pluck(f, dur, damp=0.985, bright=0.8) * 1.2


def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR; ph = 2 * np.pi * np.cumsum(45 + 75 * np.exp(-t / 0.04)) / SR
    return np.sin(ph) * np.exp(-t / 0.12)


def hat(dur=0.05, hp=0.92):
    n = int(dur * SR); x = rng.uniform(-1, 1, n); y = np.zeros(n); prev = 0
    for i in range(n): y[i] = hp * (y[i - 1] if i else 0) + hp * (x[i] - prev); prev = x[i]
    return y * np.exp(-np.arange(n) / (dur * SR * 0.3))


def shaker(dur=0.12):
    return hat(dur, 0.85) * np.hanning(int(dur * SR))


def pad(freqs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.004):
            s += sum(np.sin(2 * np.pi * f * (1 + det) * k * t) / k for k in range(1, 6))
    a = np.minimum(1, t / 0.6) * np.minimum(1, (dur - t) / 0.6)
    y = np.zeros(n); c = 0.04
    for i in range(n): y[i] = (y[i - 1] if i else 0) + c * (s[i] - (y[i - 1] if i else 0))
    return y * a / len(freqs) * 0.5


MEL = [72, 76, 79, 76, 74, 72, 69, 72, 77, 76, 74, 72, 71, 74, 79, 77]   # a little pentatonic-ish motif over the progression
t, bar = 0.0, 0
while t < DUR + 1:
    ci = bar % 4; ch = CH[ci]; rt = midi(ROOT[ci])
    if t < A_END:                                   # A: glock motif + soft square arps, light bass
        for k in range(4):
            add(soft_square(midi(ch[(k * 2) % 5] + 12), BEAT * 0.9), t + k * BEAT, 0.035, -0.3)
        for k in range(2):
            add(glock(midi(MEL[(bar * 2 + k) % 16])), t + k * 2 * BEAT, 0.12, 0.25)
        add(bass(rt, BAR * 0.9), t, 0.26)
    elif t < B_END:                                 # B: lo-fi beat, marimba 8ths, pizzicato bass
        for k in range(4): add(kick(), t + k * BEAT, 0.28 if k % 2 == 0 else 0.0)
        for k in range(8): add(hat(), t + k * BEAT / 2 + 0.01, 0.06 if k % 2 else 0.03, 0.4)
        for k in range(8): add(marimba(midi(ch[[0, 2, 4, 2, 1, 3, 4, 3][k]] + 12)), t + k * BEAT / 2, 0.11, -0.2 + 0.05 * k)
        for k, o in enumerate([0, 0, 7, 5]): add(pizz(rt * 2 ** (o / 12) * 2), t + k * BEAT, 0.35)
        add(bass(rt, BAR * 0.9), t, 0.16)
        if bar % 2 == 0: add(glock(midi(MEL[bar % 16] + 12), 1.2), t + 3 * BEAT, 0.05, 0.5)
    else:                                           # C: warm plucks + pad + bass + shaker
        for k in range(8): add(pluck(midi(ch[[0, 2, 3, 4, 3, 2, 1, 2][k]]), 1.6), t + k * BEAT / 2, 0.16, -0.15 + 0.04 * k)
        add(pad([midi(n) for n in ch[1:4]], BAR + 0.4), t, 0.12)
        add(bass(rt, BAR * 0.95), t, 0.3)
        for k in range(8): add(shaker(), t + k * BEAT / 2, 0.025 if k % 2 else 0.012, 0.3)
        for k in range(4): add(kick(), t + k * BEAT, 0.16 if k in (0, 2) else 0.0)
        if bar % 2 == 1: add(glock(midi(MEL[(bar + 3) % 16] + 12), 1.6), t + 2 * BEAT, 0.06, -0.4)
    t += BAR; bar += 1

# small room: stereo feedback delays (no samples)
def room(x, taps=((0.031, 0.32), (0.047, 0.27), (0.071, 0.22), (0.113, 0.16), (0.167, 0.11))):
    y = x.copy()
    for d, g in taps: i = int(d * SR); y[i:] += x[:-i] * g
    return y
L, R = room(L), room(R[::-1])[::-1] * 0 + room(R)
# drops: fade out 60 ms into the gap, back on the punchline with a 20 ms fade
g = np.ones(N); ts = np.arange(N) / SR
for a, b in DROPS:
    g *= np.where(ts < a - 0.06, 1, np.where(ts < a, (a - ts) / 0.06, np.where(ts < b, 0, np.where(ts < b + 0.02, (ts - b) / 0.02, 1))))
g *= np.clip((DUR - ts) / 1.0, 0, 1)                # fade at the end
mix = np.stack([L * g, R * g], 1)[: int(DUR * SR)]
mix *= 0.5 / max(1e-6, np.abs(mix).max())
sf.write(str(PIECE / 'audio' / 'music.wav'), mix.astype(np.float32), SR, subtype='PCM_24')
print('music', mix.shape[0] / SR, 's')

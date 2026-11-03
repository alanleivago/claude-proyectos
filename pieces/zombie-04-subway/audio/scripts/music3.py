# music3.py OUT.wav — ep3 "The Police Station": bed ORIGINAL oscuro (no el juguetón del ep1/2): drone en Re menor, pulso
# grave que se acelera con la tension, sala segura tranquila (acordes suaves, guiño a las salas de guardado de RE),
# silencio antes de las luces (54.0-55.7), golpe en "light" (55.72) y caja de musica tensa en la decision. 67.6 s.
import sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
SR = 44100; DUR = 67.6; N = int(DUR * SR); t = np.arange(N) / SR
R = np.random.default_rng(3)
def env(a, b, fi=0.8, fo=0.8):   # ventana suave [a, b]
    e = np.clip((t - a) / fi, 0, 1) * np.clip((b - t) / fo, 0, 1); return e * e * (3 - 2 * e)
def lp(x, f): return sosfilt(butter(2, f, 'low', fs=SR, output='sos'), x)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
out = np.zeros((N, 2))
def add(x, g=1.0, pan=0.0): out[:, 0] += x * g * (1 - max(0, pan)); out[:, 1] += x * g * (1 + min(0, pan))
# 1) drone: Re grave + quinta, con batido lento; se oscurece en DANGER
dr = sum(np.sin(2 * np.pi * hz(m) * (1 + d) * t + p) for m in (38, 45, 50) for d, p in ((0, 0), (0.003, 1.3)))
dr = lp(dr * (0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)), 600)
mask = env(0, 54.9, 1.5, 0.3) * (1 - env(34.2, 38.6, 0.5, 0.5) * 0.3) + env(55.7, 67.4, 0.05, 1.5)   # v2: sin huecos largos (usuario: 'como si faltara')
add(dr * mask, 0.08)
# 2) pulso grave (latido) que se acelera: 60 bpm -> 90 (CAUTION) -> 120 (DANGER)
def pulses(a, b, bpm, g):
    k = a
    while k < b:
        for off, amp in ((0, 1), (0.16, 0.6)):
            i0 = int((k + off) * SR); n = int(0.25 * SR)
            if i0 + n < N:
                tt = np.arange(n) / SR; s = np.sin(2 * np.pi * (55 * np.exp(-tt * 9) + 38) * tt) * np.exp(-tt * 14)
                out[i0:i0 + n] += (s * g * amp)[:, None]
        k += 60 / bpm
pulses(7.6, 13.5, 72, 0.25); pulses(38.6, 51.85, 92, 0.3); pulses(51.85, 54.0, 124, 0.36); pulses(60.7, 67.0, 96, 0.22)
# 3) sala segura: acordes suaves de "piano" (Re menor 9 - Sib maj7) 34.2-38.6
def pluck(m, a, g, dec=2.2):
    i0 = int(a * SR); n = int(min(4, DUR - a) * SR); tt = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * hz(m) * h * tt) / h ** 1.6 for h in (1, 2, 3, 4)) * np.exp(-tt * dec) * (1 - np.exp(-tt * 300))
    out[i0:i0 + n] += (s * g)[:, None] * [0.9, 1.0]
for k, ch in enumerate(((62, 65, 69, 76), (58, 62, 65, 69), (62, 65, 69, 74), (57, 61, 64, 69))):
    for j, m in enumerate(ch): pluck(m, 34.3 + k * 1.1 + j * 0.06, 0.05)
# 4) cuerdas en tremolo que suben (46.7 -> 54.0) y se cortan secas antes de las luces
tr = sum(np.sin(2 * np.pi * hz(m) * t * (1 + 0.012 * (t - 46.7) / 7.3 * (t > 46.7))) for m in (62, 63, 69))
tr = lp(tr * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 9 * t))), 2500) * env(46.7, 54.9, 3.0, 0.03)
add(tr, 0.035)
# 5) golpe en "light" (55.72): bombo grave + ruido filtrado + acorde disonante largo
i0 = int(55.72 * SR); n = int(3.5 * SR); tt = np.arange(n) / SR
hit = np.sin(2 * np.pi * (70 * np.exp(-tt * 5) + 32) * tt) * np.exp(-tt * 2.2) + lp(R.standard_normal(n), 900) * np.exp(-tt * 6) * 0.5
hit += sum(np.sin(2 * np.pi * hz(m) * tt) for m in (50, 56, 63)) * np.exp(-tt * 1.1) * 0.25
out[i0:i0 + n] += (hit * 0.35)[:, None]
# 6) decision: caja de musica tensa (Re menor, notas sueltas) 60.7-67.2
mel = [74, 77, 76, 74, 73, 74, 69, 70, 69, 74, 77, 81]
for k, m in enumerate(mel): pluck(m, 60.8 + k * 0.52, 0.035, dec=3.5)
# v2: ostinato continuo (corcheas graves en Re menor, 92 bpm) que une todas las secciones; baja en la sala segura
arp = [50, 57, 62, 57, 50, 57, 60, 57, 46, 53, 58, 53, 45, 52, 57, 52]
step = 60 / 92 / 2; k = 0; tt0 = 0.2
while tt0 < 60.6:
    if not (54.9 <= tt0 < 55.72):
        g = 0.04 * (0.7 if 34.2 <= tt0 < 38.6 else 1.0) * (1.25 if tt0 > 38.6 else 1.0)
        pluck(arp[k % len(arp)], tt0, g, dec=5.0)
    k += 1; tt0 += step
out = out / np.max(np.abs(out)) * 0.7
out[-int(0.3 * SR):] *= np.linspace(1, 0, int(0.3 * SR))[:, None]
sf.write(sys.argv[1], out.astype(np.float32), SR); print("ok", DUR)

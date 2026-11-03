# music_an.py: Ethernight Club grid + per-bar profile (rms, percussive share, brightness, chroma) to plan the bar-line edit.
import numpy as np, librosa, json, sys
y, sr = librosa.load("assets/music/km_ethernight-club.mp3", sr=22050, mono=True)
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, hop_length=256, start_bpm=117.4, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=256)
per = np.median(np.diff(bt)); print("tempo", tempo, "beat period", per, "bpm", 60 / per, "first beats", bt[:6])
# fit a straight grid to beats
n = np.arange(len(bt)); A = np.vstack([n, np.ones_like(n)]).T; p, b0 = np.linalg.lstsq(A, bt, rcond=None)[0]
print("grid period", p, "bpm", 60 / p, "offset", b0, "resid ms", 1000 * np.std(bt - (p * n + b0)))
H, P = librosa.effects.hpss(y)
hop = 512
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)); f = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[f < 150].sum(0); fl = np.r_[0, np.maximum(0, np.diff(low))]
fr = lambda t: int(round(t * sr / hop))
b0 = b0 % p
beats_all = [b0 + p * i for i in range(int((len(y) / sr - b0) / p))]
e = np.array([fl[max(0, fr(b) - 2):fr(b) + 3].max() for b in beats_all])
for ph in range(4): print("phase", ph, "low onset", round(e[ph::4].mean(), 2))
C = librosa.feature.chroma_cqt(y=H, sr=sr, hop_length=hop)
names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
ph = int(sys.argv[1]) if len(sys.argv) > 1 else int(np.argmax([e[q::4].mean() for q in range(4)]))
bar = 4 * p; d0 = b0 + ph * p
rows = []
cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
i = 0
while d0 + bar * (i + 1) <= len(y) / sr:
    t0 = d0 + bar * i; s0, s1 = int(t0 * sr), int((t0 + bar) * sr)
    r = 20 * np.log10(np.sqrt(np.mean(y[s0:s1] ** 2)) + 1e-9); rp = 20 * np.log10(np.sqrt(np.mean(P[s0:s1] ** 2)) + 1e-9); rh = 20 * np.log10(np.sqrt(np.mean(H[s0:s1] ** 2)) + 1e-9)
    k = C[:, fr(t0):fr(t0 + bar)].mean(1); top = np.argsort(-k)[:3]
    rows.append({"bar": i, "t": round(t0, 3), "rms": round(r, 1), "perc": round(rp, 1), "harm": round(rh, 1), "cent": int(cent[fr(t0):fr(t0 + bar)].mean()), "chord": " ".join(names[q] for q in top)})
    i += 1
print("downbeat phase", ph, "first downbeat", round(d0, 4), "bar", round(bar, 4))
for r in rows: print(f"{r['bar']:3d} {r['t']:7.2f} rms{r['rms']:6.1f} perc{r['perc']:6.1f} harm{r['harm']:6.1f} cent{r['cent']:5d} {r['chord']}")
json.dump({"period": p, "bar": bar, "d0": d0, "rows": rows}, open("work/music_bars.json", "w"), indent=1)

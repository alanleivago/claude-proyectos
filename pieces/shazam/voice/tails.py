"""Report how each take ends: dB per 10 ms over the last 0.5 s, and the fall time from -30 to -60 dB (a natural
   word end takes >= 80 ms; a clipped one is < 50 ms)."""
import sys, numpy as np, soundfile as sf
for f in sys.argv[1:]:
    x, sr = sf.read(f, always_2d=True); m = x.mean(1); n = sr // 100; db = 20 * np.log10(np.sqrt((m[:len(m) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    last = max(i for i in range(len(db)) if db[i] > -30); fall = next((i for i in range(last, len(db)) if db[i] < -60), len(db)) - last
    print(f'{f}: fall {fall * 10} ms, end at {last / 100:.2f}/{len(db) / 100:.2f} s, tail after word {len(db) / 100 - last / 100:.2f} s', 'CLIPPED' if fall < 5 or len(db) - last < 6 else 'ok')

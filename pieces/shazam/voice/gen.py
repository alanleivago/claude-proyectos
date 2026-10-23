"""Regenerate every paragraph with VoiceStudio /generate and a target duration 15 % longer than the model's own guess,
   so the last syllable is not clipped. Retries (new seed, +8 % more) until the ending falls naturally (>= 60 ms)."""
import subprocess, os, sys, json, numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); paras = [l.strip() for l in open(os.path.join(D, 'paras.txt'), encoding='utf-8') if l.strip()]
def fall(f):
    x, sr = sf.read(f, always_2d=True); m = x.mean(1); n = sr // 100; db = 20 * np.log10(np.sqrt((m[:len(m) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    last = max(i for i in range(len(db)) if db[i] > -30); return (next((i for i in range(last, len(db)) if db[i] < -60), len(db)) - last) * 10, len(db) - last
only = [int(a) for a in sys.argv[1:]] or range(1, len(paras) + 1)
for k in only:
    old = os.path.join(D, 'raw', f'p{k:02d}.wav'); base = sf.info(old).duration if os.path.exists(old) else 0.075 * len(paras[k - 1])
    dur = base * 1.15; out = os.path.join(D, 'raw2', f'p{k:02d}.wav')
    for t in range(4):
        subprocess.run(['curl', '-s', '-X', 'POST', 'http://127.0.0.1:3900/generate', '-F', f'text={paras[k - 1]}', '-F', 'language=Spanish', '-F', 'profile_id=0381b8fe', '-F', 'num_step=32', '-F', f'duration={dur:.2f}', '-F', f'seed={1000 + k * 10 + t}', '-o', out], check=True)
        f, tail = fall(out); print(f'p{k:02d} try {t}: dur {dur:.2f} -> fall {f} ms, tail {tail * 10} ms', flush=True)
        if f >= 60 and tail >= 12: break
        dur *= 1.08

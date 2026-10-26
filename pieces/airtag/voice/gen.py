"""VoiceStudio takes, one per paragraph (profile "scroll 2 buena español"). First take at the model's own length;
   if the last syllable is clipped (fall < 60 ms), retry with a target duration 15 % longer, then +8 % per try."""
import subprocess, os, sys, numpy as np, soundfile as sf
D = os.path.dirname(os.path.abspath(__file__)); paras = [l.strip() for l in open(os.path.join(D, 'paras.txt'), encoding='utf-8') if l.strip()]
def fall(f):
    x, sr = sf.read(f, always_2d=True); m = x.mean(1); n = sr // 100; db = 20 * np.log10(np.sqrt((m[:len(m) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-9)
    last = max(i for i in range(len(db)) if db[i] > -30); return (next((i for i in range(last, len(db)) if db[i] < -60), len(db)) - last) * 10, len(db) - last
only = [int(a) for a in sys.argv[1:]] or range(1, len(paras) + 1)
for k in only:
    out = os.path.join(D, 'raw', f'p{k:02d}.wav'); dur = None
    for t in range(5):
        cmd = ['curl', '-s', '-X', 'POST', 'http://127.0.0.1:3900/generate', '-F', f'text={paras[k - 1]}', '-F', 'language=Spanish', '-F', 'profile_id=44a50a60', '-F', 'num_step=32', '-F', f'seed={2000 + k * 10 + t}', '-o', out]
        if dur: cmd[-2:-2] = ['-F', f'duration={dur:.2f}']
        subprocess.run(cmd, check=True)
        f, tail = fall(out); L = sf.info(out).duration; print(f'p{k:02d} try {t}: {L:.2f}s fall {f} ms tail {tail * 10} ms', flush=True)
        if f >= 60 and tail >= 12: break
        dur = (dur or L) * (1.15 if dur is None else 1.08)

# cut each picked take to the first word (energy onset after the stray blip at 0.1-0.2 s) and just past the last word
import json, numpy as np, soundfile as sf
pick = json.load(open('takes/pick.json')); sc = json.load(open('takes/scores.json'))
for id, seed in pick.items():
    row = [r for r in sc[id] if r[1] == seed][0]; w0, w1 = row[6], row[7]
    a, sr = sf.read(f'takes/{id}_s{seed}.wav'); a = a if a.ndim == 1 else a.mean(1)
    hop = int(sr * 0.01); fr = a[:len(a) // hop * hop].reshape(-1, hop); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    floor = np.percentile(db, 10); thr = max(floor + 18, -42)
    i0 = int(max(0.24, w0 - 0.25) / 0.01); on = None
    for i in range(i0, len(db) - 5):
        if (db[i:i + 5] > thr).all(): on = i; break
    s = max(int(0.23 * sr), int(((on if on is not None else w0 * 100) * 0.01 - 0.03) * sr))
    loud = [i for i in range(int(w1 * 100), len(db)) if db[i] > thr]   # the true end of the last word (whisper's w1 can be early)
    e = min(len(a), int(((loud[-1] + 1) * 0.01 + 0.15) * sr) if loud else int((w1 + 0.3) * sr))
    seg = a[s:e].copy(); f = int(0.03 * sr); seg[-f:] *= np.linspace(1, 0, f); seg[:int(0.005 * sr)] *= np.linspace(0, 1, int(0.005 * sr))
    sf.write(f'{id}.wav', seg, sr); print(id, seed, 'start', round(s / sr, 3), 'w0', w0, 'len', round(len(seg) / sr, 2))

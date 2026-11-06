# cut each picked take to its speech without ever clipping a word: energy segments (10 ms frames), a short isolated blip at the
# very start (the TTS click) is dropped, start = first speech - 100 ms, end = last speech + 250 ms; 15 ms fade-in, 20 ms fade-out.
# no time-stretch. usage: python trim2.py [ids...]
import json, sys, numpy as np, soundfile as sf
pick = json.load(open('takes/pick.json')); only = sys.argv[1:] or list(pick)
for id in only:
    a, sr = sf.read(f'takes/{id}_s{pick[id]}.wav'); a = a if a.ndim == 1 else a.mean(1)
    hop = int(sr * 0.01); fr = a[:len(a) // hop * hop].reshape(-1, hop); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
    floor = np.percentile(db, 10); thr = max(floor + 14, -50); on = db > thr
    segs = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            if segs and i - segs[-1][1] < 12: segs[-1][1] = j
            else: segs.append([i, j])
            i = j
        else: i += 1
    if len(segs) > 1 and segs[0][1] - segs[0][0] <= 25 and segs[0][0] < 40 and segs[1][0] - segs[0][1] > 12: blip_end = segs[0][1]; segs = segs[1:]
    else: blip_end = 0
    loud = np.median(db[on]) if on.any() else -20; onset = next(k for k in range(len(db) - 3) if (db[k:k + 3] > loud - 10).all())
    q = [k for k in range(max(0, onset - 40), onset) if db[k] < -45]   # the quiet just before speech (after the TTS blip)
    k0 = q[-1] if q else max(0, onset - 12)
    while k0 > 0 and db[k0 - 1] < -45 and q and q[-1] - k0 < 4: k0 -= 1
    s = k0 * hop
    soft = [k for k in range(len(db)) if db[k] > -55]; e = min(len(a), (soft[-1] + 16) * hop)   # 160 ms past the last audible frame
    seg = a[s:e].copy(); fi, fo = int(0.015 * sr), int(0.02 * sr)
    seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo)
    sf.write(f'{id}.wav', seg, sr)
    print(id, pick[id], round(s / sr, 3), round(e / sr, 3), 'tail_db', round(float(db[min(len(db) - 1, segs[-1][1] + 24)]), 1))

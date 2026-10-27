import glob, os, json, re, numpy as np, soundfile as sf, scipy.signal as ss
import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
import sys; sys.path.insert(0, ".")
from analyze import speech_intervals
accts = ["sinaboto","yurinasama","kingpinrin","momomakes64","yuimasensei","polygoth8","yuki.science"]
os.makedirs("clips", exist_ok=True); W = 5.0
best = {}
for a in accts:
    cands = []
    for p in sorted(glob.glob(f"wav/{a}__*.wav")):
        vid = os.path.basename(p)[:-4].split("__")[1]
        x, sr = sf.read(p); m = x.mean(1)
        iv, _ = speech_intervals(a, vid, len(m)/sr)
        # gaps between consecutive intervals
        gaps = [(e1+0.08, s2-0.03) for (s1,e1),(s2,e2) in zip(iv, iv[1:]) if s2-e1 > 0.18]
        def rms(s,e): seg = m[int(s*sr):int(e*sr)]; return np.sqrt(np.mean(seg**2)+1e-12)
        for t0 in np.arange(0.5, len(m)/sr - W - 0.5, 0.5):
            g = [rms(s,e) for s,e in gaps if s>=t0 and e<=t0+W]
            if len(g) < 2: continue
            sp = rms(t0, t0+W)
            cands.append((20*np.log10(sp/np.mean(g)), p, t0))
    cands.sort(reverse=True)
    best[a] = cands[:3]
    for k, (score, p, t0) in enumerate(cands[:3]):
        x, sr = sf.read(p); seg = x[int(t0*sr):int((t0+W)*sr)]
        sf.write(f"clips/{a}_{k}.wav", seg, sr, subtype="PCM_16")
    print(a, [(round(s,1), os.path.basename(p), t0) for s,p,t0 in cands[:3]])
json.dump({a:[(s,p,t) for s,p,t in v] for a,v in best.items()}, open("clips/best.json","w"), indent=1)

import sys, json, numpy as np, soundfile as sf, scipy.signal as ss
FC = [80,100,125,160,200,250,315,400,500,630,800,1000,1250,1600,2000,2500,3150,4000,5000,6300,8000,10000,12500,16000]
def curve(p):
    x, sr = sf.read(p); m = x.mean(1) if x.ndim > 1 else x
    f, t, Z = ss.stft(m, sr, nperseg=4096, noverlap=3584); P = np.abs(Z)**2
    fe = 10*np.log10(P.sum(0)+1e-20); sp = fe > np.percentile(fe, 97) - 25
    L = P[:, sp].mean(1)
    out = []
    for fc in FC:
        k = (f >= fc/2**(1/6)) & (f < fc*2**(1/6)); out.append(10*np.log10(L[k].mean()+1e-20) if k.any() and fc < sr/2 else -120)
    k = (f>300)&(f<3000); ref = 10*np.log10(L[k].mean())
    return [round(v-ref,1) for v in out]
if __name__ == "__main__":
    res = {p.split("/")[-1][:-4]: curve(p) for p in sys.argv[1:]}
    print("fc   " + " ".join(f"{c:>6}" for c in FC))
    for k, v in res.items(): print(f"{k[:14]:14} " + " ".join(f"{x:6.1f}" for x in v))
    json.dump(res, open("curves.json", "w"))

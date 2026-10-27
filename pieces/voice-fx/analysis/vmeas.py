"""Measure a voice-only file (isolated or dry). Prints JSON per file."""
import sys, json, numpy as np, soundfile as sf, scipy.signal as ss, pyloudnorm as pyln, parselmouth
def measure(p):
    x, sr = sf.read(p); m = x.mean(1) if x.ndim > 1 else x
    n, hop = 4096, 512
    f, t, Z = ss.stft(m, sr, nperseg=n, noverlap=n-hop); P = np.abs(Z)**2
    fe = 10*np.log10(P.sum(0)+1e-20); top = np.percentile(fe, 97)
    sp = fe > top - 25; sil = fe < top - 45
    ltas = 10*np.log10(P[:, sp].mean(1)+1e-20)
    def band(lo, hi, s=ltas): k=(f>=lo)&(f<hi); return 10*np.log10(np.mean(10**(s[k]/10)))
    ref = band(300, 3000)
    cs = np.cumsum(10**(ltas/10)); cs/=cs[-1]
    r = {q: float(f[np.searchsorted(cs, q)]) for q in (.95,.99,.999)}
    sm = np.convolve(ltas, np.ones(15)/15, "same")
    # ceiling: highest f where smoothed LTAS > ref-60
    hi = f[np.where(sm > ref-60)[0].max()]
    lowref = band(250, 600); lk=(f>20)&(f<400); below=f[lk][sm[lk] < lowref-12]; lowc = float(below.max()) if len(below) else None
    k=(f>500)&(f<5000); tilt=float(np.polyfit(np.log2(f[k]), ltas[k], 1)[0])
    # HF flatness in voiced frames 6-12k (noise-like => bitcrush/aspiration)
    hk=(f>6000)&(f<12000); Ph=P[hk][:, sp]+1e-20
    flat=float(np.median(np.exp(np.mean(np.log(Ph),0))/np.mean(Ph,0)))
    # pause noise floor relative to speech
    floor = float(10*np.log10(P[:, sil].sum(0).mean()+1e-20) - 10*np.log10(P[:, sp].sum(0).mean())) if sil.sum()>5 else None
    # decay after offsets: frames where energy drops; slope over 150ms after offset
    e = fe; slopes=[]
    dt = hop/sr
    for i in range(5, len(e)-40):
        if e[i-1] > top-15 and e[i] < e[i-1]-1 and e[i+30] < top-40:
            seg = e[i:i+30]; slopes.append(np.polyfit(np.arange(30)*dt, seg, 1)[0])
    decay = float(np.median(slopes)) if slopes else None  # dB/s (more negative = drier)
    meter = pyln.Meter(sr); lufs = meter.integrated_loudness(x)
    tp = float(20*np.log10(np.abs(x).max()))
    w=int(.05*sr); fr=m[:len(m)//w*w].reshape(-1,w); rr=np.sqrt((fr**2).mean(1)); pk=np.abs(fr).max(1); ok=rr>np.percentile(rr,60)*0.5
    crest50=float(np.median(20*np.log10(pk[ok]/rr[ok]))); rdb=20*np.log10(rr[ok]+1e-9); dyn=float(np.percentile(rdb,95)-np.percentile(rdb,10))
    mm = m[:len(ok)*w]; act = mm[np.repeat(ok, w)]
    crest=float(20*np.log10(np.abs(act).max()/np.sqrt(np.mean(act**2))))
    snd = parselmouth.Sound(m, sr); pitch = snd.to_pitch(0.01, 100, 650); f0 = pitch.selected_array["frequency"]; f0=f0[f0>0]
    fm = snd.to_formant_burg(0.01, 5, 5500); F={1:[],2:[],3:[]}
    for tt in pitch.xs()[pitch.selected_array["frequency"]>0][::2]:
        for j in F:
            v=fm.get_value_at_time(j, tt)
            if v==v: F[j].append(v)
    hnr = snd.to_harmonicity_cc(0.01, 100).values; hnr=hnr[hnr>-100]
    pp = parselmouth.praat.call(snd.to_point_process_cc(pitch) if False else parselmouth.praat.call([snd, pitch], "To PointProcess (cc)"), "Get jitter (local)", 0, 0, 0.0001, 0.02, 1.3)
    semis = 12*np.log2(f0/np.median(f0))
    return dict(file=p.split("/")[-1], lufs=round(lufs,1), tp=round(tp,1), crest=round(crest,1), crest50=round(crest50,1), dyn=round(dyn,1),
        r95=round(r[.95]), r99=round(r[.99]), r999=round(r[.999]), hi60=round(float(hi)), low_corner=lowc and round(lowc), tilt=round(tilt,2),
        b={f"{a}-{b}": round(band(a,b)-ref,1) for a,b in [(80,150),(150,250),(2000,4000),(4000,6000),(6000,8000),(8000,11000),(11000,16000)]},
        hf_flat=round(flat,3), pause_floor=floor and round(floor,1), decay_dbps=decay and round(decay), f0_med=round(float(np.median(f0))), f0_p5=round(float(np.percentile(f0,5))), f0_p95=round(float(np.percentile(f0,95))),
        f0_sd_semi=round(float(semis.std()),2), F1=round(float(np.median(F[1]))), F2=round(float(np.median(F[2]))), F3=round(float(np.median(F[3]))), hnr=round(float(np.median(hnr)),1), jitter=round(float(pp)*100,2))
if __name__ == "__main__":
    for p in sys.argv[1:]: print(json.dumps(measure(p)))

import sys, os, re, json, glob
import numpy as np, soundfile as sf, scipy.signal as ss
import pyloudnorm as pyln
import parselmouth
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

S = os.path.dirname(os.path.abspath(__file__))
SRC = r"F:\Claude Proyectos\fuentes\tiktok-research"
OUT = os.path.join(S, "an"); os.makedirs(OUT, exist_ok=True)

def speech_intervals(acct, vid, dur):
    wj = os.path.join(SRC, acct, vid + ".words.json")
    if os.path.exists(wj):
        w = json.load(open(wj, encoding="utf-8"))
        return [(x["s"], x["e"]) for x in w], True
    iv = []
    for line in open(os.path.join(SRC, acct, vid + ".txt"), encoding="utf-8"):
        m = re.match(r"\[\s*([\d.]+)-\s*([\d.]+)\]", line)
        if m: iv.append((float(m.group(1)), float(m.group(2))))
    return iv, False

def mask_from(iv, t, pad=0.0):
    m = np.zeros(len(t), bool)
    for s, e in iv: m |= (t >= s + pad) & (t <= e - pad)
    return m

def analyze(path):
    name = os.path.basename(path)[:-4]
    acct, vid = name.split("__")
    x, sr = sf.read(path)
    if x.ndim == 1: x = np.stack([x, x], 1)
    mid = x.mean(1); side = (x[:, 0] - x[:, 1]) / 2
    dur = len(mid) / sr
    iv, wordlevel = speech_intervals(acct, vid, dur)
    n = 4096; hop = 1024
    f, t, Z = ss.stft(mid, sr, nperseg=n, noverlap=n - hop)
    P = np.abs(Z) ** 2
    _, _, Zs = ss.stft(side, sr, nperseg=n, noverlap=n - hop)
    Ps = np.abs(Zs) ** 2
    sp = mask_from(iv, t, 0.03)
    # frame energy to keep loud speech frames only
    fe = 10 * np.log10(P.sum(0) + 1e-20)
    gaps = ~mask_from([(s - 0.12, e + 0.25) for s, e in iv], t)
    gaps &= (t > 0.3) & (t < dur - 0.3)
    loud = sp & (fe > np.percentile(fe[sp], 40))
    ltas = 10 * np.log10(P[:, loud].mean(1) + 1e-20)
    bg = 10 * np.log10(P[:, gaps].mean(1) + 1e-20) if gaps.sum() > 5 else np.full_like(ltas, np.nan)
    side_db = 10 * np.log10(Ps[:, loud].mean(1) + 1e-20)
    # speech-to-background
    snr = 10 * np.log10(P[:, loud].sum(0).mean() / (P[:, gaps].sum(0).mean() + 1e-20)) if gaps.sum() > 5 else np.nan
    # bands
    def band(lo, hi, spec=ltas):
        k = (f >= lo) & (f < hi); return 10 * np.log10(np.mean(10 ** (spec[k] / 10)))
    ref = band(300, 3000)
    # ceiling: highest freq where speech LTAS is > ref-50 dB AND >6 dB above bg
    sm = np.convolve(ltas, np.ones(9) / 9, "same")
    above = np.where(sm > ref - 55)[0]
    ceil55 = f[above.max()] if len(above) else np.nan
    # cliff detection: max drop over 400 Hz above 3 kHz
    k400 = int(400 / (sr / n))
    drops = sm[:-k400] - sm[k400:]
    rng = (f[:-k400] > 3000) & (f[:-k400] < 20000)
    i = np.argmax(np.where(rng, drops, -1e9))
    cliff_f, cliff_db = f[i + k400 // 2], drops[i]
    # rolloff 95/99 on speech frames
    cs = np.cumsum(10 ** (ltas / 10)); cs /= cs[-1]
    r95 = f[np.searchsorted(cs, .95)]; r99 = f[np.searchsorted(cs, .99)]; r999 = f[np.searchsorted(cs, .999)]
    # low corner: freq below 300 where LTAS is 12 dB below 300-600 band peak
    lowref = band(250, 600)
    lowk = (f > 20) & (f < 300)
    below = f[lowk][sm[lowk] < lowref - 15]
    lowc = below.max() if len(below) else np.nan
    # tilt dB/oct 500-5000
    k = (f > 500) & (f < 5000)
    tilt = np.polyfit(np.log2(f[k]), ltas[k], 1)[0]
    bands = {b: band(*b) - ref for b in [(60, 150), (150, 300), (1000, 2000), (2000, 4000), (4000, 6000), (6000, 8000), (8000, 11000), (11000, 16000)]}
    # loudness
    meter = pyln.Meter(sr)
    lufs = meter.integrated_loudness(x)
    tp = 20 * np.log10(np.abs(x).max() + 1e-12)
    # speech-only concatenated for crest/LUFS
    segs = [mid[int(s * sr):int(e * sr)] for s, e in iv]
    speech = np.concatenate(segs) if segs else mid
    rms = np.sqrt(np.mean(speech ** 2)); crest = 20 * np.log10(np.abs(speech).max() / rms)
    # short-window crest (50ms) median
    w = int(.05 * sr); fr = speech[:len(speech) // w * w].reshape(-1, w)
    r = np.sqrt((fr ** 2).mean(1)); pk = np.abs(fr).max(1)
    ok = r > rms * 0.3
    crest50 = np.median(20 * np.log10(pk[ok] / r[ok]))
    # dynamic range of 50ms RMS in speech (p95-p10)
    rdb = 20 * np.log10(r[ok] + 1e-9); dr = np.percentile(rdb, 95) - np.percentile(rdb, 10)
    # clipping count
    clip = int((np.abs(x) > 0.995).sum())
    # pitch/formants
    snd = parselmouth.Sound(speech, sr)
    pitch = snd.to_pitch(time_step=0.01, pitch_floor=120, pitch_ceiling=600)
    f0 = pitch.selected_array["frequency"]; f0 = f0[f0 > 0]
    fm = snd.to_formant_burg(time_step=0.01, max_number_of_formants=5, maximum_formant=5500)
    F = {1: [], 2: [], 3: []}
    for tt in pitch.xs()[pitch.selected_array["frequency"] > 0][::3]:
        for j in (1, 2, 3):
            v = fm.get_value_at_time(j, tt)
            if v == v: F[j].append(v)
    hnr = snd.to_harmonicity_cc(0.01, 120).values; hnr = hnr[hnr > -100]
    res = dict(file=name, acct=acct, codec_ceiling=None, dur=round(dur, 1), wordlevel=wordlevel,
               snr_speech_vs_gaps=round(float(snr), 1), side_rel_db=round(band(300, 3000, side_db) - ref, 1),
               ceil55=round(float(ceil55)), cliff_f=round(float(cliff_f)), cliff_db=round(float(cliff_db), 1),
               r95=round(float(r95)), r99=round(float(r99)), r999=round(float(r999)), low_corner=None if lowc != lowc else round(float(lowc)),
               tilt_db_oct=round(float(tilt), 2), bands={f"{a}-{b}": round(float(v), 1) for (a, b), v in bands.items()},
               lufs=round(float(lufs), 1), true_peak_dbfs=round(float(tp), 2), crest_speech=round(float(crest), 1),
               crest50_med=round(float(crest50), 1), dyn_p95_p10=round(float(dr), 1), clip_samples=clip,
               f0_med=round(float(np.median(f0)), 0), f0_p5=round(float(np.percentile(f0, 5))), f0_p95=round(float(np.percentile(f0, 95))),
               F1=round(float(np.median(F[1]))), F2=round(float(np.median(F[2]))), F3=round(float(np.median(F[3]))),
               hnr_med=round(float(np.median(hnr)), 1))
    np.savez(os.path.join(OUT, name + ".npz"), f=f, ltas=ltas, bg=bg, side=side_db)
    return res

if __name__ == "__main__":
    files = sorted(glob.glob(os.path.join(S, "wav", "*.wav")))
    files = [p for p in files if not os.path.basename(p).startswith("refsina")]
    out = []
    for p in files:
        try:
            r = analyze(p); out.append(r); print(json.dumps(r))
        except Exception as e:
            print("ERR", p, e)
    json.dump(out, open(os.path.join(OUT, "results.json"), "w"), indent=1)

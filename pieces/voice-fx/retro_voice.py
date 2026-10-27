"""retro_voice.py - "low poly anime explainer" voice chain for an ORIGINAL voice.

Measured on 7 TikTok accounts (see README.md). It copies only the processing /
character (EQ curve, high-pass, dynamics, codec ceiling, pitch register) and,
for the "digger" preset, adds a light PS1-era colour (22 kHz / 12-bit, short
metallic comb, soft saturation). It never uses the reference voices.

usage:
  python retro_voice.py in.wav out.wav                    (preset digger)
  python retro_voice.py in.wav out.wav --preset sinaboto
  python retro_voice.py in.wav out.wav --preset digger --pitch-st 2 --bits 10
  python retro_voice.py --list

deps: numpy scipy soundfile pyloudnorm ; optional praat-parselmouth (pitch/formant step)
"""
import argparse, json, sys
import numpy as np, soundfile as sf, scipy.signal as ss
from scipy.ndimage import minimum_filter1d
import pyloudnorm as pyln

SR = 44100
FC = [80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000,
      2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000]

# Long-term speech spectrum of each account's voice (demucs-isolated, 30 s),
# 1/3-octave, dB re the 300-3000 Hz average.  Only 315 Hz-12.5 kHz is matched;
# the low end is handled by the high-pass (the bands below 315 Hz mostly hold F0).
CURVES = {
    "sinaboto":     [-18.9, -18.9, -17.9, -12.4, -1.0, 9.2, 7.7, 7.2, 4.7, 4.0, 4.5, 1.1, -2.0, -6.4, -10.3, -12.2, -17.4, -23.1, -25.9, -35.1, -41.8, -45.0, -49.7, -55.8],
    "yurinasama":   [-20.3, -22.4, -18.2, 0.7, 10.9, 15.6, 5.2, 6.3, 6.5, 4.7, 4.5, 0.5, -4.5, -4.2, -5.6, -10.3, -13.8, -17.3, -21.7, -27.7, -35.0, -39.8, -46.2, -53.2],
    "kingpinrin":   [-27.1, -26.7, -23.9, -3.0, 7.5, 10.4, 7.5, 7.4, 7.9, 4.4, -0.3, -0.6, -2.3, -5.0, -8.8, -9.2, -9.2, -12.7, -17.4, -21.8, -25.4, -30.0, -38.3, -58.2],
    "momomakes64":  [-14.0, -14.8, -16.4, -7.3, 4.2, 13.2, 10.9, 6.9, 3.9, 5.0, 2.3, 0.6, -2.4, -8.1, -10.5, -12.4, -14.1, -18.4, -16.6, -17.8, -20.6, -22.3, -30.2, -42.0],
    "yuimasensei":  [-8.4, -8.8, -5.8, 2.6, 11.9, 15.3, 11.9, 5.7, 8.2, 5.2, -1.7, -5.8, -3.6, -7.4, -11.3, -14.4, -15.1, -15.8, -16.3, -19.2, -20.6, -27.7, -35.4, -43.2],
    "polygoth8":    [-5.6, -4.5, -2.7, 6.0, 25.2, 14.2, -1.1, 10.0, 1.0, 5.9, -0.2, 0.5, -2.9, -4.1, -4.2, -5.7, -3.3, -4.0, -6.4, -9.9, -11.3, -18.5, -32.7, -50.1],
    "yuki.science": [-22.3, -23.5, -21.9, -3.4, 5.5, 9.5, 7.0, 8.1, 4.9, 1.0, -0.1, 0.4, -2.7, -3.5, -4.4, -2.9, -6.6, -13.8, -18.2, -19.0, -21.7, -30.7, -40.8, -59.8],
}
# average of the 7 = the "genre" curve
CURVES["genre"] = list(np.round(np.mean([CURVES[k] for k in list(CURVES)], 0), 1))

BASE = dict(curve="genre", eq_strength=1.0, eq_max_boost=9.0, eq_max_cut=18.0,
            hpf=170, hpf_order=4,            # measured low corner 130-185 Hz
            lpf=16500,                       # TikTok AAC/MP3 ceiling (codec, not an effect)
            f0_target=None, max_shift_st=4.0, pitch_range=1.0, formant=1.0,
            retro_rate=None, bits=None, alias=0.0,
            comb_ms=0.0, comb_fb=0.0, comb_mix=0.0,
            drive=0.0,
            comp_thresh=-8.0, comp_ratio=3.0, comp_attack=3.0, comp_release=80.0,
            lufs=-14.0, ceiling_dbtp=-2.0)

PRESETS = {
    "sinaboto":     dict(curve="sinaboto", hpf=180, lpf=17000, f0_target=300),
    "yurinasama":   dict(curve="yurinasama", hpf=150, lpf=16700, f0_target=234),
    "kingpinrin":   dict(curve="kingpinrin", hpf=175, hpf_order=8, lpf=16500, f0_target=225),
    "momomakes64":  dict(curve="momomakes64", hpf=170, lpf=16000, f0_target=270),
    "yuimasensei":  dict(curve="yuimasensei", hpf=125, lpf=16500, f0_target=215),
    "polygoth8":    dict(curve="polygoth8", hpf=90, lpf=13500, f0_target=210, pitch_range=0.6),
    "yuki.science": dict(curve="yuki.science", hpf=175, hpf_order=8, lpf=15000, f0_target=248),
    # Digger: android girl, part human. Genre EQ + slightly flatter intonation +
    # PS1-era 22.05 kHz / 12-bit + a short metallic comb. Still clearly human.
    "digger":       dict(curve="genre", hpf=170, hpf_order=6, lpf=10500, f0_target=255,
                         pitch_range=0.8, formant=1.03,
                         retro_rate=22050, bits=12, alias=0.12,
                         comb_ms=3.2, comb_fb=0.35, comb_mix=0.18, drive=0.25),
    # Clean "genre" chain: average of the 7 accounts, no lo-fi.
    "genre":        dict(),
}


def preset(name, **over):
    p = dict(BASE); p.update(PRESETS[name]); p.update({k: v for k, v in over.items() if v is not None}); return p


def third_oct(x, sr):
    if x.ndim > 1: x = x.mean(1)
    f, t, Z = ss.stft(x, sr, nperseg=4096, noverlap=3584); P = np.abs(Z) ** 2
    fe = 10 * np.log10(P.sum(0) + 1e-20); sp = fe > np.percentile(fe, 97) - 25
    L = P[:, sp].mean(1); k = (f > 300) & (f < 3000); ref = 10 * np.log10(L[k].mean() + 1e-20)
    out = []
    for fc in FC:
        k = (f >= fc / 2 ** (1 / 6)) & (f < fc * 2 ** (1 / 6))
        out.append(10 * np.log10(L[k].mean() + 1e-20) - ref if k.any() else -120.0)
    return np.array(out)


def pitch_formant(x, sr, p):
    if not p["f0_target"] and p["pitch_range"] == 1.0 and p["formant"] == 1.0:
        return x
    try:
        import parselmouth
        from parselmouth.praat import call
    except ImportError:
        print("  (parselmouth not installed: pitch/formant step skipped)"); return x
    snd = parselmouth.Sound(x, sr)
    pitch = snd.to_pitch(0.01, 75, 600); f0 = pitch.selected_array["frequency"]; f0 = f0[f0 > 0]
    med = float(np.median(f0)) if len(f0) else 0
    new = 0.0
    if p["f0_target"] and med:
        st = float(np.clip(12 * np.log2(p["f0_target"] / med), -p["max_shift_st"], p["max_shift_st"]))
        new = med * 2 ** (st / 12)
        print(f"  pitch: median {med:.0f} Hz -> {new:.0f} Hz ({st:+.1f} st), range x{p['pitch_range']}, formant x{p['formant']}")
    y = call(snd, "Change gender", 75, 600, p["formant"], new, p["pitch_range"], 1.0)
    return y.values[0].astype(np.float64)


def match_eq(x, sr, p):
    if not p["eq_strength"]:
        return x
    tgt = np.array(CURVES[p["curve"]]); cur = third_oct(x, sr)
    d = tgt - cur
    use = (np.array(FC) >= 315) & (np.array(FC) <= 12500) & (cur > -60)  # never boost what isn't there
    d = np.where(use, d, 0.0)
    d = np.convolve(np.pad(d, 1, mode="edge"), [0.25, 0.5, 0.25], "valid")  # ~2/3-oct smoothing
    d = np.clip(d * p["eq_strength"], -p["eq_max_cut"], p["eq_max_boost"])
    d = np.where(use, d, 0.0)
    freqs = np.concatenate([[0], FC, [sr / 2]]) / (sr / 2)
    gains = 10 ** (np.concatenate([[d[0]], d, [d[-1]]]) / 20)
    fir = ss.firwin2(2047, freqs, gains)
    return ss.fftconvolve(x, fir, "same")


def retro(x, sr, p):
    if p["retro_rate"]:
        r = p["retro_rate"]; g = np.gcd(sr, r)
        lo = ss.resample_poly(x, r // g, sr // g)                    # band-limited: clean downsample
        if p["alias"]:                                               # + a little zero-order hold (aliasing sparkle)
            held = x[np.minimum((np.arange(len(lo)) * sr / r).astype(int), len(x) - 1)]
            lo = (1 - p["alias"]) * lo + p["alias"] * held
        if p["bits"]:
            q = 2 ** (p["bits"] - 1); pk = np.abs(lo).max() + 1e-9
            lo = np.round(lo / pk * q) / q * pk
        x = ss.resample_poly(lo, sr // g, r // g)[:len(x)]
    elif p["bits"]:
        q = 2 ** (p["bits"] - 1); pk = np.abs(x).max() + 1e-9
        x = np.round(x / pk * q) / q * pk
    return x


def comb(x, sr, p):
    if not p["comb_mix"]:
        return x
    D = int(sr * p["comb_ms"] / 1000)
    a = np.zeros(D + 1); a[0] = 1; a[D] = -p["comb_fb"]
    b = np.zeros(D + 1); b[D] = 1
    wet = ss.lfilter(b, a, x)
    return (1 - p["comb_mix"]) * x + p["comb_mix"] * wet


def saturate(x, p):
    if not p["drive"]:
        return x
    k = 1 + 6 * p["drive"]; pk = np.abs(x).max() + 1e-9
    y = np.tanh(k * x / pk) / np.tanh(k) * pk
    return (1 - p["drive"]) * x + p["drive"] * y


def compress(x, sr, p):
    blk = int(sr * 0.001); n = len(x) // blk
    rms = np.sqrt((x[:n * blk].reshape(n, blk) ** 2).mean(1) + 1e-12)
    lvl = 20 * np.log10(rms)
    # threshold in dB relative to the loud speech level (p90 of the 1 ms RMS)
    thr = np.percentile(lvl, 90) + p["comp_thresh"]
    aa = np.exp(-1 / p["comp_attack"]); ar = np.exp(-1 / p["comp_release"])
    env = np.empty(n); e = lvl[0]
    for i in range(n):
        c = aa if lvl[i] > e else ar
        e = c * e + (1 - c) * lvl[i]; env[i] = e
    gr = np.minimum(0, (thr - env) * (1 - 1 / p["comp_ratio"]))
    centers = (np.arange(n) + 0.5) * blk                      # smooth gain, no block steps
    return x * np.interp(np.arange(len(x)), centers, 10 ** (gr / 20))


def limit(x, sr, ceiling_db):
    c = 10 ** (ceiling_db / 20)
    need = np.minimum(1, c / (np.abs(x) + 1e-12))
    w = int(sr * 0.004)                                       # 4 ms look-ahead, Hann-smoothed
    g = minimum_filter1d(need, 2 * w + 1)
    h = np.hanning(w + 2)[1:-1]; g = np.convolve(g, h / h.sum(), "same")
    return x * np.minimum(g, 1.0)


def process(x, sr, p):
    if x.ndim > 1: x = x.mean(1)
    if sr != SR:
        g = np.gcd(sr, SR); x = ss.resample_poly(x, SR // g, sr // g); sr = SR
    x = x / (np.abs(x).max() + 1e-9) * 0.5
    x = pitch_formant(x, sr, p)
    x = ss.sosfiltfilt(ss.butter(p["hpf_order"] // 2, p["hpf"], "hp", fs=sr, output="sos"), x)
    x = match_eq(x, sr, p)
    x = retro(x, sr, p)
    x = comb(x, sr, p)
    x = saturate(x, p)
    x = compress(x, sr, p)
    if p["lpf"] and p["lpf"] < sr / 2:
        x = ss.sosfiltfilt(ss.butter(6, p["lpf"], "lp", fs=sr, output="sos"), x)
    # Loudness is measured as centre-panned stereo (dual mono), i.e. how the
    # stem reads once it sits in the video's stereo mix.
    m = pyln.Meter(sr); st = lambda v: np.stack([v, v], 1)
    x = x * 10 ** ((p["lufs"] - m.integrated_loudness(st(x))) / 20)
    x = limit(x, sr, p["ceiling_dbtp"] - 0.3)
    x = x * 10 ** ((p["lufs"] - m.integrated_loudness(st(x))) / 20)
    x = limit(x, sr, p["ceiling_dbtp"] - 0.3)
    print(f"  out: {m.integrated_loudness(st(x)):.1f} LUFS (stereo), peak {20*np.log10(np.abs(x).max()):.1f} dBFS")
    return st(x), sr


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("inp", nargs="?"); ap.add_argument("out", nargs="?")
    ap.add_argument("--preset", default="digger", choices=list(PRESETS))
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--f0", dest="f0_target", type=float, help="target median pitch Hz (0 = keep)")
    ap.add_argument("--pitch-st", type=float, help="fixed pitch shift in semitones (overrides --f0)")
    ap.add_argument("--range", dest="pitch_range", type=float, help="intonation range factor (1 = natural, <1 = flatter/robotic)")
    ap.add_argument("--formant", type=float); ap.add_argument("--rate", dest="retro_rate", type=int)
    ap.add_argument("--bits", type=int); ap.add_argument("--alias", type=float)
    ap.add_argument("--comb-mix", type=float); ap.add_argument("--drive", type=float)
    ap.add_argument("--eq", dest="eq_strength", type=float, help="match-EQ strength 0-1")
    ap.add_argument("--lpf", type=float); ap.add_argument("--hpf", type=float)
    ap.add_argument("--lufs", type=float)
    a = ap.parse_args()
    if a.list or not a.inp:
        for k in PRESETS: print(k, json.dumps(preset(k)))
        return
    over = {k: getattr(a, k) for k in ["f0_target", "pitch_range", "formant", "retro_rate", "bits", "alias", "drive", "eq_strength", "lpf", "hpf", "lufs"]}
    over["comb_mix"] = a.comb_mix
    p = preset(a.preset, **over)
    x, sr = sf.read(a.inp)
    if a.pitch_st is not None:
        mono = x.mean(1) if x.ndim > 1 else x
        import parselmouth
        f0 = parselmouth.Sound(mono, sr).to_pitch(0.01, 75, 600).selected_array["frequency"]
        p["f0_target"] = float(np.median(f0[f0 > 0])) * 2 ** (a.pitch_st / 12); p["max_shift_st"] = abs(a.pitch_st) + 0.01
    if p["f0_target"] == 0: p["f0_target"] = None
    print(f"[{a.preset}] {a.inp}")
    y, sr = process(x, sr, p)
    sf.write(a.out, y.astype(np.float32), sr, subtype="PCM_24")
    print(f"  -> {a.out}")


if __name__ == "__main__":
    main()

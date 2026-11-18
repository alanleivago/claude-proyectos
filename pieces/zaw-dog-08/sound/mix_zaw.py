"""venv: zaw-dog #8 soundtrack (from zaw-dog-06/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
Bert Cole 'Waiting' bed ducked under the narration (voice ~7 dB over the bed), voice_retro on top.
premaster (no master) -> sound/out/premaster.wav; then ffmpeg loudnorm 2-pass to -11 LUFS / -1 dBTP -> sound/out/final_mix.wav
Stems: sound/out/{voice,music,sfx}.wav.   python sound/mix_zaw.py"""
import json, os, subprocess
import numpy as np
import soundfile as sf

H = os.path.dirname(os.path.abspath(__file__)); P = os.path.dirname(H); OUT = os.path.join(H, "out"); os.makedirs(OUT, exist_ok=True)
SR = 48000
TIM = json.load(open(os.path.join(P, "voice", "timing.json")))
DUR = TIM["end"]; N = int(round(DUR * SR))
MUSIC = os.path.join(P, "..", "lps-onoda", "audio", "assets", "music", "bertcole", "16-Bit Starter Pack", "Various Themes", "Waiting.ogg")


def load(path, a=0.0, b=None, mono=True):
    args = ["ffmpeg", "-v", "error", "-ss", str(a)] + (["-to", str(b)] if b else []) + ["-i", path, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)


def rms_db(x):
    if not len(x):
        raise ValueError("silent SFX segment (check the cue's start/end)")
    return 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-12)


def fade(x, fi=0.01, fo=0.05):
    x = x.copy(); n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)
    if n2: x[-n2:] *= np.linspace(1, 0, n2)
    return x


def hp(x, f):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, f, "highpass", fs=SR, output="sos"), x)


def lp(x, f):
    from scipy.signal import butter, sosfilt
    return sosfilt(butter(2, f, "lowpass", fs=SR, output="sos"), x)


FS = lambda n: os.path.join(H, "chosen", n)
WL_ = [[w for w in TIM["words"] if w["line"] == i] for i in range(len(TIM["starts"]))]
W = lambda l, i: WL_[l][i]["s"]                                     # v2: every cue follows the (re-timed) voice
WE = lambda l, i: WL_[l][i]["e"]
CUT = [0.0] + [round((s_ - 0.15) * 30) / 30 for s_ in TIM["starts"][1:]]
HERO_T = round((WE(0, 6) + 0.3) * 30) / 30 - 0.08    # bark onset = shots.py BARK8 (the gap AFTER "him")
G1 = round((W(6, 10) - 0.08) * 30) / 30 + 0.25        # the subtle real gasp: the owner BUSTED (07c face swap)
POPS = [W(1, 2) - 0.05]                               # GERMANY, 2021 (shots.py text_at t0, on "scientists")
S02B = round((W(1, 6) - 0.08) * 30) / 30; S02C = round((W(1, 10) - 0.08) * 30) / 30; S05B = round((W(4, 8) - 0.08) * 30) / 30
S06C = round((W(5, 10) - 0.08) * 30) / 30; S07C = round((W(6, 10) - 0.08) * 30) / 30
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)  every file CC0 (CREDITS.md), earshot-ranked
    (0.00, "room_tone_329533.mp3", 0.5, 11.5, -24, 0.05, 0.3, None),
    (0.30, "collar_jingle_851618.mp3", 0.5, 1.1, -19, 0.02, 0.2, ("lp", 7000)),   # the dog's suspicious head move
    (W(0, 3) - 0.05, "dog_whine_498703.mp3", 2.2, 2.75, -21, 0.02, 0.15, None),  # low suspicious whine under "teasing him"
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.55, 5.0, 0.003, 0.05, None),   # HERO bark in the gap (+3 dB over the boosted voice)
    (HERO_T + 0.03, "whoosh_830856.mp3", 0.0, 0.45, -19, 0.005, 0.1, None),  # snap-zoom accent
    (CUT[1] - 0.12, "whoosh_830856.mp3", 0.0, 0.45, -19, 0.005, 0.1, None),  # cut to the lab
    (S02B + 0.35, "point_393811.mp3", 0.0, 0.21, -15, 0.002, 0.05, None),    # her hand reaches through the gap (swish)
    (S02B + 0.7, "dog_sniff_427169.mp3", 0.0, 0.9, -14, 0.01, 0.15, None),   # nose at the biscuit
    (S02B + 0.9, "tail_thump_657779.mp3", 0.2, 0.9, -18, 0.01, 0.15, None),  # happy wag
    (S02C - 0.12, "whoosh_830856.mp3", 0.0, 0.45, -18, 0.005, 0.1, None),    # whip to the gap
    (S02C + 0.3, "dog_pant_841349.mp3", 0.0, 0.8, -17, 0.03, 0.15, None),
    (W(2, 2) + 0.38, "drop_349268.mp3", 0.0, 0.5, -12, 0.002, 0.12, None),   # the biscuit hits the ramp (dropped) ...
    (W(2, 2) + 0.78, "drop_349268.mp3", 0.0, 0.35, -19, 0.002, 0.1, None),   # ... and the floor on her side
    (CUT[2] + (W(2, 4) - 0.08 - CUT[2]) + 0.12, "whoosh_830856.mp3", 0.0, 0.45, -21, 0.005, 0.1, None),   # small snap on her "oops"
    (W(3, 3), "yank_614169.mp3", 0.0, 0.6, -12, 0.003, 0.1, None),          # pulled back (the clip's own withdrawal, fast)
    (W(3, 3) + 0.2, "dog_whine_498703.mp3", 2.2, 3.0, -16, 0.02, 0.2, None), # betrayed whine
    (W(3, 5) - 0.03, "laugh_565973.mp3", 0.0, 1.0, -15, 0.01, 0.15, None),   # her teasing "ha-ha" (quiet, under the voice)
    (10.50, "room_tone_329533.mp3", 8.6, 19.6, -24, 0.05, 0.3, None),
    (W(4, 4) - 0.05, "dog_walk_635117.mp3", 7.0, 8.8, -14, 0.02, 0.2, None), # he trots round the wall
    (S05B - 0.12, "whoosh_830856.mp3", 0.0, 0.45, -20, 0.005, 0.1, None),
    (W(4, 11), "eat_691471.mp3", 4.4, 5.3, -13, 0.03, 0.2, None),           # grabs it (crunch)
    (W(4, 11) + 0.1, "tail_thump_657779.mp3", 0.2, 1.0, -17, 0.01, 0.15, None),
    (CUT[5] - 0.12, "whoosh_830856.mp3", 0.0, 0.45, -18, 0.005, 0.1, None),  # whip
    (CUT[5] + 0.3, "yank_614169.mp3", 0.0, 0.6, -14, 0.003, 0.1, None),      # teased again
    (CUT[5] + 0.5, "laugh_565973.mp3", 0.0, 0.8, -20, 0.01, 0.15, None),
    (W(5, 6) - 0.05, "dog_sigh_427172.mp3", 0.3, 0.9, -14, 0.01, 0.15, None),# he sits and waits (sigh)
    (S06C, "tail_thump_657779.mp3", 0.2, 0.75, -19, 0.01, 0.25, None),       # the last slow wags ... then nothing
    (W(5, 12), "dog_whine_498703.mp3", 2.2, 2.8, -20, 0.02, 0.2, None),
    (W(6, 4), "point_393811.mp3", 0.0, 0.21, -14, 0.002, 0.05, None),        # the fake: the biscuit lifted away
    (W(6, 4) + 0.08, "collar_jingle_851618.mp3", 2.4, 3.0, -18, 0.01, 0.2, ("lp", 7000)),
    (W(6, 9) - 0.08, "whoosh_830856.mp3", 0.0, 0.45, -19, 0.005, 0.1, None), # snap on "exactly"
    (W(6, 9) + 0.15, "dog_sigh_427172.mp3", 0.3, 0.9, -15, 0.01, 0.15, None),# flat, unimpressed huff
    (G1, "gasp_812418.mp3", 0.0, 0.37, -11, 0.003, 0.06, None),              # GASP (subtle, real): busted
] + [(t, "pop_744144.mp3" if k % 2 else "pop_744140.mp3", 0.0, 0.12, -12, 0.002, 0.03, None) for k, t in enumerate(POPS)]


def hum_notes(semis, dur):
    """hum foley: one real hummed note (Freesound 802522, CC0) re-pitched into a little melody."""
    base = load(FS("hum_m_802522.mp3"), 0.2, 0.75)
    out = []
    for n in semis:
        r = 2 ** (n / 12); idx = np.arange(0, len(base) - 1, r)
        x = np.interp(idx, np.arange(len(base)), base)[:int(dur * SR)]
        out.append(fade(x, 0.02, 0.05))
    return np.concatenate(out)


SPECIAL = {}
DIPS = []
voice = np.zeros(N); v = load(os.path.join(P, "voice", "voice_retro.wav")); voice[:min(N, len(v))] = v[:N]
vref = rms_db(voice[np.abs(voice) > 0.02])                                   # speech-only RMS
vpk = np.abs(voice).max()
vd = np.ones(N)                                                                  # no voice ducking: the bark sits in the gap
from scipy.ndimage import uniform_filter1d as _uf
voice = voice * _uf(vd, int(0.03 * SR))
sfx = np.zeros(N); hero = np.zeros(N)
HERO = {HERO_T}           # the opening yip is the Zaw "meow": prominent, over the voice RMS, outside the SFX caps
for t, f, a, b, lvl, fi, fo, flt in CUES:
    x = SPECIAL[f]() if f in SPECIAL else load(FS(f), a, b)
    if flt:
        x = (lp if flt[0] == "lp" else hp)(x, flt[1])
    x = hp(x, 150 if "cloth" in f else 80)
    if t in HERO:                                                               # denser yip: soft saturation, same peak
        pk = np.abs(x).max(); x = np.tanh(3.5 * x / pk) / np.tanh(3.5) * pk
    x = fade(x, fi, fo); x *= 10 ** ((vref + lvl - rms_db(x[np.abs(x) > 1e-4])) / 20)
    cap = min(1.0, vpk * 10 ** ((9 if t in HERO else -5) / 20) / (np.abs(x).max() + 1e-9)); x *= cap  # SFX peak <= voice peak - 5 dB
    if os.environ.get("CUELOG"): print(f"{t:6.2f} {f[:26]:26s} lvl {lvl:5.1f} cap {20*np.log10(cap):5.1f} dB")
    for dt, d0, d1, ddb in DIPS:
        if dt == t:
            g = np.ones(len(x)); tt = t + np.arange(len(x)) / SR
            g = 1 - (1 - 10 ** (ddb / 20)) * np.clip(np.minimum((tt - d0) / 0.15, (d1 - tt) / 0.15), 0, 1); x *= g
    if os.environ.get("CUELOG") and (np.isnan(x).any() or not len(x)): print("NAN", t, f, np.isnan(x).sum(), len(x))
    i = int(t * SR); n = min(len(x), N - i); (hero if t in HERO else sfx)[i:i + n] += x[:n]
# SFX bus: overlapping cues must also stay under voice peak - 5 dB (10 ms look-around gain, no clipping)
from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
w = int(0.01 * SR) | 1
g = np.minimum(1.0, vpk * 10 ** (-5 / 20) / (maximum_filter1d(np.abs(sfx), w) + 1e-9))
sfx *= uniform_filter1d(minimum_filter1d(g, w), w)
sfx += hero
# music bed: 7 dB under the speech RMS while talking, +3 dB in the gaps, fades in/out
mu = load(MUSIC, 0.0, DUR + 0.5, mono=False)[:N]; mu = np.pad(mu, ((0, max(0, N - len(mu))), (0, 0)))
mu_m = mu.mean(1); g0 = vref - 7 - rms_db(mu_m)
env = np.convolve((np.abs(voice) > 0.02).astype(float), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same")
duck = 10 ** ((g0 + 3 * (1 - np.clip(env * 3, 0, 1))) / 20)
duck[:int(0.3 * SR)] *= np.linspace(0, 1, int(0.3 * SR)); duck[-int(0.8 * SR):] *= np.linspace(1, 0, int(0.8 * SR))
hd = np.ones(N); i0, i1 = int((HERO_T - 0.03) * SR), int((HERO_T + 0.25) * SR)                        # music steps aside for the yip
hd[i0:i1] = 10 ** (-4 / 20); hd = uniform_filter1d(hd, int(0.04 * SR))
music = mu * (duck * hd)[:, None]
st = lambda m: np.stack([m, m], 1)
VOICE_UP = 10 ** (2 / 20)                                       # user: the voice +2 dB over music and SFX
voice = voice * VOICE_UP
pre = st(voice) + music + st(sfx)
for n_, x in (("voice", st(voice)), ("music", music), ("sfx", st(sfx)), ("premaster", pre)):
    sf.write(os.path.join(OUT, f"{n_}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
# master: loudnorm 2-pass -> -11 LUFS integrated, -1 dBTP
src = os.path.join(OUT, "premaster.wav"); dst = os.path.join(OUT, "final_mix.wav")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-11:TP=-2.3:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = (f"loudnorm=I=-11:TP=-2.3:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.74:level=false,aresample=48000")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", dst], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("voice RMS", round(vref, 1), "music gain", round(g0, 1), "dB")
print("\n".join(l for l in m.splitlines()[-12:] if any(k in l for k in ("I:", "Peak:", "LRA:"))))

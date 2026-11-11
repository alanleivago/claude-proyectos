"""venv: zaw-dog #2 soundtrack (from zaw-dog-01/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
Bert Cole 'A Little R & R' bed ducked under the narration (voice ~7 dB over the bed), voice_retro on top.
premaster (no master) -> sound/out/premaster.wav; then ffmpeg loudnorm 2-pass to -11 LUFS / -1 dBTP -> sound/out/final_mix.wav
Stems: sound/out/{voice,music,sfx}.wav.   python sound/mix_zaw.py"""
import json, os, subprocess
import numpy as np
import soundfile as sf

H = os.path.dirname(os.path.abspath(__file__)); P = os.path.dirname(H); OUT = os.path.join(H, "out"); os.makedirs(OUT, exist_ok=True)
SR = 48000
TIM = json.load(open(os.path.join(P, "voice", "timing.json")))
DUR = TIM["end"]; N = int(round(DUR * SR))
MUSIC = os.path.join(P, "..", "lps-onoda", "audio", "assets", "music", "bertcole", "16-Bit Starter Pack", "Various Themes", "A Little R & R.ogg")


def load(path, a=0.0, b=None, mono=True):
    args = ["ffmpeg", "-v", "error", "-ss", str(a)] + (["-to", str(b)] if b else []) + ["-i", path, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)


def rms_db(x):
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


FS = lambda n: os.path.join(H, "fs", n)
# (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)
HERO_T = 1.08                 # in the comma gap after "ball," (1.09-1.25 s): the bark never covers a word
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)
    # line 1: fake throw -> HERO bark (Zaw's meow) over the voice, the sprint, the skid
    (0.08, "squeak_toy_483922.mp3", 0.062, 0.30, -8, 0.003, 0.05, None),        # he squeezes the ball, wind-up
    (0.47, "whoosh_arm_389590.mp3", 0.0, 0.3, -10, 0.0, 0.08, None),            # the fake throw: arm whip
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.47, 6.5, 0.003, 0.05, None),        # HERO bark: the main burst only, ~+3 dB over the voice
    (0.70, "dog_paws_208654.mp3", 0.0, 1.0, -12, 0.01, 0.1, None),             # claws scrabbling off
    (0.75, "collar_420191.mp3", 0.78, 1.70, -16, 0.02, 0.2, ("lp", 7000)),
    (1.12, "dog_skid_208654.mp3", 1.2, 2.2, -11, 0.02, 0.2, None),               # hallway sprint + skid
    (1.70, "collar_420191.mp3", 1.00, 1.90, -15, 0.02, 0.2, ("lp", 7000)),
    (2.15, "squeak_toy_483922.mp3", 0.445, 0.66, -10, 0.003, 0.05, None),       # the ball still in his hand: squeak
    (2.45, "dog_whimper_350593.mp3", 0.0, 0.6, -13, 0.0, 0.1, None),            # shocked little whine
    # lab
    (3.10, "dog_sniff_427169.mp3", 0.0, 1.0, -12, 0.01, 0.1, None),
    (5.00, "collar_420191.mp3", 0.78, 1.70, -17, 0.02, 0.2, ("lp", 7000)),
    (6.55, "dog_sniff_528939.mp3", 0.0, 1.2, -11, 0.01, 0.2, None),              # two cups, one treat: sniff
    (8.20, "dog_breath_483702.mp3", 0.683, 1.40, -15, 0.02, 0.2, None),
    (9.15, "dog_walk_635117.mp3", 4.6, 5.7, -13, 0.03, 0.2, None),              # trots to the treat cup
    (10.25, "cup_knock_347950.mp3", 0.011, 0.72, -5, 0.003, 0.1, None),          # CUP KNOCK
    (10.40, "puppy_bark_155309.mp3", 0.096, 0.439, -11, 0.003, 0.06, None),     # happy yip
    (10.45, "tail_thump_657779.mp3", 0.0, 1.0, -13, 0.01, 0.2, None),
    (10.80, "cup_knock_347950.mp3", 0.011, 0.35, -15, 0.003, 0.08, None),       # she lifts the cups
    (12.70, "box_rattle_697092.mp3", 0.0, 0.46, -12, 0.003, 0.08, None),        # nose lifts the empty cup
    (13.15, "dog_breath_483702.mp3", 2.229, 2.83, -12, 0.01, 0.15, None),       # shocked huff
    (14.15, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),            # red "?" pops
    (15.95, "dog_breath_483702.mp3", 0.683, 1.40, -13, 0.02, 0.2, None),        # judging huff, sitting still
    (17.12, "footsteps_in_366111.mp3", 0.0, 0.9, -14, 0.0, 0.2, None),         # the new person steps in
    (18.15, "dog_walk_635117.mp3", 4.6, 5.5, -13, 0.03, 0.2, None),           # the dog goes at once
    (18.45, "puppy_yip_155311.mp3", 0.0, 0.5, -12, 0.003, 0.08, None),
    (18.60, "collar_420191.mp3", 1.60, 2.50, -16, 0.02, 0.2, ("lp", 7000)),
    # hallway, strangers
    (19.30, "dog_sniff_595826.mp3", 0.0, 1.0, -12, 0.01, 0.15, None),
    (20.95, "box_rattle_697092.mp3", 0.0, 0.46, -11, 0.003, 0.08, None),       # the clear box: struggle
    (21.55, "box_rattle_697092.mp3", 0.0, 0.46, -13, 0.003, 0.08, None),
    (22.35, "crouch_cloth_494789.mp3", 0.0, 0.9, -12, 0.02, 0.15, None),        # the stranger turns his back
    (23.75, "dog_whimper_110816.mp3", 0.0, 1.05, -12, 0.01, 0.15, None),        # sad puppy eyes
    (24.75, "crouch_cloth_494789.mp3", 0.0, 0.9, -12, 0.02, 0.15, None),        # both crouch
    (26.30, "dog_sniff_528939.mp3", 0.0, 1.2, -12, 0.01, 0.2, None),            # looks from palm to palm
    (27.95, "dog_walk_635117.mp3", 5.0, 5.8, -14, 0.03, 0.2, None),            # walks past the unhelpful palm
    (28.05, "tail_thump_657779.mp3", 0.0, 1.5, -13, 0.01, 0.2, None),
    (28.70, "dog_eat_723851.mp3", 0.0, 1.3, -11, 0.01, 0.2, None),              # crunch
    (29.55, "dog_breath_483702.mp3", 2.229, 2.83, -13, 0.01, 0.15, None),       # side-eye huff
    (30.40, "squeak_toy_483922.mp3", 0.062, 0.30, -10, 0.003, 0.05, None),      # ball squeezed, frozen wind-up
    (31.30, "dog_whimper_235926.mp3", 0.30, 1.05, -12, 0.03, 0.2, None),        # tears: whimper
]
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
    x = load(FS(f), a, b)
    if flt:
        x = (lp if flt[0] == "lp" else hp)(x, flt[1])
    x = hp(x, 150 if "cloth" in f else 80)
    if t in HERO:                                                               # denser yip: soft saturation, same peak
        pk = np.abs(x).max(); x = np.tanh(3.5 * x / pk) / np.tanh(3.5) * pk
    x = fade(x, fi, fo); x *= 10 ** ((vref + lvl - rms_db(x[np.abs(x) > 1e-4])) / 20)
    cap = min(1.0, vpk * 10 ** ((9 if t in HERO else -5) / 20) / (np.abs(x).max() + 1e-9)); x *= cap  # SFX peak <= voice peak - 5 dB
    if os.environ.get("CUELOG"): print(f"{t:6.2f} {f[:26]:26s} lvl {lvl:4d} cap {20*np.log10(cap):5.1f} dB")
    for dt, d0, d1, ddb in DIPS:
        if dt == t:
            g = np.ones(len(x)); tt = t + np.arange(len(x)) / SR
            g = 1 - (1 - 10 ** (ddb / 20)) * np.clip(np.minimum((tt - d0) / 0.15, (d1 - tt) / 0.15), 0, 1); x *= g
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
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-11:TP=-1.7:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = (f"loudnorm=I=-11:TP=-1.7:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.83:level=false,aresample=48000")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", dst], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("voice RMS", round(vref, 1), "music gain", round(g0, 1), "dB")
print("\n".join(l for l in m.splitlines()[-12:] if any(k in l for k in ("I:", "Peak:", "LRA:"))))

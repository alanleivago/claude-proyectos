"""venv: zaw-dog #3 soundtrack (from zaw-dog-02/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
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


FS = lambda n: os.path.join(H, "fs", n)
HERO_T = 0.93                 # zaw-dog #3: in the comma gap after "crying," (0.87-1.32 s): the bark never covers a word
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)
    # line 1: night, he sobs; the dog's head snaps up -> HERO bark
    (0.10, "sob_643669.mp3", 0.0, 0.75, -11, 0.01, 0.12, ("lp", 6000)),         # the owner's sob (short, comic)
    (0.84, "collar_420191.mp3", 0.78, 1.40, -15, 0.01, 0.15, ("lp", 7000)),    # head snap: tags jingle
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.47, 4.9, 0.003, 0.05, None),       # HERO bark (main burst only), ~+3 dB over the voice
    (1.55, "sob_643669.mp3", 1.2, 2.4, -14, 0.03, 0.2, ("lp", 6000)),
    # line 2: the sad movie
    (2.95, "dog_breath_483702.mp3", 0.683, 1.40, -13, 0.02, 0.2, None),        # judging huff
    (3.70, "sob_157163.mp3", 0.0, 0.9, -16, 0.02, 0.2, None),                  # he sniffles at the TV
    # line 3: street, portraits
    (4.57, "street_amb_484189.mp3", 2.0, 5.4, -17, 0.15, 0.3, None),
    (6.52, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),            # one pop per portrait row
    (6.85, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),
    (7.18, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),
    # line 4-5: the study
    (8.05, "sob_157163.mp3", 1.0, 2.0, -15, 0.02, 0.2, None),                  # his fake sob
    (8.85, "sob_482808.mp3", 0.0, 1.1, -16, 0.02, 0.2, ("lp", 6000)),          # hers, staggered
    (11.26, "HUM", 0.0, 0.0, -17, 0.02, 0.2, ("lp", 4000)),                     # he hums (pitched hum foley)
    (11.30, "murmur_514877.mp3", 1.0, 2.0, -24, 0.05, 0.2, ("lp", 1500)),       # her murmured talk
    (10.55, "dog_yawn_826022.mp3", 0.0, 1.3, -11, 0.02, 0.2, None),            # the dog's yawn squeak
    # line 6-7: counters
    (11.95, "dog_walk_635117.mp3", 4.6, 5.6, -13, 0.03, 0.2, None),            # paw steps on the rug
    (12.60, "dog_whine_498703.mp3", 2.15, 3.0, -13, 0.02, 0.2, None),           # soft whine
    (12.65, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "15/18"
    (14.62, "dog_scratch_625281.mp3", 0.0, 0.6, -15, 0.01, 0.15, None),        # ear scratch
    (14.64, "collar_420191.mp3", 1.00, 1.50, -17, 0.02, 0.2, ("lp", 7000)),     # tags rattle with the scratch
    (13.89, "pop_ui_634359.mp3", 0.0, 0.2, -10, 0.0, 0.05, ("lp", 2500)),       # counter drops to "6/18" (low pop)
    # line 8-9: the stranger
    (14.95, "dog_walk_635117.mp3", 4.6, 5.7, -13, 0.03, 0.2, None),            # trots on wood
    (15.10, "sob_482808.mp3", 1.0, 2.2, -16, 0.02, 0.2, ("lp", 6000)),
    (16.20, "dog_sniff_528939.mp3", 0.0, 1.0, -11, 0.01, 0.2, None),           # sniff sniff
    (16.55, "tail_thump_657779.mp3", 0.0, 1.0, -15, 0.01, 0.2, None),
    (16.85, "dog_lick_461564.mp3", 0.0, 0.75, -11, 0.01, 0.15, None),          # lick
    (17.20, "huh_801176.mp3", 0.0, 0.7, -12, 0.0, 0.1, ("lp", 6000)),          # the owner's small "huh"
    (17.75, "dog_whimper_350593.mp3", 0.0, 0.6, -14, 0.0, 0.1, None),          # quiet high whimper
    (18.55, "dog_whimper_110816.mp3", 0.0, 1.0, -15, 0.01, 0.15, None),
    (18.40, "tail_thump_657779.mp3", 0.0, 0.8, -19, 0.01, 0.2, None),          # tail swish on the floor
    # line 10-11: the door test
    (19.55, "footsteps_in_366111.mp3", 0.0, 1.2, -23, 0.0, 0.2, None),         # footsteps on wood
    (20.42, "door_close_471923.mp3", 0.0, 0.74, -12, 0.01, 0.15, None),         # the door swings to
    (20.92, "magnet_clack_556301.mp3", 0.0, 0.12, -10, 0.0, 0.03, None),        # magnet 1 clacks
    (21.04, "magnet_clack_556301.mp3", 0.0, 0.12, -11, 0.0, 0.03, None),        # magnet 2
    (21.25, "crouch_cloth_494789.mp3", 0.0, 0.8, -15, 0.02, 0.15, None),       # he sits on the floor
    (21.95, "sob_643669.mp3", 2.6, 3.8, -14, 0.03, 0.2, ("lp", 1200)),         # sobs muffled through the acrylic
    (23.12, "TWINKLE", 0.0, 0.0, -13, 0.02, 0.2, ("lp", 1500)),                 # muffled hum of "Twinkle Twinkle"
    # line 12-13: the doors
    (24.70, "dog_walk_635117.mp3", 4.6, 5.3, -15, 0.03, 0.2, None),
    (24.95, "dog_scratch_398727.mp3", 0.0, 0.8, -11, 0.0, 0.15, None),         # nose / paw on the door
    (25.05, "magnet_clack_552017.mp3", 0.0, 0.4, -8, 0.0, 0.08, None),         # magnets unclick
    (25.10, "door_creak_702171.mp3", 0.0, 1.2, -13, 0.02, 0.2, None),          # the door swings in
    (25.67, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "SAME"
    (26.52, "dog_skid_208654.mp3", 1.2, 2.0, -11, 0.01, 0.15, None),           # fast scramble of claws
    (26.75, "door_bang_93766.mp3", 0.0, 0.6, -11, 0.0, 0.15, None),            # door bang
    (27.05, "dog_whine_498703.mp3", 2.95, 3.6, -13, 0.02, 0.2, None),           # happy whine
    (27.20, "dog_sniff_427169.mp3", 0.0, 0.9, -16, 0.01, 0.15, None),          # slow sniffs (humming side)
    (28.22, "pop_744140.mp3", 0.0, 0.2, -6, 0.0, 0.05, ("hp", 200)),           # "3x"
    (28.30, "tail_thump_657779.mp3", 0.0, 1.0, -14, 0.01, 0.2, None),
    (28.85, "puppy_yip_155311.mp3", 0.0, 0.5, -13, 0.003, 0.08, None),
    # line 14: the nose
    (29.80, "dog_sniff_595826.mp3", 0.0, 1.0, -7, 0.01, 0.15, None),           # LOUD close sniff
    (30.70, "sob_157163.mp3", 2.0, 3.0, -16, 0.02, 0.2, None),                 # he sniffles, eyes welling
    (31.30, "dog_whimper_235926.mp3", 0.30, 1.0, -14, 0.03, 0.15, None),
    (31.80, "sob_643669.mp3", 0.0, 0.3, -12, 0.01, 0.05, ("lp", 6000)),        # into the loop: shot 1's first sob
]


def hum_notes(semis, dur):
    """hum foley: one real hummed note (Freesound 802522, CC0) re-pitched into a little melody."""
    base = load(FS("hum_m_802522.mp3"), 0.2, 0.75)
    out = []
    for n in semis:
        r = 2 ** (n / 12); idx = np.arange(0, len(base) - 1, r)
        x = np.interp(idx, np.arange(len(base)), base)[:int(dur * SR)]
        out.append(fade(x, 0.02, 0.05))
    return np.concatenate(out)


SPECIAL = {"HUM": lambda: hum_notes([0, 2, 4, 2, 0], 0.26),
           "TWINKLE": lambda: hum_notes([-4, -4, 3, 3, 5, 5, 3], 0.19)}    # C C G G A A G (from E4)
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

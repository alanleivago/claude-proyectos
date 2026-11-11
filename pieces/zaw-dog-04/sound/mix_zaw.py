"""venv: zaw-dog #4 soundtrack (from zaw-dog-03/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
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
HERO_T = 1.05                 # zaw-dog #4: in the gap after "dog," (0.99-1.65 s, voice timeline): never covers a word
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)
    # line 1-2: DOG PARK - the owner pets the white dog; ours freezes, head snaps round, HERO bark
    (0.00, "park_amb_387964.mp3", 2.0, 5.1, -19, 0.05, 0.25, None),            # park ambience (birds, distant voices)
    (0.10, "dog_pant_841349.mp3", 0.0, 2.0, -16, 0.05, 0.2, None),            # the white dog's happy panting
    (0.93, "collar_420191.mp3", 0.78, 1.30, -16, 0.01, 0.12, ("lp", 7000)),    # head snap: tags jingle
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.47, 5.0, 0.003, 0.05, None),      # HERO bark (main burst), ~+3 dB over the (boosted) voice
    (2.10, "dog_pant_841349.mp3", 0.0, 2.0, -17, 0.05, 0.3, None),
    (3.05, "park_amb_387964.mp3", 6.0, 7.8, -21, 0.05, 0.3, None),
    (3.10, "fur_rub_843660.mp3", 0.0, 0.5, -14, 0.01, 0.1, None),             # his hand scratching the fur
    (3.55, "fur_rub_843663.mp3", 0.0, 0.8, -14, 0.01, 0.1, None),
    (3.95, "dog_growl2_372536.mp3", 1.17, 1.74, -12, 0.01, 0.15, None),        # our dog's low growl-huff
    (4.30, "fur_rub_843660.mp3", 0.0, 0.5, -15, 0.01, 0.1, None),
    # line 3-4: living room - tags, tail thumps, the counters pop
    (4.90, "collar_420191.mp3", 1.00, 1.50, -17, 0.02, 0.15, ("lp", 7000)),
    (4.97, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),            # "UC SAN DIEGO 2014"
    (5.25, "tail_thump_657779.mp3", 0.0, 1.0, -14, 0.01, 0.2, None),           # tail thumps on the rug
    (5.87, "pop_744140.mp3", 0.0, 0.2, -7, 0.0, 0.05, ("hp", 250)),            # "36"
    (6.40, "tail_thump_657779.mp3", 0.0, 1.0, -15, 0.01, 0.2, None),
    (8.40, "box_rattle_697092.mp3", 0.0, 0.35, -12, 0.0, 0.1, None),            # the plastic pail lifted off the table
    (8.95, "dog_whine_498703.mp3", 2.15, 3.0, -14, 0.02, 0.2, None),            # the tail stops: a small whine
    # line 5: three quick cuts
    (10.30, "box_rattle_697092.mp3", 0.0, 0.35, -11, 0.0, 0.1, None),           # plastic tap
    (10.62, "box_rattle_697092.mp3", 0.0, 0.35, -13, 0.0, 0.08, None),
    (11.02, "page_flip_484961.mp3", 0.0, 0.6, -10, 0.0, 0.1, None),            # page flip
    (11.47, "toy_motor2_740246.mp3", 0.0, 1.2, -16, 0.03, 0.15, ("hp", 200)),  # the fake dog's mechanical whirr
    (12.60, "toy_motor2_740246.mp3", 0.0, 1.2, -17, 0.05, 0.2, ("hp", 200)),
    (11.62, "toy_bark2_583142.mp3", 0.0, 0.5, -10, 0.003, 0.08, ("hp", 500)),  # toy bark (thin, small)
    (12.10, "toy_bark2_583142.mp3", 0.0, 0.5, -11, 0.003, 0.08, ("hp", 500)),
    (12.62, "toy_bark2_583142.mp3", 0.0, 0.5, -11, 0.003, 0.08, ("hp", 500)),
    # line 6-7: nudges, shoves, counters
    (13.75, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "42%"
    (13.95, "crouch_cloth_494789.mp3", 0.0, 0.8, -14, 0.02, 0.15, None),       # soft nudge at his elbow
    (14.40, "box_rattle_697092.mp3", 0.0, 0.35, -15, 0.0, 0.08, None),         # he pats the pumpkin
    (14.75, "box_rattle_697092.mp3", 0.0, 0.35, -16, 0.0, 0.08, None),
    (15.80, "sofa_squeak_501015.mp3", 0.0, 1.0, -13, 0.01, 0.2, None),         # claws on the sofa
    (16.07, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "78%"
    (16.45, "crouch_cloth_494795.mp3", 0.0, 0.9, -12, 0.01, 0.15, None),       # the shove
    (16.90, "dog_breath_483702.mp3", 0.683, 1.40, -14, 0.02, 0.2, None),         # an indignant huff
    # line 8-9: the wedge, the toy thuds, the snap
    (18.05, "crouch_cloth_494796.mp3", 0.0, 1.0, -12, 0.01, 0.15, None),       # fabric squeeze
    (18.28, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "1/3"
    (18.60, "sofa_squeak_501015.mp3", 0.0, 0.8, -15, 0.01, 0.2, None),
    (19.08, "soft_thud_443848.mp3", 0.0, 0.5, -9, 0.0, 0.1, None),             # the toy thuds onto the rug
    (20.45, "toy_motor2_740246.mp3", 0.0, 1.2, -18, 0.03, 0.2, ("hp", 200)),   # it keeps whirring
    (20.62, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "1/4"
    (20.70, "teeth_snap2_691908.mp3", 0.0, 0.5, -7, 0.0, 0.08, None),          # SNAP (jaw shuts at 0.35 / 0.80 / 1.25 s into the shot)
    (20.70, "dog_growl2_372536.mp3", 1.17, 1.74, -14, 0.01, 0.1, None),        # with a snarl
    (21.15, "teeth_snap2_691908.mp3", 0.0, 0.5, -8, 0.0, 0.08, None),
    (21.16, "toy_motor2_740246.mp3", 0.0, 1.2, -18, 0.05, 0.2, ("hp", 200)),
    (21.60, "teeth_snap2_691908.mp3", 0.0, 0.5, -8, 0.0, 0.08, None),
    # line 10: the sniff test
    (22.10, "dog_sniff_528939.mp3", 0.0, 1.6, -11, 0.01, 0.2, None),          # long sniffs
    (22.32, "pop_744140.mp3", 0.0, 0.2, -8, 0.0, 0.05, ("hp", 300)),           # "86%"
    (23.20, "dog_sniff_427169.mp3", 0.0, 2.0, -12, 0.01, 0.25, None),
    # line 11-13: the screen test (hallway)
    (24.80, "screen_slide_590167.mp3", 0.0, 1.9, -13, 0.02, 0.25, None),       # the divider creaks
    (24.85, "footsteps_in_366111.mp3", 0.0, 1.6, -18, 0.0, 0.25, None),        # footsteps on wood
    (24.93, "pop_744140.mp3", 0.0, 0.2, -9, 0.0, 0.05, ("hp", 300)),           # "NEW ZEALAND 2021"
    (26.85, "fur_rub_843663.mp3", 0.0, 0.8, -15, 0.01, 0.1, None),             # behind it: stroking the fake dog
    (27.75, "leash_strain_498698.mp3", 2.44, 3.88, -9, 0.01, 0.2, None),      # leash strain
    (27.90, "collar_420191.mp3", 0.78, 1.40, -15, 0.01, 0.15, ("lp", 7000)),
    (28.30, "dog_skid_208654.mp3", 0.165, 1.47, -11, 0.01, 0.15, None),        # claws scrabbling on the floor
    (29.10, "leash_strain_498698.mp3", 2.44, 3.88, -11, 0.01, 0.2, None),
    (29.40, "dog_whine_498703.mp3", 2.95, 3.6, -13, 0.02, 0.2, None),           # whines
    (30.10, "dog_skid_208654.mp3", 0.165, 1.1, -13, 0.01, 0.15, None),
    (30.62, "crouch_cloth_494796.mp3", 0.0, 0.4, -18, 0.01, 0.1, None),        # he pats the fleece tube (clear of "fleece")
    (32.25, "dog_yawn_826022.mp3", 0.0, 1.3, -11, 0.02, 0.2, None),            # yawn
    (32.95, "dog_sigh_427172.mp3", 0.0, 1.0, -10, 0.02, 0.2, None),            # sigh
    # line 14: back home - the inspection, then the cut into the park (loop)
    (33.61, "dog_sniff_595826.mp3", 0.0, 1.0, -8, 0.01, 0.15, None),           # LOUD close sniffs
    (34.66, "dog_sniff_528939.mp3", 0.0, 1.1, -10, 0.01, 0.15, None),
    (35.56, "park_amb_387964.mp3", 1.7, 2.0, -19, 0.25, 0.0, None),            # the park creeps in: seamless loop into shot 1
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

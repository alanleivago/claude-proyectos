"""venv: zaw-dog #1 soundtrack. Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
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
CUES = [
    (0.00, "car_away_119829.mp3", 4.5, 6.4, -9, 0.05, 0.9, ("lp", 3500)),        # 01a: the owner's car pulls away (heard through glass)
    (1.046, "dog_bark_small_813120.mp3", 0.0, 0.23, 3, 0.003, 0.06, None),      # 01a the Zaw opener: one puppy yip, onset 1.05 (head jerk)
    (3.05, "dog_sniff_427169.mp3", 0.0, 1.0, -8, 0.01, 0.1, None),              # 02a nose ECU: sniff-sniff
    (3.98, "pop_744140.mp3", 0.0, 0.2, -10, 0.0, 0.05, ("hp", 300)),            # 02b red "?" pops
    (4.42, "clock_tick_759501.mp3", 0.0, 0.56, -11, 0.0, 0.05, None),           # "?" becomes a clock
    (5.10, "dog_sniff_528939.mp3", 0.0, 1.5, -10, 0.01, 0.2, None),             # 03a nose POV over the sofa
    (6.05, "dog_walk_635117.mp3", 4.6, 6.9, -16, 0.15, 0.4, ("lp", 6500)),     # 03b dog-height dolly: claws on wood + tags
    (6.40, "dog_sniff_427169.mp3", 1.0, 2.0, -15, 0.01, 0.2, None),             # 03b faint sniff down the hallway
    (9.63, "clock_tick_759501.mp3", 0.0, 1.8, -15, 0.05, 0.2, None),            # 04b lab clock
    (11.48, "tail_thump_657779.mp3", 0.0, 1.5, -10, 0.01, 0.2, None),           # 05a happy wag (strong smell)
    (11.53, "puppy_bark_819516.mp3", 0.40, 0.80, -11, 0.005, 0.08, None),     # 05a happy yip (strong smell)
    (11.70, "collar_420191.mp3", 0.78, 1.70, -17, 0.02, 0.2, ("lp", 7000)),    # 05a bouncing: collar tags
    (11.85, "dog_breath_397882.mp3", 9.0, 10.9, -18, 0.15, 0.4, None),         # 05a happy panting
    (13.18, "dog_whimper_110816.mp3", 0.0, 1.05, -11, 0.01, 0.15, None),        # 05b sad at the door (faint smell)
    (14.30, "dog_paws_208654.mp3", 0.0, 0.7, -12, 0.01, 0.1, None),             # 06a hop onto the sofa
    (14.35, "collar_420191.mp3", 1.00, 1.90, -17, 0.02, 0.2, ("lp", 7000)),    # 06a hop: collar jingle
    (16.25, "car_arrive_136536.mp3", 4.5, 6.1, -12, 0.4, 0.3, ("lp", 3500)),    # 06b car turns the corner
    (17.88, "cloth_flap_844390.mp3", 1.25, 3.75, -10, 0.01, 0.2, None),         # 07a/b t-shirt flapping
    (19.40, "cloth_flap_844390.mp3", 1.25, 2.6, -12, 0.05, 0.25, None),
    (19.30, "dog_sniff_427169.mp3", 0.0, 1.0, -12, 0.01, 0.15, None),          # 07b scent floods back: sniff
    (20.72, "dog_whimper_350593.mp3", 0.0, 0.6, -14, 0.0, 0.1, None),          # 08a shocked little whine
    (21.94, "car_arrive_136536.mp3", 9.0, 11.2, -12, 0.03, 0.3, ("lp", 3500)),   # 08b car pulls up, nobody at the window
    (22.10, "dog_sniff_528939.mp3", 0.0, 1.2, -11, 0.01, 0.2, None),             # 08b nose ECU: "his nose said..."
    (23.25, "car_door_437039.mp3", 0.0, 0.3, -14, 0.0, 0.05, ("lp", 4000)),
    (23.65, "clock_tick_759501.mp3", 2.0, 5.5, -16, 0.2, 0.4, None),            # 09 the house waits
    (23.90, "dog_breath_397882.mp3", 4.0, 6.0, -20, 0.4, 0.6, ("lp", 5000)),   # 09a alone on the bed: soft breathing
    (26.05, "dog_whimper_235926.mp3", 0.30, 1.05, -16, 0.03, 0.2, None),       # 09b stacked rooms: small sad whimper
    (27.40, "front_door_398747.mp3", 0.0, 0.8, -15, 0.01, 0.2, None),           # 10a door opens
    (28.30, "keys_618539.mp3", 0.0, 0.6, -19, 0.01, 0.2, None),
    (28.03, "tail_thump_657779.mp3", 0.22, 0.57, -12, 0.005, 0.08, None),         # the 0:30 dog: one wag
    (28.95, "dog_happy_396307.mp3", 0.0, 1.5, -9, 0.01, 0.2, None),             # 10b the 2 h / 4 h dogs launch
    (29.05, "dog_paws_208654.mp3", 0.5, 1.6, -13, 0.01, 0.15, None),
    (29.10, "collar_420191.mp3", 1.60, 2.50, -16, 0.02, 0.2, ("lp", 7000)),    # 10b tags jingling as they launch
    (29.55, "puppy_bark_819516.mp3", 1.10, 1.85, -12, 0.005, 0.1, None),      # 10b happy yips
    (30.50, "footsteps_in_366111.mp3", 0.0, 1.6, -13, 0.0, 0.2, None),         # 11 owner walks in at night
    (31.20, "bag_rustle_521219.mp3", 0.0, 1.1, -12, 0.01, 0.2, None),           # groceries on the counter
    (31.90, "dog_sniff_528939.mp3", 0.0, 0.6, -15, 0.01, 0.15, None),          # 11 the dog stares: short sniff/huff
    (32.60, "dog_breath_397882.mp3", 4.0, 6.0, -20, 0.4, 0.6, None),           # 12a soft panting at the window
    (34.30, "car_away_119829.mp3", 4.5, 6.3, -9, 0.05, 0.9, ("lp", 3500)),      # 12b loop: the car pulls away again
    # rev 4 (user: more dog sounds): real CC0 barks / yips / whines / huffs, picked + trimmed with earshot rank/find,
    # checked with realness (0.91-0.97), all under the voice
    (2.40, "chihuahua_163459.mp3", 0.695, 1.135, -13, 0.003, 0.06, ("lp", 3000)),   # 01b a bark behind the glass
    (6.95, "puppy_yip_155320.mp3", 0.50, 1.50, -17, 0.03, 0.25, None),            # 03b the trail fades: a small whine
    (12.45, "puppy_bark_155309.mp3", 0.439, 0.795, -12, 0.003, 0.06, None),       # 05a strong smell: second happy yip
    (15.20, "dog_breath_483702.mp3", 0.683, 1.60, -15, 0.02, 0.2, None),          # 06a settles on the sofa: huff
    (16.75, "dog_yip_484297.mp3", 0.585, 0.90, -11, 0.003, 0.06, None),           # 06b the car turns in: excited yip
    (20.25, "dog_breath_483702.mp3", 2.229, 2.83, -15, 0.01, 0.15, None),         # 07b the scent floods back: huff
    (27.75, "puppy_yip_155320.mp3", 0.50, 1.40, -14, 0.03, 0.2, None),            # 10a the door opens: happy whine
    (30.05, "puppy_bark_155309.mp3", 0.096, 0.439, -12, 0.003, 0.06, None),       # 10b one more yip as they land
    (31.50, "dog_breath_483702.mp3", 0.683, 1.40, -14, 0.02, 0.2, None),          # 11 judging huff
    (33.20, "chihuahua_163459.mp3", 0.291, 0.695, -15, 0.003, 0.06, ("lp", 3000)),  # 12a a last small bark at the window
]

# dips inside a cue (cue time, timeline start, end, dB): clear room for the opening yip under the departing car
DIPS = [(0.00, 0.80, 1.45, -9)]

voice = np.zeros(N); v = load(os.path.join(P, "voice", "voice_retro.wav")); voice[:min(N, len(v))] = v[:N]
vref = rms_db(voice[np.abs(voice) > 0.02])                                   # speech-only RMS
vpk = np.abs(voice).max()
vd = np.ones(N); vd[int(1.04 * SR):int(1.22 * SR)] = 10 ** (-4 / 20)                 # the voice leans back 4 dB under the yip
from scipy.ndimage import uniform_filter1d as _uf
voice = voice * _uf(vd, int(0.03 * SR))
sfx = np.zeros(N); hero = np.zeros(N)
HERO = {1.046}           # the opening yip is the Zaw "meow": prominent, over the voice RMS, outside the SFX caps
for t, f, a, b, lvl, fi, fo, flt in CUES:
    x = load(FS(f), a, b)
    if flt:
        x = (lp if flt[0] == "lp" else hp)(x, flt[1])
    x = hp(x, 150 if "cloth" in f else 80)
    if t in HERO:                                                               # denser yip: soft saturation, same peak
        pk = np.abs(x).max(); x = np.tanh(2.0 * x / pk) / np.tanh(2.0) * pk
    x = fade(x, fi, fo); x *= 10 ** ((vref + lvl - rms_db(x[np.abs(x) > 1e-4])) / 20)
    cap = min(1.0, vpk * 10 ** ((2 if t in HERO else -5) / 20) / (np.abs(x).max() + 1e-9)); x *= cap  # SFX peak <= voice peak - 5 dB
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
hd = np.ones(N); i0, i1 = int(0.95 * SR), int(1.4 * SR)                        # music steps aside for the yip
hd[i0:i1] = 10 ** (-8 / 20); hd = uniform_filter1d(hd, int(0.04 * SR))
music = mu * (duck * hd)[:, None]
st = lambda m: np.stack([m, m], 1)
pre = st(voice) + music + st(sfx)
for n_, x in (("voice", st(voice)), ("music", music), ("sfx", st(sfx)), ("premaster", pre)):
    sf.write(os.path.join(OUT, f"{n_}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
# master: loudnorm 2-pass -> -11 LUFS integrated, -1 dBTP
src = os.path.join(OUT, "premaster.wav"); dst = os.path.join(OUT, "final_mix.wav")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-11:TP=-2.4:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = (f"loudnorm=I=-11:TP=-2.4:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.75:level=false,aresample=48000")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", dst], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("voice RMS", round(vref, 1), "music gain", round(g0, 1), "dB")
print("\n".join(l for l in m.splitlines()[-12:] if any(k in l for k in ("I:", "Peak:", "LRA:"))))

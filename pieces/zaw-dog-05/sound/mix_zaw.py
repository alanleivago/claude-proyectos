"""venv: zaw-dog #5 soundtrack (from zaw-dog-04/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
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


FS = lambda n: os.path.join(H, "chosen5", n)
HERO_T = 1.62                 # zaw-dog #5: in the gap after "everything," (1.51-2.26 s): never covers a word
# zaw-dog #5 cues (every file CC0 Freesound, ranked with earshot rank, realness p_real 0.87-1.00, see CREDITS.md)
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)
    # 01a-01b street: he tugs, the dog plants at the lamppost, long sniff, HERO bark in the gap
    (0.00, "street_amb_484189.mp3", 1.0, 6.2, -20, 0.05, 0.3, None),            # suburban street, birds
    (0.05, "leash_strain_498698.mp3", 2.44, 3.4, -14, 0.02, 0.2, None),          # leash tug
    (0.35, "dog_sniff_427169.mp3", 0.0, 1.25, -12, 0.01, 0.15, None),           # long sniff at the post
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.47, 5.0, 0.003, 0.05, None),      # HERO bark (main burst), ~+3 dB over the (boosted) voice
    (2.15, "dog_sniff_528939.mp3", 0.0, 1.0, -13, 0.01, 0.15, None),            # back to reading
    # 02 headlines pop over the post and the grass
    (3.20, "paper_rustle_332112.mp3", 0.3, 1.0, -14, 0.01, 0.15, None),         # BUSTER WAS HERE
    (3.32, "pop_744144.mp3", 0.0, 0.127, -12, 0.002, 0.03, None),
    (4.48, "paper_rustle_332112.mp3", 1.4, 2.0, -15, 0.01, 0.15, None),         # NEW DOG IN TOWN
    (4.55, "pop_744140.mp3", 0.0, 0.226, -12, 0.002, 0.04, None),
    (4.80, "dog_sniff_427169.mp3", 1.25, 2.1, -14, 0.01, 0.15, None),           # sniffing the grass
    (5.20, "street_amb_484189.mp3", 7.0, 9.2, -21, 0.05, 0.3, None),
    # 03 the nose close-up, the counter pop
    (6.12, "dog_sniff_528939.mp3", 0.0, 1.6, -12, 0.01, 0.15, None),            # quick sniffs
    (6.32, "pop_744144.mp3", 0.0, 0.127, -11, 0.002, 0.03, None),               # 300,000,000
    (7.70, "dog_sniff_427169.mp3", 0.0, 1.1, -14, 0.01, 0.15, None),
    (6.10, "street_amb_484189.mp3", 10.0, 13.0, -22, 0.1, 0.3, None),
    # 04 he sniffs the post too, "huh"
    (9.06, "street_amb_484189.mp3", 14.0, 15.7, -22, 0.05, 0.3, None),
    (9.23, "pop_744140.mp3", 0.0, 0.226, -12, 0.002, 0.04, None),               # 6,000,000
    (9.35, "human_sniff_202101.mp3", 0.0, 1.0, -13, 0.01, 0.12, None),          # the human sniff
    (10.30, "huh_801176.mp3", 0.0, 0.7, -16, 0.01, 0.1, None),                  # (after "million", before line 5)
    # 05 the lab: the cards pop row by row
    (10.80, "collar_jingle_851618.mp3", 0.5, 1.2, -18, 0.02, 0.2, ("lp", 7000)),
    (10.88, "pop_744144.mp3", 0.0, 0.127, -13, 0.002, 0.03, None),              # BARNARD COLLEGE, 2019
    (11.18, "pop_744140.mp3", 0.0, 0.226, -15, 0.002, 0.04, None),              # row 1..4
    (11.30, "pop_744144.mp3", 0.0, 0.127, -15, 0.002, 0.03, None),
    (11.42, "pop_744140.mp3", 0.0, 0.226, -15, 0.002, 0.04, None),
    (11.54, "pop_744144.mp3", 0.0, 0.127, -15, 0.002, 0.03, None),
    (11.70, "tail_thump_657779.mp3", 0.0, 1.0, -17, 0.01, 0.15, None),          # the sitting dog's tail
    # 06 trot to the food bowl, crunch
    (12.75, "dog_walk_635117.mp3", 0.5, 1.9, -15, 0.02, 0.15, None),            # trot
    (13.45, "pop_744140.mp3", 0.0, 0.226, -12, 0.002, 0.04, None),              # the green check
    (14.05, "crunch_412310.mp3", 0.0, 1.2, -9, 0.01, 0.12, None),               # kibble crunch
    # 07 the empty bowl: sniff, sad huff
    (15.33, "dog_sniff_528939.mp3", 0.0, 0.8, -13, 0.01, 0.12, None),
    (16.15, "pop_744144.mp3", 0.0, 0.127, -12, 0.002, 0.03, None),              # the red cross
    (16.45, "dog_sigh_427172.mp3", 0.0, 0.7, -15, 0.01, 0.15, None),             # sad huff (CC0; the beagle snort was CC BY) (after "did.")
    # 08 the "?" bowl: question pop, collar jingle on the head tilt
    (16.88, "pop_744140.mp3", 0.0, 0.226, -11, 0.002, 0.04, None),
    (17.40, "collar_jingle_851618.mp3", 2.4, 3.1, -16, 0.01, 0.2, ("lp", 7000)),
    # 09 park: treat hunt
    (18.72, "park_amb_387964.mp3", 2.0, 4.6, -19, 0.05, 0.3, None),             # park birds
    (18.80, "dog_sniff_427169.mp3", 0.0, 2.1, -13, 0.01, 0.15, None),           # happy sniffs
    (18.95, "pop_744144.mp3", 0.0, 0.127, -12, 0.002, 0.03, None),              # 2 WEEKS
    (20.10, "tail_thump_657779.mp3", 1.0, 2.2, -18, 0.01, 0.15, None),          # tail swish
    (20.60, "crunch_412310.mp3", 1.3, 2.4, -12, 0.01, 0.12, None),              # treat crunch
    # 10 the heel walk: steps on grass, tags, a small whine, NO!
    (21.20, "park_amb_387964.mp3", 6.0, 8.8, -20, 0.05, 0.3, None),
    (21.30, "steps_grass_384859.mp3", 0.0, 1.0, -15, 0.005, 0.1, None),
    (21.85, "steps_grass_384866.mp3", 0.0, 1.0, -15, 0.005, 0.1, None),
    (22.40, "steps_grass_384859.mp3", 0.0, 1.0, -15, 0.005, 0.1, None),
    (22.95, "steps_grass_384866.mp3", 0.0, 1.0, -15, 0.005, 0.1, None),
    (21.55, "pop_744140.mp3", 0.0, 0.226, -13, 0.002, 0.04, None),              # NO!
    (22.10, "collar_jingle_851618.mp3", 4.0, 4.8, -18, 0.01, 0.2, ("lp", 7000)),
    (23.10, "dog_whine_498703.mp3", 2.23, 3.0, -16, 0.02, 0.2, None),            # small whine
    # 11 the sprint: claws scrambling on the floor, a happy bark
    (24.05, "dog_skid_208654.mp3", 0.0, 1.8, -12, 0.01, 0.2, None),
    (26.62, "puppy_bark_819516.mp3", 0.39, 0.715, -8, 0.003, 0.08, None),         # happy bark (after "faster.")
    # 12 the beaming dog: soft sparkle chime, panting
    (26.90, "chimes_246258.mp3", 0.0, 1.8, -17, 0.02, 0.4, None),
    (27.10, "pop_744144.mp3", 0.0, 0.127, -13, 0.002, 0.03, None),              # MORE OPTIMISTIC
    (27.35, "dog_pant_841349.mp3", 0.0, 1.5, -16, 0.05, 0.2, None),
    # 13 the heel walker plods: slow steps, a sigh
    (28.98, "dog_walk_635117.mp3", 4.0, 5.6, -17, 0.05, 0.2, None),
    (30.62, "dog_sigh_427172.mp3", 0.0, 1.0, -14, 0.01, 0.15, None),            # (after "all.")
    # 14 street again: leash creak, he stops, the dog dives into the grass -> line 1
    (30.82, "street_amb_484189.mp3", 18.0, 21.0, -20, 0.05, 0.2, None),
    (30.90, "leash_strain_498698.mp3", 2.44, 3.4, -14, 0.02, 0.2, None),         # leash creak
    (32.50, "dog_sniff_427169.mp3", 0.0, 0.9, -11, 0.01, 0.08, None),           # happy sniff, cut at the loop
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

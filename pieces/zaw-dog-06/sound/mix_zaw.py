"""venv: zaw-dog #6 soundtrack (from zaw-dog-05/sound/mix_zaw.py). Real Freesound SFX (CC0, picked/trimmed with earshot rank+find) on the picture beats,
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
HERO_T = 1.10                 # zaw-dog #6: bark onset ~1.18 s, inside the gap after "stressed," (1.03-1.82 s): never covers a word
G1, G2 = 25.16, 26.10         # the two subtle real gasps, on the scared face swaps (11b on the cut, 12a)
POPS = [3.32, 5.05, 8.10, 8.80, 10.15, 11.99, 13.60, 14.67, 15.58, 19.30, 20.20, 22.02, 24.42, 26.03, 26.98]   # + BOSS / BILLS / TRAFFIC   # the 3D text pop-ins (shots.py text_at t0)
CUES = [   # (time s, file, start, end, level dB rel. voice RMS, fade in, fade out, filter)  every file CC0 (CREDITS.md), earshot-ranked
    (0.00, "room_tone_329533.mp3", 0.5, 3.6, -24, 0.05, 0.2, None),
    (0.25, "groan2_318088.mp3", 0.05, 1.2, -15, 0.01, 0.2, None),            # his tired sigh (facepalm)
    (HERO_T, "hero_bark_483180.mp3", 0.25, 0.55, 5.0, 0.003, 0.05, None),   # HERO bark in the gap (+3 dB over the boosted voice)
    (2.05, "dog_whine_498703.mp3", 2.2, 3.0, -16, 0.02, 0.2, None),
    (3.07, "room_tone_329533.mp3", 3.6, 10.6, -24, 0.05, 0.2, None),
    (3.45, "glass2_560298.mp3", 0.5, 1.0, -14, 0.003, 0.1, None),            # the hair vial
    (3.95, "snip_745709.mp3", 0.0, 0.28, -15, 0.002, 0.05, None),
    (4.90, "whoosh_830856.mp3", 0.0, 0.45, -17, 0.005, 0.1, None),           # cut to the top-down rack
    (5.60, "glass2_560298.mp3", 0.5, 1.0, -17, 0.003, 0.1, None),
    (6.73, "whoosh_830856.mp3", 0.0, 0.45, -16, 0.005, 0.1, None),           # the giant strand
    (7.00, "dog_sniff_427169.mp3", 0.0, 1.5, -13, 0.01, 0.15, None),
    (8.72, "whoosh_830856.mp3", 0.0, 0.45, -17, 0.005, 0.1, None),           # crane up
    (10.30, "dog_whine_498703.mp3", 2.2, 3.2, -15, 0.02, 0.2, None),         # stressed pair
    (10.70, "collar_jingle_851618.mp3", 0.5, 1.2, -19, 0.02, 0.2, ("lp", 7000)),
    (12.10, "dog_pant_841349.mp3", 0.0, 1.4, -15, 0.05, 0.2, None),          # calm pair
    (12.40, "tail_thump_657779.mp3", 0.2, 1.2, -16, 0.01, 0.15, None),
    (13.50, "wind_407026.mp3", 2.0, 3.1, -17, 0.05, 0.15, None),             # WINTER night
    (13.50, "steps_street_272380.mp3", 0.2, 1.1, -16, 0.01, 0.1, None),
    (14.57, "street_amb_484189.mp3", 1.0, 1.9, -19, 0.03, 0.15, None),       # SUMMER day
    (14.57, "steps_street_272380.mp3", 2.0, 2.9, -16, 0.01, 0.1, None),
    (15.43, "park_amb_387964.mp3", 2.0, 6.0, -20, 0.05, 0.3, None),          # park
    (15.90, "beep2_540902.mp3", 0.0, 0.14, -14, 0.002, 0.03, None),          # the tracker LED
    (16.55, "beep2_540902.mp3", 0.0, 0.14, -15, 0.002, 0.03, None),
    (17.15, "dog_skid_208654.mp3", 0.15, 2.0, -12, 0.01, 0.2, None),         # zoomies
    (17.30, "dog_walk_635117.mp3", 7.0, 8.6, -14, 0.02, 0.15, None),
    (18.30, "dog_pant_841349.mp3", 0.0, 0.8, -16, 0.02, 0.15, None),
    (19.10, "dog_skid_208654.mp3", 0.18, 0.5, -12, 0.003, 0.08, None),       # dead stop
    (19.20, "whoosh_830856.mp3", 0.0, 0.45, -17, 0.005, 0.1, None),          # snap-zoom accent
    (26.88, "whoosh_830856.mp3", 0.0, 0.45, -15, 0.005, 0.1, None),          # whip pan after the car
    (19.10, "park_amb_387964.mp3", 7.0, 8.1, -21, 0.05, 0.2, None),
    (19.70, "dog_sigh_427172.mp3", 0.3, 0.9, -15, 0.01, 0.15, None),
    (20.10, "room_tone_329533.mp3", 10.6, 14.9, -24, 0.05, 0.2, None),
    (20.45, "ui_pop_323738.mp3", 0.0, 0.08, -14, 0.001, 0.02, None),         # the face swaps
    (20.81, "ui_pop_323738.mp3", 0.0, 0.08, -14, 0.001, 0.02, None),
    (21.16, "ui_pop_323738.mp3", 0.0, 0.08, -14, 0.001, 0.02, None),
    (21.52, "ui_pop_323738.mp3", 0.0, 0.08, -14, 0.001, 0.02, None),
    (22.30, "collar_jingle_851618.mp3", 2.4, 3.1, -16, 0.01, 0.2, ("lp", 7000)),   # head tilt
    (23.60, "dog_sigh_427172.mp3", 0.3, 0.9, -16, 0.01, 0.15, None),
    (24.30, "yell_621821.mp3", 0.1, 1.0, -21, 0.01, 0.15, ("lp", 1100)),     # the boss, muffled
    (24.55, "whoosh_830856.mp3", 0.0, 0.45, -19, 0.005, 0.1, None),          # fist
    (25.15, "whoosh_830856.mp3", 0.0, 0.45, -18, 0.005, 0.1, None),          # he jumps back
    (G1, "gasp_812418.mp3", 0.0, 0.37, -11, 0.003, 0.06, None),              # GASP 1 (subtle, real)
    (26.00, "letters_572018.mp3", 0.25, 1.0, -14, 0.01, 0.1, None),          # the bills
    (G2, "gasp_344407.mp3", 0.12, 0.5, -11, 0.003, 0.06, None),              # GASP 2 (subtle, real)
    (26.90, "street_amb_484189.mp3", 5.0, 5.6, -18, 0.02, 0.1, None),
    (26.92, "car_horn_571322.mp3", 0.38, 0.9, -12, 0.003, 0.08, None),
    (26.90, "car_pass_171447.mp3", 1.0, 2.2, -10, 0.05, 0.25, None),
    (27.50, "room_tone_329533.mp3", 0.5, 4.6, -24, 0.05, 0.3, None),
    (27.55, "dog_walk_635117.mp3", 4.0, 5.8, -15, 0.05, 0.2, None),          # plodding with the burden
    (27.80, "paper_rustle_332112.mp3", 0.6, 1.3, -18, 0.01, 0.15, None),
    (28.90, "dog_sigh_427172.mp3", 0.3, 0.9, -15, 0.01, 0.15, None),
    (29.45, "groan2_318088.mp3", 0.05, 1.2, -14, 0.01, 0.2, None),           # he slumps
    (30.80, "dog_whine_498703.mp3", 2.2, 3.0, -15, 0.02, 0.15, None),        # -> loop
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

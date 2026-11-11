"""Kit v3 test mix (no narration): real CC0 SFX on the picture's beats + Bert Cole BGM, master -11 LUFS / -1 dBTP.
    .venv/bin/python pieces/kit-v3-test/sound/mix_v3.py   -> sound/out/final_mix.wav (+ sfx.wav, music.wav)
Beats come from shots.py (30 fps): steps = the walk's heel strikes (retarget contacts), hop f81, barks f84 / f96, the
scared face swap f86 = the subtle male scream (zawdog rule: a real, quiet scream when a face goes scared, 2-3 per short),
the shrug + smile swap f184. Levels are dB relative to the hero bark (the loudest cue)."""
import json
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, "out"); os.makedirs(OUT, exist_ok=True)
sys.path.insert(0, os.path.join(H, "..", "..", "zaw-dog-05", "sound"))
SR = 48000
DUR = 250 / 30; N = int(round(DUR * SR))
MUSIC = os.path.join(H, "..", "..", "lps-onoda", "audio", "assets", "music", "bertcole", "16-Bit Starter Pack", "Various Themes", "A Little R & R.ogg")
FS = lambda n: os.path.join(H, "fs", n)                                    # noqa: E731  (new, fetched by fs_fetch.py)
ZD = lambda n: os.path.join(H, "..", "..", "zaw-dog-05", "sound", "chosen5", n)   # noqa: E731  (verified in zaw-dog #5)


def load(path, a=0.0, b=None, mono=True):
    args = ["ffmpeg", "-v", "error", "-ss", str(a)] + (["-to", str(b)] if b else []) + ["-i", path, "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(args, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
    return x if mono else x.reshape(-1, 2)


def fade(x, fi=0.005, fo=0.05):
    x = x.copy(); n1, n2 = int(fi * SR), int(fo * SR)
    if n1: x[:n1] *= np.linspace(0, 1, n1)
    if n2: x[-n2:] *= np.linspace(1, 0, n2)
    return x


def peak_db(x):
    return 20 * np.log10(np.abs(x).max() + 1e-12)


F = lambda s: s / 30.0                                                     # noqa: E731
STEPS = [(2.866, 3.30), (2.127, 2.47), (5.583, 5.865), (9.642, 10.0)]
CUES = [  # (time s, file, start, end, peak dB rel. hero bark, fade out)
    # A: the walk-in, heel strikes of the retargeted CMU walk
    *[(F(f), FS("steps_wood_505832.mp3"), *STEPS[i % 4], -17, 0.08) for i, f in enumerate((0, 17, 34, 51, 67))],
    # B: hop (paws scrabble), collar, two barks, the scared swap = subtle scream (+ gasp), his two steps back
    (F(81), ZD("dog_skid_208654.mp3"), 0.0, 0.6, -15, 0.15),
    (F(81), ZD("collar_jingle_851618.mp3"), 0.5, 1.1, -16, 0.2),
    (F(84), ZD("hero_bark_483180.mp3"), 0.25, 0.47, 0, 0.05),
    (F(86), FS("scream_short_823246.mp3"), 0.183, 0.74, -11, 0.12),
    (F(86), FS("gasp_male_434550.mp3"), 0.0, 0.47, -15, 0.08),
    (F(96), ZD("puppy_bark_819516.mp3"), 0.0, 0.35, -4, 0.06),
    *[(F(f), FS("steps_wood_505832.mp3"), *STEPS[(i + 1) % 4], -16, 0.08) for i, f in enumerate((106, 115, 125, 137))],   # Kimodo landings
    # C: tail wag + collar, the shrug's "huh", panting under the smile
    (F(166), ZD("tail_thump_657779.mp3"), 0.0, 2.6, -18, 0.3),
    (F(168), ZD("collar_jingle_851618.mp3"), 2.4, 3.1, -19, 0.2),
    (F(183), ZD("huh_801176.mp3"), 0.0, 0.7, -14, 0.1),
    (F(196), ZD("dog_pant_841349.mp3"), 0.0, 1.8, -22, 0.3),
]
sfx = np.zeros(N)
for t, f, a, b, lvl, fo in CUES:
    x = fade(load(f, a, b), 0.004, fo)
    x *= 10 ** ((-6 + lvl - peak_db(x)) / 20)                            # hero bark peaks at -6 dBFS before the master
    i = int(t * SR); n = min(len(x), N - i); sfx[i:i + n] += x[:n]
room = load(FS("room_tone_565536.mp3"), 2.0, 2.0 + DUR + 0.1)[:N]
room = np.pad(room, (0, max(0, N - len(room)))) * 10 ** ((-46 - 20 * np.log10(np.sqrt((room ** 2).mean()) + 1e-12)) / 20)
mu = load(MUSIC, 0.0, DUR + 0.5, mono=False)[:N]; mu = np.pad(mu, ((0, max(0, N - len(mu))), (0, 0)))
mu *= 10 ** ((-29 - 20 * np.log10(np.sqrt((mu ** 2).mean()) + 1e-12)) / 20)   # bed ~-29 dBFS RMS: the SFX lead (barks, scream)
env = np.ones(N); i0, i1 = int(F(83) * SR), int(F(92) * SR)
env[i0:i1] = 10 ** (-8 / 20)                                             # music steps aside for the bark + scream
from scipy.ndimage import uniform_filter1d  # noqa: E402
env = uniform_filter1d(env, int(0.05 * SR))
env[:int(0.2 * SR)] *= np.linspace(0, 1, int(0.2 * SR)); env[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
music = mu * env[:, None]
st = lambda m: np.stack([m, m], 1)                                       # noqa: E731
pre = music + st(sfx + room)
for n_, x in (("music", music), ("sfx", st(sfx + room)), ("premaster", pre)):
    sf.write(os.path.join(OUT, f"{n_}.wav"), x.astype(np.float32), SR, subtype="FLOAT")
src = os.path.join(OUT, "premaster.wav"); dst = os.path.join(OUT, "final_mix.wav")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-11:TP=-2.3:LRA=9:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
js = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
af = (f"loudnorm=I=-11:TP=-2.3:LRA=9:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:"
      f"measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,alimiter=limit=0.74:level=false,aresample=48000")
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-af", af, "-ar", "48000", "-c:a", "pcm_s24le", dst], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", dst, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
print("\n".join(l for l in m.splitlines()[-12:] if any(k in l for k in ("I:", "Peak:", "LRA:"))))

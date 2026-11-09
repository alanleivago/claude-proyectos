"""Trims of the Freesound CC0 recordings -> cuts/*.wav, mono 48 kHz, short fades. 'heave' = a crowd heave built from 4
real effort grunts (staggered, pitched) over a crowd 'whoa' (there is no CC0 'crowd tug of war' take)."""
import numpy as np, soundfile as sf, subprocess, io
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'creak1': ('rope_creak_676987', 0.0, 2.6, -3, .02, .3), 'creak2': ('rope_creak_676986', 0.3, 2.8, -4, .02, .3), 'creakw': ('creak_646692', 0.0, 2.0, -2, .01, .3),
 'strain': ('rope_strain_676988', 0.0, 1.1, -5, .01, .2), 'tension': ('rope_strain_472287', 0.0, 1.2, -3, .01, .2),
 'slip': ('rope_pull_802697', 0.0, 1.6, -2, .005, .3), 'yank': ('rope_pull_802697', 0.0, 1.0, -6, .003, .25), 'grab': ('rope_pull_429215', 0.0, 0.7, -2, .003, .15),
 'grunt1': ('tug_grunt_714590', 0.0, 1.1, 0, .005, .2), 'grunt2': ('tug_grunt_714589', 0.0, 1.4, -1, .005, .2), 'grunt3': ('tug_grunt_661242', 0.0, 1.0, 1, .005, .2),
 'cheer': ('crowd_cheer_267246', 0.0, 5.0, 0, .05, 1.2), 'cheer2': ('crowd_shout_848423', 0.0, 5.0, 0, .05, 1.2),
 'tractor': ('tractor_idle_406808', 2.0, 6.5, 0, .2, .8), 'elephant': ('elephant_527845', 0.0, 2.0, -1, .01, .3), 'sneeze': ('sneeze_660766', 0.0, 2.1, -1, .005, .3),
 'zip': ('zipline_494800', 0.0, 1.4, -6, .01, .3), 'landslide': ('landslide_811070', 0.0, 3.7, -2, .05, .8), 'gravel': ('rock_slide_504381', 0.0, 1.5, -1, .005, .2),
 'chalk': ('chalk_233049', 0.0, 2.8, 0, .02, .3), 'kidscheer': ('kids_cheer_859076', 0.0, 3.2, 0, .02, .6), 'stake': ('hammer_wood_494476', 0.0, 0.9, -3, .002, .2),
 'bells': ('wedding_bells_703590', 0.0, 4.0, 0, .05, 1.0), 'cloth': ('cloth_stretch_493190', 0.0, 1.0, 0, .005, .2), 'giggle': ('giggle_616088', 0.0, 1.5, 3, .01, .3),
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1), 'gasp': ('gasp_608216', 0.0, 1.1, 3, .005, .25),
 'inhale': ('gasp_608216', 0.0, 0.9, -2, .005, .2), 'heart': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1), 'stomp': ('soft_land_614064', 0.0, 1.0, -8, .002, .3),
 'murmur': ('crowd_murmur_867051', 3.0, 5.6, 0, .3, .5), 'crowdgasp': ('crowd_gasp_763875', 0.0, 2.4, 0, .01, .5), 'fogwind': ('fog_wind_734663', 1.0, 4.5, 0, .6, 1.0),
 'rumble': ('thunder_far_712914', 0.0, 3.6, -3, .3, 1.0), 'mtnwind': ('mountain_wind_615440', 2.0, 6.0, 0, .5, 1.0), 'birds': ('birds_dawn_611453', 5.0, 9.0, 0, .5, 1.0),
 'gulls': ('seagulls_479528', 2.0, 6.0, 0, .3, .8), 'kids': ('playground_629652', 5.0, 9.0, 0, .3, .8),
}
def load(p, st):
    import glob; p = sorted(glob.glob(f'fs/{p}*.mp3'))[0]
    af = [] if not st else ['-af', f'asetrate={int(SR * 2 ** (st / 12))},aresample={SR}']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p] + af + ['-ac', '1', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float64')[0]
def save(name, x): sf.write(f'cuts/{name}.wav', (x / (np.abs(x).max() + 1e-9) * 0.89).astype(np.float32), SR)
out = {}
for name, (src, a, b, st, fi, fo) in C.items():
    r = 2 ** (st / 12); x = load(src, st)[int(a / r * SR):int(b / r * SR)].copy()
    x[:int(fi * SR)] *= np.linspace(0, 1, int(fi * SR)); n = min(len(x) - 1, int(fo * SR)); x[-n:] *= np.linspace(1, 0, n)
    out[name] = x / (np.abs(x).max() + 1e-9); save(name, x)
# crowd heave: grunts at 0/60/110/170 ms (+ pitch spread), a crowd 'whoa' under, a rope strain on top
def sh(x, st): import scipy.signal as ss; n = int(len(x) / 2 ** (st / 12)); return ss.resample(x, n)
for k, (pa, pb) in enumerate([(2, -2), (-3, 3)]):
    L = int(2.0 * SR); h = np.zeros(L)
    for d, g, st in [(0.0, 'grunt1', pa), (0.06, 'grunt2', pb), (0.11, 'grunt3', 0), (0.17, 'grunt1', pb - 1)]:
        y = sh(out[g], st) * (0.7 + 0.1 * k); i = int(d * SR); h[i:i + len(y)] += y[:L - i]
    w = load('crowd_shout_621287', -2)[:L]; h[:len(w)] += w * 0.35 / (np.abs(w).max() + 1e-9)
    s2 = out['strain']; h[int(0.2 * SR):int(0.2 * SR) + len(s2)] += s2 * 0.4
    n = int(0.5 * SR); h[-n:] *= np.linspace(1, 0, n); save(f'heave{k + 1}', h)
print(len(C) + 2, 'cuts')

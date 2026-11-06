"""Trims of the Freesound CC0 recordings (moments picked with earshot find) -> cuts/*.wav, mono 48 kHz, short fades."""
import numpy as np, soundfile as sf, subprocess, io
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1),
 'step3': ('footsteps_271039', 5.03, 5.41, 0, .003, .1),
 'stomp1': ('footsteps_271039', 3.46, 3.96, -3, .003, .12), 'stomp2': ('footsteps_271039', 4.28, 4.65, -3, .003, .12),
 'bare1': ('footsteps_271039', 3.46, 3.96, 4, .003, .08), 'bare2': ('footsteps_271039', 5.03, 5.41, 4, .003, .08),
 'wet1': ('wet_steps_369579', 3.90, 4.60, 0, .003, .15), 'wet2': ('wet_steps_369579', 8.127, 8.85, 0, .003, .15),
 'wet3': ('wet_steps_369579', 5.921, 6.60, 0, .003, .15), 'wet4': ('wet_steps_369579', 1.219, 1.565, 0, .003, .08),
 'dryer': ('dryer_start_613182', 0.0, 6.0, 0, .02, 1.5), 'whisper': ('whisper_234044', 0.4, 3.3, -2, .3, .6),
 'whisper2': ('whisper_489897', 0.5, 3.5, -2, .4, .8), 'drain2': ('drain_395245', 1.0, 3.5, -2, .2, .6),
 'door': ('school_door_607911', 0.0, 1.95, 0, .005, .25), 'giggle': ('giggle_616088', 0.0, 1.1, 1, .01, .2),
 'giggle2': ('giggle_616088', 1.5, 2.5, 1, .01, .2), 'dog': ('dog_841349', 0.0, 1.0, 0, .02, .2),
 'gasp': ('gasp_608216', 0.0, 1.1, 3, .005, .25), 'heart': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1),
 'tick': ('clock_tick_759501', 0.9, 3.0, 0, .005, .3), 'fallwind': ('wind_gust_536776', 0.3, 2.0, -4, .15, .3),
 'dryerdoor': ('creak_506664', 0.0, 1.1, 2, .003, .15), 'rattle': ('shingles_164638', 0.3, 2.1, -3, .003, .2),
 'drum': ('dryer_drum_411914', 5.0, 13.0, 0, .6, 2.0), 'knittex': ('knitting_468198', 3.6, 4.8, 0, .05, .2),
}
def load(p, st):
    af = [] if not st else ['-af', f'asetrate={int(SR * 2 ** (st / 12))},aresample={SR}']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p] + af + ['-ac', '1', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float64')[0]
def save(name, x): sf.write(f'cuts/{name}.wav', (x / (np.abs(x).max() + 1e-9) * 0.89).astype(np.float32), SR)
for name, (src, a, b, st, fi, fo) in C.items():
    r = 2 ** (st / 12); x = load(f'fs/{src}.mp3', st)[int(a / r * SR):int(b / r * SR)].copy()
    x[:int(fi * SR)] *= np.linspace(0, 1, int(fi * SR)); n = int(fo * SR); x[-n:] *= np.linspace(1, 0, n)
    save(name, x)
# knitting needles: real wood pats (fs 137086/137084) pitched up 14-19 st as tiny needle clicks, in pairs, over the real knitting texture
rng = np.random.default_rng(7); pats = [load(f'fs/{p}.mp3', 0) for p in ('desk_slam_137086', 'desk_slam_137084')]
tex = load('fs/knitting_468198.mp3', 0)[int(3.6 * SR):int(4.4 * SR)] * 0.35
for v in (1, 2):
    out = np.zeros(int(0.8 * SR)); out[:len(tex)] += tex * np.hanning(len(tex)); t = 0.0
    for _ in range(3):
        for dt in (0, rng.uniform(0.06, 0.09)):
            p = pats[rng.integers(2)]; r = 2 ** (rng.uniform(14, 19) / 12)
            p = np.interp(np.arange(int(len(p) / r)) * r, np.arange(len(p)), p)[:int(0.08 * SR)]
            i = int((t + dt) * SR); n = min(len(p), len(out) - i); out[i:i + n] += p[:n] * rng.uniform(0.6, 1)
        t += rng.uniform(0.18, 0.26)
    save(f'knit{v}', out)
print(len(C) + 2, 'cuts')

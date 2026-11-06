"""Trims of the Freesound CC0 recordings (moments picked with earshot find) -> cuts/*.wav, mono 48 kHz, short fades."""
import numpy as np, soundfile as sf, subprocess, io
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'hammer1': ('hammer_540139', 0.27, 0.75, 0, .003, .15), 'hammer2': ('hammer_540139', 2.13, 2.60, 0, .003, .15),
 'hammer3': ('hammer_540139', 0.97, 1.45, 0, .003, .15),
 'school_bell': ('school_bell_423003', 1.5, 5.6, 0, .01, .8), 'chalk1': ('chalk_231453', 1.5, 3.6, 0, .02, .2),
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1),
 'step3': ('footsteps_271039', 5.03, 5.41, 0, .003, .1),
 'heart1': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1), 'heart2': ('heartbeat_390425', 2.54, 3.20, 0, .003, .1),
 'wind': ('wind_gust_536776', 0.0, 3.3, 0, .3, .8), 'paper': ('paper_272015', 0.04, 1.9, 0, .01, .2),
 'zip': ('suitcase_494042', 1.0, 3.0, 0, .02, .2), 'scratch': ('scratch_574311', 0.5, 2.0, 0, .02, .2),
 'cheer': ('cheer_soft_333405', 0.0, 4.5, 0, .3, 1.2), 'church': ('church_bell_753412', 5.05, 8.5, 0, .005, 1.0),
 'car': ('car_engine_176215', 3.5, 9.5, 0, .8, 1.2), 'bedcreak': ('bed_creak_655947', 0.0, 1.85, 0, .005, .2),
 'breath': ('wind_gust_536776', 0.0, 3.3, -6, .4, 1.0), 'breathB': ('breath_826716', 0.0, 2.5, -9, .2, .6), 'rumble': ('drone_612796', 20.0, 25.0, -5, .25, 1.5),
 'tick': ('clock_tick_759501', 0.9, 4.5, 0, .005, .3), 'alarmtick': ('clock_tick_621015', 0.0, 3.0, 0, .005, .3),
 'rattle': ('shingles_164638', 0.3, 2.1, -3, .003, .2), 'nail': ('creak_506659', 0.0, 1.5, 3, .003, .1),
}
def load(p, st):
    af = [] if not st else ['-af', f'asetrate={int(SR * 2 ** (st / 12))},aresample={SR}']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p] + af + ['-ac', '1', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float64')[0]
for name, (src, a, b, st, fi, fo) in C.items():
    r = 2 ** (st / 12); x = load(f'fs/{src}.mp3', st)[int(a / r * SR):int(b / r * SR)].copy()
    x[:int(fi * SR)] *= np.linspace(0, 1, int(fi * SR)); n = int(fo * SR); x[-n:] *= np.linspace(1, 0, n)
    sf.write(f'cuts/{name}.wav', (x / (np.abs(x).max() + 1e-9) * 0.89).astype(np.float32), SR)
# shingles rattle: a burst of real wood pats (fs 137086/137084/406283) at random 40-110 ms spacing and pitch
rng = np.random.default_rng(5); pats = [load(f'fs/{p}.mp3', 0) for p in ('desk_slam_137086', 'desk_slam_137084', 'shingles_406283')]
out = np.zeros(int(1.6 * SR)); t = 0.0
while t < 1.3:
    p = pats[rng.integers(3)]; r = 2 ** (rng.uniform(1, 6) / 12); p = np.interp(np.arange(int(len(p) / r)) * r, np.arange(len(p)), p)[:int(0.25 * SR)]
    i = int(t * SR); n = min(len(p), len(out) - i); out[i:i + n] += p[:n] * rng.uniform(0.3, 1) * (1 - t / 1.6); t += rng.uniform(0.04, 0.11)
sf.write('cuts/rattle.wav', (out / np.abs(out).max() * 0.89).astype(np.float32), SR)
print(len(C), 'cuts')

"""Trims of the Freesound CC0 recordings (moments picked with earshot find) -> cuts/*.wav, mono 48 kHz, short fades."""
import numpy as np, soundfile as sf, subprocess, io
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1), 'step3': ('footsteps_271039', 5.03, 5.41, 0, .003, .1),
 'gasp': ('gasp_608216', 0.0, 1.1, 3, .005, .25), 'heart': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1),
 'wheels1': ('cart_wheels_443055', 1.0, 3.4, 0, .05, .4), 'wheels2': ('cart_wheels_423703', 0.3, 2.4, -2, .05, .4),
 'sizzle': ('sizzle_534483', 2.0, 4.8, 0, .3, .6), 'fogwind': ('fog_wind_734663', 1.0, 4.5, 0, .6, 1.0), 'wind': ('fog_wind_844818', 5.0, 8.5, -2, .6, 1.0),
 'murmur1': ('crowd_murmur_867051', 3.0, 5.6, 0, .3, .5), 'murmur2': ('crowd_murmur_466767', 0.5, 3.0, 0, .3, .5), 'crowdgasp': ('crowd_gasp_763875', 0.0, 2.4, 0, .01, .5),
 'bell': ('church_bell_802078', 0.0, 4.5, 0, .02, 1.2), 'pans': ('pan_clank_209002', 0.0, 1.8, 0, .005, .3), 'rumble': ('thunder_far_712914', 0.0, 3.6, -3, .3, 1.0),
 'handwhoosh': ('deep_whoosh_558827', 0.0, 3.2, -2, .01, .5), 'boxthud': ('wood_box_tone_795630', 0.0, 1.6, -3, .002, .5),
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
print(len(C), 'cuts')

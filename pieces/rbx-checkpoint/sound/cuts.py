"""Trims of the Freesound CC0 recordings -> cuts/*.wav, mono 48 kHz, short fades (rbx-checkpoint)."""
import numpy as np, soundfile as sf, subprocess, io, glob
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'poof1': ('poof_714257', 0.0, 0.6, 0, .002, .15), 'poof2': ('poof_714257', 0.0, 0.6, -2, .002, .15), 'poof3': ('poof_803291', 0.0, 0.7, 0, .002, .2), 'poof4': ('poof_817695', 0.0, 0.8, -1, .002, .2),
 'spawn1': ('magic_pop_478179', 0.0, 1.6, 0, .005, .4), 'spawn2': ('magic_pop_422730', 0.0, 1.5, 2, .005, .4), 'boing': ('magic_pop_543641', 0.0, 0.9, 0, .002, .2),
 'trip1': ('trip_504626', 0.0, 1.4, 0, .002, .3), 'trip2': ('bodyfall_614064', 0.0, 1.2, 0, .002, .3), 'trip3': ('bodyfall_673424', 0.0, 1.8, 0, .002, .3),
 'stairs': ('stairs_fall_194911', 0.0, 3.2, 0, .005, .4), 'flap': ('flag_flap_701647', 2.0, 5.0, 0, .3, .5), 'whistle': ('ref_whistle_538422', 0.0, 0.6, 0, .002, .1),
 'bark1': ('dog_bark_800278', 0.0, 0.45, 0, .002, .08), 'bark2': ('dog_bark_630648', 0.0, 1.0, 2, .002, .15), 'pant': ('dog_pant_498702', 0.5, 3.0, 0, .1, .3), 'whine': ('dog_whine_350593', 0.0, 1.1, 0, .005, .2),
 'earflap': ('ear_flap_443042', 0.0, 1.0, 0, .002, .15), 'chew': ('chew_427112', 0.0, 2.5, 0, .02, .3),
 'rumble': ('ground_crack_615309', 1.0, 5.0, -3, .3, .8), 'collapse': ('landslide_811070', 0.0, 3.7, -2, .02, .8), 'debris1': ('debris_105282', 0.0, 2.6, -2, .002, .5), 'debris2': ('collapse_758582', 0.0, 1.1, -1, .002, .3),
 'crack': ('debris_105278', 0.0, 1.6, -4, .002, .4), 'rockbreak': ('rock_break_52145', 0.0, 1.2, -2, .002, .3), 'gravel': ('rock_slide_504381', 0.0, 1.5, -1, .005, .2),
 'scream': ('yell_713121', 0.0, 2.4, 0, .01, .4), 'kidyell': ('yell_315828', 0.0, 1.9, 0, .01, .3), 'gasp': ('crowd_gasp_763875', 0.0, 2.4, 0, .01, .5), 'ooh': ('crowd_ooh_870650', 0.0, 2.6, 0, .02, .5),
 'cheer': ('crowd_cheer_267246', 0.0, 5.0, 0, .05, 1.2), 'cheer2': ('crowd_shout_848423', 0.0, 5.0, 0, .05, 1.2), 'murmur': ('crowd_murmur_867051', 3.0, 5.6, 0, .3, .5),
 'ladder': ('ladder_372877', 0.0, 1.7, -1, .002, .3), 'lasso': ('rope_throw_719638', 0.0, 1.6, 0, .02, .3), 'rope': ('rope_pull_802697', 0.0, 1.4, -2, .005, .3), 'grab': ('rope_pull_429215', 0.0, 0.7, -2, .003, .15),
 'tuba': ('tuba_374271', 0.0, 2.2, 0, .02, .4), 'tubalow': ('tuba_374241', 0.0, 0.7, 0, .005, .15), 'drums': ('marching_band_340938', 0.0, 4.2, 0, .05, .6),
 'splash': ('splash_398039', 0.0, 1.9, 0, .002, .4), 'dig': ('stick_dirt_540264', 0.0, 1.1, 0, .002, .2), 'snore': ('snore_491961', 0.0, 3.0, 0, .05, .4),
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1), 'blanket': ('blanket_493462', 0.0, 1.2, 0, .005, .2),
 'chalk': ('chalk_233049', 0.0, 2.0, 0, .02, .3), 'kidscheer': ('kids_cheer_859076', 0.0, 3.2, 0, .02, .6), 'giggle': ('giggle_616088', 0.0, 1.5, 3, .01, .3),
 'fall': ('fall_wind_842982', 0.5, 3.0, 0, .2, .5), 'swanee': ('slide_whistle_497093', 0.0, 1.2, 0, .005, .2), 'heart': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1),
 'shimmer': ('magic_shimmer_844398', 0.0, 2.5, 0, .02, .6), 'sniff': ('sniff_0', 0.0, 1.0, 0, .01, .2), 'land': ('rooftop_land_502553', 0.0, 1.5, 0, .002, .3),
}
def load(p, st):
    g = sorted(glob.glob(f'fs/{p}*.mp3')) or sorted(glob.glob(f"fs/{p.split('_')[0]}_*.mp3")); p = g[0]
    af = [] if not st else ['-af', f'asetrate={int(SR * 2 ** (st / 12))},aresample={SR}']
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p] + af + ['-ac', '1', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
    return sf.read(io.BytesIO(raw), dtype='float64')[0]
for name, (src, a, b, st, fi, fo) in C.items():
    r = 2 ** (st / 12); x = load(src, st)[int(a / r * SR):int(b / r * SR)].copy()
    x[:int(fi * SR)] *= np.linspace(0, 1, int(fi * SR)); n = min(len(x) - 1, int(fo * SR)); x[-n:] *= np.linspace(1, 0, n)
    sf.write(f'cuts/{name}.wav', (x / (np.abs(x).max() + 1e-9) * 0.89).astype(np.float32), SR)
print(len(C), 'cuts')

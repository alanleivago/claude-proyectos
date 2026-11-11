"""Trims of the Freesound CC0 recordings -> cuts/*.wav, mono 48 kHz, short fades (rbx-library)."""
import numpy as np, soundfile as sf, subprocess, io, glob
SR = 48000
C = {  # name: (src, start, end, semitones, fade_in, fade_out)
 'thunkA': ('stamp_thunk_336491', 0.0, 1.3, -5, .001, .5), 'thunkB': ('wood_thud_616295', 0.0, 1.3, -4, .001, .5), 'thunkC': ('rubber_stamp_470710', 0.0, 0.8, -3, .001, .25), 'thunkD': ('stamp_thunk_336489', 0.0, 0.7, -6, .001, .3),
 'stamp1': ('rubber_stamp_470710', 0.0, 0.8, 0, .001, .2), 'stamp2': ('rubber_stamp_683031', 0.0, 0.7, 0, .001, .2), 'stampsoft': ('rubber_stamp_470710', 0.0, 0.8, 3, .001, .2),
 'clunk1': ('thud_soft_686282', 0.0, 0.6, -2, .001, .2), 'clunk2': ('chute_rattle_164638', 0.0, 1.0, -3, .002, .3), 'thudbook': ('stamp_thunk_836521', 0.0, 1.2, 0, .001, .3),
 'pages': ('pages_burst_695924', 0.0, 0.5, 0, .001, .1), 'paper': ('paper_642770', 0.0, 1.4, 0, .02, .3), 'pageturn': ('page_turn_484940', 0.0, 1.2, 0, .005, .2), 'pageturn2': ('page_turn_457916', 0.0, 1.6, 0, .005, .3),
 'splat': ('splat_433829', 0.0, 1.0, -2, .001, .3), 'poof1': ('poof_714257', 0.0, 0.5, 0, .002, .15), 'poof2': ('poof_817695', 0.0, 0.8, -1, .002, .2), 'spawn': ('magic_pop_478179', 0.0, 1.6, 0, .005, .4),
 'whisper1': ('whisper_234044', 0.0, 4.0, 0, .2, .6), 'whisper2': ('whisper_489897', 0.5, 4.0, 0, .2, .6), 'creak1': ('creak_506664', 0.0, 1.1, -2, .005, .3), 'creak2': ('creak_646692', 0.0, 1.2, -1, .005, .3),
 'shelfcreak': ('wood_creak_547466', 0.0, 3.0, -4, .05, .6), 'drag': ('cloth_stretch_493210', 0.0, 2.4, -6, .05, .5), 'chain': ('chute_rattle_273901', 0.0, 0.4, 5, .002, .1),
 'skitter': ('tiptoe_392482', 0.0, 1.4, 8, .002, .2), 'tiptoe': ('tiptoe_392482', 0.0, 2.6, -2, .005, .3), 'sticker': ('drawer_607123', 0.0, 1.0, 3, .002, .2), 'zip': ('zip_494799', 0.0, 0.6, 2, .002, .1),
 'tick': ('clock_tick_759501', 0.0, 2.0, 0, .005, .2), 'stopwatch': ('stopwatch_275802', 0.0, 3.0, 0, .01, .3), 'bell': ('desk_bell_685111', 0.0, 2.0, 0, .001, .5), 'midnight': ('school_bell_549897', 0.0, 2.1, -7, .002, .6),
 'alarm': ('fire_alarm_678345', 0.0, 3.0, 0, .01, .4), 'horn': ('fire_horn_465700', 0.0, 3.0, 0, .02, .5), 'medal': ('magic_shimmer_844398', 0.0, 2.0, 2, .01, .5),
 'chute': ('metal_slide_448413', 0.0, 2.4, -3, .01, .4), 'metalslide': ('metal_slide_448403', 0.0, 1.8, 0, .01, .3), 'land': ('soft_land_614064', 0.0, 1.3, 0, .002, .3), 'dust': ('paper_642770', 0.0, 1.0, -6, .05, .3),
 'heart': ('heartbeat_390425', 10.15, 10.80, 0, .003, .1), 'gasp': ('gasp_608216', 0.0, 1.1, 0, .005, .2), 'scream': ('yell_713121', 0.0, 2.4, 0, .01, .4), 'kidyell': ('yell_315828', 0.0, 1.9, 0, .01, .3),
 'giggle1': ('kids_giggle_754382', 0.0, 2.3, 0, .01, .3), 'giggle2': ('giggle_616088', 0.0, 2.0, 2, .01, .3), 'giggle3': ('kids_giggle_616088', 0.0, 2.0, 0, .01, .3), 'kidscheer': ('kids_cheer_859076', 0.0, 3.2, 0, .02, .6),
 'murmur': ('crowd_murmur_867051', 3.0, 6.0, 0, .3, .5), 'blanket': ('blanket_493462', 0.0, 1.2, 0, .005, .2), 'snore': ('snore_491961', 0.0, 3.0, 0, .05, .4), 'sniff': ('sniff_346681', 0.0, 1.2, 0, .01, .2),
 'step1': ('footsteps_271039', 3.46, 3.96, 0, .003, .1), 'step2': ('footsteps_271039', 4.28, 4.65, 0, .003, .1), 'run': ('footsteps_412457', 1.0, 2.2, 2, .01, .2), 'ladder': ('ladder_372877', 0.0, 1.7, -1, .002, .3),
 'cloth': ('blanket_493457', 0.0, 1.0, 0, .005, .2), 'bubble': ('pot_simmer_556764', 2.0, 4.5, 0, .1, .4), 'creepwhoosh': ('creepy_whoosh_850767', 0.0, 2.0, 0, .01, .4), 'stinger': ('creepy_whoosh_850424', 0.0, 3.0, -2, .01, .6),
 'shimmer': ('magic_shimmer_844398', 0.0, 2.5, 0, .02, .6), 'shimdark': ('magic_shimmer_521886', 0.0, 2.5, -7, .05, .6), 'boing': ('magic_pop_543641', 0.0, 0.9, 0, .002, .2), 'pant': ('breath_826716', 0.0, 1.8, 2, .02, .3),
 'yawn': ('gasp_615047', 0.0, 2.0, -2, .02, .4), 'bookclose': ('thudbook', 0, 0, 0, 0, 0), 'freeze': ('magic_shimmer_521886', 0.0, 1.5, -12, .002, .5), 'card': ('page_turn_484933', 0.0, 0.8, 3, .002, .1),
}
C['bookclose'] = ('stamp_thunk_836521', 0.0, 0.9, 3, .001, .2)
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

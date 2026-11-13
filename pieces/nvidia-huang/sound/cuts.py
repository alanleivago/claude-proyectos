"""Trims of the Freesound / Commons recordings chosen with earshot (rank -> find -> describe / realness) -> fs/cut/*.wav.
Each trim: (name, source, start, end); 4 ms fade-in, 30 ms fade-out, 48 kHz stereo. Onsets of the multi-take files
(keys, carpet steps, phone pulses, mop strokes) measured with librosa onset_detect, checked with earshot find."""
import subprocess, os
os.makedirs('fs/cut', exist_ok=True)
C = [
    # footsteps: janitor on the stage boards (trash-library's boots on wood), traders on carpet
    *[(f'step_w{i}', 'fs/woodsteps_798871.mp3', a, b) for i, (a, b) in enumerate([(0.17, 0.56), (0.84, 1.26), (2.33, 2.76), (1.6, 1.98)])],
    *[(f'step_c{i}', 'fs/carpet_371311.mp3', a - 0.02, a + 0.26) for i, a in enumerate([0.96, 1.845, 2.208, 2.539, 6.315, 6.933])],
    # one keyboard for the whole email (Keyboard sound, 443971): single strokes
    *[(f'key{i}', 'fs/typing_443971.mp3', a - 0.005, a + 0.11) for i, a in enumerate([0.512, 0.661, 0.811, 2.144, 2.389, 3.968, 4.8, 6.336, 7.253, 7.403, 7.584, 8.587, 8.757, 8.928, 10.229, 11.744])],
    # phones buzzing on desks: one pulse each (3 phones)
    ('buzz0', 'fs/vibrate_384485.mp3', 0.0, 0.38), ('buzz1', 'fs/vibrate_384486.mp3', 1.0, 1.38), ('buzz2', 'fs/vibrate_384485.mp3', 2.0, 2.38),
    ('buzz3', 'fs/vibrate_384486.mp3', 0.0, 0.38), ('buzz4', 'fs/vibrate_734974.mp3', 0.17, 0.55),
    # mop strokes on the stage floor
    *[(f'mop{i}', 'fs/mop2_515158.mp3', a, b) for i, (a, b) in enumerate([(13.36, 14.0), (14.70, 15.3), (7.97, 8.6), (8.62, 9.3), (9.38, 10.0)])],
    # stage
    ('hydraulic', 'fs/lifter_156360.mp3', 3.13, 5.22), ('magic', 'fs/chime_683323.mp3', 0.0, 1.7), ('cheer', 'fs/cheer_777709.mp3', 0.0, 4.5),
    ('cheer2', 'fs/cheer_267246.mp3', 1.1, 4.4), ('clap', 'fs/clap_432328.mp3', 1.0, 2.6), ('ooh', 'fs/ooh_870650.mp3', 0.05, 1.6),
    ('flyby', 'fs/bigwhoosh_434874.mp3', 0.0, 0.62), ('beep', 'fs/beep_662314.mp3', 0.03, 0.26), ('pinbeep', 'fs/blip_759010.mp3', 0.0, 0.5),
    ('unfold', 'fs/unfold_711853.mp3', 0.38, 1.95), ('tear', 'fs/tear_676626.mp3', 0.03, 0.81), ('switch', 'fs/switch_217498.mp3', 0.02, 0.4),
    ('crt_on', 'fs/crt_576959.mp3', 0.25, 0.9), ('static', 'fs/static_721496.mp3', 0.0, 0.45), ('static_s', 'fs/static_721496.mp3', 0.5, 0.68),
    ('crt_off', 'fs/crt_751516.mp3', 0.0, 2.0), ('leather', 'fs/leather_108533.mp3', 3.0, 4.0), ('leather2', 'fs/leather_108533.mp3', 0.6, 1.4),
    ('hanger', 'fs/hanger_560345.mp3', 1.14, 1.42), ('bucket', 'fs/bucket_513800.mp3', 0.95, 1.38), ('trombone', 'fs/trombone_362204.mp3', 0.03, 1.15),
    # newsroom
    ('stamp', 'fs/stamp_470710.mp3', 0.48, 0.9), ('splat', 'fs/splat_406071.mp3', 0.0, 0.5), ('pin', 'fs/pin_446634.mp3', 0.18, 0.5),
    ('flick', 'fs/flick_661726.mp3', 0.0, 1.4), ('cashrain', 'fs/banknotes_178097.mp3', 0.4, 1.6), ('slide', 'fs/slide2_515002.mp3', 0.15, 0.75),
    ('flap0', 'fs/flap4_555058.mp3', 0.26, 0.42), ('flap1', 'fs/flap4_555058.mp3', 0.0, 0.26), ('flap2', 'fs/flap2_84322.mp3', 0.40, 0.58), ('flap3', 'fs/flap2_84322.mp3', 0.58, 0.8),
    ('marker_write', 'fs/marker_335955.mp3', 0.6, 1.35),
    # HQ
    ('swivel', 'fs/chair_678453.mp3', 0.05, 0.75), ('creak', 'fs/swivel_175410.mp3', 0.0, 1.2), ('blinds', 'fs/blinds_450040.mp3', 0.45, 1.35),
    # boardroom
    ('folder', 'fs/folder_198960.mp3', 0.0, 0.13), ('glasses', 'fs/glasses_135039.mp3', 0.0, 1.0),
    # trading floor
    ('crowdgasp', 'fs/crowdgasp_763875.mp3', 0.0, 1.1), ('mug', 'fs/mugdrop_103446.mp3', 0.38, 0.92), ('splash', 'fs/splash_398039.mp3', 0.09, 1.0),
    ('ski', 'fs/ski_379331.mp3', 3.9, 5.2), ('wind', 'fs/wind_346237.mp3', 0.0, 2.2), ('shatter', 'fs/shatter_778605.mp3', 0.0, 1.11),
    ('cardboard', 'fs/cardboard_121188.mp3', 0.0, 0.3), ('cartin', 'fs/cart_71511.mp3', 0.0, 1.26),
    ('dooropen', 'fs/dooropen_588509.mp3', 0.0, 1.9),
    # rev 4: the meme explosion composited over the end (62.45-64.2): the clip's OWN audio, source 0.25-2.0 (boom 0.30), 0.25 s fade out
    ('explosion', '../../../refs-ext/meme-explosion/explosion.mp4', 0.25, 2.0),
    ('cloth0', 'fs/cloth_493462.mp3', 0.0, 1.2), ('cloth1', 'fs/cloth_493457.mp3', 0.0, 1.0), ('cart', 'fs/cart_764617.mp3', 2.0, 12.6),
]
FO = {'explosion': 0.25}   # fade-out lengths other than 30 ms
for name, src, a, b in C:
    a = max(0.0, a); d = b - a
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{d:.3f}', '-i', src, '-ac', '2', '-ar', '48000',
                    '-af', f'afade=t=in:d=0.004,afade=t=out:st={max(0, d - FO.get(name, 0.03)):.3f}:d={FO.get(name, 0.03)}', f'fs/cut/{name}.wav'], check=True)
print(len(C), 'cuts')

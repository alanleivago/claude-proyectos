"""Trims of the Freesound / Commons recordings chosen with earshot (rank -> find -> describe / realness) -> fs/cut/*.wav.
Each trim: (name, source, start, end); 4 ms fade-in, 30 ms fade-out, 48 kHz stereo."""
import subprocess, os
os.makedirs('fs/cut', exist_ok=True)
C = [
    # footsteps: concrete (WalkC.ogg strokes), boots on wood, running strides (also the depot's hard floor)
    *[(f'step_s{i}', 'fs/stepstreet_536739.mp3', a, a + 0.32) for i, a in enumerate([0.05, 0.65, 1.23, 1.78])],
    *[(f'step_w{i}', 'fs/woodsteps_798871.mp3', a, b) for i, (a, b) in enumerate([(0.17, 0.56), (0.84, 1.26), (2.33, 2.76), (1.6, 1.98)])],
    *[(f'step_r{i}', 'fs/run_257697.mp3', a - 0.02, a + 0.26) for i, a in enumerate([0.299, 0.67, 1.041, 1.419, 2.129, 2.469])],
    ('chomp', 'fs/idle_126341.mp3', 24.65, 25.95), ('crush', 'fs/crush_762417.mp3', 0.0, 1.05),
    ('slam', 'fs/slam2_811949.mp3', 0.25, 1.35), ('doorbang', 'fs/slam_462663.mp3', 1.2, 2.4),
    ('hydraulic', 'fs/lifter_156360.mp3', 3.13, 5.22), ('hydraulic_s', 'fs/lifter_156360.mp3', 3.13, 4.0),
    ('sob', 'fs/sob_643669.mp3', 2.3, 4.95), ('marker_strike', 'fs/marker_335955.mp3', 0.12, 0.55), ('marker_write', 'fs/marker_335955.mp3', 0.6, 1.35),
    ('magic', 'fs/chime_683323.mp3', 0.0, 1.7), ('sting', 'fs/harp_541546.mp3', 1.1, 3.25), ('beep', 'fs/commons/backup_beeper.ogg', 0.0, 1.0),
    ('drive', 'fs/drive_134898.mp3', 2.15, 4.05), ('bookdrop0', 'fs/bookdrop_484900.mp3', 0.5, 1.22), ('bookdrop1', 'fs/bookdrop_484904.mp3', 0.58, 1.3),
    *[(f'handle{i}', 'fs/bookpick_202534.mp3', a - 0.03, a + 0.35) for i, a in enumerate([0.159, 0.619, 2.248, 4.354])],
    ('flap0', 'fs/flap4_555058.mp3', 0.26, 0.42), ('flap1', 'fs/flap4_555058.mp3', 0.0, 0.26), ('flap2', 'fs/flap2_84322.mp3', 0.40, 0.58), ('flap3', 'fs/flap2_84322.mp3', 0.58, 0.8),
    ('chain', 'fs/chain_593458.mp3', 0.25, 1.2), ('urn', 'fs/urn_556764.mp3', 1.29, 9.06), ('fire', 'fs/fire_bed_679405.mp3', 2.0, 8.0),
    ('ooh', 'fs/ooh_870650.mp3', 0.05, 1.6), ('kidlaugh', 'fs/kidlaugh_616088.mp3', 0.0, 1.6), ('kidlaugh2', 'fs/kidlaugh_365632.mp3', 2.0, 3.4),
    ('laugh', 'fs/laugh_800973.mp3', 0.0, 1.2), ('arrive', 'fs/arrive_504865.mp3', 0.0, 2.2), ('lidopen', 'fs/lidopen_422975.mp3', 0.3, 1.85),
    ('tissue', 'fs/tissue_705340.mp3', 0.0, 0.9), ('rustle', 'fs/rustle_151887.mp3', 0.5, 1.5), ('rustle2', 'fs/rustle_151887.mp3', 2.5, 3.5),
    ('bagsnatch', 'fs/bagopen_689666.mp3', 0.0, 0.6), ('bagsnatch2', 'fs/bagopen_689665.mp3', 0.0, 0.6),
    ('bagthud', 'fs/bagthud_81120.mp3', 2.45, 3.55), ('bagthud2', 'fs/bagthud_763454.mp3', 0.0, 1.4),
    ('slide', 'fs/slide2_515002.mp3', 0.15, 0.75), ('creak', 'fs/signcreak2_390123.mp3', 0.0, 2.6), ('sign_squeak', 'fs/signcreak2_700702.mp3', 0.0, 2.1),
    ('dooropen', 'fs/dooropen_588509.mp3', 0.0, 1.9), ('cabdoor', 'fs/cabdoor_361823.mp3', 0.0, 1.2), ('bars', 'fs/bars_191095.mp3', 2.0, 2.8), ('cloth0', 'fs/cloth_493462.mp3', 0.0, 1.2), ('cloth1', 'fs/cloth_493457.mp3', 0.0, 1.0),
]
for name, src, a, b in C:
    d = b - a
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-t', f'{d:.3f}', '-i', src, '-ac', '2', '-ar', '48000',
                    '-af', f'afade=t=in:d=0.004,afade=t=out:st={max(0, d - 0.03):.3f}:d=0.03', f'fs/cut/{name}.wav'], check=True)
print(len(C), 'cuts')

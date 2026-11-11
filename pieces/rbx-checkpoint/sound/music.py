"""music_bed.wav = the standing roblox BGM (styles/roblox/bgm/bgm.wav, TEMPOREX 'Numbers', perfect intro loop) from 0 s,
cut to the video length with a 1.5 s fade-out. Level is set in remix.py (9 LU under the voice)."""
import numpy as np, soundfile as sf, subprocess, io
SR = 48000; DUR = 107.800000; N = int(DUR * SR)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', '../../../styles/roblox/bgm/bgm.wav', '-ac', '2', '-ar', str(SR), '-f', 'wav', '-'], capture_output=True, check=True).stdout
x = sf.read(io.BytesIO(raw), dtype='float64')[0]; x = np.resize(x, (max(N, len(x)), 2))[:N] if len(x) < N else x[:N]
fo = int(1.5 * SR); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
sf.write('music_bed.wav', (x * 0.5 / np.abs(x).max()).astype(np.float32), SR); print('music_bed', x.shape)

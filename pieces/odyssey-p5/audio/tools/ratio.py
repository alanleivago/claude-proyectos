# voice over the bed during speech, on the stems: LUFS of voice/voice.wav minus LUFS of the bed (music + SFX premix),
# both measured only inside the spoken lines (voice.json t0..t1).  usage: ratio.py PIECE_DIR [BED.wav]
import sys, os, json, subprocess, io
import numpy as np, soundfile as sf, pyloudnorm as pyln
P = sys.argv[1]; bedf = sys.argv[2] if len(sys.argv) > 2 else os.path.join(P, 'audio', 'track_mix_greek.wav')
def rd(f):
    x, sr = sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ar', '48000', '-ac', '2', '-f', 'wav', '-'], capture_output=True, check=True).stdout), dtype='float32'); return x
v, b = rd(os.path.join(P, 'voice', 'voice.wav')), rd(bedf); n = min(len(v), len(b))
m = np.zeros(n, bool)
for L in json.load(open(os.path.join(P, 'voice.json')))['lines']: m[int(L['t0'] * 48000):int(L['t1'] * 48000)] = True
M = pyln.Meter(48000); lv, lb = M.integrated_loudness(v[:n][m]), M.integrated_loudness(b[:n][m])
print(f'voice {lv:.1f} LUFS, bed {lb:.1f} LUFS in speech -> voice over bed {lv - lb:.1f} dB')

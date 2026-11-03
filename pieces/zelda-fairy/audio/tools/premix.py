# premix the music bed and the SFX into audio/track_mix_greek.wav (32-bit float): music + gm dB, SFX + gs dB
# usage: premix.py [gm] [gs]   (p4 used -2.7 / +7.3)
import sys, os, numpy as np, soundfile as sf
A = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
gm, gs = (float(sys.argv[1]), float(sys.argv[2])) if len(sys.argv) > 2 else (-2.7, 7.3)
m, sr = sf.read(os.path.join(A, 'track.wav'), dtype='float32'); s, sr2 = sf.read(os.path.join(A, 'sfx_pro.wav'), dtype='float32'); assert sr == sr2 == 48000
n = max(len(m), len(s)); m = np.pad(m, ((0, n - len(m)), (0, 0))); s = np.pad(s, ((0, n - len(s)), (0, 0)))
o = m * 10 ** (gm / 20) + s * 10 ** (gs / 20)
sf.write(os.path.join(A, 'track_mix.wav'), o, sr, subtype='FLOAT'); print('music', gm, 'sfx', gs, 'peak', round(float(np.abs(o).max()), 2))

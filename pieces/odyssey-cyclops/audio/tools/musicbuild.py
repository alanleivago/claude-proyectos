# Build a 292 s music bed like audio/track.wav: loop (if shorter) at a beat-matched point with an equal-power
# crossfade, then loudnorm -14 LUFS, gain 0.25 dip 162.9-168.4 s (0.5 s ramps), fade out from 287 s.
# usage: musicbuild.py SRC OUT.wav [--search-end A B] [--search-start A B]
import sys, subprocess, io, argparse
import numpy as np, soundfile as sf, librosa

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--dur', type=float, default=292.0)
ap.add_argument('--xf', type=float, default=1.5)
ap.add_argument('--emin', type=float, default=0.6)   # loop end searched after this fraction of the piece
a = ap.parse_args()
SR = 48000
x, _ = sf.read(io.BytesIO(subprocess.run(['ffmpeg', '-v', 'error', '-i', a.src, '-ar', str(SR), '-ac', '2', '-f', 'wav', '-'],
                                          capture_output=True, check=True).stdout), dtype='float32')
L = len(x) / SR
if L < a.dur + 1:
    mono = librosa.resample(x.mean(1), orig_sr=SR, target_sr=22050)
    _, beats = librosa.beat.beat_track(y=mono, sr=22050, units='time')
    feat = np.vstack([librosa.feature.chroma_cqt(y=mono, sr=22050), librosa.feature.mfcc(y=mono, sr=22050, n_mfcc=13) / 50])
    fps = 22050 / 512
    rms = librosa.feature.rms(y=mono)[0]
    def ctx(t, w=3.0):            # feature summary of the w seconds before t
        i1 = int(t * fps); i0 = max(0, i1 - int(w * fps)); return feat[:, i0:i1].mean(1)
    def lev(t): return rms[int(t * fps): int((t + 1) * fps)].mean()
    loud = np.median(rms)
    Es = [b for b in beats if L * a.emin < b < L - 4 and lev(b) > 0.5 * loud]
    Ss = [b for b in beats if 6 < b < L * 0.55 and lev(b) > 0.5 * loud]
    best = None
    for E in Es:
        ce = ctx(E)
        for S in Ss:
            if E - S < 30: continue
            d = np.linalg.norm(ce - ctx(S))
            if best is None or d < best[0]: best = (d, E, S)
    _, E, S = best
    print(f'loop: play 0-{E:.2f}, jump back to {S:.2f} (segment {E - S:.1f} s), feature distance {best[0]:.3f}')
    k = int(a.xf * SR)
    out = x[:int(E * SR) + k // 2].copy()
    seg = x[int(S * SR) - k // 2: int(E * SR) + k // 2]
    r = np.linspace(0, 1, k)[:, None]
    while len(out) < (a.dur + 2) * SR:
        out[-k:] = out[-k:] * np.sqrt(1 - r) + seg[:k] * np.sqrt(r)
        out = np.concatenate([out, seg[k:]])
    # end on the original ending if it fits after the last jump
    x = out
else:
    print('no loop needed')
tmp = a.out + '.raw.wav'
sf.write(tmp, x[:int((a.dur + 1) * SR)], SR, subtype='FLOAT')
af = (f"atrim=0:{a.dur},asetpts=PTS-STARTPTS,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,"
      "volume='1-0.75*min(1\\,max(0\\,min((t-162.9)/0.5\\,(168.4-t)/0.5)))':eval=frame,afade=t=out:st=287:d=5")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', af, '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', a.out], check=True)
import os; os.remove(tmp)
print('wrote', a.out)

"""Shape the music track to the story, from the voice timing.
   usage: python shape_track.py <piece dir> <question line id> <payoff line id> <goodbye line id> [--src music.mp3 --start 4] [--dip <line id>:<dB>]
Writes <piece>/audio/track-shaped.wav (piece.json "music" points at it): -1.5 dB through the build, out over the
question line, silence until the hit (0.32s before the payoff line), +1.5 dB through the payoff, -2.5 dB from the goodbye.
With --src it first cuts the track from --start seconds (the default track: "Documentary Background Music for Videos" from 4s,
whose own build matches a ~60s story)."""
import json, os, subprocess, sys
import numpy as np, soundfile as sf

args = sys.argv[1:]
def opt(k, d):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return d
src, start = opt('--src', None), float(opt('--start', 4))
dip = opt('--dip', None)                                       # --dip <line id>:<dB>: lower the music from that line to the question (when the build competes with the payoff)
piece, q, pay, bye = args
os.makedirs(os.path.join(piece, 'audio'), exist_ok=True)
track = os.path.join(piece, 'audio', 'track.wav')
if src: subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(start), '-t', '120', '-i', src, '-ar', '48000', '-ac', '2', track], check=True)
V = {l['id']: l for l in json.load(open(os.path.join(piece, 'voice.json')))['lines']}
q1, hit, t7 = V[q]['t1'], V[pay]['t0'] - 0.32, V[bye]['t0'] - 0.3
x, sr = sf.read(track, always_2d=True); t = np.arange(len(x)) / sr
db = np.interp(t, [0, q1 - 0.6, q1 - 0.05, hit - 0.02, hit, t7, t7 + 2.5, t[-1]], [-1.5, -1.5, -60, -60, 1.5, 1.5, -2.5, -2.5])
if dip:
    did, ddb = dip.split(':'); d0 = V[did]['t0'] - 0.4
    db = np.where(t < q1, db + np.interp(t, [d0, d0 + 0.6], [0, float(ddb)]), db)
sf.write(os.path.join(piece, 'audio', 'track-shaped.wav'), (x * 10 ** (db / 20)[:, None]).astype(np.float32), sr, subtype='FLOAT')
print(f'shaped: silence {q1:.2f}-{hit:.2f}s, payoff from {hit:.2f}s, goodbye from {t7:.2f}s')

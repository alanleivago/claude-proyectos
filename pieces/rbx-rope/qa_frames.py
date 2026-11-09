"""Frame-by-frame QA on renders/video_only.mp4: per-frame mean abs difference (96x170 grey), black/flat frames, and spikes
that are NOT at a shot cut (pops / flicker). Writes renders/qa_frames.json + contact tiles of each flagged span."""
import json, subprocess, numpy as np, sys
W, H, FPS = 96, 170, 30
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'renders/video_only.mp4', '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
F = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(F, axis=0)).mean((1, 2)); mean = F.mean((1, 2)); std = F.std((1, 2))
shots = json.load(open('board/shots.json')); cuts = set(int(round(s['t0'] * FPS)) for s in shots)
near_cut = lambda f: any(abs(f - c) <= 1 for c in cuts)
med = np.median(d); flags = []
for i, x in enumerate(d):
    f = i + 1
    if near_cut(f): continue
    loc = np.median(d[max(0, i - 6):i + 7])
    if x > max(6.0, 4.0 * loc): flags.append({'frame': f, 't': round(f / FPS, 3), 'diff': round(float(x), 2), 'local': round(float(loc), 2)})
black = [{'frame': i, 't': round(i / FPS, 3)} for i in range(len(F)) if mean[i] < 8 or std[i] < 2]
rep = {'frames': len(F), 'median_diff': round(float(med), 2), 'pops': flags, 'black_or_flat': black}
json.dump(rep, open('renders/qa_frames.json', 'w'), indent=1); print(json.dumps({k: (v if not isinstance(v, list) else len(v)) for k, v in rep.items()}))
for p in flags[:20]: print('pop', p)

# Whisper on every trimmed line: are the first and last words there? prints the suspects
import json, re, sys, numpy as np, soundfile as sf
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8'); L = dict(json.load(open('lines.json')))
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace("'", '')).split()
num = {'400': 'four', '17': 'seventeen', '7': 'seven', '10': 'ten', '40': 'forty', '100': 'hundred'}
bad = []
for id in (sys.argv[1:] or L):
    a, sr = sf.read(f'{id}.wav'); a = a if a.ndim == 1 else a.mean(1)
    a16 = np.interp(np.arange(0, len(a) / sr, 1 / 16000), np.arange(len(a)) / sr, a).astype(np.float32)
    a16 = np.concatenate([np.zeros(8000, np.float32), a16, np.zeros(8000, np.float32)])
    segs, _ = m.transcribe(a16, language='en', word_timestamps=True); W = [w for s in segs for w in s.words]
    got = [num.get(x, x) for x in norm(' '.join(w.word for w in W))]; want = norm(L[id])
    ok0 = bool(got) and (got[0][:3] == want[0][:3]); ok1 = bool(got) and (got[-1][:3] == want[-1][:3] or got[-1] in want[-1])
    tail = len(a) / sr + 0.5 - W[-1].end if W else 0
    if not (ok0 and ok1) or tail < 0.12: bad.append(id); print(id, ok0, ok1, round(tail, 2), '|', ' '.join(got[:4]), '…', ' '.join(got[-3:]), '||', ' '.join(want[-3:]), flush=True)
print('BAD', ','.join(bad))

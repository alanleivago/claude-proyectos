"""upnext-01 test voice takes (VoiceStudio REST, steps=32, wav, no '!'), one wav per line in voz/, Whisper-checked.
Girl = 'Zombie heroine B (medium)' ef006e80 (original voice design, female young adult); Pip = 'Dutch' 644338f4
(original voice design, male middle-aged, very low pitch). Neither is a clone of a reference account.
usage: python tools/voice_takes.py [seeds=1,2,3]
"""
import difflib
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np
import requests
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

OUT = Path(__file__).resolve().parents[1] / 'voz'
GIRL, PIP = 'ef006e80', '644338f4'
LINES = [
    ('01_ashley', GIRL, "From tomorrow on, I'm waking at four."),
    ('02_pip', PIP, 'Four. Now.'),
    ('03a_ashley', GIRL, 'Is this counting?'),
    ('03b_pip', PIP, 'Nope.'),
    ('04_ashley', GIRL, 'Tomorrow, then.'),
    ('05_ashley', GIRL, 'Some guy jogged six miles before dawn.'),
    ('06_ashley', GIRL, "I guess... I'm just not hungry enough."),
    ('07_pip', PIP, 'Time to cheat.'),
    ('09a_ashley', GIRL, 'Need help, Pip?'),
    ('09b_pip', PIP, 'Nah.'),
    ('10a_pip', PIP, 'Tomorrow... your feet land on this first.'),
    ('10b_pip', PIP, 'And that bunks over there.'),
    ('10c_ashley', GIRL, "That's the trick?"),
    ('10d_pip', PIP, 'Eh. The proper term is nudge.'),
    ('19a_ashley', GIRL, 'Is this counting?'),
    ('19b_pip', PIP, 'Yep. That counts.'),
    ('22_pip', PIP, 'Champions are awake by four.'),
    ('23a_pip', PIP, 'Scratch that.'),
    ('23b_pip', PIP, 'Just beating yesterday is plenty.'),
]
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower()).split()


def load16(fn):
    w = wave.open(str(fn)); sr = w.getframerate(); n = w.getnchannels(); sw = w.getsampwidth()
    a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16 if sw == 2 else np.int32).astype(np.float32) / (32768 if sw == 2 else 2 ** 31)
    if n > 1:
        a = a.reshape(-1, n).mean(1)
    return (resample_poly(a, 16000, sr) if sr != 16000 else a).astype(np.float32), len(a) / sr


def main():
    seeds = [int(s) for s in (sys.argv[1] if len(sys.argv) > 1 else '1,2,3').split(',')]
    OUT.mkdir(exist_ok=True)
    m = WhisperModel('small', device='cpu', compute_type='int8')
    log = []
    for name, prof, text in LINES:
        assert '!' not in text
        best = None
        for s in seeds:
            r = requests.post('http://127.0.0.1:3900/generate', data=dict(text=text, language='en', profile_id=prof, num_step=32, seed=s, effect_preset='raw'), timeout=900)
            r.raise_for_status()
            fn = OUT / f'{name}.wav'; fn.write_bytes(r.content)
            a, dur = load16(fn)
            hyp = ' '.join(x.text.strip() for x in m.transcribe(a, language='en', beam_size=5)[0])
            ratio = difflib.SequenceMatcher(None, ' '.join(norm(text)), ' '.join(norm(hyp))).ratio()
            print(f'{name} seed {s} {dur:.2f}s match {ratio:.3f} | {hyp}', flush=True)
            if best is None or ratio > best[0]:
                best = (ratio, s, hyp, r.content, dur)
            if ratio >= 0.97:
                break
        (OUT / f'{name}.wav').write_bytes(best[3])
        log.append(dict(take=name, profile=prof, text=text, seed=best[1], seconds=round(best[4], 2), whisper=best[2], match=round(best[0], 3)))
    (OUT / 'takes.json').write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding='utf-8')
    print('weak takes:', [x['take'] for x in log if x['match'] < 0.9])


if __name__ == '__main__':
    main()

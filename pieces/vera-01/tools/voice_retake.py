"""vera-01: several takes of one Vera line to choose by ear (earshot) -> voz/retake_<take>/s<seed>_g<guidance>.wav + takes.json
(Whisper text match + question rise in semitones). steps=32, wav, raw, no "!".
usage: python tools/voice_retake.py 27_vera "The usual, Theo?" [seeds=1-8] [guidance=2.0,3.0] [speed=0.95]"""
import json
import sys
from pathlib import Path

import requests
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from voice_final import GIRL, match, rise, whisper   # same checks as the main takes

PIECE = Path(__file__).resolve().parents[1]
take, text = sys.argv[1], sys.argv[2]; assert '!' not in text
a, b = (sys.argv[3] if len(sys.argv) > 3 else '1-8').split('-'); seeds = range(int(a), int(b) + 1)
gs = [float(x) for x in (sys.argv[4] if len(sys.argv) > 4 else '2.0,3.0').split(',')]
speed = float(sys.argv[5]) if len(sys.argv) > 5 else 0.95
out = PIECE / 'voz' / f'retake_{take}'; out.mkdir(parents=True, exist_ok=True)
m = WhisperModel('small', device='cpu', compute_type='int8'); log = []
for g in gs:
    for s in seeds:
        r = requests.post('http://127.0.0.1:3900/generate', data=dict(text=text, language='en', profile_id=GIRL, num_step=32, seed=s, effect_preset='raw', guidance_scale=g, speed=speed), timeout=900)
        r.raise_for_status(); fn = out / f's{s}_g{g:.1f}.wav'; fn.write_bytes(r.content)
        hyp = whisper(m, fn); mt = match(text, hyp); ri = rise(fn)
        log.append(dict(file=fn.name, seed=s, guidance=g, speed=speed, whisper=hyp, match=round(mt, 3), rise_st=round(ri, 1))); print(fn.name, round(mt, 3), f'{ri:+.1f} st', hyp, flush=True)
(out / 'takes.json').write_text(json.dumps(log, indent=1), encoding='utf-8')

"""airy-scp-01: more takes of one line -> voz/retake_<id>/s<seed>_g<guidance>_v<variant>.wav + takes.json (Whisper match vs the
script line, question rise in semitones, junk-syllable trim like voice_final). steps=32, wav, raw, no "!".
TTS text variants (same words, other punctuation) are separated by '|'; default = the line as voice_final speaks it.
--pick=<file> copies that take to voz/raw/<id>.wav and records it in voz/takes.json['retake'];
then run voice_final.py --reuse --only=<id> to clean it.
usage: .venv/bin/python pieces/airy-scp-01/tools/voice_retake.py 22 [seeds=13-20] [guidance=2.0,3.0] [speed=1.0] [variants="Which one?|...Which one?"]
       .venv/bin/python pieces/airy-scp-01/tools/voice_retake.py 22 --pick=s15_g3.0_v1.wav"""
import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from voice_final import LINES, OUT, RAW, gen, match, rise, trim_lead, whisper

take = sys.argv[1]; name, prof, line, text = next(x for x in LINES if x[0] == take)
out = OUT / f'retake_{take}'; out.mkdir(parents=True, exist_ok=True)
pick = next((x.split('=', 1)[1] for x in sys.argv if x.startswith('--pick=')), None)
if pick:
    log = json.loads((out / 'takes.json').read_text()); info = next(x for x in log if x['file'] == pick)
    (RAW / f'{take}.wav').write_bytes((out / pick).read_bytes())
    T = json.loads((OUT / 'takes.json').read_text()); e = next(x for x in T if x['take'] == take)
    e['retake'] = info; e['seed'] = info['seed']; (OUT / 'takes.json').write_text(json.dumps(T, indent=1, ensure_ascii=False), encoding='utf-8')
    print('picked', info); sys.exit()
pos = [x for x in sys.argv[2:] if not x.startswith('--')]
a, b = (pos[0] if pos else '13-20').split('-'); seeds = range(int(a), int(b) + 1)
gs = [float(x) for x in (pos[1] if len(pos) > 1 else '2.0,3.0').split(',')]
speed = float(pos[2]) if len(pos) > 2 else 1.0
variants = pos[3].split('|') if len(pos) > 3 else [text]
q = text.endswith('?'); m = WhisperModel('small', device='cpu', compute_type='int8')
log = json.loads((out / 'takes.json').read_text()) if (out / 'takes.json').exists() else []
for vi, tx in enumerate(variants, 1):
    assert '!' not in tx
    for g in gs:
        for s in seeds:
            fn = out / f's{s}_g{g:.1f}_v{vi}.wav'
            gen(prof, tx, s, speed, fn, guidance=g); cut = trim_lead(m, fn, text)
            hyp = whisper(m, fn); mt = match(text, hyp); ri = rise(fn) if q else 0.0
            log.append(dict(file=fn.name, tts_text=tx, seed=s, guidance=g, speed=speed, trimmed_lead_s=cut, whisper=hyp, match=round(mt, 3), **({'rise_st': round(ri, 1)} if q else {})))
            print(fn.name, round(mt, 3), f'{ri:+.1f} st' if q else '', hyp, flush=True)
            (out / 'takes.json').write_text(json.dumps(log, indent=1), encoding='utf-8')

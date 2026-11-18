"""upnext-01 v2 voices: "Ashley 2 clean" 8218225d (calm, a bit dejected, sighs via OmniVoice's [sigh] tag + "..." pauses) and
"Voz gnomo pip" 1b5d0f16 (deadpan). steps=32, wav, raw, no "!".
  python tools/voice_v2.py gen [seeds]      -> voz2/cand/<take>_s<seed>.wav + voz2/cand/metrics.json (Whisper match, question rise)
  python tools/voice_v2.py final take=seed ...  -> voz2/raw/<take>.wav + clean chain -> voz2/<take>.wav + voz2/takes.json
Clean chain (both voices are clean: no denoise unless the measured gap noise is above -50 dBFS): HPF (her 150 Hz, Pip 90 Hz),
gentle comp 2.5:1, -14 LUFS, limiter -1.5 dBFS."""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import parselmouth
import pyloudnorm as pyln
import requests
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
OUT = PIECE / 'voz2'; CAND = OUT / 'cand'; RAW = OUT / 'raw'
G, P = '8218225d', '1b5d0f16'
HPF = {G: 150, P: 90}
# take, profile, TTS text, plain text for the Whisper check
LINES = [
    ('01_ashley', G, "From tomorrow on... I'm waking at four.", "From tomorrow on, I'm waking at four."),
    ('02_pip', P, 'Four. Now.', 'Four. Now.'),
    ('03a_ashley', G, 'Is this counting?', 'Is this counting?'),
    ('03b_pip', P, 'Nope.', 'Nope.'),
    ('04_ashley', G, '[sigh] Tomorrow, then.', 'Tomorrow, then.'),
    ('05_ashley', G, 'Some guy jogged six miles... before dawn.', 'Some guy jogged six miles before dawn.'),
    ('06_ashley', G, "[sigh] I guess... I'm just not hungry enough.", "I guess I'm just not hungry enough."),
    ('07_pip', P, 'Time to cheat.', 'Time to cheat.'),
    ('09a_ashley', G, 'Need help, Pip?', 'Need help, Pip?'),
    ('09b_pip', P, 'Nah.', 'Nah.'),
    ('10a_pip', P, 'Tomorrow... your feet land on this first.', 'Tomorrow, your feet land on this first.'),
    ('10b_pip', P, 'And that bunks over there.', 'And that bunks over there.'),
    ('10c_ashley', G, "That's the trick?", "That's the trick?"),
    ('10d_pip', P, 'Eh. The proper term is nudge.', 'Eh. The proper term is nudge.'),
    ('19a_ashley', G, 'Is this counting?', 'Is this counting?'),
    ('19b_pip', P, 'Yep. That counts.', 'Yep. That counts.'),
    ('22_pip', P, 'Champions are awake by four.', 'Champions are awake by four.'),
    ('23a_pip', P, 'Scratch that.', 'Scratch that.'),
    ('23b_pip', P, 'Just beating yesterday is plenty.', 'Just beating yesterday is plenty.'),
]
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace('four', '4').replace('for', '4')).split()


def load(fn):
    a, sr = sf.read(str(fn), dtype='float32', always_2d=True); return a.mean(1), sr


def whisper(m, fn, prompt):
    a, sr = load(fn); a16 = resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
    return ' '.join(x.text.strip() for x in m.transcribe(a16, language='en', beam_size=5, initial_prompt='Short line of dialogue.')[0])


def rise(fn):
    p = parselmouth.Sound(str(fn)).to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=600); f = p.selected_array['frequency']; f = f[f > 0]
    if len(f) < 10: return 0.0
    n = len(f); return float(12 * np.log2(np.median(f[int(n * 0.7):]) / np.median(f[int(n * 0.4):int(n * 0.7)])))


def gap_noise(fn):
    a, sr = load(fn); w = int(sr * 0.02); e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2) + 1e-12) for i in range(0, len(a) - w, w)])
    return float(20 * np.log10(np.percentile(e, 8)))


def ff(args): subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True, env={**os.environ}, timeout=120)


def chain(src, dst, prof):
    nf = gap_noise(src); tmp = Path(tempfile.mkdtemp()) / 'c.wav'
    flt = (['afftdn=nr=10:nf=-45'] if nf > -50 else []) + [f'highpass=f={HPF[prof]}:poles=2', 'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=1']
    ff(['-i', str(src), '-af', ','.join(flt), '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', str(tmp)])
    a, sr = load(tmp); M = pyln.Meter(sr); g = 10 ** ((-14.0 - M.integrated_loudness(a)) / 20)
    for _ in range(4):
        ff(['-i', str(tmp), '-af', f'volume={g:.5f},alimiter=limit=0.84:attack=2:release=50:level=0', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', str(dst)])
        b, sr = load(dst); Lb = M.integrated_loudness(b)
        if abs(Lb + 14) <= 0.3: break
        g *= 10 ** ((-14.0 - Lb) / 20)
    return dict(gap_noise_dbfs=round(nf, 1), denoised=bool(nf > -50), lufs=round(float(Lb), 1))


def main():
    mode = sys.argv[1]
    m = WhisperModel('small', device='cpu', compute_type='int8')
    if mode == 'gen':
        seeds = [int(s) for s in (sys.argv[2] if len(sys.argv) > 2 else '1,2,3,4,5').split(',')]
        CAND.mkdir(parents=True, exist_ok=True); met = {}
        for name, prof, tts, plain in LINES:
            assert '!' not in tts
            for s in seeds:
                fn = CAND / f'{name}_s{s}.wav'
                if not fn.exists():
                    r = requests.post('http://127.0.0.1:3900/generate', data=dict(text=tts, language='en', profile_id=prof, num_step=32, seed=s, effect_preset='raw'), timeout=900)
                    r.raise_for_status(); fn.write_bytes(r.content)
                hyp = whisper(m, fn, plain); mt = difflib.SequenceMatcher(None, ' '.join(norm(plain)), ' '.join(norm(hyp))).ratio()
                met[f'{name}_s{s}'] = dict(match=round(mt, 3), rise=round(rise(fn), 1) if plain.endswith('?') else None, dur=round(len(load(fn)[0]) / load(fn)[1], 2), whisper=hyp)
                print(name, s, met[f'{name}_s{s}'], flush=True)
        (CAND / 'metrics.json').write_text(json.dumps(met, indent=1, ensure_ascii=False), encoding='utf-8')
    else:
        pick = dict(a.split('=') for a in sys.argv[2:]); RAW.mkdir(parents=True, exist_ok=True); log = []
        met = json.loads((CAND / 'metrics.json').read_text(encoding='utf-8'))
        for name, prof, tts, plain in LINES:
            s = pick.get(name, '1'); src = CAND / f'{name}_s{s}.wav'; (RAW / f'{name}.wav').write_bytes(src.read_bytes())
            info = chain(RAW / f'{name}.wav', OUT / f'{name}.wav', prof); hyp = whisper(m, OUT / f'{name}.wav', plain)
            log.append(dict(take=name, profile=prof, tts=tts, seed=int(s), whisper_final=hyp, match_final=round(difflib.SequenceMatcher(None, ' '.join(norm(plain)), ' '.join(norm(hyp))).ratio(), 3),
                            rise=(round(rise(OUT / f'{name}.wav'), 1) if plain.endswith('?') else None), **info))
            print(log[-1], flush=True)
        (OUT / 'takes.json').write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding='utf-8')


if __name__ == '__main__':
    main()

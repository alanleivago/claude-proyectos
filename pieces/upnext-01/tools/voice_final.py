"""upnext-01 real voices (the user's VoiceStudio clones): Ashley de01f9d9 for her, "Gnomo personaje apoyo" 67ba355b for the mentor.
Per line: generate seeds (steps=32, wav, raw), Whisper-check, questions must RISE (Praat f0: last voiced 30 % vs the 30 % before,
in semitones), pick the best take -> voz/raw/. Then clean chain -> voz/<take>.wav:
  gentle spectral-gate denoise (noisereduce, stationary, 85 %, noise profile = the quietest 1/6 of the take) on the mentor only:
  his clone carries a -39 dBFS noise floor (earshot), Ashley's is -63 dBFS (left alone); HPF (girl 150 Hz, mentor 90 Hz),
  gentle compressor (2.5:1, -20 dB, 8/150 ms), gain to -14 LUFS, limiter at -1.5 dBFS.
Writes voz/takes.json. usage: python tools/voice_final.py [seeds=1,2,3,4] [--reuse]  (--reuse: keep voz/raw/<take>.wav, only re-run the chain)"""
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import noisereduce as nrd
import numpy as np
import parselmouth
import pyloudnorm as pyln
import requests
import soundfile as sf
from faster_whisper import WhisperModel
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
OUT = PIECE / 'voz'; RAW = OUT / 'raw'
GIRL, MENTOR = 'de01f9d9', '67ba355b'
HPF = {GIRL: 150, MENTOR: 90}
LINES = [
    ('01_ashley', GIRL, "From tomorrow on, I'm waking at four."),
    ('02_pip', MENTOR, 'Four. Now.'),
    ('03a_ashley', GIRL, 'Is this counting?'),
    ('03b_pip', MENTOR, 'Nope.'),
    ('04_ashley', GIRL, 'Tomorrow, then.'),
    ('05_ashley', GIRL, 'Some guy jogged six miles before dawn.'),
    ('06_ashley', GIRL, "I guess... I'm just not hungry enough."),
    ('07_pip', MENTOR, 'Time to cheat.'),
    ('09a_ashley', GIRL, 'Need help, Pip?'),
    ('09b_pip', MENTOR, 'Nah.'),
    ('10a_pip', MENTOR, 'Tomorrow... your feet land on this first.'),
    ('10b_pip', MENTOR, 'And that bunks over there.'),
    ('10c_ashley', GIRL, "That's the trick?"),
    ('10d_pip', MENTOR, 'Eh. The proper term is nudge.'),
    ('19a_ashley', GIRL, 'Is this counting?'),
    ('19b_pip', MENTOR, 'Yep. That counts.'),
    ('22_pip', MENTOR, 'Champions are awake by four.'),
    ('23a_pip', MENTOR, 'Scratch that.'),
    ('23b_pip', MENTOR, 'Just beating yesterday is plenty.'),
]
norm = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace('four', '4').replace('for', '4')).split()   # "Four. Now." = "for now"


def load(fn):
    a, sr = sf.read(str(fn), dtype='float32', always_2d=True); return a.mean(1), sr


def whisper(m, fn):
    a, sr = load(fn); a16 = resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
    return ' '.join(x.text.strip() for x in m.transcribe(a16, language='en', beam_size=5, initial_prompt='Short line of dialogue.')[0])


def match(text, hyp):
    return difflib.SequenceMatcher(None, ' '.join(norm(text)), ' '.join(norm(hyp))).ratio()


def rise(fn):
    """semitone change of f0: last 30 % of the voiced frames vs the 30 % before them (> 0 = rising)"""
    snd = parselmouth.Sound(str(fn)); p = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=600)
    f = p.selected_array['frequency']; f = f[f > 0]
    if len(f) < 10: return 0.0
    n = len(f); a = np.median(f[int(n * 0.4):int(n * 0.7)]); b = np.median(f[int(n * 0.7):])
    return float(12 * np.log2(b / a))


def noise_floor(fn):
    a, sr = load(fn); w = int(sr * 0.02); e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2) + 1e-12) for i in range(0, len(a) - w, w)])
    return float(20 * np.log10(np.percentile(e, 10)))


def ff(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True, env={**os.environ}, timeout=120)


def chain(src, dst, prof):
    nf = noise_floor(src); den = prof == MENTOR
    tmp = Path(tempfile.mkdtemp()) / 'c.wav'; src_ = src
    if den:
        a, sr = load(src); w = int(sr * 0.02); e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(0, len(a) - w, w)])
        q = sorted(np.argsort(e)[:max(5, len(e) // 6)]); noise = np.concatenate([a[i * w:(i + 1) * w] for i in q])
        y = nrd.reduce_noise(y=a, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.85, n_std_thresh_stationary=1.5, n_fft=1024)
        src_ = Path(tempfile.mkdtemp()) / 'd.wav'; sf.write(str(src_), y, sr, subtype='PCM_24')
    flt = [f'highpass=f={HPF[prof]}:poles=2', 'acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=1']
    ff(['-i', str(src_), '-af', ','.join(flt), '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', str(tmp)])
    a, sr = load(tmp); L = pyln.Meter(sr).integrated_loudness(a)
    g = 10 ** ((-14.0 - L) / 20)
    for _ in range(4):   # the limiter eats loudness on peaky takes: re-aim until -14 +/- 0.3 LUFS
        ff(['-i', str(tmp), '-af', f'volume={g:.5f},alimiter=limit=0.84:attack=2:release=50:level=0', '-ar', '48000', '-ac', '1', '-c:a', 'pcm_s24le', str(dst)])
        b, sr = load(dst); Lb = pyln.Meter(sr).integrated_loudness(b)
        if abs(Lb + 14.0) <= 0.3: break
        g *= 10 ** ((-14.0 - Lb) / 20)
    return dict(noise_floor_dbfs=round(float(nf), 1), denoised=bool(den), lufs=round(float(pyln.Meter(sr).integrated_loudness(b)), 1), peak_dbfs=round(float(20 * np.log10(np.abs(b).max())), 1), noise_after=round(float(noise_floor(dst)), 1))


def main():
    pos = [x for x in sys.argv[1:] if not x.startswith('--')]; reuse = '--reuse' in sys.argv
    seeds = [int(s) for s in (pos[0] if pos else '1,2,3,4').split(',')]
    RAW.mkdir(parents=True, exist_ok=True)
    m = WhisperModel('small', device='cpu', compute_type='int8')
    log = []
    for name, prof, text in LINES:
        assert '!' not in text
        q = text.endswith('?'); best = None
        if reuse and (RAW / f'{name}.wav').exists():
            fn = RAW / f'{name}.wav'; hyp = whisper(m, fn); best = (0, -1, hyp, match(text, hyp), rise(fn) if q else 0.0, fn)
        for s in ([] if best else seeds):
            r = requests.post('http://127.0.0.1:3900/generate', data=dict(text=text, language='en', profile_id=prof, num_step=32, seed=s, effect_preset='raw'), timeout=900)
            r.raise_for_status(); fn = RAW / f'{name}_s{s}.wav'; fn.write_bytes(r.content)
            hyp = whisper(m, fn); mt = match(text, hyp); ri = rise(fn) if q else 0.0
            score = mt + (min(ri, 4) / 8 if q else 0)
            print(f'{name} seed {s} match {mt:.3f}' + (f' rise {ri:+.1f} st' if q else '') + f' | {hyp}', flush=True)
            if best is None or score > best[0]: best = (score, s, hyp, mt, ri, fn)
            if mt >= 0.97 and (not q or ri >= 1.5): break
        _, s, hyp, mt, ri, fn = best
        keep = RAW / f'{name}.wav'
        if fn != keep: keep.write_bytes(fn.read_bytes())
        for f in RAW.glob(f'{name}_s*.wav'): f.unlink()
        info = chain(keep, OUT / f'{name}.wav', prof)
        hyp2 = whisper(m, OUT / f'{name}.wav')
        log.append(dict(take=name, profile=prof, text=text, seed=s, whisper_raw=hyp, match=round(mt, 3), whisper_final=hyp2, match_final=round(match(text, hyp2), 3),
                        **({'rise_semitones': round(ri, 1)} if q else {}), **info))
        print('   ->', info, '|', hyp2, flush=True)
    (OUT / 'takes.json').write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding='utf-8')
    print('weak:', [x['take'] for x in log if x['match_final'] < 0.9 or ('rise_semitones' in x and x['rise_semitones'] < 1.0)])


if __name__ == '__main__':
    main()

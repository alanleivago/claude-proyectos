"""airy-scp-01 voices (VoiceStudio local API): AIRY = "Voz ashley clean limpia" 60ea9b99 (naive, flirty, quick),
GUARD = "Guardia scp" 8bd4e6c7 (tired, deadpan, but never slow). Lines: the table in GUION.md (row 32 has no line).
Per line: generate seeds (steps=32, wav, raw, no "!"), Whisper-check, questions must RISE (Praat f0: last voiced 30 % vs the
30 % before, in semitones), pick the best take -> voz/raw/<id>.wav. If no seed passes (match >= 0.95 and, for questions,
rise >= 1.0 st; match >= 0.95) it keeps going with more seeds (retake). Clean chain -> voz/<id>.wav: spectral-gate denoise only when the
real pauses between words sit above -55 dBFS AND are noise-like (flatness > 0.1), HPF (Airy 150 Hz, Guard 90 Hz), compressor 2.5:1, -14 LUFS, limiter -1.5 dBFS.
Word timings (faster-whisper, take-relative) go into voz/takes.json for the film timeline.
usage: .venv/bin/python pieces/airy-scp-01/tools/voice_final.py [seeds=1,2,3] [--reuse] [--only=07,11]
"""
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
from scipy.signal import butter, fftconvolve, lfilter, resample_poly

PIECE = Path(__file__).resolve().parents[1]
OUT = PIECE / 'voz'; RAW = OUT / 'raw'
AIRY, GUARD = '60ea9b99', '8bd4e6c7'
SPK = {'AIRY': AIRY, 'GUARD': GUARD}; KEY = {AIRY: 'airy', GUARD: 'guard'}
HPF = {AIRY: 150, GUARD: 90}
SPEED = {AIRY: 1.2, GUARD: 0.95}            # v1 at 1.05 / 1.0 ran 69.1 s (3.1 w/s); round 2: guard 1.18 sounded robotic
# round 2 guard recipe (tools/guard_explore.py, voz/guard_explore/results.json): a clean 14.4 s window of the same clone's
# reference (the sarcastic SCP-294 dialogue, no "Mmm / Oop" fillers) sent as ref_audio instead of the profile, the API's
# output denoise OFF, class_temperature 1.0 (livelier prosody), speed 0.95 (that ref speaks ~25 % faster), expressive text.
GUARD_REF = OUT / 'guard_ref' / 'ref.wav'
RECIPE = {GUARD: dict(denoise='false', class_temperature=1.0)}
SAY = {   # guard TTS text: the script's words, punctuation / [sigh] for the emotion (Whisper is still checked against the script)
    '02': 'Step away from the statue... Slowly.',
    '04': "He's the strong, silent... snap-your-neck type.",
    '06': "[sigh] That's S.C.P. one seventy-three.",
    '08': "It moves... when nobody's looking at it.",
    '10': "One blink... That's all he needs. To cross this room, and break your neck.",
    '12': 'Which part of her?',
    '14': '[sigh] That... is literally the problem.',
    '15': '[sigh] And every week, somebody mops his cell. Nobody knows what that red stuff is.',
    '18': 'Then why are you holding... eye drops?',
    '20': 'Wait, wait, wait. You put those in. In here.',
    '22': '...Which one?',
    '24': 'Protocol is three people in here. You blink... you say it out loud.',
    '26': "Don't.",
    '28': "It's a no.",
    '30': "You can't even see my eyes.",
    '33': '...Neither of us is looking at him... are we?',
}
SPEED_LINE = {}                              # per-line overrides, e.g. {'10': 1.08}
EXTRA = list(range(4, 13))                   # retake seeds when the first ones fail


def tts_text(s):
    s = s.replace('!', '.').replace('SCP-173', 'S.C.P. one seventy-three').replace('not-in-front-of-him', 'not in front of him')
    return re.sub(r'^\.\.\.\s*', '', s).strip()


def read_lines():
    out = []
    for row in (PIECE / 'GUION.md').read_text(encoding='utf-8').splitlines():
        c = [x.strip() for x in row.split('|')]
        if len(c) > 4 and c[1].isdigit() and c[2] in SPK:
            out.append((f'{int(c[1]):02d}', SPK[c[2]], c[3], tts_text(c[3])))
    return out


LINES = read_lines()
NUM = {'kinda': 'kind of', 'aww': 'aw', '1': 'one', '2': 'two', '3': 'three', '173': 'one seventy three', 'scp': 's c p'}
norm = lambda s: ' '.join(NUM.get(w, w) for w in re.sub(r'[^a-z0-9 ]', ' ', s.lower().replace('-', ' ').replace('s.c.p.', 'scp')).split()).split()


def load(fn):
    a, sr = sf.read(str(fn), dtype='float32', always_2d=True); return a.mean(1), sr


def whisper(m, fn, words=False):
    a, sr = load(fn); a16 = resample_poly(a, 16000, sr).astype(np.float32) if sr != 16000 else a
    segs = list(m.transcribe(a16, language='en', beam_size=5, initial_prompt='Short line of dialogue.', word_timestamps=words)[0])
    txt = ' '.join(x.text.strip() for x in segs)
    if not words: return txt
    return txt, [[w.word.strip(), round(w.start, 3), round(w.end, 3)] for x in segs for w in x.words]


def match(text, hyp):
    return difflib.SequenceMatcher(None, ' '.join(norm(text)), ' '.join(norm(hyp))).ratio()


def rise(fn):
    """semitone change of f0: last 30 % of the voiced frames vs the 30 % before them (> 0 = rising)"""
    snd = parselmouth.Sound(str(fn)); p = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=600)
    f = p.selected_array['frequency']; f = f[f > 0]
    if len(f) < 10: return 0.0
    n = len(f); a = np.median(f[int(n * 0.4):int(n * 0.7)]); b = np.median(f[int(n * 0.7):])
    return float(12 * np.log2(b / a))


def rise_end(fn):
    """(logged on the raw take, before the release tail, whose decay reads as a falling creak)
    semitone change inside the LAST voiced run (the final word): its last third vs its first third, octave-error / creak
    frames (< 0.6 x the run's median) dropped. Short questions ("Which one?") rise inside the last word, which rise() misses."""
    snd = parselmouth.Sound(str(fn)); p = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=600)
    f = p.selected_array['frequency']; v = np.nonzero(f > 0)[0]
    if len(v) < 6: return 0.0
    k = len(v) - 1
    while k > 0 and v[k] - v[k - 1] <= 5: k -= 1
    r = f[v[k]:v[-1] + 1]; r = r[r > 0]; r = r[r > 0.6 * np.median(r)]
    if len(r) < 6: return 0.0
    n = len(r); return float(12 * np.log2(np.median(r[-max(2, n // 3):]) / np.median(r[:max(2, n // 3)])))


def expressiveness(fn):
    """F0 std and F0 range (p5-p95) in semitones over voiced frames (octave jumps > 9 st dropped) + energy std (dB) on them"""
    a, sr = load(fn); snd = parselmouth.Sound(a, sr)
    p = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=500); f = p.selected_array['frequency']; v = f > 0
    if v.sum() < 10: return dict(f0_std=0.0, f0_range=0.0, en_std=0.0, f0_med=0)
    st = 12 * np.log2(f[v] / np.median(f[v])); keep = np.abs(st) < 9; st = st[keep]
    it = snd.to_intensity(time_step=0.01); db = np.array([it.get_value(t) for t in p.xs()[v]])[keep]; db = db[np.isfinite(db)]
    return dict(f0_std=round(float(st.std()), 2), f0_range=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2), en_std=round(float(db.std()), 2), f0_med=int(np.median(f[v])))


def noise_floor(fn):
    a, sr = load(fn); w = int(sr * 0.02); e = np.array([np.sqrt(np.mean(a[i:i + w] ** 2) + 1e-12) for i in range(0, len(a) - w, w)])
    return float(20 * np.log10(np.percentile(e, 10)))


def pause_noise(fn):
    """noise in the real pauses between words: 20 ms frames inside the speech span that sit >= 30 dB under the peak for
    >= 100 ms. Returns (median level dBFS, spectral flatness) of the quietest such pause, or (None, 0) when the line has no
    pause (then there is no noise between words to remove: its quiet frames are consonants)."""
    a, sr = load(fn); w = int(sr * 0.02); fr = [a[i:i + w] for i in range(0, len(a) - w, w)]
    d = 20 * np.log10(np.array([np.sqrt(np.mean(x ** 2)) + 1e-9 for x in fr])); sp = np.nonzero(d > d.max() - 30)[0]
    q = d[sp[0]:sp[-1] + 1] < d.max() - 30; runs, k = [], 0
    while k < len(q):
        if q[k]:
            j = k
            while j < len(q) and q[j]: j += 1
            if j - k >= 5: runs.append((sp[0] + k, sp[0] + j))
            k = j
        else: k += 1
    if not runs: return None, 0.0
    r0, r1 = min(runs, key=lambda r: np.median(d[r[0]:r[1]])); x = np.concatenate(fr[r0:r1])
    S = np.abs(np.fft.rfft(x * np.hanning(len(x)))) + 1e-9
    return float(np.median(d[r0:r1])), float(np.exp(np.mean(np.log(S))) / np.mean(S))


def ff(args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True, env={**os.environ}, timeout=120)


def chain(src, dst, prof):
    rt = Path(tempfile.mkdtemp()) / 'r.wav'; rel = release_tail(src, rt); src = rt
    nf = noise_floor(src); pl, pf = pause_noise(src); den = pl is not None and pl > -55 and pf > 0.1   # only real hiss between words, not a dense line's quiet voiced frames
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
    return dict(release_fade_at=rel, noise_floor_dbfs=round(float(nf), 1), pause_dbfs=None if pl is None else round(pl, 1), pause_flatness=round(pf, 3), denoised=bool(den), lufs=round(float(pyln.Meter(sr).integrated_loudness(b)), 1), peak_dbfs=round(float(20 * np.log10(np.abs(b).max())), 1), noise_after=round(float(noise_floor(dst)), 1))


def trim_lead(m, fn, text):
    """the guard clone often adds a junk syllable before the line ("Minus, it moves..."): when Whisper's first word is not the
    script's first word but the 2nd/3rd is, cut in the quietest 10 ms between them (8 ms fade-in). Returns the cut time or None."""
    _, words = whisper(m, fn, words=True); first = norm(text)[0]
    if not words or (norm(words[0][0]) or [''])[0] == first: return None
    for k in range(1, min(3, len(words))):
        if (norm(words[k][0]) or [''])[0] == first:
            a, sr = load(fn); w = int(sr * 0.01); i0 = int(max(0, words[k - 1][2] - 0.08) * sr); i1 = int((words[k][1] + 0.04) * sr)
            e = [np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(i0, max(i0 + 1, i1 - w), w // 4)]
            c = i0 + int(np.argmin(e)) * (w // 4) + w // 2; b = a[c:].copy(); f = int(sr * 0.008); b[:f] *= np.linspace(0, 1, f)
            sf.write(str(fn), b, sr, subtype='PCM_24'); gate_lead(fn); return round(c / sr, 3)
    return None


def gate_lead(fn):
    """the junk word's tail can survive the cut (Whisper still hears it after the compressor): mute everything up to
    30 ms before the real onset (first 10 ms above max(-45 dBFS, peak - 30 dB)), 8 ms fade-in"""
    b, sr = load(fn); w = int(sr * 0.01); f = int(sr * 0.008)
    ev = 20 * np.log10(np.array([np.sqrt(np.mean(b[i:i + w] ** 2)) + 1e-9 for i in range(0, len(b) - w, w)]))
    z = max(0, int(np.argmax(ev > max(-45, ev.max() - 30))) * w - int(sr * 0.03))
    if z: b[:z] = 0; b[z:z + f] *= np.linspace(0, 1, f); sf.write(str(fn), b, sr, subtype='PCM_24')


def release_tail(src, dst):
    """OmniVoice (worst at speed >= 1.18) stops the last word short: the final syllable drops to the floor in 20-40 ms
    ("slowly" sounded cut off). Give every take a natural release the way a dialogue editor does: the last 60 ms of voice
    are convolved with a short decaying room impulse (filtered noise, ~50 ms time constant, 250 ms) and only the part after
    the voice stops is added, starting 9 dB under the final syllable, so the word rings out over ~150-200 ms in its own
    colour. Only on truncated ends (the last syllable falls to the floor in <= 40 ms); takes that decay naturally are left alone. Returns the tail info or None."""
    a, sr = load(src); w = int(sr * 0.01); d = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) + 1e-9 for i in range(0, len(a) - w, w)]))
    end = int(np.nonzero(d > max(-55, d.max() - 40))[0][-1]); e1 = (end + 1) * w; n = int(sr * 0.06)
    L = float(np.median(d[max(0, end - 12):max(1, end - 2)])); k0 = end
    while k0 > 0 and d[k0] < L - 6: k0 -= 1
    fl = np.nonzero(d[k0:] < max(-60, d.max() - 50))[0]
    if len(fl) == 0 or fl[0] > 4:   # the last syllable already takes > 40 ms to fall from 6 dB under its level to the floor
        sf.write(str(dst), a, sr, subtype='PCM_24'); return None
    seg = a[max(0, e1 - n):e1] * np.hanning(2 * n)[n:][-(e1 - max(0, e1 - n)):] ** 0.5
    rng = np.random.default_rng(7); tt = np.arange(int(sr * 0.25)) / sr
    ir = rng.standard_normal(len(tt)) * np.exp(-tt / 0.05); b_, a_ = butter(2, 4500 / (sr / 2)); ir = lfilter(b_, a_, ir)
    c = fftconvolve(seg, ir)[len(seg) - w:]   # starts 10 ms before the voice stops: fills the truncated last frame
    lvl = np.sqrt(np.mean(a[max(0, e1 - int(sr * 0.03)):e1] ** 2)) + 1e-9
    c *= lvl * 10 ** (-9 / 20) / (np.sqrt(np.mean(c[w:2 * w] ** 2)) + 1e-12)
    c[:w] *= np.linspace(0, 1, w)
    out = np.concatenate([a, np.zeros(max(0, e1 + len(c) + int(sr * 0.1) - len(a)), np.float32)])
    out = out.astype(np.float32); out[e1 - w:e1 - w + len(c)] += c.astype(np.float32)
    sf.write(str(dst), out, sr, subtype='PCM_24')
    return dict(voice_end=round(e1 / sr, 3), tail_start_dbfs=round(float(20 * np.log10(lvl) - 9), 1))


def gen(prof, text, seed, speed, fn, guidance=2.0):
    data = dict(text=text, language='en', num_step=32, seed=seed, effect_preset='raw', wav_bits='24', speed=speed, guidance_scale=guidance, **RECIPE.get(prof, {}))
    files = None
    if prof == GUARD: files = {'ref_audio': ('ref.wav', GUARD_REF.read_bytes(), 'audio/wav')}   # no ref_text: the server transcribes it
    else: data['profile_id'] = prof
    r = requests.post('http://127.0.0.1:3900/generate', data=data, files=files, timeout=900)
    r.raise_for_status(); fn.write_bytes(r.content)


MED = None


def main():
    pos = [x for x in sys.argv[1:] if not x.startswith('--')]; reuse = '--reuse' in sys.argv
    only = next((x.split('=')[1].split(',') for x in sys.argv if x.startswith('--only=')), None)
    seeds = [int(s) for s in (pos[0] if pos else '1,2,3').split(',')]
    RAW.mkdir(parents=True, exist_ok=True)
    m = WhisperModel('small', device='cpu', compute_type='int8')
    prev = {x['take']: x for x in json.loads((OUT / 'takes.json').read_text())} if (OUT / 'takes.json').exists() else {}
    log = []
    for name, prof, line, text in LINES:
        if only and name not in only:
            if name in prev: log.append(prev[name])
            continue
        assert '!' not in text
        q = text.endswith('?'); best = None; tried = []; speed = SPEED_LINE.get(name, SPEED[prof])
        if reuse and (RAW / f'{name}.wav').exists():
            fn = RAW / f'{name}.wav'   # raw takes were trimmed + gated when generated: never re-trim or re-gate (it ate real first words)
            hyp = whisper(m, fn); best = (0, prev.get(name, {}).get('seed', -1), hyp, match(text, hyp), max(rise(fn), rise_end(fn)) if q else 0.0, fn); say = prev.get(name, {}).get('tts_text', text)
        reused = best is not None
        if not reused: say = SAY.get(name, text) if prof == GUARD else text
        for s in ([] if best else seeds + EXTRA):
            if s in EXTRA and best and best[3] >= 0.97 and (not q or best[4] >= 1.0): break   # first seeds already gave a passing take
            fn = RAW / f'{name}_s{s}.wav'; gen(prof, say, s, speed, fn); cut = trim_lead(m, fn, text)
            hyp = whisper(m, fn); mt = match(text, hyp); ri = max(rise(fn), rise_end(fn)) if q else 0.0
            ex = expressiveness(fn); ok = mt >= 0.97 and (not q or ri >= 1.0)
            score = 10 * ok + mt + (min(ri, 4) / 8 if q else 0) + (ex['f0_std'] / 4 if prof == GUARD else 0)   # guard: the liveliest passing seed
            tried.append(dict(seed=s, match=round(mt, 3), **({'rise': round(ri, 1)} if q else {}), **({'trimmed_lead_s': cut} if cut else {}), **ex, whisper=hyp))
            print(f'{name} seed {s} match {mt:.3f}' + (f' rise {ri:+.1f} st' if q else '') + f" f0std {ex['f0_std']}" + (f' trimmed {cut}s' if cut else '') + f' | {hyp}', flush=True)
            if best is None or score > best[0]: best = (score, s, hyp, mt, ri, fn)
            if prof != GUARD and mt >= 0.97 and (not q or ri >= 1.5): break
        _, s, hyp, mt, ri, fn = best
        keep = RAW / f'{name}.wav'
        if fn != keep: keep.write_bytes(fn.read_bytes())
        for f in RAW.glob(f'{name}_s*.wav'): f.unlink()
        info = chain(keep, OUT / f'{name}.wav', prof)
        hyp2, words = whisper(m, OUT / f'{name}.wav', words=True); hyp_med = None
        if match(text, hyp2) < 0.97:   # Whisper small is flaky on short words ("A man" -> "I'm Han"): second opinion with medium
            global MED
            if MED is None: MED = WhisperModel('medium', device='cpu', compute_type='int8')
            hyp_med = whisper(MED, OUT / f'{name}.wav')
        rt = prev.get(name, {}).get('retake') if reused else None
        log.append(dict(take=name, spk=KEY[prof], profile=prof, line=line, text=text, **({'tts_text': say} if say != text else {}), **({'recipe': 'clean-ref window, denoise off, class_temperature 1.0'} if prof == GUARD else {}), speed=speed, seed=s, tried=tried or (prev.get(name, {}).get('tried', []) if reused else []),
                        whisper_raw=hyp, match=round(mt, 3), whisper_final=hyp2, match_final=round(match(text, hyp2), 3), **({'whisper_final_medium': hyp_med, 'match_final_medium': round(match(text, hyp_med), 3)} if hyp_med else {}),
                        **({'rise_semitones': round(ri, 1), 'rise_end_semitones': round(rise_end(keep), 1)} if q else {}), **({'retake': rt} if rt else {}), **info, expressiveness=expressiveness(OUT / f'{name}.wav'), words=words))
        print('   ->', {k: v for k, v in info.items()}, '|', hyp2, flush=True)
        (OUT / 'takes.json').write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding='utf-8')
    log.sort(key=lambda x: x['take'])
    (OUT / 'takes.json').write_text(json.dumps(log, indent=1, ensure_ascii=False), encoding='utf-8')
    print('weak:', [x['take'] for x in log if max(x['match_final'], x.get('match_final_medium', 0)) < 0.95 or ('rise_semitones' in x and x['rise_semitones'] < 1.0)])


if __name__ == '__main__':
    main()

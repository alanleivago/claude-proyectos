"""airy-scp-01, round 2: the guard sounded robotic. Explore VoiceStudio (OmniVoice) recipes on test lines and MEASURE
expressiveness: F0 std and F0 range (p5-p95) in semitones over voiced frames (octave errors dropped), energy std (dB) over
voiced frames, speech length, Whisper match. Baseline = the current finals voz/<id>.wav.
Recipes: speed, guidance, the API's output denoise (on by default), a cleaner reference window of the same clone
(voz/guard_ref/ref.wav: the sarcastic SCP-294 dialogue, without the "Mmm / Oop" fillers that leak in as junk syllables),
and expressive TTS text (ellipses, commas, the engine's [sigh] tag).
writes voz/guard_explore/<id>_<recipe>_s<seed>.wav + voz/guard_explore/results.json
usage: .venv/bin/python pieces/airy-scp-01/tools/guard_explore.py [ids=10,15,24] [seeds=1,2] [recipes=all]"""
import json
import sys
from pathlib import Path

import numpy as np
import parselmouth
import requests
from faster_whisper import WhisperModel

sys.path.insert(0, str(Path(__file__).resolve().parent))
from voice_final import GUARD, LINES, OUT, load, match, trim_lead, whisper

REF = OUT / 'guard_ref' / 'ref.wav'
REF_TEXT = ("You know, you don't have to check what drinks it has. It has every drink. But does it have the best soda in the world? "
            "Yes, it has Barks Red Cream Soda. This is SCP-294 we're talking about. It'll give you any liquid you ask for. "
            "How could it possibly fit every drink inside of it?")
EXPR = {   # same words, expressive punctuation / tags
    '10': "One blink... That's all he needs. To cross this room, and break your neck.",
    '15': "[sigh] And every week, somebody mops his cell. Nobody knows what that red stuff is.",
    '24': "Protocol is three people in here. You blink... you say it out loud.",
}
RECIPES = {   # name: (speed, guidance, denoise, custom ref, expressive text)
    'p118': (1.18, 2.0, True, False, False),   # = the current takes' recipe (fresh seeds)
    'p108': (1.08, 2.0, True, False, False),
    'p108g15': (1.08, 1.5, True, False, False),
    'p108raw': (1.08, 2.0, False, False, False),
    'r108raw': (1.08, 2.0, False, True, False),
    'r108rawX': (1.08, 2.0, False, True, True),
    'p108rawX': (1.08, 2.0, False, False, True),
    'r108g15rawX': (1.08, 1.5, False, True, True),
    # batch 2: the clean ref speaks ~25 % faster and lower, so slow it down; sampling temperature for livelier prosody
    'r095raw': (0.95, 2.0, False, True, False),
    'r095rawX': (0.95, 2.0, False, True, True),
    'r100rawX': (1.0, 2.0, False, True, True),
    'r095rawXct': (0.95, 2.0, False, True, True, {'class_temperature': 1.0}),
    'p108rawXct': (1.08, 2.0, False, False, True, {'class_temperature': 1.0}),
    'p100rawX': (1.0, 2.0, False, False, True),
}


def gen(text, seed, speed, g, den, ref, fn, extra=None):
    data = dict(**(extra or {}), text=text, language='en', num_step=32, seed=seed, effect_preset='raw', wav_bits='24', speed=speed, guidance_scale=g, denoise=str(den).lower())
    files = None
    if ref: files = {'ref_audio': ('ref.wav', REF.read_bytes(), 'audio/wav')}   # no ref_text: the server transcribes it (a typed ref_text made it read the ref back)
    else: data['profile_id'] = GUARD
    r = requests.post('http://127.0.0.1:3900/generate', data=data, files=files, timeout=900); r.raise_for_status(); fn.write_bytes(r.content)


def expressiveness(fn):
    a, sr = load(fn); snd = parselmouth.Sound(a, sr)
    p = snd.to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=500); f = p.selected_array['frequency']; v = f > 0
    if v.sum() < 10: return dict(f0_std=0, f0_range=0, en_std=0, f0_med=0)
    st = 12 * np.log2(f[v] / np.median(f[v])); keep = np.abs(st) < 9   # drop octave errors / creak jumps
    st = st[keep]
    it = snd.to_intensity(time_step=0.01); db = np.array([it.get_value(t) for t in p.xs()[v]])[keep]; db = db[np.isfinite(db)]
    return dict(f0_std=round(float(st.std()), 2), f0_range=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2),
                en_std=round(float(db.std()), 2), f0_med=int(np.median(f[v])))


def speech_len(fn):
    a, sr = load(fn); w = int(sr * 0.02); e = 20 * np.log10(np.array([np.sqrt(np.mean(a[i:i + w] ** 2)) + 1e-9 for i in range(0, len(a) - w, w // 2)]))
    i = np.where(e > max(-45, e.max() - 30))[0]; return round((i[-1] - i[0]) * w / 2 / sr, 2)


def main():
    pos = [x for x in sys.argv[1:]]
    ids = (pos[0] if pos else '10,15,24').split(','); seeds = [int(s) for s in (pos[1] if len(pos) > 1 else '1,2').split(',')]
    rec = (pos[2].split(',') if len(pos) > 2 else list(RECIPES))
    d = OUT / 'guard_explore'; d.mkdir(exist_ok=True); m = WhisperModel('small', device='cpu', compute_type='int8')
    res = json.loads((d / 'results.json').read_text()) if (d / 'results.json').exists() else []
    done = {(r['id'], r['recipe'], r['seed']) for r in res}
    T = {n: t for n, _, _, t in LINES}
    for i in ids:
        if (i, 'current', 0) not in done:
            fn = OUT / f'{i}.wav'; res.append(dict(id=i, recipe='current', seed=0, len=speech_len(fn), match=round(match(T[i], whisper(m, fn)), 3), **expressiveness(fn)))
        for r in rec:
            sp, g, den, ref, x, *ex = RECIPES[r]; text = EXPR[i] if x and i in EXPR else T[i]
            for s in seeds:
                if (i, r, s) in done: continue
                fn = d / f'{i}_{r}_s{s}.wav'; gen(text, s, sp, g, den, ref, fn, ex[0] if ex else None); cut = trim_lead(m, fn, T[i])
                hyp = whisper(m, fn); row = dict(id=i, recipe=r, seed=s, text=text, trimmed=cut, len=speech_len(fn), match=round(match(T[i], hyp), 3), whisper=hyp, **expressiveness(fn))
                res.append(row); print(json.dumps(row), flush=True)
                (d / 'results.json').write_text(json.dumps(res, indent=1))
    (d / 'results.json').write_text(json.dumps(res, indent=1))


if __name__ == '__main__':
    main()

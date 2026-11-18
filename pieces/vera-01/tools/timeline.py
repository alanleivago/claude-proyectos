"""upnext-01 film timeline from the voice takes (voz/*.wav) -> engine/film_timeline.json + audio/voice.wav (48 kHz).
- Lines are placed at the ref's beat times (Dd2YemoPJ9-), pushed later only when the previous line needs the room.
- Takes with a beat inside ("I guess... | I'm", "Tomorrow... | your feet", "Eh. | The proper term") are CUT in their
  quietest 20 ms between the two words (never inside a word) and the pause is stretched like the ref's.
- Subtitle cards: one per phrase (UpNext style), start 0.1 s before the voice, typewriter done at 85 % of the spoken part,
  held 0.5 s after (or until the next card). Mouth levels per speaker at 30 fps from the voice envelope.
usage: python tools/timeline.py"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

PIECE = Path(__file__).resolve().parents[1]
VOZ = PIECE / 'voz2'; ENG = PIECE / 'engine'; AUD = PIECE / 'audio'
FPS, SR = 30, 48000
W = json.loads((PIECE / 'work' / 'takes_words.json').read_text(encoding='utf-8'))

# (take, speaker, ref start of the voice, [card texts], split: (search window in the take, extra pause s) or None)
LINES = [
    ('01_ashley', 'G', 0.50, ["From tomorrow on, I'm waking at four."], None),
    ('02_pip', 'P', 4.00, ['Four. Now.'], None),
    ('03a_ashley', 'G', 5.90, ['…Is this counting?'], None),
    ('03b_pip', 'P', 7.70, ['Nope.'], None),
    ('04_ashley', 'G', 10.70, ['…Tomorrow, then.'], None),
    ('05_ashley', 'G', 13.90, ['Some guy jogged six miles before dawn.'], None),
    ('06_ashley', 'G', 19.00, ['I guess…', "I'm just not hungry enough."], ((1.0, 1.55), 0.7)),
    ('07_pip', 'P', 23.00, ['Time to cheat.'], None),
    ('09a_ashley', 'G', 26.60, ['…Need help, Pip?'], None),
    ('09b_pip', 'P', 28.70, ['Nah.'], None),
    ('10a_pip', 'P', 31.90, ['Tomorrow…', 'your feet land on this first.'], ((1.2, 1.9), 0.8)),
    ('10b_pip', 'P', 37.00, ['And that bunks over there.'], None),
    ('10c_ashley', 'G', 39.90, ["That's the trick?"], None),
    ('10d_pip', 'P', 42.00, ['Eh.', 'The proper term is nudge.'], ((0.8, 1.1), 0.8)),
    ('19a_ashley', 'G', 55.60, ['…Is this counting?'], None),
    ('19b_pip', 'P', 58.00, ['Yep. That counts.'], None),
    ('22_pip', 'P', 64.40, ['Champions are awake by four.'], None),
    ('23a_pip', 'P', 68.30, ['Scratch that.'], None),
    ('23b_pip', 'P', 70.90, ['Just beating yesterday is plenty.'], None),
]
# shots (cuts on silences; the ref's order and framing): id, t0
SHOTS = [('01', 0.0), ('02', 3.5), ('03', 5.7), ('04', 9.3), ('05', 13.4), ('06', 17.6), ('07', 22.75), ('08', 24.75), ('09', 25.8),
         ('10a', 30.3), ('10b', 36.78), ('11', 45.8), ('12', 47.6), ('13', 48.6), ('14', 49.2), ('15', 50.5), ('16', 51.4), ('17', 52.4),
         ('18', 53.8), ('19', 54.7), ('20', 61.0), ('21', 62.1), ('22', 64.0), ('23', 67.35)]
TAIL = 1.2


def load(take):
    a, sr = sf.read(str(VOZ / f'{take}.wav'), dtype='float32', always_2d=True); a = a.mean(1)
    return (resample_poly(a, SR, sr).astype(np.float32) if sr != SR else a)


def quietest(a, t0, t1):
    w = int(SR * 0.02); i0, i1 = int(t0 * SR), int(t1 * SR)
    e = [np.sqrt(np.mean(a[i:i + w] ** 2)) for i in range(i0, i1 - w, w // 4)]
    return (i0 + int(np.argmin(e)) * (w // 4) + w // 2) / SR


def main():
    AUD.mkdir(exist_ok=True)
    placed, cards, t_prev_end = [], [], 0.0
    for take, spk, ref_on, texts, split in LINES:
        a = load(take); info = W[take]; on, off = info['on'], info['off']
        if split:
            cut = quietest(a, *split[0]); segs = [(0.0, cut), (cut, len(a) / SR)]; gaps = [0.0, split[1]]
        else:
            segs = [(0.0, len(a) / SR)]; gaps = [0.0]
        start = max(ref_on - on, t_prev_end + 0.35 - on)              # file start so that the voice begins at ref_on
        dst, t = [], start
        for (s0, s1), g in zip(segs, gaps):
            t += g; dst.append((s0, s1, t)); t += s1 - s0
        # voice on/off of each segment in film time (from the envelope of that segment)
        w = int(SR * 0.01); seg_spans = []
        for s0, s1, d in dst:
            x = a[int(s0 * SR):int(s1 * SR)]; e = np.array([np.sqrt(np.mean(x[i:i + w] ** 2)) for i in range(0, len(x) - w, w)])
            thr = max(e.max() * 0.06, 1e-4); act = np.nonzero(e > thr)[0]
            seg_spans.append((d + act[0] * 0.01, d + (act[-1] + 1) * 0.01))
        t_prev_end = seg_spans[-1][1]
        placed.append(dict(take=take, spk=spk, segs=dst, spans=seg_spans))
        for txt, (v0, v1) in zip(texts, seg_spans):
            cards.append(dict(text=txt, spk=spk, start=round(v0 - 0.1, 3), typed=round(v0 + 0.85 * (v1 - v0), 3), end=round(v1 + 0.5, 3), v0=round(v0, 3), v1=round(v1, 3)))
    for i in range(len(cards) - 1):                                    # dry cut between cards
        cards[i]['end'] = round(min(cards[i]['end'], cards[i + 1]['start']), 3)
    dur = round(max(p['spans'][-1][1] for p in placed) + TAIL, 2)
    # voice track + mouth levels
    N = int(dur * SR) + SR; voice = np.zeros(N, np.float32); spk_tr = {'G': np.zeros(N, np.float32), 'P': np.zeros(N, np.float32)}
    for p in placed:
        a = load(p['take'])
        for s0, s1, d in p['segs']:
            x = a[int(s0 * SR):int(s1 * SR)].copy(); f = int(0.01 * SR); x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f)
            i = int(d * SR); voice[i:i + len(x)] += x; spk_tr[p['spk']][i:i + len(x)] += x
    voice = voice[:int(dur * SR)]
    sf.write(str(AUD / 'voice.wav'), voice, SR, subtype='PCM_24')
    mouth = {}
    for k, x in spk_tr.items():
        n = int(dur * FPS); e = np.array([np.sqrt(np.mean(x[int(i / FPS * SR):int((i + 1) / FPS * SR)] ** 2)) for i in range(n)])
        ref = np.percentile(e[e > 1e-4], 90) if (e > 1e-4).any() else 1
        lv = np.where(e > ref * 0.45, 2, np.where(e > ref * 0.12, 1, 0))
        mouth[k] = ''.join(str(v) for v in lv)
    shots = [dict(id=s, t0=t0, t1=(SHOTS[i + 1][1] if i + 1 < len(SHOTS) else dur)) for i, (s, t0) in enumerate(SHOTS)]
    tl = dict(dur=dur, fps=FPS, shots=shots, lines=placed, cards=cards, mouth=mouth)
    (ENG / 'film_timeline.json').write_text(json.dumps(tl, indent=1, ensure_ascii=False), encoding='utf-8')
    for p in placed: print(f"{p['take']:11s} voice " + ', '.join(f'{a:.2f}-{b:.2f}' for a, b in p['spans']))
    print('duration', dur, 's;', len(cards), 'cards')
    # sanity: every cut on silence
    for s in shots[1:]:
        for p in placed:
            for a, b in p['spans']:
                if a < s['t0'] < b: print('WARNING cut', s['id'], s['t0'], 'inside', p['take'], a, b)


if __name__ == '__main__':
    main()
